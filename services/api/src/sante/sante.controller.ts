import { Controller, Get, Inject } from '@nestjs/common';
import { CONFIGURATION, type Configuration } from '../config.js';

@Controller('sante')
export class SanteController {
  constructor(@Inject(CONFIGURATION) private readonly config: Configuration) {}

  /** Sonde de disponibilité (supervision, CI). Ne touche pas la base. */
  @Get()
  lire(): { statut: 'ok'; version: string } {
    return { statut: 'ok', version: this.config.VERSION };
  }
}
