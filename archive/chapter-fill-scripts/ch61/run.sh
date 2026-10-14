#!/bin/bash
# Chapter 61 (Articles of apparel and clothing accessories, knitted or crocheted):
# generate -> fill -> compact -> prettier [-> validate with --validate]
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/61-apparel-and-accessories-knit.json
cd $IU
if [ "$1" != "--skip-gen" ]; then
pnpm tariff:generate-chapter --chapter 61 --slug 61-apparel-and-accessories-knit \
  --title "Articles of Apparel and Clothing Accessories, Knitted or Crocheted" \
  --trade-file src/tariff-data/trade/chapter-61.json \
  --countries VN,CN,KH,BD,ID,IN,HN,NI,JO,PK,GT,SV,LK,MX,EG,DO,HT,KE,IT,CA \
  --claim KE:D \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch61/gen.json --force
fi
python3 $SP/ch61/fill.py $SP/ch61/gen.json $IU/$OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" == "--validate" ] || [ "$2" == "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
