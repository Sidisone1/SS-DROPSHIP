import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLES, en, fr, traduire, traducteur } from './index.ts';
import { ETATS_COMMANDE } from '../../types/src/index.ts';

const variables = (t: string) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('chaque état de commande a un libellé français', () => {
  for (const etat of ETATS_COMMANDE) assert.ok(CLES.includes(`commande.etat.${etat}` as never), etat);
});

test('aucun texte français vide', () => {
  for (const cle of CLES) assert.ok(fr[cle].trim().length > 0, cle);
});

test('les traductions anglaises gardent les mêmes variables', () => {
  for (const [cle, texte] of Object.entries(en)) {
    assert.deepEqual(variables(texte ?? ''), variables(fr[cle as keyof typeof fr]), cle);
  }
});

test('repli : clé absente en anglais → français, langue inconnue → français', () => {
  assert.equal(traduire('commande.etat.en_douane', 'en'), 'En douane');
  assert.equal(traduire('onglets.accueil', 'zz'), 'Accueil');
  assert.equal(traduire('onglets.accueil', 'en'), 'Home');
});

test('interpolation des variables', () => {
  const t = traducteur('fr');
  assert.equal(
    t('compte.parrainage.regle', { taux: '5 %', duree: '12' }),
    'Recevez 5 % des frais de service des commandes livrées de vos filleuls pendant 12 mois.',
  );
});

test('le champ code de parrainage est marqué facultatif dans les deux langues (D-005)', () => {
  assert.match(traduire('auth.champ.codeParrainage', 'fr'), /facultatif/);
  assert.match(traduire('auth.champ.codeParrainage', 'en'), /optional/);
});

test('les prestations V2 sont annoncées « Bientôt disponible »', () => {
  assert.equal(traduire('options.bientot'), 'Bientôt disponible');
});
