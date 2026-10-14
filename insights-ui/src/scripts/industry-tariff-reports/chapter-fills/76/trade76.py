"""Trade-dependent text for Chapter 76 and the FAQ page (needs the generated understandIndustry data)."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "United Arab Emirates": "the UAE"}
DUTY_NOTE = "Duty-collected figures aren't available from an official source yet."


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
        head = {}
        for r in u["byHeadingCountry"]:
            head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
        peak_year = max(tot, key=tot.get)
        t5 = ", ".join(f"{nm(c['country'])} ({b(c['importsUsd'])})" for c in top[:5])
        heads_sorted = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
        labels = {g["heading"]: g["label"] for g in d["industryAreas"]["groups"]}
        h3 = ", ".join(f"{labels[h].split(' (')[0].lower()} ({h}, {b(v)})" for h, v in heads_sorted[:3])
        chg = (T - P) / P * 100
        ca = next((c for c in top if c["country"] == "Canada"), None)
        cn = next((c for c in top if c["country"] == "China"), None)
        mx = next((c for c in top if c["country"] == "Mexico"), None)
        ca_share = f" ({ca['sharePct']:.0f}% of the total)" if ca else ""
        u["h1"] = "HTS Chapter 76: Aluminum and Articles Thereof — U.S. Import Statistics"
        u["seo"] = {
            "title": "U.S. Aluminum Imports by Country & Product: Canada, UAE, China (HTS Ch. 76) | KoalaGains",
            "shortDescription": f"Where U.S. aluminum imports come from, {u['byYear'][0]['year']}–{yr}: {b(T)} in {yr} ({chg:+.1f}% on {pyr}), led by {nm(top[0]['country'])}. By country, by product and over time, from UN Comtrade.",
            "keywords": [
                "us aluminum imports by country",
                "does the us import aluminum",
                "aluminum imports from canada",
                "where does the us import aluminum from",
                "HTS Chapter 76 import statistics",
                "Canada Aluminium Trade",
            ],
        }
        u["why"] = (
            f"U.S. imports of Chapter 76 aluminum and aluminum articles were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr}"
            + (f" (peak: {b(tot[peak_year])} in {peak_year})" if peak_year != yr else "")
            + f". The five largest suppliers were {t5}"
            + (f"; Canada alone shipped {b(ca['importsUsd'])}{ca_share}" if ca else "")
            + f". By product group the largest were {h3}. Scrap (7602), outside Section 232 and Free for most suppliers, was {b(head.get('7602', 0))}.\n\n"
            "2025 was also the year Section 232 changed most: every country exemption and quota ended on March 12, the rate rose from 10% to 25% the same day and to 50% on June 4, "
            "so suppliers that had shipped duty-free, such as Canada, Mexico and Australia, or within quotas, such as the EU and UK, paid the full duty. "
            + (f"China, whose aluminum pays 75% plus AD/CVD on extrusions, sheet, foil and containers, shipped {b(cn['importsUsd'])}. " if cn else "")
            + "\n\n"
            f"{yr} is the latest full year of U.S. trade data. {DUTY_NOTE}"
        )
        u["coverageNote"] = COVERAGE
        u["effectiveDuty"]["note"] = DUTY_NOTE
        u["sources"] = u["sources"][:1] + [
            {"label": "Federal Register 90 FR 9807 (Proclamation 10895: Section 232 aluminum exemptions end, 25%, March 12, 2025)", "url": src["procl-10895"]["url"]},
            {"label": "Federal Register 90 FR 24199 (Proclamation 10947: Section 232 aluminum duty raised to 50% on June 4, 2025)", "url": src["procl-10947"]["url"]},
        ]
        ts = o["tradeSnapshot"]
        ts["coverageNote"] = COVERAGE
        ts["effectiveDutyRateNote"] = DUTY_NOTE
        ts["totalDutyCollectedUsd"] = None
        trade_faq = {
            "id": "imports-by-country",
            "question": "Where does the U.S. import aluminum from?",
            "searchedAs": ["does the us import aluminum", "aluminum tariffs us canada trade", "aluminum tariffs canada us", "us aluminum imports by country"],
            "answer": f"In {yr} the United States imported {b(T)} of Chapter 76 aluminum and aluminum articles. The largest suppliers were {t5}. "
            f"The biggest product groups were {h3}. Aluminum articles from all of them pay the 50% Section 232 duty today (UK 25% with UK-smelted aluminum, China 75%, Canadian extrusions and tubes 100%).",
            "link": "understand-industry",
        }
        imports_line = f"In {yr} the U.S. imported {b(T)} of Chapter 76 products, {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}) and {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) first."
        ca_s = f" Canada shipped {b(ca['importsUsd'])} of Chapter 76 goods in {yr}." if ca else ""
        mx_s = f" Mexico shipped {b(mx['importsUsd'])} in {yr}." if mx else ""
    else:
        trade_faq = None
        imports_line, ca_s, mx_s = "TODO trade", "", ""

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = "HTS Chapter 76: Aluminum and Articles Thereof — Tariff FAQ"
    fc["seo"] = {
        "title": "Aluminum Tariffs FAQ: Is the 50% Tariff Still in Effect? Canada, Mexico, China, Derivatives, HS Codes (HTS Ch. 76) | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. aluminum tariffs: the current rate, whether the 50% aluminum tariff is still in effect, aluminum tariffs on Canada, Mexico, China, the UK and EU, derivatives, smelt and cast, the AIM import license, extrusions, foil and HS codes.",
        "keywords": [
            "aluminum tariffs",
            "aluminum tariffs 2026",
            "are aluminum tariffs still in effect",
            "what is the tariff on aluminum",
            "aluminum tariffs canada",
            "aluminum tariff china",
            "section 232 aluminum derivatives list",
            "how are aluminum tariffs calculated",
            "hs code for aluminum",
            "aluminum import license",
            "aluminium tariffs",
        ],
    }
    fc["intro"] = "Straight answers to the most-searched questions about U.S. tariffs on aluminum imports, by country, by product and by HS code. Each answer links to the page with the detail and the official sources."
    fc["keyTakeaways"] = [
        "Aluminum articles and most derivatives (HTS 7601, 7604–7614, much of 7616) pay the Section 232 duty of 50% of their full customs value, from every country and on top of any FTA or USMCA rate; household articles, ladders, blinds and luggage frames pay 25%. UK aluminum smelted or cast in the UK pays 25% (15%).",
        "Chinese aluminum pays 75% (50% Section 232 + 25% Section 301), Russian aluminum 200% more (also when smelted or cast in Russia and shipped from elsewhere), and Canadian extrusions and tubes 100% since September 15, 2026 (Section 338). Scrap, powders, tanks and most fasteners are outside Section 232.",
        "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026; neither added to Section 232 aluminum. Antidumping and countervailing duties on extrusions, sheet, foil and disposable containers come on top and are not in the calculator.",
        imports_line,
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
    faqs = [
        {
            "id": "current-rate",
            "question": "What is the current U.S. tariff on aluminum?",
            "searchedAs": ["aluminum tariffs", "aluminum tariffs 2026", "what is the tariff on aluminum", "how much is the tariff on aluminum", "what is the current tariff on aluminum", "what are aluminum tariffs today", "aluminium tariffs us"],
            "answer": "50% of the full customs value for aluminum articles (unwrought aluminum, extrusions, wire, sheet, foil, tubes, castings) and most derivatives, from every country, under Section 232 heading 9903.82.02, "
            "on top of the base rate (Free to 6.5%). Household articles, ladders, blinds and luggage frames pay 25% (9903.82.09). UK aluminum smelted or most recently cast in the UK pays 25% (9903.82.04). "
            "Chinese aluminum pays another 25% under Section 301, Russian aluminum 200%, and Canadian extrusions and tubes another 50% under Section 338.",
            "link": "",
        },
        {
            "id": "still-in-effect",
            "question": "Is the 50% aluminum tariff still in effect, and when did it start?",
            "searchedAs": ["are aluminum tariffs still in effect", "is there still a tariff on aluminum", "is there a 50 tariff on aluminum", "aluminum tariff 50", "50 percent aluminum tariff", "are steel and aluminum tariffs still in effect"],
            "answer": "Yes. Proclamation 10947 raised the Section 232 aluminum duty from 25% to 50% for goods entered from 12:01 a.m. EDT on June 4, 2025. Proclamation 11021 kept 50% when it moved the duty to heading 9903.82.02 on the full customs value "
            "from April 6, 2026, and it is in the current tariff schedule (2026 Revision 21). The Supreme Court's February 20, 2026 ruling in Learning Resources, Inc. v. Trump ended only the IEEPA tariffs; "
            "the aluminum tariff rests on Section 232 of the Trade Expansion Act of 1962 and was not affected.",
            "link": "tariff-updates",
        },
        {
            "id": "canada",
            "question": "What is the tariff on aluminum from Canada?",
            "searchedAs": ["aluminum tariffs canada", "what is the tariff on aluminum from canada", "is there a tariff on aluminum from canada", "current aluminum tariff canada", "canada aluminum tariff exemption", "aluminium tariffs canada"],
            "answer": "50% on Canadian aluminum articles and most derivatives, with or without a USMCA claim: Canada's Section 232 exemption ended March 12, 2025, and note 16(b) collects the duty on top of the USMCA rate. "
            "Since September 15, 2026 Canadian extrusions (7604) and tubes and pipes (7608) also pay the 50% Section 338 duty (Proclamation 11065), so 100% in total. Commerce can authorize limited quantities at 25% (9903.82.19) "
            "for Canadian smelters that supply U.S. vehicle makers and commit to new U.S. capacity. Canadian scrap stays Free." + ca_s,
            "link": "industry-areas",
        },
        {
            "id": "mexico",
            "question": "What is the tariff on aluminum from Mexico?",
            "searchedAs": ["aluminum tariffs mexico", "what is the tariff on aluminum from mexico", "steel and aluminum tariffs mexico"],
            "answer": "50% on Mexican aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles, even with a USMCA certification. Mexico's exemption, and the 2024 rule that charged duty on "
            "Mexican aluminum smelted or cast in China, Russia, Belarus or Iran, ended on March 12, 2025, when all Mexican aluminum became dutiable. A 25% rate is possible only for Commerce-authorized quantities (9903.82.19)." + mx_s,
            "link": "industry-areas",
        },
        {
            "id": "china",
            "question": "What is the tariff on aluminum from China?",
            "searchedAs": ["aluminum tariff china", "aluminum tariff from china to usa", "china aluminum tariff rate", "current aluminum tariff from china", "is there a tariff on aluminum from china", "aluminum extrusion tariff china"],
            "answer": "75% to 81.5% on Chinese aluminum articles: 50% Section 232 plus 25% Section 301 (U.S. note 31, heading 9903.91.01, since September 27, 2024) plus the base rate; a few foil, door and window lines pay 7.5% under List 4A instead. "
            "Chinese scrap pays 25%. Chinese aluminum extrusions, common alloy sheet, foil and disposable containers also carry antidumping and countervailing duties, company by company.",
            "link": "industry-areas",
        },
        {
            "id": "by-country",
            "question": "What are aluminum tariffs by country, including the UK, EU and Japan?",
            "searchedAs": ["aluminum tariffs by country", "us aluminum tariffs by country", "steel and aluminum tariffs by country", "aluminum tariffs uk", "aluminum tariffs eu", "aluminum tariff japan", "what is the tariff on aluminum from japan", "aluminum tariff india"],
            "answer": "For aluminum articles: 50% for Canada (100% on extrusions and tubes), Mexico, the UAE, Bahrain, India, Korea, Japan, the EU and every other country; 25% for UK aluminum smelted or most recently cast in the UK; 75% for China; "
            "200% more for Russia. The EU and UK quotas and the Japan and Korea trade deals did not change the Section 232 aluminum rate (only civil aircraft parts are relieved). Differences between countries show up on scrap and fasteners, and in AD/CVD duties.",
            "link": "industry-areas",
        },
        {
            "id": "derivatives",
            "question": "Which aluminum derivatives are covered by Section 232?",
            "searchedAs": ["section 232 aluminum derivatives list", "aluminum derivatives list", "aluminum derivative tariff", "aluminum derivative tariff list", "section 232 aluminum hts codes", "section 232 aluminum derivatives"],
            "answer": "The lists are in U.S. note 16(c) to Chapter 99. In Chapter 76: aluminum articles (7601, 7604–7609, castings and forgings 7616.99.51.60/.70) and the derivatives in 7610, 7612–7614, 7616.10.90.90 and the other 7616.99.51 lines pay 50%; "
            "household articles (7615), luggage frames, ladders and blinds pay 25%. Outside Chapter 76, hundreds of derivative products of other chapters are listed and pay only when aluminum is at least 15% of their weight. "
            "Scrap, powders, tanks, pot scourers, most fasteners and wire cloth are not covered.",
            "link": "tariff-engineering",
        },
        {
            "id": "calculated",
            "question": "How are aluminum tariffs calculated?",
            "searchedAs": ["how are aluminum tariffs calculated", "how are steel and aluminum tariffs calculated", "aluminum content tariff", "aluminum derivative weight"],
            "answer": "Add the base rate of the Chapter 76 line and the Section 232 rate (50% or 25%) applied to the full customs value, plus any other Chapter 99 duty that stacks: Section 301 for China (25%), Section 338 for Canadian extrusions and tubes (50%), "
            "or Russia's 200%. Since April 6, 2026 the duty is no longer limited to the aluminum content. The 2026 Section 301 and Brazil duties do not stack on Section 232 aluminum. CBP's CSMS # 68253075 explains which 9903.82 heading to report; "
            "AD/CVD cash deposits come on top.",
            "link": "tariff-engineering",
        },
        {
            "id": "smelt-cast",
            "question": "What are the Section 232 aluminum smelt and cast requirements?",
            "searchedAs": ["section 232 aluminum smelt and cast requirements", "smelt and cast meaning", "smelt and cast vs melt and pour", "smelt and cast reporting requirements", "smelt and cast country"],
            "answer": "Importers report, for every Section 232 aluminum entry, the primary and secondary country of smelt (where the largest and second-largest volumes of new aluminum were produced from alumina) and the country of most recent cast "
            "(where the aluminum was last liquefied and cast). Steel uses the equivalent \"melt and pour\" country. The answers decide the UK 25%, U.S.-smelted 10% and Canada/Mexico 25% rates, and the 200% on aluminum smelted or cast in Russia.",
            "link": "tariff-engineering",
        },
        {
            "id": "aim-license",
            "question": "Do I need an aluminum import license?",
            "searchedAs": ["aluminum import license", "aluminum import license requirements", "aluminum import monitoring (aim) system", "us aluminum import license", "aluminum import license application"],
            "answer": "Yes, for formal entries of unwrought aluminum, extrusions, wire, sheet, foil, tubes, fittings, castings and forgings (7601, 7604–7609, 7616.99.51.60/.70). Commerce's Aluminum Import Monitoring and Analysis (AIM) system "
            "issues the license automatically online, with the countries of smelt and cast; the number goes on the entry summary (19 CFR 361.101). Informal entries are exempt, and FTZ admissions need one too.",
            "link": "tariff-engineering",
        },
        {
            "id": "extrusions",
            "question": "What is the tariff on aluminum extrusions?",
            "searchedAs": ["aluminum extrusion tariff", "aluminum extrusion tariff code", "hts code aluminum extrusion", "aluminum extrusions antidumping order", "aluminum extrusions antidumping final determination", "aluminum profile tariff code"],
            "answer": "Extrusions are HTS 7604 (bars, rods and profiles, 1.5% to 5% base) and pay 50% Section 232 from every country; Canadian extrusions 100% (Section 338 adds 50%), Chinese 75% to 80%. "
            "Chinese extrusions also carry the 2011 antidumping and countervailing duty orders. Commerce found dumping on extrusions from 14 more countries in 2024, but the ITC voted no injury in November 2024, so no orders were issued.",
            "link": "tariff-updates",
        },
        {
            "id": "foil-sheet",
            "question": "What are the HS codes and tariffs for aluminum foil, sheet and plate?",
            "searchedAs": ["hs code for aluminum", "hs code for aluminum foil", "aluminum foil tariff code", "is there a tariff on aluminum foil", "aluminum sheet tariff code", "aluminum plate tariff code", "hs code for aluminum plate"],
            "answer": "Sheet, plate and strip over 0.2 mm thick are HTS 7606 (2.7% to 6.5% base); foil up to 0.2 mm is 7607 (Free to 5.8%). Both pay 50% Section 232. Common alloy sheet from China and 16 other countries, "
            "and foil from China, Armenia, Brazil, Oman, Russia and Türkiye, also carry AD/CVD orders. Other aluminum: unwrought 7601, extrusions 7604, wire 7605, tubes 7608, structures and windows 7610, cans 7612, cookware 7615, other articles 7616.",
            "link": "",
        },
        {
            "id": "exemptions",
            "question": "Are there exemptions from the aluminum tariffs, and is scrap covered?",
            "searchedAs": ["aluminum tariff exemption", "aluminum tariff relief", "steel and aluminum tariff exemptions", "aluminum scrap tariffs", "aluminium scrap tariff code"],
            "answer": "Very few. Proclamation 10895 ended all country exemptions and quotas on March 12, 2025, and no product exclusion process exists. What remains: the UK 25% (15%), U.S.-smelted derivatives at 10%, "
            "Commerce-authorized Canadian and Mexican quantities at 25%, civil aircraft relief for some countries, and goods not on the note 16(c) lists. Aluminum scrap (7602) is not covered: it is Free and on the 2026 Section 301 exemption list, "
            "so only China and Brazil (25%) pay extra.",
            "link": "tariff-engineering",
        },
        {
            "id": "russia",
            "question": "What is the tariff on Russian aluminum?",
            "searchedAs": ["russian aluminum tariff", "russia aluminum tariff"],
            "answer": "200% under Section 232 (9903.85.67 / 9903.85.68) since March 10, 2023, on top of Russia's column 2 rate or 70% in its place, plus 12.5% Section 301: about 250% to 280% in total. "
            "The 200% also applies to aluminum of any other origin that contains primary aluminum smelted in Russia or was cast in Russia (since April 10, 2023), which is why smelt and cast reporting matters.",
            "link": "industry-areas",
        },
    ]
    if trade_faq:
        faqs.insert(5, trade_faq)
    fc["faqs"] = faqs[:15]
