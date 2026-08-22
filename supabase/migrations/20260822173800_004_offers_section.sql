/*
  Add homepage offers section with placeholder copy.
*/

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT
  h.id,
  'offers',
  jsonb_build_object(
    'title_before', 'Unsere besten Angebote für Ihre',
    'title_script', 'Nordsee-Ferien',
    'items', jsonb_build_array(
      jsonb_build_object(
        'title', 'Wellnessurlaub',
        'subtitle', 'Auszeit am Meer',
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
FROM hotels h
WHERE h.slug = 'ambassador-hotel-spa'
ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;
