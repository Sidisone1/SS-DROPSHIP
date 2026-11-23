// Interfaces des prestataires externes (ADR-003). Le reste de l'application ne connaît que ces contrats :
// changer d'agrégateur de paiement ou de transporteur ne touche que l'adaptateur concerné.
// Aucune implémentation réelle n'est livrée ici ; une implémentation « sandbox » doit le dire dans son `code`.

import type { Devise, Montant } from './montants.ts';

export type CodePays = 'ML' | 'CI' | 'GN' | 'GH';

// ─── Paiement ────────────────────────────────────────────────────────────────

export type MoyenPaiement = 'orange_money' | 'moov_money' | 'mtn_momo' | 'wave' | 'carte' | 'virement';

export interface DemandePaiement {
  /** Identifiant opaque SS DROPSHIP de la tentative, transmis au prestataire et clé d'idempotence. */
  readonly tentativeId: string;
  readonly montant: Montant;
  readonly moyen: MoyenPaiement;
  readonly pays: CodePays;
  readonly telephoneClient?: string;
  readonly urlRetour: string;
  readonly urlNotification: string;
  readonly description: string;
}

export interface PaiementCree {
  readonly referencePrestataire: string;
  /** Page du prestataire où le client valide le paiement. */
  readonly urlPaiement: string;
  readonly expireLe: Date;
}

/** Requête webhook brute : le corps doit rester intact pour vérifier la signature. */
export interface WebhookBrut {
  readonly entetes: Readonly<Record<string, string>>;
  readonly corps: string;
  readonly recuLe: Date;
}

export type ResultatWebhook =
  | {
      readonly valide: true;
      /** Identifiant unique de l'événement chez le prestataire : garantit qu'un rejeu ne crédite pas deux fois. */
      readonly evenementId: string;
      readonly tentativeId: string;
      readonly statut: 'succes' | 'echec';
      readonly montant: Montant;
    }
  | { readonly valide: false; readonly raison: 'signature' | 'horodatage' | 'format' };

export interface PaymentProvider {
  /** Code stable, ex. « cinetpay », « orange_money_ml ». Une implémentation de test commence par « sandbox_ ». */
  readonly code: string;
  readonly estSandbox: boolean;
  moyensDisponibles(pays: CodePays, devise: Devise): readonly MoyenPaiement[];
  creerPaiement(demande: DemandePaiement): Promise<PaiementCree>;
  /** Vérifie signature et horodatage. Ne modifie aucun solde : le crédit est fait par le service wallet. */
  verifierWebhook(requete: WebhookBrut): Promise<ResultatWebhook>;
  /** Interroge le prestataire (rapprochement, ou webhook manquant). */
  consulterStatut(referencePrestataire: string): Promise<'en_attente' | 'succes' | 'echec' | 'inconnu'>;
  rembourser(args: { referencePrestataire: string; montant: Montant; motif: string }): Promise<{ referenceRemboursement: string }>;
}

// ─── Transport ───────────────────────────────────────────────────────────────

export interface ColisATransporter {
  readonly poidsGrammes: number;
  readonly dimensionsCm: { readonly longueur: number; readonly largeur: number; readonly hauteur: number };
  readonly origine: { readonly pays: string; readonly ville: string };
  readonly destination: { readonly pays: CodePays; readonly ville: string };
}

export interface OffreTransport {
  readonly transporteurCode: string;
  readonly mode: 'aerien_groupage' | 'express' | 'maritime';
  readonly prix: Montant;
  readonly delaiJoursMin: number;
  readonly delaiJoursMax: number;
}

export interface EvenementSuivi {
  readonly code: 'remise_transporteur' | 'en_transit' | 'en_douane' | 'arrivee_pays' | 'livree' | 'incident';
  readonly date: Date;
  readonly lieu?: string;
  readonly detail?: string;
}

export interface CarrierProvider {
  readonly code: string;
  readonly estSandbox: boolean;
  /** Au MVP, la plupart des tarifs viennent des grilles Admin ; l'API n'est utilisée que si un contrat existe. */
  coter(colis: ColisATransporter): Promise<readonly OffreTransport[]>;
  suivre(numeroSuivi: string): Promise<readonly EvenementSuivi[]>;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type CanalNotification = 'in_app' | 'push' | 'sms' | 'email' | 'whatsapp';

export interface Notification {
  readonly destinataireId: string;
  readonly canal: CanalNotification;
  /** Clé de traduction du modèle, ex. « commande.recue_entrepot ». */
  readonly modele: string;
  readonly langue: 'fr' | 'en' | 'tr' | 'es' | 'zh';
  readonly variables: Readonly<Record<string, string>>;
  /** Clé d'idempotence : la même notification n'est pas envoyée deux fois. */
  readonly cle: string;
}

export interface NotificationProvider {
  readonly code: string;
  readonly canaux: readonly CanalNotification[];
  envoyer(notification: Notification): Promise<{ referenceEnvoi: string }>;
}
