# Holzwerk Aumann – Demo-Website einer Tischlerei (Allgäu)

**Live:** https://alper3019-ux.github.io/holzwerk-aumann/ · **Repo:** https://github.com/alper3019-ux/holzwerk-aumann

> **Fiktives Unternehmen.** Holzwerk Aumann, alle Personen, Zahlen, Referenzen, Stellenangebote, Adressen und Kontaktdaten sind erfunden und auf der Seite als Demo gekennzeichnet. Die Fotos sind Symbolbilder von Wikimedia Commons und zeigen keine Arbeiten dieses Betriebs. Die Telefonnummer 089 99998 123 stammt aus den „Drama Numbers“ der Bundesnetzagentur (Mitteilung 148/2021) und ist keinem Anschluss zugeteilt. E-Mail-Adressen enden auf `.example`.

Konzept K3 aus `portfolio-v2/plan.md`: fotografiegeführte Seite mit **Guided Scrolling** für einen Handwerksbetrieb mit 8–20 Beschäftigten (Küchen, Einbauschränke, Treppen, Türen; Azubi- und Fachkräftegewinnung).

## Was gebaut wurde
| Bereich | Umsetzung |
|---|---|
| Stil | Vollflächige, warme Werkstattfotos; nüchterne Grotesk (Bricolage Grotesque für Überschriften, Hanken Grotesk für Text); Papier-, Holz- und Waldtöne; große, nur umrandete Abschnittsnummern 01–07. Kein 3D. |
| Guided Scrolling | Wegweiser-Leiste rechts (ab 1360 px Breite) markiert den aktiven Abschnitt; Seiten-Fortschrittsbalken unter dem Header per `animation-timeline: scroll(root)`. |
| Signatur 1: Ablauf | „Vom Aufmaß zum Einbau“ in 5 Schritten: Sticky-Spalte mit Schrittliste und Fortschrittsbalken per `view-timeline` (`@supports`), Fallback per JS-Scrollberechnung; aktiver Schritt per IntersectionObserver (`aria-current="step"`). |
| Signatur 2: Vorher-Nachher | `input type=range` mit Label und `aria-valuetext` („25 % Vorher, 75 % Nachher“), Pfeiltasten, Pos1/Ende, Klick/Ziehen, plus drei Schnellwahl-Knöpfe. Sichtbarer Fokusring. |
| Signatur 3: Projekte | Drei Projekt-Detailseiten; das Vorschaubild wächst per **Cross-Document View Transition** (`@view-transition { navigation: auto; }`, gleiche `view-transition-name`) zum Hero. Ohne Unterstützung (z. B. Firefox): normaler Seitenwechsel. |
| Anfrage | 4 Schritte (Projektart → Maße → Fotos → Kontakt), Validierung je Schritt mit `aria-invalid`/`aria-describedby`, Fokus auf die Schritt-Überschrift, Live-Region. Fotos nur als lokale Vorschau (Object-URL). Ende: „Demo beendet: Es wurde nichts gesendet.“ plus Zusammenfassung. Schrittwechsel per Same-Document View Transition. |
| Mobil | Sticky-Leiste „Anrufen (Demo-Nr.)“ und „Anfrage in 2 Min.“; Menü-Schaltfläche mit `aria-expanded`, Escape schließt. |
| Pflicht-Inhalte | Referenzen mit Ort und Jahr (Demo), Einsatzgebiet (schematische SVG-Karte, keine externe Karte), Jobs und Ausbildung, Werkstatt und Team (ohne Porträtfotos, da Personen erfunden). |
| Recht | Impressum nach § 5 DDG als Platzhalter; Kammer-/Handwerksrollen-Angaben als **ungeprüfte Platzhalter** markiert. Datenschutz beschreibt, was die Seite tatsächlich tut (keine Cookies, keine Drittanbieter, kein Versand). Bildrechte-Seite wird beim Build aus `photos/sources.json` erzeugt. |
| Bewegung | Alle Scroll-Animationen nur in `@supports (animation-timeline: …)` **und** `prefers-reduced-motion: no-preference`; bei Reduced Motion keine View Transitions und keine Animationen. |

## Recherche (geöffnete Quellen)
- Webflow, „8 web design trends to watch in 2026“ (Abschnitt „Guided scrolling“, Beispiel Emons von Blue World Studio mit nummerierten Schritten): https://webflow.com/blog/web-design-trends-2026
- Blue World Studio, Case Study Emons (klare Nutzerführung, CTA-Struktur; 3D dort als Video gelöst – hier bewusst weggelassen): https://www.blueworld.studio/en/cases/emons
- Awwwards, Emons (Honorable Mention): https://www.awwwards.com/sites/emons
- § 5 DDG (Pflichtangaben, u. a. Kammer, Berufsbezeichnung, Register): https://www.gesetze-im-internet.de/ddg/__5.html
- Handwerksordnung Anlage A (Nr. 27 Tischler, zulassungspflichtig): https://www.gesetze-im-internet.de/hwo/anlage_a.html
- Bundesnetzagentur, Rufnummern für Medienproduktionen (über Suche gelesen, Mitteilung 148/2021): https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/Nummerierung/start.html
- Plan-Grundlage: `portfolio-v2/plan.md` (Bitkom Handwerk 2025: 68 % digitaler Angebotsversand, 48 % Online-Terminbuchung; Destatis: 60 % zeigen Stellenangebote).

