import { OCCASIONS_PAGE_FALLBACK, REGION_PATH, resolveOccasions, type Occasion } from './occasions';

// Areas made of a hub and one page per topic, built the same way (text, facts, what is
// included, links, questions, a button):
//   region – "Urlaub in St. Peter-Ording": beach & nature, excursions, events … (occasions_page)
//   events – meetings and/or celebrations (events_page). Each hotel says what it offers:
//            only meetings ("Tagen", /tagen), only celebrations ("Feiern", /feiern) or both
//            ("Tagen & Feiern", /tagen-und-feiern). Each topic says whether it is about
//            meetings or celebrations and shows only when the hotel offers that.

export type TopicAreaKey = 'region' | 'events';
export type EventsMode = 'tagen' | 'feiern' | 'beides';

export const EVENTS_MODES: Record<EventsMode, { path: string; title: string; label: string }> = {
  tagen: { path: '/tagen', title: 'Tagen', label: 'Nur Tagen' },
  feiern: { path: '/feiern', title: 'Feiern', label: 'Nur Feiern' },
  beides: { path: '/tagen-und-feiern', title: 'Tagen & Feiern', label: 'Tagen und Feiern' },
};
export const EVENTS_PATHS = Object.values(EVENTS_MODES).map((mode) => mode.path);
export const EVENTS_PAGE_KEY = 'tagen';

export const EVENTS_PAGE_FALLBACK = {
  mode: 'tagen' as EventsMode,
  eyebrow: '',
  title: '',
  subtitle: '',
  intro: '',
  hero_image: '',
  hero_image_alt: '',
  cta: 'ANFRAGE SENDEN',
  items: [] as Array<Record<string, unknown>>,
};

type Section = Record<string, unknown> | null | undefined;

export function eventsMode(page: Section): EventsMode {
  const mode = page?.mode;
  return mode === 'feiern' || mode === 'beides' ? mode : 'tagen';
}

export function eventsPath(page: Section) {
  return EVENTS_MODES[eventsMode(page)].path;
}

// Which topics the hotel shows: a topic about meetings only if it offers meetings, and so on.
export function eventFits(item: Pick<Occasion, 'kind'>, mode: EventsMode) {
  if (mode === 'beides') return true;
  return !item.kind || item.kind === mode;
}

export interface TopicArea {
  key: TopicAreaKey;
  section: string;
  pageKey: string;
  basePath: string;
  title: string;
  items: Occasion[];
  // Name of one topic page in the CMS.
  itemLabel: string;
  // The button of a topic page when it has none of its own.
  cta: { label: string; href: string };
}

function str(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function topicArea(key: TopicAreaKey, page: Section, email?: string | null): TopicArea {
  if (key === 'events') {
    const mode = eventsMode(page);
    return {
      key,
      section: 'events_page',
      pageKey: EVENTS_PAGE_KEY,
      basePath: EVENTS_MODES[mode].path,
      title: str(page?.title) || EVENTS_MODES[mode].title,
      items: resolveOccasions(page?.items).filter((item) => eventFits(item, mode)),
      itemLabel: mode === 'feiern' ? 'Feier' : mode === 'tagen' ? 'Tagung' : 'Tagung oder Feier',
      cta: { label: str(page?.cta) || EVENTS_PAGE_FALLBACK.cta, href: email ? `mailto:${email}` : '#buchung' },
    };
  }
  return {
    key,
    section: 'occasions_page',
    pageKey: 'anlaesse',
    basePath: REGION_PATH,
    title: str(page?.title) || OCCASIONS_PAGE_FALLBACK.title,
    items: resolveOccasions(page?.items),
    itemLabel: 'Thema',
    cta: { label: 'Jetzt buchen', href: '#buchung' },
  };
}

export function topicHref(area: Pick<TopicArea, 'basePath'>, id: string) {
  return `${area.basePath}/${id}`;
}
