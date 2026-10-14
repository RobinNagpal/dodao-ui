#!/bin/bash
# usage: ecfr.sh title "section=x" [chars]
curl -s --compressed "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$1.xml?$2" | python3 -c "
import sys,re,html;s=sys.stdin.read();s=re.sub(r'<[^>]+>',' ',s);print(re.sub(r'\s+',' ',html.unescape(s))[:${3:-4000}])"
