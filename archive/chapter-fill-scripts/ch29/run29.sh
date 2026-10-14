#!/bin/bash
# Regenerate + fill Chapter 29 (re-runnable). Usage: bash run29.sh
set -e
S=$(cd "$(dirname "$0")" && pwd)
WT=/Users/robin/projects/worktrees/chapter-migration-1810-batch2/insights-ui
cd "$WT"
pnpm tariff:generate-chapter --chapter 29 --slug 29-organic-chemicals --title "Organic Chemicals" --countries IE,CN,IN,SG,DE,CA,CH,JP,NL,IT,GB,MX,BR --out "$S/gen.json" --force
python3 "$S/fill29.py" "$S/gen.json" "$WT/src/tariff-data/chapters/29-organic-chemicals.json"
pnpm tariff:validate-chapters --file src/tariff-data/chapters/29-organic-chemicals.json --check-calculator --check-hts
npx prettier --check src/tariff-data/chapters/29-organic-chemicals.json
