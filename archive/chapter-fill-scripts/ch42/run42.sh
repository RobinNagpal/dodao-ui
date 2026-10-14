#!/bin/bash
# Re-run: generate (optional) -> fill -> copy -> compact -> prettier -> validate
set -e
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch42
IU=/Users/robin/projects/worktrees/chapter-migration-1812-b1/insights-ui
OUT=$IU/src/tariff-data/chapters/42-leather-articles-and-saddlery.json
cd $IU
if [ "$1" == "--gen" ]; then
  pnpm tariff:generate-chapter --chapter 42 --slug 42-leather-articles-and-saddlery \
    --title "Articles of Leather; Saddlery and Harness; Travel Goods, Handbags and Similar Containers; Articles of Animal Gut (Other Than Silkworm Gut)" \
    --countries KH,CN,VN,IT,FR,ID,IN,PH,TH,MX,CA,GB,ES,PK --out $SP/gen.json --force
fi
python3 $SP/fill42.py $SP/gen.json $OUT
pnpm tariff:compact-chapters $OUT
npx prettier --write $OUT >/dev/null
ls -la $OUT
