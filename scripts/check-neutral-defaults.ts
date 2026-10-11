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

// What a hotel shows before it has content of its own must never be another hotel's.
const defaults = {
  BLOG_PAGE_FALLBACK, CULINARY_PAGE_FALLBACK, IMPRESSIONS_PAGE_FALLBACK, MUSTER_DISCOVER_TILES, MUSTER_MEDIA,
  OFFERS_PAGE_FALLBACK, ROOMS_PAGE_FALLBACK, WELLNESS_PAGE_FALLBACK, FAQ_PAGE_FALLBACK, FOOTER_FALLBACK,
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
const menu = autoMenuGroups({ rooms_page: { items: [{ id: 'eigenes', name: 'Eigenes Zimmer' }] } });
assert.ok(menu.find((group) => group.href === '/zimmer')?.links.some((link) => link.href === '/zimmer/eigenes'));
console.log('neutral defaults ok');
