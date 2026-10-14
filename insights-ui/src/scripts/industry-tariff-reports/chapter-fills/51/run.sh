#!/usr/bin/env bash
# Chapter 51 (Wool, Fine or Coarse Animal Hair; Horsehair Yarn and Woven Fabric): generate -> fill. Run `pnpm tariff:refresh-chapter 51` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=51-wool-and-horsehair
. "$(dirname "$0")/../lib.sh"

generate --title "Wool, Fine or Coarse Animal Hair; Horsehair Yarn and Woven Fabric" \
  --trade-file src/tariff-data/trade/chapter-51.json \
  --countries PE,IT,GB,MX,CL,CA,BE,IN,TR,NZ,RO,CN,AU,ZA,UY,BR,JP
cp "$GEN" "$OUT"
python3 "$HERE/fill51.py"
