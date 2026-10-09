-- Impressions become their own home section (own show/hide eye in the CMS).
-- Until now they lived inside the awards section; their content moves over for every hotel.

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT
  a.hotel_id,
  'impressions',
  jsonb_strip_nulls(jsonb_build_object(
    'script', COALESCE(NULLIF(a.data->>'impressions_script', ''), 'Impressionen'),
    'title', COALESCE(a.data->>'impressions_title', ''),
    'cta', COALESCE(NULLIF(a.data->>'impressions_cta', ''), 'Alle Impressionen'),
    'cta_href', '/impressionen',
    'images', COALESCE(a.data->'impressions', '[]'::jsonb),
    -- A hotel that had switched off the whole awards block keeps the impressions off as well.
    'hidden', CASE WHEN a.data->>'hidden' = 'true' THEN true END
  ))
FROM hotel_sections a
WHERE a.section_key = 'awards'
ON CONFLICT (hotel_id, section_key) DO NOTHING;

UPDATE hotel_sections
SET data = data - 'impressions_script' - 'impressions_title' - 'impressions_cta' - 'impressions_cta_href' - 'impressions'
WHERE section_key = 'awards';

-- New hotels created from the home template get the section right after the awards.
UPDATE page_templates
SET section_keys = CASE
  WHEN 'awards' = ANY (section_keys) THEN
    section_keys[1:array_position(section_keys, 'awards')]
    || ARRAY['impressions']
    || section_keys[array_position(section_keys, 'awards') + 1:]
  ELSE array_append(section_keys, 'impressions')
END
WHERE template_key = 'home' AND NOT ('impressions' = ANY (section_keys));
