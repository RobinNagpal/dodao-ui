#!/usr/bin/env bash
# Chapter 34 (Soap, organic surface-active agents, washing preparations, lubricating preparations, artificial waxes, prepared waxes, polishing or scouring preparations, candles and similar articles, modeling pastes, "dental waxes" and dental preparations with a basis of plaster): generate -> fill. Run `pnpm tariff:refresh-chapter 34` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=34-soaps-waxes-and-preparations
. "$(dirname "$0")/../lib.sh"

generate --title 'Soap, organic surface-active agents, washing preparations, lubricating preparations, artificial waxes, prepared waxes, polishing or scouring preparations, candles and similar articles, modeling pastes, "dental waxes" and dental preparations with a basis of plaster' \
  --countries CA,MX,VN,CN,DE,KR,FR,JP,IN,GB,IT,CO
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill34.py" "$GEN" "$OUT"
