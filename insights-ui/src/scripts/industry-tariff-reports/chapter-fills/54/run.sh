#!/usr/bin/env bash
# Chapter 54 (Man-made filaments; strip and the like of man-made textile materials): generate -> fill. Run `pnpm tariff:refresh-chapter 54` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=54-man-made-filaments
. "$(dirname "$0")/../lib.sh"

generate --title "Man-made filaments; strip and the like of man-made textile materials" \
  --trade-file src/tariff-data/trade/chapter-54.json \
  --countries IN,CN,VN,KR,TR,DE,CA,JP,MX,TW,NL,GB,IT,SA,ID,TH,BR,GT \
  --claim GT:P
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
