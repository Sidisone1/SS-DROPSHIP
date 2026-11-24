import { traducteur } from '@ss-dropship/i18n';
import { EnTete } from '../../../composants/EnTete';
import { Formulaire } from '../../../composants/Formulaire';
import { reinitialiser } from '../../actions';

/** Mot de passe oublié, étape 2 : code reçu + nouveau mot de passe (US-AUT-04). */
export default async function NouveauMotDePasse({ searchParams }: { searchParams: Promise<{ i?: string }> }) {
  const t = traducteur('fr');
  const { i } = await searchParams;
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('auth.reinitialisation.code.titre')}</h1>
        <Formulaire action={reinitialiser} bouton={t('auth.reinitialisation.code.bouton')}>
          <label>
            {t('auth.champ.identifiant')}
            <input name="identifiant" defaultValue={i ?? ''} autoComplete="username" required />
          </label>
          <label>
            {t('auth.champ.code')}
            <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
          </label>
          <label>
            {t('auth.champ.nouveauMotDePasse')}
            <input name="nouveauMotDePasse" type="password" autoComplete="new-password" minLength={8} required />
          </label>
        </Formulaire>
      </main>
    </>
  );
}
