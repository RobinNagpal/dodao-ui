"""Fill the writer TODOs of the generated Chapter 32 content file.

Usage: python3 fill32.py <generated.json> <out.json>
Re-runnable: always start from a fresh `pnpm tariff:generate-chapter` output.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = IU
sys.path.insert(0, HERE)
from content32 import (  # noqa: E402
    CHANGES_EXTRA,
    CHANGE_DETAILS,
    FAQS,
    GROUP_INFO,
    IN_EFFECT,
    LEVERS,
    MATRIX_RULES,
    NEW_SOURCES,
    RULES,
    TEXT,
)

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
TODAY = d["asOf"]
H1 = "HTS Chapter 32: Dyes, Pigments, Paints & Inks"

# ------------------------------------------------------------------ source pool
POOL = {}
for f in sorted(glob.glob(os.path.join(REPO, "src/tariff-data/chapters/*.json"))):
    if "/32-" in f:
        continue
    c = json.load(open(f))
    for page in ("tariffUpdates", "industryAreas"):
        for s in c.get(page, {}).get("sources", []):
            POOL.setdefault(s["id"], s)
for s in d["tariffUpdates"]["sources"]:
    POOL[s["id"]] = s
for s in NEW_SOURCES:
    POOL[s["id"]] = s


def src_list(ids):
    seen, res = set(), []
    for i in ids:
        if i in seen:
            continue
        if i not in POOL:
            raise SystemExit(f"unknown source id {i}")
        seen.add(i)
        res.append(POOL[i])
    return res


# ------------------------------------------------------------------ overview
ov = d["overview"]
ov["h1"] = f"{H1} — Tariff Rates"
ov["seo"] = TEXT["overview_seo"]
ov["intro"] = TEXT["overview_intro"]
for st in ov["stats"]:
    if st["label"] == "Lines with an extra duty for some origins":
        st["note"] = TEXT["overview_extra_note"]
for g in ov["productGroups"]:
    info = GROUP_INFO[g["heading"]]
    g["label"] = info["label"]
    g["blurb"] = info["blurb"]
    g["searchExamples"] = info["search"]
ov["workedExamples"] = TEXT["worked_examples"]
ts = ov["tradeSnapshot"]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
LINE_LABELS = {
    "3206.11": "Titanium dioxide pigments (80% or more TiO2)",
    "3214.10": "Caulking compounds, mastics and painters' fillings",
}
for bl in ts["biggestLines"]:
    bl["label"] = LINE_LABELS.get(bl["hts"], bl["label"])
ov["notes"] = {"chapterNotes": TEXT["chapter_notes"], "additionalUsNotes": TEXT["additional_us_notes"]}

# ------------------------------------------------------------------ tariff updates
tu = d["tariffUpdates"]
tu["h1"] = f"{H1} — Tariff Updates"
tu["seo"] = TEXT["tu_seo"]
tu["intro"] = TEXT["tu_intro"]
tu["scope"] = TEXT["tu_scope"]
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "168 of 168 lines", "note": "Free to 6.5%"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "2026 Section 301, China lists, Brazil, Canada §338, Russia"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
    {"label": "Antidumping orders in force", "value": "2", "note": "Optical brighteners from China and Taiwan"},
]
by_id = {e["id"]: e for e in tu["inEffect"]}
for k, v in IN_EFFECT.items():
    e = by_id[k]
    e.update({kk: vv for kk, vv in v.items() if kk != "extraSources"})
    for sid in v.get("extraSources", []):
        if sid not in e["sourceIds"]:
            e["sourceIds"].append(sid)
    assert e["effectiveSourceId"] in e["sourceIds"]
missing = set(by_id) - set(IN_EFFECT)
assert not missing, missing

changes = []
for c in tu["changes"]:
    if c["id"] in CHANGE_DETAILS:
        c.update(CHANGE_DETAILS[c["id"]])
    changes.append(c)
changes += CHANGES_EXTRA
ids = [c["id"] for c in changes]
assert len(ids) == len(set(ids)), "duplicate change id"
changes.sort(key=lambda c: c["date"], reverse=True)
# keep the base-rate check first among same-day entries
tu["changes"] = changes

used = set()
for e in tu["inEffect"]:
    used.update(e["sourceIds"])
for c in tu["changes"]:
    used.update(c["sourceIds"])
order = [s["id"] for s in tu["sources"]] + [s["id"] for s in NEW_SOURCES] + sorted(POOL)
tu["sources"] = src_list([i for i in order if i in used])

# ------------------------------------------------------------------ understand industry
ui = d["understandIndustry"]
ui["h1"] = f"{H1} — U.S. Import Statistics"
ui["seo"] = TEXT["ui_seo"]
ui["why"] = TEXT["ui_why"]
for st in ui["stats"]:
    if st["label"] == "Largest product":
        st["note"] = "Titanium dioxide pigments (3206.11)"
for c in ui["byCountry"]:
    if c["mainHeading"]:
        c["mainHeadingLabel"] = GROUP_INFO[c["mainHeading"]]["label"]
ui["byYearCaption"] = (
    "U.S. imports of Chapter 32 goods each year, split into the two largest suppliers in 2025 (Canada and Germany) and everyone else."
)
ui["sources"] = ui["sources"] + TEXT["ui_sources"]

# ------------------------------------------------------------------ industry areas
ia = d["industryAreas"]
ia["h1"] = f"{H1} — Tariff Rates by Country"
ia["seo"] = TEXT["ia_seo"]
ia["intro"] = TEXT["ia_intro"]
for g in ia["groups"]:
    info = GROUP_INFO[g["heading"]]
    g["label"] = info["label"]
    g["shortLabel"] = info["short"]
for c in ia["countries"]:
    r = MATRIX_RULES[c["country"]]
    c["rule"]["label"] = r["label"]
    c["rule"]["sourceIds"] = r["sourceIds"]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + TEXT["ia_assumptions"]
ia["exemptionCheck"] = TEXT["ia_exemption_check"]
ia_ids = ["hts-now"]
for c in ia["countries"]:
    ia_ids += c["rule"]["sourceIds"]
ia["sources"] = src_list(ia_ids)

# ------------------------------------------------------------------ tariff engineering
te = d["tariffEngineering"]
te["h1"] = f"{H1} — Import Documents & Ways to Lower Duty"
te["seo"] = TEXT["te_seo"]
te["intro"] = TEXT["te_intro"]
te["regulationsAsOf"] = "2026-10-08"
te["levers"] = LEVERS
te["rules"] = RULES
te["disclaimer"] = TEXT["te_disclaimer"]
rule_ids = {r["id"] for r in RULES}
lever_ids = {l["id"] for l in LEVERS}


def h8(hts):
    return hts.replace(".", "")[:8]


def line_rules(l):
    code = h8(l["hts"])
    hd = l["heading"]
    rs = ["tsca"]
    if hd == "3203" or hd == "3205" or code in ("32041800", "32061100", "32061900") or l["hts"] in ("3204.12.50.10", "3204.12.50.20", "3204.12.50.30"):
        rs.append("fda-color")
    if hd in ("3208", "3209", "3210"):
        rs += ["cpsc-lead", "epa-voc-arch"]
    if hd in ("3208", "3209"):
        rs.append("epa-voc-aerosol")
    if hd == "3213" or code == "32159010":
        rs.append("cpsc-art")
    if hd in ("3208", "3211", "3215") or code == "32129000":
        rs.append("dot-hazmat")
    if code == "32042080":
        rs.append("adcvd-soba")
    if code in ("32081000", "32082000", "32089000", "32091000", "32099000", "32139000", "32141000"):
        rs.append("ru-aluminum")
    return rs


def line_levers(l):
    code = h8(l["hts"])
    lv = ["origin", "usmca"]
    if l["general"] not in (None, "Free"):
        lv.append("fta")
    if code in ("32030080", "32041360", "32041380", "32041800", "32049000"):
        lv.append("pharma-use")
    if code == "32042080":
        lv.append("adcvd-scope")
    lv += ["first-sale", "drawback", "ftz", "goods-returned"]
    return lv


for l in te["lines"]:
    l["ruleIds"] = line_rules(l)
    l["leverIds"] = line_levers(l)
    assert set(l["ruleIds"]) <= rule_ids and set(l["leverIds"]) <= lever_ids, l["hts"]
for g in te["groups"]:
    info = GROUP_INFO[g["heading"]]
    g["label"] = info["label"]
    rs = []
    for l in te["lines"]:
        if l["heading"] == g["heading"]:
            for r in l["ruleIds"]:
                if r not in rs:
                    rs.append(r)
    g["ruleIds"] = rs
    g["note"] = info["eng_note"]

# ------------------------------------------------------------------ final conclusion
fc = d["finalConclusion"]
fc["h1"] = f"{H1} — Tariff FAQ"
fc["seo"] = TEXT["fc_seo"]
fc["intro"] = TEXT["fc_intro"]
fc["keyTakeaways"] = TEXT["fc_takeaways"]
fc["questionSource"] = "Google search suggestions (google.com autocomplete, U.S. English), collected October 12, 2026"
fc["faqs"] = FAQS

d["sources"] = d["sources"] + [
    {"label": "Federal Register", "url": "https://www.federalregister.gov/", "note": "proclamations, executive orders, USTR and Commerce notices"},
    {"label": "Electronic Code of Federal Regulations", "url": "https://www.ecfr.gov/", "note": "entry rules (19, 16, 21, 40 and 49 CFR), current to October 8, 2026"},
]


def check(o, p=""):
    if isinstance(o, dict):
        for k, v in o.items():
            check(v, p + "." + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            check(v, f"{p}[{i}]")
    elif isinstance(o, str) and "TODO" in o:
        raise SystemExit(f"TODO left at {p}: {o[:80]}")


check(d)
json.dump(d, open(out, "w"), ensure_ascii=False, indent=2)
print("filled ->", out)
