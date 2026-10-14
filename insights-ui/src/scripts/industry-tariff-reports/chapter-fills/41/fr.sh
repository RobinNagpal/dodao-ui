#!/bin/bash
# usage: fr.sh "<term>" <agency-slug|-> <gte-date> [type]
args=(-s -G "https://www.federalregister.gov/api/v1/documents.json" --data-urlencode "conditions[term]=$1" --data-urlencode "conditions[publication_date][gte]=$3" --data-urlencode "per_page=40" --data-urlencode "order=newest" --data-urlencode "fields[]=title" --data-urlencode "fields[]=publication_date" --data-urlencode "fields[]=document_number" --data-urlencode "fields[]=type" --data-urlencode "fields[]=cfr_references" --data-urlencode "fields[]=effective_on" --data-urlencode "fields[]=citation" --data-urlencode "fields[]=html_url")
[ "$2" != "-" ] && args+=(--data-urlencode "conditions[agencies][]=$2")
[ -n "$4" ] && args+=(--data-urlencode "conditions[type][]=$4")
curl "${args[@]}" | python3 -c "
import json,sys
d=json.load(sys.stdin); print('count',d.get('count'))
for r in d.get('results',[]): print(' ',r['publication_date'], r['document_number'], r['type'][:6], r.get('citation'), 'eff',r.get('effective_on'), '|', r['title'][:150], [c.get('part') for c in (r.get('cfr_references') or [])])"
