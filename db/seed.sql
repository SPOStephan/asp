-- ============================================================
-- SEED DATA: ambassador hotel & spa
-- ============================================================
-- Run this in your Supabase SQL Editor AFTER running schema.sql
-- ============================================================

DO $$
DECLARE
  h_id uuid;
BEGIN
  -- Insert hotel
  INSERT INTO hotels (name, slug, domains, phone, email, address, address_detail, seo_title, seo_description)
  VALUES (
    'ambassador hotel & spa',
    'ambassador-hotel-spa',
    ARRAY['hotel-ambassador.de', 'www.hotel-ambassador.de', 'localhost'],
    '+49 (0) 4863 / 7090',
    'info@hotel-ambassador.de',
    'Im Bad 26, 25826 Sankt Peter-Ording',
    'Über die A23 bis Heide, dann weiter über die B5 und B203 Richtung Sankt Peter-Ording — das Hotel befindet sich direkt in der Ortsmitte Bad, ausgeschildert ab der Zufahrt.',
    'Ambassador Hotel & Spa · 5-Sterne Wellnesshotel an der Nordsee',
    '5-Sterne Wellnesshotel an der Nordsee in Sankt Peter-Ording. Spa, Fine Dining, Familienurlaub.'
  )
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
  RETURNING id INTO h_id;

  -- ========== SECTIONS ==========
  INSERT INTO hotel_sections (hotel_id, section_key, data) VALUES
  (h_id, 'hero', jsonb_build_object(
    'title', 'Ankommen. Aufatmen. Abschalten.',
    'subtitle', 'Ihre Auszeit im Ambassador Superior Hotel & Spa',
    'hero_image', '/asp-start01.jpg',
    'hero_image_alt', 'Ambassador Hotel & Spa am Meer'
  )),
  (h_id, 'welcome', jsonb_build_object(
    'title_line1', 'Willkommen in',
    'title_word_normal', 'der',
    'title_word_script', 'Familie',
    'subtitle', 'ambassador hotel & spa · Ihr 5-Sterne-Hotel an der Nordsee',
    'text_paragraph1', 'Umgeben von der Weite der Nordseeküste ist das ambassador hotel & spa der perfekte Ort für kostbare Auszeiten. Erleben Sie pure Entspannung im Spa-Bereich, genießen Sie kulinarische Höhepunkte und lassen Sie sich von der herzlichen Gastfreundschaft unserer Familie begeistern.',
    'text_paragraph2', 'Ihr Hotel in Sankt Peter-Ording für unvergessliche Urlaubsmomente am Meer.'
  )),
  (h_id, 'highlight_strip', jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'MapPin', 'title', 'Perfekte Lage', 'text', 'Direkt am Nordseestrand und mitten in der Natur'),
      jsonb_build_object('icon', 'BedDouble', 'title', 'Viel Komfort', 'text', 'Hochwertige Zimmer & Suiten zum Wohlfühlen'),
      jsonb_build_object('icon', 'Sparkles', 'title', 'Wellness', 'text', 'Großzügiger Spa-Bereich für Ruhe und neue Energie'),
      jsonb_build_object('icon', 'Bike', 'title', 'Aktivurlaub', 'text', 'Erlebnisse und Bewegung in jeder Jahreszeit'),
      jsonb_build_object('icon', 'Dog', 'title', 'Hunde willkommen', 'text', 'Gemeinsam ankommen und die Küste entdecken'),
      jsonb_build_object('icon', 'Zap', 'title', 'E-Ladesäulen', 'text', 'Moderne Doppel-Ladesäulen direkt am Hotel')
    )
  )),
  (h_id, 'discover', jsonb_build_object(
    'eyebrow', 'Das Resort auf einen Blick',
    'title', 'Entdecken Sie Ihr ambassador',
    'title_script_word', 'ambassador',
    'subtitle', 'Neun Welten, ein Haus — von der Suite bis zum Weitblick.',
    'feature_image_left', '/willkommen-spo-smart.jpg',
    'feature_image_left_alt', 'Ausblick auf das Meer mit Whirlpool',
    'feature_image_right', '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
    'feature_image_right_alt', 'Suite mit Meerblick und Balkon',
    'tiles', jsonb_build_array(
      jsonb_build_object('image', '/suite-room.webp', 'eyebrow', 'Übernachten', 'title', 'Zimmer & Suiten', 'href', '/zimmer'),
      jsonb_build_object('image', '/teaser-autumn.webp', 'eyebrow', 'Saison', 'title', 'Angebote', 'href', '/angebote'),
      jsonb_build_object('image', '/spa-wellness.webp', 'eyebrow', 'Wohlbefinden', 'title', 'Wellness & Spa', 'href', '#wellness'),
      jsonb_build_object('image', '/culinary-dining.webp', 'eyebrow', 'Genuss', 'title', 'Restaurant & Bar', 'href', '/kulinarik'),
      jsonb_build_object('image', '/autumn-aerial.webp', 'eyebrow', 'Region', 'title', 'Urlaub an der Nordsee', 'href', '#generations'),
      jsonb_build_object('image', '/collage-ski.webp', 'eyebrow', 'Winter', 'title', 'Strand & See', 'href', '#highlights'),
      jsonb_build_object('image', '/teaser-family.webp', 'eyebrow', 'Familie', 'title', 'Familienurlaub', 'href', '#generations'),
      jsonb_build_object('image', '/collage-mtb.webp', 'eyebrow', 'Aktiv', 'title', 'Erlebnisse', 'href', '#highlights'),
      jsonb_build_object('image', '/yoga-outdoor.webp', 'eyebrow', 'Balance', 'title', 'Yoga & Retreats', 'href', '#wellness')
    )
  )),
  (h_id, 'direct_booking', jsonb_build_object(
    'eyebrow', 'Ihr Vorteil',
    'title', 'Direktbuchung',
    'subtitle', 'Buchen Sie direkt bei uns — und sichern Sie sich diese Extra-Leistungen.',
    'cta_text', 'Jetzt direkt buchen',
    'cta_href', '#buchung',
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'BadgePercent', 'title', 'Bestpreisgarantie'),
      jsonb_build_object('icon', 'Car', 'title', 'Parkrabatt 10 € pro Nacht', 'text', 'nach Verfügbarkeit'),
      jsonb_build_object('icon', 'BedDouble', 'title', 'Alle Zimmerkategorien'),
      jsonb_build_object('icon', 'BadgeCheck', 'title', 'Sofortige Buchungsbestätigung'),
      jsonb_build_object('icon', 'Wifi', 'title', 'Kostenfreies WLAN'),
      jsonb_build_object('icon', 'Star', 'title', 'Stammgastpass-Vorteil')
    )
  )),
  (h_id, 'offers', jsonb_build_object(
    'title_line1', 'Unsere besten Angebote',
    'title_line2', 'für Ihre',
    'title_script', 'Nordsee-Ferien',
    'items', jsonb_build_array(
      jsonb_build_object(
        'title', 'Wellnessurlaub',
        'subtitle', 'Auszeit am Meer',
        'text', 'Genießen Sie zwei Übernachtungen an der Nordsee mit 50 € Wellnessguthaben und mehr …',
        'details', jsonb_build_array('3 Nächte', 'ab 655 Euro pro Person'),
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Mehr erfahren', 'href', '/angebote/wellnessurlaub'),
          jsonb_build_object('label', 'Jetzt buchen', 'href', '#buchung')
        ),
        'image_primary', '/teaser-suite.webp',
        'image_primary_alt', 'Suite im ambassador hotel & spa',
        'image_secondary', '/collage-dining1.webp',
        'image_secondary_alt', 'Kulinarik im Hotel'
      ),
      jsonb_build_object(
        'title', 'Feiertage',
        'subtitle', 'Weihnachten mit Meerblick',
        'text', 'Genießen Sie zwei Übernachtungen an der Nordsee mit 50 € Wellnessguthaben und mehr …',
        'details', jsonb_build_array('3 Nächte', 'ab 655 Euro pro Person'),
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Mehr erfahren', 'href', '/angebote/feiertage'),
          jsonb_build_object('label', 'Jetzt buchen', 'href', '#buchung')
        ),
        'image_primary', '/collage-pool.webp',
        'image_primary_alt', 'Poolbereich im ambassador hotel & spa',
        'image_secondary', '/teaser-spa.webp',
        'image_secondary_alt', 'Wellness und Spa'
      )
    )
  )),
  (h_id, 'wellness', jsonb_build_object(
    'eyebrow', 'Zeit für',
    'title', 'Wellness',
    'copy_eyebrow', 'Spa & Wellness',
    'copy_title', 'Wohlfühlen & Abschalten',
    'copy_text', 'Ein Kraftort aus Wasser, Dampf und Wärme. Zeit, die nur Ihnen gehört.',
    'copy_cta', 'Mehr erfahren',
    'copy_cta_href', '/wellness',
    'hero_image', '/spa-wellness.webp',
    'hero_image_alt', 'Spa-Bereich mit Blick auf die Nordsee',
    'collage_items', jsonb_build_array(
      jsonb_build_object('src', '/collage-pool.webp', 'alt', 'Infinitypool', 'className', 'wellness-scene__side wellness-scene__side--far-left'),
      jsonb_build_object('src', '/collage-relaxroom.webp', 'alt', 'Ruheraum', 'className', 'wellness-scene__side wellness-scene__side--left-top'),
      jsonb_build_object('src', '/autumn-aerial.webp', 'alt', 'Nordseelandschaft', 'className', 'wellness-scene__side wellness-scene__side--left-bottom'),
      jsonb_build_object('src', '/collage-terrace.webp', 'alt', 'Wellness-Terrasse', 'className', 'wellness-scene__side wellness-scene__side--right-top'),
      jsonb_build_object('src', '/collage-restroom.webp', 'alt', 'Wellnessbereich', 'className', 'wellness-scene__side wellness-scene__side--right-bottom'),
      jsonb_build_object('src', '/collage-treatment.webp', 'alt', 'Entspannungsraum', 'className', 'wellness-scene__side wellness-scene__side--far-right')
    )
  )),
  (h_id, 'culinary', jsonb_build_object(
    'eyebrow', 'Kulinarische Highlights genießen',
    'title_line1', 'Genuss, der',
    'title_line2_em', 'im Gedächtnis bleibt',
    'hero_image', '/culinary-dining.webp',
    'hero_image_alt', 'Fine Dining Restaurant',
    'text', 'Ob traditionelle norddeutsche Küche, Sushi, kreative Gerichte aus aller Welt oder vegane Köstlichkeiten — bei uns erleben Gäste kulinarische Vielfalt auf höchstem Niveau.',
    'extra_text', 'Ein Highlight unter den Luxushotels an der Nordsee: Unsere Restaurants verbinden regionale Tradition mit internationaler Inspiration. Jedes Gericht wird mit Produkten aus der Region zubereitet — vom frischen Nordseefisch bis zum Gemüse von den umliegenden Höfen.',
    'restaurants', jsonb_build_array(
      jsonb_build_object('image', '/collage-dining1.webp', 'alt', 'Gourmet Küche', 'eyebrow', 'Restaurant', 'name', 'Strandstube'),
      jsonb_build_object('image', '/collage-dining2.webp', 'alt', 'Steakhouse', 'eyebrow', 'Steakhouse', 'name', 'Grill & Dine')
    )
  )),
  (h_id, 'generations', jsonb_build_object(
    'eyebrow', 'Urlaub an der Nordsee',
    'title_line1', 'Für jede',
    'title_line2_em', 'Generation',
    'subtitle', 'Allein, zu zweit oder mit der ganzen Familie — bei uns erleben Sie Momente, die bleiben.',
    'images', jsonb_build_array(
      jsonb_build_object('src', '/collage-family.webp', 'alt', 'Familie', 'label', 'Familytime', 'caption', 'Gemeinsam Zeit verbringen', 'className', 'gen__item--tall'),
      jsonb_build_object('src', '/collage-friends.webp', 'alt', 'Freunde', 'label', 'Friendstime', 'caption', 'Genießen zu mehreren'),
      jsonb_build_object('src', '/teaser-yoga.webp', 'alt', 'Yoga', 'label', 'Solotime', 'caption', 'Zeit für sich allein', 'className', 'gen__item--wide'),
      jsonb_build_object('src', '/collage-terrace.webp', 'alt', 'Terrasse', 'label', 'Sunset', 'caption', 'Abende auf der Terrasse')
    )
  )),
  (h_id, 'awards', jsonb_build_object(
    'eyebrow', 'Ausgezeichnet',
    'title', 'Was uns besonders macht',
    'items', jsonb_build_array(
      jsonb_build_object('src', '/logo-ski.webp', 'label', 'Bestes Strandhotel'),
      jsonb_build_object('src', '/logo-spa.webp', 'label', 'Luxury Health & Spa'),
      jsonb_build_object('src', '/logo-dining.webp', 'label', 'Gault Millau · 2 Hauben'),
      jsonb_build_object('src', '/logo-family.webp', 'label', 'Top Family Resort')
    ),
    'impressions_script', 'Impressionen',
    'impressions_title', 'aus Ihrem Nordsee-Hotel',
    'impressions_cta', 'Alle Impressionen',
    'impressions_cta_href', '#impressionen',
    'impressions', jsonb_build_array(
      jsonb_build_object('src', '/collage-pool.webp', 'alt', 'Poolbereich mit Blick ins Weite'),
      jsonb_build_object('src', '/autumn-aerial.webp', 'alt', 'Luftaufnahme der Nordseeküste'),
      jsonb_build_object('src', '/collage-dining1.webp', 'alt', 'Kulinarik im Hotel'),
      jsonb_build_object('src', '/teaser-yoga.webp', 'alt', 'Yoga und Auszeit'),
      jsonb_build_object('src', '/teaser-suite.webp', 'alt', 'Suite im ambassador hotel & spa'),
      jsonb_build_object('src', '/collage-terrace.webp', 'alt', 'Terrasse am Abend'),
      jsonb_build_object('src', '/collage-night.webp', 'alt', 'Das Hotel bei Nacht'),
      jsonb_build_object('src', '/family-welcome.webp', 'alt', 'Ankommen im Nordsee-Hotel')
    )
  )),
  (h_id, 'highlights', jsonb_build_object(
    'eyebrow', 'Zimmer & Suiten',
    'title_line1', 'Gut einschlafen.',
    'title_line2_em', 'Erholt aufwachen.',
    'items', jsonb_build_array(
      jsonb_build_object('image', '/collage-ski.webp', 'title', 'Direkte Strandlage', 'text', 'Nur wenige Schritte bis zum Nordseestrand — Landaufenthalt mit maximalem Komfort.', 'link', 'Zum Resort'),
      jsonb_build_object('image', '/spa-wellness.webp', 'title', 'Großzügiger Spa-Bereich', 'text', 'Adults-Only-Bereiche, Familien-Spa, Aktiv- und Signature-Treatments.', 'link', 'Zum Wellnessbereich'),
      jsonb_build_object('image', '/teaser-family.webp', 'title', 'Familiengeführt & authentisch', 'text', 'Herzliche Gastfreundschaft seit drei Generationen.', 'link', 'Unsere Geschichte'),
      jsonb_build_object('image', '/collage-dining1.webp', 'title', 'Nordsee Cuisine', 'text', 'Fine Dining, regionales Steakhouse und Spezialitäten der Nordseeküste.', 'link', 'Restaurants entdecken'),
      jsonb_build_object('image', '/collage-kids.webp', 'title', 'Kinderbetreuung ab 0 Jahren', 'text', 'Abwechslungsreiches Programm für alle Altersklassen.', 'link', 'Familienurlaub'),
      jsonb_build_object('image', '/collage-mtb.webp', 'title', 'Nordsee-Lifestyle', 'text', 'Natur, frische Meeresluft und unvergessliche Ausblicke.', 'link', 'Erlebnisse')
    )
  )),
  (h_id, 'facts', jsonb_build_object(
    'eyebrow', 'Wichtige Informationen',
    'title', 'Auf einen Blick',
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'Clock', 'label', 'Check-in', 'value', 'ab 15:00 Uhr'),
      jsonb_build_object('icon', 'Clock', 'label', 'Check-out', 'value', 'bis 11:00 Uhr'),
      jsonb_build_object('icon', 'Car', 'label', 'Parken', 'value', 'Kostenlose Tiefgarage'),
      jsonb_build_object('icon', 'Plane', 'label', 'Flughafen Hamburg', 'value', '190 km · 2 Std.'),
      jsonb_build_object('icon', 'Utensils', 'label', 'Halbpension', 'value', 'Frühstück & 5-Gang-Menü'),
      jsonb_build_object('icon', 'Dumbbell', 'label', 'Spa-Bereich', 'value', 'täglich 07:00–20:00'),
      jsonb_build_object('icon', 'Dog', 'label', 'Hunde', 'value', 'willkommen · kostenfrei'),
      jsonb_build_object('icon', 'Wifi', 'label', 'WLAN', 'value', 'in allen Bereichen kostenlos')
    ),
    'location_label', 'Anreise:',
    'location_text', 'Im Bad 26, 25826 Sankt Peter-Ording, Deutschland. Über die A23 bis Heide, dann weiter über die B5 und B203 Richtung Sankt Peter-Ording — das Hotel befindet sich direkt in der Ortsmitte Bad, ausgeschildert ab der Zufahrt.'
  )),
  (h_id, 'newsletter', jsonb_build_object(
    'eyebrow', 'Immer up to date',
    'title_line1', 'Newsletter',
    'title_line2_em', 'abonnieren',
    'description', 'Exklusive Angebote, saisonale Highlights und Geschichten von der Nordsee — direkt in Ihr Postfach.',
    'note', 'Mit der Anmeldung stimmen Sie unseren Datenschutzbestimmungen zu.',
    'success_message', 'Vielen Dank! Sie sind angemeldet.'
  )),
  (h_id, 'footer', jsonb_build_object(
    'tagline', '5-Sterne Wellnesshotel an der Nordsee. Wo das Meer noch echt ist.',
    'col_explore_title', 'Entdecken',
    'col_explore_links', jsonb_build_array(
      jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
      jsonb_build_object('label', 'Angebote', 'href', '/angebote'),
      jsonb_build_object('label', 'Wellness & Spa', 'href', '#wellness'),
      jsonb_build_object('label', 'Kulinarik', 'href', '/kulinarik'),
      jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer')
    ),
    'col_service_title', 'Service',
    'col_service_links', jsonb_build_array(
      jsonb_build_object('label', 'Anreise', 'href', '#anreise'),
      jsonb_build_object('label', 'FAQ', 'href', '/faqs'),
      jsonb_build_object('label', 'Geschenkgutscheine', 'href', '#'),
      jsonb_build_object('label', 'Karriere', 'href', '#')
    )
  )),
  (h_id, 'navbar', jsonb_build_object(
    'menu_label', 'Menü',
    'links', jsonb_build_array(
      jsonb_build_object('label', 'Resort', 'href', '#welcome'),
      jsonb_build_object('label', 'Wellness', 'href', '/wellness'),
      jsonb_build_object('label', 'Kulinarik', 'href', '/kulinarik'),
      jsonb_build_object('label', 'Erlebnisse', 'href', '#highlights')
    ),
    'menu_groups', jsonb_build_array(
      jsonb_build_object('title', 'Zimmer & Suiten', 'links', jsonb_build_array(
        jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer'),
        jsonb_build_object('label', 'Für jede Generation', 'href', '#suiten'),
        jsonb_build_object('label', 'Direkt buchen', 'href', '#direktbuchung')
      )),
      jsonb_build_object('title', 'Angebote', 'links', jsonb_build_array(
        jsonb_build_object('label', 'Aktuelle Angebote', 'href', '/angebote'),
        jsonb_build_object('label', 'Wellnessurlaub', 'href', '/angebote/wellnessurlaub'),
        jsonb_build_object('label', 'Feiertage', 'href', '/angebote/feiertage')
      )),
      jsonb_build_object('title', 'Erlebnisse', 'links', jsonb_build_array(
        jsonb_build_object('label', 'Hotel-Highlights', 'href', '#highlights'),
        jsonb_build_object('label', 'Entdecken', 'href', '#discover'),
        jsonb_build_object('label', 'Impressionen', 'href', '#impressionen')
      )),
      jsonb_build_object('title', 'Wellness', 'links', jsonb_build_array(
        jsonb_build_object('label', 'Wohlfühlen & Abschalten', 'href', '#wellness'),
        jsonb_build_object('label', 'Spa & Wellness', 'href', '/wellness')
      )),
      jsonb_build_object('title', 'Kulinarik', 'links', jsonb_build_array(
        jsonb_build_object('label', 'Restaurant & Bar', 'href', '/kulinarik#restaurant'),
        jsonb_build_object('label', 'Strandstube', 'href', '/kulinarik#strandstube'),
        jsonb_build_object('label', 'Grill & Dine', 'href', '/kulinarik#grill')
      )),
      jsonb_build_object('title', 'Hotel', 'links', jsonb_build_array(
        jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
        jsonb_build_object('label', 'Anreise', 'href', '#anreise'),
        jsonb_build_object('label', 'FAQ', 'href', '/faqs'),
        jsonb_build_object('label', 'Newsletter', 'href', '#newsletter')
      ))
    ),
    'logo_white', '/ASP_Logo-weiss.png',
    'logo_normal', '/ASP_Logo-normal.png',
    'cta_text', 'Anfragen',
    'cta_solid_text', 'Buchen',
    'cta_solid_href', '#buchung',
    'lang_label', 'DE'
  )),
  (h_id, 'offers_page', jsonb_build_object(
    'eyebrow', 'Arrangements',
    'title', 'Unsere besten Angebote',
    'subtitle', 'Für Ihre Nordsee-Ferien',
    'intro', 'Zwei Arrangements, klar erzählt. Kein Buchungsraster — sondern zwei Geschichten vom Meer, mit allem was dazugehört.',
    'hero_image', '/teaser-autumn.webp',
    'hero_image_alt', 'Herbstlicht über Sankt Peter-Ording',
    'note_title', 'Ein anderes Arrangement?',
    'note_text', 'Wir stellen Ihnen gern ein individuelles Paket zusammen — passend zu Anreise, Anlass und Tempo.',
    'note_cta', 'Persönliche Beratung',
    'items', jsonb_build_array(
      jsonb_build_object(
        'id', 'wellnessurlaub',
        'title', 'Wellnessurlaub',
        'subtitle', 'Auszeit am Meer',
        'text', 'Drei Nächte zwischen Suite, Spa und Salzwasser. Ein Guthaben für Anwendungen, der Pool mit Weitblick und Zeit, die niemand plant.',
        'detail_text', jsonb_build_array(
          'Drei Nächte zwischen Suite, Spa und Salzwasser. Ein Guthaben für Anwendungen, der Pool mit Weitblick und Zeit, die niemand plant.',
          'Der Tag darf langsam beginnen: Frühstück ohne Uhr, ein Gang durch den Spa, Salz in der Luft. Am Nachmittag bleibt das Wellnessguthaben für die Anwendung, die gerade passt — oder für gar nichts, außer Wärme und Stille.',
          'Late Check-out nach Verfügbarkeit verlängert den letzten Vormittag. Kein Hetzen, kein früher Koffer. Nur noch einmal der Blick aufs Wasser.'
        ),
        'details', jsonb_build_array('3 Nächte', 'ab 655 Euro pro Person'),
        'travel_period_label', 'Reisezeitraum',
        'travel_period', 'September bis Dezember',
        'includes', jsonb_build_array(
          'Übernachtung mit Frühstück',
          '50 € Wellnessguthaben',
          'Zugang zum gesamten Spa',
          'Late Check-out nach Verfügbarkeit'
        ),
        'image', '/teaser-spa.webp',
        'image_alt', 'Wellness und Spa im ambassador hotel & spa',
        'hero_image', '/hotel-nordsee-wellness02.webp',
        'hero_image_alt', 'Wellnessbereich des ambassador hotel & spa'
      ),
      jsonb_build_object(
        'id', 'feiertage',
        'title', 'Feiertage',
        'subtitle', 'Weihnachten mit Meerblick',
        'text', 'Die stillen Tage am Deich. Festliche Menüs, ein helles Zimmer zum Meer und Abende, die länger werden als der Kalender.',
        'detail_text', jsonb_build_array(
          'Die stillen Tage am Deich. Festliche Menüs, ein helles Zimmer zum Meer und Abende, die länger werden als der Kalender.',
          'Weihnachten hier heißt: weniger Programm, mehr Licht. Ein Tisch, der für Sie gedeckt ist, Gänge, die zur Jahreszeit passen, und Zimmer, in denen der Horizont nah bleibt.',
          'Zur Anreise liegt eine kleine Aufmerksamkeit bereit. Der Spa steht offen — für ein Bad zwischen den Festtagen oder einfach für Wärme, wenn der Wind von See kommt.'
        ),
        'details', jsonb_build_array('3 Nächte', 'ab 655 Euro pro Person'),
        'travel_period_label', 'Reisezeitraum',
        'travel_period', 'November bis Januar',
        'includes', jsonb_build_array(
          'Übernachtung mit Frühstück',
          'Festtagsmenüs an den Feiertagen',
          'Zugang zum gesamten Spa',
          'Kleine Aufmerksamkeit zur Anreise'
        ),
        'image', '/collage-dining1.webp',
        'image_alt', 'Festliche Kulinarik im Hotel',
        'hero_image', '/culinary-dining.webp',
        'hero_image_alt', 'Festliche Tafel im Restaurant'
      )
    )
  )),
  (h_id, 'rooms_page', jsonb_build_object(
    'eyebrow', 'Ankommen',
    'title', 'Zimmer & Suiten',
    'subtitle', 'Meerblick · Ruhe · Weite',
    'intro', 'Sechs Räume, in denen das Licht der Nordsee den Takt vorgibt — vom stillen Doppelzimmer bis zur Suite mit eigener Terrasse. Die Preise gelten pro Nacht und Zimmer, je nach Saison und Belegung.',
    'hero_image', '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
    'hero_image_alt', 'Suite mit privater Terrasse und Blick ins Watt',
    'lookbook_label', 'Lookbook',
    'price_note', 'Alle Preise gelten pro Nacht und Zimmer, je nach Saison und Belegung.',
    'note_title', 'Nicht das passende Zimmer?',
    'note_text', 'Wir kennen jedes Zimmer im Haus. Schreiben Sie uns, was Sie brauchen — Blick, Größe, Anlass — wir finden die richtige Tür.',
    'note_cta', 'Persönliche Beratung',
    'items', jsonb_build_array(
      jsonb_build_object(
        'id', 'austernfischer',
        'name', 'Austernfischer Suite',
        'kicker', 'Signature Suite',
        'text', 'Die Suite mit dem weiten Horizont. Eine private Terrasse, Salz in der Luft und der Deich direkt vor dem Glas.',
        'detail_text', jsonb_build_array(
          'Die Suite mit dem weiten Horizont. Eine private Terrasse, Salz in der Luft und der Deich direkt vor dem Glas.',
          'Morgens liegt das Watt noch still. Von der Terrasse aus reicht der Blick über Gräser, Priel und Himmel — ohne dass jemand dazwischentritt. Drinnen bleibt der Raum ruhig: helles Holz, weiche Stoffe, ein Bad, das nicht hetzt.',
          'Der Spa liegt eine Etage tiefer. Bademantel an, Aufzug, Wärme. Zurück auf der Terrasse wird der Abend länger als der Kalender.'
        ),
        'size', 'ca. 65 m²',
        'view', 'Meerblick, private Terrasse',
        'occupancy', '2 Personen',
        'price_from', 'ab 530 Euro',
        'price_unit', 'Nacht',
        'tags', jsonb_build_array('suite', 'meerblick'),
        'amenities', jsonb_build_array(
          'Private Terrasse mit Weitblick',
          'King-Size-Bett',
          'Wellness-Bad',
          'Bademantel und Spa-Zugang',
          'WLAN, Smart-TV, Minibar, Safe'
        ),
        'image', '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
        'image_alt', 'Austernfischer Suite mit Terrasse zum Watt',
        'hero_image', '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
        'hero_image_alt', 'Private Terrasse der Austernfischer Suite',
        'gallery', jsonb_build_array(
          jsonb_build_object('src', '/suite-room.webp', 'alt', 'Suite mit Meerblick'),
          jsonb_build_object('src', '/collage-terrace.webp', 'alt', 'Terrasse mit Ausblick')
        )
      ),
      jsonb_build_object(
        'id', 'strandlaeufer',
        'name', 'Strandläufer Suite',
        'kicker', 'Suite',
        'text', 'Weit, hell, nah am Wasser. Eine Suite, in der der Horizont mit ins Zimmer kommt — und abends nicht wieder geht.',
        'detail_text', jsonb_build_array(
          'Weit, hell, nah am Wasser. Eine Suite, in der der Horizont mit ins Zimmer kommt — und abends nicht wieder geht.',
          'Die Strandläufer bleibt eine Suite zum Atmen: Sitzecke am Fenster, Platz für zwei, die nichts teilen müssen außer den Blick. Der Tag darf hier langsam beginnen.',
          'Unten wartet der Spa, oben bleibt die Stille. Genau so viel Programm, wie Sie zulassen.'
        ),
        'size', 'ca. 48 m²',
        'view', 'Meerblick',
        'occupancy', '2 Personen',
        'price_from', 'ab 330 Euro',
        'price_unit', 'Nacht',
        'tags', jsonb_build_array('suite', 'meerblick'),
        'amenities', jsonb_build_array(
          'Balkon oder Terrasse',
          'Sitzbereich mit Meerblick',
          'King-Size-Bett',
          'Bademantel und Spa-Zugang',
          'WLAN, Smart-TV, Minibar, Safe'
        ),
        'image', '/suite-room.webp',
        'image_alt', 'Strandläufer Suite mit Meerblick',
        'hero_image', '/suite-room.webp',
        'hero_image_alt', 'Helle Suite mit Blick zur Nordsee',
        'gallery', jsonb_build_array(
          jsonb_build_object('src', '/collage-terrace.webp', 'alt', 'Ausblick von der Terrasse'),
          jsonb_build_object('src', '/hotel-stpeter-ording-Austernfischer-Suite05.jpg', 'alt', 'Terrasse zum Watt')
        )
      ),
      jsonb_build_object(
        'id', 'junior-suite',
        'name', 'Junior Suite',
        'kicker', 'Suite',
        'text', 'Mehr Raum als ein Zimmer, weniger Zeremonie als eine große Suite. Licht, Ruhe und ein Platz zum Ankommen.',
        'detail_text', jsonb_build_array(
          'Mehr Raum als ein Zimmer, weniger Zeremonie als eine große Suite. Licht, Ruhe und ein Platz zum Ankommen.',
          'Die Junior Suite eignet sich für Paare, die Weite wollen, ohne ein zweites Wohnzimmer zu brauchen. Ein klarer Grundriss, ein ruhiges Bad, der Blick ins Land oder zur Küste.',
          'Frühstück ohne Uhr. Ein Gang durch den Spa. Zurück ins Zimmer, bevor der Nachmittag Pläne macht.'
        ),
        'size', 'ca. 38 m²',
        'view', 'Weitblick',
        'occupancy', '2 Personen',
        'price_from', 'ab 270 Euro',
        'price_unit', 'Nacht',
        'tags', jsonb_build_array('suite'),
        'amenities', jsonb_build_array(
          'Balkon oder Terrasse',
          'Offener Wohn-Schlafbereich',
          'Bademantel und Spa-Zugang',
          'WLAN, Smart-TV, Minibar, Safe'
        ),
        'image', '/teaser-suite.webp',
        'image_alt', 'Junior Suite im ambassador hotel & spa',
        'hero_image', '/teaser-suite.webp',
        'hero_image_alt', 'Junior Suite mit Sitzbereich',
        'gallery', jsonb_build_array(
          jsonb_build_object('src', '/collage-relaxroom.webp', 'alt', 'Ruhiger Aufenthaltsbereich'),
          jsonb_build_object('src', '/collage-restroom.webp', 'alt', 'Bad mit natürlichem Licht')
        )
      ),
      jsonb_build_object(
        'id', 'doppel-meerblick',
        'name', 'Doppelzimmer Meerblick',
        'kicker', 'Zimmer',
        'text', 'Das klassische Doppelzimmer — nur dass draußen das Meer arbeitet. Klein genug zum Zurückziehen, groß genug für zwei.',
        'detail_text', jsonb_build_array(
          'Das klassische Doppelzimmer — nur dass draußen das Meer arbeitet. Klein genug zum Zurückziehen, groß genug für zwei.',
          'Kein Wohnzimmer, kein Aufwand. Bett, Blick, Balkon. Morgens das Licht von See, abends der Wind im Gras. Dazwischen der Spa und ein Tisch im Haus.',
          'Wer den Horizont will, ohne eine Suite zu brauchen, bleibt hier richtig.'
        ),
        'size', 'ca. 28 m²',
        'view', 'Meerblick',
        'occupancy', '2 Personen',
        'price_from', 'ab 190 Euro',
        'price_unit', 'Nacht',
        'tags', jsonb_build_array('zimmer', 'meerblick'),
        'amenities', jsonb_build_array(
          'Balkon mit Meerblick',
          'Doppelbett',
          'Bademantel und Spa-Zugang',
          'WLAN, Smart-TV, Minibar, Safe'
        ),
        'image', '/collage-terrace.webp',
        'image_alt', 'Doppelzimmer mit Blick zur Nordsee',
        'hero_image', '/collage-terrace.webp',
        'hero_image_alt', 'Balkon mit Meerblick',
        'gallery', jsonb_build_array(
          jsonb_build_object('src', '/suite-room.webp', 'alt', 'Heller Zimmerblick'),
          jsonb_build_object('src', '/willkommen-spo-smart.jpg', 'alt', 'Ausblick aufs Watt')
        )
      ),
      jsonb_build_object(
        'id', 'familienzimmer',
        'name', 'Familienzimmer',
        'kicker', 'Zimmer',
        'text', 'Platz für die, die mitkommen. Ein Raum, der Kinder aushält und Eltern nicht vergisst — mit dem Spa und dem Strand in Reichweite.',
        'detail_text', jsonb_build_array(
          'Platz für die, die mitkommen. Ein Raum, der Kinder aushält und Eltern nicht vergisst — mit dem Spa und dem Strand in Reichweite.',
          'Zwei Zonen, ein Blick nach draußen. Zustellbett oder separates Kinderbett auf Wunsch. Unten wartet die Betreuung, draußen der Deich, im Haus ein Tisch, der nicht flüstert.',
          'Der Familien-Spa bleibt offen. Der Adults-Only-Bereich wartet, wenn Sie ihn brauchen.'
        ),
        'size', 'ca. 42 m²',
        'view', 'Landschaft',
        'occupancy', '2 Erwachsene, bis 2 Kinder',
        'price_from', 'ab 210 Euro',
        'price_unit', 'Nacht',
        'tags', jsonb_build_array('zimmer', 'familie'),
        'amenities', jsonb_build_array(
          'Platz für Zustellbett oder Babybett',
          'Balkon oder Terrasse',
          'Bademantel und Spa-Zugang',
          'WLAN, Smart-TV, Minibar, Safe'
        ),
        'image', '/teaser-family.webp',
        'image_alt', 'Familienzimmer im ambassador hotel & spa',
        'hero_image', '/teaser-family.webp',
        'hero_image_alt', 'Familienzimmer mit Platz für Kinder',
        'gallery', jsonb_build_array(
          jsonb_build_object('src', '/collage-family.webp', 'alt', 'Zeit zu zweit und mit Kindern'),
          jsonb_build_object('src', '/collage-kids.webp', 'alt', 'Familienurlaub an der Nordsee')
        )
      ),
      jsonb_build_object(
        'id', 'doppel-land',
        'name', 'Doppelzimmer Landseite',
        'kicker', 'Zimmer',
        'text', 'Ruhiger, grüner, näher am Ort. Ein klares Doppelzimmer für alle, die das Meer zu Fuß holen — und nachts Stille wollen.',
        'detail_text', jsonb_build_array(
          'Ruhiger, grüner, näher am Ort. Ein klares Doppelzimmer für alle, die das Meer zu Fuß holen — und nachts Stille wollen.',
          'Die Landseite liegt abgewandt vom offenen Horizont, nicht von der Landschaft. Balkon, Bett, Bad. Der Strand bleibt ein kurzer Weg, der Spa eine Etage.',
          'Gut für Paare, die den Preis der Lage lieber in Ruhe als in Quadratmetern messen.'
        ),
        'size', 'ca. 26 m²',
        'view', 'Landschaft',
        'occupancy', '2 Personen',
        'price_from', 'ab 150 Euro',
        'price_unit', 'Nacht',
        'tags', jsonb_build_array('zimmer'),
        'amenities', jsonb_build_array(
          'Balkon zur Landseite',
          'Doppelbett',
          'Bademantel und Spa-Zugang',
          'WLAN, Smart-TV, Minibar, Safe'
        ),
        'image', '/collage-relaxroom.webp',
        'image_alt', 'Doppelzimmer zur Landseite',
        'hero_image', '/collage-relaxroom.webp',
        'hero_image_alt', 'Ruhiges Doppelzimmer mit Landschaftsblick',
        'gallery', jsonb_build_array(
          jsonb_build_object('src', '/collage-restroom.webp', 'alt', 'Bad im Doppelzimmer'),
          jsonb_build_object('src', '/teaser-suite.webp', 'alt', 'Heller Aufenthalt im Haus')
        )
      )
    )
  )),
  (h_id, 'culinary_page', jsonb_build_object(
    'eyebrow', 'Kulinarik',
    'title', 'Genuss am Meer',
    'subtitle', 'Restaurant · Bar · Steakhouse',
    'intro', 'Norddeutsche Küche, Fine Dining und Grill — drei Adressen im Haus, eine Küche mit Produkten von der Küste und den Höfen ringsum. Halbpension, vegetarisch und vegan sind selbstverständlich.',
    'hero_image', '/culinary-dining.webp',
    'hero_image_alt', 'Gedeckter Tisch im Restaurant des ambassador hotel & spa',
    'also_title', 'Auch im Haus',
    'also_text', 'Sushi-Bar und Nordseelounge bleiben zwei leise Alternativen, wenn der Abend eine andere Richtung nimmt.',
    'note_title', 'Einen Tisch reservieren?',
    'note_text', 'Wir decken gern Ihren Tisch. Schreiben Sie uns oder sprechen Sie die Rezeption an — Allergien und Wünsche nehmen wir vorher auf.',
    'note_cta', 'Persönliche Beratung',
    'items', jsonb_build_array(
      jsonb_build_object(
        'id', 'restaurant',
        'name', 'Restaurant & Bar',
        'kicker', 'Hausrestaurant',
        'text', 'Der Abend beginnt hier. Nordseefisch, Gemüse von den Höfen ringsum und eine Bar, die nicht hetzt. Regionale Tradition, internationale Ideen — und immer ein Tisch zum Horizont.',
        'details', jsonb_build_array(
          jsonb_build_object('label', 'Stil', 'value', 'À la carte & Bar'),
          jsonb_build_object('label', 'Küche', 'value', 'Nordsee, international, vegetarisch und vegan')
        ),
        'includes', jsonb_build_array(
          'Regionale Produkte',
          'Internationale Karte',
          'Vegetarisch und vegan',
          'Bar im Haus'
        ),
        'image', '/culinary-dining.webp',
        'image_alt', 'Fine Dining und Bar im ambassador hotel & spa'
      ),
      jsonb_build_object(
        'id', 'strandstube',
        'name', 'Strandstube',
        'kicker', 'Fine Dining',
        'text', 'Weniger Tische, mehr Ruhe. Die Strandstube ist das Fine Dining im Haus — saisonale Gänge, präzise und ohne Spektakel. Für Abende, die länger werden als die Speisekarte.',
        'details', jsonb_build_array(
          jsonb_build_object('label', 'Stil', 'value', 'Fine Dining'),
          jsonb_build_object('label', 'Küche', 'value', 'Saisonale Menüs, 5-Gang-Wahlmenü zur Halbpension')
        ),
        'includes', jsonb_build_array(
          'Saisonale Karte',
          '5-Gang-Wahlmenü zur Halbpension',
          'Individuelle Alternativen bei Unverträglichkeiten'
        ),
        'image', '/collage-dining1.webp',
        'image_alt', 'Gourmetküche in der Strandstube'
      ),
      jsonb_build_object(
        'id', 'grill',
        'name', 'Grill & Dine',
        'kicker', 'Steakhouse',
        'text', 'Feuer, Fleisch und ein klarer Teller. Das Steakhouse im Haus — geradlinig, regional, ohne Schnörkel. Für Gäste, die den Abend lieber am Grill als an sieben Gängen verbringen.',
        'details', jsonb_build_array(
          jsonb_build_object('label', 'Stil', 'value', 'Steakhouse'),
          jsonb_build_object('label', 'Küche', 'value', 'Grill und regionale Cuts')
        ),
        'includes', jsonb_build_array(
          'Steaks vom Grill',
          'Regionale Beilagen',
          'Abendliche Atmosphäre'
        ),
        'image', '/collage-dining2.webp',
        'image_alt', 'Steakhouse Grill & Dine'
      )
    ),
    'rhythm', jsonb_build_array(
      jsonb_build_object(
        'kicker', 'Morgen',
        'title', 'Frühstück',
        'text', 'Ein reichhaltiges Buffet, ohne Uhr. Der Tag darf langsam beginnen — bevor der Deich den Takt übernimmt.'
      ),
      jsonb_build_object(
        'kicker', 'Abend',
        'title', 'Halbpension',
        'text', 'Frühstück und ein 5-Gang-Wahlmenü. Zusätzliche Getränke sind nicht enthalten — Allergien klären wir vorher.'
      ),
      jsonb_build_object(
        'kicker', 'Spät',
        'title', 'Bar',
        'text', 'Ein Glas nach dem letzten Gang. Die Bar bleibt der leise Ort im Haus, wenn der Wind von See kommt.'
      )
    )
  )),
  (h_id, 'wellness_page', jsonb_build_object(
    'eyebrow', 'Wellnesserlebnis',
    'title', 'Ihr 5 Sterne Wellnesshotel an der Nordsee',
    'subtitle', 'Wellnessurlaub im großzügigen Spa-Bereich',
    'hero_image', '/hotel-nordsee-wellness02.webp',
    'hero_image_alt', 'Wellnessbereich des ambassador hotel & spa',
    'content_eyebrow', 'Spa & Wellness',
    'content_title', 'Ein Kraftort aus Wasser, Dampf & Wärme',
    'content_text', 'Tauchen Sie ein in eine Welt der Entspannung. Unser Wellnessbereich erstreckt sich über mehrere Etagen und bietet Ihnen alles, was Ihr Herz begehrt — vom Infinity-Pool mit Meerblick über Panorama-Saunen bis hin zu ruhigen Behandlungsräumen, in denen unsere Therapeuten Sie in geborgene Hände nehmen.'
  )),
  (h_id, 'faq_page', jsonb_build_object(
    'eyebrow', 'Service & Information',
    'title', 'Häufig gestellte Fragen',
    'subtitle', 'Alles von A bis Z — sortiert nach Kategorien, damit Sie schnell die Antwort finden, die Sie suchen.',
    'cta_text', 'Ihre Frage war nicht dabei?',
    'cta_button', 'E-Mail an das Team'
  )),
  (h_id, 'faq_home_section', jsonb_build_object(
    'eyebrow', 'Häufig gestellte Fragen',
    'title', 'Gut zu wissen'
  ))
  ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;

  -- ========== IMAGES ==========
  INSERT INTO hotel_images (hotel_id, image_key, url, alt_text) VALUES
    (h_id, 'logo_white', '/ASP_Logo-weiss.png', 'ambassador hotel & spa'),
    (h_id, 'logo_normal', '/ASP_Logo-normal.png', 'ambassador hotel & spa'),
    (h_id, 'hero_main', '/asp-start01.jpg', 'Ambassador Hotel & Spa am Meer'),
    (h_id, 'spa_wellness', '/spa-wellness.webp', 'Spa-Bereich mit Blick auf die Nordsee'),
    (h_id, 'culinary_dining', '/culinary-dining.webp', 'Fine Dining Restaurant'),
    (h_id, 'suite_room', '/suite-room.webp', 'Suite mit Meerblick'),
    (h_id, 'wellness_page_hero', '/hotel-nordsee-wellness02.webp', 'Wellnessbereich des ambassador hotel & spa')
  ON CONFLICT (hotel_id, image_key) DO UPDATE SET url = EXCLUDED.url, alt_text = EXCLUDED.alt_text;

  -- ========== FAQs ==========
  INSERT INTO hotel_faqs (hotel_id, category, question, answer, sort_order, show_on_home) VALUES
    (h_id, 'Allgemein', 'Wie spät ist der Check-in und Check-out?', 'Der Check-in ist ab 15:00 Uhr möglich, der Check-out bis 11:00 Uhr. Eine frühere Anreise oder ein späterer Check-out ist auf Anfrage gerne möglich, je nach Belegung.', 1, true),
    (h_id, 'Allgemein', 'Bietet das Hotel kostenlose Parkplätze an?', 'Ja, für unsere Gäste stehen kostenlose Parkplätze direkt am Hotel zur Verfügung. Zusätzlich gibt es E-Ladesäulen für Elektrofahrzeuge.', 2, true),
    (h_id, 'Allgemein', 'Wie weit ist das Hotel vom Flughafen Hamburg entfernt?', 'Der Flughafen Hamburg ist etwa 190 km entfernt, was mit dem Auto rund 2 Stunden dauert. Die Anreise erfolgt über die A23 bis Heide, dann weiter über die B5 und B203 Richtung Sankt Peter-Ording.', 3, true),
    (h_id, 'Allgemein', 'Sind Hunde im Hotel willkommen?', 'Ja, Hunde sind bei uns herzlich willkommen und kostenfrei. Bitte geben Sie bei der Buchung an, dass Sie mit Hund anreisen, damit wir das passende Zimmer für Sie vorbereiten.', 4, true),
    (h_id, 'Allgemein', 'Welche Öffnungszeiten hat der Spa-Bereich?', 'Unser Spa-Bereich ist täglich von 07:00 bis 20:00 Uhr geöffnet. Behandlungen können vorab reserviert werden.', 5, true),
    (h_id, 'Allgemein', 'Was ist in der Halbpension enthalten?', 'Die Halbpension umfasst ein reichhaltiges Frühstücksbuffet am Morgen und ein 5-Gang-Wahlmenü am Abend. Bei Allergien oder Unverträglichkeiten bieten wir individuelle Alternativen an.', 6, true),
    (h_id, 'Allgemein', 'Gibt es eine Kinderbetreuung?', 'Ja, unsere Kinderbetreuung steht Gästen aller Altersklassen ab 0 Jahren zur Verfügung. Das abwechslungsreiche Programm wird von geschulten Betreuerinnen und Betreuern geleitet.', 7, true),
    (h_id, 'Allgemein', 'Wie kann ich buchen oder Verfügbarkeit prüfen?', 'Sie können über das Verfügbarkeitsformular auf der Startseite Anreise, Abreise und Gästezahl eingeben und sofort freie Zimmer prüfen. Alternativ erreichen Sie uns telefonisch unter +49 (0) 4863 / 7090 oder per E-Mail an info@hotel-ambassador.de.', 8, true),
    (h_id, 'Zimmer & Ausstattung', 'Welche Zimmertypen gibt es im ambassador hotel & spa?', 'Wir bieten Comfort-Zimmer, Superior-Zimmer, Suiten und Panorama-Suiten. Alle Zimmer verfügen über Balkon oder Terrasse, kostenfreies WLAN, Smart-TV, Minibar, Safe und einen Bademantel für den Spa-Besuch.', 1, false),
    (h_id, 'Zimmer & Ausstattung', 'Haben alle Zimmer Meerblick?', 'Viele unserer Zimmer und Suiten bieten Blick auf die Nordsee oder die umliegende Naturlandschaft. Bei der Buchung können Sie einen Meerblick-Zimmerwunsch angeben — wir tun unser Bestes, diesen zu erfüllen.', 2, true),
    (h_id, 'Zimmer & Ausstattung', 'Gibt es WLAN in den Zimmern?', 'Ja, in allen Zimmern und Bereichen des Hotels steht kostenloses WLAN zur Verfügung. Der Zugang wird an der Rezeption ausgehändigt.', 3, false),
    (h_id, 'Zimmer & Ausstattung', 'Sind die Zimmer barrierefrei?', 'Wir verfügen über mehrere barrierefrei zugängliche Zimmer mit breiten Türen, rollstuhlgerechtem Bad und Notrufsystem. Bitte geben Sie bei der Buchung an, wenn Sie ein barrierefreies Zimmer benötigen.', 4, false),
    (h_id, 'Wellness & Spa', 'Welche Öffnungszeiten hat der Spa-Bereich?', 'Der Spa-Bereich ist täglich von 07:00 bis 20:00 Uhr geöffnet. Der Infinity-Pool ist ebenfalls in diesem Zeitraum nutzbar.', 5, false),
    (h_id, 'Wellness & Spa', 'Gibt es einen Adults-Only-Bereich?', 'Ja, wir haben einen dedizierten Adults-Only-Spa-Bereich, in dem Gäste ab 16 Jahren Ruhe und Entspannung finden. Der Familien-Spa-Bereich ist für Gäste aller Altersklassen zugänglich.', 6, true),
    (h_id, 'Wellness & Spa', 'Können Behandlungen vorab gebucht werden?', 'Ja, wir empfehlen, Behandlungen mindestens 7 Tage vor Anreise zu reservieren. Sie können dies telefonisch unter +49 (0) 4863 / 7090 oder per E-Mail an info@hotel-ambassador.de tun.', 7, false),
    (h_id, 'Wellness & Spa', 'Ist ein Bademantel inbegriffen?', 'Ja, in jedem Zimmer liegt ein Bademantel für Sie bereit. Handtücher für den Spa-Bereich erhalten Sie am Pooleingang.', 8, false),
    (h_id, 'Wellness & Spa', 'Gibt es Saunen und Dampfbäder?', 'Unser Spa umfasst eine Panorama-Sauna, ein Kräuter-Dampfbad, einen Bio-Sauna-Bereich und eine Infrarotkabine. Alle Saunen sind textileinfrei.', 9, false),
    (h_id, 'Kulinarik & Halbpension', 'Was ist in der Halbpension enthalten?', 'Die Halbpension umfasst ein reichhaltiges Frühstücksbuffet am Morgen und ein 5-Gang-Wahlmenü am Abend. Zusätzliche Getränke sind nicht inbegriffen.', 10, false),
    (h_id, 'Kulinarik & Halbpension', 'Gibt es vegetarische und vegane Optionen?', 'Ja, wir bieten vegetarische und vegane Gerichte in allen Restaurants an. Bitte geben Sie bei der Buchung oder am Anreisetag Ihre Ernährungspräferenzen an.', 11, true),
    (h_id, 'Kulinarik & Halbpension', 'Kann ich Allergien und Unverträglichkeiten anmelden?', 'Absolut. Unser Küchenteam geht auf alle Allergien und Unverträglichkeiten ein. Bitte informieren Sie uns vorab, damit wir entsprechend vorbereiten können.', 12, false),
    (h_id, 'Kulinarik & Halbpension', 'Welche Restaurants gibt es im Haus?', 'Das ambassador hotel & spa beherbergt die Strandstube (Fine Dining), das Steakhouse Grill & Dine, eine Sushi-Bar und die Nordseelounge mit regionaler Küche.', 13, false),
    (h_id, 'Anreise & Parken', 'Wie komme ich zum Hotel?', 'Über die A23 bis Heide, dann weiter über die B5 und B203 Richtung Sankt Peter-Ording. Das Hotel befindet sich direkt im Ortsteil Bad. Die Adresse lautet Im Bad 26, 25826 Sankt Peter-Ording, Deutschland.', 14, false),
    (h_id, 'Anreise & Parken', 'Gibt es kostenlose Parkplätze?', 'Ja, für unsere Gäste stehen kostenlose Parkplätze direkt am Hotel zur Verfügung.', 15, false),
    (h_id, 'Anreise & Parken', 'Gibt es E-Ladesäulen?', 'Ja, am Hotel befinden sich moderne Doppel-Ladesäulen für Elektrofahrzeuge. Die Nutzung ist für Hotelgäste kostenlos.', 16, false),
    (h_id, 'Anreise & Parken', 'Kann ich mit dem öffentlichen Verkehr anreisen?', 'Der nächste Bahnhof ist in Husum, etwa 30 Minuten vom Hotel entfernt. Auf Anfrage organisieren wir gerne einen Abholservice.', 17, false),
    (h_id, 'Kinder & Zustellbetten', 'Bis wann übernachten Kinder kostenlos?', 'Kinder bis zum vollendeten 6. Lebensjahr übernachten im Bett der Eltern kostenfrei. Für Kinder bis 12 Jahre bieten wir einen reduzierten Kinderpreis an.', 18, false),
    (h_id, 'Kinder & Zustellbetten', 'Sind Zustellbetten verfügbar?', 'Ja, in den meisten Zimmern und Suiten können Zustellbetten oder Babybetten gestellt werden. Bitte geben Sie den Bedarf bei der Buchung an.', 19, false),
    (h_id, 'Kinder & Zustellbetten', 'Ab welchem Alter gibt es Kinderbetreuung?', 'Unsere Kinderbetreuung steht Kindern ab 0 Jahren zur Verfügung. Das Programm wird in Altersgruppen eingeteilt, sodass jedes Kind altersgerecht betreut wird.', 20, false),
    (h_id, 'Kinder & Zustellbetten', 'Gibt es einen Kinderspielplatz?', 'Ja, wir haben einen Indoor-Spielbereich und einen Outdoor-Spielplatz. Außerdem gibt es ein separates Kinder-Spa-Becken im Familien-Spa-Bereich.', 21, false),
    (h_id, 'Bezahlung & Stornierung', 'Welche Zahlungsmethoden werden akzeptiert?', 'Wir akzeptieren Kreditkarten (Visa, Mastercard, American Express), Banküberweisung und Bargeld. Apple Pay und Google Pay sind an der Rezeption ebenfalls verfügbar.', 22, false),
    (h_id, 'Bezahlung & Stornierung', 'Wie lautet die Stornierungsbedingung?', 'Bis 14 Tage vor Anreise ist die Stornierung kostenlos. Bei Stornierungen ab 7 Tagen vor Anreise berechnen wir 70% des Zimmerpreises, ab 3 Tagen 90%. Bei Nichterscheinen wird der volle Zimmerpreis fällig.', 23, true),
    (h_id, 'Bezahlung & Stornierung', 'Gibt es eine Anzahlung bei Buchung?', 'Für Buchungen direkt über unsere Website wird keine Anzahlung fällig. Bei Gruppenbuchungen ab 5 Zimmern erheben wir eine Anzahlung in Höhe von 30% des Gesamtbetrags.', 24, false),
    (h_id, 'Bezahlung & Stornierung', 'Kann ich Geschenkgutscheine erwerben?', 'Ja, Gutscheine für Aufenthalte, Spa-Behandlungen und kulinarische Erlebnisse können online oder an der Rezeption erworben werden.', 25, false),
    (h_id, 'Barrierefreiheit', 'Ist das Hotel barrierefrei zugänglich?', 'Ja, das Hotel verfügt über stufenfreie Zugänge, Aufzüge zu allen Etagen und barrierefrei zugängliche öffentliche Bereiche.', 26, false),
    (h_id, 'Barrierefreiheit', 'Gibt es barrierefreie Zimmer?', 'Wir haben mehrere barrierefrei ausgestattete Zimmer mit rollstuhlgerechtem Bad, Notrufsystem und breiten Türen. Bitte reservieren Sie diese vorab.', 27, false),
    (h_id, 'Barrierefreiheit', 'Ist der Spa-Bereich barrierefrei?', 'Der Haupteingang des Spa, der Infinity-Pool und mehrere Behandlungsräume sind barrierefrei erreichbar. Ein Pool-Lift ist vorhanden.', 28, false)
  ON CONFLICT DO NOTHING;
END $$;
