// Mots de passe hachés avec Argon2id (ADR-004). Jamais stockés ni journalisés en clair.
import { hash, verify } from '@node-rs/argon2';

const COURANTS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'motdepasse',
  'azertyui',
  'qwertyui',
  '00000000',
  '11111111',
  'ssdropship',
  'password1',
  'iloveyou',
]);

/** Règle : 8 caractères minimum, pas un mot de passe trivial. Renvoie un message d'erreur ou null. */
export function verifierRobustesse(motDePasse: string): string | null {
  if (motDePasse.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (COURANTS.has(motDePasse.toLowerCase())) return 'Ce mot de passe est trop courant.';
  if (/^(.)\1+$/.test(motDePasse)) return 'Ce mot de passe est trop simple.';
  return null;
}

export const hacherMotDePasse = (motDePasse: string): Promise<string> => hash(motDePasse);

export async function verifierMotDePasse(empreinte: string, motDePasse: string): Promise<boolean> {
  try {
    return await verify(empreinte, motDePasse);
  } catch {
    return false;
  }
}
