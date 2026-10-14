#!/bin/sh
# Regenerate + refill Chapter 94 (re-runnable): sh run.sh
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/94-furniture-and-lighting-fittings.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 94 --slug 94-furniture-and-lighting-fittings \
  --title "Furniture; bedding, mattresses, mattress supports, cushions and similar stuffed furnishings; luminaires and lighting fittings, not elsewhere specified or included; illuminated signs, illuminated nameplates and the like; prefabricated buildings" \
  --trade-file src/tariff-data/trade/chapter-94.json \
  --countries ${COUNTRIES:-VN,CN,MX,CA,IT,MY,KH,ID,TH,IN,TW,GB,DE,PL,JP,BR} \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch94/gen.json
python3 $S/ch94/fill.py $S/ch94/gen.json $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
