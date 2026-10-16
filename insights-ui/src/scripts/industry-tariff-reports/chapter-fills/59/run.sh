#!/usr/bin/env bash
# Chapter 59 (Impregnated, Coated, Covered or Laminated Textile Fabrics; Textile Articles of a Kind Suitable for Industrial Use): generate -> fill. Run `pnpm tariff:refresh-chapter 59` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=59-coated-textile-fabrics
. "$(dirname "$0")/../lib.sh"

generate --title "Impregnated, Coated, Covered or Laminated Textile Fabrics; Textile Articles of a Kind Suitable for Industrial Use" \
  --trade-file src/tariff-data/trade/chapter-59.json \
  --countries MX,IN,CA,CN,VN,JP,DE,KR,IT,TW,GB,NL,TR,IL,KH,BR,CR \
  --claim CR:P
python3 "$HERE/fill59.py" "$GEN" "$OUT"
