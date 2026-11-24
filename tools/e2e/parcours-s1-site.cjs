const { chromium, devices } = require('playwright');
const fs = require('fs');
const LOG = process.argv[2];
const dernierCode = () => {
  const lignes = fs.readFileSync(LOG, 'utf8').split('\n').filter((l) => l.includes('"code"'));
  return JSON.parse(lignes.at(-1).match(/\{.*\}/)[0]).code;
};
const W = 'http://localhost:3001';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const etapes = [];
  globalThis.__p = p;
  const ok = (m) => { etapes.push('✓ ' + m); console.log('✓ ' + m); };

  // 1. Inscription du parrain
  await p.goto(W + '/inscription');
  await p.fill('[name=nom]', 'Awa Traoré');
  await p.fill('[name=telephone]', '70 11 22 33');
  await p.fill('[name=motDePasse]', 'Bamako-2027!');
  await p.fill('[name=motDePasseConfirmation]', 'Bamako-2027!');
  await p.check('[name=cguAcceptees]');
  await p.screenshot({ path: 's1-1-inscription.png', fullPage: true });
  await p.click('button[type=submit]');
  await p.waitForURL(/\/verification\?/);
  ok('inscription → page de vérification');

  // 2. Mauvais code puis bon code
  await p.fill('[name=code]', '000000');
  await p.click('button[type=submit]:not([name])');
  await p.getByRole('alert').waitFor();
  ok('code faux → message : ' + (await p.getByRole('alert').innerText()).split('\n')[0]);
  await p.screenshot({ path: 's1-2-verification.png', fullPage: true });
  await p.fill('[name=code]', dernierCode());
  await p.click('button[type=submit]:not([name])');
  await p.waitForURL(/\/connexion\?verifie=1/);
  ok('bon code → compte confirmé');

  // 3. Connexion : mauvais mot de passe puis bon
  await p.fill('[name=identifiant]', '70112233');
  await p.fill('[name=motDePasse]', 'mauvais-mdp-00');
  await p.click('button[type=submit]');
  await p.getByRole('alert').waitFor();
  ok('mauvais mot de passe → ' + (await p.getByRole('alert').innerText()));
  await p.fill('[name=motDePasse]', 'Bamako-2027!');
  await p.click('button[type=submit]');
  await p.waitForURL(/\/compte$/);
  const code = (await p.locator('.code-parrainage').innerText()).trim();
  ok('connexion → espace compte, code de parrainage ' + code);
  await p.screenshot({ path: 's1-3-compte.png', fullPage: true });
  const cookies = await ctx.cookies();
  ok('cookies httpOnly : ' + cookies.filter((c) => c.name.startsWith('ss_')).map((c) => `${c.name}=${c.httpOnly}`).join(', '));

  // 4. Un filleul utilise le lien de partage
  const ctx2 = await b.newContext({ ...devices['iPhone 13'] });
  const f = await ctx2.newPage();
  await f.goto(`${W}/inscription?parrain=${code}`);
  ok('lien de partage → code prérempli : ' + (await f.inputValue('[name=codeParrainage]')));
  await f.fill('[name=nom]', 'Moussa Keita');
  await f.fill('[name=telephone]', '70 44 55 66');
  await f.fill('[name=motDePasse]', 'Segou-2027!!');
  await f.fill('[name=motDePasseConfirmation]', 'Segou-2027!!');
  await f.check('[name=cguAcceptees]');
  await f.click('button[type=submit]');
  await f.waitForURL(/\/verification\?/);
  await f.fill('[name=code]', dernierCode());
  await f.click('button[type=submit]:not([name])');
  await f.waitForURL(/\/connexion/);
  ok('filleul inscrit et vérifié');

  // 5. Le parrain voit son filleul
  await p.reload();
  const filleuls = await p.locator('.chiffres dd').first().innerText();
  ok('parrain : filleuls = ' + filleuls);

  // 6. Déconnexion
  await p.click('text=Me déconnecter');
  await p.waitForURL(W + '/');
  await p.goto(W + '/compte');
  await p.waitForURL(/\/connexion/);
  ok('déconnexion → /compte redirige vers la connexion');

  console.log(etapes.join('\n'));
  await b.close();
})().catch(async (e) => { try { await globalThis.__p.screenshot({ path: 'echec.png', fullPage: true }); console.error('URL', globalThis.__p.url()); } catch {} console.error('ÉCHEC', e.message.split('\n')[0]); process.exit(1); });
