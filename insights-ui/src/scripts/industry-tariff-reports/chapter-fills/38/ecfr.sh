#!/bin/bash
# usage: ecfr.sh TITLE SECTION  -> prints text of section from eCFR versioner API (date 2026-10-08)
t=$1; s=$2; p=${s%%.*}
f=ecfr/$t-$s.xml
[ -s $f ] || curl -s --compressed -A "Mozilla/5.0" "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?part=$p&section=$s" -o $f
python3 - $f <<'P'
import re,sys,html
s=open(sys.argv[1]).read(); t=html.unescape(re.sub(r'<[^>]+>',' ',s)); t=re.sub(r'\s+',' ',t)
print(sys.argv[1], len(s)); print(t[:int(__import__('os').environ.get('N','1500'))]); print()
P
