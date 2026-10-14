"""New official sources for Chapter 82 (not already used by another chapter file).

Every Federal Register URL is the FR API `html_url` (checked 2026-10-13); HTS / govinfo URLs were opened.
"""

CH82_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2082"
CH99_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
USC_1304 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1304.htm"
USC_1241 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap29-sec1241.htm"
USC_1244 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap29-sec1244.htm"


def fr(doc, citation, document, title, published, url, signed=None):
    return {
        "id": f"fr-{doc}",
        "publisher": "Federal Register",
        "citation": citation,
        "document": document,
        "title": title,
        "signed": signed,
        "published": published,
        "url": url,
    }


ITA = "Notice (Commerce / ITA)"
ITC = "Notice (USITC)"

_LIST = [
    {
        "id": "hts-ch82",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 82",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 82: Tools, Implements, Cutlery, Spoons and Forks, of Base Metal",
        "signed": None,
        "published": "2026-10-07",
        "url": CH82_PDF,
    },
    fr(
        "E9-26680",
        "74 FR 57145",
        ITA,
        "Diamond Sawblades and Parts Thereof From the People's Republic of China and the Republic of Korea: Antidumping Duty Orders",
        "2009-11-04",
        "https://www.federalregister.gov/documents/2009/11/04/E9-26680/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-and-the-republic-of-korea",
    ),
    fr(
        "2011-27971",
        "76 FR 66892",
        ITA,
        "Notice of Implementation of Determination Under Section 129 of the Uruguay Round Agreements Act and Revocation of the Antidumping Duty Order on Diamond Sawblades and Parts Thereof From the Republic of Korea",
        "2011-10-28",
        "https://www.federalregister.gov/documents/2011/10/28/2011-27971/notice-of-implementation-of-determination-under-section-129-of-the-uruguay-round-agreements-act-and",
    ),
    fr(
        "2019-15084",
        "84 FR 33920",
        ITA,
        "Diamond Sawblades and Parts Thereof From the People's Republic of China: Final Determination of Anti-Circumvention Inquiry (Thailand)",
        "2019-07-16",
        "https://www.federalregister.gov/documents/2019/07/16/2019-15084/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-final-determination-of",
    ),
    fr(
        "2020-03362",
        "85 FR 9737",
        ITA,
        "Diamond Sawblades and Parts Thereof From the People's Republic of China: Final Determination of Anti-Circumvention Inquiry (Canada)",
        "2020-02-20",
        "https://www.federalregister.gov/documents/2020/02/20/2020-03362/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-final-determination-of",
    ),
    fr(
        "2021-07450",
        "86 FR 18942",
        ITA,
        "Diamond Sawblades and Parts Thereof From the People's Republic of China: Continuation of Antidumping Duty Order",
        "2021-04-12",
        "https://www.federalregister.gov/documents/2021/04/12/2021-07450/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-continuation-of-antidumping",
    ),
    fr(
        "2026-04069",
        "91 FR 10131",
        ITC,
        "Diamond Sawblades and Parts Thereof From China; Institution of a Five-Year Review",
        "2026-03-02",
        "https://www.federalregister.gov/documents/2026/03/02/2026-04069/diamond-sawblades-and-parts-thereof-from-china-institution-of-a-five-year-review",
    ),
    fr(
        "2026-13573",
        "91 FR 40976",
        ITA,
        "Diamond Sawblades and Parts Thereof From the People's Republic of China: Final Results of the Expedited Third Sunset Review of the Antidumping Duty Order",
        "2026-07-06",
        "https://www.federalregister.gov/documents/2026/07/06/2026-13573/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-final-results-of-the",
    ),
    fr(
        "2026-13610",
        "91 FR 41084",
        ITC,
        "Diamond Sawblades and Parts Thereof From China; Scheduling of an Expedited Five-Year Review",
        "2026-07-06",
        "https://www.federalregister.gov/documents/2026/07/06/2026-13610/diamond-sawblades-and-parts-thereof-from-china-scheduling-of-an-expedited-five-year-review",
    ),
    fr(
        "2022-06865",
        "87 FR 19073",
        ITA,
        "Heavy Forged Hand Tools, Finished or Unfinished, With or Without Handles From the People's Republic of China: Final Results of the Expedited Fifth Sunset Review of the Antidumping Duty Orders",
        "2022-04-01",
        "https://www.federalregister.gov/documents/2022/04/01/2022-06865/heavy-forged-hand-tools-finished-or-unfinished-with-or-without-handles-from-the-peoples-republic-of",
    ),
    fr(
        "2022-12311",
        "87 FR 34846",
        ITA,
        "Heavy Forged Hand Tools, Finished or Unfinished, With or Without Handles From the People's Republic of China: Continuation of Antidumping Duty Orders",
        "2022-06-08",
        "https://www.federalregister.gov/documents/2022/06/08/2022-12311/heavy-forged-hand-tools-finished-or-unfinished-with-or-without-handles-from-the-peoples-republic-of",
    ),
]

NEW = {s["id"]: s for s in _LIST}
