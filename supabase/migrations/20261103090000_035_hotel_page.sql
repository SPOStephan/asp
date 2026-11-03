-- The hotel page (/hotel): the house as a whole – intro, figures, history, arrival & location,
-- questions about the house. A page template like the others; switched off for every hotel
-- until it is switched on (CMS / admin). Repeatable.

INSERT INTO page_templates (
  template_key, title, description, path_prefix, tags, kind, layout_key, section_keys,
  skeleton, default_selected, required, sort_order
) VALUES
  ('hotel', 'Hotel', 'Das Haus als Ganzes: Einleitung, Zahlen, Geschichte, Anreise & Lage, Fragen zum Haus.', '/hotel',
    ARRAY['hotel','geschichte','anreise'], 'system', 'hotel', ARRAY['hotel_page'], '{}', false, false, 15)
ON CONFLICT (template_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  path_prefix = EXCLUDED.path_prefix,
  tags = EXCLUDED.tags,
  layout_key = EXCLUDED.layout_key,
  section_keys = EXCLUDED.section_keys,
  sort_order = EXCLUDED.sort_order;

INSERT INTO hotel_pages (hotel_id, page_key, enabled, muster_version, template_id)
SELECT h.id, t.template_key, false, 'v1', t.id
FROM hotels h
CROSS JOIN page_templates t
WHERE t.template_key = 'hotel'
ON CONFLICT (hotel_id, page_key) DO UPDATE SET
  template_id = COALESCE(hotel_pages.template_id, EXCLUDED.template_id);
