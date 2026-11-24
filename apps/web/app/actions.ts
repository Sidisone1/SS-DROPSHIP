'use server';

import { redirect } from 'next/navigation';
import { validerInscription } from '@ss-dropship/types';
import { appelerApi, type ErreurApi } from '../lib/api';
import { type EtatFormulaire, etatDepuisErreur, texte } from '../lib/formulaire';
import { effacerJetons, enregistrerJetons, lireJetons } from '../lib/session';

interface Jetons {
  jetonAcces: string;
  jetonRafraichissement: string;
  expireDans: number;
}

/** US-AUT-01 */
export async function inscrire(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  // Validation partagée (packages/types, même règles que le mobile) avant l'appel à l'API.
  const verification = validerInscription({
    nom: texte(f, 'nom'),
    pays: texte(f, 'pays'),
    telephone: texte(f, 'telephone') || null,
    email: texte(f, 'email') || null,
    motDePasse: String(f.get('motDePasse') ?? ''),
    motDePasseConfirmation: String(f.get('motDePasseConfirmation') ?? ''),
    codeParrainage: texte(f, 'codeParrainage') || null,
    cguAcceptees: f.get('cguAcceptees') === 'on',
  });
  if (!verification.valide) {
    return {
      message: Object.values(verification.erreurs).join(' '),
      champs: verification.erreurs as Record<string, string>,
    };
  }
  if (texte(f, 'telephone') && texte(f, 'email')) {
    return { message: 'Indiquez un téléphone ou un email, pas les deux.', champs: { contact: 'un_seul' } };
  }
  const r = await appelerApi<{ utilisateurId: string; canalVerification: string; avertissement?: string } & ErreurApi>(
    '/auth/inscription',
    {
      corps: {
        nom: texte(f, 'nom'),
        pays: texte(f, 'pays'),
        telephone: texte(f, 'telephone') || undefined,
        email: texte(f, 'email') || undefined,
        motDePasse: String(f.get('motDePasse') ?? ''),
        motDePasseConfirmation: String(f.get('motDePasseConfirmation') ?? ''),
        codeParrainage: texte(f, 'codeParrainage') || undefined,
        cguAcceptees: f.get('cguAcceptees') === 'on',
      },
    },
  );
  if (!r.ok) return etatDepuisErreur(r.donnees);
  const params = new URLSearchParams({ u: r.donnees.utilisateurId, canal: r.donnees.canalVerification });
  if (r.donnees.avertissement) params.set('avertissement', '1');
  redirect(`/verification?${params}`);
}

/** US-AUT-02 */
export async function verifier(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const utilisateurId = texte(f, 'utilisateurId');
  if (f.get('action') === 'renvoyer') {
    const r = await appelerApi<ErreurApi>('/auth/verification/renvoi', { corps: { utilisateurId } });
    return r.ok ? { succes: 'Un nouveau code vient d’être envoyé.' } : etatDepuisErreur(r.donnees);
  }
  const r = await appelerApi<ErreurApi>('/auth/verification', { corps: { utilisateurId, code: texte(f, 'code') } });
  if (!r.ok) return etatDepuisErreur(r.donnees);
  redirect('/connexion?verifie=1');
}

/** US-AUT-03 */
export async function connecter(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const r = await appelerApi<Jetons & ErreurApi>('/auth/connexion', {
    corps: { identifiant: texte(f, 'identifiant'), motDePasse: String(f.get('motDePasse') ?? '') },
  });
  if (r.statut === 403 && r.donnees.code === 'compte_non_verifie' && r.donnees.details?.utilisateurId) {
    redirect(`/verification?u=${encodeURIComponent(r.donnees.details.utilisateurId)}`);
  }
  if (!r.ok) return etatDepuisErreur(r.donnees);
  await enregistrerJetons(r.donnees);
  redirect('/compte');
}

/** US-AUT-04 */
export async function demanderCode(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const identifiant = texte(f, 'identifiant');
  const r = await appelerApi<ErreurApi>('/auth/mot-de-passe-oublie', { corps: { identifiant } });
  if (!r.ok) return etatDepuisErreur(r.donnees);
  redirect(`/mot-de-passe-oublie/code?i=${encodeURIComponent(identifiant)}`);
}

export async function reinitialiser(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const r = await appelerApi<ErreurApi>('/auth/reinitialiser', {
    corps: {
      identifiant: texte(f, 'identifiant'),
      code: texte(f, 'code'),
      nouveauMotDePasse: String(f.get('nouveauMotDePasse') ?? ''),
    },
  });
  if (!r.ok) return etatDepuisErreur(r.donnees);
  redirect('/connexion?reinitialise=1');
}

export async function deconnecter(): Promise<void> {
  const { acces } = await lireJetons();
  if (acces) await appelerApi('/auth/deconnexion', { methode: 'POST', jeton: acces });
  await effacerJetons();
  redirect('/');
}
