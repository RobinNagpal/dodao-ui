#!/bin/sh
# poll FR API until it answers, then fetch metadata for the doc list
cd /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch39
DOCS="$1"
for i in $(seq 1 60); do
  out=$(curl -s -m 40 -A 'Mozilla/5.0' "https://www.federalregister.gov/api/v1/documents/${DOCS}.json?fields[]=document_number&fields[]=html_url&fields[]=citation&fields[]=publication_date&fields[]=title&fields[]=signing_date&fields[]=type")
  case "$out" in
    \{*) echo "$out" > frmeta.json; echo OK; exit 0;;
  esac
  sleep 60
done
echo FAIL
