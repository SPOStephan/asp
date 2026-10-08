-- AI knowledge ("KI-Gedächtnis"), part 1 of 2: tables. Part 2 (028) adds rights and functions.
--
-- Everything belongs to one organisation (customer). A row with a hotel applies to that
-- hotel; a row without a hotel applies to every hotel of the organisation (group knowledge).
-- No customer ever reads another customer's knowledge: see the policies in 028.
--
--   knowledge_sources  where knowledge comes from: own website, a link, a PDF, a text,
--                      answers taken from e-mails, corrections and approved answers
--   knowledge_chunks   the searchable pieces of a source
--   answer_rules       how answers should be written ("always name the opening hours")
--   ai_settings        which model does what, per organisation, optionally per hotel
--   chat_messages      every question and answer, with the model and the sources used
--   chat_feedback      ratings: good / could be better / wrong (red flag)
--   check_questions    questions that once went wrong and are asked again after changes

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('website', 'url', 'pdf', 'text', 'email', 'correction', 'example')),
  title text NOT NULL,
  url text,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'review', 'error')),
  enabled boolean NOT NULL DEFAULT true,
  needs_check boolean NOT NULL DEFAULT false,
  check_reason text,
  error text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_scope ON knowledge_sources (organization_id, hotel_id);
-- One source "own website" per hotel, even when two syncs start at the same time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_sources_website ON knowledge_sources (hotel_id) WHERE kind = 'website';

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES knowledge_sources (id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  heading text,
  content text NOT NULL,
  url text,
  search tsvector GENERATED ALWAYS AS (to_tsvector('german', coalesce(heading, '') || ' ' || content)) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source ON knowledge_chunks (source_id, position);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_search ON knowledge_chunks USING gin (search);

CREATE TABLE IF NOT EXISTS answer_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels (id) ON DELETE CASCADE,
  rule text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  feedback_id uuid,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answer_rules_scope ON answer_rules (organization_id, hotel_id);

-- Empty fields inherit: hotel -> organisation -> platform default (environment).
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid REFERENCES hotels (id) ON DELETE CASCADE,
  chat_model text,
  extract_model text,
  helper_model text,
  cross_selling boolean,
  tone text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_settings_scope
  ON ai_settings (organization_id, coalesce(hotel_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'test' CHECK (channel IN ('test', 'website', 'check')),
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  model text,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  gap boolean NOT NULL DEFAULT false,
  gap_resolved_at timestamptz,
  usage jsonb,
  cost numeric,
  error text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_hotel ON chat_messages (hotel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages (conversation_id, created_at);

CREATE TABLE IF NOT EXISTS chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES chat_messages (id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('good', 'improve', 'wrong')),
  comment text,
  wrong_text text,
  correct_text text,
  group_wide boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'done' CHECK (status IN ('open', 'resolved', 'done')),
  resolution text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_feedback_hotel ON chat_feedback (hotel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_message ON chat_feedback (message_id);

CREATE TABLE IF NOT EXISTS check_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
  hotel_id uuid NOT NULL REFERENCES hotels (id) ON DELETE CASCADE,
  question text NOT NULL,
  expected text NOT NULL,
  wrong_text text,
  feedback_id uuid REFERENCES chat_feedback (id) ON DELETE SET NULL,
  enabled boolean NOT NULL DEFAULT true,
  last_status text CHECK (last_status IN ('pass', 'fail', 'error')),
  last_answer text,
  last_reason text,
  last_model text,
  last_run_at timestamptz,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_questions_hotel ON check_questions (hotel_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_sources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_chunks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON answer_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON check_questions TO authenticated;

ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_questions ENABLE ROW LEVEL SECURITY;
