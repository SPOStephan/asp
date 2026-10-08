# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Betrieb: Einstellungen pro Installation

Kundenspezifisches steht nicht im Code, sondern in Umgebungsvariablen (Vercel → Settings → Environment Variables):

| Variable | Zweck | Beispiel |
|---|---|---|
| `VITE_PRODUCT_NAME` | Name im Admin-Bereich | `Hotel CMS` |
| `VITE_PLATFORM_DOMAIN` | gemeinsame Domain für Hotel-Subdomains | `hotels.example.com` |
| `VITE_ADMIN_HOST` | Host des Admin-Bereichs (sonst jeder `admin.`-Host) | `admin.hotels.example.com` |
| `VITE_AUTH_COOKIE_DOMAIN` | teilt den Login über Subdomains | `.hotels.example.com` |
| `VITE_REFERENCE_HOTEL` | Slug des Hotels für unbekannte Domains und Vorschauen | `referenz-hotel` |

## Organisationen und Rechte

- `admins`: Plattform-Team, sieht alle Organisationen, pflegt Bibliothek und Icons.
- `organizations` → `hotels`: jeder Kunde ist eine Organisation mit eigenen Hotels.
- `organization_members`: Rollen `owner`, `admin` (Hotels, Inhalte, Team) und `editor` (nur Inhalte).
- Schreibrechte prüft die Datenbank pro Hotel (`can_edit_hotel`), nicht die Oberfläche.

Rechte-Test gegen ein lokales Postgres: `scripts/test-db.sh`

## KI-Wissen und KI-Concierge

Admin → **KI-Wissen**: pro Hotel und für die ganze Organisation (Gruppenwissen). Jede Organisation sieht nur ihr
eigenes Wissen; Gruppenwissen gilt in allen Hotels der Organisation.

- **Quellen**: eigene Website (automatisch aus dem CMS, nach jedem Speichern), Links/ganze Websites, PDFs (auch
  Scans), Texte, Antworten aus E-Mails (anonymisiert, erst nach Freigabe aktiv).
- **Testchat** mit Bewertung: 👍 wird Vorbild, 👎 wird Antwortregel, 🚩 (Red Flag) wird sofort eine Korrektur mit
  Vorrang, markiert die zitierten Quellen zum Prüfen und wird Prüffrage.
- **Prüffragen** laufen nach jeder Änderung am Wissen erneut; eine zweite KI vergleicht mit der richtigen Aussage.

Die KI ist anbieteroffen: jede OpenAI-kompatible Schnittstelle (OpenRouter, Mistral, Azure, eigene Modelle).

| Variable | Zweck | Beispiel |
|---|---|---|
| `AI_API_KEY` | Schlüssel des KI-Anbieters (nur Server) | `sk-or-…` |
| `AI_BASE_URL` | Adresse der Schnittstelle | `https://openrouter.ai/api/v1` (Standard) |
| `AI_CHAT_MODEL` | Standard-Modell für den Gästechat (optional, sonst im Admin wählen) | |
| `AI_EXTRACT_MODEL` | Standard-Modell zum Lesen von Scans, muss Bilder können (optional) | |
| `AI_HELPER_MODEL` | Standard-Modell für Hilfsaufgaben, darf günstig sein (optional) | |

Modelle lassen sich je Organisation und je Hotel unter „Einstellungen“ überschreiben.

**Website-Chat** (Admin → KI-Wissen → Hotel → Website-Chat): pro Hotel einschalten, Name, Begrüßung und
Vorschläge festlegen. Er öffnet sich über das Chat-Symbol der Buchungsleiste bzw. der mobilen Leiste; ausgeschaltet
zeigt das Symbol E-Mail und Telefon. Gespräche der Gäste lassen sich dort lesen und bewerten wie im Testchat.

| Variable | Zweck | Beispiel |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Zugang für Gäste ohne Login (`/api/chat`), nie mit `VITE_` | aus Supabase → Settings → API |
| `AI_CHAT_LIMIT_VISITOR_HOUR` | Fragen pro Besucher und Stunde (optional) | `30` |
| `AI_CHAT_LIMIT_HOTEL_DAY` | Fragen pro Hotel und Tag (optional) | `1500` |

Das Hotel ergibt sich immer aus der aufgerufenen Domain; IP-Adressen werden nicht gespeichert, nur ein täglich
wechselnder Hashwert für die Limits.

Gespräche bleiben dauerhaft gespeichert. Persönliche Daten darin (Namen, E-Mail, Telefon, Adressen, Buchungsnummern)
entfernt ein nächtlicher Lauf (`/api/maintenance`, Vercel Cron) nach `AI_CHAT_ANONYMIZE_DAYS` Tagen (Standard 30);
im Admin geht es pro Gespräch auch sofort. Der Lauf braucht `CRON_SECRET` (beliebige lange Zeichenfolge) in Vercel.
Prüfungen ohne Datenbank und ohne Kosten: `npx tsx scripts/check-knowledge.ts`
