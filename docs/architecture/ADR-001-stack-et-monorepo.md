# ADR-001 — Stack TypeScript et organisation du monorepo

**Date : 23/11/2026 · Statut : accepté (D-024) · Phase 4.**

## Contexte
SS DROPSHIP doit livrer un site client, une application mobile iOS / Android et un back-office qui partagent les mêmes
données (cahier des charges § 2). L'équipe de départ est petite (procédure § 1.3) ; la cohérence des types entre les
applications et l'API est un facteur de qualité majeur (statuts de commande, montants, droits).

## Décision
| Couche | Choix | Emplacement |
|---|---|---|
| Langage | TypeScript strict partout, Node.js ≥ 22.18 | — |
| Monorepo | pnpm workspaces + Turborepo | racine |
| Contrats partagés | Machines à états, montants, parrainage, interfaces des prestataires | `packages/types` (**livré en phase 4**) |
| API | NestJS, REST, contrat OpenAPI 3.1 | `services/api`, `docs/architecture/openapi.yaml` (**contrat livré**) |
| Base de données | PostgreSQL 16+, Prisma 7 | `services/api/prisma` (**schéma et migrations livrés**) |
| Tâches asynchrones | Redis + BullMQ (webhooks, notifications, rapprochement, expiration des devis) | `services/workers` |
| Site client et Admin | Next.js (React) | `apps/web`, `apps/admin` |
| Mobile | React Native (Expo) | `apps/mobile` |
| Composants | Bibliothèque partagée + tokens sans jaune | `packages/ui` |
| Tests | `node:test` pour les contrats, Vitest pour les apps, Playwright (web), Maestro (mobile), PGlite pour la base | partout |

Règles :
- `packages/types` n'a **aucune dépendance** à l'exécution ; il est importé par web, mobile, Admin et API.
- Les types de l'API sont générés depuis `openapi.yaml` ; une modification du contrat passe par une pull request relue.
- Le code n'utilise que la syntaxe TypeScript « effaçable » (`erasableSyntaxOnly`) : pas d'`enum` TypeScript, ce qui permet
  d'exécuter les tests directement avec Node.

## Conséquences
- Un seul langage à recruter ; un développeur peut passer de l'API au mobile.
- Une règle métier (ex. transition de commande autorisée) est écrite une fois et utilisée côté client (afficher les
  actions possibles) comme côté serveur (refuser une transition interdite).
- Performances mobiles légèrement inférieures au natif : acceptable pour une application de commande et de suivi.

## Alternatives écartées
Flutter + NestJS (deux langages, pas de types partagés) ; plateforme « backend as a service » (le ledger, les webhooks et
l'audit exigent de toute façon du code serveur maîtrisé). Voir `docs/decisions/ARBITRAGES_PHASE1.md`, M-009.
