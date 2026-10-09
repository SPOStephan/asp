import { BLOG_PAGE_FALLBACK, blogHref, latestBlogPosts, resolveBlogPosts } from '../lib/blog';
import { CULINARY_PAGE_FALLBACK, resolveCulinaryRhythm, resolveCulinaryVenues } from '../lib/culinary';
import { IMPRESSIONS_PAGE_FALLBACK, resolveImpressions } from '../lib/impressions';
import { remapSiteHref } from '../lib/links';
import { resolveDiscoverTiles } from '../lib/media';
import { occasionHref, OCCASIONS_PAGE_FALLBACK, resolveOccasions } from '../lib/occasions';
import { OFFERS_PAGE_FALLBACK, offerHref, resolveOfferStories } from '../lib/offers';
import { genericSectionKey, pageKeyFromHref, SYSTEM_TEMPLATES } from '../lib/pageTemplates';
import { formatRoomPriceDetail, resolveRooms, ROOMS_PAGE_FALLBACK, roomHref } from '../lib/rooms';
import {
  resolveWellnessChapters,
  resolveWellnessTopics,
  WELLNESS_PAGE_FALLBACK,
  wellnessTopicHref,
} from '../lib/wellness';
import { stripReadMore } from '../lib/readMore';
import type { HotelContent } from './siteData';

export type SiteLink = { label: string; href: string };

export type ContentItem = { title: string; text?: string; facts?: string[]; href?: string };

export type ContentBlock = {
  heading?: string;
  text?: string[];
  items?: ContentItem[];
  links?: SiteLink[];
};

// What a crawler or an AI agent gets for one address of a hotel site.
export type PageModel = {
  status: 200 | 404;
  path: string;
  title: string;
  description: string;
  h1: string;
  eyebrow?: string;
  lead?: string;
  image?: string;
  // Optional own picture for phones (home hero).
  imageMobile?: string;
  blocks: ContentBlock[];
  breadcrumbs: SiteLink[];
  jsonLd: Record<string, unknown>[];
};

type Section = Record<string, any>;

function str(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : typeof value === 'number' ? String(value) : '';
}

function words(...values: unknown[]) {
  return values.map(str).filter(Boolean).join(' ');
}

function texts(...values: unknown[]): string[] {
  return values.flatMap((value) => (Array.isArray(value) ? value.map(str) : [str(value)])).filter(Boolean);
}

