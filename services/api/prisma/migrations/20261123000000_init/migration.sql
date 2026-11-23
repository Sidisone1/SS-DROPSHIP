-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'agent_achat', 'agent_entrepot', 'logistique', 'support', 'comptable', 'admin');

-- CreateEnum
CREATE TYPE "EtatCompte" AS ENUM ('a_verifier', 'actif', 'suspendu', 'supprime');

-- CreateEnum
CREATE TYPE "ObjetVerification" AS ENUM ('telephone', 'email', 'mot_de_passe');

-- CreateEnum
CREATE TYPE "EtatRecompense" AS ENUM ('versee', 'en_revue', 'refusee', 'contrepassee');

-- CreateEnum
CREATE TYPE "EtatValidation" AS ENUM ('a_valider', 'valide', 'masque');

-- CreateEnum
CREATE TYPE "ModeDemande" AS ENUM ('directe', 'recherche', 'negociation');

-- CreateEnum
CREATE TYPE "EtatOffre" AS ENUM ('proposee', 'acceptee', 'close', 'expiree');

-- CreateEnum
CREATE TYPE "EtatCommande" AS ENUM ('brouillon', 'devis_demande', 'devis_propose', 'devis_accepte', 'devis_expire', 'payee', 'achat_en_cours', 'expediee_fournisseur', 'recue_entrepot', 'en_attente_paiement_fret', 'prete_a_expedier', 'remise_transporteur', 'en_transit', 'en_douane', 'arrivee_pays', 'disponible_retrait', 'en_livraison_locale', 'livree', 'annulee', 'incident', 'litige', 'remboursee');

-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('client_principal', 'client_recompenses', 'systeme_prestataire', 'systeme_revenus_frais', 'systeme_fournisseurs_a_payer', 'systeme_transport_a_payer', 'systeme_charge_parrainage');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('recharge', 'paiement_commande', 'paiement_fret', 'frais_stockage', 'livraison_locale', 'remboursement', 'recompense_parrainage', 'correction');

-- CreateEnum
CREATE TYPE "EtatPaiement" AS ENUM ('creee', 'en_attente_prestataire', 'confirmee', 'echouee', 'expiree', 'anomalie');

-- CreateEnum
CREATE TYPE "EtatColis" AS ENUM ('attendu', 'recu', 'mesure', 'anomalie', 'pret', 'expedie');

-- CreateEnum
CREATE TYPE "TypeTransporteur" AS ENUM ('partenaire', 'transitaire_client', 'express');

-- CreateEnum
CREATE TYPE "ModeRemise" AS ENUM ('retrait_point', 'livraison_locale');

-- CreateEnum
CREATE TYPE "EtatTicket" AS ENUM ('ouvert', 'en_cours', 'attente_client', 'resolu', 'ferme');

