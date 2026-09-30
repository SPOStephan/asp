import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fitRect, rejectUnsupportedImage, zoomRect } from '../src/cms/cmsImage';
import { formatImageHint, imageHint } from '../src/cms/cmsImageHints';
import { applyLiveMediaMap } from '../src/cms/cmsLiveMedia';
import { explainUploadFailure } from '../src/cms/cmsUploadMessage';
import type { HotelContent } from '../src/lib/hotelData';
import { mergeHotelLoad } from '../src/lib/hotelMerge';

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
assert.match(dialog, /pushUpload/);
assert.match(dialog, /setzt das Bild sofort ins Layout/);
assert.doesNotMatch(dialog, /revokeObjectURL/);
const hotel = readFileSync(new URL('../src/context/HotelContext.tsx', import.meta.url), 'utf8');
assert.match(hotel, /mergeHotelLoad/);
assert.match(hotel, /pendingSections/);
const frame = readFileSync(new URL('../src/cms/CmsContext.tsx', import.meta.url), 'utf8');
assert.match(frame, /pendingPeer/);

function hotelContent(sections: Record<string, Record<string, unknown>>): HotelContent {
  return { hotel: { id: 'h1' } as HotelContent['hotel'], sections, faqs: [], pages: {} };
}
assert.equal(
  mergeHotelLoad(hotelContent({ hero: { hero_image: '', title: 'Server' } }), hotelContent({ hero: { hero_image: 'https://cdn.example/neu.webp', title: 'Live' } }))
    .sections.hero.hero_image,
  'https://cdn.example/neu.webp',
);
assert.equal(
  mergeHotelLoad(hotelContent({ hero: { hero_image: '' } }), null, { hero: { hero_image: 'https://cdn.example/pending.webp' } })
    .sections.hero.hero_image,
  'https://cdn.example/pending.webp',
);
const imageSource = readFileSync(new URL('../src/cms/cmsImage.ts', import.meta.url), 'utf8');
assert.match(imageSource, /readAsDataURL/);
assert.match(imageSource, /image\/jpeg/);
assert.match(imageSource, /HEIC/);
const pan = readFileSync(new URL('../src/cms/CmsHeroPan.tsx', import.meta.url), 'utf8');
assert.match(pan, /zoomHeroFocal/);

assert.throws(
  () => rejectUnsupportedImage({ name: 'IMG_0001.HEIC', type: 'image/heic' } as File),
  /HEIC/,
);
assert.doesNotThrow(() => rejectUnsupportedImage({ name: 'meer.jpg', type: 'image/jpeg' } as File));
assert.equal(explainUploadFailure(503, '{"error":"Bunny ist nicht konfiguriert."}'), 'Bunny ist nicht konfiguriert.');
assert.match(explainUploadFailure(404, '<!DOCTYPE html><html><body>Not Found</body></html>'), /Vercel-Projekt asp/);
assert.match(explainUploadFailure(404, '<!DOCTYPE html><html><body>Not Found</body></html>'), /keine neue Subdomain/);
assert.equal(
  applyLiveMediaMap('hero', { hero_image: '', title: 'X' }, { 'hero::hero_image': 'https://cdn.example/a.webp' })?.hero_image,
  'https://cdn.example/a.webp',
);
assert.equal(
  (applyLiveMediaMap('discover', { tiles: [{ image: '' }] }, { 'discover::tiles.0.image': 'https://cdn.example/t.webp' })?.tiles as Array<{ image: string }>)[0]
    .image,
  'https://cdn.example/t.webp',
);
const context = readFileSync(new URL('../src/cms/CmsContext.tsx', import.meta.url), 'utf8');
assert.match(context, /writeLiveMedia/);
assert.match(context, /persistLiveSection/);
const preview = readFileSync(new URL('../src/cms/CmsPreviewFrame.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(preview, /<iframe/);
assert.match(preview, /children/);

const persist = frame.slice(frame.indexOf('async function persistLiveSection'), frame.indexOf('function applyField'));
assert.ok(persist.length > 0);
assert.doesNotMatch(persist, /keepLiveMedia/, 'the upload autosave must not merge the old image back over the new one');

console.log('cms image hints ok');
