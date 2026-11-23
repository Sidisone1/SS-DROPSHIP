// Calcul de la récompense de parrainage (D-023, US-WAL-07, H-05).
// Récompense = taux × frais de service payés, sur les commandes LIVRÉES du filleul pendant la durée paramétrée.

import { appliquerTaux, montant, type Montant } from './montants.ts';

export interface ParametresParrainage {
  /** Taux en points de base appliqué aux frais de service (500 = 5 %, valeur par défaut de D-023). */
  readonly tauxPb: number;
  /** Durée d'éligibilité après l'inscription du filleul, en mois (12 par défaut). */
  readonly dureeMois: number;
  /** Plafond mensuel de récompenses versées automatiquement au parrain. */
  readonly plafondMensuel: Montant;
}

export const PARRAINAGE_PAR_DEFAUT_XOF: ParametresParrainage = {
  tauxPb: 500,
  dureeMois: 12,
  plafondMensuel: { valeur: 50_000, devise: 'XOF' }, // valeur d'exemple, à fixer par l'Admin (M-003)
};

export interface CommandeFilleul {
  readonly etat: string;
  readonly fraisServicePayes: Montant;
  readonly dateLivraison: Date | null;
}

export type ResultatRecompense =
  | { readonly statut: 'versee'; readonly montant: Montant }
  | { readonly statut: 'en_revue'; readonly montant: Montant; readonly raison: 'plafond_mensuel' }
  | { readonly statut: 'aucune'; readonly raison: 'non_livree' | 'hors_delai' | 'auto_parrainage' | 'montant_nul' };

/** Ajoute des mois calendaires (le 31 janvier + 1 mois = dernier jour de février). */
export function ajouterMois(date: Date, mois: number): Date {
  const d = new Date(date.getTime());
  const jour = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + mois);
  const dernierJour = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(jour, dernierJour));
  return d;
}

export function calculerRecompense(args: {
  readonly parametres: ParametresParrainage;
  readonly commande: CommandeFilleul;
  readonly inscriptionFilleul: Date;
  readonly parrainId: string;
  readonly filleulId: string;
  /** Total déjà versé automatiquement au parrain ce mois-ci, dans la devise du plafond. */
  readonly dejaVerseCeMois: Montant;
}): ResultatRecompense {
  const { parametres, commande, inscriptionFilleul, parrainId, filleulId, dejaVerseCeMois } = args;
  if (parrainId === filleulId) return { statut: 'aucune', raison: 'auto_parrainage' };
  if (commande.etat !== 'livree' || !commande.dateLivraison) return { statut: 'aucune', raison: 'non_livree' };
  if (commande.dateLivraison > ajouterMois(inscriptionFilleul, parametres.dureeMois)) {
    return { statut: 'aucune', raison: 'hors_delai' };
  }
  const valeur = appliquerTaux(commande.fraisServicePayes.valeur, parametres.tauxPb);
  if (valeur === 0) return { statut: 'aucune', raison: 'montant_nul' };
  const recompense = montant(valeur, commande.fraisServicePayes.devise);
  if (recompense.devise !== parametres.plafondMensuel.devise || dejaVerseCeMois.devise !== recompense.devise) {
    throw new TypeError('devise du plafond différente de celle de la récompense');
  }
  if (dejaVerseCeMois.valeur + valeur > parametres.plafondMensuel.valeur) {
    return { statut: 'en_revue', montant: recompense, raison: 'plafond_mensuel' };
  }
  return { statut: 'versee', montant: recompense };
}
