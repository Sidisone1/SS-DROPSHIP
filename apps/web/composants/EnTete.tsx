import Link from 'next/link';

export function EnTete({ t }: { t: (cle: 'app.nom' | 'auth.connexion.titre' | 'auth.inscription.titre') => string }) {
  return (
    <header className="en-tete">
      <Link href="/" className="logo" aria-label={t('app.nom')}>
        SS <span>DROPSHIP</span>
      </Link>
      <nav className="en-tete-actions">
        <Link href="/inscription" className="bouton bouton-clair">
          {t('auth.inscription.titre')}
        </Link>
      </nav>
      <div className="frise-bogolan" aria-hidden="true" />
    </header>
  );
}
