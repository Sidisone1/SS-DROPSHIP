import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export function nouveauJeton(): string {
  return randomBytes(32).toString('base64url');
}
export function empreinteJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

export function nouveauCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** Empreinte HMAC : un vol de base seul ne permet pas de tester les 1M codes hors ligne. */
function secretOtp(): string {
  const secret = process.env.SS_OTP_PEPPER;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('SS_OTP_PEPPER non configuré : génération et vérification OTP interdites');
  }
  return secret;
}
function hmacCode(sel: string, code: string): Buffer {
  return createHmac('sha256', secretOtp()).update(sel + ':' + code).digest();
}
export function empreinteCode(code: string): string {
  if (!/^\d{6}$/.test(code)) throw new RangeError('Code OTP invalide');
  const sel = randomBytes(16).toString('hex');
  return sel + ':' + hmacCode(sel, code).toString('hex');
}
export function comparerCode(code: string, empreinte: string): boolean {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return false;
  if (typeof empreinte !== 'string') return false;
  const [sel, valeur] = empreinte.split(':');
  if (!sel || !valeur || !/^[a-f0-9]{32}$/.test(sel) || !/^[a-f0-9]{64}$/.test(valeur)) return false;
  return timingSafeEqual(Buffer.from(valeur, 'hex'), hmacCode(sel, code));
}
