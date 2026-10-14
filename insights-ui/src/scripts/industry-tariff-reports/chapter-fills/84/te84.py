"""Writer text for the Chapter 84 tariff-engineering page: agency rules, levers, groups and per-line mapping."""


def e(t, sec):
    return f"https://www.ecfr.gov/current/title-{t}/section-{sec}"


def ep(t, part):
    return f"https://www.ecfr.gov/current/title-{t}/part-{part}"


ENGINE_H = {"8407", "8408", "8424", "8426", "8427", "8429", "8430", "8432", "8433", "8467"}
DOE_H = {"8403", "8413", "8414", "8415", "8418", "8419", "8422", "8450", "8451"}
FTC_H = {"8403", "8414", "8415", "8418", "8419", "8422", "8450"}
HFC_H = {"8415", "8418", "8476"}
HCFC_H = {"8415", "8418"}
FCC_H = {"8471", "8473"}
CLASSIFY_H = {"8409", "8431", "8448", "8466", "8471", "8473", "8479", "8486", "8487"}


def apply(c):
    d, SRC, S, G = c["d"], c["SRC"], c["S"], c["G"]
    te = d["tariffEngineering"]
    CH99, CH84 = c["CH99"], c["CH84"]
    CH98 = SRC["hts-ch98"]["url"]
    GN11 = SRC["hts-gn11"]["url"]
    F11021, F11032, F11002 = SRC["procl-11021"]["url"], SRC["procl-11032"]["url"], SRC["procl-11002"]["url"]

    te["h1"] = "HTS Chapter 84: Machinery and Mechanical Appliances — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Machinery: EPA Engine Rules, DOE Energy Standards, Refrigerants, Section 232 Entry & Ways to Lower Duty (HTS Ch. 84) | KoalaGains",
        "shortDescription": "The rules for each HTS Chapter 84 line: EPA engine certification and Form 3520-21, DOE energy-conservation standards and FTC EnergyGuide labels for appliances "
        "and HVAC, EPA HFC and HCFC refrigerant rules, FCC rules for computers, NRC licenses for reactors, Section 232 reporting, plus the legal ways to pay less.",
        "keywords": [
            "tariff engineering",
            "section 232 metal content",
            "section 232 15 percent metal weight",
            "epa form 3520-21",
            "doe energy conservation standards import",
            "hfc technology transitions rule",
            "usmca machinery",
            "section 232 exclusion list",
        ],
    }
    te["intro"] = (
        "For machinery the paperwork decides both whether goods can enter and what they pay. **Engines** and machines with engines need EPA emission certification and an EPA "
        "declaration at entry; **appliances and HVAC** must meet DOE energy-conservation standards (and carry FTC EnergyGuide labels where required), and A/C units, heat pumps and "
        "refrigerators must use refrigerants EPA still allows; **computers** must meet FCC equipment-authorization rules; nuclear reactors and their major components need an NRC license.\n\n"
        "For duty, the Section 232 lines need the steel, aluminum and copper content and melt or smelt country on every entry, and the duty is charged on the full value with no FTA "
        "reduction. The legal ways to pay less: the **15% metal-weight test**, **U.S.-melted** or **UK-melted** metal, **deal-partner** origin, **USMCA** (it removes the 2026 Section 301 "
        "duty and the auto-parts duty), the **parts-for-equipment** rate, correct **classification** (computers and semiconductor equipment are exempt from the 2026 Section 301 duty), "
        "Chapter 98 for repairs and temporary imports, **drawback**, and checking **AD/CVD scope**. Each rule and lever links to its regulation or proclamation."
    )
    te["regulationsAsOf"] = c["ECFR_AS_OF"]
    te["levers"] = [
        {
            "id": "metal-weight",
            "title": "Check the 15% metal-weight test before paying Section 232",
            "saves": "The whole Section 232 duty (25% or the 15% total) on machines whose steel, aluminum and copper are under 15% of their weight, or that contain none",
            "appliesTo": "Every Section 232 line of Chapter 84 (lists 16(c)(vi), (vii), (ix), (x) and (xi))",
            "document": "A bill of materials with the weight of each metal and of the whole article; enter under 9903.82.03 (metal under 15% of the weight) or 9903.82.01 (no aluminum, steel or copper).",
            "caveat": "On a provision that appears on several lists the weights of the listed metals are added together. The base rate and any other duty (Section 301, AD/CVD) still apply.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c), headings 9903.82.01 and 9903.82.03", "url": CH99},
                {"label": "Proclamation 11021 (91 FR 18201)", "url": F11021},
            ],
        },
        {
            "id": "us-melted",
            "title": "Use U.S.-melted steel or U.S.-smelted aluminum",
            "saves": "15 points on the 25% lists (10% instead of 25%) and 5 points on the equipment list (10% total instead of 15%)",
            "appliesTo": "Derivative lines of 16(c)(vi), (vii) and (xi) (9903.82.06) and equipment of (ix)–(x) (9903.82.07 / .08); parts for equipment manufacture (9903.82.23 / .24)",
            "document": "Mill certificates and supplier declarations showing at least 85% of the steel was melted and poured, or the aluminum smelted and cast, in the United States; reported in ACE.",
            "caveat": "The 85% test applies from June 8, 2026 (Proclamation 11032). Each metal's test must be met for articles on several lists. The 2026 Section 301 duty still does not apply; China's lists do.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(e)", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": F11032},
            ],
        },
        {
            "id": "uk-melt",
            "title": "Buy UK goods made of UK-melted steel or UK-smelted aluminum",
            "saves": "10 points on the 25% list (15%, 9903.82.05)",
            "appliesTo": "Lines on lists 16(c)(vi)–(vii), for products of the United Kingdom",
            "document": "Mill test certificates and melt-and-pour / smelt-and-cast reporting showing at least 95% of the metal is UK-made (note 16(d)).",
            "caveat": "UK equipment lines already pay the 15% equipment rate, and UK mobile machinery the 15% deal rate.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d)", "url": CH99},
                {"label": "Proclamation 11021 (91 FR 18201)", "url": F11021},
            ],
        },
        {
            "id": "deal-partner",
            "title": "Source from a deal partner (EU, Japan, Korea, Taiwan, Switzerland, UK)",
            "saves": "The 2026 Section 301 duty becomes a 10% or 12.5% total that replaces a lower base rate; mobile machinery pays a 15% total instead of 25%; car parts 15% (UK 10%) instead of 25%",
            "appliesTo": "Most Chapter 84 lines, for products of those countries",
            "document": "Proof of origin (the article's country of origin under the substantial-transformation rules; a CBP binding ruling when in doubt).",
            "caveat": "The Section 232 25% list and the 15% equipment rate are the same for every country (UK goods with UK metal 15%). AD/CVD orders may still apply (Japanese crawler cranes, German and Italian fluid end blocks).",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 52(k) and 16, heading 9903.82.22", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": F11032},
                {"label": "19 CFR part 177 (rulings)", "url": ep(19, 177)},
            ],
        },
        {
            "id": "usmca",
            "title": "Claim USMCA for Canadian and Mexican machinery",
            "saves": "The 10% Section 301 duty (9903.05.93, 9903.05.94), the 25% auto-parts and truck-parts duties (9903.94.06, 9903.74.10), and Section 232 on the U.S. content (up to 40%) of mobile machinery (9903.82.21)",
            "appliesTo": "Originating goods of Canada or Mexico on any Chapter 84 line",
            "document": "A USMCA certification of origin from the importer, exporter or producer, available to CBP on request; for mobile machinery, the value of U.S.-made parts.",
            "caveat": "A USMCA claim does not reduce Section 232 on the derivative and equipment lists (note 16(b)) or the 50% Section 338 duty on Canada's 56 listed lines.",
            "citations": [
                {"label": "19 CFR 182.12", "url": e(19, "182.12")},
                {"label": "HTSUS General Note 11", "url": GN11},
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 16(j), 33(h), 52(g)–(h)", "url": CH99},
            ],
        },
        {
            "id": "ag-parts",
            "title": "Parts used to make agricultural or industrial equipment",
            "saves": "10 points: a 15% total (9903.82.25) instead of 25%, or 10% with U.S.-melted metal (9903.82.23)",
            "appliesTo": "Parts on lists 16(c)(vi)–(viii) in Chapters 84, 85 or 87 used only to manufacture the agricultural, fixed industrial or mobile equipment of lists (ix)–(xi)",
            "document": "Records showing the parts are used exclusively in manufacturing that equipment (note 16(k)).",
            "caveat": "Not for products of Belarus, Cuba, North Korea or Russia. Temporary, like the equipment rate; parts for other uses pay 25%.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(k)", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": F11032},
            ],
        },
        {
            "id": "classification",
            "title": "Get the classification right",
            "saves": "The 2026 Section 301 duty (computers of 8471, parts of 8473.30 and semiconductor equipment of 8486 are exempt) and Section 232 (only listed provisions pay)",
            "appliesTo": "Machines with computers built in, parts headings (8409, 8431, 8448, 8466, 8473, 8487) and multi-function machines",
            "document": "Technical specifications showing the principal function; a CBP binding ruling (19 CFR part 177) for borderline goods.",
            "caveat": "A machine that incorporates a computer but performs a specific function goes in the heading for that function (note 6(E) to Chapter 84), not 8471. Parts that are goods of their own heading go there (Section XVI note 2).",
            "citations": [
                {"label": "HTSUS Section XVI notes 2–4 and Chapter 84 notes 6 and 11", "url": CH84},
                {"label": "19 CFR part 177 (rulings)", "url": ep(19, 177)},
            ],
        },
        {
            "id": "semiconductor-enduse",
            "title": "Declare an exempt end use for computers with covered AI chips",
            "saves": "The 25% Section 232 semiconductor duty (9903.79.01)",
            "appliesTo": "Units of 8471.50, 8471.80 and parts of 8473.30 that contain a logic chip within the note 39(b) thresholds",
            "document": "Entry under the end-use heading (9903.79.03 U.S. data centers, .04 repairs, .05 R&D, .06 startups, .07 consumer, .08 civil industrial, .09 public sector) with the records CBP requires.",
            "caveat": "Units without a covered chip already enter duty-free under 9903.79.02.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 39", "url": CH99},
                {"label": "Proclamation 11002 (91 FR 2443)", "url": F11002},
            ],
        },
        {
            "id": "origin",
            "title": "Avoid Chinese origin",
            "saves": "25% (or 7.5%) of the value on top of the 12.5% 2026 duty or Section 232",
            "appliesTo": "The Chapter 84 lines on Section 301 Lists 1–4A, for goods of China",
            "document": "Production records showing where the machine was made; origin follows the last substantial transformation (for goods processed in Canada or Mexico, the tariff-shift rules of 19 CFR 102.20). Ask CBP for a binding ruling.",
            "caveat": "Assembly of Chinese components elsewhere may not change origin, and AD/CVD orders have circumvention findings (small engines, 2026).",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20 and 31", "url": CH99},
                {"label": "19 CFR 102.20", "url": e(19, "102.20")},
                {"label": "19 CFR part 177 (rulings)", "url": ep(19, 177)},
            ],
        },
        {
            "id": "chapter-98",
            "title": "Use Chapter 98 for repairs, returns and temporary imports",
            "saves": "Duty only on the value of repairs done abroad; no duty on U.S. goods returned unimproved; no duty, under bond, on machinery brought in temporarily for repair, testing or as samples",
            "appliesTo": "Machines sent abroad for repair or warranty work, U.S. machinery returned, and machines imported temporarily",
            "document": "Export documentation and repair invoices (19 CFR 10.8); a temporary importation bond (19 CFR 10.31), with export within one year (extendable).",
            "caveat": "The 2026 Section 301 and Section 232 duties apply to the value of the repairs under 9802.00.40/.50 (Section 232 on the full value under 9802.00.60).",
            "provisions": [
                {"code": "9801.00.10", "rate": "Free", "text": "U.S. goods returned without having been advanced in value or improved in condition abroad."},
                {"code": "9802.00.40", "rate": "Duty on the value of the repairs", "text": "Repairs or alterations made abroad under warranty."},
                {"code": "9802.00.50", "rate": "Duty on the value of the repairs", "text": "Other articles repaired or altered abroad."},
                {"code": "9813.00.05", "rate": "Free, under bond", "text": "Articles to be repaired, altered or processed in the United States."},
                {"code": "9813.00.30", "rate": "Free, under bond", "text": "Articles solely for testing, experimental or review purposes."},
            ],
            "citations": [
                {"label": "HTSUS Chapter 98", "url": CH98},
                {"label": "19 CFR 10.8", "url": e(19, "10.8")},
                {"label": "19 CFR 10.31", "url": e(19, "10.31")},
            ],
        },
        {
            "id": "drawback",
            "title": "Drawback on exported machinery and parts",
            "saves": "Up to 99% of the base rate and Section 301 duties on imports that are exported or used to make exports; Section 232 duty only for listed goods of trade-agreement partners",
            "appliesTo": "Any Chapter 84 line; Section 232 drawback only for Annex I-B and Annex III goods whose metal was melted or smelted in a trade-agreement partner (Proclamation 11021 clauses 13–14)",
            "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
            "caveat": "AD/CVD are never refundable (19 CFR 191.3(b)(3)).",
            "citations": [
                {"label": "Proclamation 11021, clauses 13–14", "url": F11021},
                {"label": "19 CFR part 191", "url": ep(19, 191)},
                {"label": "19 CFR 191.3", "url": e(19, "191.3")},
            ],
        },
        {
            "id": "adcvd-scope",
            "title": "Check AD/CVD scope before you buy",
            "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
            "appliesTo": "Engines, outdoor power equipment, pressure washers, aerial work platforms, cranes, washers, appliance racks, bearings, fluid end blocks, slag pots and aluminum extrusion parts",
            "document": "The order's written scope (it, not the HTS number, decides) and the producer's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
            "caveat": "A product in scope pays the cash deposit even if entered under another HTS line. Rates change with each administrative review.",
            "citations": [{"label": "19 CFR 351.225 (scope rulings)", "url": e(19, "351.225")}],
        },
    ]
    rules = [
        {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report the 9903.82 heading with the Chapter 84 line, the steel, aluminum and copper content, and the melt-and-pour / smelt-and-cast countries; duty on the full value, on top of any FTA rate",
         "citations": [{"label": "CBP CSMS # 68253075", "url": SRC["csms-68253075"]["url"]}, {"label": "CBP CSMS # 64366327", "url": SRC["csms-64366327"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
        {"id": "ftz", "agency": "CBP", "title": "Section 232 goods admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
         "citations": [{"label": "19 CFR 146.41", "url": e(19, "146.41")}, {"label": "Proclamation 11021, clause 12", "url": F11021}]},
        {"id": "auto-parts-entry", "agency": "CBP", "title": "Auto and truck parts: report 9903.94.05 / 9903.74.08 (or the deal-partner, USMCA or certified-election heading) when the goods are vehicle parts",
         "citations": [{"label": "CBP CSMS # 64916652", "url": SRC["csms-64916652"]["url"]}, {"label": "CBP CSMS # 66665333", "url": SRC["csms-66665333"]["url"]},
                       {"label": "CBP Section 232 FAQs: autos and auto parts", "url": SRC["cbp-section-232-additional-faqs-autos"]["url"]}]},
        {"id": "semiconductor-entry", "agency": "CBP", "title": "Computers and parts of 8471.50, 8471.80 and 8473.30: report 9903.79.01 for covered chips, an end-use heading (9903.79.03–.09), or 9903.79.02",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 39", "url": CH99}, {"label": "Proclamation 11002 (91 FR 2443)", "url": F11002}]},
        {"id": "epa-engines", "agency": "EPA / CBP", "title": "Engines and machines with engines (outboard and small engines, diesel engines, generators, mowers, chainsaws, forklifts, construction machinery): EPA certificate of conformity and label, and EPA Declaration Form 3520-21 at entry",
         "citations": [{"label": "40 CFR 1068.301", "url": e(40, "1068.301")}, {"label": "19 CFR 12.74", "url": e(19, "12.74")}, {"label": "40 CFR part 1054 (small spark-ignition engines)", "url": ep(40, 1054)},
                       {"label": "40 CFR part 1039 (nonroad diesel engines)", "url": ep(40, 1039)}, {"label": "19 CFR 12.73 (motor vehicle engines)", "url": e(19, "12.73")}]},
        {"id": "doe-energy", "agency": "DOE / CBP", "title": "Covered appliances and equipment (refrigerators, freezers, room and central A/C, heat pumps, clothes washers and dryers, dishwashers, boilers, water heaters, fans, pumps, compressors) must meet DOE energy-conservation standards and certification; noncompliant goods are refused entry",
         "citations": [{"label": "10 CFR 429.5", "url": e(10, "429.5")}, {"label": "10 CFR part 430 (consumer products)", "url": ep(10, 430)}, {"label": "10 CFR 430.32", "url": e(10, "430.32")},
                       {"label": "10 CFR part 431 (commercial and industrial equipment)", "url": ep(10, 431)}]},
        {"id": "ftc-energyguide", "agency": "FTC", "title": "EnergyGuide labels on refrigerators, freezers, clothes washers, dishwashers, water heaters, room and central A/C, heat pumps, furnaces, boilers and ceiling fans",
         "citations": [{"label": "16 CFR part 305", "url": ep(16, 305)}]},
        {"id": "epa-hfc", "agency": "EPA", "title": "No manufacture or import of products using restricted HFCs: residential and light commercial A/C and heat pumps with refrigerant GWP of 700 or more and household refrigerators, stand-alone retail refrigeration and vending machines of 150 or more (from January 1, 2025); later dates for other equipment",
         "citations": [{"label": "40 CFR 84.54", "url": e(40, "84.54")}, {"label": "40 CFR part 84", "url": ep(40, 84)}]},
        {"id": "epa-hcfc", "agency": "EPA", "title": "No sale or distribution of A/C and refrigeration appliances or components pre-charged with HCFC-22 or HCFC-142b made on or after January 1, 2010",
         "citations": [{"label": "40 CFR 82.304", "url": e(40, "82.304")}, {"label": "40 CFR 82.15 (HCFC use restrictions)", "url": e(40, "82.15")}]},
        {"id": "fcc", "agency": "FCC / CBP", "title": "Computers and other digital devices are radio-frequency devices: they may be imported only with a valid FCC equipment authorization (or under the testing, trade-show or export-only exceptions)",
         "citations": [{"label": "47 CFR 2.1204", "url": e(47, "2.1204")}, {"label": "47 CFR part 15", "url": ep(47, 15)}]},
        {"id": "nrc", "agency": "NRC", "title": "Nuclear reactors, fuel and reactor components: import under an NRC license (a general license covers major components for an NRC-licensed facility)",
         "citations": [{"label": "10 CFR 110.27", "url": e(10, "110.27")}, {"label": "10 CFR part 110", "url": ep(10, 110)}]},
        {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container (19 CFR part 134)",
         "citations": [{"label": "19 CFR 134.11", "url": e(19, "134.11")}, {"label": "19 CFR part 134", "url": ep(19, 134)}]},
        {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 35% in lieu of column 2 on note 30(b) subheadings, plus Section 232 and the 200% Russian aluminum duty",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 19 and 30", "url": CH99}, {"label": "Proclamation 10420 (87 FR 38875)", "url": SRC["procl-10420"]["url"]}]},
    ]
    for rid, agency, title, cites in c["ADCVD_RULES"]:
        rules.append({"id": rid, "agency": agency, "title": title, "citations": [{"label": lab, "url": SRC[sid]["url"]} for lab, sid in cites]})
    te["rules"] = rules
    rule_ids = {r["id"] for r in rules}
    lever_ids = {lv["id"] for lv in te["levers"]}

    S25, SEQ, SMOB = set(S["s232_25"]), set(S["s232_eq15"]), set(S["s232_mobile"])
    S232 = S25 | SEQ | SMOB
    AUTO, MHDV, SEMI, AG, CN = set(S["auto"]), set(S["mhdv"]), set(S["semi"]), set(S["s232_agparts"]), c["CN_ANY"]
    EX52B, CA338 = c["EX52B"], set(S["ca338"])
    ADH = c["ADCVD_BY_HEADING"]

    def rules_for(h, lines):
        rr = []
        if lines & S232:
            rr += ["s232-entry", "ftz"]
        if lines & (AUTO | MHDV):
            rr.append("auto-parts-entry")
        if lines & SEMI:
            rr.append("semiconductor-entry")
        if h in ENGINE_H:
            rr.append("epa-engines")
        if h in DOE_H:
            rr.append("doe-energy")
        if h in FTC_H:
            rr.append("ftc-energyguide")
        if h in HFC_H:
            rr.append("epa-hfc")
        if h in HCFC_H:
            rr.append("epa-hcfc")
        if h in FCC_H:
            rr.append("fcc")
        if h == "8401":
            rr.append("nrc")
        rr.append("marking")
        rr += ADH.get(h, [])
        rr.append("russia")
        return [r for r in dict.fromkeys(rr) if r in rule_ids]

    def levers_for(hts):
        h = hts[:4]
        lv = []
        if hts in S232:
            lv.append("metal-weight")
            lv.append("us-melted")
            if hts in S25:
                lv.append("uk-melt")
            if hts in AG:
                lv.append("ag-parts")
            if hts in SMOB:
                lv += ["deal-partner", "usmca"]
        else:
            if hts not in EX52B:
                lv += ["deal-partner", "usmca"]
        if hts in AUTO | MHDV and "usmca" not in lv:
            lv.append("usmca")
        if h in CLASSIFY_H:
            lv.append("classification")
        if hts in SEMI:
            lv.append("semiconductor-enduse")
        if hts in CN:
            lv.append("origin")
        lv += ["chapter-98", "drawback"]
        if ADH.get(h):
            lv.append("adcvd-scope")
        out = list(dict.fromkeys(lv))
        assert set(out) <= lever_ids, out
        return out

    by_head = {}
    for ln in te["lines"]:
        by_head.setdefault(ln["hts"][:4], set()).add(ln["hts"])
    for g in te["groups"]:
        h = g["heading"]
        lines = by_head[h]
        g["label"] = G[h][0]
        g["ruleIds"] = rules_for(h, lines)
        g["note"] = group_note(h, lines, S25, SEQ, SMOB, AUTO | MHDV, SEMI, EX52B, CA338, ADH)
    for ln in te["lines"]:
        h = ln["hts"][:4]
        ln["ruleIds"] = rules_for(h, {ln["hts"]})
        ln["leverIds"] = levers_for(ln["hts"])
    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 lists and rates change often, the equipment rate is temporary, "
        "and AD/CVD rates are company-specific and change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and the agencies' latest notices before importing."
    )


SPECIAL = {
    "8401": "Nuclear reactor components need an NRC import license.",
    "8407": "Small vertical shaft engines from China carry AD/CVD; engines need EPA certification.",
    "8408": "Diesel engines need EPA certification; truck engines can pay the truck-parts duty.",
    "8411": "Jet engines and parts: Proclamation 11040 imposed no Section 232 tariff; civil aircraft parts can claim note 52(d).",
    "8413": "Fluid end blocks for pumps from Germany, Italy, China and India carry AD/CVD.",
    "8414": "Air compressors from China, Malaysia and Vietnam are under AD/CVD investigation.",
    "8415": "DOE efficiency standards and EPA refrigerant limits apply to A/C and heat pumps.",
    "8418": "DOE standards, EnergyGuide labels and EPA refrigerant limits; Chinese appliance racks carry AD/CVD.",
    "8422": "Household dishwashers need DOE certification; Canadian packaging machinery pays Section 338.",
    "8426": "Japanese crawler cranes carry AD; Chinese ship-to-shore cranes pay 25% (100% more from November 10, 2026).",
    "8427": "Chinese aerial work platforms carry AD/CVD.",
    "8433": "Lawn mower AD/CVD orders were revoked in September 2026; small-engine orders still apply to engines.",
    "8450": "Washers from China and Mexico carry AD orders; the Section 201 safeguard ended in 2023.",
    "8471": "Laptops are on no China Section 301 list; FCC equipment authorization needed.",
    "8479": "Industrial robots of 8479.50 are not on the Section 232 lists; a Section 232 investigation of robotics is open.",
    "8482": "Tapered roller bearings from China carry AD.",
    "8486": "Some Chinese solar-wafer and semiconductor equipment is excluded from the China Section 301 lists until November 9, 2026.",
}


def group_note(h, lines, S25, SEQ, SMOB, AUTO, SEMI, EX52B, CA338, ADH):
    n = len(lines)

    def k(x, one, many):
        return f"{x} {one if x == 1 else many}"

    a, b, m = len(lines & S25), len(lines & SEQ), len(lines & SMOB)
    sub = [t for t in (f"{a} at 25%" if a else "", f"{b} at the 15% equipment rate" if b else "", f"{m} mobile machinery at 25% (15% for deal partners)" if m else "") if t]
    if sub:
        parts = [f"Section 232 on {a + b + m} of {n} lines (" + ", ".join(sub) + ")"]
    else:
        parts = ["Not on the Section 232 metals lists"]
    x = len(lines & AUTO)
    if x:
        parts.append(k(x, "line can pay", "lines can pay") + " the auto- or truck-parts duty")
    if lines & EX52B:
        parts.append(k(len(lines & EX52B), "line is", "lines are") + " exempt from the 2026 Section 301 duties (note 52(b))")
    if lines & SEMI:
        parts.append(k(len(lines & SEMI), "line can pay", "lines can pay") + " the Section 232 semiconductor duty")
    if lines & CA338:
        parts.append(k(len(lines & CA338), "line pays", "lines pay") + " Canada's 50% Section 338 duty")
    note = "; ".join(parts) + "."
    if h in SPECIAL:
        note += " " + SPECIAL[h]
    elif ADH.get(h):
        note += " Some products carry AD/CVD orders."
    return note
