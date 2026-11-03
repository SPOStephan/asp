-- New page structure for every hotel (all switched off until switched on in the CMS / admin):
--   "Über uns" (/ueber-uns): the house, its history, hosts, the group, questions about the house
--   "Anreise" (/anreise): address, route, ways, map, questions about arriving
--   the region (/region, formerly the occasion pages /anlaesse) and meetings/celebrations (/tagen …)
-- Repeatable. Works with and without the template library (page_templates, migration 023): the
-- website itself knows its pages from the code; the library only lists them in the admin.

-- New page keys must be allowed (the first version of hotel_pages listed the keys).
ALTER TABLE hotel_pages DROP CONSTRAINT IF EXISTS hotel_pages_page_key_check;

INSERT INTO hotel_pages (hotel_id, page_key, enabled, muster_version)
SELECT h.id, keys.page_key, false, 'v1'
FROM hotels h
CROSS JOIN (VALUES ('ueber-uns'), ('anreise'), ('tagen')) AS keys (page_key)
ON CONFLICT (hotel_id, page_key) DO NOTHING;

DO $$
BEGIN
  IF to_regclass('public.page_templates') IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO page_templates (
    template_key, title, description, path_prefix, tags, kind, layout_key, section_keys,
    skeleton, default_selected, required, sort_order
  ) VALUES
    ('ueber-uns', 'Über uns', 'Das Haus als Ganzes: Einleitung, Zahlen, Geschichte, Gastgeber & Team, Hotelgruppe, Fragen zum Haus.', '/ueber-uns',
      ARRAY['hotel','geschichte','team'], 'system', 'about', ARRAY['about_page'], '{}', false, false, 15),
    ('anreise', 'Anreise', 'Adresse, Route, Anreisewege, Karte und Fragen zu Anreise und Parken.', '/anreise',
      ARRAY['anreise','lage','service'], 'system', 'arrival', ARRAY['arrival_page'], '{}', false, false, 16),
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

  -- The occasion pages become the region ("Urlaub in …", /region; /anlaesse leads there).
  UPDATE page_templates
  SET title = 'Region',
      description = 'Urlaub in der Region: Übersicht und eine Seite je Thema (z. B. Strand & Natur, Ausflugsziele, Veranstaltungen, mit Hund, mit der Familie).',
      path_prefix = '/region'
  WHERE template_key = 'anlaesse';

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'hotel_pages' AND column_name = 'template_id'
  ) THEN
    UPDATE hotel_pages hp
    SET template_id = t.id
    FROM page_templates t
    WHERE t.template_key = hp.page_key
      AND hp.page_key IN ('ueber-uns', 'anreise', 'tagen')
      AND hp.template_id IS NULL;
  END IF;
END $$;
