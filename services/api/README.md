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

## Sprint S1 — Comptes et authentification (terminé, 24/11/2026)

Deux versions du sprint S1 ont été réalisées en parallèle puis réunies (décision D-027) : la base est la version
complète (double authentification, site et back-office branchés, testée dans un navigateur), enrichie des apports de
l'autre version : passerelle HTTPS réelle pour les codes, un seul contact à l'inscription, récompenses préparées à la
livraison, validation partagée de l'inscription (`packages/types/src/inscription.ts`).

### Routes
- `/v1/auth/*` : inscription, vérification, renvoi du code, connexion, rafraîchissement, déconnexion, mot de passe
  oublié, réinitialisation, activation et confirmation de la double authentification.
- `/v1/moi` : profil, adresses, parrainage, export, suppression. `/v1/admin/utilisateurs` : recherche, rôles, suspension.
- Contrat complet : `docs/architecture/openapi.yaml` (le test `test/contrat.test.ts` vérifie qu'aucune route n'y manque).

### Configuration (voir `.env.example`)
- `APP_SECRET` (≥ 32 caractères, obligatoire et unique en production) : clés dérivées pour les jetons, les empreintes
  HMAC des codes (remplace `SS_OTP_PEPPER`) et le chiffrement des secrets de double authentification.
- `NOTIFICATIONS=sandbox_journal` : prestataire de **test**, aucun envoi réel, refusé en production.
- `NOTIFICATIONS=passerelle_https` + `SS_SMS_GATEWAY_URL` / `SS_SMS_GATEWAY_TOKEN` (et facultativement
  `SS_EMAIL_GATEWAY_URL` / `SS_EMAIL_GATEWAY_TOKEN`) : passerelles HTTPS privées vers les prestataires. Contrat :
  `POST` HTTPS, `Authorization: Bearer <jeton>`, corps `{ canal, destinataire, code, dureeMinutes }`, réponse 2xx
  seulement après acceptation du message par le prestataire. Sans passerelle SMS valide, l'API refuse de démarrer ;
  sans passerelle email, l'inscription par email répond 503 (aucun faux envoi).

### Règles appliquées
Argon2id ; codes à 6 chiffres, 10 min, 5 essais puis blocage 15 min ; un seul contact par inscription (le contact
vérifié est le seul utilisable pour se connecter) ; parrain accepté seulement si son compte est actif, sinon compte
créé sans parrain avec un avertissement ; sessions de 15 min renouvelées par rotation ; double authentification TOTP
obligatoire pour tout rôle autre que client ; récompenses de parrainage préparées « en revue » après livraison, sans
aucun crédit de wallet (`ParrainageRecompenseService`, appelé par le futur module commandes).

### Vérifications
```bash
pnpm --filter @ss-dropship/api test   # 82 tests vitest + 10 tests de base (PGlite)
```
Premier administrateur : `node dist/scripts/creer-admin.js` (`ADMIN_EMAIL`, `ADMIN_MOT_DE_PASSE`, `DATABASE_URL`).
