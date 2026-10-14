"""Fill the writer parts of the generated Chapter 49 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 49 ...` (see run.sh in this folder):
    python3 fill.py

Prose about the informational-materials headings (9903.05.92, 9903.05.09) is written so it stays correct
whether or not measures.json models them as relief: it tells the reader to claim the heading, and the
matrix assumptions say which duty the claim removes.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/49-printing-industry-products.json"
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH49 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2049"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"

d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, "pool.json")))


def fr(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


NEW_SOURCES = {s["id"]: s for s in [
    fr("eo-14324", "90 FR 37775", "Executive Order 14324", "Suspending Duty-Free De Minimis Treatment for All Countries",
       "2025-07-30", "2025-08-05",
       "https://www.federalregister.gov/documents/2025/08/05/2025-14897/suspending-duty-free-de-minimis-treatment-for-all-countries"),
    fr("cbp-dm-2025", "90 FR 42418", "Notice (CBP)",
       "Notice of Implementation of the President's Executive Order 14324, Suspending Duty-Free De Minimis Treatment for All Countries",
       None, "2025-09-02",
       "https://www.federalregister.gov/documents/2025/09/02/2025-16802/notice-of-implementation-of-the-presidents-executive-order-14324-suspending-duty-free-de-minimis"),
    fr("eo-14388", "91 FR 9433", "Executive Order 14388", "Continuing the Suspension of Duty-Free De Minimis Treatment for All Countries",
       "2026-02-20", "2026-02-25",
       "https://www.federalregister.gov/documents/2026/02/25/2026-03829/continuing-the-suspension-of-duty-free-de-minimis-treatment-for-all-countries"),
    fr("cbp-ifr-dm", "91 FR 37789", "Interim final rule (CBP)",
       "Indefinite Suspension of the De Minimis Exemption for Merchandise Arriving Through All Modes Other Than the International Postal Network",
       None, "2026-06-24",
       "https://www.federalregister.gov/documents/2026/06/24/2026-12670/indefinite-suspension-of-the-de-minimis-exemption-for-merchandise-arriving-through-all-modes-other"),
    fr("cbp-ifr-mail", "91 FR 37801", "Interim final rule (CBP)",
       "Indefinite Suspension of the De Minimis Exemption for Mail Shipments and New Postal Informal Entry Process",
       None, "2026-06-24",
       "https://www.federalregister.gov/documents/2026/06/24/2026-12669/indefinite-suspension-of-the-de-minimis-exemption-for-mail-shipments-and-new-postal-informal-entry"),
    fr("cbp-nprm-lvs", "91 FR 64532", "Proposed rule (CBP)", "Low-Value Shipments", None, "2026-10-08",
       "https://www.federalregister.gov/documents/2026/10/08/2026-20650/low-value-shipments"),
    fr("pl-119-21", "P.L. 119-21, sec. 70531 (139 Stat. 72)", "Public Law 119-21",
       "An Act to provide for reconciliation pursuant to title II of H. Con. Res. 14 (One Big Beautiful Bill Act): section 70531 ends the de minimis exemption from July 1, 2027",
       "2025-07-04", "2025-07-04", "https://www.congress.gov/119/plaws/publ21/PLAW-119publ21.pdf", publisher="Congress.gov"),
    fr("usc-50-1702", "50 U.S.C. 1702(b)(3)", "United States Code",
       "International Emergency Economic Powers Act, section 203(b): exceptions to grant of authority (information and informational materials)",
       None, "2026-04-13",
       "https://www.govinfo.gov/content/pkg/USCODE-2023-title50/html/USCODE-2023-title50-chap35-sec1702.htm", publisher="GovInfo (U.S. Code)"),
    fr("usc-19-1305", "19 U.S.C. 1305", "United States Code",
       "Tariff Act of 1930, section 305: immoral articles; importation prohibited", None, "2025-09-24",
       "https://www.govinfo.gov/content/pkg/USCODE-2023-title19/html/USCODE-2023-title19-chap4-subtitleII-partI-sec1305.htm",
       publisher="GovInfo (U.S. Code)"),
    fr("cbp-ieepa-faq", "CBP IEEPA FAQ (last modified April 14, 2026)", "Web page",
       "International Emergency Economic Powers Act (IEEPA) Frequently Asked Questions: what are informational materials (9903.01.03, .12, .22, .31)",
       None, "2026-04-14", "https://www.cbp.gov/trade/programs-administration/trade-remedies/IEEPA-FAQ", publisher="CBP"),
    fr("csms-69326983", "CSMS # 69326983", "CSMS message", "GUIDANCE: Section 301 Forced Labor Import Duties", None, "2026-07-23",
       "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887", publisher="CBP"),
    fr("csms-69302472", "CSMS # 69302472", "CSMS message", "GUIDANCE: Section 301 Duties on Certain Products from Brazil", None,
       "2026-07-21", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42178c8", publisher="CBP"),
    fr("csms-67844987", "CSMS # 67844987", "CSMS message", "Imposing Temporary Section 122 Duties", None, "2026-02-23",
       "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b3b7b", publisher="CBP"),
    fr("hts-ch98", "HTSUS 2026 Revision 21, Chapter 98", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98", None, "2026-10-07", CH98, publisher="USITC"),
    fr("hts-ch49", "HTSUS 2026 Revision 21, Chapter 49", "Harmonized Tariff Schedule",
       "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 49", None, "2026-10-07", CH49, publisher="USITC"),
]}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


LABELS = {
    "4901": ("Printed books, brochures, leaflets & similar printed matter", "Books"),
    "4902": ("Newspapers, journals & periodicals", "Newspapers, magazines"),
    "4903": ("Children's picture, drawing & coloring books", "Children's books"),
    "4904": ("Printed or manuscript music", "Sheet music"),
    "4905": ("Maps, charts, atlases & globes", "Maps & globes"),
    "4906": ("Hand-drawn plans & drawings, manuscripts and their copies", "Plans & manuscripts"),
    "4907": ("Unused stamps, banknotes, cheque forms, stock certificates", "Stamps & banknotes"),
    "4908": ("Transfers (decals)", "Decals"),
    "4909": ("Postcards & greeting cards", "Postcards & cards"),
    "4910": ("Printed calendars", "Calendars"),
    "4911": ("Other printed matter: catalogs, posters, pictures, photos, forms", "Other printed matter"),
}

INFO = (
    "Informational materials (publications, posters, photographs, artworks and the like) entered under 9903.05.92 pay no 2026 "
    "Section 301 duty; CBP's guidance on the identically worded IEEPA exception lists all of Chapter 49 among the provisions "
    "whose goods may qualify."
)
ENDED = (
    "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026; both excepted "
    "informational materials (9903.01.31, 9903.03.11)."
)
INFO_SRC = ["csms-69326983", "cbp-ieepa-faq", "usc-50-1702"]
ENDED_SRC = ["eo-14389", "procl-11012"]

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 49: Printed Books, Newspapers, Maps, Posters & Other Printed Matter — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 49 Tariff Rates 2026: Books, Newspapers, Posters, Calendars & Printed Matter Import Duties | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 50 HTS Chapter 49 lines: books, newspapers, magazines, children's books, maps, sheet music, "
    "decals, greeting cards, calendars, catalogs and posters. Every base rate is Free; see the 2026 Section 301 duty by country "
    "and the informational-materials exemption."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 49",
    "HTS chapter 49 tariff rates",
    "printing industry tariffs",
    "commercial printing tariffs",
    "tariffs on books",
    "hs code 4901.99",
    "hs code 4911.99",
    "printed matter import duty",
    "informational materials exemption",
    "hts code for books",
]
ov["intro"] = (
    "Chapter 49 covers the products of the printing industry: **books and brochures** (4901), **newspapers and magazines** "
    "(4902), **children's picture books** (4903), sheet music, maps and globes, hand-drawn plans, unused stamps and banknotes, "
    "**decals** (4908), **postcards and greeting cards** (4909), **calendars** (4910) and other printed matter — catalogs, "
    "posters, pictures and photographs (4911). Every one of its **50 tariff lines is Free** at the general rate.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of "
    "10% or 12.5%**, but **informational materials** such as books, newspapers, maps and posters can be entered under "
    "9903.05.92 and pay none of it. China keeps its 2019 Section 301 List 4A duty of **7.5%** on most printed matter, which "
    "has no such exemption. Canada pays a **50% Section 338 duty** on non-lithographic pictures and decals even with a USMCA "
    "claim. China supplied 42% of the $5.16B imported in 2025."
)
BLURBS = {
    "4901": (
        "Books of every kind — textbooks, dictionaries, bibles and religious books, technical books, art books, hardbacks and "
        "paperbacks — plus brochures, leaflets and single printed sheets. All Free. 44% of 2025 imports ($2.28B). Brochures "
        "devoted to advertising, such as trade catalogs, are heading 4911 (chapter note 5).",
        ["textbooks", "novels", "hardbound books", "paperback books", "bibles", "dictionaries", "art books", "brochures", "leaflets"],
    ),
    "4902": (
        "Newspapers, journals and periodicals, unbound: dailies appearing at least four times a week (4902.10), other "
        "newspapers, business and professional journals and magazines (4902.90.20). All Free; newspaper supplements printed by "
        "gravure carry a 25% column 2 rate. Bound volumes are heading 4901.",
        ["newspapers", "magazines", "journals", "periodicals", "comic magazines", "newspaper supplements"],
    ),
    "4903": (
        "Children's picture, drawing and coloring books — books in which the pictures are the main interest and the text is "
        "subsidiary (chapter note 6). Free. China shipped $455M of the $506M imported in 2025, and this line is on no active "
        "China Section 301 list.",
        ["children's picture books", "coloring books", "drawing books", "board books", "activity books"],
    ),
    "4904": (
        "Printed or manuscript music, bound or not: sheet music (4904.00.00.20) and music books. Free.",
        ["sheet music", "music books", "music scores", "songbooks"],
    ),
    "4905": (
        "Printed maps, hydrographic charts and atlases in book form (4905.20), globes (4905.90.20) and wall maps and other "
        "charts (4905.90.60). Free. Maps or globes in relief are heading 9023.",
        ["maps", "atlases", "globes", "wall maps", "nautical charts", "topographic maps"],
    ),
    "4906": (
        "Original hand-drawn architectural, engineering and industrial plans and drawings, hand-written texts, and photographic "
        "or carbon copies of them. Free.",
        ["architectural drawings", "engineering plans", "manuscripts", "blueprints", "hand-drawn plans"],
    ),
    "4907": (
        "Unused postage and revenue stamps of current issue in the country where they are valid, stamp-impressed paper, "
        "banknotes, cheque forms, and stock, share or bond certificates. Free; currency and securities imported for monetary "
        "purposes need no formal entry (additional U.S. note 2). Used or collectors' stamps are heading 9704.",
        ["unused postage stamps", "banknotes", "cheque forms", "stock certificates", "bond certificates"],
    ),
    "4908": (
        "Transfers (decalcomanias): vitrifiable decals for ceramics and glass (4908.10) and other decals (4908.90), such as "
        "water-slide and dry-transfer designs. Free; Canadian 4908.90 decals pay the 50% Section 338 duty.",
        ["decals", "water slide decals", "ceramic decals", "transfer paper designs", "temporary tattoos"],
    ),
    "4909": (
        "Printed or illustrated postcards (4909.00.20) and printed cards bearing greetings, messages or announcements, with or "
        "without envelopes (4909.00.40) — birthday, Christmas and wedding cards. Free. Vietnam's largest Chapter 49 line.",
        ["postcards", "greeting cards", "Christmas cards", "birthday cards", "wedding invitations"],
    ),
    "4910": (
        "Calendars of any kind, including calendar blocks: lithographed on paper up to 0.51 mm (4910.00.20) or thicker "
        "(4910.00.40), and other calendars (4910.00.60). Free.",
        ["wall calendars", "desk calendars", "calendar blocks", "advent calendars", "printed calendars"],
    ),
    "4911": (
        "Everything else printed: trade catalogs, price lists and tourist literature (4911.10), pictures, designs, prints, "
        "posters and photographs (4911.91), and other printed matter such as forms, tickets and carnets (4911.99). Free. 34% of "
        "2025 imports ($1.74B); original engravings and prints are heading 9702.",
        ["catalogs", "posters", "art prints", "photographs", "price lists", "printed forms", "tickets", "advertising leaflets"],
    ),
}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "A pallet of hardback novels from the United Kingdom",
        "line": "4901.99.00.70",
        "body": "Hardbound books are Free at the general rate. The UK's 2026 Section 301 rate is 10% (9903.05.81), but books "
        "are informational materials: entered under 9903.05.92, a $20,000 shipment pays **$0** duty. Without that claim it "
        "would pay $2,000.",
    },
    {
        "title": "Printed books from China",
        "line": "4901.99.00.70",
        "body": "Most of 4901.99.00 is on China Section 301 List 4A (9903.88.15, U.S. note 20(s)(ii)), which charges **7.5%** "
        "and has no informational-materials exemption: **$750** on a $10,000 shipment. The 2026 Section 301 duty of 12.5% "
        "(9903.05.31) is lifted by claiming 9903.05.92; without the claim the total is $2,000. Bibles and other religious "
        "books (4901.99.00.40) are excluded from List 4A, so with the claim they pay $0.",
    },
    {
        "title": "Children's coloring books from China",
        "line": "4903.00.00.00",
        "body": "4903.00.00 was put on List 4B, which has been suspended since December 2019, so no China Section 301 list duty "
        "applies. Entered as informational materials under 9903.05.92, a $10,000 shipment pays **$0**; without the claim it "
        "pays the 12.5% 2026 Section 301 duty, $1,250. China supplied 90% of U.S. imports of these books in 2025.",
    },
    {
        "title": "Decals from Canada, with a USMCA claim",
        "line": "4908.90.00.00",
        "body": "Non-vitrifiable decals printed in Canada qualify for USMCA (a change from any other chapter), which removes "
        "Canada's 10% Section 301 duty (9903.05.93). But 4908.90.00 is on the Section 338 list (U.S. note 51(b)(3), 9903.03.14), "
        "and that 50% applies even under USMCA and has no informational-materials exemption: **$5,000** on $10,000.",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in d["understandIndustry"]["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "4901.99", "label": "Printed books, brochures and leaflets (other than dictionaries and single sheets)"},
    {"hts": "4911.99", "label": "Other printed matter n.e.s. (forms, tickets, other printed items)"},
    {"hts": "4911.91", "label": "Pictures, designs, prints, posters and photographs"},
    {"hts": "4903.00", "label": "Children's picture, drawing and coloring books"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; Comtrade does not split 4901.99 or 4911.99 further, so this page does not say which 10-digit line each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover: (a) photographic negatives or positives on transparent bases (chapter 37); "
    "(b) maps, plans or globes, in relief, whether or not printed (heading 9023); (c) playing cards or other goods of chapter "
    "95; or (d) original engravings, prints or lithographs (heading 9702), postage or revenue stamps, stamp-postmarks, "
    "first-day covers, postal stationery or the like of heading 9704, antiques of an age exceeding one hundred years or other "
    "articles of chapter 97.\n\n"
    "**Note 2.** For the purposes of chapter 49 the term \"printed\" also means reproduced by means of a duplicating machine, "
    "produced under the control of an automatic data processing machine, embossed, photographed, photocopied, thermocopied or "
    "typewritten.\n\n"
    "**Note 3.** Newspapers, journals and periodicals which are bound otherwise than in paper, and sets of newspapers, journals "
    "or periodicals comprising more than one issue under a single cover are to be classified in heading 4901, whether or not "
    "containing advertising material.\n\n"
    "**Note 4.** Heading 4901 also covers: (a) a collection of printed reproductions of, for example, works of art or drawings, "
    "with a relative text, put up with numbered pages in a form suitable for binding into one or more volumes; (b) a pictorial "
    "supplement accompanying and subsidiary to a bound volume; and (c) printed parts of books or booklets, in the form of "
    "assembled or separate sheets or signatures, constituting the whole or a part of a complete work and designed for binding. "
    "However, printed pictures or illustrations not bearing a text, whether in the form of signatures or separate sheets, fall "
    "in heading 4911.\n\n"
    "**Note 5.** Subject to note 3 of this chapter, heading 4901 does not cover publications which are essentially devoted to "
    "advertising (for example, brochures, pamphlets, leaflets, trade catalogs, yearbooks published by trade associations and "
    "tourist promotional literature). Such publications are to be classified in heading 4911.\n\n"
    "**Note 6.** For the purposes of heading 4903, the expression \"children's picture books\" means books for children in "
    "which the pictures form the principal interest and the text is subsidiary."
)
ov["notes"]["additionalUsNotes"] = (
    "**1.** For the purposes of determining the classification of printed matter produced in whole or in part by a "
    "lithographic process, the thickness of such printed matter is that of the thinnest paper contained therein, except that "
    "the thickness of a permanently mounted lithograph is the combined thickness of the lithograph and its mounting.\n\n"
    "**2.** Currency in current circulation in any country imported for monetary purposes and securities and similar evidences "
    "of value provided for in heading 4907 shall be admitted without formal customs consumption entry or the payment of duty. "
    "This does not affect any requirement under other provisions of law to the effect that transfers of monetary instruments "
    "into or through the United States, in an amount exceeding $10,000 on any one occasion, shall be reported as prescribed "
    "therein."
)

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]

# Section 232 vehicle-parts duties (9903.94.xx, 9903.74.09) reach Chapter 49 only through the importer's election to
# certify goods as vehicle parts (facts certifiedVehiclePartElection / certifiedMhdvPartElection / certifiedUkAutoPartElection,
# default no). They are not charged in the grid; listing them as in-effect duties on books would mislead, so drop them here.
S232_SRC = {"procl-10984", "csms-66665333", "fr-2025-12060", "fr-2025-18660", "fr-2025-21940", "fr-2025-17908", "fr-2026-10571"}
CLEAN_NOW = {
    "gb-section-301": "+10%",
    "eu-section-301": "10% (in place of base)",
    "kr-section-301": "12.5% (in place of base)",
    "jp-section-301": "12.5% (in place of base)",
    "tw-section-301": "10% (in place of base)",
}
tu["inEffect"] = [x for x in tu["inEffect"] if not x["id"].startswith("all-section-232")]
for x in tu["inEffect"]:
    codes = [c.strip() for c in x["ch99Code"].split("/")]
    kept = [c for c in codes if not c.startswith(("9903.94.", "9903.74."))]
    if kept != codes:
        x["ch99Code"] = " / ".join(kept)
        x["now"] = CLEAN_NOW[x["id"]]
    x["sourceIds"] = [sid for sid in x["sourceIds"] if sid not in S232_SRC]
tu["changes"] = [c for c in tu["changes"] if not c["id"].startswith("section-232-")]
tu["h1"] = "HTS Chapter 49 Tariff Updates: Books, Newspapers & Printed Matter (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 49 Tariff Updates 2026: Are Books Exempt? Section 301, Informational Materials, Canada 338, De Minimis | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for books, newspapers and other printed matter (HTS Chapter 49) since January 2025: unchanged Free base "
    "rates, the informational-materials exemption from the IEEPA, Section 122 and 2026 Section 301 tariffs, China's 7.5% List "
    "4A duty, Canada's 50% Section 338 duty and the end of de minimis."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 49 tariff updates",
    "tariffs on books 2026",
    "are books exempt from tariffs",
    "section 301 tariffs on printed books",
    "commercial printing tariffs 2026",
    "informational materials exemption tariffs",
    "USMCA printing rules",
    "de minimis books",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 50 Chapter 49 lines are **Free** in both.\n\n"
    "What changed came on top of the base rate — and for printed matter, mostly did not reach it. The law behind the 2025 "
    "IEEPA tariffs bars regulating **informational materials** (50 U.S.C. 1702(b)(3)), so books, newspapers and similar goods "
    "were excepted until those duties **ended on February 24, 2026**. The Section 122 surcharge that followed (to July 23, "
    "2026) and the **2026 Section 301 tariffs** on 60 economies (from July 24, 2026) and on Brazil (from July 22, 2026) repeat "
    "that exception: importers claim **9903.05.92** (and 9903.05.09 for Brazil). Duties without it still apply: "
    "China's **7.5% List 4A** duty, Canada's **50% Section 338** duty on decals and non-lithographic pictures, and Russia's "
    "35% rate. Separately, CBP's **de minimis** exemption for low-value parcels is now suspended for all goods, books included."
)
tu["scope"] = (
    "Measures that reach Chapter 49 from any country: the 2026 Section 301 tariffs on 60 economies and their informational-"
    "materials exemption, the Brazil Section 301 tariff, China Section 301 List 4A (List 4B is suspended), the Canada "
    "Section 338 duty, Russia's rates in lieu of column 2, the Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and "
    "Section 122 duties that have ended; plus the de minimis changes that decide how low-value printed matter enters. No "
    "Section 232 action covers a Chapter 49 line, and the 2019–2021 aircraft-dispute duty on certain UK and German printed "
    "matter (9903.89.43) is suspended. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates", "value": "Free on 50 of 50 lines", "note": "unchanged since January 2025"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "2026 and Brazil Section 301, China List 4A, Canada Section 338, Russia"},
    {"label": "Informational materials", "value": "Exempt", "note": "from the 2026 and Brazil Section 301 duties (9903.05.92, 9903.05.09)"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "cn-section-301": (
        "Two Section 301 duties. List 4A (+7.5%, 9903.88.15, since February 14, 2020) covers 43 of 50 lines — all of 4901 except "
        "bibles and religious books (4901.99.00.40), 4902, 4904–4908, postcards (4909.00.20), calendars other than thin "
        "lithographed ones (4910.00.40, .60) and most of 4911; it has no informational-materials exemption. Children's books "
        "(4903), greeting cards (4909.00.40), thin lithographed calendars (4910.00.20) and lithographs (4911.91.20, .30) were "
        "on List 4B, suspended. The 2026 action adds +12.5% (9903.05.31) on every line unless entered as informational materials "
        "(9903.05.92). USTR confirmed on October 7, 2026 that the 2018–2019 actions continue. The IEEPA duties on China, from "
        "which informational materials were excepted (9903.01.22), ended February 24, 2026.",
        "Printed books from China pay 7.5% with a 9903.05.92 claim and 20% without; children's books and religious books pay "
        "0% or 12.5%.",
        ["fr-2026-20510", "csms-69326983", "cbp-ieepa-faq", "eo-14195", "eo-14389"],
    ),
    "ca-section-301": (
        "Two duties. Section 301 (+10%, 9903.05.29) is lifted for USMCA-qualifying goods (9903.05.93) and for informational "
        "materials (9903.05.92). The Section 338 duty (+50%, 9903.03.14, Proclamation 11048) covers other decals (4908.90.00) "
        "and other pictures, designs and photographs not printed by lithography (4911.91.40) (U.S. note 51(b)(3)); it applies "
        "even when USMCA is claimed and has no informational-materials exemption. It took effect August 22, 2026 after a 3-day "
        "suspension; Proclamation 11065 kept both on the list from September 15. The 35% IEEPA duty ended February 24, 2026.",
        "Canadian books, newspapers and catalogs that qualify for USMCA enter free; decals and non-lithographic posters and "
        "photographs pay 50% with USMCA and 60% without.",
        ["eo-14389", "csms-69326983"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94); printed matter qualifies if it was printed in Mexico from "
        "materials of another chapter (General Note 11). Informational materials are also exempt under 9903.05.92. The 2025 "
        "IEEPA duty on Mexico (+25%, 9903.01.01), which excepted informational materials (9903.01.03), ended February 24, 2026.",
        "Mexican catalogs, books and other printed matter pay $0 with a USMCA claim; without one, 10% unless the goods are "
        "entered as informational materials.",
        ["eo-14389", "eo-14194", "csms-69326983"],
    ),
    "gb-section-301": (
        INFO + " The UK's own exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 49 line. "
        "The 2019–2021 aircraft-dispute duty on certain UK printed matter (9903.89.43) is suspended. " + ENDED,
        "British books, journals and maps pay $0 when entered under 9903.05.92; other UK printed matter, such as catalogs or "
        "decals not claimed as informational materials, pays 10%.",
        INFO_SRC + ENDED_SRC + ["ustr-lca-suspension"],
    ),
    "eu-section-301": (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39) — every Chapter 49 line is Free, so 10% in "
        "total. " + INFO + " This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        "Italian and German art books, catalogs and printed matter pay 10% of value, or $0 when entered as informational "
        "materials.",
        INFO_SRC + ["eo-14389"],
    ),
    "in-section-301": (
        INFO + " GSP, which once made such goods duty-free, has been expired since December 31, 2020; Chapter 49 is Free anyway. "
        + ENDED,
        "Indian books pay $0 under 9903.05.92; other printed matter pays 10%.",
        INFO_SRC + ENDED_SRC,
    ),
    "vn-section-301": (
        INFO + " " + ENDED,
        "Vietnamese greeting cards, calendars and books pay 12.5% unless entered as informational materials.",
        INFO_SRC + ENDED_SRC,
    ),
    "kr-section-301": (
        "South Korean goods pay 12.5% in total in place of a lower base rate (9903.05.71, U.S. note 52(k)); every Chapter 49 "
        "line is Free, so 12.5%. " + INFO + " " + ENDED,
        "Korean books and printed matter pay 12.5%, or $0 when entered as informational materials.",
        INFO_SRC + ENDED_SRC,
    ),
    "jp-section-301": (
        "Japanese goods pay 12.5% in total in place of a lower base rate (9903.05.49, U.S. note 52(k)); every Chapter 49 line is "
        "Free, so 12.5%. " + INFO + " " + ENDED,
        "Japanese books, manga and art prints pay $0 when entered as informational materials; other printed matter pays 12.5%.",
        INFO_SRC + ENDED_SRC,
    ),
    "hk-section-301": (
        "Products of Hong Kong pay the Hong Kong rate (9903.05.43); China's Section 301 lists apply only to products of China. "
        + INFO + " " + ENDED,
        "Books printed in Hong Kong pay $0 under 9903.05.92 and 12.5% otherwise; they do not pay China's 7.5% List 4A duty.",
        INFO_SRC + ENDED_SRC,
    ),
    "br-section-301": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). Both exempt informational materials: 9903.05.09 for the Brazil duty (U.S. note 50) and 9903.05.92 for "
        "the 2026 duty. The 40% IEEPA duty on Brazil, which also excepted them (9903.01.80), ended February 24, 2026.",
        "Brazilian books pay $0 when entered under both informational-materials headings; other Brazilian printed matter "
        "pays 37.5%.",
        ["csms-69302472", "csms-69326983", "eo-14323", "eo-14389"],
    ),
    "ru-section-301": (
        "Russia is a column 2 country. U.S. note 30(b) puts 36 Chapter 49 lines (4901, 4902, 4903, 4904, 4906, 4907, 4908.90, "
        "4909.00.20, 4910.00.20, 4911.10, 4911.91.10 and 4911.91.40) under 9903.90.08, which charges 35% in place of the column 2 "
        "rate. The 2026 Section 301 duty adds 12.5% (9903.05.66) unless the goods are entered under 9903.05.92. The 35% has no "
        "informational-materials exemption.",
        "Russian books pay 35% (47.5% without a 9903.05.92 claim); lines outside note 30(b), such as globes and calendars over "
        "0.51 mm, pay their column 2 rate.",
        ["pl-117-110", "csms-69326983"],
    ),
    "tw-section-301": (
        "Taiwanese goods pay 10% in total in place of a lower base rate (9903.05.76, U.S. note 52(k)); every Chapter 49 line is "
        "Free, so 10%. " + INFO + " " + ENDED,
        "Taiwanese books and printed matter pay 10%, or $0 when entered as informational materials.",
        INFO_SRC + ENDED_SRC,
    ),
    "other-section-301": (
        INFO + " Switzerland pays 12.5% in total when the base rate is lower — on Chapter 49, always. No country exception list in note 52(j) names a Chapter 49 line. " + ENDED,
        "Books from Malaysia, Singapore or Switzerland pay $0 when entered as informational materials; other printed matter "
        "pays 10% or 12.5%. Countries outside the 60 economies pay nothing extra.",
        INFO_SRC + ENDED_SRC,
    ),
}
for x in tu["inEffect"]:
    ex, wim, extra = IE[x["id"]]
    x["exemption"] = ex
    x["whatItMeans"] = wim
    for sid in extra:
        if sid not in x["sourceIds"]:
            x["sourceIds"].insert(-1, sid)
    if x["id"] == "ru-section-301":
        x["before"] = "35% in lieu of column 2 on 36 lines"
        x["now"] = "35% in lieu of column 2 + 12.5% (or 12.5% on the other lines)"
    if x["id"] == "cn-section-301":
        x["now"] = "+20% (7.5% + 12.5%) or +12.5%; 7.5% or 0% with 9903.05.92"
add_sources(tu, sorted({s for x in tu["inEffect"] for s in x["sourceIds"]}))

gen_changes = {c["id"]: c for c in tu["changes"]}
for c in tu["changes"]:
    if c["id"] == "base-rates":
        c["detail"] = (
            "All 50 Chapter 49 lines are Free at the general rate in the 2026 Revision 21, as in the 2025 Basic Edition; no line "
            "was added, split or renumbered."
        )
    elif c["id"].startswith("section-301-nicaragua"):
        c["date"] = "2025-12-12"
        c["dateLabel"] = "Published"
        c["title"] = "Nicaragua Section 301 tariff phases in from 2027"
        c["detail"] = (
            "USTR's action on Nicaragua adds a duty on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01, U.S. "
            "note 29): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 49 line and "
            "has no informational-materials exemption."
        )
        c["now"] = "0% in 2026 → 10% (2027) → 15% (2028)"
    elif c["id"].startswith("section-338-canada"):
        c["title"] = "Canada Section 338 duty of 50% on decals and non-lithographic pictures"
        c["detail"] = (
            "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which "
            "include two Chapter 49 subheadings: other decals (4908.90.00) and pictures, designs and photographs not printed by "
            "lithography (4911.91.40, posters and other). It is charged even when USMCA is claimed, on top of the 10% Section "
            "301 duty on non-USMCA goods, and has no informational-materials exemption. Planned for August 19, it took effect "
            "August 22 after a 3-day suspension (Proclamation 11056)."
        )
        c["before"] = "None"
    elif c["id"].startswith("section-301-2026-60"):
        c["title"] = "Section 301 tariffs on 60 economies, with an informational-materials exemption"
        c["detail"] = (
            "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), every Chapter 49 line included. No Chapter "
            "49 line is on the general exemption list (U.S. note 52(b)) or any country list (52(j)), but heading 9903.05.92 "
            "exempts articles that are informational materials — publications, posters, photographs, artworks and the like. "
            "EU goods pay 10% in total and Japanese and Korean goods 12.5% in total; USMCA-qualifying goods are exempt "
            "(9903.05.93, 9903.05.94)."
        )
        c["before"] = "None"
    elif c["id"].startswith("section-301-brazil"):
        c["title"] = "Section 301 tariff on products of Brazil"
        c["detail"] = (
            "25% on all goods of Brazil (9903.05.01), with informational materials exempt (9903.05.09, U.S. note 50). From July 24 "
            "the 12.5% 2026 action (9903.05.27) is added on top, with its own informational-materials exemption (9903.05.92)."
        )
        c["before"] = "None"

NEW_CHANGES = [
    {
        "id": "lvs-nprm", "type": "pending", "date": "2026-10-08", "dateLabel": "Proposed",
        "title": "CBP proposes new entry rules for low-value and mail shipments",
        "detail": "CBP proposed to change filing requirements for informal entries of goods valued at $2,500 or less, create an "
        "electronic informal entry type for mail (type 13) and add bonding requirements. Comments are due December 7, 2026. It "
        "would change how small shipments of books and printed matter are entered, not their duty rate.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["cbp-nprm-lvs"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 4A continues",
        "detail": "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
        "four-year review. For Chapter 49 this keeps +7.5% (9903.88.15) on 43 of 50 lines, including most books, newspapers, "
        "catalogs and posters.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-338-scope", "type": "reference", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Section 338 list revised; both Chapter 49 subheadings stay on it",
        "detail": "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. 4908.90.00 and "
        "4911.91.40 remain in U.S. note 51(b)(3) in Revision 21.",
        "before": "+50%", "now": "+50%", "countries": "Canada",
        "sourceIds": ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in "
        "force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "dm-ifr", "type": "reference", "date": "2026-06-24", "dateLabel": "Effective",
        "title": "CBP suspends de minimis indefinitely, for all goods",
        "detail": "Two interim final rules suspend the $800 de minimis exemption in CBP's regulations: 19 CFR 10.151(b) for "
        "every mode except mail, and 19 CFR 145.31(b) for mail, until CBP announces otherwise. Unlike the executive orders, "
        "the revised regulations carry no exception for informational materials. Low-value shipments of books now need a "
        "formal or informal entry; the new postal informal entry process took effect July 24, 2026. The duty rate on Chapter "
        "49 goods is unchanged (Free, plus any extra duty that applies).",
        "before": "Free under de minimis up to $800", "now": "Entry required", "countries": "All",
        "sourceIds": ["cbp-ifr-dm", "cbp-ifr-mail"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. Informational materials were exempt "
        "(9903.03.11), as were USMCA-qualifying goods from Canada and Mexico.",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All",
        "sourceIds": ["procl-11012", "csms-67844987", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP "
        "stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings "
        "are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "dm-continued", "type": "reference", "date": "2026-02-20", "dateLabel": "Signed",
        "title": "De minimis suspension continued after the IEEPA ruling",
        "detail": "Executive Order 14388 kept duty-free de minimis treatment suspended for all countries, still excepting "
        "articles covered by 50 U.S.C. 1702(b) — donations and informational materials.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["eo-14388"],
    },
    {
        "id": "dm-suspended", "type": "reference", "date": "2025-08-29", "dateLabel": "Effective",
        "title": "De minimis suspended for all countries, except informational materials",
        "detail": "Executive Order 14324 ended duty-free de minimis treatment for shipments of any value, origin or mode, except "
        "articles covered by 50 U.S.C. 1702(b). CBP's implementing notice said the exemption continued for donations and "
        "informational materials entered through release from manifest (U.S. note 2(y) to Chapter 99 subchapter III).",
        "before": "Free under de minimis up to $800", "now": "Entry required, except informational materials", "countries": "All",
        "sourceIds": ["eo-14324", "cbp-dm-2025", "hts-chapter-99"],
    },
    {
        "id": "br-ieepa", "type": "extraDuty", "date": "2025-07-30", "dateLabel": "Signed",
        "title": "Additional duty on products of Brazil",
        "detail": "+40% (9903.01.77) on goods of Brazil, excepting articles covered by 50 U.S.C. 1702(b), including "
        "informational materials (9903.01.80). Ended February 24, 2026.",
        "before": "None", "now": "+40% (ended)", "countries": "Brazil", "sourceIds": ["eo-14323"],
    },
    {
        "id": "dm-statute", "type": "reference", "date": "2025-07-04", "dateLabel": "Signed",
        "title": "Law ends the de minimis exemption from July 1, 2027",
        "detail": "Section 70531 of P.L. 119-21 terminates the de minimis exemption of 19 U.S.C. 1321(a)(2)(C) effective July 1, "
        "2027, as CBP's 2026 rules note.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["pl-119-21", "cbp-ifr-dm"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries — informational materials excepted",
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Section 3(b) excepted "
        "all articles encompassed by 50 U.S.C. 1702(b): informational materials were entered under 9903.01.31, and U.S. "
        "note 2(v)(iii)(a) (9903.01.32) lists most Chapter 49 subheadings — 4901, 4902, 4903, 4904, 4905, 4906, 4911.10 and "
        "4911.99.60/.80. "
        "Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14257", "cbp-ieepa-faq", "hts-chapter-99"],
    },
    {
        "id": "ieepa-feb", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "IEEPA duties on Canada, Mexico and China — informational materials excepted",
        "detail": "+25% on non-USMCA goods of Canada and Mexico and +10% (later 20%, then 10%) on goods of China. Each order "
        "excluded articles encompassed by 50 U.S.C. 1702(b); CBP set up 9903.01.03 (Mexico), 9903.01.12 (Canada) and "
        "9903.01.22 (China and Hong Kong) for informational materials and said Chapter 49 goods may qualify. Ended February 24, "
        "2026.",
        "before": "None", "now": "+25% / +10% (ended)", "countries": "Canada, Mexico, China",
        "sourceIds": ["eo-14193", "eo-14194", "eo-14195", "cbp-ieepa-faq", "usc-50-1702"],
    },
]
have_ids = {c["id"] for c in tu["changes"]}
for c in NEW_CHANGES:
    if c["id"] not in have_ids:
        tu["changes"].append(c)
add_sources(tu, sorted({s for c in tu["changes"] for s in c["sourceIds"]}))
tu["changes"].sort(key=lambda c: c["date"], reverse=True)
used = {sid for x in tu["inEffect"] for sid in x["sourceIds"]} | {sid for c in tu["changes"] for sid in c["sourceIds"]}
tu["sources"] = [s_ for s_ in tu["sources"] if s_["id"] not in S232_SRC or s_["id"] in used]

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 49: Books, Newspapers & Printed Matter — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 49 Import Statistics: U.S. Book & Printed Matter Imports by Country (China, Canada, Mexico, UK) | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of books, newspapers, children's books, greeting cards, calendars and other printed matter, 2020–2025, by "
    "country, product and year: $5.16B in 2025, down 7.7%; China supplied 42%, Canada 12%, Mexico 9% and the UK 8%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 49 import statistics",
    "US book imports by country",
    "books printed in China imports",
    "printing industry imports",
    "printed matter imports",
    "children's books imports from China",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    "U.S. imports of Chapter 49 goods fell from **$5.59B in 2024 to $5.16B in 2025** (−7.7%), below the 2022 peak of $5.83B "
    "but well above the $4.03B of 2020. **Books (4901) held steady at $2.28B** — 44% of the total — while most other groups "
    "shrank: greeting cards and postcards fell 35% to $265M, children's books 13% to $506M, newspapers and periodicals 30% "
    "to $102M and unused stamps and banknotes 45% to $45M. Other printed matter (4911: catalogs, posters, pictures, forms) was "
    "$1.74B, down 5%.\n\n"
    "**China supplied $2.16B (42%)**, down 9%: $833M of books, $644M of other printed matter, **$455M of children's books** "
    "— 90% of that line — and $152M of cards. **Canada ($598M) and Mexico ($459M)** ship mostly catalogs and other printed "
    "matter (4911) and fell 12% and 10%. The **UK ($430M, 8%)** is the second book supplier. Italy (+12%), India (+5%) and "
    "Japan (+33%) grew; Spain fell from $140M to $38M.\n\n"
    "Through 2025 most printed matter paid no IEEPA duty because informational materials were excepted, so China's 7.5% "
    "List 4A duty was the main extra cost. Since July 24, 2026 the Section 301 tariff on 60 economies applies to goods not "
    "entered as informational materials. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 49 Tariff Rates by Country: Books, Newspapers & Printed Matter"
ia["seo"]["title"] = "Tariffs on Books & Printed Matter by Country: China, Canada, Mexico, UK, Japan, EU (HTS Ch. 49) | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on books, newspapers, children's books, greeting cards, calendars, decals and other printed matter "
    "by country: Free base rate plus the 2026 Section 301 duty, China's List 4A duty and Canada's Section 338 duty, with "
    "USMCA and the informational-materials exemption explained."
)
ia["seo"]["keywords"] = [
    "tariffs on books from china",
    "tariffs on books from uk",
    "tariffs on books from canada",
    "tariffs on books from japan",
    "tariffs on books from europe",
    "printing industry tariffs by country",
    "HTS chapter 49 import duty by country",
]
ia["intro"] = (
    "Every Chapter 49 line is Free, so the total rate is **the extra duty for the country of origin**. Each cell below is that "
    "total for the product group, computed from the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Most cells show two totals. **\"Informational materials\"** is the rate when the goods are entered as informational materials — "
    "books, newspapers, maps, music, posters and similar publications claimed under **9903.05.92** (and 9903.05.09 for "
    "Brazil) — which removes the 2026 Section 301 duty and Brazil's 25%. **\"Not informational materials\"** is the rate without that claim. A "
    "claim does not remove **China's 7.5% List 4A duty** on most lines (so Chinese books pay 7.5%, not Free) or **Canada's 50% "
    "Section 338 duty** on decals and non-lithographic pictures, which applies even to USMCA goods."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULE_LABELS = {
    "China": "Free base rate plus 7.5% List 4A (9903.88.15) on 43 of 50 lines and 12.5% (9903.05.31) on all: 20% on most books, newspapers, catalogs and posters, 12.5% on children's books, religious books, greeting cards and lithographs. A 9903.05.92 informational-materials claim removes the 12.5%, not the 7.5%.",
    "Canada": "USMCA-qualifying: Free, except 50% Section 338 (9903.03.14) on other decals (4908.90) and non-lithographic pictures (4911.91.40), which USMCA does not lift. Otherwise 10% Section 301 (9903.05.29) plus the 50% on those two subheadings; 9903.05.92 removes the 10% for informational materials.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise 10% Section 301 (9903.05.55), which a 9903.05.92 claim removes for informational materials. The 25% IEEPA duty ended February 24, 2026.",
    "United Kingdom": "10% Section 301 (9903.05.81) on every line; a 9903.05.92 claim removes it for books, newspapers, maps and other informational materials. The UK's exception list does not reach Chapter 49.",
    "Italy": "EU: 10% in total in place of the Free base rate (9903.05.39); a 9903.05.92 claim removes it for informational materials. The 15% IEEPA rate ended February 24, 2026.",
    "India": "10% Section 301 (9903.05.44) on every line; a 9903.05.92 claim removes it for informational materials. GSP has expired; the IEEPA duties ended February 24, 2026.",
    "Vietnam": "12.5% Section 301 (9903.05.84) on every line; a 9903.05.92 claim removes it for informational materials.",
    "Germany": "EU: 10% in total in place of the Free base rate (9903.05.39); a 9903.05.92 claim removes it for informational materials. The aircraft-dispute duty on certain German printed matter (9903.89.43) is suspended.",
    "South Korea": "12.5% in total in place of the Free base rate (9903.05.71); a 9903.05.92 claim removes it for informational materials.",
    "Japan": "12.5% in total in place of the Free base rate (9903.05.49); a 9903.05.92 claim removes it for informational materials.",
    "Hong Kong": "12.5% Section 301 (9903.05.43) on every line; a 9903.05.92 claim removes it for informational materials. China's List 4A does not apply to products of Hong Kong.",
    "Brazil": "25% (9903.05.01) plus 12.5% (9903.05.27) on every line: 37.5% for goods not entered as informational materials; Free for informational materials (9903.05.09 and 9903.05.92 lift both).",
    "Any other country": "From the Free base rate alone (countries outside the 60 Section 301 economies) to 12.5% (9903.05.20–9903.05.83), which a 9903.05.92 claim removes for informational materials. No country exception list names a Chapter 49 line. Russia (column 2) pays 35% on 36 lines (9903.90.08) plus 12.5%.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    for sid in ("csms-69326983", "eo-14389"):
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].insert(-1, sid)
    if c["country"] == "Brazil" and "csms-69302472" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].insert(-1, "csms-69302472")
    if c["country"] == "Any other country" and "procl-10523" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].insert(-1, "procl-10523")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Informational materials: the \"informational materials\" totals assume the goods are entered under 9903.05.92 (and, for "
    "Brazil, 9903.05.09); the \"not informational materials\" totals assume no such claim. CBP decides whether a product qualifies. China's List "
    "4A (9903.88.15), Canada's Section 338 (9903.03.14) and Russia's 9903.90.08 rate have no such exemption.",
    "Section 232 vehicle-parts duties (9903.94.xx, 9903.74.09) reach Chapter 49 goods only if the importer elects to certify "
    "them as automobile or truck parts (U.S. notes 33 and 38); no election is assumed.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied. Both excepted informational materials.",
    "China List 4B (9903.88.16) and the 2019–2021 aircraft-dispute duty on certain UK and German printed matter "
    "(9903.89.43) are suspended and not applied.",
    "Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed; no Chapter 49 line is on the "
    "September 29, 2026 import-ban annexes.",
    "Not in the grid: entry rules — the de minimis exemption is suspended for all goods, obscene or treasonous matter is "
    "prohibited (19 U.S.C. 1305), piratical copies can be detained — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 49 code is "
    "on the note 52(b) general list or any note 52(j) country list, but heading 9903.05.92 exempts informational materials from "
    "the 2026 Section 301 duties, and 9903.05.09 does the same for the Brazil duty (note 50); CBP's IEEPA guidance lists all of "
    "Chapter 49 as goods that may qualify for the identically worded exception. Note 51(b)(3) puts 4908.90.00 and 4911.91.40 on "
    "the Canada Section 338 list, with no informational-materials heading. Note 20(s) puts 43 Chapter 49 lines on China List "
    "4A, excluding 4901.99.00.40 (religious books); note 20(u) (List 4B, suspended) holds 4903, 4909.00.40, 4910.00.20, "
    "4911.91.20 and 4911.91.30. Note 30(b) sets Russia's 35% on 36 lines. No Section 232 heading covers a Chapter 49 line."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "csms-69326983", "csms-69302472", "cbp-ieepa-faq",
                 "procl-10523", "procl-11062", "ustr-lca-suspension", "usc-19-1305"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Books & Printed Matter (HTS Ch. 49): Entry Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Books & Printed Matter into the U.S.: Informational-Materials Exemption, USMCA, De Minimis & Entry Rules (HTS Ch. 49) | KoalaGains"
te["seo"]["shortDescription"] = (
    "How to import books, newspapers, catalogs and other printed matter: claim 9903.05.92 for informational materials, "
    "USMCA for printing done in Canada or Mexico, Chapter 98 provisions for institutions and the blind, plus CBP rules on "
    "de minimis, marking, piratical copies and prohibited matter."
)
te["seo"]["keywords"] = [
    "informational materials exemption tariffs",
    "9903.05.92",
    "importing books into usa",
    "importing books from china",
    "USMCA printed matter rule of origin",
    "books for the blind duty free 9817.00.92",
    "commercial printing tariff engineering",
]
te["intro"] = (
    "Chapter 49 has no base-rate duty to save, so the levers are about the **extra duties**. The biggest is a claim, not a "
    "change of product: books, newspapers, maps, music and other **informational materials** entered under **9903.05.92** "
    "pay no 2026 Section 301 duty, and Brazilian ones also claim 9903.05.09. Printing done in **Canada or Mexico** qualifies "
    "for USMCA. Some **Chapter 98** provisions (books for the blind, materials for schools and religious institutions, "
    "foreign government documents) take goods out of the extra duties entirely.\n\n"
    "Entry rules matter as much: CBP's **de minimis** exemption is suspended for all goods, so even a single parcel of books "
    "needs an entry; printed matter must be **marked with its country of origin**; CBP can detain **piratical copies** of "
    "recorded copyrighted works; and **obscene or treasonous matter** is prohibited (19 U.S.C. 1305)."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "info-materials",
        "title": "Enter informational materials under 9903.05.92 (and 9903.05.09 for Brazil)",
        "saves": "The whole 10%–12.5% 2026 Section 301 duty, and for Brazil the 25% Brazil duty too",
        "appliesTo": "Books, newspapers, periodicals, children's books, music, maps, posters, photographs and other publications "
        "from any of the 60 economies or Brazil",
        "document": "Report 9903.05.92 (and 9903.05.09 for Brazil) on the entry line with the Chapter 49 number, in the order "
        "CBP sets: Chapter 98 provision, then the Chapter 99 numbers, then the Chapter 1–97 number. Keep a description of "
        "the goods that shows they are publications or similar informational materials.",
        "caveat": "It does not lift China's 7.5% List 4A duty, Canada's 50% Section 338 duty, Russia's 35% rate or the "
        "Nicaragua duty from 2027. CBP decides whether goods are informational materials; its IEEPA guidance says Chapter 49 "
        "goods may qualify, which is not a guarantee for every product (for example blank-form or advertising matter).",
        "citations": [
            {"label": "HTSUS 9903.05.92, 9903.05.09 (U.S. notes 50, 52)", "url": CH99},
            {"label": "CBP CSMS # 69326983 (Section 301, 60 economies)", "url": "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887"},
            {"label": "CBP CSMS # 69302472 (Section 301, Brazil)", "url": "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42178c8"},
            {"label": "CBP IEEPA FAQ: what are informational materials", "url": "https://www.cbp.gov/trade/programs-administration/trade-remedies/IEEPA-FAQ"},
            {"label": "50 U.S.C. 1702(b)(3)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title50/html/USCODE-2023-title50-chap35-sec1702.htm"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on printing done in Canada or Mexico",
        "saves": "The 10% Section 301 duty for Canada or Mexico on goods that are not entered as informational materials, such "
        "as catalogs, calendars and greeting cards",
        "appliesTo": "All 50 lines; the Chapter 49 rule is a change to headings 4901–4911 from any other chapter, so printing "
        "on imported paper (Chapter 48) in Canada or Mexico qualifies",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the information "
        "listed in 19 CFR 182.12.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on 4908.90 and 4911.91.40 (U.S. note 51(a)). "
        "Reprinting or repackaging finished printed matter is not a change of chapter. The USMCA was not renewed at the July "
        "1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (Chapter 49 rule)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "chapter-98",
        "title": "Use a Chapter 98 provision where the importer or use qualifies",
        "saves": "The 2026 Section 301 duty, the Brazil duty and the Canada Section 338 duty, which do not apply to goods "
        "properly entered under Chapter 98 (other than 9802 and USMCA subchapter XXIII)",
        "appliesTo": "Printed matter for public libraries, nonprofit educational institutions, religious institutions or the blind; foreign government "
        "documents; U.S.-printed goods returned",
        "document": "The Chapter 98 number on the entry line, plus what the provision requires — e.g. the institution's "
        "status or a certification for 9817.00.40–.48 materials under the Nairobi Protocol to the Florence Agreement.",
        "caveat": "Each provision has conditions; CBP must agree the entry is appropriate. Russia's 9903.90.08 rate also does "
        "not apply to Chapter 98 entries.",
        "provisions": [
            {"code": "9817.00.92", "rate": "Free", "text": "Books, music and pamphlets in raised print, used exclusively by or for the blind"},
            {"code": "9810.00.05", "rate": "Free", "text": "Drawings, lithographs and other prints for an institution established solely for religious purposes"},
            {"code": "9810.00.30", "rate": "Free", "text": "Drawings, plans, lithographs, globes and other prints for public libraries and nonprofit educational, scientific or literary institutions"},
            {"code": "9809.00.10", "rate": "Free", "text": "Public documents issued by a foreign government or an international organization"},
            {"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned without having been advanced in value abroad"},
        ],
        "citations": [
            {"label": "HTSUS Chapter 98 (subchapters I, IX, X, XVII)", "url": CH98},
            {"label": "HTSUS Ch. 99, U.S. notes 50(a), 51(a), 52(a)", "url": CH99},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling where the line decides the China duty",
        "saves": "China's 7.5% List 4A duty, on lines outside it",
        "appliesTo": "Chinese printed matter on the 4901/4903, 4909.00.20/.40, 4910 and 4911.91 boundaries: children's picture "
        "books (4903), religious books (4901.99.00.40), greeting cards (4909.00.40), thin lithographed calendars (4910.00.20) "
        "and lithographs (4911.91.20, .30) are on no active China list",
        "document": "A ruling request to CBP with a sample or full description (19 CFR part 177).",
        "caveat": "Classification follows the goods, not the duty: a coloring book is 4903 only if the pictures are the main "
        "interest (chapter note 6), and advertising brochures are 4911, not 4901 (note 5).",
        "citations": [
            {"label": "19 CFR 177.2", "url": "https://www.ecfr.gov/current/title-19/section-177.2"},
            {"label": "HTSUS Chapter 49 notes", "url": CH49},
            {"label": "HTSUS Ch. 99, U.S. note 20(s), (u)", "url": CH99},
        ],
    },
]
te["rules"] = [
    {
        "id": "de-minimis", "agency": "CBP",
        "title": "De minimis suspended: shipments of $800 or less need a formal or informal entry, by mail or courier",
        "citations": [
            {"label": "19 CFR 10.151(b)", "url": "https://www.ecfr.gov/current/title-19/section-10.151"},
            {"label": "19 CFR 145.31(b)", "url": "https://www.ecfr.gov/current/title-19/section-145.31"},
        ],
    },
    {
        "id": "mail-entry", "agency": "CBP",
        "title": "Mail shipments: formal entry when Chapter 99 duties apply or a Chapter 98 or FTA claim is made; postal informal entry otherwise",
        "citations": [{"label": "19 CFR 145.12", "url": "https://www.ecfr.gov/current/title-19/section-145.12"}],
    },
    {
        "id": "prohibited-matter", "agency": "CBP",
        "title": "Obscene matter and matter urging treason or insurrection are prohibited; seized matter goes to forfeiture",
        "citations": [
            {"label": "19 U.S.C. 1305", "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title19/html/USCODE-2023-title19-chap4-subtitleII-partI-sec1305.htm"},
            {"label": "19 CFR 12.40", "url": "https://www.ecfr.gov/current/title-19/section-12.40"},
        ],
    },
    {
        "id": "piratical", "agency": "CBP",
        "title": "Piratical copies of copyrighted works recorded with CBP can be detained and seized",
        "citations": [
            {"label": "19 CFR 133.42", "url": "https://www.ecfr.gov/current/title-19/section-133.42"},
        ],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on each article (e.g. \"Printed in China\") or, where excepted, its outermost container",
        "citations": [
            {"label": "19 CFR 134.11", "url": "https://www.ecfr.gov/current/title-19/section-134.11"},
            {"label": "19 CFR 134.33 (J-list)", "url": "https://www.ecfr.gov/current/title-19/section-134.33"},
        ],
    },
    {
        "id": "currency-report", "agency": "FinCEN / CBP",
        "title": "Currency and monetary instruments over $10,000 must be reported; heading 4907 currency and securities imported for monetary purposes need no formal entry",
        "citations": [
            {"label": "31 CFR 1010.340", "url": "https://www.ecfr.gov/current/title-31/section-1010.340"},
            {"label": "HTSUS Chapter 49, additional U.S. note 2", "url": CH49},
        ],
    },
    {
        "id": "aphis-packaging", "agency": "USDA APHIS",
        "title": "Wood pallets and crates must be ISPM 15 treated and marked",
        "citations": [{"label": "7 CFR 319.40-3", "url": "https://www.ecfr.gov/current/title-7/section-319.40-3"}],
    },
]
GROUP_NOTES = {
    "4901": "Free. Claim 9903.05.92 to remove the 2026 Section 301 duty; Chinese books still pay 7.5% List 4A except religious books. Mark each book with its country of origin.",
    "4902": "Free. Newspapers and periodicals are informational materials (9903.05.92); Chinese ones pay 7.5% List 4A.",
    "4903": "Free and on no active China list. Claim 9903.05.92 to remove the 2026 Section 301 duty.",
    "4904": "Free. Sheet music and music books are informational materials (9903.05.92); 7.5% List 4A from China.",
    "4905": "Free. Maps, atlases and globes: claim 9903.05.92; 7.5% List 4A from China. Relief maps are 9023.",
    "4906": "Free. Plans, drawings and manuscripts; 7.5% List 4A from China.",
    "4907": "Free. Currency and securities for monetary purposes need no formal entry, but amounts over $10,000 must be reported.",
    "4908": "Free. Canadian 4908.90 decals pay 50% Section 338 even with USMCA; 7.5% List 4A from China.",
    "4909": "Free. Greeting cards (4909.00.40) are on no active China list; postcards are on List 4A.",
    "4910": "Free. Calendars over 0.51 mm and non-lithographed ones are on China List 4A; thin lithographed calendars are not.",
    "4911": "Free. Catalogs, posters and pictures: Canadian 4911.91.40 pays 50% Section 338; lithographs 4911.91.20/.30 are on no active China list.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    ids = ["de-minimis", "mail-entry", "prohibited-matter", "cbp-marking", "aphis-packaging"]
    if h in ("4901", "4902", "4903", "4904", "4905", "4911"):
        ids.insert(3, "piratical")
    if h == "4907":
        ids.insert(0, "currency-report")
    g["ruleIds"] = ids
NOT_ON_CHINA_LIST = ("4901.99.00.40", "4903", "4909.00.40", "4910.00.20", "4911.91.20", "4911.91.30")
CH98_HEADINGS = ("4901", "4902", "4903", "4904", "4905", "4906", "4911")
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    ids = ["de-minimis", "mail-entry", "prohibited-matter"]
    if h in ("4901", "4902", "4903", "4904", "4905", "4911"):
        ids.append("piratical")
    if h == "4907":
        ids.append("currency-report")
    ids += ["cbp-marking", "aphis-packaging"]
    ln["ruleIds"] = ids
    levers = []
    if h != "4907":
        levers.append("info-materials")
    levers.append("usmca")
    if h in CH98_HEADINGS:
        levers.append("chapter-98")
    if hts.startswith(NOT_ON_CHINA_LIST) or h in ("4901", "4909", "4910", "4911"):
        levers.append("ruling")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Whether goods are informational "
    "materials is decided by CBP on the facts of each entry; check the CSMS guidance before filing."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 49 FAQ: Tariffs on Books, Magazines, Posters & Printed Matter"
fc["seo"]["title"] = "Are Books Exempt from Tariffs? HTS Chapter 49 FAQ 2026: HS Codes for Books, Posters, Greeting Cards, Catalogs | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing printed matter: are books exempt from tariffs, tariffs on books from "
    "China, the UK, Canada and Japan, HS codes 4901.99 and 4911.99, posters, greeting cards, catalogs, labels, magazines and "
    "de minimis."
)
fc["seo"]["keywords"] = [
    "are books exempt from tariffs",
    "tariffs on books from china",
    "tariffs on books from uk",
    "hs code for books",
    "hs code 4901.99",
    "hs code 4911.99",
    "hs code for posters",
    "hs code for greeting cards",
    "hs code for brochures",
    "tariffs on magazines",
    "hs code for printed labels",
    "de minimis books",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing books, magazines, posters, cards, catalogs and other "
    "printed matter into the U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full "
    "detail."
)
fc["keyTakeaways"] = [
    "Every Chapter 49 line — books, newspapers, maps, cards, calendars, catalogs, posters — is Free at the general rate, unchanged since January 2025.",
    "Informational materials entered under 9903.05.92 pay no 2026 Section 301 duty (and 9903.05.09 lifts Brazil's 25%); without the claim, most suppliers pay 10% or 12.5%.",
    "China's 7.5% Section 301 List 4A duty still applies to most Chinese books and printed matter; children's books, religious books, greeting cards and lithographs are on no active China list.",
    "Canada's 50% Section 338 duty hits decals (4908.90) and non-lithographic pictures (4911.91.40) even with USMCA; other USMCA printing enters free.",
    "The IEEPA tariffs never reached informational materials and ended February 24, 2026; de minimis is now suspended for all goods, so low-value book parcels need an entry.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "books-exempt",
        "question": "Are books exempt from U.S. tariffs?",
        "searchedAs": ["are books exempt from tariffs", "are books exempt from tariffs us", "are books still exempt from tariffs", "books tariff exempt", "do tariffs apply to books"],
        "answer": "Books have no base duty: every line of heading 4901 is Free. The 2026 Section 301 tariffs on 60 economies (10% or 12.5%) do not apply to informational materials entered under 9903.05.92, and Brazil's 25% Section 301 duty has the same exemption (9903.05.09). Two duties have no such exemption: China's 7.5% List 4A duty, which covers most books from China, and Russia's 35% rate. So a UK or Japanese book entered under 9903.05.92 pays $0, and a Chinese one 7.5%.",
        "link": "tariff-updates",
    },
    {
        "id": "reciprocal-books",
        "question": "Were books exempt from Trump's reciprocal and IEEPA tariffs?",
        "searchedAs": ["are books exempt from trump tariffs", "are books exempt from reciprocal tariffs", "do trump's tariffs apply to books"],
        "answer": "Yes. IEEPA does not allow the President to regulate imports of informational materials (50 U.S.C. 1702(b)(3)), so each 2025 IEEPA order excluded them. Importers used 9903.01.31 for the reciprocal tariff and 9903.01.03, .12 and .22 for Mexico, Canada and China, and CBP said Chapter 49 goods may qualify. Those tariffs ended on February 24, 2026, after the Supreme Court ruled IEEPA does not authorize tariffs.",
        "link": "tariff-updates",
    },
    {
        "id": "books-china",
        "question": "What is the tariff on books printed in China?",
        "searchedAs": ["tariffs on books from china", "tariff on books from china", "are there tariffs on books from china", "tariffs on books printed in china", "us tariff on books from china"],
        "answer": "Most books from China (4901.99.00) pay 7.5% under Section 301 List 4A (9903.88.15) plus 12.5% under the 2026 Section 301 action (9903.05.31): 20%, or 7.5% when entered as informational materials under 9903.05.92. Bibles and religious books (4901.99.00.40) are excluded from List 4A and pay 12.5% or $0. China shipped $833M of books in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "childrens-books",
        "question": "Are children's books exempt from tariffs?",
        "searchedAs": ["are children's books exempt from tariffs"],
        "answer": "Children's picture, drawing and coloring books (4903.00.00) are Free and are on no active China Section 301 list — List 4B, which named them, is suspended. From China and the other 60 economies they pay 10% or 12.5% under the 2026 Section 301 action unless entered as informational materials under 9903.05.92. China supplied 90% of the $506M imported in 2025.",
        "link": "",
    },
    {
        "id": "books-uk-europe-japan",
        "question": "What are the tariffs on books from the UK, Europe and Japan?",
        "searchedAs": ["tariffs on books from uk", "tariffs on books from uk to us", "tariffs on books from europe", "tariffs on books from japan", "are books from japan exempt from tariffs"],
        "answer": "The base rate is Free. The 2026 Section 301 duty is 10% for the UK (9903.05.81), 10% in total for EU countries (9903.05.39) and 12.5% in total for Japan (9903.05.49) — but books, journals and other informational materials entered under 9903.05.92 pay none of it. The 2025 IEEPA rates on these countries ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "books-canada",
        "question": "Are there tariffs on books from Canada?",
        "searchedAs": ["tariffs on books from canada", "books tariffs canada"],
        "answer": "Not on books that qualify for USMCA: printing in Canada on paper from another chapter qualifies, and USMCA goods are exempt from Canada's 10% Section 301 duty (9903.05.93). Books are also informational materials (9903.05.92). Canada's 50% Section 338 duty does not cover books; it covers decals (4908.90) and non-lithographic pictures and posters (4911.91.40), even with USMCA.",
        "link": "tariff-updates",
    },
    {
        "id": "hs-books",
        "question": "What is the HTS code for books?",
        "searchedAs": ["hts code for books", "hs code for books", "hs code for books usa", "harmonized tariff code for books", "hs code 4901.99", "hts code 4901.99", "hs code 4901"],
        "answer": "Heading 4901. Single printed sheets are 4901.10, dictionaries and encyclopedias 4901.91, and other books 4901.99.00, with statistical suffixes for textbooks (.10), bibles and religious books (.40), technical books (.50), art books (.60/.65), hardbound books (.70), rack-size paperbacks (.75) and others by page count (.91–.93). Children's picture books are 4903; brochures devoted to advertising and trade catalogs are 4911. All are Free.",
        "link": "",
    },
    {
        "id": "hs-4911",
        "question": "What does HS code 4911 cover (4911.10, 4911.91, 4911.99)?",
        "searchedAs": ["hs code 4911.99", "hs code 4911.91", "hs code 4911.10", "hs code 4911", "hts code 4911.99"],
        "answer": "Printed matter not covered elsewhere in Chapter 49: 4911.10 trade advertising material, commercial catalogs, price lists and tourist literature; 4911.91 pictures, designs and photographs, including posters, split by age, lithography and thickness; 4911.99 other printed matter — carnets (.20), lithographed items (.60) and other (.80). All Free; 4911 was $1.74B of 2025 imports.",
        "link": "",
    },
    {
        "id": "hs-posters",
        "question": "What is the HS code for posters and art prints?",
        "searchedAs": ["hs code for posters", "hs code for posters paper", "hs code for poster print", "hs code for art posters", "hs tariff code for posters"],
        "answer": "Printed posters and art prints are 4911.91: lithographed posters printed in the last 20 years are 4911.91.20.20 (up to 0.51 mm thick), other posters 4911.91.40.20, and pictures over 20 years old 4911.91.10. Original engravings, prints and lithographs are 9702. All 4911.91 lines are Free; posters are named in the informational-materials headings, but Canadian 4911.91.40 posters pay the 50% Section 338 duty.",
        "link": "",
    },
    {
        "id": "hs-greeting-cards",
        "question": "What is the HS code for greeting cards?",
        "searchedAs": ["hs code for greeting cards", "hs code for christmas cards", "us hs code for greeting cards", "greeting cards tariff code"],
        "answer": "4909.00.40.00 — printed cards bearing personal greetings, messages or announcements, with or without envelopes; printed postcards are 4909.00.20. Both are Free. Greeting cards from China are on no active Section 301 list (List 4B is suspended) and pay 12.5% under the 2026 action; Vietnamese cards also 12.5%.",
        "link": "industry-areas",
    },
    {
        "id": "hs-catalogs-brochures",
        "question": "What is the HS code for catalogs and brochures?",
        "searchedAs": ["hs code for catalogs", "hs code for catalogues", "hs code for brochures", "hs code for marketing brochures", "hs code for advertising brochures"],
        "answer": "Trade catalogs, price lists and brochures devoted to advertising are 4911.10 (chapter note 5); brochures and leaflets that are not advertising are 4901.10 or 4901.99. Both are Free. Canada and Mexico shipped mostly 4911 goods in 2025, and USMCA-qualifying catalogs enter free.",
        "link": "",
    },
    {
        "id": "magazines",
        "question": "Are there tariffs on magazines and newspapers?",
        "searchedAs": ["tariffs on magazines", "us tariffs on magazines", "are there tariffs on magazines", "hs code for magazines"],
        "answer": "Magazines, journals and newspapers are heading 4902, Free. They are informational materials, so 9903.05.92 removes the 2026 Section 301 duty; from China they still pay 7.5% under List 4A. Bound volumes and multi-issue sets are classified as books (4901). Imports fell 30% to $102M in 2025.",
        "link": "",
    },
    {
        "id": "labels-stickers",
        "question": "Are printed labels and stickers in Chapter 49?",
        "searchedAs": ["hs code for printed labels", "hs code for printed paper labels", "hs code for stickers", "hs code for printed stickers", "tariff code for printed labels"],
        "answer": "Paper labels, printed or not, are heading 4821 in Chapter 48: printed labels are 4821.10 (lithographed .20, other .40) and unprinted self-adhesive labels 4821.90.20, all Free. Chapter 49 covers decals that transfer a design (4908), and other printed matter (4911). Classify by what the article is, and get a CBP ruling if unsure.",
        "link": "tariff-engineering",
    },
    {
        "id": "de-minimis",
        "question": "Can books still be shipped duty-free under de minimis?",
        "searchedAs": ["de minimis books", "de minimis exemption books"],
        "answer": "No longer by default. From August 29, 2025 the executive orders suspending de minimis kept it for informational materials, but CBP's June 24, 2026 rules suspend the $800 exemption for all merchandise, by mail (19 CFR 145.31) and every other mode (19 CFR 10.151), and a 2025 law ends it on July 1, 2027. Books still owe no base duty, but each shipment needs an entry.",
        "link": "tariff-updates",
    },
    {
        "id": "us-imports",
        "question": "How much printed matter does the U.S. import, and from where?",
        "searchedAs": ["tariffs printing industry", "importing books from china"],
        "answer": "$5.16B in 2025, down 7.7% from $5.59B. Books were $2.28B (44%), other printed matter $1.74B and children's books $506M. China supplied 42%, Canada 12%, Mexico 9%, the UK 8%, Italy 4% and India 3%.",
        "link": "understand-industry",
    },
]

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled", PATH)
