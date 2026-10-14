#!/bin/sh
# Regenerate + refill Chapter 93 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/93-arms-and-ammunition.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 93 --slug 93-arms-and-ammunition \
  --title "Arms and Ammunition; Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-93.json \
  --countries TR,GB,IT,DE,AT,CA,BR,TW,JP,CN,CZ,ES,HR,IL,MX,KR,IN \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch93/gen.json
python3 $S/ch93/fill93.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
