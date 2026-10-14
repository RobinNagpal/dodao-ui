#!/usr/bin/env bash
# Chapter 92 (Musical instruments; parts and accessories of such articles): generate -> fill. Run `pnpm tariff:refresh-chapter 92` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=92-musical-instruments
. "$(dirname "$0")/../lib.sh"

generate --title "Musical instruments; parts and accessories of such articles" \
  --trade-file src/tariff-data/trade/chapter-92.json \
  --countries CN,ID,JP,MX,TW,MY,DE,CA,KR,IT,FR,SE,GB,VN,BR,IN
python3 "$HERE/fill92.py" "$GEN" "$OUT"
