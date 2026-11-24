// Chaque route codée dans l'API doit figurer dans le contrat OpenAPI (docs/architecture/openapi.yaml).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = fileURLToPath(new URL('../src/', import.meta.url));
const contrat = readFileSync(
  fileURLToPath(new URL('../../../docs/architecture/openapi.yaml', import.meta.url)),
  'utf8',
);

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((n) => {
    const chemin = join(dossier, n);
    return statSync(chemin).isDirectory() ? fichiers(chemin) : chemin.endsWith('.controller.ts') ? [chemin] : [];
  });
}

/** Extrait [méthode, chemin OpenAPI] de chaque route NestJS (`:id` devient `{id}`). */
function routes(): [string, string][] {
  return fichiers(src).flatMap((f) => {
    const code = readFileSync(f, 'utf8');
    const base = code.match(/@Controller\('([^']*)'\)/)?.[1] ?? '';
    return [...code.matchAll(/@(Get|Post|Put|Patch|Delete)\((?:'([^']*)')?\)/g)].map(([, methode, chemin]) => {
      const complet = `/${[base, chemin].filter(Boolean).join('/')}`.replace(/:(\w+)/g, '{$1}');
      return [String(methode).toLowerCase(), complet] as [string, string];
    });
  });
}

describe('contrat OpenAPI', () => {
  const liste = routes();

  it('trouve les routes de l API', () => {
    expect(liste.length).toBeGreaterThan(20);
  });

  it.each(liste)('%s %s est documentée', (methode, chemin) => {
    const debut = contrat.indexOf(`\n  ${chemin}:\n`);
    expect(debut, `chemin absent du contrat : ${chemin}`).toBeGreaterThan(-1);
    const suite = contrat.slice(debut + 1);
    const finBloc = suite.slice(1).search(/\n {2}\/|\ncomponents:/);
    expect(suite.slice(0, finBloc + 1)).toMatch(new RegExp(`\\n    ${methode}:\\n`));
  });
});
