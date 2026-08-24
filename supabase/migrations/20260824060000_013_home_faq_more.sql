/*
  Show four extra FAQs on the homepage for the two-column layout.
*/

UPDATE hotel_faqs
SET show_on_home = true
WHERE hotel_id = (SELECT id FROM hotels WHERE slug = 'ambassador-hotel-spa')
  AND question IN (
    'Haben alle Zimmer Meerblick?',
    'Gibt es einen Adults-Only-Bereich?',
    'Gibt es vegetarische und vegane Optionen?',
    'Wie lautet die Stornierungsbedingung?'
  );
