import Link from 'next/link';

type Cle = 'app.nom' | 'auth.connexion.titre' | 'auth.inscription.titre';

export function EnTete({ t }: { t: (cle: Cle) => string }) {
  return (
    <header className="en-tete">
      <Link href="/" className="logo" aria-label={t('app.nom')}>
        SS <span>DROPSHIP</span>
      </Link>
      <nav className="en-tete-actions">
        <Link href="/connexion" className="bouton bouton-clair">
          {t('auth.connexion.titre')}
        </Link>
      </nav>
      <div className="frise-bogolan" aria-hidden="true" />
    </header>
  );
}
