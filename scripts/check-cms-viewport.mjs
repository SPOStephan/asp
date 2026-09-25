import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/cms/CmsApp.tsx', import.meta.url), 'utf8');
assert.match(app, /CmsViewportBar/);
assert.match(app, /cms-preview/);
assert.match(app, /cms-device/);
assert.match(app, /is-phone/);
assert.match(app, /is-desktop/);

const bar = readFileSync(new URL('../src/cms/CmsViewportBar.tsx', import.meta.url), 'utf8');
assert.match(bar, /Desktop-Ansicht/);
assert.match(bar, /Mobil-Ansicht/);
assert.match(bar, /from 'lucide-react'/);
assert.match(bar, /<Monitor/);
assert.match(bar, /<Smartphone/);
assert.match(bar, /setFocalPreview\('desktop'\)/);
assert.match(bar, /setFocalPreview\('mobile'\)/);

const editor = readFileSync(new URL('../src/cms/CmsEditor.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(editor, /cms-dock__preview/);
assert.doesNotMatch(editor, /type="range"/);
assert.match(editor, /keepLiveFocals/);

const pan = readFileSync(new URL('../src/cms/CmsHeroPan.tsx', import.meta.url), 'utf8');
assert.match(pan, /data-cms-pan/);
assert.match(pan, /objectPosition/);
assert.match(pan, /setPointerCapture/);
assert.match(pan, /is-panned/);

const context = readFileSync(new URL('../src/cms/CmsContext.tsx', import.meta.url), 'utf8');
assert.match(context, /cms-view-mobile/);
assert.match(context, /data-cms-pan/);

const css = readFileSync(new URL('../src/cms/cms.css', import.meta.url), 'utf8');
assert.match(css, /\.cms-viewport/);
assert.match(css, /\.cms-preview\.is-phone/);
assert.match(css, /\.cms-preview\.is-phone \.cms-device/);
assert.match(css, /100cqh/);
assert.match(css, /\.hero__visual > \.cms-hero-pan/);
assert.doesNotMatch(css, /\.cms-stage\.is-phone-preview/);

console.log('cms viewport switch ok');
