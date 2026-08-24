/*
  Starting prices per room (per night), plus make cards the canonical listing copy.
*/

UPDATE hotel_sections
SET data = jsonb_set(
  jsonb_set(
    data,
    '{intro}',
    '"Sechs Räume, in denen das Licht der Nordsee den Takt vorgibt — vom stillen Doppelzimmer bis zur Suite mit eigener Terrasse. Die Preise gelten pro Nacht und Zimmer, je nach Saison und Belegung."'
  ),
  '{price_note}',
  '"Alle Preise gelten pro Nacht und Zimmer, je nach Saison und Belegung."'
)
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(jsonb_set(data, '{items,0,price_from}', '"ab 530 Euro"'), '{items,0,price_unit}', '"Nacht"')
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(jsonb_set(data, '{items,1,price_from}', '"ab 330 Euro"'), '{items,1,price_unit}', '"Nacht"')
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(jsonb_set(data, '{items,2,price_from}', '"ab 270 Euro"'), '{items,2,price_unit}', '"Nacht"')
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(jsonb_set(data, '{items,3,price_from}', '"ab 190 Euro"'), '{items,3,price_unit}', '"Nacht"')
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(jsonb_set(data, '{items,4,price_from}', '"ab 210 Euro"'), '{items,4,price_unit}', '"Nacht"')
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(jsonb_set(data, '{items,5,price_from}', '"ab 150 Euro"'), '{items,5,price_unit}', '"Nacht"')
WHERE section_key = 'rooms_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
