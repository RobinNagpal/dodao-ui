#!/bin/sh
# Regenerate + refill Chapter 37 (re-runnable).
set -e
HERE=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch37
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/37-photographic-goods.json
pnpm tariff:generate-chapter --chapter 37 --slug 37-photographic-goods \
  --title "Photographic or Cinematographic Goods" \
  --trade-file src/tariff-data/trade/chapter-37.json \
  --countries JP,DE,TW,NL,KR,BE,SG,GB,BR,CN,MX,CA,FR \
  --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json --force
cp $F $HERE/gen.json
python3 $HERE/fill37.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
