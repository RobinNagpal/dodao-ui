#!/usr/bin/env bash
# Chapter 56 (Wadding, Felt and Nonwovens; Special Yarns; Twine, Cordage, Ropes and Cables and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 56` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=56-wadding-felt-and-twine
. "$(dirname "$0")/../lib.sh"

generate --title "Wadding, Felt and Nonwovens; Special Yarns; Twine, Cordage, Ropes and Cables and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-56.json \
  --countries CN,DE,IN,CA,JP,MX,TR,KR,VN,TH,GB,TW,NL,IL,BR
cp "$GEN" "$OUT"
python3 "$HERE/fill56.py" "$OUT"
