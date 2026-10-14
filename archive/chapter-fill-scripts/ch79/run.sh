#!/bin/sh
# Regenerate + refill Chapter 79 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/79-zinc-and-articles.json
pnpm tariff:generate-chapter --chapter 79 --slug 79-zinc-and-articles --title "Zinc and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-79.json \
  --countries CA,MX,PE,AU,CN,ES,TW,KR,BE,IN,VN,DE,GB,BR,JP \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch79/gen.json
python3 $S/ch79/fill79.py $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
