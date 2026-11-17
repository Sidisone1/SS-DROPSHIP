// Catalogue des icônes 3D Bogolan de SS DROPSHIP (décision D-018).
// Les fichiers sont dans design/icons/bogolan/png/ : PNG 256 x 256, fond transparent.
// Sans dépendance : utilisable par les futures apps web, mobile et admin.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ICI = dirname(fileURLToPath(import.meta.url));
export const DOSSIER_ICONES = join(ICI, '..', '..', 'design', 'icons', 'bogolan', 'png');

/** Liste des icônes : [nom de fichier, libellé français]. */
export const ICONES = JSON.parse(
  readFileSync(join(ICI, '..', '..', 'design', 'icons', 'bogolan', 'scripts', 'icones_ss.json'), 'utf8'),
);

const NOMS = new Set(ICONES.map(([nom]) => nom));

/** Chemin relatif (depuis la racine du dépôt) de l'icône demandée ; erreur si le nom est inconnu. */
export function cheminIcone(nom) {
  if (!NOMS.has(nom)) throw new Error(`Icône inconnue : ${nom}`);
  return `design/icons/bogolan/png/${nom}.png`;
}

/** Libellé français d'une icône (pour l'attribut alt ou une info-bulle). */
export function libelleIcone(nom) {
  const trouve = ICONES.find(([n]) => n === nom);
  if (!trouve) throw new Error(`Icône inconnue : ${nom}`);
  return trouve[1];
}
