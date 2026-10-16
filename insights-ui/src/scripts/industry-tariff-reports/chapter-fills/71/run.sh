#!/usr/bin/env bash
# Chapter 71 (Natural or Cultured Pearls, Precious or Semiprecious Stones, Precious Metals, Metals Clad With Precious Metal, and Articles Thereof; Imitation Jewelry; Coin): generate -> fill. Run `pnpm tariff:refresh-chapter 71` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=71-pearls-stones-and-jewelry
. "$(dirname "$0")/../lib.sh"

generate --title "Natural or Cultured Pearls, Precious or Semiprecious Stones, Precious Metals, Metals Clad With Precious Metal, and Articles Thereof; Imitation Jewelry; Coin" \
  --trade-file src/tariff-data/trade/chapter-71.json \
  --countries CH,AU,ZA,CA,MX,IN,DE,IT,KZ,FR,SG,GB,HK,BE,IL,CO,TH,JP,KR,CN,BR,RU \
  --claim ZA:D
python3 "$HERE/fill71.py" "$GEN" "$OUT"
