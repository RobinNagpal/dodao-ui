#!/usr/bin/env bash
# Chapter 63 (Other Made Up Textile Articles; Needlecraft Sets; Worn Clothing and Worn Textile Articles; Rags): generate -> fill. Run `pnpm tariff:refresh-chapter 63` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=63-made-up-textile-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Other Made Up Textile Articles; Needlecraft Sets; Worn Clothing and Worn Textile Articles; Rags" \
  --trade-file src/tariff-data/trade/chapter-63.json \
  --countries CN,IN,PK,MX,VN,TR,KH,BD,PT,CA,TH,TW,KR,IT,DO \
  --claim DO:P
python3 "$HERE/fill.py" "$GEN" "$OUT"
