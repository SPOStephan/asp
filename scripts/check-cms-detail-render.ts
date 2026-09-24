import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { cmsDetailFromPath, cmsEntryHref, toCmsHref } from '../src/cms/cmsPages';
import { BlogPostPage } from '../src/pages/BlogPostPage';
import { OfferDetailPage } from '../src/pages/OfferDetailPage';
import { WellnessTopicPage } from '../src/pages/WellnessTopicPage';

function renderPage(path: string, route: string, Page: () => ReturnType<typeof BlogPostPage>) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: route, element: createElement(Page) })),
    ),
  );
}

const blog = renderPage('/blog/erholung-an-der-nordsee', '/blog/:postSlug', BlogPostPage);
assert.match(blog, /data-cms-path="items\.erholung-nordsee\.title"/);
assert.match(blog, /data-cms-path="items\.erholung-nordsee\.excerpt"/);
assert.match(blog, /data-cms-path="items\.erholung-nordsee\.hero_image"/);
assert.match(blog, /data-cms-path="items\.erholung-nordsee\.blocks\.0\.text"/);
assert.match(blog, /Erholung an der Nordsee/);

const offer = renderPage('/angebote/feiertage', '/angebote/:offerId', OfferDetailPage);
assert.match(offer, /data-cms-path="items\.feiertage\.title"/);
assert.match(offer, /data-cms-path="items\.feiertage\.hero_image"/);
assert.match(offer, /data-cms-path="items\.feiertage\.detail_text\.0"/);
assert.match(offer, /data-cms-path="items\.feiertage\.includes\.0"/);
assert.match(offer, /Weihnachten mit Meerblick/);

const topic = renderPage('/wellness/auramaris', '/wellness/:topicId', WellnessTopicPage);
assert.match(topic, /data-cms-path="items\.auramaris\.name"/);
assert.match(topic, /data-cms-path="items\.auramaris\.summary"/);
assert.match(topic, /data-cms-path="items\.auramaris\.text\.0"/);
assert.match(topic, /data-cms-path="items\.auramaris\.pair_image"/);
assert.match(topic, /Auramaris Spa/);

assert.equal(toCmsHref('/blog/erholung-an-der-nordsee'), '/cms/blog/erholung-an-der-nordsee');
assert.equal(toCmsHref('/angebote/feiertage'), '/cms/angebote/feiertage');
assert.equal(toCmsHref('/wellness/auramaris'), '/cms/wellness/auramaris');
assert.equal(cmsDetailFromPath('/cms/wellness/preisliste')?.section, 'wellness_page');
assert.equal(cmsEntryHref('blog_page', { id: 'erholung-nordsee', slug: 'erholung-an-der-nordsee' }), '/cms/blog/erholung-an-der-nordsee');

console.log('cms detail render ok');
