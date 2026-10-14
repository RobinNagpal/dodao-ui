#!/bin/sh
# Rebuild Chapter 53 from data, then fill, compact, format and validate.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/53-other-veg-textile-fibers.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 53 --slug 53-other-veg-textile-fibers \
  --title "Other Vegetable Textile Fibers; Paper Yarn and Woven Fabrics of Paper Yarn" \
  --trade-file src/tariff-data/trade/chapter-53.json \
  --countries IN,BE,IT,GB,CN,LK,BD,FR,TR,TH,BY,LT,PH,CA,MX,BR,VN \
  --hts-file $S/hts_2026_revision_21_json.json --force
python3 $S/ch53/fill53.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
pnpm tariff:validate-chapters --file $F --check-calculator --check-hts
