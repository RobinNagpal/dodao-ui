#!/bin/bash
# usage: gi.sh YYYY-MM-DD docnum
f=g-$2.txt
[ -s $f ] && exit 0
curl -s -A "Mozilla/5.0" "https://www.govinfo.gov/content/pkg/FR-$1/html/$2.htm" | python3 -c "
import sys,re,html
t=sys.stdin.read(); t=re.sub(r'<[^>]+>','',t); t=html.unescape(t); t=re.sub(r'\n\s*\n+','\n',t); print(t)" > $f
wc -c $f
