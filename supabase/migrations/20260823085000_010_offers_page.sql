/*
  Offers page: editorial pair of arrangements, plus nav/footer/home links.
*/

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT id, 'offers_page', jsonb_build_object(
  'eyebrow', 'Arrangements',
  'title_line1', 'Unsere besten Angebote',
  'title_line2', 'für Ihre',
  'title_script', 'Nordsee-Ferien',
  'intro', 'Zwei Arrangements, klar erzählt. Kein Buchungsraster — sondern zwei Geschichten vom Meer, mit allem was dazugehört.',
  'note_title', 'Ein anderes Arrangement?',
  'note_text', 'Wir stellen Ihnen gern ein individuelles Paket zusammen — passend zu Anreise, Anlass und Tempo.',
  'note_cta', 'Persönliche Beratung',
  'items', jsonb_build_array(
    jsonb_build_object(
      'id', 'wellnessurlaub',
      'title', 'Wellnessurlaub',
      'subtitle', 'Auszeit am Meer',
      'text', 'Drei Nächte zwischen Suite, Spa und Salzwasser. Ein Guthaben für Anwendungen, der Pool mit Weitblick und Zeit, die niemand plant.',
      'details', jsonb_build_array('3 Nächte', 'ab 655 Euro pro Person'),
      'includes', jsonb_build_array(
        'Übernachtung mit Frühstück',
        '50 € Wellnessguthaben',
        'Zugang zum gesamten Spa',
        'Late Check-out nach Verfügbarkeit'
      ),
      'links', jsonb_build_array(
        jsonb_build_object('label', 'Jetzt buchen', 'href', '#buchung')
      ),
      'image', '/teaser-spa.webp',
      'image_alt', 'Wellness und Spa im ambassador hotel & spa'
    ),
    jsonb_build_object(
      'id', 'feiertage',
      'title', 'Feiertage',
      'subtitle', 'Weihnachten mit Meerblick',
      'text', 'Die stillen Tage am Deich. Festliche Menüs, ein helles Zimmer zum Meer und Abende, die länger werden als der Kalender.',
      'details', jsonb_build_array('3 Nächte', 'ab 655 Euro pro Person'),
      'includes', jsonb_build_array(
        'Übernachtung mit Frühstück',
        'Festtagsmenüs an den Feiertagen',
        'Zugang zum gesamten Spa',
        'Kleine Aufmerksamkeit zur Anreise'
      ),
      'links', jsonb_build_array(
        jsonb_build_object('label', 'Jetzt buchen', 'href', '#buchung')
      ),
      'image', '/collage-dining1.webp',
      'image_alt', 'Festliche Kulinarik im Hotel'
    )
  )
)
FROM hotels
WHERE slug = 'ambassador-hotel-spa'
ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;

UPDATE hotel_sections
SET data = data || jsonb_build_object(
  'menu_groups', jsonb_build_array(
    jsonb_build_object('title', 'Zimmer & Suiten', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Zimmer & Suiten', 'href', '#suiten'),
      jsonb_build_object('label', 'Für jede Generation', 'href', '#suiten'),
      jsonb_build_object('label', 'Direkt buchen', 'href', '#direktbuchung')
    )),
    jsonb_build_object('title', 'Angebote', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Aktuelle Angebote', 'href', '/angebote'),
      jsonb_build_object('label', 'Wellnessurlaub', 'href', '/angebote#wellnessurlaub'),
      jsonb_build_object('label', 'Feiertage', 'href', '/angebote#feiertage')
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
      jsonb_build_object('label', 'Restaurant & Bar', 'href', '#kulinarik'),
      jsonb_build_object('label', 'Strandstube', 'href', '#kulinarik'),
      jsonb_build_object('label', 'Grill & Dine', 'href', '#kulinarik')
    )),
    jsonb_build_object('title', 'Hotel', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
      jsonb_build_object('label', 'Anreise', 'href', '#anreise'),
      jsonb_build_object('label', 'FAQ', 'href', '/faqs'),
      jsonb_build_object('label', 'Newsletter', 'href', '#newsletter')
    ))
  )
)
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{items,0,links,0,href}',
  '"/angebote#wellnessurlaub"'
)
WHERE section_key = 'offers'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{items,1,links,0,href}',
  '"/angebote#feiertage"'
)
WHERE section_key = 'offers'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{tiles,1,href}',
  '"/angebote"'
)
WHERE section_key = 'discover'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{col_explore_links}',
  jsonb_build_array(
    jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
    jsonb_build_object('label', 'Angebote', 'href', '/angebote'),
    jsonb_build_object('label', 'Wellness & Spa', 'href', '#wellness'),
    jsonb_build_object('label', 'Kulinarik', 'href', '#kulinarik'),
    jsonb_build_object('label', 'Zimmer & Suiten', 'href', '#suiten')
  )
)
WHERE section_key = 'footer'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
