"""Fill the writer parts of the generated Chapter 54 (Man-made filaments) content file.

Re-run with run.sh (generate -> fill -> compact -> prettier -> validate).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/54-man-made-filaments.json"
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH54 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2054"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))


def fr(doc, cit, kind, title, published, slug, signed=None):
    y, m, dd = published.split("-")
    return {
        "id": f"fr-{doc}",
        "publisher": "Federal Register",
        "citation": cit,
        "document": kind,
        "title": title,
        "signed": signed,
        "published": published,
        "url": f"https://www.federalregister.gov/documents/{y}/{m}/{dd}/{doc}/{slug}",
    }


NEW_SOURCES = {
    s["id"]: s
    for s in [
        fr("2020-00247", "85 FR 1298", "Notice (Commerce, AD orders)",
           "Polyester Textured Yarn From India and the People's Republic of China: Amended Final Antidumping Duty Determination for India and Antidumping Duty Orders",
           "2020-01-10", "polyester-textured-yarn-from-india-and-the-peoples-republic-of-china-amended-final-antidumping-duty"),
        fr("2020-00245", "85 FR 1301", "Notice (Commerce, CVD orders)",
           "Polyester Textured Yarn From the People's Republic of China and India: Countervailing Duty Orders",
           "2020-01-10", "polyester-textured-yarn-from-the-peoples-republic-of-china-and-india-countervailing-duty-orders"),
        fr("2021-27003", "86 FR 71031", "Notice (Commerce, AD orders)",
           "Polyester Textured Yarn From Indonesia, Malaysia, Thailand, and the Socialist Republic of Vietnam: Antidumping Duty Orders",
           "2021-12-14", "polyester-textured-yarn-from-indonesia-malaysia-thailand-and-the-socialist-republic-of-vietnam"),
        fr("2024-25963", "89 FR 88725", "Notice (Commerce)",
           "Polyester Textured Yarn From Indonesia: Notice of Court Decision Not in Harmony With the Final Determination of Antidumping Investigation; Notice of Amended Final Determination; Notice of Amended Order",
           "2024-11-08", "polyester-textured-yarn-from-indonesia-notice-of-court-decision-not-in-harmony-with-the-final"),
        fr("2025-11912", "90 FR 27527", "Notice (Commerce)",
           "Polyester Textured Yarn From the People's Republic of China and India: Continuation of Antidumping Duty and Countervailing Duty Orders",
           "2025-06-27", "polyester-textured-yarn-from-the-peoples-republic-of-china-and-india-continuation-of-antidumping"),
        fr("2026-20159", "91 FR 62473", "Notice (Commerce)",
           "Antidumping or Countervailing Duty Order, Finding, or Suspended Investigation; Advance Notification of Sunset Review",
           "2026-10-01", "antidumping-or-countervailing-duty-order-finding-or-suspended-investigation-advance-notification-of"),
        fr("2019-05520", "84 FR 10786", "Notice (Commerce, AD and CVD orders)",
           "Certain Plastic Decorative Ribbon From the People's Republic of China: Amended Final Affirmative Antidumping Duty Determination and Antidumping Duty Order; and Countervailing Duty Order",
           "2019-03-22", "certain-plastic-decorative-ribbon-from-the-peoples-republic-of-china-amended-final-affirmative"),
        fr("2024-24749", "89 FR 84865", "Notice (Commerce)",
           "Certain Plastic Decorative Ribbons From China: Continuation of Antidumping Duty Order and Countervailing Duty Order",
           "2024-10-24", "certain-plastic-decorative-ribbons-from-china-continuation-of-antidumping-duty-order-and"),
        fr("2011-6253", "76 FR 14575", "Final rule (CBP Dec. 11-09)",
           "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer identification code required)",
           "2011-03-17", "country-of-origin-of-textile-and-apparel-products"),
        {
            "id": "cbp-fl-guidance",
            "publisher": "CBP",
            "citation": "CBP Publication No. 5560-0526",
            "document": "Operational guidance",
            "title": "CBP Forced Labor Enforcement Operational Guidance for Importers (UFLPA high-priority sector supply-chain tracing documentation, Appendix A)",
            "signed": None,
            "published": "2026-06-12",
            "url": "https://www.cbp.gov/document/guidance/cbp-forced-labor-enforcement-operational-guidance-importers",
        },
        {
            "id": "pl-117-78",
            "publisher": "Congress.gov",
            "citation": "P.L. 117-78 (135 Stat. 1525)",
            "document": "Public Law 117-78",
            "title": "Uyghur Forced Labor Prevention Act",
            "signed": "2021-12-23",
            "published": "2021-12-23",
            "url": "https://www.congress.gov/117/plaws/publ78/PLAW-117publ78.pdf",
        },
        {
            "id": "dhs-uflpa-2025",
            "publisher": "DHS",
            "citation": "FLETF report to Congress, August 19, 2025",
            "document": "Strategy update",
            "title": "2025 Updates to the Strategy to Prevent the Importation of Goods Mined, Produced, or Manufactured with Forced Labor in the People's Republic of China (high-priority sectors; UFLPA Entity List, including Xinjiang Zhongtai Group: PVC, viscose fiber and viscose yarn)",
            "signed": None,
            "published": "2025-08-19",
            "url": "https://www.dhs.gov/sites/default/files/2025-08/25_0819_plcy_uflpa-strategy-2025-update-508.pdf",
        },
        {
            "id": "dhs-uflpa-list",
            "publisher": "DHS",
            "citation": "DHS web page (last updated July 31, 2026)",
            "document": "UFLPA Entity List",
            "title": "UFLPA Entity List",
            "signed": None,
            "published": "2026-07-31",
            "url": "https://www.dhs.gov/uflpa-entity-list",
        },
    ]
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

LABELS = {
    "5401": ("Sewing thread of man-made filaments (polyester, nylon, rayon thread)", "Sewing thread"),
    "5402": ("Synthetic filament yarn — polyester, nylon, aramid, polypropylene, spandex — not for retail sale", "Synthetic filament yarn"),
    "5403": ("Artificial filament yarn — viscose rayon, acetate — not for retail sale", "Artificial filament yarn"),
    "5404": ("Synthetic monofilament (67 decitex or more) and synthetic strip up to 5 mm wide", "Synthetic monofilament & strip"),
    "5405": ("Artificial monofilament and strip (rayon, cellophane-type straw)", "Artificial monofilament & strip"),
    "5406": ("Man-made filament yarn put up for retail sale", "Retail filament yarn"),
    "5407": ("Woven fabrics of synthetic filament yarn — polyester, nylon, woven strip fabric", "Synthetic filament fabrics"),
    "5408": ("Woven fabrics of artificial filament yarn — rayon, acetate, cupro", "Artificial filament fabrics"),
}

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 54: Man-Made Filaments — Polyester, Nylon & Rayon Yarn and Woven Fabric Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 54 Man-Made Filaments Tariff 2026: Polyester & Nylon Yarn, Filament Fabric Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 265 HTS Chapter 54 lines — sewing thread, polyester, nylon and viscose filament yarn, "
    "monofilament, strip and woven filament fabrics. General, FTA and Column 2 rates plus the 2026 extra duty for China, "
    "India, Vietnam and more."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 54",
    "man-made filaments tariff",
    "man-made filaments import duty rates",
    "hts 54 customs duty",
    "synthetic filament yarns customs duty",
    "polyester yarn hs code",
    "polyester fabric hs code",
    "nylon yarn hs code",
    "hs code 5402",
    "hs code 5407",
    "china tariff on man-made filaments",
]
ov["intro"] = (
    "Chapter 54 covers yarn and woven fabric made from continuous **man-made filaments**: sewing thread (5401), **synthetic "
    "filament yarn** — polyester, nylon, aramid, polypropylene, spandex (5402) — and **artificial filament yarn** of viscose "
    "rayon and acetate (5403), monofilament and strip (5404–5405), retail put-ups (5406), and **woven fabrics** of "
    "synthetic (5407) or artificial (5408) filament yarn. Staple fibre and spun yarn are in chapter 55; knitted fabrics "
    "in chapter 60. Its **265 tariff lines** carry real base rates: 7.5%–8.8% on most yarn, 11.4% on sewing thread, "
    "12%–14.9% on most fabric and up to 25% (or 19.4¢/kg + 18%) on some fabrics. 15 lines are Free, including woven strip "
    "fabric (5407.20).\n\n"
    "Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**, and no exception list "
    "except Jordan's (and Guatemala's and El Salvador's, with a CAFTA-DR claim) names a Chapter 54 code. **China pays 37.5% "
    "extra** on most lines (25% List 3 plus 12.5%), and **polyester textured yarn** from China, India, Indonesia, Malaysia, "
    "Thailand and Vietnam also carries **antidumping duties**. Of the **$1.79B** imported in 2025, India, China and Vietnam "
    "shipped 10%–13% each."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "5401": (
        "Multiple or cabled filament yarn on supports of 1,000 g or less, dressed for sewing, with a final Z twist (Section XI "
        "note 5). 11.4% on both lines. Polyester sewing thread of 5401.10 is named in the PTY antidumping orders on Indonesia, "
        "Malaysia, Thailand and Vietnam.",
        ["polyester sewing thread", "nylon sewing thread", "bonded nylon thread", "embroidery thread", "rayon embroidery thread", "polyester thread cone"],
    ),
    "5402": (
        "The largest heading ($810M in 2025): high-tenacity polyester and nylon yarn (5402.20, 5402.19), aramid yarn "
        "(5402.11), textured yarn (5402.31–5402.39), spandex/elastomeric yarn (5402.44), and flat and partially oriented "
        "yarn. 7.5%–8.8%; two colored-nylon and specialty lines are Free. Textured polyester yarn (5402.33) carries AD/CVD "
        "orders.",
        ["polyester filament yarn", "polyester textured yarn (DTY)", "fully drawn yarn (FDY)", "POY", "nylon 6 yarn", "nylon 66 yarn", "aramid yarn", "Kevlar yarn", "spandex yarn", "high tenacity polyester yarn", "polypropylene multifilament yarn"],
    ),
    "5403": (
        "Viscose rayon and cellulose acetate filament yarn, including high-tenacity rayon tire yarn (5403.10). 7.5%–10%. "
        "Imports jumped from $18.5M to $49.5M in 2025, mostly single viscose yarn from Germany.",
        ["viscose filament yarn", "viscose rayon filament yarn", "acetate yarn", "cupro yarn", "high tenacity rayon yarn", "lyocell filament yarn"],
    ),
    "5404": (
        "Synthetic monofilament of 67 decitex or more with no cross-section over 1 mm (fishing line in bulk, brush and "
        "screen-printing monofilament, racket strings), and synthetic strip and artificial straw up to 5 mm wide. 6.9%; "
        "racket strings 2.7%; strip (5404.90) Free.",
        ["nylon monofilament", "polyester monofilament", "fishing line (bulk)", "racket strings", "polypropylene strip", "artificial straw", "PET monofilament", "trimmer line"],
    ),
    "5405": (
        "Artificial (cellulosic) monofilament of 67 decitex or more and artificial strip up to 5 mm wide, such as artificial "
        "straw for hats. 6.9% on monofilament, 5.8% on strip. A $2.5M heading.",
        ["artificial straw", "rayon strip", "cellulose monofilament", "cellophane straw"],
    ),
    "5406": (
        "Synthetic or artificial filament yarn put up for retail sale (85 g or less on cards, reels or in skeins, Section XI "
        "note 4) — crochet, knitting and craft filament yarn. 7.5%. Türkiye supplied most of the $43.3M in 2025.",
        ["polyester knitting yarn skein", "nylon crochet thread", "craft filament yarn", "retail rayon yarn"],
    ),
    "5407": (
        "Woven fabrics of synthetic filament yarn: woven strip fabric such as polypropylene and HDPE bag and tarp fabric "
        "(5407.20, Free), high-tenacity and aramid fabrics (5407.10, 13.6%), and nylon and polyester taffeta, ripstop, satin "
        "and chiffon (mostly 12%–14.9%; up to 25% for wool blends). 5407.52.20 is on Canada's Section 338 list.",
        ["polyester taffeta", "nylon ripstop", "polyester chiffon", "polyester satin", "microfiber woven fabric", "PP woven fabric", "HDPE woven fabric", "Kevlar fabric", "polyester lining fabric"],
    ),
    "5408": (
        "Woven fabrics of viscose rayon, acetate and cupro filament yarn — rayon linings, satins and crepes. Mostly 12%–15%; "
        "high-tenacity viscose fabric 14.9%; wool blends up to 25%. A $20.4M heading.",
        ["rayon filament fabric", "acetate lining", "cupro lining", "viscose satin", "rayon crepe", "bemberg lining"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Textured polyester yarn (DTY) from China",
        "line": "5402.33.30.00",
        "body": "Single textured polyester yarn is 8.8% at the general rate. China adds 25% under Section 301 List 3 (9903.88.03) "
        "and 12.5% under the 2026 action (9903.05.31): **46.3%**, or **$4,630** on a $10,000 shipment. It is also subject to "
        "the antidumping and countervailing duty orders on polyester textured yarn (85 FR 1298, 85 FR 1301), deposited at the "
        "exporter's rate on top.",
    },
    {
        "title": "Woven polypropylene strip fabric from India",
        "line": "5407.20.00.00",
        "body": "Woven fabric made from strip — the bag and tarpaulin fabric that makes up most of India's Chapter 54 trade — is "
        "Free at the general rate. India pays 10% under the 2026 Section 301 action (9903.05.44) and has no exception list: "
        "**$10,000** on a $100,000 shipment.",
    },
    {
        "title": "High-tenacity polyester yarn from South Korea, with a KORUS claim",
        "line": "5402.20.30.30",
        "body": "High-tenacity polyester yarn is 8.8%, Free under KORUS. Korea's 2026 Section 301 rate is 12.5% in total in "
        "place of the base rate (U.S. note 52(k), 9903.05.71), and an FTA claim does not remove it (note 52(a)): **$12,500** on "
        "a $100,000 shipment.",
    },
    {
        "title": "Dyed textured polyester fabric from Canada",
        "line": "5407.52.20.60",
        "body": "Dyed textured polyester fabric is 14.9% at the general rate and Free under USMCA. But 5407.52.20 is on the "
        "Canada Section 338 list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies even with a USMCA claim: **$5,000** "
        "on a $10,000 shipment, or **$7,490** without a USMCA claim (14.9% + 10% + 50%).",
    },
    {
        "title": "Viscose filament yarn from Germany",
        "line": "5403.31.00.40",
        "body": "Single viscose rayon yarn is 10% at the general rate. The EU's 2026 Section 301 rate is 10% in total in place of "
        "the base rate (9903.05.39), so where the base rate is already 10% nothing is added: **$1,000** on a $10,000 shipment.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
NAME = {"Rep. of Korea": "South Korea", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "Türkiye": "Türkiye"}
ts["topCountries"] = [
    {"name": NAME.get(c["country"], c["country"]), "importsUsd": c["importsUsd"]}
    for c in d["understandIndustry"]["byCountry"][:5]
]
ts["biggestLines"] = [
    {"hts": "5407.20", "label": "Woven fabrics of synthetic strip (polypropylene, polyethylene)"},
    {"hts": "5402.20", "label": "High-tenacity polyester filament yarn"},
    {"hts": "5404.90", "label": "Synthetic strip and artificial straw"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** \"Man-made fibers\" are staple fibres and filaments of organic polymers. **Synthetic** fibres are made by "
    "polymerizing organic monomers (polyamides such as nylon, polyesters, polyolefins, polyurethanes); **artificial** fibres "
    "are made by dissolving or chemically treating natural polymers such as cellulose (viscose rayon, cupro, acetate). Strip "
    "of heading 5404 or 5405 is not a man-made fibre.\n\n"
    "**Note 2.** Headings 5402 and 5403 do not cover synthetic or artificial filament tow, which is chapter 55.\n\n"
    "**Section XI notes that decide Chapter 54 classification:** note 2 (a blend is classified by the fibre that predominates "
    "by weight), note 3 (man-made yarn over 10,000 decitex is twine or cordage, heading 5607), note 4 (\"put up for retail "
    "sale\": 85 g or less for filament yarn on reels or in skeins), note 5 (\"sewing thread\": multiple or cabled, on supports "
    "of 1,000 g or less, dressed, final Z twist), note 6 (\"high tenacity\": over 60 cN/tex for single nylon or polyester "
    "yarn, 53 cN/tex for plied, 27 cN/tex for viscose), note 9 (layered unidirectional fabrics are woven fabrics, 5407.30), "
    "note 12 (polyamides include aramids) and note 13 (elastomeric yarn)."
)
ov["notes"]["additionalUsNotes"] = (
    "**Statistical note 1.** Definitions used to split the woven-fabric lines: \"flat fabrics\" (yarns twisted not more than "
    "472 turns per meter), poplin or broadcloth, sheeting, printcloth, square construction, napped, combed and average yarn "
    "number.\n\n"
    "**Statistical note 2.** \"Discharge printed\" fabrics are dyed a single color, printed by bleaching out the dye in a "
    "pattern, and given two or more finishing operations.\n\n"
    "The three-digit numbers in brackets (200, 600, 606, 618–620, 624) are textile category numbers used to monitor shipments."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 54 Tariff Updates: Polyester, Nylon & Rayon Filament Yarn and Fabric (2025–2026)"
tu["seo"]["title"] = "Man-Made Filaments Tariff Updates 2026: HTS Chapter 54 — Section 301, China, PTY Antidumping, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 54 imports since January 2025: unchanged base rates, the end of the IEEPA tariffs and the "
    "Section 122 surcharge, the 2026 Section 301 tariffs, China's List 3, Canada's Section 338 duty on dyed polyester fabric "
    "and the polyester textured yarn antidumping orders."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 54 tariff updates",
    "man-made filaments tariff updates 2026",
    "woven fabrics tariff updates",
    "china tariff on man-made filaments",
    "section 301 duties on polyester yarn",
    "polyester textured yarn antidumping",
    "Section 122 surcharge man-made filaments",
    "usmca textile tariff updates",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and "
    "the current **2026 Revision 21** (in force October 9, 2026). All 265 Chapter 54 lines carry the same base rates in "
    "both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — up to 50% on Indian goods and 20% plus a 40% "
    "transshipment rate for Vietnam — **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them "
    "expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or "
    "12.5%**; no general exemption covers Chapter 54. China keeps its 25% List 3 duty, Brazil pays another 25%, and since "
    "**August 22, 2026 Canada pays 50%** under Section 338 on dyed textured polyester fabric (5407.52.20). The "
    "**polyester textured yarn** antidumping orders on six countries continue, with sunset reviews of four of them due to "
    "start in November 2026."
)
tu["scope"] = (
    "Measures that reach Chapter 54 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 Lists 3 and 4A, the Canada Section 338 duty, the Nicaragua Section 301 "
    "phase-in, the 2025–2026 IEEPA and Section 122 duties that have ended, and the Commerce antidumping and countervailing "
    "duty orders on polyester textured yarn and plastic decorative ribbon. No Section 232 action covers a Chapter 54 line "
    "unless the importer elects to certify goods as vehicle parts. For the rate each supplier pays, see Rates by country."
)
IE = {x["id"]: x for x in tu["inEffect"]}
LOW = "the EU's 10% (or Japan's and Korea's 12.5%) is a total that replaces the base rate when the base rate is lower"
EXEMPT = {
    "in-section-301": (
        "India has no exception list, and no Chapter 54 code is on the general exemption list (note 52(b)). Polyester textured "
        "yarn from India is also under antidumping and countervailing duty orders (85 FR 1298, 85 FR 1301), continued in "
        "June 2025. The 2025 IEEPA duties (25% reciprocal plus 25% over Russian oil purchases) ended in February 2026.",
        "Indian woven strip fabric (5407.20) pays 10%; Indian yarn pays 17.5%–18.8%; most Indian filament fabric pays 22%–24.9%. "
        "Textured polyester yarn adds the AD/CVD cash deposits.",
        ["fr-2020-00247", "fr-2020-00245", "fr-2025-11912", "eo-14384", "eo-14389"],
    ),
    "cn-section-301": (
        "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers 261 of the 265 lines. The three printed textured polyester "
        "fabric lines (5407.54.00) are on List 4A (+7.5%, 9903.88.15), and plied high-tenacity polyester yarn (5402.20.60.00) "
        "is only on the suspended List 4B, so it pays no 2018–2019 duty. The 2026 action adds +12.5% (9903.05.31) on every "
        "line; China is on no exception list, and no Chapter 54 product exclusion (notes 20(vvv), 20(www)) is in effect. USTR "
        "confirmed on October 7, 2026 that the 2018 actions continue. Polyester textured yarn and plastic decorative ribbon "
        "(5404.90) also carry AD/CVD orders. The IEEPA duties on China ended February 24, 2026.",
        "Chinese filament yarn and fabric pay 37.5% on top of the base rate (37.5%–62.5% in total), printed textured polyester "
        "fabric 20% extra (34.9%), plied high-tenacity polyester yarn 12.5% extra (20%). Chinese textured polyester yarn also "
        "pays AD/CVD deposits.",
        ["fr-2020-00247", "fr-2020-00245", "fr-2019-05520", "fr-2024-24749", "eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 54. Polyester textured yarn from Vietnam is under an antidumping order "
        "(86 FR 71031; Vietnam-wide rate 22.36% at the order) whose first sunset review is scheduled to start in November "
        "2026. The 2025 IEEPA reciprocal rate (20%, and 40% on goods found transshipped) ended February 24, 2026.",
        "Vietnamese filament yarn — $124M of its $188M in 2025 — pays the base rate plus 12.5%: 20%–21.3%. Textured polyester "
        "yarn adds the antidumping deposit.",
        ["fr-2021-27003", "fr-2026-20159", "eo-14326", "eo-14389"],
    ),
    "kr-section-301": (
        "South Korea's rate is 12.5% in total in place of the base rate (U.S. note 52(k), 9903.05.71); with a KORUS claim the "
        "base rate is Free, so every line pays 12.5%. Without a KORUS claim, lines whose base rate is above 12.5% (most "
        "filament fabric at 14.9%, wool blends at 25%) pay the base rate alone. Korea has no exception list. " + ENDED,
        "Korean filament yarn — $117M of its $156M in 2025 — pays 12.5% in total with a KORUS claim.",
        ["eo-14389"],
    ),
    "tr-section-301": (
        "Türkiye has no exception list. " + ENDED,
        "Turkish filament fabric and retail yarn pay the base rate plus 12.5%: 20% on retail put-up yarn, 24.5%–27.4% on most "
        "fabric.",
        ["cbp-gsp", "eo-14389"],
    ),
    "eu-section-301": (
        "The EU exception list (U.S. note 52(j)(2), 9903.05.97) names no Chapter 54 code. EU goods pay 10% in total in place of "
        "the base rate where the base rate is lower (note 52(k), 9903.05.39); where it is 10% or more — sewing thread and "
        "nearly all filament fabric — only the base rate applies. " + ENDED,
        "German and Dutch filament yarn and monofilament (7.5%–8.8% base) pay 10% in total; EU filament fabric pays its base "
        "rate (12%–14.9%) with nothing added.",
        ["eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on dyed textured polyester fabric (5407.52.20) applies with or without a USMCA claim. No Chapter 54 line "
        "is on the September 29, 2026 import-ban annexes or was removed from the Section 338 list on September 15. The IEEPA "
        "duty on Canada ended February 24, 2026.",
        "Canadian filament yarn and fabric pay nothing extra with USMCA; dyed textured polyester fabric pays 50% (74.9% without "
        "a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "jp-section-301": (
        "Japan's rate is 12.5% in total in place of the base rate (U.S. note 52(k), 9903.05.49); lines with a base rate above "
        "12.5% (most filament fabric) pay the base rate alone. Japan has no exception list. " + ENDED,
        "Japanese filament yarn and monofilament pay 12.5% in total; Japanese filament fabric pays its 14.9% base rate.",
        ["eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Under USMCA (General Note 11), filament yarn of 5401–5406 "
        "qualifies when it is made from material of another chapter (in practice, extruded in North America from polymer) "
        "other than cotton or man-made staple fibre; fabric of 5407–5408 must be woven from originating yarn. The 2025 IEEPA "
        "duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "Mexican filament yarn and fabric pay $0 with a valid USMCA claim and the base rate plus 10% without one.",
        ["eo-14389"],
    ),
    "tw-section-301": (
        "Taiwan's rate is 10% in total in place of the base rate (9903.05.76); its exception list (9903.06.14) names no Chapter "
        "54 code. Lines with a base rate of 10% or more pay the base rate alone. " + ENDED,
        "Taiwanese filament yarn pays 10% in total; Taiwanese filament fabric pays its base rate (12%–14.9%).",
        ["eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 54 code. " + ENDED,
        "British filament yarn and fabric pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "sa-section-301": (
        "Saudi Arabia has no exception list. " + ENDED,
        "Saudi filament fabric and strip pay the base rate plus 12.5% — 12.5% on the Free strip and woven strip fabric lines.",
        ["eo-14389"],
    ),
    "id-section-301": (
        "Indonesia's exception list (9903.06.16) names no Chapter 54 code. Polyester textured yarn from Indonesia is under an "
        "antidumping order (86 FR 71031; all-others rate 8.72% after the 2024 court-ordered amendment), with a sunset review "
        "due to start in November 2026. " + ENDED,
        "Indonesian filament yarn pays the base rate plus 10%: 17.5%–18.8%, plus the antidumping deposit on textured polyester "
        "yarn.",
        ["fr-2021-27003", "fr-2024-25963", "fr-2026-20159", "eo-14389"],
    ),
    "th-section-301": (
        "Thailand has no exception list for Chapter 54. Polyester textured yarn from Thailand is under an antidumping order "
        "(86 FR 71031), with a sunset review due to start in November 2026. GSP has been expired since December 31, 2020. "
        + ENDED,
        "Thai filament yarn and fabric pay the base rate plus 12.5%, plus the antidumping deposit on textured polyester yarn.",
        ["fr-2021-27003", "fr-2026-20159", "cbp-gsp", "eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 54 line; its exemption list (U.S. note 50(a)(ii), "
        "9903.05.03) names no Chapter 54 subheading. The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% "
        "reciprocal and 40%) ended February 24, 2026.",
        "Brazilian sewing thread, yarn and monofilament — under $3M in 2025 — pay 37.5% on top of the base rate.",
        ["eo-14323", "eo-14389"],
    ),
    "gt-section-301": (
        "Two reliefs remove the 10% (9903.05.40) when CAFTA-DR is claimed (SPI P): note 52(i) for textile goods entered "
        "duty-free under CAFTA-DR (9903.05.95) and Guatemala's CAFTA-DR exception list, which names every Chapter 54 "
        "subheading (note 52(j)(6)(iii), 9903.06.06). Without the claim the 10% is charged on top of the base rate. "
        "The 15 lines that are Free at the general rate print no CAFTA-DR rate, so goods on them cannot be entered duty-free under CAFTA-DR and pay the 10%. " + ENDED,
        "Guatemalan filament yarn and fabric that originate under CAFTA-DR's yarn-forward rules enter Free; Free-rate "
        "lines such as woven strip fabric pay 10%; non-originating goods pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "other-section-301": (
        "Only three exception lists in U.S. note 52(j) name Chapter 54 codes: Jordan's covers every subheading (9903.06.20), "
        "and Guatemala's and El Salvador's cover every subheading when CAFTA-DR is claimed (9903.06.06, 9903.06.09). Note "
        "52(i) (9903.05.95) also exempts every Chapter 54 line — all are textile goods of the WTO textiles Annex — for goods "
        "of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free under "
        "CAFTA-DR (SPI P). Malaysia's PTY antidumping order (86 FR 71031) continues. "
        + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian goods and CAFTA-DR originating goods claimed "
        "under the agreement pay nothing extra.",
        ["fr-2021-27003", "eo-14389"],
    ),
}
for k, (ex, wim, extra) in EXEMPT.items():
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
assert set(IE) == set(EXEMPT), set(IE) ^ set(EXEMPT)
add_sources(tu, [s for v in EXEMPT.values() for s in v[2]])

gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 54 base-rate changes"
base["detail"] = (
    "All 265 Chapter 54 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 lists continue",
       "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
       "review. For Chapter 54 this keeps +25% (9903.88.03) on 261 lines and +7.5% (9903.88.15) on printed textured polyester "
       "fabric.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("pty-sunset", "pending", "2026-10-01", "Announced", "Sunset reviews of the PTY antidumping orders on four countries",
       "Commerce gave notice that the first five-year (sunset) reviews of the antidumping orders on polyester textured yarn "
       "from Indonesia, Malaysia, Thailand and Vietnam are scheduled to start in November 2026. The orders stay in force "
       "during the reviews; they would be revoked only if Commerce or the ITC finds that dumping and injury are not likely "
       "to recur.",
       None, None, "Indonesia, Malaysia, Thailand, Vietnam", ["fr-2026-20159", "fr-2021-27003"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 54",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 54 line is on their annexes.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; dyed polyester fabric stays on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. 5407.52.20 was not "
       "removed; Revision 21 still lists it in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on dyed textured polyester fabric",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which "
       "include woven fabric of 85% or more textured polyester filaments, dyed (5407.52.20). It is charged even when USMCA is "
       "claimed and on top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 "
       "after a 3-day suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 54 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); no Chapter 54 subheading is on the general "
       "exemption list (note 52(b)), and the only country lists naming Chapter 54 codes are Jordan's and, for CAFTA-DR claims, "
       "Guatemala's and El Salvador's. EU and Taiwanese goods pay 10% in total and Japanese and Korean goods 12.5% in total "
       "where the base rate is lower; USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). FTA claims remove the "
       "base rate but not this duty, except for CAFTA-DR textile goods (note 52(i)).",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 54 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) under the Chapter 54 yarn-forward rules "
       "still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance for importers",
       "CBP's operational guidance lists supply-chain tracing documents for the UFLPA high-priority sectors, among them PVC "
       "and apparel (traced from the fibre, \"cotton, wool, or synthetics\", through yarn and fabric). The UFLPA presumption "
       "applies to goods of any kind made wholly or in part in Xinjiang or by a listed entity; the UFLPA Entity List names "
       "Xinjiang Zhongtai Group, a viscose fibre and yarn producer.",
       None, None, "China", ["cbp-fl-guidance", "pl-117-78", "dhs-uflpa-2025"]),
    ch("pty-cn-in-continued", "reference", "2025-06-24", "Effective", "PTY antidumping and countervailing duty orders on China and India continued",
       "After the first five-year reviews, Commerce continued the 2020 antidumping and countervailing duty orders on polyester "
       "textured yarn from China and India (5402.33.30, 5402.33.60; also 5402.52). They add company-specific cash deposits to "
       "the tariff; the orders set dumping margins of 77.15% for the China-wide entity and 17.98% for Indian all others, and "
       "subsidy rates of 32.18% (China, all others) and 4.65% (India, all others), since adjusted in reviews.",
       None, None, "China, India", ["fr-2025-11912", "fr-2020-00247", "fr-2020-00245"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 54 subheading was on the product "
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
       "25% reciprocal rate ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
       "(SPI D) and CBERA (E) are printed on three Chapter 54 lines — polypropylene monofilament in lengths of 254 mm or less (5404.12.10), "
       "racket strings (5404.19.10) and artificial strip (5405.00.60). GSP (SPI A), printed on the same lines, remains "
       "expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 54 line.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 54 "
       "line on top of the List 3 duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian filament yarn and fabric. Ended "
       "February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Vietnam +20%, Thailand "
       "+19%, and 15% in total for EU, Japanese and Korean goods; goods CBP found transshipped to evade them paid 40%. Ended "
       "February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 54 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the List 3 duty.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
       "February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
]
# keep the list strictly newest first
changes = [changes[0]] + sorted(changes[1:], key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
add_sources(tu, [s for c in changes for s in c["sourceIds"]])

# ---------------------------------------------------------------- understandIndustry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 54: Man-Made Filaments — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "Man-Made Filament Imports to the U.S. by Country: India, China, Vietnam, Korea — HTS Chapter 54 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of man-made filament yarn and woven filament fabric 2020–2025 by country, product and year: $1.79B in 2025. "
    "India, China and Vietnam supplied 10%–13% each; synthetic filament yarn (5402) was 45% and woven synthetic filament "
    "fabric (5407) 35%."
)
ui["seo"]["keywords"] = [
    "man-made filaments imports by country",
    "polyester yarn import from china",
    "polyester fabric import from china",
    "nylon filament yarn imports",
    "synthetic filament yarn imports",
    "vietnam synthetic yarn duties",
    "polyester filament yarn manufacturers in india",
]
ui["why"] = (
    "U.S. imports of Chapter 54 goods were **$1.79B in 2025**, down 6.2% from $1.91B in 2024 and a third below the 2022 peak "
    "of $2.72B. No supplier dominates: **India $228M** (-18%), **China $206M** (-24%), **Vietnam $188M** (+24%), **South "
    "Korea $156M**, **Türkiye $147M** and **Germany $122M** (+15%) together shipped 59%.\n\n"
    "**Synthetic filament yarn** (5402) was 45% of the total ($810M) — high-tenacity polyester ($216M), aramid ($122M), "
    "textured polyester ($118M) and high-tenacity nylon ($107M) lead — and **woven synthetic filament fabric** (5407) 35% "
    "($634M, down 16%). The largest single subheading is **woven strip fabric** (5407.20, $309M), the polypropylene and "
    "polyethylene fabric used for bags and tarps, which is Free at the general rate; most of India's and Saudi Arabia's "
    "Chapter 54 trade is fabric. China and Vietnam ship mostly yarn; Germany mostly monofilament and viscose yarn; artificial "
    "filament yarn imports (5403) rose from $18.5M to $49.5M.\n\n"
    "Through 2025 most suppliers paid the IEEPA tariffs — 50% on Indian goods from August 27 — on top of the base rate, and "
    "China its 25% List 3 duty as well. The IEEPA duties ended on February 24, 2026; since July 24, 2026 a Section 301 "
    "tariff of 10% or 12.5% applies instead. 2025 is the latest full year of U.S. trade data."
)
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
for ln in ui["byLine"]:
    if "…" in ln.get("searchText", ""):
        full = LABELS[ln["heading"]][0]
        ln["searchText"] = f'{ln["hs6"].replace(".", "")} {ln["hs6"]} {ln["description"].lower()} {full.lower()}'
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 54 (retrieved 2026-10-13)", "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. Country names follow Comtrade (\"Rep. of Korea\" is South Korea, \"Other Asia, nes\" is Taiwan); Myanmar, which "
    "has no country mapping here, is counted with the other countries."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 54 Man-Made Filaments Tariff Rates by Country: India, China, Vietnam, Korea & More"
ia["seo"]["title"] = "Man-Made Filaments Import Duty by Country 2026: China, India, Vietnam, Korea, Türkiye — HTS Chapter 54 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on polyester, nylon and rayon filament yarn and woven filament fabric by country: base rate plus "
    "the 2026 Section 301 duty, China's List 3, Brazil's 25% and Canada's 50% Section 338 duty, with USMCA and KORUS applied."
)
ia["seo"]["keywords"] = [
    "man-made filaments tariff",
    "man-made filaments import duty rates",
    "vietnam tariff on man-made filaments",
    "china tariff on man-made filaments",
    "synthetic yarns import duty",
    "viscose rayon customs duty",
    "hts 5407.51.00 tariff rate",
    "polyester yarn tariff",
]
ia["intro"] = (
    "The total rate on filament yarn and fabric is the **base rate**, which is substantial in Chapter 54, plus the **extra "
    "duty for the country of origin**, minus any preference. Each cell below is computed from the current tariff schedule "
    "with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026): **India, Indonesia and the UK add 10%**, **Vietnam, Türkiye, Thailand and Saudi Arabia 12.5%**. "
    "EU and Taiwanese goods pay **10% in total** and Japanese and Korean goods **12.5% in total**, so on filament fabric "
    "with a base rate above that, they pay the base rate alone. **China pays 37.5% more** on most lines, Brazil 37.5% on "
    "all, and USMCA goods from Canada and Mexico enter Free — except Canadian dyed textured polyester fabric, which pays 50% — "
    "and so do Guatemalan goods claimed under CAFTA-DR, which note 52(i) exempts from the Section 301 duty."
)
RULES = {
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. Textured polyester yarn also "
    "carries AD/CVD deposits (not in the grid). The IEEPA duties (up to 50%) ended in February 2026.",
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31) on 261 lines; printed textured polyester fabric "
    "(5407.54) 7.5% List 4A plus 12.5%; plied high-tenacity polyester yarn (5402.20.60) 12.5% only. AD/CVD on textured "
    "polyester yarn and plastic ribbon not in the grid.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list. The PTY antidumping order "
    "(Vietnam-wide 22.36% at the order) is not in the grid.",
    "South Korea": "12.5% in total in place of the base rate (9903.05.71), with the KORUS claim (KR) applied, so 12.5% on "
    "every line; no exception list.",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list.",
    "Germany": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is lower; lines at 10% or more "
    "(sewing thread, most fabric) pay the base rate alone. The EU exception list names no Chapter 54 code.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93) and Free base, but 50% Section 338 (9903.03.14) on dyed "
    "textured polyester fabric (5407.52.20) even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on "
    "5407.52.20.",
    "Japan": "12.5% in total in place of the base rate (9903.05.49) where the base rate is lower; filament fabric at 14.9% "
    "or more pays the base rate alone. No exception list.",
    "Mexico": "USMCA-qualifying: base rate only (9903.05.94), and the base rate is Free under USMCA. Otherwise the base rate "
    "plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Taiwan": "10% in total in place of the base rate (9903.05.76) where the base rate is lower; lines at 10% or more pay "
    "the base rate alone. Taiwan's exception list names no Chapter 54 code.",
    "Netherlands": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is lower; lines at 10% or "
    "more pay the base rate alone. The EU exception list names no Chapter 54 code.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 54 code.",
    "Italy": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is lower; lines at 10% or more "
    "(most filament fabric) pay the base rate alone. The EU exception list names no Chapter 54 code.",
    "Saudi Arabia": "Base rate plus 12.5% Section 301 (9903.05.67) on every line; no exception list.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on every line; Indonesia's exception list names no Chapter 54 "
    "code. The PTY antidumping order is not in the grid.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on every line; no exception list. GSP has expired. The PTY "
    "antidumping order is not in the grid.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 37.5% extra.",
    "Guatemala": "With the CAFTA-DR claim (P) applied: Free base and no Section 301 duty on the 250 dutiable lines (note "
    "52(i), 9903.05.95; Guatemala's exception list, 9903.06.06). The 15 general-Free lines print no CAFTA-DR rate, so they "
    "pay 10% (9903.05.40). Without the claim, base rate plus 10%.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% "
    "(9903.05.20–9903.05.84). Jordanian goods (9903.06.20) and Guatemalan and Salvadoran goods claimed under CAFTA-DR "
    "(9903.06.06, 9903.06.09) pay no Section 301 duty; nor do CAFTA-DR textile goods of Costa Rica, the Dominican Republic, Honduras or "
    "Nicaragua entered duty-free under the agreement (note 52(i)). The range is shown without preferences.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    extra = []
    if c["country"] == "India":
        extra = ["fr-2020-00247", "fr-2020-00245", "eo-14384"]
    elif c["country"] == "China":
        extra = ["fr-2020-00247", "fr-2020-00245", "fr-2019-05520"]
    elif c["country"] in ("Vietnam", "Indonesia", "Thailand"):
        extra = ["fr-2021-27003"]
    elif c["country"] == "Canada":
        extra = ["procl-11048"]
    if c["country"] != "Any other country":
        extra.append("eo-14389")
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
assert set(RULES) == {c["country"] for c in ia["countries"]}
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU, Taiwanese, Japanese and Korean rates of \"10% / 12.5% in total\" replace the base rate only when it is lower (U.S. "
    "note 52(k)); many Chapter 54 fabric lines have a higher base rate, which then applies alone.",
    "Antidumping and countervailing duties are not included. Polyester textured yarn (5402.33, also 5402.52 and 5401.10) "
    "from China, India, Indonesia, Malaysia, Thailand and Vietnam, and plastic decorative ribbon from China (which may enter "
    "under 5404.90), carry company-specific cash deposits set by Commerce.",
    "Canada: the 50% Section 338 duty (U.S. note 51) on 5407.52.20 applies whether or not USMCA is claimed; no Chapter 54 "
    "line is on the September 29, 2026 import-ban annexes.",
    "CAFTA-DR textile goods entered duty-free under the agreement are exempt from the 2026 Section 301 duty (note 52(i), "
    "9903.05.95); every Chapter 54 line is in its coverage. The Guatemala row applies it with the CAFTA-DR claim; the 15 "
    "general-Free lines print no CAFTA-DR rate, so the relief does not reach them and they pay 10%.",
    "Section 232 vehicle-parts duties (9903.94.xx, 9903.74.09) reach Chapter 54 goods only if the importer elects to "
    "certify them as automobile or truck parts (U.S. notes 33 and 38); no election is assumed.",
    "Not in the grid: the UFLPA presumption against goods made in Xinjiang or by listed entities, and textile entry rules "
    "(origin under 19 CFR 102.21, manufacturer identification) — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) "
    "names no Chapter 54 code. Of the note 52(j) country lists, only Jordan's (all 131 eight-digit subheadings, 9903.06.20) "
    "and Guatemala's and El Salvador's CAFTA-DR lists (all 131, 9903.06.06, 9903.06.09) name Chapter 54 codes; the UK, EU, "
    "Swiss, Taiwanese, Indonesian and other lists name none. Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods "
    "defined by the WTO textiles Annex (general note 29(d)(v)), which takes in all of chapter 54. Note 50(a)(ii) names no Chapter 54 code for Brazil. Note 51(b)(3) puts 5407.52.20 on "
    "the Canada Section 338 list. Note 20(f) puts 129 of the 131 subheadings on China List 3; 5407.54.00 is on List 4A "
    "(note 20(s)) and 5402.20.60 only on the suspended List 4B (note 20(u)). No product exclusion now in effect (notes "
    "20(vvv), 20(www)) and no note 31 increase names a Chapter 54 code. No Section 232 heading reaches Chapter 54 except "
    "through the certified vehicle-parts elections. Commerce orders: polyester textured yarn (China, India, Indonesia, "
    "Malaysia, Thailand, Vietnam) and plastic decorative ribbon (China)."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]] + ["fr-2021-27003", "fr-2019-05520"])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Man-Made Filament Yarn & Fabric (HTS Ch. 54): Origin Rules, AD/CVD, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Polyester & Nylon Yarn and Fabric: Textile Origin, USMCA Yarn-Forward, PTY Antidumping (HTS Chapter 54) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, Commerce and FTC rules for each HTS Chapter 54 line — textile country of origin (19 CFR 102.21), manufacturer "
    "ID, invoices and fibre labeling, UFLPA, polyester textured yarn AD/CVD — and the legal ways to pay less: USMCA and "
    "CAFTA-DR, FTAs, classification rulings, samples and drawback."
)
te["seo"]["keywords"] = [
    "usmca yarn-forward rules",
    "synthetic filament classification",
    "man-made filaments country of origin",
    "19 CFR 102.21 filament yarn",
    "polyester textured yarn antidumping scope",
    "UFLPA polyester viscose",
    "usmca preference for man-made filaments",
]
te["intro"] = (
    "Chapter 54 goods are textiles, so **CBP's textile rules decide where they come from**: filament yarn is from the country "
    "where the filaments were **extruded**, and fabric from where it was **woven** — dyeing or printing alone does not move "
    "origin (19 CFR 102.21). Every entry names the manufacturer through a manufacturer identification code. Textured "
    "polyester yarn from six countries carries **antidumping or countervailing duties**, and goods made wholly or in part "
    "in Xinjiang are presumed barred under the UFLPA.\n\n"
    "The ways to pay less are in the schedule: claim **USMCA** on North American yarn and fabric (yarn-forward rules), "
    "**CAFTA-DR** or another FTA where the base rate is the cost, check whether a yarn is **inside an AD/CVD order's scope**, "
    "get a **classification ruling** where the line decides the rate, enter **samples** under Chapter 98, and claim "
    "**drawback** on re-exports. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on filament yarn and fabric made in North America",
        "saves": "The base rate (up to 25%) and the 10% Section 301 duty for Mexico or Canada",
        "appliesTo": "All 265 lines, for goods that qualify: yarn of 5401–5406 made from material of another chapter (other "
        "than cotton or man-made staple fibre), fabric of 5407–5408 woven from originating yarn (General Note 11, Chapter 54 rules)",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" on "
        "the entry line.",
        "caveat": "Fabric woven in Mexico from Asian filament yarn does not qualify. For Canada, USMCA does not remove the 50% "
        "Section 338 duty on 5407.52.20. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 54 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
        ],
    },
    {
        "id": "cafta-dr",
        "title": "Source originating yarn or fabric from a CAFTA-DR country or Jordan",
        "saves": "The base rate and the whole 10%–12.5% Section 301 duty",
        "appliesTo": "All lines, for textile goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras or "
        "Nicaragua that originate under CAFTA-DR (General Note 29) and are entered duty-free under it (U.S. note 52(i)), and "
        "for Jordanian goods (exception list, 9903.06.20)",
        "document": "A CAFTA-DR claim (SPI \"P\") supported by the importer's knowledge or a certification (19 CFR 10.583, "
        "10.584); the exemption heading on the entry line.",
        "caveat": "CAFTA-DR's Chapter 54 rules are yarn-forward like USMCA's. Note 52(i) needs the goods to be entered "
        "duty-free under CAFTA-DR, so it does not reach the 15 general-Free lines, which print no CAFTA-DR rate. From 2027 Nicaraguan goods not originating under CAFTA-DR pay a separate "
        "Section 301 duty (10%, then 15%).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
            {"label": "HTSUS General Note 29", "url": GN},
            {"label": "19 CFR 10.583", "url": ecfr(19, "10.583")},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 7.5%–10% on yarn, 11.4% on sewing thread, 12%–25% on fabric",
        "appliesTo": "The 250 dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Morocco, "
        "Bahrain, Oman and Singapore; AGOA (through December 31, 2026) and CBERA only on 5404.12.10, 5404.19.10 and 5405.00.60",
        "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, MA, BH, OM, "
        "SG, D, E).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)). Korea pays 12.5% in total with KORUS, "
        "so the claim matters only where the base rate is above 12.5%. GSP (A) has been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a), (k)", "url": CH99},
            {"label": "CBP: GSP status", "url": src("cbp-gsp")["url"]},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check whether polyester yarn is inside the textured yarn AD/CVD orders",
        "saves": "The whole antidumping or countervailing duty deposit, when the yarn or the producer is outside the order",
        "appliesTo": "Polyester filament yarn from China, India, Indonesia, Malaysia, Thailand and Vietnam entered under "
        "5402.33, 5402.52 or 5401.10 — the orders cover textured polyester yarn; flat (non-textured) or nylon yarn is outside "
        "them, and the China and India orders exclude bulk continuous filament yarn of 900 denier or more with 40 or more "
        "turns per meter and maximum shrinkage of 2.5%",
        "document": "Technical specifications (texturing, denier, twist, shrinkage) and, where in doubt, a scope ruling from "
        "Commerce; the producer's own cash-deposit rate where it has one.",
        "caveat": "The written scope, not the HTS number, decides coverage. AD/CVD duties are not refundable as drawback.",
        "citations": [
            {"label": "19 CFR 351.225 (scope rulings)", "url": ecfr(19, "351.225")},
            {"label": "85 FR 1298 (China and India AD orders)", "url": src("fr-2020-00247")["url"]},
            {"label": "86 FR 71031 (Indonesia, Malaysia, Thailand, Vietnam AD orders)", "url": src("fr-2021-27003")["url"]},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding classification ruling where the line decides the rate",
        "saves": "Up to 25 points of base rate, and the AD/CVD question: textured vs. flat yarn, high tenacity (Section XI note "
        "6), sewing thread (note 5) vs. yarn, monofilament under or over 67 decitex, strip up to 5 mm, 85% filament content, "
        "wool-blend fabrics (25%) vs. others",
        "appliesTo": "Any line where construction, tenacity, put-up or blend is in doubt — especially 5402 yarn and 5407 blends",
        "document": "A ruling request to CBP describing fibre content by weight, decitex, filament count, twist, tenacity, "
        "construction and finish (19 CFR part 177); invoices must state the same details (19 CFR 141.89).",
        "caveat": "Rulings apply to the transaction described; a different yarn or fabric may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Section XI and Chapter 54 notes", "url": CH54},
        ],
    },
    {
        "id": "samples",
        "title": "Enter swatches and yarn samples as samples",
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
        "title": "Claim drawback when the yarn or fabric, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported yarn or fabric re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Antidumping and countervailing duties are not refundable (19 CFR 190.3(b)); manufacturing drawback needs a "
        "ruling or a general manufacturing ruling.",
        "citations": [
            {"label": "19 CFR part 190", "url": ecfr_part(19, 190)},
            {"label": "19 CFR 190.3", "url": ecfr(19, "190.3")},
        ],
    },
]
te["rules"] = [
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Textile country of origin: filament yarn, monofilament and strip (5401–5406) are from where they were "
        "extruded; fabric (5407–5408) from where it was woven, or where greige fabric was both dyed and printed with two "
        "finishing operations",
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
        "title": "Invoice details: fibre content by weight, and for yarn whether filament or spun, single or plied, textured or "
        "not, decitex and whether put up for retail sale; for fabric, weave, weight and finish",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Yarns; Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "adcvd-pty",
        "agency": "Commerce / CBP",
        "title": "Polyester textured yarn from China, India, Indonesia, Malaysia, Thailand and Vietnam: antidumping (and, for "
        "China and India, countervailing) cash deposits at the producer's or country-wide rate, declared on the entry; not in "
        "the tariff calculator",
        "citations": [
            {"label": "85 FR 1298 (AD orders, China and India)", "url": src("fr-2020-00247")["url"]},
            {"label": "85 FR 1301 (CVD orders, China and India)", "url": src("fr-2020-00245")["url"]},
            {"label": "86 FR 71031 (AD orders, Indonesia, Malaysia, Thailand, Vietnam)", "url": src("fr-2021-27003")["url"]},
            {"label": "90 FR 27527 (China and India orders continued)", "url": src("fr-2025-11912")["url"]},
        ],
    },
    {
        "id": "adcvd-ribbon",
        "agency": "Commerce / CBP",
        "title": "Plastic decorative ribbon from China (4 inches wide or less, mostly polypropylene) may enter under 5404.90 "
        "and carries antidumping and countervailing duty deposits",
        "citations": [
            {"label": "84 FR 10786 (AD and CVD orders)", "url": src("fr-2019-05520")["url"]},
            {"label": "89 FR 84865 (orders continued)", "url": src("fr-2024-24749")["url"]},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Fiber Products Identification Act: yarns and fabrics sold onward must show generic fibre names "
        "(\"polyester\", \"nylon\", \"rayon\") by percentage and the country where processed or made",
        "citations": [
            {"label": "16 CFR 303.45(a)(17)", "url": ecfr(16, "303.45")},
            {"label": "16 CFR 303.33", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List (which names "
        "Xinjiang Zhongtai Group, a PVC and viscose fibre and yarn producer) are presumed made with forced labor and excluded "
        "unless the importer rebuts it; PVC is a named high-priority sector",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "DHS UFLPA strategy, 2025 update", "url": src("dhs-uflpa-2025")["url"]},
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
BASE_RULES = ["textile-origin", "textile-mid", "cita-transship", "invoice", "ftc-labeling", "uflpa", "cbp-marking"]
GROUP_NOTES = {
    "5401": "Sewing thread is from where the filaments were extruded. Polyester sewing thread of 5401.10 is named in the PTY "
    "antidumping orders on Indonesia, Malaysia, Thailand and Vietnam.",
    "5402": "Origin is the country of extrusion; texturing or twisting elsewhere does not change it. Textured polyester yarn "
    "(5402.33, also 5402.52) is under AD/CVD orders on six countries; the invoice must say textured or flat.",
    "5403": "Viscose and acetate yarn are from where the filament was extruded. Viscose from Xinjiang or a listed entity "
    "(Xinjiang Zhongtai) falls under the UFLPA presumption.",
    "5404": "Monofilament of 67 decitex or more with no cross-section over 1 mm, and strip up to 5 mm wide; wider strip is "
    "plastic sheet (chapter 39). Plastic decorative ribbon from China may enter under 5404.90 and carries AD/CVD.",
    "5405": "Artificial monofilament and strip; origin is the country of extrusion. 5405.00.60 is printed with AGOA and "
    "CBERA preferences.",
    "5406": "Retail put-ups are 85 g or less per reel, card or skein (Section XI note 4). Fibre-content labels apply to yarn "
    "sold to consumers.",
    "5407": "Fabric takes the origin of the country where it was woven; dyeing and printing alone do not change it. Dyed "
    "textured polyester fabric (5407.52.20) from Canada pays the 50% Section 338 duty even with USMCA.",
    "5408": "Fabric takes the origin of the country where it was woven. Blends with 36% or more wool pay up to 25% base; "
    "classify by the fibre that predominates by weight.",
}
GROUP_RULES = {
    "5401": BASE_RULES + ["adcvd-pty"],
    "5402": BASE_RULES + ["adcvd-pty"],
    "5404": BASE_RULES + ["adcvd-ribbon"],
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES.get(g["heading"], BASE_RULES)
    g["note"] = GROUP_NOTES[g["heading"]]
FREE = {r["hts"] for r in d["overview"]["rateTable"]["rows"] if not r["isHeaderRow"] and r.get("effectiveGeneral") == "Free"}
assert sum(1 for h in FREE if len(h) == 13) == 15, sorted(FREE)
PTY = ("5402.33", "5402.52", "5401.10")
for ln in te["lines"]:
    h = ln["hts"]
    rules = list(BASE_RULES)
    if h.startswith(PTY):
        rules.append("adcvd-pty")
    if h.startswith("5404.90"):
        rules.append("adcvd-ribbon")
    ln["ruleIds"] = rules
    lev = ["usmca", "cafta-dr"]
    if h not in FREE:
        lev.append("fta")
    if h.startswith(PTY):
        lev.append("adcvd-scope")
    lev += ["ruling", "samples", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China lists, "
    "the Canada Section 338 list and AD/CVD cash-deposit rates change by proclamation, USTR notice and Commerce review; check "
    "them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 54 FAQ: Polyester, Nylon & Rayon Yarn and Fabric HS Codes and Import Tariffs"
fc["seo"]["title"] = "Polyester & Nylon Yarn and Fabric HS Code & Tariff FAQ 2026 (HTS Chapter 54 Man-Made Filaments) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing man-made filaments: the HS / tariff code for polyester and nylon yarn, "
    "sewing thread, monofilament, polyester, nylon and rayon fabric, the PTY antidumping orders and the 2026 tariffs on "
    "China, India and Vietnam."
)
fc["seo"]["keywords"] = [
    "hts chapter 54",
    "man made filaments",
    "polyester yarn hs code",
    "polyester filament yarn hs code",
    "nylon yarn hs code",
    "polyester fabric hs code",
    "nylon fabric hs code",
    "rayon fabric hs code",
    "sewing thread hs code",
    "monofilament hs code",
    "polyester textured yarn hs code",
    "hs code 5402",
    "hs code 5407",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing man-made filament yarn and fabric into the U.S. — HS "
    "codes, tariffs by country, antidumping duties and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 54 base rates are real — 7.5%–8.8% on most yarn, 11.4% on sewing thread, 12%–14.9% on most fabric, up to 25% — "
    "and unchanged since January 2025; 15 of 265 lines are Free, including woven strip fabric (5407.20).",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff; EU, Taiwanese, Japanese and Korean goods pay "
    "10% or 12.5% in total, which adds nothing on fabric with a higher base rate. No EU or UK exception list covers Chapter 54.",
    "China pays 37.5% extra on most lines, Brazil 37.5%, Canada 50% under Section 338 on dyed textured polyester fabric even "
    "with USMCA; USMCA-qualifying goods are otherwise Free.",
    "Polyester textured yarn from China, India, Indonesia, Malaysia, Thailand and Vietnam carries antidumping (and for China "
    "and India countervailing) duties on top of the tariff.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026. Filament yarn is from where "
    "it was extruded, fabric from where it was woven (19 CFR 102.21).",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "what-is-chapter-54",
        "question": "What does HTS Chapter 54 (man-made filaments) cover?",
        "searchedAs": ["hts chapter 54", "htsus chapter 54", "chapter 54 man made filaments", "man made filaments meaning", "man made filaments examples"],
        "answer": "Chapter 54 covers continuous man-made filaments and what is woven from them: sewing thread (5401), synthetic "
        "filament yarn of polyester, nylon, aramid, polypropylene or spandex (5402), artificial filament yarn of viscose rayon or "
        "acetate (5403), monofilament and strip (5404–5405), retail put-ups (5406) and woven filament fabrics (5407–5408). "
        "Staple fibre and spun yarn are chapter 55; knitted fabric is chapter 60.",
        "link": "",
    },
    {
        "id": "polyester-yarn-hs-code",
        "question": "What is the HS code for polyester yarn?",
        "searchedAs": ["polyester yarn hs code", "polyester filament yarn hs code", "polyester textured yarn hs code", "polyester yarn hts code", "polyester yarn tariff code", "polyester filament yarn (pfy)"],
        "answer": "Polyester filament yarn not for retail sale is heading 5402: high-tenacity yarn 5402.20 (8.8% single, 7.5% "
        "plied), textured yarn (DTY) 5402.33 (8.8% / 8%), partially oriented yarn (POY) 5402.46 (8.8%), flat yarn 5402.47 "
        "(8%), twisted single yarn 5402.52 (8.8%) and plied yarn 5402.62 (7.5%). Spun polyester yarn from staple fibre is "
        "chapter 55 (5509).",
        "link": "",
    },
    {
        "id": "nylon-yarn-hs-code",
        "question": "What is the HS code for nylon yarn and nylon filament yarn?",
        "searchedAs": ["nylon yarn hs code", "nylon filament yarn hs code", "nylon 6 yarn hs code", "nylon 66 yarn hs code", "nylon textured yarn hs code", "100 nylon yarn hs code"],
        "answer": "Nylon filament yarn not for retail sale is in 5402: high-tenacity 5402.19 (8.8% / 8%), textured 5402.31 (500 "
        "decitex or less, 8.8% / 8%) or 5402.32 (8%), other single yarn 5402.45 (8%, or Free for certain colored multifilament) or "
        "5402.51 (8.8%), plied 5402.61 (7.5%). Aramid yarn such as Kevlar is 5402.11, since polyamides include aramids "
        "(Section XI note 12).",
        "link": "",
    },
    {
        "id": "sewing-thread-hs-code",
        "question": "What is the HS code for polyester or nylon sewing thread?",
        "searchedAs": ["sewing thread hs code", "polyester sewing thread hs code", "nylon sewing thread hs code", "polyester thread hs code", "nylon thread hs code", "polyester embroidery thread hs code"],
        "answer": "Sewing thread of synthetic filaments is 5401.10.00 and of artificial filaments (rayon) 5401.20.00, both 11.4%. "
        "To count as sewing thread it must be multiple or cabled, on supports of 1,000 g or less, dressed for sewing and have a "
        "final Z twist (Section XI note 5). Spun polyester sewing thread is chapter 55 (5508).",
        "link": "",
    },
    {
        "id": "polyester-fabric-hs-code",
        "question": "What is the HS code for woven polyester fabric?",
        "searchedAs": ["polyester fabric hs code", "woven polyester fabric hs code", "100 polyester woven fabric hs code", "polyester taffeta hs code", "polyester fabric tariff code", "polyester fabric hts code"],
        "answer": "Woven fabric of polyester filament yarn is heading 5407: 85% or more textured polyester is 5407.51–5407.54, 85% "
        "or more non-textured polyester (taffeta, satin, chiffon) 5407.61, blends 5407.69 or 5407.7x–5407.9x. Most lines are "
        "12%–14.9%. Fabric of spun (staple) polyester is chapter 55; knitted polyester fabric is chapter 60.",
        "link": "",
    },
    {
        "id": "nylon-fabric-hs-code",
        "question": "What is the HS code for nylon fabric?",
        "searchedAs": ["nylon fabric hs code", "nylon woven fabric hs code", "nylon taffeta fabric hs code", "nylon ripstop fabric hs code", "nylon fabric tariff code", "100 nylon fabric hs code"],
        "answer": "Woven fabric of nylon filament yarn is 5407: from high-tenacity nylon 5407.10 (13.6%), other fabric of 85% or "
        "more nylon 5407.41–5407.44 (13.6% unbleached, 14.9% dyed, 12% printed). Nylon ripstop and taffeta usually fall in "
        "5407.42. Knitted, mesh or net nylon fabric is chapter 60 or 58.",
        "link": "",
    },
    {
        "id": "rayon-fabric-hs-code",
        "question": "What is the HS code for rayon or viscose fabric and yarn?",
        "searchedAs": ["rayon fabric hs code", "viscose fabric hs code", "viscose filament yarn hs code", "viscose rayon filament yarn hs code", "viscose yarn hs code"],
        "answer": "Viscose rayon filament yarn is 5403 (10% for single yarn, 9.1% plied); woven fabric of rayon or acetate "
        "filament yarn is 5408, mostly 12%–15%. Fabric and yarn spun from viscose staple fibre — the more common \"rayon\" "
        "dress fabric — are chapter 55 (5510, 5516).",
        "link": "",
    },
    {
        "id": "monofilament-hs-code",
        "question": "What is the HS code for nylon monofilament and fishing line?",
        "searchedAs": ["monofilament hs code", "nylon monofilament hs code", "fishing line hs code", "monofilament fishing line hs code", "monofilament yarn hs code"],
        "answer": "Synthetic monofilament of 67 decitex or more with no cross-section over 1 mm is 5404.11–5404.19 (6.9%; racket "
        "strings 2.7%); finer monofilament is filament yarn of 5402. Fishing line put up and packaged for retail sale is "
        "9507.90.20 (3.7%) instead.",
        "link": "",
    },
    {
        "id": "spandex-yarn-hs-code",
        "question": "What is the HS code for spandex (elastomeric) yarn?",
        "searchedAs": ["spandex yarn hs code", "elastic yarn hs code", "lycra yarn hs code", "spandex bare yarn hs code"],
        "answer": "Bare spandex filament yarn is elastomeric yarn of 5402.44 (8%); elastomeric monofilament of 67 decitex or more "
        "is 5404.11 (6.9%). Elastomeric yarn must stretch to three times its length without breaking and recover (Section XI "
        "note 13). Covered or core-spun spandex yarns are classified by their composition and construction; get a ruling.",
        "link": "tariff-engineering",
    },
    {
        "id": "hs-5402-5407",
        "question": "What do HS codes 5402 and 5407 cover, and what are their tariffs?",
        "searchedAs": ["hs code 5402", "hs code 5402.33", "hs code 5402.20", "hs code 5407", "hs code 5407.61", "hs code 5407.52", "hts code 5407"],
        "answer": "5402 is synthetic filament yarn not for retail sale, 7.5%–8.8% (two lines Free) — 45% of U.S. Chapter 54 "
        "imports in 2025. 5407 is woven fabric of synthetic filament yarn: 5407.20 woven strip fabric is Free; most other "
        "lines are 12%–14.9%, wool blends 25%. 5402.33 is textured polyester yarn, under AD/CVD orders; 5407.52 dyed textured "
        "polyester fabric.",
        "link": "industry-areas",
    },
    {
        "id": "pty-antidumping",
        "question": "Is there an antidumping duty on polyester textured yarn or nylon filament yarn?",
        "searchedAs": ["polyester textured yarn china dumping", "nylon filament yarn on anti dumping duty", "polyester textured yarn"],
        "answer": "Yes for polyester textured yarn: antidumping and countervailing duty orders on China and India (since January "
        "2020, continued in June 2025) and antidumping orders on Indonesia, Malaysia, Thailand and Vietnam (since December "
        "2021; sunset reviews due from November 2026). Deposits are company-specific. There is no U.S. order on nylon filament "
        "yarn.",
        "link": "tariff-updates",
    },
    {
        "id": "china-tariff",
        "question": "What is the tariff on polyester yarn and fabric from China?",
        "searchedAs": ["polyester yarn import from china", "polyester fabric import from china", "polyester from china", "china tariff on man-made filaments"],
        "answer": "Most Chapter 54 lines from China pay 25% under Section 301 List 3 plus 12.5% under the 2026 action on top of the "
        "base rate: 46.3% on single textured polyester yarn, 52.4% on dyed polyester fabric at 14.9%. Printed textured "
        "polyester fabric pays 20% extra and plied high-tenacity polyester yarn 12.5%. Textured yarn also pays AD/CVD.",
        "link": "industry-areas",
    },
    {
        "id": "india-vietnam-tariff",
        "question": "What is the tariff on man-made filaments from India and Vietnam?",
        "searchedAs": ["vietnam tariff on man-made filaments", "polyester filament yarn manufacturers in india", "polyester yarn rates in india"],
        "answer": "India pays the base rate plus 10% Section 301 (9903.05.44): 10% on woven strip fabric, 17.5%–18.8% on yarn, "
        "about 22%–25% on filament fabric. Vietnam pays the base rate plus 12.5% (9903.05.84): 20%–21.3% on yarn. Both have "
        "PTY antidumping orders. The 2025 IEEPA rates — 50% for India, 20% for Vietnam — ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "polypropylene",
        "question": "Where are polypropylene yarn, strip and woven PP fabric classified?",
        "searchedAs": ["polypropylene yarn hs code", "pp yarn hs code", "polypropylene multifilament yarn hs code", "polypropylene fabric hs code"],
        "answer": "Polypropylene filament yarn is in 5402 (5402.34 textured, 5402.48, 5402.53, 5402.63: 7.5%–8.8%); "
        "polypropylene monofilament 5404.12 (6.9%); strip up to 5 mm wide 5404.90 (Free); fabric woven from such strip — "
        "the bag and tarp fabric — 5407.20, which is Free at the general rate and the largest Chapter 54 import.",
        "link": "",
    },
    {
        "id": "country-of-origin",
        "question": "How is the country of origin of filament yarn and fabric determined?",
        "searchedAs": ["man made filaments country of origin", "polyester country of origin"],
        "answer": "By CBP's textile rules (19 CFR 102.21): filament yarn, monofilament and strip are from where the filaments were "
        "extruded; fabric is from where it was woven, unless greige fabric is both dyed and printed with two finishing "
        "operations. For USMCA and CAFTA-DR the yarn-forward rules in the General Notes decide preference, which is separate.",
        "link": "tariff-engineering",
    },
]

# ---------------------------------------------------------------- write
d["asOf"] = CHECKED
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
