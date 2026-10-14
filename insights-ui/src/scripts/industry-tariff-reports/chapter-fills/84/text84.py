"""Writer text for Chapter 84: overview and tariff-updates pages."""
import copy


def b(usd):
    if usd >= 1e9:
        return f"${usd / 1e9:.1f}B"
    if usd >= 1e6:
        return f"${usd / 1e6:.0f}M"
    return f"${usd / 1e3:.0f}K"


def ch(SRC, id, type, date, label, title, detail, before, now, countries, ids):
    for sid in ids:
        assert sid in SRC, sid
    return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now, "countries": countries, "sourceIds": ids}


def apply(c):
    d, SRC, S, LINE, G = c["d"], c["SRC"], c["S"], c["LINE"], c["G"]
    o, tu = d["overview"], d["tariffUpdates"]
    cell_of = c["cell_of"]
    n25, neq, nmob, nauto, nmhdv, nsemi, n338 = (len(S[k]) for k in ("s232_25", "s232_eq15", "s232_mobile", "auto", "mhdv", "semi", "ca338"))
    n232 = n25 + neq + nmob
    n52b, nbr = len(c["EX52B"]), len(S["br_exempt"])
    ncn = len(c["CN_ANY"])
    NL = len(LINE)

    # ------------------------------------------------------------ groups
    for pg in o["productGroups"]:
        label, short, blurb, ex = G[pg["heading"]]
        pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
    for g in d["industryAreas"]["groups"]:
        g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

    # ------------------------------------------------------------ overview
    o["h1"] = "HTS Chapter 84: Nuclear Reactors, Boilers, Machinery and Mechanical Appliances — Tariff Rates"
    o["seo"] = {
        "title": "HTS Chapter 84 Tariffs 2026: Machinery, Computers (8471), Engines, Pumps, HVAC & Section 232 Rates | KoalaGains",
        "shortDescription": f"Searchable U.S. duty table for all {NL} HTS Chapter 84 lines: computers and parts, engines, turbines, pumps, compressors, air conditioners, refrigerators, washers, "
        "construction and farm machinery, machine tools, valves and bearings. Section 232 metals duties (25% / 15%), auto-parts duties, China Section 301 and the 2026 Section 301 rates by country.",
        "keywords": [
            "HTS Chapter 84",
            "chapter 84 hts code",
            "hts chapter 84 2026",
            "machinery tariffs",
            "industrial machinery tariffs",
            "hs code 8471",
            "hs code 8479",
            "hs code 8481",
            "section 232 machinery",
            "tariffs on machinery from china",
            "hvac tariffs",
            "agricultural machinery tariffs",
        ],
    }
    ndut = int(o["stats"][1]["value"].split(" of ")[0])
    o["stats"][2]["note"] = (
        f"2026 Section 301 (60 economies): {NL - n52b} lines (computers, computer parts and semiconductor equipment exempt); China Section 301 lists: {ncn}; "
        f"Section 232 metals: {n232} ({n25} at 25%, {neq} at a 15% floor, {nmob} mobile equipment at 25%); auto and truck parts: {nauto} (if used as such); semiconductors: {nsemi}; "
        f"Canada Section 338: {n338}; Russia 35% in lieu of column 2: {len(S['ru35'])}"
    )
    o["intro"] = (
        f"Chapter 84 covers machinery and mechanical appliances: nuclear reactors and boilers, engines and turbines, pumps, compressors and fans, air conditioners, refrigerators "
        "and heat pumps, filters, dishwashers and packaging machines, cranes, forklifts and conveyors, construction, mining and farm machinery, textile and printing machinery, "
        "washing machines, machine tools and power tools, computers and their parts, valves, bearings and gears, 3D printers and semiconductor equipment. "
        f"**{NL - ndut} of the {NL} lines are Free** under the general rate; the rest pay mostly 1% to 5% (the highest is 9.9% on ball bearing rings and parts; other speed changers of 8483.40.70 pay 25¢ each + 3.9%).\n\n"
        "What decides the cost is the extra duties. Since July 24, 2026 the **2026 Section 301** duties add **10% or 12.5%** for most of the 60 listed economies "
        "(for the EU, Japan, Korea, Switzerland and Taiwan a 10% or 12.5% total that replaces a lower base rate), but **computers (8471), computer parts (8473.30) and semiconductor "
        "manufacturing equipment (8486) are exempt** (note 52(b)), and USMCA goods from Canada and Mexico are exempt. "
        f"**Section 232** reaches {n232} lines as derivative steel or aluminum articles, charged on the **full customs value** from every country: **25%** on {n25} lines "
        f"(refrigerators, washers, window air conditioners, compressors, pumps, bearings, gears, valve parts, power tools), a **15% floor** on {neq} lines of industrial, agricultural and residential HVAC "
        f"equipment until December 31, 2027, and **25%** on {nmob} lines of forklifts, excavators and other mobile machinery (15% for the EU, Japan, Korea, Taiwan, the UK and "
        "a few others). Those lines skip the 2026 Section 301 duty. Engines, pumps, compressors, A/C units, filters, bearings and computers pay the **auto-parts duty** "
        "(25%, or 15% / 10% for deal partners) instead when they are car or truck parts.\n\n"
        f"China pays **Section 301** on {ncn} lines (25% on Lists 1–3, 7.5% on List 4A) on top of the 12.5% 2026 duty or Section 232; laptops and a few other lines are on no "
        f"list. Canada pays another **50%** under Section 338 on {n338} lines (commercial refrigeration, packaging, brewery and printing machinery, mobile cranes and more), even with USMCA. "
        "Antidumping and countervailing duties on engines, washers, bearings, lifts, cranes, outdoor power equipment and more are set company by company and are not in this "
        "table or the tariff calculator (see Tariff updates)."
    )

    ex = [
        ("China", "8471.30.01.00", "Free not a car or light-truck part / 25% car or light-truck part"),
        ("Japan", "8429.52.10.10", "15%"),
        ("China", "8429.52.10.10", "50%"),
        ("Mexico", "8450.11.00.40", "26.4%"),
        ("Canada", "8418.50.00.80", "60%"),
        ("Japan", "8479.50.00.00", "12.5%"),
        ("Japan", "8482.10.50.48", "12.5% not a vehicle part / 15% car or light-truck part / 34% truck or bus part"),
        ("Taiwan", "8471.50.01.50", "Free not a logic chip within the note thresholds, not a car or light-truck part / 15% not a logic chip within the note thresholds, car or light-truck part / 25% logic chip within the note thresholds"),
    ]
    for country, line, total in ex:
        assert line in LINE, line
        assert cell_of(country, line)["total"] == total, (country, line, cell_of(country, line)["total"])
    assert cell_of("Mexico", "8450.11.00.40", "withUsmca")["total"] == "25%"
    assert cell_of("Canada", "8418.50.00.80", "withUsmca")["total"] == "50%"
    assert cell_of("Germany", "8429.52.10.10")["total"] == "15%" and cell_of("Mexico", "8429.52.10.10")["total"] == "25%"
    o["workedExamples"] = [
        {
            "title": "Laptops from China (8471.30)",
            "line": "8471.30.01.00",
            "body": "Portable computers are **Free** under the general rate and were never on Section 301 Lists 1–4A. They are also on the note 52(b) list, so the 12.5% 2026 Section 301 duty "
            "on China does not apply (9903.05.86): **Free** from China, Vietnam, Taiwan, Thailand or anywhere else. Only if the importer declares the computer as an automobile part "
            "(heading 8471 is on the note 33(g) list) does the 25% auto-parts duty apply.",
        },
        {
            "title": "Hydraulic excavators from Japan, Germany, Mexico or China (8429.52)",
            "line": "8429.52.10.10",
            "body": "Excavators are Free at the base rate but are **mobile industrial equipment** under Section 232 (note 16(c)(xi)): **25%** of the full value (9903.82.09) from most countries, "
            "including Mexico and Brazil. Japan, the EU, Korea, Taiwan, the UK and a few others pay a **15% total** instead (9903.82.22) through December 31, 2027. A USMCA excavator from Mexico "
            "or Canada pays 25% only on its non-U.S. content (9903.82.20), and U.S. content up to 40% of the value is free. From China: 25% Section 232 + 25% Section 301 (List 1) = **50%**.",
        },
        {
            "title": "Top-loading washing machines from Mexico (8450.11)",
            "line": "8450.11.00.40",
            "body": "Base rate **1.4%** plus **25%** Section 232 (washers are derivative steel and aluminum articles, 9903.82.09), collected on the full value: **26.4%**. A USMCA claim removes the "
            "1.4% but not Section 232 (note 16(b)): **25%**. Large residential washers from Mexico (and China) are also under an antidumping order, so check the producer's cash-deposit rate.",
        },
        {
            "title": "Commercial display freezers from Canada (8418.50)",
            "line": "8418.50.00.80",
            "body": "Free at base, but 8418.50 is on the U.S. note 51(b)(3) list, so Canadian goods pay **+50%** under Section 338 (9903.03.14) **even with a USMCA claim**: **50%**. Without "
            "USMCA they also pay the 10% 2026 Section 301 duty on Canada (9903.05.29): **60%**.",
        },
        {
            "title": "Industrial robots from Japan (8479.50)",
            "line": "8479.50.00.00",
            "body": "Base rate **2.5%**. Under the U.S.-Japan rate in the 2026 Section 301 action (9903.05.49), Japanese goods pay a **12.5% total** in place of a lower base rate: **12.5%**. "
            "Industrial robots of 8479.50 are not on the Section 232 metals lists (handling robots of 8428.70 are, at the 15% equipment rate). Commerce's Section 232 investigation of robotics and industrial machinery (opened September 2, 2025) has not led to a tariff.",
        },
        {
            "title": "Ball bearings from Japan (8482.10)",
            "line": "8482.10.50.48",
            "body": "Base rate **9%**; Japan's 12.5% Section 301 total replaces it: **12.5%**. When the bearings are car or light-truck parts (note 33(g)) the Japan auto-parts rate applies "
            "instead: **15%** in place of the base rate (9903.94.43). As truck or bus parts (note 38) they pay 9% + 25% = **34%**.",
        },
        {
            "title": "AI server processing units from Taiwan (8471.50)",
            "line": "8471.50.01.50",
            "body": "Free at base and exempt from the 2026 Section 301 duty (note 52(b)). The **25%** Section 232 semiconductor duty (9903.79.01) applies only to units containing a logic chip "
            "within the note 39(b) performance and memory-bandwidth ranges, and even then not when imported for U.S. data centers, repairs, R&D, startups, consumer or civil industrial "
            "uses or the public sector (9903.79.03–9903.79.09). Everything else enters under 9903.79.02 at **Free**.",
        },
    ]
    o["notes"] = {
        "chapterNotes": (
            "**Section XVI notes (summary).** Parts of machines are classified with the machine they are made for, or in the parts headings 8409, 8431, 8448, 8466, 8473 and 8487, unless "
            "they are themselves goods of a Chapter 84 or 85 heading (note 2). Composite and multi-function machines are classified by their principal function (notes 3 and 4).\n\n"
            "**Note 1.** Chapter 84 excludes millstones (Chapter 68), ceramic pumps and parts (Chapter 69), laboratory glassware, articles of heading 7321 or 7322, vacuum cleaners (8508), "
            "electromechanical domestic appliances (8509), digital cameras (8525), radiators for vehicles and hand-operated floor sweepers.\n\n"
            "**Note 2.** A machine described both in headings 8401–8424 (or 8486) and in headings 8425–8480 goes in the first group.\n\n"
            "**Note 6.** \"Automatic data processing machines\" (8471) must store and freely run programs, perform user-specified arithmetic and modify execution by logical decision; units of "
            "a system go in 8471, but printers, communication apparatus, monitors and machines with a specific non-data-processing function do not.\n\n"
            "**Note 7.** Heading 8482 covers polished steel balls within 1% or 0.05 mm of their nominal diameter; other steel balls go in 7326.\n\n"
            "**Notes 10 and 11.** Additive manufacturing (3D printing) machines go only in 8485; semiconductor, integrated circuit and flat panel display manufacturing machines only in 8486."
        ),
        "additionalUsNotes": (
            "**1.** For 8479.89.65 and 8479.89.95, \"Free (C)\" (civil aircraft) applies only to listed aircraft articles such as nonelectric starter motors, servo-mechanisms, hydropneumatic "
            "accumulators, pneumatic starters for gas turbines, aircraft toilet units and thrust-reverser actuators.\n\n"
            "**2–4.** Subheadings 8443.99.20, 8443.99.30 and 8443.99.40 cover the listed assemblies (control, imaging, fixing, ink-jet, paper-handling and similar) of printer units, fax "
            "machines and photocopiers.\n\n"
            "**Statistical notes.** \"Industrial turbines\" in 8411.81.80.10 and 8411.82.80.10 are stationary gas turbines; wind turbine blades are counted individually; sucker rods of "
            "8413.91.90.31 include pony and polished rods for oil-well pumps."
        ),
    }

    # ------------------------------------------------------------ tariffUpdates
    S232 = ["procl-11021", "procl-11032", "fr-2026-08297", "csms-68253075", "hts-chapter-99", "hts-now"]
    tu["seo"] = {
        "title": "Machinery Tariff Updates 2025–2026: Section 232 Derivatives, Auto Parts, Section 301, Canada (HTS Ch. 84) | KoalaGains",
        "shortDescription": "Every U.S. tariff change on HTS Chapter 84 machinery since 2025, with Federal Register citations: Section 232 steel and aluminum derivatives (25%, 15% equipment "
        "rate), auto and truck parts, semiconductors, the 2026 Section 301 rates and computer exemptions, China lists, Section 338 on Canada, the end of IEEPA and the AD/CVD orders.",
        "keywords": [
            "machinery tariffs 2026",
            "section 232 machinery",
            "section 232 derivative list",
            "section 232 industrial machinery",
            "section 232 robotics industrial machinery",
            "hvac tariffs 2026",
            "agricultural equipment tariffs",
            "construction equipment tariffs",
            "auto parts tariff list",
        ],
    }
    tu["intro"] = (
        f"This page compares the **2025 Basic Edition** (in force January 1, 2025) with the current **2026 Revision 21** (in force October 9, 2026) and lists every extra duty that "
        f"reaches Chapter 84 today. No base rate changed; {NL - 1650} statistical lines are new or renumbered: parts split by copper content (pump, A/C, construction-machinery, bearing and gear parts), wind turbine blades, hubs and gearboxes, pressure washers by engine, hydrogen fuel-cell forklifts and others.\n\n"
        "The extra duties changed completely. In January 2025 most machinery paid only its base rate, plus Section 301 for China. In 2025 the IEEPA tariffs came and went "
        "(ended **February 24, 2026**), the auto-parts duty reached engines, pumps, compressors, bearings and other car parts (**May 3, 2025**), and Commerce added more "
        "than 150 Chapter 84 codes to the Section 232 steel and aluminum derivative lists (**August 18, 2025**, charged then on the metal content). Proclamation 11021 rebuilt "
        "Section 232 on **April 6, 2026**: duty on the **full customs value**, 25% for derivatives and a 15% floor for industrial equipment; Proclamation 11032 moved farm "
        "equipment and residential HVAC to the 15% rate and set a 25% rate (15% for deal partners) for forklifts and construction machinery on **June 8, 2026**. "
        "The **2026 Section 301** duties (July 24) add 10%–12.5% for 60 economies but spare computers and Section 232 goods; Canada pays Section 338 from August 22.\n\n"
        "Antidumping and countervailing duty orders cover engines, outdoor power equipment, aerial work platforms, cranes, washers, refrigerator racks, bearings and fluid end blocks. "
        "They are company-specific, summarized below by product, and **not included in the tariff calculator**."
    )
    tu["scope"] = (
        "Chapter 99 measures that reach Chapter 84 from any country: Section 232 steel, aluminum and copper derivatives (note 16) and Russian aluminum (note 19), the Section 232 "
        "automobile parts and medium- and heavy-duty vehicle parts duties (notes 33, 38) including the opt-in certified-parts elections, Section 232 semiconductors (note 39), "
        "China Section 301 (notes 20, 31), the 2026 Section 301 actions on 60 economies and Brazil (notes 50, 52), Canada Section 338 (note 51), Russia's rates in lieu of column 2 "
        "(note 30), the scheduled Nicaragua duty (note 29), and the ended IEEPA and Section 122 duties. The main antidumping and countervailing duty orders on Chapter 84 goods are "
        "summarized for reference; the calculator does not model them. For the rate each supplier pays, see Rates by country."
    )
    tu["stats"] = [
        {"label": "Base rates unchanged", "value": f"1650 of {NL} lines"},
        {"label": "Section 232 metals", "value": f"{n232} lines", "note": f"{n25} at 25%, {neq} at a 15% floor, {nmob} mobile equipment"},
        {"label": "Exempt from 2026 Section 301", "value": f"{n52b} lines", "note": "computers, computer parts, semiconductor equipment (note 52(b))"},
        {"label": "Compared", "value": "2025 Basic → Rev 21"},
    ]
    eu_like = "the EU, Japan, Korea, Switzerland, Liechtenstein, Taiwan, the UK, Argentina, Ecuador, El Salvador and Guatemala"
    tu["inEffect"] = [
        {
            "id": "all-section-232-25",
            "country": "All countries (Canada, Mexico, EU, Japan, Korea and Brazil included)",
            "measure": "Section 232 derivative steel and aluminum articles, on the full customs value",
            "ch99Code": "9903.82.09",
            "before": "None on most Chapter 84 goods until August 18, 2025; then 50% on the steel or aluminum content of the codes Commerce added",
            "now": "+25%",
            "exemption": f"Covers {n25} lines on note 16(c)(vi) (derivative aluminum) and (vii) (derivative steel): central heating boilers, turbine and engine parts, gas turbines of 8411.81, "
            "hydraulic cylinders and motors, other pumps of 8413.81, compressors, fans and range hoods, window and through-the-wall air conditioners (8415.10.30), condensing units "
            "and A/C parts, refrigerators, freezers and their parts, household dishwashers, jacks, tower and other cranes, lawn mowers, flexographic presses, washers and dryers, power "
            "tools, valve parts, ball and roller bearings, shafts, bearing housings, gears and gearboxes. Note 16(c): for goods outside Chapters 72–76 the duty applies only when the steel, aluminum and "
            "copper weigh at least 15% of the article (otherwise 9903.82.03); articles with no such metal enter under 9903.82.01. Note 16(b): collected on top of any FTA or USMCA rate. "
            "Lower rates: UK goods with UK-melted steel or UK-smelted aluminum 15% (9903.82.05); at least 85% U.S.-melted metal 10% (9903.82.06); parts used only to make "
            "agricultural or industrial equipment 15% (9903.82.25, note 16(k)); motorcycle parts for U.S. manufacture none (9903.82.13). Goods under these headings do not pay the 2026 Section 301 "
            "or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)).",
            "whatItMeans": "A $100,000 container of refrigerators, washers, compressors or ball bearings pays $25,000 plus the base rate, whatever the country or FTA claim.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232 + ["fr-2025-15819", "procl-10895", "procl-10896"],
        },
        {
            "id": "all-section-232-equipment",
            "country": "All countries except Belarus, Cuba, North Korea and Russia (25%)",
            "measure": "Section 232 fixed industrial, agricultural and HVAC equipment (temporary 15% rate)",
            "ch99Code": "9903.82.10 / 9903.82.11",
            "before": "+25% on the full value from April 6, 2026 for the agricultural and HVAC lines; 50% on metal content before",
            "now": "15% total (base rate + the difference); nothing extra when the base rate is 15% or more",
            "exemption": f"Covers {neq} lines on note 16(c)(ix) (HVAC parts of aluminum) and (x) (derivative steel): nuclear reactor parts, small engines of 8407.90.10, split-system and other residential "
            "A/C, heat pumps and dehumidifiers (8415.10.60/.90, 8415.81, 8415.82, 8415.90.80), industrial furnace parts, commercial cooking equipment (8419.81), filters, sprayers, "
            "conveyors, cable cars and handling robots (8428.32–.90), plows, harvesting machinery and combines (8432.10, 8433.20, 8433.51, 8433.59) and farm-machinery parts, casting machines, rolling mills, machining centers, parts of crushing and "
            "mixing machinery, plastics machinery, molds, and clutches, couplings and other gear parts. Proclamation 11021 set the "
            "15% rate from April 6, 2026; Proclamation 11032 added agricultural equipment and residential HVAC from June 8, 2026. It ends December 31, 2027, when these lines move "
            "to the 25% rate. Lower rate: 10% total with at least 85% U.S.-melted steel (9903.82.07 / .08). Belarus, Cuba and North Korea pay +25% (9903.82.12), Russia +25% (9903.82.17).",
            "whatItMeans": "A $100,000 combine, conveyor or injection-molding machine that is Free at base pays $15,000; one with a 3.5% base rate pays the same $15,000 in total.",
            "effectiveFrom": "2026-06-08",
            "effectiveSourceId": "procl-11032",
            "sourceIds": S232,
        },
        {
            "id": "all-section-232-mobile",
            "country": f"All countries; {eu_like} at 15%",
            "measure": "Section 232 mobile industrial equipment (forklifts, aerial lifts, construction machinery)",
            "ch99Code": "9903.82.09 / 9903.82.22 / 9903.82.20",
            "before": "+25% on the full value from April 6, 2026 (derivative steel list)",
            "now": "+25%; deal partners 15% total; USMCA goods 25% on the non-U.S. content",
            "exemption": f"Covers {nmob} lines on note 16(c)(xi): fork-lift and other works trucks (8427), bulldozers, graders, scrapers, road rollers, loaders, backhoes and excavators "
            f"(8429) and their parts of 8431.20, 8431.42 and 8431.49. Proclamation 11032 (June 8, 2026 to December 31, 2027): products of {eu_like} pay a 15% total in place of a lower "
            "base rate (9903.82.22); USMCA-eligible goods of Canada and Mexico pay 25% on the non-U.S. content (9903.82.20), with U.S. content up to 40% of the value duty-free "
            "(9903.82.21). At least 85% U.S.-melted steel: 10% (9903.82.06).",
            "whatItMeans": "A $200,000 excavator from Japan or Germany pays $30,000; from Mexico or Brazil $50,000; from China $100,000 (25% Section 232 + 25% Section 301).",
            "effectiveFrom": "2026-06-08",
            "effectiveSourceId": "procl-11032",
            "sourceIds": S232,
        },
        {
            "id": "auto-parts",
            "country": "All countries (EU, Japan, Korea, Taiwan 15%; UK 10%; USMCA parts exempt)",
            "measure": "Section 232 automobile parts and medium- and heavy-duty vehicle parts",
            "ch99Code": "9903.94.05 / 9903.74.08",
            "before": "None",
            "now": "+25% (deal partners 15% or 10% in place of the base rate)",
            "exemption": f"Reaches {nauto} lines on the note 33(g) list (engines of 8407.31–.34 and 8408.20, engine parts, fuel, oil and water pumps, A/C compressors and vehicle A/C, "
            f"oil and air filters, jacks, ball and roller bearings, crankshafts and every line of 8471) only when the goods are parts of passenger vehicles or light trucks, and {nmhdv} "
            "lines of note 38 when they are parts of medium- or heavy-duty trucks or buses (9903.74.08). Deal rates in place of the base rate: EU 15% (9903.94.53, from August 1, 2025), "
            "Japan 15% (9903.94.43, September 16, 2025), Korea 15% (9903.94.63, November 1, 2025), Taiwan 15% (9903.94.67, May 1, 2026), UK 10% on its listed lines (9903.94.32, "
            "June 30, 2025). USMCA-qualifying parts are exempt (9903.94.06, 9903.74.10). Parts paying these duties do not pay the metals duties or the 2026 Section 301 duty (note 52(f)(3), (6)).",
            "whatItMeans": "$10,000 of Thai diesel fuel-injection pumps (2.5% base) pays $2,750 as car or truck parts and $1,500 otherwise (2.5% + the 12.5% Section 301 duty).",
            "effectiveFrom": "2025-05-03",
            "effectiveSourceId": "procl-10908",
            "sourceIds": ["procl-10908", "procl-10925", "csms-64916652", "procl-10984", "csms-66665333", "fr-2025-12060", "fr-2025-18660", "fr-2025-17908", "fr-2025-21940", "fr-2026-10571",
                          "cbp-section-232-additional-faqs-autos", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "certified-parts",
            "country": "All countries (deal partners at their auto-parts rates)",
            "measure": "Section 232 certified automobile and truck parts (importer election)",
            "ch99Code": "9903.94.07 / 9903.74.09",
            "before": "None",
            "now": "+25% when the importer elects it (EU, Japan, Korea, Taiwan 15%; UK 10% on 9903.94.33)",
            "exemption": f"An opt-in: Proclamation 10984 lets the importer of record declare a part not already covered (any Chapter 84 line except the {NL - len(S['certified'])} already on the "
            "auto-parts lists) as subject to the auto-parts duty when it certifies the part will be used to produce or repair automobiles (9903.94.07, note 33(p)) or medium- and "
            "heavy-duty vehicles (9903.74.09, note 38(j)) in the United States. Importers do this to qualify for the Section 232 import adjustment offsets; electing replaces the metals "
            "and 2026 Section 301 duties. USMCA-qualifying parts stay exempt (9903.94.06, 9903.74.10). The rate grid prices the default answer (no election).",
            "whatItMeans": "A U.S. vehicle maker importing Chinese-made gears for its assembly line can choose to enter them as certified auto parts; otherwise they pay the regular rates shown.",
            "effectiveFrom": "2025-11-01",
            "effectiveSourceId": "procl-10984",
            "sourceIds": ["procl-10984", "csms-66665333", "cbp-section-232-additional-faqs-autos", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "semiconductors",
            "country": "All countries",
            "measure": "Section 232 semiconductors (advanced logic chips in computers)",
            "ch99Code": "9903.79.01",
            "before": "None",
            "now": "+25% (only within the note 39(b) chip thresholds)",
            "exemption": f"Reaches {nsemi} lines of 8471.50, 8471.80 and 8473.30 only when the unit is or contains a logic integrated circuit within the note 39(b) total-processing-performance "
            "and DRAM-bandwidth ranges; other goods enter under 9903.79.02 with no duty. Even qualifying chips are exempt when for U.S. data centers, repairs, R&D, startups, "
            "non-data-center consumer or civil industrial use, or the public sector (9903.79.03–9903.79.09). Collected also when a special rate is claimed; no 2026 Section 301 duty on top "
            "(note 52(f)(7)). Proclamation 11002 also covered semiconductor manufacturing equipment but put no duty on heading 8486.",
            "whatItMeans": "Ordinary servers, PCs and motherboards pay nothing extra; a GPU server with a covered AI chip, not for a U.S. data center or other exempt use, pays 25%.",
            "effectiveFrom": "2026-01-15",
            "effectiveSourceId": "procl-11002",
            "sourceIds": ["procl-11002", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s301-2026",
            "country": "60 Section 301 economies (Mexico, Canada, EU, Japan, Korea, Taiwan, Vietnam, Thailand, Malaysia, India, UK, Singapore, China, Brazil and others)",
            "measure": "Section 301 (2026 actions on 60 economies)",
            "ch99Code": "9903.05.20–9903.05.84",
            "before": "None",
            "now": "+10% or +12.5% (EU, Japan, Korea, Switzerland, Taiwan: 10% or 12.5% in place of a lower base rate)",
            "exemption": f"Reaches {NL - n52b} lines. Note 52(b) exempts {n52b} lines (9903.05.86): all of 8471 (computers and units), 8473.30 computer parts and 8486 semiconductor "
            "manufacturing equipment. Note 52(f) exempts goods paying Section 232 metals, auto-parts, truck-parts or semiconductor duties. Note 52(j)(1) exempts UK medical sterilizers "
            "(8419.20.00.10, 9903.05.96). Note 52(d) exempts civil aircraft engines and parts meeting general note 6 (9903.05.88, importer's confirmation). Note 52(e) (pharmaceutical "
            "applications) names no Chapter 84 code. USMCA goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94).",
            "whatItMeans": "$100,000 of Indian pumps pays $10,000; Vietnamese or Thai pumps $12,500; German pumps a 10% total; the same pumps from Mexico with a USMCA certificate pay nothing.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "cn-section-301",
            "country": "China",
            "measure": "Section 301: Lists 1–4A and the 2024 review (note 31)",
            "ch99Code": "9903.88.01 / 9903.88.02 / 9903.88.03 / 9903.88.15 / 9903.92.10",
            "before": "+25% (Lists 1–3) or +7.5% (List 4A)",
            "now": "+25% or +7.5%, on top of the 12.5% 2026 duty (9903.05.31) or Section 232",
            "exemption": f"List 1 (9903.88.01) covers {len(S['cn1'])} Chapter 84 lines, List 2 (9903.88.02) {len(S['cn2'])}, List 3 (9903.88.03) {len(S['cn3'])}, all at 25%, and List 4A "
            f"(9903.88.15) {len(S['cn4a'])} at 7.5%; {NL - ncn} lines are on no list (laptops 8471.30, 8471.60.20, sterilizers, cranes, some scales, power tools and washers). "
            "Note 31: ship-to-shore cranes of 8426.19 pay 25% since September 27, 2024 (9903.92.10, importer's confirmation). Exclusions in note 20(vvv) and (www) (9903.88.69, "
            f"9903.88.70) cover certain products in {len(S['cn_excl'])} lines, including pump and compressor parts, filters and solar-wafer and semiconductor equipment, until November 9, 2026. "
            "The 2026 Section 301 duty on China (12.5%) does not apply to computers, 8473.30 or 8486 (note 52(b)) or to Section 232 goods. USTR continued the 2018 actions on October 7, 2026.",
            "whatItMeans": "Chinese industrial valves pay 3% + 12.5% + 25% = 40.5%; Chinese excavators 50%; Chinese laptops nothing.",
            "effectiveFrom": "2024-09-27",
            "effectiveSourceId": "fr-2024-21217",
            "sourceIds": ["fr-2024-21217", "fr-2018-13248", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2025-21671", "fr-2026-20510",
                          "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "br-section-301",
            "country": "Brazil",
            "measure": "Section 301 (Brazil)",
            "ch99Code": "9903.05.01",
            "before": "None",
            "now": "+25% (plus 12.5% under 9903.05.27)",
            "exemption": f"Note 50(a)(ii) exempts {nbr} Chapter 84 lines (9903.05.03): computers (8471), computer parts (8473.30), semiconductor equipment (8486) and one 8422.40 machine; "
            "Section 232 goods are excluded (note 50(a)(vi)(1), 9903.05.07), and civil aircraft articles (9903.05.05).",
            "whatItMeans": "Brazilian pumps or valves pay base + 25% + 12.5%; Brazilian excavators pay only the 25% Section 232 duty.",
            "effectiveFrom": "2026-07-22",
            "effectiveSourceId": "fr-2026-14542",
            "sourceIds": ["fr-2026-14542", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ca-section-338",
            "country": "Canada",
            "measure": "Section 338 (Canada), list 51(b)(3)",
            "ch99Code": "9903.03.14",
            "before": "None",
            "now": f"+50% on {n338} lines",
            "exemption": "Charged even when USMCA is claimed. Covers hydraulic turbines (8410.11), turbochargers and superchargers (8414.80.05), refrigerated and freezer display "
            "cases, ice makers, water coolers and liquid chillers (8418.50, 8418.69), distilling plant and other heating or cooling machinery (8419.40, 8419.89), water-filter parts "
            "(8421.99), filling, labeling, wrapping and packaging machinery and parts (8422.30, 8422.40, 8422.90), sandblasting machines and pressure washers (8424.30), mobile cranes "
            "(8426.41), egg and produce graders (8433.60), brewery machinery (8438.40), bookbinding machinery (8440.10), printing plates (8442.50), printing machinery parts (8443.91.30) "
            "and mixing, kneading and grinding machines (8479.82). None of these lines pays Section 232 metals duty; Canadian civil aircraft articles are exempt (9903.03.16).",
            "whatItMeans": "A Canadian commercial display freezer or packaging line pays half its value in duty, with or without a USMCA certificate.",
            "effectiveFrom": "2026-08-22",
            "effectiveSourceId": "procl-11048",
            "sourceIds": ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ru-duties",
            "country": "Russia",
            "measure": "Column 2 rates, 35% in lieu of column 2, Section 232 and Russian aluminum",
            "ch99Code": "9903.90.08 / 9903.82.15–.17 / 9903.85.68",
            "before": "Column 2 rates (since April 9, 2022)",
            "now": f"Column 2 or 35% (on {len(S['ru35'])} lines) + Section 232 25% + 12.5% Section 301; 200% on {len(S['rual'])} derivative aluminum lines",
            "exemption": f"Products of Russia pay column 2 rates, and 35% in their place on the note 30(b) lines ({len(S['ru35'])} in Chapter 84: steam turbine parts, diesel engines, "
            "hydraulic and pneumatic motors, filters, printing machinery, rolling mills and many machine tools) since July 27, 2022 (Proclamation 10420). Russian derivative steel pays "
            "Section 232 under 9903.82.15–9903.82.17, and listed derivative aluminum articles pay 200% (9903.85.68, note 19).",
            "whatItMeans": "Russian machine tools pay 35% plus any Section 232 and Section 301 duties.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["procl-10420", "procl-10523", "procl-10895", "procl-10522", "procl-11021", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
    ]
    for e in tu["inEffect"]:
        assert e["effectiveSourceId"] in e["sourceIds"]
        for sid in e["sourceIds"]:
            assert sid in SRC, sid

    gen = {x["id"]: x for x in tu["changes"]}
    nic = next(x for x in tu["changes"] if x["id"].startswith("section-301-nicaragua"))
    mar = next(x for x in tu["changes"] if "maritime" in x["id"])
    s2028 = next(x for x in tu["changes"] if "scheduled-2028" in x["id"])
    C = lambda *a: ch(SRC, *a)  # noqa: E731
    changes = [
        C("base-rates", "baseRate", c["ASOF"], "Checked", "No Chapter 84 base-rate changes",
          f"1650 of {NL} Chapter 84 lines carry the same general rate in 2026 Revision 21 as in the 2025 Basic Edition; none changed. {NL - 1650} statistical lines are new or renumbered at "
          "unchanged rates, mostly parts split by copper content (pump, A/C, construction-machinery, bearing and gear parts), plus wind turbine blades, hubs and gearboxes, top-freezer refrigerators, gasoline pressure washers, hydrogen fuel-cell forklifts, grinding machines and biological sample preparation machines.",
          None, None, None, ["hts-before", "hts-now", "hts-now-cr"]),
        C(s2028["id"], "pending", "2026-04-09", "Published", "Equipment rate scheduled to rise to 25% on January 1, 2028",
          f"Proclamation 11021 sets the temporary 15% rate on the {neq} industrial, agricultural and residential HVAC equipment lines (9903.82.10) through December 31, 2027; from "
          "January 1, 2028 they pay the standard 25% derivative rate (9903.82.09), or 15% for UK goods with UK-melted steel and 10% with U.S.-melted steel.",
          "15% total", "+25%", "All", ["procl-11021", "procl-11032", "hts-chapter-99"]),
        C(nic["id"], "pending", "2025-12-29", "Published", "Section 301 tariff on Nicaragua phases in from 2027",
          "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). The rate is 0% in 2026.",
          None, "+10% to +15%", "Nicaragua", nic["sourceIds"]),
        C(mar["id"], "pending", "2025-11-13", "Published", "100% Section 301 duty on Chinese ship-to-shore cranes resumes November 10, 2026",
          "USTR's maritime Section 301 action puts +100% on ship-to-shore gantry cranes of 8426.19 from China (and cranes with Chinese components or makers) under 9903.91.14, on top of the 25% of "
          "9903.92.10. It was suspended from November 10, 2025 through November 9, 2026.",
          "+25%", "+125%", "China", mar["sourceIds"]),
        C("cn-exclusions", "pending", "2025-12-01", "Published", "China Section 301 exclusions run out November 9, 2026",
          f"USTR extended the 178 remaining product exclusions (9903.88.69, 9903.88.70) through November 9, 2026. In Chapter 84 they cover certain products in {len(S['cn_excl'])} lines: "
          "pump, compressor and valve parts, filters, sprayers, hoists, agricultural machinery parts, sewing machines and solar-wafer and semiconductor manufacturing equipment.",
          "Excluded", "+25% unless extended", "China", ["fr-2025-21671", "fr-2026-20510"]),
        C("cn-301-continued", "reference", "2026-10-07", "Published", "USTR: China Section 301 actions continue",
          "USTR published notice that the 2018–2019 Section 301 actions on China (Lists 1–4A) continue while the statutory review proceeds.",
          None, None, "China", ["fr-2026-20510"]),
        C("ca-338", "extraDuty", "2026-08-22", "Effective", "Section 338 duty on Canadian goods: 50% on 56 machinery lines",
          f"Proclamation 11048 imposed 50% (9903.03.14) on Canadian products in the note 51(b)(3) list, including {n338} Chapter 84 lines (hydraulic turbines, turbochargers, refrigerated display "
          "cases, ice makers and chillers, packaging machinery, pressure washers, mobile cranes, brewery machinery, printing plates, mixing machines), effective August 22, 2026 after Proclamation 11056's three-day suspension. USMCA does not "
          "exempt it. Proclamation 11065 narrowed the list and made the duty stack with Section 232 from September 15, 2026; no Chapter 84 line on the list pays Section 232.",
          None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916"]),
        C("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies; computers exempt",
          f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. In Chapter 84 they reach {NL - n52b} lines; computers, 8473.30 parts and semiconductor equipment "
          "are on the note 52(b) exemption list, and goods paying Section 232 metals, auto-parts or semiconductor duties are excluded (note 52(f)). EU, Japanese, Korean, Swiss and Taiwanese goods "
          "pay a 10% or 12.5% total in place of a lower base rate. USMCA goods are exempt.",
          None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
        C("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
          "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It never applied to goods subject to Section 232 duties (Proclamation 11012); "
          "USMCA goods were exempt.",
          "+10%", None, "All", ["procl-11012", "hts-chapter-99"]),
        C("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil",
          f"The 25% duty on goods of Brazil (9903.05.01) took effect. Computers, 8473.30 parts and semiconductor equipment ({nbr} Chapter 84 lines) are exempt under note 50(a)(ii), and "
          "Section 232 goods under note 50(a)(vi)(1).",
          None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
        C("aircraft-232", "reference", "2026-07-09", "Signed", "Section 232 on aircraft and jet engines: no tariff imposed",
          "Proclamation 11040 found that imports of commercial aircraft, jet engines and aircraft and engine parts (8411 turbojets, turboprops and their parts among them) threaten national "
          "security but imposed no tariff; it directs negotiations, with an update to the President due by January 5, 2027.",
          None, "No duty", "All", ["procl-11040"]),
        C("procl-11032", "extraDuty", "2026-06-08", "Effective", "Farm equipment and residential HVAC to 15%; mobile machinery 25% (15% for deal partners)",
          "Proclamation 11032 moved agricultural equipment and residential HVAC systems and components into the temporary 15% equipment rate (9903.82.10), set a 25% rate through 2027 for "
          f"mobile industrial equipment such as forklifts and excavators ({nmob} lines), with a 15% total for {eu_like} (9903.82.22) and a U.S.-content rule for USMCA goods (9903.82.20/.21), "
          "added a 15% rate for parts used to manufacture such equipment in the United States (9903.82.25, note 16(k)), and lowered the U.S.-melted test to 85%.",
          "+25%", "15% or 25%", "All", ["procl-11032", "hts-chapter-99"]),
        C("tw-auto-parts", "reference", "2026-05-01", "Effective", "Taiwan auto-parts rate of 15%",
          "Under the U.S.-Taiwan agreement, Taiwanese automobile parts pay 15% in place of the base rate (9903.94.67), which covers the Chapter 84 auto-parts lines (engines, pumps, compressors, "
          "filters, bearings, computers) when used as car parts.",
          "+25%", "15% (in place of base)", "Taiwan", ["fr-2026-10571"]),
        C("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 rebuilt on full value: 25%, or a 15% floor for industrial equipment (Proclamation 11021)",
          f"Proclamation 11021 replaced the earlier derivative headings with 9903.82.02–9903.82.26, charged on the full customs value. In Chapter 84, derivative steel and aluminum articles "
          "pay 25% (9903.82.09) and fixed industrial machinery and power equipment a 15% total (9903.82.10) through 2027; goods outside Chapters 72–76 pay only if the metal is at least 15% of "
          "their weight. Lower rates: UK 15%, U.S.-melted 10%. Drawback is allowed only for listed goods of trade-agreement partners; goods admitted to a foreign-trade zone must take privileged "
          "foreign status.",
          "+50% (metal content)", "+25% or 15% total (full value)", "All", ["procl-11021", "fr-2026-08297", "csms-68253075", "hts-chapter-99"]),
        C("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
          "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026, except to Section 232 goods and USMCA goods.",
          None, "+10%", "All", ["procl-11012", "csms-67844987"]),
        C("ieepa-end", "extraDuty", "2026-02-24", "Ended", "All IEEPA tariffs end",
          "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and "
          "reciprocal duties, and CBP stopped collecting them on February 24, 2026. Section 232 and Section 301 duties are not IEEPA duties and continued.",
          "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
        C("semiconductors", "extraDuty", "2026-01-15", "Effective", "Section 232 duty on advanced semiconductors",
          f"Proclamation 11002 imposed 25% (9903.79.01) on certain advanced logic chips, which in Chapter 84 reaches {nsemi} lines of 8471.50, 8471.80 and 8473.30 when the unit contains a chip "
          "within the note 39(b) thresholds, with broad end-use exemptions. Semiconductor manufacturing equipment got no duty.",
          None, "+25% (covered chips)", "All", ["procl-11002"]),
        C("mhdv-parts", "extraDuty", "2025-11-01", "Effective", "Section 232 on truck and bus parts; certified-parts election",
          f"Proclamation 10984 imposed 25% on medium- and heavy-duty vehicle parts (9903.74.08), which reaches {nmhdv} Chapter 84 lines (truck engines, pumps, compressors, filters, bearings) when "
          "used as such, and let importers certify other parts for U.S. vehicle production or repair into the auto- or truck-parts duty (9903.94.07, 9903.74.09). Korean auto parts moved to 15% the same day.",
          None, "+25%", "All", ["procl-10984", "csms-66665333", "fr-2025-21940"]),
        C("robotics-232", "pending", "2025-09-26", "Published", "Section 232 investigation of robotics and industrial machinery",
          "Commerce opened a Section 232 national-security investigation of imports of robotics and industrial machinery on September 2, 2025 and requested comments by October 17, 2025. "
          "No proclamation has followed as of October 13, 2026; industrial robots (8479.50) and most machine tools are not on the Section 232 lists.",
          None, "Investigation", "All", ["fr-2025-18749"]),
        C("jp-eu-auto", "reference", "2025-09-16", "Effective", "Japan and EU auto-parts rates of 15%",
          "Japanese automobile parts pay 15% in place of the base rate (9903.94.43) from September 16, 2025; EU parts (9903.94.53) from August 1, 2025.",
          "+25%", "15% (in place of base)", "Japan, EU", ["fr-2025-17908", "fr-2025-18660"]),
        C("inclusions-2025-08", "extraDuty", "2025-08-18", "Effective", "Commerce adds Chapter 84 machinery to the Section 232 derivative lists",
          "BIS added 407 HTS codes to the steel and aluminum derivative lists, including more than 150 Chapter 84 codes: engine and turbine parts, hydraulic cylinders, pumps, compressors, A/C units "
          "and parts, refrigerators, dryers, sprayers, cranes, forklifts, conveyors, excavators and loaders, farm machinery, washers, power tools, molds, ball and roller bearings, gears and "
          "gearboxes. The 50% duty applied to the steel and aluminum content; the rest paid the reciprocal and other duties.",
          None, "+50% on metal content", "All", ["fr-2025-15819"]),
        C("uk-auto", "reference", "2025-06-30", "Effective", "UK auto-parts rate of 10%",
          "UK automobile parts on the note 33(j) list pay 10% in place of the base rate (9903.94.32), including Chapter 84 engines, pumps, compressors, filters and bearings when used as car parts.",
          "+25%", "10% (in place of base)", "United Kingdom", ["fr-2025-12060"]),
        C("auto-parts", "extraDuty", "2025-05-03", "Effective", "Section 232 on automobile parts",
          f"Proclamation 10908 imposed 25% on automobile parts (9903.94.05), including {nauto} Chapter 84 lines (engines, engine parts, pumps, compressors, A/C units, filters, jacks, bearings, "
          "crankshafts and computers) when they are passenger-vehicle or light-truck parts. USMCA-qualifying parts were exempt.",
          None, "+25%", "All", ["procl-10908", "procl-10925", "csms-64916652"]),
        C("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariffs (IEEPA) on most machinery",
          "Executive Order 14257 set the reciprocal tariffs from April 5, 2025; they applied to most Chapter 84 goods (Section 232 goods excluded) until they ended on February 24, 2026.",
          None, "+10% and up (ended)", "All except Canada, Mexico", ["eo-14257"]),
        C("s232-derivatives-2025", "reference", "2025-03-12", "Effective", "Section 232 steel and aluminum exemptions end",
          "Proclamations 10895 and 10896 ended all country exemptions and quotas for Section 232 steel and aluminum from March 12, 2025 and set up the derivative inclusions process "
          "that later brought Chapter 84 machinery onto the lists.",
          None, None, "All", ["procl-10895", "procl-10896"]),
        C("ca-mx-ieepa", "reference", "2025-03-04", "Effective", "IEEPA duties on Canada and Mexico",
          "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods exempt from March 7, 2025. Ended February 24, 2026.",
          None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
        C("cn-301-2024", "extraDuty", "2024-09-27", "Effective", "China Section 301 review: 25% on ship-to-shore cranes",
          "After its four-year review USTR added 25% on ship-to-shore cranes from China (9903.92.10, note 31). Other Chapter 84 goods stayed on their 2018–2019 lists.",
          None, "+25%", "China", ["fr-2024-21217"]),
        C("washers-201", "reference", "2023-02-07", "Expired", "Washer safeguard (Section 201) ended",
          "The Section 201 safeguard tariff-rate quotas on large residential washers and parts (9903.45.01–9903.45.06, U.S. note 17) expired at the close of February 7, 2023. "
          "The antidumping orders on washers from China and Mexico continue.",
          "14% within quota, 30% over (final year)", None, "All", ["hts-chapter-99"]),
        C("cn-list4a", "extraDuty", "2020-02-14", "Effective", "China Section 301 List 4A cut to 7.5%",
          f"List 4A (9903.88.15), 15% since September 1, 2019, was halved to 7.5% from February 14, 2020; it covers {len(S['cn4a'])} Chapter 84 lines.",
          "+15%", "+7.5%", "China", ["fr-2019-17865", "fr-2020-00904"]),
        C("cn-list3", "extraDuty", "2019-05-10", "Effective", "China Section 301 List 3 raised to 25%",
          f"List 3 (9903.88.03), 10% since September 24, 2018, rose to 25% from May 10, 2019; it covers {len(S['cn3'])} Chapter 84 lines.",
          "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
        C("cn-list1-2", "extraDuty", "2018-07-06", "Effective", "China Section 301 Lists 1 and 2",
          f"List 1 (9903.88.01, from July 6, 2018) and List 2 (9903.88.02, from August 23, 2018) put 25% on {len(S['cn1'])} and {len(S['cn2'])} Chapter 84 lines, mostly industrial machinery, "
          "engines, turbines, pumps, machine tools and bearings.",
          None, "+25%", "China", ["fr-2018-13248", "fr-2018-17709"]),
    ]
    changes += [C(x["id"], x["type"], x["date"], x["label"], x["title"], x["detail"], x["before"], x["now"], x["countries"], x["ids"]) for x in c["ADCVD_CHANGES"]]
    changes.sort(key=lambda x: x["date"], reverse=True)
    ids = [x["id"] for x in changes]
    assert len(ids) == len(set(ids)), ids
    tu["changes"] = changes

    used = set()
    for e in tu["inEffect"]:
        used.update(e["sourceIds"])
    for x in tu["changes"]:
        used.update(x["sourceIds"])
    used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch84"])
    tu["sources"] = sorted([copy.deepcopy(SRC[i]) for i in used], key=lambda s: (s["published"], s["id"]), reverse=True)
