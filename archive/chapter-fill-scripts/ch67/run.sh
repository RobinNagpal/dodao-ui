#!/bin/sh
# Regenerate + refill Chapter 67 (re-runnable).
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/67-feathers-and-artificial-flowers.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 67 --slug 67-feathers-and-artificial-flowers \
  --title "Prepared Feathers and Down and Articles Made of Feathers or of Down; Artificial Flowers; Articles of Human Hair" \
  --trade-file src/tariff-data/trade/chapter-67.json \
  --countries CN,ID,BD,VN,SN,IN,KH,TH,IT,CA,MX,MM,KR,BR --claim SN:D \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch67/gen.json
python3 $S/ch67/fill67.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
