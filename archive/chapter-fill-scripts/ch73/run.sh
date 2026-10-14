#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier -> validate (Chapter 73, #1812 batch 2)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch73
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/73-articles-of-iron-steel.json
COUNTRIES=${COUNTRIES:-CN,MX,CA,TW,IN,KR,DE,VN,JP,IT,TH,TR,GB,BR,RU}
cd $IU
pnpm tariff:generate-chapter --chapter 73 --slug 73-articles-of-iron-steel --title "Articles of Iron or Steel" \
  --trade-file src/tariff-data/trade/chapter-73.json --countries $COUNTRIES \
  --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
python3 $CH/fill73.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
