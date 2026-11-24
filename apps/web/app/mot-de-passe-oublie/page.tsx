import { traducteur } from '@ss-dropship/i18n';
import { EnTete } from '../../composants/EnTete';
import { Formulaire } from '../../composants/Formulaire';
import { demanderCode } from '../actions';

/** Mot de passe oublié, étape 1 (US-AUT-04). */
export default function MotDePasseOublie() {
  const t = traducteur('fr');
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('auth.reinitialisation.titre')}</h1>
        <p>{t('auth.reinitialisation.texte')}</p>
        <Formulaire action={demanderCode} bouton={t('auth.reinitialisation.bouton')}>
          <label>
            {t('auth.champ.identifiant')}
            <input name="identifiant" autoComplete="username" required />
          </label>
        </Formulaire>
      </main>
    </>
  );
}
