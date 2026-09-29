import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fillEmptyMedia, MUSTER_MEDIA, NAVBAR_CTA, resolveMedia } from '../src/lib/media';

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

console.log('media placeholders ok');
