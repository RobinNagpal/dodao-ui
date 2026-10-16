#!/usr/bin/env bash
# Chapter 41 (Raw Hides and Skins (Other Than Furskins) and Leather): generate -> fill. Run `pnpm tariff:refresh-chapter 41` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=41-raw-hides-and-leather
. "$(dirname "$0")/../lib.sh"

generate --title "Raw Hides and Skins (Other Than Furskins) and Leather" \
  --countries IT,BR,MX,DE,GB,AR,ZA,CA,SE,IN,JP,CN
python3 "$HERE/fill41-b2.py" "$GEN" "$OUT"
