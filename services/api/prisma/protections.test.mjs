// Teste les migrations sur un vrai moteur PostgreSQL embarqué (PGlite).
// Prérequis : @electric-sql/pglite installé (devDependency de services/api).
// Lancer : node --test services/api/prisma/protections.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const dossier = fileURLToPath(new URL('./migrations/', import.meta.url));
const db = new PGlite();

before(async () => {
  for (const nom of readdirSync(dossier).filter((n) => /^\d+_/.test(n)).sort()) {
    await db.exec(readFileSync(`${dossier}${nom}/migration.sql`, 'utf8'));
  }
  // Données minimales : un client malien, son compte wallet et le compte système du prestataire.
  await db.exec(`
    INSERT INTO "Utilisateur" ("id","nom","telephone","motDePasseHash","paysCode","majLe")
      VALUES ('usr_1','Client test','+22370000000','x','ML', now());
    INSERT INTO "CompteWallet" ("id","type","utilisateurId","devise") VALUES ('cpt_client','client_principal','usr_1','XOF');
    INSERT INTO "CompteWallet" ("id","type","devise","code") VALUES ('cpt_presta','systeme_prestataire','XOF','sandbox_ML');
    INSERT INTO "CompteWallet" ("id","type","devise","code") VALUES ('cpt_eur','systeme_revenus_frais','EUR','revenus_EUR');
  `);
});

after(async () => { await db.close(); });

/** Inscrit une transaction et ses écritures dans une transaction SQL (les contrôles différés s'exécutent au COMMIT). */
async function inscrire(id, cle, ecritures) {
  await db.transaction(async (tx) => {
    await tx.query(`INSERT INTO "TransactionLedger" ("id","type","cleIdempotence","libelle") VALUES ($1,'recharge',$2,'test')`, [id, cle]);
    for (const [i, [compte, montant, devise]] of ecritures.entries()) {
      await tx.query(`INSERT INTO "EcritureLedger" ("id","transactionId","compteId","montant","devise") VALUES ($1,$2,$3,$4,$5)`,
        [`${id}_${i}`, id, compte, montant, devise]);
    }
  });
}

const solde = async (compte) =>
  Number((await db.query(`SELECT COALESCE(SUM("montant"),0)::bigint AS s FROM "EcritureLedger" WHERE "compteId"=$1`, [compte])).rows[0].s);

test('le Mali est le seul pays ouvert au lancement (D-021)', async () => {
  const { rows } = await db.query(`SELECT "code" FROM "Pays" WHERE "ouvert"`);
  assert.deepEqual(rows.map((r) => r.code), ['ML']);
});

test('une transaction équilibrée est acceptée et crédite le client', async () => {
  await inscrire('trx_ok', 'webhook:sandbox:evt_1', [['cpt_client', 50_000, 'XOF'], ['cpt_presta', -50_000, 'XOF']]);
  assert.equal(await solde('cpt_client'), 50_000);
});

test('une transaction déséquilibrée est refusée en entier', async () => {
  await assert.rejects(inscrire('trx_ko', 'cle_ko', [['cpt_client', 10_000, 'XOF'], ['cpt_presta', -9_000, 'XOF']]), /déséquilibrée/);
  assert.equal(await solde('cpt_client'), 50_000);
});

test('la même clé d\'idempotence ne crédite pas deux fois (webhook rejoué)', async () => {
  await assert.rejects(inscrire('trx_rejeu', 'webhook:sandbox:evt_1', [['cpt_client', 50_000, 'XOF'], ['cpt_presta', -50_000, 'XOF']]));
  assert.equal(await solde('cpt_client'), 50_000);
});

test('un compte client ne peut pas passer en négatif', async () => {
  await assert.rejects(inscrire('trx_neg', 'cle_neg', [['cpt_client', -60_000, 'XOF'], ['cpt_presta', 60_000, 'XOF']]), /Solde négatif/);
});

test('une écriture dans une devise différente du compte est refusée', async () => {
  await assert.rejects(inscrire('trx_dev', 'cle_dev', [['cpt_eur', 100, 'XOF'], ['cpt_presta', -100, 'XOF']]), /Devise/);
});

test('le ledger et le journal d\'audit sont en écriture seule', async () => {
  await assert.rejects(db.query(`UPDATE "EcritureLedger" SET "montant" = 999999 WHERE "id" = 'trx_ok_0'`), /écriture seule/);
  await assert.rejects(db.query(`DELETE FROM "EcritureLedger" WHERE "id" = 'trx_ok_0'`), /écriture seule/);
  await db.query(`INSERT INTO "JournalAudit" ("id","action","objetType","objetId") VALUES ('aud_1','test','Test','1')`);
  await assert.rejects(db.query(`DELETE FROM "JournalAudit" WHERE "id" = 'aud_1'`), /écriture seule/);
});

test('un webhook ne peut être enregistré qu\'une fois par prestataire et identifiant d\'événement', async () => {
  const sql = `INSERT INTO "EvenementWebhook" ("id","prestataire","evenementId","signatureValide","corps") VALUES ($1,'sandbox','evt_1',true,'{}')`;
  await db.query(sql, ['wh_1']);
  await assert.rejects(db.query(sql, ['wh_2']), /unique|duplicate/i);
});

test('les prestations V2 ne peuvent pas être activées sans nouvelle migration (D-011)', async () => {
  const { rows } = await db.query(`SELECT count(*)::int AS n FROM "OptionService" WHERE NOT "disponible"`);
  assert.equal(rows[0].n, 5);
  await assert.rejects(db.query(`UPDATE "OptionService" SET "disponible" = true WHERE "code" = 'regroupement'`), /option_v2_indisponible/);
});

test('un utilisateur sans téléphone ni email est refusé', async () => {
  await assert.rejects(db.query(
    `INSERT INTO "Utilisateur" ("id","nom","motDePasseHash","paysCode","majLe") VALUES ('usr_x','X','x','ML',now())`), /utilisateur_contact/);
});
