#!/usr/bin/env bash
# Chapter 66 (Umbrellas, Sun Umbrellas, Walking-Sticks, Seat-Sticks, Whips, Riding-Crops and Parts Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 66` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=66-umbrellas-and-accessories
. "$(dirname "$0")/../lib.sh"

generate --title "Umbrellas, Sun Umbrellas, Walking-Sticks, Seat-Sticks, Whips, Riding-Crops and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-66.json \
  --countries CN,VN,TW,KH,IT,MX,CA,ID,BE,DE,IN,GB,JP,BR
cp "$GEN" "$OUT"
python3 "$HERE/fill66.py"
