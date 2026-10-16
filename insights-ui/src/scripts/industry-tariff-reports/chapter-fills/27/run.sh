#!/usr/bin/env bash
# Chapter 27 (Mineral Fuels, Mineral Oils and Products of Their Distillation; Bituminous Substances; Mineral Waxes): generate -> fill. Run `pnpm tariff:refresh-chapter 27` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=27-mineral-fuels-and-oils
. "$(dirname "$0")/../lib.sh"

generate --title "Mineral Fuels, Mineral Oils and Products of Their Distillation; Bituminous Substances; Mineral Waxes" \
  --countries CA,MX,SA,BR,IQ,CO,KR,GY,NG,NL,VE,IN,CN,RU \
  --claim GY:R
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill27.py" "$GEN" "$OUT"
