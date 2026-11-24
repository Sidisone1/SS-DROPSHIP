import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import { valider } from '../commun/validation.js';
import { AuthService } from './auth.service.js';
import {
  AutoriserConfigurationMfa,
  IpClient,
  Public,
  Roles,
  Utilisateur,
  type UtilisateurConnecte,
} from './decorateurs.js';
import { LimitesService } from './limites.service.js';
import { SessionsService } from './sessions.service.js';

const schemaInscription = z
  .object({
    nom: z.string().trim().min(2).max(120),
    telephone: z.string().max(30).optional(),
    email: z.string().max(200).optional(),
    pays: z.string().length(2),
    motDePasse: z.string().max(200),
    motDePasseConfirmation: z.string(),
    codeParrainage: z.string().max(20).optional(),
    cguAcceptees: z.literal(true),
  })
  .refine((d) => d.motDePasse === d.motDePasseConfirmation, {
    path: ['motDePasseConfirmation'],
    message: 'Les mots de passe ne correspondent pas.',
  });
const code6 = z.string().regex(/^\d{6}$/);
const PERSONNEL = ['agent_achat', 'agent_entrepot', 'logistique', 'support', 'comptable', 'admin'];

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    private readonly limites: LimitesService,
  ) {}

  @Public()
  @Post('inscription')
  async inscrire(@Body() corps: unknown, @IpClient() ip: string) {
    this.limites.verifier('inscription', ip);
    const d = valider(schemaInscription, corps);
    return this.auth.inscrire(d);
  }

  @Public()
  @Post('verification')
  @HttpCode(200)
  async verifier(@Body() corps: unknown, @IpClient() ip: string) {
    this.limites.verifier('code', ip);
    const d = valider(z.object({ utilisateurId: z.string().min(1), code: code6 }), corps);
    await this.auth.verifierContact(d.utilisateurId, d.code);
    return { statut: 'actif' };
  }

  @Public()
  @Post('verification/renvoi')
  @HttpCode(202)
  async renvoyer(@Body() corps: unknown) {
    const d = valider(z.object({ utilisateurId: z.string().min(1) }), corps);
    this.limites.verifier('renvoi', d.utilisateurId);
    return { canalVerification: await this.auth.renvoyerCode(d.utilisateurId) };
  }

  @Public()
  @Post('connexion')
  @HttpCode(200)
  async connecter(@Body() corps: unknown, @IpClient() ip: string, @Headers('user-agent') appareil?: string) {
    const d = valider(
      z.object({ identifiant: z.string().min(3).max(200), motDePasse: z.string().max(200), codeMfa: code6.optional() }),
      corps,
    );
    this.limites.verifier('connexion', `${ip}:${d.identifiant.toLowerCase()}`);
    return this.auth.connecter(d.identifiant, d.motDePasse, d.codeMfa, appareil);
  }

  @Public()
  @Post('rafraichir')
  @HttpCode(200)
  async rafraichir(@Body() corps: unknown) {
    const d = valider(z.object({ jetonRafraichissement: z.string().min(20) }), corps);
    return this.sessions.rafraichir(d.jetonRafraichissement);
  }

  @AutoriserConfigurationMfa()
  @Post('deconnexion')
  @HttpCode(204)
  async deconnecter(@Utilisateur() u: UtilisateurConnecte) {
    await this.sessions.fermer(u.sessionId);
  }

  @Public()
  @Post('mot-de-passe-oublie')
  @HttpCode(202)
  async motDePasseOublie(@Body() corps: unknown, @IpClient() ip: string) {
    this.limites.verifier('motDePasseOublie', ip);
    const d = valider(z.object({ identifiant: z.string().min(3).max(200) }), corps);
    await this.auth.demanderReinitialisation(d.identifiant);
    return { message: 'Si un compte correspond, un code vient d’être envoyé.' };
  }

  @Public()
  @Post('reinitialiser')
  @HttpCode(204)
  async reinitialiser(@Body() corps: unknown, @IpClient() ip: string) {
    this.limites.verifier('code', ip);
    const d = valider(
      z.object({ identifiant: z.string().min(3), code: code6, nouveauMotDePasse: z.string().max(200) }),
      corps,
    );
    await this.auth.reinitialiser(d.identifiant, d.code, d.nouveauMotDePasse);
  }

  @AutoriserConfigurationMfa()
  @Roles(...PERSONNEL)
  @Post('mfa/activation')
  async preparerMfa(@Utilisateur() u: UtilisateurConnecte) {
    return this.auth.preparerMfa(u.id);
  }

  @AutoriserConfigurationMfa()
  @Roles(...PERSONNEL)
  @Post('mfa/confirmation')
  @HttpCode(204)
  async confirmerMfa(@Utilisateur() u: UtilisateurConnecte, @Body() corps: unknown) {
    const d = valider(z.object({ code: code6 }), corps);
    await this.auth.confirmerMfa(u.id, d.code);
  }
}
