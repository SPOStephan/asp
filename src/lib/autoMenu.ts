import { culinaryVenueHref, resolveCulinaryVenues } from './culinary';
import { readFilters } from './listFilters';
import { offerTopicHref, resolveOfferStories } from './offers';
import { topicArea, topicHref } from './topicAreas';
import { resolveWellnessTopics, wellnessTopicHref } from './wellness';

type Link = { label: string; href: string };
export type AutoMenuGroup = { title: string; href?: string; links: Link[] };

const MAX_LINKS = 6;

function named<T>(items: T[], label: (item: T) => string, href: (item: T) => string): Link[] {
  return items
    .map((item) => ({ label: label(item).trim(), href: href(item) }))
    .filter((link) => link.label)
    .slice(0, MAX_LINKS);
}

// The menu of a hotel without its own: built from its own pages and entries, so it never
// shows another hotel's rooms, spa or topics. Pages that are switched off drop out later
// (filterMenuGroups). The title of a group leads to its page; the links below never repeat it.
//   Hotel          → "Über uns" (if switched on): rooms, arrival, questions, pictures
//   Angebote       → the themes of the offers ("Wellness-Angebote" …), not single offers
//   Wellness       → its topic pages
//   Kulinarik      → its page, with its main restaurant
//   Tagen & Feiern → named as the hotel offers it ("Tagen", "Feiern" …), with its topic pages
//   Region         → "Urlaub in …" with its topic pages
// The service links (vouchers, journal …) sit in a row below the groups (autoServiceLinks).
export function autoMenuGroups(
  sections: Record<string, Record<string, any>>,
  enabled: (key: string) => boolean = () => true,
): AutoMenuGroup[] {
  const about = enabled('ueber-uns');
  const offers = resolveOfferStories(sections.offers_page?.items, sections.offers?.items);
  const themes = (readFilters(sections.offers_page?.filters) ?? []).filter((theme) => offers.some((offer) => offer.topics.includes(theme.id)));
  const events = topicArea('events', sections.events_page);
  const region = topicArea('region', sections.occasions_page);
  return [
    {
      title: 'Hotel',
      ...(about ? { href: '/ueber-uns' } : {}),
      links: [
        { label: 'Zimmer & Suiten', href: '/zimmer' },
        { label: 'Anreise', href: '/anreise' },
        { label: 'FAQ', href: '/faqs' },
        { label: 'Impressionen', href: '/impressionen' },
      ],
    },
    { title: 'Angebote', href: '/angebote', links: named(themes, (theme) => theme.label, (theme) => offerTopicHref(theme.id)) },
    {
      title: 'Wellness',
      href: '/wellness',
      links: named(resolveWellnessTopics(sections.wellness_page?.items), (topic) => topic.name, (topic) => wellnessTopicHref(topic.id)),
    },
    // The first restaurant of the culinary page (the main one); it leads to its place on that
    // page. Bars and lounges get no entry of their own.
    {
      title: 'Kulinarik',
      href: '/kulinarik',
      links: named(resolveCulinaryVenues(sections.culinary_page?.items).slice(0, 1), (venue) => venue.name, (venue) => culinaryVenueHref(venue.id)),
    },
    { title: events.title, href: events.basePath, links: named(events.items, (item) => item.name, (item) => topicHref(events, item.id)) },
    { title: region.title, href: region.basePath, links: named(region.items, (item) => item.name, (item) => topicHref(region, item.id)) },
  ];
}

// The row below the groups: vouchers (with a shop address), newsletter, journal. Stammgastpass,
// career and the like are added in the CMS (Logo & Leiste → Service-Zeile).
export function autoServiceLinks(sections: Record<string, Record<string, any>>, voucherHref = ''): Link[] {
  return [
    ...(voucherHref ? [{ label: 'Gutscheine', href: voucherHref }] : []),
    ...(sections.newsletter && sections.newsletter.hidden !== true ? [{ label: 'Newsletter', href: '#newsletter' }] : []),
    { label: 'Journal', href: '/blog' },
  ];
}
