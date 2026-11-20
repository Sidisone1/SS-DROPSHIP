# Atelier de revue des 50 écrans

Ouvrir [index.html](index.html) en local après clonage du dépôt, ou publier le dossier depuis un serveur statique à la racine du dépôt.

## Fonctions disponibles
- Accès aux 50 PNG 1080 × 1920 déjà présents dans `design/mockups/exports/`.
- Recherche, filtrage par intervalle 01–19 / 20–50 et par statut.
- Prévisualisation mobile et ordinateur (la source reste un visuel portrait : il ne s'agit pas d'un écran responsive de l'application).
- Suivi des états : à valider, en cours, corrections, validé, bloqué.
- Notes et corrections par écran, sauvegardées dans le stockage local du navigateur.
- Export JSON des annotations pour intégration ultérieure dans GitHub.

## Limites
L'outil est une **revue statique de designs**, pas une application de commande. Il ne synchronise pas les modifications vers GitHub et ne compare pas encore les versions de deux créations graphiques différentes. Les 50 visuels sont des versions régénérées, non les originaux HD 01–19. Les statuts enregistrés dans le navigateur ne constituent pas une approbation officielle.

## Références
- [Inventaire détaillé](../../design/mockups/INVENTAIRE_VISUELS.md)
- [Design system](../../design/branding/DESIGN_SYSTEM.md)
- [Icônes 3D Bogolan](../../design/icons/bogolan/README.md)
- [Architecture](../../docs/architecture/ARCHITECTURE.md)

Pour publier une modification de design, importer le PNG dans le dépôt, conserver une archive de la version remplacée et consigner la décision dans `docs/decisions/`.
