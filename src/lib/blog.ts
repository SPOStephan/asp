export type BlogTopicId = 'erholung' | 'familie' | 'hund';

export type BlogSource = 'human' | 'ai';

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'video'; src: string; provider?: 'file' | 'youtube'; caption?: string; poster?: string };

export type BlogPromoPlacement = 'inline' | 'after';

export interface BlogPromo {
  enabled: boolean;
  offer_id: string;
  placement: BlogPromoPlacement;
  suggested_offer_id: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  topic: BlogTopicId;
  hero_image: string;
  hero_image_alt: string;
  published_at: string;
  source: BlogSource;
  promo?: BlogPromo;
  blocks: BlogBlock[];
}

export const BLOG_TOPICS: { id: BlogTopicId | 'alle'; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'erholung', label: 'Erholung' },
  { id: 'familie', label: 'Familie' },
  { id: 'hund', label: 'Mit Hund' },
];

export const BLOG_TOPIC_LABEL: Record<BlogTopicId, string> = {
  erholung: 'Erholung',
  familie: 'Familie',
  hund: 'Mit Hund',
};

export const BLOG_PAGE_FALLBACK = {
  eyebrow: 'Journal',
  title: 'Geschichten vom Meer',
  subtitle: 'Erholung · Familie · Hund',
  intro:
    'Drei Blickwinkel auf Sankt Peter-Ording: die stille Nordsee, der Urlaub mit Kindern und der Tag mit Hund. Mehr folgt — von uns und später auch aus dem Admin.',
  hero_image: '/teaser-autumn.webp',
  hero_image_alt: 'Herbstlicht über Sankt Peter-Ording',
  home_eyebrow: 'Journal',
  home_title: 'Zuletzt geschrieben',
  home_cta: 'Alle Beiträge',
  note_title: 'Mehr aus dem Haus?',
  note_text: 'Zimmer, Spa und Küche liegen eine Seite weiter. Der Blog bleibt der Ort für Tempo und Stimmung.',
  note_cta: 'Zimmer ansehen',
  note_cta_href: '/zimmer',
  items: [
    {
      id: 'erholung-nordsee',
      slug: 'erholung-an-der-nordsee',
      title: 'Erholung an der Nordsee',
      excerpt:
        'Weite, Wind und ein Tag ohne Uhr. Warum die Küste bei Sankt Peter-Ording zur Ruhe zwingt — und der Spa sie hält.',
      topic: 'erholung',
      hero_image: '/hotel-nordsee-wellness02.webp',
      hero_image_alt: 'Wellnessbereich mit Blick zur Nordsee',
      published_at: '2026-08-20',
      source: 'human',
      promo: {
        enabled: true,
        offer_id: 'wellnessurlaub',
        placement: 'inline',
        suggested_offer_id: 'wellnessurlaub',
      },
      blocks: [
        {
          type: 'paragraph',
          text: 'Die Nordsee macht wenig Theater. Sie liegt da, zieht sich zurück, kommt wieder. Wer hier ankommt, merkt das zuerst im Atem: langsamer, tiefer, ohne dass jemand dazu auffordert.',
        },
        {
          type: 'paragraph',
          text: 'Sankt Peter-Ording ist dafür gebaut. Der Strand ist so breit, dass Pläne kleiner werden. Ein Gang über den Belag, Salz auf der Haut, der Deich im Rücken. Danach reicht oft schon ein stiller Raum — und Wärme.',
        },
        {
          type: 'heading',
          text: 'Wasser, Dampf, Weitblick',
        },
        {
          type: 'paragraph',
          text: 'Im Auramaris bleibt die Küste nah. Das Schwimmbad trägt Farblicht, die Saunen halten die Stille, fast alle Behandlungsräume schauen auf Dünen und Meer. Kein Programm, das hetzt. Ein Tag, der sich in Bahnen und Pausen teilt.',
        },
        {
          type: 'image',
          src: '/collage-pool.webp',
          alt: 'Schwimmbad im ambassador hotel & spa',
          caption: 'Bahnen ohne Uhr. Das Wasser bleibt der erste Takt.',
        },
        {
          type: 'paragraph',
          text: 'Wer Anwendungen will, reserviert sie am besten mit der Zimmerbuchung. Wer nur liegen will, darf das auch. Handtuch, Bademantel, ein Platz am Fenster — mehr braucht der Nachmittag nicht.',
        },
        {
          type: 'heading',
          text: 'Der Abend übernimmt',
        },
        {
          type: 'paragraph',
          text: 'Abends wird die Luft kühler. Ein Tisch im Haus, ein Glas an der Bar, der Wind von See. Erholung hier ist keine Methode. Es ist die Landschaft, die den Kalender übernimmt.',
        },
      ],
    },
    {
      id: 'familienurlaub-spo',
      slug: 'familienurlaub-sankt-peter-ording',
      title: 'Familienurlaub in Sankt Peter-Ording',
      excerpt:
        'Platz für Kinder, Wege zum Strand und ein Haus, das drei Generationen kennt. Was in SPO den Familienurlaub trägt.',
      topic: 'familie',
      hero_image: '/teaser-family.webp',
      hero_image_alt: 'Familie im ambassador hotel & spa',
      published_at: '2026-08-14',
      source: 'human',
      promo: {
        enabled: true,
        offer_id: 'feiertage',
        placement: 'after',
        suggested_offer_id: 'feiertage',
      },
      blocks: [
        {
          type: 'paragraph',
          text: 'Mit Kindern zählt, was ohne Verhandlung geht: ein kurzer Weg zum Sand, ein Frühstück, das nicht hetzt, und Räume, in denen jemand kleiner toben darf, ohne dass der ganze Flur zuhört.',
        },
        {
          type: 'paragraph',
          text: 'Sankt Peter-Ording liefert die Bühne. Der Strand ist weit genug für Burgen, Drachen und das eine Kind, das nur laufen will. Der Ort bleibt nah, der Horizont größer als der Tagesplan.',
        },
        {
          type: 'image',
          src: '/collage-kids.webp',
          alt: 'Kinderurlaub an der Nordsee',
          caption: 'Sand, Wind, kein fertiges Programm — der Tag findet sich.',
        },
        {
          type: 'heading',
          text: 'Ein Haus, das Familien kennt',
        },
        {
          type: 'paragraph',
          text: 'Im ambassador wohnen Familien nicht am Rand der Geschichte. Es gibt Zimmer mit Platz, Betreuung ab dem ersten Lebensjahr und einen Spa, der Adults-Only und Familie trennt, wenn es Zeit dafür ist.',
        },
        {
          type: 'paragraph',
          text: 'Morgens Buffet, mittags Watt oder Spiel. Wer will, nimmt die Halbpension: ein 5-Gang-Wahlmenü, das auch vegetarisch und vegan kann. Allergien vorher nennen — die Küche stellt um.',
        },
        {
          type: 'image',
          src: '/collage-family.webp',
          alt: 'Gemeinsame Zeit im Resort',
          caption: 'Drei Generationen, ein Horizont.',
        },
        {
          type: 'heading',
          text: 'Ohne fertigen Plan',
        },
        {
          type: 'paragraph',
          text: 'Der beste Familienurlaub hier ist der, der nicht vollgeplant wird. Ein Termin im Mini-Spa für die Kleinen, ein stiller Gang für die Großen, dazwischen der Deich. SPO hält das aus.',
        },
      ],
    },
    {
      id: 'hund-spo',
      slug: 'ferien-mit-hund-sankt-peter-ording',
      title: 'SPO-Ferien mit Hund',
      excerpt:
        'Leine, Wind und ein Strand, der mitkommt. Wie Sankt Peter-Ording den Urlaub mit Hund trägt — ohne dass der Mensch zu kurz kommt.',
      topic: 'hund',
      hero_image: '/autumn-aerial.webp',
      hero_image_alt: 'Weite der Nordseeküste bei Sankt Peter-Ording',
      published_at: '2026-08-08',
      source: 'human',
      promo: {
        enabled: true,
        offer_id: 'wellnessurlaub',
        placement: 'after',
        suggested_offer_id: 'wellnessurlaub',
      },
      blocks: [
        {
          type: 'paragraph',
          text: 'Hunde lesen die Küste schneller als wir. Der erste Geruch nach Salz, der weite Belag, ein Wind, der nicht nach Stadt riecht. Sankt Peter-Ording ist dafür gemacht — wenn Mensch und Tier denselben Takt finden.',
        },
        {
          type: 'paragraph',
          text: 'Im ambassador sind Hunde willkommen. Das heißt: anmelden, Platz klären, die Regeln des Hauses kennen. Kein stilles Extra auf dem Zimmerteppich, sondern ein Gast, der mitgedacht wird.',
        },
        {
          type: 'heading',
          text: 'Strand, Deich, Pause',
        },
        {
          type: 'paragraph',
          text: 'Draußen gilt die Küste. Weite Flächen, Wege am Deich, der Ort zu Fuß. Nicht jeder Abschnitt ist frei — Schilder und Saisonzeiten beachten. Dafür bleibt genug Sand, auf dem die Leine länger werden darf.',
        },
        {
          type: 'image',
          src: '/teaser-autumn.webp',
          alt: 'Weite Landschaft an der Nordsee',
          caption: 'Mehr Horizont als Gehweg. Der Hund versteht das zuerst.',
        },
        {
          type: 'paragraph',
          text: 'Drinnen bleibt der Spa den Menschen. Nach dem Gang über den Belag: Wasser, Sauna, ein stiller Tisch. Der Hund ruht, der Tag teilt sich. So bleibt der Urlaub für beide Seiten.',
        },
        {
          type: 'heading',
          text: 'Ankommen mit Hund',
        },
        {
          type: 'paragraph',
          text: 'Wer anreist, sagt den Hund bei der Buchung an. Größe, Decke, Futterzeiten — wir richten das Zimmer danach. Die Nordsee erledigt den Rest.',
        },
      ],
    },
  ] satisfies BlogPost[],
};

