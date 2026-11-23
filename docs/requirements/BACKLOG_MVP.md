# SS DROPSHIP — Backlog du MVP

**Version : 23 novembre 2026 · Phase 2 de la [procédure](../equipe/PROCEDURE_EQUIPE.md) · Statut : **validé** par le propriétaire le 23/11/2026 (porte de la phase 2, D-025).**
Sources : [cahier des charges](CAHIER_DES_CHARGES.md), [registre des décisions](../decisions/REGISTRE_DECISIONS.md)
(D-001 à D-024), [arbitrages de la phase 1](../decisions/ARBITRAGES_PHASE1.md).

## Lecture

- Chaque story a un identifiant `US-<épopée>-<n°>`, une priorité **MoSCoW** (`Must` indispensable au lancement,
  `Should` important, `Could` si le temps le permet, `Won't` hors MVP), un **sprint** (S0 à S12) et un rôle.
- Les critères d'acceptation suivent la forme **Étant donné… quand… alors…** et servent directement de cas de test.
- Pays de lancement : **Mali** (D-021). Devise **FCFA (XOF)**, indicatif **+223** par défaut, langue **français** ;
  l'anglais arrive en S9. Tout ce qui dépend du pays (devise, indicatif, moyens de paiement, transporteurs) est paramétrable
  pour ouvrir ensuite la Côte d'Ivoire, la Guinée et le Ghana sans réécriture.
- Montants : entiers en FCFA (pas de centimes) ; taux et frais lus dans les paramètres Admin (M-003), jamais en dur.

## Hypothèses (validées par D-025 le 23/11/2026)

| ID | Hypothèse | Pourquoi | Si refusée |
|---|---|---|---|
| H-01 | Tous les paiements passent par le **wallet** : le client recharge, puis paie depuis son solde | Un seul flux de confirmation par webhook, un seul ledger | Ajouter un paiement direct par commande (S6 + 1 sprint) |
| H-02 | Paiement en **deux temps** : (1) produit + frais de service + transport jusqu'à l'entrepôt à l'acceptation du devis ; (2) fret international après pesée à l'entrepôt | Le poids réel n'est connu qu'à la réception | Fret estimé payé d'avance, puis régularisation |
| H-03 | Un seul **entrepôt partenaire** au lancement, en Chine (ville à confirmer) ; la liste reste paramétrable | Simplifier S7 | Plusieurs entrepôts dès S7 |
| H-04 | À l'arrivée à Bamako : **retrait au point SS DROPSHIP** ou **livraison locale** payée en supplément | Le cahier prévoit le transport local sans le détailler | Retrait uniquement au MVP |
| H-05 | Le solde « récompenses » du parrainage sert uniquement à payer des **frais de service** | Cohérent avec D-023 (non retirable) | Utilisable sur tout le montant |

---

## Machines à états

### Commande
```text
brouillon → devis_demandé → devis_proposé → devis_accepté → payée → achat_en_cours → expédiée_fournisseur
→ reçue_entrepôt → en_attente_paiement_fret → prête_à_expédier → remise_transporteur → en_transit → en_douane
→ arrivée_pays → disponible_retrait | en_livraison_locale → livrée
États latéraux : devis_expiré, annulée (avant achat_en_cours uniquement), incident (depuis tout état après payée),
litige (après livrée), remboursée.
```
Chaque transition est horodatée, attribuée à un acteur (client, agent, système) et inscrite au journal d'audit.

### Paiement (tentative de recharge)
```text
créée → en_attente_prestataire → confirmée (webhook signé valide) | échouée | expirée
Seul l'état « confirmée » crée une écriture de crédit au ledger. Un même identifiant d'événement ne crédite qu'une fois.
```

### Colis à l'entrepôt
```text
attendu → reçu (carton fermé) → mesuré → anomalie? → prêt → expédié
```

---

## E0 — Socle technique (S0)

#### US-SOC-01 — Monorepo et intégration continue
`Must` · `S0` · Équipe technique
En tant qu'équipe, je veux un monorepo TypeScript (D-024) avec une CI, afin que chaque changement soit vérifié automatiquement.
- Étant donné une pull request, quand elle est ouverte, alors la CI exécute installation, lint, vérification des types, tests et build.
- Étant donné une CI en échec, alors la fusion dans `main` est bloquée.

#### US-SOC-02 — Environnements séparés
`Must` · `S0` · DevOps
En tant qu'équipe, je veux des environnements dev, staging et production séparés, afin de tester sans risque.
- Étant donné une fusion dans `main`, quand la CI réussit, alors staging est déployé automatiquement.
- Étant donné le dépôt, alors il ne contient qu'un `.env.example` sans aucune valeur secrète.

