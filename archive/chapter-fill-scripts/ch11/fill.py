"""Fill the writer parts of the generated Chapter 11 content file (run after pnpm tariff:generate-chapter)."""
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from fill_static import ADDITIONAL_US_NOTES, CHAPTER_NOTES, ECFR_DATE, ENGINEERING_GROUP_NOTES, PRODUCT_GROUPS  # noqa: E402

WT = "/Users/robin/projects/worktrees/chapter-content-generator/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/11-milling-products.json"
REF01 = f"{WT}/src/tariff-data/chapters/01-live-animals.json"
CHECKED = "2026-10-11"

d = json.load(open(PATH))
ref = json.load(open(REF01))
ref_src = {s["id"]: s for s in ref["tariffUpdates"]["sources"]}

LABELS = {
    "1101": ("Wheat flour", "Wheat flour"),
    "1102": ("Other cereal flours (corn, rice, rye, oat)", "Other flours"),
    "1103": ("Groats, meal & pellets (semolina, cornmeal)", "Groats & meal"),
    "1104": ("Rolled, flaked & worked grains; cereal germ", "Rolled grains"),
    "1105": ("Potato flour, flakes & granules", "Potato flakes"),
    "1106": ("Flours of pulses, roots & fruit", "Pulse & root flours"),
    "1107": ("Malt", "Malt"),
    "1108": ("Starches & inulin", "Starches"),
    "1109": ("Wheat gluten", "Wheat gluten"),
}

EXEMPT5 = (
    "Five lines in four subheadings are on the general exemption list in U.S. note 52(b) (9903.05.86) and pay no Section 301 duty: "
    "cassava and other root flours (1106.20.90), banana and plantain flour (1106.30.20), cassava starch (1108.14.00) "
    "and other starches (1108.19.00)."
)

# ---------------------------------------------------------------- chapter / overview
ov = d["overview"]
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 51 HTS Chapter 11 tariff lines: wheat flour, corn and rice flour, semolina, rolled oats, "
    "potato flakes, malt, corn, potato and tapioca starch, inulin and wheat gluten. General, FTA and Column 2 rates plus the "
    "extra duty by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 11",
    "wheat flour tariff",
    "malt import duty",
    "brewing malt tariff",
    "corn starch HS code",
    "tapioca starch tariff",
    "wheat gluten tariff",
    "HS code 1108",
    "rolled oats HS code",
]
ov["intro"] = (
    "Chapter 11 covers what mills, malt houses and starch plants make from grain, potatoes, pulses and roots: wheat and other "
    "flours, semolina and cornmeal, rolled oats, potato flakes, malt for brewers, native starches, inulin and wheat gluten. Its "
    "**51 tariff lines** carry small printed rates — 0.7¢/kg on wheat flour, 0.3¢/kg on malt, nothing at all on tapioca "
    "starch — with a few ad valorem exceptions: 6.8% on wheat gluten, 8.3% on chickpea and pea flour, 12.8% on mixed flours.\n\n"
    "As with most farm goods, the extra duty by country decides the cost. Canada and Mexico supplied 52% of the $2.34B the U.S. "
    "imported in 2025, and USMCA-qualifying goods from both enter free. Goods from elsewhere pay the base rate **plus a Section "
    "301 tariff** in force since July 24, 2026: 10% in total for the EU, +10% or +12.5% for most other large suppliers, +37.5% "
    "for China and Brazil. Five lines — cassava and other root flours, banana flour, cassava (tapioca) and other starches — are "
    "exempt from that duty for every country except China (see Rates by country)."
)
for g in ov["productGroups"]:
    blurb, ex = PRODUCT_GROUPS[g["heading"]]
    g["blurb"] = blurb
    g["searchExamples"] = ex
    g["label"] = LABELS[g["heading"]][0]
