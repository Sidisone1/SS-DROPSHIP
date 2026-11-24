# Parcours de bout en bout (navigateur réel)

Scripts Playwright qui rejouent les parcours du sprint S1 contre le vrai site, la vraie API et une vraie base
PostgreSQL. Ils ne tournent pas dans la CI (ils exigent trois serveurs) : à lancer avant une livraison.

| Script | Parcours |
|---|---|
| `parcours-s1-site.cjs` | Inscription → code faux puis bon → connexion (erreur puis succès) → espace parrainage → un filleul s'inscrit avec le lien partagé → le parrain voit 1 filleul → déconnexion |
| `parcours-s1-admin.cjs` | Administrateur créé par script → 1re connexion → activation de la double authentification → reconnexion sans code (refus) puis avec code → tableau de bord → déconnexion |

## Lancer
1. Une base PostgreSQL vide avec les migrations (`services/api/prisma/migrations`), par exemple PGlite + `@electric-sql/pglite-socket`.
2. L'API en mode développement (le prestataire sandbox écrit les codes dans le journal) :
   `NODE_ENV=development DATABASE_URL=… node services/api/dist/main.js > api.log`
3. Le site (`API_URL=http://localhost:3000/v1 pnpm --filter @ss-dropship/web start`) et le back-office (port 3002).
4. Pour le back-office : `ADMIN_EMAIL=admin@ssdropship.test ADMIN_MOT_DE_PASSE='Admin-tres-solide-2027' DATABASE_URL=… node services/api/dist/scripts/creer-admin.js`.
5. `node tools/e2e/parcours-s1-site.cjs api.log` puis `node tools/e2e/parcours-s1-admin.cjs`.

Les numéros de téléphone sont fixes : utilisez une base neuve à chaque exécution.
