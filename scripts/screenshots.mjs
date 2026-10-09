/**
 * Screenshots nach screens/ (Desktop-Hero, Signatur-Interaktionen, Mobil-Hero).
 *   URL=https://alper3019-ux.github.io/holzwerk-aumann/ node scripts/screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const URL = process.env.URL || 'http://localhost:4333/holzwerk-aumann/';
const OUT = process.env.OUT || 'screens';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const settle = (p, ms = 1500) => p.waitForTimeout(ms);
const errors = [];

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(120000);
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
await settle(page, 2500);
await page.screenshot({ path: `${OUT}/desktop-hero.png` });
// Signatur 1: Vorher-Nachher per Tastatur
await page.locator('.compare').scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, document.querySelector('.compare').getBoundingClientRect().top - 110));
await page.focus('#ba-range');
for (let i = 0; i < 18; i++) await page.keyboard.press('ArrowRight');
await settle(page);
await page.screenshot({ path: `${OUT}/desktop-vorher-nachher.png` });
// Signatur 2: geführter Ablauf (Schritt 3)
await page.evaluate(() => { const s = document.querySelector('#schritt-3'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - innerHeight * 0.3); });
await settle(page, 2000);
await page.screenshot({ path: `${OUT}/desktop-ablauf-gefuehrt.png` });
// Anfrage-Assistent Schritt 2
await page.evaluate(() => document.querySelector('#anfrage').scrollIntoView());
await page.check('input[value="Einbauschrank"]', { force: true });
await page.click('[data-next]');
await settle(page);
await page.evaluate(() => window.scrollTo(0, document.querySelector('#anfrage').getBoundingClientRect().top + scrollY - 70));
await settle(page);
await page.screenshot({ path: `${OUT}/desktop-anfrage.png` });
// Projekt-Detail (Cross-Document View Transition Ziel)
await page.goto(URL + 'projekte/treppe-durach.html', { waitUntil: 'networkidle' });
await settle(page);
await page.screenshot({ path: `${OUT}/desktop-projekt.png` });
await page.close();

const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
m.setDefaultTimeout(120000);
m.on('console', (x) => { if (x.type() === 'error') errors.push(x.text()); });
await m.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
await settle(m, 2500);
await m.screenshot({ path: `${OUT}/mobile-hero.png` });
await m.evaluate(() => window.scrollTo(0, document.querySelector('.compare').getBoundingClientRect().top + scrollY - 70));
await settle(m);
await m.screenshot({ path: `${OUT}/mobile-vorher-nachher.png` });
await browser.close();
console.log('Screenshots in', OUT, 'Konsolenfehler:', errors.length ? errors : 'keine');
