import { supabase, type Hotel, type HotelSection, type HotelFAQ } from './supabase';

export type HotelContent = {
  hotel: Hotel;
  sections: Record<string, Record<string, any>>;
  faqs: HotelFAQ[];
  pages: Record<string, boolean>;
};

const FALLBACK_SLUG = 'ambassador-hotel-spa';

function resolveDomain(): string {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname;
}

export async function loadHotelContent(): Promise<HotelContent> {
  const domain = resolveDomain();

  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .or(`domains.cs.{${domain}}`)
    .eq('is_active', true)
    .maybeSingle();

  let resolvedHotel: Hotel | null = hotel as Hotel | null;

  if (!resolvedHotel) {
    const { data: fallback } = await supabase
      .from('hotels')
      .select('*')
      .eq('slug', FALLBACK_SLUG)
      .eq('is_active', true)
      .maybeSingle();
    resolvedHotel = fallback as Hotel | null;
  }

  if (!resolvedHotel) {
    throw new Error('No hotel found for domain: ' + domain);
  }

  const hotelId = resolvedHotel.id;

  const [sectionsResult, faqsResult, pagesResult] = await Promise.all([
    supabase.from('hotel_sections').select('*').eq('hotel_id', hotelId),
    supabase
      .from('hotel_faqs')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('sort_order', { ascending: true }),
    supabase.from('hotel_pages').select('page_key, enabled').eq('hotel_id', hotelId),
  ]);

  const sectionsMap: Record<string, Record<string, any>> = {};
  for (const s of (sectionsResult.data as HotelSection[] | null) ?? []) {
    sectionsMap[s.section_key] = s.data;
  }

  const pages: Record<string, boolean> = {};
  for (const row of pagesResult.data ?? []) {
    pages[row.page_key] = row.enabled !== false;
  }

  return {
    hotel: resolvedHotel,
    sections: sectionsMap,
    faqs: (faqsResult.data as HotelFAQ[] | null) ?? [],
    pages,
  };
}
