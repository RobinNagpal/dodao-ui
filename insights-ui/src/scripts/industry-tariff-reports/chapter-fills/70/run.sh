#!/usr/bin/env bash
# Chapter 70 (Glass and Glassware): generate -> fill. Run `pnpm tariff:refresh-chapter 70` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=70-glass-and-glassware
. "$(dirname "$0")/../lib.sh"

generate --title "Glass and Glassware" \
  --trade-file src/tariff-data/trade/chapter-70.json \
  --countries CN,MX,CA,DE,FR,IT,JP,MY,TW,KR,VN,IN,TR,TH,ID,GB,BR
python3 "$HERE/fill70.py" "$GEN" "$OUT"
