"""Fill the writer TODOs of the generated Chapter 75 (Nickel and Articles Thereof) content file.

usage: python3 fill75.py <generated json> <output chapter json>      (run.sh calls it after `pnpm tariff:generate-chapter`)

Facts come from: HTSUS 2026 Revision 21 (Chapter 75; Chapter 99 subchapter III notes 2, 16, 20, 29, 30, 50, 51, 52; General
Note 16), Proclamations 10420, 10523 and 11001, Executive Order 14272 and the BIS notice opening the processed critical minerals
investigation, the OFAC determination of April 12, 2024 (89 FR 48324), the IEEPA / Section 122 / Section 301 / Section 338
documents in sources75.py, eCFR titles 19 and 31 (up to date as of ECFR_AS_OF) and UN Comtrade. A Federal Register search of
Commerce (ITA) notices found no antidumping or countervailing duty order on Chapter 75 goods.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources75 import CH75, CH99, NEW_BY_ID  # noqa: E402

GEN, OUT = sys.argv[1], sys.argv[2]
CHECKED = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
ECFR19 = "https://www.ecfr.gov/current/title-19"
ECFR31 = "https://www.ecfr.gov/current/title-31"
QSRC = "Google search suggestions (United States), collected October 13, 2026"

d = json.load(open(GEN))
d["asOf"] = CHECKED
d["chapter"]["title"] = "Nickel and Articles Thereof"

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(leaf) == 29, len(leaf)

# ------------------------------------------------------------------ sources
tu = d["tariffUpdates"]
src = {s["id"]: s for s in tu["sources"]}
for s in NEW_BY_ID.values():
    src.setdefault(s["id"], s)
src["hts-chapter-99"]["url"] = CH99


def S(i):
    return src[i]


# ------------------------------------------------------------------ line sets (checked against the engine below)
# Note 52(b) (9903.05.86) and note 50(a)(ii) (9903.05.03) list the same six 8-digit subheadings of Chapter 75.
EXEMPT8 = ("7501.10.00", "7502.10.00", "7502.20.00", "7503.00.00", "7504.00.00", "7508.90.50")
EXEMPT = sorted(h for h in LINE if h[:10] in EXEMPT8)
S301 = sorted(set(LINE) - set(EXEMPT))
RU35 = sorted(h for h in LINE if h[:10] in ("7502.10.00", "7502.20.00", "7504.00.00", "7506.20.30"))
assert len(EXEMPT) == 7 and len(S301) == 22 and len(RU35) == 5, (len(EXEMPT), len(S301), len(RU35))

ia = d["industryAreas"]
# Cross-check against the engine: the UK pays +10% on exactly the 22 non-exempt lines.
gb = next(c for c in ia["countries"] if c["country"] == "United Kingdom")
eng = set()
for cell in gb["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"].startswith("+10%"):
            eng.update(b["lines"])
assert eng == set(S301), sorted(eng ^ set(S301))

# ------------------------------------------------------------------ product groups
G = {
    "7501": ("Nickel mattes & oxide sinters", "Mattes & sinters",
             "Nickel mattes and nickel oxide sinters and other intermediate products of nickel smelting: 2 lines, Free. Mattes "
             "(7501.10) are on the 2026 Section 301 exemption list; oxide sinters (7501.20) are not, so they pay 10% to 12.5% "
             "from the 60 Section 301 economies.",
             ["nickel matte", "nickel oxide sinter", "nickel intermediate", "mixed hydroxide precipitate", "nickel sulfide matte"]),
    "7502": ("Unwrought nickel (cathode, briquettes, alloys)", "Unwrought nickel",
             "Unwrought nickel, not alloyed (cathode, briquettes, rounds, pellets) and unwrought nickel alloys: 2 lines, Free. On "
             "the 2026 Section 301 and Brazil exemption lists, so only China (25%) and Russia (35%) pay a duty.",
             ["nickel cathode", "nickel briquettes", "unwrought nickel", "class 1 nickel", "nickel pellets", "nickel alloy ingot"]),
    "7503": ("Nickel waste & scrap", "Scrap",
             "Nickel and nickel-alloy waste and scrap, including superalloy turnings and solids: 1 line, Free. On the 2026 "
             "Section 301 exemption list; only China (25%) and Russia (column 2) pay extra.",
             ["nickel scrap", "nickel alloy scrap", "superalloy scrap", "inconel scrap", "nickel turnings"]),
    "7504": ("Nickel powders & flakes", "Powders & flakes",
             "Nickel powders and flakes, used in batteries, powder metallurgy, catalysts and thermal spray: 2 lines, Free. On the "
             "2026 Section 301 exemption list; China pays 25%, Russia 35%.",
             ["nickel powder", "nickel flakes", "nickel alloy powder", "carbonyl nickel powder"]),
    "7505": ("Nickel bars, rods, profiles & wire", "Bars, rods & wire",
             "Bars, rods, profiles and wire of pure nickel and nickel alloys (nickel-chromium, nickel-copper and other high-"
             "performance alloys), cold-formed or not: 10 lines at 2.5% to 3%, Free under most FTAs and USMCA. The 2026 Section "
             "301 duty applies.",
             ["nickel alloy bar", "nickel alloy rod", "nickel alloy wire", "inconel bar", "nickel wire", "nickel welding wire"]),
    "7506": ("Nickel plates, sheets, strip & foil", "Plate, sheet & strip",
             "Plates, sheets, strip and foil of pure nickel and nickel alloys, including foil not over 0.15 mm thick: 6 lines at "
             "2.5% or 3%. The 2026 Section 301 duty applies; Russian nickel-alloy sheet (7506.20.30) pays 35% in lieu of column 2.",
             ["nickel alloy plate", "nickel alloy sheet", "nickel strip", "nickel foil", "battery nickel strip"]),
    "7507": ("Nickel tubes, pipes & fittings", "Tubes & fittings",
             "Tubes and pipes of pure nickel and nickel alloys, and tube or pipe fittings (couplings, elbows, sleeves): 3 lines at "
             "2% or 3%. The 2026 Section 301 duty applies.",
             ["nickel alloy pipe", "nickel alloy tube", "nickel tubing", "nickel pipe fittings", "inconel tube"]),
    "7508": ("Other articles of nickel", "Other articles",
             "Cloth, grill and netting of nickel wire, stranded wire, and other articles of nickel such as anodes for plating, "
             "electroforms and fasteners: 3 lines at 3%. 7508.90.50 (other articles) is on the 2026 Section 301 exemption list.",
             ["nickel anodes", "nickel mesh", "nickel wire cloth", "nickel articles", "nickel plating anodes"]),
}
o = d["overview"]
for pg in o["productGroups"]:
    lab, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = lab, blurb, ex
for g in ia["groups"]:
    g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 75: Nickel and Articles Thereof — 2026 Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 75 Nickel Tariffs: HS Codes, Import Duties & 2026 Section 301 Rates | KoalaGains",
    "shortDescription": (
        "Searchable U.S. duty table for all 29 HTS Chapter 75 nickel lines: unwrought nickel, scrap and powders are Free and exempt "
        "from the 2026 Section 301 tariffs; nickel alloy bar, wire, sheet and tube pay 2% to 3% plus 10% to 12.5%. No Section 232 "
        "duty; China 25% to 40.5%."
    ),
    "keywords": [
        "HTS Chapter 75",
        "nickel tariff",
        "nickel tariffs us",
        "nickel hs code",
        "nickel tariff code",
        "unwrought nickel hs code",
        "nickel alloy hs code",
        "Nickel and articles thereof",
        "nickel import duty",
    ],
}
o["intro"] = (
    "Chapter 75 covers nickel from the smelter to the finished article: nickel mattes and oxide sinters (7501), **unwrought nickel** "
    "such as cathode and briquettes (7502), **scrap** (7503), **powders** (7504), and the wrought products made from pure nickel and "
    "nickel alloys: bars, rods and **wire** (7505), plates, **sheet**, strip and foil (7506), **tubes** and fittings (7507) and other "
    "articles (7508). Base rates are low: Free for the raw forms, 2% to 3% for the rest.\n\n"
    "**No Section 232 duty reaches nickel.** The processed critical minerals investigation ended in January 2026 with negotiations, "
    "not tariffs (Proclamation 11001), and the steel, aluminum and copper programs list no Chapter 75 line. What decides the cost "
    "today is the **2026 Section 301 tariff on 60 economies** (from July 24, 2026): +10% or +12.5% for most suppliers, or a 10% or "
    "12.5% floor for the EU, Japan, Korea and Taiwan. Unwrought nickel, mattes, scrap, powders and other articles (7508.90.50) are on "
    "its exemption list (note 52(b)), so they stay Free; bars, wire, sheet, tube and fittings pay it. USMCA goods of Canada and "
    "Mexico are exempt. China pays **25%** under Section 301 on every line; Russian nickel pays column 2 or 35% rates and, if "
    "produced on or after April 13, 2024, **cannot be imported** at all under a Treasury (OFAC) determination.\n\n"
    "No antidumping or countervailing duty order covers Chapter 75 goods."
)
o["stats"] = [
    {"label": "Tariff lines", "value": "29"},
    {"label": "Lines with a base-rate duty", "value": "22 of 29", "note": "2% to 3%; unwrought nickel, mattes, scrap and powders are Free"},
    {"label": "2026 Section 301 (60 economies)", "value": "22 of 29", "note": "Unwrought nickel, mattes, scrap, powders and 7508.90.50 are exempt (note 52(b)); USMCA goods exempt"},
    {"label": "China Section 301", "value": "29 of 29", "note": "25% (List 3) on every line, plus 12.5% on the 22 non-exempt lines"},
    {"label": "Section 232", "value": "None", "note": "Critical minerals action of January 2026: negotiations, no tariff"},
]
o["workedExamples"] = [
    {
        "title": "$1,000,000 of nickel cathode from Canada or Norway",
        "line": "7502.10.00.00",
        "body": "Unwrought, unalloyed nickel is **Free**, and 7502.10 is on the 2026 Section 301 exemption list (note 52(b), heading "
        "9903.05.86), so the 10% (Canada) or 12.5% (Norway) duty does not apply. No Section 232 duty reaches nickel. The duty is "
        "**$0**, with or without a USMCA claim.",
    },
    {
        "title": "Nickel alloy bar from Germany",
        "line": "7505.12.10.00",
        "body": "Cold-formed nickel-alloy bar is 3%. For goods of the EU the 2026 Section 301 rate (9903.05.39) is a **10% floor**: it "
        "replaces the base rate when the base rate is lower. The total is **10%**: $10,000 on $100,000.",
    },
    {
        "title": "The same bar from the United Kingdom",
        "line": "7505.12.10.00",
        "body": "3% base **+ 10%** Section 301 (9903.05.81) = **13%**: $13,000 on $100,000. The UK rate is added to the base rate "
        "instead of replacing it.",
    },
    {
        "title": "Nickel alloy pipe from Mexico, with and without a USMCA claim",
        "line": "7507.12.00.00",
        "body": "2% base. With a valid USMCA claim the base rate is Free and the 10% Section 301 duty is lifted (note 52(h), heading "
        "9903.05.94): **$0**. Without it: 2% **+ 10%** (9903.05.55) = **12%**.",
    },
    {
        "title": "Nickel scrap and nickel alloy sheet from China",
        "line": "7506.20.10.00",
        "body": "Cold-formed nickel-alloy sheet: 3% base **+ 25%** Section 301 List 3 (9903.88.03) **+ 12.5%** 2026 Section 301 "
        "(9903.05.31) = **40.5%**. Nickel scrap (7503.00.00.00) is Free and exempt from the 12.5%, so it pays **25%**.",
    },
    {
        "title": "Unwrought nickel from Russia",
        "line": "7502.10.00.00",
        "body": "Nickel of Russian origin produced on or after **April 13, 2024 may not be imported** (OFAC determination under "
        "Executive Order 14068). Nickel produced earlier pays **35%** in lieu of the 6.6¢/kg column 2 rate (9903.90.08, U.S. note "
        "30(b), from April 1, 2023); 7502.10 is exempt from the 12.5% 2026 Section 301 duty on Russia.",
    },
]
for ex in o["workedExamples"]:
    assert ex["line"] in LINE, ex["line"]
o["notes"] = {
    "chapterNotes": (
        "**Subheading note 1 (definitions).** (a) *Nickel, not alloyed*: metal with at least 99% nickel plus cobalt by weight, "
        "provided cobalt does not exceed 1.5%, iron 0.5%, oxygen 0.4% and any other element 0.3%. (b) *Nickel alloys*: metallic "
        "substances in which nickel predominates by weight over each other element, provided cobalt exceeds 1.5%, or at least one "
        "other element exceeds its limit in the table, or the elements other than nickel plus cobalt total more than 1%.\n\n"
        "**Subheading note 2.** Despite note 9(c) to Section XV, for subheading 7508.10 \"wire\" means products, coiled or not, of "
        "any cross-section, with no cross-sectional dimension over 6 mm."
    ),
    "additionalUsNotes": None,
}

# ------------------------------------------------------------------ tariffUpdates
tu["h1"] = "HTS Chapter 75 Tariff Updates: Nickel Tariffs 2025–2026"
tu["seo"] = {
    "title": "Nickel Tariff Updates 2026: Section 301, Critical Minerals 232, Russia, China (HTS Ch. 75) | KoalaGains",
    "shortDescription": (
        "Every change to U.S. tariffs on nickel (HTS Chapter 75) since January 2025, with official sources: the end of the IEEPA "
        "tariffs and the Section 122 surcharge, the 2026 Section 301 tariffs and their nickel exemptions, the critical minerals "
        "Section 232 decision (no tariff), China Section 301 and Russian nickel."
    ),
    "keywords": [
        "nickel tariff update",
        "nickel tariffs 2026",
        "nickel section 232",
        "critical minerals 232",
        "critical minerals tariffs",
        "us critical minerals tariff decision",
        "russian nickel",
        "canada nickel tariff",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current "
    "**2026 Revision 21** (in force October 9, 2026), and lists every extra duty that reaches Chapter 75 today. Base rates did not "
    "change: all 29 lines carry the same general rate in both editions.\n\n"
    "The extra duties changed several times. In 2025 nickel paid the IEEPA duties: the reciprocal tariff on wrought nickel (unwrought "
    "nickel, mattes, scrap and powders were on its Annex II exemption list) and the Canada, Mexico and China duties. The IEEPA "
    "tariffs **ended on February 24, 2026**; a 10% Section 122 surcharge replaced them until **July 23, 2026**, with the same nickel "
    "exemptions. Since **July 24, 2026** the **2026 Section 301 tariffs on 60 economies** (10% or 12.5%) charge 22 of 29 lines, and "
    "Brazil pays a further 25%. The processed critical minerals **Section 232** investigation ended with negotiations and **no tariff** "
    "(Proclamation 11001, January 14, 2026). China's 2018 Section 301 duty (25%) continues.\n\n"
    "Russian nickel is a special case: column 2 rates since April 2022, 35% in lieu of column 2 on unwrought nickel and powders since "
    "April 1, 2023, and an import ban on nickel produced on or after April 13, 2024. No antidumping or countervailing duty order covers "
    "Chapter 75 goods."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 75 from any country: the 2026 Section 301 actions on 60 economies and Brazil (notes 50, "
    "52), China Section 301 (note 20), Russia's rates in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note "
    "29), and the ended IEEPA and Section 122 duties. No Section 232 note (16 and the others) lists a Chapter 75 line, and Canada's "
    "Section 338 lists (note 51) contain none. Treasury's import prohibition on Russian nickel is included because it decides whether "
    "Russian nickel can enter at all. A Federal Register search found no Commerce antidumping or countervailing duty order on Chapter "
    "75 goods. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "29 of 29 lines"},
    {"label": "2026 Section 301", "value": "10% to 12.5%", "note": "22 lines; unwrought nickel, scrap and powders exempt"},
    {"label": "Section 232", "value": "None"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
]
S301_IDS = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["inEffect"] = [
    {
        "id": "s301-2026",
        "country": "60 Section 301 economies (Canada, the UK, the EU, Norway, Japan, Mexico, Australia, South Africa, Taiwan, Korea, India and others)",
        "measure": "Section 301 (2026, 60 economies)",
        "ch99Code": "9903.05.20–9903.05.84",
        "before": "None",
        "now": "+10% or +12.5%; for the EU, Japan, Korea, Switzerland and Taiwan a 10% or 12.5% floor in place of the base rate",
        "exemption": (
            "Charges 22 of 29 lines: nickel bars, rods, wire, plates, sheet, strip, foil, tubes, fittings, cloth, stranded wire and "
            "oxide sinters (7501.20). Nickel mattes (7501.10), unwrought nickel (7502.10, 7502.20), scrap (7503), powders and flakes "
            "(7504) and other articles of nickel (7508.90.50) are on the note 52(b) exemption list (9903.05.86). USMCA goods of Canada "
            "and Mexico entered free of duty are exempt (9903.05.93, 9903.05.94). No Chapter 75 line is on a note 52(j) country "
            "exception list, and no Section 232 action reaches nickel, so note 52(f) does not apply. Rates: Canada, Mexico, the UK and "
            "India +10%; Norway, Australia, South Africa, Brazil, China and Russia +12.5%; EU 10% and Taiwan 10%, Japan and Korea "
            "12.5%, in place of the base rate when it is lower. Foreign-trade-zone admissions must take privileged foreign status."
        ),
        "whatItMeans": "Nickel alloy bar, wire, sheet or tube from the UK costs 12% to 13% instead of 2% to 3%; from the EU or Japan 10% or 12.5%. Nickel cathode, scrap and powder stay Free.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": S301_IDS,
    },
    {
        "id": "cn-section-301",
        "country": "China",
        "measure": "Section 301: List 3 (2018) + 2026 action",
        "ch99Code": "9903.88.03 / 9903.05.31",
        "before": "+25% (List 3)",
        "now": "+25% on all 29 lines, +12.5% more on the 22 non-exempt lines",
        "exemption": (
            "List 3 (note 20(f)) names every Chapter 75 subheading. No product exclusion is in force: the exclusions for nickel hydroxy "
            "carbonate (7501.20.0000) expired June 14, 2024. The 12.5% 2026 duty (9903.05.31) does not charge the six note 52(b) "
            "subheadings. The IEEPA duties on China ended February 24, 2026; USTR confirmed on October 7, 2026 that the 2018 actions "
            "continue during the four-year review."
        ),
        "whatItMeans": "Chinese nickel cathode, scrap and powder pay 25%; Chinese nickel alloy bar, wire, sheet and tube 39.5% to 40.5%.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "br-section-301",
        "country": "Brazil",
        "measure": "Section 301 (Brazil) + Section 301 (2026, 60 economies)",
        "ch99Code": "9903.05.01 / 9903.05.27",
        "before": "None",
        "now": "+25% + 12.5% on 22 lines",
        "exemption": (
            "The Brazil exemption list (note 50(a)(ii), 9903.05.03) names the same six Chapter 75 subheadings as note 52(b): "
            "mattes, unwrought nickel, scrap, powders and 7508.90.50. They pay neither duty."
        ),
        "whatItMeans": "Brazilian unwrought nickel stays Free; Brazilian nickel alloy semis pay 39.5% to 40.5%.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2026-14542", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ru-nickel",
        "country": "Russia",
        "measure": "Column 2 rates, 35% in lieu of column 2 on 5 lines, +12.5% Section 301; import ban on nickel produced since April 13, 2024",
        "ch99Code": "9903.90.08 / 9903.05.66",
        "before": "Column 2 rates; 35% in lieu of column 2 on 5 lines",
        "now": "35% on unwrought nickel and powders; column 2 (25% to 45%) + 12.5% on semis; 47.5% on nickel-alloy sheet 7506.20.30",
        "exemption": (
            "Russia has paid column 2 rates since April 9, 2022. Note 30(b) puts 35% in lieu of column 2 on 7506.20.30 (from July 27, "
            "2022, Proclamation 10420) and on 7502.10, 7502.20 and 7504 (from April 1, 2023, Proclamation 10523). The 12.5% 2026 "
            "Section 301 duty (9903.05.66) is added on the 22 non-exempt lines. Separately, OFAC determined on April 12, 2024 that "
            "the import prohibition of Executive Order 14068 applies to nickel of Russian Federation origin, except nickel produced "
            "before April 13, 2024 or licensed by OFAC (31 CFR part 587). No revocation has been published in the Federal Register."
        ),
        "whatItMeans": "Newly produced Russian nickel cannot be imported. Older stock pays 35% (unwrought, powders) or up to 57.5% (semis and articles).",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["procl-10420", "procl-10523", "ofac-2024-12372", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
]


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {"id": id_, "type": type_, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now,
            "countries": countries, "sourceIds": ids}


gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 75 base-rate changes"
base["detail"] = "All 29 Chapter 75 lines carry the same general rate in the 2026 Revision 21 as in the 2025 Basic Edition; none changed and none are new or renumbered."
base["date"] = CHECKED
changes = [
    base,
    ch("adcvd-none", "reference", CHECKED, "Checked", "No antidumping or countervailing duty order on Chapter 75 goods",
       "A Federal Register search of Commerce (ITA) notices finds no AD/CVD order on nickel or nickel-alloy products of Chapter 75. "
       "The only order with nickel in its name, on diffusion-annealed nickel-plated flat-rolled steel from Japan (preliminary review "
       "results published August 5, 2026), covers a steel product of Chapter 72, not nickel.",
       None, "None on Chapter 75", "All", ["fr-2026-15877"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the review",
       "USTR announced that the 2018–2019 Section 301 actions on China, including List 3 (25%) that covers all 29 Chapter 75 lines, "
       "continue while the statutory four-year review proceeds.",
       None, None, "China", ["fr-2026-20510"]),
    ch("section-338-canada", "reference", "2026-08-22", "Effective", "Canada Section 338 duties: no Chapter 75 line",
       "Proclamations 11046–11048 put a 50% duty (9903.03.12–9903.03.14) on Canadian products in the note 51(b) lists from August 22, "
       "2026, with lists changed from September 15, 2026. No Chapter 75 line is on any list, so Canadian nickel, the largest source, "
       "is unaffected.",
       None, "None on Chapter 75", "Canada", ["procl-11048", "procl-11065", "csms-69606660", "hts-chapter-99"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies reach 22 nickel lines",
       "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect, with a 10% or 12.5% floor in place of "
       "the base rate for the EU, Japan, Korea, Switzerland and Taiwan. Nickel mattes, unwrought nickel, scrap, powders and 7508.90.50 "
       "are on the note 52(b) exemption list (9903.05.86); USMCA goods of Canada and Mexico are exempt. The other 22 lines (bars, rods, "
       "wire, sheet, strip, foil, tubes, fittings, cloth, stranded wire and oxide sinters) pay it.",
       None, "+10% to +12.5% on 22 lines", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. The same six Chapter 75 subheadings as note 52(b) are on its "
       "exemption list (note 50(a)(ii), 9903.05.03); the other 22 lines pay it, plus the 12.5% 2026 duty from July 24.",
       None, "+25% on 22 lines", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("critical-minerals-comments", "reference", "2026-02-26", "Published", "USTR asks for comments on a critical minerals agreement",
       "Following Proclamation 11001, USTR requested public comments on the design of a plurilateral agreement on trade in critical "
       "minerals, including price floors and other measures. No tariff on nickel has resulted.",
       None, None, "All", ["fr-2026-03868"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Nickel mattes, unwrought nickel, scrap, "
       "powders and 7508.90.50 were on its product exemption list (9903.03.03), and USMCA-qualifying goods of Canada and Mexico were "
       "exempt; the other 22 lines paid it.",
       "None", "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, "
       "Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them from 12:00 a.m. ET "
       "on February 24, 2026.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("critical-minerals-232", "reference", "2026-01-14", "Signed", "Section 232 on processed critical minerals: negotiations, no tariff",
       "Proclamation 11001 agreed with Commerce that imports of processed critical minerals and their derivative products, which it "
       "says include nickel used in battery storage, threaten national security, but directed Commerce and USTR to negotiate "
       "agreements (considering price floors) instead of imposing tariffs, with an update due within 180 days. No Section 232 duty "
       "applies to Chapter 75, and no later proclamation has been published as of October 13, 2026.",
       None, "No tariff", "All", ["procl-11001"]),
    ch("cn-ieepa-cut", "reference", "2025-11-10", "Effective", "IEEPA duty on China cut to 10%",
       "Executive Order 14357 lowered the IEEPA duty on products of China from 20% to 10% from November 10, 2025. Ended February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("ca-ieepa-35", "reference", "2025-08-01", "Effective", "IEEPA duty on non-USMCA Canadian goods raised to 35%",
       "Executive Order 14325 raised the IEEPA duty on Canadian goods not entered under USMCA from 25% to 35% (9903.01.10). Ended "
       "February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("critical-minerals-investigation", "reference", "2025-04-15", "Signed", "Section 232 investigation of processed critical minerals opens",
       "Executive Order 14272 directed Commerce to investigate imports of processed critical minerals and their derivative products; "
       "Commerce opened the investigation on April 22, 2025 and took comments until May 16, 2025. It ended with Proclamation 11001 "
       "(no tariff).",
       None, None, "All", ["eo-14272", "fr-2025-07273", "procl-11001"]),
    ch("reciprocal", "reference", "2025-04-02", "Signed", "Reciprocal tariff: unwrought nickel, scrap and powders exempt",
       "Executive Order 14257 set the reciprocal tariffs from April 5, 2025, with an Annex II exemption list (9903.01.32) that, as "
       "printed in the current schedule, includes nickel mattes, unwrought nickel, scrap, powders and 7508.90.50. Nickel bars, wire, "
       "sheet, tube and the other wrought lines paid the reciprocal rate. Ended February 24, 2026.",
       None, "Raw nickel exempt", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("cn-ieepa-20", "reference", "2025-03-04", "Effective", "IEEPA duty on China raised to 20%",
       "Executive Order 14228 raised the IEEPA duty on products of China (9903.01.20) from 10% to 20%, on top of the Section 301 "
       "duties. Ended February 24, 2026.",
       "+10%", "+20% (ended)", "China", ["eo-14228"]),
    ch("ca-mx-cn-ieepa", "reference", "2025-02-01", "Signed", "IEEPA duties on Canada, Mexico and China",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025, with USMCA goods exempted from March 7, 2025; "
       "+10% on goods of China (9903.01.20) from February 4, 2025. Ended February 24, 2026.",
       None, "+25% / +10% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195", "eo-14231", "eo-14232"]),
    ch("ofac-ru-nickel", "reference", "2024-04-12", "Signed", "Import ban on Russian nickel",
       "OFAC determined that the import prohibition of Executive Order 14068 applies to aluminum, copper and nickel of Russian "
       "Federation origin, including admission into a foreign-trade zone, except metal produced before April 13, 2024 or licensed by "
       "OFAC. It also barred U.S. persons from warranting Russian nickel on a metal exchange. Published in the Federal Register on June "
       "6, 2024.",
       None, "Prohibited", "Russia", ["ofac-2024-12372"]),
    ch("ru-35-2023", "extraDuty", "2023-04-01", "Effective", "Russian unwrought nickel and powders: 35% in lieu of column 2",
       "Proclamation 10523 added unwrought nickel (7502.10, 7502.20) and nickel powders and flakes (7504) to U.S. note 30(b), so they "
       "pay 35% (9903.90.08) instead of the 6.6¢/kg column 2 rate.",
       "6.6¢/kg (column 2)", "35%", "Russia", ["procl-10523"]),
    ch("ru-35-2022", "extraDuty", "2022-07-27", "Effective", "Russian nickel-alloy sheet: 35% in lieu of column 2",
       "Proclamation 10420 created heading 9903.90.08 and U.S. note 30 and raised the rate on listed Russian products, including "
       "nickel-alloy plates, sheets and strip not cold-formed (7506.20.30), to 35% in lieu of column 2. Russia has paid column 2 rates "
       "since April 9, 2022 under the Suspending Normal Trade Relations with Russia and Belarus Act.",
       "25% (column 2)", "35%", "Russia", ["procl-10420"]),
    ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%",
       "The List 3 duty on Chinese nickel (every Chapter 75 line), 10% from September 24, 2018, rose to 25%.",
       "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
]
nic = gen_changes["section-301-nicaragua-scheduled-2027-01-01"]
changes.append(ch("nicaragua-301", "pending", nic["date"], "Announced", "Section 301 tariff on Nicaragua phases in from 2027",
                  "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from "
                  "January 1, 2028 (9903.89.01, U.S. note 29), on all 29 Chapter 75 lines. The rate is 0% in 2026.",
                  None, "+10% to +15%", "Nicaragua", nic["sourceIds"]))
for c in changes:
    for sid in c["sourceIds"]:
        assert sid in src, sid
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in changes for sid in c["sourceIds"]}
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch75"])
for sid in used:
    assert sid in src, sid
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["h1"] = "HTS Chapter 75 Nickel Tariffs by Country: Canada, UK, Norway, Germany, Japan, China & More"
ia["seo"] = {
    "title": "Nickel Tariffs by Country: Canada, UK, Norway, Germany, France, Japan, China, Russia (HTS Ch. 75) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on nickel by country and product: unwrought nickel, scrap and powders Free from almost everywhere; "
        "nickel alloy bar, wire, sheet and tube 10% to 15.5% under the 2026 Section 301 tariffs; Free with USMCA; China 25% to 40.5%; "
        "Russian nickel banned."
    ),
    "keywords": [
        "nickel tariffs by country",
        "canada nickel tariff",
        "nickel tariff canada",
        "nickel tariff china",
        "nickel tariff norway",
        "russian nickel",
        "us nickel imports by country",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current "
    "tariff schedule. For the raw forms the answer is simple: **unwrought nickel, mattes, scrap and powders are Free** from every "
    "listed country except China (25%) and Russia, because they are on the 2026 Section 301 exemption list.\n\n"
    "For the wrought products (bars, rods, wire, plates, sheet, strip, foil, tubes and fittings) the 2026 Section 301 tariff decides "
    "the rate: **Free** for USMCA goods of Canada and Mexico, **10%** for the EU and Taiwan and **12.5%** for Japan and Korea (floors "
    "that replace the base rate), base rate **+10%** for the UK and India, and **+12.5%** for Norway, Australia and South Africa (whose "
    "base rate is Free under their FTA or AGOA). China and Brazil pay about 40%. No Section 232 duty and no antidumping or "
    "countervailing duty applies to Chapter 75."
)
R = {
    "Canada": ("Free on every Chapter 75 line with a USMCA claim: the base rate is Free and the 10% Section 301 duty (9903.05.29) is "
               "lifted (9903.05.93). Without a USMCA claim, unwrought nickel, scrap and powders are still Free (note 52(b)); semis pay "
               "their 2% to 3% base rate + 10%. No Section 232 or Section 338 duty reaches nickel.",
               ["fr-2026-15181", "procl-11048", "procl-11065", "hts-now"]),
    "United Kingdom": ("Unwrought nickel, scrap and powders are Free (note 52(b)). Bars, wire, sheet, tube and fittings pay their 2% to 3% "
                       "base rate + 10% Section 301 (9903.05.81), 12% to 13% in total.",
                       ["fr-2026-15181", "hts-now"]),
    "Germany": ("EU: unwrought nickel, scrap and powders Free (note 52(b)). Semis pay the EU's 10% Section 301 rate (9903.05.39), which "
                "replaces their 2% to 3% base rate: 10% in total. Other articles (7508.90.50) are exempt and pay 3%.",
                ["fr-2026-15181", "hts-now"]),
    "France": ("EU: 10% on nickel-alloy bar, wire, sheet and tube (9903.05.39, in place of the base rate); unwrought nickel, scrap and "
               "powders Free; 7508.90.50 pays 3%.",
               ["fr-2026-15181", "hts-now"]),
    "Norway": ("Norwegian unwrought nickel (the second-largest source of 7502) is Free and exempt (note 52(b)). Semis pay their base rate "
               "+ 12.5% Section 301 (9903.05.60): 14.5% to 15.5%.",
               ["fr-2026-15181", "hts-now"]),
    "Japan": ("12.5% on nickel bars, wire, sheet, foil and tube (9903.05.49, a floor in place of the base rate); unwrought nickel, scrap "
              "and powders Free; 7508.90.50 pays 3%.",
              ["fr-2026-15181", "hts-now"]),
    "Mexico": ("Free on every line with a USMCA claim (9903.05.94 lifts the 10% duty, 9903.05.55). Without it: raw forms Free, semis "
               "base rate + 10%, and other articles (7508.90.50) 3%.",
               ["fr-2026-15181", "hts-now"]),
    "Australia": ("The U.S.–Australia FTA (AU) makes the base rate Free, but the 12.5% Section 301 duty (9903.05.23) still applies to "
                  "semis: 12.5%. Unwrought nickel, scrap, powders and 7508.90.50 are Free.",
                  ["fr-2026-15181", "hts-now"]),
    "South Africa": ("South Africa is an AGOA beneficiary (general note 16(a); AGOA renewed through December 31, 2026), so semis enter "
                     "at a Free base rate (SPI D) + 12.5% Section 301 (9903.05.69): 12.5%. Unwrought nickel and other raw forms are Free.",
                     ["fr-2026-15181", "hts-gn", "ustr-agoa-2026", "hts-now"]),
    "China": ("25% on every line (Section 301 List 3, 9903.88.03). Semis, oxide sinters and other non-exempt lines add the 12.5% 2026 "
              "duty (9903.05.31): 37.5% to 40.5%. Unwrought nickel, scrap and powders 25%; other articles (7508.90.50) 28%.",
              ["fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
    "Italy": ("EU: 10% on semis (9903.05.39, in place of the base rate); raw forms Free; 7508.90.50 3%.",
              ["fr-2026-15181", "hts-now"]),
    "Taiwan": ("10% on semis (9903.05.76, a floor in place of the base rate); raw forms Free; other articles (7508.90.50) 3%.",
               ["fr-2026-15181", "hts-now"]),
    "Finland": ("EU: Finnish unwrought nickel and powders are Free (note 52(b)); semis 10% (9903.05.39, in place of the base rate).",
                ["fr-2026-15181", "hts-now"]),
    "Sweden": ("EU: 10% on nickel-alloy bar, wire, sheet and tube (9903.05.39, in place of the base rate); raw forms Free.",
               ["fr-2026-15181", "hts-now"]),
    "South Korea": ("KORUS (KR) makes the base rate Free; the 12.5% Section 301 floor (9903.05.71) applies to semis: 12.5%. Raw forms "
                    "and 7508.90.50 are Free.",
                    ["fr-2026-15181", "hts-now"]),
    "India": ("Semis pay their base rate + 10% Section 301 (9903.05.44): 12% to 13%; GSP has lapsed. Raw forms Free.",
              ["fr-2026-15181", "hts-now"]),
    "Brazil": ("Semis pay base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27): 39.5% to 40.5%. Unwrought nickel, "
               "scrap, powders and 7508.90.50 are on both exemption lists (notes 50(a)(ii), 52(b)) and stay Free or 3%.",
               ["fr-2026-14542", "fr-2026-15181", "hts-now"]),
    "Russia": ("Nickel of Russian origin produced on or after April 13, 2024 may not be imported (OFAC). For older stock: 35% in lieu "
               "of column 2 on unwrought nickel and powders (9903.90.08); column 2 rates (25% to 45%) + 12.5% (9903.05.66) on semis; "
               "47.5% on 7506.20.30; scrap 6.6¢/kg.",
               ["ofac-2024-12372", "procl-10420", "procl-10523", "fr-2026-15181", "hts-now"]),
}
OTHER = ("Unwrought nickel, mattes, scrap and powders are Free from every other country except Russia, Belarus and other column 2 "
         "countries. Semis pay the base rate plus 10% or 12.5% from the other Section 301 economies (Singapore, Switzerland, Vietnam, "
         "Indonesia, Turkey and more; up to 15.5%), and only the base rate from countries outside the 60, such as Madagascar. Nicaragua's "
         "Section 301 duty starts January 1, 2027.")
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        rule["label"], rule["sourceIds"] = R[c["country"]]
    elif c["country"] == "Any other country":
        rule["label"] = OTHER
        rule["sourceIds"] = ["fr-2026-15181", "fr-2025-23892", "hts-now"]
    else:
        raise SystemExit(f"no rule text for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "No Section 232 duty applies to Chapter 75: no Section 232 note lists a Chapter 75 line, and the processed critical minerals action "
    "(Proclamation 11001) imposed no tariff.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Russia's cells show the rates for nickel produced before April 13, 2024. Russian nickel produced since then may not be imported "
    "(OFAC determination, 89 FR 48324).",
    "No antidumping or countervailing duty order covers Chapter 75 goods.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) and "
    "note 50(a)(ii) (9903.05.03) list the same six Chapter 75 subheadings: 7501.10, 7502.10, 7502.20, 7503.00, 7504.00 and 7508.90.50; "
    "the note 2 reciprocal Annex II and the Section 122 exemption list (9903.03.03) named the same six. No Chapter 75 line is on a note "
    "52(c)–(e) or 52(j) list, on the Canada Section 338 lists (note 51), in note 16 or any other Section 232 note, or in note 31. China "
    "List 3 (note 20(f)) covers every Chapter 75 subheading; the only product exclusions (nickel hydroxy carbonate, 7501.20.0000) "
    "expired June 14, 2024. Note 30(b) lists 7502.10, 7502.20, 7504.00 and 7506.20.30 for Russia's 35% rate (9903.90.08)."
)
ia_ids = {sid for c in ia["countries"] for sid in c["rule"]["sourceIds"]} | {"hts-now", "hts-chapter-99"}
for sid in ia_ids:
    assert sid in src, sid
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Nickel: Section 301 Exemptions, USMCA, Russian Nickel Ban & Ways to Lower Duty (HTS Ch. 75) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 75 nickel line: the 2026 Section 301 exemption list for unwrought nickel, scrap and powders, "
        "USMCA certification, FTZ status, marking and the OFAC ban on Russian nickel, plus the legal ways to pay less: buying "
        "unwrought forms, USMCA and FTA claims, non-Chinese origin, correct alloy classification and drawback."
    ),
    "keywords": [
        "HTS Chapter 75",
        "Nickel and articles thereof",
        "tariff engineering",
        "nickel tariff exemption",
        "critical minerals exempt from tariffs",
        "nickel alloy hs code",
        "nickel powder hs code",
        "inconel tariff",
    ],
}
te["intro"] = (
    "For nickel the classification and the origin decide almost everything. Six subheadings, **nickel mattes (7501.10), unwrought "
    "nickel (7502.10, 7502.20), scrap (7503), powders and flakes (7504) and other articles (7508.90.50)**, are on the 2026 Section 301 "
    "exemption list and Free, so they pay nothing except from China or Russia. The other 22 lines, the wrought nickel and nickel-alloy "
    "products, pay a 2% to 3% base rate and the 10% to 12.5% Section 301 duty of most suppliers. There is no Section 232 duty and no "
    "AD/CVD order on Chapter 75.\n\n"
    "The legal ways to pay less: buy nickel in an exempt form and fabricate it in the United States, claim USMCA for Canadian and "
    "Mexican goods (it removes both the base rate and the Section 301 duty), claim an FTA or AGOA for the base rate, avoid Chinese "
    "origin, classify the alloy and form correctly, and claim drawback on exported goods. Russian nickel produced since April 13, 2024 "
    "cannot be imported. Each rule and lever links to its regulation or legal text."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "unwrought",
        "title": "Import unwrought nickel, scrap or powder and fabricate in the United States",
        "saves": "The 10% to 12.5% Section 301 duty and the 2% to 3% base rate: 7502, 7503 and 7504 are Free and on the note 52(b) exemption list",
        "appliesTo": "Cathode, briquettes, unwrought alloys, scrap, powders and flakes (7502–7504), instead of bars, wire, sheet or tube (7505–7507)",
        "document": "Mill or assay certificates and a product description showing the goods are unwrought, scrap or powder (19 CFR 141.86 invoice description).",
        "caveat": "Only real changes in what you buy count: nickel rolled, drawn or extruded abroad is 7505–7507. Chinese goods still pay 25% (List 3) in any form.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "HTSUS Chapter 75", "url": CH75},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican nickel",
        "saves": "The base rate (2% to 3%) and the 10% Section 301 duty: USMCA goods entered free of duty are exempt (9903.05.93, 9903.05.94)",
        "appliesTo": "Originating nickel products of Canada and Mexico, mainly bars, wire, sheet, tube, fittings and other articles",
        "document": "A USMCA certification of origin (19 CFR 182.12), kept on file and presented when CBP asks.",
        "caveat": "The good must meet the USMCA rule of origin for its heading; non-originating Canadian or Mexican semis pay 12% to 13%.",
        "citations": [
            {"label": "19 CFR 182.12 (USMCA)", "url": f"{ECFR19}/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA or AGOA rate for the base duty",
        "saves": "The 2% to 3% base rate on semis",
        "appliesTo": "Originating goods of Australia (AU), Korea (KR), Chile, Colombia, Peru, Israel, Singapore and other FTA partners, and AGOA countries such as South Africa (D)",
        "document": "The agreement's certification or proof of origin, kept on file and presented when CBP asks.",
        "caveat": "An FTA or AGOA claim does not remove the 2026 Section 301 duty (note 52(a)): Australian or South African nickel-alloy bar still pays 12.5%. GSP has lapsed.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "HTSUS General Notes (note 16, AGOA)", "url": S("hts-gn")["url"]},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese and Russian origin",
        "saves": "25% of value on every line, plus 12.5% on semis: Chinese nickel pays 25% to 40.5% against Free to 15.5% from other countries",
        "appliesTo": "All 29 lines, for goods of China; Russian nickel produced since April 13, 2024 cannot be imported",
        "document": "Mill certificates and production records showing where the nickel was smelted, refined and worked. Origin follows the last substantial transformation; ask CBP for a binding ruling if processing happens in more than one country.",
        "caveat": "Simple processing in a third country does not change origin. OFAC's prohibition covers Russian-origin nickel wherever it is shipped from.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR19}/part-177"},
            {"label": "OFAC determination (89 FR 48324)", "url": S("ofac-2024-12372")["url"]},
        ],
    },
    {
        "id": "classify",
        "title": "Classify the alloy and the form correctly",
        "saves": "The Section 301 duty when a product is truly unwrought, scrap or powder, and the right base rate for bars, wire, sheet and tube",
        "appliesTo": "All lines; most often nickel alloy vs other base-metal alloys, unwrought vs wrought, and 7508.90.50 (exempt) vs 7508.10 and 7508.90.10",
        "document": "A chemical analysis against subheading note 1 (nickel must predominate by weight) and Section XV note 5, a description of form and processing, and if unsure a CBP binding ruling.",
        "caveat": "Classification follows the product, not the duty: an alloy in which iron predominates (stainless or alloy steel) is Chapter 72 or 73, and nickel oxides and sulfate are Chapter 28.",
        "citations": [
            {"label": "HTSUS Chapter 75, subheading notes", "url": CH75},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR19}/part-177"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on exported goods",
        "saves": "Up to 99% of the base rate and Section 301 duties paid on goods that are exported or used in exported products",
        "appliesTo": "All dutiable lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties are never refundable (19 CFR 191.3(b)(3)); none apply to Chapter 75 today.",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR19}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR19}/section-191.3"},
        ],
    },
]
te["rules"] = [
    {"id": "s301-entry", "agency": "CBP", "title": "2026 Section 301: report the country's 9903.05.20–9903.05.84 heading with each non-exempt line, or 9903.05.86 for the six exempt subheadings, 9903.05.93/.94 for USMCA goods",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99}, {"label": "91 FR 47318 (USTR notice of action)", "url": S("fr-2026-15181")["url"]}]},
    {"id": "china-301", "agency": "CBP", "title": "Goods of China: report 9903.88.03 (List 3, 25%) on every line",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99}]},
    {"id": "invoice", "agency": "CBP", "title": "Commercial invoice with a detailed description of the goods (form, alloy and grade), quantity, value and country of origin",
     "citations": [{"label": "19 CFR 141.86", "url": f"{ECFR19}/section-141.86"}]},
    {"id": "ftz", "agency": "CBP", "title": "Goods subject to the 2026 Section 301 or Brazil duties admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
     "citations": [{"label": "19 CFR 146.41", "url": f"{ECFR19}/section-146.41"}, {"label": "91 FR 47318 (USTR notice of action)", "url": S("fr-2026-15181")["url"]}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container; metal ingots, pigs, bars, plates, sheets and similar forms are on the J-list, but their outermost container must be marked",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR19}/section-134.11"}, {"label": "19 CFR 134.33", "url": f"{ECFR19}/section-134.33"}]},
    {"id": "russia", "agency": "Treasury (OFAC) / CBP", "title": "Russian nickel: import prohibited if produced on or after April 13, 2024 (unless licensed); older stock pays column 2 or 35% in lieu of column 2 (note 30(b)) plus 12.5% on semis",
     "citations": [{"label": "OFAC determination (89 FR 48324)", "url": S("ofac-2024-12372")["url"]}, {"label": "31 CFR part 587", "url": f"{ECFR31}/part-587"},
                   {"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10523 (88 FR 13277)", "url": S("procl-10523")["url"]}]},
]
RAW_RULES = ["s301-entry", "china-301", "invoice", "marking", "russia"]
SEMI_RULES = ["s301-entry", "china-301", "invoice", "ftz", "marking", "russia"]
GROUP_RULES = {h: (RAW_RULES if h <= "7504" else SEMI_RULES) for h in G}
GROUP_RULES["7501"] = SEMI_RULES  # 7501.20 pays the 2026 duty
GROUP_NOTES = {
    "7501": "Free. Mattes (7501.10) are exempt from the 2026 Section 301 duty; oxide sinters (7501.20) are not and pay 10% to 12.5%. China 25% to 37.5%.",
    "7502": "Free and on the 2026 Section 301 and Brazil exemption lists. China 25%; Russian nickel produced since April 13, 2024 is banned, older stock 35%.",
    "7503": "Free and on the 2026 Section 301 exemption list. China 25%; Russia 6.6¢/kg (column 2).",
    "7504": "Free and on the 2026 Section 301 exemption list. China 25%; Russia 35%.",
    "7505": "2.5% to 3% (Free under USMCA and FTAs) plus the 2026 Section 301 duty: 10% to 15.5% for most suppliers, Free for USMCA goods.",
    "7506": "2.5% or 3% plus the 2026 Section 301 duty. Russian nickel-alloy sheet not cold-formed (7506.20.30) pays 35% in lieu of column 2 + 12.5%.",
    "7507": "2% or 3% plus the 2026 Section 301 duty: 12% to 13% from the UK, 10% from the EU, Free with USMCA.",
    "7508": "3%. Other articles (7508.90.50) are exempt from the 2026 Section 301 duty; cloth (7508.10) and stranded wire (7508.90.10) are not.",
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
    if hts in EXEMPT and "ftz" in rules:
        rules.remove("ftz")
    ln["ruleIds"] = rules
    levers = []
    if hts in S301 and h >= "7505":
        levers.append("unwrought")
    if LINE[hts]["effectiveGeneral"] != "Free" or hts in S301:
        levers.append("usmca")
    if LINE[hts]["effectiveGeneral"] != "Free":
        levers.append("fta")
    levers += ["origin", "classify"]
    if LINE[hts]["effectiveGeneral"] != "Free" or hts in S301:
        levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations and legal texts, not legal advice. Section 301 headings and "
    "exemption lists change often, and OFAC licenses can change what Russian nickel may enter; check the current Chapter 99 notes, "
    "CBP's CSMS messages and the Federal Register before importing."
)


# ------------------------------------------------------------------ FAQ (built after the trade figures are known)
def FAQS(T, B):
    tops = ", ".join(f"{n} {B(v)} ({s:.0f}%)" for n, v, s, _, _ in T["top"][:5])
    ca = T["ca7502"]
    return [
        {
            "id": "current-rate",
            "question": "Is there a tariff on nickel?",
            "searchedAs": ["is there a tariff on nickel", "are there tariffs on nickel", "nickel tariff", "nickel tariffs", "nickel tariffs us",
                           "nickel import tariff", "nickel import duty"],
            "answer": "Unwrought nickel (cathode, briquettes), nickel mattes, scrap and powders are Free and on the 2026 Section 301 exemption "
                      "list, so they pay no duty from almost every country; China pays 25% and Russian nickel is restricted. Wrought nickel and "
                      "nickel alloys (bars, rods, wire, plates, sheet, strip, foil, tubes and fittings) pay a 2% to 3% base rate plus the 2026 "
                      "Section 301 duty of most suppliers: 10% to 15.5% in total, or Free with a USMCA claim. There is no Section 232 duty on nickel.",
            "link": "",
        },
        {
            "id": "section-232",
            "question": "Is nickel subject to a Section 232 or critical minerals tariff?",
            "searchedAs": ["nickel section 232", "nickel 232", "critical minerals 232", "critical minerals tariffs", "section 232 critical minerals tariffs",
                           "us critical minerals tariff decision", "critical minerals section 232 tariff decisions", "trump critical minerals tariffs"],
            "answer": "No. Commerce investigated processed critical minerals under Section 232 from April 2025, and Proclamation 11001 (January 14, "
                      "2026) found a threat to national security but chose negotiations with trading partners, considering price floors, instead "
                      "of tariffs. No Section 232 note in the tariff schedule lists a Chapter 75 line, and the steel, aluminum and copper "
                      "duties do not cover nickel. No later proclamation had been published as of October 13, 2026.",
            "link": "tariff-updates",
        },
        {
            "id": "exempt",
            "question": "Which nickel products are exempt from the 2026 tariffs?",
            "searchedAs": ["nickel tariff exemption", "critical minerals exempt from tariffs", "tariff exemption list"],
            "answer": "Six subheadings are on the exemption list of the 2026 Section 301 tariffs (note 52(b), 9903.05.86) and of the Brazil "
                      "tariff: nickel mattes (7501.10), unwrought nickel not alloyed and alloyed (7502.10, 7502.20), nickel waste and scrap "
                      "(7503.00), powders and flakes (7504.00) and other articles of nickel (7508.90.50). The same six were exempt from the "
                      "2025 reciprocal tariff and the 2026 Section 122 surcharge. They are not exempt from China's 25% Section 301 duty.",
            "link": "tariff-updates",
        },
        {
            "id": "hs-code",
            "question": "What is the HS code for nickel?",
            "searchedAs": ["hs code nickel", "nickel hs code", "nickel tariff code", "hts code nickel", "unwrought nickel hs code", "nickel cathode hs code"],
            "answer": "Unwrought nickel is heading 7502: 7502.10.00.00 for nickel not alloyed (cathode, briquettes, pellets, at least 99% nickel plus "
                      "cobalt) and 7502.20.00.00 for nickel alloys. Mattes and oxide sinters are 7501, scrap 7503, powders 7504. Nickel ores are "
                      "2604.00.00, nickel oxides 2825.40, nickel sulfate 2833.24 and ferronickel 7202.60, outside Chapter 75.",
            "link": "",
        },
        {
            "id": "alloy-codes",
            "question": "What is the HS code for nickel alloy bar, wire, plate and tube?",
            "searchedAs": ["nickel alloy hs code", "nickel alloy wire hs code", "nickel alloy plate hs code", "nickel alloy bar hs code",
                           "nickel alloy pipe hs code", "nickel alloy tube hs code", "nickel alloy sheet hs code", "nickel wire hs code", "nickel plate hs code"],
            "answer": "Nickel-alloy bars and rods are 7505.12 (3% or 2.5%), wire 7505.22 (3% or 2.6%), plates, sheet, strip and foil 7506.20 (2.5% or "
                      "3%), tubes and pipes 7507.12 (2%) and fittings 7507.20 (3%). Pure nickel uses 7505.11, 7505.21, 7506.10 and 7507.11. An "
                      "alloy is a nickel alloy only if nickel predominates by weight (subheading note 1).",
            "link": "",
        },
        {
            "id": "inconel",
            "question": "Is there a tariff on Inconel and other nickel alloys?",
            "searchedAs": ["inconel tariff", "nickel alloy tariff"],
            "answer": "Nickel-chromium superalloys in which nickel predominates are Chapter 75 nickel alloys: bar 7505.12, wire 7505.22, sheet 7506.20, "
                      "tube 7507.12. They pay a 2% to 3% base rate plus the 2026 Section 301 duty: 10% from the EU, 12.5% from Japan, 12% to 13% "
                      "from the UK, Free with USMCA, about 40% from China. Their scrap (7503) and unwrought ingots (7502.20) are Free.",
            "link": "industry-areas",
        },
        {
            "id": "powder",
            "question": "What is the HS code and tariff for nickel powder?",
            "searchedAs": ["nickel powder hs code", "hs code nickel powder", "nickel alloy powder hs code"],
            "answer": "Nickel powders and flakes are 7504.00.00 (statistical suffix .10 powders, .50 flakes), Free and on the 2026 Section 301 "
                      "exemption list. Chinese powder pays 25%; Russian powder 35% in lieu of column 2.",
            "link": "",
        },
        {
            "id": "scrap",
            "question": "What is the HS code for nickel scrap, and is there a tariff?",
            "searchedAs": ["nickel scrap hs code", "nickel alloy scrap hs code", "nickel waste and scrap hs code", "nickel scrap"],
            "answer": "Nickel and nickel-alloy waste and scrap is 7503.00.00.00. It is Free and on the 2026 Section 301 exemption list, so it pays no "
                      "duty except from China (25%) and Russia (6.6¢/kg column 2).",
            "link": "",
        },
        {
            "id": "matte",
            "question": "What is the HS code for nickel matte?",
            "searchedAs": ["hs code nickel matte", "nickel matte hs code", "nickel oxide hs code"],
            "answer": "Nickel mattes are 7501.10.00.00 and nickel oxide sinters and other intermediate products of nickel metallurgy 7501.20.00.00; "
                      "both are Free. Mattes are exempt from the 2026 Section 301 duty; oxide sinters are not. Chemical nickel oxides and "
                      "hydroxides are 2825.40.00.",
            "link": "",
        },
        {
            "id": "canada",
            "question": "Is there a tariff on nickel from Canada?",
            "searchedAs": ["canada nickel tariff", "nickel tariff canada", "how much nickel does the us import from canada"],
            "answer": f"Canadian unwrought nickel, scrap and powders are Free, with or without a USMCA claim. Canadian nickel semis are Free with "
                      f"a USMCA claim, or pay their base rate plus 10% without one. No Section 232 or Section 338 duty reaches nickel. Canada "
                      f"is the largest supplier: {B(T['ca'])} of Chapter 75 goods in {T['Y']}, including {B(ca)} of unwrought nickel.",
            "link": "industry-areas",
        },
        {
            "id": "china",
            "question": "What is the tariff on nickel from China?",
            "searchedAs": ["nickel tariff china", "china critical minerals tariffs"],
            "answer": "25% Section 301 (List 3) on every Chapter 75 line, including unwrought nickel, scrap and powders. Bars, wire, sheet, tube "
                      "and fittings also pay the 12.5% 2026 Section 301 duty and their base rate: 39.5% to 40.5%.",
            "link": "industry-areas",
        },
        {
            "id": "russia",
            "question": "Can the U.S. import Russian nickel?",
            "searchedAs": ["russian nickel", "russian nickel company", "russian nickel production"],
            "answer": "Not if it was produced on or after April 13, 2024: OFAC applied the import prohibition of Executive Order 14068 to nickel of "
                      "Russian Federation origin on April 12, 2024, unless licensed. Older Russian nickel pays 35% in lieu of column 2 on unwrought "
                      "nickel and powders and column 2 rates plus 12.5% on semis. The U.S. recorded no Chapter 75 imports from Russia in "
                      f"{T['Y']}.",
            "link": "tariff-updates",
        },
        {
            "id": "imports",
            "question": "Where does the U.S. get its nickel?",
            "searchedAs": ["where does the us get nickel from", "where does the us get most of its nickel", "us nickel imports", "us nickel imports by country",
                           "does the us import nickel", "how much nickel does the us import"],
            "answer": f"In {T['Y']} the U.S. imported {B(T['total'])} of Chapter 75 nickel products. The largest suppliers were {tops}. "
                      f"Unwrought nickel was {B(T['byh']['7502'])}, led by Canada and Norway. Nickel ores (Chapter 26) and nickel in "
                      "stainless steel are not included.",
            "link": "understand-industry",
        },
        {
            "id": "chapter-75",
            "question": "What is HTS Chapter 75?",
            "searchedAs": ["hts chapter 75", "htsus chapter 75"],
            "answer": "Chapter 75 of the Harmonized Tariff Schedule covers nickel and articles of nickel: mattes and oxide sinters (7501), unwrought "
                      "nickel (7502), scrap (7503), powders and flakes (7504), bars, rods, profiles and wire (7505), plates, sheets, strip and foil "
                      "(7506), tubes, pipes and fittings (7507) and other articles (7508): 29 ten-digit lines with base rates from Free to 3%.",
            "link": "",
        },
    ]


# ------------------------------------------------------------------ trade narrative
NAME_FIX = {"Rep. of Korea": "South Korea", "Other Asia, nes": "Taiwan", "Viet Nam": "Vietnam", "China, Hong Kong SAR": "Hong Kong",
            "Dominican Rep.": "Dominican Republic"}
DESC_FIX = {"7508.90": "Other articles of nickel (stranded wire and other)", "7501.10": "Nickel mattes"}
ui = d["understandIndustry"]
for _l in ui["byLine"]:
    if _l["hs6"] in DESC_FIX:
        _l["description"] = DESC_FIX[_l["hs6"]]
    _l["searchText"] = _l["searchText"].replace("…", "").replace("n.e.c. in item no. 7508.1", "other")
for _c in ui["byCountry"]:
    _c["country"] = NAME_FIX.get(_c["country"], _c["country"])
    if _c.get("mainHeading") in G:
        _c["mainHeadingLabel"] = G[_c["mainHeading"]][0]
for _x in ui["byHeadingCountry"]:
    _x["country"] = NAME_FIX.get(_x["country"], _x["country"])

assert ui["latestYear"], "no trade data: run with --trade-file"
Y, PY = ui["latestYear"], ui["priorYear"]


def B(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M"


def pct(a, b):
    return (a - b) / b * 100 if b else 0.0


total = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
prior = sum(c["priorImportsUsd"] for c in ui["byCountry"]) + ui["othersPriorImportsUsd"]
byh, hc = {}, {}
for x in ui["byHeadingCountry"]:
    byh[x["heading"]] = byh.get(x["heading"], 0) + x["importsUsd"]
    hc.setdefault(x["country"], {})[x["heading"]] = x["importsUsd"]
raw_total = sum(v for h, v in byh.items() if h <= "7504")
semi_total = sum(v for h, v in byh.items() if h >= "7505")
top = ui["byCountry"]
assert top[0]["country"] == "Canada"
TRADE = {
    "Y": Y, "PY": PY, "total": total, "prior": prior, "raw": raw_total, "semi": semi_total, "byh": byh,
    "top": [(c["country"], c["importsUsd"], c["sharePct"], c["changePct"], c.get("mainHeading")) for c in top],
    "ca": top[0]["importsUsd"], "ca7502": hc["Canada"]["7502"],
}
peak = max(ui["byYear"], key=lambda y: y["totalUsd"])
assert not any("Russia" in c for c in hc), "Russia now has trade: update the Russia FAQ"

ui["h1"] = "HTS Chapter 75: Nickel and Articles Thereof — U.S. Import Statistics"
ui["seo"] = {
    "title": f"U.S. Nickel Imports by Country & Product: Canada, UK, Germany, Norway (HTS Ch. 75) | KoalaGains",
    "shortDescription": (
        f"Where U.S. nickel imports come from, {ui['byYear'][0]['year']}–{Y}: {B(total)} in {Y} ({pct(total, prior):+.1f}% on {PY}), led by "
        f"{top[0]['country']} and {top[1]['country']}. Unwrought nickel, scrap, powders, alloy bar, wire, sheet and tube by country, "
        "product and year, from UN Comtrade."
    ),
    "keywords": [
        "us nickel imports",
        "us nickel imports by country",
        "where does the us get nickel from",
        "where does the us get most of its nickel",
        "does the us import nickel",
        "how much nickel does the us import from canada",
        "HTS Chapter 75 import statistics",
    ],
}
ui["byYearCaption"] = f"U.S. imports of Chapter 75 goods each year, split into the two largest {Y} suppliers ({top[0]['country']} and {top[1]['country']}) and everyone else."
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["sources"] = [s for s in ui["sources"] if "comtrade" in (s.get("url") or "")] + [
    {"label": "Federal Register 91 FR 47318 (2026 Section 301 actions on 60 economies, from July 24, 2026)", "url": S("fr-2026-15181")["url"]},
    {"label": "Federal Register 89 FR 48324 (OFAC: import prohibition on nickel of Russian origin, April 12, 2024)", "url": S("ofac-2024-12372")["url"]},
]
raw_share = raw_total / total * 100
semi_by = sorted(((h, byh[h]) for h in ("7505", "7506", "7507", "7508")), key=lambda kv: -kv[1])
ui["why"] = (
    f"U.S. imports of Chapter 75 nickel were **{B(total)} in {Y}**, {pct(total, prior):+.1f}% from {B(prior)} in {PY} and down from the "
    f"{peak['year']} peak of {B(peak['totalUsd'])}. **Unwrought nickel (7502) was {B(byh['7502'])}**, {byh['7502'] / total * 100:.0f}% of "
    f"the total: Canada shipped {B(hc['Canada']['7502'])}, Norway {B(hc['Norway']['7502'])}, the United Kingdom {B(hc['United Kingdom']['7502'])}, "
    f"South Africa {B(hc['South Africa']['7502'])}, Japan {B(hc['Japan']['7502'])} and Finland {B(hc['Finland']['7502'])}. Scrap was "
    f"{B(byh['7503'])} (the UK {B(hc['United Kingdom']['7503'])}, Canada {B(hc['Canada']['7503'])}, Mexico {B(hc['Mexico']['7503'])}) and "
    f"powders {B(byh['7504'])}, mostly from Canada. These raw forms ({B(raw_total)}, {raw_share:.0f}%) are on the 2026 Section 301 "
    f"exemption list, except nickel oxide sinters (7501.20, {B(byh['7501'])} with mattes).\n\n"
    f"Wrought nickel and nickel alloys were {B(semi_total)}: other articles (7508) {B(byh['7508'])}, led by Mexico "
    f"({B(hc['Mexico']['7508'])}); bars, rods and wire (7505) {B(byh['7505'])}, led by France ({B(hc['France']['7505'])}), Germany "
    f"({B(hc['Germany']['7505'])}) and Australia ({B(hc['Australia']['7505'])}); tubes and fittings (7507) {B(byh['7507'])}; and sheet, strip "
    f"and foil (7506) {B(byh['7506'])}, led by Germany and Japan. These are the goods that pay the 2026 Section 301 duty, except "
    "USMCA goods and 7508.90.50.\n\n"
    f"No Chapter 75 imports from Russia were recorded in {Y}; Russian nickel produced since April 13, 2024 may not be imported. "
    f"{Y} is the latest full year of U.S. trade data. Nickel ores (Chapter 26), ferronickel (Chapter 72) and nickel chemicals (Chapter 28) "
    "are not included. Duty-collected figures aren't available from an official source yet."
)

ts = o["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
for bl in ts["biggestLines"]:
    if bl["hts"] in DESC_FIX:
        bl["label"] = DESC_FIX[bl["hts"]]
o["stats"].append({"label": f"{Y} imports", "value": B(total)})

# ------------------------------------------------------------------ finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 75 FAQ: Nickel Tariffs, HS Codes and Exemptions"
fc["seo"] = {
    "title": "Nickel Tariff FAQ 2026: Is There a Tariff on Nickel? Section 232, HS Codes, Canada, China, Russia (HTS Ch. 75) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about U.S. nickel tariffs: whether nickel is tariffed, the critical minerals Section 232 "
        "decision, the 2026 Section 301 exemptions, HS codes for nickel, nickel alloy, powder, scrap and matte, Canada, China and "
        "Russian nickel."
    ),
    "keywords": [
        "is there a tariff on nickel",
        "nickel tariffs us",
        "nickel section 232",
        "critical minerals 232",
        "hs code nickel",
        "nickel alloy hs code",
        "nickel powder hs code",
        "nickel scrap hs code",
        "canada nickel tariff",
        "russian nickel",
        "hts chapter 75",
    ],
}
fc["intro"] = (
    "Straight answers to the most-searched questions about U.S. tariffs on nickel imports, by product, by country and by HS code. Each "
    "answer links to the page with the detail and the official sources."
)
fc["keyTakeaways"] = [
    "Unwrought nickel, mattes, scrap, powders and other articles (7508.90.50) are Free and on the 2026 Section 301 exemption list: they "
    "pay no duty except from China (25%) and Russia.",
    "Wrought nickel and nickel alloys (bars, wire, sheet, strip, foil, tubes, fittings) pay 2% to 3% plus the 2026 Section 301 duty of "
    "most suppliers: 10% (EU floor), 12.5% (Japan, Korea), 12% to 13% (UK), Free with USMCA, about 40% from China and Brazil.",
    "No Section 232 duty applies to nickel: the January 2026 critical minerals proclamation chose negotiations, not tariffs. The IEEPA "
    "tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026. No AD/CVD order covers Chapter 75.",
    f"Russian nickel produced since April 13, 2024 cannot be imported. In {Y} the U.S. imported {B(total)} of Chapter 75 products, "
    f"{top[0]['country']} ({B(top[0]['importsUsd'])}) and {top[1]['country']} ({B(top[1]['importsUsd'])}) first.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = QSRC
fc["faqs"] = FAQS(TRADE, B)

d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows (2026 Revision 21)"},
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": f"{Y} import figures"},
]
json.dump(d, open(OUT, "w"), ensure_ascii=False, indent=2)
print("filled", OUT)
