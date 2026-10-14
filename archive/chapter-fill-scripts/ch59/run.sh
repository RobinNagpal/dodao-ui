#!/bin/bash
# Chapter 59 (re-runnable): generate -> fill -> compact -> prettier -> validate
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/59-coated-textile-fabrics.json
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 59 --slug 59-coated-textile-fabrics \
    --title "Impregnated, Coated, Covered or Laminated Textile Fabrics; Textile Articles of a Kind Suitable for Industrial Use" \
    --trade-file src/tariff-data/trade/chapter-59.json \
    --countries MX,IN,CA,CN,VN,JP,DE,KR,IT,TW,GB,NL,TR,IL,KH,BR,CR --claim CR:P \
    --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch59/gen.json --force
fi
python3 $SP/ch59/fill59.py $SP/ch59/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
