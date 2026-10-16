#!/usr/bin/env bash
# Chapter 06 (Live Trees and Other Plants; Bulbs, Roots and the Like; Cut Flowers and Ornamental Foliage): generate -> fill. Run `pnpm tariff:refresh-chapter 6` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=6-live-plants-and-bulbs
. "$(dirname "$0")/../lib.sh"

generate --title "Live Trees and Other Plants; Bulbs, Roots and the Like; Cut Flowers and Ornamental Foliage" \
  --countries CO,CA,EC,NL,MX,CR,GT,CN,TW,TH,IN,PE,KE \
  --claim CR:P,GT:P,KE:D
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill06.py" "$GEN" "$OUT"
