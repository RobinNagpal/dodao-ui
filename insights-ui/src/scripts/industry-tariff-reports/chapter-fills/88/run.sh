#!/usr/bin/env bash
# Chapter 88 (Aircraft, Spacecraft, and Parts Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 88` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=88-aircraft-and-spacecraft
. "$(dirname "$0")/../lib.sh"

generate --title "Aircraft, Spacecraft, and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-88.json \
  --countries CA,FR,DE,GB,BR,JP,MX,IT,CH,KR,IL,CN,AU,TR,VN \
  --vary-facts civilAircraftGn6
python3 "$HERE/fill88.py" "$GEN" "$OUT"
