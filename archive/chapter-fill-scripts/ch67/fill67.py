"""Fill the writer parts of the generated Chapter 67 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 67 ...` (see run.sh in this folder):
    python3 fill67.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/67-feathers-and-artificial-flowers.json"
TRADE = f"{WT}/src/tariff-data/trade/chapter-67.json"
POOL = os.path.join(HERE, "pool46.json")
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
REL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename="
CH99 = REL + "Chapter%2099"
CH67 = REL + "Chapter%2067"
CH05 = REL + "Chapter%205"
GN = REL + "General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


def ruling(n):
    return f"https://rulings.cbp.gov/ruling/{n}"


d = json.load(open(PATH))
pool = json.load(open(POOL))
trade = json.load(open(TRADE))

NEW_SOURCES = {
    "hts-ch67": {
        "id": "hts-ch67", "publisher": "USITC", "citation": "HTSUS 2026 Revision 21, Chapter 67",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 67: Prepared Feathers and Down; Artificial Flowers; Articles of Human Hair",
        "signed": None, "published": "2026-10-07", "url": CH67,
    },
    "hts-ch05": {
        "id": "hts-ch05", "publisher": "USITC", "citation": "HTSUS 2026 Revision 21, Chapter 5, Additional U.S. Note 1",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 5 (Additional U.S. Note 1: feathers and skins of birds)",
        "signed": None, "published": "2026-10-07", "url": CH05,
    },
    "hts-gn11": {
        "id": "hts-gn11", "publisher": "USITC", "citation": "HTSUS 2026 Revision 21, General Note 11",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes (General Note 11: USMCA rules of origin)",
        "signed": None, "published": "2026-10-07", "url": GN,
    },
    "cbp-wro-haolin": {
        "id": "cbp-wro-haolin", "publisher": "CBP", "citation": "CBP national media release (May 1, 2020)",
        "document": "Withhold release order",
        "title": "CBP Issues Detention Order on Hair Products Manufactured with Forced Labor in China (Hetian Haolin Hair Accessories Co. Ltd.)",
        "signed": None, "published": "2020-05-01",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-detention-order-hair-products-manufactured-forced-labor",
    },
    "cbp-wro-meixin": {
        "id": "cbp-wro-meixin", "publisher": "CBP", "citation": "CBP national media release (June 17, 2020)",
        "document": "Withhold release order",
        "title": "CBP Issues Detention Order on Hair Products Manufactured with Forced Labor in China (Lop County Meixin Hair Product Co. Ltd.)",
        "signed": None, "published": "2020-06-17",
        "url": "https://www.cbp.gov/newsroom/national-media-release/cbp-issues-detention-order-hair-products-manufactured-forced-labor-0",
    },
    "dhs-wro-2020-09": {
        "id": "dhs-wro-2020-09", "publisher": "DHS", "citation": "DHS press release (September 14, 2020)",
        "document": "Withhold release orders",
        "title": "DHS Cracks Down on Goods Produced by China's State-Sponsored Forced Labor (WRO on hair products of the Lop County Hair Product Industrial Park)",
        "signed": None, "published": "2020-09-14",
        "url": "https://www.dhs.gov/news/2020/09/14/dhs-cracks-down-goods-produced-china-s-state-sponsored-forced-labor",
    },
    "pl-117-78": {
        "id": "pl-117-78", "publisher": "GovInfo", "citation": "Pub. L. 117-78 (135 Stat. 1525)",
        "document": "Public Law 117-78", "title": "Uyghur Forced Labor Prevention Act",
        "signed": "2021-12-23", "published": "2021-12-23",
        "url": "https://www.govinfo.gov/content/pkg/PLAW-117publ78/html/PLAW-117publ78.htm",
    },
    "dhs-uflpa-list": {
        "id": "dhs-uflpa-list", "publisher": "DHS", "citation": "UFLPA Entity List (last updated July 31, 2026)",
        "document": "Web page",
        "title": "Uyghur Forced Labor Prevention Act Entity List (lists Hetian Haolin Hair Accessories, Lop County Hair Product Industrial Park and Lop County Meixin Hair Products from June 21, 2022)",
        "signed": None, "published": "2026-07-31", "url": "https://www.dhs.gov/uflpa-entity-list",
    },
    "usc-19-1307": {
        "id": "usc-19-1307", "publisher": "GovInfo", "citation": "19 U.S.C. 1307",
        "document": "U.S. Code", "title": "Convict-made goods; importation prohibited",
        "signed": None, "published": "2025-01-03",
        "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1307.htm",
    },
    "itc-1415-leo": {
        "id": "itc-1415-leo", "publisher": "Federal Register", "citation": "90 FR 47821",
        "document": "Notice (USITC), Inv. No. 337-TA-1415",
        "title": "Certain Pre-Stretched Synthetic Braiding Hair and Packaging Therefor; Notice of Commission Final Determination To Issue a Limited Exclusion Order and Cease and Desist Orders; Termination of the Investigation",
        "signed": "2025-09-29", "published": "2025-10-02",
        "url": "https://www.federalregister.gov/documents/2025/10/02/2025-19223/certain-pre-stretched-synthetic-braiding-hair-and-packaging-therefor-notice-of-commission-final",
    },
    "itc-1415-enf-end": {
        "id": "itc-1415-enf-end", "publisher": "Federal Register", "citation": "91 FR 42752",
        "document": "Notice (USITC), Inv. No. 337-TA-1415",
        "title": "Certain Pre-Stretched Synthetic Braiding Hair and Packaging Therefor; Notice of Commission Determination Not To Review an Initial Determination Terminating the Enforcement Proceeding",
        "signed": None, "published": "2026-07-10",
        "url": "https://www.federalregister.gov/documents/2026/07/10/2026-13993/certain-pre-stretched-synthetic-braiding-hair-and-packaging-therefor-notice-of-commission",
    },
    "itc-1457-end": {
        "id": "itc-1457-end", "publisher": "Federal Register", "citation": "91 FR 51743",
        "document": "Notice (USITC), Inv. No. 337-TA-1457",
        "title": "Certain Pre-Stretched Synthetic Braiding Hair and Packaging Thereof (II); Notice of the Commission's Determination To Review in Part a Final Initial Determination Finding No Violation of Section 337; Termination of the Investigation",
        "signed": "2026-08-06", "published": "2026-08-11",
        "url": "https://www.federalregister.gov/documents/2026/08/11/2026-16303/certain-pre-stretched-synthetic-braiding-hair-and-packaging-thereof-ii-notice-of-the-commissions",
    },
    "cbp-h355307": {
        "id": "cbp-h355307", "publisher": "CBP", "citation": "CBP ruling HQ H355307 (affirmed by HQ H361423, June 17, 2026)",
        "document": "Ruling letter (19 U.S.C. 1337)",
        "title": "Limited Exclusion Order, Inv. No. 337-TA-1415: redesigned pre-stretched synthetic braiding hair not subject to the order",
        "signed": None, "published": "2026-04-20", "url": ruling("H355307"),
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


def usd(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e6:
        return f"${v / 1e6:.0f}M" if v >= 1e8 else f"${v / 1e6:.1f}M"
    return f"${v / 1e3:.0f}K"


ui0 = d["understandIndustry"]
LATEST, PRIOR = ui0["latestYear"], ui0["priorYear"]
TOTAL = sum(c["importsUsd"] for c in ui0["byCountry"]) + ui0["othersImportsUsd"]


def imp(name):
    for c in ui0["byCountry"]:
        if c["country"] == name:
            return c
    return None


# Myanmar (Burma): the trade partner has no ISO mapping in the generator, so its imports fall into "Any other
# country" in the matrix. Move them onto the Myanmar row (generator quirk, batch 1).
def trade_partner(*names):
    for c in trade.get("byCountry", trade.get("countries", [])):
        nm = c.get("country") or c.get("name")
        if nm in names:
            return c
    return None


LABELS = {
    "6701": ("Bird skins with feathers, prepared feathers and down, and articles of feathers or down (boas, fans, trims)", "Feathers & down"),
    "6702": ("Artificial flowers, foliage and fruit and their parts; articles made of them (wreaths, garlands, artificial plants)", "Artificial flowers"),
    "6703": ("Human hair, dressed, bleached or otherwise worked; wool, animal hair or textile fibers prepared for wigs", "Worked human hair"),
    "6704": ("Wigs, hair extensions, false eyelashes and beards, switches and the like, of synthetic fibers, human hair or other materials", "Wigs & hair extensions"),
}

NEW_SOURCES["fr-2019-27306"] = {
    "id": "fr-2019-27306", "publisher": "Federal Register", "citation": "84 FR 69447", "document": "Notice (USTR)",
    "title": "Notice of Modification of Section 301 Action: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation (List 4B suspended)",
    "signed": None, "published": "2019-12-18",
    "url": "https://www.federalregister.gov/documents/2019/12/18/2019-27306/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to",
}

NEW_SOURCES["fr-2026-15628"] = {
    "id": "fr-2026-15628", "publisher": "Federal Register", "citation": "91 FR 48913", "document": "Notice (DHS)",
    "title": "Notice Regarding the Uyghur Forced Labor Prevention Act Entity List", "signed": None, "published": "2026-08-03",
    "url": "https://www.federalregister.gov/documents/2026/08/03/2026-15628/notice-regarding-the-uyghur-forced-labor-prevention-act-entity-list",
}

ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO_LIST = "No Chapter 67 line is on the general exemption list (U.S. note 52(b)) or on this country's exception list in note 52(j). "
CN_LISTS = (
    "List 3 (+25%, 9903.88.03) covers the two feather lines (6701.00.30, .60); List 4A (+7.5%, 9903.88.15) covers feather "
    "flowers (6702.90.10), other artificial flowers (6702.90.65), worked hair (6703.00.30, .60), synthetic wigs and hairpieces "
    "(6704.11, 6704.19) and wigs of other materials (6704.90). Plastic flowers (6702.10), man-made-fiber flowers (6702.90.35) "
    "and human-hair wigs and extensions (6704.20) were only on List 4B, which USTR suspended in December 2019, so they pay no "
    "2018–2019 duty"
)

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 67 Tariff Updates: Wigs, Hair Extensions, Artificial Flowers & Feathers (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 67 Tariff Updates 2026: Wigs, Human Hair & Artificial Flowers — Section 301, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 67 wigs, hair extensions, eyelashes, artificial flowers and feather articles since January "
    "2025: unchanged base rates, the IEEPA tariffs and their end, the Section 122 surcharge, the 2026 Section 301 tariffs on "
    "Indonesia, Vietnam and India, China's List 3 and 4A duties and Canada's 50% duty on synthetic hairpieces."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 67 tariff updates",
    "hts chapter 67 import duty",
    "section 301 human hair wigs tariff",
    "china section 301 wigs import duty",
    "synthetic wigs import duty rates",
    "section 301 artificial flowers tariff",
    "hts 6704 wig tariff updates",
    "tariff on wigs from china",
]
tu["scope"] = (
    "Measures that reach Chapter 67 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 "
    "tariff, China Section 301 Lists 3 and 4A, the Canada Section 338 duty on 6704.19, Russia's rate in lieu of column 2 on "
    "human hair, the Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended; plus the "
    "Section 337 exclusion order on certain pre-stretched synthetic braiding hair. No antidumping or countervailing duty order "
    "and no Section 232 action covers a Chapter 67 line. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "13 of 13 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China), Canada Section 338, Russia"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "cn": (
        "Two Section 301 duties can stack. The 2026 action adds +12.5% (9903.05.31) on all 13 lines. " + CN_LISTS + ". No "
        "China exclusion now in effect names a Chapter 67 product. USTR confirmed on October 7, 2026 that the 2018–2019 actions "
        "continue. The IEEPA duties on China (20% fentanyl, cut to 10% on November 10, 2025, plus 10% reciprocal) ended February "
        "24, 2026.",
        "Chinese synthetic wigs, braiding hair and eyelashes pay 20% (7.5% + 12.5%) on a Free base; human-hair wigs and "
        "extensions pay 12.5%; feather boas and trims 42.2%; plastic flowers 15.9%–20.9%; silk-type flowers of other "
        "materials 37%.",
    ),
    "id": (
        NO_LIST + "The 19% IEEPA reciprocal duty (9903.02.27) ended February 24, 2026; the Section 122 surcharge expired July "
        "23, 2026.",
        "Indonesian wigs, hair extensions and false eyelashes pay 10% on a Free base; artificial flowers pay the base rate plus "
        "10%.",
    ),
    "vn": (
        NO_LIST + "The 20% IEEPA reciprocal duty on Vietnam (9903.02.69) ended February 24, 2026; the 10% Section 122 surcharge "
        "expired July 23, 2026.",
        "Vietnamese wigs and hair extensions pay 12.5%; artificial flowers the base rate plus 12.5% (15.9%–29.5%).",
    ),
    "in": (
        NO_LIST + "GSP (SPI A*), printed on the dutiable lines, has been expired since December 31, 2020. The 25% reciprocal "
        "duty (9903.02.26) and the extra 25% (9903.01.84, ended February 7, 2026) are gone. " + ENDED,
        "Indian human hair (6703.00.30) and human-hair wigs and extensions (6704.20) pay 10% on a Free base.",
    ),
    "kr": (
        "Korea pays 12.5% in total in place of the base rate where the base rate is lower (9903.05.71). Every Chapter 67 line is "
        "Free under the Korea FTA (SPI KR) or at the general rate, so qualifying Korean goods pay 12.5%. No Chapter 67 line is "
        "on the general exemption list. The 15% IEEPA rate ended February 24, 2026.",
        "Korean wigs, hair extensions and artificial flowers pay 12.5% in total.",
    ),
    "th": (
        NO_LIST + "GSP has been expired since December 31, 2020. The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, "
        "2026; the Section 122 surcharge expired July 23, 2026.",
        "Thai goods pay the base rate plus 12.5%.",
    ),
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94) and no base rate. Under General Note 11, "
        "headings 6702–6704 need only a change from another heading, so wigs made in Mexico from imported worked hair (6703) "
        "qualify. The 25% IEEPA duty on Mexico (9903.01.01) ended February 24, 2026.",
        "Mexican goods that qualify for USMCA pay $0; goods without a valid claim pay the base rate plus 10%.",
    ),
    "ca": (
        "Two duties. Section 301 (+10%, 9903.05.29) is lifted for USMCA-qualifying goods (9903.05.93). The Section 338 duty "
        "(+50%, 9903.03.14, Proclamation 11048) covers 6704.19 — synthetic hairpieces, extensions and eyelashes other than "
        "complete wigs (U.S. note 51(b)(3)) — and applies even when USMCA is claimed (note 51(a)). It took effect August 22, "
        "2026 after a 3-day suspension; Proclamation 11065 revised the list from September 15 and kept 6704.19. The 35% IEEPA "
        "duty ended February 24, 2026.",
        "Canadian synthetic hairpieces and extensions (6704.19) pay 50% with a USMCA claim and 60% without; every other Canadian "
        "Chapter 67 good pays $0 with USMCA.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). The note 50(a)(ii) exemption list names no Chapter 67 code. The 40% IEEPA duty on Brazil ended February "
        "24, 2026.",
        "Brazilian goods pay the base rate plus 37.5%.",
    ),
    "eu": (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at 10% or more no Section 301 duty is due "
        "(9903.05.38) — that covers other artificial flowers (6702.90.65, 17%). The EU exception list (note 52(j)(2)) names no "
        "Chapter 67 line. This replaced the 15% IEEPA rate (9903.02.20), which ended February 24, 2026.",
        "German, Italian or French wigs pay 10%; artificial flowers 10%, or 17% for 6702.90.65.",
    ),
    "gb": (
        NO_LIST + "The 10% IEEPA reciprocal duty ended February 24, 2026.",
        "British goods pay the base rate plus 10%.",
    ),
    "jp": (
        "Japan pays 12.5% in total in place of the base rate where the base rate is lower (9903.05.49); 6702.90.65 (17%) pays only "
        "its base rate. The Japan exception list names no Chapter 67 line. The 15% IEEPA rate ended February 24, 2026.",
        "Japanese wigs and hair goods pay 12.5% in total.",
    ),
    "ru": (
        "Russia's normal trade relations were suspended in 2022, so column 2 rates apply (60%–90% on feathers and flowers, 35% "
        "on most hair and wigs). Human hair (6703.00.30) pays 35% in place of its 20% column 2 rate (9903.90.08, Proclamation "
        "10420). The 2026 Section 301 action adds +12.5% (9903.05.66) on every line.",
        "Russian human hair pays 47.5%; other Chapter 67 goods pay the column 2 rate plus 12.5%.",
    ),
    "other": (
        "No Chapter 67 line is on the general exemption list (note 52(b)) or on any country exception list in note 52(j). "
        "Switzerland and Taiwan pay 12.5% and 10% in total where the base rate is lower. " + ENDED,
        "Bangladeshi, Cambodian, Pakistani and Sri Lankan wigs and hair goods pay 10%; Philippine goods 12.5%. Countries outside "
        "the 60 economies, such as Myanmar, pay only the base rate — Free on hair, wigs and extensions.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    if key in IE:
        e["exemption"], e["whatItMeans"] = IE[key]
    if key == "cn":
        e["before"] = "+25% (List 3) or +7.5% (List 4A); none on 4 lines"
        e["now"] = "+37.5% (6701), +20% (7 List 4A lines), +12.5% (4 lines)"
        for sid in ("fr-2019-27306",):
            e["sourceIds"].insert(-1, sid)
    if key == "ca":
        e["now"] = "+50% or +60% (6704.19); +10% or none on the rest"
    if key == "ru":
        e["before"] = "Column 2; 35% in place of column 2 on 6703.00.30"
        e["now"] = "Column 2 (35% on 6703.00.30) + 12.5%"
    if key == "other":
        e["country"] = "Other Section 301 economies (incl. Bangladesh, Cambodia, Pakistan, the Philippines, Sri Lanka, Taiwan, Switzerland)"
        e["now"] = "+10% or +12.5% (12.5% in total for Japan and Switzerland, 10% for Taiwan)"
    if key in ("in", "th") and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if key != "ru" and "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")
    if key == "mx":
        e["sourceIds"].insert(-1, "hts-gn11")

add_sources(tu, [
    "fr-2019-27306", "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193",
    "eo-14194", "eo-14195", "eo-14228", "eo-14257", "eo-14266", "eo-14298", "eo-14357", "eo-14326", "eo-14329",
    "eo-14384", "eo-14325", "cbp-gsp", "hts-gn11", "procl-11061", "procl-11062", "procl-11063", "itc-1415-leo",
    "itc-1415-enf-end", "itc-1457-end", "cbp-h355307", "dhs-uflpa-list", "pl-117-78", "fr-2026-15628",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
GEN = {c["id"]: c for c in tu["changes"]}
nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 67 base-rate changes",
        "detail": "All 13 Chapter 67 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 "
        "Basic Edition; no line was added, split or renumbered.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 Lists 3 and 4A continue",
        "detail": "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
        "four-year review. For Chapter 67 this keeps +25% on feather articles (9903.88.03) and +7.5% on seven hair, wig and "
        "flower lines (9903.88.15), on top of the 12.5% 2026 action.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-ban", "type": "reference", "date": "2026-09-29", "dateLabel": "Effective",
        "title": "Canadian import bans do not reach Chapter 67",
        "detail": "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over "
        "800 cc from September 29, 2026. 6704.19 stays on the 9903.03.14 duty list but is not on a ban annex, so it keeps "
        "paying the 50% duty.",
        "before": None, "now": None, "countries": "Canada", "sourceIds": ["procl-11061", "procl-11062", "procl-11063", "hts-now"],
    },
    {
        "id": "ca-338-scope", "type": "reference", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Section 338 motor-vehicle retaliation list revised; 6704.19 stays on it",
        "detail": "Proclamation 11065 modified the list of Canadian products under 9903.03.14 from September 15, 2026. 6704.19 "
        "(synthetic hairpieces, extensions and eyelashes) was not removed.",
        "before": "+50%", "now": "+50%", "countries": "Canada", "sourceIds": ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ca-338", "type": "extraDuty", "date": "2026-08-22", "dateLabel": "Effective",
        "title": "Canada Section 338 duty of 50% on 6704.19",
        "detail": "Proclamation 11048, which answers Canadian treatment of U.S. motor vehicles, put a 50% duty (9903.03.14) on "
        "Canadian goods in the provisions of U.S. note 51(b)(3). The list includes 6704.19: wigs, hairpieces, extensions and "
        "false eyelashes of synthetic fibers other than complete wigs. It is charged even when USMCA is claimed and on top of "
        "the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 after a 3-day suspension "
        "(Proclamation 11056).",
        "before": "None", "now": "+50%", "countries": "Canada",
        "sourceIds": ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "itc-1457", "type": "reference", "date": "2026-08-06", "dateLabel": "Issued",
        "title": "Second braiding-hair patent case ends with no violation",
        "detail": "The ITC ended Investigation 337-TA-1457 (pre-stretched synthetic braiding hair, II) without finding a "
        "violation of Section 337, so no new exclusion order was issued. The September 2025 order from 337-TA-1415 stays in "
        "force.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["itc-1457-end"],
    },
    {
        "id": "uflpa-list", "type": "reference", "date": "2026-08-03", "dateLabel": "Published",
        "title": "UFLPA Entity List updated; Xinjiang hair producers still listed",
        "detail": "DHS added more entities to the UFLPA Entity List. Three hair-products makers — Hetian Haolin Hair Accessories, "
        "the Lop County Hair Product Industrial Park and Lop County Meixin Hair Products — have been on the list since June 21, "
        "2022, so their goods, and goods made wholly or in part in Xinjiang, are presumed made with forced labor and are barred "
        "unless CBP grants an exception.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-15628", "dhs-uflpa-list", "pl-117-78"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover every Chapter 67 line",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84): 12.5% for China, Vietnam, Thailand "
        "and the Philippines, 10% for Indonesia, India, Bangladesh, Pakistan, Cambodia, Mexico and Canada. No Chapter 67 line "
        "is on the general exemption list (U.S. note 52(b)) or on any country exception list (note 52(j)). EU goods pay 10% in "
        "total and Japanese and Korean goods 12.5% in total; USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). "
        "Myanmar is not one of the 60. Because most hair and wig lines are Free, the duty is the whole tariff on them.",
        "before": "None", "now": "+10% / +12.5%", "countries": "60 economies", "sourceIds": S301,
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
        "detail": "25% on goods of Brazil (9903.05.01) on all 13 Chapter 67 lines; none is on the note 50(a)(ii) exemption list. "
        "From July 24 the 12.5% 2026 action (9903.05.27) is added.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "itc-1415-enf", "type": "reference", "date": "2026-07-10", "dateLabel": "Published",
        "title": "Braiding-hair exclusion order: enforcement case closed",
        "detail": "The ITC ended the enforcement proceeding it had opened in January 2026 against one respondent after the "
        "complainant withdrew. In April 2026 CBP had ruled that the respondent's redesigned braiding hair is not covered by the "
        "order (HQ H355307, affirmed June 17, 2026).",
        "before": None, "now": None, "countries": "All", "sourceIds": ["itc-1415-enf-end", "cbp-h355307"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in "
        "force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 67 line was on the product "
        "exemption list (9903.03.03), so wigs, hair, artificial flowers and feather goods all paid it. USMCA-qualifying goods "
        "from Canada and Mexico were exempt.",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP "
        "stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings "
        "are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-oil-end", "type": "extraDuty", "date": "2026-02-07", "dateLabel": "Effective",
        "title": "Extra 25% on products of India ended",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) that had applied since "
        "August 27, 2025. India's 25% reciprocal duty continued until February 24, 2026.",
        "before": "+25%", "now": "None", "countries": "India", "sourceIds": ["eo-14384", "eo-14329"],
    },
    nic,
    {
        "id": "cn-fentanyl-10", "type": "extraDuty", "date": "2025-11-10", "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "Executive Order 14357 lowered the IEEPA duty on products of China (9903.01.24) from 20% to 10%. Chinese "
        "synthetic wigs then paid 10% + 10% reciprocal + 7.5% List 4A. Ended February 24, 2026.",
        "before": "+20%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14357"],
    },
    {
        "id": "itc-1415", "type": "reference", "date": "2025-09-29", "dateLabel": "Issued",
        "title": "Exclusion order on certain pre-stretched synthetic braiding hair",
        "detail": "After a Section 337 patent case (337-TA-1415), the ITC issued a limited exclusion order barring entry of "
        "infringing pre-stretched synthetic braiding hair (6704.19) and its packaging imported by or for five defaulting "
        "respondents, plus cease and desist orders. It is a patent remedy, not a tariff: other importers' goods and "
        "non-infringing designs are not covered.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["itc-1415-leo"],
    },
    {
        "id": "in-oil", "type": "extraDuty", "date": "2025-08-27", "dateLabel": "Effective",
        "title": "Extra 25% on products of India",
        "detail": "Executive Order 14329 added 25% on Indian goods (9903.01.84) on top of the 25% reciprocal rate, so Indian human "
        "hair and wigs paid 50%. Ended February 7, 2026.",
        "before": "+25%", "now": "+50% (ended)", "countries": "India", "sourceIds": ["eo-14329", "eo-14384"],
    },
    {
        "id": "reciprocal-country", "type": "extraDuty", "date": "2025-08-07", "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates replace the 10% baseline",
        "detail": "Executive Order 14326 set each country's reciprocal rate: Myanmar +40% (9903.02.43); Vietnam and Bangladesh "
        "+20%; Indonesia, Thailand, Cambodia, the Philippines and Pakistan +19%; India +25%; EU, Japanese and Korean goods 15% "
        "in total. No Chapter 67 line was on the reciprocal-tariff exemption list. Ended February 24, 2026.",
        "before": "+10%", "now": "+15% to +40% (ended)", "countries": "Listed countries", "sourceIds": ["eo-14326", "hts-now"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "cn-reciprocal-10", "type": "extraDuty", "date": "2025-05-14", "dateLabel": "Effective",
        "title": "China reciprocal duty cut from 125% to 10%",
        "detail": "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. "
        "Ended February 24, 2026.",
        "before": "+125%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14298"],
    },
    {
        "id": "cn-125", "type": "extraDuty", "date": "2025-04-10", "dateLabel": "Effective",
        "title": "China reciprocal duty raised to 125%; other country rates paused",
        "detail": "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% and paused the higher country rates "
        "for other countries, leaving the 10% baseline. With the 20% fentanyl duty and List 4A, Chinese synthetic wigs paid "
        "152.5% until May 13, 2025.",
        "before": "+34%", "now": "+125% (ended)", "countries": "China; all others", "sourceIds": ["eo-14266", "eo-14257"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) from April 5, 2025 and country rates (9903.02.xx); Canada and Mexico excluded. Hair "
        "and wigs, Free at the general rate, paid it in full. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "cn-fentanyl-20", "type": "extraDuty", "date": "2025-03-04", "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20%, on top of Lists 3 and 4A. "
        "Ended February 24, 2026.",
        "before": "+10%", "now": "+20% (ended)", "countries": "China", "sourceIds": ["eo-14228"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt. Ended February 24, "
        "2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10) from March 4, 2025, later raised to +35%; USMCA-qualifying goods exempt. "
        "Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "cn-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of China",
        "detail": "+10% on all goods of China (9903.01.20) from February 4, 2025, on top of the List 3 and 4A duties. Ended "
        "February 24, 2026.",
        "before": "None", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14195"],
    },
]
nic["dateLabel"] = "Published"
nic["date"] = "2025-12-12"
nic["before"] = "None"
nic["now"] = "0% in 2026 → 10% (2027) → 15% (2028)"
nic["title"] = "Nicaragua Section 301 tariff phases in from 2027"
nic["detail"] = (
    "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
    "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches all 13 Chapter 67 lines; CAFTA-DR-originating "
    "goods are not covered."
)
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Wigs, Human Hair, Artificial Flowers & Feathers (HTS Ch. 67): Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Wigs, Hair Extensions & Feathers: Wild-Bird Feather Ban, Forced-Labor Rules & Ways to Lower Duty (HTS Ch. 67) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, FWS and USDA rules for each HTS Chapter 67 line — the wild-bird feather ban, Migratory Bird Treaty Act permits, "
    "APHIS rules for bird skins, forced-labor orders on Xinjiang hair products, the braiding-hair exclusion order, origin "
    "marking — and the legal ways to pay less: origin, classification, USMCA, FTAs, rulings and drawback."
)
te["seo"]["keywords"] = [
    "chapter 67 tariff engineering",
    "synthetic wigs duty mitigation",
    "artificial flowers tariff engineering",
    "chapter 67 origin engineering",
    "importing feathers into united states",
    "import hair from china",
    "human hair wig tariff code",
]
te["intro"] = (
    "Chapter 67 goods meet **wildlife and forced-labor rules alongside the duty**. Feathers and skins of wild birds may not be "
    "imported at all — raw, processed or as part of another article — except feathers of domesticated species such as "
    "chickens, ducks, geese, turkeys and ostriches; migratory-bird feathers need a **Fish and Wildlife Service permit**, and "
    "bird skins from regions with avian influenza or Newcastle disease fall under **APHIS** rules. Hair products from three "
    "Xinjiang producers are under **CBP withhold release orders** and on the **UFLPA Entity List**, and some pre-stretched "
    "synthetic braiding hair is barred by an ITC patent exclusion order.\n\n"
    "The ways to pay less are in the schedule: know the **country of origin** of the hair (it follows where the hair was "
    "prepared, not where it was sewn), classify **human hair vs. synthetic fiber** and the **flower material** correctly, claim "
    "**USMCA** on goods made in Mexico or Canada, claim an **FTA** where the base rate is the cost, get a **binding ruling** "
    "and claim **drawback** on re-exports. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "origin",
        "title": "Know the country of origin of hair goods: it follows the hair",
        "saves": "The difference between two countries' extra duty — for human-hair wigs and extensions 12.5% (China) vs. 10% "
        "(India, Indonesia) vs. nothing extra (Myanmar); for synthetic wigs 20% (China) vs. 10%–12.5% elsewhere",
        "appliesTo": "Wigs, extensions, wefts and other articles of human hair (6704.20) and worked hair (6703.00) made in one "
        "country from hair prepared in another",
        "document": "Production records showing where the hair was collected, cleaned, dyed and sorted and where the article "
        "was made; a country-of-origin ruling for a new supply chain.",
        "caveat": "CBP found that Indian hair dyed in China and made into wigs and extensions there stays of Indian origin (NY "
        "N349850), and that Chinese hair made into tape-in extensions in Indonesia stays Chinese (NY N354172): sewing, gluing and taping are simple assembly. Origin is not a way around the forced-labor rules.",
        "citations": [
            {"label": "CBP ruling NY N349850 (Indian hair made into wigs in China: origin India)", "url": ruling("N349850")},
            {"label": "CBP ruling NY N354172 (Chinese hair made into extensions in Indonesia: origin China)", "url": ruling("N354172")},
            {"label": "19 CFR 134.1 (country of origin)", "url": ecfr(19, "134.1")},
        ],
    },
    {
        "id": "material",
        "title": "Classify by material: human hair, synthetic fiber or other",
        "saves": "From China, 7.5 points: human-hair wigs and extensions (6704.20) are not on List 4A and pay 12.5%; synthetic "
        "wigs, hairpieces and eyelashes (6704.11, 6704.19) and other materials (6704.90) pay 20%. From Canada, 6704.19 carries "
        "the 50% Section 338 duty and 6704.20 does not",
        "appliesTo": "Wigs, extensions, wefts, closures, false eyelashes and hairpieces (6704.11–6704.90)",
        "document": "Fiber content of the hair (human, synthetic such as modacrylic or polyester, or animal hair such as mink "
        "or horsehair), declared on the invoice; a ruling for blends.",
        "caveat": "The material must be stated truthfully; a blend is classified by the material that gives it its essential "
        "character. Synthetic eyelashes are 6704.19 (NY N293065), human-hair wefts and wigs 6704.20 (NY N305621).",
        "citations": [
            {"label": "HTSUS Chapter 67 (heading 6704)", "url": CH67},
            {"label": "CBP ruling NY N305621 (human-hair wefts, closures, wigs, extensions: 6704.20)", "url": ruling("N305621")},
            {"label": "CBP ruling NY N293065 (synthetic magnetic eyelashes: 6704.19)", "url": ruling("N293065")},
            {"label": "CBP ruling NY N352618 (synthetic braided and dreadlock extensions: 6704.19)", "url": ruling("N352618")},
        ],
    },
    {
        "id": "flowers",
        "title": "Classify artificial flowers by material and construction",
        "saves": "Base rates from 3.4% to 17%: plastic flowers assembled by binding or gluing 8.4% (6702.10.20), other plastic "
        "flowers and parts 3.4% (6702.10.40), feather flowers 4.7%, man-made-fiber (polyester \"silk\") flowers 9% "
        "(6702.90.35), other materials such as real silk, cotton or paper 17% (6702.90.65). From China, 6702.90.10 and .65 also "
        "pay List 4A (+7.5%)",
        "appliesTo": "Artificial flowers, foliage, fruit, wreaths, garlands and artificial plants (6702)",
        "document": "A product description stating the material of the flowers and foliage and how they are put together "
        "(bound with wire or tape, glued, or molded in one piece).",
        "caveat": "Chapter 67 note 3 sends flowers of glass to chapter 70 and one-piece molded or carved flowers of pottery, "
        "stone, metal or wood out of 6702. Polyester petals were classified in 6702.90.35 (NY N358275) and plastic wreaths in "
        "6702.10.20 (NY N364270).",
        "citations": [
            {"label": "HTSUS Chapter 67 (heading 6702, note 3)", "url": CH67},
            {"label": "CBP ruling NY N358275 (polyester flower petals: 6702.90.35)", "url": ruling("N358275")},
            {"label": "CBP ruling NY N364270 (decorative artificial wreath: 6702.10.20)", "url": ruling("N364270")},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on goods made in Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 17%)",
        "appliesTo": "All 13 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format. Headings 6702–6704 need "
        "only a change from another heading (General Note 11), so wigs made from imported worked hair (6703) and flowers made "
        "from imported fabric qualify; feather articles may be made from imported feathers.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on 6704.19 (U.S. note 51(a)). The USMCA was not "
        "renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 67 rule)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": src("ustr-usmca-review")["url"]},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate on the 7 dutiable lines: up to 17% on artificial flowers, 4.7% on feather articles",
        "appliesTo": "Feathers and down (6701) and artificial flowers (6702) from Australia, Bahrain, Chile, Colombia, Israel, "
        "Jordan, Korea, Morocco, Oman, Panama, Peru, Singapore, CAFTA-DR and CBERA countries, and AGOA countries (through "
        "December 31, 2026)",
        "document": "Proof of origin under the program and the SPI on the entry line (AU, BH, CL, CO, IL, JO, KR, MA, OM, PA, "
        "PE, SG, P, E or D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)); Korea then pays 12.5% in total. GSP "
        "(A*) has been expired since December 31, 2020. Hair and wig lines are already Free, so an FTA saves nothing there.",
        "citations": [
            {"label": "HTSUS General Notes", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status", "url": src("cbp-gsp")["url"]},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the line decides the rate: human hair vs. synthetic (12.5% vs. 20% from China); worked hair "
        "(6703) vs. unworked hair (0501); feather articles (6701) vs. raw feathers (0505) or goods merely trimmed with feathers; "
        "the five artificial-flower lines",
        "appliesTo": "Any line where classification or origin is in doubt",
        "document": "A ruling request to CBP describing the product, its materials and construction (19 CFR part 177). "
        "Published rulings such as N306080 (feather boas, 6701.00.30), N352618 (synthetic extensions), N305621 (human-hair "
        "wigs) and N349850 (origin of hair goods) show how CBP decides.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "CBP ruling NY N306080 (turkey-feather boas: 6701.00.30)", "url": ruling("N306080")},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported goods re-exported or used in exported "
        "goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing "
        "ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
]
te["rules"] = [
    {
        "id": "bird-feather-ban", "agency": "CBP",
        "title": "Feathers and skins of any bird may not be imported — raw or processed, whole or in part, loose or forming part "
        "of another article — except feathers of chickens, turkeys, guineas, geese, ducks, pigeons, ostriches, rheas, English "
        "ring-necked pheasants and peafowl that are not wild birds, imports for scientific or educational use, fully "
        "manufactured fishing flies and live birds; small quotas of jungle-fowl, mandarin-duck and pheasant skins for fly-tying "
        "or millinery need an FWS permit",
        "citations": [
            {"label": "HTSUS Ch. 5, Additional U.S. Note 1", "url": CH05},
            {"label": "19 CFR 12.29", "url": ecfr(19, "12.29")},
        ],
    },
    {
        "id": "fws-mbta", "agency": "U.S. Fish and Wildlife Service",
        "title": "Feathers and parts of birds on the Migratory Bird Treaty Act list need an FWS migratory-bird import permit; "
        "feathers of lawfully taken migratory waterfowl may be used commercially for pillows and similar goods",
        "citations": [
            {"label": "16 U.S.C. 703", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap7-subchapII-sec703.htm"},
            {"label": "50 CFR 10.13 (list of migratory birds)", "url": ecfr(50, "10.13")},
            {"label": "50 CFR 21.10", "url": ecfr(50, "21.10")},
            {"label": "50 CFR 21.67 (import and export permits)", "url": ecfr(50, "21.67")},
            {"label": "50 CFR 20.91 (commercial use of feathers)", "url": ecfr(50, "20.91")},
        ],
    },
    {
        "id": "fws-wildlife", "agency": "U.S. Fish and Wildlife Service",
        "title": "Feathers, skins and other parts of wild birds are wildlife: declare them to FWS (Form 3-177) at a designated "
        "port, hold an import/export license for commercial shipments, and get CITES documents for listed species; wildlife "
        "taken or exported in violation of foreign law is barred (Lacey Act)",
        "citations": [
            {"label": "50 CFR 14.61", "url": ecfr(50, "14.61")},
            {"label": "50 CFR 14.11", "url": ecfr(50, "14.11")},
            {"label": "50 CFR 14.91", "url": ecfr(50, "14.91")},
            {"label": "50 CFR part 23 (CITES)", "url": ecfr_part(50, 23)},
            {"label": "16 U.S.C. 3372", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm"},
        ],
    },
    {
        "id": "aphis-birds", "agency": "USDA APHIS",
        "title": "Bird skins, trophies and other parts of bird carcasses from regions with Newcastle disease or highly "
        "pathogenic avian influenza enter only under APHIS conditions (certificate of origin from a free region, or handling at "
        "an approved establishment). Raw feathers not further worked than cleaned are classified in heading 0505, not "
        "Chapter 67",
        "citations": [
            {"label": "9 CFR 95.16(c)", "url": ecfr(9, "95.16")},
            {"label": "9 CFR 95.17", "url": ecfr(9, "95.17")},
            {"label": "9 CFR 94.6", "url": ecfr(9, "94.6")},
        ],
    },
    {
        "id": "aphis-hair", "agency": "USDA APHIS",
        "title": "Wool and hair of ruminants or swine (for example yak or goat hair prepared for wigs) enter freely if scoured, "
        "washed or dyed or from a region free of foot-and-mouth disease; otherwise they go to an approved establishment. "
        "Human hair is not covered",
        "citations": [
            {"label": "9 CFR 95.18", "url": ecfr(9, "95.18")},
            {"label": "9 CFR 95.19", "url": ecfr(9, "95.19")},
        ],
    },
    {
        "id": "forced-labor", "agency": "CBP / DHS",
        "title": "Goods made with forced labor are barred. CBP withhold release orders cover hair products of Hetian Haolin Hair "
        "Accessories (May 2020), Lop County Meixin Hair Product Co. (June 2020) and the Lop County Hair Product Industrial "
        "Park (September 2020); all three are on the UFLPA Entity List, and any goods made wholly or in part in Xinjiang are "
        "presumed barred unless the importer rebuts the presumption",
        "citations": [
            {"label": "19 U.S.C. 1307", "url": src("usc-19-1307")["url"]},
            {"label": "19 CFR 12.42", "url": ecfr(19, "12.42")},
            {"label": "CBP WRO: Hetian Haolin hair products (May 1, 2020)", "url": src("cbp-wro-haolin")["url"]},
            {"label": "CBP WRO: Lop County Meixin hair products (June 17, 2020)", "url": src("cbp-wro-meixin")["url"]},
            {"label": "DHS: WRO on Lop County Hair Product Industrial Park (September 14, 2020)", "url": src("dhs-wro-2020-09")["url"]},
            {"label": "Pub. L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "DHS UFLPA Entity List", "url": src("dhs-uflpa-list")["url"]},
        ],
    },
    {
        "id": "itc-exclusion", "agency": "USITC / CBP",
        "title": "A Section 337 limited exclusion order (Inv. 337-TA-1415, September 29, 2025) bars infringing pre-stretched "
        "synthetic braiding hair and its packaging imported by or for five named respondents; CBP rules on whether redesigns "
        "are covered",
        "citations": [
            {"label": "90 FR 47821 (ITC final determination)", "url": src("itc-1415-leo")["url"]},
            {"label": "CBP ruling HQ H355307", "url": src("cbp-h355307")["url"]},
            {"label": "19 CFR 12.39", "url": ecfr(19, "12.39")},
        ],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on each article (or its retail container when the article cannot be marked), in "
        "English; loose feathers are on the J-list of articles excepted from individual marking, but the container must be "
        "marked",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
            {"label": "19 CFR 134.33 (J-list)", "url": ecfr(19, "134.33")},
        ],
    },
    {
        "id": "aphis-packaging", "agency": "USDA APHIS",
        "title": "Wood pallets and crates must be ISPM 15 treated and marked",
        "citations": [{"label": "7 CFR 319.40-3(b)", "url": ecfr(7, "319.40-3")}],
    },
]
GROUP_RULES = {
    "6701": ["bird-feather-ban", "fws-mbta", "fws-wildlife", "aphis-birds", "cbp-marking", "aphis-packaging"],
    "6702": ["bird-feather-ban", "cbp-marking", "aphis-packaging"],
    "6703": ["forced-labor", "aphis-hair", "cbp-marking", "aphis-packaging"],
    "6704": ["forced-labor", "itc-exclusion", "aphis-hair", "cbp-marking", "aphis-packaging"],
}
GROUP_NOTES = {
    "6701": "Only feathers of domesticated species (chickens, ducks, geese, turkeys, ostriches, pigeons, guineas, rheas, "
    "ring-necked pheasants, peafowl) may be imported commercially; wild-bird feathers are barred and migratory-bird feathers "
    "need an FWS permit. Bird skins from avian-influenza regions fall under APHIS rules. From China, List 3 adds 25%.",
    "6702": "Flowers made with real feathers (6702.90.10) are subject to the wild-bird feather ban. The rate turns on the "
    "material: plastic 3.4% or 8.4%, man-made fibers 9%, other 17%. From China, feather and \"other\" flowers also pay List 4A.",
    "6703": "Worked human hair is Free at the general rate; the extra duty by country is the whole tariff. Hair from three "
    "Xinjiang producers is barred under withhold release orders and the UFLPA. Russian human hair pays 35% in place of "
    "column 2.",
    "6704": "Free at the general rate on every line. The forced-labor bars on Xinjiang hair reach wigs and extensions made "
    "from it; certain pre-stretched synthetic braiding hair is under an ITC exclusion order. Canadian 6704.19 pays 50% "
    "Section 338 duty even with USMCA.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["ruleIds"] = GROUP_RULES[h]
    g["note"] = GROUP_NOTES[h]
rt_rows = {r["hts"]: r for r in d["overview"]["rateTable"]["rows"]}
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    ids = list(GROUP_RULES[h])
    if hts.startswith("6702") and not hts.startswith("6702.90.10"):
        ids.remove("bird-feather-ban")
    if h == "6704" and not hts.startswith("6704.19"):
        ids.remove("itc-exclusion")
    if hts.startswith(("6703.00.30", "6704.11", "6704.19", "6704.20")):
        ids.remove("aphis-hair")
    ln["ruleIds"] = ids
    levers = []
    if h in ("6703", "6704"):
        levers += ["origin", "material"] if h == "6704" else ["origin"]
    if h == "6702":
        levers.append("flowers")
    levers.append("usmca")
    gen_rate = (rt_rows.get(hts) or {}).get("effectiveGeneral")
    if gen_rate and gen_rate != "Free":
        levers.append("fta")
    levers += ["ruling", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. FWS permit and APHIS disease-region "
    "requirements, the UFLPA Entity List and exclusion orders change; check them before each shipment."
)

# ---------------------------------------------------------------- industry areas (rules; trade prose below)
ia = d["industryAreas"]
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
RULE_LABELS = {
    "China": "Base rate plus 12.5% (9903.05.31) on all 13 lines, plus List 3 (+25%, 9903.88.03) on feather articles and List 4A (+7.5%, 9903.88.15) on 7 hair, wig and flower lines: 42.2% on feather goods, 20% on synthetic wigs, extensions and eyelashes, 12.5% on human-hair wigs (6704.20), 15.9%–37% on artificial flowers. No China exclusion covers a Chapter 67 product.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on all 13 lines: 10% on wigs, hair extensions and eyelashes. No exception list covers a Chapter 67 line. The 19% IEEPA reciprocal duty ended February 24, 2026.",
    "Myanmar (Burma)": "Not one of the 60 Section 301 economies: base rate only, so hair, wigs and extensions enter Free. The 40% IEEPA reciprocal duty ended February 24, 2026.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on all 13 lines. The 20% IEEPA reciprocal duty ended February 24, 2026.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on all 13 lines: 10% on human hair and human-hair wigs. GSP has expired; the IEEPA duties (25% + 25%) ended in February 2026.",
    "South Korea": "12.5% in total in place of the base rate (9903.05.71); every line is Free under the Korea FTA, so qualifying goods pay 12.5%. The 15% IEEPA rate ended February 24, 2026.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on all 13 lines. GSP has expired.",
    "Philippines": "Base rate plus 12.5% Section 301 (9903.05.64) on all 13 lines. GSP has expired; the 19% IEEPA duty ended February 24, 2026.",
    "Bangladesh": "Base rate plus 10% Section 301 (9903.05.26) on all 13 lines; Bangladesh's exception list names no Chapter 67 line. The 20% IEEPA duty ended February 24, 2026.",
    "Cambodia": "Base rate plus 10% Section 301 (9903.05.28) on all 13 lines; Cambodia's exception list names no Chapter 67 line. The 19% IEEPA duty ended February 24, 2026.",
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62) on all 13 lines. The 19% IEEPA duty ended February 24, 2026.",
    "Sri Lanka": "Base rate plus 10% Section 301 (9903.05.72) on all 13 lines. The 20% IEEPA duty ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on 6704.19 even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 60% on 6704.19.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) Section 301 on all 13 lines: 37.5% on wigs and hair. The 40% IEEPA duty ended February 24, 2026.",
    "Germany": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is under 10%; 6702.90.65 (17%) pays only its base rate (9903.05.38). The 15% IEEPA rate ended February 24, 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on all 13 lines; the UK exception list names no Chapter 67 line.",
    "Japan": "12.5% in total in place of the base rate (9903.05.49); 6702.90.65 (17%) pays only its base rate. The 15% IEEPA rate ended February 24, 2026.",
    "Taiwan": "10% in total in place of the base rate (9903.05.76); 6702.90.65 (17%) pays only its base rate.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% (9903.05.20–9903.05.84), or 37.5% more for Brazil. No note 52(j) country list names a Chapter 67 line. Russia, Belarus, Cuba and North Korea pay column 2 rates.",
}
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section "
    "122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Canada: the 50% Section 338 duty (U.S. note 51) applies to 6704.19 whether or not USMCA is claimed; no Chapter 67 line is "
    "on the September 29, 2026 import-ban annexes.",
    "Myanmar's imports are matched by name: UN Comtrade reports it as \"Myanmar\", which the generator does not map to an ISO "
    "code, so its figures were moved from \"Any other country\" to the Myanmar row.",
    "Not in the grid: admissibility rules — the wild-bird feather ban, FWS permits, APHIS rules for bird skins, forced-labor "
    "orders on Xinjiang hair products and the ITC exclusion order on certain braiding hair (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86), "
    "the general exemption list, names no Chapter 67 code, and no note 52(j) country exception list (Switzerland, Malaysia, "
    "Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Indonesia, Ecuador, Jordan, the UK, the EU, Japan) names "
    "one. Note 50(a)(ii) names none for Brazil. Note 20(f) puts 6701.00.30 and .60 on China List 3; note 20(s) puts "
    "6702.90.10, 6702.90.65, 6703.00.30, 6703.00.60, 6704.11, 6704.19 and 6704.90 on List 4A; 6702.10.20, 6702.10.40, "
    "6702.90.35 and 6704.20 appear only on List 4B (note 20(u), suspended). No China exclusion in note 20 and no 2024 increase "
    "in note 31 names a Chapter 67 code. Note 51(b)(3) puts 6704.19 on the Canada Section 338 list (9903.03.14). Note 30 "
    "puts 6703.00.30 under 9903.90.08 (Russia, 35%). The temporary reductions for terrarium plants (9902.14.67, .68) expired "
    "December 31, 2020. No Section 232 heading and no antidumping or countervailing duty order covers a Chapter 67 line."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "cbp-gsp", "fr-2019-27306"])

# ---------------------------------------------------------------- FAQ (non-trade answers)
FAQS = [
    {
        "id": "hs-wigs",
        "question": "What is the HTS code for wigs?",
        "searchedAs": ["hts code for wigs", "hs code for wigs", "hs code for synthetic wigs", "hs code for human hair wigs", "wig tariff number", "synthetic wig tariff code", "human hair wig tariff code", "tariff code for wig"],
        "answer": "Heading 6704. Complete wigs of synthetic fibers are 6704.11.00; wigs, hairpieces and extensions of human hair are 6704.20.00; wigs of other materials such as animal hair are 6704.90.00. All are Free at the general rate, so the extra duty for the country of origin is the whole tariff: from China 20% on synthetic wigs and 12.5% on human-hair wigs.",
        "link": "",
    },
    {
        "id": "hs-extensions",
        "question": "What is the HS code for hair extensions and hair weave?",
        "searchedAs": ["hts code for hair extensions", "hs code for hair extensions", "hs code for human hair extensions", "hs code for synthetic hair extensions", "hs code for hair weave", "hs code for braiding hair", "hts code for synthetic hair", "synthetic hair piece hs code"],
        "answer": "Extensions, wefts, closures and frontals of human hair are 6704.20.00 (CBP ruling N305621). Synthetic extensions, braiding hair and hairpieces other than complete wigs are 6704.19.00 (N352618). Both are Free at the general rate. From China, 6704.19 pays 20% and 6704.20 pays 12.5%; from Canada, 6704.19 pays the 50% Section 338 duty even with USMCA.",
        "link": "tariff-engineering",
    },
    {
        "id": "hs-eyelashes",
        "question": "What is the HS code for false eyelashes?",
        "searchedAs": ["hts code for eyelashes", "hs code for eyelashes", "false eyelashes hs code", "hs code for false eyelashes", "hs code for eyelashes extension", "hs code for artificial eyelashes", "section 301 duty on synthetic eyelashes"],
        "answer": "Heading 6704 names eyelashes. Synthetic-fiber lashes are 6704.19.00 (CBP ruling N293065 for magnetic lashes), human-hair lashes 6704.20.00 and lashes of animal hair such as mink 6704.90.00. All are Free at the general rate; from China synthetic and mink lashes pay 20% (12.5% + 7.5% List 4A), from Indonesia 10%.",
        "link": "",
    },
    {
        "id": "hs-human-hair",
        "question": "What is the HS code for human hair?",
        "searchedAs": ["human hair hs code", "hs code for human hair", "us hts code for human hair", "hs code 6703", "hs code 6703.00", "human hair tariff number", "tariff code for human hair"],
        "answer": "Human hair that has been dressed, thinned, bleached or otherwise worked is 6703.00.30; wool, animal hair or textile fibers prepared for making wigs are 6703.00.60. Raw, unworked human hair is 0501.00.00 (Chapter 5). Worked hair is Free at the general rate; from China it pays 20% (List 4A + 12.5%), from India 10%, and from Russia 35% in place of column 2 plus 12.5%.",
        "link": "",
    },
    {
        "id": "hs-flowers",
        "question": "What is the HS code for artificial flowers?",
        "searchedAs": ["hts code for artificial flowers", "hs code for artificial flowers", "hs code for plastic flowers", "silk flowers hs code", "hs tariff code for artificial flowers", "hs code 6702", "hs code 6702.10", "hs code 6702.90", "hts 6702.10.20"],
        "answer": "Heading 6702. Plastic flowers assembled by binding or gluing are 6702.10.20 (8.4%) and other plastic flowers and parts 6702.10.40 (3.4%); flowers of feathers are 6702.90.10 (4.7%), of man-made fibers such as polyester \"silk\" 6702.90.35 (9%) and of other materials 6702.90.65 (17%). Wreaths and garlands of artificial flowers are classified here too.",
        "link": "",
    },
    {
        "id": "hs-feathers",
        "question": "What is the HS code for feathers and feather boas?",
        "searchedAs": ["hs code for feathers", "hts code for feathers", "hs code 6701", "feather boa hs code"],
        "answer": "Worked feathers, down, bird skins with their feathers and articles of them are 6701: articles such as boas, fans and trims 6701.00.30, other 6701.00.60, both 4.7%. CBP classified turkey-feather boas in 6701.00.30 (N306080). Feathers only cleaned, disinfected or preserved are 0505, bedding filled with down is 9404, and from China 6701 pays 42.2%.",
        "link": "",
    },
    {
        "id": "china-wigs",
        "question": "What are the tariffs on wigs from China?",
        "searchedAs": ["tariff on wigs", "tariff on wigs from china", "tariffs on wigs from china to usa", "china section 301 wigs import duty", "section 301 human hair wigs tariff"],
        "answer": "Synthetic wigs, hairpieces and extensions (6704.11, 6704.19) and wigs of other materials (6704.90) pay 20%: List 4A 7.5% (9903.88.15) plus 12.5% under the 2026 Section 301 action (9903.05.31). Human-hair wigs and extensions (6704.20) were only on the suspended List 4B, so they pay 12.5%. The 2025 IEEPA duties, which took Chinese wigs to as much as 152.5%, ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "extensions-tariff",
        "question": "Are there tariffs on hair extensions?",
        "searchedAs": ["hair extensions tariff", "are there tariffs on hair extensions", "tariff on hair weave", "human hair tariff", "human hair extensions import duty rates"],
        "answer": "The general rate is Free, but since July 24, 2026 the Section 301 tariff on 60 economies applies: 10% from Indonesia, India and Bangladesh, 12.5% from Vietnam and the Philippines, 12.5% (human hair) or 20% (synthetic) from China. Myanmar is not one of the 60, so its extensions enter Free. USMCA-qualifying extensions from Mexico pay nothing.",
        "link": "industry-areas",
    },
    {
        "id": "flowers-duty",
        "question": "What is the import duty on artificial flowers?",
        "searchedAs": ["import duty on artificial flowers", "artificial flowers customs duty", "us import duty on artificial flowers", "plastic artificial flowers customs duty", "how to import artificial flowers from china"],
        "answer": "The base rate is 3.4%–17% by material, plus the country's extra duty. From China: plastic flowers 15.9% or 20.9%, polyester flowers 21.5%, feather flowers 24.7% and other-material flowers 37% (they also pay List 4A). From Vietnam or Thailand the base rate plus 12.5%; from EU countries 10% in total (17% for 6702.90.65).",
        "link": "industry-areas",
    },
    {
        "id": "feathers-import",
        "question": "Can you import feathers into the United States?",
        "searchedAs": ["importing feathers into united states", "importing feathers into usa", "can you import feathers"],
        "answer": "Only feathers of domesticated birds — chickens, turkeys, guineas, geese, ducks, pigeons, ostriches, rheas, English ring-necked pheasants and peafowl that are not wild — may be imported commercially. Feathers and skins of other birds are barred, raw or processed, even as part of another article (HTSUS Chapter 5 note 1, 19 CFR 12.29), with exceptions for science, education and fishing flies. Migratory-bird feathers need an FWS permit.",
        "link": "tariff-engineering",
    },
    {
        "id": "china-hair-forced-labor",
        "question": "Can I import hair products from China?",
        "searchedAs": ["import hair from china", "importing hair products from china", "importing hair from china"],
        "answer": "Yes, but hair products made by Hetian Haolin Hair Accessories, Lop County Meixin Hair Products or in the Lop County Hair Product Industrial Park are under CBP withhold release orders and on the UFLPA Entity List, and any goods made wholly or in part in Xinjiang are presumed made with forced labor and barred. Other Chinese hair goods pay 12.5%–20% extra.",
        "link": "tariff-engineering",
    },
    {
        "id": "hs-6704-subheadings",
        "question": "What do HS codes 6704.11, 6704.19 and 6704.20 mean?",
        "searchedAs": ["hs code 6704", "hs code 6704.20", "hs code 6704.19", "hs code 6704.11", "hts 6704.20.00 import duty"],
        "answer": "6704.11 is complete wigs of synthetic textile materials, 6704.19 other synthetic articles (hairpieces, extensions, braiding hair, eyelashes), 6704.20 wigs and articles of human hair, and 6704.90 the same goods of other materials such as animal hair. All four are Free at the general rate; 6704.20 is the only one not on China's List 4A.",
        "link": "",
    },
]

# ---------------------------------------------------------------- overview (static parts)
ov = d["overview"]
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover: (a) filtering or straining cloth of human hair (heading 5911); (b) floral motifs "
    "of lace, of embroidery or other textile fabric (section XI); (c) footwear (chapter 64); (d) headgear or hair-nets (chapter "
    "65); (e) toys, sports equipment, or carnival articles (chapter 95); or (f) feather dusters, powder-puffs or hair sieves "
    "(chapter 96).\n\n"
    "**Note 2.** Heading 6701 does not cover: (a) articles in which feathers or down constitute only filling or padding (for "
    "example, bedding of heading 9404); (b) articles of apparel or clothing accessories in which feathers or down constitute "
    "no more than mere trimming, filling or padding; or (c) artificial flowers or foliage or parts thereof or made up articles "
    "of heading 6702.\n\n"
    "**Note 3.** Heading 6702 does not cover: (a) articles of glass (chapter 70); or (b) artificial flowers, foliage or fruit "
    "of pottery, stone, metal, wood or other materials, obtained in one piece by molding, forging, carving, stamping or other "
    "process, or consisting of parts assembled otherwise than by binding, gluing, fitting into one another or similar methods."
)
ov["notes"]["additionalUsNotes"] = None
ov["h1"] = "HTS Chapter 67: Wigs, Hair Extensions, Human Hair, Artificial Flowers & Feathers — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 67 Tariff Rates 2026: Wigs, Human Hair Extensions, Eyelashes & Artificial Flowers Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 13 HTS Chapter 67 lines: synthetic and human-hair wigs, hair extensions and braiding hair, "
    "false eyelashes, worked human hair, artificial flowers and feather articles. General, FTA and Column 2 rates plus the 2026 "
    "extra duty by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 67",
    "hts chapter 67 import duty rates",
    "human hair wigs import duty rates",
    "hts 6704.20.00 import duty",
    "synthetic wigs import duty rates",
    "artificial flowers customs duty",
    "hs code for wigs",
    "hs code for hair extensions",
    "section 301 human hair wigs tariff",
    "prepared feathers and down tariff",
]
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
GROUP_BLURB = {
    "6701": (
        "Bird skins with their feathers, worked feathers and down, and articles made of them — feather boas, fans, trims and "
        "decorations. Both lines pay 4.7%; from China List 3 adds 25%. Only feathers of domesticated birds may be imported "
        "commercially.",
        ["feather boa", "feather trim", "ostrich feathers", "peacock feathers", "dyed feathers", "feather fan", "goose down"],
    ),
    "6702": (
        "Artificial flowers, foliage and fruit, their parts, and wreaths, garlands and plants made of them. Plastic flowers "
        "pay 3.4% or 8.4%, polyester (\"silk\") flowers 9%, feather flowers 4.7% and flowers of other materials such as real "
        "silk, cotton or paper 17%.",
        ["artificial flowers", "silk flowers", "plastic flowers", "artificial plants", "fake flowers", "artificial wreath", "artificial greenery", "flower petals"],
    ),
    "6703": (
        "Human hair that has been dressed, thinned, bleached or otherwise worked (6703.00.30), and wool, animal hair or textile "
        "fibers prepared for making wigs (6703.00.60). Both Free; raw unworked hair is 0501.",
        ["human hair bulk", "remy hair", "virgin hair bundles", "hair for wigs", "yak hair"],
    ),
    "6704": (
        "Wigs, hair extensions, wefts, closures, braiding hair, false eyelashes and beards of synthetic fibers (6704.11, "
        "6704.19), human hair (6704.20) or other materials such as animal hair (6704.90). All Free at the general rate; the "
        "extra duty by country is the whole tariff.",
        ["wigs", "human hair wigs", "synthetic wigs", "lace front wig", "hair extensions", "braiding hair", "false eyelashes", "mink lashes", "toupee", "hair weave"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = GROUP_BLURB[g["heading"]]
ov["workedExamples"] = [
    {
        "title": "Synthetic lace-front wigs: China vs Indonesia vs Myanmar",
        "line": "6704.11.00.00",
        "body": "Complete wigs of synthetic fibers are Free at the general rate. From China, List 4A (+7.5%, 9903.88.15) and the "
        "2026 action (+12.5%, 9903.05.31) stack: **$2,000** on a $10,000 shipment. From Indonesia +10% (9903.05.45): **$1,000**. "
        "From Myanmar, which is not one of the 60 Section 301 economies: **$0**.",
    },
    {
        "title": "Human-hair extensions: China vs India",
        "line": "6704.20.00.00",
        "body": "Human-hair wefts and extensions are 6704.20, Free (CBP ruling N305621). The line was only on China's suspended List "
        "4B, so Chinese extensions pay just the 12.5% 2026 duty: **$1,250** on $10,000. Indian extensions pay 10%: **$1,000**. "
        "Extensions made in China from Indian-prepared hair are of Indian origin (N349850).",
    },
    {
        "title": "Synthetic hairpieces from Canada, with a USMCA claim",
        "line": "6704.19.00.00",
        "body": "Synthetic hairpieces, extensions and eyelashes other than complete wigs are 6704.19, Free. A USMCA claim removes "
        "the 10% Section 301 duty, but 6704.19 is on the Section 338 list in U.S. note 51(b)(3) (9903.03.14), charged even with "
        "USMCA: **$2,500** on a $5,000 shipment entered since August 22, 2026. Without USMCA: **$3,000**.",
    },
    {
        "title": "Polyester \"silk\" flowers vs paper flowers from China",
        "line": "6702.90.35.00",
        "body": "Flowers of man-made fibers are 6702.90.35, 9% (NY N358275), and not on List 4A: 9% + 12.5% = **$2,150** on "
        "$10,000. Flowers of paper or real silk fall in 6702.90.65, 17%, which is on List 4A: 17% + 7.5% + 12.5% = **$3,700**.",
    },
]

# ---------------------------------------------------------------- trade-driven content
TOT = TOTAL
PRIOR_TOT = sum(c["priorImportsUsd"] for c in ui0["byCountry"]) + ui0["othersPriorImportsUsd"]
CHG = (TOT - PRIOR_TOT) / PRIOR_TOT * 100
peak = max(trade["totalsByYear"], key=lambda r: r["totalUsd"])
cn, idn, bd, vn, sn = (imp(n) for n in ("China", "Indonesia", "Bangladesh", "Viet Nam", "Senegal"))
hs6 = {l["hs6"]: l for l in ui0["byLine"]}
hcc = {(r["heading"], r["country"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
head_tot = {h["heading"]: h["byYear"][str(LATEST)] for h in trade["byHeading"]}
cn_flower_share = hcc[("6702", "China")] / head_tot["6702"] * 100
cn_wig_share = hcc[("6704", "China")] / head_tot["6704"] * 100


def pct(x):
    return f"{x:.0f}%"


# Myanmar fix in the matrix
mm = trade_partner("Myanmar")
ia_rows = {c["country"]: c for c in ia["countries"]}
mm_row, other_row = ia_rows["Myanmar (Burma)"], ia_rows["Any other country"]
if mm and mm_row["importsUsd"] == 0:
    mm_row["importsUsd"] = mm["importsUsd"]
    other_row["importsUsd"] -= mm["importsUsd"]
    for h in mm_row["cells"]:
        v = hcc.get((h, "Myanmar"), 0)
        mm_row["cells"][h]["importsUsd"] = v
        other_row["cells"][h]["importsUsd"] -= v
for c in ia["countries"]:
    lbl = RULE_LABELS.get(c["country"])
    if c["country"] == "Senegal":
        lbl = ("Not one of the 60 Section 301 economies: base rate only, and AGOA (SPI D, renewed to December 31, 2026) makes "
               "the dutiable lines Free; wigs and hair goods are Free anyway. The IEEPA reciprocal duty ended February 24, 2026.")
    if c["country"] == "Italy":
        lbl = RULE_LABELS["Germany"]
    c["rule"]["label"] = lbl
    sids = c["rule"]["sourceIds"]
    if "eo-14389" not in sids:
        sids.insert(-1 if sids else 0, "eo-14389")
    if c["country"] in ("India", "Thailand", "Bangladesh", "Cambodia"):
        sids.insert(-1, "cbp-gsp")
    if c["country"] == "Senegal":
        c["rule"]["sourceIds"] = ["ustr-agoa-2026", "crs-agoa", "hts-gn16", "eo-14389", "hts-now"]
    if c["country"] == "Myanmar (Burma)":
        c["rule"]["sourceIds"] = ["fr-2026-15181", "eo-14326", "eo-14389", "hts-now"]
    if not c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"] = ["eo-14389", "hts-now"]
add_sources(ia, ["ustr-agoa-2026", "crs-agoa", "hts-gn16", "eo-14326", "fr-2026-15181", "hts-now"])
ia["assumptions"].insert(-2, "Senegal's AGOA claim assumes the goods meet the AGOA origin rules (General Note 16) and are "
                         "imported directly; AGOA runs to December 31, 2026. Its wigs are Free with or without it.")

ia["h1"] = "HTS Chapter 67 Tariff Rates by Country: Wigs, Hair Extensions, Artificial Flowers & Feathers"
ia["seo"]["title"] = "HTS Chapter 67 Import Duty Rates by Country: China, Indonesia, Bangladesh, Vietnam — Wigs & Artificial Flowers | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on wigs, hair extensions, eyelashes, artificial flowers and feather goods by country: base rate plus "
    "the 2026 Section 301 duty, China's List 3 and 4A duties and Canada's 50% duty on synthetic hairpieces, with USMCA, EU, "
    "Korea and AGOA treatment applied."
)
ia["seo"]["keywords"] = [
    "usa tariff on wigs by country",
    "human hair extensions import duty rates",
    "plastic artificial flowers customs duty",
    "hts 6704 wig tariff updates",
    "indonesia wig tariff",
    "bangladesh wigs import duty",
    "china tariff on artificial flowers",
]
ia["intro"] = (
    "The total rate on Chapter 67 goods depends far more on **where they come from** than on what they are. Hair, wigs and "
    "extensions are Free at the general rate, so the country's extra duty is the whole tariff. Each cell below is the base "
    "rate for that product group plus the extra duty for that country, minus any preference — computed from the current "
    "tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026): **10% for Indonesia, Bangladesh, India and Cambodia**, 12.5% for Vietnam and Thailand. **China pays "
    "20% on synthetic wigs and 12.5% on human-hair wigs**, and 15.9%–42.2% on flowers and feather goods. **Senegal and "
    "Myanmar are not among the 60**, so their wigs enter Free; USMCA-qualifying goods from Mexico enter free, and Canadian "
    "synthetic hairpieces (6704.19) pay 50% even with USMCA."
)

tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 13 Chapter 67 lines carry the same base rates in both — "
    "Free on hair, wigs and extensions, 3.4%–17% on artificial flowers and 4.7% on feather goods.\n\n"
    "What changed came on top of the base rate. In 2025 the IEEPA tariffs added 19%–20% on Indonesian, Bangladeshi and "
    "Vietnamese wigs, 40% on Myanmar's, 25%–50% on Indian hair and 20%–145% more on Chinese goods. They **ended on February 24, "
    "2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from "
    "60 economies pay a **Section 301 tariff of 10% or 12.5%**, with no exemption for any Chapter 67 line. China keeps its "
    "List 3 (25%) and List 4A (7.5%) duties, and since **August 22, 2026 Canada pays 50%** under Section 338 on synthetic "
    "hairpieces (6704.19), USMCA claim or not."
)

IE["bd"] = (
    NO_LIST + "GSP has been expired since December 31, 2020. The 20% IEEPA reciprocal duty (9903.02.05) ended February 24, "
    "2026; the Section 122 surcharge expired July 23, 2026.",
    "Bangladeshi wigs and hair extensions pay 10% on a Free base.",
)
IE["kh"] = (
    NO_LIST + "The 19% IEEPA reciprocal duty (9903.02.11) ended February 24, 2026; the Section 122 surcharge expired July 23, "
    "2026.",
    "Cambodian wigs pay 10%; artificial flowers the base rate plus 10%.",
)
IE["other"] = (
    "No Chapter 67 line is on the general exemption list (note 52(b)) or on any country exception list in note 52(j). Japan "
    "and Switzerland pay 12.5% and Taiwan 10% in total where the base rate is lower; the UK, Pakistan and Sri Lanka pay +10%, "
    "the Philippines +12.5%. " + ENDED,
    "Pakistani, Sri Lankan and British wigs and hair goods pay 10%; Philippine goods 12.5%. Countries outside the 60 "
    "economies, such as Senegal and Myanmar, pay only the base rate — Free on hair, wigs and extensions.",
)
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    if key in ("bd", "kh", "other"):
        e["exemption"], e["whatItMeans"] = IE[key]
    if key == "other":
        e["country"] = "Other Section 301 economies (incl. the Philippines, Pakistan, Sri Lanka, Japan, Taiwan, Switzerland, the UK)"
    if key in ("bd",) and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")

# understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 67: Wigs, Hair Extensions & Artificial Flowers — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 67 Import Statistics: Wigs, Hair Extensions & Artificial Flowers from China, Indonesia, Bangladesh | KoalaGains"
ui["seo"]["shortDescription"] = (
    f"U.S. imports of wigs, hair extensions, artificial flowers and feather goods {trade['years'][0]}–{LATEST}, by country, "
    f"product and year: {usd(TOT)} in {LATEST}, down {abs(CHG):.1f}%; China supplied {pct(cn['sharePct'])}, Indonesia "
    f"{pct(idn['sharePct'])} and Bangladesh {pct(bd['sharePct'])}."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 67 import statistics",
    "us import duty on artificial flowers",
    "human hair extensions tariff rates",
    "indonesia wig exports to us",
    "china artificial flowers imports",
    "hts 6702.10.20",
]
SHORT = {h: v[1] for h, v in LABELS.items()}
for c in ui["byCountry"]:
    if c.get("mainHeading") in SHORT:
        c["mainHeadingLabel"] = SHORT[c["mainHeading"]]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["why"] = (
    f"U.S. imports of Chapter 67 goods fell from **{usd(PRIOR_TOT)} in {PRIOR} to {usd(TOT)} in {LATEST}** ({CHG:.1f}%), well "
    f"below the {peak['year']} peak of {usd(peak['totalUsd'])}. Two product families make up almost all of it: **artificial "
    f"flowers** (6702, {usd(head_tot['6702'])}) — plastic flowers {usd(hs6['6702.10']['importsUsd'])} and flowers of other "
    f"materials {usd(hs6['6702.90']['importsUsd'])} — and **wigs, extensions and eyelashes** (6704, {usd(head_tot['6704'])}): "
    f"human-hair goods {usd(hs6['6704.20']['importsUsd'])} (down {abs(hs6['6704.20']['changePct']):.0f}%), synthetic "
    f"hairpieces and extensions {usd(hs6['6704.19']['importsUsd'])} and synthetic complete wigs "
    f"{usd(hs6['6704.11']['importsUsd'])}. Worked hair ({usd(head_tot['6703'])}) and feather goods ({usd(head_tot['6701'])}) "
    f"are small.\n\n"
    f"**China supplied {pct(cn['sharePct'])}** ({usd(cn['importsUsd'])}, down {abs(cn['changePct']):.0f}%): "
    f"{pct(cn_flower_share)} of artificial flowers and {pct(cn_wig_share)} of wigs and hair goods. The rest is wigs from South "
    f"and Southeast Asia and West Africa: Indonesia {usd(idn['importsUsd'])} (down {abs(idn['changePct']):.0f}%), "
    f"**Bangladesh {usd(bd['importsUsd'])} (up {bd['changePct']:.1f}%)**, Vietnam {usd(vn['importsUsd'])} (up "
    f"{vn['changePct']:.1f}%) and Senegal {usd(sn['importsUsd'])}. India ships mainly worked human hair; Cambodia's wigs and "
    f"flowers nearly tripled to {usd(imp('Cambodia')['importsUsd'])}. Myanmar, reported by Comtrade at "
    f"{usd(mm['importsUsd'])}, is small in this data.\n\n"
    f"Through {LATEST} China paid List 3 or 4A plus the IEEPA duties (up to 145% more in April–May 2025), and most other "
    f"suppliers paid the IEEPA reciprocal tariff from April 2025 (Indonesia 19%, Bangladesh and Vietnam 20%, Myanmar 40% from "
    f"August 7). Those duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies "
    f"instead. {LATEST} is the latest full year of U.S. trade data."
)

# overview trade parts
ov["intro"] = (
    "Chapter 67 covers **wigs, hair extensions and false eyelashes** (6704), **worked human hair** (6703), **artificial "
    "flowers, foliage and fruit** (6702) and **prepared feathers, down and feather articles** (6701). Its **13 tariff lines** "
    "split in two: every hair, wig and extension line is **Free**, while artificial flowers pay 3.4%–17% and feather goods "
    "4.7%.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff "
    "of 10% or 12.5%** — 10% from Indonesia, Bangladesh and India, 12.5% from Vietnam — and no Chapter 67 line is exempt. "
    "**China pays 20% on synthetic wigs and 12.5% on human-hair wigs**, 15.9%–37% on artificial flowers and 42.2% on feather "
    f"goods. Senegal and Myanmar are outside the 60, so their wigs enter Free. U.S. imports were **{usd(TOT)} in {LATEST}**, "
    f"{pct(cn['sharePct'])} from China."
)
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in ui["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "6702.10", "label": "Artificial flowers, foliage and fruit of plastics"},
    {"hts": "6702.90", "label": "Artificial flowers of other materials (polyester, silk, paper, feathers)"},
    {"hts": "6704.20", "label": "Wigs, extensions and other articles of human hair"},
    {"hts": "6704.19", "label": "Synthetic hairpieces, extensions, braiding hair and eyelashes"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; Comtrade does not split 6702.10, 6702.90 or 6703.00 into the U.S. 8- and 10-digit lines."
)
if not ts.get("source") or "TODO" in str(ts.get("source")):
    ts["source"] = f"UN Comtrade, United States imports, HS chapter 67 ({LATEST})"

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 67 FAQ: Wigs, Hair Extensions, Eyelashes, Artificial Flowers & Feathers"
fc["seo"]["title"] = "HTS Chapter 67 FAQ 2026: HS Codes & Tariffs for Wigs, Hair Extensions, Eyelashes & Artificial Flowers | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about Chapter 67 imports: HS codes for wigs, human and synthetic hair extensions, braiding "
    "hair, false eyelashes, human hair, artificial flowers and feathers, the 2026 tariffs from China, Indonesia and Bangladesh, "
    "and the feather and forced-labor import rules."
)
fc["seo"]["keywords"] = [
    "hs code for wigs",
    "hs code for hair extensions",
    "hs code for false eyelashes",
    "human hair hs code",
    "hs code for artificial flowers",
    "hs code 6704",
    "tariff on wigs from china",
    "hair extensions tariff",
    "import duty on artificial flowers",
    "importing feathers into united states",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing wigs, hair extensions, eyelashes, human hair, artificial "
    "flowers and feather goods into the U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page "
    "with the full detail."
)
fc["keyTakeaways"] = [
    "Every hair, wig, extension and eyelash line (6703, 6704) is Free at the general rate; artificial flowers pay 3.4%–17% and feather goods 4.7%. None changed since January 2025.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff on every Chapter 67 line — 10% from Indonesia, Bangladesh and India, 12.5% from Vietnam — and no Chapter 67 line is exempt. Senegal and Myanmar are outside the 60 economies.",
    "China pays 20% on synthetic wigs, extensions and eyelashes, 12.5% on human-hair wigs (6704.20 was only on the suspended List 4B), 15.9%–37% on artificial flowers and 42.2% on feather goods.",
    "USMCA-qualifying goods from Mexico enter free; Canadian synthetic hairpieces (6704.19) pay 50% under Section 338 even with USMCA. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Feathers of wild birds may not be imported, even in finished articles; hair products from three Xinjiang producers are barred under forced-labor orders and the UFLPA.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 13, 2026, plus search terms the live chapter pages already rank for"
FAQS.append({
    "id": "us-imports",
    "question": "How many wigs and artificial flowers does the U.S. import, and from where?",
    "searchedAs": ["hts chapter 67", "wig imports by country", "artificial flowers imports"],
    "answer": (
        f"{usd(TOT)} of Chapter 67 goods in {LATEST}, down {abs(CHG):.1f}% from {usd(PRIOR_TOT)}. Artificial flowers were "
        f"{usd(head_tot['6702'])} and wigs, extensions and eyelashes {usd(head_tot['6704'])}. China supplied "
        f"{pct(cn['sharePct'])} ({pct(cn_flower_share)} of the flowers), followed by Indonesia ({usd(idn['importsUsd'])}), "
        f"Bangladesh ({usd(bd['importsUsd'])}), Vietnam ({usd(vn['importsUsd'])}) and Senegal ({usd(sn['importsUsd'])}), "
        "almost all wigs and hair goods."
    ),
    "link": "understand-industry",
})
fc["faqs"] = FAQS

d["sources"] = [s for s in d["sources"] if s.get("url") != "https://comtradeplus.un.org/"] + [
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": f"{LATEST} import figures"},
    {"label": "eCFR (titles 9, 19, 50)", "url": "https://www.ecfr.gov/", "note": f"regulations as of {ECFR_DATE}"},
]
d["asOf"] = CHECKED

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
