/** axe-core auf Unterseiten (Desktop + Mobil). node scripts/axe-pages.mjs <basisUrl> <ausgabe.txt> seite1 seite2 … */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const [base, out, ...pages] = process.argv.slice(2);
const axeSrc = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
const lines = [];
for (const p of pages) for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobil', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp });
  const errs = []; page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(base + p, { waitUntil: 'networkidle', timeout: 120000 });
  await page.addScriptTag({ content: axeSrc });
  const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
  const v = r.violations.map((x) => `${x.id}(${x.nodes.length})`);
  const line = `${p || '/'} ${name}: ${v.length} Verstöße ${v.join(', ')}${errs.length && !p.includes('404') ? ' | Konsolenfehler: ' + errs.join(' ; ') : ''}`;
  console.log(line); lines.push(line); await page.close();
}
await browser.close();
writeFileSync(out, lines.join('\n') + '\n');
