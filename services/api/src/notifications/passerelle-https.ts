// Prestataire RÉEL de notifications par passerelle HTTPS (repris de la version S1 publiée sur main, D-027).
//
// Contrat d'intégration : POST HTTPS avec `Authorization: Bearer <jeton>` et le corps JSON
// { canal, destinataire, code, dureeMinutes }. La passerelle doit envoyer effectivement le SMS ou l'email et ne
// répondre 2xx qu'après acceptation du message par son prestataire. Aucun faux envoi : sans passerelle valide pour
// un canal, ce canal est indisponible et l'inscription par ce canal est refusée (503).
import type { CanalNotification, Notification, NotificationProvider } from '@ss-dropship/types';

export interface ConfigPasserelle {
  url?: string | undefined;
  jeton?: string | undefined;
}

/** Une passerelle n'est acceptée qu'en HTTPS, sans identifiants dans l'URL, avec un jeton d'au moins 16 caractères. */
export function passerelleValide(c: ConfigPasserelle): boolean {
  if (!c.url || !c.jeton || c.jeton.length < 16) return false;
  try {
    const cible = new URL(c.url);
    return cible.protocol === 'https:' && cible.username === '' && cible.password === '';
  } catch {
    return false;
  }
}

export class ErreurEnvoi extends Error {
  constructor() {
    super('Envoi de code temporairement indisponible');
    this.name = 'ErreurEnvoi';
  }
}

export class PasserelleHttps implements NotificationProvider {
  readonly code = 'passerelle_https';
  readonly estSandbox = false;
  readonly canaux: readonly CanalNotification[];

  constructor(
    private readonly passerelles: { sms: ConfigPasserelle; email: ConfigPasserelle },
    private readonly delaiMs = 8_000,
  ) {
    this.canaux = (['sms', 'email'] as const).filter((c) => passerelleValide(passerelles[c]));
  }

  async envoyer(n: Notification): Promise<{ referenceEnvoi: string }> {
    if ((n.canal !== 'sms' && n.canal !== 'email') || !this.canaux.includes(n.canal) || !n.contact) {
      throw new ErreurEnvoi();
    }
    const { url, jeton } = this.passerelles[n.canal];
    try {
      const reponse = await fetch(url as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jeton}`, 'Idempotency-Key': n.cle },
        body: JSON.stringify({ canal: n.canal, destinataire: n.contact, code: n.variables.code, dureeMinutes: 10 }),
        redirect: 'error',
        signal: AbortSignal.timeout(this.delaiMs),
      });
      if (!reponse.ok) throw new Error('refus');
      return { referenceEnvoi: `passerelle-${n.cle}` };
    } catch {
      // Ne jamais exposer l'URL, le jeton, le destinataire ni le code dans l'erreur.
      throw new ErreurEnvoi();
    }
  }
}
