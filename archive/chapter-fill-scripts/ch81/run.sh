#!/bin/bash
# Re-runnable Chapter 81 build: generate -> fill -> compact -> prettier.
set -euo pipefail
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
W=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=src/tariff-data/chapters/81-other-base-metals-and-cermets.json
COUNTRIES=${COUNTRIES:-CN,JP,DE,GB,CA,FR,KR,TH,KZ,MX,IL,BR,IN,NO,ID,TW,CL,SA,MG,RU}
cd "$W"
pnpm tariff:generate-chapter --chapter 81 --slug 81-other-base-metals-and-cermets --title "Other Base Metals; Cermets; Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-81.json --countries "$COUNTRIES" --claim MG:D \
  --hts-file "$S/hts_2026_revision_21_json.json" --out "$S/ch81/gen.json" --force
python3 "$S/ch81/fill81.py" "$S/ch81/gen.json" "$OUT"
pnpm tariff:compact-chapters "$OUT"
npx prettier --write "$OUT" >/dev/null
ls -la "$OUT"
