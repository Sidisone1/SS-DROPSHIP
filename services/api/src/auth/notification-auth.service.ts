import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface EnvoiCode {
  readonly canal: 'sms' | 'email';
  readonly destinataire: string;
  readonly code: string;
  readonly dureeMinutes: number;
}

/**
 * Contrat d'intégration de passerelle :
 * POST HTTPS avec Authorization: Bearer <clé>, corps JSON
 * { canal, destinataire, code, dureeMinutes }.
 *
 * La passerelle doit envoyer effectivement le SMS ou l'e-mail et répondre 2xx
 * uniquement après acceptation du message par son prestataire.
 * En absence de passerelle, refus explicite (aucun faux envoi).
 */
@Injectable()
export class NotificationAuthService {
  estDisponible(canal: 'sms' | 'email'): boolean {
    const prefixe = canal === 'sms' ? 'SS_SMS' : 'SS_EMAIL';
    const url = process.env[prefixe + '_GATEWAY_URL'];
    const secret = process.env[prefixe + '_GATEWAY_TOKEN'];
    if (!url || !secret || secret.length < 16 ||
      !process.env.SS_OTP_PEPPER || Buffer.byteLength(process.env.SS_OTP_PEPPER, 'utf8') < 32) return false;
    try {
      const cible = new URL(url);
      return cible.protocol === 'https:' && cible.username === '' && cible.password === '';
    } catch {
      return false;
    }
  }

  async envoyerCode(message: EnvoiCode): Promise<void> {
    const prefixe = message.canal === 'sms' ? 'SS_SMS' : 'SS_EMAIL';
    if (!this.estDisponible(message.canal)) {
      throw new ServiceUnavailableException('Service de vérification non configuré');
    }
    const url = process.env[prefixe + '_GATEWAY_URL']!;
    const token = process.env[prefixe + '_GATEWAY_TOKEN']!;
    try {
      const reponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(message),
        redirect: 'error',
        signal: AbortSignal.timeout(8_000),
      });
      if (!reponse.ok) throw new Error('Passerelle indisponible');
    } catch {
      // Ne pas exposer les URL, secrets, destinataires ou codes dans la réponse.
      throw new ServiceUnavailableException('Envoi de code temporairement indisponible');
    }
  }
}
