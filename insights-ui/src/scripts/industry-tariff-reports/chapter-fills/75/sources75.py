"""Official sources used by the Chapter 75 fill script (fill75.py) that the generator does not emit.

Every Federal Register entry was checked against the FR API (citation, publication date, html_url) on 2026-10-13.
"""

CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH75 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2075"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
FRD = "https://www.federalregister.gov/documents"


def fr(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


NEW = [
    # ---------------------------------------------------------------- HTS
    fr("hts-ch75", "HTSUS 2026 Revision 21, Chapter 75", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 75: Nickel and Articles Thereof",
       None, "2026-10-07", CH75, publisher="USITC"),
    fr("hts-gn", "HTSUS 2026 Revision 21, General Notes (note 16, AGOA)", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes: general note 16, AGOA beneficiary countries",
       None, "2026-10-07", GN, publisher="USITC"),
    fr("ustr-agoa-2026", "USTR press release", "Statement",
       "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03",
       "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act",
       publisher="USTR"),
    # ---------------------------------------------------------------- Section 232: processed critical minerals (no tariff)
    fr("eo-14272", "90 FR 16437", "Executive Order 14272",
       "Ensuring National Security and Economic Resilience Through Section 232 Actions on Processed Critical Minerals and Derivative Products",
       "2025-04-15", "2025-04-18",
       f"{FRD}/2025/04/18/2025-06836/ensuring-national-security-and-economic-resilience-through-section-232-actions-on-processed-critical"),
    fr("fr-2025-07273", "90 FR 17372", "Notice (BIS)",
       "Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Processed Critical Minerals and Derivative Products",
       None, "2025-04-25",
       f"{FRD}/2025/04/25/2025-07273/notice-of-request-for-public-comments-on-section-232-national-security-investigation-of-imports-of"),
    fr("procl-11001", "91 FR 2439", "Proclamation 11001",
       "Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States", "2026-01-14", "2026-01-20",
       f"{FRD}/2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united"),
    fr("fr-2026-03868", "91 FR 9686", "Notice (USTR)",
       "Request for Comments on the Design of a Plurilateral Agreement on Trade in Critical Minerals and Policy Actions To Strengthen the Resilience of Critical Minerals Supply Chains",
       None, "2026-02-26",
       f"{FRD}/2026/02/26/2026-03868/request-for-comments-on-the-design-of-a-plurilateral-agreement-on-trade-in-critical-minerals-and"),
    # ---------------------------------------------------------------- Russia: OFAC import prohibition
    fr("ofac-2024-12372", "89 FR 48324", "Rule (Treasury, OFAC)",
       "Publication of Russian Harmful Foreign Activities Sanctions Regulations Determinations (import prohibition on aluminum, copper and nickel of Russian Federation origin, April 12, 2024)",
       None, "2024-06-06",
       f"{FRD}/2024/06/06/2024-12372/publication-of-russian-harmful-foreign-activities-sanctions-regulations-determinations"),
    # ---------------------------------------------------------------- AD/CVD (the nearest nickel order is Chapter 72)
    fr("fr-2026-15877", "91 FR 50517", "Notice (Commerce, ITA)",
       "Diffusion-Annealed, Nickel-Plated Flat-Rolled Steel Products From Japan: Preliminary Results and Rescission, in Part, of Antidumping Duty Administrative Review; 2024-2025",
       None, "2026-08-05",
       f"{FRD}/2026/08/05/2026-15877/diffusion-annealed-nickel-plated-flat-rolled-steel-products-from-japan-preliminary-results-and"),
    # ---------------------------------------------------------------- IEEPA / Section 122 (same documents as Chapters 28, 72, 74)
    fr("eo-14193", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
       "2025-02-01", "2025-02-07",
       f"{FRD}/2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    fr("eo-14194", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01",
       "2025-02-07", f"{FRD}/2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    fr("eo-14195", "90 FR 9121", "Executive Order 14195",
       "Imposing Duties To Address the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-02-01", "2025-02-07",
       f"{FRD}/2025/02/07/2025-02408/imposing-duties-to-address-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    fr("eo-14228", "90 FR 11463", "Executive Order 14228",
       "Further Amendment to Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-03-03", "2025-03-07",
       f"{FRD}/2025/03/07/2025-03775/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of"),
    fr("eo-14231", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
       "2025-03-06", "2025-03-11",
       f"{FRD}/2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    fr("eo-14232", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border",
       "2025-03-06", "2025-03-11",
       f"{FRD}/2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    fr("eo-14257", "90 FR 15041", "Executive Order 14257",
       "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
       "2025-04-02", "2025-04-07",
       f"{FRD}/2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    fr("eo-14325", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border",
       "2025-07-31", "2025-08-06",
       f"{FRD}/2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    fr("eo-14357", "90 FR 50725", "Executive Order 14357",
       "Modifying Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-11-04", "2025-11-07",
       f"{FRD}/2025/11/07/2025-19825/modifying-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    fr("scotus-24-1287", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20",
       "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf", publisher="Supreme Court of the United States"),
    fr("eo-14389", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25",
       f"{FRD}/2026/02/25/2026-03832/ending-certain-tariff-actions"),
    fr("csms-67834313", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None,
       "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9", publisher="U.S. Customs and Border Protection"),
    fr("procl-11012", "91 FR 9339", "Proclamation 11012",
       "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25",
       f"{FRD}/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    # ---------------------------------------------------------------- Canada Section 338 (same documents as Chapter 74)
    fr("procl-11048", "91 FR 46663", "Proclamation 11048",
       "Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Motor Vehicles",
       "2026-07-20", "2026-07-23",
       f"{FRD}/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united"),
    fr("procl-11065", "91 FR 58339", "Proclamation 11065",
       "Modifying the Scope of Products of Canada Subject to the Additional Duties Imposed To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Motor Vehicles",
       "2026-09-08", "2026-09-14",
       f"{FRD}/2026/09/14/2026-18839/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset"),
    fr("csms-69606660", "CSMS # 69606660", "CBP CSMS message",
       "GUIDANCE: Section 338 additional duties on certain goods of Canada, from August 22, 2026", None, "2026-08-21",
       "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04", publisher="CBP"),
]
NEW_BY_ID = {s["id"]: s for s in NEW}
