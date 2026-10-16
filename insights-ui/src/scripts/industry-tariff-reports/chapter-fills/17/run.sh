#!/usr/bin/env bash
# Chapter 17 (Sugars and Sugar Confectionery): generate -> fill. Run `pnpm tariff:refresh-chapter 17` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=17-sugars-and-confectionery
. "$(dirname "$0")/../lib.sh"

generate --title "Sugars and Sugar Confectionery" \
  --countries MX,CA,BR,TR,DE,GT,CO,CN,DO,ES,SV,AU,GB,PE,PH \
  --claim GT:P,GT:P+,DO:P,DO:P+,SV:P,SV:P+
python3 "$HERE/fill17.py" "$GEN" "$OUT"
