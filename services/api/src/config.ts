// Variables d'environnement validées au démarrage : l'API refuse de démarrer avec une configuration invalide.
import { z } from 'zod';
import { passerelleValide } from './notifications/passerelle-https.js';

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
    /** Fournisseur de notifications (codes par SMS / email) : test (`sandbox_journal`) ou passerelles HTTPS réelles. */
    NOTIFICATIONS: z.enum(['sandbox_journal', 'passerelle_https']).default('sandbox_journal'),
    SS_SMS_GATEWAY_URL: z.string().optional(),
    SS_SMS_GATEWAY_TOKEN: z.string().optional(),
    SS_EMAIL_GATEWAY_URL: z.string().optional(),
    SS_EMAIL_GATEWAY_TOKEN: z.string().optional(),
    /** Adresse publique du site, pour les liens de parrainage. */
    URL_WEB: z.string().url().default('http://localhost:3001'),
  })
  .superRefine((c, ctx) => {
    // Passerelles réelles : au moins le SMS (canal principal au Mali) doit être valide, sinon refus de démarrer.
    if (
      c.NOTIFICATIONS === 'passerelle_https' &&
      !passerelleValide({ url: c.SS_SMS_GATEWAY_URL, jeton: c.SS_SMS_GATEWAY_TOKEN })
    ) {
      ctx.addIssue({ code: 'custom', path: ['SS_SMS_GATEWAY_URL'], message: 'passerelle SMS HTTPS invalide' });
    }
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