#### US-SOC-03 — Modèle de données et contrat d'API v1
`Must` · `S0` · Architecte
En tant que développeur, je veux un schéma de base versionné et un contrat OpenAPI partagé, afin que web, mobile et API parlent la même langue.
- Étant donné les entités de l'architecture, quand les migrations sont jouées, alors toutes les tables existent avec des ID opaques.
- Étant donné le contrat OpenAPI, alors les types de `packages/types` en sont générés.

#### US-SOC-04 — Journal d'audit transverse
`Must` · `S0` · Architecte
En tant qu'administrateur, je veux que toute action sensible soit journalisée, afin de savoir qui a fait quoi (D-007).
- Étant donné une action sensible (changement d'état, paramètre, paiement, rôle), alors une entrée d'audit est créée avec acteur, date, objet, avant et après.
- Étant donné une entrée d'audit, alors elle ne peut être ni modifiée ni supprimée.

#### US-SOC-05 — Internationalisation et paramètres pays
`Must` · `S0` · Architecte
En tant qu'équipe, je veux que textes, devise, indicatif et moyens de paiement soient paramétrés par pays, afin d'ouvrir d'autres pays sans réécriture.
- Étant donné le pays « Mali », alors la devise par défaut est XOF, l'indicatif +223 et la langue le français.
- Étant donné un texte affiché, alors il provient d'une clé de traduction et non d'une chaîne en dur.

#### US-SOC-06 — Design tokens et composants de base
`Must` · `S0` · UI Designer / Front
En tant que client, je veux une interface fidèle à la charte, afin de reconnaître SS DROPSHIP.
- Étant donné les tokens, alors seules les couleurs #0077C8, #F21A16, #FFFFFF, #10213D, les neutres et le brun bogolan #6B3E26 sont définis ; aucun jaune.
- Étant donné un composant de base (bouton, champ, carte, onglet), alors il existe pour le web et le mobile et respecte le contraste WCAG AA.

#### US-SOC-07 — Observabilité
`Should` · `S0` · DevOps
En tant qu'équipe, je veux une remontée des erreurs et des journaux structurés, afin de détecter les incidents.
- Étant donné une erreur serveur en staging, alors elle apparaît dans l'outil de suivi avec sa trace, sans donnée personnelle.

---

## E1 — Comptes et parrainage (S1)

#### US-AUT-01 — Créer un compte avec code de parrainage facultatif
`Must` · `S1` · Client
En tant que visiteur, je veux créer un compte et saisir un code de parrainage si j'en ai un, afin d'accéder au service (D-005).
- Étant donné le formulaire, quand je saisis nom, téléphone (+223 par défaut) ou email, pays, mot de passe et confirmation, alors le compte est créé à l'état « à vérifier ».
- Étant donné un code de parrainage valide, quand je m'inscris, alors le lien parrain-filleul est enregistré.
- Étant donné un code invalide, alors un message l'indique et l'inscription reste possible sans code.
- Étant donné mon propre code ou un téléphone déjà inscrit, alors le parrainage est refusé (anti-fraude, D-023).

#### US-AUT-02 — Vérifier le téléphone ou l'email
`Must` · `S1` · Client
En tant que nouveau client, je veux confirmer mon contact par un code, afin de sécuriser mon compte.
- Étant donné un code à usage unique envoyé, quand je le saisis avant expiration, alors mon compte passe à « actif ».
- Étant donné 5 codes erronés, alors les tentatives sont bloquées 15 minutes.

#### US-AUT-03 — Se connecter
`Must` · `S1` · Client
En tant que client, je veux me connecter avec mon téléphone ou mon email et mon mot de passe, afin d'utiliser mon compte sur le site et l'application.
- Étant donné des identifiants valides, alors je suis connecté sur l'appareil et ma session est commune au site et à l'application (mêmes données).
- Étant donné des échecs répétés, alors une limitation de tentatives s'applique.

#### US-AUT-04 — Mot de passe oublié
`Must` · `S1` · Client
En tant que client, je veux réinitialiser mon mot de passe, afin de retrouver l'accès à mon compte.
- Étant donné ma demande, quand je saisis le code reçu et un nouveau mot de passe, alors l'ancien est invalidé et mes autres sessions sont fermées.

#### US-AUT-05 — Profil et adresses
`Must` · `S1` · Client
En tant que client, je veux gérer mon profil et mes adresses de livraison, afin d'être livré au bon endroit.
- Étant donné le profil, alors je peux modifier nom, langue et préférences de notification ; la modification du téléphone exige une nouvelle vérification.
- Étant donné une adresse au Mali, alors ville, quartier, repère et téléphone du destinataire sont demandés.

#### US-AUT-06 — Espace parrainage dans le compte
`Must` · `S1` · Client
En tant que client connecté, je veux voir mon code, le partager et suivre mes filleuls et récompenses, afin de profiter du programme (D-005, D-023).
- Étant donné l'onglet Compte, alors une entrée « Parrainage » affiche mon code, un lien de partage et un bouton copier.
- Étant donné mes filleuls, alors je vois leur nombre, les récompenses en attente et versées, sans voir leurs données personnelles.

#### US-AUT-07 — Rôles et permissions
`Must` · `S1` · Administrateur
En tant qu'administrateur, je veux attribuer des rôles (client, agent d'achat, agent entrepôt, support, comptable, administrateur), afin que chacun n'accède qu'à ce qui le concerne.
- Étant donné un utilisateur sans le rôle requis, quand il appelle une route protégée, alors l'accès est refusé (403) et la tentative est journalisée.
- Étant donné un compte administrateur, alors la double authentification est obligatoire.

