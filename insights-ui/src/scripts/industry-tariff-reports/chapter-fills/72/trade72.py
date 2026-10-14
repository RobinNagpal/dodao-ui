"""Trade-dependent text for Chapter 72 and the FAQ page (needs the generated understandIndustry data)."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Türkiye": "Türkiye", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan"}


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def nm(c):
    return NAMES.get(c, c)


def apply_trade(d, src):
    u = d["understandIndustry"]
    o = d["overview"]
    fc = d["finalConclusion"]
    has_trade = bool(u.get("latestYear"))
    if has_trade:
        yr, pyr = u["latestYear"], u["priorYear"]
        tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
        T, P = tot[yr], tot[pyr]
        top = u["byCountry"]
        line = {l["hs6"]: l for l in u["byLine"]}
        head = {}
        for r in u["byHeadingCountry"]:
            head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
        steel = sum(v for h, v in head.items() if h >= "7206")
        raw = sum(v for h, v in head.items() if h < "7206")
        peak_year = max(tot, key=tot.get)
        t5 = ", ".join(f"{nm(c['country'])} ({b(c['importsUsd'])})" for c in top[:5])
        heads_sorted = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
        labels = {g["heading"]: g["label"] for g in d["industryAreas"]["groups"]}
        h3 = ", ".join(f"{labels[h].split(' (')[0].lower()} ({h}, {b(v)})" for h, v in heads_sorted[:3])
        chg = (T - P) / P * 100
        ca = next((c for c in top if c["country"] == "Canada"), None)
        mx = next((c for c in top if c["country"] == "Mexico"), None)
        cn = next((c for c in top if c["country"] == "China"), None)
        u["h1"] = "HTS Chapter 72: Iron and Steel — U.S. Import Statistics"
        u["seo"] = {
            "title": "U.S. Steel Imports by Country & Product: Canada, Brazil, Mexico, Korea (HTS Ch. 72) | KoalaGains",
            "shortDescription": f"Where U.S. iron and steel imports come from, {u['byYear'][0]['year']}–{yr}: {b(T)} in {yr} ({chg:+.1f}% on {pyr}), led by {t5.split(' (')[0]}. By country, by product and over time, from UN Comtrade.",
            "keywords": [
                "us steel imports by country",
                "where does the us import steel from",
                "steel imports from canada",
                "steel imports by country",
                "what percentage of us steel is imported",
                "HTS Chapter 72 import statistics",
            ],
        }
        u["why"] = (
            f"U.S. imports of Chapter 72 iron and steel were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr}"
            + (f" (peak: {b(tot[peak_year])} in {peak_year})" if peak_year not in (yr,) else "")
            + f". The five largest suppliers were {t5}. By product group the largest were {h3}. "
            f"Steel mill products (7206–7229) were {b(steel)}; pig iron, ferroalloys, DRI, scrap and powders (7201–7205) {b(raw)}.\n\n"
            "2025 was also the year Section 232 changed most: every country exemption and quota ended on March 12 and the rate doubled to 50% on June 4, so "
            "suppliers that had shipped duty-free under exemptions or quotas, such as Canada, Mexico, Brazil, Korea, Japan and the EU, paid the full duty. "
            + (f"China, whose steel pays 75% plus AD/CVD on many products, shipped {b(cn['importsUsd'])}. " if cn else "")
            + f"The largest single line was nonalloy pig iron ({u['byLine'][0]['hs6']}, {b(u['byLine'][0]['importsUsd'])}): pig iron, ferroalloys, DRI and scrap are outside Section 232 and pay little or no duty for most suppliers, while semifinished slabs and billets (7207, 7224) are a large share of the steel that does pay it.\n\n"
            f"{yr} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
        )
        u["coverageNote"] = COVERAGE
        u["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
        u["sources"] = u["sources"][:1] + [
            {"label": "Federal Register 90 FR 9817 (Proclamation 10896: Section 232 steel exemptions end March 12, 2025)", "url": src["procl-10896"]["url"]},
            {"label": "Federal Register 90 FR 24199 (Proclamation 10947: Section 232 steel duty raised to 50% on June 4, 2025)", "url": src["procl-10947"]["url"]},
        ]
        ts = o["tradeSnapshot"]
        ts["coverageNote"] = COVERAGE
        ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
        ts["totalDutyCollectedUsd"] = None
        trade_faq = {
            "id": "imports-by-country",
            "question": "Where does the U.S. import steel from?",
            "searchedAs": ["where does the us import steel from", "us steel imports by country", "what countries does the us import steel from", "where does the us import most of its steel from", "steel imports by country"],
            "answer": f"In {yr} the United States imported {b(T)} of Chapter 72 iron and steel. The largest suppliers were {t5}. "
            f"The biggest product groups were {h3}. Steel mill products from all of them pay the 50% Section 232 duty today (UK 25% with UK-melted steel, China 75%).",
            "link": "understand-industry",
        }
        imports_line = f"In {yr} the U.S. imported {b(T)} of Chapter 72 products, {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}) and {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) first."
        ca_s = f" Canada shipped {b(ca['importsUsd'])} in {yr}." if ca else ""
        mx_s = f" Mexico shipped {b(mx['importsUsd'])} in {yr}." if mx else ""
    else:
        trade_faq = None
        imports_line, ca_s, mx_s = "TODO trade", "", ""

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = "HTS Chapter 72: Iron and Steel — Tariff FAQ"
    fc["seo"] = {
        "title": "Steel Tariffs FAQ: Is the 50% Tariff Still in Effect? Canada, Mexico, UK, China, HS Codes (HTS Ch. 72) | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. steel tariffs: the current rate, whether the 50% steel tariff is still in effect, steel tariffs on Canada, Mexico, the UK, China, the EU, Japan and Korea, exemptions, how the duty is calculated, and HS codes for steel.",
        "keywords": [
            "steel tariffs",
            "steel tariffs 2026",
            "is the 50 steel tariff still in effect",
            "steel tariffs canada",
            "steel tariffs mexico",
            "uk steel tariffs",
            "tariff on steel from china to usa",
            "steel tariff exemptions",
            "how are steel tariffs calculated",
            "hs code for steel",
            "stainless steel tariffs",
        ],
    }
    fc["intro"] = "Straight answers to the most-searched questions about U.S. tariffs on iron and steel imports, by country, by product and by HS code. Each answer links to the page with the detail and the official sources."
    fc["keyTakeaways"] = [
        "Steel mill products (HTS 7206–7229) are Free under the general rate but pay the Section 232 duty of 50% of their full customs value, from every country and on top of any FTA or USMCA rate. UK steel at least 95% melted and poured in the UK pays 25%.",
        "Chinese steel pays 75% (50% Section 232 + 25% Section 301). Pig iron, ferroalloys, DRI, scrap and powders are outside Section 232; some pay the 2026 Section 301 duties (10%–12.5%), the Brazil duty or China's Section 301 duty.",
        "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026; neither ever added to Section 232 steel for most countries. Antidumping and countervailing duties on flat-rolled steel, rebar, wire rod, stainless and ferroalloys come on top and are not in the calculator.",
        imports_line,
    ]
    fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
    faqs = [
        {
            "id": "current-rate",
            "question": "What is the current U.S. tariff on steel?",
            "searchedAs": ["steel tariffs", "steel tariffs 2026", "us steel tariffs 2026", "what are steel tariffs today", "what is the tariff on steel right now", "is there a tariff on steel"],
            "answer": "50% of the full customs value for steel mill products (HTS 7206–7229) from every country, under Section 232 heading 9903.82.02, on top of the base rate (Free for steel). "
            "UK steel at least 95% melted and poured in the UK pays 25% (9903.82.04). Chinese steel pays another 25% under Section 301 (75% in total), Russian steel up to 120%. "
            "Pig iron, ferroalloys, DRI, scrap and iron powders are not covered by Section 232.",
            "link": "",
        },
        {
            "id": "still-in-effect",
            "question": "Is the 50% steel tariff still in effect, and when did it start?",
            "searchedAs": ["is the 50 steel tariff still in effect", "when did 50 steel tariff start", "steel tariff 50 effective date", "are steel tariffs still in effect", "are there still tariffs on steel", "steel tariffs supreme court", "are trump steel tariffs still in place"],
            "answer": "Yes. Proclamation 10947 raised the Section 232 steel duty from 25% to 50% for goods entered from 12:01 a.m. EDT on June 4, 2025. Proclamation 11021 kept 50% when it moved "
            "the duty to heading 9903.82.02 on the full customs value from April 6, 2026, and it is in the current tariff schedule (2026 Revision 21). The Supreme Court's February 20, 2026 ruling "
            "in Learning Resources, Inc. v. Trump ended only the IEEPA tariffs; the steel tariff rests on Section 232 of the Trade Expansion Act of 1962 and was not affected.",
            "link": "tariff-updates",
        },
        {
            "id": "canada",
            "question": "What is the tariff on steel from Canada?",
            "searchedAs": ["steel tariffs canada", "what is the tariff on steel from canada to us", "is there a tariff on steel from canada", "50 percent steel tariff canada", "canada steel tariff exemption", "steel imports from canada to us"],
            "answer": "50% on Canadian steel mill products, with or without a USMCA claim: Canada's Section 232 exemption ended March 12, 2025, and note 16(b) collects the duty on top of the USMCA rate. "
            "Commerce can authorize limited quantities at 25% (9903.82.18) for Canadian producers that supply U.S. vehicle makers and commit to new U.S. steel capacity. Canadian scrap, pig iron "
            "and most ferroalloys stay Free; Canadian DRI pays 50% under Section 338. Canadian corrosion-resistant steel is also under AD/CVD orders since December 2025." + ca_s,
            "link": "industry-areas",
        },
        {
            "id": "mexico",
            "question": "What is the tariff on steel from Mexico?",
            "searchedAs": ["steel tariffs mexico", "steel tariffs from mexico to us", "what is the tariff on steel from mexico", "section 232 steel tariffs mexico", "is there a tariff on steel from mexico"],
            "answer": "50% on Mexican steel mill products (Section 232, 9903.82.02), even with a USMCA certification. Mexico's exemption, and the 2024 melt-and-pour rule that charged 25% on Mexican "
            "steel melted outside North America, ended March 12, 2025. A 25% rate is possible only for Commerce-authorized quantities (9903.82.18). Mexican rebar, wire rod and corrosion-resistant steel "
            "also carry AD/CVD orders." + mx_s,
            "link": "industry-areas",
        },
        {
            "id": "usmca",
            "question": "Does USMCA exempt steel from the Section 232 tariff?",
            "searchedAs": ["steel tariffs usmca", "section 232 steel tariffs usmca", "steel and aluminum tariffs usmca"],
            "answer": "No. U.S. note 16(b) to Chapter 99 says the Section 232 duty is collected in addition to any FTA or USMCA special rate, so USMCA-qualifying Canadian and Mexican steel pays 50%. "
            "A USMCA claim still removes the 10% Section 301 duty on the 19 non-steel lines that carry it (spiegeleisen, some ferroalloys, powders, cold-formed shapes).",
            "link": "tariff-engineering",
        },
        {
            "id": "uk",
            "question": "What is the U.S. tariff on UK steel?",
            "searchedAs": ["steel tariffs uk", "uk steel tariffs to us", "steel tariffs uk 2026", "uk steel tariffs 50", "uk steel tariff exemption", "steel tariffs uk us"],
            "answer": "25% (heading 9903.82.04) when at least 95% of the steel was melted and poured in the United Kingdom; otherwise 50%. Tata Steel UK steel melted and poured in the Netherlands counts "
            "as UK until January 1, 2028. The UK kept 25% when other countries went to 50% on June 4, 2025; the quota at normal tariff rates contemplated by Executive Order 14309 has not been set up.",
            "link": "industry-areas",
        },
        {
            "id": "china",
            "question": "What is the tariff on steel from China?",
            "searchedAs": ["tariff on steel from china to usa", "current tariff on steel from china", "what is the tariff on steel from china", "what is the tariff on stainless steel from china", "steel tariffs from china"],
            "answer": "75% on almost all Chinese steel mill products: 50% Section 232 plus 25% Section 301 (U.S. note 31, heading 9903.91.01, since September 27, 2024); 20 wire, strip and bar lines pay 7.5% under List 4A instead (57.5% in total), and forged bars (7214.10) 50%. "
            "Chinese pig iron, ferroalloys and scrap mostly pay 25% under List 3, plus 12.5% on some lines. Many Chinese steel products also carry antidumping and countervailing duties "
            "(cold-rolled, corrosion-resistant, plate, wire rod, stainless sheet and strip; tin mill investigation in 2026).",
            "link": "industry-areas",
        },
        {
            "id": "eu-japan-korea",
            "question": "What are the steel tariffs on the EU, Japan and South Korea?",
            "searchedAs": ["steel tariffs eu", "eu steel tariffs 50", "us steel tariffs japan", "us steel tariff korea", "steel tariffs south korea", "steel tariffs europe us"],
            "answer": "50% on steel mill products from all three. Their earlier arrangements (EU and Japan tariff-rate quotas, Korea's quota) ended March 12, 2025, and the trade deals of 2025 did not change "
            "the Section 232 steel rate; KORUS does not reduce it. Their 2026 Section 301 rates (10% or 12.5% in place of the base rate) apply only to the 18 or 19 non-steel lines.",
            "link": "industry-areas",
        },
        {
            "id": "by-country",
            "question": "What are steel tariffs by country?",
            "searchedAs": ["steel tariffs by country", "us steel import tariffs by country", "steel tariffs brazil", "steel tariffs india to usa", "steel tariffs vietnam", "what is the tariff on steel from india"],
            "answer": "For steel mill products: 50% for Canada, Mexico, Brazil, the EU, Japan, Korea, Taiwan, Vietnam, India, Türkiye and every other country; 25% for UK-melted UK steel; 75% for China; "
            "up to 120% for Russia (70% in lieu of column 2 plus 50%). Differences between countries show up on pig iron, ferroalloys and scrap, and in company-specific AD/CVD duties.",
            "link": "industry-areas",
        },
        {
            "id": "exemptions",
            "question": "Are there exemptions or exclusions from the steel tariffs?",
            "searchedAs": ["steel tariff exemptions", "steel tariff exclusion", "section 232 steel tariff exclusions", "us steel tariff exemptions", "steel tariff relief"],
            "answer": "Very few. Proclamation 10896 ended all country exemptions and quotas and stopped new product exclusions; general approved exclusions ended March 12, 2025. What remains: the 25% UK rate, "
            "Commerce-authorized Canadian and Mexican quantities at 25% (9903.82.18), and goods not on the note 16(c) lists (pig iron, ferroalloys, DRI, scrap, powders, cold-formed shapes). "
            "Drawback is not available for the Section 232 duty on Chapter 72 steel.",
            "link": "tariff-engineering",
        },
        {
            "id": "calculated",
            "question": "How are steel tariffs calculated?",
            "searchedAs": ["how are steel tariffs calculated", "how are steel and aluminum tariffs calculated", "section 232 steel csms"],
            "answer": "Add the base rate of the Chapter 72 line (Free for steel) and the Section 232 rate (50%, UK 25%) applied to the full customs value, plus any other Chapter 99 duty that stacks: Section 301 "
            "for China (25%) or the Russia column 2 rate. The 2026 Section 301 and Brazil duties do not stack on Section 232 steel. CBP's CSMS # 68253075 says to report 9903.82.02 (or 9903.82.04 / .14 / .18) "
            "with the Chapter 72 number, plus the country of melt and pour. AD/CVD cash deposits come on top.",
            "link": "tariff-engineering",
        },
        {
            "id": "hs-codes",
            "question": "What are the HS codes for steel?",
            "searchedAs": ["hs code for steel", "hs code for steel plate", "hs code for steel coil", "hs code for steel bars", "hs code for stainless steel sheet", "hs code 7208", "hts code steel"],
            "answer": "Steel mill products are in HTS Chapter 72: hot-rolled coil and plate 7208, cold-rolled 7209, galvanized and coated sheet 7210 (7212 if under 600 mm wide), wire rod 7213, rebar and bars 7214–7215, "
            "beams and angles 7216, wire 7217; stainless steel 7218–7223 (sheet and plate 7219); other alloy steel 7224–7229 (electrical steel 7225–7226). Pipes, tubes, fittings and structures are "
            "in Chapter 73. Use the rate table to search by product name.",
            "link": "",
        },
        {
            "id": "stainless",
            "question": "Is there a tariff on stainless steel?",
            "searchedAs": ["stainless steel tariffs", "is there a tariff on stainless steel", "stainless steel tariff code", "stainless steel tariff us", "tariff on stainless steel from china"],
            "answer": "Yes. Stainless steel mill products (7218–7223) are Free at base but pay the 50% Section 232 duty from every country (UK 25% with UK-melted steel; China 75%). Stainless sheet and strip "
            "from China, Japan, Korea and Taiwan, plate in coils from Belgium, South Africa and Taiwan, and bar from India also carry AD/CVD orders. Stainless scrap (7204.21) is outside Section 232 and Free for most countries.",
            "link": "",
        },
        {
            "id": "scrap-pig-iron",
            "question": "Is there a tariff on steel scrap, pig iron or ferroalloys?",
            "searchedAs": ["scrap steel tariffs", "pig iron tariffs", "pig iron tariff code", "brazil pig iron tariff", "eu ferroalloy tariffs"],
            "answer": "They are outside Section 232. Scrap (7204) and pig iron (7201) are Free and, except spiegeleisen, on the 2026 Section 301 exemption list, so only China (25%) and Russia pay extra. "
            "Ferroalloys (7202) pay 1.1% to 10%; ferrosilicon, ferromolybdenum, ferrovanadium and other ferroalloys also pay the 2026 Section 301 duty (10% or 12.5%), Brazil's 25% duty and, for ferrosilicon "
            "from Brazil, Kazakhstan and Malaysia, AD/CVD.",
            "link": "industry-areas",
        },
    ]
    if trade_faq:
        faqs.insert(9, trade_faq)
    fc["faqs"] = faqs[:15]
