import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/cms/CmsApp.tsx', import.meta.url), 'utf8');
assert.match(app, /CmsViewportBar/);
assert.match(app, /CmsPreviewFrame/);
assert.match(app, /isCmsFrame\(\)/);
assert.match(app, /MobileChromeDock/);

const frame = readFileSync(new URL('../src/cms/CmsPreviewFrame.tsx', import.meta.url), 'utf8');
assert.match(frame, /<iframe/);
assert.match(frame, /toCmsFrameHref/);
assert.match(frame, /CMS_PHONE_WIDTH/);
assert.match(frame, /CMS_PHONE_HEIGHT/);
assert.match(frame, /setFrameWindow/);

const bar = readFileSync(new URL('../src/cms/CmsViewportBar.tsx', import.meta.url), 'utf8');
assert.match(bar, /Desktop-Ansicht/);
assert.match(bar, /Mobil-Ansicht/);
assert.match(bar, /<Monitor/);
assert.match(bar, /<Smartphone/);

const editor = readFileSync(new URL('../src/cms/CmsEditor.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(editor, /cms-dock__preview/);
assert.match(editor, /keepLiveFocals/);

const pan = readFileSync(new URL('../src/cms/CmsHeroPan.tsx', import.meta.url), 'utf8');
assert.match(pan, /data-cms-pan/);
assert.match(pan, /objectPosition/);

const context = readFileSync(new URL('../src/cms/CmsContext.tsx', import.meta.url), 'utf8');
assert.match(context, /cms-frame/);
assert.match(context, /is-phone/);
assert.match(context, /postMessage/);
assert.match(context, /setFrameWindow/);

const css = readFileSync(new URL('../src/cms/cms.css', import.meta.url), 'utf8');
assert.match(css, /\.cms-viewport/);
assert.match(css, /\.cms-preview\.is-phone/);
assert.match(css, /\.cms-frame/);
assert.match(css, /width: 390px/);
assert.match(css, /height: 844px/);
assert.doesNotMatch(css, /\.cms-stage\.is-phone-preview/);

console.log('cms viewport switch ok');
