"""Fill every writer TODO in the Chapter 23 content file."""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FILLS  # noqa: E402,F401

import json, sys

sys.path.insert(0, FILLS + "/23")
from fill_te import fill_te
from fill_main import fill_main

TITLE = "Food Industry Residues and Prepared Animal Feed"
P = sys.argv[1]
d = json.load(open(P))

# ---------------------------------------------------------------- shared
WHAT = {
    "ca-section-301": "USMCA-qualifying canola meal, soybean meal and pet food from Canada pay $0. Goods that don't qualify pay their base rate plus 10% of value: on a $350,000 shipment of canola meal that is $35,000 more. Canada shipped $1.82B of Chapter 23 goods in 2025, $1.0B of it canola and other oilcake.",
    "th-section-301": "Thai pet food has a Free base rate, so the whole bill is the Section 301 duty: 12.5% of value, or $10,000 on an $80,000 container of canned cat food. Thailand was the No. 2 supplier in 2025 ($1.04B, almost all pet food and feed preparations).",
    "id-section-301": "Indonesian pet food and feed pay 10% of value on top of the base rate; copra cake (2306.50) pays only its base rate. Indonesia shipped $227M in 2025, nearly all of it heading 2309.",
    "mx-section-301": "USMCA-qualifying Mexican pet food and feed enter free, including milk-based feed (9823.05.01). Goods that don't qualify pay the base rate plus 10% of value.",
    "cn-section-301": "Chinese dog and cat food pays 37.5% of value (25% List 3 + 12.5%), and List 4A lines pay 20% plus their base rate. Feed-grade lysine also owes antidumping and countervailing cash deposits. Imports from China fell 43% to $156M in 2025.",
    "eu-section-301": "EU pet food, fish meal and oilcake pay 10% in total: the Free or low base rate is topped up to 10%. In-quota milk replacer from Ireland pays 10% instead of 7.5%; over-quota milk-based feed pays only 80.4¢/kg + 6.4%.",
    "kh-section-301": "Cambodian pet food pays 10% of value on top of its Free base rate. Imports from Cambodia rose 50% to $139M in 2025.",
    "my-section-301": "Malaysian pet food pays 10% of value on top of its Free base rate; palm-kernel and copra cake follow their own rules (copra cake is exempt). Malaysia shipped $134M in 2025.",
    "vn-section-301": "Vietnamese pet food and feed pay 12.5% of value on top of the base rate. Vietnam shipped $113M in 2025.",
    "in-section-301": "Indian soybean meal pays 0.45¢/kg plus 10% of value; pet food and feed pay the base rate plus 10%. Imports from India more than doubled to $92M in 2025.",
    "tr-section-301": "Turkish soybean meal ($73M of the $88M Türkiye shipped in 2025) pays 0.45¢/kg plus 12.5% of value.",
    "br-section-301": "Brazilian meat meal, pet food and feed pay the base rate plus 37.5% of value. Brazil shipped $62M of Chapter 23 goods in 2025.",
    "gb-section-301": "British pet food and feed pay the base rate plus 10% of value. UK feed with milk can still use the UK's 83,914 kg share of the in-quota lines (7.5%).",
    "other-section-301": "Nigeria, Chile, New Zealand, Australia and Peru pay +12.5%; Argentina, Ecuador and Bangladesh +10%. Chilean fish meal ($76M in 2025) pays 12.5% even with an FTA claim. Togo, outside the 60, pays only the base rate on its soybean meal.",
}

