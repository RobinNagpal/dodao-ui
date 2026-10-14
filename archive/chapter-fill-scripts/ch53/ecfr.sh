#!/bin/sh
# usage: ecfr.sh title part|section value out
curl -s --compressed "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$1.xml?$2=$3" -o "$4.xml"
python3 -c "
import re,html,sys
t=open('$4.xml').read()
t=re.sub(r'<(P|HEAD|FP)[^>]*>','\n',t); t=re.sub('<[^>]+>','',t); t=html.unescape(t)
open('$4.txt','w').write(t)
"
