# usage: ecfr.sh title part [section]
t=$1; p=$2; s=$3
if [ -n "$s" ]; then q="section=$s"; else q="part=$p"; fi
curl -s --compressed "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?$q" | sed 's/<[^>]*>/ /g' | tr -s ' \n'
