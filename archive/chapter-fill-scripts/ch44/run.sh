#!/bin/sh
# Regenerate + refill Chapter 44 (re-runnable): sh run.sh
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/44-wood-and-charcoal.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 44 --slug 44-wood-and-charcoal \
  --title "Wood and articles of wood; wood charcoal" \
  --trade-file src/tariff-data/trade/chapter-44.json \
  --countries CA,CN,BR,VN,CL,ID,DE,MX,SE,KH,MY,NZ,GB,JP \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch44/gen.json
python3 $S/ch44/fill.py $S/ch44/gen.json $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
