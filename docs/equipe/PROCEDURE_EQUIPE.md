# SS DROPSHIP — Procédure de réalisation en équipe spécialisée

**Version : 23 novembre 2026 · Statut : proposition à valider par le propriétaire.**
Ce document décrit *comment* l'équipe construit SS DROPSHIP. Il ne remplace ni le
[cahier des charges](../requirements/CAHIER_DES_CHARGES.md) (le *quoi*), ni le
[registre des décisions](../decisions/REGISTRE_DECISIONS.md) (les arbitrages), ni l'[architecture](../architecture/ARCHITECTURE.md).
Les prompts prêts à l'emploi de chaque rôle sont dans [PROMPTS_EQUIPE.md](PROMPTS_EQUIPE.md).

> Rappel de l'état réel (voir [ETAT_IMPLEMENTATION_2026-11-20.md](../architecture/ETAT_IMPLEMENTATION_2026-11-20.md)) :
> documentation, maquettes, 50 visuels et icônes existent ; **aucun code applicatif, backend ou intégration de
> paiement n'est livré**. Cette procédure part de cet état.

---

## 1. Organisation de l'équipe

### 1.1 Rôles transverses (tout projet d'application)

| Pôle | Rôle | Mission sur SS DROPSHIP |
|---|---|---|
| Pilotage | **Product Owner (PO)** — le propriétaire ou son délégué | Arbitre les points M-001 à M-009, valide chaque livrable, tient le backlog |
| | **Chef de projet / Scrum Master** | Sprints, planning, risques, comptes rendus, suivi du registre des décisions |
| | **Business Analyst** | Transforme le cahier des charges en user stories avec critères d'acceptation |
| Design | **UX Researcher** | Entretiens clients au Mali d'abord, puis CI / Guinée / Ghana (D-021), tests d'usabilité sur mobile d'entrée de gamme |
| | **UX Designer** | Parcours, arborescence des 5 onglets (M-005), wireframes |
| | **UI Designer** | Design system, maquettes Bogolan (D-018, D-020), tokens de couleur sans jaune (D-003) |
| | **Designer 3D / visuels** | Visuels 01–50, un par un (D-017), mise à jour de l'inventaire |
| | **UX Writer / Localisation** | Textes FR puis EN, TR, ES, ZH (D-015), libellés de statut, messages d'erreur |
| Technique | **Architecte / Tech Lead** | Stack, contrats d'API, schéma de données, revues de code, ADR |
| | **Dev Backend** | API métier, ledger du wallet, webhooks, RBAC, audit |
| | **Dev Frontend Web** | Site client responsive et back-office Admin |
| | **Dev Mobile** | Application client (iOS + Android) synchronisée avec le site |
| | **Data Engineer / DBA** | Modèle de données, migrations, sauvegardes, rapprochement quotidien |
| | **DevOps / SRE** | CI/CD, environnements dev / staging / prod, monitoring, secrets |
| Qualité | **QA Engineer** | Plan de test, tests E2E des parcours critiques, recette |
| | **Ingénieur Sécurité** | OWASP, signature des webhooks, MFA admin, anti-fraude, pentest |
| | **Juriste / DPO** | CGU/CGV, confidentialité, lois des pays cibles, litiges et retours (M-007) |
| Croissance | **Growth / Marketing** | Lancement, parrainage, ASO / SEO, réseaux sociaux |
| | **Data Analyst** | KPI, tableaux de bord, entonnoir de conversion |
| | **Support client** | FAQ, chat, tickets, remontée des irritants |

### 1.2 Rôles métier propres à SS DROPSHIP

| Rôle | Mission | Pourquoi il compte |
|---|---|---|
| **Responsable sourcing / agent d'achat** | Décrit le métier des 3 modes (D-006), les délais de devis, la négociation | Il est l'utilisateur principal du back-office sourcing |
| **Responsable entrepôt** | Procédure de réception d'un **carton fermé** (D-010), photos extérieures, poids, volume | Fixe ce que l'écran « réception » doit saisir |
| **Coordinateur logistique / transitaires** | Transitaires, transporteurs express, états de suivi | Fournit les données réelles de frais et de délais |
| **Responsable paiements / conformité financière** | Prestataires par pays (M-004), contrats, KYC, rapprochement | Aucune intégration n'est réelle sans lui |
| **Comptable** | Plan comptable du ledger, frais, commissions, taux (M-003) | Valide que le wallet est auditable |

