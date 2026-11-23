// Vérifie la structure du backlog MVP et le respect des règles non négociables.
// Lancer : node --test docs/requirements/backlog.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const texte = readFileSync(fileURLToPath(new URL('./BACKLOG_MVP.md', import.meta.url)), 'utf8');

// Découpe le document en stories : chaque bloc commence par « #### US-… — titre ».
const stories = texte.split(/^#### /m).slice(1)
  .filter((bloc) => bloc.startsWith('US-'))
  .map((bloc) => {
    const id = bloc.match(/^(US-[A-Z0-9]+-\d{2})/)?.[1];
    const meta = bloc.match(/`(Must|Should|Could|Won't)` · `S(\d{1,2})` · (.+)/);
    return {
      id, bloc,
      priorite: meta?.[1], sprint: meta ? Number(meta[2]) : undefined, role: meta?.[3]?.trim(),
      criteres: (bloc.match(/^- Étant donné/gm) || []).length,
    };
  });

const parId = Object.fromEntries(stories.map((s) => [s.id, s]));

test('le backlog contient au moins 60 stories aux identifiants uniques', () => {
  assert.ok(stories.length >= 60, `seulement ${stories.length} stories`);
  const ids = stories.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'identifiant en double');
  assert.ok(ids.every(Boolean), 'story sans identifiant valide');
});

test('chaque story a priorité, sprint S0–S12, rôle, formulation et critère', () => {
  for (const s of stories) {
    assert.ok(s.priorite, `${s.id} : priorité manquante`);
    assert.ok(s.sprint >= 0 && s.sprint <= 12, `${s.id} : sprint invalide`);
    assert.ok(s.role, `${s.id} : rôle manquant`);
    assert.match(s.bloc, /En tant qu/, `${s.id} : formulation « En tant que » absente`);
    assert.ok(s.criteres >= 1, `${s.id} : aucun critère « Étant donné »`);
  }
});

test('chaque sprint de S0 à S11 contient au moins une story Must', () => {
  for (let i = 0; i <= 11; i++) {
    assert.ok(stories.some((s) => s.sprint === i && s.priorite === 'Must'), `S${i} sans story Must`);
  }
});

test('le parrainage est présent à l\'inscription et dans le compte (D-005)', () => {
  assert.equal(parId['US-AUT-01']?.priorite, 'Must');
  assert.match(parId['US-AUT-01'].bloc, /code de parrainage/i);
  assert.equal(parId['US-AUT-06']?.priorite, 'Must');
  assert.match(parId['US-AUT-06'].bloc, /Compte/);
});

test('aucun crédit sans webhook signé, idempotence couverte (D-008)', () => {
  const webhook = parId['US-WAL-03'];
  assert.equal(webhook?.priorite, 'Must');
  assert.match(webhook.bloc, /signature invalide/);
  assert.match(webhook.bloc, /rejoué/);
  assert.match(parId['US-WAL-02'].bloc, /n'est pas crédité/);
});

test('carton fermé et options avancées non commandables (D-010, D-011)', () => {
  assert.match(parId['US-ENT-02'].bloc, /sans l'ouvrir/);
  assert.match(parId['US-ENT-05'].bloc, /Bientôt disponible/);
  assert.match(parId['US-ENT-05'].bloc, /refusé/);
  for (const id of ['US-V2-01', 'US-V2-02', 'US-V2-03', 'US-V2-04']) {
    assert.equal(parId[id]?.priorite, "Won't", `${id} doit être hors MVP`);
  }
});

test('le lancement au Mali est pris en compte (D-021)', () => {
  assert.match(texte, /Mali/);
  assert.match(texte, /XOF/);
  assert.match(texte, /\+223/);
  assert.match(parId['US-WAL-02'].bloc, /Orange Money/);
});

test('les nouvelles hypothèses sont tracées', () => {
  for (const h of ['H-01', 'H-02', 'H-03', 'H-04', 'H-05']) {
    assert.match(texte, new RegExp(`\\| ${h} \\|`), `hypothèse ${h} absente du tableau`);
  }
});

test('aucune couleur jaune dans le backlog', () => {
  assert.doesNotMatch(texte, /#(FFFF00|FFD700|FFC107|FFEB3B|DAA520)\b/i);
});
