#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier. Pass --no-gen to reuse gen.json.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch69
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/69-ceramic-products.json
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 69 --slug 69-ceramic-products --title "Ceramic Products" \
    --trade-file src/tariff-data/trade/chapter-69.json \
    --countries CN,MX,IT,ES,JP,TH,DE,IN,VN,BR,PT,TR,GB,CA \
    --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json \
    --out $SP/gen.json --force
fi
python3 $SP/fill69.py $SP/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
