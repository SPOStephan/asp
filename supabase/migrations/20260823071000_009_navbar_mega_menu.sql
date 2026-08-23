/*
  Mega-menu groups for the top navigation overlay.
*/

UPDATE hotel_sections
SET data = data || jsonb_build_object(
  'menu_label', 'Menü',
  'menu_groups', jsonb_build_array(
    jsonb_build_object('title', 'Zimmer & Suiten', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Zimmer & Suiten', 'href', '#suiten'),
      jsonb_build_object('label', 'Für jede Generation', 'href', '#suiten'),
      jsonb_build_object('label', 'Direkt buchen', 'href', '#direktbuchung')
    )),
    jsonb_build_object('title', 'Angebote', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Aktuelle Angebote', 'href', '#angebote'),
      jsonb_build_object('label', 'Wellnessurlaub', 'href', '#angebote'),
      jsonb_build_object('label', 'Feiertage', 'href', '#angebote')
    )),
    jsonb_build_object('title', 'Erlebnisse', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Hotel-Highlights', 'href', '#highlights'),
      jsonb_build_object('label', 'Entdecken', 'href', '#discover'),
      jsonb_build_object('label', 'Impressionen', 'href', '#impressionen')
    )),
    jsonb_build_object('title', 'Wellness', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Wohlfühlen & Abschalten', 'href', '#wellness'),
      jsonb_build_object('label', 'Spa & Wellness', 'href', '/wellness')
    )),
    jsonb_build_object('title', 'Kulinarik', 'links', jsonb_build_array(
      jsonb_build_object('label', 'Restaurant & Bar', 'href', '#kulinarik'),
      jsonb_build_object('label', 'Strandstube', 'href', '#kulinarik'),
      jsonb_build_object('label', 'Grill & Dine', 'href', '#kulinarik')
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
