#!/usr/bin/env bash
# Chapter 13 (Lac; Gums, Resins and Other Vegetable Saps and Extracts): generate -> fill. Run `pnpm tariff:refresh-chapter 13` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=13-lac-gums-resins
. "$(dirname "$0")/../lib.sh"

generate --title "Lac; Gums, Resins and Other Vegetable Saps and Extracts" \
  --countries IN,CN,FR,ES,DE,IT,MX,DK,PH,BR,CL,CA,TD
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
