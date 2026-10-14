#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier [-> validate] (Chapter 83, #1812 batch 2)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch83
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/83-misc-articles-of-base-metal.json
COUNTRIES=${COUNTRIES:-CN,MX,CA,TW,VN,KR,IN,JP,DE,TH,IT,GB,BR,RU}
cd $IU
if [ "$1" != "--skip-gen" ]; then
pnpm tariff:generate-chapter --chapter 83 --slug 83-misc-articles-of-base-metal --title "Miscellaneous Articles of Base Metal" \
  --trade-file src/tariff-data/trade/chapter-83.json --countries $COUNTRIES \
  --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
fi
python3 $CH/fill83.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ] || [ "$2" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
