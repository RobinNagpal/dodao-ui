#!/usr/bin/env bash
# Chapter 15 (Animal, Vegetable or Microbial Fats and Oils and Their Cleavage Products; Prepared Edible Fats; Animal or Vegetable Waxes): generate -> fill. Run `pnpm tariff:refresh-chapter 15` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=15-fats-and-oils
. "$(dirname "$0")/../lib.sh"

generate --title "Animal, Vegetable or Microbial Fats and Oils and Their Cleavage Products; Prepared Edible Fats; Animal or Vegetable Waxes" \
  --trade-file src/tariff-data/trade/chapter-15.json \
  --countries CA,ID,ES,IT,MY,PH,AU,CN,MX,BR,TN,AR
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
