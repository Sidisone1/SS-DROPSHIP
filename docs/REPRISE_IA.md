# SS DROPSHIP — Document de reprise pour toute IA ou tout développeur

**Mis à jour le 23/11/2026.** À lire en premier, avec [AGENTS.md](../AGENTS.md) (règles impératives).
Ce document dit **où en est le projet, comment le lancer, et quoi faire ensuite**, sans avoir besoin de l'historique
des conversations.

---

## 1. Le projet en 5 lignes
SS DROPSHIP est une plateforme d'agent d'achat international : le client commande ou fait chercher un produit en Chine,
Turquie, Dubaï ou Europe ; SS DROPSHIP achète, réceptionne le colis **fermé** à l'entrepôt, l'expédie et le livre.
Lancement au **Mali** (FCFA, français, Orange Money / Moov Money), puis Côte d'Ivoire, Guinée, Ghana (D-021).
Produits : site client, application mobile, back-office, API.

## 2. Où en est-on
| Phase (voir [procédure](equipe/PROCEDURE_EQUIPE.md)) | État |
|---|---|
| 0 — Consolidation (cahier des charges, maquettes, 50 visuels, 64 icônes) | Fait |
| 1 — Arbitrages | Fait : [ARBITRAGES_PHASE1.md](decisions/ARBITRAGES_PHASE1.md), décisions D-021 à D-024 |
| 2 — Backlog MVP | Fait et validé : [BACKLOG_MVP.md](requirements/BACKLOG_MVP.md) (82 stories, D-025) |
| 3 — Validation des écrans | **À faire par le propriétaire** (46 écrans Bogolan dans `design/prototypes/`) |
| 4 — Architecture | Fait : ADR-001 à 004, `openapi.yaml`, `schema.prisma`, `packages/types` |
| Sprint S0 — socle | **En cours** (voir § 5). Hébergement volontairement reporté par le propriétaire |
| Sprints S1 à S12 | À faire |

Aucune intégration externe réelle (paiement, SMS, transporteur) n'existe. Ne jamais prétendre le contraire.

## 3. Carte du dépôt
```text
apps/web        Site client Next.js 16 (accueil, inscription en aperçu)            ✅ build + 3 tests
apps/admin      Back-office Next.js                                               ⏳ à créer (S0)
apps/mobile     Application Expo 57 / React Native 0.86                           ⏳ à créer (S0)
services/api    API NestJS 12 + Prisma 7 + PostgreSQL                             ✅ santé, pays, audit ; 20 tests
services/workers Tâches asynchrones (BullMQ)                                      ⏳ S6+
packages/types  Machines à états, montants, parrainage, interfaces prestataires   ✅ 22 tests
packages/config Pays (Mali ouvert), langues, drapeaux V2 désactivés               ✅ 5 tests
packages/i18n   Traductions FR (référence) / EN avec repli                        ✅ 7 tests
packages/ui     Design tokens sans jaune + catalogue des 64 icônes Bogolan        ✅ 9 tests
docs/           Cahier des charges, décisions, backlog, architecture, équipe
design/         Charte, maquettes, icônes 3D, visuels 01–50
```

## 4. Lancer le projet
Prérequis : Node ≥ 22.18 (`.nvmrc`), pnpm 10 (`corepack enable`).
```bash
pnpm install
pnpm lint                         # Biome
pnpm turbo run typecheck test     # vérification complète (sans base de données)
pnpm turbo run build
pnpm --filter @ss-dropship/web dev        # site sur http://localhost:3001
# API : nécessite PostgreSQL (DATABASE_URL, voir services/api/.env.example)
pnpm --filter @ss-dropship/api build && DATABASE_URL=postgresql://… node services/api/dist/main.js
```
Les tests de base de données utilisent PGlite (PostgreSQL embarqué) : aucun serveur à installer.
La CI GitHub Actions (`.github/workflows/ci.yml`) exécute lint, typecheck, tests et build à chaque pull request.

## 5. Sprint S0 — reste à faire
- [x] US-SOC-01 Monorepo, CI · [x] US-SOC-03 Modèle de données · [x] US-SOC-04 Audit
- [x] US-SOC-05 i18n et paramètres pays · [x] US-SOC-06 Tokens (composants web de base faits)
- [ ] `apps/admin` (Next.js, écran d'accès réservé)
- [ ] `apps/mobile` (Expo, 5 onglets : Accueil, Commandes, Entrepôt, Wallet, Compte + chat flottant)
- [ ] US-SOC-02 Environnements : **bloqué** jusqu'au choix de l'hébergeur (décision du propriétaire)
- [ ] US-SOC-07 Observabilité (Sentry) : après choix de l'hébergeur

Ensuite : **S1 — comptes et parrainage** (US-AUT-01 à 08 du backlog) : inscription avec code de parrainage, vérification
par code (via `NotificationProvider` en sandbox tant qu'aucun fournisseur SMS n'est contracté), connexion, rôles, MFA admin.

## 6. Règles techniques à respecter
- **Règles métier** : toujours passer par `packages/types` (`transitionner`, `fraisDeService`, `calculerRecompense`,
  `verifierOptionCommandable`). Ne jamais réécrire ces règles dans une app.
- **Argent** : entiers en unité mineure, jamais de flottant ; aucun crédit de wallet hors webhook signé (ADR-002).
- **Base** : ledger et audit en écriture seule (protégés par la migration `20261123000100_protections`).
  Nouvelle migration = nouveau dossier dans `services/api/prisma/migrations/`, jamais modifier une migration existante.
- **Cohérence** : un état ajouté doit l'être dans `packages/types`, `schema.prisma` ET `openapi.yaml`
  (le test `coherence.test.ts` échoue sinon).
- **Charte** : couleurs uniquement via les tokens (`variablesCss()` / `couleurs`), aucun hexadécimal en dur dans les CSS
  des apps (test), aucun jaune (test). Blanc sur rouge #F21A16 = grand texte gras seulement (contraste 4,25:1).
- **Textes** : via `traduire()` / `traducteur()`, clé ajoutée d'abord dans `packages/i18n/src/fr.ts`.
- **Versions** : dépendances figées (versions exactes, publiées depuis au moins deux semaines). TypeScript 5.9.3.
- **Commits** : chaque changement = tests + entrée datée dans `CHANGELOG.md` ; nouvelle hypothèse = registre des décisions.

## 7. Décisions clés (détail dans le [registre](decisions/REGISTRE_DECISIONS.md))
D-003 palette sans jaune · D-005 parrainage à l'inscription et dans le compte · D-006 trois modes de commande ·
D-008 crédit après webhook · D-010/D-011 carton jamais ouvert, options V2 désactivées · D-018 icônes Bogolan ·
D-021 Mali d'abord · D-022 modèle hybride · D-023 parrainage 5 % des frais de service sur 12 mois ·
D-024 stack TypeScript · D-025 paiement via wallet, en deux temps, un entrepôt en Chine, retrait ou livraison à Bamako.

## 8. Points ouverts
M-003 valeurs du barème · M-004 contrat Mobile Money au Mali et impact sur D-019 (Stripe absent en direct en Afrique de
l'Ouest) · M-005 navigation (option A par défaut) · M-006 titres des visuels 19–50 · M-007 juridique et douane ·
M-008 audit du site ssdropship.com · hébergement (à choisir).

## 9. Prompts prêts à l'emploi
[docs/equipe/PROMPTS_EQUIPE.md](equipe/PROMPTS_EQUIPE.md) : bloc commun + prompt par rôle (backend, frontend, mobile, QA…).