type RawBlock = Partial<BlogBlock> & { type?: string };
type RawPost = Partial<BlogPost> & { blocks?: RawBlock[] };

export function isBlogTopic(value: string | null): value is BlogTopicId {
  return value === 'erholung' || value === 'familie' || value === 'hund';
}

export function resolveBlogPosts(items?: RawPost[]): BlogPost[] {
  const raw = items?.length ? items : BLOG_PAGE_FALLBACK.items;
  return raw
    .map((item, index) => {
      const fallback =
        BLOG_PAGE_FALLBACK.items.find((post) => post.id === item.id || post.slug === item.slug) ??
        BLOG_PAGE_FALLBACK.items[index] ??
        BLOG_PAGE_FALLBACK.items[0];
      return {
        id: item.id ?? fallback.id,
        slug: item.slug ?? fallback.slug,
        title: item.title ?? fallback.title,
        excerpt: item.excerpt ?? fallback.excerpt,
        topic: item.topic ?? fallback.topic,
        hero_image: item.hero_image ?? fallback.hero_image,
        hero_image_alt: item.hero_image_alt ?? fallback.hero_image_alt,
        published_at: item.published_at ?? fallback.published_at,
        source: item.source ?? fallback.source,
        promo: resolvePromo(item.promo, item.topic ?? fallback.topic, fallback.promo),
        blocks: resolveBlocks(item.blocks, fallback.blocks),
      };
    })
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
}