**Nur als Hinweis (X, kein Beleg):** @codrops zu „Isle Thorne Collective“ (Möbel-Template mit Seitenübergängen), https://x.com/codrops/status/2107800259137294606 · @awwwards SOTD „Noho“ (Möbel-Redesign-Konzept), https://x.com/awwwards/status/2100858063766827312. Beide Seiten habe ich nicht geöffnet; sie haben nur die Richtung bestätigt (ruhige Möbel-Ästhetik, Übergänge), nichts davon ist übernommen.

## Fotos
Alle von Wikimedia Commons, Download-URL, Lizenz, Urheber:in und SHA-1 in [`photos/sources.json`](photos/sources.json); Liste auch auf der Seite „Bildrechte“.
- 14 Fotos von Shixart1985 / Nenad Stojkovic (CC BY 2.0): Werkstatt, Werkzeuge, Küche, Schrank, Treppe, Eingang.
- Kempten-Panorama von Alofok (CC BY-SA 3.0).
- Waschtisch vorher/nachher von „Richard from USA“ (CC BY 2.0) – echte Restaurierung eines Dritten. Das Vorher-Foto wurde per affiner Transformation an die Nachher-Perspektive angeglichen (`photos/align-washstand.py`), sonst nur Zuschnitt/Skalierung/AVIF+WebP (`scripts/process-photos.mjs`).
- Verworfen: eine „Before & After“-Treppenmontage (Konto lädt offenbar fremde Inhalte hoch, Lizenz zweifelhaft) und eine Küchen-Serie, deren Vorher/Nachher-Reihenfolge nicht eindeutig war.

## Schriften
Bricolage Grotesque (instanziert auf opsz 72, wdth 100, wght 400–800) und Hanken Grotesk (wght 100–900), beide SIL OFL 1.1, Latin-Untermenge als WOFF2 (35 KB + 31 KB), selbst gehostet, `font-display: swap`, Preload.

## Messwerte
Gemessen am 09.10.2026 gegen 14:45–14:50 Uhr (MESZ) an der **Live-Seite** https://alper3019-ux.github.io/holzwerk-aumann/ mit Lighthouse 13 (Chrome, je 5 Läufe, Median) und axe-core. Die Messmaschine war während der Messung stark ausgelastet (Load-Average > 9 auf 8 Kernen); die Streuung im Mobil-Wert kommt vor allem daher (TBT).

| Messung | Ergebnis |
|---|---|
| Lighthouse Mobil, Performance (Median aus 5) | **91** (Einzelläufe 86 / 91 / 96 / 86 / 100) |
| Lighthouse Mobil, Accessibility / Best Practices / SEO | 100 / 100 / 100 |
| Lighthouse Mobil, Median-Metriken | FCP 1,3 s · LCP 1,9 s · TBT 314 ms · CLS 0 |
| Lighthouse Desktop, Performance (Median aus 5) | **100** (alle Läufe 100) |
| Lighthouse Desktop, Accessibility / Best Practices / SEO | 100 / 100 / 100 |
| Lighthouse Desktop, Median-Metriken | FCP 0,35 s · LCP 0,42 s · TBT 0 ms · CLS 0 |
| axe-core (WCAG 2.2 AA + Best Practices), Startseite Desktop + Mobil | 0 Verstöße |
| axe-core, alle Unterseiten (3 Projekte, Impressum, Datenschutz, Bildrechte, 404) Desktop + Mobil | 0 Verstöße |
| Interaktionstest (Playwright, `scripts/interaction-test.mjs`) | 23 / 23 bestanden, keine Konsolenfehler |
| Übertragung Startseite (Mobil, Erstaufruf) | ca. 165 KB in 12 Anfragen, keine Drittanbieter |

Rohdaten: `reports/live/summary.json`, `reports/live/subpages.txt`, `reports/live/interaction.txt`.

## Entwickeln, bauen, veröffentlichen
```bash
npm install
npm run dev                                   # http://localhost:4331/holzwerk-aumann/
PHOTO_SRC=/pfad/originale npm run photos      # Originale aus photos/sources.json laden
npm run build && BASE=/holzwerk-aumann/ node scripts/serve-dist.mjs dist 4333
node scripts/audit.mjs http://localhost:4333/holzwerk-aumann/ reports/local 5
node scripts/interaction-test.mjs
bash scripts/deploy-gh-pages.sh               # Build + normaler Push auf Branch gh-pages
```
GitHub Pages: Quelle Branch `gh-pages`, Ordner `/`. Keine GitHub Actions.

## Grenzen und offene Punkte
- **Rechtliche Prüfung nötig:** Impressum, Datenschutz und Handwerksangaben sind Platzhalter. Zuständige Handwerkskammer, Handwerksrolle und Berufsbezeichnung wurden für Kempten **nicht geprüft**.
- Formular sendet nichts (GitHub Pages hat kein Backend). Für Produktion: Formular-Dienst oder eigenes Backend, Datei-Upload mit Größenlimit, Spam-Schutz.
- Fotos sind Symbolbilder; ein echter Betrieb braucht eigene Projektfotos (idealerweise echte Vorher-Nachher-Paare aus gleicher Perspektive).
- Die Karte ist schematisch; Ortslagen ungefähr (aus Koordinaten grob umgerechnet).
- Cross-Document View Transitions laufen in Chromium-Browsern und Safari ab 18.2, nicht in Firefox (laut Chrome-Doku aus dem Plan); dort normaler Seitenwechsel.
- Lighthouse-Werte wurden auf einer stark ausgelasteten, geteilten Maschine gemessen; Einzelwerte schwanken.
