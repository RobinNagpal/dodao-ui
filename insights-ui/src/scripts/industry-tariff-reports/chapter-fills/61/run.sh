#!/usr/bin/env bash
# Chapter 61 (Articles of Apparel and Clothing Accessories, Knitted or Crocheted): generate -> fill. Run `pnpm tariff:refresh-chapter 61` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=61-apparel-and-accessories-knit
. "$(dirname "$0")/../lib.sh"

generate --title "Articles of Apparel and Clothing Accessories, Knitted or Crocheted" \
  --trade-file src/tariff-data/trade/chapter-61.json \
  --countries VN,CN,KH,BD,ID,IN,HN,NI,JO,PK,GT,SV,LK,MX,EG,DO,HT,KE,IT,CA \
  --claim KE:D
python3 "$HERE/fill.py" "$GEN" "$OUT"
