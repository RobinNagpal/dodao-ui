#!/bin/bash
# Re-run Chapter 95: generate -> fill -> compact -> prettier. Pass --no-gen to reuse gen.json.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/95-toys-games-and-sports-requisites.json
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 95 --slug 95-toys-games-and-sports-requisites \
    --title "Toys, Games and Sports Equipment; Parts and Accessories Thereof" \
    --trade-file src/tariff-data/trade/chapter-95.json \
    --countries ${COUNTRIES:-CN,VN,MX,TW,JP,ID,KH,TH,MY,CA,IN,GB,DE,KR,IT} \
    --hts-file $SP/hts_2026_revision_21_json.json \
    --out $SP/ch95/gen.json --force
fi
python3 $SP/ch95/fill95.py $SP/ch95/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
