#!/usr/bin/env python3
"""Fill the writer parts of the generated Chapter 07 content file. Usage: fill.py <generated.json> <out.json>"""
import json
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import fill_static as ST  # noqa: E402
import fill_te as TE  # noqa: E402
import fill_tu as TU  # noqa: E402
import fill_trade as TR  # noqa: E402

src_path, out_path = sys.argv[1], sys.argv[2]
d = json.load(open(src_path))
TODAY = d["asOf"]

# ---------- chapter / overview ----------
d["chapter"]["title"] = ST.TITLE
ov = d["overview"]
for g in ov["productGroups"]:
    label, blurb, ex = ST.PRODUCT_GROUPS[g["heading"]]
    g["label"] = label
    g["blurb"] = blurb
    g["searchExamples"] = ex
ov["workedExamples"] = ST.WORKED_EXAMPLES
ov["notes"] = {"chapterNotes": ST.CHAPTER_NOTES, "additionalUsNotes": ST.ADDITIONAL_US_NOTES}

# ---------- tariffEngineering ----------
te = d["tariffEngineering"]
te["seo"] = TE.SEO
te["intro"] = TE.INTRO
te["regulationsAsOf"] = "2026-10-08"
te["levers"] = TE.LEVERS
te["rules"] = TE.RULES
for g in te["groups"]:
    rule_ids, note = TE.GROUPS[g["heading"]]
    g["label"] = ST.PRODUCT_GROUPS[g["heading"]][0]
    g["ruleIds"] = rule_ids
    g["note"] = note
rows_by_hts = {r["hts"]: r for r in ov["rateTable"]["rows"] if r["hts"]}
for line in te["lines"]:
    row = rows_by_hts.get(line["hts"], {})
    line["ruleIds"], line["leverIds"] = TE.line_rules_levers(line["hts"], line["heading"], row.get("effectiveGeneral"), row.get("effectiveSpecial"))
te["disclaimer"] = TE.DISCLAIMER

# ---------- tariffUpdates: sources + extra changes ----------
tu = d["tariffUpdates"]
have = {s["id"] for s in tu["sources"]}
for s in TU.EXTRA_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])
ids = {c["id"] for c in tu["changes"]}
for c in TU.EXTRA_CHANGES:
    assert c["id"] not in ids, c["id"]
    tu["changes"].append(c)

# ---------- trade-dependent + country texts ----------
TR.apply(d)

# industry areas group labels
for g in d["industryAreas"]["groups"]:
    g["shortLabel"] = ST.PRODUCT_GROUPS[g["heading"]][0]

# sort changes newest first (stable)
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# industryAreas sources must cover the ids its rules use
ia = d["industryAreas"]
ia_have = {s["id"] for s in ia["sources"]}
tu_by_id = {s["id"]: s for s in tu["sources"]}
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in ia_have:
            ia["sources"].append(tu_by_id[sid])
            ia_have.add(sid)

# ---------- leftover check ----------
left = []


def walk(node, path):
    if isinstance(node, dict):
        for k, v in node.items():
            walk(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, f"{path}[{i}]")
    elif isinstance(node, str) and re.search(r"\bTODO\b", node):
        left.append(path)


walk(d, "")
if left:
    print("TODO left:", len(left))
    for p in left[:80]:
        print("  ", p)
json.dump(d, open(out_path, "w"), ensure_ascii=False, indent=2)
print("wrote", out_path)
