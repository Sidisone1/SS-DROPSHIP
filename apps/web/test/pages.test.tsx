import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: unknown }) => (
    // biome-ignore lint/suspicious/noExplicitAny: maquette minimale de next/link pour le rendu serveur.
    <a href={href} {...(rest as any)}>
      {children as never}
    </a>
  ),
}));

const { default: Accueil } = await import('../app/page');
const { default: Inscription } = await import('../app/inscription/page');

describe('site client', () => {
  it("l'accueil présente les trois modes de commande (D-006) et le chat flottant", () => {
    const html = renderToStaticMarkup(<Accueil />);
    expect(html).toContain('Commande directe');
    expect(html).toContain('Recherche de produit');
    expect(html).toContain('Recherche avec négociation');
    expect(html).toContain('Discuter avec le support');
  });

  it("l'inscription contient le code de parrainage facultatif (D-005) et le Mali par défaut (D-021)", () => {
    const html = renderToStaticMarkup(<Inscription />);
    expect(html).toContain('Code de parrainage (facultatif)');
    expect(html).toContain('name="codeParrainage"');
    expect(html).toMatch(/<option value="ML" selected="">Mali<\/option>/);
    expect(html).not.toContain('Ghana'); // pays fermé au lancement
  });

  it('la feuille de style n’utilise que les variables de la charte, aucune couleur codée en dur', () => {
    const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toMatch(/\b(yellow|gold|orange)\b/i);
  });
});
