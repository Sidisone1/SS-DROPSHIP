import { PAYS, PAYS_PAR_DEFAUT } from '@ss-dropship/config';
import { traducteur } from '@ss-dropship/i18n';
import { EnTete } from '../../composants/EnTete';

/** Formulaire d'inscription (US-AUT-01). L'envoi vers l'API est branché au sprint S1. */
export default function Inscription() {
  const t = traducteur('fr');
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('auth.inscription.titre')}</h1>
        <form className="formulaire" noValidate>
          <label>
            {t('auth.champ.nom')}
            <input name="nom" autoComplete="name" required />
          </label>
          <label>
            {t('auth.champ.pays')}
            <select name="pays" defaultValue={PAYS_PAR_DEFAUT}>
              {PAYS.filter((p) => p.ouvert).map((p) => (
                <option key={p.code} value={p.code}>
                  {p.nom}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('auth.champ.telephone')}
            <input name="telephone" type="tel" autoComplete="tel" placeholder="+223 …" />
          </label>
          <label>
            {t('auth.champ.email')}
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            {t('auth.champ.motDePasse')}
            <input name="motDePasse" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label>
            {t('auth.champ.confirmation')}
            <input name="motDePasseConfirmation" type="password" autoComplete="new-password" required />
          </label>
          <label>
            {t('auth.champ.codeParrainage')}
            <input name="codeParrainage" autoCapitalize="characters" />
          </label>
          <label className="case">
            <input name="cguAcceptees" type="checkbox" required />
            {t('auth.cgu')}
          </label>
          <button type="submit" className="bouton bouton-principal" disabled aria-describedby="note-s1">
            {t('auth.bouton.inscription')}
          </button>
          <p id="note-s1" className="note">
            Aperçu : l’envoi sera activé au sprint S1 (création de compte réelle).
          </p>
        </form>
      </main>
    </>
  );
}
