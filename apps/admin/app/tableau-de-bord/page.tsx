import { traducteur } from '@ss-dropship/i18n';
import { redirect } from 'next/navigation';
import { appelerApi } from '../../lib/api';
import { jetonAcces } from '../../lib/session';
import { deconnecter } from '../actions';
import { MODULES } from '../modules';

/** Tableau de bord (US-ADM-01), réservé au personnel connecté avec double authentification. Aucun chiffre inventé. */
export default async function TableauDeBord() {
  const t = traducteur('fr');
  const jeton = await jetonAcces();
  if (!jeton) redirect('/');
  const moi = await appelerApi<{ nom: string; roles: string[]; code?: string }>('/moi', { jeton });
  if (moi.statut === 403 && moi.donnees.code === 'mfa_a_configurer') redirect('/mfa');
  if (!moi.ok || !moi.donnees.roles.some((r) => r !== 'client')) redirect('/');
  const roles = moi.donnees.roles;
  const visibles = MODULES.filter((m) => m.roles.some((r) => roles.includes(r)));
  return (
    <div className="admin">
      <aside className="menu">
        <strong>SS DROPSHIP</strong>
        <nav>
          {visibles.map((m) => (
            <span key={m.cle}>{m.titre}</span>
          ))}
        </nav>
        <p className="note-menu">
          {moi.donnees.nom} · {roles.join(', ')}
        </p>
        <form action={deconnecter}>
          <button type="submit" className="bouton">
            {t('auth.deconnexion')}
          </button>
        </form>
      </aside>
      <main className="contenu">
        <h1>Tableau de bord</h1>
        <p className="note">Aucune donnée réelle : les modules sont branchés sprint par sprint.</p>
        <div className="grille">
          {visibles.map((m) => (
            <article key={m.cle} className="carte">
              <h2>{m.titre}</h2>
              <p>{m.description}</p>
              <p className="valeur">
                <span aria-hidden="true">—</span>
                <span className="visuellement-cache">Aucune donnée</span>
              </p>
              <p className="note">
                Rôles : {m.roles.join(', ')} · Sprint {m.sprint}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
