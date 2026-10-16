#!/usr/bin/env bash
# Chapter 55 (Man-made staple fibers): generate -> fill. Run `pnpm tariff:refresh-chapter 55` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=55-man-made-staple-fibers
. "$(dirname "$0")/../lib.sh"

generate --title "Man-made staple fibers" \
  --trade-file src/tariff-data/trade/chapter-55.json \
  --countries KR,TR,IN,TH,DE,VN,CN,ID,JP,MX,TW,CA,AT,IT,PK,GB,BR,HN \
  --claim HN:P
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
