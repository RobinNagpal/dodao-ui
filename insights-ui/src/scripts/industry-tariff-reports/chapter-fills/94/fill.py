#!/usr/bin/env python3
"""Fill the writer TODOs of the generated Chapter 94 content file (re-runnable).

Usage: python3 fill.py <generated.json> <out.json>
Input is the untouched output of `pnpm tariff:generate-chapter --chapter 94 ...` (copied to gen.json); the data parts
(rate table, matrix totals, trade figures, line statuses) are kept as generated. Trade figures quoted in the prose are
read from the generated understandIndustry block, so the text follows the data.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import CACHE, FILLS  # noqa: E402,F401

import json
import sys

SCRATCH = FILLS
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
reuse = {s['id']: s for s in json.load(open(f'{SCRATCH}/47/reuse-sources.json'))}
frmeta = json.load(open(f'{SCRATCH}/94/frmeta.json'))

TODAY = '2026-10-13'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH94 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2094'
CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
CH99_25R22 = 'https://hts.usitc.gov/reststop/file?release=2025HTSRev22&filename=Chapter%2099'
ECFR16 = 'https://www.ecfr.gov/current/title-16/'
ECFR19 = 'https://www.ecfr.gov/current/title-19/'
ECFR40 = 'https://www.ecfr.gov/current/title-40/'
USC_16_3372 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm'


def fr(docnum, id_=None, document=None):
    m = frmeta[docnum]
    agencies = [a.get('name') for a in (m.get('agencies') or [])]
    if m['type'] == 'Presidential Document':
        doc = document or 'Presidential document'
    elif document:
        doc = document
    elif 'International Trade Commission' in agencies:
        doc = 'Notice (USITC)'
    elif 'Consumer Product Safety Commission' in agencies:
        doc = 'Final rule (CPSC)'
    elif 'Animal and Plant Health Inspection Service' in agencies:
        doc = 'Notice (USDA APHIS)'
    else:
        doc = 'Notice (Commerce)'
    return {'id': id_ or f'fr-{docnum}', 'publisher': 'Federal Register', 'citation': m['citation'], 'document': doc,
            'title': m['title'], 'signed': m.get('signing_date'), 'published': m['publication_date'], 'url': m['html_url']}


ADCVD_DOCS = [
    # Wooden bedroom furniture (China), A-570-890
    '2026-16446', '2022-19855',
    # Mattresses: China AD (2019) + CVD (2021); 2021 orders; 2024 orders; reviews, sunsets, circumvention
    '2019-27166', '2025-09559', '2021-10237', '2026-15034', '2021-10238', '2026-15471', '2026-16301', '2024-13038', '2024-00038',
    '2025-03529', '2024-15261', '2024-20346', '2026-16361', '2026-02636', '2026-02635', '2026-12810',
    # Wooden cabinets and vanities (China)
    '2020-08544', '2020-08546', '2025-17986', '2025-17301', '2026-07866', '2026-04943',
    # Steel racks (China); boltless steel shelving (China 2015 orders, 2024 orders)
    '2019-19949', '2025-03860', '2026-18791', '2026-15470', '2026-15742', '2026-19852', '2024-12566',
]
NEW_SOURCES = [
    {'id': 'hts-ch94', 'publisher': 'USITC', 'citation': 'HTSUS 2026 Revision 21, Chapter 94', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 94', 'signed': None, 'published': '2026-10-07', 'url': CH94},
    {'id': 'hts-2025r22-ch99', 'publisher': 'USITC', 'citation': 'HTSUS 2025 Revision 22, Chapter 99', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2025 Revision 22), Chapter 99 (U.S. notes 2 and 16, as in force in September 2025)',
     'signed': None, 'published': '2025-09-08', 'url': CH99_25R22},
    fr('2025-10524', 'procl-10947', 'Proclamation 10947'),
] + [fr(x) for x in ADCVD_DOCS]
for sid in ['eo-14193', 'eo-14194', 'eo-14195', 'eo-14228', 'eo-14231', 'eo-14232', 'eo-14257', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14323',
            'eo-14325', 'eo-14326', 'eo-14357', 'eo-14389', 'csms-67834313', 'scotus-24-1287', 'procl-11012', 'ustr-usmca-review']:
    NEW_SOURCES.append(reuse[sid])
SRC = {s['id']: s for s in NEW_SOURCES}

d['asOf'] = TODAY
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 94 notes (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': 'U.S. import figures by country, heading and HS6 line'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Trade figures used in the prose (from the generated understandIndustry block)
# ---------------------------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
YEAR = ui['latestYear']
PRIOR = ui['priorYear']
TOTAL = sum(c['importsUsd'] for c in ui['byCountry']) + ui['othersImportsUsd']
TOTAL_PRIOR = sum(c['priorImportsUsd'] for c in ui['byCountry']) + ui['othersPriorImportsUsd']
BYC = {c['country']: c for c in ui['byCountry']}
BYH = {}
for l in ui['byLine']:
    BYH[l['heading']] = BYH.get(l['heading'], 0) + l['importsUsd']
BYL = {l['hs6']: l for l in ui['byLine']}


def money(v):
    if v >= 1e9:
        return f'${v / 1e9:.2f}B'
    if v >= 1e6:
        return f'${v / 1e6:.0f}M'
    return f'${v / 1e3:.0f}K'


def cimp(name):
    c = BYC.get(name)
    return money(c['importsUsd']) if c else 'n/a'


def cshare(name):
    c = BYC.get(name)
    return f"{100 * c['importsUsd'] / TOTAL:.0f}%" if c else 'n/a'


def chg(cur, prior):
    if not prior:
        return 'n/a'
    p = 100 * (cur - prior) / prior
    return f"{'up' if p >= 0 else 'down'} {abs(p):.1f}%"


NAME = {'Viet Nam': 'Vietnam', 'Rep. of Korea': 'South Korea', 'Other Asia, nes': 'Taiwan', 'Türkiye': 'Turkey'}
BYC = {NAME.get(k, k): v for k, v in BYC.items()}
TOP = [NAME.get(c['country'], c['country']) for c in sorted(ui['byCountry'], key=lambda c: -c['importsUsd'])]
if len(TOP) < 8:  # no trade data yet (test runs only)
    TOP += ['n/a'] * (8 - len(TOP))
TOTAL = TOTAL or 1
NO_IEEPA = 'The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.'
WOOD_LINES = 'upholstered wooden seats (9401.61.40.11, 9401.61.40.31, 9401.61.60.11, 9401.61.60.31) and kitchen cabinets, vanities and their wooden parts (9403.40.90.60, 9403.60.80.93, 9403.91.00.80)'
METAL_LINES = 'boltless steel shelving (9403.20.00.75), other steel racks (9403.20.00.82), welded wire racks (9403.99.90.20), parts of steel racks (9403.99.90.40), steel modular buildings (9406.20) and other prefabricated buildings (9406.90.01)'

# ---------------------------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------------------------
ov = d['overview']
ov['seo'] = {
    'title': 'HTS Chapter 94 Furniture Tariffs: Section 232 Cabinets & Upholstered Furniture, Mattresses, Lighting | KoalaGains',
    'shortDescription': 'Searchable duty table for all 275 HTS Chapter 94 lines: seats, sofas, office, kitchen and bedroom furniture, mattresses, pillows, lamps, LED fixtures and prefabricated buildings. Base rates, the Section 232 duties on kitchen cabinets, vanities and upholstered furniture, the 2026 Section 301 duties, China Lists 3 and 4A, Section 338 on Canada, and the furniture and mattress AD/CVD orders.',
    'keywords': ['HTS Chapter 94', 'furniture tariffs', 'tariffs on furniture', 'furniture tariffs 2026', 'section 232 furniture tariffs', 'kitchen cabinet tariffs',
                 'upholstered furniture tariff', 'mattress tariffs', 'furniture import duty', 'hs code for furniture', 'hs code 9403', 'hs code 9405',
                 'home furnishings tariffs'],
}
ov['intro'] = (
    'Chapter 94 covers furniture and its parts: seats and sofas (9401), medical and barber furniture (9402), office, kitchen, bedroom and other furniture '
    '(9403), mattresses, pillows, quilts and sleeping bags (9404), luminaires, lamps, LED fixtures, lighting sets and illuminated signs (9405) and '
    f'prefabricated buildings (9406). The U.S. imported **{money(TOTAL)}** of these goods in {YEAR}, {cshare(TOP[0])} from {TOP[0]} and {cshare(TOP[1])} from {TOP[1]}. '
    'All seats and furniture of 9401 to 9403 are **Free** at base; **94 of 275** lines carry a base rate, mostly 3% to 12.8% on bedding, lamps and prefabricated buildings.\n\n'
    'So the extra duties decide the cost. Since **October 14, 2025** a **Section 232 duty of 25%** applies to upholstered wooden seats and to wooden kitchen cabinets '
    'and vanities from every country, including Canada and Mexico with a USMCA claim; it rises to **30%** and **50%** on **January 1, 2027**. The UK pays 10%, and '
    'the EU, Japan, South Korea and Taiwan 15% in all. Most other lines pay the **2026 Section 301 duty** of 10% or 12.5% from the 60 listed economies '
    '(Vietnam 12.5%, Malaysia and Indonesia 10%); **China** pays 25% under List 3 (7.5% on 17 List 4A lines) plus 12.5%; **Brazil** pays 37.5%; and **177 Canadian** lines '
    'pay **50% under Section 338**, even with a USMCA claim. Steel shelving, racks and prefabricated buildings pay a 25% Section 232 metals duty, and vehicle seats '
    'the Section 232 auto-parts duty. Wooden bedroom furniture, wooden cabinets, steel racks and shelving from China and mattresses from 19 countries also carry '
    'antidumping or countervailing duties, which are not in the totals.'
)
for s in ov['stats']:
    if s['label'].startswith('Lines with an extra duty'):
        s['note'] = ('2026 Section 301: 261 (Section 232 lines pay that instead); China Lists 3 and 4A: 245; Brazil: 261; Section 338 on Canada: 177; '
                     'Section 232 wood: 7; Section 232 metals: 10; Section 232 auto or truck parts: 1 (9401.20); Russia: aluminum 200% on 34, 35% on 24. '
                     'USMCA goods are exempt from the 2026 Section 301 duty only.')

GROUPS = {
    '9401': ('Seats, chairs, sofas & parts', 'Seats & sofas',
             'Seats of every kind: aircraft and vehicle seats, office swivel chairs, sofa beds, rattan and bamboo seats, wooden, metal and plastic chairs, sofas and '
             'parts: 88 lines, all Free. Upholstered wooden seats (9401.61.40, 9401.61.60, household and other) pay the 25% Section 232 wood duty instead of the '
             '2026 Section 301 duty; motor-vehicle seats (9401.20) pay the Section 232 auto- or truck-parts duty. Most Chinese seats pay 25% (List 3) plus 12.5%.',
             ['sofa', 'upholstered chair', 'office chair', 'recliner', 'dining chair', 'car seat', 'patio chair', 'sofa bed']),
    '9402': ('Medical, dental & barber furniture', 'Medical furniture',
             'Hospital beds with mechanical fittings, operating and examination tables, dentists\' and barbers\' chairs and parts: 3 lines, all Free. They are not on '
             'the China Section 301 lists, so Chinese goods pay only the 12.5% 2026 Section 301 duty.',
             ['hospital bed', 'examination table', 'barber chair', 'dental chair', 'massage table']),
    '9403': ('Office, kitchen, bedroom & other furniture', 'Furniture',
             'Metal, wooden, plastic, bamboo and rattan furniture and parts: desks, beds, dressers, tables, shelving, racks, wardrobes, kitchen cabinets and vanities: '
             '86 lines, all Free. Wooden kitchen cabinets and vanities (9403.40.90.60, 9403.60.80.93, parts 9403.91.00.80) pay the 25% Section 232 wood duty; '
             'steel shelving and racks pay the 25% Section 232 metals duty. Chinese wooden bedroom furniture, wooden cabinets, steel racks and boltless shelving '
             'also carry AD/CVD orders.',
             ['kitchen cabinets', 'bathroom vanity', 'dresser', 'bed frame', 'office desk', 'bookcase', 'steel shelving', 'TV stand']),
    '9404': ('Mattresses, pillows, quilts & sleeping bags', 'Mattresses & bedding',
             'Mattress supports and box springs (Free), foam, cotton and innerspring mattresses (3% or 6%), sleeping bags (4.7% or 9%), quilts and comforters '
             '(4.4% or 12.8%) and pillows and cushions (4.4% to 7.3%): 33 lines. Mattresses from China and 18 other countries carry antidumping duty orders; '
             'mattresses must meet the CPSC flammability standards.',
             ['mattress', 'memory foam mattress', 'box spring', 'pillow', 'comforter', 'sleeping bag', 'cushion']),
    '9405': ('Lamps, luminaires, LED fixtures & illuminated signs', 'Lighting',
             'Chandeliers and ceiling, wall, table, desk, floor and outdoor luminaires, lighting sets such as Christmas lights, searchlights, non-electric lamps, '
             'illuminated signs and nameplates, and glass and plastic parts: 58 lines, 2.9% to 12% (brass fittings 3.7% to 5.7%, other 3.9% to 7.6%). Illuminated '
             'signs of 9405.61 and 9405.69 that are informational materials are exempt from the 2026 Section 301 and Brazil duties.',
             ['LED light fixture', 'ceiling light', 'chandelier', 'table lamp', 'floor lamp', 'Christmas lights', 'LED sign', 'lamp shade']),
    '9406': ('Prefabricated buildings', 'Prefab buildings',
             'Prefabricated buildings of wood (2.6%), steel modular building units (2.9%) and greenhouses, sheds and other prefabricated buildings (2.9%): 7 lines. '
             'Steel modular units (9406.20) and other prefabricated buildings (9406.90.01) pay the 25% Section 232 metals duty when the metal is at least 15% '
             'of the weight.',
             ['prefab house', 'modular building', 'container house', 'greenhouse', 'shed', 'tiny house']),
}
for g in ov['productGroups']:
    label, short, blurb, ex = GROUPS[g['heading']]
    g['label'], g['blurb'], g['searchExamples'] = label, blurb, ex
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = GROUPS[g['heading']][0], GROUPS[g['heading']][1]

ov['workedExamples'] = [
    {'title': '$10,000 of upholstered wooden sofas from Vietnam', 'line': '9401.61.60.11',
     'body': 'Upholstered seats with wooden frames are **Free** at base. Since October 14, 2025 they pay the **25% Section 232 wood duty** (9903.76.02): **$2,500**. '
             'Goods under that heading do not also pay the 12.5% 2026 Section 301 duty on Vietnam (U.S. note 52(f)(4)). On **January 1, 2027** the rate rises to '
             '**30%** ($3,000). From the EU, Japan, South Korea or Taiwan the same sofa pays **15%**, and from the UK **10%**.'},
    {'title': 'Wooden kitchen cabinets from China', 'line': '9403.40.90.60',
     'body': 'Cabinets designed for permanent installation are **Free** at base. If they are completed wooden kitchen cabinets or vanities, they pay the **25% Section 232 '
             'duty** (9903.76.03) plus **25%** under Section 301 List 3 (9903.88.03): **50%**, or **75%** from January 1, 2027, when the Section 232 rate rises to 50%. '
             'They do not pay the 12.5% 2026 Section 301 duty. Wooden cabinets and vanities from China also carry **antidumping** (China-wide rate 251.64%) and '
             '**countervailing** (20.93% for all others) duties, which are not in the tariff calculator. Other goods of the line that are not wooden cabinets or vanities '
             'enter under 9903.76.04 and pay 25% + 12.5% = **37.5%**.'},
    {'title': 'A bathroom vanity from Italy, Canada or Mexico', 'line': '9403.60.80.93',
     'body': 'From **Italy** (or any EU country) a wooden vanity pays **15%** in all (9903.76.22: the duty tops the Free base rate up to 15%), and the 2027 increase does not '
             'apply. From **Mexico** it pays **25%** (9903.76.03) with or without a USMCA claim, since the Section 232 duty has no USMCA exemption. From **Canada** it '
             'also pays **50% under Section 338** (9903.03.14), which since September 15, 2026 stacks on Section 232: **75%**.'},
    {'title': '$100,000 of foam mattresses from Vietnam', 'line': '9404.21.00.13',
     'body': 'Mattresses of cellular plastics have a **3%** base rate, and the 2026 Section 301 duty on Vietnam (9903.05.84) adds **12.5%**: **$15,500**. Mattresses from Vietnam '
             'are also under an **antidumping order** (May 2021) at 144.92% for most named exporters and 668.38% for the Vietnam-wide entity: another '
             '**$144,920** or more in cash deposits. Mattresses must also meet the CPSC open-flame and cigarette-ignition standards (16 CFR 1632, 1633).'},
    {'title': 'Car seats and truck seats', 'line': '9401.20.00.00',
     'body': 'Seats of a kind used for motor vehicles are **Free** at base. A seat for a passenger car or light truck pays the **25% Section 232 auto-parts duty** '
             '(9903.94.05), or 15% in all from Japan, the EU, South Korea and Taiwan and 10% from the UK; a seat for a medium- or heavy-duty truck or bus pays 25% '
             '(9903.74.08). Both are lifted for USMCA-qualifying parts (9903.94.06, 9903.74.10), and goods paying them do not pay the 2026 Section 301 duty. A seat '
             'that is not a vehicle part pays the country\'s Section 301 rate, for example 12.5% from Vietnam.'},
    {'title': 'LED illuminated signs from China', 'line': '9405.61.60.00',
     'body': 'Illuminated signs for LED light sources have a **5.3%** base rate, plus **25%** (List 3) and **12.5%** (2026 Section 301): **42.8%**. Signs that are '
             'informational materials, as the importer must show, are exempt from the 12.5% duty under 9903.05.92 but not from List 3: **30.3%**. From Vietnam '
             'the same sign pays 5.3% + 12.5% = **17.8%**, or 5.3% as informational materials.'},
]
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '9401.99', 'label': 'Parts of seats, other than of wood'},
    {'hts': '9401.61', 'label': 'Upholstered seats with wooden frames (sofas, armchairs)'},
    {'hts': '9403.60', 'label': 'Other wooden furniture (dining, living room and other)'},
]
ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover, among others: pneumatic or water mattresses, pillows or cushions (chapters 39, 40, 63); floor-standing mirrors (7009); '
        'articles of chapter 71; parts of general use of base metal (section XV), similar goods of plastics (39) and safes (8303); furniture designed as parts of '
        'refrigerators (8418) or sewing machines (8452); lamps and light sources and their parts (chapter 85); furniture designed as parts of sound, video or TV '
        'apparatus (8518, 8522, 8529); articles of 8714; dentists\' chairs with dental appliances (9018); clocks and clock cases (91); toy furniture and toy lamps (9503), '
        'billiard tables and other game furniture (9504), conjuring furniture and decorations such as Chinese lanterns (9505); and monopods, bipods and tripods (9620).\n\n'
        '**Note 2.** Articles of 9401 to 9403 (other than parts) belong there only if designed for placing on the floor or ground, except cupboards, bookcases, other '
        'shelved and unit furniture, seats and beds, which stay there even if hung, fixed to the wall or stacked.\n\n'
        '**Note 3.** Parts of 9401 to 9403 do not include sheets or slabs of glass (including mirrors), marble, stone or other materials of chapters 68 and 69 not '
        'combined with other parts; goods of 9404 entered separately are not parts of 9401 to 9403.\n\n'
        '**Note 4.** "Prefabricated buildings" (9406) are buildings finished in the factory or put up as elements entered together, such as housing, worksite '
        'accommodation, offices, schools, shops, sheds and garages, including steel "modular building units" the size of a shipping container that are pre-fitted inside.'
    ),
    'additionalUsNotes': (
        '**1.** For subheading 9401.20.00, "seats of a kind used for motor vehicles" does not include child safety seats.\n\n'
        '**Statistical notes.** Stationary activity centers in 9401 have no castors or wheels. "Mechanically collapsible sofa bed seat deck components" (9401.99.90.30) '
        'are articulating arrays of metal torsion hinges and struts attached to a controller frame. "Plantation-harvested" wood comes from trees grown on a plantation. '
        '"Boltless or press-fit steel shelving units prepackaged for sale" (9403.20.00.75) are assembled mainly without nuts, bolts or screws, and exclude wall-mounted '
        'shelving and wire shelving. "Metal exchange lockers" (9403.20.00.78) have individual locking doors mounted on one master door. "Bed pillows" (9404.90.10.30–.60, '
        '9404.90.20.30–.60) support the head and neck while sleeping. The unit for 9406, m², is the floor area of the assembled building.'
    ),
}

# ---------------------------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['seo'] = {
    'title': 'Furniture Tariff Updates 2025–2026: Section 232 Cabinets & Upholstered Furniture, China, Vietnam, Canada (HTS Ch. 94) | KoalaGains',
    'shortDescription': 'What changed for U.S. furniture, mattress and lighting imports since January 2025: the Section 232 duties on kitchen cabinets, vanities and upholstered furniture and their 2027 increases, the IEEPA duties and their end, Section 122, the 2026 Section 301 and Brazil duties, Section 338 on Canada, and the furniture and mattress AD/CVD orders, with Federal Register citations.',
    'keywords': ['furniture tariffs 2026', 'furniture tariff news', 'section 232 furniture tariffs', 'kitchen cabinet tariff increase', 'upholstered furniture tariff',
                 'furniture tariffs canada', 'furniture tariffs from china', 'tariff on furniture from vietnam', 'mattress antidumping', 'home furnishings tariffs'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** '
    '(in force October 9, 2026). The general rates of all 269 lines that exist in both are unchanged; 6 statistical lines were added or renumbered.\n\n'
    'The extra duties changed a lot. In 2025 the IEEPA tariffs hit all of Chapter 94: 25% on non-USMCA goods of Canada (35% from August 1) and Mexico, a reciprocal '
    'tariff on every other country (raised to country rates on August 7), up to 125% more on China, and 40% on Brazil. Metal furniture, seats and parts also paid the '
    'Section 232 steel and aluminum derivative duties on their metal content. On **October 14, 2025** the **Section 232 wood** duties took effect: **25% on upholstered '
    'wooden seats and on kitchen cabinets and vanities**, replacing the reciprocal tariff on those goods. All IEEPA duties **ended on February 24, 2026**; the 10% '
    'Section 122 surcharge that replaced them expired on **July 23, 2026**.\n\n'
    'Today the measures are: the **Section 232 wood** duties (rising to 30% and 50% on January 1, 2027), the **2026 Section 301 duties** on 60 economies (from July 24, 2026), '
    '**Brazil\'s 25% Section 301 duty** (from July 22, 2026), **Section 338 at 50%** on 177 Canadian lines (79 from August 22, 98 more from September 15, 2026), China\'s '
    'Section 301 **Lists 3 and 4A**, a narrower **Section 232 metals** list (since April 6, 2026), the **Section 232 auto- and truck-parts** duties on vehicle seats, '
    'and Russia\'s rates. Antidumping and countervailing duties on **wooden bedroom furniture**, **wooden cabinets and vanities**, **steel racks**, **boltless steel shelving** '
    'and **mattresses** are listed below for reference and are **not included in the tariff calculator**.'
)
tu['scope'] = ('Chapter 99 measures that reach Chapter 94 from any country (Section 232 wood, metals, auto parts and truck parts; 2026 Section 301 on 60 economies; Brazil '
               'Section 301; Section 338 on Canada; China Section 301 Lists 3 and 4A and their exclusions; Russia; the ended IEEPA and Section 122 duties), and the '
               'antidumping and countervailing duty orders on Chapter 94 goods, which the tariff calculator does not model. For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '269 of 275 lines', 'note': '6 statistical lines new or renumbered, none with a changed rate'},
    {'label': 'Extra-duty programs in effect', 'value': '8', 'note': 'Section 232 wood, metals, auto and truck parts; 2026 Section 301; Brazil 301; Canada 338; China Lists 3/4A; Russia'},
    {'label': 'Section 232 on cabinets and vanities', 'value': '25%', 'note': '50% from January 1, 2027 (UK 10%; EU, Japan, Korea, Taiwan 15%)'},
    {'label': 'Section 232 on upholstered wooden seats', 'value': '25%', 'note': '30% from January 1, 2027 (UK 10%; EU, Japan, Korea, Taiwan 15%)'},
]

S301 = ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now']
EXC_232 = ('Goods paying a Section 232 duty do not also pay it: upholstered wooden seats, wooden kitchen cabinets and vanities (note 52(f)(4)), the Section 232 metals lines '
           '(note 52(f)(1)) and vehicle seats that are car or truck parts (note 52(f)(3), (6)).')
EXC_INFO = 'Illuminated signs of 9405.61 and 9405.69 that are informational materials are exempt (9903.05.92), and aircraft seats and parts of the note 52(d) list for civil aircraft (9903.05.88).'
tu['inEffect'] = [
    {'id': 'all-section-232-wood', 'country': 'All countries (including Canada and Mexico)', 'measure': 'Section 232 (timber, lumber and wood products)', 'ch99Code': '9903.76.02 / 9903.76.03',
     'before': 'None', 'now': '+25% on upholstered wooden seats, kitchen cabinets and vanities',
     'exemption': f'Applies to the lines in U.S. note 37(d) and (f): {WOOD_LINES}. Goods of the 37(f) lines that are not completed wooden kitchen cabinets or vanities or their wooden parts enter under 9903.76.04 with no duty. There is no USMCA or FTA exemption: note 37 collects the duty on top of any special rate. Products of the UK (9903.76.20, 10%), the EU (9903.76.22) and Japan (9903.76.21), South Korea (9903.76.23, from November 14, 2025) and Taiwan (9903.76.24, from May 1, 2026) pay 15% including the base rate instead. Goods under these headings do not pay the 2026 Section 301 or Brazil duties (notes 52(f)(4), 50(a)(vi)), but China\'s List 3 duty, Canada\'s Section 338 duty (since September 15, 2026) and AD/CVD still apply. On January 1, 2027 the rate rises to 30% (upholstered) and 50% (cabinets and vanities), except for the deal partners (Proclamation 11000).',
     'whatItMeans': 'A sofa, armchair, kitchen cabinet or vanity pays a quarter of its value from Vietnam, China, Mexico, Canada, Malaysia and most other suppliers, and 15% from Italy or Germany. Budget for 30% and 50% from January 2027.',
     'effectiveFrom': '2025-10-14', 'effectiveSourceId': 'procl-10976', 'sourceIds': ['procl-10976', 'procl-11000', 'hts-chapter-99', 'hts-now']},
    {'id': 'deal-section-232-wood', 'country': 'United Kingdom, EU, Japan, South Korea, Taiwan', 'measure': 'Section 232 (wood products, deal rates)', 'ch99Code': '9903.76.20–9903.76.24',
     'before': 'None', 'now': 'UK +10%; EU, Japan, South Korea, Taiwan 15% in all',
     'exemption': 'Proclamation 10976 clause 7 caps the UK at 10% and the EU and Japan at 15% including the column 1 rate; South Korea moved from 25% to 15% on November 14, 2025 (90 FR 55964) and Taiwan on May 1, 2026 (91 FR 31818). For the EU, Japan, Korea and Taiwan the duty is collected in place of any special rate (for Korea, except KORUS goods). The January 1, 2027 increases do not apply to them.',
     'whatItMeans': 'An Italian sofa or German kitchen cabinet pays 15% in all, since the base rate is Free; a British one pays 10%.',
     'effectiveFrom': '2026-05-01', 'effectiveSourceId': 'fr-2026-10571', 'sourceIds': ['procl-10976', 'fr-2025-21940', 'fr-2026-10571', 'hts-chapter-99', 'hts-now']},
    {'id': 'all-section-232-metals', 'country': 'All countries (including Canada and Mexico)', 'measure': 'Section 232 (steel, aluminum, copper)', 'ch99Code': '9903.82.09',
     'before': 'Metal-content duty on metal furniture (2025)', 'now': '+25% of full value on 6 provisions',
     'exemption': f'Since April 6, 2026 (Proclamation 11021) the duty is charged on the full value, but only for goods on the U.S. note 16(c) lists; in Chapter 94 these are {METAL_LINES}; the steel rack lines were added June 8, 2026 (Proclamation 11032). Not charged when the listed metal is under 15% of the weight (9903.82.03) or absent (9903.82.01). UK goods with at least 95% UK-melted metal pay 15% (9903.82.05); goods with at least 85% U.S.-melted metal pay 10% (9903.82.06). No USMCA exemption (note 16(b)). Goods under these headings do not pay the 2026 Section 301 duty. Metal chairs, metal furniture of 9403.10 and most metal parts are no longer listed.',
     'whatItMeans': 'Steel shelving, racks and steel prefabricated buildings pay 25% plus their base rate (2.9% on 9406); most other metal furniture now pays only the country\'s Section 301 rate.',
     'effectiveFrom': '2026-06-08', 'effectiveSourceId': 'procl-11032', 'sourceIds': ['procl-11021', 'fr-2026-08297', 'procl-11032', 'hts-chapter-99', 'hts-now']},
    {'id': 'all-section-232-autos', 'country': 'All countries (USMCA-qualifying parts exempt)', 'measure': 'Section 232 (automobile parts; medium- and heavy-duty vehicle parts)', 'ch99Code': '9903.94.05 / 9903.74.08',
     'before': 'None', 'now': '+25% on vehicle seats (9401.20)',
     'exemption': 'Subheading 9401.20 is on the auto-parts list (U.S. note 33(g)) and the truck-parts list (note 38(i)). A seat for a passenger car or light truck pays 25% (9903.94.05) from May 3, 2025; the UK pays 10% in place of the base rate (9903.94.32), and Japan, the EU, South Korea and Taiwan 15% in all. A seat for a medium- or heavy-duty truck or bus pays 25% (9903.74.08) from November 1, 2025. USMCA-qualifying parts are exempt (9903.94.06, 9903.74.10). Child safety seats are not 9401.20 (Chapter 94 additional U.S. note 1). Goods paying these duties do not pay the 2026 Section 301 or Brazil duties.',
     'whatItMeans': 'Imported car and truck seats pay 25% unless they qualify for USMCA; seats that are not vehicle parts pay the country\'s Section 301 rate.',
     'effectiveFrom': '2025-11-01', 'effectiveSourceId': 'procl-10984', 'sourceIds': ['procl-10908', 'procl-10925', 'csms-64916652', 'procl-10984', 'csms-66665333', 'hts-chapter-99', 'hts-now']},
    {'id': 'ca-section-338', 'country': 'Canada', 'measure': 'Section 338 (Proclamation 11048)', 'ch99Code': '9903.03.14',
     'before': 'None', 'now': '+50% on 177 lines',
     'exemption': 'The U.S. note 51(b)(3) list covers 79 Chapter 94 lines from August 22, 2026 (including swivel seats 9401.39, other wooden seats 9401.69.60, metal seats 9401.71 and 9401.79, metal furniture 9403.20, other bedroom and wooden furniture 9403.50.90 and 9403.60.80, plastic furniture 9403.70.80, furniture parts 9403.99 and some luminaires 9405.11 and 9405.42) and 98 more from September 15, 2026 (Proclamation 11065: convertible seats, bamboo and rattan seats, teak upholstered chairs 9401.61.20, other wooden seats 9401.69, other seats 9401.80, office and kitchen wooden furniture, mattress supports and mattresses 9404.10 to 9404.29, and lamps 9405.21 and 9405.29). Note 51(a) applies it even when USMCA is claimed, and since September 15, 2026 on top of any Section 232 duty. Civil aircraft articles are relieved (9903.03.16). Proclamation 11056 moved the start from August 19 to August 22, 2026.',
     'whatItMeans': 'Canadian dressers, metal furniture, mattresses and the other listed lines pay half their value in duty with a USMCA claim; a Canadian vanity pays 75% (25% Section 232 plus 50%).',
     'effectiveFrom': '2026-09-15', 'effectiveSourceId': 'procl-11065',
     'sourceIds': ['procl-11048', 'procl-11056', 'csms-69606660', 'procl-11065', 'csms-69851916', 'hts-chapter-99', 'hts-now']},
    {'id': 'ca-section-301', 'country': 'Canada', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.29', 'before': 'None', 'now': '+10% (USMCA goods exempt)',
     'exemption': 'Goods entered free under USMCA are exempt under U.S. note 52(g) (9903.05.93). ' + EXC_232 + ' ' + NO_IEEPA,
     'whatItMeans': 'Canadian furniture not on the Section 338 list pays nothing extra with a USMCA claim and 10% without one.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'mx-section-301', 'country': 'Mexico', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.55', 'before': 'None', 'now': '+10% (USMCA goods exempt)',
     'exemption': 'Goods entered free under USMCA are exempt under U.S. note 52(h) (9903.05.94). ' + EXC_232 + ' ' + NO_IEEPA,
     'whatItMeans': 'Mexican seats, furniture, mattresses and lamps are Free of extra duty with a USMCA claim and pay 10% plus the base rate without one; Mexican upholstered sofas, cabinets and vanities pay the 25% Section 232 duty either way.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'cn-list-3', 'country': 'China', 'measure': 'Section 301 tariff, Lists 3 and 4A (2018–2020)', 'ch99Code': '9903.88.03 / 9903.88.04 / 9903.88.15', 'before': '+25% / +7.5%', 'now': '+25% / +7.5%',
     'exemption': 'List 3 (U.S. note 20(f), 9903.88.03) covers 191 Chapter 94 lines and the described seats and plastic furniture of note 20(g) (9903.88.04) 37 more, at 25%; List 4A (note 20(r)–(s), 9903.88.15) covers 17 lines at 7.5%, mainly aircraft seats, some wooden and upholstered metal-frame seats, seat parts and cotton bed pillows. Medical furniture (9402), sleeping bags, quilts and cushions are on neither list. Nine described products are excluded until November 9, 2026 (note 20(vvv), 9903.88.69): certain upholstered wooden sofas of 9401.61.60.11, unassembled upholstered metal-frame chairs, steel or aluminum hunting stands, unfinished plywood chair parts, crib liners, child safety seat parts and down-filled cotton pillow shells. The lists apply on top of the Section 232 duties. USTR confirmed on October 7, 2026 that the actions continue during the four-year review.',
     'whatItMeans': 'Chinese furniture and lamps pay 25% on top of the base rate and the 12.5% 2026 Section 301 duty; Chinese sofas, cabinets and vanities pay 25% plus the 25% Section 232 duty.',
     'effectiveFrom': '2019-05-10', 'effectiveSourceId': 'fr-2019-09681',
     'sourceIds': ['fr-2018-20610', 'fr-2019-09681', 'fr-2019-17865', 'fr-2020-00904', 'fr-2026-20510', 'hts-chapter-99', 'hts-now']},
    {'id': 'cn-section-301', 'country': 'China', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.31', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_232 + ' ' + EXC_INFO + ' Note 52(a) keeps the List 3 and 4A duties on top. The IEEPA duties on China ended February 24, 2026.',
     'whatItMeans': 'With List 3, most Chinese furniture pays 37.5% (Free base) and Chinese lamps 41% to 45%. Wooden bedroom furniture, wooden cabinets, steel racks, boltless shelving and mattresses from China also carry AD/CVD orders.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'vn-section-301', 'country': 'Vietnam', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.84', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_232 + ' ' + EXC_INFO + ' ' + NO_IEEPA,
     'whatItMeans': 'Vietnamese wooden bedroom, dining and office furniture and metal and plastic chairs pay 12.5%; upholstered sofas, cabinets and vanities pay the 25% Section 232 duty instead. Mattresses from Vietnam also carry an antidumping order.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'my-id-th-in-section-301', 'country': 'Malaysia, Indonesia, Thailand, India, Cambodia', 'measure': 'Section 301 (2026, 60 economies)',
     'ch99Code': '9903.05.54 / 9903.05.45 / 9903.05.77 / 9903.05.44 / 9903.05.28', 'before': 'None', 'now': 'Malaysia, Indonesia, India, Cambodia +10%; Thailand +12.5%',
     'exemption': EXC_232 + ' ' + EXC_INFO + ' No Chapter 94 line is on these countries\' note 52(j) lists. ' + NO_IEEPA,
     'whatItMeans': 'Furniture from these countries pays 10% or 12.5% plus the base rate; their sofas, cabinets and vanities pay 25% under Section 232. Mattresses from Malaysia, Thailand, Cambodia and India and boltless shelving from Malaysia and Thailand also carry AD orders.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'eu-tw-section-301', 'country': 'European Union (e.g. Italy, Germany, Poland), Taiwan', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.39 / 9903.05.76',
     'before': 'None', 'now': '10% (in place of base rates under 10%)',
     'exemption': EXC_232 + ' ' + EXC_INFO + ' No Chapter 94 line is on the EU list in note 52(j)(2). ' + NO_IEEPA,
     'whatItMeans': 'European and Taiwanese furniture, mattresses and most lamps pay 10% in all; glass lamp globes and shades at 12% keep their base rate; sofas, cabinets and vanities pay 15% under Section 232.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'gb-jp-kr-section-301', 'country': 'United Kingdom, Japan, South Korea', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.81 / 9903.05.49 / 9903.05.71', 'before': 'None',
     'now': 'UK +10%; Japan and South Korea 12.5% (in place of base rates under 12.5%)',
     'exemption': EXC_232 + ' ' + NO_IEEPA,
     'whatItMeans': 'British furniture pays 10% plus the base rate; Japanese and Korean furniture and lamps pay 12.5% in all.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'br-section-301-brazil', 'country': 'Brazil', 'measure': 'Section 301 (Brazil) + Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.01 / 9903.05.27', 'before': 'None', 'now': '+25% + 12.5%',
     'exemption': 'No Chapter 94 line is on the Brazil exemption list in U.S. note 50(a)(ii). Goods under the Section 232 headings are exempt from both duties (notes 50(a)(vi), 52(f)); informational materials (9903.05.09) and civil aircraft articles (9903.05.05) are also exempt. ' + NO_IEEPA,
     'whatItMeans': 'Brazilian furniture, mattresses and lamps pay 37.5% plus the base rate; Brazilian sofas, cabinets and vanities pay only the 25% Section 232 duty.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': ['fr-2026-14542'] + S301},
    {'id': 'ru-section-301', 'country': 'Russia', 'measure': 'Russia (column 2 and 35% rates) + Section 232 aluminum (200%) + Section 301 (2026)', 'ch99Code': '9903.90.08 / 9903.85.68 / 9903.05.66',
     'before': 'Column 2 rates; 35% on 24 lines; 200% on aluminum derivatives', 'now': 'Column 2 rates (35% on 24 lines) + 12.5%; +200% on 34 aluminum-derivative lines',
     'exemption': 'Russian goods pay the column 2 rates (general note 3(b)); 24 Chapter 94 lines in U.S. note 30(b) pay 35% in their place (9903.90.08). Aluminum derivatives of Russia on the note 19 lists (metal furniture 9403.10 and 9403.20, aluminum furniture parts and lamp parts from March 12, 2025; metal seats 9401.79 and seat parts from August 18, 2025) pay 200% (9903.85.68). ' + EXC_232,
     'whatItMeans': 'Russian furniture is effectively priced out: column 2 rates of 25% to 65% on most furniture, plus 12.5%, and 200% on aluminum furniture.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181',
     'sourceIds': ['fr-2026-15181', 'fr-2026-15274', 'procl-10420', 'procl-10523', 'procl-10522', 'procl-10895', 'fr-2025-15819', 'hts-chapter-99', 'hts-now']},
    {'id': 'other-section-301', 'country': 'Other 2026 Section 301 economies (e.g. Philippines, Turkey, Bangladesh, Pakistan)', 'measure': 'Section 301 (2026, 60 economies)',
     'ch99Code': '9903.05.20–9903.05.83', 'before': 'None', 'now': '+10% or +12.5% (Switzerland 12.5% in place of lower base rates)',
     'exemption': EXC_232 + ' Jordan\'s note 52(j) list (9903.06.20), and Guatemala\'s and El Salvador\'s for CAFTA-DR claims (9903.06.06, 9903.06.09), exempt sleeping bags, quilts, pillows and cushions (9404.30, 9404.40, 9404.90). Countries outside the 60 economies pay no Section 301 duty; Nicaragua\'s separate Section 301 duty (9903.89.01) starts at 10% on January 1, 2027. ' + NO_IEEPA,
     'whatItMeans': 'Most Chapter 94 goods from these economies pay 10% or 12.5% plus the base rate; sofas, cabinets and vanities pay the Section 232 duty instead.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
]

C = []


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    C.append({'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
              'countries': countries, 'sourceIds': sids})


ch('base-rates', 'baseRate', TODAY, 'Checked', 'Chapter 94 base rates: no changes',
   'All 269 Chapter 94 tariff lines that are in both editions carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. '
   'Six statistical lines are new or renumbered in the current edition, with the rates of their parent subheadings.',
   None, None, None, ['hts-before', 'hts-now', 'hts-now-cr'])
ch('wood-232-2027', 'pending', '2025-12-31', 'Signed', 'Section 232: cabinets and vanities to 50%, upholstered seats to 30%',
   'Proclamation 11000 (December 31, 2025) postponed by one year the increases first set for January 1, 2026. Under Proclamation 10976 clause 5, as amended, the Section 232 duty on kitchen cabinets, vanities and their parts (9903.76.03) rises from 25% to 50%, '
   'and on upholstered wooden seats (9903.76.02) from 25% to 30%, on January 1, 2027, except for countries with a wood-products agreement. The UK (10%) and the EU, '
   'Japan, South Korea and Taiwan (15% all-in) keep their rates.',
   '+25%', '+30% / +50%', 'All except UK, EU, Japan, South Korea, Taiwan', ['procl-10976', 'procl-11000', 'hts-chapter-99'])
ch('nicaragua-2027', 'pending', '2025-12-12', 'Announced', 'Section 301 tariff on Nicaragua phases in from 2027',
   'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every '
   'Chapter 94 line. The rate is 0% in 2026.',
   None, '+10% to +15%', 'Nicaragua', ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99', 'hts-now'])
ch('cn-exclusions-end', 'pending', '2025-12-01', 'Published', 'China Section 301: nine Chapter 94 exclusions expire November 9, 2026',
   'The product exclusions of U.S. note 20(vvv) (9903.88.69), extended through November 9, 2026, cover nine described Chapter 94 products: certain upholstered wooden '
   'sofas, unassembled upholstered metal-frame chairs, hunting stands, unfinished plywood chair parts, crib liners, child safety seat parts and down-filled cotton pillow '
   'shells. Unless USTR extends them, these goods pay the List 3 or 4A duty again from November 10, 2026.',
   'Excluded', '+25% / +7.5% unless extended', 'China', ['fr-2025-21671', 'hts-chapter-99'])
ch('bss-itc-sunset', 'reference', '2026-09-29', 'Published', 'Boltless steel shelving from China: ITC votes to continue the orders',
   'In the second five-year reviews the ITC found that revoking the 2015 antidumping and countervailing duty orders on boltless steel shelving units prepackaged for sale '
   'from China (9403.20.00.75) would likely lead to continued injury, after Commerce found dumping and subsidies likely to recur (July 31 and August 4, 2026). The '
   'orders stay in force. The 2024 antidumping orders on Malaysia (58.29% all others), Taiwan (7.03%), Thailand (2.75%) and Vietnam (224.94% Vietnam-wide) also apply.',
   None, None, 'China, Malaysia, Taiwan, Thailand, Vietnam', ['fr-2026-19852', 'fr-2026-15470', 'fr-2026-15742', 'fr-2024-12566'])
ch('section-338-canada-2026-09-15', 'extraDuty', '2026-09-15', 'Effective', 'Section 338: 98 more Canadian furniture, mattress and lamp lines; now stacks on Section 232',
   'Proclamation 11065 added 98 Chapter 94 lines to the note 51(b)(3) list (9903.03.14), including convertible, bamboo, rattan and wooden seats, office and kitchen wooden '
   'furniture, mattress supports and mattresses (9404.10 to 9404.29) and lamps (9405.21, 9405.29), at 50% even with a USMCA claim. From the same date the 50% applies in '
   'addition to any Section 232 duty, so a Canadian vanity of 9403.60.80.93 pays 75%.',
   '+50% on 79 lines', '+50% on 177 lines', 'Canada', ['procl-11065', 'csms-69851916', 'hts-chapter-99', 'hts-now'])
ch('steel-racks-ar', 'reference', '2026-09-15', 'Published', 'Steel racks from China: 2023–2024 review results',
   'Commerce completed the antidumping review of certain steel racks and parts from China (9403.20.00.82, 9403.99.90.40). Companies without a separate rate pay the '
   'China-wide rate of 144.50%. The AD and CVD orders date from 2019 and were continued on March 11, 2025.',
   None, 'China-wide AD 144.50%', 'China', ['fr-2026-18791', 'fr-2019-19949', 'fr-2025-03860'])
ch('section-338-canada-2026-08-22', 'extraDuty', '2026-08-22', 'Effective', 'Section 338: 50% on 79 Canadian furniture and lighting lines',
   'Proclamation 11048 (July 20, 2026) imposed a 50% duty on products of Canada in the U.S. note 51(b)(3) list (9903.03.14), including 79 Chapter 94 lines: swivel seats, metal '
   'and other seats, metal furniture (9403.20), bedroom and other wooden furniture (9403.50.90, 9403.60.80), plastic furniture, furniture parts and some luminaires. It applies '
   'even when USMCA is claimed. Proclamation 11056 moved the start from August 19 to August 22, 2026. Until September 14, goods subject to Section 232 were exempt.',
   'None', '+50%', 'Canada', ['procl-11048', 'procl-11056', 'csms-69606660', 'hts-chapter-99'])
ch('wbf-ar-2024', 'reference', '2026-08-12', 'Published', 'Wooden bedroom furniture from China: 2024 review results',
   'Commerce completed the 2024 review of the antidumping order on wooden bedroom furniture from China (A-570-890, in force since January 2005, continued in September 2022). '
   'Eleven companies were found part of the China-wide entity, whose rate is 216.01%. The scope covers wooden beds, headboards, nightstands, dressers, chests, armoires, '
   'mirrors and similar bedroom furniture, mainly 9403.50.90.',
   None, 'China-wide AD 216.01%', 'China', ['fr-2026-16446', 'fr-2022-19855'])
ch('mattress-sunset-2026', 'reference', '2026-08-11', 'Published', 'Mattresses: sunset reviews of the 2021 orders under way',
   'Commerce found that revoking the 2021 antidumping orders on mattresses from Cambodia, Malaysia, Serbia, Thailand, Turkey and Vietnam and the countervailing duty order on '
   'China (97.78% all others) would likely lead to dumping and subsidies, and the ITC scheduled expedited reviews. The orders stay in force while the ITC decides. Malaysia\'s '
   '2024–2025 review kept the 42.92% all-others rate. Commerce opened circumvention inquiries on mattresses from Mexico and Malaysia in February 2026; the Poland inquiry was ended.',
   None, None, 'Cambodia, China, Malaysia, Serbia, Thailand, Turkey, Vietnam', ['fr-2026-15471', 'fr-2026-15034', 'fr-2026-16301', 'fr-2026-16361', 'fr-2026-02636', 'fr-2026-02635', 'fr-2026-12810'])
ch('section-301-2026-60-economies-2026-07-24', 'extraDuty', '2026-07-24', 'Effective', '2026 Section 301 duties on 60 economies',
   'The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect, on 261 of 275 Chapter 94 lines: goods paying a Section 232 wood, metals or '
   'vehicle-parts duty are exempt (U.S. note 52(f)). For the EU and Taiwan the duty brings lower base rates up to 10%, for Japan, South Korea and Switzerland to 12.5%. '
   'Canadian and Mexican goods entered under USMCA are exempt (notes 52(g)–(h)); informational-material signs and civil aircraft seats are exempt on the importer\'s claim.',
   None, '+10% to +12.5%', '60 economies', ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99'])
ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
   'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.',
   '+10%', 'None', 'All', ['procl-11012', 'hts-chapter-99'])
ch('section-301-brazil-2026-07-22', 'extraDuty', '2026-07-22', 'Effective', 'Brazil Section 301: 25% on Brazilian furniture',
   'The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. No Chapter 94 line is on its exemption list (U.S. note 50(a)(ii)); goods under the Section 232 '
   'headings are exempt (note 50(a)(vi)). It stacks with the 12.5% 2026 Section 301 duty on Brazil.',
   'None', '+25%', 'Brazil', ['fr-2026-14542', 'hts-chapter-99'])
ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
   'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, '
   'so USMCA claims (SPI S) still apply.',
   None, None, 'Canada, Mexico', ['ustr-usmca-review'])
ch('section-232-metals-2026-06-08', 'extraDuty', '2026-06-08', 'Effective', 'Section 232 metals: steel racks added',
   'Proclamation 11032 added steel racks (9403.20.00.75 boltless shelving, 9403.20.00.82 other steel racks) and parts of steel racks (9403.99.90.40) to the derivative steel '
   'list, at 25% of full value (9903.82.09; 15% for qualifying UK goods, 10% with at least 85% U.S.-melted metal).',
   'None', '+25%', 'All', ['procl-11032', 'hts-chapter-99'])
ch('section-232-timber-lumber-wood-products-2026-05-01', 'extraDuty', '2026-05-01', 'Effective', 'Section 232 wood: Taiwan rate cut to 15%',
   'Under the U.S.–Taiwan agreement, Taiwanese upholstered wooden seats, kitchen cabinets and vanities pay 15% including the base rate (9903.76.24) instead of 25%. Taiwanese '
   'vehicle seats that are car parts pay 15% in all (9903.94.67).',
   '+25%', '15% in all', 'Taiwan', ['fr-2026-10571', 'hts-chapter-99'])
ch('section-232-metals-2026-04-06', 'extraDuty', '2026-04-06', 'Effective', 'Section 232 metals: full-value duties on a shorter list',
   'Proclamation 11021 replaced the metal-content duties with duties on the full customs value, for the goods on new U.S. note 16(c) lists. In Chapter 94 only welded wire racks '
   '(9403.99.90.20), steel modular buildings (9406.20) and other prefabricated buildings (9406.90.01) stayed listed, at 25% (9903.82.09), when the listed metal is at least '
   '15% of the weight. Metal seats and furniture of 9401.71, 9401.79, 9403.10 and 9403.20 and most metal furniture parts, which had paid 50% on their metal content, '
   'dropped off.',
   '+50% on metal content', '+25% of full value on listed goods', 'All', ['procl-11021', 'fr-2026-08297', 'hts-chapter-99'])
ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
   'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Goods subject to Section 232, including upholstered wooden seats, cabinets and '
   'vanities, were exempt (9903.03.06), as were Canadian and Mexican goods entered under USMCA (9903.03.07, 9903.03.08).',
   'Varied by country', '+10% (ended)', 'All', ['procl-11012', 'hts-chapter-99'])
ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
   'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, '
   'Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.',
   'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'])
ch('section-232-timber-lumber-wood-products-2025-11-14', 'extraDuty', '2025-11-14', 'Effective', 'Section 232 wood: South Korea rate cut to 15%',
   'Under the U.S.–Korea deal, Korean upholstered wooden seats, kitchen cabinets and vanities pay 15% including the base rate (9903.76.23) instead of 25%.',
   '+25%', '15% in all', 'South Korea', ['fr-2025-21940', 'hts-chapter-99'])
ch('section-232-mhdv-parts-2025-11-01', 'extraDuty', '2025-11-01', 'Effective', 'Section 232: 25% on truck and bus seats',
   'Proclamation 10984 imposed 25% on parts of medium- and heavy-duty vehicles (9903.74.08), including seats of 9401.20 for trucks and buses; USMCA-qualifying parts are '
   'exempt (9903.74.10).',
   'None', '+25%', 'All', ['procl-10984', 'csms-66665333', 'hts-chapter-99'])
ch('section-232-timber-lumber-wood-products-2025-10-14', 'extraDuty', '2025-10-14', 'Effective', 'Section 232: 25% on upholstered wooden seats, kitchen cabinets and vanities',
   'Proclamation 10976 (September 29, 2025) imposed 25% on upholstered wooden seats (9903.76.02) and on kitchen cabinets, vanities and their parts (9903.76.03) from every '
   'country, with no USMCA exemption, plus 10% on softwood lumber (Chapter 44). The UK is capped at 10% and the EU and Japan at 15% including the base rate. Goods under '
   'these headings stopped paying the reciprocal and Brazil IEEPA duties (clause 4). Drawback is available (clause 14).',
   'None', '+25%', 'All', ['procl-10976', 'hts-chapter-99'])
ch('wood-cabinets-continued', 'reference', '2025-09-17', 'Published', 'Wooden cabinets and vanities from China: AD/CVD orders continued',
   'After the first sunset reviews (ITC vote of September 2025), Commerce continued the 2020 antidumping and countervailing duty orders on wooden cabinets and vanities and '
   'components from China (today mainly 9403.40.90.60, 9403.60.80 and wooden parts of 9403.91.00.80). The China-wide antidumping rate is 251.64%; the 2023 CVD review and 2024 AD review '
   'set company rates in 2026.',
   None, None, 'China', ['fr-2025-17986', 'fr-2025-17301', 'fr-2020-08544', 'fr-2020-08546', 'fr-2026-07866', 'fr-2026-04943'])
ch('section-232-autos-jp-eu', 'extraDuty', '2025-09-16', 'Effective', 'Section 232 auto parts: 15% for Japan and the EU',
   'Vehicle seats that are car parts from Japan (from September 16, 2025, 9903.94.43) and the EU (from August 1, 2025, 9903.94.53) pay 15% including the base rate instead of 25%.',
   '+25%', '15% in all', 'Japan, EU', ['fr-2025-17908', 'fr-2025-18660', 'hts-chapter-99'])
ch('metals-inclusions', 'extraDuty', '2025-08-18', 'Effective', 'Section 232: more metal seats and parts added to the derivative lists',
   'Commerce\'s first inclusions round added other metal seats (9401.79) and sofa-bed and seat parts of 9401.99.90 to the aluminum and steel derivative lists, at 50% of '
   'the metal content. Most of these Chapter 94 lines dropped off on April 6, 2026, but the 200% duty on Russian aluminum derivatives still applies to them.',
   'None', '+50% on metal content (ended April 6, 2026)', 'All', ['fr-2025-15819', 'hts-2025r22-ch99'])
ch('reciprocal-country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country-specific reciprocal rates take effect',
   'Executive Order 14326 replaced the 10% baseline with country-specific reciprocal rates for many partners (for example 15% all-inclusive for the EU and Japan). '
   'All Chapter 94 goods paid them; no Chapter 94 line was in the Annex II exemptions. Ended February 24, 2026.',
   '+10%', 'Country rates (ended)', 'All except Canada, Mexico', ['eo-14326', 'hts-2025r22-ch99'])
ch('brazil-ieepa-40', 'extraDuty', '2025-08-06', 'Effective', 'Brazil: 40% IEEPA duty',
   'Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77), including furniture. From October 14, 2025 goods under the Section 232 wood headings were exempt. '
   'Ended February 24, 2026.',
   'None', '+40% (ended)', 'Brazil', ['eo-14323', 'hts-2025r22-ch99'])
ch('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
   'Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Most Canadian furniture entered under USMCA and did not pay it. Ended February 24, 2026.',
   '+25%', '+35% (ended)', 'Canada', ['eo-14325'])
ch('metals-50', 'extraDuty', '2025-06-04', 'Effective', 'Section 232 steel and aluminum derivatives raised to 50%',
   'Proclamation 10947 raised the steel and aluminum duties, including the derivative duties on the metal content of metal furniture, seats and parts (9401.71, 9401.79, '
   '9403.10, 9403.20, 9403.99) and lamp parts (9405.99), from 25% to 50% (UK 25%). Replaced on April 6, 2026.',
   '+25% on metal content', '+50% on metal content (replaced)', 'All except UK', ['procl-10947', 'hts-2025r22-ch99'])
ch('section-232-auto-parts-2025-05-03', 'extraDuty', '2025-05-03', 'Effective', 'Section 232: 25% on car and light-truck seats',
   'Proclamation 10908 imposed 25% on automobile parts (9903.94.05), including seats of 9401.20 for passenger vehicles and light trucks. USMCA-qualifying parts are exempt (9903.94.06). '
   'The UK pays 10% in place of the base rate from June 30, 2025 (9903.94.32).',
   'None', '+25%', 'All', ['procl-10908', 'procl-10925', 'csms-64916652', 'fr-2025-12060', 'hts-chapter-99'])
ch('cn-ieepa', 'extraDuty', '2025-05-14', 'Effective', 'China IEEPA duties: reciprocal rate cut to 10%',
   'Chinese furniture paid IEEPA duties on top of Section 301: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November 10, 2025) and a '
   'reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. All ended February 24, 2026.',
   '+125% reciprocal', '+10% reciprocal (ended)', 'China', ['eo-14195', 'eo-14228', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14357'])
ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on all Chapter 94 goods',
   '10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025, with no Chapter 94 line in Annex II. Ended February 24, 2026.',
   'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257', 'hts-2025r22-ch99'])
ch('aluminum-derivatives-2025', 'extraDuty', '2025-03-12', 'Effective', 'Section 232 aluminum and steel derivatives reach metal furniture',
   'The 25% Section 232 duties on aluminum and steel derivatives, charged on the metal content, covered metal furniture (9403.10, 9403.20), aluminum furniture parts '
   '(9403.99) and lamp parts (9405.99). Russian aluminum derivatives pay 200%.',
   'None', '+25% on metal content', 'All', ['procl-10895', 'procl-10522', 'hts-2025r22-ch99'])
ch('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
   'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA furniture kept paying. Ended February 24, 2026.',
   '+25%', '+25%, USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232'])
ch('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
   '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including furniture, mattresses and lamps. Ended February 24, 2026.',
   'None', '+25% (ended)', 'Canada, Mexico', ['eo-14193', 'eo-14194'])
ch('mattress-orders-2024', 'reference', '2024-09-10', 'Published', 'Mattresses: AD orders on 12 more countries',
   'Commerce issued antidumping orders on mattresses from Bosnia and Herzegovina, Bulgaria, Burma, Italy, the Philippines, Poland, Slovenia and Taiwan (July 2024; all-others '
   'rates 106.27% to 744.81%) and from India (13.35%), Kosovo (63.66%), Mexico (37.59%) and Spain (4.61%) (September 2024). The goods enter mainly under 9404.21 and 9404.29, '
   'and with sofa beds and futons under 9401.41, 9401.49 and 9401.99.',
   None, 'AD 4.61%–744.81% (all others)', '12 countries', ['fr-2024-15261', 'fr-2024-20346'])
ch('mattress-orders-2021', 'reference', '2021-05-14', 'Published', 'Mattresses: AD orders on seven countries and CVD on China',
   'Antidumping orders on mattresses from Cambodia, Indonesia, Malaysia (42.92% all others), Serbia (112.11%), Thailand, Turkey (20.03%) and Vietnam (144.92% for named '
   'exporters, 668.38% Vietnam-wide), and a countervailing duty order on China (97.78%). Court decisions later raised the Cambodia rate to 103.79% and the Thailand all-others '
   'rate to 572.56%, and revoked the Indonesia order (March 2025). The 2019 antidumping order on mattresses from China (China-wide 1,731.75%) was continued in May 2025.',
   None, None, 'Cambodia, China, Malaysia, Serbia, Thailand, Turkey, Vietnam', ['fr-2021-10238', 'fr-2021-10237', 'fr-2024-13038', 'fr-2024-00038', 'fr-2025-03529', 'fr-2019-27166', 'fr-2025-09559'])
tu['changes'] = sorted(C, key=lambda c: c['date'], reverse=True)

have = {s['id'] for s in tu['sources']}
for s in NEW_SOURCES:
    if s['id'] not in have:
        tu['sources'].append(s)
        have.add(s['id'])
# Sources the curated entries cite that the generator may not have emitted
EXTRA = {
    'fr-2025-21671': {'id': 'fr-2025-21671', 'publisher': 'Federal Register', 'citation': '90 FR 55232', 'document': 'Notice (USTR)',
                      'title': 'Notice of Product Exclusion Extensions: China\'s Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation',
                      'signed': None, 'published': '2025-12-01',
                      'url': 'https://www.federalregister.gov/documents/2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology'},
}
for sid, s in EXTRA.items():
    if sid not in have:
        tu['sources'].append(s)
        have.add(sid)
used = {sid for e in tu['inEffect'] + tu['changes'] for sid in e['sourceIds']}
missing = used - have
if missing:
    raise SystemExit(f'tariffUpdates cites unknown sources: {sorted(missing)}')

# ---------------------------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------------------------
ui['h1'] = 'HTS Chapter 94: Furniture, Mattresses, Lighting and Prefabricated Buildings — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Furniture Imports by Country: Vietnam, China, Mexico, Malaysia (HTS Ch. 94) | KoalaGains',
    'shortDescription': f'Where U.S. furniture, mattress and lighting imports come from: {money(TOTAL)} in {YEAR}, led by {TOP[0]} and {TOP[1]}. By country, by product and over time, from UN Comtrade.',
    'keywords': ['furniture imports by country', 'us furniture imports', 'furniture imports from vietnam', 'furniture imports from china', 'mattress imports',
                 'lighting imports', 'HTS Chapter 94 import statistics'],
}
LARGEST = max(ui['byLine'], key=lambda l: l['importsUsd']) if ui['byLine'] else None
for s in ui['stats']:
    if s['label'] == 'Largest product' and LARGEST:
        s['note'] = 'Parts of seats other than of wood (9401.99)'


def hs6(code):
    l = BYL.get(code)
    return money(l['importsUsd']) if l else 'n/a'


def hs6chg(code):
    l = BYL.get(code)
    return chg(l['importsUsd'], l['priorImportsUsd']) if l else 'n/a'


HC = {}
for r in ui['byHeadingCountry']:
    HC[(NAME.get(r['country'], r['country']), r['heading'])] = r['importsUsd']


def hc(country, heading):
    return money(HC.get((country, heading), 0))


def heading_share(h):
    return money(BYH.get(h, 0))


ui['why'] = (
    f'U.S. imports of Chapter 94 goods were **{money(TOTAL)} in {YEAR}**, {chg(TOTAL, TOTAL_PRIOR)} from {money(TOTAL_PRIOR)} in {PRIOR} and well below the '
    f'2022 peak of about $86.7B. **Vietnam** became the largest supplier: {cimp("Vietnam")} ({cshare("Vietnam")}), {chg(BYC["Vietnam"]["importsUsd"], BYC["Vietnam"]["priorImportsUsd"])}, '
    f'mostly wooden and other furniture ({hc("Vietnam", "9403")}) and seats ({hc("Vietnam", "9401")}). **China** fell to {cimp("China")}, '
    f'{chg(BYC["China"]["importsUsd"], BYC["China"]["priorImportsUsd"])}, but still ships the most mattresses and bedding ({hc("China", "9404")}) and lighting '
    f'({hc("China", "9405")}). **Mexico** ({cimp("Mexico")}) ships mostly seats and seat parts ({hc("Mexico", "9401")}) and lighting ({hc("Mexico", "9405")}); '
    f'**Canada** ({cimp("Canada")}) mostly furniture ({hc("Canada", "9403")}). Next come Italy ({cimp("Italy")}), Malaysia ({cimp("Malaysia")}), Cambodia '
    f'({cimp("Cambodia")}, up from {money(BYC["Cambodia"]["priorImportsUsd"])}), Indonesia ({cimp("Indonesia")}), Thailand ({cimp("Thailand")}) and India ({cimp("India")}).\n\n'
    f'By product, other furniture of 9403 was {heading_share("9403")}, seats of 9401 {heading_share("9401")}, lighting {heading_share("9405")}, mattresses and bedding '
    f'{heading_share("9404")}, medical furniture {heading_share("9402")} and prefabricated buildings {heading_share("9406")}. The largest lines were seat parts other than '
    f'of wood (9401.99, {hs6("9401.99")}), upholstered seats with wooden frames (9401.61, {hs6("9401.61")}, most of them sofas and armchairs now under the Section 232 wood duty), '
    f'other wooden furniture (9403.60, {hs6("9403.60")}), metal furniture (9403.20, {hs6("9403.20")}, {hs6chg("9403.20")}), wooden bedroom furniture (9403.50, '
    f'{hs6("9403.50")}), LED ceiling and wall fixtures (9405.11, {hs6("9405.11")}) and wooden kitchen furniture, including cabinets (9403.40, {hs6("9403.40")}).\n\n'
    f'{YEAR} is the latest full year of U.S. trade data. The Section 232 wood duty started on October 14, {YEAR}, so the {YEAR} figures show only its first weeks; the 2026 '
    'Section 301, Brazil and Section 338 duties are not yet visible. Duty-collected figures aren\'t available from an official source yet.'
)
ui['byYearPartners'] = [NAME.get(x, x) for x in ui['byYearPartners']]
ui['byYearCaption'] = ui['byYearCaption'].replace('Viet Nam', 'Vietnam')
for s_ in ui['stats']:
    s_['label'] = s_['label'].replace('Viet Nam', 'Vietnam')
for c_ in ov['tradeSnapshot']['topCountries']:
    c_['name'] = NAME.get(c_['name'], c_['name'])
ui['sources'] = [
    ui['sources'][0],
    {'label': 'Federal Register 90 FR 48127 (Proclamation 10976: Section 232 duties on timber, lumber and wood products, October 6, 2025)',
     'url': 'https://www.federalregister.gov/documents/2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'Furniture Tariff Rates by Country: Vietnam, China, Mexico, Canada, Malaysia, Italy (HTS Ch. 94) | KoalaGains',
    'shortDescription': 'The total U.S. tariff on furniture, mattresses and lighting by country and product group: 25% Section 232 on sofas, cabinets and vanities from most countries (15% EU, Japan, Korea, Taiwan), 37.5% on most Chinese and Brazilian furniture, 50% Section 338 on 177 Canadian lines, 10% to 12.5% from the other Section 301 economies.',
    'keywords': ['tariff on furniture from china', 'tariff on furniture from vietnam', 'tariff on furniture from canada', 'tariff on furniture from italy',
                 'furniture tariffs by country', 'furniture duty rate', 'what is the tariff on furniture'],
}
ia['intro'] = (
    'Each cell below is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. '
    'Antidumping and countervailing duties are **not** included, and they matter here: wooden bedroom furniture, wooden cabinets and vanities, steel racks and boltless '
    'shelving from China, and mattresses from China, Vietnam, Malaysia, Thailand, Mexico and 14 other countries, carry rates up to several hundred percent on top of the totals shown.\n\n'
    'Three things drive the totals. **Upholstered wooden seats, kitchen cabinets and vanities** pay the **25% Section 232 wood duty** from almost every country, Canada and '
    'Mexico included, which replaces the Section 301 duty on those lines (15% in all for the EU, Japan, Taiwan and South Korea; 10% for the UK). **Canada** pays nothing '
    'extra on most furniture with a USMCA claim, but **50% under Section 338** on 177 lines, claim or not. Everyone else pays the **2026 Section 301** duty (10% or 12.5%; the '
    'EU, Taiwan and Japan in place of lower base rates) on Free-to-12.8% base rates; **China** adds 25% (List 3) and **Brazil** 25%. Cells with two answers depend on whether '
    'the goods are wooden kitchen cabinets or vanities, vehicle seats, or informational-material signs.'
)
LABELS = {
    'Vietnam': 'Base rate + 12.5% (9903.05.84). Upholstered wooden seats, kitchen cabinets and vanities: 25% Section 232 instead (9903.76.02, 9903.76.03), 30% and 50% from January 1, 2027. Steel racks, shelving and prefab buildings: 25% Section 232 metals. Mattresses (AD 144.92% to 668.38%) and boltless shelving (224.94%) carry AD orders, not shown. The 2025 IEEPA duties ended February 24, 2026.',
    'China': 'Base rate + 25% Section 301 List 3 (9903.88.03 / 9903.88.04; 7.5% List 4A on 17 lines) + 12.5% 2026 Section 301 (9903.05.31) = 37.5% plus base on most lines. Sofas, cabinets and vanities: 25% List 3 + 25% Section 232 = 50%. Wooden bedroom furniture (216.01%), wooden cabinets (251.64%), steel racks (144.50%), boltless shelving and mattresses also carry AD/CVD, not shown. The IEEPA duties ended February 24, 2026.',
    'Mexico': 'With USMCA: Free on most lines; 25% Section 232 on sofas, cabinets and vanities and on steel racks and prefab buildings either way. Without USMCA: base rate + 10% (9903.05.55). Mattresses from Mexico carry AD (37.59% all others), not shown.',
    'Malaysia': 'Base rate + 10% (9903.05.54). Sofas, cabinets and vanities: 25% Section 232 instead. Mattresses (42.92%) and boltless shelving (58.29%) carry AD orders, not shown.',
    'Canada': 'With USMCA: Free on most lines, but 50% Section 338 (9903.03.14) on 177 listed lines, 25% Section 232 on sofas, cabinets and vanities, and 75% on listed lines that also pay Section 232 (for example vanities of 9403.60.80.93). Without USMCA: base rate + 10% (9903.05.29) on top. The 2025 IEEPA duty (35%) ended February 24, 2026.',
    'Indonesia': 'Base rate + 10% (9903.05.45). Sofas, cabinets and vanities: 25% Section 232 instead. The mattress AD order on Indonesia was revoked in March 2025.',
    'Taiwan': 'Base rates under 10% raised to 10% (9903.05.76); sofas, cabinets and vanities and car seats 15% in all (9903.76.24, 9903.94.67). Mattresses (624.50%) and boltless shelving (7.03%) carry AD orders, not shown.',
    'Italy': 'EU: base rates under 10% raised to 10% (9903.05.39); sofas, cabinets and vanities and car seats 15% in all (9903.76.22, 9903.94.53). Mattresses from Italy carry AD (257.06%), not shown.',
    'Thailand': 'Base rate + 12.5% (9903.05.77). Sofas, cabinets and vanities: 25% Section 232 instead. Mattresses (572.56% all others) and boltless shelving (2.75%) carry AD orders, not shown.',
    'India': 'Base rate + 10% (9903.05.44). Sofas, cabinets and vanities: 25% Section 232 instead. Mattresses from India carry AD (13.35% all others), not shown.',
    'Cambodia': 'Base rate + 10% (9903.05.28). Sofas, cabinets and vanities: 25% Section 232 instead. Mattresses from Cambodia carry AD (103.79%), not shown.',
    'Poland': 'EU: base rates under 10% raised to 10% (9903.05.39); sofas, cabinets and vanities 15% in all (9903.76.22). Mattresses from Poland carry AD (330.71% all others), not shown.',
    'Germany': 'EU: base rates under 10% raised to 10% (9903.05.39); sofas, cabinets and vanities and car seats 15% in all (9903.76.22, 9903.94.53).',
    'United Kingdom': 'Base rate + 10% (9903.05.81); sofas, cabinets and vanities 10% Section 232 (9903.76.20), car seats 10% in place of the base rate (9903.94.32).',
    'Japan': 'Base rates under 12.5% raised to 12.5% (9903.05.49); sofas, cabinets and vanities and car seats 15% in all (9903.76.21, 9903.94.43).',
    'South Korea': 'Base rates under 12.5% raised to 12.5% (9903.05.71); sofas, cabinets and vanities and car seats 15% in all (9903.76.23, 9903.94.63).',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27) = 37.5% plus base. Sofas, cabinets and vanities: only the 25% Section 232 duty; vehicle seats that are car or truck parts: 25%. The 2025 IEEPA duties ended February 24, 2026.',
    'Turkey': 'Base rate + the Section 301 rate for Turkey. Sofas, cabinets and vanities: 25% Section 232 instead. Mattresses from Turkey carry AD (20.03%), not shown.',
    'Any other country': 'Countries outside the 60 Section 301 economies pay the base rate, plus the Section 232 duties (25% on sofas, cabinets and vanities; 25% on steel racks and prefab buildings; 25% on vehicle seats). Other Section 301 economies pay 10% or 12.5% on top. Russia pays column 2 rates (35% on 24 lines) plus 12.5%, and 200% on aluminum furniture; Nicaragua\'s separate Section 301 duty (9903.89.01) starts January 1, 2027.',
}
for c in ia['countries']:
    c['rule']['label'] = LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'][1] = 'Ranges like "Free · 12.5%" mean the group has lines with different totals; select a cell to see which lines carry which rate.'
ia['assumptions'] += [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'Section 232 wood (9903.76.02, 9903.76.03) and metals (9903.82.09) apply on both sides of the Canada and Mexico rows, because U.S. notes 37 and 16(b) have no USMCA exemption; for those lines they replace the 2026 Section 301 and Brazil duties (notes 52(f), 50(a)(vi)).',
    'Cells for 9403.40.90.60, 9403.60.80.93 and 9403.91.00.80 show two totals: completed wooden kitchen cabinets or vanities (or their parts) pay Section 232; other goods of these lines enter under 9903.76.04 without it. 9401.20 seats show the car-part, truck-part and non-vehicle totals; 9405.61 and 9405.69 signs the informational-materials answer.',
    'Section 338 (9903.03.14) applies on both sides of the Canada row, because U.S. note 51(a) charges it even when USMCA is claimed, and since September 15, 2026 on top of Section 232.',
    'The Section 232 metals duty assumes the listed metal is at least 15% of the weight and does not apply the 85% U.S.-melted or 95% UK-melted rates.',
    'Antidumping and countervailing duties are not included: wooden bedroom furniture (China), wooden cabinets and vanities (China), steel racks and boltless steel shelving (China; shelving also Malaysia, Taiwan, Thailand, Vietnam), and mattresses (China and 18 other countries).',
    'Agency entry rules (CPSC furniture tip-over, mattress and upholstered furniture flammability and children\'s product rules, TSCA Title VI formaldehyde, the Lacey Act) do not change the duty and are listed on the Tariff engineering page.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 29, 30, 33, 37, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 94 provision is on the note 52(b) general '
    'exemption list (9903.05.86) or the Brazil list (note 50(a)(ii)). The note 52(j) country lists of Jordan (9903.06.20) and, for CAFTA-DR claims, Guatemala and El Salvador '
    '(9903.06.06, 9903.06.09) exempt 8 lines of sleeping bags, quilts, pillows and cushions; no other country list names Chapter 94, and none of its lines is in the note 52(i) '
    'CAFTA-DR textile list. Note 52(f) exempts the Section 232 lines; 9903.05.92 the informational-material signs of 9405.61 and 9405.69; 9903.05.88 the civil aircraft '
    'articles of note 52(d). Note 37 lists the 7 Section 232 wood lines; note 16(c) the 6 metals provisions; notes 33(g) and 38(i) 9401.20; note 51(b)(3) 177 lines for Section 338. '
    'China List 3 (note 20(f), (g)) covers 228 lines and List 4A 17, with nine exclusions under note 20(vvv) until November 9, 2026; note 30(b) lists 24 lines for the 35% Russia rate.'
)
ia['lastCheckedAt'] = TODAY
have = {s['id'] for s in ia['sources']}
for sid in ('eo-14389', 'procl-11012', 'fr-2019-27166', 'fr-2021-10238', 'fr-2024-15261', 'fr-2024-20346', 'fr-2026-16446', 'fr-2020-08544', 'fr-2019-19949', 'fr-2024-12566'):
    if sid not in have:
        ia['sources'].append(SRC.get(sid) or next(s for s in tu['sources'] if s['id'] == sid))
        have.add(sid)

# ---------------------------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Furniture & Mattresses: CPSC Tip-Over and Flammability Rules, TSCA, AD/CVD and Legal Ways to Lower Duty (HTS Ch. 94) | KoalaGains',
    'shortDescription': 'Tariff engineering for HTS Chapter 94: classify cabinets, vanities and upholstered seats correctly, claim USMCA, know your exporter\'s AD/CVD rate, use drawback (also for Section 232), and meet the CPSC STURDY Act tip-over, mattress and upholstered furniture flammability, children\'s product, eFiling, TSCA Title VI and Lacey Act rules.',
    'keywords': ['sturdy act requirements', '16 cfr 1633', '16 cfr 1632', 'tsca title vi furniture', 'furniture tariff code', 'kitchen cabinet tariff code',
                 'upholstered furniture tariff code', 'HTS Chapter 94 tariff engineering', 'furniture duty drawback'],
}
te['intro'] = (
    'The duty on furniture depends on three facts: **what it is** (an upholstered wooden seat, a completed wooden kitchen cabinet or vanity, a vehicle seat, a steel rack or '
    'an illuminated sign each has its own Section 232 or exemption treatment), **where it was made** (Canada and Mexico with USMCA, China, Brazil, the 60 Section 301 '
    'economies, the 15% deal partners) and **who made it** (AD/CVD rates on Chinese bedroom furniture, cabinets, racks and shelving and on mattresses from 19 countries are '
    'company-specific). So the first lever is classifying correctly, ideally with a binding CBP ruling, and the second is knowing the AD/CVD rate and scope before you buy.\n\n'
    'Furniture is also a regulated consumer product: dressers and other clothing storage units must pass the **STURDY Act** tip-over standard, mattresses the **CPSC '
    'flammability** standards, upholstered furniture **TB 117-2013**, cribs, bunk beds and children\'s furniture their own rules, and certificates must be **eFiled** with '
    'the entry since July 8, 2026. Composite-wood furniture must be **TSCA Title VI** compliant, and wooden furniture needs a **Lacey Act** declaration where APHIS '
    'enforces one. Each rule and lever links to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'
F_WOOD = SRC_URL = 'https://www.federalregister.gov/documents/2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states'
te['levers'] = [
    {'id': 'classify-232', 'title': 'Classify by what the goods are: cabinets, vanities, upholstered seats and vehicle seats each have their own duty',
     'saves': 'The 25% Section 232 wood duty (50% from 2027) applies only to completed wooden kitchen cabinets and vanities and their parts on three statistical lines, and to upholstered wooden seats on four; other goods of those lines enter under 9903.76.04 with none. A seat that is not a vehicle part avoids the 25% auto-parts duty.',
     'appliesTo': 'Headings 9401 and 9403 (9401.20, 9401.61, 9403.40.90.60, 9403.60.80.93, 9403.91.00.80), 9405.61 and 9405.69',
     'document': 'Product specifications and drawings: frame material (wood, metal, plastic), upholstery, intended use (kitchen or bath cabinet vs bedroom or office furniture; passenger car vs truck seat), and for signs whether they are informational materials. A binding ruling under 19 CFR part 177 settles it before import.',
     'caveat': 'Classification follows what the goods are; declaring a cabinet as other furniture, or an upholstered sofa as a non-upholstered one, to avoid Section 232 or AD/CVD is fraud. The AD/CVD scopes (for example wooden cabinets and vanities, wooden bedroom furniture) are written by description, so a different HTS number does not leave the order.',
     'citations': [{'label': 'HTSUS Chapter 94 notes', 'url': CH94},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33, 37, 38 and 52(f)', 'url': CH99},
                   {'label': '19 CFR part 177 (rulings)', 'url': ECFR19 + 'part-177'}]},
    {'id': 'usmca', 'title': 'Claim USMCA for Canadian and Mexican furniture',
     'saves': '10% of value: the 2026 Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55), plus the base rate (up to 12.8% on bedding and lamps); for vehicle seats, the 25% Section 232 auto- or truck-parts duty',
     'appliesTo': 'Originating goods of Canada and Mexico',
     'document': 'A USMCA certification of origin from the importer, exporter or producer, in the importer\'s possession when the claim is made (19 CFR 182.12). Rules of origin: General Note 11.',
     'caveat': 'USMCA does not remove the 25% Section 232 wood duty on sofas, cabinets and vanities (note 37), the Section 232 metals duty, the 50% Section 338 duty on the 177 Canadian lines (note 51(a)) or AD/CVD. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR19 + 'section-182.12'},
                   {'label': 'HTSUS General Note 11 (USMCA)', 'url': GN},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33(h), 37, 51(a) and 52(g)–(h)', 'url': CH99},
                   {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': reuse['ustr-usmca-review']['url']}]},
    {'id': 'deal-origin', 'title': 'Source Section 232 wood goods from the UK, EU, Japan, South Korea or Taiwan',
     'saves': '10 to 35 points: sofas, cabinets and vanities pay 15% in all from the EU, Japan, South Korea and Taiwan and 10% from the UK, against 25% (30% and 50% from 2027) from other countries, including Vietnam, Mexico and Canada',
     'appliesTo': 'Upholstered wooden seats (9401.61.40, 9401.61.60) and wooden kitchen cabinets, vanities and parts (9403.40.90.60, 9403.60.80.93, 9403.91.00.80)',
     'document': 'Proof that the goods are products of the partner under CBP\'s country-of-origin rules (substantial transformation), and the importer information CBP may require under note 37(k).',
     'caveat': 'Origin is where the goods were last substantially transformed, not where they were shipped from. Finishing or packing furniture made elsewhere does not change origin.',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 37(h)–(m)', 'url': CH99},
                   {'label': 'Proclamation 10976 (90 FR 48127), clause 7', 'url': F_WOOD},
                   {'label': '19 CFR 134.1 (country of origin)', 'url': ECFR19 + 'section-134.1'}]},
    {'id': 'adcvd-rate', 'title': 'Know your exporter\'s AD/CVD rate and the order scope before you buy',
     'saves': 'The gap between company rates and the country-wide rate: 216.01% China-wide on wooden bedroom furniture, 251.64% on Chinese wooden cabinets, 144.50% on Chinese steel racks, 668.38% Vietnam-wide on mattresses, against much lower separate rates',
     'appliesTo': 'Wooden bedroom furniture, wooden cabinets and vanities, steel racks and boltless shelving from China; boltless shelving from Malaysia, Taiwan, Thailand and Vietnam; mattresses from China and 18 other countries',
     'document': 'The producer and exporter names on the commercial invoice, matched to Commerce\'s latest final results. When the scope is unclear, ask Commerce for a scope ruling (19 CFR 351.225).',
     'caveat': 'The written scope decides, not the HTS number. Rates change with each review, circumvention inquiries can extend an order to goods finished in another country (mattresses from Mexico and Malaysia are under inquiry), and the importer must file a non-reimbursement certificate (19 CFR 351.402(f)).',
     'citations': [{'label': '91 FR 52041 (wooden bedroom furniture, China-wide rate)', 'url': SRC['fr-2026-16446']['url']},
                   {'label': '91 FR 21788 (wooden cabinets, AD review)', 'url': SRC['fr-2026-07866']['url']},
                   {'label': '86 FR 26460 (mattresses, 2021 orders)', 'url': SRC['fr-2021-10238']['url']},
                   {'label': '19 CFR 351.225 (scope rulings)', 'url': ECFR19 + 'section-351.225'}]},
    {'id': 'drawback', 'title': 'Claim drawback when the furniture, or goods made from it, are exported',
     'saves': 'Generally 99% of the duties paid, including the Section 232 wood duties (Proclamation 10976 clause 14), the Section 301 duties and the base rate, on goods re-exported or used to make exported goods',
     'appliesTo': 'All lines that paid a duty',
     'document': 'A drawback claim to CBP with the import and export records (19 CFR part 191); the claim is generally 99% of the eligible duties (19 CFR 191.51).',
     'caveat': 'Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)). Section 232 wood goods admitted to a foreign-trade zone must take privileged foreign status (Proclamation 10976 clause 8).',
     'citations': [{'label': '19 CFR part 191', 'url': ECFR19 + 'part-191'},
                   {'label': '19 CFR 191.3', 'url': ECFR19 + 'section-191.3'},
                   {'label': 'Proclamation 10976 (90 FR 48127)', 'url': F_WOOD}]},
]
te['rules'] = [
    {'id': 'cpsc-sturdy', 'agency': 'CPSC',
     'title': 'Clothing storage units (dressers, chests, wardrobes, armoires and similar free-standing bedroom storage furniture) must meet the STURDY Act tip-over standard, be tested by the importer or manufacturer and carry the warning label and hang tag (16 CFR part 1261)',
     'citations': [{'label': '16 CFR part 1261', 'url': ECFR16 + 'part-1261'}, {'label': '16 CFR 1261.1', 'url': ECFR16 + 'section-1261.1'}]},
    {'id': 'cpsc-mattress', 'agency': 'CPSC',
     'title': 'Mattresses and mattress pads must pass the cigarette-ignition standard (16 CFR part 1632) and mattress sets the open-flame standard (16 CFR part 1633), with prototype testing, records and a permanent label',
     'citations': [{'label': '16 CFR part 1632', 'url': ECFR16 + 'part-1632'}, {'label': '16 CFR part 1633', 'url': ECFR16 + 'part-1633'}]},
    {'id': 'cpsc-upholstered', 'agency': 'CPSC',
     'title': 'Residential upholstered furniture must meet the smolder-resistance standard of California TB 117-2013 and carry its compliance label (16 CFR part 1640)',
     'citations': [{'label': '16 CFR part 1640', 'url': ECFR16 + 'part-1640'}]},
    {'id': 'cpsc-children', 'agency': 'CPSC',
     'title': 'Children\'s furniture: full-size and non-full-size cribs (16 CFR 1219, 1220), crib mattresses (1241), bunk beds (1213) and other durable infant products need third-party testing by a CPSC-accepted lab and a Children\'s Product Certificate; paint and coatings may not exceed 0.009% lead (16 CFR 1303)',
     'citations': [{'label': '16 CFR part 1219', 'url': ECFR16 + 'part-1219'}, {'label': '16 CFR part 1220', 'url': ECFR16 + 'part-1220'},
                   {'label': '16 CFR part 1241', 'url': ECFR16 + 'part-1241'}, {'label': '16 CFR part 1213', 'url': ECFR16 + 'part-1213'},
                   {'label': '16 CFR part 1303', 'url': ECFR16 + 'part-1303'}]},
    {'id': 'cpsc-efiling', 'agency': 'CPSC / CBP',
     'title': 'Certificates of compliance (GCC or CPC) for CPSC-regulated furniture, mattresses and children\'s products must be eFiled in ACE with the entry since July 8, 2026 (from foreign-trade zones January 8, 2027) (16 CFR 1110.13)',
     'citations': [{'label': '16 CFR 1110.13', 'url': ECFR16 + 'section-1110.13'}, {'label': 'CPSC final rule, 90 FR 1800 (January 8, 2025)', 'url': frmeta['2024-30826']['html_url']}]},
    {'id': 'cpsc-lighting', 'agency': 'CPSC',
     'title': 'Seasonal and decorative lighting (Christmas light sets of 9405.31 and 9405.39) that lacks the UL 588 safeguards (minimum wire size, strain relief, overcurrent protection) is a substantial product hazard and can be refused entry (16 CFR 1120.3(c))',
     'citations': [{'label': '16 CFR 1120.3', 'url': ECFR16 + 'section-1120.3'}]},
    {'id': 'tsca-formaldehyde', 'agency': 'EPA / CBP',
     'title': 'Furniture and cabinets made with hardwood plywood, particleboard or MDF must contain TSCA Title VI compliant panels; importers must keep supplier statements and records for 3 years and certify TSCA compliance at entry (40 CFR 770.30; 19 CFR 12.121)',
     'citations': [{'label': '40 CFR 770.3 (definitions)', 'url': ECFR40 + 'section-770.3'}, {'label': '40 CFR 770.30', 'url': ECFR40 + 'section-770.30'},
                   {'label': '19 CFR 12.121', 'url': ECFR19 + 'section-12.121'}]},
    {'id': 'lacey', 'agency': 'USDA APHIS',
     'title': 'Lacey Act: wood taken or traded in violation of law may not be imported (16 U.S.C. 3372(a)); a plant import declaration (species, value, quantity, country of harvest) is required where APHIS enforces it by HTS code (16 U.S.C. 3372(f)). APHIS\'s phase VII notice (May 31, 2024) named wooden, bamboo and rattan seats and furniture, wood furniture parts, mattress supports, some luminaires and prefabricated wooden buildings; no later notice had been published by October 13, 2026',
     'citations': [{'label': '16 U.S.C. 3372', 'url': USC_16_3372},
                   {'label': 'APHIS notice, 89 FR 47122 (May 31, 2024)', 'url': frmeta['2024-11901']['html_url']}]},
    {'id': 'marking', 'agency': 'CBP',
     'title': 'Country-of-origin marking: furniture, mattresses and lamps must be marked legibly and permanently with the English name of the country of origin, and so must the outermost containers (19 CFR 134.11, 134.22)',
     'citations': [{'label': '19 CFR 134.11', 'url': ECFR19 + 'section-134.11'}, {'label': '19 CFR 134.22', 'url': ECFR19 + 'section-134.22'}]},
    {'id': 's232-wood', 'agency': 'CBP',
     'title': 'Upholstered wooden seats and completed wooden kitchen cabinets and vanities (and parts) on the note 37(d) and (f) lines: report 9903.76.02 or 9903.76.03 (UK 9903.76.20; Japan .21; EU .22; South Korea .23; Taiwan .24) and pay the duty, also under USMCA; other goods of the 37(f) lines report 9903.76.04',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 37', 'url': CH99}, {'label': 'Proclamation 10976 (90 FR 48127)', 'url': F_WOOD},
                   {'label': 'Proclamation 11000 (91 FR 1039)', 'url': 'https://www.federalregister.gov/documents/2026/01/09/2026-00327/amendments-to-adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united'}]},
    {'id': 's232-metals', 'agency': 'CBP',
     'title': 'Steel shelving and racks, welded wire racks, rack parts and prefabricated buildings on the note 16(c) lists: report 9903.82.09 (or .05, .06 when the melt rules are met; .01 or .03 when there is no metal or under 15% by weight) and pay 25% of the full value',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 16', 'url': CH99},
                   {'label': 'Proclamation 11021 (91 FR 18201)', 'url': 'https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states'}]},
    {'id': 's232-vehicle-seats', 'agency': 'CBP',
     'title': 'Seats of 9401.20 for passenger vehicles and light trucks: report 9903.94.05 (25%) or the partner heading; for trucks and buses 9903.74.08 (25%); USMCA-qualifying parts 9903.94.06 or 9903.74.10; other seats 9903.94.06 / 9903.74.11 with no Section 232 duty',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33 and 38', 'url': CH99},
                   {'label': 'CBP Section 232 FAQs: automobiles and auto parts', 'url': 'https://www.cbp.gov/trade/programs-administration/entry-summary/section-232-additional-faqs-autos'}]},
    {'id': 's338-canada', 'agency': 'CBP',
     'title': 'Canadian goods on the note 51(b)(3) list (177 Chapter 94 lines): report 9903.03.14 and pay 50%, also when USMCA is claimed and on top of any Section 232 duty',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 51', 'url': CH99},
                   {'label': 'Proclamation 11048 (91 FR 46663)', 'url': 'https://www.federalregister.gov/documents/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united'}]},
    {'id': 'adcvd-wbf', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Wooden bedroom furniture from China: antidumping order since 2005 (China-wide 216.01%); the scope covers wooden beds, headboards, nightstands, dressers, chests, armoires and bedroom mirrors; not in the tariff calculator',
     'citations': [{'label': '87 FR 56397 (order continued)', 'url': SRC['fr-2022-19855']['url']}, {'label': '91 FR 52041 (2024 review)', 'url': SRC['fr-2026-16446']['url']}]},
    {'id': 'adcvd-cabinets', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Wooden cabinets and vanities and components from China: AD (China-wide 251.64%) and CVD (20.93% all others) orders since 2020, continued September 17, 2025; not in the tariff calculator',
     'citations': [{'label': '85 FR 22126 (AD order, scope)', 'url': SRC['fr-2020-08544']['url']}, {'label': '85 FR 22134 (CVD order)', 'url': SRC['fr-2020-08546']['url']},
                   {'label': '90 FR 44800 (orders continued)', 'url': SRC['fr-2025-17986']['url']}]},
    {'id': 'adcvd-racks', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Steel racks from China (AD China-wide 144.50%, CVD) and boltless steel shelving units prepackaged for sale from China (orders continued 2026), Malaysia, Taiwan, Thailand and Vietnam (2024 AD orders); not in the tariff calculator',
     'citations': [{'label': '84 FR 48584 (steel racks orders)', 'url': SRC['fr-2019-19949']['url']}, {'label': '91 FR 58416 (steel racks review)', 'url': SRC['fr-2026-18791']['url']},
                   {'label': '89 FR 48555 (boltless shelving, 2024 orders)', 'url': SRC['fr-2024-12566']['url']}, {'label': '91 FR 61439 (ITC, boltless shelving from China)', 'url': SRC['fr-2026-19852']['url']}]},
    {'id': 'adcvd-mattresses', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Mattresses: AD orders on China (2019) and on Cambodia, Malaysia, Serbia, Thailand, Turkey and Vietnam (2021), Bosnia and Herzegovina, Bulgaria, Burma, Italy, the Philippines, Poland, Slovenia and Taiwan (July 2024) and India, Kosovo, Mexico and Spain (September 2024), and a CVD order on China; not in the tariff calculator',
     'citations': [{'label': '84 FR 68395 (China AD order)', 'url': SRC['fr-2019-27166']['url']}, {'label': '86 FR 26460 (2021 AD orders)', 'url': SRC['fr-2021-10238']['url']},
                   {'label': '89 FR 56851 (July 2024 AD orders)', 'url': SRC['fr-2024-15261']['url']}, {'label': '89 FR 73357 (September 2024 AD orders)', 'url': SRC['fr-2024-20346']['url']}]},
    {'id': 'usmca-cert', 'agency': 'CBP',
     'title': 'USMCA claims: a certification of origin in the importer\'s possession, provided to CBP on request',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR19 + 'section-182.12'}, {'label': 'HTSUS General Note 11', 'url': GN}]},
]
BASE_RULES = ['marking', 'usmca-cert', 'cpsc-efiling']
GROUP_RULES = {
    '9401': ['cpsc-upholstered', 'cpsc-children', 'tsca-formaldehyde', 'lacey', 's232-wood', 's232-vehicle-seats', 's338-canada', 'adcvd-mattresses'],
    '9402': [],
    '9403': ['cpsc-sturdy', 'cpsc-children', 'tsca-formaldehyde', 'lacey', 's232-wood', 's232-metals', 's338-canada', 'adcvd-wbf', 'adcvd-cabinets', 'adcvd-racks'],
    '9404': ['cpsc-mattress', 'cpsc-children', 'lacey', 's338-canada', 'adcvd-mattresses'],
    '9405': ['cpsc-lighting', 'lacey', 's338-canada'],
    '9406': ['lacey', 's232-metals'],
}
NOTES = {
    '9401': 'Upholstered wooden seats pay the 25% Section 232 wood duty (30% from 2027) and must meet the TB 117-2013 smolder standard; vehicle seats pay the Section 232 auto- or truck-parts duty unless USMCA-qualifying; high chairs and other children\'s seats need a Children\'s Product Certificate. Mattress sets entered with a sofa bed or futon frame can fall inside the mattress AD orders.',
    '9402': 'Medical, dental and barber furniture: no Section 232 duty and not on the China Section 301 lists. Hospital beds and examination tables may also be FDA-regulated devices.',
    '9403': 'The busiest group for rules: Section 232 on wooden kitchen cabinets and vanities and on steel racks, the STURDY Act tip-over standard for dressers and other clothing storage units, crib and bunk bed rules, TSCA Title VI for composite-wood furniture, and AD/CVD on Chinese wooden bedroom furniture, cabinets, steel racks and boltless shelving.',
    '9404': 'Mattresses must meet 16 CFR 1632 and 1633 and crib mattresses 16 CFR 1241; mattresses from China and 18 other countries carry AD orders (China also CVD). Canadian mattresses and mattress supports pay 50% under Section 338.',
    '9405': 'Christmas and other decorative light sets must have the UL 588 safeguards (16 CFR 1120.3(c)). Illuminated signs of 9405.61 and 9405.69 that are informational materials are exempt from the 2026 Section 301 duties. LED lamps and light sources themselves are classified in Chapter 85.',
    '9406': 'Steel modular buildings (9406.20) and other prefabricated buildings (9406.90.01) pay 25% Section 232 metals when the metal is at least 15% of the weight; wooden prefabricated buildings (9406.10) are in APHIS\'s proposed Lacey Act phase VII.',
}
for g in te['groups']:
    g['label'] = GROUPS[g['heading']][0]
    g['ruleIds'] = BASE_RULES + GROUP_RULES[g['heading']]
    g['note'] = NOTES[g['heading']]

WOOD232 = {'9401614011', '9401614031', '9401616011', '9401616031', '9403409060', '9403608093', '9403910080'}
METAL232 = ('9403200075', '9403200082', '9403999020', '9403999040', '94062000', '94069001')
S338 = ('94013900', '94016960', '94017100', '94017900', '94019190', '94019910', '94032000', '94035090', '94036080', '94037080', '94039910', '94039920',
        '94039930', '94039940', '94039950', '94051160', '94051180', '94054260', '94054284', '94059940', '94014100', '94014900', '94015200', '94015300',
        '94015900', '94016120', '94016920', '94016940', '94016980', '94018020', '94018040', '94018060', '94019115', '94019120', '94019925', '94019935',
        '94019990', '94033040', '94034040', '94034060', '94036040', '94037040', '94038200', '94038300', '94038930', '94038960', '94041000', '94042100',
        '94042910', '94042990', '94052140', '94052160', '94052180', '94052940', '94052960', '94052980')
# Lacey Act: the Chapter 94 provisions named in APHIS's phase VII notice (89 FR 47122)
LACEY = ('940131', '940152', '940153', '940159', '94016140', '94016160', '9401790011', '9401790015', '9401790025', '9401790035', '9401806025', '9401806028',
         '94019115', '94019190', '94019925', '94033080', '94034060', '94035060', '94035090', '94036080', '94038200', '94038300', '940389', '94039100',
         '94039920', '940410', '94051180', '9405428410', '9406100000')
WBF = ('94035090', '94036080', '94039100')  # wooden bedroom furniture scope (mainly 9403.50.90) + other wooden furniture and wooden parts
CABINETS = ('9403409060', '94036080', '9403910080')
RACKS = ('9403200075', '9403200082', '9403999040', '9403999020')
MATTRESS = ('940421', '940429', '940141', '940149')
STURDY = ('94035090', '94036080', '94035060', '94032000', '94037080', '94038200', '94038300', '940389')
UPHOL = ('940161', '940171', '940141', '940149', '940131', '940139')
ROWS = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
CHILD_WORDS = ('crib', 'toddler', 'bassinet', 'cradle', 'play yard', 'highchair', 'for children', 'children’s', "children's", 'bunk')
for l in te['lines']:
    code = l['hts'].replace('.', '')
    row = ROWS.get(l['hts'], {})
    text = (' '.join(row.get('ancestorPath', [])) + ' ' + row.get('description', '')).lower()
    h = code[:4]
    rules = list(BASE_RULES)
    if code.startswith(UPHOL):
        rules.append('cpsc-upholstered')
    if code.startswith(STURDY):
        rules.append('cpsc-sturdy')
    if any(w in text for w in CHILD_WORDS) and not code.startswith('9401999010'):
        rules.append('cpsc-children')
    if code.startswith(('940421', '940429', '940410')):
        rules.append('cpsc-mattress')
    if code.startswith(('940531', '940539')):
        rules.append('cpsc-lighting')
    if h in ('9401', '9403') and not code.startswith(('9401100', '940120', '940171', '940179', '940310', '940320', '940370', '94039910')):
        rules.append('tsca-formaldehyde')
    if code.startswith(LACEY):
        rules.append('lacey')
    if code in WOOD232:
        rules.append('s232-wood')
    if code.startswith(METAL232):
        rules.append('s232-metals')
    if code.startswith('940120'):
        rules.append('s232-vehicle-seats')
    if code.startswith(S338):
        rules.append('s338-canada')
    adcvd = False
    if code.startswith(WBF):
        rules.append('adcvd-wbf'); adcvd = True
    if code.startswith(CABINETS):
        rules.append('adcvd-cabinets'); adcvd = True
    if code.startswith(RACKS):
        rules.append('adcvd-racks'); adcvd = True
    if code.startswith(MATTRESS):
        rules.append('adcvd-mattresses'); adcvd = True
    levers = []
    if code in WOOD232 or code.startswith(('940120', '940561', '940569', '940360', '940340', '940391')):
        levers.append('classify-232')
    if code in WOOD232:
        levers.append('deal-origin')
    levers.append('usmca')
    if adcvd:
        levers.append('adcvd-rate')
    levers.append('drawback')
    l['ruleIds'] = list(dict.fromkeys(rules))
    l['leverIds'] = list(dict.fromkeys(levers))
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations; not legal advice. AD/CVD rates are company-specific and change with each review; '
                    'check Commerce\'s latest notice and CBP\'s cash-deposit instructions before importing.')

# ---------------------------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Furniture Tariffs FAQ: China, Vietnam, Canada, Kitchen Cabinets, Mattresses, HS Codes 9401 & 9403 (HTS Ch. 94) | KoalaGains',
    'shortDescription': 'Answers to what people search about furniture tariffs: the tariff on furniture from China, Vietnam, Canada and Italy, the Section 232 kitchen cabinet, vanity and upholstered furniture tariffs, mattress antidumping duties, HS codes for furniture, sofas, mattresses and lamps, and the STURDY Act.',
    'keywords': ['are there tariffs on furniture', 'what is the tariff on furniture from china', 'what is the tariff on furniture from vietnam', 'tariff on furniture from canada',
                 'kitchen cabinet tariffs', 'upholstered furniture tariff', 'section 232 furniture tariffs', 'mattress tariffs', 'hs code for furniture',
                 'hs code for sofa', 'hs code for mattress', 'hs code for led light fixtures', 'sturdy act requirements', 'hts chapter 94'],
}
fc['intro'] = 'Straight answers to the most common questions about U.S. tariffs on furniture, mattresses and lighting, by country, by product and by HS code. Each answer links to the page with the full detail.'
fc['keyTakeaways'] = [
    'Furniture is Free at base, so extra duties set the cost. Upholstered wooden seats and wooden kitchen cabinets and vanities pay a 25% Section 232 duty from almost every country, Canada and Mexico included, rising to 30% and 50% on January 1, 2027; the EU, Japan, South Korea and Taiwan pay 15% in all and the UK 10%.',
    'Other furniture pays the 2026 Section 301 duty: 12.5% from Vietnam and Thailand, 10% from Malaysia, Indonesia and India, 10% in all from the EU and Taiwan. China pays 25% (List 3) plus 12.5%, Brazil 37.5%, and 177 Canadian lines 50% under Section 338 even with USMCA.',
    'AD/CVD orders add far more on some goods: wooden bedroom furniture (216.01% China-wide), wooden cabinets and vanities (251.64% China-wide AD), steel racks and boltless shelving from China, and mattresses from China and 18 other countries. The 2025 IEEPA duties ended February 24, 2026.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 13, 2026'
fc['faqs'] = [
    {'id': 'furniture-now', 'question': 'Are there tariffs on furniture right now?',
     'searchedAs': ['are there tariffs on furniture', 'are there tariffs on furniture right now', 'are there still tariffs on furniture', 'are there new tariffs on furniture', 'furniture tariffs 2026'],
     'answer': 'Yes. The base rate on seats and furniture is Free, but extra duties apply. Upholstered wooden seats and wooden kitchen cabinets and vanities pay a 25% Section 232 duty from most countries since October 14, 2025 (15% in all from the EU, Japan, South Korea and Taiwan; 10% from the UK). Other furniture pays the 2026 Section 301 duty of 10% or 12.5% from 60 economies, 37.5% from China and Brazil, and 50% from Canada on 177 listed lines. The 2025 IEEPA tariffs ended February 24, 2026, and the Section 122 surcharge on July 23, 2026.',
     'link': 'industry-areas'},
    {'id': 'china', 'question': 'What is the tariff on furniture from China?',
     'searchedAs': ['what is the tariff on furniture from china', 'tariff on furniture from china', 'current tariff on furniture from china', 'furniture tariffs from china', 'import duty on furniture from china to usa'],
     'answer': 'Most Chinese furniture pays 37.5%: the Free base rate plus 25% under Section 301 List 3 (9903.88.03) and 12.5% under the 2026 Section 301 action (9903.05.31). Chinese sofas with wooden frames, kitchen cabinets and vanities pay 25% List 3 plus the 25% Section 232 wood duty, 50% (75% for cabinets and vanities from January 1, 2027). Chinese lamps pay 41% to 45% with their base rates. Wooden bedroom furniture (216.01% China-wide), wooden cabinets and vanities (251.64%), steel racks (144.50%) and mattresses also carry antidumping duties.',
     'link': 'industry-areas'},
    {'id': 'vietnam', 'question': 'What is the tariff on furniture from Vietnam?',
     'searchedAs': ['what is the tariff on furniture from vietnam', 'tariff on furniture from vietnam', 'furniture tariff vietnam', 'us tariff on furniture from vietnam'],
     'answer': 'Vietnamese wooden bedroom, dining and office furniture and metal and plastic chairs pay 12.5% (the 2026 Section 301 duty, 9903.05.84) on a Free base rate. Upholstered wooden sofas and chairs, kitchen cabinets and vanities pay the 25% Section 232 wood duty instead, rising to 30% and 50% on January 1, 2027. Mattresses from Vietnam pay 3% or 6% plus 12.5%, plus antidumping cash deposits of 144.92% or 668.38%. The 2025 IEEPA reciprocal tariff ended February 24, 2026.',
     'link': 'industry-areas'},
    {'id': 'canada', 'question': 'What is the tariff on furniture from Canada?',
     'searchedAs': ['tariff on furniture from canada', 'us tariff on furniture from canada', 'are there tariffs on furniture from canada', 'furniture tariffs canada', 'what is the tariff on furniture from canada'],
     'answer': 'Canadian furniture that qualifies for USMCA is Free, except that 177 Chapter 94 lines (including metal and wooden seats, metal, bedroom, office, kitchen and plastic furniture, mattresses and some lamps) pay 50% under Section 338 since August 22 or September 15, 2026, even with a USMCA claim. Canadian sofas, kitchen cabinets and vanities pay the 25% Section 232 wood duty; listed lines that also pay Section 232, such as vanities of 9403.60.80.93, pay 75%. Without USMCA, add 10%.',
     'link': 'industry-areas'},
    {'id': 'italy', 'question': 'What is the tariff on furniture from Italy and Europe?',
     'searchedAs': ['tariff on furniture from italy', 'are there tariffs on furniture from italy', 'what is the tariff on furniture from italy', 'tariffs on furniture from europe'],
     'answer': 'Furniture from Italy and other EU countries pays 10% in all: the 2026 Section 301 duty brings base rates under 10% up to 10% (9903.05.39). Italian sofas, kitchen cabinets and vanities pay 15% in all under Section 232 (9903.76.22), and the January 2027 increases do not apply. Mattresses from Italy also carry an antidumping order (257.06%).',
     'link': 'industry-areas'},
    {'id': 'cabinets', 'question': 'What is the tariff on kitchen cabinets and vanities?',
     'searchedAs': ['kitchen cabinet tariffs', 'kitchen cabinet tariff increase', 'kitchen cabinet tariff code', 'bathroom vanity tariff', 'vanity tariff code', 'tariffs on furniture and cabinets'],
     'answer': 'Completed wooden kitchen cabinets and vanities and their wooden parts (9403.40.90.60, 9403.60.80.93, 9403.91.00.80) pay a 25% Section 232 duty (9903.76.03) from every country except the UK (10%) and the EU, Japan, South Korea and Taiwan (15% in all), including Canada and Mexico with a USMCA claim. It rises to 50% on January 1, 2027. Goods of those lines that are not wooden cabinets or vanities enter under 9903.76.04 with no Section 232 duty. Chinese wooden cabinets also pay 25% List 3 and AD/CVD.',
     'link': 'tariff-updates'},
    {'id': 'upholstered', 'question': 'What is the Section 232 tariff on upholstered furniture?',
     'searchedAs': ['section 232 upholstered furniture', 'upholstered furniture tariff', 'upholstered wooden furniture tariff', '30 upholstered furniture tariff', 'section 232 furniture tariffs', 'upholstered furniture tariff code'],
     'answer': 'Upholstered seats with wooden frames, such as sofas, loveseats and armchairs of 9401.61.40 and 9401.61.60 (household and other), pay a 25% Section 232 duty (9903.76.02) since October 14, 2025, rising to 30% on January 1, 2027 under Proclamation 11000. The UK pays 10%, and the EU, Japan, South Korea and Taiwan 15% in all. Upholstered seats with metal frames (9401.71) are not covered; they pay the normal Section 301 rate.',
     'link': 'tariff-updates'},
    {'id': 'mattress', 'question': 'What are the tariffs and antidumping duties on mattresses?',
     'searchedAs': ['mattress tariffs', 'mattress antidumping', 'mattress anti dumping duty', 'mattress tariff code', 'foam mattress tariff code'],
     'answer': 'Mattresses of cellular rubber or plastics (9404.21) have a 3% base rate and other mattresses (9404.29) 3% or 6%, plus the country\'s Section 301 rate (37.5% from China, 12.5% from Vietnam). Antidumping orders cover mattresses from China (China-wide 1,731.75%, plus 97.78% CVD), Vietnam (144.92% to 668.38%), Cambodia, Malaysia, Serbia, Thailand, Turkey, Bosnia and Herzegovina, Bulgaria, Burma, Italy, the Philippines, Poland, Slovenia, Taiwan, India, Kosovo, Mexico and Spain. Canadian mattresses pay 50% under Section 338.',
     'link': 'tariff-updates'},
    {'id': 'hs-furniture', 'question': 'What is the HS code for furniture?',
     'searchedAs': ['hs code for furniture', 'hts code for furniture', 'furniture tariff code', 'hs code for furniture parts', 'hs code 9403', 'hs code 9403.60'],
     'answer': 'Seats and sofas are heading 9401 and other furniture 9403: 9403.10 metal office furniture, 9403.20 other metal furniture, 9403.30 wooden office furniture, 9403.40 wooden kitchen furniture, 9403.50 wooden bedroom furniture, 9403.60 other wooden furniture, 9403.70 plastic furniture, 9403.82 to 9403.89 bamboo, rattan and other materials, and 9403.91 to 9403.99 parts. All are Free at base. Medical furniture is 9402, mattresses and bedding 9404, lamps 9405 and prefabricated buildings 9406.',
     'link': ''},
    {'id': 'hs-sofa', 'question': 'What is the HS code for sofas and chairs?',
     'searchedAs': ['hs code for sofa', 'hs code for sofa set', 'hs code for chairs', 'hs code for office chair', 'hs code 9401.61', 'hs code 9401'],
     'answer': 'Heading 9401: 9401.30 swivel office chairs with height adjustment, 9401.40 seats convertible into beds (sofa beds), 9401.52 to 9401.59 bamboo, rattan and wicker seats, 9401.61 upholstered and 9401.69 other seats with wooden frames, 9401.71 upholstered and 9401.79 other seats with metal frames, 9401.80 other seats, and 9401.91 to 9401.99 parts. All are Free at base. Upholstered wooden sofas and chairs (9401.61.40, 9401.61.60) pay the 25% Section 232 wood duty.',
     'link': ''},
    {'id': 'hs-mattress', 'question': 'What is the HS code for a mattress?',
     'searchedAs': ['hs code for mattress', 'hs code 9404', 'hs code 9404.21', 'hs code for mattress topper', 'hs code for pillow'],
     'answer': 'Heading 9404: 9404.10 mattress supports and box springs (Free), 9404.21 mattresses of cellular rubber or plastics such as memory foam (3%), 9404.29 other mattresses (3% of cotton, 6% innerspring and other), 9404.30 sleeping bags, 9404.40 quilts, comforters and duvets, and 9404.90 pillows, cushions and other stuffed bedding. Crib and toddler mattresses and the over-91 cm by 184 cm sizes have their own statistical suffixes.',
     'link': ''},
    {'id': 'hs-lighting', 'question': 'What is the HS code for LED light fixtures and lamps?',
     'searchedAs': ['hs code for led light fixtures', 'hs code for lamp', 'hs code 9405', 'hs code 9405.42', 'hs code for led lights', 'lamp tariff code'],
     'answer': 'Luminaires are heading 9405: 9405.11 and 9405.19 chandeliers and ceiling or wall fixtures, 9405.21 and 9405.29 table, desk, bedside and floor lamps, 9405.31 and 9405.39 lighting sets such as Christmas lights, 9405.41 to 9405.49 other electric luminaires, including outdoor and photovoltaic ones, 9405.50 non-electric lamps, 9405.61 and 9405.69 illuminated signs, and 9405.91 to 9405.99 parts. The .1, .21, .31, .41, .61 subheadings are for fixtures designed solely for LED light sources. Rates run from 2.9% to 12%. LED bulbs and tubes themselves are Chapter 85.',
     'link': ''},
    {'id': 'sturdy', 'question': 'What does the STURDY Act require for imported furniture?',
     'searchedAs': ['sturdy act', 'sturdy act requirements', 'sturdy act furniture', 'sturdy act compliance', 'sturdy act law'],
     'answer': 'The STURDY Act led to CPSC\'s mandatory safety standard for clothing storage units, 16 CFR part 1261: free-standing furniture for storing clothing, such as dressers, chests, wardrobes and armoires, manufactured after September 1, 2023, must pass stability tests that simulate a child climbing or pulling on open drawers, and carry a warning label and hang tag. Importers must certify compliance in a General Certificate of Conformity, which since July 8, 2026 must be eFiled with the entry.',
     'link': 'tariff-engineering'},
    {'id': 'mattress-flammability', 'question': 'What are the mattress flammability rules (16 CFR 1632 and 1633)?',
     'searchedAs': ['16 cfr 1633', '16 cfr 1632', '16 cfr 1632 and 1633', '16 cfr 1633 mattress', 'cpsc 16 cfr 1632'],
     'answer': '16 CFR part 1632 is the cigarette-ignition (smolder) standard for mattresses and mattress pads; 16 CFR part 1633 is the open-flame standard that limits the heat a mattress set releases in a 30-minute test. Every mattress manufactured, imported or renovated must meet both, based on prototype tests, with production records and a permanent label. Upholstered furniture separately must meet TB 117-2013 (16 CFR part 1640).',
     'link': 'tariff-engineering'},
    {'id': 'hts-94', 'question': 'What does HTS Chapter 94 cover?',
     'searchedAs': ['hts chapter 94', 'chapter 94 hts', 'chapter 94 hts 2026', 'htsus chapter 94', 'chapter 94 hts code'],
     'answer': 'HTS Chapter 94, "Furniture; bedding, mattresses, mattress supports, cushions and similar stuffed furnishings; luminaires and lighting fittings, not elsewhere specified or included; illuminated signs, illuminated nameplates and the like; prefabricated buildings", is in Section XX with toys (Chapter 95) and miscellaneous articles (Chapter 96). It has 6 headings (9401 to 9406) and 275 ten-digit U.S. lines.',
     'link': ''},
]

# ---------------------------------------------------------------------------------------------------------------------
json.dump(d, open(out, 'w'), ensure_ascii=False, indent=2)
print('wrote', out)
