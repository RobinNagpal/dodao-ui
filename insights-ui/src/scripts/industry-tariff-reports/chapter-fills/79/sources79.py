"""Official sources used by the Chapter 79 fill script (fill79.py) that the generator does not emit.

Every Federal Register entry was checked against the FR API (citation, publication date, html_url) on 2026-10-13
(see frmeta.json). CBP rulings were read through the CROSS API on 2026-10-13.
"""

CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH79 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2079"
CH26 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2026"
CH28 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2028"
FRD = "https://www.federalregister.gov/documents"


def fr(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


def ruling(num, date, subject):
    return fr(f"cbp-{num.lower()}", f"CBP ruling {num}", "CBP ruling (New York)", subject, None, date,
              f"https://rulings.cbp.gov/ruling/{num}", publisher="U.S. Customs and Border Protection")


NEW = [
    # ---------------------------------------------------------------- HTS
    fr("hts-ch79", "HTSUS 2026 Revision 21, Chapter 79", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 79: Zinc and Articles Thereof",
       None, "2026-10-07", CH79, publisher="USITC"),
    fr("hts-ch26", "HTSUS 2026 Revision 21, Chapter 26", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 26: Ores, Slag and Ash (2608.00, 2620.11, 2620.19)",
       None, "2026-10-07", CH26, publisher="USITC"),
    fr("hts-ch28", "HTSUS 2026 Revision 21, Chapter 28", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 28: Inorganic Chemicals (2817.00, zinc oxide)",
       None, "2026-10-07", CH28, publisher="USITC"),
    # ---------------------------------------------------------------- CBP rulings
    ruling("N300700", "2018-10-10", "The tariff classification of zinc alloy sacrificial anodes from China (7907.00.6000; 9903.88.03)"),
    ruling("N271791", "2016-01-15", "The tariff classification of zinc ribbon anodes from China (8543.30.0000)"),
    ruling("N347980", "2025-04-25", "The tariff classification of spin cast zinc alloy keychains from Canada (7907.00.6000)"),
    # ---------------------------------------------------------------- Section 232 processed critical minerals
    fr("eo-14272", "90 FR 16437", "Executive Order 14272",
       "Ensuring National Security and Economic Resilience Through Section 232 Actions on Processed Critical Minerals and Derivative Products",
       "2025-04-15", "2025-04-18",
       f"{FRD}/2025/04/18/2025-06836/ensuring-national-security-and-economic-resilience-through-section-232-actions-on-processed-critical"),
    fr("fr-2025-07273", "90 FR 17372", "Notice (BIS)",
       "Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Processed Critical Minerals and Derivative Products",
       None, "2025-04-25",
       f"{FRD}/2025/04/25/2025-07273/notice-of-request-for-public-comments-on-section-232-national-security-investigation-of-imports-of"),
    fr("usgs-2025-list", "90 FR 50494", "Notice (USGS)", "Final 2025 List of Critical Minerals", None, "2025-11-07",
       f"{FRD}/2025/11/07/2025-19813/final-2025-list-of-critical-minerals"),
    fr("procl-11001", "91 FR 2439", "Proclamation 11001",
       "Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States", "2026-01-14", "2026-01-20",
       f"{FRD}/2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united"),
    fr("fr-2026-03868", "91 FR 9686", "Notice (USTR)",
       "Request for Comments on the Design of a Plurilateral Agreement on Trade in Critical Minerals and Policy Actions To Strengthen the Resilience of Critical Mineral Supply Chains",
       None, "2026-02-26",
       f"{FRD}/2026/02/26/2026-03868/request-for-comments-on-the-design-of-a-plurilateral-agreement-on-trade-in-critical-minerals-and"),
    # ---------------------------------------------------------------- China Section 301 review
    fr("fr-2026-08806", "91 FR 24636", "Notice (USTR)",
       "Initiation of Second Four-Year Review Process: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",
       None, "2026-05-06",
       f"{FRD}/2026/05/06/2026-08806/initiation-of-second-four-year-review-process-chinas-acts-policies-and-practices-related-to"),
    # ---------------------------------------------------------------- IEEPA / Section 122 / Canada Section 338
    fr("eo-14257", "90 FR 15041", "Executive Order 14257",
       "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
       "2025-04-02", "2025-04-07",
       f"{FRD}/2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    fr("eo-14389", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25",
       f"{FRD}/2026/02/25/2026-03832/ending-certain-tariff-actions"),
    fr("scotus-24-1287", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20",
       "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf", publisher="Supreme Court of the United States"),
    fr("csms-67834313", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None,
       "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9", publisher="U.S. Customs and Border Protection"),
    fr("procl-11012", "91 FR 9339", "Proclamation 11012",
       "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25",
       f"{FRD}/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    fr("eo-14193", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
       "2025-02-01", "2025-02-07",
       f"{FRD}/2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    fr("eo-14194", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01",
       "2025-02-07", f"{FRD}/2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    fr("eo-14231", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
       "2025-03-06", "2025-03-11",
       f"{FRD}/2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    fr("eo-14232", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border",
       "2025-03-06", "2025-03-11",
       f"{FRD}/2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    fr("procl-11046", "91 FR 46639", "Proclamation 11046",
       "Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Alcoholic Beverages",
       "2026-07-20", "2026-07-23",
       f"{FRD}/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united"),
    fr("procl-11047", "91 FR 46653", "Proclamation 11047",
       "Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Dairy",
       "2026-07-20", "2026-07-23",
       f"{FRD}/2026/07/23/2026-14992/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united"),
    fr("procl-11048", "91 FR 46663", "Proclamation 11048",
       "Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Motor Vehicles",
       "2026-07-20", "2026-07-23",
       f"{FRD}/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united"),
    fr("csms-69606660", "CSMS # 69606660", "CBP CSMS message",
       "GUIDANCE: Section 338 additional duties on certain goods of Canada, from August 22, 2026", None, "2026-08-21",
       "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04", publisher="U.S. Customs and Border Protection"),
]
NEW_BY_ID = {s["id"]: s for s in NEW}
