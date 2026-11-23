import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configurer } from '../src/application.js';
import { LimitesService } from '../src/auth/limites.service.js';
import { lireConfiguration } from '../src/config.js';
import { FOURNISSEUR_NOTIFICATIONS } from '../src/notifications/notifications.service.js';
import type { SandboxJournal } from '../src/notifications/sandbox-journal.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { hacherMotDePasse } from '../src/securite/motdepasse.js';
import { base32Decoder, codeTotp } from '../src/securite/totp.js';
import { demarrerBase } from './base-de-test.js';

let app: INestApplication;
let http: ReturnType<typeof request>;
let base: Awaited<ReturnType<typeof demarrerBase>>;
let sandbox: SandboxJournal;
let prisma: PrismaService;
let limites: LimitesService;

const MDP = 'Bamako-2027!';
const inscription = (champs: Record<string, unknown> = {}) => ({
  nom: 'Awa Traoré',
  telephone: '70 00 00 01',
  pays: 'ML',
  motDePasse: MDP,
  motDePasseConfirmation: MDP,
  cguAcceptees: true,
  ...champs,
});

async function creerCompteActif(champs: Record<string, unknown>) {
  limites.vider();
  const r = await http.post('/v1/auth/inscription').send(inscription(champs)).expect(201);
  const code = sandbox.dernierCode(r.body.utilisateurId);
  await http.post('/v1/auth/verification').send({ utilisateurId: r.body.utilisateurId, code }).expect(200);
  return r.body.utilisateurId as string;
}

function connecter(identifiant: string, motDePasse = MDP, codeMfa?: string) {
  return http.post('/v1/auth/connexion').send({ identifiant, motDePasse, ...(codeMfa ? { codeMfa } : {}) });
}

beforeAll(async () => {
  base = await demarrerBase();
  const config = lireConfiguration({
    NODE_ENV: 'test',
    DATABASE_URL: base.url,
    DB_POOL_MAX: '1',
    URL_WEB: 'https://ssdropship.com',
  });
  const module = await Test.createTestingModule({ imports: [AppModule.avec(config)] }).compile();
  app = configurer(module.createNestApplication({ logger: false }));
  await app.init();
  http = request(app.getHttpServer());
  sandbox = app.get(FOURNISSEUR_NOTIFICATIONS);
  prisma = app.get(PrismaService);
  limites = app.get(LimitesService);
}, 60_000);

afterAll(async () => {
  await app?.close();
  await base?.arreter();
});

beforeEach(() => limites.vider());

