#!/usr/bin/env bash
# Chapter 50 (Silk): generate -> fill. Run `pnpm tariff:refresh-chapter 50` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=50-silk
. "$(dirname "$0")/../lib.sh"

generate --title "Silk" \
  --countries IT,CN,KR,IN,GB,FR,JP,CH,TH,MX,CA,VN,BR,UZ
cp "$GEN" "$OUT"
python3 "$HERE/fill_b2.py"
