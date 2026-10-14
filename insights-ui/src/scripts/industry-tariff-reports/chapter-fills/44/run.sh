#!/usr/bin/env bash
# Chapter 44 (Wood and articles of wood; wood charcoal): generate -> fill. Run `pnpm tariff:refresh-chapter 44` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=44-wood-and-charcoal
. "$(dirname "$0")/../lib.sh"

generate --title "Wood and articles of wood; wood charcoal" \
  --trade-file src/tariff-data/trade/chapter-44.json \
  --countries CA,CN,BR,VN,CL,ID,DE,MX,SE,KH,MY,NZ,GB,JP
python3 "$HERE/fill.py" "$GEN" "$OUT"
