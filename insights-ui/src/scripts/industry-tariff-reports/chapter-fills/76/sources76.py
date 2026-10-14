"""Official sources for the Chapter 76 content file (id -> TariffUpdateSource).

Federal Register entries are normalized (title, citation, publication date, signing date, URL) from the
FR API metadata cached in fr_meta.json (python3 meta.py <doc numbers>).
"""
import json
import os

FR = "Federal Register"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH76 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2076"
CBP = "U.S. Customs and Border Protection"

_META = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fr_meta.json")))


def s(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


def fr(id, docnum, document):
    m = _META[docnum]
    return s(id, FR, m["citation"], document, m["title"], m.get("signing_date"), m["publication_date"], m["html_url"])


def ita(id, docnum):
    return fr(id, docnum, "Notice (Commerce / ITA)")


def itc(id, docnum):
    return fr(id, docnum, "Notice (U.S. International Trade Commission)")


EXTRA = [
    # ---- Section 232 aluminum history
    fr("procl-9704", "2018-05477", "Proclamation 9704"),
    fr("procl-9758", "2018-12137", "Proclamation 9758"),
    fr("procl-9893", "2019-10999", "Proclamation 9893"),
    fr("procl-9980", "2020-01806", "Proclamation 9980"),
    fr("procl-10060", "2020-17977", "Proclamation 10060"),
    fr("procl-10106", "2020-24200", "Proclamation 10106"),
    fr("procl-10139", "2021-01711", "Proclamation 10139"),
    fr("procl-10144", "2021-02490", "Proclamation 10144"),
    fr("procl-10327", "2021-28514", "Proclamation 10327"),
    fr("procl-10405", "2022-12097", "Proclamation 10405"),
    fr("procl-10522", "2023-04470", "Proclamation 10522"),
    fr("procl-10690", "2023-28995", "Proclamation 10690"),
    fr("procl-10782", "2024-15632", "Proclamation 10782"),
    fr("procl-10895", "2025-02832", "Proclamation 10895"),
    fr("eo-14289", "2025-07835", "Executive Order 14289"),
    fr("procl-10947", "2025-10524", "Proclamation 10947"),
    fr("eo-14309", "2025-11473", "Executive Order 14309"),
    fr("procl-10984", "2025-19639", "Proclamation 10984"),
    ita("fr-2026-07987", "2026-07987"),
    fr("procl-11021", "2026-06960", "Proclamation 11021"),
    ita("fr-2026-08297", "2026-08297"),
    fr("procl-11032", "2026-11314", "Proclamation 11032"),
    fr("procl-11045", "2026-14990", "Proclamation 11045"),
    # civil aircraft reliefs (Section 232 metals)
    fr("fr-2025-12060", "2025-12060", "Notice"),
    fr("fr-2025-17908", "2025-17908", "Notice"),
    fr("fr-2025-18660", "2025-18660", "Notice"),
    fr("fr-2025-21940", "2025-21940", "Notice"),
    s("csms-64366327", CBP, "CSMS # 64366327", "CBP CSMS message", "ACE Entry Summary Create/Update CATAIR Updated with Aluminum Smelt and Cast and Steel Melt and Pour Changes", None, "2025-03-10", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3d626f7"),
    s("csms-68253075", CBP, "CSMS # 68253075", "CBP CSMS message", "GUIDANCE: Section 232 Duties on Imports of Aluminum, Steel, and Copper", None, "2026-04-03", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4117593"),
    # ---- IEEPA, Supreme Court, Section 122
    fr("eo-14193", "2025-02406", "Executive Order 14193"),
    fr("eo-14194", "2025-02407", "Executive Order 14194"),
    fr("eo-14231", "2025-03990", "Executive Order 14231"),
    fr("eo-14232", "2025-03991", "Executive Order 14232"),
    fr("eo-14257", "2025-06063", "Executive Order 14257"),
    s("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    fr("eo-14389", "2026-03832", "Executive Order 14389"),
    s("csms-67834313", CBP, "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    fr("procl-11012", "2026-03824", "Proclamation 11012"),
    # ---- AD/CVD (Commerce orders; ITC determinations)
    ita("fr-2011-13086", "2011-13086"),
    ita("fr-2011-13103", "2011-13103"),
    ita("fr-2022-23810", "2022-23810"),
    itc("fr-2024-27376", "2024-27376"),
    ita("fr-2018-08115", "2018-08115"),
    ita("fr-2018-08116", "2018-08116"),
    ita("fr-2023-21653", "2023-21653"),
    ita("fr-2023-26030", "2023-26030"),
    ita("fr-2021-24859", "2021-24859"),
    ita("fr-2021-24858", "2021-24858"),
    itc("fr-2026-20139", "2026-20139"),
    ita("fr-2019-01836", "2019-01836"),
    ita("fr-2019-01273", "2019-01273"),
    ita("fr-2024-19942", "2024-19942"),
    ita("fr-2021-08713", "2021-08713"),
    ita("fr-2021-08714", "2021-08714"),
    ita("fr-2023-15947", "2023-15947"),
    itc("fr-2026-11829", "2026-11829"),
    ita("fr-2025-08089", "2025-08089"),
    ita("fr-2019-27641", "2019-27641"),
    ita("fr-2025-11232", "2025-11232"),
    # ---- AIM licensing
    ita("fr-2020-28166", "2020-28166"),
    ita("fr-2021-10747", "2021-10747"),
    # ---- HTS chapter 76 text
    s("hts-ch76", "U.S. International Trade Commission", "HTSUS 2026 Revision 21, Chapter 76", "Harmonized Tariff Schedule", "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 76: Aluminum and Articles Thereof", None, "2026-10-07", CH76),
]
