#!/usr/bin/env bash
# Chapter 87 (Vehicles Other Than Railway or Tramway Rolling Stock, and Parts and Accessories Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 87` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=87-motor-vehicles-and-parts
. "$(dirname "$0")/../lib.sh"

generate --title "Vehicles Other Than Railway or Tramway Rolling Stock, and Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-87.json \
  --countries MX,JP,CA,KR,DE,CN,GB,SK,IT,SE,TW,TH,IN,VN,BR \
  --include-elections
python3 "$HERE/fill87.py" "$GEN" "$OUT"
