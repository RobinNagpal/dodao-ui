#!/bin/sh
# Regenerate + refill Chapter 92 (re-runnable): sh run.sh   (validate separately)
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/92-musical-instruments.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 92 --slug 92-musical-instruments \
  --title "Musical instruments; parts and accessories of such articles" \
  --trade-file src/tariff-data/trade/chapter-92.json \
  --countries CN,ID,JP,MX,TW,MY,DE,CA,KR,IT,FR,SE,GB,VN,BR,IN \
  --hts-file $S/hts_2026_revision_21_json.json --out $S/ch92/gen.json --force
python3 $S/ch92/fill92.py $S/ch92/gen.json $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
ls -la $F
