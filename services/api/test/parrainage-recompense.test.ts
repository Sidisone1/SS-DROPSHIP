import { describe, expect, it, vi } from 'vitest';
import { ParrainageRecompenseService } from '../src/auth/parrainage-recompense.service.js';
import type { PrismaService } from '../src/prisma/prisma.service.js';

function preparer(prisma: object) {
  return new ParrainageRecompenseService(prisma as unknown as PrismaService);
}

describe('Récompenses de parrainage à la livraison', () => {
  it('ne calcule rien si la commande n’est pas livrée', async () => {
    const prisma = {
      commande: { findUnique: async () => ({
        id: 'cmd', clientId: 'u2', etat: 'en_transit', devise: 'XOF', offreAccepteeId: 'offre1',
      }) },
    };
    expect(await preparer(prisma).preparerApresLivraison('cmd')).toEqual({ statut: 'non_eligible' });
  });

  it('prépare 5 % des frais de service, jamais un crédit wallet', async () => {
    const create = vi.fn(async (_args: unknown) => ({ id: 'r1' }));
    const prisma = {
      commande: { findUnique: async () => ({
        id: 'cmd', clientId: 'u2', etat: 'livree', devise: 'XOF', offreAccepteeId: 'offre1',
      }) },
      recompenseParrainage: { findUnique: async () => null, create },
      parrainage: { findUnique: async () => ({
        id: 'p1', parrainId: 'u1', filleulId: 'u2', creeLe: new Date('2026-11-01'),
      }) },
      offre: { findUnique: async () => ({ fraisService: 20_000n, devise: 'XOF' }) },
      evenementCommande: { findFirst: async () => ({ creeLe: new Date('2026-11-23') }) },
    };
    expect(await preparer(prisma).preparerApresLivraison('cmd')).toEqual({
      statut: 'en_revue', recompenseId: 'r1',
    });
    const args = create.mock.calls[0]![0] as { data: { montant: bigint; etat: string } };
    expect(args.data.montant).toBe(1_000n);
    expect(args.data.etat).toBe('en_revue');
  });

  it('ne duplique pas une récompense existante', async () => {
    const prisma = {
      commande: { findUnique: async () => ({
        id: 'cmd', clientId: 'u2', etat: 'livree', devise: 'XOF', offreAccepteeId: 'offre1',
      }) },
      recompenseParrainage: { findUnique: async () => ({ id: 'r1' }) },
    };
    expect(await preparer(prisma).preparerApresLivraison('cmd')).toEqual({
      statut: 'deja_preparee', recompenseId: 'r1',
    });
  });
});
