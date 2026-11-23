import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationAuthService } from '../src/auth/notification-auth.service.js';

describe('S1 — transport de codes SMS / email', () => {
  const service = new NotificationAuthService();
  beforeEach(() => {
    vi.stubEnv('SS_OTP_PEPPER', 'test-only-otp-secret-not-for-production-32bytes');
    vi.stubEnv('SS_SMS_GATEWAY_URL', 'https://sms.example.invalid/verification');
    vi.stubEnv('SS_SMS_GATEWAY_TOKEN', 'test-token-sms-not-for-prod');
    vi.stubEnv('SS_EMAIL_GATEWAY_URL', 'https://email.example.invalid/verification');
    vi.stubEnv('SS_EMAIL_GATEWAY_TOKEN', 'test-token-email-not-for-prod');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('refuse un fournisseur sans HTTPS ou sans clé', async () => {
    vi.stubEnv('SS_SMS_GATEWAY_URL', 'http://sms.example.com');
    expect(service.estDisponible('sms')).toBe(false);
    await expect(service.envoyerCode({
      canal: 'sms', destinataire: '+22376123456', code: '123456', dureeMinutes: 10,
    })).rejects.toThrow('non configuré');
  });

  it('accepte une réponse 2xx sans exposer le code', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    await service.envoyerCode({
      canal: 'email', destinataire: 'client@example.com', code: '123456', dureeMinutes: 10,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const args = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(args[0]).toBe('https://email.example.invalid/verification');
    expect(args[1].method).toBe('POST');
    expect(args[1].headers).toMatchObject({ Authorization: 'Bearer test-token-email-not-for-prod' });
  });

  it('renvoie une erreur de service si le prestataire échoue', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })));
    await expect(service.envoyerCode({
      canal: 'sms', destinataire: '+22376123456', code: '123456', dureeMinutes: 10,
    })).rejects.toThrow('temporairement indisponible');
  });

  it('refuse tout envoi en absence de secret OTP serveur', async () => {
    vi.stubEnv('SS_OTP_PEPPER', '');
    expect(service.estDisponible('sms')).toBe(false);
  });
});
