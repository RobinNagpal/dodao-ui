#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier (pass --no-gen to reuse gen.json; --validate to run the gates). Chapter 84, #1812 batch 2.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch84
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/84-nuclear-reactors-and-machinery.json
COUNTRIES=${COUNTRIES:-MX,TW,VN,CN,JP,TH,DE,CA,KR,IT,GB,MY,FR,IN,BR,SG}
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 84 --slug 84-nuclear-reactors-and-machinery \
    --title "Nuclear Reactors, Boilers, Machinery and Mechanical Appliances; Parts Thereof" \
    --trade-file src/tariff-data/trade/chapter-84.json --countries $COUNTRIES --include-elections \
    --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
fi
python3 $CH/fill84.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ] || [ "$2" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
