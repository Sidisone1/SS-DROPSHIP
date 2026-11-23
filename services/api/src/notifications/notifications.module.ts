import { Global, Module } from '@nestjs/common';
import { CONFIGURATION, type Configuration } from '../config.js';
import { FOURNISSEUR_NOTIFICATIONS, NotificationsService } from './notifications.service.js';
import { SandboxJournal } from './sandbox-journal.js';

@Global()
@Module({
  providers: [
    {
      provide: FOURNISSEUR_NOTIFICATIONS,
      inject: [CONFIGURATION],
      useFactory: (config: Configuration) => new SandboxJournal(config.NODE_ENV === 'development'),
    },
    NotificationsService,
  ],
  exports: [NotificationsService, FOURNISSEUR_NOTIFICATIONS],
})
export class NotificationsModule {}
