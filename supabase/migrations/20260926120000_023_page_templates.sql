-- Page / template library: empty containers that hotels can opt into.

CREATE TABLE IF NOT EXISTS page_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  path_prefix text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  preview_url text,
  kind text NOT NULL DEFAULT 'system',
  layout_key text NOT NULL,
  section_keys text[] NOT NULL DEFAULT '{}',
  skeleton jsonb NOT NULL DEFAULT '{}',
  default_selected boolean NOT NULL DEFAULT false,
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  created_from_hotel_id uuid REFERENCES hotels (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_templates_kind_check CHECK (kind IN ('system', 'library'))
);

CREATE INDEX IF NOT EXISTS idx_page_templates_kind ON page_templates (kind, sort_order);
CREATE INDEX IF NOT EXISTS idx_page_templates_tags ON page_templates USING gin (tags);

INSERT INTO page_templates (
  template_key, title, description, path_prefix, tags, kind, layout_key, section_keys,
  skeleton, default_selected, required, sort_order
) VALUES
  ('home', 'Startseite', 'Grundlayout der Startseite als leerer Container.', '/', ARRAY['start','standard','home'], 'system', 'home',
    ARRAY['hero','welcome','highlight_strip','discover','direct_booking','offers','wellness','highlights','culinary','generations','awards','facts','faq_home_section','blog_page','newsletter'],
    '{}', true, true, 10),
  ('zimmer', 'Zimmer & Suiten', 'Zimmerübersicht und Zimmer-Detailseiten.', '/zimmer', ARRAY['zimmer','standard'], 'system', 'rooms',
    ARRAY['rooms_page'], '{}', true, false, 20),
  ('angebote', 'Angebote', 'Angebotsübersicht und Angebots-Details.', '/angebote', ARRAY['angebote','standard'], 'system', 'offers',
    ARRAY['offers_page'], '{}', true, false, 30),
  ('kulinarik', 'Restaurant / Kulinarik', 'Restaurantseite und kulinarische Bereiche.', '/kulinarik', ARRAY['restaurant','kulinarik','standard'], 'system', 'culinary',
    ARRAY['culinary_page'], '{}', true, false, 40),
  ('impressum', 'Impressum', 'Rechtliche Pflichtseite.', '/impressum', ARRAY['recht','standard'], 'system', 'legal',
    ARRAY['legal_impressum'], '{"legal_impressum":{"eyebrow":"","title":"Impressum","subtitle":"","hero_image":"","hero_image_alt":"","body":""}}', true, false, 50),
  ('datenschutz', 'Datenschutz', 'Datenschutzerklärung als leerer Container.', '/datenschutz', ARRAY['recht','standard'], 'system', 'legal',
    ARRAY['legal_datenschutz'], '{"legal_datenschutz":{"eyebrow":"","title":"Datenschutz","subtitle":"","hero_image":"","hero_image_alt":"","body":""}}', true, false, 60),
  ('wellness', 'Wellness', 'Wellness-Hub und Themen-Unterseiten.', '/wellness', ARRAY['wellness','spa'], 'system', 'wellness',
    ARRAY['wellness_page'], '{}', false, false, 70),
  ('blog', 'Journal / Blog', 'Beitragsübersicht und einzelne Artikel.', '/blog', ARRAY['blog','journal'], 'system', 'blog',
    ARRAY['blog_page'], '{}', false, false, 80),
  ('impressionen', 'Impressionen', 'Bildergalerie der Unterkunft.', '/impressionen', ARRAY['galerie','bilder'], 'system', 'impressions',
    ARRAY['impressions_page'], '{}', false, false, 90),
  ('faqs', 'FAQ', 'Fragen und Antworten.', '/faqs', ARRAY['faq','service'], 'system', 'faq',
    ARRAY['faq_page'], '{}', false, false, 100),
  ('agb', 'AGB', 'Allgemeine Geschäftsbedingungen.', '/agb', ARRAY['recht'], 'system', 'legal',
    ARRAY['legal_agb'], '{"legal_agb":{"eyebrow":"","title":"AGB","subtitle":"","hero_image":"","hero_image_alt":"","body":""}}', false, false, 110)
ON CONFLICT (template_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  path_prefix = EXCLUDED.path_prefix,
  tags = EXCLUDED.tags,
  layout_key = EXCLUDED.layout_key,
  section_keys = EXCLUDED.section_keys,
  default_selected = EXCLUDED.default_selected,
  required = EXCLUDED.required,
  sort_order = EXCLUDED.sort_order;

ALTER TABLE hotel_pages
  DROP CONSTRAINT IF EXISTS hotel_pages_page_key_check;

ALTER TABLE hotel_pages
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES page_templates (id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_hotels_seed_pages ON hotels;
DROP FUNCTION IF EXISTS seed_hotel_pages();

INSERT INTO hotel_pages (hotel_id, page_key, enabled, muster_version, template_id)
SELECT h.id, t.template_key, t.default_selected OR t.required, 'v1', t.id
FROM hotels h
CROSS JOIN page_templates t
WHERE t.kind = 'system'
ON CONFLICT (hotel_id, page_key) DO UPDATE SET
  template_id = COALESCE(hotel_pages.template_id, EXCLUDED.template_id);

ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_page_templates" ON page_templates;
CREATE POLICY "public_read_page_templates" ON page_templates FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_page_templates" ON page_templates;
CREATE POLICY "admin_write_page_templates" ON page_templates FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON page_templates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON page_templates TO authenticated;
