#!/bin/bash
# Re-runnable Chapter 87 build: generate -> fill -> compact -> prettier -> validate.
set -euo pipefail
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/87-motor-vehicles-and-parts.json
COUNTRIES=${COUNTRIES:-MX,JP,CA,KR,DE,CN,GB,SK,IT,SE,TW,TH,IN,VN,BR}
cd "$IU"
pnpm tariff:generate-chapter --chapter 87 --slug 87-motor-vehicles-and-parts \
  --title "Vehicles Other Than Railway or Tramway Rolling Stock, and Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-87.json --countries "$COUNTRIES" --include-elections \
  --hts-file "$SP/hts_2026_revision_21_json.json" --out "$SP/ch87/gen.json" --force
python3 "$SP/ch87/fill87.py" "$SP/ch87/gen.json" "$OUT"
pnpm tariff:compact-chapters "$OUT"
npx prettier --write "$OUT" >/dev/null
ls -la "$OUT"
pnpm tariff:validate-chapters --file "$OUT" --check-calculator --check-hts
