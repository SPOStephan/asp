/*
  Offers index/detail heroes, include copy, and detail routes.
*/

UPDATE hotel_sections
SET data = jsonb_build_object(
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
)
WHERE section_key = 'offers_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  jsonb_set(
    data,
    '{items,0,links,0,href}',
    '"/angebote/wellnessurlaub"'
  ),
  '{items,1,links,0,href}',
  '"/angebote/feiertage"'
)
WHERE section_key = 'offers'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{menu_groups,1,links}',
  jsonb_build_array(
    jsonb_build_object('label', 'Aktuelle Angebote', 'href', '/angebote'),
    jsonb_build_object('label', 'Wellnessurlaub', 'href', '/angebote/wellnessurlaub'),
    jsonb_build_object('label', 'Feiertage', 'href', '/angebote/feiertage')
  )
)
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
