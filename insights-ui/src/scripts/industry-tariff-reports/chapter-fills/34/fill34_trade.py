"""Trade-dependent and remaining text for Chapter 34 (needs the generated understandIndustry data)."""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import os

TRADE = os.path.join(
    IU + "/src/tariff-data/trade/chapter-34.json"
)
SHORT = "Soap, Detergents, Waxes & Candles"


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def pct(a, b_):
    return f"{a / b_ * 100:.0f}%"


def apply_trade(d):
    u = d["understandIndustry"]
    o = d["overview"]
    ia = d["industryAreas"]
    fc = d["finalConclusion"]
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    trade = json.load(open(TRADE))
    byc = {c["country"]: c for c in trade["byCountry"]}
    hc = {(r["country"], r["heading"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
    head = {h["heading"]: h["byYear"] for h in trade["byHeading"]}
    hs6 = {h["hs6"]: h for h in trade["byHs6"]}
    ca, mx, vn, cn, de = (byc[k] for k in ["Canada", "Mexico", "Viet Nam", "China", "Germany"])
    candles = head["3406"][str(yr)]
    S = dict(
        T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", ca=b(ca["importsUsd"]), mx=b(mx["importsUsd"]), vn=b(vn["importsUsd"]),
        cn=b(cn["importsUsd"]), cn_p=b(cn["priorImportsUsd"]), cn_2020=b(cn["byYear"]["2020"]), de=b(de["importsUsd"]),
        camx=pct(ca["importsUsd"] + mx["importsUsd"], T), candles=b(candles), candles_share=pct(candles, T),
        vn_c=b(hc[("Viet Nam", "3406")]), vn_c_share=pct(hc[("Viet Nam", "3406")], candles), ca_c=b(hc[("Canada", "3406")]),
        cn_c=b(hc[("China", "3406")]), in_c=b(hc[("India", "3406")]), mx_3402=b(hc[("Mexico", "3402")]), ca_3402=b(hc[("Canada", "3402")]),
        cn_3401=b(hc[("China", "3401")]), cn_3407=b(hc[("China", "3407")]), h3402=b(head["3402"][str(yr)]), h3401=b(head["3401"][str(yr)]),
        retail_det=b(hs6["340250"]["importsUsd"]), skin=b(hs6["340130"]["importsUsd"]), h3403=b(head["3403"][str(yr)]),
        h3403_p=b(head["3403"][str(pyr)]), y2020=b(tot[2020]),
    )
    print(S)

    # ---------------- overview
    o["seo"] = {
        "title": "HTS Chapter 34 Import Duty Rates: Soap, Detergent, Lubricant, Wax & Candle Tariffs | KoalaGains",
        "shortDescription": "Searchable duty table for all 48 HTS Chapter 34 lines — soap, liquid hand soap, surfactants, laundry detergent, lubricants, waxes, polishes, candles and modeling clay. Base rates Free to 6.5%, plus who pays the 2026 Section 301 duty, China's extra 25% and 50% on Canadian candles.",
        "keywords": [
            "hts chapter 34",
            "hts chapter 34 import duty rates",
            "hs code for soap",
            "hs code for candles",
            "hs code for detergent",
            "us tariff on chinese candles hts 3406",
            "soap and artificial waxes customs duty",
            "usmca duty exemptions 2026",
        ],
    }
    o["intro"] = (
        "Chapter 34 covers soap and liquid skin cleansers (3401), surfactants and washing and cleaning preparations such as laundry and dish detergents (3402), "
        "lubricating preparations (3403), artificial and prepared waxes (3404), polishes and scouring powders (3405), candles (3406), and modeling pastes and dental "
        f"waxes (3407). Its 48 tariff lines carry base rates from **Free to 6.5%**, and the U.S. imported **{S['T']}** of these goods in {yr}; candles alone were "
        f"{S['candles']}.\n\n"
        "Unlike many chapters, Chapter 34 has **no general exemption** from the 2026 Section 301 tariffs: since July 24, 2026 goods of the 60 listed economies pay "
        "10% or 12.5% on top of the base rate (a flat 10% for the EU, 12.5% for Japan and South Korea). USMCA goods of Canada and Mexico enter Free — except **candles "
        "of Canada, which pay 50%** under Section 338 since August 22, 2026, USMCA or not. Chinese goods pay the 12.5% plus their 2018–2019 Section 301 duties (25% on "
        "most lines), and petroleum wax candles from China are also under an **antidumping order** that the tariff calculator does not include. The IEEPA duties of "
        "2025 ended on February 24, 2026."
    )
    for st in o["stats"]:
        if st["label"].startswith("Canada + Mexico"):
            st["label"] = "Canada + Mexico share"
    ts = o["tradeSnapshot"]
    ts["topCountries"] = [{"name": "Canada", "importsUsd": ca["importsUsd"]}, {"name": "Mexico", "importsUsd": mx["importsUsd"]}]
    ts["biggestLines"] = [{"hts": "3406.00", "label": "Candles"}, {"hts": "3402.50", "label": "Washing and cleaning preparations put up for retail sale"}]
    ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

    # ---------------- understandIndustry
    u["h1"] = f"HTS Chapter 34: {SHORT} — U.S. Import Statistics"
    u["seo"] = {
        "title": "U.S. Soap, Detergent & Candle Imports by Country & Product (HTS Ch. 34) | KoalaGains",
        "shortDescription": f"Where U.S. imports of soap, detergents, lubricants, waxes and candles come from, 2020–{yr}: {S['T']} in {yr}, {S['camx']} from Canada and Mexico, candles mostly from Vietnam. By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "us candle imports",
            "candles from vietnam",
            "us soap imports by country",
            "detergent imports usa",
            "hts 3402 import duty rates",
            "HTS Chapter 34 import statistics",
        ],
    }
    for st in u["stats"]:
        if st["label"] == "Largest product":
            st["note"] = "Candles (3406.00)"
    u["byYearCaption"] = f"U.S. imports of Chapter 34 goods each year, split into the two USMCA partners (Canada and Mexico) and everyone else."
    u["why"] = (
        f"U.S. imports of Chapter 34 goods were **{S['T']} in {yr}**, {S['chg']} on {pyr} and up from {S['y2020']} in 2020. **Canada** ({S['ca']}) and "
        f"**Mexico** ({S['mx']}) supply {S['camx']}, mostly detergents and cleaning preparations ({S['mx_3402']} from Mexico and {S['ca_3402']} from Canada in "
        f"heading 3402) and soap, which enter Free when they qualify for USMCA. Germany ({S['de']}) leads in lubricating preparations and waxes.\n\n"
        f"**Candles** are the largest single line at {S['candles']} ({S['candles_share']} of the chapter). **Vietnam** shipped {S['vn_c']} of them — "
        f"{S['vn_c_share']} — and Canada {S['ca_c']}, while China, whose petroleum wax candles have been under an antidumping order since 1986, shipped "
        f"only {S['cn_c']}. China is still a major supplier of soap ({S['cn_3401']}) and modeling clay ({S['cn_3407']}), but its total fell to {S['cn']} "
        f"from {S['cn_p']} in {pyr} and {S['cn_2020']} in 2020.\n\n"
        "The 2026 changes are not in these figures yet: the Section 301 duty on 60 economies (from July 24, 2026) and the 50% Section 338 duty on Canadian candles "
        f"(from August 22, 2026) apply to the largest non-USMCA suppliers and to Canada's {S['ca_c']} of candles. {yr} is the latest full year of U.S. trade data. "
        "Duty-collected figures aren't available from an official source yet."
    )
    u["sources"] = u["sources"] + [
        {"label": "Federal Register 86 FR 59984 (antidumping duty order on petroleum wax candles from China continued, October 29, 2021)", "url": "https://www.federalregister.gov/documents/2021/10/29/2021-23560/petroleum-wax-candles-from-the-peoples-republic-of-china-continuation-of-the-antidumping-duty-order"},
    ]

    # ---------------- industryAreas
    ia["seo"] = {
        "title": "Soap, Detergent & Candle Tariffs by Country — Canada, Mexico, Vietnam, China, EU (HTS Ch. 34) | KoalaGains",
        "shortDescription": "The total U.S. tariff on soap, detergents, lubricants, waxes, polishes and candles by country and product group: Free under USMCA (Canadian candles 50%), 12.5% for Vietnam, a flat 10% for the EU, up to 44% for China.",
        "keywords": [
            "hts chapter 34 import duty rates",
            "tariff on candles from vietnam",
            "tariff on candles from canada",
            "germany tariff on organic surface-active agents",
            "china import duty on modeling pastes",
            "soap tariff by country",
        ],
    }
    ia["intro"] = (
        "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
        "Base rates run from Free (soap bars, waxes, polishes, candles, modeling clay) to 6.5% (some surfactants and lubricants).\n\n"
        "**USMCA** goods of Canada and Mexico enter Free — except **Canadian candles, 50%** under Section 338. The 60 Section 301 economies pay 10% or 12.5% on "
        "top, or a flat 10% (EU) or 12.5% (Japan, South Korea) where the base rate is lower. **China** pays 12.5% plus 25% on most lines (7.5% on candles). "
        "The table does **not** include the antidumping duty on petroleum wax candles from China, or the pharmaceutical-use exemption that five surfactant lines "
        "can claim."
    )
    EXEMPT = "No Chapter 34 line is on a Section 301 exemption list except five pharmaceutical-use subheadings (note 52(e))"
    labels = {
        "Canada": ("USMCA-qualifying: Free (9903.05.93), except candles: +50% Section 338 (9903.03.14) even under USMCA. Otherwise base rate +10% Section 301 (9903.05.29), candles 60%. The 2025 IEEPA duty (35% on non-USMCA goods) ended February 24, 2026.",
                   ["fr-2026-15181", "procl-11048", "procl-11056", "eo-14389", "hts-now"]),
        "Mexico": ("USMCA-qualifying: Free (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55). The 2025 IEEPA duty (25% on non-USMCA goods) ended February 24, 2026.",
                   ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Vietnam": (f"Base rate +12.5% Section 301 (9903.05.84). {EXEMPT}. The 2025 IEEPA reciprocal duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "China": ("Base rate +12.5% (9903.05.31) + Section 301 List 3 +25% (9903.88.03) on 34 subheadings, List 2 +25% (9903.88.02) on three lubricant subheadings, List 4A +7.5% (9903.88.15) on candles and 3401.19.00 (excluded for 3401.19.00.00 through November 9, 2026); modeling pastes 12.5% only. Candle antidumping duty not shown.",
                  ["fr-2026-15181", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2025-21671", "fr-2026-20510", "hts-now"]),
        "Germany": (f"EU: 10% total in place of the base rate (9903.05.39), because every Chapter 34 base rate is below 10%. {EXEMPT}. The 15% IEEPA reciprocal rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "France": (f"EU: 10% total in place of the base rate (9903.05.39). {EXEMPT}. The 15% IEEPA reciprocal rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Italy": (f"EU: 10% total in place of the base rate (9903.05.39). {EXEMPT}. The 15% IEEPA reciprocal rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "South Korea": ("12.5% total in place of the base rate (9903.05.71), with or without a KORUS claim (note 52(a)). The 2025 IEEPA reciprocal duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Japan": ("12.5% total in place of the base rate (9903.05.49). The 2025 IEEPA reciprocal duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "India": (f"Base rate +10% Section 301 (9903.05.44). {EXEMPT}. The 2025 IEEPA duties on India ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "United Kingdom": (f"Base rate +10% Section 301 (9903.05.81); no Chapter 34 line is on the UK list (note 52(j)(1)). The 10% IEEPA reciprocal duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Colombia": ("Base rate +12.5% Section 301 (9903.05.32). The U.S.–Colombia TPA preference (CO) removes the base rate where the line offers it, but not the 12.5% (note 52(a)).", ["fr-2026-15181", "hts-now"]),
        "Any other country": ("Range for the other countries: base rate only for countries outside the 60 Section 301 economies (Nicaragua's own Section 301 duty is 0% until January 1, 2027), base +10% or +12.5% for the others, and base +37.5% for Brazil (Section 301 25% + 12.5%). Russia and the other column 2 countries are not included.",
                              ["fr-2026-15181", "fr-2026-14542", "fr-2025-23892", "hts-now"]),
    }
    for c in ia["countries"]:
        c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
    have = {s["id"] for s in ia["sources"]}
    tu_src = {s["id"]: s for s in d["tariffUpdates"]["sources"]}
    for c in ia["countries"]:
        for sid in c["rule"]["sourceIds"]:
            if sid not in have:
                ia["sources"].append(tu_src[sid])
                have.add(sid)
    for sid in ["cbp-gsp", "crs-agoa", "ustr-agoa-2026"]:
        if sid not in have:
            ia["sources"].append(tu_src.get(sid) or next(s for s in __import__("fill34_static").EXTRA_SOURCES if s["id"] == sid))
            have.add(sid)
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the 10% Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
        "The pharmaceutical-use exemption (9903.05.89; Brazil 9903.05.06) for 3401.30.10, 3402.42.10, 3402.42.20, 3402.42.90 and 3402.50.11 is not applied: it depends on the end use.",
        "The antidumping duty on petroleum wax candles from China is not included; it is set per exporter by the Commerce Department.",
        "AGOA was reauthorized on February 3, 2026 through December 31, 2026 (P.L. 119-75); GSP has been expired since December 31, 2020, so GSP claims pay the general rate. Neither changes the Section 301 duty.",
        "Agency rules still apply at entry: TSCA certification for chemicals, EPA registration for disinfecting cleaners, FDA rules for cosmetics and antiseptic washes, and the CPSC lead-wick ban for candles.",
    ]

    # ---------------- finalConclusion
    fc["h1"] = f"HTS Chapter 34: {SHORT} — Tariff FAQ"
    fc["seo"] = {
        "title": "Soap, Detergent & Candle Tariffs FAQ: HS Codes, China Candle Duty, Canada 50% (HTS Ch. 34) | KoalaGains",
        "shortDescription": "Answers to what people search about Chapter 34 imports: the HS code for soap, hand soap, detergent, lubricants, wax, shoe polish and candles, the tariff and antidumping duty on candles from China, and Canada's 50% candle duty.",
        "keywords": [
            "hs code for soap",
            "hts code for candles",
            "anti dumping duty on candles from china",
            "us candle import tariffs",
            "hs code for laundry detergent",
            "hs code for hand soap",
            "hs code for lubricants",
            "hs code for shoe polish",
            "hs code for modeling clay",
            "hts chapter 34",
        ],
    }
    fc["intro"] = "Straight answers to the most common searches about U.S. imports of soap, detergents, lubricants, waxes, polishes and candles — HS codes, duty by country and the candle antidumping order. Each answer links to the page with the full detail."
    fc["keyTakeaways"] = [
        "Chapter 34 base rates run from Free to 6.5%, but the chapter has no general exemption from the 2026 Section 301 tariffs: goods of 60 economies pay 10% or 12.5% more (a flat 10% for the EU, 12.5% for Japan and South Korea).",
        "USMCA goods of Canada and Mexico enter Free — except candles of Canada, which pay 50% under Section 338 since August 22, 2026, even under USMCA.",
        "Chinese goods pay 12.5% plus 25% on most lines (7.5% on candles), and petroleum wax candles from China also carry an antidumping duty that is under its sixth five-year review. The 2025 IEEPA duties ended February 24, 2026.",
    ]
    fc["questionSource"] = "Google search suggestions (U.S. English), collected October 12, 2026"
    fc["faqs"] = [
        dict(id="hs-soap", question="What is the HS code for soap?",
             searchedAs=["hs code for soap", "hts code for soap", "harmonized tariff code for soap", "hs code for soap bar", "hs code for bar soap", "soap tariff code", "hs code for laundry soap"],
             answer="Heading 3401. Toilet soap in bars is 3401.11 (Castile soap 3401.11.10, other 3401.11.50); other bar soap, such as laundry bars, 3401.19; soap flakes, powder and paste 3401.20; liquid or cream skin cleansers put up for retail sale 3401.30. All are Free except 3401.30.10, 4%, for skin cleansers containing an aromatic surfactant. Shampoo, shaving cream and bath preparations are Chapter 33 (chapter note 1), and soap dishes and dispensers are not in Chapter 34.",
             link=""),
        dict(id="hs-hand-soap", question="What is the HS code for liquid hand soap and body wash?",
             searchedAs=["hs code for hand soap", "hand soap hs code", "tariff code for hand soap", "hs code for liquid soap", "tariff code for liquid soap", "hs code for liquid body wash", "hs code for hand wash liquid"],
             answer="3401.30: organic surface-active products for washing the skin, in liquid or cream form, put up for retail sale. 3401.30.50 is Free; 3401.30.10, for products containing an aromatic or modified aromatic surfactant, is 4%. From China they pay 37.5% more (Section 301 List 3 plus the 2026 12.5%); from the EU a flat 10%; from Mexico or Canada under USMCA nothing.",
             link=""),
        dict(id="hs-candles", question="What is the HS code for candles?",
             searchedAs=["hs code for candles", "hts code for candles", "harmonized tariff code for candles", "candle tariff code", "hs code for scented candles", "soy candles hs code", "hts 3406"],
             answer="3406.00.00 — candles, tapers and the like, scented or not and whatever the wax. It is a single U.S. line with a Free general rate. Candle holders and candlesticks are not in Chapter 34.",
             link=""),
        dict(id="candle-tariffs", question="What are the U.S. tariffs on candles?",
             searchedAs=["us candle import tariffs", "candle tariffs", "tariffs on candles", "candles from vietnam", "import candles from india"],
             answer=f"The base rate is Free, so the duty is the extra tariff for the country: 12.5% from Vietnam (the largest supplier, {S['vn_c']} in {yr}), 10% from India or the UK, a flat 10% from the EU, Free from Mexico under USMCA, 50% from Canada (Section 338, even under USMCA), and 20% from China plus an antidumping duty on petroleum wax candles.",
             link="industry-areas"),
        dict(id="candles-china", question="Is there an antidumping duty on candles from China?",
             searchedAs=["anti dumping duty on candles from china", "anti dumping duty candles", "import candles from china", "scented candles import from china", "candles from china"],
             answer=f"Yes. Petroleum wax candles from China have been under an antidumping duty order since 1986. Commerce continued it on October 29, 2021, finding that revocation would likely lead to dumping margins of up to 104.33%, and a sixth five-year review began on September 1, 2026. The cash deposit depends on the exporter and is paid on top of the tariff: 7.5% Section 301 List 4A plus the 12.5% 2026 Section 301 duty. U.S. imports of candles from China were only {S['cn_c']} in {yr}.",
             link="tariff-updates"),
        dict(id="hs-detergent", question="What is the HS code for laundry detergent and dish soap?",
             searchedAs=["hs code for detergent", "hs code for laundry detergent", "hts code for laundry detergent", "hs code for detergent powder", "hs code for detergent liquid", "hs code for laundry detergent pods", "hs code for dish soap", "hs code for dishwashing liquid"],
             answer="Washing and cleaning preparations put up for retail sale — laundry detergent (powder, liquid or pods) and dishwashing liquid — are 3402.50: 3402.50.11 (4%) if they contain an aromatic or modified aromatic surfactant, otherwise 3402.50.51 (Free). The same preparations not for retail sale are 3402.90 (3.7% to 4%). Laundry soap in bars is 3401.19 and soap powder 3401.20.",
             link=""),
        dict(id="hs-3402", question="What does HS code 3402 cover?",
             searchedAs=["hs code 3402", "hts 3402", "hs code 3402.90", "hs code 3402.50", "hs code 3402.42", "hs code 3402.39", "hs code for surfactant", "hs code for anionic surfactant"],
             answer=f"Organic surface-active agents other than soap and the preparations made from them: linear alkylbenzene sulfonic acids and salts (3402.31), other anionic surfactants (3402.39), cationic (3402.41), nonionic (3402.42) and other surfactants (3402.49), retail washing and cleaning preparations (3402.50) and other preparations (3402.90). Rates are 3.7% to 6.5%, except Free for 3402.50.51. It is the largest Chapter 34 heading by value: {S['h3402']} of imports in {yr}.",
             link=""),
        dict(id="hs-lubricant", question="What is the HS code for lubricants and grease?",
             searchedAs=["hs code for lubricants", "hs code for lubricant oil", "hs code for lubricant grease", "hs code for lubricant spray", "hs code 3403", "hs code 3403.99", "hs code 3403.19", "lubricant tariff code"],
             answer="Heading 3403 covers lubricating preparations, cutting oils, mold-release and anti-rust preparations with less than 70% by weight of petroleum oil; with 70% or more they are petroleum oils of Chapter 27 (2710). Within 3403, preparations with 50% or more petroleum oil pay 0.2% (3403.11.20, 3403.19.10); others 1.4% to 6.5% (3403.99.00, other lubricating preparations, 6.5%). Spray lubricants in aerosol cans are hazardous materials in transport.",
             link=""),
        dict(id="hs-wax", question="What is the HS code for wax and candle wax?",
             searchedAs=["hs code for wax", "hs code for candle wax", "hs code for wax candle", "hs code for wax beads"],
             answer="Artificial and prepared waxes — blends of different waxes, chemically produced waxes and polyethylene glycol waxes — are heading 3404 (3404.20, 3404.90), all Free. Under chapter note 5, unmixed beeswax and other unmixed animal or vegetable waxes are heading 1521, and paraffin and other mineral waxes heading 2712. Finished candles are 3406.00.00.",
             link=""),
        dict(id="hs-polish", question="What is the HS code for shoe polish and car wax?",
             searchedAs=["hs code for shoe polish", "hs code for shoe cream", "hs code for car wax", "hs code for car wax polish", "hs code 3405"],
             answer="Heading 3405, all Free: polishes and creams for footwear or leather 3405.10, for wooden furniture and floors 3405.20, for car bodywork 3405.30, scouring pastes and powders 3405.40, and other polishes such as metal or glass polish 3405.90. Waxes dispersed in a liquid medium belong here rather than in 3404 (chapter note 5). From China they pay 37.5% more.",
             link=""),
        dict(id="hs-modeling-clay", question="What is the HS code for modeling clay and play dough?",
             searchedAs=["hs code for modeling clay", "hs code for play dough", "play doh hs code", "hs code for modeling dough", "hs code for molding clay"],
             answer=f"3407.00.20 — modeling pastes, including those put up for children's amusement; dental waxes and impression compounds are 3407.00.40. Both are Free, and neither is on a China Section 301 list, so Chinese modeling clay pays only the 12.5% 2026 duty. China shipped {S['cn_3407']} of heading 3407 in {yr}. Children's modeling compounds need art-material labeling and a Children's Product Certificate.",
             link="tariff-engineering"),
        dict(id="china-soap", question="What is the tariff on soap imported from China?",
             searchedAs=["import soap from china"],
             answer="Most Chinese soap pays its base rate plus 37.5%: 25% under Section 301 List 3 (9903.88.03) and 12.5% under the 2026 action (9903.05.31). Subheading 3401.19.00 (other soap in bars and soap- or detergent-impregnated paper and nonwovens) is on List 4A instead, and a USTR exclusion removes that 7.5% through November 9, 2026, so it pays 12.5%. The IEEPA duties on China ended February 24, 2026.",
             link="industry-areas"),
        dict(id="chapter-34", question="What does HTS Chapter 34 cover?",
             searchedAs=["hts chapter 34", "htsus chapter 34", "us hts chapter 34", "chapter 34 hts"],
             answer=f"Soap, organic surface-active agents, washing preparations, lubricating preparations, artificial and prepared waxes, polishing and scouring preparations, candles, modeling pastes, dental waxes and plaster-based dental preparations: headings 3401 to 3407, split into 48 ten-digit U.S. lines with base rates from Free to 6.5%. U.S. imports were {S['T']} in {yr}.",
             link=""),
    ]
