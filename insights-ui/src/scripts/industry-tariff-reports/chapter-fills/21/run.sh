#!/usr/bin/env bash
# Chapter 21 (Miscellaneous Edible Preparations): generate -> fill. Run `pnpm tariff:refresh-chapter 21` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=21-misc-edible-preparations
. "$(dirname "$0")/../lib.sh"

generate --title "Miscellaneous Edible Preparations" \
  --countries SG,CA,MX,IT,CN,TH,BR,KR,DE,CO
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill21.py" "$GEN" "$OUT"
