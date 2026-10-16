"""Trade-dependent text for Chapter 73 (understandIndustry, overview tradeSnapshot) and the FAQ page."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NO_DUTY = "Duty-collected figures aren't available from an official source yet."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "China, Hong Kong SAR": "Hong Kong", "Türkiye": "Türkiye"}


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
    has_trade = bool(u.get("latestYear"))
    labels = {g["heading"]: g["label"] for g in d["industryAreas"]["groups"]}
    if has_trade:
        yr, pyr = u["latestYear"], u["priorYear"]
        tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
        T, P = tot[yr], tot[pyr]
        top = u["byCountry"]
        head = {}
        for r in u["byHeadingCountry"]:
            head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
        heads_sorted = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
        h3 = ", ".join(f"{labels[h].split(' (')[0].lower()} ({h}, {b(v)})" for h, v in heads_sorted[:3])
        pipe = sum(v for h, v in head.items() if h in ("7304", "7305", "7306"))
        cast_set = {"7303"}
        t5 = ", ".join(f"{nm(x['country'])} ({b(x['importsUsd'])})" for x in top[:5])
        chg = (T - P) / P * 100
        peak_year = max(tot, key=tot.get)
        first = u["byYear"][0]["year"]
        cn = next((x for x in top if nm(x["country"]) == "China"), None)
        bl = u["byLine"][0]
        u["h1"] = "HTS Chapter 73: Articles of Iron or Steel — U.S. Import Statistics"
        u["seo"] = {
            "title": f"U.S. Imports of Steel Articles by Country & Product: {', '.join(nm(x['country']) for x in top[:4])} (HTS Ch. 73) | KoalaGains",
            "shortDescription": f"Where U.S. imports of iron and steel articles (pipe, fasteners, structures, wire products, grills, cookware) come from, {first}–{yr}: {b(T)} in {yr} "
            f"({chg:+.1f}% on {pyr}), led by {nm(top[0]['country'])}. By country, by product and over time, from UN Comtrade.",
            "keywords": [
                "HTS Chapter 73 import statistics",
                "steel articles imports by country",
                "steel pipe imports by country",
                "us steel imports by country",
                "where does the us import steel from",
                "steel fasteners imports",
            ],
        }
        u["why"] = (
            f"U.S. imports of Chapter 73 articles of iron or steel were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr}"
            + (f" (peak: {b(tot[peak_year])} in {peak_year})" if peak_year != yr else "")
            + f". The five largest suppliers were {t5}. By product group the largest were {h3}; pipe and tube (7304–7306) were {b(pipe)}.\n\n"
            f"{yr} was the year Section 232 reached most of this chapter: from March 12 most Chapter 73 articles became derivative steel articles at 25%, and from June 4 they paid 50% on their steel content, "
            "with no exemption for Canada, Mexico or any other country. Since April 6, 2026 the duty is charged on the full value (50%, or 25% for stoves, cookware and sinks)"
            + (f", and Chinese goods also pay Section 301; China shipped {b(cn['importsUsd'])} in {yr}" if cn else "")
            + f". The largest single six-digit line was {bl['hs6']} ({b(bl['importsUsd'])}).\n\n"
            f"{yr} is the latest full year of U.S. trade data. {NO_DUTY}"
        )
        u["coverageNote"] = COVERAGE
        u["effectiveDuty"]["note"] = NO_DUTY
        u["sources"] = u["sources"][:1] + [
            {"label": "Federal Register 90 FR 9817 (Proclamation 10896: Section 232 extended to steel derivatives, exemptions end March 12, 2025)", "url": SRC["procl-10896"]["url"]},
            {"label": "Federal Register 90 FR 24199 (Proclamation 10947: Section 232 steel duty raised to 50% on June 4, 2025)", "url": SRC["procl-10947"]["url"]},
        ]
        ts = o["tradeSnapshot"]
        ts["coverageNote"] = COVERAGE
        ts["effectiveDutyRateNote"] = NO_DUTY
        ts["totalDutyCollectedUsd"] = None
        if "TODO" in (ts.get("source") or ""):
            ts["source"] = f"UN Comtrade, United States imports, HS chapter 73 ({yr})"
        for k in ("valueBasis", "byYearCaption"):
            assert "TODO" not in u[k], k
        trade_faq = {
            "id": "imports-by-country",
            "question": "Where does the U.S. import steel pipe and other steel articles from?",
            "searchedAs": ["steel imports by country", "us steel imports by country", "where does the us import steel from", "steel pipe imports by country"],
            "answer": f"In {yr} the United States imported {b(T)} of Chapter 73 articles of iron or steel. The largest suppliers were {t5}. The biggest product groups were {h3}. "
            "Section 232 now applies to almost all of them at 50% or 25% from every country.",
            "link": "understand-industry",
        }
        imports_line = f"In {yr} the U.S. imported {b(T)} of Chapter 73 products; {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}) and {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) were the largest suppliers."
        def share(name):
            x = next((x for x in top if nm(x["country"]) == name), None)
            return f" {name} shipped {b(x['importsUsd'])} in {yr}." if x else ""
        ca_s, mx_s, cn_s = share("Canada"), share("Mexico"), share("China")
    else:
        trade_faq = None
        imports_line = "TODO trade"
        ca_s = mx_s = cn_s = ""

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = "HTS Chapter 73: Articles of Iron or Steel — Tariff FAQ"
    fc["seo"] = {
        "title": "HTS Chapter 73 Tariff FAQ: Steel Derivative Tariffs, Pipe, Bolts, Canada, Mexico, China, UK | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on articles of iron or steel: HTS Chapter 73 codes, the Section 232 steel derivative tariff and list, whether the 50% tariff is "
        "still in effect, steel pipe, bolts and structures, Canada, Mexico, China and the UK, and antidumping duties.",
        "keywords": [
            "hts chapter 73",
            "chapter 73 hts codes",
            "steel derivative tariff",
            "section 232 steel derivatives list",
            "steel derivative tariff calculation",
            "is the 50 steel tariff still in effect",
            "steel pipe tariff code",
            "steel tariffs canada",
            "uk steel tariffs",
            "hs code 7326",
            "steel racks antidumping",
        ],
    }
    fc["intro"] = "Straight answers to the most-searched questions about U.S. tariffs on articles of iron or steel (HTS Chapter 73), by product, by country and by HS code. Each answer links to the page with the detail and the official sources."
    fc["keyTakeaways"] = [
        "Almost every Chapter 73 line pays Section 232 on its full customs value, from every country and on top of any FTA or USMCA rate: 50% on pipe, rails, fittings, structures, fasteners, wire products, chain, nails and most articles; 25% on stoves, grills, steel radiators, cookware, sinks and hangers.",
        "Lower Section 232 rates exist only for UK goods with at least 95% UK-melted steel (25% / 15%), derivatives with at least 85% U.S.-melted steel (10%) and Commerce-authorized Canadian or Mexican pipe and rail (25%). Cast-iron pipe, fittings, radiators, cookware and baths are outside Section 232.",
        "China pays another 25% (or 7.5%) under Section 301, Canadian 7308.90 structural parts another 50% under Section 338, and many pipe, fitting, nail, wire and household products carry AD/CVD on top. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026.",
        imports_line,
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
    faqs = [
        {
            "id": "what-is-chapter-73",
            "question": "What is HTS Chapter 73?",
            "searchedAs": ["hts chapter 73", "chapter 73 hts", "chapter 73 hts codes", "htsus chapter 73", "hts ch 73", "hts chapter 72 and 73"],
            "answer": f"Chapter 73 of the Harmonized Tariff Schedule covers articles of iron or steel: sheet piling and rail material (7301–7302), cast-iron, seamless and welded pipe and tube (7303–7306), "
            "fittings (7307), structures (7308), tanks, drums and gas cylinders (7309–7311), wire rope, mesh, chain, nails, screws and bolts, needles and springs (7312–7320), stoves and grills, radiators, "
            f"kitchenware and sinks (7321–7324), and cast and other articles (7325–7326). It has {len(c['LINE'])} ten-digit lines; the raw steel they are made from (slabs, sheet, bar, wire rod) is Chapter 72.",
            "link": "",
        },
        {
            "id": "derivative-tariff",
            "question": "What is the steel derivative tariff and how is it calculated?",
            "searchedAs": ["steel derivative tariff", "steel derivative tariff calculation", "232 steel derivative tariff", "steel tariffs derivative products", "u.s steel derivative tariffs"],
            "answer": "Derivative steel articles are goods made from steel that Section 232 lists alongside steel itself. Since April 6, 2026 the duty is charged on the full customs value of the article, "
            "not just its steel content: 50% (9903.82.02) for most Chapter 73 articles, 25% (9903.82.09) for stoves, grills, steel radiators, cookware, sinks and some wire articles, added to the base rate. "
            "Example: $10,000 of bolts at 8.5% pays $850 + $5,000. From June 4, 2025 to April 5, 2026 the 50% applied only to the value of the steel content of Chapter 73 goods. "
            "Goods with at least 85% U.S.-melted steel pay 10%; UK goods with 95% UK-melted steel 25% or 15%.",
            "link": "tariff-updates",
        },
        {
            "id": "derivatives-list",
            "question": "Which products are on the Section 232 steel derivatives list?",
            "searchedAs": ["section 232 steel derivatives list", "steel derivatives list", "steel derivatives hts list", "232 steel derivatives list", "steel derivative tariff list", "section 232 derivative steel articles"],
            "answer": "The lists are in U.S. note 16(c) to Chapter 99 of the tariff schedule. In Chapter 73, list (iii) has the steel articles (sheet piling 7301.10, rails 7302, seamless and welded pipe 7304–7306), "
            "list (iv) the 50% derivatives (welded shapes, fittings, structures, tanks, drums, cylinders, wire rope, mesh, chain, nails, screws and bolts, springs, castings and other articles) and list (vii) "
            f"the 25% derivatives (stoves and grills, steel radiators, kitchenware, sinks, hangers, ladders). Only the {len(c['NON232'])} cast-iron lines are on no list. Each line's status is in the rate table.",
            "link": "",
        },
        {
            "id": "still-in-effect",
            "question": "Is the 50% steel tariff still in effect?",
            "searchedAs": ["is the 50 steel tariff still in effect", "steel tariff 50 effective date", "are there still tariffs on steel", "is there a tariff on steel", "steel tariffs 2026"],
            "answer": "Yes. Proclamation 10947 raised the Section 232 steel duty to 50% from June 4, 2025, and Proclamation 11021 kept 50% for steel articles and most derivatives when it moved the duty "
            "to the full customs value from April 6, 2026 (25% for the household list). It is in the current tariff schedule (2026 Revision 21). The Supreme Court's February 2026 IEEPA ruling did not affect "
            "Section 232.",
            "link": "tariff-updates",
        },
        {
            "id": "steel-pipe",
            "question": "What is the tariff code and duty for steel pipe?",
            "searchedAs": ["steel pipe tariff code", "steel pipe tariffs", "steel tube tariff code", "steel pipe hs code", "stainless steel pipe tariff code", "import duty on steel pipe"],
            "answer": "Seamless pipe and tube is 7304 (line pipe 7304.11–.19, OCTG 7304.22–.29, other 7304.31–.90), large welded pipe over 406.4 mm is 7305, and other welded pipe and tube, including square "
            "and rectangular tubing, is 7306; cast-iron pipe is 7303. Steel pipe is Free under the general rate but pays 50% Section 232 from every country (75% from China), needs a SIMA steel import license, "
            "and many types carry AD/CVD orders. Cast-iron pipe is outside Section 232.",
            "link": "",
        },
        {
            "id": "canada",
            "question": "What is the tariff on steel products from Canada?",
            "searchedAs": ["steel tariffs canada", "steel derivative tariff canada", "canada steel tariffs 50", "steel tariffs canada us", "canadian steel derivative tariff"],
            "answer": "Canadian Chapter 73 goods pay the same Section 232 rates as everyone else, 50% or 25%, with or without a USMCA claim: Canada's exemption ended March 12, 2025. Structural parts under "
            "7308.90 pay another 50% under Section 338 since September 15, 2026 (100% in total). Commerce can authorize limited quantities of Canadian pipe and rail at 25% (9903.82.18). Cast-iron goods "
            "are Free with a USMCA claim." + ca_s,
            "link": "industry-areas",
        },
        {
            "id": "mexico",
            "question": "What is the tariff on steel products from Mexico?",
            "searchedAs": ["steel tariffs mexico", "section 232 steel tariffs mexico", "steel tariffs from mexico to us", "steel and aluminum tariffs mexico"],
            "answer": "50% or 25% Section 232 on Mexican pipe and steel articles, whether or not USMCA is claimed; Mexico's exemption ended March 12, 2025. Commerce can authorize limited Mexican pipe and rail "
            "quantities at 25%. Cast-iron goods are Free with a USMCA claim, otherwise 10% Section 301. Mexican standard pipe, rectangular tube, OCTG, PC strand and welded wire mesh also carry AD/CVD." + mx_s,
            "link": "industry-areas",
        },
        {
            "id": "china",
            "question": "What is the tariff on steel products from China?",
            "searchedAs": ["tariffs on steel from china to usa", "steel tariffs china us", "stainless steel tariffs china", "tariff on steel products from china"],
            "answer": "Most Chinese Chapter 73 goods pay 75% or more: 50% Section 232 plus 25% Section 301 (note 31 on pipe and rails, Lists 2 and 3 on most other articles), plus the base rate; 57.5% on the "
            "List 4A lines. Chinese grills, cookware and sinks pay about 50% (25% + 25%), cast-iron soil pipe 37.5%. Many Chinese pipe, fitting, nail, hanger, rack, sink and tower products also carry AD/CVD." + cn_s,
            "link": "industry-areas",
        },
        {
            "id": "uk",
            "question": "What are the U.S. tariffs on UK steel products in 2026?",
            "searchedAs": ["uk steel tariffs", "uk steel tariffs 2026", "uk steel tariffs us", "uk steel tariffs 50"],
            "answer": "UK goods pay 25% (50% list) or 15% (25% list) when at least 95% of their steel was melted and poured in the UK (9903.82.04, 9903.82.05); otherwise the standard 50% or 25%. "
            "Tata Steel UK steel melted in the Netherlands counts until January 1, 2028. No UK steel quota has been set up.",
            "link": "industry-areas",
        },
        {
            "id": "fasteners",
            "question": "What is the tariff on steel screws, bolts and nuts?",
            "searchedAs": ["tariff code for steel screws", "screw tariff code", "screws tariffs", "hs code 7318", "hs code 7318.15", "steel washer hs code"],
            "answer": "Screws, bolts, nuts, washers and rivets of iron or steel are heading 7318 (threaded bolts and screws mostly 7318.15). Base rates run from Free to 12.5% (8.5% for most cap screws), and all "
            "of 7318 pays 50% Section 232 on the full value, or 10% if at least 85% of the steel was U.S.-melted. Chinese fasteners add 25% (or 7.5%) Section 301; steel threaded rod from China, India, Taiwan and Thailand carries AD/CVD.",
            "link": "",
        },
        {
            "id": "hs-7326",
            "question": "What is HS code 7326 and what duty does it pay?",
            "searchedAs": ["hs code 7326", "hs code 7326.90", "hts code 7326.90", "hs code 7326.20", "hs code 7326.19"],
            "answer": "7326 is \"other articles of iron or steel\": forged or stamped articles (7326.19), wire articles such as hangers and ties (7326.20) and everything else not covered elsewhere (7326.90, "
            "with 7326.90.86 as the basket). Base rates are Free to 8.6% (2.9% for 7326.90.86). Most lines pay 50% Section 232; wire belting, hangers and ties (7326.20.00.10–.55), ladders, paint roller frames, "
            "broom handles and caskets pay 25%. Hangers and steel racks from China carry AD/CVD.",
            "link": "",
        },
        {
            "id": "hs-7308",
            "question": "What is the tariff on steel structures (HS 7308)?",
            "searchedAs": ["hs code 7308", "hs code 7308.90", "steel structure tariff code", "structural steel tariffs", "steel frame tariff code"],
            "answer": "Heading 7308 covers bridges, towers, doors and frames, scaffolding and other structures and their parts (7308.90 for fabricated structural steel). All lines are Free at base and pay 50% "
            "Section 232. Canadian 7308.90 parts pay another 50% under Section 338; wind towers (7308.20) from eight countries, steel grating and temporary fencing from China carry AD/CVD. Fabricated structural "
            "steel itself has no AD/CVD order.",
            "link": "",
        },
        {
            "id": "household",
            "question": "What is the tariff on stainless steel sinks, cookware and grills?",
            "searchedAs": ["stainless steel sink tariff code", "cookware tariff code", "cookware tariffs", "steel tariffs derivative products"],
            "answer": "Stainless sinks are 7324.10, steel and stainless cookware 7323.93–7323.99, grills and stoves 7321. They are on the 25% Section 232 list (9903.82.09): for example a drawn stainless sink "
            "pays 3.4% + 25%, and from China another 25% plus AD/CVD. Cast-iron cookware (7323.91, 7323.92) is outside Section 232 and pays its base rate plus the 2026 Section 301 duty for most countries.",
            "link": "",
        },
        {
            "id": "antidumping",
            "question": "Which Chapter 73 products carry antidumping duties?",
            "searchedAs": ["steel racks antidumping", "steel racks from china antidumping", "steel nails antidumping"],
            "answer": "Commerce has AD/CVD orders on many Chapter 73 goods: standard, line, large-diameter, seamless, stainless and rectangular pipe and OCTG; butt-weld and forged fittings and flanges; wind towers, "
            "grating and temporary fencing; nails, PC strand, threaded rod and wire mesh; hangers, steel racks and shelving, sinks and propane cylinders. Rates are company-specific and come on top of the tariff; the calculator does not include them.",
            "link": "tariff-updates",
        },
    ]
    if trade_faq:
        faqs.insert(5, trade_faq)
    fc["faqs"] = faqs
