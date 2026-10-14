#!/usr/bin/env bash
# Chapter 48 (Paper and Paperboard; Articles of Paper Pulp, of Paper or of Paperboard): generate -> fill. Run `pnpm tariff:refresh-chapter 48` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=48-paper-and-paperboard
. "$(dirname "$0")/../lib.sh"

generate --title "Paper and Paperboard; Articles of Paper Pulp, of Paper or of Paperboard" \
  --trade-file src/tariff-data/trade/chapter-48.json \
  --countries CA,CN,MX,VN,FI,DE,ID,KR,IN,SE,MY,TH,BR,GB,JP
python3 "$HERE/fill48.py" "$GEN" "$OUT"
