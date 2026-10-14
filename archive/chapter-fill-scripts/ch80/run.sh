#!/bin/sh
# Regenerate + refill Chapter 80 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/80-tin-and-articles.json
pnpm tariff:generate-chapter --chapter 80 --slug 80-tin-and-articles --title "Tin and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-80.json \
  --countries PE,BO,ID,PL,BR,MX,MY,JP,CA,TH,RW,CD,CN,DE,GB --claim CD:D,RW:D \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch80/gen.json
if [ -f $S/ch80/fill80.py ]; then python3 $S/ch80/fill80.py $F; fi
pnpm tariff:compact-chapters $F
npx prettier --write $F
