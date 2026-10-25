import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseStays } from '../src/admin/loyalty/importStays';
import { isPortalHost } from '../src/portal/config';

// Import of stays from the booking systems (CSV with German headers and formats).
const csv = `Buchungsnummer;Hotel;E-Mail;Name;Anreise;Abreise;Zimmer;Betrag;Kanal;Status
A-1;ambassador hotel & spa;Erika@Example.de;Erika Muster;10.03.2026;13.03.2026;Doppelzimmer;1.280,50 €;Direkt;abgereist
B-2;Hotel Oversum;max@example.de;Max;2026-12-27;2027-01-02;"Suite; Balkon";2400;Booking.com;gebucht
C-3;Hotel Oversum;x@example.de;X;01.02.2026;;Zimmer;100;;`;
const { rows, problems } = parseStays(csv);
assert.equal(rows.length, 2);
assert.equal(problems.length, 1, 'a row without departure is reported, not imported');
assert.deepEqual(
  { ref: rows[0].booking_ref, email: rows[0].guest_email, arrival: rows[0].arrival, amount: rows[0].amount_eur, channel: rows[0].channel, status: rows[0].status },
  { ref: 'A-1', email: 'erika@example.de', arrival: '2026-03-10', amount: 1280.5, channel: 'direct', status: 'stayed' },
);
assert.equal(rows[1].room, 'Suite; Balkon');
assert.equal(rows[1].channel, 'ota');
assert.equal(rows[1].status, 'booked');

// The portal answers on its own host only.
assert.ok(isPortalHost('app.example-hotels.de'));
assert.ok(!isPortalHost('www.example-hotel.de'));

// Guests only ever see their own rows; points come from the database, not from the app.
const sql = readFileSync(new URL('../supabase/migrations/20261015090000_032_loyalty.sql', import.meta.url), 'utf8');
for (const table of ['loyalty_members', 'loyalty_stays', 'loyalty_ledger', 'loyalty_redemptions']) {
  assert.match(sql, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
}
assert.match(sql, /loyalty_stays_own ON loyalty_stays FOR SELECT TO authenticated USING \(member_id = auth\.uid\(\)/);
assert.match(sql, /email_confirmed_at IS NOT NULL/, 'stays are linked only to confirmed e-mail addresses');
assert.doesNotMatch(sql, /loyalty_ledger_own ON loyalty_ledger FOR (ALL|INSERT)/, 'members cannot book points themselves');
// The stamp card is gone; the start page never sees the member rate code.
const portalSql = readFileSync(new URL('../supabase/migrations/20261025090000_033_loyalty_portal.sql', import.meta.url), 'utf8');
assert.match(portalSql, /settings - 'stamp_goal'/);
assert.doesNotMatch(portalSql.slice(portalSql.indexOf('CREATE OR REPLACE FUNCTION loyalty_summary')), /stamps/);
assert.match(portalSql, /- 'member_rate_code' - 'member_rate_param'/, 'the member rate code stays private');
assert.match(portalSql, /b\.active AND/, 'only active benefits are public');

// Sample data lives outside the migrations and is clearly marked.
const demo = readFileSync(new URL('../supabase/seeds/loyalty-demo.sql', import.meta.url), 'utf8');
assert.match(demo, /'DEMO-1001'/);
console.log('loyalty ok');
