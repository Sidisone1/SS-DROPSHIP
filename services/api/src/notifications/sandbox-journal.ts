import { Logger } from '@nestjs/common';
import type { CanalNotification, Notification, NotificationProvider } from '@ss-dropship/types';

/**
 * Prestataire de TEST (ADR-003) : n'envoie aucun SMS ni email. Les messages sont gardés en mémoire (lisibles par les
 * tests) et, hors production, écrits dans le journal de l'API pour que l'équipe puisse tester les parcours.
 * La configuration refuse ce prestataire en production.
 */
export class SandboxJournal implements NotificationProvider {
  readonly code = 'sandbox_journal';
  readonly estSandbox = true;
  readonly canaux: readonly CanalNotification[] = ['sms', 'email', 'in_app'];
  readonly envoyes: Notification[] = [];
  private readonly logger = new Logger('Notifications (sandbox)');

  constructor(private readonly afficher: boolean) {}

  async envoyer(notification: Notification): Promise<{ referenceEnvoi: string }> {
    this.envoyes.push(notification);
    if (this.afficher) {
      this.logger.warn(
        `[TEST — aucun envoi réel] ${notification.canal} ${notification.modele} : ${JSON.stringify(notification.variables)}`,
      );
    }
    return { referenceEnvoi: `sandbox-${this.envoyes.length}` };
  }

  dernierCode(destinataireId: string): string | undefined {
    return [...this.envoyes].reverse().find((n) => n.destinataireId === destinataireId)?.variables.code;
  }
}
