-- 022 limited page_key to a fixed list. The template library (home, impressum, …)
-- needs free keys. Safe to re-run if 023 already dropped these.

ALTER TABLE hotel_pages
  DROP CONSTRAINT IF EXISTS hotel_pages_page_key_check;

DROP TRIGGER IF EXISTS trg_hotels_seed_pages ON hotels;
DROP FUNCTION IF EXISTS seed_hotel_pages();
