import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { interdit, nonAuthentifie } from '../commun/erreurs.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { verifierAcces } from '../securite/jetons.js';
import { CLES, type Cles } from './cles.js';
import { CLE_PORTEE_MFA, CLE_PUBLIC, CLE_ROLES } from './decorateurs.js';

/**
 * Garde globale : refuse par défaut. Vérifie le jeton, la session (non révoquée), l'état du compte, la portée
 * (double authentification du personnel) et les rôles exigés par la route.
 */
@Injectable()
export class GardeAuth implements CanActivate {
  constructor(
    private readonly reflecteur: Reflector,
    private readonly prisma: PrismaService,
    @Inject(CLES) private readonly cles: Cles,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const cibles = [ctx.getHandler(), ctx.getClass()];
    if (this.reflecteur.getAllAndOverride<boolean>(CLE_PUBLIC, cibles)) return true;

    const req = ctx.switchToHttp().getRequest();
    const entete = String(req.headers.authorization ?? '');
    const jeton = entete.startsWith('Bearer ') ? entete.slice(7) : '';
    const contenu = jeton ? await verifierAcces(jeton, this.cles.jetons) : null;
    if (!contenu) throw nonAuthentifie('non_authentifie', 'Connectez-vous pour continuer.');

    const session = await this.prisma.session.findUnique({
      where: { id: contenu.sid },
      select: { revoqueLe: true, expireLe: true, utilisateur: { select: { etat: true, roles: true } } },
    });
    if (!session || session.revoqueLe || session.expireLe < new Date() || session.utilisateur.etat !== 'actif') {
      throw nonAuthentifie('session_invalide', 'Votre session a expiré. Reconnectez-vous.');
    }

    if (contenu.portee === 'configuration_mfa' && !this.reflecteur.getAllAndOverride<boolean>(CLE_PORTEE_MFA, cibles)) {
      throw interdit('mfa_a_configurer', 'Activez la double authentification pour accéder au back-office.');
    }

    // Les rôles sont relus en base : un retrait de rôle s'applique immédiatement.
    const roles = session.utilisateur.roles as string[];
    const exiges = this.reflecteur.getAllAndOverride<string[]>(CLE_ROLES, cibles);
    if (exiges?.length && !exiges.some((r) => roles.includes(r))) {
      throw interdit('role_insuffisant', 'Votre rôle ne permet pas cette action.');
    }

    req.utilisateur = { id: contenu.sub, roles, portee: contenu.portee, sessionId: contenu.sid };
    return true;
  }
}
