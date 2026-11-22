// Tuile en verre Glass Icon (OriginKit) au-dessus d'un motif bogolan SS. node tuile.js <fond.png> <sortie> <taille>
const {chromium} = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [fond, out] = process.argv.slice(2);
  const b = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const p = await b.newPage({viewport: {width: 512, height: 512}});
  await p.goto('file://' + path.join(__dirname, 'page.html'));
  const uri = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  for (const [nom, size] of [['tuile', 82], ['plaque', 3]]) {
    await p.evaluate(cfg => window.show(cfg), {key: nom, props: {shape: 'Logo', logo: uri(path.join(__dirname, 'tuile-sil.png')),
      depth: 70, size, speed: 0, background: '#DCE7F7', backdrop: {type: 'Image', image: uri(fond)},
      glass: {tint: '#FFFFFF', chromatic: 60, frost: 70}, orient: {angleX: 0, angleY: 0, angleZ: 0, offsetX: 0, offsetY: 0}}});
    await p.waitForTimeout(3000);
    await p.screenshot({path: out + '-' + nom + '.png'});
  }
  await b.close();
})();
