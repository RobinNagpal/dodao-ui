"""Fill the writer TODOs of the generated Chapter 80 (Tin and Articles Thereof) content file, in place.

usage: python3 fill80.py <chapter json>        (run.sh calls it after `pnpm tariff:generate-chapter`)

Facts come from: HTSUS 2026 Revision 21 (Chapter 80; General Notes 3(b) and 16; Chapter 99 subchapter III notes 2, 20, 29,
30, 31, 50, 51, 52 and the 9903.01.32 / 9903.01.81 / 9903.03.03 exemption lists), the Section 301 / IEEPA / Section 122 /
Section 338 / Section 232 documents in sources80.py, CBP rulings N357709, N359194, K87486 and N351599, the SEC conflict
minerals rule (17 CFR 240.13p-1), the USGS Final 2025 List of Critical Minerals and Mineral Commodity Summaries 2026 (tin),
eCFR titles 16, 17 and 19 (up to date as of ECFR_AS_OF) and UN Comtrade.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources80 import ALL, CH80, CH99, ECFR, SEC_13P1, SEC_FORM_SD, USC_78M, USC_1278A  # noqa: E402

PATH = sys.argv[1]
CHECKED = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
QSRC = "Google search suggestions (United States), collected October 13, 2026"

d = json.load(open(PATH))
d["asOf"] = CHECKED
d["chapter"]["title"] = "Tin and Articles Thereof"

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(leaf) == 13, len(leaf)

# ------------------------------------------------------------------ sources
tu = d["tariffUpdates"]
src = {s["id"]: s for s in tu["sources"]}
for s in ALL.values():
    src.setdefault(s["id"], s)
src["hts-chapter-99"]["url"] = CH99


def S(i):
    return src[i]


# ------------------------------------------------------------------ line sets (checked against the generated matrix)
EXEMPT = ["8001.10.00.00", "8001.20.00.10", "8001.20.00.50", "8001.20.00.90", "8002.00.00.00", "8007.00.50.00"]  # note 52(b), 50(a)(ii)
S301 = sorted(set(LINE) - set(EXEMPT))
assert len(S301) == 7
ia = d["industryAreas"]
in_row = next(c for c in ia["countries"] if c["country"] == "Indonesia")
eng = set()
for cell in in_row["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"] == "+10%":
            eng.update(b["lines"])
assert eng == set(S301), sorted(eng ^ set(S301))

# ------------------------------------------------------------------ product groups
G = {
    "8001": ("Unwrought tin (ingots, pig, cathodes)", "Unwrought tin",
             "Unwrought tin: refined tin not alloyed (at least 99% tin) and unwrought tin alloys, such as tin-lead and lead-free solder "
             "in ingots, pigs or slabs, split by lead content: 4 lines, all Free. On the 2026 Section 301 and Brazil exemption lists; "
             "Chinese unwrought tin pays 25% (Section 301, 2024 increase).",
             ["tin ingot", "refined tin", "unwrought tin not alloyed", "unwrought tin alloys", "solder ingot", "tin-lead alloy", "pig tin"]),
    "8002": ("Tin waste & scrap", "Scrap",
             "Tin waste and scrap, including dross-free solder scrap and tin-bearing residues of tin metal: 1 line, Free. On the 2026 "
             "Section 301 and Brazil exemption lists and on none of the China lists, so it pays no duty from any market-economy source.",
             ["tin scrap", "solder scrap", "tin waste", "tin dross"]),
    "8003": ("Tin bars, rods, profiles & wire (solder bar & wire)", "Bars, rods & wire",
             "Bars, rods, profiles and wire of tin or tin alloy, including solid solder bar and solder wire without flux: 1 line at 3%, "
             "Free under USMCA and most FTAs. Pays the 2026 Section 301 duty (10% to 12.5%) and Brazil's 25%. Cored or coated solder "
             "for soldering by flame is heading 8311, not Chapter 80.",
             ["solder bar", "solder wire", "tin wire", "tin rod", "lead-free solder wire", "tin anode bar"]),
    "8007": ("Other articles of tin (plates, foil, powder, pewter)", "Other articles",
             "Everything else made of tin: household and tableware (pewter), plates and sheets over 0.2 mm, tin foil, tin and solder "
             "powders, tubes and fittings, and other articles such as tin anodes and balls and solder preforms: 7 lines at 2.1% to 3%. "
             "Other articles (8007.00.50) are exempt from the 2026 Section 301 duty; the rest pay it.",
             ["pewter", "tin foil", "tin powder", "solder powder", "solder balls", "tin anodes", "tin sheet", "tin tube"]),
}
o = d["overview"]
for pg in o["productGroups"]:
    lab, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = lab, blurb, ex
for g in ia["groups"]:
    g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 80: Tin and Articles Thereof — 2026 Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 80 Tin Tariffs: Unwrought Tin, Solder & Tin Scrap HS Codes and 2026 Import Duties | KoalaGains",
    "shortDescription": (
        "Searchable U.S. duty table for all 13 HTS Chapter 80 tin lines: unwrought tin (8001) and tin scrap are Free and exempt from "
        "the 2026 Section 301 tariffs; solder bar, wire, powder and tin articles pay 2.1% to 3% plus 10% to 12.5%. China, Brazil, "
        "Peru, Bolivia and Indonesia rates explained."
    ),
    "keywords": [
        "HTS Chapter 80",
        "tin and articles thereof tariff",
        "tin tariff",
        "us tariff on tin",
        "tin tariff code",
        "unwrought tin tariff rates",
        "hts 8001.10.00 customs duty",
        "hs code tin ingot",
        "tin scrap hs code",
        "solder wire tariff code",
        "tin and articles thereof import duty",
    ],
}
o["intro"] = (
    "Chapter 80 covers tin from the smelter to the finished article: **unwrought tin** (refined tin and tin alloys such as solder "
    "ingots, 8001), **tin waste and scrap** (8002), **bars, rods, profiles and wire** (8003, which includes solid solder bar and "
    "wire) and **other articles of tin** (8007): pewter household ware, plates and sheets, tin foil, tin and solder powders, tubes "
    "and fittings, and other articles such as anodes and solder balls. Tin ores and concentrates are Chapter 26; tinplate and tin "
    "cans are tin-coated steel (Chapters 72 and 73).\n\n"
    "Base rates are low. **Unwrought tin and tin scrap are Free**, and they make up {FREE_SHARE} of U.S. imports by value. The other lines pay "
    "**2.1% to 3%**, Free under USMCA, AGOA and the U.S. FTAs.\n\n"
    "**There is no Section 232 duty on tin.** A Section 232 investigation of processed critical minerals ended in January 2026 "
    "with negotiations rather than tariffs. The extra duties are Section 301:\n"
    "- **2026 Section 301 tariffs** on 60 economies (10% to 12.5%, 9903.05.20–9903.05.84) reach 7 of the 13 lines. Unwrought tin, "
    "tin scrap and other articles of tin (8007.00.50) are on the note 52(b) exemption list. Bolivia, Rwanda and the Democratic "
    "Republic of the Congo are not among the 60.\n"
    "- **Brazil** pays another 25% on the same 7 lines. Its unwrought tin and scrap are exempt from both duties.\n"
    "- **China** pays 25% on unwrought tin (since the 2024 increase), 25% on household ware and other articles (List 3), and "
    "12.5% on the 7 non-exempt lines.\n\n"
    "No antidumping or countervailing duty order covers Chapter 80 goods. The 2026 investigations of *tin mill products* concern "
    "tin-coated steel."
)
o["stats"] = [
    {"label": "Tariff lines", "value": "13"},
    {"label": "Lines with a base-rate duty", "value": "8 of 13", "note": "Unwrought tin (8001) and scrap (8002) are Free"},
    {"label": "2026 Section 301 (60 economies)", "value": "7 of 13", "note": "Unwrought tin, scrap and 8007.00.50 are on the note 52(b) exemption list"},
    {"label": "Section 232", "value": "None", "note": "Tin is not covered; the 2026 processed critical minerals proclamation imposed no duty"},
]
o["workedExamples"] = [
    {
        "title": "$1,000,000 of refined tin ingots from Peru",
        "line": "8001.10.00.00",
        "body": "Unwrought tin, not alloyed, is **Free** for every country. It is on the note 52(b) exemption list (9903.05.86), so "
        "Peru's 12.5% Section 301 duty (9903.05.63) does not apply. Total duty: **$0**, with or without a U.S.–Peru TPA claim.",
    },
    {
        "title": "Unwrought tin from China",
        "line": "8001.10.00.00",
        "body": "Free base rate **+ 25%** Section 301 (9903.91.01), from the 2024 four-year review, which raised unwrought tin "
        "(8001.10, 8001.20) from 0% to 25% on September 27, 2024. The 12.5% 2026 Section 301 duty on China does not apply (note 52(b)). "
        "Total: **$250,000 on $1,000,000**.",
    },
    {
        "title": "Solid solder wire from Mexico",
        "line": "8003.00.00.00",
        "body": "Tin and tin-alloy wire is 3%. **With a USMCA claim it is Free**, and USMCA goods are exempt from Mexico's 10% Section 301 "
        "duty (9903.05.94). Total: $0. Without USMCA: 3% **+ 10%** (9903.05.55) = **13%**. Cored or coated lead-tin solder for "
        "soldering by flame is 8311.30.30 (Free), outside Chapter 80.",
    },
    {
        "title": "Tin-lead solder powder from France",
        "line": "8007.00.32.00",
        "body": "CBP ruled that Sn63Pb37 solder powder is a tin **powder** (8007.00.32, 2.8%), not unwrought tin alloy (8001.20, Free) (NY "
        "N357709, January 29, 2026). As a product of the EU it pays the 2026 Section 301 rate as a floor: **10% in place of** the "
        "2.8% base (9903.05.39), so $10,000 on $100,000.",
    },
    {
        "title": "Tin bars from Brazil, and Brazilian ingots",
        "line": "8003.00.00.00",
        "body": "3% base **+ 25%** Section 301 on Brazil (9903.05.01) **+ 12.5%** 2026 Section 301 (9903.05.27) = **40.5%**. "
        "Brazilian unwrought tin (8001) is on both exemption lists (notes 50(a)(ii) and 52(b)), so it pays **nothing**.",
    },
    {
        "title": "Pewter giftware from China",
        "line": "8007.00.50.00",
        "body": "2.8% base **+ 25%** Section 301 List 3 (9903.88.03) = **27.8%**. 8007.00.50 is on the note 52(b) exemption list, so the "
        "12.5% 2026 duty is not added. Pewter tableware (8007.00.10, 2.1%) pays both: 2.1% + 25% + 12.5% = **39.6%**.",
    },
]
for ex in o["workedExamples"]:
    assert ex["line"] in LINE, ex["line"]
o["notes"] = {
    "chapterNotes": (
        "**Subheading note 1.** (a) *Tin, not alloyed*: metal with at least 99% tin by weight, provided bismuth is under 0.1% and "
        "copper under 0.4%. (b) *Tin alloys*: metallic substances in which tin predominates by weight over each other element, "
        "provided the other elements total more than 1%, or bismuth or copper reaches its limit in that table.\n\n"
        "Unwrought tin alloys (8001.20) are reported by lead content: 5% or less, more than 5% but not more than 25%, and more than "
        "25% of lead (the last two also report the lead content in kilograms). Chapter 80 has no additional U.S. notes."
    ),
    "additionalUsNotes": None,
}

# ------------------------------------------------------------------ tariffUpdates
tu["h1"] = "HTS Chapter 80 Tariff Updates: Tin Tariffs 2025–2026"
tu["seo"] = {
    "title": "Tin Tariff Updates 2026: Section 301 Exemptions, China 25%, Brazil, Section 232 Critical Minerals (HTS Ch. 80) | KoalaGains",
    "shortDescription": (
        "Every change to U.S. tariffs on tin (HTS Chapter 80) since January 2025, with official sources: the 2026 Section 301 "
        "tariffs and their unwrought-tin exemption, the Brazil duty, China's 25% on unwrought tin, the end of the IEEPA and Section "
        "122 tariffs, and the critical minerals Section 232 outcome."
    ),
    "keywords": [
        "2026 hts chapter 80 tariff updates",
        "tin tariffs",
        "tin import duty",
        "brazil tariff on tin and articles thereof",
        "china tariff on tin and articles thereof",
        "section 301 duties on unwrought tin alloys",
        "section 232 tin",
        "unwrought tin import duty",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition** (in force January 1, 2025) and the current "
    "**2026 Revision 21** (in force October 9, 2026). It also lists every extra duty that reaches Chapter 80 today. Base rates did "
    "not change: all 13 lines carry the same general rate in both editions.\n\n"
    "The extra duties changed several times:\n"
    "- **IEEPA tariffs.** In 2025 they reached tin bars, wire and most articles, and Brazil's 40% also reached unwrought tin. They "
    "ended on **February 24, 2026**.\n"
    "- **Section 122 surcharge.** A 10% surcharge followed until **July 23, 2026**, with unwrought tin and scrap exempt.\n"
    "- **2026 Section 301 tariffs.** Since **July 24, 2026** they charge 10% to 12.5% on 7 lines, and the **Brazil** Section 301 "
    "duty adds 25% from July 22. Unwrought tin, tin scrap and other articles of tin (8007.00.50) are exempt from both.\n"
    "- **China** has paid 25% on unwrought tin since **September 27, 2024**.\n\n"
    "**Tin has no Section 232 duty.** Proclamation 11001 (January 14, 2026) ended the processed critical minerals investigation "
    "with negotiations, not tariffs. No antidumping or countervailing duty order covers Chapter 80. The 2026 *tin mill products* "
    "cases concern tin-coated steel."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 80 from any country: China Section 301 (notes 20 and 31), the 2026 Section 301 actions "
    "on 60 economies and Brazil (notes 50, 52), Russia's and Belarus's column 2 rates (general note 3(b)), the scheduled Nicaragua "
    "Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. Canada's Section 338 lists (note 51) and the Section 232 "
    "metals lists (note 16) contain no Chapter 80 line, and Russia's rates in lieu of column 2 (note 30) name none. No antidumping "
    "or countervailing duty order covers Chapter 80 goods. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "13 of 13 lines"},
    {"label": "2026 Section 301", "value": "7 of 13 lines", "note": "Unwrought tin, scrap and 8007.00.50 exempt (note 52(b))"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
]
S301_IDS = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["inEffect"] = [
    {
        "id": "cn-section-301",
        "country": "China",
        "measure": "Section 301: 2024 increase, List 3 and the 2026 action",
        "ch99Code": "9903.91.01 / 9903.88.03 / 9903.05.31",
        "before": "+25% on 8007.00.10 and 8007.00.50 (List 3); +25% on unwrought tin (9903.91.01)",
        "now": "+25% on unwrought tin; +25% on 8007.00.10 and 8007.00.50; +12.5% on the 7 non-exempt lines (stacking to 37.5% on 8007.00.10)",
        "exemption": (
            "Note 31(b) (9903.91.01, 25% since September 27, 2024) covers unwrought tin, 8001.10 and 8001.20. List 3 (note 20(f), "
            "9903.88.03) covers household and tableware (8007.00.10) and other articles (8007.00.50). Tin scrap (8002) is on no China "
            "list and on the note 52(b) exemption list, so it is Free. The 12.5% 2026 duty (9903.05.31) charges the 7 lines outside "
            "note 52(b): 8003 and 8007.00.10–8007.00.40. The IEEPA duties on China ended February 24, 2026. USTR confirmed on October "
            "7, 2026 that the 2018 actions continue during the four-year review."
        ),
        "whatItMeans": "Chinese unwrought tin pays 25%, tin scrap nothing, solder bar and wire 15.5%, tin powder 15.3%, pewter giftware 27.8% and pewter tableware 39.6%.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2024-21217", "fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-2026",
        "country": "60 Section 301 economies (Peru, Indonesia, Malaysia, the EU, Japan, Thailand, the UK, Canada, Mexico and others)",
        "measure": "Section 301 (2026 actions on 60 economies)",
        "ch99Code": "9903.05.20–9903.05.84",
        "before": "None",
        "now": "+10% or +12.5% (10% or 12.5% in place of a lower base rate for the EU, Japan, Korea, Switzerland and Taiwan) on 7 of 13 lines",
        "exemption": (
            "Unwrought tin (8001.10, 8001.20), tin waste and scrap (8002) and other articles of tin (8007.00.50) are on the general "
            "exemption list of note 52(b) (9903.05.86), so 6 of the 13 lines pay nothing extra. The duty charges tin bars, rods and "
            "wire (8003) and 8007.00.10–8007.00.40 (tableware, plates, foil, powders, tubes). USMCA-qualifying goods of Canada and "
            "Mexico are exempt (9903.05.93, 9903.05.94). Bolivia, Rwanda and the Democratic Republic of the Congo are not among the "
            "60 economies."
        ),
        "whatItMeans": "Tin ingots and scrap stay duty-free from Peru, Indonesia, Malaysia and the other 57 economies; solder bar, wire, powder and tin articles cost 10% to 15.5%.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": S301_IDS,
    },
    {
        "id": "br-section-301",
        "country": "Brazil",
        "measure": "Section 301 (Brazil) + Section 301 (2026, 60 economies)",
        "ch99Code": "9903.05.01 / 9903.05.27",
        "before": "None",
        "now": "+37.5% (25% + 12.5%) on 7 of 13 lines",
        "exemption": (
            "Unwrought tin, tin scrap and 8007.00.50 are on the Brazil exemption list of note 50(a)(ii) (9903.05.03) and the note "
            "52(b) list (9903.05.86), so they pay neither duty. The two duties stack on tin bars, rods and wire (8003) and "
            "8007.00.10–8007.00.40."
        ),
        "whatItMeans": "Brazilian tin ingots enter Free; Brazilian solder bar or wire pays 40.5%.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2026-14542", "fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ru-column-2",
        "country": "Russia (and Belarus)",
        "measure": "Column 2 rates; Section 301 (2026) for Russia",
        "ch99Code": "Column 2 / 9903.05.66",
        "before": "Column 2 rates: Free on unwrought tin and scrap, 35% to 45% on bars and articles",
        "now": "Column 2 rates, plus 12.5% Section 301 on Russian goods on 7 lines",
        "exemption": (
            "Russia and Belarus pay column 2 rates under the Suspending Normal Trade Relations with Russia and Belarus Act (general "
            "note 3(b)): Free for unwrought tin and scrap, 45% for tin bars and wire, and 35% to 45% for 8007. No Chapter 80 line is "
            "in the note 30 lists of rates in lieu of column 2. Russia is one of the 60 Section 301 economies (9903.05.66, 12.5%); "
            "Belarus is not."
        ),
        "whatItMeans": "Russian tin ingots are Free; Russian tin bars or wire pay 57.5%.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["pl-117-110", "hts-gn", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
]


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {"id": id_, "type": type_, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now,
            "countries": countries, "sourceIds": ids}


gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 80 base-rate changes"
base["detail"] = "All 13 Chapter 80 lines carry the same general rate in the 2026 Revision 21 as in the 2025 Basic Edition; none changed and none are new or renumbered."
base["date"] = CHECKED
changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the review",
       "USTR announced that the 2018–2019 Section 301 actions on China continue while the statutory four-year review proceeds. They "
       "include List 3 (25%), which covers Chapter 80 household ware (8007.00.10) and other articles (8007.00.50).",
       None, None, "China", ["fr-2026-20510"]),
    ch("tin-mill", "reference", "2026-09-21", "Published", "Tin mill products: AD/CVD cases are on steel, not Chapter 80",
       "Commerce made preliminary affirmative countervailing (September 15) and antidumping (September 21) determinations on tin mill "
       "products from China, and the ITC scheduled the final phase for China, Taiwan and Türkiye. The scope is flat-rolled **steel** "
       "coated with tin or chromium (7210.11, 7210.12, 7210.50, 7212.10, 7212.50, 7225.99, 7226.99). No antidumping or "
       "countervailing duty order covers Chapter 80 tin or tin articles.",
       None, None, "China, Taiwan, Türkiye", ["fr-2026-19274", "fr-2026-18792", "fr-2026-19811", "fr-2026-08745", "fr-2026-08744"]),
    ch("section-338-canada", "reference", "2026-08-22", "Effective", "Canada Section 338 duties: no Chapter 80 line",
       "Proclamations 11046–11048 put a 50% duty (9903.03.12–9903.03.14) on Canadian products in the note 51(b) lists from August 22, "
       "2026, and the lists changed from September 15, 2026 (Proclamation 11065). No Chapter 80 line is on them. Canadian tin pays "
       "only its base rate, plus 10% Section 301 on 7 lines when it is not USMCA-qualifying.",
       None, "None on Chapter 80", "Canada", ["procl-11048", "procl-11065", "csms-69606660", "csms-69851916", "hts-chapter-99"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: 7 tin lines, unwrought tin exempt",
       "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. They charge tin bars, rods and wire "
       "(8003) and 8007.00.10–8007.00.40. Unwrought tin, tin scrap and other articles of tin (8007.00.50) are on the note 52(b) "
       "exemption list (9903.05.86). USMCA goods of Canada and Mexico are exempt.",
       None, "+10% to +12.5% on 7 lines", "60 economies", S301_IDS),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026.",
       "+10% on 7 lines", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: tin bars and articles, not ingots",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. Unwrought tin, tin scrap and 8007.00.50 are on its exemption list "
       "(note 50(a)(ii), 9903.05.03). From July 24 it stacks with the 12.5% 2026 duty on the other 7 lines.",
       None, "+25% on 7 lines", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "Proclamation 11012 imposed a 10% surcharge on products of all countries (9903.03.01). Unwrought tin, tin scrap and 8007.00.50 "
       "were on its exemption list (9903.03.03). Tin bars, wire and the other articles of 8007 paid it until July 23, 2026.",
       None, "+10% on 7 lines", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "On February 20, 2026 the Supreme Court held that IEEPA does not authorize tariffs (Learning Resources, Inc. v. Trump). "
       "Executive Order 14389 then ended the Canada, Mexico, China, Brazil and reciprocal duties. CBP stopped collecting them from "
       "12:00 a.m. ET on February 24, 2026.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("critical-minerals", "pending", "2026-01-14", "Signed", "Section 232 processed critical minerals: negotiations, no tariff",
       "Proclamation 11001 agreed with Commerce that imports of processed critical minerals and their derivatives threaten national "
       "security. Instead of a tariff, it directed Commerce and USTR to negotiate agreements, which may include price floors. "
       "Commerce and USTR were to update the President within 180 days. The President may take other measures depending on the outcome, including "
       "minimum import prices. Tin is on the USGS Final 2025 List of Critical Minerals. As of October 13, 2026, the Federal Register "
       "shows no tariff on tin under this investigation.",
       None, "No duty", "All", ["procl-11001", "fr-2025-19813"]),
    ch("critical-minerals-list", "reference", "2025-11-07", "Published", "Tin added to the U.S. critical minerals list",
       "The U.S. Geological Survey published the Final 2025 List of Critical Minerals (60 minerals), which includes tin. The list "
       "carries no tariff of its own.",
       None, None, "All", ["fr-2025-19813"]),
    ch("br-ieepa", "reference", "2025-08-06", "Effective", "IEEPA 40% duty on Brazil reached unwrought tin",
       "Executive Order 14323 put an extra 40% on products of Brazil (9903.01.77) from 12:01 a.m. EDT on August 6, 2025. Its "
       "exception list, as printed in the current schedule (9903.01.81), includes tin waste and scrap (8002) but not unwrought tin "
       "or other tin products. Executive Order 14361 (November 20, 2025) changed the exceptions for agricultural goods. Ended "
       "February 24, 2026.",
       None, "+40% (ended)", "Brazil", ["eo-14323", "eo-14361", "hts-chapter-99"]),
    ch("critical-minerals-investigation", "reference", "2025-04-15", "Signed", "Section 232 investigation of processed critical minerals opens",
       "Executive Order 14272 directed Commerce to investigate imports of processed critical minerals and their derivative products. "
       "Commerce asked for public comments on April 25, 2025 and reported on October 24, 2025. See the January 14, 2026 entry for "
       "the outcome.",
       None, None, "All", ["eo-14272", "fr-2025-07273", "procl-11001"]),
    ch("reciprocal", "reference", "2025-04-02", "Signed", "Reciprocal tariff: unwrought tin and scrap exempt",
       "Executive Order 14257 set the reciprocal tariffs from April 5, 2025. Its Annex II exemption list (9903.01.32), as printed in "
       "the current schedule, includes unwrought tin (8001.10, 8001.20), tin waste and scrap (8002) and 8007.00.50. Tin bars, wire "
       "and the other 8007 articles paid the reciprocal rate. Ended February 24, 2026.",
       None, "Unwrought tin exempt", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("ca-mx-ieepa", "reference", "2025-02-01", "Signed", "IEEPA duties on Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025. USMCA goods were exempt from March 7, 2025. "
       "Ended February 24, 2026.",
       None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
    ch("cn-2024", "extraDuty", "2024-09-27", "Effective", "China: 25% on unwrought tin (four-year review)",
       "After its four-year review of the China Section 301 actions, USTR raised the duty on 'other critical minerals' to 25% "
       "(9903.91.01, note 31(b)). The list includes unwrought tin not alloyed (8001.10) and tin alloys (8001.20), which had paid "
       "no Section 301 duty before.",
       "None", "+25%", "China", ["fr-2024-21217", "hts-chapter-99"]),
    ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%",
       "The List 3 duty on Chinese tin household and tableware (8007.00.10) and other articles of tin (8007.00.50) rose from 10% "
       "(since September 24, 2018) to 25%.",
       "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
]
nic = gen_changes["section-301-nicaragua-scheduled-2027-01-01"]
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
    "(9903.89.01, U.S. note 29) on every Chapter 80 line. The note 52(b) exemptions do not apply to this duty. The rate is 0% in "
    "2026."
)
changes.append(nic)
for c in changes:
    for sid in c["sourceIds"]:
        assert sid in src, sid
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in changes for sid in c["sourceIds"]}
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch80"])
for sid in used:
    assert sid in src, sid
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["h1"] = "HTS Chapter 80 Tin Tariffs by Country: Peru, Bolivia, Indonesia, Brazil, China & More"
ia["seo"] = {
    "title": "Tin Tariffs by Country: Peru, Bolivia, Indonesia, Brazil, Malaysia, China, Mexico (HTS Ch. 80) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on tin by country and product: unwrought tin is Free from Peru, Bolivia, Indonesia, Brazil and "
        "Malaysia (25% from China); solder bar, wire and tin articles pay 10% to 15.5% from most Section 301 economies, 40.5% from "
        "Brazil and up to 39.6% from China. USMCA explained."
    ),
    "keywords": [
        "peru tin import duty",
        "brazil import duty on tin and articles thereof",
        "china tariff on tin and articles thereof",
        "section 301 duties on tin imports",
        "tin imports by country",
        "indonesia tin tariff",
        "bolivia tin tariff",
        "tin tariff usmca",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current "
    "tariff schedule. For **unwrought tin** (8001), where almost all U.S. imports are, the answer is **Free** from every supplier but "
    "China (25%). Tin ingots and scrap are on the 2026 Section 301 and Brazil exemption lists, and tin has no Section 232 duty.\n\n"
    "**Tin bars, rods and wire** (8003) and most **other articles** (8007) are different. They carry a 2.1% to 3% base rate (Free "
    "under USMCA, AGOA and the FTAs) and the 2026 Section 301 duty of the supplier's economy: 10% (Indonesia, Malaysia, the UK, "
    "non-USMCA Canada and Mexico), 12.5% (Peru, Thailand), or a 10% or 12.5% floor (EU, Japan). Brazil pays 25% more and China up "
    "to 37.5% more. Bolivia, Rwanda and the Democratic Republic of the Congo are outside the Section 301 actions. No antidumping or "
    "countervailing duties apply to Chapter 80."
)
R = {
    "Peru": ("Unwrought tin and scrap: Free, exempt from Peru's 12.5% Section 301 duty (note 52(b)). Tin bars, wire and most tin articles: "
             "Free base under the U.S.–Peru TPA (PE), **+12.5%** Section 301 (9903.05.63); 8007.00.50 is exempt.",
             ["fr-2026-15181", "hts-now"]),
    "Bolivia": ("Base rate only: Bolivia is not one of the 2026 Section 301 economies and has no U.S. trade agreement (GSP has lapsed). "
                "Unwrought tin and scrap are Free; tin bars, wire and articles pay 2.1% to 3%.",
                ["fr-2026-15181", "hts-now"]),
    "Indonesia": ("Unwrought tin and scrap: Free, exempt from the Section 301 duty (note 52(b)). Tin bars, wire and most tin articles: base "
                  "rate **+10%** (9903.05.45); 8007.00.50 pays only 2.8%.",
                  ["fr-2026-15181", "hts-now"]),
    "Poland": ("EU: unwrought tin and scrap are Free and exempt. Tin bars, wire and most tin articles pay the EU's 2026 Section 301 rate as a "
               "floor, **10% in place of** the lower base rate (9903.05.39); 8007.00.50 pays 2.8%.",
               ["fr-2026-15181", "hts-now"]),
    "Brazil": ("Unwrought tin, scrap and 8007.00.50: exempt from both Section 301 duties (notes 50(a)(ii), 52(b)), so Free or 2.8%. Tin bars, "
               "wire and the other tin articles: base rate **+25%** (9903.05.01) **+12.5%** (9903.05.27), 39.6% to 40.5%.",
               ["fr-2026-14542", "fr-2026-15181", "hts-now"]),
    "Mexico": ("USMCA-qualifying: Free, and exempt from the 10% Section 301 duty (9903.05.94). Not qualifying: base rate **+10%** "
               "(9903.05.55) on tin bars, wire and most articles. Unwrought tin and scrap are Free either way. Mexico has no Section 338 "
               "or Section 232 duty on tin.",
               ["fr-2026-15181", "hts-now"]),
    "Malaysia": ("Unwrought tin and scrap: Free and exempt (note 52(b)). Tin bars, wire and most tin articles: base rate **+10%** "
                 "(9903.05.54); 8007.00.50 pays 2.8%.",
                 ["fr-2026-15181", "hts-now"]),
    "Japan": ("Unwrought tin and scrap: Free and exempt. Tin bars, wire and most tin articles pay Japan's 2026 Section 301 floor, **12.5% in "
              "place of** the lower base rate (9903.05.49); other articles such as solder balls (8007.00.50) pay 2.8%.",
              ["fr-2026-15181", "hts-now"]),
    "Canada": ("USMCA-qualifying: Free, and exempt from the 10% Section 301 duty (9903.05.93). Not qualifying: base rate **+10%** "
               "(9903.05.29) on tin bars, wire and most articles. No Chapter 80 line is on Canada's Section 338 lists.",
               ["fr-2026-15181", "procl-11048", "procl-11065", "hts-now"]),
    "Thailand": ("Unwrought tin and scrap: Free and exempt. Tin bars, wire and most tin articles: base rate **+12.5%** (9903.05.77); "
                 "8007.00.50 pays 2.8%.",
                 ["fr-2026-15181", "hts-now"]),
    "Rwanda": ("Free on every line: unwrought tin and scrap are Free, and AGOA (SPI D) removes the base rate on tin bars and articles. Rwanda "
               "is an AGOA beneficiary in general note 16(a), and AGOA was renewed through December 31, 2026. Rwanda is not one of the 2026 "
               "Section 301 economies.",
               ["hts-gn", "ustr-agoa-2026", "fr-2026-15181", "hts-now"]),
    "Congo (Kinshasa)": ("Democratic Republic of the Congo: Free on every line. Unwrought tin and scrap are Free, and AGOA (SPI D) covers "
                         "the rest. The DRC was re-designated by Proclamation 10128 from January 1, 2021, is listed in general note 16(a), "
                         "and AGOA was renewed through December 31, 2026. It is not a 2026 Section 301 economy.",
                         ["hts-gn", "procl-10128", "ustr-agoa-2026", "fr-2026-15181", "hts-now"]),
    "China": ("Unwrought tin: **25%** (9903.91.01). Scrap: Free. Tin bars and wire 15.5%, plates and tubes 14.9%, foil 15.5%, powder 15.3% "
              "(base + 12.5%, 9903.05.31). Household and tableware **39.6%** (2.1% + 25% List 3 + 12.5%). Other articles (8007.00.50) "
              "**27.8%** (List 3, exempt from the 12.5%).",
              ["fr-2024-21217", "fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
    "Germany": ("EU: unwrought tin and scrap are Free and exempt. Tin bars, wire and most tin articles pay **10% in place of** the lower base "
                "rate (9903.05.39); 8007.00.50 pays 2.8%.",
                ["fr-2026-15181", "hts-now"]),
    "United Kingdom": ("Unwrought tin and scrap: Free and exempt. Tin bars, wire and most tin articles: base rate **+10%** (9903.05.81); "
                       "8007.00.50 pays 2.8%.",
                       ["fr-2026-15181", "hts-now"]),
}
OTHER = ("Unwrought tin and scrap are Free from every country but China. Tin bars, wire and articles pay the base rate (2.1% to 3%) plus "
         "the supplier's 2026 Section 301 rate (up to 12.5%) if it is one of the 60 economies. Countries outside them pay only the base "
         "rate; FTA partners such as Australia, Chile, Colombia, Korea, Singapore and the CAFTA-DR countries get Free base rates. "
         "Russia and Belarus pay column 2 rates (Free on ingots and scrap, 35% to 45% otherwise), and Russia also pays 12.5% Section "
         "301. Nicaragua's Section 301 duty starts January 1, 2027.")
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        rule["label"], rule["sourceIds"] = R[c["country"]]
    elif c["country"] == "Any other country":
        rule["label"] = OTHER
        rule["sourceIds"] = ["fr-2026-15181", "pl-117-110", "hts-gn", "fr-2025-23892", "hts-now"]
    else:
        raise SystemExit(f"no rule text for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Tin has no Section 232 duty: no Chapter 80 line is in the note 16 metals lists, and Proclamation 11001 (processed critical "
    "minerals) imposed none.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026. The Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026. Neither is applied.",
    "No antidumping or countervailing duty order covers Chapter 80. The tin mill products investigations concern tin-coated steel "
    "(Chapter 72).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) "
    "lists 8001.10.00, 8001.20.00, 8002.00.00 and 8007.00.50, so 6 of the 13 lines are exempt from the 2026 Section 301 duties. Note "
    "50(a)(ii) (9903.05.03) lists the same four provisions for Brazil. No Chapter 80 line is in the country exception lists of note "
    "52(j), the Canada Section 338 lists (note 51), the Section 232 metals lists (note 16) or the Russia lists of note 30. For "
    "China, List 3 (note 20(f)) covers 8007.00.10 and 8007.00.50, and note 31(b) covers 8001.10.00 and 8001.20.00. No Chapter 80 "
    "line is on Lists 1, 2 or 4A. The ended exemption lists were also checked: the reciprocal tariff list 9903.01.32, the Section "
    "122 list 9903.03.03 (both: 8001.10, 8001.20, 8002, 8007.00.50) and the Brazil IEEPA list 9903.01.81 (8002 only)."
)
ia_ids = {sid for c in ia["countries"] for sid in c["rule"]["sourceIds"]} | {"hts-now", "hts-chapter-99"}
for sid in ia_ids:
    assert sid in src, sid
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Tin: HS Codes for Ingots, Solder & Powder, Section 301 Exemptions & Ways to Lower Duty (HTS Ch. 80) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 80 tin line and the legal ways to pay less: unwrought tin and scrap exempt from the 2026 "
        "Section 301 tariffs, USMCA and FTA claims, sourcing outside China, and CBP rulings on solder powder, solder balls "
        "and tin-plated boxes."
    ),
    "keywords": [
        "tin tariff code",
        "solder tariff code",
        "solder wire tariff code",
        "hs code solder bar",
        "tin powder hs code",
        "hs code tin wire",
        "peru ptpa tin",
        "tin import requirements",
    ],
}
te["intro"] = (
    "For tin, the classification decides almost everything:\n"
    "- **Unwrought tin** (8001) and **tin scrap** (8002) are Free, on the 2026 Section 301 and Brazil exemption lists, and outside "
    "Section 232. Only Chinese unwrought tin pays an extra duty (25%).\n"
    "- **Tin bars, rods and wire** (8003) and most **other articles** (8007) pay 2.1% to 3% plus the supplier's Section 301 rate.\n"
    "- **Solder** depends on its form. Solid wire or bar is 8003, cored or coated solder for soldering by flame is 8311.30, paste is 3810.10 (5%), and "
    "powder is 8007.00.32. Tin-silver solder with 2% or more silver is a precious-metal alloy (Chapter 71).\n\n"
    "The legal ways to pay less are buying tin in unwrought form, claiming USMCA, AGOA or an FTA, avoiding Chinese and Brazilian "
    "origin for semi-finished tin, classifying correctly, and drawback on re-exported goods. Each rule and lever links to its "
    "regulation, ruling or notice.\n\n"
    "Tin is one of the four *conflict minerals* (tin, tantalum, tungsten and gold) under section 13(p) of the Securities Exchange "
    "Act, added by section 1502 of the Dodd-Frank Act. SEC Rule 13p-1 (17 CFR 240.13p-1) requires SEC-reporting companies that use "
    "these minerals to file Form SD. That is a securities disclosure, not a customs rule: CBP requires no conflict-minerals "
    "document at entry."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "unwrought",
        "title": "Buy unwrought tin and fabricate in the United States",
        "saves": "The 2.1% to 3% base rate and the 10% to 37.5% Section 301 duties on bars, wire, powder and articles: unwrought tin and scrap are Free and on the note 52(b) and 50(a)(ii) exemption lists",
        "appliesTo": "Refined tin and tin-alloy ingots (8001) and scrap (8002), instead of solder bar and wire (8003) or tin powder, foil, plates and tubes (8007)",
        "document": "Mill certificates and the chemical analysis that support the 8001 classification (subheading note 1: at least 99% tin for tin not alloyed).",
        "caveat": "Only real changes in what you buy count. Cast solder bars and drawn wire are 8003, not 8001, and solder powder is 8007.00.32 (NY N357709). Chinese unwrought tin still pays 25%.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "HTSUS Chapter 80, subheading note 1", "url": CH80},
            {"label": "CBP ruling NY N357709", "url": S("ny-n357709")["url"]},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican tin products",
        "saves": "The base rate and the 10% Section 301 duty: USMCA goods are exempt from 9903.05.29 and 9903.05.55 (13% to $0 on solder wire)",
        "appliesTo": "Originating tin bars, rods, wire and articles of Canada and Mexico (8003, 8007)",
        "document": "A USMCA certification of origin, kept on file and presented when CBP asks (19 CFR 182.12).",
        "caveat": "The goods must meet the USMCA rule of origin; non-qualifying goods pay the base rate plus 10%. Canada's Section 338 duty does not reach Chapter 80.",
        "citations": [
            {"label": "19 CFR 182.12 (USMCA)", "url": f"{ECFR}/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA, TPA or AGOA rate for the base duty",
        "saves": "The 2.1% to 3% base rate on tin bars, wire and articles",
        "appliesTo": "Originating goods of Peru (PE), Chile, Colombia, Korea, Australia, Singapore, the CAFTA-DR countries and other FTA partners, and AGOA beneficiaries such as Rwanda and the Democratic Republic of the Congo (D)",
        "document": "The agreement's certification or proof of origin (Peru: 19 CFR 10.3004; AGOA: 19 CFR 10.178a), kept on file.",
        "caveat": "An FTA claim does not remove the 2026 Section 301 duty: Peruvian solder wire still pays 12.5%. Unwrought tin is Free anyway, so there is nothing to claim on ingots.",
        "citations": [
            {"label": "19 CFR 10.3004 (Peru)", "url": f"{ECFR}/section-10.3004"},
            {"label": "19 CFR 10.178a (AGOA)", "url": f"{ECFR}/section-10.178a"},
            {"label": "HTSUS General Notes (note 16, AGOA)", "url": S("hts-gn")["url"]},
        ],
    },
    {
        "id": "origin",
        "title": "Source from outside China, Brazil and the Section 301 economies",
        "saves": "25% on Chinese unwrought tin; up to 37.5% on Chinese or Brazilian bars and articles; 10% to 12.5% from the other Section 301 economies",
        "appliesTo": "All lines from China; 8003 and 8007.00.10–.40 from Brazil and the 60 economies. Bolivia, Rwanda and the DRC are not among them.",
        "document": "Mill certificates and production records showing where the tin was smelted or the product made. Origin follows the last substantial transformation; ask CBP for a binding ruling if processing spans countries.",
        "caveat": "Remelting or simple processing in a third country may not change origin. The 2026 Section 301 rate depends on the economy of origin, not the shipping country.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 31, 50 and 52", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "classify",
        "title": "Classify solder and tin products correctly",
        "saves": "The right base rate and Section 301 status: for example, solid solder wire (8003) is 3% plus Section 301, solder ingots (8001.20) are Free and exempt, and solder paste (3810.10) is 5%",
        "appliesTo": "Solder wire, bars, powder, paste and balls; tin anodes; pewter; tin-plated containers",
        "document": "The composition (tin, lead, silver and copper content), form and any flux core or coating. When unsure, ask CBP for a binding ruling.",
        "caveat": "Classification follows the product, not the duty. CBP has ruled that tin-lead solder powder is 8007.00.32 (NY N357709), tin-silver-copper powder with 2% or more silver is 7106.10 (NY N359194), tin solder balls are 8007.00.50 (NY K87486), and a tin-plated steel box is 7310, not tin (NY N351599).",
        "citations": [
            {"label": "CBP ruling NY N357709", "url": S("ny-n357709")["url"]},
            {"label": "CBP ruling NY N359194", "url": S("ny-n359194")["url"]},
            {"label": "CBP ruling NY K87486", "url": S("ny-k87486")["url"]},
            {"label": "CBP ruling NY N351599", "url": S("ny-n351599")["url"]},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback on re-exported tin products",
        "saves": "Up to 99% of the base rate and Section 301 duties on goods that are exported or used in exported products",
        "appliesTo": "Dutiable lines (8003, 8007) and Chinese unwrought tin",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Only worth it where duty was paid; ingots and scrap from most countries are Free. The Chapter 99 notes for the Section 301 duties on tin do not bar drawback.",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR}/section-191.3"},
        ],
    },
]
te["rules"] = [
    {"id": "s301-entry", "agency": "CBP", "title": "Section 301: report the Chapter 99 heading of the country of origin (9903.05.20–9903.05.84; Brazil 9903.05.01; China 9903.88.03 or 9903.91.01) with dutiable lines, or the exemption heading 9903.05.86 / 9903.05.03 for unwrought tin, scrap and 8007.00.50",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 31, 50 and 52", "url": CH99}]},
    {"id": "invoice", "agency": "CBP", "title": "Commercial invoice with a description specific enough to classify the goods: for tin, the form (ingot, bar, wire, powder, foil) and composition, including lead content for 8001.20",
     "citations": [{"label": "19 CFR 141.86", "url": f"{ECFR}/section-141.86"}, {"label": "HTSUS Chapter 80", "url": CH80}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container. Metal ingots, pigs, bars and plates are on the J-list (exempt), but their outermost container must be marked",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR}/section-134.11"}, {"label": "19 CFR 134.33", "url": f"{ECFR}/section-134.33"}]},
    {"id": "russia", "agency": "CBP", "title": "Russian and Belarusian goods: column 2 rates (Free on unwrought tin and scrap, 35% to 45% on bars and articles); Russian goods also pay 12.5% Section 301",
     "citations": [{"label": "Pub. L. 117-110", "url": S("pl-117-110")["url"]}, {"label": "HTSUS General Notes, note 3(b)", "url": S("hts-gn")["url"]}]},
    {"id": "children-lead", "agency": "CPSC", "title": "Children's products of tin, pewter or tin-lead alloy (toys, jewelry, ornaments) must meet the lead content limit and carry a Children's Product Certificate",
     "citations": [{"label": "15 U.S.C. 1278a (lead limits)", "url": USC_1278A}, {"label": "16 CFR part 1110 (certificates)", "url": "https://www.ecfr.gov/current/title-16/part-1110"}]},
]
GROUP_RULES = {
    "8001": ["s301-entry", "invoice", "marking", "russia"],
    "8002": ["s301-entry", "invoice", "marking", "russia"],
    "8003": ["s301-entry", "invoice", "marking", "russia"],
    "8007": ["s301-entry", "invoice", "marking", "russia", "children-lead"],
}
GROUP_NOTES = {
    "8001": "Free from every country but China (25%, 9903.91.01). Exempt from the 2026 Section 301 and Brazil duties (notes 52(b), 50(a)(ii)). Report the lead content for tin alloys.",
    "8002": "Free and exempt from every Section 301 duty, China included. Usable bars or wire sold as scrap are not 8002.",
    "8003": "3% (Free under USMCA, AGOA and the FTAs) plus the 2026 Section 301 rate; Brazil 40.5%, China 15.5%. Solid solder bar and wire belong here; cored or coated solder for soldering by flame is heading 8311.",
    "8007": "2.1% to 3% plus the 2026 Section 301 rate on 8007.00.10–.40; 8007.00.50 is exempt. China adds 25% (List 3) on tableware and other articles. Solder powder is 8007.00.32 (NY N357709).",
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
    if h == "8007" and not (hts.startswith("8007.00.10") or hts.startswith("8007.00.50")):
        rules.remove("children-lead")
    ln["ruleIds"] = rules
    levers = []
    if h in ("8003", "8007"):
        levers += ["unwrought", "usmca", "fta"]
    levers.append("origin")
    levers.append("classify")
    if LINE[hts]["effectiveGeneral"] != "Free" or h == "8001":
        levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations, rulings and notices. It is not legal advice. Section 301 "
    "headings and exemption lists change often, so check the current Chapter 99 notes and CBP's CSMS messages before importing. "
    "CBP rulings bind only the transaction they describe."
)

# ------------------------------------------------------------------ trade
NAME_FIX = {"Bolivia (Plurinational State of)": "Bolivia", "Dem. Rep. of the Congo": "Democratic Republic of the Congo",
            "Rep. of Korea": "South Korea", "Türkiye": "Turkey"}
ui = d["understandIndustry"]
for _l in ui["byLine"]:
    _l["searchText"] = _l["searchText"].replace("…", "")
for coll in (ui["byCountry"], ui["byHeadingCountry"]):
    for _c in coll:
        _c["country"] = NAME_FIX.get(_c["country"], _c["country"])
for _c in o["tradeSnapshot"]["topCountries"]:
    _c["name"] = NAME_FIX.get(_c["name"], _c["name"])
for st in ui["stats"]:
    for k, v in NAME_FIX.items():
        st["label"] = st["label"].replace(k, v)
assert ui["latestYear"], "no trade data: run with --trade-file"
Y, PY = ui["latestYear"], ui["priorYear"]


def B(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M" if v >= 1e6 else f"${v / 1e3:.0f}K"


def pct(a, b):
    return (a - b) / b * 100 if b else 0.0


total = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
prior = sum(c["priorImportsUsd"] for c in ui["byCountry"]) + ui["othersPriorImportsUsd"]
hc = {}
byh = {}
for x in ui["byHeadingCountry"]:
    hc.setdefault(x["country"], {})[x["heading"]] = x["importsUsd"]
    byh[x["heading"]] = byh.get(x["heading"], 0) + x["importsUsd"]
trade_file = json.load(open(os.path.join(IU, "src", "tariff-data", "trade", "chapter-80.json")))
byh = {h["heading"]: h["byYear"][str(Y)] for h in trade_file["byHeading"]}
prior_h = {h["heading"]: h["byYear"][str(PY)] for h in trade_file["byHeading"]}
assert abs(sum(byh.values()) - total) < 2, (sum(byh.values()), total)
top = ui["byCountry"]
C = {c["country"]: c for c in top}
for c in ui["byCountry"]:
    if c.get("mainHeading") in G:
        c["mainHeadingLabel"] = G[c["mainHeading"]][0]
line_8001_10 = next(l for l in ui["byLine"] if l["hs6"] == "8001.10")
yrs = [(y["year"], y["totalUsd"]) for y in ui["byYear"]]
peak = max(yrs, key=lambda t: t[1])
assert top[0]["country"] == "Peru" and top[1]["country"] == "Bolivia", [c["country"] for c in top[:2]]

ui["h1"] = "HTS Chapter 80: Tin and Articles Thereof — U.S. Import Statistics"
ui["seo"] = {
    "title": f"U.S. Tin Imports by Country & Product: Peru, Bolivia, Indonesia ({Y}) (HTS Ch. 80) | KoalaGains",
    "shortDescription": (
        f"Where U.S. tin imports come from, {yrs[0][0]}–{Y}: {B(total)} in {Y} ({pct(total, prior):+.1f}% on {PY}), {line_8001_10['sharePct']:.0f}% "
        f"of it refined tin ingots, led by Peru and Bolivia. Unwrought tin, solder bar and wire, scrap and tin articles by country, "
        "product and year, from UN Comtrade."
    ),
    "keywords": [
        "us tin imports",
        "tin imports by country",
        "where does the us get tin",
        "does the us produce tin",
        f"us tin imports {Y}",
        "peru tin exports to us",
        "HTS Chapter 80 import statistics",
    ],
}
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearCaption"] = f"U.S. imports of Chapter 80 goods each year, split into the two largest {Y} suppliers (Peru and Bolivia) and everyone else."
ui["byYearPartners"] = ["Peru", "Bolivia"]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["sources"] = [s for s in ui["sources"] if "comtrade" in (s.get("url") or "")] + [
    {"label": "U.S. Geological Survey, Mineral Commodity Summaries 2026: Tin (U.S. production, uses, import reliance)", "url": S("usgs-mcs-2026-tin")["url"]},
    {"label": "Federal Register 90 FR 50494 (USGS Final 2025 List of Critical Minerals, which includes tin)", "url": S("fr-2025-19813")["url"]},
    {"label": "17 CFR 240.13p-1 (SEC conflict minerals disclosure rule; not a customs requirement)", "url": SEC_13P1},
    {"label": "Federal Register 77 FR 56274 (SEC final rule: Conflict Minerals, 2012)", "url": S("fr-2012-21153")["url"]},
]
semi = byh["8003"] + byh["8007"]
ui["why"] = (
    f"U.S. imports of Chapter 80 tin were **{B(total)} in {Y}**, {pct(total, prior):+.1f}% from {B(prior)} in {PY}. The {yrs[0][0]}–{Y} "
    f"peak was {B(peak[1])} in {peak[0]}. **Refined tin ingots** (8001.10) were {B(line_8001_10['importsUsd'])}, {line_8001_10['sharePct']:.0f}% "
    f"of the total. Unwrought tin as a whole (8001) was {B(byh['8001'])}. Values are CIF in U.S. dollars, so they move with the tin "
    "price as well as with tonnage.\n\n"
    f"**Peru** ({B(C['Peru']['importsUsd'])}, {C['Peru']['changePct']:+.0f}%) and **Bolivia** ({B(C['Bolivia']['importsUsd'])}, "
    f"{C['Bolivia']['changePct']:+.0f}%) supplied {C['Peru']['sharePct'] + C['Bolivia']['sharePct']:.0f}%, almost all of it unwrought tin. "
    f"Next were Indonesia ({B(C['Indonesia']['importsUsd'])}), Poland ({B(C['Poland']['importsUsd'])}), Brazil ({B(C['Brazil']['importsUsd'])}, "
    f"{C['Brazil']['changePct']:+.0f}%) and Malaysia ({B(C['Malaysia']['importsUsd'])}). Rwanda ({B(hc['Rwanda']['8001'])}) and the "
    f"Democratic Republic of the Congo ({B(hc['Democratic Republic of the Congo']['8001'])}) also shipped unwrought tin. "
    "Unwrought tin is duty-free from all of them.\n\n"
    f"The dutiable products were smaller. Tin bars, rods and wire (8003) were {B(byh['8003'])}, led by Mexico "
    f"({B(hc['Mexico']['8003'])}) and Canada ({B(hc['Canada']['8003'])}). Other articles of tin (8007) were {B(byh['8007'])}, led by "
    f"Japan ({B(hc['Japan']['8007'])}) and China ({B(hc['China']['8007'])}). Scrap (8002) was {B(byh['8002'])}. Together, bars and "
    f"articles were {semi / total * 100:.0f}% of imports, and they are the goods that pay the 2026 Section 301 duties today.\n\n"
    "The United States has not mined tin since 1993 or smelted it since 1989. Net import reliance for refined tin was about 77% in "
    "2025; recycled scrap supplied much of the rest (USGS). USGS put tin on its Final 2025 List of Critical Minerals. Tin "
    "is also a *conflict mineral*: SEC Rule 13p-1 (17 CFR 240.13p-1, from section 1502 of the Dodd-Frank Act) requires "
    "SEC-reporting companies that use it to report its origin on Form SD. That is a securities disclosure, not an import rule.\n\n"
    f"{Y} is the latest full year of U.S. trade data. Tin ores and concentrates (Chapter 26) are not included. Duty-collected figures "
    "aren't available from an official source yet."
)
ts = o["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = f"UN Comtrade, United States imports, HS chapter 80 ({Y})"
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ts["biggestLines"] = [{"hts": "8001.10", "label": "Refined tin, unwrought, not alloyed"}, {"hts": "8007.00", "label": "Other articles of tin"}]
o["intro"] = o["intro"].replace("{FREE_SHARE}", f"{(byh['8001'] + byh['8002']) / total * 100:.0f}%")
o["stats"].append({"label": f"{Y} imports", "value": B(total), "note": f"{line_8001_10['sharePct']:.0f}% refined tin ingots (8001.10)"})

# ------------------------------------------------------------------ finalConclusion
tops = ", ".join(f"{c['country']} {B(c['importsUsd'])} ({c['sharePct']:.0f}%)" for c in top[:5])
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 80 FAQ: Tin Tariffs, HS Codes, Solder and Critical Minerals"
fc["seo"] = {
    "title": "Tin Tariff FAQ 2026: Is There a Tariff on Tin? HS Codes for Tin Ingots, Scrap, Solder; China, Brazil, Section 232 (HTS Ch. 80) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about U.S. tin tariffs: whether unwrought tin pays duty, the HS codes for tin ingots, scrap, "
        "solder wire, bar, paste and powder, China and Brazil rates, Section 232, and whether tin is a critical or conflict mineral."
    ),
    "keywords": [
        "is there a tariff on tin",
        "us tariff on tin",
        "tin tariff code",
        "hs code tin ingot",
        "tin scrap hs code",
        "solder tariff code",
        "is tin a critical mineral",
        "tin conflict mineral",
        "hts chapter 80",
    ],
}
fc["intro"] = (
    "Straight answers to the most-searched questions about U.S. tariffs on tin imports, by product, by country and by HS code. Each "
    "answer links to the page with the detail and the official sources."
)
fc["keyTakeaways"] = [
    "Unwrought tin (8001) and tin scrap (8002) are Free and exempt from the 2026 Section 301 and Brazil duties, so ingots from Peru, "
    "Bolivia, Indonesia, Brazil and Malaysia pay no duty. Chinese unwrought tin pays 25%.",
    "Tin bars, rods and wire (solder bar and wire, 8003) and most other tin articles (8007) pay 2.1% to 3% plus the supplier's 2026 "
    "Section 301 rate: 10% to 12.5% for most of the 60 economies, 37.5% for Brazil, and up to 37.5% for China. USMCA goods are exempt.",
    "Tin has no Section 232 duty. Proclamation 11001 (January 2026) answered the critical minerals investigation with negotiations. "
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge on July 23, 2026.",
    f"In {Y} the U.S. imported {B(total)} of Chapter 80 products, {line_8001_10['sharePct']:.0f}% of it refined tin ingots, led by Peru "
    f"({B(C['Peru']['importsUsd'])}) and Bolivia ({B(C['Bolivia']['importsUsd'])}). No antidumping or countervailing duties apply to "
    "Chapter 80.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = QSRC
fc["faqs"] = [
    {
        "id": "current-rate",
        "question": "Is there a tariff on tin?",
        "searchedAs": ["is there a tariff on tin", "us tariff on tin", "tariff on tin", "tin tariffs", "tin import duty", "tin tariff"],
        "answer": "Not on unwrought tin from most countries. Refined tin and tin-alloy ingots (8001) and tin scrap (8002) have a Free base rate "
                  "and are on the 2026 Section 301 exemption list (note 52(b)), and tin has no Section 232 duty. Chinese unwrought tin pays 25% "
                  "(Section 301). Tin bars, rods and wire (8003, 3%) and most other tin articles (8007, 2.1% to 3%) also pay the 2026 Section "
                  "301 duty of the supplier's economy, usually 10% or 12.5%.",
        "link": "",
    },
    {
        "id": "ingot-code",
        "question": "What is the HS code for tin ingots?",
        "searchedAs": ["hs code tin ingot", "tin ingot hs code", "tin tariff code", "tin hs code", "unwrought tin", "unwrought tin not alloyed",
                       "unwrought tin alloys", "hts 8001.10.00 customs duty"],
        "answer": "Unwrought tin is heading 8001. Refined tin with at least 99% tin is 8001.10.00.00. Tin alloys, including solder ingots, are "
                  "8001.20.00, split by lead content: .10 (5% or less lead), .50 (over 5% to 25%) and .90 (over 25%). All are Free. Tin ores "
                  "and concentrates are 2609.00.00 (Free), in Chapter 26.",
        "link": "",
    },
    {
        "id": "scrap",
        "question": "What is the HS code and tariff for tin scrap?",
        "searchedAs": ["tin scrap hs code", "hsn code of tin scrap", "tin waste and scrap import taxes"],
        "answer": "Tin waste and scrap is 8002.00.00.00. It is Free, on the 2026 Section 301 and Brazil exemption lists, and on no China Section "
                  "301 list, so it pays no extra duty from any market-economy supplier.",
        "link": "",
    },
    {
        "id": "solder",
        "question": "What is the tariff code for solder wire, solder bar and solder paste?",
        "searchedAs": ["solder tariff code", "solder wire tariff code", "hs code solder wire", "hs code solder bar", "solder paste tariff code",
                       "hs code solder paste", "hs code tin wire"],
        "answer": "It depends on the form. Solid tin or tin-alloy solder bar and wire is 8003.00.00 (3%). Coated rods and cored wire for "
                  "soldering by flame are 8311.30 (lead-tin solders 8311.30.30, Free). Solder paste (metal powder with flux) is 3810.10.00 (5%; CBP HQ 087579). Solder "
                  "ingots are unwrought tin alloy, 8001.20 (Free). Solder powder is 8007.00.32 and solder balls 8007.00.50 under CBP rulings. "
                  "Tin bars, wire and powder also pay the 2026 Section 301 duty.",
        "link": "tariff-engineering",
    },
    {
        "id": "powder",
        "question": "What is the HS code for tin powder?",
        "searchedAs": ["tin powder hs code", "solder powder hs code"],
        "answer": "Tin powders and flakes are 8007.00.32.00 (2.8%). CBP ruled in January 2026 that tin-lead solder powder (Sn63Pb37) belongs "
                  "there, not in unwrought tin alloy 8001.20 (NY N357709). A tin-silver-copper powder with 2% or more silver is classified as a "
                  "silver alloy in 7106.10 instead (NY N359194).",
        "link": "tariff-engineering",
    },
    {
        "id": "china",
        "question": "What is the tariff on tin from China?",
        "searchedAs": ["china tariff on tin and articles thereof", "tin from china tariff", "section 301 duties on unwrought tin alloys"],
        "answer": "Chinese unwrought tin (8001.10, 8001.20) pays 25% under Section 301 (9903.91.01), raised from 0% on September 27, 2024. Tin "
                  "scrap is Free. Solder bar and wire pay 15.5% (3% + 12.5% 2026 Section 301), tin powder 15.3%, pewter tableware 39.6% "
                  "(2.1% + 25% List 3 + 12.5%) and other tin articles 27.8%.",
        "link": "industry-areas",
    },
    {
        "id": "brazil",
        "question": "Does tin from Brazil pay the Brazil tariff?",
        "searchedAs": ["brazil tariff on tin and articles thereof", "brazil import duty on tin and articles thereof"],
        "answer": "Not on unwrought tin or scrap. Both are on the exemption lists for the 25% Brazil Section 301 duty (note 50(a)(ii)) and the "
                  "12.5% 2026 duty (note 52(b)), so Brazilian tin ingots enter Free. Brazilian tin bars, wire and most tin articles pay both: "
                  "39.6% to 40.5% with the base rate. The 40% IEEPA duty on Brazil, which reached unwrought tin from August 2025, ended "
                  "February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "peru",
        "question": "What is the import duty on tin from Peru?",
        "searchedAs": ["peru tin import duty", "peru unwrought tin import duty", "tin peru"],
        "answer": "Peruvian unwrought tin is Free, as it is from every country but China, and exempt from Peru's 12.5% Section 301 duty. The "
                  "U.S.–Peru TPA (SPI PE) matters only for tin bars, wire and articles. It removes their 2.1% to 3% base rate, but they still "
                  "pay the 12.5% Section 301 duty (9903.05.63).",
        "link": "industry-areas",
    },
    {
        "id": "section-232",
        "question": "Is tin subject to Section 232 tariffs?",
        "searchedAs": ["section 232 tin", "tin section 232", "tin plate tariffs"],
        "answer": "No. No Chapter 80 line is in the Section 232 steel, aluminum or copper lists. The Section 232 investigation of processed "
                  "critical minerals ended with Proclamation 11001 (January 14, 2026), which ordered negotiations rather than a tariff. "
                  "Tinplate (7210.11, 7210.12, 7212.10) is tin-coated steel, not tin, so it falls under the Section 232 steel duty in "
                  "Chapter 72.",
        "link": "tariff-updates",
    },
    {
        "id": "cans",
        "question": "Are tin cans and tin boxes classified as tin?",
        "searchedAs": ["tariffs on tin cans", "hs code tin box", "hs code tin can", "tin box hs code"],
        "answer": "Usually not. Most tin cans and tins are tin-plated steel, so they are steel containers in heading 7310, not Chapter 80. CBP "
                  "ruled that a tin-plated steel gift box is 7310.29 because it does not meet the definition of tin (NY N351599). Only "
                  "articles made of tin itself, such as pewter, belong in 8007.",
        "link": "tariff-engineering",
    },
    {
        "id": "critical-mineral",
        "question": "Is tin a critical mineral?",
        "searchedAs": ["is tin a critical mineral", "critical minerals tariff tin"],
        "answer": "Yes. The U.S. Geological Survey's Final 2025 List of Critical Minerals (90 FR 50494, November 7, 2025) includes tin. Being "
                  "on the list carries no tariff. The related Section 232 action on processed critical minerals (Proclamation 11001) imposed "
                  "no duty.",
        "link": "tariff-updates",
    },
    {
        "id": "conflict-mineral",
        "question": "Is tin a conflict mineral, and does that affect importing?",
        "searchedAs": ["tin conflict mineral", "tin is considered a conflict mineral", "what are the conflict minerals"],
        "answer": "Tin is one of the four conflict minerals (with tantalum, tungsten and gold) under section 1502 of the Dodd-Frank Act. SEC Rule "
                  "13p-1 (17 CFR 240.13p-1) requires companies that file reports with the SEC and use these minerals in their products to file "
                  "Form SD on their origin. It is a securities disclosure rule, not a customs requirement. CBP asks for no conflict-minerals "
                  "document at entry, and it does not change the duty.",
        "link": "understand-industry",
    },
    {
        "id": "imports",
        "question": "Where does the U.S. import tin from?",
        "searchedAs": ["tin imports by country", "us tin imports", "where does the us get tin", f"us tin imports {Y}"],
        "answer": f"In {Y} the U.S. imported {B(total)} of Chapter 80 tin products. The largest suppliers were {tops}. Refined tin ingots "
                  f"(8001.10) were {B(line_8001_10['importsUsd'])}, {line_8001_10['sharePct']:.0f}% of the total.",
        "link": "understand-industry",
    },
    {
        "id": "us-production",
        "question": "Does the U.S. produce tin?",
        "searchedAs": ["does the us produce tin", "does the us have tin mines", "does the us have tin deposits"],
        "answer": "Not from mines. USGS reports that tin has not been mined in the United States since 1993 or smelted since 1989. Domestic supply "
                  "comes from imports and recycled scrap, and net import reliance for refined tin was about 77% in 2025.",
        "link": "understand-industry",
    },
    {
        "id": "chapter-80",
        "question": "What is HTS Chapter 80?",
        "searchedAs": ["hts chapter 80", "tin and articles thereof tariff", "tin and articles thereof import duty"],
        "answer": "Chapter 80 of the Harmonized Tariff Schedule covers tin and articles of tin: unwrought tin (8001), tin waste and scrap (8002), "
                  "tin bars, rods, profiles and wire (8003) and other articles of tin (8007), such as pewter, plates, foil, powders and tubes. "
                  "It has 13 ten-digit lines with base rates from Free to 3%.",
        "link": "",
    },
]
assert 11 <= len(fc["faqs"]) <= 15

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