fill_main(d, TITLE, {"whatItMeans": WHAT})
fill_te(d, TITLE)

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = f"HTS Chapter 23: {TITLE} — Tariff Rates"
ov["seo"] = {
    "title": "HTS Chapter 23 Import Duty: Pet Food, Animal Feed & Oilseed Meal Tariff Rates (2026) | KoalaGains",
    "shortDescription": "Searchable duty table for all 61 HTS Chapter 23 lines — dog and cat food, prepared animal feed, soybean and canola meal, fish meal, bran and distillers' grains. General, FTA and Column 2 rates, plus the 2026 Section 301 duties by country.",
    "keywords": [
        "hts chapter 23",
        "prepared animal feed import duty rates",
        "pet food tariff",
        "dog food tariff code",
        "hs code 2309",
        "hs code 2304 soybean meal",
        "canola meal import duty",
        "china tariff on pet food",
    ],
}
ov["intro"] = (
    "Chapter 23 covers what the food industry leaves behind and what animals eat — **dog and cat food**, prepared livestock feed, "
    "soybean and canola meal, fish and meat meal, bran, beet pulp and distillers' grains. Its **61 tariff lines** carry small printed "
    "rates: 25 are Free, most others are 1.4% or a fraction of a cent per kilogram. The one steep rate is on **feed containing milk** "
    "above its quota: 80.4¢/kg + 6.4%.\n\n"
    "So the extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a Section 301 tariff: "
    "**+12.5% on Thai and Vietnamese pet food**, +10% for Indonesia, Cambodia and Malaysia, 10% in total for the EU, and **37.5% on "
    "Chinese pet food** (+25% from 2019 plus 12.5%). USMCA-qualifying feed from Canada and Mexico enters free. The U.S. imported "
    "$5.42B of Chapter 23 goods in 2025, $3.49B of it pet food and feed preparations."
)
ov["stats"] = [
    {"label": "Tariff lines", "value": "61"},
    {"label": "Lines with a base-rate duty", "value": "36 of 61"},
    {"label": "Lines with an extra duty for some origins", "value": "61 of 61", "note": "Section 301 since July 24, 2026; USMCA goods exempt"},
    {"label": "2025 imports", "value": "$5.42B"},
    {"label": "Pet food share", "value": "44%", "note": "Dog or cat food for retail sale (2309.10), $2.40B"},
]
GROUPS = {
    "2301": ("Meat & fish meal", "Meat & fish meal", "Meat meal, greaves and fish meal are Free at base. The cost is the Section 301 duty for the country and the APHIS permit that animal-protein meals need.", ["fish meal", "meat and bone meal", "herring meal", "greaves", "cracklings", "krill meal"]),
    "2302": ("Bran & milling residues", "Bran", "Bran, middlings and screenings of corn, wheat, rice and other cereals are Free; only residues of leguminous plants carry 1.4%.", ["wheat bran", "wheat middlings", "rice bran", "corn bran", "pea hulls"]),
    "2303": ("Starch residues, beet pulp & distillers' grains", "Starch & brewing", "Corn gluten feed and meal pay 1.4%; beet pulp, bagasse and brewers' or distillers' grains are Free.", ["corn gluten meal", "corn gluten feed", "beet pulp", "DDGS", "distillers grains", "brewers grains"]),
    "2304": ("Soybean meal", "Soybean meal", "Soybean meal and cake pay 0.45¢/kg — about $4.50 a tonne — with a separate statistical line for certified organic meal.", ["soybean meal", "soy meal", "soybean cake", "organic soybean meal"]),
    "2305": ("Peanut meal", "Peanut meal", "Peanut (groundnut) meal and cake pay 0.32¢/kg.", ["peanut meal", "groundnut cake"]),
    "2306": ("Canola, sunflower & other oilcake", "Other oilcake", "Every other oilseed meal pays a cent-fraction per kilogram: canola 0.17¢/kg, sunflower 0.45¢/kg, cottonseed 0.56¢/kg, linseed 0.12¢/kg, palm kernel and corn germ 0.32¢/kg.", ["canola meal", "rapeseed meal", "sunflower meal", "cottonseed meal", "palm kernel meal", "copra meal", "hemp seed meal"]),
    "2307": ("Wine lees", "Wine lees", "Wine lees and argol (crude tartar) are Free.", ["wine lees", "argol"]),
    "2308": ("Acorns, citrus pulp & other plant feed", "Other plant feed", "Acorns and citrus pulp pellets pay 1.4%, dehydrated marigolds 1.9%; grain screenings and chaff are Free.", ["citrus pulp pellets", "marigold meal", "acorns", "chaff", "grain screenings"]),
    "2309": ("Pet food & prepared animal feed", "Pet food & feed", "Dog and cat food for retail sale and mixed feeds are Free. Milk-based feed pays 7.5% in quota or 80.4¢/kg + 6.4% above it; egg-based feed 1.9%; premixes and other preparations 1.4%.", ["dog food", "cat food", "pet food", "bird seed", "poultry feed", "cattle feed", "milk replacer", "premix", "fish feed"]),
}
for g in ov["productGroups"]:
    lab, short, blurb, ex = GROUPS[g["heading"]]
    g["label"], g["blurb"], g["searchExamples"] = lab, blurb, ex
