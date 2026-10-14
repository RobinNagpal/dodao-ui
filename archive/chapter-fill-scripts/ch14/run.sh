#!/bin/sh
# Regenerate + refill Chapter 14 (re-runnable).
set -e
cd /Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui
pnpm tariff:generate-chapter --chapter 14 --slug 14-plaiting-materials-nes \
  --title "Vegetable Plaiting Materials; Vegetable Products Not Elsewhere Specified or Included" \
  --countries MX,IN,CN,LK,TH,NL,AR,TR,CA,CI,BR,DO --claim CI:D \
  --hts-file /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/hts_2026_revision_21_json.json --force
python3 /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch14/fill.py
npx prettier --write src/tariff-data/chapters/14-plaiting-materials-nes.json
