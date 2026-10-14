#!/bin/sh
# Regenerate + fill Chapter 35. Run from anywhere.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
APP=/Users/robin/projects/worktrees/chapter-migration-1810-batch2/insights-ui
OUT=$APP/src/tariff-data/chapters/35-albuminoidal-substances-and-glues.json
cd "$APP"
pnpm tariff:generate-chapter --chapter 35 --slug 35-albuminoidal-substances-and-glues \
  --title "Albuminoidal substances; modified starches; glues; enzymes" \
  --countries DK,CN,DE,NZ,BR,CA,FR,JP,IE,GB,NL,MX,AU,KR --out "$HERE/gen.json" --force
python3 "$HERE/fill35.py" "$HERE/gen.json" "$OUT"
npx prettier --write "$OUT"
pnpm tariff:validate-chapters --file "$OUT" --check-calculator --check-hts
