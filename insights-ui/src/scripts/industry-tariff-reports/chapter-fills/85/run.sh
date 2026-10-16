#!/usr/bin/env bash
# Chapter 85 (Electrical Machinery and Equipment and Parts Thereof; Sound Recorders and Reproducers, Television Image and Sound Recorders and Reproducers, and Parts and Accessories of Such Articles): generate -> fill. Run `pnpm tariff:refresh-chapter 85` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=85-electrical-machinery-and-recorders
. "$(dirname "$0")/../lib.sh"

generate --title "Electrical Machinery and Equipment and Parts Thereof; Sound Recorders and Reproducers, Television Image and Sound Recorders and Reproducers, and Parts and Accessories of Such Articles" \
  --trade-file src/tariff-data/trade/chapter-85.json \
  --countries CN,MX,VN,TW,TH,MY,IN,JP,KR,DE,CA,ID,GB,BR \
  --include-elections
python3 "$HERE/fill85.py" "$GEN" "$OUT"
