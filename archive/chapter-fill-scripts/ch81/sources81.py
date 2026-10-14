"""Official sources for the Chapter 81 content file (id -> TariffUpdateSource).

Federal Register entries are normalized from the FR API metadata cached in fr_meta.json (python3 meta.py <doc numbers>).
Sources already verified by other migrated chapters are reused from allsrc.json (a snapshot of their source objects).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FR = "Federal Register"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH81 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2081"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"

_META = json.load(open(os.path.join(HERE, "fr_meta.json")))
ALL = json.load(open(os.path.join(HERE, "allsrc.json")))


def s(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


def fr(id, docnum, document):
    m = _META[docnum]
    return s(id, FR, m["citation"], document, m["title"], m.get("signing_date"), m["publication_date"], m["html_url"])


def ita(id, docnum):
    return fr(id, docnum, "Notice (Commerce / ITA)")


def itc(id, docnum):
    return fr(id, docnum, "Notice (U.S. International Trade Commission)")


def bis(id, docnum):
    return fr(id, docnum, "Notice (Commerce / BIS)")


REUSED = [
    "eo-14193", "eo-14194", "eo-14195", "eo-14228", "eo-14231", "eo-14232", "eo-14257", "eo-14298", "eo-14325", "eo-14357",
    "eo-14272", "procl-11001", "fr-2026-03868", "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "csms-67844987",
    "procl-11030", "ustr-usmca-review", "pl-117-110", "procl-10420", "cbp-gsp", "eo-14323", "procl-11046", "procl-11047",
]

EXTRA = [ALL[i] for i in REUSED] + [
    s("hts-ch81", "USITC", "HTSUS 2026 Revision 21, Chapter 81", "Harmonized Tariff Schedule",
      "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 81: Other Base Metals; Cermets; Articles Thereof",
      None, "2026-10-07", CH81),
    s("hts-gn", "USITC", "HTSUS 2026 Revision 21, General Notes (notes 3, 6, 16)", "Harmonized Tariff Schedule",
      "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes: general note 3(b) column 2 countries, note 6 civil aircraft, note 16 AGOA beneficiaries",
      None, "2026-10-07", GN),
    fr("eo-14358", "2025-19826", "Executive Order 14358"),
    bis("fr-2025-07273", "2025-07273"),
    bis("fr-2021-23301", "2021-23301"),
    bis("fr-2023-16624", "2023-16624"),
    itc("fr-2017-22266", "2017-22266"),
    itc("fr-2020-00697", "2020-00697"),
    itc("fr-2026-20138", "2026-20138"),
    ita("fr-2026-20161", "2026-20161"),
    ita("fr-2026-17770", "2026-17770"),
    ita("fr-2025-01304", "2025-01304"),
    ita("fr-2025-16422", "2025-16422"),
    ita("fr-2023-20940", "2023-20940"),
    ita("fr-2023-11146", "2023-11146"),
    ita("fr-2022-12707", "2022-12707"),
    ita("fr-2023-12030", "2023-12030"),
    ita("fr-2021-25770", "2021-25770"),
    ita("fr-2021-20009", "2021-20009"),
]
