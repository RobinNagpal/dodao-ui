#!/bin/bash
# usage: frtext.sh <doc-number>  -> writes <doc>.txt (plain text)
d=$1
[ -s $d.txt ] && exit 0
u=$(curl -s -A "Mozilla/5.0" "https://www.federalregister.gov/api/v1/documents/$d.json?fields[]=raw_text_url" | python3 -c 'import json,sys;print(json.load(sys.stdin)["raw_text_url"])')
curl -s -A "Mozilla/5.0" "$u" | python3 -c 'import sys,html,re;t=sys.stdin.read();t=re.sub(r"<[^>]+>","",t);print(html.unescape(t))' > $d.txt
wc -c $d.txt
