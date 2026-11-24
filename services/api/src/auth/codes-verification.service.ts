import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ErreurMetier, tropDeTentatives } from '../commun/erreurs.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BLOCAGE_MS, comparerCode, DUREE_CODE_MS, ESSAIS_MAX, genererCode, hacherCode } from '../securite/codes.js';
import { CLES, type Cles } from './cles.js';

type Objet = 'telephone' | 'email' | 'mot_de_passe';

/** Codes à usage unique : 6 chiffres, 10 minutes, 5 essais puis blocage 15 minutes (US-AUT-02). */
@Injectable()
export class CodesVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    @Inject(CLES) private readonly cles: Cles,
  ) {}

  private async verifierBlocage(utilisateurId: string, objet: Objet): Promise<void> {
    const bloque = await this.prisma.codeVerification.findFirst({
      where: { utilisateurId, objet, bloqueJusquau: { gt: new Date() } },
      select: { id: true },
    });
    if (bloque) throw tropDeTentatives('Trop de codes erronés. Réessayez dans 15 minutes.');
  }

  async emettre(
    utilisateur: { id: string; telephone: string | null; email: string | null; langue: string },
    objet: Objet,
  ): Promise<'sms' | 'email'> {
    await this.verifierBlocage(utilisateur.id, objet);
    // Un nouveau code invalide les précédents.
    await this.prisma.codeVerification.updateMany({
      where: { utilisateurId: utilisateur.id, objet, utiliseLe: null },
      data: { expireLe: new Date() },
    });
    const code = genererCode();
    const enregistrement = await this.prisma.codeVerification.create({
      data: {
        utilisateurId: utilisateur.id,
        objet,
        codeHash: hacherCode(code, this.cles.codes),
        expireLe: new Date(Date.now() + DUREE_CODE_MS),
      },
    });
    const modele = objet === 'mot_de_passe' ? 'code.reinitialisation' : 'code.verification';
    return this.notifications.envoyerCode(utilisateur, modele, code, `code:${enregistrement.id}`);
  }

  /** Consomme le code s'il est valide ; sinon compte l'essai et bloque au 5e. */
  async consommer(utilisateurId: string, objet: Objet, code: string): Promise<void> {
    await this.verifierBlocage(utilisateurId, objet);
    const courant = await this.prisma.codeVerification.findFirst({
      where: { utilisateurId, objet, utiliseLe: null },
      orderBy: { creeLe: 'desc' },
    });
    if (!courant || courant.expireLe < new Date()) {
      throw new ErreurMetier(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'code_expire',
        'Ce code a expiré. Demandez-en un nouveau.',
      );
    }
    if (!comparerCode(code, courant.codeHash, this.cles.codes)) {
      const tentatives = courant.tentatives + 1;
      const bloquer = tentatives >= ESSAIS_MAX;
      await this.prisma.codeVerification.update({
        where: { id: courant.id },
        data: { tentatives, ...(bloquer ? { bloqueJusquau: new Date(Date.now() + BLOCAGE_MS) } : {}) },
      });
      if (bloquer) throw tropDeTentatives('Trop de codes erronés. Réessayez dans 15 minutes.');
      throw new ErreurMetier(HttpStatus.UNPROCESSABLE_ENTITY, 'code_invalide', 'Code incorrect.', {
        essaisRestants: ESSAIS_MAX - tentatives,
      });
    }
    await this.prisma.codeVerification.update({ where: { id: courant.id }, data: { utiliseLe: new Date() } });
  }
}
