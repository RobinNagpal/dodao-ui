#!/bin/sh
# Check every source URL in the chapter file. eCFR pages are checked through the eCFR versioner API.
while read u; do
  case "$u" in
    https://www.ecfr.gov/current/*)
      t=$(echo "$u" | sed -E 's#.*/title-([0-9]+)/(section|part)-(.*)#\1#'); k=$(echo "$u" | sed -E 's#.*/title-([0-9]+)/(section|part)-(.*)#\2#'); s=$(echo "$u" | sed -E 's#.*/title-([0-9]+)/(section|part)-(.*)#\3#')
      c=$(curl -s --compressed -H "Accept: application/xml" -o /dev/null -w "%{http_code}" -m 60 -A "Mozilla/5.0" "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?$k=$s"); sleep 1;;
    *) c=$(curl -s -o /dev/null -w '%{http_code}' -L -m 60 -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' "$u");;
  esac
  echo "$c $u"
done < urls.txt
