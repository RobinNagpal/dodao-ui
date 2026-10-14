"""tariffEngineering page for Chapter 29: agency rules (eCFR / IRS / Commerce), duty levers and the per-line mapping."""
from fill29_lib import n

CNT = {}
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
PA = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Pharmaceutical%20Appendix"
DYES = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Intermediate%20Chemicals%20for%20Dyes"
CH29 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2029"
P11020 = "https://www.federalregister.gov/documents/2026/04/09/2026-06956/adjusting-imports-of-pharmaceuticals-and-pharmaceutical-ingredients-into-the-united-states"
FR = "https://www.federalregister.gov/documents/"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


# AD/CVD orders in force (product, countries, subheadings whose lines are mapped, citations)
ADCVD = [
    ("adcvd-citric", "Citric acid and citrate salts", "AD/CVD China; AD Belgium, Colombia, Thailand; India and Canada under investigation",
     ["2918.14", "2918.15"], [("91 FR 32004 (China, continued May 29, 2026)", FR + "2026/05/29/2026-10677/citric-acid-and-certain-citrate-salts-from-the-peoples-republic-of-china-continuation-of-antidumping"),
                              ("89 FR 63406 (Belgium, Colombia, Thailand, continued)", FR + "2024/08/05/2024-17172/citric-acid-and-certain-citrate-salts-from-belgium-colombia-and-thailand-continuation-of-antidumping-duty")]),
    ("adcvd-gluconate", "Sodium gluconate, gluconic acid and derivatives", "AD/CVD China", ["2918.16", "2932.20"],
     [("89 FR 21487 (continued March 28, 2024)", FR + "2024/03/28/2024-06600/sodium-gluconate-gluconic-acid-and-derivative-products-from-the-peoples-republic-of-china-continuation")]),
    ("adcvd-24d", "2,4-D (2,4-dichlorophenoxyacetic acid), its salts and esters", "AD/CVD China and India", ["2918.99", "2921.11", "2921.19", "2922.12", "2922.19"],
     [("90 FR 22243 (AD orders, May 27, 2025)", FR + "2025/05/27/2025-09452/24-dichlorophenoxyacetic-acid-from-india-and-the-peoples-republic-of-china-antidumping-duty-orders"),
      ("90 FR 22232 (CVD orders)", FR + "2025/05/27/2025-09453/24-dichlorophenoxyacetic-acid-from-the-peoples-republic-of-china-and-india-countervailing-duty-orders")]),
    ("adcvd-glycine", "Glycine", "AD China, India, Japan, Thailand; CVD China, India", ["2922.49"],
     [("90 FR 8275 (continued January 28, 2025)", FR + "2025/01/28/2025-01795/glycine-from-india-the-peoples-republic-of-china-japan-and-thailand-continuation-of-antidumping-and")]),
    ("adcvd-lysine", "L-lysine", "AD/CVD China", ["2922.41"],
     [("91 FR 58627 (orders, September 16, 2026)", FR + "2026/09/16/2026-18924/l-lysine-from-the-peoples-republic-of-china-antidumping-duty-order-and-countervailing-duty-order")]),
    ("adcvd-msg", "Monosodium glutamate", "AD China, Indonesia", ["2922.42"],
     [("91 FR 34221 (continued June 5, 2026)", FR + "2026/06/05/2026-11326/monosodium-glutamate-from-the-republic-of-indonesia-and-the-peoples-republic-of-china-continuation")]),
    ("adcvd-hfc", "HFC refrigerants R-134a, R-125 and R-32", "AD China (R-134a, R-32); AD/CVD China (R-125)", ["2903.42", "2903.44", "2903.45"],
     [("87 FR 65572 (R-134a, continued)", FR + "2022/10/31/2022-23639/111-2-tetrafluoroethane-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"),
      ("87 FR 12081 (R-125 orders)", FR + "2022/03/03/2022-04505/pentafluoroethane-r-125-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty"),
      ("91 FR 51658 (R-32, continued August 11, 2026)", FR + "2026/08/11/2026-16297/difluoromethane-r-32-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order")]),
    ("adcvd-melamine", "Melamine", "AD Germany, Japan, Netherlands, Trinidad and Tobago, India; CVD Germany, Qatar, Trinidad and Tobago, India", ["2933.61"],
     [("90 FR 8701 (AD orders, January 31, 2025)", FR + "2025/01/31/2025-01999/melamine-from-germany-japan-the-netherlands-and-trinidad-and-tobago-antidumping-duty-orders"),
      ("90 FR 8698 (CVD orders)", FR + "2025/01/31/2025-02001/melamine-from-germany-qatar-and-trinidad-and-tobago-countervailing-duty-orders"),
      ("90 FR 15221 (India, April 9, 2025)", FR + "2025/04/09/2025-06100/melamine-from-india-antidumping-and-countervailing-duty-orders")]),
    ("adcvd-isocyanurates", "Chlorinated isocyanurates and hexamine", "Chlorinated isocyanurates: AD China, Spain; CVD China. Hexamine: AD/CVD China, AD Germany, India, Saudi Arabia, CVD India",
     ["2933.69"], [("88 FR 10871 (chlorinated isocyanurates AD, continued)", FR + "2023/02/22/2023-03652/chlorinated-isocyanurates-from-the-peoples-republic-of-china-and-spain-continuation-of-antidumping"),
                   ("90 FR 54303 (chlorinated isocyanurates CVD, continued)", FR + "2025/11/26/2025-21219/chlorinated-isocyanurates-from-the-peoples-republic-of-china-continuation-of-countervailing-duty-order"),
                   ("90 FR 44024 (hexamine, China)", FR + "2025/09/11/2025-17525/hexamethylenetetramine-from-the-peoples-republic-of-china-antidumping-order-and-countervailing-duty-order"),
                   ("91 FR 501 (hexamine, Germany, India, Saudi Arabia)", FR + "2026/01/07/2026-00092/hexamethylenetetramine-from-the-kingdom-of-saudi-arabia-saudi-arabia-amended-final-antidumping-duty")]),
    ("adcvd-corrosion", "Tolyltriazole and benzotriazole (corrosion inhibitors)", "AD/CVD China", ["2933.99"],
     [("91 FR 50758 (continued August 6, 2026)", FR + "2026/08/06/2026-16052/certain-corrosion-inhibitors-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-and")]),
    ("adcvd-hedp", "HEDP (1-hydroxyethylidene-1,1-diphosphonic acid)", "AD/CVD China", ["2931.49", "2931.90"],
     [("87 FR 73756 (continued)", FR + "2022/12/01/2022-26160/1-hydroxyethylidene-11-diphosphonic-acid-from-the-peoples-republic-of-china-continuation-of"),
      ("91 FR 8410 (circumvention finding, February 23, 2026)", FR + "2026/02/23/2026-03538/1-hydroxyethylidene-1-1-diphosphonic-acid-from-the-peoples-republic-of-china-final-affirmative")]),
    ("adcvd-furfuryl", "Furfuryl and tetrahydrofurfuryl alcohol", "AD China", ["2932.13"],
     [("88 FR 12657 (furfuryl alcohol, continued)", FR + "2023/02/28/2023-04045/furfuryl-alcohol-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"),
      ("91 FR 24169 (tetrahydrofurfuryl alcohol, continued May 5, 2026)", FR + "2026/05/05/2026-08739/tetrahydrofurfuryl-alcohol-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order")]),
    ("adcvd-vanillin", "Vanillin", "AD/CVD China", ["2912.41"],
     [("90 FR 35504 (orders, July 28, 2025)", FR + "2025/07/28/2025-14213/vanillin-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty-orders")]),
    ("adcvd-erythritol", "Erythritol", "AD/CVD China", ["2905.49"],
     [("91 FR 14812 (orders, March 27, 2026)", FR + "2026/03/27/2026-06008/erythritol-from-the-peoples-republic-of-china-antidumping-duty-and-countervailing-duty-orders")]),
    ("adcvd-mdi", "MDI (methylene diphenyl diisocyanate)", "AD China", ["2929.10"],
     [("91 FR 38393 (order, June 25, 2026)", FR + "2026/06/25/2026-12771/methylene-diphenyl-diisocyanate-from-the-peoples-republic-of-china-amended-final-determination-of")]),
    ("adcvd-acetone", "Acetone", "AD Belgium, Singapore, South Africa, South Korea, Spain", ["2914.11"],
     [("91 FR 5432 (continued February 6, 2026)", FR + "2026/02/06/2026-02410/acetone-from-belgium-singapore-the-republic-of-south-africa-the-republic-of-south-korea-and-spain")]),
    ("adcvd-dotp", "Dioctyl terephthalate (DOTP)", "AD South Korea, Malaysia, Poland, Taiwan, Türkiye", ["2917.39"],
     [("88 FR 56590 (Korea, continued)", FR + "2023/08/18/2023-17812/dioctyl-terephthalate-from-the-republic-of-korea-continuation-of-antidumping-duty-order"),
      ("90 FR 21897 (Malaysia, Poland, Taiwan, Türkiye)", FR + "2025/05/22/2025-09163/dioctyl-terephthalate-from-malaysia-poland-taiwan-and-the-republic-of-turkiye-antidumping-duty-orders")]),
    ("adcvd-alkylphos", "Alkyl phosphate esters (TCPP)", "AD/CVD China", ["2919.90"],
     [("90 FR 24579 (orders, June 11, 2025)", FR + "2025/06/11/2025-10630/certain-alkyl-phosphate-esters-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty")]),
    ("adcvd-methionine", "Methionine", "AD France, Japan, Spain", ["2930.40"],
     [("86 FR 36705 (France)", FR + "2021/07/13/2021-14893/methionine-from-france-antidumping-duty-order"),
      ("86 FR 51119 (Japan, Spain)", FR + "2021/09/14/2021-19709/methionine-from-japan-and-spain-antidumping-duty-orders")]),
    ("adcvd-monomers", "Acrylate and methacrylate monomers and oligomers", "AD/CVD Taiwan; AD South Korea", ["2916.12", "2916.14"],
     [("91 FR 11951 (Taiwan, March 11, 2026)", FR + "2026/03/11/2026-04766/certain-monomers-and-oligomers-from-taiwan-antidumping-duty-order-and-countervailing-duty-order"),
      ("91 FR 47214 (South Korea, July 28, 2026)", FR + "2026/07/28/2026-15220/certain-monomers-and-oligomers-from-the-republic-of-korea-antidumping-duty-order")]),
    ("adcvd-oba", "Stilbenic optical brightening agents", "AD China, Taiwan", ["2921.59"],
     [("90 FR 11511 (continued March 7, 2025)", FR + "2025/03/07/2025-03715/stilbenic-optical-brightening-agents-from-the-peoples-republic-of-china-and-taiwan-continuation-of")]),
]
PENDING = [
    ("adcvd-pending", "Pending AD/CVD investigations: choline salts (China, 2923.10), THAM (China, 2922.19), CBS (China, 2934.20), citric acid (India, Canada), fatty acids (Indonesia, Malaysia)",
     ["2923.10", "2922.19", "2934.20", "2918.14", "2918.15", "2915.70", "2915.90", "2916.15"],
     [("91 FR 45241 (choline salts, initiation July 20, 2026)", FR + "2026/07/20/2026-14518/certain-choline-salts-from-the-peoples-republic-of-china-initiation-of-less-than-fair-value-investigation"),
      ("91 FR 60585 (THAM, preliminary CVD)", FR + "2026/09/24/2026-19530/trishydroxymethylaminomethane-from-the-peoples-republic-of-china-preliminary-affirmative-countervailing"),
      ("91 FR 64337 (CBS, preliminary CVD)", FR + "2026/10/08/2026-20692/n-cyclohexylbenzothiazole-2-sulfenamide-from-the-peoples-republic-of-china-preliminary-affirmative"),
      ("91 FR 55083 (citric acid, India, preliminary AD)", FR + "2026/08/26/2026-17418/citric-acid-and-certain-citrate-salts-from-india-preliminary-affirmative-determination-of-sales-at"),
      ("91 FR 60096 (fatty acids, Indonesia, preliminary AD)", FR + "2026/09/22/2026-19378/certain-fatty-acids-from-indonesia-preliminary-affirmative-determination-of-sales-at-less-than-fair")]),
]

