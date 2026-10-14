#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier (validate separately)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/91-clocks-and-watches.json
COUNTRIES=${COUNTRIES:-CH,JP,CN,DE,MX,TH,FR,SG,PH,IT,CA,VN,GB,MY,TW,HK,IN,BR}
cd $IU
pnpm tariff:generate-chapter --chapter 91 --slug 91-clocks-and-watches \
  --title "Clocks and Watches and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-91.json \
  --countries $COUNTRIES \
  --hts-file $SP/hts_2026_revision_21_json.json \
  --out $SP/ch91/gen.json --force
python3 $SP/ch91/fill91.py $SP/ch91/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
