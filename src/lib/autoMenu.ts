import { culinaryVenueHref, resolveCulinaryVenues } from './culinary';
import { occasionHref, resolveOccasions } from './occasions';
import { offerHref, resolveOfferStories } from './offers';
import { resolveRooms, roomHref } from './rooms';
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
// shows another hotel's rooms, spa or restaurants. Pages that are switched off drop out later.
export function autoMenuGroups(sections: Record<string, Record<string, any>>): AutoMenuGroup[] {
  const groups: AutoMenuGroup[] = [
    {
      title: 'Zimmer & Suiten',
      href: '/zimmer',
      links: [{ label: 'Alle Zimmer & Suiten', href: '/zimmer' }, ...named(resolveRooms(sections.rooms_page?.items), (room) => room.name, (room) => roomHref(room.id))],
    },
    {
      title: 'Angebote',
      href: '/angebote',
      links: [
        { label: 'Alle Angebote', href: '/angebote' },
        ...named(resolveOfferStories(sections.offers_page?.items, sections.offers?.items), (offer) => offer.title, (offer) => offerHref(offer.id)),
      ],
    },
    {
      title: 'Anlässe',
      href: '/anlaesse',
      links: [{ label: 'Alle Anlässe', href: '/anlaesse' }, ...named(resolveOccasions(sections.occasions_page?.items), (item) => item.name, (item) => occasionHref(item.id))],
    },
    {
      title: 'Wellness',
      href: '/wellness',
      links: [{ label: 'Wellness', href: '/wellness' }, ...named(resolveWellnessTopics(sections.wellness_page?.items), (topic) => topic.name, (topic) => wellnessTopicHref(topic.id))],
    },
    {
      title: 'Kulinarik',
      href: '/kulinarik',
      links: [{ label: 'Kulinarik', href: '/kulinarik' }, ...named(resolveCulinaryVenues(sections.culinary_page?.items), (venue) => venue.name, (venue) => culinaryVenueHref(venue.id))],
    },
    {
      title: 'Hotel',
      links: [
        { label: 'Impressionen', href: '/impressionen' },
        { label: 'Journal', href: '/blog' },
        { label: 'FAQ', href: '/faqs' },
      ],
    },
  ];
  return groups;
}