DEA_LISTED = ["2939.41", "2939.42", "2939.43", "2939.44", "2939.61", "2939.62", "2916.34", "2922.43", "2924.23", "2932.91", "2932.92", "2932.93", "2932.94",
              "2926.40", "2912.21", "2904.20", "2921.11", "2921.19", "2933.32", "2932.20", "2915.24", "2914.11", "2914.12", "2914.13", "2902.30", "2909.11",
              "2903.99", "2918.30.25.10", "2918.99.43.10", "2924.29.71.10", "2932.99.61.10", "2933.39.61.40"]
DEA_CS = ["2921.46", "2922.31", "2922.44", "2932.95", "2933.33", "2933.36", "2933.37", "2933.41", "2933.53", "2933.54", "2933.91", "2933.92", "2934.91",
          "2934.92", "2939.11", "2939.45", "2939.71"]
HFC = ["2903.41", "2903.42", "2903.43", "2903.44", "2903.45", "2903.46", "2903.47", "2903.48", "2903.49"]
ODS = ["2903.14", "2903.19.60.10", "2903.61", "2903.71", "2903.72", "2903.73", "2903.74", "2903.75", "2903.76", "2903.77", "2903.78", "2903.79"]
SUPERFUND = ["2901.10.10", "2901.21", "2901.22", "2901.23", "2901.24.10", "2901.29", "2902.11", "2902.20", "2902.30", "2902.41", "2902.42", "2902.43", "2902.44",
             "2902.50", "2902.60", "2902.70", "2903.12", "2903.13", "2903.14", "2903.15", "2903.21", "2903.22", "2903.23", "2905.11", "2905.12", "2905.13", "2905.16",
             "2905.31", "2905.32", "2905.41", "2905.42", "2905.45", "2907.11", "2907.23", "2910.10", "2910.20", "2910.30", "2912.11", "2914.11", "2914.12",
             "2914.13", "2915.21", "2915.32", "2916.14", "2917.12", "2917.14", "2917.35", "2917.36", "2921.22", "2921.41", "2922.11", "2922.12", "2922.15",
             "2926.10", "2929.10", "2932.11", "2933.61", "2933.71"]
