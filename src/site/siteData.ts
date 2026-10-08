import type { SupabaseClient } from '@supabase/supabase-js';
import { repairMediaUrls, resolveDiscoverTiles } from '../lib/media';
import type { Hotel, HotelFAQ, HotelSection } from '../lib/supabase';

// Everything the site shows for one hotel. The browser and the server renderer
// load it the same way, so this file is the only place that knows the database.
export type HotelContent = {
  hotel: Hotel;
  sections: Record<string, Record<string, any>>;
  faqs: HotelFAQ[];
  pages: Record<string, boolean>;
};

import { REFERENCE_HOTEL_SLUG } from '../config/product';

export function normalizeSections(rows: Array<Pick<HotelSection, 'section_key' | 'data'>>) {
  const sections: Record<string, Record<string, any>> = {};
  for (const row of rows) {
    sections[row.section_key] = repairMediaUrls(row.data ?? {});
  }
  // Hotels created without copying the pilot have an empty Discover grid. Load the
  // Muster tiles into it so the page, the editor and image uploads share one list.
  if (sections.discover) {
    sections.discover = { ...sections.discover, tiles: resolveDiscoverTiles(sections.discover.tiles) };
  }
  return sections;
}

export async function loadSiteContent(client: SupabaseClient, domain: string): Promise<HotelContent> {
  const { data: hotel } = await client
    .from('hotels')
    .select('*')
    .or(`domains.cs.{${domain}}`)
    .eq('is_active', true)
    .maybeSingle();

  let resolvedHotel = hotel as Hotel | null;
  if (!resolvedHotel && REFERENCE_HOTEL_SLUG) {
    const { data: fallback } = await client
      .from('hotels')
      .select('*')
      .eq('slug', REFERENCE_HOTEL_SLUG)
      .eq('is_active', true)
      .maybeSingle();
    resolvedHotel = fallback as Hotel | null;
  }
  if (!resolvedHotel) throw new Error('No hotel found for domain: ' + domain);
  return loadHotelSiteContent(client, resolvedHotel);
}

// The same content for a hotel known by id (admin area, AI knowledge).
export async function loadSiteContentById(client: SupabaseClient, hotelId: string): Promise<HotelContent> {
  const { data: hotel, error } = await client.from('hotels').select('*').eq('id', hotelId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!hotel) throw new Error('Hotel nicht gefunden.');
  return loadHotelSiteContent(client, hotel as Hotel);
}

async function loadHotelSiteContent(client: SupabaseClient, resolvedHotel: Hotel): Promise<HotelContent> {
  const hotelId = resolvedHotel.id;
  const [sectionsResult, faqsResult, pagesResult] = await Promise.all([
    client.from('hotel_sections').select('section_key, data').eq('hotel_id', hotelId),
    client.from('hotel_faqs').select('*').eq('hotel_id', hotelId).order('sort_order', { ascending: true }),
    client.from('hotel_pages').select('page_key, enabled').eq('hotel_id', hotelId),
  ]);

  const pages: Record<string, boolean> = {};
  for (const row of pagesResult.data ?? []) {
    pages[row.page_key] = row.enabled !== false;
  }

  return {
    hotel: resolvedHotel,
    sections: normalizeSections((sectionsResult.data as HotelSection[] | null) ?? []),
    faqs: (faqsResult.data as HotelFAQ[] | null) ?? [],
    pages,
  };
}
