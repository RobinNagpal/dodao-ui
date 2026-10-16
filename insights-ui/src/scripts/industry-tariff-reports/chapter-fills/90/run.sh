#!/usr/bin/env bash
# Chapter 90 (Optical, Photographic, Cinematographic, Measuring, Checking, Precision, Medical or Surgical Instruments and Apparatus; Parts and Accessories Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 90` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=90-optical-and-precision-instruments
. "$(dirname "$0")/../lib.sh"

generate --title "Optical, Photographic, Cinematographic, Measuring, Checking, Precision, Medical or Surgical Instruments and Apparatus; Parts and Accessories Thereof" \
  --trade-file src/tariff-data/trade/chapter-90.json \
  --countries MX,DE,CN,IE,CR,JP,SG,CA,MY,CH,GB,FR,TW,IL,VN,KR,IN,BR
python3 "$HERE/fill90.py" "$GEN" "$OUT"
