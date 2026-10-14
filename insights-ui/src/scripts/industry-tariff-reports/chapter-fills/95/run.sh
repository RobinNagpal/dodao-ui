#!/usr/bin/env bash
# Chapter 95 (Toys, Games and Sports Equipment; Parts and Accessories Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 95` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=95-toys-games-and-sports-requisites
. "$(dirname "$0")/../lib.sh"

generate --title "Toys, Games and Sports Equipment; Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-95.json \
  --countries CN,VN,MX,TW,JP,ID,KH,TH,MY,CA,IN,GB,DE,KR,IT
python3 "$HERE/fill95.py" "$GEN" "$OUT"
