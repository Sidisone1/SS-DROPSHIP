# Registre des décisions — SS DROPSHIP

Dernière consolidation : 23/11/2026.

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
| D-020 | Icônes « Glass » : chaque icône Bogolan 3D (D-018) est posée sur une tuile de verre givré rendue avec le composant Glass Icon d'OriginKit, au-dessus d'un motif bogolan bleu, brun et crème ; aucun jaune (demande du propriétaire, 22/11/2026) | `design/icons/bogolan/glass/` ; les 64 icônes `png/` d'origine restent la source de l'objet ; statut à valider |
| D-021 | Pays de lancement : **Mali en premier**, puis Côte d'Ivoire, Guinée, Ghana (Mali demandé par le propriétaire ; ordre suivant délégué à l'équipe, 23/11/2026) | MVP en FCFA (XOF) et en français ; aérien vers Bamako ; Orange Money et Moov Money à contracter ; cahier des charges § 1 complété. Voir `ARBITRAGES_PHASE1.md` |
| D-022 | Modèle économique **hybride** : frais de service par commande dès le lancement ; abonnement « Pro » paramétrable, activable plus tard par l'Admin ; pas de publicité au MVP (23/11/2026) | Lève M-001 ; taux et minimums restent dans M-003 |
| D-023 | Parrainage : **% des frais de service des commandes livrées du filleul pendant 12 mois** (5 % par défaut, paramétrable), versé après paiement confirmé par webhook, en solde « récompenses » non retirable au MVP, avec anti-fraude (23/11/2026) | Lève M-002 ; remplace la règle « 5 % des frais d'abonnement » |
| D-024 | Stack **TypeScript de bout en bout** : monorepo pnpm + Turborepo, Next.js (site, Admin), React Native Expo (mobile), NestJS + PostgreSQL, Redis + BullMQ, stockage S3 (23/11/2026) | Lève M-009 ; sprint S0 peut démarrer |
| D-025 | Hypothèses du backlog MVP **H-01 à H-05 validées** : paiements via le wallet uniquement ; paiement en deux temps (produit puis fret après pesée) ; un entrepôt partenaire en Chine au lancement ; retrait au point SS DROPSHIP ou livraison locale payante à Bamako ; récompenses de parrainage utilisables sur les frais de service (propriétaire, 23/11/2026) | Porte de la phase 2 franchie ; `BACKLOG_MVP.md` validé |
| D-026 | Choix techniques du sprint S1 (comptes) : mots de passe Argon2id ; jeton d'accès de 15 min + jeton de rafraîchissement opaque de 30 jours, haché en base, renouvelé à chaque usage (réutilisation = toutes les sessions fermées) ; jetons dans des cookies httpOnly côté site ; back-office : cookies stricts de 12 h et **double authentification TOTP obligatoire pour tout rôle autre que client** ; codes à 6 chiffres valables 10 min, 5 essais puis blocage 15 min ; parrain accepté seulement si son compte est actif ; premier administrateur créé par script, jamais par inscription (24/11/2026) | ADR-004 appliqué ; `services/api/src/auth`, `apps/web/lib/session.ts`, `apps/admin` |

## À confirmer
- ~~M-001~~ : tranché par D-022.
- ~~M-002~~ : tranché par D-023.
- M-003 : barème tarifaire, taux de change, seuils de recharge et pays.
- M-004 : intégrations marchandes réellement autorisées pour chaque pays. Analyse du 23/11/2026 dans `ARBITRAGES_PHASE1.md` : Stripe n'ouvre pas de compte marchand en Côte d'Ivoire, au Ghana ni en Guinée (impact à arbitrer sur D-019) ; Mali : Orange Money et Moov Money, agrégateur à contracter.
- M-005 : UX exacte de navigation à 5 onglets.
- M-006 : liste **exacte** des titres de visuels 19–50 issue des anciennes validations, si elle est disponible en archive.
- M-007 : éventuelles limites légales/douanières, retours et prestations.
- M-008 : statut technique du site ssdropship.com et des codes sources existants; non audités ici.
- ~~M-009~~ : tranché par D-024.
- ~~H-01 à H-05~~ : validées par D-025. Hypothèses introduites par le backlog MVP du 23/11/2026 (paiement via wallet uniquement, paiement en deux temps, un entrepôt partenaire en Chine, retrait ou livraison locale à Bamako, récompenses utilisables sur les frais de service). Détail dans `docs/requirements/BACKLOG_MVP.md`.
- M-010 : fournisseur SMS (et email) au Mali pour les codes de vérification. En attendant, un prestataire de **test** (`sandbox_journal`) n'envoie rien et l'API refuse de démarrer avec lui en production : aucune inscription réelle n'est possible avant ce choix.