#### US-AUT-08 — Supprimer ou exporter mes données
`Should` · `S1` · Client
En tant que client, je veux demander l'export ou la suppression de mes données, afin d'exercer mes droits.
- Étant donné une demande de suppression, alors le compte est désactivé et les données personnelles anonymisées, sauf les écritures financières conservées pour obligation légale.

---

## E2 — Catalogue et fournisseurs (S2)

#### US-CAT-01 — Accueil et catégories
`Must` · `S2` · Client
En tant que client, je veux voir les catégories (électronique, informatique, jeux vidéo, téléphones, réseau…) et les offres mises en avant, afin de trouver vite un produit.
- Étant donné l'accueil, alors catégories, produits mis en avant et promotions proviennent du back-office ; une catégorie vide n'est pas affichée.

#### US-CAT-02 — Rechercher par nom ou lien
`Must` · `S2` · Client
En tant que client, je veux rechercher par nom ou coller un lien de produit, afin de commander ce que je veux.
- Étant donné un nom, alors les produits correspondants s'affichent avec filtres par catégorie et prix.
- Étant donné un lien externe (Alibaba, 1688, Trendyol…), alors l'application propose de créer une demande en commande directe avec ce lien (US-DEM-01).

#### US-CAT-03 — Fiche produit
`Must` · `S2` · Client
En tant que client, je veux une fiche produit claire, afin de décider en confiance.
- Étant donné un produit, alors photos, variantes, prix indicatif en FCFA, origine, délai estimé et fournisseur validé sont affichés.
- Étant donné un prix indicatif, alors la mention « prix indicatif, confirmé par devis » est visible (pas de prix simulé non signalé).

#### US-CAT-04 — Favoris
`Must` · `S2` · Client
En tant que client, je veux ajouter un produit à mes favoris, afin de le retrouver plus tard.
- Étant donné un produit, quand je touche le cœur, alors il est ajouté à « Favoris » sur le site et l'application.

#### US-CAT-05 — Annuaire des fournisseurs
`Should` · `S2` · Client
En tant que client, je veux consulter les fournisseurs validés, filtrables par pays, catégorie et délai, afin de choisir où acheter.
- Étant donné un fournisseur non validé par l'Admin, alors il n'apparaît pas côté client.

#### US-CAT-06 — Gérer catalogue et fournisseurs
`Must` · `S2` · Administrateur
En tant qu'administrateur, je veux créer, modifier, valider et masquer produits, catégories et fournisseurs, afin de tenir le catalogue à jour.
- Étant donné une modification, alors elle est journalisée ; un fournisseur passe par l'état « à valider » avant d'être visible.

#### US-CAT-07 — Recherche par photo
`Could` · `S2` · Client
En tant que client, je veux chercher avec une photo, afin de trouver un produit dont je ne connais pas le nom.
- Étant donné une photo envoyée, alors une demande en mode « recherche de produit » est créée avec cette photo (traitement par un agent au MVP).

---

## E3 — Demandes : les trois modes (S3)

#### US-DEM-01 — Commande directe
`Must` · `S3` · Client
En tant que client qui connaît le produit, je veux envoyer un lien ou une référence avec quantité et variante, afin d'obtenir un devis (D-006).
- Étant donné un lien, une quantité et une variante, quand j'envoie, alors une demande « directe » est créée avec un identifiant unique et l'état « devis_demandé ».

#### US-DEM-02 — Recherche de produit
`Must` · `S3` · Client
En tant que client, je veux décrire ce que je cherche avec photos ou vidéo, afin qu'un agent trouve le produit (D-009).
- Étant donné une description et jusqu'à 5 photos ou 1 vidéo (taille limitée et paramétrable), alors une demande « recherche » est créée.
- Étant donné un fichier non autorisé (format ou taille), alors il est refusé avec un message clair.

#### US-DEM-03 — Recherche avec négociation
`Must` · `S3` · Client
En tant que client, je veux demander qu'un agent négocie avec plusieurs fournisseurs, afin d'obtenir le meilleur prix.
- Étant donné une demande « négociation » avec budget cible et quantité, alors elle est créée et les frais de service de ce mode sont affichés avant l'envoi.

