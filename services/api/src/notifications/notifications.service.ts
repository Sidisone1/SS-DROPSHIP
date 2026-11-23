import { Inject, Injectable } from '@nestjs/common';
import type { NotificationProvider } from '@ss-dropship/types';
import { PrismaService } from '../prisma/prisma.service.js';

export const FOURNISSEUR_NOTIFICATIONS = Symbol('FOURNISSEUR_NOTIFICATIONS');

type Langue = 'fr' | 'en' | 'tr' | 'es' | 'zh';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(FOURNISSEUR_NOTIFICATIONS) private readonly fournisseur: NotificationProvider,
    private readonly prisma: PrismaService,
  ) {}

  /** Envoie un code par SMS (téléphone) ou par email, et trace l'envoi (sans le code) en base. */
  async envoyerCode(
    utilisateur: { id: string; telephone: string | null; email: string | null; langue: string },
    modele: 'code.verification' | 'code.reinitialisation',
    code: string,
    cle: string,
  ): Promise<'sms' | 'email'> {
    const canal = utilisateur.telephone ? 'sms' : 'email';
    const { referenceEnvoi } = await this.fournisseur.envoyer({
      destinataireId: utilisateur.id,
      canal,
      modele,
      langue: (['fr', 'en', 'tr', 'es', 'zh'].includes(utilisateur.langue) ? utilisateur.langue : 'fr') as Langue,
      variables: { code },
      cle,
    });
    await this.prisma.notificationEnvoyee.create({
      data: { utilisateurId: utilisateur.id, canal, modele, cle, referenceEnvoi },
    });
    return canal;
  }
}
