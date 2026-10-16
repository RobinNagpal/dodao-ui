"""Writer text for Chapter 73. apply_text(ctx) fills every page of the generated file in place."""
import copy

from groups73 import G

PCT_301 = {}  # country -> 2026 Section 301 wording on the 14 cast-iron lines, read from the matrix


def b(usd):
    if usd >= 1e9:
        return f"${usd / 1e9:.2f}B"
    if usd >= 1e6:
        return f"${usd / 1e6:.0f}M"
    return f"${usd / 1e3:.0f}K"


def apply_text(c):
    d, SRC = c["d"], c["SRC"]
    o, tu, ia, te, ui, fc = d["overview"], d["tariffUpdates"], d["industryAreas"], d["tariffEngineering"], d["understandIndustry"], d["finalConclusion"]
    LINE, ROW = c["LINE"], c["ROW"]
    ASOF, ECFR_AS_OF = c["ASOF"], c["ECFR_AS_OF"]
    n50, n25, nauto, nnon, nart, nder = len(c["S232_50"]), len(c["S232_25"]), len(c["AUTO"]), len(c["NON232"]), len(c["ART"]), len(c["DERIV50"])

    def cell_of(country, line, side="withoutUsmca"):
        for cell in ROW[country]["cells"].values():
            for bb in cell[side]["breakdown"]:
                if line in bb["lines"]:
                    return bb
        raise KeyError((country, line))

    # ------------------------------------------------------------ groups
    for pg in o["productGroups"]:
        label, short, blurb, ex = G[pg["heading"]]
        pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
    for g in ia["groups"]:
        g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

    # ------------------------------------------------------------ overview
    o["h1"] = "HTS Chapter 73: Articles of Iron or Steel — Tariff Rates"
    o["seo"] = {
        "title": "HTS Chapter 73 Tariffs: Steel Pipe, Fasteners, Structures & Section 232 Derivative Duties | KoalaGains",
        "shortDescription": f"Searchable U.S. duty table for all {len(LINE)} HTS Chapter 73 lines (articles of iron or steel): steel pipe, fittings, structures, wire, nails, bolts, springs, "
        "grills, cookware and sinks. Most pay 50% Section 232 on full value (stoves, cookware, sinks 25%; UK 25%/15%); China adds 25%; cast iron is outside Section 232.",
        "keywords": [
            "HTS Chapter 73",
            "chapter 73 hts codes",
            "articles of iron or steel tariff",
            "steel derivative tariff",
            "section 232 steel derivatives list",
            "steel pipe tariff code",
            "hs code 7326",
            "hs code 7318",
            "hs code 7308",
            "steel and aluminum tariffs",
        ],
    }
    cn301 = 0
    for cell in ROW["China"]["cells"].values():
        for bb in cell["withoutUsmca"]["breakdown"]:
            if any(k in bb["extra"] for k in ("9903.88.02", "9903.88.03", "9903.88.15", "9903.91.01")):
                cn301 += bb["lineCount"]
    o["stats"][2]["note"] = (
        f"Section 232 at 50% (9903.82.02, all countries): {n50}; Section 232 at 25% (9903.82.09): {n25}; vehicle-part springs: {nauto}; "
        f"outside Section 232 (cast iron): {nnon}. China Section 301 (2018–2024 actions): {cn301}; Russia 70% in lieu of column 2: 130"
    )
    ndut = int(o["stats"][1]["value"].split(" of ")[0])
    o["intro"] = (
        f"Chapter 73 covers articles made of iron or steel: sheet piling and rail material, cast-iron, seamless and welded pipe and tube, fittings, structures, "
        "tanks, drums and gas cylinders, wire rope, mesh and fencing, chain, nails, screws and bolts, springs, stoves and grills, radiators, kitchenware, sinks, "
        f"castings and other articles. **{len(LINE) - ndut} of the {len(LINE)} lines are Free** under the general rate; the rest pay 1.5% to 12.5% (coach and wood screws 12.5%).\n\n"
        "What decides the cost is **Section 232**, charged on the **full customs value** since April 6, 2026, from every country and on top of any FTA or USMCA rate. "
        f"**{n50 + nauto} lines pay +50%** (heading 9903.82.02): the steel articles (sheet piling, rails and seamless and welded pipe of 7301.10, 7302 and 7304–7306) and most fabricated articles "
        f"(fittings, structures, containers, wire products, chain, nails, fasteners, springs, cast and other articles). **{n25} lines pay +25%** (9903.82.09): stoves and grills, "
        "steel radiators, kitchenware, sinks and sanitary ware, hangers and some other wire articles. Lower rates: **25% / 15%** for UK goods made of at least 95% UK-melted steel, "
        "**10%** for derivative articles whose steel is at least 85% U.S.-melted, and 25% for Commerce-authorized Canadian or Mexican pipe and rail. "
        f"The {nnon} **cast-iron** lines (cast-iron pipe, non-malleable fittings, radiators, cookware and baths) are outside Section 232.\n\n"
        "China pays another **25%** (or 7.5%) under Section 301 on almost every line, and Canadian structural parts (7308.90) pay a further 50% under Section 338. "
        "Many pipe, fitting, nail, wire and household products also carry **antidumping and countervailing duties** set by the Commerce Department company by company; "
        "they are not part of this table or the tariff calculator (see Tariff updates)."
    )
    ex = [
        ("South Korea", "7306.30.50.31", "50%"),
        ("Taiwan", "7318.15.80.66", "58.5%"),
        ("China", "7324.10.00.10", "53.4%"),
        ("Canada", "7308.90.95.90", "100%"),
        ("United Kingdom", "7317.00.55.02", "50%"),
        ("Vietnam", "7323.91.50.20", "17.8%"),
        ("Germany", "7323.91.50.20", "10%"),
    ]
    for country, line, total in ex:
        assert line in LINE, line
        assert cell_of(country, line)["total"] == total, (country, line, cell_of(country, line)["total"])
    assert cell_of("Canada", "7308.90.95.90", "withUsmca")["total"] == "100%"
    o["workedExamples"] = [
        {
            "title": "$200,000 of galvanized standard pipe from South Korea",
            "line": "7306.30.50.31",
            "body": "Welded galvanized pipe is **Free** under the general rate, but it is a Section 232 steel article (note 16(c)(iii)), so it pays **+50% of its full value** (9903.82.02): "
            "**$100,000**. KORUS does not reduce it (note 16(b)), and the 2026 Section 301 duty on Korea does not apply to Section 232 goods (note 52(f)(1)). "
            "A SIMA steel import license is needed before entry, and circular welded pipe from Korea is under an antidumping order: check the producer's rate.",
        },
        {
            "title": "Hex cap screws from Taiwan, and the U.S.-melted alternative",
            "line": "7318.15.80.66",
            "body": "Cap screws carry an **8.5%** base rate and, as derivative steel articles, **+50%** Section 232 (9903.82.02): **58.5%**, or $58,500 on $100,000. "
            "If at least 85% of the screws' steel was melted and poured in the United States, the importer can enter them under **9903.82.06 at +10%** instead: **18.5%**.",
        },
        {
            "title": "Drawn stainless steel sinks from China",
            "line": "7324.10.00.10",
            "body": "Base rate **3.4%**, plus **+25%** Section 232 (sinks are on the 25% derivative list, 9903.82.09) and **+25%** Section 301 (List 3, 9903.88.03): **53.4%**. "
            "On top of that, drawn stainless steel sinks from China are under antidumping and countervailing duty orders.",
        },
        {
            "title": "Fabricated structural steel parts from Canada",
            "line": "7308.90.95.90",
            "body": "Free at base and Free under USMCA, but **+50%** Section 232 (9903.82.02) and, since September 15, 2026, **+50%** Section 338 (9903.03.14, U.S. note 51(b)(3)), "
            "which Proclamation 11065 made apply in addition to Section 232: **100%** of the value, with or without a USMCA claim.",
        },
        {
            "title": "Galvanized coil nails from the United Kingdom",
            "line": "7317.00.55.02",
            "body": "Free at base; **+50%** Section 232 by default. If at least 95% of the steel was melted and poured in the UK (note 16(d)), the nails enter under **9903.82.04 at +25%**. "
            "UK nails are not under the steel nail antidumping orders, which cover China, Korea, Malaysia, Oman, Taiwan, the UAE and Vietnam.",
        },
        {
            "title": "Cast-iron bakeware from Vietnam or Germany",
            "line": "7323.91.50.20",
            "body": "Cast-iron cookware is **not** on the Section 232 lists. From Vietnam it pays the **5.3%** base rate plus **12.5%** under the 2026 Section 301 action (9903.05.84): **17.8%**. "
            "From Germany the EU rate is **10% in place of** the base rate (9903.05.39): **10%**. A stainless or enameled steel pan of 7323.93 or 7323.94 would instead pay +25% Section 232.",
        },
    ]
    o["notes"] = {
        "chapterNotes": (
            "**Note 1.** In this chapter \"cast iron\" means products obtained by casting in which iron predominates by weight over each of the other elements and which do not "
            "meet the chemical composition of steel in note 1(d) to chapter 72.\n\n"
            "**Note 2.** In this chapter \"wire\" means hot- or cold-formed products of any cross-sectional shape, of which no cross-sectional dimension exceeds 16 mm."
        ),
        "additionalUsNotes": (
            "**1.** For headings 7304 and 7306, the special rate \"Free (C)\" (civil aircraft) applies only to tubes and pipes with attached fittings, suitable for conducting gases or liquids.\n\n"
            "**2.** For subheading 7307.19.30, \"ductile fittings\" are fittings with over 2.5% carbon and over 0.02% magnesium, or magnesium and cerium, by weight.\n\n"
            "**Statistical note 1.** For 7310.10.0005, 7310.29.0020 and 7310.29.0055, \"refillable stainless steel kegs\" are cylindrical beverage kegs with a domed top and bottom and a single neck "
            "designed for a coupler (valve) and extractor tube (spear)."
        ),
    }

    # ------------------------------------------------------------ tariffUpdates
    S232 = ["procl-11021", "procl-10947", "procl-10896", "fr-2026-08297", "procl-11032", "csms-68253075", "hts-chapter-99", "hts-now"]
    tu["seo"] = {
        "title": "Steel Derivative & Pipe Tariff Updates 2025–2026: Section 232 Full Value, 50%/25%, Canada, UK (HTS Ch. 73) | KoalaGains",
        "shortDescription": "Every U.S. tariff change on HTS Chapter 73 iron and steel articles since 2025, with Federal Register citations: Section 232 on derivatives, the 50% rate, "
        "full-value duty since April 6, 2026 (50% or 25%), UK and U.S.-melted rates, Section 338 on Canada, the end of IEEPA, and the AD/CVD orders on pipe, nails and more.",
        "keywords": [
            "steel derivative tariff",
            "section 232 steel derivatives list",
            "steel tariffs 2026",
            "steel tariff 50 effective date",
            "section 232 derivative steel articles",
            "steel derivative tariff calculation",
            "steel pipe tariffs",
            "steel tariffs canada",
            "uk steel tariffs 2026",
        ],
    }
    tu["intro"] = (
        "This page compares the **2025 Basic Edition** (in force January 1, 2025) with the current **2026 Revision 21** (in force October 9, 2026) and lists every extra duty that "
        "reaches Chapter 73 today. No base rate changed; six new statistical lines split existing ones (electrical conduit pipe, wind turbine towers and aerosol cans).\n\n"
        "The extra duties changed completely. In January 2025 only pipe, rails and sheet piling (since 2018) and certain nails (since 2020) paid Section 232, and Canada, Mexico and others were exempt. "
        "Proclamation 10896 extended the 25% duty to most Chapter 73 articles as derivatives and ended every exemption on **March 12, 2025**; Proclamation 10947 raised it to **50% on June 4, 2025**, "
        "charged then only on the steel content of Chapter 73 goods; and Proclamation 11021 rebuilt the program on **April 6, 2026**: duty on the **full customs value**, 50% for most "
        "of the chapter, 25% for stoves, cookware, sinks and similar household goods, 10% for goods of U.S.-melted steel. The IEEPA duties ended on **February 24, 2026**, and the Section 122 "
        "surcharge and the 2026 Section 301 duties leave Section 232 goods alone; China's Section 301 duty and Canada's Section 338 duty stack.\n\n"
        "Antidumping and countervailing duty orders cover much of the chapter's pipe, fittings, wire products, nails and household goods. They are company-specific, summarized below by product, "
        "and **not included in the tariff calculator**."
    )
    tu["scope"] = (
        "Chapter 99 measures that reach Chapter 73 from any country: Section 232 steel and derivatives (note 16), the Section 232 vehicle-parts duties on springs (notes 33 and 38), "
        "China Section 301 (notes 20, 31), the 2026 Section 301 actions on 60 economies and Brazil (notes 50, 52), Canada Section 338 (note 51), Russia's rates in lieu of column 2 (note 30), "
        "the scheduled Nicaragua Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. The main antidumping and countervailing duty orders on Chapter 73 products are "
        "summarized for reference; the calculator does not model them. For the rate each supplier pays, see Rates by country."
    )
    tu["stats"] = [
        {"label": "Base rates unchanged", "value": f"{len(LINE) - 6} of {len(LINE)} lines"},
        {"label": "Section 232 at 50% / 25%", "value": f"{n50 + nauto} / {n25} lines"},
        {"label": "Outside Section 232 (cast iron)", "value": f"{nnon} lines"},
        {"label": "Compared", "value": "2025 Basic → Rev 21"},
    ]
    tu["inEffect"] = [
        {
            "id": "all-section-232-50",
            "country": "All countries (Canada, Mexico, EU, Japan, Korea and Brazil included)",
            "measure": "Section 232 steel articles and derivatives, on the full customs value",
            "ch99Code": "9903.82.02",
            "before": "+25% on pipe, rails and sheet piling (9903.80.01) and on certain nails (Proclamation 9980), with Canada, Mexico and others exempt or under quotas; most other Chapter 73 articles none",
            "now": "+50%",
            "exemption": f"Covers {n50 + nauto} lines: the note 16(c)(iii) steel articles ({nart} lines: 7301.10, 7302.10, 7302.40, 7302.90, 7304, 7305, 7306) and the (iv) derivative steel articles "
            "(fittings except 7307.11, structures, tanks, drums, cylinders, wire rope, barbed wire, mesh, chain, anchors, nails, fasteners, needles, springs, most castings and other articles); "
            "7308.20.00.35 (wind towers) is listed as a derivative aluminum article at the same rate. No country exemptions, quotas or product exclusions since March 12, 2025 (Proclamation 10896). "
            "Note 16(b): collected on top of any FTA or USMCA rate. Lower rates: UK goods with ≥95% UK-melted steel 25% (9903.82.04); derivatives (iv) with ≥85% U.S.-melted steel 10% (9903.82.06); "
            "Commerce-authorized Canadian or Mexican steel articles 25% (9903.82.18); Russia 9903.82.14 (50%). Civil aircraft articles of the EU, Japan, Korea and the UK on the listed provisions are exempt "
            "(9903.02.76, 9903.96.02, 9903.02.81, 9903.96.01). The six vehicle-part spring lines pay the auto or truck parts duty instead when used as such. Goods under 9903.82.02 do not pay the 2026 "
            "Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)).",
            "whatItMeans": "Pipe, structures, fasteners, wire products, chain, nails and most other steel articles pay half their value again in duty: $100,000 of bolts or pipe owes $50,000 plus the base rate, whatever the FTA claim.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232 + ["procl-9980", "fr-2025-15819"],
        },
        {
            "id": "all-section-232-25",
            "country": "All countries except Russia (Russia: 9903.82.16, also 25%)",
            "measure": "Section 232 derivative steel articles, lower list",
            "ch99Code": "9903.82.09",
            "before": "+25% on the full value from March 12, 2025; +50% on the steel content from June 4, 2025",
            "now": "+25% of the full value",
            "exemption": f"Covers {n25} lines on note 16(c)(vii): stoves, grills and parts (7321), steel radiators and parts (7322.19, 7322.90), steel and stainless kitchenware and household articles "
            "(7323.10, 7323.93–7323.99), sinks and sanitary ware (7324.10, 7324.29, 7324.90), meter boxes (7325.10.00.35), wire belting, hangers, staples and ties (7326.20.00.10–.55), "
            "pocket containers and horseshoes (7326.90.35, 7326.90.45), ladders, paint roller frames, broom handles and caskets (7326.90.86.60–.77). Lower rates: UK with ≥95% UK-melted steel 15% (9903.82.05); "
            "≥85% U.S.-melted steel 10% (9903.82.06). Unlike the 50% list, these Annex I-B goods can claim manufacturing drawback when they come from a trade-agreement partner and are not AD/CVD merchandise "
            "(Proclamation 11021 clause 13).",
            "whatItMeans": "A $100,000 container of steel grills, cookware or sinks pays $25,000 plus the base rate.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232,
        },
        {
            "id": "gb-section-232",
            "country": "United Kingdom",
            "measure": "Section 232 steel and derivatives, UK rates",
            "ch99Code": "9903.82.04 / 9903.82.05",
            "before": "Tariff-rate quota on UK steel articles (Proclamation 10406); derivatives none until March 12, 2025",
            "now": "+25% (50% list) or +15% (25% list) with ≥95% UK-melted steel; otherwise +50% or +25%",
            "exemption": "Note 16(d): only when at least 95% of the steel was melted and poured in the United Kingdom; Commerce (91 FR 23056) lets Tata Steel UK steel melted and poured in the Netherlands count "
            "until January 1, 2028. UK civil aircraft articles on note 35's list are exempt (9903.96.01). Executive Order 14309 contemplates a UK steel quota, but none has been set. UK goods without "
            "the 95% proof pay the standard 50% or 25%.",
            "whatItMeans": "A UK maker using UK-melted steel pays half the standard duty on pipe or nails (25%) and 15% instead of 25% on grills or sinks.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": ["procl-11021", "procl-10947", "fr-2026-08297", "eo-14309", "procl-10406", "fr-2025-12060", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "us-melted-232",
            "country": "All countries",
            "measure": "Section 232 rate for derivatives made of U.S.-melted steel",
            "ch99Code": "9903.82.06",
            "before": "Exempt: derivatives processed abroad from U.S.-melted steel paid no Section 232 duty (Proclamation 10896)",
            "now": "+10%",
            "exemption": "Note 16(e): derivative articles of lists (iv) and (vii) in which at least 85% of the steel content (by weight) was melted and poured in the United States (Proclamation 11032, "
            "from June 8, 2026; Proclamation 11021 had required all of it). Not for the (iii) steel articles of 7301–7306, which pay 50% whatever the melt country. Russia uses 9903.82.15.",
            "whatItMeans": "Fasteners, fittings or cookware made abroad from U.S. steel pay 10% instead of 50% or 25%; the melt country must be documented.",
            "effectiveFrom": "2026-06-08",
            "effectiveSourceId": "procl-11032",
            "sourceIds": ["procl-11032", "procl-11021", "procl-10896", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "camx-section-232",
            "country": "Canada, Mexico",
            "measure": "Section 232, Commerce-authorized steel articles",
            "ch99Code": "9903.82.18",
            "before": "None",
            "now": "+25% for authorized quantities",
            "exemption": f"Note 16(h): only the {nart} note 16(c)(iii) steel-article lines of Chapter 73 (sheet piling, rails and track material, seamless and welded pipe), melted and poured in Canada or Mexico, "
            "qualifying for USMCA, and within the quantity Commerce authorizes for producers that supply U.S. vehicle makers and commit to new U.S. steel capacity (Proclamation 10984 clause 13). "
            "Derivative articles cannot use it. Everything else from Canada or Mexico pays 50% or 25%.",
            "whatItMeans": "An approved Canadian or Mexican pipe producer ships its authorized tonnage at half the Section 232 duty.",
            "effectiveFrom": "2026-04-23",
            "effectiveSourceId": "fr-2026-07987",
            "sourceIds": ["fr-2026-07987", "procl-10984", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "cn-section-301",
            "country": "China",
            "measure": "Section 301: Lists 2, 3 and 4A, the 2024 review (note 31) and the 2026 action",
            "ch99Code": "9903.88.02 / 9903.88.03 / 9903.88.15 / 9903.91.01 / 9903.05.31",
            "before": "+25% (Lists 2 and 3, note 31) or +7.5% (List 4A)",
            "now": "+25% or +7.5% on top of Section 232 (75% on most pipe and steel articles); 37.5% on most cast-iron lines",
            "exemption": "Note 31 (9903.91.01, 25%) covers 234 lines, mainly the pipe, tube, rail and sheet piling of 7301–7306, since September 27, 2024. List 3 (9903.88.03, 25%) covers most other lines, "
            "List 2 (9903.88.02, 25%) ten structure lines of 7308, and List 4A (9903.88.15, 7.5%) about 43 lines (some pipe, nails, fasteners, needles, springs, stoves, cookware). These all stack with "
            "Section 232. The 12.5% 2026 Section 301 duty on China (9903.05.31) applies only to the 14 cast-iron lines. One granted exclusion, for certain steel cable hooks of 7326.90.86.88, runs until November 9, 2026 (9903.88.69). The IEEPA duties on "
            "China ended February 24, 2026; USTR confirmed on October 7, 2026 that the 2018 actions continue.",
            "whatItMeans": "Chinese pipe, structures, fasteners and wire products pay 75% or more of their value; Chinese grills and sinks about 50%; Chinese cast-iron soil pipe 37.5%.",
            "effectiveFrom": "2024-09-27",
            "effectiveSourceId": "fr-2024-21217",
            "sourceIds": ["fr-2024-21217", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s301-2026",
            "country": "60 Section 301 economies (Canada, Mexico, EU, Japan, Korea, Taiwan, Vietnam, India, Thailand, UK, Russia and others)",
            "measure": "Section 301 (2026 actions on 60 economies)",
            "ch99Code": "9903.05.20–9903.05.84",
            "before": "None",
            "now": f"+10% or +12.5% (EU, Japan, Korea, Taiwan: 10% or 12.5% in place of the base rate) on the {nnon} cast-iron lines only",
            "exemption": "Does not apply to Section 232 goods (note 52(f)(1), 9903.05.90), so it reaches only cast-iron pipe (7303), non-malleable cast fittings (7307.11), cast-iron radiators (7322.11), "
            "cast-iron cookware (7323.91, 7323.92) and cast-iron baths (7324.21). USMCA-qualifying goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94). None of these lines is on the note 52(b) "
            "general exemption list.",
            "whatItMeans": "$100,000 of Indian cast-iron soil pipe pays $10,000; the same pipe from Mexico with a USMCA certificate pays nothing.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "br-section-301",
            "country": "Brazil",
            "measure": "Section 301 (Brazil)",
            "ch99Code": "9903.05.01",
            "before": "None",
            "now": f"+25% on the {nnon} cast-iron lines (plus 12.5% under 9903.05.27)",
            "exemption": "Does not apply to Section 232 goods (note 50(a)(vi)(1), 9903.05.07), so Brazilian pipe and steel articles pay only Section 232. Brazilian civil aircraft articles are exempt (9903.05.05).",
            "whatItMeans": "Brazilian cast-iron pipe or cookware pays base + 25% + 12.5%; Brazilian steel pipe pays 50%.",
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
            "now": "+50% on structural parts 7308.90.30, 7308.90.60 and 7308.90.95, in addition to Section 232",
            "exemption": "Charged even when USMCA is claimed. From August 22, 2026 the duty did not apply to Section 232 goods (Proclamation 11048 clause 2); Proclamation 11065 made it apply in addition to Section 232 "
            "from September 15, 2026 and removed 7308.10, 7308.20 and 7308.90.70 from the list. Canadian civil aircraft articles are exempt (9903.03.16).",
            "whatItMeans": "Canadian fabricated structural steel and other 7308.90 parts pay 100% of their value (50% + 50%).",
            "effectiveFrom": "2026-09-15",
            "effectiveSourceId": "procl-11065",
            "sourceIds": ["procl-11065", "procl-11048", "procl-11056", "csms-69606660", "csms-69851916", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "springs-vehicle-parts",
            "country": "All countries (EU, Japan, Korea, Taiwan and UK at deal rates)",
            "measure": "Section 232 automobile and medium/heavy-duty vehicle parts (springs)",
            "ch99Code": "9903.94.05 / 9903.74.08",
            "before": "None",
            "now": "+25% (EU, Japan, Korea, Taiwan: 15% in place of the base rate; UK 10%) instead of the 50% metals duty",
            "exemption": f"Reaches the {nauto} leaf-spring and suspension-spring lines (7320.10, 7320.20.10) only when they are parts of passenger vehicles or light trucks (note 33) or of medium and heavy-duty "
            "vehicles (note 38); then the metals duty does not apply. USMCA-qualifying parts of Canada and Mexico are exempt from the auto-parts duty (9903.94.06, 9903.74.10). Other springs pay 50%.",
            "whatItMeans": "A Japanese leaf spring for a U.S.-assembled car pays 15%; the same spring for industrial use pays 3.2% + 50%.",
            "effectiveFrom": "2025-05-03",
            "effectiveSourceId": "procl-10908",
            "sourceIds": ["procl-10908", "procl-10925", "csms-64916652", "procl-10984", "csms-66665333", "fr-2025-17908", "fr-2025-18660", "fr-2025-21940", "fr-2026-10571", "fr-2025-12060", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ru-section-232",
            "country": "Russia",
            "measure": "Section 232 (Russia) + 70% in lieu of column 2",
            "ch99Code": "9903.82.14 / 9903.82.16 / 9903.90.09",
            "before": "Column 2 rates, 70% in their place on 130 lines; Section 232 on pipe and rails",
            "now": "+50% (9903.82.14) or +25% (9903.82.16) Section 232 on top of the column 2 rate, or of 70% on the 130 note 30(d) lines",
            "exemption": "Russia has paid column 2 rates since April 9, 2022, and 70% in place of column 2 on the note 30(d) subheadings since April 1, 2023: in Chapter 73, 130 lines of seamless and welded pipe, some fittings, structures, drums, cylinders, mesh, bolts, nuts, washers and castings "
            "(Proclamation 10523). Russian wind towers (7308.20.00.35, an aluminum derivative) pay 200% (9903.85.68). The 12.5% 2026 Section 301 duty applies to the cast-iron lines.",
            "whatItMeans": "Russian seamless pipe of 7304.39 pays 70% + 50% = 120% of its value.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": ["procl-11021", "procl-10523", "procl-10522", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
    ]
    for e in tu["inEffect"]:
        for sid in e["sourceIds"]:
            assert sid in SRC, sid

    def ch(id, type, date, label, title, detail, before, now, countries, ids):
        for sid in ids:
            assert sid in SRC, sid
        return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now, "countries": countries, "sourceIds": ids}

    gen_changes = {x["id"]: x for x in tu["changes"]}
    nic = next(x for x in tu["changes"] if x["id"].startswith("section-301-nicaragua"))
    changes = [
        ch("base-rates", "baseRate", ASOF, "Checked", "No Chapter 73 base-rate changes",
           f"{len(LINE) - 6} of {len(LINE)} Chapter 73 lines carry the same rates in 2026 Revision 21 as in the 2025 Basic Edition. Six statistical lines are new, at unchanged rates: "
           "electrical conduit pipe 7306.30.10.10 (rest 7306.30.10.90), tubular wind turbine towers 7308.20.00.35 (beside 7308.20.00.30), and aerosol cans 7310.21.00.70 (rest 7310.21.00.75).",
           None, None, None, ["hts-before", "hts-now", "hts-now-cr"]),
        ch(nic["id"], "pending", "2025-12-29", "Published", "Section 301 tariff on Nicaragua phases in from 2027",
           "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). Note 29 has no Section 232 carve-out, "
           "so it will add to the 50% or 25% on Nicaraguan steel articles. The rate is 0% in 2026.",
           None, "+10% to +15%", "Nicaragua", nic["sourceIds"]),
        ch("ca-338-stack", "extraDuty", "2026-09-15", "Effective", "Section 338 duty on Canadian structural parts now stacks with Section 232",
           "Proclamation 11065 made the 50% Section 338 duty (9903.03.14) apply in addition to Section 232 and narrowed the list: of Chapter 73 it now covers 7308.90.30, 7308.90.60 and 7308.90.95 "
           "(7308.10, 7308.20 and 7308.90.70 were removed). Canadian goods on it pay 100% even with a USMCA claim.",
           "+50% (Section 232 only)", "+50% + 50%", "Canada", ["procl-11065", "csms-69851916"]),
        ch("ca-338-start", "reference", "2026-08-22", "Effective", "Section 338 duty on certain Canadian goods begins",
           "Proclamation 11048 imposed a 50% duty on the products of Canada in the note 51(b) lists, including several 7308 lines, from August 22, 2026 (after Proclamation 11056's three-day suspension). "
           "Until September 14 it did not apply to goods subject to Section 232, so it did not change Chapter 73 rates.",
           None, None, "Canada", ["procl-11048", "procl-11056", "csms-69606660"]),
        ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: only cast iron pays",
           f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. They do not apply to Section 232 goods (note 52(f)(1)), so in Chapter 73 they reach only the {nnon} cast-iron "
           "lines: cast-iron pipe, non-malleable cast fittings, cast-iron radiators, cookware and baths. USMCA goods are exempt.",
           None, "+10% to +12.5% (14 lines)", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
        ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
           "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It never applied to Section 232 goods (Proclamation 11012), so in Chapter 73 it had charged only the cast-iron lines.",
           "+10% (cast iron)", None, "All", ["procl-11012", "hts-chapter-99"]),
        ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: steel exempt, cast iron not",
           f"The 25% duty on goods of Brazil (9903.05.01) took effect. Section 232 goods are excluded (note 50(a)(vi)(1)), so it reaches only the {nnon} cast-iron lines of Chapter 73.",
           None, "+25% (14 lines)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
        ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032: 85% U.S.-melted test",
           "From June 8, 2026, a derivative article qualifies for the 10% rate (9903.82.06) when at least 85% of its steel content by weight was melted and poured in the United States (it had to be "
           "all of it), and new rates apply to industrial and mobile equipment derivatives outside Chapter 73. Chapter 73 rates (50% / 25%) did not change.",
           None, None, "All", ["procl-11032"]),
        ch("tw-auto-parts", "reference", "2026-05-01", "Effective", "Taiwan auto-parts rate of 15% (springs)",
           "Under the U.S.-Taiwan agreement, Taiwanese auto parts pay 15% in place of the base rate (9903.94.67), which covers the vehicle-part spring lines of 7320. Similar deal rates apply to the EU (August 1, 2025), "
           "Japan (September 16, 2025) and Korea (November 1, 2025); the UK rate is 10% (June 30, 2025).",
           None, "15% (in place of base)", "Taiwan", ["fr-2026-10571", "fr-2025-18660", "fr-2025-17908", "fr-2025-21940", "fr-2025-12060"]),
        ch("tech-corrections", "reference", "2026-04-29", "Published", "Commerce corrects the Section 232 annex; Tata Steel UK clarified",
           "Commerce added heading 9903.82.01 (articles on the lists that contain no steel, aluminum or copper pay no Section 232 duty) from April 6, 2026, and clarified that Tata Steel UK steel melted and poured "
           "in the Netherlands may count toward the UK's 95% test until January 1, 2028.",
           None, None, "United Kingdom", ["fr-2026-08297"]),
        ch("camx-procedures", "reference", "2026-04-23", "Effective", "Commerce opens the 25% route for Canadian and Mexican steel producers",
           f"Commerce set out how steel producers in Canada or Mexico that supply U.S. vehicle makers can apply for a reduction to 25% on quantities matching newly committed U.S. steel capacity. "
           f"Approved steel articles enter under 9903.82.18; in Chapter 73 that means the {nart} sheet piling, rail and pipe lines, not derivatives.",
           None, "+25% for authorized quantities", "Canada, Mexico", ["fr-2026-07987", "procl-10984"]),
        ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 rebuilt on full value: 50% or 25% (Proclamation 11021)",
           f"Proclamation 11021 replaced the earlier headings with 9903.82.02–9903.82.26, charged on the full customs value regardless of metal content. In Chapter 73, {n50 + nauto} lines stay at 50% "
           f"(9903.82.02) and {n25} household and wire lines (stoves, grills, steel radiators, cookware, sinks, hangers) move to 25% (9903.82.09). New lower rates: UK 25% or 15% with ≥95% UK-melted steel, "
           "10% for derivatives made of U.S.-melted steel. Manufacturing drawback is allowed only for the 25% list from trade-agreement partners; goods admitted to a foreign-trade zone must take privileged "
           "foreign status; the derivative inclusions process ended.",
           "+50% (steel content only for derivatives)", "+50% or +25% (full value)", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
        ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; Section 232 goods outside it",
           "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Proclamation 11012 says it does not apply in addition to Section 232 duties, so in Chapter 73 only the "
           "cast-iron lines paid it; USMCA goods were exempt.",
           None, "+10% (non-232 goods)", "All", ["procl-11012", "hts-chapter-99"]),
        ch("ieepa-end", "extraDuty", "2026-02-24", "Ended", "All IEEPA tariffs end",
           "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, "
           "and CBP stopped collecting them from 12:00 a.m. ET on February 24, 2026. Section 232 duties are not IEEPA duties and continued. For Chapter 73 the IEEPA duties had applied to the non-steel content "
           "of derivatives and to cast-iron goods.",
           "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
        ch("mhdv-parts", "extraDuty", "2025-11-01", "Effective", "Section 232 on medium- and heavy-duty vehicle parts (springs)",
           "Proclamation 10984 imposed 25% on medium- and heavy-duty truck parts (9903.74.08), which reaches the leaf-spring and suspension-spring lines of 7320 when used as truck parts. "
           "It also authorized Commerce to cut the Section 232 steel duty to as low as 25% for limited Canadian and Mexican quantities.",
           None, "+25%", "All", ["procl-10984", "csms-66665333"]),
        ch("inclusions-2025-08", "extraDuty", "2025-08-18", "Effective", "First derivative inclusions add pipe fittings and track material",
           "Commerce's first inclusions round added 7307.19.30 and 7307.19.90 (other cast fittings) and 7302.90.90 (other track material) to the derivative steel list, and 7308.20.00.35 to the derivative "
           "aluminum list, at the 50% rate (on the steel content until April 5, 2026).",
           None, "+50%", "All", ["fr-2025-15819"]),
        ch("s232-50", "extraDuty", "2025-06-04", "Effective", "Section 232 doubled to 50%; Chapter 73 charged on steel content",
           "Proclamation 10947 raised the steel duty from 25% to 50% (UK stayed at 25%) and, for Chapter 73 articles, applied it only to the value of the steel content; the non-steel content paid the "
           "reciprocal and other IEEPA duties. Drawback was ruled out. The steel-content basis ended April 5, 2026.",
           "+25%", "+50% (UK +25%)", "All except UK", ["procl-10947"]),
        ch("auto-parts", "extraDuty", "2025-05-03", "Effective", "Section 232 on automobile parts (springs)",
           "Proclamation 10908 imposed 25% on automobile parts (9903.94.05), including the leaf and suspension springs of 7320 when they are passenger-vehicle parts. USMCA-qualifying parts were exempt.",
           None, "+25%", "All", ["procl-10908", "procl-10925", "csms-64916652"]),
        ch("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariff excludes Section 232 steel",
           "Executive Order 14257 set the reciprocal tariffs from April 5, 2025 but excluded Section 232 steel articles and derivatives (Annex II); cast-iron lines paid it. Ended February 24, 2026.",
           None, "Steel exempt", "All except Canada, Mexico", ["eo-14257"]),
        ch("s232-derivatives", "extraDuty", "2025-03-12", "Effective", "Section 232 extended to Chapter 73 derivatives; all exemptions end",
           "Proclamation 10896 restored the full 25% on steel from Argentina, Australia, Brazil, Canada, Mexico, Korea, the EU, Japan, the UK and Ukraine, ended product exclusions, and extended the duty "
           "to derivative steel articles listed in its annex: most of Chapter 73 from welded shapes and track material through fittings, structures, containers, wire products, chain, nails, fasteners, "
           "springs, stoves, steel radiators, kitchenware, sinks and other articles (not cast-iron goods). For Chapter 73 derivatives the duty applied to the full value until June 3, 2025.",
           "+25% on pipe and rails, exemptions", "+25% on 7301–7326", "All", ["procl-10896"]),
        ch("ca-mx-ieepa", "reference", "2025-03-04", "Effective", "IEEPA duties on Canada and Mexico",
           "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods exempt from March 7, 2025. Section 232 steel was outside them from June 4, 2025. Ended February 24, 2026.",
           None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
        ch("cn-301-2024", "extraDuty", "2024-09-27", "Effective", "China Section 301: steel pipe and steel articles to 25%",
           "After its four-year review USTR moved Chinese steel and aluminum products to U.S. note 31 (9903.91.01) at 25%, which in Chapter 73 covers 234 lines, mainly the pipe, tube, rails and sheet piling of 7301–7306.",
           "0% to +25%", "+25%", "China", ["fr-2024-21217"]),
        ch("melt-pour", "reference", "2024-11-21", "Effective", "Country of melt and pour reported for steel imports",
           "Under Proclamation 10783, importers report the country where the steel was melted and poured on steel article imports (pipe, rails, sheet piling) from all countries from November 21, 2024, "
           "whether or not duty applies; from March 12, 2025 the field is mandatory in ACE for steel derivatives too.",
           None, None, "All", ["procl-10783", "csms-62582900", "csms-64366327"]),
        ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China Section 301 List 3 raised to 25%",
           "Most Chapter 73 lines from China have paid Section 301 since September 24, 2018 (List 3, 10%), raised to 25% from May 10, 2019; List 4A (7.5% since February 14, 2020) covers some others.",
           "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904"]),
        ch("nails-2020", "extraDuty", "2020-02-08", "Effective", "First steel derivatives: certain nails and staples",
           "Proclamation 9980 imposed 25% on derivative steel articles from February 8, 2020: certain nails, tacks and staples of 7317.00.30, 7317.00.55 and 7317.00.65, along with some vehicle stampings.",
           None, "+25%", "All except exempted countries", ["procl-9980"]),
        ch("s232-start", "extraDuty", "2018-03-23", "Effective", "Section 232 steel tariff begins on pipe, rails and sheet piling",
           "Proclamation 9705 imposed 25% on steel mill articles from March 23, 2018, which in Chapter 73 meant sheet piling (7301.10), rails and track material (7302.10, 7302.40, 7302.90) and seamless and welded pipe and tube (7304–7306).",
           None, "+25%", "All except temporarily exempted countries", ["procl-9705"]),
    ]
    changes += [ch(**x) for x in c["ADCVD_CHANGES"]]
    changes.sort(key=lambda x: x["date"], reverse=True)
    tu["changes"] = changes

    used = set()
    for e in tu["inEffect"]:
        used.update(e["sourceIds"])
    for x in tu["changes"]:
        used.update(x["sourceIds"])
    used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch73"])
    tu["sources"] = sorted([copy.deepcopy(SRC[i]) for i in used], key=lambda s: (s["published"], s["id"]), reverse=True)

    # ------------------------------------------------------------ industryAreas
    apply_industry_areas(c, cell_of)

    # ------------------------------------------------------------ tariffEngineering
    apply_engineering(c)

    # ------------------------------------------------------------ trade + FAQ
    apply_trade_and_faq(c)


def s301_desc(c, country):
    """The 2026 Section 301 treatment of the cast-iron lines for a matrix country (from 7303 India-like cells)."""
    ROW = c["ROW"]
    for cell in ROW[country]["cells"].values():
        for bb in cell["withoutUsmca"]["breakdown"]:
            if "7303.00.00.30" in bb["lines"]:
                return bb["extra"]
    return None


def apply_industry_areas(c, cell_of):
    d, SRC = c["d"], c["SRC"]
    ia = d["industryAreas"]
    nnon, nauto = len(c["NON232"]), len(c["AUTO"])
    ia["h1"] = "HTS Chapter 73: Articles of Iron or Steel — Tariff Rates by Country"
    ia["seo"] = {
        "title": "Steel Pipe, Fastener & Steel Article Tariffs by Country: Canada, Mexico, China, UK, EU, Japan (HTS Ch. 73) | KoalaGains",
        "shortDescription": "The total U.S. tariff on Chapter 73 iron and steel articles by country and product: 50% Section 232 on pipe, structures, fasteners and wire products from every country, "
        "25% on grills, cookware and sinks, China 75%+, Canadian structural parts 100%, UK lower rates with UK-melted steel, cast iron outside Section 232.",
        "keywords": [
            "steel tariffs by country",
            "steel tariffs canada",
            "steel tariffs mexico",
            "uk steel tariffs",
            "tariffs on steel from china to usa",
            "steel derivative tariff canada",
            "steel pipe tariffs",
            "section 232 steel tariffs mexico",
            "steel tariffs eu",
            "us steel tariffs japan",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. For most of Chapter 73 the answer is "
        "almost the same everywhere: **50%** plus the base rate, because Section 232 has no country exemptions and is collected on top of FTA and USMCA rates. Stoves, grills, steel radiators, "
        "kitchenware, sinks and some wire articles pay **25%** instead. China pays **25% or 7.5% more** under Section 301, Canada's structural parts (7308.90) pay another 50% under Section 338, "
        "and UK goods made of UK-melted steel pay 25% or 15% (the cells show the default).\n\n"
        f"The {nnon} cast-iron lines (cast-iron pipe, non-malleable fittings, radiators, cookware and baths) are the exception: outside Section 232, they pay the base rate plus the 2026 Section 301 "
        "duty (10% or 12.5%) for most of the 60 economies, nothing extra for USMCA goods, and more for China and Brazil. The table does **not** include antidumping or countervailing duties (see Tariff updates)."
    )
    BY = c["ADCVD_BY_COUNTRY"]

    def rate301(country):
        e = s301_desc(c, country)
        if e is None:
            return None
        if "in place of base" in e:
            pct = e.split("%")[0]
            return f"{pct}% in place of the base rate when lower"
        return e.replace("+", "") if e.startswith("+") else e

    def std(country, code, extra=""):
        r = rate301(country)
        s = (
            f"50% Section 232 (9903.82.02) on pipe, structures, fasteners, wire products and other steel articles; 25% (9903.82.09) on stoves, grills, cookware, sinks and hangers. "
            f"Cast-iron lines: Section 301 ({code}), {r}."
        )
        return " ".join(x for x in [s, extra, BY.get(country.split(" (")[0], "")] if x)

    R = {
        "China": ("75% or more on pipe, structures, fasteners, wire products and most steel articles: 50% Section 232 (9903.82.02) + 25% Section 301 (note 31 on pipe and rails, List 2 or 3 on the rest); "
                  "57.5% on the List 4A lines (7.5%). Stoves, grills, cookware and sinks: 25% Section 232 + 25% or 7.5% (about 50%). Cast-iron lines: 12.5% (9903.05.31) + 25% List 3. "
                  + BY.get("China", ""), ["procl-11021", "fr-2024-21217", "fr-2018-20610", "fr-2019-17865", "fr-2026-15181", "hts-now"]),
        "Canada": ("50% or 25% Section 232 with or without a USMCA claim: Canada's exemption ended March 12, 2025 and note 16(b) collects it on top of the USMCA rate. Structural parts 7308.90.30, "
                   ".60 and .95 pay another 50% under Section 338 (9903.03.14): 100%. Commerce-authorized pipe and rail (9903.82.18) pay 25%. Cast-iron lines pay 10% Section 301 (9903.05.29) unless "
                   "USMCA is claimed. " + BY.get("Canada", ""), ["procl-11021", "procl-10896", "procl-11065", "fr-2026-07987", "fr-2026-15181", "hts-now"]),
        "Mexico": ("50% or 25% Section 232 with or without a USMCA claim: Mexican steel has had no exemption since March 12, 2025. Commerce-authorized pipe and rail (9903.82.18) pay 25%. "
                   "Cast-iron lines pay 10% Section 301 (9903.05.55) unless USMCA is claimed. " + BY.get("Mexico", ""), ["procl-11021", "procl-10896", "fr-2026-07987", "fr-2026-15181", "hts-now"]),
        "United Kingdom": ("50% / 25% shown; with at least 95% UK-melted steel the rates are 25% (9903.82.04) and 15% (9903.82.05) (note 16(d)). Cast-iron lines: 10% Section 301 (9903.05.81). "
                           "Vehicle-part springs 10% in place of the base rate. " + BY.get("United Kingdom", ""), ["procl-11021", "fr-2026-08297", "eo-14309", "fr-2026-15181", "fr-2025-12060", "hts-now"]),
        "Brazil": ("50% or 25% Section 232; the Brazil Section 301 duty does not apply to Section 232 goods (note 50(a)(vi)(1)). Cast-iron lines pay 25% (9903.05.01) + 12.5% (9903.05.27). "
                   + BY.get("Brazil", ""), ["procl-11021", "fr-2026-14542", "fr-2026-15181", "hts-now"]),
        "Russia": ("Column 2 rate, or 70% in its place on the 130 note 30(d) lines (9903.90.09), plus 50% (9903.82.14) or 25% (9903.82.16) Section 232: up to 120%. Cast-iron lines: column 2 + 12.5% Section 301.",
                   ["procl-11021", "procl-10523", "fr-2026-15181", "hts-now"]),
    }
    EU_LIKE = {"Germany": "9903.05.39", "Italy": "9903.05.39", "France": "9903.05.39", "Spain": "9903.05.39", "Netherlands": "9903.05.39", "Japan": "9903.05.49", "South Korea": "9903.05.71", "Taiwan": "9903.05.76"}
    DEAL = {"Germany": "EU", "Italy": "EU", "France": "EU", "Spain": "EU", "Netherlands": "EU", "Japan": "Japan", "South Korea": "Korea", "Taiwan": "Taiwan"}
    for x in ia["countries"]:
        name = x["country"]
        if name == "Any other country":
            x["rule"]["label"] = (
                "At least 50% on Section 232 steel articles and most derivatives, and 25% on the household list, from every other country (no exemptions). Cast-iron lines: base rate only, or up to "
                "12.5% more under the 2026 Section 301 actions. Column 2 countries (Belarus, Cuba, North Korea) pay more; Nicaragua's Section 301 duty starts January 1, 2027."
            )
            x["rule"]["sourceIds"] = ["procl-11021", "fr-2026-15181", "fr-2025-23892", "hts-now"]
            continue
        if name in R:
            x["rule"]["label"], x["rule"]["sourceIds"] = R[name][0].strip(), R[name][1]
            continue
        code = (x["rule"]["label"].split("Section 301 (2026, 60 economies) (")[1].split(")")[0]) if "Section 301 (2026, 60 economies) (" in x["rule"]["label"] else EU_LIKE.get(name)
        extra = ""
        if name in DEAL:
            extra = f"Vehicle-part springs pay the {DEAL[name]} deal rate of 15% in place of the base rate."
        x["rule"]["label"] = std(name, code, extra).strip()
        x["rule"]["sourceIds"] = ["procl-11021", "procl-10896", "fr-2026-15181", "hts-now"] + ([{"EU": "fr-2025-18660", "Japan": "fr-2025-17908", "Korea": "fr-2025-21940", "Taiwan": "fr-2026-10571"}[DEAL[name]]] if name in DEAL else [])
    for x in ia["countries"]:
        assert "TODO" not in x["rule"]["label"], x["country"]
        x["rule"]["sourceIds"] = list(dict.fromkeys(x["rule"]["sourceIds"] + [s for s in c["ADCVD_COUNTRY_SOURCES"].get(x["country"].split(" (")[0], [])]))
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "Section 232 is shown at its default rates: 50% (9903.82.02) or 25% (9903.82.09). UK goods with at least 95% UK-melted steel pay 25% or 15% (9903.82.04, .05), derivatives with at least 85% U.S.-melted steel pay 10% "
        "(9903.82.06), and Commerce-authorized Canadian or Mexican pipe and rail pay 25% (9903.82.18); the cells do not show these variants.",
        f"The {nauto} leaf- and suspension-spring lines (7320.10, 7320.20.10) show both answers: the vehicle-parts duty when they are auto or truck parts, the 50% metals duty otherwise.",
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
        "Antidumping and countervailing duties are not included. They apply company by company to many pipe and tube, fitting, nail, staple, wire, hanger, rack, keg, cylinder, sink and tower imports.",
        "Entry rules: a Commerce SIMA steel import license for sheet piling, rails and pipe (7301.10, 7302, 7304–7306), and the country of melt and pour for every Section 232 entry (19 CFR part 360; CBP CSMS 64366327).",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 2, 16, 20, 29, 30, 31, 33, 35, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 16(c) lists every Chapter 73 line except the cast-iron ones: "
        f"(iii) steel articles (7301.10, 7302.10, 7302.40, 7302.90, 7304–7306), (iv) derivatives at 50%, (vii) derivatives at 25%, and 7308.20.00.35 under (ii); the 15% metal-weight test of note 16(c) "
        "does not apply to Chapter 73. No country exemption exists, and note 16(b) collects the duty on top of FTA rates. Section 232 goods are excluded from the 2026 Section 301 duties (note 52(f)(1)), "
        "the Brazil duty (note 50(a)(vi)(1)) and the expired Section 122 surcharge, but not from China Section 301 (notes 20, 31), Canada Section 338 since September 15, 2026 (note 51) or the 2027 Nicaragua "
        f"duty (note 29). Of the {nnon} cast-iron lines none is on the note 52(b) general exemption list. Civil aircraft relief (notes 2(v), 35, 51(d), 52(d)) and the 9903.82.01 no-metal heading need the importer's confirmation and are not applied."
    )
    ia_ids = {"hts-now"}
    for x in ia["countries"]:
        ia_ids.update(x["rule"]["sourceIds"])
    for sid in ia_ids:
        assert sid in SRC, sid
    ia["sources"] = sorted([copy.deepcopy(SRC[i]) for i in ia_ids], key=lambda s: (s["published"], s["id"]), reverse=True)


def apply_engineering(c):
    d, SRC = c["d"], c["SRC"]
    te = d["tariffEngineering"]
    CH99 = c["CH99_PDF"]
    FR11021 = SRC["procl-11021"]["url"]

    def e(sec):
        return f"https://www.ecfr.gov/current/title-19/section-{sec}"

    def ep(part):
        return f"https://www.ecfr.gov/current/title-19/part-{part}"

    te["h1"] = "HTS Chapter 73: Articles of Iron or Steel — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Steel Pipe & Steel Articles: SIMA License, Melt-and-Pour, Section 232 Entry & Ways to Lower Duty (HTS Ch. 73) | KoalaGains",
        "shortDescription": "The rules for each HTS Chapter 73 line: SIMA steel import license for pipe and rails, country of melt and pour, Section 232 headings, pipe and cylinder marking, DOT cylinder "
        "specs, AD/CVD scope, plus the legal ways to pay less: U.S.-melted steel (10%), UK-melted steel, the Canada/Mexico 25% route, cast iron, drawback and correct classification.",
        "keywords": [
            "tariff engineering",
            "steel import license",
            "SIMA steel license",
            "section 232 steel csms",
            "steel derivative tariff calculation",
            "melt and pour steel",
            "steel tariff exemptions",
            "steel pipe country of origin marking",
        ],
    }
    te["intro"] = (
        "For steel articles the paperwork is part of the duty. Pipe, rails and sheet piling (7301.10, 7302, 7304–7306) need a **Commerce SIMA steel import license**, every Section 232 entry reports "
        "the **country where the steel was melted and poured**, and the Section 232 heading (9903.82.02, .09, or a lower-rate heading) is reported next to the Chapter 73 line, with the duty charged on the "
        "full value and no FTA reduction. Pipe, fittings, gas cylinders and manhole castings must be **permanently marked** with their country of origin.\n\n"
        "The legal ways to pay less: derivatives made of **U.S.-melted steel** (10%), **UK-melted** steel (25% or 15%), Commerce-authorized Canadian or Mexican pipe (25%), **cast iron** where it is the "
        "right material (outside Section 232), avoiding **Chinese origin**, **drawback** on the 25% list from trade-agreement partners, and checking **AD/CVD scope** before buying. The product exclusion "
        "process and country quotas are gone. Each rule and lever links to its regulation or proclamation."
    )
    te["regulationsAsOf"] = c["ECFR_AS_OF"]
    te["levers"] = [
        {
            "id": "us-melted",
            "title": "Use U.S.-melted steel in derivative articles",
            "saves": "40 points on the 50% list (10% instead of 50%) or 15 points on the 25% list (9903.82.06)",
            "appliesTo": "Derivative articles of note 16(c)(iv) and (vii): fittings, structures, containers, wire products, chain, nails, fasteners, springs, stoves, cookware, sinks and other articles; not the pipe, rails and sheet piling of (iii)",
            "document": "Mill certificates and supplier declarations showing the melt-and-pour country of the steel used, enough to prove at least 85% (by weight) was melted and poured in the United States; reported in ACE.",
            "caveat": "The 85% test applies from June 8, 2026 (before that, all of it). Origin of the article and the base rate do not change; China's Section 301 duty still applies to Chinese-made goods.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(e), heading 9903.82.06", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": SRC["procl-11032"]["url"]},
            ],
        },
        {
            "id": "uk-melt",
            "title": "Buy UK goods made of UK-melted steel",
            "saves": "Half the Section 232 duty on the 50% list (25%, 9903.82.04) and 10 points on the 25% list (15%, 9903.82.05)",
            "appliesTo": "All Section 232 lines of Chapter 73, for products of the United Kingdom",
            "document": "Mill test certificates and melt-and-pour reporting showing that at least 95% of the steel was melted and poured in the UK (Tata Steel UK steel melted in the Netherlands counts until January 1, 2028).",
            "caveat": "Origin must be the UK and the 95% test must be met; otherwise 50% or 25%. No UK steel quota has been set up.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d)", "url": CH99},
                {"label": "Proclamation 11021 (91 FR 18201)", "url": FR11021},
                {"label": "Commerce notice on Tata Steel UK (91 FR 23056)", "url": SRC["fr-2026-08297"]["url"]},
            ],
        },
        {
            "id": "camx-25",
            "title": "Canada or Mexico: the Commerce-authorized 25% rate for pipe and rail",
            "saves": "Half the Section 232 duty (25% instead of 50%) on authorized quantities",
            "appliesTo": "The note 16(c)(iii) steel articles of Canada or Mexico (7301.10, 7302.10, 7302.40, 7302.90, 7304–7306) that qualify for USMCA and were melted and poured in Canada or Mexico",
            "document": "Commerce authorization for the producer (submission under the April 23, 2026 procedures), a USMCA certification of origin, and entry under heading 9903.82.18.",
            "caveat": "Only for producers that supply U.S. vehicle makers and commit to new U.S. steel capacity, and only up to the authorized quantity. Derivative articles cannot use it.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(h), heading 9903.82.18", "url": CH99},
                {"label": "Proclamation 10984, clause 13 (90 FR 48451)", "url": SRC["procl-10984"]["url"]},
                {"label": "Commerce procedures (91 FR 21790)", "url": SRC["fr-2026-07987"]["url"]},
            ],
        },
        {
            "id": "cast-iron",
            "title": "Cast iron where it is the right material",
            "saves": "The whole Section 232 duty (50% or 25%) on cast-iron pipe, non-malleable fittings, radiators, cookware and baths",
            "appliesTo": "7303, 7307.11, 7322.11, 7323.91, 7323.92 and 7324.21",
            "document": "Material specifications showing the article is cast iron as defined in Chapter 73 note 1 (cast, iron predominating, not meeting the steel composition of Chapter 72 note 1(d)); a CBP binding ruling when in doubt.",
            "caveat": "Classification follows the product: ductile and malleable cast fittings (7307.19) and other castings of 7325 are on the Section 232 lists. Cast-iron lines still pay the 2026 Section 301 duty (10%–12.5%) for most countries.",
            "citations": [
                {"label": "HTSUS Chapter 73, note 1", "url": c["CH73_PDF"]},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c)", "url": CH99},
                {"label": "19 CFR part 177 (rulings)", "url": ep(177)},
            ],
        },
        {
            "id": "origin",
            "title": "Avoid Chinese origin",
            "saves": "25% (or 7.5%) of the value: Chinese goods pay Section 301 on top of Section 232 (75% or more on most of the chapter)",
            "appliesTo": "Almost every Chapter 73 line, for goods of China",
            "document": "Production records showing where the article was made; origin follows the last substantial transformation (for goods processed in Canada or Mexico, the tariff-shift rules of 19 CFR 102.20). Ask CBP for a binding ruling.",
            "caveat": "Third-country processing does not change the Section 232 rate (it applies everywhere) and can fall under AD/CVD circumvention findings.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20 and 31", "url": CH99},
                {"label": "19 CFR 102.20", "url": e("102.20")},
                {"label": "19 CFR part 177 (rulings)", "url": ep(177)},
            ],
        },
        {
            "id": "usmca",
            "title": "Claim USMCA on the cast-iron lines",
            "saves": "The 10% Section 301 duty on Canadian and Mexican cast-iron pipe, fittings, radiators, cookware and baths (9903.05.93, 9903.05.94)",
            "appliesTo": "The 14 cast-iron lines, for originating goods of Canada or Mexico",
            "document": "A USMCA certification of origin from the importer, exporter or producer, available to CBP on request.",
            "caveat": "A USMCA claim does not reduce Section 232 (note 16(b)) or the Section 338 duty on Canadian 7308.90 parts.",
            "citations": [
                {"label": "19 CFR 182.12", "url": e("182.12")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99},
            ],
        },
        {
            "id": "drawback",
            "title": "Drawback on the 25% list from trade-agreement partners",
            "saves": "Up to 99% of the Section 232 duty on goods of the 25% list that are used in exported products, plus the base rate and other ordinary duties on any line",
            "appliesTo": "Annex I-B (25% list) goods of the UK, EU, Japan, Korea, Mexico or Canada whose steel was melted in one of them and that are not AD/CVD merchandise; ordinary duties on all lines",
            "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
            "caveat": "No drawback of Section 232 duty on the 50% list (pipe, fittings, fasteners and most of the chapter). AD/CVD are never refundable (19 CFR 191.3(b)(3)).",
            "citations": [
                {"label": "Proclamation 11021, clauses 13–14", "url": FR11021},
                {"label": "19 CFR part 191", "url": ep(191)},
                {"label": "19 CFR 191.3", "url": e("191.3")},
            ],
        },
        {
            "id": "adcvd-scope",
            "title": "Check AD/CVD scope before you buy",
            "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
            "appliesTo": "Pipe and tube, fittings, nails, staples, wire products, hangers, racks, kegs, cylinders, sinks and towers (see the AD/CVD rules)",
            "document": "The order's written scope (it, not the HTS number, decides) and the producer's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
            "caveat": "A product in scope pays the cash deposit even if entered under another HTS line. Rates change with each administrative review.",
            "citations": [
                {"label": "19 CFR 351.225 (scope rulings)", "url": e("351.225")},
            ],
        },
    ]
    rules = [
        {"id": "sima", "agency": "Commerce (ITA)", "title": "Steel import license (SIMA) before filing the entry summary for sheet piling, rails and track material, and seamless or welded pipe and tube (7301.10, 7302.10, 7302.40, 7302.90, 7304–7306); not needed for informal entries under $2,000",
         "citations": [{"label": "19 CFR 360.101", "url": e("360.101")}, {"label": "19 CFR 360.103", "url": e("360.103")}, {"label": "ITA: SIMA products and HTS codes", "url": SRC["ita-sima-hts"]["url"]}]},
        {"id": "melt-pour", "agency": "CBP", "title": "Report the country where the steel was melted and poured on every Section 232 steel and derivative entry (mandatory since March 12, 2025)",
         "citations": [{"label": "CBP CSMS # 62582900", "url": SRC["csms-62582900"]["url"]}, {"label": "CBP CSMS # 64366327", "url": SRC["csms-64366327"]["url"]}]},
        {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report 9903.82.02 (50%) or 9903.82.09 (25%), or the UK (.04, .05), U.S.-melted (.06), Russia (.14–.16) or authorized Canada/Mexico (.18) heading, with the Chapter 73 line; duty on the full value, on top of any FTA rate",
         "citations": [{"label": "CBP CSMS # 68253075", "url": SRC["csms-68253075"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
        {"id": "ftz", "agency": "CBP", "title": "Section 232 goods admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
         "citations": [{"label": "19 CFR 146.41", "url": e("146.41")}, {"label": "Proclamation 11021, clause 12", "url": FR11021}]},
        {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container (19 CFR part 134)",
         "citations": [{"label": "19 CFR 134.11", "url": e("134.11")}, {"label": "19 CFR part 134", "url": ep(134)}]},
        {"id": "marking-pipe", "agency": "CBP", "title": "Steel and stainless pipe and pipe fittings (and cast or malleable iron fittings) must be marked with the English name of the origin country by die stamping, cast-in-mold lettering, etching, engraving or continuous paint stenciling; no J-list exception",
         "citations": [{"label": "19 U.S.C. 1304(c)", "url": SRC["usc-1304"]["url"]}]},
        {"id": "marking-cylinders", "agency": "CBP / PHMSA", "title": "Compressed gas cylinders: permanent origin marking (19 U.S.C. 1304(d)), and DOT-specification cylinders must be made, tested and inspected to 49 CFR part 178 (inspection by an approved independent agency)",
         "citations": [{"label": "19 U.S.C. 1304(d)", "url": SRC["usc-1304"]["url"]}, {"label": "49 CFR 178.35", "url": "https://www.ecfr.gov/current/title-49/section-178.35"}]},
        {"id": "marking-castings", "agency": "CBP", "title": "Manhole rings, frames and covers, catch basin and trench grates, utility boxes and similar castings must be marked with the origin country on the top surface, visible after installation",
         "citations": [{"label": "19 U.S.C. 1304(e)", "url": SRC["usc-1304"]["url"]}]},
        {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 70% in lieu of column 2 on note 30(d) subheadings, plus Section 232 (9903.82.14 / .16)",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10523 (88 FR 13277)", "url": SRC["procl-10523"]["url"]}]},
    ]
    for rid, agency, title, cites in c["ADCVD_RULES"]:
        rules.append({"id": rid, "agency": agency, "title": title, "citations": [{"label": lab, "url": SRC[sid]["url"]} for lab, sid in cites]})
    te["rules"] = rules
    rule_ids = {r["id"] for r in rules}

    ART = set(c["ART"])
    S25 = set(c["S232_25"])
    NON = set(c["NON232"])
    AUTO = set(c["AUTO"])
    ADH = c["ADCVD_BY_HEADING"]  # heading -> list of adcvd rule ids
    GROUP_NOTES = {
        "7301": "Sheet piling is a Section 232 steel article (50%, SIMA license); welded shapes are 50% derivatives.",
        "7302": "Section 232 steel articles at 50%; rails, fish-plates and other track material need a SIMA license (switch blades and crossing frogs do not).",
        "7303": "Outside Section 232. Pays the base rate (Free) plus the 2026 Section 301 duty for most countries; cast-iron soil pipe from China is under AD/CVD orders.",
        "7304": "Section 232 steel articles at 50% with a SIMA license; OCTG, line pipe, standard and mechanical tubing carry many AD/CVD orders.",
        "7305": "Section 232 steel articles at 50% with a SIMA license; large-diameter welded pipe is under AD/CVD orders.",
        "7306": "Section 232 steel articles at 50% with a SIMA license; circular welded, rectangular, standard, line pipe, OCTG and stainless welded pipe carry AD/CVD orders.",
        "7307": "50% derivatives except non-malleable cast fittings (7307.11, outside Section 232). Fittings must be permanently marked; several fitting types are under AD/CVD orders.",
        "7308": "50% derivatives; Canadian 7308.90 parts also pay 50% Section 338. Wind towers carry AD/CVD orders.",
        "7309": "50% derivatives.",
        "7310": "50% derivatives; the AD/CVD orders on refillable stainless steel kegs from China and Mexico were revoked in 2024.",
        "7311": "50% derivatives; DOT specifications and permanent origin marking for gas cylinders; steel propane cylinders from China and Thailand carry AD/CVD orders.",
        "7312": "50% derivatives; prestressed concrete steel wire strand carries AD/CVD orders.",
        "7313": "50% derivatives.",
        "7314": "50% derivatives.",
        "7315": "50% derivatives.",
        "7316": "50% derivatives.",
        "7317": "50% derivatives; steel nails and collated staples carry AD/CVD orders from many countries.",
        "7318": "50% derivatives; base rates up to 12.5%. U.S.-melted steel brings the Section 232 part to 10%.",
        "7319": "50% derivatives.",
        "7320": "50% derivatives, or the auto/truck parts duty for vehicle springs.",
        "7321": "25% list (9903.82.09); drawback possible for trade-agreement partners.",
        "7322": "Steel radiators on the 25% list; cast-iron radiators (7322.11) outside Section 232.",
        "7323": "Steel and stainless on the 25% list; cast-iron cookware (7323.91, 7323.92) outside Section 232.",
        "7324": "Steel and stainless on the 25% list; cast-iron baths (7324.21) outside Section 232; drawn stainless sinks from China carry AD/CVD.",
        "7325": "50% derivatives (meter boxes 25%); manhole covers and similar castings must be marked on the top surface.",
        "7326": "Mostly 50% derivatives; hangers, ties, ladders and some wire articles 25%. Garment hangers and steel racks carry AD/CVD orders.",
    }
    for g in te["groups"]:
        h = g["heading"]
        g["label"] = G[h][0]
        rr = ["marking"]
        if h in ("7301", "7302", "7304", "7305", "7306"):
            rr = ["sima"] + rr
        if h != "7303":
            rr = ["melt-pour", "s232-entry", "ftz"] + rr
        if h in ("7303", "7304", "7305", "7306", "7307"):
            rr.append("marking-pipe")
        if h == "7311":
            rr.append("marking-cylinders")
        if h == "7325":
            rr.append("marking-castings")
        rr += ADH.get(h, [])
        rr.append("russia")
        g["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        g["note"] = GROUP_NOTES[h]
    for ln in te["lines"]:
        h = ln["hts"][:4]
        hts = ln["hts"]
        rr = ["marking"]
        if hts in ART:
            rr = ["sima"] + rr
        if hts not in NON:
            rr = ["melt-pour", "s232-entry", "ftz"] + rr
        if h in ("7303", "7304", "7305", "7306", "7307"):
            rr.append("marking-pipe")
        if h == "7311":
            rr.append("marking-cylinders")
        if hts.startswith("7325.10"):
            rr.append("marking-castings")
        rr += ADH.get(h, [])
        ln["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        lv = []
        if hts in NON:
            lv += ["usmca"]
        elif hts in ART:
            lv += ["uk-melt", "camx-25"]
        else:
            lv += ["us-melted", "uk-melt"]
        if hts not in NON and h in ("7307", "7322", "7323", "7324"):
            lv.append("cast-iron")
        lv.append("origin")
        if hts in S25:
            lv.append("drawback")
        if ADH.get(h):
            lv.append("adcvd-scope")
        ln["leverIds"] = lv
    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings and lists change often, and AD/CVD rates are company-specific and "
        "change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
    )


def apply_trade_and_faq(c):
    from trade73 import apply_trade

    apply_trade(c)
