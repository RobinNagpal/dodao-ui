#!/usr/bin/env bash
# Chapter 79 (Zinc and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 79` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=79-zinc-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Zinc and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-79.json \
  --countries CA,MX,PE,AU,CN,ES,TW,KR,BE,IN,VN,DE,GB,BR,JP
cp "$GEN" "$OUT"
python3 "$HERE/fill79.py" "$OUT"