#### US-DEM-04 — Suivre mes demandes
`Must` · `S3` · Client
En tant que client, je veux voir la liste et l'historique de mes demandes, afin de savoir où elles en sont.
- Étant donné une demande, alors son état, ses médias, ses messages et chaque changement d'état daté sont visibles.

#### US-DEM-05 — File de travail des agents
`Must` · `S3` · Agent d'achat
En tant qu'agent d'achat, je veux une file des demandes à traiter, filtrable par mode, ancienneté et pays, afin de répondre dans les délais.
- Étant donné une demande, quand je la prends en charge, alors elle m'est attribuée et le client voit « en cours de traitement ».

---

## E4 — Devis et négociation (S4)

#### US-DEV-01 — Proposer un ou plusieurs devis
`Must` · `S4` · Agent d'achat
En tant qu'agent, je veux proposer une ou plusieurs offres par demande, afin que le client compare.
- Étant donné une offre, alors elle comprend fournisseur, prix unitaire, quantité, devise d'origine, taux appliqué, montant en FCFA, frais de service, transport jusqu'à l'entrepôt, délai et durée de validité.
- Étant donné l'envoi, alors la demande passe à « devis_proposé » et le client est notifié.

#### US-DEV-02 — Comparer et accepter un devis
`Must` · `S4` · Client
En tant que client, je veux comparer les offres côte à côte et en accepter une, afin de passer commande.
- Étant donné plusieurs offres, alors elles s'affichent comparées par prix total, délai et fournisseur.
- Étant donné une offre acceptée, alors la commande passe à « devis_accepté » et les autres offres sont closes.
- Étant donné un devis expiré, alors il ne peut plus être accepté et passe à « devis_expiré ».

#### US-DEV-03 — Discuter un devis
`Should` · `S4` · Client
En tant que client, je veux poser une question ou demander une révision sur une offre, afin de l'ajuster.
- Étant donné un message sur un devis, alors l'agent est notifié et peut publier une nouvelle version ; l'historique des versions est conservé.

#### US-DEV-04 — Calcul du devis à partir des paramètres
`Must` · `S4` · Système
En tant que propriétaire, je veux que frais de service et change soient calculés à partir des tables Admin, afin d'éviter les erreurs (M-003, D-022).
- Étant donné un taux de frais par mode et un minimum en FCFA, alors les frais = max(taux × montant produit, minimum).
- Étant donné un devis émis, alors le taux de change et les frais utilisés sont figés et historisés avec lui.

---

## E5 — Panier et commandes (S5)

#### US-CMD-01 — Panier et liste de souhaits distincts
`Must` · `S5` · Client
En tant que client, je veux un panier pour les produits prêts à commander et une liste de souhaits séparée, afin de m'organiser.
- Étant donné un produit du catalogue, alors je peux l'ajouter au panier ou à la liste de souhaits ; le panier crée une demande « directe » groupée.

#### US-CMD-02 — Payer la commande depuis le wallet
`Must` · `S5` · Client
En tant que client, je veux payer un devis accepté avec mon solde, afin de lancer l'achat (H-01, H-02).
- Étant donné un solde suffisant, quand je confirme, alors le montant est débité au ledger et la commande passe à « payée ».
- Étant donné un solde insuffisant, alors le montant manquant est affiché avec un bouton « Recharger ».
- Étant donné un double appui ou une requête rejouée, alors un seul débit est effectué (idempotence).

#### US-CMD-03 — Suivi de commande
`Must` · `S5` · Client
En tant que client, je veux une frise de suivi de ma commande, afin de savoir où elle en est.
- Étant donné une commande, alors chaque état de la machine à états s'affiche avec sa date ; l'état courant est mis en avant.

#### US-CMD-04 — Mise à jour des états d'achat
`Must` · `S5` · Agent d'achat
En tant qu'agent, je veux passer une commande à « achat_en_cours » puis « expédiée_fournisseur » avec le numéro de suivi fournisseur, afin d'informer le client.
- Étant donné une transition non autorisée par la machine à états, alors elle est refusée.
- Étant donné le passage à « expédiée_fournisseur », alors un colis « attendu » est créé à l'entrepôt (US-ENT-01).

#### US-CMD-05 — Factures et reçus
`Must` · `S5` · Client
En tant que client, je veux télécharger la facture et les reçus de paiement, afin de garder une preuve.
- Étant donné une commande payée, alors une facture PDF numérotée, avec le détail produit, frais et taux, est téléchargeable.

#### US-CMD-06 — Annuler avant achat
`Must` · `S5` · Client
En tant que client, je veux annuler une commande tant que l'achat n'a pas commencé, afin de changer d'avis.
- Étant donné une commande « payée » non encore en « achat_en_cours », quand j'annule, alors le montant est recrédité au wallet par une écriture de remboursement.
- Étant donné une commande en « achat_en_cours » ou après, alors l'annulation directe n'est plus proposée (passage par le support).

