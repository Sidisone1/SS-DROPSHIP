// Prestations d'entrepôt avancées : visibles « Bientôt disponible » mais non commandables au MVP (D-010, D-011).

export const OPTIONS_ENTREPOT = {
  inspection_qc: { libelle: 'Inspection et contrôle qualité', disponible: false },
  photos_contenu: { libelle: 'Photos du contenu', disponible: false },
  video_contenu: { libelle: 'Vidéo du contenu', disponible: false },
  regroupement: { libelle: 'Regroupement de colis', disponible: false },
  reconditionnement: { libelle: 'Reconditionnement', disponible: false },
} as const;
export type OptionEntrepot = keyof typeof OPTIONS_ENTREPOT;

export const LIBELLE_INDISPONIBLE = 'Bientôt disponible';

export class OptionIndisponible extends Error {
  readonly option: string;
  constructor(option: string) {
    super(`Prestation non disponible au lancement : ${option}`);
    this.name = 'OptionIndisponible';
    this.option = option;
  }
}

/**
 * À appeler côté serveur avant toute commande de prestation : lève une erreur tant que la prestation
 * n'est pas disponible. Le flag `disponible` ne peut changer que par une décision tracée (V2).
 */
export function verifierOptionCommandable(option: string): asserts option is OptionEntrepot {
  const def = (OPTIONS_ENTREPOT as Record<string, { disponible: boolean } | undefined>)[option];
  if (!def?.disponible) throw new OptionIndisponible(option);
}
