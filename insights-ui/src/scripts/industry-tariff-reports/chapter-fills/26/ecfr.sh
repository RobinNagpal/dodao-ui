#!/bin/bash
# usage: ecfr.sh <title> <section> [chars]
t=$1; s=$2
f=ecfr2/$t-$s.txt
[ -s $f ] || curl -s --compressed -A "Mozilla/5.0" "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?section=$s" | python3 -c 'import sys,re,html;t=sys.stdin.read();print(html.unescape(re.sub(r"<[^>]+>"," ",t)))' | tr -s ' \n' ' ' > $f
echo "== $t CFR $s ($(wc -c < $f))"; head -c ${3:-1500} $f; echo
