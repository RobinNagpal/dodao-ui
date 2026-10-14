#!/usr/bin/env bash
# Chapter 76 (Aluminum and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 76` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=76-aluminum-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Aluminum and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-76.json \
  --countries CA,CN,MX,AE,KR,IN,BH,CO,DE,TH,ZA,VN,BR,GB,JP,TR,RU
python3 "$HERE/fill76.py" "$GEN" "$OUT"
