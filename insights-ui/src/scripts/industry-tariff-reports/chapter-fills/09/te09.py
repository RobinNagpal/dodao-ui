"""Chapter 09 tariff-engineering content (levers, rules, per-line mapping)."""

HTS_NOW_JSON = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99_URL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH09_URL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%209"
GN_URL = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"

NOT_EXEMPT = {"0910.99.05.00", "0910.99.06.00"}

LEVERS = [
    {
        "id": "s301-exempt",
        "title": "Report the Section 301 exemption heading for coffee, tea and spices",
        "saves": "The 2026 Section 301 duty of 10% or 12.5% of value (and Brazil's separate 25%) on every Chapter 09 line except crude thyme and bay leaves (0910.99.05) and manufactured thyme (0910.99.06)",
        "appliesTo": "89 of 91 lines, from every country in the 60-economy action and from Brazil",
        "document": "The entry lists the Chapter 99 exemption heading next to the Chapter 09 line: 9903.05.86 for the 60-economy duty (U.S. note 52(b)) and 9903.05.03 for the Brazil duty (U.S. note 50(a)(ii)).",
        "caveat": "The exemption follows the 8-digit subheading, so the two thyme/bay-leaf lines above still pay. It does not lift the China List 4A duty (+7.5%, 9903.88.15) or the Nicaragua duty that starts on January 1, 2027 (9903.89.01).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b) (9903.05.86)", "url": CH99_URL},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 50(a)(ii) (9903.05.03)", "url": CH99_URL},
            {
                "label": "91 FR 47318: USTR notice of Section 301 actions on 60 economies (July 28, 2026)",
                "url": "https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies",
            },
        ],
    },
    {
        "id": "fta",
        "title": "Claim a free trade agreement on the dutiable lines",
        "saves": "The base rate on the 19 dutiable lines: 6.4% on flavored green tea, 1.9%–4.8% on spice mixtures, thyme, bay leaves and origanum, and 1¢–7.4¢/kg on ground ginger, dried capsicum and Bombay mace. Japan gets 3.2% instead of 6.4% on flavored green tea.",
        "appliesTo": "Goods that originate in a partner country: Colombia (CO), Peru (PE), CAFTA-DR countries such as Guatemala, Honduras and Nicaragua (P), Australia, Chile, Korea, Singapore and the others listed in the line's Special column",
        "document": "A certification of origin (or other information showing the goods originate) held by the importer when the claim is made, with the SPI code on the entry.",
        "caveat": "Most Chapter 09 lines are already Free, so the claim only matters on the 19 dutiable lines. An FTA claim does not remove the Section 301 duty where it applies (U.S. note 52(a)). For Nicaragua it matters on every line from January 1, 2027: the new 9903.89.01 duty applies only to goods not entered under CAFTA-DR.",
        "citations": [
            {"label": "19 CFR 10.3003 (Colombia TPA claim)", "url": "https://www.ecfr.gov/current/title-19/section-10.3003"},
            {"label": "19 CFR 10.903 (Peru TPA claim)", "url": "https://www.ecfr.gov/current/title-19/section-10.903"},
            {"label": "19 CFR 10.583 (CAFTA-DR claim)", "url": "https://www.ecfr.gov/current/title-19/section-10.583"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 29 and 52(a)", "url": CH99_URL},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Canada or Mexico",
        "saves": "The base rate on the dutiable lines, and the 10% Section 301 duty on the two thyme/bay-leaf lines",
        "appliesTo": "All 91 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in the importer's possession when the claim is made. It need not follow a set format.",
        "caveat": "Roasting or blending in Canada or Mexico does not by itself make coffee or tea grown elsewhere originating; check the product-specific rule. USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": CH99_URL},
            {
                "label": "USTR statement on the USMCA joint review (July 1, 2026)",
                "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review",
            },
        ],
    },
    {
        "id": "agoa",
        "title": "Claim AGOA on spices and flavored tea from eligible African countries",
        "saves": "The base rate on the dutiable lines that list SPI D (flavored green tea, spice mixtures, thyme, bay leaves, ground ginger, dried capsicum)",
        "appliesTo": "Goods of AGOA beneficiary countries listed in HTSUS General Note 16",
        "document": "The AGOA claim (SPI D) on the entry; the goods must be the growth, product or manufacture of the beneficiary country.",
        "caveat": "AGOA was renewed only through December 31, 2026. GSP (SPI A, A+, A*) has been expired since December 31, 2020, so a GSP code in the Special column gives no benefit.",
        "citations": [
            {"label": "HTSUS General Note 16 (AGOA)", "url": GN_URL},
            {
                "label": "USTR statement on AGOA reauthorization (February 2026)",
                "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act",
            },
            {
                "label": "CBP: Generalized System of Preferences",
                "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences",
            },
        ],
    },
    {
        "id": "form",
        "title": "Import in the form that carries the lower rate",
        "saves": "Several spices are Free whole or crude but dutiable once processed: ginger is Free whole and 1¢/kg crushed or ground; thyme and bay leaves are Free crude (0910.99.05) but 4.8% and 3.2% once manufactured; origanum is Free crude and 3.4% otherwise; mace is Free except Bombay or wild mace, ground (7.4¢/kg).",
        "appliesTo": "Ginger (0910.11 / 0910.12), thyme, bay leaves and origanum (0910.99), mace (0908.21 / 0908.22)",
        "document": "Product specifications showing the condition of the goods as imported (whole, crude, crushed or ground).",
        "caveat": "Classification follows the goods as they arrive, not how they will be used. Crude thyme and bay leaves (0910.99.05) still pay the Section 301 duty where it applies. A mixture of spices from different headings goes to 0910.91 (1.9%) under Chapter 09 note 1(b).",
        "citations": [
            {"label": "HTSUS Chapter 09 notes and rates", "url": CH09_URL},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on re-exported coffee, tea or spices",
        "saves": "Up to 99% of the duties paid, including the Section 301 duty, when the goods (or products made from them) are exported",
        "appliesTo": "Dutiable lines and any line that paid an extra duty, when the goods are exported or used to make exported goods",
        "document": "A drawback claim filed with CBP, with import and export records that tie the goods together.",
        "caveat": "Only worth it where a duty was actually paid; most Chapter 09 lines are Free with no extra duty.",
        "citations": [
            {"label": "19 CFR part 191", "url": "https://www.ecfr.gov/current/title-19/part-191"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty on lines where the classification decides the rate: flavored vs. plain tea, spice mixtures vs. seasonings (heading 2103), crude vs. manufactured herbs",
        "appliesTo": "Any line where the classification decides the rate",
        "document": "A ruling request to CBP describing the product, its ingredients and how it is packed.",
        "caveat": "Rulings apply to the transaction described; a changed recipe may need its own ruling.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
        ],
    },
]

RULES = [
    {
        "id": "fda-prior-notice",
        "agency": "FDA",
        "title": "Prior notice of imported food before arrival (2 hours by road, 4 by air or rail, 8 by water)",
        "citations": [
            {"label": "21 CFR 1.279", "url": "https://www.ecfr.gov/current/title-21/section-1.279"},
            {"label": "21 CFR 1.281", "url": "https://www.ecfr.gov/current/title-21/section-1.281"},
        ],
    },
    {
        "id": "fda-registration",
        "agency": "FDA",
        "title": "The foreign roaster, packer or warehouse must be registered as a food facility",
        "citations": [{"label": "21 CFR 1.225", "url": "https://www.ecfr.gov/current/title-21/section-1.225"}],
    },
    {
        "id": "fda-fsvp",
        "agency": "FDA",
        "title": "Foreign Supplier Verification Program: the U.S. importer must verify each foreign supplier",
        "citations": [{"label": "21 CFR 1.502", "url": "https://www.ecfr.gov/current/title-21/section-1.502"}],
    },
    {
        "id": "fda-ia-salmonella",
        "agency": "FDA",
        "title": "Import Alert 99-19: spices from listed firms are detained without examination for Salmonella",
        "citations": [
            {"label": "FDA Import Alert 99-19 (published October 9, 2026)", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_263.html"}
        ],
    },
    {
        "id": "fda-ia-pepper",
        "agency": "FDA",
        "title": "Import Alerts 28-02 (black pepper from India: filth; each lot needs an Export Inspection Council certificate) and 28-04 (black and white pepper from Brazil: Salmonella)",
        "citations": [
            {"label": "FDA Import Alert 28-02", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_90.html"},
            {"label": "FDA Import Alert 28-04", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_92.html"},
        ],
    },
    {
        "id": "fda-ia-metals",
        "agency": "FDA",
        "title": "Import Alert 99-42: ground cinnamon, turmeric and other foods from listed firms detained for lead and other heavy metals",
        "citations": [
            {"label": "FDA Import Alert 99-42 (published September 22, 2026)", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_1167.html"}
        ],
    },
    {
        "id": "aphis-coffee",
        "agency": "USDA APHIS",
        "title": "Unroasted coffee, coffee leaves and used coffee sacks may not enter Hawaii or Puerto Rico (coffee berry borer and leaf rust); coffee seeds for planting need a plant permit",
        "citations": [
            {"label": "7 CFR 319.73-2", "url": "https://www.ecfr.gov/current/title-7/section-319.73-2"},
            {"label": "7 CFR 319.73-1", "url": "https://www.ecfr.gov/current/title-7/section-319.73-1"},
        ],
    },
    {
        "id": "aphis-fresh",
        "agency": "USDA APHIS",
        "title": "Fresh ginger root needs an APHIS fruit-and-vegetable permit; dried, cured or processed spices do not",
        "citations": [{"label": "7 CFR 319.56-3", "url": "https://www.ecfr.gov/current/title-7/section-319.56-3"}],
    },
    {
        "id": "aphis-khapra",
        "agency": "USDA APHIS",
        "title": "Whole chilies, red peppers and cumin seed packed in new jute or burlap bags from khapra-beetle countries must be treated",
        "citations": [{"label": "7 CFR 319.75-2", "url": "https://www.ecfr.gov/current/title-7/section-319.75-2"}],
    },
    {
        "id": "nop-organic",
        "agency": "USDA AMS (National Organic Program)",
        "title": "Organic shipments must be certified, declared as organic to CBP and carry an NOP Import Certificate",
        "citations": [{"label": "7 CFR 205.273", "url": "https://www.ecfr.gov/current/title-7/section-205.273"}],
    },
    {
        "id": "hts-tea-packing",
        "agency": "CBP",
        "title": "Tea in packages under 2.3 kg: the packing is dutiable as if imported empty, unless the tea comes from a listed country (Chapter 09 additional U.S. note 4)",
        "citations": [{"label": "HTSUS Ch. 09, Additional U.S. Note 4", "url": CH09_URL}],
    },
    {
        "id": "hts-pepper-shells",
        "agency": "CBP",
        "title": "Pepper shells, ground or unground, may not be imported (Chapter 09 additional U.S. note 6)",
        "citations": [{"label": "HTSUS Ch. 09, Additional U.S. Note 6", "url": CH09_URL}],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the goods or their retail container",
        "citations": [{"label": "19 CFR 134.11", "url": "https://www.ecfr.gov/current/title-19/section-134.11"}],
    },
]

FDA_BASE = ["fda-prior-notice", "fda-registration", "fda-fsvp", "cbp-marking"]

GROUP_RULES = {
    "0901": (FDA_BASE + ["aphis-coffee", "nop-organic"], "Coffee has no special FDA or APHIS permit on the mainland. Unroasted coffee cannot be shipped into Hawaii or Puerto Rico, and Puerto Rico may charge its own duty on coffee (Chapter 09 additional U.S. note 3)."),
    "0902": (FDA_BASE + ["nop-organic", "hts-tea-packing"], "The Tea Importation Act, which required FDA tea examiners, was repealed effective April 9, 1996; tea now follows the general food import rules."),
    "0903": (FDA_BASE, None),
    "0904": (FDA_BASE + ["fda-ia-salmonella", "fda-ia-pepper", "aphis-khapra", "hts-pepper-shells"], "Whole dried chilies and red peppers (0904.21) in new jute or burlap from khapra-beetle countries must be treated."),
    "0905": (FDA_BASE + ["fda-ia-salmonella"], None),
    "0906": (FDA_BASE + ["fda-ia-salmonella", "fda-ia-metals"], "Ground cinnamon is the main product on FDA's heavy-metals import alert after the 2024 lead findings."),
    "0907": (FDA_BASE + ["fda-ia-salmonella"], None),
    "0908": (FDA_BASE + ["fda-ia-salmonella"], None),
    "0909": (FDA_BASE + ["fda-ia-salmonella", "aphis-khapra"], "Cumin seed (0909.31) in new jute or burlap from khapra-beetle countries must be treated."),
    "0910": (FDA_BASE + ["fda-ia-salmonella", "fda-ia-metals", "aphis-fresh", "nop-organic"], "Fresh ginger root (0910.11) needs an APHIS permit; dried ginger, turmeric and other dried spices do not."),
}

DUTIABLE_FTA_LINES = None  # filled from the rate table


def line_rule_ids(line):
    h = line["heading"]
    rules = list(GROUP_RULES[h][0])
    hts = line["hts"]
    text = (line["searchText"] or "").lower()
    organic = "organic" in text
    if "nop-organic" in rules and not organic:
        rules.remove("nop-organic")
    if h == "0904":
        if not (hts.startswith("0904.21") and not hts.startswith("0904.21.80")):
            rules.remove("aphis-khapra")
        if not hts.startswith("0904.11") and not hts.startswith("0904.12"):
            rules.remove("fda-ia-pepper")
            rules.remove("hts-pepper-shells")
    if h == "0909" and not hts.startswith("0909.31"):
        rules.remove("aphis-khapra")
    if h == "0910":
        if not hts.startswith("0910.11"):
            rules.remove("aphis-fresh")
        if not hts.startswith("0910.30"):
            rules.remove("fda-ia-metals")
    if h == "0906" and hts.startswith("0906.1"):
        rules.remove("fda-ia-metals")
    return rules


def line_lever_ids(line, row):
    hts = line["hts"]
    levers = []
    if hts not in NOT_EXEMPT:
        levers.append("s301-exempt")
    dutiable = row["dutiable"]
    special = row.get("effectiveSpecial") or ""
    if dutiable and special:
        levers.append("fta")
    levers.append("usmca")
    if dutiable and "D" in special.replace("(", ",").replace(")", ",").split(","):
        levers.append("agoa")
    if hts.startswith("0910.1") or hts.startswith("0910.99.0") or hts.startswith("0910.99.2") or hts.startswith("0910.99.4") or hts.startswith("0908.2"):
        levers.append("form")
    if dutiable or hts in NOT_EXEMPT:
        levers.append("drawback")
    levers.append("ruling")
    return levers
