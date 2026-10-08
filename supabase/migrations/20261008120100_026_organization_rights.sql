-- Organisations, part 2 of 2: rights functions and policies (tables are in 025).
-- Function bodies use $fn$ quoting, no blank lines and no SELECT ... INTO: the
-- Supabase SQL editor reads SELECT ... INTO as creating a table and appends
-- "ALTER TABLE <variable> ENABLE ROW LEVEL SECURITY", which then fails.

-- Rights ----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$fn$;

-- May open the admin area / CMS at all.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT is_platform_admin()
    OR EXISTS (SELECT 1 FROM organization_members WHERE user_id = auth.uid());
$fn$;

CREATE OR REPLACE FUNCTION can_manage_org(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = org AND user_id = auth.uid() AND role IN ('owner', 'admin')
    );
$fn$;

CREATE OR REPLACE FUNCTION can_edit_hotel(hotel uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT is_platform_admin()
    OR EXISTS (
      SELECT 1
      FROM hotels h
      JOIN organization_members m ON m.organization_id = h.organization_id
      WHERE h.id = hotel AND m.user_id = auth.uid()
    );
$fn$;

-- What the signed-in person may do, for the admin interface.
CREATE OR REPLACE FUNCTION my_access()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT jsonb_build_object(
    'platform', is_platform_admin(),
    'organizations', COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object('id', o.id, 'slug', o.slug, 'name', o.name, 'role', m.role) ORDER BY o.name)
        FROM organization_members m
        JOIN organizations o ON o.id = m.organization_id
        WHERE m.user_id = auth.uid()
      ),
      '[]'::jsonb
    )
  );
$fn$;

-- Accepting an invite: platform invite (no organisation) or organisation invite.
CREATE OR REPLACE FUNCTION claim_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  claim_email text;
  invite_org uuid;
  invite_role text;
  invite_found boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  claim_email := (SELECT u.email FROM auth.users u WHERE u.id = auth.uid());
  IF claim_email IS NOT NULL THEN
    invite_found := EXISTS (
      SELECT 1 FROM admin_invites i
      WHERE lower(i.email) = lower(claim_email) AND i.accepted_at IS NULL
    );
    invite_org := (
      SELECT i.organization_id FROM admin_invites i
      WHERE lower(i.email) = lower(claim_email) AND i.accepted_at IS NULL
      LIMIT 1
    );
    invite_role := (
      SELECT i.role FROM admin_invites i
      WHERE lower(i.email) = lower(claim_email) AND i.accepted_at IS NULL
      LIMIT 1
    );
    IF invite_found THEN
      IF invite_org IS NULL THEN
        INSERT INTO admins (user_id, email)
        VALUES (auth.uid(), claim_email)
        ON CONFLICT (user_id) DO NOTHING;
      ELSE
        INSERT INTO organization_members (organization_id, user_id, email, role)
        VALUES (invite_org, auth.uid(), claim_email, invite_role)
        ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;
      END IF;
      UPDATE admin_invites SET accepted_at = now()
      WHERE lower(email) = lower(claim_email) AND accepted_at IS NULL;
    END IF;
  END IF;
  RETURN is_admin();
END;
$fn$;