describe('inscription et vérification (US-AUT-01, US-AUT-02)', () => {
  let parrainId = '';
  let codeParrain = '';

  it('crée un compte « à vérifier », un code de parrainage, deux comptes wallet vides, et envoie un code', async () => {
    const r = await http.post('/v1/auth/inscription').send(inscription()).expect(201);
    expect(r.body).toMatchObject({ parrainageEnregistre: false, canalVerification: 'sms' });
    parrainId = r.body.utilisateurId;
    const u = await prisma.utilisateur.findUniqueOrThrow({
      where: { id: parrainId },
      include: { codeParrainage: true, comptesWallet: true },
    });
    expect(u.telephone).toBe('+22370000001');
    expect(u.etat).toBe('a_verifier');
    expect(u.motDePasseHash.startsWith('$argon2id$')).toBe(true);
    expect(u.codeParrainage?.code).toMatch(/^AWA[A-HJ-NP-Z2-9]{3}$/);
    codeParrain = u.codeParrainage?.code ?? '';
    expect(u.comptesWallet.map((c) => c.type).sort()).toEqual(['client_principal', 'client_recompenses']);
    expect(await prisma.ecritureLedger.count()).toBe(0); // aucun crédit sans webhook (D-008)
    expect(sandbox.dernierCode(parrainId)).toMatch(/^\d{6}$/);
  });

  it('refuse la connexion tant que le contact n est pas vérifié', async () => {
    const r = await connecter('70000001').expect(403);
    expect(r.body).toMatchObject({ code: 'compte_non_verifie', details: { utilisateurId: parrainId } });
  });

  it('code faux : 422 avec essais restants ; bon code : compte actif', async () => {
    const bon = sandbox.dernierCode(parrainId) as string;
    const faux = bon === '000000' ? '111111' : '000000';
    const r = await http.post('/v1/auth/verification').send({ utilisateurId: parrainId, code: faux }).expect(422);
    expect(r.body).toMatchObject({ code: 'code_invalide', details: { essaisRestants: 4 } });
    await http.post('/v1/auth/verification').send({ utilisateurId: parrainId, code: bon }).expect(200);
    expect((await prisma.utilisateur.findUniqueOrThrow({ where: { id: parrainId } })).etat).toBe('actif');
  });

  it('un filleul s inscrit avec le code du parrain (D-005)', async () => {
    const r = await http
      .post('/v1/auth/inscription')
      .send(
        inscription({ nom: 'Moussa Keita', telephone: '70000002', codeParrainage: ` ${codeParrain.toLowerCase()} ` }),
      )
      .expect(201);
    expect(r.body.parrainageEnregistre).toBe(true);
    const p = await prisma.parrainage.findUniqueOrThrow({ where: { filleulId: r.body.utilisateurId } });
    expect(p.parrainId).toBe(parrainId);
  });

  it('code de parrainage invalide : compte créé quand même, avec un avertissement', async () => {
    const r = await http
      .post('/v1/auth/inscription')
      .send(inscription({ nom: 'Fanta', telephone: '70000003', codeParrainage: 'INEXISTANT' }))
      .expect(201);
    expect(r.body.parrainageEnregistre).toBe(false);
    expect(r.body.avertissement).toMatch(/invalide/);
  });

  it('refuse un doublon, un pays fermé, un mot de passe faible, une confirmation différente, les CGU non acceptées', async () => {
    expect((await http.post('/v1/auth/inscription').send(inscription()).expect(409)).body.code).toBe('compte_existant');
    await http
      .post('/v1/auth/inscription')
      .send(inscription({ telephone: '70000099', pays: 'GH' }))
      .expect(422);
    limites.vider();
    await http
      .post('/v1/auth/inscription')
      .send(inscription({ telephone: '70000098', motDePasse: '12345678', motDePasseConfirmation: '12345678' }))
      .expect(422);
    await http
      .post('/v1/auth/inscription')
      .send(inscription({ telephone: '70000097', motDePasseConfirmation: 'autre' }))
      .expect(422);
    await http
      .post('/v1/auth/inscription')
      .send(inscription({ telephone: '70000096', cguAcceptees: false }))
      .expect(422);
    await http
      .post('/v1/auth/inscription')
      .send(inscription({ telephone: undefined }))
      .expect(422);
  });

  it('5 codes faux bloquent la vérification 15 minutes, même avec le bon code ensuite', async () => {
    const r = await http
      .post('/v1/auth/inscription')
      .send(inscription({ nom: 'Bloqué', telephone: '70000004' }))
      .expect(201);
    const id = r.body.utilisateurId;
    const bon = sandbox.dernierCode(id) as string;
    const faux = bon === '000000' ? '111111' : '000000';
    for (let i = 0; i < 4; i++)
      await http.post('/v1/auth/verification').send({ utilisateurId: id, code: faux }).expect(422);
    await http.post('/v1/auth/verification').send({ utilisateurId: id, code: faux }).expect(429);
    await http.post('/v1/auth/verification').send({ utilisateurId: id, code: bon }).expect(429);
    await http.post('/v1/auth/verification/renvoi').send({ utilisateurId: id }).expect(429);
  });

  it('limite les inscriptions répétées depuis une même adresse', async () => {
    for (let i = 0; i < 5; i++) await http.post('/v1/auth/inscription').send({}).expect(422);
    await http.post('/v1/auth/inscription').send({}).expect(429);
  });
});

