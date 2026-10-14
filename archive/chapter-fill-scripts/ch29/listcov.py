import re, json, sys
sys.path.insert(0, "ch29")
from codeparse import parse_codes
t = open("ch99.txt").read().split("\n")
d = json.load(open("ch29/gen1.json"))
lines = [r["htsCode10"] for r in d["overview"]["rateTable"]["rows"] if r["htsCode10"]]
def cov(cs):
    cs = [c.replace(".", "") for c in cs if c.startswith("29")]
    return cs, [l for l in lines if any(l.startswith(c) for c in cs)]
s122_end = next(i for i in range(19420, 19700) if re.match(r"^\(iii\)", t[i-1]))
for name, a, b in [("reciprocal", 17245, 17646), ("s122", 19416, s122_end)]:
    cs = parse_codes("\n".join(t[a-1:b-1]))
    bad = [c for c in cs if len(c.replace(".", "")) not in (8, 10)]
    c29, cov29 = cov(cs)
    un = [c for c in c29 if not any(l.startswith(c) for l in lines)]
    print(name, "codes", len(cs), "bad", bad[:5], "ch29 codes", len(c29), "lines covered", len(cov29), "unmatched", un)
    json.dump({"codes": c29, "lines": cov29}, open("ch29/%s.json" % name, "w"))
