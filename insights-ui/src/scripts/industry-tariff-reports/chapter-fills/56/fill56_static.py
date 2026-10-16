"""Static (trade-independent) content for the Chapter 56 fill script: labels, sources, notes, rules, levers.

Imported by fill56.py. Every fact here is from the HTSUS 2026 Revision 21 (Chapter 56, Section XI and Chapter 99
notes), the Federal Register, eCFR (as of 2026-10-08) or CBP/USTR pages.
"""

CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
REL = "2026HTSRev21"
CH99 = f"https://hts.usitc.gov/reststop/file?release={REL}&filename=Chapter%2099"
CH98 = f"https://hts.usitc.gov/reststop/file?release={REL}&filename=Chapter%2098"
CH56 = f"https://hts.usitc.gov/reststop/file?release={REL}&filename=Chapter%2056"
CH50 = f"https://hts.usitc.gov/reststop/file?release={REL}&filename=Chapter%2050"  # Section XI notes print here
GN = f"https://hts.usitc.gov/reststop/file?release={REL}&filename=General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


TITLE = "Wadding, Felt and Nonwovens; Special Yarns; Twine, Cordage, Ropes and Cables and Articles Thereof"

ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."

# Canada Section 338 list (U.S. note 51(b)(3)) — the six Chapter 56 provisions.
CA338 = "5603.12.00, 5603.13.00, 5603.14.90, 5603.92.00, 5603.94.90 and 5607.50.40"
CA338_PLAIN = (
    "man-made-filament nonwovens over 25 g/m² (5603.12, 5603.13, 5603.14.90), staple-fibre nonwovens of 25–70 g/m² and over "
    "150 g/m² (5603.92, 5603.94.90) and braided synthetic cordage (5607.50.40)"
)
CN_EXCL = "5603.92.00.70, 5603.92.00.95 and 5603.93.00.90"

LABELS = {
    "5601": ("Wadding, textile flock, dust and mill neps", "Wadding & flock"),
    "5602": ("Felt, including needleloom felt and stitchbonded fabrics", "Felt"),
    "5603": ("Nonwovens (spunbond, meltblown, needlepunched, spunlace)", "Nonwovens"),
    "5604": ("Rubber thread and cord, textile covered; coated or sheathed yarn", "Rubber thread & coated yarn"),
    "5605": ("Metalized yarn", "Metalized yarn"),
    "5606": ("Gimped yarn, chenille yarn and loop wale-yarn", "Gimped & chenille yarn"),
    "5607": ("Twine, cordage, ropes and cables", "Twine, rope & cordage"),
    "5608": ("Knotted netting and made-up nets, including fishing nets", "Netting & fishing nets"),
    "5609": ("Articles of yarn, twine, cordage or rope (n.e.s.)", "Rope & cord articles"),
}

BLURBS = {
    "5601": (
        "Wadding (batting) and articles of wadding of cotton (3.6%), man-made fibres (6.3%, including flocked swabs) or other "
        "fibres (4%), plus textile flock, dust and mill neps (Free). Sanitary pads, tampons and diapers made of wadding are "
        "heading 9619, not here.",
        ["cotton wadding", "polyester batting", "quilt batting", "flocked swabs", "textile flock", "mill neps"],
    ),
    "5602": (
        "Felt. Needleloom felt and stitchbonded fabrics: 12% laminated, 10.6% other. Felt not impregnated or coated: wool "
        "49.5¢/kg + 7.5%, other fibres 6.3%. Other felt: laminated Free, man-made fibres 6.3%, other 52.9¢/kg + 8%. These "
        "are the chapter's only compound rates on felt.",
        ["needle punched felt", "wool felt", "polyester felt", "industrial felt", "felt sheet", "stitchbonded fabric"],
    ),
    "5603": (
        "Nonwovens of man-made filaments (spunbond, meltblown) or of staple fibres (spunlace, needlepunched, thermal "
        "bonded), split by weight per m². All 27 lines are Free at the general rate, so the extra duty by country is the "
        "whole cost.",
        ["nonwoven fabric", "spunbond polypropylene", "meltblown", "spunlace", "needle punched nonwoven", "geotextile nonwoven", "interlining", "wipes substrate"],
    ),
    "5604": (
        "Textile-covered rubber thread and cord (6.3%); high-tenacity polyester, nylon or viscose rayon yarn, impregnated or "
        "coated (8.8%); other yarn and strip impregnated, coated, covered or sheathed with rubber or plastics (5%).",
        ["elastic thread", "elastic cord", "covered rubber thread", "coated yarn", "sheathed yarn"],
    ),
    "5605": (
        "Metalized yarn: metal-coated or metal-laminated man-made filament or strip, ungimped and untwisted (7.5%), and "
        "other yarn combined with metal thread, strip or powder or covered with metal (13.2%).",
        ["metallic yarn", "lurex yarn", "metallized thread", "tinsel yarn"],
    ),
    "5606": (
        "Gimped yarn and gimped strip, chenille yarn (including flock chenille) and loop wale-yarn: 8%, split by whether it "
        "contains elastomeric filaments.",
        ["chenille yarn", "gimped yarn", "loop wale yarn", "fancy yarn"],
    ),
    "5607": (
        "Twine, cordage, rope and cable by fibre: sisal baler twine Free; polyethylene and polypropylene 2.7% (wide strip) to "
        "7%, or 9.8¢/kg + 5.3% for thick unbraided rope; nylon, polyester and other synthetics 3.6% braided, 7% or "
        "19.9¢/kg + 10.8% unbraided; coir, jute and thick abaca Free; other abaca 3.4%; other fibres 6.3%.",
        ["polypropylene rope", "nylon rope", "baler twine", "sisal twine", "braided rope", "jute twine", "polyester rope", "mooring rope"],
    ),
    "5608": (
        "Knotted netting of twine, cordage or rope and made-up nets: man-made fishing nets 8%, fish netting 8.5%, other "
        "man-made netting and nets (cargo nets, bait bags) 5%; nets of other materials: fishing 8%, cotton hammocks and "
        "netting 14.1% (the chapter's highest ad valorem rate), other 5%.",
        ["fishing net", "cargo net", "knotted netting", "hammock", "bait bags", "gill netting"],
    ),
    "5609": (
        "Articles of yarn, strip, twine, cordage, rope or cables not covered elsewhere (for example ropes with fittings and "
        "twist ties): 2.9% cotton, Free vegetable fibres, 4.5% man-made fibres, 3.9% other.",
        ["rope with fittings", "twist ties", "cordage articles", "rope fender"],
    ),
}

