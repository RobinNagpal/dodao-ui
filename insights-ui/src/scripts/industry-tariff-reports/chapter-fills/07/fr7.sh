#!/bin/bash
t=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))" "$1")
curl -s -A "Mozilla/5.0" "https://www.federalregister.gov/api/v1/documents.json?per_page=${PER:-20}&order=newest&conditions%5Bterm%5D=$t$2&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=title&fields%5B%5D=citation&fields%5B%5D=type&fields%5B%5D=html_url&fields%5B%5D=agency_names" | jq -r '.results[] | [.publication_date,.document_number,.citation,.type,(.agency_names|join(",")[0:40]),.title[0:150]]|@tsv'
