#!/usr/bin/env bash
# Chapter 02 (Meat and Edible Meat Offal): generate -> fill. Run `pnpm tariff:refresh-chapter 2` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=2-meat-and-offal
. "$(dirname "$0")/../lib.sh"

generate --title "Meat and Edible Meat Offal" \
  --countries AU,CA,MX,NZ,BR,UY,NI,AR,PY,CL,IT,DK,ES,JP
expand_gen  # this fill script reads the per-line fields the generator no longer stores
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
