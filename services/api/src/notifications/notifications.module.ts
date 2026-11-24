import { Global, Module } from '@nestjs/common';
import { CONFIGURATION, type Configuration } from '../config.js';
import { FOURNISSEUR_NOTIFICATIONS, NotificationsService } from './notifications.service.js';
import { PasserelleHttps } from './passerelle-https.js';
import { SandboxJournal } from './sandbox-journal.js';

@Global()
@Module({
  providers: [
    {
      provide: FOURNISSEUR_NOTIFICATIONS,
      inject: [CONFIGURATION],
      useFactory: (config: Configuration) =>
        config.NOTIFICATIONS === 'passerelle_https'
          ? new PasserelleHttps({
              sms: { url: config.SS_SMS_GATEWAY_URL, jeton: config.SS_SMS_GATEWAY_TOKEN },
              email: { url: config.SS_EMAIL_GATEWAY_URL, jeton: config.SS_EMAIL_GATEWAY_TOKEN },
            })
          : new SandboxJournal(config.NODE_ENV === 'development'),
    },
    NotificationsService,
  ],
  exports: [NotificationsService, FOURNISSEUR_NOTIFICATIONS],
})
export class NotificationsModule {}
