# SS DROPSHIP — Phase 1 : arbitrages des points ouverts

**Version : 23 novembre 2026 · Statut : analyse et recommandations ; les choix du propriétaire sont reportés
en fin de document et dans le [registre des décisions](REGISTRE_DECISIONS.md).**
Méthode : [PROCEDURE_EQUIPE.md](../equipe/PROCEDURE_EQUIPE.md), phase 1. Rôles mobilisés : Product Owner,
responsable paiements, comptable, juriste, architecte.

## Synthèse

| Point | Bloque le MVP ? | Recommandation |
|---|---|---|
| M-001 Modèle économique | **Oui** (prix, écrans, parrainage) | Hybride : frais de service par commande dès le lancement, abonnement « Pro » paramétrable activé plus tard |
| M-002 Parrainage | **Oui** (S1) | Part des frais de service des commandes livrées du filleul pendant 12 mois, en solde « récompenses » |
| M-003 Barème | **Oui** (S4, S8) | Tables paramétrables par l'Admin ; valeurs initiales à fournir par le propriétaire |
| M-004 Paiements par pays | **Oui** (S6) | CinetPay (Côte d'Ivoire, Guinée) et Paystack (Ghana) ; Stripe direct impossible sans société à l'étranger |
| M-005 Navigation | Oui (S0) | Conserver les 5 onglets du cahier des charges, déjà dessinés dans les 46 écrans |
| M-006 Titres des visuels 19–50 | Non | Reste ouvert ; dépend des archives |
| M-007 Juridique, douane, retours | Oui pour le lancement, pas pour le développement | Proposition de règles MVP ci-dessous, validation par un avocat local avant ouverture |
| M-008 Site ssdropship.com | Non | Audit à mener en S0 |
| M-009 Stack technique | **Oui** (S0) | TypeScript de bout en bout (proposition de la procédure, § 6) |
| *Nouveau* — Pays de lancement | **Oui** | Proposé : Côte d'Ivoire d'abord. **Choisi : Mali d'abord**, puis Côte d'Ivoire, Guinée, Ghana (D-021) |

---

## Pays de lancement (nouveau point, lié à M-004)

| Option | Avantages | Inconvénients |
|---|---|---|
| **A. Côte d'Ivoire seule** *(recommandée)* | Une devise (FCFA), une langue (FR), un prestataire, un cadre juridique ; on apprend vite | Marché initial plus petit |
| B. Côte d'Ivoire + Ghana | Deux grands marchés | Deux devises (FCFA, cedi), FR + EN, deux prestataires, deux juridictions dès le départ |
| C. Les trois pays | Couverture maximale | Charge de conformité et de support triplée ; risque de retard important |

### Choix retenu : Mali en premier (D-021)

Le propriétaire a demandé le **Mali en premier** et m'a laissé fixer l'ordre des autres pays. Ordre retenu :

| Rang | Pays | Ce qui est réutilisé du pays précédent | Ce qui est nouveau |
|---|---|---|---|
| 1 | **Mali** | — | Tout le socle : FCFA (XOF), français, Orange Money et Moov Money |
| 2 | **Côte d'Ivoire** | Même devise, même banque centrale (BCEAO), même langue, Orange Money et Moov Money | MTN MoMo, Wave ; second cadre juridique |
| 3 | **Guinée** | Français, Orange Money, MTN MoMo | Nouvelle devise (franc guinéen, GNF), hors zone FCFA |
| 4 | **Ghana** | Logique multi-devises déjà prête | Anglais, cedi (GHS), Paystack, droit anglophone |

Points d'attention pour le Mali, à faire vérifier par le juriste et le coordinateur logistique :
- Pays enclavé : l'**aérien vers Bamako** est le mode principal du MVP. Le maritime passe par les ports de Dakar ou
  d'Abidjan (phase 2).
- Le Mali a quitté la CEDEAO (Alliance des États du Sahel). Il reste dans l'UEMOA et le franc CFA à ce jour.
  Les règles douanières et monétaires sont à surveiller.
- Mobile Money : Orange Money et Moov Money dominent ; les cartes bancaires sont peu utilisées.



| Option | Avantages | Inconvénients |
|---|---|---|
| A. Frais de service par commande seuls (% du montant, avec un minimum) | Simple à comprendre, revenu dès la première commande | Pas de revenu récurrent ; peu fidélisant pour les revendeurs |
| B. Abonnement obligatoire | Revenu récurrent prévisible | Freine fortement l'inscription sur un marché qui découvre le service |
| **C. Hybride** *(recommandée)* | Lancement avec A ; abonnement « Pro » (frais réduits, priorité) activable par l'Admin quand le volume le justifie | Deux mécanismes à paramétrer (mais l'abonnement peut attendre la V1.1) |

