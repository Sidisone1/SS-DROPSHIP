import { MODULES } from '../modules';

/** Squelette du tableau de bord (US-ADM-01). Aucun chiffre affiché tant que l'API ne fournit pas de données réelles. */
export default function TableauDeBord() {
  return (
    <div className="admin">
      <aside className="menu">
        <strong>SS DROPSHIP</strong>
        <nav>
          {MODULES.map((m) => (
            <span key={m.cle}>{m.titre}</span>
          ))}
        </nav>
      </aside>
      <main className="contenu">
        <h1>Tableau de bord</h1>
        <p className="note">Aucune donnée réelle : les modules sont branchés sprint par sprint.</p>
        <div className="grille">
          {MODULES.map((m) => (
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
