// Jetons d'accès courts (JWT HS256, 15 min). Le jeton de rafraîchissement est opaque et stocké haché (codes.ts).
import { jwtVerify, SignJWT } from 'jose';

export const DUREE_ACCES_S = 15 * 60;
export const DUREE_RAFRAICHISSEMENT_MS = 30 * 24 * 3600_000;

/**
 * « complet » : accès normal. « configuration_mfa » : personnel sans double authentification active, limité à
 * l'activation de celle-ci (ADR-004).
 */
export type Portee = 'complet' | 'configuration_mfa';

export interface ContenuJeton {
  sub: string;
  roles: string[];
  portee: Portee;
  sid: string;
}

export async function signerAcces(contenu: ContenuJeton, cle: Buffer, maintenant = Date.now()): Promise<string> {
  return new SignJWT({ roles: contenu.roles, portee: contenu.portee, sid: contenu.sid })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(contenu.sub)
    .setIssuer('ss-dropship-api')
    .setIssuedAt(Math.floor(maintenant / 1000))
    .setExpirationTime(Math.floor(maintenant / 1000) + DUREE_ACCES_S)
    .sign(cle);
}

export async function verifierAcces(jeton: string, cle: Buffer): Promise<ContenuJeton | null> {
  try {
    const { payload } = await jwtVerify(jeton, cle, { issuer: 'ss-dropship-api', algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || !Array.isArray(payload.roles)) return null;
    return {
      sub: payload.sub,
      roles: payload.roles as string[],
      portee: payload.portee === 'configuration_mfa' ? 'configuration_mfa' : 'complet',
      sid: String(payload.sid ?? ''),
    };
  } catch {
    return null;
  }
}
