# tariffUpdates sources and change-log entries (beyond the measures the generator writes).


def src(id, publisher, citation, document, title, signed, published, url):
    return {"id": id, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


FR = "https://www.federalregister.gov/documents/"

EXTRA_SOURCES = [
    src("fr-2025-13453", "Federal Register", "90 FR 33363", "Notice (Commerce, ITA)",
        "Fresh Tomatoes From Mexico: Termination of Suspension Agreement, Rescission of Administrative Reviews, and Imposition of an Antidumping Duty Order",
        None, "2025-07-17", FR + "2025/07/17/2025-13453/fresh-tomatoes-from-mexico-termination-of-suspension-agreement-rescission-of-administrative-reviews"),
    src("fr-2026-03195", "Federal Register", "91 FR 7439", "Notice (Commerce, ITA)",
        "Fresh Tomatoes From Mexico: Final Clarification of the Scope of the Antidumping Duty Order",
        None, "2026-02-18", FR + "2026/02/18/2026-03195/fresh-tomatoes-from-mexico-final-clarification-of-the-scope-of-the-antidumping-duty-order"),
    src("fr-2026-14884", "Federal Register", "91 FR 46455", "Notice (USITC)",
        "Fresh Tomatoes From Mexico; Determination (Investigation No. 751-TA-30, Changed Circumstances Review)",
        None, "2026-07-23", FR + "2026/07/23/2026-14884/fresh-tomatoes-from-mexico-determination"),
    src("fr-2023-11061", "Federal Register", "88 FR 33570", "Notice (Commerce, ITA)",
        "Fresh Garlic From the People's Republic of China: Continuation of Antidumping Duty Order",
        None, "2023-05-24", FR + "2023/05/24/2023-11061/fresh-garlic-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"),
    src("fr-2024-12351", "Federal Register", "89 FR 48373", "Notice (Commerce, ITA)",
        "Fresh Garlic From the People's Republic of China: Final Results and Rescission of Antidumping Duty Administrative Review; 2021-2022",
        None, "2024-06-06", FR + "2024/06/06/2024-12351/fresh-garlic-from-the-peoples-republic-of-china-final-results-and-rescission-of-antidumping-duty-administrative-review-2021-2022"),
    src("fr-2026-07748", "Federal Register", "91 FR 21276", "Notice (USDA APHIS)",
        "Importation of Fresh Leaves and Stems of Glasswort From Israel Into the United States",
        None, "2026-04-21", FR + "2026/04/21/2026-07748/importation-of-fresh-leaves-and-stems-of-glasswort-from-israel-into-the-united-states"),
    src("fr-2026-04922", "Federal Register", "91 FR 12339", "Notice (USDA APHIS)",
        "Notice of Availability of a Pest Risk Analysis for the Importation of Fresh Sweet Potato (Ipomoea batatas (L.)) Roots From the Republic of Korea Into the United States",
        None, "2026-03-13", FR + "2026/03/13/2026-04922/notice-of-availability-of-a-pest-risk-analysis-for-the-importation-of-fresh-sweet-potato-ipomoea"),
    src("fr-2026-04205", "Federal Register", "91 FR 10365", "Notice (USDA APHIS)",
        "Notice of Availability of a Pest Risk Analysis for the Importation of Globe Artichoke From Sardinia, Italy Into the United States",
        None, "2026-03-03", FR + "2026/03/03/2026-04205/notice-of-availability-of-a-pest-risk-analysis-for-the-importation-of-globe-artichoke-from-sardinia"),
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194",
        "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07",
        FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193",
        "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07",
        FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325",
        "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-07-31", "2025-08-06",
        FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257",
        "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
        "2025-04-02", "2025-04-07",
        FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14360", "Federal Register", "90 FR 54091", "Executive Order 14360",
        "Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products", "2025-11-14", "2025-11-25",
        FR + "2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions",
        "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012",
        "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25",
        FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties",
        None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump",
        None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review",
        None, "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    src("ustr-agoa-2026", "USTR", "USTR press release", "Statement",
        "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03",
        "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"),
    src("procl-11030", "Federal Register", "91 FR 30469", "Proclamation 11030",
        "To Implement Certain Provisions in the Consolidated Appropriations Act, 2026, and for Other Purposes", "2026-05-19", "2026-05-22",
        FR + "2026/05/22/2026-10398/to-implement-certain-provisions-in-the-consolidated-appropriations-act-2026-and-for-other-purposes"),
    src("cbp-gsp", "CBP", "CBP web page (modified August 6, 2026)", "Web page", "Generalized System of Preferences (GSP)", None, "2026-08-06",
        "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"),
]

AG26 = ("tomatoes (0702), jicama, breadfruit and chayote, bamboo shoots and water chestnuts (0710.80.15), capers, dried wood ears "
        "and shiitake, Bambara beans, cassava, taro, yautia and Chinese water chestnuts")

