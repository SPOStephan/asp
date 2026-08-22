/*
  Add Direktbuchung benefits section for ambassador hotel & spa.
*/

INSERT INTO hotel_sections (hotel_id, section_key, data)
SELECT
  h.id,
  'direct_booking',
  jsonb_build_object(
    'eyebrow', 'Ihr Vorteil',
    'title', 'Direktbuchung',
    'subtitle', 'Buchen Sie direkt bei uns — und sichern Sie sich diese Extra-Leistungen.',
    'cta_text', 'Jetzt direkt buchen',
    'cta_href', '#buchung',
    'items', jsonb_build_array(
      jsonb_build_object('icon', 'BadgePercent', 'title', 'Bestpreisgarantie'),
      jsonb_build_object('icon', 'Car', 'title', 'Parkrabatt 10 € pro Nacht', 'text', 'nach Verfügbarkeit'),
      jsonb_build_object('icon', 'BedDouble', 'title', 'Alle Zimmerkategorien'),
      jsonb_build_object('icon', 'BadgeCheck', 'title', 'Sofortige Buchungsbestätigung'),
      jsonb_build_object('icon', 'Wifi', 'title', 'Kostenfreies WLAN'),
      jsonb_build_object('icon', 'Star', 'title', 'Stammgastpass-Vorteil')
    )
  )
FROM hotels h
WHERE h.slug = 'ambassador-hotel-spa'
ON CONFLICT (hotel_id, section_key) DO UPDATE SET data = EXCLUDED.data;
