# tariffEngineering content for Chapter 07.
HTS_JSON = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH07 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%207"
FR_TOMATO_ORDER = "https://www.federalregister.gov/documents/2025/07/17/2025-13453/fresh-tomatoes-from-mexico-termination-of-suspension-agreement-rescission-of-administrative-reviews"
FR_TOMATO_SCOPE = "https://www.federalregister.gov/documents/2026/02/18/2026-03195/fresh-tomatoes-from-mexico-final-clarification-of-the-scope-of-the-antidumping-duty-order"
FR_GARLIC_CONT = "https://www.federalregister.gov/documents/2023/05/24/2023-11061/fresh-garlic-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"
FR_GARLIC_AR = "https://www.federalregister.gov/documents/2024/06/06/2024-12351/fresh-garlic-from-the-peoples-republic-of-china-final-results-and-rescission-of-antidumping-duty-administrative-review-2021-2022"


def ecfr(title, section):
    return f"https://www.ecfr.gov/current/title-{title}/section-{section}"


SEO = {
    "title": "Importing Vegetables into the U.S.: Permits, Phytosanitary Rules & Legal Ways to Lower Duty (HTS Ch. 07) | KoalaGains",
    "shortDescription": "The USDA, FDA and antidumping rules for each HTS Chapter 07 line — APHIS permits and phytosanitary certificates, "
    "Section 8e grade rules for tomatoes, onions and potatoes, FSVP and prior notice — and the legal ways to pay less: USMCA, "
    "the Section 301 exemption list, seasonal rates and FTA claims.",
    "keywords": [
        "import vegetables into the us requirements",
        "aphis permit fresh vegetables",
        "phytosanitary certificate vegetables import",
        "usmca vegetables duty free",
        "section 8e tomatoes onions potatoes",
        "fsvp produce importer",
        "tomatoes for processing antidumping sc-6",
        "seasonal tariff rates vegetables",
    ],
}

INTRO = (
    "Before a vegetable shipment pays any duty it has to be **allowed in**. USDA APHIS decides which vegetables may come from "
    "which country and under what conditions (permit, phytosanitary certificate, inspection, sometimes a treatment or a "
    "pest-free area). Potatoes, onions and tomatoes must also meet USDA grade and size rules, and FDA requires prior notice and "
    "a foreign supplier verification program for every food import.\n\n"
    "The ways to pay less are written into the schedule: claim **USMCA** for Canadian and Mexican produce, check whether the line "
    "is on the **Section 301 exemption list**, time entries to the lower **seasonal rate**, and claim the **FTA rate** where one "
    "exists. Each one depends on a document, listed below with its regulation. None of them removes an **antidumping duty** — "
    "the one exception is the processing-tomato exclusion described below."
)

