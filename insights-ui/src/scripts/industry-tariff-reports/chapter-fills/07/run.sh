#!/usr/bin/env bash
# Chapter 07 (Edible Vegetables and Certain Roots and Tubers): generate -> fill. Run `pnpm tariff:refresh-chapter 7` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=7-vegetables-and-roots
. "$(dirname "$0")/../lib.sh"

generate --title "Edible Vegetables and Certain Roots and Tubers" \
  --countries MX,CA,PE,CN,GT,CR,ES,EC,IN,HN \
  --claim GT:P,CR:P,HN:P
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill.py" "$GEN" "$OUT"
