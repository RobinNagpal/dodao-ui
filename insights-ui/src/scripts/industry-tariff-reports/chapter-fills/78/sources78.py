"""Official sources used by fill78.py (Chapter 78, Lead and Articles Thereof) that the generator does not emit.

Federal Register entries were checked against the FR API (citation, publication date, html_url) on 2026-10-13.
"""

CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH78 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2078"
CH85 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2085"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
FRD = "https://www.federalregister.gov/documents"


def src(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


NEW = [
    # ---------------------------------------------------------------- HTS
    src("hts-ch78", "HTSUS 2026 Revision 21, Chapter 78", "Harmonized Tariff Schedule",
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 78: Lead and Articles Thereof",
        None, "2026-10-07", CH78, publisher="USITC"),
    src("hts-gn", "HTSUS 2026 Revision 21, General Notes (note 16, AGOA)", "Harmonized Tariff Schedule",
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes: general note 16, AGOA beneficiary countries",
        None, "2026-10-07", GN, publisher="USITC"),
    src("ustr-agoa-2026", "USTR press release", "Statement",
        "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03",
        "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act",
        publisher="USTR"),
    src("ustr-usmca-review", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None,
        "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review",
        publisher="USTR"),
    # ---------------------------------------------------------------- Russia
    src("procl-10420", "87 FR 38875", "Proclamation 10420", "Increasing Duties on Certain Articles From the Russian Federation",
        "2022-06-27", "2022-06-30",
        f"{FRD}/2022/06/30/2022-14145/increasing-duties-on-certain-articles-from-the-russian-federation"),
    # ---------------------------------------------------------------- critical minerals
    src("eo-14272", "90 FR 16437", "Executive Order 14272",
        "Ensuring National Security and Economic Resilience Through Section 232 Actions on Processed Critical Minerals and Derivative Products",
        "2025-04-15", "2025-04-18",
        f"{FRD}/2025/04/18/2025-06836/ensuring-national-security-and-economic-resilience-through-section-232-actions-on-processed-critical"),
    src("procl-11001", "91 FR 2439", "Proclamation 11001",
        "Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States", "2026-01-14", "2026-01-20",
        f"{FRD}/2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united"),
    src("fr-2026-03868", "91 FR 9686", "Notice (USTR)",
        "Request for Comments on the Design of a Plurilateral Agreement on Trade in Critical Minerals and Policy Actions To Strengthen the Resilience of Critical Minerals Supply Chains",
        None, "2026-02-26",
        f"{FRD}/2026/02/26/2026-03868/request-for-comments-on-the-design-of-a-plurilateral-agreement-on-trade-in-critical-minerals-and"),
    src("fr-2025-19813", "90 FR 50494", "Notice (USGS)", "Final 2025 List of Critical Minerals", None, "2025-11-07",
        f"{FRD}/2025/11/07/2025-19813/final-2025-list-of-critical-minerals"),
    # ---------------------------------------------------------------- IEEPA / Section 122
    src("eo-14193", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
        "2025-02-01", "2025-02-07",
        f"{FRD}/2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14194", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01",
        "2025-02-07", f"{FRD}/2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14195", "90 FR 9121", "Executive Order 14195",
        "Imposing Duties To Address the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-02-01", "2025-02-07",
        f"{FRD}/2025/02/07/2025-02408/imposing-duties-to-address-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("eo-14228", "90 FR 11463", "Executive Order 14228",
        "Further Amendment to Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-03-03", "2025-03-07",
        f"{FRD}/2025/03/07/2025-03775/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of"),
    src("eo-14231", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
        "2025-03-06", "2025-03-11",
        f"{FRD}/2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14232", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border",
        "2025-03-06", "2025-03-11",
        f"{FRD}/2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    src("eo-14257", "90 FR 15041", "Executive Order 14257",
        "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
        "2025-04-02", "2025-04-07",
        f"{FRD}/2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14323", "90 FR 37739", "Executive Order 14323", "Addressing Threats to the United States by the Government of Brazil", "2025-07-30",
        "2025-08-05", f"{FRD}/2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"),
    src("eo-14325", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
        "2025-07-31", "2025-08-06",
        f"{FRD}/2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14326", "90 FR 37963", "Executive Order 14326", "Further Modifying the Reciprocal Tariff Rates", "2025-07-31", "2025-08-06",
        f"{FRD}/2025/08/06/2025-15010/further-modifying-the-reciprocal-tariff-rates"),
    src("eo-14357", "90 FR 50725", "Executive Order 14357",
        "Modifying Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-11-04", "2025-11-07",
        f"{FRD}/2025/11/07/2025-19825/modifying-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("scotus-24-1287", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20",
        "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf", publisher="Supreme Court of the United States"),
    src("eo-14389", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25",
        f"{FRD}/2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("csms-67834313", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None,
        "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9", publisher="U.S. Customs and Border Protection"),
    src("procl-11012", "91 FR 9339", "Proclamation 11012",
        "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25",
        f"{FRD}/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
]
NEW_BY_ID = {s["id"]: s for s in NEW}