CHAPTER_NOTES = (
    "**Note 1.** Chapter 56 does not cover wadding, felt or nonwovens used merely as a carrier for perfumes, soaps, "
    "polishes or fabric softeners (chapters 33–38); quilted textile products of heading 5811; abrasive, mica or metal foil "
    "on a felt or nonwoven backing (6805, 6814, sections XIV–XV); or sanitary pads, tampons, diapers and diaper liners "
    "(heading 9619).\n\n"
    "**Note 2.** \"Felt\" includes needleloom felt and fabrics whose web is stitch-bonded with fibres from the web itself.\n\n"
    "**Note 3.** Headings 5602 and 5603 cover felt and nonwovens impregnated, coated, covered or laminated with plastics "
    "or rubber, and nonwovens bonded with plastics or rubber — but not felt with 50% or less textile by weight, or felt or "
    "nonwovens completely embedded in, or visibly coated on both sides with, plastics or rubber (chapters 39–40).\n\n"
    "**Note 4.** Heading 5604 does not cover yarn or strip whose impregnation or coating cannot be seen with the naked eye "
    "(usually chapters 50–55).\n\n"
    "**Section XI note 3.** Yarn is treated as \"twine, cordage, ropes and cables\" (heading 5607) when it measures more "
    "than 10,000 decitex if of man-made fibres, more than 20,000 decitex if of silk or of vegetable fibres other than true "
    "hemp or flax, 1,429 decitex or more if polished or glazed true hemp or flax, when it is coir of three or more plies, "
    "or when it is reinforced with metal thread. Wool yarn, paper yarn, man-made tow, monofilaments, metalized yarn (5605) "
    "and chenille or gimped yarn (5606) are never twine."
)

ADDITIONAL_US_NOTES = (
    "**Additional U.S. note 1.** \"Of wide nonfibrillated strip\" (5607.41.10, 5607.49.10, 2.7%) means twine, cordage, rope "
    "or cable containing more than 65% by weight of nonfibrillated polyethylene or polypropylene strip more than 25.4 mm "
    "wide when unfolded.\n\n"
    "**Additional U.S. note 2.** Heading 5607 does not cover twine, cordage, rope or cable of metal (section XV).\n\n"
    "**Statistical note 1.** \"Salmon gill netting\" (5608.19.10.10) is double- or triple-knot nylon fish netting of fine "
    "monofilament or multifilament yarn with a stretch mesh of 10.5–21.6 cm.\n\n"
    "The three-digit numbers in brackets (201, 223, 229, 369, 414, 469, 669, 899) are textile category numbers used to "
    "monitor shipments."
)

