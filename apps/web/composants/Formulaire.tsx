'use client';

import { type FormEvent, type ReactNode, startTransition, useActionState } from 'react';
import type { EtatFormulaire } from '../lib/formulaire';

type Action = (etat: EtatFormulaire, donnees: FormData) => Promise<EtatFormulaire>;

/** Formulaire relié à une action serveur : affiche les erreurs de l'API et désactive l'envoi pendant le traitement. */
export function Formulaire({
  action,
  bouton,
  children,
  secondaire,
}: {
  action: Action;
  bouton: string;
  children: ReactNode;
  secondaire?: { nom: string; valeur: string; libelle: string };
}) {
  const [etat, envoyer, enCours] = useActionState(action, {});
  // Envoi manuel : contrairement à l'envoi natif des actions, les champs saisis ne sont pas effacés en cas d'erreur.
  const soumettre = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const declencheur = (e.nativeEvent as SubmitEvent).submitter;
    const donnees = new FormData(e.currentTarget, declencheur);
    startTransition(() => envoyer(donnees));
  };
  return (
    <form action={envoyer} onSubmit={soumettre} className="formulaire" noValidate>
      {etat.message ? (
        <p className="alerte" role="alert">
          {etat.message}
          {etat.champs ? <span className="note"> ({Object.keys(etat.champs).join(', ')})</span> : null}
        </p>
      ) : null}
      {etat.succes ? (
        <p className="info" role="status">
          {etat.succes}
        </p>
      ) : null}
      {children}
      <button type="submit" className="bouton bouton-principal" disabled={enCours}>
        {enCours ? '…' : bouton}
      </button>
      {secondaire ? (
        <button
          type="submit"
          name={secondaire.nom}
          value={secondaire.valeur}
          className="lien-bouton"
          disabled={enCours}
        >
          {secondaire.libelle}
        </button>
      ) : null}
    </form>
  );
}