#### US-CMD-07 — Avis après livraison
`Could` · `S5` · Client
En tant que client, je veux noter une commande livrée, afin de partager mon expérience.
- Étant donné une commande non livrée, alors aucun avis n'est possible (pas de faux avis).

---

## E6 — Wallet et paiements (S6)

#### US-WAL-01 — Voir mon solde et mes opérations
`Must` · `S6` · Client
En tant que client, je veux voir mon solde en FCFA, mon solde « récompenses » et l'historique de mes opérations, afin de suivre mon argent.
- Étant donné le wallet, alors le solde affiché est la somme des écritures du ledger et non un champ modifiable.

#### US-WAL-02 — Recharger par Mobile Money
`Must` · `S6` · Client
En tant que client au Mali, je veux recharger mon wallet par Orange Money ou Moov Money, afin de payer mes commandes (D-021, M-004).
- Étant donné un montant entre le minimum et le maximum paramétrés, quand je valide, alors une tentative de paiement « en_attente_prestataire » est créée et je suis redirigé vers le prestataire.
- Étant donné le retour sur l'application, alors le solde **n'est pas crédité** tant que le webhook n'est pas reçu ; l'écran affiche « Paiement en cours de confirmation ».
- Étant donné un moyen non disponible dans mon pays, alors il n'est pas proposé.

#### US-WAL-03 — Confirmer le paiement par webhook
`Must` · `S6` · Système
En tant que propriétaire, je veux que seul un webhook authentifié crédite le wallet, afin d'empêcher toute fraude (D-008).
- Étant donné un webhook à signature valide pour une tentative en attente, alors une écriture de crédit est créée et la tentative passe à « confirmée ».
- Étant donné une signature invalide ou un horodatage trop ancien, alors le webhook est rejeté, journalisé et aucune écriture n'est créée.
- Étant donné un webhook rejoué avec le même identifiant d'événement, alors aucun second crédit n'a lieu.
- Étant donné un montant reçu différent du montant attendu, alors la tentative passe en « anomalie » pour revue par le comptable.

#### US-WAL-04 — Interface prestataire de paiement
`Must` · `S6` · Architecte
En tant qu'équipe, je veux une interface `PaymentProvider` (créer un paiement, vérifier un webhook, rembourser), afin de changer de prestataire sans toucher au reste.
- Étant donné l'implémentation sandbox, alors elle est nommée et signalée comme telle et ne peut pas être activée en production.

#### US-WAL-05 — Ledger immuable
`Must` · `S6` · Backend
En tant que comptable, je veux un journal en écriture seule, afin que chaque franc soit traçable.
- Étant donné une écriture, alors elle ne peut être ni modifiée ni supprimée ; une correction se fait par une écriture inverse.
- Étant donné l'ensemble des écritures d'un compte, alors leur somme est égale au solde affiché.

#### US-WAL-06 — Rapprochement quotidien
`Must` · `S6` · Comptable
En tant que comptable, je veux un rapport quotidien comparant le ledger aux relevés du prestataire, afin de détecter les écarts.
- Étant donné un écart, alors il est listé avec la référence de transaction et une alerte est envoyée.

#### US-WAL-07 — Récompenses de parrainage
`Must` · `S6` · Système
En tant que parrain, je veux recevoir automatiquement ma récompense, afin d'être récompensé pour mes filleuls (D-023).
- Étant donné une commande d'un filleul passée à « livrée » dans les 12 mois suivant son inscription, alors une récompense = taux paramétré (5 % par défaut) × frais de service payés est créditée au solde « récompenses ».
- Étant donné une commande annulée ou remboursée, alors aucune récompense n'est versée, ou elle est contrepassée.
- Étant donné le plafond mensuel atteint, alors les récompenses suivantes sont mises en attente de revue.

#### US-WAL-08 — Remboursement vers Mobile Money
`Should` · `S6` · Comptable
En tant que comptable, je veux rembourser un client sur son Mobile Money après validation, afin de traiter les litiges.
- Étant donné une demande approuvée par deux personnes habilitées, alors le remboursement est initié par le prestataire et le débit wallet n'est confirmé qu'au webhook de succès.

---

## E7 — Entrepôt : carton fermé (S7)

#### US-ENT-01 — Colis attendus
`Must` · `S7` · Agent entrepôt
En tant qu'agent entrepôt, je veux la liste des colis attendus avec client, commande et numéro de suivi fournisseur, afin de préparer la réception.
- Étant donné une commande « expédiée_fournisseur », alors un colis « attendu » apparaît avec son identifiant unique.

