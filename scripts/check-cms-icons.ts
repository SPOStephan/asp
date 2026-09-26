import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fieldKind } from '../src/cms/cmsDraft';
import { isHiddenMetaPath, sectionDisplayName } from '../src/cms/cmsHidden';
import {
  generateLucideMark,
  matchIconFromDescription,
  sanitizeSvg,
  slugifyIconName,
} from '../src/lib/cmsIconLibrary';

assert.equal(sectionDisplayName({ cms_label: 'Anreise-Fakten' }, 'Fakten'), 'Anreise-Fakten');
assert.equal(sectionDisplayName({ cms_label: '  ' }, 'Fakten'), 'Fakten');
assert.equal(sectionDisplayName(null, 'Welcome'), 'Welcome');
assert.equal(isHiddenMetaPath('cms_label'), true);

assert.equal(fieldKind('icon'), 'icon');
assert.equal(fieldKind('icon_color'), 'color');
assert.equal(fieldKind('items.0.icon_color'), 'color');

assert.equal(matchIconFromDescription('Hundewiese für Hunde'), 'Dog');
assert.equal(matchIconFromDescription('kostenloses WLAN im ganzen Haus'), 'Wifi');
assert.equal(slugifyIconName('hunde wiese'), 'Hunde-wiese');

const dirty = '<div><script>alert(1)</script><svg viewBox="0 0 24 24" onclick="x()"><path stroke="#000" d="M1 1" /></svg></div>';
const clean = sanitizeSvg(dirty);
assert.match(clean, /^<svg/);
assert.doesNotMatch(clean, /script/i);
assert.doesNotMatch(clean, /onclick/i);
assert.match(clean, /currentColor/);

const generated = generateLucideMark('Hundewiese', 'Hund mit Leine');
assert.match(generated, /viewBox="0 0 24 24"/);
assert.match(generated, /stroke="currentColor"/);

const section = readFileSync(new URL('../src/cms/CmsSection.tsx', import.meta.url), 'utf8');
assert.match(section, /Pencil/);
assert.match(section, /cms_label/);

const picker = readFileSync(new URL('../src/cms/CmsIconPicker.tsx', import.meta.url), 'utf8');
assert.match(picker, /Neues Icon anlegen/);
assert.match(picker, /onColorChange/);

const admin = readFileSync(new URL('../src/admin/pages/AdminIconsPage.tsx', import.meta.url), 'utf8');
assert.match(admin, /Icon-Bibliothek/);
assert.match(admin, /Lucide/);

console.log('cms icons ok');
