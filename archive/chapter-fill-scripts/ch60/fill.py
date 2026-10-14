"""Fill the writer parts of the generated Chapter 60 (Knitted or Crocheted Fabrics) content file.

Usage (see run.sh): python3 fill.py <generated.json> <output.json>
"""
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.dirname(HERE)
WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
SRC, OUT = sys.argv[1], sys.argv[2]
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
REL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename="
CH99 = REL + "Chapter%2099"
CH98 = REL + "Chapter%2098"
CH60 = REL + "Chapter%2060"
GN = REL + "General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(SRC))

# ------------------------------------------------------------------ source pool
POOL = {}
try:
    POOL.update(json.load(open(os.path.join(SP, "ch50", "pool.json"))))
except FileNotFoundError:
    pass
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if f.endswith("60-knitted-fabrics.json"):
        continue
    try:
        dd = json.load(open(f))
    except Exception:
        continue
    for page in ("tariffUpdates", "industryAreas"):
        for s in (dd.get(page) or {}).get("sources", []):
            POOL.setdefault(s["id"], s)

NEW_SOURCES = {
    "cbp-wro-xinjiang": {
        "id": "cbp-wro-xinjiang",
        "publisher": "CBP",
        "citation": "CBP national media release",
        "document": "Withhold Release Order",
        "title": "CBP Issues Region-Wide Withhold Release Order on Products Made by Slave Labor in Xinjiang (cotton and tomato products, including downstream textiles)",
        "signed": None,
        "published": "2021-01-13",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-region-wide-withhold-release-order-products-made-slave",
    },
    "dhs-uflpa-list": {
        "id": "dhs-uflpa-list",
        "publisher": "DHS",
        "citation": "DHS Forced Labor Enforcement Task Force",
        "document": "UFLPA Entity List",
        "title": "UFLPA Entity List",
        "signed": None,
        "published": "2026-10-13",
        "url": "https://www.dhs.gov/uflpa-entity-list",
    },
}


def src(sid):
    s = NEW_SOURCES.get(sid) or POOL.get(sid)
    if s is None:
        raise KeyError(f"unknown source {sid}")
    return s


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


def usd(x):
    if x >= 1e9:
        return f"${x / 1e9:.2f}B"
    if x >= 1e6:
        return f"${x / 1e6:.1f}M"
    if x >= 1e3:
        return f"${x / 1e3:.0f}K"
    return f"${x:,.0f}"


ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."

# ------------------------------------------------------------------ trade facts
ui = d["understandIndustry"]
NAME_FIX = {"Rep. of Korea": "South Korea", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "Türkiye": "Turkey", "China, Hong Kong SAR": "Hong Kong"}
for c in ui["byCountry"]:
    c["country"] = NAME_FIX.get(c["country"], c["country"])
for c in ui["byHeadingCountry"]:
    c["country"] = NAME_FIX.get(c["country"], c["country"])
ui["byYearPartners"] = [NAME_FIX.get(p, p) for p in ui["byYearPartners"]]
for s in ui["stats"]:
    for a, b in NAME_FIX.items():
        s["label"] = s["label"].replace(a, b)
BYC = {c["country"]: c for c in ui["byCountry"]}
YEAR = ui["latestYear"]
TOTAL = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
YTOT = {y["year"]: y["totalUsd"] for y in ui["byYear"]}


TRADE = json.load(open(f"{WT}/src/tariff-data/trade/chapter-60.json"))
ALLC = {NAME_FIX.get(c["country"], c["country"]): c["importsUsd"] for c in TRADE["byCountry"]}


def imp(name):
    return ALLC[name]


def share(name):
    return 100 * imp(name) / TOTAL


exec(open(os.path.join(HERE, "fill_text.py")).read())

d["asOf"] = CHECKED
json.dump(d, open(OUT, "w"), indent=2, ensure_ascii=False)


def todo_walk(o, p=""):
    if isinstance(o, dict):
        for k, v in o.items():
            todo_walk(v, p + "." + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            todo_walk(v, p + f"[{i}]")
    elif isinstance(o, str) and "TODO" in o:
        print("TODO left:", p, o[:120])


todo_walk(d)
print("filled", OUT)
