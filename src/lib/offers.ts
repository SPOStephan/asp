export interface OfferLink {
  label: string;
  href: string;
}

export interface OfferStory {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  detail_text: string[];
  details: string[];
  travel_period_label: string;
  travel_period: string;
  includes: string[];
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
}

export const OFFERS_PAGE_FALLBACK = {
  eyebrow: 'Arrangements',
  title: 'Unsere besten Angebote',
  subtitle: 'Für Ihre Nordsee-Ferien',
  intro:
    'Zwei Arrangements, klar erzählt. Kein Buchungsraster — sondern zwei Geschichten vom Meer, mit allem was dazugehört.',
  hero_image: '/teaser-autumn.webp',
  hero_image_alt: 'Herbstlicht über Sankt Peter-Ording',
  note_title: 'Ein anderes Arrangement?',
  note_text: 'Wir stellen Ihnen gern ein individuelles Paket zusammen — passend zu Anreise, Anlass und Tempo.',
  note_cta: 'Persönliche Beratung',
  items: [
    {
      id: 'wellnessurlaub',
      title: 'Wellnessurlaub',
      subtitle: 'Auszeit am Meer',
      text:
        'Drei Nächte zwischen Suite, Spa und Salzwasser. Ein Guthaben für Anwendungen, der Pool mit Weitblick und Zeit, die niemand plant.',
      detail_text: [
        'Drei Nächte zwischen Suite, Spa und Salzwasser. Ein Guthaben für Anwendungen, der Pool mit Weitblick und Zeit, die niemand plant.',
        'Der Tag darf langsam beginnen: Frühstück ohne Uhr, ein Gang durch den Spa, Salz in der Luft. Am Nachmittag bleibt das Wellnessguthaben für die Anwendung, die gerade passt — oder für gar nichts, außer Wärme und Stille.',
        'Late Check-out nach Verfügbarkeit verlängert den letzten Vormittag. Kein Hetzen, kein früher Koffer. Nur noch einmal der Blick aufs Wasser.',
      ],
      details: ['3 Nächte', 'ab 655 Euro pro Person'],
      travel_period_label: 'Reisezeitraum',
      travel_period: 'September bis Dezember',
      includes: [
        'Übernachtung mit Frühstück',
        '50 € Wellnessguthaben',
        'Zugang zum gesamten Spa',
        'Late Check-out nach Verfügbarkeit',
      ],
      image: '/teaser-spa.webp',
      image_alt: 'Wellness und Spa im ambassador hotel & spa',
      hero_image: '/hotel-nordsee-wellness02.webp',
      hero_image_alt: 'Wellnessbereich des ambassador hotel & spa',
    },
    {
      id: 'feiertage',
      title: 'Feiertage',
      subtitle: 'Weihnachten mit Meerblick',
      text:
        'Die stillen Tage am Deich. Festliche Menüs, ein helles Zimmer zum Meer und Abende, die länger werden als der Kalender.',
      detail_text: [
        'Die stillen Tage am Deich. Festliche Menüs, ein helles Zimmer zum Meer und Abende, die länger werden als der Kalender.',
        'Weihnachten hier heißt: weniger Programm, mehr Licht. Ein Tisch, der für Sie gedeckt ist, Gänge, die zur Jahreszeit passen, und Zimmer, in denen der Horizont nah bleibt.',
        'Zur Anreise liegt eine kleine Aufmerksamkeit bereit. Der Spa steht offen — für ein Bad zwischen den Festtagen oder einfach für Wärme, wenn der Wind von See kommt.',
      ],
      details: ['3 Nächte', 'ab 655 Euro pro Person'],
      travel_period_label: 'Reisezeitraum',
      travel_period: 'November bis Januar',
      includes: [
        'Übernachtung mit Frühstück',
        'Festtagsmenüs an den Feiertagen',
        'Zugang zum gesamten Spa',
        'Kleine Aufmerksamkeit zur Anreise',
      ],
      image: '/collage-dining1.webp',
      image_alt: 'Festliche Kulinarik im Hotel',
      hero_image: '/culinary-dining.webp',
      hero_image_alt: 'Festliche Tafel im Restaurant',
    },
  ] satisfies OfferStory[],
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type RawOffer = Partial<OfferStory> & {
  image_primary?: string;
  image_primary_alt?: string;
};

export function resolveOfferStories(
  pageItems?: RawOffer[],
  homeItems?: RawOffer[]
): OfferStory[] {
  const raw = pageItems ?? homeItems ?? OFFERS_PAGE_FALLBACK.items;
  return raw.map((item, index) => {
    const fallback = OFFERS_PAGE_FALLBACK.items[index] ?? OFFERS_PAGE_FALLBACK.items[0];
    return {
      id: item.id ?? slugify(item.title ?? fallback.title),
      title: item.title ?? fallback.title,
      subtitle: item.subtitle ?? fallback.subtitle,
      text: item.text ?? fallback.text,
      detail_text: item.detail_text?.length ? item.detail_text : fallback.detail_text,
      details: item.details ?? fallback.details,
      travel_period_label: item.travel_period_label ?? fallback.travel_period_label,
      travel_period: item.travel_period ?? fallback.travel_period,
      includes: item.includes ?? fallback.includes,
      image: item.image ?? item.image_primary ?? fallback.image,
      image_alt: item.image_alt ?? item.image_primary_alt ?? fallback.image_alt,
      hero_image: item.hero_image ?? item.image ?? item.image_primary ?? fallback.hero_image,
      hero_image_alt: item.hero_image_alt ?? item.image_alt ?? fallback.hero_image_alt,
    };
  });
}

export function offerHref(id: string) {
  return `/angebote/${id}`;
}
