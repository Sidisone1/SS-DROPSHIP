# Bibliothèque UI partagée

Composants alignés avec design/branding/DESIGN_SYSTEM.md; pas de jaune et assets 3D à importer.

Statut : les composants ne sont pas encore écrits (les apps n'ont pas encore de code).

## Icônes 3D Bogolan (disponible)

`icones.mjs` donne accès aux 64 icônes 3D de `design/icons/bogolan/png/` (décision D-018), sans dépendance :

```js
import { ICONES, cheminIcone, libelleIcone } from './icones.mjs';
cheminIcone('wallet');   // 'design/icons/bogolan/png/wallet.png'
libelleIcone('wallet');  // 'Portefeuille' (pour l'attribut alt)
```

Test : `node --test packages/ui/icones.test.mjs` (vérifie que chaque icône existe, en PNG 256 × 256 avec
transparence, et que tous les pictogrammes du prototype ont leur icône 3D).
