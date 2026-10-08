-- Two customers, their members and a hotel per customer.
-- people
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-00000000000a','platform@x.de'),('00000000-0000-0000-0000-0000000000a1','owner-a@x.de'),('00000000-0000-0000-0000-0000000000a2','editor-a@x.de'),('00000000-0000-0000-0000-0000000000b1','owner-b@x.de'),('00000000-0000-0000-0000-0000000000c1','new@x.de');
INSERT INTO admins (user_id,email) VALUES ('00000000-0000-0000-0000-00000000000a','platform@x.de');
INSERT INTO organizations (slug,name) VALUES ('kunde-b','Kunde B');
INSERT INTO organization_members SELECT o.id,'00000000-0000-0000-0000-0000000000a1','owner-a@x.de','owner' FROM organizations o WHERE slug='privathotels-dr-lohbeck';
INSERT INTO organization_members SELECT o.id,'00000000-0000-0000-0000-0000000000a2','editor-a@x.de','editor' FROM organizations o WHERE slug='privathotels-dr-lohbeck';
INSERT INTO organization_members SELECT o.id,'00000000-0000-0000-0000-0000000000b1','owner-b@x.de','owner' FROM organizations o WHERE slug='kunde-b';
INSERT INTO hotels (name,slug,domains,organization_id) SELECT 'Hotel B','hotel-b',ARRAY['hotel-b.de'],id FROM organizations WHERE slug='kunde-b';
INSERT INTO hotel_sections (hotel_id,section_key,data) SELECT id,'hero','{}' FROM hotels WHERE slug='hotel-b';
CREATE TEMP TABLE r(test text, ok boolean);
GRANT ALL ON r TO authenticated;
CREATE FUNCTION as_user(u text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN PERFORM set_config('request.jwt.claim.sub', u, false); END $$;
GRANT EXECUTE ON FUNCTION as_user(text) TO authenticated;
