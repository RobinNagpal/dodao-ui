#!/usr/bin/env bash
# Chapter 40 (Rubber and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 40` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=40-rubber-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Rubber and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-40.json \
  --countries TH,MX,CA,JP,MY,VN,ID,CN,KR,KH,DE,IN,TW,BR,CI,GB \
  --claim CI:D
python3 "$HERE/fill40.py" "$GEN" "$OUT"
