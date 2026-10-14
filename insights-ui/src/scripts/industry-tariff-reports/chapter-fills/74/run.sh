#!/usr/bin/env bash
# Chapter 74 (Copper and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 74` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=74-copper-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Copper and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-74.json \
  --countries CL,CA,CD,PE,KR,MX,DE,AU,CN,JP,TH,IN,GB,BR,VN \
  --claim CD:D
cp "$GEN" "$OUT"
python3 "$HERE/fill74.py" "$OUT"
