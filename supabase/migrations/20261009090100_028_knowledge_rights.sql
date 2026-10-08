-- AI knowledge, part 2 of 2: rights, search and ratings (tables are in 027).
-- Function bodies use $fn$ quoting, no blank lines, no SELECT ... INTO and no subquery starting
-- on its own line inside PL/pgSQL (the Supabase SQL editor splits the script there).
--
-- Who may do what:
--   read          every member of the organisation (and the platform team)
--   hotel rows    everyone who may edit that hotel
--   group rows    (no hotel) owners and admins of the organisation
--   AI settings   owners and admins of the organisation (models cost money)
--   red flags     anyone who may edit the hotel raises them, owners and admins close them

-- Rights ----------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_org_member(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT is_platform_admin()
    OR EXISTS (SELECT 1 FROM organization_members WHERE organization_id = org AND user_id = auth.uid());
$fn$;

CREATE OR REPLACE FUNCTION can_edit_knowledge(org uuid, hotel uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $fn$
  SELECT CASE WHEN hotel IS NULL THEN can_manage_org(org) ELSE can_edit_hotel(hotel) END;
$fn$;

GRANT EXECUTE ON FUNCTION is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_edit_knowledge(uuid, uuid) TO authenticated;

-- A row with a hotel always belongs to that hotel's organisation, whatever the client sends.
CREATE OR REPLACE FUNCTION knowledge_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF NEW.hotel_id IS NOT NULL THEN
    NEW.organization_id := (SELECT h.organization_id FROM hotels h WHERE h.id = NEW.hotel_id);
  END IF;
  IF NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'Das Hotel gehört zu keiner Organisation.';
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS knowledge_sources_scope ON knowledge_sources;
CREATE TRIGGER knowledge_sources_scope BEFORE INSERT OR UPDATE ON knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION knowledge_scope();
DROP TRIGGER IF EXISTS answer_rules_scope ON answer_rules;
CREATE TRIGGER answer_rules_scope BEFORE INSERT OR UPDATE ON answer_rules
  FOR EACH ROW EXECUTE FUNCTION knowledge_scope();
DROP TRIGGER IF EXISTS ai_settings_scope ON ai_settings;
CREATE TRIGGER ai_settings_scope BEFORE INSERT OR UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION knowledge_scope();
DROP TRIGGER IF EXISTS chat_messages_scope ON chat_messages;
CREATE TRIGGER chat_messages_scope BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION knowledge_scope();
DROP TRIGGER IF EXISTS check_questions_scope ON check_questions;
CREATE TRIGGER check_questions_scope BEFORE INSERT OR UPDATE ON check_questions
  FOR EACH ROW EXECUTE FUNCTION knowledge_scope();

DROP TRIGGER IF EXISTS knowledge_sources_updated_at ON knowledge_sources;
CREATE TRIGGER knowledge_sources_updated_at BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS ai_settings_updated_at ON ai_settings;
CREATE TRIGGER ai_settings_updated_at BEFORE UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Policies --------------------------------------------------------------------

DROP POLICY IF EXISTS "member_read_knowledge_sources" ON knowledge_sources;
CREATE POLICY "member_read_knowledge_sources" ON knowledge_sources FOR SELECT
  TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS "editor_write_knowledge_sources" ON knowledge_sources;
CREATE POLICY "editor_write_knowledge_sources" ON knowledge_sources FOR ALL
  TO authenticated USING (can_edit_knowledge(organization_id, hotel_id))
  WITH CHECK (can_edit_knowledge(organization_id, hotel_id));

DROP POLICY IF EXISTS "member_read_knowledge_chunks" ON knowledge_chunks;
CREATE POLICY "member_read_knowledge_chunks" ON knowledge_chunks FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM knowledge_sources s WHERE s.id = knowledge_chunks.source_id));
DROP POLICY IF EXISTS "editor_write_knowledge_chunks" ON knowledge_chunks;
CREATE POLICY "editor_write_knowledge_chunks" ON knowledge_chunks FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM knowledge_sources s WHERE s.id = knowledge_chunks.source_id AND can_edit_knowledge(s.organization_id, s.hotel_id))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM knowledge_sources s WHERE s.id = knowledge_chunks.source_id AND can_edit_knowledge(s.organization_id, s.hotel_id))
  );

