// Vérifie que les états sont identiques dans les contrats TypeScript, le schéma de base et le contrat d'API.
// Une divergence ferait accepter par l'API un état que la base refuse, ou afficher un état inconnu au client.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ETATS_COMMANDE, ETATS_PAIEMENT, ETATS_COLIS, OPTIONS_ENTREPOT } from './index.ts';

const lire = (chemin: string) => readFileSync(fileURLToPath(new URL(chemin, import.meta.url)), 'utf8');
const prisma = lire('../../../services/api/prisma/schema.prisma');
const openapi = lire('../../../docs/architecture/openapi.yaml');
const protections = lire('../../../services/api/prisma/migrations/20261123000100_protections/migration.sql');

function enumPrisma(nom: string): string[] {
  const bloc = prisma.match(new RegExp(`enum ${nom} \\{([^}]*)\\}`))?.[1];
  assert.ok(bloc, `enum Prisma ${nom} introuvable`);
  return bloc.split('\n').map((l) => l.replace(/\/\/.*/, '').trim()).filter(Boolean);
}

function enumOpenApi(nom: string): string[] {
  const bloc = openapi.match(new RegExp(`\\n    ${nom}:\\n      type: string\\n      enum: \\[([^\\]]*)\\]`))?.[1];
  assert.ok(bloc, `schéma OpenAPI ${nom} introuvable`);
  return bloc.split(',').map((s) => s.trim()).filter(Boolean);
}

test('états de commande identiques : TypeScript = Prisma = OpenAPI', () => {
  assert.deepEqual(enumPrisma('EtatCommande'), [...ETATS_COMMANDE]);
  assert.deepEqual(enumOpenApi('EtatCommande'), [...ETATS_COMMANDE]);
});

test('états de paiement identiques : TypeScript = Prisma', () => {
  assert.deepEqual(enumPrisma('EtatPaiement'), [...ETATS_PAIEMENT]);
});

test('états de colis identiques : TypeScript = Prisma = OpenAPI', () => {
  assert.deepEqual(enumPrisma('EtatColis'), [...ETATS_COLIS]);
  assert.deepEqual(enumOpenApi('EtatColis'), [...ETATS_COLIS]);
});

test('les options V2 insérées en base sont celles des contrats, toutes indisponibles', () => {
  for (const code of Object.keys(OPTIONS_ENTREPOT)) {
    assert.match(protections, new RegExp(`\\('${code}', 'options\\.${code}', false\\)`), `option ${code} absente de la migration`);
  }
});
