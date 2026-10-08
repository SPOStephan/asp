-- Website chat for guests. The server answers with the service key, so no new rights for
-- anonymous visitors are needed. Limits per visitor use a daily changing hash of the
-- address (no IP is stored).

ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS client_hash text;

CREATE INDEX IF NOT EXISTS idx_chat_messages_client ON chat_messages (client_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages (hotel_id, channel, created_at);
