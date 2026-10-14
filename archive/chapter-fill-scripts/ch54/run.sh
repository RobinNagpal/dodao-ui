#!/bin/sh
# Rebuild Chapter 54 from data, then fill, compact, format and validate.
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 54 --slug 54-man-made-filaments --title "Man-made filaments; strip and the like of man-made textile materials" --trade-file src/tariff-data/trade/chapter-54.json --countries IN,CN,VN,KR,TR,DE,CA,JP,MX,TW,NL,GB,IT,SA,ID,TH,BR,GT --claim GT:P --hts-file $S/hts_2026_revision_21_json.json --force
python3 $S/ch54/fill.py
pnpm tariff:compact-chapters src/tariff-data/chapters/54-man-made-filaments.json
npx prettier --write src/tariff-data/chapters/54-man-made-filaments.json
pnpm tariff:validate-chapters --file src/tariff-data/chapters/54-man-made-filaments.json --check-calculator --check-hts
