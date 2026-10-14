"""Fill the writer parts of the generated Chapter 37 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 37 ...` (see run.sh in this folder):
    python3 fill37.py

Informational materials (9903.05.92 / 9903.05.09): measures.json (since #1840) models the relief only on headings
3704, 3705 and 3706 in this chapter, matching CBP's guidance on the identically worded IEEPA exception, so only those
matrix cells show two totals ("informational materials" / "not informational materials"); 3701-3703 and 3707 show one.
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
CH37 = REL + "Chapter%2037"
GN = REL + "General%20Notes"
ECFR = "https://www.ecfr.gov/current"

d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))


def fr(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


def ruling(num, date, title):
    return fr(f"cbp-{num.lower()}", f"CBP ruling {num}", "CBP ruling letter", title, None, date,
              f"https://rulings.cbp.gov/ruling/{num}", publisher="CBP (CROSS)")


ALPP_ORDER_URL = ("https://www.federalregister.gov/documents/2024/11/22/2024-27426/"
                  "aluminum-lithographic-printing-plates-from-japan-and-the-peoples-republic-of-china-antidumping-order")
NEW_SOURCES = {s["id"]: s for s in [
    fr("adcvd-alpp-order", "89 FR 92624", "Notice (Commerce/ITA)",
       "Aluminum Lithographic Printing Plates From Japan and the People's Republic of China: Antidumping Order; Aluminum "
       "Lithographic Printing Plates From the People's Republic of China: Countervailing Duty Order (A-570-156, C-570-157, A-588-881)",
       None, "2024-11-22", ALPP_ORDER_URL),
    fr("itc-alpp-final", "89 FR 90737", "Notice (USITC)", "Aluminum Lithographic Printing Plates From China and Japan: Determinations",
       None, "2024-11-18",
       "https://www.federalregister.gov/documents/2024/11/18/2024-26740/aluminum-lithographic-printing-plates-from-china-and-japan-determinations"),
    fr("itc-alpp-remand", "91 FR 14708", "Notice (USITC)",
       "Aluminum Lithographic Printing Plates From China and Japan (Inv. Nos. 701-TA-694 and 731-TA-1641-1642 (Final) (Remand)): notice of remand proceedings",
       None, "2026-03-26",
       "https://www.federalregister.gov/documents/2026/03/26/2026-05847/aluminum-lithographic-printing-plates-from-china-and-japan"),
    fr("ita-ar-init-2026-01", "91 FR 3421", "Notice (Commerce/ITA)",
       "Initiation of Antidumping and Countervailing Duty Administrative Reviews (November anniversary orders, incl. A-570-156, C-570-157, A-588-881)",
       None, "2026-01-27",
       "https://www.federalregister.gov/documents/2026/01/27/2026-01602/initiation-of-antidumping-and-countervailing-duty-administrative-reviews"),
    fr("ita-scope-2026-03", "91 FR 12342", "Notice (Commerce/ITA)",
       "Notice of Scope Rulings (October 1 - December 31, 2025), incl. A-588-881 aluminum lithographic printing plates from Japan",
       None, "2026-03-13", "https://www.federalregister.gov/documents/2026/03/13/2026-04942/notice-of-scope-rulings"),
    fr("usc-50-1702", "50 U.S.C. 1702(b)(3)", "United States Code",
       "International Emergency Economic Powers Act, section 203(b): exceptions to grant of authority (information and informational materials)",
       None, "2026-04-13",
       "https://www.govinfo.gov/content/pkg/USCODE-2024-title50/html/USCODE-2024-title50-chap35-sec1702.htm",
       publisher="GovInfo (U.S. Code)"),
    fr("cbp-ieepa-faq", "CBP IEEPA FAQ (last modified April 14, 2026)", "Web page",
       "International Emergency Economic Powers Act (IEEPA) Frequently Asked Questions: what are informational materials (9903.01.03, .12, .22, .31)",
       None, "2026-04-14", "https://www.cbp.gov/trade/programs-administration/trade-remedies/IEEPA-FAQ", publisher="CBP"),
    fr("csms-69326983", "CSMS # 69326983", "CSMS message", "GUIDANCE: Section 301 Forced Labor Import Duties", None, "2026-07-23",
       "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887", publisher="CBP"),
    fr("csms-69302472", "CSMS # 69302472", "CSMS message", "GUIDANCE: Section 301 Duties on Certain Products from Brazil", None,
       "2026-07-21", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42178c8", publisher="CBP"),
    fr("csms-67844987", "CSMS # 67844987", "CSMS message", "Imposing Temporary Section 122 Duties", None, "2026-02-23",
       "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b3b7b", publisher="CBP"),
    fr("hts-ch37", "HTSUS 2026 Revision 21, Chapter 37", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 37", None, "2026-10-07", CH37, publisher="USITC"),
    fr("hts-ch98", "HTSUS 2026 Revision 21, Chapter 98", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98", None, "2026-10-07", CH98, publisher="USITC"),
    fr("hts-rev10-cr", "HTSUS 2026 Revision 10 Change Record", "Change Record",
       "Harmonized Tariff Schedule of the United States (2026 Revision 10), Change Record: U.S. note 16(c)(vi) modified June 8, 2026 (PP 11032)",
       None, "2026-06-08", "https://hts.usitc.gov/reststop/file?release=2026HTSRev10&filename=Change%20Record", publisher="USITC"),
    ruling("H264769", "2016-06-28", "Request for Reconsideration of NY N260676; Classification of photomask blanks (3701.99.6060)"),
    ruling("W967818", "2006-09-26", "Internal Advice Request No. 06/023; Classification of positive and negative photoresists (3707.90.3290)"),
    ruling("N019393", "2007-11-27", "The tariff classification of Toner from Japan (3707.90.3290)"),
    ruling("I84363", "2002-08-11", "The tariff classification of Imagesetter Plate Material (Aluminum-Metal Based) from Japan (3701.30.0000; 3701.99.6060)"),
]}


# The shared pool cites Proclamation 11048 with a URL slug that differs from the Federal Register html_url; use the canonical one.
NEW_SOURCES["procl-11048"] = dict(pool["procl-11048"], url="https://www.federalregister.gov/documents/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united")


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


LABELS = {
    "3701": ("Photographic plates & sheet film, unexposed (X-ray, instant film, printing plates, photomask blanks)", "Plates & sheet film"),
    "3702": ("Photographic film in rolls, unexposed (35 mm, X-ray, microfilm and motion-picture stock)", "Roll film"),
    "3703": ("Photographic paper, paperboard & textiles, sensitized, unexposed", "Photo paper"),
    "3704": ("Plates, film & paper exposed but not developed", "Exposed, undeveloped"),
    "3705": ("Plates & film exposed and developed (other than motion-picture film)", "Developed plates & film"),
    "3706": ("Motion-picture film, exposed and developed", "Motion-picture film"),
    "3707": ("Photographic chemicals: emulsions, developers, toners, photoresists", "Photo chemicals"),
}

# ---------------------------------------------------------------- shared phrases
INFO = (
    "Exposed film of headings 3704-3706 (for example developed microfilm and microfiche, slides and motion-picture film) "
    "entered as informational materials under 9903.05.92 pays no 2026 Section 301 duty. CBP's guidance on the identically "
    "worded IEEPA exception lists only those three headings from Chapter 37, so unexposed film, plates and paper (3701-3703) "
    "and photographic chemicals (3707) pay it."
)
S232 = (
    "Plates and film of 3701.30 (any side over 255 mm, mostly aluminum printing plates) are derivative aluminum articles "
    "(U.S. note 16(c)(vi)): they pay 25% of full value under Section 232 (9903.82.09) in place of the Section 301 duty "
    "(note 52(f)), or no Section 232 duty if aluminum is under 15% of the weight (9903.82.03) or absent (9903.82.01)."
)
ENDED = (
    "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026; both excepted "
    "informational materials (9903.01.31, 9903.03.11)."
)
INFO_SRC = ["csms-69326983", "cbp-ieepa-faq", "usc-50-1702"]
ENDED_SRC = ["eo-14389", "procl-11012"]
S232_SRC = ["procl-11032", "procl-11021"]
ALPP_JP = "Japanese aluminum lithographic printing plates also owe an antidumping cash deposit of 91.83% (160.11% for Miraclon Corporation)."
ALPP_CN = ("Chinese aluminum lithographic printing plates also owe antidumping (115.84% Fujifilm Printing Plate (China); 317.43% "
           "China-wide) and countervailing (35.66% Fujifilm and all others; 229.54% Shanghai National Ink) cash deposits.")

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 37: Photographic Film, Plates, Paper & Chemicals — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 37 Tariff Rates 2026: Photographic Film, X-Ray Film, Instant Film, Printing Plates, Photo Paper & Toner | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 61 HTS Chapter 37 lines: X-ray and instant film, aluminum printing plates, 35 mm and "
    "motion-picture film, photo paper, microfilm, photoresists and toner. Base rates Free to 3.7%, plus the 2026 Section 301, "
    "China List 3, Section 232 and AD/CVD duties by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 37",
    "HTS Chapter 37 codes",
    "photographic or cinematographic goods",
    "hs code 3701",
    "hs code 3707.90",
    "hs code for photographic film",
    "hs code for x ray film",
    "hs code for printing plates",
    "hs code for photo paper",
    "photographic film import duty",
]
ov["intro"] = (
    "Chapter 37 covers photographic goods that are sensitized or already exposed: **plates and sheet film** (3701) — X-ray "
    "film, instant print film, aluminum **printing plates** and photomask blanks — **roll film** (3702), **photographic "
    "paper** (3703), exposed film (3704-3706, including developed microfilm and **motion-picture film**) and **photographic "
    "chemicals** (3707), a heading CBP uses for photoresists and copier toner. Cameras are chapter 90, and inkjet photo "
    "paper, which is not light-sensitive, is chapter 48.\n\n"
    "Base rates are low: **22 of 61 lines are Free** and the rest pay 1.4% to 3.7%. The extra duty by country decides the "
    "cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%** (Japan and Korea 12.5% "
    "in total, the EU 10% in total); only exposed film of 3704-3706 can avoid it as **informational materials** "
    "(9903.05.92). China pays **25% under Section 301 List 3** on every line. Large printing plates (3701.30) pay **25% "
    "Section 232** on full value, and aluminum lithographic printing plates from China and Japan also carry **antidumping "
    "duties of 91.83% to 317.43%**. Japan supplied 63% of the $1.57B imported in 2025."
)
BLURBS = {
    "3701": (
        "Unexposed plates and film in the flat: X-ray film (3701.10, 3.7%), instant print film packs (3701.20, 3.7%; Free "
        "for Japan under the U.S.-Japan Trade Agreement), plates and film with any side over 255 mm (3701.30, Free — "
        "aluminum printing plates, which also pay Section 232) and smaller plates, graphic-arts film and photomask blanks "
        "(3701.99, Free). 43% of 2025 imports ($669M).",
        ["x-ray film sheets", "instant film", "polaroid film", "instax film", "aluminum printing plates", "offset plates",
         "CTP plates", "photopolymer plates", "photomask blanks", "graphic arts film"],
    ),
    "3702": (
        "Unexposed film in rolls: X-ray film (3702.10), microfilm stock (3702.32.01.30), 35 mm color negative and slide film "
        "(3702.53, 3702.54), wide graphic-arts and industrial film (3702.41-3702.44) and motion-picture stock (3702.56). Most "
        "lines 3.7%; long 16-35 mm rolls and film over 35 mm wide for color are Free.",
        ["35mm film", "camera film", "120 film", "film rolls", "motion picture film stock", "microfilm stock", "x-ray film rolls"],
    ),
    "3703": (
        "Light-sensitive photographic paper, paperboard and textiles, unexposed: silver halide papers (3.7%), other color and "
        "black-and-white papers (3.1% or 2.8%), in rolls over 610 mm wide or other sizes. Inkjet photo paper is not "
        "sensitized and is classified in chapter 48.",
        ["photographic paper", "silver halide paper", "color photo paper rolls", "black and white photo paper", "minilab paper"],
    ),
    "3704": (
        "Plates, film, paper, paperboard and textiles that have been exposed but not developed — for example exposed rolls "
        "sent for processing. Free. Listed by CBP among headings whose goods may qualify as informational materials.",
        ["exposed film", "undeveloped film", "exposed x-ray plates"],
    ),
    "3705": (
        "Plates and film that have been exposed and developed, other than motion-picture film: developed microfilm and "
        "microfiche, slides and transparencies, negatives and other developed plates. Free. 14% of 2025 imports ($221M), led "
        "by Taiwan, Germany and Japan.",
        ["microfilm", "microfiche", "slides", "negatives", "transparencies", "developed film"],
    ),
    "3706": (
        "Motion-picture film, exposed and developed, with or without a sound track: 35 mm or wider (3706.10) and narrower "
        "(3706.90), including positive release prints of feature films. Free, except sound recordings on 35 mm film "
        "(3706.10.30, 1.4%).",
        ["motion picture film", "35mm film prints", "feature film prints", "cinema film", "film reels"],
    ),
    "3707": (
        "Chemical preparations for photographic uses: sensitizing emulsions (3707.10, 3%) and other preparations and unmixed "
        "products put up in measured portions or for retail sale (3707.90, Free) — developers, fixers, color couplers and, per "
        "CBP rulings, photoresists and copier toner. 32% of 2025 imports ($496M), 82% from Japan.",
        ["photoresist", "toner powder", "photographic developer", "fixer", "photographic chemicals", "emulsions", "color couplers"],
    ),
}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Aluminum printing plates from Japan",
        "line": "3701.30.00.00",
        "body": "Plates with a side over 255 mm are Free at the general rate, but 3701.30.00 is a derivative aluminum article: "
        "it pays **25% of full value** under Section 232 (9903.82.09), which replaces Japan's 12.5% Section 301 rate. "
        "Aluminum lithographic printing plates are also under an antidumping order: Fujifilm and all other Japanese "
        "exporters deposit **91.83%**. On a $100,000 shipment that is $25,000 + $91,830 = **$116,830**.",
    },
    {
        "title": "Instant print film from Japan",
        "line": "3701.20.00.30",
        "body": "Instant film is 3.7%, Free under the U.S.-Japan Trade Agreement (SPI JP). Japanese goods pay 12.5% in total "
        "under the 2026 Section 301 action when the base rate is lower (9903.05.49). Unexposed film is not on CBP's "
        "informational-materials list, so a $10,000 shipment pays **$1,250**.",
    },
    {
        "title": "35 mm color film from China",
        "line": "3702.54.00.30",
        "body": "3.7% base + 25% Section 301 List 3 (9903.88.03) + 12.5% 2026 Section 301 (9903.05.31) = **41.2%**: $4,120 "
        "on $10,000. No China exclusion covers the line.",
    },
    {
        "title": "Developed microfilm from Germany",
        "line": "3705.00.00.00",
        "body": "Free at the general rate. EU goods pay 10% in total under the 2026 Section 301 action (9903.05.39), but "
        "developed microfilm is informational material: entered under 9903.05.92 it pays **$0**. Without the claim, $1,000 "
        "on $10,000.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in d["understandIndustry"]["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "3707.90", "label": "Chemical preparations for photographic uses (incl. photoresists and toner)"},
    {"hts": "3701.99", "label": "Other plates and film in the flat, up to 255 mm (incl. photomask blanks)"},
    {"hts": "3705.00", "label": "Plates and film, exposed and developed (other than motion-picture film)"},
    {"hts": "3701.30", "label": "Plates and film with any side over 255 mm (incl. aluminum printing plates)"},
    {"hts": "3701.20", "label": "Instant print film in the flat"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. \"Other Asia, nes\" is how UN Comtrade reports Taiwan."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover waste or scrap.\n\n"
    "**Note 2.** In this chapter the word \"photographic\" relates to the process by which visible images are formed, directly "
    "or indirectly, by the action of light or other forms of radiation on photosensitive, including thermosensitive, surfaces."
)
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 37 Tariff Updates: Photographic Film, Plates, Paper & Chemicals (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 37 Tariff Updates 2026: Film & Printing Plate Tariffs — Section 301, Section 232, AD/CVD, Informational Materials | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for photographic film, printing plates, photo paper and photo chemicals (HTS Chapter 37) since January "
    "2025: unchanged base rates, the 2026 Section 301 duties and the informational-materials exemption for exposed film, "
    "China's 25% List 3 duty, Section 232 on 3701.30 plates and the AD/CVD orders on aluminum printing plates."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 37 tariff updates",
    "photographic film tariffs 2026",
    "printing plate tariffs",
    "aluminum lithographic printing plates antidumping",
    "section 232 printing plates",
    "informational materials exemption tariffs",
    "section 301 photographic film",
    "tariffs on films",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 61 Chapter 37 lines carry the **same base rate** in both.\n\n"
    "What changed came on top. The 2025 IEEPA tariffs **ended on February 24, 2026**; the Section 122 surcharge that followed "
    "expired July 23, 2026. Since **July 24, 2026** the **2026 Section 301 tariffs** charge goods of 60 economies 10% or 12.5% "
    "(Japan and Korea 12.5% in total, the EU and Taiwan 10% in total), and Brazil pays a further 25% from July 22. Exposed film "
    "of 3704-3706 entered as **informational materials** (9903.05.92) is exempt; unexposed film, paper and chemicals are not. "
    "China keeps its **25% List 3** duty on every line. Large plates (**3701.30**) were added to the Section 232 aluminum "
    "derivatives list on August 18, 2025 and since **June 8, 2026** pay **25% of full value**. Aluminum lithographic printing "
    "plates from China and Japan have been under **antidumping and countervailing duty orders** since November 2024."
)
tu["scope"] = (
    "Measures that reach Chapter 37 from any country: the 2026 Section 301 tariffs on 60 economies and their informational-"
    "materials exemption, the Brazil Section 301 tariff, China Section 301 List 3, Section 232 on derivative aluminum (3701.30), "
    "Russia's rates in lieu of column 2 and its 200% aluminum duty, the Nicaragua Section 301 phase-in, the 2025-2026 IEEPA and "
    "Section 122 duties that have ended, and the AD/CVD orders on aluminum lithographic printing plates (explained here, not "
    "in the rate grid). No Chapter 37 line is on the Canada Section 338 list or any Section 301 exemption list. For the rate "
    "each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates", "value": "Unchanged on 61 of 61 lines", "note": "22 Free; others 1.4%-3.7%"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "2026 and Brazil Section 301, China List 3, Section 232 (3701.30), Russia"},
    {"label": "China Section 301", "value": "25% + 12.5%", "note": "List 3 on all 61 lines, plus the 2026 action"},
    {"label": "AD/CVD orders", "value": "3", "note": "aluminum lithographic printing plates, China and Japan"},
]

IE = {
    "jp-section-301": (
        "Japanese goods pay 12.5% in total in place of a lower base rate (9903.05.49, U.S. note 52(k)); every Chapter 37 line "
        "is at or below 3.7%, so 12.5%. " + INFO + " " + S232 + " " + ALPP_JP + " " + ENDED,
        "Japanese film, photomask blanks, photoresists and toner pay 12.5%; aluminum printing plates pay 25% Section 232 plus "
        "the 91.83% antidumping deposit.",
        INFO_SRC + S232_SRC + ["adcvd-alpp-order"] + ENDED_SRC,
    ),
    "eu-section-301": (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39) — every Chapter 37 line, so 10%. " + INFO
        + " " + S232 + " This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        "German, Dutch, Belgian and French film, paper and chemicals pay 10% of value; developed microfilm and motion-picture "
        "film entered as informational materials pay their base rate (mostly Free).",
        INFO_SRC + S232_SRC + ["eo-14389"],
    ),
    "tw-section-301": (
        "Taiwanese goods pay 10% in total in place of a lower base rate (9903.05.76, U.S. note 52(k)), so 10% on every "
        "Chapter 37 line. " + INFO + " " + S232 + " " + ENDED,
        "Taiwan's developed plates and film (3705) pay 10%, or the Free base rate if CBP accepts them as informational "
        "materials.",
        INFO_SRC + S232_SRC + ENDED_SRC,
    ),
    "kr-section-301": (
        "South Korean goods pay 12.5% in total in place of a lower base rate (9903.05.71, U.S. note 52(k)), so 12.5%; KORUS "
        "makes the 3.7% lines Free first. " + INFO + " " + S232 + " " + ENDED,
        "Korean film and photo chemicals pay 12.5%; large printing plates pay 25% Section 232.",
        INFO_SRC + S232_SRC + ENDED_SRC,
    ),
    "sg-section-301": (
        "+12.5% on top of the base rate (9903.05.68); the U.S.-Singapore FTA (SPI SG) makes the base rate Free on every line. "
        + INFO + " " + S232 + " " + ENDED,
        "Singaporean plates and film pay 12.5% with an SG claim; 3701.30 plates pay 25% Section 232 instead.",
        INFO_SRC + S232_SRC + ENDED_SRC,
    ),
    "gb-section-301": (
        "+10% (9903.05.81). The UK's own exception list (U.S. note 52(j)) names no Chapter 37 line. " + INFO + " For 3701.30 "
        "the UK rate is 15% of full value (9903.82.05) when at least 95% of the aluminum was smelted or most recently cast "
        "in the UK (note 16(d)); otherwise 25% (9903.82.09). " + ENDED,
        "British roll film and photo paper pay up to 13.7% (3.7% + 10%); large plates pay 15% or 25% Section 232.",
        INFO_SRC + S232_SRC + ENDED_SRC,
    ),
    "br-section-301": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). Both exempt informational materials (9903.05.09, 9903.05.92) — for Chapter 37, exposed film of "
        "3704-3706. Neither applies to goods paying Section 232 (U.S. notes 50(a)(vi), 52(f)), so 3701.30 plates pay 25%. The "
        "40% IEEPA duty on Brazil ended February 24, 2026.",
        "Brazilian plates and film other than 3701.30 pay 37.5% on top of the base rate (41.2% on 3.7% lines); 3701.30 plates "
        "pay 25%.",
        ["csms-69302472", "csms-69326983", "cbp-ieepa-faq"] + S232_SRC + ["eo-14323", "eo-14389"],
    ),
    "cn-section-301": (
        "Two Section 301 duties. List 3 (+25%, 9903.88.03, U.S. note 20(f)) covers all 61 Chapter 37 lines and has no "
        "informational-materials exemption; the two China exclusions that named a Chapter 37 product (PET photoresist film of "
        "3702.44.0160) have expired. The 2026 action adds +12.5% (9903.05.31) unless exposed film is entered under "
        "9903.05.92. On 3701.30 the 25% Section 232 duty replaces the 12.5% but not List 3. " + ALPP_CN + " USTR confirmed on "
        "October 7, 2026 that the 2018-2019 actions continue. The IEEPA duties on China ended February 24, 2026.",
        "Chinese film, paper and chemicals pay 37.5% on top of the base rate (41.2% on 3.7% lines); aluminum printing plates pay "
        "50% plus AD/CVD deposits.",
        ["fr-2026-20510", "csms-69326983", "cbp-ieepa-faq"] + S232_SRC + ["adcvd-alpp-order", "eo-14195", "eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Plates, film and paper of 3701-3703 qualify only if made "
        "from materials outside that group; 3704-3706 need a change of heading and 3707 a change of subheading, or a chemical "
        "reaction in a USMCA country (General Note 11). " + INFO + " USMCA does not lift the 25% Section 232 duty on 3701.30 "
        "(note 16(b)). The 25% IEEPA duty on Mexico ended February 24, 2026.",
        "Mexican plates and film with a USMCA claim pay their base rate only, except 3701.30 plates (25%); without a claim, "
        "10% more.",
        S232_SRC + ["eo-14389", "eo-14194", "csms-69326983"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93); the Chapter 37 rules of origin are those of General "
        "Note 11. " + INFO + " No Chapter 37 line is on the Canada Section 338 list (U.S. note 51). USMCA does not lift the "
        "25% Section 232 duty on 3701.30. The 35% IEEPA duty on Canada ended February 24, 2026.",
        "Canadian developed film and chemicals that qualify for USMCA pay their base rate only; without a claim, 10% more.",
        S232_SRC + ["eo-14389", "eo-14193", "csms-69326983"],
    ),
    "ru-section-301": (
        "Russia is a column 2 country and pays the column 2 rates (mostly 20%-35%, some specific rates). U.S. note 30(b) puts 3701.30, 3701.91, "
        "3702.31.01 and 3703.90.30 (7 statistical lines) under 9903.90.08, which charges 35% in place of the column 2 rate. "
        "3701.30 also pays 200% on Russian aluminum (9903.85.68, note 19). The 2026 Section 301 duty adds 12.5% (9903.05.66) "
        "unless exposed film is entered under 9903.05.92.",
        "Russian film pays its column 2 rate or 35%, plus 12.5%; large aluminum plates pay 247.5% (35% + 200% + 12.5%).",
        ["pl-117-110", "procl-10420", "procl-10523", "procl-10522", "csms-69326983"],
    ),
    "other-section-301": (
        "10% or 12.5% on top of the base rate (Switzerland 12.5% in total) for the other 49 economies, including India, "
        "Vietnam, Malaysia, Thailand, Israel and Australia. " + INFO + " No country exception list in note 52(j) names a "
        "Chapter 37 line. " + ENDED,
        "Film from India pays 13.7% (3.7% + 10%), from Vietnam or Thailand 16.2%; countries outside the 60 economies pay the "
        "base rate only.",
        INFO_SRC + ENDED_SRC,
    ),
    "all-section-232-1": (
        "3701.30.00 is listed as a derivative aluminum article in U.S. note 16(c)(vi) since June 8, 2026 (Proclamation 11032). "
        "Duty is 25% of full value (9903.82.09), or 10% (9903.82.06) when at least 85% of the aluminum was smelted and cast in "
        "the United States (note 16(e)). No Section 232 duty if the article contains no aluminum, steel or copper (9903.82.01) "
        "or the metal is under 15% of its weight (9903.82.03). It is charged on top of any FTA rate, USMCA included, and in "
        "place of the 2026 Section 301 and Brazil duties.",
        "Aluminum printing plates over 255 mm pay 25% of value from every country except Russia (200% + 35%).",
        ["procl-11032", "procl-11021", "fr-2026-08297", "csms-68253075", "hts-rev10-cr"],
    ),
}
CLEAN_NOW = {
    "gb-section-301": "+10%; 3701.30: +15% or +25% (Section 232)",
    "cn-section-301": "+37.5% (25% List 3 + 12.5%); 3701.30: +50% (25% + 25% Section 232)",
    "br-section-301": "+37.5% (25% + 12.5%); 3701.30: +25% (Section 232)",
    "ru-section-301": "35% in place of column 2 on 7 lines; +200% on 3701.30; +12.5% (2026 Section 301)",
    "all-section-232-1": "+25% (10% with U.S.-smelted aluminum)",
}
for x in tu["inEffect"]:
    ex, wim, extra = IE[x["id"]]
    x["exemption"] = ex
    x["whatItMeans"] = wim
    for sid in extra:
        if sid not in x["sourceIds"]:
            x["sourceIds"].insert(-1, sid)
    if x["id"] in CLEAN_NOW:
        x["now"] = CLEAN_NOW[x["id"]]
    if x["id"] == "ru-section-301":
        x["before"] = "35% in place of column 2 on 7 lines; column 2 on the rest"
    if x["id"] == "cn-section-301":
        x["before"] = "+25% (List 3)"
    if x["id"] == "other-section-301":
        x["country"] = "Other Section 301 economies (49, incl. India, Vietnam, Malaysia, Thailand, Switzerland)"
    if x["id"] == "all-section-232-1":
        x["country"] = "All countries except Russia (3701.30 only)"
        x["measure"] = "Section 232 (derivative aluminum, full value)"
        x["before"] = "50% on the aluminum content (from August 18, 2025)"
        x["effectiveFrom"] = "2026-06-08"
        x["effectiveSourceId"] = "procl-11032"
add_sources(tu, sorted({s for x in tu["inEffect"] for s in x["sourceIds"]}))

for c in tu["changes"]:
    cid = c["id"]
    if cid == "base-rates":
        c["detail"] = (
            "All 61 Chapter 37 lines carry the same general rate in 2026 Revision 21 as in the 2025 Basic Edition: 22 Free and "
            "39 between 1.4% and 3.7%. No line was added, split or renumbered."
        )
    elif cid.startswith("section-301-nicaragua"):
        c["date"] = "2025-12-12"
        c["dateLabel"] = "Published"
        c["title"] = "Nicaragua Section 301 tariff phases in from 2027"
        c["detail"] = (
            "USTR's action on Nicaragua adds a duty on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01, U.S. "
            "note 29): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 37 line and "
            "has no informational-materials exemption."
        )
        c["now"] = "0% in 2026 → 10% (2027) → 15% (2028)"
    elif cid.startswith("section-301-2026-60"):
        c["title"] = "Section 301 tariffs on 60 economies, with an informational-materials exemption"
        c["detail"] = (
            "10% or 12.5% on all products of 60 economies (9903.05.20-9903.05.84), every Chapter 37 line included. EU and "
            "Taiwanese goods pay 10% in total and Japanese, Korean and Swiss goods 12.5% in total when the base rate is lower; "
            "USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). No Chapter 37 line is on the general exemption list "
            "(U.S. note 52(b)) or any country list (52(j)). Heading 9903.05.92 exempts informational materials — for this "
            "chapter, exposed film of 3704-3706 — and note 52(f) exempts 3701.30 plates that pay Section 232."
        )
        c["before"] = "None"
    elif cid.startswith("section-301-brazil"):
        c["title"] = "Section 301 tariff on products of Brazil"
        c["detail"] = (
            "25% on all goods of Brazil (9903.05.01), with informational materials exempt (9903.05.09) and goods paying "
            "Section 232 excluded (U.S. note 50(a)(vi)). From July 24 the 12.5% 2026 action (9903.05.27) is added on top."
        )
        c["before"] = "None"
    elif cid.startswith("section-232-steel-aluminum-copper"):
        c["title"] = "Section 232: 3701.30 plates listed as derivative aluminum, 25% of full value"
        c["detail"] = (
            "Proclamation 11032 revised U.S. note 16 from June 8, 2026 and listed 3701.30.00 in subdivision (c)(vi), "
            "derivative aluminum articles. Since then these plates pay 25% of full value (9903.82.09), 15% for UK goods with at "
            "least 95% UK aluminum (9903.82.05) and 10% with at least 85% U.S.-smelted aluminum (9903.82.06); none if the "
            "aluminum is under 15% of the weight (9903.82.03). The duty is in place of the 2026 Section 301 and Brazil duties."
        )
        c["before"] = "50% on the aluminum content"
        c["now"] = "+25% of full value (15% UK, 10% U.S. aluminum)"
        c["countries"] = "All except Russia"
        c["sourceIds"] = ["procl-11032", "procl-11021", "hts-rev10-cr", "hts-chapter-99", "hts-now"]
    elif cid.startswith("section-232-aluminum-russia"):
        c["title"] = "3701.30 plates added to the Section 232 aluminum derivatives list"
        c["detail"] = (
            "Commerce's first inclusions under the derivatives process added 3701.30.0000 to the aluminum list from August 18, "
            "2025: the 50% Section 232 rate (25% for the UK) applied to the aluminum content, and Russian aluminum derivatives "
            "paid 200% (9903.85.68). Proclamation 11021 ended the inclusions process on April 6, 2026."
        )
        c["before"] = "None"
        c["now"] = "+50% on aluminum content; Russia +200%"
        c["countries"] = "All"
        c["sourceIds"] = ["fr-2025-15819", "procl-10947", "procl-10522", "procl-11021", "hts-chapter-99"]

NEW_CHANGES = [
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 3 continues",
        "detail": "USTR received requests to continue the 2018-2019 China Section 301 actions, so they stay in effect during the "
        "four-year review. For Chapter 37 this keeps +25% (9903.88.03) on all 61 lines.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ca-338", "type": "reference", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Canada Section 338 duty: no Chapter 37 line on the list",
        "detail": "Proclamation 11048 put a 50% duty (9903.03.12-9903.03.14) on Canadian goods listed in U.S. note 51(b), in "
        "force from August 22, 2026 after a short suspension (Proclamation 11056); Proclamation 11065 revised the lists from "
        "September 15. No Chapter 37 provision is on any of the lists in Revision 21, so Canadian photographic goods pay only "
        "the Section 301 duty, which USMCA goods avoid.",
        "before": None, "now": None, "countries": "Canada",
        "sourceIds": ["procl-11048", "procl-11056", "procl-11065", "hts-chapter-99"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in "
        "force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "alpp-remand", "type": "reference", "date": "2026-03-26", "dateLabel": "Published",
        "title": "Printing plates: ITC reconsiders its injury finding on court remand",
        "detail": "On February 18, 2026 the Court of International Trade (Slip Op. 26-17, Fujifilm N. Am. Corp. v. United "
        "States) sent the ITC's 2024 injury determinations back for it to reconsider whether Fujifilm's U.S. plant is a related "
        "party to exclude from the domestic industry. The ITC set its remand procedures; no revocation of the orders has been "
        "published, so cash deposits continue.",
        "before": None, "now": None, "countries": "China, Japan", "sourceIds": ["itc-alpp-remand", "adcvd-alpp-order"],
    },
    {
        "id": "alpp-scope", "type": "reference", "date": "2026-03-13", "dateLabel": "Published",
        "title": "Flexographic photopolymer plates ruled outside the Japan antidumping order",
        "detail": "Commerce ruled on November 24, 2025 that Miraclon's flexographic photopolymer printing plates contain no "
        "aluminum and are outside the order on aluminum lithographic printing plates from Japan, which covers plates whose "
        "substrate is at least 90% aluminum.",
        "before": None, "now": None, "countries": "Japan", "sourceIds": ["ita-scope-2026-03", "adcvd-alpp-order"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. Informational materials (9903.03.11), "
        "USMCA-qualifying goods from Canada and Mexico and Section 232 goods (9903.03.06) were exempt.",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All",
        "sourceIds": ["procl-11012", "csms-67844987", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP "
        "stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings "
        "are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "alpp-reviews", "type": "reference", "date": "2026-01-27", "dateLabel": "Published",
        "title": "First administrative reviews of the printing-plate orders begin",
        "detail": "Commerce initiated the first reviews of the antidumping orders on China (A-570-156) and Japan (A-588-881), "
        "covering May 1, 2024 to October 31, 2025, and of the China countervailing duty order (C-570-157), covering March 1 to "
        "December 31, 2024, for Fujifilm. Until final results are published, the order's cash deposit rates apply.",
        "before": None, "now": None, "countries": "China, Japan", "sourceIds": ["ita-ar-init-2026-01"],
    },
    {
        "id": "br-ieepa", "type": "extraDuty", "date": "2025-07-30", "dateLabel": "Signed",
        "title": "Additional duty on products of Brazil",
        "detail": "+40% (9903.01.77) on goods of Brazil, excepting articles covered by 50 U.S.C. 1702(b), including "
        "informational materials (9903.01.80). Ended February 24, 2026.",
        "before": "None", "now": "+40% (ended)", "countries": "Brazil", "sourceIds": ["eo-14323"],
    },
    {
        "id": "alpp-orders", "type": "reference", "date": "2024-11-22", "dateLabel": "Published",
        "title": "Antidumping and countervailing duty orders on aluminum lithographic printing plates",
        "detail": "After the ITC found injury (November 2024), Commerce issued antidumping orders on aluminum lithographic "
        "printing plates from China (Fujifilm Printing Plate (China) 115.84%, China-wide 317.43% cash deposit) and Japan "
        "(Fujifilm 91.83%, Miraclon 160.11%, all others 91.83%) and a countervailing duty order on China (Fujifilm and all "
        "others 35.66%, Shanghai National Ink 229.54%). The scope covers plates with a substrate of at least 90% aluminum, "
        "exposed or not, entered under 3701.30.0000 or 3701.99.6060 (also 3701.99.3000 and 8442.50.1000).",
        "before": "None", "now": "AD 91.83%-317.43%; CVD 35.66%-229.54%", "countries": "China, Japan",
        "sourceIds": ["adcvd-alpp-order", "itc-alpp-final"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries — informational materials excepted",
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Section 3(b) excepted "
        "articles encompassed by 50 U.S.C. 1702(b): informational materials were entered under 9903.01.31, and CBP named "
        "headings 3704, 3705 and 3706 as the Chapter 37 goods that may qualify. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14257", "cbp-ieepa-faq", "hts-chapter-99"],
    },
    {
        "id": "ieepa-feb", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "IEEPA duties on Canada, Mexico and China",
        "detail": "+25% on non-USMCA goods of Canada (later 35%) and Mexico and +10% (later 20%, then 10%) on goods of China. "
        "Each order excluded articles encompassed by 50 U.S.C. 1702(b); CBP set up 9903.01.03, 9903.01.12 and 9903.01.22 for "
        "informational materials. Ended February 24, 2026.",
        "before": "None", "now": "+25% / +10% (ended)", "countries": "Canada, Mexico, China",
        "sourceIds": ["eo-14193", "eo-14194", "eo-14195", "cbp-ieepa-faq", "usc-50-1702"],
    },
]
have_ids = {c["id"] for c in tu["changes"]}
for c in NEW_CHANGES:
    if c["id"] not in have_ids:
        tu["changes"].append(c)
add_sources(tu, sorted({s for c in tu["changes"] for s in c["sourceIds"]}))
tu["changes"].sort(key=lambda c: c["date"], reverse=True)
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in tu["changes"] for sid in c["sourceIds"]}
used |= {"hts-now", "hts-before", "hts-now-cr"}
tu["sources"] = [s_ for s_ in tu["sources"] if s_["id"] in used]

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 37: Photographic Film, Plates & Chemicals — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 37 Import Statistics: U.S. Photographic Film, Printing Plate & Photo Chemical Imports by Country (Japan, Germany, Taiwan) | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of photographic plates, film, paper and chemicals, 2020-2025, by country, product and year: $1.57B in 2025, "
    "down 1.6%; Japan supplied 63%, Germany 10% and Taiwan 6%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 37 import statistics",
    "photographic film imports",
    "us imports of photographic plates",
    "printing plate imports",
    "photoresist imports from japan",
    "photographic goods imports by country",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    "U.S. imports of Chapter 37 goods were **$1.57B in 2025**, down 1.6% from $1.60B in 2024 and below the 2022 peak of $1.66B. "
    "Two groups make up three quarters: **unexposed plates and sheet film (3701), $669M (43%)**, and **photographic chemicals "
    "(3707), $496M (32%)** — the heading CBP uses for photoresists and copier toner. Developed plates and film (3705) were "
    "$221M (+5%), roll film (3702) fell 22% to $145M and photographic paper (3703) rose 36% to $33M.\n\n"
    "**Japan supplied $994M (63%)**, down 4%: $467M of plates and film and $408M of chemicals. **Germany ($153M)** ships "
    "mostly plates (3701) and developed film (3705). **Taiwan** (reported to Comtrade as \"Other Asia, nes\") rose 53% to "
    "$97M, three quarters of it developed plates and film (3705). Singapore jumped from $0.9M to $38M, almost all 3701, while "
    "Belgium fell 41% and **China fell 66% to $14.5M** — under 1% of the total, after years of the 25% List 3 duty.\n\n"
    "The largest 6-digit lines were other chemical preparations (3707.90, $495M), small plates and film including photomask "
    "blanks (3701.99, $317M), developed plates and film (3705.00, $221M), large plates such as aluminum printing plates "
    "(3701.30, $172M, down 10%) and instant print film (3701.20, $140M). 2025 is the latest full year of U.S. trade data; the "
    "2026 Section 301 and Section 232 changes are not yet in it."
)
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. \"Other Asia, "
    "nes\" is how UN Comtrade reports Taiwan."
)

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 37 Tariff Rates by Country: Photographic Film, Plates, Paper & Chemicals"
ia["seo"]["title"] = "Tariffs on Photographic Film & Printing Plates by Country: Japan, Germany, Taiwan, China, EU, UK (HTS Ch. 37) | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on photographic plates, film, photo paper, developed film and photo chemicals by country: base rate "
    "plus the 2026 Section 301 duty, China's 25% List 3 duty and Section 232 on 3701.30 plates, with the informational-"
    "materials exemption and USMCA explained."
)
ia["seo"]["keywords"] = [
    "photographic film tariffs by country",
    "tariffs on film from japan",
    "tariffs on film from china",
    "printing plate tariffs by country",
    "HTS chapter 37 import duty by country",
    "polaroid film tariffs",
]
ia["intro"] = (
    "Each cell is the **total rate** for the product group from that country: base rate plus extra duties minus preferences, "
    "computed from the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Cells for **exposed film** — headings **3704, 3705 and 3706**, such as developed microfilm, slides and motion-picture "
    "film — show two totals. The plain total is the rate when the goods are entered as **informational materials** under "
    "**9903.05.92** (and 9903.05.09 for Brazil), which removes the 2026 Section 301 duty and Brazil's 25%; the total marked "
    "**\"if not informational materials\"** is the rate without that claim. These are the only Chapter 37 headings CBP lists as goods that may qualify. Unexposed plates, "
    "film and paper (3701-3703) and photographic chemicals (3707) carry no information, so their cells show one total with "
    "the Section 301 duty included. The claim never removes **China's 25% List 3** duty.\n\n"
    "Plates over 255 mm (**3701.30**, mostly aluminum printing plates) show **25%** from most countries: Section 232 on full "
    "value, which replaces the Section 301 duty. AD/CVD duties on aluminum lithographic printing plates from China and Japan "
    "are not in the grid; see Tariff updates."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULE_LABELS = {
    "Japan": "12.5% in total in place of the lower base rate (9903.05.49) on every line except 3701.30, which pays 25% Section 232 (9903.82.09). Instant film is Free for JP first. A 9903.05.92 claim removes the 12.5% only for exposed film (3704-3706). Aluminum printing plates also owe a 91.83% antidumping deposit (160.11% Miraclon).",
    "Germany": "EU: 10% in total in place of the lower base rate (9903.05.39); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 10% only for exposed film (3704-3706). The 15% IEEPA rate ended February 24, 2026.",
    "Taiwan": "10% in total in place of the lower base rate (9903.05.76); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 10% only for exposed film (3704-3706).",
    "Netherlands": "EU: 10% in total in place of the lower base rate (9903.05.39); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 10% only for exposed film (3704-3706).",
    "South Korea": "12.5% in total in place of the lower base rate (9903.05.71; KORUS makes the base Free); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 12.5% only for exposed film (3704-3706).",
    "Belgium": "EU: 10% in total in place of the lower base rate (9903.05.39); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 10% only for exposed film (3704-3706).",
    "Singapore": "Base rate Free under the U.S.-Singapore FTA (SG) plus 12.5% Section 301 (9903.05.68); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 12.5% only for exposed film (3704-3706).",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81); 3701.30 plates pay 25% Section 232 instead (15% under 9903.82.05 with at least 95% UK aluminum, not modeled). A 9903.05.92 claim removes the 10% only for exposed film (3704-3706).",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27): 37.5% extra; base rate only for informational materials (9903.05.09 and 9903.05.92), which fits exposed film (3704-3706) only. 3701.30 plates pay 25% Section 232 instead of both.",
    "China": "Base rate plus 25% List 3 (9903.88.03) on all 61 lines and 12.5% (9903.05.31): 37.5% extra; the 9903.05.92 claim removes only the 12.5%, and only for exposed film (3704-3706). 3701.30 plates pay 25% + 25% Section 232. Aluminum printing plates also owe AD (115.84%-317.43%) and CVD (35.66%-229.54%) deposits.",
    "Mexico": "USMCA-qualifying: base rate only (9903.05.94 removes 9903.05.55), except 3701.30 plates, which pay 25% Section 232 with or without USMCA. Otherwise base rate plus 10% Section 301; a 9903.05.92 claim removes it only for exposed film (3704-3706).",
    "Canada": "USMCA-qualifying: base rate only (9903.05.93 removes 9903.05.29), except 3701.30 plates, which pay 25% Section 232 with or without USMCA. Otherwise base rate plus 10% Section 301; a 9903.05.92 claim removes it only for exposed film (3704-3706). No Chapter 37 line is on the Section 338 list.",
    "France": "EU: 10% in total in place of the lower base rate (9903.05.39); 3701.30 plates pay 25% Section 232 instead. A 9903.05.92 claim removes the 10% only for exposed film (3704-3706).",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% (9903.05.20-9903.05.84); 3701.30 plates pay 25% Section 232. A 9903.05.92 claim removes the Section 301 duty only for exposed film (3704-3706). No country exception list names a Chapter 37 line. Russia pays its column 2 rates (mostly 20%-35%) and 235%-247.5% on 3701.30.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    extra = ["csms-69326983", "eo-14389"]
    if c["country"] in ("Japan", "China"):
        extra.append("adcvd-alpp-order")
    if c["country"] == "Brazil":
        extra.append("csms-69302472")
    if c["country"] == "Any other country":
        extra += ["procl-10523", "procl-10522"]
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].insert(-1, sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Informational materials: on headings 3704, 3705 and 3706 — the Chapter 37 headings CBP's guidance on the identically "
    "worded IEEPA exception lists — the \"informational materials\" totals assume the goods are entered under 9903.05.92 "
    "(and, for Brazil, 9903.05.09) and the \"not informational materials\" totals assume no claim. Unexposed plates, film and paper (3701-3703) and photographic chemicals "
    "(3707) are not treated as informational materials and show the Section 301 duty. CBP decides whether a product qualifies.",
    "Section 232 on 3701.30: the totals assume the plates contain aluminum at 15% or more of their weight, not made from "
    "U.S.-smelted aluminum (9903.82.09, 25%). Plates without aluminum, steel or copper (9903.82.01) or under 15% (9903.82.03) "
    "pay the Section 301 duty instead; the 10% U.S.-aluminum rate (9903.82.06) and the UK 15% rate (9903.82.05) need "
    "documentation and are not applied.",
    "AD/CVD cash deposits on aluminum lithographic printing plates from China and Japan (3701.30, 3701.99.60) are company-"
    "specific and not included; see Tariff updates.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Not in the grid: entry rules — TSCA certification for photographic chemicals, FDA device registration for medical X-ray "
    "film, DOT hazmat rules — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 19, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 37 "
    "code is on the note 52(b) general list, the 52(c)-(e) product lists or any note 52(j) country list, the note 50 Brazil "
    "lists, the Canada Section 338 lists (note 51(b)) or the 2024 China increases (note 31). Note 20(f) puts all 61 lines on "
    "China List 3 (9903.88.03); the two China exclusions naming a Chapter 37 product (PET photoresist film, 3702.44.0160) are "
    "marked expired. Note 16(c)(vi) lists 3701.30.00 as a derivative aluminum article; note 19(k) lists 3701.30.0000 for the "
    "Russian aluminum duty (9903.85.68); note 30(b) puts 3701.30, 3701.91, 3702.31.01 and 3703.90.30 under 9903.90.08. Heading "
    "9903.05.92 (and 9903.05.09 for Brazil) exempts informational materials; CBP's guidance on the identically worded IEEPA "
    "exception lists headings 3704, 3705 and 3706."
)
ia_ids = {sid for c in ia["countries"] for sid in c["rule"]["sourceIds"]}
add_sources(ia, sorted(ia_ids | {"cbp-ieepa-faq", "csms-67834313", "procl-11012", "procl-11032", "adcvd-alpp-order"}))

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Photographic Film, Plates & Chemicals (HTS Ch. 37): Entry Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Photographic Film, Printing Plates & Photo Chemicals: TSCA, FDA, AD/CVD, Section 232 & Ways to Lower Duty (HTS Ch. 37) | KoalaGains"
te["seo"]["shortDescription"] = (
    "How to import Chapter 37 goods: claim 9903.05.92 for exposed film, USMCA and FTA claims, Chapter 98 provisions for "
    "educational films and U.S. film exposed abroad, metal-content headings for 3701.30 plates, AD/CVD scope — plus TSCA, "
    "FDA, hazmat and marking rules."
)
te["seo"]["keywords"] = [
    "HTS Chapter 37",
    "Tariff Engineering",
    "importing photographic chemicals TSCA",
    "x-ray film FDA import",
    "9903.05.92 informational materials",
    "aluminum printing plates antidumping scope",
    "9817.00.40 educational films",
    "USMCA rule of origin chapter 37",
]
te["intro"] = (
    "Base rates in Chapter 37 are small; the extra duties are not. The levers that matter: enter **exposed film** (3704-3706) "
    "as **informational materials** under 9903.05.92; claim **USMCA** or another FTA where the goods qualify; use a **Chapter "
    "98** provision for educational films, film for libraries and religious institutions, or U.S. film exposed abroad; for "
    "**3701.30** plates, document the **metal content**, since plates without aluminum or under 15% aluminum by weight pay no "
    "Section 232 duty; and check whether a plate falls inside the **AD/CVD orders** on aluminum lithographic printing plates "
    "from China and Japan.\n\n"
    "Entry rules: photographic chemicals need a **TSCA certification** and often **hazmat** shipping papers; medical **X-ray "
    "film** is an FDA device whose foreign maker must be registered; every article must be **marked** with its country of "
    "origin; and CBP can detain **piratical copies** of copyrighted films and seize obscene matter."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "info-materials",
        "title": "Enter exposed film as informational materials under 9903.05.92 (and 9903.05.09 for Brazil)",
        "saves": "The whole 10%-12.5% 2026 Section 301 duty, and for Brazil the 25% Brazil duty too",
        "appliesTo": "Exposed film of headings 3704, 3705 and 3706 — developed microfilm and microfiche, slides, negatives, "
        "motion-picture film — from any of the 60 economies or Brazil",
        "document": "Report 9903.05.92 (and 9903.05.09 for Brazil) on the entry line with the Chapter 37 number, and keep a "
        "description showing the film carries images, text or sound.",
        "caveat": "Not for unexposed film, plates, paper or chemicals (3701-3703, 3707), which CBP's list does not name. It does "
        "not lift China's 25% List 3 duty, Russia's rates or the Nicaragua duty from 2027. CBP decides whether goods are "
        "informational materials; a heading on its list means goods may qualify, not that every product does.",
        "citations": [
            {"label": "HTSUS 9903.05.92, 9903.05.09 (U.S. notes 50, 52)", "url": CH99},
            {"label": "CBP CSMS # 69326983 (Section 301, 60 economies)", "url": "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887"},
            {"label": "CBP IEEPA FAQ: what are informational materials", "url": "https://www.cbp.gov/trade/programs-administration/trade-remedies/IEEPA-FAQ"},
            {"label": "50 U.S.C. 1702(b)(3)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title50/html/USCODE-2024-title50-chap35-sec1702.htm"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on film, plates and chemicals made in Canada or Mexico",
        "saves": "The 10% Section 301 duty for Canada or Mexico, and the base rate (up to 3.7%)",
        "appliesTo": "All 61 lines. 3701-3703: a change from any heading outside 3701-3703, so coating film base or paper in "
        "Canada or Mexico qualifies but slitting or cutting imported jumbo rolls does not; 3704-3706: a change from any other "
        "heading; 3707: a change of subheading, or a chemical reaction in a USMCA country",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the information "
        "listed in 19 CFR 182.12.",
        "caveat": "USMCA does not remove the 25% Section 232 duty on 3701.30 plates (U.S. note 16(b)). The USMCA was not renewed "
        "at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": f"{ECFR}/title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (Chapter 37 rules; chapters 28-38 chemical-reaction rule)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 52(g)-(h)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA rate on 3.7%, 3.1%, 2.8%, 3% and 1.4% lines",
        "saves": "The base rate (up to 3.7%) for FTA partners whose Section 301 duty is added on top of it, such as Singapore, "
        "Australia, Chile, Colombia, Israel, Morocco and Peru",
        "appliesTo": "The 39 dutiable lines (3701.10, 3701.20, 3701.91, most of 3702 and 3703, 3706.10.30, 3707.10); instant "
        "print film (3701.20) is also Free for Japan (SPI JP)",
        "document": "The SPI on the entry line and the origin records each agreement requires (19 CFR part 10 and part 182).",
        "caveat": "For Japan, South Korea, the EU, Taiwan and Switzerland the Section 301 rate is a total that replaces a lower "
        "base rate, so an FTA claim does not lower what they pay unless the goods are also informational materials. GSP has "
        "been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Notes 3(c) and the FTA notes", "url": GN},
            {"label": "HTSUS Chapter 37 (Special column)", "url": CH37},
        ],
    },
    {
        "id": "chapter-98",
        "title": "Use a Chapter 98 provision where the film or the importer qualifies",
        "saves": "The base rate and the 2026 Section 301 and Brazil duties, which do not apply to goods properly entered under "
        "Chapter 98 (other than 9802.00.40-.60 and 9802.00.80)",
        "appliesTo": "Exposed and developed film, microfilm and slides for education, libraries, religious institutions and "
        "government; U.S.-made film exposed abroad; U.S. goods returned",
        "document": "The Chapter 98 number on the entry line, plus what the provision requires — for 9817.00.40-.44 a U.S. "
        "Department of State certificate that the materials are educational, scientific or cultural (19 CFR 10.121).",
        "caveat": "Each provision has conditions and CBP must agree the entry is appropriate. Chapter 98 entries still owe "
        "Section 232 duty on 3701.30 (U.S. note 16(b)) and any AD/CVD.",
        "provisions": [
            {"code": "9802.00.20", "rate": "Free", "text": "Photographic films and dry plates made in the U.S. and exposed abroad (not motion-picture film for commercial use)"},
            {"code": "9817.00.40", "rate": "Free", "text": "Developed film, motion-picture film, slides and transparencies certified as visual or auditory materials (Beirut Agreement)"},
            {"code": "9817.00.42", "rate": "Free", "text": "Microfilm, microfiches and holograms certified as visual or auditory materials"},
            {"code": "9817.00.44", "rate": "Free", "text": "Recorded motion-picture films certified as visual or auditory materials"},
            {"code": "9810.00.30", "rate": "Free", "text": "Exposed photographic and motion-picture films for public libraries and nonprofit educational, scientific or literary institutions"},
            {"code": "9810.00.05", "rate": "Free", "text": "Exposed photographic films for an institution established solely for religious purposes"},
            {"code": "9809.00.10", "rate": "Free", "text": "Public documents of a foreign government or international organization, incl. microfilm and developed film"},
            {"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned without having been advanced in value abroad"},
        ],
        "citations": [
            {"label": "HTSUS Chapter 98 (subchapters I, II, IX, X, XVII)", "url": CH98},
            {"label": "19 CFR 10.121", "url": f"{ECFR}/title-19/section-10.121"},
            {"label": "HTSUS Ch. 99, U.S. notes 16(b), 50(a), 52(a)", "url": CH99},
        ],
    },
    {
        "id": "metal-content",
        "title": "Document the metal content of 3701.30 plates",
        "saves": "The 25% Section 232 duty — none for plates without aluminum, steel or copper (9903.82.01) or with metal under "
        "15% of the weight (9903.82.03); 10% instead of 25% with at least 85% U.S.-smelted aluminum (9903.82.06)",
        "appliesTo": "3701.30.00.00 only: photopolymer, polyester or other non-aluminum plates and film over 255 mm, and plates "
        "made with U.S. aluminum",
        "document": "Report the 9903.82 heading that fits and the metal content information CBP requires; keep mill or "
        "supplier records of the aluminum's weight share and where it was smelted and cast.",
        "caveat": "Plates up to 255 mm (3701.99) are not on the Section 232 list at all. Aluminum lithographic plates are at least "
        "90% aluminum, so they pay 25%. Without the 232 duty, the 2026 Section 301 duty applies instead.",
        "citations": [
            {"label": "HTSUS Ch. 99, U.S. note 16(c)(vi), (e); 9903.82.01, .03, .06, .09", "url": CH99},
            {"label": "CBP CSMS # 68253075 (Section 232 aluminum, steel, copper)", "url": src("csms-68253075")["url"]},
            {"label": "Proclamation 11032 (91 FR 34085)", "url": src("procl-11032")["url"]},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check the AD/CVD scope before buying plates from China or Japan",
        "saves": "Antidumping deposits of 91.83%-317.43% and countervailing deposits of 35.66%-229.54%",
        "appliesTo": "Printing plates of 3701.30, 3701.99.30 and 3701.99.60.60 from China or Japan; plates whose substrate is "
        "not aluminum (rubber, plastic, photopolymer) are excluded from the orders",
        "document": "A scope ruling request to Commerce (19 CFR 351.225) when it is unclear; the substrate specification for "
        "the entry file.",
        "caveat": "The written scope decides, not the HTS number. Commerce ruled on November 24, 2025 that Miraclon's "
        "flexographic photopolymer plates are outside the Japan order. Plates coated in China or Japan and cut or imaged in a "
        "third country stay in scope.",
        "citations": [
            {"label": "Order: 89 FR 92624 (A-570-156, C-570-157, A-588-881)", "url": ALPP_ORDER_URL},
            {"label": "Scope rulings notice: 91 FR 12342", "url": NEW_SOURCES["ita-scope-2026-03"]["url"]},
            {"label": "19 CFR 351.225", "url": f"{ECFR}/title-19/section-351.225"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling where the line decides the duty",
        "saves": "Section 232 (3701.30 vs 3701.99), the AD/CVD scope, or a wrong chapter altogether",
        "appliesTo": "Plates near the 255 mm boundary, photomask blanks (3701.99.60.60), photoresists and toner (3707.90.32), "
        "and papers that are not sensitized (inkjet photo paper is chapter 48)",
        "document": "A ruling request to CBP with a sample or full description (19 CFR 177.2).",
        "caveat": "Classification follows the goods, not the duty: a plate with any side over 255 mm is 3701.30 whatever its use.",
        "citations": [
            {"label": "19 CFR 177.2", "url": f"{ECFR}/title-19/section-177.2"},
            {"label": "CBP HQ H264769 (photomask blanks, 3701.99.6060)", "url": "https://rulings.cbp.gov/ruling/H264769"},
            {"label": "CBP HQ W967818 (photoresists, 3707.90.3290)", "url": "https://rulings.cbp.gov/ruling/W967818"},
            {"label": "CBP NY I84363 (aluminum imagesetter plates, 3701.30.0000)", "url": "https://rulings.cbp.gov/ruling/I84363"},
        ],
    },
]
te["rules"] = [
    {
        "id": "tsca", "agency": "EPA / CBP",
        "title": "TSCA import certification for chemical substances and mixtures: positive (complies with TSCA) or negative (not subject), filed before release",
        "citations": [
            {"label": "19 CFR 12.121", "url": f"{ECFR}/title-19/section-12.121"},
            {"label": "40 CFR 707.20", "url": f"{ECFR}/title-40/section-707.20"},
        ],
    },
    {
        "id": "hazmat", "agency": "U.S. DOT (PHMSA)",
        "title": "Flammable, corrosive or toxic photographic chemicals listed in the Hazardous Materials Table: hazmat shipping papers, marking, labeling and packaging",
        "citations": [{"label": "49 CFR 172.101", "url": f"{ECFR}/title-49/section-172.101"}],
    },
    {
        "id": "fda-xray", "agency": "FDA",
        "title": "Medical X-ray film is a Class I device (radiographic film): the foreign maker must register and list it with FDA",
        "citations": [
            {"label": "21 CFR 892.1840", "url": f"{ECFR}/title-21/section-892.1840"},
            {"label": "21 CFR 807.40", "url": f"{ECFR}/title-21/section-807.40"},
        ],
    },
    {
        "id": "s232-entry", "agency": "CBP",
        "title": "Section 232 on 3701.30: report 9903.82.09 (or .01, .03, .05, .06; 9903.85.68 for Russian aluminum) with the Chapter 37 line; duty on the full value, on top of any FTA rate",
        "citations": [
            {"label": "HTSUS Ch. 99, U.S. note 16", "url": CH99},
            {"label": "CBP CSMS # 68253075", "url": src("csms-68253075")["url"]},
        ],
    },
    {
        "id": "adcvd", "agency": "Commerce / CBP",
        "title": "Antidumping and countervailing duty cash deposits on aluminum lithographic printing plates from China and Japan (entry type 03)",
        "citations": [
            {"label": "89 FR 92624 (orders)", "url": ALPP_ORDER_URL},
            {"label": "19 CFR 351.211", "url": f"{ECFR}/title-19/section-351.211"},
        ],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on each article or, where excepted, its outermost container",
        "citations": [
            {"label": "19 CFR 134.11", "url": f"{ECFR}/title-19/section-134.11"},
            {"label": "19 CFR 134.33 (J-list)", "url": f"{ECFR}/title-19/section-134.33"},
        ],
    },
    {
        "id": "piratical", "agency": "CBP",
        "title": "Piratical copies of copyrighted works recorded with CBP (films, photographs) can be detained and seized",
        "citations": [{"label": "19 CFR 133.42", "url": f"{ECFR}/title-19/section-133.42"}],
    },
    {
        "id": "prohibited-matter", "agency": "CBP",
        "title": "Obscene films and photographs and matter urging treason or insurrection are prohibited; seized matter goes to forfeiture",
        "citations": [
            {"label": "19 U.S.C. 1305", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1305.htm"},
            {"label": "19 CFR 12.40", "url": f"{ECFR}/title-19/section-12.40"},
        ],
    },
    {
        "id": "aphis-packaging", "agency": "USDA APHIS",
        "title": "Wood pallets and crates must be ISPM 15 treated and marked",
        "citations": [{"label": "7 CFR 319.40-3", "url": f"{ECFR}/title-7/section-319.40-3"}],
    },
]
GROUP_NOTES = {
    "3701": "3.7% or Free. 3701.30 plates pay 25% Section 232 unless they hold no or little metal; aluminum lithographic plates from China and Japan also pay AD/CVD. Medical X-ray film needs FDA device registration.",
    "3702": "Mostly 3.7%. Unexposed film is not informational material, so the 2026 Section 301 duty applies; China pays 25% List 3 on top.",
    "3703": "3.7%, 3.1% or 2.8%. Silver halide paper only — inkjet photo paper is chapter 48. No informational-materials claim.",
    "3704": "Free. Exposed, undeveloped film may be entered as informational materials (9903.05.92).",
    "3705": "Free. Developed microfilm, microfiche and slides: claim 9903.05.92, or a Chapter 98 provision for educational or institutional use.",
    "3706": "Free (1.4% on 35 mm sound recordings). Claim 9903.05.92 or 9817.00.44; copyrighted films can be detained as piratical copies.",
    "3707": "Free or 3%. TSCA certification on every entry; many developers and fixers are hazmat. Photoresists and toner are 3707.90.32.",
}
GROUP_RULES = {
    "3701": ["s232-entry", "adcvd", "fda-xray", "cbp-marking", "aphis-packaging"],
    "3702": ["fda-xray", "cbp-marking", "aphis-packaging"],
    "3703": ["cbp-marking", "aphis-packaging"],
    "3704": ["prohibited-matter", "cbp-marking", "aphis-packaging"],
    "3705": ["piratical", "prohibited-matter", "cbp-marking", "aphis-packaging"],
    "3706": ["piratical", "prohibited-matter", "cbp-marking", "aphis-packaging"],
    "3707": ["tsca", "hazmat", "cbp-marking", "aphis-packaging"],
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    g["ruleIds"] = GROUP_RULES[h]
DUTIABLE_FTA = ("3701.10", "3701.20", "3701.91", "3702.10", "3702.31", "3702.32", "3702.39", "3702.41", "3702.42",
                "3702.43", "3702.44", "3702.52", "3702.53", "3702.54", "3702.96", "3702.98", "3703", "3706.10.30", "3707.10")
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    ids = []
    if hts.startswith("3701.30"):
        ids += ["s232-entry", "adcvd"]
    elif hts.startswith(("3701.99.30", "3701.99.60.60")):
        ids.append("adcvd")
    if hts.startswith(("3701.10.00.30", "3702.10.00.30")):
        ids.append("fda-xray")
    if h == "3707":
        ids += ["tsca", "hazmat"]
    if h in ("3705", "3706"):
        ids.append("piratical")
    if h in ("3704", "3705", "3706"):
        ids.append("prohibited-matter")
    ids += ["cbp-marking", "aphis-packaging"]
    ln["ruleIds"] = ids
    levers = []
    if h in ("3704", "3705", "3706"):
        levers.append("info-materials")
    levers.append("usmca")
    if hts.startswith(DUTIABLE_FTA):
        levers.append("fta")
    if h in ("3705", "3706") or hts.startswith("3704"):
        levers.append("chapter-98")
    if hts.startswith("3701.30"):
        levers += ["metal-content", "adcvd-scope"]
    elif hts.startswith(("3701.99.30", "3701.99.60.60")):
        levers.append("adcvd-scope")
    if h in ("3701", "3703", "3707"):
        levers.append("ruling")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Whether goods are informational "
    "materials is decided by CBP, and whether a plate is within an AD/CVD order by Commerce; check the CSMS guidance and the "
    "order text before filing."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 37 FAQ: Tariffs on Photographic Film, Printing Plates, Photo Paper & Toner"
fc["seo"]["title"] = "HTS Chapter 37 FAQ 2026: HS Codes for Camera Film, X-Ray Film, Polaroid Film, Printing Plates, Photo Paper, Toner | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about photographic goods imports: HS codes 3701, 3701.30 and 3707.90, camera and 35 mm "
    "film, X-ray film, Polaroid film, printing plates, photo paper, toner, microfilm, the informational-materials exemption "
    "and tariffs on films."
)
fc["seo"]["keywords"] = [
    "hts chapter 37",
    "hs code 3701.30",
    "hs code 3707.90",
    "hs code for photographic film",
    "hs code for 35mm film",
    "hs code for x ray film",
    "hs code for polaroid film",
    "hs code for printing plates",
    "hs code for photo paper",
    "hs code for toner powder",
    "hs code for microfilm",
    "informational materials exemption tariffs",
    "tariffs on films made outside us",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing photographic film, plates, paper and chemicals into the "
    "U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 37 base rates are low and unchanged since January 2025: 22 of 61 lines Free, the rest 1.4%-3.7%.",
    "Since July 24, 2026 the 2026 Section 301 duty (10% or 12.5%; 12.5% in total for Japan) applies to nearly every line; only exposed film of 3704-3706 can be entered duty-free of it as informational materials (9903.05.92).",
    "China pays 25% Section 301 List 3 on all 61 lines plus the 12.5% 2026 duty — and its share of U.S. imports fell to under 1% in 2025.",
    "Plates over 255 mm (3701.30) pay 25% Section 232 on full value since June 8, 2026, and aluminum lithographic printing plates from China and Japan carry AD/CVD deposits of 35.66% to 317.43%.",
    "Photographic chemicals (3707), including photoresists and toner, need a TSCA certification; medical X-ray film needs FDA device registration.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "what-is-ch37",
        "question": "What does HTS Chapter 37 cover?",
        "searchedAs": ["hts chapter 37"],
        "answer": "Photographic and cinematographic goods that are light-sensitive or already exposed: plates and sheet film (3701), roll film (3702), photographic paper (3703), exposed but undeveloped film (3704), developed plates and film such as microfilm (3705), motion-picture film (3706) and photographic chemicals (3707). It has 61 tariff lines; 22 are Free and the rest pay 1.4% to 3.7%. Cameras are chapter 90.",
        "link": "",
    },
    {
        "id": "hs-3701",
        "question": "What is HS code 3701 and 3701.30?",
        "searchedAs": ["hs code 3701", "hs code 3701.30", "hs code 3701.10"],
        "answer": "Heading 3701 is unexposed photographic plates and film in the flat: 3701.10 X-ray film (3.7%), 3701.20 instant print film (3.7%), 3701.30 plates and film with any side over 255 mm (Free) and 3701.91/3701.99 smaller color and other plates (3.7% or Free). 3701.30 holds most aluminum printing plates; since June 8, 2026 it pays 25% Section 232 on full value from most countries.",
        "link": "",
    },
    {
        "id": "hs-camera-film",
        "question": "What is the HS code for camera film and 35 mm film?",
        "searchedAs": ["hs code for photographic film", "hs code for camera film", "hs code for 35mm film", "film camera hs tariff code", "film roll hs code"],
        "answer": "Unexposed roll film is heading 3702. 35 mm color negative film in rolls up to 30 m is 3702.54.00.30, 35 mm color slide film 3702.53.00.30, and black-and-white film up to 35 mm and 30 m 3702.96.00.00 — all 3.7%. Exposed film is 3704 and developed film 3705. Film cameras are not chapter 37; they are classified in heading 9006.",
        "link": "",
    },
    {
        "id": "polaroid-instant",
        "question": "What is the HS code and tariff for Polaroid and Instax instant film?",
        "searchedAs": ["hs code for polaroid film", "polaroid film tariffs", "instax film tariff"],
        "answer": "Instant print film in packs is 3701.20 (3.7%; color 3701.20.00.30). Unexposed film is not informational material, so the 2026 Section 301 duty applies: 12.5% in total from Japan (Free base under the U.S.-Japan agreement), 10% in total from the EU, 41.2% from China (3.7% + 25% + 12.5%) and 3.7% from countries outside the 60 economies.",
        "link": "industry-areas",
    },
    {
        "id": "xray-film",
        "question": "What is the HS code for X-ray film?",
        "searchedAs": ["hs code for x ray film"],
        "answer": "X-ray film in the flat is 3701.10 and in rolls 3702.10, both 3.7%; medical film other than dental is statistical suffix .30. Medical X-ray film is a Class I FDA device (21 CFR 892.1840), so the foreign manufacturer must register and list it with FDA. X-ray film viewers are not chapter 37.",
        "link": "tariff-engineering",
    },
    {
        "id": "printing-plates",
        "question": "What is the HS code for printing plates?",
        "searchedAs": ["hs code for printing plates", "hs code for photopolymer printing plates", "hs code for flexographic printing plate", "printing plates hs code"],
        "answer": "Light-sensitive printing plates are heading 3701: 3701.30.00.00 when any side exceeds 255 mm and 3701.99.60.60 when smaller, both Free. CBP has classified aluminum imagesetter plates in 3701.30 and photopolymer plate material in 3701.99.60. Plates that are not light-sensitive, such as plates prepared for printing under heading 8442, fall outside chapter 37.",
        "link": "",
    },
    {
        "id": "alpp-adcvd",
        "question": "Are there antidumping duties on aluminum lithographic printing plates?",
        "searchedAs": ["aluminum lithographic printing plates", "aluminum offset printing plates", "aluminium lithographic offset printing plates"],
        "answer": "Yes, since November 22, 2024. Antidumping deposits are 91.83% for Fujifilm and other Japanese exporters (160.11% Miraclon), 115.84% for Fujifilm Printing Plate (China) and 317.43% for other Chinese exporters; Chinese plates also owe countervailing duty of 35.66% (229.54% Shanghai National Ink). The ITC is reconsidering its injury finding on a 2026 court remand; no revocation has been published, so deposits continue. Section 232 adds 25% on 3701.30 plates.",
        "link": "tariff-updates",
    },
    {
        "id": "photo-paper",
        "question": "What is the HS code for photo paper?",
        "searchedAs": ["hs code for photo paper", "hs code for photographic paper", "photo paper tariff code", "glossy photo paper hs code", "inkjet photo paper hs code"],
        "answer": "Light-sensitive (silver halide) photographic paper is heading 3703: 3.7% for silver halide papers and 3.1% or 2.8% for others. Inkjet photo paper is not sensitized, so it is not chapter 37: CBP classified glossy and satin inkjet photo papers in heading 4810 (ruling N017451).",
        "link": "",
    },
    {
        "id": "toner",
        "question": "What is the HS code for toner powder?",
        "searchedAs": ["hs code for toner", "hs code for toner powder", "printer toner powder hs code", "hs code for toner cartridge"],
        "answer": "CBP classifies copier toner powder in 3707.90.32.90, a Free line (ruling N019393); photoresists are in the same line (HQ W967818). Toner cartridges are printer parts of heading 8443. From Japan, toner pays 12.5% in total under the 2026 Section 301 action; from China 37.5%. Chemical toner entries need a TSCA certification.",
        "link": "tariff-engineering",
    },
    {
        "id": "hs-3707",
        "question": "What does HS code 3707.90 cover?",
        "searchedAs": ["hs code 3707.90", "hs code 3707"],
        "answer": "Chemical preparations for photographic uses other than sensitizing emulsions (3707.10, 3%), and unmixed products put up in measured portions or for retail sale: acid violet 19 (3707.90.31), other preparations such as developers, fixers, color couplers, photoresists and toner (3707.90.32) and unmixed products (3707.90.60). All Free. 3707.90 was $495M of 2025 imports, the chapter's largest line.",
        "link": "",
    },
    {
        "id": "microfilm",
        "question": "What is the HS code for microfilm?",
        "searchedAs": ["hs code for microfilm"],
        "answer": "Developed microfilm and microfiche are 3705.00.00.00 (Free); unexposed microfilm stock is 3702.32.01.30 (3.7%). Developed microfilm can be entered as informational material under 9903.05.92, removing the 2026 Section 301 duty, and microfilm certified as educational can enter under 9817.00.42.",
        "link": "tariff-engineering",
    },
    {
        "id": "info-materials",
        "question": "What is the informational materials exemption from tariffs?",
        "searchedAs": ["informational materials exemption", "informational materials exemption tariffs", "informational materials exemption ieepa"],
        "answer": "IEEPA bars regulating imports of informational materials (50 U.S.C. 1702(b)(3)), so the 2025 IEEPA tariffs excluded them, and the 2026 Section 301 and Brazil actions repeat the exemption (9903.05.92, 9903.05.09). In Chapter 37 CBP lists headings 3704, 3705 and 3706 — exposed film — as goods that may qualify; blank film, plates, paper and chemicals do not. China's 25% List 3 duty has no such exemption.",
        "link": "tariff-updates",
    },
    {
        "id": "film-tariffs",
        "question": "Is there a tariff on films made outside the U.S.?",
        "searchedAs": ["tariffs on films", "tariffs on films made outside us", "tariffs on movies made outside us", "are movies exempt from tariffs"],
        "answer": "As of October 13, 2026 no tariff heading targets motion pictures: the 2026 Revision 21 schedule has no Chapter 99 duty on films as such. Exposed motion-picture film (3706) is Free, or 1.4% for 35 mm sound recordings, and as informational material it can be entered under 9903.05.92 free of the 2026 Section 301 duty. China's 25% List 3 duty still applies.",
        "link": "tariff-updates",
    },
]

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
