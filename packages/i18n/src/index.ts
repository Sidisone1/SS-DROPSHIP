// Traduction avec repli : langue demandée → français → jamais la clé brute (US-COM-05).
import { en } from './en.ts';
import { type CleTraduction, fr } from './fr.ts';

export type { CleTraduction };
export type LangueTraduite = 'fr' | 'en';

const CATALOGUES: Record<LangueTraduite, Partial<Record<CleTraduction, string>>> = { fr, en };

export function traduire(cle: CleTraduction, langue: string = 'fr', variables: Record<string, string> = {}): string {
  const catalogue = CATALOGUES[langue as LangueTraduite] ?? fr;
  const texte = catalogue[cle] ?? fr[cle];
  return texte.replace(/\{(\w+)\}/g, (tout, nom: string) => variables[nom] ?? tout);
}

/** Crée une fonction de traduction liée à une langue, pratique dans les composants. */
export const traducteur =
  (langue: string) =>
  (cle: CleTraduction, variables?: Record<string, string>): string =>
    traduire(cle, langue, variables);

export const CLES = Object.keys(fr) as CleTraduction[];
export { en, fr };
