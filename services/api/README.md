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
