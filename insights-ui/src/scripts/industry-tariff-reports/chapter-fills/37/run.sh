#!/usr/bin/env bash
# Chapter 37 (Photographic or Cinematographic Goods): generate -> fill. Run `pnpm tariff:refresh-chapter 37` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=37-photographic-goods
. "$(dirname "$0")/../lib.sh"

generate --title "Photographic or Cinematographic Goods" \
  --trade-file src/tariff-data/trade/chapter-37.json \
  --countries JP,DE,TW,NL,KR,BE,SG,GB,BR,CN,MX,CA,FR
cp "$GEN" "$OUT"
python3 "$HERE/fill37.py"