ov["workedExamples"] = [
    {
        "title": "20 tonnes of base malt from Saskatchewan",
        "line": "1107.10.00.00",
        "body": "Unroasted malt is 0.3¢/kg: 20,000 kg × $0.003 = **$60** at the general rate. Malt made in Canada from barley "
        "qualifies under USMCA (milling or malting grain of chapter 10 into a chapter 11 product is the required tariff shift), "
        "so with a USMCA claim the duty is **$0** and the Section 301 duty does not apply (9903.05.93). Without a valid claim "
        "a $12,000 shipment would owe $60 + 10% = **$1,260**.",
    },
    {
        "title": "A container of vital wheat gluten from Australia",
        "line": "1109.00.90.20",
        "body": "Wheat gluten for food is 6.8%, which the Australia FTA (SPI **AU**) makes Free. Australia is one of the 60 "
        "economies in the 2026 Section 301 action, so 12.5% is still added (9903.05.23): on a $45,000 container that is "
        "**$5,625**. The same gluten entered for animal feed (1109.00.10, 1.8%) pays the same 12.5%, because the FTA already "
        "removes the base rate.",
    },
    {
        "title": "20 tonnes of Italian \"00\" flour",
        "line": "1101.00.00.60",
        "body": "The general rate is 0.7¢/kg — $140 on 20,000 kg. For EU goods whose base rate is under 10%, the Section 301 "
        "action charges **10% of value in place of the base rate** (9903.05.39). On a $14,000 shipment the duty is "
        "**$1,400**, ten times the printed rate.",
    },
    {
        "title": "Tapioca starch from Thailand",
        "line": "1108.14.00.00",
        "body": "Cassava (manioc) starch is Free at the general rate, and 1108.14.00 is on the Section 301 general exemption "
        "list (U.S. note 52(b), 9903.05.86), so the 12.5% Thai rate does not apply: **$0** duty. The same starch from China "
        "still pays the 25% List 3 duty (9903.88.03). Chemically modified tapioca starch is heading 3505, not this line.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet"
ts["biggestLines"] = [
    {"hts": "1101.00", "label": "Wheat flour"},
    {"hts": "1109.00", "label": "Wheat gluten"},
    {"hts": "1107.10", "label": "Malt, not roasted"},
]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ov["notes"]["chapterNotes"] = CHAPTER_NOTES
ov["notes"]["additionalUsNotes"] = ADDITIONAL_US_NOTES

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["seo"]["title"] = "HTS Chapter 11 Flour, Malt & Starch Tariff Updates — What Changed Since January 2025 | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 11 (flour, malt, starches, wheat gluten) since January 2025: base rates on all 51 lines, the end "
    "of the IEEPA tariffs and the Section 122 surcharge, and the 2026 Section 301 tariffs by country, with Federal Register citations."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 11 tariff updates",
    "flour tariff changes 2026",
    "malt tariff Canada",
    "wheat gluten tariff Australia",
    "Section 301 tariff flour",
    "tapioca starch tariff exemption",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 44 dutiable Chapter 11 base rates are the same in both; the only "
    "difference is that rolled and flaked oats (1104.12.00) now have separate statistical lines for certified organic and other "
    "oats, at the same 1.2¢/kg.\n\n"
    "Everything else that changed came on top of the base rate. The 2025 IEEPA duties (Canada +35%, Mexico +25%, the reciprocal "
    "tariff on everyone else) **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on "
    "July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; China also "
    "keeps its 25% List 3 duty (**37.5%** in all) and Brazil adds the 25% Brazil Section 301 duty (**37.5%**). Five root-flour and "
    "starch lines are exempt from the 2026 action, and **USMCA-qualifying goods from Canada and Mexico pay nothing extra**."
)
tu["scope"] = (
    "Measures that reach Chapter 11 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, "
    "China Section 301 List 3, the Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended. "
    "For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [st for st in tu["stats"] if st["label"] != "Compared"] + [
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
for st in tu["stats"]:
    if st["label"] == "New or renumbered lines":
        st["note"] = "Rolled oats split into organic / other, same 1.2¢/kg"

IE = {
    "ca": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.93). " + EXEMPT5 + " The 2025 IEEPA duty on "
        "Canada (+35%, 9903.01.10) ended February 24, 2026. The 2026 Section 338 duties and import bans on Canadian alcoholic "
        "beverages, dairy and motor vehicles (U.S. note 51) list no Chapter 11 line — malt is not covered.",
        "USMCA-qualifying malt, rolled oats or flour from Canada pays $0. Canadian goods that do not qualify pay the base rate "
        "plus 10% of value.",
    ),
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). " + EXEMPT5 + " The 2025 IEEPA duty on "
        "Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "USMCA-qualifying corn flour from Mexico (Mexico's main Chapter 11 export, $185M of cereal flours in 2025) pays $0; "
        "non-qualifying goods pay the base rate plus 10%.",
    ),
    "eu": (
        "For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); every Chapter "
        "11 base rate is under 10% except mixed cereal flours (1102.90.30, 12.8%), which pay only their base rate. " + EXEMPT5 +
        " This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended February 24, 2026.",
        "German malt, Danish, Belgian or Dutch starch and Italian flour pay 10% of value in place of the base rate.",
    ),
    "au": (
        "The Australia FTA (SPI AU) makes every Chapter 11 base rate Free, but the 12.5% Section 301 duty still applies to FTA "
        "goods (U.S. note 52(a)). " + EXEMPT5 + " The 10% IEEPA reciprocal tariff ended February 24, 2026.",
        "Vital wheat gluten from Australia — the largest supplier, $142M in 2025 — pays 12.5% of value; under the FTA alone it "
        "would be Free.",
    ),
    "th": (
        EXEMPT5 + " GSP (SPI A, A+), printed on many lines, has been expired since December 31, 2020. The IEEPA reciprocal tariff "
        "ended February 24, 2026.",
        "Tapioca starch from Thailand stays duty-free; Thai rice flour (0.09¢/kg) or inulin (2.6%) pays the base rate plus 12.5%.",
    ),
    "in": (
        EXEMPT5 + " GSP has been expired since December 31, 2020. The IEEPA duties on India ended February 24, 2026.",
        "Wheat flour (atta) or chickpea flour from India pays the base rate plus 10% of value.",
    ),
    "cl": (
        "The Chile FTA (SPI CL) makes every Chapter 11 base rate Free, but the 12.5% Section 301 duty still applies (U.S. note "
        "52(a)). " + EXEMPT5,
        "Chilean starches and oat products pay 12.5% of value with an FTA claim.",
    ),
    "gb": (
        "The UK exception list (9903.05.96) covers medical goods only, no Chapter 11 line. " + EXEMPT5,
        "British malt (1107, $17M in 2025) pays 0.3¢/kg plus 10% of value.",
    ),
    "tr": (
        EXEMPT5 + " The IEEPA reciprocal tariff ended February 24, 2026.",
        "Starches and rolled grains from Türkiye pay the base rate plus 12.5% of value.",
    ),
    "cn": (
        "Two Section 301 duties stack: +25% under List 3 (9903.88.03), which covers every Chapter 11 subheading and has been in "
        "force since 2018 (25% since May 10, 2019), and +12.5% under the 2026 action (9903.05.31). The five lines on the U.S. note "
        "52(b) exemption list pay only the 25% List 3 duty. USTR confirmed on October 7, 2026 that the List 3 action continues. "
        "The IEEPA duties on China ended February 24, 2026.",
        "Wheat gluten from China pays 6.8% + 37.5% = 44.3%, and is also on FDA Import Alert 99-29 (melamine); tapioca starch from "
        "China pays 25%.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 "
        "(9903.05.27). The same five root-flour and starch lines are on both exemption lists (U.S. note 50(a)(ii), 9903.05.03, and "
        "note 52(b), 9903.05.86), so Brazilian cassava starch and flour pay nothing extra.",
        "Brazilian cassava starch stays duty-free; other Brazilian Chapter 11 goods pay the base rate plus 37.5%.",
    ),
    "other": (
        "Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate is lower; others pay "
        "+10% or +12.5% on top. " + EXEMPT5 + " The U.S. note 52(j) country exception lists name no Chapter 11 line. Countries "
        "outside the 60 economies pay only the base rate; Nicaragua's separate Section 301 duty is 0% in 2026.",
        "Wheat gluten from Kazakhstan (a Section 301 economy, 9903.05.51) pays 6.8% plus its Section 301 rate; a supplier outside the 60 economies pays only the base rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "other":
        e["country"] = "Other Section 301 economies (incl. Japan, South Korea, Switzerland, Taiwan, Vietnam, Indonesia, Lithuania and other EU, Poland)"
        e["now"] = "+10% or +12.5%"
    if key == "br":
        e["effectiveFrom"] = "2026-07-24"

for sid in ["eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "procl-11046", "procl-11047", "procl-11048",
            "procl-11062", "fr-2026-18838", "fr-2026-18839", "ustr-usmca-review", "eo-14194", "eo-14193", "eo-14325",
            "eo-14257", "eo-14360", "ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp"]:
    if not any(s["id"] == sid for s in tu["sources"]):
        tu["sources"].append(ref_src[sid])
for e in tu["inEffect"]:
    if e["id"].startswith(("ca-", "mx-", "eu-", "au-", "th-", "in-", "tr-", "cn-", "other-")) and "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")
    if e["id"].startswith(("th-", "in-")):
        e["sourceIds"].insert(-1, "cbp-gsp")
    if e["id"].startswith("ca-"):
        e["sourceIds"].insert(-1, "procl-11062")

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 11 base-rate changes",
        "detail": "49 of 51 Chapter 11 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
        "Edition. The other two are new statistical lines: rolled or flaked oats (1104.12.00) were split into certified organic "
        "(1104.12.00.10) and other (1104.12.00.90), both at the unchanged 1.2¢/kg.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 3 duties continue",
        "detail": "USTR received requests to continue the 2018 China Section 301 actions, so they did not terminate and stay in effect "
        "during the second four-year review. The 25% List 3 duty (9903.88.03) on every Chapter 11 subheading is unchanged.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-proclamation-2026", "type": "reference", "date": "2026-09-29", "dateLabel": "Effective",
        "title": "Canada Section 338 duties and import bans do not reach Chapter 11",
        "detail": "Proclamations of September 8, 2026 moved some Canadian alcoholic beverages, dairy products and motor vehicles from "
        "the 50% Section 338 duty to an import ban from September 29, 2026. Malt and every other Chapter 11 "
        "line are on none of the lists (U.S. note 51, 9903.03.12–9903.03.14).",
        "before": None, "now": None, "countries": "Canada",
        "sourceIds": ["procl-11062", "fr-2026-18838", "fr-2026-18839", "hts-now"],
    },
    {
        "id": "ca-338", "type": "reference", "date": "2026-08-22", "dateLabel": "Effective",
        "title": "Canada Section 338 duties take effect; Chapter 11 not covered",
        "detail": "50% duties on certain Canadian alcoholic beverages, dairy and motor vehicles (9903.03.12–9903.03.14) took effect "
        "after a 3-day suspension lapsed. No Chapter 11 line is on the lists in U.S. note 51.",
        "before": None, "now": None, "countries": "Canada",
        "sourceIds": ["procl-11046", "procl-11047", "procl-11048", "hts-now"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover Chapter 11",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). EU goods pay 10% in total and Japan, South "
        "Korea and Switzerland 12.5% in total when the base rate is lower. Five Chapter 11 lines are on the general exemption list "
        "(U.S. note 52(b), 9903.05.86): 1106.20.90, 1106.30.20, 1108.14.00 and 1108.19.00. USMCA-qualifying goods from Canada and "
        "Mexico are exempt (9903.05.93, 9903.05.94). FTA claims remove the base rate but not this duty.",
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
        "detail": "25% on all goods of Brazil (9903.05.01). Its exemption list (U.S. note 50(a)(ii), 9903.05.03) includes the same five "
        "root-flour and starch lines (1106.20.90, 1106.30.20, 1108.14.00, 1108.19.00). From July 24 the 12.5% forced-labor tariff "
        "(9903.05.27) is added on top for the other lines.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
        "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. Four Chapter 11 subheadings were on the product "
        "exemption list (9903.03.03): 1106.20.90, 1106.30.20, 1108.14.00 and 1108.19.00. USMCA-qualifying goods from Canada and "
        "Mexico were exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
        "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
        "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
        "printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
        "(SPI D) makes every dutiable Chapter 11 line Free for eligible sub-Saharan countries. GSP (SPI A, A*, A+), printed on most "
        "Chapter 11 lines, remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026",
        "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% "
        "in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 11 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ag-exemption", "type": "reference", "date": "2025-11-13", "dateLabel": "Effective",
        "title": "Reciprocal-tariff exemption for four root-flour and starch lines",
        "detail": "Executive Order 14360 widened the agricultural exemption from the reciprocal tariffs. Cassava and other root flours "
        "(1106.20.90), banana flour (1106.30.20), cassava starch (1108.14.00) and other starches (1108.19.00) are on the list in U.S. "
        "note 2(v)(iii)(a); the other Chapter 11 lines paid the reciprocal duties until they ended on February 24, 2026.",
        "before": None, "now": None, "countries": "All countries subject to the reciprocal tariff",
        "sourceIds": ["eo-14360", "hts-now"],
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
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
        "February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
]

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 11: Milling Products, Malt & Starches — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 11 Flour, Malt & Starch Import Statistics by Country & Product | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of flour, oats, malt, starches and wheat gluten 2020–2025, by country, product and year. $2.34B in 2025, down "
    "12.8% from 2024; Canada supplied 40%."
)
ui["seo"]["keywords"] = [
    "flour imports by country",
    "US malt imports",
    "wheat gluten imports Australia",
    "starch imports United States",
    "HTS Chapter 11 import statistics",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet"
ui["why"] = (
    "U.S. imports of Chapter 11 goods fell from **$2.69B in 2024 to $2.34B in 2025** (-12.8%), after peaking at $2.92B in 2022. "
    "The drop was broad: rolled and worked oats and other grains (heading 1104) fell from $439M to $341M, wheat gluten from $369M "
    "to $286M, malt from $308M to $265M and potato flakes and flour from $105M to $73M. Starches and inulin, the largest heading, "
    "edged up to $516M.\n\n"
    "Canada is the anchor supplier — **$940M, 40% of the total** — shipping rolled oats, malt, wheat flour, semolina and oat "
    "groats. Mexico ($273M) sends mostly corn flour. The rest is specialised: native starches from Thailand (cassava), Germany, "
    "Denmark, Belgium and the Netherlands; wheat gluten from Australia ($142M), Germany and Lithuania; Italian wheat flour; and "
    "German and British specialty malt.\n\n"
    "Through 2025 USMCA-qualifying goods from Canada and Mexico paid no extra duty, while most other suppliers paid the IEEPA "
    "reciprocal tariff from April 2025 — 10% or more on top of small base rates. Those duties ended on February 24, 2026; since "
    "July 24, 2026 a Section 301 tariff of 10% or 12.5% applies instead. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["seo"]["title"] = "HTS Chapter 11 Flour, Malt & Starch Tariff Rates by Country — Canada, Mexico, EU, Australia, China | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on flour, oats, malt, starches and wheat gluten by country and product group: base rate plus the 2026 "
    "Section 301 duty, with USMCA, EU and FTA rules applied. Canada, Mexico, Germany, Australia, Thailand, Italy, India, China and more."
)
ia["seo"]["keywords"] = [
    "malt tariff Canada",
    "Italian flour tariff",
    "wheat gluten tariff Australia",
    "tapioca starch tariff Thailand",
    "flour tariff by country",
    "EU 10% tariff flour",
]
ia["intro"] = (
    "The total rate on flour, malt and starch depends far more on **where it comes from** than on what it is. Each cell below is "
    "the base rate for that product group plus the extra duty for that country, minus any preference — computed from the "
    "current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started "
    "July 24, 2026. **USMCA-qualifying goods from Canada and Mexico enter free**, **EU goods pay 10%** in place of the base rate, "
    "Australia and Chile keep their FTA's Free base rate but add 12.5%, and **China pays 37.5%** on top. Cassava starch, other "
    "starches and root and banana flours are exempt from the 2026 action for every listed country except China."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULE_LABELS = {
    "Canada": "USMCA-qualifying: Free, no extra duty (9903.05.93). Otherwise the base rate plus 10% Section 301 (9903.05.29) on 46 of 51 lines; the 5 root-flour and starch lines on the note 52(b) list pay only the base rate. The 35% IEEPA duty ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55) on 46 of 51 lines; the 5 root-flour and starch lines on the note 52(b) list pay only the base rate. The 25% IEEPA duty ended February 24, 2026.",
    "EU": "10% in total in place of the base rate when the base rate is under 10% (9903.05.39), on 46 of 51 lines; mixed flours (12.8%) pay only their base rate, and the 5 note 52(b) lines pay their base rate (Free or 2.8%).",
    "Australia": "Base rate Free under the Australia FTA (AU), plus 12.5% Section 301 (9903.05.23) on 46 of 51 lines; the 5 note 52(b) lines are Free.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on 46 of 51 lines; tapioca starch and the other note 52(b) lines pay only the base rate. GSP has expired.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on 46 of 51 lines; the 5 note 52(b) lines pay only the base rate. GSP has expired.",
    "Chile": "Base rate Free under the Chile FTA (CL), plus 12.5% Section 301 (9903.05.30) on 46 of 51 lines; the 5 note 52(b) lines are Free.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on 46 of 51 lines; the 5 note 52(b) lines pay only the base rate.",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on 46 of 51 lines; the 5 note 52(b) lines pay only the base rate.",
    "China": "Base rate plus 25% List 3 (9903.88.03) on every line, plus 12.5% Section 301 (9903.05.31) on 46 of 51 lines — 37.5% in all; the 5 note 52(b) lines pay 25%.",
    "Any other country": "From no extra duty (countries outside the 60 Section 301 economies) up to 37.5% for Brazil (9903.05.01 + 9903.05.27); most others add 10% or 12.5% (9903.05.20–9903.05.84). The 5 note 52(b) lines are exempt for all of them.",
}
EU_MEMBERS = {"Germany", "Italy", "Netherlands", "Belgium", "Denmark"}
for c in ia["countries"]:
    key = "EU" if c["country"] in EU_MEMBERS else c["country"]
    c["rule"]["label"] = RULE_LABELS[key]
for b in ia["biggestLanes"]:
    pass
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU: 9903.05.39 sets a 10% total when the base rate, or its ad valorem equivalent, is under 10% (U.S. note 52(k)). Mixed "
    "cereal flours (1102.90.30, 12.8%) are above 10% and pay only their base rate.",
    "AGOA (SPI D) was reauthorized on February 3, 2026 through December 31, 2026; it would make the base rate Free for eligible "
    "sub-Saharan suppliers, none of which is in the matrix.",
    "Entry also needs FDA prior notice and a registered foreign facility for every food line; wheat gluten and other vegetable "
    "proteins from China are detained under FDA Import Alert 99-29 unless lab results clear them (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Four Chapter 11 subheadings — "
    "1106.20.90, 1106.30.20, 1108.14.00 and 1108.19.00 — are on the Section 301 general exemption list (note 52(b), 9903.05.86), "
    "the Brazil exemption list (note 50(a)(ii), 9903.05.03), the Section 122 exemption list (9903.03.03) and the reciprocal "
    "agricultural exemption (note 2(v)(iii)(a)). No Chapter 11 code is on note 52(c)–(e), the country lists in note 52(j), or the "
    "Canada Section 338 lists (note 51). Every Chapter 11 subheading is on China Section 301 List 3 (note 20(f)); the only China "
    "exclusion that named a Chapter 11 product (dried pomegranate powder, 1106.30.4000) has expired."
)
for sid in ["eo-14389", "csms-67834313", "procl-11012", "ustr-agoa-2026", "crs-agoa", "cbp-gsp"]:
    if not any(s["id"] == sid for s in ia["sources"]):
        ia["sources"].append(ref_src[sid])
for c in ia["countries"]:
    if c["country"] in ("Canada", "Mexico", "China", "Any other country") and "eo-14389" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].insert(-1, "eo-14389")
    if c["country"] in ("Thailand", "India"):
        c["rule"]["sourceIds"].insert(-1, "cbp-gsp")

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["seo"]["title"] = "Importing Flour, Malt & Starch: FDA Rules, Documents & Legal Ways to Lower Duty (HTS Ch. 11) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The FDA, USDA and CBP rules for each HTS Chapter 11 line — prior notice, facility registration, FSVP, flour standards of "
    "identity, organic import certificates, the melamine import alert — and the legal ways to pay less: USMCA, FTAs, the feed "
    "line for wheat gluten, unmixed flours, drawback."
)
te["seo"]["keywords"] = [
    "import flour FDA requirements",
    "FDA prior notice flour",
    "FSVP importer malt",
    "USMCA rule of origin flour",
    "wheat gluten animal feed duty",
    "NOP import certificate organic flour",
    "drawback malt beer export",
]
te["intro"] = (
    "Flour, malt and starch are food, so **FDA decides whether a shipment clears**: every line needs prior notice, a registered "
    "foreign facility and a U.S. importer that verifies its supplier, and flours sold under a standard name must meet their "
    "standard of identity. Wheat gluten from China is detained on arrival unless it is cleared for melamine.\n\n"
    "The ways to pay less are in the schedule and the customs rules: claim **USMCA** on Canadian and Mexican goods (milling "
    "or malting grain into a chapter 11 product qualifies), claim an **FTA** where the base rate is the cost, enter **wheat "
    "gluten for feed** under its 1.8% line, ship flours **unmixed**, and claim **drawback** when the product is exported. Each "
    "depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
HTS21 = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Canada or Mexico",
        "saves": "The Section 301 duty — 10% of value for Canada or Mexico — plus the base rate",
        "appliesTo": "All 51 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format (it can be on the invoice). "
        "The Chapter 11 rule of origin is a change from any other chapter: flour, malt, starch or gluten made in Canada or Mexico "
        "from grain, potatoes or roots of any origin qualifies; blending or repacking imported flour does not.",
        "caveat": "Claiming without a valid certification exposes the entry to the 10% Section 301 duty plus penalties. The USMCA "
        "was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS General Note 11(o), Chapter 11 rule", "url": "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes"},
            {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": HTS21},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: up to 9.6% (fruit and nut flours), 8.3% (pulse flours), 6.8% (wheat gluten) or 12.8% (mixed flours)",
        "appliesTo": "Every dutiable line for goods of Australia, Chile, Korea, Israel, Singapore, Colombia, Peru, Panama, CAFTA-DR, "
        "Morocco, Bahrain, Oman, Jordan, and AGOA countries (through December 31, 2026)",
        "document": "Proof of origin under the agreement and the SPI on the entry line (AU, CL, KR, …, D for AGOA).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)), and for Korea the 12.5% Section 301 rate "
        "replaces the base rate anyway. GSP (A, A*, A+) has been expired since December 31, 2020, so a GSP claim pays the general rate.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099"},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "gluten-feed",
        "title": "Enter wheat gluten for animal feed under 1109.00.10",
        "saves": "5 points of base rate: 1.8% instead of 6.8% — $2,250 on a $45,000 container",
        "appliesTo": "Wheat gluten that will be used as animal feed (1109.00.10.00)",
        "document": "This is an actual-use line: the use must be intended at import, the gluten must be used as feed, and proof "
        "of use (a certificate from the end user describing the use) must be filed within 3 years of entry.",
        "caveat": "If proof of use is not filed, CBP liquidates at the 6.8% food rate. Any Section 301 duty for the country still applies.",
        "citations": [
            {"label": "19 CFR 10.133", "url": "https://www.ecfr.gov/current/title-19/section-10.133"},
            {"label": "19 CFR 10.138", "url": "https://www.ecfr.gov/current/title-19/section-10.138"},
        ],
    },
    {
        "id": "unmixed",
        "title": "Import flours and meals separately rather than pre-mixed",
        "saves": "A blend of products of headings 1101–1104 is 12.8% (Additional U.S. Note 1), against 0.7¢/kg for wheat flour, "
        "0.3¢/kg for corn flour or 1.2¢/kg for rolled oats on their own",
        "appliesTo": "Mixed cereal flours, groats and flakes (1102.90.30 and other mixtures of headings 1101–1104)",
        "document": "Commercial invoices and product specifications that show each flour as a separate product; blend in the "
        "United States.",
        "caveat": "Prepared mixes with leavening, sugar or fat are heading 1901, not chapter 11. The EU 10% total applies either way "
        "for EU goods under 10% base.",
        "citations": [
            {"label": "HTSUS Ch. 11, Additional U.S. Note 1", "url": "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2011"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the product, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid on imported malt, flour or starch used to make goods that are exported (for example "
        "malt brewed into exported beer)",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Drawback needs set-up (a manufacturing ruling for manufacturing claims) and only refunds duties actually paid.",
        "citations": [
            {"label": "19 CFR part 190", "url": "https://www.ecfr.gov/current/title-19/part-190"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty: a ruling fixes the classification (flour vs. meal, native vs. modified starch, chapter 11 vs. 1901) before "
        "the goods arrive",
        "appliesTo": "Any line where the classification decides the rate",
        "document": "A ruling request to CBP describing the product, its composition and the milling or sieve data.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [{"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"}],
    },
]
te["rules"] = [
    {
        "id": "fda-prior-notice", "agency": "FDA",
        "title": "Prior notice of every food shipment, confirmed before arrival (at least 2 hours by road, 4 by rail or air, 8 by water)",
        "citations": [
            {"label": "21 CFR 1.279", "url": "https://www.ecfr.gov/current/title-21/section-1.279"},
            {"label": "21 CFR part 1, subpart I", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-I"},
        ],
    },
    {
        "id": "fda-registration", "agency": "FDA",
        "title": "The foreign mill, malt house or starch plant must be registered with FDA as a food facility",
        "citations": [{"label": "21 CFR part 1, subpart H", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-H"}],
    },
    {
        "id": "fda-fsvp", "agency": "FDA",
        "title": "Foreign Supplier Verification Program: the U.S. importer must assess hazards and verify each foreign supplier",
        "citations": [{"label": "21 CFR part 1, subpart L", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-L"}],
    },
    {
        "id": "fda-labeling", "agency": "FDA",
        "title": "Food labeling: name, ingredients, net quantity, nutrition facts and the wheat allergen declaration",
        "citations": [{"label": "21 CFR part 101", "url": "https://www.ecfr.gov/current/title-21/part-101"}],
    },
    {
        "id": "fda-soi", "agency": "FDA",
        "title": "Standards of identity: flour, enriched flour, whole wheat and durum flour, corn flour and meal, farina and semolina sold under those names must meet 21 CFR part 137",
        "citations": [
            {"label": "21 CFR part 137", "url": "https://www.ecfr.gov/current/title-21/part-137"},
            {"label": "21 CFR 137.165 (enriched flour)", "url": "https://www.ecfr.gov/current/title-21/section-137.165"},
            {"label": "21 CFR 137.320 (semolina)", "url": "https://www.ecfr.gov/current/title-21/section-137.320"},
        ],
    },
    {
        "id": "fda-ia-99-29", "agency": "FDA",
        "title": "China: wheat gluten and other vegetable proteins are detained without examination for melamine (Import Alert 99-29) unless the firm is on the green list or a LAAF-accredited lab clears the lot",
        "citations": [
            {"label": "FDA Import Alert 99-29 (published July 9, 2025)", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_267.html"},
            {"label": "21 CFR part 1, subpart R (LAAF)", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-R"},
        ],
    },
    {
        "id": "fda-animal-food", "agency": "FDA",
        "title": "Animal feed: wheat gluten and cereal pellets for feed fall under FDA's animal food rules (and FSVP for animal food)",
        "citations": [{"label": "21 CFR part 507", "url": "https://www.ecfr.gov/current/title-21/part-507"}],
    },
    {
        "id": "nop-organic", "agency": "USDA AMS",
        "title": "Certified organic lines: each shipment needs NOP Import Certificate data in ACE (required since March 19, 2024)",
        "citations": [
            {"label": "7 CFR 205.273", "url": "https://www.ecfr.gov/current/title-7/section-205.273"},
            {"label": "88 FR 3548 (Strengthening Organic Enforcement)", "url": "https://www.federalregister.gov/documents/2023/01/19/2023-00702/national-organic-program-nop-strengthening-organic-enforcement"},
        ],
    },
    {
        "id": "aphis-packaging", "agency": "USDA APHIS",
        "title": "Packaging: wood pallets and crates must be ISPM 15 treated and marked; used jute or burlap bags from khapra beetle countries are regulated",
        "citations": [
            {"label": "7 CFR 319.40-3", "url": "https://www.ecfr.gov/current/title-7/section-319.40-3"},
            {"label": "7 CFR 319.75-2", "url": "https://www.ecfr.gov/current/title-7/section-319.75-2"},
        ],
    },
]
SOI_LINES = ("1101.", "1102.20", "1103.11", "1103.13")
ORGANIC = {"1101.00.00.50", "1104.12.00.10", "1109.00.90.10"}
FEED = ("1109.00.10", "1103.20")
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    ids = ["fda-prior-notice", "fda-registration", "fda-fsvp", "fda-labeling"]
    if h in ("1101", "1102", "1103"):
        ids.append("fda-soi")
    if h in ("1101", "1104", "1109"):
        ids.append("nop-organic")
    if h == "1109":
        ids += ["fda-ia-99-29", "fda-animal-food"]
    if h == "1103":
        ids.append("fda-animal-food")
    ids.append("aphis-packaging")
    g["ruleIds"] = ids
    g["note"] = ENGINEERING_GROUP_NOTES[h]
for ln in te["lines"]:
    hts = ln["hts"]
    ids = ["fda-prior-notice", "fda-registration", "fda-fsvp", "fda-labeling"]
    if hts.startswith(SOI_LINES):
        ids.append("fda-soi")
    if hts.startswith("1109"):
        ids.append("fda-ia-99-29")
    if hts.startswith(FEED):
        ids.append("fda-animal-food")
    if hts in ORGANIC:
        ids.append("nop-organic")
    ids.append("aphis-packaging")
    ln["ruleIds"] = ids
    levers = ["usmca"]
    if ln.get("general") and ln["general"] != "Free":
        levers.append("fta")
    if hts.startswith("1109.00.90"):
        levers.append("gluten-feed")
    if hts.startswith(("1101", "1102", "1103", "1104")) and hts != "1102.90.30.00":
        levers.append("unmixed")
    levers += ["drawback", "ruling"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. FDA import alerts and agency "
    "requirements change; check them before each shipment."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["seo"]["title"] = "Flour, Malt & Starch Tariffs FAQ: HS Codes, Italian Flour, Canadian Oats, Tapioca Starch (HTS Ch. 11) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about Chapter 11 imports: HS codes for wheat flour, semolina, malt, corn, potato and tapioca "
    "starch, wheat gluten and rolled oats, and the tariff on Italian flour, Canadian oats and malt in 2026."
)
fc["seo"]["keywords"] = [
    "hs code for wheat flour",
    "semolina hs code",
    "hs code for malt",
    "hs code for corn starch",
    "hs code for tapioca starch",
    "hs code wheat gluten",
    "tariffs on italian flour",
    "tariffs on oats from canada",
    "inulin hs code",
    "hs code 1108",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing flour, oats, malt, starch and wheat gluten into the U.S. — HS "
    "codes, tariffs by country and entry requirements. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "USMCA-qualifying flour, oats, malt and starch from Canada and Mexico enter free — no base rate, no extra duty. Canada and Mexico supplied 52% of 2025 imports.",
    "The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: 10% in total for the EU, +10% or +12.5% for most other suppliers, 37.5% in all for China and Brazil.",
    "Cassava (tapioca) starch, other native starches and root and banana flours are exempt from the 2026 Section 301 duty for every country except China.",
    "FDA rules apply to every line: prior notice, a registered foreign facility, FSVP, and for Chinese wheat gluten the melamine import alert.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 11, 2026"
fc["faqs"] = [
    {
        "id": "hs-wheat-flour",
        "question": "What is the HS code for wheat flour?",
        "searchedAs": ["hs code for wheat flour", "hs code for whole wheat flour", "hs code for durum wheat flour", "tariff code for wheat flour", "wheat flour tariff code", "hs code of atta wheat flour"],
        "answer": "1101.00 (wheat or meslin flour). The U.S. splits it into 10-digit lines by wheat type: 1101.00.00.10 hard spring, .20 durum, .30 white winter, .50 certified organic and .60 other — whole wheat flour and atta included. Every line is 0.7¢/kg at the general rate and Free under USMCA and the FTAs. Semolina is not flour: it is 1103.11.00.20. Flour mixes with leavening or other ingredients are heading 1901.",
        "link": "",
    },
    {
        "id": "italian-flour",
        "question": "Is there a tariff on Italian flour?",
        "searchedAs": ["tariffs on italian flour", "tariff on italian flour", "flour imported from italy", "flour imported from europe"],
        "answer": "Yes: 10% of the flour's value since July 24, 2026. For EU goods whose base rate is under 10%, the Section 301 action charges 10% in place of the base rate (9903.05.39), and wheat flour's base rate is 0.7¢/kg. Before that, the 15% EU reciprocal rate applied until February 24, 2026, then the 10% Section 122 surcharge until July 23, 2026. The U.S. imported $50M of wheat flour from Italy in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "semolina",
        "question": "What is the HS code for semolina?",
        "searchedAs": ["semolina hs code", "durum semolina hs code", "wheat semolina hs code", "semolina flour hs code", "corn semolina hs code"],
        "answer": "Wheat semolina is 1103.11.00.20 (0.5¢/kg); other wheat groats and meal, such as farina, are 1103.11.00.40. Corn semolina, grits and cornmeal are 1103.13 (0.3¢/kg). Semolina sold under that name must meet FDA's standard of identity (21 CFR 137.320).",
        "link": "",
    },
    {
        "id": "malt",
        "question": "What is the HS code and tariff for malt?",
        "searchedAs": ["hs code for malt", "hs code for malt extract", "malt drink hs code"],
        "answer": "Malt is heading 1107: 1107.10.00.00 for unroasted (base) malt at 0.3¢/kg and 1107.20.00.00 for roasted malt at 0.42¢/kg. Malt extract is 1901.90 and malt drinks are chapter 22, not here. Canada supplied $193M of the $265M of malt imported in 2025; USMCA-qualifying Canadian malt is Free with no extra duty, and the 2026 Canada Section 338 measures on alcoholic beverages do not cover malt. German malt pays 10% in total, British malt 0.3¢/kg plus 10%.",
        "link": "industry-areas",
    },
    {
        "id": "canada-oats",
        "question": "Are there tariffs on oats, flour and malt from Canada?",
        "searchedAs": ["tariffs on oats from canada", "tariffs on canadian oats", "tariffs on oats", "are there tariffs on imports from canada"],
        "answer": "Not on goods that qualify for USMCA, which most Canadian milling products do — milling or malting grain into a chapter 11 product meets the rule of origin. USMCA-qualifying goods pay no base rate and are exempt from the 10% Section 301 duty on Canadian products (9903.05.93). Goods that don't qualify pay the base rate (1.2¢/kg for rolled oats) plus 10% (9903.05.29). The 35% IEEPA duty ended February 24, 2026. Canada shipped $302M of rolled and worked grains, mostly oats, in 2025. Whole oats are chapter 10, not here.",
        "link": "industry-areas",
    },
    {
        "id": "corn-starch",
        "question": "What is the HS code for corn starch?",
        "searchedAs": ["hs code for corn starch", "hs code for maize starch", "corn starch powder h.s.code", "native corn starch hs code", "modified corn starch hs code"],
        "answer": "Native corn (maize) starch is 1108.12.00 — .10 for food use and .90 for other uses — at 0.54¢/kg. Modified corn starch, dextrins and starch glues are heading 3505 in chapter 35, not chapter 11. Corn flour is 1102.20 and cornmeal 1103.13.",
        "link": "",
    },
    {
        "id": "tapioca-starch",
        "question": "What is the HS code and tariff for tapioca (cassava) starch?",
        "searchedAs": ["hs code for tapioca starch", "hs code for cassava starch", "tapioca starch tariff code", "hs code native tapioca starch", "hs code for modified tapioca starch"],
        "answer": "Native tapioca (cassava) starch is 1108.14.00.00, Free at the general rate. It is on the Section 301 general exemption list (9903.05.86), so suppliers such as Thailand, Vietnam, Indonesia and Brazil pay no extra duty; China still pays the 25% List 3 duty. Cassava flour is 1106.20.90 (also Free and exempt). Modified tapioca starch is heading 3505. The U.S. imported $102M of cassava starch in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "potato-starch",
        "question": "What is the HS code for potato starch and potato flakes?",
        "searchedAs": ["hs code for potato starch", "potato starch tariff code", "potato flakes hs code", "dehydrated potato flakes hs code", "hs code for potato flour"],
        "answer": "Potato starch is 1108.13.00 (.10 for human consumption, .90 other), at 0.56¢/kg; $169M was imported in 2025. Potato flour is 1105.10.00.00 (1.7¢/kg) and dehydrated potato flakes and granules 1105.20.00.00 (1.3¢/kg). From EU suppliers such as Germany, Denmark and the Netherlands all three pay 10% in total.",
        "link": "",
    },
    {
        "id": "wheat-gluten",
        "question": "What is the HS code and tariff for vital wheat gluten?",
        "searchedAs": ["hs code wheat gluten", "hs code vital wheat gluten"],
        "answer": "Heading 1109: 1109.00.90 for food and other uses (6.8%) and 1109.00.10 for gluten to be used as animal feed (1.8%, with proof of use within 3 years). Australia is the largest supplier ($142M of $286M in 2025): its FTA makes the base rate Free, but the 12.5% Section 301 duty applies. EU gluten pays 10% in total. Gluten from China pays 6.8% + 37.5% and is detained under FDA Import Alert 99-29 unless lab results clear it of melamine.",
        "link": "tariff-engineering",
    },
    {
        "id": "rice-corn-flour",
        "question": "What are the HS codes for rice flour and corn flour?",
        "searchedAs": ["rice flour hs code", "glutinous rice flour hs code", "brown rice flour hs code", "corn flour hs code", "maize flour hs code", "hs code for cornmeal"],
        "answer": "Rice flour is 1102.90.25.00 (0.09¢/kg) and corn flour 1102.20.00.00 (0.3¢/kg); cornmeal is 1103.13.00.20 (0.3¢/kg). Mexico is the largest supplier of non-wheat flours ($185M in 2025), and USMCA-qualifying Mexican corn flour enters free. Oat, barley and sorghum flours fall in the residual line 1102.90.60 at 9%.",
        "link": "",
    },
    {
        "id": "rolled-oats",
        "question": "What is the HS code for rolled oats?",
        "searchedAs": ["rolled oats hs code", "oats hs code", "hsn code for oats", "oat flour hs code"],
        "answer": "Rolled or flaked oats are 1104.12.00 at 1.2¢/kg, split into 1104.12.00.10 (certified organic) and 1104.12.00.90 (other). Hulled, cut or otherwise worked oats are 1104.22.00.00 (0.5%) and oat groats and meal 1103.19.12.00 (0.8¢/kg). Whole oats are 1004 in chapter 10. Organic shipments need NOP Import Certificate data in ACE.",
        "link": "",
    },
    {
        "id": "inulin",
        "question": "What is the HS code for inulin?",
        "searchedAs": ["inulin hs code", "inulin hts code", "inulin powder hs code", "agave inulin hs code"],
        "answer": "1108.20.00.00, at 2.6% general (Free under USMCA and the FTAs). The U.S. imported $94M of inulin in 2025. EU inulin pays 10% in total under the 2026 Section 301 action; inulin from other Section 301 economies pays 2.6% plus 10% or 12.5%.",
        "link": "",
    },
    {
        "id": "hs-1108",
        "question": "What does HS code 1108 cover?",
        "searchedAs": ["hs code 1108", "hs code 1108.14", "1108.12 hs code", "hs code 1108.19", "hs code 1108.20"],
        "answer": "Native starches and inulin: 1108.11 wheat starch (0.54¢/kg), 1108.12 corn starch (0.54¢/kg), 1108.13 potato starch (0.56¢/kg), 1108.14 cassava starch (Free), 1108.19 other starches such as rice starch (Free) and 1108.20 inulin (2.6%). Starches and inulin were the largest Chapter 11 import group in 2025, $516M.",
        "link": "",
    },
    {
        "id": "us-imports",
        "question": "How much flour, malt and starch does the U.S. import?",
        "searchedAs": ["flour import", "flour imported from germany"],
        "answer": "$2.34B of Chapter 11 goods in 2025, down 12.8% from $2.69B in 2024. Starches and inulin ($516M), rolled and worked grains ($341M), wheat flour ($305M), wheat gluten ($286M) and malt ($265M) were the largest groups. Canada supplied 40%, Mexico 12% and Germany 7.5%.",
        "link": "understand-industry",
    },
]

for src in tu["sources"]:
    if src["id"] == "hts-now-cr":
        src["published"] = "2026-10-09"
json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