#### US-ENT-02 — Réceptionner un carton fermé
`Must` · `S7` · Agent entrepôt
En tant qu'agent entrepôt, je veux enregistrer la réception d'un colis **sans l'ouvrir**, afin de respecter la règle du MVP (D-010).
- Étant donné un colis reçu, alors je saisis date, transporteur, photos **de l'extérieur**, poids, dimensions (volume calculé), état extérieur, emplacement et anomalies.
- Étant donné le formulaire de réception, alors aucun champ ni bouton ne permet d'enregistrer une ouverture ou des photos du contenu.
- Étant donné la réception validée, alors la commande passe à « reçue_entrepôt » et le client est notifié avec les photos extérieures.

#### US-ENT-03 — Signaler une anomalie
`Must` · `S7` · Agent entrepôt
En tant qu'agent entrepôt, je veux signaler un carton abîmé, mouillé ou d'un poids incohérent, afin de protéger le client.
- Étant donné une anomalie, alors la commande passe à « incident », le client et le support sont notifiés.

#### US-ENT-04 — Mes colis à l'entrepôt
`Must` · `S7` · Client
En tant que client, je veux voir mes colis par état (attendus, reçus, prêts, expédiés) avec poids, dimensions et photos extérieures, afin de suivre ma marchandise.
- Étant donné un colis reçu, alors les jours de stockage gratuits restants sont affichés (paramètre M-003).

#### US-ENT-05 — Options avancées affichées mais désactivées
`Must` · `S7` · Client
En tant que client, je veux voir les services futurs clairement marqués, afin de savoir ce qui est disponible (D-011).
- Étant donné les options inspection, photo ou vidéo du contenu, regroupement et reconditionnement, alors elles sont affichées « Bientôt disponible », sans prix et avec un bouton désactivé.
- Étant donné un appel direct à l'API pour commander l'une d'elles, alors il est refusé.

---

## E8 — Transport et livraison (S8)

#### US-TRA-01 — Choisir le mode d'expédition
`Must` · `S8` · Client
En tant que client, je veux choisir entre le partenaire SS DROPSHIP, mon transitaire personnel ou un transporteur express, afin d'adapter coût et délai (D-012).
- Étant donné un colis « reçu_entrepôt », alors les options disponibles pour Bamako s'affichent avec prix calculé (poids réel ou volumétrique, le plus élevé) et délai.
- Étant donné une option sans contrat actif, alors elle n'est pas proposée.

#### US-TRA-02 — Transitaire personnel
`Must` · `S8` · Client
En tant que client, je veux indiquer mon propre transitaire, afin de garder mes habitudes.
- Étant donné le formulaire (nom, contact, adresse de dépôt), alors la demande passe en « à approuver » par l'Admin avant toute remise.

#### US-TRA-03 — Payer le fret international
`Must` · `S8` · Client
En tant que client, je veux payer le fret depuis mon wallet, afin que mon colis parte (H-02).
- Étant donné le paiement du fret, alors la commande passe à « prête_à_expédier ».
- Étant donné un colis non payé après le délai de stockage gratuit, alors les frais de stockage s'ajoutent et le client est prévenu.

#### US-TRA-04 — Mettre à jour le suivi
`Must` · `S8` · Coordinateur logistique
En tant que coordinateur, je veux enregistrer les étapes (remis transporteur, en transit, douane, arrivé au Mali) avec numéro de suivi, afin d'informer le client.
- Étant donné une étape, alors elle est horodatée, visible dans la frise du client et déclenche une notification.

#### US-TRA-05 — Retrait ou livraison locale à Bamako
`Must` · `S8` · Client
En tant que client, je veux choisir le retrait au point SS DROPSHIP ou la livraison à mon adresse, afin de recevoir mon colis (H-04).
- Étant donné le retrait, alors un code de retrait est envoyé et le colis n'est remis que sur présentation de ce code.
- Étant donné la remise, alors la commande passe à « livrée » avec date, agent et preuve (code ou signature).

#### US-TRA-06 — Répertoire des transitaires réservé à l'Admin
`Must` · `S8` · Administrateur
En tant qu'administrateur, je veux gérer le répertoire complet des transitaires et leurs tarifs, afin de piloter la logistique (D-013).
- Étant donné un client, alors il ne voit jamais le répertoire interne, seulement les options proposées.

#### US-TRA-07 — Intégration API d'un transporteur express
`Could` · `S8` · Backend
En tant que client, je veux un suivi automatique via l'API du transporteur, afin d'avoir des mises à jour en temps réel.
- Étant donné un contrat et un accès API confirmés, alors les événements sont importés via `CarrierProvider` ; sinon, le suivi reste manuel (US-TRA-04).

---

## E9 — Communication et support (S9)

#### US-COM-01 — Notifications
`Must` · `S9` · Client
En tant que client, je veux être notifié à chaque étape importante, afin de ne rien manquer.
- Étant donné un changement d'état de commande, de colis ou de paiement, alors une notification dans l'application et une notification push (ou SMS/email selon préférences) sont envoyées via `NotificationProvider`.

