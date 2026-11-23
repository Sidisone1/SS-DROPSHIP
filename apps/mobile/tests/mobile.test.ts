// Vérifie la structure de l'application sans démarrer React Native.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const racine = fileURLToPath(new URL('../', import.meta.url));
const lire = (chemin: string) => readFileSync(racine + chemin, 'utf8');

test('les 5 onglets du cahier des charges existent, dans l ordre', () => {
  const onglets = lire('composants/onglets.ts');
  const routes = [...onglets.matchAll(/\{ route: '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(routes, ['index', 'commandes', 'entrepot', 'wallet', 'compte']);
  for (const r of routes) assert.ok(existsSync(`${racine}app/(onglets)/${r}.tsx`), `écran manquant : ${r}`);
});

test('chaque icône référencée existe dans la collection Bogolan', () => {
  const icones = lire('composants/icones.ts');
  for (const [, chemin] of icones.matchAll(/require\('([^']+)'\)/g)) {
    assert.ok(existsSync(fileURLToPath(new URL(chemin as string, `file://${racine}composants/`))), chemin);
  }
});

test('le chat flottant est présent sur tous les écrans', () => {
  assert.match(lire('composants/Ecran.tsx'), /<ChatFlottant \/>/);
  for (const r of ['index', 'commandes', 'entrepot', 'wallet', 'compte']) {
    assert.match(lire(`app/(onglets)/${r}.tsx`), /<Ecran>/, r);
  }
});

test('le parrainage est accessible depuis le compte (D-005)', () => {
  assert.match(lire('app/(onglets)/compte.tsx'), /compte\.parrainage/);
});

test('les prestations V2 sont désactivées dans l écran Entrepôt (D-011)', () => {
  const ecran = lire('app/(onglets)/entrepot.tsx');
  assert.match(ecran, /OPTIONS_ENTREPOT/);
  assert.match(ecran, /disabled: true/);
  assert.match(ecran, /options\.bientot/);
});

test('aucune couleur codée en dur dans le code de l application', () => {
  for (const f of ['composants/styles.ts', 'composants/ChatFlottant.tsx', 'app/(onglets)/_layout.tsx']) {
    assert.doesNotMatch(lire(f), /#[0-9a-f]{3,8}\b/i, f);
  }
});
