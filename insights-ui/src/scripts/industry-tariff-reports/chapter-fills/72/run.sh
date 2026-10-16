#!/usr/bin/env bash
# Chapter 72 (Iron and Steel): generate -> fill. Run `pnpm tariff:refresh-chapter 72` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=72-iron-and-steel
. "$(dirname "$0")/../lib.sh"

generate --title "Iron and Steel" \
  --countries CA,BR,MX,KR,DE,JP,TW,IN,UA,VN,GB,CN,RU
python3 "$HERE/fill72.py" "$GEN" "$OUT"
