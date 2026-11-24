import { traducteur } from '@ss-dropship/i18n';
import { redirect } from 'next/navigation';
import { Formulaire } from '../../composants/Formulaire';
import { appelerApi } from '../../lib/api';
import { jetonAcces } from '../../lib/session';
import { confirmerMfa } from '../actions';

/** Activation de la double authentification à la première connexion du personnel. */
export default async function ActivationMfa() {
  const t = traducteur('fr');
  const jeton = await jetonAcces();
  if (!jeton) redirect('/');
  const r = await appelerApi<{ secret: string; urlOtpauth: string; code?: string }>('/auth/mfa/activation', {
    methode: 'POST',
    jeton,
  });
  if (!r.ok) redirect(r.donnees.code === 'mfa_deja_active' ? '/tableau-de-bord' : '/');
  const secretLisible = r.donnees.secret.match(/.{1,4}/g)?.join(' ') ?? r.donnees.secret;
  return (
    <main className="connexion">
      <h1>{t('auth.mfa.titre')}</h1>
      <p>{t('auth.mfa.texte')}</p>
      <div className="carte">
        <p className="note">{t('auth.mfa.cle')}</p>
        <p className="secret">{secretLisible}</p>
        <p className="note">
          <a href={r.donnees.urlOtpauth}>otpauth://…</a>
        </p>
        <Formulaire action={confirmerMfa} bouton={t('auth.mfa.bouton')}>
          <label>
            {t('auth.champ.codeMfa')}
            <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
          </label>
        </Formulaire>
      </div>
    </main>
  );
}
