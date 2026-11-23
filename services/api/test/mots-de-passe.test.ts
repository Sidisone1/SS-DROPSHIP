import { describe, expect, it } from 'vitest';
import { hacherMotDePasse, verifierMotDePasse } from '../src/auth/mots-de-passe.js';

describe('Sprint S1 — mots de passe', () => {
  it('stocke une empreinte scrypt salée et jamais le secret', async () => {
    const hash = await hacherMotDePasse('SecretDeTest2026!');
    expect(hash.startsWith('scrypt$16384$8$1$')).toBe(true);
    expect(hash).not.toContain('SecretDeTest2026!');
    expect(await verifierMotDePasse('SecretDeTest2026!', hash)).toBe(true);
    expect(await verifierMotDePasse('Incorrect2026!', hash)).toBe(false);
  });

  it('utilise un sel aléatoire pour chaque empreinte', async () => {
    const premier = await hacherMotDePasse('SecretDeTest2026!');
    const second = await hacherMotDePasse('SecretDeTest2026!');
    expect(premier).not.toEqual(second);
    expect(await verifierMotDePasse('SecretDeTest2026!', second)).toBe(true);
  });

  it('rejette les mots de passe trop courts ou trop longs', async () => {
    await expect(hacherMotDePasse('court')).rejects.toBeInstanceOf(RangeError);
    await expect(hacherMotDePasse('x'.repeat(129))).rejects.toBeInstanceOf(RangeError);
  });

  it('rejette les empreintes corrompues et paramètres non conformes', async () => {
    expect(await verifierMotDePasse('SecretDeTest2026!', '')).toBe(false);
    expect(await verifierMotDePasse('SecretDeTest2026!', 'scrypt$99999999$8$1$xx$yy')).toBe(false);
    expect(await verifierMotDePasse('SecretDeTest2026!', 'scrypt$16384$8$1$bad$bad')).toBe(false);
    expect(await verifierMotDePasse('SecretDeTest2026!', 'argon2$1$2$3$xx$yy')).toBe(false);
  });
});
