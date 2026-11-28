# SS DROPSHIP — Document de reprise pour toute IA ou tout développeur

**Mis à jour le 28/11/2026.** À lire en premier, avec [AGENTS.md](../AGENTS.md) (règles impératives).
Ce document dit **où en est le projet, comment le lancer, et quoi faire ensuite**.

---

## 1. Le projet en 5 lignes
SS DROPSHIP est une plateforme d'agent d'achat international : le client commande ou fait chercher un produit en Chine,
Turquie, Dubaï ou Europe ; SS DROPSHIP achète, réceptionne le carton **fermé** à l'entrepôt, l'expédie et le livre.
Lancement au **Mali** (FCFA, français, Orange Money / Moov Money), puis Côte d'Ivoire, Guinée, Ghana (D-021).
Produits : site client, application mobile, back-office, API.

## 2. Où en est-on
| Phase / sprint | État |
|---|---|
| 0 — Consolidation, maquettes, 50 visuels, icônes | Fait; écrans à valider |
| 1 — Arbitrages et backlog MVP | Fait; backlog validé D-025 |
| S0 — Socle technique | Fait sauf hébergement/observabilité (au choix du propriétaire) |
| S1 — Comptes, sessions, parrainage | Implémenté; tests historiques du dépôt |
| S2 — Catalogue | En cours sur [PR #15](https://github.com/Sidisone1/SS-DROPSHIP/pull/15), première tranche partagée/CI verte |
| Benchmark concurrents | [Comparatif et écarts produit](market-research/COMPETITORS_AND_PRODUCT_GAPS.md) ajouté le 28/11/2026 |
| S3 à S12 | À faire |

**Important :** aucune intégration externe réelle (paiement, SMS, transporteur, entrepôt partenaire) n'est confirmée. Ne jamais annoncer une disponibilité, un tarif, un délai ou une transaction réelle sans contrat et données vérifiés.

## 3. Carte du dépôt
```text
apps/web        Site client Next.js 16
apps/admin      Back-office Next.js
apps/mobile     Application Expo / React Native
services/api    API NestJS + Prisma + PostgreSQL
services/workers Tâches asynchrones, à venir
packages/types  Règles et contrats métier partagés
packages/config Pays, langues et paramètres
packages/i18n   Traductions FR / EN
packages/ui     Tokens et icônes Bogolan
docs/           Cahier des charges, décisions, backlog, architecture, benchmark
design/         Charte, maquettes, icônes et visuels
```

## 4. Lancer et vérifier
Prérequis : Node ≥ 22.18, pnpm 10.
```bash
pnpm install
pnpm lint
pnpm turbo run typecheck test
pnpm turbo run build
pnpm --filter @ss-dropship/web dev
pnpm --filter @ss-dropship/admin dev
pnpm --filter @ss-dropship/mobile start
```
La CI GitHub Actions exécute lint, typecheck, tests et build à chaque PR.

## 5. Prochaines priorités de réalisation
1. Terminer S2 : CRUD catalogue et fournisseurs côté Admin avec rôles et journal d'audit; API lecture filtrant produits publiés/fournisseurs validés; favoris persistants; fiche produit et recherche côté site; tests.
2. Continuer S3–S4 : demandes directes / recherche / négociation, devis détaillés et frais visibles.
3. S5–S6 : panier, wallet et paiements; aucun crédit sans webhook signé et aucun prestataire à annoncer avant contrat.
4. S7 : réception du carton fermé, poids/dimensions et incidents extérieurs.
5. S8 : choix d'une route de fret à partir d'une grille réelle approuvée, suivi, retrait ou livraison locale à Bamako.
6. S9 : support, retours avant expédition, réclamations et notifications.
7. Mettre ensuite en service le transfert de colis, la consolidation, les photos/vidéos produit, l'inspection, l'emballage sous vide/renforcé et assurance uniquement après arbitrage D-010/D-011 et procédures vérifiées.

## 6. Benchmark : principes à retenir
Le comparatif documenté dans `docs/market-research/COMPETITORS_AND_PRODUCT_GAPS.md` couvre Sugargoo, CSSBuy, HooBuy, Superbuy, OrientDig, AllChinaBuy, ainsi que des acteurs émergents à revalider. Les pratiques utiles sont : lien/recherche produit, agent de sourcing, estimation d'expédition, coûts séparés, statuts compréhensibles, choix de route, historique des frais, réclamations et retours. Les promesses de stockage gratuit, QC, assurance, moyens de paiement, couverture pays et délais sont propres à chaque opérateur; elles ne sont pas copiées sans partenaire SS DROPSHIP.

## 7. Règles techniques
- Les règles métier sont dans `packages/types`; les applications et l'API les réutilisent.
- Argent en entiers, devise explicite, pas de nombres flottants; aucun crédit wallet sans webhook signé.
- Toute modification de schéma reçoit une nouvelle migration; ne jamais modifier une migration existante.
- Route API et schémas restent alignés sur `docs/architecture/openapi.yaml`.
- Styles basés sur les tokens; couleurs de marque bleu/rouge/blanc/bleu nuit, jamais jaune.
- Textes via i18n; clés d'abord dans `packages/i18n/src/fr.ts`.
- Chaque changement est testé et documenté dans `CHANGELOG.md`.
- Garder le carton fermé au MVP selon D-010; options internes avancées désactivées jusqu'à nouvel arbitrage.

## 8. Décisions et sujets ouverts
Décisions centrales : D-003 palette; D-005 parrainage; D-006 trois modes de demande; D-008 wallet et webhook; D-010/D-011 carton fermé au lancement et services avancés ultérieurs; D-021 Mali d'abord; D-022 modèle hybride; D-024 TypeScript; D-025 hypothèses du backlog.
Sujets ouverts : prix/frais et routes réels (M-003), intégrations de paiement (M-004), navigation (M-005), douane/retours (M-007), audit du site existant (M-008), prestataire SMS (M-010), hébergement.

## 9. Liens de référence
- [README](../README.md)
- [Cahier des charges](requirements/CAHIER_DES_CHARGES.md)
- [Backlog MVP](requirements/BACKLOG_MVP.md)
- [Architecture et contrat API](architecture/ARCHITECTURE.md)
- [Registre des décisions](decisions/REGISTRE_DECISIONS.md)
- [Benchmark concurrents et écarts](market-research/COMPETITORS_AND_PRODUCT_GAPS.md)
- [Guide de travail par rôle](equipe/PROMPTS_EQUIPE.md)