### 1.3 Équipe minimale réaliste (démarrage)

| Personne | Cumule |
|---|---|
| 1 | PO + responsable métier (propriétaire) |
| 2 | Chef de projet + Business Analyst + QA fonctionnel |
| 3 | UX/UI Designer + visuels |
| 4 | Tech Lead + Dev Backend + DevOps |
| 5 | Dev Frontend Web + Admin |
| 6 | Dev Mobile |
| Ponctuel | Juriste, auditeur sécurité, comptable, traducteurs |

---

## 2. Matrice RACI (R = réalise, A = approuve, C = consulté, I = informé)

| Livrable | PO | CP | BA | UX/UI | Tech Lead | Back | Front/Mobile | DevOps | QA | Sécu | Juriste | Métier* |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| User stories et critères | A | C | R | C | C | I | I | I | C | I | I | C |
| Maquettes et design system | A | I | C | R | C | I | C | I | C | I | I | C |
| Architecture, ADR | C | I | I | I | A/R | C | C | C | I | C | I | I |
| API et base de données | I | I | C | I | A | R | C | C | C | C | I | C |
| Écrans web, mobile, admin | I | I | C | C | A | C | R | I | C | I | I | I |
| Wallet, paiements, webhooks | A | I | C | I | A | R | C | C | R | R | C | R |
| Réception entrepôt | A | I | C | C | C | R | R | I | C | I | I | R |
| CI/CD, environnements | I | I | I | I | A | C | C | R | C | C | I | I |
| Recette et mise en production | A | R | C | C | C | C | C | R | R | R | C | C |
| CGU, confidentialité, litiges | A | I | C | I | I | I | I | I | I | C | R | C |

\* Métier = sourcing, entrepôt, logistique, paiements et comptabilité, selon le livrable.

---

## 3. Phases et portes de validation

Chaque phase se termine par une **porte** : le PO valide par écrit (issue, commentaire ou registre). Sans
validation, l'équipe ne passe pas à la phase suivante.

| Phase | Contenu | Sorties attendues dans le dépôt | Porte |
|---|---|---|---|
| **0. Consolidation** *(faite en grande partie)* | Cahier des charges, décisions, design system, maquettes | `docs/`, `design/` | Cahier des charges validé |
| **1. Arbitrages** | Trancher M-001 à M-009, choisir pays et prestataires du lancement | Registre des décisions mis à jour (D-021 et suivantes) | Aucun point bloquant ouvert pour le MVP |
| **2. Spécifications** | Backlog MVP, user stories, critères, règles de gestion par statut | `docs/requirements/BACKLOG_MVP.md` | Backlog priorisé, signé par le PO |
| **3. UX/UI finale** | Validation des 46 écrans Bogolan, états vide / chargement / erreur, accessibilité | `design/prototypes/`, tokens dans `packages/ui` | Écrans MVP « validés » dans l'inventaire |
| **4. Architecture** | Stack, schéma de données, OpenAPI, interfaces des prestataires, sécurité | `docs/architecture/`, `packages/types` | ADR approuvés, revue de sécurité de conception |
| **5. Socle** | Monorepo, CI, environnements, authentification, observabilité | `apps/*`, `services/*`, `.github/workflows` | Pipeline vert, déploiement staging automatique |
| **6. Développement MVP** | Sprints 1 à 10 (§ 5) | Code, tests, CHANGELOG | Démo de fin de sprint acceptée |
| **7. Durcissement** | Sécurité, charge, accessibilité, recette | Rapports de test et de pentest | Zéro anomalie bloquante ou critique |
| **8. Lancement** | Bêta fermée, stores, déploiement progressif | Fiches stores, plan de retour arrière | Go / No-Go signé |
| **9. Exploitation** | Support, KPI, correctifs, préparation de la V2 | Tableaux de bord, roadmap V2 | Revue mensuelle |

---

## 4. Règles de travail communes

### 4.1 Definition of Ready (une story peut entrer en sprint si…)
- elle a un identifiant, une valeur métier et des critères d'acceptation testables ;
- la maquette correspondante est validée, ou explicitement non requise ;
- ses dépendances (API, prestataire, décision) sont levées ou simulées **et signalées comme telles** ;
- elle respecte les décisions D-001 à D-020 et ne dépend d'aucun point M-xxx ouvert.

