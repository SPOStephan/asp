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
