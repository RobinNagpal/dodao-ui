#!/usr/bin/env bash
# Chapter 11 (Milling Products, Malt & Starches): generate -> fill. Run `pnpm tariff:refresh-chapter 11` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=11-milling-products
. "$(dirname "$0")/../lib.sh"

generate --title "Milling Products, Malt & Starches" \
  --countries CA,MX,DE,AU,TH,IT,IN,NL,BE,DK,CL,GB,TR,CN
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
