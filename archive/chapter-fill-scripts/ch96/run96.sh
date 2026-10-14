#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier (then validate separately)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/96-misc-manufactured-articles.json
COUNTRIES=${COUNTRIES:-CN,CA,MX,JP,VN,DE,IN,TH,FR,IT,DO,KR,ES,CZ,TW,BR,GB,MY,KH,ID}
cd $IU
pnpm tariff:generate-chapter --chapter 96 --slug 96-misc-manufactured-articles \
  --title "Miscellaneous Manufactured Articles" \
  --trade-file src/tariff-data/trade/chapter-96.json \
  --countries $COUNTRIES \
  --hts-file $SP/hts_2026_revision_21_json.json \
  --out $SP/ch96/gen.json --force
python3 $SP/ch96/fill96.py $SP/ch96/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
