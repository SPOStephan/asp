/*
  Wellness hub with six topic pages, plus clickable mega-menu titles.
*/

UPDATE hotel_sections
SET data = data || jsonb_build_object(
  'title', 'Auramaris Spa',
  'subtitle', 'Wasser · Wärme · Weitblick',
  'intro', 'Treten Sie ein in eine Welt der Ruhe. An der Nordsee erholen Sie sich, sammeln Kräfte — und unser Team stellt Ihnen ein individuelles Spa-Programm zusammen.',
  'day_kicker', 'Day Spa',
  'day_title', 'Auch für Tagesgäste',
  'day_text', 'Nutzung des gesamten Spas ohne Anwendungen, inklusive Bademantel und Schuhe. 29 Euro pro Person.',
  'day_cta', 'Zum Day Spa',
  'day_cta_href', '/wellness/preisliste',
  'overlap_kicker', 'Ankommen',
  'overlap_title', 'Zwei Räume, ein Atem',
  'overlap_text', 'Nach der Sauna bleibt Zeit. Ein Außenbereich mit Frischluft, ein Raum zum Thema Feuer, einer zum Thema Wasser — jeder Gast findet den Rahmen für die eigene Ruhe.',
  'overlap_cta', 'Öffnungszeiten & Hinweise',
  'overlap_cta_href', '/wellness/informationen',
  'overlap_front', '/collage-pool.webp',
  'overlap_front_alt', 'Schwimmbad mit Farblicht',
  'overlap_back', '/collage-relaxroom.webp',
  'overlap_back_alt', 'Ruheraum im Spa',
  'note_title', 'Einen Termin vereinbaren?',
  'note_text', 'Behandlungen am besten schon mit der Zimmerbuchung reservieren. Telefon 04863 709811 oder E-Mail an auramarisspa@hotel-ambassador.de.',
  'note_cta', 'Termin anfragen',
  'note_cta_href', '/wellness/termin',
  'items', jsonb_build_array(
    jsonb_build_object('id', 'schwimmbad-sauna', 'name', 'Schwimmbad & Sauna', 'kicker', 'Wasser & Wärme', 'tile_cta', 'Jetzt ansehen', 'image', '/collage-pool.webp', 'image_alt', 'Schwimmbad im ambassador hotel & spa'),
    jsonb_build_object('id', 'informationen', 'name', 'Wellness-Informationen', 'kicker', 'Gut zu wissen', 'tile_cta', 'Mehr dazu', 'image', '/spa-wellness.webp', 'image_alt', 'Spa-Bereich mit Blick auf die Nordsee'),
    jsonb_build_object('id', 'auramaris', 'name', 'Auramaris Spa', 'kicker', 'Anwendungen', 'tile_cta', 'Mehr dazu', 'image', '/collage-treatment.webp', 'image_alt', 'Behandlungsraum im Auramaris Spa'),
    jsonb_build_object('id', 'termin', 'name', 'Termin-Vereinbarung', 'kicker', 'Reservierung', 'tile_cta', 'Mehr dazu', 'image', '/collage-restroom.webp', 'image_alt', 'Ankommen an der Spa-Rezeption'),
    jsonb_build_object('id', 'preisliste', 'name', 'Spa-Preisliste', 'kicker', 'Karte', 'tile_cta', 'Mehr dazu', 'image', '/teaser-spa.webp', 'image_alt', 'Spa-Anwendungen im ambassador hotel & spa'),
    jsonb_build_object('id', 'angebot', 'name', 'Spa-Angebot des Monats', 'kicker', 'Saison', 'tile_cta', 'Mehr dazu', 'image', '/spa-adults-only.webp', 'image_alt', 'Saisonales Spa-Angebot')
  )
)
WHERE section_key = 'wellness_page'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{menu_groups}',
  jsonb_build_array(
    jsonb_build_object('title', 'Zimmer & Suiten', 'href', '/zimmer', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer'),
      jsonb_build_object('label', 'Für jede Generation', 'href', '#suiten'),
      jsonb_build_object('label', 'Direkt buchen', 'href', '#direktbuchung')
    )),
    jsonb_build_object('title', 'Angebote', 'href', '/angebote', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Aktuelle Angebote', 'href', '/angebote'),
      jsonb_build_object('label', 'Wellnessurlaub', 'href', '/angebote/wellnessurlaub'),
      jsonb_build_object('label', 'Feiertage', 'href', '/angebote/feiertage')
    )),
    jsonb_build_object('title', 'Erlebnisse', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Hotel-Highlights', 'href', '#highlights'),
      jsonb_build_object('label', 'Entdecken', 'href', '#discover'),
      jsonb_build_object('label', 'Impressionen', 'href', '#impressionen')
    )),
    jsonb_build_object('title', 'Wellness', 'href', '/wellness', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Schwimmbad & Sauna', 'href', '/wellness/schwimmbad-sauna'),
      jsonb_build_object('label', 'Wellness-Informationen', 'href', '/wellness/informationen'),
      jsonb_build_object('label', 'Auramaris Spa', 'href', '/wellness/auramaris'),
      jsonb_build_object('label', 'Termin-Vereinbarung', 'href', '/wellness/termin'),
      jsonb_build_object('label', 'Spa-Preisliste', 'href', '/wellness/preisliste'),
      jsonb_build_object('label', 'Angebot des Monats', 'href', '/wellness/angebot')
    )),
    jsonb_build_object('title', 'Kulinarik', 'href', '/kulinarik', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Restaurant & Bar', 'href', '/kulinarik#restaurant'),
      jsonb_build_object('label', 'Strandstube', 'href', '/kulinarik#strandstube'),
      jsonb_build_object('label', 'Grill & Dine', 'href', '/kulinarik#grill')
    )),
    jsonb_build_object('title', 'Hotel', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
      jsonb_build_object('label', 'Anreise', 'href', '#anreise'),
      jsonb_build_object('label', 'FAQ', 'href', '/faqs'),
      jsonb_build_object('label', 'Newsletter', 'href', '#newsletter')
    ))
  )
)
WHERE section_key = 'navbar'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(data, '{tiles,2,href}', '"/wellness"')
WHERE section_key = 'discover'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data #>> '{tiles,2,title}' = 'Wellness & Spa';

UPDATE hotel_sections
SET data = jsonb_set(
  data,
  '{col_explore_links}',
  jsonb_build_array(
    jsonb_build_object('label', 'Das Resort', 'href', '#welcome'),
    jsonb_build_object('label', 'Angebote', 'href', '/angebote'),
    jsonb_build_object('label', 'Wellness & Spa', 'href', '/wellness'),
    jsonb_build_object('label', 'Kulinarik', 'href', '/kulinarik'),
    jsonb_build_object('label', 'Zimmer & Suiten', 'href', '/zimmer')
  )
)
WHERE section_key = 'footer'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa');

UPDATE hotel_sections
SET data = jsonb_set(data, '{items,1,href}', '"/wellness"')
WHERE section_key = 'highlights'
  AND hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND data #>> '{items,1,title}' = 'Großzügiger Spa-Bereich';
