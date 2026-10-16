"""Official sources for the Chapter 85 content file (id -> TariffUpdateSource).

Federal Register entries are normalized (title, citation, publication date, signing date, URL) from the FR API
metadata cached in fr_meta.json (python3 meta.py <doc numbers>).
"""
import json
import os

FR = "Federal Register"
CBP = "U.S. Customs and Border Protection"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH85 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2085"

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


def ustr(id, docnum):
    return fr(id, docnum, "Notice (USTR)")


def csms(id, num, title, published, url):
    return s(id, CBP, f"CSMS # {num}", "CBP CSMS message", title, None, published, url)


EXTRA = [
    # ---- China Section 301
    ustr("fr-2018-13248", "2018-13248"),
    ustr("fr-2018-17709", "2018-17709"),
    ustr("fr-2018-20610", "2018-20610"),
    ustr("fr-2019-09681", "2019-09681"),
    ustr("fr-2019-17865", "2019-17865"),
    ustr("fr-2020-00904", "2020-00904"),
    ustr("fr-2024-21217", "2024-21217"),
    ustr("fr-2024-29462", "2024-29462"),
    ustr("fr-2025-23912", "2025-23912"),
    ustr("fr-2025-21671", "2025-21671"),
    ustr("fr-2026-20510", "2026-20510"),
    # ---- IEEPA (ended) and Section 122 (expired)
    fr("eo-14193", "2025-02406", "Executive Order 14193"),
    fr("eo-14194", "2025-02407", "Executive Order 14194"),
    fr("eo-14195", "2025-02408", "Executive Order 14195"),
    fr("eo-14228", "2025-03775", "Executive Order 14228"),
    fr("eo-14257", "2025-06063", "Executive Order 14257"),
    s(
        "wh-2025-04-11",
        "The White House",
        "Presidential Memorandum of April 11, 2025",
        "Presidential Memorandum",
        "Clarification of Exceptions Under Executive Order 14257 of April 2, 2025, as Amended",
        "2025-04-11",
        "2025-04-11",
        "https://www.whitehouse.gov/presidential-actions/2025/04/clarification-of-exceptions-under-executive-order-14257-of-april-2-2025-as-amended/",
    ),
    fr("eo-14298", "2025-09297", "Executive Order 14298"),
    fr("eo-14357", "2025-19825", "Executive Order 14357"),
    s("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    fr("eo-14389", "2026-03832", "Executive Order 14389"),
    csms("csms-67834313", "67834313", "Ending Collection of International Emergency Economic Powers Act Duties", "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    fr("procl-11012", "2026-03824", "Proclamation 11012"),
    # ---- Section 232: vehicles and parts
    fr("procl-10908", "2025-05930", "Proclamation 10908"),
    fr("procl-10925", "2025-07833", "Proclamation 10925"),
    fr("procl-10984", "2025-19639", "Proclamation 10984"),
    fr("fr-2025-12060", "2025-12060", "Notice (Commerce)"),
    fr("fr-2025-17908", "2025-17908", "Notice (Commerce)"),
    fr("fr-2025-18660", "2025-18660", "Notice (Commerce)"),
    fr("fr-2025-21940", "2025-21940", "Notice (Commerce)"),
    fr("fr-2026-10571", "2026-10571", "Notice (Commerce)"),
    # ---- Section 232: metals
    fr("procl-10962", "2025-14893", "Proclamation 10962"),
    fr("procl-11021", "2026-06960", "Proclamation 11021"),
    fr("fr-2026-08297", "2026-08297", "Notice (Commerce / BIS)"),
    fr("procl-11032", "2026-11314", "Proclamation 11032"),
    fr("fr-2026-15961", "2026-15961", "Notice (Commerce / BIS)"),
    fr("fr-2025-15819", "2025-15819", "Notice (Commerce / BIS)"),
    fr("procl-10522", "2023-04470", "Proclamation 10522"),
    fr("procl-10895", "2025-02832", "Proclamation 10895"),
    csms("csms-68253075", "68253075", "GUIDANCE: Section 232 Duties on Imports of Aluminum, Steel, and Copper", "2026-04-03", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4117593"),
    # ---- Section 232: semiconductors, drones, polysilicon
    fr("procl-11002", "2026-01052", "Proclamation 11002"),
    fr("procl-11055", "2026-16979", "Proclamation 11055"),
    fr("procl-11052", "2026-16400", "Proclamation 11052"),
    fr("fr-2026-19537", "2026-19537", "Rule (Commerce / BIS)"),
    fr("fr-2025-13345", "2025-13345", "Notice (Commerce / BIS)"),
    # ---- Russia
    fr("procl-10420", "2022-14145", "Proclamation 10420"),
    # ---- Canada Section 338, Brazil and the 2026 Section 301 actions
    fr("procl-11048", "2026-14997", "Proclamation 11048"),
    fr("procl-11056", "2026-17294", "Proclamation 11056"),
    fr("procl-11065", "2026-18839", "Proclamation 11065"),
    ustr("fr-2026-15181", "2026-15181"),
    fr("fr-2026-15274", "2026-15274", "Presidential Memorandum"),
    ustr("fr-2026-14542", "2026-14542"),
    ustr("fr-2025-22690", "2025-22690"),
    ustr("fr-2025-23892", "2025-23892"),
    # ---- Section 201 solar safeguard (ended February 6, 2026)
    fr("procl-9693", "2018-01592", "Proclamation 9693"),
    fr("procl-10339", "2022-02906", "Proclamation 10339"),
    fr("procl-10779", "2024-14143", "Proclamation 10779"),
    itc("fr-2026-05170", "2026-05170"),
    # ---- AD/CVD: solar
    ita("fr-2012-29668", "2012-29668"),
    ita("fr-2012-29669", "2012-29669"),
    ita("fr-2015-03183", "2015-03183"),
    ita("fr-2015-03179", "2015-03179"),
    ita("fr-2026-12571", "2026-12571"),
    ita("fr-2023-18161", "2023-18161"),
    ita("fr-2025-11588", "2025-11588"),
    ita("fr-2025-11589", "2025-11589"),
    ita("fr-2025-15250", "2025-15250"),
    ita("fr-2025-15251", "2025-15251"),
    ita("fr-2026-18945", "2026-18945"),
    ita("fr-2026-18947", "2026-18947"),
    ita("fr-2026-18939", "2026-18939"),
    ita("fr-2026-18940", "2026-18940"),
    ita("fr-2026-18941", "2026-18941"),
    ita("fr-2026-18942", "2026-18942"),
    ita("fr-2026-14416", "2026-14416"),
    # ---- AD/CVD: aluminum wire and cable, large power transformers, graphite electrodes
    ita("fr-2019-27641", "2019-27641"),
    ita("fr-2025-11232", "2025-11232"),
    ita("fr-2025-01744", "2025-01744"),
    ita("fr-2025-01745", "2025-01745"),
    ita("fr-e9-4126", "E9-4126"),
    ita("fr-2025-16949", "2025-16949"),
    ita("fr-2012-21613", "2012-21613"),
    ita("fr-2024-19899", "2024-19899"),
    ita("fr-2026-05495", "2026-05495"),
    ita("fr-2026-05496", "2026-05496"),
    ita("fr-2026-20030", "2026-20030"),
    ita("fr-2026-20031", "2026-20031"),
    # ---- Agency rules
    fr("fr-2026-18535", "2026-18535", "Rule (FCC)"),
    fr("fr-2026-15628", "2026-15628", "Notice (DHS)"),
    fr("fr-2026-12670", "2026-12670", "Rule (CBP)"),
    s(
        "dhs-uflpa-2025",
        "U.S. Department of Homeland Security",
        "UFLPA Strategy, 2025 update",
        "Report to Congress",
        "2025 Updates to the Strategy to Prevent the Importation of Goods Mined, Produced, or Manufactured with Forced Labor in the People's Republic of China",
        None,
        "2025-08-19",
        "https://www.dhs.gov/sites/default/files/2025-08/25_0819_plcy_uflpa-strategy-2025-update-508.pdf",
    ),
    csms(
        "csms-64916652",
        "64916652",
        "UPDATE to CSMS # 64913145: GUIDANCE: Import Duties on Certain Automobile Parts — 9903.94.06 for articles that are not parts of passenger vehicles",
        "2025-05-01",
        "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3de8cac",
    ),
    # ---- HTS chapter 85 text
    s(
        "hts-ch85",
        "U.S. International Trade Commission",
        "HTSUS 2026 Revision 21, Chapter 85",
        "Harmonized Tariff Schedule",
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 85: Electrical Machinery and Equipment and Parts Thereof; Sound Recorders and Reproducers, Television Image and Sound Recorders and Reproducers",
        None,
        "2026-10-07",
        CH85,
    ),
]
