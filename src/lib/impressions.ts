import { PLACEHOLDER_IMAGE } from './media';
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

// Neutral start for a hotel without its own gallery: no other hotel's pictures.
export const IMPRESSIONS_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Impressionen',
  subtitle: '',
  intro: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  note_title: '',
  note_text: '',
  note_cta: '',
  note_cta_href: '',
  items: [] as ImpressionShot[],
};

type RawShot = Partial<ImpressionShot> & { src?: string };

export function resolveImpressions(items?: RawShot[]): ImpressionShot[] {
  const raw = items ?? [];
  return raw
    .filter((item) => Boolean(item?.src))
    .map((item) => ({
      src: item.src as string,
      alt: item.alt ?? '',
      topic: item.topic ?? 'haus',
      shape: item.shape,
    }))
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
