"""Writer text for Chapter 82. apply_text(ctx) fills every page of the generated file in place."""
import copy

from groups82 import G

SHORT = "Tools, Cutlery, Spoons and Forks of Base Metal"
SET_RATE = "The rate of duty applicable to that article in the set subject to the highest rate of duty"


def apply_text(c):
    d, SRC = c["d"], c["SRC"]
    o, tu = d["overview"], d["tariffUpdates"]
    LINE, ROW = c["LINE"], c["ROW"]
    ASOF = c["ASOF"]
    n25, neq, nnon, nca, nru = len(c["S25"]), len(c["EQ"]), len(c["NON"]), len(c["CA338"]), len(c["RU35"])
    n232 = n25 + neq

    def cell_of(country, line, side="withoutUsmca"):
        for cell in ROW[country]["cells"].values():
            x = cell.get(side)
            if not x:
                continue
            for bb in x["breakdown"]:
                if line in bb["lines"]:
                    return bb
        raise KeyError((country, line))

    c["cell_of"] = cell_of

    # ------------------------------------------------------------ groups
    for pg in o["productGroups"]:
        label, short, blurb, ex = G[pg["heading"]]
        pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
    for g in d["industryAreas"]["groups"]:
        g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

    # ------------------------------------------------------------ overview
    o["h1"] = f"HTS Chapter 82: {SHORT} — Tariff Rates"
    o["seo"] = {
        "title": "HTS Chapter 82 Tariffs: Hand Tools, Knives, Cutlery, Saw Blades & Drill Bits — Duty Rates 2026 | KoalaGains",
        "shortDescription": f"Searchable U.S. duty table for all {len(LINE)} HTS Chapter 82 lines: hand tools, wrenches, saw blades, drill bits, carbide inserts, knives, scissors, razors and flatware. "
        "Knives and flatware pay 25% Section 232; other tools pay the 2026 Section 301 duty; China adds 25%; diamond sawblades carry AD duties.",
        "keywords": [
            "HTS Chapter 82",
            "chapter 82 hts code",
            "hand tools tariff code",
            "tariffs on hand tools",
            "knife tariff code",
            "knives tariffs",
            "cutlery tariff code",
            "stainless steel flatware tariff code",
            "hs code 8205",
            "hs code 8207",
            "hs code 8211",
            "Tools, implements, cutlery, spoons and forks, of base metal",
        ],
    }
    cn_l3, cn_4a = len(c["CN_L3"]), len(c["CN_4A"])
    o["stats"][2]["note"] = (
        f"Section 232 derivative steel at 25% (9903.82.09): {n25} (knives, flatware, vises and clamps, some edged tools, pipe and bolt cutters, diamond sawblade cores); "
        f"Section 232 equipment rate, 15% total (9903.82.10): {neq}; 2026 Section 301 on the other {nnon} lines (60 economies) and Brazil Section 301. "
        f"China Section 301 List 3: {cn_l3}, List 4A: {cn_4a}; Canada Section 338: {nca}; Russia 35% in lieu of column 2: {nru}"
    )
    ndut = int(o["stats"][1]["value"].split(" of ")[0])
    o["intro"] = (
        "Chapter 82 covers tools and cutlery of base metal: garden and farm hand tools, saws and saw blades, files and pliers, wrenches and sockets, hammers, screwdrivers, vises and other "
        "hand tools, tool sets, interchangeable tools such as drill bits, dies and milling cutters, machine knives, carbide inserts, hand-operated kitchen appliances, knives, razors, "
        f"scissors, clippers, and spoons, forks and other flatware. {len(LINE) - ndut} of the {len(LINE)} lines are **Free** under the general rate; the rest pay up to 12% "
        "(slip-joint pliers) or a few cents each plus a percentage (knives, scissors, flatware). Sets pay **the rate of the highest-rated article in the set**.\n\n"
        f"Two systems decide the extra duty. **{n25} lines are Section 232 derivative steel articles at 25% of the full value** (9903.82.09) from every country, on top of any FTA or "
        "USMCA rate: all knives (8211) and flatware (8215), vises and clamps, iron or steel hand tools of 8205.59.55, pipe and bolt cutters of 8203.40.60 and diamond sawblade cores. "
        f"Three die and press-tool lines pay a **15% total** Section 232 rate as industrial equipment. The other **{nnon} lines** (wrenches, pliers, hammers, saw blades, drill bits, carbide "
        "inserts, scissors, razors) are outside Section 232 and pay the **2026 Section 301** duty instead: 10% or 12.5% for most of the 60 economies, 10% or 12.5% *in place of* "
        "the base rate for EU, Japanese, Korean, Swiss and Taiwanese goods, nothing extra for USMCA goods.\n\n"
        "China pays another **25%** (List 3) or **7.5%** (List 4A) under Section 301 on most lines; Canadian wrenches, pliers, saw blades, carbide inserts, tool sets and razors pay "
        "**50%** under Section 338 even with a USMCA claim. Chinese **diamond sawblades** and **heavy forged hand tools** carry antidumping duties set company by company; "
        "they are not part of this table or the tariff calculator (see Tariff updates)."
    )

    ex = [
        ("China", "8211.92.20.00", "0.8¢ each + 37.1%"),
        ("Japan", "8211.92.20.00", "0.8¢ each + 29.6%"),
        ("Taiwan", "8204.20.00.00", "10%"),
        ("China", "8204.20.00.00", "46.5%"),
        ("Canada", "8209.00.00.30", "64.6%"),
        ("China", "8202.39.00.10", "37.5%"),
        ("Germany", "8207.30.60.95", "15%"),
        ("China", "8211.10.00.00", SET_RATE + " + 25%"),
        ("Vietnam", "8215.99.30.00", "39%"),
    ]
    for country, line, total in ex:
        assert line in LINE, line
        assert cell_of(country, line)["total"] == total, (country, line, cell_of(country, line)["total"])
    assert cell_of("Canada", "8209.00.00.30", "withUsmca")["total"] == "50%"
    o["workedExamples"] = [
        {
            "title": "$50,000 of kitchen knives from China or Japan",
            "line": "8211.92.20.00",
            "body": "Kitchen knives with plastic handles carry **0.8¢ each + 4.6%**. They are Section 232 derivative steel articles, so they pay **+25% of the full value** (9903.82.09) from any "
            "country. From Japan that is 0.8¢ each + 29.6%: about $14,800 on $50,000 plus 0.8¢ a knife; the 2026 Section 301 duty on Japan does not apply to Section 232 goods (note 52(f)(1)). "
            "From China, List 4A adds 7.5% (9903.88.15): **0.8¢ each + 37.1%**.",
        },
        {
            "title": "Socket wrenches from Taiwan, China or Canada",
            "line": "8204.20.00.00",
            "body": "Base rate **9%**; wrenches are not on the Section 232 lists. From Taiwan the 2026 Section 301 rate is **10% in place of** the base rate (9903.05.76): **10%**. "
            "From China: 9% + 25% List 3 + 12.5% (9903.05.31) = **46.5%**. From Canada: **50%** under Section 338 (9903.03.14) even with a USMCA certificate, or 69% without one "
            "(9% + 10% + 50%).",
        },
        {
            "title": "A Chinese knife set, priced by its highest-rated knife",
            "line": "8211.10.00.00",
            "body": "Sets of 8211.10 have no rate of their own: they pay **the rate of the knife in the set with the highest rate**, converted to an ad valorem equivalent where it is per-unit "
            "(Chapter 82 additional U.S. note 3), on the value of the whole set, plus **25%** Section 232 (8211.10 is on the list). In the tariff calculator you enter the 10-digit line of "
            "that knife, e.g. 8211.92.20.00 (0.8¢ each + 4.6%); the calculator applies its rate to the set's value and quantity and adds the set line's own Chapter 99 duties. "
            "8211.10 is on no China Section 301 list, so a Chinese set pays the knife's rate + 25%.",
        },
        {
            "title": "Diamond saw blades from China",
            "line": "8202.39.00.10",
            "body": "Free at base and not on the Section 232 list (only the blade cores, 8202.39.00.40, are). China pays 25% List 3 + 12.5% 2026 Section 301: **37.5%**. "
            "On top comes the **antidumping duty** of the diamond sawblades order (A-570-900), at the producer's cash-deposit rate; Commerce found in July 2026 that dumping margins "
            "up to 164.09% would likely recur without the order.",
        },
        {
            "title": "Carbide inserts from Canada, with or without USMCA",
            "line": "8209.00.00.30",
            "body": "Base rate **4.6%**, Free under USMCA. Carbide inserts are on the Section 338 list (note 51(b)(3)), which applies even to USMCA goods: **50%** with a USMCA claim, "
            "**64.6%** without (4.6% + 10% Section 301 + 50%).",
        },
        {
            "title": "Press-tool parts from Germany",
            "line": "8207.30.60.95",
            "body": "Base rate 2.9%, but this line is a Section 232 fixed-industrial-equipment derivative: the duty is topped up to **15% in total** (9903.82.10), from every country. "
            "With at least 85% U.S.-melted steel the total is 10% (9903.82.07). From January 1, 2028 the line moves to the 25% Section 232 rate (Proclamation 11021).",
        },
        {
            "title": "Stainless steel spoons from Vietnam",
            "line": "8215.99.30.00",
            "body": "Stainless spoons valued under 25¢ each pay **14%**, plus **25%** Section 232: **39%**. The 12.5% Section 301 duty on Vietnam does not stack on Section 232 goods.",
        },
    ]
    o["notes"] = {
        "chapterNotes": (
            "**Note 1.** Apart from blow torches and similar self-contained torches, portable forges, grinding wheels with frameworks, manicure or pedicure sets, and goods of heading 8209, "
            "this chapter covers only articles with a blade, working edge, working surface or other working part of: (a) base metal; (b) metal carbides or cermets; (c) precious or "
            "semiprecious stones (natural, synthetic or reconstructed) on a support of base metal, metal carbide or cermet; or (d) abrasive materials on a support of base metal, provided "
            "that the articles have cutting teeth, flutes, grooves or the like, of base metal, which retain their identity and function after the application of the abrasive.\n\n"
            "**Note 2.** Parts of base metal of the articles of this chapter are classified with the articles of which they are parts, except parts separately specified as such and "
            "toolholders for handtools (heading 8466). Parts of general use as defined in note 2 to section XV are always excluded. Heads, blades and cutting plates for electric shavers "
            "and electric hair clippers are classified in heading 8510.\n\n"
            "**Note 3.** Sets consisting of one or more knives of heading 8211 and at least an equal number of articles of heading 8215 are classified in heading 8215."
        ),
        "additionalUsNotes": (
            "**1.** Provisions that refer to kitchen or tableware include articles of types used outdoors as well as indoors.\n\n"
            "**2.** The length of files and rasps (heading 8203) does not include the tang.\n\n"
            "**3.** To find the rate for sets of heading 8205, 8206, 8211 or 8215, a specific or compound rate of any article in the set is converted to its ad valorem equivalent: the "
            "ad valorem rate that, applied to the full value of the article, gives the same duty.\n\n"
            "**Statistical notes.** For sets of 8205, 8206, 8211 or 8215, report the total number of separate pieces. \"Sheath-type knives\" (8211.92) are fixed-blade knives in a "
            "substantial holster (sheath) of a kind used in hunting and fishing."
        ),
    }

    # ------------------------------------------------------------ tariffUpdates
    S232 = ["procl-11021", "fr-2025-15819", "procl-10947", "fr-2026-08297", "procl-11032", "csms-68253075", "hts-chapter-99", "hts-now"]
    tu["h1"] = f"HTS Chapter 82: {SHORT} — Tariff Updates"
    tu["seo"] = {
        "title": "Hand Tool, Knife & Cutlery Tariff Updates 2025–2026: Section 232 Derivatives, Section 301, Canada 338 (HTS Ch. 82) | KoalaGains",
        "shortDescription": "Every U.S. tariff change on HTS Chapter 82 tools and cutlery since 2025, with Federal Register citations: knives and flatware added to Section 232 in August 2025 and charged 25% "
        "on full value since April 6, 2026, the 2026 Section 301 duties on other tools, Section 338 on Canada, the end of IEEPA, and the diamond sawblades AD order.",
        "keywords": [
            "tariffs on hand tools",
            "knives tariffs",
            "steel derivative tariff list",
            "section 232 derivative products list",
            "section 301 tariff list 3",
            "section 338 canada tariffs",
            "diamond sawblades antidumping",
            "tools tariff 2026",
        ],
    }
    tu["intro"] = (
        "This page compares the **2025 Basic Edition** (in force January 1, 2025) with the current **2026 Revision 21** (in force October 9, 2026) and lists every extra duty that "
        f"reaches Chapter 82 today. No base rate changed and no line was added or renumbered: all {len(LINE)} lines carry the same rates.\n\n"
        "The extra duties changed completely. In January 2025 Chinese tools paid Section 301 (25% or 7.5%), Russian goods column 2 rates, and everyone else only the base rate. In 2025 the IEEPA duties "
        "(reciprocal, Canada, Mexico, China) reached the whole chapter, and on **August 18, 2025** Commerce added knives, flatware, vises and clamps, pipe and bolt cutters, certain "
        "edged tools, diamond sawblade cores and three die lines to Section 232 as derivative steel articles (50% on the steel content). The IEEPA duties ended on **February 24, 2026**; "
        f"Proclamation 11021 moved Section 232 to the **full customs value** on **April 6, 2026** (25% for the {n25} knife, flatware and tool lines, 15% total for the {neq} die lines). "
        f"Since July 2026 the {nnon} lines outside Section 232 pay the 2026 Section 301 duties on 60 economies and Brazil, and since August 22, 2026 Canada's wrenches, pliers, saw blades, "
        "carbide inserts and razors pay 50% under Section 338.\n\n"
        "Two antidumping orders cover Chapter 82 goods from China, on **diamond sawblades** (continued after a 2026 sunset review) and **heavy forged hand tools**. They are "
        "company-specific, summarized below, and **not included in the tariff calculator**."
    )
    tu["scope"] = (
        "Chapter 99 measures that reach Chapter 82 from any country: Section 232 derivative steel articles (note 16), China Section 301 (note 20), the 2026 Section 301 actions on 60 "
        "economies and Brazil (notes 50, 52), Canada Section 338 (note 51), Russia's rates in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note 29), and the ended "
        "IEEPA and Section 122 duties. The Section 232 vehicle-part elections (certified auto and truck parts) are opt-in and left out. The antidumping orders on diamond sawblades and "
        "heavy forged hand tools from China are summarized for reference; the calculator does not model them. For the rate each supplier pays, see Rates by country."
    )
    tu["stats"] = [
        {"label": "Base rates unchanged", "value": f"{len(LINE)} of {len(LINE)} lines"},
        {"label": "Section 232 at 25% / 15% total", "value": f"{n25} / {neq} lines"},
        {"label": "Outside Section 232", "value": f"{nnon} lines"},
        {"label": "Compared", "value": "2025 Basic → Rev 21"},
    ]
    tu["inEffect"] = [
        {
            "id": "all-section-232-25",
            "country": "All countries except Russia (Russia: 9903.82.16, also 25%)",
            "measure": "Section 232 derivative steel articles, on the full customs value",
            "ch99Code": "9903.82.09",
            "before": "None until August 18, 2025; then +50% on the value of the steel content (inclusions list)",
            "now": "+25%",
            "exemption": f"Covers {n25} lines on note 16(c)(vii): every knife line of 8211 (including knife sets, blades and handles), every flatware line of 8215 (including sets), vises and clamps "
            "(8205.70), other iron or steel hand tools of 8205.59.55, pipe cutters, bolt cutters and punches of 8203.40.60, and diamond sawblade cores (8202.39.00.40). No country exemptions; "
            "note 16(b) collects it on top of any FTA or USMCA rate. Because Chapter 82 is not chapter 72, 73, 74 or 76, the duty applies only when steel is at least 15% of the article's weight "
            "(9903.82.03), and articles with no steel at all are outside it (9903.82.01). Lower rates: UK goods with ≥95% UK-melted steel 15% (9903.82.05); ≥85% U.S.-melted steel 10% "
            "(9903.82.06). Goods under 9903.82.09 do not pay the 2026 Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)); China's 2018–2019 Section 301 lists still apply.",
            "whatItMeans": "Knives, forks, spoons, flatware sets, vises and clamps pay a quarter of their value in duty on top of the base rate, whatever the country or FTA claim: $100,000 of steak knives owes $25,000 plus the base rate.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232,
        },
        {
            "id": "all-section-232-equipment",
            "country": "All countries (Belarus, Cuba, North Korea: +25%, 9903.82.12; Russia: +25%, 9903.82.17)",
            "measure": "Section 232 fixed industrial equipment derivatives (temporary 15% rate)",
            "ch99Code": "9903.82.10",
            "before": "None until August 18, 2025; then +50% on the value of the steel content",
            "now": "15% in total (the base rate is topped up to 15%)",
            "exemption": "Covers three lines on note 16(c)(x) (Annex III of Proclamation 11021): parts of dies for drawing or extruding metal (8207.20.00.70), metal-forming dies "
            "(8207.30.60.62) and parts of pressing, stamping or punching tools (8207.30.60.95). Note 16(f): base rate + Section 232 = 15% (no Section 232 duty if the base rate is 15% or more). "
            "With ≥85% U.S.-melted steel the total is 10% (9903.82.07, note 16(e)). The 15% weight test and 9903.82.01 apply as above. From January 1, 2028 these lines move to the 25% rate "
            "(Proclamation 11021 clause 7).",
            "whatItMeans": "Imported stamping-die parts and forming dies pay 15% of their value in total until the end of 2027.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232,
        },
        {
            "id": "gb-section-232",
            "country": "United Kingdom",
            "measure": "Section 232 derivative steel articles, UK rate",
            "ch99Code": "9903.82.05",
            "before": "None until August 18, 2025; then +50% on the steel content (UK +25%)",
            "now": "+15% with ≥95% UK-melted steel; otherwise +25%",
            "exemption": "Note 16(d): only when at least 95% of the steel was melted and poured in the United Kingdom. Covers the same 52 lines as 9903.82.09; the three die lines have no UK rate "
            "and pay 15% in total. UK goods without the 95% proof pay the standard 25%.",
            "whatItMeans": "A Sheffield knife or fork maker using UK-melted steel pays 15% instead of 25%.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": ["procl-11021", "procl-10947", "fr-2026-08297", "eo-14309", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "us-melted-232",
            "country": "All countries",
            "measure": "Section 232 rate for derivatives made of U.S.-melted steel",
            "ch99Code": "9903.82.06 / 9903.82.07",
            "before": "Exempt: derivatives processed abroad from U.S.-melted steel paid no Section 232 duty",
            "now": "+10% (25% list), or 10% in total (die lines)",
            "exemption": "Note 16(e): at least 85% of the steel content (by weight) melted and poured in the United States (Proclamation 11032, from June 8, 2026; Proclamation 11021 had required all of it). "
            "Russia uses 9903.82.15.",
            "whatItMeans": "Knives or flatware made abroad from U.S. steel pay 10% instead of 25%; the melt country must be documented.",
            "effectiveFrom": "2026-06-08",
            "effectiveSourceId": "procl-11032",
            "sourceIds": ["procl-11032", "procl-11021", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "cn-section-301",
            "country": "China",
            "measure": "Section 301: List 3, List 4A and the 2026 action",
            "ch99Code": "9903.88.03 / 9903.88.15 / 9903.05.31",
            "before": "+25% (List 3) or +7.5% (List 4A)",
            "now": "+25% or +7.5%, plus +12.5% on the lines outside Section 232",
            "exemption": f"List 3 (9903.88.03, 25%) covers {cn_l3} lines: every line of 8201–8210 and some knife and flatware lines. List 4A (9903.88.15, 7.5%) covers {cn_4a} lines: most table "
            f"and kitchen knives, razors and blades, some manicure items, cleavers and flatware. {len(c['CN_NONE'])} lines are on neither list (scissors, most 8214 items, knife sets 8211.10 and some "
            "knife, fork and spoon lines). Both lists stack with Section 232. The 12.5% 2026 duty (9903.05.31) applies only to the 134 lines outside Section 232. One exclusion, for certain non-electric "
            "kitchen and table implements of 8205.51.30.30 (peelers, graters, whisks), runs until November 9, 2026 (9903.88.69, note 20(vvv)). The IEEPA duties on China ended February 24, 2026; "
            "USTR confirmed on October 7, 2026 that the 2018 actions continue.",
            "whatItMeans": "Chinese wrenches, pliers, saw blades and drill bits pay the base rate + 37.5%; Chinese kitchen knives the base rate + 32.5% (7.5% + 25%); Chinese scissors only the base rate + 12.5%.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2025-21671", "fr-2026-20510", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s301-2026",
            "country": "60 Section 301 economies (Canada, Mexico, EU, Japan, Korea, Taiwan, Vietnam, India, Thailand, Israel, Switzerland, UK, Brazil, Russia and others)",
            "measure": "Section 301 (2026 actions on 60 economies)",
            "ch99Code": "9903.05.20–9903.05.84",
            "before": "None",
            "now": f"+10% or +12.5% (EU and Taiwan: 10%, Japan, Korea and Switzerland: 12.5% in place of the base rate when lower) on the {nnon} lines outside Section 232",
            "exemption": "Does not apply to Section 232 goods (note 52(f)(1)), so knives, flatware, vises and the other listed lines pay only Section 232. USMCA-qualifying goods of Canada and Mexico are "
            "exempt (9903.05.93, 9903.05.94). No Chapter 82 line is on the note 52(b) general exemption list or a note 52(j) country exception list.",
            "whatItMeans": "$100,000 of Indian hand tools pays $10,000 more; German drill bits pay 10% in place of their 5% base rate; the same tools from Mexico with a USMCA certificate pay nothing.",
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
            "now": f"+25% on the {nnon} lines outside Section 232 (plus 12.5% under 9903.05.27)",
            "exemption": "Does not apply to Section 232 goods (note 50(a)(vi)(1), 9903.05.07), so Brazilian knives and flatware pay only the 25% Section 232 duty. No Chapter 82 line is on the "
            "note 50 exception lists.",
            "whatItMeans": "A Brazilian wrench pays 9% + 25% + 12.5% = 46.5%; a Brazilian kitchen knife pays its base rate + 25%.",
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
            "now": f"+50% on {nca} lines in 13 subheadings",
            "exemption": "Covers mattocks, picks, hoes and rakes (8201.30), steel circular saw blades (8202.31), other chain saw blades (8202.40.60), pliers (8203.20.60), metal-cutting shears (8203.30), "
            "wrenches and sockets (8204), hammers with heads up to 1.5 kg (8205.20.30), other hand tools of 8205.59.80, tool sets (8206), carbide inserts (8209) and razors (8212.10). "
            "Charged even when USMCA is claimed (note 51(a)). None of these lines is a Section 232 article. Proclamation 11065 changed the list from September 15, 2026 but left these "
            "Chapter 82 subheadings on it. Canadian civil aircraft articles are exempt (9903.03.16).",
            "whatItMeans": "Canadian wrenches, pliers and carbide inserts pay 50% of their value with a USMCA certificate, and the base rate + 60% without one (9% + 10% + 50% = 69% for wrenches).",
            "effectiveFrom": "2026-08-22",
            "effectiveSourceId": "procl-11048",
            "sourceIds": ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ru-rates",
            "country": "Russia",
            "measure": "Column 2 rates, 35% in lieu of column 2 on some lines, Section 232 and Section 301",
            "ch99Code": "9903.90.08 / 9903.82.16 / 9903.82.17 / 9903.05.66",
            "before": "Column 2 rates (since April 9, 2022), 35% in their place on the note 30 subheadings",
            "now": "Column 2 or 35%, + 25% Section 232 on the listed lines, + 12.5% on the other lines",
            "exemption": f"Russia has paid column 2 rates since April 9, 2022, and 35% in place of column 2 on {nru} Chapter 82 lines since July 27, 2022 (crowbars, track tools and wedges 8205.59.30, "
            "drawing dies 8207.20, other machine knives 8208.90.60; Proclamation 10420). Section 232 goods add 25% (9903.82.16, die lines 9903.82.17); the other lines add 12.5% (9903.05.66).",
            "whatItMeans": "A Russian socket wrench pays its 45% column 2 rate + 12.5%; a Russian folding knife 35¢ each + 55% + 25%.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "procl-11021", "procl-10420", "procl-10523", "hts-chapter-99", "hts-now"],
        },
    ]
    for e in tu["inEffect"]:
        for sid in e["sourceIds"]:
            assert sid in SRC, sid
    # sanity: the Russian wrench and folding knife sentences
    assert cell_of("Russia", "8204.20.00.00")["total"] == "57.5%", cell_of("Russia", "8204.20.00.00")["total"]
    assert cell_of("Russia", "8211.93.00.35")["total"] == "35¢ each + 80%", cell_of("Russia", "8211.93.00.35")["total"]
    assert cell_of("Brazil", "8204.20.00.00")["total"] == "46.5%"

    def ch(id, type, date, label, title, detail, before, now, countries, ids):
        for sid in ids:
            assert sid in SRC, sid
        return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now, "countries": countries, "sourceIds": ids}

    nic = next(x for x in tu["changes"] if x["id"].startswith("section-301-nicaragua"))
    eq28 = next(x for x in tu["changes"] if x["id"].startswith("section-232-steel-aluminum-copper-scheduled-2028"))
    changes = [
        ch("base-rates", "baseRate", ASOF, "Checked", "No Chapter 82 base-rate changes",
           f"All {len(LINE)} Chapter 82 lines carry the same general, special and column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition; no line was added, split or renumbered.",
           None, None, None, ["hts-before", "hts-now", "hts-now-cr"]),
        ch("cn-301-continued", "reference", "2026-10-07", "Published", "USTR keeps the China Section 301 tariffs",
           "After the IEEPA ruling, USTR confirmed that the 2018–2019 Section 301 actions on China continue, so List 3 (25%) and List 4A (7.5%) still apply to Chapter 82 tools, knives and flatware.",
           None, "+25% / +7.5%", "China", ["fr-2026-20510"]),
        ch("ca-338-modified", "reference", "2026-09-15", "Effective", "Section 338 list for Canada revised; Chapter 82 lines unchanged",
           "Proclamation 11065 added and removed products on the note 51(b)(3) list and made the duty apply on top of Section 232. The 13 Chapter 82 subheadings stayed on the list and none of "
           "them is a Section 232 article, so their 50% did not change.",
           None, "+50%", "Canada", ["procl-11065", "csms-69851916"]),
        ch("ca-338-start", "extraDuty", "2026-08-22", "Effective", "Section 338: 50% on Canadian wrenches, pliers, saw blades, carbide inserts and razors",
           f"Proclamation 11048 imposed a 50% duty (9903.03.14) on products of Canada in the note 51(b)(3) list from August 22, 2026, after Proclamation 11056's three-day suspension. In Chapter 82 "
           f"it reaches {nca} lines: picks, hoes and rakes, steel circular and chain saw blades, pliers, metal-cutting shears, wrenches and sockets, light hammers, other hand tools of 8205.59.80, "
           "tool sets, carbide inserts and razors. It applies with or without a USMCA claim.",
           None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660"]),
        ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies reach the tools outside Section 232",
           f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect; the EU and Taiwan pay 10%, and Japan, Korea and Switzerland 12.5%, in place of a lower base rate. "
           f"They do not apply to Section 232 goods (note 52(f)(1)), so in Chapter 82 they reach the {nnon} lines outside Section 232: wrenches, pliers, hammers, screwdrivers, saw blades, drill "
           "bits, carbide inserts, scissors and razors. USMCA goods are exempt.",
           None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
        ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
           "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It did not apply to Section 232 goods (Proclamation 11012), so in Chapter 82 it had "
           "charged the tools outside Section 232.",
           "+10% (non-232 lines)", None, "All", ["procl-11012", "hts-chapter-99"]),
        ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: knives and flatware exempt, other tools not",
           f"The 25% duty on goods of Brazil (9903.05.01) took effect. Section 232 goods are excluded (note 50(a)(vi)(1)), so it reaches the {nnon} Chapter 82 lines outside Section 232.",
           None, f"+25% ({nnon} lines)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
        ch("sawblades-sunset", "reference", "2026-07-06", "Published", "Diamond sawblades order: Commerce finds dumping would recur",
           "In its expedited third sunset review of the antidumping order on diamond sawblades and parts from China (A-570-900), Commerce found that revocation would likely lead to dumping "
           "margins of up to 164.09%. The ITC scheduled its expedited review the same day. The order stays in force; no revocation has been published.",
           None, "AD order continues", "China", ["fr-2026-13573", "fr-2026-13610"]),
        ch(eq28["id"], "pending", "2026-04-09", "Published", "Die and press-tool lines move to the 25% Section 232 rate on January 1, 2028",
           "Proclamation 11021 set a temporary 15% total rate for fixed industrial equipment derivatives (Annex III) until December 31, 2027; from January 1, 2028 they take the standard rates: "
           "25% (9903.82.09), 15% for UK goods with UK-melted steel, 10% with U.S.-melted steel. In Chapter 82 that is 8207.20.00.70, 8207.30.60.62 and 8207.30.60.95.",
           "15% in total", "+25%", "All", ["procl-11021", "hts-chapter-99"]),
        ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032: 85% U.S.-melted test",
           "From June 8, 2026, a derivative article qualifies for the 10% rate (9903.82.06, or 10% in total for the die lines under 9903.82.07) when at least 85% of its steel content by weight "
           "was melted and poured in the United States; it had to be all of it. Chapter 82's 25% and 15% rates did not change.",
           None, None, "All", ["procl-11032"]),
        ch("tech-corrections", "reference", "2026-04-29", "Published", "Commerce corrects the Section 232 annex",
           "Commerce added heading 9903.82.01, so articles on the lists that contain no steel, aluminum or copper pay no Section 232 duty, effective April 6, 2026.",
           None, None, "All", ["fr-2026-08297"]),
        ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 on full value: knives and flatware 25%, die lines 15% (Proclamation 11021)",
           f"Proclamation 11021 replaced the earlier headings with 9903.82.02–9903.82.26, charged on the full customs value. In Chapter 82 the {n25} knife, flatware, vise and clamp, cutter, "
           f"edged-tool and sawblade-core lines move to the 25% list (Annex I-B, 9903.82.09) and the {neq} die and press-tool lines to the 15% total rate for industrial equipment (Annex III). "
           "For goods other than chapters 72, 73, 74 and 76 the duty applies only when the metal is at least 15% of the weight. Manufacturing drawback is allowed for these goods from trade-agreement "
           "partners when they are not AD/CVD merchandise; goods admitted to a foreign-trade zone must take privileged foreign status.",
           "+50% (steel content only)", "+25% or 15% total (full value)", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
        ch("sawblades-sunset-start", "reference", "2026-03-02", "Published", "Third sunset review of the diamond sawblades order begins",
           "Commerce initiated, and the ITC instituted, the five-year review of the antidumping order on diamond sawblades and parts from China.",
           None, None, "China", ["fr-2026-04069"]),
        ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; Section 232 goods outside it",
           "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. It did not apply in addition to Section 232 duties, so in Chapter 82 only the lines outside "
           "Section 232 paid it; USMCA goods were exempt.",
           None, "+10% (non-232 lines)", "All", ["procl-11012", "hts-chapter-99"]),
        ch("ieepa-end", "extraDuty", "2026-02-24", "Ended", "All IEEPA tariffs end",
           "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and "
           "reciprocal duties, and CBP stopped collecting them from 12:00 a.m. ET on February 24, 2026. Section 232 and Section 301 duties are not IEEPA duties and continued.",
           "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
        ch("inclusions-2025-08", "extraDuty", "2025-08-18", "Effective", "Knives, flatware, vises and other tools become Section 232 steel derivatives",
           "Commerce's first inclusions round added to the derivative steel list the Chapter 82 provisions for knives and knife sets (8211), flatware and flatware sets (8215), vises and clamps "
           "(8205.70), other iron or steel hand tools (8205.59.55), pipe and bolt cutters (8203.40.60), diamond sawblade cores (8202.39.00.40) and three die lines of 8207.20 and 8207.30. "
           "They paid 50% (Proclamation 10947) on the value of their steel content; the non-steel content paid the IEEPA duties.",
           None, "+50% (steel content)", "All", ["fr-2025-15819", "procl-10947"]),
        ch("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariff reaches Chapter 82",
           "Executive Order 14257 set the reciprocal tariffs from April 5, 2025. No Chapter 82 line was on its Annex II exemption list, so all Chapter 82 goods paid it (Canada and Mexico aside). "
           "Ended February 24, 2026.",
           None, "+10% or more by country (ended)", "All except Canada, Mexico", ["eo-14257"]),
        ch("ca-mx-ieepa", "reference", "2025-03-04", "Effective", "IEEPA duties on Canada and Mexico",
           "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods exempt from March 7, 2025. Ended February 24, 2026.",
           None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
        ch("cn-ieepa", "reference", "2025-02-04", "Effective", "IEEPA duties on China",
           "An additional 10% on all products of China from February 4, 2025, raised to 20% on March 4, 2025, on top of Section 301. Ended February 24, 2026.",
           None, "+10% to +20% (ended)", "China", ["eo-14195", "eo-14228"]),
        ch("hfht-continued", "reference", "2022-06-08", "Effective", "Heavy forged hand tools orders continued",
           "Commerce continued the four antidumping orders on heavy forged hand tools from China (hammers and sledges over 1.5 kg, bars over 18 inches and wedges, picks and mattocks, axes and adzes) "
           "after its fifth sunset review, which found margins likely to prevail of 15.02% to 50.81%.",
           None, "AD orders continue", "China", ["fr-2022-12311", "fr-2022-06865"]),
        ch("sawblades-2021", "reference", "2021-04-12", "Effective", "Diamond sawblades order continued after the second sunset review", "The antidumping order on diamond sawblades and parts from China was continued for another five years.",
           None, "AD order continues", "China", ["fr-2021-07450"]),
        ch("cn-list4a", "extraDuty", "2020-02-14", "Effective", "China Section 301 List 4A cut to 7.5%",
           "List 4A (9903.88.15), which took effect September 1, 2019 at 15% and covers Chinese table and kitchen knives, razors, some manicure items and flatware, was cut to 7.5% from February 14, 2020.",
           "+15%", "+7.5%", "China", ["fr-2019-17865", "fr-2020-00904"]),
        ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China Section 301 List 3 raised to 25%",
           "Chinese hand tools, saw blades, wrenches, drill bits, machine knives, carbide inserts and some knife and flatware lines (List 3, 9903.88.03) have paid Section 301 since "
           "September 24, 2018 at 10%, raised to 25% from May 10, 2019.",
           "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
        ch(nic["id"], "pending", "2025-12-29", "Published", "Section 301 tariff on Nicaragua phases in from 2027",
           "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). The rate is 0% in 2026.",
           None, "+10% to +15%", "Nicaragua", nic["sourceIds"]),
    ]
    changes.sort(key=lambda x: x["date"], reverse=True)
    tu["changes"] = changes

    used = set()
    for e in tu["inEffect"]:
        used.update(e["sourceIds"])
    for x in tu["changes"]:
        used.update(x["sourceIds"])
    used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch82", "fr-E9-26680", "fr-2019-15084", "fr-2020-03362", "fr-2011-27971"])
    tu["sources"] = sorted([copy.deepcopy(SRC[i]) for i in used], key=lambda s: (s["published"], s["id"]), reverse=True)

    apply_industry_areas(c)
    apply_engineering(c)
    from trade82 import apply_trade

    apply_trade(c)


def s301_extra(c, country):
    """The 2026 Section 301 wording on a non-232 line (8204.20) for a matrix country."""
    return c["cell_of"](country, "8204.20.00.00")["extra"]


def apply_industry_areas(c):
    d, SRC = c["d"], c["SRC"]
    ia = d["industryAreas"]
    nnon, n25 = len(c["NON"]), len(c["S25"])
    ia["h1"] = f"HTS Chapter 82: {SHORT} — Tariff Rates by Country"
    ia["seo"] = {
        "title": "Hand Tool & Knife Tariffs by Country: China, Taiwan, Germany, Japan, Canada, Mexico (HTS Ch. 82) | KoalaGains",
        "shortDescription": "The total U.S. tariff on Chapter 82 tools and cutlery by country and product: 25% Section 232 on knives and flatware from everywhere, the 2026 Section 301 rates on other "
        "tools, China up to 37.5% extra, Canadian wrenches and carbide inserts 50%, USMCA and FTA effects.",
        "keywords": [
            "tariffs on hand tools",
            "tariff on tools from china",
            "japanese knife tariff",
            "swiss army knife tariff",
            "section 338 canada",
            "section 338 canada hts list",
            "tariffs on knives from japan",
            "tools tariffs by country",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. Chapter 82 splits in two. "
        f"**Knives and flatware** (and vises, clamps, some cutters and edged tools) are Section 232 derivative steel articles: **25%** on top of the base rate from every country, with or without an "
        "FTA claim, and no 2026 Section 301 duty. **All other tools** pay the 2026 Section 301 duty of their country: 10% or 12.5% added for most, 10% (EU, Taiwan) or 12.5% (Japan, Korea, "
        "Switzerland) *in place of* a lower base rate, nothing for USMCA goods.\n\n"
        "China pays **25% (List 3) or 7.5% (List 4A)** more on most lines, plus 12.5% on the tools outside Section 232. Canada's wrenches, pliers, saw blades, carbide inserts, tool sets and razors pay "
        "**50%** under Section 338, even with USMCA. Brazil pays 37.5% extra on tools outside Section 232. Sets show the set rate as written (the rate of the highest-rated article). "
        "The table does **not** include antidumping duties on Chinese diamond sawblades and heavy forged hand tools (see Tariff updates)."
    )

    def code_of(x):
        lab = x["rule"]["label"]
        k = "Section 301 (2026, 60 economies) ("
        return lab.split(k)[1].split(")")[0] if k in lab else None

    def s301_words(country, code):
        e = s301_extra(c, country)
        if "in place of base" in e:
            pct = e.split("%")[0]
            return f"{pct}% in place of the base rate when lower ({code})"
        return f"+ {e.lstrip('+')} ({code})"

    COMMON_232 = (f"The {n25} Section 232 lines (knives, flatware, vises, clamps and some cutters and edged tools): base rate + 25% (9903.82.09), FTA or not; die and press-tool parts 15% in total (9903.82.10).")
    SRC_STD = ["procl-11021", "fr-2026-15181", "hts-now"]
    R = {
        "China": ("Tools outside Section 232: base rate + 25% List 3 (9903.88.03) + 12.5% (9903.05.31), e.g. wrenches 46.5%; razors 7.5% List 4A + 12.5%; scissors and most 8214 items + 12.5% only. "
                  "Knives and flatware: + 25% Section 232 + 7.5% (List 4A) or 25% (List 3) where listed; knife sets and some knife, fork and spoon lines + 25% only. Die parts 15% total + 25%. "
                  "Antidumping duties on diamond sawblades and heavy forged hand tools are not shown.",
                  ["procl-11021", "fr-2018-20610", "fr-2019-17865", "fr-2020-00904", "fr-2026-15181", "fr-2026-13573", "fr-2022-12311", "hts-now"]),
        "Canada": ("USMCA-qualifying: Free on most tools; + 25% Section 232 on knives and flatware (note 16(b): no USMCA relief); + 50% Section 338 (9903.03.14) on 8201.30, 8202.31, 8202.40.60, "
                   "8203.20.60, 8203.30, 8204, 8205.20.30, 8205.59.80, 8206, 8209 and 8212.10, with or without USMCA. Without USMCA the other tools also pay 10% Section 301 (9903.05.29).",
                   ["procl-11021", "procl-11048", "procl-11065", "fr-2026-15181", "hts-now"]),
        "Mexico": ("USMCA-qualifying: Free on tools outside Section 232; base rate + 25% Section 232 on knives and flatware (no USMCA relief). Without a USMCA claim: base rate + 10% Section 301 "
                   "(9903.05.55) on the other tools. " + "Die and press-tool parts 15% in total.",
                   SRC_STD),
        "United Kingdom": ("Tools outside Section 232: base rate + 10% (9903.05.81). Knives and flatware: base rate + 25%, or + 15% with at least 95% UK-melted steel (9903.82.05; cells show 25%). "
                           "Die parts 15% in total.", ["procl-11021", "fr-2026-08297", "fr-2026-15181", "hts-now"]),
        "Brazil": ("Tools outside Section 232: base rate + 25% (9903.05.01) + 12.5% (9903.05.27). Knives and flatware: base rate + 25% Section 232 only (note 50(a)(vi)(1)). Die parts 15% in total.",
                   ["procl-11021", "fr-2026-14542", "fr-2026-15181", "hts-now"]),
        "Russia": ("Column 2 rates (35% in their place on crowbars and wedges, drawing dies and other machine knives, 9903.90.08) + 12.5% (9903.05.66) on tools outside Section 232; "
                   "+ 25% Section 232 (9903.82.16, die parts 9903.82.17) on knives, flatware and the other listed lines.",
                   ["procl-11021", "procl-10420", "fr-2026-15181", "hts-now"]),
        "Israel": ("U.S.-Israel FTA: Free base rate on most lines, + 12.5% Section 301 (9903.05.47) on tools outside Section 232. Knives and flatware: 25% Section 232 (the FTA does not reduce it). "
                   "Die parts 15% in total.", SRC_STD),
        "South Korea": ("Tools outside Section 232: 12.5% in place of the base rate when lower (9903.05.71); KORUS does not lower it. Knives and flatware: KORUS-free base + 25% Section 232. "
                        "Die parts 15% in total.", SRC_STD + ["fr-2025-21940"]),
    }
    for x in ia["countries"]:
        name = x["country"]
        if name == "Any other country":
            x["rule"]["label"] = (
                "Knives, flatware and the other Section 232 lines: base rate + 25% from every country. Other tools: base rate only for countries outside the 60-economy Section 301 action, "
                "or up to 12.5% more for those in it (9903.05.20–9903.05.83). Belarus, Cuba and North Korea pay column 2 rates and + 25% on the die lines (9903.82.12); "
                "Nicaragua's Section 301 duty starts January 1, 2027."
            )
            x["rule"]["sourceIds"] = ["procl-11021", "fr-2026-15181", "fr-2025-23892", "hts-now"]
            continue
        if name in R:
            x["rule"]["label"], x["rule"]["sourceIds"] = R[name][0], list(R[name][1])
        else:
            code = code_of(x)
            assert code, name
            w = s301_words(name, code)
            x["rule"]["label"] = f"Tools outside Section 232: {'base rate ' + w if w.startswith('+') else w}. {COMMON_232}"
            x["rule"]["sourceIds"] = list(SRC_STD)
    for x in ia["countries"]:
        assert "TODO" not in x["rule"]["label"], x["country"]
        for sid in x["rule"]["sourceIds"]:
            assert sid in SRC, sid
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "Section 232 is shown at its default rates: 25% (9903.82.09) for the derivative steel lines and 15% in total (9903.82.10) for the die lines. UK goods with at least 95% UK-melted steel pay 15% "
        "(9903.82.05) and goods with at least 85% U.S.-melted steel 10% (9903.82.06, .07); the cells do not show these variants.",
        "The Section 232 lines are priced as containing steel of at least 15% of the article's weight. Articles below that (9903.82.03) or with no steel at all (9903.82.01) pay no Section 232 duty "
        "and fall back to the 2026 Section 301 duty; the cells assume the duty applies.",
        "Sets (8205.90.60, 8206, 8211.10, 8215.10, 8215.20) show the HTS wording: their base rate is the rate of the highest-rated article in the set. The tariff calculator prices them when you "
        "enter that article's 10-digit line.",
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied. "
        "The Section 232 certified vehicle-part elections are opt-in and not applied.",
        "Antidumping duties are not included. They apply company by company to diamond sawblades, cores and segments from China (and those assembled in Thailand or Canada by firms found to "
        "circumvent the order) and to heavy forged hand tools from China.",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 16, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 16(c)(vii) lists 52 Chapter 82 lines (all of 8211 and 8215, 8205.70, 8205.59.55, "
        "8203.40.60 and 8202.39.00.40) and note 16(c)(x) three lines of 8207.20 and 8207.30; the 15% metal-weight test of note 16(c) applies because Chapter 82 is not chapter 72, 73, 74 or 76. "
        "No country exemption exists, and note 16(b) collects the duty on top of FTA rates. Section 232 goods are excluded from the 2026 Section 301 duties (note 52(f)(1)), the Brazil duty "
        "(note 50(a)(vi)(1)) and the expired Section 122 surcharge, but not from China Section 301 (note 20). No Chapter 82 line is on the note 52(b) general exemption list, a note 52(j) country "
        "exception list or the note 50 exception lists. Note 51(b)(3) (Section 338, Canada) lists 13 Chapter 82 subheadings. The China exclusion for 8205.51.30.30 kitchen implements "
        "(9903.88.69), civil aircraft relief and the 9903.82.01 / 9903.82.03 headings need the importer's confirmation and are not applied."
    )
    ia_ids = {"hts-now"}
    for x in ia["countries"]:
        ia_ids.update(x["rule"]["sourceIds"])
    ia["sources"] = sorted([copy.deepcopy(SRC[i]) for i in ia_ids], key=lambda s: (s["published"], s["id"]), reverse=True)


def apply_engineering(c):
    d, SRC = c["d"], c["SRC"]
    te = d["tariffEngineering"]
    CH99, CH82 = c["CH99_PDF"], c["CH82_PDF"]
    FR11021 = SRC["procl-11021"]["url"]

    def e(sec):
        return f"https://www.ecfr.gov/current/title-19/section-{sec}"

    def ep(part):
        return f"https://www.ecfr.gov/current/title-19/part-{part}"

    from sources82 import USC_1304, USC_1241, USC_1244

    te["h1"] = f"HTS Chapter 82: {SHORT} — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Hand Tools & Knives: Marking Rules, Switchblade Ban, Section 232 Entry, Sets & Ways to Lower Duty (HTS Ch. 82) | KoalaGains",
        "shortDescription": "The rules for each HTS Chapter 82 line: permanent origin marking on knives, scissors, pliers and razors, the switchblade import ban, Section 232 headings and the 15% "
        "metal-weight test, how sets are rated, AD scope, plus the legal ways to pay less: U.S.- or UK-melted steel, USMCA and FTA claims, origin, drawback.",
        "keywords": [
            "tariff engineering",
            "HTS Chapter 82",
            "knife country of origin marking",
            "switchblade import",
            "steel derivative tariff calculation",
            "tool set hs code",
            "hand tools tariff code",
            "duty drawback",
        ],
    }
    te["intro"] = (
        "Most Chapter 82 paperwork is about **marking** and **classification**. Knives, forks, scissors, shears, clippers, razors and blades, pliers and pincers must carry their country of origin "
        "**permanently** (die stamping, cast-in-mold lettering, etching, engraving or an attached metal plate; 19 CFR 134.43), or pay a 10% marking duty. Switchblade, gravity and ballistic knives "
        "may not be imported. Section 232 lines report 9903.82.09 (or a lower-rate heading) next to the Chapter 82 line and the country where the steel was melted and poured. Sets pay the rate of "
        "their highest-rated article (additional U.S. note 3).\n\n"
        "The legal ways to pay less: **U.S.-melted** steel (10%), **UK-melted** steel (15%), the **15% metal-weight** test for articles that are mostly not steel, **USMCA** and FTA claims on the "
        "tools outside Section 232, avoiding **Chinese origin**, **drawback** on Section 232 duty from trade-agreement partners, and checking **antidumping scope** for diamond sawblades and heavy forged "
        "tools. Each rule and lever links to its regulation or proclamation."
    )
    te["regulationsAsOf"] = c["ECFR_AS_OF"]
    te["levers"] = [
        {
            "id": "us-melted",
            "title": "Use U.S.-melted steel in knives, flatware and other listed tools",
            "saves": "15 points on the 25% list (10% instead of 25%, 9903.82.06); 5 points on the die lines (10% instead of 15% in total, 9903.82.07)",
            "appliesTo": "The 55 Section 232 lines: knives (8211), flatware (8215), vises and clamps, 8205.59.55 tools, 8203.40.60 cutters, diamond sawblade cores and the three die lines",
            "document": "Mill certificates and supplier declarations showing that at least 85% (by weight) of the steel was melted and poured in the United States; reported in ACE.",
            "caveat": "The 85% test applies from June 8, 2026 (before that, all of it). Origin and the base rate do not change; China's Section 301 duty still applies to Chinese-made goods.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(e), headings 9903.82.06 and 9903.82.07", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": SRC["procl-11032"]["url"]},
            ],
        },
        {
            "id": "uk-melt",
            "title": "Buy UK knives and flatware made of UK-melted steel",
            "saves": "10 points: 15% instead of 25% (9903.82.05)",
            "appliesTo": "The 52 Section 232 lines on the 25% list, for products of the United Kingdom",
            "document": "Mill test certificates and melt-and-pour reporting showing that at least 95% of the steel was melted and poured in the UK.",
            "caveat": "The die lines have no UK rate (15% in total). Without the 95% proof UK goods pay 25%.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d)", "url": CH99},
                {"label": "Proclamation 11021 (91 FR 18201)", "url": FR11021},
            ],
        },
        {
            "id": "metal-weight",
            "title": "Check the 15% metal-weight test",
            "saves": "The whole Section 232 duty when steel is under 15% of the article's weight (9903.82.03) or absent (9903.82.01)",
            "appliesTo": "The 55 Section 232 lines of Chapter 82 (the test does not exist for chapters 72, 73, 74 and 76, but does for Chapter 82)",
            "document": "Bill of materials and weights showing the steel (plus any aluminum or copper on the lists) is less than 15% of the article's total weight; report 9903.82.03.",
            "caveat": "Rare for knives and flatware, whose blade or body is the heaviest part; heavy wooden, plastic or ceramic handles or presentation boxes can matter for sets. When the duty does not apply, "
            "the 2026 Section 301 duty of the country applies instead.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c), headings 9903.82.01 and 9903.82.03", "url": CH99},
                {"label": "Commerce technical corrections (91 FR 23056)", "url": SRC["fr-2026-08297"]["url"]},
            ],
        },
        {
            "id": "sets",
            "title": "Know how sets are rated",
            "saves": "The gap between the highest rate in a set and the rates of its other articles",
            "appliesTo": "Sets of 8205.90.60, 8206, 8211.10, 8215.10 and 8215.20",
            "document": "A list of every article in the set with its 10-digit line, rate and value. A set pays the highest rate (per-unit rates converted to ad valorem equivalents, additional U.S. note 3) "
            "on its whole value; articles imported loose are classified one by one. A CBP binding ruling settles whether goods are a set put up for retail sale.",
            "caveat": "Classification follows how the goods are presented at import, not the importer's choice. Knife sets with at least as many 8215 pieces go to 8215 (Chapter 82 note 3). "
            "Section 232 and Section 301 duties follow the set's own line.",
            "citations": [
                {"label": "HTSUS Chapter 82, note 3 and additional U.S. note 3", "url": CH82},
                {"label": "19 CFR part 177 (rulings)", "url": ep(177)},
            ],
        },
        {
            "id": "origin",
            "title": "Avoid Chinese origin",
            "saves": "25% (List 3) or 7.5% (List 4A), plus 12.5% on tools outside Section 232, and any antidumping duty on diamond sawblades or heavy forged tools",
            "appliesTo": "Almost every Chapter 82 line, for goods of China",
            "document": "Production records showing where the article was made; origin follows the last substantial transformation (for goods processed in Canada or Mexico, the tariff-shift rules of "
            "19 CFR 102.20). Ask CBP for a binding ruling.",
            "caveat": "Assembling Chinese diamond sawblade cores and segments in a third country has been found to circumvent the AD order (Thailand, Canada). Other countries pay the 2026 Section 301 "
            "duty or Section 232 instead.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99},
                {"label": "19 CFR 102.20", "url": e("102.20")},
                {"label": "19 CFR part 177 (rulings)", "url": ep(177)},
            ],
        },
        {
            "id": "usmca",
            "title": "Claim USMCA on Canadian and Mexican tools",
            "saves": "The base rate and the 10% Section 301 duty (9903.05.93, 9903.05.94) on tools outside Section 232; the base rate on knives and flatware",
            "appliesTo": "Originating goods of Canada or Mexico",
            "document": "A USMCA certification of origin from the importer, exporter or producer, available to CBP on request.",
            "caveat": "A USMCA claim does not reduce Section 232 (note 16(b)) or the 50% Section 338 duty on the 13 Canadian subheadings (note 51(a)).",
            "citations": [
                {"label": "19 CFR 182.12", "url": e("182.12")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 51 and 52", "url": CH99},
            ],
        },
        {
            "id": "fta",
            "title": "Claim the FTA rate (Korea, Israel, Australia, Chile, Colombia and others)",
            "saves": "The base rate (up to 12% or a few cents each plus a percentage)",
            "appliesTo": "Lines whose special column lists the partner's code (AU, BH, CL, CO, IL, JO, KR, MA, OM, P, PA, PE, SG; JP on some 8207 and 8209 lines)",
            "document": "The FTA's origin documentation (certification or knowledge of origin) under the agreement's CBP regulations.",
            "caveat": "Section 232 still applies on top (note 16(b)), and the 2026 Section 301 duty is added for Israel and other partners, or replaces the base rate for Korea (12.5% in place). GSP has lapsed.",
            "citations": [
                {"label": "HTSUS Chapter 82 (special rate column)", "url": CH82},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(b)", "url": CH99},
            ],
        },
        {
            "id": "drawback",
            "title": "Drawback of Section 232 duty from trade-agreement partners",
            "saves": "Up to 99% of the Section 232 duty on goods used in exported products, plus ordinary duties on any line",
            "appliesTo": "Section 232 lines (Annex I-B and Annex III) that are products of the UK, EU, Japan, Korea, Mexico or Canada, whose steel was melted in one of them, and that are not AD/CVD merchandise",
            "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
            "caveat": "Diamond sawblade cores (8202.39.00.40) are AD merchandise and cannot use it. AD/CVD are never refundable (19 CFR 191.3).",
            "citations": [
                {"label": "Proclamation 11021, clauses 13–14", "url": FR11021},
                {"label": "19 CFR part 191", "url": ep(191)},
                {"label": "19 CFR 191.3", "url": e("191.3")},
            ],
        },
        {
            "id": "adcvd-scope",
            "title": "Check antidumping scope before you buy",
            "saves": "The whole antidumping duty, when the product or producer is outside the order",
            "appliesTo": "Diamond sawblades, cores and segments (8202.39, sets of 8206) and heavy forged hand tools (8201.30, 8201.40.60, 8205.20.60, 8205.59.30) from China",
            "document": "The order's written scope (it, not the HTS number, decides; e.g. resin-bonded or electroplated blades without a diamond segment, and hammers with heads of 1.5 kg or less, are "
            "outside) and the producer's cash-deposit rate; when unsure, request a scope ruling from Commerce.",
            "caveat": "A product in scope pays the cash deposit even if entered under another HTS line. Rates change with each administrative review.",
            "citations": [
                {"label": "19 CFR 351.225 (scope rulings)", "url": e("351.225")},
                {"label": "Diamond sawblades order (74 FR 57145)", "url": SRC["fr-E9-26680"]["url"]},
                {"label": "Heavy forged hand tools continuation (87 FR 34846)", "url": SRC["fr-2022-12311"]["url"]},
            ],
        },
    ]
    rules = [
        {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container (19 CFR part 134); unmarked goods pay a 10% marking duty unless exported, destroyed or marked under CBP supervision",
         "citations": [{"label": "19 CFR 134.11", "url": e("134.11")}, {"label": "19 U.S.C. 1304(i)", "url": USC_1304}]},
        {"id": "marking-cutlery", "agency": "CBP", "title": "Knives, forks, steels, cleavers, clippers, shears, scissors, safety razors and blades, pliers, pincers and nippers (and their parts) must be marked by die stamping, "
         "cast-in-the-mold lettering, etching, engraving or a securely attached metal plate; USMCA goods by any legible, permanent method",
         "citations": [{"label": "19 CFR 134.43(a)", "url": e("134.43")}]},
        {"id": "switchblade", "agency": "CBP", "title": "Switchblade, gravity, ballistic and butterfly (Balisong) knives and their parts or kits are importations contrary to law and are seized, except for the Armed Forces or a one-armed person's knife with a blade up to 3 inches",
         "citations": [{"label": "19 CFR 12.95", "url": e("12.95")}, {"label": "19 CFR 12.97", "url": e("12.97")}, {"label": "19 CFR 12.98", "url": e("12.98")},
                       {"label": "15 U.S.C. 1241", "url": USC_1241}, {"label": "15 U.S.C. 1244", "url": USC_1244}]},
        {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report 9903.82.09 (25%) or 9903.82.10 (15% total), or the UK (.05), U.S.-melted (.06, .07), Russia (.15–.17) or column 2 (.12) heading, "
         "with the Chapter 82 line; duty on the full value, on top of any FTA rate; 9903.82.03 when the metal is under 15% of the weight",
         "citations": [{"label": "CBP CSMS # 68253075", "url": SRC["csms-68253075"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
        {"id": "melt-pour", "agency": "CBP", "title": "Report the country where the steel was melted and poured on every Section 232 derivative entry",
         "citations": [{"label": "CBP CSMS # 62582900", "url": SRC["csms-62582900"]["url"]}, {"label": "CBP CSMS # 64366327", "url": SRC["csms-64366327"]["url"]}]},
        {"id": "ftz", "agency": "CBP", "title": "Section 232 goods admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
         "citations": [{"label": "19 CFR 146.41", "url": e("146.41")}, {"label": "Proclamation 11021, clause 12", "url": FR11021}]},
        {"id": "sets", "agency": "CBP", "title": "Sets of 8205.90.60, 8206, 8211.10, 8215.10 and 8215.20 pay the rate of the article in the set with the highest rate, with per-unit rates converted to ad valorem equivalents; "
         "report the total number of pieces",
         "citations": [{"label": "HTSUS Chapter 82, additional U.S. note 3 and statistical note 1", "url": CH82}]},
        {"id": "canada-338", "agency": "CBP", "title": "Products of Canada in the note 51(b)(3) list: report 9903.03.14 (+50%) even when USMCA is claimed",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 51", "url": CH99}, {"label": "CBP CSMS # 69606660", "url": SRC["csms-69606660"]["url"]}]},
        {"id": "adcvd-sawblades", "agency": "Commerce (ITA) / CBP", "title": "Antidumping order on diamond sawblades and parts (cores and segments) from China, A-570-900, including blades assembled in Thailand or Canada "
         "by firms found to circumvent it; cash deposit at the producer's rate. Not in the tariff calculator",
         "citations": [{"label": "74 FR 57145 (order)", "url": SRC["fr-E9-26680"]["url"]}, {"label": "91 FR 40976 (2026 sunset review)", "url": SRC["fr-2026-13573"]["url"]},
                       {"label": "84 FR 33920 (circumvention, Thailand)", "url": SRC["fr-2019-15084"]["url"]}, {"label": "85 FR 9737 (circumvention, Canada)", "url": SRC["fr-2020-03362"]["url"]}]},
        {"id": "adcvd-hfht", "agency": "Commerce (ITA) / CBP", "title": "Antidumping orders on heavy forged hand tools from China: hammers and sledges with heads over 1.5 kg, bars over 18 inches and wedges, picks and "
         "mattocks, axes and adzes (A-570-201 to -204). Not in the tariff calculator",
         "citations": [{"label": "87 FR 34846 (continuation)", "url": SRC["fr-2022-12311"]["url"]}, {"label": "87 FR 19073 (sunset review)", "url": SRC["fr-2022-06865"]["url"]}]},
        {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 35% in lieu of column 2 on the note 30 subheadings, plus Section 232 (9903.82.16 / .17) or 12.5% Section 301",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10420 (87 FR 38875)", "url": SRC["procl-10420"]["url"]}]},
    ]
    te["rules"] = rules
    rule_ids = {r["id"] for r in rules}
    for r in rules:
        for cc in r["citations"]:
            assert cc["url"], r["id"]

    S232 = set(c["S25"]) | set(c["EQ"])
    CA = set(c["CA338"])
    SETS = set(c["SETS"])
    MARK = ("8201.50", "8201.60", "8201.90.30", "8203.20.40", "8203.20.60", "8203.20.80", "8203.30", "8205.51.15", "8211", "8212", "8213", "8214.20", "8214.90",
            "8215.10", "8215.20", "8215.91.30", "8215.99.01", "8215.99.05", "8215.99.10", "8215.99.15", "8215.99.20", "8215.99.22", "8215.99.24", "8215.99.26")
    SWITCH = ("8211.93", "8211.94.50", "8211.95.90")
    SAW = ("8202.39", "8206")
    HFHT = ("8201.30.00.10", "8201.40.60.10", "8205.20.60", "8205.59.30")
    GROUP_NOTES = {
        "8201": "Outside Section 232; 2026 Section 301 for most countries. Pruners, shears and secateurs need permanent marking; Chinese picks, mattocks and axes carry heavy forged hand tools AD orders; Canadian 8201.30 tools pay 50% Section 338.",
        "8202": "Outside Section 232 except diamond sawblade cores (25%). Chinese diamond sawblades, cores and segments carry an AD order; Canadian circular and chain saw blades pay 50% Section 338.",
        "8203": "Pliers, pincers and shears need permanent marking; 8203.40.60 cutters are on the Section 232 25% list; Canadian pliers and metal-cutting shears pay 50% Section 338.",
        "8204": "Outside Section 232; 9% base. Canadian wrenches and sockets pay 50% Section 338 even with USMCA.",
        "8205": "Vises, clamps and 8205.59.55 tools on the 25% list; sets of 8205.90.60 take the highest rate in the set. Chinese heavy hammers, bars and wedges carry AD orders.",
        "8206": "Set rate: the highest-rated tool in the set. Canadian sets pay 50% Section 338; Chinese sets containing diamond sawblades fall under the AD order.",
        "8207": "Three die and press-tool lines at 15% total Section 232; the rest outside Section 232. Japan's FTA rate is Free on many lines.",
        "8208": "All Free and outside Section 232; 2026 Section 301 and China List 3 only.",
        "8209": "Outside Section 232. Canadian carbide inserts pay 50% Section 338 even with USMCA.",
        "8210": "Outside Section 232; 3.7% base.",
        "8211": "All on the Section 232 25% list; permanent marking; switchblade-type knives prohibited; knife sets take the highest rate in the set.",
        "8212": "Outside Section 232; permanent marking for safety razors and blades; Canadian razors pay 50% Section 338.",
        "8213": "Outside Section 232 and on no China list; permanent marking for scissors and shears.",
        "8214": "Outside Section 232; permanent marking for clippers and cleavers.",
        "8215": "All on the Section 232 25% list; permanent marking for forks; flatware sets take the highest rate in the set.",
    }

    def rules_for(hts):
        rr = ["marking"]
        if hts.startswith(MARK):
            rr.append("marking-cutlery")
        if hts.startswith(SWITCH):
            rr.append("switchblade")
        if hts in S232:
            rr += ["s232-entry", "melt-pour", "ftz"]
        if hts in SETS:
            rr.append("sets")
        if hts in CA:
            rr.append("canada-338")
        if hts.startswith(SAW) and hts != "8202.39.00.70":
            rr.append("adcvd-sawblades")
        if hts.startswith(HFHT):
            rr.append("adcvd-hfht")
        rr.append("russia")
        return rr

    for g in te["groups"]:
        h = g["heading"]
        g["label"] = G[h][0]
        rr = []
        for ln in te["lines"]:
            if ln["hts"][:4] == h:
                rr += rules_for(ln["hts"])
        g["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        g["note"] = GROUP_NOTES[h]
    LINE = c["LINE"]
    for ln in te["lines"]:
        hts = ln["hts"]
        ln["ruleIds"] = [r for r in dict.fromkeys(rules_for(hts)) if r in rule_ids]
        lv = []
        if hts in S232:
            lv += ["us-melted"]
            if hts not in c["EQ"]:
                lv.append("uk-melt")
            lv.append("metal-weight")
        if hts in SETS:
            lv.append("sets")
        lv.append("origin")
        lv.append("usmca")
        if LINE[hts].get("dutiable") and "Free (" in (LINE[hts].get("effectiveSpecial") or ""):
            lv.append("fta")
        if hts in S232 and hts != "8202.39.00.40":
            lv.append("drawback")
        if "adcvd-sawblades" in ln["ruleIds"] or "adcvd-hfht" in ln["ruleIds"]:
            lv.append("adcvd-scope")
        ln["leverIds"] = lv
    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings and lists change often, and antidumping rates are company-specific "
        "and change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
    )
