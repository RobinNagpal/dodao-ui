"""Fill the writer parts of the generated Chapter 82 (Tools, Implements, Cutlery, Spoons and Forks, of Base Metal) content file.

usage: python3 fill82.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 82 + Chapter 99 notes 16, 20, 29, 30, 50, 51, 52), the Section 232 steel
proclamations and Commerce notices (10896, 10947, the August 2025 inclusions, 11021, 11032), the IEEPA / Section 122 /
Section 301 / Section 338 documents, the Commerce AD/CVD notices on diamond sawblades and heavy forged hand tools,
eCFR title 19 (up to date as of 2026-10-08), 19 U.S.C. 1304, 15 U.S.C. 1241-1245 and UN Comtrade. The data parts (rate
table, matrix, line sets) come from the generator and are only read here.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources82 import NEW, CH99_PDF, CH82_PDF  # noqa: E402
from text82 import apply_text  # noqa: E402

WT = IU
ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF

# ---------------------------------------------------------------- sources: reuse checked ones from other chapters
REF = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if os.path.basename(f).startswith("82-"):
        continue
    x = json.load(open(f))
    for page in ("tariffUpdates", "industryAreas"):
        for s in (x.get(page) or {}).get("sources", []):
            REF.setdefault(s["id"], s)
SRC = dict(REF)
for s in d["tariffUpdates"]["sources"]:
    SRC[s["id"]] = s  # generator's own (hts-now, hts-before, ...) win
SRC.update(NEW)
SRC["hts-chapter-99"]["url"] = CH99_PDF

# ---------------------------------------------------------------- line sets from the engine output
rows = d["overview"]["rateTable"]["rows"]
LINE = {r["hts"]: r for r in rows if r["htsCode10"]}
ia = d["industryAreas"]
ROW = {c["country"]: c for c in ia["countries"]}


def line_extras(country, side="withoutUsmca"):
    out = {}
    for cell in ROW[country]["cells"].values():
        for b in (cell.get(side) or {}).get("breakdown", []):
            for ln in b["lines"]:
                out[ln] = b
    return out


IN = line_extras("India")
CN = line_extras("China")
S25 = sorted(l for l, b in IN.items() if b["extra"] == "+25%")
EQ = sorted(l for l, b in IN.items() if "in place of base" in b["extra"])
NON = sorted(l for l, b in IN.items() if b["extra"] == "+10%")
CA338 = sorted(l for l, b in line_extras("Canada").items() if "9903.03.14" in b["extra"])
RU35 = sorted(l for l, b in line_extras("Russia").items() if "9903.90.08" in b["extra"])
CN_L3 = sorted(l for l, b in CN.items() if "9903.88.03" in b["extra"])
CN_4A = sorted(l for l, b in CN.items() if "9903.88.15" in b["extra"])
CN_NONE = sorted(l for l in LINE if l not in CN_L3 and l not in CN_4A)
SETS = ["8205.90.60.00", "8206.00.00.00", "8211.10.00.00", "8215.10.00.00", "8215.20.00.00"]

assert len(LINE) == 189, len(LINE)
assert (len(S25), len(EQ), len(NON)) == (52, 3, 134), (len(S25), len(EQ), len(NON))
assert EQ == ["8207.20.00.70", "8207.30.60.62", "8207.30.60.95"], EQ
assert len(CA338) == 18, CA338
assert RU35 == ["8205.59.30.10", "8205.59.30.80", "8207.20.00.30", "8207.20.00.40", "8207.20.00.70", "8208.90.60.00"], RU35
assert (len(CN_L3), len(CN_4A), len(CN_NONE)) == (141, 27, 21), (len(CN_L3), len(CN_4A), len(CN_NONE))
assert all(s in LINE for s in SETS)
assert all(LINE[s]["effectiveGeneral"].startswith("The rate of duty applicable to that article in the set") for s in SETS)

CTX = {
    "d": d, "SRC": SRC, "LINE": LINE, "ROW": ROW, "line_extras": line_extras,
    "S25": S25, "EQ": EQ, "NON": NON, "CA338": CA338, "RU35": RU35, "CN_L3": CN_L3, "CN_4A": CN_4A, "CN_NONE": CN_NONE, "SETS": SETS,
    "ASOF": ASOF, "ECFR_AS_OF": ECFR_AS_OF, "CH82_PDF": CH82_PDF, "CH99_PDF": CH99_PDF,
}
apply_text(CTX)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
