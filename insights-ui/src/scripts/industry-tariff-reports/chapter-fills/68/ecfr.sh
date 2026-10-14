#!/bin/bash
# usage: ecfr.sh title part section
curl -s --compressed -A "Mozilla/5.0" "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$1.xml?part=$2&section=$3" | python3 -c "
import sys,re,html
t=sys.stdin.read(); t=re.sub(r'<[^>]+>',' ',t); t=html.unescape(t); print(re.sub(r'\s+',' ',t))" > ecfr_$3.txt
echo "$3 $(wc -c < ecfr_$3.txt) $(head -c 120 ecfr_$3.txt)"
