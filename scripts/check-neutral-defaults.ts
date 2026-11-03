import assert from 'node:assert/strict';
import { BLOG_PAGE_FALLBACK } from '../src/lib/blog';
import { CULINARY_PAGE_FALLBACK } from '../src/lib/culinary';
import { IMPRESSIONS_PAGE_FALLBACK } from '../src/lib/impressions';
import { MUSTER_DISCOVER_TILES, MUSTER_MEDIA } from '../src/lib/media';
import { OFFERS_PAGE_FALLBACK } from '../src/lib/offers';
import { ROOMS_PAGE_FALLBACK } from '../src/lib/rooms';
import { WELLNESS_PAGE_FALLBACK } from '../src/lib/wellness';
import { FAQ_PAGE_FALLBACK, FOOTER_FALLBACK } from '../src/cms/cmsPages';
import { autoMenuGroups } from '../src/lib/autoMenu';
import { ABOUT_PAGE_FALLBACK } from '../src/lib/aboutPage';
import { ARRIVAL_PAGE_FALLBACK } from '../src/lib/arrivalPage';
import { EVENTS_PAGE_FALLBACK } from '../src/lib/topicAreas';

// What a hotel shows before it has content of its own must never be another hotel's.
const defaults = {
  BLOG_PAGE_FALLBACK, CULINARY_PAGE_FALLBACK, IMPRESSIONS_PAGE_FALLBACK, MUSTER_DISCOVER_TILES, MUSTER_MEDIA,
  OFFERS_PAGE_FALLBACK, ROOMS_PAGE_FALLBACK, WELLNESS_PAGE_FALLBACK, FAQ_PAGE_FALLBACK, FOOTER_FALLBACK,
  ABOUT_PAGE_FALLBACK,
  ARRIVAL_PAGE_FALLBACK,
  EVENTS_PAGE_FALLBACK,
  menu: autoMenuGroups({}),
};
const hotelWords = /Nordsee|Sankt Peter|St\. Peter|Ording|Sandperle|Auramaris|ambassador|Seebrücke|Oversum|Winterberg|Sauerland|Lohbeck|Euro|€/i;
for (const [name, value] of Object.entries(defaults)) {
  const text = JSON.stringify(value);
  assert.doesNotMatch(text, hotelWords, `${name} names a hotel, place or price`);
}
for (const list of [BLOG_PAGE_FALLBACK.items, CULINARY_PAGE_FALLBACK.items, IMPRESSIONS_PAGE_FALLBACK.items, OFFERS_PAGE_FALLBACK.items, ROOMS_PAGE_FALLBACK.items, WELLNESS_PAGE_FALLBACK.items]) {
  assert.equal(list.length, 0, 'no example entries of another hotel');
}
// The automatic menu only lists the hotel's own entries.
const menu = autoMenuGroups({ wellness_page: { items: [{ id: 'eigenes', name: 'Eigenes Thema' }] } });
assert.ok(menu.find((group) => group.href === '/wellness')?.links.some((link) => link.href === '/wellness/eigenes'));
// Rooms sit under "Hotel"; no group repeats its own page as a link below the title.
assert.ok(menu.find((group) => group.title === 'Hotel')?.links.some((link) => link.href === '/zimmer'));
for (const group of menu) assert.ok(!group.href || !group.links.some((link) => link.href === group.href), `${group.title} repeats itself`);
assert.deepEqual(menu.map((group) => group.title), ['Hotel', 'Angebote', 'Wellness', 'Kulinarik', 'Tagen', 'Urlaub in der Region']);
// Offers: themes in the menu, never single offers; a theme without offers stays out.
const themed = autoMenuGroups({
  offers_page: {
    filters: [{ id: 'wellness', label: 'Wellness-Angebote' }, { id: 'leer', label: 'Leer' }],
    items: [{ id: 'a', title: 'A', topics: ['wellness'] }, { id: 'b', title: 'B' }],
  },
});
assert.deepEqual(themed.find((group) => group.title === 'Angebote')?.links, [{ label: 'Wellness-Angebote', href: '/angebote?thema=wellness' }]);
// Meetings/celebrations named and addressed as the hotel offers them.
const party = autoMenuGroups({ events_page: { mode: 'feiern', items: [{ id: 'h', kind: 'feiern', name: 'Hochzeiten' }, { id: 't', kind: 'tagen', name: 'Räume' }] } });
assert.deepEqual(party.find((group) => group.href === '/feiern'), { title: 'Feiern', href: '/feiern', links: [{ label: 'Hochzeiten', href: '/feiern/h' }] });
// Kulinarik: the main (first) restaurant, at its place on the culinary page – nothing else.
const food = autoMenuGroups({ culinary_page: { items: [{ id: 'haupt', name: 'Restaurant Eins' }, { id: 'bar', name: 'Bar' }] } });
assert.deepEqual(food.find((group) => group.title === 'Kulinarik')?.links, [{ label: 'Restaurant Eins', href: '/kulinarik#haupt' }]);
// Without "Über uns" the "Hotel" group has no page of its own.
assert.equal(autoMenuGroups({}, (key) => key !== 'ueber-uns').find((group) => group.title === 'Hotel')?.href, undefined);
console.log('neutral defaults ok');
