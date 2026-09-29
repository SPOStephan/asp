import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fitRect, zoomRect } from '../src/cms/cmsImage';
import { formatImageHint, imageHint } from '../src/cms/cmsImageHints';

assert.equal(imageHint('hero', 'hero_image').width, 1920);
assert.equal(imageHint('hero', 'hero_image').height, 1080);
assert.equal(imageHint('discover', 'tiles.0.image').width, 1600);
assert.equal(imageHint('discover', 'tiles.0.image').height, 1200);
assert.equal(imageHint('navbar', 'logo_normal').width, 720);
assert.equal(imageHint('rooms_page', 'items.suite.image').width, 1400);
assert.equal(imageHint('offers', 'items.a.image_primary').width, 1200);
assert.match(formatImageHint(imageHint('hero', 'hero_image')), /1920 × 1080 Pixel \(16:9\)/);

const fitted = fitRect(4000, 2000, 16 / 9);
assert.equal(Math.round(fitted.width / fitted.height * 100), 178);
const closer = zoomRect(fitted, 4000, 2000, 0.5, 16 / 9);
assert.ok(closer.width < fitted.width);
assert.ok(closer.height < fitted.height);
const wider = zoomRect(closer, 4000, 2000, 2, 16 / 9);
assert.ok(wider.width > closer.width);

const field = readFileSync(new URL('../src/cms/CmsImageField.tsx', import.meta.url), 'utf8');
assert.match(field, /formatImageHint/);
const dialog = readFileSync(new URL('../src/cms/CmsImageDialog.tsx', import.meta.url), 'utf8');
assert.match(dialog, /\+ Näher/);
assert.match(dialog, /zoomRect/);
const pan = readFileSync(new URL('../src/cms/CmsHeroPan.tsx', import.meta.url), 'utf8');
assert.match(pan, /zoomHeroFocal/);

console.log('cms image hints ok');
