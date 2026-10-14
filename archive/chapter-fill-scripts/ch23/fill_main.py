"""Fill the non-trade writer parts of Chapter 23 (tariffUpdates texts, industryAreas labels, notes)."""
import json, sys

HTS23 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2023"
HTS98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"

EXTRA_SOURCES = [
    {"id": "hts-ch23", "publisher": "USITC", "citation": "HTSUS 2026 Revision 21, Chapter 23", "document": "Harmonized Tariff Schedule",
     "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 23: Residues and Waste from the Food Industries; Prepared Animal Feed",
     "signed": None, "published": "2026-10-07", "url": HTS23},
    {"id": "hts-ch98", "publisher": "USITC", "citation": "HTSUS 2026 Revision 21, Chapter 98", "document": "Harmonized Tariff Schedule",
     "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98", "signed": None, "published": "2026-10-07", "url": HTS98},
    {"id": "fr-2026-18924", "publisher": "Federal Register", "citation": "91 FR 58627", "document": "Notice (Commerce, ITA)",
     "title": "L-lysine From the People's Republic of China: Antidumping Duty Order and Countervailing Duty Order", "signed": None, "published": "2026-09-16",
     "url": "https://www.federalregister.gov/documents/2026/09/16/2026-18924/l-lysine-from-the-peoples-republic-of-china-antidumping-duty-order-and-countervailing-duty-order"},
    {"id": "fr-2025-18655", "publisher": "Federal Register", "citation": "90 FR 46045", "document": "Final rule (FDA)",
     "title": "Prior Notice: Adding Requirement To Submit Mail Tracking Number for Articles of Food Arriving by International Mail and Timeframe for Post-Refusal and Post-Hold Submissions",
     "signed": None, "published": "2025-09-25",
     "url": "https://www.federalregister.gov/documents/2025/09/25/2025-18655/prior-notice-adding-requirement-to-submit-mail-tracking-number-for-articles-of-food-arriving-by"},
    {"id": "fda-ia-71-04", "publisher": "FDA", "citation": "FDA Import Alert 71-04", "document": "Import alert",
     "title": "Detention Without Physical Examination of Food for Animals Due to the Presence of Salmonella", "signed": None, "published": "2026-08-31",
     "url": "https://www.accessdata.fda.gov/cms_ia/importalert_217.html"},
    {"id": "ustr-usmca-review", "publisher": "USTR", "citation": "USTR press release", "document": "Statement", "title": "Ambassador Greer Issues Statement on the USMCA Joint Review",
     "signed": None, "published": "2026-07-01",
     "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
    {"id": "procl-11012", "publisher": "Federal Register", "citation": "91 FR 9339", "document": "Proclamation 11012",
     "title": "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "signed": "2026-02-20", "published": "2026-02-25",
     "url": "https://www.federalregister.gov/documents/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"},
    {"id": "eo-14389", "publisher": "Federal Register", "citation": "91 FR 9437", "document": "Executive Order 14389", "title": "Ending Certain Tariff Actions",
     "signed": "2026-02-20", "published": "2026-02-25", "url": "https://www.federalregister.gov/documents/2026/02/25/2026-03832/ending-certain-tariff-actions"},
    {"id": "scotus-24-1287", "publisher": "Supreme Court of the United States", "citation": "607 U.S. 229", "document": "Opinion, No. 24-1287",
     "title": "Learning Resources, Inc. v. Trump", "signed": None, "published": "2026-02-20", "url": "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"},
    {"id": "csms-67834313", "publisher": "CBP", "citation": "CSMS # 67834313", "document": "CBP CSMS message",
     "title": "Ending Collection of International Emergency Economic Powers Act Duties", "signed": None, "published": "2026-02-22",
     "url": "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"},
    {"id": "eo-14325", "publisher": "Federal Register", "citation": "90 FR 37957", "document": "Executive Order 14325",
     "title": "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "signed": "2025-07-31", "published": "2025-08-06",
     "url": "https://www.federalregister.gov/documents/2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"},
    {"id": "eo-14257", "publisher": "Federal Register", "citation": "90 FR 15041", "document": "Executive Order 14257",
     "title": "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
     "signed": "2025-04-02", "published": "2025-04-07",
     "url": "https://www.federalregister.gov/documents/2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"},
    {"id": "eo-14193", "publisher": "Federal Register", "citation": "90 FR 9113", "document": "Executive Order 14193",
     "title": "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "signed": "2025-02-01", "published": "2025-02-07",
     "url": "https://www.federalregister.gov/documents/2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"},
    {"id": "eo-14194", "publisher": "Federal Register", "citation": "90 FR 9117", "document": "Executive Order 14194",
     "title": "Imposing Duties To Address the Situation at Our Southern Border", "signed": "2025-02-01", "published": "2025-02-07",
     "url": "https://www.federalregister.gov/documents/2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"},
]

ENDED = "The IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge expired July 23, 2026."

EXEMPTIONS = {
    "ca-section-301": "USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.93). No Chapter 23 line is on the general exemption list (U.S. note 52(b)). Milk-based feed over the quota (2309.90.28, 2309.90.48) is free under USMCA only within Canada's 696.9 t quota for 2026 (9823.05.02), shared with whole milk powder. The 35% IEEPA duty on non-USMCA Canadian goods ended February 24, 2026, and the 2026 Section 338 duties on Canadian dairy, alcoholic beverages and motor vehicles name no Chapter 23 line.",
    "mx-section-301": "USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.94); Mexican milk-based feed is free under USMCA without a quota (9823.05.01). No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The 25% IEEPA duty on non-USMCA Mexican goods ended February 24, 2026.",
    "cn-section-301": "No exclusion covers Chapter 23. The older lists still apply: 41 lines (pet food, most feed preparations, meat and fish meal, soybean meal, corn gluten, distillers' grains) are on List 3 at +25% (9903.88.03), and 20 lines (corn bran, cottonseed, coconut and palm-kernel cake, wine lees, milk- and egg-based feed) on List 4A at +7.5% (9903.88.15), kept in force after USTR's statutory four-year review (notice of October 7, 2026). Feed-grade lysine also owes antidumping and countervailing duties since September 2026 (see below). The IEEPA duties on China ended February 24, 2026.",
    "th-section-301": "No Chapter 23 line is on the general exemption list (U.S. note 52(b)), and no Thai exception list names one. The IEEPA reciprocal duty ended February 24, 2026.",
    "br-section-301": "+25% under the Brazil action since July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action since July 24, 2026 (9903.05.27). No Chapter 23 line is on either exemption list (U.S. notes 50(a) and 52(b)). The 2025 IEEPA duties on Brazil (10% reciprocal plus 40%) ended February 24, 2026.",
    "kh-section-301": "Coconut or copra oilcake (2306.50) is on Cambodia's exception list and pays no Section 301 duty (U.S. note 52(j)(5), 9903.06.02); the other 60 lines pay +10%. No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
    "my-section-301": "Coconut or copra oilcake (2306.50) is on Malaysia's exception list and pays no Section 301 duty (U.S. note 52(j)(4), 9903.05.99); the other 60 lines pay +10%. No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
    "tr-section-301": "No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
    "in-section-301": "No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The IEEPA duties on India ended February 24, 2026.",
    "eu-section-301": "EU goods pay 10% in total: the duty tops the base rate up to 10% (9903.05.39). Every Chapter 23 base rate is under 10% except over-quota milk-based feed (80.4¢/kg + 6.4%), which pays only its base rate. No Chapter 23 line is on the general exemption list. The IEEPA reciprocal duty ended February 24, 2026.",
    "gb-section-301": "No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
    "vn-section-301": "No Chapter 23 line is on the general exemption list (U.S. note 52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
    "id-section-301": "Coconut or copra oilcake (2306.50) is on Indonesia's exception list and pays no Section 301 duty (U.S. note 52(j)(11), 9903.06.16); the other 60 lines pay +10%. The IEEPA reciprocal duty ended February 24, 2026.",
    "other-section-301": "Coconut or copra oilcake (2306.50) is exempt for El Salvador, Ecuador and Jordan (U.S. note 52(j): 9903.06.07, 9903.06.18, 9903.06.20). Nicaragua's separate Section 301 duty is 0% in 2026 (9903.89.01). Japan, South Korea, Switzerland and Taiwan pay a total rate topped up to 12.5% or 10% instead of an addition. No Chapter 23 line is on the general exemption list (U.S. note 52(b)). Countries outside the 60 pay only the base rate.",
}


def fill_main(d, title, W):
    """W: dict of trade-dependent sentences keyed by in-effect id / section."""
    d["chapter"]["title"] = title
    ov = d["overview"]
    ov["notes"] = {
        "chapterNotes": (
            "**Note 1.** Heading 2309 includes products of a kind used in animal feeding, not elsewhere specified or included, obtained by "
            "processing vegetable or animal materials to such an extent that they have lost the essential characteristics of the original "
            "material, other than vegetable waste, vegetable residues and byproducts of such processing.\n\n"
            "**Subheading note 1.** For subheading 2306.41, \"low erucic acid rape or colza seeds\" means seeds as defined in subheading note 1 to chapter 12."
        ),
        "additionalUsNotes": (
            "**Note 1.** \"Mixed feeds and mixed-feed ingredients\" in subheading 2309.90.10 are products of heading 2309 that are admixtures of "
            "grains (or products, including byproducts, obtained in milling grains) with molasses, oilcake, oil-cake meal or feedstuffs, and that "
            "consist of not less than 6 percent by weight of grain or grain products.\n\n"
            "**Note 2.** Animal feed containing milk or milk derivatives entered under subheadings 2309.90.24 and 2309.90.44 may not exceed "
            "7,399,700 kg in any calendar year (products of Mexico are not included). Ireland has access to at least 5,470,323 kg, New Zealand "
            "1,782,618 kg, the United Kingdom 83,914 kg and Australia 56,699 kg."
        ),
    }

    tu = d["tariffUpdates"]
    have = {s["id"] for s in tu["sources"]}
    for s in EXTRA_SOURCES:
        if s["id"] not in have:
            tu["sources"].append(s)
    for e in tu["inEffect"]:
        e["exemption"] = EXEMPTIONS[e["id"]]
        e["whatItMeans"] = W["whatItMeans"][e["id"]]
        add = []
        if e["id"] in ("ca-section-301", "mx-section-301"):
            add = ["hts-ch98", "eo-14389"] if e["id"] == "mx-section-301" else ["hts-ch98", "eo-14389", "eo-14325"]
        elif e["id"] == "cn-section-301":
            add = ["fr-2026-18924", "eo-14389"]
        else:
            add = ["eo-14389"]
        for a in add:
            if a not in e["sourceIds"]:
                e["sourceIds"].insert(len(e["sourceIds"]) - 1, a)
    return d


if __name__ == "__main__":
    pass
