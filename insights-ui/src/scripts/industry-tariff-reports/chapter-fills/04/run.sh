#!/usr/bin/env bash
# Chapter 04 (Dairy Produce; Birds' Eggs; Natural Honey; Edible Products of Animal Origin, Not Elsewhere Specified or Included): generate -> fill. Run `pnpm tariff:refresh-chapter 4` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=4-dairy-eggs-honey
. "$(dirname "$0")/../lib.sh"

generate --title "Dairy Produce; Birds' Eggs; Natural Honey; Edible Products of Animal Origin, Not Elsewhere Specified or Included" \
  --countries NZ,IT,FR,CA,IE,MX,IN,BR,AR,NL,ES,GR,GB,DE,TR,CH,VN,AU
python3 "$HERE/fill04.py"
