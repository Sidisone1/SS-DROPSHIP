# Design SS DROPSHIP — Refonte humaine et Bogolan (18 novembre 2026)

## Objectif
Améliorer les huit interfaces d'administration communiquées en captures : Fournisseurs, Transitaires, Paiements et rapprochement, Retrait et remboursement, Utilisateurs et rôles, Paramètres, Support et tickets, Moyens de paiement.

## Direction graphique
- Bleu principal #0077C8, rouge #F21A16, blanc #FFFFFF et bleu nuit #10213D. Aucun jaune comme couleur de marque.
- Humaniser les entêtes par des représentations de collaborateurs, fournisseurs et agents africains, sans prétendre représenter des personnes réelles.
- Utiliser en priorité les **icônes Bogolan déjà présentes dans** `design/icons/bogolan/png/`.
- Conserver les motifs géométriques Bogolan en frise, mais éviter de surcharger les tableaux.
- Rendre les tableaux horizontaux consultables sur mobile et prévoir des cartes alternatives en production.
- Navigation admin cohérente, états actifs visibles, boutons accessibles, données fictives clairement identifiées.

## Prototype ajouté
Ouvrir [la prévisualisation HTML](./index.html). Les huit vues sont navigables et réutilisent les assets PNG déjà présents au dépôt.

## Fidélité et limitations
La planche visuelle avec personnages générée dans ChatGPT constitue une **référence artistique**; son image raster n'est pas incluse dans ce commit. Le prototype HTML propose une adaptation consultable et ne prétend pas être une copie pixel-perfect de la planche. Les représentations humaines sont des pictogrammes temporaires; remplacer par les illustrations humaines validées dès que leurs fichiers seront disponibles.

## Règles fonctionnelles
- Paiement : crédit wallet seulement après confirmation webhook authentifiée et idempotente.
- Retrait : soumis aux règles, frais, disponibilité et validations du pays.
- Paramètres : taux de frais et parrainage non validés restent désactivés.
- Utilisateurs : RBAC, journaux d'audit et authentification forte.
- Fournisseurs et transitaires : ne pas présenter les entreprises fictives comme partenaires réels.

Aucun backend, paiement ou accès administrateur réel n'est activé par ce prototype.
