#!/usr/bin/env bash
# Chapter 69 (Ceramic Products): generate -> fill. Run `pnpm tariff:refresh-chapter 69` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=69-ceramic-products
. "$(dirname "$0")/../lib.sh"

generate --title "Ceramic Products" \
  --trade-file src/tariff-data/trade/chapter-69.json \
  --countries CN,MX,IT,ES,JP,TH,DE,IN,VN,BR,PT,TR,GB,CA
python3 "$HERE/fill69.py" "$GEN" "$OUT"
