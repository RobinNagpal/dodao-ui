#!/bin/bash
# usage: ecfr.sh title part section [chars]
curl -s --compressed "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$1.xml?part=$2&section=$3" | python3 -c "
import sys,re,html
s=sys.stdin.read(); s=re.sub(r'<[^>]+>',' ',s); s=html.unescape(re.sub(r'\s+',' ',s)); print(s[:int(sys.argv[1])])" ${4:-3000}
echo; echo -----
