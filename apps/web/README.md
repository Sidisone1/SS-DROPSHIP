# Site client SS DROPSHIP — `@ss-dropship/web`

Next.js 16 (App Router), synchronisé avec l'application mobile via l'API et les paquets partagés.

- `app/page.tsx` : accueil (recherche, trois modes de commande D-006, catégories, chat flottant).
- `app/inscription/page.tsx` : formulaire d'inscription avec **code de parrainage facultatif** (D-005) ; envoi branché en S1.
- Styles : `app/globals.css`, uniquement via les variables CSS issues de `@ss-dropship/ui` (aucune couleur en dur, testé).
- Icônes : copiées depuis `design/icons/bogolan/png` vers `public/icones` au build (non versionnées ici).

```bash
pnpm --filter @ss-dropship/web dev     # http://localhost:3001
pnpm --filter @ss-dropship/web test
pnpm --filter @ss-dropship/web build
```