CWC = ["2920.21", "2920.22", "2920.23", "2920.24", "2921.12", "2921.13", "2921.14", "2922.15", "2922.16", "2922.17", "2922.18", "2930.60", "2930.70",
       "2931.41", "2931.42", "2931.43", "2931.44", "2931.45", "2931.46", "2931.47", "2931.48"]


def apply(d, L, cnt, F, ecfr_as_of, as_of):
    te = d["tariffEngineering"]
    te["h1"] = "HTS Chapter 29: Organic Chemicals — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Organic Chemicals & APIs: DEA, TSCA, EPA Rules, AD/CVD and Legal Ways to Lower Duty (HTS Ch. 29) | KoalaGains",
        "shortDescription": (
            "Tariff engineering for HTS Chapter 29: the Pharmaceutical Appendix, the Section 301 pharmaceutical-use exemption, Section 232 generic and specialty "
            "headings, USMCA chemical-reaction origin, first-sale valuation, FTZ and drawback — plus DEA, TSCA, EPA HFC, FDA and Superfund tax rules per line."
        ),
        "keywords": [
            "HTS Chapter 29",
            "Organic chemicals",
            "Tariff Engineering",
            "pharmaceutical appendix",
            "hts pharmaceutical appendix",
            "cbp pharmaceutical appendix",
            "first-sale valuation",
            "FTZ",
            "duty drawback",
            "superfund chemical tax",
            "superfund taxable chemicals list",
            "citric acid antidumping",
            "glycine antidumping",
        ],
    }
    te["intro"] = (
        f"Most Chapter 29 duty is set by three things the importer documents: **what the chemical is** (a listed drug ingredient enters Free under the "
        f"Pharmaceutical Appendix on {cnt['K']} lines), **what it is for** (a chemical for use in pharmaceutical applications is exempt from the 2026 Section 301 "
        f"duty on {cnt['e52']} lines; a generic or non-drug use avoids the Section 232 duty on the {cnt['p40']} drug-ingredient lines) and **where it was made** "
        "(China adds its Section 301 lists, USMCA goods skip Section 301, and a chemical reaction decides origin). Valuation (first sale), foreign-trade zones, "
        "drawback and binding rulings help on any line.\n\n"
        "Whether the goods may enter at all is decided by the agencies: **DEA** for listed precursors and controlled substances, **EPA** for TSCA and for HFC "
        "and ozone-depleting refrigerants, **FDA** for drug ingredients, **BIS** for Chemical Weapons Convention chemicals and **DOT** for hazardous materials. "
        "Antidumping and countervailing duties and the IRS Superfund and ozone-depleting-chemical taxes are owed on top of the tariff. Each rule and lever "
        f"below links to its regulation (eCFR text current to {ecfr_as_of})."
    )
    te["lastCheckedAt"] = as_of
    te["regulationsAsOf"] = ecfr_as_of

    te["levers"] = [
        {
            "id": "k-appendix",
            "title": "Claim the Pharmaceutical Appendix (Free (K)) for listed drug ingredients",
            "saves": "The base rate — up to 6.5% of value — from any column-1 country",
            "appliesTo": f"{cnt['K']} dutiable lines that show \"K\" in the Special column, when the product is an INN listed in table 1 of the Pharmaceutical Appendix (or a salt, ester or hydrate named with a table 2 prefix or suffix in the same 6-digit subheading)",
            "document": "The product's INN (International Nonproprietary Name) and its entry in the Pharmaceutical Appendix; claim SPI \"K\" on the entry line.",
            "caveat": "K removes only the base rate: the 2026 Section 301 duty still applies (note 52(a)) unless the pharmaceutical-use exemption is claimed, and Section 232 applies in addition to any special rate (note 40(b)). A chemical that is not on the appendix does not qualify, even if used in a drug.",
            "citations": [
                {"label": "HTSUS General Note 13", "url": GN},
                {"label": "Pharmaceutical Appendix to the HTSUS", "url": PA},
            ],
        },
        {
            "id": "s301-pharma-use",
            "title": "Declare the pharmaceutical-use exemption from the Section 301 duties",
            "saves": "10% or 12.5% of value (60 economies), and for goods of Brazil also the 25% Brazil duty",
            "appliesTo": f"{cnt['e52']} lines whose subheadings are listed in U.S. note 52(e) — heading 9903.05.89 (Brazil: note 50(a)(v), 9903.05.06) — when the chemical is for use in pharmaceutical applications",
            "document": "The exemption heading on the entry and records showing the pharmaceutical end use (buyer, drug product, purchase order); CBP may ask for them.",
            "caveat": "The same chemical sold to a non-pharmaceutical user pays the duty. The exemption does not lift China's List 3 or 4A duties or AD/CVD.",
            "citations": [
                {"label": "HTSUS 9903.05.89, U.S. note 52(e)", "url": CH99},
                {"label": "USTR notice of actions (91 FR 47318)", "url": FR + "2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies"},
            ],
        },
        {
            "id": "s232-type",
            "title": "Use the right Section 232 heading: generic, non-drug use, specialty, research or U.S.-origin API",
            "saves": "The whole Section 232 duty — up to 100% of value (15% for EU, Japanese, Korean and Swiss goods)",
            "appliesTo": f"The {cnt['p40']} drug-ingredient lines of U.S. note 40(c): generics and their ingredients (9903.04.67); chemicals that are not pharmaceutical articles — excipients, inactive ingredients, non-drug uses — or neither patented nor generic (9903.04.69); listed specialty products from listed jurisdictions (9903.04.66); clinical-trial and R&D material (9903.04.70)",
            "document": "For generics, the FDA application (ANDA, 505(b)(2) or 351(k)) of the drug the ingredient goes into and evidence no valid U.S. patent covers it; for non-drug use, the buyer's use; for specialty, Commerce's designation.",
            "caveat": "An ingredient for a drug listed in the Orange or Purple Book with an unexpired patent is \"patented\" even if generics exist. Generic and non-drug entries are outside 9903.04.60–9903.04.66, so the 2026 Section 301 duty applies unless 52(b) or 52(e) exempts the line.",
            "citations": [
                {"label": "HTSUS 9903.04.60–9903.04.70, U.S. note 40", "url": CH99},
                {"label": "Proclamation 11020", "url": P11020},
                {"label": "Commerce specialty-pharmaceutical notice (91 FR 60360)", "url": FR + "2026/09/23/2026-19498/guidance-and-procedures-for-implementing-tariff-adjustments-for-specialty-pharmaceuticals-and"},
                {"label": "CBP CSMS # 70054007", "url": "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42cf077"},
            ],
        },
        {
            "id": "origin-reaction",
            "title": "Know the origin — a chemical reaction usually decides it",
            "saves": "China's 25% or 7.5% Section 301 list duty and the 12.5% (instead of 10%) rate, AD/CVD tied to Chinese origin, or 100% vs 15% under Section 232",
            "appliesTo": "All lines; most valuable for the lines on the China lists and the Section 232 list",
            "document": "Production records showing where the last chemical reaction took place; a CBP ruling when a Chinese intermediate is reacted, purified or salted elsewhere.",
            "caveat": "Purification, dilution, mixing, salt formation and repackaging may not change origin. AD/CVD orders define their own scope and can reach altered forms through circumvention rulings (solid acidic HEDP from China, February 2026).",
            "citations": [
                {"label": "19 CFR part 177 (rulings)", "url": ecfr_part(19, 177)},
                {"label": "HTSUS Ch. 99, U.S. note 20 (China lists)", "url": CH99},
            ],
        },
        {
            "id": "usmca",
            "title": "Claim USMCA for Canadian or Mexican chemicals",
            "saves": "The base rate (up to 6.5%) and the 10% Section 301 duty on Canadian or Mexican goods",
            "appliesTo": "All lines, for goods that meet the Chapter 29 rule: a change of subheading, a regional value content of 40% (transaction value) or 30% (net cost), or a chemical reaction in a USMCA country",
            "document": "A USMCA certification of origin from the importer, exporter or producer.",
            "caveat": "A USMCA claim does not remove the 50% Section 338 duty on Canadian mannitol, sorbitol, glycerol and D-arabinose, the Section 232 duty or AD/CVD.",
            "citations": [
                {"label": "HTSUS General Note 11 (chemical reaction rule; Chapter 29 rule)", "url": GN},
                {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
                {"label": "HTSUS 9903.05.93–9903.05.94, U.S. note 52(g)–(h)", "url": CH99},
            ],
        },
        {
            "id": "fta",
            "title": "Claim another free trade agreement or the dyes appendix (L)",
            "saves": "The base rate (up to 6.5%)",
            "appliesTo": f"Dutiable lines whose Special column lists the partner (Australia, Bahrain, Chile, Colombia, Israel, Jordan, Korea, Morocco, Oman, Panama, Peru, Singapore, CAFTA-DR, Japan on some lines); {cnt['Lc']} lines also carry \"L\" for intermediate chemicals for dyes",
            "document": "The origin certification or declaration the agreement requires; for L, the product's listing in the intermediate chemicals for dyes appendix.",
            "caveat": "These claims remove only the base rate: the 2026 Section 301 duties apply to FTA-eligible goods (note 52(a)) except USMCA goods, and Section 232 applies on top. GSP (A, A+, A*) lapsed at the end of 2020.",
            "citations": [
                {"label": "HTSUS General Notes 3(c) and 14", "url": GN},
                {"label": "Intermediate chemicals for dyes appendix", "url": DYES},
            ],
        },
        {
            "id": "classification",
            "title": "Get the line right — many Chapter 29 lines sit next to a Free or differently-listed alternative",
            "saves": "Up to the full base rate, and decides the Section 301, China-list and Section 232 treatment",
            "appliesTo": "All lines; for example \"Drugs\" vs \"Other\" breakouts, the 2936–2941 headings (Free, Section 301-exempt) vs the functional headings above them, and bulk chemicals (Chapter 29) vs medicaments in dosage form (Chapter 30) or mixtures (Chapter 38)",
            "document": "The chemical name, CAS number, purity and intended use; Chapter 29 note 3 sends a compound that fits two headings to the one last in numerical order.",
            "caveat": "Classification follows what the product is; a misclassification is a penalty exposure, not a saving. Get a binding ruling when in doubt.",
            "citations": [
                {"label": "HTSUS Chapter 29 notes", "url": CH29},
                {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            ],
        },
        {
            "id": "first-sale",
            "title": "Value at the first sale for export when you buy through a trader",
            "saves": "Duty on the trader's markup — material when Section 301, China-list or Section 232 duties apply",
            "appliesTo": "Any line with an ad valorem duty",
            "document": "The manufacturer-to-trader invoice and proof it was a bona fide arm's-length sale of goods clearly destined for the United States.",
            "caveat": "Related-party prices must pass the arm's-length tests; declare that you are using the earlier sale.",
            "citations": [{"label": "19 CFR 152.103", "url": ecfr(19, "152.103")}],
        },
        {
            "id": "ftz",
            "title": "Hold or process chemicals in a foreign-trade zone",
            "saves": "Cash flow (duty paid only when goods leave the zone), no duty on goods re-exported or destroyed, and — for non-privileged goods — the finished product's rate",
            "appliesTo": "All lines",
            "document": "FTZ admission (CBP Form 214) and zone inventory records.",
            "caveat": "Section 232 pharmaceutical goods must be admitted in privileged foreign status, which fixes their classification and duty at admission; check the status rules of each Chapter 99 measure before relying on an inverted rate.",
            "citations": [
                {"label": "19 CFR 146.41", "url": ecfr(19, "146.41")},
                {"label": "Proclamation 11020, cl. (13)", "url": P11020},
            ],
        },
        {
            "id": "drawback",
            "title": "Recover duties on chemicals you re-export or use to make exports",
            "saves": "Up to 99% of duties paid — Proclamation 11020 expressly allows drawback of the Section 232 pharmaceutical duty",
            "appliesTo": "Any line where duty was paid",
            "document": "A drawback claim matching import entries to export records (manufacturing, unused-merchandise or rejected-merchandise drawback).",
            "caveat": "Antidumping and countervailing duties are not refunded as drawback. Claims must be filed within 5 years of import.",
            "citations": [
                {"label": "19 CFR 191.3", "url": ecfr(19, "191.3")},
                {"label": "19 CFR part 191", "url": ecfr_part(19, 191)},
                {"label": "Proclamation 11020, cl. (10)", "url": P11020},
            ],
        },
        {
            "id": "adcvd-scope",
            "title": "Check the AD/CVD scope and the exporter's rate before you buy",
            "saves": "The whole antidumping or countervailing duty when the product is outside the order, or the difference between the country-wide rate and a named exporter's rate",
            "appliesTo": "Products under an order: citric acid, gluconates, 2,4-D, glycine, L-lysine, MSG, HFC refrigerants, melamine, chlorinated isocyanurates, hexamine, corrosion inhibitors, HEDP, furfuryl alcohols, vanillin, erythritol, MDI, acetone, DOTP, TCPP, methionine, acrylate monomers and stilbenic brighteners",
            "document": "The order's written scope (it, not the HTS number, decides) and the exporter's current cash-deposit rate; request a scope ruling when unsure.",
            "caveat": "Merchandise inside the scope pays the cash deposit under any HTS line. Final duties are set later in administrative reviews and can be higher than the deposit.",
            "citations": [{"label": "19 CFR 351.225 (scope rulings)", "url": ecfr(19, "351.225")}],
        },
        {
            "id": "ruling",
            "title": "Get a binding ruling before you import",
            "saves": "Certainty: a ruling fixes the classification — and with it the K/L eligibility, the Section 301 and Section 232 treatment and the China list — before goods arrive",
            "appliesTo": "All lines, especially new APIs, salts and intermediates",
            "document": "A ruling request to CBP with the chemical name, CAS number, structure, process and use.",
            "caveat": "A ruling binds only for the exact product described.",
            "citations": [{"label": "19 CFR 177.1", "url": ecfr(19, "177.1")}],
        },
    ]

    rules = [
        {"id": "tsca", "agency": "EPA / CBP", "title": "TSCA import certification: positive (complies with TSCA) or negative (not subject — e.g. drugs, pesticides, food additives) filed before release",
         "citations": [{"label": "19 CFR 12.121", "url": ecfr(19, "12.121")}, {"label": "40 CFR 707.20", "url": ecfr(40, "707.20")},
                       {"label": "EPA: TSCA import requirements", "url": "https://www.epa.gov/tsca-import-export-requirements"}]},
        {"id": "hazmat", "agency": "U.S. DOT (PHMSA)", "title": "Flammable, toxic or corrosive chemicals listed in the Hazardous Materials Table: hazmat shipping papers, marking, labeling and packaging",
         "citations": [{"label": "49 CFR 172.101", "url": ecfr(49, "172.101")}]},
        {"id": "fda-api", "agency": "FDA", "title": "Drug ingredients (APIs): the foreign manufacturer must be registered and the drug listed with FDA; shipments that appear unapproved or adulterated can be refused",
         "citations": [{"label": "21 CFR 207.17", "url": ecfr(21, "207.17")}, {"label": "FDA: regulated products and import basics", "url": "https://www.fda.gov/industry/import-basics/regulated-products"}]},
        {"id": "dea-listed", "agency": "DEA", "title": "DEA List I and List II chemicals (e.g. ephedrine, pseudoephedrine, phenylacetic acid, safrole, piperonal, 4-AP, MAPA, APAA, glycidic acids; acetone, toluene, MEK as List II): import declaration on DEA Form 486 at least 15 days before release; List I importers must be DEA-registered",
         "citations": [{"label": "21 CFR 1310.02", "url": ecfr(21, "1310.02")}, {"label": "21 CFR 1313.12", "url": ecfr(21, "1313.12")}]},
        {"id": "dea-cs", "agency": "DEA", "title": "Controlled substances (opiates, fentanyl and its precursors ANPP and norfentanyl, cocaine, amphetamines, barbiturates, benzodiazepines): DEA registration and an import permit (Form 357) or declaration for each shipment",
         "citations": [{"label": "21 CFR 1312.11", "url": ecfr(21, "1312.11")}, {"label": "21 CFR 1312.12", "url": ecfr(21, "1312.12")}, {"label": "21 CFR 1308.12", "url": ecfr(21, "1308.12")}]},
        {"id": "epa-hfc", "agency": "EPA", "title": "HFC refrigerants (HFC-23, -32, -125, -134a, -143a, -152a, -227ea, -245fa and others): importer must expend consumption or application-specific allowances at arrival (AIM Act)",
         "citations": [{"label": "40 CFR 84.5", "url": ecfr(40, "84.5")}, {"label": "EPA: HFC allowances", "url": "https://www.epa.gov/climate-hfcs-reduction/hfc-allowances"}]},
        {"id": "epa-ods", "agency": "EPA", "title": "Ozone-depleting substances (CFCs, HCFCs, halons, carbon tetrachloride, methyl chloroform, methyl bromide): import only against allowances or listed exemptions",
         "citations": [{"label": "40 CFR 82.4", "url": ecfr(40, "82.4")}, {"label": "EPA: ozone-depleting substances phaseout", "url": "https://www.epa.gov/ods-phaseout"}]},
        {"id": "irs-superfund", "agency": "IRS", "title": "Superfund chemical excise tax, reinstated July 1, 2022: $9.74 a ton on imported benzene, toluene, xylene, ethylene, propylene, butylene, butadiene, butane and acetylene; per-ton rates on listed imported substances such as acetone ($20.06), phenol ($12.47), styrene ($9.93) and MIBK ($23.65) — paid on Form 720 / 6627, not to CBP",
         "citations": [{"label": "IRS Form 6627", "url": "https://www.irs.gov/forms-pubs/about-form-6627"}, {"label": "Instructions for Form 6627 (table of taxable imported substances)", "url": "https://www.irs.gov/instructions/i6627"}]},
        {"id": "irs-odc", "agency": "IRS", "title": "Ozone-depleting-chemical tax for 2026: e.g. CFC-11 $19.30 a pound, carbon tetrachloride $21.225, methyl chloroform $1.925 — paid by the importer on Form 6627",
         "citations": [{"label": "Instructions for Form 6627, Part IV", "url": "https://www.irs.gov/instructions/i6627"}]},
        {"id": "cwc", "agency": "Commerce (BIS)", "title": "Chemical Weapons Convention scheduled chemicals (e.g. thiodiglycol, methylphosphonates, dialkylaminoethyl chlorides, phosphite esters): BIS declarations; Schedule 1 imports need advance notification and an ATF import license",
         "citations": [{"label": "15 CFR 712.6", "url": ecfr(15, "712.6")}, {"label": "15 CFR 713.2", "url": ecfr(15, "713.2")}, {"label": "BIS: Chemical Weapons Convention", "url": "https://www.bis.gov/regulations/cwc"}]},
        {"id": "pesticide", "agency": "EPA / CBP", "title": "Pesticide active ingredients: EPA Notice of Arrival of Pesticides and Devices before arrival; the pesticide must be registered or exempt under FIFRA",
         "citations": [{"label": "19 CFR 12.112", "url": ecfr(19, "12.112")}]},
    ]
    for rid, title, countries, subs, cites in ADCVD:
        rules.append({"id": rid, "agency": "Commerce (ITA) / CBP", "title": f"{title} — {countries}: AD/CVD cash deposits at the exporter's rate (not in the tariff calculator)",
                      "citations": [{"label": lab, "url": url} for lab, url in cites]})
    for rid, title, subs, cites in PENDING:
        rules.append({"id": rid, "agency": "Commerce (ITA) / USITC", "title": f"{title}: preliminary cash deposits may already apply; final orders pending",
                      "citations": [{"label": lab, "url": url} for lab, url in cites]})
    rules.append({"id": "s232-pharma", "agency": "Commerce (BIS) / CBP", "title": "Section 232 drug-ingredient line: declare the product type (patented, generic, specialty or not a pharmaceutical article) and the 9903.04.60–9903.04.70 heading on every entry",
                  "citations": [{"label": "HTSUS U.S. note 40 to Chapter 99", "url": CH99}, {"label": "CBP CSMS # 70054007", "url": "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42cf077"}]})
    te["rules"] = rules

    # ---------------------------------------------------------------- per-line mapping
    def under(prefixes):
        return L.under(*prefixes)

    drug_words = ("drug", "antibiotic", "antidepressant", "antihistamine", "analgesic", "anticonvulsant", "cardiovascular", "hormone", "vitamin", "medicinal", "sulfonamide")
    fda = set(L.K) | set(L.p40) | under(["2936", "2937", "2939", "2941"])
    for l in L.lines:
        txt = l["searchText"]
        if any(w in txt for w in drug_words):
            fda.add(l["htsCode10"])
    pest = {l["htsCode10"] for l in L.lines if any(w in l["searchText"] for w in ("pesticide", "insecticide", "herbicide", "fungicide"))}
    rule_sets = {
        "dea-listed": under(DEA_LISTED),
        "dea-cs": under(DEA_CS),
        "epa-hfc": under(HFC),
        "epa-ods": under(ODS),
        "irs-superfund": under(SUPERFUND),
        "irs-odc": under(["2903.14", "2903.19.60.10", "2903.71", "2903.72", "2903.73", "2903.74", "2903.75", "2903.76", "2903.77", "2903.78", "2903.79"]),
        "cwc": under(CWC),
        "pesticide": pest,
        "fda-api": fda,
        "s232-pharma": set(L.p40),
    }
    for rid, title, countries, subs, cites in ADCVD:
        rule_sets[rid] = under(subs)
    for rid, title, subs, cites in PENDING:
        rule_sets[rid] = under(subs)
    for k, v in rule_sets.items():
        assert v, f"rule {k} maps to no line"

    lever_sets = {
        "k-appendix": set(L.K),
        "s301-pharma-use": set(L.e52),
        "s232-type": set(L.p40),
        "fta": {l["htsCode10"] for l in L.lines if l["dutiable"] and l["effectiveSpecial"] and "Free" in l["effectiveSpecial"]},
        "adcvd-scope": set().union(*(rule_sets[r[0]] for r in ADCVD)),
    }
    all_levers_tail = ["origin-reaction", "usmca", "classification", "first-sale", "ftz", "drawback", "ruling"]
    rule_order = ["s232-pharma", "fda-api", "dea-listed", "dea-cs", "epa-hfc", "epa-ods", "cwc", "pesticide"] + [r[0] for r in ADCVD] + [r[0] for r in PENDING] + ["irs-superfund", "irs-odc", "tsca", "hazmat"]
    by10 = {}
    for l in L.lines:
        c = l["htsCode10"]
        rids = [r for r in rule_order if r in ("tsca", "hazmat") or c in rule_sets.get(r, set())]
        lids = [k for k in ["k-appendix", "s301-pharma-use", "s232-type", "fta", "adcvd-scope"] if c in lever_sets[k]] + all_levers_tail
        by10[c] = (rids, lids)
    for tl in te["lines"]:
        c = tl["hts"].replace(".", "")
        tl["ruleIds"], tl["leverIds"] = by10[c]

    # ---------------------------------------------------------------- group notes
    from fill29_groups import GROUPS
    rule_names = {
        "s232-pharma": "Section 232 drug-ingredient declaration", "fda-api": "FDA drug registration", "dea-listed": "DEA listed-chemical declaration",
        "dea-cs": "DEA controlled-substance permit", "epa-hfc": "EPA HFC allowances", "epa-ods": "EPA ozone rules", "cwc": "Chemical Weapons Convention declarations",
        "pesticide": "EPA pesticide notice of arrival", "irs-superfund": "Superfund chemical tax", "irs-odc": "ODC tax",
    }
    for g in te["groups"]:
        h = g["heading"]
        hl = {l["htsCode10"] for l in L.heading(h)}
        rids = ["tsca", "hazmat"]
        for r in rule_order:
            if r in ("tsca", "hazmat"):
                continue
            if hl & rule_sets.get(r, set()):
                rids.append(r)
        g["label"] = GROUPS[h][0]
        g["ruleIds"] = rids
        parts = []
        named = [rule_names[r] for r in rids if r in rule_names]
        ad = [r for r in rids if r.startswith("adcvd-")]
        if named:
            parts.append("Besides TSCA and hazmat rules, some lines need: " + ", ".join(named) + ".")
        else:
            parts.append("TSCA certification and, where the chemical is a hazardous material, DOT shipping rules.")
        names = [next(r[1] for r in ADCVD if r[0] == a) for a in ad if a != "adcvd-pending"]
        if names:
            parts.append("AD/CVD orders reach lines here: " + "; ".join(names) + ".")
        if "adcvd-pending" in ad:
            parts.append("Some lines are under a pending AD/CVD investigation.")
        if GROUPS[h][3]:
            parts.append(GROUPS[h][3])
        g["note"] = " ".join(parts)

    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations — not legal advice. AD/CVD rates are exporter-specific and change with each "
        "administrative review; DEA, EPA and FDA requirements depend on the exact chemical. Check the current order, regulation and CBP guidance before importing."
    )
