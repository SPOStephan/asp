import assert from 'node:assert/strict';
import { SiteModel } from '../src/site/pageModel';
import { canonicalOrigin, llmsTxt, renderPage, robotsTxt, scriptJson, sitemapXml } from '../src/site/renderSite';
import type { HotelContent } from '../src/site/siteData';

const content = {
  hotel: {
    id: 'h1',
    name: 'Strandhotel Test',
    slug: 'test',
    domains: ['test.lohbeckhotels.de', 'www.strandhotel-test.de', 'localhost'],
    phone: '+49 1',
    email: 'info@test.de',
    address: 'Deich 1, 25826 Ort',
    address_detail: null,
    seo_title: 'Strandhotel Test an der Nordsee',
    seo_description: 'Ein Hotel direkt am Deich.',
  },
  sections: {
    hero: { title: 'Willkommen am Meer', subtitle: 'Ruhe und Weite', hero_image: '/hero.webp' },
    welcome: { title_line1: 'Hallo', text_paragraph1: 'Unser Haus liegt direkt am Deich und hat einen eigenen Strandzugang.' },
    discover: { title: 'Entdecken', hidden_tiles: true, tiles: [{ title: 'Geheim', href: '/zimmer' }] },
    rooms_page: { title: 'Unsere Zimmer', hidden_note: true },
    page_hunde: { title: 'Urlaub mit Hund', body: 'Hunde sind willkommen.\n\nMit Napf im Zimmer.' },
  },
  faqs: [{ id: 'f', hotel_id: 'h1', category: 'Anreise', question: 'Wann Check-in?', answer: 'Ab 15 Uhr.', sort_order: 0, show_on_home: true }],
  pages: { zimmer: true, hunde: true, wellness: false },
} as unknown as HotelContent;

assert.equal(canonicalOrigin(content.hotel.domains, 'test.lohbeckhotels.de'), 'https://www.strandhotel-test.de');
assert.equal(canonicalOrigin(['a.lohbeckhotels.de', 'admin.lohbeckhotels.de'], 'x'), 'https://a.lohbeckhotels.de');

const site = new SiteModel(content, 'https://www.strandhotel-test.de');
const home = site.page('/');
assert.equal(home.status, 200);
assert.equal(home.title, 'Strandhotel Test an der Nordsee');
assert.equal(home.h1, 'Willkommen am Meer');
assert.ok(home.blocks.some((block) => block.text?.some((text) => text.includes('Strandzugang'))));
assert.ok(!JSON.stringify(home.blocks).includes('Geheim'), 'hidden parts stay out of the page');
assert.ok(home.jsonLd.some((data) => data['@type'] === 'Hotel' && data.name === 'Strandhotel Test'));
assert.ok(home.jsonLd.some((data) => data['@type'] === 'FAQPage'));
assert.ok(!JSON.stringify(home.jsonLd).includes('aggregateRating'));

assert.equal(site.page('/wellness').status, 404, 'disabled pages answer 404');
assert.equal(site.page('/gibt-es-nicht').status, 404);
assert.equal(site.page('/zimmer/unbekannt').status, 404);
const rooms = site.page('/zimmer');
assert.equal(rooms.status, 200);
assert.equal(rooms.h1, 'Unsere Zimmer');
assert.ok(rooms.breadcrumbs.length === 2);
const firstRoom = rooms.blocks.flatMap((block) => block.items ?? []).find((item) => item.href?.startsWith('/zimmer/'));
assert.ok(firstRoom);
assert.ok(site.page(firstRoom.href!).jsonLd.some((data) => data['@type'] === 'HotelRoom'));
assert.equal(site.page('/seite/hunde').h1, 'Urlaub mit Hund');

const template = '<!doctype html><html><head><title>Hotel</title></head><body><div id="root"></div><script type="module" src="/a.js"></script></body></html>';
const html = renderPage(template, home, site, content);
assert.match(html, /<title>Strandhotel Test an der Nordsee<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.strandhotel-test\.de\/">/);
assert.match(html, /<h1>Willkommen am Meer<\/h1>/);
assert.match(html, /window\.__SITE_CONTENT__=/);
assert.equal((html.match(/<title>/g) ?? []).length, 1);
assert.equal(scriptJson({ a: '</script><b>' }), '{"a":"\\u003c/script>\\u003cb>"}');

assert.match(robotsTxt(site), /Sitemap: https:\/\/www\.strandhotel-test\.de\/sitemap\.xml/);
const sitemap = sitemapXml(site);
assert.match(sitemap, /<loc>https:\/\/www\.strandhotel-test\.de\/zimmer<\/loc>/);
assert.doesNotMatch(sitemap, /wellness/);
assert.match(llmsTxt(site), /^# Strandhotel Test/);

console.log('site rendering ok');
