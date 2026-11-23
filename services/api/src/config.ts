// Variables d'environnement validées au démarrage : l'API refuse de démarrer avec une configuration invalide.
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  VERSION: z.string().default('0.1.0'),
});

export type Configuration = z.infer<typeof schema>;

export function lireConfiguration(env: NodeJS.ProcessEnv = process.env): Configuration {
  const resultat = schema.safeParse(env);
  if (!resultat.success) {
    const champs = resultat.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Configuration invalide : ${champs}`);
  }
  return resultat.data;
}

export const CONFIGURATION = Symbol('CONFIGURATION');
