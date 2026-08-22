/*
  Add offer body copy and split the section headline after "Angebote".
*/

UPDATE hotel_sections
SET data = jsonb_build_object(
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
        jsonb_build_object('label', 'Mehr erfahren', 'href', '#buchung'),
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
        jsonb_build_object('label', 'Mehr erfahren', 'href', '#buchung'),
        jsonb_build_object('label', 'Jetzt buchen', 'href', '#buchung')
      ),
      'image_primary', '/collage-pool.webp',
      'image_primary_alt', 'Poolbereich im ambassador hotel & spa',
      'image_secondary', '/teaser-spa.webp',
      'image_secondary_alt', 'Wellness und Spa'
    )
  )
)
WHERE section_key = 'offers'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
