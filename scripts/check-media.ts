import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fillEmptyMedia, MUSTER_MEDIA, resolveMedia } from '../src/lib/media';

assert.equal(resolveMedia('', MUSTER_MEDIA.hero), MUSTER_MEDIA.hero);
assert.equal(resolveMedia('   ', MUSTER_MEDIA.logoNormal), MUSTER_MEDIA.logoNormal);
assert.equal(resolveMedia('/bunny/x.webp', MUSTER_MEDIA.hero), '/bunny/x.webp');

assert.deepEqual(fillEmptyMedia('navbar', {}), {
  logo_white: MUSTER_MEDIA.logoWhite,
  logo_normal: MUSTER_MEDIA.logoNormal,
});
assert.deepEqual(fillEmptyMedia('navbar', { logo_normal: '/mine.png' }), {
  logo_white: MUSTER_MEDIA.logoWhite,
  logo_normal: '/mine.png',
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

console.log('media placeholders ok');
