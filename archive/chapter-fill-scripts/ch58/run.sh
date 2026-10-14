#!/bin/bash
# Rebuild Chapter 58 (Special woven fabrics; tufted textile fabrics; lace; tapestries; trimmings; embroidery):
# generate -> fill -> compact -> prettier -> validate.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/58-special-woven-fabrics.json
cd $IU
pnpm tariff:generate-chapter --chapter 58 --slug 58-special-woven-fabrics \
  --title "Special woven fabrics; tufted textile fabrics; lace; tapestries; trimmings; embroidery" \
  --trade-file src/tariff-data/trade/chapter-58.json \
  --countries CN,TW,VN,IN,MX,IT,TR,KR,CA,DE,FR,TH,GB,JP,DO,BR \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch58/gen.json --force
python3 $SP/ch58/fill58.py $SP/ch58/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
