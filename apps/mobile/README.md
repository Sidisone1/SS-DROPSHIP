# Application mobile SS DROPSHIP — `@ss-dropship/mobile`

Expo 57 / React Native 0.86 / Expo Router. Cinq onglets (cahier des charges § 4, M-005 option A) :
Accueil, Commandes, Entrepôt, Wallet, Compte, et un chat flottant sur chaque écran.

- Icônes 3D Bogolan lues directement dans `design/icons/bogolan/png` (D-018).
- Couleurs et textes via `@ss-dropship/ui` et `@ss-dropship/i18n` ; règles via `@ss-dropship/types`.
- Entrepôt : prestations V2 affichées « Bientôt disponible », non cliquables (D-011).
- Compte : accès au parrainage (D-005) ; règle affichée depuis les paramètres de D-023.
- Wallet et commandes : aucune donnée inventée ; branchés sur l'API aux sprints S5 et S6.

```bash
pnpm --filter @ss-dropship/mobile start     # Expo Go / simulateur
pnpm --filter @ss-dropship/mobile test      # 6 tests de structure
pnpm --filter @ss-dropship/mobile build     # export web (vérifie que tout compile avec Metro)
```
Versions alignées sur Expo 57 (`react-native-reanimated` 4.5.1 et `react-native-worklets` 0.10.1 figés pour éviter
qu'une version plus récente, incompatible avec React Native 0.86, soit installée automatiquement).
