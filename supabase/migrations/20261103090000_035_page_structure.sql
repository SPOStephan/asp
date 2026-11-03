-- New page structure for every hotel (all switched off until switched on in the CMS / admin):
--   "Über uns" (/ueber-uns): the house, its history, hosts, the group, questions about the house
--   "Anreise" (/anreise): address, route, ways, map, questions about arriving
--   the region (/region, formerly the occasion pages /anlaesse) and meetings/celebrations (/tagen …)
-- Repeatable.

INSERT INTO page_templates (
  template_key, title, description, path_prefix, tags, kind, layout_key, section_keys,
  skeleton, default_selected, required, sort_order
) VALUES
  ('ueber-uns', 'Über uns', 'Das Haus als Ganzes: Einleitung, Zahlen, Geschichte, Gastgeber & Team, Hotelgruppe, Fragen zum Haus.', '/ueber-uns',
    ARRAY['hotel','geschichte','team'], 'system', 'about', ARRAY['about_page'], '{}', false, false, 15),
  ('anreise', 'Anreise', 'Adresse, Route, Anreisewege, Karte und Fragen zu Anreise und Parken.', '/anreise',
    ARRAY['anreise','lage','service'], 'system', 'arrival', ARRAY['arrival_page'], '{}', false, false, 16)
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
WHERE t.template_key IN ('ueber-uns', 'anreise')
ON CONFLICT (hotel_id, page_key) DO UPDATE SET
  template_id = COALESCE(hotel_pages.template_id, EXCLUDED.template_id);

-- The occasion pages become the region ("Urlaub in …", /region; /anlaesse leads there). Same
-- page key and data, so the old site version keeps working.
UPDATE page_templates
SET title = 'Region',
    description = 'Urlaub in der Region: Übersicht und eine Seite je Thema (z. B. Strand & Natur, Ausflugsziele, Veranstaltungen, mit Hund, mit der Familie).',
    path_prefix = '/region'
WHERE template_key = 'anlaesse';

-- Meetings and/or celebrations, chosen per hotel in the CMS (/tagen, /feiern or /tagen-und-feiern).
INSERT INTO page_templates (
  template_key, title, description, path_prefix, tags, kind, layout_key, section_keys,
  skeleton, default_selected, required, sort_order
) VALUES
  ('tagen', 'Tagen & Feiern', 'Tagungen und/oder Feiern – je Hotel wählbar (Adresse /tagen, /feiern oder /tagen-und-feiern): Übersicht und eine Seite je Thema (Räume, Pauschalen, Technik, Hochzeiten …).', '/tagen',
    ARRAY['tagung','feier','hochzeit','meeting'], 'system', 'occasions', ARRAY['events_page'], '{}', false, false, 87)
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
WHERE t.template_key = 'tagen'
ON CONFLICT (hotel_id, page_key) DO UPDATE SET
  template_id = COALESCE(hotel_pages.template_id, EXCLUDED.template_id);
