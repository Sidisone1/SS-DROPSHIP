# API métier centrale

NestJS + PostgreSQL (D-024). Socle S0 livré : `/v1/sante`, `/v1/pays`, journal d'audit, filtre d'erreurs (voir CHANGELOG du 23/11/2026).

## Livré en phase 4 (23/11/2026)
- `prisma/schema.prisma` : modèle de données v1 (42 tables), validé avec Prisma 7.10.1.
- `prisma/migrations/20261123000000_init` : création des tables (générée par Prisma).
- `prisma/migrations/20261123000100_protections` : ledger et journal d'audit en écriture seule, transactions équilibrées,
  solde client jamais négatif, options V2 verrouillées, pays de lancement (Mali ouvert, autres fermés).
- `prisma/protections.test.mjs` : 10 tests de ces protections sur un vrai moteur PostgreSQL embarqué (PGlite).
- Contrat d'API : `docs/architecture/openapi.yaml` (validé par Redocly). Décisions : `docs/architecture/ADR-00*.md`.

## Commandes
```bash
cd services/api
pnpm install                     # depuis la racine du dépôt
npx prisma validate              # nécessite DATABASE_URL (voir .env.example)
node --test prisma/protections.test.mjs
```

## Sprint S1 — Comptes et authentification (implémentation en cours)

Routes NestJS disponibles dans le code (préfixe `/v1`) :

| Route | Action | Précaution |
|---|---|---|
| `POST /auth/inscription` | Création utilisateur PostgreSQL + code de parrain + relation filleul (transaction Prisma) | État `a_verifier`, jamais actif avant OTP |
| `POST /auth/verification` | Code SMS/e-mail à six chiffres | Expiration 10 min, maximum 5 tentatives |
| `POST /auth/renvoyer-code` | Nouveau code | Délai 60 s ; l'ancien est invalidé |
| `POST /auth/connexion` | Mot de passe sécurisé et session | Seulement compte actif et non administrateur |
| `GET /auth/moi` | Profil depuis jeton Bearer opaque | Requête authentifiée |
| `POST /auth/deconnexion` | Révocation de session | Jeton révoqué en base |
| `GET /auth/parrainage` | Code et nombre de filleuls du compte | Ne révèle pas leurs identités |

### Configuration requise avant tout essai réel

`SS_OTP_PEPPER` : secret aléatoire privé de 32 octets minimum pour l'empreinte HMAC des codes.
`SS_SMS_GATEWAY_URL` et `SS_SMS_GATEWAY_TOKEN` : passerelle HTTPS pour les SMS.
`SS_EMAIL_GATEWAY_URL` et `SS_EMAIL_GATEWAY_TOKEN` : passerelle HTTPS pour les e-mails.

Contrat de chaque passerelle : `POST` HTTPS avec `Authorization: Bearer <token>` et JSON
`{ "canal": "sms|email", "destinataire": "...", "code": "123456", "dureeMinutes": 10 }`.
Elle doit retourner un HTTP 2xx seulement si le fournisseur prend le message en charge.
Un code n'est **jamais** renvoyé au client HTTP. Si une passerelle n'est pas configurée, l'inscription via
le canal correspondant répond 503. Les deux canaux peuvent être configurés indépendamment.

### Exemples

```json
{
  "nom": "Client Exemple",
  "pays": "ML",
  "telephone": "76123456",
  "email": null,
  "motDePasse": "UnMotDePasseFort",
  "motDePasseConfirmation": "UnMotDePasseFort",
  "codeParrainage": null,
  "cguAcceptees": true
}
```

Pour vérifier : `POST /v1/auth/verification` avec `{ "utilisateurId": "<id>", "code": "<6 chiffres>" }`.
Pour ouvrir une session : `POST /v1/auth/connexion` avec `{ "identifiant": "<email ou téléphone>", "motDePasse": "<secret>" }`.
Réponse temporaire S1 : `{ "jetonSession": "<jeton opaque>", "expireLe": "<ISO8601>", "type": "Bearer" }`.
Envoyer `Authorization: Bearer <jetonSession>` aux routes protégées. Le jeton n'est conservé en base que sous SHA-256.

### Limites avant production

- **Non déployé ni vérifié de bout en bout avec de vrais prestataires** dans cette intervention ; tests de code ajoutés mais exécution CI non confirmée.
- L'envoi est paramétrable : il n'existe aucun contrat SMS/e-mail déjà activé.
- Aucun accès administrateur n'est autorisé sans MFA ; celui-ci est à implémenter.
- Protection anti-brute-force globale sur la connexion et anti-spam distribué : à compléter avant ouverture publique.
- Les clients doivent conserver leur jeton dans un stockage sûr et ne jamais le mettre dans une URL.
- Le schéma OpenAPI général antérieur utilise un couple access/refresh : **la route S1 délivre actuellement un jeton de session opaque**, contrat à harmoniser avant consommation par les applications.
- Récompense parrain : relation créée à l'inscription, taux de 5 % et calcul déjà dans `packages/types`. **Pas de versement automatique ni de crédit wallet avant la livraison, la confirmation du paiement et l'intégration du ledger**.
- Les sessions actives ne sont pas encore limitées par appareil ; gestion des appareils à prévoir.

### Vérifications à lancer

```bash
pnpm install
pnpm --filter @ss-dropship/api prisma:generate
pnpm --filter @ss-dropship/api typecheck
pnpm --filter @ss-dropship/api test
pnpm turbo run lint typecheck test build
```

**Sécurité S1 :** actuellement l'inscription accepte soit un numéro de téléphone, soit une adresse e-mail, mais pas les deux en même temps. Un second contact devra être ajouté puis vérifié indépendamment lors d'un sprint ultérieur. Les routes de création de compte ne sont pas encore raccordées au formulaire web public.
