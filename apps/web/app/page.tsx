import { traducteur } from '@ss-dropship/i18n';
import { EnTete } from '../composants/EnTete';
import { Icone } from '../composants/Icone';

const MODES = [
  { cle: 'directe', icone: 'link' },
  { cle: 'recherche', icone: 'camera' },
  { cle: 'negociation', icone: 'deal' },
] as const;

const CATEGORIES = [
  { icone: 'mobile', libelle: 'Téléphones' },
  { icone: 'laptop', libelle: 'Informatique' },
  { icone: 'game', libelle: 'Jeux vidéo' },
  { icone: 'wifi', libelle: 'Réseau' },
  { icone: 'cpu', libelle: 'Électronique' },
] as const;

export default function Accueil() {
  const t = traducteur('fr');
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur">
        <section className="hero">
          <h1>{t('app.slogan')}</h1>
          <search>
            <form className="recherche" action="/recherche">
              <Icone nom="search" libelle="" taille={28} />
              <input
                name="q"
                type="search"
                placeholder={t('accueil.recherche.placeholder')}
                aria-label={t('accueil.recherche.placeholder')}
              />
            </form>
          </search>
        </section>

        <section aria-labelledby="titre-modes">
          <h2 id="titre-modes">{t('accueil.modes.titre')}</h2>
          <div className="grille-modes">
            {MODES.map(({ cle, icone }) => (
              <article key={cle} className="carte">
                <Icone nom={icone} libelle="" />
                <h3>{t(`accueil.modes.${cle}`)}</h3>
                <p>{t(`accueil.modes.${cle}.detail`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Catégories">
          <ul className="categories">
            {CATEGORIES.map((c) => (
              <li key={c.icone} className="categorie">
                <Icone nom={c.icone} libelle="" taille={40} />
                <span>{c.libelle}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <a className="chat-flottant" href="/support" aria-label={t('chat.ouvrir')}>
        <Icone nom="chat" libelle="" taille={36} />
      </a>
    </>
  );
}
