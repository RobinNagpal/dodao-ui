"""Trade-dependent text for Chapter 83 (understandIndustry, overview tradeSnapshot) and the FAQ page."""
from text83 import G, b, nm, COVERAGE, NO_DUTY


def apply_trade_and_faq(c):
    d, SRC = c["d"], c["SRC"]
    u, o, fc = d["understandIndustry"], d["overview"], d["finalConclusion"]
    n232, nnon, nca = len(c["S232"]), len(c["NON232"]), len(c["CA338"])
    yr, pyr = u["latestYear"], u["priorYear"]
    assert yr == 2025 and pyr == 2024
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    top = u["byCountry"]
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    heads_sorted = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
    h3 = ", ".join(f"{G[h][0].lower()} ({h}, {b(v)})" for h, v in heads_sorted[:3])
    t5 = ", ".join(f"{nm(x['country'])} ({b(x['importsUsd'])})" for x in top[:5])
    chg = (T - P) / P * 100
    peak_year = max(tot, key=tot.get)
    first = u["byYear"][0]["year"]
    cn = next(x for x in top if nm(x["country"]) == "China")
    vn = next(x for x in top if nm(x["country"]) == "Vietnam")
    bl = u["byLine"][0]
    assert bl["hs6"] == "8302.30", bl["hs6"]

    def share(name):
        x = next((x for x in top if nm(x["country"]) == name), None)
        return f" {name} shipped {b(x['importsUsd'])} of Chapter 83 goods in {yr}." if x else ""

    u["h1"] = "HTS Chapter 83: Miscellaneous Articles of Base Metal — U.S. Import Statistics"
    u["seo"] = {
        "title": f"U.S. Imports of Locks, Hinges & Hardware by Country: {', '.join(nm(x['country']) for x in top[:4])} (HTS Ch. 83) | KoalaGains",
        "shortDescription": f"Where U.S. imports of Chapter 83 base-metal articles (locks, hinges, fittings, safes, caps, welding consumables) come from, {first}–{yr}: {b(T)} in {yr} "
        f"({chg:+.1f}% on {pyr}), led by {nm(top[0]['country'])}. By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "HTS Chapter 83 import statistics",
            "miscellaneous articles of base metal imports",
            "us imports of locks and hinges",
            "door hardware importers in usa",
            "base metal hardware imports by country",
            "hs code 8302 imports",
        ],
    }
    u["why"] = (
        f"U.S. imports of Chapter 83 miscellaneous articles of base metal were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr}"
        + (f" (peak: {b(tot[peak_year])} in {peak_year})" if peak_year != yr else "")
        + f". The five largest suppliers were {t5}. By product group the largest were {h3}. The largest single six-digit line was motor-vehicle mountings and fittings, "
        f"{bl['hs6']} ({b(bl['importsUsd'])}).\n\n"
        f"China's shipments fell from {b(cn['priorImportsUsd'])} to {b(cn['importsUsd'])} while Vietnam's rose from {b(vn['priorImportsUsd'])} to {b(vn['importsUsd'])}. "
        f"{yr} was the year Section 232 reached this chapter: 24 hinge, castor, fitting, bracket, door-closer, binder-fitting and frame lines became aluminum derivatives on March 12, and steel hinges and fittings, "
        "staples, steel tubing and aluminum caps followed on August 18. Since April 6, 2026 those 31 lines pay 25% of their full value from every country; the rest pay the 2026 Section 301 duties.\n\n"
        f"{yr} is the latest full year of U.S. trade data. {NO_DUTY}"
    )
    u["coverageNote"] = COVERAGE
    u["effectiveDuty"]["note"] = NO_DUTY
    u["sources"] = [
        {"label": f"UN Comtrade (public API), United States imports, HS chapter 83 (retrieved {d['asOf']})", "url": "https://comtradeplus.un.org/"},
        {"label": "Federal Register 90 FR 11251 (aluminum derivative list, incl. Chapter 83 hardware, from March 12, 2025)", "url": SRC["fr-2025-03596"]["url"]},
        {"label": "Federal Register 90 FR 40326 (Section 232 inclusions: steel hinges, fittings, staples and aluminum caps from August 18, 2025)", "url": SRC["fr-2025-15819"]["url"]},
    ]
    ts = o["tradeSnapshot"]
    ts["coverageNote"] = COVERAGE
    ts["effectiveDutyRateNote"] = NO_DUTY
    ts["totalDutyCollectedUsd"] = None
    ts["source"] = f"UN Comtrade, United States imports, HS chapter 83 ({yr})"
    for k in ("valueBasis", "byYearCaption"):
        assert "TODO" not in u[k], k

    # ---------------------------------------------------------------- finalConclusion
    fc["h1"] = "HTS Chapter 83: Miscellaneous Articles of Base Metal — Tariff FAQ"
    fc["seo"] = {
        "title": "HTS Chapter 83 Tariff FAQ: Locks, Hinges, Drawer Slides, Section 232 Derivatives, China, Mexico, Canada | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on HTS Chapter 83: HS codes 8301 and 8302 for locks and hinges, drawer slides, the aluminum and steel derivative list, "
        "China, Mexico and Canada (Section 338), the 2026 Section 301 duties, caps, sign plates, frames, staples and welding wire.",
        "keywords": [
            "hts chapter 83",
            "chapter 83 hts 2026",
            "hs code 8302",
            "hs code 8301",
            "tariff code for hinges",
            "drawer slides hs code",
            "aluminum derivative tariff list",
            "canada section 338 tariffs",
            "section 301 tariffs mexico",
            "welding wire hs code",
            "hs code 8309",
        ],
    }
    fc["intro"] = (
        "Straight answers to the most-searched questions about U.S. tariffs on miscellaneous articles of base metal (HTS Chapter 83), by product, by country and by HS code. "
        "Each answer links to the page with the detail and the official sources."
    )
    fc["keyTakeaways"] = [
        f"{n232} of the 89 Chapter 83 lines are Section 232 aluminum or steel derivatives (hinges, castors, door closers and fittings of iron, steel, aluminum or zinc, drawer slides, brackets, staples, frames, "
        "tubing without fittings, caps and can ends): 25% of the full value from every country since April 6, 2026, on top of any FTA or USMCA rate.",
        f"The other {nnon} lines (locks and keys, brass hardware, safes, ornaments, buckles, crown corks, sign plates, welding consumables) pay the 2026 Section 301 duty of 10% or 12.5% since July 24, 2026; "
        "USMCA goods of Canada and Mexico are exempt. Vehicle locks, hinges and fittings pay the auto-parts duty when used in vehicles.",
        f"China pays 25% (List 3) or 7.5% (List 4A) more on 81 lines, Canada +50% Section 338 on {nca} lines even with USMCA, and Chinese aluminum-extrusion hardware, paper clips and collated staples carry AD/CVD. "
        "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026.",
        f"In {yr} the U.S. imported {b(T)} of Chapter 83 products; {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}) and {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) were the largest suppliers.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
    fc["faqs"] = [
        {
            "id": "what-is-chapter-83",
            "question": "What is HTS Chapter 83?",
            "searchedAs": ["hts chapter 83", "htsus chapter 83", "chapter 83 hts", "chapter 83 hts code", "hts code chapter 83", "chapter 83 hts 2026"],
            "answer": f"Chapter 83 of the Harmonized Tariff Schedule covers miscellaneous articles of base metal: padlocks, locks and keys (8301), hinges, castors and mountings and fittings for doors, windows, furniture "
            "and vehicles (8302), safes (8303), desk equipment (8304), binder fittings, paper clips and staples (8305), bells, ornaments, frames and mirrors (8306), flexible tubing (8307), clasps, buckles, "
            f"eyelets and rivets (8308), caps, crown corks and can ends (8309), sign plates (8310) and welding electrodes and solder (8311). It has 89 ten-digit lines. In {yr} the U.S. imported {b(T)} of them, "
            f"led by {nm(top[0]['country'])} and {nm(top[1]['country'])}.",
            "link": "",
        },
        {
            "id": "hs-8302-hinges",
            "question": "What is the HS code and tariff for hinges (HS 8302)?",
            "searchedAs": ["hs code 8302", "hs code 8302.10", "tariff code for hinges", "door hinges tariff code", "hinge hs code", "steel hinge hs code", "door hinge hs code"],
            "answer": "Heading 8302 covers base-metal mountings and fittings; hinges are 8302.10: 8302.10.30 for motor-vehicle hinges of iron, steel, aluminum or zinc (2%), 8302.10.60 for other hinges of those metals "
            "(3.5%; door, furniture and other), and 8302.10.90 for hinges of other base metal such as brass (3.4%). Iron, steel, aluminum or zinc hinges are Section 232 derivatives: +25% of the value from every "
            "country (a Vietnamese steel door hinge pays 28.5%, a Chinese one 53.5%). Brass hinges are not; they pay the 2026 Section 301 duty instead.",
            "link": "",
        },
        {
            "id": "hs-8302-42-drawer-slides",
            "question": "What is the HS code for drawer slides and cabinet hardware?",
            "searchedAs": ["hs code 8302.42", "hts code 8302.42", "drawer slides hs code", "metal drawer slide hs code", "drawer slides tariff code", "cabinet hardware tariff", "hs code 8302.41"],
            "answer": "Drawer slides of iron, steel, aluminum or zinc are 8302.42.30.15 (furniture fittings, 3.9%); gas lift cylinders for furniture are 8302.42.30.10, other furniture fittings 8302.42.30.65, and fittings of "
            "other base metal 8302.42.60 (3.4%). Door and window hardware for buildings is 8302.41. The 8302.42.30 and 8302.41.30/.60 lines pay 25% Section 232 from every country; Chinese drawer slides add 7.5% "
            "(List 4A) for 36.4%, and aluminum ones can fall under the aluminum extrusions AD/CVD orders.",
            "link": "",
        },
        {
            "id": "hs-8301-locks",
            "question": "What is the tariff code for locks and padlocks (HS 8301)?",
            "searchedAs": ["hs code 8301", "padlock hs code", "lock hs code", "lock tariff code", "door lock tariff code", "hs code for door lock", "car door lock hs code"],
            "answer": "Heading 8301: padlocks 8301.10 (2.3% to 6.1% by width and construction), motor-vehicle locks 8301.20 (5.7%), furniture locks 8301.30 (5.7%), door locks, locksets and other locks 8301.40 "
            "(luggage locks 3.1%, others 5.7%), clasps with locks 8301.50, parts 8301.60 and keys 8301.70. Locks are not on the Section 232 metals lists: most countries add 10% or 12.5% Section 301 (none for USMCA goods), "
            "China adds 12.5% plus 7.5% (List 4A) on most lines. Car and truck locks pay the auto-parts duty instead.",
            "link": "",
        },
        {
            "id": "derivative-list",
            "question": "Which Chapter 83 products are on the Section 232 aluminum and steel derivative list?",
            "searchedAs": ["aluminum derivative tariff list", "steel derivative tariff list", "section 232 derivative products list", "steel and aluminum tariffs derivative products", "aluminum derivative tariff", "steel aluminum derivative tariff"],
            "answer": f"U.S. note 16(c) to Chapter 99 lists {n232} Chapter 83 lines: hinges of iron, steel, aluminum or zinc (8302.10.30, 8302.10.60), castors (8302.20), vehicle fittings (8302.30.30), door closers (8302.41.30, 8302.60), "
            "building, furniture and other fittings including drawer slides (8302.41.60, 8302.42.30, 8302.49.60), brackets (8302.50), binder fittings (8305.10.00.50), staples in strips (8305.20), frames and mirrors (8306.30), "
            "flexible tubing without fittings (8307.10.60, 8307.90.60) and aluminum or steel caps and can ends (8309.90.00.20, .25, .80). Since April 6, 2026 all pay 25% of the full value (9903.82.09), or none if "
            "aluminum, steel and copper are under 15% of the weight.",
            "link": "tariff-updates",
        },
        {
            "id": "china",
            "question": "What are the tariffs on Chapter 83 goods from China in 2026?",
            "searchedAs": ["tariffs on china 2026", "us tariffs on china 2026", "current china tariffs 2026", "section 301 tariffs on china 2026", "what are the tariffs on china"],
            "answer": "On the 31 Section 232 lines China pays 25% Section 232 plus 25% (List 3) or 7.5% (List 4A) plus the base rate: about 50%–55.7% on hinges, castors and fittings, 36.4% on drawer slides. On the other lines "
            "it pays 12.5% (2026 Section 301) plus 25% or 7.5%: most locks 22%–26%, safes 41.3%, buckles, crown corks, sign plates and welding electrodes 37.5% or more. Chinese aluminum-extrusion hardware, paper clips "
            "and collated staples also carry AD/CVD. The IEEPA tariffs on China ended February 24, 2026." + share("China"),
            "link": "industry-areas",
        },
        {
            "id": "mexico",
            "question": "What is the tariff on Chapter 83 goods from Mexico?",
            "searchedAs": ["section 301 mexico", "section 301 tariffs mexico", "mexico tariffs 2026"],
            "answer": "Mexican goods outside Section 232 (locks, safes, buckles, crown corks, sign plates, welding consumables) are Free with a USMCA certification of origin; without it they pay the base rate plus 10% "
            "Section 301 (9903.05.55). The 31 Section 232 lines (hinges, fittings, drawer slides, brackets, caps) pay 25% with or without USMCA. USMCA-qualifying vehicle locks and fittings pay no auto-parts duty." + share("Mexico"),
            "link": "industry-areas",
        },
        {
            "id": "canada-338",
            "question": "Which Chapter 83 goods are on the Section 338 list for Canada?",
            "searchedAs": ["canada section 338 tariffs", "section 338 canada hts list", "canada section 338 csms", "us canada section 338 tariffs", "what is section 338"],
            "answer": f"Section 338 of the Tariff Act of 1930 lets the President add duties on countries that discriminate against U.S. commerce. Under Proclamations 11048 and 11065, {nca} Chapter 83 lines from Canada pay +50% "
            "(9903.03.14) even with a USMCA claim: lock parts, safes and other ornaments since August 22, 2026, and flexible tubing with fittings, all of 8308 (buckles, eyelets, rivets, clasps), crown corks, "
            "sign plates and welding electrodes, cored wire and solders since September 15, 2026 (CBP CSMS 69851916). Other Canadian lines pay 25% Section 232 or nothing extra with USMCA." + share("Canada"),
            "link": "tariff-updates",
        },
        {
            "id": "section-301-2026",
            "question": "Are the Section 301 tariffs of July 24, 2026 and the Section 122 surcharge still in effect?",
            "searchedAs": ["section 301 tariffs 2026", "section 301 tariffs july 24 2026", "new section 301 tariffs 2026", "section 122 tariff expired", "did section 122 tariffs expire", "ieepa tariffs ended", "are the tariffs still in effect"],
            "answer": f"The 2026 Section 301 duties on 60 economies (10% or 12.5%) took effect July 24, 2026 and apply to the {nnon} Chapter 83 lines outside Section 232; USMCA goods are exempt. The 10% Section 122 surcharge "
            "expired July 23, 2026, and the IEEPA tariffs ended February 24, 2026 after the Supreme Court ruling. Section 232 and the China Section 301 lists continue.",
            "link": "tariff-updates",
        },
        {
            "id": "hs-8309-caps",
            "question": "What is HS code 8309 (caps, crown corks and lids)?",
            "searchedAs": ["hs code 8309", "hs code 8309.90", "hts code 8309.90", "crown cork hs code"],
            "answer": "Heading 8309 covers stoppers, caps and lids of base metal: crown corks 8309.10 (Free) and other caps, can ends, screw caps and seals 8309.90 (2.6%), split into aluminum beverage-can ends (.20), other "
            "aluminum (.25), steel (.80) and other (.85). The aluminum and steel lines are Section 232 derivatives at 25%; crown corks pay the 2026 Section 301 duty (Canada +50% Section 338). Closures that touch food "
            "must meet FDA food-contact rules (21 CFR 177.1210).",
            "link": "",
        },
        {
            "id": "hs-8311-welding",
            "question": "What is the tariff code for welding wire and welding rods?",
            "searchedAs": ["welding wire hs code", "tariff code for welding wire", "welding rod tariff code", "welding rod hs code", "hs code 8311", "mig welding wire hs code"],
            "answer": "Coated stick electrodes for arc welding are 8311.10, flux-cored wire 8311.20, coated rods and cored wire for soldering, brazing or flame welding 8311.30 (lead-tin solders 8311.30.30) and other 8311.90; "
            "all are Free and not on the Section 232 lists, so they pay the 2026 Section 301 duty (10%–12.5%), China 12.5% + 25%, Canada +50% Section 338. Solid (uncoated) MIG wire is classified with its metal, "
            "e.g. steel welding wire in Chapter 72, where Section 232 applies.",
            "link": "",
        },
        {
            "id": "hs-8310-signs",
            "question": "What is HS code 8310 (metal signs and name plates)?",
            "searchedAs": ["hs code 8310", "hs code 8310.00", "hts code 8310.00", "metal sign hs code", "metal sign board hs code"],
            "answer": "8310.00.00.00 covers sign plates, name plates, address plates, numbers, letters and other symbols of base metal (illuminated signs are 9405). It is Free and not on the Section 232 lists. Heading 8310 is on CBP's "
            "informational-materials list, so plates that qualify enter under 9903.05.92 without the 2026 Section 301 duty; others pay 10% or 12.5%. China adds 25% (List 3) and Canada 50% (Section 338).",
            "link": "",
        },
        {
            "id": "hs-8306-frames",
            "question": "What is the HS code for metal picture frames and ornaments (HS 8306)?",
            "searchedAs": ["hs code 8306", "hs code 8306.29", "picture frame hts code", "metal picture frame hs code", "hs code 8306.30"],
            "answer": "Heading 8306: non-electric bells and gongs 8306.10 (5.8%), ornaments plated with precious metal 8306.21 (4.5%), other statuettes and ornaments 8306.29 (Free), and photograph or picture frames and "
            "mirrors of base metal 8306.30 (2.7%). Frames and mirrors are a Section 232 aluminum derivative (25%); ornaments and bells pay the 2026 Section 301 duty. Chinese aluminum frames can fall under the "
            "extrusions AD/CVD orders unless entered as finished framed pictures with glass and backing.",
            "link": "",
        },
        {
            "id": "hs-8305-staples",
            "question": "What is the HS code for staples and paper clips, and do they carry antidumping duties?",
            "searchedAs": ["hs code 8305", "hs code 8305.20", "staples hts code", "staples hs code", "paper clips hs code", "metal paper clips hs code"],
            "answer": "Staples in strips are 8305.20 (Free) and paper clips 8305.90.30 (Free; wholly of wire .10); ring-binder mechanisms are 8305.10.00.10. Staples in strips pay 25% Section 232 from every country. "
            "Chinese collated steel staples are under antidumping and countervailing duty orders continued in February 2026, and Chinese paper clips wholly of wire under an antidumping order continued in 2023.",
            "link": "tariff-updates",
        },
    ]
