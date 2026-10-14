#!/usr/bin/env bash
# Chapter 26 (Ores, Slag and Ash): generate -> fill. Run `pnpm tariff:refresh-chapter 26` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=26-ores-slag-and-ash
. "$(dirname "$0")/../lib.sh"

generate --title "Ores, Slag and Ash" \
  --countries AU,CA,BR,ZA,PE,MX,NA,NO,JP,MG,CN,CL,SE,RU \
  --claim ZA:D,NA:D,MG:D
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill26.py"
