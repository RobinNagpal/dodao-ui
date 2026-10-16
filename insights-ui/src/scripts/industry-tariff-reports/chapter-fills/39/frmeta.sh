#!/bin/sh
# Repo-relative paths (rewritten from the original session paths, #1863)
IU=${IU:-$(cd "$(dirname "$0")/../../../../.." && pwd)}
CACHE=${CHAPTER_FILL_CACHE:-${TMPDIR:-/tmp}/koala-chapter-fills}
HTS_FILE=${HTS_FILE:-$CACHE/generator/hts_2026_revision_21_json.json}

# poll FR API until it answers, then fetch metadata for the doc list
cd $CACHE/39
DOCS="$1"
for i in $(seq 1 60); do
  out=$(curl -s -m 40 -A 'Mozilla/5.0' "https://www.federalregister.gov/api/v1/documents/${DOCS}.json?fields[]=document_number&fields[]=html_url&fields[]=citation&fields[]=publication_date&fields[]=title&fields[]=signing_date&fields[]=type")
  case "$out" in
    \{*) echo "$out" > frmeta.json; echo OK; exit 0;;
  esac
  sleep 60
done
echo FAIL
