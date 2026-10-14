#!/usr/bin/env bash
# Chapter 52 (Cotton): generate -> fill. Run `pnpm tariff:refresh-chapter 52` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=52-cotton
. "$(dirname "$0")/../lib.sh"

generate --title "Cotton" \
  --trade-file src/tariff-data/trade/chapter-52.json \
  --countries PK,KR,IN,IT,MX,TR,JP,CN,ID,FR,CA,GB,VN,BR,EG,SV,GT,HN,PE
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
