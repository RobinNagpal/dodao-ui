#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier (then validate separately)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/71-pearls-stones-and-jewelry.json
COUNTRIES=${COUNTRIES:-CH,AU,ZA,CA,MX,IN,DE,IT,KZ,FR,SG,GB,HK,BE,IL,CO,TH,JP,KR,CN,BR,RU}
cd $IU
pnpm tariff:generate-chapter --chapter 71 --slug 71-pearls-stones-and-jewelry \
  --title "Natural or Cultured Pearls, Precious or Semiprecious Stones, Precious Metals, Metals Clad With Precious Metal, and Articles Thereof; Imitation Jewelry; Coin" \
  --trade-file src/tariff-data/trade/chapter-71.json \
  --countries $COUNTRIES --claim ZA:D \
  --hts-file $SP/hts_2026_revision_21_json.json \
  --out $SP/ch71/gen.json --force
python3 $SP/ch71/fill71.py $SP/ch71/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
