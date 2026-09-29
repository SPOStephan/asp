export function isHotelSlugConflict(message?: string | null) {
  return Boolean(message && /hotels_slug_key/i.test(message));
}

export function findHotelBySlug<T extends { slug: string }>(hotels: T[], slug: string) {
  const key = slug.trim().toLowerCase();
  if (!key) return undefined;
  return hotels.find((hotel) => hotel.slug.trim().toLowerCase() === key);
}
