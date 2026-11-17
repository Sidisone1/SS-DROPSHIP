// Vérifie que chaque icône du catalogue existe, est un PNG 256 x 256 et a un libellé.
// Lancer : node --test packages/ui/icones.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ICONES, DOSSIER_ICONES, cheminIcone, libelleIcone } from './icones.mjs';

test('64 icônes, noms uniques', () => {
  assert.equal(ICONES.length, 64);
  assert.equal(new Set(ICONES.map(([n]) => n)).size, 64);
});

test('chaque icône est un PNG 256 x 256 avec transparence', () => {
  for (const [nom, libelle] of ICONES) {
    const octets = readFileSync(join(DOSSIER_ICONES, `${nom}.png`));
    assert.equal(octets.toString('latin1', 1, 4), 'PNG', `${nom} n'est pas un PNG`);
    assert.equal(octets.readUInt32BE(16), 256, `${nom} : largeur`);
    assert.equal(octets.readUInt32BE(20), 256, `${nom} : hauteur`);
    assert.equal(octets[25], 6, `${nom} : pas de canal alpha`);
    assert.ok(libelle.length > 0);
  }
});

test('les noms du prototype sont couverts', () => {
  const html = readFileSync(new URL('../../design/prototypes/ecrans.html', import.meta.url), 'utf8');
  const utilises = new Set([...html.matchAll(/href="#i-([a-z0-9-]+)"/g)].map((m) => m[1]));
  for (const nom of utilises) assert.ok(cheminIcone(nom), nom);
});

test('nom inconnu refusé, libellé lisible', () => {
  assert.throws(() => cheminIcone('inexistante'), /Icône inconnue/);
  assert.equal(libelleIcone('devis'), 'Devis');
});
