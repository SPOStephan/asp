-- Loyalty programme of an organisation (hotel group): members log in at the member portal
-- (e.g. app.<group>.de), see their stays, collect points and redeem benefits.
--
--   loyalty_programs     settings per organisation (points per euro, tiers, stamp card …)
--   loyalty_members      one row per guest account (auth.users), with member number
--   loyalty_stays        stays and bookings, imported from the hotels or added by the team;
--                        linked to a member through the confirmed e-mail address
--   loyalty_ledger       points: + for stays and bonuses, − for redemptions
--   loyalty_benefits     benefits and member rates, group-wide or per hotel
--   loyalty_redemptions  benefits a member has redeemed
--
-- Guests only ever see their own rows. The organisation's owners/admins manage everything.

CREATE TABLE IF NOT EXISTS loyalty_programs (
  organization_id uuid PRIMARY KEY REFERENCES organizations (id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Treueprogramm',
  settings jsonb NOT NULL DEFAULT '{
    "points_per_euro": 1,
    "direct_bonus_percent": 25,
    "points_valid_months": 36,
    "tier_window_months": 24,
    "stamp_goal": 10,
    "tiers": [
      {"id": "classic", "name": "Classic", "min_points": 0},
      {"id": "silber", "name": "Silber", "min_points": 2500},
      {"id": "gold", "name": "Gold", "min_points": 7500}
    ]
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  member_number text NOT NULL UNIQUE,
  email text NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  birthday date,
  favourite_hotel_id uuid REFERENCES hotels (id) ON DELETE SET NULL,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_email ON loyalty_members (organization_id, lower(email));

CREATE TABLE IF NOT EXISTS loyalty_stays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels (id) ON DELETE SET NULL,
  hotel_name text NOT NULL DEFAULT '',
  member_id uuid REFERENCES loyalty_members (user_id) ON DELETE SET NULL,
  guest_email text NOT NULL DEFAULT '',
  guest_name text NOT NULL DEFAULT '',
  booking_ref text NOT NULL,
  arrival date NOT NULL,
  departure date NOT NULL,
  room text NOT NULL DEFAULT '',
  guests integer NOT NULL DEFAULT 1,
  amount_eur numeric(10, 2) NOT NULL DEFAULT 0,
  channel text NOT NULL DEFAULT 'direct' CHECK (channel IN ('direct', 'portal', 'ota', 'other')),
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'stayed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, booking_ref)
);
CREATE INDEX IF NOT EXISTS idx_loyalty_stays_member ON loyalty_stays (member_id, arrival);
CREATE INDEX IF NOT EXISTS idx_loyalty_stays_email ON loyalty_stays (organization_id, lower(guest_email));

CREATE TABLE IF NOT EXISTS loyalty_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels (id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'perk' CHECK (kind IN ('perk', 'reward', 'rate')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  min_tier text NOT NULL DEFAULT '',
  points_cost integer CHECK (points_cost IS NULL OR points_cost > 0),
  code text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  valid_until date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES loyalty_members (user_id) ON DELETE CASCADE,
  benefit_id uuid REFERENCES loyalty_benefits (id) ON DELETE SET NULL,
  title text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'used', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES loyalty_members (user_id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL DEFAULT '',
  stay_id uuid REFERENCES loyalty_stays (id) ON DELETE SET NULL,
  redemption_id uuid REFERENCES loyalty_redemptions (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_member ON loyalty_ledger (member_id, created_at);
-- A stay earns its points once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_ledger_stay ON loyalty_ledger (stay_id) WHERE stay_id IS NOT NULL AND points > 0;

-- Hotels must be readable by members (names and booking links in the portal).
GRANT SELECT ON loyalty_programs, loyalty_benefits TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON loyalty_programs, loyalty_members, loyalty_stays, loyalty_benefits, loyalty_redemptions, loyalty_ledger TO authenticated;

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS loyalty_programs_read ON loyalty_programs;
CREATE POLICY loyalty_programs_read ON loyalty_programs FOR SELECT USING (true);
DROP POLICY IF EXISTS loyalty_programs_manage ON loyalty_programs;
CREATE POLICY loyalty_programs_manage ON loyalty_programs FOR ALL TO authenticated
  USING (can_manage_org(organization_id)) WITH CHECK (can_manage_org(organization_id));

DROP POLICY IF EXISTS loyalty_members_own ON loyalty_members;
CREATE POLICY loyalty_members_own ON loyalty_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR can_manage_org(organization_id));
DROP POLICY IF EXISTS loyalty_members_update_own ON loyalty_members;
CREATE POLICY loyalty_members_update_own ON loyalty_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR can_manage_org(organization_id)) WITH CHECK (user_id = auth.uid() OR can_manage_org(organization_id));
DROP POLICY IF EXISTS loyalty_members_manage ON loyalty_members;
CREATE POLICY loyalty_members_manage ON loyalty_members FOR DELETE TO authenticated USING (can_manage_org(organization_id));

DROP POLICY IF EXISTS loyalty_stays_own ON loyalty_stays;
CREATE POLICY loyalty_stays_own ON loyalty_stays FOR SELECT TO authenticated USING (member_id = auth.uid() OR can_manage_org(organization_id));
DROP POLICY IF EXISTS loyalty_stays_manage ON loyalty_stays;
CREATE POLICY loyalty_stays_manage ON loyalty_stays FOR ALL TO authenticated
  USING (can_manage_org(organization_id)) WITH CHECK (can_manage_org(organization_id));

DROP POLICY IF EXISTS loyalty_benefits_read ON loyalty_benefits;
CREATE POLICY loyalty_benefits_read ON loyalty_benefits FOR SELECT USING (active OR can_manage_org(organization_id));
DROP POLICY IF EXISTS loyalty_benefits_manage ON loyalty_benefits;
CREATE POLICY loyalty_benefits_manage ON loyalty_benefits FOR ALL TO authenticated
  USING (can_manage_org(organization_id)) WITH CHECK (can_manage_org(organization_id));

DROP POLICY IF EXISTS loyalty_redemptions_own ON loyalty_redemptions;
CREATE POLICY loyalty_redemptions_own ON loyalty_redemptions FOR SELECT TO authenticated
  USING (member_id = auth.uid() OR EXISTS (SELECT 1 FROM loyalty_members m WHERE m.user_id = member_id AND can_manage_org(m.organization_id)));
DROP POLICY IF EXISTS loyalty_redemptions_manage ON loyalty_redemptions;
CREATE POLICY loyalty_redemptions_manage ON loyalty_redemptions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM loyalty_members m WHERE m.user_id = member_id AND can_manage_org(m.organization_id)));

DROP POLICY IF EXISTS loyalty_ledger_own ON loyalty_ledger;
CREATE POLICY loyalty_ledger_own ON loyalty_ledger FOR SELECT TO authenticated USING (member_id = auth.uid() OR can_manage_org(organization_id));
DROP POLICY IF EXISTS loyalty_ledger_manage ON loyalty_ledger;
CREATE POLICY loyalty_ledger_manage ON loyalty_ledger FOR INSERT TO authenticated WITH CHECK (can_manage_org(organization_id));

-- Points for a stay: amount × points per euro, plus the bonus for direct bookings.
CREATE OR REPLACE FUNCTION loyalty_stay_points(stay loyalty_stays)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT floor(
    stay.amount_eur
    * coalesce((p.settings->>'points_per_euro')::numeric, 1)
    * CASE WHEN stay.channel IN ('direct', 'portal') THEN 1 + coalesce((p.settings->>'direct_bonus_percent')::numeric, 0) / 100 ELSE 1 END
  )::integer
  FROM (SELECT 1) one
  LEFT JOIN loyalty_programs p ON p.organization_id = stay.organization_id;
$fn$;

-- A stay that is completed and belongs to a member earns its points (once).
CREATE OR REPLACE FUNCTION loyalty_award_stay()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  months integer;
  earned integer;
BEGIN
  IF NEW.status <> 'stayed' OR NEW.member_id IS NULL THEN
    RETURN NEW;
  END IF;
  earned := loyalty_stay_points(NEW);
  IF earned <= 0 THEN
    RETURN NEW;
  END IF;
  SELECT coalesce((settings->>'points_valid_months')::integer, 36) INTO months
  FROM loyalty_programs WHERE organization_id = NEW.organization_id;
  INSERT INTO loyalty_ledger (organization_id, member_id, points, reason, stay_id, expires_at)
  VALUES (NEW.organization_id, NEW.member_id, earned,
          'Aufenthalt ' || coalesce(nullif(NEW.hotel_name, ''), 'im Hotel') || ' (' || to_char(NEW.arrival, 'DD.MM.YYYY') || ')',
          NEW.id, NEW.departure::timestamptz + make_interval(months => coalesce(months, 36)))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS loyalty_stays_award ON loyalty_stays;
CREATE TRIGGER loyalty_stays_award
  AFTER INSERT OR UPDATE OF status, member_id, amount_eur ON loyalty_stays
  FOR EACH ROW EXECUTE FUNCTION loyalty_award_stay();

-- Stays booked with the member's (confirmed) e-mail address become the member's.
CREATE OR REPLACE FUNCTION loyalty_link_stays()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  me loyalty_members%ROWTYPE;
  confirmed boolean;
  linked integer;
BEGIN
  SELECT * INTO me FROM loyalty_members WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  SELECT email_confirmed_at IS NOT NULL INTO confirmed FROM auth.users WHERE id = auth.uid();
  IF NOT coalesce(confirmed, false) THEN
    RETURN 0;
  END IF;
  UPDATE loyalty_stays
  SET member_id = me.user_id, updated_at = now()
  WHERE organization_id = me.organization_id
    AND member_id IS NULL
    AND lower(guest_email) = lower(me.email);
  GET DIAGNOSTICS linked = ROW_COUNT;
  RETURN linked;
END;
$fn$;

-- Becomes a member (or returns the existing membership).
CREATE OR REPLACE FUNCTION loyalty_join(org_slug text, first_name text DEFAULT '', last_name text DEFAULT '', marketing boolean DEFAULT false)
RETURNS loyalty_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  org uuid;
  me loyalty_members%ROWTYPE;
  mail text;
  candidate text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht angemeldet';
  END IF;
  SELECT * INTO me FROM loyalty_members WHERE user_id = auth.uid();
  IF FOUND THEN
    RETURN me;
  END IF;
  SELECT id INTO org FROM organizations WHERE slug = org_slug;
  IF org IS NULL THEN
    SELECT id INTO org FROM organizations ORDER BY created_at LIMIT 1;
  END IF;
  INSERT INTO loyalty_programs (organization_id) VALUES (org) ON CONFLICT DO NOTHING;
  SELECT email INTO mail FROM auth.users WHERE id = auth.uid();
  LOOP
    candidate := lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM loyalty_members WHERE member_number = candidate);
  END LOOP;
  INSERT INTO loyalty_members (user_id, organization_id, member_number, email, first_name, last_name, marketing_opt_in)
  VALUES (auth.uid(), org, candidate, coalesce(mail, ''), coalesce(first_name, ''), coalesce(last_name, ''), coalesce(marketing, false))
  RETURNING * INTO me;
  PERFORM loyalty_link_stays();
  RETURN me;
