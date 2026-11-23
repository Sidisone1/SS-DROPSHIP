import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service.js';
import { empreinteJeton, empreinteCode, comparerCode } from '../src/auth/jetons.js';
import { hacherMotDePasse } from '../src/auth/mots-de-passe.js';
import type { PrismaService } from '../src/prisma/prisma.service.js';
import type { NotificationAuthService } from '../src/auth/notification-auth.service.js';
import type { AuditService } from '../src/audit/audit.service.js';

vi.stubEnv('SS_OTP_PEPPER', 'test-only-otp-secret-not-for-production-32bytes');

function creerService(prisma: object, notification: object = { estDisponible: () => true, envoyerCode: vi.fn() }) {
  const audit = { journaliser: vi.fn(async () => {}) };
  return {
    service: new AuthService(
      prisma as unknown as PrismaService,
      notification as unknown as NotificationAuthService,
      audit as unknown as AuditService,
    ),
    audit,
  };
}

describe('Sprint S1 — inscription, vérification, sessions et parrainage', () => {
  it('OTP : empreintes salées, codes corrects et invalides', () => {
    const h1 = empreinteCode('123456');
    const h2 = empreinteCode('123456');
    expect(h1).not.toBe(h2);
    expect(comparerCode('123456', h1)).toBe(true);
    expect(comparerCode('654321', h1)).toBe(false);
    expect(comparerCode('abc', h1)).toBe(false);
  });

  it('crée le compte et le parrainage atomiquement sans créditer de wallet', async () => {
    const creerUtilisateur = vi.fn(async () => ({ id: 'u-filleul' }));
    const creerParrainage = vi.fn(async () => ({ id: 'p1' }));
    const creerCode = vi.fn(async () => ({ id: 'cv1' }));
    const creerCodeParrain = vi.fn(async () => ({}));
    const prisma = {
      utilisateur: { findFirst: vi.fn(async () => null) },
      codeParrainage: { findUnique: vi.fn(async () => ({ utilisateurId: 'u-parrain' })) },
      $transaction: (fn: (tx: object) => Promise<unknown>) => fn({
        utilisateur: { create: creerUtilisateur },
        codeParrainage: { create: creerCodeParrain },
        parrainage: { create: creerParrainage },
        codeVerification: { create: creerCode },
      }),
    };
    const notification = { estDisponible: () => true, envoyerCode: vi.fn(async () => {}) };
    const { service } = creerService(prisma, notification);
    const resultat = await service.inscrire({
      nom: 'Test Client', pays: 'ML', telephone: '76123456', email: null,
      motDePasse: 'SecretTest2026', motDePasseConfirmation: 'SecretTest2026',
      codeParrainage: 'PARRAIN7', cguAcceptees: true,
    });
    expect(resultat).toEqual({ utilisateurId: 'u-filleul', etat: 'a_verifier', canal: 'sms' });
    expect(creerUtilisateur).toHaveBeenCalledOnce();
    expect(creerParrainage).toHaveBeenCalledWith({
      data: { parrainId: 'u-parrain', filleulId: 'u-filleul', codeUtilise: 'PARRAIN7' },
    });
    expect(creerCode).toHaveBeenCalledOnce();
    expect(notification.envoyerCode).toHaveBeenCalledOnce();
    expect(creerCodeParrain).toHaveBeenCalledOnce();
  });

  it('refuse les doublons avant création', async () => {
    const prisma = {
      utilisateur: { findFirst: async () => ({ id: 'existant' }) },
      codeParrainage: { findUnique: async () => null },
    };
    const { service } = creerService(prisma);
    await expect(service.inscrire({
      nom: 'Test Client', pays: 'ML', telephone: '76123456',
      motDePasse: 'SecretTest2026', motDePasseConfirmation: 'SecretTest2026',
      cguAcceptees: true,
    })).rejects.toThrow('Ce contact est déjà utilisé');
  });

  it('refuse de créer un compte sans canal SMS/e-mail disponible', async () => {
    const { service } = creerService({
      utilisateur: { findFirst: async () => null },
    }, { estDisponible: () => false, envoyerCode: vi.fn() });
    await expect(service.inscrire({
      nom: 'Test Client', pays: 'ML', telephone: '76123456',
      motDePasse: 'SecretTest2026', motDePasseConfirmation: 'SecretTest2026',
      cguAcceptees: true,
    })).rejects.toThrow();
  });

  it('ne crée de session que pour un compte actif, et conserve le hash du jeton', async () => {
    const hash = await hacherMotDePasse('SecretTest2026');
    const create = vi.fn(async (_data: unknown) => ({ id: 'sess-1', expireLe: new Date('2027-01-30') }));
    const prisma = {
      utilisateur: { findFirst: async () => ({
        id: 'user-1', etat: 'actif', roles: ['client'], motDePasseHash: hash,
      }) },
      session: { create },
    };
    const { service } = creerService(prisma);
    const resultat = await service.connecter('client@example.com', 'SecretTest2026');
    expect(resultat.jetonSession).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(create.mock.calls.length).toBe(1);
    const persisted = create.mock.calls[0]![0] as { data: { jetonHash: string } };
    expect(persisted.data.jetonHash).toBe(empreinteJeton(resultat.jetonSession));
    expect(persisted.data.jetonHash).not.toBe(resultat.jetonSession);
    await expect(service.connecter('client@example.com', 'erreur2026')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('interdit la connexion aux comptes non vérifiés et aux admins sans MFA', async () => {
    const hash = await hacherMotDePasse('SecretTest2026');
    let roles = ['client'];
    let etat = 'a_verifier';
    const prisma = {
      utilisateur: { findFirst: async () => ({ id: 'u1', etat, roles, motDePasseHash: hash }) },
    };
    const { service } = creerService(prisma);
    await expect(service.connecter('a@example.com', 'SecretTest2026')).rejects.toBeInstanceOf(UnauthorizedException);
    etat = 'actif'; roles = ['admin'];
    await expect(service.connecter('a@example.com', 'SecretTest2026')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('expose uniquement le code et le nombre de filleuls du parrain', async () => {
    const jeton = 'x'.repeat(43);
    const prisma = {
      session: { findUnique: async () => ({
        id: 's1', revoqueLe: null, expireLe: new Date(Date.now() + 60_000),
        utilisateur: { id: 'u1', nom: 'Client', etat: 'actif', roles: ['client'] },
      }) },
      codeParrainage: { findUnique: async () => ({ code: 'CODE7K' }) },
      parrainage: { count: async () => 2 },
    };
    const { service } = creerService(prisma);
    expect(await service.parrainage(jeton)).toEqual({
      code: 'CODE7K', nombreFilleuls: 2, recompenses: 'Non calculées avant livraison',
    });
  });
});
