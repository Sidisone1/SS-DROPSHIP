# SS DROPSHIP

**Plateforme internationale d'agent d'achat, sourcing, entrepôt, logistique et livraison.**

> Version de consolidation : 17 novembre 2026 — reconstruction documentaire à partir des décisions validées dans nos conversations. Ce dépôt n'est pas encore une application en production.

## Navigation du projet

- [Cahier des charges consolidé](docs/requirements/CAHIER_DES_CHARGES.md)
- [Architecture fonctionnelle et technique](docs/architecture/ARCHITECTURE.md)
- [Décisions validées et points à arbitrer](docs/decisions/REGISTRE_DECISIONS.md)
- [Design system](design/branding/DESIGN_SYSTEM.md)
- [Inventaire des maquettes et visuels 01–50](design/mockups/INVENTAIRE_VISUELS.md)
- [Liste des visuels à récupérer ou créer](design/mockups/VISUELS_MANQUANTS.md)
- **[Maquettes des 58 écrans, version Bogolan (référence)](design/prototypes/ecrans-bogolan.html)**
- [Icônes 3D Bogolan (64 icônes)](design/icons/bogolan/README.md)
- [Visuels de présentation 01–50 (Bogolan)](design/mockups/exports/)
- [Les 58 écrans en images (Bogolan)](design/mockups/ecrans/)
- [Maquettes des 33 écrans, version au trait (archive)](design/prototypes/ecrans.html)
- [Premier prototype (archive)](design/prototypes/index.html)
- [Plan de réalisation](docs/planning/ROADMAP.md)
- [Directives des agents IA](AGENTS.md)

## Décisions non négociables

- Palette **bleu #0077C8, rouge #F21A16, blanc et bleu nuit**, sans jaune. Icônes et présentations **3D premium dans le style Bogolan** (bande bogolan brun terre, D-018) : c'est la version de référence de tous les écrans et visuels.
- Site et application synchronisés; parcours mobile-first, accessible en français et autres langues retenues.
- **Trois modalités de commande** : directe, recherche de produit, recherche avec négociation fournisseur.
- Inscription, connexion, mot de passe oublié, **code de parrainage visible à l'inscription et dans le compte**.
- **Wallet**, historique et paiement par prestataires habilités avec confirmation avant crédit.
- Entrepôt, suivi des colis, frais logistiques, expédition et traçabilité.
- **MVP : livraison du carton d'origine sans ouverture**; les prestations avancées (photo produit, vidéo, QC, regroupement, reconditionnement) sont prévues mais **désactivées au lancement**.
- Id unique par opération, contrôle des rôles et journal d'audit.

## Traçabilité des designs

Les maquettes et images réalisées dans les anciennes conversations ne sont **pas automatiquement déposées sur GitHub**. Les contenus documentaires, l'inventaire et un prototype de travail peuvent être ajoutés ici; les originaux HD doivent être récupérés ou régénérés puis intégrés dans `design/mockups/exports/`.

## Statut

| Élément | État |
|---|---|
| Documentation de cadrage | Consolidée à partir des échanges |
| Structure de fichiers | Initialisée |
| Design system | Documenté |
| Série de 50 visuels | 50 visuels générés (1080 × 1920), à valider ; originaux HD 01–19 à récupérer |
| Code fonctionnel de l'application | Non livré dans cette consolidation |

Site de référence du projet : [ssdropship.com](https://ssdropship.com).
## Atelier de suivi des designs (20 novembre 2026)

- [Ouvrir le code de l'atelier interactif 01–50](tools/design-review/index.html) — filtres, aperçu mobile/ordinateur, annotations locales, export JSON.
- [Guide de l'atelier](tools/design-review/README.md).
- [État réel des composants et des développements restants](docs/architecture/ETAT_IMPLEMENTATION_2026-11-20.md).

**Note :** cet atelier de revue ne constitue pas l'application commerciale opérationnelle. Les originaux HD 01–19 restent à importer et les 50 visuels régénérés restent à approuver.
