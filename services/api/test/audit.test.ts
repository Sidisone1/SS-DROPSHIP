import { describe, expect, it } from 'vitest';
import { AuditService, masquerSensible } from '../src/audit/audit.service.js';
import type { PrismaService } from '../src/prisma/prisma.service.js';

describe('journal d audit', () => {
  it('masque les champs sensibles, y compris imbriqués', () => {
    expect(
      masquerSensible({ nom: 'Awa', motDePasse: 'x', profil: { jetonRafraichissement: 'y', ville: 'Bamako' } }),
    ).toEqual({ nom: 'Awa', motDePasse: '[masqué]', profil: { jetonRafraichissement: '[masqué]', ville: 'Bamako' } });
  });

  it('écrit une entrée avec acteur, action, objet, avant et après masqués', async () => {
    const ecrits: unknown[] = [];
    const prisma = {
      journalAudit: {
        create: async (args: { data: unknown }) => {
          ecrits.push(args.data);
        },
      },
    };
    const audit = new AuditService(prisma as unknown as PrismaService);
    await audit.journaliser({
      acteurId: 'usr_admin',
      roleActeur: 'admin',
      action: 'parametre.modification',
      objetType: 'Parametre',
      objetId: 'frais.taux_pb.directe',
      avant: { valeur: 800 },
      apres: { valeur: 900, secretApi: 'ne-doit-pas-fuiter' },
    });
    expect(ecrits).toEqual([
      {
        acteurId: 'usr_admin',
        roleActeur: 'admin',
        action: 'parametre.modification',
        objetType: 'Parametre',
        objetId: 'frais.taux_pb.directe',
        avant: { valeur: 800 },
        apres: { valeur: 900, secretApi: '[masqué]' },
        ip: null,
      },
    ]);
  });
});
