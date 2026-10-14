#!/usr/bin/env bash
# Chapter 24 (Tobacco and Manufactured Tobacco Substitutes): generate -> fill. Run `pnpm tariff:refresh-chapter 24` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=24-tobacco-and-substitutes
. "$(dirname "$0")/../lib.sh"

generate --title "Tobacco and Manufactured Tobacco Substitutes" \
  --countries DO,NI,ID,MX,BR,CA,TR,HN,DK,IN,SE,CN \
  --claim DO:P,NI:P,HN:P
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill.py" "$OUT"
