"""Fill the writer parts of the generated Chapter 51 content file
(Wool, Fine or Coarse Animal Hair; Horsehair Yarn and Woven Fabric).

Re-run through run.sh (generate -> fill -> compact -> prettier -> validate).
Trade-dependent sentences are computed from the generated understandIndustry data.
"""
import json
import os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/51-wool-and-horsehair.json"
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
REL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename="
CH99 = REL + "Chapter%2099"
CH98 = REL + "Chapter%2098"
CH51 = REL + "Chapter%2051"
GN = REL + "General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))

NEW_SOURCES = {
    "hts-ch51": {
        "id": "hts-ch51",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 51",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 51 — note 1 and additional U.S. notes 1–2 (clean yield, wool for special uses, unimproved wool)",
        "signed": None,
        "published": "2026-10-07",
        "url": CH51,
    },
    "fr-2019-14551": {
        "id": "fr-2019-14551",
        "publisher": "Federal Register",
        "citation": "84 FR 33848",
        "document": "Final rule (Commerce / ITA)",
        "title": "Imports of Certain Worsted Wool Fabric: Implementation of Tariff Rate Quota Established Under Title V of the Trade and Development Act of 2000: Removal of Regulations",
        "signed": None,
        "published": "2019-07-16",
        "url": "https://www.federalregister.gov/documents/2019/07/16/2019-14551/imports-of-certain-worsted-wool-fabric-implementation-of-tariff-rate-quota-established-under-title-v",
    },
    "usc-15-68": {
        "id": "usc-15-68",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "15 U.S.C. 68",
        "document": "Wool Products Labeling Act of 1939, definitions",
        "title": "Definitions of wool (including hair of the Angora and Cashmere goat, camel, alpaca, llama and vicuna), recycled wool and wool product",
        "signed": None,
        "published": "2024-01-01",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapIII-sec68.htm",
    },
}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


# ---------------------------------------------------------------- trade helpers
ui = d["understandIndustry"]
NAME_FIX = {
    "Rep. of Korea": "South Korea",
    "Viet Nam": "Vietnam",
    "China, Hong Kong SAR": "Hong Kong",
    "Other Asia, nes": "Taiwan",
    "Czechia": "Czech Republic",
    "Bolivia (Plurinational State of)": "Bolivia",
}


def nm(c):
    return NAME_FIX.get(c, c)


def m(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e6:
        return f"${v / 1e6:.1f}M"
    return f"${v / 1e3:.0f}K"


def pct(a, b):
    return (a - b) / b * 100 if b else 0.0


YEAR = ui["latestYear"]
TOTAL = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
PRIOR = sum(c["priorImportsUsd"] or 0 for c in ui["byCountry"]) + ui["othersPriorImportsUsd"]
BYC = {nm(c["country"]): c for c in ui["byCountry"]}
HEAD = defaultdict(float)
for ln in ui["byLine"]:
    HEAD[ln["heading"]] += ln["importsUsd"]
HC = defaultdict(list)
for r in ui["byHeadingCountry"]:
    HC[r["heading"]].append((nm(r["country"]), r["importsUsd"]))
for h in HC:
    HC[h].sort(key=lambda x: -x[1])


def imp(country):
    c = BYC.get(country)
    return c["importsUsd"] if c else 0


def head_country(h, country):
    return dict(HC.get(h, [])).get(country, 0)


def share(v):
    return f"{v / TOTAL * 100:.0f}%"


def top_suppliers(h, n=3):
    return ", ".join(f"{c} {m(v)}" for c, v in HC.get(h, [])[:n])


TOP = [nm(c["country"]) for c in ui["byCountry"]]

exec(open(os.path.join(HERE, "fill51_text.py")).read())

# ---------------------------------------------------------------- write
d["asOf"] = CHECKED
assert "TODO" not in json.dumps(d, ensure_ascii=False), [
    k for k in ("overview", "tariffUpdates", "understandIndustry", "industryAreas", "tariffEngineering", "finalConclusion")
    if "TODO" in json.dumps(d[k])
]
assert "…" not in json.dumps(d, ensure_ascii=False), "truncated label left"
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
