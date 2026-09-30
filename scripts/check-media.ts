import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { discoverPageKeys, missingDiscoverPages } from '../src/lib/discoverPages';
import { absoluteMediaUrl, fillEmptyMedia, MUSTER_DISCOVER_TILES, MUSTER_MEDIA, NAVBAR_CTA, repairMediaUrls, resolveDiscoverTiles, resolveMedia } from '../src/lib/media';

assert.equal(resolveMedia('', MUSTER_MEDIA.hero), MUSTER_MEDIA.hero);
assert.equal(resolveMedia('   ', MUSTER_MEDIA.logoNormal), MUSTER_MEDIA.logoNormal);
assert.equal(resolveMedia('/bunny/x.webp', MUSTER_MEDIA.hero), '/bunny/x.webp');

assert.deepEqual(fillEmptyMedia('navbar', {}), {
  logo_white: MUSTER_MEDIA.logoWhite,
  logo_normal: MUSTER_MEDIA.logoNormal,
  cta_text: NAVBAR_CTA.inquire,
  cta_solid_text: NAVBAR_CTA.book,
  cta_solid_href: NAVBAR_CTA.bookHref,
});
assert.deepEqual(fillEmptyMedia('navbar', { logo_normal: '/mine.png', cta_solid_text: 'Jetzt' }), {
  logo_white: MUSTER_MEDIA.logoWhite,
  logo_normal: '/mine.png',
  cta_text: NAVBAR_CTA.inquire,
  cta_solid_text: 'Jetzt',
  cta_solid_href: NAVBAR_CTA.bookHref,
});
assert.deepEqual(fillEmptyMedia('hero', { hero_image: MUSTER_MEDIA.hero, title: 'Hi' }), {
  hero_image: MUSTER_MEDIA.hero,
  title: 'Hi',
});
assert.equal(fillEmptyMedia('welcome', { title: 'Hi' }).title, 'Hi');

const hero = readFileSync(new URL('../src/components/Hero.tsx', import.meta.url), 'utf8');
assert.match(hero, /resolveMedia\(data\.hero_image/);
const nav = readFileSync(new URL('../src/components/Navbar.tsx', import.meta.url), 'utf8');
assert.match(nav, /resolveMedia\(data\.logo_normal/);
assert.match(nav, /resolveMedia\(data\.cta_text, NAVBAR_CTA\.inquire\)/);
assert.match(nav, /resolveMedia\(data\.cta_solid_text, NAVBAR_CTA\.book\)/);

assert.equal(absoluteMediaUrl('lohbeck.b-cdn.net/hotels/a/b.webp'), 'https://lohbeck.b-cdn.net/hotels/a/b.webp');
assert.equal(absoluteMediaUrl('https://lohbeck.b-cdn.net/x.webp'), 'https://lohbeck.b-cdn.net/x.webp');
assert.equal(absoluteMediaUrl('/asp-start01.jpg'), '/asp-start01.jpg');
assert.deepEqual(repairMediaUrls({ hero_image: 'lohbeck.b-cdn.net/x.webp', items: [{ image: 'lohbeck.b-cdn.net/y.webp', title: 'Suite' }] }), {
  hero_image: 'https://lohbeck.b-cdn.net/x.webp',
  items: [{ image: 'https://lohbeck.b-cdn.net/y.webp', title: 'Suite' }],
});

assert.equal(MUSTER_DISCOVER_TILES.length, 9);
assert.equal(resolveDiscoverTiles(undefined).length, 9);
assert.equal(resolveDiscoverTiles([]).length, 9);
assert.deepEqual(resolveDiscoverTiles([{ title: 'Eigene' }]), [{ id: 'tile-1', image: '', eyebrow: '', title: 'Eigene', href: '' }]);
assert.deepEqual(resolveDiscoverTiles(undefined).map((tile) => tile.id), MUSTER_DISCOVER_TILES.map((_, index) => `tile-${index + 1}`));
assert.deepEqual(resolveDiscoverTiles([{ id: 'a' }, { id: 'a' }]).map((tile) => tile.id), ['a', 'a-2']);
assert.deepEqual(discoverPageKeys(undefined).sort(), ['kulinarik', 'wellness', 'zimmer']);
assert.deepEqual(missingDiscoverPages([{ title: 'X', href: '/impressionen' }, { title: 'Y', href: '/zimmer' }], { zimmer: true }), ['impressionen']);
const discover = readFileSync(new URL('../src/components/Discover.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(discover, /isPageEnabled/, 'Discover tiles are never hidden for disabled pages');
assert.equal((fillEmptyMedia('discover', {}).tiles as unknown[]).length, 9);

console.log('media placeholders ok');
