#!/bin/sh
# Rebuild Chapter 52 (Cotton): generate -> fill -> compact -> prettier -> validate.
set -e
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/52-cotton.json
pnpm tariff:generate-chapter --chapter 52 --slug 52-cotton --title "Cotton" --trade-file src/tariff-data/trade/chapter-52.json --countries PK,KR,IN,IT,MX,TR,JP,CN,ID,FR,CA,GB,VN,BR,EG,SV,GT,HN,PE --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json --force
cp $F /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch52/gen.json
python3 /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch52/fill.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
pnpm tariff:validate-chapters --file $F --check-calculator --check-hts
