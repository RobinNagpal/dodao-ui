#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier -> validate
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
CH=$SP/ch68
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/68-stone-cement-and-similar.json
cd $IU
pnpm tariff:generate-chapter --chapter 68 --slug 68-stone-cement-and-similar \
  --title "Articles of Stone, Plaster, Cement, Asbestos, Mica or Similar Materials" \
  --trade-file src/tariff-data/trade/chapter-68.json \
  --countries ${COUNTRIES:-MX,CA,BR,IN,IT,CN,TR,VN,DE,JP,TH,ES,KR} \
  --hts-file $SP/hts_2026_revision_21_json.json --out $CH/gen.json --force
python3 $CH/fill68.py $CH/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
