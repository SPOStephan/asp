-- Member portal, second step:
--   * the paper stamp card is gone: points, tiers and rewards replace it
--   * loyalty_summary() also returns the member's travel figures (stays, nights, hotels)
--   * loyalty_portal_info() gives the start page what everyone may see before login:
--     programme name, public settings (points, tiers, links) and the active benefits

UPDATE loyalty_programs SET settings = settings - 'stamp_goal' WHERE settings ? 'stamp_goal';

ALTER TABLE loyalty_programs ALTER COLUMN settings SET DEFAULT '{
  "points_per_euro": 1,
  "direct_bonus_percent": 25,
  "points_valid_months": 36,
  "tier_window_months": 24,
  "tiers": [
    {"id": "classic", "name": "Classic", "min_points": 0},
    {"id": "silber", "name": "Silber", "min_points": 2500},
    {"id": "gold", "name": "Gold", "min_points": 7500}
  ]
}'::jsonb;

-- Everything the member portal shows at the top: balance, tier, progress, travel figures.
CREATE OR REPLACE FUNCTION loyalty_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  me loyalty_members%ROWTYPE;
  program loyalty_programs%ROWTYPE;
  window_months integer;
  balance integer;
  qualifying integer;
  tier jsonb;
  next_tier jsonb;
  stats jsonb;
BEGIN
  SELECT * INTO me FROM loyalty_members WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT * INTO program FROM loyalty_programs WHERE organization_id = me.organization_id;
  window_months := coalesce((program.settings->>'tier_window_months')::integer, 24);

  SELECT coalesce(sum(points), 0) INTO balance
  FROM loyalty_ledger WHERE member_id = me.user_id AND (expires_at IS NULL OR expires_at > now());

  SELECT coalesce(sum(points), 0) INTO qualifying
  FROM loyalty_ledger WHERE member_id = me.user_id AND points > 0 AND created_at > now() - make_interval(months => window_months);

  SELECT t INTO tier FROM jsonb_array_elements(coalesce(program.settings->'tiers', '[]'::jsonb)) t
  WHERE (t->>'min_points')::integer <= qualifying ORDER BY (t->>'min_points')::integer DESC LIMIT 1;
  SELECT t INTO next_tier FROM jsonb_array_elements(coalesce(program.settings->'tiers', '[]'::jsonb)) t
  WHERE (t->>'min_points')::integer > qualifying ORDER BY (t->>'min_points')::integer ASC LIMIT 1;

  SELECT jsonb_build_object(
    'stays', count(*) FILTER (WHERE status = 'stayed'),
    'nights', coalesce(sum(departure - arrival) FILTER (WHERE status = 'stayed'), 0),
    'hotels', count(DISTINCT coalesce(hotel_id::text, hotel_name)) FILTER (WHERE status = 'stayed'),
    'upcoming', count(*) FILTER (WHERE status = 'booked' AND departure >= current_date)
  ) INTO stats
  FROM loyalty_stays WHERE member_id = me.user_id;

  RETURN jsonb_build_object(
    'member', to_jsonb(me),
    'program', jsonb_build_object('name', coalesce(program.name, 'Treueprogramm'), 'settings', coalesce(program.settings, '{}'::jsonb)),
    'balance', balance,
    'qualifying_points', qualifying,
    'tier', tier,
    'next_tier', next_tier,
    'stats', stats
  );
END;
$fn$;

-- What the start page of the portal shows before login. The member rate code stays private.
CREATE OR REPLACE FUNCTION loyalty_portal_info(org_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  WITH org AS (
    SELECT coalesce(
      (SELECT id FROM organizations WHERE slug = org_slug),
      (SELECT id FROM organizations ORDER BY created_at LIMIT 1)
    ) AS id
  )
  SELECT jsonb_build_object(
    'name', p.name,
    'settings', CASE WHEN p.settings IS NULL THEN NULL ELSE p.settings - 'member_rate_code' - 'member_rate_param' END,
    'benefits', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id', b.id, 'hotel_id', b.hotel_id, 'kind', b.kind, 'title', b.title, 'description', b.description,
        'image', b.image, 'min_tier', b.min_tier, 'points_cost', b.points_cost
      ) ORDER BY b.sort_order, b.created_at)
      FROM loyalty_benefits b
      WHERE b.organization_id = org.id AND b.active AND (b.valid_until IS NULL OR b.valid_until >= current_date)
    ), '[]'::jsonb)
  )
  FROM org
  LEFT JOIN loyalty_programs p ON p.organization_id = org.id;
$fn$;

GRANT EXECUTE ON FUNCTION loyalty_portal_info(text) TO anon, authenticated;
