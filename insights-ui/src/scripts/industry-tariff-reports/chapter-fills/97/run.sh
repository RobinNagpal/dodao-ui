#!/usr/bin/env bash
# Chapter 97 (Works of art, collectors' pieces and antiques): generate -> fill. Run `pnpm tariff:refresh-chapter 97` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=97-works-of-art-and-antiques
. "$(dirname "$0")/../lib.sh"

generate --title "Works of art, collectors' pieces and antiques" \
  --trade-file src/tariff-data/trade/chapter-97.json \
  --countries FR,GB,IT,DE,ES,BE,MX,JP,NL,CH,BR,IN,CA,CN,HK,RU
python3 "$HERE/fill97.py" "$GEN" "$OUT"
