"""Fill the writer parts of the generated Chapter 50 (Silk) content file.

Re-run after:
    cd insights-ui && pnpm tariff:generate-chapter --chapter 50 --slug 50-silk --title "Silk" \
        --countries IT,CN,KR,IN,GB,FR,JP,CH,TH,MX,CA,VN,BR,UZ --force
    python3 fill.py
    pnpm tariff:compact-chapters src/tariff-data/chapters/50-silk.json && npx prettier --write src/tariff-data/chapters/50-silk.json
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
CHECKED = "2026-10-12"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH50 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2050"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"


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
        "title": "CBP Forced Labor Enforcement Operational Guidance for Importers (UFLPA high-priority sector supply-chain tracing documentation, Appendix A)",
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
EU_LIST = "5004, 5005, 5006, 5007.10.30, 5007.10.60, 5007.20 and 5007.90.30"

LABELS = {
    "5001": ("Silkworm cocoons suitable for reeling", "Silkworm cocoons"),
    "5002": ("Raw silk (not thrown)", "Raw silk"),
    "5003": ("Silk waste: cocoons unfit for reeling, yarn waste, noils", "Silk waste"),
    "5004": ("Silk yarn (filament), not put up for retail sale", "Silk yarn"),
    "5005": ("Spun silk yarn (from silk waste), not for retail sale", "Spun silk yarn"),
    "5006": ("Silk yarn for retail sale; silkworm gut", "Retail silk yarn"),
    "5007": ("Woven silk fabrics (noil silk, 85%+ silk, other)", "Woven silk fabric"),
}

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 50: Silk — Raw Silk, Silk Yarn & Woven Silk Fabric Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 50 Silk Tariff 2026: Raw Silk, Silk Yarn & Woven Silk Fabric Import Duty Rates | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 30 HTS Chapter 50 lines — silkworm cocoons, raw silk, silk waste, silk yarn and woven silk "
    "fabrics (5007.20, noil silk). General, FTA and Column 2 rates plus the 2026 extra duty for China, Italy, Korea and India."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 50",
    "silk tariff",
    "silk import duty rates",
    "silk tariff code",
    "silk hs code",
    "silk fabric hs code",
    "HTS 5007.20 woven silk",
    "HTS 5004 silk yarn",
    "raw silk hs code",
    "China silk import duties",
    "Italy silk tariffs",
]
ov["intro"] = (
    "Chapter 50 covers silk from the cocoon to the loom: **silkworm cocoons** (5001), **raw silk** (5002), **silk waste** (5003), "
    "**silk yarn** — reeled filament (5004), spun from waste (5005) or put up for retail sale (5006) — and **woven silk fabrics** "
    "(5007). Silk scarves, ties, blouses and other made-up silk goods are not here; they are classified in chapters 61–63. Its "
    "**30 tariff lines** are mostly Free; the highest base rate is 3.9%, on silk fabrics with less than 85% silk.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% "
    "or 12.5%**, but EU, Swiss, Taiwanese, Indonesian and several other suppliers have exception lists that cover silk yarn and "
    "most silk fabric. **China pays 37.5%** extra on every line (25% under List 3 plus 12.5%), Brazil 37.5%, and **Canada 50%** "
    "under Section 338 on raw silk and silk waste, USMCA claim or not. Italy and China were the largest suppliers of the "
    "**$57.3M** imported in 2025 (23% each), followed by South Korea and India."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "5001": (
        "Cocoons of the silkworm that can still be reeled into raw silk. Free at every rate column. U.S. imports are tiny "
        "($7,483 in 2025).",
        ["silkworm cocoons", "mulberry silk cocoons", "Bombyx mori cocoons", "reelable cocoons"],
    ),
    "5002": (
        "Raw silk reeled from cocoons but not yet thrown (twisted). Free, but on Canada's Section 338 list, so Canadian raw silk "
        "pays 50% even with a USMCA claim.",
        ["raw silk", "grège silk", "reeled silk", "mulberry raw silk", "tussah raw silk"],
    ),
    "5003": (
        "Silk waste: cocoons unfit for reeling, yarn waste and garnetted stock. Free when not carded or combed (5003.00.10); "
        "2.5% when carded or combed (5003.00.90, silk noils and tops). Imports fell 98% in 2025.",
        ["silk waste", "silk noil", "silk tops", "carded silk", "pierced cocoons", "garnetted silk"],
    ),
    "5004": (
        "Reeled (filament) silk yarn, thrown or twisted, not put up for retail sale — the yarn weavers and knitters buy on cones. "
        "Free; Column 2 40%. China's largest Chapter 50 export to the U.S. ($6.4M in 2025).",
        ["silk yarn", "filament silk yarn", "mulberry silk yarn", "silk thread", "thrown silk", "organzine", "tram silk"],
    ),
    "5005": (
        "Spun silk yarn made from silk waste or noil, not put up for retail sale; split at 85% silk by weight. Free; Column 2 50%.",
        ["spun silk yarn", "silk noil yarn", "schappe silk", "bourette silk yarn"],
    ),
    "5006": (
        "Silk yarn of either kind put up for retail sale (skeins and balls of 85 g or less, Section XI note 4) and silkworm gut. "
        "Free; Column 2 40%. Silk sewing and embroidery thread in small put-ups lands here.",
        ["silk embroidery thread", "silk knitting yarn skein", "silk sewing thread", "silkworm gut"],
    ),
    "5007": (
        "Woven silk fabrics, 73% of the chapter's imports. 5007.20 (85% or more silk, not noil) is Free and holds charmeuse, "
        "crepe de chine, chiffon, satin and necktie silk; noil silk fabric (5007.10) and other silk fabrics (5007.90) are 0.8% at "
        "85% silk or more, 3.9% below that.",
        ["silk fabric", "silk charmeuse", "crepe de chine", "silk chiffon", "silk satin", "silk organza", "noil silk fabric", "dupioni silk", "necktie silk"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Printed silk twill from Italy",
        "line": "5007.20.00.35",
        "body": "Printed silk fabric of 85% or more silk is Free at the general rate. Italy pays the EU's 10% Section 301 rate "
        "(9903.05.39) only where the EU exception list does not reach the line, and 5007.20.00 is on that list (U.S. note "
        "52(j)(2), 9903.05.97). A $50,000 shipment pays **$0** duty.",
    },
    {
        "title": "Filament silk yarn from China",
        "line": "5004.00.00.00",
        "body": "Silk yarn is Free at the general rate, but China pays two Section 301 duties: 25% under List 3 (9903.88.03) "
        "and 12.5% under the 2026 action (9903.05.31). A $20,000 shipment pays **$7,500**. The same yarn from Italy or "
        "Switzerland pays **$0**: 5004.00.00 is on both exception lists (9903.05.97, 9903.05.98).",
    },
    {
        "title": "Wide plain silk fabric from China with the product exclusion",
        "line": "5007.20.00.65",
        "body": "Silk fabric of 85% or more silk, not printed, not jacquard woven and over 127 cm wide is on the China product "
        "exclusion list (U.S. note 20(vvv)(iii)(30), 9903.88.69) through November 9, 2026. Claiming it removes the 25% "
        "List 3 duty but not the 12.5% (9903.05.31): a $10,000 shipment pays **$1,250** instead of $3,750.",
    },
    {
        "title": "Noil silk fabric from India with less than 85% silk",
        "line": "5007.10.60.90",
        "body": "Noil silk fabric below 85% silk is 3.9% at the general rate, and India pays 10% Section 301 (9903.05.44) on top: "
        "**$1,390** on a $10,000 shipment. India has no exception list, and GSP (A), printed on other lines, has been "
        "expired since December 31, 2020.",
    },
    {
        "title": "Raw silk from Canada, with a USMCA claim",
        "line": "5002.00.00.00",
        "body": "Raw silk is Free, and USMCA removes Canada's 10% Section 301 duty (9903.05.93). But 5002.00.00 is on the "
        "Canada Section 338 list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies even when USMCA is claimed: "
        "**$2,500** on a $5,000 shipment entered since August 22, 2026.",
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
    {"hts": "5007.20", "label": "Woven silk fabric, 85% or more silk (not noil)"},
    {"hts": "5004.00", "label": "Silk yarn (filament), not for retail sale"},
    {"hts": "5007.90", "label": "Other woven silk fabrics"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line (for example, width or print) each country ships."
)
ov["notes"]["chapterNotes"] = (
    "Chapter 50 has no chapter notes of its own; the Section XI (textiles) notes apply. The ones that decide Chapter 50 "
    "classification:\n\n"
    "**Note 1.** Section XI does not cover, among others, silk articles of chapter 42, 46, 64, 65, 67, 94, 95 or 96, or "
    "fabrics coated or laminated with plastics or rubber (chapters 39 and 40).\n\n"
    "**Note 2.** A mixture of textile materials is classified as if it consisted wholly of the material that predominates by "
    "weight; a silk–cotton fabric with more cotton than silk by weight is a cotton fabric (chapter 52).\n\n"
    "**Note 3.** Silk yarn measuring more than 20,000 decitex is treated as twine or cordage (heading 5607), not Chapter 50.\n\n"
    "**Note 4.** Silk yarn is \"put up for retail sale\" (heading 5006) on cards, reels or tubes, or in balls, hanks or skeins, "
    "of not more than 85 g; unbleached multiple or cabled silk yarn is never put up for retail sale, however packed.\n\n"
    "**Notes 7–8.** Fabric cut to shape, hemmed or otherwise \"made up\" (for example a hemmed scarf square) leaves Chapter 50 "
    "for chapters 61–63."
)
ov["notes"]["additionalUsNotes"] = (
    "**Section XI additional U.S. note 2.** \"Certified hand-loomed and folklore\" products are those certified by an official "
    "of the producing country's government under procedures established by USTR.\n\n"
    "**Statistical note 2.** The \"subject to cotton restraints\", \"man-made fiber restraints\" and \"wool restraints\" "
    "statistical lines of 5007.10.60 and 5007.90.60 follow the fibre that makes up the non-silk part (for example, cotton at "
    "50% or more by weight). The three-digit numbers in brackets (218, 220, 410, 800, 810) are textile category numbers "
    "used to monitor shipments."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 50 Tariff Updates: Silk Yarn, Raw Silk & Silk Fabric (2025–2026)"
tu["seo"]["title"] = "Silk Tariff Updates 2026: HTS Chapter 50 — Section 301, China Lists, Canada 338, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 50 silk imports since January 2025: unchanged base rates, the end of the IEEPA tariffs and the "
    "Section 122 surcharge, the 2026 Section 301 tariffs and their silk exception lists, China List 3 and Canada's Section 338 duty."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 50 tariff updates",
    "silk tariff updates 2026",
    "silk import duty rates",
    "China tariff on silk",
    "Section 301 silk duties",
    "Section 122 surcharge silk",
    "India silk tariff 2026",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 30 Chapter 50 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — up to 50% on Indian silk — **ended on February 24, "
    "2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from "
    "60 economies pay a **Section 301 tariff of 10% or 12.5%**; the EU, Switzerland, Taiwan, Indonesia, Cambodia, Jordan and "
    "others have exception lists covering silk yarn and most silk fabric. China keeps its 25% List 3 duty, Brazil pays another "
    "25%, and since **August 22, 2026 Canada pays 50%** under Section 338 on raw silk and carded silk waste."
)
tu["scope"] = (
    "Measures that reach Chapter 50 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 List 3 and its silk-fabric exclusions, the Canada Section 338 duty, the "
    "Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended. No antidumping or "
    "countervailing duty order and no Section 232 action covers a Chapter 50 line. For the rate each supplier pays, see "
    "Rates by country."
)
IE = {x["id"]: x for x in tu["inEffect"]}
EXEMPT = {
    "eu-section-301": (
        "The EU exception list (U.S. note 52(j)(2), 9903.05.97) covers " + EU_LIST + " — silk yarn and every silk fabric except "
        "5007.90.60 — so those goods pay no Section 301 duty. Cocoons, raw silk, silk waste and 5007.90.60 pay 10% in total "
        "in place of the base rate (note 52(k)). " + ENDED,
        "Italian and French silk fabric and yarn — nearly all EU silk imports — enter at the base rate (Free or 0.8%/3.9%); "
        "EU raw silk, silk waste and other silk fabrics below 85% silk (5007.90.60) pay 10% in total.",
        ["eo-14389"],
    ),
    "cn-section-301": (
        "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers every Chapter 50 subheading, and the 2026 action adds +12.5% "
        "(9903.05.31); China is on no 2026 exception list. Two product exclusions (U.S. note 20(vvv)(iii)(30)–(31), 9903.88.69) "
        "remove the 25% from plain, unprinted, non-jacquard silk fabric of 85% or more silk over 127 cm wide (5007.20.00.65) or "
        "107–127 cm wide (part of 5007.20.00.85) through November 9, 2026; they do not lift the 12.5%. USTR confirmed on "
        "October 7, 2026 that the 2018 actions continue. The IEEPA duties on China ended February 24, 2026.",
        "Chinese silk yarn, raw silk and silk fabric pay 37.5% on top of the base rate (41.4% on 3.9% fabrics); excluded wide "
        "silk fabric pays 12.5% until November 9, 2026.",
        ["fr-2025-21671", "eo-14389"],
    ),
    "kr-section-301": (
        "South Korea's rate is 12.5% in total in place of the base rate, since every Chapter 50 base rate (and the KORUS rate) "
        "is below 12.5% (U.S. note 52(k), 9903.05.71). Korea has no exception list. " + ENDED,
        "Korean silk fabric — $11.3M in 2025, almost all of Korea's Chapter 50 shipments — pays 12.5% in total, KORUS claim or not.",
        ["eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list. GSP (SPI A, A*, A+), printed on the dutiable lines, has been expired since December 31, "
        "2020. The 2025 IEEPA duties (25% reciprocal plus 25% over Russian oil purchases) ended in February 2026.",
        "Indian silk fabric pays the base rate plus 10%: 10% on 5007.20, 10.8% on 85%-silk noil and other fabrics, 13.9% on "
        "blends below 85% silk.",
        ["cbp-gsp", "eo-14384", "eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 50 subheading. " + ENDED,
        "British silk fabric pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "jp-section-301": (
        "Japan's rate is 12.5% in total in place of the base rate (U.S. note 52(k), 9903.05.49); Japan has no exception list. "
        + ENDED,
        "Japanese silk yarn and fabric pay 12.5% in total.",
        ["eo-14389"],
    ),
    "ch-section-301": (
        "Switzerland's exception list (U.S. note 52(j)(3), 9903.05.98) covers every Chapter 50 subheading except 5007.90.60, "
        "which pays 12.5% in total (9903.05.74). The 2025 framework had already exempted the same subheadings from the "
        "reciprocal tariff. " + ENDED,
        "Swiss silk yarn and fabric — mostly filament yarn — enter at the base rate; only other silk fabrics below 85% silk pay 12.5%.",
        ["fr-2025-23316", "eo-14389"],
    ),
    "th-section-301": (
        "Thailand has no exception list for Chapter 50. GSP has been expired since December 31, 2020. " + ENDED,
        "Thai silk fabric pays the base rate plus 12.5%: 12.5% on 5007.20, up to 16.4% on blends.",
        ["cbp-gsp", "eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Under USMCA (General Note 11), silk yarn qualifies when it "
        "is spun or twisted from fibre of another heading, and fabric when woven from yarn of another heading. The 2025 IEEPA "
        "duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "Mexican silk yarn ($0.5M in 2025) pays $0 with a valid USMCA claim and 10% without one.",
        ["eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on raw silk (5002.00.00) and carded or combed silk waste (5003.00.90) applies with or without a USMCA "
        "claim. No Chapter 50 line is on the September 29, 2026 import-ban annexes. The IEEPA duty on Canada ended February "
        "24, 2026.",
        "Canadian silk yarn and fabric pay nothing extra with USMCA; Canadian raw silk and carded silk waste pay 50% (60% or "
        "62.5% without a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 50. " + ENDED,
        "Vietnamese silk fabric pays the base rate plus 12.5%. Imports were only $8,934 in 2025.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 50 line; its exemption list (U.S. note 50(a)(ii), "
        "9903.05.03) names no Chapter 50 subheading. The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% "
        "reciprocal and 40%) ended February 24, 2026.",
        "Brazilian silk — mostly silk waste, $45,128 in 2025 — pays 37.5% on top of the base rate.",
        ["eo-14323", "eo-14389"],
    ),
    "other-section-301": (
        "Exception lists in U.S. note 52(j) cover silk for several of these economies: Taiwan, Indonesia and Cambodia (every "
        "Chapter 50 subheading except 5007.90.60), Jordan (every subheading), and Malaysia, Guatemala, El Salvador, Argentina, "
        "Bangladesh and Ecuador (silk yarn and fabric: " + EU_LIST + "); Guatemala and El Salvador add 5007.90.60 when "
        "CAFTA-DR is claimed (9903.06.06, 9903.06.09). Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods of Costa Rica, "
        "the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free with a CAFTA-DR claim (SPI P "
        "or P+); in Chapter 50 that is silk yarn and fabric (5004–5007), not cocoons, raw silk or silk waste (5001–5003). The "
        "schedule prints a CAFTA-DR rate only on the dutiable fabric lines (5007.10.30, 5007.10.60, 5007.90.30, 5007.90.60), so "
        "the calculator applies the exemption there; silk yarn and 5007.20 fabric are Free at the general rate, print no "
        "CAFTA-DR rate, and the calculator charges the duty on them. " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Taiwanese, Indonesian, Cambodian and Jordanian silk enters "
        "at the base rate on the listed subheadings. Nicaragua's only Chapter 50 shipment in 2025 was $37,764 of silk yarn "
        "(5004), which the calculator charges 12.5%.",
        ["eo-14389"],
    ),
}
for k, (ex, wim, extra) in EXEMPT.items():
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
add_sources(tu, [s for v in EXEMPT.values() for s in v[2]])

# Change log: keep generated base-rate entry, rewrite the rest newest first.
gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 50 base-rate changes"
base["detail"] = (
    "All 30 Chapter 50 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 3 continues",
       "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
       "review. For Chapter 50 this keeps +25% (9903.88.03) on every subheading, from cocoons to woven silk fabric.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 50",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 50 line is on their annexes, so raw silk and carded silk waste keep paying the "
       "50% Section 338 duty.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; raw silk and silk waste stay on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. Neither Chapter 50 "
       "subheading (5002.00.00, 5003.00.90) was removed; Revision 21 still lists both in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on raw silk and carded silk waste",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which include "
       "raw silk (5002.00.00) and carded or combed silk waste (5003.00.90). It is charged even when USMCA is claimed and on top "
       "of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 after a 3-day "
       "suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 50 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); no Chapter 50 subheading is on the general "
       "exemption list (note 52(b)). Country lists in note 52(j) exempt silk yarn and most silk fabric of the EU, "
       "Switzerland, Taiwan, Indonesia, Cambodia, Jordan, Malaysia, Guatemala, El Salvador, Argentina, Bangladesh and Ecuador. "
       "EU goods pay 10% in total and Japanese and Korean goods 12.5% in total; USMCA-qualifying goods are exempt "
       "(9903.05.93, 9903.05.94). FTA claims remove the base rate but not this duty, except that note 52(i) (9903.05.95) exempts "
       "silk yarn and fabric (5004–5007) of the six CAFTA-DR countries entered duty-free with a CAFTA-DR claim; cocoons, raw "
       "silk and silk waste are not covered.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 50 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: silk is not a high-priority sector",
       "CBP's operational guidance for importers lists supply-chain tracing documents for the UFLPA high-priority sectors — "
       "aluminum, apparel, caustic soda, copper, cotton and cotton products, lithium, PVC, jujubes, seafood, polysilicon, steel "
       "and tomatoes. Silk is not one of them, but the UFLPA presumption applies to goods of any kind made wholly or in part in "
       "Xinjiang or by a listed entity, and silk blends with cotton fall under the cotton tracing guidance.",
       None, None, "China", ["cbp-fl-guidance", "pl-117-78"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 50 subheading was on the product "
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
       "25% reciprocal rate on silk ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
       "(SPI D) is printed on three dutiable Chapter 50 subheadings — 5003.00.90, 5007.10.30 and 5007.90.30 — but not on the "
       "3.9% lines 5007.10.60 and 5007.90.60. GSP (SPI A), printed on the same three subheadings, remains expired since "
       "December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 50 line.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-exclusions-extended", "reference", "2025-12-01", "Published", "China silk-fabric exclusions extended to November 9, 2026",
       "USTR extended 178 China Section 301 product exclusions, including two for plain silk fabric of 85% or more silk, not "
       "printed and not jacquard woven: over 127 cm wide (5007.20.00.65) and 107–127 cm wide (within 5007.20.00.85). They "
       "remove the 25% List 3 duty (9903.88.69) when the goods match the description.",
       None, "Excluded through November 9, 2026", "China", ["fr-2025-21671", "hts-chapter-99", "hts-now"]),
    ch("swiss-framework", "reference", "2025-11-14", "Effective", "Switzerland: silk exempted from the reciprocal tariff",
       "The U.S.–Switzerland–Liechtenstein framework exempted every Chapter 50 subheading except 5007.90.60 from the 15% "
       "reciprocal rate on Swiss goods (9903.02.84, 9903.02.89; notice published December 18, 2025). The same subheadings are "
       "on Switzerland's 2026 Section 301 exception list (9903.05.98). The EU's reciprocal-tariff exemption list (9903.02.74) "
       "named the same eight silk yarn and fabric subheadings as its 2026 list.",
       None, None, "Switzerland, Liechtenstein, EU", ["fr-2025-23316", "hts-chapter-99"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 50 "
       "line on top of the 25% List 3 duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian silk yarn and fabric. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Vietnam +20%, Thailand "
       "+19%, and 15% in total for EU, Japanese and Korean goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 50 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the 25% List 3 duty on silk.",
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
ui["h1"] = "HTS Chapter 50: Silk — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "Silk Imports to the U.S. by Country: Italy, China, Korea, India — HTS Chapter 50 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of silk 2020–2025 by country, product and year: $57.3M in 2025. Italy and China supplied 23% each, South "
    "Korea and India 20% each; woven silk fabric (5007.20) was 58% and silk yarn 18%."
)
ui["seo"]["keywords"] = [
    "silk imports by country",
    "silk importing countries",
    "silk importers in usa",
    "US tariff on silk",
    "silk import from China",
    "silk fabric from India",
    "woven silk fabrics imports",
]
ui["why"] = (
    "U.S. imports of Chapter 50 goods were **$57.3M in 2025**, flat against $57.5M in 2024 (-0.5%) and below the 2022 peak of "
    "$71.7M. Four suppliers shipped 85%: **Italy $13.2M** (+20%), **China $13.1M** (-10%), **South Korea $11.3M** and **India "
    "$11.3M** (+4%).\n\n"
    "Woven silk fabric is the trade: **5007.20** (85% or more silk) was $33.2M, 58% of the total, and all of 5007 was 73%. "
    "Italy, Korea and India ship mostly fabric; China's largest line is **filament silk yarn** ($6.4M of its $13.1M), and silk "
    "yarn imports from all countries rose 67% to $10.3M. Silk waste collapsed from $5.7M to $0.1M, and cocoons and raw silk "
    "together were under $0.2M.\n\n"
    "Through 2025 most suppliers paid the IEEPA tariffs — 50% on Indian goods from August 27 — on top of the base rate, and "
    "China its 25% List 3 duty as well. The IEEPA duties ended on February 24, 2026; since July 24, 2026 a Section 301 "
    "tariff of 10% or 12.5% applies instead, with Italian and other EU silk fabric and yarn on the EU exception list. 2025 is "
    "the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 50 (retrieved 2026-10-12)", "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. Country names follow Comtrade (\"Rep. of Korea\" is South Korea)."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 50 Silk Tariff Rates by Country: Italy, China, Korea, India & More"
ia["seo"]["title"] = "Silk Import Duty by Country 2026: Italy, China, South Korea, India, Vietnam — HTS Chapter 50 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on raw silk, silk yarn and woven silk fabric by country: base rate plus the 2026 Section 301 duty, "
    "China's List 3, Brazil's 25% and Canada's 50% Section 338 duty, with EU and Swiss exception lists and USMCA applied."
)
ia["seo"]["keywords"] = [
    "silk tariff rates by country",
    "Italy silk tariffs",
    "China tariff on silk",
    "South Korea tariff on silk",
    "Vietnam tariff on silk",
    "India silk import duty",
    "noil silk import rates",
    "woven silk fabrics duty",
]
ia["intro"] = (
    "The total rate on silk depends far more on **where it comes from** than on what it is. Each cell below is the base rate "
    "for that product group plus the extra duty for that country, minus any preference — computed from the current tariff "
    "schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026). **Italian and French silk yarn and fabric are exempt** under the EU exception list, Swiss silk "
    "nearly all, while **South Korea and Japan pay 12.5% in total** and **India 10%** on top of the base rate. **China and "
    "Brazil pay 37.5% more** on every line, and **Canada pays 50%** on raw silk and carded silk waste even with USMCA."
)
RULES = {
    "Italy": "EU: no extra duty on " + EU_LIST + " (exception list, 9903.05.97); 10% in total in place of the base rate "
    "(9903.05.39) on cocoons, raw silk, silk waste and 5007.90.60. The 15% IEEPA rate ended February 24, 2026.",
    "France": "EU: no extra duty on " + EU_LIST + " (exception list, 9903.05.97); 10% in total in place of the base rate "
    "(9903.05.39) on cocoons, raw silk, silk waste and 5007.90.60. The 15% IEEPA rate ended February 24, 2026.",
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31) on every line: 37.5% on Free lines, up to 41.4%. "
    "The silk-fabric exclusions (9903.88.69, 5007.20.00.65/.85, through November 9, 2026) need the importer's claim and are "
    "not applied here.",
    "South Korea": "12.5% in total in place of the base rate on every line (9903.05.71), KORUS claim or not; no exception list.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. GSP has expired; the IEEPA duties "
    "(up to 50%) ended in February 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 50 code.",
    "Japan": "12.5% in total in place of the base rate on every line (9903.05.49); no exception list.",
    "Switzerland": "No extra duty on every subheading except 5007.90.60 (exception list, 9903.05.98), which pays 12.5% in "
    "total (9903.05.74).",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on every line; no exception list. GSP has expired.",
    "Mexico": "USMCA-qualifying: base rate only (9903.05.94), and the base rate is Free under USMCA. Otherwise the base rate "
    "plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on raw silk (5002) and "
    "carded silk waste (5003.00.90) even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those two.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 37.5% on Free lines, up to 41.4%.",
    "Uzbekistan": "Not one of the 60 Section 301 economies: base rate only. GSP, printed on three subheadings, has expired; "
    "the IEEPA reciprocal tariff ended February 24, 2026.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% "
    "(9903.05.20–9903.05.84). Exception lists exempt silk of Taiwan, Indonesia and Cambodia (all but 5007.90.60), Jordan "
    "(all), and silk yarn and fabric of Malaysia, Guatemala, El Salvador, Argentina, Bangladesh and Ecuador. CAFTA-DR silk "
    "fabric entered with a CAFTA-DR claim is exempt too (note 52(i), 9903.05.95); the range is shown without preferences.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    if c["country"] in ("India",):
        for sid in ("cbp-gsp", "eo-14384"):
            if sid not in c["rule"]["sourceIds"]:
                c["rule"]["sourceIds"].append(sid)
    if c["country"] == "China" and "fr-2025-21671" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].append("fr-2025-21671")
    if c["country"] == "Switzerland" and "fr-2025-23316" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].append("fr-2025-23316")
    if "eo-14389" not in c["rule"]["sourceIds"] and c["country"] not in ("Any other country",):
        c["rule"]["sourceIds"].append("eo-14389")
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU, Japanese, Korean and Swiss rates of \"10% / 12.5% in total\" replace the base rate when it is lower (U.S. note 52(k)); "
    "every Chapter 50 base rate is below 10%.",
    "China's two silk-fabric exclusions (5007.20.00.65, and 107–127 cm fabric within 5007.20.00.85) depend on the goods "
    "matching the description and expire November 9, 2026, so the China cells show the full 37.5%.",
    "Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed; no Chapter 50 line is on the "
    "September 29, 2026 import-ban annexes.",
    "CAFTA-DR (note 52(i), 9903.05.95): silk yarn and fabric (5004–5007) of Costa Rica, the Dominican Republic, El Salvador, "
    "Guatemala, Honduras and Nicaragua entered duty-free with a CAFTA-DR claim (SPI P or P+) pay no Section 301 duty; "
    "cocoons, raw silk and silk waste (5001–5003) are not covered. The calculator applies it only on the dutiable fabric "
    "lines that print a CAFTA-DR rate (5007.10.30, 5007.10.60, 5007.90.30, 5007.90.60); silk yarn and 5007.20 fabric are "
    "Free at the general rate and print none. No CAFTA-DR country is in the grid: together they shipped about $42,000 of "
    "Chapter 50 goods in 2025.",
    "Not in the grid: the UFLPA presumption against goods made in Xinjiang or by listed entities, and textile entry rules "
    "(origin under 19 CFR 102.21, manufacturer identification) — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) names "
    "no Chapter 50 code. Note 52(j) country lists name Chapter 50 codes for the EU (eight: " + EU_LIST + "), Switzerland, "
    "Taiwan, Indonesia and Cambodia (all 12 subheadings but 5007.90.60), Jordan (all 13), and Malaysia, Guatemala, El "
    "Salvador, Argentina, Bangladesh and Ecuador (the same eight as the EU); Guatemala and El Salvador add 5007.90.60 for "
    "CAFTA-DR claims (9903.06.06, 9903.06.09). The UK list names none. Note 52(i) (9903.05.95) exempts CAFTA-DR textile "
    "goods of the six CAFTA-DR countries entered duty-free with a CAFTA-DR claim; under the WTO textiles Annex that general "
    "note 29(d)(v) uses, that reaches silk yarn and fabric (5004–5007) but not cocoons, raw silk or silk waste (5001–5003). "
    "Note 50(a)(ii) names no Chapter 50 code for Brazil. "
    "Note 51(b)(3) puts 5002.00.00 and 5003.00.90 on the Canada Section 338 list. Note 20 puts all 13 Chapter 50 "
    "subheadings on China List 3; note 20(vvv)(iii)(30)–(31) excludes two silk fabrics through November 9, 2026. No Section "
    "232 heading and no antidumping or countervailing duty order covers a Chapter 50 line."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Silk Yarn & Silk Fabric (HTS Ch. 50): Origin Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Silk: Textile Origin Rules, UFLPA, Labeling & Ways to Lower Duty (HTS Chapter 50) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP and FTC rules for each HTS Chapter 50 line — textile country of origin (19 CFR 102.21), manufacturer ID, invoice "
    "and fibre-content labeling, UFLPA — and the legal ways to pay less on silk: exception lists, the China silk-fabric "
    "exclusion, USMCA, samples and drawback."
)
te["seo"]["keywords"] = [
    "silk country of origin",
    "importing silk fabric rules",
    "19 CFR 102.21 silk",
    "silk tariff engineering",
    "silk fabric sample hs code",
    "UFLPA silk",
    "USMCA silk rules of origin",
]
te["intro"] = (
    "Silk is a textile, so **CBP's textile rules decide where it comes from**: raw silk keeps the origin of the cocoons, spun "
    "silk yarn is from where it was spun, and fabric from where it was woven — dyeing or printing alone does not move origin "
    "(19 CFR 102.21). Every entry must name the manufacturer through a manufacturer identification code; the "
    "old textile declaration was dropped in 2011. Goods made wholly or in part in Xinjiang are presumed barred under the UFLPA.\n\n"
    "The ways to pay less are in the schedule: source from a **country whose Section 301 exception list covers the line** "
    "(the EU and Switzerland for yarn and most fabric), claim **China's silk-fabric exclusion** where the fabric fits it, claim "
    "**USMCA** on Mexican and Canadian silk, enter **samples** under Chapter 98, and claim **drawback** on re-exports. Each "
    "depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
CH99_LINK = {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52", "url": CH99}
te["levers"] = [
    {
        "id": "exception-lists",
        "title": "Source from a country whose exception list covers the line",
        "saves": "The whole 10%–12.5% Section 301 duty",
        "appliesTo": "Silk yarn (5004–5006) and silk fabric (5007 except 5007.90.60) of the EU, Malaysia, Guatemala, El "
        "Salvador, Argentina, Bangladesh and Ecuador; nearly every line of Switzerland, Taiwan, Indonesia and Cambodia; every "
        "line of Jordan (U.S. note 52(j)); silk yarn and fabric (5004–5007) of the six CAFTA-DR countries entered under "
        "CAFTA-DR (note 52(i))",
        "document": "Proof of origin for the country claimed (commercial invoice, manufacturer ID, production records) and the "
        "exemption heading (for example 9903.05.97 for the EU) on the entry line.",
        "caveat": "Origin follows 19 CFR 102.21: fabric is from where it was woven, so Chinese greige fabric dyed and printed in "
        "Italy is usually still Chinese unless it is also finished as the rule describes. China is on no exception list.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)", "url": CH99},
            {"label": "19 CFR 102.21 (textile origin)", "url": ecfr(19, "102.21")},
        ],
    },
    {
        "id": "china-exclusion",
        "title": "Claim the China product exclusion for plain wide silk fabric",
        "saves": "The 25% List 3 duty (the 12.5% 2026 duty still applies)",
        "appliesTo": "Chinese silk fabric of 85% or more silk (not noil), not printed, not jacquard woven, over 127 cm wide "
        "(5007.20.00.65) or 107–127 cm wide (within 5007.20.00.85), entered by November 9, 2026",
        "document": "Heading 9903.88.69 reported with 5007.20.00.65 or .85, and records showing the fabric meets the exclusion's "
        "description (width, fibre content, construction).",
        "caveat": "The exclusion covers only fabric matching its description; printed, jacquard or narrower fabric pays the "
        "full 37.5%. It ends after November 9, 2026 unless USTR extends it again.",
        "citations": [
            {"label": "HTSUS U.S. note 20(vvv)(iii)(30)–(31), heading 9903.88.69", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended to November 9, 2026)", "url": src("fr-2025-21671")["url"]},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on silk yarn or fabric made in Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 3.9%)",
        "appliesTo": "All 30 lines, for goods that qualify as originating: yarn spun or twisted, or fabric woven, in North "
        "America from materials of another heading (General Note 11, Chapter 50 rules)",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" on "
        "the entry line.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on raw silk (5002) and carded silk waste "
        "(5003.00.90). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 50 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA, CAFTA-DR or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 3.9% (blends below 85% silk), 2.5% (carded silk waste), 0.8% (85% silk noil and other fabrics); "
        "for CAFTA-DR silk fabric, also the 10%–12.5% Section 301 duty",
        "appliesTo": "The 15 dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Jordan, "
        "Morocco, Bahrain, Oman, Singapore and CAFTA-DR countries; AGOA countries (through December 31, 2026) only on "
        "5003.00.90, 5007.10.30 and 5007.90.30",
        "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, JO, MA, BH, "
        "OM, SG, P, D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)), except for CAFTA-DR textile goods "
        "entered duty-free under CAFTA-DR (note 52(i), 9903.05.95): in Chapter 50, silk yarn and fabric (5004–5007), not "
        "cocoons, raw silk or silk waste — carded silk waste (5003.00.90) from a CAFTA-DR country still pays the 10%–12.5%. "
        "Silk yarn and 5007.20 fabric are Free at the general rate and print no CAFTA-DR rate, so the calculator charges the "
        "duty on them. Korea's 12.5% applies in total whatever the KORUS rate. GSP "
        "(A) has been expired since December 31, 2020. Haiti's HOPE/HELP preferences cover apparel and a few made-up articles "
        "(Chapter 98, subchapter XX), not silk yarn or fabric.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a), (i)", "url": CH99},
            {"label": "HTSUS Chapter 98, subchapter XX (HOPE/HELP)", "url": CH98},
            {"label": "CBP: GSP status", "url": src("cbp-gsp")["url"]},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding classification ruling where the line decides the rate",
        "saves": "Up to 3.1 points of base rate, and certainty for exclusion and exception-list claims: 85% or more silk (Free "
        "or 0.8%) vs. less (3.9%); noil (5007.10) vs. other silk fabric (5007.20); yarn for retail sale (5006) vs. not; silk "
        "vs. cotton or man-made fibre by weight (Section XI note 2)",
        "appliesTo": "Any line where fibre content, width or put-up is in doubt — especially silk blends and 5007.90",
        "document": "A ruling request to CBP describing the fibre content by weight, construction, width and finish (19 CFR "
        "part 177); invoices must state the same details (19 CFR 141.89).",
        "caveat": "Rulings apply to the transaction described; a different blend or construction may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Section XI and Chapter 50 notes", "url": CH50},
        ],
    },
    {
        "id": "samples",
        "title": "Enter swatches and sample cuts as samples",
        "saves": "All duty — base rate and the Section 301, China and Canada duties",
        "appliesTo": "Fabric swatches and yarn samples valued at $1 or less each, or marked, torn or perforated so they cannot "
        "be sold, used only to solicit orders",
        "document": "Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.",
        "caveat": "Usable cuts or sample yardage for production do not qualify. U.S. notes 20, 51 and 52 exempt goods properly "
        "entered under Chapter 98 from those extra duties.",
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
        "title": "Claim drawback when the silk, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported yarn or fabric re-exported or used in exported goods",
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
        "title": "Textile country of origin: raw silk keeps the origin of the cocoons (reeling is no change of chapter); silk "
        "waste is from where it was garnetted, else where the waste arose; spun yarn from where it was spun, filament yarn by "
        "the most important manufacturing process; fabric from where it was woven, or where greige fabric was both dyed and "
        "printed with two finishing operations",
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
        "title": "Invoice details: fibre content by weight, and for silk yarn whether spun or filament, single or plied, and "
        "whether put up for retail sale",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Yarns; Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Fiber Products Identification Act: yarns and fabrics sold onward must show fibre content (\"100% "
        "silk\") and the country where processed or made",
        "citations": [
            {"label": "16 CFR 303.45(a)(17)", "url": ecfr(16, "303.45")},
            {"label": "16 CFR 303.33", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made with "
        "forced labor and excluded unless the importer rebuts it; silk is not a named high-priority sector, but silk–cotton "
        "blends fall under the cotton tracing guidance",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or, for bulk yarn and piece goods, on its container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
GROUP_RULES = {
    "5001": ["textile-origin", "textile-mid", "invoice", "uflpa", "cbp-marking"],
    "5002": ["textile-origin", "textile-mid", "cita-transship", "invoice", "ftc-labeling", "uflpa", "cbp-marking"],
    "5003": ["textile-origin", "textile-mid", "invoice", "ftc-labeling", "uflpa", "cbp-marking"],
}
ALL_RULES = ["textile-origin", "textile-mid", "cita-transship", "invoice", "ftc-labeling", "uflpa", "cbp-marking"]
GROUP_NOTES = {
    "5001": "Origin is the country where the cocoons were produced. Every entry carries the manufacturer ID (MID). Canada's "
    "Section 338 list does not include cocoons.",
    "5002": "Raw silk keeps the origin of the cocoons it was reeled from. Canadian raw silk pays the 50% Section 338 duty even "
    "with USMCA.",
    "5003": "Silk waste takes the origin of the garnetting country, or else where the waste arose. Carded or combed silk waste "
    "(5003.00.90) is 2.5% and on Canada's Section 338 list.",
    "5004": "Filament yarn does not fit the extrusion rule, so its origin is where the most important manufacturing step took "
    "place (102.21(c)(4)). Invoices must say filament or "
    "spun, single or plied.",
    "5005": "Spun silk yarn takes the origin of the country where it was spun. Lines split at 85% silk by weight.",
    "5006": "Retail put-ups are skeins, balls or reels of 85 g or less (Section XI note 4). Fibre-content labels apply to "
    "yarn sold to consumers.",
    "5007": "Fabric takes the origin of the country where it was woven; dyeing and printing alone do not change it. China's "
    "exclusion covers only plain wide 5007.20 fabric; blends below 85% silk pay 3.9% base.",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES.get(g["heading"], ALL_RULES)
    g["note"] = GROUP_NOTES[g["heading"]]
DUTIABLE = ("5003.00.90", "5007.10.30", "5007.10.60", "5007.90.30", "5007.90.60")
for ln in te["lines"]:
    h = ln["hts"]
    ln["ruleIds"] = GROUP_RULES.get(h[:4], ALL_RULES)
    lev = ["exception-lists", "usmca"]
    if h in ("5007.20.00.65", "5007.20.00.85"):
        lev.append("china-exclusion")
    if h.startswith(DUTIABLE):
        lev.append("fta")
    lev += ["ruling", "samples", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China "
    "exclusions and the Canada Section 338 list change by proclamation and USTR notice; check them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 50 FAQ: Silk HS Codes & Import Tariffs"
fc["seo"]["title"] = "Silk HS Code & Tariff FAQ 2026: Silk Fabric, Silk Yarn, Raw Silk, Noil Silk (HTS Chapter 50) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing silk: the HS / tariff code for silk fabric, silk yarn, raw silk and silk "
    "waste, where silk scarves and ties go, and the 2026 tariffs on silk from China, India, Italy and Korea."
)
fc["seo"]["keywords"] = [
    "silk hs code",
    "silk tariff code",
    "silk fabric hs code",
    "silk yarn hs code",
    "raw silk hs code",
    "hs code 5007.20",
    "noil silk",
    "silk scarf hs code",
    "silk import from china",
    "silk tariffs",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing silk into the U.S. — HS codes, tariffs by country and "
    "entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 50 base rates are low — Free on 15 of 30 lines, 3.9% at most — and unchanged since January 2025. The extra duty "
    "by country decides the cost.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff, but EU and Swiss silk yarn and most silk "
    "fabric are on exception lists, so Italian silk fabric enters at the base rate.",
    "China and Brazil pay 37.5% extra on every line; South Korea and Japan 12.5% in total; India 10% on top of the base rate; "
    "Canada 50% under Section 338 on raw silk and carded silk waste, even with USMCA.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Silk is a textile: origin follows 19 CFR 102.21 (fabric is from where it was woven), every entry needs a manufacturer ID, "
    "and the UFLPA presumption bars goods made in Xinjiang.",
]
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "silk-hs-code",
        "question": "What is the HS code (tariff code) for silk?",
        "searchedAs": ["silk hs code", "silk tariff code", "silk commodity code", "hs code silk", "silk tariff"],
        "answer": "Silk is HTS Chapter 50: 5001 silkworm cocoons, 5002 raw silk, 5003 silk waste, 5004 filament silk yarn, "
        "5005 yarn spun from silk waste, 5006 silk yarn put up for retail sale and 5007 woven silk fabrics. Fifteen of the "
        "30 lines are Free; the highest base rate is 3.9%. Garments, scarves and ties of silk are in chapters 61–63.",
        "link": "",
    },
    {
        "id": "silk-fabric-hs-code",
        "question": "What is the HS code for silk fabric?",
        "searchedAs": ["silk fabric hs code", "silk fabric tariff code", "silk woven fabric hs code", "100 silk fabric hs code", "silk satin fabric hs code", "silk chiffon fabric hs code", "hs code 5007"],
        "answer": "Woven silk fabric is heading 5007. Fabric of 85% or more silk other than noil silk — charmeuse, satin, "
        "chiffon, crepe de chine — is 5007.20 (Free), split at 10 digits by print, width and jacquard weave. Noil silk fabric "
        "is 5007.10 and other silk fabrics 5007.90: 0.8% at 85% silk or more, 3.9% below. Knitted silk fabric is chapter 60.",
        "link": "",
    },
    {
        "id": "hs-5007-20",
        "question": "What does HS code 5007.20 cover, and what is its tariff?",
        "searchedAs": ["hs code 5007.20", "hs code 5007.90"],
        "answer": "5007.20 is woven fabric of 85% or more silk or silk waste other than noil silk. It is Free at the general "
        "rate and was 58% of U.S. Chapter 50 imports in 2025 ($33.2M). EU and Swiss 5007.20 fabric pays no extra duty; China "
        "pays 37.5%, Korea and Japan 12.5% in total, India 10%. 5007.90 is other silk fabric: 0.8% or 3.9% base.",
        "link": "industry-areas",
    },
    {
        "id": "silk-yarn-hs-code",
        "question": "What is the HS code for silk yarn and silk thread?",
        "searchedAs": ["silk yarn hs code", "silk thread hs code", "spun silk yarn hs code", "mulberry silk yarn hs code", "hs code 5004"],
        "answer": "Reeled (filament) silk yarn not put up for retail sale is 5004.00.00; yarn spun from silk waste is 5005.00.00; "
        "either kind put up for retail sale (85 g or less per skein, ball or reel) is 5006.00. All are Free at the general "
        "rate. Chinese silk yarn pays 37.5% extra; EU and Swiss silk yarn pays none.",
        "link": "",
    },
    {
        "id": "raw-silk-hs-code",
        "question": "What is the HS code for raw silk, silk waste and silkworm cocoons?",
        "searchedAs": ["raw silk hs code", "silk waste hs code"],
        "answer": "Raw silk (not thrown) is 5002.00.00, silkworm cocoons suitable for reeling 5001.00.00 — both Free. Silk "
        "waste is 5003.00: Free if not carded or combed, 2.5% if carded or combed. Canadian raw silk and carded silk waste pay "
        "a 50% Section 338 duty even with a USMCA claim.",
        "link": "",
    },
    {
        "id": "noil-silk",
        "question": "What is noil silk, and how is it classified?",
        "searchedAs": ["noil silk", "noil silk meaning", "what is noil silk", "noil silk fabric", "what is silk noil fabric"],
        "answer": "Noil silk is made from the short fibres combed out of silk waste, giving a nubby, matte fabric. Woven noil "
        "silk fabric is 5007.10: 0.8% if it contains 85% or more silk, 3.9% otherwise. Noil itself, carded or combed, is silk "
        "waste of 5003.00.90 (2.5%).",
        "link": "",
    },
    {
        "id": "silk-scarf-tie",
        "question": "Are silk scarves, ties and dresses classified in Chapter 50?",
        "searchedAs": ["silk scarf hs code", "silk tie tariff code", "silk dress hs code", "silk scarf tariff code", "silk pillowcase hs code"],
        "answer": "No. Chapter 50 covers only fibre, yarn and fabric. Silk fabric that is cut to shape, hemmed or sewn is "
        "\"made up\" (Section XI notes 7–8) and goes to chapters 61–63: silk scarves and shawls to 6214.10, silk ties to "
        "6215.10.00, woven silk blouses to 6206.10.00, silk pillowcases to heading 6302.",
        "link": "",
    },
    {
        "id": "silk-blend",
        "question": "How is a cotton–silk or silk-blend fabric classified?",
        "searchedAs": ["cotton silk fabric hs code", "silk material hs code"],
        "answer": "By the fibre that predominates by weight (Section XI note 2). If silk weighs more than any other single "
        "fibre, the fabric is 5007; below 85% silk it is 5007.10.60 or 5007.90.60 at 3.9%. If cotton weighs more, it is a cotton "
        "fabric of chapter 52. Blends with cotton also fall under CBP's cotton supply-chain guidance for the UFLPA.",
        "link": "tariff-engineering",
    },
    {
        "id": "silk-from-china",
        "question": "What is the tariff on silk imported from China?",
        "searchedAs": ["silk import from china", "silk from china", "mulberry silk from china", "silk scarves from china"],
        "answer": "Every Chapter 50 line from China pays 25% under Section 301 List 3 (9903.88.03) plus 12.5% under the 2026 "
        "action (9903.05.31) on top of the base rate: 37.5% on silk yarn and 5007.20 fabric, 41.4% on blends below 85% silk. "
        "Plain, unprinted wide silk fabric can claim a product exclusion from the 25% through November 9, 2026. The IEEPA "
        "duties ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "silk-from-india",
        "question": "What is the tariff on silk fabric from India?",
        "searchedAs": ["silk from india", "silk fabric from india", "silk saree from india", "silk export from india"],
        "answer": "Indian silk pays the base rate plus 10% Section 301 (9903.05.44): 10% on 5007.20 fabric and silk yarn, 10.8% "
        "on 85%-silk noil and other fabric, 13.9% on blends below 85% silk. India has no exception list and GSP has expired. "
        "Silk saris, as made-up garments, are classified outside Chapter 50.",
        "link": "industry-areas",
    },
    {
        "id": "silk-tariffs-2026",
        "question": "Are silk imports subject to tariffs in 2026?",
        "searchedAs": ["silk tariffs", "silk tariff", "silk fabric tariff code"],
        "answer": "Yes, mostly through the extra duty by country. Since July 24, 2026 the Section 301 tariff on 60 economies "
        "adds 10% or 12.5% (EU 10% and Japan and Korea 12.5% in total), but EU and Swiss silk yarn and most silk fabric are "
        "exempt, and so is silk yarn and fabric from the six CAFTA-DR countries entered under CAFTA-DR (note 52(i)). China "
        "and Brazil pay 37.5%, Canada 50% on raw silk and silk waste. The IEEPA tariffs ended February 24 and the Section 122 "
        "surcharge July 23, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "silk-importing-countries",
        "question": "Where does the U.S. import silk from?",
        "searchedAs": ["silk importing countries", "silk importers in usa", "where does most silk come from", "largest silk producer in the world"],
        "answer": "In 2025 the U.S. imported $57.3M of Chapter 50 goods: Italy $13.2M and China $13.1M (23% each), South Korea "
        "$11.3M and India $11.3M (20% each), then the UK, France, Japan and Switzerland. Italy, Korea and India ship mostly "
        "woven fabric; China's largest line is silk yarn.",
        "link": "understand-industry",
    },
    {
        "id": "silk-country-of-origin",
        "question": "How is the country of origin of silk determined?",
        "searchedAs": ["silk country of origin", "silk place of origin"],
        "answer": "By CBP's textile rules (19 CFR 102.21). Raw silk keeps the origin of its cocoons, spun yarn is from where it "
        "was spun, and fabric from where it was woven — dyeing and printing alone do not change it unless the greige "
        "fabric is both dyed and printed and finished in two further ways. The origin decides the Section 301 rate and "
        "exception list.",
        "link": "tariff-engineering",
    },
    {
        "id": "silk-samples",
        "question": "Do silk fabric samples and swatches pay duty?",
        "searchedAs": ["silk fabric sample hs code", "silk fabric swatch hs code"],
        "answer": "Samples worth $1 or less each, or marked, torn or perforated so they cannot be sold, and used only to "
        "solicit orders, can enter Free under 9811.00.60, which also takes them outside the Section 301, China and Canada "
        "extra duties. Usable sample yardage is classified in 5007 like any other fabric.",
        "link": "tariff-engineering",
    },
]

# ---------------------------------------------------------------- write
d["asOf"] = CHECKED
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
