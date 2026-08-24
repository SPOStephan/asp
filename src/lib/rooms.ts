export type RoomTag = 'zimmer' | 'suite' | 'meerblick' | 'familie';

export type RoomFilterId = 'alle' | RoomTag;

export interface RoomGalleryImage {
  src: string;
  alt: string;
}

export interface RoomStory {
  id: string;
  name: string;
  kicker: string;
  text: string;
  detail_text: string[];
  size: string;
  view: string;
  occupancy: string;
  tags: RoomTag[];
  amenities: string[];
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
  gallery: RoomGalleryImage[];
}

export const ROOM_FILTERS: { id: RoomFilterId; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'zimmer', label: 'Zimmer' },
  { id: 'suite', label: 'Suiten' },
  { id: 'meerblick', label: 'Meerblick' },
  { id: 'familie', label: 'Familie' },
];

export const ROOMS_PAGE_FALLBACK = {
  eyebrow: 'Ankommen',
  title: 'Zimmer & Suiten',
  subtitle: 'Meerblick · Ruhe · Weite',
  intro:
    'Kein Katalog, keine Rasterpreise. Sechs Räume, in denen das Licht der Nordsee den Takt vorgibt — vom stillen Doppelzimmer bis zur Suite mit eigener Terrasse.',
  hero_image: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
  hero_image_alt: 'Suite mit privater Terrasse und Blick ins Watt',
  lookbook_label: 'Lookbook',
  note_title: 'Nicht das passende Zimmer?',
  note_text:
    'Wir kennen jedes Zimmer im Haus. Schreiben Sie uns, was Sie brauchen — Blick, Größe, Anlass — wir finden die richtige Tür.',
  note_cta: 'Persönliche Beratung',
  items: [
    {
      id: 'austernfischer',
      name: 'Austernfischer Suite',
      kicker: 'Signature Suite',
      text: 'Die Suite mit dem weiten Horizont. Eine private Terrasse, Salz in der Luft und der Deich direkt vor dem Glas.',
      detail_text: [
        'Die Suite mit dem weiten Horizont. Eine private Terrasse, Salz in der Luft und der Deich direkt vor dem Glas.',
        'Morgens liegt das Watt noch still. Von der Terrasse aus reicht der Blick über Gräser, Priel und Himmel — ohne dass jemand dazwischentritt. Drinnen bleibt der Raum ruhig: helles Holz, weiche Stoffe, ein Bad, das nicht hetzt.',
        'Der Spa liegt eine Etage tiefer. Bademantel an, Aufzug, Wärme. Zurück auf der Terrasse wird der Abend länger als der Kalender.',
      ],
      size: 'ca. 65 m²',
      view: 'Meerblick, private Terrasse',
      occupancy: '2 Personen',
      tags: ['suite', 'meerblick'],
      amenities: [
        'Private Terrasse mit Weitblick',
        'King-Size-Bett',
        'Wellness-Bad',
        'Bademantel und Spa-Zugang',
        'WLAN, Smart-TV, Minibar, Safe',
      ],
      image: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
      image_alt: 'Austernfischer Suite mit Terrasse zum Watt',
      hero_image: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
      hero_image_alt: 'Private Terrasse der Austernfischer Suite',
      gallery: [
        { src: '/suite-room.webp', alt: 'Suite mit Meerblick' },
        { src: '/collage-terrace.webp', alt: 'Terrasse mit Ausblick' },
      ],
    },
    {
      id: 'strandlaeufer',
      name: 'Strandläufer Suite',
      kicker: 'Suite',
      text: 'Weit, hell, nah am Wasser. Eine Suite, in der der Horizont mit ins Zimmer kommt — und abends nicht wieder geht.',
      detail_text: [
        'Weit, hell, nah am Wasser. Eine Suite, in der der Horizont mit ins Zimmer kommt — und abends nicht wieder geht.',
        'Die Strandläufer bleibt eine Suite zum Atmen: Sitzecke am Fenster, Platz für zwei, die nichts teilen müssen außer den Blick. Der Tag darf hier langsam beginnen.',
        'Unten wartet der Spa, oben bleibt die Stille. Genau so viel Programm, wie Sie zulassen.',
      ],
      size: 'ca. 48 m²',
      view: 'Meerblick',
      occupancy: '2 Personen',
      tags: ['suite', 'meerblick'],
      amenities: [
        'Balkon oder Terrasse',
        'Sitzbereich mit Meerblick',
        'King-Size-Bett',
        'Bademantel und Spa-Zugang',
        'WLAN, Smart-TV, Minibar, Safe',
      ],
      image: '/suite-room.webp',
      image_alt: 'Strandläufer Suite mit Meerblick',
      hero_image: '/suite-room.webp',
      hero_image_alt: 'Helle Suite mit Blick zur Nordsee',
      gallery: [
        { src: '/collage-terrace.webp', alt: 'Ausblick von der Terrasse' },
        { src: '/hotel-stpeter-ording-Austernfischer-Suite05.jpg', alt: 'Terrasse zum Watt' },
      ],
    },
    {
      id: 'junior-suite',
      name: 'Junior Suite',
      kicker: 'Suite',
      text: 'Mehr Raum als ein Zimmer, weniger Zeremonie als eine große Suite. Licht, Ruhe und ein Platz zum Ankommen.',
      detail_text: [
        'Mehr Raum als ein Zimmer, weniger Zeremonie als eine große Suite. Licht, Ruhe und ein Platz zum Ankommen.',
        'Die Junior Suite eignet sich für Paare, die Weite wollen, ohne ein zweites Wohnzimmer zu brauchen. Ein klarer Grundriss, ein ruhiges Bad, der Blick ins Land oder zur Küste.',
        'Frühstück ohne Uhr. Ein Gang durch den Spa. Zurück ins Zimmer, bevor der Nachmittag Pläne macht.',
      ],
      size: 'ca. 38 m²',
      view: 'Weitblick',
      occupancy: '2 Personen',
      tags: ['suite'],
      amenities: [
        'Balkon oder Terrasse',
        'Offener Wohn-Schlafbereich',
        'Bademantel und Spa-Zugang',
        'WLAN, Smart-TV, Minibar, Safe',
      ],
      image: '/teaser-suite.webp',
      image_alt: 'Junior Suite im ambassador hotel & spa',
      hero_image: '/teaser-suite.webp',
      hero_image_alt: 'Junior Suite mit Sitzbereich',
      gallery: [
        { src: '/collage-relaxroom.webp', alt: 'Ruhiger Aufenthaltsbereich' },
        { src: '/collage-restroom.webp', alt: 'Bad mit natürlichem Licht' },
      ],
    },
    {
      id: 'doppel-meerblick',
      name: 'Doppelzimmer Meerblick',
      kicker: 'Zimmer',
      text: 'Das klassische Doppelzimmer — nur dass draußen das Meer arbeitet. Klein genug zum Zurückziehen, groß genug für zwei.',
      detail_text: [
        'Das klassische Doppelzimmer — nur dass draußen das Meer arbeitet. Klein genug zum Zurückziehen, groß genug für zwei.',
        'Kein Wohnzimmer, kein Aufwand. Bett, Blick, Balkon. Morgens das Licht von See, abends der Wind im Gras. Dazwischen der Spa und ein Tisch im Haus.',
        'Wer den Horizont will, ohne eine Suite zu brauchen, bleibt hier richtig.',
      ],
      size: 'ca. 28 m²',
      view: 'Meerblick',
      occupancy: '2 Personen',
      tags: ['zimmer', 'meerblick'],
      amenities: [
        'Balkon mit Meerblick',
        'Doppelbett',
        'Bademantel und Spa-Zugang',
        'WLAN, Smart-TV, Minibar, Safe',
      ],
      image: '/collage-terrace.webp',
      image_alt: 'Doppelzimmer mit Blick zur Nordsee',
      hero_image: '/collage-terrace.webp',
      hero_image_alt: 'Balkon mit Meerblick',
      gallery: [
        { src: '/suite-room.webp', alt: 'Heller Zimmerblick' },
        { src: '/willkommen-spo-smart.jpg', alt: 'Ausblick aufs Watt' },
      ],
    },
    {
      id: 'familienzimmer',
      name: 'Familienzimmer',
      kicker: 'Zimmer',
      text: 'Platz für die, die mitkommen. Ein Raum, der Kinder aushält und Eltern nicht vergisst — mit dem Spa und dem Strand in Reichweite.',
      detail_text: [
        'Platz für die, die mitkommen. Ein Raum, der Kinder aushält und Eltern nicht vergisst — mit dem Spa und dem Strand in Reichweite.',
        'Zwei Zonen, ein Blick nach draußen. Zustellbett oder separates Kinderbett auf Wunsch. Unten wartet die Betreuung, draußen der Deich, im Haus ein Tisch, der nicht flüstert.',
        'Der Familien-Spa bleibt offen. Der Adults-Only-Bereich wartet, wenn Sie ihn brauchen.',
      ],
      size: 'ca. 42 m²',
      view: 'Landschaft',
      occupancy: '2 Erwachsene, bis 2 Kinder',
      tags: ['zimmer', 'familie'],
      amenities: [
        'Platz für Zustellbett oder Babybett',
        'Balkon oder Terrasse',
        'Bademantel und Spa-Zugang',
        'WLAN, Smart-TV, Minibar, Safe',
      ],
      image: '/teaser-family.webp',
      image_alt: 'Familienzimmer im ambassador hotel & spa',
      hero_image: '/teaser-family.webp',
      hero_image_alt: 'Familienzimmer mit Platz für Kinder',
      gallery: [
        { src: '/collage-family.webp', alt: 'Zeit zu zweit und mit Kindern' },
        { src: '/collage-kids.webp', alt: 'Familienurlaub an der Nordsee' },
      ],
    },
    {
      id: 'doppel-land',
      name: 'Doppelzimmer Landseite',
      kicker: 'Zimmer',
      text: 'Ruhiger, grüner, näher am Ort. Ein klares Doppelzimmer für alle, die das Meer zu Fuß holen — und nachts Stille wollen.',
      detail_text: [
        'Ruhiger, grüner, näher am Ort. Ein klares Doppelzimmer für alle, die das Meer zu Fuß holen — und nachts Stille wollen.',
        'Die Landseite liegt abgewandt vom offenen Horizont, nicht von der Landschaft. Balkon, Bett, Bad. Der Strand bleibt ein kurzer Weg, der Spa eine Etage.',
        'Gut für Paare, die den Preis der Lage lieber in Ruhe als in Quadratmetern messen.',
      ],
      size: 'ca. 26 m²',
      view: 'Landschaft',
      occupancy: '2 Personen',
      tags: ['zimmer'],
      amenities: [
        'Balkon zur Landseite',
        'Doppelbett',
        'Bademantel und Spa-Zugang',
        'WLAN, Smart-TV, Minibar, Safe',
      ],
      image: '/collage-relaxroom.webp',
      image_alt: 'Doppelzimmer zur Landseite',
      hero_image: '/collage-relaxroom.webp',
      hero_image_alt: 'Ruhiges Doppelzimmer mit Landschaftsblick',
      gallery: [
        { src: '/collage-restroom.webp', alt: 'Bad im Doppelzimmer' },
        { src: '/teaser-suite.webp', alt: 'Heller Aufenthalt im Haus' },
      ],
    },
  ] satisfies RoomStory[],
};

