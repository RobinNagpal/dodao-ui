#!/usr/bin/env bash
# Chapter 25 (Salt; Sulfur; Earths and Stone; Plastering Materials, Lime and Cement): generate -> fill. Run `pnpm tariff:refresh-chapter 25` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=25-salt-sulfur-and-cements
. "$(dirname "$0")/../lib.sh"

generate --title "Salt; Sulfur; Earths and Stone; Plastering Materials, Lime and Cement" \
  --countries CA,TR,MX,VN,PE,CN,ES,CL,EG,GR,IN,BR
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill25.py" "$GEN" "$OUT"
