import 'reflect-metadata';
import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OptionIndisponible, TransitionInterdite, transitionner, verifierOptionCommandable } from '@ss-dropship/types';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { Public } from '../src/auth/decorateurs.js';
import { configurer } from '../src/application.js';
import { versReponse } from '../src/commun/filtre-erreurs.js';
import { lireConfiguration } from '../src/config.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const config = lireConfiguration({ NODE_ENV: 'test', DATABASE_URL: 'postgresql://test:test@localhost:5432/test' });

/** Contrôleur de test : déclenche les erreurs métier pour vérifier le filtre global. */
@Public()
@Controller('essai')
class EssaiController {
  @Get('transition')
  transition() {
    return transitionner('commande', 'achat_en_cours', 'annulee');
  }
  @Get('option')
  option() {
    verifierOptionCommandable('regroupement');
  }
  @Get('panne')
  panne() {
    throw new Error('détail interne à ne pas exposer');
  }
}

const prismaFactice = {
  pays: {
    findMany: async () => [
      { code: 'ML', nom: 'Mali', deviseParDefaut: 'XOF', indicatif: '+223', langueParDefaut: 'fr', ouvert: true },
    ],
  },
  $disconnect: async () => {},
};

describe('API SS DROPSHIP', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.avec(config)],
      controllers: [EssaiController],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaFactice)
      .compile();
    app = configurer(module.createNestApplication({ logger: false }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/sante répond ok', async () => {
    const reponse = await request(app.getHttpServer()).get('/v1/sante').expect(200);
    expect(reponse.body).toEqual({ statut: 'ok', version: '0.1.0' });
  });

  it('GET /v1/pays liste les pays ouverts (Mali)', async () => {
    const reponse = await request(app.getHttpServer()).get('/v1/pays').expect(200);
    expect(reponse.body).toEqual([{ code: 'ML', nom: 'Mali', devise: 'XOF', indicatif: '+223', langue: 'fr' }]);
  });

  it('une transition interdite renvoie 409 transition_interdite', async () => {
    const reponse = await request(app.getHttpServer()).get('/v1/essai/transition').expect(409);
    expect(reponse.body.code).toBe('transition_interdite');
    expect(reponse.body.details).toEqual({ depuis: 'achat_en_cours', vers: 'annulee' });
  });

  it('une prestation V2 renvoie 409 option_indisponible « Bientôt disponible »', async () => {
    const reponse = await request(app.getHttpServer()).get('/v1/essai/option').expect(409);
    expect(reponse.body).toMatchObject({ code: 'option_indisponible', message: 'Bientôt disponible' });
  });

  it('une erreur inattendue renvoie 500 sans exposer le détail interne', async () => {
    const reponse = await request(app.getHttpServer()).get('/v1/essai/panne').expect(500);
    expect(reponse.body.code).toBe('erreur_interne');
    expect(JSON.stringify(reponse.body)).not.toContain('détail interne');
  });

  it('une route inconnue renvoie 404 au format Erreur', async () => {
    const reponse = await request(app.getHttpServer()).get('/v1/inconnue').expect(404);
    expect(reponse.body.code).toBe('http_404');
  });
});

describe('traduction des erreurs métier', () => {
  it('TransitionInterdite et OptionIndisponible deviennent des 409', () => {
    expect(versReponse(new TransitionInterdite('commande', 'livree', 'payee')).statut).toBe(409);
    expect(versReponse(new OptionIndisponible('photos_contenu')).corps.code).toBe('option_indisponible');
  });
});

describe('configuration', () => {
  it('refuse de démarrer sans DATABASE_URL valide', () => {
    expect(() => lireConfiguration({})).toThrow(/DATABASE_URL/);
    expect(() => lireConfiguration({ DATABASE_URL: 'mysql://x' })).toThrow(/DATABASE_URL/);
  });
});
