import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const bakedUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const bakedAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export let supabaseConfigError: string | null = null;

export let supabase: SupabaseClient = createClient(
  bakedUrl || 'https://unavailable.invalid',
  bakedAnon || 'unavailable',
);

type PublicConfig = {
  url?: string | null;
  anon?: string | null;
};

async function loadPublicConfig(): Promise<PublicConfig> {
  const response = await fetch('/api/public-config');
  if (!response.ok) return {};
  return (await response.json()) as PublicConfig;
}

export async function initSupabase() {
  let url = bakedUrl;
  let anon = bakedAnon;

  if (!url || !anon) {
    try {
      const runtime = await loadPublicConfig();
      url = (runtime.url || '').trim();
      anon = (runtime.anon || '').trim();
    } catch {
      // keep empty; error below
    }
  }

  if (!url || !anon) {
    supabaseConfigError =
      'Supabase-Zugang kommt in diesem Admin-Build nicht an. Die Werte stehen in Vercel, werden aber nicht ins Frontend durchgereicht. Nach diesem Update holt die Seite sie zur Laufzeit von /api/public-config.';
    return;
  }

  supabase = createClient(url, anon);
  supabaseConfigError = null;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  domains: string[];
  phone: string | null;
  email: string | null;
  address: string | null;
  address_detail: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  heading_font: string;
  body_font: string;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  color_world?: 'blue' | 'red' | 'green';
  booking_url?: string | null;
}

export interface HotelSection {
  id: string;
  hotel_id: string;
  section_key: string;
  data: Record<string, any>;
}

export interface HotelImage {
  id: string;
  hotel_id: string;
  image_key: string;
  url: string;
  alt_text: string | null;
}

export interface HotelFAQ {
  id: string;
  hotel_id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  show_on_home: boolean;
}
