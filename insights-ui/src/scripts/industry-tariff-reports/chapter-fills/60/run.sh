#!/usr/bin/env bash
# Chapter 60 (Knitted or Crocheted Fabrics): generate -> fill. Run `pnpm tariff:refresh-chapter 60` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=60-knitted-fabrics
. "$(dirname "$0")/../lib.sh"

generate --title "Knitted or Crocheted Fabrics" \
  --trade-file src/tariff-data/trade/chapter-60.json \
  --countries CN,KR,IL,IN,MX,TW,CA,IT,DE,TR,VN,PT,GB,JP,BR,GT,HN
python3 "$HERE/fill.py" "$GEN" "$OUT"
