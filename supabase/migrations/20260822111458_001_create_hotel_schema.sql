/*
# Multi-Hotel Content Management Schema

1. New Tables
- hotels: master table, one row per hotel with domain mapping, contact info, theme
- hotel_sections: content blocks per hotel as JSONB, keyed by section name
- hotel_images: named image references per hotel (logos, hero, etc.)
- hotel_faqs: FAQ entries per hotel with categories and sort order
2. Security
- RLS enabled on all tables
- SELECT is public (anon + authenticated) for website reads
- INSERT/UPDATE/DELETE restricted to authenticated (for future admin dashboard)
*/

CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  domains text[] NOT NULL DEFAULT '{}',
  phone text,
  email text,
  address text,
  address_detail text,
  primary_color text NOT NULL DEFAULT '#1a3a4a',
  secondary_color text NOT NULL DEFAULT '#c8a96a',
  accent_color text NOT NULL DEFAULT '#2d5f6f',
  text_color text NOT NULL DEFAULT '#2a2a2a',
  background_color text NOT NULL DEFAULT '#ffffff',
  heading_font text NOT NULL DEFAULT 'Cormorant Garamond',
  body_font text NOT NULL DEFAULT 'Inter',
  seo_title text,
  seo_description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hotels" ON hotels;
CREATE POLICY "public_read_hotels" ON hotels FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_hotels" ON hotels;
CREATE POLICY "auth_insert_hotels" ON hotels FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_hotels" ON hotels;
CREATE POLICY "auth_update_hotels" ON hotels FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_hotels" ON hotels;
CREATE POLICY "auth_delete_hotels" ON hotels FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS hotel_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, section_key)
);

ALTER TABLE hotel_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_sections" ON hotel_sections;
CREATE POLICY "public_read_sections" ON hotel_sections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_sections" ON hotel_sections;
CREATE POLICY "auth_insert_sections" ON hotel_sections FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_sections" ON hotel_sections;
CREATE POLICY "auth_update_sections" ON hotel_sections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_sections" ON hotel_sections;
CREATE POLICY "auth_delete_sections" ON hotel_sections FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS hotel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  image_key text NOT NULL,
  url text NOT NULL,
  alt_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, image_key)
);

ALTER TABLE hotel_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_images" ON hotel_images;
CREATE POLICY "public_read_images" ON hotel_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_images" ON hotel_images;
CREATE POLICY "auth_insert_images" ON hotel_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_images" ON hotel_images;
CREATE POLICY "auth_update_images" ON hotel_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_images" ON hotel_images;
CREATE POLICY "auth_delete_images" ON hotel_images FOR DELETE
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS hotel_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  show_on_home boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hotel_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_faqs" ON hotel_faqs;
CREATE POLICY "public_read_faqs" ON hotel_faqs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_faqs" ON hotel_faqs;
CREATE POLICY "auth_insert_faqs" ON hotel_faqs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_faqs" ON hotel_faqs;
CREATE POLICY "auth_update_faqs" ON hotel_faqs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_faqs" ON hotel_faqs;
CREATE POLICY "auth_delete_faqs" ON hotel_faqs FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hotels_domains ON hotels USING GIN (domains);
CREATE INDEX IF NOT EXISTS idx_hotel_sections_hotel_id ON hotel_sections(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_images_hotel_id ON hotel_images(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_faqs_hotel_id ON hotel_faqs(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_faqs_sort ON hotel_faqs(hotel_id, sort_order);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hotels_updated ON hotels;
CREATE TRIGGER trg_hotels_updated BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_hotel_sections_updated ON hotel_sections;
CREATE TRIGGER trg_hotel_sections_updated BEFORE UPDATE ON hotel_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_hotel_images_updated ON hotel_images;
CREATE TRIGGER trg_hotel_images_updated BEFORE UPDATE ON hotel_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_hotel_faqs_updated ON hotel_faqs;
CREATE TRIGGER trg_hotel_faqs_updated BEFORE UPDATE ON hotel_faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
