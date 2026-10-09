/**
 * Vite-Konfiguration (statischer Multi-Page-Build, damit Cross-Document View Transitions greifen).
 *   VITE_BASE      Unterpfad, z. B. "/holzwerk-aumann/" (GitHub Pages)
 *   VITE_SITE_URL  absolute URL mit Schrägstrich am Ende (canonical, og:url, Sitemap)
 * Plugins:
 *   - photos(): ersetzt <x-photo name="…"> in HTML durch <picture> mit AVIF/WebP-srcset (public/photos/manifest.json)
 *   - credits(): füllt <!--BILDRECHTE--> in bildrechte.html aus photos/sources.json
 *   - seoFiles(): robots.txt + sitemap.xml
 */
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const root = import.meta.dirname;
const PAGES = {
  main: 'index.html',
  kueche: 'projekte/wohnkueche-buchenberg.html',
  treppe: 'projekte/treppe-durach.html',
  eingang: 'projekte/eingang-sulzberg.html',
  impressum: 'impressum.html',
  datenschutz: 'datenschutz.html',
  bildrechte: 'bildrechte.html',
  notfound: '404.html',
};
const INDEXABLE = ['', 'projekte/wohnkueche-buchenberg.html', 'projekte/treppe-durach.html', 'projekte/eingang-sulzberg.html'];

const attrs = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2] ?? true]));

function photos(base) {
  const manifest = JSON.parse(readFileSync(resolve(root, 'public/photos/manifest.json'), 'utf8'));
  const srcset = (name, fmt) => manifest[name].files.map((f) => `${base}photos/${name}-${f.w}.${fmt} ${f.w}w`).join(', ');
  return {
    name: 'aumann-photos',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<x-photo\s([^>]*)><\/x-photo>/g, (_, a) => {
          const p = attrs(a);
          const m = manifest[p.name];
          if (!m) throw new Error(`Foto ${p.name} fehlt im Manifest`);
          const mid = m.files[Math.min(1, m.files.length - 1)];
          const sizes = p.sizes || '100vw';
          let sources = '';
          if (p.mobile) {
            sources += `<source media="(max-width: 640px)" type="image/avif" srcset="${srcset(p.mobile, 'avif')}" sizes="100vw">`;
            sources += `<source media="(max-width: 640px)" type="image/webp" srcset="${srcset(p.mobile, 'webp')}" sizes="100vw">`;
          }
          sources += `<source type="image/avif" srcset="${srcset(p.name, 'avif')}" sizes="${sizes}">`;
          sources += `<source type="image/webp" srcset="${srcset(p.name, 'webp')}" sizes="${sizes}">`;
          const style = p.vt ? ` style="view-transition-name: ${p.vt}"` : '';
          const loading = p.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"';
          return `<picture${p.class ? ` class="${p.class}"` : ''}>${sources}<img src="${base}photos/${p.name}-${mid.w}.webp" width="${mid.w}" height="${mid.h}" alt="${p.alt || ''}"${loading}${style}${p.imgclass ? ` class="${p.imgclass}"` : ''}></picture>`;
        });
      },
    },
  };
}

function includes(base) {
  return {
    name: 'aumann-includes',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace(/<x-include src="([^"]+)"><\/x-include>/g, (_, f) => readFileSync(resolve(root, f), 'utf8')).replaceAll('%BASE_URL%', base),
    },
  };
}

function credits() {
  const src = JSON.parse(readFileSync(resolve(root, 'photos/sources.json'), 'utf8'));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const rows = Object.entries(src).map(([k, v]) => `<li><strong>${esc(v.title.replace(/^File:/, ''))}</strong><br>Urheber:in: ${esc(v.artist)} · Lizenz: <a href="${esc(v.licenseUrl)}" rel="license noopener">${esc(v.license)}</a> · Quelle: <a href="${esc(v.page)}" rel="noopener">Wikimedia Commons</a><br><span class="muted">Verwendung: ${k}${v.note ? ` · Bearbeitung: ${esc(v.note)}` : ' · Bearbeitung: Zuschnitt, Skalierung, Umwandlung in AVIF/WebP'}</span></li>`).join('\n');
  return { name: 'aumann-credits', transformIndexHtml: { order: 'pre', handler: (html) => html.replace('<!--BILDRECHTE-->', `<ol class="credits">${rows}</ol>`) } };
}

function seoFiles(siteUrl) {
  return {
    name: 'aumann-seo-files',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n` });
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${INDEXABLE.map((p) => `  <url><loc>${siteUrl}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n` });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE || '/';
  return {
    base,
    plugins: [includes(base), photos(base), credits(), seoFiles(env.VITE_SITE_URL)],
    build: {
      outDir: 'dist',
      assetsInlineLimit: 0,
      rollupOptions: { input: Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [k, resolve(root, v)])) },
    },
  };
});
