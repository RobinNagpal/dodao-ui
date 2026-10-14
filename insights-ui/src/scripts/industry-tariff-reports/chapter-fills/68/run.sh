#!/usr/bin/env bash
# Chapter 68 (Articles of Stone, Plaster, Cement, Asbestos, Mica or Similar Materials): generate -> fill. Run `pnpm tariff:refresh-chapter 68` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=68-stone-cement-and-similar
. "$(dirname "$0")/../lib.sh"

generate --title "Articles of Stone, Plaster, Cement, Asbestos, Mica or Similar Materials" \
  --trade-file src/tariff-data/trade/chapter-68.json \
  --countries MX,CA,BR,IN,IT,CN,TR,VN,DE,JP,TH,ES,KR
python3 "$HERE/fill68.py" "$GEN" "$OUT"
