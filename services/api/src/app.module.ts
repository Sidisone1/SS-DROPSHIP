import { type DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UtilisateursAdminController } from './admin/utilisateurs.controller.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { CLES, creerCles } from './auth/cles.js';
import { CodesVerificationService } from './auth/codes-verification.service.js';
import { GardeAuth } from './auth/garde-auth.js';
import { LimitesService } from './auth/limites.service.js';
import { ParrainageRecompenseService } from './auth/parrainage-recompense.service.js';
import { SessionsService } from './auth/sessions.service.js';
import { ComptesController } from './comptes/comptes.controller.js';
import { ComptesService } from './comptes/comptes.service.js';
import { CatalogueController } from './catalogue/catalogue.controller.js';
import { CONFIGURATION, type Configuration } from './config.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PaysController } from './pays/pays.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SanteController } from './sante/sante.controller.js';

@Module({})
export class AppModule {
  static avec(config: Configuration): DynamicModule {
    return {
      module: AppModule,
      global: true,
      imports: [PrismaModule, AuditModule, NotificationsModule],
      controllers: [SanteController, PaysController, AuthController, ComptesController, UtilisateursAdminController, CatalogueController],
      providers: [
        { provide: CONFIGURATION, useValue: config },
        { provide: CLES, useValue: creerCles(config) },
        // Refus par défaut : toute route exige une session, sauf celles marquées @Public().
        { provide: APP_GUARD, useClass: GardeAuth },
        LimitesService,
        SessionsService,
        CodesVerificationService,
        AuthService,
        ComptesService,
        // Préparation des récompenses après livraison (sans crédit wallet) : appelée par le module commandes (S5).
        ParrainageRecompenseService,
      ],
      exports: [CONFIGURATION, CLES, ParrainageRecompenseService],
    };
  }
}
