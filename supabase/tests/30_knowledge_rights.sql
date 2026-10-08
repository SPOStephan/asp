-- AI knowledge: every line prints "<scenario> | t". Any "| f" or error is a broken right.
CREATE OR REPLACE FUNCTION fails(statement text) RETURNS boolean LANGUAGE plpgsql AS $$ BEGIN EXECUTE statement; RETURN false; EXCEPTION WHEN others THEN RETURN true; END $$;
GRANT EXECUTE ON FUNCTION fails(text) TO authenticated, anon;
INSERT INTO hotels (name,slug,domains,organization_id) SELECT 'Hotel A2','hotel-a2',ARRAY['hotel-a2.de'],id FROM organizations WHERE slug='privathotels-dr-lohbeck';
SET ROLE authenticated;
-- editor A: hotel knowledge yes, group knowledge no
SELECT as_user('00000000-0000-0000-0000-0000000000a2');
SELECT 'editorA adds hotel source', NOT fails($q$INSERT INTO knowledge_sources (id,organization_id,hotel_id,kind,title) SELECT '10000000-0000-0000-0000-000000000001',organization_id,id,'text','Hunde' FROM hotels WHERE slug='ambassador-hotel-spa'$q$);
SELECT 'editorA adds chunk', NOT fails($q$INSERT INTO knowledge_chunks (source_id,content) VALUES ('10000000-0000-0000-0000-000000000001','Hunde sind willkommen, 25 Euro pro Nacht.')$q$);
SELECT 'editorA cannot add group source', fails($q$INSERT INTO knowledge_sources (organization_id,kind,title) SELECT id,'text','Gruppe' FROM organizations WHERE slug='privathotels-dr-lohbeck'$q$);
SELECT 'editorA cannot change AI settings', fails($q$INSERT INTO ai_settings (organization_id,chat_model) SELECT id,'x' FROM organizations WHERE slug='privathotels-dr-lohbeck'$q$);
-- owner A: group knowledge, sibling hotel knowledge, settings
SELECT as_user('00000000-0000-0000-0000-0000000000a1');
SELECT 'ownerA adds group source', NOT fails($q$INSERT INTO knowledge_sources (id,organization_id,kind,title) SELECT '10000000-0000-0000-0000-000000000002',id,'text','Gutscheine' FROM organizations WHERE slug='privathotels-dr-lohbeck'$q$);
INSERT INTO knowledge_chunks (source_id,content) VALUES ('10000000-0000-0000-0000-000000000002','Gutscheine gelten in allen Hotels der Gruppe.');
INSERT INTO knowledge_sources (id,organization_id,hotel_id,kind,title) SELECT '10000000-0000-0000-0000-000000000003',organization_id,id,'website','Website A2' FROM hotels WHERE slug='hotel-a2';
INSERT INTO knowledge_chunks (source_id,content) VALUES ('10000000-0000-0000-0000-000000000003','Skifahren im Winter direkt am Hotel, Hunde erlaubt.');
SELECT 'ownerA sets AI settings', NOT fails($q$INSERT INTO ai_settings (organization_id,chat_model) SELECT id,'m' FROM organizations WHERE slug='privathotels-dr-lohbeck'$q$);
-- owner B: never sees or touches customer A
SELECT as_user('00000000-0000-0000-0000-0000000000b1');
SELECT 'ownerB sees no A sources', (SELECT count(*) FROM knowledge_sources)=0;
SELECT 'ownerB sees no A chunks', (SELECT count(*) FROM knowledge_chunks)=0;
SELECT 'ownerB cannot add source to hotel A', fails($q$INSERT INTO knowledge_sources (organization_id,hotel_id,kind,title) SELECT organization_id,id,'text','x' FROM hotels WHERE slug='ambassador-hotel-spa'$q$);
SELECT 'ownerB cannot add group source to A', fails($q$INSERT INTO knowledge_sources (organization_id,kind,title) SELECT organization_id,'text','x' FROM hotels WHERE slug='ambassador-hotel-spa'$q$);
SELECT 'ownerB cannot add chunk to A source', fails($q$INSERT INTO knowledge_chunks (source_id,content) VALUES ('10000000-0000-0000-0000-000000000001','x')$q$);
INSERT INTO knowledge_sources (id,organization_id,hotel_id,kind,title) SELECT '10000000-0000-0000-0000-0000000000b0',(SELECT id FROM organizations WHERE slug='privathotels-dr-lohbeck'),id,'text','B' FROM hotels WHERE slug='hotel-b';
SELECT 'organisation follows the hotel', (SELECT organization_id FROM knowledge_sources WHERE id='10000000-0000-0000-0000-0000000000b0')=(SELECT id FROM organizations WHERE slug='kunde-b');
INSERT INTO knowledge_chunks (source_id,content) VALUES ('10000000-0000-0000-0000-0000000000b0','Hunde verboten bei Kunde B.');
SELECT 'ownerB search on hotel A finds nothing', (SELECT count(*) FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Hunde'))=0;
SELECT 'ownerB search finds own', (SELECT count(*) FROM search_knowledge((SELECT id FROM hotels WHERE slug='hotel-b'),'Hunde'))=1;
-- search for hotel A: own + group + sibling, never customer B
SELECT as_user('00000000-0000-0000-0000-0000000000a2');
SELECT 'search: own hotel first', (SELECT source_id FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Was kostet mein Hund?') LIMIT 1)='10000000-0000-0000-0000-000000000001';
SELECT 'search: sibling hotel for cross-selling', EXISTS (SELECT 1 FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Skifahren') WHERE source_id='10000000-0000-0000-0000-000000000003');
SELECT 'search: no sibling when switched off', NOT EXISTS (SELECT 1 FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Skifahren',12,false));
SELECT 'search: group knowledge', EXISTS (SELECT 1 FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Gutschein') WHERE source_id='10000000-0000-0000-0000-000000000002');
SELECT 'search: never customer B', NOT EXISTS (SELECT 1 FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Hunde verboten') WHERE source_id='10000000-0000-0000-0000-0000000000b0');
SELECT 'search: empty question', (SELECT count(*) FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'und der'))=0;
-- ratings
INSERT INTO chat_messages (id,organization_id,hotel_id,conversation_id,question,answer,sources) SELECT '20000000-0000-0000-0000-000000000001',organization_id,id,gen_random_uuid(),'Was kostet der Hund?','Hunde kosten 10 Euro [1].','[{"n":1,"source_id":"10000000-0000-0000-0000-000000000001","cited":true},{"n":2,"source_id":"10000000-0000-0000-0000-000000000002","cited":false}]' FROM hotels WHERE slug='ambassador-hotel-spa';
SELECT 'editorA cannot rate group-wide', fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','wrong',NULL,'10 Euro','25 Euro pro Nacht',true)$q$);
SELECT 'red flag needs the correct statement', fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','wrong',NULL,'10 Euro','')$q$);
SELECT 'editorA raises red flag', NOT fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','wrong',NULL,'10 Euro','Hunde kosten 25 Euro pro Nacht.')$q$);
SELECT 'red flag is open', (SELECT status FROM chat_feedback WHERE rating='wrong')='open';
SELECT 'correction is active', EXISTS (SELECT 1 FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Hund kosten') WHERE kind='correction');
SELECT 'correction ranks first', (SELECT kind FROM search_knowledge((SELECT id FROM hotels WHERE slug='ambassador-hotel-spa'),'Was kostet der Hund') LIMIT 1)='correction';
SELECT 'cited source marked for checking', (SELECT needs_check FROM knowledge_sources WHERE id='10000000-0000-0000-0000-000000000001');
SELECT 'uncited source untouched', NOT (SELECT needs_check FROM knowledge_sources WHERE id='10000000-0000-0000-0000-000000000002');
SELECT 'check question created', (SELECT expected FROM check_questions LIMIT 1)='Hunde kosten 25 Euro pro Nacht.';
WITH u AS (UPDATE chat_feedback SET status='resolved' RETURNING 1) SELECT 'editorA cannot close red flag', count(*)=0 FROM u;
SELECT 'editorA rates good', NOT fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','good')$q$);
SELECT 'good answer becomes example', EXISTS (SELECT 1 FROM knowledge_sources WHERE kind='example');
SELECT 'improve needs a comment', fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','improve','')$q$);
SELECT 'improve with rule', NOT fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','improve','zu lang','','',false,'Kurz antworten.')$q$);
SELECT 'rule stored for the hotel', (SELECT hotel_id IS NOT NULL FROM answer_rules WHERE rule='Kurz antworten.');
SELECT as_user('00000000-0000-0000-0000-0000000000b1');
SELECT 'ownerB cannot rate A', fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','good')$q$);
SELECT 'ownerB sees no A messages', (SELECT count(*) FROM chat_messages)=0;
SELECT as_user('00000000-0000-0000-0000-0000000000a1');
WITH u AS (UPDATE chat_feedback SET status='resolved', resolved_at=now() WHERE rating='wrong' RETURNING 1) SELECT 'ownerA closes red flag', count(*)=1 FROM u;
SELECT 'ownerA rates group-wide', NOT fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','wrong',NULL,'x','Gruppenweit richtig.',true)$q$);
SELECT 'group correction has no hotel', EXISTS (SELECT 1 FROM knowledge_sources WHERE kind='correction' AND hotel_id IS NULL);
-- anonymous
SELECT as_user('');
SET ROLE anon;
SELECT 'anon reads no knowledge', fails('SELECT 1 FROM knowledge_sources') OR (SELECT count(*) FROM knowledge_sources)=0;
SELECT 'anon cannot rate', fails($q$SELECT rate_answer('20000000-0000-0000-0000-000000000001','good')$q$);
