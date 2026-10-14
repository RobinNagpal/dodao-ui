#!/bin/sh
# Re-run: generate -> fill -> compact -> prettier -> validate (Chapter 63)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/63-made-up-textile-articles.json
cd $IU
pnpm tariff:generate-chapter --chapter 63 --slug 63-made-up-textile-articles \
  --title "Other Made Up Textile Articles; Needlecraft Sets; Worn Clothing and Worn Textile Articles; Rags" \
  --trade-file src/tariff-data/trade/chapter-63.json \
  --countries CN,IN,PK,MX,VN,TR,KH,BD,PT,CA,TH,TW,KR,IT,DO --claim DO:P \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch63/gen.json --force
python3 $SP/ch63/fill.py $SP/ch63/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
