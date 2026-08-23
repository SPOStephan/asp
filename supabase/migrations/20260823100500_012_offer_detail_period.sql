/*
  Travel period on offer details; listing copy unchanged.
*/

UPDATE hotel_sections
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        data,
        '{items,0,travel_period_label}',
        '"Reisezeitraum"'
      ),
      '{items,0,travel_period}',
      '"September bis Dezember"'
    ),
    '{items,1,travel_period_label}',
    '"Reisezeitraum"'
  ),
  '{items,1,travel_period}',
  '"November bis Januar"'
)
WHERE section_key = 'offers_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
