// Variables d'environnement validées au démarrage : l'API refuse de démarrer avec une configuration invalide.
import { z } from 'zod';

const SECRET_DEVELOPPEMENT = 'secret-de-developpement-a-ne-jamais-utiliser-en-production';

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().startsWith('postgresql://'),
    DB_POOL_MAX: z.coerce.number().int().positive().optional(),
    VERSION: z.string().default('0.1.0'),
    /** Secret maître dont dérivent les clés (jetons, codes, MFA). Obligatoire et unique en production. */
    APP_SECRET: z.string().min(32).default(SECRET_DEVELOPPEMENT),
    /** Fournisseur de notifications (SMS, email). Seul « sandbox_journal » existe tant qu'aucun contrat n'est signé. */
    NOTIFICATIONS: z.enum(['sandbox_journal']).default('sandbox_journal'),
    /** Adresse publique du site, pour les liens de parrainage. */
    URL_WEB: z.string().url().default('http://localhost:3001'),
  })
  .superRefine((c, ctx) => {
    if (c.NODE_ENV !== 'production') return;
    if (c.APP_SECRET === SECRET_DEVELOPPEMENT) {
      ctx.addIssue({ code: 'custom', path: ['APP_SECRET'], message: 'secret de développement interdit en production' });
    }
    // ADR-003 : aucun prestataire sandbox en production.
    if (c.NOTIFICATIONS.startsWith('sandbox_')) {
      ctx.addIssue({ code: 'custom', path: ['NOTIFICATIONS'], message: 'prestataire sandbox interdit en production' });
    }
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
