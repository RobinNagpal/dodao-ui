#!/usr/bin/env bash
# Chapter 05 (Products of Animal Origin, Not Elsewhere Specified or Included): generate -> fill. Run `pnpm tariff:refresh-chapter 5` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=5-animal-products-nes
. "$(dirname "$0")/../lib.sh"

generate --title "Products of Animal Origin, Not Elsewhere Specified or Included" \
  --countries CA,CN,AU,BR,TH,MX,NZ,VN,PY,CO,ES
python3 "$HERE/fill05.py" "$GEN" "$OUT"