LEVERS = [
    {
        "id": "usmca",
        "title": "Claim USMCA on vegetables from Canada or Mexico",
        "saves": "The 10% Section 301 duty on goods of Canada or Mexico (on the 331 lines not on the exemption list) plus the base rate",
        "appliesTo": "All 422 lines, for goods that qualify as originating under USMCA — vegetables grown in Canada or Mexico qualify",
        "document": "A certification of origin from the importer, exporter or producer. No prescribed form; it can be on the invoice "
        "or another document, and CBP can ask for it.",
        "caveat": "USMCA does not remove the antidumping duty on fresh tomatoes from Mexico (17.09% for most exporters). The USMCA "
        "was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS 9903.05.93 / 9903.05.94 (U.S. note 52(g)–(h))", "url": CH99},
            {
                "label": "USTR statement on the USMCA joint review (July 1, 2026)",
                "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review",
            },
        ],
    },
    {
        "id": "s301-exempt",
        "title": "Check the Section 301 exemption list before you budget the extra duty",
        "saves": "The whole 2026 Section 301 duty — 10% or 12.5% of value for most countries — on 91 of the 422 lines",
        "appliesTo": "Fresh tomatoes (0702), seed potatoes (0701.10), jicama, breadfruit and chayote, bamboo shoots and water "
        "chestnuts, capers, dried wood ears and shiitake, sweet corn seed, legume seeds for sowing, Bambara beans, guar seeds, "
        "cassava, taro, yautia and most frozen or dried Chinese water chestnuts",
        "document": "Correct classification on the entry. Seed potatoes must be certified by the foreign government and shipped in "
        "containers with its official seed-potato tags (Additional U.S. Note 4); sowing seeds must be of a kind used for sowing.",
        "caveat": "The list (U.S. note 52(b), heading 9903.05.86) removes only the 2026 Section 301 duty. Goods of China still pay the "
        "older Section 301 List 3 or List 4A duty (25% or 7.5%), and antidumping duties still apply (U.S. note 52(a)).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)–(b)", "url": CH99},
            {"label": "HTSUS Ch. 07, Additional U.S. Note 4", "url": CH07},
        ],
    },
    {
        "id": "seasonal",
        "title": "Time the entry to the lower seasonal rate",
        "saves": "Tomatoes 2.8¢ instead of 3.9¢/kg; cucumbers 1.5¢ (July–August) instead of 5.6¢/kg; head lettuce 0.4¢ (June–October) "
        "instead of 3.7¢/kg; fresh peas 0.5¢ (July–September) instead of 2.8¢/kg; broccoli and cauliflower 2.5% (June 5–October 15) "
        "instead of 10%; asparagus 5% instead of 21.3% when air-freighted between September 15 and November 15",
        "appliesTo": "Lines whose description names a date window: tomatoes, cucumbers, lettuce, peas, beans, broccoli and "
        "cauliflower, celery, eggplant, asparagus and several dried beans",
        "document": "The entry itself: the rate is the one in force on the date of entry (or withdrawal from warehouse for consumption).",
        "caveat": "The seasonal rate changes only the base rate; an ad valorem Section 301 duty applies in every season. A few windows "
        "run the other way (eggplant is 2.6¢/kg April–November and 1.9¢/kg otherwise).",
        "citations": [
            {"label": "HTSUS Chapter 07 (2026 Revision 21)", "url": CH07},
            {"label": "19 CFR 141.69 (rate in effect at time of entry)", "url": ecfr(19, "141.69")},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA rate (Peru, Chile, CAFTA-DR, Colombia and others)",
        "saves": "The base rate — up to 21.3% on asparagus, 20% on spinach, okra and leeks, 29.8% on dried garlic",
        "appliesTo": "Lines with a Free special rate for the partner (SPI AU, BH, CL, CO, IL, JO, KR, MA, OM, P, PA, PE, SG), "
        "and AGOA (D) for listed sub-Saharan countries",
        "document": "The claim and certification each agreement requires — for example 19 CFR 10.903 (Peru) or 19 CFR 10.583 (CAFTA-DR).",
        "caveat": "An FTA claim removes the base rate but not the 2026 Section 301 duty for the country (U.S. note 52(a)): asparagus "
        "from Peru claimed under PE still pays 12.5%. GSP (A, A*, A+) has been expired since December 31, 2020.",
        "citations": [
            {"label": "19 CFR 10.903 (Peru TPA)", "url": ecfr(19, "10.903")},
            {"label": "19 CFR 10.583 (CAFTA-DR)", "url": ecfr(19, "10.583")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "tomato-processing",
        "title": "Document tomatoes imported for processing (outside the Mexico antidumping order)",
        "saves": "The antidumping cash deposit on fresh tomatoes from Mexico — 17.09% of value for most exporters",
        "appliesTo": "Fresh tomatoes from Mexico (0702.00) that will be canned, dried, juiced or made into sauce or purée — not "
        "tomatoes cut up for fresh salsa or salad bars, which stay covered",
        "document": "The USDA \"Importer's Exempt Commodity Form\" (SC-6, 7 CFR 980.501) and Commerce's \"Processing Tomatoes "
        "Certification Form\", completed by entry summary and uploaded to ACE (DIS). Required since February 18, 2026.",
        "caveat": "Only tomatoes actually processed qualify; the forms must be complete when the entry summary is filed. The 2026 "
        "scope clarification did not change which tomatoes are covered.",
        "citations": [
            {"label": "91 FR 7439 (scope clarification, February 18, 2026)", "url": FR_TOMATO_SCOPE},
            {"label": "90 FR 33363 (antidumping order, July 17, 2025)", "url": FR_TOMATO_ORDER},
            {"label": "7 CFR 980.501", "url": ecfr(7, "980.501")},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty: a ruling fixes the classification (fresh vs. provisionally preserved, whole vs. cut, seed vs. table use) "
        "before the goods arrive",
        "appliesTo": "Any line where the classification decides the rate or the exemption-list status",
        "document": "A ruling request to CBP describing the goods. Questions about whether goods fall inside an antidumping order go to "
        "Commerce as a scope ruling (19 CFR 351.225).",
        "caveat": "Rulings apply to the transaction described; a different product may need its own.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
            {"label": "19 CFR 351.225 (scope rulings)", "url": ecfr(19, "351.225")},
        ],
    },
]

RULES = [
    {
        "id": "aphis-fv",
        "agency": "USDA APHIS",
        "title": "Fresh vegetables: only those APHIS has authorized from the country, under permit, with any required phytosanitary "
        "certificate, inspection and treatment (permit not needed for dried vegetables or for produce grown in Canada)",
        "citations": [
            {"label": "7 CFR 319.56-3", "url": ecfr(7, "319.56-3")},
            {"label": "7 CFR 319.56-4", "url": ecfr(7, "319.56-4")},
            {"label": "APHIS Agricultural Commodity Import Requirements (ACIR)", "url": "https://acir.aphis.usda.gov/s/"},
        ],
    },
    {
        "id": "aphis-pfp",
        "agency": "USDA APHIS",
        "title": "Plants for planting (seed potatoes, onion sets, bulbs): written PPQ permit and general restrictions",
        "citations": [
            {"label": "7 CFR 319.37-3", "url": ecfr(7, "319.37-3")},
            {"label": "7 CFR 319.37-5", "url": ecfr(7, "319.37-5")},
        ],
    },
    {
        "id": "seed-act",
        "agency": "USDA AMS",
        "title": "Seeds for sowing: Federal Seed Act import rules (labeling, testing, noxious-weed seed limits)",
        "citations": [{"label": "7 CFR 361.2", "url": ecfr(7, "361.2")}],
    },
    {
        "id": "ams-8e-potatoes",
        "agency": "USDA AMS",
        "title": "Irish potatoes: Section 8e grade, size, quality and maturity requirements, with inspection",
        "citations": [
            {"label": "7 CFR 980.1", "url": ecfr(7, "980.1")},
            {"label": "AMS: Section 8e & Imports", "url": "https://www.ams.usda.gov/rules-regulations/section8e"},
        ],
    },
    {
        "id": "ams-8e-onions",
        "agency": "USDA AMS",
        "title": "Onions: Section 8e grade, size, quality and maturity requirements, with inspection",
        "citations": [
            {"label": "7 CFR 980.117", "url": ecfr(7, "980.117")},
            {"label": "AMS: Section 8e & Imports", "url": "https://www.ams.usda.gov/rules-regulations/section8e"},
        ],
    },
    {
        "id": "ams-8e-tomatoes",
        "agency": "USDA AMS",
        "title": "Tomatoes: Section 8e grade and size requirements (at least U.S. No. 2; minimum size from October 10 to June 15), "
        "except cherry, pear-shaped, greenhouse and hydroponic tomatoes; SC-6 for tomatoes imported for processing",
        "citations": [
            {"label": "7 CFR 980.212", "url": ecfr(7, "980.212")},
            {"label": "7 CFR 980.501", "url": ecfr(7, "980.501")},
        ],
    },
    {
        "id": "fda-prior-notice",
        "agency": "FDA",
        "title": "Prior notice of imported food, submitted and confirmed before arrival",
        "citations": [{"label": "21 CFR 1.279", "url": ecfr(21, "1.279")}],
    },
    {
        "id": "fda-fsvp",
        "agency": "FDA",
        "title": "Foreign Supplier Verification Program: the U.S. importer verifies each foreign supplier's food safety",
        "citations": [
            {"label": "21 CFR 1.502", "url": ecfr(21, "1.502")},
            {
                "label": "FDA: FSVP final rule",
                "url": "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals",
            },
        ],
    },
    {
        "id": "fda-produce",
        "agency": "FDA",
        "title": "Produce Safety Rule: standards for growing, harvesting, packing and holding raw produce, which foreign farms "
        "supplying the U.S. must meet",
        "citations": [
            {"label": "21 CFR 112.1", "url": ecfr(21, "112.1")},
            {"label": "FDA: Produce Safety Rule", "url": "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-produce-safety"},
        ],
    },
    {
        "id": "fda-traceability",
        "agency": "FDA",
        "title": "Food Traceability Rule: extra traceability records for foods on the Food Traceability List (fresh tomatoes, "
        "peppers, cucumbers, leafy greens, herbs, fresh-cut vegetables)",
        "citations": [
            {"label": "21 CFR 1.1300", "url": ecfr(21, "1.1300")},
            {"label": "FDA: Food Traceability List", "url": "https://www.fda.gov/food/food-safety-modernization-act-fsma/food-traceability-list"},
        ],
    },
    {
        "id": "ad-tomatoes-mx",
        "agency": "Commerce / CBP",
        "title": "Antidumping order on fresh tomatoes from Mexico (A-201-820): cash deposit of 17.09% for most exporters since "
        "July 14, 2025; tomatoes for processing excluded with SC-6 and certification",
        "citations": [
            {"label": "90 FR 33363", "url": FR_TOMATO_ORDER},
            {"label": "91 FR 7439", "url": FR_TOMATO_SCOPE},
            {"label": "CBP: Antidumping and countervailing duties", "url": "https://www.cbp.gov/trade/priority-issues/adcvd"},
        ],
    },
    {
        "id": "ad-garlic-cn",
        "agency": "Commerce / CBP",
        "title": "Antidumping order on fresh garlic from China (A-570-831): China-wide cash deposit $4.71/kg; covers fresh, chilled, "
        "frozen, provisionally preserved and water-packed garlic, not garlic prepared by heat or other ingredients",
        "citations": [
            {"label": "88 FR 33570 (continuation, May 24, 2023)", "url": FR_GARLIC_CONT},
            {"label": "89 FR 48373 (China-wide rate)", "url": FR_GARLIC_AR},
        ],
    },
    {
        "id": "cool",
        "agency": "USDA AMS",
        "title": "Country of origin labeling: retailers must tell shoppers the origin of fresh and frozen vegetables",
        "citations": [
            {"label": "7 CFR 65.135", "url": ecfr(7, "65.135")},
            {"label": "AMS: Country of Origin Labeling", "url": "https://www.ams.usda.gov/rules-regulations/cool"},
        ],
    },
]

FDA_ALL = ["fda-prior-notice", "fda-fsvp"]

# heading -> (ruleIds, note)
GROUPS = {
    "0701": (["aphis-fv", "aphis-pfp", "ams-8e-potatoes"] + FDA_ALL + ["fda-produce", "cool"],
             "Seed potatoes are plants for planting (7 CFR 319.37) and must carry the foreign government's seed-potato tags to "
             "use 0701.10. Potatoes from Newfoundland and part of Central Saanich, British Columbia are prohibited (7 CFR 319.56-3(b))."),
    "0702": (["aphis-fv", "ams-8e-tomatoes"] + FDA_ALL + ["fda-produce", "fda-traceability", "ad-tomatoes-mx", "cool"],
             "Mexican fresh tomatoes are under an antidumping order (17.09% for most exporters) unless imported for processing "
             "with the SC-6 and certification forms."),
    "0703": (["aphis-fv", "aphis-pfp", "ams-8e-onions"] + FDA_ALL + ["fda-produce", "ad-garlic-cn", "cool"],
             "Onion sets are plants for planting. Fresh garlic from China is under an antidumping order ($4.71/kg China-wide)."),
    "0704": (["aphis-fv"] + FDA_ALL + ["fda-produce", "fda-traceability", "cool"], None),
    "0705": (["aphis-fv"] + FDA_ALL + ["fda-produce", "fda-traceability", "cool"], "Lettuce and chicory are leafy greens on the Food Traceability List."),
    "0706": (["aphis-fv"] + FDA_ALL + ["fda-produce", "cool"], None),
    "0707": (["aphis-fv"] + FDA_ALL + ["fda-produce", "fda-traceability", "cool"], "Fresh cucumbers are on the Food Traceability List."),
    "0708": (["aphis-fv"] + FDA_ALL + ["fda-produce", "cool"], None),
    "0709": (["aphis-fv"] + FDA_ALL + ["fda-produce", "fda-traceability", "cool"],
             "Fresh peppers, leafy greens and herbs are on the Food Traceability List; which other vegetables may come from a "
             "given country is set case by case in ACIR."),
    "0710": (["aphis-fv"] + FDA_ALL + ["cool"], "Frozen vegetables still need APHIS authorization (the permit exemption covers dried, not frozen, vegetables). Frozen garlic from China (0710.80.97.55) is inside the garlic antidumping order."),
    "0711": (["aphis-fv"] + FDA_ALL + ["ad-garlic-cn"], "Provisionally preserved garlic from China is inside the garlic antidumping order (0711.90.65)."),
    "0712": (["aphis-fv"] + FDA_ALL, "Dried vegetables need no APHIS permit (7 CFR 319.56-3(b)(1)(i)) but must be free of soil and prohibited plant parts."),
    "0713": (["aphis-fv", "seed-act"] + FDA_ALL, "Dried beans and peas need no APHIS permit; seeds for sowing fall under the Federal Seed Act."),
    "0714": (["aphis-fv"] + FDA_ALL + ["fda-produce", "cool"], None),
}

DISCLAIMER = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Which vegetables may enter from which "
    "country changes as APHIS authorizes new commodities; check ACIR and your permit before each shipment."
)

# Lines on U.S. note 52(b) (9903.05.86), by 8-digit prefix (with the one 10-digit carve-out)
S301_EXEMPT = [
    "0701.10.00", "0702.00.20", "0702.00.40", "0702.00.60", "0709.99.05", "0709.99.10", "0710.80.15", "0711.90.30",
    "0712.32.00", "0712.34.10", "0712.34.20", "0712.90.85.50", "0713.10.10", "0713.20.10", "0713.31.10", "0713.32.10",
    "0713.33.10", "0713.34.10", "0713.34.20", "0713.34.40", "0713.39.11", "0713.40.10", "0713.50.10", "0713.60.10",
    "0713.90.11", "0713.90.50", "0714.10.10", "0714.10.20", "0714.40.10", "0714.40.20", "0714.40.50", "0714.40.60",
    "0714.50.10", "0714.50.20", "0714.50.60", "0714.90.42", "0714.90.44", "0714.90.46", "0714.90.48", "0714.90.61",
]

SEASONAL_PREFIXES = [
    "0702.00", "0704.10.20", "0704.10.40", "0705.11", "0705.19", "0707.00", "0708.10", "0708.20.10", "0708.90.25",
    "0708.90.30", "0709.20", "0709.30", "0709.40.40", "0709.40.60", "0710.21", "0710.22.10", "0710.22.15", "0710.29.25",
    "0710.29.30", "0710.80.40", "0710.80.45", "0710.80.50", "0713.31.20", "0713.31.40", "0713.33.20", "0713.33.40",
    "0713.34.20", "0713.34.40", "0713.39.21", "0713.39.41", "0713.60.60", "0713.60.80", "0713.90.61", "0713.90.81",
]

GARLIC_AD_PREFIXES = ["0703.20", "0710.80.97.55", "0711.90.65"]


def line_rules_levers(hts, heading, general, special):
    rules = list(GROUPS[heading][0])
    # narrow per line
    if heading == "0701" and not hts.startswith("0701.10"):
        rules.remove("aphis-pfp")
    if heading == "0703":
        if not hts.startswith("0703.10.20"):
            rules.remove("aphis-pfp")
        if not hts.startswith("0703.10"):
            rules.remove("ams-8e-onions")
        if not hts.startswith("0703.20"):
            rules.remove("ad-garlic-cn")
    if heading == "0709" and not hts.startswith(("0709.60", "0709.70", "0709.99.90")):
        rules.remove("fda-traceability")
    if heading == "0704" and not hts.startswith("0704.90"):
        rules.remove("fda-traceability")
    if heading == "0711" and not hts.startswith("0711.90.65"):
        rules.remove("ad-garlic-cn")
    if heading == "0710" and any(hts.startswith(p) for p in GARLIC_AD_PREFIXES):
        rules.append("ad-garlic-cn")
    if heading == "0713" and "seed-act" in rules:
        sowing = hts[:10] in ("0713.10.10", "0713.20.10", "0713.31.10", "0713.32.10", "0713.33.10", "0713.34.10",
                              "0713.39.11", "0713.40.10", "0713.50.10", "0713.60.10", "0713.90.11")
        if not sowing:
            rules.remove("seed-act")
    if hts.startswith("0712.90.85.50"):
        rules.append("seed-act")
    levers = ["usmca"]
    if any(hts.startswith(p) for p in S301_EXEMPT):
        levers.append("s301-exempt")
    if any(hts.startswith(p) for p in SEASONAL_PREFIXES):
        levers.append("seasonal")
    if general and general != "Free" and special and "Free" in special:
        levers.append("fta")
    if heading == "0702":
        levers.append("tomato-processing")
    levers.append("ruling")
    return rules, levers
