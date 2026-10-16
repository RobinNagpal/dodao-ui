#!/usr/bin/env bash
# Chapter 64 (Footwear, Gaiters and the Like; Parts of Such Articles): generate -> fill. Run `pnpm tariff:refresh-chapter 64` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=64-footwear-and-gaiters
. "$(dirname "$0")/../lib.sh"

generate --title "Footwear, Gaiters and the Like; Parts of Such Articles" \
  --trade-file src/tariff-data/trade/chapter-64.json \
  --countries VN,CN,ID,IT,KH,MX,IN,DE,BD,BR,PT,ES,DO,TH,CA,JP,GB
python3 "$HERE/fill64.py" "$GEN" "$OUT"
