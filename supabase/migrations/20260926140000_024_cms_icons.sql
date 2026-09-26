CREATE TABLE IF NOT EXISTS cms_icons (
  name text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'lucide',
  svg text,
  image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cms_icons_kind_check CHECK (kind IN ('lucide', 'svg', 'image'))
);

CREATE INDEX IF NOT EXISTS idx_cms_icons_tags ON cms_icons USING gin (tags);

ALTER TABLE cms_icons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cms_icons" ON cms_icons;
CREATE POLICY "public_read_cms_icons" ON cms_icons FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_cms_icons" ON cms_icons;
CREATE POLICY "admin_write_cms_icons" ON cms_icons FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT ON cms_icons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON cms_icons TO authenticated;
