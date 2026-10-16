#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 59 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill59.py <generated.json> <out.json>   (run by run.sh: generate -> fill -> compact -> prettier)
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU
TODAY = '2026-10-13'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '59-coated' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH59_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2059'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y = ui['latestYear']
PY = ui['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in ui['byYear']}
total, prior_total = year_tot[Y], year_tot[PY]
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-59.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {x['hs6']: x for x in trade['byHs6']}
hc = {}
for r in trade['byHeadingCountry']:
    hc[(r['heading'], r['country'])] = r['importsUsd']


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def imp_year(country, year):
    c = by_c_all.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    c = by_c_all[country]
    return round((c['importsUsd'] / c['priorImportsUsd'] - 1) * 100, 1)


def hy(h):
    return by_h[h][str(Y)]


def hs6(code):
    return by_hs6[code]['importsUsd']


assert round(total) == round(trade['totalsByYear'][-1]['totalUsd'])
TOTAL_CHG = round((total / prior_total - 1) * 100, 1)  # negative
VN_5902 = hc[('5902', 'Viet Nam')]
MX_5911 = hc[('5911', 'Mexico')]
IN_5903 = hc[('5903', 'India')]

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
FR = 'https://www.federalregister.gov/documents/'
NEW_SOURCES = {
    'hts-ch59': {
        'id': 'hts-ch59',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 59',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 59: Impregnated, Coated, Covered or Laminated '
        'Textile Fabrics; Textile Articles of a Kind Suitable for Industrial Use',
        'signed': None,
        'published': '2026-10-07',
        'url': CH59_PDF,
    },
    'ad-canvas': {
        'id': 'ad-canvas',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '87 FR 61568',
        'document': 'Notice (A-570-899)',
        'title': 'Certain Artist Canvas From the People\'s Republic of China: Continuation of Antidumping Duty Order',
        'signed': None,
        'published': '2022-10-12',
        'url': FR + '2022/10/12/2022-22152/certain-artist-canvas-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order',
    },
    'ad-ribbons': {
        'id': 'ad-ribbons',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '87 FR 15205',
        'document': 'Notice',
        'title': 'Narrow Woven Ribbons With Woven Selvedge From the People\'s Republic of China and Taiwan: Continuation of Antidumping Duty '
        'Orders and Countervailing Duty Order',
        'signed': None,
        'published': '2022-03-17',
        'url': FR + '2022/03/17/2022-05634/narrow-woven-ribbons-with-woven-selvedge-from-the-peoples-republic-of-china-and-taiwan-continuation',
    },
    'ad-ribbons-tw-2026': {
        'id': 'ad-ribbons-tw-2026',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '91 FR 56857',
        'document': 'Notice',
        'title': 'Narrow Woven Ribbons with Selvedge From Taiwan: Final Results of Antidumping Duty Administrative Review; 2023-2024',
        'signed': None,
        'published': '2026-09-04',
        'url': FR + '2026/09/04/2026-18182/narrow-woven-ribbons-with-selvedge-from-taiwan-final-results-of-antidumping-duty-administrative',
    },
    'ad-sacks-cn': {
        'id': 'ad-sacks-cn',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '90 FR 10809',
        'document': 'Notice',
        'title': 'Laminated Woven Sacks From the People\'s Republic of China: Continuation of Antidumping and Countervailing Duty Orders',
        'signed': None,
        'published': '2025-02-27',
        'url': FR + '2025/02/27/2025-03183/laminated-woven-sacks-from-the-peoples-republic-of-china-continuation-of-antidumping-and',
    },
    'ad-sacks-vn': {
        'id': 'ad-sacks-vn',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '89 FR 94707',
        'document': 'Notice',
        'title': 'Laminated Woven Sacks From the Socialist Republic of Vietnam: Continuation of Antidumping Duty and Countervailing Duty Orders',
        'signed': None,
        'published': '2024-11-29',
        'url': FR + '2024/11/29/2024-28022/laminated-woven-sacks-from-the-socialist-republic-of-vietnam-continuation-of-antidumping-duty-and',
    },
    'ad-opp-2026': {
        'id': 'ad-opp-2026',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '91 FR 32937',
        'document': 'Notice',
        'title': 'Antidumping or Countervailing Duty Order, Finding, or Suspended Investigation; Opportunity To Request Administrative Review '
        '(June 2026 anniversaries, incl. Artist Canvas from China, A-570-899)',
        'signed': None,
        'published': '2026-06-02',
        'url': FR + '2026/06/02/2026-10938/antidumping-or-countervailing-duty-order-finding-or-suspended-investigation-opportunity-to-request',
    },
    'ad-belts-revoked': {
        'id': 'ad-belts-revoked',
        'publisher': 'Federal Register (Commerce, ITA)',
        'citation': '65 FR 54994',
        'document': 'Notice',
        'title': 'Revocation of the Antidumping Duty Orders on Industrial Belts From Germany, Italy, Singapore, and Japan',
        'signed': None,
        'published': '2000-09-12',
        'url': FR + '2000/09/12/00-23396/revocation-of-the-antidumping-duty-orders-on-industrial-belts-from-germany-italy-singapore-and-japan',
    },
}


def src(sid):
    if sid in NEW_SOURCES:
        return NEW_SOURCES[sid]
    return REF_SOURCES[sid]


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


# ---------------------------------------------------------------------------------------------------
# Chapter + labels
# ---------------------------------------------------------------------------------------------------
d['chapter']['title'] = (
    'Impregnated, Coated, Covered or Laminated Textile Fabrics; Textile Articles of a Kind Suitable for Industrial Use'
)
SHORT = 'Coated Fabrics, Tire Cord & Industrial Textiles'

GROUP_LABELS = {
    '5901': ('Book cloth, tracing cloth, prepared painting canvas & buckram', 'Book cloth & canvas'),
    '5902': ('Tire cord fabric of nylon, polyester or rayon', 'Tire cord fabric'),
    '5903': ('Fabrics coated or laminated with plastics (PVC, PU — incl. faux leather)', 'Plastic-coated fabrics'),
    '5904': ('Linoleum & floor coverings on a textile backing', 'Linoleum'),
    '5905': ('Textile wall coverings', 'Wall coverings'),
    '5906': ('Rubberized fabrics & rubberized adhesive tape', 'Rubberized fabrics'),
    '5907': ('Other coated fabrics & painted theatrical scenery', 'Other coated fabrics'),
    '5908': ('Textile wicks & gas mantle fabric', 'Wicks'),
    '5909': ('Textile hose (fire hose and similar tubing)', 'Textile hose'),
    '5910': ('Textile conveyor & transmission belts', 'Conveyor & drive belts'),
    '5911': ('Technical textiles: paper-machine clothing, bolting cloth, filter cloth, printers\' blankets', 'Technical textiles'),
}

BLURBS = {
    '5901': (
        'Fabrics coated with gum or starch for book covers, tracing cloth, prepared painting canvas and buckram: 7% for man-made fibers, 4.1% '
        'for cotton and other fibers. Primed artist canvas from China also carries an antidumping duty (order A-570-899).',
        ['book cloth', 'bookbinding cloth', 'tracing cloth', 'artist canvas', 'painting canvas', 'primed canvas', 'buckram'],
    ),
    '5902': (
        'Tire cord fabric of high-tenacity nylon or polyester yarn pays 5.8%; rayon and other tire cord is Free. Vietnam supplied '
        f'{fmt_usd(VN_5902)} of the {fmt_usd(hy("5902"))} imported in {Y}.',
        ['tire cord fabric', 'tyre cord fabric', 'nylon tire cord', 'polyester tire cord', 'dipped tire cord', 'rayon tire cord'],
    ),
    '5903': (
        'The rate follows the plastic, the fiber and the plastic content: cotton 2.7%; man-made-fiber fabrics coated with PVC, PU or other '
        'plastics 7.5%, or 8% (PU) and 14.1% (PVC) for the layered fabrics of Section XI note 9; Free when the fabric is over 70% rubber or '
        'plastics by weight (over 60% plastics for the note 9 fabrics). Faux leather, tarpaulin and banner fabric are here.',
        ['pvc coated fabric', 'pu coated fabric', 'faux leather', 'synthetic leather', 'vinyl fabric', 'tarpaulin fabric', 'laminated fabric', 'banner fabric'],
    ),
    '5904': (
        'Linoleum and floor coverings made of a coating on a textile backing are Free from every column 1 country.',
        ['linoleum', 'linoleum flooring', 'floor covering textile backing'],
    ),
    '5905': (
        'Textile wall coverings in rolls at least 45 cm wide are Free, whether backed with paper or not.',
        ['textile wall covering', 'fabric wallpaper', 'grasscloth wallcovering', 'wall fabric'],
    ),
    '5906': (
        'Rubberized adhesive tape up to 20 cm wide pays 2.9%; other rubberized fabrics 2.7% (cotton), 3.3% (other fibers), 7.5% (knitted '
        'man-made fibers) or Free (man-made fibers over 70% rubber, and other woven man-made fibers).',
        ['rubberized fabric', 'rubber coated fabric', 'cloth adhesive tape', 'duct tape fabric', 'neoprene coated fabric'],
    ),
    '5907': (
        'Laminated fabrics and Section XI note 9 fabrics of man-made fibers pay 8%; painted theatrical scenery and other coated or impregnated '
        'fabrics (for example flocked or silicone-treated) are Free.',
        ['theatrical scenery', 'painted backdrop', 'studio backcloth', 'impregnated fabric', 'flame retardant fabric'],
    ),
    '5908': (
        'Woven, plaited or knitted wicks for lamps, stoves, lighters and candles, and gas mantle fabric: 3.4%.',
        ['candle wick', 'lamp wick', 'oil lamp wick', 'gas mantle'],
    ),
    '5909': (
        'Textile hosepiping and tubing, such as lay-flat fire hose: Free if of vegetable fibers, 3.3% otherwise.',
        ['fire hose', 'lay flat hose', 'textile hose', 'canvas hose'],
    ),
    '5910': (
        'Conveyor and transmission belts and belting of textile material: 4% of man-made fibers (V-belts, synchronous belts, belting), 2.6% '
        'otherwise. Belts of rubber-coated fabric are rubber belts of heading 4010 (Chapter 59 note 7).',
        ['conveyor belt', 'textile conveyor belt', 'transmission belt', 'v-belt', 'synchronous belt', 'belting'],
    ),
    '5911': (
        'Technical textiles: paper-machine felts and forming fabrics 3.8%, printers\' rubberized blankets 2.9%, screen-printing fabric 3.3%, '
        'other bolting cloth Free, filter cloth for oil presses 8%, gaskets, packing cords and other machinery parts of textile 3.8%.',
        ['paper machine felt', 'press felt', 'forming fabric', 'printing blanket', 'screen printing mesh', 'bolting cloth', 'filter cloth', 'packing cord'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 59: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — renewed through December 31, 2026'
    if e['code'] == 'B':
        e['name'] = 'Automotive Products Trade Act (original-equipment automotive products of Canada)'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = 'HTS Chapter 59 Tariffs 2026: Coated Fabric, Tire Cord & Conveyor Belt Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 75 HTS Chapter 59 lines — PVC and PU coated fabrics, tire cord fabric, conveyor belts, '
    'paper-machine felts, filter cloth. Base rates Free to 14.1% plus the extra duty by country: 10% in total from the EU, +10% India, '
    '+12.5% Vietnam, +37.5% China.'
)
ov['seo']['keywords'] = [
    'hts chapter 59',
    'htsus chapter 59',
    'hts 5903',
    'hs code 5903',
    'hs code for pvc coated fabric',
    'tire cord fabric hs code',
    'hs code for conveyor belt',
    'hs code 5911',
    'tariffs on fabric from china',
    'chapter 59 import duty rates',
]

ov['intro'] = (
    'Chapter 59 covers textile fabrics that have been **impregnated, coated, covered or laminated** — with plastics (heading 5903: PVC- and '
    'PU-coated fabrics, faux leather, tarpaulin and banner fabric), with rubber (5906) or with gum or starch (5901: book cloth, tracing cloth, '
    'artist canvas) — plus **tire cord fabric** (5902), linoleum, textile wall coverings, wicks, textile hose, **conveyor and transmission '
    'belts** (5910) and the **technical textiles** of heading 5911: paper-machine felts and forming fabrics, bolting cloth, filter cloth, '
    'printers\' blankets, gaskets and other machinery parts. Base rates are moderate: 51 of the 75 tariff lines are dutiable, from 2.6% to '
    '**14.1%** (layered PVC-coated man-made-fiber fabrics); tire cord pays 5.8%, most coated man-made-fiber fabrics 7.5%–8%.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, {abs(TOTAL_CHG)}% less than in {PY}. **Mexico** '
    f'({fmt_usd(imp("Mexico"))}) was the largest supplier — mostly technical textiles of 5911 — ahead of **India** ({fmt_usd(imp("India"))}, '
    f'mostly plastic-coated fabrics), Canada, China and **Vietnam**, which shipped {fmt_usd(VN_5902)} of tire cord fabric. On top of the '
    'base rate comes the **extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 economies — +10% for India, Cambodia and '
    'the UK, +12.5% for Vietnam, Turkey and Israel, **10% in total** for EU and Taiwanese goods and 12.5% in total for Japanese and Korean '
    'goods. **China pays +12.5% plus +25% (List 3)** on every line but one, so Chinese PU-coated fabric pays 45%. USMCA-qualifying goods from '
    'Mexico pay nothing; four Canadian subheadings — two plastic-coated fabric lines, 5907.00.60 and 5911.90.00 — owe a **50% Section 338 '
    'duty even under USMCA**. Three antidumping cases reach the chapter: primed artist canvas from China, narrow woven ribbons from China and '
    'Taiwan, and laminated woven sack fabric from China and Vietnam.'
)

ov['workedExamples'] = [
    {
        'title': 'Polyester tire cord fabric from Vietnam',
        'line': '5902.20.00.00',
        'body': 'Tire cord fabric of high-tenacity polyester yarn pays 5.8%. Vietnam adds +12.5% (9903.05.84): **18.3%**, $1,830 on a $10,000 '
        'shipment. The same fabric pays 43.3% from China (5.8% + 12.5% + 25% List 3), 15.8% from India and 12.5% in total from South Korea '
        '(KORUS removes the 5.8%, and the Korean rate tops the total up to 12.5%). Tire cord fabric is not on the Section 232 auto-parts list.',
    },
    {
        'title': 'PU-coated polyester fabric (faux leather) from China',
        'line': '5903.20.25.00',
        'body': 'Man-made-fiber fabric coated with polyurethane, under 70% plastics by weight, pays 7.5%. China adds +12.5% (9903.05.31) and '
        '+25% (List 3, 9903.88.03): **45%**, $4,500 on $10,000. From Taiwan it pays 10% in total, from Vietnam 20%, from India 17.5%. Coating '
        'Chinese greige fabric in another country does not by itself change its origin (19 CFR 102.21).',
    },
    {
        'title': 'Plastic-coated man-made-fiber fabric from Canada',
        'line': '5903.90.25.00',
        'body': 'The base rate is 7.5%, and USMCA-qualifying goods are exempt from the 10% Section 301 duty (9903.05.93). But 5903.90.25 is on the '
        'Section 338 list in U.S. note 51(b)(3) (9903.03.14), and that 50% applies even when USMCA is claimed: **$5,000** on a $10,000 '
        'shipment. A non-qualifying shipment pays 7.5% + 10% + 50% = 67.5%.',
    },
    {
        'title': 'Paper-machine press felt from Germany',
        'line': '5911.32.00.10',
        'body': 'Press felts of 650 g/m² or more pay 3.8%. For EU goods with a base rate under 10%, the 2026 Section 301 action charges 10% in '
        'total (9903.05.38–9903.05.39), so a $100,000 felt pays **$10,000** instead of $3,800. From Japan it pays 12.5% in total, from Mexico '
        'nothing under USMCA.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 59 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

ov['notes']['chapterNotes'] = (
    '**Note 1.** Except where the context otherwise requires, for the purposes of this chapter the expression "textile fabrics" applies only '
    'to the woven fabrics of chapters 50 to 55 and headings 5803 and 5806, the braids and ornamental trimmings in the piece of heading 5808 and '
    'the knitted or crocheted fabrics of headings 6002 to 6006.\n\n'
    '**Note 2.** Heading 5903 applies to: (a) textile fabrics, impregnated, coated, covered or laminated with plastics, whatever the weight per '
    'square meter and whatever the nature of the plastic material (compact or cellular), other than: (1) fabrics in which the impregnation, '
    'coating or covering cannot be seen with the naked eye (usually chapters 50 to 55, 58 or 60), no account being taken of any resulting '
    'change of color; (2) products which cannot, without fracturing, be bent manually around a cylinder of a diameter of 7 mm, at a '
    'temperature between 15°C and 30°C (usually chapter 39); (3) products in which the textile fabric is either completely embedded in '
    'plastics or entirely coated or covered on both sides with such material, provided that such coating or covering can be seen with the '
    'naked eye (chapter 39); (4) fabrics partially coated or partially covered with plastics and bearing designs resulting from these '
    'treatments (usually chapters 50 to 55, 58 or 60); (5) plates, sheets or strip of cellular plastics, combined with textile fabric, where '
    'the textile fabric is present merely for reinforcing purposes (chapter 39); or (6) textile products of heading 5811; (b) fabrics made '
    'from yarn, strip or the like, impregnated, coated, covered or sheathed with plastics, of heading 5604.\n\n'
    '**Note 3.** For heading 5903, "textile fabrics laminated with plastics" means products made by the assembly of one or more layers of '
    'fabrics with one or more sheets or film of plastics which are combined by any process that bonds the layers together, whether or not the '
    'sheets or film of plastics are visible to the naked eye in the cross-section.\n\n'
    '**Note 4.** For heading 5905, "textile wall coverings" applies to products in rolls, of a width of not less than 45 cm, suitable for wall '
    'or ceiling decoration, consisting of a textile surface which has been fixed on a backing or has been treated on the back (impregnated or '
    'coated to permit pasting). It does not apply to wall coverings of textile flock or dust fixed directly on a backing of paper (heading '
    '4814) or on a textile backing (generally heading 5907).\n\n'
    '**Note 5.** For heading 5906, "rubberized textile fabrics" means: (a) textile fabrics impregnated, coated, covered or laminated with '
    'rubber, weighing not more than 1,500 g/m², or weighing more than 1,500 g/m² and containing more than 50 percent by weight of textile '
    'material; (b) fabrics made from yarn, strip or the like, impregnated, coated, covered or sheathed with rubber, of heading 5604; and (c) '
    'fabrics composed of parallel textile yarns agglomerated with rubber, irrespective of their weight per square meter. The heading does not '
    'apply to plates, sheets or strip of cellular rubber combined with textile fabric present merely for reinforcing purposes (chapter 40), or '
    'textile products of heading 5811.\n\n'
    '**Note 6.** Heading 5907 does not apply to: (a) fabrics in which the impregnation, coating or covering cannot be seen with the naked eye; '
    '(b) fabrics painted with designs (other than painted canvas being theatrical scenery, studio back-cloths or the like); (c) fabrics '
    'partially covered with flock, dust, powdered cork or the like and bearing designs resulting from these treatments (imitation pile fabrics '
    'remain in this heading); (d) fabrics finished with normal dressings having a basis of amylaceous or similar substances; (e) wood veneered '
    'on a backing of textile fabrics (heading 4408); (f) natural or artificial abrasive powder or grain, on a backing of textile fabrics '
    '(heading 6805); (g) agglomerated or reconstituted mica, on a backing of textile fabrics (heading 6814); or (h) metal foil on a backing of '
    'textile fabrics (generally section XIV or XV).\n\n'
    '**Note 7.** Heading 5910 does not apply to: (a) transmission or conveyor belting, of textile material, of a thickness of less than 3 mm; '
    'or (b) transmission or conveyor belts or belting of textile fabric impregnated, coated, covered or laminated with rubber or made from '
    'textile yarn or cord impregnated, coated, covered or sheathed with rubber (heading 4010).\n\n'
    '**Note 8.** Heading 5911 applies to the following goods, which do not fall in any other heading of section XI: (a) textile products in '
    'the piece, cut to length or simply cut to rectangular (including square) shape (other than those having the character of the products of '
    'headings 5908 to 5910), the following only: (i) textile fabrics, felt and felt-lined woven fabrics, coated, covered or laminated with '
    'rubber, leather or other material, of a kind used for card clothing, and similar fabrics of a kind used for other technical purposes, '
    'including narrow fabrics made of velvet impregnated with rubber, for covering weaving spindles (weaving beams); (ii) bolting cloth; (iii) '
    'filtering and straining cloth of a kind used in oil presses or the like, of textile material or of human hair; (iv) flat woven textile '
    'fabrics with multiple warp or weft, whether or not felted, impregnated or coated, of a kind used in machinery or for other technical '
    'purposes; (v) textile fabric reinforced with metal, of a kind used for technical purposes; (vi) cords, braids and the like, whether or '
    'not coated, impregnated or reinforced with metal, of a kind used in industry as packing or lubricating materials; (b) textile articles '
    '(other than those of headings 5908 to 5910) of a kind used for technical purposes (for example, textile fabrics and felts, endless or '
    'fitted with linking devices, of a kind used in papermaking or similar machines (for example, for pulp or asbestos-cement), gaskets, '
    'washers, polishing discs and other machinery parts).'
)
ov['notes']['additionalUsNotes'] = None

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 75; Brazil: 75; China List 3: 74, List 4A: 1 (5903.10.15); Canada Section 338: 6 (also on USMCA '
            'goods); Russia 35% in lieu of column 2: 3'
        )

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 59: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 59 Tariff Updates 2026: Coated Fabric, Tire Cord & Technical Textile Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 59 — coated and laminated fabrics, tire cord, conveyor belts, technical textiles — since '
    'January 2025: the end of the IEEPA and Section 122 duties, the 2026 Section 301 tariffs (India +10%, Vietnam +12.5%, EU 10%), China '
    'List 3, Canada Section 338 and the antidumping orders, with Federal Register citations.',
    'keywords': [
        'hts chapter 59 tariff updates',
        'hts chapter 59 import duty rates',
        'section 301 tariff on coated fabric',
        'tariffs on fabric from india',
        'vietnam tire cord fabric tariff',
        'china tariff on hts chapter 59',
        'section 338 canada tariffs',
        'artist canvas antidumping duty',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 59 base rate changed**: all 75 lines carry the same General, Special and Column 2 '
    'rates, from Free to 14.1%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached coated fabrics and technical textiles from every '
    'country — 20% for Vietnam and 15% in total for the EU from August 7, 2025, 50% for India from August 27, and up to 145% for China in '
    'April–May 2025, on top of the 25% List 3 duty. The IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 surcharge that '
    'replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff**: +10% for India, '
    'Cambodia and the UK, +12.5% for Vietnam, Turkey and Israel, 10% in total for the EU and Taiwan, 12.5% in total for Japan and South Korea. '
    'China still pays the **25% List 3 duty** on 74 of the 75 lines (7.5% List 4A on the other). Since **August 22, 2026** four Chapter 59 '
    'subheadings from Canada pay a **50% Section 338 duty**, even under USMCA. The antidumping orders on Chinese artist canvas, Chinese and '
    'Taiwanese narrow woven ribbons and Chinese and Vietnamese laminated woven sacks remain in force; Commerce set an 83.67% rate for two '
    'Taiwanese ribbon exporters on September 4, 2026.'
)
tu['scope'] = (
    'Measures that reach Chapter 59 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 List 3 and List 4A duties, the Canada Section 338 duties, Russia\'s rates in lieu of column 2, and the 2025–2026 IEEPA and '
    'Section 122 duties that have ended. Antidumping and countervailing duty orders whose scope can reach Chapter 59 subheadings are listed as '
    'reference entries. No Section 232 product action lists a Chapter 59 line. Preference-program changes (GSP, AGOA) are listed for '
    'reference. For the rate each supplier pays, see Rates by country.'
)

NO_52B = 'No Chapter 59 line is on the general exemption list (note 52(b)). '
CA338_LINES = '5903.90.25, 5903.90.30, 5907.00.60 and 5911.90.00'

IN_EFFECT_TEXT = {
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject to '
        'the Canada Section 338 duties. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying technical textiles, coated fabrics or tire cord from Mexico pay nothing; non-qualifying goods pay the base rate plus 10%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'India has no exception list in note 52(j). The IEEPA duties on India — 25% reciprocal '
        'from August 7, 2025 plus 25% from August 27, 2025 — ended in February 2026.',
        'Indian PU- or PVC-coated man-made-fiber fabric pays 17.5%–18%, cotton-based coated fabric 12.7%, tire cord 15.8%.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 '
        'duty (+50%, from August 22, 2026, 9903.03.14) applies to products of Canada in four Chapter 59 subheadings — ' + CA338_LINES + ' — '
        'and U.S. note 51(a) says it applies even when USMCA or another special rate is claimed. The September 15, 2026 list revisions changed '
        'no Chapter 59 entry. The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying plastic-coated fabric of 5903.90.25/.30, coated fabric of 5907.00.60 or technical textiles of 5911.90 from Canada pay '
        '50%; non-qualifying goods pay 60% plus the base rate. Other USMCA-qualifying Chapter 59 goods from Canada pay nothing.',
    ),
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and +25% under List 3 (9903.88.03), which covers every '
        'Chapter 59 subheading except 5903.10.15; that one is on List 4A (+7.5%, 9903.88.15). No exclusion in effect covers a Chapter 59 line '
        '— the older List 3 exclusions printed in note 20 for some coated fabrics have expired. The IEEPA duties on China (fentanyl and '
        'reciprocal) ended February 24, 2026, and USTR\'s four-year review kept List 3 and List 4A in place.',
        'Chinese PU-coated fabric pays 45%, PVC-coated layered fabric 51.6%, tire cord 43.3%, conveyor belts 41.5%, paper-machine felts '
        '41.3%. Primed artist canvas, and ribbons or woven sack fabric within the order scopes, also owe antidumping or countervailing duties.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'Vietnam has no exception list in note 52(j). The 20% IEEPA reciprocal duty (9903.02.69, '
        'from August 7, 2025) ended February 24, 2026.',
        'Vietnamese polyester or nylon tire cord pays 18.3%, coated man-made-fiber fabric 20%–20.5%, book cloth 16.6%–19.5%. Laminated woven '
        'sack fabric within the order scope also owes antidumping and countervailing duties.',
    ),
    'Japan': (
        'For goods whose base rate is under 12.5%, the total is 12.5% (9903.05.49); at or above 12.5%, nothing is added (9903.05.48, U.S. note '
        '52(k)). ' + NO_52B + 'The IEEPA reciprocal duty on Japan ended February 24, 2026.',
        'Japanese coated fabrics, tire cord, belts and technical textiles pay 12.5% in total; layered PVC fabric of 5903.10.18 pays its 14.1% '
        'base rate only.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added (9903.05.38, U.S. note '
        '52(k)). Every Chapter 59 line except 5903.10.18 (14.1%) is under 10%, so EU goods pay 10% in total. ' + NO_52B + 'The EU exception '
        'list in note 52(j) has no Chapter 59 line. This replaced the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'German or Italian conveyor belts, paper-machine felts or coated fabrics pay 10% of value — $1,000 on $10,000 — instead of 15% in late '
        '2025 and their 2.6%–8% base rate before that.',
    ),
    'South Korea': (
        'For goods whose base rate is under 12.5%, the total is 12.5% (9903.05.71); at or above 12.5%, nothing is added (9903.05.70, U.S. note '
        '52(k)). A KORUS claim makes the base rate Free, and the Korean rate then tops the total up to 12.5%. ' + NO_52B + 'The IEEPA '
        'reciprocal duty on South Korea ended February 24, 2026.',
        'Korean tire cord, coated fabrics and technical textiles pay 12.5% in total, with or without KORUS.',
    ),
    'Taiwan': (
        'For goods whose base rate is under 10%, the total is 10% (9903.05.76); at or above 10%, nothing is added (9903.05.75, U.S. note '
        '52(k)). ' + NO_52B + 'Taiwan\'s exception list in note 52(j) names no Chapter 59 line. The IEEPA reciprocal duty on Taiwan ended '
        'February 24, 2026.',
        'Taiwanese coated fabrics pay 10% in total (14.1% for 5903.10.18). Narrow woven ribbons within the order scope also owe antidumping '
        'duty — 83.67% for two exporters since September 4, 2026.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list in note 52(j) has no Chapter 59 line. The 10% IEEPA reciprocal duty '
        'ended February 24, 2026.',
        'British linoleum and wall coverings pay 10%, coated man-made-fiber fabrics 17.5%–18%, technical textiles 13.8%.',
    ),
    'Türkiye (Turkey)': (
        'Base rate + 12.5% (9903.05.79). ' + NO_52B + 'Turkey has no exception list in note 52(j). The IEEPA reciprocal duty ended February 24, '
        '2026.',
        'Turkish nylon or polyester tire cord pays 18.3%, coated man-made-fiber fabrics 20%–20.5%.',
    ),
    'Israel': (
        '+12.5% (9903.05.47), also when the U.S.–Israel FTA rate is claimed (U.S. note 52(a)). ' + NO_52B + 'Israel has no exception list in '
        'note 52(j). The IEEPA reciprocal duty ended February 24, 2026.',
        'Israeli technical textiles and coated fabrics entered under the FTA (Free base rate) pay 12.5%.',
    ),
    'Cambodia': (
        'Base rate + 10% (9903.05.28). ' + NO_52B + 'Cambodia\'s exception list in note 52(j) names no Chapter 59 line. The 19% IEEPA '
        'reciprocal duty (9903.02.11, from August 7, 2025) ended February 24, 2026.',
        'Cambodian book cloth and buckram of 5901 pay 14.1%–17%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 59 line. The 40% IEEPA duty on Brazil (Executive Order 14323) ended '
        'February 24, 2026.',
        'Brazilian Chapter 59 goods pay 37.5% on top of the base rate — 43.3% for tire cord, 41.5% for conveyor belts.',
    ),
    'Costa Rica': (
        'Base rate + 12.5% (9903.05.33). CAFTA-DR textile goods entered duty-free under the agreement (SPI P) pay no Section 301 duty (U.S. '
        'note 52(i), 9903.05.95); every Chapter 59 heading is a CAFTA-DR textile good. The 24 lines whose General rate is already Free carry no '
        'P in the Special column, so goods on them — linoleum, wall coverings, coated fabrics over 70% plastics, rayon tire cord and others — '
        'still pay 12.5%. Costa Rica has no exception list in note 52(j). The IEEPA reciprocal duty ended February 24, 2026.',
        'Costa Rican coated fabrics, belts and technical textiles that qualify under CAFTA-DR pay nothing; non-qualifying goods, and goods on '
        'the Free lines, pay the base rate plus 12.5%.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — up to 88.5% in this chapter — plus +12.5% (9903.05.66). Three lines (5903.10.20.10, '
        '5903.10.20.90 and 5910.00.90) pay 35% under 9903.90.08 in place of their column 2 rate (U.S. note 30).',
        'Russian coated fabrics and technical textiles are effectively priced out.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Indonesia, Malaysia and Bangladesh +10%, Thailand and the UAE +12.5%, Switzerland 12.5% in total. ' + NO_52B + 'Three country exception lists in U.S. note 52(j) cover **every Chapter 59 subheading except '
    '5906.10.00** (rubberized adhesive tape): Jordan (9903.06.20), and Guatemala (9903.06.06) and El Salvador (9903.06.09) when CAFTA-DR is '
    'claimed — so their coated fabrics and technical textiles pay no Section 301 duty. Separately, note 52(i) (9903.05.95) exempts CAFTA-DR '
    'textile goods of all six CAFTA-DR countries entered duty-free under SPI P, which covers the 51 dutiable Chapter 59 lines. Countries outside the 60 economies, such as Myanmar, '
    'pay only the base rate.',
    'Thai or Emirati coated fabrics pay 12.5% plus the base rate. CAFTA-DR textile goods of Honduras, the Dominican Republic and Nicaragua '
    'entered under SPI P pay no Section 301 duty (note 52(i), 9903.05.95) on the 51 lines with a P rate; Guatemala and El Salvador are exempt '
    'on every line under CAFTA-DR (note 52(i) plus their 52(j) lists). Jordanian goods pay nothing extra, except adhesive tape (+10%, '
    '9903.05.50).',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Indonesia, Thailand, UAE, Switzerland, Jordan, Guatemala, El Salvador)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] in ('European Union', 'Japan', 'South Korea', 'Taiwan'):
        e['measure'] = 'Section 301 tariff (forced-labor investigations), rate in total'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)'
        e['now'] = '+10% (non-USMCA); +50% on 4 subheadings, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 (List 4A on one line)'
        e['now'] = '+37.5% (+20% on 5903.10.15)'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rates in lieu of column 2 (3 lines)'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
    if e['country'] == 'China':
        for sid in ('ad-canvas', 'ad-ribbons', 'ad-sacks-cn'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    if e['country'] == 'Taiwan' and 'ad-ribbons-tw-2026' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'ad-ribbons-tw-2026')
    if e['country'] == 'Vietnam' and 'ad-sacks-vn' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'ad-sacks-vn')

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on four Chapter 59 subheadings',
        '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 59 is on the motor-vehicle list (9903.03.14): plastic-coated '
        'man-made-fiber fabrics 5903.90.25 and other plastic-coated fabrics 5903.90.30, other coated man-made-fiber fabrics 5907.00.60 and '
        'other technical textiles 5911.90.00. Unlike the Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 59',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 59 line is on the general exemption list (note '
        '52(b)). EU and Taiwanese goods pay 10% in total, Japanese and Korean goods 12.5% in total. India, Cambodia and the UK +10%; Vietnam, '
        'Turkey and Israel +12.5%. CAFTA-DR textile goods entered duty-free under SPI P are exempt (note 52(i), 9903.05.95) — the 51 dutiable '
        'lines; Jordanian goods, and CAFTA-DR goods from Guatemala and El Salvador, are also exempt on every subheading except 5906.10.00 (note '
        '52(j)). USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 59 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
        '12.5% forced-labor tariff (9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 59 base-rate changes'
        c['detail'] = (
            'All 75 Chapter 59 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        # generator quirk: pending entries get the HTS release date; use the implementation notice date
        c['date'] = '2025-12-29'
        c['dateLabel'] = 'Published'
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 List 3 and List 4A continue after the four-year review',
        'detail': 'USTR announced that the 2018–2019 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
        'industries asked for them to continue. For Chapter 59 this keeps +25% (List 3) on 74 lines and +7.5% (List 4A) on 5903.10.15.',
        'before': '+25% / +7.5%',
        'now': '+25% / +7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ad-ribbons-tw-2026',
        'type': 'reference',
        'date': '2026-09-04',
        'dateLabel': 'Published',
        'title': 'Antidumping review: narrow woven ribbons from Taiwan',
        'detail': 'Commerce set an 83.67% dumping margin for Lace Fashions Industrial Co. and Trydent Co. for September 2023–August 2024. The '
        'order covers narrow woven ribbons with woven selvedge, which may also enter under 5903.90.10, 5903.90.25, 5903.90.3090, 5907.00.60 '
        'and 5907.00.80; the written scope, not the HTS number, decides coverage.',
        'before': None,
        'now': '83.67% (two exporters)',
        'countries': 'Taiwan',
        'sourceIds': ['ad-ribbons-tw-2026', 'ad-ribbons'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 59 entries unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. The four Chapter 59 '
        'subheadings on the 9903.03.14 list are the same in 2026 Revision 18 (before) and Revision 21 (after).',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11064', 'procl-11065', 'csms-69851916', 'hts-now'],
    },
    {
        'id': 's122-end',
        'type': 'extraDuty',
        'date': '2026-07-23',
        'dateLabel': 'Expired',
        'title': 'Section 122 import surcharge expired',
        'detail': 'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        'before': '+10%',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'usmca-review',
        'type': 'reference',
        'date': '2026-07-01',
        'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican '
        'and most Canadian Chapter 59 goods.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 59 subheading was on the product exemption list '
        '(9903.03.03). USMCA-qualifying goods from Canada and Mexico, and duty-free CAFTA-DR textile and apparel goods, were exempt.',
        'before': 'None',
        'now': '+10% (until July 23, 2026)',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'ieepa-end',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
        'Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered '
        'from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'before': 'Varied by country',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'india-oil-end',
        'type': 'extraDuty',
        'date': '2026-02-07',
        'dateLabel': 'Effective',
        'title': "India's extra 25% IEEPA duty removed",
        'detail': 'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% '
        'reciprocal rate on India ended with the other IEEPA duties on February 24.',
        'before': '+50%',
        'now': '+25% (until February 24, 2026)',
        'countries': 'India',
        'sourceIds': ['eo-14384'],
    },
    {
        'id': 'agoa-renewed',
        'type': 'reference',
        'date': '2026-02-03',
        'dateLabel': 'Signed',
        'title': 'AGOA reauthorized through December 31, 2026',
        'detail': 'The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025. In Chapter 59, AGOA (SPI D) is '
        'printed on five lines — PVC- and other plastic-coated cotton fabric (5903.10.10, 5903.90.10), rubberized adhesive tape (5906.10.00), '
        'man-made-fiber belts (5910.00.10) and filter cloth (5911.40.01). GSP (SPI A, A*) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'cn-ieepa-cut',
        'type': 'extraDuty',
        'date': '2025-11-10',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty cut to 10%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
        'February 24, 2026.',
        'before': '+20%',
        'now': '+10% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14357'],
    },
    {
        'id': 'india-oil',
        'type': 'extraDuty',
        'date': '2025-08-27',
        'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 '
        '(EO 14326): 50% in all on Indian coated fabrics, on top of the base rate. Ended February 7, 2026.',
        'before': '+25%',
        'now': '+50% (ended)',
        'countries': 'India',
        'sourceIds': ['eo-14329', 'eo-14326'],
    },
    {
        'id': 'country-rates',
        'type': 'extraDuty',
        'date': '2025-08-07',
        'dateLabel': 'Effective',
        'title': 'Country reciprocal rates replace the 10% baseline',
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Cambodia, Indonesia and Thailand +19%, Vietnam '
        '+20%, India +25%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% in total (9903.02.20) — every Chapter 59 line. Ended '
        'February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +25% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'br-ieepa',
        'type': 'extraDuty',
        'date': '2025-08-06',
        'dateLabel': 'Effective',
        'title': 'Additional 40% IEEPA duty on products of Brazil',
        'detail': 'Executive Order 14323 added 40% on Brazilian goods on top of the 10% reciprocal duty. Ended February 24, 2026; replaced from '
        'July 22, 2026 by the 25% Brazil Section 301 tariff.',
        'before': '+10%',
        'now': '+50% (ended)',
        'countries': 'Brazil',
        'sourceIds': ['eo-14323'],
    },
    {
        'id': 'ca-amended',
        'type': 'extraDuty',
        'date': '2025-07-31',
        'dateLabel': 'Signed',
        'title': 'Canada additional duty raised to 35%',
        'detail': 'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.',
        'before': '+25%',
        'now': '+35% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14325'],
    },
    {
        'id': 'cn-reciprocal-10',
        'type': 'extraDuty',
        'date': '2025-05-14',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese PU-coated '
        'fabric (7.5% base) then paid 7.5% + 25% (List 3) + 20% + 10% = 62.5% until November 9, 2025. Ended February 24, 2026.',
        'before': '+125%',
        'now': '+10% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14298'],
    },
    {
        'id': 'cn-125',
        'type': 'extraDuty',
        'date': '2025-04-10',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty raised to 125%',
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country '
        'rates announced on April 2 for other countries. With the 20% fentanyl duty and the 25% List 3 duty, Chinese PU-coated fabric paid '
        '177.5% until May 13, 2025.',
        'before': None,
        'now': '+125% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14266'],
    },
    {
        'id': 'reciprocal',
        'type': 'extraDuty',
        'date': '2025-04-02',
        'dateLabel': 'Signed',
        'title': 'Reciprocal tariff on products of all countries',
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 59 product '
        'was on the exemption annex. Ended February 24, 2026.',
        'before': 'None',
        'now': '+10% or more (ended)',
        'countries': 'All except Canada, Mexico',
        'sourceIds': ['eo-14257'],
    },
    {
        'id': 'cn-ieepa',
        'type': 'extraDuty',
        'date': '2025-03-04',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty raised to 20%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, '
        'on top of the List 3 duty. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+20% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14195', 'eo-14228'],
    },
    {
        'id': 'ad-sacks-cn',
        'type': 'reference',
        'date': '2025-02-27',
        'dateLabel': 'Published',
        'title': 'Antidumping and countervailing orders on laminated woven sacks from China continued',
        'detail': 'After the third sunset review the orders continue from February 20, 2025. Unfinished sacks in roll form may be classified in '
        '5903.90.25. A Vietnam order on the same product was continued from November 20, 2024.',
        'before': None,
        'now': 'Continued',
        'countries': 'China, Vietnam',
        'sourceIds': ['ad-sacks-cn', 'ad-sacks-vn'],
    },
    {
        'id': 'mx-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Mexico',
        'detail': '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Mexico',
        'sourceIds': ['eo-14194'],
    },
    {
        'id': 'ca-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Canada',
        'detail': '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14193'],
    },
    {
        'id': 'ad-canvas',
        'type': 'reference',
        'date': '2022-10-12',
        'dateLabel': 'Published',
        'title': 'Antidumping order on artist canvas from China continued',
        'detail': 'The order (A-570-899) covers primed or coated artist canvases — pre-stretched canvases, canvas panels, pads and rolls — '
        'classifiable in 5901.90.20, 5901.90.40, 5903.90.10, 5903.90.20, 5903.90.25, 5907.00.60 and 5907.00.80. Tracing cloth and '
        'paint-by-number canvases are excluded. Commerce listed it again among open orders on June 2, 2026.',
        'before': None,
        'now': 'Continued',
        'countries': 'China',
        'sourceIds': ['ad-canvas', 'ad-opp-2026'],
    },
    {
        'id': 'ad-ribbons',
        'type': 'reference',
        'date': '2022-03-17',
        'dateLabel': 'Published',
        'title': 'Antidumping and countervailing orders on narrow woven ribbons continued',
        'detail': 'The China (AD and CVD) and Taiwan (AD) orders on narrow woven ribbons with woven selvedge, up to 12 cm wide, continue. Covered '
        'ribbons may enter under Chapter 59 subheadings 5903.90.10, 5903.90.25, 5907.00.60 and 5907.00.80.',
        'before': None,
        'now': 'Continued',
        'countries': 'China, Taiwan',
        'sourceIds': ['ad-ribbons'],
    },
    {
        'id': 'cn-list4a',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'The List 4A duty (9903.88.15), in force from September 1, 2019 at 15%, was cut to 7.5%. In Chapter 59 List 4A covers only '
        '5903.10.15 (PVC-coated layered man-made-fiber fabric over 60% plastics).',
        'before': '+15%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2020-00904', 'fr-2019-17865'],
    },
    {
        'id': 'cn-list3-25',
        'type': 'extraDuty',
        'date': '2019-05-10',
        'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers every Chapter 59 subheading except 5903.10.15, and the '
        'rate has applied ever since.',
        'before': '+10%',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2019-09681'],
    },
    {
        'id': 'cn-list3',
        'type': 'extraDuty',
        'date': '2018-09-24',
        'dateLabel': 'Effective',
        'title': 'China Section 301 List 3 reaches coated fabrics and technical textiles',
        'detail': 'The third China Section 301 list put +10% on Chinese coated and laminated fabrics, tire cord, linoleum, wall coverings, wicks, '
        'hose, belts and technical textiles (headings 5901–5911).',
        'before': 'None',
        'now': '+10%',
        'countries': 'China',
        'sourceIds': ['fr-2018-20610'],
    },
    {
        'id': 'ad-belts-revoked',
        'type': 'reference',
        'date': '2000-09-12',
        'dateLabel': 'Published',
        'title': 'Antidumping orders on industrial belts revoked',
        'detail': 'Commerce revoked the 1989 antidumping orders on industrial belts from Germany, Italy, Singapore and Japan, whose HTS list '
        'included 5910.00.10 and 5910.00.90, effective January 1, 2000. No order on Chapter 59 belts has been issued since.',
        'before': 'Antidumping duty',
        'now': 'Revoked',
        'countries': 'Germany, Italy, Singapore, Japan',
        'sourceIds': ['ad-belts-revoked'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(
    tu,
    [
        'eo-14323',
        'procl-11064',
        'procl-11065',
        'csms-69851916',
        'procl-11012',
        'ustr-usmca-review',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14384',
        'ustr-agoa-2026',
        'procl-11030',
        'cbp-gsp',
        'eo-14357',
        'eo-14329',
        'eo-14326',
        'eo-14325',
        'eo-14298',
        'eo-14266',
        'eo-14257',
        'eo-14195',
        'eo-14228',
        'eo-14194',
        'eo-14193',
        'fr-2019-09681',
        'fr-2018-20610',
        'fr-2019-17865',
        'fr-2020-00904',
        'fr-2026-20510',
        'ad-canvas',
        'ad-ribbons',
        'ad-ribbons-tw-2026',
        'ad-sacks-cn',
        'ad-sacks-vn',
        'ad-belts-revoked',
        'ad-opp-2026',
        'hts-ch59',
    ],
)

stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
stats.append({'label': 'AD/CVD orders reaching the chapter', 'value': '3 products', 'note': 'artist canvas, narrow woven ribbons, laminated woven sacks'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 59: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

RULE_LABELS = {
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 59 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on four '
    'subheadings — 5903.90.25, 5903.90.30, 5907.00.60 and 5911.90.00 (9903.03.14) — whether or not USMCA is claimed.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on every line except 5903.10.15, which pays +7.5% List 4A '
    '(9903.88.15). Antidumping and countervailing duties on artist canvas, ribbons and woven sack fabric are not in the cells.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 59 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 59 line is on the UK exception list.',
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). No Chapter 59 line is exempt.',
    'Israel': 'U.S.–Israel FTA (IL) makes the base rate Free; + 12.5% Section 301 (9903.05.47), which applies even when the FTA is claimed.',
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28). No Chapter 59 line is on Cambodia\'s exception list.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27). No Chapter 59 line is on the Brazil exemption list.',
    'Japan': 'Japan: 12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.49); 5903.10.18 (14.1%) pays its base '
    'rate only (9903.05.48).',
    'South Korea': 'KORUS (KR) makes the base rate Free, and the Korean Section 301 rate makes the total 12.5% (9903.05.71) on every line.',
    'Costa Rica': 'CAFTA-DR (P) claimed: base rate Free and no Section 301 duty on the 51 dutiable lines (note 52(i), 9903.05.95). Lines whose '
    'General rate is already Free have no P rate and pay 12.5% (9903.05.33).',
    'Taiwan': 'Taiwan: 10% in total in place of the base rate when the base rate is under 10% (9903.05.76); 5903.10.18 (14.1%) pays its base '
    'rate only (9903.05.75). Antidumping duty on narrow woven ribbons is not in the cells.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — every Chapter 59 line except 5903.10.18 (14.1%), '
    'which pays its base rate only (9903.05.38). The 15%-in-total IEEPA rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies (for example Myanmar, Kenya) pay only the base rate. The 60 pay +10% or +12.5% '
            '(9903.05.20–9903.05.83), or 12.5% in total for Switzerland. Jordan is exempt on every Chapter 59 subheading except 5906.10.00 (note '
            '52(j)); CAFTA-DR textile goods entered under SPI P are exempt on the dutiable lines (note 52(i)), and Guatemala and El Salvador '
            'on all lines. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 '
            'rates — up to 88.5%.'
        )
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico') and 'eo-14389' not in ids:
        ids.insert(-1, 'eo-14389')
add_sources(ia, ['eo-14389'])

ia['seo'] = {
    'title': 'Coated Fabric & Industrial Textile Tariffs by Country 2026 — China, India, Vietnam, Mexico, Canada, EU (HTS Ch. 59) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on coated and laminated fabrics, tire cord, conveyor belts and technical textiles by country: '
    '10% for EU goods, 12.5% for Japan and Korea, 17.5% for Indian coated fabric, 18.3% for Vietnamese tire cord, up to 51.6% from China, 50% '
    'Section 338 on four Canadian subheadings.',
    'keywords': [
        'chapter 59 customs duty',
        'tariffs on fabric from china',
        'tariffs on fabric from india',
        'tariffs on fabric from canada',
        'tariffs on textiles from china',
        'us tariffs on textiles from india',
        'vietnam tire cord fabric tariff',
        'usmca technical textiles',
    ],
}
ia['intro'] = (
    'Chapter 59 base rates run from Free to 14.1%, and the extra duty **depends on where the goods come from**. Each cell below is the base rate '
    'for that product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+10% for India, Cambodia and the UK**, **+12.5% for Vietnam, Turkey and Israel**, **10% in total for Germany, Italy, the '
    'Netherlands and the rest of the EU and for Taiwan**, and **12.5% in total for Japan and South Korea**. **China adds 37.5%** (12.5% plus the '
    '25% List 3 duty). USMCA-qualifying goods from Mexico pay nothing; from Canada they pay nothing except on the **four subheadings with the '
    '50% Section 338 duty**, which no USMCA claim removes.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Costa Rica is shown with the CAFTA-DR claim (SPI P): on the 51 lines with a P rate the base rate is Free and the 12.5% Section 301 duty is '
    'lifted by U.S. note 52(i) (9903.05.95), which exempts CAFTA-DR textile and apparel goods (general note 29(d)(v)) entered duty-free; the 24 '
    'lines whose General rate is already Free carry no P rate, so the 12.5% stays.',
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on 5903.90.25, '
    '5903.90.30, 5907.00.60 and 5911.90.00 because U.S. note 51(a) applies it even when a special rate is claimed.',
    'Not in the cells: antidumping and countervailing duties (artist canvas from China; narrow woven ribbons from China and Taiwan; laminated '
    'woven sacks from China and Vietnam), which depend on the exporter and the order scope; the note 52(j) exemptions for Jordan, Guatemala '
    'and El Salvador and the note 52(i) CAFTA-DR textile relief for the CAFTA-DR countries other than Costa Rica (they are in "Any other '
    'country"); AGOA, CBERA and FTA preferences other than USMCA, KORUS, the Israel FTA and CAFTA-DR for Costa Rica; and the opt-in Section 232 treatment of certified automobile parts.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
    'Myanmar has no country code in the trade data and is counted in "Any other country"; it is not one of the 60 Section 301 economies and pays '
    'the base rate.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 2(aa), 16, 19, 20, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 '
    'general exemption list (note 52(b), 9903.05.86) has no Chapter 59 line. The country exception lists in note 52(j) cover every Chapter 59 '
    '8-digit subheading except 5906.10.00 for Jordan (9903.06.20), and for Guatemala (9903.06.06) and El Salvador (9903.06.09) when entered '
    'under CAFTA-DR; the Cambodia, Malaysia, Indonesia, Taiwan, Bangladesh, Argentina, Ecuador, EU, UK and other lists name no Chapter 59 line. '
    'Note 52(i) (9903.05.95) exempts CAFTA-DR textile and apparel goods entered duty-free under SPI P; general note 29(d)(v) reaches all of '
    'Chapter 59, so the relief covers the 51 dutiable lines. The Brazil list (note 50(a)(ii)) has no Chapter 59 line. The Canada Section 338 list (note 51(b)(3)) names 5903.90.25, 5903.90.30, '
    '5907.00.60 and 5911.90.00 — the same four in Revision 18, before the September 15, 2026 changes. China: List 3 (note 20(f)) covers every '
    'subheading except 5903.10.15, which is on List 4A (note 20(i)); the List 3 exclusions printed in note 20 for some coated fabrics '
    '(5901.90.40, 5903.10.20, 5903.20.20, 5903.20.25, 5903.90.20) have expired, and none of the exclusions in effect (note 20(vvv)) is in '
    'Chapter 59; no line is on the 2024 increases of note 31. Section 232: no Chapter 59 line is on the note 16 or 19 metal lists or on the '
    'note 33(g) automobile-parts list — tire cord fabric is not there — so Section 232 reaches Chapter 59 goods only if the importer elects to '
    'certify them as automobile or truck parts (9903.94.07, 9903.74.09). Note 30(b) sets 35% for Russian 5903.10.20 and 5910.00.90 in place of '
    'column 2. No Chapter 59 line was on the Section 122 exemption list (note 2(aa)(ii)). A Federal Register search of Commerce notices by '
    'Chapter 59 subheading found three antidumping/countervailing cases whose scopes name Chapter 59 numbers: artist canvas (China), narrow '
    'woven ribbons (China, Taiwan) and laminated woven sacks (China, Vietnam).'
)
add_sources(ia, ['ad-canvas', 'ad-ribbons', 'ad-sacks-cn', 'ad-sacks-vn'])

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 59: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Coated Fabric, Tire Cord & Technical Textile Imports by Country — HTS Chapter 59 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 59 goods: {fmt_usd(total)} in {Y}. Who supplies coated and laminated fabrics, tire cord, '
    'conveyor belts and technical textiles — Mexico, India, Canada, China, Vietnam, Japan, Germany — with values by product and year from UN '
    'Comtrade.',
    'keywords': [
        'hts chapter 59',
        'us coated fabric imports by country',
        'tire cord fabric imports',
        'technical textiles imports us',
        'india coated fabric exports to us',
        'vietnam tire cord exports',
        'hts 5911 imports',
        'hts 5903 imports',
    ],
}
ui['why'] = (
    f'U.S. imports of Chapter 59 goods were **{fmt_usd(total)} in {Y}**, {abs(TOTAL_CHG)}% less than the {fmt_usd(prior_total)} of {PY} and '
    f'below the {fmt_usd(year_tot[2022])} peak of 2022. Two headings carry most of it: **plastic-coated fabrics (5903)**, {fmt_usd(hy("5903"))}, '
    f'and **technical textiles (5911)**, {fmt_usd(hy("5911"))}. The single largest product is **5911.90 — gaskets, machinery parts and other '
    f'technical textile articles** ({fmt_usd(hs6("591190"))}), followed by other plastic-coated fabrics (5903.90, {fmt_usd(hs6("590390"))}) and '
    f'**polyester tire cord fabric** (5902.20, {fmt_usd(hs6("590220"))}).\n\n'
    f'**Mexico** ({fmt_usd(imp("Mexico"))}) is the largest supplier, almost all of it 5911 technical textiles ({fmt_usd(MX_5911)}) — goods that '
    f'can enter free under USMCA. **India** ({fmt_usd(imp("India"))}, {chg("India")}%) more than doubled since 2020 ({fmt_usd(imp_year("India", 2020))}) '
    f'and leads in coated fabrics ({fmt_usd(IN_5903)} of 5903). **China** fell {abs(chg("China"))}% to {fmt_usd(imp("China"))}, from '
    f'{fmt_usd(imp_year("China", 2020))} in 2020. **Vietnam** ({fmt_usd(imp("Viet Nam"))}) supplies most U.S. tire cord fabric imports '
    f'({fmt_usd(VN_5902)} of {fmt_usd(hy("5902"))}). Canada ({fmt_usd(imp("Canada"))}), Japan ({fmt_usd(imp("Japan"))}), Germany '
    f'({fmt_usd(imp("Germany"))}) and South Korea ({fmt_usd(imp("Rep. of Korea"))}) follow; Germany and Italy lead in textile conveyor belts '
    '(5910).\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs '
    'from July 24, 2026 and the Canada Section 338 duties from August 22); they do not show what those changes did. Duty-collected figures are '
    'not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 59: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Coated Fabrics, Tire Cord & Industrial Textiles into the U.S.: Origin Rules, Labeling, AD/CVD & Legal Ways to Lower '
    'Duty (HTS Ch. 59) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 59 line needs at U.S. entry — textile origin rules and manufacturer ID, country-of-origin '
    'marking, FTC textile labeling, antidumping scopes for artist canvas and ribbons — and the legal ways to pay less: plastic-content '
    'classification, origin, USMCA, FTAs, first sale, drawback, FTZ and rulings.',
    'keywords': [
        'pvc coated fabric tariff engineering',
        'usmca rule of origin for industrial textiles',
        'textile origin rules 19 cfr 102.21',
        'hs code for pvc coated fabric',
        'hs code of pu coated fabric',
        'first-sale-for-export valuation',
        'artist canvas antidumping',
        'cbp tariff engineering',
    ],
}
te['intro'] = (
    'Chapter 59 goods need no import license, but they are **textile products** under CBP\'s origin rules: their country of origin — which '
    'decides the extra duty — is generally where the **fabric was formed**, not where it was coated, laminated or cut (19 CFR 102.21), and every '
    'entry must name the manufacturer with a manufacturer identification code (19 CFR 102.23). Goods must be marked with their country of '
    'origin. Coated fabrics, belts and artists\' canvases are outside the FTC textile labeling rules, but uncoated fabrics sold for household '
    'use are not. Primed artist canvas from China, narrow woven ribbons from China and Taiwan and laminated woven sack fabric from China and '
    'Vietnam can owe **antidumping or countervailing duties**.\n\n'
    'On cost, the **plastic content and coating** decide the rate (a PU-coated man-made-fiber fabric pays 7.5%, the same fabric over 70% '
    'plastics by weight is Free), the **country of origin** decides the extra duty (+10% India, 10% in total EU, +37.5% China), and USMCA, FTAs, '
    'first-sale valuation, drawback and foreign-trade zones lower the bill further. Each lever depends on a document, listed below with its '
    'regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'plastic-content',
        'title': 'Classify by coating, fiber and plastic content',
        'saves': 'The gap between 5903 and 5906 lines: a man-made-fiber fabric coated with PVC, PU or other plastics pays 7.5% (8% or 14.1% for '
        'Section XI note 9 layered fabrics), but Free when it is over 70% rubber or plastics by weight (over 60% plastics for note 9 fabrics); '
        'cotton-based coated fabric pays 2.7%',
        'appliesTo': 'Headings 5903, 5906 and 5907 — coated, laminated and rubberized fabrics',
        'document': 'Technical data showing the fiber, the coating polymer, the weight share of plastics or rubber and whether the coating is '
        'visible, on one or both sides.',
        'caveat': 'Fabrics fully embedded in plastics, coated on both sides or too stiff to bend around a 7 mm cylinder are plastics of Chapter 39, '
        'and an invisible coating leaves the fabric in Chapters 50–55, 58 or 60 (Chapter 59 note 2). The declared classification must match the '
        'goods; a ruling settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 59, notes 2, 3, 5 and 6', 'url': CH59_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — where the fabric was formed',
        'saves': 'The difference between country rates: +10% for India, 10% in total for the EU, +12.5% for Vietnam, +37.5% for China',
        'appliesTo': 'All lines; the gap is widest on coated fabrics and tire cord from China',
        'document': 'Production records showing where the base fabric was woven or knitted (the "fabric-making process") and where any finishing '
        'took place; for hose and belts with non-textile parts, where they were wholly assembled.',
        'caveat': 'Coating, laminating, dyeing or cutting a fabric in a second country generally does not change its origin; for 5901–5903, 5905 '
        'and 5906–5907 finishing confers origin only when the fabric is both dyed and printed with two or more other finishing operations. The '
        'Section 301 and 338 duties follow the country of origin, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 102.21 (textile origin rules, headings 5901–5911)', 'url': ecfr(19, '102.21')},
            {'label': '19 CFR 102.23 (manufacturer identification)', 'url': ecfr(19, '102.23')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate (up to 14.1%) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, every line except 5903.90.25, 5903.90.30, 5907.00.60 and 5911.90.00',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on the four Canadian subheadings in U.S. note 51(b)(3). The good must meet the '
        'Chapter 59 rule of origin in General Note 11 for its subheading. The USMCA was not renewed at the July 1, 2026 joint review but remains '
        'in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim an FTA, AGOA or CBERA preference',
        'saves': 'The base rate, and for CAFTA-DR textile goods (SPI P) the 10%–12.5% Section 301 duty too (note 52(i)); Jordanian goods also '
        'skip the Section 301 duty on every line except 5906.10.00',
        'appliesTo': 'Dutiable lines whose Special column lists the program: Korea (KR), Israel (IL), CAFTA-DR (P), Jordan (JO), Colombia, Peru, '
        'Chile and the other FTA partners, CBERA (E, E*) and, on five lines, AGOA (D)',
        'document': 'The origin proof each program requires (a certification or declaration of origin, or the AGOA or CBERA documentation) and '
        'records to back it up.',
        'caveat': 'An FTA removes the base rate but, except where a note 52(j) list says otherwise, not the 2026 Section 301 duty (U.S. note 52(a)) '
        '— Korean and Israeli goods still pay 12.5%. The CAFTA-DR relief (9903.05.95) applies only when the P rate is claimed, so lines whose '
        'General rate is Free get no relief from Costa Rica, Honduras, the Dominican Republic or Nicaragua. AGOA runs to December 31, 2026. GSP (A, A*) has been expired since December 31, 2020, '
        'although its codes are still printed.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a), (j)', 'url': CH99_PDF},
            {'label': '19 CFR 10.178a (AGOA)', 'url': ecfr(19, '10.178a')},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–50% extra duties included — when the mill price to '
        'a trading company is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company or agent rather than straight from the mill',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the mill invoice, contracts '
        'and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or use in exported products',
        'saves': 'Up to 99% of the duties paid, when the imported fabric (or goods made from it, such as tires, belts or upholstered seats) is '
        'exported or destroyed',
        'appliesTo': 'Any line — for example tire cord built into tires or coated fabric sewn into products shipped abroad',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Use a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for fabric and belting used in production for export',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example belts or felts sent back from a foreign customer',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. notes 51(a) and 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification or scope ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: 5903 versus Chapter 39; 5910 textile belt versus 4010 rubber belt; '
        'a fabric on or off the Canada Section 338 list; and whether a canvas or ribbon falls inside an antidumping order',
        'appliesTo': 'Any line where the material, construction or use decides the line',
        'document': 'A ruling request to CBP describing the fabric, coating, weights and use; for antidumping scope, a scope ruling application '
        'to Commerce.',
        'caveat': 'Rulings apply to the transaction described; a changed construction may need a new one. The written scope of an antidumping '
        'order, not the HTS number, decides coverage.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
]

