/*
  Live CMS still points the wellness hero at a .jpg that is not in /public.
  The file on disk is hotel-nordsee-wellness02.webp.
*/

UPDATE hotel_sections
SET data = jsonb_set(data, '{hero_image}', '"/hotel-nordsee-wellness02.webp"')
WHERE section_key = 'wellness_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data->>'hero_image' = '/hotel-nordsee-wellness02.jpg';

UPDATE hotel_images
SET url = '/hotel-nordsee-wellness02.webp'
WHERE image_key = 'wellness_page_hero'
  AND url = '/hotel-nordsee-wellness02.jpg';
