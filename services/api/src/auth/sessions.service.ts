import { Inject, Injectable } from '@nestjs/common';
import { nonAuthentifie } from '../commun/erreurs.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { empreinteJeton, genererJetonOpaque } from '../securite/codes.js';
import { DUREE_ACCES_S, DUREE_RAFRAICHISSEMENT_MS, type Portee, signerAcces } from '../securite/jetons.js';
import { CLES, type Cles } from './cles.js';

export interface Jetons {
  jetonAcces: string;
  jetonRafraichissement: string;
  expireDans: number;
  portee: Portee;
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CLES) private readonly cles: Cles,
  ) {}

  async ouvrir(utilisateur: { id: string; roles: string[] }, portee: Portee, appareil?: string): Promise<Jetons> {
    const jetonRafraichissement = genererJetonOpaque();
    const session = await this.prisma.session.create({
      data: {
        utilisateurId: utilisateur.id,
        jetonHash: empreinteJeton(jetonRafraichissement),
        appareil: appareil?.slice(0, 200) ?? null,
        expireLe: new Date(Date.now() + DUREE_RAFRAICHISSEMENT_MS),
      },
    });
    const jetonAcces = await signerAcces(
      { sub: utilisateur.id, roles: utilisateur.roles, portee, sid: session.id },
      this.cles.jetons,
    );
    return { jetonAcces, jetonRafraichissement, expireDans: DUREE_ACCES_S, portee };
  }

  /**
   * Rotation : l'ancien jeton est révoqué et un nouveau est émis. Si un jeton déjà révoqué est présenté (vol probable),
   * toutes les sessions de l'utilisateur sont fermées.
   */
  async rafraichir(jeton: string): Promise<Jetons> {
    const session = await this.prisma.session.findUnique({
      where: { jetonHash: empreinteJeton(jeton) },
      include: { utilisateur: { select: { id: true, roles: true, etat: true, mfaActive: true } } },
    });
    if (!session) throw nonAuthentifie('session_invalide', 'Votre session a expiré. Reconnectez-vous.');
    if (session.revoqueLe) {
      await this.fermerToutes(session.utilisateurId);
      throw nonAuthentifie('session_invalide', 'Votre session a expiré. Reconnectez-vous.');
    }
    if (session.expireLe < new Date() || session.utilisateur.etat !== 'actif') {
      throw nonAuthentifie('session_invalide', 'Votre session a expiré. Reconnectez-vous.');
    }
    await this.prisma.session.update({ where: { id: session.id }, data: { revoqueLe: new Date() } });
    const roles = session.utilisateur.roles as string[];
    const personnel = roles.some((r) => r !== 'client');
    const portee: Portee = personnel && !session.utilisateur.mfaActive ? 'configuration_mfa' : 'complet';
    return this.ouvrir({ id: session.utilisateur.id, roles }, portee, session.appareil ?? undefined);
  }

  async fermer(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: sessionId, revoqueLe: null },
      data: { revoqueLe: new Date() },
    });
  }

  async fermerToutes(utilisateurId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { utilisateurId, revoqueLe: null },
      data: { revoqueLe: new Date() },
    });
  }
}
