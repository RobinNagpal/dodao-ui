#!/usr/bin/env bash
# Chapter 14 (Vegetable Plaiting Materials; Vegetable Products Not Elsewhere Specified or Included): generate -> fill. Run `pnpm tariff:refresh-chapter 14` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=14-plaiting-materials-nes
. "$(dirname "$0")/../lib.sh"

generate --title "Vegetable Plaiting Materials; Vegetable Products Not Elsewhere Specified or Included" \
  --countries MX,IN,CN,LK,TH,NL,AR,TR,CA,CI,BR,DO \
  --claim CI:D
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
