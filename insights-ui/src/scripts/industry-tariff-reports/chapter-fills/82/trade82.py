"""Trade-dependent text for Chapter 82 (understandIndustry, overview tradeSnapshot) and the FAQ page."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NO_DUTY = "Duty-collected figures aren't available from an official source yet."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "China, Hong Kong SAR": "Hong Kong", "Türkiye": "Türkiye"}
SHORT = "Tools, Cutlery, Spoons and Forks of Base Metal"


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
    cell_of = c["cell_of"]
    LINE = c["LINE"]
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    top = u["byCountry"]
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    knives_flat = head.get("8211", 0) + head.get("8215", 0)
    t5 = ", ".join(f"{nm(x['country'])} ({b(x['importsUsd'])})" for x in top[:5])
    chg = (T - P) / P * 100
    peak_year = max(tot, key=tot.get)
    first = u["byYear"][0]["year"]
    cn = next(x for x in top if nm(x["country"]) == "China")
    cn_prior = cn["priorImportsUsd"]
    bl = u["byLine"][0]
    labels = {g["heading"]: g["shortLabel"] for g in d["industryAreas"]["groups"]}
    hs = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
    h3 = ", ".join(f"{labels[h].lower()} ({h}, {b(v)})" for h, v in hs[:3])
    assert hs[0][0] == "8207", hs[0]

    u["h1"] = f"HTS Chapter 82: {SHORT} — U.S. Import Statistics"
    u["seo"] = {
        "title": f"U.S. Imports of Hand Tools, Knives & Cutlery by Country: {', '.join(nm(x['country']) for x in top[:4])} (HTS Ch. 82) | KoalaGains",
        "shortDescription": f"Where U.S. imports of tools and cutlery (drill bits, carbide inserts, hand tools, wrenches, saw blades, knives, flatware) come from, {first}–{yr}: {b(T)} in {yr} "
        f"({chg:+.1f}% on {pyr}), led by China and Taiwan. By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "HTS Chapter 82 import statistics",
            "hand tools imports by country",
            "where are hand tools made",
            "us tool imports",
            "knives imports by country",
            "cutlery imports",
        ],
    }
    for s in u["stats"]:
        if s["label"].startswith("Top 2 share"):
            s["label"] = s["label"].replace("Other Asia, nes", "Taiwan")
    u["byYearCaption"] = u["byYearCaption"].replace("Other Asia, nes", "Taiwan")
    u["why"] = (
        f"U.S. imports of Chapter 82 tools and cutlery were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr}"
        + (f" (peak: {b(tot[peak_year])} in {peak_year})" if peak_year != yr else "")
        + f". The five largest suppliers were {t5}; Taiwan is reported to UN Comtrade as \"Other Asia, nes\". By product group the largest were {h3}. "
        f"Knives and flatware (8211, 8215), which make up most of the Section 232 lines, were {b(knives_flat)}.\n\n"
        f"China's shipments fell from {b(cn_prior)} in {pyr} to {b(cn['importsUsd'])} in {yr}, while Vietnam, Japan and Germany grew. In {yr} Chinese tools paid Section 301 plus the IEEPA "
        "duties; from August 18 knives and flatware from every country also paid the Section 232 steel duty. Since 2026 the IEEPA duties are gone, knives and flatware pay 25% of their full value, "
        "and the other tools pay the 2026 Section 301 duty of their country. "
        f"The largest single six-digit line was {bl['hs6']} ({b(bl['importsUsd'])}).\n\n"
        f"{yr} is the latest full year of U.S. trade data. {NO_DUTY}"
    )
    u["coverageNote"] = COVERAGE
    u["effectiveDuty"]["note"] = NO_DUTY
    u["sources"] = u["sources"][:1] + [
        {"label": "Federal Register 90 FR 40326 (Commerce inclusions: knives, flatware and other Chapter 82 tools become Section 232 steel derivatives, August 18, 2025)", "url": SRC["fr-2025-15819"]["url"]},
        {"label": "Federal Register 91 FR 18201 (Proclamation 11021: Section 232 on full value, 25% for knives and flatware, April 6, 2026)", "url": SRC["procl-11021"]["url"]},
    ]
    ts = o["tradeSnapshot"]
    ts["coverageNote"] = COVERAGE
    ts["effectiveDutyRateNote"] = NO_DUTY
    ts["totalDutyCollectedUsd"] = None
    for k in ("valueBasis", "byYearCaption"):
        assert "TODO" not in u[k], k

    def share(name):
        x = next((x for x in top if nm(x["country"]) == name), None)
        return f" {name} shipped {b(x['importsUsd'])} of Chapter 82 goods in {yr}." if x else ""

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = f"HTS Chapter 82: {SHORT} — Tariff FAQ"
    fc["seo"] = {
        "title": "HTS Chapter 82 Tariff FAQ: Hand Tool, Knife, Cutlery, Drill Bit & Tool Set Codes and Duties | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on Chapter 82 tools and cutlery: HTS codes for knives, cutlery, scissors, wrenches, drill bits, carbide inserts and tool sets, "
        "the Section 232 steel tariff on knives and flatware, China, Japan, Switzerland and Canada (Section 338), and the diamond saw blade antidumping order.",
        "keywords": [
            "hts chapter 82",
            "chapter 82 hts code",
            "knife tariff code",
            "knives hs code",
            "cutlery tariff code",
            "tariff code for hand tools",
            "tool set hs code",
            "drill bits hs code",
            "hts code for scissors",
            "carbide insert tariff code",
            "japanese knife tariff",
            "section 338 canada hts list",
        ],
    }
    fc["intro"] = (
        "Straight answers to the most-searched questions about U.S. tariffs on tools, knives and cutlery (HTS Chapter 82), by product, by country and by HS code. "
        "Each answer links to the page with the detail and the official sources."
    )
    fc["keyTakeaways"] = [
        "Knives (8211) and spoons, forks and flatware (8215), plus vises, clamps, some cutters, edged tools and diamond sawblade cores, are Section 232 derivative steel articles: 25% of the full value "
        "from every country, on top of the base rate and any FTA or USMCA claim. Three die and press-tool lines pay 15% in total.",
        "The other 134 lines (wrenches, pliers, hammers, screwdrivers, saw blades, drill bits, carbide inserts, scissors, razors) pay the 2026 Section 301 duty: 10% or 12.5% for most countries, "
        "10% or 12.5% in place of a lower base rate for the EU, Taiwan, Japan, Korea and Switzerland, nothing for USMCA goods.",
        "China adds 25% (List 3) or 7.5% (List 4A) on most lines; Canadian wrenches, pliers, saw blades, carbide inserts, tool sets and razors pay 50% under Section 338 even with USMCA. Diamond "
        "sawblades and heavy forged hand tools from China also carry antidumping duties. The IEEPA tariffs ended February 24, 2026.",
        f"In {yr} the U.S. imported {b(T)} of Chapter 82 goods; {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}) and {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) were the largest suppliers.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"

    k_cn = cell_of("China", "8211.92.20.00")["total"]
    k_jp = cell_of("Japan", "8211.92.20.00")["total"]
    k_ch = cell_of("Switzerland", "8211.93.00.35")["total"]
    w_cn = cell_of("China", "8204.20.00.00")["total"]
    db_de = cell_of("Germany", "8207.50.20.55")["total"]
    db_cn = cell_of("China", "8207.50.20.55")["total"]
    sc_cn = cell_of("China", "8213.00.90.00")["total"]
    ci_ca = cell_of("Canada", "8209.00.00.30", "withUsmca")["total"]
    assert (k_cn, k_jp, w_cn, sc_cn, ci_ca) == ("0.8¢ each + 37.1%", "0.8¢ each + 29.6%", "46.5%", "3¢ each + 15.5%", "50%"), (k_cn, k_jp, w_cn, sc_cn, ci_ca)
    assert k_ch == "3¢ each + 30.4%", k_ch
    assert db_de == "10%" and db_cn == "42.5%", (db_de, db_cn)
    faqs = [
        {
            "id": "what-is-chapter-82",
            "question": "What is HTS Chapter 82?",
            "searchedAs": ["hts chapter 82", "htsus chapter 82", "chapter 82 hts code", "us hts chapter 82", "hts code chapter 82"],
            "answer": "Chapter 82 of the Harmonized Tariff Schedule covers tools, implements, cutlery, spoons and forks of base metal: garden and farm hand tools (8201), saws and blades (8202), files, "
            "pliers and cutters (8203), wrenches (8204), other hand tools and vises (8205), tool sets (8206), interchangeable tools such as drill bits and dies (8207), machine knives (8208), carbide "
            f"inserts (8209), hand-operated kitchen appliances (8210), knives (8211), razors (8212), scissors (8213), other cutlery such as clippers (8214) and flatware (8215). It has {len(LINE)} "
            "ten-digit lines; power tools are in Chapter 84 or 85.",
            "link": "",
        },
        {
            "id": "knife-code",
            "question": "What is the HTS code for knives?",
            "searchedAs": ["knife tariff code", "knives hs code", "hts code for kitchen knives", "pocket knife tariff code", "hs code for chef knives", "hs code 8211.92", "utility knife tariff code"],
            "answer": "Knives are heading 8211: table knives with fixed blades 8211.91 (steak knives 8211.91.50.30 or .80.30), kitchen, chef and butcher knives 8211.92.20 (plastic or rubber handles) or "
            "8211.92.90, hunting and sheath knives 8211.92.40 / .60 / .90.45, pocket, folding and multi-tool knives 8211.93, blades 8211.94, handles 8211.95 and knife sets 8211.10. Machine knives are 8208 and butter and fish knives 8215.",
            "link": "",
        },
        {
            "id": "knife-tariff",
            "question": "What is the tariff on knives from Japan, China or Germany?",
            "searchedAs": ["knives tariffs", "knife tariff", "japanese knife tariff", "tariff on knives from japan", "japan knife tariff", "knife maker tariffs"],
            "answer": "Every knife line is a Section 232 derivative steel article, so knives pay **25% of their value** on top of the base rate from any country, FTA or not. A kitchen knife of "
            f"8211.92.20 (0.8¢ each + 4.6%) pays {k_jp} from Japan or Germany (the 2026 Section 301 duty does not stack on Section 232 goods) and {k_cn} from China (List 4A adds 7.5%). "
            "Knives made from at least 85% U.S.-melted steel pay 10% instead of 25%; UK knives with UK-melted steel 15%.",
            "link": "industry-areas",
        },
        {
            "id": "swiss-army",
            "question": "What is the tariff on Swiss Army and other pocket knives?",
            "searchedAs": ["swiss army knife tariff", "swiss army knife tariff code", "pocket knife tariff code", "folding knife tariff code"],
            "answer": f"Pocket and folding knives, including multi-tool knives, are 8211.93 at 3¢ each + 5.4%, plus 25% Section 232: **{k_ch}** from Switzerland or anywhere else. Switzerland's 12.5% "
            "Section 301 rate does not apply to Section 232 goods. Spring-opening (switchblade), gravity and ballistic knives cannot be imported at all.",
            "link": "tariff-engineering",
        },
        {
            "id": "cutlery-code",
            "question": "What is the tariff code for cutlery and stainless steel flatware?",
            "searchedAs": ["cutlery tariff code", "stainless steel cutlery tariff code", "cutlery set tariff code", "stainless steel flatware tariff code", "hs code 8215", "hs code 8215.99", "cutlery hs code"],
            "answer": "Spoons, forks, ladles, cake servers, butter knives and similar flatware are 8215: stainless spoons 8215.99.30 (14% if under 25¢ each) or .35 (6.8%), stainless forks 8215.99.01–.15, "
            "plated pieces 8215.91, and sets 8215.10 (with a plated piece) or 8215.20. A set of table knives with at least as many forks or spoons is classified in 8215, not 8211 (Chapter 82 note 3). "
            "Every 8215 line pays 25% Section 232 on top of the base rate.",
            "link": "",
        },
        {
            "id": "hand-tools-code",
            "question": "What is the tariff code for hand tools?",
            "searchedAs": ["tariff code for hand tools", "hand tools tariff code", "hs code for hand tools", "hts code for wrenches", "hs code for hand tools spanners", "hs code 8205", "hs code 8204"],
            "answer": "Hand tools are spread over 8201–8205: garden tools 8201, saws 8202, files, pliers and cutters 8203, wrenches and sockets 8204 (9%), and hammers 8205.20, screwdrivers 8205.40, "
            "household tools 8205.51, vises and clamps 8205.70 and other hand tools 8205.59. Most are outside Section 232 and pay their base rate plus the 2026 Section 301 duty; vises, clamps and "
            "8205.59.55 tools pay 25% Section 232. Power tools are not in Chapter 82 (8467).",
            "link": "",
        },
        {
            "id": "china-tools",
            "question": "What are the tariffs on hand tools from China?",
            "searchedAs": ["tariffs on hand tools", "tariff on tools from china", "what are the tariffs on china", "section 301 tariff list 3"],
            "answer": f"Most Chinese tools pay their base rate + 25% Section 301 List 3 + 12.5% under the 2026 Section 301 action: a socket wrench pays **{w_cn}**. Knives and flatware pay 25% "
            f"Section 232 plus 7.5% (List 4A) or 25% (List 3) where listed. Scissors are on no China list and pay only the base rate + 12.5% ({sc_cn} for 8213.00.90). Chinese diamond sawblades and heavy "
            "forged hand tools also carry antidumping duties." + share("China"),
            "link": "industry-areas",
        },
        {
            "id": "section-232-list",
            "question": "Which Chapter 82 products are on the Section 232 steel derivatives list?",
            "searchedAs": ["steel derivative tariff list", "section 232 derivative products list", "what items are affected by tariffs", "what items are included in the tariffs"],
            "answer": "Note 16(c) to Chapter 99 lists 55 Chapter 82 lines: all knives and knife sets, blades and handles (8211), all spoons, forks and flatware sets (8215), vises and clamps (8205.70), "
            "other iron or steel hand tools of 8205.59.55, pipe cutters, bolt cutters and punches of 8203.40.60 and diamond sawblade cores (8202.39.00.40), at 25%; and parts of drawing dies, "
            "metal-forming dies and press-tool parts of 8207.20 and 8207.30, at 15% in total. They were added on August 18, 2025. Wrenches, pliers, hammers, saw blades, drill bits, scissors and "
            "razors are not on the list.",
            "link": "tariff-updates",
        },
        {
            "id": "tool-sets",
            "question": "What is the HS code and duty for a tool set or socket set?",
            "searchedAs": ["tool set hs code", "socket set hs code", "hand tool set hs code", "tool kit hs code", "hs code for socket wrench set", "hts code for drill bit set"],
            "answer": "Sets of tools from two or more of headings 8202–8205 put up for retail sale are 8206; sets of one kind of 8205 tool are 8205.90.60, and a socket set of only sockets and drives "
            "is 8204.20 (9%). Sets of 8206 and 8205.90.60 have no rate of their own: they pay the rate of the article in the set with the highest rate (per-unit rates converted to ad valorem "
            "equivalents) on the whole set. In the tariff calculator, enter the 10-digit line of that article. Canadian 8206 sets pay 50% Section 338.",
            "link": "tariff-engineering",
        },
        {
            "id": "drill-bits",
            "question": "What is the HS code and tariff for drill bits?",
            "searchedAs": ["drill bits hs code", "hs code for drill bits", "masonry drill bits hs code", "hs code 8207", "hs code 8207.50", "hs code for hss drill bits"],
            "answer": "Drill bits are 8207.50 (masonry drills 8207.50.20.30, twist drills 8207.50.20.45/.55 or 8207.50.40.30), rock-drilling bits 8207.13 and 8207.19. Most pay 5% or 8.4% and are "
            f"outside Section 232: a German twist drill pays **{db_de}** (the EU rate of 10% in place of the base rate), a Chinese one **{db_cn}** (5% + 25% + 12.5%).",
            "link": "industry-areas",
        },
        {
            "id": "scissors",
            "question": "What is the HTS code for scissors?",
            "searchedAs": ["hts code for scissors", "scissors tariff code", "harmonized tariff code for scissors", "hs code 8213", "hs code for sewing scissors"],
            "answer": "Scissors, tailors' shears and similar shears are 8213.00: 1.7¢ each + 4.3% if valued at $1.75 a dozen or less, 8¢ each + 8% for pinking shears over $30 a dozen, and 3¢ each + 3% "
            "for other scissors. They are outside Section 232 and on no China Section 301 list, so most countries add only the 2026 Section 301 duty. Scissors must be marked with their country of "
            "origin by stamping, etching or engraving.",
            "link": "",
        },
        {
            "id": "carbide-inserts",
            "question": "What is the tariff code for carbide inserts?",
            "searchedAs": ["carbide insert tariff code", "hs code 8209", "hs code 8209.00"],
            "answer": "Unmounted plates, sticks, tips and inserts of sintered carbide are 8209.00.00.30 (other cermets .60), at 4.6% (Free for most FTA partners and Japan). They are outside Section 232. "
            f"Canadian inserts pay 50% under Section 338 even with USMCA ({ci_ca}); EU and Taiwanese inserts 10%, Japanese inserts Free base but 12.5% under the 2026 Section 301 action.",
            "link": "industry-areas",
        },
        {
            "id": "canada-338",
            "question": "Which Chapter 82 products are on the Section 338 Canada list?",
            "searchedAs": ["section 338 canada", "section 338 canada hts list", "section 338 canada note 51 (b)(3)", "section 338 canada tariffs list"],
            "answer": "Note 51(b)(3) lists 13 Chapter 82 subheadings at 50% (9903.03.14) since August 22, 2026: 8201.30, 8202.31, 8202.40.60, 8203.20.60, 8203.30, 8204.11, 8204.12, 8204.20, "
            "8205.20.30, 8205.59.80, 8206, 8209 and 8212.10. The duty applies even to USMCA-qualifying goods; other Canadian tools are Free with USMCA, and Canadian knives and flatware pay 25% "
            "Section 232." + share("Canada"),
            "link": "industry-areas",
        },
        {
            "id": "diamond-saw-blades",
            "question": "Are there antidumping duties on diamond saw blades?",
            "searchedAs": ["hs code 8202.39", "hs code 8202"],
            "answer": "Yes, from China. The antidumping order on diamond sawblades and parts (cores and segments), A-570-900, has applied since November 2009; Commerce found in its July 2026 sunset "
            "review that margins up to 164.09% would likely recur, and the order stays in force. Blades assembled in Thailand and Canada by two firms were found to circumvent it. The blades are "
            "8202.39.00.10 (Free + 37.5% from China), cores 8202.39.00.40 (also 25% Section 232), sets 8206.",
            "link": "tariff-updates",
        },
    ]
    trade_faq = {
        "id": "imports-by-country",
        "question": "Where does the U.S. import hand tools and cutlery from?",
        "searchedAs": ["where are hand tools made", "hand tools importers in usa"],
        "answer": f"In {yr} the United States imported {b(T)} of Chapter 82 tools and cutlery. The largest suppliers were {t5}. The biggest product groups were {h3}.",
        "link": "understand-industry",
    }
    faqs.insert(7, trade_faq)
    assert 11 <= len(faqs) <= 15, len(faqs)
    fc["faqs"] = faqs
