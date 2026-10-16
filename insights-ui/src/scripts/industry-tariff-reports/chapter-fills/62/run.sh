#!/usr/bin/env bash
# Chapter 62 (Articles of Apparel and Clothing Accessories, Not Knitted or Crocheted): generate -> fill. Run `pnpm tariff:refresh-chapter 62` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=62-apparel-and-accessories-woven
. "$(dirname "$0")/../lib.sh"

generate --title "Articles of Apparel and Clothing Accessories, Not Knitted or Crocheted" \
  --trade-file src/tariff-data/trade/chapter-62.json \
  --countries VN,BD,CN,IN,ID,MX,IT,KH,PK,JO,HN,NI,GT,SV,CA \
  --claim HN:P,NI:P,GT:P,SV:P
python3 "$HERE/fill.py" "$GEN" "$OUT"
