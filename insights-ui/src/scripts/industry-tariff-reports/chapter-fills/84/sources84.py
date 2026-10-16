"""New official sources for Chapter 84 (not already used by another chapter file).

Federal Register URLs are the FR API `html_url` (checked 2026-10-13); the USITC chapter PDF was downloaded.
"""

CH84_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2084"
CH99_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"

NEW = {
    "hts-ch84": {
        "id": "hts-ch84",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 84",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Section XVI and Chapter 84: Nuclear Reactors, Boilers, Machinery and Mechanical Appliances; Parts Thereof",
        "signed": None,
        "published": "2026-10-07",
        "url": CH84_PDF,
    },
    "procl-11002": {
        "id": "procl-11002",
        "publisher": "Federal Register",
        "citation": "91 FR 2443",
        "document": "Proclamation 11002",
        "title": "Adjusting Imports of Semiconductors, Semiconductor Manufacturing Equipment, and Their Derivative Products Into the United States",
        "signed": "2026-01-14",
        "published": "2026-01-20",
        "url": "https://www.federalregister.gov/documents/2026/01/20/2026-01052/adjusting-imports-of-semiconductors-semiconductor-manufacturing-equipment-and-their-derivative",
    },
    "fr-2025-18749": {
        "id": "fr-2025-18749",
        "publisher": "Federal Register",
        "citation": "90 FR 46382",
        "document": "Notice (Commerce / BIS)",
        "title": "Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Robotics and Industrial Machinery",
        "signed": None,
        "published": "2025-09-26",
        "url": "https://www.federalregister.gov/documents/2025/09/26/2025-18749/notice-of-request-for-public-comments-on-section-232-national-security-investigation-of-imports-of",
    },
}
