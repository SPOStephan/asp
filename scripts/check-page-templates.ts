import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  defaultSelectedKeys,
  emptyContainer,
  genericSectionKey,
  matchesTemplateQuery,
  normalizeSelection,
  pageKeyFromHref,
  pageKeyFromPath,
  pageRowsForHotel,
  sectionsToSeed,
  slugifyTemplateKey,
  SYSTEM_TEMPLATES,
  templateFromLibraryDraft,
} from '../src/lib/pageTemplates';

const selected = defaultSelectedKeys();
assert.ok(selected.includes('home'));
assert.ok(selected.includes('zimmer'));
assert.ok(selected.includes('angebote'));
assert.ok(selected.includes('kulinarik'));
assert.ok(selected.includes('impressum'));
assert.ok(selected.includes('datenschutz'));
assert.ok(!selected.includes('wellness'));
assert.ok(!selected.includes('agb'));

assert.deepEqual(normalizeSelection(SYSTEM_TEMPLATES, ['zimmer']).sort(), ['home', 'zimmer']);
assert.ok(normalizeSelection(SYSTEM_TEMPLATES, []).includes('home'));

const stripped = emptyContainer({
  title: 'Ambassador',
  items: [{ id: 'a', title: 'Suite', image: '/x.webp' }],
  show: true,
});
assert.deepEqual(stripped, { title: '', items: [{ id: '', title: '', image: '' }], show: true });

assert.equal(pageKeyFromPath('/'), 'home');
assert.equal(pageKeyFromPath('/zimmer/suite'), 'zimmer');
assert.equal(pageKeyFromPath('/impressum'), 'impressum');
assert.equal(pageKeyFromPath('/seite/hochzeit'), 'hochzeit');
assert.equal(pageKeyFromHref('/kulinarik#tisch'), 'kulinarik');

const rows = pageRowsForHotel('hotel-1', SYSTEM_TEMPLATES, ['home', 'zimmer']);
assert.equal(rows.find((row) => row.page_key === 'home')?.enabled, true);
assert.equal(rows.find((row) => row.page_key === 'zimmer')?.enabled, true);
assert.equal(rows.find((row) => row.page_key === 'wellness')?.enabled, false);
assert.ok(!rows.some((row) => row.page_key === 'hochzeit'));

const seeded = sectionsToSeed(SYSTEM_TEMPLATES, ['home', 'impressum'], ['footer']);
assert.ok(seeded.some((row) => row.section_key === 'navbar'));
assert.ok(!seeded.some((row) => row.section_key === 'footer'));
assert.ok(seeded.some((row) => row.section_key === 'hero'));
assert.ok(seeded.some((row) => row.section_key === 'legal_impressum'));
assert.ok(!seeded.some((row) => row.section_key === 'wellness_page'));

assert.equal(slugifyTemplateKey('Hochzeit am Meer'), 'hochzeit-am-meer');
assert.equal(genericSectionKey('hochzeit'), 'page_hochzeit');

const draft = templateFromLibraryDraft({ title: 'Hochzeit', tags: ['events', 'hochzeit'] });
assert.equal(draft.kind, 'library');
assert.equal(draft.path_prefix, '/seite/hochzeit');
assert.deepEqual(draft.section_keys, ['page_hochzeit']);
assert.equal(matchesTemplateQuery(draft, 'events'), true);
assert.equal(matchesTemplateQuery(draft, 'wellness'), false);

const form = readFileSync(new URL('../src/admin/pages/AdminHotelFormPage.tsx', import.meta.url), 'utf8');
assert.match(form, /applyHotelPageSelection/);
assert.match(form, /defaultSelectedKeys/);
assert.match(form, /Seiten für dieses Hotel/);

const library = readFileSync(new URL('../src/admin/pages/AdminTemplatesPage.tsx', import.meta.url), 'utf8');
assert.match(library, /Seiten-Bibliothek/);
assert.match(library, /Als leeren Container speichern/);
assert.match(library, /matchesTemplateQuery/);

const migration = readFileSync(new URL('../supabase/migrations/20260926120000_023_page_templates.sql', import.meta.url), 'utf8');
assert.match(migration, /CREATE TABLE IF NOT EXISTS page_templates/);
assert.match(migration, /DROP CONSTRAINT IF EXISTS hotel_pages_page_key_check/);

console.log('page templates ok');
