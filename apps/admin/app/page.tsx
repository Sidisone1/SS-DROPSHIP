import { traducteur } from '@ss-dropship/i18n';

/** Connexion du personnel. L'authentification réelle (mot de passe + double authentification) arrive au sprint S1. */
export default function Connexion() {
  const t = traducteur('fr');
  return (
    <main className="connexion">
      <h1>{t('admin.titre')}</h1>
      <p>{t('admin.acces')}</p>
      <form className="carte formulaire" noValidate>
        <label>
          {t('auth.champ.email')}
          <input name="email" type="email" autoComplete="username" />
        </label>
        <label>
          {t('auth.champ.motDePasse')}
          <input name="motDePasse" type="password" autoComplete="current-password" />
        </label>
        <label>
          Code de double authentification
          <input name="codeMfa" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" />
        </label>
        <button type="submit" className="bouton" disabled aria-describedby="note-s1">
          {t('auth.bouton.connexion')}
        </button>
        <p id="note-s1" className="note">
          Aperçu : connexion activée au sprint S1 (double authentification obligatoire, ADR-004).
        </p>
      </form>
    </main>
  );
}
