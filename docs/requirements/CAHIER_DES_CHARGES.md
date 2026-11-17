# SS DROPSHIP — Cahier des charges fonctionnel consolidé

**Version : 17 novembre 2026 · Statut : document de référence reconstitué à partir des échanges.**
L'ancien nom de projet **Suppliers Market** a été remplacé par **SS DROPSHIP**.

## 1. Vision et marchés
Plateforme d'agent d'achat internationale : le client trouve ou soumet un produit, SS DROPSHIP prend en charge le sourcing et/ou l'achat, suit la réception en entrepôt, gère le paiement, le contrôle autorisé, l'expédition et la livraison. Sources : Chine, Turquie, Dubaï, Europe. Marchés cibles prioritaires : Côte d'Ivoire, Ghana, Guinée, avec extension ultérieure.

Produits : électronique, informatique, jeux vidéo, téléphones, équipements réseau et autres catégories administrables. L'application doit permettre de proposer des fournisseurs locaux et internationaux.

## 2. Plateformes et rôles
- Application mobile Client et site web synchronisés, avec comptes et données partagés.
- Back-office Admin : fournisseurs, demandes, commandes, tarifs, paiements, transitaires, entrepôts, support, contenus, rapports, paramètres.
- Profils opérationnels séparés selon nécessité : agent d'achat, agent entrepôt, fournisseur, transitaire, comptable, support.
- Permissions par rôle (RBAC), historique des actions sensibles et identifiants uniques.

## 3. Connexion et création de compte
Première visite : inscription, connexion, mot de passe oublié, validation de contact, réinitialisation sécurisée. Champs d'inscription habituels : nom, téléphone ou email, pays, mot de passe, confirmation, **code de parrainage facultatif**. Le code et le programme de parrainage doivent rester accessibles dans le compte une fois connecté. Prévoir un indicateur de récompenses et un historique.
**Règle commerciale évoquée** : 5 % des frais d'abonnement du filleul pour le parrain, à préciser selon le modèle de monétisation final; ne pas activer une règle non définitivement validée sans paramétrage Admin.

## 4. Navigation de base
Cinq onglets prioritaires avec sous-onglets :
1. **Accueil** : recherche par nom, lien, photo/vidéo, QR si disponible, catégories, offres, actualités, favoris, promotions.
2. **Commandes / Achats** : demandes, devis, paniers, commandes, paiement, reçus, suivi, avis et litiges.
3. **Entrepôt / Logistique** : colis attendus, reçus, en traitement, prêts, expédiés; poids, dimensions, volume, stockage, fret, suivi.
4. **Recharge / Wallet** : solde, recharger, payer, opérations, retraits/remboursements selon règles, devises.
5. **Compte / Services** : profil, parrainage, adresses, notifications, sécurité, préférences, factures, support et chat.
La distribution exacte des cinq onglets et des services reste configurable dans la maquette finale. L'utilisateur peut organiser des sous-onglets ou réunir plusieurs éléments dans un groupe; conserver un chat flottant facile d'accès.

## 5. Commandes et sourcing
**Trois modes confirmés** :
- Commande directe : client connaît le produit ou transmet un lien.
- Recherche de produit : client décrit ce qu'il cherche, avec photos/vidéos si nécessaire.
- Recherche avec négociation : agent contacte les fournisseurs et propose une ou plusieurs offres.

Pour chaque demande : identifiant, liens et médias, références, quantité, variante, prix, devise, durée de validité de devis, frais de service, commentaire, options, statut et historique. Offres comparables par fournisseur, prix, délai, qualité des informations disponibles. Panier et liste de souhaits distincts. Notifications de changement d'état. Prévoir le téléchargement de factures et reçus.

## 6. Fournisseurs et catalogue
Annuaire fournisseur client (local et international) filtrable par type, marché, zone, délais, prix et catégorie; fiches fournisseurs validées par l'Admin. Produits mis en avant, plus achetés et promotions pilotés depuis le back-office. Éviter les fausses évaluations et les prix simulés non signalés.

## 7. Entrepôt : MVP et options ultérieures
Lors de la réception, le personnel enregistre : identifiant de colis, client, commande, transporteur, tracking, date, photos **du colis extérieur** si nécessaires, poids, dimensions, volume, état extérieur, emplacement et anomalies.

**Règle MVP validée** : le carton d'origine est expédié **sans être ouvert**. Les options ci-dessous peuvent figurer dans la documentation/maquette mais doivent être **désactivées au lancement** tant que le service n'est pas disponible :
- ouverture/contrôle qualité interne (QC);
- photo ou vidéo du contenu produit;
- inspection vidéo avancée;
- regroupement et consolidation de plusieurs colis;
- reconditionnement.
Le client voit explicitement ce qui est disponible et les tarifs avant tout paiement.

## 8. Transport et livraison
Le client peut choisir son transitaire personnel, un partenaire SS DROPSHIP ou un transporteur express adapté à sa destination (DHL, FedEx, UPS, Aramex si intégrations/contrats disponibles). Répertoire interne complet des transitaires réservé à l'Admin. Prévoir aérien, maritime LCL/FCL en phase ultérieure, transport local et suivi de bout en bout. Pour l'option transporteur libre, formulaire d'information et approbation.
AnKaTa peut être un partenaire de dernière étape; intégration API reportée, ne pas en faire une dépendance du MVP.
États traçables : devis, paiement, achat en cours, expédié fournisseur, reçu entrepôt, préparation, remis transporteur, en transit, douane, arrivé au pays, livré, incident.

## 9. Wallet et paiements
Méthodes envisagées : Mobile Money (selon pays), Ligdicash, MoneyFusion, PayPal, Visa/Mastercard, Stripe, Apple Pay, Google Pay, Alipay, WeChat Pay, virement, USDT TRON là où légalement et opérationnellement admis. **Ce sont des intégrations cibles, non des connexions prouvées.**
Confirmer le paiement via API/webhook sécurisé **avant crédit du wallet**. Ledger comptable à entrées traçables; idempotence, remboursements, frais, taux de change/commissions configurables et rapprochement quotidien. Éviter de stocker des données de carte. Les modalités et moyens disponibles changent selon les pays.

## 10. Autres fonctionnalités
Parrainage, favoris, notifications, actualités et promotions, support humain et chat, FAQ, langues FR/EN/TR/ES/ZH, devises et pays, statistiques utilisateur, services premium par photo/vidéo, options de confidentialité, thème clair/sombre si validé. La monétisation (abonnement SaaS, frais de service, publicité) doit rester paramétrable et être définitivement arbitrée.

## 11. Sécurité et conformité
Contrôle d'accès, authentification forte pour les administrateurs, vérification de téléphone/email, chiffrement, consentement de collecte, suppression/export des données selon exigences applicables, journal d'audit, protection anti-fraude, sauvegardes, supervision, limitation de tentatives, validation des webhooks, cloisonnement prestataires. Prévoir procédures de litiges, refus, retours et indemnisations approuvées par conseil juridique local.

## 12. Critères d'acceptation MVP
Un client peut s'inscrire avec code parrain, trouver ou demander un produit, obtenir une offre, payer, suivre une commande, recevoir un colis en entrepôt **non ouvert**, choisir un transporteur et obtenir une notification de livraison. Un administrateur peut piloter ces opérations avec trace d'audit, sans double paiement ni informations personnelles exposées.

## 13. Points ouverts
Monétisation exacte, frais et taux par pays, contrats fournisseurs/transitaires, disponibilité officielle des moyens de paiement, accès APIs logistiques, politique retours et couverture juridique multi-pays, niveau final de personnalisation navigation. Ne pas présenter ces choix comme finalisés.
