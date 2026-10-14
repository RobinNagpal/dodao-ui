#!/usr/bin/env bash
# Chapter 47 (Pulp of Wood or of Other Fibrous Cellulosic Material; Recovered (Waste and Scrap) Paper or Paperboard): generate -> fill. Run `pnpm tariff:refresh-chapter 47` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
# This chapter had no run script in the original session: the generator flags were rebuilt from the committed file
# (matrix countries in order, explicit SPI claims from the 'Preferences' assumption) and the fill script's docstring.
set -euo pipefail
SLUG=47-wood-pulp-and-scrap
. "$(dirname "$0")/../lib.sh"

generate --title "Pulp of Wood or of Other Fibrous Cellulosic Material; Recovered (Waste and Scrap) Paper or Paperboard" \
  --countries CA,BR,SE,UY,FI,ZA,NO,CL,MX,CN
python3 "$HERE/fill47.py" "$GEN" "$OUT"
