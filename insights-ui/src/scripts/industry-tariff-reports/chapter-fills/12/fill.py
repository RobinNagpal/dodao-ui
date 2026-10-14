"""Fill the writer parts of the generated Chapter 12 content file.

Run after:
  pnpm tariff:generate-chapter --chapter 12 --slug 12-oil-seeds-and-grains \
    --title "Oil Seeds and Oleaginous Fruits; Miscellaneous Grains, Seeds and Fruit; Industrial or Medicinal Plants; Straw and Fodder" \
    --countries CA,IN,CN,AR,MX,BG,PY,NL,CL,DE,BR --force
then: python3 fill.py && npx prettier --write <file>
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
SHORT = "Oil Seeds, Seeds for Sowing, Medicinal Plants, Hops & Hay"

d = json.load(open(PATH))
common = json.load(open(os.path.join(HERE, "common_sources.json")))

HTS21 = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH12 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2012"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


NEW_SOURCES = {
    "hts-rev11": {
        "id": "hts-rev11",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 11",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States, 2026 Revision 11",
        "signed": None,
        "published": "2026-06-22",
        "url": "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_11_json.json",
    },
    "fr-2022-10480": {
        "id": "fr-2022-10480",
        "publisher": "Federal Register",
        "citation": "87 FR 29737",
        "document": "Notice (Commerce, ITA)",
        "title": "Organic Soybean Meal From India: Antidumping Duty Order",
        "signed": None,
        "published": "2022-05-16",
        "url": "https://www.federalregister.gov/documents/2022/05/16/2022-10480/organic-soybean-meal-from-india-antidumping-duty-order",
    },
    "fr-2022-10481": {
        "id": "fr-2022-10481",
        "publisher": "Federal Register",
        "citation": "87 FR 29735",
        "document": "Notice (Commerce, ITA)",
        "title": "Organic Soybean Meal From India: Countervailing Duty Order",
        "signed": None,
        "published": "2022-05-16",
        "url": "https://www.federalregister.gov/documents/2022/05/16/2022-10481/organic-soybean-meal-from-india-countervailing-duty-order",
    },
    "fr-2026-01218": {
        "id": "fr-2026-01218",
        "publisher": "Federal Register",
        "citation": "91 FR 2905",
        "document": "Notice (Commerce, ITA)",
        "title": "Organic Soybean Meal From India: Final Results of Antidumping Duty Administrative Review; 2023-2024",
        "signed": None,
        "published": "2026-01-23",
        "url": "https://www.federalregister.gov/documents/2026/01/23/2026-01218/organic-soybean-meal-from-india-final-results-of-antidumping-duty-administrative-review-2023-2024",
    },
    "fr-2026-03894": {
        "id": "fr-2026-03894",
        "publisher": "Federal Register",
        "citation": "91 FR 9551",
        "document": "Notice (Commerce, ITA)",
        "title": "Organic Soybean Meal From India: Final Results of Countervailing Duty Administrative Review; 2023",
        "signed": None,
        "published": "2026-02-26",
        "url": "https://www.federalregister.gov/documents/2026/02/26/2026-03894/organic-soybean-meal-from-india-final-results-of-countervailing-duty-administrative-review-2023",
    },
    "crs-if13136": {
        "id": "crs-if13136",
        "publisher": "Congressional Research Service",
        "citation": "CRS In Focus IF13136 (updated September 28, 2026)",
        "document": "CRS report",
        "title": "Changes to the Statutory Definition of Hemp and Implications for Agricultural Policy",
        "signed": None,
        "published": "2026-09-28",
        "url": "https://www.congress.gov/crs_external_products/IF/PDF/IF13136/IF13136.5.pdf",
    },
    "fr-2025-10797": {
        "id": "fr-2025-10797",
        "publisher": "Federal Register",
        "citation": "90 FR 25123",
        "document": "Final rule (USDA APHIS)",
        "title": "Movement of Certain Genetically Engineered Organisms",
        "signed": None,
        "published": "2025-06-16",
        "url": "https://www.federalregister.gov/documents/2025/06/16/2025-10797/movement-of-certain-genetically-engineered-organisms",
    },
    "hts-chapter-12": {
        "id": "hts-chapter-12",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 12",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 12",
        "signed": None,
        "published": "2026-10-07",
        "url": CH12,
    },
}
ALL_SOURCES = {**common, **NEW_SOURCES}


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for i in ids:
        if i not in have:
            page["sources"].append(ALL_SOURCES[i])
            have.add(i)


# ---------------------------------------------------------------- labels
LABELS = {
    "1201": ("Soybeans", "Soybeans"),
    "1202": ("Peanuts (groundnuts), raw", "Peanuts"),
    "1203": ("Copra", "Copra"),
    "1204": ("Flaxseed (linseed)", "Flaxseed"),
    "1205": ("Rapeseed & canola", "Canola"),
    "1206": ("Sunflower seeds", "Sunflower"),
    "1207": ("Sesame, mustard, hemp, cotton, melon, poppy & other oil seeds", "Other oil seeds"),
    "1208": ("Flours & meals of oil seeds", "Oilseed flours"),
    "1209": ("Seeds for sowing (vegetable, flower, grass & forage)", "Seeds for sowing"),
    "1210": ("Hop cones, hop pellets & lupulin", "Hops"),
    "1211": ("Medicinal & herbal plants (ginseng, psyllium, mint)", "Herbs & medicinal plants"),
    "1212": ("Seaweed, carob, sugar beet & cane, fruit kernels", "Seaweed & other"),
    "1213": ("Cereal straw & husks", "Straw"),
    "1214": ("Hay, alfalfa & forage", "Hay & forage"),
}

PRODUCT_GROUPS = {
    "1201": (
        "Free for every line, seed or not. Canada ($190M) and Argentina ($92M) were the largest suppliers in 2025. Seed soybeans are on the "
        "Section 301 exemption list; other soybeans pay the 2026 extra duty for most of the 60 economies (10% for Argentina).",
        ["soybeans", "soya", "organic soybeans", "seed soybeans", "oil stock"],
    ),
    "1202": (
        "A tariff-rate quota: in-quota peanuts pay 6.6¢/kg (9.35¢/kg in shell); over-quota peanuts pay 131.8% (163.8% in shell) and may "
        "owe a further agricultural safeguard duty. Mexico and FTA partners enter free. Imports were only $5.2M in 2025.",
        ["peanuts", "groundnuts", "blanched peanuts", "in-shell peanuts", "seed peanuts"],
    ),
    "1203": ("Free and on both the Section 301 and the Brazil exemption lists. Imports are negligible ($11,000 in 2025).", ["copra", "dried coconut kernel"]),
    "1204": (
        "0.39¢/kg. Canada supplied $72M of the $87M imported in 2025; flaxseed for sowing is exempt from the 2026 Section 301 duty.",
        ["flaxseed", "linseed", "organic flax", "flax for sowing"],
    ),
    "1205": (
        "0.58¢/kg on canola (low erucic acid) and other rapeseed. Canada shipped $91M of the $114M imported in 2025, and USMCA makes it Free.",
        ["canola", "rapeseed", "colza", "canola seed"],
    ),
    "1206": (
        "Free. Bulgaria ($78M) and Canada ($23M) lead; EU sunflower seeds now pay 10% in total under the 2026 Section 301 rule for the EU, except "
        "seeds for sowing.",
        ["sunflower seeds", "sunflower kernels", "in-shell sunflower", "organic sunflower"],
    ),
    "1207": (
        "Mostly Free: sesame, mustard, safflower, castor, palm nuts, niger and hemp seed. Cottonseed is 0.47¢/kg, melon seeds 0.83¢/kg, poppy "
        "seeds 0.06¢/kg. $412M in 2025; Paraguay shipped $87M of other oil seeds (1207.99), India $40M of sesame, Canada $57M of mustard.",
        ["sesame", "mustard seed", "hemp seed", "poppy seed", "melon seeds", "cottonseed", "safflower", "niger seed"],
    ),
    "1208": (
        "Soy flour 1.9%, other oilseed flours and meals 1.4%. Certified organic soy flour and meal from India is also under antidumping and "
        "countervailing duty orders.",
        ["soy flour", "soybean meal flour", "flaxseed meal", "oilseed flour"],
    ),
    "1209": (
        "The chapter's biggest heading: $562M in 2025, $374M of it vegetable seed. Base rates run from Free to 5.9¢/kg (cauliflower). Every "
        "line is on the Section 301 exemption list, but many Canadian seed lines pay the 50% Section 338 duty.",
        ["vegetable seeds", "flower seeds", "grass seed", "alfalfa seed", "tomato seed", "onion seed", "lettuce seed", "fescue", "ryegrass"],
    ),
    "1210": (
        "13.2¢/kg on hop cones and pellets. Germany shipped $25M of the $51M imported in 2025. EU hops pay 10% in total; Canadian hops pay "
        "an extra 50% under Section 338, even with a USMCA claim.",
        ["hops", "hop pellets", "hop cones", "lupulin"],
    ),
    "1211": (
        "Mostly Free: ginseng roots, psyllium husk, basil, sage, herbal teas and other botanicals. Chilled or frozen herbs are 6%, processed mint "
        "4.8%, tonka beans 6.6¢/kg. $511M in 2025, led by India ($152M) and Mexico ($63M). Coca leaf and poppy straw need DEA permits.",
        ["psyllium husk", "ginseng", "moringa", "herbal tea", "mint leaves", "basil", "sage", "ephedra"],
    ),
    "1212": (
        "Seaweed, carob, chicory root and most other lines are Free; sugar beet is 39.7¢/t, sugar cane $1.24/t and fruit kernels 1.5¢/kg. "
        "China supplied $94M of the $229M imported in 2025.",
        ["seaweed", "kelp", "nori", "carob", "locust bean", "chicory root", "apricot kernels"],
    ),
    "1213": ("Free. $13M in 2025, almost all from Canada. Straw from foot-and-mouth disease regions must be treated or quarantined.", ["straw", "husks", "chaff"]),
    "1214": (
        "Hay and forage are Free; alfalfa meal and pellets 1.4%. Canada shipped $106M of the $121M imported in 2025; USMCA-qualifying hay "
        "and cubes enter free.",
        ["hay", "alfalfa", "timothy hay", "alfalfa pellets", "alfalfa cubes", "clover hay"],
    ),
}

CHAPTER_NOTES = (
    "**Note 1.** Heading 1207 applies, inter alia, to palm nuts and kernels, cotton seeds, castor oil seeds, sesame seeds, mustard seeds, "
    "safflower seeds, poppy seeds and shea nuts (karite nuts). It does not apply to products of heading 0801 or 0802 or to olives (chapter 7 or "
    "chapter 20).\n\n"
    "**Note 2.** Heading 1208 applies not only to non-defatted flours and meals but also to flours and meals which have been partially "
    "defatted or defatted and wholly or partially refatted with their original oils. It does not, however, apply to residues of headings 2304 "
    "to 2306.\n\n"
    "**Note 3.** For the purposes of heading 1209, beet seeds, grass and other herbage seeds, seeds of ornamental flowers, vegetable seeds, "
    "seeds of forest trees, seeds of fruit trees, seeds of vetches (other than those of the species *Vicia faba*) or of lupines are to be "
    "regarded as \"seeds of a kind used for sowing\". Heading 1209 does not, however, apply to the following even if for sowing: (a) "
    "leguminous vegetables or sweet corn (chapter 7); (b) spices or other products of chapter 9; (c) cereals (chapter 10); or (d) products "
    "of headings 1201 to 1207 or of heading 1211.\n\n"
    "**Note 4.** Heading 1211 applies, inter alia, to the following plants or parts thereof: basil, borage, ginseng, hyssop, licorice, all "
    "species of mint, rosemary, rue, sage and wormwood. Heading 1211 does not, however, apply to: (a) medicaments of chapter 30; (b) "
    "perfumery, cosmetic or toilet preparations of chapter 33; or (c) insecticides, fungicides, herbicides, disinfectants or similar "
    "products of heading 3808.\n\n"
    "**Note 5.** For the purposes of heading 1212, the term \"seaweeds and other algae\" does not include: (a) dead single-cell "
    "microorganisms of heading 2102; (b) cultures of microorganisms of heading 3002; or (c) fertilizers of heading 3101 or 3105.\n\n"
    "**Subheading Note 1.** For the purposes of subheading 1205.10, the expression \"low erucic acid rape or colza seeds\" means rape or "
    "colza seeds yielding a fixed oil which has an erucic acid content of less than 2 percent by weight and yielding a solid component which "
    "contains less than 30 micromoles of glucosinolates per gram."
)
ADDITIONAL_US_NOTES = (
    "**Note 1.** No allowance in weight shall be made for dirt or other impurities in seed of any kind provided for in this chapter.\n\n"
    "**Note 2.** The aggregate quantity of peanuts entered under subheadings 1202.30.40, 1202.41.40, 1202.42.15, 1202.42.60, and 2008.11.46 "
    "during the 12-month period from April 1 in any year through the following March 31, inclusive, shall not exceed the quantities "
    "specified herein (articles the product of Mexico shall not be permitted or included under this quantitative limitation and no such "
    "articles shall be classifiable therein): **Argentina 43,901 metric tons; other countries or areas 9,005 metric tons.** For the purposes "
    "of this note, imports of peanuts in the shell shall be charged against the quantities in this note on the basis of 75 kilograms for "
    "each 100 kilograms of peanuts in the shell. Imports of peanuts under this note are subject to such regulations as may be issued by the "
    "United States Trade Representative or other designated agency.\n\n"
    "**Statistical Note 1.** For a list of approved standards for \"Certified organic\", see General Statistical Note 6."
)

EXEMPT_TEXT = (
    "74 of the 167 lines are on the general exemption list (U.S. note 52(b), 9903.05.86) and pay no 2026 Section 301 duty: every seed "
    "line of heading 1209, plus seed soybeans, seed peanuts, copra, and flaxseed, rapeseed, sunflower and cotton seed for sowing, melon "
    "seeds and poppy seeds."
)
SOWING_87 = (
    "Castor, sesame, mustard, safflower and other 1207.99 seeds (including hemp seed) are also exempt when entered for sowing and declared "
    "as such (note 52(c), 9903.05.87)."
)

# ---------------------------------------------------------------- chapter / overview
ov = d["overview"]
ov["h1"] = f"HTS Chapter 12: {SHORT} — Tariff Rates"
ov["seo"] = {
    "title": "HTS Chapter 12 Tariff Rates 2026: Soybeans, Seeds, Hops, Psyllium & Hay Import Duties | KoalaGains",
    "shortDescription": (
        "Searchable duty table for all 167 HTS Chapter 12 lines: soybeans, peanuts, canola, flax, sunflower, sesame and hemp seed, vegetable "
        "and grass seed for sowing, hops, ginseng, psyllium, seaweed, hay and alfalfa. General, FTA and Column 2 rates plus the extra duty by country."
    ),
    "keywords": [
        "HTS Chapter 12",
        "HTS Chapter 12 import duty rates",
        "soybean tariff",
        "hs code 1201 soybeans",
        "seeds for sowing hs code 1209",
        "hops hs code",
        "psyllium husk hs code",
        "ginseng hs code",
        "alfalfa hay hs code",
        "peanut tariff rate quota",
        "USMCA agricultural tariffs",
    ],
}
ov["intro"] = (
    "Chapter 12 covers oil seeds and almost everything else farmers plant or feed that is not a cereal: soybeans, peanuts, flax, canola, "
    "sunflower, sesame, mustard and hemp seed; vegetable, flower and grass **seed for sowing**; hops; ginseng, psyllium and other medicinal "
    "plants; seaweed, carob and sugar beet; and straw, hay and alfalfa. Of its **167 tariff lines**, 82 are Free at the general rate and most "
    "others pay a few cents per kilogram. The exception is **raw peanuts outside the tariff-rate quota: 131.8%, or 163.8% in the shell**.\n\n"
    "The extra duty by country matters more. The U.S. imported **$2.67B** of Chapter 12 goods in 2025; Canada supplied 27%, mostly "
    "soybeans, hay, canola, flax and mustard, and USMCA-qualifying goods from Canada and Mexico enter free. Since **July 24, 2026** goods "
    "from 60 economies pay a **Section 301 tariff** (+10% for India and Argentina, 10% in total for the EU, up to 37.5% for China and "
    "Brazil), but **seeds for sowing are exempt**: 74 lines, including all of heading 1209. Since **August 22, 2026**, 42 lines from Canada, "
    "among them many vegetable and flower seeds, hops, mint, seaweed and herbs, pay a **50% Section 338 duty even with a USMCA claim**."
)
ov["stats"] = [
    {"label": "Tariff lines", "value": "167"},
    {"label": "Lines with a base-rate duty", "value": "85 of 167"},
    {
        "label": "Lines with an extra duty for some origins",
        "value": "167 of 167",
        "note": "2026 Section 301: 93 (74 seed and other lines exempt); China Lists 3/4A: 166; Brazil: 165; Canada Section 338: 42",
    },
    {"label": "2025 imports", "value": "$2.67B"},
    {"label": "Canada + India share", "value": "37%", "note": "Canada: soybeans, hay, canola; India: psyllium and other herbs, sesame"},
]
for g in ov["productGroups"]:
    blurb, ex = PRODUCT_GROUPS[g["heading"]]
    g["blurb"] = blurb
    g["searchExamples"] = ex
    g["label"] = LABELS[g["heading"]][0]
ov["workedExamples"] = [
    {
        "title": "A $500,000 cargo of Argentine soybeans",
        "line": "1201.90.00.05",
        "body": "Soybeans are Free at the general rate, but Argentina is one of the 60 economies in the 2026 Section 301 action, so 10% of value is "
        "added (9903.05.22): **$50,000**. Canadian soybeans with a USMCA claim pay **$0** (9903.05.93), and Ukrainian or Paraguayan soybeans, "
        "from countries outside the 60, pay nothing at all.",
    },
    {
        "title": "Vegetable seed from Canada: USMCA no longer makes it free",
        "line": "1209.91.80.70",
        "body": "Tomato seed for sowing is 1.5¢/kg, Free under USMCA, and on the Section 301 exemption list. But 1209.91.80 is on the Section "
        "338 list for Canada (U.S. note 51(b)(3), 9903.03.14), and that **50%** applies even when USMCA is claimed. On a $40,000 shipment of "
        "seed the duty is **$20,000**. The same seed from the Netherlands or Chile pays only its base rate (Chile: Free under the FTA).",
    },
    {
        "title": "5 tonnes of German hop pellets",
        "line": "1210.20.00.20",
        "body": "Hop pellets are 13.2¢/kg: 5,000 kg × $0.132 = $660. For EU goods whose base rate is under 10% of value, the 2026 Section 301 "
        "action charges **10% in total in place of the base rate** (9903.05.39). At $15/kg the lot is worth $75,000, so the duty is **$7,500**. "
        "Canadian hop pellets pay the base rate plus 50% under Section 338 (9903.03.13) plus 10% unless they qualify for USMCA.",
    },
    {
        "title": "Psyllium husk from India",
        "line": "1211.90.89.20",
        "body": "Psyllium seed husks are Free at the general rate. Indian goods pay the 10% Section 301 duty (9903.05.44): **$3,000** on a $30,000 "
        "container. Psyllium husks from Malaysia, Cambodia, Guatemala, Argentina, Bangladesh, Taiwan and Jordan are exempt when declared as "
        "such (U.S. note 52(j)), but India has no exception list.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["biggestLines"] = [
    {"hts": "1211.90", "label": "Medicinal and herbal plants, including psyllium husk"},
    {"hts": "1201.90", "label": "Soybeans, other than seed"},
    {"hts": "1209.91", "label": "Vegetable seeds for sowing"},
]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. 2025 is the latest full year."
ov["notes"]["chapterNotes"] = CHAPTER_NOTES
ov["notes"]["additionalUsNotes"] = ADDITIONAL_US_NOTES

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = f"HTS Chapter 12: {SHORT} — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 12 Tariff Updates 2025–2026: Soybeans, Seeds, Hops & Herbs | KoalaGains",
    "shortDescription": (
        "What changed for HTS Chapter 12 since January 2025: base rates on all 167 lines, the end of the IEEPA duties and the Section 122 "
        "surcharge, the 2026 Section 301 tariffs and their seed exemption, and the 50% Section 338 duty on Canadian seeds and hops, with "
        "Federal Register citations."
    ),
    "keywords": [
        "HTS Chapter 12 tariff updates",
        "soybean tariffs 2026",
        "tariffs on seeds",
        "Section 301 tariff seeds exemption",
        "Canada Section 338 seeds hops",
        "section 122 tariff on soybeans",
        "china tariff on oil seeds",
        "IEEPA tariffs agricultural imports",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). The base rates of all 161 lines that exist in both are unchanged; six lines are new "
    "statistical splits (organic and other hemp seed, oil seeds and botanicals) added on July 1, 2026, all Free.\n\n"
    "The changes came on top of the base rate. The 2025 IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 surcharge "
    "that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or "
    "12.5%**, but 74 seed and other lines are exempt. China pays up to **37.5%** and Brazil **37.5%** because other Section 301 duties stack. "
    "And since **August 22, 2026**, 42 lines from **Canada**, many of them seeds, hops and herbs, pay a **50% Section 338 duty that a "
    "USMCA claim does not remove**."
)
tu["scope"] = (
    "Measures that reach Chapter 12 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption lists, the Brazil "
    "Section 301 tariff, the China Section 301 Lists 3 and 4A, the Canada Section 338 duties, the scheduled Nicaragua tariff, the "
    "antidumping and countervailing duties on organic soybean meal from India, and the 2025–2026 IEEPA and Section 122 duties that have "
    "ended. For the rate each supplier pays, see Rates by country."
)
tu["lastCheckedAt"] = CHECKED
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "161 of 161", "note": "6 new statistical lines, all Free"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"]))},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "ca-section-301": dict(
        measure="Section 301 tariff (2026) + Section 338 duty (Canada)",
        now="+10%; +50% on 42 lines",
        exemption=(
            "USMCA-qualifying goods pay no Section 301 duty (9903.05.93). "
            + EXEMPT_TEXT
            + " Separately, 42 lines pay a 50% Section 338 duty from August 22, 2026, which applies even when USMCA is claimed (U.S. note 51(a)): "
            "hop pellets (1210.20, 9903.03.13) and, under 9903.03.14, sugar beet, white clover, beet, flower, onion and other vegetable, tree "
            "and other seeds (1209.10, 1209.22.20, 1209.29.10, 1209.30, 1209.91.40, 1209.91.80, 1209.99.20, 1209.99.41), hop cones (1210.10), "
            "mint and other herbs (1211.90.20, 1211.90.40, 1211.90.89, 1211.90.93), food seaweed (1212.21), carob (1212.92) and 1212.99.92. "
            "The September 29, 2026 import bans on Canadian goods list no Chapter 12 line. The 2025 IEEPA duty on Canada (+35%, 9903.01.10) "
            "ended February 24, 2026."
        ),
        whatItMeans=(
            "USMCA-qualifying soybeans, canola, flax, mustard and hay from Canada pay $0. Canadian vegetable or flower seed pays 50% of value with "
            "or without USMCA; non-qualifying hop pellets pay 13.2¢/kg + 60%."
        ),
        extra=["procl-11062", "eo-14389", "eo-14193", "eo-14325"],
    ),
    "in-section-301": dict(
        measure="Section 301 tariff (2026, forced-labor investigations)",
        exemption=(
            EXEMPT_TEXT + " " + SOWING_87 + " India has no country exception list in U.S. note 52(j). The extra 25% IEEPA duty tied to Russian oil "
            "ended February 7, 2026 and the IEEPA reciprocal duty February 24, 2026. Certified organic soybean meal and flour from India also "
            "owes antidumping and countervailing cash deposits (1208.10.00.10), which are not part of the tariff schedule."
        ),
        whatItMeans="Indian psyllium husk and other herbs (1211.90.89) pay 10% of value; Indian sesame pays 10%; Indian vegetable seed for sowing pays only its base rate.",
        extra=["eo-14329", "eo-14384", "eo-14389", "fr-2022-10480", "fr-2022-10481"],
    ),
    "cn-section-301": dict(
        measure="Section 301 tariffs: 2026 action plus Lists 3 and 4A (2019)",
        now="+37.5%, +25%, +20%, +12.5% or +7.5%",
        exemption=(
            "Three Section 301 duties can apply: +25% under List 3 (9903.88.03, 127 lines), +7.5% under List 4A (9903.88.15, 39 lines: peanuts, "
            "copra, palm nuts, cotton and castor seed, clover, fescue and bluegrass seed, hop pellets and a few others), and +12.5% under the 2026 "
            "action (9903.05.31) on the 93 lines not on the exemption list (9903.05.86). Sugar beet (1212.91) is on neither list. The earlier China "
            "product exclusions for melon, vegetable and flower seeds have expired. USTR continued the China actions on October 7, 2026. The "
            "IEEPA duties on China ended February 24, 2026."
        ),
        whatItMeans=(
            "Chinese seaweed, herbs and sunflower seeds pay 37.5% of value; Chinese vegetable seed for sowing pays its base rate + 25%; Chinese "
            "fescue seed pays 7.5%."
        ),
        extra=["eo-14389"],
    ),
    "ar-section-301": dict(
        measure="Section 301 tariff (2026, forced-labor investigations)",
        exemption=(
            EXEMPT_TEXT + " Argentina's exception list (U.S. note 52(j)(8), 9903.06.10) exempts seaweed not for human consumption (1212.29), and "
            "psyllium husks are exempt on declaration (9903.06.11). Argentina has the largest share of the peanut quota (43,901 t a year, "
            "Additional U.S. Note 2); over-quota peanuts pay 131.8% or 163.8% plus the 10%."
        ),
        whatItMeans="Argentine soybeans (1201.90) pay 10% of value; Argentine sunflower or vegetable seed for sowing pays only its base rate.",
        extra=["eo-14389", "hts-chapter-12"],
    ),
    "mx-section-301": dict(
        measure="Section 301 tariff (2026, forced-labor investigations)",
        exemption=(
            "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). " + EXEMPT_TEXT + " Mexican peanuts are outside the peanut quota "
            "(Additional U.S. Note 2) and enter free under USMCA. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026."
        ),
        whatItMeans="USMCA-qualifying herbs, seeds, hay and peanuts from Mexico pay $0; goods that do not qualify pay the base rate plus 10% on the 93 non-exempt lines.",
        extra=["eo-14389", "eo-14194", "hts-chapter-12"],
    ),
    "eu-section-301": dict(
        measure="Section 301 tariff (2026, forced-labor investigations), EU rate",
        exemption=(
            "For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); over-quota peanuts (131.8%, "
            "163.8%) pay their base rate only. " + EXEMPT_TEXT + " This replaced the 15% IEEPA reciprocal rate for the EU, which ended February "
            "24, 2026."
        ),
        whatItMeans="Bulgarian sunflower seeds, German hops and Dutch herbs pay 10% of value in place of the base rate; Dutch and French vegetable seed for sowing pays only its base rate.",
        extra=["eo-14389"],
    ),
    "cl-section-301": dict(
        measure="Section 301 tariff (2026, forced-labor investigations)",
        exemption=(
            "The Chile FTA (SPI CL) makes every dutiable Chapter 12 base rate Free, including over-quota peanuts, but the 12.5% still applies when "
            "the FTA is claimed (U.S. note 52(a)). " + EXEMPT_TEXT
        ),
        whatItMeans="Chilean vegetable and flower seed for sowing ($41M in 2025) pays nothing; Chilean canola or herbs pay 12.5% of value with a CL claim.",
        extra=["eo-14389"],
    ),
    "br-section-301": dict(
        measure="Section 301 tariffs: Brazil action plus 2026 forced-labor action",
        exemption=(
            "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 (9903.05.27). "
            "The Brazil exemption list (U.S. note 50(a)(ii), 9903.05.03) covers only copra and poppy seeds in Chapter 12; the 2026 exemption "
            "list (9903.05.86) covers the 74 seed and other lines, which still pay the 25%. The 2025 IEEPA duties on Brazil ended February 24, 2026."
        ),
        whatItMeans="Brazilian vegetable or grass seed for sowing pays its base rate + 25%; Brazilian herbs and other non-exempt goods pay 37.5% more.",
        extra=["eo-14389"],
    ),
    "other-section-301": dict(
        country="Other Section 301 economies (incl. Türkiye, Australia, South Korea, Egypt, Peru, Russia)",
        now="+10% or +12.5% (12.5% in total for Japan, South Korea)",
        exemption=(
            EXEMPT_TEXT + " Country exception lists in U.S. note 52(j) exempt a few more lines for some countries: palm nuts, coca leaf, African "
            "cherry bark, tonka beans, seaweed and chicory roots (Cambodia, Ecuador, Indonesia, Jordan, Guatemala, El Salvador, Taiwan, "
            "Bangladesh, Switzerland), and psyllium husk on declaration for seven of them. Countries outside the 60, such as Paraguay and "
            "Ukraine, pay no extra duty. Nicaragua is scheduled to pay a separate Section 301 duty from January 1, 2027 (9903.89.01)."
        ),
        whatItMeans="Turkish soybeans pay 12.5% of value; Korean seaweed pays 12.5% in total; Paraguayan oil seeds pay only the base rate (Free on most).",
        extra=["fr-2025-22690"],
    ),
}
for e in tu["inEffect"]:
    spec = IE[e["id"]]
    e["exemption"] = spec["exemption"]
    e["whatItMeans"] = spec["whatItMeans"]
    if "measure" in spec:
        e["measure"] = spec["measure"]
    if "now" in spec:
        e["now"] = spec["now"]
    if "country" in spec:
        e["country"] = spec["country"]
    add_sources(tu, spec.get("extra", []))
    for s in spec.get("extra", []):
        if s not in e["sourceIds"]:
            e["sourceIds"].insert(len(e["sourceIds"]) - 1, s)

# changes: rewrite generated ones, add the rest
CH = {c["id"]: c for c in tu["changes"]}
CH["base-rates"].update(
    title="No Chapter 12 base-rate changes; six new statistical lines",
    detail=(
        "Every Chapter 12 line that exists in both editions carries the same General, FTA and Column 2 rate in 2026 Revision 21 as in the 2025 "
        "Basic Edition. Six 10-digit lines are new: Revision 11 (in force July 1, 2026) split hemp seed not for sowing into certified organic "
        "(1207.99.03.65) and other (.75), other oil seeds into certified organic (.92) and other (.97), and other botanicals of 1211.90.89 into "
        "certified organic (.92) and other (.97). All are Free, as before."
    ),
    sourceIds=["hts-before", "hts-rev11", "hts-now", "hts-now-cr"],
)
add_sources(tu, ["hts-rev11"])
nic = CH["section-301-nicaragua-scheduled-2027-01-01"]
nic.update(
    date="2025-12-29",
    dateLabel="Published",
    title="Nicaragua Section 301 tariff scheduled for 2027 and 2028",
    detail=(
        "USTR set a tariff on products of Nicaragua that is 0% until the end of 2026, then +10% from January 1, 2027 and +15% from January 1, "
        "2028 (9903.89.01). It applies only to goods that do not claim a special rate such as CAFTA-DR, and it reaches all 167 Chapter 12 lines, "
        "seeds included. Nicaragua also pays the 12.5% 2026 forced-labor tariff (9903.05.58) on non-exempt lines."
    ),
    before="None",
)
CH["section-338-canada-2026-08-22"].update(
    title="Section 338 duty of 50% on 42 Canadian seed, hop and herb lines",
    detail=(
        "Proclamations of July 20, 2026 put a 50% duty on listed products of Canada; after a short suspension it took effect August 22. The "
        "lists in U.S. note 51 include hop pellets (9903.03.13) and, under 9903.03.14, most vegetable, flower, beet, white clover and tree seed "
        "for sowing, hop cones, mint, herbs and other plants of 1211.90, food seaweed, carob and 1212.99.92. The duty applies on top of the "
        "base rate and the Section 301 duty, and also to USMCA-qualifying goods (note 51(a)). Proclamation 11065 changed the 9903.03.14 list "
        "from September 15, 2026 without adding or removing a Chapter 12 line."
    ),
    before="None",
)
CH["section-301-2026-60-economies-2026-07-24"].update(
    title="Section 301 tariffs on 60 economies; seeds for sowing exempt",
    detail=(
        "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), on 93 of the 167 Chapter 12 lines. "
        + EXEMPT_TEXT
        + " "
        + SOWING_87
        + " EU goods pay 10% in total and Japan and South Korea 12.5% in total. USMCA-qualifying goods from Canada and Mexico are exempt "
        "(9903.05.93, 9903.05.94)."
    ),
    before="None",
)
CH["section-301-brazil-2026-07-22"].update(
    title="Section 301 tariff on products of Brazil",
    detail=(
        "25% on all goods of Brazil (9903.05.01). The exemption list (U.S. note 50(a)(ii), 9903.05.03) covers only copra and poppy seeds in "
        "Chapter 12, so Brazilian seeds for sowing pay the 25%. From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on the "
        "non-exempt lines."
    ),
    before="None",
)
extra_changes = [
    {
        "id": "ca-338-bans",
        "type": "reference",
        "date": "2026-09-29",
        "dateLabel": "Effective",
        "title": "Canada import bans list no Chapter 12 line",
        "detail": (
            "Proclamations of September 8, 2026 banned some Canadian alcoholic beverages, dairy products and motorcycles from September 29. The "
            "dairy ban covers whey, molasses and non-alcoholic beer, not the hop pellets on the dairy duty list, so Chapter 12 goods can still be "
            "imported; the 42 lines on the Section 338 lists keep paying 50%."
        ),
        "before": None,
        "now": None,
        "countries": "Canada",
        "sourceIds": ["procl-11062", "hts-now"],
    },
    {
        "id": "hemp-definition",
        "type": "pending",
        "date": "2026-09-02",
        "dateLabel": "Enacted",
        "title": "New federal hemp definition delayed to December 11, 2026",
        "detail": (
            "The FY2026 Agriculture appropriations law (P.L. 119-37, enacted November 12, 2025) narrows the definition of hemp to a total-THC "
            "limit of 0.3% and excludes viable seeds from a cannabis plant above that limit, which would make them marijuana under the Controlled "
            "Substances Act. A continuing resolution passed September 2, 2026 (P.L. 119-103) delays most of the new definition to December 11, "
            "2026. It affects hemp seed for sowing (1207.99.03.40); the tariff rate (Free) is unchanged."
        ),
        "before": "Hemp: ≤0.3% delta-9 THC",
        "now": "≤0.3% total THC (from December 11, 2026)",
        "countries": "All",
        "sourceIds": ["crs-if13136"],
    },
    {
        "id": "s122-end",
        "type": "extraDuty",
        "date": "2026-07-23",
        "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%",
        "now": "None",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "stat-lines",
        "type": "reference",
        "date": "2026-07-01",
        "dateLabel": "Effective",
        "title": "Organic statistical lines for hemp seed, oil seeds and botanicals",
        "detail": (
            "Revision 11 split 1207.99.03.60 (hemp seed, other) and .91 (other oil seeds) and 1211.90.89.90 (other botanicals) into certified "
            "organic and other statistical lines. The rate, Free, did not change."
        ),
        "before": "4 lines",
        "now": "6 lines",
        "countries": None,
        "sourceIds": ["hts-rev11", "hts-now"],
    },
    {
        "id": "usmca-review",
        "type": "reference",
        "date": "2026-07-01",
        "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": (
            "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution "
            "of the issues or until termination, so USMCA claims (SPI S) on Canadian and Mexican goods still apply."
        ),
        "before": None,
        "now": None,
        "countries": "Canada, Mexico",
        "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "osm-india",
        "type": "reference",
        "date": "2026-02-26",
        "dateLabel": "Published",
        "title": "Antidumping and countervailing duties on organic soybean meal from India continue",
        "detail": (
            "The 2022 orders on certified organic soybean meal from India name 1208.10.00.10 (organic soy flour and meal) as well as 2304.00. "
            "After the latest reviews (January 23 and February 26, 2026) the antidumping cash deposit is 18.80% for Tejawat Organic Foods and "
            "3.07% for all others, and countervailing rates are 3.66% to 75.48% for the reviewed firms (9.57% for all others from the order). "
            "These are collected on top of the 1.9% base rate and the 10% Section 301 duty."
        ),
        "before": None,
        "now": None,
        "countries": "India",
        "sourceIds": ["fr-2022-10480", "fr-2022-10481", "fr-2026-01218", "fr-2026-03894"],
    },
    {
        "id": "s122-start",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": (
            "10% on products of all countries (9903.03.01) until July 23, 2026. Only copra (1203.00) and poppy seeds (1207.91) were on the product "
            "exemption list (9903.03.03); soybeans, seeds for sowing, hops and herbs paid it. USMCA-qualifying goods from Canada and Mexico were "
            "exempt (9903.03.07, 9903.03.08)."
        ),
        "before": "None",
        "now": "+10% (until July 23, 2026)",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": (
            "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, "
            "Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods "
            "entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer "
            "in effect."
        ),
        "before": "Varied by country",
        "now": "None",
        "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-oil-end",
        "type": "extraDuty",
        "date": "2026-02-07",
        "dateLabel": "Effective",
        "title": "Extra 25% duty on Indian goods removed",
        "detail": (
            "Executive Order 14384 ended the additional 25% duty on products of India tied to purchases of Russian oil (9903.01.84–9903.01.89), "
            "for goods entered from February 7, 2026. India's reciprocal duty ended with the other IEEPA duties on February 24."
        ),
        "before": "+25%",
        "now": "None",
        "countries": "India",
        "sourceIds": ["eo-14384"],
    },
    {
        "id": "agoa-renewed",
        "type": "reference",
        "date": "2026-02-03",
        "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": (
            "The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) is listed on most dutiable "
            "Chapter 12 lines, including in-quota peanuts, but not on the over-quota peanut lines. GSP (SPI A, A*, A+) remains expired since "
            "December 31, 2020."
        ),
        "before": "Lapsed (from September 30, 2025)",
        "now": "In force to December 31, 2026",
        "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "cbp-gsp", "hts-now"],
    },
    {
        "id": "ag-exemption",
        "type": "reference",
        "date": "2025-11-13",
        "dateLabel": "Effective",
        "title": "Farm-goods exemption reached only copra and poppy seeds",
        "detail": (
            "The exemption list for the reciprocal duties (U.S. note 2(v)(iii)(a), heading 9903.01.32), widened for agricultural products from "
            "November 13, 2025, named only two Chapter 12 subheadings: copra (1203.00) and poppy seeds (1207.91). Soybeans, seeds, hops, herbs and "
            "hay stayed subject to the reciprocal duties until they ended on February 24, 2026."
        ),
        "before": None,
        "now": None,
        "countries": "All countries subject to the reciprocal tariff",
        "sourceIds": ["eo-14360", "hts-now"],
    },
    {
        "id": "in-oil",
        "type": "extraDuty",
        "date": "2025-08-27",
        "dateLabel": "Effective",
        "title": "Extra 25% duty on Indian goods",
        "detail": (
            "Executive Order 14329 added 25% on products of India, on top of the reciprocal duty, because India was importing Russian oil. It covered "
            "Indian psyllium, sesame and seeds. Removed February 7, 2026."
        ),
        "before": "None",
        "now": "+25% (ended)",
        "countries": "India",
        "sourceIds": ["eo-14329"],
    },
    {
        "id": "ca-amended",
        "type": "extraDuty",
        "date": "2025-07-31",
        "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%",
        "now": "+35% (ended)",
        "countries": "Canada",
        "sourceIds": ["eo-14325"],
    },
    {
        "id": "ge-rule",
        "type": "reference",
        "date": "2025-06-16",
        "dateLabel": "Effective",
        "title": "APHIS restores its pre-2020 rules for genetically engineered seed",
        "detail": (
            "A federal court vacated APHIS's 2020 biotechnology rule on December 2, 2024, and APHIS conformed 7 CFR part 340 to the earlier "
            "regulations. Importing a regulated genetically engineered organism, such as unapproved GE seed, again needs an APHIS permit or "
            "notification under those rules."
        ),
        "before": None,
        "now": None,
        "countries": "All",
        "sourceIds": ["fr-2025-10797"],
    },
    {
        "id": "reciprocal",
        "type": "extraDuty",
        "date": "2025-04-02",
        "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.",
        "before": "None",
        "now": "+10% or more (ended)",
        "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14257"],
    },
    {
        "id": "mx-imposed",
        "type": "extraDuty",
        "date": "2025-02-01",
        "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
        "before": "None",
        "now": "+25% (ended)",
        "countries": "Mexico",
        "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed",
        "type": "extraDuty",
        "date": "2025-02-01",
        "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.",
        "before": "None",
        "now": "+25% (ended)",
        "countries": "Canada",
        "sourceIds": ["eo-14193"],
    },
]
existing = {c["id"] for c in tu["changes"]}
for c in extra_changes:
    if c["id"] not in existing:
        tu["changes"].append(c)
    for s in c["sourceIds"]:
        if s in ALL_SOURCES:
            add_sources(tu, [s])
add_sources(tu, ["hts-chapter-12"])
# newest first; on equal dates keep a stable editorial order
ORDER = {"base-rates": 0}
tu["changes"].sort(key=lambda c: (c["date"], -ORDER.get(c["id"], 1)), reverse=True)

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = f"HTS Chapter 12: {SHORT} — U.S. Import Statistics"
ui["seo"] = {
    "title": "HTS Chapter 12 Import Statistics: U.S. Soybean, Seed, Herb & Hay Imports by Country | KoalaGains",
    "shortDescription": (
        "U.S. imports of oil seeds, seeds for sowing, herbs, hops and hay 2020–2025 by country, product and year: $2.67B in 2025, led by Canada, "
        "India, China and Argentina."
    ),
    "keywords": [
        "us soybean imports by country",
        "does the us import soybeans",
        "HTS Chapter 12 import statistics",
        "us seed imports",
        "hts 1201 soybeans imports",
        "alfalfa hay imports canada",
        "psyllium imports india",
    ],
}
for s in ui["stats"]:
    if s["label"] == "Largest product":
        s["note"] = "Medicinal and herbal plants, including psyllium husk (1211.90)"
ui["why"] = (
    "U.S. imports of Chapter 12 goods were **$2.67B in 2025**, down 9.1% from $2.94B in 2024 and 24% below the 2022 peak of $3.52B. Four "
    "groups make up most of it.\n\n"
    "**Seeds for sowing ($562M, 21%)**, $374M of it vegetable seed, come from Canada ($78M), the Netherlands ($71M), Chile ($41M), India "
    "($39M), France ($36M) and Denmark ($30M). **Medicinal and herbal plants ($511M)** are led by India ($152M, the line that includes "
    "psyllium husk) and Mexico ($63M).\n\n"
    "**Soybeans ($424M)** come mainly from Canada ($190M) and Argentina ($92M), with Ukraine ($50M, up from almost nothing in 2024), Russia "
    "($37M) and Türkiye ($31M) behind. **Other oil seeds ($412M)** include Paraguay's $87M of 1207.99, Canadian mustard ($57M) and Indian "
    "sesame ($40M). Canola imports fell 42% to $111M.\n\n"
    "Canada supplied **$717M (27%)** in all, down 14.8%: soybeans, hay and alfalfa ($106M), canola, flax and mustard. China ($155M, down "
    "21.6%) ships mostly 1212.99 vegetable products and herbs.\n\n"
    "These are 2025 figures, the latest full year. They were shipped under the 2025 IEEPA duties, which ended in February 2026, and before "
    "the 2026 Section 301 and Canada Section 338 duties."
)
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Duty paid is not available "
    "from an official source yet."
)
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet. UN Comtrade reports trade values, not duty paid."
ui["lastCheckedAt"] = CHECKED

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = f"HTS Chapter 12: {SHORT} — Tariff Rates by Country"
ia["seo"] = {
    "title": "HTS Chapter 12 Tariff Rates by Country: Soybeans, Seeds, Hops & Herbs from Canada, India, China | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on soybeans, canola, sesame, seeds for sowing, hops, psyllium, seaweed and hay by country: base rate plus the "
        "2026 Section 301 and Canada Section 338 duties, with USMCA, FTA and EU rules applied."
    ),
    "keywords": [
        "soybean tariff by country",
        "is there a tariff on hay from canada",
        "canola tariffs canada",
        "tariffs on seeds",
        "psyllium husk tariff",
        "korean seaweed tariff",
        "HTS Chapter 12 tariff rates by country",
    ],
}
ia["intro"] = (
    "The total rate on Chapter 12 goods depends far more on **where they come from** than on the printed rate, which is Free or a few cents per "
    "kilogram on most lines. Each cell below is the base rate for that product group plus the extra duty for that country, minus any "
    "preference, taken from the current tariff schedule.\n\n"
    "**USMCA-qualifying goods from Mexico enter free**, and so do most from Canada, except 42 Canadian seed, hop and herb lines that pay "
    "**50% under Section 338 even with USMCA**. Goods from **India and Argentina add 10%**, **EU goods pay 10%** in total, **Chile 12.5%** "
    "with its FTA, **China and Brazil up to 37.5%**. **Seeds for sowing are exempt** from the 2026 Section 301 duty, and countries outside "
    "the 60 economies, such as Paraguay and Ukraine, pay only the base rate."
)
ia["lastCheckedAt"] = CHECKED
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULES = {
    "Canada": (
        "USMCA-qualifying: free, no Section 301 duty (9903.05.93), except 42 seed, hop and herb lines that pay 50% under Section 338 (9903.03.13, "
        "9903.03.14) even with USMCA. Otherwise base rate + 10% Section 301 (9903.05.29) on the 93 non-exempt lines, plus the 50% on the listed "
        "lines. The 35% IEEPA duty ended February 24, 2026."
    ),
    "India": (
        "Base rate + 10% Section 301 (9903.05.44) on 93 of 167 lines; the 74 seed and other lines on the 9903.05.86 list pay the base rate only. "
        "The extra 25% Russian-oil duty ended February 7, 2026 and the IEEPA reciprocal duty February 24, 2026."
    ),
    "China": (
        "Base rate + 25% (List 3, 9903.88.03) or + 7.5% (List 4A, 9903.88.15), plus 12.5% (9903.05.31) on the 93 lines not on the exemption "
        "list: up to 37.5% in all. The IEEPA duties on China ended February 24, 2026."
    ),
    "Argentina": (
        "Base rate + 10% Section 301 (9903.05.22) on 92 of 167 lines; the 9903.05.86 seed lines and seaweed not for food (1212.29, note "
        "52(j)(8)) pay the base rate only. In-quota peanuts are on the 6.6¢/kg or 9.35¢/kg lines."
    ),
    "Mexico": (
        "USMCA-qualifying: free, no Section 301 duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55) on 93 of 167 lines. The "
        "25% IEEPA duty ended February 24, 2026."
    ),
    "Bulgaria": "EU rule: 10% in total in place of the base rate when the base rate is lower (9903.05.39), on 93 of 167 lines; seeds for sowing pay the base rate only. The 15% IEEPA rate for the EU ended February 24, 2026.",
    "Netherlands": "EU rule: 10% in total in place of the base rate when the base rate is lower (9903.05.39), on 93 of 167 lines; seeds for sowing pay the base rate only. The 15% IEEPA rate for the EU ended February 24, 2026.",
    "Germany": "EU rule: 10% in total in place of the base rate when the base rate is lower (9903.05.39), on 93 of 167 lines; seeds for sowing pay the base rate only. The 15% IEEPA rate for the EU ended February 24, 2026.",
    "Paraguay": "Base rate only. Paraguay is not one of the 60 economies in the 2026 Section 301 action and has no FTA with the United States. The 2025 IEEPA reciprocal duty ended February 24, 2026.",
    "Chile": "Chile FTA (CL) makes every base rate Free, but 12.5% Section 301 (9903.05.30) still applies on 93 of 167 lines; seeds for sowing pay nothing.",
    "Brazil": (
        "Base rate + 25% Section 301 (9903.05.01) on 165 of 167 lines (copra and poppy seeds exempt), plus 12.5% (9903.05.27) on the 93 "
        "non-exempt lines: up to 37.5%. The IEEPA duties on Brazil ended February 24, 2026."
    ),
    "Any other country": (
        "Countries outside the 60 economies pay only the base rate; the others pay +10% or +12.5% (9903.05.20–9903.05.84) on non-exempt lines, "
        "with country exception lists in U.S. note 52(j). Column 2 countries (Russia, Belarus, Cuba, North Korea) pay the higher Column 2 rate."
    ),
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    if c["country"] in ("Canada", "India", "Mexico", "Bulgaria", "Netherlands", "Germany", "Paraguay", "Brazil"):
        if "eo-14389" not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].insert(len(c["rule"]["sourceIds"]) - 1, "eo-14389")
    if c["country"] == "China":
        c["rule"]["sourceIds"].insert(len(c["rule"]["sourceIds"]) - 1, "eo-14389")
add_sources(ia, ["eo-14389", "procl-11062", "fr-2022-10480", "fr-2022-10481", "hts-chapter-12", "cbp-gsp", "ustr-agoa-2026", "procl-11012"])

assumptions = [a for a in ia["assumptions"] if "TODO" not in a]
assumptions += [
    "Exempt lines: the 2026 Section 301 duty does not apply to the 74 lines in U.S. note 52(b) (9903.05.86): all of heading 1209, seed soybeans, "
    "seed peanuts, copra, flaxseed, rapeseed, sunflower and cotton seed for sowing, melon seeds and poppy seeds. Castor, sesame, mustard, safflower "
    "and other 1207.99 seeds for sowing are exempt only when declared as such (9903.05.87), so their cells show the duty.",
    "Canada: the 50% Section 338 duty (U.S. note 51) is charged on its 42 listed lines on both the USMCA and non-USMCA sides; it does not apply to "
    "goods properly entered under Chapter 98 or to personal baggage. The September 29, 2026 Canadian import bans list no Chapter 12 line.",
    "Peanuts: the 6.6¢/kg and 9.35¢/kg lines apply only within the tariff-rate quota of Additional U.S. Note 2 (Argentina 43,901 t, others "
    "9,005 t a year, Mexico excluded). Over-quota peanuts (131.8%, 163.8%) can also owe the special agricultural safeguard duty of 9904.12.01–"
    "9904.12.19 when a safeguard period is in effect; it is not in the cells.",
    "Antidumping and countervailing duties are not in the cells: certified organic soybean meal and flour from India (1208.10.00.10) owes "
    "both (3.07% antidumping and 9.57% countervailing for most exporters). No federal excise tax applies to Chapter 12 goods.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge "
    "(9903.03.01) expired July 23, 2026; neither is applied.",
    "The rate is not the only gate: seeds for sowing need an APHIS phytosanitary certificate or permit and Federal Seed Act labels; soybeans, "
    "safflower and melon seeds from khapra-beetle countries such as India need a khapra-beetle declaration or treatment; cottonseed and sugarcane "
    "need APHIS permits; coca leaf and poppy straw need DEA import permits (see Documents & ways to lower duty).",
]
ia["assumptions"] = assumptions
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21 and searched every Chapter 99 note for Chapter "
    "12 codes. The Section 301 general exemption list (note 52(b), 9903.05.86) names 30 Chapter 12 provisions (74 lines); note 52(c) "
    "(9903.05.87) exempts castor, sesame, mustard, safflower and other 1207.99.03 seeds for sowing by description; the country lists in 52(j) "
    "name palm nuts, coca leaf, African cherry bark, tonka beans, seaweed and chicory roots for some countries, and psyllium husks for seven. "
    "The Brazil list (note 50(a)(ii), 9903.05.03) names copra and poppy seeds. The Canada Section 338 lists (note 51) name 1210.20 (9903.03.13) "
    "and 16 other Chapter 12 provisions (9903.03.14). China List 3 (9903.88.03) covers 127 lines and List 4A (9903.88.15) 39; the China "
    "product exclusions that named Chapter 12 seeds have expired. Chapter 99 subchapter IV (9904.12) holds the peanut safeguard."
)

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = f"HTS Chapter 12: {SHORT} — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Seeds, Soybeans, Hops & Herbs: APHIS, Federal Seed Act & FDA Rules, Ways to Lower Duty (HTS Ch. 12) | KoalaGains",
    "shortDescription": (
        "The permits, certificates and rules for each HTS Chapter 12 line (APHIS plants-for-planting and khapra beetle rules, Federal Seed Act, "
        "FDA prior notice, USDA organic and peanut rules, DEA and CITES) and the legal ways to pay less: USMCA, FTA claims, the seed exemption, "
        "the peanut quota, Chapter 98 and drawback."
    ),
    "keywords": [
        "importing seeds into the us",
        "can i import seeds into the us",
        "APHIS seed import permit",
        "Federal Seed Act imported seed",
        "khapra beetle soybeans",
        "importing hemp seeds",
        "NOP import certificate",
        "peanut tariff rate quota",
    ],
}
te["intro"] = (
    "For Chapter 12 the paperwork depends on whether the goods will be **planted, eaten or fed**. Seed for sowing goes through USDA APHIS "
    "plants-for-planting rules and the Federal Seed Act. Soybeans, oil seeds, herbs, seaweed and hay for food or feed need FDA prior notice, a "
    "registered foreign facility and an importer with a Foreign Supplier Verification Program. Some goods add their own gate: khapra-beetle "
    "declarations for soybeans and safflower from countries such as India, APHIS permits for cottonseed and sugarcane, USDA quality rules for "
    "peanuts, DEA permits for coca leaf and poppy straw, CITES papers for ginseng.\n\n"
    "The ways to pay less are written into the schedule: claim **USMCA** or another **FTA**, enter genuine **seed for sowing** under the "
    "exempt lines, bring peanuts in **within the quota**, use a **Chapter 98** provision when the purpose fits, or claim **drawback** on goods "
    "that are exported. None of them removes the 50% Section 338 duty on Canadian seed, hops and herbs."
)
te["lastCheckedAt"] = CHECKED
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Canada or Mexico",
        "saves": "The Section 301 duty (10% of value) plus any base rate, such as 0.58¢/kg on canola, 13.2¢/kg on hops or 131.8% on over-quota peanuts",
        "appliesTo": "All 167 lines, for goods that qualify as originating under USMCA. On the 42 Canadian Section 338 lines it removes only the base rate and the 10%, not the 50%.",
        "document": "A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice or another document, and CBP can ask for it.",
        "caveat": "Claiming without a valid certification exposes the entry to the 10% Section 301 duty plus penalties. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS 9903.05.93 / 9903.05.94; U.S. note 51(a)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": common["ustr-usmca-review"]["url"]},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA or AGOA rate on the base duty",
        "saves": "The base rate: Free instead of up to 163.8% (over-quota peanuts in the shell), 13.2¢/kg (hops) or 6% (frozen herbs). The Section 301 duty for the country still applies.",
        "appliesTo": "The 85 dutiable lines, for goods originating in an FTA partner (for example Chile, Peru, Colombia, Australia, South Korea, Israel, CAFTA-DR countries) or an AGOA country",
        "document": "The origin documentation the agreement requires, with the special program indicator (CL, PE, CO, AU, KR, IL, P, D …) on the entry.",
        "caveat": "FTA and AGOA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)). AGOA does not cover over-quota peanuts. GSP (A, A*, A+) has been expired since December 31, 2020. AGOA runs through December 31, 2026.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": HTS21},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status (August 6, 2026)", "url": common["cbp-gsp"]["url"]},
            {"label": "USTR: AGOA reauthorization (February 3, 2026)", "url": common["ustr-agoa-2026"]["url"]},
        ],
    },
    {
        "id": "seed",
        "title": "Enter genuine seed for sowing under the seed lines, and declare it",
        "saves": "The 2026 Section 301 duty (10% or 12.5% of value, or the EU's 10% in place of the base rate) for the 60 economies",
        "appliesTo": "All of heading 1209 and the sowing lines of soybeans, peanuts, flax, rapeseed, sunflower and cotton seed (9903.05.86); castor, sesame, mustard, safflower and other 1207.99 seeds (including hemp) for sowing when declared (9903.05.87)",
        "document": "The APHIS phytosanitary certificate or permit and the Federal Seed Act declaration and container labels (see the rules below); for 9903.05.87, the entry declares the seed is for sowing.",
        "caveat": "Only seed really used for sowing qualifies. China (List 3 or 4A), Brazil (25%) and, for 42 Canadian lines, Section 338 (50%) still charge their duties on seed.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)–(c) (9903.05.86, 9903.05.87)", "url": CH99},
            {"label": "HTSUS Chapter 12, Note 3", "url": CH12},
        ],
    },
    {
        "id": "peanut-quota",
        "title": "Bring peanuts in within the tariff-rate quota",
        "saves": "The over-quota rate: 6.6¢/kg instead of 131.8% (shelled, seed), or 9.35¢/kg instead of 163.8% (in shell), and any safeguard duty",
        "appliesTo": "Peanuts of heading 1202 from countries without a free FTA rate, such as Argentina (43,901 t a year) and other countries (9,005 t), April 1 to March 31",
        "document": "An entry under the in-quota subheading (1202.30.40, 1202.41.40, 1202.42.15 or 1202.42.60); CBP fixes quota priority when the entry summary is presented.",
        "caveat": "The quota fills on a first-come basis by entry time; once it is full, further peanuts pay the over-quota rate. Peanuts for human consumption must also meet USDA quality and aflatoxin standards.",
        "citations": [
            {"label": "HTSUS Chapter 12, Additional U.S. Note 2", "url": CH12},
            {"label": "19 CFR 132.11", "url": ecfr(19, "132.11")},
            {"label": "HTSUS 9904.12.01–9904.12.19 (peanut safeguard)", "url": CH99},
        ],
    },
    {
        "id": "ch98",
        "title": "Use a Chapter 98 provision when the purpose fits",
        "saves": "The base rate, the 2026 Section 301 duty and the Canada Section 338 duty: each provision below is Free in the schedule",
        "appliesTo": "Goods imported for a specific purpose, whatever their Chapter 12 line",
        "document": "Evidence of the qualifying purpose: proof of U.S. origin and export for returned goods (19 CFR 10.1), or a bond for samples and test lots.",
        "caveat": "The 2026 Section 301 duties (9903.05.20–9903.05.84) and the Section 338 duties do not apply to goods properly entered under a Chapter 98 provision, except entries under 9802.00.40–9802.00.80 (U.S. notes 51(a), 52(a)). The entry must qualify, so get CBP's agreement (or a ruling) before relying on it.",
        "provisions": [
            {"code": "9801.00.10", "rate": "Free", "text": "U.S. goods returned after export without being advanced in value or improved in condition, for example a rejected soybean or seed cargo"},
            {"code": "9813.00.20", "rate": "Free, under bond", "text": "Samples solely for use in taking orders"},
            {"code": "9813.00.30", "rate": "Free, under bond", "text": "Articles solely for testing, experimental or review purposes, for example a trial lot of seed or hops"},
        ],
        "citations": [
            {"label": "HTSUS chapter 98", "url": HTS21},
            {"label": "19 CFR 10.1", "url": ecfr(19, "10.1")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 51(a) and 52(a)", "url": CH99},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on goods that are exported",
        "saves": "Up to 99% of the duties, taxes and fees paid on imported goods that are later exported or destroyed, or on substituted goods of the same 8-digit line",
        "appliesTo": "Any line, for importers or processors (crushers, seed companies, brewers) that also export",
        "document": "A drawback claim filed electronically with CBP, with import and export records linking the two; for substitution, records showing the exported goods are classifiable under the same 8-digit subheading.",
        "caveat": "Drawback has strict time limits (5 years from import) and record-keeping rules. Check with CBP which Chapter 99 duties are refundable for your claim.",
        "citations": [
            {"label": "19 CFR part 190", "url": ecfr_part(19, 190)},
            {"label": "19 CFR 190.32 (substitution unused merchandise drawback)", "url": ecfr(19, "190.32")},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty: a ruling fixes the classification (seed for sowing or oil stock, raw or processed herb, Chapter 12 or a preparation of Chapter 20 or 21) before the goods arrive",
        "appliesTo": "Any line where the classification decides the rate or the exemption",
        "document": "A ruling request to CBP describing the goods, their processing and their intended use. Questions about whether goods fall inside an antidumping order go to Commerce as a scope ruling.",
        "caveat": "Rulings apply to the transaction described; a different shipment may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "19 CFR 351.225 (scope rulings)", "url": ecfr(19, "351.225")},
        ],
    },
]
te["rules"] = [
    {"id": "fda-prior-notice", "agency": "FDA", "title": "Prior notice of imported food and animal feed: file before the goods arrive", "citations": [{"label": "21 CFR 1.279", "url": ecfr(21, "1.279")}, {"label": "21 CFR 1.281", "url": ecfr(21, "1.281")}]},
    {"id": "fda-registration", "agency": "FDA", "title": "Food facility registration for foreign processors, packers and warehouses that handle the goods (farms are exempt)", "citations": [{"label": "21 CFR 1.225", "url": ecfr(21, "1.225")}, {"label": "21 CFR 1.226", "url": ecfr(21, "1.226")}]},
    {"id": "fda-fsvp", "agency": "FDA", "title": "Foreign Supplier Verification Program: the U.S. importer must verify each foreign supplier of food or feed", "citations": [{"label": "21 CFR 1.502", "url": ecfr(21, "1.502")}]},
    {
        "id": "aphis-seed",
        "agency": "USDA APHIS",
        "title": "Seed for planting: phytosanitary certificate naming the genus (or an APHIS permit for small lots), port inspection, and the restrictions on specific plant types",
        "citations": [{"label": "7 CFR 319.37-5", "url": ecfr(7, "319.37-5")}, {"label": "7 CFR 319.37-6", "url": ecfr(7, "319.37-6")}, {"label": "7 CFR 319.37-20", "url": ecfr(7, "319.37-20")}],
    },
    {
        "id": "fsa-seed",
        "agency": "USDA APHIS (Federal Seed Act)",
        "title": "Imported agricultural and vegetable seed: importer's declaration of kind, variety, origin and use, labels on each container, noxious-weed seed limits; coated or pelleted seed needs a sample drawn before coating",
        "citations": [{"label": "7 CFR 361.2", "url": ecfr(7, "361.2")}, {"label": "7 CFR 361.3", "url": ecfr(7, "361.3")}, {"label": "7 CFR 361.6", "url": ecfr(7, "361.6")}],
    },
    {
        "id": "aphis-ge",
        "agency": "USDA APHIS",
        "title": "Genetically engineered seed or plants that are regulated articles: APHIS permit or notification before import (pre-2020 rules restored June 16, 2025)",
        "citations": [{"label": "7 CFR 340.4", "url": ecfr(7, "340.4")}, {"label": "90 FR 25123 (June 16, 2025)", "url": NEW_SOURCES["fr-2025-10797"]["url"]}],
    },
    {
        "id": "aphis-khapra",
        "agency": "USDA APHIS",
        "title": "Khapra-beetle countries (including India): soybeans and safflower seeds need a phytosanitary certificate declaring the shipment inspected and found free of khapra beetle and may not come in passenger baggage; melon and other cucurbit seeds not for planting (over 2 ounces) must be treated",
        "citations": [{"label": "7 CFR 319.75-2", "url": ecfr(7, "319.75-2")}, {"label": "7 CFR 319.75-4", "url": ecfr(7, "319.75-4")}, {"label": "7 CFR 319.75-9", "url": ecfr(7, "319.75-9")}],
    },
    {
        "id": "aphis-cotton",
        "agency": "USDA APHIS",
        "title": "Cottonseed and cottonseed hulls: import prohibited unless under an APHIS permit and the cotton regulations (pink bollworm)",
        "citations": [{"label": "7 CFR 319.8", "url": ecfr(7, "319.8")}, {"label": "7 CFR 319.8-2", "url": ecfr(7, "319.8-2")}],
    },
    {
        "id": "aphis-sugarcane",
        "agency": "USDA APHIS",
        "title": "Sugarcane, including cuttings, canes, leaves and bagasse: prohibited from all foreign countries except under a controlled import permit",
        "citations": [{"label": "7 CFR 319.15", "url": ecfr(7, "319.15")}],
    },
    {
        "id": "aphis-straw",
        "agency": "USDA APHIS",
        "title": "Rice straw and hulls need an APHIS permit and inspection; straw of wheat and other Karnal-bunt hosts is restricted",
        "citations": [{"label": "7 CFR 319.55", "url": ecfr(7, "319.55")}, {"label": "7 CFR 319.59-4", "url": ecfr(7, "319.59-4")}],
    },
    {
        "id": "aphis-hay",
        "agency": "USDA APHIS (Veterinary Services)",
        "title": "Hay and straw: free entry only from regions free of foot-and-mouth disease; otherwise held in quarantine for at least 90 days or treated",
        "citations": [{"label": "9 CFR 95.32", "url": ecfr(9, "95.32")}, {"label": "9 CFR 95.33", "url": ecfr(9, "95.33")}],
    },
    {
        "id": "ams-peanuts",
        "agency": "USDA AMS",
        "title": "Imported peanuts: entry data to CBP before arrival, then inspection and a negative aflatoxin certificate before use for human consumption",
        "citations": [{"label": "7 CFR 996.60", "url": ecfr(7, "996.60")}, {"label": "7 CFR 996.31", "url": ecfr(7, "996.31")}],
    },
    {
        "id": "ams-organic",
        "agency": "USDA AMS (National Organic Program)",
        "title": "Certified organic lines: each shipment needs NOP Import Certificate data entered in CBP's ACE and organic marking on the import documents",
        "citations": [{"label": "7 CFR 205.273", "url": ecfr(7, "205.273")}],
    },
    {
        "id": "dea-controlled",
        "agency": "DEA",
        "title": "Coca leaf and opium poppy straw are Schedule II controlled substances: DEA registration and an import permit before shipment",
        "citations": [{"label": "21 CFR 1312.11", "url": ecfr(21, "1312.11")}, {"label": "21 CFR 1308.12", "url": ecfr(21, "1308.12")}],
    },
    {
        "id": "hemp-seed",
        "agency": "USDA / DEA",
        "title": "Hemp seed: must be hemp (no more than 0.3% THC) to stay outside the Controlled Substances Act; from December 11, 2026 viable seed above 0.3% total THC is excluded from hemp. Seed for sowing also follows the APHIS seed rules",
        "citations": [{"label": "7 U.S.C. 1639o", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title7/html/USCODE-2024-title7-chap38-subchapVII-sec1639o.htm"}, {"label": "CRS IF13136 (September 28, 2026)", "url": NEW_SOURCES["crs-if13136"]["url"]}],
    },
    {
        "id": "fda-ephedra",
        "agency": "FDA",
        "title": "Ephedra: dietary supplements containing ephedrine alkaloids are adulterated and may not be sold",
        "citations": [{"label": "21 CFR 119.1", "url": ecfr(21, "119.1")}],
    },
    {
        "id": "fws-cites",
        "agency": "U.S. Fish and Wildlife Service (CITES)",
        "title": "CITES-listed plants: American ginseng roots are in Appendix II and need CITES documents; check other botanicals against the CITES appendices before shipping",
        "citations": [{"label": "50 CFR 23.68", "url": ecfr(50, "23.68")}, {"label": "50 CFR 23.20", "url": ecfr(50, "23.20")}, {"label": "50 CFR 23.91", "url": ecfr(50, "23.91")}],
    },
    {
        "id": "adcvd-osm",
        "agency": "Commerce (ITA) / CBP",
        "title": "Antidumping and countervailing duties on certified organic soybean meal from India: cash deposits at entry (3.07% AD and 9.57% CVD for most exporters)",
        "citations": [{"label": "87 FR 29737 (AD order)", "url": NEW_SOURCES["fr-2022-10480"]["url"]}, {"label": "87 FR 29735 (CVD order)", "url": NEW_SOURCES["fr-2022-10481"]["url"]}, {"label": "91 FR 2905 (2026 AD review)", "url": NEW_SOURCES["fr-2026-01218"]["url"]}],
    },
]
FOOD = ["fda-prior-notice", "fda-registration", "fda-fsvp"]
GROUP_RULES = {
    "1201": (FOOD + ["aphis-seed", "fsa-seed", "aphis-ge", "aphis-khapra", "ams-organic"], "Seed soybeans (1201.10) follow the APHIS seed and Federal Seed Act rules; soybeans for crushing or food follow the FDA rules. Soybeans from khapra-beetle countries need the khapra declaration either way."),
    "1202": (FOOD + ["aphis-seed", "fsa-seed", "ams-peanuts"], "Seed peanuts follow the seed rules; other peanuts the FDA rules and the USDA quality and aflatoxin standards. The quota of Additional U.S. Note 2 decides the rate."),
    "1203": (FOOD, "Copra follows the FDA food and feed rules."),
    "1204": (FOOD + ["aphis-seed", "fsa-seed", "ams-organic"], "Flaxseed for sowing (1204.00.00.10) follows the seed rules; flax for oil or food the FDA rules."),
    "1205": (FOOD + ["aphis-seed", "fsa-seed", "aphis-ge"], "Canola and rapeseed for sowing follow the seed rules and, for regulated GE varieties, 7 CFR part 340; seed for crushing follows the FDA rules."),
    "1206": (FOOD + ["aphis-seed", "fsa-seed", "ams-organic"], "Sunflower seed for sowing (1206.00.00.31) follows the seed rules; snack and oil-stock seeds the FDA rules."),
    "1207": (FOOD + ["aphis-seed", "fsa-seed", "aphis-khapra", "aphis-cotton", "hemp-seed", "ams-organic"], "Cottonseed needs an APHIS permit; safflower and melon seeds from khapra-beetle countries need the khapra declaration or treatment; hemp seed must meet the hemp THC limit."),
    "1208": (FOOD + ["ams-organic", "adcvd-osm"], "Oilseed flours follow the FDA rules. Certified organic soy flour and meal from India owes antidumping and countervailing deposits."),
    "1209": (["aphis-seed", "fsa-seed", "aphis-ge"], "Every line is seed for sowing: phytosanitary certificate or permit, Federal Seed Act declaration and labels, and the 7 CFR 319.37-20 restrictions for specific plant types. No FDA prior notice for seed that is only for planting."),
    "1210": (FOOD, "Hops for brewing follow the FDA food rules."),
    "1211": (FOOD + ["aphis-seed", "dea-controlled", "fda-ephedra", "fws-cites", "ams-organic"], "Herbs, psyllium and ginseng for food or supplements follow the FDA rules; coca leaf and poppy straw need DEA permits; ginseng roots need CITES documents; ephedra cannot go into dietary supplements."),
    "1212": (FOOD + ["aphis-sugarcane"], "Seaweed, carob and kernels follow the FDA rules; sugarcane is prohibited except under an APHIS controlled import permit."),
    "1213": (["aphis-straw", "aphis-hay"], "Straw must come from a foot-and-mouth-free region or be quarantined or treated; rice straw and hulls need an APHIS permit."),
    "1214": (FOOD + ["aphis-hay"], "Hay, alfalfa and forage are animal feed: FDA prior notice and FSVP apply, and hay from foot-and-mouth disease regions is quarantined or treated."),
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]

SOWING_10 = {"1204.00.00.10", "1205.10.00.10", "1205.90.00.10", "1206.00.00.31", "1207.99.03.40"}
SEED_8 = ("1201.10", "1202.30", "1207.21")
ORGANIC_DESC = "Certified organic"
EXEMPT_PREFIX = ("1209", "1201.10", "1202.30", "1203", "1204.00.00.10", "1205.10.00.10", "1205.90.00.10", "1206.00.00.31", "1207.21", "1207.70", "1207.91")
SOW87 = ("1207.30", "1207.40", "1207.50", "1207.60", "1207.99")
for ln in te["lines"]:
    h, hts = ln["heading"], ln["hts"]
    is_seed = h == "1209" or hts in SOWING_10 or hts.startswith(SEED_8)
    rules = []
    if not is_seed or h in ("1202",):
        rules += FOOD if h not in ("1213",) else []
    if is_seed:
        rules += ["aphis-seed", "fsa-seed"]
    if h == "1201":
        rules += ["aphis-khapra"] + (["aphis-ge"] if is_seed else [])
    if h == "1202" and not is_seed:
        rules += ["ams-peanuts"]
    if h == "1205" and is_seed:
        rules += ["aphis-ge"]
    if hts.startswith(("1207.21", "1207.29")):
        rules += ["aphis-cotton"]
    if hts.startswith(("1207.60", "1207.70")):
        rules += ["aphis-khapra"]
    if hts.startswith("1207.99.03.4") or hts.startswith("1207.99.03.6") or hts.startswith("1207.99.03.7"):
        rules += ["hemp-seed"]
    if h == "1208" and hts.startswith("1208.10.00.10"):
        rules += ["adcvd-osm"]
    if hts.startswith(("1211.30", "1211.40")):
        rules = ["dea-controlled"]
    if hts.startswith("1211.50"):
        rules += ["fda-ephedra"]
    if hts.startswith("1211.20"):
        rules += ["fws-cites"]
    if hts.startswith("1211.60"):
        rules += ["fws-cites"]
    if hts.startswith("1212.93"):
        rules = ["aphis-sugarcane"]
    if h == "1213":
        rules = ["aphis-straw", "aphis-hay"]
    if hts.startswith("1214.90"):
        rules += ["aphis-hay"]
    if ln["description"] == ORGANIC_DESC:
        rules += ["ams-organic"]
    seen = []
    for r in rules:
        if r not in seen:
            seen.append(r)
    ln["ruleIds"] = seen
    levers = ["usmca", "fta"] if ln["general"] not in ("Free", None) else ["usmca"]
    if is_seed or hts.startswith(SOW87):
        levers.append("seed")
    if h == "1202" and not hts.startswith("1202.30.05") and not hts.startswith(("1202.41.05", "1202.42.10", "1202.42.50")):
        levers.append("peanut-quota")
    levers += ["ch98", "drawback", "ruling"]
    ln["leverIds"] = [x for i, x in enumerate(levers) if x not in levers[:i]]
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations, not legal advice. Pest, disease and seed restrictions change with "
    "conditions in the country of origin; check APHIS, FDA and AMS before each shipment."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = f"HTS Chapter 12: {SHORT} — Tariff FAQ"
fc["seo"] = {
    "title": "Soybean, Seed, Hops & Psyllium Tariffs FAQ: HS Codes, Canada & India Rates (HTS Ch. 12) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about Chapter 12 tariffs: is there a tariff on soybeans, does the U.S. import soybeans, HS codes for "
        "soybeans, seeds, sesame, hemp seed, hops, psyllium, ginseng and seaweed, tariffs on seeds and hay from Canada, and how to import seeds."
    ),
    "keywords": [
        "us tariff on soybeans",
        "is there a tariff on soybeans",
        "does the us import soybeans",
        "soybeans hs code",
        "can i import seeds into the us",
        "hs code for seeds",
        "tariffs on seeds",
        "hemp seed hs code",
        "sesame seeds hs code",
        "hops hs code",
        "psyllium husk hs code",
        "ginseng hs code",
        "seaweed tariff",
        "is there a tariff on hay from canada",
        "peanut tariff code",
    ],
}
fc["intro"] = (
    "Straight answers to the most common questions about importing oil seeds, seeds for sowing, herbs, hops and hay into the U.S.: tariffs by "
    "country, HS codes and entry requirements. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Most Chapter 12 goods are Free or a few cents per kilogram at the general rate; raw peanuts over the quota (131.8%, 163.8% in the shell) are the exception.",
    "The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: +10% for India and Argentina, 10% in total for the EU, 12.5% for Chile, up to 37.5% for China and Brazil. Seeds for sowing (74 lines) are exempt.",
    "USMCA-qualifying goods from Canada and Mexico enter free, except 42 Canadian lines, mostly vegetable and flower seed, hops and herbs, which pay a 50% Section 338 duty since August 22, 2026 even with USMCA.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "soybean-tariff",
        "question": "Is there a U.S. tariff on soybeans?",
        "searchedAs": ["us tariff on soybeans", "is there a tariff on soybeans", "tariff on soybeans", "soybean tariffs"],
        "answer": (
            "The base rate on soybeans (1201) is Free. Since July 24, 2026 soybeans other than seed from 60 economies pay a Section 301 tariff: 10% "
            "for Argentina, 12.5% for Türkiye, 10% in total for the EU and 37.5% for China and Brazil. Seed soybeans (1201.10) are exempt. USMCA-"
            "qualifying soybeans from Canada pay nothing, and soybeans from countries outside the 60, such as Ukraine and Paraguay, pay nothing. "
            "China's own tariffs on U.S. soybean exports are a separate question."
        ),
        "link": "industry-areas",
    },
    {
        "id": "soybean-imports",
        "question": "Does the U.S. import soybeans, and from where?",
        "searchedAs": ["does the us import soybeans", "us soybean imports", "us soybean imports by country", "how much soybean does us import", "does the us import soybeans from brazil"],
        "answer": (
            "Yes, a small amount for a major exporter: $424M of soybeans in 2025, $411M of it for crushing or food. Canada supplied $190M, Argentina "
            "$92M, Ukraine $50M, Russia $37M and Türkiye $31M. Brazil shipped none in 2025, and China $2.2M."
        ),
        "link": "understand-industry",
    },
    {
        "id": "hs-soybeans",
        "question": "What is the HS code for soybeans?",
        "searchedAs": ["soybeans hs code", "hs code for soybeans", "hs code 1201", "hs code 1201.90", "soybeans hts code"],
        "answer": (
            "Heading 1201. Seed soybeans are 1201.10.00.00; other soybeans are 1201.90.00, split into oil stock (.05), certified organic (.10) and "
            "other (.90). All are Free at the general rate. Soy flour is 1208.10, soybean oil 1507 and soybean meal 2304, outside this heading."
        ),
        "link": "",
    },
    {
        "id": "import-seeds",
        "question": "Can I import seeds into the U.S.?",
        "searchedAs": ["importing seeds into the us", "can i import seeds into the us", "bringing seeds into the us", "can i bring seeds to usa"],
        "answer": (
            "Yes, if they meet USDA rules. Seed for planting needs a phytosanitary certificate from the exporting country that names the genus, or "
            "an APHIS permit for small lots of up to 50 packets (7 CFR 319.37-5, 319.37-6), and some plant types are restricted (319.37-20). "
            "Agricultural and vegetable seed also needs the importer's Federal Seed Act declaration and labels on each container (7 CFR 361.3). "
            "Regulated genetically engineered seed needs an APHIS permit or notification."
        ),
        "link": "tariff-engineering",
    },
    {
        "id": "hs-seeds",
        "question": "What is the HS code for seeds for sowing and vegetable seeds?",
        "searchedAs": ["hs code for seeds", "vegetable seeds hs code", "seeds for sowing h.s code", "hs code 1209", "hs code 1209.91"],
        "answer": (
            "Heading 1209 covers seeds of a kind used for sowing: sugar beet (1209.10), forage and grass seed such as alfalfa, clover, fescue, "
            "bluegrass and ryegrass (1209.21–1209.29), flower seed (1209.30), vegetable seed (1209.91) and tree and other seed (1209.99). Seed of "
            "cereals, beans and oil seeds stays in its own heading (Chapter 12 Note 3), for example seed soybeans in 1201.10."
        ),
        "link": "",
    },
    {
        "id": "seed-tariffs",
        "question": "Are there tariffs on imported seeds?",
        "searchedAs": ["tariffs on seeds", "tariff on seeds"],
        "answer": (
            "Base rates on seed for sowing run from Free to 5.9¢/kg (cauliflower). All 60 lines of heading 1209 are exempt from the 2026 Section 301 "
            "tariff, but Chinese seed still pays 25% or 7.5% under the older China lists, Brazilian seed 25%, and 42 Canadian lines, including most "
            "vegetable and flower seed, pay 50% under Section 338 even with a USMCA claim. Seed from the Netherlands, Chile, India or France pays "
            "only the base rate."
        ),
        "link": "industry-areas",
    },
    {
        "id": "hemp-seed",
        "question": "What is the HS code for hemp seed?",
        "searchedAs": ["hemp seed hs code", "hulled hemp seed hs code", "hemp hs code"],
        "answer": (
            "1207.99.03: hemp seed for sowing is 1207.99.03.40, and other hemp seed is certified organic (1207.99.03.65) or other (1207.99.03.75). "
            "All are Free. CBP has classified hulled hemp seeds in the same subheading (ruling N319371, 2021). Hemp seed oil is not in Chapter 12. "
            "From December 11, 2026 viable seed above 0.3% total THC no longer counts as hemp."
        ),
        "link": "",
    },
    {
        "id": "sesame",
        "question": "What is the HS code and tariff for sesame seeds?",
        "searchedAs": ["sesame seeds hs code", "hulled sesame seeds hs code", "hs code 1207.40", "white sesame seeds hs code"],
        "answer": (
            "1207.40.00, split into certified organic (.10) and other (.90). The general rate is Free. Sesame from India pays the 10% Section 301 "
            "duty (9903.05.44) and from China 37.5%; sesame entered and declared for sowing is exempt (9903.05.87). India shipped $40M of sesame in 2025."
        ),
        "link": "",
    },
    {
        "id": "hops",
        "question": "What is the HS code and tariff for hops?",
        "searchedAs": ["hops hs code", "hops pellets hs code"],
        "answer": (
            "Hop cones are 1210.10 and hop pellets, ground hops and lupulin 1210.20, both 13.2¢/kg. German and other EU hops pay 10% of value in "
            "total (9903.05.39). Canadian hops pay an extra 50% under Section 338 (9903.03.13 for pellets, 9903.03.14 for cones), even with USMCA. "
            "Hop extract is not in Chapter 12."
        ),
        "link": "industry-areas",
    },
    {
        "id": "psyllium",
        "question": "What is the HS code and tariff for psyllium husk?",
        "searchedAs": ["psyllium husk hs code", "isabgol husk hs code", "psyllium husk tariff", "psyllium husk tariff code"],
        "answer": (
            "Psyllium seed husks are 1211.90.89.20, Free at the general rate. Psyllium from India pays the 10% Section 301 duty (9903.05.44). "
            "Psyllium husks from Malaysia, Cambodia, Guatemala, Argentina, Bangladesh, Taiwan and Jordan are exempt when declared as such (U.S. note "
            "52(j)). India shipped $152M of 1211.90 herbs and plants in 2025."
        ),
        "link": "industry-areas",
    },
    {
        "id": "ginseng",
        "question": "What is the HS code for ginseng root?",
        "searchedAs": ["ginseng hs code", "ginseng root hs code", "american ginseng hs code", "ginseng tariffs"],
        "answer": (
            "Fresh or dried ginseng roots are 1211.20.10 (cultivated .20, wild .90), Free; chilled or frozen roots are 1211.20.15, 6%. Chinese "
            "ginseng roots pay 37.5% more (List 3 plus the 2026 action). American ginseng roots are in CITES Appendix II and need CITES documents "
            "(50 CFR 23.68). Ginseng extracts, teas and capsules are classified elsewhere."
        ),
        "link": "tariff-engineering",
    },
    {
        "id": "seaweed",
        "question": "What is the HS code and tariff for seaweed?",
        "searchedAs": ["seaweed hs code", "dried seaweed hs code", "seaweed tariff", "korean seaweed tariff"],
        "answer": (
            "Seaweed fit for human consumption is 1212.21.00 and other seaweed 1212.29.00, both Free. Korean seaweed pays 12.5% in total under the "
            "2026 Section 301 action (9903.05.71); Chinese seaweed 37.5%; Japanese 12.5% in total. Canadian food seaweed pays 50% under Section 338. "
            "Seaweed that has been prepared or seasoned may fall in Chapter 20 or 21 instead."
        ),
        "link": "industry-areas",
    },
    {
        "id": "hay-canada",
        "question": "Is there a tariff on hay from Canada?",
        "searchedAs": ["is there a tariff on hay from canada", "tariffs on hay", "alfalfa hay hs code", "timothy hay hs code"],
        "answer": (
            "Not if it qualifies for USMCA. Hay (1214.90, with alfalfa .10, timothy .18 and other .25) is Free, and alfalfa meal and pellets "
            "(1214.10) are 1.4%, Free under USMCA. Hay that does not qualify pays 10% (9903.05.29), or 11.4% for alfalfa meal and pellets. Hay is "
            "not on the Section 338 lists. Canada shipped $106M of hay and forage in 2025."
        ),
        "link": "industry-areas",
    },
    {
        "id": "peanuts",
        "question": "What is the tariff on raw peanuts?",
        "searchedAs": ["peanut tariff", "peanut tariff code", "peanuts hs code", "groundnut hs code"],
        "answer": (
            "Raw peanuts are heading 1202 and have a tariff-rate quota: within it 6.6¢/kg (shelled or seed) or 9.35¢/kg (in shell); above it 131.8% "
            "or 163.8%, plus a possible safeguard duty. The yearly quota from April 1 is 43,901 t for Argentina and 9,005 t for other countries. "
            "Mexican and FTA-partner peanuts are Free. Roasted peanuts and peanut butter are in Chapter 20."
        ),
        "link": "",
    },
    {
        "id": "canola",
        "question": "Are there U.S. tariffs on canola from Canada?",
        "searchedAs": ["canola tariffs canada", "canola hs code", "canola tariffs"],
        "answer": (
            "Canola is 1205.10, 0.58¢/kg, which USMCA makes Free, and USMCA-qualifying canola pays no Section 301 duty (9903.05.93). Canola that does "
            "not qualify pays 0.58¢/kg plus 10% of value (9903.05.29). Canola is not on the Section 338 lists. Canada shipped $91M of canola seed in "
            "2025; China's tariffs on Canadian canola are a separate matter."
        ),
        "link": "industry-areas",
    },
]

d["asOf"] = CHECKED
json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