const TOPIC_PROMO: Record<BlogTopicId, string> = {
  erholung: 'wellnessurlaub',
  familie: 'feiertage',
  hund: 'wellnessurlaub',
};

export function suggestPromoOfferId(topic: BlogTopicId) {
  return TOPIC_PROMO[topic];
}

function resolvePromo(
  value: Partial<BlogPromo> | undefined,
  topic: BlogTopicId,
  fallback?: BlogPromo
): BlogPromo | undefined {
  const suggested = value?.suggested_offer_id ?? fallback?.suggested_offer_id ?? suggestPromoOfferId(topic);
  const enabled = value?.enabled ?? fallback?.enabled ?? true;
  if (value?.enabled === false) return { enabled: false, offer_id: suggested, placement: 'after', suggested_offer_id: suggested };
  return {
    enabled,
    offer_id: value?.offer_id ?? fallback?.offer_id ?? suggested,
    placement: value?.placement ?? fallback?.placement ?? 'after',
    suggested_offer_id: suggested,
  };
}

export function blogHeadings(blocks: BlogBlock[]) {
  return blocks
    .filter((block): block is Extract<BlogBlock, { type: 'heading' }> => block.type === 'heading')
    .map((block) => ({ id: headingAnchor(block.text), text: block.text }));
}

export function headingAnchor(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveBlocks(items: RawBlock[] | undefined, fallback: BlogBlock[]): BlogBlock[] {
  if (!items?.length) return fallback;
  return items
    .map((item, index) => {
      const base = fallback[index];
      if (item.type === 'heading' && item.text) return { type: 'heading' as const, text: item.text };
      if (item.type === 'image' && item.src) {
        return {
          type: 'image' as const,
          src: item.src,
          alt: item.alt ?? '',
          caption: item.caption,
        };
      }
      if (item.type === 'video' && item.src) {
        return {
          type: 'video' as const,
          src: item.src,
          provider: item.provider === 'youtube' ? 'youtube' : 'file',
          caption: item.caption,
          poster: item.poster,
        };
      }
      if (item.type === 'paragraph' && item.text) return { type: 'paragraph' as const, text: item.text };
      return base;
    })
    .filter((item): item is BlogBlock => Boolean(item));
}

export function filterBlogPosts(posts: BlogPost[], topic: BlogTopicId | 'alle') {
  if (topic === 'alle') return posts;
  return posts.filter((post) => post.topic === topic);
}

export function latestBlogPosts(posts: BlogPost[], count = 3) {
  return resolveBlogPosts(posts).slice(0, count);
}

export function blogHref(slug: string) {
  return `/blog/${slug}`;
}

export function formatBlogDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function youtubeId(src: string) {
  const watch = src.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watch) return watch[1];
  const short = src.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];
  if (/^[a-zA-Z0-9_-]{6,}$/.test(src)) return src;
  return null;
}
