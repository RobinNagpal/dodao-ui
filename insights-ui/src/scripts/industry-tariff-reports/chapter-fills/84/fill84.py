"""Fill the writer parts of the generated Chapter 84 (Nuclear Reactors, Boilers, Machinery and Mechanical Appliances) content file.

usage: python3 fill84.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Section XVI and Chapter 84 notes; Chapter 99 notes 16, 17, 19, 20, 29, 30, 31, 33, 38, 39,
50, 51, 52), the Section 232 proclamations on steel, aluminum and copper (10895, 10896, 10947, 11021, 11032), automobile and
truck parts (10908, 10925, 10984) and semiconductors (11002), the BIS inclusions notice (90 FR 40326) and the BIS robotics and
industrial machinery investigation notice (90 FR 46382), the IEEPA / Section 122 / Section 301 / Section 338 documents, the
Commerce AD/CVD notices in adcvd84.py, eCFR (up to date as of 2026-10-08) and UN Comtrade. The data parts (rate table, matrix,
line sets) come from the generator and the calculator's measures.json and are only read here.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import copy
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources84 import NEW, CH99_PDF, CH84_PDF  # noqa: E402
from adcvd84 import ADCVD_SOURCES, ADCVD_RULES, ADCVD_CHANGES, ADCVD_BY_HEADING, ADCVD_BY_COUNTRY, ADCVD_COUNTRY_SOURCES  # noqa: E402
from sets84 import build  # noqa: E402
from groups84 import G  # noqa: E402
import ia84  # noqa: E402
import te84  # noqa: E402
import trade84  # noqa: E402

WT = IU
ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF
d["chapter"]["title"] = "Nuclear Reactors, Boilers, Machinery and Mechanical Appliances; Parts Thereof"

# ---------------------------------------------------------------- sources: reuse checked ones from other chapters
REF = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if os.path.basename(f).startswith("84-"):
        continue
    x = json.load(open(f))
    for page in ("tariffUpdates", "industryAreas"):
        for s in (x.get(page) or {}).get("sources", []):
            REF.setdefault(s["id"], s)
SRC = dict(REF)
for s in d["tariffUpdates"]["sources"] + d["industryAreas"]["sources"]:
    SRC[s["id"]] = s  # generator's own (hts-now, hts-before, ...) win
SRC.update(NEW)
SRC.update({s["id"]: s for s in ADCVD_SOURCES})
SRC["hts-chapter-99"]["url"] = CH99_PDF

# ---------------------------------------------------------------- line sets
rows = d["overview"]["rateTable"]["rows"]
LINE = {r["hts"]: r for r in rows if r["htsCode10"]}
S = build(list(LINE))
ia = d["industryAreas"]
ROW = {c["country"]: c for c in ia["countries"]}


def cell_of(country, line, side="withoutUsmca"):
    for cc in ROW[country]["cells"].values():
        for bb in cc[side]["breakdown"]:
            if line in bb["lines"]:
                return bb
    raise KeyError((country, line))


EX52B = set()
for cc in ROW["India"]["cells"].values():
    for bb in cc["withoutUsmca"]["breakdown"]:
        if "9903.05.86" in bb["extra"]:
            EX52B.update(bb["lines"])
CN_ANY = set(S["cn1"]) | set(S["cn2"]) | set(S["cn3"]) | set(S["cn4a"])

assert len(LINE) == 1706, len(LINE)
assert (len(S["s232_25"]), len(S["s232_eq15"]), len(S["s232_mobile"])) == (209, 119, 77), (len(S["s232_25"]), len(S["s232_eq15"]), len(S["s232_mobile"]))
assert (len(S["auto"]), len(S["mhdv"]), len(S["semi"]), len(S["ca338"])) == (89, 39, 10, 56)
assert len(EX52B) == 40 and len(S["br_exempt"]) == 41 and len(CN_ANY) == 1679, (len(EX52B), len(S["br_exempt"]), len(CN_ANY))
assert (len(S["cn1"]), len(S["cn2"]), len(S["cn3"]), len(S["cn4a"])) == (1006, 75, 392, 206)
assert len(S["ru35"]) == 119 and len(S["rual"]) == 71 and len(S["cn_excl"]) == 33
assert not set(S["ca338"]) & set(S["s232_any"])

CTX = {
    "d": d, "SRC": SRC, "LINE": LINE, "ROW": ROW, "S": S, "cell_of": cell_of, "EX52B": EX52B, "CN_ANY": CN_ANY, "G": G,
    "ASOF": ASOF, "ECFR_AS_OF": ECFR_AS_OF, "CH99": CH99_PDF, "CH84": CH84_PDF,
    "ADCVD_RULES": ADCVD_RULES, "ADCVD_CHANGES": ADCVD_CHANGES, "ADCVD_BY_HEADING": ADCVD_BY_HEADING,
    "ADCVD_BY_COUNTRY": ADCVD_BY_COUNTRY, "ADCVD_COUNTRY_SOURCES": ADCVD_COUNTRY_SOURCES,
}

import text84  # noqa: E402

text84.apply(CTX)
ia84.apply(CTX)
te84.apply(CTX)
trade84.apply(CTX)


def todos(x, p=""):
    if isinstance(x, dict):
        for k, v in x.items():
            yield from todos(v, p + "." + k)
    elif isinstance(x, list):
        for v in x:
            yield from todos(v, p + "[]")
    elif isinstance(x, str) and "TODO" in x:
        yield p


left = sorted(set(todos(d)))
assert not left, left
json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
