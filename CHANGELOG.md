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