te['rules'] = [
    {
        'id': 'cbp-textile-origin',
        'agency': 'CBP',
        'title': 'Chapter 59 goods are "textile products": origin follows the specific rules for headings 5901–5911 — generally the country where '
        'the fabric was formed; coating or laminating alone does not confer origin',
        'citations': [{'label': '19 CFR 102.21', 'url': ecfr(19, '102.21')}],
    },
    {
        'id': 'cbp-mid',
        'agency': 'CBP',
        'title': 'Every commercial entry of textile products must identify the manufacturer (the maker that performed the origin-conferring '
        'operation) with a manufacturer identification code',
        'citations': [{'label': '19 CFR 102.23', 'url': ecfr(19, '102.23')}],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the goods or, '
        'for rolls and bulk fabric, their container or tag',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
        ],
    },
    {
        'id': 'cbp-invoice',
        'agency': 'CBP',
        'title': 'Invoices for textile fiber products must state the fiber content by weight, the manufacturer\'s FTC identification and the '
        'country where processed or manufactured',
        'citations': [{'label': '19 CFR 141.89', 'url': ecfr(19, '141.89')}],
    },
    {
        'id': 'ftc-textile',
        'agency': 'FTC',
        'title': 'Textile Fiber Products Identification Act: uncoated fabrics sold for household use need fiber-content, origin and dealer '
        'labels; coated fabrics, belts and artists\' canvases, and industrial articles not listed in the rule, are excluded',
        'citations': [
            {'label': '16 CFR 303.45 (coverage and exclusions)', 'url': ecfr(16, '303.45')},
            {'label': '16 CFR 303.33 (country of origin)', 'url': ecfr(16, '303.33')},
        ],
    },
    {
        'id': 'ita-adcvd',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Antidumping and countervailing cash deposits: primed artist canvas from China (5901.90, some 5903.90 and 5907.00); narrow woven '
        'ribbons from China and Taiwan (may enter under 5903.90 and 5907.00); laminated woven sack fabric in rolls from China and Vietnam '
        '(5903.90.25). Coverage follows the written scope',
        'citations': [
            {'label': '87 FR 61568 (artist canvas, China)', 'url': NEW_SOURCES['ad-canvas']['url']},
            {'label': '87 FR 15205 (narrow woven ribbons, China and Taiwan)', 'url': NEW_SOURCES['ad-ribbons']['url']},
            {'label': '90 FR 10809 (laminated woven sacks, China)', 'url': NEW_SOURCES['ad-sacks-cn']['url']},
            {'label': '89 FR 94707 (laminated woven sacks, Vietnam)', 'url': NEW_SOURCES['ad-sacks-vn']['url']},
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or its note 52(j) exemption), China '
        'List 3 (9903.88.03) or List 4A (9903.88.15), Brazil (9903.05.01), Canada Section 338 (9903.03.14), Russia (9903.90.08)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
]

