#!/bin/bash
# Re-runnable Chapter 85 build: generate -> fill -> compact -> prettier -> validate.
set -euo pipefail
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
W=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/85-electrical-machinery-and-recorders.json
COUNTRIES=${COUNTRIES:-CN,MX,VN,TW,TH,MY,IN,JP,KR,DE,CA,ID,GB,BR}
cd "$W"
pnpm tariff:generate-chapter --chapter 85 --slug 85-electrical-machinery-and-recorders \
  --title "Electrical Machinery and Equipment and Parts Thereof; Sound Recorders and Reproducers, Television Image and Sound Recorders and Reproducers, and Parts and Accessories of Such Articles" \
  --trade-file src/tariff-data/trade/chapter-85.json --countries "$COUNTRIES" --include-elections \
  --hts-file "$S/hts_2026_revision_21_json.json" --out "$S/ch85/gen.json" --force
python3 "$S/ch85/fill85.py" "$S/ch85/gen.json" "$OUT"
pnpm tariff:compact-chapters "$OUT"
npx prettier --write "$OUT" >/dev/null
ls -la "$OUT"
pnpm tariff:validate-chapters --file "$OUT" --check-calculator --check-hts
