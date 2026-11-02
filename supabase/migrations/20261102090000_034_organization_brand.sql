-- Brand assets of the hotel group, kept once for all its hotels (e.g. the owners' family
-- crest that is part of every hotel logo of the group), in organizations.settings->'brand'.
-- Websites read them through organization_brand(); without it they simply show none.
-- Repeatable; old and new website versions work with it.

CREATE OR REPLACE FUNCTION organization_brand(p_hotel uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT COALESCE(o.settings -> 'brand', '{}'::jsonb)
  FROM hotels h
  JOIN organizations o ON o.id = h.organization_id
  WHERE h.id = p_hotel AND h.is_active;
$fn$;

GRANT EXECUTE ON FUNCTION organization_brand(uuid) TO anon, authenticated;

-- Set one brand asset for the whole group of a hotel; owners/admins of the group only.
CREATE OR REPLACE FUNCTION set_organization_brand(p_hotel uuid, p_key text, p_value text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  org uuid;
BEGIN
  IF p_key NOT IN ('crest_image') THEN
    RAISE EXCEPTION 'Unbekanntes Markenmerkmal: %', p_key;
  END IF;
  SELECT organization_id INTO org FROM hotels WHERE id = p_hotel;
  IF org IS NULL OR NOT can_manage_org(org) THEN
    RETURN false;
  END IF;
  UPDATE organizations
  SET settings = COALESCE(settings, '{}'::jsonb)
    || jsonb_build_object('brand', COALESCE(settings -> 'brand', '{}'::jsonb) || jsonb_build_object(p_key, COALESCE(p_value, '')))
  WHERE id = org;
  RETURN true;
END;
$fn$;

GRANT EXECUTE ON FUNCTION set_organization_brand(uuid, text, text) TO authenticated;
