import assert from 'node:assert/strict';

function splitHref(href) {
  const url = href.startsWith('http') ? new URL(href) : new URL(href, 'https://local.test');
  return { pathname: url.pathname || '/', search: url.search, hash: url.hash };
}

const CMS_EDITOR_PAGES = [
  { to: '/cms', publicPath: '/' },
  { to: '/cms/zimmer', publicPath: '/zimmer' },
  { to: '/cms/wellness', publicPath: '/wellness' },
  { to: '/cms/kulinarik', publicPath: '/kulinarik' },
  { to: '/cms/angebote', publicPath: '/angebote' },
  { to: '/cms/blog', publicPath: '/blog' },
  { to: '/cms/impressionen', publicPath: '/impressionen' },
  { to: '/cms/faqs', publicPath: '/faqs' },
];

function toCmsHref(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href;
  const { pathname, search, hash } = splitHref(href);
  if (pathname === '/' || pathname === '') return `/cms${search}${hash}`;
  const match = CMS_EDITOR_PAGES.find(
    (page) => page.publicPath !== '/' && (pathname === page.publicPath || pathname.startsWith(`${page.publicPath}/`)),
  );
  return `${match?.to ?? pathname}${search}${hash}`;
}

function sectionDraft(sectionKey, data, fallbacks) {
  const fallback = fallbacks[sectionKey] ?? {};
  return { ...fallback, ...(data ?? {}) };
}

assert.equal(toCmsHref('#welcome'), '#welcome');
assert.equal(toCmsHref('mailto:info@example.com'), 'mailto:info@example.com');
assert.equal(toCmsHref('/'), '/cms');
assert.equal(toCmsHref('/wellness'), '/cms/wellness');
assert.equal(toCmsHref('/wellness/auramaris'), '/cms/wellness');
assert.equal(toCmsHref('/angebote/feiertage'), '/cms/angebote');
assert.equal(toCmsHref('/blog/erholung-an-der-nordsee'), '/cms/blog');
assert.equal(toCmsHref('/schriften'), '/schriften');
assert.equal(toCmsHref('/kulinarik#grill'), '/cms/kulinarik#grill');

const draft = sectionDraft('footer', { tagline: 'Neu' }, { footer: { tagline: 'Alt', col_explore_title: 'Entdecken' } });
assert.equal(draft.tagline, 'Neu');
assert.equal(draft.col_explore_title, 'Entdecken');

console.log('cms page helpers ok');
