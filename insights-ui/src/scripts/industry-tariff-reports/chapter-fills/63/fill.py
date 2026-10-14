"""Fill the writer parts of the generated Chapter 63 content file (made-up textile articles).

Usage: python3 fill.py <generated.json> <out.json>   (run.sh does generate -> fill -> compact -> prettier -> validate)
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = sys.argv[1], sys.argv[2]
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH63 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2063"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(SRC))
pool = json.load(open(os.path.join(HERE, "pool.json")))
from trade_text import trade_facts  # noqa: E402  (numbers computed from the generated understandIndustry)

T = trade_facts(d)


def fr(dn, citation, published, title, url, document="Notice (Commerce/ITA)"):
    return {
        "id": "fr-" + dn.lower(),
        "publisher": "Federal Register",
        "citation": citation,
        "document": document,
        "title": title,
        "signed": None,
        "published": published,
        "url": url,
    }


NEW = [
    fr("E8-18196", "73 FR 45941", "2008-08-07", "Notice of Antidumping Duty Order: Laminated Woven Sacks From the People's Republic of China",
       "https://www.federalregister.gov/documents/2008/08/07/E8-18196/notice-of-antidumping-duty-order-laminated-woven-sacks-from-the-peoples-republic-of-china"),
    fr("E8-18195", "73 FR 45955", "2008-08-07", "Laminated Woven Sacks From the People's Republic of China: Countervailing Duty Order",
       "https://www.federalregister.gov/documents/2008/08/07/E8-18195/laminated-woven-sacks-from-the-peoples-republic-of-china-countervailing-duty-order"),
    fr("2025-03183", "90 FR 10809", "2025-02-27", "Laminated Woven Sacks From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders",
       "https://www.federalregister.gov/documents/2025/02/27/2025-03183/laminated-woven-sacks-from-the-peoples-republic-of-china-continuation-of-antidumping-and"),
    fr("2019-11579", "84 FR 25753", "2019-06-04", "Laminated Woven Sacks From the Socialist Republic of Vietnam: Antidumping Duty and Countervailing Duty Orders",
       "https://www.federalregister.gov/documents/2019/06/04/2019-11579/laminated-woven-sacks-from-the-socialist-republic-of-vietnam-antidumping-duty-and-countervailing"),
    fr("2024-28022", "89 FR 94707", "2024-11-29", "Laminated Woven Sacks From the Socialist Republic of Vietnam: Continuation of Antidumping Duty and Countervailing Duty Orders",
       "https://www.federalregister.gov/documents/2024/11/29/2024-28022/laminated-woven-sacks-from-the-socialist-republic-of-vietnam-continuation-of-antidumping-duty-and"),
    fr("2010-21975", "75 FR 53632", "2010-09-01", "Narrow Woven Ribbons With Woven Selvedge From Taiwan and the People's Republic of China: Antidumping Duty Orders",
       "https://www.federalregister.gov/documents/2010/09/01/2010-21975/narrow-woven-ribbons-with-woven-selvedge-from-taiwan-and-the-peoples-republic-of-china-antidumping"),
    fr("2010-21978", "75 FR 53642", "2010-09-01", "Narrow Woven Ribbons With Woven Selvedge From the People's Republic of China: Countervailing Duty Order",
       "https://www.federalregister.gov/documents/2010/09/01/2010-21978/narrow-woven-ribbons-with-woven-selvedge-from-the-peoples-republic-of-china-countervailing-duty"),
    fr("2022-05634", "87 FR 15205", "2022-03-17", "Narrow Woven Ribbons With Woven Selvedge From the People's Republic of China and Taiwan: Continuation of Antidumping Duty Orders and Countervailing Duty Order",
       "https://www.federalregister.gov/documents/2022/03/17/2022-05634/narrow-woven-ribbons-with-woven-selvedge-from-the-peoples-republic-of-china-and-taiwan-continuation"),
    fr("2026-18182", "91 FR 56857", "2026-09-04", "Narrow Woven Ribbons with Selvedge From Taiwan: Final Results of Antidumping Duty Administrative Review; 2023-2024",
       "https://www.federalregister.gov/documents/2026/09/04/2026-18182/narrow-woven-ribbons-with-selvedge-from-taiwan-final-results-of-antidumping-duty-administrative"),
    {
        "id": "fr-2011-6253",
        "publisher": "Federal Register",
        "citation": "76 FR 14575",
        "document": "Final rule (CBP Dec. 11-09)",
        "title": "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer identification code required)",
        "signed": None,
        "published": "2011-03-17",
        "url": "https://www.federalregister.gov/documents/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products",
    },
]
NEW_SOURCES = {s["id"]: s for s in NEW}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
CANADA_338 = "6303.92.20 (synthetic curtains), 6305.33.00 (polyethylene/polypropylene sacks), 6306.12.00 (synthetic tarpaulins), 6306.19.21 (tarpaulins of other textiles) and 6307.90.98 (other made-up articles)"
NOT_4A = (
    "electric and synthetic blankets (6301.10, 6301.40, 6301.90), man-made-fibre bed linen (6302.22, 6302.32), cotton damask "
    "table linen (6302.51.10), man-made-fibre towels (6302.93), some curtains and bedspreads (6303.92.10, 6304.11.20–.30, "
    "6304.19.15–.20, 6304.93), synthetic tarpaulins and other tents (6306.12, 6306.29), 6306.90, lifejackets (6307.20), pet "
    "toys (6307.90.75) and surgical and cotton pile towels (6307.90.89)"
)

LABELS = {
    "6301": ("Blankets and traveling rugs (incl. electric blankets)", "Blankets"),
    "6302": ("Bed, table, toilet and kitchen linen (sheets, pillowcases, towels)", "Bed & bath linen"),
    "6303": ("Curtains, drapes and interior blinds", "Curtains"),
    "6304": ("Bedspreads and other furnishing articles (not stuffed)", "Bedspreads & furnishings"),
    "6305": ("Sacks and bags for packing goods (incl. FIBCs, woven PP sacks)", "Sacks & bags"),
    "6306": ("Tarpaulins, awnings, tents, sails, camping goods", "Tarps & tents"),
    "6307": ("Other made-up articles (cleaning cloths, masks, flags, pet toys)", "Other made-ups"),
    "6308": ("Needlecraft sets (fabric and yarn for rugs, tapestries)", "Needlecraft sets"),
    "6309": ("Worn clothing and other worn textile articles", "Worn clothing"),
    "6310": ("Rags, scrap twine, cordage and rope", "Rags & scrap"),
}

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 63: Made-Up Textile Articles — Bed Linen, Towels, Blankets, Curtains, Tarps, Sacks & Worn Clothing Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 63 Tariff Rates 2026: Bed Sheets, Towels, Blankets, Curtains, Tarps & Used Clothing Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 229 HTS Chapter 63 lines — blankets, bed sheets, pillowcases, towels, curtains, sacks, "
    "tarpaulins, tents, face masks and worn clothing — with General, FTA and Column 2 rates and the 2026 extra duty for "
    "China, India, Pakistan, Vietnam and others."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 63",
    "HTS Chapter 63 tariff rates",
    "HTS Chapter 63 import duty rates",
    "bed sheets hs code",
    "towel hs code",
    "cotton bath towels import duty",
    "HTS 6302 bed linen customs duty",
    "hs code 6307.90",
    "used clothing hs code",
    "worn clothing import duty",
    "tarpaulin hs code",
    "China Section 301 textile tariffs",
]
ov["intro"] = (
    "Chapter 63 covers textile goods that are **made up** — cut, sewn or finished ready for use: **blankets** (6301), **bed, "
    "table, toilet and kitchen linen** such as sheets, pillowcases and towels (6302), **curtains** (6303), bedspreads and "
    "other furnishings (6304), **sacks and bags for packing goods** (6305), **tarpaulins, tents and sails** (6306), other "
    "made-up articles from cleaning cloths to face masks and flags (6307), needlecraft sets (6308), **worn clothing** "
    "(6309) and rags (6310). Its **229 lines** carry base rates from Free to **20.9%** (embroidered cotton bed linen); "
    "cotton towels are 9.1%–9.2% and most sheets 6.7%–11.4%.\n\n"
    "On top of the base rate, since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%** — "
    "India, Pakistan, Bangladesh and Cambodia 10%, Vietnam and Türkiye 12.5%. **China pays 12.5% plus 7.5%** under List 4A on "
    "most lines, and **62.5%** on textile face masks and respirators. Worn clothing (6309) is exempt from the 2026 Section 301 "
    "duty for every country. Canada pays **50%** under Section 338 on synthetic curtains, plastic-strip sacks, tarpaulins "
    "and 6307.90.98 even with USMCA. " + T["ov_trade"]
)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "6301": (
        "Blankets and traveling rugs by fibre: electric blankets 11.4%, cotton 8.4%, synthetic 8.5%, other 7.2%, wool Free. "
        "Quilts and comforters that are stuffed are not here — they are bedding of heading 9404.",
        ["blanket hs code", "fleece throw blanket", "cotton blanket", "electric blanket", "baby blanket", "wool blanket", "throw hs code"],
    ),
    "6302": (
        "The largest heading: sheets, pillowcases and duvet covers, tablecloths and napkins, bath, beach and kitchen towels. "
        "Rates turn on fibre, print, nap and trim — from 2.5% (napped printed cotton) to 20.9% (embroidered or trimmed cotton, "
        "not napped); cotton terry towels are 9.1%.",
        ["bed sheets", "pillowcase", "duvet cover", "fitted sheet", "bath towel", "beach towel", "kitchen towel", "tablecloth", "napkins", "dish towel"],
    ),
    "6303": (
        "Curtains, drapes, valances and interior blinds of textiles, knitted or woven: 6.4% to 11.3%. Shower curtains of "
        "plastic sheeting are not here (chapter 39); textile shower curtains are.",
        ["curtains", "drapes", "blackout curtains", "sheer curtain", "valance", "textile shower curtain", "curtain hs code"],
    ),
    "6304": (
        "Bedspreads, cushion covers, wall hangings, mattress covers and other furnishings that are not stuffed (stuffed "
        "cushions and pillows go to 9404); 3.2% to 14.9%, with hand-loomed and folklore items at 3.8%.",
        ["bedspread", "cushion cover", "pillow cover", "coverlet", "wall hanging", "mosquito net", "mattress protector"],
    ),
    "6305": (
        "Sacks and bags used to pack and ship goods: jute sacks Free, cotton 6.2%, flexible intermediate bulk containers "
        "(FIBCs) and woven polypropylene or polyethylene sacks 8.4%. Laminated woven sacks from China and Vietnam are under "
        "antidumping and countervailing duty orders. Shopping and tote bags are heading 4202.",
        ["woven polypropylene bags", "FIBC bulk bag", "jumbo bag", "laminated woven sacks", "jute sacks", "sandbags", "flour sack"],
    ),
    "6306": (
        "Tarpaulins, awnings and sunblinds, tents and canopies, sails, air mattresses and other camping goods. Backpacking "
        "tents and sails are Free; synthetic tarps and other synthetic tents 8.8%. Plastic-film tarps are chapter 39.",
        ["tarpaulin", "canvas tarp", "camping tent", "canopy tent", "awning", "backpacking tent", "sails", "air mattress"],
    ),
    "6307": (
        "Everything made up and not named elsewhere: floor and dish cloths, lifejackets, labels, surgical drapes, pet toys, "
        "flags, textile face masks and respirators, and the catch-all 6307.90.98 (7%). Chinese masks and respirators pay a 50% "
        "Section 301 duty.",
        ["hs code 6307.90", "face mask", "N95 respirator", "cleaning cloth", "microfiber cloth", "dog toy", "flag", "lanyard", "lifejacket"],
    ),
    "6308": (
        "Needlecraft sets of woven fabric and yarn for making rugs, tapestries, embroidered tablecloths or similar, put up for "
        "retail sale: 11.4%.",
        ["needlepoint kit", "cross stitch kit", "latch hook kit", "embroidery kit"],
    ),
    "6309": (
        "Worn clothing, blankets, linen, furnishings, footwear and headgear showing appreciable wear and entered in bulk, bales "
        "or sacks (chapter note 3). Free, and exempt from the 2026 Section 301 duty for every country (note 52(b)).",
        ["used clothing", "second hand clothing", "worn clothing", "used clothing bales", "used shoes in bulk"],
    ),
    "6310": (
        "Used or new rags and scrap twine, cordage and rope, sorted or not. Free, except unsorted rags of wool (5.5¢/kg).",
        ["textile rags", "wiping rags", "cotton rags", "textile waste", "scrap rope"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Cotton terry bath towels from Pakistan",
        "line": "6302.60.00.20",
        "body": "Cotton terry towels are 9.1% at the general rate, and Pakistan pays 10% Section 301 (9903.05.62) on top: "
        "**$1,910** on a $10,000 shipment. Pakistan has no exception list, and GSP has been expired since December 31, 2020.",
    },
    {
        "title": "Printed cotton sheets from China",
        "line": "6302.21.90.20",
        "body": "Printed cotton bed linen without trim, not napped, is 6.7%. China adds 7.5% under List 4A (9903.88.15) and "
        "12.5% under the 2026 action (9903.05.31): 26.7% in all, **$2,670** on a $10,000 shipment. The same sheets from India "
        "pay 16.7% ($1,670).",
    },
    {
        "title": "Disposable textile face masks from China",
        "line": "6307.90.98.70",
        "body": "6307.90.98 is 7%. Since January 1, 2026 Chinese textile face masks and respirators pay 50% under the 2024 "
        "four-year review (9903.91.07) — in place of List 4A — plus 12.5% (9903.05.31): 69.5% in all, **$6,950** on $10,000.",
    },
    {
        "title": "Polypropylene tarpaulin from Canada, with a USMCA claim",
        "line": "6306.12.00.00",
        "body": "Synthetic tarpaulins are 8.8%, Free under USMCA, and USMCA also removes Canada's 10% Section 301 duty "
        "(9903.05.93). But 6306.12.00 is on the Section 338 list (U.S. note 51(b)(3), 9903.03.14), whose 50% applies even with "
        "USMCA: **$5,000** on $10,000.",
    },
    {
        "title": "Bales of used clothing from Canada",
        "line": "6309.00.00.10",
        "body": "Worn clothing entered in bulk is Free, and 6309.00.00 is on the general exemption list of the 2026 Section "
        "301 tariff (note 52(b), 9903.05.86) and on Brazil's exemption list (note 50(a)(ii)). A $10,000 shipment from any "
        "country but China pays **$0**; China's List 4A adds 7.5% ($750).",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = T["source"]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line each country ships."
)
ts["topCountries"] = T["topCountries"]
ts["biggestLines"] = T["biggestLines"]
ov["notes"]["chapterNotes"] = (
    "**Note 1.** Subchapter I (headings 6301–6307) applies only to made-up articles, of any textile fabric.\n\n"
    "**Note 2.** Subchapter I does not cover goods of chapters 56 to 62, or worn clothing and other worn articles of heading 6309.\n\n"
    "**Note 3.** Heading 6309 covers only: (a) articles of textile materials — clothing and clothing accessories and parts; "
    "blankets and traveling rugs; bed, table, toilet and kitchen linen; furnishings other than carpets of 5701–5705 and "
    "tapestries of 5805 — and (b) footwear and headgear of any material other than asbestos. They must both **show signs of "
    "appreciable wear** and be **entered in bulk or in bales, sacks or similar packings**.\n\n"
    "**Subheading note 1.** Subheading 6304.20 covers articles of warp-knit fabric impregnated or coated with "
    "alpha-cypermethrin, chlorfenapyr, deltamethrin, lambda-cyhalothrin, permethrin or pirimiphos-methyl (insecticide bed nets).\n\n"
    "**Section XI notes that decide Chapter 63.** Note 7: \"made up\" means, among others, cut other than into squares or "
    "rectangles, finished ready for use without sewing (dusters, towels, tablecloths, blankets), hemmed or with a knotted "
    "fringe, or assembled by sewing. Note 1 sends textile articles of heading 4202 (shopping bags, travel bags), chapter 94 "
    "(stuffed bedding: quilts, pillows, cushions) and chapter 95 (toys) out of Section XI."
)
ov["notes"]["additionalUsNotes"] = (
    "Chapter 63 has no additional U.S. notes of its own; the Section XI notes apply.\n\n"
    "**Section XI additional U.S. note 2.** \"Certified hand-loomed and folklore\" products (6304.99.10, 6304.99.40) are those "
    "certified by an official of the producing country's government under procedures established by USTR.\n\n"
    "**Footnote 1/.** Lines marked 1/ (for example 6301.30, 6302.10, 6302.21) point to heading 9903.90.08: products of Russia "
    "pay 35% in place of the column 2 rate on them.\n\n"
    "**Statistical notes.** The three-digit numbers in brackets (for example 363 cotton terry towels, 666 man-made-fibre "
    "furnishings) are textile category numbers used to monitor shipments."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 63 Tariff Updates: Bed Linen, Towels, Blankets, Tarps & Worn Clothing (2025–2026)"
tu["seo"]["title"] = "Chapter 63 Textile Tariff Updates 2026: Section 301, China List 4A, Face Masks 50%, Canada 338, AD/CVD | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 63 imports since January 2025: unchanged base rates, the end of the IEEPA tariffs and the "
    "Section 122 surcharge, the 2026 Section 301 tariffs on 60 economies, China List 4A and the 50% on masks, Canada's "
    "Section 338 duty and the laminated woven sack orders."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 63 tariff updates",
    "China tariff on textiles",
    "Section 301 textile duties",
    "tariff on textiles from India",
    "Pakistan towel tariff 2026",
    "China face mask tariff 50%",
    "laminated woven sacks antidumping",
    "USMCA textile rules",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 229 Chapter 63 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — up to 50% on Indian sheets and towels — **ended on "
    "February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, "
    "goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; only Jordan's exception list and CAFTA-DR claims "
    "(notes 52(i)–(j)) cover Chapter 63, and worn clothing is exempt everywhere. China keeps List 4A (7.5%) and, since "
    "January 1, 2026, pays **50%** on textile face masks and respirators. Since **August 22, 2026 Canada pays 50%** under "
    "Section 338 on five subheadings, USMCA or not."
)
tu["scope"] = (
    "Measures that reach Chapter 63 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 List 4A, its product exclusions and the 2024 four-year-review rate on "
    "masks, the Canada Section 338 duty, Russia's rates in place of column 2, the Nicaragua Section 301 phase-in, and the "
    "2025–2026 IEEPA and Section 122 duties that have ended. Antidumping and countervailing duty orders on laminated woven "
    "sacks (China, Vietnam) and narrow woven ribbons (China, Taiwan) are explained below; no Section 232 action covers a "
    "Chapter 63 line. For the rate each supplier pays, see Rates by country."
)
IE = {x["id"]: x for x in tu["inEffect"]}
EXEMPT = {
    "cn-section-301": (
        "List 4A (+7.5%, 9903.88.15, since February 14, 2020) covers 75 of the chapter's 99 eight-digit subheadings; the rest — "
        + NOT_4A + " — were on List 4B, which never took effect. The 2026 action adds +12.5% (9903.05.31) on every line but "
        "worn clothing (note 52(b)). N95 and other textile respirators and face masks (6307.90.98.42/.44/.50/.70/.75) pay 50% "
        "under the 2024 four-year review (9903.91.07) instead of List 4A. Four List 4A exclusions (9903.88.69, note "
        "20(vvv)(iv)) run through November 9, 2026: knitted polyester dust covers for mattresses and pillows (6302.10.00.20), "
        "zippered cotton pillow protectors (6302.31.90.40), and instant cold packs and cotton laparotomy sponges "
        "(6307.90.98.91). The IEEPA duties on China ended February 24, 2026.",
        "Most Chinese cotton sheets, towels, blankets and tarps pay 20% on top of the base rate; synthetic blankets, "
        "polyester sheets and synthetic tarps pay 12.5%; masks and respirators 62.5%; worn clothing 7.5%.",
        ["fr-2025-21671", "eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list; only worn clothing (6309) is exempt (note 52(b)). GSP (SPI A, A*), still printed on a "
        "few lines, has been expired since December 31, 2020. The 2025 IEEPA duties (25% reciprocal plus 25% over Russian "
        "oil purchases) ended in February 2026.",
        "Indian sheets, towels and furnishings pay the base rate plus 10%: 16.7% on printed cotton sheets, 19.1% on cotton terry towels.",
        ["cbp-gsp", "eo-14384", "eo-14389"],
    ),
    "pk-section-301": (
        "Pakistan has no exception list; only worn clothing is exempt (note 52(b)). GSP has been expired since December 31, "
        "2020. " + ENDED,
        "Pakistani towels and bed linen pay the base rate plus 10%: 19.1% on cotton terry towels.",
        ["cbp-gsp", "eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 63. Laminated woven sacks from Vietnam (6305.33.00.40/.80) also pay "
        "antidumping and countervailing duties, continued in November 2024. " + ENDED,
        "Vietnamese bedding, curtains and tents pay the base rate plus 12.5%.",
        ["fr-2024-28022", "eo-14389"],
    ),
    "bd-section-301": (
        "Bangladesh's exception list (note 52(j)) names no Chapter 63 subheading. " + ENDED,
        "Bangladeshi towels, bed linen and bags pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "kh-section-301": (
        "Cambodia's exception list (note 52(j)(5), 9903.06.02) names no Chapter 63 subheading. " + ENDED,
        "Cambodian made-ups pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Under USMCA (General Note 11) a Chapter 63 good qualifies "
        "only if its fabric is from the region and it is cut and sewn there. The 2025 IEEPA duty on Mexico (+25%) ended "
        "February 24, 2026.",
        "Mexican made-ups pay nothing extra with a valid USMCA claim; without one, the base rate plus 10%.",
        ["eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on " + CANADA_338 + " applies with or without a USMCA claim. No Chapter 63 line is on the September 29, "
        "2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian made-ups pay nothing extra with USMCA except the five Section 338 subheadings, which pay 50% (60% without "
        "a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "tr-section-301": (
        "Türkiye has no exception list. " + ENDED,
        "Turkish towels and bedding pay the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "eu-section-301": (
        "EU goods pay 10% in total in place of the base rate (note 52(k)), so lines with a base rate of 10% or more (for example "
        "11.3% curtains, 20.9% embroidered cotton sheets) pay only the base rate. The EU exception list (note 52(j)(2)) names no "
        "Chapter 63 subheading; worn clothing is exempt. " + ENDED,
        "Portuguese and other EU sheets and towels pay 10% in total, or the base rate where it is higher.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every line but worn clothing (note 50(a)(ii)); the 2026 action "
        "adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% reciprocal and 40%) ended February 24, 2026.",
        "Brazilian towels and bed linen pay 37.5% on top of the base rate.",
        ["eo-14323", "eo-14389"],
    ),
    "ru-section-301": (
        "Russian goods on 17 lines (cotton blankets, knitted bed linen, some cotton sheets and cotton damask table linen) pay 35% in "
        "place of the column 2 rate (9903.90.08, U.S. note 30); all Russian goods pay the 12.5% 2026 Section 301 duty except "
        "worn clothing.",
        "Russian made-ups pay the column 2 rate (or 35%) plus 12.5%; trade is negligible.",
        [],
    ),
    "other-section-301": (
        "Jordan's exception list (note 52(j), 9903.06.20) covers every Chapter 63 subheading. Guatemala and El Salvador lists "
        "cover every subheading when CAFTA-DR is claimed (9903.06.06, 9903.06.09). CAFTA-DR textile goods of Costa Rica, the "
        "Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free under CAFTA-DR are exempt (note "
        "52(i), 9903.05.95). No other country list names a Chapter 63 code. " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian and CAFTA-DR-claimed Central American made-ups pay none.",
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

gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 63 base-rate changes"
base["detail"] = (
    "All 229 Chapter 63 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 4A continues",
       "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
       "four-year review. For Chapter 63 this keeps +7.5% (9903.88.15) on 75 subheadings, including cotton sheets, towels, "
       "pillowcases and worn clothing.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 63",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 63 line is on their annexes.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; Chapter 63 entries unchanged",
       "Proclamations 11064 and 11065 changed the products on the 9903.03.14 list from September 15, 2026. None of the five "
       "Chapter 63 subheadings was removed; Revision 21 still lists " + CANADA_338 + " in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11064", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ribbons-tw-ar", "reference", "2026-09-04", "Published", "Narrow woven ribbons from Taiwan: 83.67% antidumping rate",
       "Commerce's final results for September 2023–August 2024 set an 83.67% antidumping margin for Lace Fashions Industrial "
       "and Trydent. The ribbon orders on China and Taiwan (2010, continued March 2022) list 6307.90.98.91 among the "
       "statistical numbers ribbons may enter under, so cut ribbon put up as a made-up article can still be subject merchandise.",
       None, "83.67% (two exporters)", "Taiwan, China", ["fr-2026-18182", "fr-2022-05634", "fr-2010-21975", "fr-2010-21978"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on five Chapter 63 subheadings",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in U.S. note 51(b)(3), which names " + CANADA_338 +
       " — 22 statistical lines. It is charged even when USMCA is claimed and on top of the 10% Section 301 duty on non-USMCA "
       "goods. Planned for August 19, it took effect August 22 after a 3-day suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach 227 of 229 lines",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84) — 10% for India, Pakistan, Bangladesh, Cambodia, "
       "Indonesia, Mexico and Canada, 12.5% for China, Vietnam, Türkiye and Thailand, 10% in total for the EU. Worn clothing "
       "(6309.00.00) is on the general exemption list (note 52(b), 9903.05.86). Jordan's list covers every Chapter 63 "
       "subheading, and Guatemala's and El Salvador's cover them when CAFTA-DR is claimed; CAFTA-DR textile goods are exempt "
       "(note 52(i)). USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). Other FTA claims remove the base rate but "
       "not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "csms-69326983", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). Worn clothing (6309.00.00) is the only Chapter 63 subheading on Brazil's "
       "exemption list (U.S. note 50(a)(ii), 9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: cotton products are a high-priority sector",
       "CBP's operational guidance for importers lists the supply-chain tracing documents it expects for the UFLPA "
       "high-priority sectors, which include cotton and cotton products and apparel. Cotton sheets, towels, blankets and "
       "other cotton made-ups are presumed barred if made wholly or in part in Xinjiang or by a listed entity, unless the "
       "importer rebuts the presumption.",
       None, None, "China (and goods with Chinese cotton)", ["cbp-fl-guidance", "pl-117-78"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 63 subheading was on the product "
       "exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico (9903.03.07, 9903.03.08) and CAFTA-DR textile "
       "goods entered duty-free (9903.03.09) were exempt.",
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
       "(SPI D) is printed on only seven Chapter 63 lines — silk bed linen, hand-loomed and jute wall hangings, wool pillow "
       "covers, some air mattresses, wall banners and 6307.90.98 — but heading 9819.11.33 lets textile articles of Chapter 63 "
       "wholly formed in lesser-developed AGOA countries enter Free. GSP remains expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("cn-masks-50", "extraDuty", "2026-01-01", "Effective", "China: 50% on textile face masks and respirators",
       "The 2024 four-year review raised the Section 301 rate on Chinese N95 respirators (6307.90.98.42/.44), other textile "
       "respirators (.50) and textile face masks (.70/.75) to +50% (9903.91.07), replacing the 25% that applied to disposable "
       "masks during 2025.",
       "+25% (disposable masks)", "+50%", "China", ["fr-2024-21217", "fr-2026-20510", "hts-chapter-99", "hts-now"]),
    ch("nepal-expired", "reference", "2025-12-31", "Expired", "Nepal Preference Program (NP) expired",
       "The program that let Nepal ship listed goods duty-free (SPI NP) ended after December 31, 2025. NP is still printed on "
       "6301.90.00 (other blankets) and 6308.00.00 (needlecraft sets), but no longer applies.",
       "Free (NP)", "General rate", "Nepal", ["usc-4454", "otexa-nepal", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-29", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 63 line; CAFTA-DR-originating "
       "made-ups are not covered.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-exclusions-extended", "reference", "2025-12-01", "Published", "China List 4A exclusions extended to November 9, 2026",
       "USTR extended 178 China Section 301 product exclusions, including four in Chapter 63: knitted polyester dust covers "
       "for mattresses and pillows (6302.10.00.20), zippered full-encasement cotton pillow protectors (6302.31.90.40), and "
       "instant cold packs with a textile lining and cotton laparotomy sponges (6307.90.98.91). They remove the 7.5% List 4A "
       "duty (9903.88.69) but not the 12.5% 2026 duty.",
       None, "Excluded through November 9, 2026", "China", ["fr-2025-21671", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 63 "
       "line on top of List 4A until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025: 50% in all on Indian sheets and towels. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Vietnam +20%, Pakistan and "
       "Cambodia +19%, Bangladesh +20%, and 15% in total for EU goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("cn-reciprocal-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal duty cut from 125% to 10%",
       "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for 90 days (later extended). Ended February 24, 2026.",
       "+125%", "+10% (ended)", "China", ["eo-14298"]),
    ch("cn-125", "extraDuty", "2025-04-10", "Effective", "China reciprocal duty raised to 125%",
       "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125%, on top of List 4A and the fentanyl duty.",
       "+84%", "+125% (ended)", "China", ["eo-14266"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 63 subheading was on "
       "the exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong went from +10% (from February 4, 2025) to +20%, on top of List 4A.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("lws-cn-continued", "reference", "2025-02-20", "Effective", "Laminated woven sacks from China: orders continued",
       "After the third sunset reviews, Commerce continued the 2008 antidumping and countervailing duty orders on laminated "
       "woven sacks from China — printed, laminated sacks of woven polypropylene or polyethylene strip up to 1 kg, the kind "
       "used for pet food and seed (6305.33.00.40, .80). CBP keeps collecting cash deposits at the rates in effect at entry.",
       None, "AD + CVD orders continue", "China", ["fr-2025-03183", "fr-e8-18196", "fr-e8-18195"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt. Ended February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
    ch("cn-masks-25", "extraDuty", "2025-01-01", "Effective", "China: 25% on disposable textile face masks",
       "The 2024 four-year review put +25% (9903.91.04) on disposable textile face masks of China (6307.90.98.70) for 2025; "
       "it was replaced by the 50% heading on January 1, 2026.",
       None, "+25% (2025 only)", "China", ["fr-2024-21217", "hts-chapter-99", "hts-now"]),
    ch("lws-vn-continued", "reference", "2024-11-15", "Effective", "Laminated woven sacks from Vietnam: orders continued",
       "After the first sunset reviews, Commerce continued the 2019 antidumping and countervailing duty orders on laminated "
       "woven sacks from Vietnam (6305.33.00.40, .80), which cover sacks made in Vietnam whatever the origin of the fabric.",
       None, "AD + CVD orders continue", "Vietnam", ["fr-2024-28022", "fr-2019-11579"]),
]
tu["changes"] = changes
add_sources(tu, [s for c in changes for s in c["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Bed Linen, Towels, Tarps & Other Made-Up Textiles (HTS Ch. 63): Origin Rules, Labeling & Ways to Lower Duty"
te["seo"]["title"] = "Importing Home Textiles: Origin Rules, UFLPA, FTC Labeling & Ways to Lower Duty (HTS Chapter 63) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, FTC and CPSC rules for each HTS Chapter 63 line — textile country of origin (fabric-formed rule, 19 CFR "
    "102.21), manufacturer ID, fibre-content labels, UFLPA for cotton, AD/CVD on woven sacks — and the legal ways to pay "
    "less: USMCA, CAFTA-DR, exception lists, China exclusions, first sale, drawback and FTZs."
)
te["seo"]["keywords"] = [
    "home textiles country of origin",
    "19 CFR 102.21 made up textiles",
    "bed linen import requirements",
    "towel import regulations",
    "UFLPA cotton home textiles",
    "Textile Act labeling sheets towels",
    "first sale for export textiles",
    "USMCA textile rules of origin",
]
te["intro"] = (
    "For most Chapter 63 goods **the country of origin is where the fabric was woven or knitted, not where it was cut and "
    "sewn** (19 CFR 102.21): Pakistani fabric sewn into sheets in another country is still Pakistani. Some man-made-fibre "
    "items (for example polyester sheets, curtains and bedspreads) take the origin of the country that dyed and printed the "
    "fabric with two finishing steps; worn clothing and rags are from where they were last collected and packed. Every entry "
    "must name the manufacturer by manufacturer identification code, cotton goods face the UFLPA presumption, and sheets, "
    "towels, blankets and curtains sold at retail need fibre-content and origin labels (16 CFR part 303).\n\n"
    "The ways to pay less are in the schedule: **USMCA** for goods cut and sewn in North America from regional fabric, "
    "**CAFTA-DR** for Central American made-ups (also exempt from the 2026 Section 301 duty), **Jordan's** exception list, "
    "the **China List 4A exclusions** where the goods fit, **first-sale valuation**, **drawback** and **foreign-trade "
    "zones**. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "fabric-origin",
        "title": "Know where the fabric was made — that is usually the country of origin",
        "saves": "The difference between country rates: +10% for India or Pakistan, +12.5% for Vietnam, +20% for China (62.5% on masks)",
        "appliesTo": "Headings 6301–6306, 6307.10, 6307.90 and 6308 (fabric-formed rule); 6307.20 is where assembled; 6309–6310 where collected and packed",
        "document": "Mill records showing where the fabric was formed (woven or knitted), and for 102.21(e)(2) goods where it was "
        "dyed, printed and finished; the MID of that producer on the entry.",
        "caveat": "Moving the cut-and-sew step does not move origin when the fabric stays the same: sheets sewn in Cambodia from "
        "Chinese fabric are Chinese. Cotton goods and blends with 16% or more cotton always follow the fabric-formed rule.",
        "citations": [
            {"label": "19 CFR 102.21(c)(2) and (e)", "url": ecfr(19, "102.21")},
            {"label": "19 CFR 102.23 (MID)", "url": ecfr(19, "102.23")},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on made-ups cut and sewn in Mexico or Canada from regional fabric",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 20.9%)",
        "appliesTo": "All lines, for goods that qualify as originating: fabric (and yarn) from the USMCA region, and the good cut "
        "(or knit to shape) and sewn or otherwise assembled there (General Note 11, Chapter 63 rules)",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" on "
        "the entry line.",
        "caveat": "Asian fabric sewn in Mexico does not qualify. For Canada, USMCA does not remove the 50% Section 338 duty on "
        + CANADA_338 + ". The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 63 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
        ],
    },
    {
        "id": "cafta",
        "title": "Claim CAFTA-DR — it also removes the 2026 Section 301 duty",
        "saves": "The base rate and the 10%–12.5% Section 301 duty on Central American and Dominican made-ups",
        "appliesTo": "Textile goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua that "
        "originate under General Note 29 (fabric formed in the region, cut and sewn there) and are entered duty-free under "
        "CAFTA-DR (SPI P)",
        "document": "Proof of origin under CAFTA-DR and the SPI \"P\" on the entry line; for Guatemala and El Salvador the "
        "exemption heading 9903.06.06 or 9903.06.09, for the others 9903.05.95.",
        "caveat": "Non-originating Nicaraguan goods will pay 10% from 2027 and 15% from 2028 (9903.89.01).",
        "citations": [
            {"label": "HTSUS General Note 29", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim another FTA, AGOA or the Haiti made-up provision where the base rate is the cost",
        "saves": "The base rate — up to 20.9% on cotton bed linen, 9.1% on terry towels; for Jordan, the Section 301 duty too",
        "appliesTo": "Goods of Jordan, Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Morocco, Bahrain, Oman and "
        "Singapore under each agreement's yarn- or fabric-forward rule; AGOA lesser-developed countries (9819.11.33, through "
        "December 31, 2026); listed made-up articles wholly assembled in Haiti (9820.63.05)",
        "document": "The origin proof each program requires and the SPI on the entry line (JO, KR, AU, CL, CO, PE, PA, IL, MA, "
        "BH, OM, SG, D), or the Chapter 98 heading.",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)) except for Jordan's list and CAFTA-DR; "
        "Chapter 98 entries such as 9819.11.33 and 9820.63.05 are outside it. GSP (A, A*) has been expired since December 31, "
        "2020 and the Nepal program (NP) since December 31, 2025, although both codes are still printed.",
        "citations": [
            {"label": "HTSUS General Notes 3(c) and 8–34", "url": GN},
            {"label": "HTSUS Chapter 98, 9819.11.33 and 9820.63.05", "url": CH98},
            {"label": "19 CFR 10.178a (AGOA)", "url": ecfr(19, "10.178a")},
            {"label": "19 U.S.C. 4454(f) (Nepal program ended)", "url": src("usc-4454")["url"]},
        ],
    },
    {
        "id": "china-exclusion",
        "title": "Use a China List 4A exclusion where the goods match it",
        "saves": "The 7.5% List 4A duty (the 12.5% 2026 duty still applies)",
        "appliesTo": "Knitted polyester mattress and pillow dust covers (6302.10.00.20), zippered full-encasement cotton pillow "
        "protectors (6302.31.90.40), instant cold packs with textile lining and cotton laparotomy sponges (6307.90.98.91), "
        "entered by November 9, 2026",
        "document": "Heading 9903.88.69 reported with the statistical number, and records showing the goods match the "
        "exclusion's description.",
        "caveat": "Exclusions are narrow and end after November 9, 2026 unless USTR extends them again.",
        "citations": [
            {"label": "HTSUS U.S. note 20(vvv)(iv), heading 9903.88.69", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended)", "url": src("fr-2025-21671")["url"]},
        ],
    },
    {
        "id": "classify",
        "title": "Check the classification line by line — trim, nap, print and fibre move the rate",
        "saves": "Up to 18 points of base rate: cotton sheets with embroidery or piping are 20.9%, without trim 6.7%, napped "
        "printed 2.5%; stuffed items leave the chapter for 9404",
        "appliesTo": "Bed linen (6302.21–.32), bedspreads (6304.19), towels (6302.60 vs. 6302.91) and any set or blend",
        "document": "A binding ruling request to CBP (19 CFR part 177) with fibre content by weight, construction, trim and "
        "finish; invoices must state the fibre content (19 CFR 141.89).",
        "caveat": "Classification follows the goods as imported: removing trim only to change the line, then adding it after "
        "import, is not a lawful plan. Rulings bind only the transaction described.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Chapter 63 and Section XI notes", "url": CH63},
        ],
    },
    {
        "id": "first-sale",
        "title": "Value at the first sale for export when you buy through a middleman",
        "saves": "Every ad valorem duty — base rate and Section 301 — is charged on a lower value when the mill's price to a "
        "trading company is lower than the price you pay",
        "appliesTo": "All lines bought through a trading company, agent-buyer or brand owner rather than straight from the maker",
        "document": "Proof that the first sale was a bona fide sale for export to the United States at arm's length: the "
        "factory invoice, contracts and payment records.",
        "caveat": "Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.",
        "citations": [{"label": "19 CFR 152.103", "url": ecfr(19, "152.103")}],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods are exported or destroyed",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on made-ups re-exported unused or used to make exported goods",
        "appliesTo": "All lines",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
    {
        "id": "ftz",
        "title": "Hold, kit or relabel goods in a foreign-trade zone",
        "saves": "No duty on goods re-exported from the zone, and duty deferred until goods enter the U.S. market",
        "appliesTo": "Any line — useful for bedding and towels distributed to Canada, Mexico and the U.S. from one stock",
        "document": "Zone admission (CBP Form 214) and the zone operator's inventory records.",
        "caveat": "Goods entered for U.S. consumption from a zone pay the duties in force on the entry date.",
        "citations": [{"label": "19 CFR part 146", "url": ecfr_part(19, 146)}],
    },
]
te["rules"] = [
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Textile country of origin: for 6301–6306, 6307.10 and 6307.90 the country where the fabric was formed; for "
        "listed man-made-fibre bed linen, curtains and furnishings (6302.22, .29, .53, .59, .93, .99, 6303.92, .99, 6304.19, "
        ".93, .99) the country that dyed and printed the fabric with two finishing operations; 6307.20 where wholly "
        "assembled; 6309–6310 where last collected and packed",
        "citations": [{"label": "19 CFR 102.21(c)(2), (e)", "url": ecfr(19, "102.21")}],
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
        "title": "Entry is denied for textiles from a company named in the Federal Register for illegal transshipment or for "
        "being unable to verify production",
        "citations": [{"label": "19 CFR 102.24", "url": ecfr(19, "102.24")}],
    },
    {
        "id": "invoice",
        "agency": "CBP",
        "title": "Invoice details for textile fibre products: each fibre by generic name and percentage by weight, the "
        "manufacturer, and the country where processed or made",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Act labels on bedding, curtains and draperies, tablecloths and napkins, towels, washcloths and dish "
        "cloths, afghans and throws, cushions, sleeping bags and flags: fibre content, the RN or company name, and the country "
        "where made. Secondhand household textiles and disposable nonwovens are excluded",
        "citations": [
            {"label": "16 CFR 303.45", "url": ecfr(16, "303.45")},
            {"label": "16 CFR 303.33 (country of origin)", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "ftc-wool",
        "agency": "FTC",
        "title": "Wool Products Labeling Act: wool and cashmere blankets and throws must show wool fibre content and origin",
        "citations": [{"label": "16 CFR part 300", "url": ecfr_part(16, 300)}],
    },
    {
        "id": "cpsc-mattress-pad",
        "agency": "CPSC",
        "title": "Mattress pads (a mat or ticking filled with resilient material) must pass the cigarette-ignition standard; "
        "most such pads are stuffed and classified in heading 9404, while unfilled mattress covers and protectors of 6302/6304 "
        "are outside the standard",
        "citations": [
            {"label": "16 CFR 1632.1 (definition of mattress pad)", "url": ecfr(16, "1632.1")},
            {"label": "16 CFR part 1632", "url": ecfr_part(16, 1632)},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made "
        "with forced labor and excluded unless the importer rebuts it; cotton and cotton products are a high-priority sector, "
        "so cotton sheets, towels and blankets need cotton tracing documents",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
        ],
    },
    {
        "id": "adcvd-sacks",
        "agency": "Commerce / CBP",
        "title": "Antidumping and countervailing duty cash deposits on laminated woven sacks from China (A-570-916, C-570-917) "
        "and Vietnam (A-552-823, C-552-824): printed, laminated sacks of woven PP/PE strip up to 1 kg, classified in "
        "6305.33.00.40 and .80",
        "citations": [
            {"label": "90 FR 10809 (China orders continued)", "url": src("fr-2025-03183")["url"]},
            {"label": "89 FR 94707 (Vietnam orders continued)", "url": src("fr-2024-28022")["url"]},
        ],
    },
    {
        "id": "adcvd-ribbons",
        "agency": "Commerce / CBP",
        "title": "Antidumping (China, Taiwan) and countervailing (China) duties on narrow woven ribbons with woven selvedge; "
        "the orders list 6307.90.98.91 among the numbers ribbons may enter under",
        "citations": [{"label": "87 FR 15205 (orders continued)", "url": src("fr-2022-05634")["url"]}],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or its retail container; bales of worn clothing in bulk are marked "
        "on the bale or container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
BASE_RULES = ["textile-origin", "textile-mid", "cita-transship", "invoice", "uflpa", "cbp-marking"]
GROUP_RULES = {
    "6301": BASE_RULES + ["ftc-labeling", "ftc-wool"],
    "6302": BASE_RULES + ["ftc-labeling"],
    "6303": BASE_RULES + ["ftc-labeling"],
    "6304": BASE_RULES + ["ftc-labeling", "cpsc-mattress-pad"],
    "6305": BASE_RULES + ["adcvd-sacks"],
    "6306": BASE_RULES + ["ftc-labeling"],
    "6307": BASE_RULES + ["ftc-labeling", "adcvd-ribbons"],
    "6308": BASE_RULES + ["ftc-labeling"],
    "6309": ["textile-origin", "textile-mid", "invoice", "cbp-marking"],
    "6310": ["textile-origin", "textile-mid", "invoice", "cbp-marking"],
}
GROUP_NOTES = {
    "6301": "Origin is where the blanket fabric was formed. Wool and cashmere blankets need Wool Act labels; stuffed quilts "
    "and comforters are heading 9404, not here.",
    "6302": "Origin is where the fabric was woven or knitted — except man-made-fibre bed, table and toilet linen of 6302.22, "
    ".29, .53, .59, .93 and .99, which takes the origin of the dye-print-finish country if that happened. Cotton goods need "
    "UFLPA cotton tracing.",
    "6303": "Curtains take the origin of the fabric; synthetic curtains (6303.92) can take the dye-print-finish country. "
    "6303.92.20 is on Canada's 50% Section 338 list.",
    "6304": "Furnishings that are not stuffed. Origin follows the fabric (or dye-print-finish for 6304.19, .93, .99). Filled "
    "mattress pads are 9404 and must meet 16 CFR part 1632.",
    "6305": "Origin follows the fabric. Laminated woven sacks from China and Vietnam (6305.33.00.40/.80) are under AD/CVD "
    "orders; 6305.33.00 is on Canada's Section 338 list.",
    "6306": "Tarps and tents take the origin of the fabric. Synthetic and other tarpaulins (6306.12, 6306.19.21) are on "
    "Canada's Section 338 list.",
    "6307": "Origin follows the fabric for 6307.10 and 6307.90; lifejackets (6307.20) are from where assembled. Chinese masks "
    "and respirators pay 50% Section 301; 6307.90.98 is on Canada's Section 338 list.",
    "6308": "Origin is where the woven fabric component was formed.",
    "6309": "Worn clothing must show appreciable wear and be entered in bulk, bales or sacks. Origin is where it was last "
    "collected and packed. Exempt from the 2026 Section 301 duty (note 52(b)).",
    "6310": "Rags and scrap are from where they were last collected and packed.",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES[g["heading"]]
for ln in te["lines"]:
    h = ln["hts"]
    hd = h[:4]
    ln["ruleIds"] = GROUP_RULES[hd]
    lev = ["fabric-origin", "usmca", "cafta", "fta"]
    if h.startswith(("6302.10.00.20", "6302.31.90.40", "6307.90.98.91")):
        lev.append("china-exclusion")
    if hd in ("6302", "6304"):
        lev.append("classify")
    lev += ["first-sale", "drawback", "ftz"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, China exclusions, "
    "AD/CVD rates and the Canada Section 338 list change by proclamation and notice; check them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 63 FAQ: HS Codes & Import Tariffs for Bed Sheets, Towels, Blankets, Tarps & Used Clothing"
fc["seo"]["title"] = "Bed Sheet, Towel, Blanket & Used Clothing HS Code and Tariff FAQ 2026 (HTS Chapter 63) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing made-up textiles: the HS code for bed sheets, pillowcases, towels, "
    "blankets, curtains, tarpaulins, tents, face masks and used clothing, and the 2026 tariffs from China, India and Pakistan."
)
fc["seo"]["keywords"] = [
    "bed sheets hs code",
    "bed linen hs code",
    "towel hs code",
    "blanket hs code",
    "curtain hs code",
    "tarpaulin hs code",
    "tent hs code",
    "used clothing hs code",
    "hs code 6307.90",
    "hs code 6302",
    "pillowcase hs code",
    "tariff on textiles from china",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing made-up textile articles into the U.S. — HS codes, tariffs "
    "by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 63 base rates run from Free to 20.9% and are unchanged since January 2025: cotton terry towels 9.1%, printed "
    "cotton sheets 6.7%, polyester sheets 11.4%, synthetic tarps 8.8%. The extra duty by country often costs more.",
    "Since July 24, 2026 India, Pakistan, Bangladesh and Cambodia pay 10% Section 301 on top of the base rate, Vietnam and "
    "Türkiye 12.5%, EU suppliers 10% in total. China pays 20% on most lines (12.5% plus List 4A), 12.5% on synthetic "
    "blankets, sheets and tarps, and 62.5% on masks and respirators.",
    "Worn clothing (6309) is Free and exempt from the 2026 Section 301 duty for every country; only China's 7.5% List 4A applies.",
    "Canada pays 50% under Section 338 on synthetic curtains, plastic-strip sacks, tarpaulins and 6307.90.98, even with USMCA. "
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026.",
    "Origin follows the fabric: the country that wove or knitted it, not where it was sewn (19 CFR 102.21). Cotton goods "
    "face the UFLPA presumption, and laminated woven sacks from China and Vietnam pay AD/CVD.",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "hts-chapter-63",
        "question": "What does HTS Chapter 63 cover?",
        "searchedAs": ["hts chapter 63", "htsus chapter 63", "hs code 63", "chapter 63 hts", "hts code chapter 63"],
        "answer": "Made-up textile articles: blankets (6301), bed, table, toilet and kitchen linen (6302), curtains (6303), "
        "bedspreads and furnishings (6304), packing sacks (6305), tarpaulins, tents and sails (6306), other made-ups such as "
        "cleaning cloths, flags and face masks (6307), needlecraft sets (6308), worn clothing (6309) and rags (6310). Garments "
        "are chapters 61–62; stuffed pillows and comforters are 9404.",
        "link": "",
    },
    {
        "id": "bed-sheets-hs-code",
        "question": "What is the HS code for bed sheets, pillowcases and duvet covers?",
        "searchedAs": ["bed sheets hs code", "bed linen hs code", "bed sheet hs code usa", "pillowcase hs code", "duvet cover hs code", "fitted sheets hs code", "hs code 6302"],
        "answer": "Heading 6302. Knitted bed linen is 6302.10 (6%). Woven printed bed linen is 6302.21 (cotton) or 6302.22 "
        "(man-made fibres); unprinted is 6302.31 or 6302.32. Plain cotton sheets are 6.7% (not napped) or 3.8%–2.5% (napped); "
        "with embroidery, lace or piping 11.9%–20.9%; polyester sheets 11.4%, 14.9% with trim. Pillowcases and duvet covers "
        "are statistical lines within the same subheadings.",
        "link": "",
    },
    {
        "id": "towel-hs-code",
        "question": "What is the HS code and tariff for towels?",
        "searchedAs": ["towel hs code", "bath towel hs code", "cotton towel hs code", "towel hs code usa", "towels tariff code", "bath towels tariff code", "beach towels tariff code", "6302.60 hs code"],
        "answer": "Cotton terry towels (bath, beach, hand and dish) are 6302.60.00 at 9.1%; other cotton towels 6302.91.00 "
        "(9.2%); man-made-fibre towels 6302.93 (6.2% pile, 9.9% other). Paper towels are chapter 48. From Pakistan or India a "
        "cotton terry towel pays 19.1% in all; from China 29.1%.",
        "link": "industry-areas",
    },
    {
        "id": "blanket-hs-code",
        "question": "What is the HS code for blankets and throws?",
        "searchedAs": ["blanket hs code", "blanket hs code usa", "throw hs code", "baby blanket hs code", "quilt hs code", "fire blanket hs code"],
        "answer": "Heading 6301: electric blankets 6301.10 (11.4%), wool 6301.20 (Free), cotton 6301.30 (8.4%), synthetic "
        "fibres such as fleece 6301.40 (8.5%), other 6301.90 (7.2%). Quilts and comforters that are stuffed are bedding of "
        "9404. Chinese cotton blankets pay 20% extra; synthetic and electric blankets 12.5%, since they are not on List 4A.",
        "link": "",
    },
    {
        "id": "curtain-hs-code",
        "question": "What is the HS code for curtains and drapes?",
        "searchedAs": ["curtain hs code", "drape hs code", "drapery hs code", "shower curtain hs code", "curtain hs code china"],
        "answer": "Heading 6303: knitted curtains 6303.12–6303.19, woven cotton 6303.91 (10.3%), synthetic 6303.92 (11.3%), "
        "other 6303.99 (11.3%). Textile shower curtains are here; plastic ones are chapter 39. Canada's synthetic curtains "
        "(6303.92.20) pay a 50% Section 338 duty.",
        "link": "",
    },
    {
        "id": "tarp-tent-hs-code",
        "question": "What is the HS code for tarpaulins and tents?",
        "searchedAs": ["tarpaulin hs code", "tarp hs code", "pe tarpaulin hs code", "tent hs code", "camping tent hs code", "canopy tent hs code"],
        "answer": "Textile tarpaulins, awnings and sunblinds are 6306.12 (synthetic, 8.8%) and 6306.19; tents and canopies "
        "6306.22 (synthetic: backpacking tents Free, others 8.8%) and 6306.29. Tarps of plastic film or sheeting, as most PE "
        "tarps are, are chapter 39. Chinese synthetic tarps pay 12.5% extra; Canadian ones 50% under Section 338.",
        "link": "",
    },
    {
        "id": "hs-6307",
        "question": "What goes in HS code 6307.90?",
        "searchedAs": ["hs code 6307.90", "hs code 6307", "hts code 6307.90", "hs code 6307.10", "face mask hs code", "surgical mask hs code"],
        "answer": "6307.90 is other made-up articles: labels, cords, surgical drapes, pet toys, wall banners and the catch-all "
        "6307.90.98 (7%), which holds flags, textile face masks and respirators, and many others. 6307.10 is floor cloths, "
        "dishcloths and dusters; 6307.20 lifejackets. Chinese textile masks and respirators pay 50% Section 301 plus 12.5%.",
        "link": "tariff-updates",
    },
    {
        "id": "used-clothing",
        "question": "What is the HS code for used clothing, and is there a tariff?",
        "searchedAs": ["used clothing hs code", "worn clothing hs code", "used clothing hs code usa", "second hand clothing hs code", "used clothing hs tariff code", "6309 hs code"],
        "answer": "6309.00.00, Free. It covers clothing, blankets, linen, furnishings, footwear and headgear that show "
        "appreciable wear and are entered in bulk, bales or sacks; worn goods imported otherwise go to their own headings. "
        "6309 is exempt from the 2026 Section 301 duty for all countries; only Chinese worn clothing pays 7.5% (List 4A).",
        "link": "",
    },
    {
        "id": "sacks-bags",
        "question": "Are tote bags and shopping bags in Chapter 63?",
        "searchedAs": ["tote bag hs code", "shopping bag hs code", "cotton shopping bag hs code", "jute shopping bag hs code", "hs code 6305"],
        "answer": "No. Heading 4202 names shopping bags, and textile articles of 4202 are excluded from Section XI. Chapter 63 "
        "keeps only sacks and bags used to pack goods (6305): jute Free, cotton 6.2%, FIBC bulk bags and woven polypropylene "
        "sacks 8.4%.",
        "link": "",
    },
    {
        "id": "woven-sacks",
        "question": "Are there antidumping duties on laminated woven sacks?",
        "searchedAs": ["laminated woven sacks", "laminated woven sacks anti dumping", "laminated woven sacks lws", "bopp laminated woven sacks"],
        "answer": "Yes. Printed laminated sacks of woven polypropylene or polyethylene strip up to 1 kg (6305.33.00.40/.80) from "
        "China (orders since 2008, continued February 2025) and Vietnam (since 2019, continued November 2024) pay antidumping "
        "and countervailing cash deposits on top of the 8.4% base rate and Section 301.",
        "link": "tariff-engineering",
    },
    {
        "id": "china-textiles",
        "question": "What is the tariff on textiles and home textiles from China in 2026?",
        "searchedAs": ["tariff on textiles from china", "tariff on fabric from china", "tariffs on home furnishings"],
        "answer": "For Chapter 63, every line but worn clothing pays 12.5% under the 2026 Section 301 action (9903.05.31). 75 "
        "of 99 subheadings — cotton sheets, towels, tablecloths, curtains of cotton, most bags and tarps of cotton — also pay "
        "7.5% under List 4A, so 20% on top of the base rate; textile masks and respirators pay 50% plus 12.5%. The IEEPA "
        "duties ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "india-pakistan-textiles",
        "question": "What is the tariff on home textiles from India and Pakistan?",
        "searchedAs": ["tariff on textiles from india to usa", "us tariff on textiles from india", "towel hs code pakistan", "bed sheets hs code in pakistan"],
        "answer": "Both pay the base rate plus 10% Section 301 (India 9903.05.44, Pakistan 9903.05.62), with no exception "
        "list: 19.1% on cotton terry towels, 16.7% on printed cotton sheets. India's 50% IEEPA rate of late 2025 ended in "
        "February 2026; GSP has been expired since 2020.",
        "link": "industry-areas",
    },
    {
        "id": "importing-countries",
        "question": "Where does the U.S. import made-up textiles from?",
        "searchedAs": ["used clothing importers", "hs code 6302 imports", "home textiles imports by country"],
        "answer": T["faq_countries"],
        "link": "understand-industry",
    },
    {
        "id": "origin",
        "question": "How is the country of origin of sheets and towels determined?",
        "searchedAs": ["bed sheet country of origin", "towel country of origin"],
        "answer": "By CBP's textile rules (19 CFR 102.21): for most Chapter 63 goods, the country where the fabric was woven "
        "or knitted, not where it was cut and sewn. Some man-made-fibre linens and furnishings take the origin of the country "
        "that dyed and printed the fabric with two finishing steps. The origin decides the Section 301 rate and the label.",
        "link": "tariff-engineering",
    },
]

# extra in-effect rows generated for the matrix countries
EXTRA_IE = {
    "do-section-301": (
        "CAFTA-DR textile goods entered duty-free under CAFTA-DR (SPI P) are exempt (note 52(i), 9903.05.95): that covers "
        "6301–6309 lines that print P. Lines whose General rate is Free carry no P and are not entered under CAFTA-DR, so "
        "they pay 12.5%, as do rags and scrap of 6310, which are outside the textile-goods definition. The Section 122 "
        "surcharge also exempted CAFTA-DR textile goods (9903.03.09) before it expired July 23, 2026.",
        "Dominican sheets, towels, curtains and other made-ups that qualify under CAFTA-DR enter with no duty at all; "
        "non-qualifying goods pay the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "th-section-301": (
        "Thailand has no exception list for Chapter 63; worn clothing is exempt (note 52(b)). GSP has been expired since "
        "December 31, 2020. " + ENDED,
        "Thai made-ups pay the base rate plus 12.5%.",
        ["cbp-gsp", "eo-14389"],
    ),
    "tw-section-301": (
        "Taiwan pays 10% in total in place of the base rate (note 52(k)), so lines with a base rate of 10% or more pay only the "
        "base rate. Taiwan's exception list (note 52(j)) names no Chapter 63 subheading. Narrow woven ribbons from Taiwan "
        "remain under an antidumping order. " + ENDED,
        "Taiwanese made-ups pay 10% in total, or the base rate where it is higher.",
        ["fr-2026-18182", "eo-14389"],
    ),
    "kr-section-301": (
        "South Korea pays 12.5% in total in place of the base rate (note 52(k)), KORUS claim or not, so lines with a base rate "
        "above 12.5% (14.9%, 20.9%) pay only the base rate. Korea has no exception list. " + ENDED,
        "Korean blankets, towels and bedding pay 12.5% in total.",
        ["eo-14389"],
    ),
}
for k, (ex, wim, extra) in EXTRA_IE.items():
    if k in IE:
        IE[k]["exemption"] = ex
        IE[k]["whatItMeans"] = wim
        for sid in extra:
            if sid not in IE[k]["sourceIds"]:
                IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
        add_sources(tu, extra)
for k, x in IE.items():
    assert "TODO" not in x["exemption"] + x["whatItMeans"], k

# ---------------------------------------------------------------- understandIndustry
bc, m = T["bc"], T["m"]
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 63: Made-Up Textile Articles — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "U.S. Home Textile Imports by Country: China, India, Pakistan, Mexico — HTS Chapter 63 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    f"U.S. imports of bed linen, towels, blankets, curtains, sacks, tents and other made-up textiles 2020–2025 by country "
    f"and product: {T['total']} in 2025. China supplied {round(bc['China']['sharePct'])}%, India "
    f"{round(bc['India']['sharePct'])}% and Pakistan {round(bc['Pakistan']['sharePct'])}%."
)
ui["seo"]["keywords"] = [
    "home textile imports by country",
    "bed linen imports united states",
    "towel imports from Pakistan",
    "India home textile exports to US",
    "China textile imports 2025",
    "used clothing importers",
    "Section 301 tariffs on China textiles",
]
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearPartners"] = ["China", "India"]
ui["byYearCaption"] = (
    "U.S. imports of Chapter 63 goods each year, split into the two largest 2025 suppliers (China and India) and everyone "
    "else. 2020 includes pandemic-era face masks and protective goods."
)
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    f"U.S. imports of Chapter 63 goods were **{T['total']} in 2025**, 10.6% less than the $18.09B of 2024 and about half the "
    "$31.08B of 2020, when textile face masks and protective goods surged. **China** shipped "
    f"**{m(bc['China']['importsUsd'])}** ({round(bc['China']['sharePct'])}%), down 25% from $9.37B; its largest heading is "
    "6307 (other made-up articles, $2.99B), then bed and bath linen ($1.58B) and blankets ($1.11B). **India** "
    f"({m(bc['India']['importsUsd'])}) and **Pakistan** ({m(bc['Pakistan']['importsUsd'])}) ship mainly sheets and towels "
    f"of heading 6302; **Mexico** ({m(bc['Mexico']['importsUsd'])}) ships other made-ups and curtains.\n\n"
    "By product, heading 6302 (bed, table, toilet and kitchen linen) was $5.59B and 6307 $5.38B — two-thirds of the "
    "chapter. The largest single lines were 6307.90 other made-up articles ($4.56B), **cotton terry towels** 6302.60 "
    "($2.01B), unprinted cotton bed linen 6302.31 ($1.18B), synthetic blankets 6301.40 ($1.10B) and synthetic curtains "
    "6303.92 ($1.03B).\n\n"
    "Imports shifted away from China in 2025, when Chinese goods carried List 4A, the IEEPA fentanyl duty and, from April, "
    "the reciprocal tariff: Vietnam rose 42% to $689M, Cambodia 67% to $237M and Thailand 49%. Those IEEPA duties ended on "
    "February 24, 2026; since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies to most suppliers instead, and "
    "China keeps List 4A. 2025 is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 63 (retrieved 2026-10-13)", "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, for calendar years 2020–2025. \"Other Asia, nes\" is how UN Comtrade reports Taiwan."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 63 Tariff Rates by Country: China, India, Pakistan, Mexico, Vietnam & More"
ia["seo"]["title"] = "Home Textile Import Duty by Country 2026: China, India, Pakistan, Vietnam, Mexico — HTS Chapter 63 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on blankets, sheets, towels, curtains, sacks, tarps and other made-up textiles by country: base "
    "rate plus the 2026 Section 301 duty, China List 4A and the 50% on masks, and Canada's 50% Section 338 duty, with USMCA "
    "applied."
)
ia["seo"]["keywords"] = [
    "home textile tariff rates by country",
    "China tariff on bed linen",
    "India towel import duty",
    "Pakistan towels tariff",
    "Vietnam tariff on textiles",
    "Mexico USMCA textiles",
    "HTS 6302 bed linens customs duty",
    "Section 301 tariffs on home furnishings",
]
ia["intro"] = (
    "The total rate on a sheet, towel or tarp depends as much on **where its fabric was made** as on the line. Each cell "
    "below is the base rate for that product group plus the extra duty for that country, minus any preference — computed "
    "from the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026): **India, Pakistan, Bangladesh and Cambodia +10%**, **Vietnam, Türkiye and Thailand +12.5%**, EU "
    "and Taiwanese goods 10% in total and Korean goods 12.5% in total. **China pays +20%** on most lines (12.5% plus List "
    "4A), +12.5% on lines not on List 4A and +62.5% on masks. **USMCA goods from Mexico pay nothing extra**, and Canada pays "
    "50% on five Section 338 subheadings even with USMCA."
)
EU_RULE = ("EU: 10% in total in place of the base rate (9903.05.39), or the base rate where it is 10% or more; no exception "
           "list for Chapter 63; worn clothing exempt. The 15% IEEPA rate ended February 24, 2026.")
RULES = {
    "China": "Base rate plus 12.5% (9903.05.31) on every line but worn clothing, plus 7.5% List 4A (9903.88.15) on 75 "
    "subheadings: +20% on cotton sheets, towels and most others; +12.5% on synthetic blankets, polyester sheets, synthetic "
    "tarps and other lines not on List 4A; +62.5% on masks and respirators (9903.91.07); +7.5% on worn clothing. List 4A "
    "exclusions (9903.88.69) need the importer's claim and are not applied.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line but worn clothing; no exception list. GSP has "
    "expired; the IEEPA duties (up to 50%) ended in February 2026.",
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62) on every line but worn clothing; no exception list. GSP has "
    "expired; the 19% IEEPA rate ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: base rate only (9903.05.94), and the base rate is Free under USMCA — but only for goods cut "
    "and sewn in North America from regional fabric. Otherwise the base rate plus 10% (9903.05.55).",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line but worn clothing; no exception list. "
    "Laminated woven sacks also pay AD/CVD.",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on every line but worn clothing; no exception list.",
    "Cambodia": "Base rate plus 10% Section 301 (9903.05.28); Cambodia's exception list names no Chapter 63 subheading.",
    "Bangladesh": "Base rate plus 10% Section 301 (9903.05.26); Bangladesh's exception list names no Chapter 63 subheading.",
    "Portugal": EU_RULE,
    "Italy": EU_RULE,
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on " + CANADA_338 +
    " even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those five.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on every line but worn clothing; no exception list.",
    "Taiwan": "10% in total in place of the base rate (9903.05.76), or the base rate where it is 10% or more; Taiwan's "
    "exception list names no Chapter 63 subheading.",
    "South Korea": "12.5% in total in place of the base rate (9903.05.71), KORUS claim or not, or the base rate where it is "
    "higher; no exception list.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% "
    "(9903.05.20–9903.05.84). Jordan's exception list covers every Chapter 63 subheading; CAFTA-DR textile goods of Honduras, El Salvador, "
    "Guatemala, Costa Rica and Nicaragua entered duty-free are exempt (notes 52(i)–(j)) but shown here without the claim. "
    "Brazil pays 37.5%.",
    "Dominican Republic": "With a CAFTA-DR claim (SPI P), as shown: no base rate and no Section 301 duty on 6301–6309 lines "
    "that print P — CAFTA-DR textile goods entered duty-free are exempt (note 52(i), 9903.05.95). Lines whose General rate "
    "is already Free (wool blankets, jute sacks, backpacking tents, sails, cords, surgical drapes and others; 16 lines) "
    "carry no P, so are not entered under CAFTA-DR and pay 12.5% (9903.05.34), as do rags of 6310. Goods that do not "
    "qualify pay the base rate plus 12.5%.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    extra = {"India": ["cbp-gsp", "eo-14384"], "Pakistan": ["cbp-gsp"], "Thailand": ["cbp-gsp"],
             "China": ["fr-2025-21671"], "Vietnam": ["fr-2024-28022"]}.get(c["country"], [])
    if c["country"] != "Any other country":
        extra = extra + ["eo-14389"]
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU and Taiwanese rates of \"10% in total\" and the Korean \"12.5% in total\" replace the base rate when it is lower "
    "(U.S. note 52(k)); where the base rate is higher (11.3%–20.9% lines), only the base rate applies.",
    "Worn clothing (6309.00.00) is exempt from the 2026 Section 301 duty for every country (note 52(b)).",
    "CAFTA-DR textile goods entered duty-free are exempt from the 2026 Section 301 duty (note 52(i), 9903.05.95; 6301–6309, "
    "not rags of 6310). The Dominican Republic is priced with its CAFTA-DR claim (SPI P); other CAFTA-DR countries fall in "
    "\"Any other country\", priced without a claim.",
    "Antidumping and countervailing duties on laminated woven sacks (China, Vietnam) and narrow woven ribbons (China, "
    "Taiwan) depend on the exporter and are not in the grid.",
    "Not in the grid: the UFLPA presumption against cotton goods made in Xinjiang, and FTC labeling — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86) names 6309.00.00. Note 52(j) country lists name Chapter 63 codes only for Jordan (every subheading) and, "
    "for CAFTA-DR claims, Guatemala and El Salvador (every subheading); the EU, UK, Swiss, Malaysian, Cambodian, Argentine, "
    "Bangladeshi, Taiwanese, Indonesian and Ecuadorian lists name none. Note 52(i) exempts CAFTA-DR textile goods entered "
    "duty-free. Note 50(a)(ii) names 6309.00.00 for Brazil. Note 51(b)(3) puts 6303.92.20, 6305.33.00, 6306.12.00, "
    "6306.19.21 and 6307.90.98 on the Canada Section 338 list. Note 20(s) puts 75 Chapter 63 subheadings on China List 4A "
    "(6307.90.98 without its mask and respirator lines); note 20(vvv)(iv) excludes four products through November 9, 2026; "
    "note 31(h) puts the five mask and respirator lines at 50%. Note 30 lists 17 lines for Russia. The Section 122 "
    "exemption list (9903.03.03) and the reciprocal-tariff Annex II named no Chapter 63 code. No Section 232 heading reaches "
    "a Chapter 63 line; the AD/CVD orders on laminated woven sacks and narrow woven ribbons are Commerce orders outside "
    "Chapter 99."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

SPI_NAMES = {
    "A": "Generalized System of Preferences (GSP) — expired December 31, 2020",
    "A*": "GSP, some beneficiary countries excluded — expired December 31, 2020",
    "D": "African Growth and Opportunity Act (AGOA) — through December 31, 2026",
    "NP": "Nepal Preference Program (expired December 31, 2025)",
}
for x in ov["spiLegend"]:
    x["name"] = SPI_NAMES.get(x["code"], x["name"])

# ---------------------------------------------------------------- dates, write
for page in ("tariffUpdates", "understandIndustry", "industryAreas", "tariffEngineering", "finalConclusion"):
    d[page]["lastCheckedAt"] = CHECKED
d["asOf"] = CHECKED
json.dump(d, open(OUT, "w"), indent=2, ensure_ascii=False)
print("filled", OUT)
