#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier (pass --no-gen to reuse gen.json).
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch40
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/40-rubber-and-articles.json
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 40 --slug 40-rubber-and-articles --title "Rubber and Articles Thereof" \
    --trade-file src/tariff-data/trade/chapter-40.json \
    --countries TH,MX,CA,JP,MY,VN,ID,CN,KR,KH,DE,IN,TW,BR,CI,GB --claim CI:D \
    --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
fi
python3 $CH/fill40.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
