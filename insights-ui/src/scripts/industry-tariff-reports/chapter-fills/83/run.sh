#!/usr/bin/env bash
# Chapter 83 (Miscellaneous Articles of Base Metal): generate -> fill. Run `pnpm tariff:refresh-chapter 83` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=83-misc-articles-of-base-metal
. "$(dirname "$0")/../lib.sh"

generate --title "Miscellaneous Articles of Base Metal" \
  --trade-file src/tariff-data/trade/chapter-83.json \
  --countries CN,MX,CA,TW,VN,KR,IN,JP,DE,TH,IT,GB,BR,RU
python3 "$HERE/fill83.py" "$GEN" "$OUT"
