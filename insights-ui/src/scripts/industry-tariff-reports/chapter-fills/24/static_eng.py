"""Chapter 24 tariff-engineering content (rules, levers, groups) — static, from official sources."""

HTS24 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2024"
HTS98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
HTS99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
QB = "https://www.cbp.gov/trade/quota/bulletins/qb-26-502-2027"
FDA_IMPORT = "https://www.fda.gov/industry/importing-fda-regulated-products/importing-tobacco-products"

RULES = [
    {
        "id": "ttb-permit",
        "agency": "Treasury TTB",
        "title": "TTB importer permit before the first entry: for cigarettes, cigars, smokeless, pipe and roll-your-own tobacco (subpart K), and for processed leaf — stemmed, threshed, cut or flavored tobacco (subpart M). Leaf that is only cured and baled is not processed tobacco.",
        "citations": [
            {"label": "27 CFR 41.190 (tobacco products importers)", "url": "https://www.ecfr.gov/current/title-27/section-41.190"},
            {"label": "27 CFR 41.191 (application for permit)", "url": "https://www.ecfr.gov/current/title-27/section-41.191"},
            {"label": "27 CFR 41.231 (processed tobacco importers)", "url": "https://www.ecfr.gov/current/title-27/section-41.231"},
            {"label": "27 CFR 41.11 (definition of processed tobacco)", "url": "https://www.ecfr.gov/current/title-27/section-41.11"},
        ],
    },
    {
        "id": "ttb-excise",
        "agency": "Treasury TTB / CBP",
        "title": "Federal excise tax, paid to CBP before release and separate from customs duty: cigarettes $50.33 per 1,000 (small), large cigars 52.75% of the sale price up to 40.26¢ each, small cigars $50.33 per 1,000, pipe tobacco $2.8311/lb, roll-your-own $24.78/lb, snuff $1.51/lb, chewing tobacco 50.33¢/lb. E-cigarettes and tobacco-free nicotine pouches are not on the federal list.",
        "citations": [
            {"label": "26 U.S.C. 5701 (rates of tax)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title26/html/USCODE-2023-title26-subtitleE-chap52-subchapA-sec5701.htm"},
            {"label": "27 CFR 41.30–41.33 (tax rates)", "url": "https://www.ecfr.gov/current/title-27/part-41/subpart-D"},
            {"label": "27 CFR 41.62 (CBP collects the tax)", "url": "https://www.ecfr.gov/current/title-27/section-41.62"},
            {"label": "27 CFR 41.81 (tax determined before release)", "url": "https://www.ecfr.gov/current/title-27/section-41.81"},
        ],
    },
    {
        "id": "ttb-packages",
        "agency": "Treasury TTB",
        "title": "Retail packages must carry the TTB package notice (product designation such as \"cigarettes\", \"snuff\" or \"pipe tobacco\", quantity and tax class) before release; previously exported U.S. tobacco products can come back only to the original manufacturer or its export warehouse",
        "citations": [
            {"label": "27 CFR 41.71–41.75 (packages and notices)", "url": "https://www.ecfr.gov/current/title-27/part-41/subpart-E"},
            {"label": "27 CFR 41.82 (products labeled for export)", "url": "https://www.ecfr.gov/current/title-27/section-41.82"},
        ],
    },
    {
        "id": "fda-pmta",
        "agency": "FDA CTP",
        "title": "Marketing authorization: a new tobacco product — anything not on the U.S. market on February 15, 2007, or modified since, including every e-cigarette, e-liquid and nicotine pouch — needs an FDA order (PMTA, substantial equivalence or exemption) before it may be sold. A pending application is not a safe harbor.",
        "citations": [
            {"label": "21 U.S.C. 387j (FD&C Act section 910)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title21/html/USCODE-2023-title21-chap9-subchapIX-sec387j.htm"},
            {"label": "21 CFR part 1114 (PMTA)", "url": "https://www.ecfr.gov/current/title-21/part-1114"},
            {"label": "FDA: Importing Tobacco Products", "url": FDA_IMPORT},
            {"label": "91 FR 25892: enforcement priorities for unauthorized ENDS and nicotine pouches (May 12, 2026)", "url": "https://www.federalregister.gov/documents/2026/05/12/2026-09368/enforcement-priorities-for-certain-new-tobacco-products-marketed-without-premarket-authorization"},
        ],
    },
    {
        "id": "fda-entry",
        "agency": "FDA / CBP",
        "title": "FDA reviews every tobacco-product entry filed in ACE: declare the manufacturer, importer, product code and affirmation-of-compliance codes; unpaid FDA tobacco user fees lead to detention (Import Alert 98-05)",
        "citations": [
            {"label": "FDA: Importing Tobacco Products", "url": FDA_IMPORT},
            {"label": "FDA: Entry review", "url": "https://www.fda.gov/industry/fda-import-process/entry-review"},
        ],
    },
    {
        "id": "fda-import-alerts",
        "agency": "FDA / CBP",
        "title": "Detention without physical examination: any unauthorized e-cigarette (Import Alert 98-07) and listed unauthorized tobacco products such as nicotine pouches and smokeless tobacco (Import Alert 98-06)",
        "citations": [
            {"label": "FDA Import Alert 98-07", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_1164.html"},
            {"label": "FDA Import Alert 98-06", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_1163.html"},
            {"label": "FDA: import alerts updated (January 3, 2025)", "url": "https://www.fda.gov/tobacco-products/ctp-newsroom/fda-updates-import-alerts-reinforce-all-unauthorized-e-cigarettes-may-be-detained-without-physical"},
        ],
    },
    {
        "id": "fda-warnings",
        "agency": "FDA CTP",
        "title": "Required warning: \"WARNING: This product contains nicotine. Nicotine is an addictive chemical.\" on roll-your-own and cigarette tobacco and covered tobacco products (e-liquids, nicotine pouches, pipe tobacco), with separate cigar warnings; labels must name the manufacturer and the quantity",
        "citations": [
            {"label": "21 CFR part 1143", "url": "https://www.ecfr.gov/current/title-21/part-1143"},
            {"label": "FDA: Importing Tobacco Products", "url": FDA_IMPORT},
        ],
    },
    {
        "id": "tobacco-trq",
        "agency": "CBP / USTR",
        "title": "Tobacco tariff-rate quota: the low in-quota lines apply only while the country's quantity for the quota year (September 13 – September 12) is open; first come, first served; Argentina needs a certificate of origin. Canada, Israel and Mexico are outside the quota.",
        "citations": [
            {"label": "HTSUS Ch. 24, additional U.S. note 5", "url": HTS24},
            {"label": "CBP Quota Bulletin 26-502 (2027 tobacco quota year)", "url": QB},
        ],
    },
    {
        "id": "actual-use",
        "agency": "CBP",
        "title": "\"To be used in products other than cigarettes\" lines are actual-use provisions: declare the use at entry, keep records of use for 3 years after liquidation, and file a certificate of use within 3 years of entry",
        "citations": [
            {"label": "19 CFR 10.134 (declaration of intent)", "url": "https://www.ecfr.gov/current/title-19/section-10.134"},
            {"label": "19 CFR 10.137 (records of use)", "url": "https://www.ecfr.gov/current/title-19/section-10.137"},
            {"label": "19 CFR 10.138 (proof of use)", "url": "https://www.ecfr.gov/current/title-19/section-10.138"},
        ],
    },
    {
        "id": "ofac-cuba",
        "agency": "Treasury OFAC",
        "title": "No Cuban-origin tobacco: Cuban cigars and leaf cannot be imported, and since September 24, 2020 not even as personal baggage",
        "citations": [
            {"label": "31 CFR 515.204", "url": "https://www.ecfr.gov/current/title-31/section-515.204"},
            {"label": "85 FR 60068 (September 24, 2020)", "url": "https://www.federalregister.gov/documents/2020/09/24/2020-21084/cuban-assets-control-regulations"},
        ],
    },
    {
        "id": "usps-mail",
        "agency": "USPS",
        "title": "Cigarettes, smokeless tobacco and e-cigarettes cannot be sent through the U.S. Mail (PACT Act), apart from narrow exceptions — direct-to-consumer shipments need a private carrier and must meet PACT Act rules",
        "citations": [
            {"label": "86 FR 58398: Treatment of E-Cigarettes in the Mail (October 21, 2021)", "url": "https://www.federalregister.gov/documents/2021/10/21/2021-22787/treatment-of-e-cigarettes-in-the-mail"},
        ],
    },
]

GROUPS = {
    "2401": (
        ["ttb-permit", "ttb-excise", "tobacco-trq", "actual-use", "ofac-cuba"],
        "Leaf tobacco is not a taxable tobacco product, so no excise tax is due at entry — it is paid when the cigarettes or cigars made from it leave the factory. Stemmed or threshed leaf is \"processed tobacco\" and needs a TTB permit; leaf that is only cured and baled does not. Flue-cured and burley leaf for cigarettes falls under the quota (in quota 23.9¢–40.9¢/kg, over quota 350%).",
    ),
    "2402": (
        ["ttb-permit", "ttb-excise", "ttb-packages", "fda-pmta", "fda-entry", "fda-warnings", "ofac-cuba", "usps-mail"],
        "Every cigar and cigarette pays federal excise tax on top of the duty, and needs FDA marketing authorization (or grandfathered status) and TTB package notices. Cuban cigars are barred outright.",
    ),
    "2403": (
        ["ttb-permit", "ttb-excise", "ttb-packages", "fda-pmta", "fda-entry", "fda-import-alerts", "fda-warnings", "tobacco-trq", "actual-use", "ofac-cuba", "usps-mail"],
        "Pipe, roll-your-own, hookah, chewing tobacco and snuff pay excise tax per pound; bulk cut tobacco for cigarettes falls under the quota (2403.19.60/.90, 2403.91.45/.47, 2403.99.60/.90). Snuff, including gutkha, is taxed as snuff (statistical note 1).",
    ),
    "2404": (
        ["ttb-permit", "fda-pmta", "fda-entry", "fda-import-alerts", "fda-warnings", "usps-mail"],
        "E-liquids, disposable e-cigarettes, heated tobacco sticks and nicotine pouches. The duty is low (5–6.5%, or 24.7¢/kg for tobacco-containing sticks); the real gate is FDA: only authorized products may be sold, and unauthorized e-cigarettes are detained at the border. An e-cigarette device sold without nicotine liquid is classified in 8543.40, not here. The TTB permit applies only to products that are TTB tobacco products.",
    ),
}

LEVERS = [
    {
        "id": "tobacco-quota",
        "title": "Enter cigarette leaf inside the tobacco quota",
        "saves": "The difference between 350% of value and 23.9¢–40.9¢/kg — on 20 t of threshed flue-cured leaf at $5/kg ($100,000) that is $7,500 in quota against $350,000 over quota",
        "appliesTo": "Flue-cured, burley and other light air-cured leaf, tobacco stems and refuse, and cut tobacco for cigarettes: the in-quota lines \"described in additional U.S. note 5\" (2401.10.63, 2401.20.33, 2401.20.85, 2401.30.33–.37, 2403.19.60, 2403.91.45, 2403.99.60) vs. the 350% \"Other\" lines",
        "document": "Entry under the in-quota subheading while your country's quantity is open. For the quota year September 13, 2026 – September 12, 2027: Brazil 80,200 t, Malawi 12,000 t, Zimbabwe 12,000 t, Argentina 10,750 t (certificate of origin), Guatemala 10,000 t, EU 9,956 t, Thailand 7,000 t, Philippines 3,000 t, Chile 2,750 t, United Kingdom 44 t, all other countries 3,000 t.",
        "caveat": "Quotas fill first come, first served from the opening day (September 14, 2026). Once a country's quantity is full, the same leaf pays 350% — unless it qualifies for an FTA that makes the over-quota line Free (Australia, Chile, CAFTA-DR, Colombia, Korea, Peru and others).",
        "citations": [
            {"label": "HTSUS Ch. 24, additional U.S. note 5", "url": HTS24},
            {"label": "CBP Quota Bulletin 26-502", "url": QB},
        ],
    },
    {
        "id": "other-than-cigarettes",
        "title": "Declare leaf \"to be used in products other than cigarettes\"",
        "saves": "Leaf for cigars, pipe tobacco, roll-your-own or chewing tobacco skips the quota: 23.9¢/kg, 40.9¢/kg or 37.5¢/kg instead of risking the 350% over-quota rate",
        "appliesTo": "2401.10.61, 2401.20.31, 2401.20.83, 2401.30.25/.27, 2403.19.30, 2403.91.43, 2403.99.31. Leaf used to make tobacco for hand-rolled cigarettes counts as \"other than cigarettes\" (additional U.S. note 5(e)).",
        "document": "A declaration of intended use at entry, records of use, and a certificate of use filed within 3 years (19 CFR 10.134–10.138).",
        "caveat": "If the leaf ends up in cigarettes, or the use cannot be proven, CBP assesses the in-quota or over-quota rate plus interest.",
        "citations": [
            {"label": "HTSUS Ch. 24, additional U.S. note 5(e)", "url": HTS24},
            {"label": "19 CFR 10.134", "url": "https://www.ecfr.gov/current/title-19/section-10.134"},
            {"label": "19 CFR 10.138", "url": "https://www.ecfr.gov/current/title-19/section-10.138"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on tobacco from Canada or Mexico",
        "saves": "The base rate and the 10% Section 301 duty",
        "appliesTo": "Every Chapter 24 line that qualifies as originating under USMCA (SPI S); Canadian and Mexican leaf is also outside the quota",
        "document": "A USMCA certification of origin from the importer, exporter or producer.",
        "caveat": "Claiming without a valid certification exposes the entry to the duty plus penalties. The USMCA was not renewed at the July 1, 2026 joint review but remains in force. Excise tax and FDA rules apply regardless of origin.",
        "citations": [
            {"label": "19 CFR part 182 (USMCA)", "url": "https://www.ecfr.gov/current/title-19/part-182"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52 (9903.05.93–.94)", "url": HTS99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim CAFTA-DR or another free trade agreement",
        "saves": "The base rate — for Dominican, Nicaraguan and Honduran cigars the whole $1.89/kg + 4.7% or 57¢/kg + 1.4%, and for leaf even the 350% over-quota rate. The Section 301 duty stays.",
        "appliesTo": "Goods of CAFTA-DR (SPI P), Australia, Chile, Colombia, Korea, Peru, Panama, Morocco, Oman, Bahrain, Singapore and Israel (and Jordan for heading 2404) that meet the agreement's rules of origin",
        "document": "The FTA claim on the entry with the agreement's origin documentation (certification or the importer's knowledge, per the agreement).",
        "caveat": "An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a)): CAFTA-DR cigars from the Dominican Republic or Nicaragua still pay 12.5%, from Honduras 10%. Colombian over-quota leaf is Free with no quantity limit from 2026 (9918.24.11).",
        "citations": [
            {"label": "HTSUS Ch. 24 (special rate column)", "url": HTS24},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": HTS99},
            {"label": "HTSUS Ch. 99, subch. XVIII, U.S. note 9 (Colombia tobacco)", "url": HTS99},
        ],
    },
    {
        "id": "samples",
        "title": "Bring in trade samples under Chapter 98",
        "saves": "Duty, the Section 301 duty and the federal excise tax on qualifying samples: 9811.00.40 is Free and exempts the samples from internal-revenue tax",
        "appliesTo": "Samples used only to solicit orders, by a person importing tobacco products in commercial quantities",
        "document": "Entry under 9811.00.40; one sample of each product per importer per calendar quarter.",
        "caveat": "Each sample may be no more than 3 cigars, 3 cigarettes, 3.5 g of tobacco or 3.5 g of snuff. The 2026 Section 301 duties do not apply to goods properly entered under a Chapter 98 provision (U.S. note 52(a)). FDA authorization rules still apply to what is later sold.",
        "provisions": [
            {"code": "9811.00.40", "rate": "Free", "text": "Samples of tobacco products, and cigarette papers and tubes (not more than 3 cigars, 3 cigarettes, 3.5 g of tobacco or 3.5 g of snuff each), used only for soliciting orders by importers in commercial quantities"},
            {"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned after export without being advanced in value or improved in condition abroad"},
        ],
        "citations": [
            {"label": "HTSUS chapter 98, subchapter XI", "url": HTS98},
            {"label": "HTSUS Ch. 24, additional U.S. note 4", "url": HTS24},
        ],
    },
    {
        "id": "warehouse",
        "title": "Defer duty and excise tax in a bonded warehouse or foreign-trade zone",
        "saves": "Cash flow: duty and federal excise tax are paid when the goods are withdrawn for consumption, not on arrival; goods re-exported from the warehouse pay neither",
        "appliesTo": "Cigars, cigarettes and other tobacco products entered for warehousing",
        "document": "A warehouse entry (or FTZ admission); the excise tax is due by the 14th day after the semimonthly period in which the goods leave the first warehouse.",
        "caveat": "Deferral, not a reduction: the rate in force on the withdrawal date applies.",
        "citations": [
            {"label": "27 CFR 41.84 (entry for warehousing)", "url": "https://www.ecfr.gov/current/title-27/section-41.84"},
            {"label": "19 CFR part 144 (warehouse entries)", "url": "https://www.ecfr.gov/current/title-19/part-144"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when imported tobacco is exported again",
        "saves": "Up to 99% of the customs duties paid on tobacco that is exported or used to make exported products",
        "appliesTo": "Leaf blended into cigarettes or cigars for export, or tobacco products re-exported unused",
        "document": "A drawback claim filed with CBP within 5 years of import, with proof of export.",
        "caveat": "Not every duty is eligible for drawback; confirm with CBP which duties on your entry can be refunded before pricing on it.",
        "citations": [
            {"label": "19 CFR part 190 (drawback)", "url": "https://www.ecfr.gov/current/title-19/part-190"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty: a ruling fixes the classification — wrapper vs. filler, cigarette vs. cigar, pipe vs. roll-your-own, e-liquid (2404) vs. device (8543.40) — before the goods arrive",
        "appliesTo": "Any Chapter 24 product",
        "document": "A ruling request to CBP under 19 CFR part 177.",
        "caveat": "Rulings apply to the transaction described; a different product may need its own. A CBP classification ruling does not decide the excise tax class (TTB) or FDA status.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
        ],
    },
]
