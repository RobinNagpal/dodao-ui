#!/bin/sh
# Regenerate + refill Chapter 66 (re-runnable).
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/66-umbrellas-and-accessories.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 66 --slug 66-umbrellas-and-accessories \
  --title "Umbrellas, Sun Umbrellas, Walking-Sticks, Seat-Sticks, Whips, Riding-Crops and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-66.json \
  --countries $(cat $S/ch66/countries.txt) \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch66/gen.json
python3 $S/ch66/fill66.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
