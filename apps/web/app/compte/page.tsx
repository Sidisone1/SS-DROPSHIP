import { traducteur } from '@ss-dropship/i18n';
import { redirect } from 'next/navigation';
import { BoutonCopier } from '../../composants/BoutonCopier';
import { EnTete } from '../../composants/EnTete';
import { Icone } from '../../composants/Icone';
import { appelerApi } from '../../lib/api';
import { lireJetons } from '../../lib/session';
import { deconnecter } from '../actions';

interface Profil {
  nom: string;
  telephone: string | null;
  email: string | null;
}
interface EspaceParrainage {
  code: string;
  lienPartage: string;
  nombreFilleuls: number;
  recompensesVersees: { valeur: number };
  recompensesEnAttente: { valeur: number };
  regle: { tauxPb: number; dureeMois: number };
}

const fcfa = (v: number) => `${v.toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;

/** Compte connecté : le programme de parrainage reste accessible (D-005, US-AUT-06). */
export default async function Compte() {
  const t = traducteur('fr');
  const { acces, rafraichissement } = await lireJetons();
  if (!acces) redirect(rafraichissement ? '/session/rafraichir?suite=/compte' : '/connexion');
  const [profil, parrainage] = await Promise.all([
    appelerApi<Profil>('/moi', { jeton: acces }),
    appelerApi<EspaceParrainage>('/moi/parrainage', { jeton: acces }),
  ]);
  if (profil.statut === 401) redirect('/session/rafraichir?suite=/compte');
  if (!profil.ok || !parrainage.ok) throw new Error('API indisponible');
  const p = parrainage.donnees;
  return (
    <>
      <EnTete t={t} />
      <main className="conteneur etroit">
        <h1>{t('compte.bonjour', { nom: profil.donnees.nom })}</h1>
        <section className="carte">
          <h2 className="ligne">
            <Icone nom="gift" libelle="" taille={40} /> {t('compte.parrainage')}
          </h2>
          <p>{t('compte.parrainage.regle', { taux: `${p.regle.tauxPb / 100} %`, duree: String(p.regle.dureeMois) })}</p>
          <p className="note">{t('compte.parrainage.monCode')}</p>
          <p className="code-parrainage">{p.code}</p>
          <div className="ligne">
            <BoutonCopier texte={p.code} libelle={t('compte.parrainage.copier')} copie={t('compte.parrainage.copie')} />
            <BoutonCopier
              texte={p.lienPartage}
              libelle={t('compte.parrainage.partager')}
              copie={t('compte.parrainage.copie')}
            />
          </div>
          <dl className="chiffres">
            <div>
              <dt>{t('compte.parrainage.filleuls')}</dt>
              <dd>{p.nombreFilleuls}</dd>
            </div>
            <div>
              <dt>{t('compte.parrainage.versees')}</dt>
              <dd>{fcfa(p.recompensesVersees.valeur)}</dd>
            </div>
            <div>
              <dt>{t('compte.parrainage.enAttente')}</dt>
              <dd>{fcfa(p.recompensesEnAttente.valeur)}</dd>
            </div>
          </dl>
        </section>
        <section className="carte">
          <h2>{t('compte.titre')}</h2>
          <p>{profil.donnees.telephone ?? profil.donnees.email}</p>
          <form action={deconnecter}>
            <button type="submit" className="bouton bouton-clair bordure">
              {t('auth.deconnexion')}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
