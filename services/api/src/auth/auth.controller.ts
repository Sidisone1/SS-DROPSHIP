import {
  Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, UnauthorizedException,
} from '@nestjs/common';
import type { SaisieInscription } from '@ss-dropship/types';
import { AuthService } from './auth.service.js';

interface VerificationDto { utilisateurId: string; code: string }
interface ConnexionDto { identifiant: string; motDePasse: string }

function lireBearer(authorization?: string): string {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization ?? '');
  if (!match) throw new UnauthorizedException('Session requise');
  return match[1]!;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('inscription')
  async inscrire(@Body() saisie: SaisieInscription) {
    return this.auth.inscrire(saisie);
  }

  @Post('verification')
  @HttpCode(HttpStatus.OK)
  async verifier(@Body() corps: VerificationDto) {
    return this.auth.verifierContact(corps?.utilisateurId, corps?.code);
  }

  @Post('connexion')
  @HttpCode(HttpStatus.OK)
  async connecter(@Body() corps: ConnexionDto) {
    if (typeof corps?.identifiant !== 'string' || typeof corps?.motDePasse !== 'string') {
      throw new UnauthorizedException('Identifiants incorrects');
    }
    return this.auth.connecter(corps.identifiant, corps.motDePasse);
  }

  @Get('moi')
  async moi(@Headers('authorization') authorization?: string) {
    return this.auth.profil(lireBearer(authorization));
  }

  @Get('parrainage')
  async parrainage(@Headers('authorization') authorization?: string) {
    return this.auth.parrainage(lireBearer(authorization));
  }

  @Post('deconnexion')
  @HttpCode(HttpStatus.OK)
  async deconnexion(@Headers('authorization') authorization?: string) {
    return this.auth.deconnecter(lireBearer(authorization));
  }
}
