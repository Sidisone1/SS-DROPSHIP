/**
 * Sprint S1 — Stockage sûr des mots de passe.
 * Le sel et la dérivation sont générés côté API ; ne jamais stocker ou journaliser le secret.
 * Format versionné : scrypt$N$r$p$saltBase64url$hashBase64url.
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const N = 16384;
const R = 8;
const P = 1;
const TAILLE_CLE = 64;
const MAX_MEMOIRE = 64 * 1024 * 1024;

export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  if (typeof motDePasse !== 'string' || motDePasse.length < 8 || motDePasse.length > 128) {
    throw new RangeError('Longueur de mot de passe invalide');
  }
  const sel = randomBytes(16);
  const derive = (await scrypt(motDePasse, sel, TAILLE_CLE, {
    N, r: R, p: P, maxmem: MAX_MEMOIRE,
  })) as Buffer;
  return ['scrypt', N, R, P, sel.toString('base64url'), derive.toString('base64url')].join('$');
}

export async function verifierMotDePasse(motDePasse: string, empreinte: string): Promise<boolean> {
  if (typeof motDePasse !== 'string' || typeof empreinte !== 'string') return false;
  const elements = empreinte.split('$');
  if (elements.length !== 6) return false;
  const [algorithme, n, r, p, selEncode, deriveEncode] = elements;
  // Paramètres strictement bornés : aucune empreinte externe ne peut déclencher un coût scrypt arbitraire.
  if (algorithme !== 'scrypt' || n !== String(N) || r !== String(R) || p !== String(P)) return false;
  if (!selEncode || !deriveEncode || !/^[A-Za-z0-9_-]+$/.test(selEncode) || !/^[A-Za-z0-9_-]+$/.test(deriveEncode)) return false;
  const sel = Buffer.from(selEncode, 'base64url');
  const attendu = Buffer.from(deriveEncode, 'base64url');
  if (sel.length !== 16 || attendu.length !== TAILLE_CLE) return false;
  const calcule = (await scrypt(motDePasse, sel, TAILLE_CLE, {
    N, r: R, p: P, maxmem: MAX_MEMOIRE,
  })) as Buffer;
  return timingSafeEqual(attendu, calcule);
}
