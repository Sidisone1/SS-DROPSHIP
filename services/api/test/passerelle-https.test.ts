// Cas repris des tests de la version S1 publiée sur main (transport SMS / email), adaptés au prestataire
// PasserelleHttps (D-027).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { lireConfiguration } from '../src/config.js';
import { ErreurEnvoi, PasserelleHttps, passerelleValide } from '../src/notifications/passerelle-https.js';

const SMS = { url: 'https://sms.example.invalid/verification', jeton: 'test-token-sms-not-for-prod' };
const EMAIL = { url: 'https://email.example.invalid/verification', jeton: 'test-token-email-not-for-prod' };
const notif = (canal: 'sms' | 'email', contact: string) => ({
  destinataireId: 'usr_1',
  contact,
  canal,
  modele: 'code.verification',
  langue: 'fr' as const,
  variables: { code: '123456' },
  cle: 'code:abc',
});

describe('S1 — transport de codes SMS / email par passerelle HTTPS', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('refuse une passerelle sans HTTPS, sans jeton, ou avec identifiants dans l URL', () => {
    expect(passerelleValide({ url: 'http://sms.example.com', jeton: SMS.jeton })).toBe(false);
    expect(passerelleValide({ url: SMS.url, jeton: 'court' })).toBe(false);
    expect(passerelleValide({ url: 'https://u:p@sms.example.com', jeton: SMS.jeton })).toBe(false);
    expect(passerelleValide(SMS)).toBe(true);
  });

  it('un canal non configuré est indisponible et n envoie rien', async () => {
    const p = new PasserelleHttps({ sms: SMS, email: {} });
    expect(p.canaux).toEqual(['sms']);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(p.envoyer(notif('email', 'client@example.com'))).rejects.toThrow(ErreurEnvoi);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepte une réponse 2xx : POST HTTPS, jeton Bearer, destinataire et code dans le corps', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await new PasserelleHttps({ sms: SMS, email: EMAIL }).envoyer(notif('email', 'client@example.com'));
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(EMAIL.url);
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('error');
    expect(init.headers).toMatchObject({ Authorization: `Bearer ${EMAIL.jeton}`, 'Idempotency-Key': 'code:abc' });
    expect(JSON.parse(String(init.body))).toEqual({
      canal: 'email',
      destinataire: 'client@example.com',
      code: '123456',
      dureeMinutes: 10,
    });
  });

  it('renvoie une erreur neutre si le prestataire échoue, sans exposer le code ni l URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false })),
    );
    const erreur = await new PasserelleHttps({ sms: SMS, email: EMAIL })
      .envoyer(notif('sms', '+22376123456'))
      .catch((e: Error) => e);
    expect(erreur).toBeInstanceOf(ErreurEnvoi);
    expect(String((erreur as Error).message)).not.toMatch(/123456|example|token/);
  });

  it('la configuration refuse de démarrer en mode passerelle sans passerelle SMS valide', () => {
    const base = { DATABASE_URL: 'postgresql://x:y@localhost:5432/z', NOTIFICATIONS: 'passerelle_https' };
    expect(() => lireConfiguration(base)).toThrow(/SS_SMS_GATEWAY_URL/);
    expect(() =>
      lireConfiguration({ ...base, SS_SMS_GATEWAY_URL: SMS.url, SS_SMS_GATEWAY_TOKEN: SMS.jeton }),
    ).not.toThrow();
  });

  it('en production, le prestataire de test est refusé mais la passerelle réelle est acceptée', () => {
    const prod = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://x:y@localhost:5432/z',
      APP_SECRET: 'un-secret-de-production-vraiment-long-0123456789',
    };
    expect(() => lireConfiguration(prod)).toThrow(/NOTIFICATIONS/);
    expect(() =>
      lireConfiguration({
        ...prod,
        NOTIFICATIONS: 'passerelle_https',
        SS_SMS_GATEWAY_URL: SMS.url,
        SS_SMS_GATEWAY_TOKEN: SMS.jeton,
      }),
    ).not.toThrow();
  });
});
