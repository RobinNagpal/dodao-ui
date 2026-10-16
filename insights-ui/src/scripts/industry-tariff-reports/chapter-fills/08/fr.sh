#!/bin/bash
# usage: fr.sh "<term>" <agency-slug|-> <gte-date> [type]
args=(-G -s -A "Mozilla/5.0" "https://www.federalregister.gov/api/v1/documents.json" --data-urlencode "per_page=100" --data-urlencode "order=newest" --data-urlencode "conditions[term]=$1" --data-urlencode "conditions[publication_date][gte]=$3")
[ "$2" != "-" ] && args+=(--data-urlencode "conditions[agencies][]=$2")
[ -n "$4" ] && args+=(--data-urlencode "conditions[type][]=$4")
for f in title publication_date type document_number citation html_url effective_on; do args+=(--data-urlencode "fields[]=$f"); done
curl "${args[@]}" | jq -r '"count=\(.count)", (.results[]? | "\(.publication_date) \(.type) \(.citation) eff:\(.effective_on) \(.document_number) | \(.title)")'
