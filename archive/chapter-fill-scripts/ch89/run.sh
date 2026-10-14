#!/bin/bash
# Re-runnable Chapter 89 build: generate -> fill -> compact -> prettier.
set -euo pipefail
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
W=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/89-ships-and-floating-structures.json
COUNTRIES=${COUNTRIES:-CA,MX,CN,IT,KR,FR,GB,DE,FI,TR,TW,AU,PL,ZA,NL,BR,VN,JP}
cd "$W"
if [ "${SKIP_GEN:-}" != "1" ]; then
pnpm tariff:generate-chapter --chapter 89 --slug 89-ships-and-floating-structures --title "Ships, Boats and Floating Structures" \
  --trade-file src/tariff-data/trade/chapter-89.json --countries "$COUNTRIES" --claim ZA:D \
  --hts-file "$S/hts_2026_revision_21_json.json" --out "$S/ch89/gen.json" --force
fi
python3 "$S/ch89/fill89.py" "$S/ch89/gen.json" "$OUT"
pnpm tariff:compact-chapters "$OUT"
npx prettier --write "$OUT" >/dev/null
ls -la "$OUT"
