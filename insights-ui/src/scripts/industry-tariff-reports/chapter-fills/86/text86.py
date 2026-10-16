"""Writer text for Chapter 86. apply_text(ctx) fills every page of the generated file in place."""
import copy

from groups86 import G

TITLE = "Railway Locomotives, Rolling Stock, Track Fixtures & Containers"


def apply_text(c):
    d, SRC = c["d"], c["SRC"]
    o, tu, ia = d["overview"], d["tariffUpdates"], d["industryAreas"]
    LINE, ROW = c["LINE"], c["ROW"]
    ASOF = c["ASOF"]
    n232, nnon = len(c["S232"]), len(c["NON232"])
    nl = len(LINE)

    def cell_of(country, line, side="withoutUsmca"):
        for cell in ROW[country]["cells"].values():
            for bb in cell[side]["breakdown"]:
                if line in bb["lines"]:
                    return bb
        raise KeyError((country, line))

    c["cell_of"] = cell_of

    # ------------------------------------------------------------ groups
    for pg in o["productGroups"]:
        label, short, blurb, ex = G[pg["heading"]]
        pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
    for g in ia["groups"]:
        g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

    # ------------------------------------------------------------ overview
    o["h1"] = f"HTS Chapter 86: {TITLE} — Tariff Rates"
    o["seo"] = {
        "title": "HTS Chapter 86 Tariffs: Locomotives, Railcars, Rail Parts & Shipping Containers (Section 232 25%) | KoalaGains",
        "shortDescription": f"Searchable U.S. duty table for all {nl} HTS Chapter 86 lines: locomotives, passenger and freight railcars, rail parts (wheels, axles, brakes, couplers), "
        "track fixtures, signaling equipment and shipping containers (8609). 23 lines pay 25% Section 232 from every country; China adds 25%; couplers carry AD/CVD.",
        "keywords": [
            "HTS Chapter 86",
            "chapter 86 hts",
            "railcar tariffs",
            "tariffs on rail cars",
            "locomotive hs code",
            "railway parts hs code",
            "hs code 8607",
            "hs code 8609",
            "shipping container tariff code",
            "section 232 tariffs railcars",
            "freight rail couplers",
        ],
    }
    cn_lists = 0
    for cell in ROW["China"]["cells"].values():
        for bb in cell["withoutUsmca"]["breakdown"]:
            if any(k in bb["extra"] for k in ("9903.88.01", "9903.88.02", "9903.88.03")):
                cn_lists += bb["lineCount"]
    assert cn_lists == 35, cn_lists
    o["stats"][2]["note"] = (
        f"Section 232 at 25% (9903.82.09, all countries): {n232}; outside Section 232: {nnon} (they pay the 2026 Section 301 duty for most of the 60 economies, unless USMCA or another exemption applies). "
        f"China Section 301 (Lists 1–3): {cn_lists}; Russia 35% in lieu of column 2: 2"
    )
    ndut = int(o["stats"][1]["value"].split(" of ")[0])
    o["intro"] = (
        "Chapter 86 covers railway and tramway equipment: electric, battery and diesel locomotives (8601–8602), self-propelled rail cars (8603), track maintenance vehicles (8604), "
        "passenger coaches (8605), freight cars (8606), parts such as trucks, wheels, axles, brakes and couplers (8607), track fixtures and mechanical signaling equipment (8608), "
        f"and shipping and intermodal containers (8609). **{nl - ndut} of the {nl} lines are Free** under the general rate; the rest pay 0.4% to 14% (railcars and coaches 14%), and USMCA "
        "and most other FTAs make them Free.\n\n"
        f"What decides the cost is **Section 232**. **{n232} lines pay +25% of the full customs value** (heading 9903.82.09, U.S. note 16(c)(vii)) from every country, on top of any FTA or USMCA rate: "
        "all locomotives, self-propelled cars, service vehicles and passenger coaches, tank cars, most parts (wheels, axles, couplers, locomotive parts) and containers. "
        "Lower rates: **15%** for UK goods of at least 95% UK-melted steel and **10%** for goods whose steel is at least 85% U.S.-melted. "
        f"The other **{nnon} lines** (hopper, box, gondola and flat cars, bolsters and side frames, freight-car brakes and some other parts, and 8608 track and signaling equipment) are outside Section 232 "
        "and pay the 2026 Section 301 duty (10% or 12.5%, or 10% to 12.5% in place of the base rate for the EU, Japan, Korea and Switzerland) unless they qualify for USMCA.\n\n"
        "China pays another **25%** under Section 301 on almost every line (containers excepted), and freight rail couplers from China and Mexico carry **antidumping and countervailing duties** "
        "that also reach couplers fitted to imported railcars; they are not part of this table or the tariff calculator (see Tariff updates)."
    )
    ex = [
        ("Mexico", "8606.92.00.00", "24%", "Free"),
        ("Mexico", "8606.10.00.00", "39%", "25%"),
        ("China", "8609.00.00.00", "25%", None),
        ("China", "8607.30.10.10", "53.6%", None),
        ("Japan", "8607.19.90.00", "25%", None),
        ("Germany", "8608.00.00.00", "10%", None),
    ]
    for country, line, total, usm in ex:
        assert line in LINE, line
        assert cell_of(country, line)["total"] == total, (country, line, cell_of(country, line)["total"])
        if usm:
            assert cell_of(country, line, "withUsmca")["total"] == usm, (country, line)
    o["workedExamples"] = [
        {
            "title": "Open-top hopper or gondola cars from Mexico",
            "line": "8606.92.00.00",
            "body": "Open freight cars carry a **14%** base rate, but they are **Free** under USMCA and not on the Section 232 lists, so a USMCA-qualifying car pays **nothing**. Without a USMCA claim "
            "it pays 14% plus the **10%** 2026 Section 301 duty on Mexico (9903.05.55): **24%**. A duty-free freight car can be released without a formal entry under a CBP bond (19 CFR 141.4(b)(4)). "
            "Couplers on the car that were cast in China or Mexico are still subject to the coupler AD/CVD orders.",
        },
        {
            "title": "Railway tank cars from Mexico",
            "line": "8606.10.00.00",
            "body": "Tank cars are the one freight car on the Section 232 list: **+25%** of the full value (9903.82.09) even with USMCA (note 16(b)), so a USMCA tank car pays **25%** and a "
            "non-qualifying one **39%** (14% + 25%). A $150,000 car owes $37,500. An antidumping and countervailing duty petition on Mexican tank cars was filed on September 30, 2026.",
        },
        {
            "title": "Shipping containers from China",
            "line": "8609.00.00.00",
            "body": "Containers are **Free** at base and on none of the China Section 301 lists, but they are Section 232 derivatives: **+25%** (9903.82.09), so **25%** in total; the 2026 Section 301 "
            "duty on China does not apply to Section 232 goods. USTR proposed 20% to 100% on Chinese containers in April 2025 but dropped it in October 2025. A container that arrives "
            "in use in international traffic is released without entry or duty (19 CFR 10.41a).",
        },
        {
            "title": "Assembled freight rail couplers from China",
            "line": "8607.30.10.10",
            "body": "Base rate **3.6%**, plus **+25%** Section 232 (9903.82.09) and **+25%** Section 301 (List 2, 9903.88.02): **53.6%**. On top of that come the antidumping cash deposit "
            "(139.49%) and the countervailing duty (265.99%), so Chinese couplers cost more than four times their value in duty.",
        },
        {
            "title": "Wheel sets and axles from Japan",
            "line": "8607.19.90.00",
            "body": "Other parts of axles and wheels pay **2.6%**, Free under the U.S.-Japan Trade Agreement (JP), but **+25%** Section 232 applies on top: **25%**. If at least 85% of the steel was melted "
            "and poured in the United States, the importer can enter them under **9903.82.06 at +10%**.",
        },
        {
            "title": "Mechanical signaling equipment from Germany",
            "line": "8608.00.00.00",
            "body": "Heading 8608 is not on the Section 232 lists. The EU rate under the 2026 Section 301 action is **10% in place of** the 3.8% base rate (9903.05.39): **10%**. "
            "Electrical signaling equipment is heading 8530, not Chapter 86.",
        },
    ]
    o["notes"] = {
        "chapterNotes": (
            "**Note 1.** This chapter does not cover: (a) railway or tramway sleepers (cross-ties) of wood or of concrete, or concrete guide-track sections for hovertrains (heading 4406 or 6810); "
            "(b) railway or tramway track construction material of iron or steel of heading 7302; or (c) electrical signaling, safety or traffic control equipment of heading 8530.\n\n"
            "**Note 2.** Heading 8607 applies, inter alia, to: (a) axles, wheels, wheel sets (running gear), metal tires, hoops and hubs and other parts of wheels; (b) frames, underframes, truck assemblies; "
            "(c) axle boxes; brake gear; (d) buffers for rolling-stock; hooks and other coupling gear and corridor connections; (e) coachwork.\n\n"
            "**Note 3.** Subject to note 1, heading 8608 applies, inter alia, to: (a) assembled track, turntables, platform buffers, loading gauges; (b) semaphores, mechanical signal discs, level crossing "
            "control gear, signal and point controls, and other mechanical (including electro-mechanical) signaling, safety or traffic control equipment, whether or not fitted for electric lighting, "
            "for railways, tramways, roads, inland waterways, parking facilities, port installations or airfields.\n\n"
            "**Section XVII notes (summary).** Parts of general use of base metal, machines of 8401–8479, electrical equipment of chapter 85 and instruments of chapter 90 are not \"parts\" of rail "
            "vehicles; vehicles built to run on both road and rail are classified in chapter 87; and hovertrain track fixtures and signaling are classified with railway track fixtures and signaling."
        ),
        "additionalUsNotes": (
            "**1.** Railway locomotives (headings 8601 and 8602) and railway freight cars (heading 8606) on which no duty is owed are not subject to the entry or release requirements of sections 448 "
            "and 484 of the Tariff Act of 1930. The Secretary of the Treasury may by regulation establish reporting requirements, including a bond (see 19 CFR 141.4(b)(4) and (d))."
        ),
    }

    # ------------------------------------------------------------ tariffUpdates
    S232 = ["procl-11021", "fr-2026-08297", "procl-11032", "csms-68253075", "hts-chapter-99", "hts-now"]
    tu["h1"] = f"HTS Chapter 86: {TITLE} — Tariff Updates"
    tu["seo"] = {
        "title": "Railcar, Locomotive & Container Tariff Updates 2025–2026: Section 232 25%, China 301, Coupler AD/CVD (HTS Ch. 86) | KoalaGains",
        "shortDescription": "Every U.S. tariff change on HTS Chapter 86 rail equipment and containers since 2025, with Federal Register citations: Section 232 on locomotives, railcars, parts and containers "
        "(August 2025, full value from April 6, 2026), the 2026 Section 301 duties, the end of IEEPA, the dropped container tariff, and AD/CVD on freight rail couplers and tank cars.",
        "keywords": [
            "railcar tariffs",
            "section 232 tariffs railcars",
            "steel derivative tariff",
            "steel derivatives list",
            "shipping containers tariffs",
            "freight rail couplers",
            "certain freight rail couplers",
            "tank car tariffs",
        ],
    }
    tu["intro"] = (
        "This page compares the **2025 Basic Edition** (in force January 1, 2025) with the current **2026 Revision 21** (in force October 9, 2026) and lists every extra duty that reaches "
        "Chapter 86 today. No base rate changed; three statistical lines now split freight rail couplers (8607.30.10) into assembled couplers, coupler parts and other.\n\n"
        "The extra duties changed completely. Chapter 86 had no Section 232 duty until **August 18, 2025**, when Commerce's first inclusions round added 22 locomotive, railcar, parts and "
        "container provisions as derivative steel articles at 50% of their steel content. Proclamation 11021 rebuilt the program on **April 6, 2026**: **25% of the full customs value**, "
        "with tank cars (8606.10) added. The IEEPA duties ended on **February 24, 2026**, the Section 122 surcharge expired on **July 23, 2026**, and the 2026 Section 301 duties leave Section 232 "
        "goods alone, so they reach only the 14 lines outside Section 232. China's 2018 Section 301 duties stack on top.\n\n"
        "Antidumping and countervailing duty orders cover freight rail couplers from China and Mexico (also when fitted to railcars), investigations on Czech and Indian couplers are at the "
        "final stage, and a petition on Mexican tank cars was filed in September 2026. They are company-specific and **not included in the tariff calculator**."
    )
    tu["scope"] = (
        "Chapter 99 measures that reach Chapter 86 from any country: Section 232 derivative steel articles (note 16), China Section 301 (note 20, Lists 1–3), the 2026 Section 301 actions on "
        "60 economies and Brazil (notes 50, 52), Russia's rates in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. "
        "No Canada Section 338 list (note 51), China note 31 heading or Section 232 vehicle-parts heading reaches Chapter 86. The AD/CVD orders and investigations on Chapter 86 products are "
        "summarized for reference; the calculator does not model them. For the rate each supplier pays, see Rates by country."
    )
    tu["stats"] = [
        {"label": "Base rates unchanged", "value": f"{nl - 3} of {nl} lines"},
        {"label": "Section 232 at 25%", "value": f"{n232} lines"},
        {"label": "Outside Section 232", "value": f"{nnon} lines"},
        {"label": "Compared", "value": "2025 Basic → Rev 21"},
    ]
    tu["inEffect"] = [
        {
            "id": "all-section-232-25",
            "country": "All countries (Canada, Mexico, EU, Japan, Korea and Brazil included); Russia under 9903.82.16, also 25%",
            "measure": "Section 232 derivative steel articles, on the full customs value",
            "ch99Code": "9903.82.09",
            "before": "None until August 18, 2025; then +50% on the steel content (9903.81.91) for 22 provisions; tank cars none",
            "now": "+25%",
            "exemption": f"Covers {n232} lines on note 16(c)(vii): locomotives (8601, 8602), self-propelled cars (8603), service vehicles (8604), passenger coaches (8605), tank cars (8606.10), "
            "truck assemblies for self-propelled vehicles (8607.11), axles, wheels and their parts (8607.19.03–.15, .90), air brakes other than for 8605/8606 cars (8607.21.50), couplers and buffers "
            "(8607.30), locomotive parts (8607.91), other parts (8607.99.50) and containers (8609). Not covered: 8606.30–8606.99, 8607.12, 8607.19.30, 8607.21.10, 8607.29, 8607.99.10 and 8608. "
            "No country exemptions; note 16(b) collects it on top of any FTA or USMCA rate. Lower rates: UK goods with ≥95% UK-melted steel 15% (9903.82.05); ≥85% U.S.-melted steel 10% "
            "(9903.82.06). Goods under 9903.82.09 do not pay the 2026 Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)).",
            "whatItMeans": "A $3 million locomotive, a $150,000 tank car or a $5,000 container pays a quarter of its value in duty, whatever the FTA claim.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232 + ["fr-2025-15819", "procl-10947"],
        },
        {
            "id": "gb-section-232",
            "country": "United Kingdom",
            "measure": "Section 232 derivatives, UK rate",
            "ch99Code": "9903.82.05",
            "before": "+25% on the steel content from August 18, 2025",
            "now": "+15% with ≥95% UK-melted steel; otherwise +25%",
            "exemption": "Note 16(d): only when at least 95% of the steel was melted and poured in the United Kingdom (Tata Steel UK steel melted in the Netherlands counts until January 1, 2028, 91 FR 23056). "
            "UK goods without the 95% proof pay the standard 25%.",
            "whatItMeans": "A UK-built coach or bogie made of UK-melted steel pays 15% instead of 25%.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": ["procl-11021", "fr-2026-08297", "eo-14309", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "us-melted-232",
            "country": "All countries",
            "measure": "Section 232 rate for derivatives made of U.S.-melted steel",
            "ch99Code": "9903.82.06",
            "before": "Exempt when the steel was melted and poured in the United States (until April 5, 2026)",
            "now": "+10%",
            "exemption": "Note 16(e): derivative articles in which at least 85% of the steel content (by weight) was melted and poured in the United States (Proclamation 11032, from June 8, 2026; "
            "Proclamation 11021 had required all of it). Russia uses 9903.82.15.",
            "whatItMeans": "Wheels, axles or railcars made abroad from U.S. steel pay 10% instead of 25%; the melt country must be documented.",
            "effectiveFrom": "2026-06-08",
            "effectiveSourceId": "procl-11032",
            "sourceIds": ["procl-11032", "procl-11021", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "cn-section-301",
            "country": "China",
            "measure": "Section 301: Lists 1, 2 and 3, plus the 2026 action on the lines outside Section 232",
            "ch99Code": "9903.88.01 / 9903.88.02 / 9903.88.03 / 9903.05.31",
            "before": "+25% (Lists 1, 2 and 3)",
            "now": "+25% on top of Section 232 (50% on most lines); +37.5% on the lines outside Section 232",
            "exemption": "List 1 (9903.88.01) covers 8601.10, 8603, 8604, 8607.12, most of 8607.19, 8607.21, 8607.29, 8607.91, 8607.99 and 8608; List 2 (9903.88.02) 8601.20, 8602.10, 8605, "
            "all of 8606, 8607.11, 8607.19.03, 8607.19.30 and 8607.30; List 3 (9903.88.03) 8602.90. Containers (8609) are on no list. The 12.5% 2026 Section 301 duty on China (9903.05.31) "
            "applies only to the 14 lines outside Section 232. One granted exclusion, for air brakes for freight and passenger cars (8607.21.10.00), runs until November 9, 2026 (9903.88.69). "
            "The IEEPA duties on China ended February 24, 2026; USTR confirmed on October 7, 2026 that the 2018 actions continue.",
            "whatItMeans": "Chinese locomotives, coaches, wheels and couplers pay about 50% or more of their value; Chinese hopper cars 51.5%; Chinese containers 25%.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2018-13248", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2025-21671", "fr-2026-20510", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s301-2026",
            "country": "60 Section 301 economies (Canada, Mexico, EU, Japan, Korea, Switzerland, UK, India, Russia and others)",
            "measure": "Section 301 (2026 actions on 60 economies)",
            "ch99Code": "9903.05.20–9903.05.84",
            "before": "None",
            "now": f"+10% or +12.5% (EU 10%, Japan, Korea and Switzerland 12.5%, in place of the base rate when lower) on the {nnon} lines outside Section 232",
            "exemption": "Does not apply to Section 232 goods (note 52(f)(1), 9903.05.90), so it reaches only hopper, box, gondola and flat cars (8606.30–8606.99), truck assemblies of 8607.12, bolsters "
            "and side frames (8607.19.30), the freight- and passenger-car brake lines (8607.21.10, 8607.29), 8607.99.10 parts and 8608 track and signaling equipment. USMCA-qualifying goods "
            "of Canada and Mexico are exempt (9903.05.93, 9903.05.94). None of these lines is on the note 52(b) general exemption list or a note 52(j) country exception list.",
            "whatItMeans": "$100,000 of Indian bolsters pays $3,600 + $10,000; the same bolsters from Mexico with a USMCA certificate pay nothing.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2026-15274", "csms-69326983", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "br-section-301",
            "country": "Brazil",
            "measure": "Section 301 (Brazil)",
            "ch99Code": "9903.05.01",
            "before": "None",
            "now": f"+25% on the {nnon} lines outside Section 232 (plus 12.5% under 9903.05.27)",
            "exemption": "Does not apply to Section 232 goods (note 50(a)(vi)(1), 9903.05.07), so Brazilian locomotives, wheels and containers pay only Section 232.",
            "whatItMeans": "A Brazilian gondola car pays 14% + 25% + 12.5% = 51.5%; a Brazilian locomotive 25%.",
            "effectiveFrom": "2026-07-22",
            "effectiveSourceId": "fr-2026-14542",
            "sourceIds": ["fr-2026-14542", "csms-69302472", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ru-col2",
            "country": "Russia",
            "measure": "Column 2 rates, 35% in lieu of column 2 (note 30), and Section 232",
            "ch99Code": "9903.90.08 / 9903.82.16",
            "before": "Column 2 rates (35% or 45% on most lines); 35% in place of column 2 on 8607.19.12 and 8609",
            "now": "Column 2 rate + 25% Section 232 on the 23 listed lines; + 12.5% Section 301 on the rest",
            "exemption": "Russia has paid column 2 rates since April 2022, and 35% in place of the column 2 rate on wheels (8607.19.12) and containers (8609) under U.S. note 30 (Proclamation 10420). "
            "Section 232 applies under 9903.82.16; the 12.5% 2026 Section 301 duty (9903.05.66) applies to the lines outside Section 232.",
            "whatItMeans": "A Russian container pays 35% + 25% = 60%; a Russian freight car of 8606.92 pays 45% + 12.5%.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": ["procl-11021", "procl-10420", "procl-10523", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
    ]
    for e in tu["inEffect"]:
        for sid in e["sourceIds"]:
            assert sid in SRC, sid

    def ch(id, type, date, label, title, detail, before, now, countries, ids):
        for sid in ids:
            assert sid in SRC, sid
        return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now, "countries": countries, "sourceIds": ids}

    nic = next(x for x in tu["changes"] if x["id"].startswith("section-301-nicaragua"))
    changes = [
        ch("base-rates", "baseRate", ASOF, "Checked", "No Chapter 86 base-rate changes",
           f"{nl - 3} of {nl} Chapter 86 lines carry the same rates in 2026 Revision 21 as in the 2025 Basic Edition. Freight rail couplers for heading 8605 and 8606 cars (8607.30.10) are now split "
           "into assembled couplers (8607.30.10.10), coupler parts (8607.30.10.50) and other (8607.30.10.90), all at the unchanged 3.6%.",
           None, None, None, ["hts-before", "hts-now", "hts-now-cr"]),
        ch(nic["id"], "pending", "2025-12-29", "Published", "Section 301 tariff on Nicaragua phases in from 2027",
           "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). Note 29 has no Section 232 "
           "carve-out, so it will add to the 25% on Nicaraguan locomotives, parts and containers. The rate is 0% in 2026.",
           None, "+10% to +15%", "Nicaragua", nic["sourceIds"]),
        ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: only lines outside Section 232 pay",
           f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. They do not apply to Section 232 goods (note 52(f)(1)), so in Chapter 86 they reach only the {nnon} lines "
           "outside Section 232: hopper, box, gondola and flat cars, some truck and brake parts and 8608 signaling equipment. USMCA goods are exempt; for the EU, Japan, Korea and Switzerland the rate "
           "replaces the base rate when it is higher.",
           None, f"+10% to +12.5% ({nnon} lines)", "60 economies", ["fr-2026-15181", "fr-2026-15274", "csms-69326983", "hts-chapter-99"]),
        ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
           "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It did not apply to Section 232 goods or USMCA goods (Proclamation 11012), so in Chapter 86 "
           "it had charged the non-USMCA lines outside Section 232.",
           "+10% (non-232 lines)", None, "All", ["procl-11012", "csms-67844987", "hts-chapter-99"]),
        ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: Section 232 goods exempt",
           f"The 25% duty on goods of Brazil (9903.05.01) took effect. Section 232 goods are excluded (note 50(a)(vi)(1)), so it reaches only the {nnon} lines outside Section 232.",
           None, f"+25% ({nnon} lines)", "Brazil", ["fr-2026-14542", "csms-69302472", "hts-chapter-99"]),
        ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032: 85% U.S.-melted test",
           "From June 8, 2026, a derivative article qualifies for the 10% rate (9903.82.06) when at least 85% of its steel content by weight was melted and poured in the United States (before, all of it). "
           "Chapter 86 rates (25%) did not change.",
           None, None, "All", ["procl-11032"]),
        ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 rebuilt on full value: 25% for Chapter 86 (Proclamation 11021)",
           f"Proclamation 11021 replaced the earlier headings with 9903.82.02–9903.82.26, charged on the full customs value regardless of metal content. The {n232 - 1} Chapter 86 derivative lines moved "
           "to the 25% list (9903.82.09), and railway tank cars (8606.10) were added to it. New lower rates: UK 15% with ≥95% UK-melted steel, 10% for goods of U.S.-melted steel. Manufacturing drawback "
           "is allowed for these 25% list goods from trade-agreement partners; goods admitted to a foreign-trade zone must take privileged foreign status; the inclusions process ended.",
           "+50% on the steel content", "+25% of the full value", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
        ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
           "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. It did not apply to Section 232 goods or to USMCA goods of Canada and Mexico.",
           None, "+10% (non-232 goods)", "All", ["procl-11012", "csms-67844987", "hts-chapter-99"]),
        ch("ieepa-end", "extraDuty", "2026-02-24", "Ended", "All IEEPA tariffs end",
           "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal "
           "duties, and CBP stopped collecting them from 12:00 a.m. ET on February 24, 2026. Section 232 and Section 301 duties are not IEEPA duties and continued. For Chapter 86 the IEEPA duties had "
           "applied to the non-steel content of the derivative lines and to all other lines.",
           "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
        ch("s301-maritime-suspended", "reference", "2025-11-10", "Effective", "Maritime Section 301 actions suspended for a year",
           "After the November 1, 2025 U.S.-China deal, USTR suspended all actions in the maritime, logistics and shipbuilding Section 301 investigation from November 10, 2025 through November 9, 2026, "
           "including the 100% duty on Chinese intermodal chassis (8716, chapter 87). No Chapter 86 product was covered.",
           None, None, "China", ["fr-2025-19873"]),
        ch("s301-containers-dropped", "reference", "2025-10-16", "Published", "USTR decides not to tariff Chinese shipping containers",
           "In its final maritime Section 301 action, USTR imposed duties on ship-to-shore cranes and intermodal chassis but decided not to impose the proposed duties on intermodal shipping "
           "containers (8609), citing the impact on domestic intermodal carriers.",
           "Proposed 20% to 100%", "No duty", "China", ["fr-2025-19568"]),
        ch("inclusions-2025-08", "extraDuty", "2025-08-18", "Effective", "Section 232 reaches Chapter 86: locomotives, railcars, parts and containers",
           "Commerce's first inclusions round added 22 Chapter 86 provisions as derivative steel articles: 8601, 8602, 8603, 8604, 8605, 8607.11, 8607.19 (axles, wheels and parts), 8607.21.50, "
           "8607.30 couplers, 8607.91, 8607.99.50 and 8609 containers. The 50% duty applied to the value of the steel content; the non-steel content kept paying the reciprocal and other IEEPA duties.",
           None, "+50% on the steel content", "All", ["fr-2025-15819", "procl-10947"]),
        ch("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariffs reach Chapter 86",
           "Executive Order 14257 set a 10% reciprocal tariff on most countries from April 5, 2025, raised to country rates from August 7, 2025 (Executive Order 14326). Chapter 86 had no Section 232 "
           "duty then, so it paid them in full; Canadian and Mexican goods paid the separate IEEPA duties instead. Ended February 24, 2026.",
           None, "+10% and up (ended)", "All except Canada, Mexico", ["eo-14257", "eo-14326"]),
        ch("s301-maritime-proposed", "reference", "2025-04-23", "Published", "USTR proposes tariffs on Chinese containers",
           "In the maritime, logistics and shipbuilding Section 301 action, USTR proposed duties of 20% to 100% on containers of China (8609.00.00) and on intermodal chassis and parts. The container "
           "duty was dropped in October 2025.",
           None, "Proposed 20% to 100%", "China", ["fr-2025-06927"]),
        ch("ca-mx-ieepa", "reference", "2025-03-04", "Effective", "IEEPA duties on Canada, Mexico and China",
           "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025, with USMCA goods exempt from March 7, 2025, and +10% (then +20%) on goods of China. Ended February 24, 2026.",
           None, "+10% to +25% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195", "eo-14231", "eo-14232"]),
        ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China Section 301 List 3 raised to 25% (other locomotives)",
           "List 3 (9903.88.03), which in Chapter 86 covers other locomotives and tenders (8602.90), went from 10% (September 24, 2018) to 25%.",
           "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
        ch("cn-list2", "extraDuty", "2018-08-23", "Effective", "China Section 301 List 2: railcars, couplers and more",
           "List 2 (9903.88.02, 25%) took effect on August 23, 2018, covering battery and diesel-electric locomotives, passenger coaches, all freight cars, some truck and axle parts and couplers.",
           None, "+25%", "China", ["fr-2018-17709"]),
        ch("cn-list1", "extraDuty", "2018-07-06", "Effective", "China Section 301 List 1: electric locomotives, self-propelled cars, most parts",
           "List 1 (9903.88.01, 25%) took effect on July 6, 2018, covering electric locomotives, self-propelled cars, service vehicles, most wheels, axles, brakes and other parts, and 8608 signaling equipment.",
           None, "+25%", "China", ["fr-2018-13248"]),
    ]
    changes += [ch(**x) for x in c["ADCVD_CHANGES"]]
    changes.sort(key=lambda x: x["date"], reverse=True)
    tu["changes"] = changes

    used = set()
    for e in tu["inEffect"]:
        used.update(e["sourceIds"])
    for x in tu["changes"]:
        used.update(x["sourceIds"])
    used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch86"])
    tu["sources"] = sorted([copy.deepcopy(SRC[i]) for i in used], key=lambda s: (s["published"], s["id"]), reverse=True)

    apply_industry_areas(c)
    from eng86 import apply_engineering
    apply_engineering(c)
    from trade86 import apply_trade
    apply_trade(c)


