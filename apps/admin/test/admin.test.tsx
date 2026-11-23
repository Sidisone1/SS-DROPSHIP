import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MODULES } from '../app/modules';

const { default: Connexion } = await import('../app/page');
const { default: TableauDeBord } = await import('../app/tableau-de-bord/page');

describe('back-office', () => {
  it('la connexion prévoit la double authentification (ADR-004)', () => {
    const html = renderToStaticMarkup(<Connexion />);
    expect(html).toContain('name="codeMfa"');
    expect(html).toContain('Accès réservé au personnel habilité.');
  });

  it("le tableau de bord n'affiche aucun chiffre inventé", () => {
    const html = renderToStaticMarkup(<TableauDeBord />).replaceAll('&#x27;', "'");
    for (const m of MODULES) expect(html).toContain(m.titre);
    expect(html).not.toMatch(/>\s*\d[\d\s]*\s*</); // aucun compteur chiffré
  });

  it('chaque module est réservé à des rôles internes, jamais au client', () => {
    for (const m of MODULES) {
      expect(m.roles.length).toBeGreaterThan(0);
      expect(m.roles).not.toContain('client');
    }
  });

  it('le répertoire des transitaires et les paramètres incluent le rôle admin (D-013)', () => {
    expect(MODULES.find((m) => m.cle === 'transport')?.roles).toContain('admin');
    expect(MODULES.find((m) => m.cle === 'parametres')?.roles).toEqual(['admin']);
  });

  it('aucune couleur codée en dur dans la feuille de style', () => {
    const css = readFileSync(new URL('../app/admin.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });
});
