# Historique des mises à jour

## 2026-11-17 — Initialisation et consolidation
- Dépôt SS-DROPSHIP initialement vide; accès GitHub lecture/écriture vérifié.
- Création du README, cahier des charges, architecture, décisions, roadmap et directives des agents.
- Documentation du système de design et inventaire des 50 étapes.
- Identification des originaux visuels HD non présents dans le dépôt.
- Ajout d'un prototype UI illustratif en HTML (pas l'application finalisée).
- Aucun original HD historique n'a été affirmé transféré sans vérification.

## 2026-11-17 — Maquettes des 33 écrans
- Ajout de `design/prototypes/ecrans.html` : 30 écrans de l'application client et 3 écrans du back-office Admin, dessinés à partir du cahier des charges (accès au compte, accueil, achats, entrepôt et livraison, wallet, compte et services).
- Respect des décisions D-003 (aucun jaune), D-005 (parrainage), D-006 (trois modes), D-008 (crédit après confirmation), D-010 (carton non ouvert, services avancés « Bientôt »), D-012, D-015.
- Proposition à valider : données d'exemple, récompenses de parrainage non chiffrées (M-002). Ne remplace pas les 50 visuels HD de présentation.

## 2026-11-17 — Génération des 50 visuels
- Ajout de 50 PNG 1080 × 1920 dans `design/mockups/exports/` (smartphone 3D central, titre, quatre cartes d'avantages, bandeau de processus ; ordinateur pour les étapes Admin).
- Ajout des sources de génération dans `design/mockups/source/` (modèle HTML et script Playwright).
- `INVENTAIRE_VISUELS.md` réécrit avec le statut réel de chaque visuel : titres 01, 02, 19 retrouvés ; 03–18 proposés ; 20–50 issus de la proposition non validée. Tous « à valider ».
- Ces visuels sont des versions régénérées : ils ne remplacent pas les originaux HD des anciennes conversations (consigne AGENTS n° 5).

## 2026-11-17 — Icônes 3D Bogolan
- Ajout de `design/icons/bogolan/` : 64 icônes 3D style « Collection Bogolan » aux couleurs SS DROPSHIP
  (56 pictogrammes du prototype + 8 icônes de parcours), en 4 planches sources et en PNG 256 × 256.
- Décision D-018 : bande bogolan brun terre autorisée sur les icônes, aucun jaune (D-003 maintenue).
- Scripts de génération et de découpage fournis. Source modifiable dans Figma.
- Statut : **à valider** ; le prototype HTML utilise toujours ses pictogrammes au trait. Aucun code modifié.

## 2026-11-17 — Écrans avec icônes Bogolan
- Ajout de `design/prototypes/ecrans-bogolan.html` : les 33 écrans avec les icônes 3D Bogolan (pastilles,
  barre d'onglets, bouton de discussion, vignettes produits, cartes de services) et une galerie des 64 icônes.
- Les icônes sont lues dans `design/icons/bogolan/png/`. `ecrans.html` (version au trait) est conservé tel quel.
- Version publiée aussi en page Artifact privée pour la visualisation. Statut : **à valider**. Aucun code d'app modifié.

## 2026-11-17 — Icône Devis en FCFA et catalogue d'icônes
- Icône « Devis » régénérée avec un badge FCFA (au lieu de « $ ») ; source `design/icons/bogolan/planches/ss-devis-fcfa.png`.
- Ajout de `packages/ui/icones.mjs` (catalogue sans dépendance : chemin et libellé de chaque icône) et de son test
  `packages/ui/icones.test.mjs` (4 tests, `node --test packages/ui/icones.test.mjs`).
- Icône « Wi-Fi » régénérée : la première version montrait une personne qui se connecte, d'où une erreur sur les fiches
  « Routeur Wi-Fi ». Libellé passé de « Connexion » à « Wi-Fi ». Script `scripts/recadrer_icone_seule.py` ajouté.
- Les apps (`apps/`) n'ont toujours pas de code : rien à brancher pour l'instant.

## 2026-11-17 — Moyens de recharge
- Écran 24 « Recharger » (`design/prototypes/ecrans-bogolan.html`) : Mobile Money, Google Pay, Apple Pay et carte bancaire
  via Stripe, à la demande du propriétaire (décision D-019). PayPal retiré de cet écran.
- Google Pay, Apple Pay et Stripe sont marqués « sous réserve d'intégration » : aucune intégration réelle n'existe.
- Les logos officiels de ces marques ne sont pas utilisés (icônes Bogolan génériques) ; à intégrer depuis leurs kits officiels si besoin.

## 2026-11-17 — Écran de bienvenue
- Écran 01 « Bienvenue » (`design/prototypes/ecrans-bogolan.html`) : les pastilles Chine, Turquie, Dubaï, Europe sont
  regroupées dans une carte « Nos pays d'achat », alignées sur une ligne avec un code pays (CN, TR, AE, EU) aux couleurs
  de la charte. Pas de drapeaux, pour ne pas introduire de jaune (D-003). Demande du propriétaire.

## 2026-11-17 — Visuels 1 à 50 avec les icônes 3D Bogolan
- Les 50 visuels de `design/mockups/exports/` sont régénérés avec les écrans de `ecrans-bogolan.html` et les icônes 3D Bogolan (D-018) dans les cartes d'avantages, la barre d'onglets et les écrans ; mêmes noms de fichiers.
- Visuels 39 et 40 alignés sur D-019 (Mobile Money, carte via Stripe, Google Pay, Apple Pay).
- Modèle `design/mockups/source/visuels-template.html` mis à jour (chemins vers `design/icons/bogolan/png/`). Toujours « à valider ».

## 2026-11-17 — Bogolan comme version de référence
- README et design system : les écrans `ecrans-bogolan.html`, les icônes 3D Bogolan et les visuels Bogolan deviennent la référence ; `ecrans.html` et `index.html` sont gardés comme archives.
