#!/usr/bin/env bash
# Chapter 42 (Articles of Leather; Saddlery and Harness; Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)): generate -> fill. Run `pnpm tariff:refresh-chapter 42` from insights-ui/;
# it then stamps the dates, compacts, formats and validates (docs/insights-ui/tariffs/chapter-content-refresh.md).
set -euo pipefail
SLUG=42-leather-articles-and-saddlery
. "$(dirname "$0")/../lib.sh"

generate --title "Articles of Leather; Saddlery and Harness; Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)" \
  --countries KH,CN,VN,IT,FR,ID,IN,PH,TH,MX,CA,GB,ES,PK
python3 "$HERE/fill42.py" "$GEN" "$OUT"
