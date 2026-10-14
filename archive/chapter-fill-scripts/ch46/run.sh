#!/bin/sh
# Regenerate + refill Chapter 46 (re-runnable).
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/46-straw-and-wickerwork.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui
pnpm tariff:generate-chapter --chapter 46 --slug 46-straw-and-wickerwork \
  --title "Manufactures of Straw, of Esparto or of Other Plaiting Materials; Basketware and Wickerwork" \
  --trade-file src/tariff-data/trade/chapter-46.json \
  --countries VN,CN,IN,MX,PH,ID,TH,IT,MG,KH,CA --claim MG:D \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch46/gen.json
python3 $S/ch46/fill.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
