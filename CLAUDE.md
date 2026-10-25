# Regeln für dieses Projekt

Plattform für die Websites einer Hotelgruppe (React + Vite, Supabase, Bunny CDN, Vercel), mit
Admin (`/admin`), CMS (`/cms`) und Mitgliederportal (`app.<gruppe>.de`).

- **Alles gilt für alle Hotels.** Keine hotel- oder kundenspezifischen Inhalte im Code; Inhalte
  kommen aus der Datenbank, neutrale Vorgaben aus `src/lib/*` (`PLACEHOLDER_IMAGE`, `…_FALLBACK`).
- **Jede Seite ist im CMS bearbeitbar – ausnahmslos.** Jede Seite und Unterseite der Website
  (auch Detailseiten wie ein einzelnes Zimmer oder Angebot) braucht:
  1. eine Route im CMS (`src/cms/CmsApp.tsx`, gleiche Adresse mit `/cms` davor),
  2. für Detailseiten einen Eintrag in `cmsDetailFromPath` (`src/cms/cmsPages.ts`) und in
     `ENTRY_SPECS` (`src/cms/CmsEntryEditor.tsx`) mit deutschen Feldnamen,
  3. `CmsSection` um die Seite und `data-cms-path` an Texten; Bilder zusätzlich
     `data-cms-kind="image"`, damit sie sich in der Vorschau anklicken lassen.
  Jedes Bild bekommt im CMS Upload (Bunny, WebP), Größenempfehlung (`cmsImageHints.ts`) und
  Alt-Text. `scripts/check-cms-pages.mjs` prüft das bei jedem Pull Request.
- **KI bleibt anbieteroffen** (OpenAI-kompatibel, Standard OpenRouter).
- **Geheimnisse:** `SUPABASE_SERVICE_ROLE_KEY` und andere Schlüssel nie mit `VITE_`-Präfix.
- **Server-Funktionen in `api/`** laufen im Edge-Modus (`export const config = { runtime: 'edge' }`);
  im Node-Modus können sie keine Projektdateien einbinden.
- **Datenbank-Änderungen** als neue Datei in `supabase/migrations/`, wiederholbar ausführbar; alter
  und neuer Stand der Website müssen mit der geänderten Datenbank funktionieren.
