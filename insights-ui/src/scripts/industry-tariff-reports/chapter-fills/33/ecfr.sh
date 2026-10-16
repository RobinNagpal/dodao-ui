#!/bin/bash
# usage: ecfr.sh title section  -> prints plain text
T=$1; S=$2; D=${3:-2026-10-08}
P=${S%%.*}
curl -s --compressed -A "Mozilla/5.0" "https://www.ecfr.gov/api/versioner/v1/full/$D/title-$T.xml?part=$P&section=$S" | python3 -c "
import sys,re,html
t=sys.stdin.read(); t=re.sub(r'<[^>]+>',' ',t); print(re.sub(r'\s+',' ',html.unescape(t)))"
