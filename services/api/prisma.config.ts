// Configuration Prisma 7. L'URL de la base vient de DATABASE_URL (jamais dans Git).
// `prisma generate` ne se connecte pas : une URL locale par défaut lui suffit (CI sans base).
// `prisma migrate` échoue clairement si la base visée n'existe pas.
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/ss_dropship' },
});
