import { PLACEHOLDER_IMAGE, resolveMedia } from './media';

import type { ListFilter } from './listFilters';

// Free per hotel; these are only the suggestions for hotels without their own filters.
export type RoomTag = string;

export type RoomFilterId = string;

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
  price_from: string;
  price_unit: string;
  tags: RoomTag[];
  amenities: string[];
  image: string;
  image_alt: string;
  hero_image: string;
  hero_image_alt: string;
  gallery: RoomGalleryImage[];
}

export const ROOM_FILTERS: ListFilter[] = [
  { id: 'zimmer', label: 'Zimmer' },
  { id: 'suite', label: 'Suiten' },
  { id: 'familie', label: 'Familie' },
];

// Neutral start for a hotel without its own rooms page: no other hotel's rooms or prices.
export const ROOMS_PAGE_FALLBACK = {
  eyebrow: '',
  title: 'Zimmer & Suiten',
  subtitle: '',
  intro: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  lookbook_label: 'Lookbook',
  price_note: '',
  note_title: '',
  note_text: '',
  note_cta: '',
  items: [] as RoomStory[],
};

const EMPTY_ROOM: RoomStory = {
  id: '',
  name: '',
  kicker: '',
  text: '',
  detail_text: [],
  size: '',
  view: '',
  occupancy: '',
  price_from: '',
  price_unit: '',
  tags: [],
  amenities: [],
  image: PLACEHOLDER_IMAGE,
  image_alt: '',
  hero_image: PLACEHOLDER_IMAGE,
  hero_image_alt: '',
  gallery: [],
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

// A room may belong to no filter at all: an empty list stays empty.
function asTags(value: unknown, fallback: RoomTag[]): RoomTag[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((tag): tag is RoomTag => typeof tag === 'string' && tag.trim() !== '');
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
  const raw = pageItems ?? [];
  return raw.map((item, index) => {
    const fallback = { ...EMPTY_ROOM, name: `Zimmer ${index + 1}` };
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
      price_from: item.price_from ?? fallback.price_from,
      price_unit: item.price_unit ?? fallback.price_unit,
      tags: asTags(item.tags, fallback.tags),
      amenities: item.amenities?.length ? item.amenities : fallback.amenities,
      image: resolveMedia(item.image || item.image_primary, fallback.image),
      image_alt: item.image_alt || item.image_primary_alt || fallback.image_alt,
      hero_image: resolveMedia(item.hero_image || item.image || item.image_primary, fallback.hero_image),
      hero_image_alt: item.hero_image_alt || item.image_alt || fallback.hero_image_alt,
      gallery: asGallery(item.gallery, fallback.gallery),
    };
  });
}

export function filterRooms(rooms: RoomStory[], filter: RoomFilterId) {
  if (filter === 'alle') return rooms;
  return rooms.filter((room) => room.tags.includes(filter));
}


export type AmenityIcon =
  | 'bed'
  | 'terrace'
  | 'view'
  | 'bath'
  | 'robe'
  | 'spa'
  | 'wifi'
  | 'tv'
  | 'minibar'
  | 'safe'
  | 'sitting'
  | 'family';

export interface RoomFeature {
  icon: AmenityIcon;
  label: string;
}

export function iconForAmenity(label: string): AmenityIcon {
  const value = label.toLowerCase();
  if (/zustell|baby|kind/.test(value)) return 'family';
  if (/sitz|wohn-schlaf/.test(value)) return 'sitting';
  if (/terrasse|balkon/.test(value)) return 'terrace';
  if (/meerblick|weitblick/.test(value)) return 'view';
  if (/wellness-bad|badezimmer|\bbad\b/.test(value)) return 'bath';
  if (/bademantel/.test(value)) return 'robe';
  if (/spa/.test(value)) return 'spa';
  if (/wlan|wifi/.test(value)) return 'wifi';
  if (/tv|fernseh/.test(value)) return 'tv';
  if (/minibar/.test(value)) return 'minibar';
  if (/safe/.test(value)) return 'safe';
  if (/bett|king/.test(value)) return 'bed';
  return 'spa';
}

export function expandRoomFeatures(room: RoomStory): RoomFeature[] {
  const labels = room.amenities.flatMap((item) => {
    if (item.includes(',')) {
      return item.split(',').map((part) => part.trim()).filter(Boolean);
    }
    if (/bademantel und spa/i.test(item)) {
      return ['Bademantel', 'Spa-Zugang'];
    }
    return [item];
  });
  return labels.map((label) => ({ icon: iconForAmenity(label), label }));
}

export function roomGalleryImages(room: RoomStory): RoomGalleryImage[] {
  const seen = new Set<string>();
  return [
    { src: room.hero_image || room.image, alt: room.hero_image_alt || room.image_alt },
    { src: room.image, alt: room.image_alt },
    ...room.gallery,
  ].filter((slide) => {
    if (!slide.src || seen.has(slide.src)) return false;
    seen.add(slide.src);
    return true;
  });
}

export function roomHref(id: string) {
  return `/zimmer/${id}`;
}

export function formatRoomPriceDetail(room: RoomStory) {
  return `${room.price_from} pro ${room.price_unit}`;
}

export function remapRoomsHref(href: string, label?: string) {
  if (label === 'Zimmer & Suiten' && (href === '#suiten' || href === '#highlights')) {
    return '/zimmer';
  }
  return href;
}
