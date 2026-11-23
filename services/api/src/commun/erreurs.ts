import { HttpStatus } from '@nestjs/common';

/** Erreur métier au format `Erreur` du contrat OpenAPI : code stable + message destiné à l'utilisateur. */
export class ErreurMetier extends Error {
  constructor(
    readonly statut: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ErreurMetier';
  }
}

export const invalide = (message: string, details?: Record<string, unknown>) =>
  new ErreurMetier(HttpStatus.UNPROCESSABLE_ENTITY, 'donnees_invalides', message, details);
export const nonAuthentifie = (code = 'non_authentifie', message = 'Identifiants invalides.') =>
  new ErreurMetier(HttpStatus.UNAUTHORIZED, code, message);
export const interdit = (code = 'acces_refuse', message = 'Accès refusé.', details?: Record<string, unknown>) =>
  new ErreurMetier(HttpStatus.FORBIDDEN, code, message, details);
export const conflit = (code: string, message: string) => new ErreurMetier(HttpStatus.CONFLICT, code, message);
export const tropDeTentatives = (message = 'Trop de tentatives. Réessayez plus tard.') =>
  new ErreurMetier(HttpStatus.TOO_MANY_REQUESTS, 'trop_de_tentatives', message);
export const introuvable = (message = 'Ressource introuvable.') =>
  new ErreurMetier(HttpStatus.NOT_FOUND, 'introuvable', message);
