#!/usr/bin/env python3
"""Fill the writer parts of the generated Chapter 06 content file.

Usage:  python3 fill06.py <generated.json> <out.json>

Re-run after any `pnpm tariff:generate-chapter --chapter 6 ...` regeneration. The data parts (rate table, matrix cells,
measures, trade figures) are kept as generated; this script writes the prose, sources and SEO around them and asserts the
counts the prose relies on, so a regeneration that changes them fails loudly instead of leaving stale text.
"""
import json
import re
import sys

src_path, out_path = sys.argv[1], sys.argv[2]
d = json.load(open(src_path))
TODAY = d["asOf"]
FRD = "https://www.federalregister.gov/documents/"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH06 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%206"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
ECFR = "https://www.ecfr.gov/current/"


def src(id, publisher, citation, document, title, signed, published, url):
    return {"id": id, "publisher": publisher, "citation": citation, "document": document, "title": title, "signed": signed,
            "published": published, "url": url}


def money(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    return f"${v / 1e6:.1f}M" if v < 1e8 else f"${v / 1e6:.0f}M"


def pct(a, b, nd=0):
    v = 100 * a / b
    return f"{v:.{nd}f}"


# =============================================================================================================
# Facts the prose relies on — asserted against the generated data
# =============================================================================================================
rows = [r for r in d["overview"]["rateTable"]["rows"] if r["htsCode10"]]
assert len(rows) == 78, len(rows)
assert sum(1 for r in rows if r["dutiable"]) == 59
tu = d["tariffUpdates"]
ia = d["industryAreas"]
ui = d["understandIndustry"]
ov = d["overview"]
te = d["tariffEngineering"]
fc = d["finalConclusion"]
ie = {e["id"]: e for e in tu["inEffect"]}
assert set(ie) == {"co-section-301", "ca-section-301", "ec-section-301", "eu-section-301", "mx-section-301", "cr-section-301",
                   "gt-section-301", "cn-section-301", "tw-section-301", "th-section-301", "in-section-301", "pe-section-301",
                   "br-section-301", "other-section-301"}, set(ie)
assert "9903.03.14 reaches 48 of 78" in ie["ca-section-301"]["exemption"]
assert "9903.05.35 reaches 8 of 78" in ie["ec-section-301"]["exemption"]
assert "9903.05.40 reaches 22 of 78" in ie["gt-section-301"]["exemption"]
assert "9903.05.76 reaches 21 of 78" in ie["tw-section-301"]["exemption"]
assert "9903.88.15 reaches 77 of 78" in ie["cn-section-301"]["exemption"]
assert ui["latestYear"] == 2025 and ui["byYear"][-1]["totalUsd"] == 4046926030

# ---- trade figures ----------------------------------------------------------------------------------------
TOTAL = ui["byYear"][-1]["totalUsd"]
PRIOR = ui["byYear"][-2]["totalUsd"]
Y2020 = ui["byYear"][0]["totalUsd"]
for c in ui["byCountry"]:
    if c["country"] == "Other Asia, nes":
        c["country"] = "Taiwan"
for c in ui["byHeadingCountry"]:
    if c["country"] == "Other Asia, nes":
        c["country"] = "Taiwan"
BC = {c["country"]: c for c in ui["byCountry"]}
LINES = {l["hs6"]: l for l in ui["byLine"]}
HC = {(x["heading"], x["country"]): x["importsUsd"] for x in ui["byHeadingCountry"]}
HEAD = {}
for x in ui["byHeadingCountry"]:
    HEAD[x["heading"]] = HEAD.get(x["heading"], 0) + x["importsUsd"]
co, ca, ec, nl = BC["Colombia"], BC["Canada"], BC["Ecuador"], BC["Netherlands"]
roses = LINES["0603.11"]
CUT = sum(l["importsUsd"] for l in ui["byLine"] if l["heading"] == "0603")
CUT_PRIOR = sum(l["priorImportsUsd"] for l in ui["byLine"] if l["heading"] == "0603")
PLANTS = sum(l["importsUsd"] for l in ui["byLine"] if l["heading"] == "0602")
PLANTS_PRIOR = sum(l["priorImportsUsd"] for l in ui["byLine"] if l["heading"] == "0602")
BULBS = sum(l["importsUsd"] for l in ui["byLine"] if l["heading"] == "0601")
FOL = sum(l["importsUsd"] for l in ui["byLine"] if l["heading"] == "0604")
FOL_PRIOR = sum(l["priorImportsUsd"] for l in ui["byLine"] if l["heading"] == "0604")
assert money(TOTAL) == "$4.05B" and money(PRIOR) == "$4.16B" and money(co["importsUsd"]) == "$1.66B"
assert money(ca["importsUsd"]) == "$767M" and money(ec["importsUsd"]) == "$722M" and money(nl["importsUsd"]) == "$305M"
assert money(roses["importsUsd"]) == "$1.25B" and money(CUT) == "$2.73B" and money(PLANTS) == "$878M"
assert money(HC[("0603", "Colombia")]) == "$1.61B" and money(HC[("0603", "Ecuador")]) == "$706M"
assert money(HC[("0602", "Canada")]) == "$538M" and money(HC[("0601", "Netherlands")]) == "$159M"
assert money(BULBS) == "$222M" and money(FOL) == "$218M"
CO_SHARE = pct(co["importsUsd"], TOTAL)  # 41
CUT_SHARE = pct(CUT, TOTAL)  # 67
CO_EC_CUT = pct(HC[("0603", "Colombia")] + HC[("0603", "Ecuador")], CUT)  # 85
NL_BULB = pct(HC[("0601", "Netherlands")], BULBS)  # 72
CHG = pct(TOTAL - PRIOR, PRIOR, 1)  # -2.6
assert (CO_SHARE, CUT_SHARE, CO_EC_CUT, NL_BULB, CHG) == ("41", "67", "85", "72", "-2.6"), (CO_SHARE, CUT_SHARE, CO_EC_CUT, NL_BULB, CHG)

# =============================================================================================================
# Sources (tariffUpdates; industryAreas copies the ones its rules use)
# =============================================================================================================
EXTRA_SOURCES = [
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border",
        "2025-02-01", "2025-02-07", FRD + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
        "2025-02-01", "2025-02-07", FRD + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
        "2025-07-31", "2025-08-06", FRD + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257",
        "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
        "2025-04-02", "2025-04-07",
        FRD + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25",
        FRD + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012",
        "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25",
        FRD + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties",
        None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump",
        None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review",
        None, "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    src("ustr-agoa-2026", "USTR", "USTR press release", "Statement",
        "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03",
        "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"),
    src("cbp-gsp", "CBP", "CBP web page (modified August 6, 2026)", "Web page", "Generalized System of Preferences (GSP)", None, "2026-08-06",
        "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"),
    src("fr-2026-20630", "Federal Register", "91 FR 64253", "Final rule (USDA APHIS)",
        "Cut Flowers Regulations; Removal of Chrysanthemum White Rust-Related Provisions", None, "2026-10-08",
        FRD + "2026/10/08/2026-20630/cut-flowers-regulations-removal-of-chrysanthemum-white-rust-related-provisions"),
    src("fr-2026-20631", "Federal Register", "91 FR 64325", "Notice (USDA APHIS)",
        "Notice of Decision To Deregulate Chrysanthemum White Rust and the Importation of Chrysanthemum spp. Cuttings, and In Vitro Plantlets, and Synonymous Taxa From Certain Countries Into the Continental United States",
        None, "2026-10-08",
        FRD + "2026/10/08/2026-20631/notice-of-decision-to-deregulate-chrysanthemum-white-rust-and-the-importation-of-chrysanthemum-spp"),
    src("fr-2025-13763", "Federal Register", "90 FR 34413", "Notice (USDA APHIS)",
        "Notice of Decision To Authorize Importation of Phalaenopsis Spp. Orchid Plants for Planting in Approved Growing Media From Germany and the Netherlands Into the United States",
        None, "2025-07-22",
        FRD + "2025/07/22/2025-13763/notice-of-decision-to-authorize-importation-of-phalaenopsis-spp-orchid-plants-for-planting-in"),
    src("fr-1999-13685", "Federal Register", "64 FR 28975", "Notice (Commerce, ITA)", "February 1999 Sunset Review: Final Results and Revocation",
        None, "1999-05-28", FRD + "1999/05/28/99-13685/february-1999-sunset-review-final-results-and-revocation"),
    src("fr-1999-14365", "Federal Register", "64 FR 30358", "Notice (USITC)",
        "Standard Chrysanthemums From the Netherlands, Fresh Cut Flowers From Colombia, and Standard Carnations From Kenya", None, "1999-06-07",
        FRD + "1999/06/07/99-14365/standard-chrysanthemums-from-the-netherlands-fresh-cut-flowers-from-colombia-and-standard-carnations"),
    src("hts-gn16", "USITC", "HTSUS 2026 Revision 21, General Note 16", "Harmonized Tariff Schedule",
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes (General Note 16: AGOA beneficiary countries)",
        None, "2026-10-07", GN),
]

