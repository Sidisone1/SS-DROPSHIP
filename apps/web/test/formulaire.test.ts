import { describe, expect, it } from 'vitest';
import { cheminSur, etatDepuisErreur } from '../lib/formulaire';

describe('outils de formulaire', () => {
  it('reprend le message et les champs en erreur de l API', () => {
    expect(
      etatDepuisErreur({
        message: 'Certaines informations sont invalides.',
        details: { champs: { telephone: 'invalide' } },
      }),
    ).toEqual({
      message: 'Certaines informations sont invalides.',
      champs: { telephone: 'invalide' },
    });
    expect(etatDepuisErreur({}).message).toMatch(/erreur/);
  });

  it('refuse les redirections vers un autre site', () => {
    expect(cheminSur('/compte')).toBe('/compte');
    expect(cheminSur('https://pirate.example')).toBe('/compte');
    expect(cheminSur('//pirate.example')).toBe('/compte');
    expect(cheminSur('/\\pirate.example')).toBe('/compte');
    expect(cheminSur(null, '/')).toBe('/');
  });
});
