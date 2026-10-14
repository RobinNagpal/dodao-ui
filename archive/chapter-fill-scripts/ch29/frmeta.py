import json, urllib.request, sys, time, os
F = "frmeta.json"
cache = json.load(open(F)) if os.path.exists(F) else {}
for n in sys.argv[1:]:
    if n in cache: continue
    u = "https://www.federalregister.gov/api/v1/documents/%s.json?fields[]=title&fields[]=citation&fields[]=publication_date&fields[]=signing_date&fields[]=html_url&fields[]=type&fields[]=agencies&fields[]=presidential_document_number&fields[]=executive_order_number&fields[]=proclamation_number&fields[]=subtype" % n
    try:
        cache[n] = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())
    except Exception as e:
        print("ERR", n, e); continue
    time.sleep(0.25)
json.dump(cache, open(F, "w"), indent=1)
for n in sys.argv[1:]:
    c = cache.get(n)
    if c: print(n, c["publication_date"], c.get("signing_date"), c["citation"], c["type"], c.get("executive_order_number") or c.get("proclamation_number") or "", "|", c["title"][:110])
