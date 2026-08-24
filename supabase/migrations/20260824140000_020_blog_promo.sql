/*
  Optional offer promo on journal posts.
  Admin later picks offer_id + placement; suggested_offer_id stays the topic hint.
*/

UPDATE hotel_sections
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(
      data,
      '{items,0,promo}',
      '{"enabled": true, "offer_id": "wellnessurlaub", "placement": "inline", "suggested_offer_id": "wellnessurlaub"}'::jsonb
    ),
    '{items,1,promo}',
    '{"enabled": true, "offer_id": "feiertage", "placement": "after", "suggested_offer_id": "feiertage"}'::jsonb
  ),
  '{items,2,promo}',
  '{"enabled": true, "offer_id": "wellnessurlaub", "placement": "after", "suggested_offer_id": "wellnessurlaub"}'::jsonb
)
WHERE section_key = 'blog_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data ? 'items';
