#!/usr/bin/env bash
# Chapter 33 (Essential Oils and Resinoids; Perfumery, Cosmetic or Toilet Preparations): generate -> fill. Run `pnpm tariff:refresh-chapter 33` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=33-essential-oils-and-cosmetics
. "$(dirname "$0")/../lib.sh"

generate --title "Essential Oils and Resinoids; Perfumery, Cosmetic or Toilet Preparations" \
  --countries FR,IE,KR,IT,CA,MX,CN,ES,AE,GB,IN,DE,JP,BR,CH
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill33.py" "$GEN" "$OUT"
