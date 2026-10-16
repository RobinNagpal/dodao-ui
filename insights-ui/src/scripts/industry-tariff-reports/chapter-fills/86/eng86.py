"""Chapter 86 tariffEngineering page: agency rules (eCFR, up to date as of 2026-10-08) and duty levers mapped to lines."""

from groups86 import G


def e19(sec):
    return f"https://www.ecfr.gov/current/title-19/section-{sec}"


def p19(part):
    return f"https://www.ecfr.gov/current/title-19/part-{part}"


def e49(sec):
    return f"https://www.ecfr.gov/current/title-49/section-{sec}"


def p49(part):
    return f"https://www.ecfr.gov/current/title-49/part-{part}"


def apply_engineering(c):
    d, SRC = c["d"], c["SRC"]
    te = d["tariffEngineering"]
    CH99, CH86, CH98 = c["CH99_PDF"], c["CH86_PDF"], c["CH98_PDF"]
    FR11021 = SRC["procl-11021"]["url"]
    te["h1"] = "HTS Chapter 86: Railway Locomotives, Rolling Stock, Track Fixtures & Containers — Import Rules & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Locomotives, Railcars & Containers: Entry Rules, FRA Content Limits, Section 232 & Ways to Lower Duty (HTS Ch. 86) | KoalaGains",
        "shortDescription": "The rules for each HTS Chapter 86 line: Section 232 headings and melt-and-pour reporting, bond release of duty-free locomotives and freight cars, international-traffic "
        "admission of rail equipment and containers, FRA's freight car content limits, coupler AD/CVD scope, plus the legal ways to pay less: USMCA, U.S.-melted steel, drawback, repairs abroad and FTZs.",
        "keywords": [
            "tariff engineering",
            "HTS Chapter 86 tariff engineering",
            "railcar import rules",
            "locomotive import",
            "instruments of international traffic containers",
            "freight car content limit",
            "steel derivative tariff calculation",
        ],
    }
    te["intro"] = (
        "Rail equipment has its own entry rules. Locomotives and freight cars **on which no duty is owed** can be released without a formal entry under a CBP bond (Chapter 86 additional U.S. note 1; "
        "19 CFR 141.4), but Section 232 now puts duty on locomotives and tank cars, so they need a regular entry. Foreign locomotives and railcars running through on a cross-border route, and "
        "containers arriving in use in international traffic, are admitted **without entry or duty** (19 CFR 123.12, 10.41a). Every Section 232 entry reports 9903.82.09 (or a lower-rate heading) "
        "and the **country where the steel was melted and poured**. New freight cars must also meet FRA's **content limits**: from December 19, 2025, no more than 20% of a car's content may come from "
        "a country of concern or a state-owned enterprise there.\n\n"
        "The legal ways to pay less: **USMCA** for Canadian and Mexican cars and parts (it removes the base rate and the 2026 Section 301 duty, but not Section 232), steel that is **U.S.-melted** (10%) "
        "or **UK-melted** (15%), **drawback** on these 25% list goods from trade-agreement partners, the **Chapter 98** treatment for U.S. equipment returned or repaired abroad, **foreign-trade zones** "
        "for rail-car assembly, avoiding **Chinese origin**, and checking **AD/CVD scope** for couplers. Each rule and lever links to its regulation or proclamation."
    )
    te["regulationsAsOf"] = c["ECFR_AS_OF"]
    te["levers"] = [
        {
            "id": "usmca",
            "title": "Claim USMCA for Canadian and Mexican railcars and parts",
            "saves": "The base rate (up to 14% on railcars and coaches) on every line, plus the 10% 2026 Section 301 duty on the 14 lines outside Section 232 (9903.05.93, 9903.05.94)",
            "appliesTo": "Originating goods of Canada or Mexico, in particular freight cars (8606), coaches (8605), self-propelled cars (8603) and dutiable parts",
            "document": "A USMCA certification of origin from the importer, exporter or producer, available to CBP on request; the railcar must meet the USMCA rule of origin for its heading.",
            "caveat": "A USMCA claim does not reduce Section 232 (note 16(b)): tank cars, coaches and listed parts still pay 25%. A USMCA freight car outside Section 232 owes no duty and can be released "
            "under a bond without a formal entry.",
            "citations": [
                {"label": "19 CFR 182.12", "url": e19("182.12")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 16(b) and 52(g)–(h)", "url": CH99},
            ],
        },
        {
            "id": "us-melted",
            "title": "Use U.S.-melted steel",
            "saves": "15 points of Section 232 (10% instead of 25%, heading 9903.82.06)",
            "appliesTo": "The 23 Section 232 lines: locomotives, self-propelled cars, service vehicles, coaches, tank cars, wheels, axles, couplers, other listed parts and containers",
            "document": "Mill certificates and supplier declarations showing the melt-and-pour country of the steel, enough to prove at least 85% (by weight) was melted and poured in the United States; reported in ACE.",
            "caveat": "The 85% test applies from June 8, 2026 (before that, all of it). The base rate and China's Section 301 duty still apply.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(e), heading 9903.82.06", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": SRC["procl-11032"]["url"]},
            ],
        },
        {
            "id": "uk-melt",
            "title": "Buy UK goods made of UK-melted steel",
            "saves": "10 points of Section 232 (15% instead of 25%, heading 9903.82.05)",
            "appliesTo": "The 23 Section 232 lines, for products of the United Kingdom",
            "document": "Mill test certificates and melt-and-pour reporting showing that at least 95% of the steel was melted and poured in the UK.",
            "caveat": "Origin must be the UK and the 95% test must be met; otherwise 25%.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d)", "url": CH99},
                {"label": "Proclamation 11021 (91 FR 18201)", "url": FR11021},
            ],
        },
        {
            "id": "drawback",
            "title": "Manufacturing drawback on Section 232 duty",
            "saves": "Up to 99% of the Section 232 duty (and the ordinary duties) on imported equipment or parts used to make exported products",
            "appliesTo": "The Section 232 lines (all on the Annex I-B 25% list) when they are products of the UK, EU, Japan, Korea, Mexico or Canada whose steel was entirely melted and poured in one of them; ordinary duties on all lines",
            "document": "A manufacturing drawback claim to CBP under 19 U.S.C. 1313(a) or (b), with import, production and export records (19 CFR part 191).",
            "caveat": "Only manufacturing drawback qualifies (Proclamation 11021 clauses 13–14), and not for merchandise of a type under an AD/CVD order from any country, so freight rail couplers are out. AD/CVD are never refundable (19 CFR 191.3(b)(3)).",
            "citations": [
                {"label": "Proclamation 11021, clauses 13–14", "url": FR11021},
                {"label": "19 CFR part 191", "url": p19(191)},
                {"label": "19 CFR 191.3", "url": e19("191.3")},
            ],
        },
        {
            "id": "intl-traffic",
            "title": "Keep containers and cross-border rail equipment in international traffic",
            "saves": "The whole duty: equipment admitted as instruments of international traffic is not entered and pays no duty",
            "appliesTo": "Containers (8609) arriving in use in international shipping, and foreign locomotives and railcars on a continuous cross-border run (8601–8606)",
            "document": "No entry; the carrier reports the equipment. Containers must leave or be used under the conditions of 19 CFR 10.41a; foreign rail equipment may only do traffic incidental to its run (19 CFR 123.12).",
            "caveat": "Containers or railcars kept for domestic use (for example 53-foot domestic containers or cars bought for U.S. service) must be formally entered and pay Section 232.",
            "citations": [
                {"label": "19 CFR 10.41a", "url": e19("10.41a")},
                {"label": "19 CFR 123.12", "url": e19("123.12")},
                {"label": "19 CFR 141.4(b)(3)", "url": e19("141.4")},
            ],
        },
        {
            "id": "chapter98",
            "title": "U.S. equipment returned, or repaired abroad",
            "saves": "The full duty on U.S.-built equipment returned unchanged (9801.00.10), or all but the duty on the repair value for cars repaired abroad (9802.00.40 / 9802.00.50; Free for USMCA repairs)",
            "appliesTo": "U.S.-made locomotives, railcars and parts returned to the United States, and cars sent to Canada, Mexico or elsewhere for repair or rebuilding",
            "document": "Proof of U.S. origin and export (9801.00.10), or the export record and the foreign repairer's invoice for the repair value (19 CFR 10.8).",
            "caveat": "Note 16(b) keeps Chapter 98 treatment for Section 232 goods, so the Section 232 duty follows the Chapter 98 basis (for repairs, the value of the repair). A rebuild that creates a new article does not qualify.",
            "citations": [
                {"label": "HTSUS Chapter 98, 9801.00.10 and 9802.00.40–.50", "url": CH98},
                {"label": "19 CFR 10.8", "url": e19("10.8")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(b)", "url": CH99},
            ],
        },
        {
            "id": "ftz",
            "title": "Assemble rolling stock in a foreign-trade zone",
            "saves": "Duty deferral, and on components outside Section 232 the choice between the component rate and the rate on the finished car",
            "appliesTo": "Rail-car and locomotive production in an FTZ with FTZ Board authority (for example, passenger rolling stock in Subzone 30G, Salt Lake City)",
            "document": "An FTZ Board production notification and approval (15 CFR 400.14, 400.22), and zone admission records.",
            "caveat": "Section 232 components must be admitted in privileged foreign status (Proclamation 11021 clause 12; 19 CFR 146.41), so they keep their 25% duty whatever the finished car's rate.",
            "citations": [
                {"label": "FTZ Board notice for Stadler US (91 FR 15947)", "url": SRC["fr-2026-06194"]["url"]},
                {"label": "19 CFR 146.41", "url": e19("146.41")},
                {"label": "Proclamation 11021, clause 12", "url": FR11021},
            ],
        },
        {
            "id": "origin",
            "title": "Avoid Chinese origin",
            "saves": "25% of the value: Chinese goods pay Section 301 on top of Section 232 (about 50% on most of the chapter), plus coupler AD/CVD",
            "appliesTo": "Every Chapter 86 line except containers (8609), for goods of China",
            "document": "Production records showing where the article was made; origin follows the last substantial transformation. For couplers, the AD/CVD orders follow the country where the coupler body or knuckle was cast.",
            "caveat": "Third-country assembly does not change the Section 232 rate, and Chinese-cast couplers stay subject to the China AD/CVD orders even on cars finished elsewhere.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99},
                {"label": "19 CFR part 177 (rulings)", "url": p19(177)},
            ],
        },
        {
            "id": "adcvd-scope",
            "title": "Check coupler AD/CVD scope before you buy",
            "saves": "The whole antidumping or countervailing duty, when the coupler or producer is outside the order",
            "appliesTo": "Freight rail couplers, knuckles and coupler bodies (8607.30.10), and railcars of 8606 fitted with them",
            "document": "The order's written scope (it, not the HTS number, decides), where each coupler body and knuckle was cast, and the producer's cash-deposit rate; when unsure, request a scope ruling.",
            "caveat": "Couplers on finished railcars are covered by casting origin. Locks, pins and other small parts imported alone are outside the orders.",
            "citations": [
                {"label": "19 CFR 351.225 (scope rulings)", "url": e19("351.225")},
                {"label": "88 FR 45138 (China AD order, scope)", "url": SRC["fr-2023-14892"]["url"]},
            ],
        },
        {
            "id": "ruling",
            "title": "Get a binding ruling on borderline parts",
            "saves": "Avoids paying the wrong rate: a part classified outside Chapter 86 (electrical signaling 8530, steel track material 7302, general-use parts) carries different duties",
            "appliesTo": "Rail parts and track or signaling equipment (8607, 8608)",
            "document": "A CBP binding ruling request with drawings and specifications; Section XVII note 2 and Chapter 86 notes 1–3 decide what counts as a rail part or track fixture.",
            "caveat": "The ruling binds only for the goods described. Steel track material of 7302 pays 50% Section 232.",
            "citations": [
                {"label": "HTSUS Section XVII and Chapter 86 notes", "url": CH86},
                {"label": "19 CFR part 177", "url": p19(177)},
            ],
        },
    ]
    rules = [
        {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report 9903.82.09 (25%), or the UK (9903.82.05), U.S.-melted (9903.82.06) or Russia (9903.82.16) heading, with the Chapter 86 line; duty on the full value, on top of any FTA rate",
         "citations": [{"label": "CBP CSMS # 68253075", "url": SRC["csms-68253075"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
        {"id": "melt-pour", "agency": "CBP", "title": "Report the country where the steel was melted and poured on every Section 232 derivative entry",
         "citations": [{"label": "CBP CSMS # 62582900", "url": SRC["csms-62582900"]["url"]}, {"label": "CBP CSMS # 64366327", "url": SRC["csms-64366327"]["url"]}]},
        {"id": "ftz-pf", "agency": "CBP", "title": "Section 232 goods admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
         "citations": [{"label": "19 CFR 146.41", "url": e19("146.41")}, {"label": "Proclamation 11021, clause 12", "url": FR11021}]},
        {"id": "bond-release", "agency": "CBP", "title": "Locomotives (8601, 8602) and freight cars (8606) on which no duty is owed may be released without a formal entry on a CBP Form 301 bond; with Section 232 or other duty owed, file a regular entry",
         "citations": [{"label": "19 CFR 141.4(b)(4), (d)", "url": e19("141.4")}, {"label": "HTSUS Chapter 86, additional U.S. note 1", "url": CH86}]},
        {"id": "rail-intl-traffic", "agency": "CBP", "title": "Foreign locomotives and railroad equipment on a continuous cross-border route are admitted without entry or duty to finish the run and leave; local use is limited",
         "citations": [{"label": "19 CFR 123.12", "url": e19("123.12")}]},
        {"id": "containers-iit", "agency": "CBP", "title": "Containers arriving in use in international traffic are instruments of international traffic, released without entry or duty; containers imported for domestic use are entered",
         "citations": [{"label": "19 CFR 10.41a", "url": e19("10.41a")}, {"label": "19 CFR 141.4(b)(3)", "url": e19("141.4")}]},
        {"id": "fra-content", "agency": "FRA (DOT)", "title": "New freight cars (wholly made on or after December 19, 2025): at most 20% of content (15% from December 19, 2028) from a country of concern or its state-owned enterprises, no sensitive technology from them; the maker certifies to FRA every year, and noncompliant cars cannot be registered in Umler",
         "citations": [{"label": "49 CFR 215.401", "url": e49("215.401")}, {"label": "49 CFR 215.403", "url": e49("215.403")}, {"label": "49 CFR 215.405", "url": e49("215.405")}, {"label": "Final rule (89 FR 103677)", "url": SRC["fr-2024-30030"]["url"]}]},
        {"id": "fra-safety", "agency": "FRA (DOT)", "title": "Rolling stock used on the U.S. general railroad system must meet FRA safety standards: freight cars (49 CFR part 215), safety appliances (part 231), brakes (part 232), locomotives (part 229), passenger equipment (part 238)",
         "citations": [{"label": "49 CFR part 215", "url": p49(215)}, {"label": "49 CFR part 231", "url": p49(231)}, {"label": "49 CFR part 229", "url": p49(229)}, {"label": "49 CFR part 238", "url": p49(238)}]},
        {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container (19 CFR part 134)",
         "citations": [{"label": "19 CFR 134.11", "url": e19("134.11")}, {"label": "19 CFR part 134", "url": p19(134)}]},
        {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 35% in lieu of column 2 on wheels (8607.19.12) and containers (8609), plus Section 232 (9903.82.16)",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10420 (87 FR 38875)", "url": SRC["procl-10420"]["url"]}]},
    ]
    for rid, agency, title, cites in c["ADCVD_RULES"]:
        rules.append({"id": rid, "agency": agency, "title": title, "citations": [{"label": lab, "url": SRC[sid]["url"]} for lab, sid in cites]})
    te["rules"] = rules
    rule_ids = {r["id"] for r in rules}

    S232, NON = set(c["S232"]), set(c["NON232"])
    LINE = c["LINE"]
    ADH, ADL = c["ADCVD_BY_HEADING"], c["ADCVD_BY_LINE"]
    GROUP_NOTES = {
        "8601": "25% Section 232; duty is now owed, so the bond release for duty-free locomotives no longer applies. Cross-border run-through locomotives enter without duty.",
        "8602": "25% Section 232; duty is now owed, so the bond release for duty-free locomotives no longer applies. Cross-border run-through locomotives enter without duty.",
        "8603": "5% base (Free under USMCA and most FTAs) plus 25% Section 232; FRA safety standards for passenger equipment.",
        "8604": "2.9% base plus 25% Section 232.",
        "8605": "14% base (Free under USMCA and most FTAs) plus 25% Section 232; passenger equipment must meet 49 CFR part 238.",
        "8606": "Tank cars pay 25% Section 232; other freight cars are outside it and, with USMCA, owe no duty and can be released on a bond. FRA content limits apply to new cars; coupler AD/CVD follows the casting origin of the couplers on the car.",
        "8607": "14 lines pay 25% Section 232; bolsters, side frames, 8607.12 trucks, freight-car brakes and 8607.99.10 parts are outside it. Freight rail couplers carry AD/CVD orders.",
        "8608": "Outside Section 232: base 3.8% (Free under USMCA and most FTAs) plus the 2026 Section 301 duty for most countries. Electrical signaling is 8530.",
        "8609": "25% Section 232 when entered for domestic use; containers in international traffic are admitted without entry or duty. No Section 301 list and no AD/CVD order.",
    }
    for g in te["groups"]:
        h = g["heading"]
        g["label"] = G[h][0]
        rr = []
        if h != "8608":
            rr += ["s232-entry", "melt-pour", "ftz-pf"]
        if h in ("8601", "8602", "8606"):
            rr.append("bond-release")
        if h in ("8601", "8602", "8603", "8604", "8605", "8606"):
            rr += ["rail-intl-traffic", "fra-safety"]
        if h == "8606":
            rr.append("fra-content")
        if h == "8609":
            rr.append("containers-iit")
        rr += ADH.get(h, [])
        rr += ["marking", "russia"]
        g["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        g["note"] = GROUP_NOTES[h]
    for ln in te["lines"]:
        hts = ln["hts"]
        h = hts[:4]
        rr = []
        if hts in S232:
            rr += ["s232-entry", "melt-pour", "ftz-pf"]
        if h in ("8601", "8602", "8606"):
            rr.append("bond-release")
        if h in ("8601", "8602", "8603", "8604", "8605", "8606"):
            rr += ["rail-intl-traffic", "fra-safety"]
        if h == "8606":
            rr.append("fra-content")
        if h == "8609":
            rr.append("containers-iit")
        rr += ADL.get(hts, [])
        rr += ["marking", "russia"]
        ln["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        lv = []
        dutiable = LINE[hts]["dutiable"]
        if dutiable or hts in NON:
            lv.append("usmca")
        if hts in S232:
            lv += ["us-melted", "uk-melt"] + ([] if hts.startswith("8607.30.10") else ["drawback"])
        if h in ("8601", "8602", "8603", "8604", "8605", "8606", "8609"):
            lv.append("intl-traffic")
        if h != "8609":
            lv.append("chapter98")
        if h in ("8601", "8602", "8603", "8605", "8606"):
            lv.append("ftz")
        if h != "8609":
            lv.append("origin")
        if hts in ADL:
            lv.append("adcvd-scope")
        if h in ("8607", "8608"):
            lv.append("ruling")
        ln["leverIds"] = lv
    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings and lists change often, and AD/CVD rates are company-specific and "
        "change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
    )
