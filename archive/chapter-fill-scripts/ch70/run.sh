#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier -> validate
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/70-glass-and-glassware.json
COUNTRIES=${COUNTRIES:-CN,MX,CA,DE,FR,IT,JP,MY,TW,KR,VN,IN,TR,TH,ID,GB,BR}
cd $IU
pnpm tariff:generate-chapter --chapter 70 --slug 70-glass-and-glassware --title "Glass and Glassware" \
  --trade-file src/tariff-data/trade/chapter-70.json --countries "$COUNTRIES" \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch70/gen.json --force
python3 $SP/ch70/fill70.py $SP/ch70/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
