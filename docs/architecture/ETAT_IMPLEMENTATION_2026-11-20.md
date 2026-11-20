# État réel de l'implémentation — 20 novembre 2026

Ce document sépare les **ressources existantes** de l'**architecture cible** afin de ne pas confondre maquettes, prototypes et application en service.

## Présent dans le dépôt
- Cahier des charges et architecture de référence.
- Inventaire de 50 PNG de présentation 1080 × 1920, chacun **à valider**.
- Prototypes HTML historiques et prototype Bogolan de référence.
- Collection de 64 icônes 3D Bogolan (avec inventaire, planches et PNG).
- Documentation de roadmap, règles de travail et décisions.
- `tools/design-review/index.html` : outil statique de revue et d'annotation des 50 écrans.

## Non démontré / à développer
- Backend métier opérationnel, base de données et API sécurisée.
- Authentification, rôles, administration et suivi réel des commandes.
- Application mobile et site client intégrés à un backend réel.
- Connexions effectives de paiement, wallet, webhooks, rapprochement.
- APIs de fournisseurs et transitaires, suivi international en temps réel.
- Tests automatisés complets, pipelines CI/CD et déploiement de production.
- Imports des **originaux** HD 01–19 et validation officielle de 01–50.
- Comparaison automatique entre versions successives de chaque design.

## Architecture logicielle cible
```text
apps/
  web/                 # site client responsive (à implémenter)
  mobile/              # application mobile client (à implémenter)
  admin/               # back-office (à implémenter)
services/
  api/                 # API métier (à implémenter)
  workers/             # tâches événementielles (à implémenter)
packages/
  ui/                  # catalogue de composants et icônes (partiel)
  types/               # contrats et schémas (à implémenter)
  config/              # configuration mutualisée (à implémenter)
design/
  branding/            # design system
  icons/bogolan/       # collection de 64 icônes
  mockups/exports/     # visuels de présentation 01–50
  prototypes/          # démonstrations existantes
docs/
  requirements/        # spécifications
  architecture/        # architecture
  decisions/           # arbitrages
  planning/            # jalons
tools/
  design-review/       # revue statique des maquettes
```

## Règles d'acceptation incontournables
1. Respecter le bleu #0077C8, rouge #F21A16, blanc #FFFFFF, bleu nuit #10213D, sans jaune.
2. Conserver les icônes Bogolan 3D, en vérifiant les licences et les sources avant distribution.
3. Ne pas ouvrir ni inspecter l'intérieur des cartons dans le MVP.
4. Ne jamais créditer un wallet sans confirmation d'un prestataire de paiement via webhook vérifié.
5. Séparer données simulées et données réelles; ne pas prétendre que les intégrations envisagées fonctionnent.
6. Garder les 50 écrans accessibles, sans effacer d'originaux ni de prototypes.
7. Tester les parcours inscription/parrainage, devis, achat, réception, transport et assistance.

## Prochaines étapes recommandées
1. Validation des propositions d'écrans et des visuels existants.
2. Définition des contrats d'API et schéma de données pour les parcours de commande.
3. Création du squelette `apps/web`, `apps/admin` et `services/api`.
4. Développement des composants partageables selon les maquettes validées.
5. Intégrations externes uniquement après validation technique, contractuelle et réglementaire.
6. Tests fonctionnels, sécurité, accessibilité et déploiement progressif.

**À retenir** : l'outil de revue permet de suivre le design, mais ne remplace pas le code métier de l'application.
