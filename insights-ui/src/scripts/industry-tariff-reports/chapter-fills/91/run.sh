#!/usr/bin/env bash
# Chapter 91 (Clocks and Watches and Parts Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 91` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=91-clocks-and-watches
. "$(dirname "$0")/../lib.sh"

generate --title "Clocks and Watches and Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-91.json \
  --countries CH,JP,CN,DE,MX,TH,FR,SG,PH,IT,CA,VN,GB,MY,TW,HK,IN,BR
python3 "$HERE/fill91.py" "$GEN" "$OUT"
