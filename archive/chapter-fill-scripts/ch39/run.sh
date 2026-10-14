#!/bin/sh
# Regenerate + refill Chapter 39 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/39-plastics-and-articles.json
pnpm tariff:generate-chapter --chapter 39 --slug 39-plastics-and-articles \
  --title "Plastics and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-39.json \
  --countries CN,CA,MX,VN,KR,DE,JP,TW,TH,IN,GB,BR \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch39/gen.json
python3 $S/ch39/fill39.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
