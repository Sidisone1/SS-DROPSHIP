import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAYS, PAYS_PAR_DEFAUT, configPays, paysOuverts, FONCTIONS, LANGUES_PUBLIEES } from './index.ts';

test('le Mali est le seul pays ouvert et le pays par défaut (D-021)', () => {
  assert.deepEqual(
    paysOuverts().map((p) => p.code),
    ['ML'],
  );
  assert.equal(PAYS_PAR_DEFAUT, 'ML');
  assert.equal(configPays('ML').devise, 'XOF');
  assert.equal(configPays('ML').indicatif, '+223');
});

test("l'ordre d'ouverture suit D-021 : Mali, Côte d'Ivoire, Guinée, Ghana", () => {
  assert.deepEqual(
    [...PAYS].sort((a, b) => a.rang - b.rang).map((p) => p.code),
    ['ML', 'CI', 'GN', 'GH'],
  );
});

test('pays inconnu refusé', () => {
  assert.throws(() => configPays('FR'));
});

test('toutes les fonctions V2 et l abonnement Pro sont désactivés au MVP', () => {
  for (const [nom, actif] of Object.entries(FONCTIONS)) assert.equal(actif, false, nom);
});

test('seuls le français et l anglais sont publiés', () => {
  assert.deepEqual(LANGUES_PUBLIEES, ['fr', 'en']);
});
