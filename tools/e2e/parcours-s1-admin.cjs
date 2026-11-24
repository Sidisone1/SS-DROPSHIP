const { chromium } = require('playwright');
const crypto = require('crypto');
const A = 'http://localhost:3002';
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32(t) { let bits = 0, v = 0; const o = []; for (const c of t.replace(/\s/g, '')) { v = (v << 5) | ALPHA.indexOf(c); bits += 5; if (bits >= 8) { o.push((v >>> (bits - 8)) & 255); bits -= 8; } } return Buffer.from(o); }
function totp(secret) { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000))); const h = crypto.createHmac('sha1', b32(secret)).update(b).digest(); const off = h[h.length - 1] & 15; return String((h.readUInt32BE(off) & 0x7fffffff) % 1e6).padStart(6, '0'); }
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const ok = (m) => console.log('✓ ' + m);
  const connexion = async (code) => {
    await p.goto(A + '/');
    await p.fill('[name=email]', 'admin@ssdropship.test');
    await p.fill('[name=motDePasse]', 'Admin-tres-solide-2027');
    if (code) await p.fill('[name=codeMfa]', code);
    await p.click('button[type=submit]');
  };
  await connexion();
  await p.waitForURL(/\/mfa$/);
  const secret = (await p.locator('.secret').innerText()).trim();
  ok('1re connexion sans double authentification → page d activation, clé affichée');
  await p.screenshot({ path: 'admin-mfa.png' });
  await p.fill('[name=code]', '000000');
  await p.click('button[type=submit]');
  await p.locator('.alerte').waitFor();
  ok('code faux → ' + (await p.locator('.alerte').innerText()));
  await p.fill('[name=code]', totp(secret));
  await p.click('button[type=submit]');
  await p.waitForURL(/\/\?mfa=1/);
  ok('code de l application accepté → retour à la connexion');
  await connexion();
  await p.locator('.alerte').waitFor();
  ok('sans code → ' + (await p.locator('.alerte').innerText()));
  await connexion(totp(secret));
  await p.waitForURL(/\/tableau-de-bord$/);
  ok('avec code → tableau de bord : ' + (await p.locator('.note-menu').innerText()));
  await p.screenshot({ path: 'admin-tableau.png' });
  await p.click('text=Me déconnecter');
  await p.waitForURL(A + '/');
  await p.goto(A + '/tableau-de-bord');
  await p.waitForURL(A + '/');
  ok('déconnexion → tableau de bord inaccessible');
  await b.close();
})().catch((e) => { console.error('ÉCHEC', e.message.split('\n')[0]); process.exit(1); });