DROP POLICY IF EXISTS "member_read_answer_rules" ON answer_rules;
CREATE POLICY "member_read_answer_rules" ON answer_rules FOR SELECT
  TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS "editor_write_answer_rules" ON answer_rules;
CREATE POLICY "editor_write_answer_rules" ON answer_rules FOR ALL
  TO authenticated USING (can_edit_knowledge(organization_id, hotel_id))
  WITH CHECK (can_edit_knowledge(organization_id, hotel_id));

DROP POLICY IF EXISTS "member_read_ai_settings" ON ai_settings;
CREATE POLICY "member_read_ai_settings" ON ai_settings FOR SELECT
  TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS "manager_write_ai_settings" ON ai_settings;
CREATE POLICY "manager_write_ai_settings" ON ai_settings FOR ALL
  TO authenticated USING (can_manage_org(organization_id)) WITH CHECK (can_manage_org(organization_id));

DROP POLICY IF EXISTS "member_read_chat_messages" ON chat_messages;
CREATE POLICY "member_read_chat_messages" ON chat_messages FOR SELECT
  TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS "editor_insert_chat_messages" ON chat_messages;
CREATE POLICY "editor_insert_chat_messages" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (channel IN ('test', 'check') AND can_edit_hotel(hotel_id));
DROP POLICY IF EXISTS "editor_update_chat_messages" ON chat_messages;
CREATE POLICY "editor_update_chat_messages" ON chat_messages FOR UPDATE
  TO authenticated USING (can_edit_hotel(hotel_id)) WITH CHECK (can_edit_hotel(hotel_id));
DROP POLICY IF EXISTS "manager_delete_chat_messages" ON chat_messages;
CREATE POLICY "manager_delete_chat_messages" ON chat_messages FOR DELETE
  TO authenticated USING (can_manage_org(organization_id));

-- Ratings are written by rate_answer() only; managers close red flags.
DROP POLICY IF EXISTS "member_read_chat_feedback" ON chat_feedback;
CREATE POLICY "member_read_chat_feedback" ON chat_feedback FOR SELECT
  TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS "manager_update_chat_feedback" ON chat_feedback;
CREATE POLICY "manager_update_chat_feedback" ON chat_feedback FOR UPDATE
  TO authenticated USING (can_manage_org(organization_id)) WITH CHECK (can_manage_org(organization_id));
DROP POLICY IF EXISTS "manager_delete_chat_feedback" ON chat_feedback;
CREATE POLICY "manager_delete_chat_feedback" ON chat_feedback FOR DELETE
  TO authenticated USING (can_manage_org(organization_id));

DROP POLICY IF EXISTS "member_read_check_questions" ON check_questions;
CREATE POLICY "member_read_check_questions" ON check_questions FOR SELECT
  TO authenticated USING (is_org_member(organization_id));
DROP POLICY IF EXISTS "editor_insert_check_questions" ON check_questions;
CREATE POLICY "editor_insert_check_questions" ON check_questions FOR INSERT
  TO authenticated WITH CHECK (can_edit_hotel(hotel_id));
DROP POLICY IF EXISTS "editor_update_check_questions" ON check_questions;
CREATE POLICY "editor_update_check_questions" ON check_questions FOR UPDATE
  TO authenticated USING (can_edit_hotel(hotel_id)) WITH CHECK (can_edit_hotel(hotel_id));
DROP POLICY IF EXISTS "manager_delete_check_questions" ON check_questions;
CREATE POLICY "manager_delete_check_questions" ON check_questions FOR DELETE
  TO authenticated USING (can_manage_org(organization_id));

