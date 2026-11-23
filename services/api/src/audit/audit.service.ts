import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface EntreeAudit {
  /** null = action du système. */
  readonly acteurId: string | null;
  readonly roleActeur?: string;
  /** Ex. « commande.transition », « parametre.modification », « role.attribution ». */
  readonly action: string;
  readonly objetType: string;
  readonly objetId: string;
  readonly avant?: unknown;
  readonly apres?: unknown;
  readonly ip?: string;
}

const CLES_SENSIBLES = /mot.?de.?passe|password|jeton|token|secret|code|carte/i;

/** Retire récursivement les champs sensibles avant écriture dans le journal (ADR-004). */
export function masquerSensible(valeur: unknown): unknown {
  if (Array.isArray(valeur)) return valeur.map(masquerSensible);
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(
      Object.entries(valeur).map(([cle, v]) => [cle, CLES_SENSIBLES.test(cle) ? '[masqué]' : masquerSensible(v)]),
    );
  }
  return valeur;
}

/** Journal d'audit immuable (D-007, US-SOC-04). La base refuse UPDATE et DELETE sur cette table. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async journaliser(entree: EntreeAudit): Promise<void> {
    await this.prisma.journalAudit.create({
      data: {
        acteurId: entree.acteurId,
        roleActeur: entree.roleActeur ?? null,
        action: entree.action,
        objetType: entree.objetType,
        objetId: entree.objetId,
        avant: entree.avant === undefined ? undefined : (masquerSensible(entree.avant) as object),
        apres: entree.apres === undefined ? undefined : (masquerSensible(entree.apres) as object),
        ip: entree.ip ?? null,
      },
    });
  }
}
