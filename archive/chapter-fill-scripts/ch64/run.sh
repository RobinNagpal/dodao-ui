#!/bin/bash
# Re-run Chapter 64: generate -> fill -> compact -> prettier. Pass --no-gen to reuse gen.json.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch64
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/64-footwear-and-gaiters.json
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 64 --slug 64-footwear-and-gaiters \
    --title "Footwear, Gaiters and the Like; Parts of Such Articles" \
    --trade-file src/tariff-data/trade/chapter-64.json \
    --countries VN,CN,ID,IT,KH,MX,IN,DE,BD,BR,PT,ES,DO,TH,CA,JP,GB \
    --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json \
    --out $SP/gen.json --force
fi
python3 $SP/fill64.py $SP/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
