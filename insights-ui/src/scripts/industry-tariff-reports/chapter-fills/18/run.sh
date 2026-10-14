#!/usr/bin/env bash
# Chapter 18 (Cocoa and Cocoa Preparations): generate -> fill. Run `pnpm tariff:refresh-chapter 18` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=18-cocoa-and-preparations
. "$(dirname "$0")/../lib.sh"

generate --title "Cocoa and Cocoa Preparations" \
  --countries CA,CI,EC,MY,ID,MX,GH,NL,PE,BE,DE,CH,CN,BR,GB
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
