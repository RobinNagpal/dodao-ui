#!/usr/bin/env bash
# Chapter 93 (Arms and Ammunition; Parts and Accessories Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 93` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=93-arms-and-ammunition
. "$(dirname "$0")/../lib.sh"

generate --title "Arms and Ammunition; Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-93.json \
  --countries TR,GB,IT,DE,AT,CA,BR,TW,JP,CN,CZ,ES,HR,IL,MX,KR,IN
cp "$GEN" "$OUT"
python3 "$HERE/fill93.py"
