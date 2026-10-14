#!/bin/sh
# Re-run: generate -> fill -> compact -> prettier (Chapter 62, woven apparel)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/62-apparel-and-accessories-woven.json
cd $IU
pnpm tariff:generate-chapter --chapter 62 --slug 62-apparel-and-accessories-woven \
  --title "Articles of Apparel and Clothing Accessories, Not Knitted or Crocheted" \
  --trade-file src/tariff-data/trade/chapter-62.json \
  --countries VN,BD,CN,IN,ID,MX,IT,KH,PK,JO,HN,NI,GT,SV,CA --claim HN:P,NI:P,GT:P,SV:P \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch62/gen.json --force
python3 $SP/ch62/fill.py $SP/ch62/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
