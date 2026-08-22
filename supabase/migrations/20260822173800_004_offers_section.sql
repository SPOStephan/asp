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
        'title', 'Angebot eins',
        'text', 'Platzhaltertext für das erste Angebot. Hier beschreiben wir später das Arrangement, die Leistungen und für wen es gedacht ist.',
        'details', jsonb_build_array('Platzhalter: Zeitraum und Konditionen folgen.', 'Platzhalter: weitere Details folgen.'),
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Mehr erfahren', 'href', '#buchung'),
          jsonb_build_object('label', 'Jetzt anfragen', 'href', '#buchung')
        ),
        'image_primary', '/teaser-suite.webp',
        'image_primary_alt', 'Suite im ambassador hotel & spa',
        'image_secondary', '/collage-dining1.webp',
        'image_secondary_alt', 'Kulinarik im Hotel'
      ),
      jsonb_build_object(
        'title', 'Angebot zwei',
        'text', 'Platzhaltertext für das zweite Angebot. Inhalt, Laufzeit und Buchungsweg setzen wir als Nächstes gemeinsam ein.',
        'details', jsonb_build_array('Platzhalter: Leistungen folgen.', 'Platzhalter: Hinweise folgen.'),
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Mehr erfahren', 'href', '#buchung'),
          jsonb_build_object('label', 'Jetzt anfragen', 'href', '#buchung')
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
