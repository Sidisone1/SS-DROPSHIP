// Chiffrement symétrique AES-256-GCM pour les secrets stockés en base (secret TOTP).
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export function chiffrer(texte: string, cle: Buffer): string {
  const iv = randomBytes(12);
  const chiffreur = createCipheriv('aes-256-gcm', cle, iv);
  const donnees = Buffer.concat([chiffreur.update(texte, 'utf8'), chiffreur.final()]);
  return [iv, chiffreur.getAuthTag(), donnees].map((b) => b.toString('base64url')).join('.');
}

export function dechiffrer(paquet: string, cle: Buffer): string {
  const [iv, etiquette, donnees] = paquet.split('.').map((p) => Buffer.from(p, 'base64url'));
  if (!iv || !etiquette || !donnees) throw new Error('Donnée chiffrée invalide');
  const dechiffreur = createDecipheriv('aes-256-gcm', cle, iv);
  dechiffreur.setAuthTag(etiquette);
  return Buffer.concat([dechiffreur.update(donnees), dechiffreur.final()]).toString('utf8');
}
