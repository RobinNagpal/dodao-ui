#!/usr/bin/env bash
# Chapter 09 (Coffee, tea, maté and spices): generate -> fill. Run `pnpm tariff:refresh-chapter 9` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=9-coffee-tea-spices
. "$(dirname "$0")/../lib.sh"

generate --title "Coffee, tea, maté and spices" \
  --countries CO,BR,CH,VN,MX,PE,HN,GT,ID,CA,IN,NI,ET,CN,JP \
  --claim HN:P,GT:P,NI:P
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/build09.py" "$GEN" "$OUT"