export function slugifyRoom(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type RawRoom = Partial<RoomStory> & {
  title?: string;
  image_primary?: string;
  image_primary_alt?: string;
};

function asTags(value: unknown, fallback: RoomTag[]): RoomTag[] {
  if (!Array.isArray(value)) return fallback;
  const allowed: RoomTag[] = ['zimmer', 'suite', 'meerblick', 'familie'];
  const tags = value.filter((tag): tag is RoomTag => allowed.includes(tag as RoomTag));
  return tags.length ? tags : fallback;
}

function asGallery(value: unknown, fallback: RoomGalleryImage[]): RoomGalleryImage[] {
  if (!Array.isArray(value) || !value.length) return fallback;
  return value
    .map((item) => {
      if (typeof item === 'string') return { src: item, alt: '' };
      if (item && typeof item === 'object' && 'src' in item) {
        return { src: String(item.src), alt: String(item.alt ?? '') };
      }
      return null;
    })
    .filter((item): item is RoomGalleryImage => Boolean(item?.src));
}

export function resolveRooms(pageItems?: RawRoom[]): RoomStory[] {
  const raw = pageItems?.length ? pageItems : ROOMS_PAGE_FALLBACK.items;
  return raw.map((item, index) => {
    const fallback = ROOMS_PAGE_FALLBACK.items[index] ?? ROOMS_PAGE_FALLBACK.items[0];
    const name = item.name ?? item.title ?? fallback.name;
    return {
      id: item.id ?? slugifyRoom(name),
      name,
      kicker: item.kicker ?? fallback.kicker,
      text: item.text ?? fallback.text,
      detail_text: item.detail_text?.length ? item.detail_text : fallback.detail_text,
      size: item.size ?? fallback.size,
      view: item.view ?? fallback.view,
      occupancy: item.occupancy ?? fallback.occupancy,
      tags: asTags(item.tags, fallback.tags),
      amenities: item.amenities?.length ? item.amenities : fallback.amenities,
      image: item.image ?? item.image_primary ?? fallback.image,
      image_alt: item.image_alt ?? item.image_primary_alt ?? fallback.image_alt,
      hero_image: item.hero_image ?? item.image ?? item.image_primary ?? fallback.hero_image,
      hero_image_alt: item.hero_image_alt ?? item.image_alt ?? fallback.hero_image_alt,
      gallery: asGallery(item.gallery, fallback.gallery),
    };
  });
}

export function filterRooms(rooms: RoomStory[], filter: RoomFilterId) {
  if (filter === 'alle') return rooms;
  return rooms.filter((room) => room.tags.includes(filter));
}

export function isRoomFilter(value: string | null): value is RoomFilterId {
  return ROOM_FILTERS.some((filter) => filter.id === value);
}

export function roomHref(id: string) {
  return `/zimmer/${id}`;
}

export function remapRoomsHref(href: string, label?: string) {
  if (label === 'Zimmer & Suiten' && (href === '#suiten' || href === '#highlights')) {
    return '/zimmer';
  }
  return href;
}
