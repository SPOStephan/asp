-- Muster pages per hotel. Missing rows mean enabled (current Ambassador behavior).

CREATE TABLE IF NOT EXISTS hotel_pages (
  hotel_id uuid NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
  page_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  muster_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (hotel_id, page_key)
);

ALTER TABLE hotel_pages
  DROP CONSTRAINT IF EXISTS hotel_pages_page_key_check;

ALTER TABLE hotel_pages
  ADD CONSTRAINT hotel_pages_page_key_check
  CHECK (page_key IN ('zimmer', 'wellness', 'angebote', 'kulinarik', 'blog', 'impressionen', 'faqs'));

CREATE INDEX IF NOT EXISTS idx_hotel_pages_hotel_id ON hotel_pages (hotel_id);

INSERT INTO hotel_pages (hotel_id, page_key, enabled, muster_version)
SELECT h.id, keys.page_key, true, 'v1'
FROM hotels h
CROSS JOIN (
  VALUES
    ('zimmer'),
    ('wellness'),
    ('angebote'),
    ('kulinarik'),
    ('blog'),
    ('impressionen'),
    ('faqs')
) AS keys(page_key)
ON CONFLICT (hotel_id, page_key) DO NOTHING;

CREATE OR REPLACE FUNCTION seed_hotel_pages()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO hotel_pages (hotel_id, page_key, enabled, muster_version)
  SELECT NEW.id, keys.page_key, true, 'v1'
  FROM (
    VALUES
      ('zimmer'),
      ('wellness'),
      ('angebote'),
      ('kulinarik'),
      ('blog'),
      ('impressionen'),
      ('faqs')
  ) AS keys(page_key)
  ON CONFLICT (hotel_id, page_key) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hotels_seed_pages ON hotels;
CREATE TRIGGER trg_hotels_seed_pages
AFTER INSERT ON hotels
FOR EACH ROW EXECUTE FUNCTION seed_hotel_pages();

ALTER TABLE hotel_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_hotel_pages" ON hotel_pages;
CREATE POLICY "public_read_hotel_pages" ON hotel_pages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_hotel_pages" ON hotel_pages;
CREATE POLICY "admin_write_hotel_pages" ON hotel_pages FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON hotel_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON hotel_pages TO authenticated;
