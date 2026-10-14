#!/usr/bin/env bash
# Chapter 23 (Food Industry Residues and Prepared Animal Feed): generate -> fill. Run `pnpm tariff:refresh-chapter 23` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=23-food-industry-residues-and-feed
. "$(dirname "$0")/../lib.sh"

generate --title "Food Industry Residues and Prepared Animal Feed" \
  --countries CA,TH,ID,MX,CN,DE,KH,FR,MY,VN,IN,TR,BR,GB
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill_all.py" "$OUT"
