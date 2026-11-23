// Vérifie que la procédure et les prompts d'équipe gardent les règles non négociables de SS DROPSHIP.
// Lancer : node --test docs/equipe/equipe.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const lire = (nom) => readFileSync(fileURLToPath(new URL(nom, import.meta.url)), 'utf8');
const procedure = lire('./PROCEDURE_EQUIPE.md');
const prompts = lire('./PROMPTS_EQUIPE.md');

test('le bloc commun contient la palette officielle et interdit le jaune', () => {
  for (const hex of ['#0077C8', '#F21A16', '#FFFFFF', '#10213D']) {
    assert.ok(prompts.includes(hex), `couleur ${hex} absente`);
  }
  assert.match(prompts, /AUCUN jaune/);
});

test('aucune couleur jaune ou dorée dans les documents', () => {
  const jaunes = /#(FF[CD][0-9A-F]{3}|FFFF00|FFD700|F[0-9A-F]C[0-9A-F]0[0-9A-F]|DAA520)\b/i;
  assert.doesNotMatch(procedure, jaunes);
  assert.doesNotMatch(prompts, jaunes);
});

test('les règles métier critiques figurent dans les deux documents', () => {
  for (const doc of [procedure, prompts]) {
    assert.match(doc, /code de parrainage/i);
    assert.match(doc, /webhook/i);
    assert.match(doc, /sans ouverture|carton fermé/i);
    assert.match(doc, /Bientôt disponible/);
  }
});

test('chaque rôle a son prompt', () => {
  const roles = [
    'Product Owner', 'Chef de projet', 'Business Analyst', 'UX Researcher', 'UX Designer', 'UI Designer',
    'Designer 3D', 'UX Writer', 'Architecte', 'Data Engineer', 'DevOps', 'Dev Backend', 'Dev Frontend',
    'Dev Mobile', 'QA', 'Ingénieur sécurité', 'Juriste', 'Growth', 'Data Analyst', 'Support', 'Rôles métier',
  ];
  for (const role of roles) {
    assert.match(prompts, new RegExp(`^### 3\\.\\d+ .*${role}`, 'm'), `prompt manquant : ${role}`);
  }
});

test('le plan de sprints couvre S0 à S12', () => {
  for (let i = 0; i <= 12; i++) {
    assert.ok(procedure.includes(`**S${i}**`), `sprint S${i} absent`);
  }
});

test('la stack est rattachée à sa décision D-024 (ancien point M-009)', () => {
  assert.match(procedure, /M-009/);
  assert.match(procedure, /D-024/);
});

test('le registre contient les décisions de la phase 1 (D-021 à D-024)', () => {
  const registre = lire('../decisions/REGISTRE_DECISIONS.md');
  for (const id of ['D-021', 'D-022', 'D-023', 'D-024']) {
    assert.match(registre, new RegExp(`^\\| ${id} \\|`, 'm'), `décision ${id} absente`);
  }
  assert.match(registre, /Mali/);
  assert.match(prompts, /Mali/);
});
