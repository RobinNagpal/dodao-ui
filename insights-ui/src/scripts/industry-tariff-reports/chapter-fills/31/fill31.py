"""Fill the writer TODOs of the generated Chapter 31 content file.

usage: python3 fill31.py <generated.json> <out.json>
"""
import json
import sys

sys.path.insert(0, __import__("os").path.dirname(__file__))
from fill31_static import EXTRA_SOURCES, CH31, CH99, HTS_NOW  # noqa: E402
from fill31_trade import apply_trade  # noqa: E402

ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = "Fertilizers"

# ---------------------------------------------------------------- overview (non-trade parts)
o = d["overview"]
o["h1"] = "HTS Chapter 31: Fertilizers — Tariff Rates"
o["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover: (a) animal blood of heading 0511; (b) separate chemically defined compounds "
        "(other than those answering to the descriptions in note 2(a), 3(a), 4(a) or 5); or (c) cultured potassium chloride crystals "
        "(other than optical elements) weighing not less than 2.5 g each, of heading 3824; optical elements of potassium chloride (heading 9001).\n\n"
        "**Note 2.** Heading 3102 applies only to the following goods, provided that they are not put up in the forms or packages described in heading 3105: "
        "(a) sodium nitrate; ammonium nitrate; double salts of ammonium sulfate and ammonium nitrate; ammonium sulfate; double salts or mixtures of calcium nitrate "
        "and ammonium nitrate; double salts or mixtures of calcium nitrate and magnesium nitrate; calcium cyanamide; urea — whether or not pure; "
        "(b) fertilizers consisting of any of these goods mixed together; (c) fertilizers consisting of ammonium chloride or of any of the goods in (a) or (b) "
        "mixed with chalk, gypsum or other inorganic nonfertilizing substances; (d) liquid fertilizers consisting of ammonium nitrate or urea, or mixtures of them, "
        "in an aqueous or ammoniacal solution.\n\n"
        "**Note 3.** Heading 3103 applies only to the following goods, provided that they are not put up in the forms or packages described in heading 3105: "
        "(a) basic slag; natural phosphates of heading 2510, calcined or further heat-treated than for the removal of impurities; superphosphates (single, double "
        "or triple); calcium hydrogenorthophosphate containing not less than 0.2% by weight of fluorine calculated on the dry anhydrous product; (b) fertilizers "
        "consisting of any of these goods mixed together, with no account taken of the fluorine content limit; (c) fertilizers consisting of any of the goods in (a) "
        "or (b), with no account taken of the fluorine limit, mixed with chalk, gypsum or other inorganic nonfertilizing substances.\n\n"
        "**Note 4.** Heading 3104 applies only to the following goods, provided that they are not put up in the forms or packages described in heading 3105: "
        "(a) crude natural potassium salts (for example, carnallite, kainite and sylvite); potassium chloride, whether or not pure, except as provided in note 1(c); "
        "potassium sulfate, whether or not pure; magnesium potassium sulfate, whether or not pure; (b) fertilizers consisting of any of these goods mixed together.\n\n"
        "**Note 5.** Ammonium dihydrogenorthophosphate (monoammonium phosphate) and diammonium hydrogenorthophosphate (diammonium phosphate), whether or not pure, "
        "and intermediates thereof, are to be classified in heading 3105.\n\n"
        "**Note 6.** For the purposes of heading 3105, the term \"other fertilizers\" applies only to products of a kind used as fertilizers and containing, as an "
        "essential constituent, at least one of the fertilizing elements nitrogen, phosphorus or potassium."
    ),
    "additionalUsNotes": None,
}

