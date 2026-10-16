"""Fill the writer parts of the generated Chapter 13 content file.

Re-run after a regeneration:
  cd insights-ui && pnpm tariff:generate-chapter --chapter 13 --slug 13-lac-gums-resins \
      --title "Lac; Gums, Resins and Other Vegetable Saps and Extracts" \
      --countries IN,CN,FR,ES,DE,IT,MX,DK,PH,BR,CL,CA,TD --force
  python3 <scratch>/ch13/fill.py && npx prettier --write src/tariff-data/chapters/13-lac-gums-resins.json
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, OUT  # noqa: E402,F401

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from fill_text import *  # noqa: E402,F401,F403

WT = IU
PATH = OUT  # run.sh copies the generated file here; filled in place
POOL = json.load(open(os.path.join(HERE, "pool.json")))

d = json.load(open(PATH))


def add_sources(page_sources, ids):
    have = {s["id"] for s in page_sources}
    for sid in ids:
        if sid in have:
            continue
        src = POOL.get(sid) or NEW_SOURCES.get(sid)
        if src is None:
            raise SystemExit(f"unknown source {sid}")
        page_sources.append(src)
        have.add(sid)


# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = OV_H1
ov["seo"] = OV_SEO
ov["intro"] = OV_INTRO
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = PRODUCT_GROUPS[g["heading"]]
for st in ov["stats"]:
    if st["label"] == "Lines with an extra duty for some origins":
        st["note"] = "Section 301 (60 economies, Brazil, China List 4A): all 24; Canada Section 338: 20, USMCA claims included"
ov["workedExamples"] = WORKED_EXAMPLES
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["biggestLines"] = [
    {"hts": "1302.19", "label": "Other plant extracts (herbal, ginseng, aloe)"},
    {"hts": "1302.20", "label": "Pectin"},
    {"hts": "1302.32", "label": "Guar & locust bean gum"},
]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ov["notes"]["chapterNotes"] = CHAPTER_NOTES
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = TU_H1
tu["seo"] = TU_SEO
tu["intro"] = TU_INTRO
tu["scope"] = TU_SCOPE
tu["stats"] = [st for st in tu["stats"] if st["label"] != "Extra duties in effect"] + [
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "By country; see the cards below"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
for st in tu["stats"]:
    if st["label"] == "New or renumbered lines":
        st["note"] = "Other plant extracts split into organic / other, both Free"

for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    spec = IN_EFFECT[key]
    e["exemption"], e["whatItMeans"] = spec["exemption"], spec["whatItMeans"]
    for k in ("country", "measure", "now", "before", "effectiveFrom", "effectiveSourceId", "ch99Code"):
        if k in spec:
            e[k] = spec[k]
    for sid in spec.get("extraSources", []):
        if sid not in e["sourceIds"]:
            e["sourceIds"].insert(-1, sid)
    if e["effectiveSourceId"] not in e["sourceIds"]:
        e["sourceIds"].insert(0, e["effectiveSourceId"])

add_sources(tu["sources"], TU_EXTRA_SOURCES)
for s in tu["sources"]:
    if s["id"] == "hts-now-cr":
        s["published"] = "2026-10-09"
tu["changes"] = CHANGES

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = UI_H1
ui["seo"] = UI_SEO
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
for ln in ui["byLine"]:
    if ln["hs6"] in HS6_LABELS:
        label, words = HS6_LABELS[ln["hs6"]]
        ln["description"] = label
        ln["searchText"] = f"{ln['hs6'].replace('.', '')} {ln['hs6']} {label.lower()} {words}"
for st in ui["stats"]:
    if st["label"] == "Largest product":
        st["note"] = "Other plant extracts (1302.19)"
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = UI_WHY
ui["sources"] = UI_SOURCES
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = IA_H1
ia["seo"] = IA_SEO
ia["intro"] = IA_INTRO
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
for c in ia["countries"]:
    key = "EU" if c["country"] in EU_MEMBERS else c["country"]
    c["rule"]["label"] = RULE_LABELS[key]
    for sid in RULE_EXTRA_SOURCES.get(key, []):
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].insert(-1, sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + IA_ASSUMPTIONS
ia["exemptionCheck"] = IA_EXEMPTION_CHECK
add_sources(ia["sources"], IA_EXTRA_SOURCES)

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = TE_H1
te["seo"] = TE_SEO
te["intro"] = TE_INTRO
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = LEVERS
te["rules"] = RULES
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES[g["heading"]]
for ln in te["lines"]:
    ln["ruleIds"] = rules_for(ln["hts"])
    ln["leverIds"] = levers_for(ln["hts"], ln.get("general"))
te["disclaimer"] = TE_DISCLAIMER

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = FC_H1
fc["seo"] = FC_SEO
fc["intro"] = FC_INTRO
fc["keyTakeaways"] = KEY_TAKEAWAYS
fc["questionSource"] = QUESTION_SOURCE
fc["faqs"] = FAQS

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