-- Search ----------------------------------------------------------------------

-- Knowledge for one hotel: its own, the group's and (optional, weaker) the other hotels
-- of the same organisation for cross-selling. Runs with the caller's rights, so it can
-- never return another customer's knowledge. Any word of the question may match.
CREATE OR REPLACE FUNCTION search_knowledge(hotel uuid, terms text, max_rows integer DEFAULT 12, other_hotels boolean DEFAULT true)
RETURNS TABLE (chunk_id uuid, source_id uuid, kind text, title text, heading text, content text, url text, source_hotel uuid, rank real)
LANGUAGE sql
STABLE
SET search_path = public
AS $fn$
  WITH target AS (SELECT h.organization_id AS org FROM hotels h WHERE h.id = hotel),
  q AS (SELECT (SELECT string_agg(quote_literal(t.lexeme), ' | ') FROM unnest(to_tsvector('german', coalesce(terms, ''))) AS t)::tsquery AS query)
  SELECT c.id, s.id, s.kind, s.title, c.heading, c.content, coalesce(c.url, s.url), s.hotel_id,
    (ts_rank_cd(c.search, q.query)
      * CASE WHEN s.hotel_id = hotel THEN 1.2 WHEN s.hotel_id IS NULL THEN 1.0 ELSE 0.5 END
      * CASE s.kind WHEN 'correction' THEN 3 WHEN 'example' THEN 1.5 ELSE 1 END)::real
  FROM knowledge_chunks c JOIN knowledge_sources s ON s.id = c.source_id CROSS JOIN target CROSS JOIN q
  WHERE q.query IS NOT NULL AND s.organization_id = target.org AND s.enabled AND s.status = 'ready'
    AND (s.hotel_id = hotel OR s.hotel_id IS NULL OR (other_hotels AND s.kind IN ('website', 'url', 'pdf', 'text')))
    AND c.search @@ q.query
  ORDER BY 9 DESC
  LIMIT greatest(1, least(max_rows, 40));
$fn$;

GRANT EXECUTE ON FUNCTION search_knowledge(uuid, text, integer, boolean) TO authenticated;

-- Ratings ---------------------------------------------------------------------

