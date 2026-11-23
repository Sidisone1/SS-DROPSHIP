import { Injectable, ServiceUnavailableException } from '@nestjs/common';

/**
 * Adaptateur de notification. Aucun faux SMS ni e-mail n'est déclaré « envoyé ».
 * Un prestataire doit être configuré avant d'ouvrir le parcours aux utilisateurs.
 */
export interface EnvoiCode {
  readonly canal: 'sms' | 'email';
  readonly destinataire: string;
  readonly code: string;
  readonly dureeMinutes: number;
}

@Injectable()
export class NotificationAuthService {
  async envoyerCode(_message: EnvoiCode): Promise<void> {
    throw new ServiceUnavailableException('Service de vérification non configuré');
  }
}
