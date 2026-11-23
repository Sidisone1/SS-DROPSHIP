// Double authentification TOTP (RFC 6238, HMAC-SHA1, pas de 30 s, 6 chiffres), compatible avec les applications
// d'authentification courantes. Implémentation sans dépendance, vérifiée par les vecteurs de test de la RFC.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encoder(octets: Buffer): string {
  let bits = 0;
  let valeur = 0;
  let sortie = '';
  for (const octet of octets) {
    valeur = (valeur << 8) | octet;
    bits += 8;
    while (bits >= 5) {
      sortie += ALPHABET[(valeur >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) sortie += ALPHABET[(valeur << (5 - bits)) & 31];
  return sortie;
}

export function base32Decoder(texte: string): Buffer {
  const propre = texte.replace(/=+$/, '').replace(/\s/g, '').toUpperCase();
  let bits = 0;
  let valeur = 0;
  const octets: number[] = [];
  for (const c of propre) {
    const i = ALPHABET.indexOf(c);
    if (i < 0) throw new Error('Secret base32 invalide');
    valeur = (valeur << 5) | i;
    bits += 5;
    if (bits >= 8) {
      octets.push((valeur >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(octets);
}

export const genererSecretTotp = (): string => base32Encoder(randomBytes(20));

export function codeTotp(secret: Buffer, instantMs: number, chiffres = 6, pasSecondes = 30): string {
  const compteur = Math.floor(instantMs / 1000 / pasSecondes);
  const tampon = Buffer.alloc(8);
  tampon.writeBigUInt64BE(BigInt(compteur));
  const hmac = createHmac('sha1', secret).update(tampon).digest();
  const decalage = (hmac[hmac.length - 1] as number) & 0x0f;
  const binaire = hmac.readUInt32BE(decalage) & 0x7fffffff;
  return String(binaire % 10 ** chiffres).padStart(chiffres, '0');
}

/** Accepte le code du pas courant et d'un pas de part et d'autre (décalage d'horloge du téléphone). */
export function verifierTotp(code: string, secretBase32: string, instantMs = Date.now(), fenetre = 1): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const secret = base32Decoder(secretBase32);
  for (let d = -fenetre; d <= fenetre; d++) {
    const attendu = codeTotp(secret, instantMs + d * 30_000);
    if (timingSafeEqual(Buffer.from(attendu), Buffer.from(code))) return true;
  }
  return false;
}

export function urlOtpauth(secretBase32: string, compte: string, emetteur = 'SS DROPSHIP'): string {
  const libelle = encodeURIComponent(`${emetteur}:${compte}`);
  return `otpauth://totp/${libelle}?secret=${secretBase32}&issuer=${encodeURIComponent(emetteur)}&algorithm=SHA1&digits=6&period=30`;
}
