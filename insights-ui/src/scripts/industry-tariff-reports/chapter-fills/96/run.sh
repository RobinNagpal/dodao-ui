#!/usr/bin/env bash
# Chapter 96 (Miscellaneous Manufactured Articles): generate -> fill. Run `pnpm tariff:refresh-chapter 96` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=96-misc-manufactured-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Miscellaneous Manufactured Articles" \
  --trade-file src/tariff-data/trade/chapter-96.json \
  --countries CN,CA,MX,JP,VN,DE,IN,TH,FR,IT,DO,KR,ES,CZ,TW,BR,GB,MY,KH,ID
python3 "$HERE/fill96.py" "$GEN" "$OUT"
