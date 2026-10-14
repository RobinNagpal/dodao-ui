"""Fill the writer parts of the generated Chapter 05 content file.

usage: python3 fill05.py <generated.json> <out.json>

Re-runnable: regenerate with
  pnpm tariff:generate-chapter --chapter 5 --slug 5-animal-products-nes \
    --title "Products of Animal Origin, Not Elsewhere Specified or Included" \
    --countries CA,CN,AU,BR,TH,MX,NZ,VN,PY,CO,ES --out <scratch>/gen.json --force
then run this script on the output.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import re
import sys

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
W = IU
ch09 = json.load(open(f"{W}/src/tariff-data/chapters/09-coffee-tea-spices.json"))
SRC09 = {s["id"]: s for s in ch09["tariffUpdates"]["sources"]}

TODAY = d["asOf"]
QUESTIONS_DATE = "2026-10-12"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH5 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%205"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
FR = "https://www.federalregister.gov/documents/"


def ecfr(title, sec):
    return f"https://www.ecfr.gov/current/title-{title}/section-{sec}"


def ecfr_part(title, part):
    return f"https://www.ecfr.gov/current/title-{title}/part-{part}"


# ------------------------------------------------------------------ sanity checks on generated data
rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
assert len(leaf) == 38, len(leaf)
assert sum(1 for r in leaf if r["dutiable"]) == 11
assert all(l["status"] == "unchanged" for l in d["tariffUpdates"]["lines"])

# ------------------------------------------------------------------ overview
ov = d["overview"]
ov["seo"] = {
    "title": "HTS Chapter 05 Import Duty & Tariffs 2026: Human Hair, Feathers, Casings, Bovine Semen | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 38 HTS Chapter 05 lines — human hair, pig bristles, natural sausage casings, feathers and down, bones, ivory, coral, glands, bovine semen and other animal products — with General, FTA and Column 2 rates, the 2026 Section 301 duties and Canada's 50% Section 338 duty.",
    "keywords": [
        "HTS Chapter 05",
        "HTS Chapter 05 import duty rates",
        "products of animal origin not elsewhere specified or included tariff",
        "hs code for human hair",
        "hs code for sausage casings",
        "hs code for feathers",
        "bovine semen import duty",
        "pig bristles import duty",
        "natural sausage casings import duty",
        "hs code 0511",
        "china tariff on hts chapter 05",
        "usmca hts chapter 05",
    ],
}
ov["intro"] = (
    "Chapter 05 covers animal products that are not food and are not covered elsewhere: unworked human hair, pig bristles and other brushmaking hair, "
    "guts, bladders and stomachs (including natural sausage casings), feathers and down, bones and horn-cores, ivory, horns and antlers, coral and shells, "
    "glands, bile and musk used to make drugs, and the catch-all heading 0511 for bovine semen, embryos, dried blood, horsehair, natural sponges, "
    "animal-feed ingredients such as krill, and dead animals unfit to eat. Its **38 tariff lines** are mostly **Free**. Only 11 carry a base duty, from "
    "0.8¢/kg on pig bristles to 5.1% on ambergris, castoreum, civet and musk.\n\n"
    "The extra duties by country matter more than the base rates. Since **July 24, 2026** the Section 301 tariffs on 60 economies (10% or 12.5%) reach "
    "**35 of the 38 lines**. Only coral and shells (0508) and animal-feed products (0511.99.30) are on the U.S. note 52(b) exemption list. Brazil pays a "
    "separate 25% on top (37.5% on most lines). China pays 12.5% plus its 2018–2019 Section 301 duty of 25% (List 3) or 7.5% (List 4A). Since "
    "**August 22, 2026** goods of **Canada** pay a **50% Section 338 duty on 20 lines** (feathers and down, bones, horns and antlers, glands, horsehair, "
    "sponges, embryos and other 0511.99 goods) even when they qualify for USMCA. The 2025 IEEPA tariffs ended on February 24, 2026. The U.S. imported "
    "**$1.17B** of Chapter 05 goods in 2025, 63% of it in the 0511.99 catch-all."
)
ov["stats"] = [
    {"label": "Tariff lines", "value": "38"},
    {"label": "Lines with a base-rate duty", "value": "11 of 38"},
    {
        "label": "Lines with an extra duty for some origins",
        "value": "38 of 38",
        "note": "2026 Section 301: 35 (Brazil 37); China lists: 35; Canada Section 338: 20, USMCA or not",
    },
    {"label": "2025 imports", "value": "$1.17B"},
    {"label": "Canada + China share", "value": "27%"},
]

GROUP_TEXT = {
    "0501": (
        "Unworked human hair pays 1.4% (Free with most FTAs). Hair that is dressed, thinned or bleached, and wigs and extensions, are not here: they are in Chapter 67. Switzerland, Cambodia, Indonesia, Ecuador and Jordan are exempt from their Section 301 duty on this line.",
        ["human hair", "raw hair", "hair waste", "unprocessed hair"],
    ),
    "0502": (
        "Pig, hog and boar bristles pay 0.8¢/kg; badger and other brushmaking hair is Free. Pig bristles are not on any active China Section 301 list, so from China they pay only the 12.5% forced-labor duty.",
        ["pig bristles", "hog bristles", "boar bristles", "badger hair", "brush hair"],
    ),
    "0504": (
        "Guts, bladders and stomachs, including natural hog, sheep and beef sausage casings, are Free. Every casing shipment needs a foreign veterinary certificate (9 CFR 96.3).",
        ["sausage casings", "hog casings", "natural casings", "sheep casings", "beef bladders", "tripe for casings"],
    ),
    "0505": (
        "Feathers for stuffing and down are Free; feather meal and feather waste pay 2.3%. From China, feathers and down that meet the ASTM D4522 / IDFB standards (0505.10.00.50, .55) are excluded from the 7.5% List 4A duty through November 9, 2026. Canadian feathers and down pay the 50% Section 338 duty.",
        ["duck down", "goose down", "duck feathers", "goose feathers", "feather meal", "bird skins"],
    ),
    "0506": (
        "Bones, horn-cores, ossein and steamed or ground bone are Free. Canadian bones pay the 50% Section 338 duty (9903.03.13 or 9903.03.14) even with a USMCA claim.",
        ["bones", "bone meal", "ossein", "crushed bone", "horn cores"],
    ),
    "0507": (
        "Ivory, tortoise-shell, whalebone, horns, antlers (including velvet antler), hooves and claws are Free at the base rate. For ivory and whale products the wildlife rules, not the tariff, decide whether they can be imported at all.",
        ["ivory", "velvet antler", "deer antlers", "horns", "hooves", "tortoise shell"],
    ),
    "0508": (
        "Coral, mollusc and crustacean shells and cuttlebone are Free and on the U.S. note 52(b) exemption list, so only China (25%, List 3) pays an extra duty. Many corals are CITES-listed.",
        ["coral", "sea shells", "seashells", "cuttlebone", "oyster shells", "shell powder"],
    ),
    "0510": (
        "Ambergris, castoreum, civet and musk pay 5.1%; pancreas glands, bile and other glands and organs for making drugs are Free. Switzerland, Cambodia, Argentina, Indonesia, Ecuador and Jordan are exempt from their Section 301 duty on the glands and bile line (0510.00.40).",
        ["pancreas glands", "bile", "ox bile", "musk", "castoreum", "ambergris"],
    ),
    "0511": (
        "Bovine semen, dead fish and fish waste, hide parings, animal-feed ingredients, horsehair, natural sponges (3%) and other animal products such as embryos, dried blood and other semen (1.1%). Animal-feed products (0511.99.30), including Antarctic krill, are exempt from the 2026 Section 301 duty except Brazil's and China's 25%.",
        ["bovine semen", "bull semen", "cattle embryos", "dried blood", "krill meal", "pet food ingredients", "horsehair", "natural sponges"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = GROUP_TEXT[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Dairy bull semen from Canada",
        "line": "0511.10.00.10",
        "body": "Bovine semen is Free and is not on the Section 338 lists. With a USMCA claim (SPI S) the 10% Section 301 duty is lifted (9903.05.93), so a $100,000 shipment pays **$0**. Without the claim it pays 10% (9903.05.29): **$10,000**. Canada supplied $40.6M of the $44.3M of bovine semen the U.S. imported in 2025. An APHIS import permit or Canadian health certificate is still needed (9 CFR 98.34, 98.36).",
    },
    {
        "title": "Cattle embryos or other semen from Canada",
        "line": "0511.99.40.24",
        "body": "The base rate is 1.1%, Free with USMCA. But 0511.99.40 is on the Section 338 list in U.S. note 51(b)(3), and the 50% duty (9903.03.14) applies even to USMCA-qualifying goods. A $100,000 shipment pays **$50,000** with a USMCA claim and $61,100 without it (1.1% + 10% + 50%).",
    },
    {
        "title": "Down from China that meets the IDFB standard",
        "line": "0505.10.00.55",
        "body": "Down is Free at the base rate. China's 7.5% List 4A duty does not apply to this line until the exclusion in heading 9903.88.69 ends on November 9, 2026, so today a $100,000 shipment pays only the 12.5% forced-labor Section 301 duty (9903.05.31): **$12,500**. From November 10, 2026, unless USTR extends the exclusion, it pays **$20,000**. Down that does not meet the standard (0505.10.00.65) already pays 20%.",
    },
    {
        "title": "Hog casings from Spain",
        "line": "0504.00.00.20",
        "body": "Casings are Free at the base rate. EU goods pay the higher of the base rate or 10% under 9903.05.39, so a $50,000 shipment pays **$5,000**. Each shipment needs a Spanish government veterinary certificate (9 CFR 96.3); swine casings from regions with African swine fever are restricted (9 CFR 96.2).",
    },
    {
        "title": "Pet-food ingredients from Thailand",
        "line": "0511.99.30.60",
        "body": "Products chiefly used as animal feed are Free and on the U.S. note 52(b) exemption list (9903.05.86), so Thailand's 12.5% Section 301 duty does not apply: **$0** on a $100,000 shipment. The same goods from Brazil pay 25% (9903.05.01) and from China 25% (List 3, 9903.88.03), because those duties are not covered by note 52(b).",
    },
]

ov["tradeSnapshot"]["effectiveDutyRateNote"] = (
    "Duty-collected figures aren't available from an official source yet. 27 of the 38 lines are Free at the base rate, so most duty on Chapter 05 goods now comes from the Section 301 and Section 338 duties."
)
ov["tradeSnapshot"]["biggestLines"] = [
    {"hts": "0511.99", "label": "Other animal products n.e.s. (feed ingredients, embryos, dried blood, horsehair, sponges)"},
    {"hts": "0511.91", "label": "Products of fish or aquatic invertebrates; dead fish unfit to eat"},
]
ov["tradeSnapshot"]["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ov["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover: (a) edible products, other than guts, bladders and stomachs of animals and animal blood; (b) hides or skins (Chapters 41 and 43), "
        "other than goods of heading 0505 and parings and similar waste of raw hides or skins of heading 0511; (c) animal textile materials other than horsehair and horsehair waste (Section XI); "
        "or (d) prepared knots or tufts for broom or brush making (heading 9603).\n\n"
        "**Note 2.** For heading 0501, sorting hair by length (as long as root ends and tip ends are not arranged together) does not count as working.\n\n"
        "**Note 3.** Throughout the tariff schedule, elephant, hippopotamus, walrus, narwhal and wild boar tusks, rhinoceros horns and the teeth of all animals are \"ivory\".\n\n"
        "**Note 4.** \"Horsehair\" means hair of the manes or tails of equine or bovine animals. Heading 0511 covers horsehair and horsehair waste, whether or not put up as a layer."
    ),
    "additionalUsNotes": (
        "**1.** Importing the feathers or skin of any bird, raw or processed, whole or in part, or as part of another article, is prohibited, except for chickens, turkeys, guineas, geese, ducks, "
        "pigeons, ostriches, rheas, English ring-necked pheasants and pea fowl (other than wild birds of those kinds), imports for scientific or educational purposes, fully manufactured artificial "
        "fishing flies, birds under 9804.00.55 and live birds. The note's annual quotas for jungle fowl, mandarin duck and pheasant skins no longer operate: the Interior Department repealed the "
        "quota regulations effective November 16, 1993. Prohibited articles are subject to seizure and forfeiture."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu = d["tariffUpdates"]
tu["seo"] = {
    "title": "HTS Chapter 05 Tariff Updates 2026: Section 301, Canada Section 338 & the End of IEEPA Duties | KoalaGains",
    "shortDescription": "What changed for U.S. tariffs on animal products of HTS Chapter 05 since January 2025: the IEEPA tariffs and their end, the Section 122 surcharge, the 2026 Section 301 duties on 60 economies and Brazil, Canada's 50% Section 338 duty, and China's feather exclusion, with Federal Register citations.",
    "keywords": [
        "hts chapter 05 tariff updates",
        "hts chapter 05 import duty",
        "section 338 canada tariffs",
        "canada 50 tariff usmca",
        "china tariff on hts chapter 05",
        "section 301 animal products",
        "bovine semen tariff",
        "feather and down tariffs china",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** (in force October 9, 2026). "
    "**No Chapter 05 base rate or line changed** between them: all 38 lines carry the same rate.\n\n"
    "The changes were all extra duties by country. In 2025 Chapter 05 goods paid the IEEPA tariffs: the reciprocal tariff (10% or a country rate), 40% more on Brazil, and 25%–35% on "
    "non-USMCA goods of Canada and Mexico. The IEEPA tariffs **ended on February 24, 2026** and a 10% Section 122 surcharge ran until July 23, 2026. Since **July 24, 2026** the Section 301 "
    "tariffs on 60 economies (10% or 12.5%) reach 35 of the 38 lines, and Brazil's own 25% applies from July 22. Since **August 22, 2026** Canada pays a **50% Section 338 duty on 20 lines**, "
    "USMCA or not. China's 2018–2019 Section 301 duties (25% or 7.5%) continue."
)
tu["scope"] = (
    "Measures that reach Chapter 05 from any country: the 2026 Section 301 tariffs on 60 economies and on Brazil, the China Section 301 Lists 3 and 4A with the feather and down exclusion, "
    "Canada's Section 338 duty, the Nicaragua Section 301 duty scheduled for 2027, and the 2025–2026 IEEPA and Section 122 duties that have ended. No antidumping or countervailing duty order "
    "covers a Chapter 05 product. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "38 of 38 lines"},
    {"label": "Exempt from 2026 Section 301", "value": "3 of 38 lines", "note": "0508 coral and shells; 0511.99.30 animal feed"},
    {"label": "Canada Section 338 (50%)", "value": "20 of 38 lines", "note": "Applies to USMCA goods too"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

# sources ---------------------------------------------------------------------------------------------
NEW_SOURCES = [
    {
        "id": "fr-2025-21671",
        "publisher": "Federal Register",
        "citation": "90 FR 55232",
        "document": "Notice (USTR)",
        "title": "Notice of Product Exclusion Extensions: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",
        "signed": None,
        "published": "2025-12-01",
        "url": FR + "2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology",
    },
    {
        "id": "fr-2026-19532",
        "publisher": "Federal Register",
        "citation": "91 FR 60521",
        "document": "Proposed rule (USDA APHIS)",
        "title": "Amendments To Import Requirements for Highly Pathogenic Avian Influenza",
        "signed": None,
        "published": "2026-09-24",
        "url": FR + "2026/09/24/2026-19532/amendments-to-import-requirements-for-highly-pathogenic-avian-influenza",
    },
]
REUSE = [
    "procl-11012",
    "eo-14389",
    "csms-67834313",
    "scotus-24-1287",
    "eo-14357",
    "eo-14326",
    "eo-14323",
    "eo-14257",
    "eo-14325",
    "eo-14194",
    "eo-14193",
    "eo-14195",
    "eo-14228",
    "ustr-usmca-review",
    "ustr-agoa-2026",
]
have = {s["id"] for s in tu["sources"]}
for sid in REUSE:
    if sid not in have:
        tu["sources"].append(SRC09[sid])
        have.add(sid)
for s in NEW_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]
ENDED_IEEPA = "eo-14389"

IN_EFFECT = {
    "ca-section-301": dict(
        now="+50% on 20 of 38 lines, USMCA or not; +10% more without USMCA",
        exemption=(
            "The 50% Section 338 duty applies to the lines in U.S. note 51(b): bones (0506.90, under 9903.03.13) and feathers and down, ossein, horns and antlers, glands and bile, hide parings, "
            "horsehair, sponges and other 0511.99.40 goods (9903.03.14). Note 51(a) charges it even when USMCA or another special rate is claimed. Casings, bovine semen, fish products, "
            "animal-feed products and the other lines are not on the lists. The 10% Section 301 duty (9903.05.29) reaches 35 lines but not USMCA-qualifying goods (9903.05.93), and not coral, "
            "shells or animal-feed products (9903.05.86). The 35% IEEPA duty on non-USMCA Canadian goods ended February 24, 2026."
        ),
        whatItMeans="Canadian bovine semen and hog casings enter free with a USMCA claim; Canadian feathers, bones, embryos and glands pay 50% even with one, and 60% plus the base rate without it.",
        effectiveFrom="2026-08-22",
        effectiveSourceId="procl-11048",
        extra=[ENDED_IEEPA],
    ),
    "cn-section-301": dict(
        now="+37.5% (List 3 lines) or +20% (List 4A lines); +25% on coral and feed products",
        exemption=(
            "List 3 (+25%, 9903.88.03) covers 26 lines, including feather meal, bones, horns and antlers, coral, glands and bile, bovine semen and all of 0511; List 4A (+7.5%, 9903.88.15) "
            "covers human hair, other brushmaking hair, casings, feathers and down, ivory and musk. Pig bristles (0502.10) are only on the suspended List 4B, and down and feathers meeting the "
            "IDFB standard (0505.10.00.50, .55) are excluded from List 4A through November 9, 2026 (9903.88.69). The 12.5% forced-labor duty (9903.05.31) adds to both lists except on coral "
            "and animal-feed products (note 52(b)). The 2025 IEEPA duties on China ended February 24, 2026."
        ),
        whatItMeans="Most Chinese animal products pay 37.5% plus the base rate; casings and down pay 20%; pig bristles 12.5% plus 0.8¢/kg.",
        effectiveFrom="2026-07-24",
        effectiveSourceId="fr-2026-15181",
        extra=["fr-2025-21671", ENDED_IEEPA],
    ),
    "au-section-301": dict(
        now="+12.5% on 35 of 38 lines",
        exemption=(
            "Applies to every Chapter 05 line except coral and shells (0508) and animal-feed products (0511.99.30), which are on the U.S. note 52(b) exemption list (9903.05.86). An Australia FTA "
            "claim (SPI AU) makes the dutiable lines Free at the base rate but does not lift the 12.5% (U.S. note 52(a)). The 10% IEEPA reciprocal duty ended February 24, 2026."
        ),
        whatItMeans="Australian bones, casings and other animal products pay 12.5%; feed ingredients and shells pay nothing.",
        extra=[ENDED_IEEPA],
    ),
    "br-section-301": dict(
        now="+37.5% on 35 of 38 lines; +25% on animal-feed products",
        exemption=(
            "Brazil's 25% (9903.05.01) exempts only coral and shells (0508) under U.S. note 50(a)(ii) (9903.05.03). The 12.5% forced-labor duty (9903.05.27) also skips animal-feed products "
            "(0511.99.30) under note 52(b), so those pay 25%. The 2025 IEEPA duties (10% reciprocal plus 40% under 9903.01.77) applied to every Chapter 05 line from August 6, 2025 and ended "
            "February 24, 2026."
        ),
        whatItMeans="Brazilian animal by-products, Brazil's main Chapter 05 export, pay 25% or 37.5% plus the base rate.",
        extra=[ENDED_IEEPA, "eo-14323"],
    ),
    "th-section-301": dict(
        now="+12.5% on 35 of 38 lines",
        exemption=(
            "Applies to every Chapter 05 line except coral and shells (0508) and animal-feed products (0511.99.30), which are exempt under U.S. note 52(b) (9903.05.86). The 19% IEEPA reciprocal "
            "rate on Thailand ended February 24, 2026."
        ),
        whatItMeans="Thai pet-food and feed ingredients in 0511.99.30 enter free; other Thai animal products pay 12.5% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "mx-section-301": dict(
        now="+10% on 35 of 38 lines; none with USMCA",
        exemption=(
            "Applies only to goods that do not qualify for USMCA (9903.05.94 exempts those) and not to coral, shells or animal-feed products (9903.05.86). The 25% IEEPA duty on non-USMCA Mexican "
            "goods ended February 24, 2026. Mexico is not subject to a Section 338 duty."
        ),
        whatItMeans="Mexican animal products enter free with a USMCA claim; without one they pay 10% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "nz-section-301": dict(
        now="+12.5% on 35 of 38 lines",
        exemption=(
            "Applies to every Chapter 05 line except coral and shells (0508) and animal-feed products (0511.99.30), exempt under U.S. note 52(b) (9903.05.86). New Zealand has no FTA with the "
            "United States. The 15% IEEPA reciprocal rate ended February 24, 2026."
        ),
        whatItMeans="New Zealand glands, casings and velvet antler pay 12.5% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "vn-section-301": dict(
        now="+12.5% on 35 of 38 lines",
        exemption=(
            "Applies to every Chapter 05 line except coral and shells (0508) and animal-feed products (0511.99.30), exempt under U.S. note 52(b) (9903.05.86). Feathers and down from Vietnam have no "
            "exclusion. The 20% IEEPA reciprocal rate on Vietnam ended February 24, 2026."
        ),
        whatItMeans="Vietnamese duck and goose down pays 12.5%, less than Chinese down once China's exclusion ends.",
        extra=[ENDED_IEEPA],
    ),
    "co-section-301": dict(
        now="+12.5% on 35 of 38 lines",
        exemption=(
            "Applies to every Chapter 05 line except coral and shells (0508) and animal-feed products (0511.99.30), exempt under U.S. note 52(b) (9903.05.86). A Colombia TPA claim (SPI CO) "
            "removes the base rate on the dutiable lines but not the 12.5% (note 52(a)). The 10% IEEPA reciprocal duty ended February 24, 2026."
        ),
        whatItMeans="Colombian animal-feed ingredients enter free; other lines pay 12.5%.",
        extra=[ENDED_IEEPA],
    ),
    "eu-section-301": dict(
        now="10% (in place of a lower base rate) on 35 of 38 lines",
        exemption=(
            "EU goods pay the higher of the base rate or 10% (9903.05.39). Coral, shells and animal-feed products are exempt (9903.05.86). Because every Chapter 05 base rate is below 10%, the "
            "duty is 10% on all other lines. The 2025 IEEPA rate on EU goods ended February 24, 2026."
        ),
        whatItMeans="Spanish, Portuguese and Dutch hog casings pay 10%; Hungarian and German down pays 10%.",
        extra=[ENDED_IEEPA],
    ),
    "other-section-301": dict(
        now="+10% or +12.5% (or a 10%–12.5% floor) on 35 of 38 lines",
        exemption=(
            "Applies to every Chapter 05 line except coral and shells (0508) and animal-feed products (0511.99.30), exempt under U.S. note 52(b) (9903.05.86). Country lists in U.S. note 52(j) "
            "also exempt human hair (0501) and glands and bile (0510.00.40) for Switzerland, Cambodia, Indonesia, Ecuador and Jordan, and glands and bile for Argentina. Countries outside the 60 "
            "economies, such as Paraguay, Iceland and Bolivia, pay only the base rate. From January 1, 2027 Nicaraguan goods not entered under CAFTA-DR also pay 10% under 9903.89.01."
        ),
        whatItMeans="Outside Canada, China and Brazil, the 2026 Section 301 rate of the country is usually the whole extra duty.",
        extra=["fr-2025-22690", "fr-2025-23892"],
    ),
}
for e in tu["inEffect"]:
    spec = IN_EFFECT[e["id"]]
    e["now"] = spec["now"]
    e["exemption"] = spec["exemption"]
    e["whatItMeans"] = spec["whatItMeans"]
    if "effectiveFrom" in spec:
        e["effectiveFrom"] = spec["effectiveFrom"]
        e["effectiveSourceId"] = spec["effectiveSourceId"]
    ids = list(e["sourceIds"])
    for x in spec.get("extra", []):
        if x not in ids:
            ids.insert(len(ids) - 1, x)
    e["sourceIds"] = ids
    assert e["effectiveSourceId"] in e["sourceIds"]

CHANGES = [
    {
        "id": "base-rates",
        "type": "baseRate",
        "date": TODAY,
        "dateLabel": "Checked",
        "title": "No Chapter 05 base-rate changes",
        "detail": "All 38 Chapter 05 lines carry the same general rate and the same statistical suffix in the 2026 Revision 21 as in the 2025 Basic Edition. No line was added, removed or renumbered.",
        "before": None,
        "now": None,
        "countries": None,
        "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continue",
        "type": "reference",
        "date": "2026-10-07",
        "dateLabel": "Published",
        "title": "China Section 301 Lists 3 and 4A continue",
        "detail": "USTR announced that the China Section 301 actions continue during the four-year review. For Chapter 05 this keeps +25% (9903.88.03) on 26 lines and +7.5% (9903.88.15) on 9 lines from China.",
        "before": "+25% / +7.5%",
        "now": "+25% / +7.5%",
        "countries": "China",
        "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "aphis-hpai-proposed",
        "type": "pending",
        "date": "2026-09-24",
        "dateLabel": "Published",
        "title": "APHIS proposes shorter HPAI waiting period for avian commodities",
        "detail": "USDA APHIS proposed to cut from 90 to 28 days the period before export during which live birds and other avian commodities may not have been exposed to highly pathogenic avian influenza or come from a quarantined premises (9 CFR parts 93 and 94). Comments close November 23, 2026. It would change entry conditions, not duty rates, for bird products such as feathers and bird skins.",
        "before": "90 days",
        "now": "28 days (proposed)",
        "countries": "All",
        "sourceIds": ["fr-2026-19532"],
    },
    {
        "id": "ca-338-scope",
        "type": "reference",
        "date": "2026-09-15",
        "dateLabel": "Effective",
        "title": "Canada Section 338 list modified; Chapter 05 lines unchanged",
        "detail": "Proclamation 11065 changed the product list of heading 9903.03.14 and made the duty apply on top of Section 232 duties. No Chapter 05 line was added or removed.",
        "before": None,
        "now": None,
        "countries": "Canada",
        "sourceIds": ["procl-11065", "csms-69851916", "hts-now"],
    },
    {
        "id": "section-338-canada-2026-08-22",
        "type": "extraDuty",
        "date": "2026-08-22",
        "dateLabel": "Effective",
        "title": "50% Section 338 duty on 20 Chapter 05 lines from Canada",
        "detail": "Proclamations 11047 (dairy list, 9903.03.13) and 11048 (motor-vehicle list, 9903.03.14), signed July 20, 2026, added 50% on listed products of Canada; Proclamation 11056 moved the start to August 22. The lists name bones (0506.90), feathers and down (0505.10), ossein (0506.10), horns and antlers (0507.90), glands and bile (0510.00.40), hide parings (0511.99.20), horsehair (0511.99.33), sponges (0511.99.36) and embryos, dried blood and other products (0511.99.40). The duty applies even to USMCA-qualifying goods.",
        "before": None,
        "now": "+50% (20 of 38 lines)",
        "countries": "Canada",
        "sourceIds": ["procl-11047", "procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "section-301-2026-60-economies-2026-07-24",
        "type": "extraDuty",
        "date": "2026-07-24",
        "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies; coral, shells and feed products exempt",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), including Canada, China, Australia, Brazil, Thailand, Mexico, New Zealand, Vietnam, Colombia and the EU (a 10% floor). U.S. note 52(b) (9903.05.86) exempts coral and shells (0508) and animal-feed products (0511.99.30); note 52(j) country lists exempt human hair and glands for a few countries. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).",
        "before": None,
        "now": "+10% / +12.5% (35 of 38 lines)",
        "countries": "60 economies",
        "sourceIds": ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s122-end",
        "type": "extraDuty",
        "date": "2026-07-23",
        "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10% (37 of 38 lines)",
        "now": "None",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "section-301-brazil-2026-07-22",
        "type": "extraDuty",
        "date": "2026-07-22",
        "dateLabel": "Effective",
        "title": "25% Section 301 tariff on products of Brazil",
        "detail": "USTR imposed 25% on all products of Brazil (9903.05.01). Its exemption list (U.S. note 50(a)(ii), 9903.05.03) covers only coral and shells (0508) in Chapter 05. From July 24 Brazil also pays the 12.5% forced-labor duty (9903.05.27) on 35 lines.",
        "before": None,
        "now": "+25% (37 of 38 lines)",
        "countries": "Brazil",
        "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review",
        "type": "reference",
        "date": "2026-07-01",
        "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None,
        "now": None,
        "countries": "Canada, Mexico",
        "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. In Chapter 05 only coral and shells (0508) were on its exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt.",
        "before": "None",
        "now": "+10% on 37 of 38 lines (until July 23, 2026)",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country",
        "now": "None",
        "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "agoa-renewed",
        "type": "reference",
        "date": "2026-02-03",
        "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "AGOA was renewed retroactively from September 30, 2025, when it had lapsed. AGOA (SPI D) makes the 11 dutiable Chapter 05 lines Free at the base rate for eligible sub-Saharan countries. GSP (SPI A, A+, A*) remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)",
        "now": "In force to December 31, 2026",
        "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "hts-now"],
    },
    {
        "id": "nicaragua-301",
        "type": "pending",
        "date": "2025-12-29",
        "dateLabel": "Published",
        "title": "Nicaragua Section 301 duty scheduled for 2027 and 2028",
        "detail": "USTR set a duty on products of Nicaragua under 9903.89.01: 0% in 2026, +10% from January 1, 2027 and +15% from January 1, 2028. It reaches every Chapter 05 line but applies only to goods not entered under CAFTA-DR (SPI P).",
        "before": None,
        "now": "+10% (2027), +15% (2028)",
        "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-feather-exclusion",
        "type": "reference",
        "date": "2025-12-01",
        "dateLabel": "Published",
        "title": "China exclusion for feathers and down extended to November 9, 2026",
        "detail": "USTR extended the 178 China Section 301 product exclusions through November 9, 2026. They include feathers and down meeting the ASTM D4522 / IDFB standards (0505.10.00.50, 0505.10.00.55), which are excluded from the 7.5% List 4A duty (9903.88.69). Unless USTR extends it again, the 7.5% applies to these lines from November 10, 2026.",
        "before": "Excluded",
        "now": "Excluded through November 9, 2026",
        "countries": "China",
        "sourceIds": ["fr-2025-21671", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-ieepa-cut",
        "type": "extraDuty",
        "date": "2025-11-10",
        "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 05 line on top of the Section 301 duties until it ended on February 24, 2026.",
        "before": "+20%",
        "now": "+10% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14357"],
    },
    {
        "id": "reciprocal-rates",
        "type": "extraDuty",
        "date": "2025-08-07",
        "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates",
        "detail": "Executive Order 14326 replaced the 10% baseline with country rates for listed countries, for example Vietnam +20%, Thailand +19% and New Zealand +15%. Ended February 24, 2026.",
        "before": "+10%",
        "now": "+10% to +41% (ended)",
        "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14326", "hts-now"],
    },
    {
        "id": "br-40",
        "type": "extraDuty",
        "date": "2025-08-06",
        "dateLabel": "Effective",
        "title": "40% duty on products of Brazil",
        "detail": "Executive Order 14323 (signed July 30, 2025) added 40% on products of Brazil (9903.01.77) on top of the 10% reciprocal duty. No Chapter 05 line was on its exemption lists, so Brazilian animal products paid 50% plus the base rate until February 24, 2026.",
        "before": "+10%",
        "now": "+50% (ended)",
        "countries": "Brazil",
        "sourceIds": ["eo-14323", "eo-14389"],
    },
    {
        "id": "reciprocal",
        "type": "extraDuty",
        "date": "2025-04-05",
        "dateLabel": "Effective",
        "title": "Reciprocal tariff reaches Chapter 05",
        "detail": "10% baseline on products of all countries (9903.01.25); Canada and Mexico were excluded. In Chapter 05 only coral and shells (0508) were on the reciprocal-tariff exemption list (U.S. note 2(v)(iii)). The tariff ended February 24, 2026.",
        "before": "None",
        "now": "+10% or more (ended)",
        "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14257", "hts-now"],
    },
    {
        "id": "cn-ieepa",
        "type": "extraDuty",
        "date": "2025-03-04",
        "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top of the 25% or 7.5% Section 301 duty.",
        "before": "+10%",
        "now": "+20% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14195", "eo-14228"],
    },
    {
        "id": "ca-mx-imposed",
        "type": "extraDuty",
        "date": "2025-02-01",
        "dateLabel": "Signed",
        "title": "Additional duties on products of Canada and Mexico",
        "detail": "+25% on non-USMCA goods of Canada (9903.01.10, raised to +35% from August 1, 2025) and Mexico (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.",
        "before": "None",
        "now": "+25% / +35% (ended)",
        "countries": "Canada, Mexico",
        "sourceIds": ["eo-14193", "eo-14194", "eo-14325"],
    },
]
tu["changes"] = CHANGES

# ------------------------------------------------------------------ understandIndustry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 05: Products of Animal Origin, Not Elsewhere Specified or Included — U.S. Import Statistics"
ui["seo"] = {
    "title": "HTS Chapter 05 Import Statistics: Animal Products by Country & Product (2020–2025) | KoalaGains",
    "shortDescription": "U.S. imports of HTS Chapter 05 animal products 2020–2025 by country, product and year: $1.17B in 2025, led by Canada, China, Australia and Brazil — feed ingredients, sausage casings, feathers and down, bones and bovine semen.",
    "keywords": [
        "HTS Chapter 05 import statistics",
        "US imports of animal products by country",
        "sausage casings imports",
        "feather and down imports",
        "bovine semen imports",
        "animal guts trade",
    ],
}
for st in ui["stats"]:
    if st["label"] == "Largest product":
        st["note"] = "Other animal products n.e.s. (0511.99)"
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet. 27 of the 38 Chapter 05 lines are Free at the base rate, so the base-rate duty is small; the Section 301 and Section 338 duties of 2026 are not in these 2025 figures."
ui["why"] = (
    "U.S. imports of Chapter 05 goods fell from **$1.25B in 2024 to $1.17B in 2025** (-6.4%), below the 2022 peak of $1.39B. The catch-all **0511.99** is 63% of the chapter: $745M "
    "of animal-feed ingredients, embryos, dried blood, horsehair, sponges and other products, spread across China ($91M), Brazil ($88M), Australia ($84M), Canada ($70M), Thailand ($65M), "
    "Mexico ($57M), New Zealand ($41M) and Paraguay ($40M). Comtrade reports only six digits, so it does not split feed products (0511.99.30) from the rest.\n\n"
    "The supplier mix shifted in 2025. Imports from **China** fell 30.4% to $131M and from **Brazil** 27.5% to $95M; both paid high IEEPA duties for much of the year (China up to 20% "
    "fentanyl duty plus the reciprocal tariff and Section 301; Brazil 50% from August 6). **Canada** rose 7.2% to $185M and **Australia** 11.0% to $123M.\n\n"
    "Each product has its own leader. **Bovine semen** ($44M) comes almost all from Canada ($41M). **Guts and casings** ($96M) come from Canada ($40M), Spain ($17M), Portugal ($10M) and "
    "the Netherlands ($8M). **Feathers and down** ($94M) come from China ($32M), Vietnam ($28M), Hungary ($11M) and Taiwan ($9M). **Bones** ($47M) are mostly Australian ($29M). Fish "
    "and aquatic products unfit to eat (0511.91, $106M) come from Canada, Argentina, Iceland and Norway. 2025 is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 05 and HS 050510, 050690, 051110, 051191, 051199 by partner (retrieved 2026-10-12)", "url": "https://comtradeplus.un.org/"},
    {
        "label": "Federal Register 90 FR 37739 (Executive Order 14323, 40% duty on products of Brazil)",
        "url": FR + "2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil",
    },
    {
        "label": "Federal Register 90 FR 11463 (Executive Order 14228, 20% duty on products of China)",
        "url": FR + "2025/03/07/2025-03775/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of",
    },
]
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Duty paid is not part of the Comtrade data."

# ------------------------------------------------------------------ industryAreas
ia = d["industryAreas"]
ia["seo"] = {
    "title": "HTS Chapter 05 Tariff Rates by Country: Canada, China, Brazil, Australia, Thailand, Mexico | KoalaGains",
    "shortDescription": "The total U.S. tariff on Chapter 05 animal products by country and product group — base rate plus the 2026 Section 301 duties, Canada's 50% Section 338 duty and China's Section 301 lists, with USMCA and FTA claims applied.",
    "keywords": [
        "united states tariffs on products of animal origin",
        "china tariff on hts 05",
        "canada section 338 tariff animal products",
        "usmca hts 05 exemption",
        "brazil tariff on animal by-products",
        "hts 0504 natural sausage casings tariff",
        "hts 0511 animal genetics tariff",
    ],
}
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. For Chapter 05 the country "
    "decides almost everything, because 27 of the 38 lines are Free at the base rate.\n\n"
    "The 2026 Section 301 tariffs add **10% or 12.5%** on 35 lines for most suppliers; coral and shells (0508) and animal-feed products (0511.99.30) are exempt. **Brazil** pays 37.5% on "
    "most lines and **China** 37.5% (List 3) or 20% (List 4A). **Canada** is different: a USMCA claim removes the Section 301 duty, but the **50% Section 338 duty** stays on 20 lines "
    "(feathers and down, bones, horns and antlers, glands, horsehair, sponges and other 0511.99 goods). Paraguay, outside the 60 economies, pays only the base rate."
)
SHORT = {
    "0501": "Human hair",
    "0502": "Bristles",
    "0504": "Guts & casings",
    "0505": "Feathers & down",
    "0506": "Bones",
    "0507": "Ivory, horns, antlers",
    "0508": "Coral & shells",
    "0510": "Glands, bile, musk",
    "0511": "Other animal products",
}
for g in ia["groups"]:
    g["shortLabel"] = SHORT[g["heading"]]
LABELS = {
    "Canada": "Section 338 (9903.03.13 / 9903.03.14): +50% on 20 of 38 lines, even with a USMCA claim. Without USMCA also +10% Section 301 (9903.05.29) on 35 lines; USMCA-qualifying goods are exempt from that (9903.05.93). Coral, shells and feed products are exempt from the Section 301 duty (9903.05.86).",
    "China": "Base rate +12.5% Section 301 (9903.05.31) on 35 of 38 lines, plus +25% List 3 (9903.88.03) on 26 lines or +7.5% List 4A (9903.88.15) on 9 lines. Pig bristles are on no active China list; IDFB-standard feathers and down are excluded from List 4A through November 9, 2026 (9903.88.69).",
    "Australia": "Base rate +12.5% Section 301 (9903.05.23) on 35 of 38 lines; coral, shells and feed products exempt (9903.05.86). The AU claim removes only the base rate.",
    "Brazil": "Base rate +25% Section 301 (Brazil, 9903.05.01) on 37 of 38 lines (coral and shells exempt, 9903.05.03) +12.5% Section 301 (9903.05.27) on 35 lines (feed products also exempt, 9903.05.86).",
    "Thailand": "Base rate +12.5% Section 301 (9903.05.77) on 35 of 38 lines; coral, shells and feed products exempt (9903.05.86).",
    "Mexico": "USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55) on 35 of 38 lines. No Section 338 duty on Mexico.",
    "New Zealand": "Base rate +12.5% Section 301 (9903.05.57) on 35 of 38 lines; coral, shells and feed products exempt (9903.05.86).",
    "Vietnam": "Base rate +12.5% Section 301 (9903.05.84) on 35 of 38 lines; coral, shells and feed products exempt (9903.05.86).",
    "Paraguay": "Base rate only: Paraguay is not one of the 60 economies in the 2026 Section 301 action and has no other extra duty.",
    "Colombia": "Base rate +12.5% Section 301 (9903.05.32) on 35 of 38 lines; coral, shells and feed products exempt (9903.05.86). The CO claim removes only the base rate.",
    "Spain": "EU rule: 10% in place of the base rate when the base rate is lower (9903.05.39) on 35 of 38 lines; coral, shells and feed products exempt (9903.05.86).",
    "Any other country": "Countries not listed pay the base rate plus their own 2026 Section 301 rate (10% or 12.5%, or a 10% to 12.5% floor) on 35 of 38 lines (9903.05.20–9903.05.83). Countries outside the 60 economies, such as Iceland and Bolivia, pay only the base rate.",
}
for c in ia["countries"]:
    c["rule"]["label"] = LABELS[c["country"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Canada's Section 338 duty (U.S. note 51) is applied on both sides of the Canada row: note 51(a) charges it even when USMCA or another special rate is claimed.",
    "U.S. note 52(b) (9903.05.86) is applied: coral and shells (0508) and animal-feed products (0511.99.30) pay no 2026 Section 301 duty. The country lists in note 52(j) (human hair and glands for Switzerland, Cambodia, Indonesia, Ecuador, Jordan; glands for Argentina) are applied for those countries in the Any other country row.",
    "China's exclusion for IDFB-standard feathers and down (9903.88.69, through November 9, 2026) is applied; the cells will change on November 10, 2026 unless USTR extends it.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "The Nicaragua duty under 9903.89.01 starts January 1, 2027 and is not applied; it does not reach goods entered under CAFTA-DR.",
    "No antidumping or countervailing duty order covers a Chapter 05 product, and no Chapter 05 line refers to a Chapter 98 quota rate, so the grid has none.",
    "The rate is not the only gate: APHIS permits and certificates, the ban on wild-bird feathers (Chapter 05 additional U.S. note 1) and the ivory, CITES and marine-mammal rules can stop a shipment whatever the tariff.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list (note 52(b), 9903.05.86) names 0508.00.00 and "
    "0511.99.30; the country lists in note 52(j) name 0501.00.00 and 0510.00.40 (Switzerland, Cambodia, Indonesia, Ecuador, Jordan) and 0510.00.40 (Argentina). The Brazil list (note 50(a)(ii), "
    "9903.05.03) names only 0508.00.00. China List 3 (note 20(f)) covers 26 Chapter 05 lines and List 4A (note 20(s)) 11; 0502.10 is only on the suspended List 4B (note 20(u)); note "
    "20(vvv)(iv) excludes 0505.10.00.50 and .55 from List 4A. The Canada Section 338 lists (note 51(b)(2) and (b)(3)) name 0505.10, 0506.10, 0506.90, 0507.90, 0510.00.40, 0511.99.20, "
    "0511.99.33, 0511.99.36 and 0511.99.40. The ended Section 122 list (9903.03.03) and reciprocal-tariff list (note 2(v)(iii)) named only 0508.00.00."
)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Animal Products (HTS Ch. 05): APHIS, FWS & CITES Rules, Documents and Legal Ways to Lower Duty | KoalaGains",
    "shortDescription": "The APHIS, FWS, NOAA, FDA and CBP rules for each HTS Chapter 05 line — casing certificates, semen and embryo permits, bone and gland conditions, the wild-bird feather ban, ivory and CITES rules — and the legal ways to pay less: USMCA, the Section 301 exemptions, FTA and AGOA claims, China's feather exclusion, drawback.",
    "keywords": [
        "importing ivory into the us",
        "can you import ivory into the us",
        "importing feathers into united states",
        "bovine semen import permit",
        "sausage casings import requirements",
        "usmca exemption hts chapter 05",
        "animal glands section 301 exclusions",
    ],
}
te["intro"] = (
    "For Chapter 05 the agency rules matter as much as the tariff. **USDA APHIS** controls most lines to keep out foot-and-mouth disease, BSE, African swine fever and avian influenza: casings "
    "need a foreign veterinary certificate, semen and embryos an import permit, and bones, bristles, glands, blood and feed ingredients must meet origin, treatment or establishment conditions. "
    "**FWS** rules apply to wildlife products: a declaration for wildlife, CITES permits for listed species, a near-total ban on African elephant ivory, and the Marine Mammal Protection Act for "
    "whale and walrus products. The schedule itself bans feathers and skins of wild birds.\n\n"
    "To pay less: claim **USMCA** for Canadian and Mexican goods (it does not lift Canada's 50% Section 338 duty), report the **Section 301 exemption** headings for coral, shells and feed products, "
    "claim an FTA or AGOA on the 11 dutiable lines, use China's **feather and down exclusion** while it lasts, and claim drawback on re-exported goods."
)
te["regulationsAsOf"] = "2026-10-08"
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Canada or Mexico",
        "saves": "The 10% Section 301 duty on 35 lines (9903.05.93 for Canada, 9903.05.94 for Mexico) and the base rate on the 11 dutiable lines",
        "appliesTo": "All 38 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in the importer's possession when the claim is made. It need not follow a set format.",
        "caveat": "It does not lift Canada's 50% Section 338 duty on the 20 listed lines (U.S. note 51(a)): Canadian feathers and down, bones, horns and antlers, glands, horsehair, sponges and 0511.99.40 goods pay 50% with or without the claim. USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 51 and 52; 9903.05.93 / 9903.05.94", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": SRC09["ustr-usmca-review"]["url"]},
        ],
    },
    {
        "id": "s301-exempt",
        "title": "Report the Section 301 exemption heading where it applies",
        "saves": "The 2026 Section 301 duty of 10% or 12.5% of value on coral and shells (0508) and animal-feed products (0511.99.30) from every country, Brazil's 25% on coral and shells, and the duty on human hair and glands for the countries with their own lists",
        "appliesTo": "0508.00.00 and 0511.99.30 (note 52(b), 9903.05.86); 0508.00.00 from Brazil (note 50(a)(ii), 9903.05.03); 0501.00.00 and 0510.00.40 from Switzerland (9903.05.98), Cambodia (9903.06.02), Indonesia (9903.06.16), Ecuador (9903.06.18) and Jordan (9903.06.20); 0510.00.40 from Argentina (9903.06.10)",
        "document": "The entry lists the Chapter 99 exemption heading next to the Chapter 05 line.",
        "caveat": "Note 52(b) does not lift Brazil's 25% (9903.05.01) or China's 25% List 3 duty (9903.88.03) on feed products, or Canada's Section 338 duty. Goods must really be chiefly used as animal feed to be classified in 0511.99.30; otherwise they fall in 0511.99.40 (1.1%), which is not exempt.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b) and 52(j)", "url": CH99},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 50(a)(ii) (9903.05.03)", "url": CH99},
            {"label": "91 FR 47318: USTR notice of Section 301 actions on 60 economies (July 28, 2026)", "url": SRC09["fr-2026-15181"]["url"] if "fr-2026-15181" in SRC09 else FR},
        ],
    },
    {
        "id": "fta",
        "title": "Claim a free trade agreement on the dutiable lines",
        "saves": "The base rate on the 11 dutiable lines: 1.4% on human hair, 0.8¢/kg on pig bristles, 2.3% on feather meal, 5.1% on ambergris, castoreum, civet and musk, 3% on natural sponges and 1.1% on embryos, dried blood, other semen and other 0511.99.40 goods",
        "appliesTo": "Goods that originate in a partner country listed in the line's Special column: Australia (AU), Colombia (CO), Chile (CL), Korea (KR), Peru (PE), CAFTA-DR countries (P), Israel, Jordan, Morocco, Bahrain, Oman, Panama and Singapore",
        "document": "A certification of origin (or other information showing the goods originate) held by the importer when the claim is made, with the SPI code on the entry.",
        "caveat": "27 of the 38 lines are already Free, so the claim only matters on the 11 dutiable lines. An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a)). For Nicaragua it matters on every line from January 1, 2027: the 9903.89.01 duty applies only to goods not entered under CAFTA-DR.",
        "citations": [
            {"label": "19 CFR 10.703 (Australia FTA claim)", "url": ecfr(19, "10.703")},
            {"label": "19 CFR 10.3003 (Colombia TPA claim)", "url": ecfr(19, "10.3003")},
            {"label": "19 CFR 10.1003 (Korea FTA claim)", "url": ecfr(19, "10.1003")},
            {"label": "19 CFR 10.583 (CAFTA-DR claim)", "url": ecfr(19, "10.583")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "agoa",
        "title": "Claim AGOA on dutiable goods from eligible African countries",
        "saves": "The base rate on the 11 dutiable lines, all of which list SPI D",
        "appliesTo": "Goods of AGOA beneficiary countries listed in HTSUS General Note 16",
        "document": "The AGOA claim (SPI D) on the entry; the goods must be the growth, product or manufacture of the beneficiary country.",
        "caveat": "AGOA was renewed only through December 31, 2026. GSP (SPI A, A+, A*) has been expired since December 31, 2020, so a GSP code in the Special column gives no benefit.",
        "citations": [
            {"label": "HTSUS General Note 16 (AGOA)", "url": GN},
            {"label": "USTR statement on AGOA reauthorization (February 2026)", "url": SRC09["ustr-agoa-2026"]["url"]},
        ],
    },
    {
        "id": "cn-feather-exclusion",
        "title": "Use China's Section 301 exclusion for standard-grade feathers and down",
        "saves": "The 7.5% List 4A duty (9903.88.15) on Chinese feathers and down that meet ASTM D4522 and the IDFB testing regulations named in the line",
        "appliesTo": "0505.10.00.50 (feathers) and 0505.10.00.55 (down) from China, entered through November 9, 2026",
        "document": "Test results showing the goods meet the standards in the statistical line, and heading 9903.88.69 reported with the Chapter 05 line.",
        "caveat": "The exclusion ends on November 9, 2026 unless USTR extends it again. It does not lift the 12.5% forced-labor duty (9903.05.31). Feathers and down that do not meet the standards (0505.10.00.60, .65) pay 7.5% + 12.5%.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20(vvv)(iv) (9903.88.69)", "url": CH99},
            {"label": "90 FR 55232: USTR extension of 178 exclusions through November 9, 2026", "url": NEW_SOURCES[0]["url"]},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on re-exported goods",
        "saves": "Up to 99% of the duties paid, including the Section 301 and Section 338 duties, when the goods (or products made from them) are exported",
        "appliesTo": "Any line that paid a duty, when the goods are exported or used to make exported goods",
        "document": "A drawback claim filed with CBP, with import and export records that tie the goods together.",
        "caveat": "Only worth it where a duty was actually paid; for Canadian Section 338 goods and Chinese List 3 goods the refund can be large.",
        "citations": [{"label": "19 CFR part 191", "url": ecfr_part(19, 191)}],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the classification decides the rate: feed products (0511.99.30, Free and Section 301-exempt) versus other animal products (0511.99.40, 1.1% and not exempt), unworked versus worked hair, bone or ivory (worked goods leave Chapter 05), and standard-grade versus other down",
        "appliesTo": "Any line where the classification decides the rate",
        "document": "A ruling request to CBP describing the product, its use and how it is processed and packed.",
        "caveat": "Rulings apply to the transaction described; a changed product or process may need its own ruling.",
        "citations": [{"label": "19 CFR part 177", "url": ecfr_part(19, 177)}],
    },
]
te["rules"] = [
    {
        "id": "aphis-casings",
        "agency": "USDA APHIS",
        "title": "Animal casings need a foreign government veterinary certificate; swine casings from African swine fever regions and certain ruminant casings are restricted",
        "citations": [
            {"label": "9 CFR 96.3", "url": ecfr(9, "96.3")},
            {"label": "9 CFR 96.2", "url": ecfr(9, "96.2")},
            {"label": "9 CFR 96.7 (dried bladders, weasands and casings)", "url": ecfr(9, "96.7")},
        ],
    },
    {
        "id": "aphis-stomachs",
        "agency": "USDA APHIS",
        "title": "Stomachs of ruminants or swine not imported as inspected food need APHIS permission",
        "citations": [{"label": "9 CFR 95.30", "url": ecfr(9, "95.30")}],
    },
    {
        "id": "aphis-hair",
        "agency": "USDA APHIS",
        "title": "Hair and bristles of ruminants or swine: free entry if from a region free of foot-and-mouth disease, certified, or scoured, washed or dyed; otherwise handled at an approved establishment. Bloodstained hair is barred.",
        "citations": [
            {"label": "9 CFR 95.18", "url": ecfr(9, "95.18")},
            {"label": "9 CFR 95.19", "url": ecfr(9, "95.19")},
        ],
    },
    {
        "id": "aphis-bones",
        "agency": "USDA APHIS",
        "title": "Bones, horns and hoofs: clean, dry trophies and disinfected hoofs enter freely; others go to an approved establishment. Bone meal must be steamed (20 lb pressure, 1 hour, 121 °C).",
        "citations": [
            {"label": "9 CFR 95.22", "url": ecfr(9, "95.22")},
            {"label": "9 CFR 95.23", "url": ecfr(9, "95.23")},
            {"label": "9 CFR 95.24", "url": ecfr(9, "95.24")},
        ],
    },
    {
        "id": "aphis-glands",
        "agency": "USDA APHIS",
        "title": "Glands, organs and bile of ruminants or swine for drug making: free entry only from regions free of foot-and-mouth disease; otherwise tight containers to an approved establishment. BSE rules and a VS permit apply to ruminant glands.",
        "citations": [
            {"label": "9 CFR 95.28", "url": ecfr(9, "95.28")},
            {"label": "9 CFR 95.29", "url": ecfr(9, "95.29")},
            {"label": "9 CFR 95.4", "url": ecfr(9, "95.4")},
        ],
    },
    {
        "id": "aphis-pap",
        "agency": "USDA APHIS",
        "title": "Processed animal protein (feather meal, blood meal and similar), blood and blood products, offal and feed ingredients: BSE restrictions, a foreign veterinary certificate and a VS permit unless an exception applies",
        "citations": [
            {"label": "9 CFR 95.4", "url": ecfr(9, "95.4")},
            {"label": "9 CFR 95.12 (bovine blood)", "url": ecfr(9, "95.12")},
            {"label": "9 CFR 95.13 / 95.14 (non-ruminant protein)", "url": ecfr(9, "95.13")},
        ],
    },
    {
        "id": "aphis-hides",
        "agency": "USDA APHIS",
        "title": "Hide parings and glue stock: free entry under listed treatments or origin conditions; otherwise handled at an approved establishment",
        "citations": [
            {"label": "9 CFR 95.16", "url": ecfr(9, "95.16")},
            {"label": "9 CFR 95.20", "url": ecfr(9, "95.20")},
            {"label": "9 CFR 95.21", "url": ecfr(9, "95.21")},
        ],
    },
    {
        "id": "aphis-germplasm",
        "agency": "USDA APHIS",
        "title": "Semen and embryos need an APHIS import permit and a health certificate; semen from Canada entering at a listed land border port needs only a declaration and health certificate when the donor animal meets the Canada conditions",
        "citations": [
            {"label": "9 CFR 98.34", "url": ecfr(9, "98.34")},
            {"label": "9 CFR 98.36", "url": ecfr(9, "98.36")},
            {"label": "9 CFR 98.4", "url": ecfr(9, "98.4")},
            {"label": "9 CFR 98.13", "url": ecfr(9, "98.13")},
        ],
    },
    {
        "id": "aphis-birds",
        "agency": "USDA APHIS",
        "title": "Bird trophies and bird carcass parts from regions with Newcastle disease or highly pathogenic avian influenza: entry only under APHIS conditions",
        "citations": [
            {"label": "9 CFR 95.16(c)", "url": ecfr(9, "95.16")},
            {"label": "9 CFR 94.6", "url": ecfr(9, "94.6")},
        ],
    },
    {
        "id": "hts-wild-feathers",
        "agency": "CBP",
        "title": "Feathers and skins of wild birds may not be imported; domesticated chickens, turkeys, guineas, geese, ducks, pigeons, ostriches, rheas, ring-necked pheasants and pea fowl are allowed (Chapter 05 additional U.S. note 1)",
        "citations": [{"label": "HTSUS Ch. 05, Additional U.S. Note 1", "url": CH5}],
    },
    {
        "id": "fws-wildlife",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "Wildlife and wildlife products must be declared to FWS (Form 3-177) and enter through a designated port; commercial importers need an FWS import/export license",
        "citations": [
            {"label": "50 CFR 14.61", "url": ecfr(50, "14.61")},
            {"label": "50 CFR 14.12", "url": ecfr(50, "14.12")},
            {"label": "50 CFR 14.91", "url": ecfr(50, "14.91")},
        ],
    },
    {
        "id": "fws-cites",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "Species listed under CITES (many corals, musk deer, tortoises, rhinoceros, wild birds) need CITES export or import documents",
        "citations": [
            {"label": "50 CFR 23.13", "url": ecfr(50, "23.13")},
            {"label": "50 CFR 23.20", "url": ecfr(50, "23.20")},
        ],
    },
    {
        "id": "fws-ivory",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "African elephant ivory may not be imported except worked ivory in a musical instrument, traveling exhibition, household move or inheritance (acquired before February 26, 1976, with CITES documents), sport-hunted trophies, and ivory for genuine scientific purposes under permit",
        "citations": [
            {"label": "50 CFR 17.40(e)", "url": ecfr(50, "17.40")},
            {"label": "HTSUS Ch. 05, Note 3 (definition of ivory)", "url": CH5},
        ],
    },
    {
        "id": "mmpa",
        "agency": "FWS / NOAA Fisheries",
        "title": "Marine mammal products, such as whalebone and walrus or narwhal ivory, may not be imported except under the Marine Mammal Protection Act exceptions",
        "citations": [
            {"label": "50 CFR 18.12", "url": ecfr(50, "18.12")},
            {"label": "50 CFR 216.12", "url": ecfr(50, "216.12")},
        ],
    },
    {
        "id": "fws-fish-eggs",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "Fish, mollusk and crustacean products and fertilized eggs need an FWS declaration; viable eggs of listed injurious species (walking catfish, snakeheads, zebra mussels, mitten crabs) are barred",
        "citations": [{"label": "50 CFR 16.13", "url": ecfr(50, "16.13")}],
    },
    {
        "id": "noaa-krill",
        "agency": "NOAA Fisheries",
        "title": "Antarctic krill is an Antarctic marine living resource: the importer needs an International Fisheries Trade Permit",
        "citations": [
            {"label": "50 CFR 300.104", "url": ecfr(50, "300.104")},
            {"label": "50 CFR 300.114(b)", "url": ecfr(50, "300.114")},
        ],
    },
    {
        "id": "fda-animal-food",
        "agency": "FDA",
        "title": "Animal food: prior notice before arrival, a registered foreign facility and a Foreign Supplier Verification Program kept by the importer",
        "citations": [
            {"label": "21 CFR 1.279", "url": ecfr(21, "1.279")},
            {"label": "21 CFR 1.225", "url": ecfr(21, "1.225")},
            {"label": "21 CFR 1.502", "url": ecfr(21, "1.502")},
        ],
    },
    {
        "id": "cbp-forced-labor",
        "agency": "CBP",
        "title": "Goods made wholly or in part with forced labor may be detained under a withhold release order or finding",
        "citations": [{"label": "19 CFR 12.42", "url": ecfr(19, "12.42")}],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the goods or their container",
        "citations": [{"label": "19 CFR 134.11", "url": ecfr(19, "134.11")}],
    },
]
COMMON = ["cbp-marking", "cbp-forced-labor"]
GROUP_RULES = {
    "0501": ([], "Unworked human hair has no agency permit. Hair that is dressed or made into wigs and extensions is Chapter 67."),
    "0502": (["aphis-hair"], "Washed, scoured or dyed bristles enter without APHIS restriction (9 CFR 95.18(d))."),
    "0504": (["aphis-casings", "aphis-stomachs"], "Every casing shipment needs the Foreign Official Certificate for Animal Casings."),
    "0505": (["hts-wild-feathers", "aphis-birds", "aphis-pap", "fws-wildlife", "fws-cites"], "Feathers of domesticated ducks, geese and chickens are allowed; wild-bird feathers are banned by the schedule. Feather meal is processed animal protein."),
    "0506": (["aphis-bones"], "Steamed bone meal for feed or fertilizer must meet 9 CFR 95.24; other bones go to an approved establishment unless clean and dry."),
    "0507": (["aphis-bones", "fws-wildlife", "fws-cites", "fws-ivory", "mmpa"], "Under Chapter 05 note 3, tusks of elephant, hippo, walrus, narwhal and wild boar, rhinoceros horn and the teeth of all animals count as ivory."),
    "0508": (["fws-wildlife", "fws-cites"], "Coral and shells are wildlife products: they need an FWS declaration and a designated port unless an exception applies."),
    "0510": (["aphis-glands", "fws-wildlife", "fws-cites"], "Ambergris, castoreum, civet and musk are wildlife products and need FWS clearance; glands and bile of livestock follow APHIS rules."),
    "0511": (["aphis-germplasm", "aphis-pap", "aphis-hides", "aphis-hair", "fda-animal-food", "noaa-krill", "fws-fish-eggs", "fws-wildlife"], "The rules depend on the product: semen and embryos (APHIS permit), feed ingredients (FDA, APHIS), krill (NOAA permit), fish eggs (FWS), horsehair (APHIS), sponges (FWS)."),
}
for g in te["groups"]:
    rules, note = GROUP_RULES[g["heading"]]
    g["ruleIds"] = COMMON + rules
    g["note"] = note


def line_rules(hts):
    h8 = hts[:10]
    r = list(COMMON)
    if hts.startswith("0502"):
        r += ["aphis-hair"]
    elif hts.startswith("0504"):
        r += ["aphis-casings"] + (["aphis-stomachs"] if hts.endswith(".60") else [])
    elif hts.startswith("0505.10"):
        r += ["hts-wild-feathers", "aphis-birds", "fws-wildlife", "fws-cites"]
    elif hts.startswith("0505.90.20"):
        r += ["hts-wild-feathers", "aphis-pap"]
    elif hts.startswith("0505.90.60"):
        r += ["hts-wild-feathers", "aphis-birds", "fws-wildlife", "fws-cites"]
    elif hts.startswith("0506"):
        r += ["aphis-bones"]
    elif hts.startswith("0507.10"):
        r += ["fws-ivory", "mmpa", "fws-cites", "fws-wildlife"]
    elif hts == "0507.90.00.10":
        r += ["aphis-bones", "fws-wildlife", "fws-cites"]
    elif hts.startswith("0507.90"):
        r += ["aphis-bones", "fws-wildlife", "fws-cites", "mmpa"]
    elif hts.startswith("0508"):
        r += ["fws-wildlife", "fws-cites"]
    elif hts.startswith("0510.00.20"):
        r += ["fws-wildlife", "fws-cites"]
    elif hts.startswith("0510.00.40"):
        r += ["aphis-glands"]
    elif hts.startswith("0511.10"):
        r += ["aphis-germplasm"]
    elif hts.startswith("0511.91"):
        r += ["fws-fish-eggs", "fws-wildlife"] if hts.endswith(".10") else ["fws-wildlife"]
    elif hts.startswith("0511.99.20"):
        r += ["aphis-hides"]
    elif hts == "0511.99.30.30":
        r += ["fda-animal-food", "noaa-krill"]
    elif hts.startswith("0511.99.30"):
        r += ["fda-animal-food", "aphis-pap"]
    elif hts.startswith("0511.99.33"):
        r += ["aphis-hair"]
    elif hts.startswith("0511.99.36"):
        r += ["fws-wildlife"]
    elif hts.startswith("0511.99.40.2") or hts == "0511.99.40.40":
        r += ["aphis-germplasm"]
    elif hts.startswith("0511.99.40"):
        r += ["aphis-pap"]
    return r


def line_levers(l):
    hts = l["hts"]
    lv = ["usmca"]
    if hts.startswith(("0508", "0511.99.30", "0501", "0510.00.40")):
        lv.append("s301-exempt")
    row = next(r for r in rows if r["hts"] == hts)
    if row["dutiable"]:
        lv += ["fta", "agoa"]
    if hts.startswith("0505.10"):
        lv.append("cn-feather-exclusion")
    lv += ["drawback", "ruling"]
    return lv


for l in te["lines"]:
    l["ruleIds"] = line_rules(l["hts"])
    l["leverIds"] = line_levers(l)
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. APHIS disease-status lists and permit conditions change often; check the current APHIS "
    "requirements and, for wildlife products, FWS and CITES status before each shipment."
)

# ------------------------------------------------------------------ finalConclusion
fc = d["finalConclusion"]
fc["seo"] = {
    "title": "HTS Chapter 05 Tariff FAQ: HS Codes for Human Hair, Feathers, Casings, Bones, Semen & Ivory Rules | KoalaGains",
    "shortDescription": "Answers to what people search about HTS Chapter 05: HS codes for human hair, feathers and down, sausage casings, bones, bovine semen, coral and sponges, the tariffs by country, Canada's Section 338 duty, and whether ivory and feathers can be imported.",
    "keywords": [
        "hs code for human hair",
        "human hair tariff",
        "hs code for feathers",
        "hs code for sausage casings",
        "hs code for bones",
        "hs code 0511",
        "can you import ivory into the us",
        "importing feathers into united states",
        "section 338 canada hts list",
        "natural sponge hs code",
        "hs code for horse hair",
        "krill meal hs code",
    ],
}
fc["intro"] = "Straight answers to the most common questions about HTS Chapter 05 — HS codes, tariffs by country and import rules for animal products. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "27 of the 38 Chapter 05 lines are Free at the base rate; the duty comes from extra duties by country.",
    "The 2026 Section 301 tariffs add 10% or 12.5% on 35 lines; only coral and shells (0508) and animal-feed products (0511.99.30) are exempt.",
    "Canada pays a 50% Section 338 duty on 20 lines even with a USMCA claim; Canadian bovine semen and casings stay Free with USMCA.",
    "China pays 37.5% on most of its List 3 lines and 20% on List 4A lines; its exclusion for standard-grade feathers and down ends November 9, 2026 unless extended.",
    "For ivory, wild-bird feathers, coral and whale products, the wildlife rules decide whether goods can enter at all.",
]
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "hs-human-hair",
        "question": "What is the HS code for human hair?",
        "searchedAs": ["hs code for human hair", "tariff code for human hair", "us hts code for human hair", "human hair tariff number", "hs code 0501"],
        "answer": "Unworked human hair, washed or not, and human hair waste is 0501.00.00.00. Sorting hair by length does not count as working (Chapter 05 note 2). Hair that is dressed, thinned or bleached is heading 6703, and wigs and hair extensions are heading 6704, both in Chapter 67.",
        "link": "",
    },
    {
        "id": "human-hair-tariff",
        "question": "What is the tariff on human hair?",
        "searchedAs": ["human hair tariff", "human hair tariff number", "hair extensions tariff", "are there tariffs on hair extensions"],
        "answer": "Unworked human hair (0501.00.00) is 1.4%, Free with most FTAs and AGOA. On top come the 2026 Section 301 duties: from China 1.4% + 12.5% + 7.5% = 21.4%; from Vietnam 13.9%; from India 11.4%. Human hair from Switzerland, Cambodia, Indonesia, Ecuador and Jordan is exempt from their Section 301 duty, so it pays 1.4%. Hair extensions and wigs are classified in Chapter 67, not here.",
        "link": "industry-areas",
    },
    {
        "id": "hs-feathers",
        "question": "What is the HS code for feathers and down?",
        "searchedAs": ["hs code for feathers", "hs code for duck feather", "hs code 0505", "hs code 0505.10", "hs code 0505.90"],
        "answer": "Feathers used for stuffing and down are 0505.10.00: .50 (feathers) and .55 (down) if they meet ASTM D4522 and the IDFB testing regulations named in the line, .60 and .65 otherwise. All are Free. Feather meal and feather waste are 0505.90.20 (2.3%); bird skins and other feathers 0505.90.60 (Free).",
        "link": "",
    },
    {
        "id": "feathers-tariff",
        "question": "What is the tariff on down and feathers from China or Vietnam?",
        "searchedAs": ["hs code for duck feather", "hs code 0505.10", "importing feathers into united states"],
        "answer": "From China, standard-grade feathers and down (0505.10.00.50, .55) pay 12.5% (9903.05.31) because they are excluded from the 7.5% List 4A duty through November 9, 2026; other feathers and down pay 20%. From Vietnam they pay 12.5%, from the EU 10%, and from Canada 50% under Section 338 even with USMCA (60% without it).",
        "link": "industry-areas",
    },
    {
        "id": "import-feathers",
        "question": "Can you import feathers into the United States?",
        "searchedAs": ["importing feathers into united states", "importing feathers", "is it illegal to possess feathers"],
        "answer": "Yes for domesticated birds, no for wild birds. Chapter 05 additional U.S. note 1 bans the feathers and skins of any bird except chickens, turkeys, guineas, geese, ducks, pigeons, ostriches, rheas, English ring-necked pheasants and pea fowl that are not wild, plus scientific and educational imports and finished fishing flies. Wildlife feathers also need an FWS declaration and, for CITES species, permits; bird parts from avian influenza regions follow APHIS conditions.",
        "link": "tariff-engineering",
    },
    {
        "id": "hs-casings",
        "question": "What is the HS code and tariff for sausage casings?",
        "searchedAs": ["hs code for sausage casings", "hts code for sausage casings", "hs code 0504", "hs code 0504.00"],
        "answer": "Natural casings are heading 0504.00.00: hog casings 0504.00.00.20, other casings .40, other guts, bladders and stomachs .60. All are Free at the base rate. Extra duties: EU (Spain, Portugal, Netherlands) 10%, China 20%, Brazil 37.5%, most other suppliers 10% or 12.5%; Canadian and Mexican casings are Free with USMCA. Each shipment needs a foreign veterinary certificate (9 CFR 96.3).",
        "link": "",
    },
    {
        "id": "hs-bones",
        "question": "What is the HS code for bones and bone meal?",
        "searchedAs": ["hs code for bones", "hs code for bone meal", "hs code 0506", "hs code 0506.90", "hs code for meat and bone meal"],
        "answer": "Ossein and bones treated with acid are 0506.10; other bones and horn-cores are 0506.90, with crude, steamed or ground bones at 0506.90.00.20. All are Free. Meat-and-bone meal is not here: it is heading 2301 in Chapter 23. Canadian bones pay 50% under Section 338 even with USMCA; Australian bones pay 12.5%. Bone meal for feed or fertilizer must be steamed to APHIS standards (9 CFR 95.24).",
        "link": "",
    },
    {
        "id": "hs-semen",
        "question": "What is the HS code for bovine semen and embryos?",
        "searchedAs": ["hs code 0511.10", "hs code for bovine embryo", "hs code for embryo", "hs code for sperm", "hs code 0511"],
        "answer": "Bovine semen is 0511.10.00 (.10 dairy, .90 other), Free. Cattle embryos are 0511.99.40.24 (dairy) and .28 (other), and other animal semen 0511.99.40.40, all at 1.1% (Free with FTAs). Canadian semen is Free with USMCA, but Canadian embryos and other semen pay the 50% Section 338 duty. Both need APHIS permits or health certificates (9 CFR part 98).",
        "link": "",
    },
    {
        "id": "hs-0511",
        "question": "What does HS code 0511 cover?",
        "searchedAs": ["hs code 0511", "hs code 0511.99", "hs code 0511.91", "hs code 0511.10", "hts code- 0511.99"],
        "answer": "Heading 0511 is animal products not covered elsewhere: bovine semen (0511.10), fish and aquatic products and dead fish unfit to eat (0511.91), and 0511.99 for hide parings and glue stock (.20), animal-feed products including Antarctic krill (.30), horsehair (.33), natural sponges (.36, 3%) and other products such as embryos, dried blood and other semen (.40, 1.1%). It was $895M of the $1.17B of Chapter 05 imports in 2025.",
        "link": "understand-industry",
    },
    {
        "id": "ivory",
        "question": "Can you import ivory into the US?",
        "searchedAs": ["can you import ivory into the us", "importing ivory into the us", "is it illegal to import ivory", "can you bring ivory into the us", "importing antique ivory into the united states", "ivory import ban"],
        "answer": "Mostly not. The tariff on ivory (0507.10) is Free, but FWS bars imports of African elephant ivory except worked ivory in a musical instrument, traveling exhibition, household move or inheritance (acquired before February 26, 1976, with CITES documents), sport-hunted trophies, and ivory for genuine scientific purposes under permit (50 CFR 17.40(e)). Walrus and narwhal ivory and whalebone are marine mammal products barred under the MMPA except for its exceptions.",
        "link": "tariff-engineering",
    },
    {
        "id": "coral-shells",
        "question": "What is the HS code and tariff for coral and sea shells?",
        "searchedAs": ["hs code for coral", "sea shells hs code", "hs code for shells", "hs code for cuttlefish bone", "can you bring seashells through customs"],
        "answer": "Coral, mollusc and crustacean shells and cuttlebone, unworked or simply prepared, are 0508.00.00, Free. They are on the 2026 Section 301 exemption list (note 52(b)) and Brazil's list, so only China pays extra (25%, List 3). Many corals are CITES-listed and wildlife shells need an FWS declaration.",
        "link": "",
    },
    {
        "id": "section-338",
        "question": "Which Chapter 05 products are on the Section 338 Canada list?",
        "searchedAs": ["section 338 canada", "section 338 canada hts list", "section 338 canada note 51 (b)(3)", "canada 50 tariff usmca", "section 338 tariffs canada list", "canada 50 tariff"],
        "answer": "Since August 22, 2026 a 50% duty applies to 20 Chapter 05 lines from Canada: bones (0506.90, note 51(b)(2), 9903.03.13) and feathers and down (0505.10), ossein (0506.10), horns and antlers (0507.90), glands and bile (0510.00.40), hide parings (0511.99.20), horsehair (0511.99.33), natural sponges (0511.99.36) and embryos, dried blood and other 0511.99.40 goods (note 51(b)(3), 9903.03.14). It applies even to USMCA goods. Canadian casings and bovine semen are not on the lists.",
        "link": "tariff-updates",
    },
    {
        "id": "hs-sponge",
        "question": "What is the HS code for natural sponges?",
        "searchedAs": ["natural sponge hs code", "sea sponge hs code", "natural sea sponge hs code"],
        "answer": "Natural sponges of animal origin are 0511.99.36.00 at 3%, Free with most FTAs and AGOA. The 2026 Section 301 duty of the country adds 10% or 12.5%, China pays 3% + 12.5% + 25%, and Canadian sponges pay 50% under Section 338. Synthetic and plant sponges are classified elsewhere.",
        "link": "",
    },
    {
        "id": "hs-horsehair",
        "question": "What is the HS code for horse hair and pig bristles?",
        "searchedAs": ["hs code for horse hair", "hs code for horse tail", "hs code 0502"],
        "answer": "Horsehair (hair of the manes or tails of horses or cattle) and horsehair waste are 0511.99.33.00, Free. Pig, hog and boar bristles are 0502.10.00.00 at 0.8¢/kg, and badger and other brushmaking hair 0502.90.00.00, Free. Chinese pig bristles pay 12.5% more; Canadian horsehair pays 50% under Section 338.",
        "link": "",
    },
    {
        "id": "hs-krill",
        "question": "What is the HS code for krill meal?",
        "searchedAs": ["krill meal hs code", "hs code krill"],
        "answer": "Antarctic krill used as animal food or feed ingredients is 0511.99.30.30, Free. Feed products in 0511.99.30 are exempt from the 2026 Section 301 duties except Brazil's 25% and China's 25% List 3 duty. Importers of Antarctic krill need a NOAA International Fisheries Trade Permit (50 CFR 300.104), and animal food needs FDA prior notice.",
        "link": "tariff-engineering",
    },
]

# ------------------------------------------------------------------ final checks
out_s = json.dumps(d, ensure_ascii=False, indent=2)
assert "TODO" not in out_s, re.findall(r".{60}TODO.{60}", out_s)[:5]
open(out, "w").write(out_s + "\n")
print("ok", out)
