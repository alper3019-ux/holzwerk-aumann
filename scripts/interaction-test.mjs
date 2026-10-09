/**
 * Interaktionstest (Playwright): Tastatur-Regler, Anfrage-Assistent (Validierung, Schritte, ehrliches Demo-Ende),
 * Mobil-Menü, Anruf-Leiste, Reduced Motion, Konsolenfehler.
 *   URL=http://localhost:4333/holzwerk-aumann/ node scripts/interaction-test.mjs
 */
import { chromium } from 'playwright';
const URL = process.env.URL || 'http://localhost:4333/holzwerk-aumann/';
const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome' });
const results = []; const errors = [];
const ok = (name, cond, info = '') => { results.push({ name, pass: !!cond, info }); console.log(cond ? 'PASS' : 'FAIL', name, info); };

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(90000);
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });

// Vorher-Nachher per Tastatur
await page.focus('#ba-range');
await page.keyboard.press('End');
let pos = await page.evaluate(() => getComputedStyle(document.querySelector('[data-ba]')).getPropertyValue('--pos').trim());
ok('Regler: End → 100 % Vorher', pos === '100%', pos);
await page.keyboard.press('Home');
for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight');
pos = await page.evaluate(() => getComputedStyle(document.querySelector('[data-ba]')).getPropertyValue('--pos').trim());
const vt = await page.getAttribute('#ba-range', 'aria-valuetext');
ok('Regler: Home + 25× Pfeil → 25 %', pos === '25%', `${pos} / "${vt}"`);
await page.click('[data-ba-set="0"]'); await page.waitForTimeout(800);
ok('Regler: Schaltfläche „Nur nachher"', (await page.inputValue('#ba-range')) === '0');

// Assistent
await page.evaluate(() => document.querySelector('#anfrage').scrollIntoView());
await page.click('[data-next]'); await page.waitForTimeout(700);
ok('Schritt 1: Fehler ohne Auswahl', await page.isVisible('[data-error="projektart"]'));
await page.check('input[value="Treppe"]', { force: true });
await page.click('[data-next]'); await page.waitForTimeout(700);
ok('Schritt 2 sichtbar', await page.isVisible('[data-panel="2"]'));
ok('Fokus auf Überschrift Schritt 2', await page.evaluate(() => document.activeElement?.classList.contains('wizard__legend')));
await page.fill('input[name="breite"]', '5');
await page.click('[data-next]'); await page.waitForTimeout(700);
ok('Schritt 2: unplausible Breite abgelehnt', await page.isVisible('[data-error="masse"]'));
await page.fill('input[name="breite"]', '120'); await page.fill('input[name="hoehe"]', '260');
await page.click('[data-next]'); await page.waitForTimeout(700);
ok('Schritt 3 sichtbar', await page.isVisible('[data-panel="3"]'));
await page.setInputFiles('[data-upload]', { name: 'raum.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') });
ok('Foto-Vorschau lokal', (await page.locator('[data-thumbs] li').count()) === 1);
await page.click('[data-next]'); await page.waitForTimeout(700);
await page.waitForSelector('[data-submit]', { state: 'visible' });
ok('Schritt 4 sichtbar, Absenden-Knopf sichtbar, Weiter verborgen', (await page.isVisible('[data-submit]')) && !(await page.isVisible('[data-next]')));
await page.click('[data-submit]');
ok('Schritt 4: Pflichtfelder geprüft', (await page.isVisible('[data-error="name"]')) && (await page.isVisible('[data-error="kontakt"]')) && (await page.isVisible('[data-error="datenschutz"]')));
await page.fill('input[name="name"]', 'Test Person'); await page.fill('input[name="email"]', 'kein-mail');
await page.check('input[name="datenschutz"]'); await page.click('[data-submit]');
ok('Schritt 4: ungültige E-Mail abgelehnt', await page.isVisible('[data-error="kontakt"]'));
await page.fill('input[name="email"]', 'test@example.org');
const reqs = []; page.on('request', (r) => { if (!r.url().startsWith('data:') && !r.url().startsWith('blob:')) reqs.push(r.url()); });
await page.click('[data-submit]'); await page.waitForTimeout(600);
const resultText = await page.textContent('[data-result] h3');
ok('Ehrliches Demo-Ende („nichts gesendet")', /nichts gesendet/.test(resultText), resultText);
ok('Kein Netzwerk-Request beim Absenden', reqs.length === 0, reqs.join(', '));
await page.click('[data-restart]');
await page.waitForSelector('[data-panel="1"]', { state: 'visible' }).catch(() => {});
ok('Neustart → Schritt 1', await page.isVisible('[data-panel="1"]'));

// Projekt-Detailseite erreichbar
await page.goto(URL + 'projekte/wohnkueche-buchenberg.html', { waitUntil: 'networkidle' });
ok('Projektseite hat view-transition-name am Hero', await page.evaluate(() => getComputedStyle(document.querySelector('.p-hero img')).viewTransitionName === 'p-kueche'));
await page.close();
const p404 = await browser.newPage(); // eigene Seite: der erwartete 404-Statuscode soll nicht als Konsolenfehler zählen
const r404 = await p404.goto(URL + 'gibt-es-nicht', { waitUntil: 'load' });
ok('404-Seite', r404.status() === 404 && /Sägemehl/.test(await p404.textContent('h1')));
await p404.close();

// Mobil
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on('console', (x) => { if (x.type() === 'error') errors.push(x.text()); });
await m.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
ok('Mobil: Anruf-Leiste sichtbar mit tel:-Link', (await m.isVisible('.callbar__btn--call')) && (await m.getAttribute('.callbar__btn--call', 'href')).startsWith('tel:'));
await m.click('.nav__toggle');
ok('Mobil: Menü öffnet (aria-expanded=true)', (await m.getAttribute('.nav__toggle', 'aria-expanded')) === 'true' && (await m.isVisible('#nav-list')));
await m.keyboard.press('Escape');
ok('Mobil: Escape schließt Menü', (await m.getAttribute('.nav__toggle', 'aria-expanded')) === 'false');
const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
ok('Mobil: kein horizontales Scrollen', overflow <= 0, `${overflow}px`);
await m.close();

// Reduced Motion
const rm = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
await rm.goto(URL, { waitUntil: 'networkidle', timeout: 120000 });
const anim = await rm.evaluate(() => getComputedStyle(document.querySelector('.hero__media img')).animationName);
ok('Reduced Motion: keine Hero-Animation', anim === 'none', anim);
await rm.close();

ok('Keine Konsolenfehler', errors.length === 0, errors.join(' | '));
await browser.close();
const failed = results.filter((r) => !r.pass).length;
console.log(`${results.length - failed}/${results.length} bestanden`);
process.exit(failed ? 1 : 0);
