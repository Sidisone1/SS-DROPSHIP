import { Body, Controller, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { z } from 'zod';
import { AuditService } from '../audit/audit.service.js';
import { Roles, Utilisateur, type UtilisateurConnecte } from '../auth/decorateurs.js';
import { SessionsService } from '../auth/sessions.service.js';
import { interdit, introuvable } from '../commun/erreurs.js';
import { valider } from '../commun/validation.js';
import { PrismaService } from '../prisma/prisma.service.js';

const ROLES = ['client', 'agent_achat', 'agent_entrepot', 'logistique', 'support', 'comptable', 'admin'] as const;

/** Gestion des utilisateurs (US-AUT-07, US-ADM-05) — rôle admin, double authentification active. */
@Roles('admin')
@Controller('admin/utilisateurs')
export class UtilisateursAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionsService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  async rechercher(@Query('q') q?: string) {
    const terme = q?.trim();
    return this.prisma.utilisateur.findMany({
      where: terme
        ? {
            OR: [
              { nom: { contains: terme, mode: 'insensitive' } },
              { email: { contains: terme.toLowerCase() } },
              { telephone: { contains: terme } },
            ],
          }
        : {},
      select: {
        id: true,
        nom: true,
        telephone: true,
        email: true,
        etat: true,
        roles: true,
        mfaActive: true,
        creeLe: true,
      },
      orderBy: { creeLe: 'desc' },
      take: 50,
    });
  }

  @Put(':id/roles')
  async changerRoles(@Param('id') id: string, @Body() corps: unknown, @Utilisateur() admin: UtilisateurConnecte) {
    const { roles } = valider(z.object({ roles: z.array(z.enum(ROLES)).min(1) }), corps);
    if (id === admin.id && !roles.includes('admin')) {
      throw interdit('auto_retrait_admin', 'Vous ne pouvez pas retirer votre propre rôle administrateur.');
    }
    const avant = await this.prisma.utilisateur.findUnique({ where: { id }, select: { roles: true } });
    if (!avant) throw introuvable('Utilisateur introuvable.');
    const apres = await this.prisma.utilisateur.update({
      where: { id },
      data: { roles: [...new Set(roles)] },
      select: { id: true, roles: true },
    });
    await this.audit.journaliser({
      acteurId: admin.id,
      roleActeur: 'admin',
      action: 'role.attribution',
      objetType: 'Utilisateur',
      objetId: id,
      avant: { roles: avant.roles },
      apres: { roles: apres.roles },
    });
    return apres;
  }

  @Post(':id/suspension')
  @HttpCode(204)
  async suspendre(@Param('id') id: string, @Utilisateur() admin: UtilisateurConnecte) {
    if (id === admin.id) throw interdit('auto_suspension', 'Vous ne pouvez pas suspendre votre propre compte.');
    const { count } = await this.prisma.utilisateur.updateMany({
      where: { id, etat: 'actif' },
      data: { etat: 'suspendu' },
    });
    if (!count) throw introuvable('Utilisateur actif introuvable.');
    await this.sessions.fermerToutes(id);
    await this.audit.journaliser({
      acteurId: admin.id,
      roleActeur: 'admin',
      action: 'compte.suspension',
      objetType: 'Utilisateur',
      objetId: id,
    });
  }
}
