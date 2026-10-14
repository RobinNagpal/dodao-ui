"""Trade-dependent text for Chapter 86 (understandIndustry, overview tradeSnapshot) and the FAQ page."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NO_DUTY = "Duty-collected figures aren't available from an official source yet."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "Türkiye": "Türkiye"}


def b(usd):
    if usd >= 1e9:
        return f"${usd / 1e9:.2f}B"
    if usd >= 1e6:
        return f"${usd / 1e6:.0f}M"
    return f"${usd / 1e3:.0f}K"


def nm(x):
    return NAMES.get(x, x)


def apply_trade(c):
    d, SRC = c["d"], c["SRC"]
    u, o, fc = d["understandIndustry"], d["overview"], d["finalConclusion"]
    assert u.get("latestYear"), "trade data missing"
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    top = u["byCountry"]
    head, cn_head = {}, {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
        if nm(r["country"]) == "China":
            cn_head[r["heading"]] = r["importsUsd"]
    chg = (T - P) / P * 100
    peak_year = max(tot, key=tot.get)
    first = u["byYear"][0]["year"]
    t5 = ", ".join(f"{nm(x['country'])} ({b(x['importsUsd'])})" for x in top[:5])
    cars = head.get("8606", 0)
    parts, cont = head.get("8607", 0), head.get("8609", 0)
    cn = next(x for x in top if nm(x["country"]) == "China")
    mx = next(x for x in top if nm(x["country"]) == "Mexico")
    ca = next(x for x in top if nm(x["country"]) == "Canada")
    assert yr == 2025 and pyr == 2024
    u["h1"] = "HTS Chapter 86: Railway Locomotives, Rolling Stock, Track Fixtures & Containers — U.S. Import Statistics"
    u["seo"] = {
        "title": f"U.S. Imports of Railcars, Rail Parts & Shipping Containers by Country: {', '.join(nm(x['country']) for x in top[:4])} (HTS Ch. 86) | KoalaGains",
        "shortDescription": f"Where U.S. imports of locomotives, railcars, rail parts and containers come from, {first}–{yr}: {b(T)} in {yr} ({chg:+.1f}% on {pyr}), led by {nm(top[0]['country'])}. "
        "By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "HTS Chapter 86 import statistics",
            "railcar imports by country",
            "shipping container imports from china",
            "rail parts imports",
            "us imports of locomotives",
        ],
    }
    u["why"] = (
        f"U.S. imports of Chapter 86 goods were **{b(T)} in {yr}**, down {abs(chg):.1f}% from {b(P)} in {pyr} and well below the {b(tot[peak_year])} peak of {peak_year}. The five largest suppliers were {t5}. "
        f"Parts of locomotives and rolling stock (8607) were the largest group at {b(parts)}, followed by containers (8609) at {b(cont)}; freight cars (8606) fell to {b(cars)} from "
        f"{b(c['CARS_PRIOR'])} in {pyr}.\n\n"
        f"China's shipments, mostly containers ({b(cn_head.get('8609', 0))}) and parts ({b(cn_head.get('8607', 0))}), fell from {b(cn['priorImportsUsd'])} to {b(cn['importsUsd'])}; Canada's more than halved "
        f"to {b(ca['importsUsd'])}, while Mexico held at {b(mx['importsUsd'])}. {yr} is the year Section 232 reached the chapter: from August 18 most Chapter 86 goods paid 50% on their steel content, "
        "and since April 6, 2026 they pay 25% of their full value from every country.\n\n"
        f"{yr} is the latest full year of U.S. trade data. {NO_DUTY}"
    )
    u["coverageNote"] = COVERAGE
    u["effectiveDuty"]["note"] = NO_DUTY
    u["sources"] = u["sources"][:1] + [
        {"label": "Federal Register 90 FR 40326 (Commerce: Chapter 86 goods added to the Section 232 derivative list from August 18, 2025)", "url": SRC["fr-2025-15819"]["url"]},
        {"label": "Federal Register 91 FR 18201 (Proclamation 11021: Section 232 on the full value, 25% for Chapter 86, from April 6, 2026)", "url": SRC["procl-11021"]["url"]},
    ]
    ts = o["tradeSnapshot"]
    ts["coverageNote"] = COVERAGE
    ts["effectiveDutyRateNote"] = NO_DUTY
    ts["totalDutyCollectedUsd"] = None
    for k in ("valueBasis", "byYearCaption"):
        assert "TODO" not in u[k], k

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = "HTS Chapter 86: Railway Locomotives, Rolling Stock, Track Fixtures & Containers — Tariff FAQ"
    fc["seo"] = {
        "title": "HTS Chapter 86 Tariff FAQ: Railcar Tariffs, Locomotive & Rail Parts HS Codes, Shipping Containers, Couplers | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on rail equipment: HTS Chapter 86 codes, railcar and tank car tariffs, locomotive and railway parts HS codes (8607), "
        "shipping container HS code 8609, the Section 232 steel derivative list, Mexico, Canada and China, and freight rail coupler duties.",
        "keywords": [
            "hts chapter 86",
            "chapter 86 hts",
            "railcar tariffs",
            "tariffs on rail cars",
            "tank car tariffs",
            "locomotive hs code",
            "railway parts hs code",
            "hs code 8607",
            "hs code 8609",
            "shipping container tariff code",
            "freight rail couplers",
        ],
    }
    fc["intro"] = (
        "Straight answers to the most-searched questions about U.S. tariffs on railway equipment and containers (HTS Chapter 86), by product, by country and by HS code. Each answer links to the page "
        "with the detail and the official sources."
    )
    n232, nnon = len(c["S232"]), len(c["NON232"])
    fc["keyTakeaways"] = [
        f"{n232} of the {len(c['LINE'])} Chapter 86 lines pay 25% Section 232 on their full customs value, from every country and on top of any FTA or USMCA rate: locomotives, self-propelled cars, "
        "service vehicles, passenger coaches, tank cars, wheels, axles, couplers, locomotive parts and containers. UK goods of UK-melted steel pay 15%, goods of U.S.-melted steel 10%.",
        f"The other {nnon} lines (hopper, box, gondola and flat cars, bolsters, side frames, some brake parts and 8608 signaling equipment) are outside Section 232: Free for USMCA goods, otherwise the base "
        "rate plus the 2026 Section 301 duty for most countries (10% or 12.5%).",
        "China pays another 25% under Section 301 on almost every line except containers; freight rail couplers from China (AD 139.49% + CVD 265.99%) and Mexico carry AD/CVD, also when fitted to railcars. "
        "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026.",
        f"In {yr} the U.S. imported {b(T)} of Chapter 86 goods (down {abs(chg):.1f}% on {pyr}); {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}), {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) "
        f"and {nm(top[2]['country'])} ({b(top[2]['importsUsd'])}) were the largest suppliers.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
    fc["faqs"] = [
        {
            "id": "what-is-chapter-86",
            "question": "What is HTS Chapter 86?",
            "searchedAs": ["hts chapter 86", "chapter 86 hts"],
            "answer": f"Chapter 86 of the Harmonized Tariff Schedule covers railway and tramway equipment: locomotives (8601–8602), self-propelled rail cars (8603), track maintenance vehicles (8604), passenger "
            "coaches (8605), freight cars (8606), parts of locomotives and rolling stock (8607), track fixtures and mechanical signaling equipment (8608) and containers for one or more modes of transport (8609). "
            f"It has {len(c['LINE'])} ten-digit lines. Steel rails and track material are in chapter 73 (7302), electrical signaling in 8530, and road-rail vehicles in chapter 87.",
            "link": "",
        },
        {
            "id": "railcar-tariffs",
            "question": "What are the tariffs on rail cars?",
            "searchedAs": ["railcar tariffs", "tariffs on rail cars", "section 232 tariffs railcars", "rail tariffs", "railway tariffs"],
            "answer": "It depends on the car. Passenger coaches (8605) and tank cars (8606.10) pay a 14% base rate (Free under USMCA and most FTAs) plus 25% Section 232 from every country; self-propelled "
            "cars pay 5% plus 25%. Hopper, box, gondola and flat cars (8606.30–8606.99) are outside Section 232: Free with USMCA, otherwise 14% plus the 2026 Section 301 duty (10% for Mexico and Canada). "
            "Chinese cars add 25% Section 301. Couplers on the car that were cast in China or Mexico carry AD/CVD.",
            "link": "industry-areas",
        },
        {
            "id": "tank-cars",
            "question": "Are railway tank cars subject to tariffs?",
            "searchedAs": ["tank car tariff", "tank car tariffs", "railway tank cars"],
            "answer": "Yes. Tank cars (8606.10) were added to the Section 232 list on April 6, 2026: 25% of the full value from every country, on top of the 14% base rate (Free under USMCA). A USMCA-qualifying "
            "Mexican tank car pays 25%, a non-qualifying one 39%. On September 30, 2026 a U.S. maker petitioned for antidumping and countervailing duties on tank cars from Mexico; the ITC's preliminary vote is due by November 16, 2026.",
            "link": "tariff-updates",
        },
        {
            "id": "hs-8607",
            "question": "What is HS code 8607 (railway parts)?",
            "searchedAs": ["hs code 8607", "hts code 8607", "railway parts hs code", "railroad parts hs code", "railway spare parts hs code", "train parts hs code", "hs code 8607.99", "hs code 8607.19", "8607.19 hs code", "hs code 8607.91", "hs code 8607.21", "railway brake parts hs code", "rail wheel hs code"],
            "answer": "Heading 8607 covers parts of railway locomotives and rolling stock: truck assemblies or bogies (8607.11–.12), axles, wheels and their parts and bolsters and side frames (8607.19), air and "
            "other brakes (8607.21, 8607.29), couplers and buffers (8607.30), locomotive parts (8607.91) and other parts (8607.99). Base rates run from Free to 3.9%. 14 of its 21 lines pay 25% Section 232; "
            "bolsters, side frames, 8607.12 trucks, brakes for freight and passenger cars (8607.21.10, 8607.29) and 8607.99.10 parts do not.",
            "link": "",
        },
        {
            "id": "hs-8609",
            "question": "What is the HS code and tariff for shipping containers?",
            "searchedAs": ["hs code 8609", "hs code 8609.00", "hs code 8609 containers", "hts code 8609", "shipping container hs code", "shipping container tariff code", "container hts code", "shipping containers tariffs"],
            "answer": "Containers specially designed for carriage by one or more modes of transport, including ISO shipping containers, 53-foot domestic containers and tank containers, are 8609.00.00.00. "
            "The base rate is Free, but containers have paid Section 232 since August 18, 2025: now 25% of the full value from every country. A container that arrives in use in international traffic "
            "is released without entry or duty (19 CFR 10.41a); one imported for domestic use is entered and pays the 25%.",
            "link": "tariff-engineering",
        },
        {
            "id": "china-containers",
            "question": "Is there an extra tariff on shipping containers from China?",
            "searchedAs": ["shipping containers tariffs", "container tariff", "how to import shipping container from china"],
            "answer": "Only Section 232. Containers are on none of the China Section 301 lists, and the 2026 Section 301 duty on China does not apply to Section 232 goods, so a Chinese container pays 25%. "
            "USTR proposed 20% to 100% on Chinese containers in April 2025 but decided in October 2025 not to impose it. There is no AD/CVD order on containers: the ITC made negative final determinations on 53-foot domestic dry containers from China in 2015.",
            "link": "tariff-updates",
        },
        {
            "id": "locomotives",
            "question": "What is the HS code and tariff for locomotives?",
            "searchedAs": ["locomotive hs code", "imported locomotive"],
            "answer": "Electric and battery locomotives are 8601 and diesel-electric and other locomotives 8602. All four lines are Free at base, but they pay 25% Section 232 from every country (10% with "
            "U.S.-melted steel, 15% for UK goods of UK-melted steel), plus 25% Section 301 for China. Because duty is now owed, they no longer qualify for the bond release of duty-free locomotives; "
            "foreign locomotives on a cross-border run still enter without duty.",
            "link": "",
        },
        {
            "id": "steel-derivatives",
            "question": "Which rail products are on the Section 232 steel derivatives list?",
            "searchedAs": ["steel derivatives list", "232 steel derivatives list", "steel derivatives hts list", "steel derivative tariff list", "steel derivative tariff"],
            "answer": f"U.S. note 16(c)(vii) to Chapter 99 lists {n232} Chapter 86 lines at 25%: all locomotives, self-propelled cars, service vehicles and passenger coaches, tank cars, truck assemblies for "
            "self-propelled vehicles, axles, wheels and their parts, 8607.21.50 air brakes, couplers and buffers, locomotive parts, 8607.99.50 parts and containers. They were added on August 18, 2025 "
            "(tank cars on April 6, 2026). Since April 6, 2026 the duty is 25% of the full value, not just the steel content.",
            "link": "tariff-updates",
        },
        {
            "id": "mexico",
            "question": "What is the tariff on railcars and rail parts from Mexico?",
            "searchedAs": ["tariffs on rail cars", "tank car tariffs"],
            "answer": "With a USMCA claim, Mexican hopper, box, gondola and flat cars, bolsters, side frames and 8608 equipment are Free. The 23 Section 232 lines pay 25% with or without USMCA (tank cars, "
            "coaches, wheels, axles, couplers). Without USMCA, the base rate and, on the lines outside Section 232, 10% Section 301 are added. Mexican couplers pay AD (6.50% for Amsted / ASF-K, 48.10% others), "
            f"and tank cars are under an AD/CVD petition. Mexico shipped {b(mx['importsUsd'])} in {yr}.",
            "link": "industry-areas",
        },
        {
            "id": "canada",
            "question": "What is the tariff on rail equipment from Canada?",
            "searchedAs": ["steel derivative tariff canada", "canadian steel derivative tariff", "trains made in canada"],
            "answer": "Canadian goods pay 25% Section 232 on the 23 listed lines whether or not USMCA is claimed. Other freight cars, bolsters, side frames and 8608 equipment are Free with USMCA, otherwise "
            "base + 10% Section 301. No Chapter 86 line is on Canada's Section 338 lists. Rail equipment running through from Canada on a continuous route enters without duty. "
            f"Canada shipped {b(ca['importsUsd'])} in {yr}.",
            "link": "industry-areas",
        },
        {
            "id": "china",
            "question": "What is the tariff on rail equipment from China?",
            "searchedAs": ["chinese rail cars", "china rail car", "chinese train cars", "locomotive made in china", "trains made in china"],
            "answer": "Most Chinese Chapter 86 goods pay about 50% plus the base rate: 25% Section 232 + 25% Section 301 (Lists 1, 2 or 3). Lines outside Section 232 pay the base rate + 25% + 12.5%; "
            "containers pay 25% only. Chinese freight rail couplers add AD 139.49% and CVD 265.99%. "
            f"China shipped {b(cn['importsUsd'])} in {yr}.",
            "link": "industry-areas",
        },
        {
            "id": "couplers",
            "question": "Which freight rail couplers carry antidumping duties?",
            "searchedAs": ["freight rail couplers", "certain freight rail couplers", "rail couplers", "railroad coupler parts"],
            "answer": "Couplers, coupler bodies and knuckles meeting AAR standards from China (AD 139.49% + CVD 265.99%, orders of July 2023) and Mexico (AD, 6.50% for Amsted / ASF-K, 48.10% others) "
            "carry orders, including couplers fitted to railcars, by the country where they were cast. Commerce made final affirmative determinations on Czech and Indian couplers on September 24, 2026; "
            "orders follow if the ITC's final vote is affirmative.",
            "link": "tariff-updates",
        },
        {
            "id": "imports-by-country",
            "question": "Where does the U.S. import railcars, rail parts and shipping containers from?",
            "searchedAs": ["where are most shipping containers made", "where are shipping containers made", "trains made in germany"],
            "answer": f"In {yr} the United States imported {b(T)} of Chapter 86 goods, down {abs(chg):.0f}% from {pyr}. The largest suppliers were {t5}. Parts (8607, {b(parts)}) and containers "
            f"(8609, {b(cont)}) were the biggest groups.",
            "link": "understand-industry",
        },
    ]
