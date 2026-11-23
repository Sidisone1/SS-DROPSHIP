// Machines à états de SS DROPSHIP (BACKLOG_MVP.md, section « Machines à états »).
// Toute transition passe par `transitionner`, qui refuse les passages non prévus.

/** États d'une commande, du devis à la livraison. */
export const ETATS_COMMANDE = [
  'brouillon',
  'devis_demande',
  'devis_propose',
  'devis_accepte',
  'devis_expire',
  'payee',
  'achat_en_cours',
  'expediee_fournisseur',
  'recue_entrepot',
  'en_attente_paiement_fret',
  'prete_a_expedier',
  'remise_transporteur',
  'en_transit',
  'en_douane',
  'arrivee_pays',
  'disponible_retrait',
  'en_livraison_locale',
  'livree',
  'annulee',
  'incident',
  'litige',
  'remboursee',
] as const;
export type EtatCommande = (typeof ETATS_COMMANDE)[number];

/** États postérieurs au paiement, depuis lesquels un incident peut être ouvert. */
const APRES_PAIEMENT: readonly EtatCommande[] = [
  'payee',
  'achat_en_cours',
  'expediee_fournisseur',
  'recue_entrepot',
  'en_attente_paiement_fret',
  'prete_a_expedier',
  'remise_transporteur',
  'en_transit',
  'en_douane',
  'arrivee_pays',
  'disponible_retrait',
  'en_livraison_locale',
];

const TRANSITIONS_COMMANDE: Readonly<Record<EtatCommande, readonly EtatCommande[]>> = {
  brouillon: ['devis_demande', 'annulee'],
  devis_demande: ['devis_propose', 'annulee'],
  devis_propose: ['devis_accepte', 'devis_propose', 'devis_expire', 'annulee'],
  devis_accepte: ['payee', 'devis_expire', 'annulee'],
  devis_expire: ['devis_demande'],
  // Annulation possible seulement avant le début de l'achat (US-CMD-06).
  payee: ['achat_en_cours', 'annulee', 'incident'],
  achat_en_cours: ['expediee_fournisseur', 'incident'],
  expediee_fournisseur: ['recue_entrepot', 'incident'],
  recue_entrepot: ['en_attente_paiement_fret', 'incident'],
  en_attente_paiement_fret: ['prete_a_expedier', 'incident'],
  prete_a_expedier: ['remise_transporteur', 'incident'],
  remise_transporteur: ['en_transit', 'incident'],
  en_transit: ['en_douane', 'arrivee_pays', 'incident'],
  en_douane: ['arrivee_pays', 'incident'],
  arrivee_pays: ['disponible_retrait', 'en_livraison_locale', 'incident'],
  disponible_retrait: ['livree', 'en_livraison_locale', 'incident'],
  en_livraison_locale: ['livree', 'disponible_retrait', 'incident'],
  livree: ['litige'],
  annulee: ['remboursee'],
  // Un incident se résout en reprenant le flux (l'état cible est contrôlé par le métier) ou en remboursement.
  incident: [...APRES_PAIEMENT, 'remboursee'],
  litige: ['livree', 'remboursee'],
  remboursee: [],
};

/** États d'une tentative de paiement (recharge du wallet). */
export const ETATS_PAIEMENT = [
  'creee',
  'en_attente_prestataire',
  'confirmee',
  'echouee',
  'expiree',
  'anomalie',
] as const;
export type EtatPaiement = (typeof ETATS_PAIEMENT)[number];

const TRANSITIONS_PAIEMENT: Readonly<Record<EtatPaiement, readonly EtatPaiement[]>> = {
  creee: ['en_attente_prestataire', 'echouee'],
  en_attente_prestataire: ['confirmee', 'echouee', 'expiree', 'anomalie'],
  // Un paiement confirmé est définitif : seule une écriture de remboursement peut le compenser.
  confirmee: [],
  echouee: [],
  // Un webhook de succès tardif sur un paiement expiré est mis en anomalie, jamais crédité automatiquement.
  expiree: ['anomalie'],
  anomalie: ['confirmee', 'echouee'],
};

/** États d'un colis à l'entrepôt (carton fermé au MVP, D-010). */
export const ETATS_COLIS = ['attendu', 'recu', 'mesure', 'anomalie', 'pret', 'expedie'] as const;
export type EtatColis = (typeof ETATS_COLIS)[number];

const TRANSITIONS_COLIS: Readonly<Record<EtatColis, readonly EtatColis[]>> = {
  attendu: ['recu'],
  recu: ['mesure', 'anomalie'],
  mesure: ['pret', 'anomalie'],
  anomalie: ['mesure', 'pret'],
  pret: ['expedie'],
  expedie: [],
};

const MACHINES = {
  commande: TRANSITIONS_COMMANDE,
  paiement: TRANSITIONS_PAIEMENT,
  colis: TRANSITIONS_COLIS,
} as const;

type Machine = keyof typeof MACHINES;
type EtatDe<M extends Machine> = M extends 'commande' ? EtatCommande : M extends 'paiement' ? EtatPaiement : EtatColis;

export class TransitionInterdite extends Error {
  readonly machine: Machine;
  readonly depuis: string;
  readonly vers: string;
  constructor(machine: Machine, depuis: string, vers: string) {
    super(`Transition interdite (${machine}) : ${depuis} → ${vers}`);
    this.name = 'TransitionInterdite';
    this.machine = machine;
    this.depuis = depuis;
    this.vers = vers;
  }
}

export function transitionsPossibles<M extends Machine>(machine: M, depuis: EtatDe<M>): readonly EtatDe<M>[] {
  const table = MACHINES[machine] as Readonly<Record<string, readonly EtatDe<M>[]>>;
  return table[depuis] ?? [];
}

export function peutTransiter<M extends Machine>(machine: M, depuis: EtatDe<M>, vers: EtatDe<M>): boolean {
  return transitionsPossibles(machine, depuis).includes(vers);
}

/** Renvoie l'état cible si la transition est autorisée, sinon lève `TransitionInterdite`. */
export function transitionner<M extends Machine>(machine: M, depuis: EtatDe<M>, vers: EtatDe<M>): EtatDe<M> {
  if (!peutTransiter(machine, depuis, vers)) throw new TransitionInterdite(machine, depuis, vers);
  return vers;
}

/** Seul l'état « confirmee » d'un paiement autorise une écriture de crédit au ledger (D-008). */
export function paiementCreditable(etat: EtatPaiement): boolean {
  return etat === 'confirmee';
}
