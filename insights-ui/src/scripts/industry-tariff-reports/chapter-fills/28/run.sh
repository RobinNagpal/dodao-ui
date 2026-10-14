#!/usr/bin/env bash
# Chapter 28 (Inorganic Chemicals; Organic or Inorganic Compounds of Precious Metals, of Rare-Earth Metals, of Radioactive Elements or of Isotopes): generate -> fill. Run `pnpm tariff:refresh-chapter 28` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=28-inorganic-and-metal-compounds
. "$(dirname "$0")/../lib.sh"

generate --title "Inorganic Chemicals; Organic or Inorganic Compounds of Precious Metals, of Rare-Earth Metals, of Radioactive Elements or of Isotopes" \
  --countries CA,FR,GB,DE,CN,RU,BR,NL,MX,JP,KR,TT,CL,IN,IL
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill28.py" "$GEN" "$OUT"
