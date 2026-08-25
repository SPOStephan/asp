-- CMS foundation: admins, color worlds, media keys, tighter writes.
-- Portable Postgres. Supabase Auth is the current user store.

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS color_world text NOT NULL DEFAULT 'blue';

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS booking_url text;

ALTER TABLE hotels
  DROP CONSTRAINT IF EXISTS hotels_color_world_check;

ALTER TABLE hotels
  ADD CONSTRAINT hotels_color_world_check
  CHECK (color_world IN ('blue', 'red', 'green'));

UPDATE hotels
SET color_world = 'blue'
WHERE slug = 'ambassador-hotel-spa' AND (color_world IS NULL OR color_world = 'blue');

CREATE TABLE IF NOT EXISTS admin_invites (
  email text PRIMARY KEY,
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text,
  created_by uuid REFERENCES admins (user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels (id) ON DELETE CASCADE,
  bunny_path text NOT NULL UNIQUE,
  bunny_url text NOT NULL,
  alt_text text,
  focal jsonb,
  created_by uuid REFERENCES admins (user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_hotel_id ON media (hotel_id);

INSERT INTO admin_invites (email)
VALUES ('stephan@meererfolg.de')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claim_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()) THEN
    RETURN true;
  END IF;

  SELECT email INTO claim_email
  FROM auth.users
  WHERE id = auth.uid();

  IF claim_email IS NULL THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM admin_invites
    WHERE lower(email) = lower(claim_email)
      AND accepted_at IS NULL
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO admins (user_id, email)
  VALUES (auth.uid(), claim_email)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE admin_invites
  SET accepted_at = now()
  WHERE lower(email) = lower(claim_email)
    AND accepted_at IS NULL;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_admin() TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON admin_invites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admins TO authenticated;
GRANT SELECT ON media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON media TO authenticated;

ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_invites" ON admin_invites;
CREATE POLICY "admin_read_invites" ON admin_invites FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_write_invites" ON admin_invites;
CREATE POLICY "admin_write_invites" ON admin_invites FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_read_admins" ON admins;
CREATE POLICY "admin_read_admins" ON admins FOR SELECT
  TO authenticated USING (is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "admin_write_admins" ON admins;
CREATE POLICY "admin_write_admins" ON admins FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_media" ON media;
CREATE POLICY "public_read_media" ON media FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_media" ON media;
CREATE POLICY "admin_write_media" ON media FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "auth_insert_hotels" ON hotels;
DROP POLICY IF EXISTS "auth_update_hotels" ON hotels;
DROP POLICY IF EXISTS "auth_delete_hotels" ON hotels;
CREATE POLICY "admin_write_hotels" ON hotels FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "auth_insert_sections" ON hotel_sections;
DROP POLICY IF EXISTS "auth_update_sections" ON hotel_sections;
DROP POLICY IF EXISTS "auth_delete_sections" ON hotel_sections;
CREATE POLICY "admin_write_sections" ON hotel_sections FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "auth_insert_images" ON hotel_images;
DROP POLICY IF EXISTS "auth_update_images" ON hotel_images;
DROP POLICY IF EXISTS "auth_delete_images" ON hotel_images;
CREATE POLICY "admin_write_images" ON hotel_images FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "auth_insert_faqs" ON hotel_faqs;
DROP POLICY IF EXISTS "auth_update_faqs" ON hotel_faqs;
DROP POLICY IF EXISTS "auth_delete_faqs" ON hotel_faqs;
CREATE POLICY "admin_write_faqs" ON hotel_faqs FOR ALL
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
