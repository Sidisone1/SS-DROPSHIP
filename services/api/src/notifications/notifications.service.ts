import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { NotificationProvider } from '@ss-dropship/types';
import { ErreurMetier } from '../commun/erreurs.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const FOURNISSEUR_NOTIFICATIONS = Symbol('FOURNISSEUR_NOTIFICATIONS');

type Langue = 'fr' | 'en' | 'tr' | 'es' | 'zh';

export const canalIndisponible = () =>
  new ErreurMetier(
    HttpStatus.SERVICE_UNAVAILABLE,
    'notifications_indisponibles',
    'L’envoi des codes de vérification est momentanément indisponible. Réessayez plus tard.',
  );

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(FOURNISSEUR_NOTIFICATIONS) private readonly fournisseur: NotificationProvider,
    private readonly prisma: PrismaService,
  ) {}

  /** Vrai seulement si le prestataire actif sait réellement envoyer sur ce canal (aucun faux envoi). */
  disponible(canal: 'sms' | 'email'): boolean {
    return this.fournisseur.canaux.includes(canal);
  }

  /** Envoie un code par SMS (téléphone) ou par email, et trace l'envoi (sans le code) en base. */
  async envoyerCode(
    utilisateur: { id: string; telephone: string | null; email: string | null; langue: string },
    modele: 'code.verification' | 'code.reinitialisation',
    code: string,
    cle: string,
  ): Promise<'sms' | 'email'> {
    const canal = utilisateur.telephone ? 'sms' : 'email';
    const contact = utilisateur.telephone ?? utilisateur.email ?? '';
    if (!this.disponible(canal)) throw canalIndisponible();
    let referenceEnvoi: string;
    try {
      ({ referenceEnvoi } = await this.fournisseur.envoyer({
        destinataireId: utilisateur.id,
        contact,
        canal,
        modele,
        langue: (['fr', 'en', 'tr', 'es', 'zh'].includes(utilisateur.langue) ? utilisateur.langue : 'fr') as Langue,
        variables: { code },
        cle,
      }));
    } catch {
      throw canalIndisponible();
    }
    await this.prisma.notificationEnvoyee.create({
      data: { utilisateurId: utilisateur.id, canal, modele, cle, referenceEnvoi },
    });
    return canal;
  }
}
