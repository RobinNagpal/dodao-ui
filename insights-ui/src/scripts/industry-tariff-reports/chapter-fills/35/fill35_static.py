"""Static sources and constants for the Chapter 35 fill script (fill35.py)."""

FR = "https://www.federalregister.gov/documents/"
HTS_NOW = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH35 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2035"
GN = "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes"
ECFR = "https://www.ecfr.gov/current/"
RULING = "https://rulings.cbp.gov/ruling/"
ECFR_AS_OF = "2026-10-08"
AS_OF = "2026-10-12"
SUGGEST_DATE = "October 12, 2026"


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


EXTRA_SOURCES = [
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14195", "Federal Register", "90 FR 9121", "Executive Order 14195", "Imposing Duties To Address the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02408/imposing-duties-to-address-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("eo-14231", "Federal Register", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14232", "Federal Register", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257", "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits", "2025-04-02", "2025-04-07", FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-07-31", "2025-08-06", FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012", "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("procl-11021", "Federal Register", "91 FR 18201", "Proclamation 11021", "Strengthening Actions Taken To Adjust Imports of Aluminum, Steel, and Copper Into the United States", "2026-04-02", "2026-04-09", FR + "2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states"),
    src("procl-11062", "Federal Register", "91 FR 58319", "Proclamation 11062", "Excluding Certain Canadian Products From Importation Into the United States in Response to Continued Discrimination Against the Commerce of the United States With Respect to Dairy", "2026-09-08", "2026-09-14", FR + "2026/09/14/2026-18836/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None, "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    src("ustr-agoa-2026", "USTR", "USTR press release", "Statement", "Statement from Ambassador Jamieson Greer on Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"),
    src("cbp-gsp", "CBP", "CBP web page (modified August 6, 2026)", "Web page", "Generalized System of Preferences (GSP)", None, "2026-08-06", "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"),
    # AD/CVD
    src("fr-2024-19071", "Federal Register", "89 FR 68390", "Notice (Commerce)", "Certain Pea Protein From the People's Republic of China: Antidumping and Countervailing Duty Orders", None, "2024-08-26", FR + "2024/08/26/2024-19071/certain-pea-protein-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty-orders"),
    src("fr-2026-06857", "Federal Register", "91 FR 17940", "Notice (Commerce)", "Rescission of Antidumping and Countervailing Duty Administrative Reviews", None, "2026-04-09", FR + "2026/04/09/2026-06857/rescission-of-antidumping-and-countervailing-duty-administrative-reviews"),
    src("fr-2026-20160", "Federal Register", "91 FR 62477", "Notice (Commerce)", "Initiation of Antidumping and Countervailing Duty Administrative Reviews", None, "2026-10-01", FR + "2026/10/01/2026-20160/initiation-of-antidumping-and-countervailing-duty-administrative-reviews"),
    src("fr-2026-03484", "Federal Register", "91 FR 8433", "Notice (Commerce)", "Hard Empty Capsules From Brazil, the People's Republic of China, India, and the Socialist Republic of Vietnam: Antidumping Duty Orders", None, "2026-02-23", FR + "2026/02/23/2026-03484/hard-empty-capsules-from-brazil-the-peoples-republic-of-china-india-and-the-socialist-republic-of"),
    src("fr-2026-03485", "Federal Register", "91 FR 8415", "Notice (Commerce)", "Hard Empty Capsules From Brazil, the People's Republic of China, India, and the Socialist Republic of Vietnam: Countervailing Duty Orders", None, "2026-02-23", FR + "2026/02/23/2026-03485/hard-empty-capsules-from-brazil-the-peoples-republic-of-china-india-and-the-socialist-republic-of"),
]

# Rules / levers citations
C = dict(
    ch99_51=("HTSUS Ch. 99, subch. III, U.S. note 51 (Section 338, Canada)", CH99),
    ch99_52=("HTSUS Ch. 99, subch. III, U.S. note 52", CH99),
    ch99_50=("HTSUS Ch. 99, subch. III, U.S. note 50", CH99),
    ch99_20=("HTSUS Ch. 99, subch. III, U.S. note 20 (China Section 301 lists)", CH99),
    ch35=("HTSUS Chapter 35 (notes and additional U.S. note 1)", CH35),
    gn=("HTSUS General Notes 3(c) and 8–34", GN),
)
