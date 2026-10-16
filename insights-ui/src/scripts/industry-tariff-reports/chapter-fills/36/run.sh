#!/usr/bin/env bash
# Chapter 36 (Explosives; pyrotechnic products; matches; pyrophoric alloys; certain combustible preparations): generate -> fill. Run `pnpm tariff:refresh-chapter 36` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=36-explosives-and-pyrotechnics
. "$(dirname "$0")/../lib.sh"

generate --title "Explosives; pyrotechnic products; matches; pyrophoric alloys; certain combustible preparations" \
  --countries CN,CA,MX,DE,PL,NO,SE,ES,CZ,AU,KR,CL
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill36.py" "$GEN" "$OUT"
