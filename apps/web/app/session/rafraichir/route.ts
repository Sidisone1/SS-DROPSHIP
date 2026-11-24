import { type NextRequest, NextResponse } from 'next/server';
import { appelerApi } from '../../../lib/api';
import { cheminSur } from '../../../lib/formulaire';
import { COOKIE_RAFRAICHISSEMENT, effacerJetons, enregistrerJetons } from '../../../lib/session';

/** Renouvelle le jeton d'accès (rotation côté API) puis revient à la page demandée. */
export async function GET(requete: NextRequest) {
  const suite = cheminSur(requete.nextUrl.searchParams.get('suite'));
  const jeton = requete.cookies.get(COOKIE_RAFRAICHISSEMENT)?.value;
  const r = jeton
    ? await appelerApi<{ jetonAcces: string; jetonRafraichissement: string; expireDans: number }>('/auth/rafraichir', {
        corps: { jetonRafraichissement: jeton },
      })
    : null;
  if (!r?.ok) {
    await effacerJetons();
    return NextResponse.redirect(new URL('/connexion?expire=1', requete.url));
  }
  await enregistrerJetons(r.donnees);
  return NextResponse.redirect(new URL(suite, requete.url));
}
