"""Fill the writer parts of the generated Chapter 56 content file (run by run.sh after the generator).

    python3 fill56.py <content-file>
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from fill56_static import *  # noqa: E402,F401,F403
from fill56_text import TEXT  # noqa: E402

PATH = sys.argv[1]
d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


def no_todo(obj, where=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            no_todo(v, f"{where}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            no_todo(v, f"{where}[{i}]")
    elif isinstance(obj, str) and "TODO" in obj:
        raise SystemExit(f"TODO left at {where}: {obj[:120]}")


T = TEXT(d)

# ---------------------------------------------------------------- chapter + root
d["chapter"]["title"] = TITLE
d["asOf"] = CHECKED
d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States, 2026 Revision 21", "url": "https://hts.usitc.gov/", "note": "rate table rows, chapter and Chapter 99 notes"},
    {"label": "Federal Register (proclamations, executive orders, USTR and Commerce notices)", "url": "https://www.federalregister.gov/"},
    {"label": "UN Comtrade, United States imports, HS chapter 56", "url": "https://comtradeplus.un.org/"},
    {"label": "Electronic Code of Federal Regulations (19 CFR, 16 CFR, 21 CFR)", "url": "https://www.ecfr.gov/"},
]

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov.update(T["overview"])
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]
ov["notes"]["chapterNotes"] = CHAPTER_NOTES
ov["notes"]["additionalUsNotes"] = ADDITIONAL_US_NOTES
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts.update(T["tradeSnapshot"])

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
for k in ("h1", "seo", "intro", "scope"):
    tu[k] = T["tariffUpdates"][k]
IE = {x["id"]: x for x in tu["inEffect"]}
for k, (ex, wim, extra) in T["exempt"].items():
    if k not in IE:
        raise SystemExit(f"inEffect id {k} not generated")
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
missing = [k for k in IE if k not in T["exempt"]]
if missing:
    raise SystemExit(f"no exemption text for {missing}")
add_sources(tu, [s for v in T["exempt"].values() for s in v[2]])
gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 56 base-rate changes"
base["detail"] = (
    "All 81 Chapter 56 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)
tu["changes"] = [base] + T["changes"]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)
add_sources(tu, [s for c in tu["changes"] for s in c["sourceIds"]])

# ---------------------------------------------------------------- understandIndustry
ui = d["understandIndustry"]
ui.update(T["understandIndustry"])
# Same rounding as the overview stat (the generator rounds the two shares differently).
top2 = ui["byCountry"][0]["importsUsd"] + ui["byCountry"][1]["importsUsd"]
tot = next(r["totalUsd"] for r in ui["byYear"] if r["year"] == ui["latestYear"])
for st in ui["stats"]:
    if st["label"].startswith("Top 2 share"):
        st["value"] = f"{int(100 * top2 / tot)}%"
for st in d["overview"]["stats"]:
    if st["label"].endswith("share"):
        st["value"] = f"{int(100 * top2 / tot)}%"

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
for k in ("h1", "seo", "intro"):
    ia[k] = T["industryAreas"][k]
for c in ia["countries"]:
    label, extra = T["rules"][c["country"]]
    c["rule"]["label"] = label
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + T["industryAreas"]["assumptions"]
ia["exemptionCheck"] = T["industryAreas"]["exemptionCheck"]
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te.update(T["tariffEngineering"]["page"])
te["regulationsAsOf"] = ECFR_DATE
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = T["tariffEngineering"]["groupRules"](g["heading"])
    g["note"] = T["tariffEngineering"]["groupNotes"][g["heading"]]
for ln in te["lines"]:
    ln["ruleIds"] = T["tariffEngineering"]["lineRules"](ln["hts"])
    ln["leverIds"] = T["tariffEngineering"]["lineLevers"](ln["hts"])

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc.update(T["finalConclusion"])

# ---------------------------------------------------------------- dates + write
for page in ("tariffUpdates", "understandIndustry", "industryAreas", "tariffEngineering", "finalConclusion"):
    d[page]["lastCheckedAt"] = CHECKED
no_todo(d)
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
