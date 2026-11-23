// Configuration partagée hors secrets (US-SOC-05) : pays, langues, drapeaux d'activation MVP / V2.
// Les valeurs de référence en base (table Pays) sont initialisées avec ces mêmes données (migration protections).

export const LANGUES = ['fr', 'en', 'tr', 'es', 'zh'] as const;
export type Langue = (typeof LANGUES)[number];

/** Langues publiées au MVP. TR, ES, ZH attendent une relecture par des natifs (US-COM-06). */
export const LANGUES_PUBLIEES: readonly Langue[] = ['fr', 'en'];

export interface ConfigPays {
  readonly code: 'ML' | 'CI' | 'GN' | 'GH';
  readonly nom: string;
  readonly devise: 'XOF' | 'GNF' | 'GHS';
  readonly indicatif: string;
  readonly langue: Langue;
  /** Ordre d'ouverture (D-021). */
  readonly rang: number;
  readonly ouvert: boolean;
  readonly villeLivraison: string;
}

export const PAYS: readonly ConfigPays[] = [
  {
    code: 'ML',
    nom: 'Mali',
    devise: 'XOF',
    indicatif: '+223',
    langue: 'fr',
    rang: 1,
    ouvert: true,
    villeLivraison: 'Bamako',
  },
  {
    code: 'CI',
    nom: "Côte d'Ivoire",
    devise: 'XOF',
    indicatif: '+225',
    langue: 'fr',
    rang: 2,
    ouvert: false,
    villeLivraison: 'Abidjan',
  },
  {
    code: 'GN',
    nom: 'Guinée',
    devise: 'GNF',
    indicatif: '+224',
    langue: 'fr',
    rang: 3,
    ouvert: false,
    villeLivraison: 'Conakry',
  },
  {
    code: 'GH',
    nom: 'Ghana',
    devise: 'GHS',
    indicatif: '+233',
    langue: 'en',
    rang: 4,
    ouvert: false,
    villeLivraison: 'Accra',
  },
];

export const PAYS_PAR_DEFAUT = 'ML' as const;

export function configPays(code: string): ConfigPays {
  const pays = PAYS.find((p) => p.code === code);
  if (!pays) throw new Error(`Pays inconnu : ${code}`);
  return pays;
}

export const paysOuverts = (): readonly ConfigPays[] => PAYS.filter((p) => p.ouvert);

/**
 * Drapeaux d'activation. Les prestations V2 (D-011) et l'abonnement « Pro » (D-022) sont désactivés au MVP ;
 * les activer exige une décision tracée au registre.
 */
export const FONCTIONS = {
  abonnement_pro: false,
  inspection_qc: false,
  photos_contenu: false,
  video_contenu: false,
  regroupement: false,
  reconditionnement: false,
  maritime: false,
  ankata: false,
} as const;
