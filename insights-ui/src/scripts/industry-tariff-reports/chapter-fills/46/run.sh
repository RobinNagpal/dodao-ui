#!/usr/bin/env bash
# Chapter 46 (Manufactures of Straw, of Esparto or of Other Plaiting Materials; Basketware and Wickerwork): generate -> fill. Run `pnpm tariff:refresh-chapter 46` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=46-straw-and-wickerwork
. "$(dirname "$0")/../lib.sh"

generate --title "Manufactures of Straw, of Esparto or of Other Plaiting Materials; Basketware and Wickerwork" \
  --trade-file src/tariff-data/trade/chapter-46.json \
  --countries VN,CN,IN,MX,PH,ID,TH,IT,MG,KH,CA \
  --claim MG:D
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
