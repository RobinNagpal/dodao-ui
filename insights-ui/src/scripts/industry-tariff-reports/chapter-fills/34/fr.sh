#!/bin/bash
# usage: fr.sh "<term>" [per_page] [extra conditions]
T=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$1")
curl -s -A "Mozilla/5.0" -g "https://www.federalregister.gov/api/v1/documents.json?conditions[term]=$T&order=newest&per_page=${2:-30}&fields[]=title&fields[]=publication_date&fields[]=document_number&fields[]=citation&fields[]=html_url$3" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print('count',d.get('count'))
for r in d.get('results',[]): print(r['publication_date'],r['document_number'],r['citation'],r['title'][:150])"
