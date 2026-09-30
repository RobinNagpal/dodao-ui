#!/usr/bin/env bash
# Flags Prisma migrations whose SQL can lose data or break the running app:
# DROP TABLE/COLUMN/SCHEMA/TYPE, TRUNCATE, DELETE FROM, column type changes, and
# column/table renames. SQL comments are ignored (Prisma writes its own warnings as comments).
#
# Usage: check-destructive-migrations.sh <migration-dir-name>...
#   (run from insights-ui/; names are folders under prisma/migrations/)
# Prints a GitHub Actions ::warning:: per flagged migration and exits 1 if any were flagged.
set -euo pipefail

PATTERN='\bDROP[[:space:]]+(TABLE|COLUMN|SCHEMA|TYPE)\b|\bTRUNCATE\b|\bDELETE[[:space:]]+FROM\b|ALTER[[:space:]]+COLUMN[[:space:]]+"?[A-Za-z0-9_]+"?[[:space:]]+(SET[[:space:]]+DATA[[:space:]]+)?TYPE\b|\bRENAME[[:space:]]+COLUMN\b|ALTER[[:space:]]+TABLE[[:space:]]+[^[:space:]]+[[:space:]]+RENAME[[:space:]]+TO\b'

flagged=0
for m in "$@"; do
  [ -z "$m" ] && continue
  f="prisma/migrations/$m/migration.sql"
  hits=$(grep -v -E '^[[:space:]]*--' "$f" | grep -n -i -E "$PATTERN" || true)
  if [ -n "$hits" ]; then
    flagged=1
    echo "::warning file=insights-ui/$f::Destructive SQL in migration $m"
    echo "---- $m ----"
    echo "$hits"
  fi
done

exit "$flagged"
