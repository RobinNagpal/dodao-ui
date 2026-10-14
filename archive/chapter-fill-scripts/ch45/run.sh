#!/bin/bash
# Regenerate Chapter 45 and fill it: bash run.sh
set -e
WT=/Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch45
F=src/tariff-data/chapters/45-cork-and-articles.json
cd $WT
pnpm tariff:generate-chapter --chapter 45 --slug 45-cork-and-articles --title "Cork and articles of cork" --countries PT,ES,CN,IT,FR,TW,VN,MX,IN,CA,GB,MA,TN --force
cp $F $S/gen.json
python3 $S/fill.py
pnpm tariff:compact-chapters $F
npx prettier --write $F
