#!/bin/bash
# Chapter 60 (Knitted or Crocheted Fabrics): generate -> fill -> compact -> prettier -> validate.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/60-knitted-fabrics.json
COUNTRIES=$(cat $SP/ch60/countries.txt)
cd $IU
pnpm tariff:generate-chapter --chapter 60 --slug 60-knitted-fabrics --title "Knitted or Crocheted Fabrics" \
  --trade-file src/tariff-data/trade/chapter-60.json --countries "$COUNTRIES" \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch60/gen.json --force
python3 $SP/ch60/fill.py $SP/ch60/gen.json $IU/$OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
