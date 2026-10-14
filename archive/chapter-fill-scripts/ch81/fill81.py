"""Fill the writer TODOs of the generated Chapter 81 (Other Base Metals; Cermets; Articles Thereof) content file.

usage: python3 fill81.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 81, General Notes, Chapter 99 notes 2(v)(iii), 2(aa), 20, 29, 30, 31, 50, 51, 52),
Proclamation 11001 and Executive Order 14272 (Section 232 processed critical minerals), the IEEPA / Section 122 / Section 301 /
Section 338 documents, the Commerce and ITC AD/CVD notices in sources81.py, eCFR titles 19 and 40 (up to date as of 2026-10-08)
and UN Comtrade.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources81 import CH81, CH99, EXTRA  # noqa: E402
from trade81 import apply_trade  # noqa: E402

ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
ECFR19 = "https://www.ecfr.gov/current/title-19"
ECFR40 = "https://www.ecfr.gov/current/title-40"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF

rows = d["overview"]["rateTable"]["rows"]
LINE = {r["hts"]: r for r in rows if r["htsCode10"]}
assert len(LINE) == 84, len(LINE)

# ------------------------------------------------------------------ line sets (from the engine output)
ia = d["industryAreas"]
CTRY = {c["country"]: c for c in ia["countries"]}


def lines(country, pred):
    out = set()
    for cell in CTRY[country]["cells"].values():
        for b in cell["withoutUsmca"]["breakdown"]:
            if pred(b):
                out.update(b["lines"])
    return out


S301 = lines("India", lambda b: "+10%" in b["extra"])  # lines that pay the 2026 Section 301 duty
EX52B = set(LINE) - S301  # on the note 52(b) exemption list
CN25 = lines("China", lambda b: "25%" in b["extra"])
CN125 = lines("China", lambda b: "12.5%" in b["extra"])
CNNONE = lines("China", lambda b: b["extra"].startswith("None"))
RU70 = lines("Russia", lambda b: "70% in place of base" in b["extra"])
assert len(S301) == 32 and len(EX52B) == 52, (len(S301), len(EX52B))
assert len(CN25) == 59 and len(CN25 & CN125) == 22 and len(CN125 - CN25) == 10 and len(CNNONE) == 15
assert len(RU70) == 11, len(RU70)
assert "8113.00.00.00" in S301 and "8108.20.00.10" in EX52B and "8101.10.00.00" in EX52B and "8101.94.00.00" in S301

# ------------------------------------------------------------------ product groups
G = {
    "8101": ("Tungsten (wolfram) and articles", "Tungsten",
             "Tungsten powder, unwrought tungsten and sintered bars, wire, waste and scrap, and wrought tungsten (bars, rods, plates, sheet, foil) and other articles: 6 lines, 2.8% to 7%. "
             "Powder and scrap are on the 2026 Section 301 exemption list; unwrought tungsten, wire and other articles pay it. Chinese tungsten pays 25% under Section 301 (note 31) on top.",
             ["tungsten powder", "tungsten bar", "tungsten rod", "tungsten wire", "tungsten scrap", "tungsten plate", "tungsten heavy alloy", "tungsten shot"]),
    "8102": ("Molybdenum and articles", "Molybdenum",
             "Molybdenum powder and unwrought molybdenum (charged per kg of molybdenum content plus a percentage), bars and rods, wire, scrap and other articles: 7 lines, Free to 6.6%. "
             "None is on the 2026 Section 301 exemption list, so every molybdenum line pays it.",
             ["molybdenum powder", "moly bar", "molybdenum rod", "molybdenum wire", "molybdenum scrap", "molybdenum sheet", "TZM"]),
    "8103": ("Tantalum and articles", "Tantalum",
             "Unwrought tantalum and powder, waste and scrap, crucibles and other tantalum articles: 5 lines, Free to 4.4%. All on the 2026 Section 301 exemption list; Chinese unwrought tantalum and powder pay 25% (note 31).",
             ["tantalum powder", "tantalum ingot", "tantalum scrap", "tantalum sheet", "tantalum crucible", "tantalum sputtering target"]),
    "8104": ("Magnesium and articles", "Magnesium",
             "Unwrought magnesium (pure, at least 99.8%, and alloy), waste and scrap, raspings, turnings, granules and powder, and other magnesium articles: 5 lines, Free to 8% "
             "(other articles 14.8¢/kg on magnesium content + 3.5%). All on the 2026 Section 301 exemption list. Chinese pure, granular and alloy magnesium is under antidumping orders.",
             ["magnesium ingot", "pure magnesium", "magnesium alloy", "magnesium powder", "magnesium granules", "magnesium scrap", "magnesium anode"]),
    "8105": ("Cobalt mattes, cobalt and articles", "Cobalt",
             "Cobalt mattes and other intermediate products, unwrought cobalt (alloys and other), powders, waste and scrap and other cobalt articles: 5 lines, Free to 4.4%. All on the 2026 Section 301 exemption list; Chinese cobalt pays 25% (List 3).",
             ["cobalt metal", "cobalt cathode", "cobalt powder", "cobalt alloy", "cobalt matte", "cobalt scrap"]),
    "8106": ("Bismuth and articles", "Bismuth",
             "Bismuth over 99.99% pure and other bismuth and articles, including waste and scrap: 2 lines, both Free. On the 2026 Section 301 exemption list; Chinese bismuth pays 25% (List 3).",
             ["bismuth metal", "bismuth ingot", "bismuth needles", "high-purity bismuth"]),
    "8108": ("Titanium and articles", "Titanium",
             "Titanium sponge, powder, ingots and other unwrought titanium (15%), scrap (Free), titanium castings and articles (5.5%) and mill products (blooms, slabs, bars, wire, plate, sheet, foil, tubes, 15%): 12 lines. "
             "All on the 2026 Section 301 exemption list. Chinese titanium pays 25% (List 3); Russian unwrought titanium and scrap 70%.",
             ["titanium sponge", "titanium ingot", "titanium powder", "titanium scrap", "titanium sheet", "titanium plate", "titanium bar", "titanium tube", "titanium wire"]),
    "8109": ("Zirconium and articles", "Zirconium",
             "Unwrought zirconium and powders, waste and scrap, and other zirconium articles, each split by hafnium content (nuclear-grade, under 1 part hafnium to 500 parts zirconium, or other): 6 lines, Free to 4.2%. "
             "None is on the 2026 Section 301 exemption list.",
             ["zirconium sponge", "zirconium powder", "zirconium scrap", "zircaloy", "nuclear grade zirconium", "zirconium tube"]),
    "8110": ("Antimony and articles", "Antimony",
             "Unwrought antimony and powders, waste and scrap, and other antimony articles: 3 lines, all Free. On the 2026 Section 301 exemption list and on no China list, so antimony is Free from every country except column 2 countries.",
             ["antimony ingot", "antimony metal", "antimony regulus", "antimony scrap"]),
    "8111": ("Manganese and articles", "Manganese",
             "Manganese waste and scrap (Free), unwrought manganese flake and powder of at least 99.5% and other unwrought manganese (14%), and other manganese articles (3.7%): 5 lines. "
             "Unwrought manganese is on the 2026 Section 301 exemption list; scrap and articles are not.",
             ["electrolytic manganese metal", "manganese flake", "manganese powder", "manganese briquettes", "manganese scrap"]),
    "8112": ("Beryllium, chromium, hafnium, rhenium, thallium, cadmium, gallium, germanium, indium, niobium, vanadium", "Minor metals",
             "Beryllium, chromium, hafnium, rhenium, thallium and cadmium (unwrought, scrap, other), and the 8112.92 / 8112.99 lines for gallium, germanium, indium, niobium and vanadium: 27 lines, Free to 8.5%. "
             "Chromium, rhenium, gallium, germanium, indium, niobium and wrought vanadium are on the 2026 Section 301 exemption list; beryllium, hafnium, cadmium, unwrought thallium, unwrought vanadium and 8112.92 waste and scrap are not.",
             ["chromium metal", "gallium", "germanium", "indium", "niobium", "vanadium", "hafnium", "rhenium", "beryllium", "cadmium"]),
    "8113": ("Cermets and articles", "Cermets",
             "Cermets (sintered metal and ceramic composites, such as cemented tungsten carbide that is not a tool tip) and articles of cermets, including waste and scrap: 1 line, 3.7%. "
             "Pays the 2026 Section 301 duty; Canadian cermets pay the 50% Section 338 duty since August 22, 2026.",
             ["cermet", "cemented carbide", "tungsten carbide rod", "carbide wear parts", "cermet scrap"]),
}
ORIG_LABELS = {g["heading"]: g["label"] for g in ia["groups"]}
o = d["overview"]
for pg in o["productGroups"]:
    label, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
for g in ia["groups"]:
    label, short, _, _ = G[g["heading"]]
    g["label"], g["shortLabel"] = label, short

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 81: Other Base Metals; Cermets; Articles Thereof — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 81 Tariffs: Tungsten, Titanium, Magnesium, Cobalt & Critical Minerals Import Duties | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 84 HTS Chapter 81 lines (tungsten, molybdenum, tantalum, magnesium, cobalt, titanium, antimony, gallium, germanium, cermets): base rates Free to 15%, "
    "which lines are exempt from the 2026 Section 301 tariffs, China's 25% Section 301 duty and the Section 232 critical minerals decision.",
    "keywords": [
        "HTS Chapter 81",
        "Other base metals; cermets; articles thereof",
        "critical minerals tariffs",
        "tungsten tariffs",
        "titanium tariffs",
        "magnesium tariff code",
        "cobalt tariffs",
        "titanium hs code",
        "hs code tungsten",
        "cermet hs code",
    ],
}
o["stats"][2]["note"] = (
    f"2026 Section 301 (60 economies): {len(S301)} lines (the other {len(EX52B)} are on the note 52(b) exemption list); Brazil Section 301: {len(S301)}; "
    f"China Section 301 at 25% (List 3, note 31): {len(CN25)}; Canada Section 338: 1 (cermets); Russia 70% in lieu of column 2: {len(RU70)}. USMCA goods are exempt from the Section 301 duties but not from Section 338."
)
o["intro"] = (
    "Chapter 81 covers the base metals that are not iron, copper, nickel, aluminum, lead, zinc or tin: **tungsten** (8101), **molybdenum** (8102), **tantalum** (8103), **magnesium** (8104), "
    "**cobalt** (8105), **bismuth** (8106), **titanium** (8108), **zirconium** (8109), **antimony** (8110), **manganese** (8111), the minor metals of 8112 (beryllium, chromium, hafnium, rhenium, "
    "thallium, cadmium, gallium, germanium, indium, niobium, vanadium) and **cermets** (8113). Several, such as gallium, germanium, indium and cobalt, are named as critical minerals in Proclamation 11001. Base rates run from **Free to 15%** "
    "(unwrought titanium and titanium mill products); 24 of the 84 lines are Free. Molybdenum powder and unwrought molybdenum, and other magnesium articles, carry a compound rate charged per kilogram of metal content plus a percentage.\n\n"
    "**No Section 232 tariff applies.** Proclamation 11001 (January 14, 2026) found that imports of processed critical minerals threaten national security but chose negotiations, not tariffs. "
    "The duties that do apply come from Section 301. The **2026 Section 301 tariffs on 60 economies** (10% or 12.5%) exempt 52 of the 84 lines through the note 52(b) list "
    "(tungsten powder and scrap, tantalum, magnesium, cobalt, bismuth, titanium, antimony, unwrought manganese, chromium, rhenium, gallium, germanium, indium, niobium); "
    "unwrought and wrought tungsten, molybdenum, zirconium, manganese scrap and articles, beryllium, hafnium, unwrought thallium, cadmium, unwrought vanadium and cermets pay it. **China** pays 25% under Section 301 on 59 lines "
    "(List 3, and note 31 for tungsten, tantalum, chromium and indium). Canadian **cermets** pay a 50% Section 338 duty, even with a USMCA claim. Russian goods pay column 2 rates, or 70% on titanium sponge and some minor metals.\n\n"
    "**Antidumping duty orders** cover pure, granular and alloy magnesium from China and tungsten shot from China. They are company-specific and not part of this table or the tariff calculator."
)
for ex_line in ["8108.20.00.10", "8101.10.00.00", "8101.94.00.00", "8102.10.00.00", "8104.11.00.00", "8113.00.00.00", "8108.90.60.60", "8112.92.10.00"]:
    assert ex_line in LINE, ex_line
o["workedExamples"] = [
    {
        "title": "$1 million of titanium sponge from Japan",
        "line": "8108.20.00.10",
        "body": "Titanium sponge has a **15%** general rate, the highest in the chapter. Japan has no FTA with the United States, and unwrought titanium is on the note 52(b) list, so Japan's 2026 Section 301 duty (12.5% floor, 9903.05.49) does not apply. "
        "Total: **15%, or $150,000**. The same sponge from Kazakhstan also pays 15%; from China, 15% + 25% (List 3, 9903.88.03) = 40%; from Russia, 70% in place of the column 2 rate (9903.90.09).",
    },
    {
        "title": "Titanium tubes with attached fittings for civil aircraft, from the United Kingdom",
        "line": "8108.90.60.60",
        "body": "Titanium tubes and pipes carry **15%**. The \"Free (C)\" special rate applies, under additional U.S. note 2 to Chapter 81, only to tubes and pipes **with attached fittings, suitable for conducting gases or liquids**, "
        "that are certified for use in civil aircraft (general note 6, 19 CFR 10.183). With that certification the duty is **Free**; plain titanium sheet or bar for an aircraft does not qualify. "
        "Titanium mill products are exempt from the UK's 10% Section 301 duty (note 52(b)).",
    },
    {
        "title": "Tungsten powder vs unwrought tungsten from China",
        "line": "8101.10.00.00",
        "body": "Tungsten powder carries **7%** plus **25%** Section 301 (note 31(b), 9903.91.01, since September 27, 2024) = **32%**; it is on the note 52(b) list, so the 12.5% 2026 duty on China does not apply. "
        "Unwrought tungsten and sintered bars (8101.94) pay **6.6% + 25%** (note 31(j), 9903.91.11, since January 1, 2025) **+ 12.5%** (9903.05.31) = **44.1%**. "
        "On $100,000 that is $32,000 for powder and $44,100 for unwrought metal. Tungsten shot (often entered under 8101.99.80) from China also carries antidumping and countervailing duty orders.",
    },
    {
        "title": "Molybdenum powder from the United Kingdom: a duty on metal content",
        "line": "8102.10.00.00",
        "body": "The rate is **9.1¢/kg on molybdenum content + 1.2%**. The importer must declare the net weight of molybdenum contained, not just the gross weight. "
        "For 2,000 kg of powder containing 1,998 kg of molybdenum, worth $120,000: 1,998 × $0.091 = $181.82, plus 1.2% of $120,000 = $1,440. Molybdenum is not on the note 52(b) list, so the UK's 10% Section 301 duty (9903.05.81) adds $12,000: "
        "**$13,621.82 in total (about 11.4%)**. From the EU the 2026 duty is 10% in place of the base rate when that is lower, so the same shipment pays $12,000 (10%).",
    },
    {
        "title": "Pure magnesium ingot from China",
        "line": "8104.11.00.00",
        "body": "Unwrought magnesium of at least 99.8% carries **8%**. It is on the note 52(b) list and on no China Section 301 list, so the tariff is just **8%**. "
        "But pure magnesium from China has been under an **antidumping duty order since 1995**: Commerce's last sunset review found margins of up to 108.26% likely to prevail, and each exporter pays its own cash-deposit rate. "
        "Alloy magnesium (8104.19) and granular magnesium (8104.30) from China are under separate orders.",
    },
    {
        "title": "Cermets from Canada, with a USMCA certification",
        "line": "8113.00.00.00",
        "body": "Cermets carry **3.7%**, which USMCA reduces to Free, and USMCA goods are exempt from Canada's 10% Section 301 duty (9903.05.93). But cermets are on the Section 338 list (note 51(b)(3), 9903.03.14), which charges **50%** even when USMCA is claimed: "
        "**50%** with USMCA, **63.7%** without (3.7% + 10% + 50%). In effect since August 22, 2026.",
    },
    {
        "title": "Gallium and germanium from China",
        "line": "8112.92.10.00",
        "body": "Unwrought gallium carries **3%** plus **25%** under List 3 (9903.88.03) = **28%**; it is on the note 52(b) list, so the 12.5% 2026 duty does not apply. Unwrought germanium (8112.92.60) is on no China list: **2.6%**. "
        "Wrought germanium (8112.99.10) pays 4.4% + 25% = 29.4%. China's own export controls on these metals are Chinese rules, not U.S. duties.",
    },
]
o["notes"] = {
    "chapterNotes": "Chapter 81 has no chapter or subheading notes of its own in the HTSUS. The notes to Section XV (base metals and articles of base metal) apply to it.",
    "additionalUsNotes": (
        "**1.** Alloys of each of the base metals of Chapter 81 are metals in which the content of that base metal is, by weight, less than 99 percent, but not less than any other metallic element.\n\n"
        "**2.** For subheading 8108.90.60, the \"Free (C)\" special rate (civil aircraft) applies only to tubes and pipes with attached fittings, suitable for conducting gases or liquids.\n\n"
        "Statistical units: tungsten powder and scrap are also reported in kilograms of tungsten content (W kg), alloy magnesium and some magnesium products in kilograms of magnesium content (Mg kg), and vanadium in kilograms of vanadium (V kg)."
    ),
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
    "title": "Critical Minerals Tariff Updates 2025–2026: Tungsten, Titanium, Magnesium, Section 232 & Section 301 (HTS Ch. 81) | KoalaGains",
    "shortDescription": "Every U.S. tariff change for HTS Chapter 81 metals with official sources: the Section 232 critical minerals decision (no tariff), China's 25% Section 301 duty on tungsten, the 2026 Section 301 exemption list, "
    "Canada's Section 338 duty on cermets, the end of the IEEPA duties and the magnesium and tungsten shot AD/CVD orders.",
    "keywords": [
        "critical minerals tariffs",
        "section 232 critical minerals",
        "section 232 critical minerals tariffs",
        "us critical minerals tariff decision",
        "tungsten tariff china",
        "critical minerals exempt from tariffs",
        "china critical minerals tariffs",
        "tungsten tariff exemption",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current **2026 Revision 21** (in force October 9, 2026), and lists every extra duty that reaches Chapter 81 today. "
    "**Base rates did not move**: all 84 lines carry the same General, Special and Column 2 rates.\n\n"
    "The extra duties changed. The **Section 232 investigation of processed critical minerals** (opened April 2025) ended on January 14, 2026 with Proclamation 11001, which chose negotiations over tariffs, so no Section 232 duty applies. "
    "The IEEPA duties ended on **February 24, 2026**; most Chapter 81 lines had been exempt from the reciprocal tariff (Annex II) and from the Section 122 surcharge that followed. "
    "Since **July 24, 2026** the **2026 Section 301 tariffs** charge 10% or 12.5% on 32 lines from 60 economies; the other 52 lines are on the note 52(b) exemption list. "
    "**China** pays 25% under Section 301 on 59 lines (raised for tungsten, tantalum, chromium and indium in 2024–2025), **Brazil** 25% more on the same 32 lines, and **Canadian cermets** 50% under Section 338 since August 22, 2026.\n\n"
    "Antidumping orders on Chinese magnesium and tungsten shot are listed for reference; they are company-specific and **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 81 from any country: China Section 301 (notes 20 and 31), the 2026 Section 301 actions on 60 economies and Brazil (notes 50, 52), Canada Section 338 (note 51), "
    "Russia's rates in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. No Section 232 heading reaches Chapter 81 "
    "(the opt-in Section 232 certified-parts elections for vehicle parts are left off this page). The Section 232 critical minerals decision and the magnesium and tungsten shot AD/CVD orders are listed for reference. "
    "For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "84 of 84 lines", "note": "2025 Basic → 2026 Rev 21"},
    {"label": "Exempt from 2026 Section 301", "value": f"{len(EX52B)} of 84", "note": "U.S. note 52(b) list"},
    {"label": "China Section 301", "value": "25%", "note": f"{len(CN25)} lines; +12.5% more on {len(CN25 & CN125)}"},
    {"label": "Section 232 critical minerals", "value": "No tariff", "note": "Proclamation 11001, Jan. 2026"},
]

S301_SRC = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
EX_TXT = (
    f"Applies to {len(S301)} lines: unwrought tungsten, tungsten wire and other wrought tungsten (8101.94–8101.99), all molybdenum (8102), zirconium (8109), manganese scrap and articles (8111.00.30, .60), "
    "beryllium (8112.12–.19), hafnium (8112.31, .39), unwrought thallium and thallium scrap (8112.51, .52), cadmium (8112.61, .69), 8112.92 waste and scrap, unwrought vanadium (8112.92.70) and cermets (8113). "
    f"The other {len(EX52B)} lines are on the general exemption list (note 52(b), 9903.05.86). USMCA-qualifying goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94)."
)


def s301_entry(e, rate_txt, extra=""):
    e["exemption"] = EX_TXT + (" " + extra if extra else "")
    e["whatItMeans"] = rate_txt
    e["sourceIds"] = list(dict.fromkeys(e["sourceIds"]))


IE = {e["id"]: e for e in tu["inEffect"]}
need("fr-2018-20610", "fr-2019-09681", "fr-2024-21217", "fr-2024-29462", "fr-2026-20510", "procl-11048", "procl-11056", "procl-11065", "csms-69606660", "csms-69851916", "fr-2026-14542", "procl-10523", "pl-117-110")

cn = IE["cn-section-301"]
cn["measure"] = "Section 301: List 3, note 31 (2024 four-year review) and the 2026 action"
cn["ch99Code"] = "9903.88.03 / 9903.91.01 / 9903.91.11 / 9903.05.31"
cn["before"] = "+25% on 59 lines (List 3, and note 31 for tungsten powder, tantalum, chromium, indium and, from January 1, 2025, tungsten)"
cn["now"] = f"+25% on {len(CN25)} lines (+12.5% more on {len(CN25 & CN125)} of them); +12.5% only on {len(CN125 - CN25)} molybdenum, zirconium and manganese lines"
cn["exemption"] = (
    "List 3 (9903.88.03, 25%) covers cobalt, bismuth, titanium, magnesium powder and articles, zirconium scrap and articles, most minor metals and cermets. Note 31(b) (9903.91.01, 25% since September 27, 2024) covers tungsten powder, "
    "unwrought tantalum and powder, unwrought chromium and indium; note 31(j) (9903.91.11, 25% since January 1, 2025) covers unwrought tungsten, sintered bars and wrought tungsten (8101.94, 8101.99). "
    f"The 2026 12.5% duty (9903.05.31) adds to the {len(S301)} lines outside note 52(b). No China duty applies to {len(CNNONE)} lines: tungsten scrap, tantalum scrap and articles, unwrought magnesium and magnesium scrap, "
    "antimony, unwrought manganese, chromium scrap and unwrought germanium. USTR confirmed on October 7, 2026 that the 2018 actions continue during the four-year review."
)
cn["whatItMeans"] = "Chinese titanium sponge pays 40% (15% + 25%), unwrought tungsten 44.1%, gallium 28%, cobalt 25% to 29.4%; Chinese antimony and pure magnesium ingot pay only their base rate (magnesium also owes antidumping duty)."
cn["effectiveFrom"] = "2026-07-24"
cn["effectiveSourceId"] = "fr-2026-15181"
cn["sourceIds"] = ["fr-2026-15181", "fr-2024-21217", "fr-2024-29462", "fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15274", "hts-chapter-99", "hts-now"]

ca = IE["ca-section-301"]
ca["measure"] = "Section 338 (Canada) on cermets + Section 301 (2026, 60 economies)"
ca["now"] = "+50% on cermets (8113), USMCA or not; +10% on 32 lines without a USMCA claim"
ca["exemption"] = (
    "Cermets (8113.00.00) are on the note 51(b)(3) list and pay 50% under heading 9903.03.14 from August 22, 2026 (Proclamation 11048, start date set by Proclamation 11056); the heading charges +50% in its Special column too, "
    "so a USMCA claim does not remove it. No other Chapter 81 line is on the Section 338 lists. The 10% Section 301 duty (9903.05.29) applies to the 32 lines outside note 52(b) and is lifted for USMCA goods (9903.05.93)."
)
ca["whatItMeans"] = "USMCA-qualifying Canadian cobalt, titanium or tungsten is Free; Canadian cermets pay 50% (63.7% without USMCA)."
ca["effectiveFrom"] = "2026-08-22"
ca["effectiveSourceId"] = "procl-11048"
ca["sourceIds"] = ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "fr-2026-15181", "hts-chapter-99", "hts-now"]

mx = IE["mx-section-301"]
s301_entry(mx, "Mexican titanium, molybdenum or zirconium entered under USMCA pays nothing; without a USMCA claim, molybdenum bars pay 6.6% + 10%.")
mx["now"] = "+10% on 32 lines (USMCA goods exempt)"

br = IE["br-section-301"]
br["measure"] = "Section 301 (Brazil) + Section 301 (2026, 60 economies)"
br["now"] = "+37.5% on 32 lines (25% + 12.5%)"
br["exemption"] = (
    "The Brazil duty (9903.05.01) does not apply to the lines on its exemption list (note 50(a)(ii), 9903.05.03), which for Chapter 81 matches the note 52(b) list, so both Brazilian duties reach the same 32 lines. "
    "Most 8112 lines, including niobium and chromium, are exempt from both."
)
br["whatItMeans"] = "Brazilian niobium (8112.92.40) pays 4.9%; Brazilian molybdenum or zirconium pays its base rate plus 37.5%."
br["effectiveFrom"] = "2026-07-24"
br["effectiveSourceId"] = "fr-2026-15181"
br["sourceIds"] = ["fr-2026-15181", "fr-2026-14542", "fr-2026-15274", "hts-chapter-99", "hts-now"]

ru = IE["ru-section-301"]
ru["measure"] = "Column 2 rates + 70% in lieu of column 2 (note 30(d)) + Section 301 (2026, 60 economies)"
ru["before"] = "Column 2 rates; 70% in place of column 2 on 11 lines"
ru["now"] = f"70% in place of column 2 on {len(RU70)} lines; column 2 rates (Free to 100%) on the rest; +12.5% on 32 lines"
ru["exemption"] = (
    "Russia has paid column 2 rates since April 9, 2022 (Public Law 117-110). Note 30(d) (9903.90.09) replaces them with 70% on unwrought titanium and powders (8108.20), titanium scrap (8108.30), hafnium (8112.31), "
    "rhenium scrap (8112.41.10) and gallium, indium, niobium and 8112.92 scrap (8112.92.07–.40). The 12.5% 2026 Section 301 duty (9903.05.66) applies to the 32 lines outside note 52(b), including 8112.31 and 8112.92.07, which pay 82.5%."
)
ru["whatItMeans"] = "Russian titanium sponge pays 70%; Russian pure magnesium pays the 100% column 2 rate; Russian molybdenum bars 60% + 12.5%."
ru["effectiveFrom"] = "2026-07-24"
ru["effectiveSourceId"] = "fr-2026-15181"
ru["sourceIds"] = ["fr-2026-15181", "procl-10523", "procl-10420", "pl-117-110", "hts-chapter-99", "hts-now"]

FLOOR = {
    "jp-section-301": ("Japan", "12.5%", "Japanese molybdenum bars (6.6%) or cermets (3.7%) pay 12.5% in total; titanium sponge and other note 52(b) lines pay only their base rate."),
    "kr-section-301": ("South Korea", "12.5%", "KORUS makes the base rate Free, but on the 32 lines the 2026 duty sets a 12.5% total; Korean magnesium, bismuth and titanium are Free."),
    "eu-section-301": ("EU", "10%", "German or French molybdenum, zirconium and cermets pay 10% in total; titanium, tantalum and chromium pay only their base rate. EU 8112.92 waste and scrap is on the note 52(j) exception list (9903.05.97)."),
    "tw-section-301": ("Taiwan", "10%", "Taiwanese molybdenum or cermets pay 10% in total; 8112.92 waste and scrap is on Taiwan's note 52(j) exception list (9903.06.14)."),
}
J52 = "For this country 8112.92 waste and scrap (8112.92.07) is on a note 52(j) exception list, so 31 lines pay."
for k, (nm_, pct, what) in FLOOR.items():
    e = IE[k]
    s301_entry(e, what, J52 if k in ("eu-section-301", "tw-section-301") else "")
    e["now"] = f"{pct} in place of the base rate when the base rate is lower, on {32 if k in ('jp-section-301', 'kr-section-301') else 31} lines"
ADD = {
    "gb-section-301": "UK molybdenum powder pays 9.1¢/kg on molybdenum content + 11.2%; UK titanium, its largest supply, pays only its base rate.",
    "th-section-301": "Thai antimony and tantalum pay nothing extra (note 52(b)); Thai molybdenum or cermets pay 12.5% more.",
    "kz-section-301": "Kazakh titanium sponge and tantalum pay only their base rate (15%, 2.5%); molybdenum or beryllium pay 12.5% more.",
    "il-section-301": "The U.S.-Israel FTA makes Israeli magnesium and tungsten Free; molybdenum, zirconium or cermets pay 12.5%.",
    "in-section-301": "Indian antimony and titanium pay only their base rate; Indian molybdenum or cermets pay 10% more.",
    "no-section-301": "Norwegian cobalt is Free and exempt; Norwegian molybdenum or cermets pay 12.5% more.",
    "id-section-301": "Indonesian cobalt and manganese metal pay only their base rate (Free, 14%); molybdenum or cermets pay 10% more. 8112.92 waste and scrap is on Indonesia's note 52(j) exception list (9903.06.16).",
    "cl-section-301": "The U.S.-Chile FTA makes Chilean metal duty-free at base; rhenium (8112.41, 8112.49) then pays nothing, molybdenum pays the 12.5% Section 301 duty.",
    "sa-section-301": "Saudi titanium sponge pays 15% and no extra duty; Saudi molybdenum or cermets pay 12.5% more.",
}
for k, what in ADD.items():
    if k in IE:
        s301_entry(IE[k], what, J52 if k == "id-section-301" else "")
oth = IE["other-section-301"]
_n = re.search(r"\((\d+):", oth["country"]).group(1)
oth["country"] = f"{_n} other Section 301 economies (Algeria, Argentina, Australia, Bangladesh, Cambodia, Malaysia, Switzerland, Türkiye, the UAE, Vietnam and others)"
s301_entry(oth, "Products of the other 60 Section 301 economies pay 10% or 12.5% more (or 10% / 12.5% in place of a lower base rate) on the same 32 lines; countries outside the program pay only the base rate.",
           "Some of these economies also have a note 52(j) exception list that reaches 8112.92.07 (waste and scrap).")
for e in tu["inEffect"]:
    assert "TODO" not in json.dumps(e), e["id"]

need("fr-2025-22690", "fr-2025-23892", "hts-now-cr", "hts-before")


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    need(*ids)
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


base = next(c for c in tu["changes"] if c["id"] == "base-rates")
base["title"] = "No Chapter 81 base-rate changes"
base["detail"] = "All 84 Chapter 81 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; no line was added, removed or renumbered."
nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). Note 29 has no critical-minerals exemption, so it will reach all 84 lines. "
    "The rate is 0% in 2026."
)
nic["date"] = src["fr-2025-23892"]["published"]
nic["dateLabel"] = "Published"

changes = [
    base,
    nic,
    ch("cn-301-continue", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their anniversaries and remain in effect pending the statutory review. The 25% List 3 and note 31 duties on Chinese Chapter 81 metals continue.",
       None, None, "China", ["fr-2026-20510"]),
    ch("mg-alloy-review-2026", "pending", "2026-10-01", "Published", "Five-year review of the alloy magnesium order on China begins",
       "Commerce and the ITC began the fourth five-year (sunset) review of the 2005 antidumping duty order on alloy magnesium (magnesium metal) from China (A-570-896, 731-TA-1071). Responses to the ITC were due November 2, 2026. The order stays in force during the review.",
       None, "Order continues during review", "China", ["fr-2026-20138", "fr-2026-20161", "fr-2021-25770"]),
    ch("mg-pure-court-2026", "reference", "2026-09-01", "Published", "Pure magnesium from China: margin amended after a court ruling",
       "After the Court of International Trade sustained Commerce's remand on the electricity surrogate value (Tianjin Magnesium International v. United States, final judgment August 14, 2026), Commerce amended the 2022–2023 review result "
       "for Tianjin Magnesium International / Tianjin Magnesium Metal (previously 25.26%) and will issue revised cash-deposit instructions to CBP.",
       "25.26% (2022–2023 review)", "Amended margin", "China", ["fr-2026-17770", "fr-2025-01304"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Section 338 duty on Canadian cermets",
       "Proclamation 11048 put a 50% Section 338 duty (9903.03.14, note 51(b)(3)) on a list of Canadian products that includes cermets (8113.00.00); Proclamation 11056 moved the start from August 19 to August 22, 2026. "
       "The duty applies even to USMCA goods. Proclamation 11065 later changed the list from September 15, 2026 (adding aluminum extrusions and tubes) but left cermets on it. No other Chapter 81 line is covered.",
       None, "+50% (cermets)", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "hts-chapter-99"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: 52 of 84 lines exempt",
       f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. The note 52(b) list (9903.05.86) exempts {len(EX52B)} Chapter 81 lines: tungsten powder and scrap, tantalum, magnesium, cobalt, bismuth, titanium, antimony, "
       "unwrought manganese, chromium, rhenium, gallium, germanium, indium, niobium and vanadium (8112.99.20). The other 32 pay: unwrought and wrought tungsten, molybdenum, zirconium, manganese scrap and articles, beryllium, hafnium, unwrought thallium, cadmium, "
       "unwrought vanadium and cermets. The EU, Japan, Korea and Taiwan pay 10% or 12.5% in place of a lower base rate; USMCA goods are exempt.",
       None, "+10% to +12.5% (32 lines)", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. Its exemption list (9903.03.03) covered the same Chapter 81 metals as the later note 52(b) list, except vanadium (8112.99.20).",
       "+10%", None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: 25%, critical metals exempt",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. Its exemption list (note 50(a)(ii), 9903.05.03) has the same Chapter 81 lines as note 52(b), so Brazilian niobium, chromium, titanium and other listed metals are exempt; "
       "molybdenum, zirconium, beryllium and cermets pay 25% plus the 12.5% 2026 duty.",
       None, "+25% (32 lines)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("agoa-2026", "reference", "2026-05-19", "Signed", "AGOA duty-free treatment extended through December 31, 2026",
       "Proclamation 11030 implemented the Consolidated Appropriations Act, 2026: AGOA (SPI D) applies through December 31, 2026. Madagascar and South Africa, which ship cobalt and manganese, are listed beneficiaries (general note 16). "
       "Most Chapter 81 lines carry SPI D; unwrought manganese other than flake (8111.00.49) does not.",
       None, "Free (SPI D)", "AGOA beneficiaries", ["procl-11030", "hts-gn"]),
    ch("critmin-plurilateral", "reference", "2026-02-26", "Published", "USTR consults on a plurilateral critical-minerals agreement",
       "Following Proclamation 11001, USTR requested comments on the design of a plurilateral agreement on trade in critical minerals and on policy actions such as price floors. No tariff has been set on Chapter 81 metals.",
       None, None, "All", ["fr-2026-03868", "procl-11001"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; most Chapter 81 metals exempt",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. 41 Chapter 81 subheadings were on its exemption list (9903.03.03), as were USMCA goods of Canada and Mexico. "
       "Molybdenum, zirconium, beryllium, hafnium, cadmium, unwrought thallium and vanadium, cermets and tungsten other than powder and scrap paid it.",
       None, "+10% (ended)", "All", ["procl-11012", "csms-67844987", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, "
       "and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24, 2026.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("s232-critmin", "reference", "2026-01-14", "Signed", "Section 232 processed critical minerals: negotiations, no tariff",
       "Proclamation 11001 concurred with Commerce's finding (report of October 24, 2025) that imports of processed critical minerals and their derivative products threaten national security, but directed Commerce and USTR to negotiate agreements, "
       "considering price floors, instead of imposing tariffs, with an update due within 180 days; minimum import prices were named as a possible later remedy. No Section 232 duty applies to Chapter 81.",
       None, "No tariff", "All", ["procl-11001", "eo-14272"]),
    ch("cn-ka-arrangement", "reference", "2025-11-10", "Effective", "China IEEPA duties cut; China commits to ease critical-mineral export controls",
       "Executive Order 14357 cut the China fentanyl duty from 20% to 10% and Executive Order 14358 kept the reciprocal duty on China at 10%, both from November 10, 2025, under the Kuala Lumpur arrangement. "
       "In it China committed to postpone and effectively eliminate its current and proposed export controls on rare earth elements and other critical minerals. Those controls are Chinese export rules, not U.S. import duties. Ended February 24, 2026.",
       "+20% fentanyl", "+10% (ended)", "China", ["eo-14357", "eo-14358"]),
    ch("tungsten-shot-2025", "reference", "2025-08-27", "Published", "AD/CVD orders on tungsten shot from China",
       "Commerce issued antidumping and countervailing duty orders on tungsten shot (spheres 1.5 to 10 mm, at least 92.6% tungsten) from China, entered under 9306.29.00 or 8101.99.80. "
       "The China-wide antidumping rate is 201.32% and the all-others subsidy rate 55.64%; the ITC found material retardation of the U.S. industry.",
       None, "AD/CVD cash deposits", "China", ["fr-2025-16422"]),
    ch("ca-35", "extraDuty", "2025-08-01", "Effective", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10); energy and critical minerals as defined by 30 U.S.C. 1606(a)(3) (9903.01.13) stayed at 10%. Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("cn-recip-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal duty cut to 10%",
       "Executive Order 14298 cut the reciprocal duty on China from 125% to 10% for 90 days, later extended. The Annex II exemption still covered most Chapter 81 lines; the 20% fentanyl duty applied to all of them. Ended February 24, 2026.",
       "+125%", "+10% (ended)", "China", ["eo-14298"]),
    ch("s232-critmin-start", "reference", "2025-04-15", "Signed", "Section 232 investigation of processed critical minerals opened",
       "Executive Order 14272 told Commerce to investigate imports of processed critical minerals and their derivative products under Section 232; BIS asked for public comments on April 25, 2025. It ended with Proclamation 11001 (no tariff).",
       None, None, "All", ["eo-14272", "fr-2025-07273"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff: most Chapter 81 metals exempt",
       "10% baseline (9903.01.25) and country rates (9903.02.xx) on products of all countries except Canada and Mexico, from April 5, 2025. 41 Chapter 81 subheadings were on the Annex II exemption list (U.S. note 2(v)(iii)): "
       "tungsten powder and scrap, tantalum, magnesium, cobalt, bismuth, titanium, antimony, unwrought manganese, chromium, rhenium, gallium, germanium, indium, niobium and other 8112 metals. Molybdenum, zirconium, beryllium, hafnium, cadmium, unwrought thallium and vanadium, "
       "manganese scrap and articles, cermets and unwrought and wrought tungsten (other than powder and scrap) paid. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("usmca-ieepa", "reference", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
       "+25% (+10% Canadian energy and critical minerals)", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("cn-fentanyl-20", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "Executive Order 14228 added another 10% (9903.01.24) to the IEEPA duty on products of China (9903.01.20), for 20% in total. No Chapter 81 line was exempt. Cut to 10% on November 10, 2025; ended February 24, 2026.",
       "+10%", "+20% (ended)", "China", ["eo-14228"]),
    ch("ca-mx-ieepa", "extraDuty", "2025-02-01", "Signed", "IEEPA duties on Canada, Mexico and China",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025, with 10% for Canadian energy and critical minerals (9903.01.13), and +10% on goods of China (9903.01.20) from February 4, 2025. Ended February 24, 2026.",
       None, "+25% / +10% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195"]),
    ch("cn-31j", "extraDuty", "2025-01-01", "Effective", "China: 25% on tungsten products",
       "After its four-year review USTR raised the Section 301 duty on Chinese unwrought tungsten, sintered bars and wrought tungsten (8101.94, 8101.99.10, 8101.99.80; note 31(j), 9903.91.11) to 25%, together with wafers and polysilicon.",
       "None", "+25%", "China", ["fr-2024-29462"]),
    ch("cn-31b", "extraDuty", "2024-09-27", "Effective", "China: 25% on critical minerals (four-year review)",
       "USTR's four-year review added a 25% duty (note 31(b), 9903.91.01) on Chinese tungsten powder (8101.10), unwrought tantalum and powder (8103.20), unwrought chromium (8112.21) and indium (8112.92.30), among other critical minerals.",
       "None", "+25%", "China", ["fr-2024-21217"]),
    ch("mg-granular-2023", "reference", "2023-09-27", "Published", "Granular pure magnesium order on China continued",
       "After a fourth five-year review, Commerce continued the 2001 antidumping duty order on pure magnesium in granular form (raspings, granules, turnings, chips, powder) from China; it had found margins of up to 305.56% likely to prevail.",
       None, None, "China", ["fr-2023-20940", "fr-2023-12030"]),
    ch("mg-pure-2023", "reference", "2023-05-25", "Published", "Pure magnesium order on China continued",
       "After a fifth five-year review, Commerce continued the 1995 antidumping duty order on pure magnesium (ingot) from China, which covers 8104.11, 8104.19 and other subheadings; it had found margins of up to 108.26% likely to prevail.",
       None, None, "China", ["fr-2023-11146", "fr-2022-12707"]),
    ch("russia-70", "extraDuty", "2023-04-01", "Effective", "Russia: 70% on titanium and minor metals",
       "Proclamation 10523 set a 70% rate in place of column 2 (9903.90.09, note 30(d)) on Russian unwrought titanium and powders, titanium scrap, hafnium, rhenium scrap, gallium, indium, niobium and 8112.92 waste and scrap.",
       "Column 2", "70%", "Russia", ["procl-10523", "hts-chapter-99"]),
    ch("russia-col2", "reference", "2022-04-08", "Signed", "Russia moved to column 2 rates",
       "The Suspending Normal Trade Relations with Russia and Belarus Act applied column 2 rates to products of Russia and Belarus from April 9, 2022. In Chapter 81 these run from Free to 100% (pure magnesium).",
       "Column 1 (normal trade relations)", "Column 2", "Russia, Belarus", ["pl-117-110"]),
    ch("mg-alloy-2021", "reference", "2021-11-26", "Published", "Alloy magnesium (magnesium metal) order on China continued",
       "After a third five-year review, Commerce continued the 2005 antidumping duty order on magnesium metal (alloy magnesium) from China; it had found margins of up to 141.49% likely to prevail.",
       None, None, "China", ["fr-2021-25770", "fr-2021-20009"]),
    ch("ti-sponge-232", "reference", "2020-02-27", "Signed", "Section 232 titanium sponge: no tariff, a working group instead",
       "Commerce found (report of November 29, 2019) that titanium sponge imports threaten to impair national security. On February 27, 2020 the President directed an interagency Titanium Sponge Working Group, not tariffs, to ensure access to sponge for defense; "
       "its report was posted in July 2023. No Section 232 duty was imposed on titanium sponge.",
       None, "No tariff", "All", ["fr-2023-16624", "fr-2021-23301"]),
    ch("mg-israel-2020", "reference", "2020-01-17", "Published", "No AD/CVD orders on magnesium from Israel",
       "Commerce had found dumping and subsidies on magnesium from Israel (8104.11, 8104.19, 8104.30), but the ITC determined that the U.S. industry was not materially injured or threatened, so no orders were issued.",
       None, "No orders", "Israel", ["fr-2020-00697"]),
    ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%",
       "List 3 (9903.88.03) took effect at 10% on September 24, 2018 and rose to 25% on May 10, 2019. In Chapter 81 it covers cobalt, bismuth, titanium, magnesium powder and articles, zirconium scrap and articles, tungsten and molybdenum wire, most 8112 metals and cermets.",
       "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
    ch("ti-sponge-adcvd-2017", "reference", "2017-10-16", "Published", "No AD/CVD case on titanium sponge from Japan and Kazakhstan",
       "The ITC found no reasonable indication of injury from titanium sponge (8108.20.00) from Japan and Kazakhstan, ending the antidumping and countervailing duty investigations at the preliminary stage.",
       None, "No orders", "Japan, Kazakhstan", ["fr-2017-22266"]),
]
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes

used = set()
for e in tu["inEffect"]:
    used.update(e["sourceIds"])
for c in tu["changes"]:
    used.update(c["sourceIds"])
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch81"])
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["seo"] = {
    "title": "Critical Minerals Tariffs by Country: China, Japan, Canada, Germany, UK, Korea (HTS Ch. 81) | KoalaGains",
    "shortDescription": "The total U.S. tariff on tungsten, titanium, magnesium, cobalt, molybdenum and other Chapter 81 metals from each major supplier: base rate plus the 2026 Section 301 duty on 32 lines, China's 25%, Brazil 37.5%, "
    "Canadian cermets 50%, Russia's column 2 and 70% rates, and the FTA and USMCA preferences.",
    "keywords": [
        "critical minerals tariffs by country",
        "china critical minerals tariffs",
        "canada critical minerals tariffs",
        "tungsten tariff china",
        "us tariffs on titanium",
        "titanium tariffs",
        "cobalt tariffs",
        "magnesium tariff",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. Three things decide the total: "
    "whether the line is on the **note 52(b) exemption list** (then no 2026 Section 301 duty applies: titanium, tantalum, magnesium, cobalt, bismuth, antimony, unwrought manganese, chromium, gallium, germanium, indium, niobium, tungsten powder and scrap), "
    "whether the supplier is **China** (25% Section 301 on 59 lines), and whether a **free trade agreement** removes the base rate.\n\n"
    "So Japanese titanium sponge pays its 15% base rate, Chinese sponge 40%, Kazakh sponge 15% and Russian sponge 70%; molybdenum, zirconium and cermets pay their base rate plus 10% or 12.5% from most suppliers, "
    "and Canadian cermets pay 50% under Section 338 even with USMCA. The table does **not** include the antidumping duties on Chinese magnesium and tungsten shot."
)
R = {
    "China": ("+25% Section 301 on 59 lines (List 3, 9903.88.03; note 31, 9903.91.01 and 9903.91.11), +12.5% (9903.05.31) on the 32 lines outside note 52(b): 22 lines pay both (unwrought tungsten 44.1%, cermets 41.2%). "
              "Titanium 25% to 40%, cobalt 25% to 29.4%, gallium 28%. Free or base rate only on antimony, unwrought magnesium, tantalum scrap and articles, unwrought manganese and unwrought germanium. "
              "Pure, granular and alloy magnesium and tungsten shot also carry antidumping duty orders, not shown.",
              ["fr-2026-15181", "fr-2018-20610", "fr-2019-09681", "fr-2024-21217", "fr-2024-29462", "fr-2026-20510", "hts-now"]),
    "Japan": ("Base rate on the 52 note 52(b) lines (titanium sponge 15%); on the other 32 lines the 2026 Section 301 rate is 12.5% in place of the base rate when that is lower (9903.05.49). Japan has no FTA. "
              "Titanium tubes with attached fittings for civil aircraft are Free (SPI C).",
              ["fr-2026-15181", "hts-now"]),
    "Germany": ("EU: base rate on the note 52(b) lines; 10% in place of a lower base rate on 31 lines (9903.05.39). 8112.92 waste and scrap is on the EU's note 52(j) exception list (9903.05.97).",
                ["fr-2026-15181", "hts-now"]),
    "France": ("EU: base rate on the note 52(b) lines (titanium, tantalum); zirconium, the main French supply, pays 10% in place of its lower base rate (9903.05.39). 8112.92 waste and scrap is on the EU's note 52(j) exception list.",
               ["fr-2026-15181", "hts-now"]),
    "United Kingdom": ("Base rate on the note 52(b) lines (titanium, chromium, rhenium); +10% Section 301 (9903.05.81) on the other 32 lines, such as molybdenum and cermets.",
                       ["fr-2026-15181", "hts-now"]),
    "Canada": ("USMCA-qualifying: Free on every line except cermets (8113), which pay the 50% Section 338 duty (9903.03.14) since August 22, 2026, USMCA or not. "
               "Without USMCA: base rate, +10% Section 301 (9903.05.29) on 32 lines, and cermets 63.7%.",
               ["procl-11048", "procl-11056", "fr-2026-15181", "hts-now"]),
    "South Korea": ("KORUS makes the base rate Free. On the 32 lines outside note 52(b), the 2026 Section 301 rate is 12.5% in place of the base rate (9903.05.71), so Korean molybdenum, zirconium or cermets pay 12.5%; magnesium, bismuth and titanium are Free.",
                    ["fr-2026-15181", "hts-now"]),
    "Thailand": ("Base rate on the note 52(b) lines (antimony and tantalum, Thailand's main supplies, Free and 2.5%); +12.5% Section 301 (9903.05.77) on the other 32 lines.",
                 ["fr-2026-15181", "hts-now"]),
    "Kazakhstan": ("Base rate on the note 52(b) lines (titanium sponge 15%, tantalum 2.5%); +12.5% Section 301 (9903.05.51) on the other 32 lines.",
                   ["fr-2026-15181", "hts-now"]),
    "Mexico": ("USMCA-qualifying: Free on every line. Without USMCA: base rate, +10% Section 301 (9903.05.55) on 32 lines.",
               ["fr-2026-15181", "hts-now"]),
    "Israel": ("The U.S.-Israel FTA makes the base rate Free; +12.5% Section 301 (9903.05.47) on the 32 lines outside note 52(b). Israeli magnesium, the main supply, is Free (the 2019 AD/CVD case ended without orders).",
               ["fr-2026-15181", "fr-2020-00697", "hts-now"]),
    "Brazil": ("Base rate on the note 52(b) lines (niobium 4.9%, chromium, titanium); +25% Brazil Section 301 (9903.05.01) and +12.5% (9903.05.27) on the other 32 lines: 37.5% more.",
               ["fr-2026-14542", "fr-2026-15181", "hts-now"]),
    "India": ("Base rate on the note 52(b) lines (antimony Free, titanium); +10% Section 301 (9903.05.44) on the other 32 lines.",
              ["fr-2026-15181", "hts-now"]),
    "Norway": ("Base rate on the note 52(b) lines (cobalt, Norway's main supply, Free or 4.4%); +12.5% Section 301 (9903.05.60) on the other 32 lines.",
               ["fr-2026-15181", "hts-now"]),
    "Indonesia": ("Base rate on the note 52(b) lines (cobalt, unwrought manganese 14%); +10% Section 301 (9903.05.45) on 31 lines; 8112.92 waste and scrap is on Indonesia's note 52(j) exception list (9903.06.16).",
                  ["fr-2026-15181", "hts-now"]),
    "Taiwan": ("Base rate on the note 52(b) lines; 10% in place of a lower base rate on 31 lines (9903.05.76); 8112.92 waste and scrap is on Taiwan's note 52(j) exception list (9903.06.14).",
               ["fr-2026-15181", "hts-now"]),
    "Chile": ("The U.S.-Chile FTA makes the base rate Free; +12.5% Section 301 (9903.05.30) on the 32 lines outside note 52(b), such as molybdenum. Chilean rhenium is Free.",
              ["fr-2026-15181", "hts-now"]),
    "Saudi Arabia": ("Base rate on the note 52(b) lines (titanium sponge 15%); +12.5% Section 301 (9903.05.67) on the other 32 lines.",
                     ["fr-2026-15181", "hts-now"]),
    "Madagascar": ("AGOA (SPI D, through December 31, 2026) makes most lines Free, including the cobalt Madagascar ships; unwrought manganese other than flake (8111.00.49) has no D rate and pays 14%. Madagascar is not one of the 60 Section 301 economies.",
                   ["procl-11030", "hts-gn", "hts-now"]),
    "Russia": ("Column 2 rates (Free to 100%) since April 2022, or 70% in their place on 11 note 30(d) lines (unwrought titanium and scrap, hafnium, rhenium scrap, gallium, indium, niobium, 8112.92 scrap) (9903.90.09); "
               "+12.5% Section 301 (9903.05.66) on 32 lines, so hafnium and 8112.92 scrap pay 82.5%.",
               ["procl-10523", "pl-117-110", "fr-2026-15181", "hts-now"]),
}
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        label, ids = R[c["country"]]
        rule["label"], rule["sourceIds"] = label, ids
    elif c["country"] == "Any other country":
        rule["label"] = (
            "Base rate only for countries outside the 2026 Section 301 program; the other Section 301 economies pay up to 12.5% more on the 32 lines outside note 52(b). "
            "Column 2 countries (Belarus, Cuba, North Korea) pay column 2 rates; Nicaragua's Section 301 duty starts January 1, 2027."
        )
        rule["sourceIds"] = ["fr-2026-15181", "fr-2025-23892", "hts-now"]
    else:
        raise SystemExit(f"no rule label for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "No Section 232 duty applies to Chapter 81: the processed critical minerals investigation ended in negotiations (Proclamation 11001), and the Section 232 metals, vehicle-parts and semiconductor headings do not list Chapter 81 lines. "
    "The opt-in Section 232 certified-parts elections for vehicle parts are not applied.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Antidumping and countervailing duties are not included: pure magnesium, granular pure magnesium and alloy magnesium from China, and tungsten shot from China, pay company-specific cash deposits on top.",
    "Compound rates (molybdenum powder and unwrought molybdenum, other magnesium articles) are charged per kilogram of metal content plus a percentage; the importer declares the metal content.",
    "Entry rules: TSCA import certification for chemical substances in bulk, country of origin marking, and civil aircraft certification for the Free (C) rate on titanium tubes with fittings.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2(v)(iii), 2(aa), 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The note 52(b) general exemption list (9903.05.86) names 42 Chapter 81 subheadings (52 of the 84 lines); "
    "the Brazil list (note 50(a)(ii)) names the same ones. Note 52(j) country exception lists name only 8112.92.07 (EU, Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador, Jordan). "
    "Notes 20 (List 3) and 31(b), 31(j) name 59 Chapter 81 lines for China; note 51(b)(3) names 8113.00.00 for Canada; note 30(d) names 8108.20, 8108.30, 8112.31, 8112.41.10 and 8112.92.07–.40 for Russia. "
    "No Section 232 note (16, 19, 33, 38, 39) lists a Chapter 81 heading. measures.json models all of these."
)
ia_ids = {"hts-now"}
for c in ia["countries"]:
    ia_ids.update(c["rule"]["sourceIds"])
need(*ia_ids)
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Tungsten, Titanium & Other Chapter 81 Metals: Entry Rules & Ways to Lower Duty | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 81 line (TSCA certification, marking, Section 301 and Section 338 entry, magnesium and tungsten shot AD/CVD scope) and the legal ways to pay less: the note 52(b) exemption list, USMCA and FTA claims, "
    "AGOA, civil aircraft titanium tubes, metal processed abroad (9802.00.60), origin and drawback.",
    "keywords": [
        "HTS Chapter 81",
        "Tariff Engineering",
        "tungsten tariff exemption",
        "critical minerals exempt from tariffs",
        "tariff code for titanium",
        "magnesium tariff code",
        "tungsten carbide tariff code",
        "cermet hs code",
    ],
}
te["intro"] = (
    "For Chapter 81, the duty mostly depends on **which line the metal falls in and where it comes from**. The 2026 Section 301 exemption list (note 52(b)) works line by line: tungsten powder is exempt but unwrought tungsten is not; "
    "unwrought germanium and manganese are exempt, wrought molybdenum and cermets are not. China's Section 301 duty adds 25% on most lines, and Canada's Section 338 duty adds 50% to cermets.\n\n"
    "The legal ways to pay less: classify correctly (powder, unwrought, scrap and wrought metal are separate lines), claim **USMCA**, an **FTA** or **AGOA**, use the **civil aircraft** rate for titanium tubes with fittings, "
    "enter metal processed abroad from U.S. material under **9802.00.60**, avoid Chinese origin on listed lines, check **AD/CVD scope** for magnesium and tungsten shot, and claim **drawback** on re-exports. Each rule and lever links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
need("fr-2025-16422", "fr-2023-11146", "fr-2023-20940", "fr-2021-25770")
te["levers"] = [
    {
        "id": "classify-52b",
        "title": "Classify the form of the metal correctly (note 52(b) list)",
        "saves": "The 10% or 12.5% 2026 Section 301 duty (and Brazil's 25%) on lines on the note 52(b) exemption list",
        "appliesTo": "All 84 lines; the exempt and non-exempt lines sit side by side in 8101, 8111 and 8112",
        "document": "Technical specifications (form, purity, whether sintered, worked or alloyed) and, if unsure, a CBP binding ruling. Report 9903.05.86 with the exempt line.",
        "caveat": "Classification follows the product, not the duty: tungsten powder (8101.10) is exempt, unwrought tungsten and sintered bars (8101.94) are not; unwrought germanium (8112.92.60) is exempt, other germanium (8112.99.10) too, "
        "but unwrought vanadium (8112.92.70) is not. Molybdenum, zirconium and cermets have no exempt line.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b), heading 9903.05.86", "url": CH99},
            {"label": "HTSUS Chapter 81", "url": CH81},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR19}/part-177"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican metal",
        "saves": "The base rate (up to 15% on titanium, 14% on manganese) and the 10% Section 301 duty (9903.05.93, 9903.05.94)",
        "appliesTo": "Originating goods of Canada or Mexico on every line",
        "document": "A USMCA certification of origin from the importer, exporter or producer (no set format), in the importer's possession when the claim is made; origin under the Chapter 81 tariff-shift rules (waste and scrap originate where collected).",
        "caveat": "Does not remove the 50% Section 338 duty on Canadian cermets (8113). The USMCA joint review did not renew the agreement, but it remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": f"{ECFR19}/section-182.12"},
            {"label": "19 CFR 102.20 (Chapter 81 rules)", "url": f"{ECFR19}/section-102.20"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "fta-agoa",
        "title": "Claim an FTA or AGOA rate",
        "saves": "The base rate: Free instead of up to 15% (titanium), 8.5% (beryllium) or 14% (manganese)",
        "appliesTo": "Originating goods of Korea, Israel, Chile, Australia and other FTA partners, and of AGOA beneficiaries such as Madagascar and South Africa (SPI D, through December 31, 2026)",
        "document": "The origin documentation each agreement requires, and the SPI on the entry line (KR, IL, CL, AU, D and others).",
        "caveat": "The 2026 Section 301 duty still applies to the 32 non-exempt lines (for Korea a 12.5% total replaces the base rate). GSP (A, A+, A*) has lapsed and gives no reduction. 8111.00.49 has no AGOA rate.",
        "citations": [
            {"label": "HTSUS General Notes (notes 3(c), 16)", "url": src["hts-gn"]["url"]},
            {"label": "Proclamation 11030 (AGOA through 2026)", "url": src["procl-11030"]["url"]},
        ],
    },
    {
        "id": "civil-aircraft",
        "title": "Civil aircraft titanium tubes with attached fittings",
        "saves": "The 15% base rate on titanium tubes and pipes (Free under SPI C)",
        "appliesTo": "Titanium tubes and pipes with attached fittings, suitable for conducting gases or liquids, of 8108.90.60, for civil aircraft",
        "document": "Civil aircraft certification under general note 6 and 19 CFR 10.183 (written certification that the article is for a civil aircraft and FAA-approved where required).",
        "caveat": "Additional U.S. note 2 to Chapter 81 limits the Free (C) rate to tubes and pipes with attached fittings: titanium sheet, bar or plain tube for aircraft pays 15%. No 2026 Section 301 duty applies to titanium anyway.",
        "citations": [
            {"label": "HTSUS Chapter 81, additional U.S. note 2", "url": CH81},
            {"label": "19 CFR 10.183", "url": f"{ECFR19}/section-10.183"},
        ],
    },
    {
        "id": "metal-processed-abroad",
        "title": "U.S. metal processed abroad (9802.00.60)",
        "saves": "Duty on the full value: the base rate and the Section 301, Section 338 and Russia duties apply only to the value of the processing abroad",
        "appliesTo": "Articles of metal made or processed in the United States, exported for further processing and returned for further processing (for example U.S. titanium or tungsten rolled, drawn or machined abroad)",
        "document": "Entry under 9802.00.60 with the declarations of 19 CFR 10.9 (foreign processor and importer) showing the U.S. metal and the cost of processing.",
        "caveat": "The returned article must be further processed in the United States. CBP decides whether the claim fits; the Chapter 99 notes (for example 52 and 30) say the extra duties apply to the value of the processing.",
        "provisions": [
            {"code": "9802.00.60", "rate": "A duty upon the value of such processing outside the United States", "text": "Any article of metal manufactured in the United States or subjected to a process of manufacture in the United States, exported for further processing and returned for further processing"},
        ],
        "citations": [
            {"label": "HTSUS Ch. 98, subheading 9802.00.60", "url": "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"},
            {"label": "19 CFR 10.9", "url": f"{ECFR19}/section-10.9"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese origin on listed lines",
        "saves": "The 25% Section 301 duty (List 3, note 31) on 59 lines, plus any antidumping duty on magnesium and tungsten shot",
        "appliesTo": "All lines on the China lists: tungsten, cobalt, bismuth, titanium, tantalum, most 8112 metals, cermets",
        "document": "Mill certificates and production records showing where the metal was smelted, refined or last substantially transformed (origin for Section 301 follows substantial transformation; ask CBP for a binding ruling).",
        "caveat": "Remelting or simple processing in a third country may not change origin; Chinese metal that is only repackaged stays Chinese. Antimony, unwrought magnesium and unwrought germanium are on no China list, so origin matters less there (magnesium AD orders still apply).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 31", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR19}/part-177"},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check AD/CVD scope before you buy",
        "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
        "appliesTo": "Pure, granular and alloy magnesium from China (8104.11, 8104.19, 8104.30, 8104.90) and tungsten shot from China (8101.99.80, 9306.29)",
        "document": "The order's written scope (it, not the HTS number, decides) and the exporter's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
        "caveat": "The three magnesium orders split the product by purity, form and ASTM alloy specification; reagent mixtures with 90% or less magnesium are excluded from the granular and alloy orders. Rates change with each administrative review.",
        "citations": [
            {"label": "19 CFR 351.225 (scope rulings)", "url": f"{ECFR19}/section-351.225"},
            {"label": "Pure magnesium order continued (88 FR 33862)", "url": src["fr-2023-11146"]["url"]},
            {"label": "Tungsten shot orders (90 FR 41811)", "url": src["fr-2025-16422"]["url"]},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback on re-exported metal",
        "saves": "Up to 99% of the base rate, Section 301 and other ordinary duties on goods that are exported or used in exported products",
        "appliesTo": "All lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties are never refundable (19 CFR 191.3). Check the Chapter 99 note of each extra duty for drawback limits.",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR19}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR19}/section-191.3"},
        ],
    },
]
te["rules"] = [
    {"id": "tsca", "agency": "EPA / CBP", "title": "TSCA import certification (positive or negative) for chemical substances in bulk, such as metal powders and unwrought metals, filed before release",
     "citations": [{"label": "19 CFR 12.121", "url": f"{ECFR19}/section-12.121"}, {"label": "19 CFR 12.118", "url": f"{ECFR19}/section-12.118"}, {"label": "40 CFR 707.20", "url": f"{ECFR40}/section-707.20"}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container; waste and scrap originate where collected",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR19}/section-134.11"}, {"label": "19 CFR 102.20 (Chapter 81 note)", "url": f"{ECFR19}/section-102.20"}]},
    {"id": "s301-entry", "agency": "CBP", "title": "Section 301: report the 2026 heading for the country (9903.05.20–9903.05.84) or the exemption heading 9903.05.86, the Brazil heading (9903.05.01 / .03), and for China 9903.88.03, 9903.91.01 or 9903.91.11 with the Chapter 81 line",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 31, 50, 52", "url": CH99}, {"label": "91 FR 47318 (2026 Section 301 actions)", "url": src["fr-2026-15181"]["url"]}]},
    {"id": "s338", "agency": "CBP", "title": "Canada Section 338: report 9903.03.14 (+50%) with 8113.00.00 for products of Canada, also on USMCA entries",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 51", "url": CH99}, {"label": "CBP CSMS # 69606660", "url": src["csms-69606660"]["url"]}]},
    {"id": "russia", "agency": "CBP", "title": "Products of Russia: column 2 rates, or 70% in lieu of column 2 (9903.90.09) on the note 30(d) lines",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10523 (88 FR 13277)", "url": src["procl-10523"]["url"]}]},
    {"id": "civil-aircraft-cert", "agency": "CBP", "title": "Civil aircraft (SPI C): certification for titanium tubes and pipes with attached fittings (8108.90.60)",
     "citations": [{"label": "19 CFR 10.183", "url": f"{ECFR19}/section-10.183"}, {"label": "HTSUS Chapter 81, additional U.S. note 2", "url": CH81}]},
    {"id": "adcvd-magnesium", "agency": "Commerce (ITA) / CBP", "title": "Magnesium AD orders on China: pure magnesium (1995, continued 2023), granular pure magnesium (2001, continued 2023), alloy magnesium (2005, continued 2021; sunset review begun October 2026). Not in the tariff calculator",
     "citations": [{"label": "88 FR 33862 (pure magnesium continued)", "url": src["fr-2023-11146"]["url"]}, {"label": "88 FR 66376 (granular continued)", "url": src["fr-2023-20940"]["url"]},
                   {"label": "86 FR 67439 (alloy magnesium continued)", "url": src["fr-2021-25770"]["url"]}, {"label": "91 FR 62550 (ITC review 2026)", "url": src["fr-2026-20138"]["url"]}]},
    {"id": "adcvd-tungsten-shot", "agency": "Commerce (ITA) / CBP", "title": "Tungsten shot AD/CVD orders on China (August 2025; China-wide AD 201.32%, all-others CVD 55.64%), entered under 9306.29.00 or 8101.99.80. Not in the tariff calculator",
     "citations": [{"label": "90 FR 41811 (AD/CVD orders)", "url": src["fr-2025-16422"]["url"]}]},
]
RULES_ALL = ["tsca", "marking", "s301-entry", "russia"]
GROUP_EXTRA_RULES = {"8104": ["adcvd-magnesium"], "8113": ["s338"], "8108": ["civil-aircraft-cert"], "8101": ["adcvd-tungsten-shot"]}
GROUP_NOTES = {
    "8101": "Powder and scrap are exempt from the 2026 Section 301 duty; unwrought, wire and wrought tungsten are not. China 25% (note 31). Tungsten shot from China is under AD/CVD orders (8101.99.80).",
    "8102": "No note 52(b) line: every molybdenum line pays the 2026 Section 301 duty. Powder and unwrought molybdenum are charged per kg of molybdenum content + %.",
    "8103": "All exempt from the 2026 Section 301 duty. Chinese unwrought tantalum and powder 25% (note 31).",
    "8104": "All exempt from the 2026 Section 301 duty. Chinese pure, granular and alloy magnesium are under AD orders; other articles are charged per kg of magnesium content + 3.5%.",
    "8105": "All exempt from the 2026 Section 301 duty; Chinese cobalt 25% (List 3). AGOA makes Madagascar's cobalt Free.",
    "8106": "Free at base; exempt from the 2026 Section 301 duty; Chinese bismuth 25%.",
    "8108": "All exempt from the 2026 Section 301 duty. 15% on sponge, ingot, powder and mill products; Free (C) only for civil aircraft tubes with fittings. Chinese titanium 25%; Russian unwrought titanium and scrap 70%.",
    "8109": "No note 52(b) line: every zirconium line pays the 2026 Section 301 duty. Nuclear-grade (low-hafnium) and other zirconium are separate lines.",
    "8110": "Free at base, exempt from the 2026 Section 301 duty and on no China list.",
    "8111": "Unwrought manganese (14%) is exempt from the 2026 Section 301 duty; scrap and articles are not.",
    "8112": "Chromium, rhenium, gallium, germanium, indium and niobium are exempt; beryllium, hafnium, cadmium, unwrought thallium and unwrought vanadium are not. Russian hafnium, gallium, indium and niobium 70%.",
    "8113": "Pays the 2026 Section 301 duty; Canadian cermets also pay 50% under Section 338, even with USMCA. Cemented-carbide tool tips are 8209, not 8113.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = G[h][0]
    g["ruleIds"] = list(dict.fromkeys(RULES_ALL + GROUP_EXTRA_RULES.get(h, [])))
    g["note"] = GROUP_NOTES[h]
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    rules = list(RULES_ALL)
    if h == "8104":
        rules.append("adcvd-magnesium")
    if hts == "8101.99.80.00":
        rules.append("adcvd-tungsten-shot")
    if h == "8113":
        rules.append("s338")
    if hts.startswith("8108.90.60.60"):
        rules.append("civil-aircraft-cert")
    ln["ruleIds"] = list(dict.fromkeys(rules))
    levers = ["classify-52b", "usmca", "fta-agoa"]
    if hts.startswith("8108.90.60.60"):
        levers.append("civil-aircraft")
    levers += ["metal-processed-abroad"]
    if hts in CN25:
        levers.append("origin")
    if h == "8104" or hts == "8101.99.80.00":
        levers.append("adcvd-scope")
    levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations and Federal Register notices, not legal advice. Chapter 99 headings and exemption lists change often, and AD/CVD rates are company-specific "
    "and change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
)

# ------------------------------------------------------------------ trade-dependent text + finalConclusion


def fix_labels(x):
    if isinstance(x, dict):
        return {k: fix_labels(v) for k, v in x.items()}
    if isinstance(x, list):
        return [fix_labels(v) for v in x]
    if isinstance(x, str) and "…" in x:
        for h, lab in ORIG_LABELS.items():
            if lab.endswith("…"):
                x = x.replace(lab, G[h][0]).replace(lab.lower(), G[h][0].lower())
    return x


d["understandIndustry"] = fix_labels(d["understandIndustry"])
d["overview"]["tradeSnapshot"] = fix_labels(d["overview"]["tradeSnapshot"])
apply_trade(d, src, G)
_left = re.findall(r"[^\"]{0,60}…", json.dumps(d, ensure_ascii=False))
assert not _left, _left[:5]
_todo = [m for m in re.findall(r"[^\"]{0,60}TODO[^\"]{0,40}", json.dumps(d, ensure_ascii=False))]
assert not _todo, _todo[:5]

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
