"""Trade-dependent text for Chapter 84 (understandIndustry, overview tradeSnapshot) and the FAQ page."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NO_DUTY = "Duty-collected figures aren't available from an official source yet."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "China, Hong Kong SAR": "Hong Kong", "Türkiye": "Türkiye"}


def b(usd):
    if usd >= 1e9:
        return f"${usd / 1e9:.1f}B"
    if usd >= 1e6:
        return f"${usd / 1e6:.0f}M"
    return f"${usd / 1e3:.0f}K"


def nm(x):
    return NAMES.get(x, x)


def apply(c):
    d, SRC, S, G = c["d"], c["SRC"], c["S"], c["G"]
    u, o, fc = d["understandIndustry"], d["overview"], d["finalConclusion"]
    NL = len(c["LINE"])
    yr, pyr = u["latestYear"], u["priorYear"]
    assert yr == 2025, yr
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    top = u["byCountry"]
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    hs = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
    h4 = ", ".join(f"{G[h][1].lower()} ({h}, {b(v)})" for h, v in hs[:4])
    t5 = ", ".join(f"{nm(x['country'])} ({b(x['importsUsd'])})" for x in top[:5])
    chg = (T - P) / P * 100
    first = u["byYear"][0]["year"]
    cmp = (head.get("8471", 0) + head.get("8473", 0))
    cn = next(x for x in top if nm(x["country"]) == "China")
    tw = next(x for x in top if nm(x["country"]) == "Taiwan")
    mx = next(x for x in top if nm(x["country"]) == "Mexico")
    vn = next(x for x in top if nm(x["country"]) == "Vietnam")
    bl = u["byLine"][0]

    u["h1"] = "HTS Chapter 84: Machinery and Mechanical Appliances — U.S. Import Statistics"
    u["seo"] = {
        "title": f"U.S. Machinery & Computer Imports by Country: {', '.join(nm(x['country']) for x in top[:4])} (HTS Ch. 84) | KoalaGains",
        "shortDescription": f"Where U.S. imports of Chapter 84 machinery and computers come from, {first}–{yr}: {b(T)} in {yr} ({chg:+.1f}% on {pyr}), led by Mexico and Taiwan. "
        "By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "HTS Chapter 84 import statistics",
            "machinery imports by country",
            "us machinery imports",
            "computer imports by country",
            "where does the us import machinery from",
            "us imports from taiwan computers",
        ],
    }
    u["byYearPartners"] = [nm(x) for x in u["byYearPartners"]]
    u["byYearCaption"] = f"U.S. imports of Chapter 84 goods each year, split into the two largest {yr} suppliers ({u['byYearPartners'][0]} and {u['byYearPartners'][1]}) and everyone else."
    for st in u["stats"]:
        st["label"] = st["label"].replace("Other Asia, nes", "Taiwan")
        if st["label"] == "Largest product":
            st["note"] = "Computer processing units such as servers (8471.50)"
    u["why"] = (
        f"U.S. imports of Chapter 84 machinery were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr} and up from {b(tot[first])} in {first}. The five largest suppliers were {t5}. "
        f"By product group the largest were {h4}: computers and their parts alone were {b(cmp)}, and the single largest six-digit line was {bl['hs6']} (computer processing units such as servers) "
        f"at {b(bl['importsUsd'])}, {bl['changePct']:+.0f}% on {pyr}.\n\n"
        f"The shift in suppliers follows the tariffs. China fell from {b(cn['priorImportsUsd'])} to {b(cn['importsUsd'])} ({cn['changePct']:+.0f}%) while Taiwan rose from {b(tw['priorImportsUsd'])} "
        f"to {b(tw['importsUsd'])}, Mexico from {b(mx['priorImportsUsd'])} to {b(mx['importsUsd'])} and Vietnam from {b(vn['priorImportsUsd'])} to {b(vn['importsUsd'])}, mostly in computers and servers, "
        "which are on few or none of the Section 301 lists and are exempt from the 2026 Section 301 duties. Most other machinery now pays 10% to 12.5% under the 2026 Section 301 actions, "
        "and refrigerators, washers, compressors, bearings, HVAC, farm and construction machinery pay Section 232 (25% or a 15% total) from every country.\n\n"
        f"{yr} is the latest full year of U.S. trade data. {NO_DUTY}"
    )
    u["coverageNote"] = COVERAGE
    u["effectiveDuty"]["note"] = NO_DUTY
    u["sources"] = u["sources"][:1] + [
        {"label": "Federal Register 90 FR 40326 (BIS adds Chapter 84 machinery to the Section 232 derivative lists, August 18, 2025)", "url": SRC["fr-2025-15819"]["url"]},
        {"label": "Federal Register 91 FR 47318 (USTR: 2026 Section 301 actions on 60 economies)", "url": SRC["fr-2026-15181"]["url"]},
    ]
    ts = o["tradeSnapshot"]
    ts["coverageNote"] = COVERAGE
    ts["effectiveDutyRateNote"] = NO_DUTY
    ts["totalDutyCollectedUsd"] = None
    for x in ts["topCountries"]:
        x["name"] = nm(x["name"])
    if "TODO" in (ts.get("source") or ""):
        ts["source"] = f"UN Comtrade, United States imports, HS chapter 84 ({yr})"
    for k in ("valueBasis", "byYearCaption"):
        assert "TODO" not in u[k], k

    # ---------------------------------------------------------------- finalConclusion
    n232 = len(S["s232_any"])
    fc["h1"] = "HTS Chapter 84: Machinery and Mechanical Appliances — Tariff FAQ"
    fc["seo"] = {
        "title": "HTS Chapter 84 Tariff FAQ 2026: Machinery Tariffs, Computers, HVAC, Excavators, Forklifts, China, Section 232 | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on machinery: HTS Chapter 84 codes, tariffs on machinery from China, computers and laptops, HVAC and air "
        "conditioners, washing machines, excavators, forklifts and tractors, Section 232 derivatives and the robotics investigation, and HS codes 8471, 8479, 8481 and 8483.",
        "keywords": [
            "hts chapter 84",
            "chapter 84 hts code",
            "hts chapter 84 2026",
            "machinery tariffs",
            "tariffs on machinery from china",
            "tariff on computers",
            "hvac tariffs",
            "tariff on washing machines",
            "excavator tariff",
            "forklift tariffs",
            "section 232 industrial machinery",
            "hs code 8471",
            "hs code 8479",
            "hs code 8481",
        ],
    }
    fc["intro"] = (
        "Straight answers to the most-searched questions about U.S. tariffs on machinery and mechanical appliances (HTS Chapter 84), by product, by country and by HS code. "
        "Each answer links to the page with the detail and the official sources."
    )
    fc["keyTakeaways"] = [
        f"Most Chapter 84 lines are Free or 1%–5% at the base rate. The 2026 Section 301 duties add 10% or 12.5% for 60 economies (a 10% or 12.5% total for the EU, Japan, Korea and Taiwan), "
        "but computers (8471), computer parts (8473.30) and semiconductor equipment (8486) are exempt, and USMCA goods are exempt.",
        f"Section 232 reaches {n232} lines on their full value from every country: 25% on refrigerators, washers, compressors, pumps, bearings and gears, a 15% total on industrial, farm and "
        "residential HVAC equipment through 2027, and 25% on forklifts and construction machinery (15% for the EU, Japan, Korea, Taiwan and the UK). Those lines skip the 2026 Section 301 duty.",
        "China pays 25% or 7.5% more under Section 301 on almost every line; Canada pays 50% under Section 338 on 56 lines even with USMCA. Engines, pumps, compressors, filters and bearings "
        "used as car or truck parts pay the auto-parts duty instead. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026.",
        f"In {yr} the U.S. imported {b(T)} of Chapter 84 goods, led by Mexico ({b(mx['importsUsd'])}) and Taiwan ({b(tw['importsUsd'])}); computers and parts were {b(cmp)} of it.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
    fc["faqs"] = [
        {
            "id": "what-is-chapter-84",
            "question": "What is HTS Chapter 84?",
            "searchedAs": ["hts chapter 84", "chapter 84 hts", "chapter 84 hts code", "htsus chapter 84", "hts chapter 84 2026", "us hts code chapter 84"],
            "answer": f"Chapter 84 of the Harmonized Tariff Schedule covers nuclear reactors, boilers, machinery and mechanical appliances and their parts: engines and turbines (8406–8412), pumps, "
            "compressors and fans (8413–8414), air conditioners and refrigerators (8415, 8418), industrial and food machinery, cranes, forklifts and construction machinery (8425–8431), farm "
            "machinery (8432–8436), textile and printing machinery, washing machines (8450), machine tools and power tools (8456–8468), computers and office machines (8470–8473), robots and "
            f"other machines (8479), valves (8481), bearings and gears (8482–8483), 3D printers (8485) and semiconductor equipment (8486). It has {NL} ten-digit lines; electrical machinery is Chapter 85.",
            "link": "",
        },
        {
            "id": "machinery-tariffs",
            "question": "What are the U.S. tariffs on machinery in 2026?",
            "searchedAs": ["machinery tariffs", "us tariffs machinery", "industrial machinery tariffs", "heavy machinery tariffs", "us tariffs on machinery", "industrial equipment tariff"],
            "answer": "It depends on the product and the country. Most machinery pays its base rate (often Free) plus the 2026 Section 301 duty: 10% or 12.5% for most of the 60 listed economies, "
            "a 10% or 12.5% total for EU, Japanese, Korean and Taiwanese goods, nothing for USMCA goods. Machinery on the Section 232 lists (refrigerators, washers, compressors, pumps, bearings, "
            "HVAC, farm and construction machinery) pays 25% or a 15% total from every country instead. Chinese goods add 25% or 7.5% under Section 301.",
            "link": "industry-areas",
        },
        {
            "id": "china",
            "question": "What is the tariff on machinery from China?",
            "searchedAs": ["tariffs on machinery from china", "tariff on machinery from china to usa", "current tariffs on machinery from china", "tariffs on chinese machinery", "tariffs on equipment from china"],
            "answer": "Most Chinese machinery pays the base rate + 12.5% (2026 Section 301, 9903.05.31) + 25% (Section 301 Lists 1–3) or 7.5% (List 4A): about 37.5% to 40%. Section 232 lines pay 25% or a 15% "
            "total plus the list duty instead of the 12.5%: 50% on Chinese excavators, forklifts, refrigerators and washers. Laptops are Free and most other computers pay 7.5% or 25%. Some Chinese "
            "engines, lifts, washers, bearings and outdoor equipment also carry AD/CVD.",
            "link": "industry-areas",
        },
        {
            "id": "computers",
            "question": "Is there a tariff on computers and laptops?",
            "searchedAs": ["tariff on computers", "is there a tariff on computers", "tariff on computers from china", "laptop tariff", "laptop tariff code", "computer tariffs", "tariffs computer parts"],
            "answer": "Laptops are 8471.30 and are Free from every country, China included: the base rate is Free, they are on no Section 301 list, and computers (8471), computer parts (8473.30) and "
            "semiconductor equipment (8486) are exempt from the 2026 Section 301 duties. Other Chinese computers and parts pay 7.5% or 25% under the 2018–2019 lists. A 25% Section 232 duty applies "
            "only to servers and parts with certain advanced AI chips, with exemptions for U.S. data centers and other uses.",
            "link": "",
        },
        {
            "id": "hs-8471",
            "question": "What is HS code 8471?",
            "searchedAs": ["hs code 8471", "hs code 8471.30", "hs code 8471.50", "hs code 8471.80", "hs code 8471.41", "hs code 8471.60", "hs code 8471.70"],
            "answer": "8471 is automatic data processing machines and units: laptops and tablets (8471.30), desktops and other computers (8471.41, 8471.49), processing units such as servers (8471.50), "
            "input and output units such as keyboards (8471.60), storage units such as SSDs and hard drives (8471.70) and other units (8471.80). All lines are Free at the base rate and exempt from the 2026 "
            "Section 301 duties.",
            "link": "",
        },
        {
            "id": "section-232",
            "question": "Which machinery is on the Section 232 derivative list?",
            "searchedAs": ["section 232 derivative list", "section 232 derivative products list", "section 232 steel derivative list", "section 232 derivatives hts list", "section 232 machinery", "232 tariffs hvac"],
            "answer": f"The lists are in U.S. note 16(c) to Chapter 99. In Chapter 84, {n232} lines are on them: list (vi)/(vii) at 25% (boilers, pumps, compressors, fans, window A/C, refrigerators, "
            "dishwashers, washers and dryers, power tools, valve parts, bearings and gears), lists (ix)/(x) at a 15% total (industrial machinery, farm machinery and residential HVAC, through 2027) and "
            "list (xi) at 25% (forklifts, excavators, loaders and their parts). Goods outside Chapters 72–76 pay only if the metal is at least 15% of the weight. Each line's status is in the rate table.",
            "link": "tariff-updates",
        },
        {
            "id": "robotics-232",
            "question": "Is there a Section 232 tariff on robotics and industrial machinery?",
            "searchedAs": ["section 232 robotics industrial machinery", "section 232 industrial machinery", "section 232 investigation machinery", "robotics section 232", "section 232 robotics investigation"],
            "answer": "Not yet. Commerce opened a Section 232 investigation of imports of robotics and industrial machinery on September 2, 2025 and took comments until October 17, 2025, but no "
            "proclamation has followed as of October 13, 2026. Industrial robots (8479.50) pay their base rate plus the 2026 Section 301 duty; many other machines already pay Section 232 as steel "
            "and aluminum derivatives.",
            "link": "tariff-updates",
        },
        {
            "id": "hvac",
            "question": "What are the tariffs on HVAC equipment and air conditioners?",
            "searchedAs": ["hvac tariffs", "hvac tariffs 2026", "tariffs on air conditioners", "air conditioner tariff code", "tariffs hvac equipment", "hvac parts tariffs"],
            "answer": "Air conditioners are 8415. Window and through-the-wall units (8415.10.30), condensing units and some parts pay 25% Section 232; split systems, residential heat pumps, "
            "dehumidifiers and evaporator coils (8415.10.60/.90, 8415.81, 8415.82, 8415.90.80) pay a 15% total since June 8, 2026 (through 2027). Chinese units add 25% or 7.5% Section 301; car A/C "
            "pays the auto-parts duty. DOE efficiency standards and EPA refrigerant limits apply.",
            "link": "",
        },
        {
            "id": "washers",
            "question": "What is the tariff on washing machines?",
            "searchedAs": ["tariff on washing machines", "us tariffs on washing machines", "trump tariff on washing machines", "are there tariffs on washing machines"],
            "answer": "Household washers (8450.11, 8450.20) pay 1% to 2.6% base plus 25% Section 232 from every country, also with USMCA or KORUS. Chinese washers add 25% Section 301. Large residential "
            "washers from China and Mexico also carry antidumping duties. The 2018 Section 201 safeguard on washers expired February 7, 2023.",
            "link": "",
        },
        {
            "id": "excavators-forklifts",
            "question": "What is the tariff on excavators, forklifts and construction equipment?",
            "searchedAs": ["excavator tariff", "excavator tariff code", "forklift tariffs", "forklift tariff code", "construction equipment tariffs", "chinese excavator tariff"],
            "answer": "Excavators and loaders (8429) and forklifts (8427) are Free at base but pay Section 232 as mobile industrial equipment: 25% from most countries, a 15% total from the EU, Japan, "
            "Korea, Taiwan, the UK and a few others, and 25% on the non-U.S. content for USMCA goods. Chinese machines pay 50% (25% + 25% Section 301); Chinese aerial work platforms also carry AD/CVD.",
            "link": "",
        },
        {
            "id": "farm-machinery",
            "question": "What are the tariffs on agricultural machinery and tractors?",
            "searchedAs": ["agricultural machinery tariffs", "farm equipment tariffs", "farm machinery tariffs", "agricultural equipment tariffs", "tractor tariffs"],
            "answer": "Plows (8432.10), mower-conditioners and other harvesting machinery (8433.20), combines (8433.51), other harvesting machines (8433.59) and farm-machinery parts pay a 15% total "
            "under Section 232 since June 8, 2026 (through 2027); powered lawn mowers (8433.11) pay 25%. Harrows, seeders, spreaders, balers and other farm machinery pay their base rate plus the "
            "2026 Section 301 duty. Tractors themselves are Chapter 87, not 84.",
            "link": "",
        },
        {
            "id": "auto-parts",
            "question": "Which Chapter 84 goods pay the auto parts tariff?",
            "searchedAs": ["auto parts tariffs", "auto parts tariff list", "auto parts tariff code", "auto parts tariff exemption"],
            "answer": f"The note 33(g) list includes {len(S['auto'])} Chapter 84 lines: car engines (8407.31–.34, 8408.20), engine parts, fuel, oil and water pumps, A/C compressors and vehicle A/C, oil "
            "and air filters, jacks, ball and roller bearings, crankshafts and all of 8471. When they are car or light-truck parts they pay 25% (EU, Japan, Korea, Taiwan 15%; UK 10%), "
            "USMCA parts nothing; truck and bus parts 25%. Otherwise they pay the regular rates.",
            "link": "tariff-updates",
        },
        {
            "id": "hs-8479",
            "question": "What is HS code 8479 and what duty does it pay?",
            "searchedAs": ["hs code 8479", "hs code 8479.89", "hs code 8479.90", "8479.90 hs code", "hs code 8479.50", "hs code 8479.82"],
            "answer": "8479 is machines with individual functions not covered elsewhere: public-works machinery, oil extraction, mixers and kneaders (8479.82), industrial robots (8479.50), evaporative "
            "coolers and others (8479.89), and parts (8479.90). Base rates are Free to 2.8%; most lines pay the 2026 Section 301 duty, some 8479.89 and 8479.90 lines pay Section 232 (25% or 15%), and "
            "Canadian 8479.82 machines pay 50% Section 338.",
            "link": "",
        },
        {
            "id": "hs-8481-8483",
            "question": "What duty do valves (8481) and gears or gearboxes (8483) pay?",
            "searchedAs": ["hs code 8481", "hs code 8481.80", "hs code 8481.90", "hs code 8483", "hs code 8483.40", "hs code 8482", "tariff on bearings"],
            "answer": "Valves (8481) pay Free to 5.6% base plus the 2026 Section 301 duty; two lines of valve parts (8481.90) are on the 25% Section 232 list. Most ball bearings (8482.10), bearing parts "
            "(8482.99) and gears, gearboxes, shafts and couplings (8483) are on the 25% Section 232 list, and vehicle bearings and crankshafts can pay the auto-parts duty. Chinese tapered roller bearings carry an antidumping order.",
            "link": "",
        },
        {
            "id": "imports-by-country",
            "question": "Where does the U.S. import machinery and computers from?",
            "searchedAs": ["machinery imports by country", "us machinery imports", "computer imports by country"],
            "answer": f"In {yr} the United States imported {b(T)} of Chapter 84 goods, {chg:+.0f}% on {pyr}. The largest suppliers were {t5}. Computers and their parts were {b(cmp)}; "
            "imports from China fell while Taiwan, Mexico and Vietnam rose.",
            "link": "understand-industry",
        },
    ]
