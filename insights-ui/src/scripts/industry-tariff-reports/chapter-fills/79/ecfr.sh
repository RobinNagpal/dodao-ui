#!/bin/bash
# usage: ecfr.sh title section ...  (pairs)
while [ $# -gt 1 ]; do
  t=$1; s=$2; shift 2
  curl -s --compressed -A Mozilla/5.0 "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?section=$s" -o ecfr/${t}_${s}.xml
  echo "$t $s $(wc -c < ecfr/${t}_${s}.xml)"; sleep 4
done
