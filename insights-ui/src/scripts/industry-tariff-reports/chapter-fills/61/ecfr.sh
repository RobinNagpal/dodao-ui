#!/bin/sh
# usage: ecfr.sh title section  -> e<t>_<s>.txt  (eCFR versioner API, 2026-10-08)
t=$1; s=$2; p=${s%%.*}
curl -s --compressed -A "Mozilla/5.0" "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?part=$p&section=$s" -o e${t}_$s.xml
python3 -c "
import re,html
s=open('e${t}_$s.xml').read(); t=html.unescape(re.sub(r'<[^>]+>','',s)); open('e${t}_$s.txt','w').write(t); print('$t $s',len(t), t.strip()[:110].replace(chr(10),' '))"