### 4.2 Definition of Done (une story est terminée si…)
- le code est relu par une autre personne et la CI est verte (lint, types, tests) ;
- des tests unitaires couvrent la logique métier et un test E2E couvre le parcours touché ;
- la story est déployée en staging et validée par le PO ;
- le CHANGELOG est complété avec un commentaire de version (AGENTS n° 10) ;
- le texte existe en FR et a des clés de traduction prêtes pour les autres langues ;
- aucune donnée personnelle réelle, clé ou secret n'est présent dans Git (AGENTS n° 9).

### 4.3 Règles non négociables à vérifier à chaque revue
1. Palette #0077C8 / #F21A16 / #FFFFFF / #10213D, **aucun jaune** ; brun #6B3E26 réservé au motif bogolan (D-018).
2. Champ **code de parrainage facultatif** à l'inscription, programme accessible depuis le compte (D-005).
3. **Aucun crédit de wallet** sans webhook authentifié, idempotent et journalisé (D-008, AGENTS n° 8).
4. Le carton d'origine part **sans ouverture** ; QC, photo / vidéo du contenu, regroupement et reconditionnement sont
   affichés « Bientôt disponible » et **ne peuvent pas être commandés** (D-010, D-011).
5. Paiement et logistique derrière des **interfaces de prestataires** ; aucune intégration présentée comme active sans
   preuve (contrat + test en sandbox + validation du responsable paiements).
6. ID opaque par opération, RBAC, journal d'audit des actions sensibles (D-007).

### 4.4 Rituels
| Rituel | Fréquence | Durée | Participants |
|---|---|---|---|
| Point quotidien | Chaque jour | 15 min | Équipe de réalisation |
| Planification de sprint | Toutes les 2 semaines | 1 h 30 | Équipe + PO |
| Démo de sprint | Toutes les 2 semaines | 45 min | Équipe + PO + métier |
| Rétrospective | Toutes les 2 semaines | 45 min | Équipe |
| Revue design | Chaque semaine | 30 min | UX/UI + PO + Front |
| Revue des décisions | Chaque semaine | 15 min | PO + CP (registre) |

### 4.5 Outils proposés
- **Code** : GitHub (branches courtes, pull request obligatoire, revue par une autre personne, protection de `main`).
- **Suivi** : GitHub Issues / Projects (colonnes : à préparer, prêt, en cours, en revue, en recette, terminé).
- **Design** : Figma pour les sources modifiables, `design/` pour les exports.
- **Qualité** : tests automatisés en CI, Sentry, journaux centralisés.

---

## 5. Plan de sprints du MVP (proposition, 2 semaines par sprint)

Cadence compatible avec la [roadmap](../planning/ROADMAP.md) (3 à 6 mois). L'ordre suit les dépendances.

| Sprint | Objectif | Contenu principal | Critère de démo |
|---|---|---|---|
| **S0** | Socle | Monorepo, CI, staging, modèle de données v1, OpenAPI v1, i18n, design tokens | Une page « bonjour » déployée en staging depuis la CI |
| **S1** | Comptes | Inscription (avec **code de parrainage facultatif**), connexion, mot de passe oublié, vérification email / téléphone, RBAC de base | Inscription avec un code parrain, visible dans le compte |
| **S2** | Catalogue | Catégories, fournisseurs validés par l'Admin, recherche par nom et lien, favoris | Recherche et ajout aux favoris |
| **S3** | Demandes | Les **3 modes** (directe, recherche, négociation), envoi de liens, photos, vidéos | Une demande de chaque mode créée et suivie |
| **S4** | Devis | Back-office sourcing : offres comparées, validité, frais de service, négociation | Le client reçoit et accepte un devis |
| **S5** | Commandes | Panier, liste de souhaits, commande, facture et reçu PDF, statuts | Une commande passe de « devis » à « achat en cours » |
| **S6** | Wallet | Ledger immuable, interface `PaymentProvider`, **un prestataire Mobile Money du Mali en sandbox** (D-021), webhook signé, idempotence | Crédit uniquement après webhook ; un webhook rejoué ne crédite pas deux fois |
| **S7** | Entrepôt | Colis attendus, réception d'un **carton fermé** : photos extérieures, poids, dimensions, emplacement, anomalies | L'agent entrepôt réceptionne un colis ; le client est notifié |
| **S8** | Transport | Choix partenaire / transitaire personnel / express, calcul de frais, états de suivi | Le client choisit un transporteur et suit les états |
| **S9** | Communication | Notifications push / email / SMS via interface, chat flottant, tickets, FAQ, langue EN | Un changement d'état déclenche une notification |
| **S10** | Administration | Tableau de bord, paramètres (taux, frais), journal d'audit, rapports, rapprochement quotidien | L'Admin retrouve qui a fait quoi sur une commande |
| **S11** | Durcissement | Pentest, tests de charge, accessibilité, correction des anomalies, recette | Recette signée par le PO |
| **S12** | Lancement | Bêta fermée, stores, déploiement progressif, astreinte | Go / No-Go |

