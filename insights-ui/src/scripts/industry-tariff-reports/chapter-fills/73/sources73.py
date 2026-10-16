"""New official sources for Chapter 73 (not already used by another chapter file).

Every Federal Register URL is the FR API `html_url` (checked 2026-10-13); eCFR / govinfo / trade.gov URLs were opened.
"""

CH73_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2073"
CH99_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
USC_1304 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1304.htm"
SIMA_HTS = "https://www.trade.gov/steel-products-hts-codes"


def fr(doc, citation, document, title, published, url, signed=None, publisher="Federal Register"):
    return {
        "id": f"fr-{doc}",
        "publisher": publisher,
        "citation": citation,
        "document": document,
        "title": title,
        "signed": signed,
        "published": published,
        "url": url,
    }


NEW = {
    "hts-ch73": {
        "id": "hts-ch73",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 73",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 73: Articles of Iron or Steel",
        "signed": None,
        "published": "2026-10-07",
        "url": CH73_PDF,
    },
    "procl-9980": {
        "id": "procl-9980",
        "publisher": "Federal Register",
        "citation": "85 FR 5281",
        "document": "Proclamation 9980",
        "title": "Adjusting Imports of Derivative Aluminum Articles and Derivative Steel Articles Into the United States",
        "signed": "2020-01-24",
        "published": "2020-01-29",
        "url": "https://www.federalregister.gov/documents/2020/01/29/2020-01806/adjusting-imports-of-derivative-aluminum-articles-and-derivative-steel-articles-into-the-united",
    },
    "usc-1304": {
        "id": "usc-1304",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "19 U.S.C. 1304(c)–(e)",
        "document": "United States Code, 2024 edition",
        "title": "Marking of imported articles: permanent country-of-origin marking of steel pipe and fittings, compressed gas cylinders and certain castings",
        "signed": None,
        "published": "2024-12-31",
        "url": USC_1304,
    },
    "ita-sima-hts": {
        "id": "ita-sima-hts",
        "publisher": "International Trade Administration",
        "citation": "ITA web page (checked October 13, 2026)",
        "document": "Web page",
        "title": "Steel Import Monitoring and Analysis (SIMA): steel products and HTS codes requiring a steel import license",
        "signed": None,
        "published": "2026-10-13",
        "url": SIMA_HTS,
    },
}