export function clip(text: string, max = 158) {
  const clean = str(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

function hidden(section: Section | undefined, part?: string) {
  if (!section) return false;
  return section[part ? `hidden_${part}` : 'hidden'] === true;
}

function pick<T>(page: Section | undefined, key: string, fallback: T): T | string {
  const value = page?.[key];
  return value === undefined || value === null ? fallback : value;
}

export function pageTitle(key: string) {
  return SYSTEM_TEMPLATES.find((template) => template.template_key === key)?.title ?? key;
}

export class SiteModel {
  readonly content: HotelContent;
  readonly origin: string;
  // Where images are served from: the address the page is opened on. The canonical
  // address can be a domain that does not serve this site yet (e.g. the old website).
  readonly assetOrigin: string;

  constructor(content: HotelContent, origin: string, assetOrigin = origin) {
    this.content = content;
    this.origin = origin;
    this.assetOrigin = assetOrigin;
  }

  get hotel() {
    return this.content.hotel;
  }

  section(key: string): Section | undefined {
    return this.content.sections[key];
  }

  isAvailable(key: string | null) {
    if (!key || key === 'home') return true;
    if (this.content.pages[key] === true) return true;
    return SYSTEM_TEMPLATES.some((template) => template.template_key === key && template.required);
  }

  // Internal links only count when the page they lead to exists for this hotel.
  linkable(href: string, label?: string) {
    const resolved = remapSiteHref(href, label);
    if (!resolved || resolved.startsWith('#')) return '';
    if (/^(https?:)?\/\//i.test(resolved)) return resolved;
    return this.isAvailable(pageKeyFromHref(resolved)) ? resolved : '';
  }

  url(path: string) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.origin}${path === '/' ? '/' : path}`;
  }

  media(value: string) {
    const src = str(value);
    if (!src) return '';
    return /^https?:\/\//i.test(src) ? src : `${this.assetOrigin}${src.startsWith('/') ? src : `/${src}`}`;
  }

  activePages(): SiteLink[] {
    const links: SiteLink[] = [{ label: 'Startseite', href: '/' }];
    for (const template of SYSTEM_TEMPLATES) {
      if (template.template_key === 'home' || !this.isAvailable(template.template_key)) continue;
      links.push({ label: template.title, href: template.path_prefix });
    }
    for (const [key, on] of Object.entries(this.content.pages)) {
      if (!on || SYSTEM_TEMPLATES.some((template) => template.template_key === key)) continue;
      links.push({ label: str(this.section(genericSectionKey(key))?.title) || key, href: `/seite/${key}` });
    }
    return links;
  }

  // Every address that should be indexed, for the sitemap and llms.txt.
  allPaths(): SiteLink[] {
    const links = this.activePages();
    const sections = this.content.sections;
    if (this.isAvailable('zimmer')) {
      for (const room of resolveRooms(sections.rooms_page?.items)) links.push({ label: room.name, href: roomHref(room.id) });
    }
    if (this.isAvailable('wellness')) {
      for (const topic of resolveWellnessTopics(sections.wellness_page?.items)) {
        links.push({ label: topic.name, href: wellnessTopicHref(topic.id) });
      }
    }
    if (this.isAvailable('anlaesse')) {
      for (const occasion of resolveOccasions(sections.occasions_page?.items)) {
        links.push({ label: occasion.name, href: occasionHref(occasion.id) });
      }
    }
    if (this.isAvailable('angebote')) {
      for (const offer of resolveOfferStories(sections.offers_page?.items, sections.offers?.items)) {
        links.push({ label: offer.title, href: offerHref(offer.id) });
      }
    }
    if (this.isAvailable('blog')) {
      for (const post of resolveBlogPosts(sections.blog_page?.items)) links.push({ label: post.title, href: blogHref(post.slug) });
    }
    return links;
  }

  contact(): ContentBlock {
    const hotel = this.hotel;
    return {
      heading: 'Kontakt',
      text: texts(hotel.name, hotel.address, hotel.address_detail, hotel.phone ? `Telefon ${hotel.phone}` : '', hotel.email ? `E-Mail ${hotel.email}` : ''),
    };
  }

  hotelJsonLd(): Record<string, unknown> {
    const hotel = this.hotel;
    const hero = this.section('hero');
    const navbar = this.section('navbar');
    return compact({
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      '@id': `${this.origin}/#hotel`,
      name: hotel.name,
      url: this.url('/'),
      description: str(hotel.seo_description) || str(hero?.subtitle) || undefined,
      telephone: str(hotel.phone) || undefined,
      email: str(hotel.email) || undefined,
      address: str(hotel.address) ? words(hotel.address, hotel.address_detail) : undefined,
      image: hero?.hero_image ? this.media(hero.hero_image) : undefined,
      logo: navbar?.logo_normal ? this.media(navbar.logo_normal) : undefined,
      amenityFeature: texts(...(this.section('highlight_strip')?.items ?? []).map((item: Section) => item?.title)).map((name) => ({
        '@type': 'LocationFeatureSpecification',
        name,
        value: true,
      })),
    });
  }

  page(path: string): PageModel {
    const clean = normalizePath(path);
    const parts = clean.split('/').filter(Boolean);
    const [first, second] = parts;
    if (!first) return this.home();
    if (parts.length > 2) return this.notFound(clean);

    switch (first) {
      case 'zimmer':
        return this.isAvailable('zimmer') ? (second ? this.room(second) : this.rooms()) : this.notFound(clean);
      case 'wellness':
        return this.isAvailable('wellness') ? (second ? this.wellnessTopic(second) : this.wellness()) : this.notFound(clean);
      case 'kulinarik':
        return this.isAvailable('kulinarik') && !second ? this.culinary() : this.notFound(clean);
      case 'anlaesse':
        return this.isAvailable('anlaesse') ? (second ? this.occasion(second) : this.occasions()) : this.notFound(clean);
      case 'angebote':
        return this.isAvailable('angebote') ? (second ? this.offer(second) : this.offers()) : this.notFound(clean);
      case 'blog':
        return this.isAvailable('blog') ? (second ? this.post(second) : this.blog()) : this.notFound(clean);
      case 'impressionen':
        return this.isAvailable('impressionen') && !second ? this.impressions() : this.notFound(clean);
      case 'faqs':
        return this.isAvailable('faqs') && !second ? this.faqPage() : this.notFound(clean);
      case 'impressum':
      case 'datenschutz':
      case 'agb':
        return this.isAvailable(first) && !second ? this.legal(first) : this.notFound(clean);
      case 'seite':
        return second && this.content.pages[second] === true ? this.generic(second) : this.notFound(clean);
      default:
        return this.notFound(clean);
    }
  }

  private build(
    path: string,
    input: Omit<PageModel, 'status' | 'path' | 'title' | 'description' | 'jsonLd' | 'breadcrumbs'> & {
      title?: string;
      description?: string;
      crumbs?: SiteLink[];
      jsonLd?: Record<string, unknown>[];
    },
  ): PageModel {
    const hotel = this.hotel;
    const home = path === '/';
    const title = home ? str(hotel.seo_title) || hotel.name : `${input.title || input.h1} | ${hotel.name}`;
    // A real sentence describes a page better than a short tagline like "Meer · Ruhe · Weite".
    const candidates = [input.lead ?? '', ...input.blocks.flatMap((block) => [...(block.text ?? []), ...(block.items ?? []).map((item) => item.text ?? '')])];
    const firstText = candidates.find((text) => str(text).length >= 60) || input.lead || candidates.find(Boolean) || '';
    const description = clip(input.description || (home ? str(hotel.seo_description) : '') || firstText || hotel.name);
    const breadcrumbs = home ? [] : [{ label: 'Startseite', href: '/' }, ...(input.crumbs ?? []), { label: input.h1, href: path }];
    const jsonLd: Record<string, unknown>[] = [
      this.hotelJsonLd(),
      compact({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${this.url(path)}#webpage`,
        url: this.url(path),
        name: title,
        description,
        inLanguage: 'de-DE',
        isPartOf: { '@type': 'WebSite', '@id': `${this.origin}/#website`, url: this.url('/'), name: hotel.name },
        about: { '@id': `${this.origin}/#hotel` },
        primaryImageOfPage: input.image ? this.media(input.image) : undefined,
      }),
      ...(breadcrumbs.length
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.label,
                item: this.url(crumb.href),
              })),
            },
          ]
        : []),
      ...(input.jsonLd ?? []),
    ];
    return {
      status: 200,
      path,
      title,
      description,
      h1: input.h1,
      eyebrow: input.eyebrow,
      lead: input.lead,
      image: input.image ? this.media(input.image) : undefined,
      imageMobile: input.imageMobile ? this.media(input.imageMobile) : undefined,
      blocks: [...input.blocks, this.contact()].filter((block) => block.heading || block.text?.length || block.items?.length),
      breadcrumbs,
      jsonLd,
    };
  }

  notFound(path: string): PageModel {
    return {
      status: 404,
      path,
      title: `Seite nicht gefunden | ${this.hotel.name}`,
      description: `Diese Seite gibt es bei ${this.hotel.name} nicht.`,
      h1: 'Seite nicht gefunden',
      blocks: [{ heading: 'Weiter zu', links: this.activePages() }],
      breadcrumbs: [],
      jsonLd: [],
    };
  }

  private home(): PageModel {
    const s = (key: string) => this.section(key);
    const visible = (key: string) => s(key) && !hidden(s(key));
    const blocks: ContentBlock[] = [];
    const hero = s('hero');

    const welcome = s('welcome');
    if (visible('welcome')) {
      blocks.push({
        heading: words(welcome!.title_line1, welcome!.title_word_normal, welcome!.title_word_script),
        text: texts(welcome!.subtitle, stripReadMore(str(welcome!.text_paragraph1)), stripReadMore(str(welcome!.text_paragraph2))),
      });
    }
    const strip = s('highlight_strip');
    if (visible('highlight_strip')) {
      blocks.push({ heading: 'Das Haus auf einen Blick', items: itemsOf(strip!.items, 'title', 'text') });
    }
    const discover = s('discover');
    if (visible('discover') && !hidden(discover, 'tiles')) {
      blocks.push({
        heading: str(discover!.title),
        text: texts(discover!.subtitle),
        items: resolveDiscoverTiles(discover!.tiles).map((tile) => ({
          title: tile.title,
          text: tile.eyebrow,
          href: this.linkable(tile.href, tile.title) || undefined,
        })),
      });
    }
    const booking = s('direct_booking');
    if (visible('direct_booking')) {
      blocks.push({ heading: str(booking!.title), text: texts(booking!.subtitle), items: itemsOf(booking!.items, 'title', 'text') });
    }
    const offers = s('offers');
    if (visible('offers')) {
      blocks.push({
        heading: words(offers!.title_line1, offers!.title_line2, offers!.title_script),
        items: resolveOfferStories(s('offers_page')?.items, offers!.items).map((offer) => ({
          title: offer.title,
          text: words(offer.subtitle, offer.text),
          facts: texts(offer.details),
          href: this.isAvailable('angebote') ? offerHref(offer.id) : undefined,
        })),
      });
    }
    const wellness = s('wellness');
    if (visible('wellness')) {
      blocks.push({
        heading: str(wellness!.title),
        text: texts(wellness!.copy_title, wellness!.copy_text),
        links: this.linkList([{ label: str(wellness!.copy_cta) || 'Wellness', href: str(wellness!.copy_cta_href) || '/wellness' }]),
      });
    }
    const highlights = s('highlights');
    if (visible('highlights')) {
      blocks.push({ heading: words(highlights!.title_line1, highlights!.title_line2_em), items: itemsOf(highlights!.items, 'title', 'text') });
    }
    const culinary = s('culinary');
    if (visible('culinary')) {
      blocks.push({
        heading: words(culinary!.title_line1, culinary!.title_line2_em),
        text: texts(culinary!.text, culinary!.extra_text),
        items: (Array.isArray(culinary!.restaurants) ? culinary!.restaurants : []).map((item: Section) => ({
          title: str(item?.name),
          text: words(item?.eyebrow, item?.text),
        })).filter((item: ContentItem) => item.title),
      });
    }
    const generations = s('generations');
    if (visible('generations')) {
      blocks.push({
        heading: words(generations!.title_line1, generations!.title_line2_em),
        text: texts(generations!.subtitle),
        items: (Array.isArray(generations!.images) ? generations!.images : [])
          .map((item: Section) => ({
            title: str(item?.label),
            text: str(item?.caption),
            href: str(item?.href) ? this.linkable(str(item.href), str(item?.caption)) || undefined : undefined,
          }))
          .filter((item: ContentItem) => item.title || item.text),
      });
    }
    const awards = s('awards');
    if (visible('awards')) {
      blocks.push({ heading: str(awards!.title), items: itemsOf(awards!.items, 'label') });
    }
    const impressions = s('impressions');
    if (visible('impressions')) {
      blocks.push({ heading: words(impressions!.script, impressions!.title), items: itemsOf(impressions!.images, 'alt') });
    }
    const facts = s('facts');
    if (visible('facts')) {
      blocks.push({
        heading: str(facts!.title),
        items: (Array.isArray(facts!.items) ? facts!.items : [])
          .map((item: Section) => ({ title: str(item?.label), text: str(item?.value) }))
          .filter((item: ContentItem) => item.title),
        text: texts(facts!.location_label ? `${str(facts!.location_label)}: ${str(facts!.location_text)}` : ''),
      });
    }
    const homeFaqs = this.content.faqs.filter((faq) => faq.show_on_home);
    const faqSection = s('faq_home_section');
    if (homeFaqs.length && !hidden(faqSection)) {
      blocks.push({
        heading: str(faqSection?.title) || 'Häufige Fragen',
        items: homeFaqs.map((faq) => ({ title: faq.question, text: faq.answer })),
      });
    }
    const blog = s('blog_page');
    if (this.isAvailable('blog') && !hidden(blog, 'on_home')) {
      blocks.push({
        heading: str(blog?.home_title) || BLOG_PAGE_FALLBACK.home_title,
        items: latestBlogPosts(resolveBlogPosts(blog?.items), 3).map((post) => ({ title: post.title, text: post.excerpt, href: blogHref(post.slug) })),
      });
    }
    blocks.push({ heading: 'Seiten', links: this.activePages().slice(1) });

    return this.build('/', {
      h1: str(hero?.title) || this.hotel.name,
      lead: str(hero?.subtitle),
      image: hero?.hero_image,
      imageMobile: str(hero?.hero_image_mobile) || undefined,
      blocks,
      jsonLd: homeFaqs.length ? [faqJsonLd(homeFaqs)] : [],
    });
  }

  private linkList(links: SiteLink[]): SiteLink[] {
    return links.map((link) => ({ ...link, href: this.linkable(link.href, link.label) })).filter((link) => link.href);
  }

  private head(page: Section | undefined, fallback: Section) {
    return {
      eyebrow: str(pick(page, 'eyebrow', fallback.eyebrow)),
      h1: str(pick(page, 'title', fallback.title)),
      lead: str(pick(page, 'subtitle', fallback.subtitle)),
      image: str(pick(page, 'hero_image', fallback.hero_image)),
    };
  }

  private note(page: Section | undefined, fallback: Section): ContentBlock | null {
    if (hidden(page, 'note')) return null;
    return { heading: str(pick(page, 'note_title', fallback.note_title)), text: texts(pick(page, 'note_text', fallback.note_text)) };
  }

  private rooms(): PageModel {
    const page = this.section('rooms_page');
    const rooms = resolveRooms(page?.items);
    const blocks: ContentBlock[] = [];
    if (!hidden(page, 'intro')) blocks.push({ text: texts(page?.intro ?? ROOMS_PAGE_FALLBACK.intro) });
    if (!hidden(page, 'list')) {
      blocks.push({
        heading: 'Zimmer und Suiten',
        items: rooms.map((room) => ({ title: room.name, text: words(room.kicker, room.text), facts: roomFacts(room), href: roomHref(room.id) })),
      });
    }
    if (!hidden(page, 'price_note')) blocks.push({ text: texts(page?.price_note ?? ROOMS_PAGE_FALLBACK.price_note) });
    const note = this.note(page, ROOMS_PAGE_FALLBACK);
    if (note) blocks.push(note);
    return this.build('/zimmer', {
      ...this.head(page, ROOMS_PAGE_FALLBACK),
      blocks,
      jsonLd: [itemListJsonLd(rooms.map((room) => ({ name: room.name, url: this.url(roomHref(room.id)) })))],
    });
  }

  private room(id: string): PageModel {
    const room = resolveRooms(this.section('rooms_page')?.items).find((item) => item.id === id);
    if (!room) return this.notFound(roomHref(id));
    const path = roomHref(room.id);
    return this.build(path, {
      eyebrow: room.kicker,
      h1: room.name,
      lead: room.text,
      image: room.hero_image || room.image,
      crumbs: [{ label: pageTitle('zimmer'), href: '/zimmer' }],
      blocks: [
        { text: texts(room.detail_text) },
        { heading: 'Auf einen Blick', items: roomFacts(room).map((fact) => ({ title: fact })) },
        { heading: 'Ausstattung', items: room.amenities.map((amenity) => ({ title: amenity })) },
      ],
      jsonLd: [
        compact({
          '@context': 'https://schema.org',
          '@type': 'HotelRoom',
          name: room.name,
          description: words(room.text, ...room.detail_text),
          url: this.url(path),
          image: room.image ? this.media(room.image) : undefined,
          occupancy: maxNumber(room.occupancy) ? { '@type': 'QuantitativeValue', maxValue: maxNumber(room.occupancy) } : undefined,
          floorSize: maxNumber(room.size) ? { '@type': 'QuantitativeValue', value: maxNumber(room.size), unitCode: 'MTK' } : undefined,
          amenityFeature: room.amenities.map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
          containedInPlace: { '@id': `${this.origin}/#hotel` },
        }),
      ],
    });
  }

  private wellness(): PageModel {
    const page = this.section('wellness_page');
    const data: Section = page ?? WELLNESS_PAGE_FALLBACK;
    const topics = resolveWellnessTopics(data.items);
    const blocks: ContentBlock[] = [];
    if (!hidden(page, 'intro')) blocks.push({ text: texts(data.intro ?? data.content_text ?? WELLNESS_PAGE_FALLBACK.intro) });
    if (!hidden(page, 'day')) {
      blocks.push({
        heading: words(pick(page, 'day_kicker', WELLNESS_PAGE_FALLBACK.day_kicker), '–', pick(page, 'day_title', WELLNESS_PAGE_FALLBACK.day_title)),
        text: texts(pick(page, 'day_text', WELLNESS_PAGE_FALLBACK.day_text)),
      });
    }
    if (!hidden(page, 'tiles')) {
      blocks.push({
        heading: 'Bereiche',
        items: topics.map((topic) => ({ title: topic.name, text: words(topic.kicker, topic.summary), href: wellnessTopicHref(topic.id) })),
      });
    }
    if (!hidden(page, 'chapters')) {
      blocks.push({
        heading: 'Aus dem Spa',
        items: resolveWellnessChapters(data.chapters).map((chapter) => ({
          title: chapter.title,
          text: words(chapter.kicker, chapter.text),
          href: this.linkable(chapter.href, chapter.title) || undefined,
        })),
      });
    }
    const note = this.note(page, WELLNESS_PAGE_FALLBACK);
    if (note) blocks.push(note);
    return this.build('/wellness', { ...this.head(page, WELLNESS_PAGE_FALLBACK), blocks });
  }

  private wellnessTopic(id: string): PageModel {
    const topic = resolveWellnessTopics(this.section('wellness_page')?.items).find((item) => item.id === id);
    if (!topic) return this.notFound(wellnessTopicHref(id));
    const blocks: ContentBlock[] = [
      { text: texts(topic.text) },
      { heading: 'Auf einen Blick', items: topic.details.map((fact) => ({ title: fact.label, text: fact.value })) },
      { heading: 'Enthalten', items: topic.includes.map((item) => ({ title: item })) },
    ];
    for (const group of topic.prices ?? []) {
      blocks.push({
        heading: group.title,
        items: group.items.map((item) => ({ title: item.name, text: words(item.meta, item.price) })),
      });
    }
    if (topic.price_note) blocks.push({ text: texts(topic.price_note) });
    return this.build(wellnessTopicHref(topic.id), {
      eyebrow: topic.kicker,
      h1: topic.name,
      lead: topic.summary,
      image: topic.hero_image || topic.image,
      crumbs: [{ label: pageTitle('wellness'), href: '/wellness' }],
      blocks,
    });
  }

  private occasions(): PageModel {
    const page = this.section('occasions_page');
    const data: Section = { ...OCCASIONS_PAGE_FALLBACK, ...page };
    const occasions = resolveOccasions(data.items);
    const blocks: ContentBlock[] = [];
    if (str(data.intro)) blocks.push({ text: texts(data.intro) });
    blocks.push({
      heading: str(data.title) || pageTitle('anlaesse'),
      items: occasions.map((occasion) => ({ title: occasion.name, text: words(occasion.kicker, occasion.summary), href: occasionHref(occasion.id) })),
    });
    return this.build('/anlaesse', {
      eyebrow: str(data.eyebrow) || undefined,
      h1: str(data.title) || pageTitle('anlaesse'),
      lead: str(data.subtitle) || undefined,
      image: str(data.hero_image) || occasions[0]?.hero_image || undefined,
      blocks,
    });
  }

  private occasion(id: string): PageModel {
    const occasion = resolveOccasions(this.section('occasions_page')?.items).find((item) => item.id === id);
    if (!occasion) return this.notFound(occasionHref(id));
    const blocks: ContentBlock[] = [{ text: texts(occasion.text) }];
    if (occasion.details.length) blocks.push({ heading: 'Auf einen Blick', items: occasion.details.map((fact) => ({ title: fact.label, text: fact.value })) });
    if (occasion.includes.length) blocks.push({ heading: 'Das erwartet Sie', items: occasion.includes.map((item) => ({ title: item })) });
    if (occasion.links.length) {
      blocks.push({
        heading: 'Passend dazu',
        items: occasion.links.map((link) => ({ title: link.label || link.href, href: this.linkable(link.href, link.label) || undefined })),
      });
    }
    if (occasion.community.length) {
      blocks.push({
        heading: 'Tipps aus der Community',
        items: occasion.community.map((tip) => ({ title: tip.author || 'Tipp', text: tip.text, href: tip.href || undefined })),
      });
    }
    if (occasion.faqs.length) {
      blocks.push({ heading: 'Gut zu wissen', items: occasion.faqs.map((faq) => ({ title: faq.question, text: faq.answer })) });
    }
    return this.build(occasionHref(occasion.id), {
      eyebrow: occasion.kicker || undefined,
      h1: occasion.name,
      lead: occasion.summary || undefined,
      image: occasion.hero_image || undefined,
      crumbs: [{ label: str(this.section('occasions_page')?.title) || pageTitle('anlaesse'), href: '/anlaesse' }],
      blocks,
      jsonLd: occasion.faqs.length ? [faqJsonLd(occasion.faqs)] : [],
    });
  }

  private culinary(): PageModel {
    const page = this.section('culinary_page');
    const data: Section = page ?? CULINARY_PAGE_FALLBACK;
    const blocks: ContentBlock[] = [];
    if (!hidden(page, 'intro')) blocks.push({ text: texts(data.intro ?? this.section('culinary')?.text ?? CULINARY_PAGE_FALLBACK.intro) });
    if (!hidden(page, 'venues')) {
      blocks.push({
        heading: 'Restaurants im Haus',
        items: resolveCulinaryVenues(data.items).map((venue) => ({
          title: venue.name,
          text: words(venue.kicker, venue.text),
          facts: [...venue.details.map((fact) => `${fact.label}: ${fact.value}`), ...venue.includes],
        })),
      });
    }
    if (!hidden(page, 'rhythm')) {
      blocks.push({
        heading: 'Vom Morgen bis in die Nacht',
        items: resolveCulinaryRhythm(data.rhythm).map((item) => ({ title: words(item.kicker, item.title), text: item.text })),
      });
    }
    if (!hidden(page, 'also')) {
      blocks.push({ text: texts(words(`${str(pick(page, 'also_title', CULINARY_PAGE_FALLBACK.also_title))}.`, pick(page, 'also_text', CULINARY_PAGE_FALLBACK.also_text))) });
    }
    const note = this.note(page, CULINARY_PAGE_FALLBACK);
    if (note) blocks.push(note);
    return this.build('/kulinarik', { ...this.head(page, CULINARY_PAGE_FALLBACK), blocks });
  }

  private offers(): PageModel {
    const page = this.section('offers_page');
    const offers = resolveOfferStories(page?.items, this.section('offers')?.items);
    const head = this.head(page, OFFERS_PAGE_FALLBACK);
    head.h1 = str(page?.title ?? page?.title_line1 ?? OFFERS_PAGE_FALLBACK.title);
    head.lead = str(page?.subtitle ?? page?.title_script ?? OFFERS_PAGE_FALLBACK.subtitle);
    const blocks: ContentBlock[] = [];
    if (!hidden(page, 'intro') && str(page?.intro ?? OFFERS_PAGE_FALLBACK.intro)) blocks.push({ text: texts(page?.intro ?? OFFERS_PAGE_FALLBACK.intro) });
    if (!hidden(page, 'list')) {
      blocks.push({
        heading: 'Aktuelle Angebote',
        items: offers.map((offer) => ({
          title: offer.title,
          text: words(offer.subtitle, offer.text),
          facts: texts(offer.details, offer.travel_period ? `${offer.travel_period_label || 'Reisezeitraum'}: ${offer.travel_period}` : ''),
          href: offerHref(offer.id),
        })),
      });
    }
    const note = this.note(page, OFFERS_PAGE_FALLBACK);
    if (note) blocks.push(note);
    return this.build('/angebote', {
      ...head,
      blocks,
      jsonLd: [itemListJsonLd(offers.map((offer) => ({ name: offer.title, url: this.url(offerHref(offer.id)) })))],
    });
  }

  private offer(id: string): PageModel {
    const offer = resolveOfferStories(this.section('offers_page')?.items, this.section('offers')?.items).find((item) => item.id === id);
    if (!offer) return this.notFound(offerHref(id));
    const path = offerHref(offer.id);
    return this.build(path, {
      eyebrow: offer.subtitle,
      h1: offer.title,
      lead: offer.text,
      image: offer.hero_image || offer.image,
      crumbs: [{ label: pageTitle('angebote'), href: '/angebote' }],
      blocks: [
        { text: texts(offer.detail_text) },
        {
          heading: 'Auf einen Blick',
          items: texts(offer.details, offer.travel_period ? `${offer.travel_period_label || 'Reisezeitraum'}: ${offer.travel_period}` : '').map(
            (title) => ({ title }),
          ),
        },
        { heading: 'Enthalten', items: offer.includes.map((title) => ({ title })) },
      ],
      jsonLd: [
        compact({
          '@context': 'https://schema.org',
          '@type': 'Offer',
          name: offer.title,
          description: words(offer.subtitle, offer.text, ...offer.detail_text),
          url: this.url(path),
          image: offer.image ? this.media(offer.image) : undefined,
          offeredBy: { '@id': `${this.origin}/#hotel` },
          itemOffered: { '@type': 'Service', name: offer.title, provider: { '@id': `${this.origin}/#hotel` } },
        }),
      ],
    });
  }

  private blog(): PageModel {
    const page = this.section('blog_page');
    const posts = resolveBlogPosts(page?.items);
    const blocks: ContentBlock[] = [];
    if (!hidden(page, 'intro')) blocks.push({ text: texts(page?.intro ?? BLOG_PAGE_FALLBACK.intro) });
    blocks.push({ heading: 'Beiträge', items: posts.map((post) => ({ title: post.title, text: post.excerpt, href: blogHref(post.slug) })) });
    const note = this.note(page, BLOG_PAGE_FALLBACK);
    if (note) blocks.push(note);
    return this.build('/blog', { ...this.head(page, BLOG_PAGE_FALLBACK), blocks });
  }

  private post(slug: string): PageModel {
    const post = resolveBlogPosts(this.section('blog_page')?.items).find((item) => item.slug === slug);
    if (!post) return this.notFound(blogHref(slug));
    const path = blogHref(post.slug);
    const blocks: ContentBlock[] = [];
    let current: ContentBlock = { text: [] };
    for (const block of post.blocks) {
      if (block.type === 'heading') {
        blocks.push(current);
        current = { heading: block.text, text: [] };
      } else if (block.type === 'paragraph') {
        current.text!.push(str(block.text));
      } else if (block.caption) {
        current.text!.push(str(block.caption));
      }
    }
    blocks.push(current);
    return this.build(path, {
      h1: post.title,
      lead: post.excerpt,
      image: post.hero_image,
      crumbs: [{ label: pageTitle('blog'), href: '/blog' }],
      blocks,
      jsonLd: [
        compact({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          url: this.url(path),
          image: post.hero_image ? this.media(post.hero_image) : undefined,
          datePublished: post.published_at || undefined,
          inLanguage: 'de-DE',
          author: { '@id': `${this.origin}/#hotel` },
          publisher: { '@id': `${this.origin}/#hotel` },
          articleBody: post.blocks
            .filter((block) => block.type === 'paragraph' || block.type === 'heading')
            .map((block) => str((block as { text: string }).text))
            .join('\n\n'),
        }),
      ],
    });
  }

  private impressions(): PageModel {
    const page = this.section('impressions_page');
    const data: Section = page ?? IMPRESSIONS_PAGE_FALLBACK;
    const blocks: ContentBlock[] = [];
    if (!hidden(page, 'intro')) blocks.push({ text: texts(data.intro ?? IMPRESSIONS_PAGE_FALLBACK.intro) });
    if (!hidden(page, 'grid')) {
      blocks.push({ heading: 'Bilder', items: resolveImpressions(data.items).map((shot) => ({ title: str(shot.alt) })).filter((item) => item.title) });
    }
    const note = this.note(page, IMPRESSIONS_PAGE_FALLBACK);
    if (note) blocks.push(note);
    return this.build('/impressionen', { ...this.head(page, IMPRESSIONS_PAGE_FALLBACK), blocks });
  }

  private faqPage(): PageModel {
    const page = this.section('faq_page');
    const faqs = this.content.faqs;
    const byCategory = new Map<string, ContentItem[]>();
    for (const faq of faqs) {
      const list = byCategory.get(faq.category) ?? [];
      list.push({ title: faq.question, text: faq.answer });
      byCategory.set(faq.category, list);
    }
    const blocks: ContentBlock[] = hidden(page, 'list') ? [] : [...byCategory].map(([heading, items]) => ({ heading, items }));
    if (!hidden(page, 'cta') && page?.cta_text) blocks.push({ text: texts(page.cta_text) });
    return this.build('/faqs', {
      eyebrow: str(page?.eyebrow),
      h1: str(page?.title) || 'Häufige Fragen',
      lead: str(page?.subtitle),
      blocks,
      jsonLd: faqs.length ? [faqJsonLd(faqs)] : [],
    });
  }

  private legal(key: string): PageModel {
    const data = this.section(`legal_${key}`) ?? {};
    const body = str(data.body) ? String(data.body).split(/\n{2,}/).map(str).filter(Boolean) : [];
    return this.build(`/${key}`, { h1: str(data.title) || pageTitle(key), lead: str(data.subtitle), blocks: [{ text: body }] });
  }

  private generic(key: string): PageModel {
    const data = this.section(genericSectionKey(key)) ?? {};
    const body = str(data.body || data.intro) ? String(data.body || data.intro).split(/\n{2,}/).map(str).filter(Boolean) : [];
    const items = Array.isArray(data.items) ? (data.items as Section[]) : [];
    return this.build(`/seite/${key}`, {
      eyebrow: str(data.eyebrow),
      h1: str(data.title) || key,
      lead: str(data.subtitle),
      image: str(data.hero_image) || undefined,
      blocks: [
        { text: body },
        ...items.map((item) => ({ heading: str(item.title), text: texts(item.text, item.body) })),
      ],
    });
  }
}

export function normalizePath(path: string) {
  const clean = `/${path.split(/[?#]/)[0].split('/').filter(Boolean).join('/')}`;
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

function itemsOf(list: unknown, titleKey: string, textKey?: string): ContentItem[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item: Section) => ({ title: str(item?.[titleKey]), text: textKey ? str(item?.[textKey]) || undefined : undefined }))
    .filter((item) => item.title);
}

function roomFacts(room: ReturnType<typeof resolveRooms>[number]) {
  return texts(
    room.size ? `Größe: ${room.size}` : '',
    room.view ? `Ausblick: ${room.view}` : '',
    room.occupancy ? `Belegung: ${room.occupancy}` : '',
    room.price_from ? `Preis: ab ${formatRoomPriceDetail(room)}` : '',
  );
}

function maxNumber(value: string) {
  const numbers = (value.match(/\d+(?:[.,]\d+)?/g) ?? []).map((item) => Number(item.replace(',', '.')));
  return numbers.length ? Math.max(...numbers) : 0;
}

function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

function itemListJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: item.url })),
  };
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== '' && !(Array.isArray(item) && !item.length)),
  ) as T;
}

