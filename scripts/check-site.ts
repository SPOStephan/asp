import assert from 'node:assert/strict';
import { SiteModel } from '../src/site/pageModel';
import { canonicalOrigin, llmsTxt, renderPage, robotsTxt, scriptJson, sitemapXml } from '../src/site/renderSite';
import type { HotelContent } from '../src/site/siteData';

const content = {
  hotel: {
    id: 'h1',
    name: 'Strandhotel Test',
    slug: 'test',
    domains: ['test.hotels.example.com', 'www.strandhotel-test.de', 'localhost'],
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
    rooms_page: { title: 'Unsere Zimmer', hidden_note: true, items: [{ id: 'deichblick', name: 'Doppelzimmer Deichblick', text: 'Mit Blick auf den Deich.' }] },
    page_hunde: { title: 'Urlaub mit Hund', body: 'Hunde sind willkommen.\n\nMit Napf im Zimmer.' },
  },
  faqs: [{ id: 'f', hotel_id: 'h1', category: 'Anreise', question: 'Wann Check-in?', answer: 'Ab 15 Uhr.', sort_order: 0, show_on_home: true }],
  pages: { zimmer: true, hunde: true, wellness: false },
} as unknown as HotelContent;

assert.equal(canonicalOrigin(content.hotel.domains, 'test.hotels.example.com', 'hotels.example.com'), 'https://www.strandhotel-test.de');
assert.equal(canonicalOrigin(['a.hotels.example.com', 'admin.hotels.example.com'], 'x', 'hotels.example.com'), 'https://a.hotels.example.com');
assert.equal(canonicalOrigin(['a.hotels.example.com', 'b.de'], 'x', ''), 'https://a.hotels.example.com', 'without a platform domain the first domain wins');

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

// "Über uns" and "Anreise": only when switched on; history, ways and their questions as text.
assert.equal(site.page('/ueber-uns').status, 404, 'about page is off until switched on');
assert.equal(site.page('/anreise').status, 404, 'arrival page is off until switched on');
const withPages = new SiteModel(
  {
    ...content,
    faqs: [...content.faqs, { id: 'p', hotel_id: 'h1', category: 'Anreise & Parken', question: 'Wo parken?', answer: 'In der Garage.', sort_order: 1, show_on_home: false }],
    pages: { ...content.pages, 'ueber-uns': true, anreise: true, anlaesse: true, tagen: true },
    sections: {
      ...content.sections,
      about_page: {
        title: 'Unser Haus',
        intro: 'Seit 1900 am [Deich](/zimmer).',
        story: [{ year: '1900', title: 'Eröffnung', text: 'Das Haus öffnet.' }],
        hosts: [{ name: 'Erika Muster', role: 'Direktorin' }],
        faq_ids: ['f'],
      },
      arrival_page: { ways: [{ title: 'Mit der Bahn', text: 'Bis Ort Bahnhof.' }] },
      day_story: { title: 'Ein Tag', items: [{ time: '7.00', unit: 'Uhr', title: 'Frühstück', text: 'Am Fenster.' }], placements: [{ page: '/ueber-uns', after: 'zahlen' }] },
      occasions_page: { title: 'Urlaub am Deich', items: [{ id: 'strand', name: 'Strand & Natur', summary: 'Wattwandern.' }] },
      events_page: {
        mode: 'tagen',
        items: [
          { id: 'raeume', kind: 'tagen', name: 'Tagungsräume' },
          { id: 'hochzeit', kind: 'feiern', name: 'Hochzeiten' },
        ],
      },
    },
  } as unknown as HotelContent,
  'https://www.strandhotel-test.de',
);
const about = withPages.page('/ueber-uns');
assert.equal(about.status, 200);
assert.equal(about.h1, 'Unser Haus');
const aboutText = JSON.stringify(about.blocks);
for (const part of ['Seit 1900 am Deich.', 'Eröffnung', 'Erika Muster, Direktorin', 'Wann Check-in?', 'Frühstück']) assert.ok(aboutText.includes(part), `about page lacks ${part}`);
assert.ok(about.jsonLd.some((data) => data['@type'] === 'FAQPage'));
const arrival = withPages.page('/anreise');
assert.equal(arrival.status, 200);
const arrivalText = JSON.stringify(arrival.blocks);
for (const part of ['Deich 1, 25826 Ort', 'Mit der Bahn', 'Wo parken?']) assert.ok(arrivalText.includes(part), `arrival page lacks ${part}`);
// The region (formerly "Anlässe") at /region.
assert.equal(withPages.page('/region').h1, 'Urlaub am Deich');
assert.equal(withPages.page('/region/strand').status, 200);
assert.equal(withPages.page('/anlaesse/strand').status, 404, 'old address is a redirect (vercel.json), not a page');
// Meetings only: /tagen with the meeting topics; /feiern and the celebration topic do not exist.
assert.equal(withPages.page('/tagen').h1, 'Tagen');
assert.equal(withPages.page('/tagen/raeume').status, 200);
assert.equal(withPages.page('/tagen/hochzeit').status, 404);
assert.equal(withPages.page('/feiern').status, 404);
assert.equal(withPages.page('/tagen-und-feiern').status, 404);
const paths = withPages.allPaths().map((link) => link.href);
for (const path of ['/ueber-uns', '/anreise', '/region', '/region/strand', '/tagen', '/tagen/raeume']) assert.ok(paths.includes(path), `sitemap lacks ${path}`);
assert.ok(!paths.includes('/tagen/hochzeit'));

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