GROUP_RULES = {
    '5901': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-invoice', 'ftc-textile', 'ita-adcvd', 'cbp-ch99'],
    '5902': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
    '5903': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-invoice', 'ftc-textile', 'ita-adcvd', 'cbp-ch99'],
    '5904': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
    '5905': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
    '5906': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-invoice', 'ftc-textile', 'cbp-ch99'],
    '5907': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-invoice', 'ftc-textile', 'ita-adcvd', 'cbp-ch99'],
    '5908': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
    '5909': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
    '5910': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
    '5911': ['cbp-textile-origin', 'cbp-mid', 'cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '5901': 'Primed artist canvas from China (5901.90.20, 5901.90.40) is under antidumping order A-570-899; tracing cloth and paint-by-number '
    'canvases are excluded. Artists\' canvases are outside the FTC labeling rule.',
    '5902': 'Tire cord fabric is not on the Section 232 automobile-parts list (note 33(g)). Origin is where the cord fabric was woven.',
    '5903': 'The plastic content decides the line: Free above 70% plastics (60% for note 9 fabrics). 5903.90.25 and 5903.90.30 from Canada pay '
    'the 50% Section 338 duty even under USMCA; 5903.10.15 is the only China List 4A line. Coated fabrics are outside the FTC labeling rule. '
    'Some canvas, ribbon and woven-sack-fabric shipments fall under antidumping orders.',
    '5904': 'Linoleum is Free from every column 1 country; only the extra duty by country applies.',
    '5905': 'Wall coverings must be in rolls at least 45 cm wide (note 4); flock on paper is heading 4814.',
    '5906': '5906.10.00 rubberized adhesive tape is the one line not on the Jordan, Guatemala and El Salvador exception lists. Rubber-coated belts are '
    'heading 4010, not 5906 or 5910.',
    '5907': '5907.00.60 from Canada pays the 50% Section 338 duty even under USMCA. Painted theatrical scenery is Free.',
    '5908': 'Candle and lamp wicks: 3.4%.',
    '5909': 'Hose with metal fittings or armor takes its origin from where it was wholly assembled.',
    '5910': 'Belts of rubber-coated fabric and belting under 3 mm thick are not here (note 7). The 1989 antidumping orders on industrial belts '
    'were revoked in 2000.',
    '5911': '5911.90.00 from Canada pays the 50% Section 338 duty even under USMCA. Paper-machine felts and forming fabrics are 5911.31–5911.32.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

ADCVD_SUBS = {'5901.90.20', '5901.90.40', '5903.90.10', '5903.90.20', '5903.90.25', '5903.90.30', '5907.00.60', '5907.00.80'}
FTC_HEADINGS = {'5901', '5903', '5906', '5907'}
PLASTIC_HEADINGS = {'5903', '5906', '5907'}
row_by_hts = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
for ln in te['lines']:
    sub = ln['hts'][:10]
    h = sub[:4]
    rules = ['cbp-textile-origin', 'cbp-mid', 'cbp-marking']
    if h in FTC_HEADINGS:
        rules += ['cbp-invoice', 'ftc-textile']
    if sub in ADCVD_SUBS:
        rules.append('ita-adcvd')
    rules.append('cbp-ch99')
    ln['ruleIds'] = rules
    gen = ln.get('general')
    if gen is None:
        gen = row_by_hts[ln['hts']]['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if h in PLASTIC_HEADINGS:
        levers.append('plastic-content')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Which line a fabric falls in, '
    'where it originates, whether it is inside an antidumping order and which Chapter 99 duties apply depend on the facts of each shipment, and '
    'the extra duties change by Federal Register notice and CBP guidance; confirm the current headings before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 59: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Coated Fabric, Tire Cord & Industrial Textile Tariff FAQ: China, India, Canada, HS Codes 5903, 5902, 5910, 5911 (HTS Ch. 59) '
    '| KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on coated fabrics and industrial textiles: tariffs on fabric from China, '
    'India and Canada, and the HS codes for PVC and PU coated fabric, faux leather, tire cord fabric, conveyor belts, filter cloth, canvas and '
    'adhesive tape.',
    'keywords': [
        'hts chapter 59',
        'hs code 5903',
        'hs code for pvc coated fabric',
        'hs code of pu coated fabric',
        'hs code for synthetic leather',
        'tire cord fabric hs code',
        'hs code for conveyor belt',
        'hs code 5911',
        'tariffs on fabric from china',
        'tariffs on fabric from india',
        'tariffs on fabric from canada',
        'hs code for filter cloth',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for coated and laminated fabrics, tire cord fabric, '
    'conveyor belts and technical textiles. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    '51 of the 75 Chapter 59 lines carry a base duty, from 2.6% to 14.1%: 7.5%–8% for most coated man-made-fiber fabrics, 5.8% for nylon and '
    'polyester tire cord, 4% for man-made-fiber belts, 3.8% for paper-machine felts; linoleum and wall coverings are Free.',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% for India, Cambodia and the UK, +12.5% for Vietnam, Turkey and Israel, '
    '10% in total for the EU and Taiwan, 12.5% in total for Japan and South Korea.',
    'China pays the most: +12.5% plus +25% (List 3) on 74 lines — 45% on PU-coated fabric, 43.3% on tire cord, 41.5% on conveyor belts.',
    'USMCA-qualifying goods from Mexico pay nothing. From Canada, four subheadings — 5903.90.25, 5903.90.30, 5907.00.60, 5911.90.00 — pay a 50% '
    'Section 338 duty even under USMCA.',
    'The IEEPA duties (up to 177.5% on Chinese coated fabric in spring 2025, 50% on India from August 2025) ended February 24, 2026; the 10% '
    'Section 122 surcharge ended July 23, 2026.',
    'Antidumping orders reach primed artist canvas from China, narrow woven ribbons from China and Taiwan and laminated woven sack fabric from '
    'China and Vietnam. Origin is where the fabric was formed — coating it elsewhere does not change it.',
]
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'

cn, inn, ca, mx = (by_c_all[n] for n in ('China', 'India', 'Canada', 'Mexico'))
fc['faqs'] = [
    {
        'id': 'what-is-ch59',
        'question': 'What does HTS Chapter 59 cover?',
        'searchedAs': ['hts chapter 59', 'htsus chapter 59'],
        'answer': 'Chapter 59 covers textile fabrics impregnated, coated, covered or laminated with plastics (5903), rubber (5906), gum or starch '
        '(5901) or other materials (5907); tire cord fabric (5902); linoleum (5904); textile wall coverings (5905); wicks (5908); textile hose '
        '(5909); conveyor and transmission belts (5910); and technical textiles such as paper-machine felts, bolting cloth, filter cloth and '
        f'printers\' blankets (5911). Its 75 lines carry base rates from Free to 14.1%. U.S. imports were {fmt_usd(total)} in {Y}.',
        'link': '',
    },
    {
        'id': 'china-fabric',
        'question': 'What are the tariffs on coated fabric from China?',
        'searchedAs': ['tariffs on fabric from china', 'tariffs on fabric from china to usa', 'tariffs on textiles from china', 'us tariff on china for fabrics'],
        'answer': 'Chinese Chapter 59 goods pay the base rate plus 12.5% (2026 Section 301, 9903.05.31) plus 25% (List 3, 9903.88.03): 45% on '
        'PU- or PVC-coated man-made-fiber fabric (7.5% base), 51.6% on layered PVC fabric of 5903.10.18, 43.3% on nylon or polyester tire cord, '
        '41.5% on man-made-fiber conveyor belts. 5903.10.15 is on List 4A instead (+7.5%), for 20% in total. Primed artist canvas also owes '
        f'antidumping duty. China supplied {fmt_usd(cn["importsUsd"])} in {Y}, {abs(chg("China"))}% less than in {PY}.',
        'link': 'industry-areas',
    },
    {
        'id': 'india-fabric',
        'question': 'What are the U.S. tariffs on coated fabric and textiles from India?',
        'searchedAs': ['tariffs on fabric from india', 'tariffs on textiles from india', 'tariff on textiles from india to usa', 'us tariffs on textiles from india'],
        'answer': 'Since July 24, 2026 Indian Chapter 59 goods pay the base rate plus 10% Section 301 (9903.05.44): 17.5% for PU- or PVC-coated '
        'man-made-fiber fabric, 18% for laminated or PU note 9 fabrics, 12.7% for coated cotton fabric, 15.8% for tire cord. The IEEPA duties on '
        f'India — 50% from August 27, 2025 — ended in February 2026. India supplied {fmt_usd(inn["importsUsd"])} in {Y}, most of it coated fabric.',
        'link': 'industry-areas',
    },
    {
        'id': 'canada-fabric',
        'question': 'Are there tariffs on fabric from Canada?',
        'searchedAs': ['tariffs on fabric from canada', 'are there tariffs on fabric from canada', 'tariffs on textiles from canada', 'us tariffs on canada fabric'],
        'answer': 'USMCA-qualifying Chapter 59 goods from Canada pay no base duty and no Section 301 duty — except four subheadings on the Section 338 '
        'list (5903.90.25, 5903.90.30, 5907.00.60 and 5911.90.00), which pay 50% since August 22, 2026 even under USMCA. Goods that do not qualify '
        f'pay the base rate plus 10% (plus 50% on those four). Canada supplied {fmt_usd(ca["importsUsd"])} of Chapter 59 goods in {Y}.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-coated',
        'question': 'What is the HS code for PVC or PU coated fabric?',
        'searchedAs': ['hs code for coated fabric', 'hs code for pvc coated fabric', 'hs code of pu coated fabric', 'pvc coated fabric hs code', 'hs code 5903', 'hts code 5903'],
        'answer': 'Fabrics coated or laminated with plastics are heading 5903: with PVC 5903.10, with polyurethane 5903.20, with other plastics '
        '5903.90. For man-made-fiber fabric the U.S. line depends on the plastic content: over 70% plastics by weight 5903.10.20, 5903.20.20 or '
        '5903.90.20 (Free); otherwise 5903.10.25, 5903.20.25 or 5903.90.25 (7.5%). Coated cotton is 5903.10.10, 5903.20.10 or 5903.90.10 '
        '(2.7%). A fabric coated on both sides or completely embedded in plastics is Chapter 39.',
        'link': '',
    },
    {
        'id': 'hs-faux-leather',
        'question': 'What is the HS code for synthetic or faux leather?',
        'searchedAs': ['hs code for synthetic leather', 'hs code for artificial leather', 'hs code for faux leather', 'hs code for pu synthetic leather', 'hs code for pvc leather'],
        'answer': 'Faux leather made of a knitted or woven textile base coated on one side with PU or PVC is heading 5903 — usually 5903.20.25 '
        '(PU, 7.5%) or 5903.10.25 (PVC, 7.5%), or Free under 5903.20.20 / 5903.10.20 when plastics are over 70% of the weight. Fabric '
        'completely embedded in plastics or coated on both sides, and cellular plastic sheet where the fabric only reinforces, are Chapter 39 '
        '(Chapter 59 note 2). Finished bags of '
        'synthetic leather are heading 4202.',
        'link': '',
    },
    {
        'id': 'hs-tire-cord',
        'question': 'What is the HS code for tire cord fabric?',
        'searchedAs': ['tire cord fabric hs code', 'hs code 5902', 'hs code 5902.20', 'hs code 5902.10', 'tire cord fabric'],
        'answer': 'Tire cord fabric of high-tenacity yarn is heading 5902: nylon or other polyamides 5902.10.00.00 (5.8%), polyesters '
        '5902.20.00.00 (5.8%), other (viscose rayon) 5902.90.00.00 (Free). From Vietnam, the largest supplier, polyester tire cord pays 18.3% in '
        'total; from China 43.3%. Tire cord fabric is not on the Section 232 auto-parts list.',
        'link': '',
    },
    {
        'id': 'hs-conveyor',
        'question': 'What is the HS code for a conveyor belt or V-belt?',
        'searchedAs': ['hs code for conveyor belt', 'hs code for pvc conveyor belt', 'hs code 5910', 'hs code for v belt', 'hs code for rubber conveyor belt'],
        'answer': 'Conveyor and transmission belts of textile material, including those coated with plastics such as PVC, are heading 5910: '
        '5910.00.10 for man-made fibers (4%; V-belts .10.10, synchronous belts .10.20, belting .10.60–.70) and 5910.00.90 for other fibers '
        '(2.6%). Belts of rubber-coated fabric or rubberized cord, and belting under 3 mm thick, are not here: rubber belts are heading 4010.',
        'link': '',
    },
    {
        'id': 'hs-5911',
        'question': 'What does HS code 5911 cover?',
        'searchedAs': ['hs code 5911', 'hs code 5911.90', 'hs code 5911.32', 'hs code 5911.10', '5911 hs code description'],
        'answer': 'Heading 5911 covers textile products for technical uses: rubber-coated card clothing and printers\' blankets (5911.10, '
        '2.9%–3.8%), bolting cloth and screen-printing fabric (5911.20, Free–3.3%), paper-machine felts and forming fabrics (5911.31 under 650 '
        'g/m², 5911.32 650 g/m² or more, 3.8%), filter cloth for oil presses (5911.40, 8%) and other technical articles such as gaskets and '
        'packing cords (5911.90, 3.8%). 5911.90.00 from Canada pays the 50% Section 338 duty.',
        'link': '',
    },
    {
        'id': 'hs-filter',
        'question': 'What is the HS code for filter cloth?',
        'searchedAs': ['hs code for filter cloth', 'hs code for filter fabric', 'hsn code of filter cloth', 'hs code for filter media'],
        'answer': 'Filtering and straining cloth of a kind used in oil presses or the like, including that of human hair, is 5911.40.01.00 (8%). '
        'Other industrial filter fabrics in the piece of a kind used for technical purposes are usually 5911.90.00 (3.8%), and made-up filter '
        'bags can be 5911.90 too. Plain fabrics with no technical character stay in Chapters 50–55 or 60.',
        'link': '',
    },
    {
        'id': 'hs-canvas',
        'question': 'What is the HS code for artist canvas, and is there an antidumping duty?',
        'searchedAs': ['hs code for canvas', 'hs code for canvas painting', 'hs code for canvas fabric', 'hs code for canvas print'],
        'answer': 'Prepared painting canvas is 5901.90.20.00 (man-made fibers, 7%) or 5901.90.40.00 (cotton and other, 4.1%). Primed artist canvas '
        'from China — stretched canvases, panels, pads and rolls — is also under antidumping order A-570-899, continued in 2022. Printed canvas '
        'art is Chapter 49 or 97, and canvas bags heading 4202.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'hs-tape',
        'question': 'What is the HS code for cloth adhesive tape?',
        'searchedAs': ['hs code for adhesive tape', 'hs code for duct tape', 'hs code for self adhesive tape', 'hs code 5906.10'],
        'answer': 'Rubberized textile adhesive tape not over 20 cm wide is 5906.10.00.00 (2.9%). Tapes with a plastic backing are Chapter 39 '
        '(3919), and paper tapes Chapter 48. 5906.10.00 is the one Chapter 59 line not on the Jordan, Guatemala and El Salvador Section 301 '
        'exception lists (CAFTA-DR tape entered under SPI P is still exempt under note 52(i)).',
        'link': '',
    },
    {
        'id': 'linoleum-wall',
        'question': 'What is the HS code for linoleum and textile wall coverings?',
        'searchedAs': ['hs code for linoleum', 'hs code for linoleum flooring', 'hs code for textile wall covering', 'hs code for wall covering'],
        'answer': 'Linoleum is 5904.10.00.00 and other floor coverings of a coating on a textile backing 5904.90; textile wall coverings in rolls at '
        'least 45 cm wide are 5905.00. All are Free from column 1 countries, so only the extra duty by country applies — 10% in total from the EU '
        'or the UK, 37.5% from China. Vinyl flooring is Chapter 39.',
        'link': '',
    },
    {
        'id': 'fire-hose-wick',
        'question': 'What are the HS codes for fire hose and candle wick?',
        'searchedAs': ['hs code for fire hose', 'hs code for fire hose pipe', 'hs code for candle wick'],
        'answer': 'Textile fire hose and similar tubing is heading 5909: 5909.00.10.00 of vegetable fibers (Free) or 5909.00.20.00 of other fibers '
        '(3.3%). Woven, plaited or knitted wicks for candles, lamps, stoves and lighters are 5908.00.00.00 (3.4%). Rubber hose is Chapter 40.',
        'link': '',
    },
]

# ---------------------------------------------------------------------------------------------------
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