-- One call per rating, so every consequence happens together or not at all:
--   good     the answer becomes an approved example for similar questions
--   improve  the comment is stored; the rule text (optional) applies to future answers
--   wrong    red flag: the correct statement becomes a correction with priority over all
--            sources, the sources the answer cited are marked for checking, and the
--            question becomes a check question that is asked again after changes
CREATE OR REPLACE FUNCTION rate_answer(
  p_message uuid,
  p_rating text,
  p_comment text DEFAULT NULL,
  p_wrong text DEFAULT NULL,
  p_correct text DEFAULT NULL,
  p_group_wide boolean DEFAULT false,
  p_rule text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  msg_hotel uuid;
  msg_org uuid;
  msg_question text;
  msg_answer text;
  msg_sources jsonb;
  scope_hotel uuid;
  new_feedback uuid := gen_random_uuid();
  new_source uuid := gen_random_uuid();
BEGIN
  msg_hotel := (SELECT m.hotel_id FROM chat_messages m WHERE m.id = p_message);
  IF msg_hotel IS NULL OR NOT can_edit_hotel(msg_hotel) THEN
    RAISE EXCEPTION 'Keine Berechtigung für diese Antwort.';
  END IF;
  msg_org := (SELECT h.organization_id FROM hotels h WHERE h.id = msg_hotel);
  msg_question := (SELECT m.question FROM chat_messages m WHERE m.id = p_message);
  msg_answer := (SELECT m.answer FROM chat_messages m WHERE m.id = p_message);
  msg_sources := (SELECT m.sources FROM chat_messages m WHERE m.id = p_message);
  IF p_rating NOT IN ('good', 'improve', 'wrong') THEN
    RAISE EXCEPTION 'Unbekannte Bewertung.';
  END IF;
  IF p_group_wide AND NOT can_manage_org(msg_org) THEN
    RAISE EXCEPTION 'Für die ganze Gruppe dürfen nur Inhaber und Admins der Organisation festlegen.';
  END IF;
  IF p_rating = 'improve' AND coalesce(btrim(p_comment), '') = '' THEN
    RAISE EXCEPTION 'Bitte beschreiben, was besser sein sollte.';
  END IF;
  IF p_rating = 'wrong' AND coalesce(btrim(p_correct), '') = '' THEN
    RAISE EXCEPTION 'Bitte die richtige Aussage eintragen.';
  END IF;
  scope_hotel := CASE WHEN p_group_wide THEN NULL ELSE msg_hotel END;
  INSERT INTO chat_feedback (id, message_id, organization_id, hotel_id, rating, comment, wrong_text, correct_text, group_wide, status, created_by)
  VALUES (
    new_feedback, p_message, msg_org, msg_hotel, p_rating, nullif(btrim(p_comment), ''), nullif(btrim(p_wrong), ''),
    nullif(btrim(p_correct), ''), p_group_wide, CASE WHEN p_rating = 'wrong' THEN 'open' ELSE 'done' END, auth.uid()
  );
  IF p_rating = 'good' THEN
    INSERT INTO knowledge_sources (id, organization_id, hotel_id, kind, title, meta)
    VALUES (new_source, msg_org, scope_hotel, 'example', left(msg_question, 140),
      jsonb_build_object('feedback_id', new_feedback, 'message_id', p_message));
    INSERT INTO knowledge_chunks (source_id, heading, content) VALUES (new_source, msg_question, msg_answer);
  ELSIF p_rating = 'improve' THEN
    IF coalesce(btrim(p_rule), '') <> '' THEN
      INSERT INTO answer_rules (organization_id, hotel_id, rule, feedback_id)
      VALUES (msg_org, scope_hotel, btrim(p_rule), new_feedback);
    END IF;
  ELSE
    INSERT INTO knowledge_sources (id, organization_id, hotel_id, kind, title, meta)
    VALUES (new_source, msg_org, scope_hotel, 'correction', 'Korrektur: ' || left(msg_question, 120),
      jsonb_build_object('feedback_id', new_feedback, 'message_id', p_message, 'wrong_text', nullif(btrim(p_wrong), '')));
    INSERT INTO knowledge_chunks (source_id, heading, content) VALUES (new_source, msg_question, btrim(p_correct));
    UPDATE knowledge_sources ks
    SET needs_check = true,
        check_reason = 'Eine Antwort mit dieser Quelle wurde als falsch markiert'
          || coalesce(': „' || left(nullif(btrim(p_wrong), ''), 200) || '“', '')
          || '. Richtig ist: ' || left(btrim(p_correct), 300)
    WHERE ks.organization_id = msg_org
      AND ks.kind <> 'correction'
      AND ks.id IN (SELECT (e->>'source_id')::uuid FROM jsonb_array_elements(coalesce(msg_sources, '[]'::jsonb)) AS e WHERE e->>'cited' = 'true' AND e->>'source_id' IS NOT NULL);
    UPDATE knowledge_sources ks SET enabled = false
    WHERE ks.organization_id = msg_org AND ks.kind = 'example' AND ks.meta->>'message_id' = p_message::text;
    INSERT INTO check_questions (organization_id, hotel_id, question, expected, wrong_text, feedback_id)
    VALUES (msg_org, msg_hotel, msg_question, btrim(p_correct), nullif(btrim(p_wrong), ''), new_feedback);
  END IF;
  RETURN new_feedback;
END;
$fn$;

GRANT EXECUTE ON FUNCTION rate_answer(uuid, text, text, text, text, boolean, text) TO authenticated;
