"""Fill the writer TODOs of the generated Chapter 24 content file. Usage: python3 fill.py <file>"""
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from static_eng import RULES, GROUPS, LEVERS  # noqa: E402
from static_src import EXTRA_SOURCES  # noqa: E402

path = sys.argv[1]
d = json.load(open(path))
TODAY = d["asOf"]
TITLE = d["chapter"]["title"]

# ------------------------------------------------------------------ extra rules
RULES = RULES + [
    {
        "id": "fda-flavor",
        "agency": "FDA CTP",
        "title": "Cigarettes and their tobacco, filter or paper may not have a characterizing flavor other than tobacco or menthol — clove, fruit, candy and spice cigarettes cannot be sold",
        "citations": [
            {"label": "21 U.S.C. 387g(a)(1)(A)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title21/html/USCODE-2023-title21-chap9-subchapIX-sec387g.htm"},
        ],
    },
    {
        "id": "fda-pesticide",
        "agency": "FDA CTP",
        "title": "Foreign-grown tobacco used by a tobacco product manufacturer may not carry pesticide residues above the tolerances that apply to U.S.-grown tobacco",
        "citations": [
            {"label": "21 U.S.C. 387g(a)(1)(B)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title21/html/USCODE-2023-title21-chap9-subchapIX-sec387g.htm"},
        ],
    },
]

