import assert from 'node:assert/strict';
import { entryFocal, heroFocalStyle, keepLiveFocals, panFocal, readHeroFocal, writeHeroFocal } from '../src/cms/cmsFocal';

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

const kept = keepLiveFocals(
  { title: 'Neu', hero_focal: { desktop: { x: 10, y: 10 }, mobile: { x: 10, y: 10 } }, items: [{ id: 'a', hero_focal: { x: 1, y: 1 } }] },
  { hero_focal: { desktop: { x: 80, y: 20 }, mobile: { x: 15, y: 90 } }, items: [{ id: 'a', hero_focal: { x: 33, y: 66 } }] },
);
assert.deepEqual(kept.hero_focal, { desktop: { x: 80, y: 20 }, mobile: { x: 15, y: 90 } });
assert.equal((kept.items as { hero_focal: { x: number } }[])[0].hero_focal.x, 33);

console.log('cms focal helpers ok');