END;
$fn$;

-- Everything the member portal shows at the top: balance, tier, progress, stamp card.
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
  stamps integer;
  goal integer;
BEGIN
  SELECT * INTO me FROM loyalty_members WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT * INTO program FROM loyalty_programs WHERE organization_id = me.organization_id;
  window_months := coalesce((program.settings->>'tier_window_months')::integer, 24);
  goal := coalesce((program.settings->>'stamp_goal')::integer, 10);

  SELECT coalesce(sum(points), 0) INTO balance
  FROM loyalty_ledger WHERE member_id = me.user_id AND (expires_at IS NULL OR expires_at > now());

  SELECT coalesce(sum(points), 0) INTO qualifying
  FROM loyalty_ledger WHERE member_id = me.user_id AND points > 0 AND created_at > now() - make_interval(months => window_months);

  SELECT t INTO tier FROM jsonb_array_elements(coalesce(program.settings->'tiers', '[]'::jsonb)) t
  WHERE (t->>'min_points')::integer <= qualifying ORDER BY (t->>'min_points')::integer DESC LIMIT 1;
  SELECT t INTO next_tier FROM jsonb_array_elements(coalesce(program.settings->'tiers', '[]'::jsonb)) t
  WHERE (t->>'min_points')::integer > qualifying ORDER BY (t->>'min_points')::integer ASC LIMIT 1;

  SELECT count(*) INTO stamps FROM loyalty_stays
  WHERE member_id = me.user_id AND status = 'stayed' AND channel IN ('direct', 'portal');

  RETURN jsonb_build_object(
    'member', to_jsonb(me),
    'program', jsonb_build_object('name', coalesce(program.name, 'Treueprogramm'), 'settings', coalesce(program.settings, '{}'::jsonb)),
    'balance', balance,
    'qualifying_points', qualifying,
    'tier', tier,
    'next_tier', next_tier,
    'stamps', jsonb_build_object('count', stamps % goal, 'goal', goal, 'completed_cards', stamps / goal)
  );
