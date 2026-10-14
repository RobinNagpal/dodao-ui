#!/usr/bin/env bash
# Chapter 38 (Miscellaneous Chemical Products): generate -> fill. Run `pnpm tariff:refresh-chapter 38` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=38-misc-chemical-products
. "$(dirname "$0")/../lib.sh"

generate --title "Miscellaneous Chemical Products" \
  --countries JP,CA,DE,KR,CN,ID,GB,MX,FR,SG,IN,TW,MY,AR,BR
python3 "$HERE/fill38.py" "$GEN" "$OUT"
