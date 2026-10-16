"""New official sources for Chapter 83 (not already used by another chapter file).

Federal Register URLs are the FR API `html_url` (checked 2026-10-13); the HTS PDF was downloaded.
"""

CH83_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2083"
CH99_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"


def _fr(doc, citation, title, published, slug, document="Notice (Commerce / ITA)", publisher="Federal Register"):
    y, m, dd = published.split("-")
    return {
        "id": f"fr-{doc}",
        "publisher": publisher,
        "citation": citation,
        "document": document,
        "title": title,
        "signed": None,
        "published": published,
        "url": f"https://www.federalregister.gov/documents/{y}/{m}/{dd}/{doc}/{slug}",
    }


NEW = {
    "hts-ch83": {
        "id": "hts-ch83",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 83",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 83: Miscellaneous Articles of Base Metal",
        "signed": None,
        "published": "2026-10-07",
        "url": CH83_PDF,
    },
    "fr-2025-03596": _fr(
        "2025-03596",
        "90 FR 11251",
        "Implementation of Duties on Aluminum Pursuant to Proclamation 10895 Adjusting Imports of Aluminum Into the United States",
        "2025-03-05",
        "implementation-of-duties-on-aluminum-pursuant-to-proclamation-10895-adjusting-imports-of-aluminum",
        document="Notice (Commerce / BIS)",
    ),
}

ADCVD_SOURCES = [
    _fr(
        "2023-08433",
        "88 FR 24552",
        "Paper Clips From the People's Republic of China: Continuation of Antidumping Duty Order",
        "2023-04-21",
        "paper-clips-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order",
    ),
    _fr(
        "2022-28170",
        "87 FR 79858",
        "Paper Clips From the People's Republic of China: Final Results of the Expedited Fifth Sunset Review of the Antidumping Duty Order",
        "2022-12-28",
        "paper-clips-from-the-peoples-republic-of-china-final-results-of-the-expedited-fifth-sunset-review-of",
    ),
    _fr(
        "2020-15622",
        "85 FR 43815",
        "Certain Collated Steel Staples From the People's Republic of China: Antidumping Duty Order",
        "2020-07-20",
        "certain-collated-steel-staples-from-the-peoples-republic-of-china-antidumping-duty-order",
    ),
    _fr(
        "2020-15623",
        "85 FR 43813",
        "Certain Collated Steel Staples From the People's Republic of China: Countervailing Duty Order",
        "2020-07-20",
        "certain-collated-steel-staples-from-the-peoples-republic-of-china-countervailing-duty-order",
    ),
    _fr(
        "2025-20161",
        "90 FR 51648",
        "Collated Steel Staples From People's Republic of China: Final Results of the Expedited First Sunset Review of the Antidumping Duty Order",
        "2025-11-18",
        "collated-steel-staples-from-peoples-republic-of-china-final-results-of-the-expedited-first-sunset",
    ),
    _fr(
        "2025-20159",
        "90 FR 51642",
        "Certain Collated Steel Staples From the People's Republic of China: Final Results of the Expedited First Sunset Review of the Countervailing Duty Order",
        "2025-11-18",
        "certain-collated-steel-staples-from-the-peoples-republic-of-china-final-results-of-the-expedited",
    ),
    _fr(
        "2026-02382",
        "91 FR 5431",
        "Collated Steel Staples From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order",
        "2026-02-06",
        "collated-steel-staples-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order-and",
    ),
    _fr(
        "2023-13271",
        "88 FR 40781",
        "Carton-Closing Staples From China: Final Results of Sunset Review and Revocation of Order",
        "2023-06-22",
        "carton-closing-staples-from-china-final-results-of-sunset-review-and-revocation-of-order",
    ),
]