END;
$fn$;

-- Redeems a benefit: checks tier and balance, books the points, returns the voucher code.
CREATE OR REPLACE FUNCTION loyalty_redeem(benefit uuid)
RETURNS loyalty_redemptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  me loyalty_members%ROWTYPE;
  item loyalty_benefits%ROWTYPE;
  summary jsonb;
  tiers jsonb;
  my_rank integer;
  needed_rank integer;
  voucher text;
  result loyalty_redemptions%ROWTYPE;
BEGIN
  SELECT * INTO me FROM loyalty_members WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kein Mitglied';
  END IF;
  SELECT * INTO item FROM loyalty_benefits WHERE id = benefit AND organization_id = me.organization_id AND active;
  IF NOT FOUND OR (item.valid_until IS NOT NULL AND item.valid_until < current_date) THEN
    RAISE EXCEPTION 'Vorteil nicht verfügbar';
  END IF;
  summary := loyalty_summary();
  IF item.min_tier <> '' THEN
    SELECT settings->'tiers' INTO tiers FROM loyalty_programs WHERE organization_id = me.organization_id;
    SELECT ord INTO my_rank FROM jsonb_array_elements(tiers) WITH ORDINALITY AS x(t, ord) WHERE t->>'id' = summary->'tier'->>'id';
    SELECT ord INTO needed_rank FROM jsonb_array_elements(tiers) WITH ORDINALITY AS x(t, ord) WHERE t->>'id' = item.min_tier;
    IF coalesce(my_rank, 0) < coalesce(needed_rank, 0) THEN
      RAISE EXCEPTION 'Dieser Vorteil gilt ab einer höheren Stufe';
    END IF;
  END IF;
  IF coalesce(item.points_cost, 0) > (summary->>'balance')::integer THEN
    RAISE EXCEPTION 'Nicht genug Punkte';
  END IF;
  voucher := coalesce(nullif(item.code, ''), upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)));
  INSERT INTO loyalty_redemptions (member_id, benefit_id, title, points, code)
  VALUES (me.user_id, item.id, item.title, coalesce(item.points_cost, 0), voucher)
  RETURNING * INTO result;
  IF coalesce(item.points_cost, 0) > 0 THEN
    INSERT INTO loyalty_ledger (organization_id, member_id, points, reason, redemption_id)
    VALUES (me.organization_id, me.user_id, -item.points_cost, 'Eingelöst: ' || item.title, result.id);
  END IF;
  RETURN result;
