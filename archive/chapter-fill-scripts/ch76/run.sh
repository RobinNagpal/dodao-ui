#!/bin/bash
# Re-runnable Chapter 76 build: generate -> fill -> compact -> prettier.
set -euo pipefail
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
W=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/76-aluminum-and-articles.json
COUNTRIES=${COUNTRIES:-CA,CN,MX,AE,KR,IN,BH,CO,DE,TH,ZA,VN,BR,GB,JP,TR,RU}
cd "$W"
TRADE=()
if [ -f src/tariff-data/trade/chapter-76.json ]; then TRADE=(--trade-file src/tariff-data/trade/chapter-76.json); fi
pnpm tariff:generate-chapter --chapter 76 --slug 76-aluminum-and-articles --title "Aluminum and Articles Thereof" \
  ${TRADE[@]+"${TRADE[@]}"} --countries "$COUNTRIES" --hts-file "$S/hts_2026_revision_21_json.json" --out "$S/ch76/gen.json" --force
python3 "$S/ch76/fill76.py" "$S/ch76/gen.json" "$OUT"
pnpm tariff:compact-chapters "$OUT"
npx prettier --write "$OUT" >/dev/null
ls -la "$OUT"
