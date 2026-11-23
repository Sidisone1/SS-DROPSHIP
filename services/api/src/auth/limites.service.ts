import { Injectable } from '@nestjs/common';
import { tropDeTentatives } from '../commun/erreurs.js';
import { Limiteur } from '../securite/limiteur.js';

/** Limites de débit par usage (ADR-004). */
@Injectable()
export class LimitesService {
  private readonly limiteurs = {
    inscription: new Limiteur(5, 3600_000),
    connexion: new Limiteur(10, 15 * 60_000),
    code: new Limiteur(10, 15 * 60_000),
    renvoi: new Limiteur(1, 60_000),
    motDePasseOublie: new Limiteur(5, 3600_000),
  };

  verifier(usage: keyof LimitesService['limiteurs'], cle: string): void {
    if (!this.limiteurs[usage].autoriser(`${usage}:${cle}`)) throw tropDeTentatives();
  }

  /** Utilisé par les tests. */
  vider(): void {
    for (const l of Object.values(this.limiteurs)) l.vider();
  }
}
