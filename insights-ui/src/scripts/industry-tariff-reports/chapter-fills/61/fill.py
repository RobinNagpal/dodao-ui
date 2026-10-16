"""Fill the writer parts of the generated Chapter 61 content file (knitted or crocheted apparel).

Usage: python3 fill.py <generated.json> <out.json>   (run.sh does generate -> fill -> compact -> prettier [-> validate])
Text pieces live in fill_text.py (tariff updates, matrix) and fill_pages.py (engineering, FAQ); this file loads the
sources, computes the trade figures and writes the overview.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FORBIDDEN_SOURCE, IU  # noqa: E402,F401

import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.dirname(HERE)
WT = IU
SRC, OUT = sys.argv[1], sys.argv[2]
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH61 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2061"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(SRC))

# ---------------------------------------------------------------- sources
# Official sources already checked in other chapters (pool of the batch, then committed chapter files), plus the
# ones this chapter adds.
pool = json.load(open(os.path.join(SP, "63", "pool.json")))
REF = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if "/61-" in f:
        continue
    x = json.load(open(f))
    for page in ("tariffUpdates", "industryAreas"):
        for s in (x.get(page) or {}).get("sources", []):
            REF.setdefault(s["id"], s)

NEW = {
    "hts-ch61": {
        "id": "hts-ch61",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 61",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 61: Articles of Apparel and "
        "Clothing Accessories, Knitted or Crocheted (chapter notes, additional U.S. note 1, statistical notes)",
        "signed": None,
        "published": "2026-10-07",
        "url": CH61,
    },
    "fr-2011-6253": {
        "id": "fr-2011-6253",
        "publisher": "Federal Register",
        "citation": "76 FR 14575",
        "document": "Final rule (CBP Dec. 11-09)",
        "title": "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer "
        "identification code required)",
        "signed": None,
        "published": "2011-03-17",
        "url": "https://www.federalregister.gov/documents/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products",
    },
    "cbp-wro-xpcc": {
        "id": "cbp-wro-xpcc",
        "publisher": "CBP",
        "citation": "CBP national media release, December 2, 2020",
        "document": "Withhold release order",
        "title": "CBP Issues Detention Order on Cotton Products Made by Xinjiang Production and Construction Corps Using Prison Labor",
        "signed": None,
        "published": "2020-12-02",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-detention-order-cotton-products-made-xinjiang-production",
    },
    "cbp-wro-xinjiang": {
        "id": "cbp-wro-xinjiang",
        "publisher": "CBP",
        "citation": "CBP national media release, January 13, 2021",
        "document": "Withhold release order",
        "title": "CBP Issues Region-Wide Withhold Release Order on Products Made by Slave Labor in Xinjiang (cotton and tomato products)",
        "signed": None,
        "published": "2021-01-13",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-region-wide-withhold-release-order-products-made-slave",
    },
    "cbp-uflpa": {
        "id": "cbp-uflpa",
        "publisher": "CBP",
        "citation": "CBP web page (modified September 14, 2026)",
        "document": "Uyghur Forced Labor Prevention Act",
        "title": "Uyghur Forced Labor Prevention Act: the rebuttable presumption and CBP enforcement",
        "signed": None,
        "published": "2026-09-14",
        "url": "https://www.cbp.gov/trade/forced-labor/UFLPA",
    },
    "dhs-uflpa-entity-list": {
        "id": "dhs-uflpa-entity-list",
        "publisher": "DHS",
        "citation": "DHS web page (updated July 31, 2026)",
        "document": "UFLPA Entity List",
        "title": "UFLPA Entity List (includes the Xinjiang Production and Construction Corps, listed June 21, 2022)",
        "signed": None,
        "published": "2026-07-31",
        "url": "https://www.dhs.gov/uflpa-entity-list",
    },
    "usc-3721": {
        "id": "usc-3721",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "19 U.S.C. 3721",
        "document": "United States Code, 2024 edition",
        "title": "AGOA section 112: treatment of certain textiles and apparel (regional apparel and third-country fabric programs "
        "for lesser developed beneficiary countries)",
        "signed": None,
        "published": "2024-12-31",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap23-subchapII-sec3721.htm",
    },
    "usc-2703a": {
        "id": "usc-2703a",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "19 U.S.C. 2703a",
        "document": "United States Code, 2024 edition",
        "title": "Special rules for Haiti (HOPE, HOPE II and HELP): duty-free apparel wholly assembled or knit-to-shape in Haiti",
        "signed": None,
        "published": "2024-12-31",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap15-sec2703a.htm",
    },
    "usc-2703": {
        "id": "usc-2703",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "19 U.S.C. 2703(b)(2), (b)(5)(D)",
        "document": "United States Code, 2024 edition",
        "title": "Caribbean Basin Trade Partnership Act: preferential treatment of apparel; the transition period ends September 30, 2030",
        "signed": None,
        "published": "2024-12-31",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap15-sec2703.htm",
    },
    "usc-1321": {
        "id": "usc-1321",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "19 U.S.C. 1321(a)(2)(C)",
        "document": "United States Code, 2024 edition",
        "title": "Tariff Act of 1930, section 321: the $800 administrative (de minimis) exemption",
        "signed": None,
        "published": "2024-12-31",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1321.htm",
    },
}


def src(sid):
    if sid in NEW:
        return NEW[sid]
    if sid in pool:
        return pool[sid]
    return REF[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


# ---------------------------------------------------------------- trade figures
trade = json.load(open(f"{WT}/src/tariff-data/trade/chapter-61.json"))
NAMES = {"Viet Nam": "Vietnam", "Rep. of Korea": "South Korea", "Other Asia, nes": "Taiwan", "Dominican Rep.": "Dominican Republic"}
BC = {NAMES.get(c["country"], c["country"]): c for c in trade["byCountry"]}
TOT = {t["year"]: t["totalUsd"] for t in trade["totalsByYear"]}
Y, PY = trade["latestYear"], trade["priorYear"]
BH = {h["heading"]: h["byYear"] for h in trade["byHeading"]}
HS6 = {h["hs6"]: h for h in trade["byHs6"]}


def m(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M" if v >= 1e7 else f"${v / 1e6:.1f}M"


def imp(c):
    return BC[c]["importsUsd"] if c in BC else 0


def chg(c):
    x = BC[c]
    return round((x["importsUsd"] / x["priorImportsUsd"] - 1) * 100)


def sh(c):
    return round(imp(c) / TOT[Y] * 100, 1)


def hy(h, y=Y):
    return BH[h][str(y)]


CAFTA = ["Honduras", "Nicaragua", "Guatemala", "El Salvador", "Dominican Republic", "Costa Rica"]
CAFTA_TOT = sum(imp(c) for c in CAFTA)
ranked = [NAMES.get(c["country"], c["country"]) for c in trade["byCountry"]]
assert ranked[:6] == ["Vietnam", "China", "Cambodia", "Bangladesh", "Indonesia", "India"], ranked[:6]
TOTAL = m(TOT[Y])
TOT_CHG = round((TOT[Y] / TOT[PY] - 1) * 100, 1)

# ---------------------------------------------------------------- shared facts
ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
CA338 = "6104.43.20 (women's synthetic dresses), 6104.63.20 (women's synthetic trousers and shorts), 6109.10.00 (cotton T-shirts), 6110.20.20 (cotton sweaters and sweatshirts), 6110.30.30 (man-made-fibre sweaters and sweatshirts) and 6116.93.88 (synthetic gloves without fourchettes)"
NOT_4A = (
    "43 of the chapter's 252 eight-digit subheadings (124 of the 838 lines) — mostly silk, cashmere, wool-blend and "
    "artificial-fibre lines, hockey and other special gloves, surgical compression hosiery and ties — were put on List 4B "
    "(9903.88.16), which never took effect"
)
LIST_EXCEPT = (
    "Jordan's exception list (note 52(j), 9903.06.20) and, when CAFTA-DR is claimed, the Guatemala and El Salvador lists "
    "(9903.06.06, 9903.06.09) cover 245 of the 252 Chapter 61 subheadings — every one except graduated compression "
    "hosiery (6115.10)"
)
FREE_GENERAL = (
    "17 lines whose General rate is already Free — suits of artificial fibres and wool-blend synthetic suits (6103.10.40, "
    ".50, 6104.13.10, 6104.19.15), women's suit-type jackets of other textiles (6104.39.20), artificial-fibre babies' "
    "T-shirts (6111.90.30), surgical compression hosiery (6115.10.05), and ice- and field-hockey gloves and silk gloves "
    "(6116.10.05, .92.05, .93.05, .99.20, .99.75)"
)

LABELS = {
    "6101": ("Men's and boys' knit coats, anoraks, ski jackets and windbreakers", "Men's coats & jackets"),
    "6102": ("Women's and girls' knit coats, anoraks, ski jackets and windbreakers", "Women's coats & jackets"),
    "6103": ("Men's and boys' knit suits, ensembles, blazers, trousers and shorts", "Men's suits & trousers"),
    "6104": ("Women's and girls' knit suits, ensembles, dresses, skirts, trousers, leggings and shorts", "Women's dresses & pants"),
    "6105": ("Men's and boys' knit shirts (polo shirts)", "Men's knit shirts"),
    "6106": ("Women's and girls' knit blouses and shirts", "Women's knit blouses"),
    "6107": ("Men's and boys' underwear, pajamas and bathrobes, knit", "Men's underwear & sleepwear"),
    "6108": ("Women's and girls' slips, panties, nightdresses, pajamas and robes, knit", "Women's underwear & sleepwear"),
    "6109": ("T-shirts, singlets and tank tops, knit", "T-shirts & tank tops"),
    "6110": ("Sweaters, pullovers, sweatshirts, hoodies, cardigans and vests, knit", "Sweaters & sweatshirts"),
    "6111": ("Babies' garments and clothing accessories, knit", "Babies' clothing"),
    "6112": ("Track suits, ski suits and swimwear, knit", "Track suits & swimwear"),
    "6113": ("Garments of coated, rubberized or laminated knit fabric", "Coated-fabric garments"),
    "6114": ("Other knit garments (tops, bodysuits, jumpsuits, scrubs)", "Other garments"),
    "6115": ("Socks, tights, pantyhose and other hosiery, knit", "Socks & hosiery"),
    "6116": ("Gloves, mittens and mitts, knit", "Gloves & mittens"),
    "6117": ("Scarves, shawls, ties, headbands and other knit accessories; parts", "Scarves & accessories"),
}

exec(open(os.path.join(HERE, "fill_overview.py")).read())
exec(open(os.path.join(HERE, "fill_text.py")).read())
exec(open(os.path.join(HERE, "fill_pages.py")).read())

# ---------------------------------------------------------------- dates, checks, write
for page in ("tariffUpdates", "understandIndustry", "industryAreas", "tariffEngineering", "finalConclusion"):
    d[page]["lastCheckedAt"] = CHECKED
d["asOf"] = CHECKED
s = json.dumps(d)
left = [mm.start() for mm in re.finditer("TODO", s)]
if left:
    raise SystemExit("TODO left: " + " | ".join(s[max(0, i - 160):i + 40] for i in left[:6]))
assert FORBIDDEN_SOURCE not in s.lower()
for c in d["tariffUpdates"]["changes"]:
    for sid in c["sourceIds"]:
        assert sid in {x["id"] for x in d["tariffUpdates"]["sources"]}, sid
json.dump(d, open(OUT, "w"), indent=2, ensure_ascii=False)
print("filled", OUT)
