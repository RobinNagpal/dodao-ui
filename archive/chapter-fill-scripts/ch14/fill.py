"""Fill the writer parts of the generated Chapter 14 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 14 ...` (see run.sh in this folder):
    python3 fill.py
"""
import json

WT = "/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/14-plaiting-materials-nes.json"
REF01 = f"{WT}/src/tariff-data/chapters/01-live-animals.json"
REF11 = f"{WT}/src/tariff-data/chapters/11-milling-products.json"
CHECKED = "2026-10-12"
ECFR_DATE = "2026-10-08"
HTS21 = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH14 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2014"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"

d = json.load(open(PATH))
ref = {}
for f in (REF01, REF11):
    for s in json.load(open(f))["tariffUpdates"]["sources"]:
        ref.setdefault(s["id"], s)

NEW_SOURCES = {
    "procl-11061": {
        "id": "procl-11061", "publisher": "Federal Register", "citation": "91 FR 58311", "document": "Proclamation 11061",
        "title": "Excluding Certain Canadian Products From Importation Into the United States in Response to Continued Discrimination Against the Commerce of the United States With Respect to Alcoholic Beverages",
        "signed": "2026-09-08", "published": "2026-09-14",
        "url": "https://www.federalregister.gov/documents/2026/09/14/2026-18835/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued",
    },
    "procl-11063": {
        "id": "procl-11063", "publisher": "Federal Register", "citation": "91 FR 58325", "document": "Proclamation 11063",
        "title": "Excluding Certain Canadian Products From Importation Into the United States in Response to Continued Discrimination Against the Commerce of the United States With Respect to Motor Vehicles",
        "signed": "2026-09-08", "published": "2026-09-14",
        "url": "https://www.federalregister.gov/documents/2026/09/14/2026-18837/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued",
    },
    "pl-119-37": {
        "id": "pl-119-37", "publisher": "Congress.gov", "citation": "P.L. 119-37, Div. B, sec. 781 (139 Stat. 558)",
        "document": "Public Law 119-37",
        "title": "Continuing Appropriations, Agriculture, Legislative Branch, Military Construction and Veterans Affairs, and Extensions Act, 2026 (new statutory definition of hemp, 7 U.S.C. 1639o)",
        "signed": "2025-11-12", "published": "2025-11-12",
        "url": "https://www.congress.gov/119/plaws/publ37/PLAW-119publ37.pdf",
    },
    "pl-119-103": {
        "id": "pl-119-103", "publisher": "Congress.gov", "citation": "P.L. 119-103, sec. 2019 (140 Stat. 1003)",
        "document": "Public Law 119-103",
        "title": "Continuing Appropriations and Extensions Act, 2027 (section 781 extension: hemp definition delayed to December 11, 2026)",
        "signed": "2026-09-02", "published": "2026-09-02",
        "url": "https://www.congress.gov/119/plaws/publ103/PLAW-119publ103.pdf",
    },
    "crs-hemp": {
        "id": "crs-hemp", "publisher": "Congressional Research Service", "citation": "CRS IN12620",
        "document": "CRS Insight", "title": "Change to Federal Definition of Hemp and Implications for Federal Enforcement",
        "signed": None, "published": "2025-12-03",
        "url": "https://www.congress.gov/crs_external_products/IN/PDF/IN12620/IN12620.1.pdf",
    },
    "cbp-h334131": {
        "id": "cbp-h334131", "publisher": "CBP", "citation": "HQ H334131", "document": "CBP ruling letter",
        "title": "Classification of Dried Hemp Flowers (Cannabis sativa L.): subheading 1404.90.90",
        "signed": None, "published": "2026-07-23", "url": "https://rulings.cbp.gov/ruling/H334131",
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
    "1401": ("Plaiting materials: bamboo, rattan, willow, raffia, straw", "Bamboo & rattan"),
    "1404": ("Vegetable products n.e.s.: cotton linters, broomcorn, coco peat, henna, hemp", "Other veg. products"),
}

EXEMPT_52B = (
    "Every line of 1404.90.90 (coco peat and coir pith, henna leaves, dried hemp flower and biomass, tanning materials and other "
    "vegetable products n.e.s.) is on the general exemption list in U.S. note 52(b) (9903.05.86) and pays no 2026 Section 301 duty."
)
ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 14: Vegetable Plaiting Materials (Bamboo, Rattan) & Vegetable Products N.E.S. — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 14 Tariff Rates 2026: Bamboo, Rattan, Cotton Linters, Coco Peat & Broomcorn Import Duties | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 14 HTS Chapter 14 lines: bamboo, rattan, willow (osier), raffia, cotton linters, broomcorn, "
    "istle, coco peat, henna and hemp flower. General, FTA and Column 2 rates plus the 2026 extra duty by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 14",
    "vegetable plaiting materials tariff",
    "vegetable plaiting materials import duty rates",
    "bamboo import duty",
    "rattan import duty",
    "cotton linters import duty",
    "HS code 1404.90",
    "HS code 1401",
    "coco peat HS code",
    "section 301 tariffs on bamboo",
]
ov["intro"] = (
    "Chapter 14 covers raw plant materials that are not food: **bamboo, rattan, willow (osier), raffia, reeds and cereal straw** "
    "used for weaving and basketry (heading 1401), and a catch-all heading 1404 for **cotton linters, vegetable hair, broomcorn, "
    "istle** and other broom fibres, and \"vegetable products not elsewhere specified\" — which CBP rulings place coco peat and "
    "coir pith, dried henna leaves and dried hemp flower in. Its **14 tariff lines** are mostly Free; the highest base rate is "
    "4.4% on willow.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of "
    "10% or 12.5%** — but every 1404.90.90 line (coco peat, henna, hemp and the rest of the catch-all) is exempt, and several "
    "countries have their own exception lists for bamboo, rattan and broom fibres. China adds its 2018–2019 Section 301 duties "
    "(**37.5%** in total on bamboo), Brazil 25% more, and **Canada a 50% Section 338 duty** on six Chapter 14 subheadings that "
    "applies even to USMCA goods. Mexico, the largest supplier (49% of the $222M imported in 2025), pays nothing on "
    "USMCA-qualifying goods."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
for g in ov["productGroups"]:
    if g["heading"] == "1401":
        g["blurb"] = (
            "Raw plaiting materials: bamboo poles and stakes, rattan canes and cores, willow (osier), raffia, reeds, rushes and "
            "cleaned or dyed cereal straw. Bamboo and rough rattan are Free; split rattan is 2%, willow 4.4% and other plaiting "
            "materials 3.2%. Finished baskets and wickerwork are heading 4602, furniture chapter 94."
        )
        g["searchExamples"] = ["bamboo poles", "bamboo stakes", "rattan cane", "rattan core", "willow", "osier", "raffia", "seagrass", "cereal straw"]
    else:
        g["blurb"] = (
            "Cotton linters (Free), vegetable hair (0.5¢/kg), broomcorn ($4.95/t), istle (Free) and other broom and brush fibres "
            "(2.3%), plus the Free catch-all 1404.90.90: coco peat and coir pith, coconut husk chips, dried henna leaves, tanning "
            "materials, hemp flower and biomass, and natural leaf wraps — 91% of the chapter's imports."
        )
        g["searchExamples"] = ["cotton linters", "broomcorn", "istle", "coco peat", "coir pith", "henna leaves", "hemp flower", "palm leaves", "tanning materials"]

ov["workedExamples"] = [
    {
        "title": "A container of coco peat blocks from Sri Lanka",
        "line": "1404.90.90.90",
        "body": "CBP classifies coco peat (coir pith) in 1404.90.90 (rulings N241191, N250256), Free at the general rate. All of "
        "1404.90.90 is on the Section 301 general exemption list (U.S. note 52(b), 9903.05.86), so Sri Lanka's 10% rate "
        "(9903.05.72) does not apply: a $20,000 container pays **$0** duty. The bags or blocks must still be marked with the "
        "country of origin.",
    },
    {
        "title": "Bamboo garden stakes: China vs Indonesia",
        "line": "1401.10.00.00",
        "body": "Bamboo is Free at the general rate. From China, two Section 301 duties stack: 25% under List 3 (9903.88.03; CBP "
        "ruling N318904 applied it to bamboo stakes) and 12.5% under the 2026 action (9903.05.31) — **$3,750** on a $10,000 "
        "shipment. The same stakes from Indonesia pay **$0**: 1401.10.00 is on Indonesia's exception list (U.S. note "
        "52(j)(11), 9903.06.16). Bamboo poles must also clear APHIS as a regulated wood article.",
    },
    {
        "title": "Coir potting mix from Canada, with a USMCA claim",
        "line": "1404.90.90.90",
        "body": "CBP classified a Canadian coco-chip potting mix in 1404.90.90 (N330582). USMCA removes the 10% Section 301 duty "
        "(9903.05.93), but 1404.90.90 is on the Canada Section 338 list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies "
        "even when USMCA is claimed. A $5,000 shipment entered since August 22, 2026 pays **$2,500**.",
    },
    {
        "title": "20 tonnes of broomcorn from Mexico",
        "line": "1404.90.20.00",
        "body": "Broomcorn is $4.95 per tonne — **$99** on 20 t at the general rate, and **$0** with a USMCA claim (plant material "
        "grown in Mexico is originating). Without a valid claim, Mexico's 10% Section 301 duty (9903.05.55) is added: $99 + "
        "$2,400 on a $24,000 load. Broomcorn needs an APHIS import permit, must arrive baled, and may be treated on arrival "
        "(7 CFR 319.41).",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in d["understandIndustry"]["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "1404.90", "label": "Other vegetable products n.e.s. (incl. coco peat, broom fibres, henna)"},
    {"hts": "1401.10", "label": "Bamboo"},
    {"hts": "1404.20", "label": "Cotton linters"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; 1404.90 is not split further, so this page does not say which 10-digit line each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover vegetable materials or fibers of vegetable materials of a kind used primarily in the "
    "manufacture of textiles, however prepared, or other vegetable materials treated so as to be suitable only as textile "
    "materials — those are classified in section XI (for example coir fibre, heading 5305, and true hemp fibre, heading 5302).\n\n"
    "**Note 2.** Heading 1401 applies, inter alia, to bamboos (whether or not split, sawn lengthwise, cut to length, rounded at "
    "the ends, bleached, rendered nonflammable, polished or dyed), split osier, reeds and the like, to rattan cores and to drawn "
    "or split rattans. The heading does not apply to chipwood (heading 4404).\n\n"
    "**Note 3.** Heading 1404 does not apply to wood wool (heading 4405) and prepared knots or tufts for broom or brush making "
    "(heading 9603).\n\n"
    "**Statistical note (1404.90.90.90).** Imports of cigarette wrappers or tubes composed primarily of non-pulped vegetable "
    "materials under this provision may be subject to Federal Excise Tax (26 U.S.C. 5701)."
)
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 14 Tariff Updates: Bamboo, Rattan, Coco Peat & Other Vegetable Products (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 14 Tariff Updates 2026: Bamboo, Rattan & Vegetable Products — Section 301, Canada 338, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 14 (bamboo, rattan, cotton linters, broomcorn, coco peat, hemp) since January 2025: unchanged "
    "base rates, the end of the IEEPA tariffs and the Section 122 surcharge, the 2026 Section 301 tariffs, Canada's 50% Section "
    "338 duty and the new hemp definition."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 14 tariff updates",
    "vegetable plaiting materials tariff 2026",
    "China Section 301 tariffs on raw bamboos",
    "section 122 surcharge on raw rattans",
    "USMCA rules of origin HTS Chapter 14",
    "Canada section 338 tariff",
    "hemp flower import 2026",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 14 Chapter 14 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 "
    "surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section "
    "301 tariff of 10% or 12.5%**, from which all of 1404.90.90 and several countries' bamboo, rattan and broom-fibre lines are "
    "exempt. China keeps its 2018–2019 Section 301 duties, Brazil pays another 25%, and since **August 22, 2026 Canada pays "
    "50%** under Section 338 on six subheadings, USMCA claim or not. A new statutory definition of hemp, delayed to "
    "**December 11, 2026**, will decide whether dried hemp flower entered under 1404.90.90 can be imported at all."
)
tu["scope"] = (
    "Measures that reach Chapter 14 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption lists, "
    "the Brazil Section 301 tariff, China Section 301 Lists 3 and 4A, the Canada Section 338 duty, the Nicaragua Section 301 "
    "phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended; plus agency changes that decide whether goods "
    "can enter (Lacey Act declarations, the hemp definition). No antidumping or countervailing duty order and no Section 232 "
    "action covers a Chapter 14 line. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "14 of 14 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China) and Canada Section 338"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). " + EXEMPT_52B + " The 2025 IEEPA duty on "
        "Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "Mexican broomcorn, istle and other plant materials that qualify for USMCA pay $0; goods without a valid claim pay the "
        "base rate plus 10%, except 1404.90.90 goods, which pay nothing extra either way.",
    ),
    "in": (
        EXEMPT_52B + " GSP (SPI A, A*, A+), printed on the dutiable lines, has been expired since December 31, 2020. " + ENDED,
        "Coco peat and henna leaves from India (1404.90.90) enter free; Indian bamboo, cotton linters or broom fibres pay the "
        "base rate plus 10%.",
    ),
    "cn": (
        "Three Section 301 duties reach Chapter 14. List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers 1401.10, 1401.90.20, "
        "1401.90.40, 1404.20, 1404.90.10, 1404.90.30, 1404.90.40 and 1404.90.90; List 4A (+7.5%, 9903.88.15, since February 14, "
        "2020) covers rough rattan (1401.20.20) and broomcorn (1404.90.20); split rattan (1401.20.40) is on no China list "
        "(List 4B is suspended). The 2026 action adds +12.5% (9903.05.31) on every line except 1404.90.90 (note 52(b)). USTR "
        "confirmed on October 7, 2026 that the 2018 actions continue. The IEEPA duties on China ended February 24, 2026.",
        "Bamboo from China pays 37.5%, willow 41.9%, rough rattan 20%, split rattan 14.5% and 1404.90.90 goods 25%.",
    ),
    "lk": (
        EXEMPT_52B + " GSP has been expired since December 31, 2020. " + ENDED,
        "Coco peat, coir pith and husk chips from Sri Lanka (1404.90.90) pay $0; other Chapter 14 goods pay the base rate plus 10%.",
    ),
    "th": (
        EXEMPT_52B + " GSP has been expired since December 31, 2020. " + ENDED,
        "Thai 1404.90.90 goods enter free; Thai bamboo, rattan or broom fibres pay the base rate plus 12.5%.",
    ),
    "eu": (
        "For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39) — every Chapter "
        "14 base rate is under 10%. " + EXEMPT_52B + " This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended "
        "February 24, 2026.",
        "Dutch, Italian or Portuguese plaiting materials and broom fibres pay 10% of value in place of the base rate; 1404.90.90 "
        "goods stay Free.",
    ),
    "ar": (
        "Argentina's exception list (U.S. note 52(j)(8), 9903.06.10) covers bamboo (1401.10.00) and rough rattan (1401.20.20). "
        + EXEMPT_52B + " " + ENDED,
        "Argentine bamboo and rough rattan pay $0; willow and other plaiting materials pay the base rate plus 10%.",
    ),
    "tr": (
        EXEMPT_52B + " " + ENDED,
        "Turkish 1404.90.90 goods enter free; other Chapter 14 goods pay the base rate plus 12.5%.",
    ),
    "ca": (
        "Two duties. Section 301 (+10%, 9903.05.29) is lifted for USMCA-qualifying goods (9903.05.93) and for every 1404.90.90 "
        "line (note 52(b)). The Section 338 duty (+50%, 9903.03.14, Proclamation 11048) covers 1401.10.00, 1401.90.20, 1401.90.40, "
        "1404.20.00, 1404.90.40 and 1404.90.90 (U.S. note 51(b)(3)) and applies even when USMCA is claimed (note 51(a)). It took "
        "effect August 22, 2026 after a 3-day suspension; Proclamation 11065 kept these lines on the list from September 15, and "
        "none of them is on the September 29 import-ban annexes. The 35% IEEPA duty ended February 24, 2026.",
        "Canadian bamboo, willow, cotton linters, broom fibres and 1404.90.90 goods (such as coir potting mix) pay 50% with a USMCA "
        "claim and 50–60% without; rattan, vegetable hair, broomcorn and istle pay $0 with USMCA.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). Note 52(b) lifts the 12.5% on 1404.90.90, but Brazil's own exemption lists do not include any Chapter 14 "
        "line except, by description, date palm and myrtus branches for religious purposes only (note 50(a)(iii), 9903.05.04), "
        "which the importer must claim. The 40% IEEPA duty on Brazil ended February 24, 2026.",
        "Brazilian Chapter 14 goods pay the base rate plus 37.5%; 1404.90.90 goods pay 25% (0% for religious palm branches).",
    ),
    "do": (
        "CAFTA-DR (SPI P) makes every Chapter 14 base rate Free, but the 12.5% Section 301 duty still applies to FTA goods (U.S. "
        "note 52(a)). " + EXEMPT_52B + " " + ENDED,
        "Dominican 1404.90.90 goods enter free; other Chapter 14 goods pay 12.5% of value even with a CAFTA-DR claim.",
    ),
    "other": (
        EXEMPT_52B + " Country exception lists in note 52(j) also exempt: bamboo (1401.10.00) from Malaysia, Bangladesh, Taiwan, "
        "Cambodia, Indonesia and Ecuador; rattan (1401.20.20 / 1401.20.40) from Cambodia, Indonesia, Ecuador and Jordan; istle "
        "and other broom fibres (1404.90.30 / 1404.90.40) from Switzerland, Cambodia, Guatemala, Indonesia and Jordan, plus "
        "1404.90.30 from El Salvador and 1404.90.40 from Ecuador. Japan, South Korea and Switzerland pay 12.5% in total and Taiwan "
        "10% in total when the base rate is lower. " + ENDED,
        "Indonesian rattan and bamboo pay only the base rate; Vietnamese or Philippine plaiting materials pay the base rate plus "
        "their Section 301 rate. Countries outside the 60 economies, such as Côte d'Ivoire, pay only the base rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "cn":
        e["now"] = "+37.5%, +25%, +20% or +12.5%"
    if key == "ca":
        e["now"] = "+50% or +60% (six subheadings); +10% or none on the rest"
    if key == "other":
        e["country"] = "Other Section 301 economies (49, incl. Vietnam, Indonesia, Philippines, Japan, Switzerland, Cambodia, Ecuador)"
        e["now"] = "+10% or +12.5% (10% or 12.5% in total for Japan, South Korea, Switzerland, Taiwan)"
    if key == "br":
        e["effectiveFrom"] = "2026-07-24"
    if key in ("in", "lk", "th") and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")
    if key == "ca":
        for sid in ("procl-11061", "procl-11062", "procl-11063"):
            e["sourceIds"].insert(-1, sid)

add_sources(tu, [
    "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193", "eo-14194", "eo-14325",
    "eo-14257", "eo-14360", "ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "procl-11061", "procl-11062", "procl-11063",
    "pl-119-37", "pl-119-103", "crs-hemp", "cbp-h334131", "fr-2024-11901", "aphis-lacey",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
gen_changes = {c["id"]: c for c in tu["changes"]}
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 14 base-rate changes",
        "detail": "All 14 Chapter 14 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
        "Edition; no line was added, split or renumbered.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "hemp-definition", "type": "pending", "date": "2026-09-02", "dateLabel": "Signed",
        "title": "New hemp definition delayed to December 11, 2026",
        "detail": "Section 781 of P.L. 119-37 redefines hemp (7 U.S.C. 1639o) by total THC, including THCA, of not more than 0.3% "
        "on a dry-weight basis, and excludes intermediate products above that level, final products with more than 0.4 mg of "
        "THC per container, and synthesized cannabinoids. P.L. 119-103 (September 2, 2026) delayed it to December 11, 2026, except "
        "for products with cannabinoids not naturally produced by the plant, which lose hemp status on November 12, 2026. Dried "
        "hemp flower and biomass imported under 1404.90.90 that exceed the new limit stop being hemp and become marijuana under "
        "the Controlled Substances Act. The tariff rate does not change.",
        "before": "Hemp = not more than 0.3% delta-9 THC", "now": "Total THC (incl. THCA) not more than 0.3%",
        "countries": "All", "sourceIds": ["pl-119-37", "pl-119-103", "crs-hemp"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% "
        "in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 14 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 Lists 3 and 4A continue",
        "detail": "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
        "review. For Chapter 14 this keeps +25% (9903.88.03) on bamboo, willow, other plaiting materials, cotton linters, "
        "vegetable hair, istle, other broom fibres and 1404.90.90, and +7.5% (9903.88.15) on rough rattan and broomcorn.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-ban", "type": "reference", "date": "2026-09-29", "dateLabel": "Effective",
        "title": "Canadian import bans do not reach Chapter 14",
        "detail": "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
        "from September 29, 2026. No Chapter 14 line is on their annexes, so the six subheadings on the Section 338 list keep "
        "paying the 50% duty.",
        "before": None, "now": None, "countries": "Canada", "sourceIds": ["procl-11061", "procl-11062", "procl-11063", "hts-now"],
    },
    {
        "id": "ca-338-scope", "type": "reference", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Section 338 list revised; Chapter 14 lines stay on it",
        "detail": "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026 and made the duty "
        "apply on top of Section 232 duties. None of the six Chapter 14 subheadings was removed.",
        "before": "+50%", "now": "+50%", "countries": "Canada", "sourceIds": ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ca-338", "type": "extraDuty", "date": "2026-08-22", "dateLabel": "Effective",
        "title": "Canada Section 338 duty of 50% on six Chapter 14 subheadings",
        "detail": "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which "
        "include bamboo (1401.10.00), willow (1401.90.20), other plaiting materials (1401.90.40), cotton linters (1404.20.00), "
        "other broom and brush fibres (1404.90.40) and the whole of 1404.90.90. It is charged even when USMCA is claimed and on "
        "top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 after a 3-day "
        "suspension (Proclamation 11056).",
        "before": "None", "now": "+50%", "countries": "Canada",
        "sourceIds": ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover 11 of 14 Chapter 14 lines",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). The three 1404.90.90 lines are on the "
        "general exemption list (U.S. note 52(b), 9903.05.86). Country lists in note 52(j) exempt bamboo, rattan or broom fibres "
        "of Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador, Jordan and "
        "Switzerland. EU goods pay 10% in total; USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). FTA claims remove "
        "the base rate but not this duty.",
        "before": "None", "now": "+10% / +12.5%", "countries": "60 economies", "sourceIds": S301,
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "hemp-ruling", "type": "reference", "date": "2026-07-23", "dateLabel": "Published",
        "title": "CBP: dried hemp flower is classified in 1404.90.90",
        "detail": "In HQ H334131 CBP held that dried, de-stemmed and ground hemp flowers imported for CBD extraction are not a textile "
        "material and fall in 1404.90.90 (Free), following earlier rulings that put hemp biomass, hemp leaves and hemp wraps in "
        "heading 1404.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["cbp-h334131", "hts-now"],
    },
    {
        "id": "br-301", "type": "extraDuty", "date": "2026-07-22", "dateLabel": "Effective",
        "title": "Section 301 tariff on products of Brazil",
        "detail": "25% on all goods of Brazil (9903.05.01), every Chapter 14 line included. The only Chapter 14 exemption is by "
        "description: date palm branches, myrtus branches or other vegetable material for religious purposes only (1404.90.90, "
        "U.S. note 50(a)(iii), 9903.05.04). From July 24 the 12.5% 2026 action (9903.05.27) is added on top for the other lines.",
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
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 14 subheading was on the product "
        "exemption list (9903.03.03); only date palm and myrtus branches for religious purposes (1404.90.90) were exempt by "
        "description (9903.03.04). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
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
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
        "(SPI D) makes every dutiable Chapter 14 line Free for eligible sub-Saharan countries such as Côte d'Ivoire. GSP (SPI A, "
        "A*, A+), printed on the dutiable lines, remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026", "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"],
    },
    {
        "id": "ag-exemption", "type": "reference", "date": "2025-11-13", "dateLabel": "Effective",
        "title": "Reciprocal-tariff exemption for religious palm branches",
        "detail": "Executive Order 14360 widened the agricultural exemption from the reciprocal tariffs. In Chapter 14 it covered only "
        "date palm branches, myrtus branches or other vegetable material for religious purposes (1404.90.90, U.S. note "
        "2(v)(iii)(b), 9903.02.78); every other Chapter 14 line paid the reciprocal duties until they ended on February 24, 2026.",
        "before": None, "now": None, "countries": "All countries subject to the reciprocal tariff", "sourceIds": ["eo-14360", "hts-now"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
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
        "id": "lacey-phase-7", "type": "reference", "date": "2024-12-01", "dateLabel": "Effective",
        "title": "Lacey Act plant declaration now required for most Chapter 14 lines",
        "detail": "APHIS Phase VII of the Lacey Act declaration schedule, which began December 1, 2024, covers all of heading 1401 "
        "(bamboo, rattan, willow and other plaiting materials), istle (1404.90.30), other broom and brush fibres (1404.90.40) and "
        "raw dyeing and tanning materials (1404.90.90.20 and .40). Importers must file the genus, species, country of harvest, "
        "quantity and value of the plant (PPQ Form 505 or the ACE Lacey Act message set).",
        "before": None, "now": None, "countries": "All", "sourceIds": ["fr-2024-11901", "aphis-lacey"],
    },
]
# keep the pending item first when its date is in the future? The validator wants newest first by date.
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 14: Bamboo, Rattan & Other Vegetable Products — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 14 Import Statistics: Bamboo, Rattan, Coco Peat & Cotton Linters by Country | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of vegetable plaiting materials and vegetable products n.e.s. 2020–2025, by country, product and year: $222M "
    "in 2025, up 10.4%; Mexico supplied 49%, India 14% and China 9%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 14 import statistics",
    "US import duty on raw bamboos",
    "bamboo imports by country",
    "coco peat importers in USA",
    "cotton linters imports",
    "vegetable plaiting materials imports",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    "U.S. imports of Chapter 14 goods rose from **$201M in 2024 to $222M in 2025** (+10.4%), back above the 2021 peak of $223M "
    "after a dip to $162M in 2023. Almost all of it — **$203M, 91%** — is the catch-all 1404.90, which holds broom and brush "
    "fibres, vegetable hair and the Free basket line 1404.90.90 that CBP rulings use for coco peat and coir pith, coconut husk "
    "chips, dried henna leaves and hemp flower and biomass. The 6-digit trade data does not split it further.\n\n"
    "**Mexico supplied $108M (49%)**, all in heading 1404, up 4% and more than double its 2020–2023 level. India ($31M, +52%) "
    "and Sri Lanka ($9M, +52%) grew fastest among the large suppliers. Plaiting materials are small and shrinking: bamboo fell "
    "22% to $13M, mostly from China, and rattan to $1.9M; Argentina's 1401 shipments fell 43%. Cotton linters jumped from "
    "$0.8M to $3.5M.\n\n"
    "Through 2025 USMCA-qualifying goods from Mexico and Canada paid no extra duty, while most other suppliers paid the IEEPA "
    "reciprocal tariff from April 2025. Those duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of "
    "10% or 12.5% applies instead, with all of 1404.90.90 exempt. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 14 Tariff Rates by Country: Bamboo, Rattan & Vegetable Products"
ia["seo"]["title"] = "HTS Chapter 14 Import Duty Rates by Country: Mexico, India, China, Sri Lanka, Canada — Bamboo, Rattan, Coco Peat | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on bamboo, rattan, willow, cotton linters, broomcorn and other vegetable products by country: base "
    "rate plus the 2026 Section 301 duty and Canada's 50% Section 338 duty, with USMCA, EU, CAFTA-DR and AGOA rules applied."
)
ia["seo"]["keywords"] = [
    "united states tariff on vegetable plaiting materials",
    "raw bamboo import duty",
    "bamboo tariff China",
    "Mexico tariff on vegetable plaiting materials",
    "cotton linters customs duty",
    "column 2 tariffs on prepared osier",
    "Canada section 338 tariff",
]
ia["intro"] = (
    "The total rate on Chapter 14 goods depends far more on **where they come from** than on what they are. Each cell below is "
    "the base rate for that product group plus the extra duty for that country, minus any preference — computed from the "
    "current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026). **All of 1404.90.90 is exempt** from it, **USMCA-qualifying goods from Mexico enter free**, EU goods "
    "pay 10% in total, and **China pays up to 37.5% more**. **Canada is the exception**: a 50% Section 338 duty on bamboo, "
    "willow, cotton linters, broom fibres and 1404.90.90 applies even to USMCA goods."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULE_LABELS = {
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55) on 11 of 14 lines; the 3 lines of 1404.90.90 are exempt (note 52(b)). The 25% IEEPA duty ended February 24, 2026.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on 11 of 14 lines; 1404.90.90 (coco peat, henna) is exempt. GSP has expired; the IEEPA duties ended February 24, 2026.",
    "China": "Base rate plus 12.5% (9903.05.31) on 11 lines, plus 25% List 3 (9903.88.03) on 10 lines or 7.5% List 4A (9903.88.15) on rough rattan and broomcorn: 37.5% on bamboo, 20% on rough rattan, 14.5% on split rattan, 25% on 1404.90.90.",
    "Sri Lanka": "Base rate plus 10% Section 301 (9903.05.72) on 11 of 14 lines; 1404.90.90 (coco peat, coir pith) is exempt. GSP has expired.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on 11 of 14 lines; 1404.90.90 is exempt. GSP has expired.",
    "Netherlands": "EU: 10% in total in place of the base rate (9903.05.39) on 11 of 14 lines, since every Chapter 14 base rate is under 10%; 1404.90.90 stays Free (note 52(b)). The 15% IEEPA rate ended February 24, 2026.",
    "Argentina": "Base rate plus 10% Section 301 (9903.05.22) on 8 of 14 lines; bamboo and rough rattan are on Argentina's exception list (9903.06.10) and 1404.90.90 on note 52(b).",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on 11 of 14 lines; 1404.90.90 is exempt.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on 1401.10, 1401.90, 1404.20, 1404.90.40 and 1404.90.90 even with USMCA. Otherwise the base rate plus 10% (9903.05.29) on 11 lines and 50% on those six subheadings.",
    "Côte d'Ivoire": "Not one of the 60 Section 301 economies: base rate only, and AGOA (SPI D, renewed to December 31, 2026) makes every dutiable line Free. The IEEPA reciprocal tariff ended February 24, 2026.",
    "Brazil": "Base rate plus 25% (9903.05.01) on every line and 12.5% (9903.05.27) on 11 lines: 37.5% on most goods, 25% on 1404.90.90 (religious palm branches exempt by description, 9903.05.04, not applied here).",
    "Dominican Republic": "CAFTA-DR (P) makes the base rate Free, but 12.5% Section 301 (9903.05.34) still applies on 11 of 14 lines; 1404.90.90 is exempt.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% (9903.05.20–9903.05.84); 1404.90.90 is exempt for all of them, and note 52(j) exempts bamboo, rattan or broom fibres of Indonesia, Cambodia, Ecuador, Jordan, Malaysia, Taiwan, Bangladesh, Guatemala, El Salvador and Switzerland.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    if c["country"] in ("Mexico", "Canada", "China", "Any other country") and "eo-14389" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].insert(-1, "eo-14389")
    if c["country"] in ("India", "Sri Lanka", "Thailand"):
        c["rule"]["sourceIds"].insert(-1, "cbp-gsp")
    if c["country"] == "Côte d'Ivoire":
        c["rule"]["sourceIds"] = ["ustr-agoa-2026", "crs-agoa", "eo-14389", "hts-now"]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Broomcorn ($4.95/t) is priced as 1,000 t on a $10,000 shipment, which makes its specific rate look higher than 10%. At real "
    "broomcorn prices $4.95/t is far below 10% of value, so EU broomcorn pays 10% in total like the other EU lines.",
    "Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed; no Chapter 14 line is on the "
    "September 29, 2026 import-ban annexes.",
    "Not in the grid: excise tax on cigarette wrappers or tubes of non-pulped vegetable material entered under 1404.90.90.90 "
    "(26 U.S.C. 5701), and admissibility rules — APHIS permits for broomcorn and cotton linters, Lacey Act declarations, and the "
    "hemp THC limit (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) lists "
    "1404.90.90 — the only Chapter 14 code on the general list. Note 52(j) country lists name 1401.10.00 (Malaysia, Cambodia, "
    "Argentina, Bangladesh, Taiwan, Indonesia, Ecuador), 1401.20.20 (Cambodia, Argentina, Indonesia, Ecuador, Jordan), "
    "1401.20.40 (Cambodia, Indonesia, Ecuador, Jordan), 1404.90.30 (Switzerland, Cambodia, Guatemala, El Salvador, Indonesia, "
    "Jordan) and 1404.90.40 (Switzerland, Cambodia, Guatemala, Indonesia, Ecuador, Jordan). Note 50 exempts only religious palm "
    "and myrtus branches (1404.90.90) from the Brazil duty. Note 51(b)(3) puts six Chapter 14 subheadings on the Canada Section "
    "338 list. Note 20 puts eight subheadings on China List 3 and 1401.20.20 and 1404.90.20 on List 4A; no China exclusion names "
    "a Chapter 14 product. No Section 232 heading and no antidumping or countervailing duty order covers a Chapter 14 line."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "ustr-agoa-2026", "crs-agoa", "cbp-gsp", "procl-11062"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Bamboo, Rattan, Cotton Linters, Coco Peat & Hemp (HTS Ch. 14): Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Bamboo, Rattan, Broomcorn, Coco Peat & Hemp: APHIS, Lacey Act & Ways to Lower Duty (HTS Ch. 14) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The USDA, CBP, DEA and TTB rules for each HTS Chapter 14 line — APHIS permits for broomcorn and cotton linters, bamboo and "
    "rice-straw rules, Lacey Act declarations, the hemp THC limit, excise tax on leaf wraps — and the legal ways to pay less: "
    "USMCA, exception lists, FTAs and AGOA, drawback, rulings."
)
te["seo"]["keywords"] = [
    "import bamboo poles USDA",
    "Lacey Act declaration bamboo rattan",
    "broomcorn import permit",
    "cotton linters APHIS",
    "hemp flower import legal",
    "Chapter 14 substantial transformation",
    "Mexico broomcorn tariff",
]
te["intro"] = (
    "Most Chapter 14 goods are raw plant material, so **USDA decides whether a shipment clears**: broomcorn and cotton linters "
    "need APHIS permits and may be fumigated or treated, bamboo poles are regulated wood articles, rice straw is prohibited "
    "without a permit, and bamboo, rattan, willow, broom fibres and tanning materials need a **Lacey Act plant declaration**. "
    "Hemp flower must stay under the federal THC limit, which tightens on December 11, 2026.\n\n"
    "The ways to pay less are in the schedule: claim **USMCA** on Mexican and Canadian plant material (it does not lift Canada's "
    "50% Section 338 duty), check whether the **country's exception list** covers the line, claim **CAFTA-DR, other FTAs or "
    "AGOA** where the base rate is the cost, get a **binding ruling** where the line decides the rate, and claim **drawback** "
    "on re-exports. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on plant material from Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 4.4%)",
        "appliesTo": "All 14 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format. Plants grown and harvested in "
        "Mexico or Canada are wholly obtained; processed goods qualify if they change from any other chapter into headings "
        "1401–1404 (General Note 11).",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on 1401.10, 1401.90, 1404.20, 1404.90.40 and "
        "1404.90.90 (U.S. note 51(a)). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (Chapter 14 rule)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "exception-lists",
        "title": "Source from a country whose exception list covers the line",
        "saves": "The whole 10%–12.5% Section 301 duty",
        "appliesTo": "1404.90.90 from any of the 60 economies (note 52(b)); bamboo, rattan and broom fibres from the countries named "
        "in note 52(j) — e.g. Indonesian, Cambodian or Ecuadorian bamboo and rattan, Swiss or Guatemalan broom fibres",
        "document": "Proof of origin for the country claimed (commercial invoice, certificate of origin, production records) and the "
        "exemption heading (9903.05.86 or the country heading such as 9903.06.16) on the entry line.",
        "caveat": "Origin follows where the goods were grown or substantially transformed; transshipment does not change it. China "
        "is on no exception list and keeps its 2018–2019 Section 301 duties.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b), (j)", "url": CH99},
            {"label": "19 CFR 134.1 (country of origin)", "url": "https://www.ecfr.gov/current/title-19/section-134.1"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 4.4% (willow), 3.2% (other plaiting materials), 2.3% (broom fibres), 2% (split rattan), 0.5¢/kg or $4.95/t",
        "appliesTo": "The six dutiable lines, for goods of CAFTA-DR, Australia, Chile, Colombia, Peru, Panama, Korea, Israel, Jordan, "
        "Morocco, Bahrain, Oman, Singapore, CBERA countries and AGOA countries (through December 31, 2026)",
        "document": "Proof of origin under the agreement and the SPI on the entry line (P, AU, CL, CO, …, E for CBERA, D for AGOA).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)). GSP (A, A*, A+) has been expired since "
        "December 31, 2020, so a GSP claim pays the general rate.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the line decides the rate: raw plaiting material (1401) vs. basketwork (4602), coir pith (1404.90.90, "
        "Free, Section 301-exempt) vs. coir fibre (5305), hemp flower (1404.90.90) vs. true hemp fibre (5302)",
        "appliesTo": "Any line where classification is in doubt — especially the 1404.90.90 basket provision",
        "document": "A ruling request to CBP describing the product, its processing and its use (19 CFR part 177). Published rulings "
        "such as N241191 (coco peat), N262445 (henna leaves), N318904 (bamboo stakes) and H334131 (hemp flower) show how CBP decides.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
            {"label": "CBP ruling H334131 (dried hemp flower, 1404.90.90)", "url": "https://rulings.cbp.gov/ruling/H334131"},
            {"label": "HTSUS Chapter 14 notes", "url": CH14},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods, or what they are made into, are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported materials re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": "https://www.ecfr.gov/current/title-19/part-190"}],
    },
]
te["rules"] = [
    {
        "id": "lacey", "agency": "USDA APHIS",
        "title": "Lacey Act plant declaration (genus, species, country of harvest, quantity, value) for heading 1401, 1404.90.30, 1404.90.40 and 1404.90.90.20/.40 — Phase VII, from December 1, 2024",
        "citations": [
            {"label": "16 U.S.C. 3372(f)", "url": "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title16-section3372&num=0&edition=prelim"},
            {"label": "89 FR 47122 (Phase VII)", "url": "https://www.federalregister.gov/documents/2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions"},
            {"label": "APHIS Lacey Act page", "url": "https://www.aphis.usda.gov/plant-imports/lacey-act"},
        ],
    },
    {
        "id": "aphis-bamboo", "agency": "USDA APHIS",
        "title": "Bamboo poles and garden stakes are regulated wood articles; sawn or split, dried bamboo free of leaves and seeds enters under a general permit subject to inspection",
        "citations": [
            {"label": "7 CFR 319.40-1", "url": "https://www.ecfr.gov/current/title-7/section-319.40-1"},
            {"label": "7 CFR 319.40-3(d)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-3"},
            {"label": "7 CFR 319.40-9", "url": "https://www.ecfr.gov/current/title-7/section-319.40-9"},
        ],
    },
    {
        "id": "aphis-broomcorn", "agency": "USDA APHIS",
        "title": "Broomcorn and other corn and sorghum plant parts: import permit, baled to prevent scattering, inspection and treatment as the inspector requires (European corn borer quarantine)",
        "citations": [
            {"label": "7 CFR 319.41", "url": "https://www.ecfr.gov/current/title-7/section-319.41"},
            {"label": "7 CFR 319.41-1", "url": "https://www.ecfr.gov/current/title-7/section-319.41-1"},
            {"label": "7 CFR 319.41-5", "url": "https://www.ecfr.gov/current/title-7/section-319.41-5"},
        ],
    },
    {
        "id": "aphis-cotton", "agency": "USDA APHIS",
        "title": "Cotton linters: entry under the foreign cotton quarantine — vacuum fumigation or movement to an approved mill unless processed (bleached, dyed) so no seed or insect life remains",
        "citations": [
            {"label": "7 CFR 319.8", "url": "https://www.ecfr.gov/current/title-7/section-319.8"},
            {"label": "7 CFR 319.8-7", "url": "https://www.ecfr.gov/current/title-7/section-319.8-7"},
            {"label": "7 CFR 319.8-8", "url": "https://www.ecfr.gov/current/title-7/section-319.8-8"},
        ],
    },
    {
        "id": "aphis-straw", "agency": "USDA APHIS",
        "title": "Rice straw and rice hulls are prohibited from all foreign locations unless APHIS authorizes them under a controlled import permit",
        "citations": [{"label": "7 CFR 319.55", "url": "https://www.ecfr.gov/current/title-7/section-319.55"}],
    },
    {
        "id": "hemp", "agency": "DEA / USDA",
        "title": "Hemp flower and biomass must meet the federal hemp definition (not more than 0.3% delta-9 THC today; total THC incl. THCA from December 11, 2026) or they are marijuana, a controlled substance",
        "citations": [
            {"label": "7 U.S.C. 1639o", "url": "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title7-section1639o&num=0&edition=prelim"},
            {"label": "21 U.S.C. 802(16)", "url": "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title21-section802&num=0&edition=prelim"},
            {"label": "P.L. 119-37, sec. 781", "url": "https://www.congress.gov/119/plaws/publ37/PLAW-119publ37.pdf"},
            {"label": "P.L. 119-103, sec. 2019", "url": "https://www.congress.gov/119/plaws/publ103/PLAW-119publ103.pdf"},
        ],
    },
    {
        "id": "ttb-excise", "agency": "TTB",
        "title": "Cigarette wrappers or tubes of non-pulped vegetable material (1404.90.90.90) may owe federal excise tax: $0.0315 per 50 papers, $0.0630 per 50 tubes (not in the duty grid)",
        "citations": [
            {"label": "26 U.S.C. 5701", "url": "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title26-section5701&num=0&edition=prelim"},
            {"label": "27 CFR 41.34", "url": "https://www.ecfr.gov/current/title-27/section-41.34"},
            {"label": "27 CFR 41.35", "url": "https://www.ecfr.gov/current/title-27/section-41.35"},
        ],
    },
    {
        "id": "fda-henna", "agency": "FDA",
        "title": "Henna sold as a color additive is approved only for coloring hair, not skin",
        "citations": [{"label": "21 CFR 73.2190", "url": "https://www.ecfr.gov/current/title-21/section-73.2190"}],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on the article or its container (bamboo poles are on the J-list, but their outermost container must be marked)",
        "citations": [
            {"label": "19 CFR part 134", "url": "https://www.ecfr.gov/current/title-19/part-134"},
            {"label": "19 CFR 134.33 (J-list)", "url": "https://www.ecfr.gov/current/title-19/section-134.33"},
        ],
    },
    {
        "id": "aphis-packaging", "agency": "USDA APHIS",
        "title": "Wood pallets and crates must be ISPM 15 treated and marked",
        "citations": [{"label": "7 CFR 319.40-3", "url": "https://www.ecfr.gov/current/title-7/section-319.40-3"}],
    },
]
GROUP_NOTES = {
    "1401": "Bamboo, rattan, willow and other plaiting materials all need a Lacey Act declaration. Bamboo poles and stakes clear APHIS as regulated wood articles; rice straw needs a controlled import permit.",
    "1404": "Broomcorn and cotton linters need APHIS permits and may be treated. Istle, broom fibres and dyeing or tanning materials need a Lacey Act declaration. Hemp flower and biomass (1404.90.90) must meet the THC limit.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    if h == "1401":
        g["ruleIds"] = ["lacey", "aphis-bamboo", "aphis-straw", "cbp-marking", "aphis-packaging"]
    else:
        g["ruleIds"] = ["aphis-cotton", "aphis-broomcorn", "lacey", "hemp", "ttb-excise", "fda-henna", "cbp-marking", "aphis-packaging"]
LACEY = ("1401.", "1404.90.30", "1404.90.40", "1404.90.90.20", "1404.90.90.40")
EXCEPTION_LINES = ("1401.10", "1401.20", "1404.90.30", "1404.90.40", "1404.90.90")
for ln in te["lines"]:
    hts = ln["hts"]
    ids = []
    if hts.startswith(LACEY):
        ids.append("lacey")
    if hts.startswith("1401.10"):
        ids.append("aphis-bamboo")
    if hts.startswith("1401.90.40"):
        ids.append("aphis-straw")
    if hts.startswith("1404.20"):
        ids.append("aphis-cotton")
    if hts.startswith("1404.90.20"):
        ids.append("aphis-broomcorn")
    if hts == "1404.90.90.90":
        ids += ["hemp", "ttb-excise"]
    if hts == "1404.90.90.40":
        ids.append("fda-henna")
    ids += ["cbp-marking", "aphis-packaging"]
    ln["ruleIds"] = ids
    levers = ["usmca"]
    if hts.startswith(EXCEPTION_LINES):
        levers.append("exception-lists")
    if ln.get("general") and ln["general"] != "Free":
        levers.append("fta")
    levers += ["ruling", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. APHIS permits, Lacey Act "
    "requirements and the hemp definition change; check them before each shipment."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 14 FAQ: Bamboo, Rattan, Coco Peat, Cotton Linters & Hemp Import Duties"
fc["seo"]["title"] = "HTS Chapter 14 FAQ 2026: HS Codes for Bamboo, Rattan, Coco Peat, Cotton Linters, Henna & Hemp Flower | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about Chapter 14 imports: HS codes 1401 and 1404.90, bamboo, rattan, coco peat and coir "
    "pith, cotton linters, henna, raffia and hemp flower, and the 2026 tariffs from China, Mexico, India and Canada."
)
fc["seo"]["keywords"] = [
    "hs code 1404.90",
    "hs code 1401",
    "hs code for bamboo",
    "hs code for rattan",
    "hs code for coco peat",
    "coco pith hs code",
    "hs code for cotton linters",
    "hs code for henna",
    "hs code for raffia",
    "vegetable plaiting materials meaning",
    "section 301 tariffs on raw bamboos",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing bamboo, rattan, coco peat, cotton linters, broom fibres, "
    "henna and hemp into the U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 14 base rates are low — Free on 8 of 14 lines, 4.4% at most — and unchanged since January 2025. The extra duty by country decides the cost.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff, but all of 1404.90.90 (coco peat, henna, hemp, other vegetable products) is exempt, and Indonesia, Cambodia, Ecuador and others have exception lists for bamboo, rattan and broom fibres.",
    "China pays up to 37.5% extra (25% List 3 + 12.5%); Brazil 37.5%; Canada 50% under Section 338 on six subheadings, even with a USMCA claim.",
    "USMCA-qualifying plant material from Mexico — 49% of 2025 imports — enters free. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Entry rules matter more than duty for several lines: Lacey Act declarations, APHIS permits for broomcorn and cotton linters, and the hemp THC limit that tightens on December 11, 2026.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "what-is-ch14",
        "question": "What are vegetable plaiting materials (HTS Chapter 14)?",
        "searchedAs": ["vegetable plaiting materials", "vegetable plaiting materials meaning", "plaiting materials meaning", "vegetable plaiting materials vegetable products", "straw and plaiting materials"],
        "answer": "Raw plant materials used mainly for weaving and basketry — bamboo, rattan, reeds, rushes, willow (osier), raffia, cleaned or dyed cereal straw and lime bark — classified in heading 1401. Chapter 14 also holds heading 1404, vegetable products not elsewhere specified: cotton linters, vegetable hair, broomcorn, istle and other broom fibres, dyeing and tanning materials and a catch-all line. Textile fibres such as coir or hemp fibre are in section XI, and baskets made from plaiting materials are heading 4602.",
        "link": "",
    },
    {
        "id": "hs-1404-90",
        "question": "What does HS code 1404.90 cover?",
        "searchedAs": ["hs code 1404.90", "hs code 1404", "hs code 14049", "hts 1404"],
        "answer": "Vegetable products not elsewhere specified other than cotton linters: 1404.90.10 vegetable hair (0.5¢/kg), 1404.90.20 broomcorn ($4.95/t), 1404.90.30 istle (Free), 1404.90.40 other broom and brush fibres (2.3%) and the Free basket line 1404.90.90 (dyeing and tanning materials and other products). 1404.90 was 91% of Chapter 14 imports in 2025 ($203M). All of 1404.90.90 is exempt from the 2026 Section 301 duty.",
        "link": "",
    },
    {
        "id": "hs-bamboo",
        "question": "What is the HS code for bamboo, and what is the tariff?",
        "searchedAs": ["hs code for bamboo", "hs code 1401.10", "bamboo tariff code", "bamboo tariff", "hs code for bamboo stick"],
        "answer": "Raw bamboo — whole, split, cut to length, polished or dyed, including poles and garden stakes — is 1401.10.00.00, Free at the general rate. Bamboo from China pays 37.5% (25% List 3 + 12.5%); from Indonesia, Cambodia, Ecuador, Malaysia, Taiwan, Bangladesh or Argentina it pays nothing extra (exception lists); from most other Section 301 economies 10% or 12.5%; from Canada 50%. Finished bamboo articles such as baskets are classified elsewhere (basketwork is heading 4602).",
        "link": "industry-areas",
    },
    {
        "id": "china-bamboo",
        "question": "What Section 301 tariffs apply to raw bamboo and rattan from China?",
        "searchedAs": ["section 301 tariffs on raw bamboos", "bamboo import from china", "china section 301 tariffs on raw bamboos"],
        "answer": "Bamboo (1401.10.00), willow and other plaiting materials are on List 3 (+25%, 9903.88.03); rough rattan is on List 4A (+7.5%, 9903.88.15); split rattan (1401.20.40) is on no China list. The 2026 Section 301 action adds +12.5% (9903.05.31). Totals: bamboo 37.5%, willow 41.9%, rough rattan 20%, split rattan 14.5%. USTR confirmed on October 7, 2026 that the 2018 actions continue.",
        "link": "tariff-updates",
    },
    {
        "id": "hs-rattan",
        "question": "What is the HS code for rattan?",
        "searchedAs": ["hs code for rattan", "rattan import", "rattan imports"],
        "answer": "Raw rattan is 1401.20: 1401.20.20 for rattan in the rough or cut transversely into sections (Free; .10 for pieces 4 meters or longer) and 1401.20.40 for other rattan, such as cores and split or drawn rattan (2%). Rattan furniture, baskets and bags are not Chapter 14 — they are chapter 94 or heading 4602. Indonesian, Cambodian, Ecuadorian and Jordanian raw rattan is exempt from the 2026 Section 301 duty.",
        "link": "",
    },
    {
        "id": "coco-peat",
        "question": "What is the HS code for coco peat and coir pith?",
        "searchedAs": ["hs code for coco peat", "coco pith hs code", "hs code for coir pith", "hs code coconut peat", "hs code for coco peat block", "coconut husk chips hs code"],
        "answer": "CBP classifies coco peat (coir pith), coco peat blocks and coconut husk chips in 1404.90.90.90, Free (rulings N241191, N250256, N270127). Coir fibre itself is 5305 and coir mats or rope are other chapters. 1404.90.90 is on the Section 301 general exemption list, so coco peat from India and Sri Lanka enters free; from Canada it pays the 50% Section 338 duty.",
        "link": "",
    },
    {
        "id": "coco-peat-us",
        "question": "Does the U.S. import coco peat, and from where?",
        "searchedAs": ["coco peat importers in usa", "coco coir importers", "coconut coir importing countries"],
        "answer": "Yes, inside the 1404.90 catch-all. UN Comtrade does not split 1404.90 further, but India ($31M) and Sri Lanka ($9M) — the suppliers named in CBP's coco peat rulings — shipped almost all their Chapter 14 goods under heading 1404 in 2025, both up 52% from 2024. Imports need country-of-origin marking; any wood pallets must be ISPM 15 treated.",
        "link": "understand-industry",
    },
    {
        "id": "cotton-linters",
        "question": "What is the HS code and import duty for cotton linters?",
        "searchedAs": ["hs code for cotton linters", "cotton linters import duty", "hs code for cotton linter pulp"],
        "answer": "Cotton linters are 1404.20.00.00, Free at the general rate; cotton linters pulp is a separate product, 4706.10.00.00. Linters pay the country's Section 301 rate (10% India, 12.5% Türkiye), 37.5% from China and 50–60% from Canada. APHIS requires vacuum fumigation or movement to an approved mill unless the linters were processed so that no seed or insect life remains (7 CFR 319.8-7, 319.8-8). U.S. imports jumped from $0.8M to $3.5M in 2025.",
        "link": "tariff-engineering",
    },
    {
        "id": "henna",
        "question": "What is the HS code for henna?",
        "searchedAs": ["hs code for henna", "hs code for henna powder", "hs code for natural henna powder"],
        "answer": "Dried henna leaves are 1404.90.90.40 (raw vegetable materials used primarily in dyeing), Free and exempt from the 2026 Section 301 duty (CBP ruling N262445). Prepared henna hair dyes and mixes can be classified elsewhere — CBP put one henna powder product in 3212.90 (ruling B85634) — so get a ruling for blended products. FDA approves henna as a color additive only for hair, not skin (21 CFR 73.2190).",
        "link": "tariff-engineering",
    },
    {
        "id": "raffia-willow",
        "question": "What are the HS codes for raffia, willow and seagrass?",
        "searchedAs": ["hs code for raffia", "hs code for willow baskets", "seagrass h.s.code", "hs code 1401.90"],
        "answer": "Raw willow (osier) is 1401.90.20 at 4.4%, and other plaiting materials — raffia (CBP ruling N015584), reeds, rushes, straw — are 1401.90.40 at 3.2%. Baskets made from them are heading 4602 (willow baskets 4602.19.12 or .22). From the EU these raw materials pay 10% in total; from China 41.9% (willow) or 40.7%.",
        "link": "",
    },
    {
        "id": "hemp-flower",
        "question": "Can you import hemp flower, and what is its HS code?",
        "searchedAs": ["hemp import", "cbd import", "hemp flower hts"],
        "answer": "CBP classifies dried hemp flower and hemp biomass in 1404.90.90, Free and exempt from the 2026 Section 301 duty (HQ H334131, July 23, 2026). It is importable only if it meets the federal hemp definition: today not more than 0.3% delta-9 THC; from December 11, 2026 (P.L. 119-103) total THC including THCA. Above that it is marijuana, a controlled substance. Hemp fibre is 5302.",
        "link": "tariff-updates",
    },
    {
        "id": "mexico",
        "question": "Are there tariffs on Chapter 14 goods from Mexico?",
        "searchedAs": ["mexico tariff on vegetable plaiting materials", "broom corn", "broom corn for broom making"],
        "answer": "Not on goods that qualify for USMCA — plant material grown in Mexico is originating. USMCA goods pay no base rate and are exempt from Mexico's 10% Section 301 duty (9903.05.94). Without a valid claim, the base rate plus 10% applies, except 1404.90.90 goods, which pay nothing extra either way. The 25% IEEPA duty ended February 24, 2026. Broomcorn also needs an APHIS permit. Mexico supplied $108M, 49% of Chapter 14 imports, in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "canada",
        "question": "Why do Canadian Chapter 14 goods pay 50%?",
        "searchedAs": ["usmca trade exemptions", "are there tariffs on imports from canada"],
        "answer": "Since August 22, 2026 a 50% Section 338 duty (9903.03.14, Proclamation 11048) applies to Canadian bamboo, willow, other plaiting materials, cotton linters, other broom fibres and all of 1404.90.90, and U.S. note 51(a) charges it even when USMCA is claimed. Rattan, vegetable hair, broomcorn and istle are not on that list and enter free under USMCA. No Chapter 14 line is on the September 29, 2026 import bans.",
        "link": "tariff-updates",
    },
    {
        "id": "us-imports",
        "question": "How much does the U.S. import under HTS Chapter 14?",
        "searchedAs": ["bamboo imports", "bamboo importing countries", "rattan imports"],
        "answer": "$222M in 2025, up 10.4% from $201M in 2024. The 1404.90 catch-all was $203M (91%), bamboo $13M (down 22%), cotton linters $3.5M and rattan $1.9M. Mexico supplied 49%, India 14%, China 9% and Sri Lanka 4%.",
        "link": "understand-industry",
    },
]

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
