/*
  Editorial Zimmer & Suiten page, plus nav / footer / discover links.
*/

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT id, 'rooms_page', jsonb_build_object(
  'eyebrow', 'Ankommen',
  'title', 'Zimmer & Suiten',
  'subtitle', 'Meerblick · Ruhe · Weite',
  'intro', 'Kein Katalog, keine Rasterpreise. Sechs Räume, in denen das Licht der Nordsee den Takt vorgibt — vom stillen Doppelzimmer bis zur Suite mit eigener Terrasse.',
  'hero_image', '/hotel-stpeter-ording-Austernfischer-Suite05.jpg',
  'hero_image_alt', 'Suite mit privater Terrasse und Blick ins Watt',
  'lookbook_label', 'Lookbook',
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
)
FROM hotels
WHERE slug = 'ambassador-hotel-spa'
ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;

UPDATE hotel_sections
SET data = jsonb_set(data, '{menu_groups,0,links,0,href}', '"/zimmer"')
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(data, '{tiles,0,href}', '"/zimmer"')
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
    jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer')
  )
)
WHERE section_key = 'footer'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
