#!/bin/bash
# Rebuild Chapter 57 (Carpets and other textile floor coverings): generate -> fill -> compact -> prettier -> validate.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/57-carpets-and-floor-coverings.json
cd $IU
pnpm tariff:generate-chapter --chapter 57 --slug 57-carpets-and-floor-coverings \
  --title "Carpets and other textile floor coverings" \
  --trade-file src/tariff-data/trade/chapter-57.json \
  --countries IN,TR,CN,VN,EG,MX,NL,KR,TH,NP,GB,PK,BE,CA,AF \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch57/gen.json --force
python3 $SP/ch57/fill57.py $SP/ch57/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
