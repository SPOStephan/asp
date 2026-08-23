/*
  Add impression gallery copy and images under the awards seals.
*/

UPDATE hotel_sections
SET data = data || jsonb_build_object(
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
)
WHERE section_key = 'awards'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
