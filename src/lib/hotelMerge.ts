import { keepLiveMedia } from '../cms/cmsDraft';
import type { HotelContent } from './hotelData';
import type { HotelFAQ } from './supabase';

export function mergeHotelLoad(
  incoming: HotelContent,
  current: HotelContent | null,
  pendingSections: Record<string, Record<string, unknown>> = {},
  pendingFaqs: HotelFAQ[] | null = null,
): HotelContent {
  const sections = { ...incoming.sections };
  if (current) {
    for (const [key, live] of Object.entries(current.sections)) {
      sections[key] = keepLiveMedia(sections[key] ?? {}, live);
    }
  }
  for (const [key, live] of Object.entries(pendingSections)) {
    sections[key] = keepLiveMedia(sections[key] ?? {}, live);
  }
  return {
    ...incoming,
    sections,
    faqs: pendingFaqs ?? current?.faqs ?? incoming.faqs,
  };
}
