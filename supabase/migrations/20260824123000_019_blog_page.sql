/*
  Journal / blog hub, three starter posts, homepage teaser, nav + footer.
*/

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT id, 'blog_page', jsonb_build_object(
  'eyebrow', 'Journal',
  'title', 'Geschichten vom Meer',
  'subtitle', 'Erholung · Familie · Hund',
  'intro', 'Drei Blickwinkel auf Sankt Peter-Ording: die stille Nordsee, der Urlaub mit Kindern und der Tag mit Hund. Mehr folgt — von uns und später auch aus dem Admin.',
  'hero_image', '/teaser-autumn.webp',
  'hero_image_alt', 'Herbstlicht über Sankt Peter-Ording',
  'home_eyebrow', 'Journal',
  'home_title', 'Zuletzt geschrieben',
  'home_cta', 'Alle Beiträge',
  'note_title', 'Mehr aus dem Haus?',
  'note_text', 'Zimmer, Spa und Küche liegen eine Seite weiter. Der Blog bleibt der Ort für Tempo und Stimmung.',
  'note_cta', 'Zimmer ansehen',
  'note_cta_href', '/zimmer',
  'items', jsonb_build_array(
    jsonb_build_object(
      'id', 'erholung-nordsee',
      'slug', 'erholung-an-der-nordsee',
      'title', 'Erholung an der Nordsee',
      'excerpt', 'Weite, Wind und ein Tag ohne Uhr. Warum die Küste bei Sankt Peter-Ording zur Ruhe zwingt — und der Spa sie hält.',
      'topic', 'erholung',
      'hero_image', '/hotel-nordsee-wellness02.webp',
      'hero_image_alt', 'Wellnessbereich mit Blick zur Nordsee',
      'published_at', '2026-08-20',
      'source', 'human'
    ),
    jsonb_build_object(
      'id', 'familienurlaub-spo',
      'slug', 'familienurlaub-sankt-peter-ording',
      'title', 'Familienurlaub in Sankt Peter-Ording',
      'excerpt', 'Platz für Kinder, Wege zum Strand und ein Haus, das drei Generationen kennt. Was in SPO den Familienurlaub trägt.',
      'topic', 'familie',
      'hero_image', '/teaser-family.webp',
      'hero_image_alt', 'Familie im ambassador hotel & spa',
      'published_at', '2026-08-14',
      'source', 'human'
    ),
    jsonb_build_object(
      'id', 'hund-spo',
      'slug', 'ferien-mit-hund-sankt-peter-ording',
      'title', 'SPO-Ferien mit Hund',
      'excerpt', 'Leine, Wind und ein Strand, der mitkommt. Wie Sankt Peter-Ording den Urlaub mit Hund trägt — ohne dass der Mensch zu kurz kommt.',
      'topic', 'hund',
      'hero_image', '/autumn-aerial.webp',
      'hero_image_alt', 'Weite der Nordseeküste bei Sankt Peter-Ording',
      'published_at', '2026-08-08',
      'source', 'human'
    )
  )
)
FROM hotels
WHERE slug = 'ambassador-hotel-spa'
ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{menu_groups,5,links}',
  jsonb_build_array(
    jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
    jsonb_build_object('label', 'Anreise', 'href', '#anreise'),
    jsonb_build_object('label', 'Blog', 'href', '/blog'),
    jsonb_build_object('label', 'FAQ', 'href', '/faqs'),
    jsonb_build_object('label', 'Newsletter', 'href', '#newsletter')
  )
)
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data #>> '{menu_groups,5,title}' = 'Hotel';

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{col_explore_links}',
  jsonb_build_array(
    jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
    jsonb_build_object('label', 'Angebote', 'href', '/angebote'),
    jsonb_build_object('label', 'Wellness & Spa', 'href', '/wellness'),
    jsonb_build_object('label', 'Kulinarik', 'href', '/kulinarik'),
    jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer'),
    jsonb_build_object('label', 'Blog', 'href', '/blog')
  )
)
WHERE section_key = 'footer'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
