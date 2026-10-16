#!/usr/bin/env bash
# Chapter 43 (Furskins and Artificial Fur; Manufactures Thereof): generate -> fill. Run `pnpm tariff:refresh-chapter 43` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=43-furskins-and-furs
. "$(dirname "$0")/../lib.sh"

generate --title "Furskins and Artificial Fur; Manufactures Thereof" \
  --countries IT,TR,CA,CN,BR,FR,GR,VN,IN,CO,FI,DK,HK,RU
cp "$GEN" "$OUT"
python3 "$HERE/fill.py"
