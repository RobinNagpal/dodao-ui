#!/usr/bin/env bash
# Chapter 57 (Carpets and other textile floor coverings): generate -> fill. Run `pnpm tariff:refresh-chapter 57` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=57-carpets-and-floor-coverings
. "$(dirname "$0")/../lib.sh"

generate --title "Carpets and other textile floor coverings" \
  --trade-file src/tariff-data/trade/chapter-57.json \
  --countries IN,TR,CN,VN,EG,MX,NL,KR,TH,NP,GB,PK,BE,CA,AF
python3 "$HERE/fill57.py" "$GEN" "$OUT"
