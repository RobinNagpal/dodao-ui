#!/bin/bash
# usage: frq.sh 'term' gte lte [agency]
AG=""
[ -n "$4" ] && AG="&conditions[agencies][]=$4"
curl -sS -g "https://www.federalregister.gov/api/v1/documents.json?per_page=100&order=newest&conditions[term]=$1&conditions[publication_date][gte]=$2&conditions[publication_date][lte]=$3$AG&fields[]=document_number&fields[]=title&fields[]=publication_date&fields[]=citation&fields[]=agency_names" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print('count',d['count'])
for r in d.get('results',[]): print(r['publication_date'],r['document_number'],r['citation'],'|',','.join(r['agency_names'])[:30],'|',r['title'][:170])
"
