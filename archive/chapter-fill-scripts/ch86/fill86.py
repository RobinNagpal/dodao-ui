"""Fill the writer parts of the generated Chapter 86 content file.

usage: python3 fill86.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Section XVII, Chapter 86, Chapter 98, Chapter 99 notes 16, 20, 29, 30, 31, 33, 38, 50, 51, 52),
Proclamations 10947, 11021 and 11032 and Commerce's August 2025 inclusions notice, the IEEPA / Section 122 / Section 301 / maritime Section 301
documents, the Commerce / ITC AD/CVD notices in adcvd86.py, eCFR (up to date as of 2026-10-08: 19 CFR 10.41a, 123.12, 141.4, 146.41; 49 CFR part 215),
and UN Comtrade. The data parts (rate table, matrix, line sets) come from the generator and are only read here.
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources86 import NEW, CH86_PDF, CH98_PDF, CH99_PDF  # noqa: E402
from adcvd86 import ADCVD_RULES, ADCVD_CHANGES, ADCVD_BY_HEADING, ADCVD_BY_LINE, ADCVD_BY_COUNTRY, ADCVD_COUNTRY_SOURCES  # noqa: E402
from text86 import apply_text  # noqa: E402

WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF
d["chapter"]["title"] = "Railway or Tramway Locomotives, Rolling Stock and Parts Thereof; Railway or Tramway Track Fixtures and Fittings and Parts Thereof; Mechanical (Including Electro-Mechanical) Traffic Signaling Equipment of All Kinds"

# ---------------------------------------------------------------- sources: reuse checked ones from other chapters
REF = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if os.path.basename(f).startswith("86-"):
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
        for b in cell[side]["breakdown"]:
            for ln in b["lines"]:
                out[ln] = b
    return out


IN = line_extras("India")
S232 = sorted(l for l, b in IN.items() if b["extra"] == "+25%")
NON232 = sorted(l for l, b in IN.items() if b["extra"] == "+10%")
assert len(LINE) == 37, len(LINE)
assert len(S232) == 23 and len(NON232) == 14, (len(S232), len(NON232))
assert NON232 == [
    "8606.30.00.00", "8606.91.00.00", "8606.92.00.00", "8606.99.01.30", "8606.99.01.60", "8607.12.00.00", "8607.19.30.10", "8607.19.30.20", "8607.19.30.90",
    "8607.21.10.00", "8607.29.10.00", "8607.29.50.00", "8607.99.10.00", "8608.00.00.00",
], NON232

u = d["understandIndustry"]
CARS_PRIOR = 0
TR = json.load(open(f"{WT}/src/tariff-data/trade/chapter-86.json"))
for h in TR["byHeading"]:
    if h["heading"] == "8606":
        CARS_PRIOR = h["byYear"].get(str(u["priorYear"]), 0)

CTX = {
    "d": d, "SRC": SRC, "LINE": LINE, "ROW": ROW, "S232": S232, "NON232": NON232, "ASOF": ASOF, "ECFR_AS_OF": ECFR_AS_OF,
    "ADCVD_RULES": ADCVD_RULES, "ADCVD_CHANGES": ADCVD_CHANGES, "ADCVD_BY_HEADING": ADCVD_BY_HEADING, "ADCVD_BY_LINE": ADCVD_BY_LINE,
    "ADCVD_BY_COUNTRY": ADCVD_BY_COUNTRY, "ADCVD_COUNTRY_SOURCES": ADCVD_COUNTRY_SOURCES,
    "CH86_PDF": CH86_PDF, "CH98_PDF": CH98_PDF, "CH99_PDF": CH99_PDF, "CARS_PRIOR": CARS_PRIOR,
}
apply_text(CTX)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
