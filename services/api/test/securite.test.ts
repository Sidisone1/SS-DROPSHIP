import { describe, expect, it } from 'vitest';
import { chiffrer, dechiffrer } from '../src/securite/chiffrement.js';
import { comparerCode, empreinteJeton, genererCode, genererJetonOpaque, hacherCode } from '../src/securite/codes.js';
import {
  genererCodeParrainage,
  normaliserCodeParrainage,
  normaliserEmail,
  normaliserIdentifiant,
  normaliserTelephone,
} from '../src/securite/identite.js';
import { signerAcces, verifierAcces } from '../src/securite/jetons.js';
import { Limiteur } from '../src/securite/limiteur.js';
import { hacherMotDePasse, verifierMotDePasse, verifierRobustesse } from '../src/securite/motdepasse.js';
import { deriverCle } from '../src/securite/secrets.js';
import { base32Decoder, base32Encoder, codeTotp, urlOtpauth, verifierTotp } from '../src/securite/totp.js';

const SECRET = 'secret-de-test-suffisamment-long-pour-hkdf-0123456789';

describe('mots de passe', () => {
  it('Argon2id : vérifie le bon mot de passe et refuse un mauvais', async () => {
    const h = await hacherMotDePasse('Bamako-2027!');
    expect(h.startsWith('$argon2id$')).toBe(true);
    expect(await verifierMotDePasse(h, 'Bamako-2027!')).toBe(true);
    expect(await verifierMotDePasse(h, 'bamako-2027!')).toBe(false);
    expect(await verifierMotDePasse('empreinte-corrompue', 'x')).toBe(false);
  });

  it('refuse les mots de passe courts ou triviaux', () => {
    expect(verifierRobustesse('court')).toMatch(/8 caractères/);
    expect(verifierRobustesse('12345678')).toMatch(/courant/);
    expect(verifierRobustesse('aaaaaaaaaa')).toMatch(/simple/);
    expect(verifierRobustesse('Bamako-2027!')).toBeNull();
  });
});