#### US-COM-02 — Chat flottant avec le support
`Must` · `S9` · Client
En tant que client, je veux un bouton de discussion accessible partout, afin de poser une question rapidement.
- Étant donné un message, alors il crée ou alimente un ticket visible par le support, avec la commande liée si je suis sur sa page.

#### US-COM-03 — Tickets et litiges
`Must` · `S9` · Support
En tant qu'agent support, je veux traiter les tickets par priorité et ouvrir un litige sur une commande livrée, afin de résoudre les problèmes.
- Étant donné un litige, alors les preuves (photos extérieures, poids à la réception et à la livraison) sont jointes automatiquement.

#### US-COM-04 — FAQ
`Should` · `S9` · Client
En tant que client, je veux une FAQ (paiement, délais, douane, carton non ouvert, parrainage), afin de trouver une réponse seul.
- Étant donné la FAQ, alors son contenu est géré depuis le back-office.

#### US-COM-05 — Langue anglaise
`Should` · `S9` · Client
En tant que client anglophone, je veux utiliser l'application en anglais, afin de préparer l'ouverture du Ghana (D-015, D-021).
- Étant donné la langue anglaise choisie, alors tous les écrans MVP sont traduits ; un texte manquant retombe sur le français, jamais sur une clé brute.

#### US-COM-06 — Langues TR, ES, ZH
`Won't` · `S12` · Client
En tant que client, je veux le turc, l'espagnol et le chinois, afin d'utiliser ma langue.
- Étant donné le MVP, alors ces langues sont préparées (clés) mais pas publiées avant relecture par des natifs.

---

## E10 — Administration et audit (S10)

#### US-ADM-01 — Tableau de bord
`Must` · `S10` · Administrateur
En tant qu'administrateur, je veux un tableau de bord des demandes, commandes, colis, paiements et tickets, afin de piloter l'activité.
- Étant donné le tableau de bord, alors les compteurs par état et les éléments en retard (devis non répondus, colis bloqués) sont visibles.

#### US-ADM-02 — Paramètres tarifaires
`Must` · `S10` · Administrateur
En tant qu'administrateur, je veux gérer frais de service, fret, change, seuils de recharge et stockage, afin d'ajuster la tarification (M-003).
- Étant donné une modification, alors elle s'applique aux nouveaux devis seulement et est journalisée avec l'ancienne valeur.

#### US-ADM-03 — Paramètres du parrainage et de l'abonnement
`Must` · `S10` · Administrateur
En tant qu'administrateur, je veux régler taux, durée et plafond du parrainage, et préparer l'abonnement « Pro » désactivé, afin d'appliquer D-022 et D-023.
- Étant donné l'abonnement « Pro », alors il reste désactivé côté client tant que l'Admin ne l'active pas.

#### US-ADM-04 — Consulter le journal d'audit
`Must` · `S10` · Administrateur
En tant qu'administrateur, je veux rechercher dans le journal d'audit par objet, acteur et date, afin de reconstituer un événement.
- Étant donné une commande, alors toutes ses actions sont listées dans l'ordre chronologique.

#### US-ADM-05 — Gérer les utilisateurs
`Must` · `S10` · Administrateur
En tant qu'administrateur, je veux rechercher, suspendre et changer le rôle d'un utilisateur, afin de gérer les accès.
- Étant donné une suspension, alors les sessions actives sont fermées et l'action est journalisée.

