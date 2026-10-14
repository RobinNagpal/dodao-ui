#!/bin/zsh
# Regenerate + fill Chapter 27. usage: ./run27.sh  (re-runnable)
set -e
S=${0:A:h}
W=/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui
OUT=$W/src/tariff-data/chapters/27-mineral-fuels-and-oils.json
COUNTRIES=${COUNTRIES:-CA,MX,SA,BR,IQ,CO,KR,GY,NG,NL,VE,IN,CN,RU}
CLAIMS=${CLAIMS:-GY:R}
cd $W
pnpm tariff:generate-chapter --chapter 27 --slug 27-mineral-fuels-and-oils \
  --title "Mineral Fuels, Mineral Oils and Products of Their Distillation; Bituminous Substances; Mineral Waxes" \
  --countries $COUNTRIES --claim $CLAIMS --out $S/27-gen.json --force
python3 $S/fill27.py $S/27-gen.json $OUT
npx prettier --write $OUT >/dev/null
grep -c TODO $OUT || true