ov["workedExamples"] = [
    {
        "title": "A container of canned cat food from Thailand",
        "line": "2309.10.00.10",
        "body": "Dog or cat food for retail sale is Free at base. Thailand is one of the 60 economies in the 2026 Section 301 action, so 12.5% of value is added (9903.05.77): on an $80,000 container that is **$10,000**. The same container from a USMCA-qualifying Canadian plant pays **$0**.",
    },
    {
        "title": "1,000 tonnes of canola meal from Canada",
        "line": "2306.41.00.00",
        "body": "Low-erucic rapeseed (canola) meal is 0.17¢/kg: 1,000,000 kg × $0.0017 = **$1,700** base duty, which a USMCA claim makes Free. Meal that doesn't qualify for USMCA also pays 10% of value under Section 301 (9903.05.29) — **$35,000** more at $350 a tonne.",
    },
    {
        "title": "$50,000 of dry dog food from China",
        "line": "2309.10.00.90",
        "body": "Free at base, but Chinese pet food is on Section 301 List 3 (+25%, 9903.88.03) and the 2026 action adds 12.5% (9903.05.31): 37.5% × $50,000 = **$18,750**. The IEEPA duties on China ended February 24, 2026.",
    },
    {
        "title": "20 tonnes of milk replacer from Ireland",
        "line": "2309.90.24.10",
        "body": "Inside the quota (Ireland's share is 5,470,323 kg a year) the rate is 7.5%, which the EU Section 301 rule tops up to 10%: **$6,000** on $60,000. Once the quota is full the same feed enters under 2309.90.28 at 80.4¢/kg + 6.4%: 20,000 × $0.804 + 6.4% × $60,000 = **$19,920**.",
    },
]
ts = ov["tradeSnapshot"]
ts["biggestLines"] = [
    {"hts": "2309.10", "label": "Dog or cat food, put up for retail sale"},
    {"hts": "2309.90", "label": "Other animal-feed preparations"},
    {"hts": "2306.41", "label": "Canola (low-erucic rapeseed) meal"},
]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade; 2025 is the latest full year."

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = f"HTS Chapter 23: {TITLE} — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 23 Import Duty Updates 2026: Pet Food & Animal Feed Tariffs by Country | KoalaGains",
    "shortDescription": "Every 2025–2026 tariff change for HTS Chapter 23 with dates and official sources: IEEPA duties ended February 24, 2026, the Section 122 surcharge expired July 23, Section 301 duties of 10%–37.5% since July 2026, lysine antidumping duties on China.",
    "keywords": [
        "hts chapter 23 import duty rates",
        "pet food tariffs 2026",
        "animal feed tariff updates",
        "china tariff on pet food",
        "section 301 pet food",
        "usmca animal feed tariff exemptions",
        "section 122 tariff pet food",
        "lysine antidumping duty china",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). **No Chapter 23 base rate changed** — all 61 lines carry the same General, FTA and "
    "Column 2 rates.\n\n"
    "Everything happened on top of the base rate. The 2025 IEEPA duties ended on **February 24, 2026**; a 10% Section 122 surcharge "
    "replaced them until **July 23, 2026**. Since **July 24, 2026** goods of 60 economies pay a Section 301 duty — +12.5% for Thailand and "
    "Vietnam, +10% for Indonesia, Cambodia and Malaysia, 10% in total for the EU — and Brazil pays 37.5%. China pays 12.5% on top of its "
    "older 25% or 7.5% lists, and since **September 16, 2026** feed-grade lysine from China also owes antidumping and countervailing duties. "
    "USMCA-qualifying goods from Canada and Mexico stay exempt."
)
tu["scope"] = (
    "Measures that reach Chapter 23 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the "
    "older China Section 301 lists, the Nicaragua Section 301 tariff that starts in 2027, the 2025–2026 IEEPA and Section 122 duties that "
    "have ended, the 2026 antidumping and countervailing duties on Chinese lysine, and FDA import rules that changed. For the rate each "
    "supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "61 of 61 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 by country; USMCA goods exempt"},
    {"label": "Compared", "value": "2025 Basic → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

changes = {c["id"]: c for c in tu["changes"]}
nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
nic["title"] = "Nicaragua Section 301 duty scheduled: +10% in 2027, +15% in 2028"
nic["detail"] = (
    "USTR's Nicaragua action sets the duty at 0% in 2026, +10% from January 1, 2027 and +15% from January 1, 2028 on all products of "
    "Nicaragua (9903.89.01), on top of any other duty. Goods that qualify as CAFTA-DR originating are not covered (U.S. note 29)."
)
s60 = next(c for c in tu["changes"] if c["id"].startswith("section-301-2026-60"))
s60["title"] = "Section 301 tariffs on 60 economies"
s60["detail"] = (
    "+10% or +12.5% on all products of 60 economies (9903.05.20–9903.05.84), including every Chapter 23 line: Thailand, Vietnam, "
    "Türkiye, Nigeria and Chile +12.5%, Indonesia, Cambodia, Malaysia, India and the UK +10%, China +12.5% on top of its older lists. EU "
    "goods pay 10% in total and Japanese goods 12.5% in total when the base rate is lower. USMCA-qualifying goods from Canada and Mexico "
    "are exempt (9903.05.93, 9903.05.94); copra cake is exempt for six countries (U.S. note 52(j)). An FTA claim does not remove it."
)
s60["now"] = "+10% / +12.5%"
s60["countries"] = "60 economies"
br = next(c for c in tu["changes"] if c["id"].startswith("section-301-brazil"))
br["title"] = "Section 301 tariff on products of Brazil"
br["detail"] = (
    "25% on all goods of Brazil (9903.05.01), with no Chapter 23 line on the exemption list (U.S. note 50(a)). From July 24 the 12.5% "
    "forced-labor tariff (9903.05.27) stacks on top, so Brazilian feed, pet food and meat meal pay 37.5% plus the base rate."
)

new_changes = [
    {
        "id": "china-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 duties stay in force after the four-year review",
        "detail": "USTR received requests to continue both China actions, so they did not terminate in July 2026. Chapter 23 lines stay on List 3 (+25%, 9903.88.03, 41 lines) or List 4A (+7.5%, 9903.88.15, 20 lines), subject to any change from the statutory review.",
        "before": None, "now": "+25% / +7.5% (unchanged)", "countries": "China", "sourceIds": ["fr-2026-20510", "hts-chapter-99"],
    },
    {
        "id": "prior-notice-mail", "type": "reference", "date": "2026-10-01", "dateLabel": "Compliance",
        "title": "FDA prior notice for mailed food now needs the tracking number",
        "detail": "Prior notice for food — including pet food and animal feed — arriving by international mail must give the mail service and the mail tracking number. The rest of the FDA rule took effect October 27, 2025.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["fr-2025-18655"],
    },
    {
        "id": "lysine-adcvd", "type": "extraDuty", "date": "2026-09-16", "dateLabel": "Published",
        "title": "Antidumping and countervailing duties on feed-grade lysine from China",
        "detail": "Commerce issued AD and CVD orders on animal-feed-grade L-lysine from China, including lysine in premixes, base mixes and concentrates (only the lysine component is covered). The orders name 2309.90.70 and 2309.90.95 alongside 2922.41. Cash deposits: 73.37% to 139.65% antidumping (China-wide 139.65%) plus 48.21% to 82.11% countervailing, on top of the regular duties.",
        "before": None, "now": "AD 73.37%–139.65% + CVD 48.21%–82.11%", "countries": "China", "sourceIds": ["fr-2026-18924"],
    },
    {
        "id": "fda-ia-71-04", "type": "reference", "date": "2026-08-31", "dateLabel": "Published",
        "title": "FDA updates the Salmonella import alert for animal food",
        "detail": "Import Alert 71-04 lets FDA detain, without examination, food for animals — pet food, pet treats and chews, feed ingredients — from the firms on its red list. The red list includes firms in China, India, Brazil, Mexico and Canada, among others; release needs evidence that the shipment is free of Salmonella.",
        "before": None, "now": None, "countries": "Listed firms", "sourceIds": ["fda-ia-71-04"],
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply to Canadian and Mexican feed and pet food.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 23 line was on the product exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "IEEPA duty on non-USMCA Canadian goods raised to 35%",
        "detail": "From August 1, 2025, Canadian goods that did not qualify for USMCA paid 35% instead of 25%. USMCA-qualifying feed and pet food stayed exempt. Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended February 24, 2026)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "IEEPA reciprocal tariff",
        "detail": "A 10% duty on goods of most countries from April 5, 2025, raised to country-specific rates for many suppliers later in 2025. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended February 24, 2026)", "countries": "Most countries", "sourceIds": ["eo-14257"],
    },
    {
        "id": "ca-mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "IEEPA duties on Canada and Mexico",
        "detail": "25% on goods of Canada and Mexico, applied from March 4, 2025; USMCA-qualifying goods were exempted from March 7, 2025. Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended February 24, 2026)", "countries": "Canada, Mexico", "sourceIds": ["eo-14193", "eo-14194"],
    },
]
tu["changes"] = sorted(tu["changes"] + new_changes, key=lambda c: c["date"], reverse=True)
# sources referenced only by changes
srcs = {s["id"] for s in tu["sources"]}
for sid in ("fr-2026-20510",):
    assert sid in srcs, sid

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = f"HTS Chapter 23: {TITLE} — U.S. Import Statistics"
ui["seo"] = {
    "title": "U.S. Pet Food & Animal Feed Imports by Country 2020–2025 — Thailand, Canada, China (HTS Ch. 23) | KoalaGains",
    "shortDescription": "U.S. imports of pet food, animal feed and oilseed meal 2020–2025 by country, product and year: $5.42B in 2025, led by Canada (canola meal, feed) and Thailand (pet food); imports from China down 43%.",
    "keywords": [
        "us pet food imports by country",
        "pet food imports from thailand",
        "animal feed imports by country",
        "canola meal imports from canada",
        "soybean meal imports by country",
        "HTS Chapter 23 import statistics",
        "hts 2304.00 soybean oil-cake",
    ],
}
for ln in ui["byLine"]:
    if ln["hs6"] == "2309.90":
        ln["description"] = "Other animal-feed preparations (other than dog or cat food put up for retail sale)"
        ln["searchText"] = "2309.90 other animal feed preparations livestock poultry feed premixes milk replacer bird seed " + ln["hs6"]
ui["why"] = (
    "U.S. imports of Chapter 23 goods were flat in 2025 — **$5.42B, down 0.7%** — but the mix moved. **Pet food grew**: dog and cat food "
    "for retail sale (2309.10) rose 8.5% to $2.40B, and other feed preparations (2309.90) 5.8% to $1.08B. **Canola meal**, nearly all from Canada, "
    "**fell 24.8% to $988M**, and Canada's total fell 19.8% to $1.82B. Soybean meal rose 27.1% to $500M, from Canada, Togo, Türkiye, Nigeria and India.\n\n"
    "Pet food is where the suppliers changed. **Thailand grew 21.4% to $1.04B**, Indonesia 32.7% to $227M and Cambodia 50% to $139M, while "
    "**China fell 42.6% to $156M** — in a year when Chinese pet food paid the 25% Section 301 List 3 duty plus the 2025 IEEPA duties on "
    "China. Since July 24, 2026 Thai pet food pays 12.5% and Indonesian, Cambodian and Malaysian 10%, against 37.5% for China, so the "
    "gap between China and Southeast Asia is still there. Canada and Mexico ship mostly USMCA-qualifying goods, which have been exempt "
    "from every extra duty. 2025 is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 23 (retrieved October 12, 2026)", "url": "https://comtradeplus.un.org/"},
    {"label": "Notice of Actions in the Section 301 investigations of 60 economies (91 FR 47318, July 28, 2026)", "url": "https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies"},
    {"label": "Executive Order 14389, Ending Certain Tariff Actions (91 FR 9437, February 25, 2026)", "url": "https://www.federalregister.gov/documents/2026/02/25/2026-03832/ending-certain-tariff-actions"},
]
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. UN Comtrade labels 2309.90 as \"dog or cat food (not put up for retail sale)\"; the HS heading covers all other animal-feed preparations."
ui["effectiveDuty"]["note"] = (
    "Duty-collected figures aren't available from an official source yet. Most Chapter 23 goods are Free or nearly free at base, so the "
    "duty paid comes almost entirely from the 2025–2026 extra duties by country."
)

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["seo"] = {
    "title": "HTS Chapter 23 Tariff Rates by Country: Pet Food & Animal Feed from Thailand, China, Canada, EU | KoalaGains",
    "shortDescription": "Total U.S. duty on pet food, animal feed, soybean and canola meal and fish meal from 14 supplier countries: base rate plus the 2026 Section 301 duty, minus USMCA. Thailand 12.5%, China 37.5%, EU 10%, USMCA Free.",
    "keywords": [
        "tariff on pet food by country",
        "thailand pet food tariff",
        "china tariff on pet food",
        "canada animal feed tariff",
        "eu pet food tariff",
        "hts subheading 2309.10 retail pet food tariff",
        "soybean oil-cake import duty rates",
    ],
}
ia["intro"] = (
    "The total rate on Chapter 23 goods depends on **what it is and where it comes from**. Each cell below is the base rate for that product "
    "group plus the extra duty for that country, minus any preference — computed from the current tariff schedule with the same engine "
    "as the tariff calculator.\n\n"
    "Because most base rates are Free or tiny, **the Section 301 duty is the bill**: +12.5% for Thailand, Vietnam and Türkiye, +10% for "
    "Indonesia, Cambodia, Malaysia, India and the UK, 10% in total for the EU, **37.5% for Brazil and for Chinese pet food**. "
    "USMCA-qualifying goods from Canada and Mexico enter free; milk-based feed over its quota follows its own USMCA quota rules."
)
for g in ia["groups"]:
    lab, short, _, _ = GROUPS[g["heading"]]
    g["label"], g["shortLabel"] = lab, short

LABELS = {
    "Canada": "USMCA-qualifying: free, no extra duty (9903.05.93); over-quota milk-based feed is free only within Canada's 696.9 t USMCA quota (9823.05.02) and 80.4¢/kg + 6.4% above it. Otherwise base rate + 10% Section 301 (9903.05.29). The 35% IEEPA duty ended February 24, 2026.",
    "Thailand": "Base rate + 12.5% Section 301 (9903.05.77) on every line. The IEEPA reciprocal duty ended February 24, 2026.",
    "Indonesia": "Base rate + 10% Section 301 (9903.05.45), except copra cake (2306.50), which is on Indonesia's exception list (9903.06.16).",
    "Mexico": "USMCA-qualifying: free, no extra duty (9903.05.94), including milk-based feed (9823.05.01). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "China": "Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03, 41 lines, including pet food) or + 7.5% List 4A (9903.88.15, 20 lines). Feed-grade lysine also owes antidumping and countervailing duties (not shown).",
    "Germany": "EU: 10% in total in place of the base rate under Section 301 (9903.05.39). Over-quota milk-based feed pays only its base rate, which is already higher.",
    "Cambodia": "Base rate + 10% Section 301 (9903.05.28), except copra cake (2306.50), on Cambodia's exception list (9903.06.02).",
    "France": "EU: 10% in total in place of the base rate under Section 301 (9903.05.39). Over-quota milk-based feed pays only its base rate.",
    "Malaysia": "Base rate + 10% Section 301 (9903.05.54), except copra cake (2306.50), on Malaysia's exception list (9903.05.99).",
    "Vietnam": "Base rate + 12.5% Section 301 (9903.05.84) on every line.",
    "India": "Base rate + 10% Section 301 (9903.05.44) on every line.",
    "Türkiye (Turkey)": "Base rate + 12.5% Section 301 (9903.05.79) on every line.",
    "Brazil": "Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% forced-labor Section 301 (9903.05.27) = +37.5% on every line.",
    "United Kingdom": "Base rate + 10% Section 301 (9903.05.81). Milk-based feed can use the UK's 83,914 kg share of the in-quota lines.",
    "Any other country": "Countries outside the 60 Section 301 economies (Togo, for example) pay only the base rate. Among the 60, Nigeria, Chile, New Zealand, Australia and Peru pay +12.5%; Argentina, Ecuador and Bangladesh +10%; Japan, South Korea, Switzerland and Taiwan a total topped up to 12.5% or 10%. Russia, Belarus, Cuba and North Korea pay the Column 2 rates.",
}
for c in ia["countries"]:
    c["rule"]["label"] = LABELS[c["country"]]
    if c["country"] in ("Canada", "Mexico"):
        c["rule"]["sourceIds"] = [s for s in c["rule"]["sourceIds"] if s != "hts-now"] + ["hts-ch98", "eo-14389", "hts-now"]
    elif c["country"] == "China":
        c["rule"]["sourceIds"] = [s for s in c["rule"]["sourceIds"] if s != "hts-now"] + ["fr-2026-18924", "hts-now"]
