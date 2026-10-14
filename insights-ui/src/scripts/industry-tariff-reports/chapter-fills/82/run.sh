#!/usr/bin/env bash
# Chapter 82 (Tools, Implements, Cutlery, Spoons and Forks, of Base Metal; Parts Thereof of Base Metal): generate -> fill. Run `pnpm tariff:refresh-chapter 82` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=82-base-metal-tools-and-implements
. "$(dirname "$0")/../lib.sh"

generate --title "Tools, Implements, Cutlery, Spoons and Forks, of Base Metal; Parts Thereof of Base Metal" \
  --trade-file src/tariff-data/trade/chapter-82.json \
  --countries CN,TW,DE,VN,JP,MX,IN,KR,CA,IT,CH,TH,IL,SE,GB,BR,RU
python3 "$HERE/fill82.py" "$GEN" "$OUT"
