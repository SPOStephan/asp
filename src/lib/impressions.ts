export type ImpressionTopic = 'haus' | 'wellness' | 'kueche' | 'kueste';

export type ImpressionShape = 'wide' | 'square' | 'tall';

export type MosaicRole = 'hero' | 'portrait' | 'wide' | 'square';

export interface ImpressionShot {
  src: string;
  alt: string;
  topic: ImpressionTopic;
  shape?: ImpressionShape;
}

export interface PackedImpression extends ImpressionShot {
  role: MosaicRole;
}

const MOSAIC_PATTERN: { role: MosaicRole; wants: ImpressionShape[] }[] = [
  { role: 'hero', wants: ['wide'] },
  { role: 'portrait', wants: ['tall', 'square'] },
  { role: 'square', wants: ['square', 'tall'] },
  { role: 'square', wants: ['square', 'wide'] },
  { role: 'square', wants: ['square', 'wide'] },
  { role: 'wide', wants: ['wide'] },
  { role: 'portrait', wants: ['tall', 'square'] },
  { role: 'wide', wants: ['wide'] },
];

export const IMPRESSION_TOPICS: { id: ImpressionTopic | 'alle'; label: string }[] = [
  { id: 'alle', label: 'Alle' },
  { id: 'haus', label: 'Haus' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'kueche', label: 'Küche' },
  { id: 'kueste', label: 'Küste' },
];

export const IMPRESSIONS_PAGE_FALLBACK = {
  eyebrow: 'Impressionen',
  title: 'Bilder vom Meer',
  subtitle: 'ambassador hotel & spa',
  intro:
    'Suite, Spa, Küche und die weite Küste. Eine Galerie aus dem Haus — zum Durchsehen, nicht zum Abhaken.',
  hero_image: '/autumn-aerial.webp',
  hero_image_alt: 'Luftaufnahme der Nordseeküste bei Sankt Peter-Ording',
  items: [
    { src: '/collage-pool.webp', alt: 'Poolbereich mit Blick ins Weite', topic: 'wellness' },
    { src: '/autumn-aerial.webp', alt: 'Luftaufnahme der Nordseeküste', topic: 'kueste' },
    { src: '/teaser-suite.webp', alt: 'Suite im ambassador hotel & spa', topic: 'haus' },
    { src: '/collage-dining1.webp', alt: 'Abendessen im Haus', topic: 'kueche' },
    { src: '/spa-wellness.webp', alt: 'Spa-Bereich mit Weitblick', topic: 'wellness' },
    { src: '/collage-terrace.webp', alt: 'Terrasse am Abend', topic: 'haus' },
    { src: '/teaser-autumn.webp', alt: 'Herbstlicht über Sankt Peter-Ording', topic: 'kueste' },
    { src: '/collage-dining2.webp', alt: 'Gedeckter Tisch', topic: 'kueche' },
    { src: '/spa-adults-only.webp', alt: 'Adults-Only im Spa', topic: 'wellness' },
    { src: '/family-welcome.webp', alt: 'Ankommen im Nordsee-Hotel', topic: 'haus' },
    { src: '/teaser-yoga.webp', alt: 'Yoga und Auszeit', topic: 'wellness' },
    { src: '/collage-night.webp', alt: 'Das Hotel bei Nacht', topic: 'haus' },
    { src: '/culinary-dining.webp', alt: 'Kulinarik an der Nordsee', topic: 'kueche' },
    { src: '/teaser-family.webp', alt: 'Familienzeit im Resort', topic: 'kueste' },
    { src: '/collage-relaxroom.webp', alt: 'Ruhe im Spa', topic: 'wellness' },
    { src: '/suite-room.webp', alt: 'Suite mit Meerblick', topic: 'haus' },
    { src: '/yoga-outdoor.webp', alt: 'Yoga unter freiem Himmel', topic: 'wellness' },
    { src: '/collage-family.webp', alt: 'Drei Generationen am Meer', topic: 'kueste' },
    { src: '/teaser-spa.webp', alt: 'Anwendung im Auramaris', topic: 'wellness' },
    { src: '/hero-resort.webp', alt: 'Das Resort von See', topic: 'haus' },
    { src: '/collage-treatment.webp', alt: 'Behandlung im Spa', topic: 'wellness' },
    { src: '/teaser-winter.webp', alt: 'Winterlicht an der Küste', topic: 'kueste' },
    { src: '/collage-kids.webp', alt: 'Kinderurlaub an der Nordsee', topic: 'kueste' },
    { src: '/collage-restroom.webp', alt: 'Ankommen an der Rezeption', topic: 'haus' },
  ] satisfies ImpressionShot[],
};

type RawShot = Partial<ImpressionShot> & { src?: string };

export function resolveImpressions(items?: RawShot[]): ImpressionShot[] {
  const raw = items?.length ? items : IMPRESSIONS_PAGE_FALLBACK.items;
  return raw
    .map((item) => {
      const known = IMPRESSIONS_PAGE_FALLBACK.items.find((shot) => shot.src === item.src);
      if (!item.src) return known ?? IMPRESSIONS_PAGE_FALLBACK.items[0];
      return {
        src: item.src,
        alt: item.alt ?? known?.alt ?? '',
        topic: item.topic ?? known?.topic ?? 'haus',
        shape: item.shape ?? known?.shape,
      };
    })
    .filter((item, index, list) => list.findIndex((entry) => entry.src === item.src) === index);
}

export function filterImpressions(items: ImpressionShot[], topic: ImpressionTopic | 'alle') {
  if (topic === 'alle') return items;
  return items.filter((item) => item.topic === topic);
}

export function remapImpressionsHref(href: string, label?: string) {
  if (href === '#impressionen' || label === 'Impressionen') return '/impressionen';
  return href;
}

export function classifyImpressionShape(width: number, height: number): ImpressionShape {
  if (!width || !height) return 'wide';
  const ratio = width / height;
  if (ratio >= 1.35) return 'wide';
  if (ratio <= 0.82) return 'tall';
  return 'square';
}

export function groupImpressionsByTopic(shots: ImpressionShot[]) {
  const order: ImpressionTopic[] = [];
  for (const shot of shots) {
    if (!order.includes(shot.topic)) order.push(shot.topic);
  }
  return order.flatMap((topic) => shots.filter((shot) => shot.topic === topic));
}

export function packImpressions(
  shots: ImpressionShot[],
  shapes: Record<string, ImpressionShape> = {}
): PackedImpression[] {
  const unused = groupImpressionsByTopic(shots);
  const packed: PackedImpression[] = [];
  let slot = 0;

  while (unused.length) {
    const { role, wants } = MOSAIC_PATTERN[slot % MOSAIC_PATTERN.length];
    const topic = unused[0].topic;
    const shapeOf = (shot: ImpressionShot) => shapes[shot.src] ?? shot.shape ?? 'wide';
    const pick =
      unused.find((shot) => shot.topic === topic && wants.includes(shapeOf(shot))) ??
      unused.find((shot) => shot.topic === topic) ??
      unused.find((shot) => wants.includes(shapeOf(shot))) ??
      unused[0];
    unused.splice(unused.indexOf(pick), 1);
    packed.push({ ...pick, role });
    slot += 1;
  }

  return packed;
}