describe('connexion, sessions, compte (US-AUT-03 à 06)', () => {
  let jetons: { jetonAcces: string; jetonRafraichissement: string };
  const auth = () => ({ Authorization: `Bearer ${jetons.jetonAcces}` });

  beforeAll(async () => {
    await creerCompteActif({ nom: 'Salif Coulibaly', telephone: '70000010', email: 'salif@exemple.ml' });
  });

  it('mauvais mot de passe et compte inconnu donnent la même réponse', async () => {
    const a = await connecter('70000010', 'Mauvais-mdp-1').expect(401);
    const b = await connecter('79999999', 'Mauvais-mdp-1').expect(401);
    expect(a.body).toEqual(b.body);
  });

  it('connexion par téléphone ou email, profil, rôles', async () => {
    jetons = (await connecter('salif@exemple.ml').expect(200)).body;
    expect(jetons).toMatchObject({ expireDans: 900, portee: 'complet' });
    jetons = (await connecter('+223 70 00 00 10').expect(200)).body;
    const moi = await http.get('/v1/moi').set(auth()).expect(200);
    expect(moi.body).toMatchObject({ nom: 'Salif Coulibaly', pays: 'ML', roles: ['client'] });
    expect(moi.body).not.toHaveProperty('motDePasseHash');
  });

  it('les routes protégées refusent sans jeton ou avec un jeton falsifié', async () => {
    await http.get('/v1/moi').expect(401);
    await http
      .get('/v1/moi')
      .set({ Authorization: `Bearer ${jetons.jetonAcces}x` })
      .expect(401);
    await http.get('/v1/sante').expect(200); // route publique
  });

  it('un client n accède pas au back-office', async () => {
    expect((await http.get('/v1/admin/utilisateurs').set(auth()).expect(403)).body.code).toBe('role_insuffisant');
  });

  it('espace parrainage : code, lien de partage, règle D-023', async () => {
    const r = await http.get('/v1/moi/parrainage').set(auth()).expect(200);
    expect(r.body.code).toMatch(/^SALIF[A-HJ-NP-Z2-9]{3}$/);
    expect(r.body.lienPartage).toBe(`https://ssdropship.com/inscription?parrain=${r.body.code}`);
    expect(r.body).toMatchObject({
      nombreFilleuls: 0,
      regle: { tauxPb: 500, dureeMois: 12 },
      recompensesVersees: { valeur: 0, devise: 'XOF' },
    });
  });

  it('profil et adresses : modification, téléphone normalisé, première adresse par défaut', async () => {
    await http.patch('/v1/moi').set(auth()).send({ langue: 'en' }).expect(200);
    const a = await http
      .post('/v1/moi/adresses')
      .set(auth())
      .send({
        libelle: 'Maison',
        ville: 'Bamako',
        quartier: 'Hamdallaye ACI 2000',
        telephoneDestinataire: '66 00 00 00',
      })
      .expect(201);
    expect(a.body).toMatchObject({ telephoneDestinataire: '+22366000000', parDefaut: true, paysCode: 'ML' });
    const b = await http
      .post('/v1/moi/adresses')
      .set(auth())
      .send({
        libelle: 'Boutique',
        ville: 'Bamako',
        quartier: 'Grand Marché',
        telephoneDestinataire: '66000001',
        parDefaut: true,
      })
      .expect(201);
    const liste = (await http.get('/v1/moi/adresses').set(auth()).expect(200)).body;
    expect(liste.map((x: { libelle: string; parDefaut: boolean }) => [x.libelle, x.parDefaut])).toEqual([
      ['Boutique', true],
      ['Maison', false],
    ]);
    await http.delete(`/v1/moi/adresses/${b.body.id}`).set(auth()).expect(204);
    await http.delete(`/v1/moi/adresses/${b.body.id}`).set(auth()).expect(404);
  });

  it('rafraîchissement par rotation ; réutiliser un ancien jeton ferme toutes les sessions', async () => {
    const ancien = jetons.jetonRafraichissement;
    const nouveaux = (await http.post('/v1/auth/rafraichir').send({ jetonRafraichissement: ancien }).expect(200)).body;
    await http
      .get('/v1/moi')
      .set({ Authorization: `Bearer ${nouveaux.jetonAcces}` })
      .expect(200);
    await http.post('/v1/auth/rafraichir').send({ jetonRafraichissement: ancien }).expect(401);
    await http
      .get('/v1/moi')
      .set({ Authorization: `Bearer ${nouveaux.jetonAcces}` })
      .expect(401);
  });

  it('déconnexion : le jeton ne fonctionne plus', async () => {
    jetons = (await connecter('70000010').expect(200)).body;
    await http.post('/v1/auth/deconnexion').set(auth()).expect(204);
    await http.get('/v1/moi').set(auth()).expect(401);
  });
});

