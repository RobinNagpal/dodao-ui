# Chapter 61 tariff engineering and FAQ (exec'd by fill.py)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Knitted Apparel (HTS Ch. 61): Origin Rules, UFLPA, Labeling, Flammability & Ways to Lower Duty"
te["seo"]["title"] = "Importing Clothing: Apparel Origin Rules, UFLPA, FTC Labels, CPSC Flammability & Duty Savings (HTS 61) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, FTC and CPSC rules for knitted apparel — country of origin where the garment is assembled (19 CFR 102.21), "
    "manufacturer ID, UFLPA cotton tracing, fibre, origin and care labels (16 CFR 303, 423), children's sleepwear and "
    "drawstring rules — and the legal ways to pay less: USMCA, CAFTA-DR, Jordan, AGOA, Haiti HOPE/HELP, first sale, "
    "U.S. components, drawback and FTZs."
)
te["seo"]["keywords"] = [
    "apparel country of origin rules",
    "19 CFR 102.21 apparel",
    "usmca yarn-forward rule",
    "cafta-dr apparel rules of origin",
    "first-sale-for-export valuation",
    "UFLPA cotton apparel",
    "textile labeling requirements",
    "care label requirements",
    "children's sleepwear flammability",
    "apparel tariff engineering 2026",
]
te["intro"] = (
    "For most knitted garments **the country of origin is the country where the garment was wholly assembled** — sewn "
    "or linked from its cut or knit-to-shape pieces — and for knit-to-shape garments the country where the pieces were "
    "knit (19 CFR 102.21). That is different from home textiles and fabric, whose origin follows the fabric. Every entry "
    "must name the manufacturer by manufacturer identification code, cotton garments face the UFLPA presumption against "
    "Xinjiang cotton, and every garment sold at retail needs a fibre-content, origin and care label (16 CFR parts 303 and "
    "423); children's sleepwear and children's outerwear with drawstrings have CPSC rules of their own.\n\n"
    "The ways to pay less are in the schedule: **USMCA** and its tariff preference levels for Mexico and Canada, "
    "**CAFTA-DR** for Central American and Dominican apparel (Free, and exempt from the 2026 Section 301 duty), "
    "**Jordan's** FTA and exception list, the **AGOA** and **Haiti HOPE/HELP** Chapter 98 programs (through December 31, "
    "2026), **assembly from U.S.-cut components** (9802.00.80), **first-sale valuation**, **drawback** and "
    "**foreign-trade zones**. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "assembly-origin",
        "title": "Know where the garment is assembled — that is usually the country of origin",
        "saves": "The difference between country rates: nothing for CAFTA-DR, Jordan or USMCA goods, +10% for Cambodia or "
        "Bangladesh, +12.5% for Vietnam, +20% for China",
        "appliesTo": "All of Chapter 61: garments of two or more pieces take the origin of the country where they are wholly "
        "assembled; knit-to-shape garments the country where the pieces are knit; one-piece garments the country where the "
        "fabric is formed",
        "document": "Production records for each step (cutting, knitting, sewing or linking) and the MID of the company that "
        "did the origin-conferring step, on the entry.",
        "caveat": "Assembly must happen wholly in one country; partial sewing or finishing does not move origin. CBP denies "
        "entry to goods of companies named for illegal transshipment (19 CFR 102.24), and goods with Xinjiang cotton are "
        "barred wherever they are sewn.",
        "citations": [
            {"label": "19 CFR 102.21(c)(2), (e)", "url": ecfr(19, "102.21")},
            {"label": "19 CFR 102.23 (MID)", "url": ecfr(19, "102.23")},
            {"label": "19 CFR 102.24", "url": ecfr(19, "102.24")},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA — or a USMCA tariff preference level — on knitwear made in Mexico or Canada",
        "saves": "The base rate (up to 32%) and the 10% Section 301 duty on Mexican and Canadian goods",
        "appliesTo": "Originating goods under General Note 11 — for knit apparel generally yarn and fabric from the region, cut "
        "(or knit to shape) and sewn there — and, within annual limits, non-originating apparel cut and sewn in Mexico (45 "
        "million SME of cotton or man-made-fibre apparel, 9823.53.01) or Canada (40 million SME, 9823.52.01) from imported "
        "fabric",
        "document": "A certification of origin from the importer, exporter or producer, with SPI \"S\" (originating) or "
        "\"S+\" (tariff preference level) on the entry line.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on " + CA338 + ". The Mexican TPL excludes T-shirts (6109.10, "
        "6109.90.10) and men's briefs (6107.11, 6107.12) made chiefly of circular knit fabric of yarn number 100 metric or less. The USMCA was not "
        "renewed at the July 1, 2026 joint review but remains in force.",
        "provisions": [
            {"code": "9823.53.01", "rate": "Free (S+)", "text": "Cotton or man-made-fibre apparel of Mexico, up to 45,000,000 SME a year"},
            {"code": "9823.52.01", "rate": "Free (S+)", "text": "Cotton or man-made-fibre apparel of Canada, up to 40,000,000 SME a year"},
        ],
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11", "url": GN},
            {"label": "HTSUS Ch. 98 subch. XXIII, U.S. note 11", "url": CH98},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
        ],
    },
    {
        "id": "cafta",
        "title": "Claim CAFTA-DR — it removes the base rate and the 2026 Section 301 duty",
        "saves": "The base rate (up to 32%) and the 10%–12.5% Section 301 duty on Central American and Dominican apparel",
        "appliesTo": "Apparel of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua that "
        "originates under General Note 29 (generally yarn-forward: yarn and fabric from the region or the U.S., cut and "
        "sewn in the region), or that uses short-supply fabrics (9822.05.01), entered free of duty under CAFTA-DR",
        "document": "Proof of origin under CAFTA-DR and SPI \"P\" on the entry line; the Section 301 relief is reported with "
        "9903.05.95, or 9903.06.06 / 9903.06.09 for Guatemala and El Salvador.",
        "caveat": "The 17 Chapter 61 lines that are Free at the General rate print no P and keep the Section 301 duty. "
        "Non-CAFTA-DR goods of Nicaragua will pay 10% more from January 1, 2027 (9903.89.01).",
        "citations": [
            {"label": "HTSUS General Note 29", "url": GN},
            {"label": "19 CFR 10.583", "url": ecfr(19, "10.583")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
        ],
    },
    {
        "id": "jordan",
        "title": "Source from Jordan — FTA Free and on the Section 301 exception list",
        "saves": "The base rate and the 10% Section 301 duty",
        "appliesTo": "Garments of Jordan meeting the US–Jordan FTA rule of origin (SPI JO); the Section 301 exception list "
        "(9903.06.20) covers every Chapter 61 subheading except graduated compression hosiery (6115.10)",
        "document": "Proof that the goods meet the US–Jordan FTA origin rules and SPI \"JO\" on the entry line.",
        "caveat": "Compression hosiery from Jordan still pays the 10% Section 301 duty.",
        "citations": [
            {"label": "HTSUS General Note 18", "url": GN},
            {"label": "HTSUS U.S. note 52(j), heading 9903.06.20", "url": CH99},
        ],
    },
    {
        "id": "agoa-haiti",
        "title": "Use the AGOA or Haiti apparel provisions of Chapter 98",
        "saves": "The full base rate — AGOA and Haiti are outside the 60 Section 301 economies, and Chapter 98 entries other "
        "than 9802 are outside the 2026 Section 301 duty anyway",
        "appliesTo": "Apparel of AGOA beneficiary countries that meet the apparel requirements (Kenya, Lesotho, Madagascar and "
        "others in Chapter 98 subchapter XIX note 1), including lesser developed beneficiaries using third-country fabric "
        "(9819.11.12); apparel wholly assembled or knit-to-shape in Haiti and imported directly from Haiti or the Dominican "
        "Republic (9820.61.25–9820.61.45), or under CBTPA (9820.11.xx)",
        "document": "The AGOA textile certificate of origin and visa (19 CFR 10.213, 10.214) or the Haiti/CBTPA "
        "documentation, with the Chapter 98 heading on the entry.",
        "caveat": "AGOA and HOPE/HELP run through December 31, 2026 under P.L. 119-75 and Proclamation 11030; the AGOA "
        "third-country fabric and Haiti HOPE programs have annual quantity limits. CBTPA runs through September 30, 2030. "
        "Some HELP coverage excludes men's basic cotton T-shirts and sweatshirts (note 6(j)(ii)).",
        "provisions": [
            {"code": "9819.11.12", "rate": "Free", "text": "AGOA apparel of lesser developed beneficiary countries, regardless of fabric origin (annual cap)"},
            {"code": "9819.11.09", "rate": "Free", "text": "AGOA apparel of regional fabric (annual cap)"},
            {"code": "9820.61.35", "rate": "Free", "text": "Chapter 61 apparel wholly assembled or knit-to-shape in Haiti, any fabric (HELP, annual cap)"},
            {"code": "9820.61.25", "rate": "Free", "text": "Haiti apparel meeting the value-content rule (HOPE)"},
        ],
        "citations": [
            {"label": "HTSUS Chapter 98, subchapters XIX and XX", "url": CH98},
            {"label": "19 U.S.C. 3721 (AGOA apparel)", "url": NEW["usc-3721"]["url"]},
            {"label": "19 U.S.C. 2703a (Haiti)", "url": NEW["usc-2703a"]["url"]},
            {"label": "19 CFR 10.213 (AGOA)", "url": ecfr(19, "10.213")},
            {"label": "Proclamation 11030 (91 FR 30469)", "url": src("procl-11030")["url"]},
        ],
    },
    {
        "id": "fta",
        "title": "Claim another free trade agreement where the base rate is the cost",
        "saves": "The base rate — 16.5% on a cotton T-shirt, 32% on a polyester sweatshirt",
        "appliesTo": "Apparel of Peru, Colombia, Panama, Korea, Israel, Morocco, Bahrain, Oman, Chile, Australia and "
        "Singapore under each agreement's (mostly yarn-forward) rule of origin",
        "document": "The origin proof each program requires and the SPI on the entry line (PE, CO, PA, KR, IL, MA, BH, OM, "
        "CL, AU, SG).",
        "caveat": "These claims do not remove the 2026 Section 301 duty (U.S. note 52(a)): Peruvian FTA T-shirts still pay "
        "12.5%. GSP (A, A*) has been expired since December 31, 2020 and the Nepal program (NP) since December 31, 2025.",
        "citations": [{"label": "HTSUS General Notes 3(c), 8–34", "url": GN}],
    },
    {
        "id": "us-components",
        "title": "Assemble abroad from U.S.-formed and cut components (9802.00.80)",
        "saves": "Duty on the value of the U.S. components; base rate and Section 301 duty are charged only on the value "
        "added abroad",
        "appliesTo": "Garments assembled abroad from fabric components cut to shape in the United States and exported ready "
        "for assembly (statistical notes 4 and 5 cover the related Special Access and Outward Processing reporting)",
        "document": "The foreign assembler's declaration and the importer's endorsement (19 CFR 10.24), with the value of the "
        "U.S. components.",
        "caveat": "Components must not be advanced in value abroad except by assembly and incidental operations; the 2026 "
        "Section 301 and Section 338 duties apply to the value of the foreign assembly.",
        "citations": [
            {"label": "19 CFR 10.16, 10.24", "url": ecfr(19, "10.24")},
            {"label": "HTSUS 9802.00.80", "url": CH98},
        ],
    },
    {
        "id": "ensemble",
        "title": "Enter knit ensembles as ensembles — each garment pays its own rate",
        "saves": "Nothing by itself, but pricing the set correctly avoids paying the highest garment rate on the whole set",
        "appliesTo": "Sets of note 3(b) — one upper and one or two lower garments of identical fabric, put up for retail sale "
        "(6103.22–6103.29, 6104.22–6104.29)",
        "document": "The invoice must break the set into garments, each with its 10-digit line and value; report each under "
        "the most appropriate 10-digit number of the ensemble subheading (statistical note 1).",
        "caveat": "The duty is the sum of each garment's rate on its value plus the extra duties on the whole value. Sets that "
        "are not ensembles (for example a T-shirt with shorts, since 6109 articles are excluded) are classified garment by "
        "garment anyway.",
        "citations": [
            {"label": "HTSUS Chapter 61, notes 3(b) and statistical note 1", "url": CH61},
        ],
    },
    {
        "id": "classify",
        "title": "Check fibre content and garment type line by line",
        "saves": "Up to 16 points: a man-made-fibre T-shirt or sweater is 32% and its cotton twin 16.5%; a wholly cashmere "
        "sweater 4% against 16% for other wool",
        "appliesTo": "Every line — the fibre that predominates by weight decides the subheading, and note 4, note 5 and the "
        "sweater stitch-count note decide shirt vs. T-shirt vs. sweater",
        "document": "A binding ruling request to CBP (19 CFR part 177) with fibre content by weight, stitch count and "
        "construction; invoices must state fibre content (19 CFR 141.89).",
        "caveat": "Classification follows the goods as imported. A blend changes subheading only if it changes the fibre "
        "that predominates by weight, and labels must still state the true fibre content.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Chapter 61 notes", "url": CH61},
        ],
    },
    {
        "id": "china-exclusion",
        "title": "Use the China List 4A exclusion for babies' sleep sacks",
        "saves": "The 7.5% List 4A duty (the 12.5% 2026 duty still applies)",
        "appliesTo": "Babies' knit cotton sleep sacks with a neck opening and two-way zipper, as the exclusion describes them "
        "(6111.20.60.70), entered by November 9, 2026",
        "document": "Heading 9903.88.69 reported with the statistical number, and records showing the goods match the "
        "exclusion's description.",
        "caveat": "The exclusion ends after November 9, 2026 unless USTR extends it again.",
        "citations": [
            {"label": "HTSUS U.S. note 20(vvv)(iv), heading 9903.88.69", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended)", "url": src("fr-2025-21671")["url"]},
        ],
    },
    {
        "id": "first-sale",
        "title": "Value at the first sale for export when you buy through a middleman",
        "saves": "Every ad valorem duty — base rate and Section 301 — is charged on a lower value when the factory's price to "
        "a trading company or agent is lower than the price you pay",
        "appliesTo": "All lines bought through a trading company, agent-buyer or brand owner rather than straight from the factory",
        "document": "Proof that the first sale was a bona fide sale for export to the United States at arm's length: the "
        "factory invoice, contracts and payment records.",
        "caveat": "Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier "
        "price at entry.",
        "citations": [{"label": "19 CFR 152.103", "url": ecfr(19, "152.103")}],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the garments are exported or destroyed",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on apparel re-exported unused",
        "appliesTo": "All lines",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
    {
        "id": "ftz",
        "title": "Hold, label or kit apparel in a foreign-trade zone",
        "saves": "No duty on goods re-exported from the zone, and duty deferred until goods enter the U.S. market",
        "appliesTo": "Any line — useful for stock distributed to Canada, Mexico and the U.S. from one warehouse",
        "document": "Zone admission (CBP Form 214) and the zone operator's inventory records.",
        "caveat": "Goods entered for U.S. consumption from a zone pay the duties in force on the entry date.",
        "citations": [{"label": "19 CFR part 146", "url": ecfr_part(19, 146)}],
    },
]
te["rules"] = [
    {
        "id": "apparel-origin",
        "agency": "CBP",
        "title": "Country of origin of knit apparel (6101–6117): where the garment is wholly assembled if it has two or more "
        "components; where the knit-to-shape components are knit if knit to shape; where the fabric is formed if it is a "
        "single piece; scarves, shawls and veils of 6117.10 (other than cotton or wool) take the country where the fabric was "
        "dyed and printed with two finishing operations",
        "citations": [{"label": "19 CFR 102.21(c)(2), (e)", "url": ecfr(19, "102.21")}],
    },
    {
        "id": "textile-mid",
        "agency": "CBP",
        "title": "Manufacturer identification code (MID) of the company that performed the origin-conferring operation on every "
        "entry and entry summary — this replaced the textile declaration, eliminated in 2011",
        "citations": [
            {"label": "19 CFR 102.23", "url": ecfr(19, "102.23")},
            {"label": "76 FR 14575 (textile declarations eliminated)", "url": NEW["fr-2011-6253"]["url"]},
        ],
    },
    {
        "id": "cita-transship",
        "agency": "CBP / CITA",
        "title": "Entry is denied for textiles and apparel from a company named in the Federal Register for illegal "
        "transshipment or for being unable to verify production",
        "citations": [{"label": "19 CFR 102.24", "url": ecfr(19, "102.24")}],
    },
    {
        "id": "invoice",
        "agency": "CBP",
        "title": "Invoice details for apparel: fibre content by weight, whether knit or woven, the garment type and gender, "
        "the manufacturer and the country of origin",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP / DHS",
        "title": "UFLPA: garments made wholly or in part in Xinjiang — including garments of Xinjiang cotton sewn elsewhere — "
        "or by an entity on the UFLPA Entity List are presumed made with forced labor and excluded unless the importer "
        "rebuts it; cotton and apparel are high-priority sectors, so cotton garments need cotton tracing documents",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
            {"label": "DHS UFLPA Entity List", "url": NEW["dhs-uflpa-entity-list"]["url"]},
            {"label": "19 CFR 12.42 (withhold release orders)", "url": ecfr(19, "12.42")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Act labels on all wearing apparel: generic fibre names and percentages, the RN or company name, and "
        "the country where processed or made (\"Made in Vietnam\"); permanently knotted neckties and garters are excluded",
        "citations": [
            {"label": "16 CFR 303.15, 303.33, 303.45", "url": ecfr(16, "303.33")},
            {"label": "16 CFR part 303", "url": ecfr_part(16, 303)},
        ],
    },
    {
        "id": "ftc-wool",
        "agency": "FTC",
        "title": "Wool Products Labeling Act: wool, cashmere and other wool-containing sweaters, coats, socks and scarves must "
        "show wool fibre content and origin",
        "citations": [{"label": "16 CFR part 300", "url": ecfr_part(16, 300)}],
    },
    {
        "id": "ftc-care",
        "agency": "FTC",
        "title": "Care Labeling Rule: a permanent care label with washing or drycleaning instructions on textile wearing "
        "apparel sold to consumers, attached by the manufacturer or importer",
        "citations": [
            {"label": "16 CFR 423.6", "url": ecfr(16, "423.6")},
            {"label": "16 CFR 423.8 (exemptions)", "url": ecfr(16, "423.8")},
        ],
    },
    {
        "id": "cpsc-1610",
        "agency": "CPSC",
        "title": "Flammability of clothing textiles: all clothing textiles must meet the Class 1 or Class 2 test; hats, "
        "gloves up to 14 inches and footwear (other than hosiery) are excepted",
        "citations": [
            {"label": "16 CFR 1610.1", "url": ecfr(16, "1610.1")},
            {"label": "16 CFR 1610.4", "url": ecfr(16, "1610.4")},
        ],
    },
    {
        "id": "cpsc-sleepwear",
        "agency": "CPSC",
        "title": "Children's sleepwear sizes 0–6X and 7–14 (nightgowns, pajamas, robes) must pass the stricter sleepwear "
        "flammability standards, except infant garments of 9 months or smaller and tight-fitting garments",
        "citations": [
            {"label": "16 CFR 1615.1", "url": ecfr(16, "1615.1")},
            {"label": "16 CFR 1616.2", "url": ecfr(16, "1616.2")},
        ],
    },
    {
        "id": "cpsc-children",
        "agency": "CPSC",
        "title": "Children's apparel: children's upper outerwear in sizes 2T–16 with hood, neck, waist or bottom drawstrings "
        "that do not meet ASTM F1816 is a substantial product hazard, and children's products need a Children's Product "
        "Certificate based on third-party testing",
        "citations": [
            {"label": "16 CFR 1120.3(b)", "url": ecfr(16, "1120.3")},
            {"label": "16 CFR 1110.1", "url": ecfr(16, "1110.1")},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking: each garment must be marked with its English name of origin, in addition to the "
        "FTC label",
        "citations": [{"label": "19 CFR 134.11", "url": ecfr(19, "134.11")}],
    },
]
BASE_RULES = ["apparel-origin", "textile-mid", "cita-transship", "invoice", "uflpa", "ftc-labeling", "ftc-care", "cbp-marking"]
GROUP_RULES = {h: BASE_RULES + ["cpsc-1610"] for h in LABELS}
for h in ("6101", "6102", "6110", "6115", "6116", "6117"):
    GROUP_RULES[h] = GROUP_RULES[h] + ["ftc-wool"]
for h in ("6101", "6102", "6110", "6112"):
    GROUP_RULES[h] = GROUP_RULES[h] + ["cpsc-children"]
for h in ("6107", "6108", "6111"):
    GROUP_RULES[h] = GROUP_RULES[h] + ["cpsc-sleepwear", "cpsc-children"]
GROUP_RULES["6116"] = [r for r in GROUP_RULES["6116"] if r != "cpsc-1610"]
GROUP_NOTES = {
    "6101": "Coats take the origin of the country where they are wholly assembled. Children's jackets and hoodies with "
    "drawstrings must meet ASTM F1816. Wool coats need Wool Act labels.",
    "6102": "Same rules as 6101; right-over-left closure makes a coat women's (note 9).",
    "6103": "Ensembles (6103.22–.29) are priced garment by garment; suits must be of identical fabric (note 3). Origin is "
    "where the garments are wholly assembled.",
    "6104": "Ensembles (6104.22–.29) are priced garment by garment. Synthetic trousers and leggings (6104.63.20) and synthetic "
    "dresses (6104.43.20) from Canada owe the 50% Section 338 duty.",
    "6105": "Shirts with a ribbed waistband or under 10 stitches per cm go elsewhere (note 4), usually 6110. Cotton 19.7%, "
    "man-made fibres 32%.",
    "6106": "Same construction rules as 6105 (note 4); sleeveless blouses are allowed in 6106.",
    "6107": "Children's pajamas and robes are children's sleepwear under 16 CFR 1615/1616. Cotton underwear needs UFLPA "
    "cotton tracing.",
    "6108": "Children's nightgowns and pajamas must meet the sleepwear flammability standards unless tight-fitting. Bras "
    "are 6212, not here.",
    "6109": "Garments with a drawstring or ribbed waistband at the bottom are not T-shirts (note 5). Cotton T-shirts "
    "(6109.10.00) from Canada owe 50% under Section 338 even with USMCA; the USMCA TPL for Mexico excludes some basic "
    "cotton T-shirts.",
    "6110": "Sweaters (9 or fewer stitches per 2 cm), sweatshirts and hoodies. Knit-to-shape sweaters take the origin of the "
    "country where the panels were knit. 6110.20.20 and 6110.30.30 from Canada owe the Section 338 duty.",
    "6111": "Babies' wear is for a body height up to 86 cm and takes priority over other headings (note 6). Infant "
    "sleepwear of 9 months or smaller is exempt from the sleepwear standard if it meets the size and length limits.",
    "6112": "Swimwear and track suits; a ski suit must be identifiable as for skiing (note 7). Track suits are reported "
    "garment by garment (statistical note 1).",
    "6113": "Garments of coated or laminated knit fabric take this heading before others except 6111 (note 8).",
    "6114": "Other knit garments; man-made-fibre tops and bodysuits carry 28.2%–32%.",
    "6115": "Socks and hosiery. Graduated compression hosiery (6115.10) is the only Chapter 61 group outside the Jordan, "
    "Guatemala and El Salvador exception lists.",
    "6116": "Knit gloves; leather gloves are 4203 and rubber or nitrile gloves 4015. Gloves up to 14 inches are outside the "
    "clothing flammability standard. 6116.93.88 from Canada owes the Section 338 duty.",
    "6117": "Scarves, ties, headbands and knit parts of garments. Scarves and shawls of 6117.10 other than cotton or wool "
    "take the origin of the country that dyed and printed the fabric with two finishing steps (19 CFR 102.21(e)(2)).",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES[g["heading"]]
ENSEMBLE_PREFIXES = ("6103.22", "6103.23", "6103.29", "6104.22", "6104.23", "6104.29")
for ln in te["lines"]:
    h = ln["hts"]
    hd = h[:4]
    ln["ruleIds"] = GROUP_RULES[hd]
    lev = ["assembly-origin", "usmca", "cafta", "jordan", "agoa-haiti", "fta", "us-components"]
    if h.startswith(ENSEMBLE_PREFIXES):
        lev.append("ensemble")
    if h.startswith("6111.20.60.70"):
        lev.append("china-exclusion")
    lev += ["classify", "first-sale", "drawback", "ftz"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, China "
    "exclusions, preference-program dates and the Canada Section 338 list change by proclamation and notice; check them "
    "before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 61 FAQ: HS Codes & Import Tariffs for T-Shirts, Hoodies, Sweaters, Socks & Knit Clothing"
fc["seo"]["title"] = "T-Shirt, Hoodie, Sweater & Socks HS Code and Clothing Tariff FAQ 2026 (HTS Chapter 61) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing knitted clothing: the HS code for T-shirts, hoodies, sweaters, socks, "
    "leggings, underwear, pajamas, swimwear, baby clothes and gloves, and the 2026 tariffs on clothing from China, "
    "Vietnam, India, Bangladesh and Mexico."
)
fc["seo"]["keywords"] = [
    "hts chapter 61",
    "t shirt hs code",
    "hoodie hs code",
    "sweatshirt hs code",
    "sweater hs code",
    "socks hs code",
    "leggings hs code",
    "baby clothes hs code",
    "underwear hs code",
    "pajamas hs code",
    "tariff on clothing from china to usa",
    "tariff on clothes from india to usa",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing knitted and crocheted clothing into the U.S. — HS "
    "codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 61 base rates run from Free to 32% and are unchanged since January 2025: cotton T-shirts, sweatshirts and "
    "hoodies 16.5%, the same of man-made fibres 32%, synthetic leggings 28.2%, cotton socks 13.5%.",
    "Since July 24, 2026 Vietnam pays 12.5% Section 301 on top of the base rate; Cambodia, Bangladesh, Indonesia, India, "
    "Pakistan and Sri Lanka 10%. China pays 20% on 714 of 838 lines (12.5% plus List 4A).",
    "CAFTA-DR apparel entered duty-free (Honduras, Nicaragua, Guatemala, El Salvador, the Dominican Republic, Costa Rica) "
    "and Jordanian apparel pay no base rate and no Section 301 duty; USMCA apparel from Mexico pays nothing.",
    "Canada owes 50% under Section 338 on cotton T-shirts, cotton and man-made-fibre sweaters and sweatshirts, women's "
    "synthetic dresses and trousers and synthetic gloves, even with USMCA. The IEEPA tariffs ended February 24, 2026 and "
    "the Section 122 surcharge July 23, 2026.",
    "Knit ensembles pay each garment's own rate. Origin is where the garment is assembled (19 CFR 102.21); cotton garments "
    "face the UFLPA presumption, and de minimis stays suspended for parcels shipped direct to consumers.",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "hts-chapter-61",
        "question": "What does HTS Chapter 61 cover?",
        "searchedAs": ["hts chapter 61", "htsus chapter 61", "hts code chapter 61", "us hts chapter 61", "2026 hts chapter 61", "hs code 61"],
        "answer": "Clothing and clothing accessories that are knitted or crocheted: coats (6101–6102), suits, ensembles, "
        "trousers, dresses and skirts (6103–6104), knit shirts and blouses (6105–6106), underwear and sleepwear "
        "(6107–6108), T-shirts (6109), sweaters, sweatshirts and hoodies (6110), babies' wear (6111), track suits and "
        "swimwear (6112), other garments (6113–6114), socks (6115), gloves (6116) and scarves and accessories (6117). "
        "Woven clothing is Chapter 62; bras are 6212.",
        "link": "",
    },
    {
        "id": "t-shirt-hs-code",
        "question": "What is the HS code for T-shirts?",
        "searchedAs": ["t shirt hs code", "t shirt hs code usa", "t shirt hs code 10 digit", "t shirt hs code cotton", "hs code 6109.10", "hs code 6109.90", "hs code 6109"],
        "answer": "Knit T-shirts, singlets and tank tops are heading 6109: cotton 6109.10.00 (16.5%) and man-made fibres "
        "6109.90.10 (32%). In the U.S. 10-digit codes, men's cotton T-shirts are 6109.10.00.12 and women's 6109.10.00.40. "
        "Babies' T-shirts are 6111; a top with a drawstring or ribbed waistband at the bottom is not a T-shirt.",
        "link": "",
    },
    {
        "id": "hoodie-hs-code",
        "question": "What is the HS code for hoodies and sweatshirts?",
        "searchedAs": ["hoodie hs code", "hoodie hs code usa", "hoodie hs code cotton", "hoodie hs code 10 digit", "sweatshirt hs code"],
        "answer": "Knit hoodies and sweatshirts are heading 6110: cotton 6110.20.20 (16.5%, men's 6110.20.20.41) and man-made "
        "fibres 6110.30.30 (32%, men's 6110.30.30.41). From Vietnam a cotton hoodie pays 29% in all, from China 36.5%, a "
        "polyester one from China 52%.",
        "link": "industry-areas",
    },
    {
        "id": "sweater-hs-code",
        "question": "What is the HS code for sweaters, cardigans and pullovers?",
        "searchedAs": ["sweater hs code", "sweater hts code", "cardigan hs code", "pullover hs code", "hs code 6110.20", "hs code 6110.30", "hs code 6110"],
        "answer": "Heading 6110: wool 6110.11 (16%), wholly cashmere 6110.12.10 (4%), cotton 6110.20.20 (16.5%), man-made "
        "fibres 6110.30.30 (32%). A sweater has 9 or fewer stitches per 2 cm on its outer surface (statistical note 3). "
        "Chinese cashmere sweaters were on the suspended List 4B, so they pay 4% + 12.5%.",
        "link": "",
    },
    {
        "id": "socks-hs-code",
        "question": "What is the HS code for socks?",
        "searchedAs": ["socks hs code", "socks hs code 6115", "socks hs code usa", "socks hs code 10 digit"],
        "answer": "Heading 6115: cotton socks 6115.95.90 (13.5%, 10% with lace), synthetic socks 6115.96.90 (14.6%, 18.8% with "
        "lace), wool 6115.94 (11.3%), compression socks 6115.10. Babies' socks are 6111. From Pakistan cotton socks pay "
        "23.5% in all; from China 33.5%.",
        "link": "",
    },
    {
        "id": "leggings-hs-code",
        "question": "What is the HS code for leggings and knit pants?",
        "searchedAs": ["leggings hs code", "knitted leggings hs code", "ladies leggings hs code", "pants hs code usa", "hs code 6104.63", "hs code 6104.62"],
        "answer": "Women's knit trousers and leggings are 6104.62.20 if cotton (14.9%) and 6104.63.20 if synthetic (28.2%); "
        "men's are 6103.42.10 (cotton, 16.1%) and 6103.43.15 (synthetic, 28.2%). Tights and pantyhose are hosiery of "
        "6115. Synthetic leggings pay 40.7% in all from Vietnam and 48.2% from China.",
        "link": "industry-areas",
    },
    {
        "id": "baby-clothes-hs-code",
        "question": "What is the HS code for baby clothes?",
        "searchedAs": ["baby clothes hs code", "baby garments hs code", "baby clothes hts code", "infant clothes hs code", "baby apparel hs code"],
        "answer": "Heading 6111 covers knit garments and accessories for babies up to 86 cm tall, and it takes priority over "
        "other headings. Cotton sets, rompers and other babies' wear are 6111.20.60 (8.1%), cotton T-shirts and trousers "
        "14.9%, synthetic T-shirts and shirts 32%. Children's sleepwear must also meet CPSC flammability rules.",
        "link": "tariff-engineering",
    },
    {
        "id": "underwear-hs-code",
        "question": "What is the HS code for underwear, boxers and panties?",
        "searchedAs": ["underwear hs code", "mens underwear hs code", "boxer hs code", "briefs hs code", "panty hs code", "lingerie hs code"],
        "answer": "Men's knit underpants and briefs are 6107.11 (cotton, 7.4%) and 6107.12 (man-made fibres, 14.9%); women's "
        "briefs and panties 6108.21 (cotton, 7.6%) and 6108.22 (man-made fibres, 15.6%). Bras are 6212, outside this "
        "chapter.",
        "link": "",
    },
    {
        "id": "pajamas-hs-code",
        "question": "What is the HS code for pajamas and sleepwear?",
        "searchedAs": ["pajamas hs code", "sleepwear hs code", "nightwear hs code", "nightgown hs code", "kids pajamas hs code"],
        "answer": "Knit pajamas and nightshirts for men and boys are 6107.21–6107.29 (cotton 8.9%, man-made fibres 16%); "
        "nightdresses and pajamas for women and girls 6108.31–6108.39 (cotton 8.5%, man-made fibres 16%). Children's "
        "pajamas sizes 0–14 must pass the CPSC children's sleepwear standards unless tight-fitting.",
        "link": "tariff-engineering",
    },
    {
        "id": "swimwear-hs-code",
        "question": "What is the HS code for swimwear?",
        "searchedAs": ["swimwear hs code", "swimsuit hs code", "bikini hs code", "mens swimwear hs code", "women's swimwear hs code"],
        "answer": "Knit swimwear is heading 6112: men's synthetic 6112.31 (25.9%), women's and girls' synthetic swimsuits and "
        "bikinis 6112.41 (24.9%), other fibres 13.2%. Woven swim trunks are 6211.",
        "link": "",
    },
    {
        "id": "gloves-hs-code",
        "question": "What is the HS code for knit gloves and mittens?",
        "searchedAs": ["gloves hs code", "mittens hs code", "mitts hs code", "leather gloves hs code", "nitrile gloves hs code"],
        "answer": "Knit gloves, mittens and mitts are heading 6116: synthetic 6116.93 (18.6%), cotton 6116.92, coated work "
        "gloves 6116.10 (7%–23.5%). Leather gloves are 4203 and rubber or nitrile gloves 4015. Canadian synthetic gloves "
        "(6116.93.88) owe the 50% Section 338 duty.",
        "link": "",
    },
    {
        "id": "china-clothing",
        "question": "What is the tariff on clothing from China in 2026?",
        "searchedAs": ["tariff on clothing from china", "tariff on clothing from china to usa", "duty on clothing from china", "current tariff on clothing from china", "us tariff on clothing from china", "china apparel tariffs"],
        "answer": "Knit clothing from China pays its base rate plus 12.5% under the 2026 Section 301 action (9903.05.31) and, "
        "on 714 of the 838 Chapter 61 lines, 7.5% under List 4A: 36.5% on a cotton T-shirt, 52% on a polyester hoodie, "
        "33.5% on cotton socks. The IEEPA duties ended February 24, 2026, and de minimis is suspended for parcels.",
        "link": "tariff-updates",
    },
    {
        "id": "india-clothing",
        "question": "What is the tariff on clothes from India to the USA?",
        "searchedAs": ["tariff on clothes from india to usa", "tariffs on clothes from india to us", "tariff on garments from india to usa", "us tariff on garments from india", "india apparel tariffs"],
        "answer": "Indian knit garments pay the base rate plus 10% Section 301 (9903.05.44), with no exception list: 26.5% "
        "on cotton T-shirts, 18.5% on cotton nightdresses. India's 50% IEEPA rate of late 2025 ended in February 2026, "
        "and GSP has been expired since 2020.",
        "link": "industry-areas",
    },
    {
        "id": "apparel-tariffs-by-country",
        "question": "What are the apparel tariffs by country — Vietnam, Bangladesh, Cambodia, Mexico?",
        "searchedAs": ["apparel tariffs by country", "apparel tariffs us", "tariffs on clothing from vietnam", "bangladesh apparel tariffs", "mexico apparel tariffs", "apparel import duty usa"],
        "answer": "Add the Section 301 rate to the base rate: Vietnam +12.5%, Bangladesh, Cambodia, Indonesia, Pakistan and "
        "Sri Lanka +10%, EU 10% in total. A cotton T-shirt is 29% from Vietnam and 26.5% from Bangladesh or Cambodia. "
        "USMCA-qualifying Mexican apparel and CAFTA-DR or Jordanian apparel pay nothing.",
        "link": "industry-areas",
    },
    {
        "id": "importing-countries",
        "question": "Where does the U.S. import knitted clothing from?",
        "searchedAs": ["apparel tariffs us", "clothing import duty usa"],
        "answer": f"In {Y} the U.S. imported {TOTAL} of knitted apparel: Vietnam {m(imp('Vietnam'))}, China "
        f"{m(imp('China'))} (down {abs(chg('China'))}%), Cambodia {m(imp('Cambodia'))}, Bangladesh {m(imp('Bangladesh'))}, "
        f"Indonesia {m(imp('Indonesia'))} and India {m(imp('India'))}; the CAFTA-DR countries together shipped "
        f"{m(CAFTA_TOT)}.",
        "link": "understand-industry",
    },
]
