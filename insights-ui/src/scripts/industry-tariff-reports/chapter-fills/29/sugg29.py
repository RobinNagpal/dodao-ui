import json, urllib.request, urllib.parse, time, sys
seeds = sys.argv[1:]
out = {}
for q in seeds:
    url = "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=" + urllib.parse.quote(q)
    try:
        r = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20).read().decode("utf-8", "replace"))
        out[q] = r[1]
    except Exception as e:
        out[q] = ["ERR " + str(e)]
    time.sleep(0.4)
prev = {}
try: prev = json.load(open("sugg29.json"))
except Exception: pass
prev.update(out)
prev["_collected"] = time.strftime("%Y-%m-%d")
json.dump(prev, open("sugg29.json", "w"), indent=1)
for k, v in out.items(): print(k, "=>", v)
