import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CmsContext } from '../src/cms/CmsContext';
import { CmsEditor } from '../src/cms/CmsEditor';

const cmsValue = {
  active: true as const,
  selected: { section: 'welcome', focus: 'title' },
  select: () => undefined,
  dirty: { welcome: true },
  draftTick: 0,
  inline: null,
  imageRequest: null,
  saving: false,
  saveError: null,
  canSave: true,
  preview: () => undefined,
  previewFaqs: () => undefined,
  applyField: () => undefined,
  focalPreview: 'desktop' as const,
  setFocalPreview: () => undefined,
  setFrameWindow: () => undefined,
  canUndo: false,
  undo: () => undefined,
  saveSection: async () => true,
  saveFaqs: async () => true,
  setSaveAction: () => undefined,
  runSave: async () => undefined,
  commitInline: () => undefined,
  cancelInline: () => undefined,
  openImage: () => undefined,
  closeImage: () => undefined,
};

const html = renderToStaticMarkup(
  createElement(
    MemoryRouter,
    { initialEntries: ['/cms'] },
    createElement(CmsContext.Provider, { value: cmsValue }, createElement(CmsEditor)),
  ),
);

assert.match(html, /cms-dock__save/);
assert.match(html, />Speichern</);
assert.match(html, /Vorschau — noch nicht gespeichert/);
assert.ok(html.indexOf('cms-dock__save') > html.indexOf('cms-dock__body'));

console.log('cms editor chrome ok');
