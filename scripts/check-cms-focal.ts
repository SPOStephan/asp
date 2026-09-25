import assert from 'node:assert/strict';
import { entryFocal, heroFocalStyle, panFocal, readHeroFocal, writeHeroFocal } from '../src/cms/cmsFocal';

assert.deepEqual(readHeroFocal(undefined).desktop, { x: 50, y: 50 });
assert.deepEqual(readHeroFocal({ x: 68, y: 40 }).mobile, { x: 68, y: 40 });
assert.deepEqual(readHeroFocal({ x: 68, y: 40 }).desktop, { x: 50, y: 50 });
assert.deepEqual(readHeroFocal({ desktop: { x: 20, y: 80 }, mobile: { x: 10, y: 90 } }).desktop, { x: 20, y: 80 });

const panned = panFocal({ x: 50, y: 50 }, 100, 0, 200, 200);
assert.equal(panned.x, 0);
assert.equal(panned.y, 50);

const written = writeHeroFocal({ x: 68, y: 50 }, 'desktop', { x: 12, y: 88 });
assert.deepEqual(written.desktop, { x: 12, y: 88 });
assert.deepEqual(written.mobile, { x: 68, y: 50 });

const style = heroFocalStyle(written);
assert.equal(style['--hero-focal-desktop'], '12% 88%');
assert.equal(style['--hero-focal-mobile'], '68% 50%');

assert.equal(entryFocal([{ id: 'feiertage', hero_focal: { x: 10, y: 20 } }], 'feiertage')?.x, 10);
assert.equal(entryFocal([{ slug: 'foo', hero_focal: { x: 1, y: 2 } }], 'foo')?.y, 2);

console.log('cms focal helpers ok');
