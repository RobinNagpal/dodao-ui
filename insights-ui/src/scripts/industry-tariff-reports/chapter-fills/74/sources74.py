"""Official sources used by the Chapter 74 fill script (fill74.py) that the generator does not emit.

Every Federal Register entry was checked against the FR API (citation, publication date, html_url) on 2026-10-13.
"""

CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH74 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2074"
CH99_B26 = "https://hts.usitc.gov/reststop/file?release=2026HTSBasic&filename=Chapter%2099"
FRD = "https://www.federalregister.gov/documents"


def fr(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


def ita(id_, citation, title, published, slug, publisher="Federal Register", document="Notice (Commerce, ITA)"):
    y, m, d = published.split("-")
    num = id_.replace("fr-", "")
    return fr(id_, citation, document, title, None, published, f"{FRD}/{y}/{m}/{d}/{num}/{slug}", publisher)


NEW = [
    # ---------------------------------------------------------------- HTS
    fr("hts-ch74", "HTSUS 2026 Revision 21, Chapter 74", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 74: Copper and Articles Thereof",
       None, "2026-10-07", CH74, publisher="USITC"),
    fr("hts-2026b-ch99", "HTSUS 2026 Basic Edition, Chapter 99 (U.S. note 36)", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Basic Edition), Chapter 99: U.S. note 36 and headings 9903.78.01–9903.78.02 (Section 232 copper)",
       None, "2025-12-17", CH99_B26, publisher="USITC"),
    fr("hts-gn", "HTSUS 2026 Revision 21, General Notes (note 16, AGOA)", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes: general note 16, AGOA beneficiary countries",
       None, "2026-10-07", "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes", publisher="USITC"),
    fr("ustr-agoa-2026", "USTR press release", "Statement",
       "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03",
       "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act",
       publisher="USTR"),
    fr("procl-10128", "85 FR 85491", "Proclamation 10128", "To Take Certain Actions Under the African Growth and Opportunity Act and for Other Purposes",
       "2020-12-22", "2020-12-29",
       f"{FRD}/2020/12/29/2020-28878/to-take-certain-actions-under-the-african-growth-and-opportunity-act-and-for-other-purposes"),
    # ---------------------------------------------------------------- Section 232 copper
    fr("eo-14220", "90 FR 11001", "Executive Order 14220", "Addressing the Threat to National Security From Imports of Copper",
       "2025-02-25", "2025-02-28",
       f"{FRD}/2025/02/28/2025-03439/addressing-the-threat-to-national-security-from-imports-of-copper"),
    fr("fr-2025-04061", "90 FR 11940", "Notice (BIS)",
       "Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Copper", None, "2025-03-13",
       f"{FRD}/2025/03/13/2025-04061/notice-of-request-for-public-comments-on-section-232-national-security-investigation-of-imports-of"),
    fr("procl-10962", "90 FR 37727", "Proclamation 10962", "Adjusting Imports of Copper Into the United States", "2025-07-30", "2025-08-05",
       f"{FRD}/2025/08/05/2025-14893/adjusting-imports-of-copper-into-the-united-states"),
    fr("csms-65794272", "CSMS # 65794272", "CBP CSMS message",
       "GUIDANCE: Section 232 Import Duties on Copper and Copper Derivative Products", None, "2025-07-31",
       "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3ebf0e0", publisher="U.S. Customs and Border Protection"),
    fr("csms-68253075", "CSMS # 68253075", "CBP CSMS message", "GUIDANCE: Section 232 Duties on Imports of Aluminum, Steel, and Copper",
       None, "2026-04-03", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4117593", publisher="U.S. Customs and Border Protection"),
    fr("fr-2026-15961", "91 FR 50756", "Notice (BIS)",
       "Request for Public Comments on the Proposed Implementation of Duties on Additional Aluminum, Steel, and Copper Derivative Articles Under Section 232",
       None, "2026-08-06",
       f"{FRD}/2026/08/06/2026-15961/request-for-public-comments-on-the-proposed-implementation-of-duties-on-additional-aluminum-steel"),
    # ---------------------------------------------------------------- AD/CVD (Commerce ITA unless noted)
    ita("fr-2021-17375", "86 FR 44691", "Seamless Refined Copper Pipe and Tube From the Socialist Republic of Vietnam: Antidumping Duty Order",
        "2021-08-13", "seamless-refined-copper-pipe-and-tube-from-the-socialist-republic-of-vietnam-antidumping-duty-order"),
    ita("fr-2022-11003", "87 FR 31209",
        "Seamless Refined Copper Pipe and Tube From the People's Republic of China and Mexico: Continuation of Antidumping Duty Orders",
        "2022-05-23", "seamless-refined-copper-pipe-and-tube-from-the-peoples-republic-of-china-and-mexico-continuation-of"),
    ita("fr-2022-23742", "87 FR 65747", "Phosphor Copper From the Republic of Korea: Continuation of Antidumping Duty Order", "2022-11-01",
        "phosphor-copper-from-the-republic-of-korea-continuation-of-antidumping-duty-order"),
    ita("fr-2023-06922", "88 FR 19924", "Brass Sheet and Strip From France, Germany, Italy, and Japan: Continuation of Antidumping Duty Orders",
        "2023-04-04", "brass-sheet-and-strip-from-france-germany-italy-and-japan-continuation-of-antidumping-duty-orders"),
    ita("fr-2024-03073", "89 FR 10032", "Brass Rod From India: Countervailing Duty Order", "2024-02-13",
        "brass-rod-from-india-countervailing-duty-order"),
    ita("fr-2024-13041", "89 FR 50263",
        "Brass Rod From the Republic of Korea: Amended Final Antidumping Duty Determination; Brass Rod From Brazil, India, Mexico, the Republic of Korea, and South Africa: Antidumping Duty Orders; Brass Rod From the Republic of Korea: Countervailing Duty Order",
        "2024-06-13", "brass-rod-from-the-republic-of-korea-amended-final-antidumping-duty-determination-brass-rod-from"),
    ita("fr-2024-22206", "89 FR 79243", "Brass Rod From Israel: Antidumping Duty and Countervailing Duty Orders", "2024-09-27",
        "brass-rod-from-israel-antidumping-duty-and-countervailing-duty-orders"),
    ita("fr-2026-13376", "91 FR 40515", "Initiation of Five-Year (Sunset) Reviews", "2026-07-02", "initiation-of-five-year-sunset-reviews"),
    ita("fr-2026-13415", "91 FR 40575", "Seamless Refined Copper Pipe and Tube From Vietnam; Institution of a Five-Year Review", "2026-07-02",
        "seamless-refined-copper-pipe-and-tube-from-vietnam-institution-of-a-five-year-review", document="Notice (USITC)"),
    ita("fr-2026-14428", "91 FR 44872", "Brass Rod From Israel (notice of remand proceedings)", "2026-07-17", "brass-rod-from-israel",
        document="Notice (USITC)"),
    ita("fr-2026-18085", "91 FR 56625",
        "Brass Rod From South Africa: Preliminary Results of Antidumping Duty Administrative Review; 2023-2025", "2026-09-03",
        "brass-rod-from-south-africa-preliminary-results-of-antidumping-duty-administrative-review-2023-2025"),
    ita("fr-2026-18248", "91 FR 57134", "Brass Rod From Brazil: Preliminary Results of Antidumping Duty Administrative Review; 2023-2025",
        "2026-09-08", "brass-rod-from-brazil-preliminary-results-of-antidumping-duty-administrative-review-2023-2025"),
    ita("fr-2026-18491", "91 FR 57540",
        "Brass Rod From the Republic of Korea: Preliminary Results of Countervailing Duty Administrative Review; 2023-2024", "2026-09-10",
        "brass-rod-from-the-republic-of-korea-preliminary-results-of-countervailing-duty-administrative"),
    ita("fr-2026-18694", "91 FR 58077",
        "Brass Rod From the Republic of Korea: Preliminary Results of Antidumping Duty Administrative Review; 2023-2025", "2026-09-14",
        "brass-rod-from-the-republic-of-korea-preliminary-results-of-antidumping-duty-administrative-review"),
    ita("fr-2026-19273", "91 FR 59763",
        "Seamless Refined Copper Pipe and Tube From Mexico: Preliminary Results and Rescission, in Part, of Antidumping Duty Administrative Review; 2024-2025",
        "2026-09-21", "seamless-refined-copper-pipe-and-tube-from-mexico-preliminary-results-and-rescission-in-part-of"),
    # ---------------------------------------------------------------- IEEPA / Section 122 / Canada (same documents as Chapter 72)
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
    fr("csms-69851916", "CSMS # 69851916", "CBP CSMS message",
       "Modifying Section 338 additional duties on certain goods of Canada, from September 15, 2026", None, "2026-09-11",
       "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/429db0c", publisher="CBP"),
]
NEW_BY_ID = {s["id"]: s for s in NEW}
