#!/bin/bash
for x in 19:part=134 19:part=177 19:part=191 19:section=10.41a 19:section=10.8 19:section=123.12 19:section=134.11 19:section=141.4 19:section=146.41 19:section=182.12 19:section=191.3 19:section=351.225 49:part=215 49:part=229 49:part=231 49:part=238 49:section=215.401 49:section=215.403 49:section=215.405; do
  t=${x%%:*}; q=${x#*:}
  for i in 1 2 3 4; do
    out=$(curl -s --compressed -A "Mozilla/5.0" -w "%{http_code}" "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$t.xml?$q" -o ec.xml)
    if [ "$out" = "429" ]; then sleep 15; continue; fi
    break
  done
  echo "$out $t $q $(grep -o '<HEAD>[^<]*' ec.xml | head -1 | cut -c1-80)"
  sleep 1
done
