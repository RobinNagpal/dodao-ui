#!/bin/bash
# Re-runnable: generate -> fill -> compact -> prettier (Chapter 48). Pass --no-gen to skip generation.
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch48
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
OUT=$IU/src/tariff-data/chapters/48-paper-and-paperboard.json
cd $IU
if [ "$1" != "--no-gen" ]; then
  pnpm tariff:generate-chapter --chapter 48 --slug 48-paper-and-paperboard \
    --title "Paper and Paperboard; Articles of Paper Pulp, of Paper or of Paperboard" \
    --trade-file src/tariff-data/trade/chapter-48.json \
    --countries CA,CN,MX,VN,FI,DE,ID,KR,IN,SE,MY,TH,BR,GB,JP \
    --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json \
    --out $SP/gen.json --force
fi
python3 $SP/fill48.py $SP/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
