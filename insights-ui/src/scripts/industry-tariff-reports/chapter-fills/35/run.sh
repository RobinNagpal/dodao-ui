#!/usr/bin/env bash
# Chapter 35 (Albuminoidal substances; modified starches; glues; enzymes): generate -> fill. Run `pnpm tariff:refresh-chapter 35` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=35-albuminoidal-substances-and-glues
. "$(dirname "$0")/../lib.sh"

generate --title "Albuminoidal substances; modified starches; glues; enzymes" \
  --countries DK,CN,DE,NZ,BR,CA,FR,JP,IE,GB,NL,MX,AU,KR
expand_gen  # this fill script reads the per-line fields the generator no longer stores
python3 "$HERE/fill35.py" "$GEN" "$OUT"
