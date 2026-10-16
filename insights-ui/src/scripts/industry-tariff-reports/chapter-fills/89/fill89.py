"""Fill the writer TODOs of the generated Chapter 89 (Ships, Boats and Floating Structures) content file.

usage: python3 fill89.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 89 and its notes; Chapter 98 subchapters I, II, IV, XIII, XVIII;
Chapter 99 subchapter III notes 20, 29, 30, 31, 50, 51 and 52), the Section 301 maritime notices (90 FR 8089, 90 FR 17114,
90 FR 48320, 90 FR 50947), the Section 338 proclamations on Canada, the IEEPA / Section 122 documents, 19 U.S.C. 1466 and
1484b, 46 U.S.C. 55102, 55103 and 12112 (govinfo, 2024 edition), eCFR titles 19, 33, 40 and 46 (up to date as of
2026-10-08) and UN Comtrade.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FORBIDDEN_SOURCE  # noqa: E402,F401

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources89 import CH89, CH98, CH99, EXTRA  # noqa: E402

ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
SUGG_DATE = "October 13, 2026"

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = "Ships, Boats and Floating Structures"
d["asOf"] = ASOF

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(LINE) == 58, len(LINE)

ia = d["industryAreas"]
CTRY = {c["country"]: c for c in ia["countries"]}
ui = d["understandIndustry"]


# ------------------------------------------------------------------ helpers
def money(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e8:
        return f"${v / 1e6:.0f}M"
    if v >= 1e6:
        return f"${v / 1e6:.1f}M"
    return f"${v / 1e3:.0f}K"


TOTAL = ui["byYear"][-1]["totalUsd"]
PRIOR = ui["byYear"][-2]["totalUsd"]
assert ui["latestYear"] == 2025
HC = {}
for x in ui["byHeadingCountry"]:
    HC.setdefault(x["heading"], {})[x["country"]] = x["importsUsd"]
HEAD = {h: sum(v.values()) for h, v in HC.items()}
BYC = {c["country"]: c for c in ui["byCountry"]}
BYL = {x["hs6"]: x for x in ui["byLine"]}
share = lambda v: f"{100 * v / TOTAL:.0f}%"  # noqa: E731

# Line sets checked against the Chapter 99 notes (Rev 21) and the engine output.
CA12 = {h for h in LINE if h[:10] in ("8903.31.00", "8903.32.00", "8903.93.20")}  # note 51(b)(1), from 2026-09-15
CA14_0822 = {h for h in LINE if h[:10] in ("8905.90.10", "8906.90.00", "8907.90.00")}  # note 51(b)(3), from 2026-08-22
CA14_0915 = {h for h in LINE if h[:10] == "8903.99.21"}  # note 51(b)(3), from 2026-09-15
assert (len(CA12), len(CA14_0822), len(CA14_0915)) == (11, 6, 3)
L1 = {h for h in LINE if h[:10] in ("8901.10.00", "8901.20.00", "8901.90.00", "8902.00.00", "8904.00.00", "8905.10.00", "8905.20.00", "8905.90.50", "8906.90.00", "8908.00.00")}
L2 = {h for h in LINE if h.startswith("8901.30")}
L4A = {h for h in LINE if h[:10] in ("8906.10.00", "8907.90.00")}
L3 = {h for h in LINE if h.startswith("8903") or h.startswith("8907.10")}
NOLIST = set(LINE) - L1 - L2 - L3 - L4A
assert (len(L1), len(L2), len(L3), len(L4A)) == (11, 1, 41, 4), (len(L1), len(L2), len(L3), len(L4A))
assert NOLIST == {"8905.90.10.00"}, NOLIST
RU35 = {h for h in LINE if h[:10] in ("8903.11.00", "8903.12.00", "8903.19.00", "8903.31.00", "8903.32.00", "8903.33.00", "8903.93.90", "8903.99.91")}
assert len(RU35) == 18

# cross-check the Canada sets against the engine's matrix
ca = CTRY["Canada"]
eng338 = set()
for cell in ca["cells"].values():
    for b in cell["withUsmca"]["breakdown"]:
        if "50%" in b["total"] or "50%" in b["extra"]:
            eng338.update(b["lines"])
assert eng338 == CA12 | CA14_0822 | CA14_0915, sorted(eng338 ^ (CA12 | CA14_0822 | CA14_0915))

# ------------------------------------------------------------------ top-level sources
d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows, Chapter 89 note and additional U.S. note (2026 Revision 21)"},
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": "2020–2025 import figures"},
]

# ------------------------------------------------------------------ overview
ov = d["overview"]
ov["seo"] = {
    "title": "HTS Chapter 89 Boat & Yacht Tariffs: Ships, Boats and Floating Structures Import Duty Rates 2026 | KoalaGains",
    "shortDescription": "Searchable duty table for all 58 HTS Chapter 89 lines: yachts, motorboats, sailboats, inflatable boats, canoes and kayaks (1%–2.7%), "
    "and Free ships, tugs, dredgers, drilling platforms and buoys. Which origins pay the 2026 Section 301, China, Brazil and Canada Section 338 duties.",
    "keywords": [
        "hts chapter 89",
        "ships, boats and floating structures tariff",
        "ships, boats and floating structures import duty rates",
        "us tariffs on boats",
        "us tariffs on yachts",
        "boat import duty",
        "hs code 8903",
        "hts 8901 cargo ships",
        "china section 301 duties on marine vessels",
        "italian recreational boat import duty",
        "cruise ship import duty",
    ],
}
ov["intro"] = (
    "Chapter 89 covers every kind of vessel: cruise ships, ferries, tankers and cargo ships (8901), fishing vessels (8902), yachts, motorboats, sailboats, "
    "inflatable boats, canoes and kayaks (8903), tugs (8904), dredgers, floating cranes, floating docks and drilling or production platforms (8905), "
    "warships, lifeboats and hulls (8906), rafts, buoys and other floating structures (8907) and vessels for scrapping (8908). "
    f"The U.S. imported **{money(TOTAL)}** of them in 2025, and **{share(HEAD['8903'])} were pleasure boats** (heading 8903).\n\n"
    "Base rates are low. Every ship, tug, platform and floating structure is **Free**; pleasure boats pay **1% to 2.7%** (canoes and kayaks Free), and most FTA partners pay nothing. "
    "The extra duties are what matter. Boats from the **60 Section 301 economies** pay 10% or 12.5% on top (for the EU, Japan, South Korea and Taiwan the total is 10% or 12.5% "
    "in place of the base rate), unless Canadian or Mexican goods qualify for USMCA. **China** pays 25% under List 1, 2 or 3 (7.5% for warships and buoys under List 4A) plus 12.5%, "
    "**Brazil** 25% plus 12.5%, and **Canadian motorboats, outboard boats, floating docks, hulls, buoys and tanks** pay a **50% Section 338 duty** even with a USMCA claim.\n\n"
    "Two maritime rules sit outside the rate table. U.S.-flag ships repaired abroad owe **50% of the foreign repair cost** (19 U.S.C. 1466, heading 9818.00.07), and a foreign-built "
    "vessel can never carry cargo or passengers between U.S. ports (the **Jones Act**, 46 U.S.C. 55102). USTR's **port fees on Chinese-operated and Chinese-built ships** are a "
    "charge on vessel calls, not an import duty, and are suspended until November 9, 2026. No Section 232 or antidumping duty covers Chapter 89 goods."
)
ov["stats"] = [s for s in ov["stats"] if s["label"] in ("Tariff lines", "Lines with a base-rate duty")]
ov["stats"][1]["note"] = "All in 8903 (pleasure boats); ships and floating structures are Free"
ov["stats"] += [
    {"label": "Extra duty for some origins", "value": "58 of 58", "note": "2026 Section 301 and Brazil: all 58; China lists: 57; Canada Section 338: 20; Russia 35%: 18. USMCA goods are exempt from the 2026 Section 301 duty, not from Section 338."},
    {"label": "2025 imports", "value": money(TOTAL)},
    {"label": "Pleasure boats (8903)", "value": share(HEAD["8903"]), "note": "of 2025 imports"},
]

G = {
    "8901": (
        "Cruise ships, ferries, tankers, refrigerated and cargo ships and barges: 4 lines, all Free (column 2 Free too). U.S. imports are tiny ($2.1M in 2025): ships in international "
        "trade enter without a formal entry (additional U.S. note 1), and foreign-built ships cannot carry cargo or passengers between U.S. ports. China pays 37.5% (List 1 or 2 plus 12.5%).",
        ["cruise ship", "ferry", "tanker", "bulk carrier", "container ship", "cargo barge", "reefer vessel", "deck barge"],
    ),
    "8902": (
        "Fishing vessels and factory ships: one line, Free. From the 60 Section 301 economies 10% or 12.5%, from China 37.5% (List 1), from Brazil 37.5%. 2025 imports were $1.3M, mostly from Canada.",
        ["fishing boat", "fishing vessel", "trawler", "factory ship", "lobster boat", "seiner"],
    ),
    "8903": (
        "Yachts and pleasure boats: inflatable and rigid hull inflatable boats (2.4%), sailboats and motorboats by length (1.5%), outboard motorboats (1%), canoes and kayaks (Free) and "
        "other row boats (2.7%). 40 lines, Free under most FTAs. The 2026 Section 301 duty makes most of them 10% to 15.2%; China and Brazil pay 37.5%–40.2%, and "
        "Canadian cabin cruisers, motorboats and outboard boats 50% even with USMCA.",
        ["yacht", "motor yacht", "sailboat", "cabin cruiser", "pontoon boat", "bass boat", "RIB", "inflatable boat", "dinghy", "kayak", "canoe", "jet boat", "outboard motorboat"],
    ),
    "8904": (
        "Tugs and pusher craft: one line, Free. 10% or 12.5% from the 60 Section 301 economies, 37.5% from China (List 1). $0.3M of imports in 2025.",
        ["tugboat", "tug", "push boat", "towboat", "pusher craft"],
    ),
    "8905": (
        "Vessels whose navigability is secondary: dredgers, floating or submersible drilling and production platforms (FPSO hulls, semi-submersibles), floating cranes, fire-floats, "
        "light-vessels and floating docks. 4 lines, Free (floating docks 35% in column 2). Imports jumped to $407M in 2025, led by $275M of floating platforms from South Korea (12.5%). "
        "Canadian floating docks pay 50% under Section 338.",
        ["dredger", "drilling platform", "FPSO", "jack-up rig", "semi-submersible", "floating crane", "floating dock", "fireboat"],
    ),
    "8906": (
        "Warships and other vessels, including lifeboats and unfinished hulls (chapter note 1 sends a hull without the character of a particular vessel here): 3 lines, Free. "
        "China pays 20% on warships (List 4A) and 37.5% on other vessels; Canadian hulls and other vessels pay 50% under Section 338.",
        ["warship", "lifeboat", "boat hull", "hull", "patrol boat", "research vessel", "pilot boat"],
    ),
    "8907": (
        "Floating structures: inflatable life rafts, buoys, floating tanks, cofferdams, landing stages and pontoons. 4 lines, Free (45% in column 2). China pays 37.5% on rafts "
        "and 20% on buoys and tanks (List 4A); Canadian buoys and other floating structures pay 50% under Section 338.",
        ["life raft", "inflatable raft", "buoy", "mooring buoy", "floating dock pontoon", "landing stage", "floating tank", "swim platform raft"],
    ),
    "8908": (
        "Vessels and floating structures for breaking up (scrapping): one line, Free. China pays 37.5% (List 1). $35K of imports in 2025.",
        ["ship for scrap", "ship breaking", "vessel for scrapping", "hulk"],
    ),
}
SHORT = {
    "8901": "Cruise ships, ferries, tankers and cargo ships",
    "8902": "Fishing vessels and factory ships",
    "8903": "Yachts and pleasure boats",
    "8904": "Tugs and pusher craft",
    "8905": "Dredgers, platforms, floating cranes and docks",
    "8906": "Warships, lifeboats and hulls",
    "8907": "Rafts, buoys and floating structures",
    "8908": "Vessels for scrapping",
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = G[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "$1M motor yacht from Italy",
        "line": "8903.33.00.15",
        "body": "A cabin cruiser over 24 m pays a **1.5%** base rate. Italy is an EU member, so the 2026 Section 301 heading 9903.05.39 sets the total at **10%** whenever the base rate "
        "is below 10% (U.S. note 52(k)): **$100,000**. No Chapter 89 line is on the note 52(b) exemption list. From April 5, 2025 to February 23, 2026 it paid the IEEPA "
        "reciprocal tariff instead (15% all-inclusive for the EU from August 7, 2025).",
    },
    {
        "title": "$250,000 motorboat from Mexico",
        "line": "8903.32.00.15",
        "body": "A 7.5–24 m cabin cruiser pays **1.5%**, Free with a USMCA claim (SPI S). The 10% Section 301 duty on Mexico (9903.05.55) does not apply to USMCA goods (note 52(h), "
        "9903.05.94), so the duty is **$0**. Without a USMCA claim it is 1.5% + 10% = **11.5%**: $28,750. Mexico was the largest supplier of pleasure boats in 2025 ($497M).",
    },
    {
        "title": "$250,000 cabin cruiser from Canada",
        "line": "8903.32.00.15",
        "body": "Since September 15, 2026, Canadian motorboats of 8903.31, 8903.32 and 8903.93.20 are on the Section 338 list in U.S. note 51(b)(1) (9903.03.12, Proclamation 11064). "
        "Note 51(a) charges the **50%** even when USMCA is claimed: **$125,000** with a USMCA claim. Without one, the 1.5% base rate and the 10% Section 301 duty (9903.05.29) are "
        "added: **61.5%**, $153,750. Canadian sailboats and inflatable boats are not on the list (Free with USMCA).",
    },
    {
        "title": "$40,000 fiberglass outboard boat from China",
        "line": "8903.93.20.45",
        "body": "An outboard motorboat of reinforced plastics, 5 m or shorter, pays **1%**, plus **25%** under List 3 (9903.88.03) and **12.5%** under the 2026 Section 301 action on China "
        "(9903.05.31): **38.5%**, $15,400. No product exclusion for Chapter 89 is in effect (the 2019–2020 exclusions for kayaks, canoes and inflatable boats have expired). "
        "The 2025 IEEPA duties on China ended February 24, 2026.",
    },
    {
        "title": "$100M floating production platform from South Korea",
        "line": "8905.20.00.00",
        "body": "Floating or submersible drilling and production platforms are **Free**. Korea is one of the partners (with the EU, Japan, Switzerland and Taiwan) whose 2026 Section 301 heading (9903.05.71) sets a floor: "
        "goods with a base rate below 12.5% pay **12.5%** in total, so the duty is **$12.5M**. The KORUS FTA rate (Free) does not lower it. In 2025 Korea shipped $275M of 8905 "
        "goods, the largest single flow outside pleasure boats.",
    },
    {
        "title": "$2M of shipyard repairs abroad on a U.S.-flag cargo ship",
        "line": "8901.90.00.00",
        "body": "This is not an import of the ship. A vessel documented under U.S. law for foreign or coastwise trade owes **50% of the foreign cost** of equipment and repairs on its first "
        "U.S. arrival (19 U.S.C. 1466; heading 9818.00.07, declared on CBP Form 226): **$1M** for repairs in, say, a Chinese yard. Repairs in Canada, Mexico or Israel and "
        "FTA partners listed in the special column (for example Korea or Singapore) are free, and crew labor and emergency repairs are excluded (19 CFR 4.14).",
    },
]

snap = ov["tradeSnapshot"]
snap["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
snap["source"] = "UN Comtrade, United States imports, HS chapter 89 (2025)"
snap["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
LBL = {
    "8903.32": "Motorboats (not outboard), 7.5–24 m",
    "8903.93": "Other pleasure boats (outboard boats, kayaks, canoes), up to 7.5 m",
}
for b in snap["biggestLines"]:
    b["label"] = LBL.get(b["hts"], b["label"])

ov["notes"] = {
    "chapterNotes": "**Note 1.** A hull, an unfinished or incomplete vessel, assembled, unassembled or disassembled, or a complete vessel unassembled or disassembled, is to be "
    "classified in heading 8906 if it does not have the essential character of a vessel of a particular kind.",
    "additionalUsNotes": "**Additional U.S. Note 1.** Vessels if in use in international trade or commerce or if brought into the customs territory of the United States by "
    "nonresidents thereof for their own use in pleasure cruising shall be admitted without formal customs consumption entry or the payment of duty.",
}

# ------------------------------------------------------------------ tariffUpdates
tu = d["tariffUpdates"]
src = {x["id"]: x for x in tu["sources"]}
for x in EXTRA:
    src[x["id"]] = x
src["hts-chapter-99"]["url"] = CH99


def need(*ids):
    for i in ids:
        assert i in src, i


tu["seo"] = {
    "title": "Boat & Ship Tariff Updates 2025–2026: Section 301, Canada Section 338, China Port Fees (HTS Ch. 89) | KoalaGains",
    "shortDescription": "What changed for imported yachts, boats and ships since January 2025: the IEEPA duties and their end, the Section 122 surcharge, the 2026 Section 301 and Brazil duties, "
    "Canada's 50% Section 338 duty on motorboats, and USTR's suspended port fees on Chinese ships, with Federal Register citations.",
    "keywords": [
        "boat tariffs 2026",
        "us tariffs on boats",
        "us tariffs on yachts",
        "2026 maritime tariff updates",
        "port fees on chinese ships",
        "section 301 ship fees",
        "us suspends port fees on chinese ships",
        "canada boat tariffs",
        "uk luxury yacht import duties",
        "mexico tariff on ships, boats and floating structures",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current **2026 Revision 21** "
    "(in force October 9, 2026), and lists every extra duty that reaches Chapter 89 today. **No base rate changed**: all 58 lines carry the same rates.\n\n"
    "The extra duties changed a lot. In 2025 non-USMCA boats from Canada and Mexico paid IEEPA duties, boats from almost every other country paid the reciprocal tariff "
    "(no Chapter 89 line was on its exemption list), and Brazil paid another 40%. All IEEPA duties **ended on February 24, 2026**; the 10% Section 122 surcharge that "
    "replaced them expired on **July 23, 2026**.\n\n"
    "Today five measures apply: the **2026 Section 301 duties** on 60 economies (from July 24, 2026), **Brazil's 25% Section 301 duty** (from July 22, 2026), "
    "**Section 338 at 50%** on Canadian floating docks, hulls, buoys and tanks (from August 22, 2026) and motorboats and outboard boats (from September 15, 2026), "
    "China's **Section 301 List 1–4A duties**, and Russia's **35%** in place of column 2. USTR's **maritime Section 301 action** (port fees on Chinese-operated and Chinese-built "
    "ships, 100% on Chinese ship-to-shore cranes and chassis) is suspended until November 9, 2026 and never charged a duty on Chapter 89 goods."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 89 from any country: China Section 301 (note 20; the 2024 increases in note 31 list no Chapter 89 line), the 2026 Section 301 actions "
    "on 60 economies and Brazil (notes 50, 52), Canada Section 338 (note 51), Russia's rate in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note 29), and "
    "the ended IEEPA and Section 122 duties. Also covered for reference: the maritime Section 301 action against China (port fees and crane and chassis duties), the 50% vessel "
    "repair duty (Chapter 98 subchapter XVIII) and the Jones Act. No Section 232 action and no antidumping or countervailing duty order covers Chapter 89 goods. "
    "For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "58 of 58 lines", "note": "Free to 2.7%"},
    {"label": "Extra-duty programs in effect", "value": "5", "note": "2026 Section 301, Brazil 301, China lists, Canada Section 338, Russia 35%"},
    {"label": "Canadian motorboats", "value": "50%", "note": "Section 338, even with USMCA (61.5% without)"},
    {"label": "Port fees on Chinese ships", "value": "Suspended", "note": "To November 9, 2026; a vessel charge, not an import duty"},
]

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
need(*S301, "procl-11046", "procl-11064", "procl-11048", "procl-11056", "procl-11065", "csms-69606660", "csms-69851916", "fr-2026-14542", "procl-10420", "procl-10523", "fr-2026-20510",
     "fr-2018-17709", "fr-2018-13248", "fr-2018-20610", "fr-2019-09681", "fr-2020-00904", "fr-2019-17865", "fr-2024-21217")
gen_ie = {e["id"]: e for e in tu["inEffect"]}


def ie(id, country, measure, code, before, now, exemption, means, eff, effsrc, ids):
    need(*ids)
    assert effsrc in ids
    return dict(id=id, country=country, measure=measure, ch99Code=code, before=before, now=now, exemption=exemption, whatItMeans=means, effectiveFrom=eff, effectiveSourceId=effsrc, sourceIds=ids)


def from_gen(gid, exemption, means, **over):
    e = dict(gen_ie[gid])
    e["exemption"], e["whatItMeans"] = exemption, means
    e.update(over)
    return e


ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO52 = "No Chapter 89 line is on the general exemption list in U.S. note 52(b) or on any country exception list in note 52(j)."
other = gen_ie["other-section-301"]
tu["inEffect"] = [
    ie("ca-section-338", "Canada", "Section 338 (Proclamations 11046 and 11048, as modified by 11064 and 11065)", "9903.03.12 / 9903.03.14", "None",
       "+50% on 20 lines (motorboats, outboard boats, floating docks, hulls and other vessels, buoys and tanks)",
       "Note 51(b)(1) (9903.03.12) lists motorboats of 8903.31 and 8903.32 and outboard motorboats of 8903.93.20 (from September 15, 2026); note 51(b)(3) (9903.03.14) lists "
       "floating docks (8905.90.10), other vessels and hulls (8906.90.00) and buoys, tanks and other floating structures (8907.90.00) from August 22, 2026, and outboard boats over "
       "7.5 m (8903.99.21) from September 15, 2026. Note 51(a) applies the 50% even when USMCA or another special rate is claimed, and on top of any other Chapter 99 duty. "
       "Canadian sailboats, inflatable boats, canoes, ships, tugs and fishing vessels are not listed. It does not apply to goods properly entered under most Chapter 98 provisions.",
       "Canadian cabin cruisers, runabouts and outboard boats pay half their value in duty: $125,000 on a $250,000 boat with a USMCA claim, $153,750 (61.5%) without. "
       "Canada shipped $165M of pleasure boats and $10M of 8905 goods to the U.S. in 2025.",
       "2026-09-15", "procl-11064",
       ["procl-11064", "procl-11046", "procl-11065", "procl-11048", "procl-11056", "csms-69606660", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ie("ca-section-301", "Canada", "Section 301 (2026, 60 economies)", "9903.05.29", "None", "+10% (USMCA goods exempt)",
       f"Goods entered free under USMCA are exempt (note 52(g), 9903.05.93). {NO52} {ENDED}",
       "Canadian boats and vessels pay 10% on top of the base rate only without a USMCA claim; with one, only the Section 338 lines pay anything.",
       "2026-07-24", "fr-2026-15181", S301),
    from_gen("mx-section-301",
             f"Goods entered free under USMCA are exempt (note 52(h), 9903.05.94). {NO52} {ENDED}",
             "Mexican boats that qualify for USMCA enter Free; others pay the base rate plus 10% (10% to 12.7% on pleasure boats). Mexico supplied $539M of Chapter 89 goods in 2025, "
             "92% of it pleasure boats.",
             now="+10% (USMCA goods exempt)"),
    ie("cn-section-301-lists", "China", "Section 301 (China, Lists 1, 2, 3 and 4A)", "9903.88.01 / 9903.88.02 / 9903.88.03 / 9903.88.15", "+25% or +7.5%", "+25% or +7.5%",
       "List 1 (note 20(b), 9903.88.01) covers ships, fishing vessels, tugs, dredgers, platforms, other vessels and vessels for scrapping (11 lines); List 2 (9903.88.02) refrigerated "
       "vessels; List 3 (note 20(f), 9903.88.03) every pleasure boat line and inflatable rafts (41 lines); List 4A (note 20(r), 9903.88.15, 7.5%) warships and buoys and tanks "
       "(8906.10, 8907.90). Floating docks (8905.90.10) are only on the suspended List 4B. The product exclusions that covered some kayaks, canoes, inflatable boats and motorboats "
       "(notes 20(p), (nn), (qq), (aaa)) have expired, and none of the exclusions extended to November 9, 2026 covers Chapter 89. The 2024 four-year-review increases (note 31) list "
       "no Chapter 89 line. USTR continued the actions on October 7, 2026 pending the statutory review.",
       "Chinese boats pay 25% on top of the base rate, and Chinese warships and buoys 7.5%, before the 12.5% 2026 Section 301 duty is added.",
       "2020-02-14", "fr-2020-00904",
       ["fr-2018-13248", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2024-21217", "hts-chapter-99", "hts-now"]),
    ie("cn-section-301-2026", "China", "Section 301 (2026, 60 economies)", "9903.05.31", "None", "+12.5%",
       f"{NO52} It stacks on the List 1–4A duties. The IEEPA duties on China (fentanyl 10% to 20% and the reciprocal 10% to 125%) ended February 24, 2026.",
       "Totals from China: 37.5% on Free ships, tugs, platforms and rafts, 38.5% to 40.2% on pleasure boats, 20% on warships, buoys and tanks, 12.5% on floating docks.",
       "2026-07-24", "fr-2026-15181", S301),
    from_gen("eu-section-301",
             f"Heading 9903.05.39 sets the total (base rate plus Section 301) at 10% whenever the base rate is below 10% (note 52(k)), which is every Chapter 89 line. {NO52} "
             "The EU's 15% all-inclusive IEEPA reciprocal rate ended February 24, 2026.",
             "Every boat, ship and floating structure from an EU member pays exactly 10% of its value: Italian, French, German, Finnish, Polish and Dutch yachts included."),
    from_gen("gb-section-301", f"{NO52} {ENDED}",
             "British boats pay the base rate plus 10%: 11.5% on sailboats and motorboats, 12.4% on inflatable boats, 10% on ships and floating structures."),
    from_gen("jp-section-301", f"Heading 9903.05.49 sets the total at 12.5% whenever the base rate is below 12.5% (note 52(k)). {NO52} {ENDED}",
             "Every Chapter 89 good from Japan pays 12.5% in total."),
    from_gen("kr-section-301",
             f"Heading 9903.05.71 sets the total at 12.5% whenever the base rate is below 12.5% (note 52(k)); a KORUS claim (Free) does not lower it. {NO52} {ENDED}",
             "Every Chapter 89 good from South Korea pays 12.5%, including the floating platforms (8905) that made Korea the third-largest supplier in 2025."),
    from_gen("tw-section-301", f"Heading 9903.05.76 sets the total at 10% whenever the base rate is below 10% (note 52(k)). {NO52} {ENDED}",
             "Taiwanese yachts and boats pay 10% in total. (UN Comtrade reports Taiwan as \"Other Asia, nes\".)"),
    from_gen("vn-section-301", f"{NO52} {ENDED}", "Vietnamese boats pay the base rate plus 12.5% (12.5% to 15.2%)."),
    ie("br-section-301", "Brazil", "Section 301 (Brazil) + Section 301 (2026, 60 economies)", "9903.05.01 / 9903.05.27", "None", "+37.5%",
       "No Chapter 89 line is on the Brazil exemption list in note 50(a)(ii) (9903.05.03), on the note 52(b) list or on Brazil's note 52(j) list, so both duties reach every line. "
       "Brazil's 40% IEEPA duty and the reciprocal tariff ended February 24, 2026.",
       "Brazilian vessels pay 37.5% on top of the base rate (37.5% to 40.2%).",
       "2026-07-24", "fr-2026-15181", ["fr-2026-14542", "fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    from_gen("au-section-301", f"An AUSFTA claim (SPI AU) makes the base rate Free, but the Section 301 duty still applies (note 52(a)). {NO52} {ENDED}",
             "Australian boats pay 12.5% with an AUSFTA claim, 13.5% to 15.2% without. Australia shipped $107M of Chapter 89 goods in 2025."),
    from_gen("za-section-301", f"An AGOA claim (SPI D, in force through December 31, 2026) makes the base rate Free, but the Section 301 duty still applies (note 52(a)). {NO52} {ENDED}",
             "South African pleasure boats ($68M in 2025, nearly all of South Africa's Chapter 89 trade) pay 12.5% with an AGOA claim, 13.5% to 15.2% without.",
             sourceIds=gen_ie["za-section-301"]["sourceIds"] + ["ustr-agoa-2026", "procl-11030"]),
    from_gen("tr-section-301", f"{NO52} {ENDED}",
             "Turkish yachts pay 13.5% to 15.2%; Turkish vessels of 8905 ($97M in 2025) pay 12.5%."),
    ie("ru-rates", "Russia", "Russia: 35% in place of column 2 + Section 301 (2026, 60 economies)", "9903.90.08 / 9903.05.66", "35% (in place of column 2)",
       "35% (in place of column 2) on 18 lines; column 2 elsewhere; + 12.5%",
       "Russia's normal trade relations were suspended in 2022, so Russian goods pay the column 2 rate (Free for ships and most vessels, 25% to 45% for boats, floating docks and "
       "rafts). Note 30(b) (9903.90.08) replaces it with 35% on inflatable boats and motorboats of 8903.11–8903.19, 8903.31–8903.33, 8903.93.90 and 8903.99.91. "
       "The 12.5% 2026 Section 301 duty is added on every line.",
       "A Russian motorboat pays 47.5%; Russian ships and tugs pay 12.5%.",
       "2026-07-24", "fr-2026-15181", ["procl-10420", "procl-10523", "fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    dict(other, exemption=f"Rates are 10% or 12.5% by country (India 10%, Norway and Nigeria 12.5%, for example; Switzerland 12.5% in total under note 52(k)). {NO52} "
         "An FTA or AGOA claim removes the base rate but not the Section 301 duty (note 52(a)). Countries outside the 60 pay only the base rate.",
         whatItMeans="A boat from one of these economies pays its base rate plus 10% or 12.5%: 10% to 15.2% for pleasure boats, 10% or 12.5% for ships and floating structures."),
]

need("fr-2025-22690", "fr-2025-23892", "hts-now-cr", "hts-before")


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    need(*ids)
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


base = next(c for c in tu["changes"] if c["id"] == "base-rates")
base["title"] = "No Chapter 89 base-rate changes"
base["detail"] = (
    "All 58 Chapter 89 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; no line was added, removed or renumbered. "
    "Pleasure boats stay at 1% to 2.7% (canoes and kayaks Free) and every ship, tug, platform and floating structure stays Free."
)
nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every "
    "Chapter 89 line. The rate is 0% in 2026."
)

changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their 2026 anniversaries and remain in effect pending the statutory review. "
       "The 25% List 1, 2 and 3 duties and the 7.5% List 4A duty on Chinese vessels and boats continue.",
       None, None, "China", ["fr-2026-20510"]),
    ch("s338-boats", "extraDuty", "2026-09-15", "Effective", "Section 338: 50% on Canadian motorboats and outboard boats",
       "Proclamation 11064 added motorboats of 8903.31 and 8903.32 and outboard motorboats of 8903.93.20 to the Section 338 list for Canada in U.S. note 51(b)(1) (9903.03.12), "
       "and Proclamation 11065 added outboard motorboats over 7.5 m (8903.99.21) to note 51(b)(3) (9903.03.14). The 50% applies even when USMCA is claimed.",
       "None", "+50% (14 lines)", "Canada", ["procl-11064", "procl-11065", "csms-69851916", "hts-chapter-99"]),
    ch("s338-vessels", "extraDuty", "2026-08-22", "Effective", "Section 338: 50% on Canadian floating docks, hulls, buoys and tanks",
       "Proclamation 11048 (July 20, 2026) imposed a 50% duty on products of Canada in the list of U.S. note 51(b)(3) (9903.03.14), including floating docks (8905.90.10), "
       "other vessels and hulls (8906.90.00) and buoys, tanks and other floating structures (8907.90.00). Proclamation 11056 moved the start from August 19 to August 22, 2026. "
       "The duty applies even when USMCA is claimed.",
       "None", "+50% (6 lines)", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99"]),
    ch("section-301-2026-60-economies-2026-07-24", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 duties on 60 economies reach every Chapter 89 line",
       "The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect. No Chapter 89 line is on the general exemption list (note 52(b)) or a country list "
       "(note 52(j)). For the EU and Taiwan the total is 10%, and for Japan and South Korea 12.5%, in place of lower base rates (note 52(k)). Canadian and Mexican goods entered "
       "under USMCA are exempt (notes 52(g)–(h)).",
       None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 150-day 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026.", "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("section-301-brazil-2026-07-22", "extraDuty", "2026-07-22", "Effective", "Brazil Section 301: 25% on every Chapter 89 line",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. No Chapter 89 line is on its exemption list (U.S. note 50(a)(ii), 9903.05.03).",
       "None", "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, "
       "so USMCA claims (SPI S) on boats still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Canadian and Mexican goods entered under USMCA were exempt (9903.03.07, 9903.03.08); "
       "no Chapter 89 line was on its product exemption list.",
       "Varied by country", "+10% (USMCA goods exempt)", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, "
       "China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025, and Proclamation 11030 implemented it in the HTS. AGOA (SPI D) makes "
       "every dutiable pleasure-boat line Free for eligible sub-Saharan countries; South Africa and Nigeria still pay the 12.5% 2026 Section 301 duty.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries", ["ustr-agoa-2026", "procl-11030", "hts-now"]),
    ch("maritime-301-suspended", "pending", "2025-11-13", "Published", "Maritime Section 301 action suspended until November 9, 2026",
       "Following the November 1, 2025 U.S.-China deal, USTR suspended every action in the investigation of China's targeting of the maritime, logistics and shipbuilding sectors "
       "from 12:01 a.m. EST on November 10, 2025 through 11:59 p.m. EST on November 9, 2026: the port fees on Chinese operators and owners and on Chinese-built ships, the fees on "
       "foreign-built vehicle carriers, and the 100% duties on Chinese ship-to-shore cranes (8426.19) and intermodal chassis (8716.39, 8716.90), whose Chapter 99 headings "
       "(9903.91.12–9903.91.16) now read \"on or after November 10, 2026\". None of these is a duty on Chapter 89 goods.",
       "Port fees from October 14, 2025", "Suspended to November 9, 2026", "China", ["fr-2025-19873", "hts-chapter-99"]),
    ch("ieepa-china-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl-related IEEPA duty cut to 10%",
       "Executive Order 14357 cut the IEEPA duty on products of China from 20% to 10%. Chinese boats were also paying the 10% reciprocal duty and the Section 301 lists. "
       "Ended February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("maritime-301-oct", "reference", "2025-10-16", "Published", "Maritime Section 301 modified: 100% on Chinese cranes and chassis",
       "USTR changed the vehicle-carrier fee and imposed 100% duties on ship-to-shore cranes and on Chinese intermodal chassis and parts from November 9, 2025 (then suspended). "
       "No Chapter 89 line was included.",
       None, None, "China", ["fr-2025-19568"]),
    ch("maritime-fees-start", "reference", "2025-10-14", "Effective", "USTR port fees on Chinese ships start (then suspended)",
       "The first non-zero Section 301 service fees took effect: $50 per net ton for vessels with a Chinese operator or owner (Annex I) and, for other operators of Chinese-built "
       "vessels, the higher of $18 per net ton or $120 per container discharged (Annex II), charged up to five times a year per vessel and paid to CBP. They are fees on vessel "
       "calls, not import duties on the vessels or their cargo. Suspended from November 10, 2025.",
       "$0", "$50/net ton (Chinese operators); $18/net ton or $120/container (Chinese-built)", "China", ["fr-2025-06927", "fr-2025-19873"]),
    ch("reciprocal-country-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates take effect",
       "Executive Order 14326 replaced the 10% baseline with country-specific reciprocal rates for many partners (for example 15% for the EU, all-inclusive). Chapter 89 boats and "
       "vessels paid them until February 24, 2026.",
       "+10%", "Country rates (ended)", "All except Canada, Mexico", ["eo-14326"]),
    ch("brazil-ieepa-40", "extraDuty", "2025-08-06", "Effective", "Brazil: 40% IEEPA duty",
       "Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77). No Chapter 89 line was on its exception list, so Brazilian boats and vessels paid it on top of "
       "the reciprocal tariff. Ended February 24, 2026.",
       "None", "+40% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods, including boats, from 25% to 35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("cn-ieepa", "extraDuty", "2025-05-14", "Effective", "China IEEPA reciprocal rate cut to 10%",
       "Chinese boats paid IEEPA duties on top of the Section 301 lists: a fentanyl-related 10% from February 4, 2025 (20% from March 4) and a reciprocal duty that rose to 125% "
       "in April 2025 and was cut to 10% from May 14, 2025. All ended February 24, 2026.",
       "+125% reciprocal", "+10% reciprocal (ended)", "China", ["eo-14195", "eo-14228", "eo-14259", "eo-14266", "eo-14298"]),
    ch("maritime-301-action", "reference", "2025-04-23", "Published", "USTR announces port fees on Chinese-operated and Chinese-built ships",
       "USTR's action (effective April 17, 2025) set service fees charged per U.S. voyage on vessels with Chinese operators or owners and on Chinese-built vessels, rising each "
       "April through 2028, a fee on foreign-built vehicle carriers and a phased requirement to carry part of U.S. LNG exports on U.S.-built ships, and proposed duties on cranes "
       "and cargo-handling equipment. It placed no duty on the import of vessels.",
       None, None, "China", ["fr-2025-06927"]),
    ch("eo-14269", "reference", "2025-04-09", "Signed", "Executive Order 14269: Restoring America's Maritime Dominance",
       "Directed a maritime action plan and told USTR to consider duties on Chinese ship-to-shore cranes and cargo-handling equipment in the Section 301 maritime investigation.",
       None, None, "All", ["eo-14269"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff covers boats and vessels",
       "10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025. No Chapter 89 line was on the Annex II exemption list. "
       "Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("usmca-exempt", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA boats kept paying. Ended February 24, 2026.",
       "+25%", "+25%, USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including boats and vessels. Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
    ch("maritime-301-determination", "reference", "2025-01-23", "Published", "USTR finds China's maritime targeting actionable",
       "USTR determined under Section 301 that China's targeting of the maritime, logistics and shipbuilding sectors for dominance is unreasonable and burdens U.S. commerce, "
       "opening the way for the 2025 port-fee action.",
       None, None, "China", ["fr-2025-01540"]),
    ch("cn-301-2024", "reference", "2024-09-27", "Effective", "China four-year review increases skip Chapter 89",
       "USTR's four-year review raised Section 301 duties on Chinese ship-to-shore cranes, EVs, semiconductors, steel and other products (U.S. note 31). No Chapter 89 line is "
       "listed, so Chinese boats and vessels stayed at their List 1–4A rates.",
       None, None, "China", ["fr-2024-21217"]),
]
changes.append(nic)
changes.sort(key=lambda c: c["date"], reverse=True)
# base-rates "Checked" today stays first
changes.remove(base)
changes.insert(0, base)
tu["changes"] = changes

used = set()
for e in tu["inEffect"]:
    used.update(e["sourceIds"])
for c in tu["changes"]:
    used.update(c["sourceIds"])
order = [x["id"] for x in tu["sources"]] + [x["id"] for x in EXTRA if x["id"] not in {y["id"] for y in tu["sources"]}]
tu["sources"] = [src[i] for i in order if i in used or i in ("hts-now", "hts-before", "hts-now-cr", "hts-chapter-99")]

# ------------------------------------------------------------------ understandIndustry
ui["h1"] = "HTS Chapter 89: Ships, Boats and Floating Structures — U.S. Import Statistics"
ui["seo"] = {
    "title": "U.S. Boat & Yacht Imports by Country: Mexico, Italy, Korea, Canada (HTS Ch. 89) | KoalaGains",
    "shortDescription": f"Where U.S. imports of yachts, boats, ships and floating structures come from, 2020–2025: {money(TOTAL)} in 2025, {share(HEAD['8903'])} pleasure boats, "
    "led by Mexico and Italy. By country, by product and over time, from UN Comtrade.",
    "keywords": [
        "us boat imports",
        "yacht imports by country",
        "boat imports from mexico",
        "italian yacht exports to us",
        "commercial bulk carrier import tariffs",
        "chapter 89 recreational yacht customs duty",
        "HTS Chapter 89 import statistics",
    ],
}
mx, it, kr = BYC["Mexico"], BYC["Italy"], BYC["Rep. of Korea"]
ui["why"] = (
    f"U.S. imports of Chapter 89 goods were **{money(TOTAL)} in 2025**, down {100 * (PRIOR - TOTAL) / PRIOR:.1f}% from {money(PRIOR)} in 2024 and well below the 2023 peak of "
    f"{money(ui['byYear'][3]['totalUsd'])}. **Pleasure boats (8903) were {money(HEAD['8903'])}, {share(HEAD['8903'])} of the total**: motorboats of 7.5–24 m alone (8903.32) were "
    f"{money(BYL['8903.32']['importsUsd'])}, down from {money(BYL['8903.32']['priorImportsUsd'])}, followed by small outboard boats, kayaks and canoes (8903.93, "
    f"{money(BYL['8903.93']['importsUsd'])}) and motorboats over 24 m (8903.33, {money(BYL['8903.33']['importsUsd'])}).\n\n"
    f"The two largest suppliers are **Mexico** ({money(mx['importsUsd'])}, {mx['sharePct']:.0f}%), almost all pleasure boats that enter Free under USMCA, and **Italy** "
    f"({money(it['importsUsd'])}, {it['sharePct']:.0f}%), almost all yachts. **South Korea** jumped to third ({money(kr['importsUsd'])}, from {money(kr['priorImportsUsd'])}) on one "
    f"category: floating or submersible drilling and production platforms (8905.20, {money(BYL['8905.20']['importsUsd'])} in 2025 against {money(BYL['8905.20']['priorImportsUsd'])} "
    f"in 2024). Canada, France, the UK, China, Germany and Finland follow with $130M–$194M each, mostly boats; Türkiye's {money(BYC['Türkiye']['importsUsd'])} is mainly "
    "8905 vessels. Merchant ships (8901) are almost absent at $2.1M: ships in international trade are not entered for consumption, and foreign-built ships cannot serve U.S. "
    "domestic routes under the Jones Act.\n\n"
    "2025 is the latest full year of U.S. trade data, so the 2026 Section 301 duties (from July 2026) and the Canada Section 338 duties (from August 2026) are not yet visible in "
    "these figures. Duty-collected figures aren't available from an official source yet."
)
ui["sources"] = ui["sources"] + [
    {"label": "HTSUS 2026 Revision 21, Chapter 89 (headings and additional U.S. note 1)", "url": CH89},
]

# ------------------------------------------------------------------ industryAreas
ia["seo"] = {
    "title": "Boat & Yacht Tariff Rates by Country: Italy, Mexico, Canada, China, UK, Korea (HTS Ch. 89) | KoalaGains",
    "shortDescription": "The total U.S. tariff on yachts, boats and vessels by country and product group: Free for USMCA boats from Mexico, 10% for the EU and Taiwan, 12.5% for "
    "Japan and Korea, 10%–15.2% for the UK and other Section 301 economies, 37.5%–40.2% for China and Brazil, and 50% for Canadian motorboats.",
    "keywords": [
        "united states yacht tariffs",
        "uk tariff on ships, boats and floating structures",
        "french yacht import duty",
        "taiwan tariff on boats",
        "chinese commercial vessel tariffs",
        "commercial bulk carrier duty",
        "offshore drilling platform classification",
        "boat tariffs canada",
    ],
}
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. Ships, tugs, "
    "platforms and floating structures are Free at base, so their totals are the extra duties alone; pleasure boats add a 1% to 2.7% base rate.\n\n"
    "The country decides almost everything. **Mexican** boats that qualify for USMCA are Free. **EU** and **Taiwanese** goods pay exactly **10%** and **Japanese** and **Korean** "
    "goods **12.5%** (the 2026 Section 301 rate replaces lower base rates). The **UK**, **India** and other Section 301 economies add 10% or 12.5% to the base rate, and an FTA or "
    "AGOA claim (Australia, South Africa) removes only the base rate. **China** pays 25% (7.5% on warships and buoys) plus 12.5%; **Brazil** 25% plus 12.5%. **Canadian** "
    "motorboats, outboard boats, floating docks, hulls, buoys and tanks pay **50%** under Section 338 with or without USMCA; other Canadian boats are Free with USMCA. "
    "The vessel repair duty, the Jones Act and USTR's suspended port fees are not tariffs on these goods and are not in the cells."
)

R = {
    "Canada": "USMCA goods: Free, except motorboats (8903.31, 8903.32), outboard boats (8903.93.20, 8903.99.21), floating docks (8905.90.10), hulls and other vessels (8906.90) "
    "and buoys and tanks (8907.90), which pay 50% Section 338 (9903.03.12, 9903.03.14) even with USMCA. Without USMCA, +10% Section 301 (9903.05.29) on every line. "
    "The 2025 IEEPA duty (35%) ended February 24, 2026.",
    "Mexico": "USMCA goods: Free (note 52(h), 9903.05.94). Without USMCA, base rate +10% Section 301 (9903.05.55). The 2025 IEEPA duty ended February 24, 2026.",
    "China": "Base rate +12.5% (9903.05.31) +25% List 1, 2 or 3 (9903.88.01–.03) on ships, boats and rafts, or +7.5% List 4A (9903.88.15) on warships, buoys and tanks; "
    "floating docks 12.5% only. No exclusion in effect. IEEPA duties ended February 24, 2026.",
    "Italy": "EU: 10% in total on every line (9903.05.39, note 52(k)), in place of the 1%–2.7% base rate. The 15% IEEPA reciprocal rate ended February 24, 2026.",
    "France": "EU: 10% in total on every line (9903.05.39, note 52(k)). The 15% IEEPA reciprocal rate ended February 24, 2026.",
    "Germany": "EU: 10% in total on every line (9903.05.39, note 52(k)). The 15% IEEPA reciprocal rate ended February 24, 2026.",
    "Finland": "EU: 10% in total on every line (9903.05.39, note 52(k)). The 15% IEEPA reciprocal rate ended February 24, 2026.",
    "Poland": "EU: 10% in total on every line (9903.05.39, note 52(k)). The 15% IEEPA reciprocal rate ended February 24, 2026.",
    "Netherlands": "EU: 10% in total on every line (9903.05.39, note 52(k)). The 15% IEEPA reciprocal rate ended February 24, 2026.",
    "South Korea": "12.5% in total on every line (9903.05.71, note 52(k)); the KORUS Free rate does not lower it. The IEEPA reciprocal duty ended February 24, 2026.",
    "Japan": "12.5% in total on every line (9903.05.49, note 52(k)). The IEEPA reciprocal duty ended February 24, 2026.",
    "Taiwan": "10% in total on every line (9903.05.76, note 52(k)). The IEEPA reciprocal duty ended February 24, 2026.",
    "United Kingdom": "Base rate +10% Section 301 (9903.05.81) on every line; no exception list. The 10% IEEPA reciprocal duty ended February 24, 2026.",
    "Türkiye (Turkey)": "Base rate +12.5% Section 301 (9903.05.79) on every line. The IEEPA reciprocal duty ended February 24, 2026.",
    "Vietnam": "Base rate +12.5% Section 301 (9903.05.84) on every line. The IEEPA reciprocal duty ended February 24, 2026.",
    "Australia": "AUSFTA claim (AU) makes the base rate Free, but +12.5% Section 301 (9903.05.23) still applies (note 52(a)): 12.5% on every line.",
    "South Africa": "AGOA claim (D, in force to December 31, 2026) makes the base rate Free, but +12.5% Section 301 (9903.05.69) still applies: 12.5% on every line.",
    "Brazil": "Base rate +25% Brazil Section 301 (9903.05.01) +12.5% (9903.05.27) on every line; nothing on the note 50(a)(ii) exemption list. The 40% IEEPA duty ended February 24, 2026.",
    "Any other country": "Base rate only for countries outside the 60 Section 301 economies; 10% or 12.5% more (or 10%/12.5% in total for the EU, Japan, Korea, Taiwan and Switzerland) "
    "for the others. Russia pays 35% in place of column 2 on motorboats and inflatable boats plus 12.5%. Nicaragua's Section 301 duty is 0% until January 1, 2027.",
}
for c in ia["countries"]:
    c["rule"]["label"] = R[c["country"]]
CTRY["South Africa"]["rule"]["sourceIds"] = CTRY["South Africa"]["rule"]["sourceIds"] + ["ustr-agoa-2026", "procl-11030"]
ia["assumptions"] = [a for a in ia["assumptions"] if not a.startswith("TODO")] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; "
    "neither is applied.",
    "Section 338 (9903.03.12, 9903.03.14) applies to the listed Canadian lines on both sides of the Canada row, because U.S. note 51(a) charges it even when USMCA is claimed.",
    "Preference claims applied: USMCA (S) for Canada and Mexico on the USMCA side, AUSFTA for Australia, KORUS for South Korea and AGOA (D) for South Africa. For Korea, Japan, "
    "the EU and Taiwan the 2026 Section 301 rate is a floor, so the claim does not change the total.",
    "No Section 232 duty and no antidumping or countervailing duty order covers Chapter 89 goods. The Section 232 vehicle-parts election headings are opt-in and left out.",
    "Not included because they are not duties on these goods: the 50% vessel repair duty on foreign repairs of U.S.-documented vessels (19 U.S.C. 1466, 9818.00.07), the "
    "Section 301 port fees on Chinese-operated and Chinese-built ships (suspended until November 9, 2026), and harbor maintenance and merchandise processing fees.",
    "UN Comtrade reports Taiwan as \"Other Asia, nes\"; its imports are shown in the Taiwan row.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21 and searched every note for Chapter 89 codes. No Chapter 89 line is "
    "on the 2026 Section 301 general exemption list (note 52(b), 9903.05.86), the note 52(c)–(f) lists or any country exception list in note 52(j), or on the Brazil exemption "
    "list (note 50(a)(ii)). Canada Section 338 lists 8903.31.00, 8903.32.00 and 8903.93.20 (note 51(b)(1)) and 8903.99.21, 8905.90.10, 8906.90.00 and 8907.90.00 (note 51(b)(3)); "
    "the civil aircraft relief (note 51(d)) does not reach Chapter 89. China lists: note 20(b) List 1 (11 lines), 20(d) List 2 (8901.30), 20(f) List 3 (8903 and 8907.10), "
    "20(r) List 4A (8906.10, 8907.90); 8905.90.10 is only on the suspended List 4B (note 20(u)). The expired exclusions in notes 20(p), (nn), (qq) and (aaa) named some kayaks, "
    "canoes, inflatable boats and motorboats; the exclusions extended to November 9, 2026 (notes 20(vvv), (www)) name none. Note 31 (2024 increases) and the Section 232 notes "
    "(16, 19, 33, 36–39) list no Chapter 89 line; note 30(b) lists eight 8903 subheadings for Russia's 35%."
)
need_ia = {x["id"] for x in ia["sources"]}
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in need_ia:
            ia["sources"].append(src[sid])
            need_ia.add(sid)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Boats & Vessels: Rules, Vessel Repair Duty, Jones Act and Legal Ways to Lower Duty (HTS Ch. 89) | KoalaGains",
    "shortDescription": "Tariff engineering for HTS Chapter 89: USMCA and FTA claims, the 50% vessel repair duty and its exemptions (CBP Form 226), U.S. goods returned, "
    "boat-show yacht duty deferral, nonresident cruising, Coast Guard HIN and EPA engine rules, and the Jones Act.",
    "keywords": [
        "usmca vessel rules of origin",
        "vessel repair duty",
        "cbp form 226",
        "jones act",
        "importing a boat into the us",
        "importing a boat from canada to us",
        "yacht duty deferral boat show",
        "hull identification number import",
    ],
}
te["intro"] = (
    "Importing a boat is mostly paperwork that agencies other than customs care about: a recreational boat needs a **Coast Guard hull identification number** and, if built for "
    "sale, the manufacturer's compliance label, and its gasoline engine must be **EPA-certified**. Ships face different rules: a **foreign-built ship can never get a coastwise "
    "endorsement**, so it cannot carry cargo or passengers between U.S. ports (the Jones Act), and a U.S.-flag ship that is repaired abroad owes a **50% duty on the foreign "
    "repair cost**, declared on CBP Form 226.\n\n"
    "The legal ways to pay less: claim **USMCA** for Canadian and Mexican boats (it removes the 10% Section 301 duty but not Canada's 50% Section 338 duty), buy from a country "
    "outside the 60 Section 301 economies, classify by length and propulsion correctly, bring back a U.S.-built boat duty-free as **U.S. goods returned**, defer duty on a large "
    "yacht shown at a U.S. **boat show**, use the nonresident and racing provisions, and plan foreign shipyard work around the vessel repair exemptions. Each rule and lever links "
    "to its statute, regulation or HTS provision."
)
te["regulationsAsOf"] = ECFR_AS_OF


def e(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def epart(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


USC = {
    "1466": ("19 U.S.C. 1466", "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleIII-partII-sec1466.htm"),
    "1484b": ("19 U.S.C. 1484b", "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleIII-partIII-sec1484b.htm"),
    "1313": ("19 U.S.C. 1313", "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1313.htm"),
    "55102": ("46 U.S.C. 55102", "https://www.govinfo.gov/content/pkg/USCODE-2024-title46/html/USCODE-2024-title46-subtitleV-partD-chap551-sec55102.htm"),
    "55103": ("46 U.S.C. 55103", "https://www.govinfo.gov/content/pkg/USCODE-2024-title46/html/USCODE-2024-title46-subtitleV-partD-chap551-sec55103.htm"),
    "12112": ("46 U.S.C. 12112", "https://www.govinfo.gov/content/pkg/USCODE-2024-title46/html/USCODE-2024-title46-subtitleII-partH-chap121-subchapII-sec12112.htm"),
}


def usc(k):
    lbl, url = USC[k]
    return {"label": lbl, "url": url}


def c(label, url):
    return {"label": label, "url": url}


HTS89 = c("HTSUS Ch. 89, additional U.S. note 1", CH89)
FR_MAR = src["fr-2025-06927"]["url"]
FR_SUSP = src["fr-2025-19873"]["url"]

te["rules"] = [
    {"id": "hin", "agency": "U.S. Coast Guard", "title": "Recreational boats need a hull identification number (HIN); the manufacturer or importer obtains a manufacturer identification code and "
     "certifies compliance with the federal boat safety standards (capacity, flotation, electrical and fuel systems for boats under 20 ft, 33 CFR part 183)",
     "citations": [c("33 CFR 181.23", e(33, "181.23")), c("33 CFR 181.5", e(33, "181.5")), c("33 CFR 183.1", e(33, "183.1"))]},
    {"id": "epa-engines", "agency": "EPA", "title": "Gasoline (spark-ignition) marine engines and their fuel lines and tanks must be certified to EPA emission standards; uncertified engines may be refused entry",
     "citations": [c("40 CFR 1045.1", e(40, "1045.1")), c("40 CFR 1068.301", e(40, "1068.301"))]},
    {"id": "jones-act", "agency": "CBP / U.S. Coast Guard", "title": "Only U.S.-built, U.S.-owned vessels with a coastwise endorsement may carry merchandise or passengers between U.S. points (the Jones Act); "
     "a foreign-built vessel cannot get the endorsement even after paying duty",
     "citations": [usc("55102"), usc("55103"), usc("12112")]},
    {"id": "documentation", "agency": "U.S. Coast Guard", "title": "Vessels of at least five net tons in the fisheries or coastwise trade must hold a Coast Guard certificate of documentation with the right endorsement; "
     "other vessels, including yachts, may be documented by choice. Which endorsement a vessel can get depends on where it was built and who owns it",
     "citations": [c("46 CFR 67.7", e(46, "67.7")), c("46 CFR part 67", epart(46, 67))]},
    {"id": "vessel-repair", "agency": "CBP", "title": "U.S.-documented vessels in foreign or coastwise trade must declare foreign equipment purchases and repairs on first arrival "
     "(CBP Form 226) and pay 50% of their foreign cost (heading 9818.00.07)",
     "citations": [usc("1466"), c("19 CFR 4.14", e(19, "4.14")), c("HTSUS Ch. 98, subch. XVIII", CH98)]},
    {"id": "yacht-entry", "agency": "CBP", "title": "Vessels in international trade and nonresidents' yachts for pleasure cruising enter without formal entry or duty; foreign yachts may "
     "get a cruising license; a pleasure vessel must report its arrival from a foreign port",
     "citations": [HTS89, c("19 CFR 4.94", e(19, "4.94")), c("19 CFR 4.0", e(19, "4.0"))]},
    {"id": "usmca-cert", "agency": "CBP", "title": "USMCA claims need a certification of origin (importer, exporter or producer) held at the time of the claim",
     "citations": [c("19 CFR 182.12", e(19, "182.12")), c("HTSUS Ch. 99, note 52(g)–(h)", CH99)]},
    {"id": "s338", "agency": "CBP", "title": "Report 9903.03.12 or 9903.03.14 with the Chapter 89 line for listed products of Canada (50%, USMCA claims included)",
     "citations": [c("HTSUS Ch. 99, U.S. note 51", CH99), c("Proclamation 11064 (91 FR 58331)", src["procl-11064"]["url"]),
                   c("Proclamation 11048 (91 FR 46663)", src["procl-11048"]["url"])]},
    {"id": "china-301", "agency": "CBP / USTR", "title": "Report the China Section 301 heading (9903.88.01, .02, .03 or .15) and 9903.05.31 for products of China",
     "citations": [c("HTSUS Ch. 99, U.S. note 20", CH99), c("USTR continuation notice (91 FR 64212)", src["fr-2026-20510"]["url"])]},
    {"id": "russia", "agency": "CBP", "title": "Products of Russia pay column 2 rates, and 35% in place of column 2 on the motorboats and inflatable boats listed in note 30(b) (9903.90.08)",
     "citations": [c("HTSUS Ch. 99, U.S. note 30", CH99), c("Proclamation 10420 (87 FR 38875)", src["procl-10420"]["url"])]},
    {"id": "port-fees", "agency": "USTR / CBP", "title": "Section 301 service fees per U.S. voyage on vessels with Chinese operators or owners and on Chinese-built vessels (not import duties); "
     "suspended November 10, 2025 through November 9, 2026",
     "citations": [c("USTR action, Annexes I–III (90 FR 17114)", FR_MAR), c("USTR suspension (90 FR 50947)", FR_SUSP)]},
]
te["levers"] = [
    {"id": "usmca", "title": "Claim USMCA for Canadian and Mexican boats", "saves": "The 1%–2.7% base rate and the 10% Section 301 duty (9903.05.29 / 9903.05.55)",
     "appliesTo": "Boats and vessels of Canada or Mexico that meet the USMCA rule of origin", "document": "USMCA certification of origin; SPI S on the entry",
     "caveat": "Does not remove Canada's 50% Section 338 duty on motorboats, outboard boats, floating docks, hulls, buoys and tanks (note 51(a)). USMCA remains in force after the July 2026 joint review.",
     "citations": [c("HTSUS Ch. 99, U.S. note 52(g)–(h)", CH99), c("19 CFR 182.12", e(19, "182.12"))]},
    {"id": "origin", "title": "Choose the country of build", "saves": "Up to 30 points: 37.5%–40.2% from China or Brazil, 10% from the EU or Taiwan, 12.5% from Japan or Korea, the base rate alone from countries outside the 60 Section 301 economies",
     "appliesTo": "Every Chapter 89 line", "document": "Builder's certificate and commercial invoice showing where the hull was built and the vessel assembled",
     "caveat": "Origin is where the vessel was built (substantially transformed), not where it was sold or last registered. FTA and AGOA claims remove only the base rate, not the Section 301 duty.",
     "citations": [c("HTSUS Ch. 99, U.S. notes 20, 50 and 52", CH99)]},
    {"id": "classify", "title": "Classify by type, length and propulsion", "saves": "Between 1% (outboard motorboats), 1.5% (sailboats and inboard motorboats), 2.4% (inflatables), 2.7% (row boats) and Free (canoes, including kayaks); and between List 3 (25%) and List 4A (7.5%) for China",
     "appliesTo": "8903, 8906 and 8907", "document": "Builder's specifications: length, hull material, engine type (outboard or inboard/outdrive), inflatable or rigid hull",
     "caveat": "Chapter note 1 sends hulls and unfinished vessels without the character of a particular vessel to 8906. CBP classifies kayaks as canoes (Free), not as other row boats (2.7%). Ask CBP for a binding ruling when unsure.",
     "citations": [c("HTSUS Ch. 89, note 1 and headings 8903–8907", CH89), c("CBP ruling HQ H251131 (kayak classified as a canoe)", "https://rulings.cbp.gov/ruling/H251131")]},
    {"id": "goods-returned", "title": "Bring a U.S.-built boat back as U.S. goods returned", "saves": "The whole duty, including the Section 301 and Section 338 duties",
     "appliesTo": "U.S.-built boats and vessels returned without being improved abroad", "document": "Proof of U.S. manufacture and export (HIN, builder's certificate, export record) for an entry under 9801.00.10",
     "caveat": "Repairs or alterations made abroad are dutiable on their value under 9802.00.40 or 9802.00.50, and the 2026 Section 301 duty (note 52(a)) and Section 338 (note 51(a)) apply to that value.",
     "provisions": [{"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned without having been advanced in value or improved in condition abroad"},
                    {"code": "9802.00.50", "rate": "Duty on the value of the repairs", "text": "Articles exported for repairs or alterations"}],
     "citations": [c("HTSUS Ch. 98, subch. I and II", CH98), c("19 CFR 10.8", e(19, "10.8"))]},
    {"id": "boat-show", "title": "Defer the duty on a large yacht imported for sale at a U.S. boat show", "saves": "No duty unless the yacht is sold in the United States",
     "appliesTo": "Yachts over 79 feet, used mainly for pleasure and previously sold at retail, imported for sale at a U.S. boat show", "document": "Importer certification and a bond of twice the duty for six months",
     "caveat": "If sold within six months, entry is completed and duty paid at the value at import; if neither sold nor exported, duty is due when the bond period ends.",
     "citations": [usc("1484b"), c("19 CFR 113.75", e(19, "113.75"))]},
    {"id": "nonresident", "title": "Nonresident cruising and racing provisions", "saves": "The whole duty while the boat stays a visitor's boat",
     "appliesTo": "Yachts brought in by nonresidents for their own pleasure cruising; boats brought in temporarily by nonresidents to race", "document": "Report of arrival, cruising license where available; for racing boats a temporary importation bond (9813.00.35)",
     "caveat": "Selling or chartering the boat in the U.S., or a U.S. resident using it, ends the relief and requires a formal entry at full duty. A foreign-built boat still cannot carry passengers for hire between U.S. points.",
     "provisions": [{"code": "9804.00.35", "rate": "Free", "text": "Boats and other means of transportation of nonresidents, for their own transportation"},
                    {"code": "9813.00.35", "rate": "Free, under bond", "text": "Boats and racing shells brought in temporarily by nonresidents to take part in races or other contests"}],
     "citations": [HTS89, c("HTSUS Ch. 98, subch. IV and XIII", CH98), c("19 CFR 4.94", e(19, "4.94"))]},
    {"id": "repair-plan", "title": "Plan foreign shipyard work around the vessel repair exemptions", "saves": "The 50% vessel repair duty on part or all of the work",
     "appliesTo": "U.S.-documented vessels in foreign or coastwise trade",
     "document": "CBP Form 226 with itemized invoices separating exempt from dutiable costs; evidence for any remission (casualty survey, U.S. origin of parts)",
     "caveat": "Exempt or free: repairs in Canada, Mexico and Israel and in FTA partners listed in the 9818.00.07 special column; crew labor and installation by the regular crew; "
     "repairs forced by weather or casualty and U.S.-made parts installed by U.S. residents (remission); purchases after the first six months of a voyage of two years or more.",
     "provisions": [{"code": "9818.00.07", "rate": "50 percent of the cost of such goods or repairs", "text": "Equipment, repair parts and repairs bought abroad for U.S.-documented vessels"},
                    {"code": "9818.00.03", "rate": "Free", "text": "Spare repair parts for cargo vessels on which duty was paid at first entry"}],
     "citations": [usc("1466"), c("19 CFR 4.14", e(19, "4.14")), c("HTSUS Ch. 98, subch. XVIII", CH98)]},
    {"id": "drawback", "title": "Drawback on boats re-exported", "saves": "Up to 99% of the duties paid, when the boat is exported or destroyed unused",
     "appliesTo": "Imported boats and vessels later exported", "document": "Drawback claim with import and export records within the time limits",
     "caveat": "Check the Chapter 99 note of each extra duty before claiming: some programs bar drawback. Planned with the import, not after.",
     "citations": [usc("1313"), c("19 CFR part 191", epart(19, 191))]},
]

RULES_ALL = ["china-301", "russia"]
GR = {
    "8901": (["jones-act", "documentation", "vessel-repair", "yacht-entry", "port-fees"] + RULES_ALL,
             "Free. Ships in international trade enter without formal entry (additional U.S. note 1); a foreign-built ship cannot get a coastwise endorsement. U.S.-flag ships owe 50% on foreign repairs."),
    "8902": (["documentation", "vessel-repair", "jones-act"] + RULES_ALL,
             "Free. U.S.-documented fishing vessels owe the vessel repair duty on foreign repairs and nets (19 CFR 4.14(b)(1))."),
    "8903": (["hin", "epa-engines", "usmca-cert", "s338", "yacht-entry", "documentation"] + RULES_ALL,
             "The only dutiable lines (1%–2.7%). Coast Guard HIN and safety standards and EPA engine certification apply; Canadian motorboats and outboard boats pay 50% Section 338."),
    "8904": (["jones-act", "documentation", "vessel-repair"] + RULES_ALL,
             "Free. A foreign-built tug cannot tow in U.S. coastwise trade (46 U.S.C. 55102)."),
    "8905": (["jones-act", "documentation", "s338"] + RULES_ALL,
             "Free; floating docks 35% in column 2. Canadian floating docks pay 50% Section 338. Korea's platform hulls pay 12.5%."),
    "8906": (["documentation", "s338", "jones-act"] + RULES_ALL,
             "Free. Hulls without the character of a particular vessel go here (chapter note 1). Canadian hulls and other vessels pay 50% Section 338; Chinese warships 20%."),
    "8907": (["s338", "usmca-cert"] + RULES_ALL,
             "Free; 45% in column 2. Canadian buoys, tanks and other floating structures pay 50% Section 338; Chinese buoys and tanks 20% (List 4A)."),
    "8908": (["documentation"] + RULES_ALL,
             "Free. Vessels imported for breaking up pay only the extra duties (China 37.5%)."),
}
for g in te["groups"]:
    g["label"] = SHORT[g["heading"]]
    g["ruleIds"], g["note"] = GR[g["heading"]]
for ln in te["lines"]:
    h = ln["hts"]
    rid = list(GR[h[:4]][0])
    if h[:4] in ("8905", "8906", "8907", "8903") and h not in (CA12 | CA14_0822 | CA14_0915):
        rid = [r for r in rid if r != "s338"]
    if h not in RU35:
        pass  # Russia still pays column 2 on every line
    if h in NOLIST:
        rid = [r for r in rid if r != "china-301"]
    ln["ruleIds"] = rid
    lev = ["origin", "classify", "drawback", "goods-returned"]
    if h.startswith("8903"):
        lev = ["usmca", "origin", "classify", "goods-returned", "nonresident", "drawback"]
        if h[:10] in ("8903.22.00", "8903.23.00", "8903.32.00", "8903.33.00"):
            lev.insert(4, "boat-show")
    elif h[:4] in ("8901", "8902", "8904"):
        lev = ["usmca", "origin", "repair-plan", "goods-returned", "drawback"]
    else:
        lev = ["usmca", "origin", "classify", "goods-returned", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the statutes, regulations and HTS provisions, not legal advice. Chapter 99 headings change often (Section 338 lists were "
    "modified twice in 2026) and the maritime Section 301 action resumes on November 10, 2026 unless USTR acts; check the current Chapter 99 notes, CBP's CSMS messages and "
    "USTR's notices before importing, and ask CBP for a binding ruling on classification or vessel repair questions."
)

# ------------------------------------------------------------------ finalConclusion
fc = d["finalConclusion"]
fc["seo"] = {
    "title": "Boat & Yacht Tariffs FAQ: Canada, China, Europe, HS Code 8903, Port Fees, Jones Act (HTS Ch. 89) | KoalaGains",
    "shortDescription": "Answers to what people search about U.S. boat and ship tariffs: US tariffs on boats and yachts, importing a boat from Canada or Europe, duty on Chinese boats, "
    "used boats, HS codes for boats, RIBs and kayaks, port fees on Chinese ships, the Jones Act and CBP Form 226.",
    "keywords": [
        "us tariffs on boats",
        "us tariffs on yachts",
        "importing a boat from canada to us",
        "importing a boat from europe to us",
        "import duty on boats from china",
        "tariffs on used boats",
        "hs code for boat",
        "hs code 8903",
        "inflatable boat hs code",
        "us port fees on chinese ships",
        "jones act",
        "cbp form 226",
        "chapter 89 hts",
    ],
}
fc["intro"] = (
    "Straight answers to the most common questions about U.S. tariffs on boats, yachts, ships and floating structures, by country, by HS code and for the maritime rules around them. "
    "Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Base rates are low: ships, tugs, platforms and floating structures are Free, pleasure boats 1% to 2.7% (canoes Free). Pleasure boats were "
    f"{share(HEAD['8903'])} of the {money(TOTAL)} of 2025 imports.",
    "The extra duties set the price: Free for USMCA boats from Mexico; 10% in total for the EU and Taiwan, 12.5% for Japan and Korea; base rate plus 10% or 12.5% for the UK and the "
    "other Section 301 economies; 37.5%–40.2% for China and Brazil; and 50% for Canadian motorboats, outboard boats, floating docks, hulls, buoys and tanks, even with USMCA.",
    "The 2025 IEEPA duties ended February 24, 2026 and the Section 122 surcharge on July 23, 2026. USTR's port fees on Chinese ships are a vessel charge, not an import duty, and are "
    "suspended until November 9, 2026. U.S.-flag ships owe 50% on foreign repairs, and foreign-built vessels can never serve U.S. domestic routes (Jones Act).",
]
fc["questionSource"] = f"Google search suggestions (United States, English), collected {SUGG_DATE}"
fc["faqs"] = [
    {"id": "us-tariff-boats", "question": "What is the U.S. tariff on imported boats?",
     "searchedAs": ["us tariffs on boats", "tariffs on boats", "boat tariffs", "import duty on boats", "customs duty on boats", "vessel import duty"],
     "answer": "The general (MFN) rate on pleasure boats is 1% to 2.7% (8903; canoes and kayaks Free), and every ship, tug, platform and floating structure is Free. Most of the cost is the "
     "extra duties: USMCA boats from Mexico are Free; EU and Taiwanese boats pay 10% in total, Japanese and Korean 12.5%; UK pleasure boats 10% to 12.7%; boats from the other 2026 "
     "Section 301 economies the base rate plus 10% or 12.5%; Chinese and Brazilian boats 37.5% to 40.2%; Canadian motorboats and outboard boats 50%. Countries outside the 60 "
     "Section 301 economies pay only the base rate.",
     "link": "industry-areas"},
    {"id": "yachts", "question": "What is the U.S. import duty on yachts?",
     "searchedAs": ["us tariffs on yachts", "tariffs on yachts", "yacht tariff", "yacht import duty", "import duty on yachts"],
     "answer": "A sailing yacht or motor yacht (8903.22, 8903.23, 8903.32, 8903.33) has a 1.5% base rate. From Italy, France, Germany, the Netherlands or another EU member the "
     "2026 Section 301 duty makes the total exactly 10%; from Taiwan 10%; from Japan or South Korea 12.5%; from the UK 11.5%; from Türkiye 14%; from China 39%. A $1M Italian "
     "yacht pays $100,000. Yachts over 79 feet imported for sale at a U.S. boat show can defer the duty until sold (19 U.S.C. 1484b), and nonresidents cruising for pleasure pay "
     "no duty (additional U.S. note 1).",
     "link": "industry-areas"},
    {"id": "canada", "question": "Is there a tariff on importing a boat from Canada to the U.S.?",
     "searchedAs": ["importing a boat from canada to us", "bringing a boat from canada to us", "importing a used boat from canada to us", "boat tariffs canada", "importing a boat from canada"],
     "answer": "It depends on the boat. Since September 15, 2026, Canadian motorboats of 8903.31 and 8903.32 and outboard motorboats of 8903.93.20 and 8903.99.21 pay a 50% "
     "Section 338 duty even with a USMCA claim, and 61% to 61.5% without one. Floating docks, hulls and buoys pay the same 50% since August 22, 2026. Other Canadian boats "
     "(sailboats, inflatables, canoes, kayaks) are Free with a USMCA claim and pay the base rate plus 10% Section 301 without it. A U.S.-built boat coming back from Canada "
     "unimproved is Free as U.S. goods returned (9801.00.10).",
     "link": "industry-areas"},
    {"id": "europe", "question": "What duty do I pay when importing a boat from Europe to the U.S.?",
     "searchedAs": ["importing a boat from europe to us"],
     "answer": "For a boat built in an EU member state the total is 10% of the customs value on every Chapter 89 line (heading 9903.05.39 replaces the 1% to 2.7% base rate). "
     "UK-built boats pay the base rate plus 10% (10% to 12.7%) and Norwegian boats the base rate plus 12.5%. The 15% EU reciprocal rate of 2025 ended February 24, 2026. "
     "The boat also needs a Coast Guard hull identification number and an EPA-certified gasoline engine.",
     "link": "industry-areas"},
    {"id": "china", "question": "What is the import duty on boats from China?",
     "searchedAs": ["import duty on boats from china", "importing a boat from china", "boat import from china", "importing pontoon boat from china"],
     "answer": "Chinese pleasure boats pay the 1% to 2.7% base rate plus 25% under Section 301 List 3 (9903.88.03) and 12.5% under the 2026 Section 301 action (9903.05.31): "
     "38.5% for outboard boats, 39% for sailboats and inboard motorboats, 39.9% for inflatable boats, 40.2% for row boats, 37.5% for canoes and kayaks. Chinese ships, tugs and fishing vessels pay 37.5% "
     "(List 1), warships and buoys 20% (List 4A). No product exclusion covers Chapter 89. The IEEPA duties on China ended February 24, 2026.",
     "link": "industry-areas"},
    {"id": "used-boats", "question": "Are there tariffs on used boats?",
     "searchedAs": ["tariffs on used boats", "are there tariffs on used boats", "import duty on second hand boats"],
     "answer": "Yes. A used boat is classified and dutied like a new one, on its transaction value, by its country of build, so a used Italian yacht pays 10% and a used "
     "Chinese boat about 39%. The exception is a U.S.-built boat returned without improvement abroad, which is Free under 9801.00.10. Repairs done abroad on a U.S. boat are "
     "dutiable on their value (9802.00.50).",
     "link": "tariff-engineering"},
    {"id": "hs-code-boat", "question": "What is the HS code for a boat?",
     "searchedAs": ["hs code for boat", "hs code 8903", "hs code 8903.99", "chapter 89 hts", "htsus chapter 89", "hs code for yacht"],
     "answer": "Boats and yachts are in heading 8903 of HTS Chapter 89: inflatable boats 8903.11–8903.19, sailboats 8903.21–8903.23 and motorboats other than outboard "
     "8903.31–8903.33 (by length: up to 7.5 m, 7.5–24 m, over 24 m), and other boats 8903.93 (up to 7.5 m) and 8903.99: canoes and kayaks, row boats, outboard motorboats "
     "and others. Ships are 8901, fishing vessels 8902, tugs 8904, dredgers and platforms 8905, warships, lifeboats and hulls 8906, buoys and rafts 8907. The old 8903.10, "
     "8903.91 and 8903.92 codes were replaced in 2022.",
     "link": ""},
    {"id": "inflatable", "question": "What is the HS code for an inflatable boat or RIB?",
     "searchedAs": ["inflatable boat hs code", "rib boat hs code", "rigid inflatable boat hs code", "inflatable dinghy hs code", "rubber boat hs code", "inflatable raft hs code"],
     "answer": "Inflatable boats, including rigid hull inflatables (RIBs), are 8903.11 (fitted for a motor, up to 100 kg unladen), 8903.12 (not for a motor, up to 100 kg) or "
     "8903.19 (other), all at 2.4%, Free under most FTAs. Boats over $500 are reported as with or without an attached rigid hull. Inflatable life rafts are 8907.10 (Free).",
     "link": ""},
    {"id": "kayak", "question": "What is the HS code for a kayak or canoe?",
     "searchedAs": ["kayak hs code", "kayak hts code"],
     "answer": "Non-inflatable canoes and kayaks not designed principally for motors or sails are 8903.93.05 (up to 7.5 m) or 8903.99.06 (longer), Free: CBP ruled in "
     "HQ H251131 that a kayak is a canoe for this purpose. Other row boats of that kind (8903.93.15, 8903.99.16) pay 2.7%, and inflatable kayaks 2.4% (8903.11–8903.19). "
     "From China a kayak or canoe pays 37.5% (List 3 plus 12.5%); from the EU 10%.",
     "link": ""},
    {"id": "boat-parts", "question": "Are boat parts, engines and trailers in Chapter 89?",
     "searchedAs": ["hs code for boat parts", "hs code for boat engine", "hs code for boat trailer", "hs code for boat propeller", "boat parts hs code"],
     "answer": "No. Chapter 89 covers whole vessels and hulls only. Outboard motors are 8407.21 (Free), other marine propulsion engines 8408.10 (diesel, 2.5%), propellers 8487.10 "
     "(Free) and trailers heading 8716; parts follow their own chapters. Each pays its own extra duties.",
     "link": ""},
    {"id": "port-fees", "question": "What are the U.S. port fees on Chinese ships?",
     "searchedAs": ["us port fees on chinese ships", "port fees on chinese built ships", "ustr port fees on chinese ships", "section 301 ship fees", "us suspends port fees on chinese ships", "section 301 vessel fees"],
     "answer": "Under its Section 301 action on China's maritime and shipbuilding sectors, USTR set fees per U.S. voyage: from October 14, 2025, $50 per net ton for ships with a "
     "Chinese operator or owner, and for other operators of Chinese-built ships the higher of $18 per net ton or $120 per container, rising each April to 2028, charged up to five "
     "times a year. They are charges on vessel calls collected by CBP, not import duties. USTR suspended them from November 10, 2025 through November 9, 2026.",
     "link": "tariff-updates"},
    {"id": "section-301-ships", "question": "Does Section 301 put a tariff on Chinese-built ships?",
     "searchedAs": ["section 301 ships", "section 301 chinese ships", "ustr section 301 chinese ships", "section 301 ships action"],
     "answer": "Not on the maritime investigation. That action charges port fees on vessels and set 100% duties on Chinese ship-to-shore cranes and intermodal chassis (both "
     "suspended until November 9, 2026), not on ships. Chinese ships imported into the U.S. pay the 2018 China Section 301 duty instead: 25% for ships, fishing vessels and tugs "
     "(List 1), 7.5% for warships (List 4A), plus the 12.5% 2026 Section 301 duty.",
     "link": "tariff-updates"},
    {"id": "jones-act", "question": "What is the Jones Act and does it affect imported boats?",
     "searchedAs": ["jones act", "jones act shipping", "jones act cruise ships", "jones act of 1920"],
     "answer": "Section 27 of the Merchant Marine Act of 1920 (46 U.S.C. 55102) lets only U.S.-built, U.S.-owned vessels with a coastwise endorsement carry merchandise between U.S. "
     "points; 46 U.S.C. 55103 does the same for passengers. Paying import duty does not change this: a foreign-built vessel cannot get a coastwise endorsement (46 U.S.C. 12112). "
     "Imported pleasure boats used privately are not affected.",
     "link": "tariff-engineering"},
    {"id": "form-226", "question": "What is CBP Form 226 and the 50% vessel repair duty?",
     "searchedAs": ["cbp form 226"],
     "answer": "CBP Form 226 is the vessel repair declaration and entry. A vessel documented under U.S. law for foreign or coastwise trade owes duty of 50% of the foreign cost of "
     "equipment, parts and repairs on its first U.S. arrival (19 U.S.C. 1466; HTS 9818.00.07). Repairs in Canada, Mexico and Israel and in FTA partners listed in the special "
     "column are free, crew labor is excluded, and repairs forced by weather or casualty can be remitted (19 CFR 4.14).",
     "link": "tariff-engineering"},
]
for f in fc["faqs"]:
    assert f["link"] in ("", "tariff-updates", "understand-industry", "industry-areas", "tariff-engineering")

# ------------------------------------------------------------------ final TODO sweep
s = json.dumps(d)
assert "TODO" not in s, [k for k in ("overview", "tariffUpdates", "understandIndustry", "industryAreas", "tariffEngineering", "finalConclusion") if "TODO" in json.dumps(d[k])]
assert FORBIDDEN_SOURCE not in s.lower()
json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print("wrote", sys.argv[2])
