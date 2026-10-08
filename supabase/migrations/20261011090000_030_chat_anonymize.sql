-- Conversations are kept for good. Personal data in them is removed after a while
-- (nightly job /api/maintenance) or at once from the admin area.

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS anonymized_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymize ON chat_messages (anonymized_at, created_at);
