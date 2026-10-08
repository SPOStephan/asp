// Pictures keep their original and crop, so they can be re-cropped later.
// Run: npx tsx scripts/check-media-sources.ts
import { allowedMediaUrl } from '../api/media-proxy';
import { isHiddenMetaPath } from '../src/cms/cmsHidden';
import { clampCrop, editableImageUrl, readMediaSource, withMediaSource } from '../src/cms/cmsMediaSource';

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || detail === undefined ? '' : ` -> ${JSON.stringify(detail)}`}`);
  if (!ok) failed += 1;
}

const crop = { x: 10, y: 20, width: 300, height: 200 };
const section = withMediaSource(withMediaSource({ title: 'x' }, 'hero_image', { src: 'https://cdn/a.webp', crop }), 'tiles.tile-2.image', { src: 'https://cdn/b.webp' });
check('original and crop stored per field', JSON.stringify(readMediaSource(section, 'hero_image')) === JSON.stringify({ src: 'https://cdn/a.webp', crop }));
check('fields stay apart', readMediaSource(section, 'tiles.tile-2.image')?.src === 'https://cdn/b.webp' && readMediaSource(section, 'logo') === null);
check('broken crop ignored', readMediaSource({ media_sources: { a: { src: 's', crop: { x: 'no' } } } }, 'a')?.crop === undefined);
check('crop kept inside a smaller original', JSON.stringify(clampCrop({ x: 900, y: 900, width: 500, height: 300 }, 1000, 1000)) === JSON.stringify({ x: 500, y: 700, width: 500, height: 300 }));
check('own files read directly, CDN through our proxy', editableImageUrl('/hero.jpg') === '/hero.jpg' && editableImageUrl('https://x.b-cdn.net/a b.webp') === '/api/media-proxy?url=https%3A%2F%2Fx.b-cdn.net%2Fa%20b.webp');
check('proxy only for our pull zone', allowedMediaUrl('https://lohbeck.b-cdn.net/hotels/a.webp', 'lohbeck.b-cdn.net') && !allowedMediaUrl('https://evil.example/a.webp', 'lohbeck.b-cdn.net') && !allowedMediaUrl('http://lohbeck.b-cdn.net/a.webp', 'lohbeck.b-cdn.net') && !allowedMediaUrl('https://lohbeck.b-cdn.net/a.webp', ''));
check('not shown as an editable field', isHiddenMetaPath('media_sources'));

if (failed) process.exit(1);
console.log('media sources ok');
