import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export function nouveauJeton(): string {
  return randomBytes(32).toString('base64url');
}

export function empreinteJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

/** OTP à six chiffres. Seule une empreinte avec sel aléatoire est persistée. */
export function nouveauCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function empreinteCode(code: string): string {
  const sel = randomBytes(16).toString('hex');
  return sel + ':' + createHash('sha256').update(sel + ':' + code).digest('hex');
}

export function comparerCode(code: string, empreinte: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const [sel, valeur] = empreinte.split(':');
  if (!sel || !valeur || !/^[a-f0-9]{32}$/.test(sel) || !/^[a-f0-9]{64}$/.test(valeur)) return false;
  const attente = Buffer.from(valeur, 'hex');
  const presente = createHash('sha256').update(sel + ':' + code).digest();
  return timingSafeEqual(attente, presente);
}
