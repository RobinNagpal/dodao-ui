#!/bin/sh
# Rebuild Chapter 51 from data, then fill, compact, format and validate.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/51-wool-and-horsehair.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 51 --slug 51-wool-and-horsehair \
  --title "Wool, Fine or Coarse Animal Hair; Horsehair Yarn and Woven Fabric" \
  --trade-file src/tariff-data/trade/chapter-51.json \
  --countries ${COUNTRIES:-PE,IT,GB,MX,CL,CA,BE,IN,TR,NZ,RO,CN,AU,ZA,UY,BR,JP} \
  --hts-file $S/hts_2026_revision_21_json.json --force
python3 $S/ch51/fill51.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
pnpm tariff:validate-chapters --file $F --check-calculator --check-hts
