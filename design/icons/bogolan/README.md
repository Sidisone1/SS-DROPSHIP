# Icônes 3D Bogolan — SS DROPSHIP

64 icônes 3D dans le style de la « Collection Bogolan » (famille d'icônes du propriétaire, aussi utilisée
par Tchi TELIMAN), adaptées à la charte SS DROPSHIP (décision D-018).

| Dossier | Contenu |
| --- | --- |
| `planches/` | 4 planches sources de 16 icônes (`ss-01.png` à `ss-04.png`, 1024 × 1024) |
| `png/` | 64 icônes découpées, PNG 256 × 256, coins arrondis, fond transparent |
| `scripts/icones_ss.json` | Liste des icônes : nom de fichier et libellé français |
| `scripts/prompt_ss.py` | Consigne de génération d'une planche (`python3 prompt_ss.py 1`) |
| `../../../packages/ui/icones.mjs` | Catalogue pour le code (chemin et libellé de chaque icône), testé |
| `scripts/decouper_ss.py` | Découpage d'une planche en icônes (`python3 decouper_ss.py ../planches/ss-01.png 1 ../png`) |

Source modifiable : fichier Figma « SS DROPSHIP — Icônes Bogolan »
(https://www.figma.com/design/fbOGFDFqd0adXXIntYXCZw). Générées le 17/11/2026 avec Figma AI (gpt-image-2.5).

## Style
- Rendu 3D premium « pâte à modeler », tuile gris clair #F4F6F8 aux coins arrondis.
- Objets en bleu #0077C8, rouge #F21A16, blanc et bleu nuit #10213D.
- Une bande bogolan brun terre (#6B3E26) avec zigzag et points blancs sur chaque objet.
- **Aucun jaune, doré ni orange.** Les cartons (colis) sont en kraft brun.

## Les 64 icônes
- **Les 56 pictogrammes du prototype** (`design/archives/ecrans-trait.html`), même nom de fichier que les symboles `#i-…` :
  home, cart, box, wallet, user, search, link, camera, deal, back, chev, down, bell, chat, gift, truck, plane, ship,
  globe, card, mobile, check, clock, lock, mail, heart, gear, plus, minus, pin, file, shield, chart, users, scale,
  ruler, qr, copy, share, upload, download, store, filter, star, alert, info, warehouse, send, phone, cpu, game, wifi,
  laptop, logout, doc, grid.
- **8 icônes de parcours du design system** : recharge, devis, suivi, transitaire, douane, bientot, support, langue.

## À vérifier avant usage en production
- « Devis » refaite avec un badge FCFA (source : `planches/ss-devis-fcfa.png`).
- « Wi-Fi » refaite (la première version montrait une personne qui se connecte) ; source `planches/ss-wifi.png`,
  recadrée avec `scripts/recadrer_icone_seule.py`.
- Aperçu en situation : `design/prototypes/ecrans-bogolan.html` (les 33 écrans avec ces icônes). `design/archives/ecrans-trait.html`
  garde les pictogrammes au trait. Les apps (`apps/`) ne sont pas encore modifiées (statut : **à valider**).
