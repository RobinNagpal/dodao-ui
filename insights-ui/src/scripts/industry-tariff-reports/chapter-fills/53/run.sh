#!/usr/bin/env bash
# Chapter 53 (Other Vegetable Textile Fibers; Paper Yarn and Woven Fabrics of Paper Yarn): generate -> fill. Run `pnpm tariff:refresh-chapter 53` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=53-other-veg-textile-fibers
. "$(dirname "$0")/../lib.sh"

generate --title "Other Vegetable Textile Fibers; Paper Yarn and Woven Fabrics of Paper Yarn" \
  --trade-file src/tariff-data/trade/chapter-53.json \
  --countries IN,BE,IT,GB,CN,LK,BD,FR,TR,TH,BY,LT,PH,CA,MX,BR,VN
cp "$GEN" "$OUT"
python3 "$HERE/fill53.py"