EXTRA_CHANGES = [
    {
        "id": "tomato-itc-751b", "type": "reference", "date": "2026-07-20", "dateLabel": "Determined",
        "title": "USITC keeps the antidumping order on Mexican tomatoes",
        "detail": "In a changed-circumstances review requested by Mexican growers, the USITC determined that changed circumstances "
        "sufficient to warrant revoking the antidumping order on fresh tomatoes from Mexico do not exist. The order and its cash "
        "deposits (17.09% for most exporters) stay in place.",
        "before": None, "now": None, "countries": "Mexico", "sourceIds": ["fr-2026-14884", "fr-2025-13453"],
    },
    {
        "id": "glasswort-il", "type": "reference", "date": "2026-04-21", "dateLabel": "Effective",
        "title": "APHIS authorizes fresh glasswort from Israel",
        "detail": "Fresh leaves and stems of glasswort (Salicornia europaea) for consumption may be imported from Israel under "
        "APHIS phytosanitary measures. A pest risk analysis for fresh sweet potatoes from South Korea (comments closed May 12, "
        "2026) and one for globe artichokes from Sardinia, Italy were published earlier in 2026; no decision notice for either "
        "had been published in the Federal Register as of October 11, 2026.",
        "before": "Not authorized", "now": "Authorized", "countries": "Israel",
        "sourceIds": ["fr-2026-07748", "fr-2026-04922", "fr-2026-04205"],
    },
    {
        "id": "tomato-processing-cert", "type": "reference", "date": "2026-02-18", "dateLabel": "Published",
        "title": "Tomatoes for processing need SC-6 and a certification to stay outside the antidumping order",
        "detail": "Commerce clarified that Mexican tomatoes imported for processing (and therefore excluded from the order) must be "
        "entered with USDA's Importer's Exempt Commodity Form (SC-6) and a Processing Tomatoes Certification Form, uploaded to ACE "
        "by entry summary. The coverage of the order did not change.",
        "before": None, "now": None, "countries": "Mexico", "sourceIds": ["fr-2026-03195"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
        "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. The product exemption list (9903.03.03) "
        f"included 26 Chapter 07 subheadings — {AG26}; USMCA goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting "
        "them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in "
        "Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025, when it had lapsed. "
        "AGOA (SPI D) makes most dutiable Chapter 07 lines Free for listed sub-Saharan countries (the Section 301 duty, where a "
        "country has one, still applies). GSP (SPI A, A*, A+) remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026", "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "procl-11030", "cbp-gsp", "hts-now"],
    },
    {
        "id": "ag-exemption", "type": "reference", "date": "2025-11-13", "dateLabel": "Effective",
        "title": "Agricultural exemption from the reciprocal tariff reached 26 Chapter 07 subheadings",
        "detail": f"Executive Order 14360 exempted listed farm products from the reciprocal duties. The list (U.S. note 2(v)(iii)) "
        f"covered {AG26}. Other vegetables — onions, garlic, peppers, cucumbers, asparagus, potatoes, frozen and dried "
        "vegetables, dry beans and lentils — kept paying until the duties ended on February 24, 2026.",
        "before": None, "now": None, "countries": "All countries subject to the reciprocal tariff", "sourceIds": ["eo-14360", "hts-now"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "tomato-ad-order", "type": "extraDuty", "date": "2025-07-14", "dateLabel": "Effective",
        "title": "Antidumping duty on fresh tomatoes from Mexico",
        "detail": "Commerce withdrew from the 2019 suspension agreement, which had set minimum prices instead of duties, and "
        "imposed an antidumping order on fresh and chilled tomatoes from Mexico (heading 0702). CBP collects cash deposits of "
        "17.09% of value for most exporters (2.81% to 273.43% for the named companies). Tomatoes for processing are excluded. The "
        "duty applies with or without a USMCA claim.",
        "before": "Suspension agreement (no duty)", "now": "17.09% (most exporters)", "countries": "Mexico",
        "sourceIds": ["fr-2025-13453"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "garlic-ad", "type": "reference", "date": "2023-05-24", "dateLabel": "Continued",
        "title": "Antidumping order on fresh garlic from China continued for five more years",
        "detail": "After the fifth sunset review, Commerce continued the 1994 antidumping order on fresh garlic from China "
        "(fresh, chilled, frozen, provisionally preserved or water-packed garlic, 0703.20 and related lines). The China-wide cash "
        "deposit is $4.71 per kilogram (89 FR 48373), on top of the tariff and the Section 301 duties.",
        "before": None, "now": "$4.71/kg (China-wide)", "countries": "China", "sourceIds": ["fr-2023-11061", "fr-2024-12351"],
    },
]