NEW_SOURCES = {
    "cbp-fl-guidance": {
        "id": "cbp-fl-guidance",
        "publisher": "CBP",
        "citation": "CBP Publication No. 5560-0526",
        "document": "Operational guidance",
        "title": "CBP Forced Labor Enforcement Operational Guidance for Importers (UFLPA high-priority sector supply-chain tracing documentation, Appendix A)",
        "signed": None,
        "published": "2026-06-12",
        "url": "https://www.cbp.gov/document/guidance/cbp-forced-labor-enforcement-operational-guidance-importers",
    },
    "pl-117-78": {
        "id": "pl-117-78",
        "publisher": "GovInfo",
        "citation": "P.L. 117-78 (135 Stat. 1525)",
        "document": "Public Law 117-78",
        "title": "Uyghur Forced Labor Prevention Act",
        "signed": "2021-12-23",
        "published": "2021-12-23",
        "url": "https://www.govinfo.gov/content/pkg/PLAW-117publ78/pdf/PLAW-117publ78.pdf",
    },
    "fr-2011-6253": {
        "id": "fr-2011-6253",
        "publisher": "Federal Register",
        "citation": "76 FR 14575",
        "document": "Final rule (CBP Dec. 11-09)",
        "title": "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer identification code required)",
        "signed": None,
        "published": "2011-03-17",
        "url": "https://www.federalregister.gov/documents/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products",
    },
    "fr-2021-07630": {
        "id": "fr-2021-07630",
        "publisher": "Federal Register",
        "citation": "86 FR 19602",
        "document": "Notice (Commerce, ITA) A-570-131 / C-570-132",
        "title": "Twist Ties From the People's Republic of China: Antidumping and Countervailing Duty Orders",
        "signed": "2021-04-08",
        "published": "2021-04-14",
        "url": "https://www.federalregister.gov/documents/2021/04/14/2021-07630/twist-ties-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty-orders",
    },
    "fr-2026-12961": {
        "id": "fr-2026-12961",
        "publisher": "Federal Register",
        "citation": "91 FR 38669",
        "document": "Notice (Commerce, ITA) C-570-132",
        "title": "Twist Ties From People's Republic of China: Final Results of the Expedited First Sunset Review of the Countervailing Duty Order",
        "signed": None,
        "published": "2026-06-26",
        "url": "https://www.federalregister.gov/documents/2026/06/26/2026-12961/twist-ties-from-peoples-republic-of-china-final-results-of-the-expedited-first-sunset-review-of-the",
    },
    "fr-2026-13105": {
        "id": "fr-2026-13105",
        "publisher": "Federal Register",
        "citation": "91 FR 39591",
        "document": "Notice (Commerce, ITA) A-570-131",
        "title": "Twist Ties From the People's Republic of China: Final Results of the Expedited First Sunset Review of the Antidumping Duty Order",
        "signed": None,
        "published": "2026-06-30",
        "url": "https://www.federalregister.gov/documents/2026/06/30/2026-13105/twist-ties-from-the-peoples-republic-of-china-final-results-of-the-expedited-first-sunset-review-of",
    },
    "fr-2026-12537": {
        "id": "fr-2026-12537",
        "publisher": "Federal Register",
        "citation": "91 FR 37423",
        "document": "Notice (USITC) Inv. Nos. 701-TA-649 and 731-TA-1523 (Review)",
        "title": "Twist Ties From China; Notice of Commission Determination To Conduct Full Five-Year Reviews",
        "signed": "2026-06-17",
        "published": "2026-06-23",
        "url": "https://www.federalregister.gov/documents/2026/06/23/2026-12537/twist-ties-from-china-notice-of-commission-determination-to-conduct-full-five-year-reviews",
    },
    "fr-2019-05520": {
        "id": "fr-2019-05520",
        "publisher": "Federal Register",
        "citation": "84 FR 10786",
        "document": "Notice (Commerce, ITA) A-570-075 / C-570-076",
        "title": "Certain Plastic Decorative Ribbon From the People's Republic of China: Amended Final Affirmative Antidumping Duty Determination and Antidumping Duty Order; and Countervailing Duty Order",
        "signed": None,
        "published": "2019-03-22",
        "url": "https://www.federalregister.gov/documents/2019/03/22/2019-05520/certain-plastic-decorative-ribbon-from-the-peoples-republic-of-china-amended-final-affirmative",
    },
    "fr-2024-24749": {
        "id": "fr-2024-24749",
        "publisher": "Federal Register",
        "citation": "89 FR 84865",
        "document": "Notice (Commerce, ITA) A-570-075 / C-570-076",
        "title": "Certain Plastic Decorative Ribbons From China: Continuation of Antidumping Duty Order and Countervailing Duty Order",
        "signed": None,
        "published": "2024-10-24",
        "url": "https://www.federalregister.gov/documents/2024/10/24/2024-24749/certain-plastic-decorative-ribbons-from-china-continuation-of-antidumping-duty-order-and",
    },
    "fr-2024-11904": {
        "id": "fr-2024-11904",
        "publisher": "Federal Register",
        "citation": "89 FR 46948",
        "document": "Notice (USTR)",
        "title": "Notice of Extension of Certain Exclusions: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",
        "signed": None,
        "published": "2024-05-30",
        "url": "https://www.federalregister.gov/documents/2024/05/30/2024-11904/notice-of-extension-of-certain-exclusions-chinas-acts-policies-and-practices-related-to-technology",
    },
}
