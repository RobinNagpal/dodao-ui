#!/usr/bin/env bash
# Chapter 45 (Cork and articles of cork): generate -> fill. Run `pnpm tariff:refresh-chapter 45` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=45-cork-and-articles
. "$(dirname "$0")/../lib.sh"

generate --title "Cork and articles of cork" \
  --countries PT,ES,CN,IT,FR,TW,VN,MX,IN,CA,GB,MA,TN
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
