import { culinaryVenueHref, resolveCulinaryVenues } from './culinary';
import { occasionHref, resolveOccasions } from './occasions';
import { offerHref, resolveOfferStories } from './offers';
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
// shows another hotel's rooms, spa or restaurants. Pages that are switched off drop out later
// (filterMenuGroups). The title of a group leads to its page; the links below never repeat it.
//   Hotel     → the hotel page (if switched on): rooms, pictures, journal, questions
//   Wellness, Kulinarik, Angebote, Anlässe → their pages with their entries
//   Service   → vouchers (with a shop address), journal, questions
export function autoMenuGroups(
  sections: Record<string, Record<string, any>>,
  enabled: (key: string) => boolean = () => true,
  voucherHref = '',
): AutoMenuGroup[] {
  const hotelPage = enabled('hotel');
  const groups: AutoMenuGroup[] = [
    {
      title: 'Hotel',
      ...(hotelPage ? { href: '/hotel' } : {}),
      links: [
        { label: 'Zimmer & Suiten', href: '/zimmer' },
        ...(hotelPage ? [{ label: 'Geschichte', href: '/hotel#geschichte' }, { label: 'Anreise & Lage', href: '/hotel#anreise' }] : []),
        { label: 'Impressionen', href: '/impressionen' },
      ],
    },
    {
      title: 'Wellness',
      href: '/wellness',
      links: named(resolveWellnessTopics(sections.wellness_page?.items), (topic) => topic.name, (topic) => wellnessTopicHref(topic.id)),
    },
    {
      title: 'Kulinarik',
      href: '/kulinarik',
      links: named(resolveCulinaryVenues(sections.culinary_page?.items), (venue) => venue.name, (venue) => culinaryVenueHref(venue.id)),
    },
    {
      title: 'Angebote',
      href: '/angebote',
      links: named(resolveOfferStories(sections.offers_page?.items, sections.offers?.items), (offer) => offer.title, (offer) => offerHref(offer.id)),
    },
    {
      title: 'Anlässe',
      href: '/anlaesse',
      links: named(resolveOccasions(sections.occasions_page?.items), (item) => item.name, (item) => occasionHref(item.id)),
    },
    {
      title: 'Service',
      links: [
        ...(voucherHref ? [{ label: 'Gutscheine', href: voucherHref }] : []),
        { label: 'Journal', href: '/blog' },
        { label: 'FAQ', href: '/faqs' },
      ],
    },
  ];
  return groups;
}
