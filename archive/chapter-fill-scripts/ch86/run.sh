#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier -> validate (Chapter 86, #1812 batch 2)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch86
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/86-railway-locomotives-and-fixtures.json
COUNTRIES=${COUNTRIES:-CN,MX,CA,JP,DE,IN,AT,NL,FR,IT,PL,CZ,HU,KR,GB,CH,BR,RU}
cd $IU
pnpm tariff:generate-chapter --chapter 86 --slug 86-railway-locomotives-and-fixtures \
  --title "Railway or Tramway Locomotives, Rolling Stock and Parts Thereof; Railway or Tramway Track Fixtures and Fittings and Parts Thereof; Mechanical (Including Electro-Mechanical) Traffic Signaling Equipment of All Kinds" \
  --trade-file src/tariff-data/trade/chapter-86.json --countries $COUNTRIES \
  --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
python3 $CH/fill86.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
