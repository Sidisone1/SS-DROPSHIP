import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Portee } from '../securite/jetons.js';

export const CLE_PUBLIC = 'ss:public';
export const CLE_ROLES = 'ss:roles';
export const CLE_PORTEE_MFA = 'ss:portee-mfa';

/** Route accessible sans connexion. Par défaut, toute route exige une session valide. */
export const Public = () => SetMetadata(CLE_PUBLIC, true);
/** Route réservée à certains rôles (ADR-004). */
export const Roles = (...roles: string[]) => SetMetadata(CLE_ROLES, roles);
/** Route accessible avec un jeton limité à la configuration de la double authentification. */
export const AutoriserConfigurationMfa = () => SetMetadata(CLE_PORTEE_MFA, true);

export interface UtilisateurConnecte {
  id: string;
  roles: string[];
  portee: Portee;
  sessionId: string;
}

export const Utilisateur = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UtilisateurConnecte => ctx.switchToHttp().getRequest().utilisateur,
);

export const IpClient = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return String(req.ip ?? req.socket?.remoteAddress ?? 'inconnue');
});
