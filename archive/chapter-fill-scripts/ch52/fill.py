"""Fill the writer parts of the generated Chapter 52 (Cotton) content file.

Run through run.sh (generate -> fill -> compact -> prettier -> validate).
Every fact below comes from: HTSUS 2026 Rev 21 (Chapter 52 notes, Chapter 99 notes 6, 20, 30, 50, 51, 52 and
subchapter IV, Chapter 98 subchapter XXIII, General Notes 11/29), measures.json, the Federal Register, eCFR
(up to date as of 2026-10-08), CBP, DHS, USDA/FSA, govinfo U.S. Code and UN Comtrade (chapter-52.json).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/52-cotton.json"
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
REL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename="
CH99 = REL + "Chapter%2099"
CH98 = REL + "Chapter%2098"
CH52 = REL + "Chapter%2052"
GN = REL + "General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))

NEW_SOURCES = {
    "cbp-fl-guidance": {
        "id": "cbp-fl-guidance",
        "publisher": "CBP",
        "citation": "CBP Publication No. 5560-0526",
        "document": "Operational guidance",
        "title": "CBP Forced Labor Enforcement Operational Guidance for Importers (UFLPA high-priority sectors, including cotton and cotton products; supply-chain tracing documentation)",
        "signed": None,
        "published": "2026-06-12",
        "url": "https://www.cbp.gov/document/guidance/cbp-forced-labor-enforcement-operational-guidance-importers",
    },
    "pl-117-78": {
        "id": "pl-117-78",
        "publisher": "Congress.gov",
        "citation": "P.L. 117-78 (135 Stat. 1525)",
        "document": "Public Law 117-78",
        "title": "Uyghur Forced Labor Prevention Act",
        "signed": "2021-12-23",
        "published": "2021-12-23",
        "url": "https://www.congress.gov/117/plaws/publ78/PLAW-117publ78.pdf",
    },
    "cbp-wro-xpcc": {
        "id": "cbp-wro-xpcc",
        "publisher": "CBP",
        "citation": "CBP national media release, December 2, 2020",
        "document": "Withhold release order",
        "title": "CBP Issues Detention Order on Cotton Products Made by Xinjiang Production and Construction Corps Using Prison Labor",
        "signed": None,
        "published": "2020-12-02",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-detention-order-cotton-products-made-xinjiang-production",
    },
    "cbp-wro-xinjiang": {
        "id": "cbp-wro-xinjiang",
        "publisher": "CBP",
        "citation": "CBP national media release, January 13, 2021",
        "document": "Withhold release order",
        "title": "CBP Issues Region-Wide Withhold Release Order on Products Made by Slave Labor in Xinjiang (cotton and tomato products)",
        "signed": None,
        "published": "2021-01-13",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-region-wide-withhold-release-order-products-made-slave",
    },
    "cbp-uflpa": {
        "id": "cbp-uflpa",
        "publisher": "CBP",
        "citation": "CBP web page (modified September 14, 2026)",
        "document": "Uyghur Forced Labor Prevention Act",
        "title": "Uyghur Forced Labor Prevention Act: the rebuttable presumption and CBP enforcement",
        "signed": None,
        "published": "2026-09-14",
        "url": "https://www.cbp.gov/trade/forced-labor/UFLPA",
    },
    "dhs-uflpa-entity-list": {
        "id": "dhs-uflpa-entity-list",
        "publisher": "DHS",
        "citation": "DHS web page (updated July 31, 2026)",
        "document": "UFLPA Entity List",
        "title": "UFLPA Entity List (includes the Xinjiang Production and Construction Corps, listed June 21, 2022)",
        "signed": None,
        "published": "2026-07-31",
        "url": "https://www.dhs.gov/uflpa-entity-list",
    },
    "usda-siq-18": {
        "id": "usda-siq-18",
        "publisher": "USDA Farm Service Agency",
        "citation": "USDA announcement, August 15, 2024",
        "document": "Special Cotton Import Quota Announcement Number 18",
        "title": "USDA Announces Special Import Quota #18 for Upland Cotton (9,442,589 kg; HTS 9903.52.18)",
        "signed": None,
        "published": "2024-08-15",
        "url": "https://www.fsa.usda.gov/Internet/FSA_EPAS_Reports/upquota081524.pdf",
    },
    "usc-7-9037": {
        "id": "usc-7-9037",
        "publisher": "govinfo (U.S. Code)",
        "citation": "7 U.S.C. 9037",
        "document": "Statute",
        "title": "Special marketing loan provisions for upland cotton: (a) special import quota, (b) limited global import quota (Agricultural Act of 2014, sec. 1207)",
        "signed": None,
        "published": "2024-01-01",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title7/html/USCODE-2024-title7-chap115-subchapII-sec9037.htm",
    },
    "hts-ch52": {
        "id": "hts-ch52",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 52",
        "document": "Chapter 52 notes",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 52: Cotton (additional U.S. notes 5-10, tariff-rate quotas)",
        "signed": None,
        "published": "2026-10-07",
        "url": CH52,
    },
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
JO_LIST = "5203 through 5212 (carded cotton, sewing thread, yarn and every woven cotton fabric), but not raw cotton (5201) or cotton waste (5202)"

LABELS = {
    "5201": ("Raw cotton, not carded or combed", "Raw cotton"),
    "5202": ("Cotton waste (yarn waste, garnetted stock, card strips)", "Cotton waste"),
    "5203": ("Cotton, carded or combed", "Carded cotton"),
    "5204": ("Cotton sewing thread", "Sewing thread"),
    "5205": ("Cotton yarn, 85% or more cotton, not for retail sale", "Cotton yarn 85%+"),
    "5206": ("Cotton yarn, under 85% cotton, not for retail sale", "Cotton blend yarn"),
    "5207": ("Cotton yarn put up for retail sale", "Retail cotton yarn"),
    "5208": ("Woven cotton fabric, 85%+ cotton, up to 200 g/m²", "Light cotton fabric"),
    "5209": ("Woven cotton fabric, 85%+ cotton, over 200 g/m² (incl. denim)", "Heavy cotton fabric"),
    "5210": ("Woven cotton blends with man-made fibre, up to 200 g/m²", "Light cotton blends"),
    "5211": ("Woven cotton blends with man-made fibre, over 200 g/m²", "Heavy cotton blends"),
    "5212": ("Other woven cotton fabrics (incl. cotton–wool blends)", "Other cotton fabric"),
}

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 52: Cotton — Raw Cotton, Cotton Yarn & Woven Cotton Fabric Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 52 Cotton Tariff 2026: Raw Cotton, Cotton Yarn & Cotton Fabric Import Duty Rates | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 525 HTS Chapter 52 lines — raw cotton and its tariff-rate quotas, cotton waste, sewing "
    "thread, cotton yarn, denim and woven cotton fabrics. General, FTA and Column 2 rates plus the 2026 extra duty for "
    "Pakistan, Korea, India, China and Mexico."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 52",
    "cotton tariff",
    "cotton tariff code",
    "cotton hs code",
    "cotton fabric hs code",
    "cotton yarn hs code",
    "raw cotton hs code",
    "denim fabric hs code",
    "cotton import duty",
    "US textile tariffs",
    "China textile tariffs",
    "cotton tariffs us",
]
ov["intro"] = (
    "Chapter 52 covers cotton from the bale to the loom: **raw cotton** (5201), **cotton waste** (5202), **carded or combed "
    "cotton** (5203), **sewing thread** (5204), **cotton yarn** (5205–5207) and **woven cotton fabrics** (5208–5212), "
    "including denim, poplin, sheeting, twill and duck. Knitted cotton fabric is in chapter 60, and cotton shirts, sheets "
    "and towels are in chapters 61–63. Of its **525 tariff lines**, 499 carry a base duty — mostly 5% to 12.5% on yarn and "
    "fabric, up to 16.5% — and raw cotton is under a **tariff-rate quota**: 4.4¢/kg or less inside the quota, **31.4¢/kg** "
    "outside it.\n\n"
    "The extra duty by country comes on top. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of "
    "10% or 12.5%** — Pakistan and India 10%, Korea and Japan 12.5% in total, the EU 10% in total. **China pays 37.5%** "
    "extra on almost every line (25% under List 3 plus 12.5%), Brazil 37.5%, and Canada **50%** under Section 338 on some "
    "raw cotton and cotton waste. USMCA and CAFTA-DR goods that meet the yarn-forward rule can enter free. Pakistan, "
    "South Korea and India supplied over half of the **$747.9M** imported in 2025."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "5201": (
        "Raw (ginned) cotton by staple length. Under a tariff-rate quota: in-quota lines (additional U.S. notes 5–8) pay Free "
        "to 4.4¢/kg, over-quota lines 31.4¢/kg; USDA special import quotas (9903.52.xx) can open more in-quota room. "
        "Imports were only $0.4M in 2025.",
        ["raw cotton", "upland cotton", "pima cotton", "extra-long staple cotton", "cotton lint", "ginned cotton", "cotton bales"],
    ),
    "5202": (
        "Yarn and thread waste (Free), garnetted stock (4.3%) and other waste such as card strips and lap waste (Free, "
        "or 7.8¢/kg outside the note 9 quota). $18.5M in 2025, mostly from Türkiye and Pakistan.",
        ["cotton waste", "cotton yarn waste", "thread waste", "garnetted stock", "cotton comber noil", "card strips"],
    ),
    "5203": (
        "Cotton carded or combed (sliver, card or comber lap), not yet spun. 4.3% to 5%, or 31.4¢/kg for processed fibre "
        "outside the note 10 quota.",
        ["carded cotton", "combed cotton", "cotton sliver", "cotton roving fibre"],
    ),
    "5204": (
        "Cotton sewing thread, for retail sale or not. 4.4% on all three lines; Italy and India were the top suppliers "
        "($11.2M in all).",
        ["cotton sewing thread", "cotton thread", "cotton embroidery thread", "cotton quilting thread"],
    ),
    "5205": (
        "Single and plied cotton yarn of 85% or more cotton, not for retail sale, split by carded or combed, yarn count (nm) "
        "and ring or open-end spinning. 3.7% to 12%, rising with fineness. $65.4M in 2025, led by Korea.",
        ["cotton yarn", "100% cotton yarn", "combed cotton yarn", "carded cotton yarn", "ring spun cotton yarn", "open end cotton yarn", "compact yarn"],
    ),
    "5206": (
        "Cotton yarn with less than 85% cotton (usually cotton–polyester), not for retail sale. 9.2% on every line.",
        ["polyester cotton yarn", "cotton blend yarn", "CVC yarn", "poly cotton yarn"],
    ),
    "5207": (
        "Cotton knitting, crochet and craft yarn in retail put-ups. Free at 85% or more cotton (5207.10), 5% otherwise. "
        "$51.5M in 2025; Canada, France and Türkiye lead.",
        ["cotton knitting yarn", "crochet cotton", "cotton yarn skein", "macrame cotton cord"],
    ),
    "5208": (
        "Light woven fabrics of 85%+ cotton (up to 200 g/m²): poplin, broadcloth, sheeting, printcloth, voile, lawn, "
        "chambray and shirting. 45% of the chapter's imports ($338.7M); printed plain weave (5208.52) alone was $228.5M. "
        "Rates 3% to 14.7%.",
        ["cotton poplin", "cotton voile", "cotton lawn", "cotton sheeting", "printed cotton fabric", "cotton muslin", "cotton shirting", "cotton cambric"],
    ),
    "5209": (
        "Heavy woven fabrics of 85%+ cotton (over 200 g/m²): denim (5209.42, 8.4%), duck and canvas, drill and twill. "
        "$129.1M in 2025, led by India and Mexico.",
        ["denim fabric", "cotton canvas", "cotton duck", "cotton twill", "cotton drill", "cotton gabardine", "100% cotton denim"],
    ),
    "5210": (
        "Light woven fabrics with under 85% cotton, mixed mainly with man-made fibre (poly-cotton), up to 200 g/m². 7.8% to "
        "15.5%. Pakistan ships nearly half.",
        ["poly cotton fabric", "polyester cotton fabric", "TC fabric", "CVC fabric", "cotton polyester poplin"],
    ),
    "5211": (
        "Heavy poly-cotton woven fabrics over 200 g/m², including stretch and blend denim (5211.42). Free to 8.4%; Italy, "
        "Türkiye and India lead.",
        ["poly cotton twill", "stretch denim fabric", "cotton blend canvas", "workwear fabric"],
    ),
    "5212": (
        "Other woven cotton fabrics, such as blends with wool or linen. 16.5% when 36% or more wool, otherwise Free to 7.8%.",
        ["cotton wool blend fabric", "cotton linen fabric", "cotton viscose blend fabric"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Printed cotton poplin from Pakistan",
        "line": "5208.52.40.20",
        "body": "Printed plain-weave poplin of 85% or more cotton, 43–68 average yarn number, is 11.4% at the general rate. "
        "Pakistan pays 10% Section 301 (9903.05.62) on top and has no exception list: a $50,000 shipment pays **$10,700** "
        "(21.4%).",
    },
    {
        "title": "Combed cotton yarn from China",
        "line": "5205.23.00.20",
        "body": "Single combed yarn of 85% or more cotton (43–52 nm) is 8.6% at the general rate. China adds 25% under "
        "Section 301 List 3 (9903.88.03) and 12.5% under the 2026 action (9903.05.31): a $20,000 shipment pays **$9,220** "
        "(46.1%). No product exclusion in force covers Chapter 52.",
    },
    {
        "title": "Blue denim from Mexico, with and without USMCA",
        "line": "5209.42.00.20",
        "body": "Blue denim is 8.4% at the general rate. Woven in Mexico from North American yarn (the USMCA yarn-forward rule, "
        "General Note 11), it enters Free and is exempt from the 10% Section 301 duty (9903.05.94): **$0** on $40,000. "
        "Without a USMCA claim it pays 18.4%, **$7,360**.",
    },
    {
        "title": "Cotton shirting from South Korea",
        "line": "5208.42.40.00",
        "body": "Yarn-dyed plain weave of 85% or more cotton is 11.4% at the general rate. Under U.S. note 52(k), Korean goods pay "
        "12.5% in total in place of a lower base rate (9903.05.71), KORUS claim or not: **$1,250** on $10,000.",
    },
    {
        "title": "Over-quota upland cotton from India",
        "line": "5201.00.18.00",
        "body": "Upland cotton under 28.575 mm staple entered outside the note 5 quota pays 31.4¢/kg plus India's 10% Section 301 "
        "duty (9903.05.44). 20,000 kg valued at $40,000 pays $6,280 + $4,000 = **$10,280**, plus the cotton research and "
        "promotion assessment of 1.3247¢/kg ($264.94, 7 CFR 1205.510). Within the quota (5201.00.14) the base rate is Free.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [
    {"name": {"Rep. of Korea": "South Korea"}.get(c["country"], c["country"]), "importsUsd": c["importsUsd"]}
    for c in d["understandIndustry"]["byCountry"][:5]
]
ts["biggestLines"] = [
    {"hts": "5208.52", "label": "Printed plain-weave cotton fabric, 85%+ cotton, 100–200 g/m²"},
    {"hts": "5207.10", "label": "Cotton yarn for retail sale, 85%+ cotton"},
    {"hts": "5209.42", "label": "Denim, 85%+ cotton, over 200 g/m²"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line (for example, yarn number or weave) each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Subheading note 1.** For 5209.42 and 5211.42, \"denim\" means fabrics of yarns of different colours, of 3-thread or "
    "4-thread twill (including broken twill), warp faced, whose warp yarns are all one colour and whose weft yarns are "
    "unbleached, bleached, dyed grey or a lighter shade of the warp colour.\n\n"
    "The Section XI (textiles) notes also apply. **Note 2:** a blend is classified as if it consisted wholly of the fibre "
    "that predominates by weight — a fabric with more cotton than polyester is a cotton fabric (5210–5212), one with more "
    "polyester is chapter 54 or 55. **Note 4:** yarn is \"put up for retail sale\" (5207) on cards, reels or tubes, or in "
    "balls, hanks or skeins of limited weight. **Notes 7–8:** fabric cut to shape or hemmed is a made-up article of chapters "
    "61–63."
)
ov["notes"]["additionalUsNotes"] = (
    "**Notes 1–3.** Staple length is set by the Official Cotton Standards of the U.S. Department of Agriculture; \"nm\" is the "
    "number of 1,000-metre lengths per kilogram of yarn; the \"number\" of a woven fabric is its average yarn number, "
    "computed with the formulas in note 3(a).\n\n"
    "**Note 4.** \"Certified hand-loomed fabrics\" (3% base, Free for GSP, AGOA and CBERA beneficiaries) are made on a "
    "non-power loom by a cottage industry and certified by the producing country's government.\n\n"
    "**Notes 5–10 (tariff-rate quotas).** In-quota entries of raw cotton, card strips and processed fibre are limited per "
    "year: 20,207.05 t of short-staple cotton (5201.00.14, with country allocations: India & Pakistan 908,764 kg, China "
    "621,780 kg, Egypt & Sudan 355,532 kg, Brazil 280,648 kg, Peru 112,469 kg and others), 1,400 t of harsh or rough cotton "
    "(5201.00.24), 11,500 t of 1-1/8\" to 1-3/8\" cotton (5201.00.34), 40,100 t of extra-long-staple cotton (5201.00.60), "
    "3,335,427 kg of card strips and lap, sliver and roving waste (5202.99.10) and 2,500 kg of processed fibre (5203.00.10). "
    "Goods of Mexico are not counted in these quotas, and only WTO members may use them. Entries above the quota pay the "
    "over-quota rate (31.4¢/kg, or 7.8¢/kg for card strips).\n\n"
    "**Statistical note 1** defines the fabric types used in the 10-digit lines: poplin or broadcloth, sheeting, cheesecloth, "
    "printcloth, lawns, voiles or batistes, sateens, oxford cloth, duck, square construction, napped, combed, osnaburg, blue "
    "denim and discharge-printed fabrics. The three-digit numbers in brackets (for example 225 for blue denim) are textile "
    "category numbers used to monitor shipments."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 52 Tariff Updates: Raw Cotton, Cotton Yarn & Cotton Fabric (2025–2026)"
tu["seo"]["title"] = "Cotton Tariff Updates 2026: HTS Chapter 52 — Section 301, China List 3, Canada 338, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 52 cotton imports since January 2025: unchanged base rates and quotas, the end of the IEEPA "
    "tariffs and the Section 122 surcharge, the 2026 Section 301 tariffs, China List 3, Brazil and Canada's Section 338 duty."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 52 tariff updates",
    "cotton tariff updates 2026",
    "cotton tariffs us",
    "China textile tariffs",
    "Pakistan cotton fabric tariff",
    "India cotton tariff",
    "Section 301 cotton duties",
    "US textile tariff updates",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 525 Chapter 52 lines carry the same base rates and the "
    "same raw-cotton quotas in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — 50% on Indian goods from August 27, 2025, 19% on "
    "Pakistani and Indonesian goods — **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them "
    "expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or "
    "12.5%**; Jordan's exception list and, for goods entered duty-free under CAFTA-DR, note 52(i) and the Guatemala and "
    "El Salvador lists exempt cotton yarn and fabric. China keeps its 25% List 3 duty, Brazil pays another 25%, and since **August 22, 2026 Canada pays 50%** "
    "under Section 338 on five raw-cotton and cotton-waste lines."
)
tu["scope"] = (
    "Measures that reach Chapter 52 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 Lists 3 and 4A, the Canada Section 338 duty, Russia's 35% rate in place "
    "of column 2, the Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended. The "
    "raw-cotton quotas and safeguards are in Chapter 52 and Chapter 99 subchapters III–IV. No antidumping or countervailing "
    "duty order and no Section 232 action covers a Chapter 52 line. For the rate each supplier pays, see Rates by country."
)
IE = {x["id"]: x for x in tu["inEffect"]}
EXEMPT = {
    "pk-section-301": (
        "Pakistan has no exception list, and no Chapter 52 subheading is on the general exemption list (U.S. note 52(b), "
        "9903.05.86). GSP (A, A+), printed on the hand-loomed and some raw-cotton lines, has been expired since December 31, "
        "2020. The 2025 IEEPA reciprocal duty on Pakistan (+19% from August 7, 2025) ended February 24, 2026.",
        "Pakistani cotton fabric and yarn — $176.7M in 2025, mostly printed and blended fabric — pay the base rate plus 10%: "
        "17% to 24.7% on most fabric lines.",
        ["eo-14389", "eo-14326", "cbp-gsp"],
    ),
    "kr-section-301": (
        "South Korea's rate is 12.5% in total in place of the base rate when the base rate is lower (U.S. note 52(k), "
        "9903.05.71). With a KORUS claim the base rate is Free, so Korean cotton yarn and fabric pay 12.5% in total; Korea has "
        "no exception list. " + ENDED,
        "Korean light cotton fabric (5208) — $100.7M of Korea's $121.6M in 2025 — pays 12.5% in total, KORUS claim or not.",
        ["eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list. GSP (A, A+) has been expired since December 31, 2020. The 2025 IEEPA duties (25% "
        "reciprocal plus 25% over Russian oil purchases) ended in February 2026.",
        "Indian cotton fabric and yarn pay the base rate plus 10%; over-quota raw cotton pays 31.4¢/kg plus 10%.",
        ["cbp-gsp", "eo-14384", "eo-14389"],
    ),
    "eu-section-301": (
        "The EU exception list (U.S. note 52(j)(2), 9903.05.97) names no Chapter 52 subheading. Under note 52(k), EU goods "
        "pay 10% in total in place of a base rate below 10% (9903.05.39), and no extra duty where the base rate is 10% or "
        "more. " + ENDED,
        "Italian, French and German cotton fabric and yarn pay 10% in total on lines with a base rate under 10%, and the "
        "base rate alone (10% to 16.5%) on the rest.",
        ["eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94, U.S. note 52(h)), including goods entered under the "
        "USMCA tariff preference levels in Chapter 98, subchapter XXIII. Under General Note 11, cotton yarn must be spun "
        "from fibre of another chapter and fabric woven from yarn of a non-listed heading (yarn forward). Mexican raw cotton "
        "is outside the Chapter 52 quotas and is Free under USMCA. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended "
        "February 24, 2026.",
        "Mexican denim, cotton fabric and yarn ($46.2M in 2025) pay $0 with a valid USMCA claim and the base rate plus 10% "
        "without one.",
        ["eo-14389", "hts-ch98-usmca"],
    ),
    "tr-section-301": (
        "Türkiye has no exception list for Chapter 52. The 2025 IEEPA reciprocal duty (+15%) ended February 24, 2026, and "
        "the Section 122 surcharge expired July 23, 2026.",
        "Turkish cotton waste, retail yarn and fabric pay the base rate plus 12.5%.",
        ["eo-14389", "eo-14326"],
    ),
    "jp-section-301": (
        "Japan's rate is 12.5% in total in place of a lower base rate (U.S. note 52(k), 9903.05.49); Japan has no exception "
        "list. " + ENDED,
        "Japanese cotton fabric pays 12.5% in total where the base rate is lower, and the base rate alone on 12.5%–16.5% lines.",
        ["eo-14389"],
    ),
    "cn-section-301": (
        "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers 230 of the 233 Chapter 52 subheadings. Two (5210.11.40, "
        "5210.11.60: unbleached poly-cotton plain weave) are on List 4A (+7.5%, 9903.88.15), and 5210.19.10 is on the "
        "suspended List 4B, so it pays only the 2026 duty. The 2026 action adds +12.5% (9903.05.31) on every line; China is "
        "on no exception list. The old List 4A exclusions for 5210.11.4040 and 5210.11.6020 (note 20(uuu)) have expired, "
        "and no exclusion in note 20(vvv) covers Chapter 52. USTR confirmed on October 7, 2026 that the 2018 actions "
        "continue. The IEEPA duties on China ended February 24, 2026.",
        "Chinese cotton yarn and fabric pay 37.5% on top of the base rate — 37.5% to 54% in total; unbleached poly-cotton "
        "sheeting of 5210.11.40/.60 pays 20% extra.",
        ["eo-14389"],
    ),
    "id-section-301": (
        "Indonesia's exception list (U.S. note 52(j)) names no Chapter 52 subheading. The 2025 IEEPA reciprocal duty (+19%) "
        "ended February 24, 2026.",
        "Indonesian cotton fabric and blend yarn pay the base rate plus 10%.",
        ["eo-14389", "eo-14326"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on raw cotton under 19.05 mm or of 34.925 mm and over (5201.00.05, 5201.00.80), yarn waste (5202.10), "
        "garnetted stock (5202.91) and other cotton waste (5202.99.50) applies with or without a USMCA claim. No Chapter 52 "
        "line is on the September 29, 2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian retail cotton yarn and fabric pay nothing extra with USMCA; the five listed raw-cotton and waste lines pay "
        "50% on top of the base rate (60% without a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 52 subheading. " + ENDED,
        "British cotton fabric and yarn pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 52. The 2025 IEEPA reciprocal duty (+20%) ended February 24, 2026.",
        "Vietnamese cotton yarn and fabric pay the base rate plus 12.5%.",
        ["eo-14389", "eo-14326"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 52 line; its exemption list (U.S. note 50(a)(ii), "
        "9903.05.03) names no Chapter 52 subheading. The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% "
        "reciprocal and 40%) ended February 24, 2026.",
        "Brazilian cotton — $2.7M in 2025 — pays 37.5% on top of the base rate, and over-quota raw cotton 31.4¢/kg plus 37.5%.",
        ["eo-14323", "eo-14389"],
    ),
    "eg-section-301": (
        "Egypt has no exception list for Chapter 52. Egyptian extra-long-staple cotton (5201.00.55–.80) shares the 40,100 t "
        "ELS quota of additional U.S. note 8. " + ENDED,
        "Egyptian cotton yarn and fabric pay the base rate plus 12.5%.",
        ["eo-14389", "hts-ch52"],
    ),
    "sv-section-301": (
        "Two reliefs apply when the CAFTA-DR rate (SPI P) is claimed: note 52(i) (9903.05.95) exempts textile goods entered "
        "free of duty under CAFTA-DR — in Chapter 52, sewing thread, yarn and woven fabric (5204–5212), not raw cotton, waste "
        "or carded cotton — and El Salvador's own list (U.S. note 52(j)(7)(iii), 9903.06.09) adds carded cotton (5203). " + ENDED,
        "Salvadoran cotton yarn ($2.9M in 2025) and fabric entered duty-free under CAFTA-DR pay $0. Raw cotton and waste pay "
        "10% in total (CAFTA-DR removes the base rate), as do the Free general-rate lines, which have no CAFTA-DR rate to claim.",
        ["eo-14389"],
    ),
    "gt-section-301": (
        "With a CAFTA-DR claim (SPI P), note 52(i) (9903.05.95) exempts sewing thread, yarn and woven fabric (5204–5212), and "
        "Guatemala's own list (U.S. note 52(j)(6)(iii), 9903.06.06) adds carded cotton (5203). Raw cotton and cotton waste "
        "are not textile goods under note 52(i) and pay 10%. " + ENDED,
        "Guatemalan carded cotton, yarn and fabric entered under CAFTA-DR pay $0; cotton waste — $0.6M of Guatemala's $1.5M "
        "in 2025 — raw cotton and the Free general-rate lines pay 10%.",
        ["eo-14389"],
    ),
    "hn-section-301": (
        "Honduras has no note 52(j) list. With a CAFTA-DR claim (SPI P), note 52(i) (9903.05.95) exempts sewing thread, yarn "
        "and woven fabric (5204–5212); raw cotton, waste and carded cotton (5201–5203) pay the 10% (9903.05.42). " + ENDED,
        "Honduran cotton yarn and fabric entered duty-free under CAFTA-DR pay $0; raw cotton, waste, carded cotton and the "
        "Free general-rate lines pay 10%.",
        ["eo-14389"],
    ),
    "pe-section-301": (
        "Peru has no exception list. The Peru TPA (SPI PE) removes the base rate but not the Section 301 duty (U.S. note "
        "52(a)). Peruvian short-staple cotton has a 112,469 kg allocation in the note 5 quota. " + ENDED,
        "Peruvian cotton yarn and fabric pay 12.5% in total with a PE claim.",
        ["eo-14389", "hts-ch52"],
    ),
    "ru-section-301": (
        "Russia pays column 2 rates (general note 3(b)) on Chapter 52, except single uncombed yarn of 43–52 nm (5205.13.20), "
        "which pays 35% in place of column 2 (U.S. note 30, 9903.90.08). The 12.5% Section 301 duty (9903.05.66) is added on "
        "every line.",
        "Russian cotton goods pay the column 2 rate (up to 47%) plus 12.5%.",
        [],
    ),
    "other-section-301": (
        "Exception lists in U.S. note 52(j) name Chapter 52 codes for only three economies: Jordan (" + JO_LIST + ", "
        "9903.06.20), and Guatemala and El Salvador for CAFTA-DR claims (the same subheadings, 9903.06.06 and 9903.06.09). "
        "Under note 52(i) (9903.05.95), thread, yarn and fabric (5204–5212) of Costa Rica, the Dominican Republic and "
        "Nicaragua entered duty-free under CAFTA-DR are exempt too. No Chapter 52 code is on "
        "the general exemption list (note 52(b)). " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian yarn and fabric and CAFTA-DR yarn and fabric enter "
        "without the Section 301 duty.",
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
base["title"] = "No Chapter 52 base-rate or quota changes"
base["detail"] = (
    "All 525 Chapter 52 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition, and the raw-cotton quota quantities in additional U.S. notes 5–10 are unchanged; no line was added, split or "
    "renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 Lists 3 and 4A continue",
       "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
       "review. For Chapter 52 this keeps +25% (9903.88.03) on 230 subheadings and +7.5% (9903.88.15) on 5210.11.40 and "
       "5210.11.60.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 52",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 52 line is on their annexes, so the five listed cotton lines keep paying the "
       "50% Section 338 duty.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; cotton lines stay on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. None of the five "
       "Chapter 52 provisions (5201.00.05, 5201.00.80, 5202.10.00, 5202.91.00, 5202.99.50) was removed; Revision 21 still "
       "lists them in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on some raw cotton and cotton waste",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which include "
       "raw cotton under 19.05 mm or of 34.925 mm and over, yarn waste, garnetted stock and other cotton waste. It is charged "
       "even when USMCA is claimed and on top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took "
       "effect August 22 after a 3-day suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 52 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), including Pakistan, India, Indonesia, Türkiye, "
       "Vietnam and Egypt; no Chapter 52 subheading is on the general exemption list (note 52(b)). EU goods pay 10% in total "
       "and Japanese and Korean goods 12.5% in total where the base rate is lower (note 52(k)). Jordan's list and the "
       "CAFTA-DR lists of Guatemala and El Salvador exempt 5203–5212, and note 52(i) exempts CAFTA-DR thread, yarn and fabric "
       "(5204–5212) entered duty-free; USMCA-qualifying goods are "
       "exempt (9903.05.93, 9903.05.94). FTA claims remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 52 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) and the textile tariff preference "
       "levels still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: cotton is a high-priority sector",
       "CBP's operational guidance for importers lists cotton and cotton products among the UFLPA high-priority sectors and "
       "asks for documents tracing the supply chain from the cotton bale to the finished product. Goods made wholly or in "
       "part in Xinjiang, or by an entity on the UFLPA Entity List, are presumed made with forced labor and denied entry.",
       None, None, "All (Xinjiang inputs)", ["cbp-fl-guidance", "pl-117-78"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 52 subheading was on the product "
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
       "25% reciprocal rate on cotton yarn and fabric ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. In Chapter "
       "52, AGOA (SPI D) is printed only on the nine certified hand-loomed fabric lines (5208.31.20 and others, 3% base). GSP "
       "(A, A+), printed on the same lines and on some raw-cotton and waste lines, remains expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 52 line; cotton yarn and "
       "fabric that originate under CAFTA-DR are not covered.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 52 "
       "line on top of the 25% List 3 duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian cotton yarn and fabric. Ended "
       "February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Vietnam +20%, Pakistan "
       "and Indonesia +19%, Türkiye +15%, and 15% in total for EU, Japanese and Korean goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 52 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the 25% List 3 duty on cotton yarn and fabric.",
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
ui["h1"] = "HTS Chapter 52: Cotton — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "Cotton Imports to the U.S. by Country: Pakistan, Korea, India, Italy — HTS Chapter 52 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of cotton yarn and fabric 2020–2025 by country, product and year: $747.9M in 2025, down 8.2%. Pakistan "
    "supplied 24%, South Korea 16% and India 14%; light woven cotton fabric (5208) was 45%."
)
ui["seo"]["keywords"] = [
    "cotton imports by country",
    "cotton importing countries",
    "cotton fabric imports",
    "cotton import pakistan",
    "cotton fabric from india",
    "US cotton yarn imports",
    "textile imports to the US",
]
ui["why"] = (
    "U.S. imports of Chapter 52 goods were **$747.9M in 2025**, down 8.2% from $814.9M in 2024 and 27% below the 2022 peak "
    "of $1,026.6M. Three suppliers shipped over half: **Pakistan $176.7M** (24%, -11.9%), **South Korea $121.6M** (16%) and "
    "**India $101.8M** (14%, -7.8%), followed by Italy ($52.6M, +6.3%), Mexico ($46.2M, -18%), Türkiye, Japan and China. "
    "Imports from China fell 39% to $35.0M.\n\n"
    "The U.S. grows and exports cotton, so it imports little raw fibre: raw cotton was $0.4M. The trade is **woven fabric** "
    "— 78% of the total — led by light fabric of 85% or more cotton (5208, $338.7M), and above all printed plain weave "
    "(5208.52, $228.5M) from Pakistan and Korea. Heavy fabric including denim (5209) was $129.1M, cotton yarn for weaving "
    "and knitting (5205–5206) $78.2M and retail craft yarn (5207) $51.5M.\n\n"
    "Through 2025 most suppliers paid the IEEPA tariffs — 50% on Indian goods from August 27, 19% on Pakistani goods from "
    "August 7 — on top of base rates of 5% to 15%, and China its 25% List 3 duty as well. The IEEPA duties ended on February "
    "24, 2026; since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies instead. 2025 is the latest full year of U.S. "
    "trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 52 (retrieved 2026-10-13)", "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. Country names follow Comtrade (\"Rep. of Korea\" is South Korea)."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 52 Cotton Tariff Rates by Country: Pakistan, Korea, India, China & More"
ia["seo"]["title"] = "Cotton Import Duty by Country 2026: Pakistan, South Korea, India, Italy, China — HTS Chapter 52 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on raw cotton, cotton yarn and woven cotton fabric by country: base rate plus the 2026 Section 301 "
    "duty, China's List 3, Brazil's 25% and Canada's 50% Section 338 duty, with USMCA, CAFTA-DR and KORUS applied."
)
ia["seo"]["keywords"] = [
    "cotton tariff rates by country",
    "Pakistan cotton fabric tariff",
    "India cotton tariff",
    "China textile tariffs",
    "Mexico denim USMCA",
    "Korea cotton fabric tariff",
    "USMCA textiles",
    "cotton fabric import duty",
]
ia["intro"] = (
    "The total rate on cotton depends on **what it is** — base rates run from Free to 16.5%, and 31.4¢/kg on over-quota raw "
    "cotton — and on **where it comes from**. Each cell below is the base rate for that product group plus the extra duty "
    "for that country, minus any preference, computed from the current tariff schedule with the same engine as the tariff "
    "calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026): **Pakistan, India and Indonesia pay 10%** on top of the base rate, Türkiye, Vietnam, Egypt and "
    "Peru 12.5%, while **South Korea and Japan pay 12.5% in total** and the EU 10% in total. **China and Brazil pay 37.5% "
    "more**, Canada **50%** on five raw-cotton and waste lines even with USMCA, and USMCA and CAFTA-DR goods that qualify "
    "pay nothing."
)
RULES = {
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62) on every line; no exception list. GSP has expired; the 19% "
    "IEEPA rate ended February 24, 2026.",
    "South Korea": "12.5% in total in place of a lower base rate (9903.05.71); with KORUS (applied here) the base rate is Free, "
    "so every line pays 12.5% in total. No exception list.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. GSP has expired; the IEEPA duties "
    "(up to 50%) ended in February 2026.",
    "Italy": "EU: 10% in total in place of a base rate under 10% (9903.05.39); the base rate alone where it is 10% or more. "
    "The EU exception list names no Chapter 52 code. The 15% IEEPA rate ended February 24, 2026.",
    "Mexico": "USMCA-qualifying (yarn forward, or within a tariff preference level): Free and no Section 301 duty "
    "(9903.05.94). Otherwise the base rate plus 10% (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list.",
    "Japan": "12.5% in total in place of a lower base rate (9903.05.49); the base rate alone on 12.5%–16.5% lines. No "
    "exception list.",
    "China": "Base rate plus 12.5% (9903.05.31) and 25% List 3 (9903.88.03) on 230 subheadings: 37.5% extra. 5210.11.40/.60 "
    "pay 7.5% List 4A (9903.88.15) instead, 5210.19.10 only the 12.5%. No exclusion in force.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on every line; Indonesia's exception list names no Chapter 52 code.",
    "France": "EU: 10% in total in place of a base rate under 10% (9903.05.39); the base rate alone where it is 10% or more. "
    "No Chapter 52 code is on the EU exception list.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on 5201.00.05, 5201.00.80, "
    "5202.10, 5202.91 and 5202.99.50 even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those lines.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 52 code.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 37.5% extra.",
    "Egypt": "Base rate plus 12.5% Section 301 (9903.05.36) on every line; no exception list.",
    "El Salvador": "CAFTA-DR (P, applied here): Free, and no Section 301 duty on 5204–5212 (note 52(i), 9903.05.95) or 5203 "
    "(own list, 9903.06.09). Raw cotton, waste and the Free general-rate lines (no CAFTA-DR rate to claim) pay 10% (9903.05.37).",
    "Guatemala": "CAFTA-DR (P, applied here): Free, and no Section 301 duty on 5204–5212 (note 52(i), 9903.05.95) or 5203 "
    "(own list, 9903.06.06). Raw cotton, waste and the Free general-rate lines pay 10% (9903.05.40).",
    "Honduras": "CAFTA-DR (P, applied here): Free, and no Section 301 duty on 5204–5212 (note 52(i), 9903.05.95). Raw cotton, "
    "waste, carded cotton and the Free general-rate lines pay 10% (9903.05.42).",
    "Peru": "Peru TPA (PE, applied here) removes the base rate; 12.5% Section 301 (9903.05.63) applies on every line.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% "
    "(9903.05.20–9903.05.84). Jordan's exception list (9903.06.20) exempts 5203–5212, and note 52(i) "
    "(9903.05.95) exempts CAFTA-DR thread, yarn and fabric of Costa Rica, the Dominican Republic and Nicaragua (not applied "
    "here, since no preference is claimed in this row); Nicaragua's own Section 301 tariff starts in 2027.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    extra = []
    if c["country"] in ("India", "Pakistan"):
        extra += ["cbp-gsp"]
    if c["country"] == "India":
        extra += ["eo-14384"]
    if c["country"] == "Mexico":
        extra += ["hts-ch98-usmca"]
    if c["country"] != "Any other country":
        extra += ["eo-14389"]
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
assert set(RULES) == {c["country"] for c in ia["countries"]}
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU, Japanese and Korean rates of \"10% / 12.5% in total\" replace the base rate when it is lower (U.S. note 52(k)); "
    "where the base rate is higher, it applies alone.",
    "Raw cotton: the in-quota and over-quota lines are shown as separate base rates. Quota availability, USDA special import "
    "quotas (9903.52.xx) and the Chapter 99 subchapter IV safeguard duties (9904.52.xx) are not applied.",
    "CAFTA-DR (El Salvador, Guatemala, Honduras): SPI P is claimed, so note 52(i) (9903.05.95) removes the Section 301 duty "
    "on textile goods of 5204–5212 and the Guatemala and El Salvador note 52(j) lists also on 5203. Raw cotton and cotton "
    "waste are not textile goods under the WTO textiles annex, and lines whose general rate is Free have no CAFTA-DR rate "
    "to claim, so both pay 10%.",
    "Not in the grid: the UFLPA presumption against goods made with Xinjiang cotton, CBP textile entry rules (origin under 19 "
    "CFR 102.21, manufacturer ID), APHIS permits for raw cotton and the cotton research and promotion assessment — see "
    "Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III and the Section 232 notes in the 2026 "
    "Revision 21. Note 52(b) (9903.05.86) names no Chapter 52 code. Note 52(j) names Chapter 52 codes only for Jordan "
    "(5203–5212, 215 subheadings, 9903.06.20) and, for CAFTA-DR claims, Guatemala and El Salvador (the same 215, 9903.06.06, "
    "9903.06.09); the UK, EU, Swiss, Taiwanese, Indonesian and other lists name none. Note 52(i) (9903.05.95) exempts "
    "CAFTA-DR textile goods entered duty-free; in Chapter 52 that is 5204–5212 (the WTO textiles annex leaves out raw "
    "cotton, waste and carded cotton). Note 50(a)(ii) names no Chapter 52 code for Brazil. Note 51(b)(3) puts "
    "5201.00.05, 5201.00.80, 5202.10.00, 5202.91.00 and 5202.99.50 on the Canada Section 338 list. Note 20 puts 230 "
    "Chapter 52 subheadings on List 3 and 5210.11.40/.60 on List 4A; 5210.19.10 is on suspended List 4B; the only "
    "Chapter 52 exclusions (notes 20(ss), (yy), (bbb), (jjj), (rrr), (sss)–(uuu)) have expired, and note 31 names no "
    "Chapter 52 code. Note 30 puts 5205.13.20 at 35% for Russia. No Section 232 heading (notes 16, 19, 33, 36–39) covers "
    "a Chapter 52 line except under the opt-in certified vehicle-part elections, which are not shown. No antidumping or "
    "countervailing duty order covers a Chapter 52 product."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Cotton Yarn & Fabric (HTS Ch. 52): Quotas, Origin Rules, UFLPA & Ways to Lower Duty"
te["seo"]["title"] = "Importing Cotton: TRQs, Textile Origin, UFLPA, Labeling & Ways to Lower Duty (HTS Chapter 52) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, USDA, FTC and DHS rules for each HTS Chapter 52 line — raw-cotton quotas, APHIS permits, the cotton "
    "assessment, textile origin (19 CFR 102.21), UFLPA — and the legal ways to pay less: USMCA, CAFTA-DR, exception lists, "
    "quotas, rulings, samples and drawback."
)
te["seo"]["keywords"] = [
    "HTS Chapter 52 tariff engineering",
    "cotton country of origin",
    "19 CFR 102.21 cotton",
    "UFLPA cotton",
    "Xinjiang cotton ban",
    "cotton import quota",
    "USMCA yarn forward rule",
    "cotton fabric swatch hs code",
    "16 CFR 303 textile labeling",
]
te["intro"] = (
    "Cotton is a textile and a farm commodity, so several agencies set the entry rules. **USDA** limits raw cotton through "
    "tariff-rate quotas and special import quotas, **APHIS** requires a permit for raw cotton and waste, and CBP collects "
    "the **cotton research and promotion assessment** on raw cotton, yarn and fabric. **CBP's textile rules decide origin**: "
    "raw cotton keeps the origin of where it was grown, yarn is from where it was spun and fabric from where it was woven "
    "(19 CFR 102.21). Under the **UFLPA**, goods made with Xinjiang cotton are presumed barred, and cotton is a "
    "high-priority enforcement sector.\n\n"
    "The ways to pay less are in the schedule: qualify for **USMCA** or **CAFTA-DR** under the yarn-forward rule (or a "
    "tariff preference level), source from a country whose **Section 301 exception list** covers cotton yarn and fabric "
    "(Jordan), enter raw cotton **within the quota**, get the classification right where the line decides the rate, enter "
    "**samples** under Chapter 98, and claim **drawback** on re-exports. Each depends on a document, listed below with its "
    "regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on cotton yarn and fabric made in Mexico or Canada",
        "saves": "The base rate (up to 16.5%) and the 10% Section 301 duty for Mexico or Canada",
        "appliesTo": "All lines, for goods that originate: yarn spun in North America from fibre of another chapter, fabric "
        "woven from North American yarn (General Note 11, Chapter 52 rules); or non-originating fabric and yarn within the "
        "USMCA tariff preference levels (Canada 71,765,252 SME of fabric and 6,000,000 kg of yarn; Mexico 22,800,000 SME of "
        "fabric a year)",
        "document": "A certification of origin from the importer, exporter or producer, with SPI \"S\" (or \"S+\" and the "
        "9823.52 / 9823.53 heading for tariff preference levels) on the entry line.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on 5201.00.05, 5201.00.80, 5202.10, 5202.91 "
        "and 5202.99.50. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 52 rules)", "url": GN},
            {"label": "HTSUS Chapter 98, subchapter XXIII, note 11 (tariff preference levels)", "url": CH98},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51, 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "cafta-dr",
        "title": "Claim CAFTA-DR on cotton yarn and fabric from Central America and the Dominican Republic",
        "saves": "The base rate and the 10% Section 301 duty",
        "appliesTo": "Sewing thread, yarn and fabric (5204–5212) of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and "
        "Nicaragua that meet the CAFTA-DR yarn-forward rule (General Note 29) and enter duty-free",
        "document": "Proof of origin under CAFTA-DR and SPI \"P\" on the entry line; the exemption heading 9903.05.95 (note "
        "52(i)), or 9903.06.06 / 9903.06.09 for Guatemala and El Salvador.",
        "caveat": "Lines with no CAFTA-DR rate (Free general-rate lines) cannot be entered under CAFTA-DR, so neither note "
        "52(i) nor the note 52(j) lists reach them; raw cotton and waste are outside note 52(i), and carded cotton (5203) is "
        "exempt only for Guatemala and El Salvador. Non-originating Nicaraguan goods face their own Section 301 duty from 2027.",
        "citations": [
            {"label": "HTSUS General Note 29", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), 52(j)(6)–(7)", "url": CH99},
            {"label": "19 CFR part 10, subpart J (CAFTA-DR)", "url": ecfr_part(19, 10)},
        ],
    },
    {
        "id": "exception-lists",
        "title": "Source from a country whose Section 301 exception list covers the line",
        "saves": "The whole 10%–12.5% Section 301 duty",
        "appliesTo": "Carded cotton, sewing thread, yarn and woven fabric (5203–5212) of Jordan; the same lines of Guatemala and "
        "El Salvador when CAFTA-DR is claimed (U.S. note 52(j))",
        "document": "Proof of origin for the country claimed (commercial invoice, manufacturer ID, production records) and the "
        "exemption heading (9903.06.20 for Jordan) on the entry line.",
        "caveat": "Origin follows 19 CFR 102.21: fabric is from where it was woven, so greige fabric woven elsewhere and only "
        "dyed in Jordan keeps its origin. Raw cotton and cotton waste are on no list.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)(13)", "url": CH99},
            {"label": "19 CFR 102.21 (textile origin)", "url": ecfr(19, "102.21")},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA rate where the base rate is the cost",
        "saves": "The base rate: up to 16.5% on fabric and 12% on yarn, 31.4¢/kg on over-quota raw cotton",
        "appliesTo": "The 499 dutiable lines, for goods of Korea, Australia, Bahrain, Chile, Colombia, Israel, Jordan, Morocco, "
        "Oman, Panama, Peru and Singapore that meet the agreement's textile rule (mostly yarn forward); AGOA only on certified "
        "hand-loomed fabric, CBERA (E) on hand-loomed fabric and on in-quota raw cotton, garnetted stock and carded cotton",
        "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, BH, CL, CO, IL, JO, MA, OM, PA, "
        "PE, SG).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)) — except under the Jordan list above — "
        "and Korea's 12.5% applies in total whatever the KORUS rate. GSP (A, A+) has been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a), (k)", "url": CH99},
            {"label": "CBP: GSP status", "url": src("cbp-gsp")["url"]},
        ],
    },
    {
        "id": "in-quota",
        "title": "Enter raw cotton within the tariff-rate quota or a USDA special import quota",
        "saves": "The over-quota rate: 31.4¢/kg on raw cotton and processed fibre, 7.8¢/kg on card strips (in-quota Free to 5%)",
        "appliesTo": "Raw cotton (5201), card strips and lap waste (5202.99) and processed fibre (5203.00): the in-quota lines "
        "of additional U.S. notes 5–10, and upland cotton entered under a USDA special import quota (9903.52.01–.26) or "
        "limited global import quota (9903.52.00)",
        "document": "Entry under the in-quota subheading while quota is open (quota status is set at entry summary, 19 CFR "
        "132.11); for a special import quota, a government certificate that the cotton is Gossypium hirsutum and the "
        "importer's certification of the purchase date.",
        "caveat": "USDA opens special import quotas only when the U.S. cotton price exceeds the world price for four weeks — for "
        "example Special Import Quota No. 18 of 9,442,589 kg, announced August 15, 2024. Mexican cotton is outside the quotas and "
        "Free under USMCA.",
        "citations": [
            {"label": "HTSUS Chapter 52, additional U.S. notes 5–10", "url": CH52},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 6 (9903.52)", "url": CH99},
            {"label": "7 U.S.C. 9037 (special and limited global import quotas)", "url": src("usc-7-9037")["url"]},
            {"label": "USDA: Special Import Quota No. 18 (August 15, 2024)", "url": src("usda-siq-18")["url"]},
            {"label": "19 CFR 132.11", "url": ecfr(19, "132.11")},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding classification ruling where the line decides the rate",
        "saves": "Up to several points of base rate: 85% or more cotton (5208–5209) vs. blends (5210–5212); 200 g/m² weight "
        "split; average yarn number; denim and certified hand-loomed fabric (3%); cotton vs. polyester by weight (Section XI "
        "note 2)",
        "appliesTo": "Any line where fibre content, weight, yarn number or weave is in doubt — especially cotton–polyester blends "
        "near 50%",
        "document": "A ruling request to CBP describing fibre content by weight, weight per m², yarn numbers, weave and finish "
        "(19 CFR part 177); invoices must state the same details (19 CFR 141.89).",
        "caveat": "Rulings apply to the transaction described; a different blend or construction may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Chapter 52 and Section XI notes", "url": CH52},
        ],
    },
    {
        "id": "samples",
        "title": "Enter swatches and header cards as samples",
        "saves": "All duty — base rate and the Section 301, China and Canada duties",
        "appliesTo": "Fabric swatches, headers and yarn samples valued at $1 or less each, or marked, torn or perforated so they "
        "cannot be sold, used only to solicit orders",
        "document": "Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.",
        "caveat": "Usable cuts or sample yardage do not qualify. U.S. notes 20, 51 and 52 exempt goods properly entered under "
        "Chapter 98 from those extra duties.",
        "provisions": [
            {"code": "9811.00.60", "rate": "Free", "text": "Samples valued not over $1 each, or marked, torn, perforated or otherwise treated so they are unsuitable for sale, used only for soliciting orders for products of foreign countries"}
        ],
        "citations": [
            {"label": "HTSUS 9811.00.60", "url": CH98},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20(a), 51, 52(a)", "url": CH99},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the cotton, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on yarn or fabric re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
    {
        "id": "assessment-refund",
        "title": "Reclaim the cotton assessment on U.S.-grown or non-upland cotton",
        "saves": "The research and promotion assessment (about 0.8–1.4¢ per kg of goods) on the U.S.-grown or extra-long-staple share",
        "appliesTo": "Raw cotton, yarn and fabric in the 7 CFR 1205.510 assessment table, when the cotton was grown in the "
        "United States or is not upland cotton (for example Pima or Egyptian Giza)",
        "document": "A reimbursement application to the Cotton Board with proof of the cotton's origin or type.",
        "caveat": "The assessment is collected by CBP at entry and refunded afterwards; it is not a customs duty.",
        "citations": [
            {"label": "7 CFR 1205.510", "url": ecfr(7, "1205.510")},
            {"label": "7 CFR 1205.520", "url": ecfr(7, "1205.520")},
        ],
    },
]
te["rules"] = [
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Textile country of origin: raw and carded cotton (5201, 5203) keep the origin of where the cotton was grown; "
        "cotton waste is from where it was garnetted, else where the waste arose; thread and yarn (5204–5207) from where they "
        "were spun; fabric (5208–5212) from where it was woven, or where greige fabric was both dyed and printed with two "
        "further finishing operations",
        "citations": [{"label": "19 CFR 102.21(c), (e)", "url": ecfr(19, "102.21")}],
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
        "title": "Invoice details: for cotton fabric the exact width, weave, finish, fibre percentages, threads per cm², weight "
        "per m² and average yarn number; for yarn the fibre content, single or plied, combed or uncombed, metric number and "
        "whether put up for retail sale",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Cotton fabrics; Yarns)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Fiber Products Identification Act: yarns and fabrics sold onward must show fibre content (\"100% "
        "cotton\"), the country where processed or made, and the manufacturer or dealer",
        "citations": [
            {"label": "16 CFR part 303", "url": ecfr_part(16, 303)},
            {"label": "16 CFR 303.33 (country of origin)", "url": ecfr(16, "303.33")},
            {"label": "16 CFR 303.45 (coverage)", "url": ecfr(16, "303.45")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP / DHS",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List (including the "
        "Xinjiang Production and Construction Corps) are presumed made with forced labor and excluded unless the importer "
        "rebuts it; cotton is a high-priority sector, with bale-level tracing expected. CBP's 2020 XPCC and 2021 region-wide "
        "withhold release orders on Xinjiang cotton preceded the Act.",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP: UFLPA enforcement", "url": src("cbp-uflpa")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
            {"label": "DHS: UFLPA Entity List", "url": src("dhs-uflpa-entity-list")["url"]},
            {"label": "CBP: Xinjiang cotton WRO (January 13, 2021)", "url": src("cbp-wro-xinjiang")["url"]},
            {"label": "CBP: XPCC cotton WRO (December 2, 2020)", "url": src("cbp-wro-xpcc")["url"]},
        ],
    },
    {
        "id": "aphis-cotton",
        "agency": "USDA APHIS",
        "title": "Raw cotton lint, linters and cotton waste (not yarn, thread or cloth) need an APHIS permit and must meet its "
        "treatment or utilization conditions against the pink bollworm",
        "citations": [
            {"label": "7 CFR 319.8", "url": ecfr(7, "319.8")},
            {"label": "7 CFR 319.8-2 (permits)", "url": ecfr(7, "319.8-2")},
        ],
    },
    {
        "id": "cotton-assessment",
        "agency": "USDA AMS / CBP",
        "title": "Cotton research and promotion assessment collected by CBP at entry: 1.3247¢/kg on raw cotton, and a "
        "fibre-content-based amount per kg on yarn and fabric (0.7743¢ to 1.4375¢/kg in Chapter 52)",
        "citations": [{"label": "7 CFR 1205.510", "url": ecfr(7, "1205.510")}],
    },
    {
        "id": "cotton-quota",
        "agency": "CBP / USDA",
        "title": "Tariff-rate quotas on raw cotton, card strips and processed fibre (additional U.S. notes 5–10); quota "
        "priority is set when the entry summary is presented",
        "citations": [
            {"label": "HTSUS Chapter 52, additional U.S. notes 5–10", "url": CH52},
            {"label": "19 CFR 132.11", "url": ecfr(19, "132.11")},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or, for bales, bulk yarn and piece goods, on its container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
BASE_RULES = ["textile-origin", "textile-mid", "invoice", "uflpa", "cbp-marking"]
GROUP_RULES = {
    "5201": BASE_RULES + ["aphis-cotton", "cotton-assessment", "cotton-quota"],
    "5202": BASE_RULES + ["aphis-cotton", "cotton-quota"],
    "5203": BASE_RULES + ["cotton-quota"],
}
YARN_FABRIC_RULES = BASE_RULES + ["cita-transship", "ftc-labeling", "cotton-assessment"]
GROUP_NOTES = {
    "5201": "Origin is where the cotton was grown. Entries need an APHIS permit, the quota lines decide the rate (in-quota "
    "Free to 4.4¢/kg, over-quota 31.4¢/kg), and CBP collects the 1.3247¢/kg cotton assessment.",
    "5202": "Waste takes the origin of the garnetting country, or else where it arose. Card strips and lap waste are under "
    "the note 9 quota; yarn waste, garnetted stock and other waste from Canada pay the 50% Section 338 duty.",
    "5203": "Carding or combing does not change origin (it stays where the cotton was grown). Processed fibre outside the "
    "2,500 kg quota pays 31.4¢/kg.",
    "5204": "Thread takes the origin of where it was spun. 4.4% base on all three lines; USMCA rules require sewing thread "
    "in apparel to be formed in North America.",
    "5205": "Yarn takes the origin of where it was spun. Invoices must state combed or uncombed, metric number and finish; "
    "rates rise with the yarn count.",
    "5206": "Blend yarn under 85% cotton is classified here only if cotton predominates by weight (Section XI note 2); 9.2% "
    "on every line.",
    "5207": "Retail put-ups follow Section XI note 4. Free at 85% or more cotton; fibre-content labels apply to yarn sold "
    "to consumers.",
    "5208": "Fabric takes the origin of where it was woven; dyeing and printing alone do not change it. Invoices need width, "
    "weight per m², thread count and average yarn number.",
    "5209": "Denim (5209.42) follows subheading note 1 and the blue denim definition. USMCA and CAFTA-DR need the yarn to be "
    "regional (yarn forward).",
    "5210": "Under 85% cotton but cotton predominant by weight; if polyester outweighs cotton the fabric is chapter 55. "
    "China's 5210.11.40/.60 pay List 4A (7.5%).",
    "5211": "Heavy blends, including stretch denim (5211.42). Weight above 200 g/m² and fibre percentages decide the line.",
    "5212": "Cotton blends with wool (16.5% at 36% or more wool) or other fibres; the 7 CFR 1205 assessment varies with the "
    "cotton share.",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES.get(g["heading"], YARN_FABRIC_RULES)
    g["note"] = GROUP_NOTES[g["heading"]]
for ln in te["lines"]:
    h = ln["hts"]
    ln["ruleIds"] = GROUP_RULES.get(h[:4], YARN_FABRIC_RULES)
    lev = ["usmca"]
    if h[:4] >= "5203":
        lev += ["cafta-dr", "exception-lists"]
    lev.append("fta")
    if h[:4] in ("5201", "5203") or h.startswith("5202.99"):
        lev.append("in-quota")
    lev += ["ruling", "samples", "drawback"]
    if not h.startswith(("5202", "5203")):
        lev.append("assessment-refund")
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, quota status and "
    "the Canada Section 338 list change by proclamation, USDA announcement and USTR notice; check them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 52 FAQ: Cotton HS Codes & Import Tariffs"
fc["seo"]["title"] = "Cotton HS Code & Tariff FAQ 2026: Cotton Fabric, Yarn, Denim, Raw Cotton (HTS Chapter 52) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing cotton: the HS / tariff code for cotton fabric, yarn, thread, denim and "
    "raw cotton, the 2026 tariffs on cotton from Pakistan, India and China, Xinjiang cotton and the UFLPA."
)
fc["seo"]["keywords"] = [
    "cotton hs code",
    "cotton tariff code",
    "cotton fabric hs code",
    "cotton yarn hs code",
    "raw cotton hs code",
    "denim fabric hs code",
    "hs code 5208",
    "100 cotton fabric hs code",
    "cotton tariffs us",
    "xinjiang cotton ban",
    "US textile tariffs",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing cotton into the U.S. — HS codes, tariffs by country and "
    "entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 52 base rates — up to 16.5% on fabric, 12% on yarn and 31.4¢/kg on over-quota raw cotton — and the raw-cotton "
    "quotas are unchanged since January 2025. 499 of 525 lines are dutiable.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff: Pakistan, India and Indonesia 10% on top, "
    "Korea and Japan 12.5% in total, the EU 10% in total.",
    "China and Brazil pay 37.5% extra on almost every line; Canada 50% under Section 338 on five raw-cotton and waste lines, "
    "even with USMCA.",
    "USMCA and CAFTA-DR yarn and fabric that meet the yarn-forward rule enter free of the base rate and the Section 301 "
    "duty; Jordan's exception list covers yarn and fabric too.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Goods made with Xinjiang cotton are presumed barred under the UFLPA; origin follows 19 CFR 102.21 (fabric is from where "
    "it was woven).",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "cotton-hs-code",
        "question": "What is the HS code (tariff code) for cotton?",
        "searchedAs": ["cotton hs code", "cotton tariff code", "cotton hs code india", "cotton hs code pakistan"],
        "answer": "Cotton is HTS Chapter 52: 5201 raw cotton, 5202 cotton waste, 5203 carded or combed cotton, 5204 sewing "
        "thread, 5205–5207 cotton yarn and 5208–5212 woven cotton fabrics. Knitted cotton fabric is chapter 60, and cotton "
        "shirts, dresses and bags are in chapters 42 and 61–63. The first six digits are shared worldwide, so an Indian or "
        "Pakistani HS code matches the U.S. HTS at that level.",
        "link": "",
    },
    {
        "id": "cotton-fabric-hs-code",
        "question": "What is the HS code for 100% cotton woven fabric?",
        "searchedAs": ["cotton fabric hs code", "100 cotton fabric hs code", "cotton woven fabric hs code", "100 cotton woven fabric hs code", "cotton fabric tariff code"],
        "answer": "Woven fabric of 85% or more cotton is 5208 if it weighs up to 200 g/m² and 5209 above that; under 85% cotton "
        "mixed with man-made fibre it is 5210 or 5211. The 6-digit split is by finish (unbleached, bleached, dyed, yarn-dyed, "
        "printed) and weave. Base rates run from Free to 14.7% on 5208 and 3% to 8.4% on 5209.",
        "link": "",
    },
    {
        "id": "hs-5208",
        "question": "What does HS code 5208 cover, and what is its tariff?",
        "searchedAs": ["hs code 5208", "hs code 5208.52", "hs code 5208.32", "hs code 5208.11"],
        "answer": "5208 is woven fabric of 85% or more cotton, weighing not more than 200 g/m² — poplin, sheeting, voile, "
        "lawn, shirting. It was 45% of U.S. Chapter 52 imports in 2025 ($338.7M); printed plain weave of 100–200 g/m² "
        "(5208.52) alone was $228.5M. Base rates are mostly 7% to 12.5% depending on yarn number; Pakistan and India add 10%, "
        "China 37.5%.",
        "link": "industry-areas",
    },
    {
        "id": "denim-hs-code",
        "question": "What is the HS code for denim fabric?",
        "searchedAs": ["denim fabric hs code", "jeans fabric hs code", "cotton denim fabric hs code", "hs code 5209.42", "100 cotton denim fabric hs code"],
        "answer": "Woven denim of 85% or more cotton weighing over 200 g/m² is 5209.42 (8.4%); blue denim is split at 360 g/m² "
        "for statistics. Denim with less than 85% cotton (stretch or poly-blend) is 5211.42 (8.1%). Lighter "
        "3- or 4-thread twill of yarns of different colours, up to 200 g/m², is 5208.43 (Free). Mexican denim woven from "
        "North American yarn enters free under USMCA.",
        "link": "",
    },
    {
        "id": "cotton-yarn-hs-code",
        "question": "What is the HS code for cotton yarn and cotton thread?",
        "searchedAs": ["cotton yarn hs code", "cotton thread hs code", "100 cotton yarn hs code", "cotton sewing thread hs code", "polyester cotton yarn hs code", "hts code for cotton thread"],
        "answer": "Cotton sewing thread is 5204 (4.4%). Other cotton yarn not put up for retail sale is 5205 at 85% or more "
        "cotton (3.7% to 12%, by yarn count and combing) or 5206 below 85%, such as poly-cotton (9.2%). Yarn put up for retail "
        "sale is 5207: Free at 85% or more cotton, 5% otherwise.",
        "link": "",
    },
    {
        "id": "raw-cotton-hs-code",
        "question": "What is the HS code and tariff for raw cotton?",
        "searchedAs": ["raw cotton hs code", "raw cotton bales hs code", "american raw cotton hs code", "brazilian raw cotton hs code"],
        "answer": "Raw cotton, not carded or combed, is 5201.00, split by staple length and quota status. In-quota entries "
        "pay Free to 4.4¢/kg; entries above the annual quotas of additional U.S. notes 5–8 pay 31.4¢/kg. Entries also need an "
        "APHIS permit and pay the cotton research and promotion assessment of 1.3247¢/kg.",
        "link": "tariff-engineering",
    },
    {
        "id": "cotton-import-quota",
        "question": "Does the U.S. have an import quota on cotton?",
        "searchedAs": ["cotton import quota", "what does an import quota do"],
        "answer": "Yes, a tariff-rate quota. Raw cotton, card strips and processed fibre enter at low in-quota rates up to "
        "yearly limits (for example 20,207 t of short-staple cotton, shared by country, and 40,100 t of extra-long-staple "
        "cotton) and at 31.4¢/kg beyond them. When U.S. prices exceed world prices, USDA opens special import quotas "
        "(9903.52) under 7 U.S.C. 9037. Mexican cotton is outside the quotas.",
        "link": "tariff-engineering",
    },
    {
        "id": "cotton-tariffs-us",
        "question": "Are cotton imports subject to tariffs in 2026?",
        "searchedAs": ["cotton tariffs", "cotton tariffs us", "cotton tariff", "cotton import duty"],
        "answer": "Yes. Most yarn and fabric carries a base duty of 5% to 15%, and since July 24, 2026 the Section 301 tariff on "
        "60 economies adds 10% or 12.5% (Korea and Japan 12.5% and the EU 10% in total). China and Brazil pay 37.5% extra, "
        "Canada 50% on some raw cotton and waste. The IEEPA tariffs ended February 24 and the Section 122 surcharge July 23, "
        "2026.",
        "link": "tariff-updates",
    },
    {
        "id": "cotton-from-pakistan",
        "question": "What is the U.S. tariff on cotton fabric from Pakistan?",
        "searchedAs": ["cotton from pakistan", "cotton fabric from pakistan", "cotton import pakistan", "cotton fabric hs code pakistan"],
        "answer": "Pakistani cotton fabric pays the base rate plus 10% Section 301 (9903.05.62): for example 21.4% on printed "
        "poplin of 5208.52.40 and 17% to 24.7% on most 5208 lines. Pakistan has no exception list, and GSP has expired. "
        "Pakistan was the largest supplier in 2025, at $176.7M.",
        "link": "industry-areas",
    },
    {
        "id": "cotton-from-india",
        "question": "What is the U.S. tariff on cotton fabric and yarn from India?",
        "searchedAs": ["cotton tariff india", "cotton fabric from india", "cotton fabric hs code india", "india cotton tariff removal"],
        "answer": "Indian cotton yarn and fabric pay the base rate plus 10% Section 301 (9903.05.44). The 50% IEEPA tariff of "
        "2025 ended in February 2026 (the extra 25% on February 7, the rest on February 24). India has no exception list.",
        "link": "tariff-updates",
    },
    {
        "id": "cotton-from-china",
        "question": "What is the tariff on cotton yarn and fabric from China?",
        "searchedAs": ["China textile tariffs", "cotton fabric from china", "cotton yarn from china"],
        "answer": "Almost every Chapter 52 line from China pays 25% under Section 301 List 3 (9903.88.03) plus 12.5% under the "
        "2026 action (9903.05.31) on top of the base rate — 37.5% to 54% in total on yarn and fabric. Unbleached poly-cotton "
        "sheeting of 5210.11.40/.60 pays 7.5% (List 4A) instead of 25%. No product exclusion is in force for Chapter 52.",
        "link": "tariff-updates",
    },
    {
        "id": "xinjiang-cotton",
        "question": "Is Xinjiang cotton banned in the U.S.?",
        "searchedAs": ["xinjiang cotton ban", "xinjiang cotton", "uflpa cotton", "xinjiang cotton controversy"],
        "answer": "Effectively yes. Under the Uyghur Forced Labor Prevention Act, goods made wholly or in part in Xinjiang are "
        "presumed made with forced labor and denied entry unless the importer proves otherwise. That covers yarn, fabric and "
        "garments made elsewhere from Xinjiang cotton. CBP lists cotton as a high-priority sector and expects tracing back to "
        "the bale.",
        "link": "tariff-engineering",
    },
    {
        "id": "cotton-country-of-origin",
        "question": "How is the country of origin of cotton fabric determined?",
        "searchedAs": ["cotton country of origin", "cotton place of origin", "pima cotton country of origin"],
        "answer": "By CBP's textile rules (19 CFR 102.21). Raw cotton is from where it was grown, yarn from where it was spun, "
        "and fabric from where it was woven — dyeing or printing alone does not change it unless greige fabric is both dyed "
        "and printed with two further finishing steps. The origin decides the Section 301 rate and FTA eligibility.",
        "link": "tariff-engineering",
    },
    {
        "id": "cotton-samples",
        "question": "Do cotton fabric swatches and samples pay duty?",
        "searchedAs": ["cotton fabric swatch hs code", "denim fabric sample hs code", "denim fabric swatch hs code", "100 cotton fabric swatch hs code"],
        "answer": "Swatches worth $1 or less each, or marked, torn or perforated so they cannot be sold, and used only to "
        "solicit orders, can enter Free under 9811.00.60, which also takes them outside the Section 301, China and Canada "
        "extra duties. Usable sample yardage is classified in 5208–5212 like any other fabric.",
        "link": "tariff-engineering",
    },
    {
        "id": "cotton-importing-countries",
        "question": "Where does the U.S. import cotton yarn and fabric from?",
        "searchedAs": ["cotton importing countries", "cotton import pakistan"],
        "answer": "In 2025 the U.S. imported $747.9M of Chapter 52 goods: Pakistan $176.7M (24%), South Korea $121.6M (16%), "
        "India $101.8M (14%), then Italy, Mexico, Türkiye, Japan and China. Woven fabric was 78% of the total; raw cotton "
        "imports were only $0.4M.",
        "link": "understand-industry",
    },
]

# ---------------------------------------------------------------- write
d["asOf"] = CHECKED
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
