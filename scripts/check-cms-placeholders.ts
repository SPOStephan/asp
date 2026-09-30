import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cmsFieldLabel } from '../src/cms/cmsPlaceholders';

assert.equal(cmsFieldLabel('title'), 'Titel');
assert.equal(cmsFieldLabel('subtitle'), 'Untertitel');
assert.equal(cmsFieldLabel('eyebrow'), 'Dachzeile');
assert.equal(cmsFieldLabel('items.3.note_title'), 'Titel');
assert.equal(cmsFieldLabel('day_kicker'), 'Dachzeile');
assert.equal(cmsFieldLabel('overlap_text'), 'Text');
assert.equal(cmsFieldLabel('cta_text'), 'Button-Text');

const css = readFileSync(new URL('../src/cms/cms.css', import.meta.url), 'utf8');
assert.match(css, /body\.cms-on \[data-cms-placeholder\]:empty::before/);
const context = readFileSync(new URL('../src/cms/CmsContext.tsx', import.meta.url), 'utf8');
assert.match(context, /useCmsPlaceholders\(\)/);

console.log('cms placeholders ok');