GRANT EXECUTE ON FUNCTION is_platform_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_manage_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_edit_hotel(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION my_access() TO authenticated;
GRANT EXECUTE ON FUNCTION claim_admin() TO authenticated;


-- Policies --------------------------------------------------------------------

DROP POLICY IF EXISTS "member_read_organizations" ON organizations;
CREATE POLICY "member_read_organizations" ON organizations FOR SELECT
  TO authenticated USING (
    is_platform_admin()
    OR EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organizations.id AND m.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "platform_write_organizations" ON organizations;
CREATE POLICY "platform_write_organizations" ON organizations FOR ALL
  TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "member_read_members" ON organization_members;
CREATE POLICY "member_read_members" ON organization_members FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR can_manage_org(organization_id));

DROP POLICY IF EXISTS "manager_write_members" ON organization_members;
CREATE POLICY "manager_write_members" ON organization_members FOR ALL
  TO authenticated USING (can_manage_org(organization_id)) WITH CHECK (can_manage_org(organization_id));

-- Platform team only.
DROP POLICY IF EXISTS "admin_read_admins" ON admins;
CREATE POLICY "admin_read_admins" ON admins FOR SELECT
  TO authenticated USING (is_platform_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "admin_write_admins" ON admins;
CREATE POLICY "admin_write_admins" ON admins FOR ALL
  TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- Invites: the platform team for anything, organisation managers for their organisation.
DROP POLICY IF EXISTS "admin_read_invites" ON admin_invites;
CREATE POLICY "admin_read_invites" ON admin_invites FOR SELECT
  TO authenticated USING (
    is_platform_admin() OR (organization_id IS NOT NULL AND can_manage_org(organization_id))
  );

DROP POLICY IF EXISTS "admin_write_invites" ON admin_invites;
CREATE POLICY "admin_write_invites" ON admin_invites FOR ALL
  TO authenticated USING (
    is_platform_admin() OR (organization_id IS NOT NULL AND can_manage_org(organization_id))
  ) WITH CHECK (
    is_platform_admin() OR (organization_id IS NOT NULL AND can_manage_org(organization_id))
  );

-- Hotels: organisation managers create and change hotels of their organisation.
DROP POLICY IF EXISTS "admin_write_hotels" ON hotels;
CREATE POLICY "admin_write_hotels" ON hotels FOR ALL
  TO authenticated USING (
    is_platform_admin() OR (organization_id IS NOT NULL AND can_manage_org(organization_id))
  ) WITH CHECK (
    is_platform_admin() OR (organization_id IS NOT NULL AND can_manage_org(organization_id))
  );

-- Content: anyone who may edit the hotel.
DROP POLICY IF EXISTS "admin_write_sections" ON hotel_sections;
CREATE POLICY "admin_write_sections" ON hotel_sections FOR ALL
  TO authenticated USING (can_edit_hotel(hotel_id)) WITH CHECK (can_edit_hotel(hotel_id));

DROP POLICY IF EXISTS "admin_write_images" ON hotel_images;
CREATE POLICY "admin_write_images" ON hotel_images FOR ALL
  TO authenticated USING (can_edit_hotel(hotel_id)) WITH CHECK (can_edit_hotel(hotel_id));

DROP POLICY IF EXISTS "admin_write_faqs" ON hotel_faqs;
CREATE POLICY "admin_write_faqs" ON hotel_faqs FOR ALL
  TO authenticated USING (can_edit_hotel(hotel_id)) WITH CHECK (can_edit_hotel(hotel_id));

DROP POLICY IF EXISTS "admin_write_hotel_pages" ON hotel_pages;
CREATE POLICY "admin_write_hotel_pages" ON hotel_pages FOR ALL
  TO authenticated USING (can_edit_hotel(hotel_id)) WITH CHECK (can_edit_hotel(hotel_id));

-- Media: hotel media by its editors, shared media by the platform team.
DROP POLICY IF EXISTS "admin_write_media" ON media;
CREATE POLICY "admin_write_media" ON media FOR ALL
  TO authenticated USING (
    CASE WHEN hotel_id IS NULL THEN is_platform_admin() ELSE can_edit_hotel(hotel_id) END
  ) WITH CHECK (
    CASE WHEN hotel_id IS NULL THEN is_platform_admin() ELSE can_edit_hotel(hotel_id) END
  );

-- The template and icon libraries are shared by all customers: platform team only.
DROP POLICY IF EXISTS "admin_write_page_templates" ON page_templates;
CREATE POLICY "admin_write_page_templates" ON page_templates FOR ALL
  TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());

DROP POLICY IF EXISTS "admin_write_cms_icons" ON cms_icons;
CREATE POLICY "admin_write_cms_icons" ON cms_icons FOR ALL
  TO authenticated USING (is_platform_admin()) WITH CHECK (is_platform_admin());

-- A domain may only point to one hotel. Otherwise one customer could add another
-- customer's domain to their own hotel and break that site.
CREATE OR REPLACE FUNCTION hotels_unique_domains()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  taken text;
BEGIN
  taken := (
    SELECT d
    FROM unnest(NEW.domains) AS d
    WHERE lower(d) NOT IN ('localhost', '127.0.0.1')
      AND EXISTS (
        SELECT 1 FROM hotels h, unnest(h.domains) AS other
        WHERE h.id <> NEW.id AND lower(other) = lower(d)
      )
    LIMIT 1
  );
  IF taken IS NOT NULL THEN
    RAISE EXCEPTION 'Die Domain % gehört bereits zu einem anderen Hotel.', taken;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS hotels_unique_domains ON hotels;
CREATE TRIGGER hotels_unique_domains
  BEFORE INSERT OR UPDATE OF domains ON hotels
  FOR EACH ROW EXECUTE FUNCTION hotels_unique_domains();
