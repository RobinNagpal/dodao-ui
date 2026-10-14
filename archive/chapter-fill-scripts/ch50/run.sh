#!/bin/sh
# Rebuild Chapter 50 from data, then fill, compact, format and validate.
set -e
cd /Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui
pnpm tariff:generate-chapter --chapter 50 --slug 50-silk --title "Silk" --countries IT,CN,KR,IN,GB,FR,JP,CH,TH,MX,CA,VN,BR,UZ --force
python3 /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch50/fill.py
pnpm tariff:compact-chapters src/tariff-data/chapters/50-silk.json
npx prettier --write src/tariff-data/chapters/50-silk.json
pnpm tariff:validate-chapters --file src/tariff-data/chapters/50-silk.json --check-calculator --check-hts
