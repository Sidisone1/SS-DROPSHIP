import { cookies } from 'next/headers';
import Link from 'next/link';
import { COOKIE_ACCES, COOKIE_RAFRAICHISSEMENT } from '../lib/session';

type Cle = 'app.nom' | 'auth.connexion.titre' | 'auth.inscription.titre' | 'compte.monCompte';

/** En-tête : « Mon compte » si une session existe, sinon « Se connecter ». */
export async function EnTete({ t }: { t: (cle: Cle) => string }) {
  const c = await cookies();
  const connecte = Boolean(c.get(COOKIE_ACCES) ?? c.get(COOKIE_RAFRAICHISSEMENT));
  return (
    <header className="en-tete">
      <Link href="/" className="logo" aria-label={t('app.nom')}>
        SS <span>DROPSHIP</span>
      </Link>
      <nav className="en-tete-actions">
        <Link href={connecte ? '/compte' : '/connexion'} className="bouton bouton-clair">
          {connecte ? t('compte.monCompte') : t('auth.connexion.titre')}
        </Link>
      </nav>
      <div className="frise-bogolan" aria-hidden="true" />
    </header>
  );
}
