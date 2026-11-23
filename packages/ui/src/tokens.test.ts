import { test } from 'node:test';
import assert from 'node:assert/strict';
import { associations, contraste, couleurs, estJaunatre, roles, variablesCss } from './index.ts';

test('la palette de marque est exactement celle du design system (D-003)', () => {
  assert.equal(couleurs.bleu, '#0077C8');
  assert.equal(couleurs.rouge, '#F21A16');
  assert.equal(couleurs.blanc, '#FFFFFF');
  assert.equal(couleurs.nuit, '#10213D');
  assert.equal(couleurs.brunBogolan, '#6B3E26');
});

test('aucune couleur jaune, dorée ou orange-jaune', () => {
  for (const [nom, hex] of Object.entries({ ...couleurs, ...roles })) assert.ok(!estJaunatre(hex), `${nom} ${hex}`);
  // Le détecteur reconnaît bien les jaunes et dorés courants.
  for (const jaune of ['#FFD700', '#FFC107', '#FFEB3B', '#DAA520', '#F5B800']) assert.ok(estJaunatre(jaune), jaune);
});

test('toutes les associations texte / fond respectent leur contraste WCAG minimum', () => {
  for (const a of associations) {
    const c = contraste(a.texte, a.fond);
    assert.ok(c >= a.minimum, `${a.usage} : ${c.toFixed(2)} < ${a.minimum}`);
  }
});

test('blanc sur rouge #F21A16 est sous 4,5 : réservé au grand texte gras', () => {
  const c = contraste(couleurs.blanc, couleurs.rouge);
  assert.ok(c >= 3 && c < 4.5, c.toFixed(2));
});

test('les variables CSS exposent la palette', () => {
  const css = variablesCss();
  assert.match(css, /--ss-bleu: #0077C8;/);
  assert.match(css, /--ss-role-action: #0077C8;/);
  assert.doesNotMatch(css, /#FF[CD]/i);
});
