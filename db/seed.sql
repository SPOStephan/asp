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
    'text_paragraph2', 'Ihr Hotel in Sankt Peter-Ording für unvergessliche Urlaubsmomente.'
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
      jsonb_build_object('image', '/suite-room.webp', 'eyebrow', 'Übernachten', 'title', 'Zimmer & Suiten', 'href', '#highlights'),
      jsonb_build_object('image', '/teaser-autumn.webp', 'eyebrow', 'Saison', 'title', 'Angebote', 'href', '#newsletter'),
      jsonb_build_object('image', '/spa-wellness.webp', 'eyebrow', 'Wohlbefinden', 'title', 'Wellness & Spa', 'href', '#wellness'),
      jsonb_build_object('image', '/culinary-dining.webp', 'eyebrow', 'Genuss', 'title', 'Restaurant & Bar', 'href', '#culinary'),
      jsonb_build_object('image', '/autumn-aerial.webp', 'eyebrow', 'Region', 'title', 'Urlaub an der Nordsee', 'href', '#generations'),
      jsonb_build_object('image', '/collage-ski.webp', 'eyebrow', 'Winter', 'title', 'Strand & See', 'href', '#highlights'),
      jsonb_build_object('image', '/teaser-family.webp', 'eyebrow', 'Familie', 'title', 'Familienurlaub', 'href', '#generations'),
      jsonb_build_object('image', '/collage-mtb.webp', 'eyebrow', 'Aktiv', 'title', 'Erlebnisse', 'href', '#highlights'),
      jsonb_build_object('image', '/yoga-outdoor.webp', 'eyebrow', 'Balance', 'title', 'Yoga & Retreats', 'href', '#wellness')
    )
  )),
  (h_id, 'wellness', jsonb_build_object(
    'eyebrow', 'Zeit für',
    'title', 'Wellness',
    'copy_eyebrow', 'Spa & Wellness',
    'copy_title', 'Wohlfühlen & Abschalten',
    'copy_text', 'Ein Kraftort aus Wasser, Dampf und Wärme. Zeit, die nur Ihnen gehört.',
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
      jsonb_build_object('label', 'Wellness & Spa', 'href', '#wellness'),
      jsonb_build_object('label', 'Kulinarik', 'href', '#kulinarik'),
      jsonb_build_object('label', 'Zimmer & Suiten', 'href', '#suiten')
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
    'links', jsonb_build_array(
      jsonb_build_object('label', 'Resort', 'href', '#welcome'),
      jsonb_build_object('label', 'Wellness', 'href', '/wellness'),
      jsonb_build_object('label', 'Kulinarik', 'href', '#kulinarik'),
      jsonb_build_object('label', 'Erlebnisse', 'href', '#highlights')
    ),
    'logo_white', '/ASP_Logo-weiss.png',
    'logo_normal', '/ASP_Logo-normal.png',
    'cta_text', 'Anfragen',
    'cta_solid_text', 'Buchen',
    'cta_solid_href', '#buchung',
    'lang_label', 'DE'
  )),
  (h_id, 'wellness_page', jsonb_build_object(
    'eyebrow', 'Wellnesserlebnis',
    'title', 'Ihr 5 Sterne Wellnesshotel an der Nordsee',
    'subtitle', 'Wellnessurlaub im großzügigen Spa-Bereich',
    'hero_image', '/hotel-nordsee-wellness02_(1).jpg',
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
    (h_id, 'wellness_page_hero', '/hotel-nordsee-wellness02_(1).jpg', 'Wellnessbereich des ambassador hotel & spa')
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
    (h_id, 'Zimmer & Ausstattung', 'Haben alle Zimmer Meerblick?', 'Viele unserer Zimmer und Suiten bieten Blick auf die Nordsee oder die umliegende Naturlandschaft. Bei der Buchung können Sie einen Meerblick-Zimmerwunsch angeben — wir tun unser Bestes, diesen zu erfüllen.', 2, false),
    (h_id, 'Zimmer & Ausstattung', 'Gibt es WLAN in den Zimmern?', 'Ja, in allen Zimmern und Bereichen des Hotels steht kostenloses WLAN zur Verfügung. Der Zugang wird an der Rezeption ausgehändigt.', 3, false),
    (h_id, 'Zimmer & Ausstattung', 'Sind die Zimmer barrierefrei?', 'Wir verfügen über mehrere barrierefrei zugängliche Zimmer mit breiten Türen, rollstuhlgerechtem Bad und Notrufsystem. Bitte geben Sie bei der Buchung an, wenn Sie ein barrierefreies Zimmer benötigen.', 4, false),
    (h_id, 'Wellness & Spa', 'Welche Öffnungszeiten hat der Spa-Bereich?', 'Der Spa-Bereich ist täglich von 07:00 bis 20:00 Uhr geöffnet. Der Infinity-Pool ist ebenfalls in diesem Zeitraum nutzbar.', 5, false),
    (h_id, 'Wellness & Spa', 'Gibt es einen Adults-Only-Bereich?', 'Ja, wir haben einen dedizierten Adults-Only-Spa-Bereich, in dem Gäste ab 16 Jahren Ruhe und Entspannung finden. Der Familien-Spa-Bereich ist für Gäste aller Altersklassen zugänglich.', 6, false),
    (h_id, 'Wellness & Spa', 'Können Behandlungen vorab gebucht werden?', 'Ja, wir empfehlen, Behandlungen mindestens 7 Tage vor Anreise zu reservieren. Sie können dies telefonisch unter +49 (0) 4863 / 7090 oder per E-Mail an info@hotel-ambassador.de tun.', 7, false),
    (h_id, 'Wellness & Spa', 'Ist ein Bademantel inbegriffen?', 'Ja, in jedem Zimmer liegt ein Bademantel für Sie bereit. Handtücher für den Spa-Bereich erhalten Sie am Pooleingang.', 8, false),
    (h_id, 'Wellness & Spa', 'Gibt es Saunen und Dampfbäder?', 'Unser Spa umfasst eine Panorama-Sauna, ein Kräuter-Dampfbad, einen Bio-Sauna-Bereich und eine Infrarotkabine. Alle Saunen sind textileinfrei.', 9, false),
    (h_id, 'Kulinarik & Halbpension', 'Was ist in der Halbpension enthalten?', 'Die Halbpension umfasst ein reichhaltiges Frühstücksbuffet am Morgen und ein 5-Gang-Wahlmenü am Abend. Zusätzliche Getränke sind nicht inbegriffen.', 10, false),
    (h_id, 'Kulinarik & Halbpension', 'Gibt es vegetarische und vegane Optionen?', 'Ja, wir bieten vegetarische und vegane Gerichte in allen Restaurants an. Bitte geben Sie bei der Buchung oder am Anreisetag Ihre Ernährungspräferenzen an.', 11, false),
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
    (h_id, 'Bezahlung & Stornierung', 'Wie lautet die Stornierungsbedingung?', 'Bis 14 Tage vor Anreise ist die Stornierung kostenlos. Bei Stornierungen ab 7 Tagen vor Anreise berechnen wir 70% des Zimmerpreises, ab 3 Tagen 90%. Bei Nichterscheinen wird der volle Zimmerpreis fällig.', 23, false),
    (h_id, 'Bezahlung & Stornierung', 'Gibt es eine Anzahlung bei Buchung?', 'Für Buchungen direkt über unsere Website wird keine Anzahlung fällig. Bei Gruppenbuchungen ab 5 Zimmern erheben wir eine Anzahlung in Höhe von 30% des Gesamtbetrags.', 24, false),
    (h_id, 'Bezahlung & Stornierung', 'Kann ich Geschenkgutscheine erwerben?', 'Ja, Gutscheine für Aufenthalte, Spa-Behandlungen und kulinarische Erlebnisse können online oder an der Rezeption erworben werden.', 25, false),
    (h_id, 'Barrierefreiheit', 'Ist das Hotel barrierefrei zugänglich?', 'Ja, das Hotel verfügt über stufenfreie Zugänge, Aufzüge zu allen Etagen und barrierefrei zugängliche öffentliche Bereiche.', 26, false),
    (h_id, 'Barrierefreiheit', 'Gibt es barrierefreie Zimmer?', 'Wir haben mehrere barrierefrei ausgestattete Zimmer mit rollstuhlgerechtem Bad, Notrufsystem und breiten Türen. Bitte reservieren Sie diese vorab.', 27, false),
    (h_id, 'Barrierefreiheit', 'Ist der Spa-Bereich barrierefrei?', 'Der Haupteingang des Spa, der Infinity-Pool und mehrere Behandlungsräume sind barrierefrei erreichbar. Ein Pool-Lift ist vorhanden.', 28, false)
  ON CONFLICT DO NOTHING;
END $$;
