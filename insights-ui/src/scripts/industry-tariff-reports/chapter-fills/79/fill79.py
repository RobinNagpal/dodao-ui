"""Fill the writer TODOs of the generated Chapter 79 (Zinc and Articles Thereof) content file, in place.

usage: python3 fill79.py <chapter json>        (run.sh calls it after `pnpm tariff:generate-chapter`)

Facts come from: HTSUS 2026 Revision 21 (Chapter 79; Chapter 99 subchapter III notes 2, 16, 19, 20, 29, 30, 31, 33, 38, 50,
51, 52), the IEEPA / Section 122 / Section 338 / Section 301 documents and Proclamation 11001 in sources79.py and the generator's
source list, CBP rulings N300700, N271791 and N347980, eCFR titles 19, 40 and 49 (up to date as of ECFR_AS_OF) and UN Comtrade.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources79 import CH79, CH99, NEW_BY_ID  # noqa: E402

PATH = sys.argv[1]
CHECKED = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
ECFR = "https://www.ecfr.gov/current/title-19"
ECFR40 = "https://www.ecfr.gov/current/title-40"
ECFR49 = "https://www.ecfr.gov/current/title-49"
QSRC = "Google search suggestions (United States), collected October 13, 2026"

d = json.load(open(PATH))
d["asOf"] = CHECKED
d["chapter"]["title"] = "Zinc and Articles Thereof"

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(leaf) == 13, len(leaf)

# ------------------------------------------------------------------ sources
tu = d["tariffUpdates"]
src = {s["id"]: s for s in tu["sources"]}
for s in NEW_BY_ID.values():
    src.setdefault(s["id"], s)
src["hts-chapter-99"]["url"] = CH99


def S(i):
    return src[i]


# ------------------------------------------------------------------ line sets (verified against the Rev 21 Chapter 99 notes)
# Note 52(b) / 9903.05.86 and note 50(a)(ii) / 9903.05.03: exempt from the 2026 Section 301 and Brazil duties.
EXEMPT_52B = ["7901.11.00.00", "7901.12.10.00", "7901.12.50.00", "7901.20.00.00", "7902.00.00.00", "7903.90.30.00", "7907.00.60.00"]
S301_LINES = sorted(set(LINE) - set(EXEMPT_52B))  # 7903.10, 7903.90.60, 7904, 7905, 7907.00.10, 7907.00.20
LIST3 = ["7903.10.00.00", "7903.90.30.00", "7903.90.60.00", "7904.00.00.00", "7905.00.00.00", "7907.00.20.00", "7907.00.60.00"]  # note 20(f)
N31B = ["7901.11.00.00", "7901.12.10.00", "7901.12.50.00", "7901.20.00.00"]  # note 31(b), 9903.91.01
assert len(S301_LINES) == 6 and set(EXEMPT_52B) <= set(LINE) and set(LIST3) <= set(LINE)

ia = d["industryAreas"]
# Cross-check against the engine: India pays +10% on exactly the six non-exempt lines.
in_row = next(c for c in ia["countries"] if c["country"] == "India")
eng301 = set()
for cell in in_row["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"] == "+10%":
            eng301.update(b["lines"])
assert eng301 == set(S301_LINES), sorted(eng301 ^ set(S301_LINES))

# ------------------------------------------------------------------ product groups
G = {
    "7901": ("Unwrought zinc & zinc alloys", "Unwrought zinc",
             "Zinc metal as cast: special high grade (SHG) zinc of 99.99% or more (7901.11), casting-grade zinc (7901.12.10) and other "
             "unalloyed zinc, plus unwrought zinc alloys such as die-casting alloy ingots (7901.20): 4 lines at 1.5% or 3%, Free under "
             "USMCA and every U.S. FTA. On the 2026 Section 301 exemption list; China pays 25% (note 31(b)).",
             ["SHG zinc ingots", "zinc ingot", "zinc slab", "casting-grade zinc", "zinc die-casting alloy", "Zamak ingot", "unwrought zinc"]),
    "7902": ("Zinc waste & scrap", "Scrap",
             "Zinc and zinc-alloy waste and scrap, such as die-cast scrap, old zinc and new clippings: 1 line, Free. It pays no extra "
             "duty from any country today: it is on the 2026 Section 301 exemption list and on no China list. Zinc dross and skimmings "
             "are Chapter 26 (2620.19.30).",
             ["zinc scrap", "zinc die-cast scrap", "zinc clippings", "old zinc scrap", "zinc alloy scrap"]),
    "7903": ("Zinc dust, powders & flakes", "Dust & powders",
             "Zinc dust made by condensing zinc vapor (7903.10, 0.7¢/kg), zinc powders (7903.90.30, 0.5¢/kg) and zinc flakes "
             "(7903.90.60, 3%), used in zinc-rich paints, batteries and chemicals. Zinc powder is on the 2026 Section 301 exemption "
             "list; zinc dust and flakes are not.",
             ["zinc dust", "zinc powder", "zinc flakes", "atomized zinc powder", "zinc-rich primer powder"]),
    "7904": ("Zinc bars, rods, profiles & wire", "Bars, rods & wire",
             "Zinc bars, rods, profiles and wire, including zinc wire for thermal spraying (metallizing) and extruded anode rod: "
             "1 line at 4.2%, the highest base rate in the chapter. Pays the 2026 Section 301 duty.",
             ["zinc wire", "thermal spray zinc wire", "metallizing wire", "zinc rod", "zinc bar"]),
    "7905": ("Zinc plates, sheets, strip & foil", "Sheet & strip",
             "Rolled zinc plate, sheet, strip and foil, including titanium-zinc roofing and cladding sheet and battery-can strip: "
             "1 line at 2.8%. Pays the 2026 Section 301 duty. Galvanized (zinc-coated) steel sheet is Chapter 72, not 79.",
             ["zinc sheet", "zinc roofing sheet", "titanium zinc sheet", "zinc strip", "zinc foil", "zinc plate"]),
    "7907": ("Other articles of zinc", "Other articles",
             "Household, table, kitchen and sanitary articles of zinc (7907.00.10), zinc tubes, pipes and fittings (7907.00.20) and "
             "all other zinc articles (7907.00.60): sacrificial anodes, die-cast zinc hardware, keychains and fittings: 3 lines at 3%. "
             "7907.00.60 is on the 2026 Section 301 exemption list; China pays 25% on it (List 3).",
             ["zinc anodes", "zinc die castings", "zinc alloy keychain", "zinc hardware", "zinc pipe fittings", "zinc articles"]),
}
o = d["overview"]
for pg in o["productGroups"]:
    lab, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = lab, blurb, ex
for g in ia["groups"]:
    g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 79: Zinc and Articles Thereof — 2026 Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 79 Zinc Tariffs: Zinc HS Codes, Import Duty Rates & 2026 Section 301 | KoalaGains",
    "shortDescription": (
        "Searchable U.S. duty table for all 13 HTS Chapter 79 zinc lines: unwrought zinc ingots 1.5% to 3% (Free under USMCA and FTAs, "
        "no Section 232), zinc scrap Free, zinc dust, wire, sheet and articles. 2026 Section 301 on 6 lines, China 25% to 41.7%."
    ),
    "keywords": [
        "HTS Chapter 79",
        "zinc tariff",
        "zinc tariffs us",
        "zinc hs code",
        "zinc hts code",
        "zinc tariff code",
        "unwrought zinc tariff",
        "zinc ingot hs code",
        "zinc and articles thereof tariff",
        "usmca zinc import duty",
        "unwrought zinc import duty",
        "section 301 china zinc tariffs",
    ],
}
o["intro"] = (
    "Chapter 79 covers zinc from the smelter to finished zinc articles: **unwrought zinc** (special high grade and casting-grade zinc, "
    "and zinc alloy ingots, 7901), **zinc scrap** (7902), **zinc dust, powders and flakes** (7903), **bars, rods and wire** (7904), "
    "**plates, sheet, strip and foil** (7905) and **other articles of zinc** such as anodes, die castings and fittings (7907). "
    "Base rates are low: Free to 4.2%, and Free under USMCA and every U.S. free trade agreement.\n\n"
    "Zinc has **no Section 232 duty**. It is on the 2025 U.S. critical minerals list, but Proclamation 11001 (January 14, 2026) chose "
    "negotiations, not tariffs, for processed critical minerals. The extra duty that matters is the **2026 Section 301 tariff on 60 "
    "economies** (10% or 12.5%, from July 24, 2026): unwrought zinc, scrap, zinc powder and the 'other articles' line are on its "
    "exemption list (note 52(b)), so it reaches only 6 of the 13 lines (zinc dust and flakes, bars and wire, sheet, household articles "
    "and tubes). **USMCA-qualifying goods of Canada and Mexico pay none of it**, and Canada's 2026 Section 338 duties list no zinc. "
    "China pays 25% on unwrought zinc and on most zinc products (Section 301), and Brazil 37.5% on the six non-exempt lines.\n\n"
    "No antidumping or countervailing duty order covers Chapter 79 goods."
)
o["stats"] = [s for s in o["stats"] if s["label"] in ("Tariff lines", "Lines with a base-rate duty")] + [
    {"label": "2026 Section 301 (60 economies)", "value": "6 of 13 lines", "note": "10% or 12.5%; unwrought zinc, scrap, powder and 7907.00.60 exempt (note 52(b)); USMCA goods exempt"},
    {"label": "Section 232", "value": "None", "note": "Zinc is not a Section 232 metal; Proclamation 11001 chose negotiations for critical minerals"},
    {"label": "China Section 301", "value": "12 of 13 lines", "note": "25% on unwrought zinc (note 31(b)) and List 3 lines; 12.5% (2026) on 6 lines; scrap exempt"},
]
o["workedExamples"] = [
    {
        "title": "$1,000,000 of SHG zinc ingots from Canada",
        "line": "7901.11.00.00",
        "body": "Special high grade zinc (99.99% or more) is 1.5%, **Free** with a USMCA claim. It is on the 2026 Section 301 exemption "
        "list (note 52(b), 9903.05.86), outside Section 232, and on none of Canada's Section 338 lists, so the duty is **$0**. Without "
        "a USMCA claim it is $15,000 (1.5%), still with no extra duty.",
    },
    {
        "title": "Zinc slab from Peru or Australia",
        "line": "7901.12.50.00",
        "body": "Unalloyed zinc under 99.99% (not casting grade) is 1.5%, **Free** under the U.S.–Peru TPA (PE) or the U.S.–Australia FTA "
        "(AU). The 12.5% 2026 Section 301 duty on Peru (9903.05.63) and Australia (9903.05.23) does not apply to unwrought zinc "
        "(note 52(b)), so an FTA claim makes the duty **$0**.",
    },
    {
        "title": "Zinc sheet from Germany or Spain (EU)",
        "line": "7905.00.00.00",
        "body": "Zinc plate and sheet is 2.8%. The EU's 2026 Section 301 rate (9903.05.39) sets the total at **10%** when the base rate is "
        "lower, so the 2.8% is replaced by 10%: **$10,000 on $100,000** instead of $2,800 before July 24, 2026.",
    },
    {
        "title": "Zinc alloy sacrificial anodes from China",
        "line": "7907.00.60.00",
        "body": "CBP ruling N300700 classified die-cast zinc anodes for boats in 7907.00.60 (3%). China pays **+25%** under Section 301 "
        "List 3 (9903.88.03) = **28%**. The 12.5% 2026 Section 301 duty on China does not apply because 7907.00.60 is on the note "
        "52(b) exemption list. Zinc ribbon anodes with a steel core went to 8543.30 instead (N271791).",
    },
    {
        "title": "Zinc wire for thermal spraying from China",
        "line": "7904.00.00.00",
        "body": "4.2% base **+ 25%** List 3 (9903.88.03) **+ 12.5%** 2026 Section 301 (9903.05.31; note 52(a) keeps the China lists on "
        "top) = **41.7%**: $41,700 on $100,000. The same wire from Mexico with USMCA is Free.",
    },
    {
        "title": "Zinc scrap from Mexico",
        "line": "7902.00.00.00",
        "body": "Zinc waste and scrap is **Free** and on the 2026 Section 301 exemption list, so it pays **no duty** with or without a "
        "USMCA claim. Processed zinc scrap being recycled is also excluded from EPA's hazardous-waste rules (40 CFR 261.4(a)(13)).",
    },
]
for ex in o["workedExamples"]:
    assert ex["line"] in LINE, ex["line"]
o["notes"] = {
    "chapterNotes": (
        "**Subheading note 1 (definitions).** (a) *Zinc, not alloyed*: metal containing by weight at least 97.5% zinc. (b) *Zinc "
        "alloys*: metallic substances in which zinc predominates by weight over each other element, provided the other elements "
        "total more than 2.5% by weight. (c) *Zinc dust*: dust obtained by condensation of zinc vapor, of spherical particles finer "
        "than zinc powders; at least 80% by weight must pass a 63-micrometer sieve, and it must contain at least 85% metallic zinc."
    ),
    "additionalUsNotes": (
        "**1.** For heading 7901, *casting-grade zinc* contains at least 97.5% zinc and one or more of: more than 1.8% lead, more than "
        "1.8% cadmium, more than 1.8% iron, more than 0.5% aluminum, more than 1% copper, more than 0.08% titanium, or more than 0.1% "
        "of any other base metal taken separately. Casting-grade zinc (7901.12.10) is 3%; other zinc under 99.99% (7901.12.50) is 1.5%."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu["h1"] = "HTS Chapter 79 Tariff Updates: Zinc Tariffs 2025–2026"
tu["seo"] = {
    "title": "Zinc Tariff Updates 2026: Section 301 on 60 Economies, USMCA, China, No Section 232 (HTS Ch. 79) | KoalaGains",
    "shortDescription": (
        "Every change to U.S. tariffs on zinc (HTS Chapter 79) since January 2025, with official sources: the 2026 Section 301 duties "
        "and their unwrought-zinc exemption, the USMCA exemption, China's 25% on unwrought zinc, the end of the IEEPA and Section 122 "
        "tariffs, Canada's Section 338 lists and the critical minerals proclamation."
    ),
    "keywords": [
        "zinc tariff update",
        "zinc tariffs 2026",
        "zinc tariffs us",
        "hts chapter 79 tariff updates",
        "section 232 zinc",
        "zinc critical mineral",
        "china section 301 zinc duties",
        "canada tariff on zinc",
        "usmca zinc tariff exemptions",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current "
    "**2026 Revision 21** (in force October 9, 2026), and lists every extra duty that reaches Chapter 79 today. Base rates did not "
    "change: all 13 lines carry the same general rate in both editions.\n\n"
    "The extra duties did change. The IEEPA tariffs of 2025 ended on **February 24, 2026** and the Section 122 surcharge that replaced "
    "them expired on **July 23, 2026**; unwrought zinc, scrap and zinc powder were exempt from both. Since **July 24, 2026** the "
    "**2026 Section 301 duties on 60 economies** (10% or 12.5%) apply to the six zinc lines that are not on the note 52(b) exemption "
    "list, with USMCA goods of Canada and Mexico exempt. China's Section 301 duties stack on top: **25%** on unwrought zinc since "
    "September 27, 2024 and 25% on most zinc products since 2019.\n\n"
    "Zinc is **not** a Section 232 metal: Proclamation 11001 (January 14, 2026) answered the processed critical minerals investigation "
    "with negotiations, not tariffs. Canada's 2026 Section 338 lists contain no Chapter 79 line, and no antidumping or countervailing "
    "duty order covers Chapter 79 goods."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 79 from any country: China Section 301 (note 20 lists and the note 31 2024 increases), the "
    "2026 Section 301 actions on 60 economies and Brazil (notes 52, 50), Russia's column 2 rates, the scheduled Nicaragua Section 301 "
    "duty (note 29), and the ended IEEPA and Section 122 duties. No Section 232 note (16 and 19 metals, 33 and 38 vehicle parts, 36/37 "
    "wood, 39 semiconductors) lists a Chapter 79 line; Canada's Section 338 lists (note 51) contain none; and Commerce has no "
    "antidumping or countervailing duty order on Chapter 79 products. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "13 of 13 lines"},
    {"label": "2026 Section 301", "value": "6 of 13 lines", "note": "7 lines exempt (note 52(b)); USMCA goods exempt"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
]
S301_SRC = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
EXEMPT_TXT = ("Note 52(b) (9903.05.86) exempts 7 of the 13 lines for every country: unwrought zinc and zinc alloys (all 4 lines of 7901), "
              "zinc scrap (7902), zinc powders (7903.90.30) and other articles of zinc (7907.00.60). The duty reaches only zinc dust "
              "(7903.10), flakes (7903.90.60), bars, rods and wire (7904), plates and sheet (7905), household articles (7907.00.10) and "
              "tubes and fittings (7907.00.20).")
EXEMPT_SHORT = "Unwrought zinc, scrap, zinc powder and 7907.00.60 are exempt (note 52(b), 9903.05.86)."
IE = {
    "ca-section-301": (
        f"USMCA-qualifying goods entered free under USMCA pay none of it (9903.05.93, note 52(g)), Free lines included. {EXEMPT_TXT} "
        "Canada's 2026 Section 338 duties (note 51) list no Chapter 79 line, and the IEEPA duty on Canada ended February 24, 2026.",
        "Canadian zinc metal ($1.17B in 2025) pays nothing extra: it is Free with USMCA and on the exemption list anyway. Only "
        "non-USMCA Canadian zinc dust, wire, sheet or household articles pay 10%."),
    "mx-section-301": (
        f"USMCA-qualifying goods entered free under USMCA pay none of it (9903.05.94, note 52(h)). {EXEMPT_TXT} The IEEPA duty on "
        "Mexico ended February 24, 2026.",
        "Mexican zinc ingots and scrap are Free with or without a USMCA claim; zinc sheet, wire or dust that does not qualify for "
        "USMCA pays its base rate + 10%."),
    "pe-section-301": (
        f"{EXEMPT_TXT} Note 52(a): the duty is charged even when the U.S.–Peru TPA rate (PE) is claimed, so on the six covered lines "
        "the total is 12.5%.",
        "Peruvian zinc metal ($297M in 2025) stays Free under the TPA; a Peruvian zinc sheet or wire shipment pays 12.5%."),
    "au-section-301": (
        f"{EXEMPT_TXT} Note 52(a): charged even when the U.S.–Australia FTA rate (AU) is claimed.",
        "Australian zinc ingots ($187M in 2025) stay Free under the FTA; other zinc products pay 12.5%."),
    "cn-section-301": (
        "Three Section 301 duties reach China. (1) Note 31(b), 9903.91.01: +25% on unwrought zinc and zinc alloys (all of 7901) since "
        "September 27, 2024, from the 2024 four-year review's critical minerals increases. (2) List 3, note 20(f), 9903.88.03: +25% on "
        "7903.10, 7903.90, 7904, 7905, 7907.00.20 and 7907.00.60 since May 10, 2019. (3) The 12.5% 2026 duty (9903.05.31) on the six "
        "non-exempt lines, on top of List 3 (note 52(a)). Zinc scrap (7902) is on no China list and on the note 52(b) exemption list, "
        "so it pays nothing extra; household articles (7907.00.10) pay only the 12.5% (List 4B is suspended). The product exclusions "
        "that once covered zinc key rings and awning pivots (7907.00.60) have expired. USTR continued the 2018 actions on October 7, "
        "2026 during its second four-year review.",
        "Chinese unwrought zinc pays 26.5% to 28%; zinc wire, sheet, flakes and tube 40.3% to 41.7%; zinc dust 0.7¢/kg + 37.5%; zinc "
        "anodes and other 7907.00.60 articles 28%; zinc household articles 15.5%; zinc scrap Free."),
    "eu-section-301": (
        f"The EU rate (9903.05.39, note 52(k)) replaces the base rate with a total of 10% when the base rate is lower, which every "
        f"Chapter 79 base rate is. {EXEMPT_TXT}",
        "Spanish, Belgian or German zinc ingots and scrap pay only their base rate; zinc dust from Belgium or zinc sheet from Germany "
        "pays a flat 10% instead of 0.7¢/kg or 2.8%."),
    "tw-section-301": (
        f"Taiwan's rate (9903.05.76) replaces the base rate with a total of 10% when the base rate is lower. {EXEMPT_TXT}",
        "Most Taiwanese zinc imports are articles: household articles and tubes pay 10%; other articles (7907.00.60) stay at 3%."),
    "kr-section-301": (
        f"Korea's rate (9903.05.71) replaces the base rate with a total of 12.5% when the base rate is lower, including when the KORUS "
        f"rate (KR, Free) is claimed. {EXEMPT_TXT}",
        "Korean zinc ingots stay Free under KORUS; Korean zinc sheet, wire or dust pays 12.5%."),
    "in-section-301": (
        f"{EXEMPT_TXT} GSP has lapsed, so India pays the general rate.",
        "Indian zinc articles pay 13% (3% + 10%) on household articles and tubes; other articles (7907.00.60) stay at 3%."),
    "vn-section-301": (
        f"{EXEMPT_TXT}",
        "Vietnamese zinc household articles and tubes pay 15.5%; other zinc articles (7907.00.60) stay at 3%."),
    "gb-section-301": (
        f"{EXEMPT_TXT}",
        "UK zinc articles pay their base rate + 10% on the six covered lines, base rate only on the rest."),
    "br-section-301": (
        "Brazil pays two Section 301 duties on the same six lines: 25% (9903.05.01, from July 22, 2026) and 12.5% (9903.05.27, from "
        "July 24, 2026). Note 50(a)(ii) (9903.05.03) exempts the same 7 lines from the 25% that note 52(b) exempts from the 12.5%: "
        "unwrought zinc, scrap, zinc powder and 7907.00.60.",
        "Brazilian zinc ingots pay their 1.5% or 3% base rate only; Brazilian zinc wire or sheet pays 40.3% to 41.7%."),
    "jp-section-301": (
        f"Japan's rate (9903.05.49) replaces the base rate with a total of 12.5% when the base rate is lower. {EXEMPT_TXT}",
        "Japanese zinc ingots pay their base rate only; zinc sheet, wire or dust pays 12.5%."),
    "other-section-301": (
        f"{EXEMPT_TXT} Countries outside the 60 economies pay only the base rate. Russia, Belarus, Cuba and North Korea pay column 2 "
        "rates (3.9¢/kg to 45%, 11% on scrap); Russia also pays the 12.5% 2026 duty on the six covered lines.",
        "For zinc ingots and scrap the 2026 Section 301 duties change nothing; zinc dust, wire, sheet and household articles pay 10% "
        "or 12.5% more."),
}
for e in tu["inEffect"]:
    ex, wim = IE[e["id"]]
    e["exemption"], e["whatItMeans"] = ex, wim
    if e["id"] == "cn-section-301":
        e["sourceIds"] = list(dict.fromkeys(e["sourceIds"] + ["fr-2024-21217", "fr-2026-20510", "fr-2026-08806"]))
    if e["id"] == "ca-section-301":
        e["sourceIds"] = list(dict.fromkeys(e["sourceIds"] + ["procl-11048", "csms-69606660"]))


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {"id": id_, "type": type_, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now,
            "countries": countries, "sourceIds": ids}


gen = {c["id"]: c for c in tu["changes"]}
base = gen["base-rates"]
base["title"] = "No Chapter 79 base-rate changes"
base["detail"] = "All 13 Chapter 79 lines carry the same general rate in the 2026 Revision 21 as in the 2025 Basic Edition; none changed and none are new or renumbered."
base["date"] = CHECKED
s301 = gen["section-301-2026-60-economies-2026-07-24"]
s301["title"] = "2026 Section 301 tariffs on 60 economies reach 6 zinc lines"
s301["detail"] = (
    "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. Note 52(b) exempts unwrought zinc and "
    "alloys, scrap, zinc powders and 7907.00.60 for every country, so only zinc dust and flakes, bars, rods and wire, sheet, household "
    "articles and tubes pay. USMCA goods of Canada and Mexico are exempt (notes 52(g), 52(h)); the EU, Japan, Korea and Taiwan pay a "
    "total of 10% or 12.5% in place of the base rate; the China lists stack on top (note 52(a))."
)
br = gen["section-301-brazil-2026-07-22"]
br["title"] = "Section 301 tariff on Brazil reaches the same 6 zinc lines"
br["detail"] = (
    "The 25% duty on goods of Brazil (9903.05.01) took effect. Note 50(a)(ii) (9903.05.03) exempts unwrought zinc, scrap, zinc powders "
    "and 7907.00.60, the same lines note 52(b) exempts, so Brazilian zinc sheet, wire, dust and household articles pay 25% plus the "
    "12.5% 2026 duty."
)
nic = gen["section-301-nicaragua-scheduled-2027-01-01"]
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
    "(9903.89.01, U.S. note 29), on every Chapter 79 line. The rate is 0% in 2026."
)
changes = [
    base, s301, br, nic,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the review",
       "USTR announced that the 2018–2019 Section 301 actions on China, including List 3 (25%) on seven Chapter 79 lines, continue "
       "while the statutory four-year review proceeds. The 25% on unwrought zinc (note 31(b)) is unaffected.",
       None, None, "China", ["fr-2026-20510"]),
    ch("section-338-canada", "reference", "2026-08-22", "Effective", "Canada Section 338 duties: no Chapter 79 line",
       "Proclamations 11046–11048 put a 50% duty (9903.03.12–9903.03.14) on Canadian alcoholic beverages, dairy products and motor "
       "vehicles listed in note 51(b), from August 22, 2026. No Chapter 79 line is on any of the lists, so Canadian zinc pays only its "
       "base rate (Free with USMCA).",
       None, "None on Chapter 79", "Canada", ["procl-11046", "procl-11047", "procl-11048", "csms-69606660", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. Unwrought zinc, scrap, zinc "
       "powders and 7907.00.60 were on its product exemption list (9903.03.03), and USMCA goods were exempt (9903.03.07, 9903.03.08).",
       "+10% on 6 lines", None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("cn-review-2", "reference", "2026-05-06", "Published", "USTR opens the second four-year review of the China duties",
       "USTR started the second statutory four-year review of the 2018 Section 301 actions on China, which include List 3 and the "
       "2024 increase on unwrought zinc.",
       None, None, "China", ["fr-2026-08806"]),
    ch("cm-plurilateral", "reference", "2026-02-26", "Published", "USTR seeks comments on a critical minerals trade agreement",
       "Following Proclamation 11001, USTR asked for comments (by March 19, 2026) on a plurilateral agreement on trade in critical "
       "minerals, including minimum prices or other price mechanisms with border measures, and on keeping scrap metal flowing into "
       "domestic production. No tariff on zinc has resulted as of October 13, 2026.",
       None, None, "All", ["fr-2026-03868", "procl-11001"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. In Chapter 79 it reached only the six "
       "lines outside its exemption list (9903.03.03): zinc dust and flakes, bars and wire, sheet, household articles and tubes. "
       "USMCA goods of Canada and Mexico were exempt.",
       None, "+10% on 6 lines", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, "
       "Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them from 12:00 a.m. ET "
       "on February 24, 2026.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("procl-11001", "reference", "2026-01-14", "Signed", "Critical minerals Section 232: negotiations, no tariff",
       "Proclamation 11001 concurred with Commerce that imports of processed critical minerals and their derivative products threaten "
       "national security, but directed Commerce and USTR to negotiate agreements (considering price floors) rather than impose "
       "tariffs, with an update due within 180 days and other measures possible later. No duty on zinc was imposed.",
       None, "No tariff", "All", ["procl-11001"]),
    ch("usgs-list", "reference", "2025-11-07", "Published", "Zinc added to the U.S. critical minerals list",
       "The U.S. Geological Survey's final 2025 List of Critical Minerals includes zinc. The list feeds the Section 232 critical minerals "
       "work but does not itself change any tariff.",
       None, None, "All", ["usgs-2025-list"]),
    ch("cm-232-open", "reference", "2025-04-15", "Signed", "Section 232 investigation of processed critical minerals opens",
       "Executive Order 14272 directed Commerce to investigate imports of processed critical minerals and derivative products; Commerce "
       "asked for public comments on April 25, 2025. It ended with Proclamation 11001 (negotiations, no tariff).",
       None, None, "All", ["eo-14272", "fr-2025-07273", "procl-11001"]),
    ch("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariff: unwrought zinc and scrap exempt",
       "Executive Order 14257 set the reciprocal tariffs from April 5, 2025, with an Annex II exemption list (9903.01.32) that, as "
       "printed in the current schedule, covers unwrought zinc and alloys, zinc scrap, zinc powders and 7907.00.60. The other zinc "
       "lines paid the country's reciprocal rate. Ended February 24, 2026.",
       None, "Unwrought zinc and scrap exempt", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("ca-mx-ieepa", "reference", "2025-03-04", "Effective", "IEEPA duties on Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods were exempted from March 7, 2025. "
       "Ended February 24, 2026.",
       None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
    ch("cn-2024-zinc", "extraDuty", "2024-09-27", "Effective", "China: 25% on unwrought zinc (2024 four-year review)",
       "USTR's four-year review raised duties on Chinese critical minerals. Unwrought zinc and zinc alloys (7901.11, 7901.12.10, "
       "7901.12.50, 7901.20), which were on no earlier list, pay 25% under heading 9903.91.01 (note 31(b)).",
       "None", "+25%", "China", ["fr-2024-21217"]),
    ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%",
       "The List 3 duty on Chinese zinc dust, powders and flakes, bars and wire, sheet, tubes and other zinc articles (7903, 7904, 7905, "
       "7907.00.20, 7907.00.60), 10% from September 24, 2018, rose to 25%.",
       "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
]
for c in changes:
    for sid in c["sourceIds"]:
        assert sid in src, sid
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in changes for sid in c["sourceIds"]}
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch79"])
for sid in used:
    assert sid in src, sid
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["h1"] = "HTS Chapter 79 Zinc Tariffs by Country: Canada, Mexico, Peru, Australia, China & More"
ia["seo"] = {
    "title": "Zinc Tariffs by Country: Canada, Mexico, Peru, Australia, China, Spain, Korea (HTS Ch. 79) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on zinc by country and product: zinc ingots Free from Canada, Mexico, Peru, Australia and Korea with an "
        "FTA claim, 1.5% to 3% from the EU, 26.5% to 28% from China; zinc sheet, wire and dust 10% to 41.7% under the 2026 Section 301 "
        "duties."
    ),
    "keywords": [
        "zinc tariffs by country",
        "canada tariff on zinc",
        "mexico zinc import duty",
        "peru unwrought zinc tariffs",
        "china tariff on zinc",
        "usmca zinc tariff",
        "zinc import duty rates",
        "section 301 zinc tariffs",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current "
    "tariff schedule. For **unwrought zinc and zinc scrap**, which are 85% of U.S. zinc imports, the answer is simple: no extra duty "
    "except from China, so the total is the 1.5% or 3% base rate, or Free under USMCA and the Peru, Australia, Korea and other FTAs.\n\n"
    "For **zinc dust and flakes, wire, sheet, household articles and tubes**, the 2026 Section 301 duties add 10% or 12.5% for 60 "
    "economies (a flat 10% or 12.5% total for the EU, Japan, Korea and Taiwan), even when an FTA rate is claimed, except for "
    "USMCA-qualifying goods of Canada and Mexico. China pays 25% to 37.5% extra and Brazil 37.5%. No antidumping or countervailing "
    "duty applies to Chapter 79 goods."
)
R = {
    "Canada": ("Free on every zinc line with a USMCA claim: the 10% Section 301 duty (9903.05.29) does not apply to USMCA goods "
               "(9903.05.93), and Canada's Section 338 duties list no zinc. Without USMCA: base rate only on unwrought zinc, scrap, "
               "powder and 7907.00.60; base + 10% on zinc dust, flakes, wire, sheet, household articles and tubes.",
               ["fr-2026-15181", "fr-2026-15274", "procl-11048", "hts-chapter-99", "hts-now"]),
    "Mexico": ("Free on every zinc line with a USMCA claim (9903.05.94 removes the 10% Section 301 duty, 9903.05.55). Without USMCA: "
               "base rate only on unwrought zinc, scrap, powder and 7907.00.60; base + 10% on the other six lines.",
               ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Peru": ("Free on unwrought zinc, scrap, powder and 7907.00.60 with the U.S.–Peru TPA claim (PE). The other six lines pay 12.5% "
             "(9903.05.63), which applies even when the TPA rate is claimed (note 52(a)).",
             ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Australia": ("Free on unwrought zinc, scrap, powder and 7907.00.60 with the U.S.–Australia FTA claim (AU); 12.5% (9903.05.23) on "
                  "zinc dust, flakes, wire, sheet, household articles and tubes, FTA claim or not.",
                  ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "China": ("26.5% to 28% on unwrought zinc (base + 25%, note 31(b), 9903.91.01); base + 37.5% on zinc dust, flakes, wire, sheet and tubes "
              "(25% List 3 + 12.5% 2026 duty, 9903.05.31), 40.3% to 41.7% where the base rate is a percentage; 28% on 7907.00.60 and 0.5¢/kg + 25% on zinc powder (List 3 "
              "only, both on the note 52(b) list); 15.5% on household articles (12.5% only); zinc scrap Free.",
              ["fr-2024-21217", "fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"]),
    "Spain": ("EU: base rate only (1.5% or 3%) on unwrought zinc, scrap, powder and 7907.00.60; a flat 10% on the other six lines, "
              "which replaces their lower base rate (9903.05.39).",
              ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Taiwan": ("Base rate only on unwrought zinc, scrap, powder and 7907.00.60; a flat 10% (9903.05.76) on zinc dust, flakes, wire, "
               "sheet, household articles and tubes.",
               ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "South Korea": ("Free on unwrought zinc, scrap, powder and 7907.00.60 with the KORUS claim (KR); a flat 12.5% (9903.05.71) on the "
                    "other six lines, KORUS claim or not.",
                    ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Belgium": ("EU: base rate only on unwrought zinc, scrap, powder and 7907.00.60; a flat 10% (9903.05.39) on the other six lines. "
                "Belgium ships mainly zinc dust (7903.10), which pays 10% instead of 0.7¢/kg.",
                ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "India": ("Base rate only on unwrought zinc, scrap, powder and 7907.00.60 (GSP has lapsed); base + 10% (9903.05.44) on the other "
              "six lines.",
              ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Vietnam": ("Base rate only on unwrought zinc, scrap, powder and 7907.00.60; base + 12.5% (9903.05.84) on the other six lines.",
                ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Germany": ("EU: base rate only on unwrought zinc, scrap, powder and 7907.00.60; a flat 10% (9903.05.39) on zinc dust, flakes, "
                "wire, sheet, household articles and tubes.",
                ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "United Kingdom": ("Base rate only on unwrought zinc, scrap, powder and 7907.00.60; base + 10% (9903.05.81) on the other six lines. "
                       "There is no UK–U.S. FTA rate for zinc.",
                       ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Brazil": ("Base rate only on unwrought zinc, scrap, powder and 7907.00.60 (notes 50(a)(ii), 52(b)); base + 25% (9903.05.01) + "
               "12.5% (9903.05.27) on the other six lines: 40.3% to 41.7% on flakes, wire, sheet, household articles and tubes, 0.7¢/kg + "
               "37.5% on zinc dust.",
               ["fr-2026-14542", "fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    "Japan": ("Base rate only on unwrought zinc, scrap, powder and 7907.00.60; a flat 12.5% (9903.05.49) on the other six lines.",
              ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
}
OTHER = ("Countries outside the 60 Section 301 economies pay only the base rate. The 60 economies pay base + 10% or 12.5% on zinc dust, "
         "flakes, wire, sheet, household articles and tubes. Column 2 countries pay the most: Russia, Belarus, Cuba and North Korea pay "
         "column 2 rates of 3.9¢/kg to 45% (11% on scrap), and Russia also pays the 12.5% 2026 duty on the six covered lines. Nicaragua's own Section 301 duty "
         "starts January 1, 2027.")
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        rule["label"], rule["sourceIds"] = R[c["country"]]
    elif c["country"] == "Any other country":
        rule["label"] = OTHER
        rule["sourceIds"] = ["fr-2026-15181", "fr-2026-15274", "fr-2025-23892", "hts-chapter-99", "hts-now"]
    else:
        raise SystemExit(f"no rule text for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "No Section 232 duty is shown because none reaches Chapter 79. The Section 232 automobile and MHDV parts elections (notes 33, 38) "
    "can reach zinc parts only when the importer certifies them as vehicle parts; that opt-in election is not applied.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "No antidumping or countervailing duty order covers Chapter 79 goods. Zinc-coated (galvanized) steel products are Chapters 72 and "
    "73 and carry their own orders there.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 19, 20, 29, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86) lists 7901.11.00, 7901.12.10, 7901.12.50, 7901.20.00, 7902.00.00, 7903.90.30 and 7907.00.60; note 50(a)(ii) "
    "(9903.05.03, Brazil) lists the same seven. Notes 52(g) and 52(h) exempt USMCA goods of Canada and Mexico. China: List 3 (note "
    "20(f)) covers 7903.10, 7903.90.30, 7903.90.60, 7904, 7905, 7907.00.20 and 7907.00.60; note 31(b) covers all of 7901; 7907.00.10 is "
    "only on List 4B (note 20(u), suspended); 7902 is on no list. The note 20 product exclusions for zinc articles of 7907.00.60 have "
    "expired, and none is in note 20(vvv)(iii). No Chapter 79 line is in the Section 232 metals notes (16, 19), the Canada Section 338 "
    "lists (51(b)), Russia's note 30 lists or the note 52(j) country exception lists. measures.json models all of these."
)
ia_ids = {sid for c in ia["countries"] for sid in c["rule"]["sourceIds"]} | {"hts-now", "hts-chapter-99"}
for sid in ia_ids:
    assert sid in src, sid
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Zinc: HS Codes, USMCA Claims, TSCA, Hazmat & Ways to Lower Duty (HTS Ch. 79) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 79 zinc line: USMCA and FTA claims, the note 52(b) Section 301 exemption for unwrought zinc and "
        "scrap, CBP classification rulings for zinc anodes and keychains, TSCA import certification, zinc dust hazmat rules, EPA scrap "
        "rules and marking, plus the legal ways to pay less."
    ),
    "keywords": [
        "zinc hs code",
        "zinc tariff code",
        "zinc alloy hs code",
        "zinc anode hs code",
        "zinc dust hs code",
        "zinc scrap hs code",
        "unwrought zinc customs classification",
        "usmca zinc origin",
    ],
}
te["intro"] = (
    "For zinc the classification decides whether the 2026 Section 301 duty applies. Unwrought zinc and zinc alloys (7901), scrap "
    "(7902), zinc powders (7903.90.30) and other articles of zinc (7907.00.60) are on the note 52(b) exemption list; zinc dust, flakes, "
    "bars and wire, sheet, household articles and tubes are not. Origin decides the rest: USMCA goods of Canada and Mexico pay no "
    "Section 301 duty at all, while Chinese zinc pays 25% or more.\n\n"
    "The legal ways to pay less: claim USMCA or an FTA, classify the product correctly (with a CBP ruling when unsure), avoid Chinese and "
    "Brazilian origin for covered lines, and use drawback on re-exported goods. Entry rules add TSCA certification for zinc metal and "
    "powders, hazmat rules for zinc dust, and EPA's scrap-metal exclusion for zinc scrap. Each rule and lever links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican zinc",
        "saves": "The base rate (up to 4.2%) and the whole 10% 2026 Section 301 duty",
        "appliesTo": "All 13 lines, for goods of Canada and Mexico that qualify under the USMCA rules of origin",
        "document": "A USMCA certification of origin by the importer, exporter or producer (19 CFR 182.12), kept on file and produced when CBP asks.",
        "caveat": "Only goods entered free under USMCA (SPI S/S+) get the Section 301 exemption (notes 52(g), 52(h)); non-qualifying goods pay base + 10% on the six covered lines.",
        "citations": [
            {"label": "19 CFR 182.12 (USMCA certification)", "url": f"{ECFR}/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA rate for the base duty",
        "saves": "The base rate: 1.5% or 3% on unwrought zinc, 0.5¢ to 0.7¢/kg on dust and powder, up to 4.2% on wire",
        "appliesTo": "Originating goods of Peru (PE), Australia (AU), Korea (KR), Chile (CL), Colombia (CO), CAFTA-DR (P) and the other FTA partners in the Special column",
        "document": "The agreement's certification or proof of origin (Peru: 19 CFR 10.3004), kept on file and presented when CBP asks.",
        "caveat": "Note 52(a): an FTA claim does not remove the 2026 Section 301 duty, so it saves the most on unwrought zinc, scrap and the other exempt lines, where it makes the duty $0.",
        "citations": [
            {"label": "19 CFR 10.3004 (Peru)", "url": f"{ECFR}/section-10.3004"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "classify",
        "title": "Classify the zinc form and product correctly",
        "saves": "The 10% to 12.5% 2026 Section 301 duty when a product is truly unwrought zinc, scrap, powder or a 7907.00.60 article, and the 1.5-point gap between casting-grade (3%) and other zinc (1.5%)",
        "appliesTo": "All lines; most often unwrought vs wrought shapes, zinc dust (subheading note 1(c)) vs powders, casting-grade zinc (additional U.S. note 1), and 7907.00.60 vs other headings for anodes and keychains",
        "document": "Chemical analysis and particle-size data (chapter notes), a description of form and use and, if unsure, a CBP binding ruling.",
        "caveat": "Classification follows the product, not the duty: CBP put die-cast zinc anodes in 7907.00.60 (N300700) and zinc keychains in 7907.00.60 (N347980), but steel-cored zinc ribbon anodes in 8543.30 (N271791). Zinc oxide is 2817.00 and zinc dross and skimmings 2620.19.30, outside Chapter 79.",
        "citations": [
            {"label": "HTSUS Chapter 79, notes", "url": CH79},
            {"label": "CBP ruling N300700", "url": S("cbp-n300700")["url"]},
            {"label": "CBP ruling N271791", "url": S("cbp-n271791")["url"]},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese and Brazilian origin for covered lines",
        "saves": "25% on unwrought zinc and up to 37.5% on zinc wire, sheet, dust and tubes from China; 37.5% on the six covered lines from Brazil",
        "appliesTo": "Goods of China (12 of 13 lines) and Brazil (6 lines)",
        "document": "Mill certificates and production records showing where the zinc was smelted, rolled, drawn or cast. Origin follows the last substantial transformation; ask CBP for a ruling if processing happens in more than one country.",
        "caveat": "Remelting or simple processing in a third country may not change origin. Other countries still pay 10% or 12.5% on the six covered lines.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 31 and 50", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback on zinc that is exported or used in exports",
        "saves": "Up to 99% of the base rate and Section 301 duties paid",
        "appliesTo": "All lines, for zinc re-exported or used to make exported products (for example galvanized steel or die castings)",
        "document": "A drawback claim to CBP with import, manufacturing and export records (19 CFR part 191).",
        "caveat": "Claims must meet the deadlines and records rules of part 191; goods of Canada and Mexico have USMCA drawback limits.",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR}/section-191.3"},
        ],
    },
]
te["rules"] = [
    {"id": "s301-entry", "agency": "CBP", "title": "2026 Section 301: report the country's 9903.05.20–9903.05.84 heading on the six covered lines, or 9903.05.86 (note 52(b)) / 9903.05.93–.94 (USMCA) when exempt; China also reports 9903.88.03 or 9903.91.01",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 31 and 52", "url": CH99}, {"label": "91 FR 47318 (USTR notice)", "url": S("fr-2026-15181")["url"]}]},
    {"id": "tsca", "agency": "CBP / EPA", "title": "TSCA import certification for zinc metal and zinc dust, powders and flakes as chemical substances in bulk; particles are never 'articles', and zinc sheet, wire or finished articles need it only if a TSCA rule requires",
     "citations": [{"label": "19 CFR 12.121", "url": f"{ECFR}/section-12.121"}, {"label": "40 CFR 707.20", "url": f"{ECFR40}/section-707.20"}]},
    {"id": "hazmat", "agency": "DOT (PHMSA)", "title": "Zinc powder or zinc dust is a hazardous material (UN1436, Division 4.3, dangerous when wet, subsidiary 4.2): hazmat packaging, labels and shipping papers for transport from the port",
     "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": f"{ECFR49}/section-172.101"}]},
    {"id": "epa-scrap", "agency": "EPA", "title": "Processed zinc scrap being recycled is excluded from the definition of solid waste, and other scrap metal is exempt from the hazardous-waste rules, so no RCRA import notice applies",
     "citations": [{"label": "40 CFR 261.4(a)(13)", "url": f"{ECFR40}/section-261.4"}, {"label": "40 CFR 261.6(a)(3)(ii)", "url": f"{ECFR40}/section-261.6"}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container; zinc ingots, slabs, bars, plates, sheets, wire and scrap are on the J-list, but their outermost container must be marked",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR}/section-134.11"}, {"label": "19 CFR 134.33", "url": f"{ECFR}/section-134.33"}]},
    {"id": "rulings", "agency": "CBP", "title": "Binding classification rulings: zinc alloy sacrificial anodes 7907.00.60 (N300700), zinc keychains 7907.00.60 (N347980), steel-cored zinc ribbon anodes 8543.30 (N271791)",
     "citations": [{"label": "CBP ruling N300700", "url": S("cbp-n300700")["url"]}, {"label": "CBP ruling N347980", "url": S("cbp-n347980")["url"]},
                   {"label": "CBP ruling N271791", "url": S("cbp-n271791")["url"]}, {"label": "19 CFR part 177", "url": f"{ECFR}/part-177"}]},
]
BASE_RULES = ["s301-entry", "marking"]
GROUP_RULES = {
    "7901": BASE_RULES + ["tsca"],
    "7902": BASE_RULES + ["epa-scrap"],
    "7903": BASE_RULES + ["tsca", "hazmat"],
    "7904": BASE_RULES,
    "7905": BASE_RULES,
    "7907": BASE_RULES + ["rulings"],
}
GROUP_NOTES = {
    "7901": "On the 2026 Section 301 exemption list: base rate only (1.5% or 3%), Free under USMCA and the FTAs. China 26.5% to 28% (note 31(b)). Casting-grade zinc is defined in additional U.S. note 1.",
    "7902": "Free and on the 2026 Section 301 exemption list, on no China list: no extra duty from any country except column 2 rates. Zinc dross and skimmings are 2620.19.30.",
    "7903": "Zinc dust (7903.10) and flakes (7903.90.60) pay the 2026 Section 301 duty; zinc powders (7903.90.30) are exempt. Zinc dust is UN1436 hazmat.",
    "7904": "4.2% base + 10% or 12.5% 2026 Section 301 (flat 10% or 12.5% for the EU, Japan, Korea, Taiwan). Free with USMCA. China 41.7%.",
    "7905": "2.8% base + 10% or 12.5% 2026 Section 301. Free with USMCA. China 40.3%. Galvanized steel sheet is Chapter 72.",
    "7907": "Household articles and tubes pay the 2026 Section 301 duty; other articles (7907.00.60: anodes, die castings, keychains) are exempt. China 15.5% to 40.5%.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = G[h][0]
    g["ruleIds"] = list(GROUP_RULES[h])
    g["note"] = GROUP_NOTES[h]
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    rules = list(GROUP_RULES[h])
    if hts == "7903.90.60.00":
        rules = [r for r in rules if r != "hazmat"]
    if hts == "7907.00.60.00" or h != "7907":
        pass
    else:
        rules = [r for r in rules if r != "rulings"]
    ln["ruleIds"] = rules
    levers = ["usmca"]
    if LINE[hts]["effectiveGeneral"] != "Free":
        levers.append("fta")
    levers += ["classify", "origin", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations and notices, not legal advice. Chapter 99 headings change often; "
    "check the current Chapter 99 notes, CBP's CSMS messages and USTR's latest notices before importing."
)


# ------------------------------------------------------------------ trade figures
NAME_FIX = {"Rep. of Korea": "South Korea", "Other Asia, nes": "Taiwan", "Viet Nam": "Vietnam", "China, Hong Kong SAR": "Hong Kong",
            "United Rep. of Tanzania": "Tanzania", "Bosnia Herzegovina": "Bosnia and Herzegovina", "Dominican Rep.": "Dominican Republic"}
ui = d["understandIndustry"]
for _c in ui["byCountry"]:
    _c["country"] = NAME_FIX.get(_c["country"], _c["country"])
for _x in ui["byHeadingCountry"]:
    _x["country"] = NAME_FIX.get(_x["country"], _x["country"])
for _l in ui["byLine"]:
    _l["searchText"] = _l["searchText"].replace("…", "")
assert ui["latestYear"], "no trade data: run with --trade-file"
Y, PY = ui["latestYear"], ui["priorYear"]


def B(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M"


def pct(a, b):
    return (a - b) / b * 100 if b else 0.0


total = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
prior = sum(c["priorImportsUsd"] for c in ui["byCountry"]) + ui["othersPriorImportsUsd"]
byh = {}
hc = {}
for x in ui["byHeadingCountry"]:
    byh[x["heading"]] = byh.get(x["heading"], 0) + x["importsUsd"]
    hc.setdefault(x["country"], {})[x["heading"]] = x["importsUsd"]
trade_file = json.load(open(os.path.join(IU, "src", "tariff-data", "trade", "chapter-79.json")))
prior_h = {h["heading"]: h["byYear"].get(str(PY), 0) for h in trade_file["byHeading"]}
top = ui["byCountry"]
cty = {c["country"]: c for c in top}
for c in top:
    if c.get("mainHeading") in G:
        c["mainHeadingLabel"] = G[c["mainHeading"]][0]
shg = next(x for x in ui["byLine"] if x["hs6"] == "7901.11")
unw_share = byh["7901"] / total * 100
ca, mx, pe, au, cn = (cty[n] for n in ("Canada", "Mexico", "Peru", "Australia", "China"))
first = ui["byYear"][0]
peak = max(ui["byYear"], key=lambda y: y["totalUsd"])

ui["h1"] = "HTS Chapter 79: Zinc and Articles Thereof — U.S. Import Statistics"
ui["seo"] = {
    "title": f"U.S. Zinc Imports by Country & Product: Canada, Mexico, Peru, Australia, China (HTS Ch. 79) | KoalaGains",
    "shortDescription": (
        f"Where U.S. zinc imports come from, {first['year']}–{Y}: {B(total)} in {Y} ({pct(total, prior):+.1f}% on {PY}), led by Canada "
        f"({B(ca['importsUsd'])}). Zinc ingots, scrap, dust, wire, sheet and articles by country, product and year, from UN Comtrade."
    ),
    "keywords": [
        "us zinc imports",
        "us zinc imports by country",
        "where does the us get zinc",
        "zinc imports",
        f"us zinc imports {Y}",
        "HTS Chapter 79 import statistics",
    ],
}
ui["byYearCaption"] = f"U.S. imports of Chapter 79 goods each year, split into the two largest {Y} suppliers (Canada and Mexico) and everyone else."
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = ("Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. "
                      "Taiwan is reported by UN Comtrade as \"Other Asia, nes\".")
ui["sources"] = [s for s in ui["sources"] if "comtrade" in (s.get("url") or "")] + [
    {"label": "Federal Register 91 FR 47318 (USTR: 2026 Section 301 actions on 60 economies, from July 24, 2026)", "url": S("fr-2026-15181")["url"]},
    {"label": "Federal Register 91 FR 2439 (Proclamation 11001: processed critical minerals, negotiations instead of tariffs)", "url": S("procl-11001")["url"]},
]
ui["why"] = (
    f"U.S. imports of Chapter 79 zinc were **{B(total)} in {Y}**, {pct(total, prior):+.1f}% from {B(prior)} in {PY}, below the "
    f"{peak['year']} peak of {B(peak['totalUsd'])}. **Unwrought zinc (7901) was {B(byh['7901'])}, {unw_share:.0f}% of the total**, and "
    f"special high grade zinc of 99.99% or more (7901.11) alone was {B(shg['importsUsd'])} ({shg['changePct']:+.0f}%). Canada supplied "
    f"{B(ca['importsUsd'])} ({ca['sharePct']:.0f}%), almost all of it zinc metal ({B(hc['Canada']['7901'])}); Mexico {B(mx['importsUsd'])} "
    f"and Peru {B(pe['importsUsd'])} ({pct(pe['importsUsd'], pe['priorImportsUsd']):+.0f}%) also shipped mainly unwrought zinc, and "
    f"Australia rose from {B(au['priorImportsUsd'])} to {B(au['importsUsd'])}. These are the goods on the 2026 Section 301 exemption "
    "list, and from USMCA and FTA partners they enter Free.\n\n"
    f"Other articles of zinc (7907) were {B(byh['7907'])} ({pct(byh['7907'], prior_h['7907']):+.0f}%), led by China "
    f"({B(hc['China']['7907'])}, nearly all of China's {B(cn['importsUsd'])}), Taiwan ({B(hc['Taiwan']['7907'])}) and India "
    f"({B(hc['India']['7907'])}). Zinc dust, powders and flakes were {B(byh['7903'])} (Belgium {B(hc['Belgium']['7903'])}), scrap "
    f"{B(byh['7902'])}, bars, rods and wire {B(byh['7904'])} and sheet {B(byh['7905'])}. The 2026 Section 301 duties fall on parts of "
    "these smaller groups.\n\n"
    f"{Y} is the latest full year of U.S. trade data. Zinc ores and concentrates (Chapter 26) and zinc oxide (Chapter 28) are not "
    "included. Duty-collected figures aren't available from an official source yet."
)
ts = o["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = f"UN Comtrade, United States imports, HS chapter 79 ({Y})"
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["stats"].append({"label": f"{Y} imports", "value": B(total)})

# ------------------------------------------------------------------ finalConclusion
tops = ", ".join(f"{c['country']} {B(c['importsUsd'])}" for c in top[:5])
FAQS = [
    {
        "id": "current-rate",
        "question": "Is there a tariff on zinc imported into the U.S.?",
        "searchedAs": ["is there a tariff on zinc", "zinc tariffs", "zinc tariffs us", "zinc tariff", "zinc duty rate"],
        "answer": "Yes, but it is low for zinc metal. Unwrought zinc pays 1.5% (special high grade and other zinc) or 3% (casting-grade zinc "
                  "and zinc alloys), and is Free under USMCA and every U.S. FTA; zinc scrap is Free. These goods are exempt from the 2026 "
                  "Section 301 duties. Zinc dust and flakes, wire, sheet, household articles and tubes pay 0.5¢/kg to 4.2% plus 10% or "
                  "12.5% for 60 economies. China pays 25% or more.",
        "link": "",
    },
    {
        "id": "hs-code",
        "question": "What is the HS code for zinc?",
        "searchedAs": ["zinc hs code", "zinc hts code", "zinc tariff code", "zinc commodity code", "zinc hs code for export"],
        "answer": "Zinc is HS Chapter 79. Unwrought zinc is 7901 (7901.11 for zinc of 99.99% or more, 7901.12 below that, 7901.20 for "
                  "alloys), scrap 7902, dust, powders and flakes 7903, bars, rods and wire 7904, plates and sheet 7905 and other zinc "
                  "articles 7907 (heading 7906 is not used in the U.S. schedule). Zinc ores are 2608.00 and zinc oxide 2817.00.",
        "link": "",
    },
    {
        "id": "ingot",
        "question": "What is the HS code for zinc ingots (SHG zinc)?",
        "searchedAs": ["zinc ingot hs code", "shg zinc ingots hs code", "shg zinc hs code", "unwrought zinc ingot"],
        "answer": "Special high grade (SHG) zinc ingots of at least 99.99% zinc are 7901.11.00.00, 1.5%, Free under USMCA and the FTAs. "
                  "Zinc under 99.99% is 7901.12: casting-grade zinc (more than 1.8% lead, cadmium or iron, 0.5% aluminum, 1% copper, and so "
                  "on) is 7901.12.10 at 3%, other zinc 7901.12.50 at 1.5%.",
        "link": "",
    },
    {
        "id": "alloy",
        "question": "What is the HS code and tariff for zinc alloy?",
        "searchedAs": ["zinc alloy hs code", "zinc alloy tariff code", "zinc alloy tariff", "zinc alloy ingot hs code", "unwrought zinc alloys"],
        "answer": "Unwrought zinc alloy, such as die-casting alloy ingot, is 7901.20.00.00 at 3% (Free under USMCA and the FTAs) and exempt "
                  "from the 2026 Section 301 duties; Chinese zinc alloy pays 28%. Finished zinc alloy articles are classified by what they "
                  "are: 7907.00.60 for most other zinc articles, unless a more specific heading in another chapter applies.",
        "link": "tariff-engineering",
    },
    {
        "id": "keychain",
        "question": "What is the HS code for a zinc alloy keychain?",
        "searchedAs": ["zinc alloy keychain hs code", "zinc alloy keyring hs code"],
        "answer": "CBP classified spin-cast zinc alloy keychains (a zinc alloy ornament with a steel split ring) in 7907.00.60.00, 3%, in "
                  "ruling N347980 (2025). 7907.00.60 is on the 2026 Section 301 exemption list; Chinese keychains of this kind pay 28% "
                  "(List 3).",
        "link": "tariff-engineering",
    },
    {
        "id": "anode",
        "question": "What is the HS code for zinc anodes?",
        "searchedAs": ["zinc anode hs code", "zinc hull anode hs code", "zinc ribbon anode hs code", "what is zinc anode"],
        "answer": "Die-cast zinc alloy sacrificial anodes for boats are 7907.00.60.00 (3%), per CBP ruling N300700, which rejected "
                  "classification as engine parts. Zinc ribbon anodes with a steel core, for pipelines and tanks, were classified in "
                  "8543.30.00 (2.6%) in ruling N271791.",
        "link": "tariff-engineering",
    },
    {
        "id": "dust",
        "question": "What is the HS code for zinc dust and zinc powder?",
        "searchedAs": ["zinc dust hs code", "zinc powder hs code", "zinc metal powder hs code"],
        "answer": "Zinc dust (condensed from zinc vapor, at least 80% passing a 63-micrometer sieve, at least 85% metallic zinc) is "
                  "7903.10.00 at 0.7¢/kg; zinc powders are 7903.90.30 at 0.5¢/kg; flakes 7903.90.60 at 3%. Zinc powder is exempt from "
                  "the 2026 Section 301 duties, zinc dust is not. Zinc dust ships as hazmat UN1436.",
        "link": "",
    },
    {
        "id": "scrap",
        "question": "What is the HS code and tariff for zinc scrap?",
        "searchedAs": ["zinc scrap hs code", "zinc scrap", "zinc scrap import", "zinc scrap import duty"],
        "answer": "Zinc waste and scrap is 7902.00.00.00, Free. It is on the 2026 Section 301 exemption list and on no China list, so it "
                  "pays no extra duty from any country except column 2 rates (11%). Zinc dross and skimmings are 2620.19.30 (Chapter 26), "
                  "also Free.",
        "link": "",
    },
    {
        "id": "section-232",
        "question": "Is zinc subject to Section 232 tariffs?",
        "searchedAs": ["section 232 zinc", "zinc section 232", "is there a tariff on zinc"],
        "answer": "No. The Section 232 metals duties cover steel, aluminum and copper, and no Chapter 79 line is in their lists. Zinc was "
                  "part of the 2025 Section 232 investigation of processed critical minerals, but Proclamation 11001 (January 14, 2026) "
                  "directed negotiations, not tariffs, and no zinc duty has followed as of October 13, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "critical-mineral",
        "question": "Is zinc a critical mineral in the U.S.?",
        "searchedAs": ["is zinc a critical mineral", "zinc critical mineral", "are lead and zinc critical minerals", "are copper and zinc critical minerals"],
        "answer": "Yes. The U.S. Geological Survey's final 2025 List of Critical Minerals (90 FR 50494, November 7, 2025) includes zinc. "
                  "Being on the list does not by itself add a tariff; China's Section 301 duty on unwrought zinc (25% since September 27, "
                  "2024) came from USTR's critical minerals increases.",
        "link": "tariff-updates",
    },
    {
        "id": "china",
        "question": "What is the tariff on zinc from China?",
        "searchedAs": ["china zinc tariff", "section 301 china zinc", "zinc tariff china"],
        "answer": "Chinese unwrought zinc pays 26.5% to 28% (base + 25%, note 31(b)). Zinc flakes, wire, sheet and tubes pay base + "
                  "25% (List 3) + 12.5% (2026 Section 301): 40.3% to 41.7%; zinc dust 0.7¢/kg + 37.5%. Other zinc articles (7907.00.60) pay 28%, household articles "
                  "15.5%, and zinc scrap is Free.",
        "link": "industry-areas",
    },
    {
        "id": "canada",
        "question": "Is there a tariff on zinc from Canada?",
        "searchedAs": ["zinc canada", "canada tariff on zinc", "usmca zinc tariff"],
        "answer": "Not for USMCA-qualifying zinc: every Chapter 79 line is Free under USMCA, and USMCA goods are exempt from the 10% 2026 "
                  "Section 301 duty. Canada's 2026 Section 338 duties cover alcoholic beverages, dairy products and motor vehicles, not "
                  "zinc. The 25% IEEPA duty ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "imports",
        "question": "Where does the U.S. get its zinc?",
        "searchedAs": ["where does the us get zinc", "us zinc imports", "zinc imports", "does the us have zinc"],
        "answer": f"In {Y} the U.S. imported {B(total)} of Chapter 79 zinc products, {unw_share:.0f}% of it unwrought zinc. The largest "
                  f"suppliers were {tops}. Zinc ores and concentrates (Chapter 26) are not included.",
        "link": "understand-industry",
    },
    {
        "id": "chapter-79",
        "question": "What is HTS Chapter 79?",
        "searchedAs": ["hts chapter 79", "hts code chapters"],
        "answer": "Chapter 79 of the Harmonized Tariff Schedule covers zinc and articles of zinc: unwrought zinc and alloys, scrap, dust "
                  "and powders, bars, rods and wire, plates and sheet, and other zinc articles. It has 13 ten-digit lines with base rates "
                  "from Free to 4.2%.",
        "link": "",
    },
]
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 79 FAQ: Zinc Tariffs, HS Codes and Exemptions"
fc["seo"] = {
    "title": "Zinc Tariff FAQ 2026: Is There a Tariff on Zinc? HS Codes for Ingots, Alloy, Anodes, Dust, Scrap (HTS Ch. 79) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about U.S. zinc tariffs and HS codes: zinc ingots, zinc alloy, anodes, keychains, zinc dust and "
        "scrap, Section 232, critical minerals, China and Canada, and where U.S. zinc imports come from."
    ),
    "keywords": [
        "is there a tariff on zinc",
        "zinc tariffs us",
        "zinc hs code",
        "zinc ingot hs code",
        "zinc alloy hs code",
        "zinc anode hs code",
        "zinc scrap hs code",
        "section 232 zinc",
        "is zinc a critical mineral",
        "hts chapter 79",
    ],
}
fc["intro"] = (
    "Straight answers to the most-searched questions about U.S. tariffs and HS codes for zinc, by product and by country. Each answer "
    "links to the page with the detail and the official sources."
)
fc["keyTakeaways"] = [
    "Unwrought zinc (1.5% or 3%) and zinc scrap (Free) pay no extra duty except from China: they are on the 2026 Section 301 exemption "
    "list, and Free under USMCA and every U.S. FTA.",
    "The 2026 Section 301 duties (10% or 12.5%, from July 24, 2026) reach only six lines: zinc dust and flakes, bars, rods and wire, "
    "sheet, household articles and tubes. USMCA goods of Canada and Mexico are exempt.",
    "Zinc has no Section 232 duty: Proclamation 11001 chose negotiations for critical minerals. Canada's Section 338 duties list no zinc, "
    "and no AD/CVD order covers Chapter 79.",
    f"China pays 25% on unwrought zinc and up to 41.7% on zinc products. In {Y} the U.S. imported {B(total)} of Chapter 79 goods, "
    f"Canada ({B(ca['importsUsd'])}) first.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = QSRC
fc["faqs"] = FAQS

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
