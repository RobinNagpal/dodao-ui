#!/bin/bash
while read t s; do sleep 6; f="s_${t}_${s}.xml"; curl -s --compressed "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-${t}.xml?section=${s}" -o "$f"; h=$(grep -o '<HEAD>[^<]*</HEAD>' "$f" | head -1); [ -z "$h" ] && h="NOTFOUND $(head -c 150 "$f")"; echo "$t $s: $h"; done