ia["assumptions"] = [a for a in ia["assumptions"] if not a.startswith("TODO")] + [
    "Milk-based feed over the quota (2309.90.28, 2309.90.48): the USMCA rate is set in Chapter 98 and is not priced by the calculator. Mexican goods are Free (9823.05.01); Canadian goods are Free within a 696.9 t quota for 2026 shared with whole milk powder (9823.05.02) and 80.4¢/kg + 6.4% above it (9823.05.05, 9823.05.06).",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Antidumping and countervailing duties are not in the matrix: feed-grade lysine from China (including lysine in premixes under 2309.90.70 and 2309.90.95) owes cash deposits of 73.37%–139.65% plus 48.21%–82.11% since September 2026.",
    "The rate is not the only gate: FDA prior notice, food-facility registration and the importer's FSVP apply to all animal food, and animal-protein meals and pet food with meat need APHIS clearance.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 20, 29, 50, 51 and 52 to Chapter 99 subchapter III and the Section 122 exemption list in the 2026 Revision 21. No "
    "Chapter 23 line is on the Section 301 general exemption list (note 52(b), 9903.05.86), the Brazil exemption list (note 50(a)), the "
    "Section 122 product exemption list (9903.03.03) or the Canada Section 338 lists (note 51). Only coconut or copra cake (2306.50) is "
    "on country exception lists — Malaysia, Cambodia, El Salvador, Indonesia, Ecuador and Jordan (note 52(j)). Every Chapter 23 line is "
    "on China Section 301 List 3 (41 lines, note 20(f)) or List 4A (20 lines, note 20(s)). The Nicaragua duty (note 29) excludes CAFTA-DR "
    "originating goods and is 0% in 2026."
)
ia_ids = {s["id"] for s in ia["sources"]}
for s in tu["sources"]:
    if s["id"] in ("hts-ch98", "eo-14389", "fr-2026-18924") and s["id"] not in ia_ids:
        ia["sources"].append(s)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = f"HTS Chapter 23: {TITLE} — Tariff FAQ"
