# Static (non-trade) sources and constants for Chapter 27. Imported by fill27.py.
FR = "https://www.federalregister.gov/documents/"
HTS_NOW = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH27 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2027"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
ECFR = "https://www.ecfr.gov/current/"
IRS_I6627 = "https://www.irs.gov/pub/irs-pdf/i6627.pdf"
IRS_I720 = "https://www.irs.gov/instructions/i720"
USC4611 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleD-chap38-dup1-subchapA-sec4611.htm"
USC4081 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleD-chap32-subchapA-partIII-subpartA-sec4081.htm"
# irs.gov is not (yet) in the validator's OFFICIAL_SOURCE_DOMAINS. Set True once it is, to cite the IRS 2026 rate.
USE_IRS = True
SF2026 = " ($0.18 per barrel for 2026)" if USE_IRS else ""


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


EXTRA_SOURCES = [
    # ---- 2025 IEEPA history
    src("eo-14156", "Federal Register", "90 FR 8433", "Executive Order 14156", "Declaring a National Energy Emergency", "2025-01-20", "2025-01-29",
        FR + "2025/01/29/2025-02003/declaring-a-national-energy-emergency"),
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07",
        FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07",
        FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14195", "Federal Register", "90 FR 9121", "Executive Order 14195", "Imposing Duties To Address the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-02-01", "2025-02-07",
        FR + "2025/02/07/2025-02408/imposing-duties-to-address-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("eo-14228", "Federal Register", "90 FR 11463", "Executive Order 14228", "Further Amendment to Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-03-03", "2025-03-07",
        FR + "2025/03/07/2025-03775/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of"),
    src("eo-14231", "Federal Register", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-03-06", "2025-03-11",
        FR + "2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14232", "Federal Register", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border", "2025-03-06", "2025-03-11",
        FR + "2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    src("eo-14245", "Federal Register", "90 FR 13829", "Executive Order 14245", "Imposing Tariffs on Countries Importing Venezuelan Oil", "2025-03-24", "2025-03-27",
        FR + "2025/03/27/2025-05440/imposing-tariffs-on-countries-importing-venezuelan-oil"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257", "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits", "2025-04-02", "2025-04-07",
        FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14323", "Federal Register", "90 FR 37739", "Executive Order 14323", "Addressing Threats to the United States by the Government of Brazil", "2025-07-30", "2025-08-05",
        FR + "2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-07-31", "2025-08-06",
        FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14329", "Federal Register", "90 FR 38701", "Executive Order 14329", "Addressing Threats to the United States by the Government of the Russian Federation", "2025-08-06", "2025-08-11",
        FR + "2025/08/11/2025-15267/addressing-threats-to-the-united-states-by-the-government-of-the-russian-federation"),
    src("eo-14357", "Federal Register", "90 FR 50725", "Executive Order 14357", "Modifying Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-11-04", "2025-11-07",
        FR + "2025/11/07/2025-19825/modifying-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("eo-14384", "Federal Register", "91 FR 6501", "Executive Order 14384", "Modifying Duties To Address Threats to the United States by the Government of the Russian Federation", "2026-02-06", "2026-02-11",
        FR + "2026/02/11/2026-02818/modifying-duties-to-address-threats-to-the-united-states-by-the-government-of-the-russian-federation"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25",
        FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22",
        "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20",
        "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012", "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25",
        FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None, "2026-07-01",
        "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    src("eo-14380", "Federal Register", "91 FR 5085", "Executive Order 14380", "Addressing Threats to the United States by the Government of Cuba", "2026-01-29", "2026-02-03",
        FR + "2026/02/03/2026-02250/addressing-threats-to-the-united-states-by-the-government-of-cuba"),
    src("eo-14382", "Federal Register", "91 FR 6493", "Executive Order 14382", "Addressing Threats to the United States by the Government of Iran", "2026-02-06", "2026-02-11",
        FR + "2026/02/11/2026-02813/addressing-threats-to-the-united-states-by-the-government-of-iran"),
    # ---- Russia
    src("eo-14066", "Federal Register", "87 FR 13625", "Executive Order 14066", "Prohibiting Certain Imports and New Investments With Respect to Continued Russian Federation Efforts To Undermine the Sovereignty and Territorial Integrity of Ukraine", "2022-03-08", "2022-03-10",
        FR + "2022/03/10/2022-05232/prohibiting-certain-imports-and-new-investments-with-respect-to-continued-russian-federation-efforts"),
    src("pl-117-110", "U.S. Congress (GovInfo)", "Pub. L. 117-110", "Public Law 117-110", "Suspending Normal Trade Relations with Russia and Belarus Act", "2022-04-08", "2022-04-08",
        "https://www.govinfo.gov/content/pkg/PLAW-117publ110/pdf/PLAW-117publ110.pdf"),
    src("ru-emergency-2026", "Federal Register", "91 FR 15515", "Notice of March 24, 2026", "Continuation of the National Emergency With Respect to Specified Harmful Foreign Activities of the Government of the Russian Federation", "2026-03-24", "2026-03-27",
        FR + "2026/03/27/2026-06078/continuation-of-the-national-emergency-with-respect-to-specified-harmful-foreign-activities-of-the"),
    src("ofac-faq-1014", "U.S. Treasury (OFAC)", "OFAC FAQ 1014", "Frequently asked question", "Are all energy imports from Russia now prohibited by Executive Order 14066?", None, "2022-03-08",
        "https://ofac.treasury.gov/faqs/1014"),
    # ---- Venezuela
    src("eo-14373", "Federal Register", "91 FR 2045", "Executive Order 14373", "Safeguarding Venezuelan Oil Revenue for the Good of the American and Venezuelan People", "2026-01-09", "2026-01-15",
        FR + "2026/01/15/2026-00831/safeguarding-venezuelan-oil-revenue-for-the-good-of-the-american-and-venezuelan-people"),
    src("ofac-gl46", "Federal Register", "91 FR 24719", "OFAC rule (publication of general licenses)", "Publication of Venezuela Sanctions Regulations Web General Licenses 46, 46A, and 46B", None, "2026-05-07",
        FR + "2026/05/07/2026-09092/publication-of-venezuela-sanctions-regulations-web-general-licenses-46-46a-and-46b"),
    src("ofac-gl46e", "U.S. Treasury (OFAC)", "Venezuela General License 46E", "General license (31 CFR part 591)", "Authorizing Certain Activities Involving Venezuelan-Origin Oil or Petrochemical Products", None, "2026-09-28",
        "https://ofac.treasury.gov/media/936996/download?inline"),
    src("ofac-gl51d", "U.S. Treasury (OFAC)", "Venezuela General License 51D", "General license (31 CFR part 591)", "Authorizing Certain Activities Involving Venezuelan-Origin Coal or Minerals, Including Gold", None, "2026-09-02",
        "https://ofac.treasury.gov/media/936856/download?inline"),
    # ---- Iran
    src("ofac-gl-u", "Federal Register", "91 FR 35141", "OFAC rule (publication of general licenses)", "Publication of Iran-Related Web General Licenses U and V", None, "2026-06-10",
        FR + "2026/06/10/2026-11614/publication-of-iran-related-web-general-licenses-u-and-v"),
    src("ofac-gl-x", "Federal Register", "91 FR 61758", "OFAC rule (publication of general licenses)", "Publication of Iran-Related Web General Licenses X and X1", None, "2026-09-30",
        FR + "2026/09/30/2026-20010/publication-of-iran-related-web-general-licenses-x-and-x1"),
    src("ecfr-560-201", "eCFR", "31 CFR 560.201", "Iranian Transactions and Sanctions Regulations", "Prohibited importation of goods or services from Iran", None, "2026-10-08",
        ECFR + "title-31/section-560.201"),
    # ---- Excise taxes (not tariffs)
    src("usc-4611", "U.S. Code (GovInfo)", "26 U.S.C. 4611", "Statute", "Imposition of tax (petroleum Superfund and Oil Spill Liability Trust Fund financing rates)", None, "2025-01-03", USC4611),
    src("usc-4081", "U.S. Code (GovInfo)", "26 U.S.C. 4081", "Statute", "Imposition of tax (gasoline, diesel fuel and kerosene)", None, "2025-01-03", USC4081),
    src("irs-i6627", "Internal Revenue Service", "Instructions for Form 6627 (Rev. January 2026)", "IRS instructions", "Environmental Taxes: petroleum Superfund tax $0.18 per barrel for 2026; oil spill liability tax expired after December 31, 2025", None, "2025-12-22",
        IRS_I6627),
    src("irs-i720", "Internal Revenue Service", "Instructions for Form 720 (06/2026)", "IRS instructions", "Quarterly Federal Excise Tax Return: fuel tax rates and the expiration of the oil spill liability taxes", None, "2026-07-07",
        IRS_I720),
]
if not USE_IRS:
    EXTRA_SOURCES = [x for x in EXTRA_SOURCES if not x["id"].startswith("irs-")]
EXCISE_SF_IDS = ["usc-4611"] + (["irs-i6627", "irs-i720"] if USE_IRS else [])
