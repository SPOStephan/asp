import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
