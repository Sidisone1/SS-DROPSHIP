# Toolkit de micro-interactions mobile — SS DROPSHIP

Version 1 · 23 novembre 2026 · Spécification de deux planches de référence.

Chaque planche se lit de gauche à droite en grille **2 colonnes × 3 rangées**. Le cadre iPhone affiche **9:41** sur fond sombre. Pour intégrer une interaction au produit, reprendre la charte de SS DROPSHIP. Montrer le point de départ, l’action en cours et son résultat. Employer un ease-out de 180 à 240 ms ou un spring amorti de 280 à 380 ms. Avec « Réduire les animations », remplacer les grands mouvements par un fondu court. Pour chaque geste de glissement, proposer aussi un bouton accessible.

## Pull to Refresh Part 1

### 01 · Release to Refresh — 指を離して更新
**Geste** — Tire vers le bas en haut de « Commandes ».  
**Motion** — L’anneau suit le doigt. Au seuil, « Relâchez pour actualiser » apparaît. Au relâchement, l’anneau tourne puis affiche « Actualisé à 9:41 ».  
**Usage** — Liste principale. Remonte sous le seuil avant de relâcher pour annuler, ou tape sur « Actualiser » dans le menu.

### 02 · New Items Preview — 新着項目のプレビュー
**Geste** — Tire la liste et relâche après le seuil.  
**Motion** — La liste revient avec un spring et affiche « 3 mises à jour de colis · Afficher ». Au tap sur « Afficher », les lignes entrent en fondu décalé.  
**Usage** — Liste consultée pendant l’arrivée de nouveaux éléments. « Plus tard » conserve la position de lecture.

### 03 · Up to Date — 最新の状態
**Geste** — Actualise « Commandes » alors que l’en-tête indique « Vérifié à 9:38 ».  
**Motion** — L’anneau devient une coche et « Aucune nouvelle commande · Vérifié à 9:41 » apparaît en fondu. Les lignes gardent leur place.  
**Usage** — Contrôle sans changement de données. Relâche avant le seuil pour annuler.

### 04 · Offline Refresh — オフライン時の更新
**Geste** — Tire « Commandes enregistrées » en l’absence de connexion.  
**Motion** — « Vérification… » laisse place à « Hors ligne · Données enregistrées ». Au tap sur « Réessayer », l’heure d’actualisation change uniquement si la requête aboutit.  
**Usage** — Lecture hors ligne avec copie locale. « Fermer » masque le message et laisse les données accessibles.

### 05 · Restore Previous View — 前の一覧に戻す
**Geste** — Actualise « Offres de sourcing », puis tape sur « Afficher les 4 nouveaux éléments ».  
**Motion** — Les quatre lignes se déplient en ease-out. « 4 éléments affichés » confirme la mise à jour de la vue.  
**Usage** — Historique. « Annuler » masque les lignes ajoutées et restaure la position de lecture.

### 06 · Refresh One Section — セクションだけ更新
**Geste** — Tire vers le bas dans « Suivi des colis ».  
**Motion** — Seule la section suit le geste. « Vérification… » apparaît sous son titre, puis « 2 statuts mis à jour » confirme le résultat.  
**Usage** — Tableau de bord à plusieurs sections. Relâche avant le seuil ou tape sur « Annuler l’actualisation » pendant la requête.

## Progress Indicator Part 1

### 01 · Download with Pause — 一時停止できるダウンロード
**Geste** — Tape sur « Télécharger · Catalogue fournisseurs », puis sur « Pause ».  
**Motion** — La barre avance en ease-out et s’arrête sur « 42 % · En pause ». Après reprise, « Disponible hors ligne » confirme la fin.  
**Usage** — Téléchargement pour consultation locale. « Reprendre » repart du même point. « Annuler » arrête le transfert.

### 02 · Preparing to Export — 書き出しの準備
**Geste** — Tape sur « Exporter · 12 factures ».  
**Motion** — Un anneau signale « Préparation… ». Quand le total est disponible, une barre indique « 8 sur 12 », puis « Export prêt ».  
**Usage** — Export de plusieurs éléments. « Annuler l’export » arrête la préparation et préserve la sélection.

### 03 · Step Tracker — ステップ進捗
**Geste** — Confirme « Livraison standard », puis tape sur « Continuer ».  
**Motion** — Une coche remplace le repère de l’étape 2. L’accent glisse vers « 3 sur 3 · Vérification » et le récapitulatif montre le choix.  
**Usage** — Parcours en plusieurs étapes. « Retour » rouvre l’étape précédente avec le choix intact.

### 04 · Background Transfer — バックグラウンド転送
**Geste** — Lance « Transférer · Liste de colis.pdf », puis tape sur « Continuer la consultation ».  
**Motion** — La carte se replie en ease-out vers « Transfert · 62 % ». Après confirmation du transfert, elle affiche « Fichier transféré ».  
**Usage** — Pièces jointes et rapports. Tape sur l’indicateur pour rouvrir les détails et accéder à « Annuler le transfert ».

### 05 · Resume After Interruption — 中断後に再開
**Geste** — Tape sur « Reprendre » après l’interruption de « Synchroniser · 12 événements de suivi ».  
**Motion** — « 7 sur 12 · Hors ligne » reste visible. Après reconnexion, la barre repart à sept puis affiche « 12 sur 12 synchronisés ».  
**Usage** — Synchronisation par lot. « Arrêter » annule les transferts restants et conserve les éléments déjà traités.

### 06 · Ready to Apply — 適用前のプレビュー
**Geste** — Tape sur « Générer un aperçu · Récapitulatif des frais ».  
**Motion** — « Préparation… » laisse place à l’aperçu en fondu. Après validation, « Récapitulatif des frais · Enregistré » confirme le changement.  
**Usage** — Vérification avant enregistrement. « Annuler » arrête la génération. « Fermer » quitte l’aperçu et « Annuler l’enregistrement » restaure la version précédente.

## Références

- [Mobbin · Pull to Refresh](https://mobbin.com/explore/mobile/screens/pull-to-refresh)
- [Mobbin · Progress Indicator](https://mobbin.com/glossary/progress-indicator)
- [Apple Human Interface Guidelines · Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators)
