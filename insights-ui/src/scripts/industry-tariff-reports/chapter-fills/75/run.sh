#!/usr/bin/env bash
# Chapter 75 (Nickel and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 75` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=75-nickel-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Nickel and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-75.json \
  --countries CA,GB,DE,FR,NO,JP,MX,AU,ZA,CN,IT,TW,FI,SE,KR,IN,BR,RU \
  --claim ZA:D
python3 "$HERE/fill75.py" "$GEN" "$OUT"
