"""Fill the writer TODOs of the generated Chapter 78 (Lead and Articles Thereof) content file, in place.

usage: python3 fill78.py <chapter json>        (run.sh calls it after `pnpm tariff:generate-chapter`)

Facts come from: HTSUS 2026 Revision 21 (Chapter 78; General Note 16; Chapter 99 subchapter III notes 2, 16, 20, 29, 30, 50, 51, 52),
measures.json (the calculator's Chapter 99 data), the IEEPA / Section 122 / Section 301 / Section 338 documents in sources78.py and the
generator, Proclamations 10420, 10523 and 11001, the USGS final 2025 List of Critical Minerals, eCFR titles 19 and 40 (up to date as of
ECFR_AS_OF) and UN Comtrade.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources78 import CH78, CH85, CH99, NEW_BY_ID  # noqa: E402

PATH = sys.argv[1]
CHECKED = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
E19 = "https://www.ecfr.gov/current/title-19"
E40 = "https://www.ecfr.gov/current/title-40"
QSRC = "Google search suggestions (United States), collected October 13, 2026"

d = json.load(open(PATH))
d["asOf"] = CHECKED
d["chapter"]["title"] = "Lead and Articles Thereof"

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(leaf) == 13, len(leaf)

# ------------------------------------------------------------------ sources
tu = d["tariffUpdates"]
src = {s["id"]: s for s in tu["sources"]}
for s in NEW_BY_ID.values():
    src.setdefault(s["id"], s)
src["hts-chapter-99"]["url"] = CH99


def S(i):
    return src[i]


# ------------------------------------------------------------------ line sets (checked against note 20(f) and note 30(d))
LIST3 = sorted(h for h in LINE if not (h.startswith("7801.10") or h.startswith("7802")))
NOT_LISTED = sorted(set(LINE) - set(LIST3))
RU70 = sorted(h for h in LINE if h.startswith("7801.10") or h.startswith("7801.99.90"))
LEAD_CONTENT = sorted(h for h in LINE if h.startswith("7801"))
assert len(LIST3) == 10 and NOT_LISTED == ["7801.10.00.00", "7802.00.00.30", "7802.00.00.60"], NOT_LISTED
assert len(RU70) == 3 and len(LEAD_CONTENT) == 5
for h in LEAD_CONTENT:
    assert LINE[h]["effectiveGeneral"] == "2.5% on the value of the lead content", h

ia = d["industryAreas"]
# Cross-check against the engine: China List 3 (+25%) reaches exactly LIST3.
cn_row = next(c for c in ia["countries"] if c["country"] == "China")
eng_l3 = set()
for cell in cn_row["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if "9903.88.03" in b["extra"]:
            eng_l3.update(b["lines"])
assert eng_l3 == set(LIST3), sorted(set(LIST3) ^ eng_l3)

# ------------------------------------------------------------------ product groups
G = {
    "7801": ("Unwrought lead (refined, antimonial, bullion & alloys)", "Unwrought lead",
             "Unwrought lead: refined lead (pigs and ingots of at least 99.9% lead), antimonial lead, lead bullion and other lead and lead "
             "alloys: 5 lines, all **2.5% on the value of the lead content** (not on the full value), Free under USMCA and the FTAs. The "
             "importer declares the value of the lead content; extra duties are charged on the full customs value.",
             ["refined lead", "lead ingots", "lead pigs", "antimonial lead", "lead bullion", "lead alloy", "lead-calcium alloy"]),
    "7802": ("Lead waste & scrap", "Waste & scrap",
             "Lead waste and scrap, including scrap obtained from lead-acid storage batteries (7802.00.00.30) and other scrap such as cable "
             "sheathing and wheel weights (.60): Free base rate. Whole spent batteries are 8549.11, not Chapter 78.",
             ["lead scrap", "battery lead scrap", "lead plates and grids", "scrap wheel weights", "lead cable sheathing"]),
    "7804": ("Lead sheet, strip, foil & powders", "Sheet, foil & powder",
             "Lead plates, sheets, strip and foil (2.2% up to 0.2 mm thick, 3% thicker) and lead powders and flakes (Free): 3 lines.",
             ["lead sheet", "lead plate", "lead foil", "lead flashing", "lead roofing", "lead powder"]),
    "7806": ("Other articles of lead", "Other articles",
             "Lead bars, rods, profiles and wire (1.2%), lead tubes, pipes and fittings (2%) and other articles of lead (3%), such as "
             "weights, anodes and shielding: 3 lines.",
             ["lead wire", "lead rod", "lead pipe", "lead weights", "lead anodes", "lead shielding"]),
}
o = d["overview"]
for pg in o["productGroups"]:
    lab, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = lab, blurb, ex
for g in ia["groups"]:
    g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 78: Lead and Articles Thereof — 2026 Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 78 Lead Tariffs: Refined Lead, Lead Scrap & Lead Sheet HS Codes and Import Duties | KoalaGains",
    "shortDescription": (
        "Searchable U.S. duty table for all 13 HTS Chapter 78 lead lines: unwrought lead pays 2.5% on the value of its lead content, "
        "plus 10% to 12.5% Section 301 for most countries; USMCA lead from Canada and Mexico is Free; Section 232 does not apply."
    ),
    "keywords": [
        "HTS Chapter 78",
        "lead tariff",
        "tariff on lead",
        "lead and articles thereof tariff",
        "unwrought lead import duty",
        "lead tariff code",
        "hs code lead",
        "lead ingot hs code",
        "lead scrap hs code",
        "south korea tariff on lead",
        "usmca lead import rates",
    ],
}
o["intro"] = (
    "Chapter 78 covers lead: **unwrought lead** (refined lead ingots, antimonial lead, lead bullion and alloys, 7801), **lead waste and "
    "scrap** (7802), lead **sheet, strip, foil and powders** (7804) and **other articles of lead** such as wire, pipe and weights (7806). "
    "It has 13 tariff lines. Lead ores are Chapter 26, lead oxides Chapter 28, and lead-acid batteries and whole spent batteries Chapter 85.\n\n"
    "Base rates are low. All unwrought lead pays **2.5% on the value of the lead content**: the importer declares what the lead in the "
    "shipment is worth, and the 2.5% applies to that value only, not to silver or other metals in it. Scrap and powders are Free; sheet, "
    "foil and articles pay 1.2% to 3%. USMCA and the other FTAs make every line Free.\n\n"
    "Since July 24, 2026 the extra duty that matters is the **2026 Section 301 tariff**: 10% or 12.5% for 60 economies, charged on the "
    "full customs value. No Chapter 78 line is on its exemption list. USMCA goods of Canada and Mexico are exempt, and South Korea, Japan and "
    "the EU pay a flat 12.5% or 10% in place of the base rate. China pays 12.5% plus 25% (List 3) on 10 lines; Chinese refined lead and "
    "scrap are on no China list. **Section 232 does not reach lead**: the metals duties cover steel, aluminum and copper only. Canada's "
    "Section 338 duty applied to Canadian refined lead for three weeks (August 22 to September 14, 2026) and then ended. No antidumping or "
    "countervailing duty order covers Chapter 78 goods."
)
o["stats"] = [
    {"label": "Tariff lines", "value": "13"},
    {"label": "Lines with a base-rate duty", "value": "10 of 13", "note": "5 unwrought-lead lines charge 2.5% on the lead content only"},
    {"label": "2026 Section 301 (10% to 12.5%)", "value": "13 of 13", "note": "No exemption-list line; USMCA goods exempt"},
    {"label": "China Section 301 List 3 (25%)", "value": "10 of 13", "note": "Refined lead (7801.10) and scrap (7802) are not listed"},
    {"label": "Section 232", "value": "None", "note": "Lead is outside the steel, aluminum and copper programs"},
]
o["workedExamples"] = [
    {
        "title": "$10,000 of refined lead from Kazakhstan, $9,000 of it lead",
        "line": "7801.10.00.00",
        "body": "The base rate is **2.5% on the value of the lead content**, so the importer declares the lead's value: 2.5% × $9,000 = "
        "**$225**, not $250. Kazakhstan's 2026 Section 301 duty (9903.05.51, +12.5%) is charged on the full $10,000 customs value: "
        "**$1,250**. Total **$1,475**, about 14.8% of the value.",
    },
    {
        "title": "Refined lead from Canada with a USMCA certification",
        "line": "7801.10.00.00",
        "body": "USMCA makes the base rate **Free**, and heading 9903.05.93 removes Canada's 10% Section 301 duty for USMCA goods: **$0**. "
        "From August 22 to September 14, 2026, Canadian refined lead also paid Canada's **50% Section 338 duty** (9903.03.14), which a "
        "USMCA claim did not remove; Proclamation 11065 took refined lead off that list from September 15, 2026. Without a USMCA claim it "
        "now pays 2.5% of the lead content plus 10% of the value.",
    },
    {
        "title": "Refined lead from South Korea or Australia, $100,000",
        "line": "7801.10.00.00",
        "body": "**South Korea:** heading 9903.05.71 charges **12.5% in place of the base rate** when the base rate is lower, so the total "
        "is **$12,500** whether or not KORUS is claimed. **Australia:** the U.S.–Australia FTA (AU) makes the base rate Free, and the 2026 "
        "Section 301 duty adds **12.5%** (9903.05.23): also **$12,500**.",
    },
    {
        "title": "Battery lead scrap from Mexico",
        "line": "7802.00.00.30",
        "body": "Lead scrap is Free, but it is not on the 2026 Section 301 exemption list, so non-USMCA scrap from Mexico pays **+10%** "
        "(9903.05.55). With a USMCA claim (9903.05.94) it pays **nothing**. Whole spent lead-acid batteries are 8549.11.10, not this line, "
        "and their import needs EPA hazardous-waste paperwork.",
    },
    {
        "title": "Lead sheet from China",
        "line": "7804.19.00.00",
        "body": "3% base **+ 25%** Section 301 List 3 (9903.88.03) **+ 12.5%** 2026 Section 301 (9903.05.31) = **40.5%**: $40,500 on "
        "$100,000. Chinese refined lead (7801.10) is on no China list and pays only 2.5% of its lead content plus 12.5%.",
    },
    {
        "title": "Lead bullion containing silver, from Mexico without USMCA",
        "line": "7801.99.30.00",
        "body": "A $100,000 lot of bullion whose lead is worth $40,000 (the rest is silver and other metals) pays 2.5% × $40,000 = **$1,000** "
        "base duty, plus 10% Section 301 (9903.05.55) on the full $100,000 = **$10,000**. An assay that values the lead correctly keeps "
        "the base duty on the lead only.",
    },
]
for ex in o["workedExamples"]:
    assert ex["line"] in LINE, ex["line"]
o["notes"] = {
    "chapterNotes": (
        "Chapter 78 has no chapter notes of its own; Section XV's notes apply.\n\n"
        "**Subheading note 1.** *Refined lead* is metal containing by weight at least 99.9% lead, provided no other element exceeds its "
        "limit in the note's table (for example silver 0.02%, arsenic 0.005%, bismuth 0.05%, copper 0.08%, antimony 0.005%, tin 0.005%, "
        "zinc 0.002%; other elements 0.001% each)."
    ),
    "additionalUsNotes": (
        "Chapter 78 has no additional U.S. notes.\n\n"
        "**Statistical note 1.** *Alloys of lead* are metals in which the lead content is, by weight, less than 99% but not less than any "
        "other metallic element. Unwrought lead and scrap lines (7801.91, 7801.99, 7802) are reported in kilograms and in kilograms of lead "
        "content (Pb kg)."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu["h1"] = "HTS Chapter 78 Tariff Updates: Lead Tariffs 2025–2026"
tu["seo"] = {
    "title": "Lead Tariff Updates 2026: Section 301, USMCA, South Korea, China, Canada Section 338 (HTS Ch. 78) | KoalaGains",
    "shortDescription": (
        "Every change to U.S. tariffs on lead (HTS Chapter 78) since January 2025, with official sources: the 2026 Section 301 duties, "
        "the end of the IEEPA and Section 122 tariffs, Canada's three-week Section 338 duty on refined lead, China List 3 and Russia."
    ),
    "keywords": [
        "lead tariff update",
        "lead tariff 2026",
        "hts chapter 78 tariff updates",
        "lead import duty rates",
        "usmca lead tariff exemptions",
        "south korea tariff on lead",
        "section 301 lead",
        "unwrought lead customs duty",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current "
    "**2026 Revision 21** (in force October 9, 2026), and lists every extra duty that reaches Chapter 78 today. Base rates did not "
    "change: all 13 lines carry the same general rate in both editions, including **2.5% on the value of the lead content** for unwrought lead.\n\n"
    "The extra duties changed three times. In 2025 lead paid the IEEPA tariffs: the reciprocal tariff (lead was not on its exemption "
    "list) and the Canada, Mexico and China duties. They ended on **February 24, 2026**, and the 10% **Section 122** surcharge applied "
    "until July 23, 2026. Since **July 24, 2026** the **2026 Section 301** tariffs charge every Chapter 78 line at 10% or 12.5% for 60 "
    "economies, with USMCA goods exempt. **Section 232 does not cover lead**, and the Section 232 action on processed critical minerals "
    "(lead was added to the critical minerals list in November 2025) led to negotiations, not a tariff. Canada's **Section 338** duty "
    "reached Canadian refined lead from August 22 to September 14, 2026. China's 25% List 3 duty and Russia's 70% rate stack on top."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 78 from any country: the 2026 Section 301 actions on 60 economies and on Brazil (notes 50, 52), "
    "China Section 301 (note 20), Russia's rates in lieu of column 2 (note 30), Canada's Section 338 duty (note 51), the scheduled Nicaragua "
    "Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. Section 232 (notes 16, 33, 38 and others) covers no Chapter 78 "
    "line, and no antidumping or countervailing duty order covers Chapter 78 goods. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "13 of 13 lines"},
    {"label": "2026 Section 301", "value": "10% to 12.5%", "note": "All 13 lines; USMCA goods exempt"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
]

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
NO_EXEMPT = ("No Chapter 78 line is on the note 52(b) general exemption list or the note 52(j) country exception lists, and Section 232 "
             "does not reach lead, so the duty applies to all 13 lines, on the full customs value.")
IE = {
    "ca-section-301": ("Canada", NO_EXEMPT + " USMCA goods are exempt (9903.05.93). The IEEPA duty on Canada ended February 24, 2026; Canada's "
                       "Section 338 duty on refined lead (9903.03.14) applied August 22 to September 14, 2026 only.",
                       "Canadian lead with a USMCA certification enters Free; without one, refined lead pays 2.5% of its lead content plus 10%."),
    "mx-section-301": ("Mexico", NO_EXEMPT + " USMCA goods are exempt (9903.05.94). The IEEPA duty on Mexico ended February 24, 2026.",
                       "Mexican lead with a USMCA certification enters Free; without one, it pays the base rate plus 10%."),
    "au-section-301": ("Australia", NO_EXEMPT + " The U.S.–Australia FTA (AU) removes the base rate but not this duty.",
                       "Australian refined lead pays 12.5% of its value even with an FTA claim."),
    "kr-section-301": ("South Korea", NO_EXEMPT + " For Korea the rate is 12.5% in place of the base rate when the base rate is lower, so KORUS makes no difference.",
                       "Korean lead pays a flat 12.5% of its value: $12,500 on $100,000 of refined lead."),
    "gb-section-301": ("United Kingdom", NO_EXEMPT, "British refined lead pays 2.5% of its lead content plus 10% of its value."),
    "kz-section-301": ("Kazakhstan", NO_EXEMPT, "Kazakh refined lead pays 2.5% of its lead content plus 12.5% of its value."),
    "eu-section-301": ("European Union", NO_EXEMPT + " For the EU the rate is 10% in place of the base rate when the base rate is lower.",
                       "Lead from Germany and the rest of the EU pays a flat 10% of its value."),
    "za-section-301": ("South Africa", NO_EXEMPT + " AGOA (D) removes only the base rate.",
                       "South African refined lead pays 12.5% of its value with an AGOA claim."),
    "ng-section-301": ("Nigeria", NO_EXEMPT + " AGOA (D) removes only the base rate.",
                       "Nigerian refined lead pays 12.5% of its value with an AGOA claim."),
    "cn-section-301": ("China", "The 12.5% 2026 duty (9903.05.31) reaches all 13 lines. The 25% List 3 duty (9903.88.03, note 20(f)) reaches 10: "
                       "antimonial and other unwrought lead (7801.91, 7801.99), sheet, foil and powders (7804) and other articles (7806). Refined "
                       "lead (7801.10) and lead scrap (7802) are on no China list. No Chapter 78 line is in the 2024 increases (note 31). The IEEPA "
                       "duties on China ended February 24, 2026. USTR confirmed on October 7, 2026 that the 2018 actions continue during the four-year review.",
                       "Chinese lead sheet pays 40.5% (3% + 25% + 12.5%); Chinese refined lead 2.5% of its lead content plus 12.5%."),
    "in-section-301": ("India", NO_EXEMPT + " GSP has lapsed.", "Indian lead pays the base rate plus 10%."),
    "br-section-301": ("Brazil", "The 25% Brazil duty (9903.05.01) and the 12.5% 2026 duty (9903.05.27) both apply: no Chapter 78 line is on the note "
                       "50(a)(ii) or note 52(b) exemption lists.", "Brazilian lead pays the base rate plus 37.5%."),
    "jp-section-301": ("Japan", NO_EXEMPT + " For Japan the rate is 12.5% in place of the base rate when the base rate is lower.",
                       "Japanese lead pays a flat 12.5% of its value."),
    "vn-section-301": ("Vietnam", NO_EXEMPT, "Vietnamese lead pays the base rate plus 12.5%."),
    "ru-section-301": ("Russia", "Russia pays column 2 rates (10% to 45%) since April 9, 2022. Refined lead (7801.10) and other unwrought lead (7801.99.90) "
                       "pay 70% in place of column 2 (9903.90.09, note 30(d)): 35% from July 27, 2022 (Proclamation 10420), 70% from April 1, 2023 "
                       "(Proclamation 10523). The 12.5% 2026 Section 301 duty (9903.05.66) is added on every line.",
                       "Russian refined lead pays 82.5% of its value; Russian lead sheet 57.5%."),
    "other-section-301": (None, NO_EXEMPT + " The rate is 10% or 12.5% by country; for some (Switzerland 12.5%, Taiwan 10%) it is a flat rate in place of the base rate.",
                          "Lead from most other Section 301 economies pays the base rate plus 10% or 12.5%."),
}
for x in tu["inEffect"]:
    country, ex, means = IE[x["id"]]
    x["exemption"], x["whatItMeans"] = ex, means
    if x["id"] == "other-section-301":
        x["country"] = "Other 2026 Section 301 economies (45 more, among them Chile, Peru, Colombia, Ecuador, Taiwan, Switzerland, Thailand and Turkey)"
    if x["id"] == "ru-section-301":
        x["sourceIds"] = ["fr-2026-15181", "fr-2026-15274", "procl-10420", "procl-10523", "hts-chapter-99", "hts-now"]


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {"id": id_, "type": type_, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now,
            "countries": countries, "sourceIds": ids}


gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["detail"] = "All 13 Chapter 78 lines carry the same general rate in the 2026 Revision 21 as in the 2025 Basic Edition; none changed and none are new or renumbered."
CA338 = ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "hts-chapter-99"]
changes = [
    base,
    ch("nicaragua-301", "pending", "2025-12-12", "Announced", "Section 301 tariff on Nicaragua phases in from 2027",
       "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
       "(9903.89.01, U.S. note 29). The rate is 0% in 2026. It would reach all 13 Chapter 78 lines.",
       None, "+10% to +15%", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the review",
       "USTR announced that the 2018–2019 Section 301 actions on China, including List 3 (25%) on 10 Chapter 78 lines, continue while the "
       "statutory four-year review proceeds.",
       None, None, "China", ["fr-2026-20510"]),
    ch("ca338-lead-removed", "extraDuty", "2026-09-15", "Effective", "Canadian refined lead taken off the Section 338 list",
       "Proclamation 11065 modified the Section 338 product lists from September 15, 2026 and removed refined lead (7801.10) from the list "
       "under 9903.03.14. Canadian refined lead is back to its base rate (Free with USMCA) and, without USMCA, the 10% Section 301 duty.",
       "+50%", "None", "Canada", CA338),
    ch("ca338-lead", "extraDuty", "2026-08-22", "Effective", "50% Section 338 duty on Canadian refined lead",
       "Proclamation 11048 imposed 50% (9903.03.14, U.S. note 51(b)) on listed products of Canada, including refined lead (7801.10), "
       "effective August 19, 2026; Proclamation 11056 suspended it for three days, and it took effect August 22. Note 51 applies the duty "
       "even to goods claiming USMCA. No other Chapter 78 line was on the lists.",
       None, "+50% (refined lead, to September 14)", "Canada", CA338),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies reach all of Chapter 78",
       "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. No Chapter 78 line is on the general exemption "
       "list (note 52(b)), and lead is not a Section 232 good, so all 13 lines pay. USMCA goods of Canada and Mexico are exempt (9903.05.93, "
       ".94). South Korea and Japan pay 12.5%, and the EU 10%, in place of the base rate when it is lower.",
       None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% Section 122 surcharge (9903.03.01) ended after its 150 days on July 23, 2026; the 2026 Section 301 tariffs took over the next day.",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. No Chapter 78 line is on its exemption list (note 50(a)(ii)), so it stacks "
       "with the 12.5% 2026 duty.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution "
       "of the issues or until termination, so USMCA claims (SPI S) still make Canadian and Mexican lead Free and lift the 2026 Section 301 duty.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("critical-minerals-plurilateral", "reference", "2026-02-26", "Published", "USTR asks for comments on a critical-minerals trade agreement",
       "Following Proclamation 11001, USTR requested public comments on the design of a plurilateral agreement on trade in critical minerals. "
       "No tariff on lead has resulted.",
       None, None, "All", ["fr-2026-03868"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Chapter 78 was not on its exemption list "
       "(9903.03.03), so lead paid it; USMCA goods of Canada and Mexico were exempt.",
       None, "+10% (ended)", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, "
       "Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods "
       "entered from 12:00 a.m. ET on February 24.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("critical-minerals-232", "reference", "2026-01-14", "Signed", "Section 232 on processed critical minerals: negotiations, no tariff",
       "Proclamation 11001 agreed with Commerce that imports of processed critical minerals and their derivative products threaten national "
       "security, but directed negotiations with trading partners instead of imposing tariffs. No Section 232 duty applies to lead.",
       None, None, "All", ["procl-11001", "eo-14272"]),
    ch("lead-critical-mineral", "reference", "2025-11-07", "Published", "Lead added to the U.S. critical minerals list",
       "The USGS final 2025 List of Critical Minerals (60 minerals) added lead, along with copper, silver, potash, silicon, rhenium and others. "
       "The listing carries no tariff by itself.",
       None, None, "All", ["fr-2025-19813"]),
    ch("cn-fentanyl-cut", "extraDuty", "2025-11-10", "Effective", "China IEEPA fentanyl duty cut to 10%",
       "Executive Order 14357 lowered the IEEPA duty on products of China from 20% to 10% from November 10, 2025. Ended February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("reciprocal-country-rates", "extraDuty", "2025-08-07", "Effective", "Reciprocal tariff raised to country-specific rates",
       "Executive Order 14326 replaced the 10% baseline with country rates for goods entered from August 7, 2025, for example 15% for Japan "
       "and South Korea and 15% in total for the EU. Lead was not exempt. Ended February 24, 2026.",
       "+10%", "Higher country rates (ended)", "All except Canada, Mexico", ["eo-14326"]),
    ch("brazil-ieepa", "extraDuty", "2025-08-06", "Effective", "Extra 40% IEEPA duty on goods of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the reciprocal tariff, from August 6, 2025. Ended February 24, 2026.",
       None, "+40% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada IEEPA duty raised to 35% on non-USMCA goods",
       "Raised the IEEPA duty on Canadian goods not entered under USMCA from 25% to 35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on all Chapter 78 goods",
       "10% baseline (9903.01.25) on products of all countries except Canada and Mexico, from April 5, 2025. No Chapter 78 line is on the "
       "exemption list printed in the schedule (U.S. note 2(v)(iii)), so all lead paid it. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("ca-mx-usmca", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
       "+25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("cn-fentanyl-20", "extraDuty", "2025-03-04", "Effective", "China IEEPA fentanyl duty raised to 20%",
       "Executive Order 14228 raised the IEEPA duty on products of China (9903.01.20) from 10% to 20%, on top of the Section 301 duties. Ended February 24, 2026.",
       "+10%", "+20% (ended)", "China", ["eo-14228"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada, Mexico and China",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025; +10% on goods of China (9903.01.20) from "
       "February 4, 2025. Ended February 24, 2026.",
       "None", "+25% / +10% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195"]),
    ch("ru-70", "extraDuty", "2023-04-01", "Effective", "Russian refined lead: 70% in lieu of column 2",
       "Proclamation 10523 raised the rate on Russian refined and other unwrought lead (7801.10, 7801.99.90; 9903.90.09) from 35% to 70% "
       "in place of the column 2 rate.",
       "35%", "70%", "Russia", ["procl-10523", "hts-chapter-99"]),
    ch("ru-35", "extraDuty", "2022-07-27", "Effective", "Russian refined lead: 35% in lieu of column 2",
       "Proclamation 10420 set a 35% rate in place of the column 2 rate (9903.90.08) on listed products of Russia, including refined lead "
       "(7801.10) and other unwrought lead (7801.99.90).",
       "10% (column 2)", "35%", "Russia", ["procl-10420"]),
    ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%",
       "The List 3 duty on 10 Chapter 78 lines (antimonial and other unwrought lead, sheet, foil, powders and other articles), 10% from "
       "September 24, 2018, rose to 25%. Refined lead and scrap were never listed.",
       "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
]
for c in changes:
    for sid in c["sourceIds"]:
        assert sid in src, sid
    assert "TODO" not in c["detail"], c["id"]
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in changes for sid in c["sourceIds"]}
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch78"])
for sid in used:
    assert sid in src, sid
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["h1"] = "HTS Chapter 78 Lead Tariffs by Country: Canada, Mexico, Australia, South Korea, China & More"
ia["seo"] = {
    "title": "Lead Tariffs by Country: Canada, Mexico, Australia, South Korea, UK, China (HTS Ch. 78) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on lead by country and product: Free for USMCA lead from Canada and Mexico, 12.5% for South Korea and "
        "Australia, 10% plus the base rate for the UK, up to 40.5% for China. Lead-content rates, AGOA and FTA claims explained."
    ),
    "keywords": [
        "lead tariffs by country",
        "united states tariff on lead",
        "south korea tariff on lead",
        "usmca lead import rates",
        "lead tariff canada",
        "lead tariff mexico",
        "lead waste and scrap tariffs",
        "unwrought lead customs duty",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current "
    "tariff schedule. For lead the 2026 Section 301 tariff sets most of the cost: **10% or 12.5%** on the full value for 60 economies, "
    "with no Chapter 78 line exempt. **USMCA** lead from Canada and Mexico pays **nothing**; South Korea and Japan pay a flat **12.5%** and "
    "the EU **10%**; Australia pays 12.5% (its FTA removes only the base rate); China pays up to **40.5%** with List 3.\n\n"
    "Unwrought lead cells show the base rate as \"2.5% on the value of the lead content\" because it depends on what the lead in the "
    "shipment is worth, which the importer declares; the extra duties are on the full value. Ghana is not one of the 2026 Section 301 "
    "economies, so AGOA-qualifying Ghanaian lead is Free. No Section 232 or AD/CVD duty applies to Chapter 78."
)
R = {
    "Canada": ("USMCA-qualifying lead is Free: the base rate is Free under USMCA and 9903.05.93 removes the 10% Section 301 duty (9903.05.29). "
               "Without a USMCA claim: base rate + 10%. Canada's 50% Section 338 duty (9903.03.14) reached refined lead only from August 22 to "
               "September 14, 2026. The IEEPA duty ended February 24, 2026.",
               ["fr-2026-15181", "procl-11048", "procl-11065", "eo-14389", "hts-now"]),
    "Mexico": ("USMCA-qualifying lead is Free (9903.05.94 removes the 10% Section 301 duty, 9903.05.55). Without a USMCA claim: base rate + 10%. "
               "The IEEPA duty ended February 24, 2026.",
               ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Australia": ("12.5% Section 301 (9903.05.23) on every line; the U.S.–Australia FTA (AU) removes the base rate (scrap and powders are "
                  "Free anyway), so most cells are a flat 12.5%.",
                  ["fr-2026-15181", "hts-now"]),
    "South Korea": ("12.5% in place of the base rate (9903.05.71): every Chapter 78 line pays a flat 12.5% of its value, with or without a "
                    "KORUS claim. The 15% IEEPA reciprocal rate ended February 24, 2026.",
                    ["fr-2026-15181", "eo-14389", "hts-now"]),
    "United Kingdom": ("Base rate + 10% Section 301 (9903.05.81); refined lead pays 2.5% of its lead content plus 10% of its value. "
                       "Lead is outside Section 232, so the UK's metals provisions do not apply.",
                       ["fr-2026-15181", "hts-now"]),
    "Kazakhstan": ("Base rate + 12.5% Section 301 (9903.05.51); GSP has lapsed.", ["fr-2026-15181", "hts-now"]),
    "Ghana": ("AGOA (D) makes every Chapter 78 line Free for qualifying goods of Ghana (general note 16; AGOA runs through December 31, 2026). "
              "Ghana is not one of the 2026 Section 301 economies, so no extra duty applies.",
              ["hts-gn", "ustr-agoa-2026", "fr-2026-15181", "hts-now"]),
    "Germany": ("EU: 10% in place of the base rate (9903.05.39), so every line pays a flat 10% of its value.",
                ["fr-2026-15181", "hts-now"]),
    "South Africa": ("AGOA (D) removes the base rate; the 12.5% Section 301 duty (9903.05.69) still applies, so cells are 12.5%. South "
                     "Africa is an AGOA beneficiary in general note 16 (through December 31, 2026).",
                     ["hts-gn", "ustr-agoa-2026", "fr-2026-15181", "hts-now"]),
    "Nigeria": ("AGOA (D) removes the base rate; the 12.5% Section 301 duty (9903.05.59) still applies, so cells are 12.5%.",
                ["hts-gn", "ustr-agoa-2026", "fr-2026-15181", "hts-now"]),
    "China": ("12.5% Section 301 (9903.05.31) on all lines + 25% List 3 (9903.88.03) on 10 lines: antimonial and other unwrought lead, "
              "sheet, foil, powders and other articles (37.5% plus the base rate). Refined lead (7801.10) and scrap (7802) are on no China "
              "list and pay 12.5% plus the base rate. The IEEPA duties ended February 24, 2026.",
              ["fr-2026-15181", "fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "hts-now"]),
    "India": ("Base rate + 10% Section 301 (9903.05.44); GSP has lapsed.", ["fr-2026-15181", "hts-now"]),
    "Brazil": ("Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% 2026 Section 301 (9903.05.27) = base + 37.5%: no Chapter 78 line is "
               "on either exemption list.", ["fr-2026-14542", "fr-2026-15181", "hts-now"]),
    "Japan": ("12.5% in place of the base rate (9903.05.49): a flat 12.5% on every line.", ["fr-2026-15181", "hts-now"]),
    "Vietnam": ("Base rate + 12.5% Section 301 (9903.05.84).", ["fr-2026-15181", "hts-now"]),
}
OTHER = ("Base rate + 0% to 12.5%: the 45 other 2026 Section 301 economies pay 10% or 12.5% (Switzerland and Taiwan as a flat rate in place of the base rate); countries outside the 60, such as Côte d'Ivoire, pay only the base rate. Column 2 countries pay more: "
         "Russia 10% to 45%, or 70% on refined and other unwrought lead, plus 12.5%; Nicaragua's Section 301 duty starts January 1, 2027.")
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        rule["label"], rule["sourceIds"] = R[c["country"]]
    elif c["country"] == "Any other country":
        rule["label"] = OTHER
        rule["sourceIds"] = ["fr-2026-15181", "fr-2026-15274", "procl-10523", "fr-2025-23892", "hts-now"]
    else:
        raise SystemExit(f"no rule text for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Unwrought lead (7801) carries a base rate of 2.5% on the value of the lead content. Cells keep that wording because the base duty "
    "depends on the lead value the importer declares; the tariff calculator asks for it. Extra duties are charged on the full customs value.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied. Canada's Section 338 duty on refined lead (9903.03.14) applied "
    "August 22 to September 14, 2026 only.",
    "No Section 232 duty reaches Chapter 78, and no antidumping or countervailing duty order covers Chapter 78 goods.",
    "Imports of spent lead-acid batteries and other hazardous waste need EPA notice and consent (40 CFR part 262, subpart H); this is an "
    "entry condition, not a duty, and is not shown in the cells.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 78 line is on the "
    "note 52(b) general exemption list, the note 52(j) country exception lists or the note 50(a)(ii) Brazil list, so the 2026 Section 301 "
    "duties reach all 13 lines. No Chapter 78 line is on the Section 232 lists of note 16 (steel, aluminum, copper) or the vehicle and "
    "parts notes. China List 3 (note 20(f)) names 7801.91, 7801.99.30, 7801.99.90, 7804.11, 7804.19, 7804.20, 7806.00.03, 7806.00.05 and "
    "7806.00.80; refined lead and scrap are on no list, and note 31 names no Chapter 78 line. Note 30(d) (9903.90.09) names 7801.10 and "
    "7801.99.90. The current note 51(b) Section 338 lists contain no Chapter 78 line; 7801.10 was on the 9903.03.14 list from August 22 to "
    "September 14, 2026. The reciprocal (note 2(v)(iii)) and Section 122 (9903.03.03) exemption lists, both ended, named no Chapter 78 line."
)
ia_ids = {sid for c in ia["countries"] for sid in c["rule"]["sourceIds"]} | {"hts-now", "hts-chapter-99"}
for sid in ia_ids:
    assert sid in src, sid
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Lead: Lead Content Declaration, EPA Rules for Lead Scrap and Spent Batteries, USMCA & Ways to Lower Duty (HTS Ch. 78) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 78 lead line: declaring the lead content for the 2.5% rate, EPA hazardous-waste import notices for "
        "spent lead-acid batteries (40 CFR 262 subpart H), the scrap metal exemption, TSCA certification and marking, plus the legal ways "
        "to pay less: USMCA, FTAs and AGOA, origin and classification."
    ),
    "keywords": [
        "lead import duty",
        "lead scrap import license",
        "spent lead acid batteries hazardous waste",
        "used lead acid batteries import",
        "usmca chapter 78 rules of origin",
        "hts chapter 78 import duty",
        "lead content duty",
    ],
}
te["intro"] = (
    "For lead, two things decide the cost: the **lead content** of unwrought lead, which sets the 2.5% base duty, and the **origin**, "
    "which sets the 2026 Section 301 duty (Free for USMCA goods, 10% or 12.5% for most others, up to 37.5% plus the base rate for China). "
    "The importer declares the value of the lead in each 7801 shipment, backed by an assay; extra duties are always on the full customs value.\n\n"
    "Entry rules come from EPA as much as CBP. **Spent lead-acid batteries** and other hazardous waste can be imported only with EPA "
    "notice and consent under **40 CFR part 262, subpart H**, filed through EPA's Waste Import Export Tracking System. Lead **scrap metal** "
    "being recycled is exempt from those hazardous-waste rules. Bulk lead needs a TSCA import certification. Each rule and lever links to "
    "its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican lead",
        "saves": "The base rate (2.5% of the lead content, up to 3% on articles) and the 10% 2026 Section 301 duty: Canadian or Mexican lead enters Free",
        "appliesTo": "All 13 lines, for goods of Canada or Mexico that meet the USMCA rules of origin",
        "document": "A USMCA certification of origin (19 CFR 182.12) kept on file, and SPI S on the entry; 9903.05.93 (Canada) or 9903.05.94 (Mexico) lifts the Section 301 duty.",
        "caveat": "Lead refined in Canada or Mexico from imported concentrate or scrap must meet the product-specific rule. A USMCA claim did not lift Canada's Section 338 duty on refined lead while it applied (August 22 to September 14, 2026).",
        "citations": [
            {"label": "19 CFR 182.12 (USMCA certification)", "url": f"{E19}/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA or AGOA for the base rate",
        "saves": "The base rate only: 2.5% of the lead content on unwrought lead, 1.2% to 3% on sheet, foil and articles",
        "appliesTo": "Originating goods of Australia (AU), Chile, Colombia, Peru, Korea (KR) and other FTA partners; AGOA (D) goods of Ghana, Nigeria, South Africa and other general note 16 countries",
        "document": "The agreement's proof of origin, or for AGOA the 35% value-content records of general note 16(b), kept on file.",
        "caveat": "Except for Ghana and other countries outside the 2026 Section 301 action, the 10% or 12.5% duty still applies. For Korea, Japan and the EU the Section 301 rate replaces the base rate, so an FTA claim changes nothing. AGOA runs through December 31, 2026.",
        "citations": [
            {"label": "HTSUS General Notes (note 16, AGOA)", "url": S("hts-gn")["url"]},
            {"label": "19 CFR part 10", "url": f"{E19}/part-10"},
        ],
    },
    {
        "id": "lead-content",
        "title": "Value the lead content correctly",
        "saves": "Base duty on the non-lead part: the 2.5% applies to the value of the lead content, not to silver, antimony or other metals",
        "appliesTo": "Unwrought lead (7801): refined lead, antimonial lead, lead bullion and alloys",
        "document": "An assay or mill certificate showing the lead content (the HTS also asks for the quantity in kg of lead, Pb kg, on 7801.91 and 7801.99) and an invoice that values the lead.",
        "caveat": "Only the base duty is on the lead content. Section 301 and all other extra duties are on the full customs value.",
        "citations": [
            {"label": "HTSUS Chapter 78", "url": CH78},
            {"label": "19 CFR 141.86 (invoice contents)", "url": f"{E19}/section-141.86"},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese origin for listed lead products",
        "saves": "25% of value on 10 lines: Chinese antimonial lead, sheet, foil, powders and articles pay List 3 on top of 12.5%",
        "appliesTo": "7801.91, 7801.99, 7804 and 7806 goods of China (refined lead and scrap are not listed)",
        "document": "Production records showing where the lead was smelted, refined or made. Origin follows the last substantial transformation; ask CBP for a binding ruling if processing happens in more than one country.",
        "caveat": "Remelting or simple alloying abroad may not change origin.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{E19}/part-177"},
        ],
    },
    {
        "id": "classify",
        "title": "Classify the lead form correctly",
        "saves": "The right base rate: scrap and powders are Free, refined and unwrought lead 2.5% of the lead content, sheet up to 3%",
        "appliesTo": "All lines; most often refined vs other unwrought lead (subheading note 1), scrap vs usable lead, and whole spent batteries (8549.11) vs battery scrap (7802)",
        "document": "Chemical analysis against the subheading note 1 limits, a description of form and processing, and if unsure a CBP binding ruling.",
        "caveat": "Classification follows the product, not the duty. China List 3 and Section 301 rates follow the line, so a wrong class can also change the extra duty.",
        "citations": [
            {"label": "HTSUS Chapter 78, notes", "url": CH78},
            {"label": "19 CFR part 177 (rulings)", "url": f"{E19}/part-177"},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback on exported lead or lead products",
        "saves": "Up to 99% of the duties paid on lead that is exported, or used to make exported goods",
        "appliesTo": "All lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Check with CBP whether a particular Chapter 99 duty is refundable before relying on it.",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{E19}/part-191"},
        ],
    },
]
te["rules"] = [
    {"id": "lead-content-entry", "agency": "CBP", "title": "Unwrought lead (7801): base duty of 2.5% on the value of the lead content; declare the lead value and report kilograms and kilograms of lead content (Pb kg) where the HTS asks",
     "citations": [{"label": "HTSUS Chapter 78", "url": CH78}, {"label": "19 CFR 141.86 (invoice contents)", "url": f"{E19}/section-141.86"}]},
    {"id": "s301-entry", "agency": "CBP", "title": "2026 Section 301: report the country's 9903.05.xx heading with every Chapter 78 line (no exemption-list line); USMCA goods report 9903.05.93 or 9903.05.94",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99}, {"label": "USTR notice (91 FR 47318)", "url": S("fr-2026-15181")["url"]}]},
    {"id": "epa-import-hw", "agency": "EPA", "title": "Hazardous waste imports, including spent lead-acid batteries for reclamation: EPA notice and consent through WIETS, a movement document and a contract with the receiving facility",
     "citations": [{"label": "40 CFR 262.84", "url": f"{E40}/section-262.84"}, {"label": "40 CFR 266.80", "url": f"{E40}/section-266.80"},
                   {"label": "40 CFR 273.70 (universal waste imports)", "url": f"{E40}/section-273.70"}]},
    {"id": "epa-scrap-metal", "agency": "EPA", "title": "Lead scrap metal being recycled is exempt from the RCRA hazardous-waste rules (excluded scrap metal is excluded altogether); battery-derived materials need a hazardous-waste determination",
     "citations": [{"label": "40 CFR 261.6(a)(3)(ii)", "url": f"{E40}/section-261.6"}, {"label": "40 CFR 261.4(a)(13)", "url": f"{E40}/section-261.4"},
                   {"label": "40 CFR 261.1(c)(6) (scrap metal)", "url": f"{E40}/section-261.1"}]},
    {"id": "tsca", "agency": "CBP / EPA", "title": "TSCA import certification for chemical substances in bulk, such as unwrought lead and lead powder; articles need it only if a TSCA rule requires",
     "citations": [{"label": "19 CFR 12.121", "url": f"{E19}/section-12.121"}, {"label": "40 CFR 707.20", "url": f"{E40}/section-707.20"}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking; ingots, pigs, plates and sheets are on the J-list, but their outermost container must be marked; scrap and waste are exempt",
     "citations": [{"label": "19 CFR 134.11", "url": f"{E19}/section-134.11"}, {"label": "19 CFR 134.33", "url": f"{E19}/section-134.33"}]},
    {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 70% in lieu of column 2 on 7801.10 and 7801.99.90 (9903.90.09), plus 12.5% Section 301",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10523 (88 FR 13277)", "url": S("procl-10523")["url"]}]},
]
GROUP_RULES = {
    "7801": ["lead-content-entry", "s301-entry", "tsca", "marking", "russia"],
    "7802": ["s301-entry", "epa-scrap-metal", "epa-import-hw", "marking"],
    "7804": ["s301-entry", "tsca", "marking"],
    "7806": ["s301-entry", "marking"],
}
GROUP_NOTES = {
    "7801": "2.5% on the value of the lead content, Free under USMCA and the FTAs; 10% or 12.5% Section 301 on the full value. Chinese refined lead is not on List 3; antimonial and other unwrought lead are. Russian refined lead pays 70%.",
    "7802": "Free base rate, but 10% or 12.5% Section 301 for non-USMCA goods (no exemption). Lead scrap metal is exempt from RCRA hazardous-waste rules; whole spent batteries (8549.11) are not Chapter 78 and need EPA consent.",
    "7804": "2.2% (foil up to 0.2 mm), 3% (thicker sheet) or Free (powders and flakes); China pays 37.5% extra.",
    "7806": "1.2% (bars, rods, wire), 2% (pipes and fittings) or 3% (other articles); China pays 37.5% extra.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = G[h][0]
    g["ruleIds"] = list(GROUP_RULES[h])
    g["note"] = GROUP_NOTES[h]
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    rules = list(GROUP_RULES[h])
    if h == "7801" and hts not in RU70:
        rules.remove("russia")
    if hts == "7802.00.00.60":
        rules.remove("epa-import-hw")
    if h == "7804" and not hts.startswith("7804.20"):
        rules.remove("tsca")
    ln["ruleIds"] = rules
    levers = ["usmca"]
    if LINE[hts]["effectiveGeneral"] != "Free":
        levers.append("fta")
    if hts in LEAD_CONTENT:
        levers.append("lead-content")
    if hts in LIST3:
        levers.append("origin")
    levers += ["classify", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations, not legal advice. Chapter 99 rates change often, and EPA's "
    "import rules depend on whether a material is a hazardous waste; check the current Chapter 99 notes, CBP's CSMS messages and EPA's "
    "requirements before importing."
)


# ------------------------------------------------------------------ trade-dependent text
ui = d["understandIndustry"]
assert ui["latestYear"], "no trade data: run with --trade-file"
Y, PY = ui["latestYear"], ui["priorYear"]
NAME_FIX = {"Rep. of Korea": "South Korea"}
for _c in ui["byCountry"]:
    _c["country"] = NAME_FIX.get(_c["country"], _c["country"])
for _x in ui["byHeadingCountry"]:
    _x["country"] = NAME_FIX.get(_x["country"], _x["country"])
for _l in ui["byLine"]:
    _l["searchText"] = _l["searchText"].replace("…", "")


def B(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M" if v >= 1e6 else f"${v / 1e6:.1f}M"


def pct(a, b):
    return (a - b) / b * 100 if b else 0.0


total = sum(c["importsUsd"] for c in ui["byCountry"]) + ui["othersImportsUsd"]
prior = sum(c["priorImportsUsd"] for c in ui["byCountry"]) + ui["othersPriorImportsUsd"]
byh = {}
for x in ui["byHeadingCountry"]:
    byh[x["heading"]] = byh.get(x["heading"], 0) + x["importsUsd"]
C = {c["country"]: c for c in ui["byCountry"]}
L = {l["hs6"]: l for l in ui["byLine"]}
top = ui["byCountry"][:6]
for c in ui["byCountry"]:
    if c.get("mainHeading") in G:
        c["mainHeadingLabel"] = G[c["mainHeading"]][0]
trade = json.load(open(os.path.join(os.path.dirname(PATH), "..", "trade", "chapter-78.json")))
yr = {c["country"]: c["byYear"] for c in trade["byCountry"]}
peak = max(ui["byYear"], key=lambda y: y["totalUsd"])
assert [c["country"] for c in top[:4]] == ["Canada", "Mexico", "Australia", "South Korea"], [c["country"] for c in top[:4]]
cm_share = (C["Canada"]["importsUsd"] + C["Mexico"]["importsUsd"]) / total * 100

ui["h1"] = "HTS Chapter 78: Lead and Articles Thereof — U.S. Import Statistics"
ui["seo"] = {
    "title": f"U.S. Lead Imports by Country & Product: Canada, Mexico, Australia, South Korea (HTS Ch. 78) | KoalaGains",
    "shortDescription": (
        f"Where U.S. lead imports come from, {ui['byYear'][0]['year']}–{Y}: {B(total)} in {Y} ({pct(total, prior):+.1f}% on {PY}), "
        f"{cm_share:.0f}% from Canada and Mexico. Refined lead, antimonial lead, scrap, sheet and articles by country, product and year, from UN Comtrade."
    ),
    "keywords": [
        "us lead imports",
        "where does the us get lead from",
        "does the us import lead",
        "lead imports by country",
        f"us lead imports {Y}",
        "refined lead imports",
        "HTS Chapter 78 import statistics",
    ],
}
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["sources"] = [s for s in ui["sources"] if "comtrade" in (s.get("url") or "")] + [
    {"label": "Federal Register 91 FR 47318 (USTR: 2026 Section 301 actions on 60 economies, from July 24, 2026)", "url": S("fr-2026-15181")["url"]},
    {"label": "Federal Register 90 FR 50494 (USGS: final 2025 List of Critical Minerals, adding lead)", "url": S("fr-2025-19813")["url"]},
]
ref = L["7801.10"]
anti = L["7801.91"]
oth = L["7801.99"]
ui["why"] = (
    f"U.S. imports of Chapter 78 lead were **{B(total)} in {Y}**, {pct(total, prior):+.1f}% from {B(prior)} in {PY} but below the "
    f"{peak['year']} peak of {B(peak['totalUsd'])}. Almost all of it is unwrought lead: **refined lead (7801.10) was {B(ref['importsUsd'])}, "
    f"{ref['sharePct']:.0f}% of the total**, other unwrought lead and alloys (7801.99) {B(oth['importsUsd'])} and antimonial lead (7801.91) "
    f"{B(anti['importsUsd'])}. Sheet, foil and powders (7804) were {B(byh['7804'])}, other articles (7806) {B(byh['7806'])} and scrap "
    f"(7802) only {B(byh['7802'])}.\n\n"
    f"**Canada ({B(C['Canada']['importsUsd'])}, {pct(C['Canada']['importsUsd'], C['Canada']['priorImportsUsd']):+.0f}%) and Mexico "
    f"({B(C['Mexico']['importsUsd'])}, {pct(C['Mexico']['importsUsd'], C['Mexico']['priorImportsUsd']):+.0f}%) supplied {cm_share:.0f}%**, "
    f"and USMCA lead from both enters Free. Australia ({B(C['Australia']['importsUsd'])}) and South Korea ({B(C['South Korea']['importsUsd'])}, "
    f"down from {B(yr['Rep. of Korea']['2023'])} in 2023) came next, then the United Kingdom ({B(C['United Kingdom']['importsUsd'])}), "
    f"Kazakhstan and Ghana. Nigeria fell from {B(yr['Nigeria']['2024'])} in {PY} to {B(yr['Nigeria'][str(Y)])}, and China from "
    f"{B(yr['China']['2022'])} in 2022 to {B(yr['China'][str(Y)])}. Germany ships mainly sheet and foil.\n\n"
    f"{Y} is the latest full year of U.S. trade data; the 2026 Section 301 duties (from July 24, 2026) are not yet reflected. Lead ores and "
    "concentrates (Chapter 26) and lead-acid batteries (Chapter 85) are not included. Duty-collected figures aren't available from an official source yet."
)

ts = o["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = f"UN Comtrade, United States imports, HS chapter 78 ({Y})"
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["stats"].append({"label": f"{Y} imports", "value": B(total), "note": f"{cm_share:.0f}% from Canada and Mexico"})

# ------------------------------------------------------------------ finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 78 FAQ: Lead Tariffs, HS Codes and Import Rules"
fc["seo"] = {
    "title": "Lead Tariff FAQ 2026: Is There a Tariff on Lead? Lead Ingot, Scrap & Battery HS Codes, EPA Rules (HTS Ch. 78) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about U.S. lead imports: the tariff on lead, the lead-content rate, HS codes for lead ingots, "
        "alloys, scrap, sheet and batteries, EPA rules for lead scrap and spent batteries, China, critical minerals and import sources."
    ),
    "keywords": [
        "tariff on lead",
        "is there a tariff on lead",
        "hs code lead",
        "lead tariff code",
        "lead ingot hs code",
        "lead scrap hs code",
        "hs code lead acid battery",
        "lead scrap import license",
        "is lead a critical mineral",
        "hts chapter 78",
    ],
}
fc["intro"] = (
    "Straight answers to the most-searched questions about U.S. tariffs and import rules for lead, by product, by country and by HS code. "
    "Each answer links to the page with the detail and the official sources."
)
fc["keyTakeaways"] = [
    "Unwrought lead pays a base rate of 2.5% on the value of its lead content; scrap and powders are Free; sheet, foil and articles 1.2% to "
    "3%. USMCA and the FTAs make every line Free.",
    "The 2026 Section 301 tariff (from July 24, 2026) adds 10% or 12.5% of the full value for 60 economies, with no Chapter 78 line exempt. "
    "USMCA lead from Canada and Mexico pays nothing; South Korea and Japan pay a flat 12.5%, the EU 10%; China up to 40.5%.",
    "Section 232 does not cover lead, the critical-minerals Section 232 action produced no tariff, and no AD/CVD order covers Chapter 78. "
    "The IEEPA and Section 122 tariffs have ended; Canada's Section 338 duty on refined lead lasted from August 22 to September 14, 2026.",
    f"In {Y} the U.S. imported {B(total)} of Chapter 78 lead, {ref['sharePct']:.0f}% of it refined lead, {cm_share:.0f}% from Canada and "
    "Mexico. Spent lead-acid batteries need EPA notice and consent to import; lead scrap metal for recycling does not.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = QSRC
tops = ", ".join(f"{c['country']} {B(c['importsUsd'])}" for c in top[:5])
fc["faqs"] = [
    {
        "id": "current-rate",
        "question": "Is there a tariff on lead?",
        "searchedAs": ["tariff on lead", "tariffs on lead", "is there a tariff on lead", "lead import duty"],
        "answer": "Yes, but it is modest for most suppliers. Unwrought lead (7801) has a base rate of 2.5% on the value of its lead content, "
                  "scrap and powders are Free, and sheet, foil and articles pay 1.2% to 3%. Since July 24, 2026 the 2026 Section 301 tariff "
                  "adds 10% or 12.5% of the full value for 60 economies, including South Korea, Australia, the UK, the EU and China; USMCA "
                  "lead from Canada and Mexico pays nothing. Section 232 does not apply to lead.",
        "link": "",
    },
    {
        "id": "lead-content",
        "question": "What does \"2.5% on the value of the lead content\" mean?",
        "searchedAs": ["unwrought lead", "unwrought lead meaning", "unwrought lead refined"],
        "answer": "It is the base rate on all unwrought lead (refined lead, antimonial lead, bullion and alloys, heading 7801). The 2.5% applies "
                  "only to the value of the lead in the shipment, which the importer declares from an assay, not to silver or other metals "
                  "in it: $10,000 of refined lead with $9,000 of lead content pays $225. Extra duties such as Section 301 are charged on the "
                  "full customs value.",
        "link": "",
    },
    {
        "id": "hs-code",
        "question": "What is the HS code for lead?",
        "searchedAs": ["hs code lead", "hs code for lead", "lead hs code", "lead tariff code", "lead commodity code", "chapter 78 hs code", "chapter 78 hts"],
        "answer": "Lead is HS Chapter 78: 7801 unwrought lead (7801.10 refined, 7801.91 antimonial, 7801.99 other, including bullion and "
                  "alloys), 7802 lead waste and scrap, 7804 plates, sheets, strip, foil, powders and flakes, and 7806 other articles of lead. "
                  "The U.S. schedule splits these into 13 ten-digit lines. Lead ore is 2607 and lead-acid batteries 8507.",
        "link": "",
    },
    {
        "id": "ingot",
        "question": "What is the HS code for lead ingots?",
        "searchedAs": ["lead ingot hs code", "refined lead ingot hs code", "pure lead ingots hs code", "remelted lead ingots hs code", "refined lead hs code",
                       "unwrought lead hs code", "lead bullion hs code"],
        "answer": "Refined lead ingots and pigs (at least 99.9% lead, within the subheading note 1 limits) are 7801.10.00.00. Lead bullion is "
                  "7801.99.30.00, and other unwrought lead, including remelted lead that is not refined, is 7801.99.90. All pay 2.5% on the "
                  "value of the lead content, Free under USMCA and the FTAs.",
        "link": "",
    },
    {
        "id": "alloy",
        "question": "What is the HS code for antimonial lead and lead alloys?",
        "searchedAs": ["lead alloy hs code", "lead antimony alloy hs code", "antimonial lead hs code", "antimonial lead ingots"],
        "answer": "Unwrought lead containing antimony as the principal other element (antimonial lead) is 7801.91.00.00; other lead alloys are "
                  "7801.99.90.30. Both pay 2.5% on the value of the lead content. Unlike refined lead, both are on China's Section 301 List 3, "
                  "so Chinese antimonial lead pays 25% plus 12.5% on top.",
        "link": "industry-areas",
    },
    {
        "id": "scrap",
        "question": "What is the HS code and tariff for lead scrap?",
        "searchedAs": ["lead scrap hs code", "lead waste and scrap hs code", "lead battery scrap hs code", "lead acid battery scrap hs code", "hs code lead scrap"],
        "answer": "Lead waste and scrap is 7802.00.00: .30 for scrap obtained from lead-acid storage batteries, .60 for other scrap. The base "
                  "rate is Free, but the 2026 Section 301 duty (10% or 12.5%) applies to non-USMCA scrap. Whole spent lead-acid batteries "
                  "are classified in 8549.11 (8549.11.10 for recovery of lead, Free), not in Chapter 78.",
        "link": "",
    },
    {
        "id": "battery",
        "question": "What is the HS code and duty for lead-acid batteries?",
        "searchedAs": ["hs code lead acid battery", "lead acid battery tariff code", "lead acid battery hts code", "lead acid battery import duty rate", "lead battery hs code"],
        "answer": "New lead-acid batteries are Chapter 85, not Chapter 78: 8507.10.00 for starter batteries and 8507.20.80 for other lead-acid "
                  "batteries, both 3.5% base. Spent batteries for lead recovery are 8549.11.10 (Free). Chapter 99 duties for those lines are "
                  "covered on the Chapter 85 pages.",
        "link": "",
    },
    {
        "id": "epa",
        "question": "Do you need a license to import lead scrap or used lead-acid batteries?",
        "searchedAs": ["lead scrap import license", "lead battery scrap import", "used lead-acid batteries can be shipped across international",
                       "used lead acid batteries shipped across international borders"],
        "answer": "There is no U.S. import license for lead, but spent lead-acid batteries imported for reclamation are hazardous waste: the "
                  "importer or foreign exporter must give EPA notice and get consent through EPA's Waste Import Export Tracking System, with "
                  "a movement document and a contract with the receiving facility (40 CFR 262.84, 266.80). Lead scrap metal being recycled "
                  "is exempt from those rules (40 CFR 261.6(a)(3)(ii)).",
        "link": "tariff-engineering",
    },
    {
        "id": "slab-exempt",
        "question": "Are spent lead-acid batteries exempt from hazardous waste rules?",
        "searchedAs": ["spent lead acid batteries are exempt from hazardous waste", "spent lead acid batteries are exempt from hazardous waste regulations",
                       "spent lead acid batteries"],
        "answer": "Partly. Under 40 CFR 266.80, people who collect, transport or store spent lead-acid batteries for reclamation are exempt "
                  "from most hazardous-waste requirements, or can manage them as universal waste (40 CFR part 273). Importers are not fully "
                  "exempt: imports must follow 40 CFR part 262, subpart H (notice, consent and movement documents), and reclaimers that "
                  "store batteries must meet 266.80(b).",
        "link": "tariff-engineering",
    },
    {
        "id": "sheet",
        "question": "What is the HS code for lead sheet and foil?",
        "searchedAs": ["lead sheet hs code", "lead plate hs code", "lead foil hs code", "hs code for lead sheet"],
        "answer": "Lead sheets, strip and foil up to 0.2 mm thick (excluding any backing) are 7804.11.00.00 at 2.2%; thicker plates and sheets "
                  "are 7804.19.00.00 at 3%; lead powders and flakes 7804.20.00.00, Free. Chinese lead sheet pays 40.5% in total.",
        "link": "",
    },
    {
        "id": "articles",
        "question": "What is the HS code for lead wire, pipe and weights?",
        "searchedAs": ["hs code lead wire", "lead wire hs code", "lead weight hs code", "lead powder hs code"],
        "answer": "Lead bars, rods, profiles and wire are 7806.00.03.00 (1.2%); lead tubes, pipes and fittings 7806.00.05.00 (2%); other "
                  "articles of lead, such as weights, 7806.00.80.00 (3%). Lead powder is 7804.20.00.00 (Free). Articles made for a specific "
                  "use elsewhere in the schedule are classified there instead.",
        "link": "",
    },
    {
        "id": "china",
        "question": "What is the tariff on lead products from China?",
        "searchedAs": ["lead products from china", "china lead imports"],
        "answer": "Chinese lead pays the 12.5% 2026 Section 301 duty on every line. Antimonial and other unwrought lead, sheet, foil, powders "
                  "and articles (10 lines) also pay 25% under List 3: for example 40.5% in total on lead sheet. Chinese refined lead "
                  "(7801.10) and scrap (7802) are on no China list and pay 12.5% plus the base rate.",
        "link": "industry-areas",
    },
    {
        "id": "critical-mineral",
        "question": "Is lead a critical mineral, and does that bring a tariff?",
        "searchedAs": ["is lead a critical mineral", "is lead on the critical minerals list", "are zinc and lead critical minerals", "lead critical mineral"],
        "answer": "Yes, lead is on the U.S. critical minerals list: the USGS final 2025 list (November 7, 2025) added it. That does not bring a "
                  "tariff by itself. The Section 232 action on processed critical minerals (Proclamation 11001, January 14, 2026) chose "
                  "negotiations instead of duties, and the Section 232 metals duties cover only steel, aluminum and copper.",
        "link": "tariff-updates",
    },
    {
        "id": "imports",
        "question": "Where does the U.S. get its lead from?",
        "searchedAs": ["where does the us get lead from", "does the us import lead", "lead imports"],
        "answer": f"In {Y} the U.S. imported {B(total)} of Chapter 78 lead products, {ref['sharePct']:.0f}% of it refined lead. The largest "
                  f"suppliers were {tops}. Canada and Mexico together supplied {cm_share:.0f}%. Lead ores (Chapter 26) are not included.",
        "link": "understand-industry",
    },
]
assert 11 <= len(fc["faqs"]) <= 15

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
