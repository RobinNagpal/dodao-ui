"""Fill the writer parts of the generated Chapter 73 (Articles of Iron or Steel) content file.

usage: python3 fill73.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 73 + Chapter 99 notes 2, 16, 20, 29, 30, 31, 33, 35, 38, 50, 51, 52),
the Section 232 steel proclamations (9705, 9980, 10896, 10947, 10984, 11021, 11032) and Commerce notices, the IEEPA /
Section 122 / Section 301 / Section 338 documents, the Commerce AD/CVD notices in adcvd73.py, eCFR (up to date as of
2026-10-08), 19 U.S.C. 1304, ITA's SIMA product list and UN Comtrade. The data parts (rate table, matrix, line sets) come
from the generator and are only read here.
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources73 import NEW, CH99_PDF, CH73_PDF  # noqa: E402
from adcvd73 import ADCVD_SOURCES, ADCVD_RULES, ADCVD_CHANGES, ADCVD_BY_HEADING, ADCVD_BY_COUNTRY, ADCVD_COUNTRY_SOURCES  # noqa: E402
from text73 import apply_text  # noqa: E402

WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF
d["chapter"]["title"] = "Articles of Iron or Steel"

# ---------------------------------------------------------------- sources: reuse checked ones from other chapters
REF = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if os.path.basename(f).startswith("73-"):
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


IN = line_extras("India")
S232_50 = sorted(l for l, b in IN.items() if b["extra"] == "+50%")
S232_25 = sorted(l for l, b in IN.items() if b["extra"] == "+25%")
AUTO = sorted(l for l, b in IN.items() if "PassengerVehiclePart" in b["extra"])
NON232 = sorted(l for l, b in IN.items() if b["extra"] == "+10%")
ART = sorted(l for l in LINE if l[:4] in ("7304", "7305", "7306") or l[:7] in ("7301.10", "7302.10", "7302.40", "7302.90"))
CA338 = sorted(l for l, b in line_extras("Canada", "withUsmca").items() if "9903.03.14" in b["extra"])
assert len(LINE) == 573, len(LINE)
assert len(S232_50) == 489 and len(S232_25) == 64 and len(AUTO) == 6 and len(NON232) == 14, (len(S232_50), len(S232_25), len(AUTO), len(NON232))
assert len(ART) == 243, len(ART)
assert CA338 == ["7308.90.30.00", "7308.90.60.00", "7308.90.95.30", "7308.90.95.60", "7308.90.95.90"], CA338
assert set(ART) <= set(S232_50)
S232_ALL = set(S232_50) | set(S232_25) | set(AUTO)
DERIV50 = sorted((set(S232_50) | set(AUTO)) - set(ART))
assert len(DERIV50) == 252, len(DERIV50)

CTX = {
    "d": d, "SRC": SRC, "LINE": LINE, "ROW": ROW, "line_extras": line_extras,
    "S232_50": S232_50, "S232_25": S232_25, "AUTO": AUTO, "NON232": NON232, "ART": ART, "CA338": CA338,
    "DERIV50": DERIV50, "ASOF": ASOF, "ECFR_AS_OF": ECFR_AS_OF,
    "ADCVD_RULES": ADCVD_RULES, "ADCVD_CHANGES": ADCVD_CHANGES, "ADCVD_BY_HEADING": ADCVD_BY_HEADING,
    "ADCVD_BY_COUNTRY": ADCVD_BY_COUNTRY, "ADCVD_COUNTRY_SOURCES": ADCVD_COUNTRY_SOURCES, "CH73_PDF": CH73_PDF, "CH99_PDF": CH99_PDF,
}
apply_text(CTX)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
