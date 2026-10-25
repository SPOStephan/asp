# Mitgliederportal und App

Treueprogramm einer Hotelgruppe: Gäste melden sich mit E-Mail-Adresse und Passwort an und sehen
ihre Reisen, Punkte, Vorteile und ihre digitale Mitgliedskarte. Das Portal läuft auf einer eigenen
Adresse (z. B. `app.<gruppe>.de`), ist als App installierbar (PWA) und lässt sich mit Capacitor als
iOS- und Android-App in die Stores bringen – alles aus demselben Code.

## Bausteine

| Teil | Wo |
| --- | --- |
| Datenbank, Regeln, Punkte | `supabase/migrations/20261015090000_032_loyalty.sql`, `…_033_loyalty_portal.sql` |
| Portal (Startseite, Login, Übersicht, Reisen, Vorteile, Buchen, Karte, Profil) | `portal.html`, `src/portal/` |
| Musterdaten für Entwicklung und Vorführung | `supabase/seeds/loyalty-demo.sql` (kein Teil der Migrationen) |
| PWA (Manifest, Offline-Hülle, Icons) | `public/portal.webmanifest`, `public/portal-sw.js`, `public/portal-icon-*.png` |
| Store-Apps | `capacitor.config.json`, `vite.app.config.ts`, `npm run build:app` |
| Verwaltung | Admin → „Treueprogramm“ (`src/admin/loyalty/`) |
| Ein Login für alle Hotel-Websites | `src/member/`, `api/member-handoff.ts`, Portal-Seite `/weiter` |

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
- **Statt Stempelkarte:** Punkte, Stufen und Prämien lösen den Stammgastpass auf Papier ab. Die
  Übersicht zeigt den Weg zur nächsten Stufe und zur nächsten Prämie.
- **Vorteile:** drei Arten – automatische Vorteile (z. B. Late Check-out), Prämien gegen Punkte
  (Einlösen erzeugt einen Code) und Mitgliederpreise. Jeweils für alle Hotels oder ein Haus, optional
  ab einer Stufe.
- **Buchen zum Mitgliederpreis:** führt in die Buchungsstrecke des Hotels, der Mitglieder-Code wird
  als URL-Parameter mitgegeben (Code und Parametername im Admin einstellbar).

Alle Werte (Punkte pro Euro, Bonus, Stufen, Verfall, Code, Rechtslinks) stehen im Admin unter
„Programm“ – nichts davon ist fest im Code.

## Einrichtung

1. **Migrationen 032 und 033** im Supabase SQL-Editor ausführen.
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
4. **Admin → Treueprogramm:** Programmname, Regeln, Mitglieder-Code, Kontakt-E-Mail und die Links zu
   Teilnahmebedingungen, Datenschutz und Impressum eintragen, Vorteile (mit Bild) anlegen, erste
   Reisen importieren. Die Startseite des Portals zeigt Stufen, Vorteile und Prämien daraus.
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

## Musterdaten

Für Entwicklung und Vorführungen füllt `supabase/seeds/loyalty-demo.sql` ein bestehendes
Portal-Konto mit einem fiktiven Gast: Aufenthalte in den Hotels der Gruppe (vergangene, geplante,
eine Stornierung), Boni, eine eingelöste Prämie und Vorteile mit Bildern von den Hotelseiten.
Adresse des Kontos und Organisation stehen oben in der Datei; ein erneuter Lauf setzt die Daten
zurück, der Block am Ende entfernt sie wieder. Alles ist markiert (Buchungsnummern `DEMO-…`).

## Ein Login für alle Hotel-Websites

Gäste melden sich immer im Portal an; jede Hotel-Website der Gruppe übernimmt die Anmeldung:

- **Personen-Symbol** auf der Website → Portal `/weiter?to=<Website>` → (falls nötig) Anmeldung →
  zurück auf die Website, dort ebenfalls angemeldet (Name in der Kopfzeile). Technisch: das Portal
  holt bei `api/member-handoff` einen einmaligen Anmeldecode (es wird keine Mail verschickt) und
  hängt ihn als `#member=…` an; die Website meldet sich damit an und entfernt ihn sofort wieder.
- **Buchen auf der Website:** angemeldete Mitglieder gehen direkt mit Mitgliedercode in die
  Buchungsstrecke. Alle anderen gehen über `…/weiter?buchen=1`: Ist der Gast im Portal angemeldet
  (z. B. auf der Website eines anderen Hotels), kommt der Code dazu – sonst geht es ohne Rückfrage
  sofort weiter.
- **Links aus dem Portal** zu den Hotels melden den Gast dort gleich mit an (selber Tab).
- **Welche Adressen erlaubt sind,** steht im Admin: die Domains der aktiven Hotels der Gruppe und
  ihre Buchungsadressen. Für eine Live-Domain genügt es, sie beim Hotel einzutragen.
- Voraussetzung auf dem Server: `SUPABASE_SERVICE_ROLE_KEY` im Vercel-Projekt der Websites (nur für
  den Anmeldecode; niemals mit `VITE_`-Präfix). In Supabase unter Redirect URLs
  `https://app.<gruppe>.de/**` eintragen, damit Bestätigungsmails nach der Registrierung auf die
  Website zurückführen.
