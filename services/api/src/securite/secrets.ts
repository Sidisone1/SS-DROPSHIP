// Clés dérivées d'un secret maître (APP_SECRET) par HKDF : une clé distincte par usage (ADR-004).
import { hkdfSync } from 'node:crypto';

export type UsageCle = 'jetons' | 'codes' | 'mfa';

export function deriverCle(secretMaitre: string, usage: UsageCle): Buffer {
  return Buffer.from(hkdfSync('sha256', secretMaitre, 'ss-dropship', `cle:${usage}`, 32));
}
