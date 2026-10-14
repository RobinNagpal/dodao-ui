#!/bin/sh
# Regenerate + refill Chapter 74 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/74-copper-and-articles.json
pnpm tariff:generate-chapter --chapter 74 --slug 74-copper-and-articles --title "Copper and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-74.json \
  --countries CL,CA,CD,PE,KR,MX,DE,AU,CN,JP,TH,IN,GB,BR,VN --claim CD:D \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch74/gen.json
python3 $S/ch74/fill74.py $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