def apply_industry_areas(c):
    d, SRC = c["d"], c["SRC"]
    ia = d["industryAreas"]
    n232, nnon = len(c["S232"]), len(c["NON232"])
    ia["h1"] = f"HTS Chapter 86: {TITLE} — Tariff Rates by Country"
    ia["seo"] = {
        "title": "Railcar, Locomotive & Container Tariffs by Country: China, Mexico, Canada, Japan, EU, UK (HTS Ch. 86) | KoalaGains",
        "shortDescription": "The total U.S. tariff on Chapter 86 rail equipment and containers by country and product: 25% Section 232 on locomotives, coaches, tank cars, wheels, couplers and "
        "containers from every country, Free USMCA freight cars, China 50%+, EU and Japan rates on the lines outside Section 232.",
        "keywords": [
            "tariffs on rail cars",
            "railcar tariffs",
            "steel derivative tariff canada",
            "shipping container tariffs china",
            "rail tariffs",
            "railway tariffs",
            "tank car tariffs",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. For most of Chapter 86 the answer is "
        f"the same everywhere: **25%** plus the base rate on the {n232} Section 232 lines, because Section 232 has no country exemptions and is collected on top of FTA and USMCA rates. "
        "China pays **25% more** under Section 301 on almost every line, UK goods of UK-melted steel pay 15% (the cells show the default 25%), and goods of U.S.-melted steel pay 10%.\n\n"
        f"The {nnon} lines outside Section 232 (most freight cars, bolsters, side frames, some brake parts and 8608 signaling equipment) are where countries differ: Free for USMCA goods of Canada "
        "and Mexico, the base rate plus 10% or 12.5% for most of the 60 Section 301 economies, 10% or 12.5% in place of the base rate for the EU, Japan, Korea and Switzerland, and more for China and "
        "Brazil. The table does **not** include antidumping or countervailing duties (see Tariff updates)."
    )
    BY = c["ADCVD_BY_COUNTRY"]

    def s301(country):
        for cell in c["ROW"][country]["cells"].values():
            for bb in cell["withoutUsmca"]["breakdown"]:
                if "8608.00.00.00" in bb["lines"]:
                    return bb["extra"]
        return None

    R = {
        "China": ("50% or more on locomotives, coaches, tank cars, wheels, axles, couplers and other listed parts: 25% Section 232 (9903.82.09) + 25% Section 301 (List 1, 2 or 3), plus the base rate. "
                  "Containers (8609): 25% only (no Section 301 list). Lines outside Section 232 (hopper, box, gondola and flat cars, bolsters, side frames, 8608): base + 12.5% (9903.05.31) + 25% List 1 or 2; "
                  "freight-car air brakes (8607.21.10) are excluded from List 1 until November 9, 2026. " + BY["China"],
                  ["procl-11021", "fr-2018-13248", "fr-2018-17709", "fr-2018-20610", "fr-2025-21671", "fr-2026-15181", "hts-now"]),
        "Mexico": ("25% Section 232 on the 23 listed lines with or without a USMCA claim (note 16(b)), plus the base rate without one: tank cars 25% with USMCA, 39% without. Lines outside Section 232 "
                   "(other freight cars, bolsters, side frames, 8608) are Free with USMCA, otherwise base + 10% Section 301 (9903.05.55). " + BY["Mexico"],
                   ["procl-11021", "fr-2026-15181", "hts-now"]),
        "Canada": ("25% Section 232 on the 23 listed lines with or without a USMCA claim (note 16(b)). Lines outside Section 232 are Free with USMCA, otherwise base + 10% Section 301 (9903.05.29). "
                   "No Chapter 86 line is on the Section 338 lists of note 51.",
                   ["procl-11021", "fr-2026-15181", "hts-now"]),
        "United Kingdom": ("25% Section 232 shown; with at least 95% UK-melted steel the rate is 15% (9903.82.05, note 16(d)). Lines outside Section 232: base + 10% Section 301 (9903.05.81).",
                           ["procl-11021", "fr-2026-08297", "eo-14309", "fr-2026-15181", "hts-now"]),
        "Brazil": ("25% Section 232 on the listed lines; the Brazil Section 301 duty does not apply to Section 232 goods (note 50(a)(vi)(1)). Lines outside Section 232: base + 25% (9903.05.01) + 12.5% (9903.05.27).",
                   ["procl-11021", "fr-2026-14542", "fr-2026-15181", "hts-now"]),
        "Russia": ("Column 2 rate (35% or 45% on most lines), or 35% in its place on wheels (8607.19.12) and containers (9903.90.08), plus 25% Section 232 (9903.82.16) on the listed lines: up to 70%. "
                   "Lines outside Section 232: column 2 + 12.5% Section 301.",
                   ["procl-11021", "procl-10420", "fr-2026-15181", "hts-now"]),
        "Japan": ("25% Section 232 on the listed lines, on top of the base rate (Free under the U.S.-Japan agreement on 8607.19.90 and 8607.99.50). Lines outside Section 232: 12.5% in place of the "
                  "base rate when lower (9903.05.49).",
                  ["procl-11021", "fr-2026-15181", "hts-now"]),
        "South Korea": ("25% Section 232 on the listed lines, on top of the KORUS rate (Free). Lines outside Section 232: 12.5% in place of the base rate (9903.05.71).",
                        ["procl-11021", "fr-2026-15181", "hts-now"]),
        "Switzerland": ("25% Section 232 on the listed lines. Lines outside Section 232: 12.5% in place of the base rate when lower (9903.05.74).",
                        ["procl-11021", "fr-2026-15181", "hts-now"]),
        "India": ("25% Section 232 on the listed lines. Lines outside Section 232: base + 10% Section 301 (9903.05.44). " + BY["India"],
                  ["procl-11021", "fr-2026-15181", "hts-now"]),
        "Czechia": ("25% Section 232 on the listed lines. Lines outside Section 232: 10% in place of the base rate when lower (EU, 9903.05.39); freight cars stay at 14%. " + BY["Czechia"],
                    ["procl-11021", "fr-2026-15181", "hts-now"]),
    }
    EU = ("25% Section 232 on locomotives, coaches, tank cars, wheels, axles, couplers, locomotive parts and containers. Lines outside Section 232: 10% in place of the base rate when lower "
          "(EU, 9903.05.39); freight cars stay at their 14% base rate.")
    for x in ia["countries"]:
        name = x["country"]
        if name == "Any other country":
            x["rule"]["label"] = (
                f"25% Section 232 on the {n232} listed lines from every other country (no exemptions). Lines outside Section 232: the base rate, plus 10% or 12.5% for the other economies in the 2026 "
                "Section 301 actions. Column 2 countries (Belarus, Cuba, North Korea) pay more; Nicaragua's Section 301 duty starts January 1, 2027."
            )
            x["rule"]["sourceIds"] = ["procl-11021", "fr-2026-15181", "fr-2025-23892", "hts-now"]
            continue
        if name in R:
            x["rule"]["label"], x["rule"]["sourceIds"] = R[name][0].strip(), R[name][1]
        else:
            e = s301(name)
            assert e and "10% in place of base" in e or "floor" in (e or ""), (name, e)
            x["rule"]["label"] = EU
            x["rule"]["sourceIds"] = ["procl-11021", "fr-2026-15181", "hts-now"]
    for x in ia["countries"]:
        assert "TODO" not in x["rule"]["label"], x["country"]
        x["rule"]["sourceIds"] = list(dict.fromkeys(x["rule"]["sourceIds"] + c["ADCVD_COUNTRY_SOURCES"].get(x["country"], [])))
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "Section 232 is shown at its default rate of 25% (9903.82.09). UK goods with at least 95% UK-melted steel pay 15% (9903.82.05) and goods with at least 85% U.S.-melted steel pay 10% (9903.82.06); "
        "the cells do not show these variants.",
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
        "Antidumping and countervailing duties are not included. They apply to freight rail couplers from China and Mexico, including couplers fitted to imported railcars; Czech and Indian couplers "
        "and Mexican tank cars are under investigation.",
        "Entry rules: duty-free locomotives and freight cars may be released without entry under a bond (19 CFR 141.4(b)(4)); containers and rail equipment in international traffic are admitted "
        "without entry (19 CFR 10.41a, 123.12); every Section 232 entry reports the country of melt and pour.",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 2, 16, 20, 29, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 16(c)(vii) lists 23 Chapter 86 lines (all of 8601–8605, 8606.10, "
        "8607.11, 8607.19.03–.15 and .90, 8607.21.50, 8607.30, 8607.91, 8607.99.50 and 8609); none is on the 50% lists, and the 15% metal-weight test of note 16(c) and the 9903.82.01 no-metal heading "
        "need the importer's confirmation and are not applied. Note 16(b) collects the duty on top of FTA rates. Section 232 goods are excluded from the 2026 Section 301 duties (note 52(f)(1)), the Brazil "
        f"duty (note 50(a)(vi)(1)) and the expired Section 122 surcharge, but not from China Section 301 (note 20) or the 2027 Nicaragua duty (note 29). None of the {nnon} other lines is on the note 52(b) "
        "general exemption list or a note 52(j) country list. Notes 31 (China 2024 increases; heading 9903.92 covers cranes of 8426), 33 and 38 (vehicle parts) and 51 (Canada Section 338) name no "
        "Chapter 86 line. One China exclusion applies: 8607.21.10.00 (9903.88.69, note 20(vvv)(i)) until November 9, 2026."
    )
    ia_ids = {"hts-now"}
    for x in ia["countries"]:
        ia_ids.update(x["rule"]["sourceIds"])
    for sid in ia_ids:
        assert sid in SRC, sid
    ia["sources"] = sorted([copy.deepcopy(SRC[i]) for i in ia_ids], key=lambda s: (s["published"], s["id"]), reverse=True)
