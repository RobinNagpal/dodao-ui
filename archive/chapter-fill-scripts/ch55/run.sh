#!/bin/sh
# Rebuild Chapter 55 from data, then fill, compact, format and validate.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/55-man-made-staple-fibers.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 55 --slug 55-man-made-staple-fibers --title "Man-made staple fibers" \
  --trade-file src/tariff-data/trade/chapter-55.json \
  --countries KR,TR,IN,TH,DE,VN,CN,ID,JP,MX,TW,CA,AT,IT,PK,GB,BR,HN --claim HN:P \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch55/gen.json
python3 $S/ch55/fill.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
pnpm tariff:validate-chapters --file $F --check-calculator --check-hts
