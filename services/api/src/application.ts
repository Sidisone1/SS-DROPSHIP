import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FiltreErreurs } from './commun/filtre-erreurs.js';
import type { Configuration } from './config.js';

/** Configure l'application (préfixe /v1, format d'erreur commun). Utilisé par main.ts et par les tests. */
export function configurer(app: INestApplication): INestApplication {
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new FiltreErreurs());
  app.enableShutdownHooks();
  return app;
}

export async function creerApplication(config: Configuration): Promise<INestApplication> {
  return configurer(await NestFactory.create(AppModule.avec(config), { bufferLogs: true }));
}
