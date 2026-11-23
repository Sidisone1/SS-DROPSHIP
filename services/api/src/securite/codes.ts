// Codes à usage unique (vérification de contact, réinitialisation) et jetons opaques.
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export const DUREE_CODE_MS = 10 * 60_000;
export const ESSAIS_MAX = 5;
export const BLOCAGE_MS = 15 * 60_000;

/** Code à 6 chiffres, tiré par un générateur cryptographique. */
export const genererCode = (): string => String(randomInt(0, 1_000_000)).padStart(6, '0');

/** Empreinte HMAC du code : la base ne contient jamais le code lui-même. */
export const hacherCode = (code: string, cle: Buffer): string => createHmac('sha256', cle).update(code).digest('hex');

export function comparerCode(code: string, empreinte: string, cle: Buffer): boolean {
  const a = Buffer.from(hacherCode(code, cle), 'hex');
  const b = Buffer.from(empreinte, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Jeton de rafraîchissement opaque (256 bits) et son empreinte stockée. */
export const genererJetonOpaque = (): string => randomBytes(32).toString('base64url');
export const empreinteJeton = (jeton: string): string => createHash('sha256').update(jeton).digest('hex');
