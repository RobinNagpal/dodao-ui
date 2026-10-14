#!/usr/bin/env bash
# Chapter 86 (Railway or Tramway Locomotives, Rolling Stock and Parts Thereof; Railway or Tramway Track Fixtures and Fittings and Parts Thereof; Mechanical (Including Electro-Mechanical) Traffic Signaling Equipment of All Kinds): generate -> fill. Run `pnpm tariff:refresh-chapter 86` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=86-railway-locomotives-and-fixtures
. "$(dirname "$0")/../lib.sh"

generate --title "Railway or Tramway Locomotives, Rolling Stock and Parts Thereof; Railway or Tramway Track Fixtures and Fittings and Parts Thereof; Mechanical (Including Electro-Mechanical) Traffic Signaling Equipment of All Kinds" \
  --trade-file src/tariff-data/trade/chapter-86.json \
  --countries CN,MX,CA,JP,DE,IN,AT,NL,FR,IT,PL,CZ,HU,KR,GB,CH,BR,RU
python3 "$HERE/fill86.py" "$GEN" "$OUT"
