#!/usr/bin/env bash
# Chapter 58 (Special woven fabrics; tufted textile fabrics; lace; tapestries; trimmings; embroidery): generate -> fill. Run `pnpm tariff:refresh-chapter 58` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=58-special-woven-fabrics
. "$(dirname "$0")/../lib.sh"

generate --title "Special woven fabrics; tufted textile fabrics; lace; tapestries; trimmings; embroidery" \
  --trade-file src/tariff-data/trade/chapter-58.json \
  --countries CN,TW,VN,IN,MX,IT,TR,KR,CA,DE,FR,TH,GB,JP,DO,BR
python3 "$HERE/fill58.py" "$GEN" "$OUT"
