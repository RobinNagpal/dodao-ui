#!/usr/bin/env bash
# Chapter 19 (Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares): generate -> fill. Run `pnpm tariff:refresh-chapter 19` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=19-cereal-and-bakers-goods
. "$(dirname "$0")/../lib.sh"

generate --title "Preparations of Cereals, Flour, Starch or Milk; Bakers' Wares" \
  --countries CA,MX,IT,KR,FR,TH,DE,IN,GB,CN,TR,AU,CO,BR,CH
python3 "$HERE/fill19.py" "$GEN" "$OUT"
