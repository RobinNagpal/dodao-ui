"""Official sources for the Chapter 89 content file (id -> TariffUpdateSource).

Federal Register entries are normalized (title, citation, publication date, signing date, URL) from the
FR API metadata cached in fr_meta.json (python3 meta.py <doc numbers>).
"""
import json
import os

FR = "Federal Register"
CBP = "CBP"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH89 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2089"

_META = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fr_meta.json")))


def s(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


def fr(id, docnum, document):
    m = _META[docnum]
    return s(id, FR, m["citation"], document, m["title"], m.get("signing_date"), m["publication_date"], m["html_url"])


def ustr(id, docnum):
    return fr(id, docnum, "Notice (USTR)")


EXTRA = [
    # ---- Section 301: China's targeting of the maritime, logistics and shipbuilding sectors
    ustr("fr-2025-01540", "2025-01540"),
    ustr("fr-2025-06927", "2025-06927"),
    ustr("fr-2025-19568", "2025-19568"),
    ustr("fr-2025-19873", "2025-19873"),
    fr("eo-14269", "2025-06465", "Executive Order 14269"),
    # ---- China Section 301 four-year review (note 31)
    ustr("fr-2024-21217", "2024-21217"),
    # ---- Canada Section 338 (scope change that added motorboats)
    fr("procl-11064", "2026-18838", "Proclamation 11064"),
    # ---- IEEPA, Supreme Court, Section 122
    fr("eo-14193", "2025-02406", "Executive Order 14193"),
    fr("eo-14194", "2025-02407", "Executive Order 14194"),
    fr("eo-14195", "2025-02408", "Executive Order 14195"),
    fr("eo-14228", "2025-03775", "Executive Order 14228"),
    fr("eo-14231", "2025-03990", "Executive Order 14231"),
    fr("eo-14232", "2025-03991", "Executive Order 14232"),
    fr("eo-14257", "2025-06063", "Executive Order 14257"),
    fr("eo-14259", "2025-06378", "Executive Order 14259"),
    fr("eo-14266", "2025-06462", "Executive Order 14266"),
    fr("eo-14298", "2025-09297", "Executive Order 14298"),
    fr("eo-14323", "2025-14896", "Executive Order 14323"),
    fr("eo-14325", "2025-14999", "Executive Order 14325"),
    fr("eo-14326", "2025-15010", "Executive Order 14326"),
    fr("eo-14357", "2025-19825", "Executive Order 14357"),
    s("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20",
      "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    fr("eo-14389", "2026-03832", "Executive Order 14389"),
    s("csms-67834313", CBP, "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22",
      "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    fr("procl-11012", "2026-03824", "Proclamation 11012"),
    # ---- USMCA review, AGOA
    s("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None, "2026-07-01",
      "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    s("ustr-agoa-2026", "USTR", "USTR press release", "Statement", "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", None, "2026-02-03",
      "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"),
    fr("procl-11030", "2026-10398", "Proclamation 11030"),
    # ---- HTS chapter 89 and 98 text
    s("hts-ch89", "USITC", "HTSUS 2026 Revision 21, Chapter 89", "Harmonized Tariff Schedule",
      "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 89: Ships, Boats and Floating Structures", None, "2026-10-07", CH89),
    s("hts-ch98", "USITC", "HTSUS 2026 Revision 21, Chapter 98", "Harmonized Tariff Schedule",
      "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98: Special Classification Provisions", None, "2026-10-07", CH98),
]
