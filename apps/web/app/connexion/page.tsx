import { traducteur } from '@ss-dropship/i18n';
import Link from 'next/link';
import { EnTete } from '../../composants/EnTete';
import { Formulaire } from '../../composants/Formulaire';
import { connecter } from '../actions';

/** Connexion (US-AUT-03). */
export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ verifie?: string; reinitialise?: string; expire?: string }>;
}) {
  const t = traducteur('fr');
  const { verifie, reinitialise, expire } = await searchParams;
  const info = verifie
    ? t('auth.verification.ok')
    : reinitialise
      ? t('auth.reinitialisation.ok')
      : expire
        ? t('erreur.sessionExpiree')
        : null;
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('auth.connexion.titre')}</h1>
        {info ? (
          <p className="info" role="status">
            {info}
          </p>
        ) : null}
        <Formulaire action={connecter} bouton={t('auth.bouton.connexion')}>
          <label>
            {t('auth.champ.identifiant')}
            <input name="identifiant" autoComplete="username" required />
          </label>
          <label>
            {t('auth.champ.motDePasse')}
            <input name="motDePasse" type="password" autoComplete="current-password" required />
          </label>
        </Formulaire>
        <p className="note centre">
          <Link href="/mot-de-passe-oublie">{t('auth.motDePasseOublie')}</Link>
          {' · '}
          {t('auth.pasDeCompte')} <Link href="/inscription">{t('auth.inscription.titre')}</Link>
        </p>
      </main>
    </>
  );
}