EXTRA_CHANGES = [
    {
        "id": "aphis-cwr-2026", "type": "reference", "date": "2026-10-08", "dateLabel": "Published",
        "title": "APHIS lifts chrysanthemum white rust restrictions on cut flowers and cuttings (from November 9, 2026)",
        "detail": "A final rule removes every chrysanthemum white rust (CWR) condition on fresh cut chrysanthemums (genera Chrysanthemum, "
        "Leucanthemella and Nipponanthemum) and moves the commodity-specific cut-flower conditions out of 7 CFR 319.74 into APHIS's "
        "Agricultural Commodity Import Requirements (ACIR) database, effective November 9, 2026. A companion notice deregulates CWR "
        "as a quarantine pest and allows Chrysanthemum cuttings and in vitro plantlets to be authorized from certain countries from "
        "the same date. No duty changes: cut chrysanthemums (0603.14) stay at 6.4% and unrooted cuttings (0602.10) at 4.8%.",
        "before": "CWR restrictions", "now": "Removed from November 9, 2026", "countries": "All",
        "sourceIds": ["fr-2026-20630", "fr-2026-20631"],
    },
    {
        "id": "ca-338-scope", "type": "reference", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Canada Section 338 list rewritten; Chapter 06 lines unchanged",
        "detail": "Proclamation 11065 added and removed products on the Section 338 list for goods of Canada (9903.03.14) from "
        "September 15, 2026 and made the duty apply on top of Section 232 duties. None of the 48 Chapter 06 lines on the list was "
        "added or removed; they have paid the 50% since August 22, 2026.",
        "before": None, "now": None, "countries": "Canada", "sourceIds": ["procl-11065", "csms-69851916", "hts-chapter-99"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
        "pending resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the 10% "
        "Section 301 duty on Canadian and Mexican plants and flowers. They do not remove the Canada Section 338 duty.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026. The next day the 2026 Section 301 "
        "tariffs took over for 60 economies.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. Its product exemption list (9903.03.03) had no "
        "Chapter 06 subheading, so bulbs, plants and flowers paid it from every supplier; USMCA goods from Canada and Mexico were "
        "exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting "
        "them for goods entered from 12:00 a.m. ET on February 24. No Chapter 06 line had been on the reciprocal tariff's "
        "agricultural exemption list (9903.01.32), so flowers from Colombia, for example, had paid the 10% baseline since April 2025. "
        "The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313", "hts-now"],
    },
    {
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "Legislation signed February 3, 2026 renewed AGOA through December 31, 2026, retroactive to September 30, 2025, when "
        "it had lapsed. AGOA (SPI D) makes every dutiable Chapter 06 line Free for listed sub-Saharan countries such as Kenya, which "
        "is not one of the 60 Section 301 economies, so Kenyan roses and cuttings enter duty-free. GSP (SPI A, A*, A+) remains expired "
        "since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026", "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "hts-gn16", "cbp-gsp", "hts-now"],
    },
    {
        "id": "phalaenopsis-de-nl", "type": "reference", "date": "2025-07-22", "dateLabel": "Effective",
        "title": "APHIS authorizes potted Phalaenopsis orchids from Germany and the Netherlands",
        "detail": "Phalaenopsis orchid plants for planting may be imported from Germany and the Netherlands established in approved "
        "growing media, under the Plants for Planting Manual and a bilateral workplan, instead of bare-root only. Duty: orchid "
        "plants (0602.90.20) have a Free base rate, so EU orchids pay the 10% Section 301 duty since July 24, 2026.",
        "before": "Bare-root only", "now": "In approved growing media", "countries": "Germany, Netherlands", "sourceIds": ["fr-2025-13763"],
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
        "detail": "10% baseline (9903.01.25) and higher country rates (9903.02.xx) on every Chapter 06 line; Canada and Mexico were "
        "excluded. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "flower-ad-revoked", "type": "reference", "date": "1999-06-07", "dateLabel": "Terminated",
        "title": "Antidumping and countervailing duty orders on cut flowers revoked in 1999",
        "detail": "Commerce revoked the orders on fresh cut flowers from Colombia, standard chrysanthemums from the Netherlands and "
        "standard carnations from Kenya in May 1999, and the USITC terminated their five-year reviews. We found no antidumping or "
        "countervailing duty order in force on any Chapter 06 product; check CBP's AD/CVD case search before entry.",
        "before": "Antidumping / countervailing duty orders", "now": "Revoked", "countries": "Colombia, Netherlands, Kenya",
        "sourceIds": ["fr-1999-13685", "fr-1999-14365"],
    },
]

have = {s["id"] for s in tu["sources"]}
for s in EXTRA_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])
ids = {c["id"] for c in tu["changes"]}
for c in EXTRA_CHANGES:
    assert c["id"] not in ids, c["id"]
    tu["changes"].append(c)

# ---- generator-written change entries -------------------------------------------------------------------------
CHG_BY = {c["id"]: c for c in tu["changes"]}
for cid, c in CHG_BY.items():
    if cid.startswith("section-301-nicaragua"):
        c.update({
            "date": "2025-12-29", "dateLabel": "Published",
            "title": "Section 301 tariff on Nicaragua scheduled: 10% in 2027, 15% in 2028",
            "detail": "USTR's Nicaragua action phases in a tariff on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): "
            "0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches all 78 Chapter 06 lines. Nicaragua is "
            "also one of the 60 economies paying the 2026 Section 301 duty; CAFTA-DR claims do not remove that one (U.S. note 52(a)).",
            "now": "+10% (2027), +15% (2028)", "countries": "Nicaragua",
        })
    elif cid.startswith("section-338-canada"):
        c.update({
            "title": "Section 338 duty of 50% on Canadian bulbs, cuttings and cut flowers",
            "detail": "Proclamation 11048 (motor vehicles) put a 50% duty on listed products of Canada (9903.03.14), first from "
            "August 19, then, after Proclamation 11056 suspended it for three days, from August 22, 2026. The list includes 48 of the "
            "78 Chapter 06 lines: tulip, hyacinth, lily and narcissus bulbs, other dormant bulbs (0601.10.90), hyacinths in growth, unrooted "
            "cuttings, orchid plants, mushroom spawn, all fresh cut flowers except carnations, dried flowers, and mosses, dried and "
            "other non-fresh foliage. It applies even with a USMCA claim (U.S. note 51(a)). Nursery stock (trees, shrubs, perennials, "
            "poinsettias, rose plants), carnations and all fresh foliage, including Christmas trees, are not listed.",
            "now": "+50%", "countries": "Canada",
        })
    elif cid.startswith("section-301-2026-60-economies"):
        c.update({
            "title": "Section 301 tariffs on 60 economies cover almost every bulb, plant and flower",
            "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84) from July 24, 2026, on 77 of the 78 "
            "Chapter 06 lines; only unrooted cuttings and slips (0602.10) are on the general exemption list (U.S. note 52(b), "
            "9903.05.86). Colombia, Costa Rica, Peru and Thailand pay 12.5%; Ecuador, Guatemala, India, Mexico and Canada 10%; EU goods "
            "10% in total and Taiwan 10% in total. Country exception lists remove it for most cut flowers from Ecuador (69 lines), "
            "Guatemala (55) and Taiwan (56). USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94); other FTA claims do not "
            "remove it (U.S. note 52(a)).",
            "now": "+10% / +12.5%", "countries": "60 economies",
        })
    elif cid.startswith("section-301-brazil"):
        c.update({
            "title": "Section 301 tariff on products of Brazil",
            "detail": "25% on all products of Brazil (9903.05.01) from July 22, 2026; the Brazil exemption list (U.S. note 50(a)(ii)) "
            "has no Chapter 06 line. Two days later Brazil also became subject to the 12.5% 2026 Section 301 duty (9903.05.27), so "
            "Brazilian plants and flowers pay the base rate plus 37.5% (25% on unrooted cuttings).",
            "now": "+25%", "countries": "Brazil",
        })
    elif cid == "base-rates":
        c["detail"] = ("All 78 Chapter 06 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 "
                       "Basic Edition; no line was added, removed or renumbered.")

tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---- in-effect entries -----------------------------------------------------------------------------------------
IEEPA_END = "The IEEPA reciprocal duty ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
UNROOTED = "Unrooted cuttings and slips (0602.10) are on the general exemption list (U.S. note 52(b), 9903.05.86)."
TEXT = {
    "co-section-301": (
        "+12.5% on 77 of 78 lines (9903.05.32); " + UNROOTED + " The Colombia Trade Promotion Agreement (CO) makes the base rate Free "
        "but does not remove the Section 301 duty (U.S. note 52(a)), and Colombia has no country exception list. " + IEEPA_END,
        "Fresh roses from Colombia claimed under CO pay 12.5% of value — $6,250 on a $50,000 shipment. Without the claim they pay "
        "6.8% + 12.5% = 19.3%. Colombia supplied $1.61B of U.S. cut-flower imports in 2025.",
    ),
    "ca-section-301": (
        "Two duties. The Section 338 duty (9903.03.14) adds 50% from August 22, 2026 on 48 of 78 lines — bulbs, unrooted cuttings, "
        "orchid plants, mushroom spawn, fresh cut flowers other than carnations, dried flowers and non-fresh foliage — with or "
        "without a USMCA claim (U.S. note 51(a)). The 2026 Section 301 duty (9903.05.29) adds 10% on 77 lines but not on "
        "USMCA-qualifying goods (9903.05.93). Nursery stock, carnations and fresh foliage, including Christmas trees, are not on the "
        "Section 338 list. The 2025 IEEPA duty (+35% on non-USMCA goods) ended February 24, 2026.",
        "USMCA-qualifying Canadian nursery stock and Christmas trees enter free, but USMCA-qualifying Canadian cut tulips or potted "
        "orchids pay 50% of value. Canadian cut flowers that do not qualify pay 6.4% + 10% + 50% = 66.4%.",
    ),
    "ec-section-301": (
        "Ecuador's exception list (U.S. note 52(j)(12), 9903.06.18) covers 69 of the 78 lines, including every fresh cut flower, "
        "dried flowers, foliage, dormant tulip, lily and narcissus bulbs and rooted plants with soil. " + UNROOTED + " The 10% duty "
        "(9903.05.35) applies only to 8 lines: lily-of-the-valley pips, hyacinth bulbs in growth, fruit and nut trees, rhododendrons "
        "and azaleas, herbaceous perennials and other plants without soil, and mushroom spawn. There is no FTA with Ecuador and GSP "
        "has been expired since December 31, 2020, so the base rate applies. " + IEEPA_END,
        "Ecuadorian roses pay only the 6.8% base rate — $3,400 on a $50,000 shipment — and other cut flowers 6.4%.",
    ),
    "eu-section-301": (
        "For EU goods the total is 10% where the base rate is lower (9903.05.39) — which is every dutiable Chapter 06 line, since the "
        "highest base rate is 7%. " + UNROOTED + " The EU exception list (U.S. note 52(j)(2), 9903.05.97) has no Chapter 06 line. "
        "This replaced the 15% all-in IEEPA rate, which ended February 24, 2026.",
        "Dutch tulip bulbs (89.6¢ per 1,000), cut flowers (6.4%) and orchid plants (Free) all pay 10% of value; Dutch unrooted cuttings "
        "pay only the 4.8% base rate.",
    ),
    "mx-section-301": (
        "USMCA-qualifying goods: no Section 301 duty (9903.05.94). Goods that do not qualify pay the base rate +10% (9903.05.55) on 77 "
        "of 78 lines. " + UNROOTED + " Mexico has no Section 338 duty. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended "
        "February 24, 2026.",
        "Mexican-grown cut flowers and plants claimed under USMCA pay $0; non-qualifying cut flowers pay 6.4% + 10% = 16.4%.",
    ),
    "cr-section-301": (
        "+12.5% on 77 of 78 lines (9903.05.33). " + UNROOTED + " CAFTA-DR (P) makes the base rate Free but does not remove the 12.5% "
        "(U.S. note 52(a)); the CAFTA-DR relief in note 52(i) covers textiles and apparel only. " + IEEPA_END,
        "Costa Rican foliage plants and rooted cuttings claimed under CAFTA-DR pay 12.5% of value; unrooted cuttings pay nothing.",
    ),
    "gt-section-301": (
        "Guatemala's exception list (U.S. note 52(j)(6), 9903.06.04) covers 55 of the 78 lines, including most fresh cut flowers "
        "and foliage, orchid plants and rooted plants. " + UNROOTED + " The 10% duty (9903.05.40) applies to 22 lines: dormant bulbs, "
        "hyacinths in growth, fruit trees, azaleas, rose plants, perennials and other plants without soil, mushroom spawn, "
        "miniature carnations, chrysanthemums and mosses. CAFTA-DR (P) makes the base rate Free. " + IEEPA_END,
        "Guatemalan unrooted cuttings and rooted plants with soil claimed under CAFTA-DR pay $0; Guatemalan cut chrysanthemums pay 10%.",
    ),
    "cn-section-301": (
        "Two Section 301 duties stack. The 2026 action adds 12.5% (9903.05.31) on 77 of 78 lines (not unrooted cuttings, U.S. note "
        "52(b)). The 2018–2019 List 4A duty adds 7.5% (9903.88.15) on 77 lines — every line except mushroom spawn (0602.90.50). "
        "USTR confirmed on October 7, 2026 that the 2018–2019 actions continue. The IEEPA duties on China ended February 24, 2026.",
        "Chinese live plants without soil (4.8% base) pay 24.8%; unrooted cuttings pay 4.8% + 7.5% = 12.3%; mushroom spawn pays "
        "1.4¢/kg + 12.5%.",
    ),
    "tw-section-301": (
        "Taiwan's exception list (U.S. note 52(j)(10), 9903.06.14) covers 56 of the 78 lines, including orchid plants (0602.90.20), "
        "every fresh cut flower and all foliage. " + UNROOTED + " On the other 21 lines the total is 10% where the base rate is "
        "lower (9903.05.76): dormant bulbs other than 0601.10.90, bulbs in growth, fruit trees, azaleas, rose plants, perennials "
        "and other plants, mushroom spawn and dried flowers. " + IEEPA_END,
        "Potted orchids from Taiwan pay nothing (Free base rate, exception list); Taiwanese foliage plants without soil pay 10% of value.",
    ),
    "th-section-301": (
        "+12.5% on 77 of 78 lines (9903.05.77). " + UNROOTED + " There is no FTA with Thailand, GSP has been expired since December "
        "31, 2020, and Thailand has no exception list. " + IEEPA_END,
        "Thai orchids pay 6.4% + 12.5% = 18.9% of value as cut flowers, or 12.5% as orchid plants (Free base rate).",
    ),
    "in-section-301": (
        "+10% on 77 of 78 lines (9903.05.44). " + UNROOTED + " There is no FTA with India, GSP has been expired since December 31, "
        "2020, and India has no exception list. The IEEPA duties on India ended February 24, 2026.",
        "Indian fresh foliage (Free base rate) pays 10% of value; dried or bleached foliage (0604.90.30) also 10%.",
    ),
    "pe-section-301": (
        "+12.5% on 77 of 78 lines (9903.05.63). " + UNROOTED + " The Peru Trade Promotion Agreement (PE) makes the base rate Free "
        "but does not remove the Section 301 duty (U.S. note 52(a)). " + IEEPA_END,
        "Dormant bulbs from Peru claimed under PE pay 12.5% of value.",
    ),
    "br-section-301": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) on all 78 lines and +12.5% under the 2026 action from July 24, "
        "2026 (9903.05.27) on 77 lines; the Brazil exemption list (U.S. note 50(a)(ii)) has no Chapter 06 line. The IEEPA duties on Brazil "
        "ended February 24, 2026.",
        "Brazilian plants and flowers pay the base rate plus 37.5% of value; unrooted cuttings pay 4.8% + 25% = 29.8%.",
    ),
    "other-section-301": (
        "+10% or +12.5% depending on the country (for example Chile, Israel and Vietnam +12.5%; Argentina, Pakistan and the United Kingdom +10%); Japan, South Korea "
        "and Switzerland pay 12.5% in total where the base rate is lower. " + UNROOTED + " Country exception lists in U.S. note 52(j) "
        "remove the duty on most Chapter 06 lines for Switzerland, Malaysia, Cambodia, Indonesia and Jordan, and on a few lines for "
        "El Salvador, Argentina and Bangladesh. Countries outside the 60 economies, such as Kenya, pay no extra duty; Nicaragua faces "
        "a further Section 301 duty on non-CAFTA-DR goods from January 1, 2027.",
        "FTA claims do not remove the duty: Chilean or Israeli bulbs claimed under their FTA still pay 12.5% of value.",
    ),
}
for k, (exemption, means) in TEXT.items():
    ie[k]["exemption"] = exemption
    ie[k]["whatItMeans"] = means
ie["ca-section-301"]["now"] = "+50% on 48 lines (USMCA or not); +10% more without USMCA"
ie["cn-section-301"]["now"] = "+20% (+7.5% on unrooted cuttings, +12.5% on mushroom spawn)"
ie["eu-section-301"]["now"] = "10% in total (in place of the lower base rate)"
ie["tw-section-301"]["now"] = "10% in total on 21 lines; exception list on the rest"
ie["ec-section-301"]["now"] = "+10% on 8 lines; exception list on the rest"
ie["gt-section-301"]["now"] = "+10% on 22 lines; exception list on the rest"
ie["other-section-301"]["country"] = "Other Section 301 economies (incl. Chile, Israel, Japan, South Korea, Vietnam, Switzerland, Nicaragua)"
for k in ("ca-section-301",):
    ie[k]["measure"] = "Section 338 (Canada) + Section 301 (2026, 60 economies)"
# every entry that mentions the end of the IEEPA duties cites the order that ended them
for e in tu["inEffect"]:
    if "IEEPA" in e["exemption"] and "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].append("eo-14389")
    if "GSP" in e["exemption"] and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].append("cbp-gsp")
for k in ("cn-section-301",):
    assert "fr-2026-20510" in ie[k]["sourceIds"]

