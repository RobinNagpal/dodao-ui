#!/usr/bin/env bash
# Chapter 89 (Ships, Boats and Floating Structures): generate -> fill. Run `pnpm tariff:refresh-chapter 89` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=89-ships-and-floating-structures
. "$(dirname "$0")/../lib.sh"

generate --title "Ships, Boats and Floating Structures" \
  --trade-file src/tariff-data/trade/chapter-89.json \
  --countries CA,MX,CN,IT,KR,FR,GB,DE,FI,TR,TW,AU,PL,ZA,NL,BR,VN,JP \
  --claim ZA:D
python3 "$HERE/fill89.py" "$GEN" "$OUT"
