#!/usr/bin/env python3
"""Fill the writer TODOs of the generated Chapter 48 content file (re-runnable).

Usage: python3 fill48.py <generated.json> <out.json>
Input is the untouched output of `pnpm tariff:generate-chapter --chapter 48 ...` (see run.sh);
the data parts (rate table, matrix totals, trade figures, line statuses) are kept as generated.

Facts checked against HTSUS 2026 Revision 21 Chapter 99 subchapter III U.S. notes:
  note 51(b)(1) (9903.03.12): 4804.11.00, 4806.20.00, 4810.13.19, 4811.59.60, 4811.90.80, 4811.90.90
  note 51(b)(3) (9903.03.14): 4802.55.10, 4802.61.10/.20/.60, 4802.62.10/.20/.30/.61, 4802.69.10/.20/.30, 4810.29.10,
      4810.92.12, 4811.51.20/.40, 4813.10.00, 4814.20.00, 4817.10.00, 4818.30.00, 4818.90.0020, 4819.10.00, 4819.40.00,
      4819.50.40, 4820.10.20, 4820.30.00, 4821.90.40, 4823.69.00, 4823.70.00, 4823.90.10/.67/.86
      (Rev 18 instead had 4803.00.40 and all of 4818.90.00 and no 4802.61-4802.69: Proclamation 11065, from Sept 15, 2026)
  note 51(d), 50(a)(iv), 52(d) civil aircraft lists: 4823.90.10-4823.90.86 only
  note 50(a)(ii) (Brazil exemptions), 52(b), 52(c), 52(e), 52(j): no Chapter 48 provision
  note 20(f) List 3: every Ch. 48 subheading except 4814.20, 4814.90.02, 4818.90.00, which are on List 4A (note 20(r)? 9903.88.15)
  note 20 product exclusions in effect (9903.88.69/.70): none for Chapter 48
  note 2(v)(iii) (ended reciprocal tariff exemptions): 4820.20.00 only; Section 122 product exemptions (9903.03.03): none
Lacey Act: Chapter 48 is not in any phase of APHIS's declaration schedule (latest: Phase VII, 89 FR 47122), so it is left out.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FILLS  # noqa: E402,F401

import json
import sys

SCRATCH = FILLS + "/48"
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
reuse = {s['id']: s for s in json.load(open(f'{SCRATCH}/reuse-sources.json'))}

TODAY = '2026-10-13'
ECFR_DATE = '2026-10-08'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH48 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2048'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
FR = 'https://www.federalregister.gov/documents/'
ECFR19 = 'https://www.ecfr.gov/current/title-19/'
ECFR21 = 'https://www.ecfr.gov/current/title-21/'


def fr(id_, citation, document, title, published, path, signed=None, publisher='Federal Register'):
    return {'id': id_, 'publisher': publisher, 'citation': citation, 'document': document, 'title': title,
            'signed': signed, 'published': published, 'url': FR + path}


NEW = [
    {'id': 'hts-ch48', 'publisher': 'USITC', 'citation': 'HTSUS 2026 Revision 21, Chapter 48', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 48', 'signed': None, 'published': '2026-10-07', 'url': CH48},
    {'id': 'csms-69326983', 'publisher': 'CBP', 'citation': 'CSMS # 69326983', 'document': 'CSMS message',
     'title': 'GUIDANCE: Section 301 Forced Labor Import Duties', 'signed': None, 'published': '2026-07-23',
     'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887'},
    {'id': 'csms-69302472', 'publisher': 'CBP', 'citation': 'CSMS # 69302472', 'document': 'CSMS message',
     'title': 'GUIDANCE: Section 301 Duties on Certain Products from Brazil', 'signed': None, 'published': '2026-07-21',
     'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42178c8'},
    # AD/CVD orders and events (Commerce ITA / USITC)
    fr('fr-2026-01283', '91 FR 2910', 'Notice (Commerce)',
       "Lightweight Thermal Paper From the People's Republic of China: Continuation of Antidumping Duty and Countervailing Duty Orders",
       '2026-01-23', '2026/01/23/2026-01283/lightweight-thermal-paper-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-and'),
    fr('fr-2021-25365', '86 FR 66284', 'Notice (Commerce)', 'Thermal Paper From Germany, Japan, the Republic of Korea, and Spain: Antidumping Duty Orders',
       '2021-11-22', '2021/11/22/2021-25365/thermal-paper-from-germany-japan-the-republic-of-korea-and-spain-antidumping-duty-orders'),
    fr('fr-2026-20136', '91 FR 62555', 'Notice (USITC)', 'Thermal Paper From Germany, Japan, South Korea, and Spain; Institution of Five-Year Reviews',
       '2026-10-01', '2026/10/01/2026-20136/thermal-paper-from-germany-japan-south-korea-and-spain-institution-of-five-year-reviews'),
    fr('fr-2022-02686', '87 FR 7426', 'Notice (Commerce)',
       "Certain Uncoated Paper From Australia, Brazil, the People's Republic of China, Indonesia, and Portugal: Continuation of Antidumping Duty and Countervailing Duty Orders",
       '2022-02-09', '2022/02/09/2022-02686/certain-uncoated-paper-from-australia-brazil-the-peoples-republic-of-china-indonesia-and-portugal'),
    fr('fr-2022-12706', '87 FR 35733', 'Notice (Commerce)',
       "Coated Paper Suitable for High-Quality Print Graphics Using Sheet-Fed Presses From Indonesia and the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders",
       '2022-06-13', '2022/06/13/2022-12706/coated-paper-suitable-for-high-quality-print-graphics-using-sheet-fed-presses-from-indonesia-and-the'),
    fr('fr-2025-04764', '90 FR 13139', 'Notice (Commerce)',
       "Certain Paper Plates From the People's Republic of China, Thailand, and the Socialist Republic of Vietnam: Antidumping Duty Orders",
       '2025-03-20', '2025/03/20/2025-04764/certain-paper-plates-from-the-peoples-republic-of-china-thailand-and-the-socialist-republic-of'),
    fr('fr-2025-04765', '90 FR 13135', 'Notice (Commerce)',
       "Certain Paper Plates From the People's Republic of China and the Socialist Republic of Vietnam: Countervailing Duty Orders",
       '2025-03-20', '2025/03/20/2025-04765/certain-paper-plates-from-the-peoples-republic-of-china-and-the-socialist-republic-of-vietnam'),
    fr('fr-2026-13973', '91 FR 42709', 'Notice (Commerce)',
       "Certain Paper Plates From the People's Republic of China: Preliminary Affirmative Determination of Circumvention of the Antidumping Duty and Countervailing Duty Orders (Cambodia)",
       '2026-07-10', '2026/07/10/2026-13973/certain-paper-plates-from-the-peoples-republic-of-china-preliminary-affirmative-determination-of'),
    fr('fr-2026-13974', '91 FR 42713', 'Notice (Commerce)',
       "Certain Paper Plates From the People's Republic of China: Preliminary Affirmative Determination of Circumvention of the Antidumping Duty and Countervailing Duty Orders (Malaysia)",
       '2026-07-10', '2026/07/10/2026-13974/certain-paper-plates-from-the-peoples-republic-of-china-preliminary-affirmative-determination-of'),
    fr('fr-2021-25772', '86 FR 67437', 'Notice (Commerce)',
       "Certain Tissue Paper Products From the People's Republic of China: Continuation of the Antidumping Duty Order",
       '2021-11-26', '2021/11/26/2021-25772/certain-tissue-paper-products-from-the-peoples-republic-of-china-continuation-of-the-antidumping'),
    fr('fr-2026-20137', '91 FR 62547', 'Notice (USITC)', 'Certain Tissue Paper Products From China; Institution of a Five-Year Review',
       '2026-10-01', '2026/10/01/2026-20137/certain-tissue-paper-products-from-china-institution-of-a-five-year-review'),
    fr('fr-2026-16056', '91 FR 50789', 'Notice (Commerce)',
       "Certain Tissue Paper Products From the People's Republic of China: Initiation of Circumvention Inquiry of the Antidumping Duty Order",
       '2026-08-06', '2026/08/06/2026-16056/certain-tissue-paper-products-from-the-peoples-republic-of-china-initiation-of-circumvention-inquiry'),
    fr('fr-2026-14972', '91 FR 46773', 'Notice (Commerce)',
       "Certain Crepe Paper Products From the People's Republic of China: Continuation of Antidumping Duty Order",
       '2026-07-24', '2026/07/24/2026-14972/certain-crepe-paper-products-from-the-peoples-republic-of-china-continuation-of-antidumping-duty'),
    fr('fr-2023-17811', '88 FR 56591', 'Notice (Commerce)',
       "Certain Lined Paper Products From India and the People's Republic of China: Continuation of Antidumping Duty Orders and Countervailing Duty Order",
       '2023-08-18', '2023/08/18/2023-17811/certain-lined-paper-products-from-india-and-the-peoples-republic-of-china-continuation-of'),
    fr('fr-2023-26336', '88 FR 83532', 'Notice (Commerce)',
       "Certain Folding Gift Boxes From the People's Republic of China: Continuation of the Antidumping Duty Order",
       '2023-11-30', '2023/11/30/2023-26336/certain-folding-gift-boxes-from-the-peoples-republic-of-china-continuation-of-the-antidumping-duty'),
    fr('fr-2024-15746', '89 FR 58334', 'Notice (Commerce)',
       "Certain Paper Shopping Bags From Cambodia, Colombia, India, Malaysia, Portugal, Taiwan, the People's Republic of China, and the Socialist Republic of Vietnam: Antidumping Duty Orders",
       '2024-07-18', '2024/07/18/2024-15746/certain-paper-shopping-bags-from-cambodia-colombia-india-malaysia-portugal-taiwan-the-peoples'),
    fr('fr-2024-15747', '89 FR 58331', 'Notice (Commerce)',
       "Certain Paper Shopping Bags From the People's Republic of China and India: Countervailing Duty Orders",
       '2024-07-18', '2024/07/18/2024-15747/certain-paper-shopping-bags-from-the-peoples-republic-of-china-and-india-countervailing-duty-orders'),
    fr('fr-2024-10253', '89 FR 39586', 'Notice (Commerce)', 'Certain Paper Shopping Bags From the Republic of Türkiye: Antidumping Duty Order',
       '2024-05-09', '2024/05/09/2024-10253/certain-paper-shopping-bags-from-the-republic-of-trkiye-antidumping-duty-order'),
    fr('fr-2023-25688', '88 FR 81048', 'Notice (Commerce)',
       "Paper File Folders From the People's Republic of China, India, and the Socialist Republic of Vietnam: Antidumping Duty Orders; and Paper File Folders From India: Countervailing Duty Order",
       '2023-11-21', '2023/11/21/2023-25688/paper-file-folders-from-the-peoples-republic-of-china-india-and-the-socialist-republic-of-vietnam'),
    fr('fr-2025-18886', '90 FR 46553', 'Notice (Commerce)', 'Paper File Folders From Sri Lanka: Antidumping Duty Order',
       '2025-09-29', '2025/09/29/2025-18886/paper-file-folders-from-sri-lanka-antidumping-duty-order'),
    fr('fr-2026-03419', '91 FR 8205', 'Notice (Commerce)', 'Paper File Folders From the Kingdom of Cambodia: Countervailing Duty Order',
       '2026-02-20', '2026/02/20/2026-03419/paper-file-folders-from-the-kingdom-of-cambodia-countervailing-duty-order'),
    fr('fr-2026-01604', '91 FR 3431', 'Notice (Commerce)',
       "Thermoformed Molded Fiber Products From the People's Republic of China and the Socialist Republic of Vietnam: Antidumping Duty Orders",
       '2026-01-27', '2026/01/27/2026-01604/thermoformed-molded-fiber-products-from-the-peoples-republic-of-china-and-the-socialist-republic-of'),
    fr('fr-2026-01605', '91 FR 3437', 'Notice (Commerce)',
       "Thermoformed Molded Fiber Products From the People's Republic of China and the Socialist Republic of Vietnam: Countervailing Duty Orders",
       '2026-01-27', '2026/01/27/2026-01605/thermoformed-molded-fiber-products-from-the-peoples-republic-of-china-and-the-socialist-republic-of'),
    fr('fr-2026-18723', '91 FR 58174', 'Notice (USITC)',
       'Corrugated Pizza Boxes From China, Malaysia, and Turkey; Institution of Antidumping and Countervailing Duty Investigations and Scheduling of Preliminary Phase Investigations',
       '2026-09-14', '2026/09/14/2026-18723/corrugated-pizza-boxes-from-china-malaysia-and-turkey-institution-of-antidumping-and-countervailing'),
    fr('fr-2026-20257', '91 FR 62690', 'Notice (Commerce)',
       "Notice of Extension of the Deadline for Determining the Adequacy of the Antidumping and Countervailing Duty Petitions: Certain Corrugated Die-Cut Cardboard Boxes From the People's Republic of China, Malaysia, and the Republic of Türkiye",
       '2026-10-02', '2026/10/02/2026-20257/notice-of-extension-of-the-deadline-for-determining-the-adequacy-of-the-antidumping-and'),
    fr('procl-10976', '90 FR 48127', 'Proclamation 10976', 'Adjusting Imports of Timber, Lumber, and Their Derivative Products Into the United States',
       '2025-10-06', '2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states', signed='2025-09-29'),
]
for sid in ['eo-14193', 'eo-14194', 'eo-14195', 'eo-14228', 'eo-14231', 'eo-14232', 'eo-14257', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14323',
            'eo-14325', 'eo-14326', 'eo-14357', 'eo-14389', 'csms-67834313', 'scotus-24-1287', 'procl-11012', 'ustr-usmca-review']:
    NEW.append(reuse[sid])
NEWBY = {s['id']: s for s in NEW}


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(NEWBY[sid])
            have.add(sid)


d['asOf'] = TODAY
d['chapter']['title'] = 'Paper and Paperboard; Articles of Paper Pulp, of Paper or of Paperboard'
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 48 notes (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': '2020–2025 U.S. import figures'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Line sets (from the 2026 Revision 21 Chapter 99 notes and the AD/CVD order scopes)
# ---------------------------------------------------------------------------------------------------------------------
S338_B1 = ['4804.11.00', '4806.20.00', '4810.13.19', '4811.59.60', '4811.90.80', '4811.90.90']
S338_B3 = ['4802.55.10', '4802.61.10', '4802.61.20', '4802.61.60', '4802.62.10', '4802.62.20', '4802.62.30', '4802.62.61', '4802.69.10',
           '4802.69.20', '4802.69.30', '4810.29.10', '4810.92.12', '4811.51.20', '4811.51.40', '4813.10.00', '4814.20.00', '4817.10.00',
           '4818.30.00', '4818.90.00.20', '4819.10.00', '4819.40.00', '4819.50.40', '4820.10.20', '4820.30.00', '4821.90.40', '4823.69.00',
           '4823.70.00', '4823.90.10', '4823.90.67', '4823.90.86']
CIVIL_AIRCRAFT = ['4823.90']
# AD/CVD order scopes: the HTS numbers each order lists "for convenience" (the written scope governs).
ADCVD = {
    'ad-thermal': ['4811.90.80.30', '4811.90.90.30'],
    'ad-uncoated': ['4802.56', '4802.57', '4802.62', '4802.69', '4811.90.80.50'],
    'ad-coated': ['4810.14', '4810.19', '4810.22', '4810.29', '4810.32', '4810.39', '4810.92'],
    'ad-tissue': ['4804.39.40.41', '4811.90.40.10', '4811.90.60.10', '4811.90.90.10', '4823.90.67'],
    'ad-crepe': ['4808.90.20'],
    'ad-lined': ['4810.22.50.44', '4811.90.90.35', '4820.10.20'],
    'ad-giftbox': ['4819.20.00.40', '4819.50.40.60'],
    'ad-bags': ['4819.30.00.40', '4819.40.00.40'],
    'ad-folders': ['4820.30.00.40'],
    'ad-plates': ['4823.61.00.40', '4823.69.00.40', '4823.70.00.20'],
    'ad-molded': ['4823.61', '4823.69', '4823.70', '4823.90.10'],
    'adcvd-pizza': ['4819.10.00'],
}
FOOD_CONTACT = ['4804.39.60.20', '4804.42.00.10', '4804.42.00.30', '4804.52.00.10', '4804.52.00.30', '4806.20', '4810.31.10.40', '4810.32.10.40',
                '4811.51.20.10', '4811.51.20.30', '4811.60', '4819.10.00.20', '4819.20.00.20', '4819.50.20', '4823.61', '4823.69', '4823.70.00.20']


def starts(hts, prefixes):
    return any(hts.startswith(p) for p in prefixes)


# ---------------------------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------------------------
ov = d['overview']
ov['h1'] = 'HTS Chapter 48: Paper and Paperboard; Articles of Paper Pulp, of Paper or of Paperboard — 2026 Tariff Rates'
ov['seo'] = {
    'title': 'HTS Chapter 48 Paper Tariffs 2026: Paperboard, Boxes, Toilet Paper & Paper Products Import Duties | KoalaGains',
    'shortDescription': ('Searchable duty table for all 312 HTS Chapter 48 lines: newsprint, printing and copy paper, kraft paper, coated board, '
                         'tissue, toilet paper, boxes, bags, notebooks, labels and paper cups. Every base rate is Free; see the Section 301, '
                         'Canada Section 338 and China duties by country and the AD/CVD orders on paper products.'),
    'keywords': ['HTS Chapter 48', 'hts chapter 48 tariff rates', 'paper tariffs', 'tariffs on paper products', 'paper tariffs canada',
                 'canada paper tariffs', 'paper products industry tariffs', 'paper product import duties', 'paperboard tariffs',
                 'pulp and paper tariffs', 'packaging tariffs', 'toilet paper tariffs', 'hs code for paper'],
}
ov['intro'] = (
    'Chapter 48 covers paper and paperboard and the things made from them: **newsprint** (4801), **printing, writing and copy paper** '
    '(4802), **kraft paper and linerboard** (4804), **fluting and recycled board** (4805), **coated paper and board** (4810, 4811), '
    '**toilet paper, tissues, towels and napkins** (4818), **boxes, cartons and bags** (4819), **notebooks and binders** (4820), '
    '**labels** (4821) and **paper cups, plates and molded pulp** (4823). Every one of its **312 tariff lines is Free** at the general rate.\n\n'
    'So the extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 duty of 10% or '
    '12.5%** on every Chapter 48 line; no paper line is on its exemption list. Canadian and Mexican goods that qualify for **USMCA** are '
    'exempt, but **62 Canadian lines** (among them corrugated boxes, kraftliner, writing paper, envelopes, napkins, notebooks and paper '
    'cups) pay a **50% Section 338 duty** since August 22, 2026, even with a USMCA claim. China pays **25% (List 3) or 7.5% (List 4A) plus '
    '12.5%**, and Brazil **37.5%**. Many paper products also carry **antidumping or countervailing duties**: thermal paper, uncoated and '
    'coated printing paper, paper plates, molded fiber tableware, shopping bags, file folders, lined paper, tissue and crepe paper and '
    'gift boxes. The U.S. imported **$19.94B** of Chapter 48 goods in 2025, a third of it from Canada.'
)
for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = ('2026 Section 301 and Brazil Section 301: all 312; China List 3: 308 and List 4A: 4; Canada Section 338: 62 (also with USMCA); '
                     'Russia: 23. USMCA goods are exempt from the 2026 Section 301 duty, not from Section 338.')
    if s['label'] == 'Canada + China share':
        s['note'] = 'Of $19.94B imported in 2025 (Canada 33%, China 10%)'

GROUPS = {
    '4801': ('Newsprint', 'Newsprint',
             'Newsprint in rolls or sheets: 2 lines, Free. Almost all U.S. newsprint imports come from Canada, Free with USMCA and 10% without; newsprint is not on the Section 338 list.',
             ['newsprint', 'standard newsprint paper', 'newsprint rolls']),
    '4802': ('Uncoated printing, writing & copy paper', 'Printing paper',
             'Uncoated paper for writing, printing and copying, including copy paper, offset paper and paper base for thermal or photo paper: 56 lines, Free. From Canada, writing and cover paper in rolls (4802.55.10) and the mechanical-pulp grades of 4802.61–4802.69 (13 lines) pay 50% under Section 338; certain uncoated paper is under AD/CVD orders.',
             ['copy paper', 'printer paper', 'offset paper', 'writing paper', 'uncoated freesheet', 'bond paper']),
    '4803': ('Tissue & towel stock (parent rolls)', 'Tissue stock',
             'Toilet, facial tissue, towel and napkin stock and cellulose wadding in large rolls or sheets: 2 lines, Free. Since September 15, 2026 not on the Canada Section 338 list.',
             ['tissue parent rolls', 'jumbo rolls', 'towel stock', 'napkin stock', 'cellulose wadding']),
    '4804': ('Uncoated kraft paper & paperboard (kraftliner, sack kraft)', 'Kraft paper',
             'Uncoated kraft paper and board in rolls or sheets: kraftliner, sack kraft, wrapping paper and cup and carton stock, 30 lines, Free. Canadian unbleached kraftliner (4804.11) pays 50% under Section 338.',
             ['kraftliner', 'kraft paper', 'sack kraft paper', 'linerboard', 'cupstock', 'carton board']),
    '4805': ('Other uncoated paper & paperboard (fluting, testliner, recycled board)', 'Fluting & recycled',
             'Corrugating medium (semichemical and recycled fluting), testliner, filter and felt paper, pressboard and tube and core board: 30 lines, Free. Not on the Section 338 lists.',
             ['corrugating medium', 'fluting paper', 'testliner', 'recycled linerboard', 'chipboard', 'tube and core board']),
    '4806': ('Vegetable parchment, greaseproof, tracing paper & glassine', 'Greaseproof & glassine',
             'Vegetable parchment, greaseproof paper, tracing paper and glassine: 4 lines, Free. Canadian greaseproof paper (4806.20) pays 50% under Section 338.',
             ['greaseproof paper', 'glassine paper', 'tracing paper', 'parchment paper', 'baking paper']),
    '4807': ('Composite (laminated) paper & paperboard', 'Composite',
             'Paper and board made by gluing flat layers together, including bitumen-laminated and cloth-reinforced paper: 4 lines, Free.',
             ['laminated paperboard', 'composite paper', 'reinforced paper']),
    '4808': ('Corrugated, creped & embossed paper', 'Corrugated & creped',
             'Corrugated paper and board in rolls or sheets, creped kraft paper and other creped, embossed or perforated paper: 5 lines, Free. Crepe paper from China is under an antidumping order.',
             ['corrugated board', 'corrugated sheets', 'crepe paper', 'creped kraft paper', 'embossed paper']),
    '4809': ('Carbon & self-copy paper (large rolls or sheets)', 'Copying paper',
             'Carbon paper, self-copy (carbonless) paper and other copying or transfer paper in large rolls or sheets: 7 lines, Free.',
             ['carbonless paper', 'self-copy paper', 'transfer paper', 'carbon paper rolls']),
    '4810': ('Coated paper & paperboard (clay-coated)', 'Coated paper',
             'Paper and board coated with kaolin or other inorganic substances: coated freesheet, light-weight coated paper, coated bleached and recycled board, 65 lines, Free. Five Canadian lines pay 50% under Section 338; sheet-fed coated paper from China and Indonesia is under AD/CVD orders.',
             ['coated paper', 'coated freesheet', 'art paper', 'SBS board', 'coated paperboard', 'LWC paper']),
    '4811': ('Paper coated with plastics, wax or adhesive; thermal & gift wrap', 'Coated (plastic, wax)',
             'Paper and board coated, impregnated or covered with plastics, wax, adhesive or other materials: self-adhesive label stock, poly-coated cupstock, wax paper, direct thermal paper and gift wrap, 35 lines, Free. 14 Canadian lines pay 50% under Section 338; thermal paper is under AD orders.',
             ['thermal paper', 'self-adhesive paper', 'label stock', 'poly-coated paperboard', 'wax paper', 'gift wrap']),
    '4812': ('Filter blocks, slabs & plates of paper pulp', 'Filter blocks',
             'Filter blocks, slabs and plates of paper pulp: 1 line, Free.',
             ['filter blocks', 'filter pads', 'pulp filter plates']),
    '4813': ('Cigarette paper', 'Cigarette paper',
             'Cigarette paper in booklets or tubes, in narrow rolls or in other forms: 3 lines, Free. Canadian booklets and tubes (4813.10) pay 50% under Section 338.',
             ['cigarette paper', 'rolling papers', 'cigarette tubes', 'bobbins of cigarette paper']),
    '4814': ('Wallpaper & wallcoverings', 'Wallpaper',
             'Wallpaper and similar wallcoverings and window transparencies of paper: 2 lines, Free. China pays 7.5% (List 4A) plus 12.5%; Canadian plastic-coated wallpaper (4814.20) pays 50% under Section 338.',
             ['wallpaper', 'vinyl wallpaper', 'wallcoverings', 'peel and stick wallpaper']),
    '4816': ('Carbon & self-copy paper (cut, boxed)', 'Carbon paper',
             'Carbon paper, self-copy paper and other copying or transfer papers cut to size, whether or not in boxes: 2 lines, Free.',
             ['carbon paper', 'carbonless forms paper', 'transfer paper sheets']),
    '4817': ('Envelopes & correspondence cards', 'Envelopes',
             'Envelopes, letter cards, plain postcards and boxed stationery: 4 lines, Free. Canadian envelopes (4817.10) pay 50% under Section 338.',
             ['envelopes', 'mailing envelopes', 'stationery sets', 'correspondence cards']),
    '4818': ('Toilet paper, tissues, towels & napkins', 'Toilet paper & tissues',
             'Household and sanitary paper cut to size: toilet paper, facial tissues, paper towels, napkins and tablecloths, paper gowns and face masks, 8 lines, Free. Canadian napkins and paper face masks pay 50% under Section 338; China pays 37.5% (20% on 4818.90).',
             ['toilet paper', 'paper towels', 'facial tissue', 'paper napkins', 'kitchen roll', 'disposable gowns']),
    '4819': ('Boxes, cartons, bags & paper packaging', 'Boxes & bags',
             'Cartons, boxes and bags of paper or board: corrugated boxes, folding cartons, paper bags and sacks, fiber drums and office storage boxes, 14 lines, Free. Seven Canadian lines (corrugated boxes, small bags, other containers) pay 50% under Section 338; shopping bags and gift boxes carry AD/CVD orders.',
             ['corrugated boxes', 'cardboard boxes', 'folding cartons', 'paper bags', 'shopping bags', 'pizza boxes']),
    '4820': ('Notebooks, diaries, binders & business forms', 'Notebooks & binders',
             'Registers, notebooks, diaries, memo pads, exercise books, binders, folders, business forms and albums: 12 lines, Free. Canadian notebooks, diaries and binders pay 50% under Section 338; lined paper and file folders carry AD/CVD orders.',
             ['notebooks', 'spiral notebooks', 'diaries', 'binders', 'file folders', 'exercise books']),
    '4821': ('Paper labels', 'Labels',
             'Paper and paperboard labels, printed or not, including self-adhesive labels: 4 lines, Free. Canadian unprinted non-adhesive labels (4821.90.40) pay 50% under Section 338.',
             ['paper labels', 'printed labels', 'self-adhesive labels', 'tags']),
    '4822': ('Bobbins, spools & cores', 'Bobbins & cores',
             'Bobbins, spools, cops and similar supports of paper pulp, paper or board, including textile-yarn cones: 2 lines, Free.',
             ['paper cores', 'paper tubes', 'bobbins', 'spools']),
    '4823': ('Paper cups, plates, molded pulp & other paper articles', 'Cups, plates & other',
             'Paper cups, plates, trays and bowls, molded pulp articles, filter paper, recording-chart paper, paper gaskets and other cut paper: 20 lines, Free. Eight Canadian lines pay 50% under Section 338; paper plates and molded fiber tableware carry AD/CVD orders.',
             ['paper cups', 'paper plates', 'molded pulp', 'egg cartons', 'filter paper', 'paper straws']),
}
for g in ov['productGroups']:
    label, short, blurb, ex = GROUPS[g['heading']]
    g['label'], g['blurb'], g['searchExamples'] = label, blurb, ex
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = GROUPS[g['heading']][0], GROUPS[g['heading']][1]

ov['workedExamples'] = [
    {'title': '$1M of copy paper from Canada', 'line': '4802.56.40.00',
     'body': 'Letter-size uncoated copy paper made of chemical pulp falls in 4802.56 (sheets with one side not over 435 mm and the other not over 297 mm). '
             'The base rate is **Free** and 4802.56 is not on the Section 338 list. With a USMCA claim, U.S. note 52(g) (9903.05.93) lifts the 10% '
             'Section 301 duty on Canada, so the duty is **$0**; without the claim it is **$100,000** (9903.05.29). Uncoated paper from Brazil, '
             'Indonesia, Portugal, China and Australia is also under antidumping orders, which this table does not include.'},
    {'title': '$1M of corrugated boxes from Canada', 'line': '4819.10.00.40',
     'body': '4819.10.00 is on the Section 338 list in U.S. note 51(b)(3), so Canadian corrugated boxes pay **50%** (9903.03.14) since August 22, 2026. '
             'Note 51(a) applies it even when USMCA is claimed: **$500,000**. Without a USMCA claim the 10% Section 301 duty is added: **$600,000**. '
             'The same boxes from Mexico are Free with USMCA.'},
    {'title': '$1M of toilet paper from China', 'line': '4818.10.00.00',
     'body': 'Toilet paper is Free at base. From China it pays the 2018 Section 301 List 3 duty of **25%** (9903.88.03) plus the 2026 Section 301 duty '
             'of **12.5%** (9903.05.31): **$375,000**. From Indonesia it pays 10% '
             '(9903.05.45); from Canada or Mexico with USMCA, $0.'},
    {'title': '$1M of paper plates from Vietnam', 'line': '4823.69.00.40',
     'body': 'Paper plates are Free at base and pay the 12.5% Section 301 duty on Vietnam (9903.05.84): **$125,000**. They are also inside the 2025 '
             'antidumping and countervailing duty orders on paper plates from Vietnam (90 FR 13139, 90 FR 13135), so CBP collects cash deposits at '
             'the company-specific rates in those orders on top. The tariff calculator does not include AD/CVD.'},
]
ov['tradeSnapshot']['effectiveDutyRateNote'] = "Duty-collected figures aren't available from an official source yet."
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '4819.20', 'label': 'Folding cartons, boxes and cases of non-corrugated paper or paperboard'},
    {'hts': '4819.40', 'label': 'Paper sacks and bags (base under 40 cm), including cones'},
]
ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** "Paper" includes paperboard, whatever its thickness or weight.\n\n'
        '**Note 2.** The chapter does not cover, among others: articles of chapter 30; perfumed or cosmetic papers (chapter 33); paper impregnated with soap, '
        'detergent or polishes (3401, 3405); sensitized paper (3701–3704); paper-reinforced plastic sheeting or paper coated with plastics thicker than '
        'the paper (chapter 39), other than wallcoverings of 4814; travel goods of 4202; abrasive paper (6805); metal foil backed with paper; toys and '
        'games (chapter 95); or sanitary pads, tampons and diapers (chapter 96).\n\n'
        '**Note 4.** "Newsprint" is uncoated paper for printing newspapers, at least 50% mechanical or chemi-mechanical wood fiber, unsized or very '
        'lightly sized, 40–65 g/m², in rolls wider than 28 cm or large sheets.\n\n'
        '**Note 5.** Heading 4802 covers writing, printing and graphic paper made mainly from bleached or mechanical pulp that meets fiber, ash, '
        'brightness and burst tests; it excludes filter paper (including teabag paper) and felt paper.\n\n'
        '**Note 6.** "Kraft paper" has at least 80% of its fiber from the chemical sulfate or soda process.\n\n'
        '**Note 7.** Paper that fits two or more of headings 4801–4811 goes in the one that comes last.\n\n'
        '**Note 8.** Headings 4803–4809 cover only rolls wider than 36 cm or sheets with one side over 36 cm and the other over 15 cm; smaller '
        'cut sizes go to 4816–4823.\n\n'
        '**Note 9.** Heading 4814 wallpaper is paper in rolls 45–160 cm wide, decorated, textured or plastic-faced, plus borders and panel murals.\n\n'
        '**Note 12.** Except for 4814 and 4821, paper articles printed with motifs, characters or pictures that are not merely subsidiary to their use '
        'fall in chapter 49.\n\n'
        '**Subheading notes 1–7** define kraftliner (over 115 g/m² with a minimum Mullen burst), sack kraft paper (60–115 g/m²), semichemical and straw '
        'fluting, testliner (recycled), sulfite wrapping paper and light-weight coated paper (up to 72 g/m², mechanical-pulp base).'
    ),
    'additionalUsNotes': (
        '**1.** The provisions for cellulose wadding and webs of cellulose fibers cover only products made from the pulp of chapter 47.\n\n'
        '**2.** Samples used to determine the weight of paper or paperboard are conditioned at 50% (±2%) relative humidity and 23°C (±2°C).\n\n'
        '**Statistical note 1** defines "standard newsprint paper" (46.3–57 g/m², minimum roll and sheet sizes, ash up to 6.5%); **statistical note 2** '
        'requires paper shoe covers (4823.90.8620) to be at least 50% cellulose or paper by weight.'
    ),
}

# ---------------------------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = 'HTS Chapter 48: Paper and Paperboard — Tariff Updates 2025–2026'
tu['seo'] = {
    'title': 'Paper Tariff Updates 2025–2026: Canada Section 338, Section 301, China & AD/CVD on Paper Products (HTS Ch. 48) | KoalaGains',
    'shortDescription': ('What changed for paper and paperboard imports since January 2025: the IEEPA duties and their end, the Section 122 surcharge, '
                         'the 2026 Section 301 and Brazil duties, the 50% Section 338 duty on 62 Canadian paper lines, China List 3, and the '
                         'antidumping and countervailing duty orders on paper products, with Federal Register citations.'),
    'keywords': ['paper tariffs 2026', 'paper product tariffs', 'canada paper tariffs', 'us tariffs on canadian paper products', 'tariffs on paper from china',
                 'section 338 canada', 'paper antidumping duties', 'thermal paper antidumping', 'paper plates antidumping', 'USMCA paper tariffs'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). All 312 Chapter 48 lines are **Free** in both; the base rates did not change.\n\n'
    'The extra duties changed a lot. In 2025 non-USMCA paper from Canada and Mexico paid IEEPA duties (Canada 25%, then 35%), paper from '
    'most other countries paid the reciprocal tariff, China paid fentanyl and reciprocal duties on top of List 3, and Brazil paid another 40%. '
    'All IEEPA duties **ended on February 24, 2026**; the 10% Section 122 surcharge that replaced them expired on **July 23, 2026**.\n\n'
    'Today: the **2026 Section 301 duties** on 60 economies (10% or 12.5% from July 24, 2026; USMCA goods exempt), **Brazil\'s 25% Section '
    '301 duty** (from July 22, 2026), the **50% Section 338 duty on 62 Canadian lines** (from August 22, 2026; widened to writing and '
    'printing paper on September 15) and China\'s **List 3 (25%) and List 4A (7.5%)** duties. Paper products are also one of the most '
    'common targets of **antidumping and countervailing duty orders**: 12 product families are covered today, two more circumvention or '
    'injury cases are open, and a petition on corrugated pizza boxes was filed in September 2026. AD/CVD cash deposits are listed below '
    'for reference and are **not included in the tariff calculator**.'
)
tu['scope'] = ('Chapter 99 measures that reach Chapter 48 from any country (2026 Section 301 on 60 economies, Brazil Section 301, Section 338 on '
               'Canada, China Section 301 Lists 3 and 4A, Russia; the ended IEEPA and Section 122 duties), the Section 232 timber action (which does '
               'not cover paper), and the antidumping and countervailing duty orders and investigations on paper products, which the tariff '
               'calculator does not model. For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '312 of 312 lines', 'note': 'All Free'},
    {'label': 'Extra-duty programs in effect', 'value': '5', 'note': '2026 Section 301, Brazil 301, Canada Section 338, China Lists 3/4A, Russia'},
    {'label': 'Canadian lines at 50%', 'value': '62', 'note': 'Section 338, even with USMCA'},
    {'label': 'AD/CVD product families', 'value': '12', 'note': 'Orders in force on Chapter 48 goods'},
]

S301 = ['fr-2026-15181', 'fr-2026-15274', 'csms-69326983', 'hts-chapter-99', 'hts-now']
NO_IEEPA = 'The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.'
NO_EX = 'No Chapter 48 line is on the 2026 Section 301 exemption lists (U.S. note 52(b), (c), (e)) or a country list in note 52(j); paper gaskets and other civil aircraft parts of 4823.90 are exempt under note 52(d).'
IE = {
    'ca-section-301': dict(
        measure='Section 338 (Canada) + Section 301 (2026, 60 economies)',
        now='+10% (USMCA goods exempt); +50% on 62 lines even with USMCA',
        exemption=('Two duties. Section 301 (+10%, 9903.05.29) is lifted for USMCA-qualifying goods (note 52(g), 9903.05.93). Section 338 (+50%) covers '
                   '62 lines in U.S. note 51(b): under the alcoholic-beverages action (9903.03.12, Proclamation 11046) unbleached kraftliner 4804.11, '
                   'greaseproof paper 4806.20, coated paper 4810.13.19 and coated paper of 4811.59.60, 4811.90.80 and 4811.90.90 (including thermal '
                   'paper and gift wrap); under the motor-vehicles action (9903.03.14, Proclamation 11048) writing and cover paper in rolls 4802.55.10, '
                   'the mechanical-pulp printing grades of 4802.61–4802.69, coated board of 4810.29.10, 4810.92.12 and 4811.51, cigarette paper booklets, '
                   'plastic-coated wallpaper, envelopes, napkins, paper face masks, corrugated boxes, small bags, other containers, notebooks and '
                   'diaries, binders, labels, paper cups, molded pulp and other articles of 4823.69–4823.90. Note 51(a) applies it even when USMCA is '
                   'claimed. Proclamation 11056 moved the start from August 19 to August 22, 2026; from September 15, Proclamation 11065 added the '
                   '4802.61–4802.69 grades and dropped tissue stock (4803.00.40) and paper articles of 4818.90 other than face masks. Civil aircraft '
                   'parts of 4823.90 are exempt (9903.03.16). The 35% IEEPA duty on non-USMCA goods ended February 24, 2026.'),
        whatItMeans=('USMCA-qualifying Canadian newsprint, copy paper, linerboard other than unbleached kraftliner, fluting, tissue stock, toilet paper and '
                     'paper towels enter Free. Canadian corrugated boxes, kraftliner, envelopes, napkins, notebooks and paper cups pay 50% with USMCA and '
                     '60% without.'),
        effectiveFrom='2026-09-15', effectiveSourceId='procl-11065',
        add=['procl-11065', 'csms-69326983']),
    'cn-section-301': dict(
        measure='Section 301 (China, 2018–2019 lists) + Section 301 (2026, 60 economies)',
        now='+37.5% (25% + 12.5%); +20% (7.5% + 12.5%) on wallpaper and 4818.90',
        exemption=('Two Section 301 duties. List 3 (+25%, 9903.88.03, since May 10, 2019) covers every Chapter 48 subheading except plastic-coated and '
                   'other wallpaper (4814.20, 4814.90.02) and paper articles of 4818.90, which are on List 4A (+7.5%, 9903.88.15, since February 14, '
                   '2020). No product exclusion for Chapter 48 is in effect. The 2026 action adds +12.5% (9903.05.31) on every line; note 52(a) keeps '
                   'the List 3 and 4A duties on top. USTR confirmed on October 7, 2026 that the 2018–2019 actions continue during their review. The '
                   'IEEPA duties on China ended February 24, 2026.'),
        whatItMeans=('Chinese toilet paper, boxes, bags, notebooks and paper cups pay 37.5% of value; wallpaper and paper face masks 20%. Many Chinese '
                     'paper products also carry antidumping or countervailing duties (not included here).'),
        add=['fr-2026-15181', 'csms-69326983']),
    'mx-section-301': dict(
        exemption='Goods entered free under USMCA are exempt under U.S. note 52(h) (9903.05.94). ' + NO_EX + ' ' + NO_IEEPA,
        whatItMeans='Mexican boxes, bags, tissue and paper cups pay nothing with a USMCA claim and 10% of value without. Mexico is not subject to Section 338.'),
    'vn-section-301': dict(
        exemption=NO_EX + ' ' + NO_IEEPA,
        whatItMeans=('Vietnamese boxes, notebooks and paper cups pay 12.5% of value. Paper plates, molded fiber tableware, shopping bags and file folders '
                     'from Vietnam also carry antidumping (and, for plates and molded fiber, countervailing) duties, not included here.')),
    'eu-section-301': dict(
        country='European Union (e.g. Finland, Germany, Sweden)',
        exemption=('The EU rate is 10% including the base rate (9903.05.39); every Chapter 48 base rate is Free, so the duty is 10%. ' + NO_EX + ' ' + NO_IEEPA),
        whatItMeans=('Finnish, German and Swedish coated paper and board, kraft paper and specialty papers pay 10% of value. German and Spanish thermal paper '
                     'and Portuguese uncoated paper and shopping bags also carry antidumping duties, not included here.')),
    'id-section-301': dict(
        exemption=NO_EX + ' ' + NO_IEEPA,
        whatItMeans=('Indonesian toilet paper, tissue stock and boxes pay 10% of value. Certain uncoated paper and sheet-fed coated paper from Indonesia '
                     'also carry antidumping and countervailing duties, not included here.')),
    'kr-section-301': dict(
        exemption=('The rate is 12.5% including the base rate (9903.05.71); every Chapter 48 base rate is Free, so the duty is 12.5%. A KORUS claim does '
                   'not remove it. ' + NO_EX + ' ' + NO_IEEPA),
        whatItMeans='Korean coated paper and specialty papers pay 12.5% of value; Korean thermal paper also carries an antidumping duty, not included here.'),
    'in-section-301': dict(
        exemption=NO_EX + ' ' + NO_IEEPA,
        whatItMeans=('Indian boxes, bags and notebooks pay 10% of value. Lined paper, shopping bags and file folders from India also carry antidumping and '
                     'countervailing duties, not included here.')),
    'my-section-301': dict(
        exemption=NO_EX + ' ' + NO_IEEPA,
        whatItMeans=('Malaysian paper cups, plates and tissue pay 10% of value. Shopping bags from Malaysia carry an antidumping duty, and Commerce '
                     'preliminarily found on July 10, 2026 that paper plates finished in Malaysia from Chinese paperboard circumvent the China orders.')),
    'th-section-301': dict(
        exemption=NO_EX + ' ' + NO_IEEPA,
        whatItMeans='Thai paper cups, plates and tissue pay 12.5% of value; Thai paper plates also carry an antidumping duty, not included here.'),
    'br-section-301': dict(
        exemption=('+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). No '
                   'Chapter 48 line is on the Brazil exemption list in U.S. note 50(a)(ii); only civil aircraft parts of 4823.90 are exempt (note '
                   '50(a)(iv), 9903.05.05). The 40% IEEPA duty on Brazil ended February 24, 2026.'),
        whatItMeans=('Every Brazilian paper product pays 37.5% of value. Certain uncoated paper from Brazil also carries an antidumping duty, not '
                     'included here.'),
        add=['csms-69302472', 'eo-14323', 'eo-14389']),
    'gb-section-301': dict(
        exemption=NO_EX + ' ' + NO_IEEPA,
        whatItMeans='British coated and specialty papers, wallpaper and paper articles pay 10% of value.'),
    'jp-section-301': dict(
        exemption=('The rate is 12.5% including the base rate (9903.05.49); every Chapter 48 base rate is Free, so the duty is 12.5%. ' + NO_EX + ' ' + NO_IEEPA),
        whatItMeans='Japanese coated and specialty papers pay 12.5% of value; Japanese thermal paper also carries an antidumping duty, not included here.'),
    'ru-section-301': dict(
        exemption=('Russia pays its column 2 rate in place of the general rate on 23 Chapter 48 lines (U.S. note 30, 9903.90.08: 35%), plus the 12.5% 2026 '
                   'Section 301 duty (9903.05.66) on every line.'),
        whatItMeans='Russian paper pays 12.5% of value, or 47.5% on the 23 lines with a 35% rate in place of Free.'),
    'other-section-301': dict(
        country='Other 2026 Section 301 economies (46, e.g. Australia, Cambodia, Colombia, Singapore, Sri Lanka, Switzerland, Taiwan, Türkiye)',
        exemption=('Every Chapter 48 line is covered for each of these economies; ' + NO_EX + ' Countries outside the 60 economies pay no extra duty. Nicaragua\'s '
                   'separate Section 301 duty starts at 10% on January 1, 2027. ' + NO_IEEPA),
        whatItMeans=('Paper products from these economies pay 10% or 12.5% of value. Shopping bags from Cambodia, Colombia, Portugal, Taiwan and '
                     'Türkiye, file folders from Sri Lanka and Cambodia, and uncoated paper from Australia and Portugal also carry AD/CVD.')),
}
for e in tu['inEffect']:
    f = IE[e['id']]
    for k in ('measure', 'now', 'country', 'exemption', 'whatItMeans', 'effectiveFrom', 'effectiveSourceId'):
        if k in f:
            e[k] = f[k]
    for sid in f.get('add', []):
        if sid not in e['sourceIds']:
            e['sourceIds'].insert(len(e['sourceIds']) - 1, sid)
    if 'csms-69326983' not in e['sourceIds'] and 'fr-2026-15181' in e['sourceIds']:
        e['sourceIds'].insert(len(e['sourceIds']) - 1, 'csms-69326983')
    if e['effectiveSourceId'] not in e['sourceIds']:
        e['sourceIds'].insert(0, e['effectiveSourceId'])

C = []


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    C.append({'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
              'countries': countries, 'sourceIds': sids})


ch('base-rates', 'baseRate', TODAY, 'Checked', 'No Chapter 48 base-rate changes',
   'All 312 Chapter 48 tariff lines carry the same General rate (Free) in 2026 Revision 21 as in the 2025 Basic Edition; no line was added, removed or renumbered.',
   None, None, None, ['hts-before', 'hts-now', 'hts-now-cr'])
ch('adcvd-in-force', 'reference', TODAY, 'Checked', 'Antidumping and countervailing duty orders on paper products',
   'Commerce orders in force on Chapter 48 goods, with the HTS numbers their scopes list: thermal paper from Germany, Japan, South Korea and Spain '
   '(AD, 4811.90.8030 and .9030) and lightweight thermal paper from China (AD/CVD, continued January 23, 2026); certain uncoated paper from Australia, '
   'Brazil, China, Indonesia and Portugal (AD; CVD China, Indonesia; 4802.56, .57, .62, .69); sheet-fed coated paper from China and Indonesia '
   '(AD/CVD; 4810.14–4810.92); tissue paper products and crepe paper products from China (AD); lined paper products from China and India (AD; CVD '
   'India; 4820.10.20); folding gift boxes from China (AD; 4819.20.0040, 4819.50.4060); paper shopping bags from Cambodia, China, Colombia, India, '
   'Malaysia, Portugal, Taiwan, Türkiye and Vietnam (AD; CVD China, India; 4819.30.0040, 4819.40.0040); paper file folders from China, India, '
   'Vietnam and Sri Lanka (AD) and India and Cambodia (CVD; 4820.30.0040); paper plates from China, Thailand and Vietnam (AD; CVD China, Vietnam; '
   '4823.61.0040, 4823.69.0040, 4823.70.0020); and thermoformed molded fiber products from China and Vietnam (AD/CVD; 4823.61–4823.70, '
   '4823.90.10). Cash-deposit rates are company-specific and are not in the tariff calculator.',
   None, None, 'China, Vietnam, India, Indonesia, Brazil, Portugal and others',
   ['fr-2021-25365', 'fr-2026-01283', 'fr-2022-02686', 'fr-2022-12706', 'fr-2021-25772', 'fr-2026-14972', 'fr-2023-17811', 'fr-2023-26336',
    'fr-2024-15746', 'fr-2024-15747', 'fr-2024-10253', 'fr-2023-25688', 'fr-2025-18886', 'fr-2026-03419', 'fr-2025-04764', 'fr-2025-04765',
    'fr-2026-01604', 'fr-2026-01605'])
ch('pizza-box-petitions', 'pending', '2026-10-02', 'Published', 'AD/CVD petitions on corrugated pizza boxes from China, Malaysia and Türkiye',
   'On September 9, 2026 U.S. producers and the United Steelworkers petitioned for antidumping duties on corrugated die-cut cardboard (pizza) boxes from '
   'China, Malaysia and Türkiye and a countervailing duty on Türkiye (subheading 4819.10.00). The ITC instituted its preliminary investigations on '
   'September 14; Commerce extended its initiation decision to October 19, 2026 to poll industry support. No duty applies unless orders are issued.',
   None, None, 'China, Malaysia, Türkiye', ['fr-2026-18723', 'fr-2026-20257'])
ch('sunset-thermal-tissue', 'reference', '2026-10-01', 'Published', 'Five-year reviews begin for the thermal paper and tissue paper orders',
   'The ITC instituted five-year (sunset) reviews of the antidumping orders on thermal paper from Germany, Japan, South Korea and Spain and on certain '
   'tissue paper products from China. The orders stay in force while the reviews run.',
   None, None, 'Germany, Japan, South Korea, Spain, China', ['fr-2026-20136', 'fr-2026-20137'])
ch('cn-301-continued', 'reference', '2026-10-07', 'Published', 'China Section 301 duties continue during the four-year review',
   'USTR received requests to continue the 2018 China actions, so they did not terminate on their 2026 anniversaries and remain in effect pending the '
   'statutory review. The 25% List 3 and 7.5% List 4A duties on Chinese paper continue.',
   None, None, 'China', ['fr-2026-20510'])
ch('section-301-nicaragua-scheduled-2027-01-01', 'pending', '2025-12-29', 'Published', 'Section 301 tariff on Nicaragua phases in from 2027',
   'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. '
   'note 29), on every Chapter 48 line. The rate is 0% in 2026.',
   None, '+10% to +15%', 'Nicaragua', ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99'])
ch('section-338-canada-2026-09-15', 'extraDuty', '2026-09-15', 'Effective', 'Section 338 list widened to Canadian writing and printing paper',
   'Proclamation 11065 changed the list in U.S. note 51(b)(3) (9903.03.14). It added the mechanical-pulp writing, drawing and printing grades of '
   '4802.61.10, .20, .60, 4802.62.10, .20, .30, .61 and 4802.69.10, .20, .30 (12 lines) and removed tissue stock 4803.00.40 and paper articles of '
   '4818.90 other than face masks (4818.90.0080). Proclamation 11064 left the six Chapter 48 provisions of the alcoholic-beverages list (note 51(b)(1)) '
   'unchanged.',
   '+50% on 52 lines', '+50% on 62 lines', 'Canada', ['procl-11065', 'procl-11064', 'csms-69851916', 'hts-chapter-99'])
ch('section-338-canada-2026-08-22', 'extraDuty', '2026-08-22', 'Effective', 'Section 338: 50% on Canadian kraftliner, boxes, envelopes, napkins and more',
   'Proclamations 11046 (alcoholic beverages) and 11048 (motor vehicles), signed July 20, 2026, imposed a 50% duty on listed products of Canada in '
   'response to Canada\'s treatment of U.S. alcoholic beverages and autos. In Chapter 48 it reached 52 lines: 11 under 9903.03.12 (kraftliner, '
   'greaseproof paper, certain coated, thermal and gift wrap paper) and 41 under 9903.03.14 (writing paper in rolls, coated board, cigarette paper '
   'booklets, wallpaper, envelopes, napkins, tissue stock, corrugated boxes, bags, containers, notebooks, binders, labels, paper cups and molded pulp). '
   'Proclamation 11056 moved the start from August 19 to August 22, 2026. The duty applies even when USMCA is claimed.',
   'None', '+50%', 'Canada', ['procl-11046', 'procl-11048', 'procl-11056', 'csms-69606660', 'hts-chapter-99'])
ch('tissue-circumvention', 'reference', '2026-08-06', 'Published', 'Circumvention inquiry: tissue paper finished in Vietnam',
   'Commerce opened a country-wide inquiry into whether tissue paper products completed in Vietnam from Chinese jumbo rolls circumvent the antidumping '
   'order on tissue paper from China.',
   None, None, 'Vietnam, China', ['fr-2026-16056'])
ch('section-301-2026-60-economies-2026-07-24', 'extraDuty', '2026-07-24', 'Effective', '2026 Section 301 duties on 60 economies reach every paper line',
   'The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect. No Chapter 48 line is on the general exemption list (U.S. '
   'note 52(b)) or any country list, so they reach all 312 lines; only civil aircraft parts of 4823.90 are exempt (note 52(d)). Canadian and Mexican '
   'goods entered under USMCA are exempt (notes 52(g)–(h)).',
   None, '+10% to +12.5%', '60 economies', ['fr-2026-15181', 'fr-2026-15274', 'csms-69326983', 'hts-chapter-99'])
ch('crepe-continued', 'reference', '2026-07-24', 'Published', 'Antidumping order on crepe paper from China continued',
   'After its fourth sunset review, the antidumping order on certain crepe paper products from China was continued for another five years.',
   None, None, 'China', ['fr-2026-14972'])
ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
   'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.',
   '+10%', 'None', 'All', ['procl-11012', 'hts-chapter-99'])
ch('section-301-brazil-2026-07-22', 'extraDuty', '2026-07-22', 'Effective', 'Brazil Section 301: 25% on all paper products',
   'The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. No Chapter 48 line is on its exemption list (U.S. note 50(a)(ii)), so it '
   'reaches every line except civil aircraft parts of 4823.90 (note 50(a)(iv)).',
   'None', '+25%', 'Brazil', ['fr-2026-14542', 'csms-69302472', 'hts-chapter-99'])
ch('paper-plates-circumvention', 'reference', '2026-07-10', 'Published', 'Paper plates finished in Cambodia and Malaysia: preliminary circumvention finding',
   'Commerce preliminarily found that paper plates completed in Cambodia or Malaysia from paperboard made in China circumvent the 2025 antidumping and '
   'countervailing duty orders on paper plates from China, so such plates can be subject to the China orders.',
   None, None, 'Cambodia, Malaysia, China', ['fr-2026-13973', 'fr-2026-13974'])
ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
   'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues '
   'or until termination, so USMCA claims (SPI S) still apply.',
   None, None, 'Canada, Mexico', ['ustr-usmca-review'])
ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
   'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. No Chapter 48 line was on its product exemption list '
   '(9903.03.03); Canadian and Mexican goods entered under USMCA were exempt (9903.03.07, 9903.03.08), as were civil aircraft parts of 4823.90.',
   'Varied by country', '+10% (USMCA goods exempt)', 'All', ['procl-11012', 'hts-chapter-99'])
ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
   'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 '
   'ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.',
   'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'])
ch('folders-cambodia-cvd', 'reference', '2026-02-20', 'Published', 'Countervailing duty order on paper file folders from Cambodia',
   'Commerce issued a countervailing duty order on paper file folders from Cambodia (4820.30.0040). Its antidumping investigation on Cambodia ended '
   'with a negative final determination.',
   None, None, 'Cambodia', ['fr-2026-03419'])
ch('molded-fiber-orders', 'reference', '2026-01-27', 'Published', 'AD/CVD orders on thermoformed molded fiber products from China and Vietnam',
   'Commerce issued antidumping and countervailing duty orders on thermoformed molded fiber products (molded pulp plates, bowls, clamshells, trays, lids and '
   'food or product packaging), listed under 4823.61, 4823.69, 4823.70 and 4823.90.10.',
   None, None, 'China, Vietnam', ['fr-2026-01604', 'fr-2026-01605'])
ch('lwtp-continued', 'reference', '2026-01-23', 'Published', 'Lightweight thermal paper orders on China continued',
   'After its third sunset review, Commerce continued the antidumping and countervailing duty orders on lightweight thermal paper from China.',
   None, None, 'China', ['fr-2026-01283'])
ch('timber-232', 'reference', '2025-10-14', 'Effective', 'Section 232 timber and lumber duties do not cover paper',
   'Proclamation 10976 imposed Section 232 duties on softwood timber and lumber, upholstered wooden furniture and kitchen cabinets and vanities (U.S. '
   'note 37, 9903.76.xx). No Chapter 48 line is listed, so paper and paperboard pay no Section 232 duty.',
   None, None, 'All', ['procl-10976', 'hts-chapter-99'])
ch('folders-sri-lanka-ad', 'reference', '2025-09-29', 'Published', 'Antidumping order on paper file folders from Sri Lanka',
   'Commerce issued an antidumping duty order on paper file folders from Sri Lanka (4820.30.0040), adding to the 2023 orders on China, India and Vietnam.',
   None, None, 'Sri Lanka', ['fr-2025-18886'])
ch('reciprocal-country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country-specific reciprocal rates take effect',
   'Executive Order 14326 replaced the 10% baseline with country-specific reciprocal rates for many partners (for example 15% for the EU, all-inclusive). '
   'Paper products paid them until February 24, 2026.',
   '+10%', 'Country rates (ended)', 'All except Canada, Mexico', ['eo-14326'])
ch('brazil-ieepa-40', 'extraDuty', '2025-08-06', 'Effective', 'Brazil: 40% IEEPA duty on paper products',
   'Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77). Its exceptions did not include Chapter 48 goods other than civil aircraft '
   'parts, so Brazilian paper paid it on top of the reciprocal tariff. Ended February 24, 2026.',
   'None', '+40% (ended)', 'Brazil', ['eo-14323'])
ch('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
   'Raised the IEEPA duty on non-USMCA Canadian goods, including paper and paperboard, from 25% to 35% (9903.01.10). Ended February 24, 2026.',
   '+25%', '+35% (ended)', 'Canada', ['eo-14325'])
ch('cn-ieepa', 'extraDuty', '2025-05-14', 'Effective', 'China IEEPA duties: reciprocal rate cut to 10%',
   'Chinese paper paid IEEPA duties on top of Lists 3 and 4A: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November '
   '10, 2025) and a reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. All ended February 24, 2026.',
   '+125% reciprocal', '+10% reciprocal (ended)', 'China', ['eo-14195', 'eo-14228', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14357'])
ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff covers paper products',
   '10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025. Of Chapter 48, only exercise books (4820.20.00) '
   'are on the exemption list in U.S. note 2(v)(iii); all other paper paid it. Ended February 24, 2026.',
   'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257', 'hts-chapter-99'])
ch('paper-plates-orders', 'reference', '2025-03-20', 'Published', 'AD/CVD orders on paper plates from China, Thailand and Vietnam',
   'Commerce issued antidumping duty orders on certain paper plates from China, Thailand and Vietnam and countervailing duty orders on China and Vietnam '
   '(4823.61.0040, 4823.69.0040, 4823.70.0020).',
   None, None, 'China, Thailand, Vietnam', ['fr-2025-04764', 'fr-2025-04765'])
ch('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
   'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA paper kept paying. Ended February 24, 2026.',
   '+25%', '+25%, USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232'])
ch('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
   '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including paper and paperboard. Ended February 24, 2026.',
   'None', '+25% (ended)', 'Canada, Mexico', ['eo-14193', 'eo-14194'])
C.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = C

add_sources(tu, [s['id'] for s in NEW])

# ---------------------------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 48: Paper and Paperboard; Articles of Paper Pulp, of Paper or of Paperboard — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Paper Imports by Country & Product: Canada, China, Mexico, Boxes, Tissue, Coated Paper (HTS Ch. 48) | KoalaGains',
    'shortDescription': ('Where U.S. paper and paperboard imports come from, 2020–2025: $19.94B in 2025, 33% from Canada; imports from China fell 37.5% '
                         'while Vietnam, Indonesia, Malaysia and Thailand grew. By country, by product and over time, from UN Comtrade.'),
    'keywords': ['us paper imports', 'how much paper does the us import', 'where does the us get its paper', 'us toilet paper imports',
                 'paper imports from canada', 'paper industry analysis', 'pulp and paper market', 'HTS Chapter 48 import statistics'],
}
for s in ui['stats']:
    if s['label'] == 'Largest product':
        s['note'] = 'Folding cartons, boxes and cases of non-corrugated paperboard (4819.20)'
ui['why'] = (
    'U.S. imports of Chapter 48 goods were **$19.94B in 2025**, down 3.9% from $20.75B in 2024 and below the 2022 peak of $22.40B. **Canada** is by far '
    'the largest supplier ($6.59B, 33%): uncoated printing and writing paper ($1.16B in 4802), boxes and bags ($972M), toilet paper, towels and '
    'tissues ($931M), fluting and recycled board ($826M) and kraft paper and linerboard ($555M). **China** ($1.92B) ships mainly toilet paper and '
    'tissues, boxes and bags, paper cups and plates and notebooks; **Mexico** ($1.70B) mainly boxes and bags; **Vietnam** ($1.04B) boxes and notebooks; '
    '**Finland**, **Germany**, **Sweden** and **South Korea** coated paper and board and specialty papers.\n\n'
    'The biggest shift in 2025 was away from China: imports from China fell **37.5%** (by $1.15B), while Vietnam rose 22.6%, Indonesia 29.8%, and '
    'Malaysia and Thailand more than doubled, mostly in tissue, paper cups and plates and boxes. Several of these products are now under antidumping '
    'or countervailing duty orders on the new suppliers too (paper plates from Thailand and Vietnam, molded fiber from Vietnam, shopping bags from '
    'Malaysia and Vietnam), and Commerce preliminarily found in July 2026 that plates finished in Malaysia and Cambodia from Chinese board circumvent '
    'the China orders.\n\n'
    'By product, packaging leads: boxes, cartons and bags (4819) were $3.56B, 18% of the total, followed by coated paper (4810, $2.35B), household '
    'tissue products (4818, $2.32B), uncoated printing paper (4802, $2.03B), plastic-coated and thermal paper (4811, $2.01B) and cups, plates and other '
    'articles (4823, $2.00B). 2025 is the latest full year of U.S. trade data, so the 2026 Section 301 and Section 338 duties are not yet visible in '
    'these figures. Duty-collected figures aren\'t available from an official source yet.'
)
for c in ui['byCountry']:
    if c.get('mainHeading'):
        c['mainHeadingLabel'] = GROUPS[c['mainHeading']][0]
for b in ui['byLine']:
    b['searchText'] = f"{b['hs6'].replace('.', '')} {b['hs6']} {b['description'].lower()} {GROUPS[b['heading']][0].lower()}"
ui['sources'] = [
    ui['sources'][0],
    {'label': 'Federal Register 91 FR 42709 and 91 FR 42713 (paper plates circumvention, July 10, 2026)',
     'url': FR + '2026/07/10/2026-13973/certain-paper-plates-from-the-peoples-republic-of-china-preliminary-affirmative-determination-of'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = 'HTS Chapter 48: Paper and Paperboard — Tariff Rates by Country'
ia['seo'] = {
    'title': 'Paper Tariff Rates by Country: Canada, China, Mexico, Vietnam, Finland, Germany, Indonesia (HTS Ch. 48) | KoalaGains',
    'shortDescription': ('The total U.S. tariff on paper and paperboard by country and product group: Free for USMCA goods except 62 Canadian lines at '
                         '50%; 10% or 12.5% from the 60 Section 301 economies; 37.5% from China and Brazil.'),
    'keywords': ['paper tariffs canada', 'canada tariffs paper products', 'tariffs on paper from china', 'paper tariff by country',
                 'paper products tariffs', 'packaging tariffs by country', 'toilet paper tariff canada', 'containerboard tariffs'],
}
ia['intro'] = (
    'Each cell below is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff '
    'schedule. Every Chapter 48 line is Free at base, so the totals are the extra duties alone.\n\n'
    'No paper line is on the 2026 Section 301 exemption lists, so goods from the 60 listed economies pay **10% or 12.5%** on every line (EU: 10%, '
    'Japan and Korea: 12.5%, both in place of the Free base rate). Canadian and Mexican goods are **Free with USMCA**, except **62 Canadian lines '
    'that pay 50% under Section 338** with or without USMCA; those groups show "Free · 50%". China pays **37.5%** (20% on wallpaper and 4818.90) and '
    'Brazil **37.5%**. Antidumping and countervailing duties, which reach many paper products from China, Vietnam, India, Indonesia and others, are '
    '**not** included.'
)
LABELS = {
    'Canada': ('Free with USMCA (note 52(g), 9903.05.93), +10% without (9903.05.29). 62 lines pay +50% Section 338 even with USMCA: 11 under 9903.03.12 '
               '(kraftliner 4804.11, greaseproof 4806.20, coated paper 4810.13.19, 4811.59.60, 4811.90.80, 4811.90.90) and 51 under 9903.03.14 (writing '
               'and printing paper of 4802.55.10 and 4802.61–4802.69, coated board, cigarette paper booklets, wallpaper, envelopes, napkins, face masks, '
               'corrugated boxes, bags, containers, notebooks, binders, labels, cups and molded pulp). The 35% IEEPA duty ended February 24, 2026.'),
    'China': ('+25% List 3 (9903.88.03) on 308 lines or +7.5% List 4A (9903.88.15) on wallpaper and 4818.90, plus +12.5% (9903.05.31) on every line: '
              '37.5% or 20%. AD/CVD on thermal, uncoated and coated paper, tissue, crepe and lined paper, gift boxes, bags, folders, plates and molded '
              'fiber not shown. The IEEPA duties ended February 24, 2026.'),
    'Mexico': 'Free with USMCA (note 52(h), 9903.05.94), +10% without (9903.05.55) on every line. Mexico is not subject to Section 338.',
    'Vietnam': '+12.5% (9903.05.84) on every line. AD/CVD on paper plates, molded fiber, shopping bags and file folders not shown.',
    'Finland': 'EU: 10% in place of the Free base rate on every line (9903.05.39). The 15% IEEPA reciprocal rate ended February 24, 2026.',
    'Germany': 'EU: 10% in place of the Free base rate on every line (9903.05.39). The antidumping duty on German thermal paper is not shown.',
    'Indonesia': '+10% (9903.05.45) on every line. AD/CVD on certain uncoated paper and sheet-fed coated paper not shown.',
    'South Korea': '12.5% in place of the Free base rate on every line (9903.05.71), also with a KORUS claim. The antidumping duty on thermal paper is not shown.',
    'India': '+10% (9903.05.44) on every line. AD/CVD on lined paper, shopping bags and file folders not shown.',
    'Sweden': 'EU: 10% in place of the Free base rate on every line (9903.05.39). The 15% IEEPA reciprocal rate ended February 24, 2026.',
    'Malaysia': '+10% (9903.05.54) on every line. The antidumping duty on shopping bags and the paper plates circumvention finding are not shown.',
    'Thailand': '+12.5% (9903.05.77) on every line. The antidumping duty on paper plates is not shown.',
    'Brazil': ('+25% Brazil Section 301 (9903.05.01) and +12.5% (9903.05.27) on every line: 37.5%; no Chapter 48 line is on the note 50(a)(ii) '
               'exemption list. The antidumping duty on certain uncoated paper is not shown.'),
    'United Kingdom': '+10% (9903.05.81) on every line.',
    'Japan': '12.5% in place of the Free base rate on every line (9903.05.49). The antidumping duty on thermal paper is not shown.',
    'Any other country': ('Free for countries outside the 60 Section 301 economies; 10% or 12.5% for the other listed economies on every line. Russia pays '
                          '35% in place of Free on 23 lines plus 12.5%. Nicaragua\'s Section 301 duty is 0% until January 1, 2027.'),
}
for c in ia['countries']:
    c['rule']['label'] = LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'][1] = 'Ranges like "Free · 50%" mean the group has lines with different totals; select a cell to see which lines carry which rate.'
ia['assumptions'] += [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'Section 338 (9903.03.12, 9903.03.14) applies to the listed Canadian lines on both sides of the Canada row, because U.S. note 51(a) charges it even when USMCA is claimed.',
    'No Section 232 duty is applied: the timber and lumber action (U.S. note 37, Proclamation 10976) lists no Chapter 48 line.',
    'Antidumping and countervailing duties are not included. Orders cover thermal paper, certain uncoated paper, sheet-fed coated paper, tissue and crepe paper, lined paper, folding gift boxes, paper shopping bags, file folders, paper plates and molded fiber products from the countries named in the labels; cash deposits are company-specific.',
    'The civil aircraft exemptions (9903.03.16, 9903.05.05, 9903.05.88) for paper gaskets and other parts of 4823.90 entered under General Note 6 are not applied.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 2, 20, 29, 30, 37, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 48 provision is on the 2026 '
    'Section 301 exemption lists (note 52(b), (c), (e)) or on any country list in note 52(j), nor on the Brazil exemption list (note 50(a)(ii)); only '
    '4823.90 civil aircraft parts are on the note 50(a)(iv), 51(d) and 52(d) lists. The Canada Section 338 lists cover six provisions in note 51(b)(1) and '
    '31 in note 51(b)(3) (62 ten-digit lines). Every Chapter 48 subheading is on China List 3 (note 20(f)) except 4814.20, 4814.90.02 and 4818.90.00 '
    '(List 4A), with no product exclusion in effect. No Chapter 48 line is in the Section 232 timber and lumber note (note 37).'
)
ia['lastCheckedAt'] = TODAY
add_sources(ia, ['procl-10976', 'eo-14389', 'procl-11012', 'csms-69326983', 'fr-2025-04764', 'fr-2026-01604'])

# ---------------------------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = 'HTS Chapter 48: Paper and Paperboard — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Paper & Paperboard: Rules, AD/CVD Scope and Legal Ways to Lower Duty (HTS Ch. 48) | KoalaGains',
    'shortDescription': ('Tariff engineering for HTS Chapter 48: claim USMCA, classify to the right 8-digit line (the Canada Section 338 list turns on it), '
                         'check AD/CVD scopes and circumvention findings, use drawback, and meet the marking, USMCA and FDA food-contact rules.'),
    'keywords': ['tariff engineering paper', 'HTS Chapter 48 tariff engineering', 'paper classification', 'USMCA paper certificate',
                 'paper duty drawback', 'antidumping scope ruling paper', 'paper food contact FDA', 'first sale valuation'],
}
te['intro'] = (
    'Every Chapter 48 line is **Free** under the general rate, so the levers are about the extra duties, and those turn on **origin**, the exact '
    '**8-digit line** and, for many products, the **scope of an AD/CVD order**.\n\n'
    'For Canadian and Mexican goods, a USMCA claim removes the 10% Section 301 duty, but not the 50% Section 338 duty on 62 Canadian lines, and that '
    'list is drawn by 8-digit subheading: writing paper in rolls 4802.55.10 is listed and 4802.55.20–.40 are not, mechanical-pulp printing paper '
    '4802.61.31 is not while 4802.61.10, .20 and .60 are. So correct classification, ideally confirmed by a binding ruling, matters. Next, check whether '
    'the product falls inside an antidumping or countervailing duty order; finishing it in a third country does not take it out. Then recover duties by '
    'drawback when goods are exported. Each rule and lever links to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = ECFR_DATE
te['levers'] = [
    {'id': 'usmca', 'title': 'Claim USMCA for Canadian and Mexican paper',
     'saves': '10% of value: the 2026 Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55), on every Chapter 48 line',
     'appliesTo': 'Originating goods of Canada and Mexico (all lines)',
     'document': ('A USMCA certification of origin from the importer, exporter or producer, in the importer\'s possession when the claim is made; it need '
                  'not follow a prescribed format (19 CFR 182.12). Rules of origin: General Note 11.'),
     'caveat': ('It does not remove the 50% Section 338 duty on the 62 listed Canadian lines (U.S. note 51(a)). The USMCA was not renewed at the July 1, '
                '2026 joint review but remains in force.'),
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR19 + 'section-182.12'},
                   {'label': 'HTSUS General Note 11 (USMCA)', 'url': GN},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(a) and 52(g)–(h)', 'url': CH99},
                   {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': reuse['ustr-usmca-review']['url']}]},
    {'id': 'classify', 'title': 'Classify to the right 8-digit line: the Section 338 list and AD/CVD scopes follow it',
     'saves': '50% on Canadian goods when the product belongs in an unlisted subheading (e.g. 4802.55.20–.40 instead of 4802.55.10); the China List 4A rate (7.5%) instead of List 3 (25%) for 4814 and 4818.90',
     'appliesTo': 'All headings; most often 4802, 4810, 4811, 4818, 4819, 4820 and 4823',
     'document': ('Mill specifications showing the fiber furnish (chemical vs mechanical pulp, kraft share), basis weight, coating, brightness and ash, '
                  'and the roll width or sheet size that chapter notes 5–8 and the subheading notes test. A binding ruling under 19 CFR part 177 '
                  'settles the line before import.'),
     'caveat': ('Classification follows what the paper is, not where the duty is lower. Note 7 sends paper that fits several of 4801–4811 to the last '
                'heading, and note 8 moves small cut sizes out of 4803–4809 into 4816–4823.'),
     'citations': [{'label': 'HTSUS Chapter 48, notes 5–8 and subheading notes', 'url': CH48},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20 and 51(b)', 'url': CH99},
                   {'label': '19 CFR part 177 (rulings)', 'url': ECFR19 + 'part-177'}]},
    {'id': 'adcvd-scope', 'title': 'Check AD/CVD scopes and circumvention findings before buying',
     'saves': 'The antidumping and countervailing cash deposits (company-specific; often far above the tariff) when the product is outside the scope',
     'appliesTo': ('Thermal and uncoated paper, sheet-fed coated paper, tissue and crepe paper, lined paper, gift boxes, shopping bags, file folders, '
                   'paper plates and molded fiber products from the countries with orders'),
     'document': ('The written scope in the order decides, not the HTS number. When unsure, ask Commerce for a scope ruling (19 CFR 351.225). Products '
                  'finished in a third country from in-scope inputs can still be covered (19 CFR 351.226): Commerce preliminarily found that paper plates '
                  'finished in Cambodia and Malaysia from Chinese board are, and is investigating tissue paper finished in Vietnam.'),
     'caveat': ('Cash-deposit rates change with each administrative review; check the latest Federal Register notice and CBP\'s AD/CVD messages before '
                'importing. A supplier switch to a country with its own order does not help.'),
     'citations': [{'label': '19 CFR 351.225 (scope rulings)', 'url': ECFR19 + 'section-351.225'},
                   {'label': '19 CFR 351.226 (circumvention)', 'url': ECFR19 + 'section-351.226'},
                   {'label': '91 FR 42709 (paper plates, Cambodia)', 'url': NEWBY['fr-2026-13973']['url']},
                   {'label': '91 FR 50789 (tissue paper, Vietnam)', 'url': NEWBY['fr-2026-16056']['url']}]},
    {'id': 'drawback', 'title': 'Claim drawback when the paper, or goods made from it, is exported',
     'saves': 'Generally 99% of the eligible duties paid on paper that is re-exported or used to make exported goods (19 CFR 191.3, 191.51)',
     'appliesTo': 'All lines that paid an extra duty',
     'document': 'A drawback claim to CBP with the import and export records (19 CFR part 191).',
     'caveat': ('Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)). Check the Chapter 99 note and CBP guidance '
                'for whether a given extra duty is eligible.'),
     'citations': [{'label': '19 CFR part 191', 'url': ECFR19 + 'part-191'},
                   {'label': '19 CFR 191.3', 'url': ECFR19 + 'section-191.3'},
                   {'label': '19 CFR 191.51', 'url': ECFR19 + 'section-191.51'}]},
    {'id': 'civil-aircraft', 'title': 'Enter paper gaskets and other aircraft parts of 4823.90 under the civil aircraft exemption',
     'saves': 'The 2026 Section 301 duty, Brazil\'s 25% and Canada\'s 50% Section 338 duty, for civil aircraft parts entered under General Note 6',
     'appliesTo': '4823.90.10–4823.90.86 (paper pulp and papier-mâché articles, paper gaskets, washers and seals, other paper articles)',
     'document': 'The General Note 6 civil aircraft certification on the entry, then the relief heading: 9903.05.88 (Section 301), 9903.05.05 (Brazil), 9903.03.16 (Canada).',
     'caveat': 'Only for parts for civil aircraft that meet General Note 6; the China List 3 duty is not lifted.',
     'citations': [{'label': 'HTSUS General Note 6', 'url': GN},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 50(a)(iv), 51(d), 52(d)', 'url': CH99}]},
]
te['rules'] = [
    {'id': 'marking', 'agency': 'CBP',
     'title': 'Country-of-origin marking: every imported article or its container must show the country of origin in English (19 CFR 134.11); when the article itself is excepted, the outermost container must still be marked (19 CFR 134.22(a))',
     'citations': [{'label': '19 CFR 134.11', 'url': ECFR19 + 'section-134.11'}, {'label': '19 CFR 134.32', 'url': ECFR19 + 'section-134.32'},
                   {'label': '19 CFR 134.22', 'url': ECFR19 + 'section-134.22'}]},
    {'id': 'usmca-cert', 'agency': 'CBP',
     'title': 'USMCA claims: a certification of origin in the importer\'s possession, provided to CBP on request',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR19 + 'section-182.12'}, {'label': 'HTSUS General Note 11', 'url': GN}]},
    {'id': 'section-301', 'agency': 'CBP',
     'title': 'Report the Section 301 heading for the country of origin with the Chapter 48 line: 9903.05.20–9903.05.84 (60 economies), 9903.05.01 (Brazil), 9903.88.03 or 9903.88.15 (China)',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 50 and 52', 'url': CH99},
                   {'label': 'CBP CSMS # 69326983', 'url': NEWBY['csms-69326983']['url']}]},
    {'id': 's338-canada', 'agency': 'CBP',
     'title': 'Canadian goods on the note 51(b) lists: report 9903.03.12 or 9903.03.14 and pay the 50% Section 338 duty, also when USMCA is claimed',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 51', 'url': CH99},
                   {'label': 'Proclamation 11046 (91 FR 46639)', 'url': next(s for s in tu['sources'] if s['id'] == 'procl-11046')['url']},
                   {'label': 'Proclamation 11048 (91 FR 46663)', 'url': next(s for s in tu['sources'] if s['id'] == 'procl-11048')['url']},
                   {'label': 'Proclamation 11065 (91 FR 58339)', 'url': next(s for s in tu['sources'] if s['id'] == 'procl-11065')['url']}]},
    {'id': 'ad-thermal', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Thermal paper: antidumping duties on Germany, Japan, South Korea and Spain; AD/CVD on lightweight thermal paper from China',
     'citations': [{'label': '86 FR 66284 (thermal paper orders)', 'url': NEWBY['fr-2021-25365']['url']},
                   {'label': '91 FR 2910 (lightweight thermal paper, China)', 'url': NEWBY['fr-2026-01283']['url']}]},
    {'id': 'ad-uncoated', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain uncoated paper (cut-size and folio sheets): antidumping duties on Australia, Brazil, China, Indonesia and Portugal; CVD on China and Indonesia',
     'citations': [{'label': '87 FR 7426 (continuation)', 'url': NEWBY['fr-2022-02686']['url']}]},
    {'id': 'ad-coated', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Coated paper for sheet-fed presses: antidumping and countervailing duties on China and Indonesia',
     'citations': [{'label': '87 FR 35733 (continuation)', 'url': NEWBY['fr-2022-12706']['url']}]},
    {'id': 'ad-tissue', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain tissue paper products (lightweight tissue in sheets, e.g. gift tissue; not toilet or facial tissue): antidumping duty on China',
     'citations': [{'label': '86 FR 67437 (continuation)', 'url': NEWBY['fr-2021-25772']['url']},
                   {'label': '91 FR 50789 (circumvention inquiry, Vietnam)', 'url': NEWBY['fr-2026-16056']['url']}]},
    {'id': 'ad-crepe', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain crepe paper products (e.g. streamers): antidumping duty on China',
     'citations': [{'label': '91 FR 46773 (continuation)', 'url': NEWBY['fr-2026-14972']['url']}]},
    {'id': 'ad-lined', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain lined paper products (school notebooks, filler paper): antidumping duties on China and India; CVD on India',
     'citations': [{'label': '88 FR 56591 (continuation)', 'url': NEWBY['fr-2023-17811']['url']}]},
    {'id': 'ad-giftbox', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain folding gift boxes: antidumping duty on China',
     'citations': [{'label': '88 FR 83532 (continuation)', 'url': NEWBY['fr-2023-26336']['url']}]},
    {'id': 'ad-bags', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain paper shopping bags: antidumping duties on Cambodia, China, Colombia, India, Malaysia, Portugal, Taiwan, Türkiye and Vietnam; CVD on China and India',
     'citations': [{'label': '89 FR 58334 (AD orders)', 'url': NEWBY['fr-2024-15746']['url']},
                   {'label': '89 FR 58331 (CVD orders)', 'url': NEWBY['fr-2024-15747']['url']},
                   {'label': '89 FR 39586 (Türkiye AD order)', 'url': NEWBY['fr-2024-10253']['url']}]},
    {'id': 'ad-folders', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Paper file folders: antidumping duties on China, India, Vietnam and Sri Lanka; CVD on India and Cambodia',
     'citations': [{'label': '88 FR 81048 (orders)', 'url': NEWBY['fr-2023-25688']['url']},
                   {'label': '90 FR 46553 (Sri Lanka)', 'url': NEWBY['fr-2025-18886']['url']},
                   {'label': '91 FR 8205 (Cambodia CVD)', 'url': NEWBY['fr-2026-03419']['url']}]},
    {'id': 'ad-plates', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Certain paper plates: antidumping duties on China, Thailand and Vietnam; CVD on China and Vietnam; plates finished in Cambodia or Malaysia from Chinese board preliminarily covered',
     'citations': [{'label': '90 FR 13139 (AD orders)', 'url': NEWBY['fr-2025-04764']['url']},
                   {'label': '90 FR 13135 (CVD orders)', 'url': NEWBY['fr-2025-04765']['url']},
                   {'label': '91 FR 42709 / 42713 (circumvention)', 'url': NEWBY['fr-2026-13974']['url']}]},
    {'id': 'ad-molded', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Thermoformed molded fiber products (molded pulp plates, bowls, clamshells, trays, lids and packaging): antidumping and countervailing duties on China and Vietnam',
     'citations': [{'label': '91 FR 3431 (AD orders)', 'url': NEWBY['fr-2026-01604']['url']},
                   {'label': '91 FR 3437 (CVD orders)', 'url': NEWBY['fr-2026-01605']['url']}]},
    {'id': 'adcvd-pizza', 'agency': 'Commerce (ITA) / USITC',
     'title': 'Corrugated pizza boxes from China, Malaysia and Türkiye: AD/CVD petitions filed September 9, 2026; no duty unless orders issue',
     'citations': [{'label': '91 FR 58174 (ITC institution)', 'url': NEWBY['fr-2026-18723']['url']},
                   {'label': '91 FR 62690 (Commerce extension)', 'url': NEWBY['fr-2026-20257']['url']}]},
    {'id': 'fda-food-contact', 'agency': 'FDA',
     'title': 'Paper and board for food packaging and tableware: food-contact components must meet the indirect food additive rules (21 CFR 174.5; 176.170 for aqueous and fatty food; 176.180 for dry food)',
     'citations': [{'label': '21 CFR 174.5', 'url': ECFR21 + 'section-174.5'},
                   {'label': '21 CFR 176.170', 'url': ECFR21 + 'section-176.170'},
                   {'label': '21 CFR 176.180', 'url': ECFR21 + 'section-176.180'}]},
]

NOTES = {
    '4801': 'Newsprint: marking and USMCA certification. Not on the Section 338 lists, so USMCA-qualifying Canadian newsprint is Free.',
    '4802': 'Copy and printing paper. Thirteen lines are on the Canada Section 338 list, and certain uncoated paper from five countries is under AD/CVD; document the fiber furnish and sheet size.',
    '4803': 'Tissue parent rolls. Removed from the Section 338 list on September 15, 2026. Jumbo rolls from China are the input in the Vietnam tissue circumvention inquiry.',
    '4804': 'Kraft paper and board. Unbleached kraftliner (4804.11) from Canada pays 50% under Section 338. Cup and carton base stock is food-contact material.',
    '4805': 'Fluting, testliner and recycled board: no Section 338 or AD/CVD measures.',
    '4806': 'Greaseproof paper from Canada pays 50% under Section 338; greaseproof and parchment paper used with food must meet FDA food-contact rules.',
    '4807': 'Composite paper: marking and USMCA certification only.',
    '4808': 'Crepe paper products from China are under an antidumping order.',
    '4809': 'Copying and transfer paper in large rolls: marking and USMCA certification only.',
    '4810': 'Coated paper and board: five Canadian lines pay 50% under Section 338; sheet-fed coated paper from China and Indonesia is under AD/CVD.',
    '4811': 'Fourteen Canadian lines pay 50% under Section 338. Direct thermal paper (4811.90.8030, .9030) is under AD orders; wax and poly-coated food board must meet FDA rules.',
    '4812': 'Filter blocks: marking and USMCA certification only.',
    '4813': 'Canadian cigarette paper booklets and tubes (4813.10) pay 50% under Section 338.',
    '4814': 'Plastic-coated wallpaper (4814.20) from Canada pays 50% under Section 338; Chinese wallpaper is on List 4A (7.5%).',
    '4816': 'Carbon and self-copy paper, cut: marking and USMCA certification only.',
    '4817': 'Canadian envelopes (4817.10) pay 50% under Section 338.',
    '4818': 'Canadian napkins and tablecloths (4818.30) and face masks (4818.90.0020) pay 50% under Section 338; toilet paper and towels do not.',
    '4819': 'Corrugated boxes, small bags and other containers from Canada pay 50% under Section 338. Shopping bags and gift boxes are under AD/CVD; pizza boxes are under petition. Food containers must meet FDA rules.',
    '4820': 'Canadian notebooks, diaries, memo pads and binders pay 50% under Section 338. Lined paper and file folders are under AD/CVD.',
    '4821': 'Unprinted non-adhesive labels (4821.90.40) from Canada pay 50% under Section 338.',
    '4822': 'Bobbins and cores: marking and USMCA certification only.',
    '4823': 'Paper cups, molded pulp and other articles of 4823.69–4823.90 from Canada pay 50% under Section 338. Paper plates and molded fiber products are under AD/CVD; food-contact rules apply.',
}
for g in te['groups']:
    g['label'] = GROUPS[g['heading']][0]
    h = g['heading']
    rules = ['marking', 'usmca-cert', 'section-301']
    hl = [l['hts'] for l in te['lines'] if l['hts'].startswith(h)]
    if any(starts(x, S338_B1 + S338_B3) for x in hl):
        rules.append('s338-canada')
    for rid, pref in ADCVD.items():
        if any(starts(x, pref) for x in hl):
            rules.append(rid)
    if any(starts(x, FOOD_CONTACT) for x in hl):
        rules.append('fda-food-contact')
    g['ruleIds'] = rules
    g['note'] = NOTES[h]
for l in te['lines']:
    x = l['hts']
    rules = ['marking', 'usmca-cert', 'section-301']
    levers = ['usmca', 'classify']
    if starts(x, S338_B1 + S338_B3):
        rules.append('s338-canada')
    inscope = False
    for rid, pref in ADCVD.items():
        if starts(x, pref):
            rules.append(rid)
            inscope = True
    if starts(x, FOOD_CONTACT):
        rules.append('fda-food-contact')
    if inscope:
        levers.append('adcvd-scope')
    if starts(x, CIVIL_AIRCRAFT):
        levers.append('civil-aircraft')
    levers.append('drawback')
    l['ruleIds'], l['leverIds'] = rules, levers
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations; not legal advice. AD/CVD scopes and cash-deposit rates are '
                    'company-specific and change with each review; check Commerce\'s latest notice and CBP\'s instructions before importing.')

# ---------------------------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = 'HTS Chapter 48: Paper and Paperboard — Tariff FAQ'
fc['seo'] = {
    'title': 'Paper Tariffs FAQ: Canada, China, Toilet Paper, Boxes, Bags, HS Codes for Paper (HTS Ch. 48) | KoalaGains',
    'shortDescription': ('Answers to what people search about paper tariffs: tariffs on paper products, Canadian paper and toilet paper tariffs, paper from '
                         'China, HS codes for toilet paper, paper bags, boxes and paper cups, thermal paper antidumping and U.S. paper imports.'),
    'keywords': ['paper tariffs', 'tariffs on paper products', 'paper tariffs canada', 'toilet paper tariffs', 'tariffs on paper towels',
                 'tariffs on paper products from china', 'hs code for toilet paper', 'hs code for paper bags', 'hs code for corrugated boxes',
                 'hs code for paper cups', 'hs code for notebook', 'thermal paper antidumping', 'us paper imports', 'hts chapter 48'],
}
fc['intro'] = ('Straight answers to the most common questions about U.S. tariffs on paper, paperboard and paper products, by country, by product and by '
               'HS code. Each answer links to the page with the full detail.')
fc['keyTakeaways'] = [
    'Every Chapter 48 line is Free under the general rate. The 2026 Section 301 duty adds 10% or 12.5% on every paper line from the 60 listed economies; none is exempt.',
    'Canadian and Mexican paper is Free with a USMCA claim, except 62 Canadian lines (corrugated boxes, kraftliner, writing paper in rolls, envelopes, napkins, notebooks, paper cups and more) that pay 50% under Section 338 even with USMCA.',
    'China pays 37.5% (20% on wallpaper and 4818.90) and Brazil 37.5%. Many paper products from China, Vietnam, India, Indonesia and others also carry antidumping or countervailing duties. The 2025 IEEPA duties ended February 24, 2026.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 13, 2026'
fc['faqs'] = [
    {'id': 'paper-products', 'question': 'Are there tariffs on paper products?',
     'searchedAs': ['tariffs on paper products', 'us tariffs on paper products', 'are there tariffs on paper products', 'paper tariffs', 'tariffs paper products', 'paper goods tariffs'],
     'answer': ('The base (MFN) rate is Free on all 312 Chapter 48 lines, but extra duties depend on origin. Since July 24, 2026 the 60 economies in the 2026 '
                'Section 301 action pay 10% or 12.5% on every paper line (EU 10%, Japan and Korea 12.5%). Canadian and Mexican goods are Free with USMCA, '
                'except 62 Canadian lines that pay 50% under Section 338. China pays 37.5% and Brazil 37.5%. Countries outside these programs pay nothing '
                'extra. Antidumping or countervailing duties apply on top to many specific products.'),
     'link': 'industry-areas'},
    {'id': 'canada', 'question': 'Are there U.S. tariffs on paper from Canada?',
     'searchedAs': ['paper tariffs canada', 'tariffs on paper from canada', 'are there tariffs on paper from canada', 'canadian paper tariffs',
                    'canada tariffs paper products', 'us tariffs on canadian paper products'],
     'answer': ('Mostly not, if the paper qualifies for USMCA: it is Free, and without a USMCA claim it pays 10% (9903.05.29). But since August 22, 2026, 62 '
                'Canadian lines pay a 50% Section 338 duty even with USMCA (60% without): unbleached kraftliner, greaseproof paper, some coated and thermal '
                'paper, writing paper in rolls and, since September 15, mechanical-pulp printing paper of 4802.61–4802.69, envelopes, napkins, corrugated '
                'boxes, small bags, notebooks, binders, labels and paper cups. Newsprint, copy paper, fluting, toilet paper and towels are not listed. The '
                '2025 IEEPA duties (25%, then 35%) ended February 24, 2026.'),
     'link': 'tariff-updates'},
    {'id': 'toilet-paper', 'question': 'Are there tariffs on toilet paper?',
     'searchedAs': ['toilet paper tariffs', 'tariffs on toilet paper', 'is toilet paper tariffed', 'toilet paper tariff canada', 'canadian toilet paper tariffs'],
     'answer': ('Toilet paper (4818.10.00) is Free at base. From Canada or Mexico it is Free with a USMCA claim and 10% without; it is not on the Canada Section '
                '338 list. From China it pays 37.5% (25% List 3 plus 12.5%), from Vietnam and Thailand 12.5%, from Indonesia, India and Malaysia 10%, and '
                'from the EU 10%. The antidumping order on "tissue paper products" from China covers lightweight wrapping tissue, not toilet paper.'),
     'link': 'industry-areas'},
    {'id': 'paper-towels', 'question': 'Are there tariffs on paper towels and napkins?',
     'searchedAs': ['tariffs on paper towels', 'are there tariffs on paper towels'],
     'answer': ('Paper towels (4818.20.00.20) follow the toilet paper rates: Free at base, Free with USMCA from Canada and Mexico, 10% or 12.5% from the 60 Section '
                '301 economies and 37.5% from China. Table napkins and tablecloths (4818.30) differ for Canada: they are on the Section 338 list, so '
                'Canadian napkins pay 50% even with USMCA.'),
     'link': 'industry-areas'},
    {'id': 'china', 'question': 'What are the tariffs on paper products from China?',
     'searchedAs': ['tariffs on paper products from china', 'tariff on paper from china', 'tariffs on paper goods from china'],
     'answer': ('Two Section 301 duties: 25% under List 3 (9903.88.03) on all paper lines except wallpaper and 4818.90, which pay 7.5% under List 4A, plus 12.5% '
                'under the 2026 action (9903.05.31): 37.5% or 20%. USTR confirmed on October 7, 2026 that the 2018–2019 duties continue. Many Chinese paper '
                'products also carry AD/CVD: thermal, uncoated and coated paper, tissue and crepe paper, lined paper, gift boxes, shopping bags, file '
                'folders, paper plates and molded fiber. The IEEPA duties on China ended February 24, 2026.'),
     'link': 'tariff-updates'},
    {'id': 'hs-toilet-paper', 'question': 'What is the HS code for toilet paper, tissues and paper towels?',
     'searchedAs': ['hs code for toilet paper', 'toilet paper hs code', 'hs code for toilet tissue', 'tariff code for toilet paper', 'hs code for tissue paper',
                    'hs code for paper towels', 'hs code for paper napkins', 'hs code 4818'],
     'answer': ('Heading 4818 when cut to size for household use: 4818.10 toilet paper, 4818.20 handkerchiefs, facial tissues and towels (U.S. suffix .20 towels), '
                '4818.30 tablecloths and napkins, 4818.50 paper apparel and 4818.90 other (suffix .20 face masks). Large parent rolls of tissue, towel or napkin '
                'stock are 4803.00. Thin wrapping tissue in sheets is classified elsewhere, e.g. 4804.39.40.41 or 4811.90. All are Free at base.'),
     'link': ''},
    {'id': 'hs-paper-bags', 'question': 'What is the HS code for paper bags?',
     'searchedAs': ['hs code for paper bags', 'hs code for kraft paper bags', 'hs code for paper shopping bags', 'paper bags hs code', 'paper bags tariff code', 'paper bag tariff'],
     'answer': ('Paper sacks and bags are in 4819: 4819.30 for bags with a base 40 cm wide or more and 4819.40 for other bags, including cones; U.S. suffix .20 is '
                'shipping sacks and multiwall bags and .40 is other bags such as grocery and shopping bags. Both are Free at base. Paper shopping bags '
                '(4819.30.0040, 4819.40.0040) from Cambodia, China, Colombia, India, Malaysia, Portugal, Taiwan, Türkiye and Vietnam carry antidumping duties, '
                'and Canadian bags of 4819.40 pay 50% under Section 338.'),
     'link': 'tariff-engineering'},
    {'id': 'hs-boxes', 'question': 'What is the HS code for corrugated and cardboard boxes?',
     'searchedAs': ['hs code for corrugated boxes', 'hs code for cardboard boxes', 'hs code for carton box', 'hs code 4819.10', 'hs code 4819.20', 'tariffs on corrugated boxes'],
     'answer': ('Boxes of corrugated paper or board are 4819.10.00 (suffix .20 sanitary food and beverage containers, .40 other); folding cartons of non-corrugated '
                'board are 4819.20.00; rigid boxes are 4819.50.40.40. All are Free at base. Canadian corrugated boxes pay 50% under Section 338 even with USMCA. '
                'AD/CVD petitions on corrugated pizza boxes from China, Malaysia and Türkiye were filed on September 9, 2026; folding gift boxes from China '
                'are under an antidumping order.'),
     'link': 'tariff-updates'},
    {'id': 'hs-cups-plates', 'question': 'What is the HS code for paper cups and paper plates?',
     'searchedAs': ['hs code for paper cups', 'hs code for paper bowls', 'hs code for disposable paper cups', 'paper plates tariff code', 'paper plate tariff', 'hs code 4823.69'],
     'answer': ('Paper cups, plates, trays and dishes are 4823.69.00 (4823.61.00 if of bamboo): suffix .20 is cups and round nested food containers, .40 other such as '
                'plates. Molded pulp plates, bowls and cups are 4823.70.00.20. All are Free at base. Paper plates from China, Thailand and Vietnam and molded '
                'fiber products from China and Vietnam carry antidumping and countervailing duties, and Canadian goods of 4823.69 and 4823.70 pay 50% under '
                'Section 338.'),
     'link': 'tariff-engineering'},
    {'id': 'hs-4823', 'question': 'What is HS code 4823.90?',
     'searchedAs': ['hs code 4823.90', 'hts code 4823.90', 'hs code 4823', '4823 hs code description'],
     'answer': ('4823 covers other paper and board cut to size or shape and other paper articles. 4823.90 is the catch-all: articles of paper pulp (4823.90.10), '
                'papier-mâché, punch cards, slide mounts, hand fans, paper gaskets and seals, cellulose wadding articles and other paper articles (4823.90.86, '
                'including paper shoe covers). All are Free at base; four 4823.90 lines are on the Canada Section 338 list, and parts for civil aircraft are '
                'exempt from the 2026 Section 301, Brazil and Section 338 duties.'),
     'link': ''},
    {'id': 'hs-notebook', 'question': 'What is the HS code for notebooks?',
     'searchedAs': ['hs code for notebook', 'hs code for notebook paper', 'hs code for spiral notebook', 'hs code 4820', 'hs code 4820.10'],
     'answer': ('Bound notebooks, diaries, address books, memo pads and letter pads are 4820.10.20 (sewn composition books are .30, other notebooks of 6–15 inch '
                'sides .40); exercise books are 4820.20.00 and binders 4820.30. All are Free at base. Lined paper products from China and India carry '
                'antidumping duties (and a CVD on India), and Canadian goods of 4820.10.20 and 4820.30 pay 50% under Section 338.'),
     'link': 'tariff-engineering'},
    {'id': 'thermal', 'question': 'Are there antidumping duties on thermal paper?',
     'searchedAs': ['thermal paper antidumping'],
     'answer': ('Yes. Antidumping orders from November 2021 cover thermal paper from Germany, Japan, South Korea and Spain (4811.90.8030, 4811.90.9030); the ITC '
                'began their five-year reviews on October 1, 2026. Lightweight thermal paper from China has had antidumping and countervailing duty orders '
                'since 2008, continued on January 23, 2026. Rates are company-specific and not included in the tariff calculator.'),
     'link': 'tariff-updates'},
    {'id': 'pulp-newsprint', 'question': 'Are there tariffs on pulp, paper and newsprint from Canada?',
     'searchedAs': ['pulp and paper tariffs', 'pulp and paper tariffs canada', 'us tariffs on pulp and paper', 'newsprint tariffs', 'canadian newsprint tariff'],
     'answer': ('Canadian newsprint (4801.00.01) is Free with a USMCA claim and 10% without; it is not on the Section 338 list. Most Canadian paper and board is '
                'treated the same way, except the 62 Section 338 lines at 50%. Wood pulp is a separate chapter (47) with its own exemptions. The Section 232 '
                'lumber duties do not cover paper or pulp.'),
     'link': 'industry-areas'},
    {'id': 'imports', 'question': 'Where does the U.S. import paper from?',
     'searchedAs': ['us paper imports', 'how much paper does the us import', 'where does the us get its paper', 'us toilet paper imports'],
     'answer': ('The U.S. imported $19.94B of Chapter 48 goods in 2025, down 3.9% from 2024. Canada supplied $6.59B (33%), then China $1.92B (down 37.5%), Mexico '
                '$1.70B, Vietnam $1.04B, Finland $990M, Germany $941M, Indonesia $744M, South Korea $665M, India $499M and Sweden $445M. Boxes, cartons and bags '
                'were the largest group ($3.56B).'),
     'link': 'understand-industry'},
    {'id': 'hts-48', 'question': 'What does HTS Chapter 48 cover?',
     'searchedAs': ['hts chapter 48', 'htsus chapter 48', 'hts code chapter 48', 'us hts chapter 48'],
     'answer': ('HTS Chapter 48, "Paper and paperboard; articles of paper pulp, of paper or of paperboard", is in Section X with pulp (Chapter 47) and printed '
                'matter (Chapter 49). It has 22 headings (4801–4823; 4815 is not used) and 312 ten-digit U.S. lines, all Free under the general rate: '
                'newsprint, printing and kraft paper, board, coated paper, tissue, wallpaper, envelopes, toilet paper, boxes and bags, notebooks, labels '
                'and paper cups and plates. Printed paper products whose printing is not incidental go to Chapter 49.'),
     'link': ''},
]

json.dump(d, open(out, 'w'), ensure_ascii=False, indent=2)
print('wrote', out)
