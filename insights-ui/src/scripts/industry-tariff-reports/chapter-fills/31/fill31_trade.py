"""Trade-dependent and remaining text for Chapter 31 (needs the generated understandIndustry data)."""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401



def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def apply_trade(d):
    u = d["understandIndustry"]
    o = d["overview"]
    ia = d["industryAreas"]
    fc = d["finalConclusion"]
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    import json
    trade = json.load(open(IU + "/src/tariff-data/trade/chapter-31.json"))
    byc = {c["country"]: c for c in trade["byCountry"]}
    ca, ru, ma, cn_ = byc["Canada"], byc["Russian Federation"], byc["Morocco"], None
    lanes = {(l["country"], l["heading"]): l["importsUsd"] for l in ia["biggestLanes"]}
    hc = {}
    for r in u["byHeadingCountry"]:
        hc[(r["country"], r["heading"])] = r["importsUsd"]
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    line = {l["hs6"]: l for l in u["byLine"]}
    potash, urea, uan = line["3104.20"]["importsUsd"], line["3102.10"]["importsUsd"], line["3102.80"]["importsUsd"]
    dap, map_ = line["3105.30"], line["3105.40"]
    ca_pot = hc[("Canada", "3104")]
    ru_n = hc[("Russian Federation", "3102")] if ("Russian Federation", "3102") in hc else hc[("Russia", "3102")]
    cn_imp = byc["China"]["importsUsd"]
    peak = max(tot.items(), key=lambda kv: kv[1])
    share_ca = ca["importsUsd"] / T * 100
    share_top2 = (ca["importsUsd"] + ru["importsUsd"]) / T * 100
    S = dict(
        T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", ca=b(ca["importsUsd"]), ca_share=f"{share_ca:.0f}%", ru=b(ru["importsUsd"]),
        ru_chg=f"{(ru['importsUsd'] - ru['priorImportsUsd']) / ru['priorImportsUsd'] * 100:+.0f}%", top2=f"{share_top2:.0f}%",
        potash=b(potash), urea=b(urea), uan=b(uan), ca_pot=b(ca_pot), ru_n=b(ru_n), peak_y=peak[0], peak=b(peak[1]),
        dap=b(dap["importsUsd"]), dap_p=b(dap["priorImportsUsd"]), map=b(map_["importsUsd"]), map_p=b(map_["priorImportsUsd"]),
        ma=b(ma["importsUsd"]), ma_p=b(ma["priorImportsUsd"]), cn=b(cn_imp) if cn_imp else "$0",
        h3105=b(head["3105"]), potash_share=f"{potash / T * 100:.0f}%",
    )
    print(S)

    # ---------------- overview
    o["seo"] = {
        "title": "HTS Chapter 31: Fertilizer Tariff Rates — Potash, Urea, DAP & NPK Import Duties | KoalaGains",
        "shortDescription": f"Searchable duty table for all 29 HTS Chapter 31 fertilizer lines — potash, urea, UAN, ammonium sulfate, superphosphates, DAP, MAP and NPK. All Free at base; who pays extra (China 25%), the 2026 Section 301 exemption, and the phosphate countervailing duties.",
        "keywords": [
            "HTS Chapter 31",
            "fertilizer tariffs",
            "potash tariffs",
            "fertilizer import duty",
            "urea tariff",
            "HS code for fertilizer",
            "DAP MAP tariff",
            "fertilizer tariff exemption",
        ],
    }
    o["intro"] = (
        "Chapter 31 covers fertilizers: animal and vegetable fertilizers (3101), nitrogen fertilizers such as urea, UAN and ammonium sulfate (3102), "
        "phosphates (3103), potash (3104), and mixed fertilizers such as DAP, MAP and NPK (3105). **All 29 tariff lines are Free** under the general "
        f"rate, and the U.S. imported **{S['T']}** of them in {yr} — {S['potash']} of it potash, mostly from Canada.\n\n"
        "Fertilizers are also exempt from most of the extra duties of 2025–2026: they were taken out of the reciprocal tariff on November 13, 2025, the "
        "IEEPA duties ended on February 24, 2026, and every Chapter 31 subheading is on the exemption list of the **2026 Section 301 tariffs** (U.S. note 52(b)). "
        "The one extra tariff left is **25% on fertilizers from China** (Section 301 List 3). What can still cost money is not a tariff but a trade remedy: "
        "**countervailing duties** on phosphate fertilizers from Morocco and Russia and **antidumping and countervailing duties** on ammonium sulfate from China — "
        "set per company by the Commerce Department and not included in the tariff calculator."
    )
    for st in o["stats"]:
        if st["label"].startswith("Canada + Russia"):
            st["label"] = "Canada + Russia share"
    ts = o["tradeSnapshot"]
    ts["topCountries"] = [{"name": "Canada", "importsUsd": ca["importsUsd"]}, {"name": "Russia", "importsUsd": ru["importsUsd"]}]
    ts["biggestLines"] = [{"hts": "3104.20", "label": "Potassium chloride (potash)"}, {"hts": "3102.10", "label": "Urea"}]
    ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

    # ---------------- understandIndustry
    u["h1"] = "HTS Chapter 31: Fertilizers — U.S. Import Statistics"
    u["seo"] = {
        "title": "U.S. Fertilizer Imports by Country & Product — Potash, Urea, DAP (HTS Ch. 31) | KoalaGains",
        "shortDescription": f"Where U.S. fertilizer imports come from, 2020–{yr}: {S['T']} in {yr}, {S['ca_share']} from Canada (mostly potash) and {S['ru']} from Russia. By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "fertilizer imports usa",
            "where does the us import fertilizer from",
            "fertilizer imports by country",
            "us potash imports canada",
            "us fertilizer imports from russia",
            "HTS Chapter 31 import statistics",
        ],
    }
    u["byYearPartners"] = ["Canada", "Russian Federation"]
    u["byYearCaption"] = "U.S. imports of Chapter 31 fertilizers each year, split into the two largest suppliers in 2025 (Canada and Russia) and everyone else."
    for st in u["stats"]:
        if st["label"].startswith("Top 2 share"):
            st["label"] = "Canada + Russia share"
        if st["label"] == "Largest product":
            st["note"] = "Potassium chloride, i.e. potash (3104.20)"
    u["why"] = (
        f"U.S. fertilizer imports were **{S['T']} in {yr}**, {S['chg']} from {S['P']} in {pyr} and well below the {S['peak_y']} peak of {S['peak']}, when "
        f"world fertilizer prices spiked. Two suppliers dominate: **Canada** ({S['ca']}, {S['ca_share']}), almost all of it potash ({S['ca_pot']} in heading 3104), "
        f"and **Russia** ({S['ru']}, {S['ru_chg']} on {pyr}), mostly nitrogen fertilizers such as urea and UAN ({S['ru_n']} in heading 3102). "
        "Qatar, Trinidad and Tobago, Nigeria and Algeria ship nitrogen fertilizers; Saudi Arabia, Mexico, Morocco and Lithuania mainly mixed fertilizers such as DAP and MAP (heading 3105); Israel phosphates and potash.\n\n"
        f"Tariffs explain little of this, because every line is Free and fertilizers were exempted from most of the 2025–2026 extra duties. The trade remedies "
        f"show more clearly: imports of DAP fell from {S['dap_p']} to {S['dap']} and MAP from {S['map_p']} to {S['map']} in {yr}, and Morocco, under a "
        f"countervailing duty order since 2021, shipped {S['ma']} (down from {S['ma_p']}). Chinese fertilizer, which pays the 25% List 3 duty, was only {S['cn']}. "
        f"Belarusian potash, blocked by U.S. sanctions from 2021, was almost absent; its producers were taken off the sanctions list on March 26, 2026.\n\n"
        f"{yr} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
    )
    u["sources"] = u["sources"] + [
        {"label": "Federal Register 86 FR 18037 (countervailing duty orders on phosphate fertilizers from Morocco and Russia, April 7, 2021)", "url": "https://www.federalregister.gov/documents/2021/04/07/2021-07170/phosphate-fertilizers-from-the-kingdom-of-morocco-and-the-russian-federation-countervailing-duty"},
        {"label": "U.S. Treasury OFAC, Belarus designations removals (March 26, 2026)", "url": "https://ofac.treasury.gov/recent-actions/20260326"},
    ]

    # ---------------- industryAreas
    ia["seo"] = {
        "title": "Fertilizer Tariff Rates by Country — Canada Potash, Russia, Morocco, China (HTS Ch. 31) | KoalaGains",
        "shortDescription": "The total U.S. tariff on fertilizers by country and product group: Free for Canada, Russia, Saudi Arabia, Qatar, Morocco, Trinidad and Tobago and the other main suppliers, 25% for China. With the 2026 Section 301 exemption and the AD/CVD orders explained.",
        "keywords": [
            "tariff on fertilizer from canada",
            "potash tariffs canada",
            "russian fertilizer tariffs",
            "morocco fertilizer tariffs",
            "fertilizer tariffs eu",
            "fertilizer tariff by country",
        ],
    }
    ia["intro"] = (
        "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
        "For fertilizers the answer is short: **Free for every supplier except China**, which pays the 25% Section 301 List 3 duty.\n\n"
        "That is because every Chapter 31 subheading is on the exemption list of the 2026 Section 301 tariffs on 60 economies (U.S. note 52(b)), so "
        "Canada, Mexico, Russia, Morocco, the EU and the others pay nothing extra, with or without a USMCA claim. The table does **not** include "
        "antidumping or countervailing duties: phosphate fertilizers from Morocco and Russia and ammonium sulfate from China pay a company-specific cash "
        "deposit on top (see Tariff updates and Import documents)."
    )
    EXEMPT = "All Chapter 31 subheadings are on the 2026 Section 301 exemption list (U.S. note 52(b), 9903.05.86)"
    labels = {
        "Canada": (f"Free, with or without a USMCA claim: {EXEMPT}, so the 10% Section 301 duty on Canada (9903.05.29) does not apply. The 2025 IEEPA duty (35%; potash 10%) ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Mexico": (f"Free, with or without a USMCA claim: {EXEMPT}, so the 10% Section 301 duty on Mexico (9903.05.55) does not apply. The 2025 IEEPA duty (25%; potash 10%) ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Russia": ("Free. Russia's Column 2 rate is also Free for every Chapter 31 line, and the 12.5% Section 301 duty (9903.05.66) does not apply under note 52(b). Phosphate fertilizers carry a separate countervailing duty (JSC Apatit 12.71%), not shown.", ["fr-2026-15181", "fr-2026-07503", "hts-now"]),
        "Morocco": ("Free. The 12.5% Section 301 duty (9903.05.56) does not apply under note 52(b). Phosphate fertilizers carry a separate countervailing duty (OCP 16.60%), not shown, which Commerce can waive under Proclamation 11038.", ["fr-2026-15181", "fr-2024-30693", "procl-11038", "hts-now"]),
        "Lithuania": ("EU: Free. The EU's 10% Section 301 rate (9903.05.39) does not apply, because every Chapter 31 subheading is on the note 52(b) exemption list. The 15% IEEPA reciprocal rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "China": ("Base rate (Free) + 25% Section 301 List 3 (9903.88.03), which covers every Chapter 31 subheading. The 12.5% 2026 Section 301 duty (9903.05.31) does not apply under note 52(b); the IEEPA duties ended February 24, 2026. Ammonium sulfate also carries AD/CVD, not shown.", ["fr-2018-20610", "fr-2019-09681", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
        "Any other country": ("Free for every other country: 25% applies only to China. The 60 Section 301 economies are exempt under note 52(b), Brazil's 25% duty under note 50(a)(ii), and Nicaragua's Section 301 duty is 0% until January 1, 2027.", ["fr-2026-15181", "fr-2026-14542", "fr-2025-23892", "hts-now"]),
    }
    for c in ia["countries"]:
        if c["country"] in labels:
            c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
        else:
            c["rule"]["label"] = f"Free. {EXEMPT}, so no Section 301 duty applies. The 2025 IEEPA reciprocal duty ended February 24, 2026."
            c["rule"]["sourceIds"] = ["fr-2026-15181", "eo-14389", "hts-now"]
    have = {s["id"] for s in ia["sources"]}
    tu_src = {s["id"]: s for s in d["tariffUpdates"]["sources"]}
    for c in ia["countries"]:
        for sid in c["rule"]["sourceIds"]:
            if sid not in have:
                ia["sources"].append(tu_src[sid])
                have.add(sid)
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01), which exempted fertilizers, expired July 23, 2026; neither is applied.",
        "Antidumping and countervailing duties are not included: phosphate fertilizers from Morocco (OCP 16.60%) and Russia (JSC Apatit 12.71%), and ammonium sulfate from China (China-wide antidumping rate 493.46%). Their rates are company-specific.",
        "Origin and entry rules still apply: animal-origin fertilizers need USDA APHIS clearance (9 CFR part 95), and fertilizer-pesticide mixes an EPA Notice of Arrival.",
    ]

    # ---------------- tariffUpdates: generator pending entry (Nicaragua)
    for c in d["tariffUpdates"]["changes"]:
        if c["type"] == "pending" and "TODO" in c["detail"]:
            c["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
            c["detail"] = (
                "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
                "(9903.89.01, U.S. note 29), with no exemption list for fertilizers. The rate is 0% in 2026."
            )

    # ---------------- finalConclusion
    fc["h1"] = "HTS Chapter 31: Fertilizers — Tariff FAQ"
    fc["seo"] = {
        "title": "Fertilizer Tariffs FAQ: Canada Potash, Russia, Morocco Phosphate, China, HS Codes (HTS Ch. 31) | KoalaGains",
        "shortDescription": "Answers to what people search about fertilizer tariffs: is there a tariff on Canadian potash, are fertilizers exempt, Trump fertilizer tariffs, Russian and Moroccan fertilizer, HS codes for urea, NPK and DAP.",
        "keywords": [
            "tariff on fertilizer from canada",
            "potash tariffs canada",
            "is fertilizer exempt from tariffs",
            "trump fertilizer tariffs",
            "russian fertilizer tariffs",
            "morocco phosphate tariffs",
            "hs code for urea fertilizer",
            "hs code for npk fertilizer",
            "where does the us import fertilizer from",
            "potash belarus sanctions",
        ],
    }
    fc["intro"] = "Straight answers to the most common questions about U.S. tariffs on fertilizer imports — by country, by product and by HS code. Each answer links to the page with the full detail."
    fc["keyTakeaways"] = [
        "Every Chapter 31 fertilizer line is Free under the general rate, and fertilizers are exempt from the 2026 Section 301 tariffs (U.S. note 52(b)): Canada, Russia, Morocco, the EU and other suppliers pay no extra tariff.",
        "The only extra tariff is 25% on fertilizers from China (Section 301 List 3). The 2025 IEEPA duties — including 10% on non-USMCA potash — ended on February 24, 2026.",
        "Countervailing duties still apply to phosphate fertilizers from Morocco (OCP 16.60%, waivable under Proclamation 11038) and Russia (JSC Apatit 12.71%), and AD/CVD to ammonium sulfate from China. The tariff calculator does not include them.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 11, 2026"
    fc["faqs"] = [
        dict(id="canada-potash", question="Is there a tariff on potash or fertilizer from Canada?",
             searchedAs=["tariff on fertilizer from canada", "tariffs on potash from canada", "are there tariffs on potash from canada", "potash tariffs canada", "us tariff on canadian fertilizer"],
             answer=f"No. Potash (3104.20) and every other Chapter 31 line are Free, and U.S. note 52(b) exempts them from the 10% Section 301 duty on Canadian goods, with or without a USMCA claim. In 2025 non-USMCA potash paid a 10% IEEPA duty (other fertilizers 25%, then 35%), but those duties ended on February 24, 2026. Canada supplied {S['ca']} of U.S. fertilizer imports in {yr}, mostly potash.",
             link="industry-areas"),
        dict(id="exempt", question="Are fertilizers exempt from tariffs?",
             searchedAs=["is fertilizer exempt from tariffs", "potash tariff exemption", "fertilizer tariffs us"],
             answer="Mostly yes. All Chapter 31 lines are Free under the general rate; fertilizers were exempted from the reciprocal tariff on November 13, 2025 (Executive Order 14360) and from the Section 122 surcharge, and they are on the exemption list of the 2026 Section 301 tariffs (U.S. note 52(b)). Two exceptions remain: China-origin fertilizer pays 25% under Section 301 List 3, and some products from some countries pay antidumping or countervailing duties.",
             link="tariff-updates"),
        dict(id="trump-tariffs", question="What happened to the Trump tariffs on fertilizer?",
             searchedAs=["trump fertilizer tariffs", "trump tariff on fertilizer", "new tariff on fertilizer", "trump fertilizer tariffs canada"],
             answer="In 2025 IEEPA duties applied to non-USMCA fertilizers from Canada and Mexico (potash 10%, others 25%, Canada later 35%) and the April 2025 reciprocal tariff to most fertilizers from other countries, except potash and three mixed-fertilizer lines. Executive Order 14360 exempted all fertilizers from the reciprocal tariff on November 13, 2025, and after the Supreme Court's February 20, 2026 ruling all IEEPA duties ended on February 24, 2026. The 2026 Section 301 tariffs exempt fertilizers.",
             link="tariff-updates"),
        dict(id="russia", question="Are there tariffs on fertilizer from Russia?",
             searchedAs=["russian fertilizer tariffs", "fertilizer import from russia", "us import fertilizer from russia", "does the us import fertilizer from russia", "us buying fertilizer from russia"],
             answer=f"No tariff: Russia's Column 2 rates for Chapter 31 are Free and the 12.5% Section 301 duty on Russia does not apply to fertilizers (note 52(b)). Phosphate fertilizers such as DAP and MAP from Russia do pay a countervailing duty — 12.71% for JSC Apatit since the April 17, 2026 review — and Commerce found in its June 30, 2026 sunset review that the order should continue. The U.S. imported {S['ru']} of Russian fertilizer in {yr}, mostly urea and UAN.",
             link="tariff-updates"),
        dict(id="morocco", question="What duties apply to phosphate fertilizer from Morocco?",
             searchedAs=["morocco phosphate tariffs", "morocco fertilizer tariffs", "phosphate fertilizer tariffs", "countervailing duties phosphate"],
             answer="No tariff — phosphate fertilizers are Free and exempt from Morocco's 12.5% Section 301 duty — but a countervailing duty order has applied since April 7, 2021. OCP S.A.'s cash-deposit rate is 16.60%. Under Proclamation 11038 (June 29, 2026), importers can ask Commerce, before importing, to let Moroccan phosphate enter free of countervailing duties for up to 8 months (19 CFR 358.103). The ITC's five-year review hearing on the order is set for April 1, 2027.",
             link="tariff-engineering"),
        dict(id="china", question="What is the tariff on fertilizer from China?",
             searchedAs=["fertilizer imports from china", "does the us import fertilizer from china", "tariffs on urea"],
             answer=f"25% of value: every Chapter 31 line is on Section 301 List 3 (9903.88.03), so 1,000 t of Chinese urea worth $400,000 pays $100,000. The 12.5% 2026 Section 301 duty on China does not apply (note 52(b)), and the IEEPA duties ended February 24, 2026. Ammonium sulfate from China also carries antidumping and countervailing duties (China-wide antidumping rate 493.46%). U.S. imports from China were {S['cn']} in {yr}.",
             link="industry-areas"),
        dict(id="where-from", question="Where does the U.S. import fertilizer from?",
             searchedAs=["where does the us import fertilizer from", "where does the us import most of its fertilizer from", "fertilizer imports usa", "fertilizer imports by country", "what countries does the us import fertilizer from"],
             answer=f"Mostly Canada and Russia: {S['top2']} of the {S['T']} imported in {yr}. Canada ({S['ca']}) ships potash; Russia ({S['ru']}) mainly urea and UAN. Next come Saudi Arabia, Qatar, Israel, Mexico, Trinidad and Tobago, Nigeria, Algeria, Lithuania and Morocco.",
             link="understand-industry"),
        dict(id="hs-urea", question="What is the HS code for urea fertilizer?",
             searchedAs=["hs code for urea", "hs code for urea fertilizer", "hs code for urea 46", "hs code for granular urea", "hs code for prilled urea", "hs code urea ammonium nitrate"],
             answer="3102.10 — urea, whether or not in aqueous solution. The U.S. splits it into solid urea (3102.10.00.10, granular or prilled), diesel exhaust fluid meeting ISO 22241 (3102.10.00.30) and other urea solutions (3102.10.00.50). Urea ammonium nitrate (UAN) solution is 3102.80. All are Free.",
             link=""),
        dict(id="hs-npk", question="What is the HS code for NPK, DAP or MAP fertilizer?",
             searchedAs=["hs code for npk fertilizer", "hs code 3105", "hs code 3105.20", "hs code 3105.30", "hs code 3105.40", "hs code 3105.90"],
             answer="Heading 3105. NPK fertilizers (nitrogen, phosphorus and potassium) are 3105.20; diammonium phosphate (DAP) 3105.30; monoammonium phosphate (MAP) 3105.40; other N-P mixes 3105.51 and 3105.59; P-K mixes 3105.60; any fertilizer in tablets or packages up to 10 kg 3105.10; others 3105.90. All are Free, but phosphate-containing ones from Morocco and Russia are under countervailing duty orders.",
             link=""),
        dict(id="hs-fertilizer", question="What is the HS code for fertilizer?",
             searchedAs=["hs code for fertilizer", "hts code for fertilizer", "hs code for fertilizer organic", "hs code for liquid fertilizer"],
             answer="Chapter 31: 3101 animal or vegetable (organic) fertilizers, 3102 nitrogen, 3103 phosphate, 3104 potash and 3105 mixed fertilizers, split into 29 ten-digit U.S. lines. Liquid fertilizers stay in the heading of their nutrients (for example UAN solution 3102.80). Fertilizer spreaders and other machinery are in Chapter 84, not here.",
             link=""),
        dict(id="belarus", question="Can the U.S. buy potash from Belarus?",
             searchedAs=["potash from belarus", "belarus potash us", "potash belarus sanctions", "us buying potash from belarus", "potash tariffs belarus"],
             answer="Since March 26, 2026, Belaruskali and the Belarusian Potash Company are no longer on the U.S. sanctions (SDN) list, so the sanctions that blocked their potash since 2021 no longer apply to them. On the tariff side potash is Free: Belarus is a Column 2 country, but the Column 2 rate for potash is also Free, and Belarus is not one of the 60 Section 301 economies.",
             link="tariff-updates"),
    ]