fc["seo"] = {
    "title": "Pet Food & Animal Feed Tariffs FAQ: Dog Food, Thailand, China, Canada, HS Codes 2309 & 2304 (HTS Ch. 23) | KoalaGains",
    "shortDescription": "Answers to what people search about pet food and animal feed tariffs: are there tariffs on dog food, pet food from Canada, China and Thailand, HS codes for pet food, animal feed, soybean meal and fish meal, bringing pet food into the U.S., lysine duties.",
    "keywords": [
        "tariff on pet food",
        "are there tariffs on pet food",
        "tariff on dog food",
        "pet food tariffs canada",
        "hs code for pet food",
        "hs code for dog food",
        "hs code for animal feed",
        "hs code 2309",
        "hs code 2304",
        "hs code for fish meal",
        "can i bring pet food into the us",
        "lysine tariff",
    ],
}
fc["intro"] = "Straight answers to the most common questions about importing pet food, animal feed and feed ingredients into the U.S. — tariffs by country, HS codes and entry requirements. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "Most Chapter 23 base rates are Free or a fraction of a cent per kilogram, so the extra duty by country decides the cost: +12.5% for Thai pet food, +10% for Indonesia, Cambodia and Malaysia, 10% in total for the EU, 37.5% for China and Brazil since July 24, 2026.",
    "USMCA-qualifying pet food and feed from Canada and Mexico enter free. The 2025 IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge expired July 23, 2026.",
    "FDA rules apply to every shipment of animal food (prior notice, facility registration, the importer's FSVP), and meat or fish meal and pet food with animal ingredients need APHIS clearance.",
]
fc["questionSource"] = "Google search suggestions, collected October 12, 2026, and the search keywords of the previous version of these pages"
fc["faqs"] = [
    {
        "id": "pet-food-tariff", "question": "Are there tariffs on pet food?",
        "searchedAs": ["tariff on pet food", "are there tariffs on pet food", "pet food tariffs", "tariff on dog food", "dog food tariffs", "cat food tariff"],
        "answer": "Dog and cat food put up for retail sale (2309.10) has a Free base rate, so the tariff is the extra duty for the country of origin. Since July 24, 2026 that is 12.5% for Thailand and Vietnam, 10% for Indonesia, Cambodia and Malaysia, 10% in total for EU countries, 37.5% for China (25% + 12.5%) and Brazil. USMCA-qualifying pet food from Canada and Mexico enters free. The U.S. imported $2.40B of retail dog and cat food in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "canada-pet-food", "question": "Is there a tariff on pet food and feed from Canada?",
        "searchedAs": ["pet food tariffs canada", "usmca duty-free animal feed imports"],
        "answer": "Not if it qualifies for USMCA: qualifying goods pay no base rate and are exempt from the 10% Section 301 duty on Canadian products (9903.05.93). Goods that don't qualify pay their base rate plus 10% of value (9903.05.29). The 35% IEEPA duty ended February 24, 2026. Over-quota milk-based feed is the exception: free only within Canada's 696.9 t USMCA quota for 2026. Canada shipped $1.82B of Chapter 23 goods in 2025, mostly canola meal ($1.0B) and feed and pet food ($615M).",
        "link": "industry-areas",
    },
    {
        "id": "thailand-pet-food", "question": "What is the tariff on pet food from Thailand?",
        "searchedAs": ["thailand reciprocal tariffs chapter 23", "thailand dog chews reciprocal tariff"],
        "answer": "12.5% of value since July 24, 2026: the base rate on dog and cat food is Free and Thailand is one of the 60 economies in the 2026 Section 301 action (9903.05.77). The 2025 reciprocal tariff ended on February 24, 2026, and the 10% Section 122 surcharge that followed expired July 23, 2026. Thailand supplied $1.04B of pet food and feed in 2025, up 21%.",
        "link": "industry-areas",
    },
    {
        "id": "china-pet-food", "question": "What is the tariff on pet food and animal feed from China?",
        "searchedAs": ["pet food import from china", "china tariff on prepared animal feed", "china tariff on residues and waste from the food industries"],
        "answer": "37.5% of value on dog and cat food and most feed preparations: +25% from Section 301 List 3 (9903.88.03) plus +12.5% from the 2026 action (9903.05.31). Lines on List 4A, such as milk- and egg-based feed and cottonseed cake, pay 20% plus their base rate. Feed-grade lysine from China also owes antidumping and countervailing duties since September 2026, and FDA detains Chinese vegetable proteins such as corn gluten and soy meal under Import Alert 99-29 unless the firm is cleared. Imports from China fell 43% to $156M in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "hs-pet-food", "question": "What is the HS code for pet food, dog food and cat food?",
        "searchedAs": ["hs code for pet food", "hs code for dog food", "hs code for cat food", "dog food tariff code", "cat food tariff code", "hs code for dry dog food", "hs code for wet pet food", "hs code 2309.10"],
        "answer": "Dog or cat food put up for retail sale is 2309.10: 2309.10.00.10 for food in airtight containers (canned or pouched wet food) and 2309.10.00.90 for the rest, such as dry kibble. Both have a Free base rate. Food for other pets put up for retail sale is 2309.90.10.15, and bird seed 2309.90.10.05, also Free.",
        "link": "",
    },
    {
        "id": "hs-animal-feed", "question": "What is the HS code for animal feed?",
        "searchedAs": ["hs code for animal feed", "hs code for cattle feed", "hs code for livestock feed", "hs code 2309", "hs code 2309.90", "2309 hs code import duty"],
        "answer": "Prepared animal feed is heading 2309. Mixed feeds with at least 6% grain are 2309.90.10 (Free), split into poultry, dairy cattle, other cattle, swine and other livestock feed. Feed containing milk is 2309.90.22 to 2309.90.48 (7.5% in quota, 80.4¢/kg + 6.4% above it), feed containing egg 2309.90.60 (1.9%), and other preparations 2309.90.70 and 2309.90.95 (1.4%). Feed ingredients such as soybean meal (2304), canola meal (2306.41) and fish meal (2301.20) have their own headings.",
        "link": "",
    },
    {
        "id": "hs-supplements", "question": "What is the HS code for animal feed supplements and additives?",
        "searchedAs": ["hs code for animal feed supplements", "hs code for animal feed additives"],
        "answer": "Premixes and supplements made for animal feeding are usually 2309.90.70 (with a basis of vitamin B12) or 2309.90.95 (other), both 1.4%. A single chemical such as an amino acid or vitamin is normally classified in Chapter 29 instead. Feed-grade lysine from China owes antidumping and countervailing duties whether it enters as lysine or in a premix; the orders name 2922.41, 2309.90.70 and 2309.90.95.",
        "link": "tariff-engineering",
    },
    {
        "id": "hs-soybean-meal", "question": "What is the HS code and duty for soybean meal?",
        "searchedAs": ["hs code 2304", "hs code 2304.00", "soybean meal import", "soybean meal imports by country", "hts 2304.00.00 soybean oil-cake"],
        "answer": "2304.00.00: soybean oilcake and meal, 0.45¢/kg (about $4.50 a tonne), with statistical lines for certified organic (.10) and other (.90). The U.S. imported $500M in 2025, up 27%, from Canada ($109M), Togo ($79M), Türkiye ($73M), Nigeria ($64M) and India ($37M). On top of the base rate, Türkiye and Nigeria pay +12.5% Section 301 and India +10%; Togo, outside the 60 economies, pays only the base rate, and USMCA-qualifying Canadian meal is free.",
        "link": "industry-areas",
    },
    {
        "id": "hs-fish-meal", "question": "What is the HS code for fish meal?",
        "searchedAs": ["hs code for fish meal", "hs code of fish meal powder", "fish meal imported"],
        "answer": "2301.20: flours, meals and pellets of fish or crustaceans, split into herring or pilchard meal (2301.20.00.10) and other (2301.20.00.90). The base rate is Free; the Section 301 duty for the country applies — Chile ($76M of fish and meat meal in 2025) pays 12.5% even with an FTA claim. Fish meal also needs a USDA APHIS import permit.",
        "link": "tariff-engineering",
    },
    {
        "id": "bring-pet-food", "question": "Can I bring pet food into the U.S.?",
        "searchedAs": ["can i bring pet food into the us", "bringing pet food into the us", "pet food import permit"],
        "answer": "From Canada, travelers can bring pet food, chews and treats in unopened retail packaging — up to 50 lb per vehicle by land or 20 lb per family by air — and raw or dried items must be labeled a product of Canada or the U.S. Commercial shipments need FDA prior notice, a registered foreign facility and the importer's Foreign Supplier Verification Program; pet food made with meat, poultry or fish ingredients may also need a USDA APHIS import permit.",
        "link": "tariff-engineering",
    },
    {
        "id": "lysine", "question": "Is there a tariff on lysine?",
        "searchedAs": ["lysine tariff"],
        "answer": "On feed-grade lysine from China, yes: since September 2026 Commerce requires antidumping cash deposits of 73.37% to 139.65% (139.65% for the China-wide entity) and countervailing deposits of 48.21% to 82.11%, on top of the regular duties. The orders cover lysine in premixes and concentrates too (only the lysine part), including entries under 2309.90.70 and 2309.90.95.",
        "link": "tariff-updates",
    },
    {
        "id": "us-imports", "question": "Where does the U.S. import pet food and animal feed from?",
        "searchedAs": ["pet food importers in usa", "animal feed imports by country"],
        "answer": "$5.42B of Chapter 23 goods in 2025. Canada supplied $1.82B (mostly canola meal and feed) and Thailand $1.04B (almost all pet food); then Indonesia ($227M), Mexico ($175M), China ($156M), Germany ($147M), Cambodia ($139M), France ($135M) and Malaysia ($134M). Retail dog and cat food alone was $2.40B.",
        "link": "understand-industry",
    },
]

json.dump(d, open(P, "w"), ensure_ascii=False, indent=2)
print("ok")