END;
$fn$;

-- Hotels of the group for the portal (booking links, pictures), also before login.
CREATE OR REPLACE FUNCTION loyalty_portal_hotels(org_slug text)
RETURNS TABLE (id uuid, name text, slug text, domains text[], booking_url text, address text, image text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT h.id, h.name, h.slug, h.domains, h.booking_url, h.address, coalesce(s.data->>'hero_image', '')
  FROM hotels h
  LEFT JOIN hotel_sections s ON s.hotel_id = h.id AND s.section_key = 'hero'
  WHERE h.is_active
    AND (
      h.organization_id = (SELECT o.id FROM organizations o WHERE o.slug = org_slug)
      OR NOT EXISTS (SELECT 1 FROM organizations o WHERE o.slug = org_slug)
    )
  ORDER BY h.name;
$fn$;

GRANT EXECUTE ON FUNCTION loyalty_join(text, text, text, boolean), loyalty_link_stays(), loyalty_summary(), loyalty_redeem(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION loyalty_portal_hotels(text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION loyalty_stay_points(loyalty_stays) FROM anon, authenticated;

-- Members may edit their own profile, not their number, programme or e-mail.
CREATE OR REPLACE FUNCTION loyalty_members_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF can_manage_org(OLD.organization_id) THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;
  NEW.user_id := OLD.user_id;
  NEW.organization_id := OLD.organization_id;
  NEW.member_number := OLD.member_number;
  NEW.email := OLD.email;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS loyalty_members_guard ON loyalty_members;
CREATE TRIGGER loyalty_members_guard BEFORE UPDATE ON loyalty_members FOR EACH ROW EXECUTE FUNCTION loyalty_members_guard();
