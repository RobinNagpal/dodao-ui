#!/usr/bin/env bash
# Chapter 49 (Printed Books, Newspapers, Pictures and Other Products of the Printing Industry; Manuscripts, Typescripts and Plans): generate -> fill. Run `pnpm tariff:refresh-chapter 49` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=49-printing-industry-products
. "$(dirname "$0")/../lib.sh"

generate --title "Printed Books, Newspapers, Pictures and Other Products of the Printing Industry; Manuscripts, Typescripts and Plans" \
  --countries CN,CA,MX,GB,IT,IN,VN,DE,KR,JP,HK,BR
cp "$GEN" "$OUT"
python3 "$HERE/fill-b2.py"
