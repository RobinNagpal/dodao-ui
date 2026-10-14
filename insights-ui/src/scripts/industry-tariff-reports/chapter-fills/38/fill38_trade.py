"""Trade-dependent and remaining text for Chapter 38 (needs the generated understandIndustry data)."""
import json

QUESTION_DATE = "October 12, 2026"


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def apply_trade(d):
    u = d["understandIndustry"]
    o = d["overview"]
    ia = d["industryAreas"]
    fc = d["finalConclusion"]
    yr, pyr = u["latestYear"], u["priorYear"]
    assert (yr, pyr) == (2025, 2024), (yr, pyr)
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    byc = {c["country"]: c for c in u["byCountry"]}
    line = {l["hs6"]: l for l in u["byLine"]}
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    hc = {(r["country"], r["heading"]): r["importsUsd"] for r in u["byHeadingCountry"]}
    peak = max(tot.items(), key=lambda kv: kv[1])
    jp, ca, de, kr, cn, idn = (byc[k] for k in ["Japan", "Canada", "Germany", "Rep. of Korea", "China", "Indonesia"])
    S = dict(
        T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", peak_y=peak[0], peak=b(peak[1]),
        jp=b(jp["importsUsd"]), ca=b(ca["importsUsd"]), ca_p=b(ca["priorImportsUsd"]), de=b(de["importsUsd"]), de_p=b(de["priorImportsUsd"]),
        kr=b(kr["importsUsd"]), cn=b(cn["importsUsd"]), cn_p=b(cn["priorImportsUsd"]), idn=b(idn["importsUsd"]), idn_p=b(idn["priorImportsUsd"]),
        h3824=b(head["3824"]), h3822=b(head["3822"]), h3818=b(head["3818"]), h3808=b(head["3808"]), h3815=b(head["3815"]), h3823=b(head["3823"]),
        bio=b(line["3826.00"]["importsUsd"]), bio_p=b(line["3826.00"]["priorImportsUsd"]), bio_ca=b(hc[("Canada", "3826")]),
        jp3824=b(hc[("Japan", "3824")]), kr3824=b(hc[("Rep. of Korea", "3824")]), id3823=b(hc[("Indonesia", "3823")]),
        my3823=b(hc[("Malaysia", "3823")]), w3818=b(line["3818.00"]["importsUsd"]), jp3818=b(hc[("Japan", "3818")]),
        cn3808=b(hc[("China", "3808")]), cn3801=b(hc[("China", "3801")]), g3801=b(line["3801.10"]["importsUsd"]),
        ac=b(line["3802.10"]["importsUsd"]), hfc63=b(line["3827.63"]["importsUsd"]), h3827=b(head["3827"]),
        top2=f"{(jp['importsUsd'] + ca['importsUsd']) / T * 100:.0f}%", fatty=b(line["3823.19"]["importsUsd"] + line["3823.11"]["importsUsd"] + line["3823.12"]["importsUsd"]),
    )
    print(json.dumps(S))

    # ---------------- overview
    o["seo"] = {
        "title": "HTS Chapter 38 Tariff Rates: Miscellaneous Chemical Products — Pesticides, Biodiesel, Fatty Acids, Wafers | KoalaGains",
        "shortDescription": f"Searchable duty table for all 217 HTS Chapter 38 lines — pesticides and disinfectants, activated carbon, fatty acids, biodiesel, silicon wafers, diagnostic reagents, refrigerant blends and other chemical preparations — with the 2026 Section 301, Canada Section 338 and China duties and the AD/CVD orders.",
        "keywords": [
            "HTS Chapter 38",
            "htsus chapter 38",
            "miscellaneous chemical products",
            "chemical tariffs",
            "chemical industry tariffs",
            "us chemical tariffs",
            "hs code 3824",
            "hs code 3808",
            "diversified chemicals tariffs",
        ],
    }
    o["intro"] = (
        "Chapter 38 is the chemical catch-all: artificial graphite, activated carbon, tall oil, turpentine and rosin, pesticides, herbicides and "
        "disinfectants (3808), finishing agents, fluxes, fuel and lubricant additives, rubber chemicals, catalysts, doped silicon wafers (3818), brake fluid "
        "and antifreeze, diagnostic reagents (3822), industrial fatty acids and alcohols (3823), the 3824 preparations n.e.s., chemical waste, biodiesel "
        f"(3826) and refrigerant blends (3827). Base rates run from Free to 6.5%, and the U.S. imported **{S['T']}** of these goods in {yr}.\n\n"
        "The extra duties matter more than the base rates. Since July 24, 2026 the **2026 Section 301 tariffs** add 10% or 12.5% on goods of 60 economies, "
        "including Japan, Korea, the EU, the UK, India and Mexico, with only doped wafers exempt for everyone; Chinese goods pay the 2018–2019 Section 301 "
        "duties plus 12.5% (wafers 50%), and since August 22, 2026 **Canadian fatty acids, sorbitol and some other preparations pay 50%** under Section 338, "
        "even with a USMCA claim. Several products — biodiesel from Argentina and Indonesia, activated carbon, HFC blends and pool chlorine from China, 2,4-D, "
        "and (preliminarily) fatty acids from Indonesia and Malaysia — also carry **antidumping or countervailing duties**, which the tariff calculator does not include."
    )
    for st in o["stats"]:
        if st["label"].endswith("share") and "+" in st["label"]:
            st["label"] = "Japan + Canada share"
    ts = o["tradeSnapshot"]
    ts["topCountries"] = [{"name": "Japan", "importsUsd": jp["importsUsd"]}, {"name": "Canada", "importsUsd": ca["importsUsd"]}]
    ts["biggestLines"] = [{"hts": "3824.99", "label": "Chemical preparations n.e.s."}, {"hts": "3822.19", "label": "Diagnostic and laboratory reagents"}]
    ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
    o["workedExamples"] = [
        {
            "title": "Stearic acid from Canada",
            "line": "3823.11.00.00",
            "body": "Stearic acid is on the Canada Section 338 list (note 51(b)(3)), so it pays **+50%** (9903.03.14) even when USMCA is claimed: with a USMCA claim the base rate is Free and the 10% Section 301 duty is lifted (9903.05.93), leaving **50%** — $50,000 on a $100,000 shipment. Without USMCA it is 2.1¢/kg + 3.8% + 10% + 50% (**2.1¢/kg + 63.8%**). The same stearic acid from Germany or Malaysia pays only its base rate (note 52(j)).",
        },
        {
            "title": "Glyphosate herbicide from China vs. India",
            "line": "3808.93.50.20",
            "body": "Base rate 5%. From China it adds 25% (List 3, 9903.88.03) and 12.5% (2026 Section 301, 9903.05.31): **42.5%**, or $42,500 on $100,000. From India it is 5% + 10% (9903.05.44) = **15%**. A 2,4-D formulation (3808.93.15) from either country would also pay antidumping and countervailing duties, which the calculator does not include.",
        },
        {
            "title": "Biodiesel (B100) from Argentina",
            "line": "3826.00.10.00",
            "body": "The tariff is 4.6% + 10% Section 301 (9903.05.22) = **14.6%**. On top come the 2018 antidumping and countervailing duty orders: an exporter without its own rate posts **74.63% + 71.87%** cash deposits. Imported biodiesel also does not earn the U.S. clean fuel production credit (section 45Z), which is limited to domestically produced fuel.",
        },
    ]

    # ---------------- understandIndustry
    u["h1"] = "HTS Chapter 38: Miscellaneous Chemical Products — U.S. Import Statistics"
    u["seo"] = {
        "title": "U.S. Chemical Imports by Country & Product — HTS Chapter 38 Import Statistics (2020–2025) | KoalaGains",
        "shortDescription": f"Where U.S. imports of HTS Chapter 38 chemicals come from: {S['T']} in {yr}, led by Japan, Canada, Germany and Korea. Chemical preparations, diagnostic reagents, silicon wafers, pesticides, fatty acids and the collapse of biodiesel imports, from UN Comtrade.",
        "keywords": [
            "us chemical imports",
            "biodiesel imports by country",
            "us biodiesel imports",
            "us biodiesel imports decline 2025",
            "HTS Chapter 38 import statistics",
            "diversified chemicals industry",
        ],
    }
    u["byYearPartners"] = ["Japan", "Canada"]
    u["byYearCaption"] = f"U.S. imports of Chapter 38 goods each year, split into the two largest {yr} suppliers (Japan and Canada) and everyone else."
    for st in u["stats"]:
        if st["label"].startswith("Top 2 share"):
            st["label"] = "Japan + Canada share"
        if st["label"] == "Largest product":
            st["note"] = "Chemical preparations n.e.s. (3824.99)"
    u["why"] = (
        f"U.S. imports of Chapter 38 goods were **{S['T']} in {yr}**, {S['chg']} from {S['P']} in {pyr} and well below the {S['peak_y']} peak of "
        f"{S['peak']}. The trade is spread out: **Japan** ({S['jp']}, mostly 3824 preparations — {S['jp3824']} — and silicon wafers), **Canada** "
        f"({S['ca']}, catalysts, lubricant additives and biodiesel), **Germany** ({S['de']}, down from {S['de_p']}), **Korea** ({S['kr']}, mainly 3824 "
        f"preparations) and **China** ({S['cn']}, down from {S['cn_p']}; diagnostic reagents, pesticides and graphite). Japan and Canada together supplied {S['top2']}.\n\n"
        f"By product, the 3824 preparations n.e.s. ({S['h3824']}) and diagnostic and laboratory reagents ({S['h3822']}, led by Germany, the UK and "
        f"Singapore) make up more than half of the chapter, followed by doped wafers ({S['h3818']}), catalysts ({S['h3815']}) and pesticides ({S['h3808']}).\n\n"
        f"Two shifts stand out. **Biodiesel** imports fell from {S['bio_p']} in {pyr} to {S['bio']} in {yr}, almost all of it from Canada ({S['bio_ca']}): "
        "since January 1, 2025 the U.S. clean fuel production credit (section 45Z) pays only for domestically produced fuel, and the biodiesel mixture "
        "credit expired; EPA counted biodiesel and renewable diesel imports falling from about 830 million gallons in 2024 to about 140 million in 2025. "
        f"**Indonesia** nearly doubled its shipments ({S['idn_p']} to {S['idn']}), mostly palm-based fatty acids and fatty alcohols ({S['id3823']} in "
        "heading 3823) — the goods now under preliminary antidumping and countervailing duties.\n\n"
        f"{yr} is the latest full year of U.S. trade data, so it predates the 2026 Section 301 and Section 338 duties. Duty-collected figures aren't available from an official source yet."
    )
    u["sources"] = u["sources"] + [
        {"label": "IRS, Clean Fuel Production Credit (section 45Z)", "url": "https://www.irs.gov/credits-deductions/clean-fuel-production-credit"},
        {"label": "Federal Register 91 FR 16388 (EPA Renewable Fuel Standard 2026–2027 rule; biodiesel and renewable diesel import volumes)", "url": "https://www.federalregister.gov/documents/2026/04/01/2026-06275/renewable-fuel-standard-rfs-program-standards-for-2026-and-2027-partial-waiver-of-2025-cellulosic"},
        {"label": "Federal Register 91 FR 60096 (fatty acids from Indonesia, preliminary antidumping determination)", "url": "https://www.federalregister.gov/documents/2026/09/22/2026-19378/certain-fatty-acids-from-indonesia-preliminary-affirmative-determination-of-sales-at-less-than-fair"},
    ]

    # ---------------- industryAreas
    ia["seo"] = {
        "title": "Chemical Tariff Rates by Country — Japan, Canada, Germany, China, India (HTS Ch. 38) | KoalaGains",
        "shortDescription": "The total U.S. tariff on HTS Chapter 38 chemicals by supplier and product group: 12.5% for Japan and Korea, 10% for the EU and Taiwan, base + 10% for India, Mexico and the UK, base + 37.5% for most Chinese goods, and 50% on listed Canadian goods under Section 338.",
        "keywords": [
            "tariffs on chemicals from china",
            "tariff on chemicals from india",
            "us tariffs on specialty chemicals",
            "chemical tariffs by country",
            "section 338 canada tariffs",
            "eu chemical trade tariffs",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. "
        "For most of Chapter 38 the 2026 Section 301 rate decides the total: **12.5%** for Japan and Korea and **10%** for the EU and Taiwan (as floors), base "
        "**+10%** for India, Indonesia, Malaysia, Mexico, Canada and the UK, base **+12.5%** for Singapore, base **+37.5%** for most Chinese goods and Brazil. "
        "Doped wafers (3818) are Free from everyone except China (50%).\n\n"
        "USMCA goods of Canada and Mexico skip the 10% — but Canada's fatty acids, fatty alcohols, sorbitol and the other Section 338 goods pay **50%** with or "
        "without USMCA. The table does **not** include antidumping or countervailing duties (biodiesel, activated carbon, HFC blends, pool chlorine, 2,4-D, "
        "fatty acids from Indonesia and Malaysia and others — see Tariff updates), or the pharmaceutical-use exemption, which depends on the end use."
    )
    EU_X = "Stearic and oleic acid, palm/coconut fatty acids and 3823.70.40 fatty alcohols are exempt (note 52(j))."
    labels = {
        "Japan": ("12.5% or the base rate, whichever is higher (9903.05.49), on every line except doped wafers (Free, note 52(b)). No Chapter 38 base rate is above 12.5%, so the total is 12.5%. The IEEPA reciprocal rate ended February 24, 2026.", []),
        "South Korea": ("12.5% or the base rate, whichever is higher (9903.05.71), with or without a KORUS claim; doped wafers are Free (note 52(b)). The IEEPA reciprocal rate ended February 24, 2026.", []),
        "Germany": (f"EU: 10% or the base rate, whichever is higher (9903.05.39); doped wafers Free (note 52(b)). {EU_X} The 15% IEEPA rate ended February 24, 2026.", []),
        "France": (f"EU: 10% or the base rate, whichever is higher (9903.05.39); doped wafers Free (note 52(b)). {EU_X} The 15% IEEPA rate ended February 24, 2026.", []),
        "Taiwan": ("10% or the base rate, whichever is higher (9903.05.76); doped wafers Free. Stearic and oleic acid, palm/coconut fatty acids and 3823.70.40 fatty alcohols are exempt (note 52(j)).", []),
        "Canada": ("USMCA goods: no Section 301 duty (9903.05.93), but +50% Section 338 (9903.03.14) on 3811.21, 3823.11–3823.70.60 (except oleyl alcohol), 3824.60, 3824.99.39, 3824.99.55 and 3824.99.93 even under USMCA. Non-USMCA goods: base + 10% (9903.05.29), plus 50% on those lines. Wafers are exempt from the 10%. The IEEPA duty ended February 24, 2026.", ["eo-14389"]),
        "Mexico": ("USMCA goods: no extra duty (9903.05.94). Otherwise base + 10% (9903.05.55); doped wafers exempt. The IEEPA duty ended February 24, 2026.", ["eo-14389"]),
        "China": ("Base rate + 25% (List 3, 177 lines) or 7.5% (List 4A, 18 lines) or 25% (List 2, 3811.21/3811.29), plus 12.5% (9903.05.31) on every line but wafers, which pay 50% (9903.91.05). Culture media and lab reagents pay base + 12.5%. IEEPA duties ended February 24, 2026. AD/CVD not shown.", ["fr-2025-21671"]),
        "Indonesia": ("Base + 10% (9903.05.45); stearic and oleic acid, palm/coconut fatty acids and 3823.70.40 fatty alcohols are exempt (note 52(j), 9903.06.16), doped wafers too. Fatty acids and biodiesel also carry AD/CVD deposits, not shown.", []),
        "Malaysia": ("Base + 10% (9903.05.54); stearic and oleic acid, palm/coconut fatty acids and 3823.70.40 fatty alcohols are exempt (note 52(j), 9903.05.99), doped wafers too. Fatty acids also carry preliminary AD/CVD deposits, not shown.", []),
        "United Kingdom": ("Base + 10% (9903.05.81) on every line except doped wafers; the UK exception list names no Chapter 38 line.", []),
        "India": ("Base + 10% (9903.05.44); doped wafers exempt. 2,4-D, citric acid blends and graphite electrodes from India also face AD/CVD, not shown.", []),
        "Singapore": ("Base + 12.5% (9903.05.68), also on top of the Singapore FTA rate (SG, applied here); doped wafers exempt.", []),
        "Argentina": ("Base + 10% (9903.05.22); doped wafers exempt. Biodiesel also pays AD/CVD under the 2018 orders, not shown.", []),
        "Brazil": ("Base + 25% (9903.05.01) + 12.5% (9903.05.27); doped wafers exempt from both (notes 50(a)(ii), 52(b)).", []),
        "Any other country": ("Economies outside the 2026 Section 301 action pay only the base rate (Free to 6.5%); the other Section 301 economies pay +10% or +12.5% (Switzerland a 12.5% floor). Russia and Belarus pay Column 2 rates.", []),
    }
    for c in ia["countries"]:
        lab, extra = labels[c["country"]]
        c["rule"]["label"] = lab
        for sid in extra + ["eo-14389"] if c["country"] not in ("Any other country",) else extra:
            if sid not in c["rule"]["sourceIds"]:
                c["rule"]["sourceIds"].append(sid)
    have = {s["id"] for s in ia["sources"]}
    tu_src = {s["id"]: s for s in d["tariffUpdates"]["sources"]}
    for c in ia["countries"]:
        for sid in c["rule"]["sourceIds"]:
            if sid not in have:
                ia["sources"].append(tu_src[sid])
                have.add(sid)
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
        "Antidumping and countervailing duties are not included: biodiesel (Argentina, Indonesia), activated carbon, HFC blends, chlorinated isocyanurates, calcium hypochlorite and 2,4-D (China and others), and the preliminary deposits on fatty acids (Indonesia, Malaysia), citric acid (Canada, India) and graphite electrodes (China, India). Their rates are company-specific.",
        "Entry rules still apply: EPA pesticide registration and Notice of Arrival (3808), TSCA certification, EPA allowances for HFC and ozone-depleting blends (3827), EPA fuel and RFS rules for biodiesel (3826), FDA rules for hand sanitizer.",
    ]

    # ---------------- finalConclusion
    fc["h1"] = "HTS Chapter 38: Miscellaneous Chemical Products — Tariff FAQ"
    fc["seo"] = {
        "title": "Chemical Tariffs FAQ: China, India, Canada Section 338, Biodiesel, Pesticides & HS Codes (HTS Ch. 38) | KoalaGains",
        "shortDescription": "Answers to what people search about chemical tariffs: tariffs on chemicals from China and India, the Canada Section 338 list, what happened to the Trump tariffs on chemicals, biodiesel duties, and HS codes for pesticides, hand sanitizer, activated carbon, refrigerant blends, silicon wafers and fatty acids.",
        "keywords": [
            "tariffs on chemicals from china",
            "tariff on chemicals from india",
            "trump tariffs on chemicals",
            "section 338 canada tariffs list",
            "hts chapter 38",
            "hs code for pesticides",
            "hs code for hand sanitizer",
            "hs code for activated carbon",
            "hs code for biodiesel",
            "hs code for refrigerant gas r410a",
            "silicon wafer tariff",
            "graphite tariffs china",
        ],
    }
    fc["intro"] = "Straight answers to the most common questions about U.S. tariffs on Chapter 38 chemical imports — by country, by product and by HS code. Each answer links to the page with the full detail."
    fc["keyTakeaways"] = [
        "Chapter 38 base rates are Free to 6.5%, but since July 24, 2026 the 2026 Section 301 tariffs add 10%–12.5% on goods of 60 economies (12.5% total for Japan and Korea, 10% for the EU); only doped wafers are exempt for everyone.",
        "Chinese chemicals pay base + 37.5% on most lines (wafers 50%), and listed Canadian goods — fatty acids, fatty alcohols, sorbitol and some others — pay 50% under Section 338 even with USMCA. The 2025 IEEPA duties ended February 24, 2026.",
        "Antidumping and countervailing duties apply on top for biodiesel (Argentina, Indonesia), activated carbon, HFC blends, pool chlorine and 2,4-D (China and others), with preliminary deposits on Indonesian and Malaysian fatty acids. The tariff calculator does not include them.",
    ]
    fc["questionSource"] = f"Google search suggestions, collected {QUESTION_DATE}"
    fc["faqs"] = [
        dict(id="china", question="What are the U.S. tariffs on chemicals from China?",
             searchedAs=["tariffs on chemicals from china", "us tariffs on china chemicals", "chemical tariffs", "us chemical tariffs"],
             answer="For Chapter 38, most Chinese goods pay the base rate plus 25% (Section 301 List 3) plus 12.5% (the 2026 Section 301 action) — 42.5% for a 5% herbicide. Fatty acids, fatty alcohols and sorbitol pay base + 7.5% + 12.5% (List 4A), culture media and diagnostic reagents base + 12.5%, and doped silicon wafers 50%. The IEEPA duties on China ended February 24, 2026. Activated carbon, HFC blends, pool chlorine, 2,4-D and several 3824 preparations also carry antidumping or countervailing duties.",
             link="industry-areas"),
        dict(id="india", question="What is the U.S. tariff on chemicals from India?",
             searchedAs=["tariff on chemicals from india", "us tariff on india chemicals", "us tariffs india chemicals", "us tariff on chemicals from india"],
             answer="The base rate plus 10% (9903.05.44) under the 2026 Section 301 action, in force since July 24, 2026 — for example 15% on a 5% herbicide. Doped wafers and chemicals for pharmaceutical use in the listed subheadings are exempt. Some Indian products also face antidumping or countervailing duties: 2,4-D (orders since May 2025) and, preliminarily, citric acid and large-diameter graphite electrodes.",
             link="industry-areas"),
        dict(id="section-338", question="What is the Section 338 tariff on Canada, and which chemicals are on the list?",
             searchedAs=["section 338 canada", "section 338 canada tariffs", "section 338 canada note 51 (b)(3)", "section 338 canada hts list", "section 338 tariffs canada list"],
             answer="Section 338 of the Tariff Act of 1930 lets the President offset a country's discrimination against U.S. commerce. Proclamation 11048 imposed +50% (9903.03.14) on the goods of Canada listed in U.S. note 51(b)(3) to Chapter 99, effective August 22, 2026. In Chapter 38 the list covers 3811.21 (lubricating-oil additives with petroleum oils), 3823.11, 3823.12, 3823.13, 3823.19.20, 3823.19.40, 3823.70.40 and 3823.70.60 (fatty acids and fatty alcohols), 3824.60 (sorbitol) and 3824.99.39, 3824.99.55 and 3824.99.93. The 50% applies even to goods entered under USMCA.",
             link="tariff-updates"),
        dict(id="trump", question="What happened to the Trump tariffs on chemicals?",
             searchedAs=["trump tariffs on chemicals", "trump tariffs chemical industry", "tariffs chemical industry", "us tariffs on chemicals"],
             answer="The 2025 IEEPA tariffs — 25% (later 35%) on non-USMCA Canadian goods, 25% on non-USMCA Mexican goods, the China duties and the reciprocal tariff (a 15% floor for the EU) — ended on February 24, 2026 after the Supreme Court ruled IEEPA does not authorize tariffs. A 10% Section 122 surcharge followed until July 23, 2026. Since July 24, 2026 the Section 301 tariffs on 60 economies apply (10%–12.5%), China's 2018–2019 Section 301 duties continue, and since August 22, 2026 some Canadian chemicals pay 50% under Section 338.",
             link="tariff-updates"),
        dict(id="hts-38", question="What is HTS Chapter 38?",
             searchedAs=["hts chapter 38", "htsus chapter 38", "hts code chapter 38", "us hts chapter 38", "hs code 38"],
             answer="Chapter 38 of the Harmonized Tariff Schedule, \"Miscellaneous chemical products\", has 27 headings (3801–3827) and 217 ten-digit U.S. lines: graphite, activated carbon, tall oil, rosin, pesticides and disinfectants, finishing agents, fluxes, additives, rubber chemicals, catalysts, doped wafers, brake fluid, antifreeze, culture media, diagnostic reagents, fatty acids and alcohols, chemical preparations n.e.s., waste, biodiesel and halogenated refrigerant blends. Base rates run from Free to 6.5%.",
             link=""),
        dict(id="hs-3824", question="What does HS code 3824.99 cover?",
             searchedAs=["hs code 3824.99", "hs code 3824", "hts code 3824.99", "hs code 3824 description", "hs code 3824 list"],
             answer=f"3824.99 is the residual subheading for chemical products and preparations of the chemical or allied industries not specified elsewhere — cultured crystals, mixtures of inorganic compounds (including lithium nickel cobalt manganese oxides), fatty-substance mixtures, petroleum-based mixtures, halogenated hydrocarbon mixtures, naphthenic acids and many others, split into 3824.99.11 to 3824.99.93. Rates run from Free to 6.5%. It was the largest Chapter 38 product in {yr} at {b(line['3824.99']['importsUsd'])} of imports, mostly from Japan and Korea.",
             link="understand-industry"),
        dict(id="hs-pesticides", question="What is the HS code for pesticides, herbicides and disinfectants?",
             searchedAs=["hs code for pesticides", "hs code 3808", "hs code 3808.94", "hs code 3808.93", "hs code for herbicides", "hs code for insecticide", "hs code for disinfectant"],
             answer="Heading 3808 when put up for retail sale or as preparations: insecticides 3808.91, fungicides 3808.92, herbicides 3808.93 (glyphosate mixtures 3808.93.50.20), disinfectants 3808.94 and rodenticides and others 3808.99; products with substances listed in subheading notes 1 and 2 go to 3808.52–3808.69. Rates are Free to 6.5%. Imports need EPA registration and a Notice of Arrival filed before the shipment arrives (19 CFR 12.112).",
             link="tariff-engineering"),
        dict(id="hand-sanitizer", question="What is the HS code for hand sanitizer?",
             searchedAs=["hs code for hand sanitizer", "hs code for hand sanitizer gel", "hand sanitizer tariff code", "hs code for alcohol hand sanitizer"],
             answer="Alcohol-based hand sanitizer with 60% or more ethanol by weight is 3808.94.50.80 (disinfectants), base rate 5%; statistical note 1 says it must meet FDA requirements. Disinfectant wipes other than paper or nonwoven wipes are 3808.94.50.10. From China hand sanitizer pays 42.5%; from Section 301 economies base + 10% or 12.5%, unless shown to be for pharmaceutical use (note 52(e)).",
             link="tariff-engineering"),
        dict(id="activated-carbon", question="What is the HS code and tariff for activated carbon?",
             searchedAs=["hs code for activated carbon", "activated carbon tariff code", "activated carbon tariff", "hs code for coconut shell activated carbon", "hs code for activated charcoal"],
             answer=f"3802.10.00 — 4.8% base, split into coal-based (.10), coconut-based (.20) and other (.50). Chinese activated carbon pays 4.8% + 37.5% = 42.3% plus an antidumping duty under the 2007 order ($2.42/kg China-wide); Indian and Sri Lankan activated carbon pays base + 10%. U.S. imports were {S['ac']} in {yr}.",
             link="industry-areas"),
        dict(id="biodiesel", question="What is the HS code and U.S. tariff for biodiesel?",
             searchedAs=["hs code for biodiesel", "biodiesel tariff code", "biodiesel antidumping", "us biodiesel imports", "us biodiesel imports decline 2025"],
             answer=f"3826.00.10 for pure biodiesel (B100, 4.6%) and 3826.00.30 for blends with less than 70% petroleum oil (6.5%). Argentina and Indonesia pay base + 10% plus antidumping and countervailing duties under 2018 orders continued in 2023. Imports fell from {S['bio_p']} in {pyr} to {S['bio']} in {yr} after the U.S. clean fuel production credit (45Z) was limited to domestic fuel.",
             link="tariff-engineering"),
        dict(id="refrigerant", question="What is the HS code for refrigerant blends like R-410A?",
             searchedAs=["hs code for refrigerant gas", "hs code for refrigerant gas r410a", "hs code for refrigerant gas r404a", "hs code for refrigerant gas r407c", "refrigerant tariffs", "refrigerant gas tariff code"],
             answer="Blends go to heading 3827 by mass composition (3.7% base): 15% or more HFC-143a, as in R-404A and R-507A, is 3827.61; 40% or more HFC-125, as in R-410A (50% HFC-32, 50% HFC-125), is 3827.63; 30% or more HFC-134a, as in R-407C, is 3827.64. Single gases such as R-32 or R-134a are in Chapter 29. Bulk HFC imports need EPA allowances, and these blends from China are under an antidumping order (216.37% China-wide).",
             link="tariff-engineering"),
        dict(id="wafers", question="What is the tariff on silicon wafers?",
             searchedAs=["silicon wafer tariff", "silicon wafer tariff code", "hs code for silicon wafer", "hs code for semiconductor wafer"],
             answer=f"Doped silicon wafers are 3818.00.00 (round semiconductor-type 3818.00.00.40, pseudo-square solar-type .45), base rate Free. They are on the exemption lists of the 2026 Section 301 and Brazil actions, so wafers from Japan, Taiwan, Korea or Germany pay nothing. Chinese wafers pay 50% (9903.91.05), which USTR said will rise on June 23, 2027; Russian wafers pay 35%. U.S. imports were {S['w3818']} in {yr}, {S['jp3818']} from Japan.",
             link="industry-areas"),
        dict(id="graphite", question="What are the U.S. tariffs on graphite from China?",
             searchedAs=["graphite tariffs china", "us graphite tariffs against china", "graphite tariffs", "hs code for artificial graphite", "active anode material tariff"],
             answer="Artificial graphite and anode material (3801.10, 3801.90) from China pay the base rate (Free to 4.9%) plus 25% (List 3) plus 12.5%. In April 2026 the ITC rejected antidumping and countervailing duties on Chinese active anode material, so no order applies; graphite electrode orders and a 2026 investigation of large-diameter electrodes can reach 3801 goods. Natural graphite is heading 2504 (Chapter 25).",
             link="tariff-updates"),
        dict(id="fatty-acids", question="What is the HS code and tariff for stearic acid and other fatty acids?",
             searchedAs=["hs code for fatty acid", "stearic acid hs code", "stearic acid tariff code", "hs code for palm fatty acid distillate", "fatty alcohol hs code"],
             answer="Heading 3823: stearic acid 3823.11 (2.1¢/kg + 3.8%), oleic acid 3823.12, tall oil fatty acids 3823.13, palm, palm-kernel or coconut fatty acids and acid oils 3823.19.20 (2.3%), industrial fatty alcohols 3823.70. Most pay base + 10% under Section 301, but the EU, Malaysia, Indonesia and some others are exempt on several lines; from Canada they pay 50% (Section 338). Indonesian and Malaysian fatty acids also carry preliminary AD/CVD deposits.",
             link="industry-areas"),
        dict(id="where-from", question="Where does the U.S. import Chapter 38 chemicals from?",
             searchedAs=["us chemical imports", "biodiesel imports by country"],
             answer=f"From many places: Japan ({S['jp']}), Canada ({S['ca']}), Germany ({S['de']}), Korea ({S['kr']}), China ({S['cn']}) and Indonesia ({S['idn']}) led the {S['T']} imported in {yr}, followed by the UK, Mexico, France and Singapore.",
             link="understand-industry"),
    ]
