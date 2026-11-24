// Outils purs (testés) pour les formulaires d'authentification.
import type { ErreurApi } from './api';

export interface EtatFormulaire {
  message?: string;
  champs?: Record<string, string>;
  succes?: string;
}

/** Message lisible à partir d'une réponse d'erreur de l'API. */
export function etatDepuisErreur(erreur: ErreurApi): EtatFormulaire {
  const champs = erreur.details?.champs;
  return {
    message: erreur.message ?? 'Une erreur est survenue. Réessayez dans un instant.',
    ...(champs ? { champs } : {}),
  };
}

/** N'accepte qu'un chemin interne (évite les redirections ouvertes vers un autre site). */
export function cheminSur(suite: string | null | undefined, defaut = '/compte'): string {
  if (!suite?.startsWith('/') || suite.startsWith('//') || suite.includes('\\')) return defaut;
  return suite;
}

export const texte = (donnees: FormData, nom: string): string => String(donnees.get(nom) ?? '').trim();
