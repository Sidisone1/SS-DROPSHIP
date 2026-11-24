import { traducteur } from '@ss-dropship/i18n';
import { Formulaire } from '../composants/Formulaire';
import { connecter } from './actions';

/** Connexion du personnel (US-AUT-07) : la double authentification est obligatoire (ADR-004). */
export default async function Connexion({ searchParams }: { searchParams: Promise<{ mfa?: string }> }) {
  const t = traducteur('fr');
  const { mfa } = await searchParams;
  return (
    <main className="connexion">
      <h1>{t('admin.titre')}</h1>
      <p>{t('admin.acces')}</p>
      {mfa ? (
        <p className="info" role="status">
          {t('auth.mfa.ok')}
        </p>
      ) : null}
      <div className="carte">
        <Formulaire action={connecter} bouton={t('auth.bouton.connexion')}>
          <label>
            {t('auth.champ.email')}
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            {t('auth.champ.motDePasse')}
            <input name="motDePasse" type="password" autoComplete="current-password" required />
          </label>
          <label>
            {t('auth.champ.codeMfa')}
            <input name="codeMfa" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} />
          </label>
        </Formulaire>
      </div>
    </main>
  );
}
