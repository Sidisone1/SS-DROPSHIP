// Configuration Prisma 7. L'URL de la base vient de la variable d'environnement DATABASE_URL (jamais dans Git).
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
