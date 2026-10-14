#!/bin/sh
# Regenerate + refill Chapter 43 (re-runnable).
set -e
WT=/Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/43-furskins-and-furs.json
cd $WT
pnpm tariff:generate-chapter --chapter 43 --slug 43-furskins-and-furs \
  --title "Furskins and Artificial Fur; Manufactures Thereof" \
  --countries IT,TR,CA,CN,BR,FR,GR,VN,IN,CO,FI,DK,HK,RU \
  --hts-file $S/hts_2026_revision_21_json.json --force
cp $F $S/ch43/gen.json
python3 $S/ch43/fill.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
