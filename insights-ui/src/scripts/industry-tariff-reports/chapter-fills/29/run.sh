#!/usr/bin/env bash
# Chapter 29 (Organic Chemicals): generate -> fill. Run `pnpm tariff:refresh-chapter 29` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=29-organic-chemicals
. "$(dirname "$0")/../lib.sh"

generate --title "Organic Chemicals" \
  --countries IE,CN,IN,SG,DE,CA,CH,JP,NL,IT,GB,MX,BR
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill29.py" "$GEN" "$OUT"
