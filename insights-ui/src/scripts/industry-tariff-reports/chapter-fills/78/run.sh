#!/usr/bin/env bash
# Chapter 78 (Lead and Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 78` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=78-lead-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Lead and Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-78.json \
  --countries CA,MX,AU,KR,GB,KZ,GH,DE,ZA,NG,CN,IN,BR,JP,VN \
  --claim GH:D,NG:D,ZA:D
cp "$GEN" "$OUT"
python3 "$HERE/fill78.py" "$OUT"
