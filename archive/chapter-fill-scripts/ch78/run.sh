#!/bin/sh
# Regenerate + refill Chapter 78 (re-runnable): generate -> fill -> compact -> prettier.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
F=src/tariff-data/chapters/78-lead-and-articles.json
pnpm tariff:generate-chapter --chapter 78 --slug 78-lead-and-articles --title "Lead and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-78.json \
  --countries CA,MX,AU,KR,GB,KZ,GH,DE,ZA,NG,CN,IN,BR,JP,VN --claim GH:D,NG:D,ZA:D \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch78/gen.json
python3 $S/ch78/fill78.py $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