describe('codes et jetons opaques', () => {
  const cle = deriverCle(SECRET, 'codes');
  it('code à 6 chiffres, stocké en empreinte, comparaison exacte', () => {
    const code = genererCode();
    expect(code).toMatch(/^\d{6}$/);
    const empreinte = hacherCode(code, cle);
    expect(empreinte).not.toContain(code);
    expect(comparerCode(code, empreinte, cle)).toBe(true);
    expect(comparerCode(code === '000000' ? '000001' : '000000', empreinte, cle)).toBe(false);
  });

  it('clés dérivées distinctes par usage', () => {
    expect(deriverCle(SECRET, 'codes').equals(deriverCle(SECRET, 'jetons'))).toBe(false);
  });

  it('jeton opaque de 256 bits et empreinte SHA-256', () => {
    const j = genererJetonOpaque();
    expect(Buffer.from(j, 'base64url')).toHaveLength(32);
    expect(empreinteJeton(j)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('TOTP (RFC 6238)', () => {
  // Vecteurs officiels de la RFC 6238 (SHA-1, secret ASCII « 12345678901234567890 », 8 chiffres).
  const secretRfc = Buffer.from('12345678901234567890');
  it.each([
    [59, '94287082'],
    [1111111109, '07081804'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
  ])('à t=%i s le code est %s', (t, attendu) => {
    expect(codeTotp(secretRfc, t * 1000, 8)).toBe(attendu);
  });

  it('base32 aller-retour', () => {
    expect(base32Decoder(base32Encoder(secretRfc)).equals(secretRfc)).toBe(true);
    expect(base32Encoder(secretRfc)).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  });

  it('accepte le pas courant et voisin, refuse un code ancien', () => {
    const secret = base32Encoder(secretRfc);
    const t = 1_700_000_000_000;
    const code = codeTotp(secretRfc, t);
    expect(verifierTotp(code, secret, t)).toBe(true);
    expect(verifierTotp(code, secret, t + 30_000)).toBe(true);
    expect(verifierTotp(code, secret, t + 120_000)).toBe(false);
    expect(verifierTotp('abc', secret, t)).toBe(false);
  });

  it('URL otpauth pour l application d authentification', () => {
    expect(urlOtpauth('ABC', 'agent@ssdropship.com')).toMatch(/^otpauth:\/\/totp\/SS%20DROPSHIP%3Aagent%40/);
  });
});

describe('chiffrement AES-256-GCM', () => {
  const cle = deriverCle(SECRET, 'mfa');
  it('aller-retour et détection de falsification', () => {
    const paquet = chiffrer('JBSWY3DPEHPK3PXP', cle);
    expect(paquet).not.toContain('JBSWY3DPEHPK3PXP');
    expect(dechiffrer(paquet, cle)).toBe('JBSWY3DPEHPK3PXP');
    const [iv, tag, data] = paquet.split('.');
    expect(() => dechiffrer([iv, tag, `${data}A`].join('.'), cle)).toThrow();
  });
});

describe('jetons d accès', () => {
  const cle = deriverCle(SECRET, 'jetons');
  it('signés, vérifiés, expirés après 15 minutes', async () => {
    const t0 = Date.now();
    const jeton = await signerAcces({ sub: 'usr_1', roles: ['client'], portee: 'complet', sid: 's1' }, cle, t0);
    expect(await verifierAcces(jeton, cle)).toMatchObject({ sub: 'usr_1', roles: ['client'], portee: 'complet' });
    expect(await verifierAcces(jeton, deriverCle('autre-secret-long-0123456789-abcdef', 'jetons'))).toBeNull();
    const vieux = await signerAcces({ sub: 'u', roles: [], portee: 'complet', sid: 's' }, cle, t0 - 16 * 60_000);
    expect(await verifierAcces(vieux, cle)).toBeNull();
  });
});

describe('limiteur', () => {
  it('bloque au-delà du maximum dans la fenêtre, puis libère', () => {
    const l = new Limiteur(3, 60_000);
    expect([1, 2, 3].map(() => l.autoriser('ip', 1000))).toEqual([true, true, true]);
    expect(l.autoriser('ip', 2000)).toBe(false);
    expect(l.autoriser('autre', 2000)).toBe(true);
    expect(l.autoriser('ip', 62_000)).toBe(true);
  });
});

describe('identifiants et parrainage', () => {
  it('normalise les téléphones maliens en E.164', () => {
    expect(normaliserTelephone('70 00 00 00', 'ML')).toBe('+22370000000');
    expect(normaliserTelephone('0022370000000', 'ML')).toBe('+22370000000');
    expect(normaliserTelephone('+223 70-00-00-00', 'ML')).toBe('+22370000000');
    expect(normaliserTelephone('abc', 'ML')).toBeNull();
  });

  it('normalise les emails et détecte le type d identifiant', () => {
    expect(normaliserEmail(' Awa@Exemple.ML ')).toBe('awa@exemple.ml');
    expect(normaliserEmail('pas-un-email')).toBeNull();
    expect(normaliserIdentifiant('awa@exemple.ml')).toEqual({ email: 'awa@exemple.ml' });
    expect(normaliserIdentifiant('70000000')).toEqual({ telephone: '+22370000000' });
  });

  it('code de parrainage lisible, sans accents ni caractères ambigus', () => {
    const code = genererCodeParrainage('Aïssata Traoré', () => 0);
    expect(code).toBe(`${'AISSATAAA'.slice(0, 6)}AAA`);
    expect(genererCodeParrainage('Lê', () => 30)).toBe('LE999');
    expect(genererCodeParrainage('9', () => 0)).toBe('SSAAA');
    for (let i = 0; i < 50; i++) expect(genererCodeParrainage('Moussa')).toMatch(/^MOUSSA[A-HJ-NP-Z2-9]{3}$/);
    expect(normaliserCodeParrainage(' moussa7kq ')).toBe('MOUSSA7KQ');
  });
});
