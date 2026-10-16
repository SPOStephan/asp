# Mitgliederportal und App

Treueprogramm einer Hotelgruppe: Gäste melden sich mit E-Mail-Adresse und Passwort an und sehen
ihre Reisen, Punkte, Vorteile und ihre digitale Mitgliedskarte. Das Portal läuft auf einer eigenen
Adresse (z. B. `app.<gruppe>.de`), ist als App installierbar (PWA) und lässt sich mit Capacitor als
iOS- und Android-App in die Stores bringen – alles aus demselben Code.

## Bausteine

| Teil | Wo |
| --- | --- |
| Datenbank, Regeln, Punkte | `supabase/migrations/20261015090000_032_loyalty.sql` |
| Portal (Login, Übersicht, Reisen, Vorteile, Buchen, Karte, Profil) | `portal.html`, `src/portal/` |
| PWA (Manifest, Offline-Hülle, Icons) | `public/portal.webmanifest`, `public/portal-sw.js`, `public/portal-icon-*.png` |
| Store-Apps | `capacitor.config.json`, `vite.app.config.ts`, `npm run build:app` |
| Verwaltung | Admin → „Treueprogramm“ (`src/admin/loyalty/`) |
| Login-Link auf den Hotel-Websites | Personen-Symbol in der Navigationsleiste (wenn `VITE_PORTAL_URL` gesetzt ist) |

## So funktioniert das Programm

- **Mitglied werden:** kostenlos im Portal. Jedes Mitglied bekommt eine 8-stellige Mitgliedsnummer
  (auch als QR-Code auf der Karte).
- **Reisen:** kommen aus den Buchungssystemen der Hotels (Admin → Treueprogramm → „Reisen
  importieren“, CSV). Sie werden über die **bestätigte** E-Mail-Adresse dem Mitglied zugeordnet –
  auch Reisen von vor der Registrierung.
- **Punkte:** für abgereiste Aufenthalte, automatisch in der Datenbank:
  Betrag × Punkte pro Euro, bei Direktbuchung plus Bonus. Punkte verfallen nach der eingestellten
  Zeit. Das Team kann Punkte von Hand buchen (Kulanz, Aktionen).
- **Stufen:** nach den Punkten der letzten N Monate (Standard: Classic, Silber ab 2.500, Gold ab
  7.500 in 24 Monaten).
- **Stammgastpass digital:** ein Stempel je direkt gebuchtem Aufenthalt, nach 10 Stempeln eine
  Gratisnacht – wie der bisherige Pass auf Papier.
- **Vorteile:** drei Arten – automatische Vorteile (z. B. Late Check-out), Prämien gegen Punkte
  (Einlösen erzeugt einen Code) und Mitgliederpreise. Jeweils für alle Hotels oder ein Haus, optional
  ab einer Stufe.
- **Buchen zum Mitgliederpreis:** führt in die Buchungsstrecke des Hotels, der Mitglieder-Code wird
  als URL-Parameter mitgegeben (Code und Parametername im Admin einstellbar).

Alle Werte (Punkte pro Euro, Bonus, Stufen, Verfall, Stempel, Code) stehen im Admin unter
„Programm“ – nichts davon ist fest im Code.

## Einrichtung

1. **Migration 032** im Supabase SQL-Editor ausführen.
2. **Supabase → Authentication:**
   - Registrierung erlauben („Allow new users to sign up“) und „Confirm email“ einschalten.
   - Unter URL Configuration `https://app.<gruppe>.de` und `https://app.<gruppe>.de/passwort-neu`
     als Redirect-URLs eintragen.
   - Eigenen SMTP-Versand einrichten (Absender der Gruppe), damit Bestätigungs- und
     Passwort-Mails zuverlässig ankommen; Mail-Vorlagen auf Deutsch anpassen.
3. **Vercel:** Domain `app.<gruppe>.de` zum Projekt hinzufügen. Umgebungsvariablen:
   - `VITE_PORTAL_HOST=app.<gruppe>.de`
   - `VITE_PORTAL_ORG=<slug der Organisation>` (z. B. `privathotels-dr-lohbeck`)
   - `VITE_PORTAL_URL=https://app.<gruppe>.de` (Login-Link auf den Hotel-Websites, Mail-Links aus der App)
   - optional `VITE_PORTAL_NAME` (sonst der Programmname aus dem Admin)
4. **Admin → Treueprogramm:** Programmname, Regeln, Mitglieder-Code und Kontakt-E-Mail eintragen,
   Vorteile anlegen, erste Reisen importieren.
5. **Rechtliches:** Teilnahmebedingungen und Datenschutzhinweise zum Programm (Verarbeitung von
   Aufenthaltsdaten, Newsletter-Einwilligung, Löschung) vor dem Start ergänzen.

## App Stores

Die PWA ist sofort installierbar („Zum Home-Bildschirm“). Für die Stores:

```bash
npm i -D @capacitor/cli && npm i @capacitor/core @capacitor/ios @capacitor/android
npm run build:app          # Portal allein nach dist-app/
npx cap add ios && npx cap add android
npx cap sync
npx cap open ios           # Xcode: Signieren, Icons (public/portal-icon-1024.png), Upload
npx cap open android       # Android Studio: Signieren, Bundle für Google Play
```

Voraussetzungen: Apple Developer Program (99 $/Jahr) und Google-Play-Entwicklerkonto (einmalig 25 $),
App-ID (`capacitor.config.json`, derzeit `de.lohbeckhotels.app`), Datenschutzerklärung als URL,
Screenshots. Apple verlangt für Apps mit Konto eine **Konto-Löschung in der App** – der Profil-Bereich
hat dafür den Kontakt; vor der Einreichung sollte daraus ein echter Lösch-Knopf werden.

Ausbaustufen für die Store-App: Push-Mitteilungen (Anreise-Erinnerung, neue Vorteile), Karte in
Apple/Google Wallet, Login mit Face ID.

## Offene Entscheidungen

- **Datenquelle Reisen:** zum Start CSV-Import aus den Buchungssystemen; sobald die Schnittstelle
  (Onepagebooking/Hotelnetsolutions bzw. PMS) wieder freigegeben ist, automatischer Abgleich.
- **Punkteregeln und Stufen:** Standardwerte sind Vorschläge.
- **Mitgliederpreis:** Rabatt-Code je Buchungsstrecke anlegen und den URL-Parameter klären.
- **Name, Icon und Farben des Programms** (Icons in `public/portal-icon-*.png` sind neutrale Platzhalter).
