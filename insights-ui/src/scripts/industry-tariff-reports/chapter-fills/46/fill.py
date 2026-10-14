"""Fill the writer parts of the generated Chapter 46 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 46 ...` (see run.sh in this folder):
    python3 fill.py
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, OUT  # noqa: E402,F401

import json
import os

WT = IU
PATH = OUT  # run.sh copies the generated file here; filled in place
POOL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pool.json")
CHECKED = "2026-10-12"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH46 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2046"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"

d = json.load(open(PATH))
pool = json.load(open(POOL))

NEW_SOURCES = {}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


def ruling(n):
    return f"https://rulings.cbp.gov/ruling/{n}"


LABELS = {
    "4601": ("Plaits, mats, matting and screens of plaiting materials (bamboo, rattan, willow, seagrass, plastic strip)", "Mats & plaits"),
    "4602": ("Baskets, wickerwork, bags and other articles of plaiting materials; articles of loofah", "Baskets & wickerwork"),
}

RATTAN = (
    "the 14 rattan provisions — rattan mats (4601.22), woven willow mats (4601.29.40), rattan plaits and webbing (4601.93) "
    "and rattan baskets, bags and articles (4602.12)"
)
ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 46: Basketware & Wickerwork (Straw, Esparto, Rattan, Bamboo, Seagrass) — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 46 Tariff Rates 2026: Basketware, Wickerwork, Rattan & Seagrass Baskets Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 49 HTS Chapter 46 lines: bamboo, rattan, willow, seagrass and water hyacinth baskets, "
    "wickerwork, straw and raffia bags, mats and loofah articles. General, FTA and Column 2 rates plus the 2026 extra duty by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 46",
    "basketware and wickerwork tariff",
    "manufactures of straw import duty rates",
    "HS code 4602",
    "HS code for wicker basket",
    "rattan basket import duty",
    "willow baskets import duty",
    "loofah articles tariff",
    "china section 301 basketware duties",
    "USMCA plaiting materials customs duty",
]
ov["intro"] = (
    "Chapter 46 covers goods made from **plaiting materials** — straw, osier or willow, bamboo, rattan, rushes, reeds, seagrass, "
    "water hyacinth, raffia, strips of wood or paper and plastic strip over 5 mm wide. Heading 4601 holds plaits, mats, matting "
    "and screens; heading 4602 holds **baskets, wickerwork, bags and other articles** made directly to shape, plus articles of "
    "loofah. Its **49 tariff lines** run from Free (wickerwork and floor coverings) to 18% (palm-leaf handbags); most baskets "
    "pay 4.5%–10%.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of "
    "10% or 12.5%** — **12.5% from Vietnam, the Philippines and Thailand**, 10% from India and Indonesia — and no Chapter 46 "
    "line is on the general exemption list. Rattan goods from Indonesia, Cambodia and nine other countries are exempt through "
    "their country exception lists. China pays **37.5% more** (25% List 3 + 12.5%) on every line. USMCA-qualifying goods from "
    "Mexico enter free; Canada pays a **50% Section 338 duty** on 4602.19.80. U.S. imports were **$614M in 2025**, led by "
    "Vietnam (25%), China (21%) and India (20%)."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    if g["heading"] == "4601":
        g["blurb"] = (
            "Plaits and braids in strips, and mats, matting and screens of bamboo, rattan, willow and other plaiting materials, "
            "including table placemats. Floor coverings and rattan webbing are Free; woven mats 3.3%–4.8%, plaits 2.7%, other "
            "mats 8% and other articles 6.6%. Only $19M of the chapter's imports."
        )
        g["searchExamples"] = ["bamboo mat", "bamboo placemat", "rattan webbing", "seagrass mat", "rattan mat", "willow screen", "straw plait", "raffia braid"]
    else:
        g["blurb"] = (
            "Baskets, hampers, bags, handbags, trays and decorative articles woven to shape: bamboo (4602.11), rattan (4602.12), "
            "willow, palm leaf, seagrass, water hyacinth and other vegetable materials (4602.19), and plastic or paper strip "
            "(4602.90). Wickerwork of rods and twigs is Free; other baskets pay 4.5%–10%, handbags up to 18%. 97% of imports."
        )
        g["searchExamples"] = ["wicker basket", "rattan basket", "seagrass basket", "water hyacinth basket", "willow basket", "laundry hamper", "raffia bag", "straw handbag", "loofah"]

ov["workedExamples"] = [
    {
        "title": "Water hyacinth storage baskets from Vietnam",
        "line": "4602.19.18.00",
        "body": "Baskets woven from water hyacinth are not wickerwork — CBP limits that to rods and twigs with a round cross "
        "section (HQ H263914) — so they fall in 4602.19.18 at 4.5% (NY N336147). Vietnam's Section 301 rate adds 12.5% "
        "(9903.05.84): a $10,000 shipment pays **$1,700**. No exception list covers this line.",
    },
    {
        "title": "Rattan baskets: China vs Indonesia vs Vietnam",
        "line": "4602.12.16.00",
        "body": "Rattan baskets that are not wickerwork pay 5%. From China, List 3 (+25%, 9903.88.03) and the 2026 action (+12.5%, "
        "9903.05.31) stack: **$4,250** on $10,000. From Indonesia only the base rate applies, **$500**, because 4602.12 is on "
        "Indonesia's exception list (U.S. note 52(j)(11), 9903.06.16). From Vietnam: 5% + 12.5% = **$1,750**.",
    },
    {
        "title": "Raffia handbags from Madagascar, with an AGOA claim",
        "line": "4602.19.25.00",
        "body": "CBP classifies raffia handbags as palm-leaf handbags in 4602.19.25, 18% (HQ H284742). Madagascar is not one of the "
        "60 Section 301 economies, and AGOA (SPI D, renewed through December 31, 2026) makes the line Free: **$0** on $10,000 "
        "when the bags meet the AGOA origin rules. The same bags from China pay 55.5% ($5,550), from the Philippines 30.5%.",
    },
    {
        "title": "Decorative plaited articles from Canada vs Mexico",
        "line": "4602.19.80.00",
        "body": "Other articles of vegetable plaiting materials (decorative figures, loofah articles) are 2.3%. From Canada, "
        "4602.19.80 is on the Section 338 list in U.S. note 51(b)(1) (9903.03.12), charged even when USMCA is claimed: "
        "**$2,500** on a $5,000 shipment entered since August 22, 2026. From Mexico with a USMCA claim: **$0**.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in d["understandIndustry"]["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "4602.19", "label": "Baskets and articles of other vegetable materials (seagrass, water hyacinth, willow, palm leaf, loofah)"},
    {"hts": "4602.90", "label": "Baskets and articles of non-vegetable materials (plastic or paper strip)"},
    {"hts": "4602.12", "label": "Rattan baskets and articles"},
    {"hts": "4602.11", "label": "Bamboo baskets and articles"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; Comtrade does not split 4602.19 or 4602.90 into the 8- and 10-digit U.S. lines, so this page does not say which "
    "line each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** In this chapter the expression \"plaiting materials\" means materials in a state or form suitable for plaiting, "
    "interlacing or similar processes; it includes straw, osier or willow, bamboos, rattans, rushes, reeds, strips of wood, "
    "strips of other vegetable material (for example, strips of bark, narrow leaves and raffia or other strips obtained from "
    "broad leaves), unspun natural textile fibers, monofilament and strip and the like of plastics and strips of paper, but not "
    "strips of leather or composition leather or of felt or nonwovens, human hair, horsehair, textile rovings or yarns, or "
    "monofilament and strip and the like of chapter 54.\n\n"
    "**Note 2.** This chapter does not cover: (a) wall coverings of heading 4814; (b) twine, cordage, ropes or cables, plaited "
    "or not (heading 5607); (c) footwear or headgear or parts thereof of chapter 64 or 65; (d) vehicles or bodies for vehicles "
    "of basketware (chapter 87); or (e) articles of chapter 94 (for example, furniture, luminaires and lighting fittings).\n\n"
    "**Note 3.** For the purposes of heading 4601, the expression \"plaiting materials, plaits and similar products of plaiting "
    "materials, bound together in parallel strands\" means plaiting materials, plaits and similar products of plaiting "
    "materials, placed side by side and bound together, in the form of sheets, whether or not the binding materials are of "
    "spun textile materials."
)
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 46 Tariff Updates: Basketware, Wickerwork & Rattan (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 46 Tariff Updates 2026: Basketware & Wickerwork — Section 301, Canada 338, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 46 baskets, wickerwork, mats and plaited articles since January 2025: unchanged base rates, "
    "the IEEPA tariffs and their end, the Section 122 surcharge, the 2026 Section 301 tariffs on Vietnam, the Philippines, "
    "Indonesia and India, China's List 3 duty and Canada's 50% Section 338 duty."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 46 tariff updates",
    "hts chapter 46 import duty rates",
    "section 301 tariff updates basketware",
    "vietnam chapter 46 import duty",
    "china tariff on basketware and wickerwork",
    "usmca basketware tariff exemption",
    "loofah sponges customs duty",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 49 Chapter 46 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. In 2025 the IEEPA tariffs added 20% on Vietnamese and 19% on Philippine, "
    "Indonesian, Thai and Cambodian baskets, 25%–50% on Indian goods and 20%–30% more on Chinese goods. They **ended on February "
    "24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods "
    "from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; rattan goods from 11 countries are exempt. China keeps its "
    "25% List 3 duty, and since **August 22, 2026 Canada pays 50%** under Section 338 on 4602.19.80, USMCA claim or not."
)
tu["scope"] = (
    "Measures that reach Chapter 46 from any country: the 2026 Section 301 tariffs on 60 economies and their country exception "
    "lists, the Brazil Section 301 tariff, China Section 301 List 3, the Canada Section 338 duty, the Nicaragua Section 301 "
    "phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended; plus the Lacey Act plant declaration that reaches "
    "most vegetable-material lines. No antidumping or countervailing duty order and no Section 232 action covers a Chapter 46 "
    "line. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "49 of 49 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China) and Canada Section 338"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

NO_LIST = "No Chapter 46 line is on the general exemption list (U.S. note 52(b)) or on this country's exception list. "
IE = {
    "vn": (
        NO_LIST + "The 20% IEEPA reciprocal duty on Vietnam (9903.02.69) ended February 24, 2026; the 10% Section 122 surcharge "
        "expired July 23, 2026.",
        "Vietnamese seagrass, water hyacinth, rattan and bamboo baskets pay the base rate plus 12.5% — 17% on most "
        "other-vegetable baskets, 12.5% on wickerwork.",
    ),
    "cn": (
        "Two Section 301 duties stack on all 49 lines. List 3 (+25%, 9903.88.03; 10% from September 24, 2018, 25% since May 10, "
        "2019) names every Chapter 46 subheading, and the 2026 action adds +12.5% (9903.05.31). No China exclusion now in effect "
        "names a Chapter 46 product — the earlier exclusions for rattan webbing and polypropylene roofing underlayment have "
        "expired. USTR confirmed on October 7, 2026 that the 2018 actions continue. The IEEPA duties on China (20% fentanyl, 10% "
        "from November 10, 2025, plus 10% reciprocal) ended February 24, 2026.",
        "Chinese baskets and wickerwork pay the base rate plus 37.5%: 42.5% on rattan baskets, 47.5% on bamboo baskets, 41% on "
        "plastic-strip baskets.",
    ),
    "in": (
        NO_LIST + "GSP (SPI A, A*, A+), printed on most dutiable lines, has been expired since December 31, 2020. The 25% "
        "reciprocal duty (9903.02.26) and the extra 25% (9903.01.84, ended February 7, 2026) are gone. " + ENDED,
        "Indian baskets and bags pay the base rate plus 10% — 13.5% on plastic-strip articles (4602.90), 14.5% on other "
        "vegetable baskets.",
    ),
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94) and no base rate. Under General Note 11 "
        "heading 4601 must change from another chapter and heading 4602 from another heading, so baskets woven in Mexico from "
        "imported plaiting materials qualify. The 25% IEEPA duty on Mexico (9903.01.01) ended February 24, 2026.",
        "Mexican baskets and mats that qualify for USMCA pay $0; goods without a valid claim pay the base rate plus 10%.",
    ),
    "ph": (
        NO_LIST + "GSP has been expired since December 31, 2020. The 19% IEEPA reciprocal duty (9903.02.53) ended February 24, "
        "2026; the Section 122 surcharge expired July 23, 2026.",
        "Philippine baskets, bags and mats pay the base rate plus 12.5% — 17% on other-vegetable baskets, 30.5% on palm-leaf "
        "handbags.",
    ),
    "id": (
        "Indonesia's exception list (U.S. note 52(j)(11)(i), 9903.06.16) covers " + RATTAN + "; the other 35 lines pay 10%. "
        "The 19% IEEPA reciprocal duty (9903.02.27) ended February 24, 2026; the Section 122 surcharge expired July 23, 2026.",
        "Indonesian rattan baskets pay only the base rate (5% for most); Indonesian seagrass, bamboo and water hyacinth baskets "
        "pay the base rate plus 10%.",
    ),
    "th": (
        NO_LIST + "GSP has been expired since December 31, 2020. The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, "
        "2026; the Section 122 surcharge expired July 23, 2026.",
        "Thai baskets and mats pay the base rate plus 12.5%.",
    ),
    "eu": (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at 10% or more no Section 301 duty is due "
        "(9903.05.38) — that covers bamboo baskets (4602.11.09, 10%) and palm-leaf and rattan handbags (18%). The EU exception "
        "list (note 52(j)(2)) names no Chapter 46 line. This replaced the 15% IEEPA rate (9903.02.20), which ended February 24, "
        "2026.",
        "Italian, Spanish or French baskets pay 10% of value in place of the base rate; lines already at 10% or 18% pay only "
        "their base rate.",
    ),
    "kh": (
        "Cambodia's exception list (U.S. note 52(j)(5)(i), 9903.06.02) covers " + RATTAN + "; the other 35 lines pay 10%. The "
        "19% IEEPA reciprocal duty (9903.02.11) ended February 24, 2026.",
        "Cambodian rattan baskets pay only the base rate; other Cambodian baskets pay the base rate plus 10%.",
    ),
    "ca": (
        "Two duties. Section 301 (+10%, 9903.05.29) is lifted for USMCA-qualifying goods (9903.05.93). The Section 338 duty "
        "(+50%, 9903.03.12, Proclamation 11046) covers 4602.19.80 (U.S. note 51(b)(1)) and applies even when USMCA is claimed "
        "(note 51(a)). It took effect August 22, 2026 after a 3-day suspension; Proclamation 11064 kept 4602.19.80 on the list "
        "from September 15, and it is not on the September 29 import-ban annexes. The 35% IEEPA duty ended February 24, 2026.",
        "Canadian 4602.19.80 goods (other articles of vegetable plaiting materials) pay 50% with a USMCA claim and 62.3% "
        "without; every other Canadian Chapter 46 good pays $0 with USMCA.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). Note 50(a)(ii) (9903.05.03) lifts the 25% from the same 14 rattan provisions that are on the country "
        "exception lists, but the 12.5% still applies to them. The 40% IEEPA duty on Brazil ended February 24, 2026.",
        "Brazilian baskets pay the base rate plus 37.5%; rattan goods pay the base rate plus 12.5%.",
    ),
    "other": (
        "No Chapter 46 line is on the general exemption list (note 52(b)). Country exception lists in note 52(j) cover "
        + RATTAN + " for Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, "
        "Ecuador and Jordan. Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate "
        "is lower. " + ENDED,
        "Malaysian or Bangladeshi rattan baskets pay only the base rate; other baskets from these economies pay the base rate "
        "plus 10% or 12.5%. Countries outside the 60 economies, such as Madagascar, pay only the base rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "cn":
        e["before"] = "+25% (List 3)"
        e["now"] = "+37.5%"
    if key == "ca":
        e["now"] = "+50% or +60% (4602.19.80); +10% or none on the rest"
    if key in ("id", "kh"):
        e["now"] = "+10% (35 of 49 lines; rattan lines exempt)"
    if key == "br":
        e["now"] = "+37.5% (35 lines) or +12.5% (14 rattan lines)"
    if key == "other":
        e["country"] = "Other Section 301 economies (49, incl. Malaysia, Bangladesh, Japan, Taiwan, Switzerland, Ecuador)"
        e["now"] = "+10% or +12.5% (10% or 12.5% in total for Japan, South Korea, Switzerland, Taiwan)"
    if key in ("in", "ph", "th") and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")
    if key == "ca":
        for sid in ("procl-11061", "procl-11062", "procl-11063"):
            e["sourceIds"].insert(-1, sid)

add_sources(tu, [
    "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193", "eo-14194", "eo-14195",
    "eo-14228", "eo-14257", "eo-14266", "eo-14298", "eo-14357", "eo-14326", "eo-14329", "eo-14384", "eo-14325",
    "ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-gn16", "procl-11061", "procl-11062", "procl-11063",
    "fr-2024-11901", "aphis-lacey",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 46 base-rate changes",
        "detail": "All 49 Chapter 46 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 "
        "Basic Edition; no line was added, split or renumbered.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 3 continues",
        "detail": "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the "
        "four-year review. For Chapter 46 this keeps +25% (9903.88.03) on all 49 lines, on top of the 12.5% 2026 action.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-ban", "type": "reference", "date": "2026-09-29", "dateLabel": "Effective",
        "title": "Canadian import bans do not reach Chapter 46",
        "detail": "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over "
        "800 cc from September 29, 2026. 4602.19.80 stays on the alcoholic-beverages duty list but is not on the ban annex, so "
        "it keeps paying the 50% duty.",
        "before": None, "now": None, "countries": "Canada", "sourceIds": ["procl-11061", "procl-11062", "procl-11063", "hts-now"],
    },
    {
        "id": "ca-338-scope", "type": "reference", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Section 338 alcoholic-beverages list revised; 4602.19.80 stays on it",
        "detail": "Proclamation 11064 added 34 provisions to the 9903.03.12 list and removed two spirits subheadings from "
        "September 15, 2026. 4602.19.80 was not removed.",
        "before": "+50%", "now": "+50%", "countries": "Canada", "sourceIds": ["procl-11064", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ca-338", "type": "extraDuty", "date": "2026-08-22", "dateLabel": "Effective",
        "title": "Canada Section 338 duty of 50% on 4602.19.80",
        "detail": "Proclamation 11046 put a 50% duty (9903.03.12) on Canadian goods in the provisions of U.S. note 51(b)(1), "
        "which include 4602.19.80 (other articles of vegetable plaiting materials). It is charged even when USMCA is claimed "
        "and on top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 after a "
        "3-day suspension (Proclamation 11056).",
        "before": "None", "now": "+50%", "countries": "Canada",
        "sourceIds": ["procl-11046", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover every Chapter 46 line",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84): 12.5% for Vietnam, the Philippines, "
        "Thailand and China, 10% for India, Indonesia, Cambodia, Mexico and Canada. No Chapter 46 line is on the general "
        "exemption list (U.S. note 52(b)); country lists in note 52(j) exempt " + RATTAN + " of 11 countries, including "
        "Indonesia, Cambodia and Malaysia. EU goods pay 10% in total; USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). "
        "FTA claims remove the base rate but not this duty.",
        "before": "None", "now": "+10% / +12.5%", "countries": "60 economies", "sourceIds": S301,
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "br-301", "type": "extraDuty", "date": "2026-07-22", "dateLabel": "Effective",
        "title": "Section 301 tariff on products of Brazil",
        "detail": "25% on goods of Brazil (9903.05.01) on 35 Chapter 46 lines; the 14 rattan provisions are on the note "
        "50(a)(ii) exemption list (9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on every line.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in "
        "force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 46 line was on the product "
        "exemption list (9903.03.03), so every basket, mat and plaited article paid it. USMCA-qualifying goods from Canada "
        "and Mexico were exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP "
        "stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings "
        "are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-oil-end", "type": "extraDuty", "date": "2026-02-07", "dateLabel": "Effective",
        "title": "Extra 25% on products of India ended",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) that had applied since "
        "August 27, 2025. India's 25% reciprocal duty continued until February 24, 2026.",
        "before": "+25%", "now": "None", "countries": "India", "sourceIds": ["eo-14384", "eo-14329"],
    },
    {
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. "
        "AGOA (SPI D) makes every dutiable Chapter 46 line Free for eligible sub-Saharan countries such as Madagascar. GSP "
        "(SPI A, A*, A+), printed on most dutiable lines, remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026", "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "crs-agoa", "procl-11030", "hts-gn16", "cbp-gsp", "hts-now"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR "
        "(9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 46 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-fentanyl-cut", "type": "extraDuty", "date": "2025-11-10", "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "Executive Order 14357 lowered the IEEPA duty on products of China (9903.01.24) from 20% to 10%, so Chinese "
        "baskets paid 10% + 10% reciprocal + 25% List 3 on top of the base rate. Ended February 24, 2026.",
        "before": "+20%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14357"],
    },
    {
        "id": "in-oil", "type": "extraDuty", "date": "2025-08-27", "dateLabel": "Effective",
        "title": "Extra 25% on products of India",
        "detail": "Executive Order 14329 added 25% on Indian goods (9903.01.84) on top of the 25% reciprocal rate, for 50% in all "
        "on Indian baskets and bags. Ended February 7, 2026.",
        "before": "+25%", "now": "+50% (ended)", "countries": "India", "sourceIds": ["eo-14329", "eo-14384"],
    },
    {
        "id": "reciprocal-country", "type": "extraDuty", "date": "2025-08-07", "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates replace the 10% baseline",
        "detail": "Executive Order 14326 set each country's reciprocal rate: Vietnam +20% (9903.02.69); Philippines, Indonesia, "
        "Thailand and Cambodia +19%; India +25%; Madagascar +15%; EU goods 15% in total. No Chapter 46 line was on the "
        "reciprocal-tariff exemption list. Ended February 24, 2026.",
        "before": "+10%", "now": "+15% to +25% (ended)", "countries": "Listed countries", "sourceIds": ["eo-14326", "hts-now"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "cn-reciprocal-10", "type": "extraDuty", "date": "2025-05-14", "dateLabel": "Effective",
        "title": "China reciprocal duty cut from 125% to 10%",
        "detail": "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. "
        "Ended February 24, 2026.",
        "before": "+125%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14298"],
    },
    {
        "id": "cn-125", "type": "extraDuty", "date": "2025-04-10", "dateLabel": "Effective",
        "title": "China reciprocal duty raised to 125%; other country rates paused",
        "detail": "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% and paused the higher country rates "
        "for other countries (Vietnam had been set at 46%), leaving the 10% baseline. With the 20% fentanyl duty and the 25% "
        "List 3 duty, Chinese baskets paid 170% on top of the base rate until May 13, 2025.",
        "before": "+34%", "now": "+125% (ended)", "countries": "China; all others", "sourceIds": ["eo-14266", "eo-14257"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) from April 5, 2025 and country rates (9903.02.xx); Canada and Mexico excluded. "
        "Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "cn-fentanyl-20", "type": "extraDuty", "date": "2025-03-04", "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20%, on top of List 3. Ended "
        "February 24, 2026.",
        "before": "+10%", "now": "+20% (ended)", "countries": "China", "sourceIds": ["eo-14228"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt (9903.01.04). Ended "
        "February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10) from March 4, 2025, later raised to +35%; USMCA-qualifying goods exempt "
        "(9903.01.14). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "cn-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of China",
        "detail": "+10% on all goods of China (9903.01.20) from February 4, 2025, on top of the 25% List 3 duty. Ended "
        "February 24, 2026.",
        "before": "None", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14195"],
    },
    {
        "id": "lacey-phase-7", "type": "reference", "date": "2024-12-01", "dateLabel": "Effective",
        "title": "Lacey Act plant declaration now required for most Chapter 46 lines",
        "detail": "APHIS Phase VII of the Lacey Act declaration schedule, which began December 1, 2024, covers all of 4601.21–"
        "4601.94 (mats and plaits of bamboo, rattan and other vegetable materials), all bamboo and rattan baskets and articles "
        "(4602.11, 4602.12), and 4602.19.05, .12, .35, .45, .60 and .80. Importers must file the genus, species, country of "
        "harvest, quantity and value of the plant (PPQ Form 505 or the ACE Lacey Act message set).",
        "before": None, "now": None, "countries": "All", "sourceIds": ["fr-2024-11901", "aphis-lacey"],
    },
]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 46: Basketware & Wickerwork — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 46 Import Statistics: Baskets & Wickerwork from Vietnam, China, India | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of baskets, wickerwork, mats and plaited articles 2020–2025, by country, product and year: $614M in 2025, "
    "down 5.7%; Vietnam supplied 25%, China 21% and India 20%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 46 import statistics",
    "basketware and wickerwork imports",
    "wicker basket importers",
    "vietnam tariff on basketware and wickerwork",
    "china section 301 tariffs on plaiting materials",
    "rattan basket imports",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][1]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    "U.S. imports of Chapter 46 goods fell from **$651M in 2024 to $614M in 2025** (−5.7%), well below the 2021–2022 peak of "
    "about $875M. Almost all of it — **$594M, 97%** — is heading 4602: baskets and articles of other vegetable materials such "
    "as seagrass, water hyacinth, willow and palm leaf (4602.19, $273M), articles of plastic or paper strip (4602.90, $217M, "
    "down 13%), rattan ($53M, +6%) and bamboo ($52M). Mats, plaits and screens of heading 4601 were only $19M.\n\n"
    "**Vietnam became the largest supplier**, $154M (25%, +8.6%), as **China fell 22% to $131M** — down from $356M in 2021. "
    "India ($120M) fell 21%, while Mexico ($53M, +14.5%) and Thailand ($27M, +38.5%) grew. The Philippines ($35M) and "
    "Indonesia ($34M) were roughly flat; Italy, Madagascar and Cambodia each shipped $8M–$11M.\n\n"
    "Through 2025 China paid its 25% List 3 duty plus the IEEPA duties, and most other suppliers paid the IEEPA reciprocal "
    "tariff from April 2025 (Vietnam 20%, the Philippines, Indonesia and Thailand 19% from August 7), while USMCA-qualifying "
    "Mexican goods paid nothing extra. Those duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of "
    "10% or 12.5% applies instead. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 46 Tariff Rates by Country: Baskets, Wickerwork & Mats"
ia["seo"]["title"] = "HTS Chapter 46 Import Duty Rates by Country: Vietnam, China, India, Mexico, Philippines, Indonesia — Basketware | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on baskets, wickerwork, mats and plaited articles by country: base rate plus the 2026 Section 301 "
    "duty, China's List 3 duty and Canada's 50% Section 338 duty, with USMCA, EU, AGOA and the rattan exception lists applied."
)
ia["seo"]["keywords"] = [
    "basketware and wickerwork tariff by country",
    "vietnam wickerwork imports",
    "china tariff on basketware and wickerwork",
    "section 301 plaiting tariffs",
    "bamboo mats import duty",
    "willow baskets customs duty",
    "Indonesia rattan basket tariff",
]
ia["intro"] = (
    "The total rate on Chapter 46 goods depends far more on **where they come from** than on what they are made of. Each cell "
    "below is the base rate for that product group plus the extra duty for that country, minus any preference — computed from "
    "the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026): **12.5% for Vietnam, the Philippines and Thailand**, 10% for India, Indonesia and Cambodia. "
    "**Rattan goods from Indonesia and Cambodia are exempt**, **USMCA-qualifying goods from Mexico enter free**, EU goods pay "
    "10% in total, Madagascar's AGOA goods enter free, and **China pays 37.5% more** on every line."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULE_LABELS = {
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on all 49 lines; no exception list covers a Chapter 46 line. The 20% IEEPA reciprocal duty ended February 24, 2026.",
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31) on all 49 lines: 37.5% on wickerwork, 42.5% on rattan baskets, 47.5% on bamboo baskets. No China exclusion covers a Chapter 46 product.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on all 49 lines. GSP has expired; the IEEPA duties (25% + 25%) ended February 2026.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Philippines": "Base rate plus 12.5% Section 301 (9903.05.64) on all 49 lines; no exception list covers a Chapter 46 line. GSP has expired.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on 35 of 49 lines; the 14 provisions on Indonesia's exception list (9903.06.16) — rattan goods (4601.22, 4601.93, 4602.12) and woven willow mats (4601.29.40) — pay the base rate only.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on all 49 lines. GSP has expired.",
    "Italy": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is under 10%; lines at 10% or 18% pay only the base rate (9903.05.38). The 15% IEEPA rate ended February 24, 2026.",
    "Madagascar": "Not one of the 60 Section 301 economies: base rate only, and AGOA (SPI D, renewed to December 31, 2026) makes every dutiable line Free. The 15% IEEPA reciprocal duty ended February 24, 2026.",
    "Cambodia": "Base rate plus 10% Section 301 (9903.05.28) on 35 of 49 lines; the 14 provisions on Cambodia's exception list (9903.06.02) — rattan goods and woven willow mats — pay the base rate only.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.12) on 4602.19.80 even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 60% on 4602.19.80.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% (9903.05.20–9903.05.84), or 37.5% more for Brazil; note 52(j) exempts the rattan provisions of Malaysia, Taiwan, Bangladesh, Argentina, Ecuador, Jordan, Guatemala, El Salvador and Switzerland.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    sids = c["rule"]["sourceIds"]
    if c["country"] != "Madagascar" and "eo-14389" not in sids:
        sids.insert(-1, "eo-14389")
    if c["country"] in ("India", "Philippines", "Thailand"):
        sids.insert(-1, "cbp-gsp")
    if c["country"] == "Madagascar":
        c["rule"]["sourceIds"] = ["ustr-agoa-2026", "crs-agoa", "hts-gn16", "eo-14389", "hts-now"]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section "
    "122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Madagascar's AGOA claim assumes the goods meet the AGOA origin rules (General Note 16) and are imported directly; AGOA "
    "runs to December 31, 2026.",
    "Canada: the 50% Section 338 duty (U.S. note 51) applies to 4602.19.80 whether or not USMCA is claimed; no Chapter 46 "
    "line is on the September 29, 2026 import-ban annexes.",
    "Not in the grid: admissibility rules — Lacey Act declarations, APHIS inspection and treatment of wooden handicrafts, "
    "and the corn and rice-straw quarantines (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86), the "
    "general exemption list, names no Chapter 46 code. The note 52(j) country lists of Switzerland, Malaysia, Cambodia, "
    "Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan each name the same 14 provisions: "
    "4601.22.40, .80, .90, 4601.29.40, 4601.93.01, .05, .20 and 4602.12.05, .14, .16, .23, .25, .35, .45; the UK, EU and "
    "Japan lists name none. Note 50(a)(ii) exempts the same 14 provisions from the Brazil duty. Note 51(b)(1) puts 4602.19.80 "
    "on the Canada Section 338 list. Note 20(f) puts every Chapter 46 subheading on China List 3; the exclusions that once "
    "covered rattan webbing (4601.93.0100) and polypropylene roofing underlayment (4602.90.0000) have expired. No Section 232 "
    "heading and no antidumping or countervailing duty order covers a Chapter 46 line."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "ustr-agoa-2026", "crs-agoa", "hts-gn16", "cbp-gsp"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Baskets, Wickerwork & Plaited Goods (HTS Ch. 46): Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Baskets & Wickerwork: Lacey Act, APHIS, Classification & Ways to Lower Duty (HTS Ch. 46) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The USDA and CBP rules for each HTS Chapter 46 line — Lacey Act declarations, APHIS inspection and treatment of wooden "
    "handicrafts from China, corn-husk and rice-straw quarantines, origin marking — and the legal ways to pay less: wickerwork "
    "classification, exception lists, USMCA, AGOA and FTAs, rulings and drawback."
)
te["seo"]["keywords"] = [
    "chapter 46 tariff engineering",
    "section 301 duties on basketware",
    "usmca chapter 46 rules of origin",
    "lacey act compliance for hts chapter 46",
    "wickerwork classification",
    "import baskets from China APHIS",
    "rattan exception list Indonesia",
]
te["intro"] = (
    "Most Chapter 46 goods are plant material, so **USDA rules apply alongside the duty**: bamboo, rattan and most other "
    "vegetable-material lines need a **Lacey Act plant declaration**; baskets with wood, twigs, vines or bamboo are wooden "
    "handicrafts that APHIS inspects, and **from China they must be treated and tagged** with the maker's identity; corn-husk "
    "articles and rice straw are under quarantine rules.\n\n"
    "The ways to pay less are in the schedule: get the **wickerwork** classification where it fits (Free instead of 4.5%–10%), "
    "source rattan goods from a country whose **exception list** covers them, claim **USMCA** on Mexican and Canadian goods, "
    "claim **AGOA or an FTA** where the base rate is the cost, get a **binding ruling** where the line decides the rate, and "
    "claim **drawback** on re-exports. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "wickerwork",
        "title": "Classify true wickerwork in the Free wickerwork lines",
        "saves": "The whole base rate: Free instead of 10% (bamboo baskets), 5% (rattan), 4.5% (other vegetable baskets), 6.6% "
        "(other articles) or 2.3%",
        "appliesTo": "Baskets and articles of bamboo, rattan, willow, wood, palm leaf and other vegetable materials made of "
        "interlaced rods or twigs (4602.11.07, .35; 4602.12.14, .35; 4602.19.14, .17, .35, .60)",
        "document": "Product specifications showing the plaiting material is in rod or twig form with a round cross section; a "
        "binding ruling if in doubt.",
        "caveat": "CBP treats wickerwork as articles of interlaced rods or twigs with rounded cross sections; flat strips, split "
        "slats, water hyacinth or seagrass that flatten when woven are not wickerwork (HQ H263914). The Section 301 duty still "
        "applies to the value.",
        "citations": [
            {"label": "CBP ruling HQ H263914 (wickerwork vs. water hyacinth baskets)", "url": ruling("H263914")},
            {"label": "HTSUS Chapter 46", "url": CH46},
        ],
    },
    {
        "id": "exception-lists",
        "title": "Source rattan goods from a country whose exception list covers them",
        "saves": "The whole 10%–12.5% Section 301 duty",
        "appliesTo": "Rattan mats, plaits and webbing, woven willow mats and rattan baskets and articles (4601.22, 4601.29.40, "
        "4601.93, 4602.12) from Indonesia, Cambodia, Malaysia, Taiwan, Bangladesh, Argentina, Ecuador, Jordan, Guatemala, El "
        "Salvador or Switzerland",
        "document": "Proof of origin for the country claimed (commercial invoice, certificate of origin, production records) "
        "and the country's exemption heading (for example 9903.06.16 for Indonesia) on the entry line.",
        "caveat": "Origin follows where the basket is made; CBP found baskets woven in Vietnam from Vietnamese seagrass and "
        "water hyacinth to be of Vietnamese origin (NY N354847). Transshipment does not change origin. China is on no "
        "exception list.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)", "url": CH99},
            {"label": "19 CFR 134.1 (country of origin)", "url": "https://www.ecfr.gov/current/title-19/section-134.1"},
            {"label": "CBP ruling NY N354847 (origin of seagrass and water hyacinth baskets)", "url": ruling("N354847")},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on baskets made in Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 18%)",
        "appliesTo": "All 49 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format. Heading 4601 goods must "
        "change from any other chapter and heading 4602 goods from any other heading (General Note 11), so baskets woven in "
        "Mexico from imported plaiting materials qualify.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on 4602.19.80 (U.S. note 51(a)). The USMCA was not "
        "renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (Chapter 46 rule)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim AGOA or an FTA rate where the base rate is the cost",
        "saves": "The base rate: up to 18% on handbags, 10% on bamboo baskets, 4.5%–6.6% on most others",
        "appliesTo": "The 36 dutiable lines, for goods of AGOA countries such as Madagascar (through December 31, 2026), "
        "CAFTA-DR, Australia, Chile, Colombia, Peru, Panama, Korea, Israel, Jordan, Morocco, Bahrain, Oman, Singapore and CBERA "
        "countries",
        "document": "Proof of origin under the program and the SPI on the entry line (D for AGOA, P, AU, CL, CO, … , E for "
        "CBERA).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)); Madagascar is not one of the 60 "
        "economies, so its AGOA goods pay nothing. GSP (A, A*, A+) has been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Note 16 (AGOA)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the line decides the rate: wickerwork (Free) vs. other baskets; plaited bags (4602) vs. "
        "handbags of chapter 42; plastic strip over 5 mm (4602.90, 3.5%) vs. textile strip (chapters 54 and 63); rope-coiled "
        "baskets (6307); rattan furniture (chapter 94)",
        "appliesTo": "Any line where classification is in doubt — especially composite baskets with metal frames or textile "
        "liners",
        "document": "A ruling request to CBP describing the product, its materials and construction (19 CFR part 177). "
        "Published rulings such as N336147 (water hyacinth basket), H284742 (raffia handbags), N307583 (loofah sponge), "
        "N355878 (polypropylene strip bag) and H342184 (rope baskets) show how CBP decides.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
            {"label": "CBP ruling NY N355878 (strip width and Chapter 46)", "url": ruling("N355878")},
            {"label": "CBP ruling HQ H284742 (raffia handbags, 4602.19.25)", "url": ruling("H284742")},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported goods re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods "
        "(for example gift baskets assembled for export)",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": "https://www.ecfr.gov/current/title-19/part-190"}],
    },
]
te["rules"] = [
    {
        "id": "lacey", "agency": "USDA APHIS",
        "title": "Lacey Act plant declaration (genus, species, country of harvest, quantity, value) for 4601.21–4601.94, 4602.11, 4602.12 and 4602.19.05, .12, .35, .45, .60 and .80 — Phase VII, from December 1, 2024",
        "citations": [
            {"label": "16 U.S.C. 3372(f)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm"},
            {"label": "89 FR 47122 (Phase VII)", "url": "https://www.federalregister.gov/documents/2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions"},
            {"label": "APHIS Lacey Act page", "url": "https://www.aphis.usda.gov/plant-imports/lacey-act"},
        ],
    },
    {
        "id": "aphis-handicraft", "agency": "USDA APHIS",
        "title": "Baskets and other wooden handicrafts (wood, twigs, vines, bamboo) are regulated articles inspected at the port of first arrival; from China, pieces over 1 cm in diameter must be treated and every package tagged with the manufacturer's identity",
        "citations": [
            {"label": "7 CFR 319.40-1 (wooden handicraft)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-1"},
            {"label": "7 CFR 319.40-5(o) (wooden handicrafts from China)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-5"},
            {"label": "7 CFR 319.40-9 (inspection)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-9"},
        ],
    },
    {
        "id": "aphis-corn", "agency": "USDA APHIS",
        "title": "Articles of corn stalks, leaves or husks enter only if processed so that the inspector finds no pest risk (corn and broomcorn quarantine)",
        "citations": [
            {"label": "7 CFR 319.41", "url": "https://www.ecfr.gov/current/title-7/section-319.41"},
            {"label": "7 CFR 319.41-1", "url": "https://www.ecfr.gov/current/title-7/section-319.41-1"},
        ],
    },
    {
        "id": "aphis-straw", "agency": "USDA APHIS",
        "title": "Rice straw and rice hulls are restricted from all foreign locations; APHIS may allow them only under a controlled import permit",
        "citations": [{"label": "7 CFR 319.55", "url": "https://www.ecfr.gov/current/title-7/section-319.55"}],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on each article (or its container when the article cannot be marked), in English",
        "citations": [
            {"label": "19 CFR part 134", "url": "https://www.ecfr.gov/current/title-19/part-134"},
            {"label": "19 CFR 134.11", "url": "https://www.ecfr.gov/current/title-19/section-134.11"},
        ],
    },
    {
        "id": "aphis-packaging", "agency": "USDA APHIS",
        "title": "Wood pallets and crates must be ISPM 15 treated and marked; rice straw, bamboo leaves and other plant leaves used as packing are restricted",
        "citations": [
            {"label": "7 CFR 319.40-3(b)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-3"},
            {"label": "7 CFR 319.69", "url": "https://www.ecfr.gov/current/title-7/section-319.69"},
        ],
    },
]
GROUP_NOTES = {
    "4601": "Every vegetable-material mat and plait line (4601.21–4601.94) needs a Lacey Act declaration. Bamboo, willow and wood mats are wooden handicrafts that APHIS inspects; from China they must be treated and tagged.",
    "4602": "Bamboo and rattan baskets, willow baskets and most other vegetable-material articles need a Lacey Act declaration; baskets and bags of palm leaf and other materials (4602.19.14–.18), handbags and luggage (4602.19.22–.29), 4601.99 and plastic-strip articles (4602.90) do not. Baskets of wood, twigs, vines or bamboo from China must be treated and tagged.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    if h == "4601":
        g["ruleIds"] = ["lacey", "aphis-handicraft", "aphis-corn", "aphis-straw", "cbp-marking", "aphis-packaging"]
    else:
        g["ruleIds"] = ["lacey", "aphis-handicraft", "aphis-corn", "aphis-straw", "cbp-marking", "aphis-packaging"]

LACEY = ("4601.21", "4601.22", "4601.29", "4601.92", "4601.93", "4601.94", "4602.11", "4602.12",
         "4602.19.05", "4602.19.12", "4602.19.35", "4602.19.45", "4602.19.60", "4602.19.80")
HANDICRAFT = ("4601.21", "4601.29.40", "4601.92", "4601.94.20", "4602.11", "4602.19.12", "4602.19.22",
              "4602.19.35", "4602.19.45", "4602.19.60", "4602.19.80")
OTHER_VEG = ("4601.29.60", "4601.29.80", "4601.29.90", "4601.94.05", "4601.94.40", "4602.19.05", "4602.19.14",
             "4602.19.16", "4602.19.17", "4602.19.18", "4602.19.23", "4602.19.25", "4602.19.29", "4602.19.60", "4602.19.80")
RATTAN_LINES = ("4601.22", "4601.29.40", "4601.93", "4602.12")
WICKER = ("4602.11.07", "4602.11.35", "4602.12.14", "4602.12.35", "4602.19.14", "4602.19.17", "4602.19.35", "4602.19.60")
NON_WICKER = ("4602.11.09", "4602.11.45", "4602.12.16", "4602.12.45", "4602.19.16", "4602.19.18", "4602.19.45", "4602.19.80")
gen_by_hts = {r["hts"]: r for r in d["overview"]["rateTable"]["rows"]}
for ln in te["lines"]:
    hts = ln["hts"]
    ids = []
    if hts.startswith(LACEY):
        ids.append("lacey")
    if hts.startswith(HANDICRAFT):
        ids.append("aphis-handicraft")
    if hts.startswith(OTHER_VEG):
        ids += ["aphis-corn", "aphis-straw"]
    ids += ["cbp-marking", "aphis-packaging"]
    ln["ruleIds"] = ids
    levers = ["wickerwork"] if hts.startswith(NON_WICKER) else []
    if hts.startswith(RATTAN_LINES):
        levers.append("exception-lists")
    levers.append("usmca")
    row = gen_by_hts.get(hts) or {}
    gen_rate = row.get("effectiveGeneral") or row.get("general")
    if gen_rate and gen_rate != "Free":
        levers.append("fta")
    levers += ["ruling", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. APHIS treatment and permit "
    "requirements and Lacey Act scope change; check them before each shipment."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 46 FAQ: Basketware, Wickerwork, Rattan & Seagrass Basket Import Duties"
fc["seo"]["title"] = "HTS Chapter 46 FAQ 2026: HS Codes for Wicker, Rattan, Seagrass & Bamboo Baskets, Loofah | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about Chapter 46 imports: HS codes 4601 and 4602, wicker, woven, rattan, bamboo, seagrass "
    "and water hyacinth baskets, raffia bags, loofah and rattan furniture, and the 2026 tariffs from China, Vietnam and Mexico."
)
fc["seo"]["keywords"] = [
    "hs code 4602",
    "hs code 4601",
    "hs code for wicker basket",
    "hs code for woven basket",
    "hs code for rattan basket",
    "hs code for seagrass basket",
    "hs code for loofah",
    "hs code for rattan furniture",
    "basketware and wickerwork",
    "china section 301 basketware duties",
    "vietnam wickerwork import duty rates",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing baskets, wickerwork, mats and other plaited goods into the "
    "U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 46 base rates run from Free (wickerwork, floor coverings) to 18% (palm-leaf handbags); most baskets pay 4.5%–10%. None changed since January 2025.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff on every Chapter 46 line — 12.5% from Vietnam, the Philippines and Thailand — but rattan goods from Indonesia, Cambodia and nine other countries are exempt.",
    "China pays 37.5% extra (25% List 3 + 12.5%) on all 49 lines; Canada pays 50% under Section 338 on 4602.19.80, even with a USMCA claim.",
    "USMCA-qualifying baskets from Mexico and AGOA goods from Madagascar enter free. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Most vegetable-material lines need a Lacey Act plant declaration, and baskets of wood, twigs, vines or bamboo from China must be treated and tagged before shipment.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 12, 2026, plus search terms the live chapter pages already rank for"
fc["faqs"] = [
    {
        "id": "what-is-ch46",
        "question": "What is basketware and wickerwork (HTS Chapter 46)?",
        "searchedAs": ["hts chapter 46", "basketware and wickerwork", "basketware meaning", "wickerwork meaning", "plaiting materials meaning", "articles of plaiting materials", "esparto meaning"],
        "answer": "Chapter 46 covers goods made from plaiting materials — straw, osier or willow, bamboo, rattan, rushes, reeds, seagrass, raffia, strips of wood or paper and plastic strip. Heading 4601 is plaits, mats, matting and screens; heading 4602 is baskets, wickerwork, bags and other articles made directly to shape, plus articles of loofah. Furniture (chapter 94), hats (chapter 65), footwear, rope (5607) and wall coverings are excluded.",
        "link": "",
    },
    {
        "id": "hs-4602",
        "question": "What does HS code 4602 cover?",
        "searchedAs": ["hs code 4602", "hs code 4602.19", "hs code 46029000", "hs code 4602.12", "hs code 4602.11", "hts 4602", "4602.19 tariff code"],
        "answer": "Basketwork, wickerwork and other articles made directly to shape from plaiting materials, and articles of loofah: 4602.11 of bamboo, 4602.12 of rattan, 4602.19 of other vegetable materials (willow, palm leaf, seagrass, water hyacinth, straw) and 4602.90 of non-vegetable materials such as plastic or paper strip (3.5%). Wickerwork lines are Free; other baskets pay 4.5%–10% and handbags up to 18%. 4602 was 97% of Chapter 46 imports in 2025 ($594M).",
        "link": "",
    },
    {
        "id": "hs-4601",
        "question": "What does HS code 4601 cover?",
        "searchedAs": ["hs code 4601", "hs code 4601.29", "hs code for bamboo mat", "hs code for rattan mat"],
        "answer": "Plaits and similar products of plaiting materials in strips, and mats, matting and screens: 4601.21 of bamboo, 4601.22 of rattan, 4601.29 of other vegetable materials, and 4601.92–4601.99 for other plaited products. Floor coverings are Free, woven mats 3.3%–4.8% and other mats 8% — CBP put bamboo placemats in 4601.21.90 at 8% (NY N236787).",
        "link": "",
    },
    {
        "id": "hs-baskets",
        "question": "What is the HS code for wicker, woven or storage baskets?",
        "searchedAs": ["hs code for wicker basket", "hs code for woven basket", "hs code for storage basket", "hs code for laundry basket", "wicker basket tariff code", "woven basket tariff code", "hs code for baskets", "hs code for straw basket", "hs code for picnic basket"],
        "answer": "It depends on the material: bamboo baskets 4602.11, rattan 4602.12, willow 4602.19.12, other vegetable materials such as seagrass, water hyacinth or straw 4602.19.17/.18, and plastic or paper strip 4602.90. Wickerwork of rods or twigs is Free; other baskets pay 4.5%–10% plus the country's extra duty. Baskets that are not plaited are elsewhere: rope-coiled textile baskets 6307.90 (HQ H342184) and iron wire baskets 7323.99 (NY N344719).",
        "link": "",
    },
    {
        "id": "wickerwork",
        "question": "What counts as wickerwork, and why does it matter?",
        "searchedAs": ["wickerwork", "wickerwork material", "wickerwork willow", "wickerwork basket"],
        "answer": "CBP treats wickerwork as articles of interlaced rods or twigs with a round cross section, such as willow or vine. Wickerwork baskets are Free at the general rate, while other baskets of the same material pay 4.5%–10%. Baskets of flat strips, split slats, seagrass or water hyacinth stems that flatten when woven are not wickerwork (HQ H263914). The Section 301 duty applies either way.",
        "link": "tariff-engineering",
    },
    {
        "id": "seagrass",
        "question": "What is the HS code for seagrass and water hyacinth baskets?",
        "searchedAs": ["hs code for seagrass basket", "seagrass h.s.code", "seagrass basket", "water hyacinth basket"],
        "answer": "Seagrass and water hyacinth baskets are 4602.19.18, 4.5% (NY N300305, N336147; HQ H263914). From Vietnam they pay 17% in total, from the Philippines or Thailand 17%, from India or Indonesia 14.5% and from China 42%. Composite baskets with a metal frame stay in 4602 when the plaiting material gives the essential character.",
        "link": "industry-areas",
    },
    {
        "id": "rattan",
        "question": "What is the HS code and tariff for rattan baskets?",
        "searchedAs": ["hs code for rattan basket", "hs code for rattan", "rattan basket", "hs code for rattan bag", "hs code for rattan tray"],
        "answer": "Rattan baskets and bags are 4602.12: wickerwork Free, other baskets 5%, handbags 9% or 18%, other articles 6.6%. From Indonesia, Cambodia, Malaysia, Taiwan and seven other countries rattan goods pay only the base rate (note 52(j) exception lists); from Vietnam the base rate plus 12.5%; from China plus 37.5% — 42.5% on a 5% basket.",
        "link": "industry-areas",
    },
    {
        "id": "bamboo",
        "question": "What is the HS code for bamboo baskets and bamboo products?",
        "searchedAs": ["hs code for bamboo basket", "bamboo hs code", "hs code for bamboo products", "hs code for bamboo mat"],
        "answer": "Bamboo baskets and bags are 4602.11 (wickerwork Free, others 10%), bamboo luggage and handbags 4602.11.21 (6.2%), and bamboo mats 4601.21. Raw bamboo poles are 1401.10 and bamboo furniture chapter 94. From China, a 10% bamboo basket pays 47.5% in total; bamboo baskets from China must also be treated and tagged under APHIS's wooden handicraft rule.",
        "link": "tariff-engineering",
    },
    {
        "id": "rattan-furniture",
        "question": "What is the HS code for rattan or wicker furniture?",
        "searchedAs": ["hs code for rattan furniture", "rattan furniture hs code", "hs code wicker furniture", "rattan chair hs code", "cane furniture hs code"],
        "answer": "Not Chapter 46 — note 2(e) sends furniture to chapter 94: rattan seats 9401.53, bamboo seats 9401.52, rattan furniture 9403.83, bamboo furniture 9403.82 and furniture of cane or osier 9403.89.30. All are Free at the general rate, so the cost is the country's extra duty.",
        "link": "",
    },
    {
        "id": "loofah",
        "question": "What is the HS code for loofah sponges?",
        "searchedAs": ["hs code for loofah", "hs code for loofah sponge", "hs code for bath loofah", "hs code for natural loofah", "loofah sponges customs duty"],
        "answer": "Heading 4602 names articles of loofah. CBP classified a natural loofah sponge in 4602.19.80, 2.3% (NY N307583). From Canada that line pays the 50% Section 338 duty even with USMCA; from Vietnam or the Philippines 14.8%; from China 39.8%.",
        "link": "",
    },
    {
        "id": "bags",
        "question": "How are straw, raffia and woven plastic bags classified?",
        "searchedAs": ["hs code for rattan bag", "hs code for woven bag", "hs code for straw basket", "hs code for pp woven bags"],
        "answer": "Raffia handbags are palm-leaf handbags in 4602.19.25, 18% (HQ H284742). Bags woven to shape from plastic strip over 5 mm wide are 4602.90, 3.5% (NY N363965); strip 5 mm or narrower is a textile, and a bag of it went to 6305.33 (NY N355878). Handbags with an outer surface of textile or plastic sheeting are chapter 42.",
        "link": "tariff-engineering",
    },
    {
        "id": "china",
        "question": "What tariffs apply to baskets and wickerwork from China?",
        "searchedAs": ["china section 301 basketware duties", "china tariff on basketware and wickerwork"],
        "answer": "Every Chapter 46 line is on China Section 301 List 3 (+25%, 9903.88.03), and the 2026 Section 301 action adds +12.5% (9903.05.31): 37.5% on wickerwork, 42% on seagrass baskets, 42.5% on rattan baskets, 47.5% on bamboo baskets. No exclusion now in effect covers a Chapter 46 product. The IEEPA duties ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "vietnam-asean",
        "question": "What tariffs apply to baskets from Vietnam, the Philippines and Indonesia?",
        "searchedAs": ["vietnam wickerwork import duty rates", "vietnam tariff on basketware and wickerwork", "baskets from philippines"],
        "answer": "Since July 24, 2026: Vietnam and the Philippines pay the base rate plus 12.5% on every line (17% on a 4.5% seagrass basket); Indonesia pays plus 10%, except that its rattan goods (4601.22, 4601.29.40, 4601.93, 4602.12) pay only the base rate. Their 2025 IEEPA rates (20% Vietnam, 19% the Philippines and Indonesia) ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "usmca",
        "question": "Do baskets from Mexico and Canada pay tariffs?",
        "searchedAs": ["usmca basketware tariff exemption", "usmca plaiting materials customs duty"],
        "answer": "Not if they qualify for USMCA: heading 4602 goods must change from any other heading, so baskets woven in Mexico or Canada qualify even from imported plaiting materials. Qualifying goods pay no base rate and no Section 301 duty. The exception is Canadian 4602.19.80, which pays the 50% Section 338 duty even with USMCA. Without a claim, both countries pay the base rate plus 10%.",
        "link": "tariff-engineering",
    },
    {
        "id": "us-imports",
        "question": "How many baskets does the U.S. import, and from where?",
        "searchedAs": ["wicker basket importers", "basketware wholesale"],
        "answer": "$614M of Chapter 46 goods in 2025, down 5.7% from $651M in 2024. Vietnam supplied 25% ($154M), China 21% ($131M, down 22%), India 20% ($120M), Mexico 9%, and the Philippines and Indonesia about 5.5% each. Baskets of other vegetable materials (4602.19) were $273M and plastic-strip articles (4602.90) $217M.",
        "link": "understand-industry",
    },
]

# Canonical Federal Register URL for Proclamation 11046 (the generator's slug variant ends "-united-states").
P11046 = "https://www.federalregister.gov/documents/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united"
for page in (tu, ia):
    for s_ in page["sources"]:
        if s_["id"] == "procl-11046":
            s_["url"] = P11046

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
