-- Organisations (customers) above hotels, with rights per organisation.
--
-- Before: every row in `admins` could edit every hotel.
-- After:
--   * `admins` stays the platform team: full access, manages templates, icons
--     and organisations.
--   * `organization_members` are people of one customer. They only see and
--     edit the hotels of their organisation:
--       owner / admin  -> edit content, hotels and invite people of the organisation
--       editor         -> edit content of the organisation's hotels
--   * `is_admin()` keeps its meaning "may open the admin area and the CMS".
--     Writes are checked per hotel with `can_edit_hotel()`.
-- Existing hotels move into the first organisation, so nothing changes for them.
--
-- Part 1 of 2: tables. Part 2 (026) adds the rights functions and policies.

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members (user_id);

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations (id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_hotels_organization ON hotels (organization_id);

ALTER TABLE admin_invites
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations (id) ON DELETE CASCADE;

ALTER TABLE admin_invites
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'editor';

ALTER TABLE admin_invites
  DROP CONSTRAINT IF EXISTS admin_invites_role_check;

ALTER TABLE admin_invites
  ADD CONSTRAINT admin_invites_role_check CHECK (role IN ('owner', 'admin', 'editor'));

GRANT SELECT, INSERT, UPDATE, DELETE ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_members TO authenticated;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- First organisation: every existing hotel belongs to it.
INSERT INTO organizations (slug, name)
VALUES ('privathotels-dr-lohbeck', 'Privathotels Dr. Lohbeck')
ON CONFLICT (slug) DO NOTHING;

UPDATE hotels
SET organization_id = (SELECT id FROM organizations WHERE slug = 'privathotels-dr-lohbeck')
WHERE organization_id IS NULL;
