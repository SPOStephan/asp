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
  const match = [...CMS_EDITOR_PAGES]
    .filter((page) => page.publicPath !== '/' && (pathname === page.publicPath || pathname.startsWith(`${page.publicPath}/`)))
    .sort((a, b) => b.publicPath.length - a.publicPath.length)[0];
  if (!match) return `${pathname}${search}${hash}`;
  return `${match.to}${pathname.slice(match.publicPath.length)}${search}${hash}`;
}

function cmsDetailFromPath(pathname) {
  const patterns = [
    { section: 'blog_page', hub: '/cms/blog', re: /^\/cms\/blog\/([^/]+)$/ },
    { section: 'offers_page', hub: '/cms/angebote', re: /^\/cms\/angebote\/([^/]+)$/ },
    { section: 'wellness_page', hub: '/cms/wellness', re: /^\/cms\/wellness\/([^/]+)$/ },
  ];
  for (const pattern of patterns) {
    const match = pathname.match(pattern.re);
    if (match) return { section: pattern.section, entryId: decodeURIComponent(match[1]), hub: pattern.hub };
  }
  return null;
}

function cmsEntryHref(section, item) {
  const id = typeof item.id === 'string' ? item.id : '';
  const slug = typeof item.slug === 'string' && item.slug ? item.slug : id;
  if (!id && !slug) return null;
  if (section === 'blog_page') return `/cms/blog/${slug}`;
  if (section === 'offers_page') return `/cms/angebote/${id || slug}`;
  if (section === 'wellness_page') return `/cms/wellness/${id || slug}`;
  return null;
}

function sectionDraft(sectionKey, data, fallbacks) {
  const fallback = fallbacks[sectionKey] ?? {};
  return { ...fallback, ...(data ?? {}) };
}

assert.equal(toCmsHref('#welcome'), '#welcome');
assert.equal(toCmsHref('mailto:info@example.com'), 'mailto:info@example.com');
assert.equal(toCmsHref('/'), '/cms');
assert.equal(toCmsHref('/wellness'), '/cms/wellness');
assert.equal(toCmsHref('/wellness/auramaris'), '/cms/wellness/auramaris');
assert.equal(toCmsHref('/angebote/feiertage'), '/cms/angebote/feiertage');
assert.equal(toCmsHref('/blog/erholung-an-der-nordsee'), '/cms/blog/erholung-an-der-nordsee');
assert.equal(toCmsHref('/blog?thema=hund'), '/cms/blog?thema=hund');
assert.equal(toCmsHref('/blog/foo?x=1#y'), '/cms/blog/foo?x=1#y');
assert.deepEqual(cmsDetailFromPath('/cms/blog/erholung-an-der-nordsee'), {
  section: 'blog_page',
  entryId: 'erholung-an-der-nordsee',
  hub: '/cms/blog',
});
assert.deepEqual(cmsDetailFromPath('/cms/angebote/feiertage'), {
  section: 'offers_page',
  entryId: 'feiertage',
  hub: '/cms/angebote',
});
assert.deepEqual(cmsDetailFromPath('/cms/wellness/auramaris'), {
  section: 'wellness_page',
  entryId: 'auramaris',
  hub: '/cms/wellness',
});
assert.equal(cmsDetailFromPath('/cms/blog'), null);
assert.equal(cmsEntryHref('blog_page', { id: 'erholung-nordsee', slug: 'erholung-an-der-nordsee' }), '/cms/blog/erholung-an-der-nordsee');
assert.equal(cmsEntryHref('offers_page', { id: 'feiertage' }), '/cms/angebote/feiertage');
assert.equal(cmsEntryHref('wellness_page', { id: 'auramaris' }), '/cms/wellness/auramaris');
assert.equal(toCmsHref('/schriften'), '/schriften');
assert.equal(toCmsHref('/kulinarik#grill'), '/cms/kulinarik#grill');

const draft = sectionDraft('footer', { tagline: 'Neu' }, { footer: { tagline: 'Alt', col_explore_title: 'Entdecken' } });
assert.equal(draft.tagline, 'Neu');
assert.equal(draft.col_explore_title, 'Entdecken');

function shouldPublishPreview(serial, lastSerial) {
  if (lastSerial === null) return false;
  return lastSerial !== serial;
}

assert.equal(shouldPublishPreview('a', null), false);
assert.equal(shouldPublishPreview('a', 'a'), false);
assert.equal(shouldPublishPreview('b', 'a'), true);

console.log('cms page helpers ok');
