#!/usr/bin/env bash
# Chapter 39 (Plastics and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 39` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=39-plastics-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Plastics and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-39.json \
  --countries CN,CA,MX,VN,KR,DE,JP,TW,TH,IN,GB,BR
cp "$GEN" "$OUT"
python3 "$HERE/fill39.py"
