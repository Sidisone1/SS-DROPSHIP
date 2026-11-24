// Jetons de session dans des cookies httpOnly : jamais accessibles au JavaScript du navigateur (protection XSS).
import { cookies } from 'next/headers';

export const COOKIE_ACCES = 'ss_acces';
export const COOKIE_RAFRAICHISSEMENT = 'ss_rafraichissement';

const base = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

export async function enregistrerJetons(jetons: {
  jetonAcces: string;
  jetonRafraichissement: string;
  expireDans: number;
}) {
  const c = await cookies();
  c.set(COOKIE_ACCES, jetons.jetonAcces, { ...base, maxAge: jetons.expireDans });
  c.set(COOKIE_RAFRAICHISSEMENT, jetons.jetonRafraichissement, { ...base, maxAge: 30 * 24 * 3600 });
}

export async function effacerJetons() {
  const c = await cookies();
  c.delete(COOKIE_ACCES);
  c.delete(COOKIE_RAFRAICHISSEMENT);
}

export async function lireJetons() {
  const c = await cookies();
  return { acces: c.get(COOKIE_ACCES)?.value, rafraichissement: c.get(COOKIE_RAFRAICHISSEMENT)?.value };
}
