#!/bin/sh
# Rebuild Chapter 56 from data: generate -> fill -> compact -> prettier (-> validate with --validate).
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/56-wadding-felt-and-twine.json
cd $IU
pnpm tariff:generate-chapter --chapter 56 --slug 56-wadding-felt-and-twine \
  --title "Wadding, Felt and Nonwovens; Special Yarns; Twine, Cordage, Ropes and Cables and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-56.json \
  --countries CN,DE,IN,CA,JP,MX,TR,KR,VN,TH,GB,TW,NL,IL,BR \
  --hts-file $SP/hts_2026_revision_21_json.json --out $OUT --force
python3 $SP/ch56/fill56.py $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
if [ "$1" = "--validate" ]; then
  pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
fi