GROUPS = {
    "3101": dict(
        label="Animal & vegetable fertilizers",
        short="Organic",
        blurb="Manure, guano, bone-, blood- and fish-based fertilizers and compost-type mixtures: one line, Free. USDA APHIS rules decide whether animal-origin material can enter at all (9 CFR part 95).",
        examples=["manure", "guano", "bone meal", "blood meal", "compost", "organic fertilizer"],
    ),
    "3102": dict(
        label="Nitrogen fertilizers",
        short="Nitrogen",
        blurb="Urea (including diesel exhaust fluid), ammonium sulfate, ammonium nitrate, sodium nitrate, calcium ammonium nitrate and UAN solutions: 11 lines, all Free. Ammonium sulfate from China is under antidumping and countervailing duty orders.",
        examples=["urea", "UAN", "ammonium nitrate", "ammonium sulfate", "DEF", "calcium ammonium nitrate"],
    ),
    "3103": dict(
        label="Phosphate fertilizers",
        short="Phosphate",
        blurb="Superphosphates (triple superphosphate is 3103.11) and other phosphatic fertilizers: 3 lines, all Free. Superphosphates from Morocco and Russia are under countervailing duty orders.",
        examples=["triple superphosphate", "TSP", "single superphosphate", "basic slag"],
    ),
    "3104": dict(
        label="Potash fertilizers",
        short="Potash",
        blurb="Potassium chloride (muriate of potash), potassium sulfate and other potassic fertilizers: 4 lines, all Free. Most of it comes from Canada.",
        examples=["potash", "potassium chloride", "muriate of potash", "MOP", "potassium sulfate", "SOP"],
    ),
    "3105": dict(
        label="Mixed fertilizers (NPK, DAP, MAP)",
        short="Mixed / DAP / MAP",
        blurb="NPK blends, diammonium phosphate (DAP), monoammonium phosphate (MAP), nitrophosphates and fertilizers in small packages (up to 10 kg): 10 lines, all Free. DAP, MAP and other phosphate blends from Morocco and Russia are under countervailing duty orders.",
        examples=["DAP", "MAP", "NPK", "diammonium phosphate", "monoammonium phosphate", "potassium nitrate"],
    ),
}
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["blurb"] = G["blurb"]
    g["searchExamples"] = G["examples"]

for st in o["stats"]:
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = "China only: Section 301 List 3, +25%"

o["workedExamples"] = [
    {
        "title": "1,500 t of potash from Saskatchewan",
        "line": "3104.20.00.10",
        "body": "Potassium chloride is **Free** under the general rate, and U.S. note 52(b) to Chapter 99 exempts 3104.20.00 from the 10% Section 301 duty on Canadian goods (9903.05.29), so the duty is **$0** whether or not a USMCA claim is made. In 2025 that was different: non-USMCA potash paid a 10% IEEPA duty until those duties ended on February 24, 2026.",
    },
    {
        "title": "1,000 t of granular urea from China",
        "line": "3102.10.00.10",
        "body": "Urea is Free under the general rate, but every Chapter 31 subheading is on China Section 301 **List 3**, so China-origin urea pays **+25%** (9903.88.03). On a $400,000 shipment that is **$100,000**. The 12.5% 2026 Section 301 duty on China (9903.05.31) does not apply, because 3102.10.00 is on the note 52(b) exemption list.",
    },
    {
        "title": "DAP from Morocco",
        "line": "3105.30.00.00",
        "body": "The tariff is **$0**: DAP is Free and on the note 52(b) list, so Morocco's 12.5% Section 301 duty (9903.05.56) does not apply. But DAP is inside the scope of the **countervailing duty order** on phosphate fertilizers from Morocco (86 FR 18037): the importer posts a cash deposit at the producer's rate — 16.60% for OCP S.A. (89 FR 104979) — unless Commerce approves duty-free entry under the 2026 Section 318 emergency (19 CFR 358.103, 91 FR 42180). The tariff calculator does not include AD/CVD.",
    },
]

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 31: Fertilizers — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 31 Fertilizer Tariff Updates — Potash, Urea, Phosphate Since 2025 | KoalaGains",
    "shortDescription": "What changed for fertilizer imports since January 2025: the 2025 IEEPA duties on Canada, Mexico and others and when fertilizers were exempted, the 2026 Section 301 exemption, China's 25% List 3 duty and the phosphate countervailing duties on Morocco and Russia, with Federal Register citations.",
    "keywords": [
        "fertilizer tariffs 2026",
        "potash tariffs canada",
        "trump fertilizer tariffs",
        "fertilizer tariff exemption",
        "morocco phosphate countervailing duty",
        "russian fertilizer tariffs",
        "USMCA potash tariff",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). All 29 Chapter 31 lines are **Free** in both — the base rates did not change.\n\n"
    "What changed were the extra duties. In 2025, non-USMCA fertilizers from Canada and Mexico paid IEEPA duties (potash 10%), and the April 2025 "
    "reciprocal tariff hit most fertilizers from other countries; only potash and three mixed-fertilizer lines were exempt until "
    "**November 13, 2025**, when every Chapter 31 line was added to the exemption list. All IEEPA duties **ended on February 24, 2026**. "
    "Fertilizers were exempt from the Section 122 surcharge that followed, and they are on the exemption list (U.S. note 52(b)) of the "
    "**2026 Section 301 tariffs** on 60 economies. Today the only extra duty is the **25% China List 3** duty.\n\n"
    "Separately, **countervailing duties** apply to phosphate fertilizers from Morocco and Russia and to ammonium sulfate from China. They are "
    "set company by company by the Commerce Department, are listed below for reference, and are **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 31 from any country (China Section 301 List 3; the 2026 Section 301 and Brazil actions, whose exemption "
    "lists cover the chapter; the ended IEEPA and Section 122 duties), plus the antidumping and countervailing duty orders on fertilizers, which the "
    "tariff calculator does not model. For the rate each supplier pays, see Rates by country."
)
for x in tu["inEffect"]:
    if x["country"] == "China":
        x["measure"] = "Section 301 tariff, List 3 (2018–2019)"
        x["exemption"] = (
            "Every Chapter 31 subheading is on List 3 (U.S. note 20(f)); no product exclusion for the chapter is in effect. The 12.5% 2026 Section 301 duty "
            "on China (9903.05.31) does not apply, because all Chapter 31 subheadings are on the note 52(b) exemption list (9903.05.86). The IEEPA duties on "
            "China ended February 24, 2026. USTR confirmed on October 7, 2026 that the action continues during its four-year review. Ammonium sulfate "
            "(3102.21) from China also carries antidumping and countervailing duties, not shown here."
        )
        x["whatItMeans"] = "Fertilizer of Chinese origin pays 25% of its value; $400,000 of urea pays $100,000. Fertilizer from any other country pays no extra duty."
        if "fr-2026-15181" not in x["sourceIds"]:
            x["sourceIds"].append("fr-2026-15181")

