#!/usr/bin/env bash
# Chapter 73 (Articles of Iron or Steel): generate -> fill. Run `pnpm tariff:refresh-chapter 73` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=73-articles-of-iron-steel
. "$(dirname "$0")/../lib.sh"

generate --title "Articles of Iron or Steel" \
  --trade-file src/tariff-data/trade/chapter-73.json \
  --countries CN,MX,CA,TW,IN,KR,DE,VN,JP,IT,TH,TR,GB,BR,RU
python3 "$HERE/fill73.py" "$GEN" "$OUT"
