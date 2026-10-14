#!/bin/sh
# Regenerate + refill Chapter 97 (re-runnable): sh run.sh   (validate separately)
set -e
S=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
F=src/tariff-data/chapters/97-works-of-art-and-antiques.json
cd /Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui
pnpm tariff:generate-chapter --chapter 97 --slug 97-works-of-art-and-antiques \
  --title "Works of art, collectors' pieces and antiques" \
  --trade-file src/tariff-data/trade/chapter-97.json \
  --countries "${COUNTRIES:-FR,GB,IT,DE,ES,BE,MX,JP,NL,CH,BR,IN,CA,CN,HK,RU}" \
  --hts-file $S/hts_2026_revision_21_json.json --out $S/ch97/gen.json --force
python3 $S/ch97/fill97.py $S/ch97/gen.json $F
pnpm tariff:compact-chapters $F
npx prettier --write $F
ls -la $F
