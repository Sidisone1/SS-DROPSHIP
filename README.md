# SS DROPSHIP

**Plateforme internationale d'agent d'achat, sourcing, entrepôt, logistique et livraison.**

> Version de consolidation : 17 novembre 2026 — reconstruction documentaire à partir des décisions validées dans nos conversations. Ce dépôt n'est pas encore une application en production.

## Navigation du projet

**Documents**
- [Cahier des charges consolidé](docs/requirements/CAHIER_DES_CHARGES.md)
- [Architecture fonctionnelle et technique](docs/architecture/ARCHITECTURE.md)
- [Décisions validées et points à arbitrer](docs/decisions/REGISTRE_DECISIONS.md)
- [Paiements et logistique](docs/integrations/PAIEMENTS_ET_LOGISTIQUE.md)
- [Plan de réalisation](docs/planning/ROADMAP.md)

**Design** (point d'entrée : [design/README.md](design/README.md))
- **[Les 64 écrans, version Bogolan (référence)](design/prototypes/ecrans-bogolan.html)** · [en images](design/mockups/ecrans/)
- [Back-office « humain » : 8 pages Admin](design/prototypes/admin/index.html)
- [Visuels de présentation 01–50](design/mockups/exports/) · [inventaire et statut](design/mockups/INVENTAIRE_VISUELS.md)
- [Icônes 3D Bogolan](design/icons/bogolan/README.md)
- [Charte graphique](design/branding/DESIGN_SYSTEM.md)
- [Archives : premiers écrans et premier prototype](design/archives/)

**Code** (pas encore commencé) : `apps/` (web, mobile, admin), `packages/` (ui, types, config), `services/` (api, workers).

**Règles de travail** : [AGENTS.md](AGENTS.md) · [historique des changements](CHANGELOG.md)

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

Les images faites dans les anciennes conversations ne sont pas sur GitHub. Les 50 visuels actuels sont des versions **régénérées** (voir l'inventaire) ; les originaux HD des visuels 01–19 restent à retrouver pour comparaison.

## Statut (18/11/2026)

| Élément | État |
|---|---|
| Documentation de cadrage | Consolidée |
| Écrans de l'application | 64 écrans Bogolan + 8 pages Admin « humaines », à valider |
| Visuels de présentation | 50 visuels 1080 × 1920 en version Bogolan, à valider |
| Icônes | 64 icônes 3D Bogolan, à valider |
| Code de l'application | Pas encore commencé |

Site de référence du projet : [ssdropship.com](https://ssdropship.com).