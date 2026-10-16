#!/usr/bin/env bash
# Chapter 31 (Fertilizers): generate -> fill. Run `pnpm tariff:refresh-chapter 31` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=31-fertilizers
. "$(dirname "$0")/../lib.sh"

generate --title "Fertilizers" \
  --countries CA,RU,SA,QA,IL,MX,TT,NG,DZ,LT,MA,CN
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill31.py" "$GEN" "$OUT"
