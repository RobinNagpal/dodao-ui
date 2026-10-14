#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier (then validate by hand)
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/65-headgear.json
cd $IU
pnpm tariff:generate-chapter --chapter 65 --slug 65-headgear --title "Headgear and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-65.json \
  --countries CN,VN,MX,BD,IT,ID,KH,TW,TH,PT,JP,CA,GB,IN,BR \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch65/gen.json --force
python3 $SP/ch65/fill65.py $SP/ch65/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
