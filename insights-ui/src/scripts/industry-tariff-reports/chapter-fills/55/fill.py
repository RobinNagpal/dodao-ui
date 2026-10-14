"""Fill the writer parts of the generated Chapter 55 (Man-made staple fibers) content file.

Re-run with run.sh (generate -> fill -> compact -> prettier -> validate).
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
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH55 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2055"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


def fr(src_id, citation, document, title, published, url, signed=None):
    return {
        "id": src_id,
        "publisher": "Federal Register",
        "citation": citation,
        "document": document,
        "title": title,
        "signed": signed,
        "published": published,
        "url": url,
    }


d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))

FRD = "https://www.federalregister.gov/documents"
NEW_SOURCES = {
    "procl-10857": fr(
        "procl-10857", "89 FR 89909", "Proclamation 10857",
        "To Facilitate Positive Adjustment to Competition From Imports of Fine Denier Polyester Staple Fiber (Section 201 safeguard)",
        "2024-11-14",
        f"{FRD}/2024/11/14/2024-26714/to-facilitate-positive-adjustment-to-competition-from-imports-of-fine-denier-polyester-staple-fiber",
        signed="2024-11-08",
    ),
    "fr-2026-10545": {
        "id": "fr-2026-10545",
        "publisher": "Federal Register",
        "citation": "91 FR 31744",
        "document": "USITC notice (Inv. TA-201-78 (Monitoring))",
        "title": "Fine Denier Polyester Staple Fiber: Monitoring Developments in the Domestic Industry; Institution and Scheduling Notice",
        "signed": None,
        "published": "2026-05-28",
        "url": f"{FRD}/2026/05/28/2026-10545/fine-denier-polyester-staple-fiber-monitoring-developments-in-the-domestic-industry-institution-and",
    },
    "fr-2018-15567": fr(
        "fr-2018-15567", "83 FR 34545", "Commerce notice (A-570-060, A-533-875, A-580-892, A-583-860)",
        "Fine Denier Polyester Staple Fiber From the People's Republic of China, India, the Republic of Korea, and Taiwan: Antidumping Duty Orders",
        "2018-07-20",
        f"{FRD}/2018/07/20/2018-15567/fine-denier-polyester-staple-fiber-from-the-peoples-republic-of-china-india-the-republic-of-korea",
    ),
    "fr-2018-05371": fr(
        "fr-2018-05371", "83 FR 11681", "Commerce notice (C-570-061, C-533-876)",
        "Fine Denier Polyester Staple Fiber From the People's Republic of China and India: Amended Final Affirmative Countervailing Duty Determination and Countervailing Duty Orders",
        "2018-03-16",
        f"{FRD}/2018/03/16/2018-05371/fine-denier-polyester-staple-fiber-from-the-peoples-republic-of-china-and-india-amended-final",
    ),
    "fr-2024-07692": fr(
        "fr-2024-07692", "89 FR 25563", "Commerce notice",
        "Fine Denier Polyester Staple Fiber From China, India, Korea, and Taiwan: Continuation of Antidumping and Countervailing Duty Orders",
        "2024-04-11",
        f"{FRD}/2024/04/11/2024-07692/fine-denier-polyester-staple-fiber-from-the-peoples-republic-of-china-india-the-republic-of-korea",
    ),
    "fr-2018-17691": fr(
        "fr-2018-17691", "83 FR 40752", "Commerce notice (A-580-895, A-583-863)",
        "Low Melt Polyester Staple Fiber From the Republic of Korea and Taiwan: Antidumping Duty Orders",
        "2018-08-16",
        f"{FRD}/2018/08/16/2018-17691/low-melt-polyester-staple-fiber-from-the-republic-of-korea-and-taiwan-antidumping-duty-orders",
    ),
    "fr-2023-28266": fr(
        "fr-2023-28266", "88 FR 88573", "Commerce notice",
        "Low Melt Polyester Staple Fiber From the Republic of Korea and Taiwan: Continuation of Antidumping Duty Orders",
        "2023-12-22",
        f"{FRD}/2023/12/22/2023-28266/low-melt-polyester-staple-fiber-from-the-republic-of-korea-and-taiwan-continuation-of-antidumping",
    ),
    "fr-2026-07505": fr(
        "fr-2026-07505", "91 FR 20638", "Commerce notice",
        "Low Melt Polyester Staple Fiber From the Republic of Korea: Final Results of Antidumping Duty Administrative Review; 2023-2024",
        "2026-04-17",
        f"{FRD}/2026/04/17/2026-07505/low-melt-polyester-staple-fiber-from-the-republic-of-korea-final-results-of-antidumping-duty",
    ),
    "fr-2022-17920": fr(
        "fr-2022-17920", "87 FR 51055", "Commerce notice",
        "Polyester Staple Fiber From the Republic of Korea and Taiwan: Continuation of the Antidumping Duty Orders",
        "2022-08-19",
        f"{FRD}/2022/08/19/2022-17920/polyester-staple-fiber-from-the-republic-of-korea-and-taiwan-continuation-of-the-antidumping-duty",
    ),
    "fr-2023-19041": fr(
        "fr-2023-19041", "88 FR 60641", "Commerce notice",
        "Certain Polyester Staple Fiber From the People's Republic of China: Continuation of Antidumping Duty Order",
        "2023-09-05",
        f"{FRD}/2023/09/05/2023-19041/certain-polyester-staple-fiber-from-the-peoples-republic-of-china-continuation-of-antidumping-duty",
    ),
    "fr-00-13096": fr(
        "fr-00-13096", "65 FR 33807", "Commerce notice (A-580-839, A-583-833)",
        "Amended Final Determination of Sales at Less Than Fair Value: Certain Polyester Staple Fiber From Korea, and Antidumping Duty Orders: Certain Polyester Staple Fiber From Korea and Taiwan",
        "2000-05-25",
        f"{FRD}/2000/05/25/00-13096/notice-of-amended-final-determination-of-sales-at-less-than-fair-value-certain-polyester-staple",
    ),
    "fr-e7-10607": fr(
        "fr-e7-10607", "72 FR 30545", "Commerce notice (A-570-905)",
        "Notice of Antidumping Duty Order: Certain Polyester Staple Fiber from the People's Republic of China",
        "2007-06-01",
        f"{FRD}/2007/06/01/E7-10607/notice-of-antidumping-duty-order-certain-polyester-staple-fiber-from-the-peoples-republic-of-china",
    ),
    "fr-2011-6253": fr(
        "fr-2011-6253", "76 FR 14575", "Final rule (CBP Dec. 11-09)",
        "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer identification code required)",
        "2011-03-17",
        f"{FRD}/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products",
    ),
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
ADCVD_IDS = ["fr-2018-15567", "fr-2018-05371", "fr-2024-07692", "fr-00-13096", "fr-2022-17920", "fr-e7-10607",
             "fr-2023-19041", "fr-2018-17691", "fr-2023-28266", "fr-2026-07505"]

LABELS = {
    "5501": ("Synthetic filament tow (nylon, polyester, acrylic, polypropylene)", "Synthetic tow"),
    "5502": ("Artificial filament tow (viscose, acetate)", "Artificial tow"),
    "5503": ("Synthetic staple fibers, not carded or combed (polyester, acrylic, aramid, polypropylene)", "Synthetic staple fiber"),
    "5504": ("Artificial staple fibers, not carded or combed (viscose rayon, lyocell)", "Viscose staple fiber"),
    "5505": ("Waste of man-made fibers (noils, yarn waste, garnetted stock)", "Man-made fiber waste"),
    "5506": ("Synthetic staple fibers, carded or combed (tops)", "Carded synthetic fiber"),
    "5507": ("Artificial staple fibers, carded or combed", "Carded artificial fiber"),
    "5508": ("Sewing thread of man-made staple fibers", "Sewing thread"),
    "5509": ("Yarn of synthetic staple fibers, not for retail sale (spun polyester, acrylic yarn)", "Synthetic spun yarn"),
    "5510": ("Yarn of artificial staple fibers, not for retail sale (spun rayon yarn)", "Spun rayon yarn"),
    "5511": ("Yarn of man-made staple fibers put up for retail sale", "Retail yarn"),
    "5512": ("Woven fabrics of 85% or more synthetic staple fibers", "Synthetic fabric 85%+"),
    "5513": ("Woven fabrics of synthetic staple fibers under 85%, mixed with cotton, up to 170 g/m²", "Poly-cotton fabric, light"),
    "5514": ("Woven fabrics of synthetic staple fibers under 85%, mixed with cotton, over 170 g/m²", "Poly-cotton fabric, heavy"),
    "5515": ("Other woven fabrics of synthetic staple fibers (blends with rayon, filament, wool)", "Other synthetic blends"),
    "5516": ("Woven fabrics of artificial staple fibers (spun rayon, viscose)", "Rayon fabric"),
}

# ---------------------------------------------------------------- chapter / overview
d["chapter"]["title"] = "Man-made staple fibers"
ov = d["overview"]
ov["h1"] = "HTS Chapter 55: Man-Made Staple Fibers — Polyester Staple Fiber, Spun Yarn & Woven Fabric Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 55 Man-Made Staple Fibers Tariff 2026: Polyester Staple Fiber, Viscose, Spun Yarn & Fabric Duty Rates | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 399 HTS Chapter 55 lines — polyester and viscose staple fiber, filament tow, spun yarn, "
    "sewing thread and woven staple-fiber fabrics. General, FTA and Column 2 rates, the 2026 extra duties by country, and the "
    "antidumping orders on polyester staple fiber."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 55",
    "man-made staple fibers tariff",
    "man-made staple fibers import duty rates",
    "polyester staple fiber hs code",
    "hs code 5503.20",
    "viscose staple fiber hs code",
    "staple fiber hs code",
    "synthetic staple fibers import duty",
    "polyester filament tow customs duty",
    "hts chapter 55 customs duty",
]
ov["intro"] = (
    "Chapter 55 covers man-made fibers cut into short lengths and everything spun or woven from them: **filament tow** "
    "(5501–5502), **staple fibers** of polyester, acrylic, nylon, polypropylene and viscose rayon (5503–5507), **sewing "
    "thread** and **spun yarn** (5508–5511) and **woven staple-fiber fabrics** (5512–5516), including polyester-cotton "
    "and rayon fabrics. Continuous-filament yarn and fabric are chapter 54; knitted fabric is chapter 60. Its **399 tariff "
    "lines** run from Free to 25%: 4.3% on staple fiber, 7%–13.2% on yarn and mostly 12%–14.9% on woven fabric.\n\n"
    "The extra duty by country adds to that. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of "
    "10% or 12.5%**: EU, Japanese, Korean and Taiwanese goods pay 10% or 12.5% in total where the base rate is lower. "
    "**China pays 37.5%** on almost every line, Brazil 37.5%, and **Canada 50%** under Section 338 on retail yarn "
    "(5511.10) and dyed polyester fabric (5512.19), USMCA claim or not. **Polyester staple fiber** — a third of the "
    "**$1.56B** imported in 2025 — also carries **antidumping orders** on China, India, Korea and Taiwan and a Section 201 "
    "safeguard quota on fine-denier fiber entered under bond."
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "5501": (
        "Continuous man-made filaments gathered into tow over 2 m long (chapter note 1), sold for cutting or stretch-breaking "
        "into staple. 7.5% on every line. Japan supplied $27.7M of the $46.1M imported in 2025.",
        ["polyester tow", "acrylic tow", "nylon filament tow", "aramid tow", "polypropylene tow", "carbon fiber precursor tow"],
    ),
    "5502": (
        "Filament tow of artificial (cellulosic) fibers: viscose rayon and cellulose acetate tow, including acetate tow for "
        "cigarette filters. 7.5%.",
        ["acetate tow", "cellulose acetate tow", "viscose filament tow", "rayon tow"],
    ),
    "5503": (
        "Synthetic staple fiber, not yet carded: polyester (5503.20), aramid, acrylic, nylon and polypropylene. 4.3%; Free "
        "for vinyon and nylon-12 blends. The chapter's largest heading ($730.5M in 2025). Polyester staple fiber carries "
        "antidumping orders on China, India, Korea and Taiwan.",
        ["polyester staple fiber", "PSF", "fine denier polyester fiber", "recycled polyester staple fiber", "hollow conjugated fiber",
         "low melt fiber", "acrylic staple fiber", "aramid staple fiber", "polypropylene staple fiber"],
    ),
    "5504": (
        "Artificial (cellulosic) staple fiber, not carded: viscose rayon (5504.10) and other cellulosic fiber "
        "such as lyocell (5504.90). 4.3%. $231.4M in 2025, led by Germany, Indonesia and Austria.",
        ["viscose staple fiber", "VSF", "rayon staple fiber", "lyocell fiber", "tencel fiber"],
    ),
    "5505": (
        "Waste of man-made fibers: noils, yarn waste and garnetted stock (fiber pulled back from waste yarn or fabric). Free "
        "on all four lines.",
        ["polyester fiber waste", "nylon waste", "garnetted stock", "man-made fiber noils", "rayon waste"],
    ),
    "5506": (
        "Synthetic staple fiber that has been carded, combed or otherwise prepared for spinning — slivers and tops. 5%; "
        "5.7% for polyester.",
        ["polyester tops", "acrylic tops", "nylon sliver", "carded polyester fiber"],
    ),
    "5507": (
        "Artificial staple fiber carded, combed or otherwise prepared for spinning, such as viscose rayon tops. 5%.",
        ["rayon tops", "viscose sliver", "carded viscose fiber"],
    ),
    "5508": (
        "Sewing thread spun from man-made staple fiber, whether or not put up for retail sale: 11.4% for synthetic (spun "
        "polyester thread), 11% for artificial.",
        ["spun polyester sewing thread", "polyester thread", "sewing thread", "industrial sewing thread", "rayon thread"],
    ),
    "5509": (
        "Spun yarn of synthetic staple fiber not put up for retail sale: polyester, acrylic and nylon yarn, alone or blended "
        "with rayon, wool or cotton. 7%–13.2% by fiber content and ply.",
        ["spun polyester yarn", "100% polyester yarn", "polyester cotton yarn", "acrylic yarn", "polyester viscose yarn", "ring spun yarn"],
    ),
    "5510": (
        "Spun yarn of artificial staple fiber not put up for retail sale: viscose rayon, modal and lyocell yarn and their "
        "blends. 7.5%–13.2%.",
        ["viscose yarn", "rayon yarn", "modal yarn", "lyocell yarn", "spun rayon yarn"],
    ),
    "5511": (
        "Man-made staple-fiber yarn put up for retail sale (balls, skeins and hanks of up to 125 g; Section XI note 4) — "
        "mostly acrylic knitting and craft yarn. 7.5%. Türkiye shipped $73.9M in 2025. 5511.10 is on Canada's Section 338 list.",
        ["acrylic knitting yarn", "acrylic yarn skeins", "craft yarn", "polyester knitting yarn", "retail yarn"],
    ),
    "5512": (
        "Woven fabric of 85% or more synthetic staple fiber: 100% spun polyester and acrylic fabrics. 12%–14.9%. Dyed "
        "polyester fabric (5512.19) is on Canada's Section 338 list.",
        ["100% polyester spun fabric", "spun polyester fabric", "acrylic fabric", "polyester poplin", "polyester twill"],
    ),
    "5513": (
        "Woven fabric of less than 85% synthetic staple fiber, mixed mainly with cotton, weighing up to 170 g/m²: light "
        "polyester-cotton shirting, sheeting and poplin. Mostly 14.9%.",
        ["polyester cotton fabric", "poly cotton fabric", "65/35 polyester cotton", "polycotton sheeting", "TC fabric"],
    ),
    "5514": (
        "The same polyester-cotton blends weighing over 170 g/m²: twills, drills and workwear fabric. 14.9% on most lines; "
        "Free on some yarn-dyed and printed lines.",
        ["polyester cotton twill", "poly cotton drill", "workwear fabric", "CVC fabric", "TC twill"],
    ),
    "5515": (
        "Other woven synthetic staple-fiber fabrics: polyester-viscose suiting (5515.11), polyester-wool (5515.13, up to "
        "25%), and blends with filament or other fibers. Türkiye, Italy and Mexico led in 2025.",
        ["polyester viscose fabric", "TR fabric", "polyester wool suiting", "poly rayon fabric", "polyester spandex woven"],
    ),
    "5516": (
        "Woven fabric of artificial staple fiber: spun rayon, viscose, modal and lyocell (Tencel) fabrics and their blends. "
        "Free to 25%; 14.9% for most unbleached and dyed rayon fabric.",
        ["rayon fabric", "viscose fabric", "rayon challis", "lyocell fabric", "tencel fabric", "modal fabric"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Polyester staple fiber from Thailand",
        "line": "5503.20.00.25",
        "body": "Fine-denier polyester staple fiber is 4.3% at the general rate, and Thailand pays the 12.5% Section 301 "
        "tariff (9903.05.77) on top: **$16,800** on a $100,000 shipment. Thailand is not named in any antidumping order on "
        "polyester staple fiber, so no cash deposit is due.",
    },
    {
        "title": "Polyester staple fiber from Korea",
        "line": "5503.20.00.45",
        "body": "The KORUS rate is Free, but Korean goods pay 12.5% in total under Section 301 (9903.05.71): **$12,500** "
        "on $100,000. Fiber of 3.3 decitex or more cut to 1–5 inches from Korea is also under the 2000 antidumping order on certain polyester "
        "staple fiber, so an antidumping cash deposit at the exporter's rate is added (11.35% all-others at the order).",
    },
    {
        "title": "Viscose rayon staple fiber from Austria or China",
        "line": "5504.10.00.00",
        "body": "Viscose staple fiber is 4.3%. EU goods pay 10% in total (9903.05.39): **$10,000** on $100,000. Chinese "
        "viscose fiber pays 4.3% plus 12.5% (9903.05.31) — **$16,800** — because the line's List 4A product exclusion "
        "(9903.88.69) runs through November 9, 2026; most other Chinese Chapter 55 goods also pay 25% under List 3.",
    },
    {
        "title": "Acrylic knitting yarn in skeins from Türkiye",
        "line": "5511.10.00.30",
        "body": "Retail-packed acrylic yarn is 7.5% at the general rate, and Türkiye pays 12.5% Section 301 (9903.05.79) on "
        "top: **$4,000** on a $20,000 shipment. Türkiye has no exception list.",
    },
    {
        "title": "Dyed spun polyester fabric from Canada, with a USMCA claim",
        "line": "5512.19.00.90",
        "body": "USMCA removes the 13.6% base rate and the 10% Section 301 duty (9903.05.93), but 5512.19.00 is on the "
        "Canada Section 338 list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies with a USMCA claim: **$5,000** on "
        "$10,000. Without the claim it is 73.6%.",
    },
    {
        "title": "Polyester-cotton sheeting from China",
        "line": "5513.21.00.40",
        "body": "Dyed polyester-cotton plain weave of 5513.21 is 14.9% and is on no China Section 301 list, so it pays only "
        "the 12.5% 2026 duty (9903.05.31): **$2,740** on $10,000. Unbleached sheeting of 5513.11 is on List 3 and pays "
        "52.4% ($5,240).",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
NAME_FIX = {"Rep. of Korea": "South Korea", "Türkiye": "Türkiye (Turkey)", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan"}
ts["topCountries"] = [
    {"name": NAME_FIX.get(c["country"], c["country"]), "importsUsd": c["importsUsd"]}
    for c in d["understandIndustry"]["byCountry"][:5]
]
ts["biggestLines"] = [
    {"hts": "5503.20", "label": "Polyester staple fiber, not carded or combed"},
    {"hts": "5504.10", "label": "Viscose rayon staple fiber, not carded or combed"},
    {"hts": "5511.10", "label": "Synthetic staple-fiber yarn for retail sale (acrylic knitting yarn)"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line (for example, fiber denier) each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** Headings 5501 and 5502 cover only man-made filament **tow**: parallel filaments of the tow's length, over "
    "2 m long, with less than 5 turns per meter, under 67 decitex per filament and over 20,000 decitex in total; synthetic "
    "tow must also be drawn (stretchable by no more than 100%). Tow of 2 m or less goes to heading 5503 or 5504.\n\n"
    "The Section XI (textiles) notes decide much of Chapter 55: a blend is classified by the fiber that predominates by "
    "weight (note 2), so a 60/40 cotton-polyester fabric is a cotton fabric of chapter 52; yarn is \"put up for retail "
    "sale\" (heading 5511) in small balls, skeins or reels (note 4); sewing thread (5508) is defined by put-up, finish and "
    "twist (note 5); and cut, hemmed or sewn goods leave the chapter as \"made up\" (notes 7–8)."
)
ov["notes"]["additionalUsNotes"] = (
    "**Additional U.S. note 1.** For the woven fabrics of chapter 55, a provision naming one or more weaves covers only "
    "fabrics wholly of that weave or weaves (selvage aside).\n\n"
    "**Statistical notes.** Note 1 defines the fabric types used in the 10-digit lines — poplin or broadcloth, sheeting, "
    "printcloth, cheesecloth, lawns, duck, oxford cloth, blue denim, square construction, napped — and the average yarn "
    "number formula; note 2 defines \"discharge printed\" fabrics. The three-digit numbers in brackets are textile category "
    "numbers used to monitor shipments."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 55 Tariff Updates: Polyester Staple Fiber, Spun Yarn & Staple-Fiber Fabric (2025–2026)"
tu["seo"]["title"] = "Man-Made Staple Fibers Tariff Updates 2026: HTS Chapter 55 — Section 301, PSF Antidumping & Safeguard, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 55 imports since January 2025: unchanged base rates, the end of the IEEPA tariffs and the "
    "Section 122 surcharge, the 2026 Section 301 tariffs, China's List 3, Canada's Section 338 duty, and the polyester "
    "staple fiber antidumping orders and Section 201 safeguard."
)
tu["seo"]["keywords"] = [
    "hts chapter 55 tariff updates",
    "man-made staple fibers tariff",
    "china section 301 textile duties",
    "section 301 tariffs on polyester",
    "fine denier polyester safeguard",
    "polyester staple fiber antidumping",
    "india tariff on man-made staple fibers",
    "thailand tariff on man-made staple fibers",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 399 Chapter 55 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — 50% on Indian goods at their peak — **ended on "
    "February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, "
    "2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; Jordan's exception list covers the whole "
    "chapter. China keeps its 25% List 3 duty, Brazil pays another 25%, and since **August 22, 2026 Canada pays 50%** under "
    "Section 338 on retail yarn and dyed polyester fabric. Polyester staple fiber also stays under **antidumping and "
    "countervailing duty orders** and a **Section 201 safeguard** quota."
)
tu["scope"] = (
    "Measures that reach Chapter 55 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 Lists 3 and 4A and the viscose-fiber exclusion, the Canada Section 338 "
    "duty, the Nicaragua Section 301 phase-in, the Section 201 safeguard on fine denier polyester staple fiber, and the "
    "2025–2026 IEEPA and Section 122 duties that have ended. Antidumping and countervailing duty orders on polyester staple "
    "fiber (5503.20) are explained below but not counted in the rates by country. No Section 232 action covers a Chapter 55 "
    "line."
)
IE = {x["id"]: x for x in tu["inEffect"]}
EXEMPT = {
    "kr-section-301": (
        "South Korea's rate is 12.5% in total in place of the base rate where the base rate is lower (U.S. note 52(k), "
        "9903.05.71), so it replaces the KORUS Free rate on every line; Korea has no exception list. Korean polyester staple "
        "fiber is also under three antidumping orders (fine denier, certain PSF and low melt PSF), and Korea is not excluded "
        "from the fine-denier safeguard quota. " + ENDED,
        "Korean polyester staple fiber — $167.4M in 2025, Korea's main Chapter 55 export — pays 12.5% in total, plus any "
        "antidumping cash deposit for the exporter.",
        ["eo-14389", "fr-2018-15567", "fr-2022-17920", "fr-2018-17691"],
    ),
    "tr-section-301": (
        "Türkiye has no exception list, and no Chapter 55 line is on the general exemption list (note 52(b)). " + ENDED,
        "Turkish retail acrylic yarn pays 20% (7.5% + 12.5%), polyester staple fiber 16.8% and most fabrics 24.5%–27.4%.",
        ["eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list. The 2025 IEEPA duties (25% reciprocal plus 25% over Russian oil purchases) ended in "
        "February 2026. Indian fine denier polyester staple fiber also pays antidumping (21.43% at the order, deposit 14.67% "
        "all-others) and countervailing (24.80% all-others) duties.",
        "Indian polyester staple fiber pays 14.3% (4.3% + 10%) plus AD/CVD on fine denier fiber; Indian spun yarn 17%–23.2% "
        "and most fabrics 22%–24.9%.",
        ["eo-14384", "eo-14389", "fr-2018-15567", "fr-2018-05371"],
    ),
    "th-section-301": (
        "Thailand has no exception list for Chapter 55. Thai polyester staple fiber is not under any antidumping order. "
        + ENDED,
        "Thai polyester staple fiber ($106.8M in 2025) pays 16.8% (4.3% + 12.5%); Thai viscose fiber the same.",
        ["eo-14389"],
    ),
    "eu-section-301": (
        "EU goods pay 10% in total in place of the base rate where the base rate is lower (U.S. note 52(k), 9903.05.39); "
        "where the base rate is 10% or more — most yarn and fabric lines — only the base rate is paid. The EU exception list "
        "(note 52(j)(2), 9903.05.97) names no Chapter 55 code. " + ENDED,
        "German and Austrian viscose staple fiber pays 10% in total; EU yarn and fabric pay the base rate where it "
        "is 10% or more (most fabric, 12%–25%), else 10%.",
        ["eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 55, and Vietnamese polyester staple fiber is not under an antidumping "
        "order. " + ENDED,
        "Vietnamese polyester staple fiber ($105.4M in 2025, up 31% on 2024) pays 16.8% (4.3% + 12.5%).",
        ["eo-14389"],
    ),
    "cn-section-301": (
        "List 3 (+25%, 9903.88.03) covers every Chapter 55 subheading except 5504.10.00 and 5513.21.00. Viscose staple fiber "
        "(5504.10.00.00) is on List 4A (+7.5%, 9903.88.15), but its product exclusion (U.S. note 20(vvv)(iv), 9903.88.69) "
        "lifts that through November 9, 2026; 5513.21.00 is on no list in force. The 2026 action adds +12.5% (9903.05.31) on "
        "every line; China is on no exception list. USTR confirmed on October 7, 2026 that the 2018 actions continue. Chinese "
        "polyester staple fiber is also under antidumping (fine denier, certain PSF) and countervailing (fine denier) orders. "
        "The IEEPA duties on China ended February 24, 2026.",
        "Chinese Chapter 55 goods pay 37.5% on top of the base rate (up to 62.5% in total on wool-blend fabrics); viscose "
        "staple fiber and 5513.21 poly-cotton fabric pay 12.5%. Fine denier polyester fiber adds AD (103% China-wide at the "
        "order) and CVD (42.66% all-others).",
        ["fr-2025-21671", "eo-14389", "fr-2018-15567", "fr-2018-05371", "fr-e7-10607"],
    ),
    "id-section-301": (
        "Indonesia's exception list (U.S. note 52(j)(11), 9903.06.16) names no Chapter 55 code. " + ENDED,
        "Indonesian viscose staple fiber ($42.9M in 2025) pays 14.3% (4.3% + 10%); spun yarn 17%–23.2%.",
        ["eo-14389"],
    ),
    "jp-section-301": (
        "Japan's rate is 12.5% in total in place of the base rate where the base rate is lower (U.S. note 52(k), "
        "9903.05.49); on lines with a base rate of 12.5% or more only the base rate is paid. Japan has no exception list. "
        + ENDED,
        "Japanese acrylic tow and polyester staple fiber pay 12.5% in total; Japanese yarn and fabric the higher of the base rate and 12.5%.",
        ["eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Under USMCA (General Note 11), staple fiber and yarn "
        "must be made from non-cotton, non-filament materials in the region (fiber-forward), and fabric woven from regional "
        "yarn (yarn-forward). Mexico is excluded from the fine-denier safeguard. The 2025 IEEPA duty on Mexico (+25%, "
        "9903.01.01) ended February 24, 2026.",
        "Mexican fabrics and yarn ($64.5M in 2025) pay nothing with a valid USMCA claim; without one, the base rate plus 10%.",
        ["eo-14389"],
    ),
    "tw-section-301": (
        "Taiwan's rate is 10% in total in place of the base rate where the base rate is lower (U.S. note 52(k), 9903.05.76); "
        "its exception list (note 52(j)(10), 9903.06.14) names no Chapter 55 code. Taiwanese polyester staple fiber is under "
        "antidumping orders (fine denier, certain PSF, low melt PSF). " + ENDED,
        "Taiwanese polyester staple fiber pays 10% in total plus any antidumping cash deposit; Taiwanese yarn and fabric the "
        "higher of the base rate and 10%.",
        ["eo-14389", "fr-2018-15567", "fr-2022-17920", "fr-2018-17691"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on retail yarn of 85% or more synthetic staple fiber (5511.10.00) and dyed, printed or yarn-dyed fabric of 85% or "
        "more polyester staple fiber (5512.19.00) applies with or without a USMCA claim. No Chapter 55 line is on the "
        "September 29, 2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian spun yarn and most fabrics pay nothing extra with USMCA; Canadian retail yarn and dyed polyester fabric pay "
        "50% (67.5% or 73.6% without a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "pk-section-301": (
        "Pakistan has no exception list. " + ENDED,
        "Pakistani poly-cotton fabric and spun yarn pay the base rate plus 10%: 22%–24.9% on most fabrics.",
        ["eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 55 code. " + ENDED,
        "British viscose fiber pays 14.3%; British fabrics the base rate plus 10%.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 55 line; its exemption list (U.S. note "
        "50(a)(ii), 9903.05.03) names no Chapter 55 code. The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties "
        "(10% reciprocal and 40%) ended February 24, 2026.",
        "Brazilian goods pay 37.5% on top of the base rate; imports were only $148,831 in 2025.",
        ["eo-14323", "eo-14389"],
    ),
    "hn-section-301": (
        "Honduran textile goods entered free of duty under CAFTA-DR (SPI \"P\") pay no Section 301 duty (U.S. note 52(i), "
        "9903.05.95). The exemption needs a duty-free CAFTA-DR entry, so the 32 lines that are already Free at the general "
        "rate and print no CAFTA-DR rate — including fiber waste (5505) — pay the 10% (9903.05.42). Honduras is excluded "
        "from the fine-denier PSF safeguard. " + ENDED,
        "Honduran polyester staple fiber ($3.9M of Honduras's $6.0M in 2025) enters Free with a CAFTA-DR claim; man-made "
        "fiber waste ($1.5M) pays 10%. Without the claim, every line pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "other-section-301": (
        "Jordan's exception list (U.S. note 52(j)(13), 9903.06.20) covers every Chapter 55 subheading. Guatemala and El "
        "Salvador's lists exempt every Chapter 55 subheading when CAFTA-DR is claimed (9903.06.06, 9903.06.09), and note "
        "52(i) (9903.05.95) exempts textile goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras "
        "and Nicaragua entered duty-free under CAFTA-DR. Other lists (Malaysia, Cambodia, Bangladesh, Argentina, Ecuador) "
        "name no Chapter 55 code. " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian goods and duty-free CAFTA-DR textiles pay no "
        "Section 301 duty.",
        ["eo-14389"],
    ),
}
for k, (ex, wim, extra) in EXEMPT.items():
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
IE["other-section-301"]["country"] = (
    "Other Section 301 economies (43 more, including Bangladesh, Cambodia, Malaysia, Jordan and the other CAFTA-DR countries)"
)
tu["inEffect"].append(
    {
        "id": "safeguard-fine-denier-psf",
        "country": "All countries except Canada, Mexico, FTA partners named in U.S. note 32(b) and developing countries",
        "measure": "Section 201 safeguard: quota on fine denier polyester staple fiber entered under bond",
        "ch99Code": "9903.55.01",
        "before": "No limit on temporary-importation-under-bond entries",
        "now": "Quota of 453,592 kg (November 23, 2025 – November 22, 2026)",
        "exemption": "Applies only to fine denier PSF (under 3.3 decitex, 5503.20.00.25) admitted free under a temporary "
        "importation bond (9813.00.05.20); ordinary entries for consumption are not limited and pay the normal duties. Excluded "
        "(U.S. note 32(b)): Canada, Mexico, Australia, the CAFTA-DR countries, Colombia, Israel, Panama, Peru, Singapore, the "
        "listed developing countries (including Jordan and Pakistan) and CBERA beneficiaries. Korea is not excluded.",
        "whatItMeans": "Duty-free bonded imports of fine denier PSF from China, India, Korea, Taiwan, Thailand, Vietnam and "
        "other non-excluded countries are capped: 0 kg in the first year, 453,592 kg now, rising to 907,185 kg from November "
        "23, 2026 and 1,360,777 kg in the last year, through November 22, 2028.",
        "effectiveFrom": "2025-11-23",
        "effectiveSourceId": "procl-10857",
        "sourceIds": ["procl-10857", "hts-chapter-99", "hts-now"],
    }
)
add_sources(tu, [s for v in EXEMPT.values() for s in v[2]] + ["procl-10857"])

# Change log: keep generated base-rate entry, rewrite the rest newest first.
gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 55 base-rate changes"
base["detail"] = (
    "All 399 Chapter 55 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
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
       "review. For Chapter 55 this keeps +25% (9903.88.03) on every subheading except 5504.10.00 and 5513.21.00.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 55",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 55 line is on their annexes, so Canadian retail yarn and dyed polyester fabric "
       "keep paying the 50% Section 338 duty.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; 5511.10 and 5512.19 stay on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. Neither Chapter 55 "
       "subheading (5511.10.00, 5512.19.00) was removed, and none was added; Revision 21 still lists both in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on retail yarn and dyed polyester fabric",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which include "
       "retail-packed yarn of 85% or more synthetic staple fiber (5511.10.00) and dyed, printed or yarn-dyed fabric of 85% "
       "or more polyester staple fiber (5512.19.00) — 13 statistical lines. It is charged even when USMCA is claimed and on "
       "top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 after a 3-day "
       "suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 55 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); no Chapter 55 subheading is on the general "
       "exemption list (note 52(b)). EU and Taiwanese goods pay 10% in total and Japanese and Korean goods 12.5% in total "
       "where the base rate is lower. Jordan's exception list covers the chapter, Guatemala's and El Salvador's cover it "
       "with a CAFTA-DR claim, and CAFTA-DR textile goods entered duty-free are exempt (note 52(i)); USMCA-qualifying goods "
       "are exempt (9903.05.93, 9903.05.94). Other FTA claims remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 55 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance for importers",
       "CBP's operational guidance lists supply-chain tracing documents for the UFLPA high-priority sectors, including cotton "
       "and cotton products and apparel. Polyester-cotton yarn and fabric fall under the cotton tracing guidance, and the "
       "UFLPA presumption applies to goods of any kind made wholly or in part in Xinjiang or by a listed entity.",
       None, None, "China", ["cbp-fl-guidance", "pl-117-78"]),
    ch("safeguard-monitoring", "reference", "2026-05-22", "Instituted", "USITC starts mid-term review of the fine-denier PSF safeguard",
       "The USITC instituted its monitoring investigation (TA-201-78) of the domestic fine denier polyester staple fiber "
       "industry; its report to the President and Congress is due by November 23, 2026, the mid-point of the safeguard. The "
       "safeguard can be reduced, modified or ended after that report.",
       None, None, "All", ["fr-2026-10545", "procl-10857"]),
    ch("low-melt-review", "reference", "2026-04-17", "Published", "Low melt PSF from Korea: review rate set at 3.02%",
       "Commerce's final results of the 2023–2024 antidumping review of low melt polyester staple fiber from Korea "
       "(5503.20.00.15) set a 3.02% margin for Toray Advanced Materials Korea. The order on Taiwan (49.93% at the order) "
       "also continues.",
       None, "3.02% (TAK)", "South Korea", ["fr-2026-07505", "fr-2018-17691"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 55 subheading was on the product "
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
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 55 line; CAFTA-DR originating "
       "fabric and yarn are not affected.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("safeguard-year2", "reference", "2025-11-23", "Effective", "Fine-denier PSF safeguard: second-year quota opens",
       "The quota on fine denier polyester staple fiber entered under a temporary importation bond (9903.55.01, U.S. note "
       "32) rose from 0 kg to 453,592 kg for November 23, 2025 – November 22, 2026. It rises to 907,185 kg on November 23, "
       "2026.",
       "0 kg", "453,592 kg", "All except excluded countries", ["procl-10857", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 55 "
       "line on top of the Section 301 duties until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian fiber, yarn and fabric. Ended "
       "February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates: India +25%, Taiwan and Vietnam +20%, Indonesia, "
       "Pakistan and Thailand +19%, South Korea and Türkiye +15%, and 15% in total for EU goods (Japan from September). "
       "Ended February 24, 2026.",
       "+10%", "+15% to +25% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 55 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the Section 301 duties.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
       "February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
    ch("safeguard", "reference", "2024-11-23", "Effective", "Section 201 safeguard on fine denier polyester staple fiber",
       "Proclamation 10857 (signed November 8, 2024) set a four-year quota on fine denier PSF (under 3.3 decitex) admitted "
       "free under a temporary importation bond (9813.00.05.20), starting at 0 kg. The USITC found increased imports a "
       "substantial cause of serious injury; the proclamation targets bonded entries, which it said undermined the existing "
       "antidumping and countervailing duty orders. Ordinary consumption entries are not limited. Korea is covered; Canada, Mexico, most FTA partners and "
       "developing countries are excluded.",
       None, "Quota: 0 kg in year 1", "All except excluded countries", ["procl-10857", "hts-chapter-99"]),
    ch("fdpsf-continued", "reference", "2024-04-05", "Effective", "Fine denier PSF antidumping and countervailing orders continued",
       "After the first five-year (sunset) reviews, Commerce continued the antidumping orders on fine denier polyester staple "
       "fiber from China, India, Korea and Taiwan and the countervailing duty orders on China and India (5503.20.00.25). "
       "Order rates: China-wide AD 103.06%, India 21.43%, Korea 45.23% (30.15% all-others), Taiwan 48.86% (24.43% "
       "all-others); CVD China 42.66% and India 24.80% all-others.",
       None, None, "China, India, South Korea, Taiwan", ["fr-2024-07692", "fr-2018-15567", "fr-2018-05371"]),
]
tu["changes"] = changes
add_sources(tu, [s for c in changes for s in c["sourceIds"]] + ADCVD_IDS)
for st in tu["stats"]:
    if st["label"] == "Extra duties in effect":
        st["value"] = str(len(tu["inEffect"]))
        st["note"] = f"{len(tu['inEffect']) - 1} Section 301 / 338 measures by country, plus the Section 201 safeguard quota"
tu["stats"].append({"label": "AD/CVD orders on polyester staple fiber", "value": "11",
                    "note": "China, India, South Korea, Taiwan (5503.20) — not counted in the rates by country"})

# ---------------------------------------------------------------- understandIndustry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 55: Man-Made Staple Fibers — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "Man-Made Staple Fiber Imports to the U.S. by Country: Korea, Türkiye, India, Thailand — HTS Chapter 55 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of man-made staple fibers 2020–2025 by country, product and year: $1.56B in 2025, down 10%. Korea, "
    "Türkiye, India and Thailand led; polyester staple fiber (5503.20) was 32% and viscose staple fiber 14%."
)
ui["seo"]["keywords"] = [
    "man-made staple fiber imports by country",
    "polyester staple fiber imports",
    "us imports of polyester staple fiber",
    "viscose staple fiber imports",
    "hts 5503.20 imports",
    "china tariff on man-made staple fibers",
    "polyester fiber import",
]
# Generator quirk: heading labels cut with "…" in byCountry and byLine search text.
for row in ui["byCountry"]:
    if row.get("mainHeading") in LABELS:
        row["mainHeadingLabel"] = LABELS[row["mainHeading"]][0]
for row in ui["byLine"]:
    st = row.get("searchText") or ""
    if st.endswith("…") and row.get("heading") in LABELS:
        row["searchText"] = (st[: st.find(row["description"].lower()) + len(row["description"])]
                             + " " + LABELS[row["heading"]][0].lower())
ui["byYearPartners"] = ["Rep. of Korea", "Türkiye"]
ui["byYearCaption"] = (
    "U.S. imports of Chapter 55 goods each year, split into the two largest 2025 suppliers (South Korea and Türkiye) and "
    "everyone else."
)
ui["why"] = (
    "U.S. imports of Chapter 55 goods were **$1.56B in 2025**, down 10% from $1.73B in 2024 and well below the 2022 peak of "
    "$2.14B. No supplier dominates: **South Korea $177.5M** (11%), **Türkiye $156.3M** (10%), **India $149.7M** (-27%), "
    "**Thailand $135.4M**, **Germany $110.3M** and **Vietnam $108.5M** (+31%, the only large supplier that grew). China fell "
    "32% to $96.3M.\n\n"
    "Fiber is the trade: staple fiber not yet spun (5503–5504) was 62% of the total. **Polyester staple fiber** (5503.20) "
    "was $491.6M (32%, down 15%) — Korea, Thailand and Vietnam were the largest suppliers of heading 5503 — and **viscose "
    "staple fiber** (5504.10) $213.1M; Germany, Indonesia and Austria shipped 63% of heading 5504. Retail-packed acrylic yarn (5511.10, $123.1M) came mainly from "
    "Türkiye; spun yarn (5509) was $120.1M and woven fabrics (5512–5516) $247.7M.\n\n"
    "Through 2025 most suppliers paid the IEEPA tariffs — 50% on Indian goods from August 27 — on top of the base rate, "
    "Chinese goods the Section 301 duties as well, and polyester staple fiber from China, India, Korea and Taiwan its "
    "antidumping deposits. The IEEPA duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of 10% or "
    "12.5% applies instead. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. Country names follow Comtrade (\"Rep. of Korea\" is South Korea, \"Other Asia, nes\" is Taiwan)."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 55 Tariff Rates by Country: Korea, Türkiye, India, Thailand, China & More"
ia["seo"]["title"] = "Man-Made Staple Fiber Import Duty by Country 2026: Korea, Türkiye, India, Thailand, Vietnam, China — HTS Chapter 55 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on polyester and viscose staple fiber, spun yarn and staple-fiber fabric by country: base rate plus "
    "the 2026 Section 301 duty, China's List 3, Brazil's 25% and Canada's 50% Section 338 duty, with USMCA applied."
)
ia["seo"]["keywords"] = [
    "man-made staple fibers tariff rates by country",
    "us tariffs on man-made staple fibers",
    "polyester staple fibers import duty",
    "section 301 tariffs on polyester",
    "vietnam textile import tariffs",
    "korea polyester staple fiber tariff",
    "turkey acrylic yarn tariff",
    "usmca yarn-forward rules",
]
ia["intro"] = (
    "The total rate on Chapter 55 goods depends on **where they come from** as much as on what they are. Each cell below is "
    "the base rate for that product group plus the extra duty for that country, minus any preference — computed from the "
    "current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026). **Japan pays 12.5% in total** and **the EU and Taiwan 10% in total** where the base rate is lower — "
    "so their fiber pays 10%–12.5% and most of their fabric just the base rate — **Korea 12.5%** on every line, while **Türkiye, Thailand and "
    "Vietnam pay 12.5%** and **India, Indonesia and Pakistan 10%** on top. **China and Brazil pay 37.5% more** on nearly "
    "every line, **Canada pays 50%** on retail yarn and dyed polyester fabric even with USMCA, and **Honduran and other "
    "CAFTA-DR textiles** entered duty-free under CAFTA-DR pay nothing extra. Antidumping and "
    "countervailing duties on polyester staple fiber come on top and are not in the grid."
)
EU_RULE = ("EU: 10% in total in place of the base rate where it is lower (9903.05.39) — 10% on fiber and on yarn below 10%; "
           "yarn and fabric with a base rate of 10% or more pay only the base rate. The EU exception list names no Chapter "
           "55 code; the 15% IEEPA rate ended February 24, 2026.")
RULES = {
    "South Korea": "12.5% in total in place of the base rate where it is lower (9903.05.71), KORUS claim or not: 12.5% on "
    "every line. Polyester staple fiber also owes antidumping cash deposits (not shown).",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list. The 15% IEEPA rate "
    "ended February 24, 2026.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. Fine denier polyester staple fiber "
    "also owes AD and CVD deposits (not shown); the IEEPA duties (up to 50%) ended in February 2026.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on every line; no exception list. The 19% IEEPA rate ended "
    "February 24, 2026.",
    "Germany": EU_RULE,
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list. The 20% IEEPA rate ended "
    "February 24, 2026.",
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31): 37.5% extra on every line except viscose staple "
    "fiber (5504.10, List 4A excluded through November 9, 2026) and 5513.21 poly-cotton fabric, which pay 12.5%. Polyester "
    "staple fiber also owes AD/CVD deposits (not shown).",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on every line; Indonesia's exception list names no Chapter 55 "
    "code. The 19% IEEPA rate ended February 24, 2026.",
    "Japan": "12.5% in total in place of the base rate where it is lower (9903.05.49); lines with a base rate of 12.5% or "
    "more pay only the base rate. No exception list.",
    "Mexico": "USMCA-qualifying: base rate only (9903.05.94), and the base rate is Free under USMCA. Otherwise the base rate "
    "plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Taiwan": "10% in total in place of the base rate where it is lower (9903.05.76) — 10% on fiber; fabric with a base rate "
    "of 10% or more pays only the base rate. Polyester staple fiber also owes antidumping deposits (not shown).",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on retail yarn (5511.10) "
    "and dyed polyester fabric (5512.19) even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on "
    "those two.",
    "Austria": EU_RULE,
    "Italy": EU_RULE,
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62) on every line; no exception list. The 19% IEEPA rate ended "
    "February 24, 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 55 code.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 37.5% extra.",
    "Honduras": "CAFTA-DR claim (P): Free and no Section 301 duty on textile goods entered duty-free (U.S. note 52(i), "
    "9903.05.95). Lines already Free at the general rate have no CAFTA-DR rate to claim, so they pay 10% (9903.05.42) — "
    "fiber waste (5505) and some fiber and fabric lines. Without the claim: base rate plus 10% on every line.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate "
    "plus 12.5% (9903.05.20–9903.05.84). Other EU members (Spain, France, the "
    "Netherlands, Belgium) pay as Germany. Jordanian goods are exempt (exception list), and CAFTA-DR textiles entered "
    "duty-free pay no Section 301 duty. Myanmar has no ISO mapping in the trade data and is counted here.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    extra = ["eo-14389"] if c["country"] != "Any other country" else []
    if c["country"] in ("South Korea",):
        extra += ["fr-2018-15567", "fr-2022-17920", "fr-2018-17691"]
    if c["country"] == "India":
        extra += ["eo-14384", "fr-2018-15567", "fr-2018-05371"]
    if c["country"] == "China":
        extra += ["fr-2025-21671", "fr-2018-15567", "fr-2018-05371", "fr-e7-10607"]
    if c["country"] == "Taiwan":
        extra += ["fr-2018-15567", "fr-2022-17920", "fr-2018-17691"]
    if c["country"] == "Brazil":
        extra += ["eo-14323"]
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU, Taiwanese, Japanese and Korean rates of \"10% / 12.5% in total\" replace the base rate only when it is lower (U.S. "
    "note 52(k)); Chapter 55 yarn and fabric often have higher base rates, so those cells show the base rate.",
    "Not in the grid: antidumping and countervailing duties on polyester staple fiber (5503.20) from China, India, Korea and "
    "Taiwan, which are company-specific cash deposits (see Tariff updates); and the Section 201 quota on fine denier PSF "
    "entered under a temporary importation bond.",
    "China's viscose-fiber exclusion (5504.10.00.00, through November 9, 2026) is applied; it covers the whole statistical "
    "line. Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed.",
    "CAFTA-DR: the Honduras row claims CAFTA-DR (P), and textile goods entered duty-free under it pay no Section 301 duty "
    "(note 52(i), 9903.05.95; every Chapter 55 line is a textile good). Lines Free at the general rate print no CAFTA-DR "
    "rate, so the 10% still applies there. Other CAFTA-DR countries (Guatemala $2.3M, El Salvador $2.1M in 2025) are "
    "treated the same; Jordanian goods are exempt through the exception list.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 32, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86) names no Chapter 55 code. Note 52(j) country lists name Chapter 55 codes only for Jordan (all subheadings, "
    "9903.06.20) and, for CAFTA-DR claims, Guatemala and El Salvador (all subheadings, 9903.06.06, 9903.06.09); the EU, UK, "
    "Swiss, Taiwanese, Indonesian, Malaysian, Cambodian and other lists name none. Note 52(i) (9903.05.95) exempts duty-free "
    "CAFTA-DR textile goods. Note 50(a)(ii) names no Chapter 55 code for Brazil. Note 51(b)(3) puts 5511.10.00 and "
    "5512.19.00 on the Canada Section 338 list. Note 20 puts every Chapter 55 subheading except 5504.10.00 and 5513.21.00 on "
    "China List 3 and 5504.10.00 on List 4A, excluded through November 9, 2026 (note 20(vvv)(iv)); no List 3 exclusion in "
    "force names a Chapter 55 line. Note 30 (Russia) names no Chapter 55 code; Russian goods pay Column 2 rates. Note 32 "
    "sets the fine denier PSF safeguard quota (9903.55.01). No Section 232 heading reaches Chapter 55 except through the "
    "opt-in certified auto-parts election, which is not applied."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Man-Made Staple Fibers, Yarn & Fabric (HTS Ch. 55): Origin Rules, AD/CVD, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Polyester Staple Fiber, Spun Yarn & Fabric: Origin Rules, AD/CVD, Safeguard & Ways to Lower Duty (HTS Chapter 55) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, Commerce and FTC rules for each HTS Chapter 55 line — textile country of origin (19 CFR 102.21), manufacturer "
    "ID, invoices and labeling, polyester staple fiber AD/CVD orders and the Section 201 TIB quota — and the legal ways to "
    "pay less: USMCA, CAFTA-DR, exception lists, the China viscose exclusion, TIB, samples and drawback."
)
te["seo"]["keywords"] = [
    "man-made fiber country of origin",
    "19 CFR 102.21 yarn fabric",
    "fine denier polyester import duty",
    "section 201 safeguard polyester",
    "polyester staple fiber antidumping scope",
    "temporary importation under bond textiles",
    "usmca yarn-forward rules",
    "hts chapter 55 tariff engineering",
]
te["intro"] = (
    "Man-made fibers are textiles, so **CBP's textile rules decide where they come from**: tow and staple fiber are from where "
    "the polymer was extruded (cutting tow into staple does not change origin), yarn from where it was spun, and fabric from "
    "where it was woven — dyeing or printing alone does not move origin (19 CFR 102.21). Every entry names the manufacturer "
    "through a manufacturer identification code, and polyester staple fiber must be checked against **eleven antidumping and "
    "countervailing duty orders**.\n\n"
    "The ways to pay less are in the schedule: claim **USMCA** or **CAFTA-DR** on regional fiber, yarn and fabric, source "
    "from **Jordan** (exception list) or a supplier outside the AD/CVD orders, claim China's **viscose-fiber exclusion**, "
    "enter goods for processing and re-export under a **temporary importation bond**, enter **samples** under Chapter 98, "
    "and claim **drawback** on re-exports. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on fiber, yarn or fabric made in Mexico or Canada",
        "saves": "The base rate (up to 25%) plus the 10% Section 301 duty for Mexico or Canada",
        "appliesTo": "All 399 lines, for originating goods: staple fiber and yarn made from non-cotton, non-filament inputs in "
        "the region (fiber-forward), fabric woven from regional yarn (yarn-forward) — General Note 11, Chapter 55 rules",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" on "
        "the entry line.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on retail yarn (5511.10) and dyed polyester fabric "
        "(5512.19). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 55 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
        ],
    },
    {
        "id": "cafta-dr",
        "title": "Claim CAFTA-DR on yarn and fabric from Central America or the Dominican Republic",
        "saves": "The base rate and the whole 10%–12.5% Section 301 duty",
        "appliesTo": "All lines, for originating goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras "
        "and Nicaragua entered duty-free under CAFTA-DR (U.S. note 52(i), 9903.05.95; Guatemala and El Salvador also 52(j))",
        "document": "A CAFTA-DR claim (SPI \"P\") supported by origin records; textile goods follow the yarn-forward rules of "
        "General Note 29.",
        "caveat": "Non-originating goods pay the Section 301 duty, and so do lines already Free at the general rate (no "
        "CAFTA-DR rate to claim, e.g. fiber waste of 5505). From January 1, 2027 non-CAFTA Nicaraguan goods pay a "
        "further 10% (9903.89.01).",
        "citations": [
            {"label": "19 CFR 10.583 (CAFTA-DR claim)", "url": ecfr(19, "10.583")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
            {"label": "HTSUS General Note 29", "url": GN},
        ],
    },
    {
        "id": "exception-lists",
        "title": "Source from Jordan, whose exception list covers the chapter",
        "saves": "The whole 10% Section 301 duty, and the base rate with a JO claim",
        "appliesTo": "Every Chapter 55 subheading of Jordanian origin (U.S. note 52(j)(13), 9903.06.20)",
        "document": "Proof of Jordanian origin (manufacturer ID, production records) and the exemption heading on the entry line; "
        "the U.S.–Jordan FTA (SPI \"JO\") for the Free base rate.",
        "caveat": "Origin follows 19 CFR 102.21: fabric is from where it was woven and yarn from where it was spun, so "
        "finishing imported fabric in Jordan does not make it Jordanian.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)(13)", "url": CH99},
            {"label": "19 CFR 102.21 (textile origin)", "url": ecfr(19, "102.21")},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA rate where the base rate is the cost",
        "saves": "The base rate: up to 14.9% on most fabrics, 7%–13.2% on yarn, 4.3% on staple fiber",
        "appliesTo": "All dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Morocco, Bahrain, "
        "Oman and Singapore",
        "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, MA, BH, OM, SG).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)); Korea pays 12.5% in total whatever the "
        "KORUS rate. GSP does not cover these textiles, and AGOA and Haiti HOPE/HELP benefits cover apparel, not staple fiber, "
        "yarn or fabric.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "china-exclusion",
        "title": "Report the China List 4A exclusion on viscose staple fiber",
        "saves": "The 7.5% List 4A duty (the 12.5% 2026 duty still applies)",
        "appliesTo": "Chinese viscose rayon staple fiber, not carded or combed (5504.10.00.00), entered by November 9, 2026",
        "document": "Heading 9903.88.69 reported with 5504.10.00.00 on the entry line.",
        "caveat": "The exclusion ends after November 9, 2026 unless USTR extends it again; other cellulosic fiber (5504.90) pays "
        "List 3's 25%.",
        "citations": [
            {"label": "HTSUS U.S. note 20(vvv)(iv), heading 9903.88.69", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended to November 9, 2026)", "url": src("fr-2025-21671")["url"]},
        ],
    },
    {
        "id": "adcvd-source",
        "title": "Check the AD/CVD scope before buying polyester staple fiber",
        "saves": "Antidumping and countervailing cash deposits — up to 103% AD and 42.66% CVD on Chinese fine denier PSF",
        "appliesTo": "5503.20 polyester staple fiber: fine denier under 3.3 decitex (China, India, Korea, Taiwan), 3.3 decitex "
        "or more (China, Korea, Taiwan) and low-melt bi-component fiber (Korea, Taiwan)",
        "document": "Mill certificates showing denier, cut length and construction, and the producer and exporter names; a "
        "Commerce scope ruling (19 CFR 351.225) where coverage is unclear.",
        "caveat": "Origin of staple fiber is where it was extruded, so fiber cut or baled elsewhere from Chinese tow is still "
        "Chinese. Excluded from the PSF orders: 10–18 denier fiber cut to 6–8 inches for carpet, and low-melt fiber (under "
        "its own order). Rates are company-specific and change after each review.",
        "citations": [
            {"label": "19 CFR 351.225 (scope rulings)", "url": ecfr(19, "351.225")},
            {"label": "83 FR 34545 (fine denier PSF AD orders)", "url": src("fr-2018-15567")["url"]},
            {"label": "87 FR 51055 (PSF Korea, Taiwan continued)", "url": src("fr-2022-17920")["url"]},
            {"label": "88 FR 60641 (PSF China continued)", "url": src("fr-2023-19041")["url"]},
        ],
    },
    {
        "id": "tib",
        "title": "Enter fiber, yarn or fabric for processing and re-export under a temporary importation bond",
        "saves": "All duty, including the Section 301, China and Canada duties, on goods exported within the bond period",
        "appliesTo": "Goods to be processed in the United States and then exported (9813.00.05)",
        "document": "A TIB entry with a bond for twice the estimated duties; export within one year (extendable to three).",
        "caveat": "Fine denier PSF (5503.20.00.25) entered under bond counts against the Section 201 quota (453,592 kg until "
        "November 22, 2026) unless it is from an excluded country. Goods not exported in time owe liquidated "
        "damages under the bond.",
        "provisions": [
            {"code": "9813.00.05", "rate": "Free, under bond", "text": "Articles to be repaired, altered or processed (including processes which result in articles manufactured or produced in the United States)"}
        ],
        "citations": [
            {"label": "19 CFR 10.31", "url": ecfr(19, "10.31")},
            {"label": "HTSUS 9813.00.05; Ch. 99 U.S. note 32", "url": CH98},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding classification ruling where fiber content or weight decides the rate",
        "saves": "Up to 25 points of base rate, and certainty on the China and Canada lists: staple vs. filament (chapter 55 vs. "
        "54); polyester vs. cotton predominance (chapter 55 vs. 52); 85% thresholds (5512 vs. 5513–5515); 170 g/m² (5513 vs. "
        "5514); wool content of 36% or more (25%)",
        "appliesTo": "Any line where fiber content, weight, put-up or construction is in doubt — especially blends",
        "document": "A ruling request to CBP describing fiber content by weight, weight per m², weave, yarn type and finish (19 CFR "
        "part 177); invoices must state the same details (19 CFR 141.89).",
        "caveat": "Rulings apply to the transaction described; a different blend or construction may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Section XI and Chapter 55 notes", "url": CH55},
        ],
    },
    {
        "id": "samples",
        "title": "Enter swatches and fiber samples as samples",
        "saves": "All duty — base rate and the Section 301, China and Canada duties",
        "appliesTo": "Fabric swatches, yarn and fiber samples valued at $1 or less each, or marked, torn or perforated so they "
        "cannot be sold, used only to solicit orders",
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
        "title": "Claim drawback when the fiber, yarn or fabric is exported or used in exported goods",
        "saves": "Up to 99% of the duties paid, including Section 301 duties",
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
        "title": "Textile country of origin: tow from where it was extruded; staple fiber (5503–5507) by a change from another "
        "chapter other than chapter 54, so where the polymer was extruded; waste from where it was garnetted; yarn and thread "
        "from where they were spun; fabric from where it was woven, or where greige fabric was dyed and printed with two "
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
        "title": "Invoice details: fiber content by weight; for yarn, single or plied, retail put-up, sewing thread or not, and "
        "filament or spun; for fabric, weave, weight per m² and finish",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Yarns; Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Fiber Products Identification Act: fibers, yarns and fabrics sold onward must show generic fiber "
        "names and percentages (\"65% polyester, 35% cotton\") and the country where processed or made",
        "citations": [
            {"label": "16 CFR 303.45(a)(17)", "url": ecfr(16, "303.45")},
            {"label": "16 CFR 303.33", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made with "
        "forced labor and excluded unless the importer rebuts it; polyester-cotton yarn and fabric fall under the cotton "
        "tracing guidance",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
        ],
    },
    {
        "id": "adcvd",
        "agency": "Commerce (ITA) / CBP",
        "title": "Antidumping and countervailing duty orders on polyester staple fiber (5503.20): fine denier PSF from China, "
        "India, Korea and Taiwan (AD) and China and India (CVD); certain PSF of 3.3 decitex or more from China, Korea and "
        "Taiwan (AD); low melt PSF from Korea and Taiwan (AD). CBP collects cash deposits at the rate in effect at entry",
        "citations": [
            {"label": "19 CFR 351.211 (AD and CVD orders)", "url": ecfr(19, "351.211")},
            {"label": "89 FR 25563 (fine denier orders continued)", "url": src("fr-2024-07692")["url"]},
            {"label": "88 FR 88573 (low melt orders continued)", "url": src("fr-2023-28266")["url"]},
        ],
    },
    {
        "id": "tib-safeguard",
        "agency": "CBP",
        "title": "Section 201 safeguard: fine denier PSF admitted under a temporary importation bond (9813.00.05.20) is limited "
        "to the quota in U.S. note 32 (453,592 kg for November 23, 2025 – November 22, 2026) unless from an excluded country",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 32; 9903.55.01", "url": CH99},
            {"label": "89 FR 89909 (Proclamation 10857)", "url": src("procl-10857")["url"]},
            {"label": "19 CFR 10.31 (TIB entry and bond)", "url": ecfr(19, "10.31")},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or, for bulk fiber, yarn and piece goods, on its container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
BASE_RULES = ["textile-origin", "textile-mid", "cita-transship", "invoice", "ftc-labeling", "uflpa", "cbp-marking"]
GROUP_NOTES = {
    "5501": "Tow takes the origin of the country where the filaments were extruded. Tow over 2 m with the chapter note 1 "
    "specifications; shorter tow is staple fiber of 5503 or 5504.",
    "5502": "Origin is where the cellulosic filaments were extruded. Acetate tow for cigarette filters is classified here.",
    "5503": "Staple fiber keeps the origin of the extrusion country — cutting tow (5501) into staple is no change of chapter. "
    "Polyester staple fiber (5503.20) is under eleven AD/CVD orders and, for fine denier entered under bond, the safeguard quota.",
    "5504": "Origin is where the viscose or lyocell fiber was extruded. Chinese viscose staple fiber (5504.10.00.00) can claim "
    "the List 4A exclusion through November 9, 2026.",
    "5505": "Waste takes the origin of the garnetting country, or else the origin of the goods before they became waste.",
    "5506": "Carding or combing does not change origin (no change of chapter); the fiber keeps its extrusion origin.",
    "5507": "Carding or combing does not change origin; the fiber keeps its extrusion origin.",
    "5508": "Sewing thread takes the origin of the country where it was spun. Invoices must say it is sewing thread (19 CFR "
    "141.89).",
    "5509": "Yarn takes the origin of the country where it was spun. Invoices give fiber content, ply and whether spun or "
    "filament.",
    "5510": "Yarn takes the origin of the country where it was spun; rates split by blend and ply.",
    "5511": "Retail put-ups (Section XI note 4). 5511.10 is on Canada's Section 338 list. Fiber-content labels apply to yarn "
    "sold to consumers.",
    "5512": "Fabric takes the origin of the country where it was woven; dyeing and printing alone do not change it. Dyed "
    "5512.19 fabric is on Canada's Section 338 list.",
    "5513": "Woven origin. Polyester must predominate by weight, else the fabric is cotton (chapter 52). 5513.21 is on no "
    "China Section 301 list.",
    "5514": "Woven origin; over 170 g/m². Poly-cotton blends fall under CBP's cotton supply-chain guidance for the UFLPA.",
    "5515": "Woven origin. Blends with 36% or more wool pay up to 25%; a ruling settles the fiber split.",
    "5516": "Woven origin. Spun rayon and lyocell fabrics; filament rayon fabric is chapter 54 (5408).",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    rules = list(BASE_RULES)
    if g["heading"] == "5503":
        rules = rules[:6] + ["adcvd", "tib-safeguard", "cbp-marking"]
    g["ruleIds"] = rules
    g["note"] = GROUP_NOTES[g["heading"]]
FREE_LINES = set()
for r in d["overview"]["rateTable"]["rows"]:
    if r.get("htsCode10") and r.get("effectiveGeneral") == "Free":
        FREE_LINES.add(r["hts"])
for ln in te["lines"]:
    h = ln["hts"]
    rules = list(BASE_RULES)
    if h.startswith("5503.20"):
        rules = rules[:6] + ["adcvd"] + (["tib-safeguard"] if h == "5503.20.00.25" else []) + ["cbp-marking"]
    ln["ruleIds"] = rules
    lev = ["usmca", "cafta-dr", "exception-lists"]
    if h not in FREE_LINES:
        lev.append("fta")
    if h == "5504.10.00.00":
        lev.append("china-exclusion")
    if h.startswith("5503.20"):
        lev.append("adcvd-source")
    lev += ["tib", "ruling", "samples", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China "
    "exclusions, the Canada Section 338 list and AD/CVD cash deposit rates change by proclamation, USTR notice and Commerce "
    "review; check them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 55 FAQ: Polyester Staple Fiber, Spun Yarn & Staple-Fiber Fabric HS Codes and Tariffs"
fc["seo"]["title"] = "Polyester Staple Fiber HS Code & Tariff FAQ 2026: Viscose Fiber, Spun Yarn, Poly-Cotton & Rayon Fabric (HTS Chapter 55) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about man-made staple fibers: the HS code for polyester and viscose staple fiber, spun "
    "polyester yarn, sewing thread, poly-cotton and rayon fabric, the antidumping duty on Chinese polyester staple fiber and "
    "the fine denier PSF safeguard."
)
fc["seo"]["keywords"] = [
    "polyester staple fiber hs code",
    "viscose staple fiber hs code",
    "spun polyester yarn hs code",
    "polyester sewing thread hs code",
    "polyester cotton fabric hs code",
    "viscose fabric hs code",
    "rayon fabric hs code",
    "hs code 5512",
    "anti dumping duty on polyester staple fiber from china",
    "fine denier polyester staple fiber safeguard",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing man-made staple fibers into the U.S. — HS codes, tariffs "
    "by country, antidumping orders and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 55 base rates run from Free to 25% — 4.3% on staple fiber, 7%–13.2% on spun yarn, mostly 12%–14.9% on woven "
    "fabric — and are unchanged since January 2025.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff; EU and Taiwanese goods pay 10% and Japanese "
    "goods 12.5% in total, so their higher-rated yarn and fabric pay only the base rate; Korean goods (Free under KORUS) "
    "pay 12.5% on every line.",
    "China and Brazil pay 37.5% extra on nearly every line (China 12.5% on viscose fiber and 5513.21 fabric); Canada pays "
    "50% under Section 338 on retail yarn and dyed polyester fabric, even with USMCA.",
    "Polyester staple fiber from China, India, Korea and Taiwan is under eleven AD/CVD orders, and fine denier PSF entered "
    "under bond is capped by a Section 201 quota through November 2028.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "psf-hs-code",
        "question": "What is the HS code for polyester staple fiber?",
        "searchedAs": ["polyester staple fiber hs code", "polyester staple fibre hs code", "virgin polyester staple fiber hs code",
                       "recycled polyester staple fiber hs code", "100 polyester staple fiber hs code", "hs code 5503.20"],
        "answer": "Polyester staple fiber not carded or combed is 5503.20.00 (4.3%), with statistical suffixes for low-melt "
        "bi-component fiber (.15), fiber under 3.3 decitex (.25), 3.3–13.2 decitex (.45) and 13.2 decitex or more (.65). "
        "Recycled and virgin fiber share the code. Carded or combed polyester fiber is 5506.20 (5.7%); filament tow is 5501.20.",
        "link": "",
    },
    {
        "id": "vsf-hs-code",
        "question": "What is the HS code for viscose or lyocell staple fiber?",
        "searchedAs": ["viscose staple fiber hs code", "viscose staple fibre hs code", "lyocell staple fiber hs code", "staple fiber hs code"],
        "answer": "Viscose rayon staple fiber, not carded or combed, is 5504.10.00.00 (4.3%); other artificial (cellulosic) staple "
        "fiber such as lyocell is 5504.90.00.00. Carded or combed artificial fiber is 5507.00.00. Chinese viscose staple fiber "
        "pays 12.5% extra rather than 37.5% while its List 4A exclusion lasts (through November 9, 2026).",
        "link": "",
    },
    {
        "id": "other-fiber-hs-code",
        "question": "What are the HS codes for acrylic, polypropylene and aramid staple fiber?",
        "searchedAs": ["acrylic staple fiber hs code", "polypropylene staple fiber hs code", "modacrylic staple fiber hs code",
                       "acrylic fiber hs code", "hs code 5503"],
        "answer": "Synthetic staple fiber not carded is heading 5503: aramid 5503.11, other nylon 5503.19, polyester 5503.20, "
        "acrylic or modacrylic 5503.30, polypropylene 5503.40 and other 5503.90 — 4.3%, except Free for vinyon and nylon-12 "
        "blends. The same fibers as continuous tow are heading 5501 (7.5%).",
        "link": "",
    },
    {
        "id": "staple-vs-filament",
        "question": "What is the difference between staple fiber and filament for classification?",
        "searchedAs": ["staple fiber vs filament", "polyester staple fiber vs polyester filament yarn", "what is staple fiber",
                       "what is polyester staple fiber", "man made staple fibres hs code"],
        "answer": "Staple fibers are short cut lengths that are spun into yarn; filaments are continuous. Staple "
        "fiber, spun yarn and fabric woven from spun yarn are chapter 55; filament yarn and fabric woven from filament yarn "
        "are chapter 54. Tow — parallel filaments over 2 m — is in 5501–5502 (chapter note 1).",
        "link": "",
    },
    {
        "id": "yarn-thread-hs-code",
        "question": "What is the HS code for spun polyester yarn and polyester sewing thread?",
        "searchedAs": ["spun polyester yarn hs code", "polyester sewing thread hs code", "spun polyester sewing thread hs code",
                       "sewing thread hs code", "polyester yarn hs code", "hs code 5509"],
        "answer": "Spun yarn of 85% or more polyester staple fiber is 5509.21 (single, 9.7%) or 5509.22 (multiple, "
        "10.6%); polyester mixed mainly with cotton is 5509.53 (13.2%). Sewing thread of man-made staple fiber is 5508.10 (11.4%). Yarn put "
        "up for retail sale is 5511 (7.5%). Filament polyester yarn and thread are chapter 54.",
        "link": "",
    },
    {
        "id": "poly-cotton-hs-code",
        "question": "What is the HS code for polyester-cotton fabric?",
        "searchedAs": ["polyester cotton fabric hs code", "polycotton fabric hs code", "65 polyester 35 cotton fabric hs code",
                       "cotton polyester blend fabric hs code", "hs code 5513"],
        "answer": "The predominant fiber by weight decides (Section XI note 2). A woven fabric with more polyester staple than "
        "cotton, but under 85% polyester, is 5513 (170 g/m² or less) or 5514 (over 170 g/m²) — mostly 14.9%. A 65/35 "
        "polyester-cotton shirting is 5513. If cotton predominates, the fabric is chapter 52; 85% or more polyester is 5512.",
        "link": "tariff-engineering",
    },
    {
        "id": "rayon-fabric-hs-code",
        "question": "What is the HS code for viscose or rayon fabric?",
        "searchedAs": ["viscose fabric hs code", "rayon fabric hs code", "polyester viscose fabric hs code",
                       "polyester rayon fabric hs code", "tencel fabric hs code", "hs code 5516"],
        "answer": "Woven fabric of spun viscose or lyocell is heading 5516 — 14.9% for most unbleached or dyed 85%+ rayon "
        "fabric. Polyester-viscose blends where polyester predominates are 5515.11 (14.9%). Fabric woven from filament rayon "
        "is 5408 (chapter 54), and knitted fabric chapter 60.",
        "link": "",
    },
    {
        "id": "hs-5512-5515",
        "question": "What do HS codes 5512 and 5515 cover?",
        "searchedAs": ["hs code 5512", "hs code 5512.19", "hs code 5515", "hs code 5515.12", "5512 hs code description"],
        "answer": "5512 is woven fabric of 85% or more synthetic staple fiber — 5512.11/.19 polyester (12% unbleached, 13.6% "
        "dyed or printed), 5512.21/.29 acrylic, 5512.91/.99 other. 5515 is other synthetic staple-fiber fabric: blends with "
        "rayon (5515.11), filament (5515.12) or wool (5515.13, up to 25%). Canadian 5512.19 fabric pays the 50% Section 338 "
        "duty.",
        "link": "industry-areas",
    },
    {
        "id": "psf-china",
        "question": "What is the tariff and antidumping duty on polyester staple fiber from China?",
        "searchedAs": ["anti dumping duty on polyester staple fiber from china", "polyester staple fiber (china)",
                       "polyester staple fiber from china"],
        "answer": "Chinese polyester staple fiber pays 4.3% plus 25% (List 3) and 12.5% (2026 action): 41.8%. Fine denier fiber "
        "also owes an antidumping deposit (103.00% China-wide at the order) and a countervailing deposit (42.66% all-others); "
        "fiber of 3.3 decitex or more owes the 2007 order's deposit (44.30% PRC-wide). Company rates vary by review.",
        "link": "tariff-updates",
    },
    {
        "id": "psf-adcvd",
        "question": "Which countries have antidumping duties on polyester staple fiber?",
        "searchedAs": ["polyester staple fiber antidumping", "polyester staple fiber anti dumping duty", "fine denier polyester staple fiber"],
        "answer": "Fine denier PSF (under 3.3 decitex): AD on China, India, Korea and Taiwan, CVD on China and India (2018, "
        "continued 2024). PSF of 3.3 decitex or more: AD on Korea and Taiwan (2000) and China (2007). Low melt PSF: AD on Korea "
        "and Taiwan (2018); Toray Advanced Materials Korea's 2023–2024 review rate is 3.02%. Thailand, Vietnam and Indonesia are not covered.",
        "link": "tariff-updates",
    },
    {
        "id": "fdpsf-safeguard",
        "question": "What is the fine denier polyester staple fiber safeguard?",
        "searchedAs": ["fine denier polyester staple fiber safeguard", "polyester staple fibers section 201", "section 201 safeguard polyester"],
        "answer": "A Section 201 quota (Proclamation 10857) on fine denier PSF entered duty-free under a temporary importation "
        "bond: 0 kg in the year from November 23, 2024, 453,592 kg to November 22, 2026, then 907,185 kg and 1,360,777 kg "
        "through November 22, 2028. Ordinary entries are not limited. Korea is covered; Canada, Mexico and most FTA partners are not.",
        "link": "tariff-updates",
    },
    {
        "id": "ch55-tariffs-2026",
        "question": "What tariffs apply to HTS Chapter 55 imports in 2026?",
        "searchedAs": ["hts chapter 55", "htsus chapter 55", "man made staple fibers tariff", "polyester tariff"],
        "answer": "The base rate plus, for most suppliers, a 10% or 12.5% Section 301 tariff since July 24, 2026 (EU and Taiwan "
        "10%, Korea and Japan 12.5% in total). China and Brazil pay 37.5% extra, Canada 50% on 5511.10 and 5512.19, and "
        "USMCA, CAFTA-DR and Jordanian goods are exempt from Section 301. The IEEPA tariffs ended February 24 and the Section "
        "122 surcharge July 23, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "ch55-sources",
        "question": "Where does the U.S. import man-made staple fiber from?",
        "searchedAs": ["polyester fiber import", "polyester staple fiber manufacturer", "polyester yarn import from china"],
        "answer": "In 2025 the U.S. imported $1.56B of Chapter 55 goods: South Korea $177.5M, Türkiye $156.3M, India $149.7M, "
        "Thailand $135.4M, Germany $110.3M and Vietnam $108.5M, then China $96.3M. Korea, Thailand and Vietnam ship mostly "
        "polyester staple fiber; Germany and Austria viscose fiber; Türkiye acrylic retail yarn.",
        "link": "understand-industry",
    },
    {
        "id": "ch55-origin",
        "question": "How is the country of origin of man-made fiber, yarn and fabric determined?",
        "searchedAs": ["man made fiber country of origin", "fabric country of origin rules", "yarn country of origin"],
        "answer": "By CBP's textile rules (19 CFR 102.21): staple fiber is from where the polymer was extruded, yarn from where "
        "it was spun and fabric from where it was woven — dyeing and printing alone do not change it unless greige fabric is "
        "both dyed and printed with two further finishing steps. Origin decides the Section 301 rate and AD/CVD coverage.",
        "link": "tariff-engineering",
    },
    {
        "id": "ch55-usmca",
        "question": "Do USMCA and CAFTA-DR fabrics and yarns pay the 2026 Section 301 tariff?",
        "searchedAs": ["usmca yarn-forward rules", "cafta-dr textile tariff", "usmca fabric tariff"],
        "answer": "No, if they qualify: USMCA goods are exempt (9903.05.93, 9903.05.94) and CAFTA-DR textile goods entered "
        "duty-free are exempt (note 52(i)). Qualifying yarn must be spun from regional fiber and fabric woven from regional "
        "yarn. Canadian retail yarn (5511.10) and dyed polyester fabric (5512.19) still pay 50% under Section 338.",
        "link": "tariff-engineering",
    },
]

# ---------------------------------------------------------------- write
d["asOf"] = CHECKED
json.dump(d, open(PATH, "w"), indent=2, ensure_ascii=False)
print("filled", PATH)