describe('mot de passe oublié (US-AUT-04)', () => {
  it('même réponse pour un compte inconnu ; le nouveau mot de passe remplace l ancien et ferme les sessions', async () => {
    const id = await creerCompteActif({ nom: 'Kadiatou', telephone: '70000020' });
    const session = (await connecter('70000020').expect(200)).body;
    const inconnu = await http.post('/v1/auth/mot-de-passe-oublie').send({ identifiant: '79999998' }).expect(202);
    const connu = await http.post('/v1/auth/mot-de-passe-oublie').send({ identifiant: '70000020' }).expect(202);
    expect(inconnu.body).toEqual(connu.body);
    const code = sandbox.dernierCode(id) as string;
    await http
      .post('/v1/auth/reinitialiser')
      .send({ identifiant: '70000020', code, nouveauMotDePasse: 'Nouveau-mdp-2027' })
      .expect(204);
    await http
      .get('/v1/moi')
      .set({ Authorization: `Bearer ${session.jetonAcces}` })
      .expect(401);
    await connecter('70000020').expect(401);
    await connecter('70000020', 'Nouveau-mdp-2027').expect(200);
    // Le code ne sert qu'une fois.
    await http
      .post('/v1/auth/reinitialiser')
      .send({ identifiant: '70000020', code, nouveauMotDePasse: 'Encore-un-2027' })
      .expect(422);
  });
});