-- CreateTable
CREATE TABLE "Pays" (
    "code" CHAR(2) NOT NULL,
    "nom" TEXT NOT NULL,
    "deviseParDefaut" CHAR(3) NOT NULL,
    "indicatif" TEXT NOT NULL,
    "langueParDefaut" VARCHAR(5) NOT NULL,
    "ouvert" BOOLEAN NOT NULL DEFAULT false,
    "moyensPaiement" JSONB NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pays_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "motDePasseHash" TEXT NOT NULL,
    "paysCode" CHAR(2) NOT NULL,
    "langue" VARCHAR(5) NOT NULL DEFAULT 'fr',
    "etat" "EtatCompte" NOT NULL DEFAULT 'a_verifier',
    "roles" "Role"[] DEFAULT ARRAY['client']::"Role"[],
    "mfaActive" BOOLEAN NOT NULL DEFAULT false,
    "cguAccepteesLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,
    "supprimeLe" TIMESTAMP(3),

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "jetonHash" TEXT NOT NULL,
    "appareil" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "revoqueLe" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeVerification" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "objet" "ObjetVerification" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "tentatives" INTEGER NOT NULL DEFAULT 0,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "utiliseLe" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeParrainage" (
    "code" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeParrainage_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Parrainage" (
    "id" TEXT NOT NULL,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT NOT NULL,
    "codeUtilise" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parrainage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecompenseParrainage" (
    "id" TEXT NOT NULL,
    "parrainageId" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "montant" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "tauxPb" INTEGER NOT NULL,
    "etat" "EtatRecompense" NOT NULL,
    "transactionId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecompenseParrainage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adresse" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "paysCode" CHAR(2) NOT NULL,
    "ville" TEXT NOT NULL,
    "quartier" TEXT NOT NULL,
    "repere" TEXT,
    "telephoneDestinataire" TEXT NOT NULL,
    "parDefaut" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adresse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "paysOrigine" CHAR(2) NOT NULL,
    "ville" TEXT,
    "categories" TEXT[],
    "delaiMoyenJours" INTEGER,
    "etat" "EtatValidation" NOT NULL DEFAULT 'a_valider',
    "contactInterne" JSONB,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cleLibelle" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "categorieId" TEXT NOT NULL,
    "fournisseurId" TEXT,
    "prixIndicatif" BIGINT,
    "devise" CHAR(3),
    "variantes" JSONB,
    "medias" TEXT[],
    "misEnAvant" BOOLEAN NOT NULL DEFAULT false,
    "etat" "EtatValidation" NOT NULL DEFAULT 'a_valider',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favori" (
    "utilisateurId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favori_pkey" PRIMARY KEY ("utilisateurId","produitId")
);

-- CreateTable
CREATE TABLE "LignePanier" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "variante" JSONB,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "LignePanier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Souhait" (
    "utilisateurId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Souhait_pkey" PRIMARY KEY ("utilisateurId","produitId")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agentId" TEXT,
    "mode" "ModeDemande" NOT NULL,
    "description" TEXT NOT NULL,
    "liens" TEXT[],
    "quantite" INTEGER NOT NULL,
    "variante" TEXT,
    "budgetCible" BIGINT,
    "deviseBudget" CHAR(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaDemande" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "cleStockage" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaDemande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offre" (
    "id" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "fournisseurId" TEXT,
    "prixUnitaireOrigine" BIGINT NOT NULL,
    "deviseOrigine" CHAR(3) NOT NULL,
    "quantite" INTEGER NOT NULL,
    "tauxChangeMicro" BIGINT NOT NULL,
    "margeChangePb" INTEGER NOT NULL,
    "montantProduit" BIGINT NOT NULL,
    "fraisService" BIGINT NOT NULL,
    "transportVersEntrepot" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "delaiJours" INTEGER NOT NULL,
    "valableJusquau" TIMESTAMP(3) NOT NULL,
    "etat" "EtatOffre" NOT NULL DEFAULT 'proposee',
    "creeParId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "demandeId" TEXT NOT NULL,
    "offreAccepteeId" TEXT,
    "etat" "EtatCommande" NOT NULL DEFAULT 'devis_demande',
    "totalProduit" BIGINT,
    "totalFrais" BIGINT,
    "devise" CHAR(3) NOT NULL,
    "suiviFournisseur" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementCommande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "depuis" "EtatCommande",
    "vers" "EtatCommande" NOT NULL,
    "acteurId" TEXT,
    "commentaire" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvenementCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "objet" TEXT NOT NULL,
    "montant" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "cleStockage" TEXT NOT NULL,
    "emiseLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompteWallet" (
    "id" TEXT NOT NULL,
    "type" "TypeCompte" NOT NULL,
    "utilisateurId" TEXT,
    "devise" CHAR(3) NOT NULL,
    "code" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompteWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionLedger" (
    "id" TEXT NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "cleIdempotence" TEXT NOT NULL,
    "commandeId" TEXT,
    "tentativeId" TEXT,
    "libelle" TEXT NOT NULL,
    "creeParId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcritureLedger" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "montant" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EcritureLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TentativePaiement" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "prestataire" TEXT NOT NULL,
    "moyen" TEXT NOT NULL,
    "montant" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "etat" "EtatPaiement" NOT NULL DEFAULT 'creee',
    "referencePrestataire" TEXT,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "majLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TentativePaiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementWebhook" (
    "id" TEXT NOT NULL,
    "prestataire" TEXT NOT NULL,
    "evenementId" TEXT,
    "tentativeId" TEXT,
    "signatureValide" BOOLEAN NOT NULL,
    "raisonRejet" TEXT,
    "corps" TEXT NOT NULL,
    "recuLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traiteLe" TIMESTAMP(3),

    CONSTRAINT "EvenementWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entrepot" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "pays" CHAR(2) NOT NULL,
    "ville" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Entrepot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colis" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "entrepotId" TEXT NOT NULL,
    "transporteurArrivee" TEXT,
    "suiviArrivee" TEXT,
    "etat" "EtatColis" NOT NULL DEFAULT 'attendu',
    "recuLe" TIMESTAMP(3),
    "recuParId" TEXT,
    "poidsGrammes" INTEGER,
    "longueurCm" INTEGER,
    "largeurCm" INTEGER,
    "hauteurCm" INTEGER,
    "etatExterieur" TEXT,
    "emplacement" TEXT,
    "anomalie" TEXT,
    "stockageGratuitJusquau" TIMESTAMP(3),
    "expeditionId" TEXT,

    CONSTRAINT "Colis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoColisExterieur" (
    "id" TEXT NOT NULL,
    "colisId" TEXT NOT NULL,
    "cleStockage" TEXT NOT NULL,
    "priseLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priseParId" TEXT NOT NULL,

    CONSTRAINT "PhotoColisExterieur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionService" (
    "code" TEXT NOT NULL,
    "cleLibelle" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OptionService_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Transporteur" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeTransporteur" NOT NULL,
    "contactInterne" JSONB,
    "contratActif" BOOLEAN NOT NULL DEFAULT false,
    "approuve" BOOLEAN NOT NULL DEFAULT false,
    "proposeParClientId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transporteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrilleFret" (
    "id" TEXT NOT NULL,
    "transporteurId" TEXT NOT NULL,
    "paysOrigine" CHAR(2) NOT NULL,
    "paysDestination" CHAR(2) NOT NULL,
    "mode" TEXT NOT NULL,
    "prixParKg" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "diviseurVolumetrique" INTEGER NOT NULL,
    "pasGrammes" INTEGER NOT NULL DEFAULT 500,
    "delaiJoursMin" INTEGER NOT NULL,
    "delaiJoursMax" INTEGER NOT NULL,
    "valableDepuis" TIMESTAMP(3) NOT NULL,
    "valableJusquau" TIMESTAMP(3),

    CONSTRAINT "GrilleFret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expedition" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "transporteurId" TEXT NOT NULL,
    "grilleId" TEXT,
    "poidsTaxableGrammes" INTEGER NOT NULL,
    "prixFret" BIGINT NOT NULL,
    "devise" CHAR(3) NOT NULL,
    "numeroSuivi" TEXT,
    "modeRemise" "ModeRemise",
    "pointRetraitId" TEXT,
    "adresseLivraisonId" TEXT,
    "codeRetraitHash" TEXT,
    "livreeLe" TIMESTAMP(3),
    "livreeParId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expedition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvenementSuivi" (
    "id" TEXT NOT NULL,
    "expeditionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "lieu" TEXT,
    "detail" TEXT,
    "source" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "saisiParId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvenementSuivi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointRetrait" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "pays" CHAR(2) NOT NULL,
    "ville" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "horaires" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PointRetrait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationEnvoyee" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "lue" BOOLEAN NOT NULL DEFAULT false,
    "referenceEnvoi" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationEnvoyee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "commandeId" TEXT,
    "categorie" TEXT NOT NULL,
    "priorite" INTEGER NOT NULL DEFAULT 2,
    "estLitige" BOOLEAN NOT NULL DEFAULT false,
    "etat" "EtatTicket" NOT NULL DEFAULT 'ouvert',
    "assigneId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTicket" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "pieces" TEXT[],
    "interne" BOOLEAN NOT NULL DEFAULT false,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleFaq" (
    "id" TEXT NOT NULL,
    "langue" VARCHAR(5) NOT NULL,
    "question" TEXT NOT NULL,
    "reponse" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "publie" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ArticleFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parametre" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "paysCode" CHAR(2),
    "valeur" JSONB NOT NULL,
    "valableDepuis" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifieParId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TauxChange" (
    "id" TEXT NOT NULL,
    "deviseSource" CHAR(3) NOT NULL,
    "deviseCible" CHAR(3) NOT NULL,
    "tauxMicro" BIGINT NOT NULL,
    "source" TEXT NOT NULL,
    "valableDepuis" TIMESTAMP(3) NOT NULL,
    "saisiParId" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TauxChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAudit" (
    "id" TEXT NOT NULL,
    "acteurId" TEXT,
    "roleActeur" TEXT,
    "action" TEXT NOT NULL,
    "objetType" TEXT NOT NULL,
    "objetId" TEXT NOT NULL,
    "avant" JSONB,
    "apres" JSONB,
    "ip" TEXT,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contenu" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "langue" VARCHAR(5) NOT NULL,
    "titre" TEXT NOT NULL,
    "corps" TEXT,
    "media" TEXT,
    "debutLe" TIMESTAMP(3) NOT NULL,
    "finLe" TIMESTAMP(3),
    "publie" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Contenu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_telephone_key" ON "Utilisateur"("telephone");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_jetonHash_key" ON "Session"("jetonHash");

-- CreateIndex
CREATE INDEX "Session_utilisateurId_idx" ON "Session"("utilisateurId");

-- CreateIndex
CREATE INDEX "CodeVerification_utilisateurId_objet_idx" ON "CodeVerification"("utilisateurId", "objet");

-- CreateIndex
CREATE UNIQUE INDEX "CodeParrainage_utilisateurId_key" ON "CodeParrainage"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Parrainage_filleulId_key" ON "Parrainage"("filleulId");

-- CreateIndex
CREATE INDEX "Parrainage_parrainId_idx" ON "Parrainage"("parrainId");

-- CreateIndex
CREATE UNIQUE INDEX "RecompenseParrainage_commandeId_key" ON "RecompenseParrainage"("commandeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecompenseParrainage_transactionId_key" ON "RecompenseParrainage"("transactionId");

-- CreateIndex
CREATE INDEX "Adresse_utilisateurId_idx" ON "Adresse"("utilisateurId");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_slug_key" ON "Categorie"("slug");

-- CreateIndex
CREATE INDEX "Produit_categorieId_etat_idx" ON "Produit"("categorieId", "etat");

-- CreateIndex
CREATE UNIQUE INDEX "LignePanier_utilisateurId_produitId_key" ON "LignePanier"("utilisateurId", "produitId");

-- CreateIndex
CREATE UNIQUE INDEX "Demande_reference_key" ON "Demande"("reference");

-- CreateIndex
CREATE INDEX "Demande_agentId_idx" ON "Demande"("agentId");

-- CreateIndex
CREATE INDEX "Demande_clientId_creeLe_idx" ON "Demande"("clientId", "creeLe");

-- CreateIndex
CREATE INDEX "Offre_demandeId_etat_idx" ON "Offre"("demandeId", "etat");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_reference_key" ON "Commande"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_demandeId_key" ON "Commande"("demandeId");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_offreAccepteeId_key" ON "Commande"("offreAccepteeId");

-- CreateIndex
CREATE INDEX "Commande_clientId_etat_idx" ON "Commande"("clientId", "etat");

-- CreateIndex
CREATE INDEX "Commande_etat_idx" ON "Commande"("etat");

-- CreateIndex
CREATE INDEX "EvenementCommande_commandeId_creeLe_idx" ON "EvenementCommande"("commandeId", "creeLe");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_numero_key" ON "Facture"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "CompteWallet_code_key" ON "CompteWallet"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CompteWallet_utilisateurId_type_devise_key" ON "CompteWallet"("utilisateurId", "type", "devise");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionLedger_cleIdempotence_key" ON "TransactionLedger"("cleIdempotence");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionLedger_tentativeId_key" ON "TransactionLedger"("tentativeId");

-- CreateIndex
CREATE INDEX "EcritureLedger_compteId_creeLe_idx" ON "EcritureLedger"("compteId", "creeLe");

-- CreateIndex
CREATE INDEX "TentativePaiement_etat_expireLe_idx" ON "TentativePaiement"("etat", "expireLe");

-- CreateIndex
CREATE UNIQUE INDEX "TentativePaiement_prestataire_referencePrestataire_key" ON "TentativePaiement"("prestataire", "referencePrestataire");

-- CreateIndex
CREATE UNIQUE INDEX "EvenementWebhook_prestataire_evenementId_key" ON "EvenementWebhook"("prestataire", "evenementId");

-- CreateIndex
CREATE UNIQUE INDEX "Colis_reference_key" ON "Colis"("reference");

-- CreateIndex
CREATE INDEX "Colis_entrepotId_etat_idx" ON "Colis"("entrepotId", "etat");

-- CreateIndex
CREATE UNIQUE INDEX "Transporteur_code_key" ON "Transporteur"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Expedition_commandeId_key" ON "Expedition"("commandeId");

-- CreateIndex
CREATE INDEX "EvenementSuivi_expeditionId_date_idx" ON "EvenementSuivi"("expeditionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationEnvoyee_cle_key" ON "NotificationEnvoyee"("cle");

-- CreateIndex
CREATE INDEX "NotificationEnvoyee_utilisateurId_lue_idx" ON "NotificationEnvoyee"("utilisateurId", "lue");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_reference_key" ON "Ticket"("reference");

-- CreateIndex
CREATE INDEX "Ticket_etat_priorite_idx" ON "Ticket"("etat", "priorite");

-- CreateIndex
CREATE INDEX "Parametre_cle_paysCode_valableDepuis_idx" ON "Parametre"("cle", "paysCode", "valableDepuis");

-- CreateIndex
CREATE INDEX "TauxChange_deviseSource_deviseCible_valableDepuis_idx" ON "TauxChange"("deviseSource", "deviseCible", "valableDepuis");

-- CreateIndex
CREATE INDEX "JournalAudit_objetType_objetId_creeLe_idx" ON "JournalAudit"("objetType", "objetId", "creeLe");

-- CreateIndex
CREATE INDEX "JournalAudit_acteurId_creeLe_idx" ON "JournalAudit"("acteurId", "creeLe");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_paysCode_fkey" FOREIGN KEY ("paysCode") REFERENCES "Pays"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeVerification" ADD CONSTRAINT "CodeVerification_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeParrainage" ADD CONSTRAINT "CodeParrainage_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parrainage" ADD CONSTRAINT "Parrainage_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parrainage" ADD CONSTRAINT "Parrainage_filleulId_fkey" FOREIGN KEY ("filleulId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecompenseParrainage" ADD CONSTRAINT "RecompenseParrainage_parrainageId_fkey" FOREIGN KEY ("parrainageId") REFERENCES "Parrainage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecompenseParrainage" ADD CONSTRAINT "RecompenseParrainage_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecompenseParrainage" ADD CONSTRAINT "RecompenseParrainage_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "TransactionLedger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adresse" ADD CONSTRAINT "Adresse_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adresse" ADD CONSTRAINT "Adresse_paysCode_fkey" FOREIGN KEY ("paysCode") REFERENCES "Pays"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LignePanier" ADD CONSTRAINT "LignePanier_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LignePanier" ADD CONSTRAINT "LignePanier_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souhait" ADD CONSTRAINT "Souhait_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Souhait" ADD CONSTRAINT "Souhait_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaDemande" ADD CONSTRAINT "MediaDemande_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementCommande" ADD CONSTRAINT "EvenementCommande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompteWallet" ADD CONSTRAINT "CompteWallet_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionLedger" ADD CONSTRAINT "TransactionLedger_tentativeId_fkey" FOREIGN KEY ("tentativeId") REFERENCES "TentativePaiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcritureLedger" ADD CONSTRAINT "EcritureLedger_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "TransactionLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcritureLedger" ADD CONSTRAINT "EcritureLedger_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "CompteWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TentativePaiement" ADD CONSTRAINT "TentativePaiement_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementWebhook" ADD CONSTRAINT "EvenementWebhook_tentativeId_fkey" FOREIGN KEY ("tentativeId") REFERENCES "TentativePaiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_entrepotId_fkey" FOREIGN KEY ("entrepotId") REFERENCES "Entrepot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colis" ADD CONSTRAINT "Colis_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoColisExterieur" ADD CONSTRAINT "PhotoColisExterieur_colisId_fkey" FOREIGN KEY ("colisId") REFERENCES "Colis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrilleFret" ADD CONSTRAINT "GrilleFret_transporteurId_fkey" FOREIGN KEY ("transporteurId") REFERENCES "Transporteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_transporteurId_fkey" FOREIGN KEY ("transporteurId") REFERENCES "Transporteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expedition" ADD CONSTRAINT "Expedition_pointRetraitId_fkey" FOREIGN KEY ("pointRetraitId") REFERENCES "PointRetrait"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvenementSuivi" ADD CONSTRAINT "EvenementSuivi_expeditionId_fkey" FOREIGN KEY ("expeditionId") REFERENCES "Expedition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationEnvoyee" ADD CONSTRAINT "NotificationEnvoyee_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTicket" ADD CONSTRAINT "MessageTicket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
