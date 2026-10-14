"""Trade-dependent text for Chapter 81 and the FAQ page (needs the generated understandIndustry data)."""

COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan"}
DUTY_NOTE = "Duty-collected figures aren't available from an official source yet."


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def nm(c):
    return NAMES.get(c, c)


def apply_trade(d, src, G):
    u = d["understandIndustry"]
    o = d["overview"]
    fc = d["finalConclusion"]
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    top = u["byCountry"]
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    heads_sorted = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
    t5 = ", ".join(f"{nm(c['country'])} ({b(c['importsUsd'])})" for c in top[:5])
    h3 = ", ".join(f"{G[h][1].lower()} ({h}, {b(v)})" for h, v in heads_sorted[:3])
    chg = (T - P) / P * 100
    cn = next(c for c in top if c["country"] == "China")
    jp = next(c for c in top if c["country"] == "Japan")
    ca = next(c for c in top if c["country"] == "Canada")
    first_year = u["byYear"][0]["year"]
    grow = [c for c in top if c["country"] in ("Thailand", "Kazakhstan")]
    assert len(grow) == 2
    ca_co = sum(r["importsUsd"] for r in u["byHeadingCountry"] if r["heading"] == "8105" and r["country"] == "Canada")
    ru_ti = sum(r["importsUsd"] for r in u["byHeadingCountry"] if r["heading"] == "8108" and r["country"] == "Russian Federation")
    assert top[0]["country"] == "Japan" and top[1]["country"] == "China", [c["country"] for c in top[:2]]

    u["h1"] = "HTS Chapter 81: Other Base Metals; Cermets; Articles Thereof — U.S. Import Statistics"
    u["seo"] = {
        "title": "U.S. Imports of Titanium, Cobalt, Tungsten & Other Critical Metals by Country (HTS Ch. 81) | KoalaGains",
        "shortDescription": f"Where U.S. imports of Chapter 81 metals come from, {first_year}–{yr}: {b(T)} in {yr} ({chg:+.1f}% on {pyr}), led by Japan and China. "
        "By country, by metal (titanium, cobalt, tungsten, magnesium, tantalum, antimony) and over time, from UN Comtrade.",
        "keywords": [
            "us titanium imports by country",
            "where does the us get titanium",
            "us imports of critical minerals",
            "where does the us get cobalt",
            "where does the us get most of its tungsten",
            "HTS Chapter 81 import statistics",
        ],
    }
    u["why"] = (
        f"U.S. imports of Chapter 81 metals and cermets were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr} and up from {b(tot[first_year])} in {first_year}. "
        f"The five largest suppliers were {t5}. By product group the largest were {h3}: titanium alone, mostly sponge and mill products, was about {head['8108'] / T * 100:.0f}% of the total, "
        f"and Japan shipped {b(jp['importsUsd'])}, mostly titanium.\n\n"
        f"Imports from **China fell {abs(cn['changePct']):.0f}%**, from {b(cn['priorImportsUsd'])} in {pyr} to {b(cn['importsUsd'])} in {yr}. In {yr} Chinese goods also paid the IEEPA duties "
        "(the fentanyl duty on every line, the reciprocal duty on lines outside Annex II), and Chinese unwrought and wrought tungsten a new 25% Section 301 rate from January 1, 2025. "
        + "Among the fastest-growing suppliers were " + ", ".join(f"{nm(c['country'])} ({b(c['priorImportsUsd'])} to {b(c['importsUsd'])}, mainly {G[c['mainHeading']][1].lower()})" for c in grow) + ". "
        f"Canada shipped {b(ca['importsUsd'])}, led by cobalt ({b(ca_co)}); USMCA-qualifying Canadian metal is Free.\n\n"
        f"{yr} is the latest full year of U.S. trade data. {DUTY_NOTE}"
    )
    u["coverageNote"] = COVERAGE
    u["effectiveDuty"]["note"] = DUTY_NOTE
    u["sources"] = u["sources"][:1] + [
        {"label": "Federal Register 91 FR 2439 (Proclamation 11001: Section 232 processed critical minerals, negotiations instead of tariffs, January 14, 2026)", "url": src["procl-11001"]["url"]},
        {"label": "Federal Register 89 FR 101682 (USTR: 25% Section 301 duty on Chinese tungsten products from January 1, 2025)", "url": src["fr-2024-29462"]["url"]},
    ]
    ts = o["tradeSnapshot"]
    ts["coverageNote"] = COVERAGE
    ts["effectiveDutyRateNote"] = DUTY_NOTE
    ts["totalDutyCollectedUsd"] = None

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = "HTS Chapter 81: Other Base Metals; Cermets; Articles Thereof — Tariff FAQ"
    fc["seo"] = {
        "title": "Critical Minerals Tariffs FAQ: Tungsten, Titanium, Magnesium, Cobalt, Gallium & HS Codes (HTS Ch. 81) | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on Chapter 81 metals: the Section 232 critical minerals decision, which metals are exempt, tungsten and titanium tariffs, China rates, "
        "gallium, germanium and antimony, magnesium antidumping duties, Canadian cermets and the HS codes for titanium, tungsten carbide and cermets.",
        "keywords": [
            "critical minerals tariffs",
            "section 232 critical minerals tariffs",
            "critical minerals exempt from tariffs",
            "tungsten tariffs",
            "tungsten tariff china",
            "titanium tariffs",
            "is there a tariff on titanium",
            "magnesium tariff",
            "cobalt tariffs",
            "gallium tariff",
            "titanium hs code",
            "tungsten carbide hs code",
        ],
    }
    fc["intro"] = "Straight answers to the most-searched questions about U.S. tariffs on tungsten, titanium, magnesium, cobalt and the other Chapter 81 metals, by country and by HS code. Each answer links to the page with the detail and the official sources."
    fc["keyTakeaways"] = [
        "No Section 232 tariff applies to Chapter 81 metals: Proclamation 11001 (January 14, 2026) chose negotiations on processed critical minerals instead of tariffs. Base rates run from Free to 15% (titanium).",
        "The 2026 Section 301 tariffs (10% or 12.5%) exempt 52 of the 84 lines through note 52(b): titanium, tantalum, magnesium, cobalt, bismuth, antimony, chromium, gallium, germanium, indium, niobium, tungsten powder and scrap. "
        "Molybdenum, zirconium, beryllium, hafnium, cadmium, unwrought tungsten and cermets pay it.",
        "China pays 25% under Section 301 on 59 lines (44.1% on unwrought tungsten, 40% on titanium sponge); Canadian cermets pay 50% under Section 338 even with USMCA; Russia pays column 2 or 70%. "
        "Antidumping orders cover Chinese magnesium and tungsten shot.",
        f"In {yr} the U.S. imported {b(T)} of Chapter 81 products, Japan ({b(jp['importsUsd'])}) and China ({b(cn['importsUsd'])}) first; titanium was the largest group.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
    fc["faqs"] = [
        {
            "id": "s232-critical-minerals",
            "question": "Is there a Section 232 tariff on critical minerals?",
            "searchedAs": ["section 232 critical minerals", "section 232 critical minerals tariffs", "critical minerals 232 tariffs", "us critical minerals tariff decision", "trump critical minerals tariffs",
                           "section 232 processed critical minerals", "section 232 critical minerals report", "critical minerals section 232 tariff decisions"],
            "answer": "No. Commerce investigated imports of processed critical minerals and their derivative products under Section 232 from April 2025 (Executive Order 14272) and reported on October 24, 2025 that they threaten national security. "
            "In Proclamation 11001 of January 14, 2026, the President chose to negotiate agreements, considering price floors, instead of imposing tariffs, and said minimum import prices could follow. "
            "As of the 2026 Revision 21 schedule, no Section 232 heading covers Chapter 81 metals.",
            "link": "tariff-updates",
        },
        {
            "id": "exempt",
            "question": "Which critical minerals are exempt from tariffs?",
            "searchedAs": ["critical minerals exempt from tariffs", "critical minerals tariffs", "critical minerals tariffs us", "tungsten tariff exemption"],
            "answer": "Under the 2026 Section 301 tariffs on 60 economies, U.S. note 52(b) exempts 52 of the 84 Chapter 81 lines: tungsten powder and scrap, tantalum, magnesium, cobalt, bismuth, titanium, antimony, unwrought manganese, chromium, rhenium, gallium, "
            "germanium, indium, niobium and wrought vanadium (heading 9903.05.86). They pay only their base rate (Free to 15%). The exemption does not cover China's 25% Section 301 duty, "
            "and molybdenum, zirconium, beryllium, hafnium, cadmium, unwrought tungsten, tungsten wire and cermets are not exempt.",
            "link": "",
        },
        {
            "id": "tungsten",
            "question": "What is the U.S. tariff on tungsten?",
            "searchedAs": ["tungsten tariffs", "tungsten tariff", "us tariff on tungsten", "is there a tariff on tungsten", "tariff on tungsten", "trump tungsten tariff"],
            "answer": "Base rates are 2.8% (scrap) to 7% (powder): 6.6% for unwrought tungsten and sintered bars (8101.94), 4.4% for wire, 6.5% for wrought bars, sheet and foil. Powder and scrap are exempt from the 2026 Section 301 duty; "
            "unwrought tungsten, wire and other articles pay it (10% or 12.5% more, or 10% / 12.5% in total for the EU, Japan, Korea and Taiwan). FTA partners such as Korea and Israel pay no base rate. Tungsten ores and concentrates are Chapter 26, not 81.",
            "link": "industry-areas",
        },
        {
            "id": "tungsten-china",
            "question": "What is the tariff on tungsten from China?",
            "searchedAs": ["tungsten tariff china", "tariff on tungsten from china", "tungsten china tariff"],
            "answer": "Unwrought tungsten and wrought tungsten from China pay the base rate + 25% Section 301 (note 31(j), heading 9903.91.11, since January 1, 2025) + 12.5% (the 2026 action): 44.1% for unwrought tungsten (8101.94). "
            "Tungsten powder pays 7% + 25% (note 31(b), since September 27, 2024) = 32%; tungsten wire 41.9%; scrap only its 2.8% base rate. Tungsten shot from China also carries antidumping (201.32% China-wide) and countervailing duty orders.",
            "link": "industry-areas",
        },
        {
            "id": "tungsten-carbide",
            "question": "What is the HS code and tariff for tungsten carbide?",
            "searchedAs": ["tungsten carbide hs code", "tungsten carbide tariff", "tungsten carbide tariff code", "cemented carbide hs code", "tungsten carbide powder hs code", "tungsten carbide inserts hs code", "tungsten carbide hts code"],
            "answer": "It depends on the form. Tungsten carbide powder is a chemical, 2849.90.30 (5.5%). Cemented (sintered) carbide is a cermet: rods, blanks, wear parts and scrap generally fall in 8113.00.00 (3.7%), while plates, tips and inserts for tools, unmounted, are 8209.00.00 (4.6%). "
            "Cermets of 8113 pay the 2026 Section 301 duty and, from Canada, the 50% Section 338 duty.",
            "link": "",
        },
        {
            "id": "titanium",
            "question": "Is there a tariff on titanium?",
            "searchedAs": ["titanium tariffs", "us tariffs on titanium", "is there a tariff on titanium"],
            "answer": "Yes, a base rate: 15% on titanium sponge, ingot, powder and mill products (bars, plate, sheet, tube), 5.5% on titanium castings and articles, Free on scrap. All titanium lines are exempt from the 2026 Section 301 duties, "
            "and no Section 232 tariff applies (a 2019 Section 232 finding on titanium sponge led to a working group, not tariffs). China pays 25% more (40% on sponge), Russia 70% on sponge and scrap. "
            "FTA partners (Korea, Israel, Chile, Australia) and USMCA goods pay nothing; civil aircraft tubes with attached fittings are Free.",
            "link": "industry-areas",
        },
        {
            "id": "titanium-hs",
            "question": "What is the HS code for titanium sponge, sheet, scrap and powder?",
            "searchedAs": ["titanium hs code", "tariff code for titanium", "titanium hts code", "titanium sponge hs code", "titanium scrap hs code", "titanium plate hs code", "titanium powder hs code", "hs code titanium tube"],
            "answer": "Unwrought titanium is 8108.20.00: sponge .10, powders .15, ingots .30, other .95 (15%). Scrap is 8108.30.00 (Free). Castings are 8108.90.30.30 and other titanium articles 8108.90.30.60 (5.5%). "
            "Mill products are 8108.90.60 (15%): blooms, sheet bars and slabs .20, bars, rods, profiles and wire .31, plates, sheets, strip and foil .45, tubes and pipes .60. Titanium dioxide is 2823.00.00 (Chapter 28), not Chapter 81.",
            "link": "",
        },
        {
            "id": "magnesium",
            "question": "What is the tariff on magnesium, and what is its tariff code?",
            "searchedAs": ["magnesium tariff", "magnesium tariff code", "hs code for magnesium"],
            "answer": "Unwrought magnesium of at least 99.8% is 8104.11.00 (8%), other unwrought magnesium (alloys) 8104.19.00 (6.5%), scrap 8104.20.00 (Free), raspings, granules and powder 8104.30.00 (4.4%), other articles 8104.90.00 (14.8¢/kg on magnesium content + 3.5%). "
            "All are exempt from the 2026 Section 301 duty. Chinese pure, granular and alloy magnesium also carry antidumping duty orders (the alloy order is in a sunset review begun October 1, 2026). Magnesium oxide, sulfate and other compounds are in Chapters 25 and 28.",
            "link": "tariff-engineering",
        },
        {
            "id": "gallium-germanium-antimony",
            "question": "What are the U.S. tariffs on gallium, germanium and antimony?",
            "searchedAs": ["gallium tariff", "germanium tariff", "antimony tariff", "china critical minerals tariffs"],
            "answer": "Unwrought gallium (8112.92.10) is 3%, unwrought germanium (8112.92.60) 2.6%, other germanium (8112.99.10) 4.4%, and antimony (8110) Free. All are exempt from the 2026 Section 301 duty. From China, gallium pays 25% more (28%) and wrought germanium 29.4%, "
            "while unwrought germanium and antimony pay no Section 301 duty. China's export controls on such minerals are Chinese rules, not U.S. duties; in November 2025 China committed to postpone and effectively eliminate its controls on rare earths and other critical minerals (Executive Order 14358).",
            "link": "industry-areas",
        },
        {
            "id": "cobalt",
            "question": "What is the tariff on cobalt?",
            "searchedAs": ["cobalt tariffs", "cobalt tariff"],
            "answer": "Unwrought cobalt (other than alloys), mattes, powders and scrap are Free; cobalt alloys 4.4% and other cobalt articles 3.7% (8105). All cobalt lines are exempt from the 2026 Section 301 duty. Chinese cobalt pays 25% (List 3). "
            "USMCA, FTA and AGOA claims remove the base rate (Madagascar's cobalt enters Free). Cobalt ores are Chapter 26 and cobalt oxides Chapter 28.",
            "link": "industry-areas",
        },
        {
            "id": "molybdenum-manganese-bismuth",
            "question": "What is the tariff on molybdenum, manganese and bismuth?",
            "searchedAs": ["molybdenum tariff", "manganese tariffs", "bismuth tariff"],
            "answer": "Molybdenum powder pays 9.1¢/kg on molybdenum content + 1.2%, unwrought molybdenum 13.9¢/kg on molybdenum content + 1.9%, bars and other articles up to 6.6%; no molybdenum line is exempt from the 2026 Section 301 duty, so most suppliers add 10% or 12.5%. "
            "Unwrought manganese is 14% and exempt; manganese scrap (Free) and articles (3.7%) are not. Bismuth is Free and exempt; Chinese bismuth pays 25%.",
            "link": "",
        },
        {
            "id": "canada",
            "question": "What tariffs apply to critical minerals from Canada?",
            "searchedAs": ["canada critical minerals tariffs", "critical minerals tariffs us"],
            "answer": "USMCA-qualifying Canadian Chapter 81 metals (cobalt, tungsten, titanium and the rest) enter Free: USMCA removes the base rate and the 10% Section 301 duty (9903.05.93). The exception is cermets (8113), "
            "which pay the 50% Section 338 duty (9903.03.14) since August 22, 2026, with or without USMCA. Without a USMCA claim, the 32 lines outside note 52(b) pay 10% more. The 2025 IEEPA duties on Canada ended February 24, 2026.",
            "link": "industry-areas",
        },
        {
            "id": "cermets",
            "question": "What are cermets, and what is their HS code?",
            "searchedAs": ["cermet hs code", "cermet insert hs code", "cermet cutting tools hs code"],
            "answer": "Cermets are sintered composites of a ceramic and a metal, such as cemented carbides. Cermets and articles of cermets, including waste and scrap, are 8113.00.00 (3.7%); cermet plates, tips and inserts for tools, unmounted, are 8209.00.00 (4.6%), "
            "and inserts mounted on tools are classified with the tool. 8113 pays the 2026 Section 301 duty, 25% more from China (41.2% in total) and 50% more from Canada under Section 338.",
            "link": "",
        },
        {
            "id": "chapter-81",
            "question": "What does HTS Chapter 81 cover?",
            "searchedAs": ["hts chapter 81", "chapter 81 hts"],
            "answer": "Chapter 81, \"Other base metals; cermets; articles thereof\", covers tungsten (8101), molybdenum (8102), tantalum (8103), magnesium (8104), cobalt (8105), bismuth (8106), titanium (8108), zirconium (8109), antimony (8110), manganese (8111), "
            "beryllium, chromium, hafnium, rhenium, thallium, cadmium, gallium, germanium, indium, niobium and vanadium (8112), and cermets (8113): 84 tariff lines from Free to 15%. Ores are in Chapter 26 and compounds in Chapter 28.",
            "link": "",
        },
        {
            "id": "imports-by-country",
            "question": "Where does the U.S. import these metals from?",
            "searchedAs": ["us titanium imports by country", "where does the us get titanium", "us imports of critical minerals", "where does the us get most of its tungsten", "where does the us get cobalt", "does the us buy titanium from russia"],
            "answer": f"In {yr} the United States imported {b(T)} of Chapter 81 metals and cermets. The largest suppliers were {t5}. The biggest product groups were {h3}. "
            f"Imports from China fell from {b(cn['priorImportsUsd'])} in {pyr} to {b(cn['importsUsd'])}. Russia shipped {b(ru_ti)} of titanium, which pays 70% (sponge and scrap) or column 2 rates.",
            "link": "understand-industry",
        },
    ]