describe('personnel : double authentification obligatoire et rôles (US-AUT-07, ADR-004)', () => {
  let adminId = '';
  const EMAIL = 'admin@ssdropship.test';
  const MDP_ADMIN = 'Admin-tres-solide-2027';

  beforeAll(async () => {
    const admin = await prisma.utilisateur.create({
      data: {
        nom: 'Admin',
        email: EMAIL,
        motDePasseHash: await hacherMotDePasse(MDP_ADMIN),
        paysCode: 'ML',
        etat: 'actif',
        roles: ['admin'],
      },
    });
    adminId = admin.id;
  });

  it('sans double authentification : jeton limité à son activation', async () => {
    const j = (await connecter(EMAIL, MDP_ADMIN).expect(200)).body;
    expect(j.portee).toBe('configuration_mfa');
    const auth = { Authorization: `Bearer ${j.jetonAcces}` };
    expect((await http.get('/v1/admin/utilisateurs').set(auth).expect(403)).body.code).toBe('mfa_a_configurer');
    const { secret, urlOtpauth } = (await http.post('/v1/auth/mfa/activation').set(auth).expect(201)).body;
    expect(urlOtpauth).toMatch(/^otpauth:\/\/totp\//);
    const enBase = await prisma.utilisateur.findUniqueOrThrow({ where: { id: adminId } });
    expect(enBase.mfaSecretChiffre).toBeTruthy();
    expect(enBase.mfaSecretChiffre).not.toContain(secret); // stocké chiffré
    await http.post('/v1/auth/mfa/confirmation').set(auth).send({ code: '000000' }).expect(422);
    await http
      .post('/v1/auth/mfa/confirmation')
      .set(auth)
      .send({ code: codeTotp(base32Decoder(secret), Date.now()) })
      .expect(204);
    await http.get('/v1/moi').set(auth).expect(401); // sessions fermées après activation
  });

  it('avec double authentification : code obligatoire, puis accès complet au back-office', async () => {
    expect((await connecter(EMAIL, MDP_ADMIN).expect(401)).body.code).toBe('mfa_requise');
    expect((await connecter(EMAIL, MDP_ADMIN, '000000').expect(401)).body.code).toBe('mfa_invalide');
    const u = await prisma.utilisateur.findUniqueOrThrow({ where: { id: adminId } });
    const { dechiffrer } = await import('../src/securite/chiffrement.js');
    const { creerCles } = await import('../src/auth/cles.js');
    const secret = dechiffrer(
      u.mfaSecretChiffre as string,
      creerCles(lireConfiguration({ NODE_ENV: 'test', DATABASE_URL: base.url })).mfa,
    );
    const j = (await connecter(EMAIL, MDP_ADMIN, codeTotp(base32Decoder(secret), Date.now())).expect(200)).body;
    expect(j.portee).toBe('complet');
    const auth = { Authorization: `Bearer ${j.jetonAcces}` };

    const cible = (await http.get('/v1/admin/utilisateurs?q=salif').set(auth).expect(200)).body[0];
    expect(cible.nom).toBe('Salif Coulibaly');
    await http
      .put(`/v1/admin/utilisateurs/${cible.id}/roles`)
      .set(auth)
      .send({ roles: ['client', 'support'] })
      .expect(200);
    const audit = await prisma.journalAudit.findFirstOrThrow({
      where: { action: 'role.attribution', objetId: cible.id },
    });
    expect(audit).toMatchObject({
      acteurId: adminId,
      avant: { roles: ['client'] },
      apres: { roles: ['client', 'support'] },
    });
    expect(
      (
        await http
          .put(`/v1/admin/utilisateurs/${adminId}/roles`)
          .set(auth)
          .send({ roles: ['client'] })
          .expect(403)
      ).body.code,
    ).toBe('auto_retrait_admin');

    // Le nouvel agent support doit à son tour activer la double authentification.
    expect((await connecter('70000010').expect(200)).body.portee).toBe('configuration_mfa');
  });
});

describe('données personnelles (US-AUT-08) et journal d audit', () => {
  it('export sans secrets ; suppression par anonymisation, connexion ensuite impossible', async () => {
    await creerCompteActif({ nom: 'Oumar Diallo', telephone: '70000030', email: 'oumar@exemple.ml' });
    const j = (await connecter('70000030').expect(200)).body;
    const auth = { Authorization: `Bearer ${j.jetonAcces}` };
    const exp = (await http.get('/v1/moi/export').set(auth).expect(200)).body;
    expect(exp.compte.nom).toBe('Oumar Diallo');
    expect(JSON.stringify(exp)).not.toMatch(/argon2|motDePasseHash|mfaSecret/);
    await http.delete('/v1/moi').set(auth).send({ motDePasse: 'faux-mot-de-passe' }).expect(401);
    await http.delete('/v1/moi').set(auth).send({ motDePasse: MDP }).expect(204);
    await connecter('70000030').expect(401);
    const u = await prisma.utilisateur.findFirstOrThrow({ where: { nom: 'Compte supprimé' } });
    expect(u).toMatchObject({ telephone: null, etat: 'supprime' });
    expect(u.email).toMatch(/@supprime\.invalid$/);
  });

  it('aucun mot de passe ni code dans le journal d audit ou les notifications tracées', async () => {
    const audit = JSON.stringify(await prisma.journalAudit.findMany());
    expect(audit).not.toContain(MDP);
    const tracees = JSON.stringify(await prisma.notificationEnvoyee.findMany());
    for (const n of sandbox.envoyes) expect(tracees).not.toContain(`"${n.variables.code}"`);
  });
});
