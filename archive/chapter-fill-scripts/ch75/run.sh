#!/bin/sh
# Regenerate + refill Chapter 75 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/75-nickel-and-articles.json
pnpm tariff:generate-chapter --chapter 75 --slug 75-nickel-and-articles --title "Nickel and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-75.json \
  --countries CA,GB,DE,FR,NO,JP,MX,AU,ZA,CN,IT,TW,FI,SE,KR,IN,BR,RU --claim ZA:D \
  --hts-file $S/hts_2026_revision_21_json.json --out $S/ch75/gen.json --force
python3 $S/ch75/fill75.py $S/ch75/gen.json $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
ls -la $F
