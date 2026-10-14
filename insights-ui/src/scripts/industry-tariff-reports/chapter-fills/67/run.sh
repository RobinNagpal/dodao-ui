#!/usr/bin/env bash
# Chapter 67 (Prepared Feathers and Down and Articles Made of Feathers or of Down; Artificial Flowers; Articles of Human Hair): generate -> fill. Run `pnpm tariff:refresh-chapter 67` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=67-feathers-and-artificial-flowers
. "$(dirname "$0")/../lib.sh"

generate --title "Prepared Feathers and Down and Articles Made of Feathers or of Down; Artificial Flowers; Articles of Human Hair" \
  --trade-file src/tariff-data/trade/chapter-67.json \
  --countries CN,ID,BD,VN,SN,IN,KH,TH,IT,CA,MX,MM,KR,BR \
  --claim SN:D
cp "$GEN" "$OUT"
python3 "$HERE/fill67.py"