Fonctions **hors MVP** (V2, D-011) : inspection, photo et vidéo du contenu, regroupement, reconditionnement,
maritime LCL / FCL, AnKaTa (D-014), fidélité et statuts VIP.

---

## 6. Stack technique (proposée au point M-009, validée par D-024 le 23/11/2026)

| Couche | Proposition | Raison |
|---|---|---|
| Monorepo | pnpm + Turborepo, TypeScript strict | Partage des types entre web, mobile, admin et API |
| Site client et Admin | Next.js (React) | Rendu serveur pour le SEO, responsive |
| Mobile | React Native (Expo) | Même langage et mêmes types que le web ; iOS et Android |
| API | NestJS (Node.js), REST + OpenAPI | Modules par domaine (comptes, sourcing, wallet, entrepôt, logistique) |
| Base de données | PostgreSQL + ORM (Prisma) | Transactions fiables pour le ledger |
| Files et tâches | Redis + BullMQ (`services/workers`) | Webhooks, notifications, suivi des colis |
| Fichiers | Stockage compatible S3, URL temporaires | Photos de colis, factures, médias clients |
| Observabilité | Sentry, journaux structurés, alertes | Exigence § 11 du cahier des charges |
| Tests | Vitest / Jest, Playwright (web), Maestro (mobile) | Parcours critiques automatisés |

Ce choix est validé (D-024). L'installation se fait au sprint S0, pas avant.

---

## 7. Parcours critiques à tester automatiquement

1. Inscription avec et sans code de parrainage ; code visible dans le compte.
2. Demande en mode direct, recherche et négociation → devis → acceptation.
3. Paiement : webhook valide → crédit ; webhook invalide → refus ; webhook rejoué → aucun double crédit.
4. Réception d'un colis **fermé** ; impossible de commander une option désactivée.
5. Choix du transporteur → états de suivi → notification de livraison.
6. Admin : action sensible inscrite au journal d'audit ; accès refusé à un rôle non habilité.

---

## 8. Indicateurs de pilotage

| Domaine | Indicateur |
|---|---|
| Livraison | Vélocité, stories terminées par sprint, anomalies ouvertes par gravité |
| Qualité | Taux de réussite de la CI, couverture des modules wallet et commandes, taux de crash mobile |
| Produit | Inscriptions, part avec code parrain, demandes → devis → commandes, délai moyen de devis |
| Opérations | Délai de réception en entrepôt, délai de livraison, incidents par transporteur |
| Finance | Écarts de rapprochement quotidien (objectif : 0), webhooks rejetés |

---

## 9. Risques principaux

| Risque | Effet | Mesure |
|---|---|---|
| Moyens de paiement indisponibles dans un pays (M-004) | Lancement retardé | Choisir 1 prestataire par pays pour le lancement ; interface `PaymentProvider` |
| Modèle économique non arbitré (M-001, M-002) | Écrans et règles à refaire | Rendre frais, commissions et parrainage paramétrables par l'Admin |
| Fraude, double paiement | Pertes financières | Ledger immuable, idempotence, rapprochement quotidien, MFA admin |
| Réglementation douanière et retours (M-007) | Litiges | Validation par un juriste local avant ouverture |
| Connexion mobile lente dans les pays cibles | Abandon | Budget de poids des pages, images optimisées, mode dégradé |
| Dérive de périmètre (options V2 demandées tôt) | Retard | Respect strict de D-010 / D-011 et du backlog signé |
