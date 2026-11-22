# Icônes Bogolan « Glass » (décision D-020)

Les 64 icônes de `../png/` posées sur une tuile de verre givré. Statut : **à valider**.

- `png/` : 64 icônes 256 × 256, mêmes noms que `../png/`.
- `tuile-verre.png` : la tuile de verre rendue avec le composant **Glass Icon** d'OriginKit
  (https://www.originkit.dev/components/glass-icon), corps = silhouette d'un carré arrondi, fond = `fond-bogolan.png`.
- `tuile-plaque.png` : le même fond sans la tuile, pour repérer la tuile par différence.

## Refaire les icônes

1. Récupérer la source Next.js du composant Glass Icon (OriginKit, outil MCP `fetch` id `glass-icon`) dans `scripts/GlassIcon.tsx`
   (non versionnée ici : elle reste la propriété d'OriginKit).
2. `npm i react@18.3.1 react-dom@18.3.1 esbuild@0.24.0` puis
   `npx esbuild app.tsx --bundle --minify --jsx=automatic --outfile=bundle.js --define:process.env.NODE_ENV='"production"'`.
3. `node tuile.js ../fond-bogolan.png sortie/c` : rend la tuile et la plaque (Chromium en WebGL logiciel).
4. `python3 composer.py sortie/c-tuile.png ../../png ../png` : détoure chaque objet (clé de couleur, ou GrabCut OpenCV pour
   les objets blancs listés dans `PLEIN`), ajoute une ombre douce et compose l'icône sur la tuile.

Dépendances Python : Pillow, NumPy, SciPy, opencv-python-headless.
