// Jetons du back-office dans des cookies httpOnly distincts de ceux du site client.
import { cookies } from 'next/headers';

const ACCES = 'ssa_acces';
const RAFRAICHISSEMENT = 'ssa_rafraichissement';
const base = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

export async function enregistrerJetons(j: { jetonAcces: string; jetonRafraichissement: string; expireDans: number }) {
  const c = await cookies();
  c.set(ACCES, j.jetonAcces, { ...base, maxAge: j.expireDans });
  // Le personnel se reconnecte chaque jour (double authentification), pas de session de 30 jours.
  c.set(RAFRAICHISSEMENT, j.jetonRafraichissement, { ...base, maxAge: 12 * 3600 });
}

export async function effacerJetons() {
  const c = await cookies();
  c.delete(ACCES);
  c.delete(RAFRAICHISSEMENT);
}

export async function jetonAcces(): Promise<string | undefined> {
  return (await cookies()).get(ACCES)?.value;
}
