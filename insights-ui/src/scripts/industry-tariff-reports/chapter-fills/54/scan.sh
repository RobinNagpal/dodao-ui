# Repo-relative paths (rewritten from the original session paths, #1863)
IU=${IU:-$(cd "$(dirname "$0")/../../../../.." && pwd)}
CACHE=${CHAPTER_FILL_CACHE:-${TMPDIR:-/tmp}/koala-chapter-fills}
HTS_FILE=${HTS_FILE:-$CACHE/generator/hts_2026_revision_21_json.json}

cd $CACHE/54
: > scan.out
for c in $(cat codes10.txt); do echo "=== $c" >> scan.out; python3 frs.py "$c" 2005-01-01 'conditions[agencies][]=international-trade-administration' | head -4 >> scan.out; sleep 2; done
echo DONE >> scan.out
