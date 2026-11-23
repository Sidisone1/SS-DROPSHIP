// Calculs monétaires de SS DROPSHIP. Règle : montants en entiers dans l'unité mineure de la devise
// (le FCFA XOF n'a pas de décimales), taux en points de base (1 % = 100 pb), aucun nombre flottant stocké.
// Les valeurs (taux, minimums, prix au kg) viennent des paramètres Admin (M-003), jamais du code.

export const DEVISES = {
  XOF: { decimales: 0, libelle: 'Franc CFA (BCEAO)' },
  GNF: { decimales: 0, libelle: 'Franc guinéen' },
  GHS: { decimales: 2, libelle: 'Cedi ghanéen' },
  CNY: { decimales: 2, libelle: 'Yuan' },
  TRY: { decimales: 2, libelle: 'Livre turque' },
  AED: { decimales: 2, libelle: 'Dirham' },
  EUR: { decimales: 2, libelle: 'Euro' },
  USD: { decimales: 2, libelle: 'Dollar américain' },
} as const;
export type Devise = keyof typeof DEVISES;

export interface Montant {
  /** Valeur entière dans l'unité mineure de la devise. */
  readonly valeur: number;
  readonly devise: Devise;
}

function verifierEntier(n: number, nom: string): void {
  if (!Number.isSafeInteger(n)) throw new RangeError(`${nom} doit être un entier sûr (reçu : ${n})`);
}

export function montant(valeur: number, devise: Devise): Montant {
  verifierEntier(valeur, 'valeur');
  return { valeur, devise };
}

/** Arrondi au plus proche, la moitié vers le haut (pour des montants positifs). */
function diviserArrondi(numerateur: number, denominateur: number): number {
  return Math.floor((numerateur + Math.floor(denominateur / 2)) / denominateur);
}

/** Applique un taux en points de base à un montant entier, arrondi au plus proche. */
export function appliquerTaux(valeur: number, tauxPb: number): number {
  verifierEntier(valeur, 'valeur');
  verifierEntier(tauxPb, 'tauxPb');
  if (valeur < 0 || tauxPb < 0) throw new RangeError('valeur et taux doivent être positifs');
  return diviserArrondi(valeur * tauxPb, 10_000);
}

/** Frais de service = max(taux × montant produit, minimum) (US-DEV-04, D-022). */
export function fraisDeService(montantProduit: Montant, tauxPb: number, minimum: Montant): Montant {
  if (montantProduit.devise !== minimum.devise) throw new TypeError('devises différentes');
  return montant(Math.max(appliquerTaux(montantProduit.valeur, tauxPb), minimum.valeur), montantProduit.devise);
}

/**
 * Conversion avec un taux exprimé en millionièmes : 1 unité MAJEURE de la devise source vaut
 * `tauxMicro / 1 000 000` unités MAJEURES de la devise cible. La marge de change (pb) s'ajoute au taux.
 */
export function convertir(source: Montant, cible: Devise, tauxMicro: number, margePb = 0): Montant {
  verifierEntier(tauxMicro, 'tauxMicro');
  if (tauxMicro <= 0) throw new RangeError('le taux doit être positif');
  const tauxAvecMarge = tauxMicro + appliquerTaux(tauxMicro, margePb);
  const facteurSource = 10 ** DEVISES[source.devise].decimales;
  const facteurCible = 10 ** DEVISES[cible].decimales;
  // BigInt pour éviter tout dépassement sur les gros montants.
  const num = BigInt(source.valeur) * BigInt(tauxAvecMarge) * BigInt(facteurCible);
  const den = 1_000_000n * BigInt(facteurSource);
  const valeur = Number((num + den / 2n) / den);
  return montant(valeur, cible);
}

/**
 * Poids taxable en grammes = max(poids réel, poids volumétrique).
 * Poids volumétrique (kg) = L × l × h (cm) / diviseur (souvent 5000 en express, 6000 en groupage ; paramétrable).
 */
export function poidsTaxableGrammes(
  poidsReelGrammes: number,
  dimensionsCm: { longueur: number; largeur: number; hauteur: number },
  diviseur: number,
): number {
  verifierEntier(poidsReelGrammes, 'poidsReelGrammes');
  verifierEntier(diviseur, 'diviseur');
  const { longueur, largeur, hauteur } = dimensionsCm;
  for (const [nom, v] of Object.entries(dimensionsCm)) {
    if (!(v > 0)) throw new RangeError(`${nom} doit être positive`);
  }
  const volumetrique = Math.ceil((longueur * largeur * hauteur * 1000) / diviseur);
  return Math.max(poidsReelGrammes, volumetrique);
}

/** Fret = prix au kg × poids taxable, arrondi au demi-kilo supérieur (règle paramétrable `pasGrammes`). */
export function fret(poidsTaxable: number, prixParKg: Montant, pasGrammes = 500): Montant {
  verifierEntier(poidsTaxable, 'poidsTaxable');
  const arrondi = Math.ceil(poidsTaxable / pasGrammes) * pasGrammes;
  return montant(diviserArrondi(arrondi * prixParKg.valeur, 1000), prixParKg.devise);
}

/** Formatage d'affichage, ex. 125000 XOF → « 125 000 FCFA ». */
export function formater(m: Montant, locale = 'fr-FR'): string {
  const { decimales } = DEVISES[m.devise];
  const nombre = (m.valeur / 10 ** decimales).toLocaleString(locale, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).replace(/ | /g, ' ');
  return `${nombre} ${m.devise === 'XOF' ? 'FCFA' : m.devise}`;
}
