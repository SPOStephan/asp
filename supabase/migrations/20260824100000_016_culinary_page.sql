/*
  Editorial Kulinarik page, plus nav / footer / discover links.
*/

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT id, 'culinary_page', jsonb_build_object(
  'eyebrow', 'Kulinarik',
  'title', 'Genuss am Meer',
  'subtitle', 'Restaurant · Bar · Steakhouse',
  'intro', 'Norddeutsche Küche, Fine Dining und Grill — drei Adressen im Haus, eine Küche mit Produkten von der Küste und den Höfen ringsum. Halbpension, vegetarisch und vegan sind selbstverständlich.',
  'hero_image', '/culinary-dining.webp',
  'hero_image_alt', 'Gedeckter Tisch im Restaurant des ambassador hotel & spa',
  'also_title', 'Auch im Haus',
  'also_text', 'Sushi-Bar und Nordseelounge bleiben zwei leise Alternativen, wenn der Abend eine andere Richtung nimmt.',
  'note_title', 'Einen Tisch reservieren?',
  'note_text', 'Wir decken gern Ihren Tisch. Schreiben Sie uns oder sprechen Sie die Rezeption an — Allergien und Wünsche nehmen wir vorher auf.',
  'note_cta', 'Persönliche Beratung',
  'items', jsonb_build_array(
    jsonb_build_object(
      'id', 'restaurant',
      'name', 'Restaurant & Bar',
      'kicker', 'Hausrestaurant',
      'text', 'Der Abend beginnt hier. Nordseefisch, Gemüse von den Höfen ringsum und eine Bar, die nicht hetzt. Regionale Tradition, internationale Ideen — und immer ein Tisch zum Horizont.',
      'details', jsonb_build_array(
        jsonb_build_object('label', 'Stil', 'value', 'À la carte & Bar'),
        jsonb_build_object('label', 'Küche', 'value', 'Nordsee, international, vegetarisch und vegan')
      ),
      'includes', jsonb_build_array(
        'Regionale Produkte',
        'Internationale Karte',
        'Vegetarisch und vegan',
        'Bar im Haus'
      ),
      'image', '/culinary-dining.webp',
      'image_alt', 'Fine Dining und Bar im ambassador hotel & spa'
    ),
    jsonb_build_object(
      'id', 'strandstube',
      'name', 'Strandstube',
      'kicker', 'Fine Dining',
      'text', 'Weniger Tische, mehr Ruhe. Die Strandstube ist das Fine Dining im Haus — saisonale Gänge, präzise und ohne Spektakel. Für Abende, die länger werden als die Speisekarte.',
      'details', jsonb_build_array(
        jsonb_build_object('label', 'Stil', 'value', 'Fine Dining'),
        jsonb_build_object('label', 'Küche', 'value', 'Saisonale Menüs, 5-Gang-Wahlmenü zur Halbpension')
      ),
      'includes', jsonb_build_array(
        'Saisonale Karte',
        '5-Gang-Wahlmenü zur Halbpension',
        'Individuelle Alternativen bei Unverträglichkeiten'
      ),
      'image', '/collage-dining1.webp',
      'image_alt', 'Gourmetküche in der Strandstube'
    ),
    jsonb_build_object(
      'id', 'grill',
      'name', 'Grill & Dine',
      'kicker', 'Steakhouse',
      'text', 'Feuer, Fleisch und ein klarer Teller. Das Steakhouse im Haus — geradlinig, regional, ohne Schnörkel. Für Gäste, die den Abend lieber am Grill als an sieben Gängen verbringen.',
      'details', jsonb_build_array(
        jsonb_build_object('label', 'Stil', 'value', 'Steakhouse'),
        jsonb_build_object('label', 'Küche', 'value', 'Grill und regionale Cuts')
      ),
      'includes', jsonb_build_array(
        'Steaks vom Grill',
        'Regionale Beilagen',
        'Abendliche Atmosphäre'
      ),
      'image', '/collage-dining2.webp',
      'image_alt', 'Steakhouse Grill & Dine'
    )
  ),
  'rhythm', jsonb_build_array(
    jsonb_build_object(
      'kicker', 'Morgen',
      'title', 'Frühstück',
      'text', 'Ein reichhaltiges Buffet, ohne Uhr. Der Tag darf langsam beginnen — bevor der Deich den Takt übernimmt.'
    ),
    jsonb_build_object(
      'kicker', 'Abend',
      'title', 'Halbpension',
      'text', 'Frühstück und ein 5-Gang-Wahlmenü. Zusätzliche Getränke sind nicht enthalten — Allergien klären wir vorher.'
    ),
    jsonb_build_object(
      'kicker', 'Spät',
      'title', 'Bar',
      'text', 'Ein Glas nach dem letzten Gang. Die Bar bleibt der leise Ort im Haus, wenn der Wind von See kommt.'
    )
  )
)
FROM hotels
WHERE slug = 'ambassador-hotel-spa'
ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;

UPDATE hotel_sections
SET data = jsonb_set(data, '{links,2,href}', '"/kulinarik"')
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data #>> '{links,2,label}' = 'Kulinarik';

UPDATE hotel_sections
SET data = jsonb_set(
  jsonb_set(
    jsonb_set(data, '{menu_groups,4,links,0,href}', '"/kulinarik#restaurant"'),
    '{menu_groups,4,links,1,href}',
    '"/kulinarik#strandstube"'
  ),
  '{menu_groups,4,links,2,href}',
  '"/kulinarik#grill"'
)
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data #>> '{menu_groups,4,title}' = 'Kulinarik';

UPDATE hotel_sections
SET data = jsonb_set(data, '{tiles,3,href}', '"/kulinarik"')
WHERE section_key = 'discover'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data #>> '{tiles,3,title}' = 'Restaurant & Bar';

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{col_explore_links}',
  jsonb_build_array(
    jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
    jsonb_build_object('label', 'Angebote', 'href', '/angebote'),
    jsonb_build_object('label', 'Wellness & Spa', 'href', '#wellness'),
    jsonb_build_object('label', 'Kulinarik', 'href', '/kulinarik'),
    jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer')
  )
)
WHERE section_key = 'footer'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');
