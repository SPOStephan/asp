-- Every line prints "<scenario> | t". Any "| f" or error is a broken right.
SET ROLE authenticated;
-- editor A
SELECT as_user('00000000-0000-0000-0000-0000000000a2');
WITH u AS (UPDATE hotel_sections SET data='{"x":1}' WHERE section_key='hero' AND hotel_id=(SELECT id FROM hotels WHERE slug='ambassador-hotel-spa') RETURNING 1) SELECT 'editorA edits hotel A', count(*)=1 FROM u;
WITH u AS (UPDATE hotel_sections SET data='{"x":1}' WHERE hotel_id=(SELECT id FROM hotels WHERE slug='hotel-b') RETURNING 1) SELECT 'editorA blocked on hotel B', count(*)=0 FROM u;
SELECT 'editorA is_admin', is_admin();
SELECT 'editorA not platform', NOT is_platform_admin();
SELECT 'editorA access', my_access()->'organizations'->0->>'role' = 'editor';
INSERT INTO hotels (name,slug,organization_id) SELECT 'X','x-editor',id FROM organizations WHERE slug='privathotels-dr-lohbeck';
SELECT 'editorA cannot create hotel', NOT EXISTS (SELECT 1 FROM hotels WHERE slug='x-editor');
INSERT INTO page_templates (template_key,title,path_prefix,kind) VALUES ('evil','Evil','/seite/evil','library');
SELECT 'editorA cannot write templates', NOT EXISTS (SELECT 1 FROM page_templates WHERE template_key='evil');
-- owner B
SELECT as_user('00000000-0000-0000-0000-0000000000b1');
WITH u AS (UPDATE hotel_sections SET data='{}' WHERE hotel_id=(SELECT id FROM hotels WHERE slug='ambassador-hotel-spa') RETURNING 1) SELECT 'ownerB blocked on hotel A', count(*)=0 FROM u;
WITH u AS (UPDATE hotels SET name='B2' WHERE slug='hotel-b' RETURNING 1) SELECT 'ownerB edits own hotel', count(*)=1 FROM u;
UPDATE hotels SET domains=ARRAY['hotel-ambassador.de'] WHERE slug='hotel-b';
SELECT 'domain takeover blocked', NOT ('hotel-ambassador.de' = ANY(SELECT unnest(domains) FROM hotels WHERE slug='hotel-b'));
INSERT INTO hotels (name,slug,organization_id) SELECT 'B neu','b-neu',id FROM organizations WHERE slug='kunde-b';
SELECT 'ownerB creates hotel in own org', EXISTS (SELECT 1 FROM hotels WHERE slug='b-neu');
INSERT INTO hotels (name,slug,organization_id) SELECT 'In A','b-in-a',id FROM organizations WHERE slug='privathotels-dr-lohbeck';
SELECT 'ownerB cannot create in org A', NOT EXISTS (SELECT 1 FROM hotels WHERE slug='b-in-a');
UPDATE hotels SET organization_id=(SELECT id FROM organizations WHERE slug='kunde-b') WHERE slug='ambassador-hotel-spa';
SELECT 'ownerB cannot steal hotel A', (SELECT organization_id FROM hotels WHERE slug='ambassador-hotel-spa') <> (SELECT id FROM organizations WHERE slug='kunde-b');
INSERT INTO admin_invites (email,organization_id,role) SELECT 'new@x.de',id,'editor' FROM organizations WHERE slug='privathotels-dr-lohbeck';
SELECT 'ownerB cannot invite into A', NOT EXISTS (SELECT 1 FROM admin_invites WHERE email='new@x.de');
SELECT 'ownerB sees only own org', (SELECT count(*) FROM organizations)=1;
INSERT INTO admin_invites (email) VALUES ('platform2@x.de');
SELECT 'ownerB cannot invite platform admin', NOT EXISTS (SELECT 1 FROM admin_invites WHERE email='platform2@x.de');
-- owner A invites, new person claims
SELECT as_user('00000000-0000-0000-0000-0000000000a1');
INSERT INTO admin_invites (email,organization_id,role) SELECT 'new@x.de',id,'editor' FROM organizations WHERE slug='privathotels-dr-lohbeck';
SELECT 'ownerA invites into A', EXISTS (SELECT 1 FROM admin_invites WHERE email='new@x.de');
SELECT as_user('00000000-0000-0000-0000-0000000000c1');
SELECT 'new person claims', claim_admin();
SELECT 'new person is editor of A', my_access()->'organizations'->0->>'slug'='privathotels-dr-lohbeck' AND NOT is_platform_admin();
-- media
INSERT INTO media (hotel_id,bunny_path,bunny_url) VALUES (NULL,'shared/x','u');
SELECT 'editor cannot add shared media', NOT EXISTS (SELECT 1 FROM media WHERE bunny_path='shared/x');
INSERT INTO media (hotel_id,bunny_path,bunny_url) SELECT id,'a/x','u' FROM hotels WHERE slug='ambassador-hotel-spa';
SELECT 'editor adds hotel media', EXISTS (SELECT 1 FROM media WHERE bunny_path='a/x');
-- platform
SELECT as_user('00000000-0000-0000-0000-00000000000a');
WITH u AS (UPDATE hotel_sections SET data='{}' WHERE hotel_id=(SELECT id FROM hotels WHERE slug='hotel-b') RETURNING 1) SELECT 'platform edits any hotel', count(*)=1 FROM u;
SELECT 'platform sees all orgs', (SELECT count(*) FROM organizations)=2;
-- anonymous
SELECT as_user('');
SET ROLE anon;
SELECT 'anon is not admin', NOT is_admin();
SELECT 'anon reads hotels', (SELECT count(*) FROM hotels) >= 2;