# ------------------------------------------------------------------ overview
ov = d["overview"]
ov["seo"]["title"] = "HTS Chapter 24 Tobacco Tariffs — Cigars, Cigarettes, Vapes & Leaf: Rates & Import Duties | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Complete searchable duty table for all 205 HTS Chapter 24 tariff lines — leaf tobacco, cigars, cigarettes, pipe and chewing tobacco, snuff, "
    "hookah tobacco, vapes and nicotine pouches. General, FTA and Column 2 rates, the 350% tobacco quota rate and the 2026 Section 301 tariffs by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 24",
    "tobacco tariffs",
    "tariff on tobacco products",
    "cigar tariff code",
    "cigarette tariff code",
    "vape tariff code",
    "hs code for tobacco leaves",
    "nicotine pouches tariff code",
    "tobacco tariff rate quota",
    "tobacco tariffs 2026",
]
ov["intro"] = (
    "Chapter 24 covers tobacco from the leaf to the finished product: unmanufactured leaf and refuse (2401), cigars and cigarettes (2402), pipe, "
    "roll-your-own, hookah and chewing tobacco and snuff (2403), and — since 2022 — e-cigarette liquids, disposable vapes, heated tobacco and nicotine "
    "pouches (2404). Its **205 tariff lines** mostly carry small rates (Free on cigar wrapper leaf, $1.89/kg + 4.7% at most on cigars, 5–6.5% on vapes), "
    "with one big exception: **cigarette leaf above the tobacco tariff-rate quota pays 350%**.\n\n"
    "The U.S. imported **$3.63B** of Chapter 24 goods in 2025, and cigars are the largest part: $1.42B, mostly from the **Dominican Republic and Nicaragua**, "
    "which enter at a Free base rate under CAFTA-DR. Since **July 24, 2026** the 2026 Section 301 tariffs add 10% or 12.5% for 60 economies "
    "(12.5% for Dominican and Nicaraguan cigars, 37.5% for Brazilian leaf with the Brazil action, 37.5% on most Chinese lines with the older China lists). "
    "USMCA-qualifying goods from Canada and Mexico enter free. Two costs sit outside this table: the **federal excise tax** collected by CBP at entry "
    "(for example $50.33 per 1,000 cigarettes) and **FDA marketing authorization**, without which a vape or nicotine pouch cannot be sold."
)
groups_text = {
    "2401": (
        "Leaf tobacco and refuse. Cigar wrapper, filler and oriental leaf is mostly Free; flue-cured and burley leaf for cigarettes pays 23.9¢–40.9¢/kg inside "
        "the tobacco quota and 350% above it. Leaf declared for cigars, pipe or roll-your-own tobacco skips the quota.",
        ["tobacco leaf", "raw tobacco", "flue-cured tobacco", "burley", "cigar wrapper", "Connecticut shade", "oriental tobacco", "tobacco stems"],
    ),
    "2402": (
        "Cigars, cheroots, cigarillos and cigarettes. Every line pays a per-kilogram rate plus a percentage — $1.89/kg + 4.7% on cheap cigars, 57¢/kg + 1.4% on "
        "premium cigars, $1.05/kg + 2.3% on paper-wrapped cigarettes — and Free under CAFTA-DR, USMCA and other FTAs. Federal excise tax applies on top.",
        ["cigars", "premium cigars", "cigarillos", "little cigars", "cigarettes", "clove cigarettes", "Dominican cigars", "Nicaraguan cigars"],
    ),
    "2403": (
        "Pipe and roll-your-own tobacco, hookah (water pipe) tobacco, chewing tobacco, snuff and reconstituted tobacco: 19.9¢–62¢/kg, or 350% for bulk "
        "cigarette tobacco above the quota. Snuff includes gutkha.",
        ["pipe tobacco", "roll your own tobacco", "shisha", "hookah tobacco", "chewing tobacco", "snuff", "gutkha", "reconstituted tobacco"],
    ),
    "2404": (
        "Products for inhalation without combustion and other nicotine products: heated tobacco sticks (24.7¢/kg), e-liquids and disposable e-cigarettes "
        "(5% or 6.5%), nicotine pouches (6.4%) and patches (5%). FDA marketing authorization decides whether they can be sold at all.",
        ["vape", "disposable vape", "e-cigarette", "e-liquid", "vape juice", "nicotine pouches", "zyn", "heated tobacco", "nicotine patch"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = groups_text[g["heading"]]
ov["workedExamples"] = [
    {
        "title": "A shipment of premium cigars from the Dominican Republic",
        "line": "2402.10.80.80",
        "body": "10,000 cigars weighing 150 kg, customs value $50,000 ($5 each). Without an FTA claim the base duty is 57¢/kg + 1.4%: $85.50 + $700 = **$785.50**; "
        "with a CAFTA-DR claim it is Free. Either way the 2026 Section 301 duty for the Dominican Republic adds 12.5%: **$6,250** (9903.05.34). "
        "On top, CBP collects the federal excise tax on large cigars — 52.75% of the sale price, capped at 40.26¢ a cigar — **$4,026** for 10,000 cigars "
        "selling at $5 or more.",
    },
    {
        "title": "A container of flue-cured leaf from Brazil, in and over the quota",
        "line": "2401.20.85.10",
        "body": "20,000 kg of threshed flue-cured leaf at $5/kg ($100,000) for cigarettes. Inside Brazil's 80,200 t quota (September 13, 2026 – September 12, 2027) "
        "the rate is 37.5¢/kg: **$7,500**. Once the quota is full the same leaf enters under 2401.20.87.10 at 350%: **$350,000**. Brazil's Section 301 duties "
        "(25% + 12.5%) add **$37,500** either way. No excise tax is due on leaf.",
    },
    {
        "title": "Nicotine pouches from Sweden",
        "line": "2404.91.00.00",
        "body": "A $200,000 shipment. The base rate is 6.4%, but EU goods with a base rate under 10% pay **10% in total** under the 2026 Section 301 action "
        "(9903.05.39): **$20,000**. Nicotine pouches are not on the federal excise-tax list, but each product needs FDA marketing authorization.",
    },
    {
        "title": "Disposable vapes from China",
        "line": "2404.12.05.10",
        "body": "A $100,000 shipment of flavored disposable e-cigarettes: 6.5% base + 25% (List 3, 9903.88.03) + 12.5% (9903.05.31) = **44%, or $44,000**. "
        "Unauthorized e-cigarettes are detained at the border without examination (FDA Import Alert 98-07), so most cannot be entered at any rate.",
    },
]
ov["tradeSnapshot"]["topCountries"][0]["name"] = "Dominican Republic"
ov["tradeSnapshot"]["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade; 2025 is the latest full year. "
    "Reusable e-cigarette devices sold without nicotine liquid are classified in 8543.40 and are not counted here."
)
for s in ov["stats"]:
    if "share" in s["label"]:
        s["label"] = "Dominican Republic + Nicaragua share"
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover medicinal cigarettes (chapter 30).\n\n"
    "**Note 2.** Any product classifiable in heading 2404 and in any other heading of the chapter is classified in heading 2404.\n\n"
    "**Note 3.** For heading 2404, \"inhalation without combustion\" means inhalation through heated delivery or other means, without combustion.\n\n"
    "**Subheading note 1.** \"Water pipe tobacco\" (2403.11) is tobacco for smoking in a water pipe made of tobacco and glycerol, with or without aromatic oils, "
    "molasses, sugar or fruit flavors; tobacco-free water pipe products are excluded."
)
ov["notes"]["additionalUsNotes"] = (
    "**Note 1.** \"Wrapper tobacco\" is leaf with the color, texture, burn and size needed for cigar wrappers; all other leaf is \"filler tobacco\".\n\n"
    "**Note 2.** The wrapper percentage of a shipping unit is the share of wrapper leaves in it, counted by CBP on sample hands.\n\n"
    "**Note 3.** The dutiable weight of cigars and cigarettes includes every integral part.\n\n"
    "**Note 4.** Certain samples of tobacco products are duty-free under chapter 98 (9811.00.40).\n\n"
    "**Note 5.** The tobacco tariff-rate quota: in each year from September 13 to September 12, tobacco entered under the in-quota subheadings (2401.10.63, "
    "2401.20.33, 2401.20.85, 2401.30.33, 2401.30.35, 2401.30.37, 2403.19.60, 2403.91.45, 2403.99.60) may not exceed: Brazil 80,200 t, Malawi 12,000 t, "
    "Zimbabwe 12,000 t, Argentina 10,750 t, Guatemala 10,000 t, European Community 9,956 t, Thailand 7,000 t, Philippines 3,000 t, Chile 2,750 t, "
    "United Kingdom 44 t, other countries or areas 3,000 t. Products of Canada, Israel and Mexico and Chapter 98 entries are outside the quota. Tobacco used to "
    "prepare roll-your-own cigarette tobacco counts as tobacco for products other than cigarettes.\n\n"
    "**Note 6.** \"Prepared for marketing to the ultimate consumer in the identical form and package in which imported\" means packed and labeled for retail sale "
    "without any change.\n\n"
    "**Statistical note 1.** \"Snuff and snuff flours\" (2403.99.21.40) is finely cut, ground or powdered tobacco not intended to be smoked, including gutkha; "
    "it is subject to federal excise tax (26 U.S.C. 5701(e)) and TTB packaging and labeling rules."
)

# ------------------------------------------------------------------ tariff updates
tu = d["tariffUpdates"]
tu["seo"]["title"] = "Tobacco Tariff Updates 2026 — Cigars, Vapes, Brazil Leaf & Section 301 (HTS Ch. 24) | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for tobacco imports (HTS Chapter 24) since January 2025: the IEEPA duties on Brazil, China and others and their end, the Section 122 surcharge, "
    "the 2026 Section 301 tariffs on cigars, leaf and vapes, the tobacco quota and FDA's e-cigarette import enforcement — with Federal Register citations."
)
tu["seo"]["keywords"] = [
    "tobacco tariff updates",
    "new tariff on tobacco",
    "tariffs on cigars 2026",
    "Brazil tobacco tariff",
    "tariff on vapes from china",
    "170 tariff on vapes",
    "Section 301 tariff cigars",
    "vape tariff 2026",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** "
    "(in force October 9, 2026). On 197 of the 205 Chapter 24 lines the base rates are the same; the other eight are new statistical lines that split out "
    "**disposable e-cigarettes** under 2404.12 and 2404.19, at unchanged rates.\n\n"
    "The changes came on top of the base rate. In 2025 the IEEPA tariffs reached all tobacco: Brazilian leaf paid **50%** extra from August 6, 2025 (10% "
    "reciprocal + 40%), and Chinese vapes briefly paid **170%** extra in April–May 2025. All IEEPA duties ended on **February 24, 2026**, a 10% Section 122 "
    "surcharge ran until **July 23, 2026**, and since **July 24, 2026** the **2026 Section 301 tariffs** apply: 12.5% for Dominican and Nicaraguan cigars, "
    "10% for Honduran cigars and Indonesian vapes, 10% in total for EU pouches, +37.5% for Brazil and China. No Chapter 24 line is on any exemption list. "
    "USMCA-qualifying goods from Canada and Mexico stay exempt. Alongside the tariffs, FDA and CBP stepped up seizures of unauthorized e-cigarettes."
)
tu["scope"] = (
    "Measures that reach Chapter 24 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the older China Section 301 "
    "lists, the Nicaragua Section 301 tariff that starts in 2027, the 2025–2026 IEEPA and Section 122 duties that have ended, the tobacco tariff-rate quota, "
    "and FDA and CBP actions that changed what can enter. Federal excise tax is not a tariff and is covered under Import documents & duty-saving rules. "
    "For the rate each supplier pays, see Rates by country."
)
for s in tu["stats"]:
    if s["label"].startswith("New or renumbered"):
        s["note"] = "Disposable e-cigarette split of 2404.12 and 2404.19, same rates"
tu["stats"].append({"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"})

E = {
    "do": (
        "With a CAFTA-DR claim (SPI P) every Chapter 24 base rate is Free, but the Section 301 duty still applies (U.S. note 52(a)). No Chapter 24 line is on the "
        "Section 301 exemption list (note 52(b)) or the Dominican Republic's country exception list (note 52(j)). The 10% IEEPA reciprocal duty ended February 24, 2026, "
        "and the 10% Section 122 surcharge expired July 23, 2026.",
        "Dominican cigars — $944M in 2025, the largest lane in the chapter — pay 12.5% of value: $12,500 on a $100,000 shipment, plus the federal cigar excise tax.",
    ),
    "ni": (
        "With a CAFTA-DR claim every base rate is Free; the Section 301 duty still applies (U.S. note 52(a)). The separate Nicaragua Section 301 duty (9903.89.01) "
        "is 0% in 2026, 10% from 2027 and 15% from 2028, and does not apply to goods that originate under CAFTA-DR (U.S. note 29). The IEEPA reciprocal duty ended "
        "February 24, 2026.",
        "Nicaraguan cigars ($396M in 2025) pay 12.5% of value today. Cigars that do not qualify for CAFTA-DR would also pay the Nicaragua duty from January 1, 2027.",
    ),
    "id": (
        "No Chapter 24 line is on an exemption list. Indonesia has no FTA with the United States, and GSP has lapsed. The IEEPA reciprocal duty ended February 24, 2026.",
        "Indonesian heading 2404 goods — e-liquids, vapes and other nicotine products, $232M in 2025 — pay 5% or 6.5% plus 10%: 15% or 16.5% of value. Clove cigarettes cannot be sold in the U.S. at all "
        "(21 U.S.C. 387g flavor ban).",
    ),
    "mx": (
        "USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.94), and Mexican tobacco is outside the tobacco quota. The 25% IEEPA "
        "duty on non-USMCA Mexican goods ended February 24, 2026.",
        "USMCA-qualifying Mexican cigarettes and cigars — $235M in 2025 — enter free of duty (excise tax still applies). Goods that do not qualify pay the base rate "
        "plus 10% of value.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 (9903.05.27). No Chapter 24 line "
        "is on either exemption list (U.S. note 50, note 52(b)). Brazil has the largest tobacco quota, 80,200 t a year. The 2025 IEEPA duties on Brazil (10% "
        "reciprocal plus 40%, together 50%) ended February 24, 2026.",
        "Brazilian leaf ($227M in 2025) pays 37.5% of value on top of the base rate: in quota, 20 t of threshed flue-cured leaf at $5/kg owes $7,500 + $37,500; "
        "over quota $350,000 + $37,500.",
    ),
    "ca": (
        "USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.93), and Canadian tobacco is outside the tobacco quota. The 35% IEEPA duty "
        "on non-USMCA Canadian goods ended February 24, 2026. The 2026 Section 338 duties on Canadian alcoholic beverages, dairy and motor vehicles list no Chapter 24 "
        "line (U.S. note 51).",
        "USMCA-qualifying Canadian leaf ($85M in 2025) and heading 2404 nicotine products ($82M) enter free. Non-qualifying goods pay the base rate plus 10% of value.",
    ),
    "tr": (
        "No Chapter 24 line is on an exemption list, and Türkiye has no FTA with the United States. The IEEPA reciprocal duty ended February 24, 2026.",
        "Turkish oriental leaf, Free at the base rate, now pays 12.5% of value; Turkish cigarettes pay $1.05/kg + 2.3% plus 12.5%.",
    ),
    "hn": (
        "With a CAFTA-DR claim every base rate is Free; the Section 301 duty still applies (U.S. note 52(a)). The IEEPA reciprocal duty ended February 24, 2026.",
        "Honduran cigars ($122M in 2025) pay 10% of value: $10,000 on a $100,000 shipment.",
    ),
    "eu": (
        "For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); lines with a higher base rate, such as the 350% "
        "over-quota leaf, pay only the base rate. No Chapter 24 line is on the EU exception list (9903.05.97). The EU shares a 9,956 t tobacco quota. This replaced "
        "the IEEPA reciprocal duty, which ended February 24, 2026.",
        "Heading 2404 nicotine products from Denmark and Sweden ($179M together in 2025) pay 10% of value in total — for pouches instead of 6.4%: $10,000 on a $100,000 shipment.",
    ),
    "in": (
        "No Chapter 24 line is on an exemption list; GSP has lapsed. The IEEPA duties on India ended February 24, 2026.",
        "Indian chewing tobacco, snuff and other manufactured tobacco ($76M in 2025) pay 24.7¢–32.8¢/kg plus 10% of value.",
    ),
    "cn": (
        "Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and +25% under List 3 (9903.88.03, 170 lines including "
        "cigars, cigarettes and every vape line) or +7.5% under List 4A (9903.88.15, 35 lines, mostly leaf and nicotine pouches). The IEEPA duties on China — at "
        "their peak 20% plus 125% from April 10 to May 13, 2025 — ended February 24, 2026.",
        "Chinese vapes pay 5% or 6.5% + 37.5% = 42.5% or 44% of value, nicotine pouches 26.4%. U.S. imports of Chapter 24 goods from China fell from $181M in "
        "2024 to $33M in 2025.",
    ),
    "other": (
        "No Chapter 24 line is on the general exemption list (note 52(b)) or any country exception list (note 52(j)). Countries outside the 60 economies — for "
        "example Zimbabwe and Malawi — pay no extra duty. Products for personal use in accompanied baggage are not subject to the Section 301 duties (note 52(a)).",
        "Zimbabwean and Malawian leaf pays only its base rate (in quota up to 12,000 t each); Philippine leaf pays the base rate plus 12.5%.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = E[key]

chg = {c["id"]: c for c in tu["changes"]}
chg["base-rates"]["title"] = "No Chapter 24 base-rate changes"
chg["base-rates"]["detail"] = (
    "197 of 205 lines carry the same General, FTA and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition; none changed. Eight statistical lines are "
    "new: e-liquids under 2404.12.05, 2404.12.10, 2404.19.05 and 2404.19.10 are now reported as \"disposable electronic cigarettes\" or \"other\", at the "
    "parent's rate (5% or 6.5%)."
)
for cid, c in chg.items():
    if cid.startswith("section-301-nicaragua"):
        c["title"] = "Nicaragua Section 301 duty: 10% from 2027, 15% from 2028"
        c["detail"] = (
            "USTR set a phased duty on products of Nicaragua (9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It does not apply to "
            "goods that originate under CAFTA-DR (U.S. note 29), which covers most Nicaraguan cigars entered with a CAFTA-DR claim."
        )
    elif cid.startswith("section-301-2026-60"):
        c["title"] = "Section 301 tariffs on 60 economies — no tobacco exemption"
        c["detail"] = (
            "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), with no Chapter 24 line on the exemption list. EU goods pay 10% in total and "
            "Japanese, Korean and Swiss goods 12.5% in total when the base rate is lower. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, "
            "9903.05.94). FTA claims, including CAFTA-DR for cigars, do not remove it."
        )
    elif cid.startswith("section-301-brazil"):
        c["title"] = "Section 301 tariff on products of Brazil"
        c["detail"] = (
            "25% on goods of Brazil (9903.05.01), with no Chapter 24 line on the exemption list (U.S. note 50). From July 24 the 12.5% forced-labor tariff "
            "(9903.05.27) stacks on top, so Brazilian leaf pays 37.5% plus its base rate."
        )

NEW_CHANGES = [
    ("trq-2027", "reference", "2026-09-14", "Effective", "Tobacco quota year 2027 opens",
     "The quota year September 13, 2026 – September 12, 2027 opened on September 14, 2026 with unchanged quantities: Brazil 80,200 t, Malawi 12,000 t, Zimbabwe "
     "12,000 t, Argentina 10,750 t, Guatemala 10,000 t, EU 9,956 t, Thailand 7,000 t, Philippines 3,000 t, Chile 2,750 t, United Kingdom 44 t, others 3,000 t. "
     "Entries are accepted first come, first served; leaf over a country's quantity pays 350%.",
     "23.9¢–40.9¢/kg in quota", "350% over quota", "Quota countries", ["cbp-qb-26-502", "hts-ch24"]),
    ("s122-end", "extraDuty", "2026-07-23", "Effective", "Section 122 import surcharge expired",
     "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.", "+10%", "None", "All countries", ["procl-11012", "hts-now"]),
    ("usmca-review", "reference", "2026-07-01", "Checked", "USMCA joint review: not renewed, still in force",
     "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until "
     "termination, so USMCA claims (SPI S) still apply to Canadian and Mexican tobacco.", None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ("fda-registration", "pending", "2026-06-29", "Proposed", "Proposed: foreign tobacco factories must register with FDA",
     "FDA proposed extending establishment registration and product listing — today required only of domestic owners and operators — to foreign establishments "
     "that make tobacco products for the U.S. market. Comments closed September 14, 2026; the rule is not final.", None, None, "All countries", ["fr-2026-13047"]),
    ("red-mist", "reference", "2026-05-13", "Checked", "Operation Red Mist: 18 million illegal e-cigarettes seized",
     "CBP, the Coast Guard and FDA seized more than 18 million unauthorized e-cigarette units worth over $175 million in maritime cargo, mainly from China, "
     "many misclassified or undervalued to avoid detection, taxes and duties.", None, None, "China", ["cbp-red-mist"]),
    ("fda-enforcement", "reference", "2026-05-12", "Published", "FDA sets enforcement priorities for unauthorized vapes and pouches",
     "FDA said it does not intend to prioritize enforcement against ENDS and nicotine pouches with an accepted, pending application (unless they appeal to youth), "
     "and will focus on illicit, counterfeit and misdeclared products and on seizing illegal products at the border. Unauthorized products remain illegal to sell.",
     None, None, "All countries", ["fr-2026-09368"]),
    ("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
     "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 24 line was on the product exemption list (9903.03.03), so cigars, leaf, "
     "vapes and pouches paid it. USMCA-qualifying goods from Canada and Mexico were exempt.", None, "+10%", "All countries", ["procl-11012", "hts-now"]),
    ("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
     "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the "
     "Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx "
     "and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.", None, "None", "All countries",
     ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ("cn-fentanyl-10", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
     "Executive Order 14357 cut the IEEPA duty on products of China from 20% to 10%, so Chinese vapes paid 10% + 10% reciprocal + 25% (List 3) on top of the "
     "base rate. Ended February 24, 2026.", "+20%", "+10%", "China", ["eo-14357"]),
    ("hhs-seizure", "reference", "2025-09-10", "Published", "Largest-ever e-cigarette seizure",
     "HHS, FDA and CBP seized 4.7 million unauthorized e-cigarettes worth an estimated $86.5 million in Chicago, almost all shipped from China, many with vague "
     "descriptions and wrong values. FDA said 39 e-cigarette products were authorized at the time.", None, None, "China", ["fda-seizure-2025"]),
    ("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
     "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil from August 6, 2025, on top of the 10% reciprocal duty. Tobacco was not on its "
     "exemption list, so Brazilian leaf paid 50% extra. Ended February 24, 2026.", "+10%", "+50%", "Brazil", ["eo-14323"]),
    ("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
     "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). USMCA-qualifying tobacco stayed exempt. Ended February 24, 2026.", "+25%", "+35%",
     "Canada", ["eo-14325"]),
    ("cn-reciprocal-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal duty cut from 125% to 10%",
     "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025, ending the 170% extra duty on Chinese vapes "
     "(now 20% + 10% + 25%).", "+125%", "+10%", "China", ["eo-14298"]),
    ("cn-125", "extraDuty", "2025-04-10", "Effective", "China reciprocal duty raised to 125% — the \"170% tariff on vapes\"",
     "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. With the 20% fentanyl duty and the 25% List 3 duty, Chinese "
     "e-cigarettes paid 170% on top of their 5–6.5% base rate until May 13, 2025.", "+34%", "+125%", "China", ["eo-14266"]),
    ("reciprocal", "extraDuty", "2025-04-05", "Effective", "Reciprocal tariff on products of all countries",
     "10% baseline (9903.01.25) and country rates (9903.02.xx) on all Chapter 24 goods — no tobacco product was exempt; Canada and Mexico excluded. "
     "Ended February 24, 2026.", None, "+10% or more", "All countries", ["eo-14257"]),
    ("cn-fentanyl-20", "extraDuty", "2025-03-03", "Signed", "China fentanyl duty raised to 20%",
     "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20%. Ended February 24, 2026.", "+10%", "+20%", "China", ["eo-14228"]),
    ("cn-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of China",
     "+10% on Chinese goods under IEEPA, on top of the Section 301 lists. Ended February 24, 2026.", None, "+10%", "China", ["eo-14195"]),
    ("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
     "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.", None, "+25%", "Mexico", ["eo-14194"]),
    ("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
     "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt. Ended February 24, 2026.", None, "+25%", "Canada", ["eo-14193"]),
    ("nicotine-standard", "pending", "2025-01-16", "Proposed", "Proposed: maximum nicotine level in cigarettes and cigars",
     "FDA proposed a product standard capping nicotine in cigarettes and certain other combusted tobacco products. Comments closed September 15, 2025; no final "
     "rule has been published. If finalized it would apply to imported products too.", None, None, "All countries", ["fr-2025-00397"]),
    ("fda-import-alerts", "reference", "2025-01-03", "Published", "FDA: every unauthorized e-cigarette may be detained at import",
     "FDA revised Import Alert 98-07 so that any unauthorized e-cigarette may be detained without physical examination, and moved other unauthorized tobacco "
     "products, such as certain nicotine pouches, to Import Alert 98-06.", None, None, "All countries", ["fda-ia-2025"]),
]
for (cid, typ, date, label, title, detail, before, now, countries, sids) in NEW_CHANGES:
    tu["changes"].append({"id": cid, "type": typ, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now,
                          "countries": countries, "sourceIds": sids})
tu["changes"].sort(key=lambda c: c["date"], reverse=True)
have = {s["id"] for s in tu["sources"]}
for s in EXTRA_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
used = {sid for c in tu["changes"] for sid in c["sourceIds"]} | {sid for e in tu["inEffect"] for sid in e["sourceIds"]}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used or s["id"] in ("hts-now", "hts-before")]

# ------------------------------------------------------------------ understand industry
ui = d["understandIndustry"]
ui["h1"] = f"HTS Chapter 24: {TITLE} — U.S. Import Statistics"
ui["seo"]["title"] = "U.S. Tobacco Imports by Country & Product 2020–2025 — Cigars, Leaf, Vapes, Pouches (HTS Ch. 24) | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of tobacco and nicotine products 2020–2025 by country, product and year: $3.63B in 2025, up 5.6%, led by cigars from the Dominican Republic "
    "and Nicaragua, Brazilian leaf, Mexican cigarettes and nicotine pouches from Denmark and Sweden."
)
ui["seo"]["keywords"] = [
    "us tobacco imports",
    "tobacco imports by country",
    "us cigar imports",
    "cigar imports dominican republic",
    "tobacco import usa",
    "nicotine pouch imports",
    "HTS Chapter 24 import statistics",
]
for s in ui["stats"]:
    if s["label"].startswith("Top 2 share"):
        s["label"] = "Top 2 share (Dominican Republic + Nicaragua)"
    if s["label"] == "Largest product":
        s["note"] = "Cigars, cheroots and cigarillos containing tobacco (2402.10)"
ui["byYearPartners"] = ["Dominican Republic", "Nicaragua"]
ui["byYearCaption"] = "U.S. imports of Chapter 24 goods each year, split into the two largest 2025 suppliers (Dominican Republic and Nicaragua) and everyone else."
for c in ui["byCountry"]:
    if c["country"] == "Dominican Rep.":
        c["country"] = "Dominican Republic"
for c in ui["byHeadingCountry"]:
    if c["country"] == "Dominican Rep.":
        c["country"] = "Dominican Republic"
ui["why"] = (
    "U.S. imports of tobacco and nicotine products grew from **$2.17B in 2020 to $3.63B in 2025**, and by 5.6% in the last year. **Cigars** are the core of the "
    "trade: $1.42B in 2025 (39%, down 5.2%), almost all from the **Dominican Republic ($944M)**, **Nicaragua ($396M)** and **Honduras "
    "($122M)** that enter at a Free base rate under CAFTA-DR. Leaf tobacco (2401) rose 9.1% to $880M, led by Brazil ($227M), Türkiye, the Philippines and "
    "Canada; Brazil's leaf fell 14% while the 50% IEEPA duty applied from August 2025.\n\n"
    "The fastest movers were cigarettes and nicotine products. Cigarette imports (2402.20) jumped 84% to $480M as imports from **Mexico** nearly doubled to $253M — "
    "duty-free when USMCA-qualifying, even during the 2025 tariffs. Nicotine pouches and other oral nicotine products (2404.91) rose 17.8% to $268M; heading 2404 imports from Denmark, Sweden and Canada together reached $260M. E-liquids and vapes "
    "(2404.12) fell 32.9% to $254M: imports from **China dropped from $181M to $33M** while China's goods paid up to 170% extra in 2025 and FDA and CBP seized "
    "millions of unauthorized e-cigarettes; Indonesia ($232M of heading 2404) is now the largest recorded source.\n\n"
    "Two caveats. These figures count only goods declared in Chapter 24 — CBP reports that illicit e-cigarettes are often misclassified or undervalued, and reusable "
    "devices without nicotine are classified in 8543.40. And customs value is only part of the cost of tobacco: the federal excise tax (for example $50.33 per "
    "1,000 cigarettes) is usually larger than the duty. 2025 is the latest full year of U.S. trade data."
)
ui["sources"] = ui["sources"] + [
    {"label": "CBP: Operation Red Mist (May 13, 2026)", "url": "https://www.cbp.gov/newsroom/national-media-release/operation-red-mist-cbp-federal-partners-seize-millions-illegal-e"},
    {"label": "FDA: HHS, CBP seize $86.5 million worth of illegal e-cigarettes (September 10, 2025)", "url": "https://www.fda.gov/news-events/press-announcements/hhs-cbp-seize-865-million-worth-illegal-e-cigarettes-largest-ever-operation"},
    {"label": "27 CFR 41.30–41.33, federal excise tax rates on tobacco products", "url": "https://www.ecfr.gov/current/title-27/part-41/subpart-D"},
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Goods misdeclared under other chapters and "
    "e-cigarette devices without nicotine (8543.40) are not included."
)

# ------------------------------------------------------------------ industry areas
ia = d["industryAreas"]
ia["seo"]["title"] = "Tobacco Tariff Rates by Country — Cigars, Leaf, Vapes from Dominican Republic, Nicaragua, Brazil, China (HTS Ch. 24) | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on tobacco by country and product group: base rate plus the 2026 Section 301 duty, with CAFTA-DR and USMCA applied. Cigars from the "
    "Dominican Republic, Nicaragua and Honduras, leaf from Brazil and Türkiye, vapes from Indonesia and China, pouches from Denmark and Sweden."
)
ia["seo"]["keywords"] = [
    "tariffs on cigars from nicaragua to usa",
    "dominican cigar tariff",
    "tariff on vapes from china",
    "Brazil tobacco tariff",
    "tobacco tariff by country",
    "nicotine pouches tariff",
    "HTS Chapter 24 tariff rates by country",
]
ia["intro"] = (
    "The total rate on tobacco depends on **what it is and where it comes from**. Each cell below is the base rate for that product group plus the extra duty for "
    "that country, minus any preference — computed from the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "**Cigars from the Dominican Republic and Nicaragua pay 12.5%** and from Honduras 10%: CAFTA-DR makes the base rate Free, but not the 2026 Section 301 duty. "
    "USMCA-qualifying goods from Canada and Mexico enter free. **Brazilian leaf pays its base rate plus 37.5%**, Chinese vapes 42.5–44% in total, Indonesian vapes "
    "15–16.5%, and EU nicotine pouches 10% in total. Leaf above the tobacco quota pays 350% from any country without an FTA. Federal excise tax is not included."
)
ia["groups"][1]["shortLabel"] = "Cigars & cigarettes"
ia["groups"][2]["shortLabel"] = "Pipe, chew & snuff"
ia["groups"][3]["shortLabel"] = "Vapes & pouches"
LABELS = {
    "Dominican Republic": "Base rate (Free with a CAFTA-DR claim, SPI P) +12.5% Section 301 (9903.05.34). IEEPA ended February 24, 2026; Section 122 expired July 23, 2026.",
    "Nicaragua": "Base rate (Free with a CAFTA-DR claim, SPI P) +12.5% Section 301 (9903.05.58). The Nicaragua duty (9903.89.01) starts in 2027 and excludes CAFTA-DR originating goods.",
    "Indonesia": "Base rate +10% Section 301 (9903.05.45). No FTA; GSP has lapsed. IEEPA ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: no duty and no extra duty (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55). Outside the tobacco quota.",
    "Brazil": "Base rate +25% Section 301 Brazil action (9903.05.01) +12.5% Section 301 (9903.05.27). Tobacco quota 80,200 t. The 50% IEEPA duties ended February 24, 2026.",
    "Canada": "USMCA-qualifying: no duty and no extra duty (9903.05.93). Otherwise base rate +10% Section 301 (9903.05.29). Outside the tobacco quota.",
    "Türkiye (Turkey)": "Base rate +12.5% Section 301 (9903.05.79). No FTA. IEEPA ended February 24, 2026.",
    "Honduras": "Base rate (Free with a CAFTA-DR claim, SPI P) +10% Section 301 (9903.05.42).",
    "Denmark": "EU: 10% in total when the base rate is lower, otherwise the base rate (9903.05.39). Shares the 9,956 t EU tobacco quota.",
    "India": "Base rate +10% Section 301 (9903.05.44). GSP has lapsed. IEEPA ended February 24, 2026.",
    "Sweden": "EU: 10% in total when the base rate is lower, otherwise the base rate (9903.05.39). Shares the 9,956 t EU tobacco quota.",
    "China": "Base rate +12.5% Section 301 (9903.05.31) +25% List 3 (9903.88.03, 170 lines incl. cigars, cigarettes and vapes) or +7.5% List 4A (9903.88.15, 35 lines). IEEPA ended February 24, 2026.",
    "Any other country": "Countries outside the 60 Section 301 economies (e.g. Zimbabwe, Malawi) pay only the base rate; the other economies pay +10% or +12.5% (9903.05.20–9903.05.84). Cuba: imports prohibited.",
}
for c in ia["countries"]:
    c["rule"]["label"] = LABELS[c["country"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Leaf and cut tobacco groups mix in-quota lines (23.9¢–40.9¢/kg), \"to be used in products other than cigarettes\" lines and over-quota \"Other\" lines (350%). "
    "Which one applies depends on the declared use and on whether the country's quantity under additional U.S. note 5 is still open; select a cell to see the lines.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired "
    "July 23, 2026; neither is applied.",
    "Federal excise tax (cigarettes, cigars, pipe, roll-your-own and smokeless tobacco) is collected by CBP at entry but is not a customs duty and is not included. "
    "FDA marketing authorization decides whether a product can be sold at all, regardless of the rate.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 50, 51 and 52 to Chapter 99 subchapter III and the Section 122 note in the 2026 Revision 21. No Chapter 24 subheading is on the "
    "Section 301 general exemption list (note 52(b), 9903.05.86), the country exception lists (note 52(j)), the Brazil exemption list (note 50), the Section 122 "
    "exemption list (9903.03.03) or the Canada Section 338 lists (note 51). All Chapter 24 subheadings are on China Section 301 List 3 (note 20(f)) or List 4A. "
    "The Nicaragua duty (note 29) excludes CAFTA-DR originating goods, and Colombian tobacco has had no quantity limit under 9918.24.10–9918.24.11 since 2026."
)

# ------------------------------------------------------------------ tariff engineering
te = d["tariffEngineering"]
te["seo"]["title"] = "Importing Tobacco, Cigars & Vapes into the U.S.: TTB Permit, Excise Tax, FDA PMTA & Ways to Lower Duty (HTS Ch. 24) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The documents and rules for each HTS Chapter 24 line — TTB importer permit and federal excise tax, FDA premarket authorization, import alerts and warnings, "
    "the tobacco quota, the Cuba ban — and the legal ways to pay less: the quota, the \"other than cigarettes\" provision, USMCA and CAFTA-DR, samples, bonded "
    "warehouses and drawback."
)
te["seo"]["keywords"] = [
    "tobacco import permit",
    "tobacco import license",
    "TTB importer permit",
    "federal excise tax cigars",
    "importing vapes from china",
    "FDA PMTA import",
    "bringing cuban cigars into the us",
    "import cigarettes into us",
]
te["intro"] = (
    "For tobacco the duty is usually the smallest cost. Before the first entry an importer of cigars, cigarettes, pipe, roll-your-own or smokeless tobacco — or "
    "of stemmed or threshed leaf — needs a **TTB permit**, and CBP collects the **federal excise tax** at entry: $50.33 per 1,000 cigarettes, up to 40.26¢ per "
    "large cigar, $1.51 per pound of snuff. That tax is not a customs duty and is not in the tariff calculator. Every finished product also needs **FDA marketing "
    "authorization**; unauthorized e-cigarettes are detained at the border. Cuban tobacco cannot be imported at all.\n\n"
    "The ways to pay less are written into the schedule: enter cigarette leaf **inside the quota** (23.9¢–40.9¢/kg instead of 350%), declare leaf **for products "
    "other than cigarettes**, **claim USMCA or CAFTA-DR**, bring samples under **Chapter 98**, and defer duty and tax in a **bonded warehouse**. Each depends on "
    "a document, listed below with its regulation."
)
te["regulationsAsOf"] = "2026-10-08"
te["rules"] = RULES
te["levers"] = LEVERS
GROUPS["2401"] = (["ttb-permit", "tobacco-trq", "actual-use", "fda-pesticide", "ofac-cuba"], GROUPS["2401"][1])
GROUPS["2402"] = (GROUPS["2402"][0] + ["fda-flavor"], GROUPS["2402"][1])
GROUPS["2404"] = (["fda-pmta", "fda-entry", "fda-import-alerts", "fda-warnings", "usps-mail"], GROUPS["2404"][1].replace(" The TTB permit applies only to products that are TTB tobacco products.", ""))
for g in te["groups"]:
    g["ruleIds"], g["note"] = GROUPS[g["heading"]]


def line_ids(line):
    hts, head = line["hts"], line["heading"]
    path = " > ".join(line["ancestorPath"] + [line["description"]]).lower()
    in_quota_family = "additional u.s. note 5" in path or line["general"] == "350%"
    other_than_cig = "products other than cigarettes" in path
    rules, levers = [], []
    if head == "2401":
        if hts.startswith("2401.20") or hts.startswith("2401.30"):
            rules.append("ttb-permit")
        if in_quota_family:
            rules.append("tobacco-trq")
        if other_than_cig:
            rules.append("actual-use")
        rules += ["fda-pesticide", "ofac-cuba"]
    elif head == "2402":
        rules += ["ttb-permit", "ttb-excise", "ttb-packages", "fda-pmta", "fda-entry", "fda-warnings", "ofac-cuba"]
        if hts.startswith("2402.20"):
            rules += ["fda-flavor", "usps-mail"]
    elif head == "2403":
        rules += ["ttb-permit", "ttb-excise", "ttb-packages", "fda-pmta", "fda-entry", "fda-warnings"]
        if hts.startswith("2403.99.21"):
            rules.append("fda-import-alerts")
        if in_quota_family:
            rules.append("tobacco-trq")
        if other_than_cig:
            rules.append("actual-use")
        rules.append("ofac-cuba")
        if hts.startswith("2403.19.20.50") or hts.startswith("2403.99.21.30") or hts.startswith("2403.99.21.40"):
            rules.append("usps-mail")
    else:
        rules += ["fda-pmta", "fda-entry", "fda-import-alerts", "fda-warnings"]
        if hts.startswith("2404.1"):
            rules.append("usps-mail")
    if in_quota_family:
        levers += ["tobacco-quota", "other-than-cigarettes"]
    elif other_than_cig:
        levers.append("other-than-cigarettes")
    levers.append("usmca")
    if line["general"] not in ("Free", None):
        levers.append("fta")
    levers.append("samples")
    if head != "2401":
        levers.append("warehouse")
    levers += ["drawback", "ruling"]
    return rules, levers


for line in te["lines"]:
    line["ruleIds"], line["leverIds"] = line_ids(line)
te["disclaimer"] = (
    "This page summarizes official rules for planning; it is not legal advice. Duty, excise tax and admissibility depend on the exact product, its origin and the "
    "documents on the entry. Check the current HTSUS, the eCFR (text current to October 8, 2026), TTB and FDA requirements, and get a binding ruling from CBP "
    "when the classification is uncertain."
)

# ------------------------------------------------------------------ final conclusion
fc = d["finalConclusion"]
fc["seo"]["title"] = "Tobacco Tariffs FAQ: Cigars from Nicaragua & Dominican Republic, Vapes from China, Cuban Cigars, HS Codes (HTS Ch. 24) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people actually search about tobacco tariffs: the tariff on cigars from Nicaragua and the Dominican Republic, the tariff on vapes from China "
    "(and the 170% of 2025), Cuban cigars, nicotine pouches, Brazilian leaf, HS codes for tobacco, cigars and vapes, and the excise tax."
)
fc["seo"]["keywords"] = [
    "tobacco tariffs",
    "is there a tariff on tobacco",
    "tariffs on cigars from nicaragua to usa",
    "tariffs on cuban cigars",
    "tariff on vapes from china",
    "170 tariff on vapes",
    "vape tariff code",
    "hs code for tobacco",
    "cigar tariff code",
    "nicotine pouches tariff code",
    "duty on tobacco products",
    "tobacco import permit",
]
fc["intro"] = (
    "Straight answers to the most common questions about tobacco tariffs and importing tobacco into the U.S. — cigars, leaf, cigarettes, vapes and nicotine pouches, "
    "HS codes, the excise tax and the entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "No tobacco product is exempt from the 2026 Section 301 tariffs: since July 24, 2026, goods of 60 economies pay +10% or +12.5% (12.5% for Dominican and "
    "Nicaraguan cigars even with CAFTA-DR, +37.5% for Brazil and for most Chinese lines). USMCA-qualifying goods from Canada and Mexico enter free.",
    "The base rates are low except one: cigarette leaf above the tobacco quota pays 350%. Brazil has the largest quota (80,200 t); leaf declared for cigars, pipe "
    "or roll-your-own tobacco skips the quota.",
    "The bigger costs sit outside the tariff: the federal excise tax collected at entry (e.g. $50.33 per 1,000 cigarettes, up to 40.26¢ per cigar) and FDA "
    "marketing authorization — unauthorized vapes are detained at the border, and Cuban cigars cannot be imported at all.",
]
fc["questionSource"] = f"Google search suggestions, collected {TODAY}, plus the search keywords of the earlier version of these pages (Brazil tobacco tariff, tobacco tariff-rate quota)"
fc["faqs"] = [
    {
        "id": "tobacco-tariff-now",
        "question": "Is there a tariff on tobacco imports right now?",
        "searchedAs": ["tariff on tobacco", "us tariff on tobacco", "is there a tariff on tobacco", "new tariff on tobacco", "tariffs on tobacco products"],
        "answer": "Yes. Every Chapter 24 product has a base rate — Free on cigar wrapper leaf, 23.9¢–40.9¢/kg on cigarette leaf inside the quota and 350% above it, "
        "57¢/kg + 1.4% on premium cigars, 5–6.5% on vapes, 6.4% on nicotine pouches — and since July 24, 2026 the 2026 Section 301 tariffs add 10% or 12.5% for "
        "goods of 60 economies, with no tobacco exemption. Brazil pays +37.5% and most Chinese lines +37.5%. USMCA-qualifying goods from Canada and Mexico enter free. "
        "The IEEPA tariffs ended on February 24, 2026 and the 10% Section 122 surcharge on July 23, 2026.",
        "link": "",
    },
    {
        "id": "cigars-nicaragua-dr",
        "question": "What is the tariff on cigars from Nicaragua and the Dominican Republic?",
        "searchedAs": ["tariffs on cigars from nicaragua to usa", "tariffs on nicaragua cigars", "nicaragua cigar tariffs", "us tariffs on cigars", "trump tariffs on cigars", "tariffs on cigars 2025"],
        "answer": "12.5% of value. With a CAFTA-DR claim the base cigar rate is Free, but the 2026 Section 301 duty still applies: 12.5% for the Dominican Republic "
        "(9903.05.34) and Nicaragua (9903.05.58), 10% for Honduras (9903.05.42), since July 24, 2026. The separate Nicaragua Section 301 duty (10% from January 1, "
        "2027, 15% from 2028) does not apply to cigars that originate under CAFTA-DR. Without a CAFTA-DR claim, premium cigars also pay 57¢/kg + 1.4%. Federal "
        "excise tax (52.75% of the sale price, capped at 40.26¢ per large cigar) is due on top.",
        "link": "industry-areas",
    },
    {
        "id": "cuban-cigars",
        "question": "Can you import or bring Cuban cigars into the U.S.?",
        "searchedAs": ["tariffs on cuban cigars", "importing cuban cigars into the us", "bringing cuban cigars into the us", "bringing cuban cigars into us"],
        "answer": "No. The Cuban Assets Control Regulations prohibit importing Cuban-origin goods (31 CFR 515.204), and since September 24, 2020 travelers may no "
        "longer bring Cuban cigars home as personal baggage. Cuban products would also pay the Column 2 rates ($9.92/kg + 25% on cigars), but the ban applies first.",
        "link": "tariff-engineering",
    },
    {
        "id": "vapes-china",
        "question": "What is the tariff on vapes from China? Was it 170%?",
        "searchedAs": ["tariff on vapes from china", "170 tariff on vapes", "trump tariff on vapes", "vape tariff 2026", "tariff on chinese vapes", "new tariff on vapes"],
        "answer": "Today Chinese e-liquids and disposable vapes pay their 5% or 6.5% base rate plus 25% (Section 301 List 3) and 12.5% (2026 Section 301): 42.5% or "
        "44% in total. The 170% figure was real but short-lived: from April 10 to May 13, 2025 Chinese goods paid a 125% reciprocal duty and a 20% fentanyl duty "
        "on top of the 25%. The reciprocal duty fell to 10% on May 14, 2025, and all IEEPA duties ended on February 24, 2026. Any vape without FDA marketing "
        "authorization can be detained at the border regardless of the tariff.",
        "link": "tariff-updates",
    },
    {
        "id": "vape-hs-code",
        "question": "What is the HS code for vapes and e-cigarettes?",
        "searchedAs": ["vape tariff code", "e cigarette tariff code", "hs code for vapes", "hs code for disposable vapes", "hs code for vape juice", "electronic cigarette hs code"],
        "answer": "Nicotine e-liquids and pods are classified in 2404.12 (5% or 6.5%), and disposable e-cigarettes have their own statistical lines: "
        "2404.12.05.10 and 2404.12.10.10 (2404.19.05.10 and 2404.19.10.10 for tobacco or nicotine substitutes). Heated tobacco sticks are 2404.11.00.00 "
        "(24.7¢/kg). A reusable device sold without nicotine liquid is classified in 8543.40 (2.6%).",
        "link": "",
    },
    {
        "id": "tobacco-hs-code",
        "question": "What is the HS code for tobacco leaves, chewing tobacco, snuff and shisha?",
        "searchedAs": ["hs code for tobacco", "hs code for tobacco leaves", "hs code for unmanufactured tobacco", "hs code for raw tobacco", "hs code for chewing tobacco", "hs code for shisha tobacco", "hs code for snuff tobacco"],
        "answer": "Raw (unmanufactured) leaf and refuse are heading 2401: 2401.10 for leaf not stemmed, 2401.20 for stemmed or threshed leaf, 2401.30 for refuse. "
        "Hookah or shisha tobacco is 2403.11.00.00 (32.8¢/kg), retail pipe and roll-your-own tobacco 2403.19.20, chewing tobacco 2403.99.21.30 and snuff "
        "2403.99.21.40 (both 24.7¢/kg).",
        "link": "",
    },
    {
        "id": "cigar-cigarette-hs-code",
        "question": "What is the HS code for cigars and cigarettes?",
        "searchedAs": ["cigar tariff code", "hs code for cigars", "cigarette tariff code", "cigarette tariff 2026", "tariff on cigarettes in usa"],
        "answer": "Cigars, cheroots and cigarillos are 2402.10: $1.89/kg + 4.7% if valued under 15¢ each, 57¢/kg + 1.4% from 15¢ up. Cigarettes are 2402.20: "
        "41.7¢/kg + 0.9% for clove cigarettes (which cannot be sold in the U.S.), $1.05/kg + 2.3% for paper-wrapped and $1.50/kg + 3.2% for others. FTA, CAFTA-DR "
        "and USMCA goods are Free; the 2026 Section 301 duty applies to the 60 economies.",
        "link": "",
    },
    {
        "id": "nicotine-pouches",
        "question": "What is the tariff code and duty for nicotine pouches like Zyn?",
        "searchedAs": ["nicotine pouches tariff code", "nicotine pouches tariff", "zyn tariff", "are nicotine pouches considered tobacco products"],
        "answer": "Nicotine pouches are 2404.91.00.00 (for oral application), base rate 6.4%. From Denmark or Sweden they pay 10% in total under the 2026 Section 301 "
        "action, USMCA-qualifying pouches from Canada pay nothing, and Chinese pouches pay 26.4%. FDA regulates them as tobacco products: each needs marketing "
        "authorization, and they are not subject to the federal tobacco excise tax.",
        "link": "industry-areas",
    },
    {
        "id": "brazil-tobacco",
        "question": "What is the tariff on tobacco leaf from Brazil?",
        "searchedAs": ["Brazil tobacco tariff", "tariff on tobacco from brazil"],
        "answer": "Brazilian leaf pays its base rate plus 37.5% of value: 25% under the Brazil Section 301 action (from July 22, 2026) and 12.5% under the 2026 "
        "Section 301 action (from July 24, 2026). Inside Brazil's 80,200 t quota cigarette leaf pays 23.9¢–40.9¢/kg; above it 350%. The 50% IEEPA duties of "
        "August 2025 ended on February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "tobacco-quota",
        "question": "What is the tobacco tariff-rate quota and why is the rate 350%?",
        "searchedAs": ["tobacco tariff rate quota"],
        "answer": "Flue-cured, burley and similar leaf and cut tobacco for cigarettes pays a low in-quota rate (23.9¢–40.9¢/kg) only up to each country's yearly quantity "
        "under additional U.S. note 5 to Chapter 24; above it the rate is 350%. The quota year runs September 13 to September 12: Brazil 80,200 t, Malawi and "
        "Zimbabwe 12,000 t each, Argentina 10,750 t, Guatemala 10,000 t, the EU 9,956 t, others 3,000 t. Canada, Israel and Mexico are outside it, and most FTA "
        "partners pay Free even over quota.",
        "link": "tariff-engineering",
    },
    {
        "id": "excise-vs-duty",
        "question": "How much tax and duty is due on imported cigarettes and cigars?",
        "searchedAs": ["what is the duty on cigarettes", "duty on tobacco products", "how much tax on cigars", "how much tax is on a pack of cigarettes"],
        "answer": "Two separate charges. The customs duty is in the tariff schedule (e.g. $1.05/kg + 2.3% on cigarettes, plus any Section 301 duty). The federal "
        "excise tax, collected by CBP before release, is $50.33 per 1,000 small cigarettes (about $1.01 a pack of 20), 52.75% of the sale price up to 40.26¢ "
        "per large cigar, $50.33 per 1,000 small cigars, $2.8311/lb for pipe tobacco, $24.78/lb for roll-your-own, $1.51/lb for snuff and 50.33¢/lb for chewing "
        "tobacco. State taxes come on top.",
        "link": "tariff-engineering",
    },
    {
        "id": "import-permit",
        "question": "Do I need a permit to import tobacco or cigarettes into the U.S.?",
        "searchedAs": ["tobacco import permit", "tobacco import license", "import cigarettes into us", "tobacco import usa", "import cigars into us"],
        "answer": "Yes for a business. Anyone in the business of importing cigars, cigarettes, pipe, roll-your-own or smokeless tobacco needs a TTB importer permit "
        "(27 CFR 41.190), and importers of processed leaf — stemmed, threshed, cut or flavored — need a processed-tobacco permit (27 CFR 41.231). The products also "
        "need FDA marketing authorization, required warnings and accurate FDA entry data. Personal-use quantities allowed by CBP do not need a permit.",
        "link": "tariff-engineering",
    },
    {
        "id": "import-vapes",
        "question": "Can I import vapes from China?",
        "searchedAs": ["importing vapes from china", "importing vapes", "importing vapes for personal use"],
        "answer": "Only products with FDA marketing authorization may be sold in the U.S. — CBP said in May 2026 that 41 e-cigarette products were authorized. Any "
        "unauthorized e-cigarette may be detained without examination (Import Alert 98-07), and FDA and CBP seized 4.7 million units in one operation in "
        "September 2025 and 18 million in Operation Red Mist in May 2026. The U.S. Mail cannot carry e-cigarettes. Authorized Chinese vapes pay 42.5–44% duty.",
        "link": "tariff-engineering",
    },
    {
        "id": "travelers-cigars",
        "question": "Do travelers pay the tariff on cigars they bring back?",
        "searchedAs": ["bringing cigars into the us", "bringing cigars back into the us"],
        "answer": "The 2026 Section 301 duties do not apply to products for personal use in accompanied baggage (U.S. note 52(a) to Chapter 99). Normal CBP "
        "personal-exemption limits for tobacco still apply, and Cuban cigars cannot be brought in at all.",
        "link": "tariff-updates",
    },
]

json.dump(d, open(path, "w"), ensure_ascii=False, indent=2)
print("filled")