for s in EXTRA_SOURCES:
    if s["id"] not in {x["id"] for x in tu["sources"]}:
        tu["sources"].append(s)

# Replace generator changes (keep base-rates entry) with the full log.
base = [c for c in tu["changes"] if c["type"] == "baseRate"]
pending_gen = [c for c in tu["changes"] if c["type"] == "pending"]
for c in base:
    c["detail"] = (
        "All 29 Chapter 31 tariff lines carry the same General (Free), Special and Column 2 (Free) rates in the 2026 Revision 21 as in the 2025 Basic Edition; "
        "no line was added, removed or renumbered."
    )


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = base + pending_gen + [
    ch("adcvd-phos-itc-schedule", "pending", "2026-10-09", "Published", "ITC schedules full five-year reviews of the phosphate orders",
       "The ITC will decide whether to keep the countervailing duty orders on phosphate fertilizers from Morocco and Russia after a hearing on April 1, 2027 (posthearing briefs due April 8, 2027). The orders stay in force until the reviews end.",
       None, None, "Morocco, Russia", ["fr-2026-20715"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their July 6 and August 23, 2026 anniversaries and remain in effect pending the statutory review. The 25% List 3 duty on Chinese fertilizers continues.",
       None, None, "China", ["fr-2026-20510"]),
    ch("s301-fl-exempt", "reference", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: fertilizers exempt",
       "The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect, but all 24 Chapter 31 subheadings are on the general exemption list in U.S. note 52(b) (9903.05.86). Fertilizers from Canada, Mexico, Morocco, Russia, Saudi Arabia, Trinidad and Tobago, the EU and the other 60 economies pay no Section 301 duty; only China still pays its older List 3 duty.",
       None, "Exempt", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("morocco-sunset-prelim", "reference", "2026-07-24", "Published", "Commerce: Moroccan phosphate subsidies likely to continue",
       "In the first full sunset review, Commerce preliminarily found that revoking the countervailing duty order on phosphate fertilizers from Morocco would likely lead to subsidies of 20.04% for OCP S.A. and all others. This is a sunset finding, not a new cash-deposit rate.",
       None, None, "Morocco", ["fr-2026-14971"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired (fertilizers were exempt)",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. Every Chapter 31 subheading was on its product exemption list (9903.03.03), so fertilizers never paid it.",
       None, None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301-exempt", "reference", "2026-07-22", "Effective", "Brazil Section 301 tariff: fertilizers exempt",
       "The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect; all Chapter 31 subheadings are on its exemption list (U.S. note 50(a)(ii), 9903.05.03).",
       None, "Exempt", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("morocco-318", "reference", "2026-07-08", "Effective", "Duty-free entry of Moroccan phosphate fertilizer can be requested",
       "Implementing Proclamation 11038, Commerce began accepting written requests to enter phosphate fertilizers from Morocco free of countervailing duties (19 CFR 358.103). Approved merchandise must enter within 60 days of Commerce's notice; the relief lasts until the earlier of 8 months after June 29, 2026 or the end of the emergency.",
       "CVD cash deposit", "CVD-free if Commerce approves the request", "Morocco", ["fr-2026-13796", "procl-11038"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("russia-sunset-final", "reference", "2026-06-30", "Published", "Commerce: Russian phosphate subsidies likely to continue",
       "In an expedited sunset review, Commerce found that revoking the countervailing duty order on phosphate fertilizers from Russia would likely lead to subsidies of 24.11% (EuroChem), 14.64% (JSC Apatit) and 16.64% (all others). The ITC's injury review is still under way.",
       None, None, "Russia", ["fr-2026-13106"]),
    ch("morocco-318-proclamation", "reference", "2026-06-29", "Signed", "Proclamation 11038: emergency relief from CVD on Moroccan phosphate",
       "The President declared an emergency over fertilizer supply and authorized Treasury and Commerce under section 318 of the Tariff Act to let phosphate fertilizers of Morocco enter free of countervailing duty collection and deposits for up to 8 months.",
       None, None, "Morocco", ["procl-11038"]),
    ch("itc-full-reviews", "reference", "2026-06-17", "Published", "ITC opts for full five-year reviews of the phosphate orders",
       "The ITC decided to conduct full, rather than expedited, five-year reviews of the countervailing duty orders on phosphate fertilizers from Morocco and Russia.",
       None, None, "Morocco, Russia", ["fr-2026-12207"]),
    ch("russia-ar-2023", "reference", "2026-04-17", "Published", "JSC Apatit countervailing duty rate set at 12.71%",
       "Final results of the 2023 administrative review of the order on phosphate fertilizers from Russia: 12.71% for JSC Apatit and its cross-owned PhosAgro companies. Commerce instructs CBP to collect cash deposits at this rate on later entries.",
       None, "12.71% (JSC Apatit)", "Russia", ["fr-2026-07503"]),
    ch("belarus-potash", "reference", "2026-03-26", "Published", "Treasury removes Belarusian potash producers from the sanctions list",
       "OFAC removed Belaruskali and the Belarusian Potash Company from the Specially Designated Nationals list and archived Belarus General License 13. This is a sanctions change, not a tariff change: potash is Free and Belarus is not one of the 60 Section 301 economies.",
       "Blocked (SDN)", "Not blocked", "Belarus", ["ofac-2026-03-26"]),
    ch("itc-institution", "reference", "2026-03-02", "Published", "Five-year (sunset) reviews of the phosphate orders begin",
       "The ITC instituted five-year reviews of the 2021 countervailing duty orders on phosphate fertilizers from Morocco and Russia.",
       None, None, "Morocco, Russia", ["fr-2026-04068"]),
    ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; fertilizers exempt",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. All Chapter 31 subheadings were on the product exemption list (9903.03.03).",
       None, "Exempt", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. For fertilizers this removed the duties still charged on non-USMCA goods of Canada (35%, potash 10%) and Mexico (25%, potash 10%) and on goods of China.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("ag-exemption", "extraDuty", "2025-11-13", "Effective", "All fertilizers exempted from the reciprocal tariff",
       "Executive Order 14360 added the rest of Chapter 31 — urea, ammonium nitrate and sulfate, UAN, superphosphates, DAP, MAP and other mixtures — to the reciprocal-tariff exemption list (U.S. note 2(v)(iii)(a), 9903.01.32). Until then only potash (3104.20, 3104.30, 3104.90) and three mixed lines (3105.10, 3105.20, 3105.60) were exempt.",
       "10% or more (most lines)", "Exempt", "All countries subject to the reciprocal tariff", ["eo-14360", "hts-chapter-99"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada additional duty raised to 35%; potash stays at 10%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10); the 10% rate for potash was left unchanged. Ended February 24, 2026.",
       "+25%", "+35% (potash +10%) (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff covers most fertilizers",
       "10% baseline (9903.01.25) and country rates (9903.02.xx) on products of all countries except Canada and Mexico, from April 5, 2025. Potash (3104.20, 3104.30, 3104.90) and three mixed-fertilizer lines (3105.10, 3105.20, 3105.60) were on the Annex II exemption list; other fertilizers paid until November 13, 2025. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("potash-10", "extraDuty", "2025-03-06", "Signed", "Potash duty on Canada and Mexico cut to 10%; USMCA goods exempt",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico, and non-USMCA potash paid 10% instead of 25%. Ended February 24, 2026.",
       "+25%", "+10% potash, USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including fertilizers. Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
    ch("ocp-rate", "reference", "2024-12-26", "Published", "OCP countervailing duty cash-deposit rate set at 16.60%",
       "Amended final results of the 2022 administrative review of the order on phosphate fertilizers from Morocco: 16.60% for OCP S.A. and its cross-owned Jorf companies, collected as a cash deposit on later entries. Commerce's January 12, 2026 notice confirmed this is still OCP's current cash-deposit rate.",
       None, "16.60% (OCP)", "Morocco", ["fr-2024-30693", "fr-2026-00385"]),
    ch("as-continued", "reference", "2023-04-05", "Published", "Ammonium sulfate orders on China continued",
       "After the five-year reviews, Commerce continued the 2017 antidumping and countervailing duty orders on ammonium sulfate from China (3102.21.00). The orders set a 493.46% China-wide antidumping rate and 206.72% countervailing rates.",
       None, None, "China", ["fr-2023-07042", "fr-2017-04753"]),
    ch("uan-negative", "reference", "2022-08-10", "Published", "No duties on UAN from Russia or Trinidad and Tobago",
       "The ITC found that U.S. industry was not injured by imports of urea ammonium nitrate solutions (3102.80.00) from Russia and Trinidad and Tobago, so no antidumping or countervailing duty orders were issued despite Commerce's affirmative findings.",
       None, None, "Russia, Trinidad and Tobago", ["fr-2022-17195"]),
    ch("phos-orders", "reference", "2021-04-07", "Published", "Countervailing duty orders on phosphate fertilizers from Morocco and Russia",
       "Commerce issued countervailing duty orders on phosphate fertilizers (MAP, DAP, superphosphates and NPK/NPS blends with at least 5% P2O5) from Morocco and Russia, classified mainly in 3103.11, 3103.19, 3105.20, 3105.30, 3105.40, 3105.51 and 3105.59.",
       None, None, "Morocco, Russia", ["fr-2021-07170"]),
]
for c in changes:
    c["id"] = c["id"].replace(" ", "")
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "29 of 29 lines", "note": "All Free"},
    {"label": "Extra duties in effect", "value": "1", "note": "China List 3, +25%"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]

# ---------------------------------------------------------------- industryAreas (non-trade parts)
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 31: Fertilizers — Tariff Rates by Country"
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["shortLabel"] = G["short"]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. All 24 Chapter 31 subheadings are on the Section 301 general "
    "exemption list (note 52(b), 9903.05.86) and the Brazil exemption list (note 50(a)(ii), 9903.05.03), and none is on the Canada Section 338 lists (note 51). "
    "All 24 are on China Section 301 List 3 (note 20(f)); no List 3 product exclusion for them is in effect. They were also on the exemption lists of the ended "
    "reciprocal tariff (note 2(v)(iii)(a), from November 13, 2025) and Section 122 surcharge (9903.03.03)."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "HTS Chapter 31: Fertilizers — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Fertilizer: Required Documents, AD/CVD Orders & Legal Ways to Lower Duty (HTS Ch. 31) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 31 fertilizer line — USDA APHIS for manure, bone and blood meal, EPA for fertilizer-pesticide mixes, TSCA certification, DOT for ammonium nitrate — the AD/CVD orders on phosphate and ammonium sulfate, and the legal ways to pay less.",
    "keywords": [
        "import fertilizer requirements",
        "APHIS bone meal import",
        "manure import permit",
        "phosphate fertilizer countervailing duty",
        "section 318 Morocco phosphate duty free",
        "ammonium sulfate antidumping China",
        "TSCA certification fertilizer",
    ],
}
te["intro"] = (
    "Every fertilizer line is **Free** under the general rate, so the usual tariff levers matter less here. What decides the cost is **origin**: "
    "Chinese fertilizer pays 25% under Section 301 List 3, and phosphate fertilizers from Morocco and Russia and ammonium sulfate from China carry "
    "**countervailing or antidumping duties** that the tariff calculator does not include.\n\n"
    "The paperwork depends on what the fertilizer is made of: animal-origin material (manure, bone meal, blood meal) falls under USDA APHIS, "
    "fertilizer mixed with a pesticide under EPA, chemical fertilizers need a TSCA certification, and ammonium nitrate is a hazardous material in transport. "
    "Each rule and lever below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "origin",
        "title": "Know the country of origin — only China pays an extra tariff",
        "saves": "25% of value: China-origin fertilizer pays Section 301 List 3 (9903.88.03); the same product from any other country pays no extra tariff",
        "appliesTo": "All 29 lines",
        "document": "Commercial invoice and production records showing where the fertilizer was produced. For blends, origin follows where the goods were last substantially transformed; ask CBP for a ruling when a Chinese input is mixed or granulated elsewhere.",
        "caveat": "Blending or bagging in a third country does not always change origin. AD/CVD orders follow their own scope and country rules, separate from the tariff origin.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20(f) (List 3)", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": "https://www.ecfr.gov/current/title-19/part-177"},
        ],
    },
    {
        "id": "morocco-318",
        "title": "Ask Commerce for CVD-free entry of Moroccan phosphate fertilizer",
        "saves": "The countervailing duty cash deposit on phosphate fertilizers from Morocco — 16.60% of value for OCP S.A.",
        "appliesTo": "Phosphate fertilizers of Morocco within the scope of order C-714-001 (MAP, DAP, TSP, NPK/NPS with at least 5% P2O5)",
        "document": "A written request filed in Commerce's ACCESS system on the 2026 administrative review segment (C-714-001) before importation, describing the shipment (19 CFR 358.103; Commerce notice of July 8, 2026).",
        "caveat": "Approved merchandise must enter within 60 days of Commerce's notice or the duties apply. The relief lasts until the earlier of 8 months after June 29, 2026 or the end of the emergency declared in Proclamation 11038.",
        "citations": [
            {"label": "19 CFR 358.103", "url": "https://www.ecfr.gov/current/title-19/section-358.103"},
            {"label": "Proclamation 11038 (91 FR 40855)", "url": "https://www.federalregister.gov/documents/2026/07/02/2026-13588/declaration-of-emergency-and-authorization-for-temporary-duty-free-importation-of-phosphate"},
            {"label": "Commerce notice (91 FR 42180)", "url": "https://www.federalregister.gov/documents/2026/07/08/2026-13796/countervailing-duty-order-of-phosphate-fertilizers-from-the-kingdom-of-morocco-temporary-duty-free"},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check the AD/CVD scope before you buy",
        "saves": "The whole countervailing or antidumping duty, when the product is outside the order",
        "appliesTo": "Phosphate fertilizers from Morocco and Russia; ammonium sulfate from China",
        "document": "The order's written scope (it, not the HTS number, decides). The phosphate orders exclude, for example, liquid ammonium polyphosphate, technical-grade white crystalline MAP (at least 60% P2O5) and DAP (at least 50% P2O5), and fertilizers with less than 5% available P2O5. When unsure, request a scope ruling from Commerce.",
        "caveat": "A product inside the scope pays the cash deposit even if entered under a different HTS line. Commingled blends are covered for their subject component.",
        "citations": [
            {"label": "86 FR 18037 (phosphate orders, scope)", "url": "https://www.federalregister.gov/documents/2021/04/07/2021-07170/phosphate-fertilizers-from-the-kingdom-of-morocco-and-the-russian-federation-countervailing-duty"},
            {"label": "82 FR 13094 (ammonium sulfate orders)", "url": "https://www.federalregister.gov/documents/2017/03/09/2017-04753/ammonium-sulfate-from-the-peoples-republic-of-china-antidumping-duty-and-countervailing-duty-orders"},
            {"label": "19 CFR 351.225 (scope rulings)", "url": "https://www.ecfr.gov/current/title-19/section-351.225"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when Chinese fertilizer is exported or used in exported goods",
        "saves": "Up to 99% of the 25% List 3 duty paid on China-origin fertilizer that is re-exported, unused or in an exported product",
        "appliesTo": "All 29 lines, for goods of China",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)).",
        "citations": [
            {"label": "19 CFR part 191", "url": "https://www.ecfr.gov/current/title-19/part-191"},
            {"label": "19 CFR 191.3", "url": "https://www.ecfr.gov/current/title-19/section-191.3"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA or an FTA anyway, and keep the certification",
        "saves": "Nothing on today's rates: every line is Free and note 52(b) exempts fertilizers from the 10% Section 301 duty on Canada and Mexico with or without a claim. In 2025 a USMCA claim saved the 25% IEEPA duty (10% for potash).",
        "appliesTo": "All 29 lines, for originating goods of Canada, Mexico or an FTA partner",
        "document": "A USMCA certification of origin from the importer, exporter or producer; it need not follow a prescribed format and CBP can ask for it.",
        "caveat": "An FTA claim does not remove the China List 3 duty or AD/CVD. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
]
te["rules"] = [
    {
        "id": "aphis-bone-meal",
        "agency": "USDA APHIS",
        "title": "Bone meal as fertilizer: only steamed or degelatinized bone meal (at least 250 °F under 20 lb steam pressure for an hour), free of bone pieces, hide and flesh",
        "citations": [{"label": "9 CFR 95.24", "url": "https://www.ecfr.gov/current/title-9/section-95.24"}],
    },
    {
        "id": "aphis-blood-meal",
        "agency": "USDA APHIS",
        "title": "Blood meal, tankage, meat meal and similar fertilizers: only from regions free of foot-and-mouth disease or fully processed, otherwise under APHIS handling and treatment conditions",
        "citations": [
            {"label": "9 CFR 95.25", "url": "https://www.ecfr.gov/current/title-9/section-95.25"},
            {"label": "9 CFR 95.27", "url": "https://www.ecfr.gov/current/title-9/section-95.27"},
        ],
    },
    {
        "id": "aphis-manure",
        "agency": "USDA APHIS",
        "title": "Manure of horses, cattle, sheep, other ruminants and swine: only with permission from APHIS Veterinary Services",
        "citations": [{"label": "9 CFR 95.31", "url": "https://www.ecfr.gov/current/title-9/section-95.31"}],
    },
    {
        "id": "aphis-bse",
        "agency": "USDA APHIS",
        "title": "Processed animal protein, tankage, offal and blood products from BSE regions: prohibited unless an exception applies",
        "citations": [{"label": "9 CFR 95.4", "url": "https://www.ecfr.gov/current/title-9/section-95.4"}],
    },
    {
        "id": "epa-pesticide",
        "agency": "EPA / CBP",
        "title": "Fertilizer mixed with a pesticide (weed-and-feed): file EPA's Notice of Arrival of Pesticides and Devices before the shipment arrives",
        "citations": [{"label": "19 CFR 12.112", "url": "https://www.ecfr.gov/current/title-19/section-12.112"}],
    },
    {
        "id": "tsca",
        "agency": "EPA / CBP",
        "title": "Chemical fertilizers: TSCA import certification (positive or negative) at entry",
        "citations": [{"label": "19 CFR 12.121", "url": "https://www.ecfr.gov/current/title-19/section-12.121"}],
    },
    {
        "id": "dot-hazmat",
        "agency": "U.S. DOT (PHMSA)",
        "title": "Ammonium nitrate and ammonium nitrate-based fertilizers: hazardous materials (oxidizers) for shipping papers, marking and packaging",
        "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": "https://www.ecfr.gov/current/title-49/section-172.101"}],
    },
    {
        "id": "cvd-phosphate",
        "agency": "Commerce (ITA) / CBP",
        "title": "Phosphate fertilizers from Morocco and Russia: countervailing duty cash deposit at the producer's rate (not in the tariff calculator)",
        "citations": [
            {"label": "86 FR 18037 (orders, April 7, 2021)", "url": "https://www.federalregister.gov/documents/2021/04/07/2021-07170/phosphate-fertilizers-from-the-kingdom-of-morocco-and-the-russian-federation-countervailing-duty"},
            {"label": "89 FR 104979 (OCP 16.60%)", "url": "https://www.federalregister.gov/documents/2024/12/26/2024-30693/phosphate-fertilizers-from-the-kingdom-of-morocco-notice-of-amended-final-results-of-countervailing"},
            {"label": "91 FR 20639 (JSC Apatit 12.71%)", "url": "https://www.federalregister.gov/documents/2026/04/17/2026-07503/phosphate-fertilizers-from-the-russian-federation-final-results-of-countervailing-duty"},
        ],
    },
    {
        "id": "adcvd-as",
        "agency": "Commerce (ITA) / CBP",
        "title": "Ammonium sulfate from China: antidumping (China-wide 493.46%) and countervailing duty orders (not in the tariff calculator)",
        "citations": [
            {"label": "82 FR 13094 (orders, March 9, 2017)", "url": "https://www.federalregister.gov/documents/2017/03/09/2017-04753/ammonium-sulfate-from-the-peoples-republic-of-china-antidumping-duty-and-countervailing-duty-orders"},
            {"label": "88 FR 20124 (continued, April 5, 2023)", "url": "https://www.federalregister.gov/documents/2023/04/05/2023-07042/ammonium-sulfate-from-the-peoples-republic-of-china-continuation-of-antidumping-and-countervailing"},
        ],
    },
]
PHOS_LINES = {"3103.11", "3103.19", "3105.20", "3105.30", "3105.40", "3105.51", "3105.59", "3103.90", "3105.10", "3105.60", "3105.90"}
GROUP_RULES = {
    "3101": (["aphis-bone-meal", "aphis-blood-meal", "aphis-manure", "aphis-bse", "epa-pesticide"],
             "Depends on what the fertilizer is made of: animal-origin material falls under 9 CFR part 95 (bone meal, blood meal and tankage, manure, BSE restrictions); purely plant-based fertilizers have no APHIS animal-product rule. Fertilizer containing a pesticide also needs the EPA Notice of Arrival."),
    "3102": (["tsca", "dot-hazmat", "adcvd-as"],
             "Ammonium nitrate and ammonium nitrate mixtures are hazardous materials in transport. Ammonium sulfate (3102.21) from China is under AD/CVD orders. UAN from Russia and Trinidad and Tobago is not: the ITC voted no injury in 2022."),
    "3103": (["tsca", "cvd-phosphate"],
             "Superphosphates from Morocco and Russia are under the 2021 countervailing duty orders; Moroccan entries can request CVD-free entry under Proclamation 11038 (19 CFR 358.103)."),
    "3104": (["tsca"], "No AD/CVD order covers potash. Belarusian potash producers were removed from the U.S. sanctions list on March 26, 2026."),
    "3105": (["tsca", "epa-pesticide", "cvd-phosphate", "dot-hazmat"],
             "DAP, MAP, NPK and NPS blends with at least 5% available P2O5 from Morocco and Russia are under the countervailing duty orders. Fertilizer-pesticide mixes need the EPA Notice of Arrival; blends containing ammonium nitrate follow DOT hazmat rules."),
}
for g in te["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]
AN_LINES = {"3102.30", "3102.40", "3102.60", "3102.80", "3105.51"}
for ln in te["lines"]:
    h = ln["heading"]
    sub = ln["hts"][:7]
    rules = list(GROUP_RULES[h][0])
    if h == "3102":
        rules = ["tsca"] + (["dot-hazmat"] if sub in AN_LINES else []) + (["adcvd-as"] if sub == "3102.21" else [])
    if h == "3105":
        rules = ["tsca", "epa-pesticide"] + (["cvd-phosphate"] if sub in PHOS_LINES else []) + (["dot-hazmat"] if sub in AN_LINES else [])
    if h == "3103":
        rules = ["tsca", "cvd-phosphate"]
    ln["ruleIds"] = rules
    levers = ["origin", "drawback", "usmca"]
    if "cvd-phosphate" in rules:
        levers = ["origin", "morocco-318", "adcvd-scope", "drawback", "usmca"]
    if "adcvd-as" in rules:
        levers = ["origin", "adcvd-scope", "drawback", "usmca"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. AD/CVD rates are company-specific and change with each "
    "administrative review; check Commerce's latest notice and CBP's cash-deposit instructions before importing."
)

apply_trade(d)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("ok")