tu["seo"] = {
    "title": "HTS Chapter 06 Tariff Updates 2026: Flowers from Colombia & Ecuador, Canadian Plants, Section 301 | KoalaGains",
    "shortDescription": "What changed for live plants, bulbs and cut flowers since January 2025: unchanged base rates, the end of the "
    "IEEPA and Section 122 duties, the 2026 Section 301 tariffs (12.5% on Colombian flowers, Ecuador's exception list), Canada's 50% "
    "Section 338 duty and APHIS's chrysanthemum rule, with Federal Register citations.",
    "keywords": [
        "hts chapter 06 tariff updates",
        "tariffs on flowers from colombia",
        "tariffs on flowers from ecuador",
        "ecuador roses import duty",
        "usmca fresh cut flowers tariff",
        "tariffs on plants from canada",
        "section 301 tariffs 2026 flowers",
        "chrysanthemum white rust rule 2026",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). No Chapter 06 base rate changed: all 78 lines read the same.\n\n"
    "Everything that changed came on top of the base rate. The 2025 IEEPA duties (the reciprocal tariff on every supplier, and "
    "+25% or +35% on Mexican and Canadian goods that did not qualify for USMCA) **ended on February 24, 2026**, and the 10% Section "
    "122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** plants and flowers from 60 economies pay a "
    "**Section 301 tariff of 10% or 12.5%**: **12.5% on Colombian flowers** even with an FTA claim, 10% in total on Dutch bulbs. "
    "**Ecuador's exception list** keeps almost all Ecuadorian flowers at their base rate, and Guatemala and Taiwan have similar "
    "lists. Since **August 22, 2026** a **50% Section 338 duty** applies to 48 lines from **Canada** — bulbs, cuttings, orchids and "
    "cut flowers — even with a USMCA claim. No antidumping or countervailing duty order covers these goods."
)
tu["scope"] = (
    "Measures that reach Chapter 06 from any country: the 2026 Section 301 tariffs on 60 economies with their exemption and country "
    "exception lists, the Brazil Section 301 tariff, China's Section 301 List 4A, the Canada Section 338 duty, the scheduled Nicaragua "
    "tariff, the 2025–2026 IEEPA and Section 122 duties that have ended, and APHIS rule changes for plants and cut flowers. For the "
    "rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "78 of 78 lines"},
    {"label": "Extra duties in effect", "value": "14", "note": "by country or group"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
    {"label": "Lines exempt from 2026 Section 301", "value": "1 of 78", "note": "unrooted cuttings (0602.10)"},
    {"label": "Canada Section 338 lines", "value": "48 of 78", "note": "+50%, USMCA or not"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

# =============================================================================================================
# Overview
# =============================================================================================================
GROUPS = {
    "0601": ("Bulbs, tubers & corms",
             "Dormant tulip, hyacinth, lily, narcissus and crocus bulbs and lily-of-the-valley pips pay a few cents to $1.44 per 1,000 "
             "(well under 1% of value); other dormant bulbs 3.5%, bulbs in growth 1.4%. The Netherlands supplied 72% of 2025 imports, "
             "and EU bulbs now pay 10% of value in total.",
             ["tulip bulbs", "hyacinth", "lily bulbs", "daffodil", "narcissus", "crocus", "gladiolus", "iris", "begonia", "dahlia"]),
    "0602": ("Live plants, cuttings & nursery stock",
             "Free on fruit and nut trees, rose plants and orchid plants; 1.4% to 4.8% on cuttings, perennials, azaleas, poinsettias "
             "and other trees and shrubs; 1.4¢/kg on mushroom spawn. Unrooted cuttings (0602.10) are the only Chapter 06 line exempt "
             "from the 2026 Section 301 duty.",
             ["nursery stock", "unrooted cuttings", "orchid plant", "poinsettia", "rose bush", "fruit tree", "azalea", "succulent", "mushroom spawn"]),
    "0603": ("Cut flowers",
             "Fresh roses pay 6.8%, miniature carnations 3.2%, other fresh cut flowers 6.4% and dried or dyed flowers 4%; FTA partners "
             "and AGOA countries pay no base rate. Colombian flowers pay a 12.5% Section 301 duty; Ecuadorian flowers are on Ecuador's "
             "exception list.",
             ["roses", "carnations", "chrysanthemums", "alstroemeria", "orchids", "lilies", "gerbera", "hydrangea", "sunflowers", "dried flowers"]),
    "0604": ("Foliage, branches & Christmas trees",
             "Free on all fresh foliage — including fresh-cut Christmas trees, ferns, eucalyptus and palms — and on mosses and dried "
             "foliage; 7% on other foliage that is dyed or otherwise prepared.",
             ["christmas tree", "douglas fir", "fir", "eucalyptus", "leatherleaf fern", "ruscus", "pittosporum", "palm", "moss", "greenery"]),
}
for g in ov["productGroups"]:
    label, blurb, ex = GROUPS[g["heading"]]
    g["label"], g["blurb"], g["searchExamples"] = label, blurb, ex
for g in ia["groups"]:
    g["shortLabel"] = GROUPS[g["heading"]][0]
    g["label"] = GROUPS[g["heading"]][0]
for g in te["groups"]:
    g["label"] = GROUPS[g["heading"]][0]

ov["seo"] = {
    "title": "HTS Chapter 06 Tariff Rates 2026: Cut Flowers, Live Plants & Bulbs Import Duty | KoalaGains",
    "shortDescription": "Searchable duty table for all 78 HTS Chapter 06 tariff lines: fresh cut roses, carnations, chrysanthemums and "
    "other flowers, tulip and lily bulbs, nursery plants, cuttings, orchids, foliage and Christmas trees. General, FTA and Column 2 "
    "rates plus the 2026 extra duties by country.",
    "keywords": [
        "HTS Chapter 06",
        "hts chapter 06 import duty",
        "live trees and other plants; bulbs, roots and the like; cut flowers and ornamental foliage tariff",
        "tariff on cut flowers",
        "hs code for fresh cut flowers",
        "hts 0603.11.00 cut roses tariff rates",
        "live plants hs code 0602",
        "flower bulbs tariff",
        "colombian cut flowers tariff",
        "ecuadorian cut flowers duty",
    ],
}
ov["intro"] = (
    "Chapter 06 covers what nurseries and florists sell: dormant and growing bulbs, live plants, cuttings and mushroom spawn, cut "
    "flowers, and foliage and branches, including fresh-cut Christmas trees. Its **78 tariff lines** carry low rates: a few cents per "
    "1,000 bulbs, 1.4% to 4.8% on plants, **6.8% on fresh roses** and **6.4% on most other cut flowers**, and Free on fresh foliage, "
    "fruit trees, rose plants and orchid plants.\n\n"
    f"The U.S. imported **{money(TOTAL)}** of these goods in 2025; cut flowers were {CUT_SHARE}% of it, and Colombia and Ecuador "
    f"supplied {CO_EC_CUT}% of the cut flowers. Since **July 24, 2026** a **Section 301 tariff** applies on top: **12.5% on Colombian "
    "flowers** even with an FTA claim, 10% in total on EU goods, 10% or 12.5% for most other suppliers — but **Ecuador's exception "
    "list** keeps almost all Ecuadorian flowers at their base rate. Since **August 22, 2026** Canadian bulbs, cuttings, orchids and "
    "cut flowers pay a **50% Section 338 duty**, USMCA claim or not. Every plant also needs USDA APHIS clearance."
)
ov["stats"] = [
    {"label": "Tariff lines", "value": "78"},
    {"label": "Lines with a base-rate duty", "value": "59 of 78"},
    {"label": "Highest base rate", "value": "7%", "note": "prepared foliage (0604.90.60); fresh roses 6.8%"},
    {"label": "Lines with an extra duty for some origins", "value": "78 of 78",
     "note": "2026 Section 301: 77 lines; China List 4A: 77; Brazil: 78; Canada Section 338: 48"},
    {"label": "2025 imports", "value": money(TOTAL)},
    {"label": "Colombia's share", "value": f"{CO_SHARE}%", "note": f"{money(co['importsUsd'])}, mostly cut flowers"},
]
ov["workedExamples"] = [
    {
        "title": "$50,000 of fresh roses from Colombia",
        "line": "0603.11.00",
        "body": "Roses carry a 6.8% base rate, which the Colombia Trade Promotion Agreement (SPI **CO**) makes Free. The 12.5% Section "
        "301 duty on goods of Colombia (9903.05.32) still applies with the FTA claim (U.S. note 52(a)): **$6,250**. Without the CO "
        "claim the shipment would pay 6.8% + 12.5% = 19.3%, or **$9,650**.",
    },
    {
        "title": "The same roses from Ecuador",
        "line": "0603.11.00",
        "body": "There is no FTA with Ecuador and GSP has been expired since 2020, so the **6.8%** base rate applies: **$3,400**. Roses "
        "are on Ecuador's exception list (U.S. note 52(j)(12), heading 9903.06.18), so the 10% Section 301 duty on Ecuador "
        "(9903.05.35) does not apply. That is why Ecuadorian roses now pay less than Colombian ones with an FTA claim.",
    },
    {
        "title": "100,000 tulip bulbs from the Netherlands",
        "line": "0601.10.15",
        "body": "The base rate is 89.6¢ per 1,000 bulbs: **$89.60**. For EU goods the 2026 Section 301 rule (9903.05.39) sets the total "
        "at 10% of value when the base rate is lower, so a $15,000 shipment pays **$1,500** in total. Bulbs are plants for planting: "
        "they also need an APHIS permit and a Dutch phytosanitary certificate.",
    },
    {
        "title": "Cut tulips and nursery stock from Canada",
        "line": "0603.19.01",
        "body": "Canadian cut flowers other than carnations are on the Section 338 list (9903.03.14): $20,000 of USMCA-qualifying cut "
        "tulips pays **$10,000** (50%). Without USMCA it is 6.4% + 10% + 50% = 66.4%, or $13,280. By contrast, USMCA-qualifying Canadian "
        "trees, shrubs and poinsettias (0602.90.60) and Christmas trees (0604.20) are not on the list and enter **free**.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["coverageNote"] = "Import values are CIF as reported by the United States to UN Comtrade; duty collected is not shown."
ts["biggestLines"] = [{"hts": "0603.11", "label": "Fresh cut roses"}, {"hts": "0603.19", "label": "Other fresh cut flowers"}]
ov["notes"] = {
    "chapterNotes": "**Note 1.** Subject to the second part of heading 0601, this chapter covers only live trees and goods (including "
    "seedling vegetables) of a kind commonly supplied by nursery gardeners or florists for planting or for ornamental use; "
    "nevertheless it does not include potatoes, onions, shallots, garlic or other products of chapter 7.\n\n**Note 2.** Any reference "
    "in heading 0603 or 0604 to goods of any kind shall be construed as including a reference to bouquets, floral baskets, wreaths "
    "and similar articles made wholly or partly of goods of that kind, account not being taken of accessories of other materials. "
    "However, these headings do not apply to collages or similar decorative plaques of heading 9701.",
    "additionalUsNotes": None,
}

# =============================================================================================================
# Understand industry
# =============================================================================================================
ui["h1"] = "HTS Chapter 06: Live Trees and Other Plants; Bulbs, Roots and the Like; Cut Flowers and Ornamental Foliage — U.S. Import Statistics"
ui["seo"] = {
    "title": "U.S. Cut Flower & Live Plant Imports by Country 2025: Colombia, Ecuador, Canada (HTS Ch. 06) | KoalaGains",
    "shortDescription": f"U.S. imports of live plants, bulbs, cut flowers and foliage 2020–2025 by country, product and year: {money(TOTAL)} "
    f"in 2025, down {CHG.lstrip('-')}% from {money(PRIOR)}. Colombia supplied {CO_SHARE}%, Canada 19% and Ecuador 18%; roses were "
    "the largest product.",
    "keywords": [
        "us cut flower imports by country",
        "flower imports from colombia",
        "ecuador rose exports to us",
        "us live plant imports canada",
        "netherlands flower bulb imports",
        "hts chapter 06 import statistics",
        "fresh cut roses imports",
    ],
}
for s in ui["stats"]:
    if s["label"] == "Largest product":
        s["note"] = "Fresh cut roses (0603.11)"
ui["why"] = (
    f"U.S. imports of Chapter 06 goods grew from **{money(Y2020)} in 2020 to {money(PRIOR)} in 2024**, then slipped to **{money(TOTAL)} "
    f"in 2025** ({CHG}%). Cut flowers held steady at {money(CUT)} ({money(CUT_PRIOR)} in 2024): **Colombia** ({money(HC[('0603', 'Colombia')])}) "
    f"and **Ecuador** ({money(HC[('0603', 'Ecuador')])}) supply {CO_EC_CUT}% of them, and fresh roses alone were {money(roses['importsUsd'])}, "
    f"{pct(roses['importsUsd'], TOTAL)}% of the chapter. The fall came from live plants ({money(PLANTS_PRIOR)} to {money(PLANTS)}) and "
    f"foliage ({money(FOL_PRIOR)} to {money(FOL)}): **Canada**, whose exports are mostly live plants ({money(HC[('0602', 'Canada')])}), "
    f"fell {abs(ca['changePct'])}%, and **China** fell {abs(BC['China']['changePct'])}%. The **Netherlands** grew "
    f"{nl['changePct']}% to {money(nl['importsUsd'])} and supplied {NL_BULB}% of the bulbs.\n\n"
    "Base rates did not change. In 2025 most suppliers paid the IEEPA reciprocal tariff from April (10% for Colombia, for example), "
    "and Canadian and Mexican goods that did not qualify for USMCA paid 25% or 35%; those duties ended February 24, 2026. The 2026 "
    "Section 301 and Section 338 duties started in July and August 2026 and are not yet in a full year of trade data. These are values, "
    "not volumes. 2025 is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 06 (retrieved 2026-10-12)", "url": "https://comtradeplus.un.org/"},
    {"label": "Federal Register 90 FR 15041 (Executive Order 14257, reciprocal tariff)",
     "url": FRD + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"},
    {"label": "Federal Register 91 FR 9437 (Executive Order 14389, ending the IEEPA tariffs)", "url": FRD + "2026/02/25/2026-03832/ending-certain-tariff-actions"},
]
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Taiwan is reported as \"Other Asia, nes\"."

# =============================================================================================================
# Industry areas
# =============================================================================================================
ia["seo"] = {
    "title": "Tariffs on Flowers & Plants by Country: Colombia, Ecuador, Canada, Netherlands (HTS Ch. 06) | KoalaGains",
    "shortDescription": "The total U.S. tariff on bulbs, live plants, cut flowers and foliage by country and product group: base rate "
    "plus the 2026 Section 301 and Canada Section 338 duties, with USMCA, the Colombia TPA, CAFTA-DR, the Peru TPA and AGOA applied. "
    "Colombia, Canada, Ecuador, the Netherlands, Mexico, Costa Rica, Guatemala, China, Taiwan, Thailand, India, Peru, Kenya.",
    "keywords": [
        "hts chapter 06 import duty rates",
        "colombia fresh cut roses import duty",
        "ecuador cut flowers import duty",
        "netherlands dormant bulbs tariff",
        "tariffs on plants from canada",
        "usmca live plants tariff",
        "kenya flowers agoa duty free",
    ],
}
ia["intro"] = (
    "The total rate on plants and flowers depends more on **where they come from** than on what they are. Each cell below is the "
    "base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff "
    "schedule.\n\n"
    "**Colombian flowers pay 12.5%** with a Colombia TPA claim; **Ecuadorian flowers pay only their 6.4% to 6.8% base rate** because "
    "Ecuador's exception list removes the Section 301 duty. **Dutch bulbs and flowers pay 10% in total.** USMCA-qualifying Mexican "
    "goods are free, but **Canada's bulbs, cuttings, orchids and cut flowers pay 50%** under Section 338 even with USMCA, while its "
    "nursery stock and Christmas trees enter free. Costa Rica, Peru and Thailand pay 12.5%; Kenya, under AGOA, pays nothing."
)
LABELS = {
    "Colombia": "Base rate +12.5% Section 301 (9903.05.32) on 77 of 78 lines; unrooted cuttings exempt (9903.05.86). The Colombia TPA (CO) "
    "is applied and makes the base rate Free, but not the 12.5% (U.S. note 52(a)). The 2025 IEEPA reciprocal duty ended February 24, 2026.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but +50% Section 338 (9903.03.14) on the 48 listed lines — bulbs, unrooted "
    "cuttings, orchid plants, mushroom spawn, cut flowers other than carnations and non-fresh foliage. Otherwise base rate +10% Section 301 "
    "(9903.05.29) on 77 of 78 lines, plus the 50% on the listed lines. The 2025 IEEPA duty (+35%) ended February 24, 2026.",
    "Ecuador": "Base rate only on 70 of 78 lines: Ecuador's exception list (9903.06.18) and the unrooted-cuttings exemption (9903.05.86). "
    "+10% Section 301 (9903.05.35) on the other 8 lines (lily-of-the-valley pips, hyacinths in growth, fruit trees, azaleas, plants "
    "without soil, mushroom spawn). No FTA; GSP expired. The 2025 IEEPA reciprocal duty ended February 24, 2026.",
    "Netherlands": "EU goods: 10% in total where the base rate is lower (9903.05.39) — every dutiable line — on 77 of 78 lines; unrooted "
    "cuttings pay their 4.8% base rate (9903.05.86). The EU exception list has no Chapter 06 line. The 15% IEEPA rate ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55) on 77 of 78 lines; unrooted "
    "cuttings exempt (9903.05.86). The 2025 IEEPA duty (+25%) ended February 24, 2026.",
    "Costa Rica": "Base rate +12.5% Section 301 (9903.05.33) on 77 of 78 lines; unrooted cuttings exempt (9903.05.86). CAFTA-DR (P) is applied "
    "and makes the base rate Free, but not the 12.5% (U.S. note 52(a)). The 2025 IEEPA reciprocal duty ended February 24, 2026.",
    "Guatemala": "Base rate only on 56 of 78 lines: Guatemala's exception list (9903.06.04) and the unrooted-cuttings exemption (9903.05.86). "
    "+10% Section 301 (9903.05.40) on 22 lines, including dormant bulbs, plants without soil, miniature carnations and chrysanthemums. "
    "CAFTA-DR (P) is applied and makes the base rate Free.",
    "China": "Base rate +12.5% Section 301 (2026, 9903.05.31) on 77 of 78 lines +7.5% Section 301 List 4A (9903.88.15) on 77 lines: +20% on "
    "most lines, +7.5% on unrooted cuttings and +12.5% on mushroom spawn. The IEEPA duties on China ended February 24, 2026.",
    "Taiwan": "Base rate only on 57 of 78 lines: Taiwan's exception list (9903.06.14) — orchid plants, all fresh cut flowers and foliage — and "
    "the unrooted-cuttings exemption. On the other 21 lines the total is 10% where the base rate is lower (9903.05.76). The IEEPA reciprocal "
    "duty ended February 24, 2026.",
    "Thailand": "Base rate +12.5% Section 301 (9903.05.77) on 77 of 78 lines; unrooted cuttings exempt (9903.05.86). No FTA; GSP expired. The "
    "IEEPA reciprocal duty ended February 24, 2026.",
    "India": "Base rate +10% Section 301 (9903.05.44) on 77 of 78 lines; unrooted cuttings exempt (9903.05.86). No FTA; GSP expired. The IEEPA "
    "duties on India ended February 24, 2026.",
    "Peru": "Base rate +12.5% Section 301 (9903.05.63) on 77 of 78 lines; unrooted cuttings exempt (9903.05.86). The Peru TPA (PE) is applied "
    "and makes the base rate Free, but not the 12.5% (U.S. note 52(a)). The IEEPA reciprocal duty ended February 24, 2026.",
    "Kenya": "No extra duty: Kenya is not one of the 60 Section 301 economies. AGOA (D), renewed through December 31, 2026, is applied and "
    "makes every dutiable line Free. The IEEPA reciprocal duty ended February 24, 2026.",
    "Any other country": "Range across every other country: from the base rate alone (countries outside the 60 Section 301 economies) up to "
    "the base rate +37.5% for Brazil (25% Brazil action + 12.5%, 9903.05.01 and 9903.05.27). Japan, South Korea and Switzerland pay 12.5% in "
    "total where the base rate is lower; Switzerland, Malaysia, Cambodia, Indonesia and Jordan have exception lists covering most lines. No "
    "preference is applied here.",
}
EXTRA_IA_SOURCES = {
    "Colombia": ["eo-14389"], "Canada": ["eo-14389"], "Ecuador": ["eo-14389", "cbp-gsp"], "Netherlands": ["eo-14389"],
    "Mexico": ["eo-14389"], "Costa Rica": ["eo-14389"], "Guatemala": [], "China": ["eo-14389"], "Taiwan": ["eo-14389"],
    "Thailand": ["eo-14389", "cbp-gsp"], "India": ["eo-14389", "cbp-gsp"], "Peru": ["eo-14389"], "Kenya": ["ustr-agoa-2026", "hts-gn16", "eo-14389"],
    "Any other country": ["fr-2026-14542"],
}
for c in ia["countries"]:
    c["rule"]["label"] = LABELS[c["country"]]
    for sid in EXTRA_IA_SOURCES[c["country"]]:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
# Kenya rule: generator gave no source ids beyond hts-now? make sure hts-now present
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Canada's Section 338 duty (9903.03.14, 50%) is applied on both sides of the Canada row, because a USMCA claim does not remove it "
    "(U.S. note 51(a)).",
    "No antidumping or countervailing duty order covers Chapter 06 goods, so none is shown.",
    "The rate is not the only gate: bulbs and plants need an APHIS permit and phytosanitary certificate, cut flowers are inspected at "
    "the port, and CITES-listed plants such as most orchids need CITES documents (see Tariff engineering).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 50, 51 and 52 to Chapter 99 subchapter III and note 20 (China) in the 2026 Revision 21. Note 52(b) (9903.05.86) "
    "lists one Chapter 06 provision, unrooted cuttings and slips (0602.10.00), exempt from the 2026 Section 301 duties for every "
    "country; notes 52(c)–(f) name no Chapter 06 article, and note 52(i) covers CAFTA-DR textiles only. The country exception lists in "
    "note 52(j) cover Chapter 06 lines for Ecuador (69 lines), Indonesia, Cambodia and Jordan (69 each), Switzerland (66), Taiwan "
    "(56), Guatemala (55), Malaysia (45), Argentina (25), El Salvador (15) and Bangladesh (1); the EU and UK lists have none. The "
    "Brazil exemption list (note 50(a)(ii)) has no Chapter 06 line. The Canada Section 338 list (note 51(b)(3), 9903.03.14) has 48 "
    "Chapter 06 lines; the dairy and alcohol lists (9903.03.12, 9903.03.13) have none. China's List 4A (note 20(s)) covers 77 lines, "
    "all but mushroom spawn. The Section 122 and reciprocal-tariff agricultural exemption lists (9903.03.03, 9903.01.32) had no Chapter 06 line."
)

# =============================================================================================================
# Tariff engineering
# =============================================================================================================
te["seo"] = {
    "title": "Importing Plants & Cut Flowers into the U.S.: APHIS Permits, CITES & Legal Ways to Lower Duty (HTS Ch. 06) | KoalaGains",
    "shortDescription": "The USDA APHIS, CITES and CBP rules for each HTS Chapter 06 line — plants-for-planting permits and "
    "phytosanitary certificates, cut-flower inspection, Christmas trees from Canada, CITES orchids, origin marking — and the legal ways "
    "to pay less: USMCA, FTA and AGOA claims, the unrooted-cuttings exemption and country exception lists.",
    "keywords": [
        "usda aphis plant propagation import regulations",
        "aphis plant import permit",
        "phytosanitary certificate plants import",
        "importing plants into the us",
        "usmca origin for floral goods",
        "chapter 06 tariff engineering",
        "cites orchid import permit",
        "unrooted cuttings tariff exemption",
    ],
}
te["intro"] = (
    "Before a plant or flower shipment pays any duty it has to be **allowed in**. Bulbs, cuttings and nursery stock are \"plants for "
    "planting\": they need a written APHIS permit unless the Plants for Planting Manual exempts them, a phytosanitary certificate, "
    "usually entry through a USDA plant inspection station, and no soil. Cut flowers are inspected at the port of first arrival. "
    "Orchids, cacti and other CITES-listed plants need CITES documents, and Christmas trees from Canada may need a certificate.\n\n"
    "The ways to pay less are written into the schedule: claim **USMCA**, an **FTA** or **AGOA**, ship cuttings **unrooted** (the only "
    "Chapter 06 line exempt from the 2026 Section 301 duty), and check whether the line is on the supplier's **country exception "
    "list**. Each depends on a document, listed below with its regulation. None of them removes Canada's 50% Section 338 duty."
)
te["regulationsAsOf"] = "2026-10-08"
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on plants and flowers from Canada or Mexico",
        "saves": "The base rate (up to 7%) and the 10% Section 301 duty on goods of Canada or Mexico",
        "appliesTo": "All 78 lines, for goods that qualify as originating under USMCA — plants grown in Canada or Mexico qualify",
        "document": "A certification of origin from the importer, exporter or producer. No prescribed form; it can be on the invoice or another document, and CBP can ask for it.",
        "caveat": "USMCA does not remove the 50% Section 338 duty on the 48 listed lines from Canada (U.S. note 51(a)): Canadian bulbs, "
        "unrooted cuttings, orchid plants, mushroom spawn and cut flowers other than carnations pay it either way. The USMCA was not "
        "renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ECFR + "title-19/section-182.12"},
            {"label": "HTSUS 9903.05.93 / 9903.05.94 and U.S. note 51 (Section 338)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)",
             "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA rate (Colombia, CAFTA-DR, Peru, Chile, Israel and others)",
        "saves": "The base rate — 6.8% on roses, 6.4% on most cut flowers, up to 4.8% on plants",
        "appliesTo": "The 59 dutiable lines, which are Free for FTA partners (SPI AU, BH, CL, CO, IL, JO, KR, MA, OM, P, PA, PE, SG), for CBERA countries (E) and, on some lines, for Japan (JP)",
        "document": "The claim and certification each agreement requires — for example 19 CFR 10.3003 (Colombia) or 19 CFR 10.583 (CAFTA-DR).",
        "caveat": "An FTA claim removes the base rate but not the 2026 Section 301 duty for the country (U.S. note 52(a)): Colombian roses "
        "claimed under CO still pay 12.5%. GSP (A, A*, A+) has been expired since December 31, 2020.",
        "citations": [
            {"label": "19 CFR 10.3003 (Colombia TPA)", "url": ECFR + "title-19/section-10.3003"},
            {"label": "19 CFR 10.583 (CAFTA-DR)", "url": ECFR + "title-19/section-10.583"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "agoa",
        "title": "Source from an AGOA country outside the Section 301 list (Kenya and others)",
        "saves": "Everything: the base rate is Free under AGOA (D), and Kenya is not one of the 60 Section 301 economies",
        "appliesTo": "The 59 dutiable lines (all carry D in the Special column), for goods of the countries listed in General Note 16",
        "document": "An AGOA claim (SPI D) on the entry, for goods that meet the origin rules of General Note 16 (plants grown in the beneficiary country qualify).",
        "caveat": "AGOA is authorized only through December 31, 2026. Some AGOA countries (for example South Africa, Nigeria and Angola) are "
        "among the 60 Section 301 economies and still pay that duty.",
        "citations": [
            {"label": "HTSUS General Note 16 (AGOA)", "url": GN},
            {"label": "USTR statement on the AGOA reauthorization (February 3, 2026)",
             "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"},
        ],
    },
    {
        "id": "unrooted",
        "title": "Ship cuttings unrooted",
        "saves": "The whole 2026 Section 301 duty — 10% or 12.5% of value — on cuttings and slips",
        "appliesTo": "Unrooted cuttings and slips (0602.10.00), the only Chapter 06 line on the general exemption list; rooted cuttings and young plants classify in 0602.90 and pay it",
        "document": "Correct classification on the entry (0602.10.00), backed by the plants-for-planting permit and phytosanitary certificate describing unrooted cuttings.",
        "caveat": "The exemption (U.S. note 52(b), 9903.05.86) removes only the 2026 Section 301 duty. Chinese cuttings still pay 7.5% "
        "(List 4A), Brazilian ones 25%, and Canadian unrooted cuttings are on the Section 338 list (50%).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "HTSUS Chapter 06 (2026 Revision 21)", "url": CH06},
        ],
    },
    {
        "id": "exception-list",
        "title": "Check the supplier country's exception list",
        "saves": "The 10% Section 301 duty on most lines from Ecuador, Guatemala and Taiwan (and Switzerland, Indonesia, Cambodia, Jordan, Malaysia)",
        "appliesTo": "Lines on the country lists in U.S. note 52(j) — for Ecuador every fresh cut flower and 69 of 78 lines; for Guatemala 55 lines; for Taiwan orchid plants, cut flowers and foliage (56 lines)",
        "document": "Correct classification and country of origin on the entry; the exception heading (for example 9903.06.18 for Ecuador) is reported with it.",
        "caveat": "The lists are per country and per line: Ecuadorian mushroom spawn and plants without soil, and Guatemalan dormant bulbs "
        "and chrysanthemums, still pay 10%. The lists can change with each Agreement on Reciprocal Trade.",
        "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)", "url": CH99}],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty: a ruling fixes the classification (dormant vs. in growth, with vs. without soil, rooted vs. unrooted, bouquet with accessories) before the goods arrive",
        "appliesTo": "Any line where the classification decides the rate, the exemption-list status or the Section 338 status",
        "document": "A ruling request to CBP describing the goods.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [{"label": "19 CFR part 177", "url": ECFR + "title-19/part-177"}],
    },
]
te["rules"] = [
    {
        "id": "aphis-pfp",
        "agency": "USDA APHIS",
        "title": "Plants for planting (bulbs, cuttings, nursery stock): written PPQ permit unless the Plants for Planting Manual exempts the "
        "plant (apply at least 30 days before arrival), phytosanitary certificate naming the genus, entry through a USDA plant inspection "
        "station unless precleared, free of soil except from Canada or in approved growing media; some taxa are not authorized pending pest "
        "risk analysis or need postentry quarantine",
        "citations": [
            {"label": "7 CFR 319.37-4", "url": ECFR + "title-7/section-319.37-4"},
            {"label": "7 CFR 319.37-5", "url": ECFR + "title-7/section-319.37-5"},
            {"label": "7 CFR 319.37-6", "url": ECFR + "title-7/section-319.37-6"},
            {"label": "7 CFR 319.37-8", "url": ECFR + "title-7/section-319.37-8"},
            {"label": "7 CFR 319.37-10", "url": ECFR + "title-7/section-319.37-10"},
            {"label": "7 CFR 319.37-23", "url": ECFR + "title-7/section-319.37-23"},
        ],
    },
    {
        "id": "aphis-cut-flowers",
        "agency": "USDA APHIS",
        "title": "Fresh cut flowers: held at the port of first arrival for APHIS inspection; treatment (e.g. methyl bromide for leafminers) if "
        "pests are found. Chrysanthemum white rust restrictions end November 9, 2026, when commodity conditions move to ACIR",
        "citations": [
            {"label": "7 CFR 319.74-2", "url": ECFR + "title-7/section-319.74-2"},
            {"label": "91 FR 64253 (final rule, October 8, 2026)",
             "url": FRD + "2026/10/08/2026-20630/cut-flowers-regulations-removal-of-chrysanthemum-white-rust-related-provisions"},
        ],
    },
    {
        "id": "aphis-acir",
        "agency": "USDA APHIS",
        "title": "Commodity- and country-specific entry conditions (greenery, foliage, dried plant material, mushroom spawn and cut flowers) "
        "are listed in the Agricultural Commodity Import Requirements (ACIR) database",
        "citations": [
            {"label": "APHIS Agricultural Commodity Import Requirements (ACIR)", "url": "https://acir.aphis.usda.gov/s/"},
            {"label": "7 CFR 319.74-1 (what counts as a cut flower)", "url": ECFR + "title-7/section-319.74-1"},
        ],
    },
    {
        "id": "aphis-spongy-moth-ca",
        "agency": "USDA APHIS",
        "title": "Christmas trees from Canada: trees without roots going to or through U.S. areas free of gypsy (spongy) moth need a "
        "phytosanitary certificate (from infested areas of Canada) or a certificate of origin (from non-infested areas), unless greenhouse-grown",
        "citations": [
            {"label": "7 CFR 319.77-2", "url": ECFR + "title-7/section-319.77-2"},
            {"label": "7 CFR 319.77-4", "url": ECFR + "title-7/section-319.77-4"},
        ],
    },
    {
        "id": "cites",
        "agency": "FWS / USDA APHIS",
        "title": "CITES-listed plants (most orchids, cacti, cycads, some bulbs such as snowdrops and cyclamen): CITES export or re-export "
        "document, entry through a designated port, and an APHIS protected-plant permit for businesses; cut flowers of artificially "
        "propagated Appendix II plants are usually excluded by the listing annotation",
        "citations": [
            {"label": "50 CFR 23.23", "url": ECFR + "title-50/section-23.23"},
            {"label": "50 CFR 23.92", "url": ECFR + "title-50/section-23.92"},
            {"label": "50 CFR 24.12 (designated ports)", "url": ECFR + "title-50/section-24.12"},
            {"label": "7 CFR 355.11", "url": ECFR + "title-7/section-355.11"},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking: cut flowers, plants and nursery stock, and Christmas trees are on the J-list, so the article "
        "itself need not be marked, but the outermost container must show the country of origin",
        "citations": [
            {"label": "19 CFR 134.33", "url": ECFR + "title-19/section-134.33"},
            {"label": "19 CFR 134.11", "url": ECFR + "title-19/section-134.11"},
        ],
    },
]
GROUP_RULES = {
    "0601": (["aphis-pfp", "cites", "cbp-marking"],
             "Bulbs are plants for planting even when dormant. Some bulbous plants (for example Galanthus snowdrops and Cyclamen) are "
             "CITES-listed. Canadian tulip, hyacinth, lily and narcissus bulbs pay the 50% Section 338 duty."),
    "0602": (["aphis-pfp", "cites", "aphis-acir", "cbp-marking"],
             "Most orchids and cacti are CITES-listed. Potted Phalaenopsis orchids from Germany and the Netherlands may enter in approved "
             "growing media (since July 22, 2025); chrysanthemum cuttings from certain countries may be authorized from November 9, 2026. "
             "Mushroom spawn is not a plant for planting; check ACIR."),
    "0603": (["aphis-cut-flowers", "aphis-acir", "cites", "cbp-marking"],
             "Bouquets and wreaths classify with the flowers they are made of (chapter note 2). Dried, dyed or bleached flowers (0603.90) "
             "are not \"cut flowers\" under 7 CFR 319.74-1; their conditions are in ACIR."),
    "0604": (["aphis-acir", "aphis-spongy-moth-ca", "cbp-marking"],
             "Fresh greenery and Christmas trees are not \"cut flowers\" under 7 CFR 319.74-1; Christmas trees from Canada fall under the "
             "gypsy (spongy) moth rules. Fresh foliage and Christmas trees are not on Canada's Section 338 list."),
}
for g in te["groups"]:
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]

ROWS_BY_HTS = {r["hts"]: r for r in rows}
MEASURES_PATH = "/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui/src/tariff-data/calculator/measures.json"
measures = {x["measureKey"]: x for x in json.load(open(MEASURES_PATH))["measures"]}
EXC = set()
for key in ("s301-2026-except-ec", "s301-2026-except-gt", "s301-2026-except-tw"):
    EXC |= {c for c in measures[key]["coverageInclude"] if c.startswith("06")}
CITES_LINES = {"0601.10.90", "0601.20.90", "0602.90.20", "0602.90.30", "0602.90.40", "0602.90.60", "0602.90.90", "0603.13.00"}
XMAS = {"0604.20.00.20", "0604.20.00.40", "0604.20.00.60"}
for line in te["lines"]:
    hts, h = line["hts"], line["heading"]
    row = ROWS_BY_HTS[hts]
    code8 = row["htsCode10"][:8]
    rule_ids = []
    if h in ("0601", "0602") and not hts.startswith("0602.90.50"):
        rule_ids.append("aphis-pfp")
    if h == "0603" and not hts.startswith("0603.90"):
        rule_ids.append("aphis-cut-flowers")
    if h in ("0604",) or hts.startswith("0603.90") or hts.startswith("0602.90.50") or h == "0603" or hts.startswith("0602.90"):
        rule_ids.append("aphis-acir")
    if hts in XMAS:
        rule_ids.append("aphis-spongy-moth-ca")
    if any(hts.startswith(c) for c in CITES_LINES):
        rule_ids.append("cites")
    rule_ids.append("cbp-marking")
    lever_ids = ["usmca"]
    if row["dutiable"]:
        lever_ids += ["fta", "agoa"]
    if hts.startswith("0602.10"):
        lever_ids.append("unrooted")
    if code8 in EXC:
        lever_ids.append("exception-list")
    lever_ids.append("ruling")
    line["ruleIds"], line["leverIds"] = rule_ids, lever_ids
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Which plants may enter from which country, "
    "and under what conditions, changes as APHIS updates the Plants for Planting Manual and ACIR; check them and your permit before "
    "each shipment."
)

# =============================================================================================================
# Final conclusion (FAQ) — questions from Google search suggestions (U.S.), collected 2026-10-12
# =============================================================================================================
fc["seo"] = {
    "title": "Flower & Plant Tariffs FAQ: Colombia, Ecuador, Canada, Christmas Trees, HS Codes (HTS Ch. 06) | KoalaGains",
    "shortDescription": "Answers to what people search about flower and plant tariffs: is there a tariff on flowers, tariffs on flowers "
    "from Colombia and Ecuador, roses, plants and Christmas trees from Canada, flower bulbs, and the HS codes for cut flowers, roses, "
    "live plants and mushroom spawn.",
    "keywords": [
        "tariff on flowers",
        "is there a tariff on flowers",
        "tariffs on flowers from colombia",
        "tariffs on flowers from ecuador",
        "tariffs on roses",
        "tariffs on plants from canada",
        "tariffs on christmas trees from canada",
        "hs code for fresh cut flowers",
        "hs code for live plants",
        "hs code for roses",
    ],
}
fc["intro"] = (
    "Straight answers to the most common questions about importing flowers, plants and bulbs into the U.S. — tariffs by country, HS "
    "codes and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Base rates are low and unchanged: 6.8% on fresh roses, 6.4% on most cut flowers, 1.4% to 4.8% on plants, Free on fresh foliage "
    "and Christmas trees. The 2025 IEEPA tariffs ended February 24, 2026.",
    "Since July 24, 2026 a Section 301 tariff applies to 60 economies: 12.5% on Colombian flowers even with the FTA, 10% in total on "
    "EU bulbs and flowers — but Ecuador's exception list keeps nearly all Ecuadorian flowers at their base rate.",
    "Canadian bulbs, cuttings, orchids and cut flowers have paid a 50% Section 338 duty since August 22, 2026, even with USMCA; "
    "Canadian nursery stock and Christmas trees still enter free under USMCA.",
    "Unrooted cuttings are the only Chapter 06 line exempt from the 2026 Section 301 duty, and Kenyan flowers enter free under AGOA.",
    "Every bulb and plant needs APHIS clearance (permit, phytosanitary certificate, no soil), cut flowers are inspected at the port, "
    "and CITES-listed orchids and cacti need CITES documents.",
]
fc["questionSource"] = "Google search suggestions (U.S.), collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "flowers-tariff",
        "question": "Is there a tariff on flowers imported into the U.S.?",
        "searchedAs": ["tariff on flowers", "is there a tariff on flowers", "tariffs on cut flowers", "tariffs on fresh flowers",
                       "tariffs on flowers from south america"],
        "answer": "Yes. Fresh cut flowers carry a base rate of 3.2% to 6.8% (roses 6.8%, most others 6.4%) and dried or dyed flowers 4%. "
        "FTA partners such as Colombia, Peru, Chile and the CAFTA-DR countries pay no base rate, and Kenya pays nothing under AGOA. Since "
        "July 24, 2026 a Section 301 tariff applies on top to flowers from 60 economies: 12.5% for Colombia, Costa Rica and Peru, and 10% "
        "in total for the EU. Ecuador's exception list removes it for every Ecuadorian cut flower. Canadian cut flowers other than "
        "carnations pay a 50% Section 338 duty since August 22, 2026, even with USMCA. The IEEPA tariffs of 2025 ended on February 24, 2026.",
        "link": "",
    },
    {
        "id": "colombia",
        "question": "What is the tariff on flowers from Colombia?",
        "searchedAs": ["tariffs on flowers from colombia", "tariffs on flowers from south america"],
        "answer": "12.5% of value with a Colombia Trade Promotion Agreement (CO) claim: the FTA makes the base rate Free, but the 2026 "
        "Section 301 duty on goods of Colombia (9903.05.32, since July 24, 2026) still applies. Without the claim roses pay 6.8% + 12.5% = "
        "19.3% and other cut flowers 18.9%. Colombia has no exception list. The 10% IEEPA reciprocal tariff of 2025 ended February 24, 2026, "
        f"and the 10% Section 122 surcharge ran from then until July 23, 2026. Colombia supplied {money(co['importsUsd'])} ({CO_SHARE}%) of "
        "U.S. imports of plants and flowers in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "ecuador",
        "question": "Are there tariffs on flowers from Ecuador?",
        "searchedAs": ["tariffs on flowers from ecuador", "tariffs on ecuador flowers", "are there tariffs on flowers from ecuador"],
        "answer": "Only the base rate on cut flowers: 6.8% on roses and 6.4% on most others. Ecuador's exception list (9903.06.18) removes "
        "the 10% Section 301 duty on 69 of the 78 Chapter 06 lines, including every fresh cut flower. The 10% still applies to 8 lines, such "
        "as lily-of-the-valley pips, fruit trees, plants without soil and mushroom spawn. There is no FTA with Ecuador and GSP has been "
        f"expired since 2020. Ecuador supplied {money(ec['importsUsd'])} of plants and flowers in 2025, almost all cut flowers.",
        "link": "industry-areas",
    },
    {
        "id": "roses",
        "question": "What is the tariff on roses, and what is their HS code?",
        "searchedAs": ["tariffs on roses", "hs code for roses", "hs code for fresh roses", "hs code for fresh cut roses",
                       "hs code for flowers rose", "hs code for live roses"],
        "answer": "Fresh cut roses are 0603.11.00 (statistical suffix 30 for spray roses, 50 for others), with a 6.8% base rate that FTA "
        "partners and AGOA countries do not pay. Live rose plants, grafted or not, are 0602.40.00, Free. What you pay depends on the "
        "country: Colombian roses 12.5% with the FTA, Ecuadorian roses 6.8%, Dutch roses 10%, USMCA-qualifying Canadian cut roses 50% "
        f"(Section 338), Kenyan roses Free. Fresh roses were the largest Chapter 06 import in 2025 at {money(roses['importsUsd'])}.",
        "link": "",
    },
    {
        "id": "canada-plants",
        "question": "Are there tariffs on plants from Canada?",
        "searchedAs": ["tariffs on plants from canada", "are there tariffs on plants", "tariffs on plants"],
        "answer": "It depends on the plant. Canadian nursery stock — trees and shrubs, perennials, poinsettias, azaleas, rose and fruit "
        "plants — enters free with a USMCA claim. But 48 of the 78 Chapter 06 lines, including bulbs, unrooted cuttings, orchid plants, "
        "mushroom spawn and cut flowers other than carnations, pay a 50% Section 338 duty (9903.03.14) since August 22, 2026, with or without "
        "USMCA. Goods that do not qualify for USMCA also pay the base rate plus 10% Section 301. The 35% IEEPA duty ended February 24, 2026. "
        f"Canada supplied {money(ca['importsUsd'])} in 2025, {money(HC[('0602', 'Canada')])} of it live plants.",
        "link": "industry-areas",
    },
    {
        "id": "christmas-trees",
        "question": "Are there tariffs on Christmas trees from Canada?",
        "searchedAs": ["tariff on christmas trees", "tariffs on christmas trees from canada", "are there tariffs on christmas trees",
                       "are there tariffs on christmas trees from canada"],
        "answer": "Not on USMCA-qualifying fresh-cut trees. Christmas trees (0604.20.00.20 Douglas fir, .40 other fir, .60 other) have a "
        "Free base rate and are not on Canada's Section 338 list, so trees that qualify for USMCA pay nothing; trees that do not qualify pay "
        "10% under Section 301 (9903.05.29). Trees going to U.S. areas free of gypsy (spongy) moth need a Canadian phytosanitary certificate "
        "or certificate of origin (7 CFR 319.77-4). Artificial Christmas trees are a different product (9505.10.40.10 or 9505.10.50.10).",
        "link": "tariff-engineering",
    },
    {
        "id": "bulbs",
        "question": "Are there tariffs on flower bulbs from the Netherlands?",
        "searchedAs": ["tariffs on flower bulbs", "hs code for flower bulbs", "hs code for bulbs", "tariff on tulip bulbs"],
        "answer": "Yes, 10% of value in total since July 24, 2026. Dormant bulbs (0601.10) have tiny per-1,000 base rates — tulips 89.6¢, "
        "hyacinths 38.4¢, lilies 55.7¢, narcissus $1.34, crocus 19.2¢ — and other bulbs 3.5%. For EU goods the 2026 Section 301 rule "
        "(9903.05.39) sets the total at 10% when the base rate is lower, which it is on every bulb line. The Netherlands supplied "
        f"{money(HC[('0601', 'Netherlands')])} ({NL_BULB}%) of U.S. bulb imports in 2025. Bulbs also need an APHIS permit and a "
        "phytosanitary certificate.",
        "link": "industry-areas",
    },
    {
        "id": "hs-cut-flowers",
        "question": "What is the HS code for fresh cut flowers?",
        "searchedAs": ["hs code for flowers", "hs code for fresh cut flowers", "hs code for cut flowers", "hs code for fresh flowers",
                       "hs code 0603", "hs code 0603.11", "hs code 0603.19", "hs code 0603.90"],
        "answer": "Heading 0603. Fresh: 0603.11 roses (6.8%), 0603.12 carnations (3.2% miniature spray, 6.4% other), 0603.13 orchids, "
        "0603.14 chrysanthemums, 0603.15 lilies and 0603.19.01 other fresh flowers (all 6.4%), with 10-digit lines for alstroemeria, gerbera, "
        "hydrangea, sunflowers, tulips and others. 0603.90 covers dried, dyed, bleached or otherwise prepared flowers (4%). Bouquets and "
        "wreaths classify with the flowers they are made of (chapter note 2).",
        "link": "",
    },
    {
        "id": "hs-dried-artificial",
        "question": "What is the HS code for dried and artificial flowers?",
        "searchedAs": ["hs code for dried flowers", "hts code for dried flowers", "hs code for artificial flowers", "silk flowers hs code",
                       "hs code for plastic flowers", "tariff code for artificial flowers"],
        "answer": "Dried, dyed or bleached flowers are 0603.90.00 (4%); dried or bleached foliage is 0604.90.30 (Free) and other prepared "
        "foliage 0604.90.60 (7%). Artificial flowers are not in Chapter 06: they are heading 6702 — plastic flowers 6702.10.20 (8.4%, "
        "assembled by binding) or 6702.10.40 (3.4%), and flowers of other materials 6702.90 (feathers 4.7%, man-made fibers 9%, other 17%).",
        "link": "",
    },
    {
        "id": "hs-live-plants",
        "question": "What is the HS code for live plants?",
        "searchedAs": ["hs code for live plants", "tariff code for live plants", "plants hs code", "hs code for plants",
                       "hts code for live plants"],
        "answer": "Heading 0602 (bulbs are 0601): unrooted cuttings 0602.10 (4.8%), fruit and nut trees 0602.20 (Free), rhododendrons and "
        "azaleas 0602.30 (1.9%), rose plants 0602.40 (Free), orchid plants 0602.90.20 (Free), other herbaceous perennials 0602.90.30 with "
        "soil (1.4%) or 0602.90.40 without (3.5%), mushroom spawn 0602.90.50 (1.4¢/kg), and other plants, trees, shrubs and poinsettias "
        f"0602.90.60 with soil (1.9%) or 0602.90.90 without (4.8%). The U.S. imported {money(PLANTS)} of live plants in 2025.",
        "link": "",
    },
    {
        "id": "mushroom-spawn",
        "question": "What is the HS code for mushroom spawn?",
        "searchedAs": ["mushroom spawn hs code", "oyster mushroom spawn hs code", "mushroom seeds hs code"],
        "answer": "0602.90.50.00, at 1.4¢/kg (Column 2: 2.2¢/kg) and Free for FTA partners and AGOA countries. It is the one Chapter 06 "
        "line not on China's List 4A, so Chinese spawn pays the base rate plus the 12.5% 2026 Section 301 duty; Canadian spawn pays the 50% "
        "Section 338 duty. Fresh mushrooms themselves are vegetables in Chapter 07 (heading 0709).",
        "link": "",
    },
    {
        "id": "import-plants",
        "question": "How do I import live plants into the U.S.? Do I need an APHIS permit?",
        "searchedAs": ["importing plants into the us", "can you import plants into the us", "aphis plant import permit",
                       "usda aphis plant import permits", "what is an aphis permit", "aphis import requirements", "bringing plants into us from canada"],
        "answer": "Usually yes. Plants for planting — bulbs, cuttings, nursery stock — need a written APHIS PPQ permit unless the Plants for "
        "Planting Manual exempts them (7 CFR 319.37-5); apply at least 30 days before arrival. Each shipment needs a phytosanitary "
        "certificate from the exporting country (319.37-6), permit shipments must enter through a USDA plant inspection station unless "
        "precleared (319.37-8), and plants must be free of soil except from Canada or in approved growing media (319.37-10). Some taxa are "
        "not authorized pending pest risk analysis (319.37-4). CITES-listed plants such as most orchids and cacti also need CITES documents.",
        "link": "tariff-engineering",
    },
    {
        "id": "tulip-bulbs-bring",
        "question": "Can you bring tulip bulbs into the U.S.?",
        "searchedAs": ["can you bring tulip bulbs into the us", "bringing plants into the us", "bringing plants into usa"],
        "answer": "Yes, but bulbs are plants for planting, so APHIS rules apply: a written permit unless the Plants for Planting Manual "
        "exempts them (permit-exempt plants still need an inspector's oral authorization at the port, 7 CFR 319.37-5(e)), a phytosanitary "
        "certificate, no soil, and inspection on arrival. Commercial shipments also pay duty: tulip bulbs (0601.10.15) carry 89.6¢ per "
        "1,000, and Dutch bulbs pay 10% of value in total under the 2026 Section 301 rule for EU goods.",
        "link": "tariff-engineering",
    },
]

# =============================================================================================================
# industryAreas sources must cover the ids its rules use
# =============================================================================================================
ia_have = {s["id"] for s in ia["sources"]}
tu_by_id = {s["id"]: s for s in tu["sources"]}
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in ia_have:
            ia["sources"].append(tu_by_id[sid])
            ia_have.add(sid)

d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows (2026 Revision 21)"},
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": "2025 import figures"},
]

# ---------- leftover check ----------
left = []


def walk(node, path):
    if isinstance(node, dict):
        for k, v in node.items():
            walk(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            walk(v, f"{path}[{i}]")
    elif isinstance(node, str) and re.search(r"\bTODO\b", node):
        left.append(path)


walk(d, "")
if left:
    print("TODO left:", len(left))
    for p in left[:80]:
        print("  ", p)
assert "[forbidden-source-name]" not in json.dumps(d).lower()
json.dump(d, open(out_path, "w"), ensure_ascii=False, indent=2)
print("wrote", out_path, "faqs", len(fc["faqs"]))