Publicité : exclue du MVP.

## M-002 — Rémunération du parrainage

La règle évoquée (5 % des frais d'abonnement du filleul) ne rapporte rien si l'abonnement n'existe pas au lancement.

| Option | Avantages | Inconvénients |
|---|---|---|
| A. 5 % des frais d'abonnement du filleul | Règle déjà évoquée | Sans effet tant qu'il n'y a pas d'abonnement |
| B. Crédit fixe après la première commande livrée du filleul | Très lisible (« gagnez X FCFA ») | Coût fixe même pour une petite commande |
| **C. % des frais de service des commandes livrées du filleul pendant 12 mois** *(recommandée)* | Proportionnel au revenu réellement encaissé ; compatible plus tard avec l'abonnement | Un peu moins immédiat à expliquer |

Règles communes proposées : taux et durée paramétrables (5 % par défaut, par cohérence avec la règle évoquée) ;
récompense versée seulement **après livraison** et paiement confirmé par webhook ; solde « récompenses »
distinct, utilisable sur les frais et non retirable au MVP ; anti-fraude (pas d'auto-parrainage, contrôle des
téléphones et appareils en double, plafond mensuel).

## M-003 — Barème, taux, seuils

Le modèle de tarification doit être un ensemble de tables paramétrables par l'Admin, historisées par transaction :

| Table | Exemples de champs | Qui fournit la valeur |
|---|---|---|
| Frais de service | taux %, minimum en FCFA, par mode (direct / recherche / négociation) | Propriétaire |
| Fret | origine (Chine, Turquie, Dubaï, Europe), mode (aérien groupage, express), prix par kg, poids volumétrique (diviseur) | Transitaires partenaires |
| Change | devise source, taux du jour, marge de change | Comptable |
| Wallet | recharge minimum et maximum, frais de recharge éventuels | Responsable paiements |
| Stockage | jours gratuits en entrepôt, prix par jour ensuite | Responsable entrepôt |

Aucune valeur n'est inventée ici. Les montants seront saisis à partir des devis réels des transitaires et des prestataires.

## M-004 — Moyens de paiement par pays

Vérifications du 23/11/2026 (sites publics) :
- **Stripe** n'ouvre pas de compte marchand en Côte d'Ivoire ni au Ghana. Il renvoie vers **Paystack** (« Extended network »).
  La Guinée n'est pas listée. Un compte Stripe direct suppose une société immatriculée dans un pays couvert (France, Émirats…).
- **Paystack** sert les marchands enregistrés en Côte d'Ivoire et au Ghana, entre autres. Les cartes Visa et Mastercard sont acceptées dans chaque marché.
- **CinetPay** (agréé BCEAO) encaisse dans une dizaine de pays d'Afrique de l'Ouest et centrale, dont la Côte d'Ivoire et la Guinée
  (Mobile Money et cartes). Commission indicative publiée par un tiers pour la Côte d'Ivoire : environ 3 % + 50 FCFA (à confirmer par contrat).

**Mali (lancement)** : Orange Money publie une offre de paiement web pour les marchands au Mali (developer.orange.com).
Moov Money y est très présent. La couverture du Mali par CinetPay n'a pas été trouvée publiquement : **à confirmer par contrat**.
Recommandation Mali : un agrégateur qui couvre Orange Money et Moov Money au Mali (CinetPay si confirmé, sinon un autre agrégateur agréé BCEAO) ;
à défaut, Orange Money Web Payment en direct. L'interface `PaymentProvider` permet de changer sans toucher au reste.

| Option | Côte d'Ivoire | Ghana | Guinée | Commentaire |
|---|---|---|---|---|
| **A** *(recommandée)* | CinetPay | Paystack | CinetPay | Mobile Money + cartes ; 2 contrats au total |
| B | Paystack | Paystack | — | Un seul prestataire ; Guinée reportée |
| C | Société à l'étranger + Stripe (cartes, Apple Pay, Google Pay) + agrégateur local pour le Mobile Money | idem | idem | Plus de moyens de paiement, mais une société et une conformité supplémentaires |

**Impact sur D-019** (« carte bancaire via Stripe, Apple Pay, Google Pay ») : avec l'option A, la carte bancaire
passe par CinetPay ou Paystack et non par Stripe. Apple Pay et Google Pay restent à confirmer selon ce que chaque
prestataire propose. D-019 n'est pas modifiée sans l'accord du propriétaire.
Statut de chaque intégration : **aucune n'est contractée ni testée** (rien ne doit être présenté comme actif).

## M-005 — Navigation

| Option | Description |
|---|---|
| **A** *(recommandée)* | Accueil · Commandes/Achats · Entrepôt/Logistique · Wallet · Compte, avec chat flottant (cahier des charges § 4, déjà dans les 46 écrans) |
| B | Accueil · Commandes (achats + suivi des colis réunis) · bouton central « Demander » · Wallet · Compte |

La A préserve le travail de design existant ; la B pourra être testée en usabilité.

## M-007 — Règles juridiques et opérationnelles proposées pour le MVP (à valider par un avocat local)

- **Douane** : groupage aérien au prix par kg « dédouané » via un transitaire partenaire (droits inclus, affiché
  avant paiement) ; transport express : droits et taxes à la charge du destinataire, avec une estimation affichée.
- **Retours** : le carton n'étant pas ouvert (D-010), SS DROPSHIP répond de l'achat conforme au devis, de la
  réception et du transport ; la conformité du contenu relève du fournisseur. Procédure de litige avec preuves
  (photos extérieures, poids à la réception comparé au poids à la livraison).
- **Produits refusés** : produits dangereux, batteries seules non conformes au transport aérien, contrefaçons,
  produits interdits à l'import dans le pays. Liste paramétrable.
- **Données personnelles** : consentement, droit d'accès et de suppression, hébergement et transferts à vérifier.

## M-009 — Stack technique

| Option | Avantages | Inconvénients |
|---|---|---|
| **A. TypeScript de bout en bout** (Next.js, React Native Expo, NestJS, PostgreSQL) *(recommandée)* | Un seul langage, types partagés entre web, mobile, admin et API ; recrutement facile | Performances mobiles un peu inférieures au natif (suffisantes ici) |
| B. Flutter (mobile) + NestJS (API) + Next.js (web) | Très bonnes performances mobiles | Deux langages (Dart et TypeScript), pas de types partagés |
| C. Plateforme « backend as a service » (ex. Supabase) | Démarrage très rapide | Le ledger, les webhooks et l'audit demandent de toute façon du code serveur ; dépendance forte |

## M-006 et M-008 — Non bloquants

- M-006 : reste ouvert tant que les archives des anciennes validations ne sont pas retrouvées.
- M-008 : audit du site ssdropship.com (hébergement, code existant, domaine, e-mails) planifié en S0.

---

## Choix du propriétaire (23/11/2026)

| Question | Réponse | Décision |
|---|---|---|
| Pays de lancement | « Fais le choix toi-même, mais seulement après le Mali » : Mali en premier, ordre suivant laissé à l'équipe | **D-021** : Mali → Côte d'Ivoire → Guinée → Ghana |
| Modèle économique (M-001) | Hybride | **D-022** |
| Parrainage (M-002) | % des frais de service, 12 mois | **D-023** |
| Stack (M-009) | TypeScript complet | **D-024** |

Restent ouverts : M-003 (valeurs du barème), M-004 (contrats des prestataires du Mali et impact sur D-019),
M-005 (navigation : la recommandation A s'applique par défaut), M-006, M-007, M-008.

**Porte de la phase 1** : franchie pour les points bloquant le démarrage du développement (S0, S1).
M-003 et M-004 doivent être levés avant les sprints S4 (devis) et S6 (wallet).
