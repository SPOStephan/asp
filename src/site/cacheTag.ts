// Every cached page of a hotel carries this tag, so a CMS save can drop them all at once.
export function siteCacheTag(hotelId: string) {
  return `hotel-${hotelId}`;
}
