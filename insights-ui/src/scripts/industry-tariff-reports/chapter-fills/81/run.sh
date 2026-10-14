#!/usr/bin/env bash
# Chapter 81 (Other Base Metals; Cermets; Articles Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 81` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=81-other-base-metals-and-cermets
. "$(dirname "$0")/../lib.sh"

generate --title "Other Base Metals; Cermets; Articles Thereof" \
  --trade-file src/tariff-data/trade/chapter-81.json \
  --countries CN,JP,DE,GB,CA,FR,KR,TH,KZ,MX,IL,BR,IN,NO,ID,TW,CL,SA,MG,RU \
  --claim MG:D
python3 "$HERE/fill81.py" "$GEN" "$OUT"
