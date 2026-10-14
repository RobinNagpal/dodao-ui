#!/usr/bin/env bash
# Chapter 84 (Nuclear Reactors, Boilers, Machinery and Mechanical Appliances; Parts Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 84` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=84-nuclear-reactors-and-machinery
. "$(dirname "$0")/../lib.sh"

generate --title "Nuclear Reactors, Boilers, Machinery and Mechanical Appliances; Parts Thereof" \
  --trade-file src/tariff-data/trade/chapter-84.json \
  --countries MX,TW,VN,CN,JP,TH,DE,CA,KR,IT,GB,MY,FR,IN,BR,SG \
  --include-elections
python3 "$HERE/fill84.py" "$GEN" "$OUT"