#### US-ADM-06 — Rapports
`Should` · `S10` · Administrateur
En tant que propriétaire, je veux des rapports (chiffre d'affaires, frais encaissés, délais moyens, inscriptions et parrainages), afin de suivre les indicateurs.
- Étant donné une période, alors le rapport est exportable en CSV.

#### US-ADM-07 — Contenus
`Should` · `S10` · Administrateur
En tant qu'administrateur, je veux gérer actualités, promotions et bannières, afin d'animer l'accueil.
- Étant donné une promotion, alors elle a une date de début et de fin et disparaît automatiquement.

---

## E11 — Qualité et lancement (S11–S12)

#### US-QUA-01 — Tests de bout en bout des parcours critiques
`Must` · `S11` · QA
En tant qu'équipe, je veux des tests automatisés des 6 parcours critiques, afin d'éviter les régressions.
- Étant donné la CI, alors les parcours inscription avec parrainage, demande → devis → paiement, webhook (valide, invalide, rejoué), réception d'un carton fermé, transport → livraison et contrôle d'accès Admin passent.

#### US-QUA-02 — Audit de sécurité
`Must` · `S11` · Sécurité
En tant que propriétaire, je veux un test d'intrusion avant l'ouverture, afin de protéger clients et argent.
- Étant donné le rapport, alors aucune vulnérabilité critique ou élevée n'est ouverte au lancement.

#### US-QUA-03 — Performance sur réseau lent
`Must` · `S11` · QA
En tant que client au Mali, je veux une application utilisable en 3G sur un Android d'entrée de gamme, afin de ne pas abandonner.
- Étant donné un réseau 3G simulé, alors l'accueil s'affiche en moins de 3 secondes et les images sont compressées.

#### US-QUA-04 — Accessibilité
`Should` · `S11` · QA
En tant que client, je veux une interface lisible et utilisable au clavier et avec un lecteur d'écran, afin d'être autonome.
- Étant donné l'audit WCAG AA des écrans MVP, alors aucune anomalie bloquante ne reste ouverte.

#### US-LAN-01 — Documents légaux
`Must` · `S12` · Juriste
En tant que propriétaire, je veux des CGU, CGV et une politique de confidentialité validées pour le Mali, afin d'ouvrir légalement (M-007).
- Étant donné l'inscription, alors l'acceptation des CGU et de la politique est obligatoire et horodatée.

#### US-LAN-02 — Bêta fermée et publication sur les stores
`Must` · `S12` · Chef de projet
En tant que propriétaire, je veux une bêta fermée puis la publication sur l'App Store et Google Play, afin d'ouvrir progressivement.
- Étant donné la bêta, alors 30 à 50 testeurs au Mali réalisent au moins une commande complète avant le Go / No-Go.

#### US-LAN-03 — Plan de retour arrière
`Must` · `S12` · DevOps
En tant qu'équipe, je veux pouvoir revenir à la version précédente en moins de 15 minutes, afin de limiter l'impact d'un incident.
- Étant donné un déploiement en production, alors la procédure de retour arrière a été testée en staging.

---

## Hors MVP (`Won't`, prévus en V2 — D-011, D-014)

#### US-V2-01 — Inspection et contrôle qualité du contenu
`Won't` · `S12` · Client
En tant que client, je veux faire inspecter le contenu de mon colis, afin de vérifier la conformité.
- Étant donné le MVP, alors l'option reste « Bientôt disponible » et non commandable (US-ENT-05).

#### US-V2-02 — Photos et vidéos du contenu
`Won't` · `S12` · Client
En tant que client, je veux des photos et vidéos de mon produit avant expédition, afin d'être rassuré.
- Étant donné le MVP, alors l'option reste « Bientôt disponible » et non commandable.

#### US-V2-03 — Regroupement et reconditionnement
`Won't` · `S12` · Client
En tant que client, je veux regrouper plusieurs colis et les reconditionner, afin de payer moins de fret.
- Étant donné le MVP, alors l'option reste « Bientôt disponible » et non commandable.

#### US-V2-04 — Maritime LCL / FCL, AnKaTa, fidélité VIP
`Won't` · `S12` · Client
En tant que client, je veux le maritime, la livraison AnKaTa et un programme de fidélité, afin d'avoir plus de choix.
- Étant donné le MVP, alors ces fonctions ne sont pas développées ; leurs écrans restent dans les maquettes.

---

## Récapitulatif par sprint

| Sprint | Épopée | Stories `Must` | Autres |
|---|---|---|---|
| S0 | Socle | SOC-01 à 06 | SOC-07 |
| S1 | Comptes et parrainage | AUT-01 à 07 | AUT-08 |
| S2 | Catalogue | CAT-01 à 04, 06 | CAT-05, CAT-07 |
| S3 | Demandes | DEM-01 à 05 | — |
| S4 | Devis | DEV-01, 02, 04 | DEV-03 |
| S5 | Commandes | CMD-01 à 06 | CMD-07 |
| S6 | Wallet | WAL-01 à 07 | WAL-08 |
| S7 | Entrepôt | ENT-01 à 05 | — |
| S8 | Transport | TRA-01 à 06 | TRA-07 |
| S9 | Communication | COM-01 à 03 | COM-04, 05 ; COM-06 (`Won't`) |
| S10 | Administration | ADM-01 à 05 | ADM-06, 07 |
| S11 | Qualité | QUA-01 à 03 | QUA-04 |
| S12 | Lancement | LAN-01 à 03 | V2-01 à 04 (`Won't`) |

## Dépendances externes par sprint

| Avant | Il faut | Responsable |
|---|---|---|
| S1 | Fournisseur d'envoi de SMS au Mali (codes de vérification) | Responsable paiements / Tech Lead |
| S4 | Valeurs initiales du barème : taux de frais, minimum en FCFA (M-003) | Propriétaire |
| S6 | Contrat et accès sandbox d'un agrégateur Orange Money / Moov Money au Mali (M-004) | Responsable paiements |
| S7 | Entrepôt partenaire et sa procédure de réception (H-03) | Responsable entrepôt |
| S8 | Tarifs aérien Chine → Bamako et point de retrait à Bamako (H-04) | Coordinateur logistique |
| S12 | CGU, CGV et confidentialité validées par un avocat au Mali (M-007) ; comptes développeur Apple et Google | Juriste / Chef de projet |
