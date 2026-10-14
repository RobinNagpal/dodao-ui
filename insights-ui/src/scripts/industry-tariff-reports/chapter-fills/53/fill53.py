"""Fill the writer parts of the generated Chapter 53 content file
(Other Vegetable Textile Fibers; Paper Yarn and Woven Fabrics of Paper Yarn).

Re-run through run.sh (generate -> fill -> compact -> prettier -> validate).
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, OUT  # noqa: E402,F401

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WT = IU
PATH = OUT  # run.sh copies the generated file here; filled in place
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
REL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename="
CH99 = REL + "Chapter%2099"
CH98 = REL + "Chapter%2098"
CH53 = REL + "Chapter%2053"
CH63 = REL + "Chapter%2063"
SEC11 = REL + "Section%20XI"
GN = REL + "General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))

NEW_SOURCES = {
    "fr-2011-6253": {
        "id": "fr-2011-6253",
        "publisher": "Federal Register",
        "citation": "76 FR 14575",
        "document": "Final rule (CBP Dec. 11-09)",
        "title": "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer identification code required)",
        "signed": None,
        "published": "2011-03-17",
        "url": "https://www.federalregister.gov/documents/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products",
    },
    "pl-119-37": {
        "id": "pl-119-37",
        "publisher": "U.S. Congress (GovInfo)",
        "citation": "Pub. L. 119-37, sec. 781 (139 Stat. 558)",
        "document": "Public Law 119-37",
        "title": "Continuing Appropriations, Agriculture, Legislative Branch, Military Construction and Veterans Affairs, and Extensions Act, 2026 — sec. 781 amends the definition of hemp (7 U.S.C. 1639o), effective 365 days after enactment",
        "signed": "2025-11-12",
        "published": "2025-11-12",
        "url": "https://www.govinfo.gov/content/pkg/PLAW-119publ37/html/PLAW-119publ37.htm",
    },
    "usc-21-802": {
        "id": "usc-21-802",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "21 U.S.C. 802(16)",
        "document": "Controlled Substances Act, definitions",
        "title": "Definition of marihuana: excludes hemp and the mature stalks of the plant and fiber produced from such stalks",
        "signed": None,
        "published": "2024-01-01",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap13-subchapI-partA-sec802.htm",
    },
}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO_LIST = "names no Chapter 53 code"

# Full product-group labels (the generator cuts long ones with "…").
LABELS = {
    "5301": ("Flax, raw or processed but not spun; flax tow and waste", "Flax fibre"),
    "5302": ("True hemp (Cannabis sativa L.), raw or processed but not spun; hemp tow and waste", "Hemp fibre"),
    "5303": ("Jute and other textile bast fibres (kenaf, etc.), raw or processed but not spun", "Jute fibre"),
    "5305": ("Coconut (coir), abaca (Manila hemp), ramie, sisal and other vegetable fibres, not spun", "Coir, abaca, sisal"),
    "5306": ("Flax (linen) yarn", "Flax yarn"),
    "5307": ("Yarn of jute or other textile bast fibres", "Jute yarn"),
    "5308": ("Coir, true hemp, ramie and other vegetable-fibre yarn; paper yarn", "Other yarn"),
    "5309": ("Woven fabrics of flax (linen fabric)", "Linen fabric"),
    "5310": ("Woven fabrics of jute or other bast fibres (burlap, hessian)", "Jute fabric"),
    "5311": ("Woven fabrics of other vegetable fibres (hemp, ramie); woven fabrics of paper yarn", "Other fabric"),
}

# ---------------------------------------------------------------- chapter / overview
d["chapter"]["title"] = "Other Vegetable Textile Fibers; Paper Yarn and Woven Fabrics of Paper Yarn"
ov = d["overview"]
ov["h1"] = "HTS Chapter 53: Linen, Jute, Hemp, Coir & Other Vegetable Textile Fibers — Tariff Rates (2026)"
ov["seo"]["title"] = (
    "HTS Chapter 53 Tariff 2026: Linen Fabric, Jute, Flax, Hemp, Coir & Paper Yarn Import Duty Rates | KoalaGains"
)
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 62 HTS Chapter 53 lines — flax and linen fabric, jute and burlap, true hemp, coir, abaca, "
    "sisal, ramie and paper yarn. General, FTA and Column 2 rates plus the 2026 extra duty for India, Belgium, Italy and China."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 53",
    "hts 53 import duty rates",
    "linen fabric hs code",
    "jute hs code",
    "burlap hs code",
    "flax and true hemp import duty rates",
    "raw flax and jute import duties",
    "abaca and coir customs duty",
    "woven fabric of paper yarn customs duty",
    "hts 5309.21.30 blended flax customs duty",
    "indian jute import duty",
    "belgian linen import duty",
]
ov["intro"] = (
    "Chapter 53 covers the vegetable textile fibres other than cotton, from the raw fibre to woven fabric: **flax** (5301) and "
    "**true hemp** (5302), **jute** and kenaf (5303), **coir, abaca, ramie and sisal** (5305), their yarns (5306–5308, "
    "including paper yarn) and woven **linen fabric** (5309), **jute fabric** such as burlap and hessian (5310) and fabrics of "
    "hemp, ramie and paper yarn (5311). Sacks, twine, rugs and made-up linens of these fibres are classified in chapters "
    "56–63. Of its **62 tariff lines, 46 are Free**; the rest run from 0.2¢/kg to 14.5% (flax fabrics with more than 17% "
    "wool).\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff "
    "of 10% or 12.5%**: India, Bangladesh, Sri Lanka and the UK 10% on top of the base rate, the **EU 10% in total**, and "
    "Türkiye, Thailand, Vietnam and the Philippines 12.5%. **China pays 37.5%** extra on almost every line (25% List 3 plus "
    "12.5%), and Brazil 37.5%. Exemptions are narrow: Jordan's exception list covers every line, and CAFTA-DR yarn and fabric (5306–5311, except coir and paper yarn) entered with a CAFTA-DR claim pays no Section 301 duty. "
    "**India** shipped 36% of the **$265.4M** imported in 2025, mostly heading 5305 fibre (coir, abaca, ramie, sisal) and "
    "jute fabric, and Belgium, Italy and the UK most of the linen fabric."
)
TRUNC = {g["label"]: LABELS[g["heading"]][0] for g in ov["productGroups"] if g["label"].endswith("…")}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "5301": (
        "Flax straw, scutched and hackled flax, and flax tow and waste. Raw, retted and tow are Free; broken or scutched flax "
        "pays 0.2¢/kg and hackled flax 3.8%. Imports halved to $5.3M in 2025, mostly tow from France, Belarus and Belgium.",
        ["flax fiber", "raw flax", "scutched flax", "hackled flax", "flax tow", "flax waste", "flax fibre"],
    ),
    "5302": (
        "True hemp (Cannabis sativa L.) stalk fibre, raw, retted or processed, and hemp tow. Free. Mature stalks and fibre are "
        "not \"marihuana\" under the Controlled Substances Act, so no DEA permit applies.",
        ["hemp fiber", "industrial hemp fiber", "raw hemp", "hemp tow", "decorticated hemp", "hemp fibre"],
    ),
    "5303": (
        "Jute and other bast fibres such as kenaf and roselle, raw or processed but not spun, and their tow and waste. Free. "
        "Bangladesh was the largest supplier in 2025.",
        ["raw jute", "jute fiber", "kenaf fiber", "jute caddies", "jute cuttings", "mesta"],
    ),
    "5305": (
        "One Free line for coconut (coir), abaca (Manila hemp), ramie, sisal, henequen and other vegetable fibres, raw or "
        "processed but not spun. $64.0M in 2025, 24% of the chapter, mostly from India and Sri Lanka.",
        ["coir fiber", "coconut fiber", "abaca fiber", "Manila hemp", "sisal fiber", "ramie fiber", "henequen"],
    ),
    "5306": (
        "Flax (linen) yarn, single or multiple. Free; Column 2 35%–40%. Linen sewing thread and twine-weight yarn are "
        "classified elsewhere (Section XI note 3).",
        ["linen yarn", "flax yarn", "wet spun linen yarn", "linen thread", "100 linen yarn"],
    ),
    "5307": (
        "Jute and other bast-fibre yarn, single or plied. Free. Imports nearly halved to $2.4M in 2025; Bangladesh supplied "
        "64%.",
        ["jute yarn", "jute thread", "kenaf yarn", "jute twine yarn"],
    ),
    "5308": (
        "Coir yarn, true hemp yarn, ramie and other vegetable-fibre yarn (all Free) and paper yarn (2.7%). Ramie and other "
        "yarn of 5308.90.90 is on China's List 4A (7.5%), not List 3.",
        ["hemp yarn", "coir yarn", "ramie yarn", "paper yarn", "sisal yarn", "paper twine"],
    ),
    "5309": (
        "Woven linen fabric, 52% of the chapter's imports ($138.6M in 2025). Fabric of 85% or more flax is Free; below 85% "
        "flax it is 14.5% with more than 17% wool, 6.9% for unbleached or bleached blends with cotton and man-made fibre, Free otherwise.",
        ["linen fabric", "100% linen fabric", "flax fabric", "linen cotton fabric", "linen canvas", "Belgian linen", "Irish linen"],
    ),
    "5310": (
        "Woven jute fabric — burlap and hessian cloth — and other bast-fibre fabrics. Free. $41.3M in 2025, two-thirds from "
        "India. Jute sacks and bags are heading 6305, not here.",
        ["burlap fabric", "hessian cloth", "jute fabric", "jute cloth", "jute webbing", "burlap roll"],
    ),
    "5311": (
        "Woven fabrics of hemp, ramie and other vegetable fibres, and of paper yarn. Free, except 14.5% with more than 17% "
        "wool and 2.7% for paper-yarn fabric.",
        ["hemp fabric", "ramie fabric", "abaca fabric", "paper yarn fabric", "pina fabric", "nettle fabric"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Dyed linen fabric from Belgium",
        "line": "5309.19.00.10",
        "body": "Woven fabric of 85% or more flax, dyed, over 127 cm wide, is Free at the general rate. Belgium is an EU "
        "member, and EU goods pay 10% in total in place of a lower base rate (9903.05.39, U.S. note 52(k)); the EU exception "
        "list names no Chapter 53 code. A $50,000 shipment pays **$5,000**.",
    },
    {
        "title": "Jute hessian cloth from India or Bangladesh",
        "line": "5310.10.00.20",
        "body": "Unbleached jute fabric up to 130 cm wide is Free at the general rate. India (9903.05.44) and Bangladesh "
        "(9903.05.26) each pay the 10% Section 301 tariff on top, and neither exception list covers jute. A $20,000 shipment "
        "pays **$2,000**.",
    },
    {
        "title": "Linen–wool fabric from Italy vs. India",
        "line": "5309.29.20.00",
        "body": "Dyed flax fabric with less than 85% flax and more than 17% wool is 14.5%. Because the base rate is above "
        "10%, Italian (EU) fabric pays only the 14.5% (note 52(k)): **$1,450** on $10,000. The same fabric from India pays "
        "14.5% plus 10%: **$2,450**.",
    },
    {
        "title": "Bleached linen–cotton–polyester fabric from China",
        "line": "5309.21.30.90",
        "body": "Bleached flax fabric below 85% flax containing cotton and man-made fibre is 6.9%, and China adds 25% (List 3, "
        "9903.88.03) and 12.5% (9903.05.31): **$4,440** on $10,000. The same blend dyed instead of bleached is 5309.29.30, "
        "Free at the general rate, so it pays **$3,750**.",
    },
    {
        "title": "Ramie yarn from China",
        "line": "5308.90.90.00",
        "body": "Yarn of ramie and other vegetable fibres is Free, and it is the one Chapter 53 subheading on China's List 4A "
        "(7.5%, 9903.88.15) rather than List 3. With the 12.5% 2026 duty, a $10,000 shipment pays **$2,000** — against "
        "$3,750 on Chinese hemp yarn (5308.20, List 3).",
    },
    {
        "title": "Hemp fibre from Canada, with a USMCA claim",
        "line": "5302.10.00.00",
        "body": "Raw or retted true hemp is Free, and a valid USMCA claim also removes Canada's 10% Section 301 duty "
        "(9903.05.93): **$0**. Without the claim it pays $1,000 on $10,000. No Chapter 53 line is on Canada's Section 338 list.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
NAME_FIX = {"Rep. of Korea": "South Korea", "Viet Nam": "Vietnam", "Türkiye": "Türkiye"}
ts["topCountries"] = [
    {"name": NAME_FIX.get(c["country"], c["country"]), "importsUsd": c["importsUsd"]}
    for c in d["understandIndustry"]["byCountry"][:5]
]
ts["biggestLines"] = [
    {"hts": "5309.19", "label": "Linen fabric, 85% or more flax, dyed, printed or of coloured yarns"},
    {"hts": "5305.00", "label": "Coir, abaca, ramie, sisal and other vegetable fibres, not spun"},
    {"hts": "5309.29", "label": "Linen-blend fabric, less than 85% flax, dyed, printed or of coloured yarns"},
    {"hts": "5310.10", "label": "Unbleached jute fabric (burlap, hessian)"},
]
ts["source"] = "UN Comtrade, United States imports, HS chapter 53 (2025)"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so the page cannot split heading 5305 into coir, abaca, ramie and sisal, or say which 10-digit line each country ships."
)
ov["notes"]["chapterNotes"] = (
    "Chapter 53 has no legal chapter notes of its own; the Section XI (textiles) notes apply. The ones that decide Chapter 53 "
    "classification:\n\n"
    "**Note 1.** Section XI does not cover, among others, vegetable materials of chapter 14 (for example broomcorn), "
    "fabrics coated or laminated with plastics or rubber (chapters 39 and 40), or articles of chapters 42, 46, 64, 65, 94 "
    "or 95.\n\n"
    "**Note 2.** A mixture of textile materials is classified as if it consisted wholly of the material that predominates by "
    "weight. When no material predominates, it goes to the heading that occurs last in numerical order — so a 50/50 "
    "linen–cotton fabric is a flax fabric (5309), while a 50/50 linen–viscose fabric is a man-made fibre fabric (chapters 54–55).\n\n"
    "**Note 3.** Yarn of true hemp or flax that is polished or glazed and measures 1,429 decitex or more, or unpolished and "
    "over 20,000 decitex; coir yarn of three or more plies; and other vegetable-fibre yarn over 20,000 decitex are treated "
    "as twine, cordage or rope (heading 5607), not Chapter 53. Paper yarn is not.\n\n"
    "**Note 4.** The \"put up for retail sale\" rule for yarn applies to chapters 50, 51, 52, 54 and 55, not 53: flax and "
    "jute yarn have no separate retail lines.\n\n"
    "**Notes 7–8.** Fabric cut to shape, hemmed or otherwise \"made up\" — a hemmed linen napkin or a sewn burlap sack — "
    "leaves Chapter 53 for chapters 61–63.\n\n"
    "**Statistical note 1.** Defines the weave terms used in the 10-digit lines of 5309 and 5311 (poplin or broadcloth, "
    "sheeting, printcloth, square construction, napped, combed) and how to compute the average yarn number."
)
ov["notes"]["additionalUsNotes"] = (
    "Chapter 53 has no additional U.S. notes. **Section XI additional U.S. note 2:** \"certified hand-loomed and folklore\" "
    "products are those certified by an official of the producing country's government under procedures established by USTR.\n\n"
    "**Section XI statistical note 2.** The \"subject to cotton restraints\" and \"subject to man-made fiber restraints\" "
    "10-digit lines of 5309.21.30, 5309.29.30 and 5311.00.30 follow the non-flax fibres: cotton restraints where cotton is "
    "50% or more by weight. The three-digit numbers in brackets (220, 313–315, 410, 613–615, 800, 810) are textile category "
    "numbers used to monitor shipments."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 53 Tariff Updates: Linen, Jute, Flax & Hemp Import Duties (2025–2026)"
tu["seo"]["title"] = "Linen & Jute Tariff Updates 2026: HTS Chapter 53 — Section 301, China Lists, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 53 imports since January 2025: unchanged base rates, the end of the IEEPA tariffs and the "
    "Section 122 surcharge, the 2026 Section 301 tariffs on India, Bangladesh, the EU and others, and China's List 3 and 4A duties."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 53 tariff updates",
    "indian jute import duty",
    "flax and true hemp import duty rates",
    "linen tariff 2026",
    "section 301 tariffs on china spun yarns",
    "woven fabric of paper yarn customs duty",
    "chapter 53 trade impact 2026",
    "jute import from bangladesh tariff",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 62 Chapter 53 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — 50% on Indian jute and linen at their peak — **ended "
    "on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, "
    "2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**, and the only exemptions that reach "
    "Chapter 53 are Jordan's exception list and the CAFTA-DR textile exemption for yarn and fabric (note 52(i)). China keeps its 25% List 3 duty (7.5% List 4A on ramie and other "
    "yarn), and Brazil pays another 25%."
)
tu["scope"] = (
    "Measures that reach Chapter 53 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 Lists 3 and 4A, the Nicaragua Section 301 phase-in, and the 2025–2026 "
    "IEEPA and Section 122 duties that have ended. No Section 232 action, no Canada Section 338 list entry and no antidumping "
    "or countervailing duty order covers a Chapter 53 line. For the rate each supplier pays, see Rates by country."
)
OTHER_LABEL = (
    "Other Section 301 economies (46, including Pakistan, Egypt, Japan, South Korea, Taiwan, Switzerland, Indonesia, Jordan, "
    "Guatemala and El Salvador)"
)
IE = {x["id"]: x for x in tu["inEffect"]}
IE["other-section-301"]["country"] = OTHER_LABEL
EXEMPT = {
    "in-section-301": (
        "India has no exception list, and the general exemption list (U.S. note 52(b)) " + NO_LIST + ". GSP (SPI A), printed "
        "on 5301.21, 5308.90.10 and 5311.00.60, has been expired since December 31, 2020. The 2025 IEEPA duties (25% "
        "reciprocal plus 25% over Russian oil purchases) ended in February 2026.",
        "Indian 5305 fibre (coir, sisal and similar), jute fabric and linen fabric — $96.0M in 2025 — pay 10% on top of the base rate: 10% on the "
        "Free lines, 16.9% on 6.9% linen blends and 24.5% on flax–wool fabric.",
        ["cbp-gsp", "eo-14384", "eo-14389"],
    ),
    "eu-section-301": (
        "EU goods pay 10% in total in place of a lower base rate (U.S. note 52(k)); where the base rate is 10% or more (the "
        "14.5% flax–wool lines) only the base rate applies. The EU exception list (U.S. note 52(j)(2), 9903.05.97) " + NO_LIST
        + ". " + ENDED,
        "Belgian, Italian, French and Lithuanian linen fabric, flax tow and yarn pay 10% in total on almost every line; "
        "flax–wool fabric pays its 14.5% base rate only.",
        ["eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) " + NO_LIST + ". " + ENDED,
        "British linen fabric — $23.7M in 2025 — pays the base rate plus 10%: 10% on 85%-flax fabric.",
        ["eo-14389"],
    ),
    "cn-section-301": (
        "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers 30 of the 31 Chapter 53 subheadings; ramie and other "
        "vegetable-fibre yarn (5308.90.90) is on List 4A instead (+7.5%, 9903.88.15). The 2026 action adds +12.5% "
        "(9903.05.31), and China is on no exception list. No China product exclusion (note 20) covers a Chapter 53 line. USTR "
        "confirmed on October 7, 2026 that the 2018–2019 actions continue. The IEEPA duties on China ended February 24, 2026.",
        "Chinese linen fabric, jute fabric and hemp yarn pay 37.5% on top of the base rate (44.4% on 6.9% blends, 52% on "
        "flax–wool fabric); ramie yarn of 5308.90.90 pays 20%.",
        ["eo-14389"],
    ),
    "lk-section-301": (
        "Sri Lanka has no exception list. GSP has been expired since December 31, 2020. " + ENDED,
        "Sri Lankan fibre of heading 5305 ($10.9M in 2025) pays 10% on top of its Free base rate.",
        ["cbp-gsp", "eo-14389"],
    ),
    "bd-section-301": (
        "Bangladesh's exception lists (U.S. note 52(j)(9), 9903.06.12–9903.06.13) " + NO_LIST + ", so jute is not "
        "exempt. " + ENDED,
        "Bangladeshi raw jute, jute yarn and jute fabric pay 10%: $1,000 on a $10,000 roll of hessian.",
        ["eo-14389"],
    ),
    "tr-section-301": (
        "Türkiye has no exception list for Chapter 53. " + ENDED,
        "Turkish linen fabric ($7.8M in 2025) pays the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "th-section-301": (
        "Thailand has no exception list for Chapter 53. GSP has been expired since December 31, 2020. " + ENDED,
        "Thai linen fabric pays the base rate plus 12.5%.",
        ["cbp-gsp", "eo-14389"],
    ),
    "ph-section-301": (
        "The Philippines has no exception list for Chapter 53. GSP, printed on three dutiable lines, has been expired since "
        "December 31, 2020. " + ENDED,
        "Philippine abaca (Manila hemp) fibre of 5305 is Free at the general rate but pays 12.5%. U.S. imports from the "
        "Philippines were only $158,283 in 2025, split between fibre (5305) and fabrics (5311).",
        ["cbp-gsp", "eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93). No Chapter 53 line is on the Canada Section 338 list (U.S. "
        "note 51) or the September 29, 2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian hemp fibre ($0.4M of Canada's $1.0M in 2025) and other goods pay nothing extra with a USMCA claim and 10% "
        "without one.",
        ["procl-11048", "eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94); goods must meet the General Note 11 rules of origin for "
        "Chapter 53. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "Mexican goods ($1.3M in 2025, mostly fibre of 5305 and yarn of 5308) pay $0 extra with a valid USMCA claim and 10% "
        "without one.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 53 line; its exemption list (U.S. note 50(a)(ii), "
        "9903.05.03) " + NO_LIST + ". The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% reciprocal and 40%) "
        "ended February 24, 2026.",
        "Brazilian goods — almost all linen fabric, $1.6M in 2025 — pay 37.5% on top of the base rate.",
        ["eo-14323", "eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 53. " + ENDED,
        "Vietnamese fibre of 5305 and jute fabric ($1.6M in 2025) pay the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "other-section-301": (
        "Exception lists in U.S. note 52(j) reach Chapter 53 for three economies: Jordan (every Chapter 53 subheading, "
        "9903.06.20), and Guatemala and El Salvador (every subheading, when entered under CAFTA-DR, 9903.06.06 and 9903.06.09). "
        "Note 52(i) (9903.05.95) also exempts CAFTA-DR textile goods of Costa Rica, the Dominican Republic, El Salvador, "
        "Guatemala, Honduras and Nicaragua entered duty-free with a CAFTA-DR claim (SPI P or P+); in Chapter 53 that covers the "
        "yarns and fabrics of 5306–5311 except coir yarn (5308.10) and paper yarn (5308.90.10), not the raw fibres of "
        "5301–5305. Japan, South Korea and Switzerland pay 12.5% and "
        "Taiwan 10% in total in place of a lower base rate (note 52(k)). " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5% — Pakistan 10%, Egypt 12.5%; "
        "Jordanian goods, CAFTA-DR claims from Guatemala and El Salvador, and CAFTA-DR yarn and fabric from Costa Rica, the "
        "Dominican Republic, Honduras and Nicaragua enter at the base rate.",
        ["eo-14389"],
    ),
}
for k, (ex, wim, extra) in EXEMPT.items():
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
assert set(EXEMPT) == set(IE), set(IE) ^ set(EXEMPT)
add_sources(tu, [s for v in EXEMPT.values() for s in v[2]])

gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 53 base-rate changes"
base["detail"] = (
    "All 62 Chapter 53 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 Lists 3 and 4A continue",
       "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
       "four-year review. For Chapter 53 this keeps +25% (List 3, 9903.88.03) on 30 subheadings and +7.5% (List 4A, "
       "9903.88.15) on ramie and other vegetable-fibre yarn (5308.90.90).",
       None, None, "China", ["fr-2026-20510", "fr-2018-20610", "fr-2019-17865", "hts-now"]),
    ch("ca-338", "reference", "2026-08-22", "Effective", "Canada Section 338 duty does not reach Chapter 53",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b). No Chapter 53 "
       "subheading is on that list, before or after the September 15, 2026 revision (Proclamation 11065), so Canadian flax and "
       "hemp fibre pay only the Section 301 duty when USMCA is not claimed.",
       None, None, "Canada", ["procl-11048", "procl-11065", "hts-chapter-99"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 53 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); no Chapter 53 subheading is on the general "
       "exemption list (note 52(b)). India, Bangladesh, Sri Lanka, the UK and Pakistan pay 10%; Türkiye, Thailand, Vietnam, "
       "the Philippines and Egypt 12.5%; EU goods 10% in total. Jordan's list, Guatemala's and El Salvador's "
       "CAFTA-DR lists, and the CAFTA-DR textile exemption (note 52(i), 9903.05.95: yarn and fabric of 5306–5311 except "
       "5308.10 and 5308.90.10, with a CAFTA-DR claim) exempt Chapter 53 goods. USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94); other FTA claims "
       "remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 53 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: flax and jute are not high-priority sectors",
       "CBP's operational guidance for importers lists supply-chain tracing documents for the UFLPA high-priority sectors — "
       "aluminum, apparel, caustic soda, copper, cotton and cotton products, lithium, PVC, jujubes, seafood, polysilicon, steel "
       "and tomatoes. Flax, hemp and jute are not among them, but the UFLPA presumption applies to goods of any kind made "
       "wholly or in part in Xinjiang or by a listed entity, and linen–cotton blends fall under the cotton tracing guidance.",
       None, None, "China", ["cbp-fl-guidance", "pl-117-78"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 53 subheading was on the product "
       "exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
       None, "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's "
       "25% reciprocal rate on jute, coir and linen ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
       "(SPI D) is printed on three dutiable Chapter 53 subheadings — scutched flax (5301.21), paper yarn (5308.90.10) and "
       "paper-yarn fabric (5311.00.60) — but not on the 3.8%, 6.9% or 14.5% lines. GSP (SPI A), printed on the same three "
       "subheadings, remains expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 53 line.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("hemp-definition", "pending", "2025-11-12", "Signed", "New federal definition of hemp takes effect November 12, 2026",
       "Section 781 of P.L. 119-37 rewrites the definition of hemp in 7 U.S.C. 1639o from November 12, 2026: the 0.3% limit "
       "counts total THC including THCA, and intoxicating hemp-derived cannabinoid products are excluded. \"Industrial "
       "hemp\" grown for the stalk and fibre stays hemp, and the Controlled Substances Act separately excludes mature stalks "
       "and fibre from \"marihuana\", so imports of hemp fibre, yarn and fabric (5302, 5308.20, 5311.00.40) are not affected. "
       "No duty changes.",
       None, None, "All", ["pl-119-37", "usc-21-802"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 53 "
       "line on top of the List 3 or List 4A duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian coir, jute fabric and linen. Ended "
       "February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Bangladesh +20%, Vietnam "
       "+20%, Thailand +19%, the UK +10%, and 15% in total for EU goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 53 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the 25% List 3 duty on linen and jute.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
       "February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
]
tu["changes"] = changes
add_sources(tu, [s for c in changes for s in c["sourceIds"]])

# ---------------------------------------------------------------- understandIndustry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 53: Linen, Jute, Coir & Hemp — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "Linen & Jute Imports to the U.S. by Country: India, Belgium, Italy, UK — HTS Chapter 53 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of flax, jute, coir, hemp and their yarns and fabrics 2020–2025 by country, product and year: $265.4M in "
    "2025. India supplied 36%; linen fabric (5309) was 52%, coir and other fibres of 5305 24%, jute fabric 16%."
)
ui["seo"]["keywords"] = [
    "jute importers in usa",
    "jute import from bangladesh",
    "linen fabric import",
    "coir importers in usa",
    "europe flax supply chain tariffs",
    "jute packaging trade impact",
    "linen imports by country",
]
ui["why"] = (
    "U.S. imports of Chapter 53 goods were **$265.4M in 2025**, almost flat against $267.6M in 2024 (-0.8%) and below the "
    "2021 peak of $339.9M. **India shipped $96.0M (36%)**, then **Belgium $32.4M** (-9%), **Italy $27.4M** (+10%), the "
    "**UK $24.3M** (+15%), China $13.0M (-11%), Sri Lanka $11.7M and Bangladesh $10.4M (-22%).\n\n"
    "**Linen fabric is the largest trade: heading 5309 was $138.6M, 52%** of the total, and up 7%. Belgium, Italy and the "
    "UK shipped 58% of it, India $16.4M. **Heading 5305** — coir, abaca, ramie and sisal fibre in one line — was "
    "$64.0M (24%), $48.5M of it from India and $10.9M from Sri Lanka. **Jute fabric** (5310, burlap and hessian) was $41.3M "
    "(16%): India $28.2M, Bangladesh $7.2M, China $3.3M. Fibre and yarn are small and fell: flax fibre halved to $5.3M, "
    "jute yarn to $2.4M, and hemp fibre and yarn were $3.2M together.\n\n"
    "Through 2025 most suppliers paid the IEEPA tariffs — 50% on Indian goods from August 27 — on top of the base rate, and "
    "China its List 3 duty as well. The IEEPA duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of "
    "10% or 12.5% applies to most of these suppliers instead. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. Heading 5305 is a single line, so coir, abaca, ramie and sisal cannot be shown separately. Country names follow "
    "Comtrade (\"Viet Nam\" is Vietnam, \"Other Asia, nes\" is mainly Taiwan)."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 53 Tariff Rates by Country: Linen & Jute from India, Belgium, Italy, China & More"
ia["seo"]["title"] = "Linen & Jute Import Duty by Country 2026: India, Belgium, Italy, UK, China — HTS Chapter 53 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on flax, jute, coir, hemp, their yarns and linen and jute fabric by country: base rate plus the 2026 "
    "Section 301 duty, China's Lists 3 and 4A and Brazil's 25%, with the EU's 10% total and USMCA applied."
)
ia["seo"]["keywords"] = [
    "linen tariff by country",
    "italian woven linen custom rates",
    "belgian linen import duty",
    "indian jute import duty",
    "china linen import tariff",
    "bangladesh jute tariff",
    "raw flax and jute import duties",
    "abaca and coir customs duty",
]
ia["intro"] = (
    "The total rate on Chapter 53 goods depends far more on **where they come from** than on what they are. Each cell below "
    "is the base rate for that product group plus the extra duty for that country, minus any preference — computed from "
    "the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026). **Indian, Bangladeshi and Sri Lankan** jute and coir pay 10% on top of a mostly Free base rate; "
    "**Belgian, Italian, French and Lithuanian linen** pays 10% in total; Türkiye, Thailand, Vietnam and the Philippines "
    "pay 12.5%. **China and Brazil pay 37.5% more** on almost every line, and Belarus pays Column 2 rates of up to 90%."
)
RULES = {
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. GSP has expired; the IEEPA duties "
    "(up to 50%) ended in February 2026.",
    "Belgium": "EU: 10% in total in place of a lower base rate (9903.05.39, U.S. note 52(k)); the 14.5% flax–wool lines pay "
    "their base rate only. The EU exception list names no Chapter 53 code. The 15% IEEPA rate ended February 24, 2026.",
    "Italy": "EU: 10% in total in place of a lower base rate (9903.05.39, U.S. note 52(k)); the 14.5% flax–wool lines pay "
    "their base rate only. The EU exception list names no Chapter 53 code. The 15% IEEPA rate ended February 24, 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 53 code.",
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31): 37.5% on Free lines, up to 52% on flax–wool "
    "fabric. Ramie and other yarn of 5308.90.90 is on List 4A instead: 7.5% plus 12.5%, 20% in all.",
    "Sri Lanka": "Base rate plus 10% Section 301 (9903.05.72) on every line; no exception list. GSP has expired.",
    "Bangladesh": "Base rate plus 10% Section 301 (9903.05.26) on every line; Bangladesh's exception lists (9903.06.12–9903.06.13) "
    "name no Chapter 53 code, so jute is not exempt.",
    "France": "EU: 10% in total in place of a lower base rate (9903.05.39, U.S. note 52(k)); the 14.5% flax–wool lines pay "
    "their base rate only. The EU exception list names no Chapter 53 code.",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on every line; no exception list. GSP has expired.",
    "Belarus": "Column 2 rates (normal trade relations suspended since April 8, 2022): Free on flax tow and raw jute, 0.3¢/kg on "
    "raw flax, 35%–40% on flax yarn and fabric, up to 90% on flax–wool fabric. Belarus is not one of the 60 Section 301 economies.",
    "Lithuania": "EU: 10% in total in place of a lower base rate (9903.05.39, U.S. note 52(k)); the 14.5% flax–wool lines pay "
    "their base rate only. The EU exception list names no Chapter 53 code.",
    "Philippines": "Base rate plus 12.5% Section 301 (9903.05.64) on every line, abaca (5305) included; no exception list.",
    "Canada": "USMCA-qualifying: no extra duty (9903.05.93), and the base rate is Free under USMCA. Otherwise the base rate plus "
    "10% (9903.05.29). No Chapter 53 line is on the Section 338 list.",
    "Mexico": "USMCA-qualifying: no extra duty (9903.05.94), and the base rate is Free under USMCA. Otherwise the base rate "
    "plus 10% (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 37.5% on Free lines, up to 52%.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list.",
}
RULES["Any other country"] = (
    "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% "
    "(9903.05.20–9903.05.83): Pakistan 10%, Egypt 12.5%, Japan, South Korea and Switzerland 12.5% in total. Jordan (every "
    "line, 9903.06.20) and CAFTA-DR claims from Guatemala and El Salvador (9903.06.06, 9903.06.09) are exempt, as is "
    "CAFTA-DR yarn and fabric (5306–5311, not coir or paper yarn) of the other CAFTA-DR members (9903.05.95)."
)
EXTRA_SIDS = {
    "India": ["cbp-gsp", "eo-14384", "eo-14389"],
    "Sri Lanka": ["cbp-gsp", "eo-14389"],
    "Thailand": ["cbp-gsp", "eo-14389"],
    "Belarus": ["pl-117-110"],
    "Canada": ["procl-11048", "eo-14389"],
    "Brazil": ["eo-14389"],
    "Any other country": [],
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    for sid in EXTRA_SIDS.get(c["country"], ["eo-14389"]):
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU rates of \"10% in total\" replace the base rate when it is lower (U.S. note 52(k)); on the 14.5% flax–wool lines "
    "the base rate alone applies.",
    "Belarus is a Column 2 country, so its cells show Column 2 rates; it is not one of the 60 Section 301 economies.",
    "Exemptions checked: Jordan's list (every line), the Guatemala and El Salvador CAFTA-DR lists (every line), and the "
    "CAFTA-DR textile exemption (note 52(i): 5306–5311 except 5308.10 and 5308.90.10, with SPI P or P+) reach Chapter 53. "
    "No China product exclusion, Canada Section 338 entry, Section 232 heading or AD/CVD order covers a Chapter 53 line.",
    "Not in the grid: the UFLPA presumption against goods made in Xinjiang, APHIS port inspection of raw plant fibres, and "
    "textile entry rules (origin under 19 CFR 102.21, manufacturer identification) — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86) names no Chapter 53 code. Note 52(j) country lists name Chapter 53 codes only for Jordan (all 31 "
    "subheadings, 9903.06.20) and for CAFTA-DR claims from Guatemala and El Salvador (all 31, 9903.06.06 and 9903.06.09); "
    "the EU, UK, Swiss, Bangladesh and other lists name none. Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods "
    "entered duty-free with a CAFTA-DR claim; under the WTO textiles Annex that general note 29(d)(v) uses, that reaches "
    "5306–5311 but not the raw fibres of 5301–5305, coir yarn (5308.10) or paper yarn (5308.90.10). "
    "Note 50(a)(ii) names no Chapter 53 code for Brazil, note 51(b) none for Canada, and the Russia list (note 30) none. "
    "Note 20 puts 30 subheadings on China List 3 and 5308.90.90 on List 4A; no note 20 product exclusion and no note 31 "
    "increase names a Chapter 53 line. No Section 232 heading and no antidumping or countervailing duty order covers a "
    "Chapter 53 line."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Linen, Jute & Hemp (HTS Ch. 53): Origin Rules, Hemp & APHIS Rules, Ways to Lower Duty"
te["seo"]["title"] = (
    "Importing Linen, Jute & Hemp Fiber: Textile Origin, Hemp Rules, APHIS, Labeling & Ways to Lower Duty (HTS Ch. 53) | KoalaGains"
)
te["seo"]["shortDescription"] = (
    "The CBP, USDA and FTC rules for each HTS Chapter 53 line — textile origin (19 CFR 102.21), manufacturer ID, hemp fibre "
    "under the Controlled Substances Act and 7 CFR 990, APHIS inspection, \"linen\" labeling — and the legal ways to pay "
    "less: exception lists, USMCA, FTA claims, classification, samples and drawback."
)
te["seo"]["keywords"] = [
    "textile origin engineering",
    "linen country of origin",
    "importing hemp fiber",
    "hemp fiber import rules",
    "19 CFR 102.21 linen",
    "linen labeling",
    "linen fabric sample hs code",
    "jute tariff engineering",
]
te["intro"] = (
    "Chapter 53 goods are textiles, so **CBP's textile rules decide where they come from**: raw fibre is from where it was "
    "grown, yarn from where it was spun, and fabric from where it was woven — dyeing or printing alone does not move origin "
    "(19 CFR 102.21). Every entry names the manufacturer through a manufacturer identification code, and goods made in "
    "Xinjiang are presumed barred under the UFLPA. **Hemp fibre is not a controlled substance**: the Controlled Substances "
    "Act excludes mature stalks and fibre, and USDA's hemp rules (7 CFR 990) license U.S. growers, not importers. Raw "
    "fibres need no APHIS permit but can be held for inspection at the port.\n\n"
    "The ways to pay less are in the schedule: claim **USMCA** on Canadian and Mexican goods, use the **Jordan list or the CAFTA-DR "
    "exemptions**, claim an **FTA rate** on the dutiable lines, get the **classification** right where flax content, "
    "bleaching or wool content moves the rate, enter **samples** under Chapter 98, and claim **drawback** on re-exports."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on fibre, yarn or fabric made in Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 14.5%)",
        "appliesTo": "All 62 lines, for goods that qualify as originating under General Note 11 (the Chapter 53 "
        "product-specific rules of origin)",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" on "
        "the entry line.",
        "caveat": "Canadian goods face no Section 338 duty in Chapter 53. The USMCA was not renewed at the July 1, 2026 joint "
        "review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": CH99},
        ],
    },
    {
        "id": "exception-lists",
        "title": "Source from Jordan, or claim CAFTA-DR on Central American and Dominican goods",
        "saves": "The whole 10% Section 301 duty",
        "appliesTo": "Every Chapter 53 line from Jordan (9903.06.20); every line from Guatemala or El Salvador entered under "
        "CAFTA-DR (9903.06.06, 9903.06.09); yarn and fabric of 5306–5311 (not coir yarn 5308.10 or paper yarn 5308.90.10) from Costa Rica, the Dominican "
        "Republic, Honduras or Nicaragua entered duty-free under CAFTA-DR (note 52(i), 9903.05.95)",
        "document": "Proof of origin for the country claimed (commercial invoice, manufacturer ID, production records), the "
        "exemption heading on the entry line, and for CAFTA-DR the SPI \"P\" claim.",
        "caveat": "Origin follows 19 CFR 102.21: fabric is from where it was woven, so imported greige linen dyed and printed "
        "in another country usually keeps the weaving country's origin. No other economy's exception list names a Chapter 53 code.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
            {"label": "19 CFR 102.21 (textile origin)", "url": ecfr(19, "102.21")},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA, CAFTA-DR, CBERA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 14.5% (flax–wool fabric), 6.9% (unbleached or bleached flax blends), 3.8% (hackled flax), 2.7% (paper yarn "
        "and its fabric), 0.2¢/kg (scutched flax)",
        "appliesTo": "The 16 dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Jordan, "
        "Morocco, Bahrain, Oman, Singapore and CAFTA-DR countries; CBERA (E) on 5301.21, 5308.90.10, 5311.00.60 and (with "
        "exclusions) 5309.21.30; AGOA (D, through December 31, 2026) on 5301.21, 5308.90.10 and 5311.00.60",
        "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, JO, MA, BH, "
        "OM, SG, P, E, D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)), except CAFTA-DR yarn and fabric of "
        "5306–5311 entered duty-free under CAFTA-DR (note 52(i), 9903.05.95) — raw fibres, coir yarn and paper yarn still pay it. GSP (A) has been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a), (i)", "url": CH99},
            {"label": "CBP: GSP status", "url": src("cbp-gsp")["url"]},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding classification ruling where the line decides the rate",
        "saves": "Up to 14.5 points of base rate, and the China list: 85% flax or more (Free) vs. less; unbleached or bleached (5309.21.30, "
        "6.9%) vs. dyed or printed (5309.29.30, Free) blends; more than 17% wool (14.5%); ramie yarn (5308.90.90, China List "
        "4A 7.5%) vs. hemp yarn (5308.20, List 3 25%); fabric vs. twine over the Section XI note 3 decitex limits",
        "appliesTo": "Any line where fibre content, finish or yarn weight is in doubt — especially linen blends, where the "
        "fibre that predominates by weight decides the chapter (Section XI note 2)",
        "document": "A ruling request to CBP describing the fibre content by weight, construction, finish and width (19 CFR "
        "part 177); invoices must state the same details (19 CFR 141.89).",
        "caveat": "Rulings apply to the transaction described; a different blend or finish may need its own. Coir pith "
        "(coco peat) is not a Chapter 53 fibre: CBP classifies it in 1404.90 (ruling H061739).",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Section XI notes and Chapter 53", "url": CH53},
            {"label": "CBP ruling H061739 (coco peat)", "url": "https://rulings.cbp.gov/ruling/H061739"},
        ],
    },
    {
        "id": "samples",
        "title": "Enter swatches and sample cuts as samples",
        "saves": "All duty — base rate and the Section 301 and China duties",
        "appliesTo": "Linen and jute swatches and yarn samples valued at $1 or less each, or marked, torn or perforated so "
        "they cannot be sold, used only to solicit orders",
        "document": "Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.",
        "caveat": "Usable cuts or sample yardage for production do not qualify. U.S. notes 20 and 52 exempt goods properly "
        "entered under Chapter 98 from those extra duties.",
        "provisions": [
            {"code": "9811.00.60", "rate": "Free", "text": "Samples valued not over $1 each, or marked, torn, perforated or otherwise treated so they are unsuitable for sale, used only for soliciting orders for products of foreign countries"}
        ],
        "citations": [
            {"label": "HTSUS 9811.00.60", "url": CH98},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20(a), 52(a)", "url": CH99},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the fibre, yarn or fabric, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported goods re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
]
te["rules"] = [
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Textile country of origin: fibre of 5301–5305 is from where it was grown (waste from where it was garnetted); "
        "flax and jute yarn from where it was spun; paper yarn from where it was made, except that yarn of imported paper keeps "
        "the paper's origin; fabric "
        "from where it was woven, or where greige fabric was both dyed and printed with two further finishing operations",
        "citations": [{"label": "19 CFR 102.21(c)", "url": ecfr(19, "102.21")}],
    },
    {
        "id": "textile-mid",
        "agency": "CBP",
        "title": "Manufacturer identification code (MID) of the company that performed the origin-conferring operation on every "
        "entry — this replaced the textile declaration, eliminated in 2011",
        "citations": [
            {"label": "19 CFR 102.23", "url": ecfr(19, "102.23")},
            {"label": "76 FR 14575 (textile declarations eliminated)", "url": src("fr-2011-6253")["url"]},
        ],
    },
    {
        "id": "cita-transship",
        "agency": "CBP / CITA",
        "title": "Entry is denied for textiles from a company named by CITA in the Federal Register for illegal transshipment "
        "or for being unable to verify production",
        "citations": [{"label": "19 CFR 102.24", "url": ecfr(19, "102.24")}],
    },
    {
        "id": "invoice",
        "agency": "CBP",
        "title": "Invoice details: fibre content by weight with each fibre's generic name and percentage, and for fabric the "
        "construction, finish (bleached, dyed, printed) and width that pick the 10-digit line",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Fiber Products Identification Act: fibres, yarns and fabrics sold onward must show fibre content by "
        "generic name — \"linen\" is an accepted name for flax — and the country where processed or made",
        "citations": [
            {"label": "16 CFR 303.45(a)(17)", "url": ecfr(16, "303.45")},
            {"label": "16 CFR 303.6 (generic names)", "url": ecfr(16, "303.6")},
            {"label": "16 CFR 303.33 (country of origin)", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "hemp",
        "agency": "DEA / USDA",
        "title": "Hemp fibre, stalks, yarn and fabric are not controlled substances: the Controlled Substances Act excludes "
        "hemp and the mature stalks and fibre of Cannabis sativa from \"marihuana\". USDA's Domestic Hemp Production Program "
        "(7 CFR 990) licenses and tests U.S. growers and sets no import permit. A new statutory hemp definition (total THC, "
        "industrial hemp for fibre included) takes effect November 12, 2026",
        "citations": [
            {"label": "21 U.S.C. 802(16)(B)", "url": src("usc-21-802")["url"]},
            {"label": "7 CFR part 990", "url": ecfr_part(7, 990)},
            {"label": "7 CFR 990.1 (definitions)", "url": ecfr(7, "990.1")},
            {"label": "P.L. 119-37, sec. 781", "url": src("pl-119-37")["url"]},
        ],
    },
    {
        "id": "aphis",
        "agency": "USDA APHIS",
        "title": "Raw plant fibres need no APHIS permit or phytosanitary certificate — Chapter 53 fibres are not regulated "
        "articles in 7 CFR part 319 — but as plant products they can be held for inspection at the first port and treated or "
        "refused if they carry plant pests. Used jute or burlap bagging from khapra-beetle countries, and cargo packed in it, "
        "must be treated",
        "citations": [
            {"label": "7 CFR 330.105 (inspection)", "url": ecfr(7, "330.105")},
            {"label": "7 CFR 319.75-2 (khapra beetle: used jute bagging)", "url": ecfr(7, "319.75-2")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made with "
        "forced labor and excluded unless the importer rebuts it; linen–cotton blends fall under the cotton tracing guidance",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or, for bales of fibre and piece goods, on the container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
TEXTILE = ["textile-origin", "textile-mid", "cita-transship", "invoice", "ftc-labeling", "uflpa", "cbp-marking"]
FIBRE = ["textile-origin", "textile-mid", "invoice", "ftc-labeling", "aphis", "uflpa", "cbp-marking"]
GROUP_RULES = {
    "5301": FIBRE,
    "5302": FIBRE[:4] + ["hemp"] + FIBRE[4:],
    "5303": FIBRE,
    "5305": FIBRE,
    "5306": TEXTILE,
    "5307": TEXTILE,
    "5308": TEXTILE[:5] + ["hemp"] + TEXTILE[5:],
    "5309": TEXTILE,
    "5310": TEXTILE + ["aphis"],
    "5311": TEXTILE[:5] + ["hemp"] + TEXTILE[5:],
}
GROUP_NOTES = {
    "5301": "Flax fibre is from the country where it was grown; tow and waste from where it was garnetted, or else where "
    "the waste arose. Raw fibre needs no APHIS permit but can be held for port inspection.",
    "5302": "Hemp stalk fibre is excluded from \"marihuana\" under the Controlled Substances Act; 7 CFR 990 licenses U.S. "
    "growers only, so no hemp permit is needed to import it.",
    "5303": "Raw jute and kenaf take the origin of the country where grown. Fibre needs no APHIS permit; used jute "
    "bagging used as packing is regulated under the khapra beetle rule.",
    "5305": "One line for coir, abaca, ramie, sisal and other fibres. Coir pith (coco peat) is 1404.90, not here; sisal "
    "baler twine is heading 5607.",
    "5306": "Flax yarn takes the origin of the country where it was spun. Polished or glazed yarn of 1,429 decitex or more "
    "is twine of heading 5607.",
    "5307": "Jute yarn takes the origin of the spinning country. Yarn over 20,000 decitex is twine or cordage of heading 5607.",
    "5308": "Paper yarn (2.7%) spun from imported paper of headings 4707, 4801–4806, 4811 or 4818 keeps the paper's "
    "origin. Chinese ramie and other yarn (5308.90.90) is List 4A, not List 3.",
    "5309": "Linen fabric takes the origin of the weaving country; dyeing and printing alone do not change it. Blends split "
    "at 85% flax, then by wool content and finish.",
    "5310": "Burlap and hessian take the origin of the weaving country. Sacks and bags of jute are heading 6305, not here.",
    "5311": "Hemp, ramie and paper-yarn fabrics. Hemp fabric has its own statistical line (5311.00.40.10); paper-yarn "
    "fabric is 2.7%.",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES[g["heading"]]
DUTIABLE = ("5301.21", "5301.29", "5308.90.10", "5309.21.20", "5309.21.30", "5309.29.20", "5311.00.20", "5311.00.60")
RULING = ("5308", "5309", "5311", "5306", "5307")
for ln in te["lines"]:
    h = ln["hts"]
    ln["ruleIds"] = GROUP_RULES[h[:4]]
    lev = ["usmca", "exception-lists"]
    if h.startswith(DUTIABLE):
        lev.append("fta")
    if h.startswith(RULING) or h.startswith("5305"):
        lev.append("ruling")
    lev += ["samples", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China lists "
    "and the hemp definition change by proclamation, USTR notice or statute; check them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 53 FAQ: Linen, Jute, Hemp & Coir HS Codes and Import Tariffs"
fc["seo"]["title"] = "Jute, Linen & Hemp HS Code and Tariff FAQ 2026: Burlap, Flax Yarn, Sisal, Coir (HTS Chapter 53) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing Chapter 53 goods: the HS code for jute, burlap, linen fabric, flax yarn, "
    "hemp, sisal, coir, abaca and paper yarn, and the 2026 tariffs on jute and linen from India, Bangladesh, the EU and China."
)
fc["seo"]["keywords"] = [
    "jute hs code",
    "linen fabric hs code",
    "burlap hs code",
    "hessian cloth hs code",
    "flax yarn hs code",
    "hemp fabric hs code",
    "sisal hs code",
    "coir hs code",
    "abaca fiber hs code",
    "paper yarn hs code",
    "linen tariff code",
    "hts chapter 53 tariff updates",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing flax, linen, jute, hemp, coir and the other Chapter 53 "
    "fibres into the U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 53 base rates are low — Free on 46 of 62 lines, 14.5% at most — and unchanged since January 2025. The extra "
    "duty by country decides the cost.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff: India, Bangladesh, Sri Lanka and the UK 10% on "
    "top of the base rate, EU linen 10% in total. No exception list covers Indian jute or EU linen.",
    "China and Brazil pay 37.5% extra on almost every line (China 20% in all on ramie yarn); Belarus pays Column 2 rates.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Linen and jute are textiles: origin follows 19 CFR 102.21 (fabric is from where it was woven), every entry needs a "
    "manufacturer ID, and hemp fibre is not a controlled substance.",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "jute-hs-code",
        "question": "What is the HS code for jute, burlap and hessian cloth?",
        "searchedAs": ["jute hs code", "raw jute hs code", "jute fabric hs code", "burlap hs code", "hessian hs code", "jute hessian cloth hs code", "jute cloth hs code", "burlap fabric hs code"],
        "answer": "Raw or retted jute is 5303.10.00 and processed jute fibre and waste 5303.90.00; jute yarn is 5307 and woven "
        "jute fabric — burlap and hessian — is 5310: 5310.10.00 unbleached (split by width) and 5310.90.00 bleached, dyed or "
        "printed. All are Free at the general rate. Jute sacks and bags are 6305.10 and jute twine or rope heading 5607, "
        "outside Chapter 53.",
        "link": "",
    },
    {
        "id": "linen-fabric-hs-code",
        "question": "What is the HS code for linen fabric?",
        "searchedAs": ["linen fabric hs code", "flax fabric hs code", "100 linen fabric hs code", "woven linen fabric hs code", "printed linen fabric hs code", "hs code 5309", "hs code 5309.11", "hs code 5309.29"],
        "answer": "Woven linen (flax) fabric is heading 5309. With 85% or more flax it is 5309.11 (unbleached or bleached) or "
        "5309.19 (dyed, printed or of coloured yarns), both Free. Below 85% flax it is 5309.21 or 5309.29: 14.5% with more "
        "than 17% wool, 6.9% for unbleached or bleached blends with cotton and man-made fibre (5309.21.30), Free otherwise. Knitted linen "
        "fabric is chapter 60.",
        "link": "",
    },
    {
        "id": "linen-blends",
        "question": "How are cotton–linen, linen–viscose and polyester–linen fabrics classified?",
        "searchedAs": ["cotton linen fabric hs code", "linen viscose fabric hs code", "polyester linen fabric hs code", "linen cotton blend hs code"],
        "answer": "By the fibre that predominates by weight (Section XI note 2). If flax weighs more than any other single "
        "fibre, the fabric is 5309; with equal weights it goes to the heading last in numerical order, so a 50/50 "
        "linen–cotton fabric is 5309 but a 50/50 linen–viscose or linen–polyester fabric is a man-made fibre fabric "
        "(chapters 54–55). Linen–cotton blends fall under CBP's cotton guidance for the UFLPA.",
        "link": "tariff-engineering",
    },
    {
        "id": "flax-hs-code",
        "question": "What is the HS code for flax fibre and linen yarn?",
        "searchedAs": ["flax hs code", "flax fiber hs code", "flax yarn hs code", "linen yarn hs code", "linen thread hs code", "100 linen yarn hs code"],
        "answer": "Flax fibre is heading 5301: raw or retted 5301.10.00 (Free), broken or scutched 5301.21.00 (0.2¢/kg), "
        "hackled or otherwise processed 5301.29.00 (3.8%), tow and waste 5301.30.00 (Free). Flax (linen) yarn is 5306.10 "
        "single or 5306.20 multiple, both Free. Flaxseed is heading 1204, not Chapter 53.",
        "link": "",
    },
    {
        "id": "hemp-hs-code",
        "question": "What is the HS code for hemp fibre and hemp fabric, and can hemp fibre be imported?",
        "searchedAs": ["hemp fiber hs code", "hemp fabric hs code", "hemp hs code", "hemp tariffs"],
        "answer": "True hemp fibre is 5302 (Free), hemp yarn 5308.20.00 (Free) and woven hemp fabric 5311.00.40.10 (Free). "
        "Hemp stalks and fibre are excluded from \"marihuana\" under the Controlled Substances Act, and USDA's hemp rules "
        "(7 CFR 990) license U.S. growers, not importers, so fibre imports need no hemp permit. Most origins pay the 2026 "
        "Section 301 tariff; China pays 37.5%.",
        "link": "tariff-engineering",
    },
    {
        "id": "sisal-hs-code",
        "question": "What is the HS code for sisal fibre, sisal yarn and sisal twine?",
        "searchedAs": ["sisal hs code", "sisal fibre hs code", "sisal yarn hs code", "sisal twine hs code", "sisal rope hs code"],
        "answer": "Sisal fibre, raw or processed but not spun, is 5305.00.00 (Free). Sisal yarn is 5308.90.90 (Free) up to "
        "20,000 decitex; heavier yarn and binder or baler twine of sisal are heading 5607, outside Chapter 53 (Section XI "
        "note 3). Sisal rugs and carpets are chapter 57.",
        "link": "",
    },
    {
        "id": "coir-hs-code",
        "question": "What is the HS code for coir (coconut fibre), coir yarn and coir pith?",
        "searchedAs": ["coir hs code", "coconut fiber hs code", "coir fiber hs code", "coconut coir hs code", "coir pith hs code"],
        "answer": "Coir fibre is 5305.00.00 and coir yarn 5308.10.00, both Free; coir yarn of three or more plies is treated "
        "as twine (5607). Coir pith or coco peat — the dust and short particles left from fibre extraction — is classified "
        "in 1404.90 (CBP ruling H061739). Coir doormats are chapter 57.",
        "link": "tariff-engineering",
    },
    {
        "id": "abaca-ramie-paper",
        "question": "What is the HS code for abaca, ramie and paper yarn?",
        "searchedAs": ["abaca hs code", "abaca fiber hs code", "ramie fabric hs code", "paper yarn hs code", "paper thread hs code"],
        "answer": "Abaca (Manila hemp) and ramie fibre are 5305.00.00 (Free); ramie yarn is 5308.90.90 and ramie fabric "
        "5311.00 (Free unless it has more than 17% wool). Paper yarn is 5308.90.10 and woven fabric of paper yarn 5311.00.60, "
        "both 2.7% at the general rate.",
        "link": "",
    },
    {
        "id": "linen-tariff-code-goods",
        "question": "Are bed linen, linen shirts and linen tablecloths in Chapter 53?",
        "searchedAs": ["linen tariff code", "bed linen tariff code", "linen shirt tariff code", "linen tablecloth tariff code", "linen dress tariff code"],
        "answer": "No. Chapter 53 covers fibre, yarn and fabric only. Fabric that is cut to shape, hemmed or sewn is \"made "
        "up\" (Section XI notes 7–8): bed, table and kitchen linen go to heading 6302 and linen garments to chapters 61–62.",
        "link": "",
    },
    {
        "id": "jute-india-bangladesh",
        "question": "What is the U.S. tariff on jute from India and Bangladesh?",
        "searchedAs": ["jute import from bangladesh", "jute from bangladesh", "jute importers in usa", "indian jute import duty"],
        "answer": "Raw jute, jute yarn and jute fabric are Free at the general rate, so both countries pay just the 2026 "
        "Section 301 tariff: 10% (India 9903.05.44, Bangladesh 9903.05.26). Neither country's exception list covers jute. "
        "The 2025 IEEPA duties — up to 50% on Indian goods — ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "linen-eu",
        "question": "What is the tariff on linen fabric from Belgium, Italy and the EU?",
        "searchedAs": ["imported linen fabric", "imported linen fabric wholesale", "linen fabric import", "where does the best linen fabric come from"],
        "answer": "EU goods pay 10% in total in place of a lower base rate (9903.05.39): 85%-flax linen fabric, Free at the "
        "general rate, pays 10%. Flax–wool fabric at 14.5% pays only its base rate. The EU exception list names no Chapter 53 "
        "code. Belgium, Italy and the UK shipped 58% of the $138.6M of linen fabric imported in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "linen-china",
        "question": "What is the tariff on linen imported from China?",
        "searchedAs": ["import linen from china", "linen from china tariff"],
        "answer": "Chinese linen fabric pays 25% under Section 301 List 3 (9903.88.03) plus 12.5% under the 2026 action "
        "(9903.05.31) on top of the base rate: 37.5% on 85%-flax fabric, 44.4% on 6.9% blends and 52% on flax–wool fabric. "
        "No product exclusion covers Chapter 53. Ramie yarn (5308.90.90) is on List 4A: 20% in all.",
        "link": "tariff-updates",
    },
    {
        "id": "linen-origin",
        "question": "How is the country of origin of linen determined and labeled?",
        "searchedAs": ["linen country of origin", "linen fabric country of origin", "linen labeling"],
        "answer": "By CBP's textile rules (19 CFR 102.21): flax fibre is from where it was grown, yarn from where it was spun "
        "and fabric from where it was woven — dyeing and printing alone do not change it. Under the FTC's Textile Act rules "
        "\"linen\" is an accepted generic name for flax, and labels show the fibre content and the country where the "
        "product was processed or made.",
        "link": "tariff-engineering",
    },
    {
        "id": "linen-samples",
        "question": "Do linen and jute fabric samples pay duty?",
        "searchedAs": ["linen fabric sample hs code", "linen fabric swatch hs code"],
        "answer": "Samples worth $1 or less each, or marked, torn or perforated so they cannot be sold, and used only to "
        "solicit orders, can enter Free under 9811.00.60, which also takes them outside the Section 301 and China extra "
        "duties. Usable sample yardage is classified in 5309 or 5310 like any other fabric.",
        "link": "tariff-engineering",
    },
    {
        "id": "ch53-tariffs-2026",
        "question": "Are Chapter 53 imports subject to tariffs in 2026?",
        "searchedAs": ["hts chapter 53", "hts chapter 53 tariff updates", "linen tariff 2026", "hemp tariffs"],
        "answer": "Yes, mostly through the extra duty by country. Since July 24, 2026 the Section 301 tariff on 60 economies "
        "adds 10% or 12.5% (EU 10% in total), with exemptions only for Jordanian goods and CAFTA-DR claims (every line for Guatemala and El Salvador, yarn and fabric for the other CAFTA-DR members). China and "
        "Brazil pay 37.5%. The IEEPA tariffs ended February 24 and the Section 122 surcharge July 23, 2026.",
        "link": "tariff-updates",
    },
]

# Generator quirk: labels cut with "…" are copied into understandIndustry (mainHeadingLabel, searchText).
def untruncate(o):
    if isinstance(o, dict):
        return {k: untruncate(v) for k, v in o.items()}
    if isinstance(o, list):
        return [untruncate(v) for v in o]
    if isinstance(o, str):
        for t, full in TRUNC.items():
            o = o.replace(t, full).replace(t.lower(), full.lower())
    return o


d = untruncate(d)
assert "…" not in json.dumps(d, ensure_ascii=False), "truncated label left"

# ---------------------------------------------------------------- write
d["asOf"] = CHECKED
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
