#!/usr/bin/env bash
# Chapter 32 (Tanning or Dyeing Extracts; Tannins and Their Derivatives; Dyes, Pigments and Other Coloring Matter; Paints and Varnishes; Putty and Other Mastics; Inks): generate -> fill. Run `pnpm tariff:refresh-chapter 32` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=32-dyes-pigments-and-paints
. "$(dirname "$0")/../lib.sh"

generate --title "Tanning or Dyeing Extracts; Tannins and Their Derivatives; Dyes, Pigments and Other Coloring Matter; Paints and Varnishes; Putty and Other Mastics; Inks" \
  --countries CA,DE,IN,JP,MX,CN,GB,KR,IT,ES,TW,CH,BR
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill32.py" "$GEN" "$OUT"
