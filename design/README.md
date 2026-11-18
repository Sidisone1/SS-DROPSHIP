# Design — SS DROPSHIP

Point d'entrée de tout le design. La **version de référence est la version Bogolan** (icônes 3D Bogolan et frise bogolan, décision D-018). Tout est **à valider** par le propriétaire ; les noms, montants et identifiants affichés sont des exemples.

## Ce qu'il faut ouvrir en premier

| Quoi | Où | Contenu |
|---|---|---|
| Les écrans de l'application | [`prototypes/ecrans-bogolan.html`](prototypes/ecrans-bogolan.html) | 64 écrans (54 client, 10 Admin), la charte, la liste illustrée des 50 visuels |
| Les écrans en images | [`mockups/ecrans/`](mockups/ecrans/) | Les 64 écrans en PNG, un fichier par écran |
| Le back-office « humain » | [`prototypes/admin/index.html`](prototypes/admin/index.html) | 8 pages Admin interactives et leur [guide](prototypes/admin/GUIDE_REFONTE.md) |
| Les visuels de présentation | [`mockups/exports/`](mockups/exports/) | 50 visuels 1080 × 1920, liste et statut dans [`mockups/INVENTAIRE_VISUELS.md`](mockups/INVENTAIRE_VISUELS.md) |
| Les icônes | [`icons/bogolan/`](icons/bogolan/README.md) | 64 icônes 3D Bogolan (PNG 256 × 256) et leurs planches sources |
| La charte | [`branding/DESIGN_SYSTEM.md`](branding/DESIGN_SYSTEM.md) | Couleurs, composition des visuels, parcours à représenter |

## Organisation du dossier

```
design/
├── README.md                 ce fichier
├── branding/                 charte graphique (DESIGN_SYSTEM.md)
├── icons/bogolan/            icônes 3D Bogolan : png/, planches/, scripts/
├── prototypes/
│   ├── ecrans-bogolan.html   RÉFÉRENCE : les 64 écrans
│   └── admin/                8 pages Admin « humaines », index.html, GUIDE_REFONTE.md, apercus/
├── mockups/
│   ├── ecrans/               les 64 écrans en PNG
│   ├── exports/              les 50 visuels de présentation
│   ├── source/               modèle et script pour régénérer les visuels
│   ├── INVENTAIRE_VISUELS.md statut de chaque visuel
│   └── VISUELS_MANQUANTS.md  plan de récupération des originaux
├── archives/                 anciennes versions, à ne plus modifier
│   ├── ecrans-trait.html     les 33 premiers écrans, icônes au trait
│   └── prototype-initial.html le tout premier prototype d'accueil
├── illustrations/            vide : illustrations à importer
└── wireframes/               vide : schémas de parcours à déposer
```

## Règles pour modifier le design

1. Modifier **`prototypes/ecrans-bogolan.html`**, jamais les archives.
2. Après une modification d'écran, régénérer les images de `mockups/ecrans/` et, si l'écran apparaît dans un visuel, le visuel concerné (`mockups/source/`).
3. Palette bleu #0077C8, rouge #F21A16, blanc, bleu nuit #10213D ; le brun terre #6B3E26 est réservé à la frise bogolan et aux cartons ; **aucun jaune**.
4. Tracer chaque changement dans `CHANGELOG.md` et chaque nouvelle règle dans `docs/decisions/REGISTRE_DECISIONS.md`.

## Points ouverts

- Les écrans Admin 59 à 64 de `ecrans-bogolan.html` et les 8 pages de `prototypes/admin/` couvrent les mêmes modules : choisir la version à garder.
- Titres des visuels 03–18 et 20–50 : propositions à valider.
- Originaux HD des visuels 01–19 : à retrouver pour comparaison.
