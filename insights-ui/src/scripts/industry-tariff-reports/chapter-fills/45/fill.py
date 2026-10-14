"""Fill the writer parts of the generated Chapter 45 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 45 ...` (see run.sh in this folder):
    python3 fill.py
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FILLS, IU, OUT, use_measures_fr_urls  # noqa: E402,F401

import json

WT = IU
PATH = OUT  # the generated file, copied there by run.sh; filled in place
POOL = FILLS + "/45/pool.json"
CHECKED = "2026-10-12"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH45 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2045"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
RUL = "https://rulings.cbp.gov/ruling/"

d = json.load(open(PATH))
ref = json.load(open(POOL))

NEW_SOURCES = {
    "eo-14346": {
        "id": "eo-14346", "publisher": "Federal Register", "citation": "90 FR 43737", "document": "Executive Order 14346",
        "title": "Modifying the Scope of Reciprocal Tariffs and Establishing Procedures for Implementing Trade and Security Agreements",
        "signed": "2025-09-05", "published": "2025-09-10",
        "url": "https://www.federalregister.gov/documents/2025/09/10/2025-17507/modifying-the-scope-of-reciprocal-tariffs-and-establishing-procedures-for-implementing-trade-and",
    },
    "fr-2025-18660": {
        "id": "fr-2025-18660", "publisher": "Federal Register", "citation": "90 FR 46136", "document": "Notice (Commerce / USTR)",
        "title": "Implementing Certain Tariff-Related Elements of the U.S.-EU Framework on an Agreement on Reciprocal, Fair, and Balanced Trade",
        "signed": None, "published": "2025-09-25",
        "url": "https://www.federalregister.gov/documents/2025/09/25/2025-18660/implementing-certain-tariff-related-elements-of-the-us-eu-framework-on-an-agreement-on-reciprocal",
    },
    "fr-2024-11901": {
        "id": "fr-2024-11901", "publisher": "Federal Register", "citation": "89 FR 47122", "document": "Notice (APHIS)",
        "title": "Implementation of Revised Lacey Act Provisions (Phase VII of the declaration enforcement schedule)",
        "signed": None, "published": "2024-05-31",
        "url": "https://www.federalregister.gov/documents/2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions",
    },
    "aphis-lacey": {
        "id": "aphis-lacey", "publisher": "USDA APHIS", "citation": "APHIS Lacey Act web page", "document": "Web page",
        "title": "Lacey Act: on December 1, 2024, APHIS began implementing Phase VII of the declaration requirement",
        "signed": None, "published": "2024-12-01", "url": "https://www.aphis.usda.gov/plant-imports/lacey-act",
    },
}


def src(sid):
    return NEW_SOURCES.get(sid) or ref[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


LABELS = {
    "4501": ("Natural cork, raw or simply prepared; waste cork; crushed or granulated cork", "Raw & granulated cork"),
    "4502": ("Natural cork, debacked or squared; blocks, plates, sheets and stopper blanks", "Cork blocks & blanks"),
    "4503": ("Articles of natural cork: corks and stoppers, disks, wallcoverings, other", "Natural cork articles"),
    "4504": ("Agglomerated cork and articles: sheets, flooring, insulation, stoppers, boards", "Agglomerated cork"),
}

EU_LIST = (
    "Every Chapter 45 line is on the EU exception list in U.S. note 52(j)(2) (9903.05.97), so goods of an EU member state pay "
    "no Section 301 duty under 9903.05.38 or 9903.05.39 — only the base rate."
)
EXC_COUNTRIES = "Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan"
ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge, which reached every Chapter 45 line, expired July 23, 2026."

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 45: Cork and Articles of Cork — 2026 Tariff Rates for Wine Corks, Agglomerated Cork & Cork Flooring"
ov["seo"]["title"] = "HTS Chapter 45 Tariff Rates 2026: Cork Stoppers, Agglomerated Cork & Cork Flooring Import Duties | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 19 HTS Chapter 45 lines: natural cork, wine corks and stoppers, agglomerated cork sheets, "
    "cork flooring and boards. 18 lines are Free; EU cork pays no 2026 Section 301 duty, China pays 37.5% extra."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 45",
    "cork and articles of cork tariff",
    "cork and articles of cork import duty rates",
    "natural cork stoppers HTS 4503",
    "agglomerated cork tariffs HTS 4504",
    "portugal cork import duty",
    "china tariff on cork and articles of cork",
    "cork tariff code",
    "hs code for cork stopper",
]
ov["intro"] = (
    "Chapter 45 covers **natural cork** — raw cork bark, waste, granulated cork and cork blocks or stopper blanks (headings "
    "4501–4502) — **articles of natural cork** such as wine corks and other stoppers (4503), and **agglomerated cork**: "
    "sheets, flooring, underlayment, insulation, technical stoppers, boards and coasters (4504). Its **19 tariff lines** are "
    "all Free at the general rate except one: other articles of natural cork (4503.90.60), such as natural-cork-faced flooring "
    "and cork laminated to fabric, at 14%.\n\n"
    "The extra duty by country decides the cost. U.S. imports were **$276.7M in 2025**, **89% from the EU** — Portugal alone "
    "71%, Spain 11% — and every Chapter 45 line is on the **EU exception list** of the 2026 Section 301 action (U.S. note "
    "52(j)(2)), so EU cork pays only the base rate; eleven other countries, including Taiwan and Switzerland, have the same "
    "exemption. **China pays 37.5%** extra (25% under List 3 plus 12.5%), the UK and India 10%, Vietnam and Morocco 12.5%, and "
    "USMCA-qualifying goods from Mexico and Canada nothing. The 2025 IEEPA tariffs ended on February 24, 2026, and the 10% "
    "Section 122 surcharge that replaced them expired on July 23, 2026."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "4501": (
        "Natural cork as stripped from the cork oak (raw or simply prepared), waste cork, and crushed, granulated or ground cork "
        "— the raw material for agglomerated cork. All Free. Raw cork bark is a regulated article for USDA APHIS, and the "
        "heading needs a Lacey Act declaration.",
        ["raw cork bark", "natural cork", "cork planks", "waste cork", "cork granules", "granulated cork", "ground cork"],
    ),
    "4502": (
        "Natural cork that has been debacked or roughly squared, or cut into rectangular blocks, plates, sheets or strip, "
        "including sharp-edged blanks for corks or stoppers. Free.",
        ["cork blocks", "cork stopper blanks", "natural cork sheet", "cork strip", "debacked cork"],
    ),
    "4503": (
        "Articles of natural cork: tapered stoppers (4503.10.20–.40), cylindrical stoppers such as most wine corks "
        "(4503.10.60), disks, wafers and washers, paper-backed wallcoverings — all Free — and the 14% basket line 4503.90.60 "
        "for other natural cork articles. Stoppers are 55% of the chapter's imports.",
        ["wine corks", "natural cork stoppers", "bottle stoppers", "tapered corks", "cork disks", "cork wallcovering", "cork fabric"],
    ),
    "4504": (
        "Agglomerated cork (granules bonded with or without a binder) in blocks, sheets, rolls and tiles — vulcanized cork-rubber "
        "sheets, compressed cork insulation, floor coverings and underlayment, wallcoverings — agglomerated and technical "
        "stoppers, and other articles such as bulletin boards, coasters and placemats. All Free.",
        ["agglomerated cork sheet", "cork flooring", "cork underlayment", "cork board", "cork roll", "agglomerated cork stoppers", "cork coasters", "cork placemat"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "A container of natural wine corks from Portugal",
        "line": "4503.10.60.00",
        "body": "Cylindrical natural cork stoppers are 4503.10.60 (CBP ruling NY 812848), Free at the general rate. Portugal is an "
        "EU member state and the line is on the EU exception list (U.S. note 52(j)(2), 9903.05.97), so the 2026 Section 301 "
        "duty does not apply: a $50,000 shipment pays **$0** duty. Heading 4503 is in Phase VII of the Lacey Act, so the entry "
        "needs a plant declaration naming the species (cork oak, *Quercus suber*) and the country of harvest.",
    },
    {
        "title": "Agglomerated cork underlayment: China vs Spain",
        "line": "4504.10.20.00",
        "body": "CBP classifies agglomerated cork underlayment rolls in 4504.10.20 (ruling N275725), Free at the general rate. From "
        "China, List 3 Section 301 (+25%, 9903.88.03) and the 2026 action (+12.5%, 9903.05.31) stack: **$3,750** on a $10,000 "
        "shipment. The same rolls from Spain pay **$0** — the line is on the EU exception list.",
    },
    {
        "title": "Natural-cork-faced flooring planks",
        "line": "4503.90.60.00",
        "body": "In HQ H297792 CBP held that a plank with a thin natural cork veneer over agglomerated cork and fiberboard takes its "
        "essential character from the natural cork face: 4503.90.60, **14%**, not the Free floor-covering line 4504.10.30. "
        "From Portugal that is $1,400 on $10,000 (no Section 301 duty); from China $5,150 (14% + 25% + 12.5%). The same plank "
        "with an agglomerated-cork face is Free.",
    },
    {
        "title": "Cork stoppers finished in Mexico, with a USMCA claim",
        "line": "4503.10.60.00",
        "body": "Stoppers are Free at the general rate, but non-USMCA goods of Mexico pay a 10% Section 301 duty (9903.05.55). The "
        "USMCA rule for 4503.10 is met by a change from any other subheading (General Note 11), so stoppers made in Mexico "
        "from imported cork blanks (4502) qualify: with a certification of origin a $20,000 shipment pays **$0** (9903.05.94) "
        "instead of $2,000.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in d["understandIndustry"]["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "4503.10", "label": "Corks and stoppers of natural cork"},
    {"hts": "4504.10", "label": "Agglomerated cork blocks, sheets, tiles, flooring and stoppers"},
    {"hts": "4504.90", "label": "Other articles of agglomerated cork"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line each country ships. \"Other Asia, nes\" is Comtrade's label for Taiwan."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover: (a) footwear or parts of footwear of chapter 64; (b) headgear or parts of "
    "headgear of chapter 65; or (c) articles of chapter 95 (for example, toys, games, sports equipment)."
)
ov["notes"]["additionalUsNotes"] = (
    "**Additional U.S. Note 1.** For the purposes of subheading 4504.10.20, the term \"compressed cork\" means forms molded "
    "under heat and compression from cork particles without the addition of other materials."
)

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 45 Tariff Updates: Cork Stoppers, Agglomerated Cork & Cork Flooring (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 45 Tariff Updates 2026: Cork — EU Exemption, China Section 301, Section 122 & IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 45 cork imports since January 2025: unchanged base rates, the EU cork exemption, the end of "
    "the IEEPA tariffs and the 10% Section 122 surcharge, the 2026 Section 301 tariffs and China's 37.5%."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 45 tariff updates",
    "cork and articles of cork tariff",
    "section 301 tariffs cork",
    "china tariff on cork and articles of cork",
    "cork tariff exemption us",
    "section 122 tariff cork",
    "portugal cork import duty",
    "spain cork duty exemption",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 19 Chapter 45 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. In 2025 the IEEPA tariffs reached cork from most countries — EU cork paid 10%, "
    "then 15% from August 7, until the **U.S.-EU framework restored base-rate-only treatment for EU cork from September 1, "
    "2025**. All IEEPA duties **ended on February 24, 2026**, and a **10% Section 122 surcharge** applied to cork from every "
    "country, the EU included, until July 23, 2026. Since **July 24, 2026** a Section 301 tariff of 10% or 12.5% applies to "
    "60 economies, but every Chapter 45 line is on the exception lists of the EU and 11 other countries. China keeps its 25% "
    "List 3 duty on top, for 37.5% in total."
)
tu["scope"] = (
    "Measures that reach Chapter 45 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 List 3, the Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and "
    "Section 122 duties that have ended; plus the Lacey Act declaration that covers headings 4501 and 4503. No Chapter 45 line "
    "is on the Canada Section 338 lists, and no Section 232 action covers a Chapter 45 line. For the rate each supplier pays, "
    "see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "19 of 19 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China)"},
    {"label": "EU cork", "value": "Base rate only", "note": "U.S. note 52(j)(2) exception list"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "cn": (
        "Two Section 301 duties stack. List 3 (+25%, 9903.88.03; 10% from September 24, 2018, 25% since May 10, 2019) covers all "
        "19 Chapter 45 lines, and no China exclusion names a cork product. The 2026 action adds +12.5% (9903.05.31); Chapter 45 "
        "is not on the general exemption list (note 52(b)). USTR confirmed on October 7, 2026 that the 2018 actions continue. "
        "The IEEPA fentanyl duty (10% since November 10, 2025) and the 10% reciprocal duty on China ended February 24, 2026.",
        "Chinese agglomerated cork sheets, flooring, boards and stoppers pay 37.5%; other natural cork articles (4503.90.60) pay "
        "51.5% (14% + 37.5%).",
    ),
    "vn": (
        "No Vietnam exception-list entry covers a Chapter 45 line. The 20% IEEPA reciprocal duty (9903.02.69, from August 7, 2025) "
        "ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026.",
        "Vietnamese agglomerated cork goods pay 12.5% of value; 4503.90.60 goods pay 26.5%.",
    ),
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). The Chapter 45 USMCA rules accept a "
        "change from another heading (4501–4502, 4503.90, 4504) or from another subheading (4503.10 stoppers). The 25% IEEPA "
        "duty on Mexico (9903.01.01) ended February 24, 2026.",
        "Mexican cork stoppers and agglomerated cork that qualify for USMCA pay $0; goods without a valid claim pay the base rate "
        "plus 10%.",
    ),
    "in": (
        "India's exception list does not cover Chapter 45. GSP (SPI A), printed on 4503.90.60, has been expired since December "
        "31, 2020. The IEEPA duties on India — 25% reciprocal plus 25% for Russian-oil purchases from August 2025 — ended February "
        "24, 2026.",
        "Indian cork blocks and agglomerated cork pay 10% of value; 4503.90.60 goods pay 24%.",
    ),
    "ca": (
        "USMCA-qualifying goods are exempt (9903.05.93). No Chapter 45 line is on the Canada Section 338 lists in U.S. note 51(b) "
        "(9903.03.12–9903.03.14), so the 50% Section 338 duty does not apply. Raw cork from Canada enters under the APHIS general "
        "permit. The 35% IEEPA duty on Canada ended February 24, 2026.",
        "Canadian granulated or agglomerated cork that qualifies for USMCA pays $0; without a claim it pays 10%.",
    ),
    "gb": (
        "The UK exception list (note 52(j)(1), 9903.05.96) does not cover Chapter 45. " + ENDED,
        "British cork goods pay 10% of value; 4503.90.60 goods pay 24%.",
    ),
    "ma": (
        "The Morocco FTA (SPI MA) makes 4503.90.60 Free, but U.S. note 52(a) keeps the 12.5% Section 301 duty on FTA goods. The "
        "10% IEEPA baseline duty ended February 24, 2026.",
        "Moroccan cork goods pay 12.5% of value on every line, with or without an FTA claim.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). No Chapter 45 line is on Brazil's exemption list (note 50(a)(ii)); only articles of agglomerated cork "
        "(4504.90) for civil aircraft can be exempt (9903.05.05, 9903.05.88). The IEEPA duties on Brazil ended February 24, 2026.",
        "Brazilian cork goods pay 37.5%; 4503.90.60 goods 51.5%.",
    ),
    "other": (
        "Every Chapter 45 line is on the exception lists of " + EXC_COUNTRIES + " in U.S. note 52(j), and of the EU (52(j)(2)), so "
        "those countries pay only the base rate. Japan and South Korea pay 12.5% in total when the base rate is lower (9903.05.49, "
        "9903.05.71). Articles of agglomerated cork (4504.90) for civil aircraft are exempt under 9903.05.88. Tunisia is not one "
        "of the 60 economies. " + ENDED,
        "Japanese or Korean cork pays 12.5% of value; Australian, Turkish or Thai cork pays the base rate plus 12.5%; Taiwanese, "
        "Swiss or Tunisian cork pays only the base rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "cn":
        e["before"] = "+25%"
        e["now"] = "+37.5%"
    if key == "other":
        e["country"] = "Other Section 301 economies (40, incl. Japan, South Korea, Australia, Thailand, Türkiye)"
        e["now"] = "+10% or +12.5% (12.5% in total for Japan and South Korea)"
    if key == "br":
        e["effectiveFrom"] = "2026-07-24"
    if key == "in" and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")
    if key in ("gb", "other", "vn") and "procl-11012" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "procl-11012")
    if key == "ca":
        for sid in ("procl-11048", "procl-11065"):
            e["sourceIds"].insert(-1, sid)

add_sources(tu, [
    "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193", "eo-14194", "eo-14195",
    "eo-14228", "eo-14257", "eo-14259", "eo-14266", "eo-14298", "eo-14325", "eo-14326", "eo-14329", "eo-14323", "eo-14346",
    "eo-14357", "fr-2025-18660", "cbp-gsp", "procl-11048", "procl-11065", "fr-2024-11901", "aphis-lacey",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 45 base-rate changes",
        "detail": "All 19 Chapter 45 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 "
        "Basic Edition; no line was added, split or renumbered. 18 lines are Free; 4503.90.60 is 14%.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 3 continues",
        "detail": "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
        "review. For Chapter 45 this keeps +25% (9903.88.03) on all 19 lines.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-338", "type": "reference", "date": "2026-08-22", "dateLabel": "Effective",
        "title": "Canada Section 338 duty does not reach Chapter 45",
        "detail": "Proclamation 11048 put a 50% duty (9903.03.12–9903.03.14) on Canadian goods in the provisions of U.S. note 51(b), "
        "charged even on USMCA goods. No Chapter 45 line is on those lists, before or after Proclamation 11065 revised them from "
        "September 15, 2026, so Canadian cork pays only the 10% Section 301 duty, and nothing with a USMCA claim.",
        "before": None, "now": None, "countries": "Canada", "sourceIds": ["procl-11048", "procl-11065", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies; EU cork exempt",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). Chapter 45 is not on the general exemption "
        "list (note 52(b)), but every Chapter 45 line is on the exception lists of the EU (note 52(j)(2), 9903.05.97) and of "
        + EXC_COUNTRIES + ". Without the list, EU goods would pay 10% in total (9903.05.39) on the Free lines. USMCA-qualifying "
        "goods are exempt (9903.05.93, 9903.05.94); FTA claims remove the base rate but not this duty (note 52(a)).",
        "before": "None", "now": "+10% / +12.5% (EU and 11 other countries exempt)", "countries": "60 economies", "sourceIds": S301,
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
        "detail": "25% on all goods of Brazil (9903.05.01), every Chapter 45 line included; only civil-aircraft articles of "
        "agglomerated cork (4504.90) can be exempt (9903.05.05). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
        "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "10% Section 122 surcharge on cork from every country",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 45 line was on the product "
        "exemption list (9903.03.03), and there was no EU exception, so Portuguese and Spanish cork paid 10% too; only "
        "civil-aircraft articles (4504.90, 9903.03.05) and USMCA-qualifying goods (9903.03.07, 9903.03.08) were exempt.",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
        "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
        "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
        "printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "cn-fentanyl-cut", "type": "extraDuty", "date": "2025-11-10", "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "Executive Order 14357 lowered the IEEPA duty on products of China from 20% to 10%, bringing Chinese "
        "cork to 45% in total (25% List 3 + 10% + 10% reciprocal). Ended February 24, 2026.",
        "before": "+20%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14357"],
    },
    {
        "id": "eu-cork-mfn", "type": "extraDuty", "date": "2025-09-01", "dateLabel": "Effective",
        "title": "EU cork back to the base rate under the U.S.-EU framework",
        "detail": "Implementing Executive Order 14346, Commerce and USTR exempted EU \"unavailable natural resources (including "
        "cork)\" from the EU reciprocal duty: all 19 Chapter 45 lines are listed in U.S. note 2(v)(xx) (9903.02.74), so EU cork "
        "paid only the base rate for goods entered from September 1, 2025. The notice was published September 25, 2025 with "
        "retroactive effect.",
        "before": "15% in total (9903.02.20)", "now": "Base rate only", "countries": "European Union",
        "sourceIds": ["fr-2025-18660", "eo-14346"],
    },
    {
        "id": "reciprocal-aug", "type": "extraDuty", "date": "2025-08-07", "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates take effect",
        "detail": "Executive Order 14326 set the reciprocal rates from August 7, 2025. For cork suppliers: EU goods 15% in total "
        "when the base rate is lower (9903.02.20), Vietnam 20%, Taiwan 20%, Tunisia 25% and India 25% (plus another 25% from "
        "August 27 under Executive Order 14329); the UK and Morocco stayed at 10%. All ended February 24, 2026.",
        "before": "+10%", "now": "+10% to +25% (ended)", "countries": "All except Canada, Mexico, China",
        "sourceIds": ["eo-14326", "eo-14329"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-08-01", "dateLabel": "Effective",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "cn-reciprocal-cut", "type": "extraDuty", "date": "2025-05-14", "dateLabel": "Effective",
        "title": "China reciprocal duty cut from 125% to 10%",
        "detail": "The reciprocal duty on China, raised to 34%, 84% and then 125% in April 2025, was cut to 10% from May 14, 2025 "
        "(Executive Order 14298). Chinese cork then paid 55% in total (25% List 3 + 20% fentanyl + 10%). Ended February 24, 2026.",
        "before": "+125%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14257", "eo-14259", "eo-14266", "eo-14298"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline from April 5, 2025 (9903.01.25) on every Chapter 45 line; the higher country rates (EU 20%, Vietnam "
        "46%, Tunisia 28%, Taiwan 32%) were paused on April 9 (Executive Order 14266). Canada and Mexico excluded. Ended "
        "February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257", "eo-14266"],
    },
    {
        "id": "cn-fentanyl", "type": "extraDuty", "date": "2025-03-04", "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "The IEEPA duty on all products of China, imposed at 10% from February 4, 2025, was raised to 20%. "
        "Ended February 24, 2026.",
        "before": "+10%", "now": "+20% (ended)", "countries": "China", "sourceIds": ["eo-14195", "eo-14228"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
        "February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% "
        "in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 45 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "lacey-phase-7", "type": "reference", "date": "2024-12-01", "dateLabel": "Effective",
        "title": "Lacey Act plant declaration for natural cork and natural cork articles",
        "detail": "APHIS Phase VII of the Lacey Act declaration schedule, which began December 1, 2024, covers heading 4501 (natural "
        "cork, waste and granulated cork) and heading 4503 (articles of natural cork, including wine corks). Importers must "
        "file the genus and species (cork oak, Quercus suber), country of harvest, quantity and value (PPQ Form 505 or the ACE "
        "Lacey Act message set).",
        "before": None, "now": None, "countries": "All", "sourceIds": ["fr-2024-11901", "aphis-lacey"],
    },
]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 45: Cork and Articles of Cork — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 45 Import Statistics: U.S. Cork Imports by Country — Portugal, Spain, China | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of cork and cork articles 2020–2025 by country, product and year: $276.7M in 2025, down 6.1%; Portugal "
    "supplied 71%, Spain 11% and China 6%. Wine corks and stoppers were 55%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 45 import statistics",
    "cork imports",
    "us cork imports by country",
    "portugal cork exports to us",
    "natural cork stoppers imports",
    "agglomerated cork imports",
    "where does cork come from",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    "U.S. imports of Chapter 45 goods fell for a fourth year, from **$294.8M in 2024 to $276.7M in 2025** (−6.1%), down from "
    "a peak of $320.0M in 2021. **Corks and stoppers of natural cork (4503.10) were $151.6M, 55%**, almost flat (−1.2%); "
    "agglomerated cork blocks, sheets, flooring and technical stoppers (4504.10) were $100.4M (−5.6%), and other agglomerated "
    "cork articles (4504.90) fell 30% to $15.5M. Raw and granulated cork and cork blocks (4501–4502) were only $8.1M.\n\n"
    "**Portugal supplied $197.3M (71%)** — $139.2M of it natural cork articles — down 8.7%. **Spain** ($30.0M, mostly "
    "agglomerated cork) was second, then **China** ($17.5M, −13%, almost all agglomerated cork). Italy (+27%) and France "
    "(+45%) grew. EU member states together supplied 89%; the U.S. government lists cork among the articles not produced "
    "domestically (48 CFR 25.104).\n\n"
    "In 2025 EU cork paid the IEEPA reciprocal duty from April 5 until the U.S.-EU framework restored base-rate-only treatment "
    "from September 1, while Chinese cork paid up to 55%. Those duties ended on February 24, 2026; the 10% Section 122 "
    "surcharge then applied to all origins until July 23, 2026. Since July 24, 2026 EU cork is exempt from the new Section 301 "
    "tariff and Chinese cork pays 37.5%. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. "
    "\"Other Asia, nes\" is Comtrade's label for Taiwan."
)

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 45 Tariff Rates by Country: Cork Stoppers, Agglomerated Cork & Cork Flooring"
ia["seo"]["title"] = "HTS Chapter 45 Import Duty Rates by Country: Portugal, Spain, China, Italy — Cork & Cork Stoppers | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on natural cork, wine corks, agglomerated cork and cork flooring by country: base rate plus the 2026 "
    "Section 301 duty, with the EU exception list, China List 3 and USMCA applied."
)
ia["seo"]["keywords"] = [
    "cork and articles of cork import duty rates",
    "portugal tariff on cork and articles of cork",
    "china tariff on cork and articles of cork",
    "agglomerated cork import duties",
    "natural cork stoppers customs duty",
    "spain cork duty exemption",
    "tariffs on cork",
]
ia["intro"] = (
    "The total rate on Chapter 45 goods depends on **where they come from** far more than on what they are: 18 of 19 lines are "
    "Free at the general rate. Each cell below is the base rate for that product group plus the extra duty for that country, "
    "minus any preference — computed from the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** (from July "
    "24, 2026) — and **Portugal, Spain, Italy, France and the rest of the EU are exempt** on every cork line, as are Taiwan, "
    "Switzerland and nine other countries. **China pays 37.5%** (25% List 3 + 12.5%), the UK and India 10%, Vietnam and Morocco "
    "12.5%, and USMCA-qualifying goods from Mexico and Canada nothing. Tunisia is not one of the 60 economies."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

EU_LABEL = (
    "EU: base rate only. Every Chapter 45 line is on the EU exception list (note 52(j)(2), 9903.05.97), so neither 9903.05.38 nor "
    "the 10%-in-total rule of 9903.05.39 applies. The IEEPA duties ended February 24, 2026 (EU cork had been base-rate-only since "
    "September 1, 2025); the 10% Section 122 surcharge applied February 24 – July 23, 2026."
)
RULE_LABELS = {
    "Portugal": EU_LABEL,
    "Spain": EU_LABEL,
    "Italy": EU_LABEL,
    "France": EU_LABEL,
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31) on all 19 lines: 37.5% on the Free lines, 51.5% on 4503.90.60. The IEEPA duties ended February 24, 2026.",
    "Taiwan": "Base rate only: every Chapter 45 line is on Taiwan's exception list (note 52(j)(10), 9903.06.14), which lifts 9903.05.75–9903.05.76. The 20% IEEPA duty ended February 24, 2026.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on all 19 lines. The 20% IEEPA duty ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on all 19 lines. GSP has expired; the IEEPA duties ended February 24, 2026.",
    "Canada": "USMCA-qualifying: Free, no extra duty (9903.05.93). Otherwise the base rate plus 10% (9903.05.29). No Chapter 45 line is on the Section 338 lists, so the 50% duty does not apply. The 35% IEEPA duty ended February 24, 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on all 19 lines; the UK exception list does not cover cork. The IEEPA duty ended February 24, 2026.",
    "Morocco": "The Morocco FTA (MA) makes 4503.90.60 Free, but 12.5% Section 301 (9903.05.56) still applies to every line, FTA goods included (note 52(a)).",
    "Tunisia": "Not one of the 60 Section 301 economies: base rate only. The 25% IEEPA duty ended February 24, 2026.",
    "Any other country": "From the base rate alone — countries outside the 60 Section 301 economies, and the 11 with Chapter 45 on their exception lists (Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Indonesia, Ecuador, Jordan and Taiwan) — to base rate plus 37.5% for Brazil (25% + 12.5%). Japan and South Korea pay 12.5% in total.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    if c["country"] in ("Portugal", "Spain", "Italy", "France"):
        c["rule"]["sourceIds"] = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "fr-2025-18660", "eo-14389", "procl-11012", "hts-now"]
    elif c["country"] in ("Taiwan", "Tunisia"):
        c["rule"]["sourceIds"] = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "eo-14389", "hts-now"]
    else:
        if "eo-14389" not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].insert(-1, "eo-14389")
    if c["country"] == "India":
        c["rule"]["sourceIds"].insert(-1, "cbp-gsp")
    if c["country"] == "Canada":
        c["rule"]["sourceIds"].insert(-1, "procl-11048")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU, Taiwan and the other exception-list countries: the exemption (U.S. note 52(j)) is applied to every Chapter 45 line.",
    "Not in the grid: the civil-aircraft exemption for articles of agglomerated cork (4504.90, 9903.05.88), which needs a "
    "certification of civil-aircraft use, and the entry rules — APHIS permits for raw cork and Lacey Act declarations for "
    "headings 4501 and 4503 (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) lists no "
    "Chapter 45 code. Note 52(j) lists all 19 Chapter 45 lines for the EU (52(j)(2), 9903.05.97), Switzerland, Malaysia, "
    "Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador and Jordan; the UK list (52(j)(1)) "
    "has none. Note 52(d) (9903.05.88) and note 50(a)(iv) (9903.05.05) list 4504.90.00 for civil aircraft only. Note 50(a)(ii) "
    "lists no Chapter 45 line for Brazil. Note 51(b) puts no Chapter 45 line on the Canada Section 338 lists. Note 20(f) puts "
    "all 19 lines on China List 3, and no China exclusion names a cork product. No Section 232 heading covers a Chapter 45 "
    "line, and Federal Register searches found no antidumping or countervailing duty order on Chapter 45 goods."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "fr-2025-18660", "cbp-gsp", "procl-11048"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Cork, Wine Corks & Cork Flooring (HTS Ch. 45): Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Cork & Cork Stoppers: USDA APHIS, Lacey Act & Ways to Lower Duty (HTS Chapter 45) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The USDA, CBP and FDA rules for HTS Chapter 45 — APHIS permits for raw cork bark, Lacey Act declarations for natural cork "
    "and wine corks, food-contact closures — and the legal ways to pay less: EU and other exception lists, USMCA, the "
    "natural vs agglomerated face, rulings and drawback."
)
te["seo"]["keywords"] = [
    "usda aphis cork import",
    "Lacey Act declaration cork stoppers",
    "natural cork bark import permit",
    "cork flooring hs code 4503.90 vs 4504.10",
    "spain cork duty exemption",
    "USMCA rules of origin cork stoppers",
    "cork stopper drawback",
]
te["intro"] = (
    "Most Chapter 45 goods enter on paperwork, not inspection holds — but **raw cork is a USDA-regulated article**: cork and "
    "cork bark that are unprocessed or only primarily processed need an APHIS import permit and an importer document, must be "
    "free from rot and are inspected at the port (Canadian cork enters under a general permit). **Natural cork and natural "
    "cork articles, wine corks included, need a Lacey Act plant declaration.**\n\n"
    "The ways to pay less are in the schedule: **buy from the EU** or another country whose Section 301 exception list covers "
    "cork; claim **USMCA** on stoppers and agglomerated cork made in Mexico or Canada; check the **face material** of flooring "
    "and laminated sheets, which decides between 14% and Free; get a **binding ruling**; and claim **drawback** on corks used "
    "in exported wine. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "exception-lists",
        "title": "Source from the EU or another country whose exception list covers cork",
        "saves": "The whole 10%–12.5% Section 301 duty — and, compared with China, 37.5% of value",
        "appliesTo": "All 19 lines, for goods of an EU member state (Portugal, Spain, Italy, France …), Switzerland, Taiwan, "
        "Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Indonesia, Ecuador or Jordan",
        "document": "Proof of origin for the country claimed (commercial invoice, certificate of origin, production records) and the "
        "exception heading on the entry line (9903.05.97 for the EU, or the country heading such as 9903.06.14 for Taiwan).",
        "caveat": "Origin follows where the cork was produced or substantially transformed; shipping Chinese cork through Europe "
        "does not change it. The exemption lifts the 2026 Section 301 duty only — it does not lift China List 3.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)", "url": CH99},
            {"label": "19 CFR 134.1 (country of origin)", "url": "https://www.ecfr.gov/current/title-19/section-134.1"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on stoppers and agglomerated cork made in Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada (and 14% base on 4503.90.60)",
        "appliesTo": "All 19 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format. The Chapter 45 rules (General "
        "Note 11) accept a change from another heading for 4501–4502, 4503.90 and 4504, and a change from another subheading "
        "for stoppers of 4503.10 — so stoppers cut in Mexico from imported cork blanks (4502) qualify.",
        "caveat": "Cork that is only repacked or trimmed without changing heading or subheading does not qualify. The USMCA was not "
        "renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (Chapter 45 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "face-ply",
        "title": "Check the face material: natural cork (14%) vs agglomerated cork (Free)",
        "saves": "14% of value on flooring, panels and laminated sheets that would otherwise fall in 4503.90.60 (51.5% from China)",
        "appliesTo": "Multi-layer cork flooring and wall panels, cork laminated to fabric or film, and other cork articles not "
        "provided for elsewhere",
        "document": "Product specifications or a lab report showing the material and thickness of each layer. CBP classifies a "
        "composite by the layer that gives its essential character — for flooring, the face ply: a natural cork veneer puts the "
        "plank in 4503.90.60 at 14% (HQ H297792); an agglomerated cork face puts it in 4504.10.30, Free (NY J82489, N031332).",
        "caveat": "The product must really be what it is declared as; CBP may test samples. Backed natural cork sheet sold as "
        "fabric is 4503.90.60 (N289697).",
        "citations": [
            {"label": "CBP ruling HQ H297792 (natural-cork-faced flooring)", "url": RUL + "H297792"},
            {"label": "CBP ruling N289697 (backed cork sheet)", "url": RUL + "N289697"},
            {"label": "HTSUS Chapter 45", "url": CH45},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA rate on the one dutiable line",
        "saves": "The 14% base rate on other articles of natural cork (4503.90.60)",
        "appliesTo": "4503.90.60 goods of Australia, Bahrain, Chile, Colombia, Israel, Jordan, Korea, Morocco, Oman, Panama, Peru, "
        "Singapore, CAFTA-DR, CBERA and AGOA countries (AGOA through December 31, 2026)",
        "document": "Proof of origin under the agreement and the SPI on the entry line (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, PE, SG, "
        "P, E or D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)). GSP (A) has been expired since December 31, "
        "2020, so a GSP claim pays 14%.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "civil-aircraft",
        "title": "Claim the civil-aircraft exemption for agglomerated cork parts",
        "saves": "The 2026 Section 301 duty (and the Brazil 25%) on articles of agglomerated cork for civil aircraft",
        "appliesTo": "4504.90.00 goods that are parts or components of civil aircraft and meet General Note 6",
        "document": "The civil-aircraft certification required by General Note 6, and heading 9903.05.88 (or 9903.05.05 for Brazil) on "
        "the entry line.",
        "caveat": "Does not lift China's List 3 duty (9903.88.03).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 50(a)(iv), 52(d)", "url": CH99},
            {"label": "HTSUS General Note 6", "url": GN},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the line decides the rate: natural (4503) vs agglomerated cork (4504), cork vs rubber or wood "
        "composites, stoppers vs other closures",
        "appliesTo": "Any line where classification is in doubt — composite stoppers, gaskets, boards and flooring",
        "document": "A ruling request to CBP describing the product, its materials and use (19 CFR part 177). Published rulings such "
        "as NY 812848 (natural cork stoppers, 4503.10.60), N302753 (wood-topped agglomerated stopper, 4504.10.47), N058517 (cork "
        "bulletin board, 4504.90) and HQ 004449 (cork-rubber gaskets, 4016.93) show how CBP decides.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
            {"label": "CBP ruling N302753 (agglomerated cork stopper)", "url": RUL + "N302753"},
            {"label": "HTSUS Chapter 45", "url": CH45},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on corks used in exported wine",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on stoppers or cork used in goods that are exported",
        "appliesTo": "All lines, when the imported cork, or wine bottled with it, is exported",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded — nothing on EU cork that entered duty-free; manufacturing drawback needs "
        "a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": "https://www.ecfr.gov/current/title-19/part-190"}],
    },
]
te["rules"] = [
    {
        "id": "aphis-cork", "agency": "USDA APHIS",
        "title": "Cork and cork bark that is unprocessed or only primarily processed (cleaned, debarked, rough sawn or shaped) is a regulated article: APHIS import permit and importer document (species, country of harvest, quantity, use); must be free from rot and is inspected at the port of first arrival. Canadian cork enters under a general permit",
        "citations": [
            {"label": "7 CFR 319.40-1 (regulated article: cork)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-1"},
            {"label": "7 CFR 319.40-2", "url": "https://www.ecfr.gov/current/title-7/section-319.40-2"},
            {"label": "7 CFR 319.40-3(a)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-3"},
            {"label": "7 CFR 319.40-6(e)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-6"},
            {"label": "7 CFR 319.40-9", "url": "https://www.ecfr.gov/current/title-7/section-319.40-9"},
        ],
    },
    {
        "id": "lacey", "agency": "USDA APHIS",
        "title": "Lacey Act plant declaration (genus and species, country of harvest, quantity, value) for headings 4501 and 4503, including wine corks — Phase VII, from December 1, 2024",
        "citations": [
            {"label": "16 U.S.C. 3372(f)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm"},
            {"label": "89 FR 47122 (Phase VII)", "url": "https://www.federalregister.gov/documents/2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions"},
            {"label": "APHIS Lacey Act page", "url": "https://www.aphis.usda.gov/plant-imports/lacey-act"},
        ],
    },
    {
        "id": "fda-closures", "agency": "FDA",
        "title": "Cork in food-container closures and sealing gaskets must meet the food-contact rules for closures (cleaned, granulated cork is a listed component)",
        "citations": [{"label": "21 CFR 177.1210", "url": "https://www.ecfr.gov/current/title-21/section-177.1210"}],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on the article or, where the article cannot be marked, on its container",
        "citations": [{"label": "19 CFR part 134", "url": "https://www.ecfr.gov/current/title-19/part-134"}],
    },
    {
        "id": "far-nonavailable", "agency": "FAR (federal procurement)",
        "title": "Cork, wood or bark and waste is on the Buy American list of articles not available domestically, so federal buyers may purchase foreign cork",
        "citations": [{"label": "48 CFR 25.104", "url": "https://www.ecfr.gov/current/title-48/section-25.104"}],
    },
]
GROUP_NOTES = {
    "4501": "Raw cork bark and waste cork are APHIS regulated articles (permit, importer document, free from rot, port inspection). The whole heading needs a Lacey Act declaration.",
    "4502": "Debacked or roughly squared cork is still a regulated article for APHIS (primary processing only); blocks and blanks cut further are not.",
    "4503": "Wine corks and other natural cork articles need a Lacey Act declaration. Stoppers and disks used as food-container closures must meet FDA food-contact rules.",
    "4504": "No APHIS permit or Lacey Act declaration for agglomerated cork. Stoppers and gaskets in food-container closures must meet FDA food-contact rules.",
}
GROUP_RULES = {
    "4501": ["aphis-cork", "lacey", "cbp-marking", "far-nonavailable"],
    "4502": ["aphis-cork", "cbp-marking", "far-nonavailable"],
    "4503": ["lacey", "fda-closures", "cbp-marking"],
    "4504": ["fda-closures", "cbp-marking"],
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    g["ruleIds"] = GROUP_RULES[h]
CLOSURES = ("4503.10", "4503.90.20", "4504.10.45", "4504.10.47")
FACE = ("4503.90.40", "4503.90.60", "4504.10.30", "4504.10.40", "4504.10.50", "4504.90")
for ln in te["lines"]:
    hts = ln["hts"]
    ids = []
    if hts.startswith(("4501.10", "4501.90.20", "4502")):
        ids.append("aphis-cork")
    if hts.startswith(("4501", "4503")):
        ids.append("lacey")
    if hts.startswith(CLOSURES):
        ids.append("fda-closures")
    ids.append("cbp-marking")
    if hts.startswith(("4501", "4502")):
        ids.append("far-nonavailable")
    ln["ruleIds"] = ids
    levers = ["exception-lists", "usmca"]
    if hts.startswith(FACE):
        levers.append("face-ply")
    if hts.startswith("4503.90.60"):
        levers.append("fta")
    if hts.startswith("4504.90"):
        levers.append("civil-aircraft")
    levers += ["ruling", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. APHIS permit conditions, Lacey Act "
    "requirements and exception lists change; check them before each shipment."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 45 FAQ: Cork Stopper, Cork Board & Cork Flooring HS Codes and Import Duties"
fc["seo"]["title"] = "HTS Chapter 45 FAQ 2026: HS Codes for Cork Stoppers, Cork Board, Cork Sheet, Flooring & Gaskets | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about cork imports: HS codes for wine corks, agglomerated stoppers, cork boards, sheets, "
    "flooring, coasters and gaskets, the EU cork tariff exemption, China's 37.5% and where U.S. cork comes from."
)
fc["seo"]["keywords"] = [
    "hs code for cork stopper",
    "wine stopper hs code",
    "agglomerated cork stoppers hs code",
    "hs code cork board",
    "hs code for cork sheet",
    "cork flooring hs code",
    "hs code for cork gasket",
    "hs code cork coaster",
    "hs code 4504.90",
    "cork tariff exemption us",
    "where does cork come from",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing cork into the U.S. — HS codes for stoppers, boards, sheets, "
    "flooring and gaskets, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 45 base rates are Free on 18 of 19 lines; only other articles of natural cork (4503.90.60) pay 14%. They are unchanged since January 2025.",
    "Every Chapter 45 line is on the EU exception list of the 2026 Section 301 action, so cork from Portugal, Spain, Italy and France — 89% of 2025 imports — pays only the base rate.",
    "China pays 37.5% extra (25% List 3 + 12.5%), 51.5% in total on 4503.90.60; the UK and India pay 10%, Vietnam and Morocco 12.5%; USMCA goods from Mexico and Canada pay nothing.",
    "The IEEPA tariffs ended February 24, 2026, and the 10% Section 122 surcharge — which hit EU cork too — expired July 23, 2026.",
    "Raw cork bark needs an APHIS permit, and natural cork and wine corks need a Lacey Act declaration; whether flooring has a natural or agglomerated cork face decides between 14% and Free.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "hs-cork-stopper",
        "question": "What is the HS code for cork stoppers and wine corks?",
        "searchedAs": ["hs code for cork stopper", "hs code cork stoppers", "wine cork hs code", "wine stopper hs code", "natural cork stoppers hs code", "wine bottle stopper hs code"],
        "answer": "Stoppers of natural cork are 4503.10. Cylindrical stoppers, the shape of most still-wine corks, are 4503.10.60 (CBP ruling NY 812848); tapered stoppers are 4503.10.20 (up to 19 mm in diameter), 4503.10.30 (wholly of cork) or 4503.10.40 (for example with a decorative top, N304236). All are Free at the general rate. Stoppers of agglomerated cork are 4504.10.45 or 4504.10.47, also Free. Natural cork stoppers were 55% of U.S. cork imports in 2025 ($151.6M).",
        "link": "",
    },
    {
        "id": "agglomerated-stoppers",
        "question": "What is the HS code for agglomerated cork stoppers?",
        "searchedAs": ["agglomerated cork stoppers hs code", "agglomerated cork", "agglomerated cork products"],
        "answer": "Stoppers of agglomerated cork (granules bonded together) are 4504.10.45 when they are straight (not tapered), wholly of cork and longer than their diameter, and 4504.10.47 otherwise. CBP put a bar-top stopper with an agglomerated cork shank and a wooden top in 4504.10.47 because the cork does the sealing (N302753). Both lines are Free; from China they pay 37.5%, from the EU nothing extra.",
        "link": "",
    },
    {
        "id": "hs-4504",
        "question": "What do HS codes 4504.10 and 4504.90 cover?",
        "searchedAs": ["hs code 4504", "hs code 4504.10", "hs code 4504.90"],
        "answer": "Heading 4504 is agglomerated cork. 4504.10 covers blocks, plates, sheets, strip, tiles and solid cylinders, split into vulcanized cork-rubber sheets (.10), compressed-cork insulation (.20), floor coverings (.30), paper-backed wallcoverings (.40), stoppers, disks and washers (.45, .47) and other (.50). 4504.90.00 is other articles of agglomerated cork, such as bulletin boards and placemats. All are Free. In 2025 the U.S. imported $100.4M under 4504.10 and $15.5M under 4504.90.",
        "link": "",
    },
    {
        "id": "cork-board",
        "question": "What is the HS code for a cork board or bulletin board?",
        "searchedAs": ["hs code cork board", "cork board hs code", "cork bulletin board hs code", "pin board hs code", "bulletin board hs code"],
        "answer": "A board of agglomerated cork, even with a thin wood backing, is 4504.90.00, Free (CBP ruling N058517). Framed boards are classified by the part that gives their essential character: CBP put a board with a wood fiberboard core in heading 4421 and one with a paperboard core in 4823 (HQ 955013), and a magnetic steel-and-cork board in 7326.90 (N056355). From China a 4504.90 board pays 37.5%.",
        "link": "tariff-engineering",
    },
    {
        "id": "cork-sheet",
        "question": "What is the HS code for cork sheets, rolls and cork fabric?",
        "searchedAs": ["hs code for cork sheet", "cork sheet hs code", "rubber cork sheet hs code", "cork fabric hs code", "agglomerated cork sheet", "agglomerated cork rolls"],
        "answer": "Sheets and rolls of agglomerated cork are 4504.10.50 (Free); vulcanized sheets of ground cork and rubber are 4504.10.10 (Free); natural cork sheets cut from the bark are 4502.00.00 (Free). Natural cork laminated to a fabric or plastic backing and sold as \"cork fabric\" is 4503.90.60 at 14% (N289697). Sheets with more rubber than cork can be classified as rubber in chapter 40.",
        "link": "tariff-engineering",
    },
    {
        "id": "cork-flooring",
        "question": "What is the HS code for cork flooring and underlayment?",
        "searchedAs": ["cork flooring hs code", "cork floor tiles hs code", "natural cork flooring", "agglomerated cork tiles"],
        "answer": "Agglomerated cork floor coverings and tiles are 4504.10.30, Free, and agglomerated cork underlayment is 4504.10.20 (N275725). Multi-layer planks are classified by the face: an agglomerated cork face stays in 4504.10.30, but a natural cork veneer face puts the plank in 4503.90.60 at 14% (HQ H297792, 2021). From China add 37.5%.",
        "link": "tariff-engineering",
    },
    {
        "id": "cork-gasket",
        "question": "What is the HS code for cork gaskets?",
        "searchedAs": ["hs code for cork gasket", "cork gasket hs code", "cork rubber gasket hs code"],
        "answer": "Washers and gaskets of agglomerated cork are 4504.10.47 (disks, wafers and washers) or 4504.90.00, and of natural cork 4503.90.20, all Free. Cork-rubber composites follow the material that gives the essential character: CBP classified a cork/rubber gasket material as rubber (4008) and finished gaskets in 4016.93 (HQ 004449). Kits of gaskets of different materials go to 8484.",
        "link": "",
    },
    {
        "id": "cork-coaster",
        "question": "What is the HS code for cork coasters and placemats?",
        "searchedAs": ["hs code cork coaster", "cork coaster hs code", "hs code for cork coaster", "cork coaster tariff code"],
        "answer": "Coasters and placemats of agglomerated cork are 4504.90.00, Free (CBP ruling N240833 on a Portuguese cork placemat). Natural cork coasters fall in 4503.90.60 at 14%. Coasters with a printed paperboard face can go to heading 4823. From China a 4504.90 coaster pays 37.5%; from Portugal nothing extra.",
        "link": "",
    },
    {
        "id": "crown-corks",
        "question": "Are crown corks classified in Chapter 45?",
        "searchedAs": ["hs code for crown corks"],
        "answer": "No. Crown corks are metal bottle caps (crown seals), classified in 8309.10 (CBP HQ 955016), even when they have a plastic or cork liner. Only stoppers made of natural or agglomerated cork are Chapter 45.",
        "link": "",
    },
    {
        "id": "cork-tariff-exemption",
        "question": "Is cork exempt from U.S. tariffs?",
        "searchedAs": ["cork tariff exemption us", "cork tariff exemption", "tariffs on cork", "cork tariffs"],
        "answer": "From the EU, yes for the extra duties: every Chapter 45 line is on the EU exception list of the 2026 Section 301 action (U.S. note 52(j)(2)), so EU cork pays only the base rate — Free except 14% on 4503.90.60. Eleven other countries, including Taiwan and Switzerland, have the same exemption. In 2025 the U.S.-EU framework had already restored base-rate-only treatment for EU cork from September 1, 2025, but the 10% Section 122 surcharge applied to all cork from February 24 to July 23, 2026. Cork from China, the UK, India or Vietnam is not exempt.",
        "link": "tariff-updates",
    },
    {
        "id": "china-cork",
        "question": "What is the tariff on cork from China?",
        "searchedAs": ["tariffs on cork", "tariff rates for china", "china tariff on cork"],
        "answer": "37.5% on the 18 Free lines: 25% under Section 301 List 3 (9903.88.03, since 2019) plus 12.5% under the 2026 Section 301 action (9903.05.31). Other articles of natural cork (4503.90.60) pay 51.5%. China is on no cork exception list, and USTR confirmed on October 7, 2026 that List 3 continues. The IEEPA duties that took Chinese cork to 55% in mid-2025 ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "where-cork",
        "question": "Where does the cork the U.S. imports come from?",
        "searchedAs": ["where does cork come from", "where does cork come from country", "where does cork come from in usa", "how much cork comes from portugal", "is all cork from portugal", "where does cork come from what tree"],
        "answer": "Mostly Portugal: $197.3M of the $276.7M imported in 2025 (71%), then Spain ($30.0M, 11%), China ($17.5M), Italy and France; EU member states supplied 89%. Cork is the bark of the cork oak, Quercus suber. The U.S. has no commercial supply — federal procurement rules list cork among articles not available domestically (48 CFR 25.104).",
        "link": "understand-industry",
    },
    {
        "id": "raw-cork-bark",
        "question": "Can you import raw cork bark into the U.S.?",
        "searchedAs": ["natural cork bark", "natural cork"],
        "answer": "Yes, with an APHIS permit. Cork and cork bark that are unprocessed or only primarily processed are regulated articles (7 CFR 319.40-1): they need a permit and an importer document naming the species, country of harvest, quantity and use, must be free from rot, and are inspected at the port (7 CFR 319.40-6(e), 319.40-9). Canadian cork enters under a general permit. Raw cork (4501.10) is Free and also needs a Lacey Act declaration.",
        "link": "tariff-engineering",
    },
    {
        "id": "us-imports",
        "question": "How much cork does the U.S. import?",
        "searchedAs": ["cork imports", "total imports cork"],
        "answer": "$276.7M in 2025, down 6.1% from $294.8M in 2024 and from a $320.0M peak in 2021. Natural cork stoppers were $151.6M (55%), agglomerated cork sheets, flooring and stoppers $100.4M and other agglomerated cork articles $15.5M; raw cork, waste and blocks were $8.1M.",
        "link": "understand-industry",
    },
]

use_measures_fr_urls(d)  # the shipped file cites FR documents by measures.json's URLs (hand edit after this script ran; #1863)
json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
