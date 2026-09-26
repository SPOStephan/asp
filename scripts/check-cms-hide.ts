import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  isHiddenMetaPath,
  isLayoutHideable,
  isSectionHidden,
  removedRecordIds,
} from '../src/cms/cmsHidden';

assert.equal(isSectionHidden(undefined), false);
assert.equal(isSectionHidden({ title: 'Welcome' }), false);
assert.equal(isSectionHidden({ hidden: true }), true);
assert.equal(isSectionHidden({ hidden: false }), false);
assert.equal(isSectionHidden({ hidden_on_home: true }, 'hidden_on_home'), true);
assert.equal(isSectionHidden({ hidden: true }, 'hidden_on_home'), false);

assert.equal(isLayoutHideable('welcome'), true);
assert.equal(isLayoutHideable('discover'), true);
assert.equal(isLayoutHideable('faq_home_section'), true);
assert.equal(isLayoutHideable('footer'), false);
assert.equal(isLayoutHideable('blog_page'), false);
assert.equal(isLayoutHideable('rooms_page'), false);

assert.equal(isHiddenMetaPath('hidden'), true);
assert.equal(isHiddenMetaPath('items.0.hidden'), true);
assert.equal(isHiddenMetaPath('hidden_on_home'), true);
assert.equal(isHiddenMetaPath('title'), false);
assert.equal(isHiddenMetaPath('hero_focal'), false);

assert.deepEqual(removedRecordIds(['a', 'b', 'c'], ['a', 'c']), ['b']);
assert.deepEqual(removedRecordIds(['a'], []), ['a']);
assert.deepEqual(removedRecordIds(['a'], ['a']), []);

const section = readFileSync(new URL('../src/cms/CmsSection.tsx', import.meta.url), 'utf8');
assert.match(section, /cms-block__eye/);
assert.match(section, /applyField\(sectionKey, hiddenKey, !hidden\)/);
assert.match(section, /hidden && !cms/);
assert.match(section, /EyeOff/);

const editor = readFileSync(new URL('../src/cms/CmsEditor.tsx', import.meta.url), 'utf8');
assert.match(editor, /function ItemDeleteButton/);
assert.match(editor, /cms-item-delete/);
assert.match(editor, /isHiddenMetaPath\(path\)/);
assert.match(editor, /tiles: draft\.tiles\.filter/);
assert.match(editor, /setFaqs\(faqs\.filter/);

const homeBlog = readFileSync(new URL('../src/components/HomeBlog.tsx', import.meta.url), 'utf8');
assert.match(homeBlog, /hiddenKey="hidden_on_home"/);

const context = readFileSync(new URL('../src/cms/CmsContext.tsx', import.meta.url), 'utf8');
assert.match(context, /removedRecordIds/);
assert.match(context, /\.delete\(\)\.eq\('hotel_id', hotel\.id\)\.in\('id', removed\)/);
assert.match(context, /data-cms-ui/);

console.log('cms hide delete ok');
