// Normalisation des identifiants (téléphone E.164, email) et génération des codes de parrainage.
import { randomInt } from 'node:crypto';
import { configPays } from '@ss-dropship/config';

/** Téléphone au format E.164. Un numéro local reçoit l'indicatif du pays (ex. Mali : 70 00 00 00 → +22370000000). */
export function normaliserTelephone(saisie: string, codePays: string): string | null {
  let n = saisie.replace(/[\s.\-()]/g, '');
  if (n.startsWith('00')) n = `+${n.slice(2)}`;
  if (!n.startsWith('+')) n = `${configPays(codePays).indicatif}${n.replace(/^0+/, '')}`;
  return /^\+\d{8,15}$/.test(n) ? n : null;
}

export function normaliserEmail(saisie: string): string | null {
  const e = saisie.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}

/** Identifiant de connexion : téléphone ou email. */
export function normaliserIdentifiant(saisie: string, codePays = 'ML'): { telephone?: string; email?: string } {
  if (saisie.includes('@')) {
    const email = normaliserEmail(saisie);
    return email ? { email } : {};
  }
  const telephone = normaliserTelephone(saisie, codePays);
  return telephone ? { telephone } : {};
}

const SANS_AMBIGUITE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Code lisible : lettres du prénom (6 max, sans accents) + 3 caractères sans ambiguïté (ex. AMADOU7KQ). */
export function genererCodeParrainage(nom: string, aleatoire: (max: number) => number = randomInt): string {
  const lettres =
    nom
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .split(/\s+/)[0]
      ?.replace(/[^A-Z]/g, '')
      .slice(0, 6) ?? '';
  const prefixe = lettres.length >= 2 ? lettres : 'SS';
  let suffixe = '';
  for (let i = 0; i < 3; i++) suffixe += SANS_AMBIGUITE[aleatoire(SANS_AMBIGUITE.length)];
  return prefixe + suffixe;
}

export const normaliserCodeParrainage = (saisie: string): string => saisie.trim().toUpperCase().replace(/\s/g, '');
