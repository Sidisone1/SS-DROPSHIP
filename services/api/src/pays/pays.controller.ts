import { Public } from '../auth/decorateurs.js';
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface PaysPublic {
  code: string;
  nom: string;
  devise: string;
  indicatif: string;
  langue: string;
}

@Public()
@Controller('pays')
export class PaysController {
  constructor(private readonly prisma: PrismaService) {}

  /** Pays ouverts à l'inscription (Mali au lancement, D-021), lus depuis la table de référence. */
  @Get()
  async lister(): Promise<PaysPublic[]> {
    const pays = await this.prisma.pays.findMany({ where: { ouvert: true }, orderBy: { code: 'asc' } });
    return pays.map((p) => ({
      code: p.code,
      nom: p.nom,
      devise: p.deviseParDefaut,
      indicatif: p.indicatif,
      langue: p.langueParDefaut,
    }));
  }
}
