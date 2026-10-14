#!/bin/bash
# Re-runnable Chapter 88 build: generate -> fill -> compact -> prettier.
set -euo pipefail
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
W=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/88-aircraft-and-spacecraft.json
COUNTRIES=${COUNTRIES:-CA,FR,DE,GB,BR,JP,MX,IT,CH,KR,IL,CN,AU,TR,VN}
cd "$W"
VARY=(--vary-facts civilAircraftGn6)
pnpm tariff:generate-chapter --chapter 88 --slug 88-aircraft-and-spacecraft --title "Aircraft, Spacecraft, and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-88.json --countries "$COUNTRIES" "${VARY[@]}" \
  --hts-file "$S/hts_2026_revision_21_json.json" --out "$S/ch88/gen.json" --force
python3 "$S/ch88/fill88.py" "$S/ch88/gen.json" "$OUT"
pnpm tariff:compact-chapters "$OUT"
npx prettier --write "$OUT" >/dev/null
ls -la "$OUT"
