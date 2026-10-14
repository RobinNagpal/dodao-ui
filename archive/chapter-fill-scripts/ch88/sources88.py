"""Official sources for the Chapter 88 content file (id -> TariffUpdateSource).

Federal Register entries are built from the FR API metadata cached in fr_meta.json (python3 meta.py <doc numbers>);
sources shared with already-published chapters are copied from srclib.json (built from the shipped chapter files).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FR = "Federal Register"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH88 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2088"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"

_META = json.load(open(os.path.join(HERE, "fr_meta.json")))
_LIB = json.load(open(os.path.join(HERE, "srclib.json")))


def s(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


def fr(id, docnum, document):
    m = _META[docnum]
    return s(id, FR, m["citation"], document, m["title"], m.get("signing_date"), m["publication_date"], m["html_url"])


def lib(id):
    x = dict(_LIB[id])
    x.pop("_from", None)
    return x


NEW = [
    fr("procl-11040", "2026-14334", "Proclamation 11040"),
    fr("fr-2025-08500", "2025-08500", "Notice (Commerce / BIS)"),
    fr("fr-2025-13365", "2025-13365", "Notice (Commerce / BIS)"),
    fr("fr-2026-15659", "2026-15659", "Public notice (FCC)"),
    fr("fr-2026-18535", "2026-18535", "Final rule (FCC)"),
    fr("ustr-lca-2019", "2019-22056", "Notice (USTR)"),
    fr("ustr-lca-2020", "2020-03454", "Notice (USTR)"),
    fr("ustr-lca-uk-2021", "2021-05035", "Notice (USTR)"),
    fr("ustr-lca-eu-2021", "2021-05354", "Notice (USTR)"),
    fr("ustr-lca-suspend", "2021-14550", "Notice (USTR)"),
    fr("itc-lca-2018", "2018-03317", "Notice (U.S. International Trade Commission)"),
    fr("ita-lca-cvd", "2017-27875", "Notice (Commerce / ITA)"),
    fr("ita-lca-ad", "2017-27874", "Notice (Commerce / ITA)"),
    s("hts-ch88", "USITC", "HTSUS 2026 Revision 21, Chapter 88", "Harmonized Tariff Schedule",
      "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 88: Aircraft, Spacecraft, and Parts Thereof",
      None, "2026-10-07", CH88),
    s("hts-gn", "USITC", "HTSUS 2026 Revision 21, General Notes", "Harmonized Tariff Schedule",
      "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes (incl. general note 6, Agreement on Trade in Civil Aircraft)",
      None, "2026-10-07", GN),
]

LIB_IDS = [
    "procl-11012", "eo-14389", "csms-67834313", "scotus-24-1287", "eo-14257", "eo-14309", "fr-2025-12060", "eo-14345",
    "fr-2025-17908", "eo-14346", "fr-2025-18660", "fr-2025-21940", "fr-2025-23316", "eo-14323", "eo-14193", "eo-14194",
    "eo-14231", "eo-14232", "eo-14325", "eo-14195", "eo-14228", "eo-14259", "eo-14266", "eo-14298", "eo-14357", "ustr-usmca-review",
    "csms-69326983", "csms-69302472",
]

EXTRA = NEW + [lib(i) for i in LIB_IDS]
