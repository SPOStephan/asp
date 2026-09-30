import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isHiddenMetaPath, partHiddenKey } from '../src/cms/cmsHidden';
import { cmsLinkTargets, filterLinkTargets, isExternalHref, matchLinkTarget } from '../src/cms/cmsLinkTargets';
import { discoverPageKeys } from '../src/lib/discoverPages';
import type { HotelContent } from '../src/lib/hotelData';

assert.equal(partHiddenKey('tiles'), 'hidden_tiles');
assert.ok(isHiddenMetaPath('hidden_tiles'));
assert.ok(!isHiddenMetaPath('title'));

const content = { hotel: { id: 'h1' }, sections: { page_hunde: { title: 'Hundeurlaub' } }, faqs: [], pages: { zimmer: true, hunde: true } } as unknown as HotelContent;
const targets = cmsLinkTargets(content);
assert.ok(targets.some((target) => target.href === '/zimmer' && target.active));
assert.ok(targets.some((target) => target.href === '/kulinarik' && !target.active));
assert.ok(targets.some((target) => target.href === '/seite/hunde' && target.label === 'Hundeurlaub'));
assert.ok(targets.some((target) => target.href.startsWith('/wellness/')));
assert.equal(matchLinkTarget(targets, '#highlights', 'Zimmer & Suiten')?.href, '/zimmer');
assert.ok(filterLinkTargets(targets, 'hunde').every((target) => /hunde/i.test(`${target.label}${target.href}`)));
assert.ok(isExternalHref('https://www.nordsee.de'));
assert.ok(!isExternalHref('/zimmer'));
assert.deepEqual(discoverPageKeys([{ title: 'X', href: 'https://example.com/zimmer' }]), []);

for (const file of ['WellnessPage', 'CulinaryPage', 'RoomsCardsPage', 'OffersPage', 'ImpressionsPage', 'BlogPage', 'FAQPage']) {
  assert.match(readFileSync(new URL(`../src/pages/${file}.tsx`, import.meta.url), 'utf8'), /<CmsPart /, file);
}
const discover = readFileSync(new URL('../src/components/Discover.tsx', import.meta.url), 'utf8');
assert.match(discover, /part="tiles"/);
assert.match(discover, /target: '_blank'/);

console.log('cms parts ok');
