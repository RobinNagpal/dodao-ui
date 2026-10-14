#!/bin/sh
# Regenerate + refill Chapter 49 (re-runnable).
set -e
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/49-printing-industry-products.json
pnpm tariff:generate-chapter --chapter 49 --slug 49-printing-industry-products \
  --title "Printed Books, Newspapers, Pictures and Other Products of the Printing Industry; Manuscripts, Typescripts and Plans" \
  --countries CN,CA,MX,GB,IT,IN,VN,DE,KR,JP,HK,BR \
  --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json --force
cp $F /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch49/gen.json
python3 /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch49/fill-b2.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
