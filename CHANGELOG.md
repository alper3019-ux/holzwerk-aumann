# Changelog

## 1.0.1 – 09.10.2026
- Live-Messung (Lighthouse 5 Läufe mobil/desktop, axe auf allen Seiten, Interaktionstest) nachgetragen, Screenshots von der Live-Seite.
- Neues Skript `scripts/axe-pages.mjs` für axe-Prüfung der Unterseiten.

## 1.0.0 – 09.10.2026
- Erste Veröffentlichung der Demo-Website „Holzwerk Aumann“ (fiktive Tischlerei, Kempten/Allgäu).
- Startseite mit 7 nummerierten Abschnitten und Wegweiser-Leiste (Guided Scrolling), Seiten-Fortschrittsbalken per `animation-timeline: scroll()`.
- Geführter Ablauf „Vom Aufmaß zum Einbau“ in 5 Schritten: Sticky-Spalte, Fortschrittsbalken per `view-timeline` (Fallback: Scroll-Berechnung in JS), aktiver Schritt per IntersectionObserver.
- Tastaturbedienbarer Vorher-Nachher-Regler (`input type=range`, `aria-valuetext`, Schnellwahl-Knöpfe) mit echter Restaurierung eines Dritten (CC BY 2.0), Vorher-Foto perspektivisch angeglichen.
- 3 Projekt-Detailseiten; das Vorschaubild wächst per Cross-Document View Transition zum Hero (Progressive Enhancement).
- Mehrstufige Anfrage (Projekt → Maße → Fotos → Kontakt) mit Validierung, Fokusführung, lokaler Foto-Vorschau und ehrlichem Demo-Ende ohne Versand.
- Mobile Anruf-Leiste (Drama-Number der Bundesnetzagentur), sichtbare Desktop-Navigation, Mobil-Menü mit Escape.
- Impressum (inkl. Handwerks-Platzhaltern), Datenschutz, Bildrechte (aus `photos/sources.json` generiert), 404.
- Selbst gehostete, untergesetzte Variable Fonts (Bricolage Grotesque, Hanken Grotesk; OFL), Fotos als AVIF/WebP.
- Messskripte: Lighthouse/axe (`scripts/audit.mjs`), Interaktionstest (`scripts/interaction-test.mjs`), Screenshots.
