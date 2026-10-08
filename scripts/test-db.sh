#!/usr/bin/env bash
# Applies all migrations to a throwaway local Postgres and runs the rights tests.
# Needs a local PostgreSQL (psql, initdb, pg_ctl). Usage: scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BIN=${PG_BIN:-$(dirname "$(command -v pg_ctl || ls /usr/lib/postgresql/*/bin/pg_ctl | tail -1)")}
DIR=$(mktemp -d)
PORT=${PG_PORT:-54329}
"$BIN/initdb" -D "$DIR/data" -A trust >/dev/null
"$BIN/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR" -l "$DIR/log" start >/dev/null
trap '"$BIN/pg_ctl" -D "$DIR/data" stop >/dev/null; rm -rf "$DIR"' EXIT
PSQL=(psql -h "$DIR" -p "$PORT" -U "$(whoami)" -d postgres -q -v ON_ERROR_STOP=1)
"${PSQL[@]}" -f supabase/tests/00_supabase_stub.sql
for file in supabase/migrations/*.sql; do "${PSQL[@]}" -f "$file" >/dev/null; done
"${PSQL[@]}" -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated"
"${PSQL[@]}" -f supabase/tests/10_organizations_fixture.sql >/dev/null
RESULT=""
for file in supabase/tests/[2-9]*.sql; do
  OUT=$(psql -h "$DIR" -p "$PORT" -U "$(whoami)" -d postgres -q -t -f "$file" 2>/dev/null | grep '|' || true)
  RESULT="$RESULT$OUT"$'\n'
done
RESULT=$(echo "$RESULT" | sed '/^$/d')
echo "$RESULT"
if echo "$RESULT" | grep -q '| f'; then echo "Rechte-Test fehlgeschlagen"; exit 1; fi
echo "Rechte-Test ok ($(echo "$RESULT" | wc -l) Szenarien)"
