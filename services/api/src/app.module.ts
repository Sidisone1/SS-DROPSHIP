import { type DynamicModule, Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module.js';
import { CONFIGURATION, type Configuration } from './config.js';
import { PaysController } from './pays/pays.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SanteController } from './sante/sante.controller.js';

@Module({})
export class AppModule {
  static avec(config: Configuration): DynamicModule {
    return {
      module: AppModule,
      global: true,
      imports: [PrismaModule, AuditModule],
      controllers: [SanteController, PaysController],
      providers: [{ provide: CONFIGURATION, useValue: config }],
      exports: [CONFIGURATION],
    };
  }
}
