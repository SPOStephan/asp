/*
  White arrow CTA on the expanded wellness hero copy.
*/

UPDATE hotel_sections
SET data = data || jsonb_build_object(
  'copy_cta', 'Mehr erfahren',
  'copy_cta_href', '/wellness'
)
WHERE section_key = 'wellness'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
