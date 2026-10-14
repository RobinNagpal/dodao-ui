#!/usr/bin/env bash
# Chapter 65 (Headgear and Parts Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 65` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=65-headgear
. "$(dirname "$0")/../lib.sh"

generate --title "Headgear and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-65.json \
  --countries CN,VN,MX,BD,IT,ID,KH,TW,TH,PT,JP,CA,GB,IN,BR
python3 "$HERE/fill65.py" "$GEN" "$OUT"
