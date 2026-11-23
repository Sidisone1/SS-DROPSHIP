import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { z } from 'zod';
import { Utilisateur, type UtilisateurConnecte } from '../auth/decorateurs.js';
import { valider } from '../commun/validation.js';
import { ComptesService } from './comptes.service.js';

@Controller('moi')
export class ComptesController {
  constructor(private readonly comptes: ComptesService) {}

  @Get()
  profil(@Utilisateur() u: UtilisateurConnecte) {
    return this.comptes.profil(u.id);
  }

  @Patch()
  modifier(@Utilisateur() u: UtilisateurConnecte, @Body() corps: unknown) {
    const d = valider(
      z.object({
        nom: z.string().trim().min(2).max(120).optional(),
        langue: z.enum(['fr', 'en']).optional(),
        preferencesNotification: z.record(z.string(), z.boolean()).optional(),
      }),
      corps,
    );
    return this.comptes.modifierProfil(u.id, d);
  }

  @Get('adresses')
  adresses(@Utilisateur() u: UtilisateurConnecte) {
    return this.comptes.adresses(u.id);
  }

  @Post('adresses')
  ajouterAdresse(@Utilisateur() u: UtilisateurConnecte, @Body() corps: unknown) {
    const d = valider(
      z.object({
        libelle: z.string().trim().min(1).max(60),
        ville: z.string().trim().min(2).max(80),
        quartier: z.string().trim().min(2).max(120),
        repere: z.string().trim().max(200).optional(),
        telephoneDestinataire: z.string().min(6).max(30),
        parDefaut: z.boolean().optional(),
      }),
      corps,
    );
    return this.comptes.ajouterAdresse(u.id, d);
  }

  @Delete('adresses/:id')
  @HttpCode(204)
  async supprimerAdresse(@Utilisateur() u: UtilisateurConnecte, @Param('id') id: string) {
    await this.comptes.supprimerAdresse(u.id, id);
  }

  @Get('parrainage')
  parrainage(@Utilisateur() u: UtilisateurConnecte) {
    return this.comptes.parrainage(u.id);
  }

  @Get('export')
  exporter(@Utilisateur() u: UtilisateurConnecte) {
    return this.comptes.exporter(u.id);
  }

  @Delete()
  @HttpCode(204)
  async supprimer(@Utilisateur() u: UtilisateurConnecte, @Body() corps: unknown) {
    const d = valider(z.object({ motDePasse: z.string().min(1) }), corps);
    await this.comptes.supprimer(u.id, d.motDePasse);
  }
}
