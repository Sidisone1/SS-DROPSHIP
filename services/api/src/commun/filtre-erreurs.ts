import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { OptionIndisponible, TransitionInterdite } from '@ss-dropship/types';
import { ErreurMetier } from './erreurs.js';

export interface CorpsErreur {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Traduit les erreurs métier des contrats partagés au format `Erreur` du contrat OpenAPI. */
export function versReponse(erreur: unknown): { statut: number; corps: CorpsErreur } {
  if (erreur instanceof ErreurMetier) {
    return {
      statut: erreur.statut,
      corps: { code: erreur.code, message: erreur.message, ...(erreur.details ? { details: erreur.details } : {}) },
    };
  }
  if (erreur instanceof TransitionInterdite) {
    return {
      statut: HttpStatus.CONFLICT,
      corps: {
        code: 'transition_interdite',
        message: 'Cette action n’est pas possible dans l’état actuel.',
        details: { depuis: erreur.depuis, vers: erreur.vers },
      },
    };
  }
  if (erreur instanceof OptionIndisponible) {
    return {
      statut: HttpStatus.CONFLICT,
      corps: { code: 'option_indisponible', message: 'Bientôt disponible', details: { option: erreur.option } },
    };
  }
  if (erreur instanceof HttpException) {
    const statut = erreur.getStatus();
    return { statut, corps: { code: `http_${statut}`, message: erreur.message } };
  }
  return {
    statut: HttpStatus.INTERNAL_SERVER_ERROR,
    corps: { code: 'erreur_interne', message: 'Une erreur est survenue. Réessayez dans un instant.' },
  };
}

@Catch()
export class FiltreErreurs implements ExceptionFilter {
  private readonly logger = new Logger('Erreurs');

  catch(erreur: unknown, hote: ArgumentsHost): void {
    const { statut, corps } = versReponse(erreur);
    if (statut >= 500) this.logger.error(erreur instanceof Error ? erreur.stack : String(erreur));
    hote.switchToHttp().getResponse().status(statut).json(corps);
  }
}
