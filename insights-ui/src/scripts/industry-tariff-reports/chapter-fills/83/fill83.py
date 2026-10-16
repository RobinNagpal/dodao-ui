"""Fill the writer parts of the generated Chapter 83 (Miscellaneous Articles of Base Metal) content file.

usage: python3 fill83.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 83 + Chapter 99 notes 2(v), 16, 19, 20, 29, 30, 33, 35, 38, 50, 51, 52),
the Section 232 aluminum/steel proclamations (10895, 10896, 10947, 11021, 11032), the BIS implementation and inclusions notices
(90 FR 11251, 90 FR 40326, 91 FR 23056), the auto-parts proclamations and deal notices, the IEEPA / Section 122 / Section 301 /
Section 338 documents, the Commerce AD/CVD notices in sources83.py, eCFR (up to date as of 2026-10-08) and UN Comtrade.
The data parts (rate table, matrix, line sets, trade figures) come from the generator and are only read here.
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
from sources83 import NEW, ADCVD_SOURCES, CH99_PDF, CH83_PDF  # noqa: E402
from text83 import apply_text  # noqa: E402

WT = IU
ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF
d["chapter"]["title"] = "Miscellaneous Articles of Base Metal"

# ---------------------------------------------------------------- sources: reuse checked ones from other chapters
REF = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if os.path.basename(f).startswith("83-"):
        continue
    x = json.load(open(f))
    for page in ("tariffUpdates", "industryAreas"):
        for s in (x.get(page) or {}).get("sources", []):
            REF.setdefault(s["id"], s)
SRC = dict(REF)
for s in d["tariffUpdates"]["sources"]:
    SRC[s["id"]] = s  # generator's own (hts-now, hts-before, ...) win
SRC.update(NEW)
SRC.update({s["id"]: s for s in ADCVD_SOURCES})
SRC["hts-chapter-99"]["url"] = CH99_PDF

# ---------------------------------------------------------------- line sets from the engine output
rows = d["overview"]["rateTable"]["rows"]
LINE = {r["hts"]: r for r in rows if r["htsCode10"]}
ia = d["industryAreas"]
ROW = {c["country"]: c for c in ia["countries"]}


def line_extras(country, side="withoutUsmca"):
    out = {}
    for cell in ROW[country]["cells"].values():
        for b in cell[side]["breakdown"]:
            for ln in b["lines"]:
                out[ln] = b
    return out


IN, CN, RU = line_extras("India"), line_extras("China"), line_extras("Russia")
S232 = sorted(l for l, b in IN.items() if b["extra"] == "+25%")
AUTO = ["8301.20.00.30", "8301.20.00.60", "8302.10.30.00", "8302.30.30.10", "8302.30.30.60", "8302.30.60.00"]
NON232 = sorted(set(LINE) - set(S232))
CN_L3 = sorted(l for l, b in CN.items() if "9903.88.03" in b["extra"])
CN_L4A = sorted(l for l, b in CN.items() if "9903.88.15" in b["extra"])
CN_NONE = sorted(set(LINE) - set(CN_L3) - set(CN_L4A))
CA338 = sorted(l for l, b in line_extras("Canada", "withUsmca").items() if "50%" in b["extra"])
RU200 = sorted(l for l, b in RU.items() if "9903.85.68" in b["extra"])
RU35 = sorted(l for l, b in RU.items() if "9903.90.08" in b["extra"])
assert len(LINE) == 89, len(LINE)
assert len(S232) == 31 and len(NON232) == 58, (len(S232), len(NON232))
assert all(a in LINE for a in AUTO)
assert all("vehicle part" in IN[a]["extra"] for a in AUTO if a not in S232)
assert len(CN_L3) == 57 and len(CN_L4A) == 24 and CN_NONE == [
    "8301.10.50.00", "8301.10.90.00", "8301.40.30.00", "8304.00.00.00", "8305.90.30.10", "8305.90.30.50", "8306.10.00.00", "8306.29.00.00",
], (len(CN_L3), len(CN_L4A), CN_NONE)
assert len(CA338) == 18, CA338
assert len(RU200) == 27 and RU35 == ["8302.30.30.10", "8302.30.30.60", "8305.20.00.00"], (len(RU200), RU35)
assert set(RU200) <= set(S232)
# Section 232 metals lists (note 16(c)): aluminum derivatives (vi) and steel derivatives (vii)
S232_AL = list(RU200)  # the 9903.85.68 (Russia 200%) coverage is exactly the note 19 / 16(c)(vi) aluminum-derivative list
S232_ST = ["8302.10.60.30", "8302.10.60.60", "8302.10.60.90", "8302.41.30.00", "8302.41.60.15", "8302.41.60.45", "8302.41.60.50", "8302.41.60.80", "8302.42.30.10", "8302.42.30.15", "8302.42.30.65",
           "8302.49.60.35", "8302.49.60.45", "8302.49.60.55", "8302.49.60.85", "8305.20.00.00", "8307.10.60.10", "8307.10.60.60", "8309.90.00.80"]
assert set(S232_AL) | set(S232_ST) == set(S232)
# lines that became aluminum derivatives on March 12, 2025 (90 FR 11251) and the August 18, 2025 inclusions (90 FR 40326)
AL_2025_03 = sorted(l for l in RU200 if l not in ("8307.90.60.00", "8309.90.00.20", "8309.90.00.25"))
assert len(AL_2025_03) == 24
INCL_2025_08 = ["8302.10.60", "8302.41.30", "8302.41.60", "8302.42.30", "8302.49.60", "8305.20.00", "8307.10.60"]

CTX = {
    "d": d, "SRC": SRC, "LINE": LINE, "ROW": ROW, "line_extras": line_extras,
    "S232": S232, "AUTO": AUTO, "NON232": NON232, "CN_L3": CN_L3, "CN_L4A": CN_L4A, "CN_NONE": CN_NONE,
    "CA338": CA338, "RU200": RU200, "RU35": RU35, "S232_AL": S232_AL, "S232_ST": S232_ST, "AL_2025_03": AL_2025_03,
    "ASOF": ASOF, "ECFR_AS_OF": ECFR_AS_OF, "CH83_PDF": CH83_PDF, "CH99_PDF": CH99_PDF,
}
apply_text(CTX)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
