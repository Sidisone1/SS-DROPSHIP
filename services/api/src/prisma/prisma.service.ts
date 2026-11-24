import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { CONFIGURATION, type Configuration } from '../config.js';
import { PrismaClient } from '../generated/prisma/client.js';

/** Client Prisma partagé (Prisma 7 + pilote PostgreSQL). La connexion s'ouvre à la première requête. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(CONFIGURATION) config: Configuration) {
    super({
      adapter: new PrismaPg({
        connectionString: config.DATABASE_URL,
        ...(config.DB_POOL_MAX ? { max: config.DB_POOL_MAX } : {}),
      }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
