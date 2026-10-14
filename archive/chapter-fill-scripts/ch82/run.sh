#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier [-> validate] (Chapter 82, #1812 batch 2)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch82
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/82-base-metal-tools-and-implements.json
COUNTRIES=${COUNTRIES:-CN,TW,DE,VN,JP,MX,IN,KR,CA,IT,CH,TH,IL,SE,GB,BR,RU}
cd $IU
pnpm tariff:generate-chapter --chapter 82 --slug 82-base-metal-tools-and-implements \
  --title "Tools, Implements, Cutlery, Spoons and Forks, of Base Metal; Parts Thereof of Base Metal" \
  --trade-file src/tariff-data/trade/chapter-82.json --countries $COUNTRIES \
  --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
python3 $CH/fill82.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
