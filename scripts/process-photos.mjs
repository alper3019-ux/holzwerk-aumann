/**
 * Erzeugt aus den Original-Fotos (Wikimedia Commons, siehe photos/sources.json)
 * responsive AVIF- und WebP-Dateien in public/photos/ und public/photos/manifest.json.
 *   PHOTO_SRC=/pfad/zu/originalen node scripts/process-photos.mjs
 * Originale liegen nicht im Repository (Download-URL + SHA-1 in photos/sources.json).
 * Bearbeitung: Zuschnitt, Skalierung, Formatkonvertierung; beim Vorher-Foto des
 * Waschtischs zusätzlich eine affine Angleichung an die Nachher-Perspektive
 * (siehe photos/align-washstand.py).
 */
import sharp from 'sharp';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = process.env.PHOTO_SRC || '/workspace/portfolio-v2/_k3-orig';
const OUT = resolve('public/photos');
mkdirSync(OUT, { recursive: true });
const sources = JSON.parse(readFileSync('photos/sources.json', 'utf8'));

const JOBS = [
  { key: 'hero', name: 'hero', aspect: 16 / 9, fx: 0.5, fy: 0.5, widths: [960, 1440, 2000], q: 50 },
  { key: 'hero', name: 'hero-m', aspect: 4 / 5, fx: 0.42, fy: 0.5, widths: [480, 828] },
  { key: 'aufmass', name: 'aufmass', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [480, 800] },
  { key: 'werkzeug', name: 'werkzeug', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [480, 800] },
  { key: 'hobel', name: 'hobel', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [480, 800] },
  { key: 'schleifen', name: 'schleifen', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [480, 800] },
  { key: 'einbau', name: 'einbau', aspect: 4 / 5, fx: 0.55, fy: 0.5, widths: [480, 800] },
  { key: 'kueche', name: 'kueche', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [400, 720] },
  { key: 'schrank', name: 'schrank', aspect: 4 / 5, fx: 0.5, fy: 0.45, widths: [400, 720] },
  { key: 'treppe', name: 'treppe', aspect: 4 / 5, fx: 0.4, fy: 0.5, widths: [400, 720] },
  { key: 'eingang', name: 'eingang', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [400, 720] },
  { key: 'kueche', name: 'kueche-wide', aspect: 16 / 9, fx: 0.5, fy: 0.5, widths: [800, 1400, 2000] },
  { key: 'treppe', name: 'treppe-wide', aspect: 16 / 9, fx: 0.5, fy: 0.55, widths: [800, 1400, 2000] },
  { key: 'eingang', name: 'eingang-wide', aspect: 16 / 9, fx: 0.5, fy: 0.55, widths: [800, 1400, 2000] },
  { key: 'werkstatt', name: 'werkstatt', aspect: 16 / 9, fx: 0.5, fy: 0.5, widths: [800, 1400, 2000] },
  { key: 'werkzeugwand', name: 'werkzeugwand', aspect: 3 / 2, fx: 0.5, fy: 0.5, widths: [640, 1100] },
  { key: 'teile', name: 'teile', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [480, 800] },
  { key: 'azubi', name: 'azubi', aspect: 4 / 5, fx: 0.5, fy: 0.5, widths: [480, 800] },
  { key: 'kempten', name: 'kempten', aspect: 3 / 1, fx: 0.5, fy: 0.5, widths: [800, 1400, 2000] },
  { key: 'wsVorher', file: 'ws-before-aligned.png', name: 'waschtisch-vorher', aspect: 1, fx: 0.5, fy: 0.47, widths: [480, 800, 1080] },
  { key: 'wsNachher', name: 'waschtisch-nachher', aspect: 1, fx: 0.5, fy: 0.47, widths: [480, 800, 1080] },
];

function cropBox(w, h, aspect, fx = 0.5, fy = 0.5) {
  let cw = w, ch = Math.round(w / aspect);
  if (ch > h) { ch = h; cw = Math.round(h * aspect); }
  const left = Math.round(Math.min(Math.max(fx * w - cw / 2, 0), w - cw));
  const top = Math.round(Math.min(Math.max(fy * h - ch / 2, 0), h - ch));
  return { left, top, width: cw, height: ch };
}

sharp.concurrency(2);
const manifest = {};
for (const v of JOBS) {
  const src = resolve(SRC, v.file || sources[v.key].file);
  const meta = await sharp(src, { limitInputPixels: false }).metadata();
  const [W, H] = (meta.orientation || 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  const box = cropBox(W, H, v.aspect, v.fx, v.fy);
  const cropped = await sharp(src, { limitInputPixels: false }).rotate().extract(box).toBuffer();
  const files = [];
  for (const w of v.widths) {
    const h = Math.round(w / v.aspect);
    const img = sharp(cropped, { limitInputPixels: false }).resize(w, h, { kernel: 'lanczos3' });
    const avif = await img.clone().avif({ quality: v.q || 52, effort: 5 }).toBuffer();
    const webp = await img.clone().webp({ quality: 74, effort: 6 }).toBuffer();
    writeFileSync(resolve(OUT, `${v.name}-${w}.avif`), avif);
    writeFileSync(resolve(OUT, `${v.name}-${w}.webp`), webp);
    files.push({ w, h, avif: avif.length, webp: webp.length });
  }
  manifest[v.name] = { source: v.key, files };
  console.log(v.name, files.map((f) => `${f.w}w ${(f.avif / 1024).toFixed(0)}K/${(f.webp / 1024).toFixed(0)}K`).join(' | '));
}
writeFileSync(resolve(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
