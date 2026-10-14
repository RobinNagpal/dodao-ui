#!/usr/bin/env bash
# Chapter 03 (Fish and Crustaceans, Molluscs and Other Aquatic Invertebrates): generate -> fill. Run `pnpm tariff:refresh-chapter 3` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=3-fish-and-crustaceans
. "$(dirname "$0")/../lib.sh"

generate --title "Fish and Crustaceans, Molluscs and Other Aquatic Invertebrates" \
  --countries CA,CL,IN,EC,NO,VN,ID,CN,MX,JP
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill_ch03.py" "$OUT"
