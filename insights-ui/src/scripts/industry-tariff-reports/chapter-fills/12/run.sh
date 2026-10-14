#!/usr/bin/env bash
# Chapter 12 (Oil Seeds and Oleaginous Fruits; Miscellaneous Grains, Seeds and Fruit; Industrial or Medicinal Plants; Straw and Fodder): generate -> fill. Run `pnpm tariff:refresh-chapter 12` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=12-oil-seeds-and-grains
. "$(dirname "$0")/../lib.sh"

generate --title "Oil Seeds and Oleaginous Fruits; Miscellaneous Grains, Seeds and Fruit; Industrial or Medicinal Plants; Straw and Fodder" \
  --countries CA,IN,CN,AR,MX,BG,PY,NL,CL,DE,BR
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
