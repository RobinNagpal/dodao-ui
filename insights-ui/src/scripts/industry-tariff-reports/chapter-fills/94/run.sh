#!/usr/bin/env bash
# Chapter 94 (Furniture; bedding, mattresses, mattress supports, cushions and similar stuffed furnishings; luminaires and lighting fittings, not elsewhere specified or included; illuminated signs, illuminated nameplates and the like; prefabricated buildings): generate -> fill. Run `pnpm tariff:refresh-chapter 94` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=94-furniture-and-lighting-fittings
. "$(dirname "$0")/../lib.sh"

generate --title "Furniture; bedding, mattresses, mattress supports, cushions and similar stuffed furnishings; luminaires and lighting fittings, not elsewhere specified or included; illuminated signs, illuminated nameplates and the like; prefabricated buildings" \
  --trade-file src/tariff-data/trade/chapter-94.json \
  --countries VN,CN,MX,CA,IT,MY,KH,ID,TH,IN,TW,GB,DE,PL,JP,BR
python3 "$HERE/fill.py" "$GEN" "$OUT"
