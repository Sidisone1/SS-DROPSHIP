/**
 * S1 / US-AUT-01 — Validation partagée des champs d'inscription.
 * Aucun effet réseau ni création de compte : l'API reste responsable de vérifier
 * l'unicité, le parrainage en base, le hachage du mot de passe et le code OTP.
 */
export interface SaisieInscription {
  readonly nom: string;
  readonly pays: string;
  readonly telephone?: string | null;
  readonly email?: string | null;
  readonly motDePasse: string;
  readonly motDePasseConfirmation: string;
  readonly codeParrainage?: string | null;
  readonly cguAcceptees: boolean;
}

export type ChampInscription =
  | 'nom'
  | 'pays'
  | 'telephone'
  | 'email'
  | 'contact'
  | 'motDePasse'
  | 'motDePasseConfirmation'
  | 'codeParrainage'
  | 'cguAcceptees';

export interface ChampsNormalises {
  readonly nom: string;
  readonly pays: 'ML';
  readonly telephone: string | null;
  readonly email: string | null;
  readonly codeParrainage: string | null;
}

export type ValidationInscription =
  | { readonly valide: true; readonly champs: ChampsNormalises }
  | { readonly valide: false; readonly erreurs: Partial<Record<ChampInscription, string>> };

/** Normalise un numéro malien vers E.164 (+223XXXXXXXX). */
export function normaliserTelephoneMali(saisie: string): string | null {
  const nettoye = saisie.replace(/[\s.()-]/g, '');
  const digits = nettoye.startsWith('+223')
    ? nettoye.slice(4)
    : nettoye.startsWith('00223')
      ? nettoye.slice(5)
      : nettoye;
  return /^\d{8}$/.test(digits) ? '+223' + digits : null;
}

/**
 * Vérifie les invariants du formulaire, jamais ceux nécessitant une base de données.
 * Ne retourne et ne journalise aucun mot de passe.
 * Règle transitoire : seul le Mali est ouvert au MVP (D-021).
 */
export function validerInscription(saisie: SaisieInscription): ValidationInscription {
  const erreurs: Partial<Record<ChampInscription, string>> = {};
  const nom = saisie.nom.trim().replace(/\s+/g, ' ');
  const email = saisie.email?.trim().toLowerCase() || null;
  const brutTelephone = saisie.telephone?.trim() || '';
  const telephone = brutTelephone ? normaliserTelephoneMali(brutTelephone) : null;
  const codeParrainage = saisie.codeParrainage?.trim().toUpperCase() || null;

  if (nom.length < 2 || nom.length > 120) erreurs.nom = 'Le nom doit contenir entre 2 et 120 caractères.';
  if (saisie.pays !== 'ML') erreurs.pays = 'Ce pays n’est pas encore ouvert aux inscriptions.';
  if (brutTelephone && !telephone) erreurs.telephone = 'Numéro malien invalide (8 chiffres).';
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    erreurs.email = 'Adresse e-mail invalide.';
  }
  if (!brutTelephone && !email) erreurs.contact = 'Indiquez un téléphone ou une adresse e-mail.';
  if (saisie.motDePasse.length < 8 || saisie.motDePasse.length > 128) {
    erreurs.motDePasse = 'Le mot de passe doit contenir entre 8 et 128 caractères.';
  }
  if (saisie.motDePasse !== saisie.motDePasseConfirmation) {
    erreurs.motDePasseConfirmation = 'Les mots de passe sont différents.';
  }
  if (codeParrainage && !/^[A-Z0-9]{4,20}$/.test(codeParrainage)) {
    erreurs.codeParrainage = 'Code de parrainage invalide.';
  }
  if (saisie.cguAcceptees !== true) erreurs.cguAcceptees = 'Les conditions doivent être acceptées.';
  if (Object.keys(erreurs).length > 0) return { valide: false, erreurs };

  return { valide: true, champs: { nom, pays: 'ML', telephone, email, codeParrainage } };
}
