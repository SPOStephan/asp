-- Sample data for the member portal (development and demos only, never part of a migration).
--
-- Fills one existing portal account with a fictitious guest: stays in the group's hotels,
-- points, a redeemed reward and a few benefits with pictures from the hotels' own pages.
--
-- 1. Register an account in the portal (e.g. demo@<your domain>) and confirm the address.
-- 2. Enter that address and the organisation below, then run this file in the SQL editor.
-- 3. Running it again resets the sample data. The block at the end removes it completely.
--
-- Everything created here is marked: booking numbers start with DEMO-, codes with DEMO-,
-- the sample benefits have fixed ids d0000000-0000-4000-8000-0000000000xx.

DO $demo$
DECLARE
  demo_email text := 'demo@example.com';       -- ← the account to fill
  org_slug text := 'privathotels-dr-lohbeck';  -- ← the hotel group
  org uuid;
  uid uuid;
  hotel_ids uuid[];
  hotel_names text[];
  pictures text[];
  h1 int := 1;
  h2 int := 1;
  stay record;
  redemption uuid;
BEGIN
  SELECT id INTO org FROM organizations WHERE slug = org_slug;
  IF org IS NULL THEN
    RAISE EXCEPTION 'Organisation "%" nicht gefunden', org_slug;
  END IF;
  SELECT id INTO uid FROM auth.users WHERE lower(email) = lower(demo_email);
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Kein Konto mit der Adresse % – bitte zuerst im Portal registrieren', demo_email;
  END IF;

  -- Hotels with a picture on their start page first (real houses before empty test hotels).
  SELECT array_agg(h.id ORDER BY (s.data->>'hero_image' > '') IS TRUE DESC, h.name),
         array_agg(h.name ORDER BY (s.data->>'hero_image' > '') IS TRUE DESC, h.name)
  INTO hotel_ids, hotel_names
  FROM hotels h
  LEFT JOIN hotel_sections s ON s.hotel_id = h.id AND s.section_key = 'hero'
  WHERE h.organization_id = org AND h.is_active;
  IF hotel_ids IS NULL THEN
    RAISE EXCEPTION 'Die Organisation hat keine aktiven Hotels';
  END IF;
  IF array_length(hotel_ids, 1) > 1 THEN
    h2 := 2;
  END IF;

  -- Pictures from the hotels' own pages (any image address stored in their sections).
  SELECT array_agg(url ORDER BY md5(url)) INTO pictures FROM (
    SELECT DISTINCT url FROM (
      SELECT value #>> '{}' AS url
      FROM hotel_sections s
      JOIN hotels h ON h.id = s.hotel_id AND h.organization_id = org,
      LATERAL jsonb_path_query(s.data, 'lax $.**') AS value
      WHERE jsonb_typeof(value) = 'string'
        AND value #>> '{}' ~* '^https?://\S+\.(webp|jpe?g)(\?\S*)?$'
        AND value #>> '{}' !~* 'logo|icon|favicon'
    ) found
  ) pics;
  pictures := coalesce(pictures, ARRAY[]::text[]) || ARRAY['', '', '', '', '', '', '', ''];

  INSERT INTO loyalty_programs (organization_id) VALUES (org) ON CONFLICT DO NOTHING;

  -- The guest: member for a little more than two years. The guard trigger keeps "member since"
  -- unchanged for normal edits, so it is paused for this one statement.
  ALTER TABLE loyalty_members DISABLE TRIGGER loyalty_members_guard;
  INSERT INTO loyalty_members (user_id, organization_id, member_number, email, first_name, last_name, phone, birthday, favourite_hotel_id, marketing_opt_in, created_at)
  VALUES (uid, org, '20240117', demo_email, 'Julia', 'Sommer', '+49 170 1234567', '1984-06-12', hotel_ids[h1], true, now() - interval '26 months')
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = 'Julia', last_name = 'Sommer', phone = '+49 170 1234567', birthday = '1984-06-12',
    favourite_hotel_id = hotel_ids[h1], marketing_opt_in = true, created_at = now() - interval '26 months';
  ALTER TABLE loyalty_members ENABLE TRIGGER loyalty_members_guard;

  -- Reset earlier sample data.
  DELETE FROM loyalty_ledger WHERE member_id = uid AND ((stay_id IS NULL AND redemption_id IS NULL AND reason IN ('Willkommensbonus', 'Geburtstagsbonus')) OR stay_id IN (SELECT id FROM loyalty_stays WHERE organization_id = org AND booking_ref LIKE 'DEMO-%') OR redemption_id IN (SELECT id FROM loyalty_redemptions WHERE member_id = uid AND code LIKE 'DEMO-%'));
  DELETE FROM loyalty_redemptions WHERE member_id = uid AND code LIKE 'DEMO-%';
  DELETE FROM loyalty_stays WHERE organization_id = org AND booking_ref LIKE 'DEMO-%';
  DELETE FROM loyalty_benefits WHERE id::text LIKE 'd0000000-0000-4000-8000-0000000000%';

  -- Benefits: what every member gets, what comes with a higher tier, rewards for points.
  INSERT INTO loyalty_benefits (id, organization_id, kind, title, description, image, min_tier, points_cost, sort_order) VALUES
    ('d0000000-0000-4000-8000-000000000001', org, 'rate', 'Mitgliederpreis: 10 % auf jede Übernachtung', 'Beim Buchen über Ihr Mitgliederkonto automatisch eingerechnet – in allen Häusern der Gruppe.', pictures[1], '', NULL, 1),
    ('d0000000-0000-4000-8000-000000000002', org, 'perk', 'Willkommensgetränk', 'Ein Glas Crémant oder ein alkoholfreier Cocktail an der Bar – zur Begrüßung bei jeder Anreise.', pictures[2], '', NULL, 2),
    ('d0000000-0000-4000-8000-000000000003', org, 'perk', 'Late Check-out bis 14 Uhr', 'Länger ausschlafen, in Ruhe frühstücken – am Abreisetag nach Verfügbarkeit.', pictures[3], 'silber', NULL, 3),
    ('d0000000-0000-4000-8000-000000000004', org, 'perk', 'Zimmer-Upgrade bei Anreise', 'Wenn frei, wohnen Sie eine Kategorie höher – ohne Aufpreis.', pictures[4], 'gold', NULL, 4),
    ('d0000000-0000-4000-8000-000000000005', org, 'reward', 'Frühstück ans Bett', 'Für zwei Personen, serviert zur Wunschzeit.', pictures[5], '', 800, 5),
    ('d0000000-0000-4000-8000-000000000006', org, 'reward', 'Wellness-Gutschein 50 €', 'Für Massagen und Anwendungen im Spa Ihres Hotels.', pictures[6], '', 1500, 6),
    ('d0000000-0000-4000-8000-000000000007', org, 'reward', 'Dinner für zwei', 'Drei-Gänge-Menü mit Weinbegleitung im Hotelrestaurant.', pictures[7], '', 3000, 7),
    ('d0000000-0000-4000-8000-000000000008', org, 'reward', 'Gratisnacht im Doppelzimmer', 'Eine Übernachtung inklusive Frühstück für zwei – in einem Haus Ihrer Wahl.', pictures[8], '', 8000, 8);

  -- Stays: completed ones earn points through the trigger, as in real life.
  FOR stay IN
    SELECT * FROM (VALUES
      ('DEMO-1001', h2, -600, 3, 'Doppelzimmer Komfort', 2, 780.00, 'ota', 'stayed'),
      ('DEMO-1002', h1, -420, 4, 'Doppelzimmer mit Meerblick', 2, 1240.00, 'direct', 'stayed'),
      ('DEMO-1003', h1, -220, 2, 'Doppelzimmer Komfort', 2, 520.00, 'direct', 'cancelled'),
      ('DEMO-1004', h2, -300, 2, 'Junior Suite', 2, 690.00, 'direct', 'stayed'),
      ('DEMO-1005', h1, -160, 5, 'Spa-Suite', 2, 1680.00, 'portal', 'stayed'),
      ('DEMO-1006', h2, -45, 2, 'Doppelzimmer Deluxe', 2, 520.00, 'direct', 'stayed'),
      ('DEMO-1007', h1, 38, 3, 'Doppelzimmer mit Meerblick', 2, 960.00, 'portal', 'booked'),
      ('DEMO-1008', h2, 96, 2, 'Junior Suite', 2, 640.00, 'direct', 'booked')
    ) AS s (ref, hotel, starts, nights, room, guests, amount, channel, status)
  LOOP
    INSERT INTO loyalty_stays (organization_id, hotel_id, hotel_name, member_id, guest_email, guest_name, booking_ref, arrival, departure, room, guests, amount_eur, channel, status)
    VALUES (org, hotel_ids[stay.hotel], hotel_names[stay.hotel], uid, demo_email, 'Julia Sommer', stay.ref,
            current_date + stay.starts, current_date + stay.starts + stay.nights, stay.room, stay.guests, stay.amount, stay.channel, stay.status);
  END LOOP;

  -- Points are booked on the day of departure.
  UPDATE loyalty_ledger l SET created_at = s.departure::timestamptz + interval '10 hours'
  FROM loyalty_stays s WHERE l.stay_id = s.id AND s.booking_ref LIKE 'DEMO-%' AND l.member_id = uid;

  -- Bonuses and a reward the guest has already used.
  INSERT INTO loyalty_ledger (organization_id, member_id, points, reason, created_at, expires_at) VALUES
    (org, uid, 400, 'Willkommensbonus', now() - interval '26 months' + interval '5 days', now() + interval '10 months'),
    (org, uid, 250, 'Geburtstagsbonus', date_trunc('year', now()) + interval '5 months 11 days', now() + interval '30 months');
  INSERT INTO loyalty_redemptions (member_id, benefit_id, title, points, code, status, created_at)
  VALUES (uid, 'd0000000-0000-4000-8000-000000000006', 'Wellness-Gutschein 50 €', 1500, 'DEMO-SPA50', 'used', now() - interval '150 days')
  RETURNING id INTO redemption;
  INSERT INTO loyalty_ledger (organization_id, member_id, points, reason, redemption_id, created_at)
  VALUES (org, uid, -1500, 'Eingelöst: Wellness-Gutschein 50 €', redemption, now() - interval '150 days');

  RAISE NOTICE 'Musterdaten für % angelegt (% Hotels, % Bilder gefunden)', demo_email, array_length(hotel_ids, 1), array_length(pictures, 1) - 8;
END;
$demo$;

-- Remove the sample data again (run on its own, after setting the address):
--
-- DO $undo$
-- DECLARE uid uuid := (SELECT id FROM auth.users WHERE lower(email) = lower('demo@example.com'));
-- BEGIN
--   DELETE FROM loyalty_ledger WHERE member_id = uid;
--   DELETE FROM loyalty_redemptions WHERE member_id = uid;
--   DELETE FROM loyalty_stays WHERE booking_ref LIKE 'DEMO-%';
--   DELETE FROM loyalty_benefits WHERE id::text LIKE 'd0000000-0000-4000-8000-0000000000%';
--   DELETE FROM loyalty_members WHERE user_id = uid;
-- END;
-- $undo$;
