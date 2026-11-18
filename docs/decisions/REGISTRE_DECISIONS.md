# Registre des décisions — SS DROPSHIP

Dernière consolidation : 17/11/2026.

## Validé
| ID | Décision | Conséquence |
|---|---|---|
| D-001 | Nom officiel : SS DROPSHIP (anciennement Suppliers Market) | App, repo et docs utilisent SS DROPSHIP |
| D-002 | Agent d'achat international + entrepôt + logistique | Architecture modulaire |
| D-003 | Palette bleu, rouge, blanc, bleu nuit; **jamais de jaune** | Toutes les maquettes, icônes et présentations |
| D-004 | Icônes 3D premium et présentation claire avec smartphone central | Design system |
| D-005 | Parrainage sur inscription ET dans la navigation du compte | Parcours utilisateur |
| D-006 | Trois modes : commande directe, recherche, négociation | Sourcing |
| D-007 | Identifiants uniques, statuts et journal d'audit | Backend |
| D-008 | Wallet avec paiement confirmé avant crédit | Sécurité financière |
| D-009 | Client peut soumettre lien, image et vidéo de produit | UI achats |
| D-010 | Envoi du carton d'origine **sans ouverture** au lancement | Blocage des prestations QC avancées |
| D-011 | Inspection, vidéos internes, consolidation et reconditionnement ultérieurs | Roadmap V2 |
| D-012 | Client choisit partenaire, transitaire personnel ou transporteur express | Logistique |
| D-013 | Répertoire complet des transitaires = accès Admin | RBAC |
| D-014 | Intégration AnKaTa facultative et reportée | Pas de dépendance MVP |
| D-015 | Multilingue FR, EN, TR, ES, ZH | Internationalisation |
| D-016 | Série visuelle 1–50, individuellement en haute définition | Livrables design |
| D-017 | Ne pas générer les visuels en lot; procéder un par un | Production visuelle |
| D-018 | Icônes 3D dans le style « Collection Bogolan » : objets en bleu, rouge, blanc, bleu nuit, avec une bande bogolan brun terre (#6B3E26); toujours aucun jaune (choix du propriétaire, 17/11/2026) | `design/icons/bogolan/`; le brun est réservé au motif bogolan et aux cartons, jamais en couleur de marque |
| D-019 | Moyens de recharge à proposer : Mobile Money, Google Pay, Apple Pay, carte bancaire via Stripe (demande du propriétaire, 17/11/2026) | Écran « Recharger » de la maquette ; chaque moyen reste soumis à son intégration et à sa disponibilité dans le pays (aucun crédit sans confirmation, D-008) |
| D-020 | Moyens de paiement affichés : Mobile Money, Stripe (libellé simplifié), Google Pay, Apple Pay, **Alipay et WeChat Pay** (demande du propriétaire, commentaire sur la maquette, 18/11/2026) | Écran 45 et visuel 40 ; mêmes réserves que D-019 : intégration et disponibilité par pays, aucun crédit sans confirmation (D-008) |

## À confirmer
- M-001 : modèle économique final (abonnement, commissions, publicité, combinaison).
- M-002 : règle exacte de la rémunération parrainage; 5 % des frais d'abonnement évoqués.
- M-003 : barème tarifaire, taux de change, seuils de recharge et pays.
- M-004 : intégrations marchandes réellement autorisées pour chaque pays.
- M-005 : UX exacte de navigation à 5 onglets.
- M-006 : liste **exacte** des titres de visuels 19–50 issue des anciennes validations, si elle est disponible en archive.
- M-007 : éventuelles limites légales/douanières, retours et prestations.
- M-008 : statut technique du site ssdropship.com et des codes sources existants; non audités ici.
