'use server';

import { redirect } from 'next/navigation';
import { appelerApi, type ErreurApi } from '../lib/api';
import { type EtatFormulaire, etatDepuisErreur, texte } from '../lib/formulaire';
import { effacerJetons, enregistrerJetons, jetonAcces } from '../lib/session';

interface Jetons {
  jetonAcces: string;
  jetonRafraichissement: string;
  expireDans: number;
  portee: 'complet' | 'configuration_mfa';
}

/** Connexion du personnel : mot de passe + code de double authentification (ADR-004). */
export async function connecter(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const codeMfa = texte(f, 'codeMfa');
  const r = await appelerApi<Jetons & ErreurApi>('/auth/connexion', {
    corps: {
      identifiant: texte(f, 'email'),
      motDePasse: String(f.get('motDePasse') ?? ''),
      ...(codeMfa ? { codeMfa } : {}),
    },
  });
  if (!r.ok) return etatDepuisErreur(r.donnees);
  await enregistrerJetons(r.donnees);
  redirect(r.donnees.portee === 'configuration_mfa' ? '/mfa' : '/tableau-de-bord');
}

export async function confirmerMfa(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const jeton = await jetonAcces();
  if (!jeton) redirect('/');
  const r = await appelerApi<ErreurApi>('/auth/mfa/confirmation', { corps: { code: texte(f, 'code') }, jeton });
  if (!r.ok) return etatDepuisErreur(r.donnees);
  await effacerJetons();
  redirect('/?mfa=1');
}

export async function deconnecter(): Promise<void> {
  const jeton = await jetonAcces();
  if (jeton) await appelerApi('/auth/deconnexion', { methode: 'POST', jeton });
  await effacerJetons();
  redirect('/');
}
