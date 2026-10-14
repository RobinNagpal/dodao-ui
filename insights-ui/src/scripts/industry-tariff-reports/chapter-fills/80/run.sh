#!/usr/bin/env bash
# Chapter 80 (Tin and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 80` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=80-tin-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Tin and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-80.json \
  --countries PE,BO,ID,PL,BR,MX,MY,JP,CA,TH,RW,CD,CN,DE,GB \
  --claim CD:D,RW:D
cp "$GEN" "$OUT"
python3 "$HERE/fill80.py" "$OUT"
