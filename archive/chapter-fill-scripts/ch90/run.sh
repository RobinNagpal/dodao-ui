#!/bin/bash
# Re-run: generate -> fill -> compact -> prettier -> validate
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/90-optical-and-precision-instruments.json
COUNTRIES=${COUNTRIES:-MX,DE,CN,IE,CR,JP,SG,CA,MY,CH,GB,FR,TW,IL,VN,KR,IN,BR}
cd $IU
if [ "$1" != "--no-gen" ]; then
pnpm tariff:generate-chapter --chapter 90 --slug 90-optical-and-precision-instruments \
  --title "Optical, Photographic, Cinematographic, Measuring, Checking, Precision, Medical or Surgical Instruments and Apparatus; Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-90.json --countries "$COUNTRIES" \
  --hts-file $SP/hts_2026_revision_21_json.json --out $SP/ch90/gen.json --force
fi
python3 $SP/ch90/fill90.py $SP/ch90/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
pnpm tariff:validate-chapters --file $OUT --check-calculator --check-hts
