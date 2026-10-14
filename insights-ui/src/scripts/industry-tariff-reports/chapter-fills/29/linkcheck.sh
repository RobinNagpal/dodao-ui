while read u; do
  case "$u" in
    https://www.ecfr.gov/current/*) p=${u#https://www.ecfr.gov/current/}; t=$(echo $p | sed -E 's#title-([0-9]+)/.*#\1#'); sec=$(echo $p | sed -nE 's#.*section-(.*)#\1#p'); part=$(echo $p | sed -nE 's#.*part-(.*)#\1#p');
      if [ -n "$sec" ]; then q="section=$sec"; else q="part=$part"; fi
      c=$(curl -s --compressed -A "Mozilla/5.0" -o /dev/null -w "%{http_code}" "https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-$t.json?$q"); echo "$c ECFR-API $u"; sleep 0.5;;
    *) c=$(curl -s -L --compressed -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" -o /dev/null -r 0-2000 -w "%{http_code}" --max-time 40 "$u"); echo "$c $u";;
  esac
done < urls29.txt
