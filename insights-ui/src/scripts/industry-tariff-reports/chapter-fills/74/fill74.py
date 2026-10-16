"""Fill the writer TODOs of the generated Chapter 74 (Copper and Articles Thereof) content file, in place.

usage: python3 fill74.py <chapter json>        (run.sh calls it after `pnpm tariff:generate-chapter`)

Facts come from: HTSUS 2026 Revision 21 (Chapter 74; Chapter 99 subchapter III notes 2, 16, 20, 29, 30, 50, 51, 52),
HTSUS 2026 Basic Edition Chapter 99 note 36 (the 2025 copper regime, 9903.78.01/.02), Proclamations 10962, 11021 and 11032,
CBP CSMS 65794272 and 68253075, the IEEPA / Section 122 / Section 338 documents, the Commerce AD/CVD notices in
sources74.py, eCFR title 19 (up to date as of ECFR_AS_OF) and UN Comtrade.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import CACHE, IU  # noqa: E402,F401

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources74 import CH74, CH99, NEW_BY_ID  # noqa: E402

PATH = sys.argv[1]
CHECKED = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
ECFR = "https://www.ecfr.gov/current/title-19"
QSRC = "Google search suggestions (United States), collected October 13, 2026"

d = json.load(open(PATH))
d["asOf"] = CHECKED
d["chapter"]["title"] = "Copper and Articles Thereof"

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(leaf) == 136, len(leaf)

# ------------------------------------------------------------------ sources
tu = d["tariffUpdates"]
src = {s["id"]: s for s in tu["sources"]}
for s in NEW_BY_ID.values():
    src.setdefault(s["id"], s)
src["hts-chapter-99"]["url"] = CH99


def S(i):
    return src[i]


# ------------------------------------------------------------------ line sets
RAW = sorted(h for h in LINE if h[:4] in ("7401", "7402", "7403", "7404", "7405"))  # outside Section 232
S232 = sorted(set(LINE) - set(RAW))  # note 16(c)(v): every line of 7406-7419
L4A = sorted(h for h in LINE if h.startswith("7418.10"))  # China List 4A (7.5%)
assert len(RAW) == 23 and len(S232) == 113 and len(L4A) == 9, (len(RAW), len(S232), len(L4A))

ia = d["industryAreas"]
# Cross-check against the engine: every Section 232 line is +50% for India (no FTA, no special rules).
in_row = next(c for c in ia["countries"] if c["country"] == "India")
eng232 = set()
for cell in in_row["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"] == "+50%":
            eng232.update(b["lines"])
assert eng232 == set(S232), sorted(set(S232) ^ eng232)[:5]

# ------------------------------------------------------------------ product groups (labels fix the generator's "…" cut-offs)
G = {
    "7401": ("Copper mattes & cement copper", "Copper mattes",
             "Copper mattes and cement copper (precipitated copper), the intermediate products of smelting: 1 line, Free. Outside Section 232 and on the 2026 Section 301 exemption list; not on any China Section 301 list.",
             ["copper matte", "cement copper", "precipitated copper", "copper precipitate"]),
    "7402": ("Unrefined copper & anodes", "Unrefined copper",
             "Unrefined copper, including blister copper and copper anodes for electrolytic refining: 1 line, Free. Outside Section 232; China pays 25% (List 3).",
             ["blister copper", "copper anodes", "unrefined copper", "anode copper"]),
    "7403": ("Refined copper & alloys, unwrought (cathode)", "Cathode & unwrought",
             "Refined copper cathodes, wire bars, billets and unwrought brass, bronze and other copper alloys: 8 lines at 1%, Free under the Chile, Peru, USMCA and other FTAs. Outside Section 232: the 50% copper tariff does not apply to cathode.",
             ["copper cathode", "refined copper", "copper wire bar", "copper billet", "brass ingot", "bronze ingot", "cupro-nickel"]),
    "7404": ("Copper waste & scrap", "Scrap",
             "Copper and copper-alloy waste and scrap, including brass and bronze scrap and spent anodes: 10 lines, all Free. Outside Section 232 and on the 2026 Section 301 exemption list; only China (25%) and Russia pay extra.",
             ["copper scrap", "brass scrap", "bronze scrap", "bare bright copper", "copper turnings", "spent anodes"]),
    "7405": ("Master alloys of copper", "Master alloys",
             "Copper master alloys used as additives, such as phosphor copper and beryllium copper master alloy: 3 lines, Free. Outside Section 232; phosphor copper from Korea is under an antidumping order.",
             ["phosphor copper", "beryllium copper master alloy", "copper master alloy", "CuP"]),
    "7406": ("Copper powders & flakes", "Powders & flakes",
             "Copper powders of non-lamellar and lamellar structure, and flakes: 2 lines, Free; +50% Section 232.",
             ["copper powder", "copper flakes", "bronze powder", "atomized copper"]),
    "7407": ("Copper bars, rods & profiles", "Bars, rods, profiles",
             "Bars, rods and profiles (including hollow profiles) of refined copper, brass, cupro-nickel and other alloys: 15 lines at 1% to 3%; +50% Section 232. Brass rod from seven countries is under AD/CVD orders.",
             ["copper bus bar", "copper rod", "brass rod", "brass bar", "copper profiles", "brazing rod"]),
    "7408": ("Copper wire", "Wire",
             "Copper wire of refined copper (including wire rod over 9.5 mm), brass, cupro-nickel and other alloys, bare or plated: 9 lines at 1% or 3%; +50% Section 232. Insulated wire and cable are heading 8544, not Chapter 74.",
             ["copper wire", "copper wire rod", "magnet wire stock", "brass wire", "tinned copper wire"]),
    "7409": ("Copper plates, sheets & strip", "Sheet & strip",
             "Copper plates, sheets and strip over 0.15 mm thick, of refined copper, brass, bronze, cupro-nickel, nickel silver and beryllium copper: 26 lines at 1% to 3%; +50% Section 232. Brass sheet and strip from France, Germany, Italy and Japan is under AD orders.",
             ["copper sheet", "copper plate", "copper strip", "brass sheet", "phosphor bronze strip", "beryllium copper strip"]),
    "7410": ("Copper foil & copper-clad laminates", "Foil",
             "Copper foil not over 0.15 mm thick, backed or not, including copper-clad laminates for printed circuit boards: 8 lines at 1% to 3%; +50% Section 232.",
             ["copper foil", "copper clad laminate", "CCL", "battery copper foil", "electrodeposited copper foil"]),
    "7411": ("Copper tubes & pipes", "Tubes & pipes",
             "Tubes and pipes of refined copper (seamless plumbing and ACR tube), brass, cupro-nickel and other alloys: 8 lines at 1.4% to 3%; +50% Section 232. Seamless refined copper pipe and tube from China, Mexico and Vietnam is under AD orders.",
             ["copper pipe", "copper tube", "ACR tubing", "copper plumbing pipe", "brass tube", "cupro-nickel tube"]),
    "7412": ("Copper tube & pipe fittings", "Pipe fittings",
             "Copper and brass tube or pipe fittings such as couplings, elbows, sleeves and nipples, threaded or not: 8 lines at 3%; +50% Section 232.",
             ["copper fittings", "brass fittings", "copper elbow", "brass nipple", "compression fittings"]),
    "7413": ("Stranded wire, cables & plaited bands", "Stranded wire",
             "Stranded copper wire, cables and plaited bands, not electrically insulated, with or without fittings: 3 lines at 2% or 3%; +50% Section 232.",
             ["stranded copper wire", "bare copper cable", "copper braid", "grounding cable", "copper strand"]),
    "7415": ("Copper nails, screws, bolts & washers", "Fasteners",
             "Nails, tacks, staples, washers, rivets, screws, bolts and nuts of copper or brass: 8 lines at 1.4% to 3%; +50% Section 232.",
             ["brass screws", "copper rivets", "brass nuts", "copper washers", "copper nails"]),
    "7418": ("Household & sanitary ware of copper", "Household ware",
             "Table, kitchen and household articles of copper (cookware, pot scourers) and sanitary ware: 11 lines at 3%; +50% Section 232. Chinese household articles (7418.10) pay 7.5% under List 4A instead of 25%.",
             ["copper cookware", "copper pots", "brass kitchenware", "copper mugs", "copper sink", "pot scourers"]),
    "7419": ("Other articles of copper", "Other articles",
             "Other articles of copper: cast or forged brass plumbing goods, copper wire cloth and Fourdrinier wires, springs, chain and other articles: 12 lines, Free or 3%; +50% Section 232.",
             ["brass plumbing goods", "copper wire mesh", "copper springs", "copper chain", "copper castings"]),
}
o = d["overview"]
for pg in o["productGroups"]:
    lab, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = lab, blurb, ex
for g in ia["groups"]:
    g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 74: Copper and Articles Thereof — 2026 Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 74 Copper Tariffs: 50% Section 232 Copper Tariff, HS Codes & Import Duties | KoalaGains",
    "shortDescription": (
        "Searchable U.S. duty table for all 136 HTS Chapter 74 copper lines: copper wire, rod, sheet, foil, tube and fittings pay the 50% "
        "Section 232 copper tariff on full value from every country (China 75%); refined copper cathode, scrap and other unwrought copper "
        "are outside it."
    ),
    "keywords": [
        "HTS Chapter 74",
        "copper tariff",
        "50% copper tariff",
        "section 232 copper tariff",
        "copper tariff hts codes",
        "copper cathode tariff",
        "copper scrap tariff code",
        "copper pipe tariff",
        "brass tariffs",
        "copper wire tariffs",
        "US copper imports",
    ],
}
o["intro"] = (
    "Chapter 74 covers copper from the smelter to the finished article: copper mattes, unrefined copper, **refined copper cathode** and "
    "unwrought alloys, **scrap** and master alloys (7401–7405), and the semi-finished and fabricated products made from them: powders, "
    "bars and rods, **wire**, plates, sheet and strip, **foil**, **tubes and pipes**, fittings, stranded wire, fasteners, household ware "
    "and other articles of copper and brass (7406–7419). Base rates are low: Free to 3%.\n\n"
    "What decides the cost is **Section 232**. Every line of 7406–7419 (113 of the 136 lines) pays **an extra 50% of its full customs "
    "value** from every country (heading 9903.82.02): Chile, Canada, Mexico, Peru, Germany, Japan and Korea included, and with no lower "
    "rate for the UK. FTA and USMCA claims do not reduce it. Since April 6, 2026 the duty is charged on the full value; from August 1, "
    "2025 it applied only to the copper content. **Refined copper cathode, unwrought copper and alloys, mattes, scrap and master alloys "
    "(7401–7405) are outside Section 232** and also on the 2026 Section 301 exemption list, so they pay their base rate only (Free or "
    "1%, and Free under the Chile, Peru and USMCA agreements). China pays another **25%** under Section 301 on almost everything.\n\n"
    "Antidumping and countervailing duties also apply to seamless copper pipe and tube, brass sheet and strip, brass rod and phosphor "
    "copper from named countries. They are company-specific and not part of this table or the tariff calculator; see Tariff updates."
)
o["stats"] = [
    {"label": "Tariff lines", "value": "136"},
    {"label": "Lines with a base-rate duty", "value": "114 of 136"},
    {"label": "Section 232 copper (50%)", "value": "113 of 136", "note": "All of 7406–7419, every country; 7401–7405 (cathode, scrap, unwrought) are outside it"},
    {"label": "China Section 301", "value": "135 of 136", "note": "25% (List 3) on 126 lines, 7.5% (List 4A) on 9 household-ware lines; on top of Section 232"},
]
o["workedExamples"] = [
    {
        "title": "$1,000,000 of copper cathode from Chile",
        "line": "7403.11.00.00",
        "body": "Refined copper cathode is **outside Section 232**: Proclamation 10962 and note 16(c)(v) list only 7406–7419. Its 1% base "
        "rate is **Free** under the U.S.–Chile FTA (CL), and 7403.11 is on the 2026 Section 301 exemption list (note 52(b)), so the "
        "duty is **$0**. Without an FTA claim the base rate is $10,000.",
    },
    {
        "title": "Copper wire rod from Canada, with a USMCA certification",
        "line": "7408.11.30.00",
        "body": "Refined copper wire with a cross-section over 9.5 mm (wire rod) is 1%, and USMCA makes it Free, but it is a Section 232 "
        "copper article, so it pays **+50% of its full value** (9903.82.02): **$50,000 on $100,000**. Note 16(b) collects the duty on top "
        "of any FTA rate, there is no Canada exemption, and Canada's Section 338 duty does not reach Chapter 74.",
    },
    {
        "title": "Seamless copper tube from Mexico",
        "line": "7411.10.10.30",
        "body": "1.5% base (Free with USMCA) **+ 50%** Section 232 (9903.82.02): 50% with a USMCA claim, 51.5% without. Seamless refined "
        "copper pipe and tube from Mexico is also under a 2010 antidumping order (continued in 2022), so the exporter's cash-deposit "
        "rate is added on top.",
    },
    {
        "title": "Brass sheet from China",
        "line": "7409.21.00.50",
        "body": "1.9% base **+ 50%** Section 232 (9903.82.02) **+ 25%** Section 301 List 3 (9903.88.03) = **76.9%**: $76,900 on $100,000. "
        "The 12.5% 2026 Section 301 duty on China does not apply to Section 232 goods (note 52(f)(1)).",
    },
    {
        "title": "Copper scrap from Mexico or Canada",
        "line": "7404.00.30.20",
        "body": "Refined copper scrap is **Free**, outside Section 232 and on the 2026 Section 301 exemption list (9903.05.86), so it pays "
        "**no duty**, with or without a USMCA claim. Chinese copper scrap pays 25% (List 3).",
    },
    {
        "title": "Copper-clad laminate from South Korea, before and after April 6, 2026",
        "line": "7410.21.30.40",
        "body": "3% base, Free under KORUS. From August 1, 2025 the 50% copper duty applied only to the **value of the copper content** "
        "(9903.78.01; the non-copper content went under 9903.78.02 at 0%). Since **April 6, 2026** it applies to the **full customs "
        "value** (9903.82.02): a $100,000 laminate whose copper is worth $30,000 paid $15,000 and now pays $50,000.",
    },
]
for ex in o["workedExamples"]:
    assert ex["line"] in LINE, ex["line"]
o["notes"] = {
    "chapterNotes": (
        "**Note 1 (definitions).** (a) *Refined copper*: metal with at least 99.85% copper by weight, or at least 97.5% copper when no "
        "other element exceeds its limit in the note's table (for example silver 0.25%, arsenic 0.5%, lead 1.5%, tin 0.8%, zinc 1%; "
        "other elements 0.3% each). (b) *Copper alloys*: metallic substances other than unrefined copper in which copper predominates "
        "by weight over each other element, provided at least one other element exceeds its table limit or the other elements total "
        "more than 2.5%. (c) *Master alloys*: alloys with more than 10% copper, not usefully malleable, used as additives, deoxidants or "
        "desulfurizing agents in nonferrous metallurgy; copper phosphide (phosphor copper) with more than 15% phosphorus is heading 2853.\n\n"
        "**Subheading note 1.** Defines copper-zinc base alloys (*brasses*; zinc predominates over other elements, nickel under 5%, tin "
        "under 3%), copper-tin base alloys (*bronzes*), copper-nickel-zinc base alloys (*nickel silvers*; 5% or more nickel) and "
        "copper-nickel base alloys (not more than 1% zinc)."
    ),
    "additionalUsNotes": (
        "**1.** The deduction provided for in additional U.S. note 1 to chapter 26 applies to cement copper and copper precipitates "
        "(heading 7401).\n\nStatistical note 1 defines *beryllium copper master alloy* as master alloys with at least 3% but not more "
        "than 10% beryllium."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu["h1"] = "HTS Chapter 74 Tariff Updates: Copper Tariffs 2025–2026"
tu["seo"] = {
    "title": "Copper Tariff Updates 2026: 50% Section 232 Copper Tariff, Full-Value Rule, China, AD/CVD (HTS Ch. 74) | KoalaGains",
    "shortDescription": (
        "Every change to U.S. tariffs on copper (HTS Chapter 74) since January 2025, with official sources: the 50% Section 232 copper "
        "tariff (August 1, 2025), its move to full customs value (April 6, 2026), the cathode and scrap exemptions, China Section 301, "
        "the end of the IEEPA tariffs and the copper pipe and brass AD/CVD orders."
    ),
    "keywords": [
        "copper tariff update",
        "copper tariff 2026",
        "copper tariffs section 232",
        "section 232 copper proclamation",
        "section 232 copper csms",
        "copper tariff decision",
        "copper tariff canada",
        "copper tariff mexico",
        "chile copper tariff",
        "USMCA copper tariff",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current "
    "**2026 Revision 21** (in force October 9, 2026), and lists every extra duty that reaches Chapter 74 today. Base rates did not "
    "change: all 136 lines carry the same general rate in both editions.\n\n"
    "The extra duties changed completely. In January 2025 copper paid no Section 232 duty. **Proclamation 10962** put a **50%** duty on "
    "semi-finished copper and copper-intensive derivatives from **August 1, 2025** (heading 9903.78.01), charged on the **value of the "
    "copper content** only, with refined cathode, ores, concentrates, mattes and scrap left out. **Proclamation 11021** moved copper into "
    "the combined metals program on **April 6, 2026** (heading 9903.82.02) and charges the 50% on the **full customs value**. The IEEPA "
    "tariffs ended on **February 24, 2026**; neither the Section 122 surcharge nor the 2026 Section 301 tariffs on 60 economies charge any "
    "Chapter 74 line. China's Section 301 duty (25%, or 7.5% on household ware) still stacks.\n\n"
    "Antidumping and countervailing duty orders cover copper pipe and tube, brass sheet and strip, brass rod and phosphor copper. They are "
    "company-specific, listed below for reference, and **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 74 from any country: Section 232 copper (note 16; note 36 in the 2026 Basic Edition), China "
    "Section 301 (note 20), the 2026 Section 301 actions on 60 economies and Brazil (notes 50, 52), Russia's rates in lieu of column 2 "
    "(note 30), the scheduled Nicaragua Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. Canada's Section 338 lists "
    "(note 51) contain no Chapter 74 line. The antidumping and countervailing duty orders on Chapter 74 products are listed for reference; "
    "the calculator does not model them. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "136 of 136 lines"},
    {"label": "Section 232 copper", "value": "50%", "note": "113 lines (7406–7419), full customs value"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
]
SRC232 = ["procl-11021", "procl-10962", "fr-2026-08297", "procl-11032", "csms-68253075", "csms-65794272", "hts-2026b-ch99", "hts-chapter-99", "hts-now"]
tu["inEffect"] = [
    {
        "id": "all-section-232",
        "country": "All countries (Chile, Canada, Mexico, Peru, the EU, Japan, Korea and the UK included)",
        "measure": "Section 232 copper, on the full customs value",
        "ch99Code": "9903.82.02",
        "before": "None (January 2025); +50% on the copper content only (9903.78.01) from August 1, 2025",
        "now": "+50%",
        "exemption": (
            "Covers all 113 lines of 7406–7419 (note 16(c)(v)). Refined copper cathode, unwrought copper and alloys, mattes, unrefined "
            "copper, scrap and master alloys (7401–7405) are not covered; neither are copper ores and concentrates (Chapter 26). There "
            "are no country exemptions: the UK's lower rates (9903.82.04, .05) are only for aluminum and steel, and the 10% rate for "
            "U.S.-smelted copper (9903.82.06) applies to derivative articles and insulated copper wire (8544), not to Chapter 74 articles. Note 16(b): the duty is "
            "collected on top of any FTA or USMCA special rate. Russia uses 9903.82.14 (also 50%). Goods under 9903.82.02 do not pay the "
            "2026 Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)), but China's Section 301 duty stacks."
        ),
        "whatItMeans": "Copper wire, rod, sheet, foil, tube and fittings pay half their value again in duty: $200,000 of copper tube from any country owes $100,000, whatever the FTA claim.",
        "effectiveFrom": "2026-04-06",
        "effectiveSourceId": "procl-11021",
        "sourceIds": SRC232,
    },
    {
        "id": "cn-section-301",
        "country": "China",
        "measure": "Section 301: List 3 and List 4A",
        "ch99Code": "9903.88.03 / 9903.88.15",
        "before": "+25% (List 3) or +7.5% (List 4A)",
        "now": "+25% (List 3) on 126 lines, +7.5% (List 4A) on the 9 lines of 7418.10; on top of the 50% Section 232 duty on 7406–7419",
        "exemption": (
            "List 3 (9903.88.03) covers 7402–7417 and 7418.20–7419; List 4A (9903.88.15) covers table, kitchen and household articles "
            "(7418.10). Only copper mattes and cement copper (7401) are on neither list. These stack with Section 232. The 12.5% 2026 "
            "Section 301 duty on China (9903.05.31) charges no Chapter 74 line: 7401–7405 are on the note 52(b) exemption list and "
            "7406–7419 pay Section 232 instead (note 52(f)(1)). The IEEPA duties on China ended February 24, 2026. USTR confirmed on "
            "October 7, 2026 that the 2018 actions continue during the four-year review."
        ),
        "whatItMeans": "Chinese copper tube, sheet or wire pays about 75% to 78% of its value; Chinese copper scrap or cathode 25% to 26%; Chinese copper cookware 60.5%.",
        "effectiveFrom": "2020-02-14",
        "effectiveSourceId": "fr-2020-00904",
        "sourceIds": ["fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-2026",
        "country": "60 Section 301 economies (Canada, Mexico, Chile, Peru, the EU, Japan, Korea, India, Vietnam, the UK and others) and Brazil",
        "measure": "Section 301 (2026 actions on 60 economies; Brazil)",
        "ch99Code": "9903.05.20–9903.05.84 / 9903.05.01",
        "before": "None",
        "now": "Printed at +10% to +25%, but no Chapter 74 line pays it",
        "exemption": (
            "Copper cathode, unwrought copper, mattes, scrap and master alloys (all 23 lines of 7401–7405) are on the general exemption "
            "lists of note 52(b) (9903.05.86) and note 50(a)(ii) (9903.05.03, Brazil). Every other line is a Section 232 copper article, "
            "and goods under 9903.82.02 do not pay these duties (notes 52(f)(1), 50(a)(vi)(1)). The exception would be an article of a "
            "listed provision with no copper at all (9903.82.01), which does not arise for articles of copper."
        ),
        "whatItMeans": "For copper the 2026 Section 301 tariffs change nothing: semis pay 50% under Section 232 instead, cathode and scrap stay at their base rate.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2026-15181", "fr-2026-15274", "fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ru-section-232",
        "country": "Russia",
        "measure": "Section 232 copper (Russia) + column 2 rates, 70% in lieu of column 2 on 9 lines",
        "ch99Code": "9903.82.14 / 9903.90.09",
        "before": "Column 2 rates (6% to 110%), 70% in lieu of column 2 on 9 lines",
        "now": "+50% Section 232 on 7406–7419, on top of the column 2 rate or the 70% rate",
        "exemption": (
            "Russia has paid column 2 rates since April 9, 2022, and 70% in lieu of column 2 on the note 30(d) copper subheadings "
            "(7403.11 cathode, 7408.11.60, 7408.19, 7409.21, 7410.22) since April 1, 2023 (Proclamation 10523). Section 232 (9903.82.14, 50%) "
            "is added on 7406–7419."
        ),
        "whatItMeans": "Russian copper cathode pays 70%; Russian copper wire up to 120%.",
        "effectiveFrom": "2026-04-06",
        "effectiveSourceId": "procl-11021",
        "sourceIds": ["procl-11021", "procl-10523", "hts-chapter-99", "hts-now"],
    },
]


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {"id": id_, "type": type_, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now,
            "countries": countries, "sourceIds": ids}


gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 74 base-rate changes"
base["detail"] = "All 136 Chapter 74 lines carry the same general rate in the 2026 Revision 21 as in the 2025 Basic Edition; none changed and none are new or renumbered."
base["date"] = CHECKED
changes = [
    base,
    ch("nicaragua-301", "pending", "2026-10-07", "Announced", "Section 301 tariff on Nicaragua phases in from 2027",
       "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
       "(9903.89.01, U.S. note 29). The rate is 0% in 2026.",
       None, "+10% to +15%", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the review",
       "USTR announced that the 2018–2019 Section 301 actions on China, including List 3 (25%) and List 4A (7.5%) that cover 135 Chapter 74 "
       "lines, continue while the statutory four-year review proceeds.",
       None, None, "China", ["fr-2026-20510"]),
    ch("pipe-mx-review", "reference", "2026-09-21", "Published", "Copper pipe and tube from Mexico: preliminary review results",
       "Commerce published preliminary results of the 2024–2025 administrative review of the antidumping order on seamless refined copper "
       "pipe and tube from Mexico (7411.10.10), which sets company-specific cash-deposit rates when final.",
       None, None, "Mexico", ["fr-2026-19273"]),
    ch("brass-rod-reviews", "reference", "2026-09-14", "Published", "Brass rod: preliminary review results for Korea, Brazil and South Africa",
       "Commerce published preliminary results of the first administrative reviews of the brass rod orders: antidumping on Korea (September 14), "
       "Brazil (September 8) and South Africa (September 3), and countervailing on Korea (September 10). The ITC is reconsidering its injury "
       "determination on brass rod from Israel on a court remand (July 17, 2026); the Israel orders stay in force meanwhile.",
       None, None, "Korea, Brazil, South Africa, Israel", ["fr-2026-18694", "fr-2026-18491", "fr-2026-18248", "fr-2026-18085", "fr-2026-14428"]),
    ch("section-338-canada", "reference", "2026-08-22", "Effective", "Canada Section 338 duties: no Chapter 74 line",
       "Proclamations 11046–11048 put a 50% duty (9903.03.12–9903.03.14) on Canadian products in the note 51(b) lists from August 22, 2026, "
       "with lists changed from September 15, 2026 (Proclamation 11065 for the motor-vehicle list). No Chapter 74 line is on any of the lists, so Canadian copper pays only the "
       "Section 232 duty (on 7406–7419) and its base rate.",
       None, "None on Chapter 74", "Canada", ["procl-11048", "procl-11065", "csms-69606660", "csms-69851916", "hts-chapter-99"]),
    ch("derivatives-proposal", "pending", "2026-08-06", "Published", "Commerce proposes 14 more metals derivatives; none in Chapter 74",
       "Under the rolling inclusion authority of Proclamation 11021, Commerce asked for comments (by August 27, 2026) on adding 14 derivative "
       "articles to the Section 232 metals duties, including insulated copper electric conductor cables (8544.49, 8544.60) and brass-wind "
       "instruments. No Chapter 74 line is affected: all of 7406–7419 is already covered.",
       None, None, "All", ["fr-2026-15961"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: no Chapter 74 line pays them",
       "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. All of 7401–7405 is on the general exemption "
       "list (note 52(b)) and 7406–7419 pays Section 232 instead (note 52(f)(1)), so no Chapter 74 line is charged.",
       None, "None on Chapter 74", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It charged no Chapter 74 line: "
       "Section 232 copper was outside it (Proclamation 11012), and 7401–7405 were on its product exemption list (9903.03.03).",
       None, None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: no Chapter 74 line pays it",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. 7401–7405 are on its exemption list (note 50(a)(ii)) and Section 232 copper "
       "is excluded (note 50(a)(vi)(1)).",
       None, "None on Chapter 74", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("pipe-vn-sunset", "pending", "2026-07-02", "Published", "Five-year review of the copper pipe and tube order on Vietnam",
       "Commerce and the ITC started the first sunset review of the 2021 antidumping order on seamless refined copper pipe and tube from "
       "Vietnam (7411.10.10). The order stays in force while the review runs.",
       None, None, "Vietnam", ["fr-2026-13376", "fr-2026-13415"]),
    ch("refined-copper-update", "pending", "2026-06-30", "Due", "Refined copper: no phased duty proclaimed",
       "Proclamation 10962 told Commerce to report by June 30, 2026 on U.S. copper markets so the President could decide on a phased "
       "universal duty on refined copper of 15% from January 1, 2027 and 30% from January 1, 2028, as the June 30, 2025 report recommended. "
       "No proclamation imposing it has been published in the Federal Register as of October 13, 2026; refined cathode (7403) stays outside "
       "Section 232.",
       None, "Not imposed", "All", ["procl-10962"]),
    ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032 adjusts the metals program",
       "From June 8, 2026, metal content counts as U.S.-made when at least 85% (by weight) was smelted and cast, or melted and poured, in the "
       "United States, and new rates apply to some equipment derivatives. Nothing changed for Chapter 74: copper articles stay at 50%.",
       None, None, "All", ["procl-11032"]),
    ch("tech-corrections", "reference", "2026-04-29", "Published", "Commerce corrects the Section 232 annex",
       "Commerce added heading 9903.82.01 (articles on the note 16 lists that contain no aluminum, steel or copper pay no Section 232 duty) "
       "from April 6, 2026, and made other technical corrections to the HTS annex of Proclamation 11021.",
       None, None, "All", ["fr-2026-08297"]),
    ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Copper moves to the full-value metals program (Proclamation 11021)",
       "Proclamation 11021 replaced the copper headings 9903.78.01–.02 with 9903.82.02 (Russia 9903.82.14) and charges the 50% on the full "
       "customs value regardless of copper content. Chapter 74 coverage is unchanged (7406–7419). It ended the copper derivatives inclusion "
       "process in favor of joint Commerce–USTR inclusions, allows manufacturing drawback only for Annex I-B and III derivatives of "
       "trade-agreement partners (not Chapter 74 articles), and requires privileged foreign status in foreign-trade zones. CBP's CSMS 68253075 "
       "said it would announce when reporting the country of copper smelt and cast becomes required, listing only insulated wire (8544.42, "
       "8544.49.10); no Chapter 74 line is on that list.",
       "+50% on copper content", "+50% on full value", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
    ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; Chapter 74 outside it",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Proclamation 11012 excluded goods subject to "
       "Section 232, and cathode, unwrought copper, scrap and master alloys (7401–7405) were on its exemption list (9903.03.03), so no Chapter "
       "74 line paid it.",
       None, "Copper exempt", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, "
       "Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them from 12:00 a.m. ET on "
       "February 24, 2026. The Section 232 copper duty is not an IEEPA duty and continued. For Chapter 74 the IEEPA duties had applied "
       "to the non-copper content of Section 232 copper goods and to goods outside the exemption lists.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("s232-copper", "extraDuty", "2025-08-01", "Effective", "50% Section 232 tariff on semi-finished copper (Proclamation 10962)",
       "Proclamation 10962 (signed July 30, 2025) imposed a 50% duty on semi-finished copper products and intensive copper derivatives of all "
       "countries, from 12:01 a.m. EDT on August 1, 2025, under heading 9903.78.01 (U.S. note 36). The duty applied only to the value of the "
       "copper content; the non-copper content was entered under 9903.78.02 at 0% and kept paying the IEEPA duties. In Chapter 74 it covered "
       "every line of 7406–7419; refined copper cathode, ores, concentrates, mattes and scrap were not covered. No drawback; FTZ goods "
       "had to take privileged foreign status. Goods under the Section 232 auto-parts duties paid those instead.",
       "None", "+50% on copper content", "All", ["procl-10962", "csms-65794272", "hts-2026b-ch99"]),
    ch("investigation", "reference", "2025-02-25", "Signed", "Section 232 investigation of copper imports opens",
       "Executive Order 14220 directed Commerce to investigate whether imports of copper in all forms (ores, concentrates, mattes, refined "
       "copper, alloys, scrap and derivatives) threaten national security. Commerce asked for public comments on March 13, 2025 and "
       "reported on June 30, 2025.",
       None, None, "All", ["eo-14220", "fr-2025-04061", "procl-10962"]),
    ch("reciprocal", "reference", "2025-04-02", "Signed", "Reciprocal tariff: cathode and scrap exempt",
       "Executive Order 14257 set the reciprocal tariffs from April 5, 2025, with an Annex II exemption list (9903.01.32) that, as printed in "
       "the current schedule, includes copper mattes, unwrought copper and cathode, scrap and master alloys (7401–7405). From August 1, 2025 "
       "the reciprocal duty did not apply to the copper content of Section 232 copper goods (note 2(v)(xii)) but did apply to their "
       "non-copper content (CSMS 65794272). Ended February 24, 2026.",
       None, "Cathode and scrap exempt", "All except Canada, Mexico", ["eo-14257", "csms-65794272", "hts-chapter-99"]),
    ch("ca-mx-ieepa", "reference", "2025-02-01", "Signed", "IEEPA duties on Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods were exempted from March 7, 2025. Ended "
       "February 24, 2026.",
       None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
    ch("brass-rod-israel", "reference", "2024-09-27", "Published", "Brass rod from Israel: AD and CVD orders",
       "Commerce issued antidumping and countervailing duty orders on brass rod from Israel (mainly 7407.21.50, 7407.21.70, 7407.21.90).",
       None, "AD/CVD cash deposits", "Israel", ["fr-2024-22206"]),
    ch("brass-rod-2024", "reference", "2024-06-13", "Published", "Brass rod: AD orders on five countries, CVD on India and Korea",
       "Commerce issued antidumping duty orders on brass rod from Brazil, India, Mexico, Korea and South Africa and a countervailing duty order "
       "on Korea (June 13, 2024), after the countervailing duty order on India (February 13, 2024).",
       None, "AD/CVD cash deposits", "Brazil, India, Mexico, Korea, South Africa", ["fr-2024-13041", "fr-2024-03073"]),
    ch("brass-sheet", "reference", "2023-04-04", "Published", "Brass sheet and strip orders continued",
       "After a fifth sunset review, Commerce continued the antidumping duty orders on brass sheet and strip (7409.21, 7409.29) from France, "
       "Germany, Italy and Japan.",
       None, None, "France, Germany, Italy, Japan", ["fr-2023-06922"]),
    ch("phosphor-copper", "reference", "2022-11-01", "Published", "Phosphor copper order on Korea continued",
       "Commerce continued the antidumping duty order on phosphor copper (master alloy, 7405.00.10) from Korea.",
       None, None, "South Korea", ["fr-2022-23742"]),
    ch("pipe-cn-mx", "reference", "2022-05-23", "Published", "Copper pipe and tube orders on China and Mexico continued",
       "Commerce continued the 2010 antidumping duty orders on seamless refined copper pipe and tube (7411.10.10) from China and Mexico.",
       None, None, "China, Mexico", ["fr-2022-11003"]),
    ch("pipe-vn", "reference", "2021-08-13", "Published", "Copper pipe and tube from Vietnam: AD order",
       "Commerce issued an antidumping duty order on seamless refined copper pipe and tube from Vietnam (7411.10.10).",
       None, "AD cash deposits", "Vietnam", ["fr-2021-17375"]),
    ch("cn-list4a", "extraDuty", "2020-02-14", "Effective", "China List 4A cut to 7.5%",
       "The List 4A duty on Chinese copper household articles (7418.10), 15% from September 1, 2019, was halved to 7.5% under the Phase One "
       "agreement.",
       "+15%", "+7.5%", "China", ["fr-2019-17865", "fr-2020-00904"]),
    ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%",
       "The List 3 duty on Chinese copper (7402–7417, 7418.20–7419), 10% from September 24, 2018, rose to 25%.",
       "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
]
for c in changes:
    for sid in c["sourceIds"]:
        assert sid in src, sid
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in changes for sid in c["sourceIds"]}
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch74"])
for sid in used:
    assert sid in src, sid
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["h1"] = "HTS Chapter 74 Copper Tariffs by Country: Chile, Canada, Peru, Mexico, China & More"
ia["seo"] = {
    "title": "Copper Tariffs by Country: Chile, Canada, Mexico, Peru, China, Germany, Japan (HTS Ch. 74) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on copper by country and product: 50% on copper wire, rod, sheet, foil, tube and fittings from Chile, "
        "Canada, Mexico, Peru, Germany, Japan, Korea and everywhere else; China 75% to 78%; cathode and scrap Free or 1%. USMCA and FTA "
        "claims explained."
    ),
    "keywords": [
        "copper tariffs by country",
        "copper tariff canada",
        "copper tariff mexico",
        "chile copper tariff",
        "copper tariff china",
        "what is the tariff on copper from china",
        "copper tariff usmca",
        "copper import tariff us",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current "
    "tariff schedule. For copper semis and articles (7406–7419) the answer is almost the same everywhere: **50%** plus a base rate of "
    "up to 3% (Free under an FTA or USMCA), because Section 232 has no country exemptions and is collected on top of FTA rates. China "
    "pays **75% to 78%** (Section 301 adds 25%, or 7.5% on household ware).\n\n"
    "The raw-material groups are different: copper mattes, unrefined copper, **refined cathode**, unwrought alloys, **scrap** and master "
    "alloys (7401–7405) are outside Section 232 and exempt from the 2026 Section 301 tariffs, so they pay only their base rate (Free or "
    "1%, Free under the Chile, Peru, USMCA and other FTAs) except from China (25%) and Russia. The table does **not** include antidumping "
    "or countervailing duties on copper pipe and tube, brass sheet and strip, brass rod and phosphor copper (see Tariff updates)."
)
R = {
    "Chile": ("50% on copper semis and articles (7406–7419): Section 232 (9903.82.02) has no Chile exemption and is collected on top of the "
              "U.S.–Chile FTA rate (note 16(b)). Cathode, unwrought copper and scrap (7401–7405) are Free with the FTA claim (CL) and exempt "
              "from the 2026 Section 301 duty (9903.05.30).",
              ["procl-11021", "procl-10962", "fr-2026-15181", "hts-now"]),
    "Canada": ("50% on copper semis and articles, with or without a USMCA claim (Section 232, 9903.82.02; note 16(b)). Cathode, unwrought "
               "copper and scrap are Free with USMCA (1% on 7403 without it). The 10% Section 301 duty (9903.05.29) and Canada's 50% Section "
               "338 duty charge no Chapter 74 line.",
               ["procl-11021", "procl-10962", "fr-2026-15181", "procl-11048", "procl-11065", "hts-now"]),
    "Congo (Kinshasa)": ("Democratic Republic of the Congo: refined cathode (7403) and the other 7401–7405 goods are Free under AGOA "
                         "(SPI D; the DRC was re-designated by Proclamation 10128 from January 1, 2021, is listed in general note 16(a), and AGOA was renewed through December 31, 2026). Copper semis "
                         "and articles pay 50% Section 232 (9903.82.02), which AGOA does not reduce. The DRC is not one of the 2026 Section "
                         "301 economies.",
                         ["procl-11021", "hts-gn", "procl-10128", "ustr-agoa-2026", "hts-now"]),
    "Australia": ("50% on copper semis and articles (Section 232, 9903.82.02); the U.S.–Australia FTA (AU) removes only the base rate. "
                  "Cathode and the other 7401–7405 goods are Free with the FTA claim; the 12.5% Section 301 duty (9903.05.23) charges no "
                  "Chapter 74 line.",
                  ["procl-11021", "fr-2026-15181", "hts-now"]),
    "Thailand": ("50% plus the base rate on copper semis and articles (Section 232, 9903.82.02). Cathode pays 1%; the 12.5% Section 301 duty "
                 "(9903.05.77) charges no Chapter 74 line.",
                 ["procl-11021", "fr-2026-15181", "hts-now"]),
    "Peru": ("50% on copper semis and articles (Section 232, 9903.82.02), on top of the U.S.–Peru TPA rate. Cathode, unwrought copper and "
             "scrap are Free with the TPA claim (PE); the 12.5% Section 301 duty (9903.05.63) charges no Chapter 74 line.",
             ["procl-11021", "fr-2026-15181", "hts-now"]),
    "Mexico": ("50% on copper semis and articles, with or without a USMCA claim (Section 232, 9903.82.02). Cathode, unwrought copper and "
               "scrap are Free with USMCA. Mexican seamless copper pipe and tube and brass rod also carry antidumping duties, not shown.",
               ["procl-11021", "procl-10962", "fr-2026-15181", "fr-2022-11003", "fr-2024-13041", "hts-now"]),
    "China": ("75% to 78% on copper semis and articles: 50% Section 232 (9903.82.02) + 25% Section 301 List 3 (9903.88.03) + the base rate; "
              "60.5% on household ware (7418.10, List 4A 7.5%). Cathode, unwrought copper, scrap and master alloys pay 25% (List 3) plus "
              "their base rate; mattes (7401) are Free. The 12.5% 2026 Section 301 duty (9903.05.31) charges no Chapter 74 line. Chinese "
              "seamless copper pipe and tube also carries an antidumping duty, not shown.",
              ["procl-11021", "fr-2018-20610", "fr-2019-09681", "fr-2020-00904", "fr-2026-20510", "fr-2026-15181", "fr-2022-11003", "hts-now"]),
    "Germany": ("EU: 50% plus the base rate on copper semis and articles (Section 232, 9903.82.02). The 2026 Section 301 rate for the EU (9903.05.39) charges no Chapter 74 line. German brass sheet and "
                "strip carries an antidumping duty, not shown.",
                ["procl-11021", "fr-2026-15181", "fr-2023-06922", "hts-now"]),
    "Japan": ("50% on copper semis and articles (Section 232, 9903.82.02) plus the base rate, except copper foil (7410), which is Free under "
              "the U.S.–Japan Trade Agreement (JP). Japanese brass sheet and strip carries an antidumping duty, not shown.",
              ["procl-11021", "fr-2026-15181", "fr-2023-06922", "hts-now"]),
    "South Korea": ("50% on copper semis and articles (Section 232, 9903.82.02); KORUS removes the base rate but not Section 232. Cathode "
                    "and scrap are Free. Korean brass rod (AD/CVD) and phosphor copper (AD) carry company-specific duties, not shown.",
                    ["procl-11021", "fr-2026-15181", "fr-2024-13041", "fr-2022-23742", "hts-now"]),
    "India": ("50% plus the base rate on copper semis and articles (Section 232, 9903.82.02); GSP has lapsed. The 10% Section 301 duty "
              "(9903.05.44) charges no Chapter 74 line. Indian brass rod carries AD/CVD, not shown.",
              ["procl-11021", "fr-2026-15181", "fr-2024-13041", "fr-2024-03073", "hts-now"]),
    "Brazil": ("50% plus the base rate on copper semis and articles (Section 232, 9903.82.02). Neither the 25% Brazil Section 301 duty nor "
               "the 12.5% 2026 duty reaches Chapter 74 (notes 50(a)(ii), 50(a)(vi)(1), 52(b), 52(f)(1)). Brazilian brass rod carries an "
               "antidumping duty, not shown.",
               ["procl-11021", "fr-2026-14542", "fr-2026-15181", "fr-2024-13041", "hts-now"]),
    "United Kingdom": ("50% plus the base rate on copper semis and articles (Section 232, 9903.82.02): the UK's 25% rate (9903.82.04) covers "
                       "only aluminum and steel. The 10% Section 301 duty (9903.05.81) charges no Chapter 74 line.",
                       ["procl-11021", "procl-10962", "fr-2026-15181", "hts-now"]),
    "Vietnam": ("50% plus the base rate on copper semis and articles (Section 232, 9903.82.02); 12.5% Section 301 (9903.05.84) charges no "
                "Chapter 74 line. Vietnamese seamless copper pipe and tube carries an antidumping duty, not shown.",
                ["procl-11021", "fr-2026-15181", "fr-2021-17375", "hts-now"]),
}
OTHER = ("At least 50% on copper semis and articles (7406–7419) from every other country: Section 232 has no exemptions. Cathode, scrap "
         "and other 7401–7405 goods pay only their base rate (Free or 1%). Column 2 countries pay more: Russia 6% to 110% plus 50%, or 70% "
         "in lieu of column 2 on 9 lines; Nicaragua's Section 301 duty starts January 1, 2027.")
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R and R[c["country"]]:
        rule["label"], rule["sourceIds"] = R[c["country"]]
    elif c["country"] == "Any other country":
        rule["label"] = OTHER
        rule["sourceIds"] = ["procl-11021", "procl-10523", "fr-2025-23892", "hts-now"]
    else:
        raise SystemExit(f"no rule text for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Section 232 copper is shown at its only rate for Chapter 74: 50% of the full customs value (9903.82.02; Russia 9903.82.14). There is "
    "no UK, Canada/Mexico or U.S.-content reduction for Chapter 74 copper articles.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Antidumping and countervailing duties are not included. They apply company by company to seamless refined copper pipe and tube "
    "(China, Mexico, Vietnam), brass sheet and strip (France, Germany, Italy, Japan), brass rod (Brazil, India, Israel, Korea, Mexico, "
    "South Africa) and phosphor copper (Korea).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21, and note 36 in the 2026 Basic "
    "Edition. Note 16(c)(v) lists every 8-digit line of 7406–7419 as articles of copper; it has no country exemption, and note 16(b) "
    "collects the duty on top of FTA rates. No Chapter 74 line is in 16(c)(viii) (the 85%-U.S.-copper rule) or the UK provisions of 16(d). "
    "All of 7401–7405 is on the 2026 Section 301 exemption list (note 52(b)) and the Brazil list (note 50(a)(ii)); Section 232 goods are "
    "excluded from both duties (notes 52(f)(1), 50(a)(vi)(1)). No Chapter 74 line is on the Canada Section 338 lists (note 51(b)(1)–(3)); "
    "7413.00.90 appears only in the civil-aircraft exception (51(d)). China List 3 (note 20(f)) covers 7402–7417 and 7418.20–7419; List 4A "
    "(note 20(s)) covers 7418.10; no line is in note 31."
)
ia_ids = {sid for c in ia["countries"] for sid in c["rule"]["sourceIds"]} | {"hts-now", "hts-chapter-99"}
for sid in ia_ids:
    assert sid in src, sid
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Copper: Section 232 Copper Entry, CSMS, Invoice Rules & Ways to Lower Duty (HTS Ch. 74) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 74 copper line: Section 232 entry under 9903.82.02 on full value, CBP's copper CSMS guidance, the "
        "copper-content invoice statement, FTZ status, marking and AD/CVD scope, plus the legal ways to pay less: cathode and scrap outside "
        "Section 232, FTA claims, non-Chinese origin and drawback."
    ),
    "keywords": [
        "section 232 copper csms",
        "section 232 copper hts list",
        "section 232 copper derivatives",
        "copper tariff exemptions",
        "copper tariff exclusions",
        "copper cathodes tariff exemption",
        "copper tube tariff code",
        "copper wire tariff code",
    ],
}
te["intro"] = (
    "For copper the classification decides almost everything. A Chapter 74 line in **7406–7419** is a Section 232 copper article: report "
    "**9903.82.02** with it and pay **50% of the full customs value**, with no FTA reduction and no drawback. A line in **7401–7405** "
    "(mattes, unrefined copper, refined cathode and unwrought alloys, scrap, master alloys) is outside Section 232. The invoice must state "
    "the weight and copper content (19 CFR 141.89).\n\n"
    "The legal ways to pay less are narrow: there are no Section 232 exclusions, quotas or country rates for copper. What remains: buying "
    "copper in a form outside Section 232 (cathode, unwrought alloy or scrap) and fabricating it in the United States, claiming an FTA or "
    "USMCA for the base rate, avoiding Chinese origin (25% Section 301), classifying correctly, and checking AD/CVD scope before you buy. "
    "Each rule and lever links to its regulation or proclamation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "unwrought",
        "title": "Import unwrought copper, cathode or scrap and fabricate in the United States",
        "saves": "The whole 50% Section 232 duty: 7401–7405 are not on the note 16(c)(v) list",
        "appliesTo": "Mattes, unrefined copper, refined cathode, wire bars, billets and unwrought alloys, scrap and master alloys (7401–7405), instead of rod, wire, sheet, foil or tube",
        "document": "Mill or assay certificates and the invoice statement of copper content (19 CFR 141.89) that support the 7401–7405 classification.",
        "caveat": "Only real changes in what you buy count: semis rolled, drawn or extruded abroad are 7406–7419 and pay 50%. Proclamation 10962 asked Commerce to report on a possible 15% (2027) and 30% (2028) duty on refined copper; none has been proclaimed.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c)(v)", "url": CH99},
            {"label": "Proclamation 10962 (90 FR 37727)", "url": S("procl-10962")["url"]},
            {"label": "HTSUS Chapter 74, note 1", "url": CH74},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA or USMCA rate for the base duty",
        "saves": "The base rate: 1% on cathode and unwrought copper (7403), 1% to 3% on semis and articles",
        "appliesTo": "Originating goods of Chile (CL), Peru (PE), Canada and Mexico (USMCA, S), Korea (KR), Australia, Colombia, CAFTA-DR and other FTA partners; Japan (JP) for copper foil",
        "document": "The agreement's certification or proof of origin (USMCA: 19 CFR 182.12; Chile: 19 CFR 10.410; Peru: 19 CFR 10.3004), kept on file and presented when CBP asks.",
        "caveat": "Note 16(b): an FTA or USMCA claim never reduces the 50% Section 232 duty. For cathode from Chile or Peru it makes the duty $0.",
        "citations": [
            {"label": "19 CFR 182.12 (USMCA)", "url": f"{ECFR}/section-182.12"},
            {"label": "19 CFR 10.410 (Chile)", "url": f"{ECFR}/section-10.410"},
            {"label": "19 CFR 10.3004 (Peru)", "url": f"{ECFR}/section-10.3004"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(b)", "url": CH99},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese origin",
        "saves": "25% of value (7.5% on household ware): Chinese copper pays Section 301 on top of Section 232, 75% to 78% in total, against 50% to 53% from other countries",
        "appliesTo": "135 lines, for goods of China (all but 7401)",
        "document": "Mill certificates and production records showing where the product was made. Origin follows the last substantial transformation; ask CBP for a binding ruling if processing happens in more than one country.",
        "caveat": "Third-country processing does not change the Section 232 rate (50% everywhere) and can be checked for AD/CVD circumvention, for example on copper pipe and tube.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "classify",
        "title": "Classify the copper form and alloy correctly",
        "saves": "The 50% duty when a product is truly unwrought (7403, 7405) or scrap (7404), and the right base rate and AD/CVD status for brass, bronze and cupro-nickel",
        "appliesTo": "All lines; most often unwrought vs wrought shapes, master alloys vs alloys, scrap vs usable semis, and brass vs other alloys",
        "document": "Chemical analysis (chapter note 1 and subheading note 1 thresholds), a description of form and processing, and if unsure a CBP binding ruling.",
        "caveat": "Classification follows the product, not the duty: copper sold as scrap that is usable as rod or sheet is not 7404. Insulated wire and cable are heading 8544 (Section 232 at 25% or 50% under other rules).",
        "citations": [
            {"label": "HTSUS Chapter 74, notes", "url": CH74},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check AD/CVD scope before you buy",
        "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
        "appliesTo": "Seamless copper pipe and tube (China, Mexico, Vietnam), brass sheet and strip (France, Germany, Italy, Japan), brass rod (seven countries), phosphor copper (Korea)",
        "document": "The order's written scope (it, not the HTS number, decides) and the producer's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
        "caveat": "A product in scope pays the cash deposit even if entered under another HTS line, on top of the 50% Section 232 duty. Rates change with each administrative review.",
        "citations": [
            {"label": "19 CFR 351.225 (scope rulings)", "url": "https://www.ecfr.gov/current/title-19/section-351.225"},
            {"label": "Copper pipe and tube orders (87 FR 31209)", "url": S("fr-2022-11003")["url"]},
            {"label": "Brass rod orders (89 FR 50263)", "url": S("fr-2024-13041")["url"]},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback: only for the base rate and Section 301",
        "saves": "Up to 99% of the base rate and Section 301 duty on goods that are exported or used in exported products",
        "appliesTo": "All lines, but not the Section 232 duty on Chapter 74 copper articles",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Proclamation 10962 allowed no drawback of the copper duty; Proclamation 11021 allows manufacturing drawback only for Annex I-B and III derivatives of trade-agreement partners, and Chapter 74 copper articles (Annex I-A) are not among them. AD/CVD are never refundable (19 CFR 191.3(b)(3)).",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR}/section-191.3"},
            {"label": "Proclamation 11021, clauses 13–14", "url": S("procl-11021")["url"]},
        ],
    },
]
ADCVD = {
    "adcvd-pipe": ("Commerce (ITA) / CBP", "Seamless refined copper pipe and tube AD orders: China and Mexico (2010, continued 2022), Vietnam (2021; sunset review started July 2026). Not in the tariff calculator",
                   [("87 FR 31209 (China, Mexico)", "fr-2022-11003"), ("86 FR 44691 (Vietnam)", "fr-2021-17375"), ("91 FR 40515 (2026 sunset review)", "fr-2026-13376")]),
    "adcvd-brass-sheet": ("Commerce (ITA) / CBP", "Brass sheet and strip AD orders: France, Germany, Italy, Japan (continued 2023). Not in the tariff calculator",
                          [("88 FR 19924", "fr-2023-06922")]),
    "adcvd-brass-rod": ("Commerce (ITA) / CBP", "Brass rod AD orders (Brazil, India, Israel, Korea, Mexico, South Africa) and CVD orders (India, Israel, Korea). Not in the tariff calculator",
                        [("89 FR 50263 (Brazil, India, Korea, Mexico, South Africa)", "fr-2024-13041"), ("89 FR 10032 (India CVD)", "fr-2024-03073"), ("89 FR 79243 (Israel)", "fr-2024-22206")]),
    "adcvd-phosphor": ("Commerce (ITA) / CBP", "Phosphor copper AD order: Korea (continued 2022). Not in the tariff calculator",
                       [("87 FR 65747", "fr-2022-23742")]),
}
te["rules"] = [
    {"id": "s232-entry", "agency": "CBP", "title": "Section 232 copper: report 9903.82.02 (Russia 9903.82.14) with each 7406–7419 line; duty on the full customs value, on top of any FTA rate (before April 6, 2026: 9903.78.01 on the copper content)",
     "citations": [{"label": "CBP CSMS # 68253075", "url": S("csms-68253075")["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99},
                   {"label": "CBP CSMS # 65794272 (2025 copper guidance)", "url": S("csms-65794272")["url"]}]},
    {"id": "invoice-copper", "agency": "CBP", "title": "Invoice must state the weight of copper articles and the percentage of copper and every other element by weight; for 7401 mattes and cement copper, the copper content by assay",
     "citations": [{"label": "19 CFR 141.89", "url": f"{ECFR}/section-141.89"}]},
    {"id": "ftz", "agency": "CBP", "title": "Section 232 copper admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
     "citations": [{"label": "19 CFR 146.41", "url": f"{ECFR}/section-146.41"}, {"label": "Proclamation 11021, clause 12", "url": S("procl-11021")["url"]}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container; metal bars, ingots, plates, sheets and similar forms are on the J-list, but their outermost container must be marked",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR}/section-134.11"}, {"label": "19 CFR 134.33", "url": f"{ECFR}/section-134.33"}]},
    {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 70% in lieu of column 2 on note 30(d) copper lines, plus Section 232 (9903.82.14)",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10523 (88 FR 13277)", "url": S("procl-10523")["url"]}]},
]
for rid, (agency, title, cites) in ADCVD.items():
    te["rules"].append({"id": rid, "agency": agency, "title": title, "citations": [{"label": lab, "url": S(sid)["url"]} for lab, sid in cites]})

RAW_RULES = ["invoice-copper", "marking", "russia"]
BASE_RULES = ["s232-entry", "invoice-copper", "ftz", "marking", "russia"]
GROUP_RULES = {h: (RAW_RULES if h <= "7405" else BASE_RULES) for h in G}
GROUP_RULES["7405"] = RAW_RULES + ["adcvd-phosphor"]
GROUP_RULES["7407"] = BASE_RULES + ["adcvd-brass-rod"]
GROUP_RULES["7409"] = BASE_RULES + ["adcvd-brass-sheet"]
GROUP_RULES["7411"] = BASE_RULES + ["adcvd-pipe"]
GROUP_NOTES = {
    "7401": "Outside Section 232 and on the 2026 Section 301 exemption list; Free. The invoice must show the assayed copper content.",
    "7402": "Outside Section 232; Free except for China (25%, List 3).",
    "7403": "Outside Section 232: refined cathode and unwrought copper pay 1%, Free under the Chile, Peru, USMCA and other FTAs. China 26%; Russian cathode 70%.",
    "7404": "Outside Section 232 and on the 2026 Section 301 exemption list: Free except for China (List 3, 25%) and Russia (column 2).",
    "7405": "Outside Section 232; Free. Phosphor copper (7405.00.10) from Korea is under an antidumping order.",
    "7406": "Section 232 copper: 50% on full value.",
    "7407": "Section 232 copper: 50% on full value. Brass rod (7407.21.50, .70, .90) from Brazil, India, Israel, Korea, Mexico and South Africa is under AD and some CVD orders.",
    "7408": "Section 232 copper: 50% on full value. Insulated wire is heading 8544, outside this chapter.",
    "7409": "Section 232 copper: 50% on full value. Brass sheet and strip (7409.21, 7409.29) from France, Germany, Italy and Japan is under AD orders.",
    "7410": "Section 232 copper: 50% on full value, including copper-clad laminates, which paid only on their copper content before April 6, 2026.",
    "7411": "Section 232 copper: 50% on full value. Seamless refined copper pipe and tube (7411.10.10) from China, Mexico and Vietnam is under AD orders.",
    "7412": "Section 232 copper: 50% on full value.",
    "7413": "Section 232 copper: 50% on full value.",
    "7415": "Section 232 copper: 50% on full value.",
    "7418": "Section 232 copper: 50% on full value. China pays 7.5% (List 4A) on 7418.10 instead of 25%.",
    "7419": "Section 232 copper: 50% on full value.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = G[h][0]
    g["ruleIds"] = list(GROUP_RULES[h])
    g["note"] = GROUP_NOTES[h]
ADCVD_HEADINGS = {"7405": "7405.00.10", "7407": "7407.21", "7409": "7409.2", "7411": "7411.10.10"}
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    rules = [r for r in GROUP_RULES[h] if not r.startswith("adcvd")]
    if h in ADCVD_HEADINGS and hts.startswith(ADCVD_HEADINGS[h]):
        rules += [r for r in GROUP_RULES[h] if r.startswith("adcvd")]
    ln["ruleIds"] = rules
    levers = []
    if hts in S232:
        levers.append("unwrought")
    if any(c in (LINE[hts]["effectiveSpecial"] or "") for c in ("CL", "PE", "S", "KR")) and LINE[hts]["effectiveGeneral"] != "Free":
        levers.append("fta")
    levers.append("origin")
    levers.append("classify")
    if any(r.startswith("adcvd") for r in rules):
        levers.append("adcvd-scope")
    levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings change "
    "often, and AD/CVD rates are company-specific and change with each administrative review; check the current Chapter 99 notes, CBP's "
    "CSMS messages and Commerce's latest notices before importing."
)

# ------------------------------------------------------------------ FAQ (built after the trade figures are known)
def FAQS(T, B):
    t = T["top"]
    tops = ", ".join(f"{n} {B(v)} ({s:.0f}%)" for n, v, s, _, _ in t[:5])
    return [
        {
            "id": "current-rate",
            "question": "What is the U.S. tariff on copper?",
            "searchedAs": ["copper tariff", "copper tariffs us", "what is the tariff on copper", "is there a tariff on copper", "is there a us tariff on copper",
                           "how much is the copper tariff", "is there a 50 tariff on copper", "copper import tariff us"],
            "answer": "50% of the full customs value for copper semis and articles (HTS 7406–7419: rod, wire, sheet, foil, tube, fittings and other "
                      "articles) from every country, under Section 232 heading 9903.82.02, on top of the base rate of Free to 3%. Refined copper "
                      "cathode, unwrought copper, mattes, scrap and master alloys (7401–7405) are not covered and pay Free or 1%. Chinese copper "
                      "pays another 25% under Section 301 (7.5% on household ware).",
            "link": "",
        },
        {
            "id": "still-in-effect",
            "question": "Is the 50% copper tariff still in effect, and when did it start?",
            "searchedAs": ["is there still a tariff on copper", "is there a tariff on copper right now", "when did copper tariff start", "when does the copper tariff start",
                           "copper tariffs today", "copper tariff 2026", "are there currently tariffs on copper"],
            "answer": "Yes. Proclamation 10962 imposed the 50% Section 232 copper duty for goods entered from 12:01 a.m. EDT on August 1, 2025, then on the "
                      "copper content only. Proclamation 11021 kept 50% when it moved copper to heading 9903.82.02 on the full customs value from "
                      "April 6, 2026, and it is in the current tariff schedule (2026 Revision 21). The Supreme Court's February 20, 2026 ruling ended "
                      "only the IEEPA tariffs; the copper duty rests on Section 232 of the Trade Expansion Act of 1962.",
            "link": "tariff-updates",
        },
        {
            "id": "cathode",
            "question": "Is refined copper cathode exempt from the copper tariff?",
            "searchedAs": ["copper cathode tariff", "copper cathodes tariff exemption", "copper cathode us tariff", "refined copper tariff exemption", "hs code copper cathode",
                           "copper tariff exemptions"],
            "answer": "Yes. Copper cathode (7403.11) and other refined and unwrought copper and alloys (7403) are not on the Section 232 list (note 16(c)(v) "
                      "covers 7406–7419 only), and they are on the 2026 Section 301 exemption list. Cathode pays its 1% base rate, which is Free under "
                      "the Chile, Peru, USMCA and other FTAs; Chinese cathode pays 26% and Russian cathode 70%.",
            "link": "",
        },
        {
            "id": "refined-2027",
            "question": "Will refined copper get a tariff in 2027?",
            "searchedAs": ["refined copper tariff update", "us refined copper tariff proposal", "refined copper tariffs us", "copper tariff decision", "copper tariff announcement"],
            "answer": "Not so far. Commerce's June 30, 2025 report recommended a phased universal duty on refined copper of 15% from January 1, 2027 and "
                      "30% from January 1, 2028, and Proclamation 10962 asked Commerce to report by June 30, 2026 so the President could decide. No "
                      "proclamation imposing it had been published in the Federal Register as of October 13, 2026.",
            "link": "tariff-updates",
        },
        {
            "id": "scrap",
            "question": "Is there a tariff on copper scrap?",
            "searchedAs": ["copper scrap tariff code", "hs code copper scrap", "brass scrap tariff rate"],
            "answer": "Copper and brass scrap (heading 7404, e.g. 7404.00.30.20 refined copper scrap, 7404.00.60.55 brass scrap) is Free, outside Section "
                      "232 and on the 2026 Section 301 exemption list, so it pays no duty from Canada, Mexico or most other countries. Chinese scrap "
                      "pays 25% (Section 301 List 3).",
            "link": "",
        },
        {
            "id": "wire",
            "question": "Is there a tariff on copper wire?",
            "searchedAs": ["is there a tariff on copper wire", "copper wire tariffs", "copper wire tariff code", "copper wire hs code", "hs code copper wire",
                           "copper cable tariffs", "canada copper wire tariff"],
            "answer": "Yes. Bare copper wire (heading 7408, 1% or 3% base) and stranded wire and cable (7413) pay the 50% Section 232 duty from every "
                      "country, Canada included, with or without USMCA. Insulated wire and cable are heading 8544, outside Chapter 74; the insulated "
                      "copper conductors of 8544.42 and 8544.49.10 pay 25% under Section 232 when copper is at least 15% of their weight, or 10% with at least 85% U.S.-smelted copper.",
            "link": "",
        },
        {
            "id": "pipe",
            "question": "What is the tariff on copper pipe and tube?",
            "searchedAs": ["copper pipe tariff", "copper pipe tariff code", "copper tube tariff", "copper tube tariff code", "hs code copper pipe", "hs code copper tube"],
            "answer": "Seamless refined copper tube is 7411.10.10 (1.5%); other copper and brass tubes are 7411.10.50–7411.29 (1.4% to 3%) and fittings "
                      "7412 (3%). All pay +50% Section 232. Seamless refined copper pipe and tube from China, Mexico and Vietnam also carries "
                      "antidumping duties, and Chinese tube pays 25% Section 301 as well.",
            "link": "tariff-engineering",
        },
        {
            "id": "china",
            "question": "What is the tariff on copper from China?",
            "searchedAs": ["what is the tariff on copper from china", "copper tariff china", "copper import duty from china", "brass tariff from china",
                           "does the us import copper from china"],
            "answer": "Chinese copper semis and articles pay the base rate + 50% Section 232 + 25% Section 301 List 3: 75% to 78%. Household ware "
                      "(7418.10) pays 7.5% under List 4A instead, 60.5% in total. Cathode, scrap and other 7402–7405 goods pay 25% plus their base "
                      "rate. The 12.5% 2026 Section 301 duty on China does not apply to Chapter 74.",
            "link": "industry-areas",
        },
        {
            "id": "usmca",
            "question": "Does the copper tariff apply to Canada and Mexico under USMCA?",
            "searchedAs": ["copper tariffs canada", "copper tariff canada", "copper tariff mexico", "copper tariff usmca", "does the us import copper from canada",
                           "us copper imports from canada"],
            "answer": "Yes. Section 232 has no Canada or Mexico exemption for copper, and note 16(b) collects it on top of the USMCA rate, so Canadian and "
                      "Mexican copper wire, rod, sheet and tube pay 50%. A USMCA claim only removes the base rate. Cathode and scrap from Canada and "
                      "Mexico are Free with USMCA. Canada's 2026 Section 338 duties do not cover any Chapter 74 line.",
            "link": "industry-areas",
        },
        {
            "id": "chile",
            "question": "Does copper from Chile pay the tariff?",
            "searchedAs": ["chile copper tariff", "copper tariff chile"],
            "answer": "Chilean refined cathode (7403.11) is Free under the U.S.–Chile FTA and outside Section 232, so it pays $0. Chilean copper semis "
                      "and articles (7406–7419) pay the 50% Section 232 duty like every other country's; the FTA removes only the base rate.",
            "link": "industry-areas",
        },
        {
            "id": "hts-list",
            "question": "Which HTS codes does the Section 232 copper tariff cover?",
            "searchedAs": ["copper tariff hts codes", "copper tariff hts list", "section 232 copper tariff hts codes", "section 232 copper hts list",
                           "section 232 copper list", "section 232 copper derivatives", "copper tariff exclusions"],
            "answer": "In Chapter 74, every 8-digit line of 7406 through 7419 (113 ten-digit lines), listed in U.S. note 16(c)(v) to Chapter 99. Outside "
                      "Chapter 74 the program reaches insulated copper wire (8544.42, 8544.49.10) at 25% and other derivatives under their own "
                      "lists. There is no product exclusion process; Commerce and USTR can add derivatives (they proposed 14 more in August 2026, "
                      "none in Chapter 74).",
            "link": "tariff-engineering",
        },
        {
            "id": "full-value",
            "question": "Is the copper tariff charged on the copper content or the full value?",
            "searchedAs": ["copper content tariff", "section 232 copper csms", "section 232 copper faq", "section 232 copper proclamation"],
            "answer": "On the full value since April 6, 2026. From August 1, 2025 to April 5, 2026, CBP's CSMS 65794272 had importers report the copper "
                      "content under 9903.78.01 (50%) and the non-copper content under 9903.78.02 (0%). Proclamation 11021 and CSMS 68253075 replaced "
                      "that with 9903.82.02 on the full customs value, regardless of metal content.",
            "link": "tariff-updates",
        },
        {
            "id": "brass",
            "question": "Are there tariffs on brass?",
            "searchedAs": ["brass tariffs", "brass tariff us", "tariff code for brass", "brass tariff increase"],
            "answer": "Brass rod, wire, sheet, tube, fittings and other brass articles (7407.21, 7408.21, 7409.21–.29, 7411.21, 7412.20, 7418, 7419) pay "
                      "the 50% Section 232 copper duty plus a 1.4% to 3% base rate. Unwrought brass (7403.21) and brass scrap (7404) do not. Brass rod "
                      "from seven countries and brass sheet and strip from France, Germany, Italy and Japan also carry antidumping or countervailing duties.",
            "link": "",
        },
        {
            "id": "chapter-74",
            "question": "What is HTS Chapter 74?",
            "searchedAs": ["hts chapter 74", "htsus chapter 74", "hts code chapter 74", "us hts chapter 74", "hs code copper"],
            "answer": "Chapter 74 of the Harmonized Tariff Schedule covers copper and articles of copper: mattes, unrefined and refined copper, unwrought "
                      "alloys, scrap and master alloys (7401–7405) and powders, bars, rods, wire, sheet, foil, tubes, fittings, stranded wire, "
                      "fasteners, household ware and other articles (7406–7419): 136 ten-digit lines with base rates from Free to 3%.",
            "link": "",
        },
        {
            "id": "imports",
            "question": "Where does the U.S. import copper from?",
            "searchedAs": ["where does the us import copper from", "where does the us get most of its copper", "us copper imports by country",
                           "how much copper does the us import", f"us copper imports {T['Y']}"],
            "answer": f"In {T['Y']} the U.S. imported {B(T['total'])} of Chapter 74 copper products. The largest suppliers were {tops}. "
                      f"Cathode, scrap and other unwrought copper (7401–7405) were {B(T['raw'])}; semis and articles (7406–7419) {B(T['semi'])}. "
                      "Copper ores and concentrates are Chapter 26 and not included.",
            "link": "understand-industry",
        },
    ]


# ------------------------------------------------------------------ trade narrative (2025 Comtrade data)
NAME_FIX = {"Rep. of Korea": "South Korea", "Dem. Rep. of the Congo": "Democratic Republic of the Congo"}


def WHY_TEXT(T):
    tr = d["understandIndustry"]
    hc = {}
    for x in tr["byHeadingCountry"]:
        hc.setdefault(x["country"], {})[x["heading"]] = x["importsUsd"]
    prior_h = {}
    trade_file = json.load(open(os.path.join(IU, "src", "tariff-data", "trade", "chapter-74.json")))
    for h in trade_file["byHeading"]:
        prior_h[h["heading"]] = h["byYear"].get(str(T["PY"]), 0)
    cath = next(l for l in tr["byLine"] if l["hs6"] == "7403.11")
    byh = T["byh"]
    first = T["byYear"][0]
    assert tr["byCountry"][0]["country"] == "Chile"
    cl, cd, au = hc["Chile"], hc["Democratic Republic of the Congo"], hc["Australia"]
    cdp = next(c for c in tr["byCountry"] if c["country"] == "Democratic Republic of the Congo")["priorImportsUsd"]
    aup = next(c for c in tr["byCountry"] if c["country"] == "Australia")["priorImportsUsd"]
    raw_share = T["raw"] / T["total"] * 100
    return (
        f"U.S. imports of Chapter 74 copper were **{B(T['total'])} in {T['Y']}**, {pct(T['total'], T['prior']):+.1f}% from {B(T['prior'])} in {T['PY']} "
        f"and almost three times the {B(first[1])} of {first[0]}. The jump was in **refined copper cathode (7403.11): {B(cath['importsUsd'])}, "
        f"{cath['changePct']:+.0f}%**, two-thirds of the total. Chile ({B(cl['7403'])} of cathode, 99% of its shipments), Canada, the Democratic "
        f"Republic of the Congo ({B(cd['7403'])}, up from {B(cdp)}), Peru, South Korea, Australia ({B(au['7403'])}, up from {B(aup)}) and Japan "
        f"shipped mostly cathode. {T['Y']} was the year the Section 232 copper investigation opened (February 25) and the 50% duty started "
        "(August 1); the duty left cathode out.\n\n"
        f"Semis and articles (7406–7419), the goods that pay Section 232 today, were {B(T['semi'])}: copper wire {B(byh['7408'])} "
        f"({pct(byh['7408'], prior_h['7408']):+.0f}%; Canada {B(hc['Canada']['7408'])}), tubes and pipes {B(byh['7411'])}, sheet and strip "
        f"{B(byh['7409'])}, fittings {B(byh['7412'])} and bars, rods and profiles {B(byh['7407'])}. Germany (sheet, strip and fittings) and "
        f"China ({B(hc['China'].get('7412', 0))} of fittings, {B(hc['China'].get('7419', 0))} of other articles) ship mainly semis and articles. "
        f"Scrap was {B(byh['7404'])}, mainly from Canada ({B(hc['Canada']['7404'])}) and Mexico ({B(hc['Mexico']['7404'])}). "
        f"So {raw_share:.0f}% of {T['Y']} imports by value were in forms that are outside Section 232 today.\n\n"
        f"{T['Y']} is the latest full year of U.S. trade data. Copper ores and concentrates (Chapter 26) are not included. Duty-collected "
        "figures aren't available from an official source yet."
    )


for _l in d["understandIndustry"]["byLine"]:
    _l["searchText"] = _l["searchText"].replace("…", "")
for _c in d["understandIndustry"]["byCountry"]:
    _c["country"] = NAME_FIX.get(_c["country"], _c["country"])
for _x in d["understandIndustry"]["byHeadingCountry"]:
    _x["country"] = NAME_FIX.get(_x["country"], _x["country"])


# ------------------------------------------------------------------ trade-dependent text
ui = d["understandIndustry"]
assert ui["latestYear"], "no trade data: run with --trade-file"
Y, PY = ui["latestYear"], ui["priorYear"]


def B(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M"


def pct(a, b):
    return (a - b) / b * 100 if b else 0.0


total = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
prior = sum(c["priorImportsUsd"] for c in ui["byCountry"]) + ui["othersPriorImportsUsd"]
byh = {}
for x in ui["byHeadingCountry"]:
    byh[x["heading"]] = byh.get(x["heading"], 0) + x["importsUsd"]
raw_total = sum(v for h, v in byh.items() if h <= "7405")
semi_total = sum(v for h, v in byh.items() if h >= "7406")
top = ui["byCountry"][:6]
for c in ui["byCountry"]:
    if c.get("mainHeading") in G:
        c["mainHeadingLabel"] = G[c["mainHeading"]][0]
TRADE = {
    "Y": Y, "PY": PY, "total": total, "prior": prior, "raw": raw_total, "semi": semi_total,
    "byh": byh, "top": [(c["country"], c["importsUsd"], c["sharePct"], c["changePct"], c.get("mainHeading")) for c in ui["byCountry"][:12]],
    "byYear": [(y["year"], y["totalUsd"]) for y in ui["byYear"]],
}
json.dump(TRADE, open(os.path.join(CACHE, "74", "trade-summary.json"), "w"), indent=1)  # debug copy, outside the repo

names = ", ".join(f"{c['country']} ({B(c['importsUsd'])})" for c in top[:5])
p1, p2 = ui["byYearPartners"] = [top[0]["country"], top[1]["country"]]
ui["h1"] = "HTS Chapter 74: Copper and Articles Thereof — U.S. Import Statistics"
ui["seo"] = {
    "title": f"U.S. Copper Imports by Country & Product: {top[0]['country']}, {top[1]['country']}, {top[2]['country']} (HTS Ch. 74) | KoalaGains",
    "shortDescription": (
        f"Where U.S. copper imports come from, {ui['byYear'][0]['year']}–{Y}: {B(total)} in {Y} ({pct(total, prior):+.1f}% on {PY}), led by "
        f"{top[0]['country']} and {top[1]['country']}. Refined cathode, scrap, wire, sheet, foil and tube by country, product and year, from UN Comtrade."
    ),
    "keywords": [
        "us copper imports",
        "us copper imports by country",
        "where does the us import copper from",
        "where does the us get most of its copper",
        "how much copper does the us import",
        f"us copper imports {Y}",
        "HTS Chapter 74 import statistics",
    ],
}
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearCaption"] = f"U.S. imports of Chapter 74 goods each year, split into the two largest {Y} suppliers ({p1} and {p2}) and everyone else."
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["sources"] = [s for s in ui["sources"] if "comtrade" in (s.get("url") or "")] + [
    {"label": "Federal Register 90 FR 37727 (Proclamation 10962: 50% Section 232 duty on semi-finished copper from August 1, 2025)", "url": S("procl-10962")["url"]},
    {"label": "Federal Register 91 FR 18201 (Proclamation 11021: copper duty on full customs value from April 6, 2026)", "url": S("procl-11021")["url"]},
]
top_h = sorted(byh.items(), key=lambda kv: -kv[1])[:3]
ui["why"] = WHY_TEXT(TRADE) if "WHY_TEXT" in globals() else (
    f"U.S. imports of Chapter 74 copper were **{B(total)} in {Y}**, {pct(total, prior):+.1f}% from {B(prior)} in {PY}. The five largest "
    f"suppliers were {names}. By product group the largest were "
    + ", ".join(f"{G[h][0].lower()} ({h}, {B(v)})" for h, v in top_h)
    + f". Cathode, unwrought copper, scrap and other raw forms (7401–7405) were {B(raw_total)}; semis and articles (7406–7419), the goods "
    f"that pay Section 232, {B(semi_total)}.\n\n"
    f"{Y} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
)

ts = o["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = f"UN Comtrade, United States imports, HS chapter 74 ({Y})"
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["stats"].append({"label": f"{Y} imports", "value": B(total)})

# ------------------------------------------------------------------ finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 74 FAQ: Copper Tariffs, Exemptions and HS Codes"
fc["seo"] = {
    "title": "Copper Tariff FAQ 2026: Is There a Tariff on Copper? Cathode, Scrap, Wire, Pipe, China, Canada, HS Codes (HTS Ch. 74) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about U.S. copper tariffs: the 50% Section 232 rate, whether it is still in effect, cathode and scrap "
        "exemptions, copper wire, pipe and brass, China, Canada, Mexico and Chile, the HTS code list and full-value rule."
    ),
    "keywords": [
        "copper tariff",
        "is there a tariff on copper",
        "is there still a tariff on copper",
        "copper tariff 2026",
        "copper cathodes tariff exemption",
        "copper scrap tariff code",
        "is there a tariff on copper wire",
        "copper tariff hts codes",
        "what is the tariff on copper from china",
        "refined copper tariff update",
        "hts chapter 74",
    ],
}
fc["intro"] = (
    "Straight answers to the most-searched questions about U.S. tariffs on copper imports, by product, by country and by HS code. Each "
    "answer links to the page with the detail and the official sources."
)
fc["keyTakeaways"] = [
    "Copper semis and articles (HTS 7406–7419: powders, rod, wire, sheet, foil, tube, fittings, stranded wire, fasteners, household ware) pay "
    "the Section 232 duty of 50% of their full customs value from every country, on top of any FTA or USMCA rate.",
    "Refined copper cathode, unwrought copper and alloys, mattes, scrap and master alloys (7401–7405) are outside Section 232 and pay only "
    "their base rate (Free or 1%; Free under the Chile, Peru and USMCA agreements). A phased duty on refined copper was floated in 2025 but "
    "has not been imposed.",
    "Chinese copper pays another 25% under Section 301 (7.5% on household ware): 75% to 78% on semis. The IEEPA tariffs ended February 24, "
    "2026; the Section 122, 2026 Section 301 and Canada Section 338 duties charge no Chapter 74 line.",
    f"In {Y} the U.S. imported {B(total)} of Chapter 74 products, {top[0]['country']} ({B(top[0]['importsUsd'])}) and {top[1]['country']} "
    f"({B(top[1]['importsUsd'])}) first. Antidumping duties on copper pipe and tube, brass sheet, brass rod and phosphor copper come on top.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = QSRC
fc["faqs"] = FAQS(TRADE, B) if "FAQS" in globals() else []

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
