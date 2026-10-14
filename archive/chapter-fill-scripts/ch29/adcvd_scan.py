import json, re, time, sys
sys.path.insert(0, ".")
from frq import q
d = json.load(open("gen1.json"))
subs = sorted({r["hts"][:7] for r in d["overview"]["rateTable"]["rows"] if r["hts"] and len(r["hts"]) >= 7})
res = {}
for s in subs:
    for attempt in range(3):
        try:
            r = q('%s*' % s, since="2020-06-01", per=100)
            break
        except Exception as e:
            time.sleep(3); r = {"results": []}
    titles = [(x["publication_date"], x["document_number"], x["title"]) for x in r.get("results", [])]
    res[s] = titles
    prods = sorted({re.split(r"\s+From\s+", t[2])[0] for t in titles if " From " in t[2]})
    print(s, r.get("count"), "; ".join(prods)[:300], flush=True)
    time.sleep(0.3)
json.dump(res, open("adcvd_scan.json", "w"), indent=1)
