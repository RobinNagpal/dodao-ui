#!/usr/bin/env python3
"""Fill the writer TODOs of the generated Chapter 44 content file (re-runnable).

Usage: python3 fill.py <generated.json> <out.json>
Input is the untouched output of `pnpm tariff:generate-chapter --chapter 44 ...` (copied to gen.json);
the data parts (rate table, matrix totals, trade figures, line statuses) are kept as generated.
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
frmeta = json.load(open(f'{SCRATCH}/44/frmeta.json'))

TODAY = '2026-10-13'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH44 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2044'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
CH99_25R22 = 'https://hts.usitc.gov/reststop/file?release=2025HTSRev22&filename=Chapter%2099'
ECFR19 = 'https://www.ecfr.gov/current/title-19/'
ECFR7 = 'https://www.ecfr.gov/current/title-7/'
ECFR40 = 'https://www.ecfr.gov/current/title-40/'
ECFR50 = 'https://www.ecfr.gov/current/title-50/'
USC_16_3372 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm'


def fr(docnum, id_=None, document=None):
    m = frmeta[docnum]
    agencies = m.get('agencies') or []
    if m['type'] == 'Presidential Document':
        doc = document or 'Presidential document'
    elif document:
        doc = document
    else:
        names = [a.get('name') for a in agencies]
        if 'International Trade Commission' in names:
            doc = 'Notice (USITC)'
        elif 'Agricultural Marketing Service' in names:
            doc = 'Final rule (USDA AMS)'
        elif 'Animal and Plant Health Inspection Service' in names:
            doc = 'Notice (USDA APHIS)'
        elif 'Trade Representative, Office of United States' in names:
            doc = 'Notice (USTR / Commerce)'
        else:
            doc = 'Notice (Commerce)'
    return {'id': id_ or f'fr-{docnum}', 'publisher': 'Federal Register', 'citation': m['citation'], 'document': doc,
            'title': m['title'], 'signed': m.get('signing_date'), 'published': m['publication_date'], 'url': m['html_url']}


NEW_SOURCES = [
    {'id': 'hts-ch44', 'publisher': 'USITC', 'citation': 'HTSUS 2026 Revision 21, Chapter 44', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 44', 'signed': None, 'published': '2026-10-07', 'url': CH44},
    {'id': 'hts-2025r22-ch99', 'publisher': 'USITC', 'citation': 'HTSUS 2025 Revision 22, Chapter 99', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2025 Revision 22), Chapter 99 (U.S. notes 2(v)(iii) and 2(x)(iii))', 'signed': None,
     'published': '2025-09-08', 'url': CH99_25R22},
    # Softwood lumber from Canada (AD A-122-857 / CVD C-122-858)
    fr('2024-00330'), fr('2025-14298'), fr('2025-17453'), fr('2025-15306'), fr('2026-07153'), fr('2026-07154'), fr('2026-20857'),
    # Hardwood and decorative plywood (China, Indonesia, Vietnam) — 2025–2026 investigations
    fr('2025-11074'), fr('2025-11075'), fr('2026-14610'), fr('2026-14611'), fr('2026-14612'), fr('2026-14609'), fr('2026-14614'), fr('2026-14613'),
    fr('2026-18367'),
    # Certain hardwood plywood from China (2018 orders), Vietnam circumvention
    fr('2023-12028'), fr('2023-15431'), fr('2026-01389'),
    # Wood mouldings and millwork (China); multilayered wood flooring (China)
    fr('2026-13103'), fr('2026-03678'), fr('2023-14933'),
    # Section 232 wood: Korea and Taiwan deals (cabinets / upholstered furniture), EO 14257 (Annex II)
    fr('2025-21940'), fr('2026-10571'),
]
for sid in ['eo-14193', 'eo-14194', 'eo-14195', 'eo-14228', 'eo-14231', 'eo-14232', 'eo-14257', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14323',
            'eo-14325', 'eo-14326', 'eo-14357', 'eo-14389', 'csms-67834313', 'scotus-24-1287', 'procl-11012', 'ustr-usmca-review']:
    NEW_SOURCES.append(reuse[sid])
SRC = {s['id']: s for s in NEW_SOURCES}

d['asOf'] = TODAY
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 44 notes (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': '2020–2025 import figures'},
]

# ---------------------------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------------------------
NO_IEEPA = 'The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.'
SW_LINES = '4403.11, 4403.21–4403.26, 4403.99, 4406.11, 4406.91 and 4407.11–4407.19'

ov = d['overview']
ov['seo'] = {
    'title': 'HTS Chapter 44 Wood & Lumber Tariffs: Section 232 Softwood Lumber, Canada, Plywood | KoalaGains',
    'shortDescription': 'Searchable duty table for all 556 HTS Chapter 44 lines: logs, softwood and hardwood lumber, OSB, MDF, plywood, mouldings, doors, flooring, pallets and wood charcoal. Base rates, the 10% Section 232 softwood lumber duty, the 2026 Section 301 duties, Section 338 on Canada, and the lumber and plywood AD/CVD cases.',
    'keywords': ['HTS Chapter 44', 'lumber tariffs', 'softwood lumber tariff', 'lumber tariffs canada', 'section 232 lumber tariffs', 'tariffs on wood products',
                 'plywood tariffs', 'hs code 4407', 'hs code 4412', 'wood charcoal hs code', 'forest products tariff'],
}
ov['intro'] = (
    'Chapter 44 covers wood and articles of wood: fuel wood and pellets (4401), wood charcoal (4402), logs (4403), sawn lumber (4407), veneer (4408), '
    'mouldings and flooring strips (4409), particle board and OSB (4410), fiberboard and MDF (4411), plywood (4412), frames, pallets, barrels, tools, '
    'builders\' joinery such as doors, windows and engineered flooring (4418), kitchenware (4419), ornaments (4420) and other wooden articles (4421). '
    'The U.S. imported **$23.21B** of these goods in 2025, 44% from Canada. Most lines are **Free** at base; **200 of 556** lines carry a base rate, '
    'mostly 3.2% to 8% on plywood, joinery and wooden articles.\n\n'
    'Since **October 14, 2025**, softwood timber and lumber (15 provisions in 4403, 4406 and 4407.11–4407.19) pay a **10% Section 232 duty** from '
    'every country, including Canada and Mexico with a USMCA claim; for those lines it replaces the 2026 Section 301 and Brazil duties. Canadian '
    'softwood lumber also pays **antidumping and countervailing duties** (35.16% combined for most exporters), so it carries about 45% in all. '
    'Most other lines pay the **2026 Section 301 duty** of 10% or 12.5% from the 60 listed economies (tropical woods are exempt), **Brazil** adds 25%, '
    '**China** pays 25% under List 3 (7.5% for 11 List 4A lines) plus 12.5%, and **154 Canadian** lines, including most plywood, MDF, mouldings and doors, '
    'pay **50% under Section 338** since August 22, 2026, even with a USMCA claim. Hardwood plywood is also under AD/CVD orders on China and new '
    'cases on China, Indonesia and Vietnam. Wooden kitchen cabinets, vanities and upholstered furniture fall in Chapter 94, not here.'
)
ov['stats'][2]['note'] = ('2026 Section 301: 525 (tropical woods exempt; softwood lumber pays Section 232 instead); China List 3 or 4A: 529; Brazil 25%: 456; '
                          'Section 338 on Canada: 154; Section 232 softwood: 106; Russia 35%: 144. USMCA goods are exempt from the 2026 Section 301 duty only.')

GROUPS = {
    '4401': ('Fuel wood, wood chips, sawdust & wood pellets', 'Fuel wood & pellets',
             'Fuel wood, wood chips, sawdust and wood waste, and pellets or briquettes of it: 13 lines, all Free. They pay the 10% or 12.5% 2026 Section 301 duty from the 60 listed economies (USMCA goods exempt); Canadian nonconiferous fuel wood (4401.12) pays 50% under Section 338.',
             ['wood pellets', 'firewood', 'wood chips', 'sawdust', 'wood briquettes']),
    '4402': ('Wood charcoal, incl. shell & bamboo charcoal', 'Wood charcoal',
             'Wood charcoal, including bamboo and coconut-shell charcoal, agglomerated or not: 3 lines, all Free. Lump and briquette charcoal of 4402.90 from Canada pays 50% under Section 338; activated charcoal is heading 3802, not here.',
             ['wood charcoal', 'lump charcoal', 'charcoal briquettes', 'bamboo charcoal', 'coconut shell charcoal']),
    '4403': ('Logs and wood in the rough', 'Logs',
             'Logs and roughly squared wood, by species: 85 lines, all Free. Coniferous logs (4403.11, 4403.21–4403.26) and 4403.99 pay the 10% Section 232 duty; teak and other tropical logs and eucalyptus logs are exempt from the 2026 Section 301 duty.',
             ['logs', 'pine logs', 'oak logs', 'teak logs', 'timber']),
    '4404': ('Hoopwood, split poles, stakes & sticks', 'Hoopwood & stakes',
             'Hoopwood, split poles, pointed stakes and roughly trimmed sticks: 6 lines, all Free. Only the 2026 Section 301, Brazil and China duties reach them.',
             ['wooden stakes', 'split poles', 'hoopwood']),
    '4405': ('Wood wool (excelsior) & wood flour', 'Wood wool & flour',
             'Wood wool (excelsior) and wood flour: one line at 3.2%.',
             ['wood flour', 'wood wool', 'excelsior']),
    '4406': ('Railway sleepers (cross-ties)', 'Railway ties',
             'Wooden railway and tramway sleepers (cross-ties): 4 lines, all Free. Coniferous ties (4406.11, 4406.91) pay the 10% Section 232 duty.',
             ['railroad ties', 'cross ties', 'railway sleepers']),
    '4407': ('Sawn lumber: softwood, hardwood & tropical', 'Lumber',
             'Wood sawn or chipped lengthwise, over 6 mm thick: 74 lines, all Free. Softwood lumber (4407.11 pine, 4407.12 fir and spruce, 4407.13 S-P-F, 4407.14 hem-fir, 4407.19 other) pays the 10% Section 232 duty from every country, and Canadian softwood lumber also pays AD/CVD. Hardwood lumber pays the 2026 Section 301 duty; tropical lumber is exempt.',
             ['softwood lumber', 'SPF lumber', 'pine lumber', 'hardwood lumber', 'oak lumber', 'tropical lumber']),
    '4408': ('Veneer sheets', 'Veneer',
             'Veneer and sheets for plywood, up to 6 mm thick: 27 lines, all Free. Tropical veneer (4408.31, 4408.39) is exempt from the 2026 Section 301 duty; Canadian coniferous veneer (4408.10) pays 50% under Section 338.',
             ['wood veneer', 'veneer sheets', 'face veneer', 'rotary veneer']),
    '4409': ('Mouldings, flooring strips & continuously shaped wood', 'Mouldings',
             'Wood continuously shaped along an edge or face: mouldings, tongue-and-groove boards, unassembled flooring strips: 47 lines, Free to 4.9%. Wood mouldings and millwork from China are under AD/CVD orders, and several Canadian coniferous moulding lines pay 50% under Section 338.',
             ['wood moulding', 'trim', 'tongue and groove', 'wood flooring strips', 'decking boards']),
    '4410': ('Particle board & OSB', 'OSB & particle board',
             'Particle board, oriented strand board (OSB) and waferboard: 11 lines, all Free. Canadian OSB is Free with a USMCA claim; Canadian "other" board of 4410.19 pays 50% under Section 338.',
             ['OSB', 'oriented strand board', 'particle board', 'chipboard', 'waferboard']),
    '4411': ('Fiberboard & MDF', 'Fiberboard & MDF',
             'Fiberboard of wood, including MDF and hardboard: 36 lines, Free to 6% (some at 1.9¢/kg + 1.5%). Composite panels must meet EPA\'s TSCA Title VI formaldehyde limits; Canadian MDF over 5 mm pays 50% under Section 338.',
             ['MDF', 'medium density fiberboard', 'hardboard', 'HDF', 'fiberboard']),
    '4412': ('Plywood, LVL & veneered panels', 'Plywood',
             'Plywood, veneered panels, LVL and blockboard: 123 lines, Free to 8%. The group with the most trade remedies: AD/CVD orders on hardwood plywood from China (and Chinese-core plywood finished in Vietnam), new final determinations on China, Indonesia and Vietnam, and 50% Section 338 on most Canadian plywood.',
             ['plywood', 'hardwood plywood', 'birch plywood', 'LVL', 'marine plywood', 'veneered panels']),
    '4413': ('Densified wood', 'Densified wood',
             'Densified wood in blocks, plates, strips or profiles: one line at 3.7%. From Canada it pays 50% under Section 338 (9903.03.12).',
             ['densified wood', 'compressed wood']),
    '4414': ('Wooden picture & mirror frames', 'Frames',
             'Wooden frames for paintings, photographs and mirrors: 2 lines at 3.9%.',
             ['picture frames', 'wooden frames', 'mirror frames']),
    '4415': ('Pallets, crates, boxes & cable drums', 'Pallets & crates',
             'Packing cases, boxes, crates, cable drums, pallets and pallet collars: 5 lines, Free or 10.7%. Wood packaging used to ship any goods must be ISPM 15 treated and marked.',
             ['wooden pallets', 'wooden crates', 'wooden boxes', 'cable drums', 'pallet collars']),
    '4416': ('Barrels, casks & staves', 'Barrels',
             'Casks, barrels, vats, tubs and staves: 10 lines, Free or 3.2%.',
             ['wine barrels', 'whiskey barrels', 'oak staves', 'casks']),
    '4417': ('Tools, tool handles & shoe lasts', 'Tools & handles',
             'Wooden tools, tool bodies and handles, broom and brush bodies and handles, and shoe lasts and trees: 5 lines, Free or 5.1%.',
             ['tool handles', 'broom handles', 'shoe trees']),
    '4418': ('Builders\' joinery: doors, windows, flooring, glulam', 'Joinery',
             'Builders\' joinery and carpentry: windows, doors, formwork, shingles and shakes, posts and beams, glulam, CLT, I-joists and assembled flooring panels: 45 lines, Free to 8%. Multilayered wood flooring from China is under AD/CVD orders, and Canadian wooden doors pay 50% under Section 338.',
             ['wood doors', 'engineered wood flooring', 'glulam', 'cross laminated timber', 'cedar shingles', 'windows']),
    '4419': ('Wooden tableware & kitchenware', 'Kitchenware',
             'Wooden tableware and kitchenware such as cutting boards, chopsticks, bowls and utensils: 8 lines, 3.2% or 5.3%. Wooden handicrafts from China must be treated and tagged under APHIS rules.',
             ['cutting board', 'chopsticks', 'wooden spoons', 'bamboo utensils', 'wooden bowls']),
    '4420': ('Wood marquetry, jewelry boxes & ornaments', 'Ornaments & boxes',
             'Marquetry and inlaid wood, jewelry and cutlery boxes, statuettes and ornaments, and small wooden furniture not in Chapter 94: 8 lines, Free to 4.3%.',
             ['wooden statues', 'jewelry box', 'wood carvings', 'wooden ornaments']),
    '4421': ('Other articles of wood', 'Other articles',
             'Other wooden articles: hangers, spools, toothpicks, skewers, dowels, edge-glued lumber, pickets, wooden blinds and more: 42 lines, Free to 10.7% or 6.5¢ per gross. Wood mouldings and millwork from China can enter here and stay under the AD/CVD orders.',
             ['clothes hangers', 'toothpicks', 'dowels', 'skewers', 'wooden blinds', 'edge-glued lumber']),
}
for g in ov['productGroups']:
    label, short, blurb, ex = GROUPS[g['heading']]
    g['label'], g['blurb'], g['searchExamples'] = label, blurb, ex
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = GROUPS[g['heading']][0], GROUPS[g['heading']][1]

ov['workedExamples'] = [
    {'title': '$100,000 of S-P-F softwood lumber from Canada', 'line': '4407.13.00.00',
     'body': 'Softwood lumber is **Free** at base. Since October 14, 2025 it pays the **10% Section 232 duty** (9903.76.01), with or without a USMCA claim: **$10,000**. It also pays the antidumping and countervailing duty cash deposits on softwood lumber from Canada. For the companies not individually examined in the latest completed reviews these are **20.53% AD** (90 FR 44035) and **14.63% CVD** (90 FR 38755): another **$35,160**, so about **$45,160** in all. Canfor (35.47% + 12.12%) and West Fraser (9.65% + 16.82%) have their own rates. The tariff calculator shows the 10% only.'},
    {'title': '$100,000 of hardwood-faced plywood from Vietnam', 'line': '4412.33.32.85',
     'body': 'Plywood with a non-coniferous outer ply of 4412.33.32 has an **8%** base rate, and the 2026 Section 301 duty on Vietnam (9903.05.84) adds **12.5%**: **$20,500**. Hardwood and decorative plywood from Vietnam is also covered by Commerce\'s final AD (90.12%) and CVD (47.68% for most exporters) determinations of July 21, 2026, and the ITC found injury on September 9, 2026. The orders had not been published by October 13, 2026; once they are, cash deposits at those rates add **$137,800**. Plywood finished in Vietnam from Chinese veneers or cores is covered by the 2018 China orders.'},
    {'title': 'MDF and OSB from Canada', 'line': '4411.14.90.90',
     'body': 'MDF over 9 mm thick of 4411.14.90 has a **3.9%** base rate, which a USMCA claim removes. Since August 22, 2026 it is on the Section 338 list (U.S. note 51(b)(3), 9903.03.14), so Canadian MDF pays **50%** even with a USMCA claim, or 3.9% + 50% + 10% (2026 Section 301) = **63.9%** without one. Canadian OSB (4410.12) is not on the list: **Free** with USMCA, 10% without.'},
    {'title': '$10,000 of wooden articles from China', 'line': '4421.99.98.80',
     'body': 'Other articles of wood of 4421.99.98 pay **3.3%** base, **25%** under Section 301 List 3 (9903.88.03) and **12.5%** under the 2026 Section 301 action (9903.05.31): **40.8%**, or **$4,080**. Wooden handicrafts over 1 cm in diameter from China must also be heat-treated or fumigated and tagged with the manufacturer\'s name under 7 CFR 319.40-5(o).'},
    {'title': 'Spruce lumber from Germany or Sweden', 'line': '4407.12.00.18',
     'body': 'European fir and spruce lumber is **Free** at base and pays the **10% Section 232 duty** (9903.76.01). Proclamation 10976 caps EU wood at 15% including the base rate, which a 10% duty on a Free line stays under. The EU\'s 10% 2026 Section 301 rate (9903.05.39) does not apply on top (U.S. note 52(f)), so the total is **10%**. EU hardwood lumber pays the 10% Section 301 rate instead.'},
]
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '4407.13', 'label': 'S-P-F (spruce, pine and fir) softwood lumber'},
    {'hts': '4410.12', 'label': 'Oriented strand board (OSB)'},
    {'hts': '4412.33', 'label': 'Plywood with a hardwood (birch, maple, oak and similar) outer ply'},
]
ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover, among others: wood of a kind used in perfumery or pharmacy (1211); bamboo and other plaiting materials in the rough (1401); '
        'activated charcoal (3802); articles of heading 4202; goods of chapter 46; footwear (64); umbrellas and walking sticks (66); goods of 6808; imitation jewelry (7117); '
        'goods of section XVI or XVII (machine parts, cases and cabinets for machines, wheelwrights\' wares); clock cases and musical instruments (XVIII); parts of firearms (9305); '
        'articles of chapter 94 (furniture, luminaires, prefabricated buildings); toys and sports equipment (95); articles of chapter 96 other than wooden bodies and handles for brooms and brushes (9603); '
        'and works of art (97).\n\n'
        '**Note 2.** "Densified wood" is wood chemically or physically treated to increase its density or hardness and its mechanical strength or resistance.\n\n'
        '**Note 3.** Headings 4414 to 4421 apply to articles of particle board, fiberboard, laminated wood or densified wood as they apply to articles of wood.\n\n'
        '**Note 4.** Products of 4410, 4411 or 4412 may be shaped as in 4409, curved, corrugated, perforated or cut to non-rectangular shapes, provided this does not give them the character of articles of other headings.\n\n'
        '**Note 5.** Heading 4417 does not cover tools whose working part is of a material in note 1 to chapter 82.\n\n'
        '**Note 6.** Subject to note 1, "wood" in a heading also covers bamboo and other woody materials.\n\n'
        '**Subheading notes.** Wood pellets (4401.31) are cylindrical, up to 25 mm in diameter and 100 mm long, with no more than 3% binder; wood briquettes (4401.32) have a minimum cross-section over 25 mm. '
        '"S-P-F" (4407.13) is wood from mixed stands of spruce, pine and fir, and "Hem-fir" (4407.14) from mixed stands of western hemlock and fir, in unknown proportions.'
    ),
    'additionalUsNotes': (
        '**1.** "Wood waste" is residual material from processing wood (scraps, shavings, sawdust, veneer clippings, slabs, edgings, cull pieces, veneer log cores), other than firewood; '
        '"standard wood moldings" are moldings worked to a pattern with the same cross-section throughout their length; "surface covered" (4411, 4412) means treated with preservatives, fillers, '
        'sealers, stains, paints or the like, or overlaid with paper, fabric, plastics or metal.\n\n'
        '**2.** Sawed lumber and timbers, wooden utility poles and bundles of shingles (other than red cedar shingles) need not be marked with their country of origin.\n\n'
        '**3.** Heading 4409 includes articles with a repeating design worked along any edge or face.\n\n'
        '**4.** Heading 4418 includes drilled or notched lumber studs and multi-layer assembled flooring panels with a face ply 4 mm or more thick.\n\n'
        '**Statistical note 1.** For heading 4407, "rough" includes wood that has been edged, resawn, crosscut or trimmed, but not wood dressed by planing or edge- or end-glued.'
    ),
}

# ---------------------------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['seo'] = {
    'title': 'Lumber & Wood Tariff Updates 2025–2026: Section 232, Canada, Plywood AD/CVD (HTS Ch. 44) | KoalaGains',
    'shortDescription': 'What changed for U.S. lumber, plywood and wood product imports since January 2025: the 10% Section 232 softwood lumber duty, the IEEPA duties and their end, Section 122, the 2026 Section 301 and Brazil duties, Section 338 on Canada, and the softwood lumber and hardwood plywood AD/CVD cases, with Federal Register citations.',
    'keywords': ['lumber tariffs 2026', 'softwood lumber tariffs', 'canadian lumber tariffs 2026', 'section 232 lumber tariffs', 'softwood lumber duties',
                 'hardwood plywood antidumping', 'section 338 canada', 'forest products tariff', 'tariffs on wood products'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** '
    '(in force October 9, 2026). The base rates of all 555 lines that exist in both are unchanged; 4420.19.00 (other statuettes and ornaments, 3.2%) '
    'is new in the current edition.\n\n'
    'The extra duties changed a lot. In 2025 the IEEPA tariffs reached wood in stages: non-USMCA goods of Canada and Mexico paid 25% (Canada 35% from August 1), '
    'Brazil paid 40%, and the reciprocal tariff hit wooden articles of 4414–4421, while logs, lumber, panels and plywood of 4401–4413 were exempt under Annex II '
    'pending the Section 232 timber investigation. On **October 14, 2025** the **Section 232** duty took effect: **10% on softwood timber and lumber** from every '
    'country, and the rest of Chapter 44 lost its reciprocal-tariff exemption. All IEEPA duties **ended on February 24, 2026**; the 10% Section 122 surcharge '
    'that replaced them expired on **July 23, 2026**.\n\n'
    'Today five measures apply: the **10% Section 232** duty on softwood, the **2026 Section 301 duties** on 60 economies (from July 24, 2026; tropical woods '
    'exempt), **Brazil\'s 25% Section 301 duty** (from July 22, 2026), **Section 338 at 50%** on 154 Canadian lines (from August 22, 2026), and China\'s '
    'Section 301 **List 3 and 4A** duties. Antidumping and countervailing duties on **softwood lumber from Canada**, **hardwood plywood**, **wood mouldings** '
    'and **multilayered wood flooring from China** are listed below for reference and are **not included in the tariff calculator**.'
)
tu['scope'] = ('Chapter 99 measures that reach Chapter 44 from any country (Section 232 timber and lumber, 2026 Section 301 on 60 economies, Brazil Section 301, '
               'Section 338 on Canada, China Section 301 Lists 3 and 4A, Russia; the ended IEEPA and Section 122 duties), and the antidumping and countervailing '
               'duty orders and investigations on Chapter 44 goods, which the tariff calculator does not model. For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '555 of 556 lines', 'note': '4420.19.00 is new (3.2%)'},
    {'label': 'Extra-duty programs in effect', 'value': '5', 'note': 'Section 232, 2026 Section 301, Brazil 301, Canada Section 338, China Lists 3/4A'},
    {'label': 'Section 232 softwood', 'value': '10%', 'note': 'All countries, since October 14, 2025'},
    {'label': 'Softwood lumber AD/CVD (Canada)', 'value': '35.16%', 'note': 'Combined cash deposit for most exporters'},
]

S301 = ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now']
EXC_52B = ('Tropical logs, lumber and veneer of 4403.42, 4403.49, 4403.98 (eucalyptus), 4407.21–4407.29, 4407.99.02.95, 4408.31 and 4408.39 are on the general '
           'exemption list in U.S. note 52(b) (9903.05.86); eucalyptus plywood of 4412.33.57 matching the note 52(c) description is exempt on the importer\'s '
           'confirmation (9903.05.87). The 15 Section 232 softwood provisions pay the 10% Section 232 duty instead (note 52(f)).')
EXC_52J = ('Its country list in note 52(j) also exempts meranti logs (4403.41), tropical continuously shaped wood (4409.22) and tropical plywood, LVL and '
           'blockboard of 4412.31, 4412.41, 4412.51 and 4412.91.')
tu['inEffect'] = [
    {'id': 'all-section-232', 'country': 'All countries (including Canada and Mexico)', 'measure': 'Section 232 (timber, lumber and wood products)', 'ch99Code': '9903.76.01',
     'before': 'None', 'now': '+10% on softwood timber and lumber',
     'exemption': f'Applies to the 15 provisions in U.S. note 37(b): {SW_LINES} (106 statistical lines). There is no USMCA or FTA exemption: note 37(a) collects it on top of any special rate. For the UK the duty may not exceed 10%, and for the EU and Japan base rate plus duty may not exceed 15% (Proclamation 10976 clause 7), which a 10% duty on these Free lines meets. Goods under 9903.76.01 do not pay the 2026 Section 301 or Brazil duties (notes 52(f), 50(a)(vi)), and no softwood line is on a Section 338 list (note 51). Antidumping and countervailing duties still apply. Wooden kitchen cabinets, vanities and upholstered furniture (Chapter 94) pay 25% under 9903.76.02–9903.76.03 (UK 10%, EU, Japan, South Korea and Taiwan 15% all-in), rising to 30% and 50% on January 1, 2027 (Proclamation 11000); no Chapter 44 line is on those lists.',
     'whatItMeans': 'Softwood lumber, logs and ties pay 10% of value from every supplier. For Canadian softwood lumber the 10% comes on top of about 35% in AD/CVD cash deposits. Hardwood lumber, plywood, OSB and other wood products pay no Section 232 duty.',
     'effectiveFrom': '2025-10-14', 'effectiveSourceId': 'procl-10976', 'sourceIds': ['procl-10976', 'procl-11000', 'hts-chapter-99', 'hts-now']},
    {'id': 'ca-section-338', 'country': 'Canada', 'measure': 'Section 338 (Proclamations 11046 and 11048)', 'ch99Code': '9903.03.12 / 9903.03.14',
     'before': 'None', 'now': '+50% on 154 lines',
     'exemption': 'Reaches 148 lines in the U.S. note 51(b)(3) list (9903.03.14), including nonconiferous fuel wood (4401.12), lump charcoal (4402.90), other hardwood lumber (4407.99.02), coniferous veneer (4408.10), coniferous mouldings (4409.10.40–.90) and other hardwood shaped wood (4409.29.91), particle board other than OSB (4410.19), MDF (4411.13, 4411.14), most plywood, LVL and blockboard (4412), frames (4414.90), wooden doors (4418.21.80, 4418.29.80), statuettes (4420.19) and pickets, edge-glued lumber and other articles (4421.99.70–.98), and 6 lines in the note 51(b)(1) list (9903.03.12): densified wood (4413), other tableware (4419.90.91), other ornaments (4420.90.80) and bamboo articles (4421.91.60, 4421.91.70). Note 51(a) applies it even when USMCA is claimed. Softwood lumber and OSB are not listed. Proclamation 11056 moved the start from August 19 to August 22, 2026. It does not apply to goods properly entered under most Chapter 98 provisions.',
     'whatItMeans': 'Canadian plywood, MDF, doors, mouldings and the other listed lines pay half their value in duty with a USMCA claim, and 50% plus the base rate plus 10% without one. Canada shipped $404M of plywood and $370M of fiberboard to the U.S. in 2025.',
     'effectiveFrom': '2026-08-22', 'effectiveSourceId': 'procl-11056',
     'sourceIds': ['procl-11046', 'procl-11048', 'procl-11056', 'csms-69606660', 'procl-11064', 'procl-11065', 'csms-69851916', 'hts-chapter-99', 'hts-now']},
    {'id': 'ca-section-301', 'country': 'Canada', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.29', 'before': 'None', 'now': '+10% (USMCA goods exempt)',
     'exemption': 'Goods entered free under USMCA are exempt under U.S. note 52(g) (9903.05.93). ' + EXC_52B + ' ' + NO_IEEPA,
     'whatItMeans': 'Canadian OSB, hardwood lumber and wood products pay nothing extra with a USMCA claim and 10% without one. Softwood lumber pays the 10% Section 232 duty instead.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'mx-section-301', 'country': 'Mexico', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.55', 'before': 'None', 'now': '+10% (USMCA goods exempt)',
     'exemption': 'Goods entered free under USMCA are exempt under U.S. note 52(h) (9903.05.94). ' + EXC_52B + ' ' + NO_IEEPA,
     'whatItMeans': 'Mexican wooden articles, joinery, mouldings and charcoal are Free of extra duty with a USMCA claim and pay 10% plus the base rate without one.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'cn-list-3', 'country': 'China', 'measure': 'Section 301 tariff, Lists 3 and 4A (2018–2020)', 'ch99Code': '9903.88.03 / 9903.88.15', 'before': '+25% / +7.5%', 'now': '+25% / +7.5%',
     'exemption': 'List 3 (U.S. note 20(f)) covers 518 Chapter 44 lines at 25%; List 4A (note 20(r)) covers 11 lines at 7.5%: frames (4414), broom and paint-brush handles (4417.00.20, 4417.00.40), some kitchenware (4419.20.90, 4419.90.91), cigar boxes (4420.90.20) and some articles of 4421. No product exclusion for Chapter 44 is in effect. USTR confirmed on October 7, 2026 that the actions continue during the four-year review.',
     'whatItMeans': 'Chinese wood products pay 25% (or 7.5%) on top of the base rate and the 12.5% 2026 Section 301 duty; Chinese softwood lumber pays 25% plus the 10% Section 232 duty.',
     'effectiveFrom': '2019-05-10', 'effectiveSourceId': 'fr-2019-09681', 'sourceIds': ['fr-2018-20610', 'fr-2019-09681', 'fr-2019-17865', 'fr-2020-00904', 'fr-2026-20510', 'hts-chapter-99', 'hts-now']},
    {'id': 'cn-section-301', 'country': 'China', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.31', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_52B + ' Note 52(a) keeps the List 3 and 4A duties on top. The IEEPA duties on China ended February 24, 2026.',
     'whatItMeans': 'With List 3, most Chinese wood products pay 37.5% plus the base rate, for example 40.8% on other wooden articles of 4421.99.98. Hardwood plywood from China also faces AD/CVD orders.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'br-section-301-brazil', 'country': 'Brazil', 'measure': 'Section 301 (Brazil)', 'ch99Code': '9903.05.01', 'before': 'None', 'now': '+25%',
     'exemption': 'Tropical wood is on the exemption list in U.S. note 50(a)(ii) (9903.05.03): 4403.41, 4403.42, 4403.49, 4407.21–4407.29, 4407.99.02.95, 4408.31, 4408.39, 4409.22 and tropical plywood of 4412.31, 4412.41, 4412.51 and 4412.91. Section 232 softwood goods are exempt under note 50(a)(vi). The duty stacks with the 12.5% 2026 Section 301 duty on Brazil.',
     'whatItMeans': 'Brazilian pine mouldings, doors, plywood and other wood products pay 37.5% plus the base rate; Brazilian pine lumber pays the 10% Section 232 duty instead; tropical hardwood is Free of both.',
     'effectiveFrom': '2026-07-22', 'effectiveSourceId': 'fr-2026-14542', 'sourceIds': ['fr-2026-14542', 'hts-chapter-99', 'hts-now']},
    {'id': 'br-section-301', 'country': 'Brazil', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.27', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_52B + ' ' + NO_IEEPA,
     'whatItMeans': 'Applies to the same Brazilian goods as the 25% duty, plus a few tropical lines on the Brazil exemption list but not on note 52(b) (meranti logs, tropical mouldings and tropical plywood), which pay 12.5%.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'vn-section-301', 'country': 'Vietnam', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.84', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_52B + ' ' + NO_IEEPA,
     'whatItMeans': 'Vietnamese plywood pays 12.5% plus its 0% to 8% base rate, and hardwood and decorative plywood faces AD (90.12%) and CVD (47.68% for most exporters) once the orders are published.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'cl-section-301', 'country': 'Chile', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.30', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_52B + ' A U.S.–Chile FTA claim removes the base rate but not this duty. ' + NO_IEEPA,
     'whatItMeans': 'Chilean pine plywood, MDF and mouldings pay 12.5% (the FTA removes the base rate); Chilean pine lumber pays the 10% Section 232 duty instead.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'id-section-301', 'country': 'Indonesia', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.45', 'before': 'None', 'now': '+10%',
     'exemption': EXC_52B + ' ' + EXC_52J + ' (9903.06.16). ' + NO_IEEPA,
     'whatItMeans': 'Indonesian meranti and other tropical plywood pays only its base rate; other plywood, joinery and mouldings pay 10% plus the base rate. Hardwood and decorative plywood also faces AD (18.10%) and CVD (40.87%) for most exporters once the orders are published.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'eu-section-301', 'country': 'European Union (e.g. Germany, Sweden, Austria)', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.39',
     'before': 'None', 'now': '10% (in place of base rates under 10%)',
     'exemption': EXC_52B + ' No Chapter 44 line is on the EU list in note 52(j)(2). ' + NO_IEEPA,
     'whatItMeans': 'European softwood lumber pays the 10% Section 232 duty; European hardwood lumber, MDF, plywood and joinery pay 10% in all (10.7% on pallets of 4415.20.80, whose base rate is higher).',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'kh-my-section-301', 'country': 'Cambodia, Malaysia', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.28 / 9903.05.54', 'before': 'None', 'now': '+10%',
     'exemption': EXC_52B + ' ' + EXC_52J + ' (Cambodia 9903.06.02, Malaysia 9903.05.99). ' + NO_IEEPA,
     'whatItMeans': 'Tropical plywood from these countries pays only its base rate; other plywood, joinery and wood products pay 10% plus the base rate.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'nz-section-301', 'country': 'New Zealand', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.57', 'before': 'None', 'now': '+12.5%',
     'exemption': EXC_52B + ' ' + NO_IEEPA,
     'whatItMeans': 'New Zealand pine lumber, most of what it ships, pays the 10% Section 232 duty; its MDF and mouldings pay 12.5% plus the base rate.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'gb-jp-section-301', 'country': 'United Kingdom, Japan', 'measure': 'Section 301 (2026, 60 economies)', 'ch99Code': '9903.05.81 / 9903.05.49', 'before': 'None',
     'now': 'UK +10%; Japan 12.5% (in place of base rates under 12.5%)',
     'exemption': EXC_52B + ' ' + NO_IEEPA,
     'whatItMeans': 'British wood products pay 10% plus the base rate and Japanese ones 12.5% in all; softwood lumber from either pays only the 10% Section 232 duty.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
    {'id': 'ru-section-301', 'country': 'Russia', 'measure': 'Section 301 (2026, 60 economies) + Russia (rates in lieu of column 2)', 'ch99Code': '9903.05.66 / 9903.90.08',
     'before': 'Column 2 rates; 35% on 144 lines', 'now': 'Column 2 rates (35% on 144 lines) + 12.5%',
     'exemption': 'Russian goods pay the column 2 rates (general note 3(b)); 144 Chapter 44 lines in U.S. note 30(b) pay 35% in place of column 2 (9903.90.08). ' + EXC_52B,
     'whatItMeans': 'Russian plywood, the main Russian Chapter 44 good ($89M in 2025), pays its column 2 rate (for example 50% on birch-faced plywood of 4412.33.06) plus 12.5%.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'procl-10420', 'procl-10523', 'hts-now']},
    {'id': 'other-section-301', 'country': 'Other 2026 Section 301 economies (e.g. Thailand, India, Argentina, Ecuador)', 'measure': 'Section 301 (2026, 60 economies)',
     'ch99Code': '9903.05.20–9903.05.83', 'before': 'None', 'now': '+10% or +12.5% (for Switzerland, South Korea and Taiwan: 10% or 12.5% in place of lower base rates)',
     'exemption': EXC_52B + ' Switzerland, Guatemala, El Salvador, Argentina, Bangladesh, Taiwan, Ecuador and Jordan also have the tropical-wood country list of note 52(j). Countries outside the 60 economies pay no Section 301 duty. ' + NO_IEEPA,
     'whatItMeans': 'Most Chapter 44 goods from these economies pay 10% or 12.5% plus the base rate; softwood lumber pays the 10% Section 232 duty instead.',
     'effectiveFrom': '2026-07-24', 'effectiveSourceId': 'fr-2026-15181', 'sourceIds': S301},
]

C = []


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    C.append({'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
              'countries': countries, 'sourceIds': sids})


ch('base-rates', 'baseRate', TODAY, 'Checked', 'Chapter 44 base rates: no changes; one line added',
   'All 555 Chapter 44 tariff lines that are in both editions carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. '
   '4420.19.00.00 (statuettes and other ornaments of non-tropical wood, 3.2%) is not in the 2025 Basic Edition data and is in the current edition.',
   None, None, None, ['hts-before', 'hts-now', 'hts-now-cr'])
ch('softwood-cvd-panel', 'reference', '2026-10-05', 'Decided', 'NAFTA panel affirms Commerce on the 2017 softwood lumber CVD investigation',
   'A NAFTA Chapter 19 binational panel affirmed Commerce\'s second remand redetermination in the review of the original countervailing duty determination on softwood lumber from Canada (USA-CDA-2017-1904-02). The CVD order and current cash-deposit rates are unchanged.',
   None, None, 'Canada', ['fr-2026-20857'])
ch('hardwood-232-update', 'pending', '2026-10-01', 'Due', 'Section 232: update on hardwood timber and lumber was due',
   'Proclamation 10976 directed Commerce to update the President by October 1, 2026 on hardwood timber and lumber imports, so the President can decide whether to impose a duty on hardwood lumber and its derivatives. No proclamation had been published by October 13, 2026; hardwood lumber pays no Section 232 duty today.',
   None, None, 'All', ['procl-10976'])
ch('hdp-itc-final', 'pending', '2026-09-09', 'Published', 'Hardwood and decorative plywood: ITC finds injury; orders pending',
   'The ITC determined that imports of hardwood and decorative plywood (excluding softwood structural plywood) from China, Indonesia and Vietnam injure the U.S. industry, so Commerce will issue antidumping and countervailing duty orders at its final rates. The orders had not been published in the Federal Register by October 13, 2026. The ITC ended the cases on softwood structural plywood as negligible.',
   None, 'AD/CVD orders to follow', 'China, Indonesia, Vietnam', ['fr-2026-18367'])
ch('section-338-canada-2026-08-22', 'extraDuty', '2026-08-22', 'Effective', 'Section 338: 50% on 154 Canadian wood product lines',
   'Proclamations 11046 and 11048 (July 20, 2026) imposed a 50% duty on products of Canada in the lists of U.S. note 51(b)(1) (9903.03.12) and 51(b)(3) (9903.03.14). In Chapter 44 these cover 154 lines: most plywood, MDF, coniferous veneer and mouldings, particle board other than OSB, wooden doors, charcoal and several wooden articles. Softwood lumber and OSB are not listed. The duty applies even when USMCA is claimed. Proclamation 11056 moved the start from August 19 to August 22, 2026; Proclamations 11064 and 11065 changed the lists from September 15, 2026 without adding or removing Chapter 44 lines.',
   'None', '+50%', 'Canada', ['procl-11046', 'procl-11048', 'procl-11056', 'csms-69606660', 'procl-11064', 'procl-11065', 'csms-69851916', 'hts-chapter-99'])
ch('section-301-2026-60-economies-2026-07-24', 'extraDuty', '2026-07-24', 'Effective', '2026 Section 301 duties on 60 economies; tropical wood exempt',
   'The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect. In Chapter 44 they reach 525 of 556 lines: tropical logs, lumber and veneer are on the general exemption list (U.S. note 52(b)), eleven countries have tropical plywood and mouldings on their note 52(j) lists, and the 15 Section 232 softwood provisions pay that duty instead (note 52(f)). Canadian and Mexican goods entered under USMCA are exempt (notes 52(g)–(h)).',
   None, '+10% to +12.5%', '60 economies', ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99'])
ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
   'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.',
   '+10%', 'None', 'All', ['procl-11012', 'hts-chapter-99'])
ch('section-301-brazil-2026-07-22', 'extraDuty', '2026-07-22', 'Effective', 'Brazil Section 301: 25% on most Brazilian wood products',
   'The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. Tropical logs, lumber, veneer, mouldings and plywood are on its exemption list (U.S. note 50(a)(ii), 9903.05.03), and Section 232 softwood goods are exempt (note 50(a)(vi)), so it reaches 456 Chapter 44 lines, including Brazilian pine mouldings, doors and plywood.',
   'None', '+25%', 'Brazil', ['fr-2026-14542', 'hts-chapter-99'])
ch('hdp-commerce-final', 'reference', '2026-07-21', 'Published', 'Hardwood and decorative plywood: Commerce final AD/CVD determinations',
   'Commerce found dumping and subsidies on hardwood and decorative plywood. Antidumping: China 187.27% (China-wide entity), Indonesia 18.10% for all others (15.40% to 84.94% for named firms), Vietnam 90.12%. Countervailing: China 88.96%, Indonesia 40.87% for all others (4.22% to 128.66%), Vietnam 47.68% for all others (165.39% for one firm). The goods enter under 35 subheadings of 4412.',
   None, 'AD 18.10%–187.27%; CVD 40.87%–88.96% (all-others)', 'China, Indonesia, Vietnam',
   ['fr-2026-14610', 'fr-2026-14611', 'fr-2026-14612', 'fr-2026-14609', 'fr-2026-14614', 'fr-2026-14613'])
ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
   'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.',
   None, None, 'Canada, Mexico', ['ustr-usmca-review'])
ch('mouldings-continued', 'reference', '2026-06-30', 'Published', 'Wood mouldings and millwork from China: orders continued',
   'After five-year sunset reviews, Commerce continued the antidumping and countervailing duty orders on wood mouldings and millwork products from China (goods of 4409, 4412, 4418 and 4421). The China-wide antidumping cash-deposit rate is 220.87%.',
   None, None, 'China', ['fr-2026-13103', 'fr-2026-03678'])
ch('softwood-ar7-prelim', 'reference', '2026-04-14', 'Published', 'Softwood lumber from Canada: preliminary 2024 review rates',
   'In the 2024 administrative reviews Commerce preliminarily found AD rates of 16.85% (Canfor), 13.25% (Resolute), 4.77% (West Fraser) and 10.66% for non-examined companies, and CVD rates of 11.70% (Resolute), 15.93% (West Fraser) and 14.17% for non-selected companies. They become cash deposits only when the final results are published; none had been by October 13, 2026.',
   None, 'Preliminary: AD 10.66%, CVD 14.17% (non-selected)', 'Canada', ['fr-2026-07153', 'fr-2026-07154'])
ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
   'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Tropical logs, lumber and veneer (12 subheadings) were on its product exemption list (9903.03.03), Section 232 softwood goods were exempt (9903.03.06), and Canadian and Mexican goods entered under USMCA were exempt (9903.03.07, 9903.03.08).',
   'Varied by country', '+10% (ended)', 'All', ['procl-11012', 'hts-chapter-99'])
ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
   'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.',
   'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'])
ch('hp-china-review', 'reference', '2026-01-26', 'Published', 'Hardwood plywood from China (2018 orders): review results',
   'Commerce completed the 2023 administrative reviews of the 2018 AD and CVD orders on certain hardwood plywood from China. The China-wide antidumping cash-deposit rate is 114.72%. Since July 2023, hardwood plywood completed in Vietnam with Chinese face or back veneers or cores is also covered (circumvention determination, 88 FR 46740).',
   None, 'China-wide AD 114.72%', 'China, Vietnam', ['fr-2026-01389', 'fr-2023-12028', 'fr-2023-15431'])
ch('procl-11000', 'reference', '2025-12-31', 'Signed', 'Section 232 wood: increases on cabinets and upholstered furniture moved to 2027',
   'Proclamation 11000 moved the rise from 25% to 50% (kitchen cabinets and vanities) and to 30% (upholstered wooden furniture) from January 1, 2026 to January 1, 2027. These goods are in Chapter 94; the 10% on softwood timber and lumber is unchanged.',
   None, None, 'All', ['procl-11000'])
ch('section-301-nicaragua-scheduled-2027-01-01', 'pending', '2025-12-12', 'Announced', 'Section 301 tariff on Nicaragua phases in from 2027',
   'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every Chapter 44 line. The rate is 0% in 2026.',
   None, '+10% to +15%', 'Nicaragua', ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99', 'hts-now'])
ch('section-232-timber-lumber-wood-products-2025-10-14', 'extraDuty', '2025-10-14', 'Effective', 'Section 232: 10% on softwood timber and lumber',
   'Proclamation 10976 (September 29, 2025) imposed a 10% duty on softwood timber and lumber (9903.76.01: 106 Chapter 44 lines in 4403, 4406 and 4407.11–4407.19) from every country, with no USMCA exemption, and 25% on kitchen cabinets, vanities and upholstered wooden furniture of Chapter 94. The UK is capped at 10% and the EU and Japan at 15% including the base rate. Goods under these headings are not subject to the reciprocal, Brazil or Canada and Mexico IEEPA duties.',
   'None', '+10%', 'All', ['procl-10976', 'hts-chapter-99'])
ch('reciprocal-annex-ii-removed', 'extraDuty', '2025-10-14', 'Effective', 'Chapter 44 loses its reciprocal-tariff exemption',
   'Proclamation 10976 (clause 12) removed Chapter 44 from Annex II of Executive Order 14257, apart from a few lines on the aligned-partners annex of EO 14346 that are not subject to AD/CVD orders. From then until February 24, 2026, logs, hardwood lumber, panels and plywood other than the Section 232 softwood lines paid the reciprocal tariff.',
   'Exempt (4401–4413)', 'Reciprocal rate (ended)', 'All except Canada, Mexico', ['procl-10976', 'eo-14257'])
ch('softwood-ar6-final', 'reference', '2025-09-11', 'Published', 'Softwood lumber from Canada: current AD/CVD cash-deposit rates',
   'The 2023 administrative reviews set the cash deposits in force today: antidumping 35.47% (Canfor), 9.65% (West Fraser) and 20.53% for companies not individually examined (amended September 11, 2025); countervailing 12.12% (Canfor), 16.82% (West Fraser) and 14.63% for non-selected companies (August 12, 2025). Exporters never reviewed keep the investigation\'s 6.04% AD all-others rate. The orders date from January 2018 and were continued in January 2024.',
   None, 'AD 20.53% + CVD 14.63% = 35.16% (non-selected)', 'Canada', ['fr-2025-17453', 'fr-2025-14298', 'fr-2025-15306', 'fr-2024-00330'])
ch('reciprocal-country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country-specific reciprocal rates take effect',
   'Executive Order 14326 replaced the 10% baseline with country-specific reciprocal rates for many partners (for example 15% for the EU, all-inclusive). Wooden articles of 4414–4421 paid them; logs, lumber, panels and plywood stayed exempt under Annex II until October 14, 2025. Ended February 24, 2026.',
   '+10%', 'Country rates (ended)', 'All except Canada, Mexico', ['eo-14326'])
ch('brazil-ieepa-40', 'extraDuty', '2025-08-06', 'Effective', 'Brazil: 40% IEEPA duty on Chapter 44',
   'Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77). Its Annex I exceptions included only one Chapter 44 subheading, tropical sawn wood of 4407.29.02 (U.S. note 2(x)(iii)), so Brazilian pine lumber, mouldings, doors and plywood paid it. From October 14, 2025 Section 232 softwood goods were exempt. Ended February 24, 2026.',
   'None', '+40% (ended)', 'Brazil', ['eo-14323', 'hts-2025r22-ch99'])
ch('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
   'Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Most Canadian lumber and panels entered under USMCA and did not pay it. Ended February 24, 2026.',
   '+25%', '+35% (ended)', 'Canada', ['eo-14325'])
ch('hdp-initiation', 'reference', '2025-06-16', 'Published', 'AD/CVD investigations on hardwood and decorative plywood begin',
   'Commerce initiated antidumping and countervailing duty investigations on hardwood and decorative plywood from China, Indonesia and Vietnam, on a petition by the Coalition for Fair Trade in Hardwood Plywood.',
   None, None, 'China, Indonesia, Vietnam', ['fr-2025-11074', 'fr-2025-11075'])
ch('cn-ieepa', 'extraDuty', '2025-05-14', 'Effective', 'China IEEPA duties: reciprocal rate cut to 10%',
   'Chinese wood products paid IEEPA duties on top of Section 301: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November 10, 2025) and, on goods not in Annex II, a reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. All ended February 24, 2026.',
   '+125% reciprocal', '+10% reciprocal (ended)', 'China', ['eo-14195', 'eo-14228', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14357'])
ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff: lumber and panels exempt, wooden articles covered',
   '10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025. Annex II (U.S. note 2(v)(iii)) exempted almost all of 4401–4413 (logs, lumber, veneer, mouldings, OSB, MDF, plywood), pending the Section 232 timber investigation; wooden articles of 4414–4421 paid it. Ended February 24, 2026.',
   'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257', 'hts-2025r22-ch99'])
ch('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
   'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA wood products kept paying. Ended February 24, 2026.',
   '+25%', '+25%, USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232'])
ch('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
   '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including lumber, panels and wood products. Ended February 24, 2026.',
   'None', '+25% (ended)', 'Canada, Mexico', ['eo-14193', 'eo-14194'])
tu['changes'] = C

have = {s['id'] for s in tu['sources']}
for s in NEW_SOURCES:
    if s['id'] not in have:
        tu['sources'].append(s)
        have.add(s['id'])

# ---------------------------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 44: Wood and Articles of Wood; Wood Charcoal — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Lumber & Wood Imports by Country: Canada, China, Brazil, Vietnam (HTS Ch. 44) | KoalaGains',
    'shortDescription': 'Where U.S. lumber, plywood, OSB and wood product imports come from, 2020–2025: $23.21B in 2025, 44% from Canada; softwood lumber, OSB and plywood lead. By country, by product and over time, from UN Comtrade.',
    'keywords': ['lumber imports by country', 'us lumber imports', 'lumber imports from canada', 'wood imports by country', 'plywood imports',
                 'lumber imports from china', 'HTS Chapter 44 import statistics'],
}
for s in ui['stats']:
    if s['label'] == 'Largest product':
        s['note'] = 'S-P-F softwood lumber (4407.13)'
ui['why'] = (
    'U.S. imports of Chapter 44 goods were **$23.21B in 2025**, down 5.3% from $24.51B in 2024 and far below the 2021–2022 peak of about $36B, when lumber prices '
    'spiked. **Canada** supplied $10.16B (44%): softwood and other lumber ($4.92B), OSB and particle board ($1.83B), builders\' joinery ($1.49B), plywood ($404M) '
    'and fiberboard ($370M). **China** ($1.61B, down 25.8%) ships mostly wooden articles, ornaments and kitchenware; **Brazil** ($1.48B) pine mouldings, doors, '
    'plywood and lumber; **Vietnam** ($1.38B, up 24.6%), **Indonesia** ($970M) and **Cambodia** ($445M) mainly plywood; **Chile** ($1.14B) plywood, MDF and pine '
    'lumber; and **Germany** ($932M), **Sweden** ($453M) and **New Zealand** ($269M) mainly softwood lumber.\n\n'
    'By product, softwood lumber leads: S-P-F lumber (4407.13) alone was $3.88B, and the 15 Section 232 softwood provisions together $7.08B (31% of the chapter). '
    'OSB (4410.12) fell 23.7% to $1.70B, while plywood with a hardwood face (4412.33) rose 21.2% to $1.69B, as imports shifted to Vietnam and Indonesia, which now '
    'face antidumping and countervailing duty cases. Wood charcoal (4402) was $115M, more than half from Mexico.\n\n'
    '2025 is the latest full year of U.S. trade data. The 10% Section 232 duty started on October 14, 2025, so the 2025 figures show only its first weeks; the 2026 '
    'Section 301, Brazil and Section 338 duties are not yet visible. Duty-collected figures aren\'t available from an official source yet.'
)
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
    'title': 'Lumber & Wood Tariff Rates by Country: Canada, China, Brazil, Vietnam, Chile (HTS Ch. 44) | KoalaGains',
    'shortDescription': 'The total U.S. tariff on lumber, panels, plywood and wood products by country and product group: 10% Section 232 on softwood from everyone, 50% Section 338 on Canadian plywood and MDF, 37.5% on most Brazilian and Chinese wood products, 10% to 12.5% plus base from the other Section 301 economies.',
    'keywords': ['lumber tariffs canada', 'canadian lumber tariff rate', 'tariff on wood from china', 'brazil tariffs on wood products', 'vietnam plywood tariff',
                 'wood tariffs by country', 'canadian plywood tariff'],
}
ia['intro'] = (
    'Each cell below is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. '
    'Antidumping and countervailing duties are **not** included, and they matter here: Canadian softwood lumber carries about 35% in AD/CVD on top of the totals shown, '
    'and hardwood plywood from China, and soon from Indonesia and Vietnam, carries much higher rates.\n\n'
    'Three things drive the totals. **Softwood lumber, logs and ties** pay the **10% Section 232 duty** from every country, which replaces the Section 301 and Brazil duties on '
    'those lines, so the lumber column shows 10% even for Canada with USMCA. **Canada** pays nothing extra on OSB, hardwood lumber and joinery with a USMCA claim, but '
    '**50% under Section 338** on most plywood, MDF, doors and mouldings, claim or not. Everyone else pays the **2026 Section 301** duty (10% or 12.5%; EU and Japan in place '
    'of lower base rates) on top of base rates up to 8%, with **tropical woods exempt**; **Brazil** adds 25% and **China** 25% (List 3).'
)
LABELS = {
    'Canada': 'Softwood lumber, logs and ties: +10% Section 232 (9903.76.01), with or without USMCA, plus AD/CVD not shown. 154 lines (most plywood, MDF, coniferous mouldings and veneer, doors, charcoal): +50% Section 338 (9903.03.14 / 9903.03.12) even with USMCA. Other lines: Free with USMCA (note 52(g), 9903.05.93), +10% without (9903.05.29). The 2025 IEEPA duty (35%) ended February 24, 2026.',
    'China': 'Base rate + 25% Section 301 List 3 (9903.88.03; 7.5% List 4A on 11 lines) + 12.5% 2026 Section 301 (9903.05.31), except tropical woods (note 52(b)). Softwood lumber: 25% + 10% Section 232 = 35%. Hardwood plywood, mouldings and multilayered flooring also carry AD/CVD, not shown. The IEEPA duties ended February 24, 2026.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27) = 37.5% plus base on most lines. Tropical wood (note 50(a)(ii)) pays neither or only 12.5%. Pine lumber and other Section 232 softwood: 10% only. The 2025 IEEPA duties (40% and 10%) ended February 24, 2026.',
    'Vietnam': 'Base rate + 12.5% (9903.05.84), except tropical woods (note 52(b)); softwood lumber 10% Section 232. Hardwood and decorative plywood: AD 90.12% and CVD 47.68% pending orders, and Chinese-core plywood under the China orders, not shown.',
    'Chile': 'U.S.–Chile FTA removes the base rate; +12.5% 2026 Section 301 (9903.05.30) on every line except tropical woods; softwood lumber 10% Section 232 instead.',
    'Indonesia': 'Base rate + 10% (9903.05.45), except tropical woods (note 52(b)) and its note 52(j) list (9903.06.16): meranti logs, tropical mouldings and tropical plywood, which pay only the base rate. Hardwood and decorative plywood: AD 18.10% and CVD 40.87% (all others) pending orders, not shown.',
    'Germany': 'EU: 10% in place of base rates under 10% (9903.05.39) on every line except tropical woods; softwood lumber 10% Section 232 (EU cap of 15% all-in met). The 15% IEEPA reciprocal rate ended February 24, 2026.',
    'Mexico': 'Softwood lumber and ties: +10% Section 232 with or without USMCA. Other lines: Free with USMCA (note 52(h), 9903.05.94), +10% plus base without (9903.05.55).',
    'Sweden': 'EU: 10% in place of base rates under 10% (9903.05.39) on every line except tropical woods; softwood lumber, most of what Sweden ships, 10% Section 232.',
    'Cambodia': 'Base rate + 10% (9903.05.28), except tropical woods (note 52(b)) and its note 52(j) list (9903.06.02): meranti logs, tropical mouldings and tropical plywood pay only the base rate.',
    'Malaysia': 'Base rate + 10% (9903.05.54), except tropical woods (note 52(b)) and its note 52(j) list (9903.05.99): meranti logs, tropical mouldings and tropical plywood pay only the base rate.',
    'New Zealand': 'Base rate + 12.5% (9903.05.57), except tropical woods; softwood lumber, most of what New Zealand ships, pays 10% Section 232 instead.',
    'United Kingdom': 'Base rate + 10% (9903.05.81), except tropical woods; softwood lumber 10% Section 232 (the UK cap of 10% is met).',
    'Japan': '12.5% in place of base rates under 12.5% (9903.05.49) on every line except tropical woods; softwood lumber 10% Section 232 (Japan cap of 15% all-in met).',
    'Any other country': 'Countries outside the 60 Section 301 economies pay the base rate, plus 10% Section 232 on softwood lumber. Other Section 301 economies (e.g. Thailand, India, Argentina) pay 10% or 12.5% on top. Russia pays column 2 rates (35% on 144 lines) plus 12.5%; Nicaragua\'s separate Section 301 duty (9903.89.01) is 0% until January 1, 2027. Myanmar and the British Virgin Islands are counted here.',
}
for c in ia['countries']:
    c['rule']['label'] = LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'][1] = 'Ranges like "Free · 12.5%" mean the group has lines with different totals; select a cell to see which lines carry which rate.'
ia['assumptions'] += [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'Section 232 (9903.76.01) applies to the 15 softwood provisions on both sides of the Canada and Mexico rows, because U.S. note 37(a) has no USMCA exemption; for those lines it replaces the 2026 Section 301 and Brazil duties (notes 52(f), 50(a)(vi)).',
    'Section 338 (9903.03.12, 9903.03.14) applies on both sides of the Canada row, because U.S. note 51(a) charges it even when USMCA is claimed.',
    'Antidumping and countervailing duties are not included: softwood lumber from Canada (35.16% combined for most exporters), certain hardwood plywood from China (2018 orders, also covering Chinese-core plywood finished in Vietnam), hardwood and decorative plywood from China, Indonesia and Vietnam (final determinations; orders pending), wood mouldings and millwork and multilayered wood flooring from China.',
    'Agency entry rules (Lacey Act declaration, APHIS wood import rules, ISPM 15, CITES, TSCA Title VI) do not change the duty and are listed on the Tariff engineering page.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 29, 30, 37, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) lists 14 Chapter 44 provisions: tropical logs '
    '(4403.42, 4403.49), eucalyptus logs (4403.98), tropical lumber (4407.21–4407.29, 4407.99.02.95) and tropical veneer (4408.31, 4408.39); note 52(c) (9903.05.87) names '
    'eucalyptus plywood of 4412.33.57 by description; the country lists in note 52(j) (Switzerland, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Bangladesh, '
    'Taiwan, Indonesia, Ecuador, Jordan) each add 27 tropical provisions of 4403.41, 4409.22, 4412.31, 4412.41, 4412.51 and 4412.91. The Brazil exemption list (note 50(a)(ii)) '
    'covers 40 of these provisions (all but eucalyptus logs, 4403.98). Note 37(b) lists the 15 Section 232 softwood provisions; note 51(b)(1) and (b)(3) list 154 Chapter 44 lines for Section 338. '
    'China Section 301 List 3 (note 20(f)) covers 518 lines and List 4A 11 lines, with no product exclusion in effect for Chapter 44; note 30(b) lists 144 lines for the 35% Russia rate.'
)
ia['lastCheckedAt'] = TODAY
have = {s['id'] for s in ia['sources']}
for s in NEW_SOURCES:
    if s['id'] in ('eo-14389', 'procl-11012', 'fr-2025-17453', 'fr-2025-15306', 'fr-2026-14610', 'fr-2026-14612', 'fr-2026-14614', 'fr-2023-12028') and s['id'] not in have:
        ia['sources'].append(s)
        have.add(s['id'])
for sid in ('procl-10420', 'procl-10523'):
    if sid not in have:
        ia['sources'].append(next(s for s in tu['sources'] if s['id'] == sid))
        have.add(sid)

# ---------------------------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Lumber & Wood Products: Lacey Act, ISPM 15, AD/CVD and Legal Ways to Lower Duty (HTS Ch. 44) | KoalaGains',
    'shortDescription': 'Tariff engineering for HTS Chapter 44: classify softwood vs hardwood vs tropical wood correctly, claim USMCA, know your exporter\'s AD/CVD rate and the order scopes, use drawback (also for Section 232), and meet the Lacey Act, APHIS, ISPM 15, CITES and TSCA formaldehyde rules.',
    'keywords': ['lacey act wood', 'lacey act form for wood products', 'ispm 15 requirements', 'tsca title vi plywood', 'softwood lumber checkoff assessment',
                 'HTS Chapter 44 tariff engineering', 'lumber duty drawback'],
}
te['intro'] = (
    'The duty on wood depends on three facts: the **species and process** (softwood lumber pays Section 232, tropical wood is exempt from the 2026 Section 301 duties, '
    'hardwood plywood and Chinese mouldings carry AD/CVD), the **origin** (Canada and Mexico with USMCA, China, Brazil, the 60 Section 301 economies) and the **exporter** '
    '(AD/CVD rates are company-specific). So the first lever is classifying correctly, ideally with a binding CBP ruling, and the second is knowing which AD/CVD rate and '
    'scope apply before you buy.\n\n'
    'Wood is also one of the most regulated imports: almost every Chapter 44 good needs a **Lacey Act** plant declaration, logs and lumber must meet **APHIS** rules, '
    'wood packaging must be **ISPM 15** treated and marked, listed species need **CITES** permits, composite panels must be **TSCA Title VI** certified, and softwood '
    'lumber importers pay the **Softwood Lumber Board** assessment. Each rule and lever links to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'
F_SW = 'https://www.federalregister.gov/documents/2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states'
te['levers'] = [
    {'id': 'classify-species', 'title': 'Classify by species, process and shape: softwood, tropical and further-processed wood pay different duties',
     'saves': 'The 10% Section 232 duty applies only to the 15 softwood provisions in U.S. note 37(b); tropical logs, lumber and veneer are exempt from the 10% or 12.5% 2026 Section 301 duties and Brazil\'s 25%',
     'appliesTo': 'Headings 4403, 4406, 4407, 4408, 4409, 4412 and 4418',
     'document': 'Species (botanical name, also needed for the Lacey Act declaration), process and dimensions from the mill: for example sawn lumber over 6 mm (4407) vs continuously shaped wood (4409) vs drilled or notched studs (4418), and the face ply species of plywood. A binding ruling under 19 CFR part 177 settles it before import.',
     'caveat': 'Classification follows what the goods are; mis-declaring species or shape to avoid Section 232 or AD/CVD is fraud. The softwood lumber AD/CVD scope also covers some 4409.10, 4415.20, 4418 and 4421 goods, so moving to another heading does not leave the order.',
     'citations': [{'label': 'HTSUS Chapter 44 notes', 'url': CH44},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 37(b), 50(a)(ii) and 52(b)', 'url': CH99},
                   {'label': '19 CFR part 177 (rulings)', 'url': ECFR19 + 'part-177'}]},
    {'id': 'usmca', 'title': 'Claim USMCA for Canadian and Mexican wood products',
     'saves': '10% of value: the 2026 Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55), plus the base rate (up to 8% on plywood and joinery)',
     'appliesTo': 'Originating goods of Canada and Mexico',
     'document': 'A USMCA certification of origin from the importer, exporter or producer, in the importer\'s possession when the claim is made (19 CFR 182.12). Rules of origin: General Note 11. Lumber from trees grown and sawn in Canada or Mexico is wholly obtained.',
     'caveat': 'USMCA does not remove the 10% Section 232 duty on softwood lumber (note 37(a)), the 50% Section 338 duty on the 154 Canadian lines (note 51(a)) or AD/CVD. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR19 + 'section-182.12'},
                   {'label': 'HTSUS General Note 11 (USMCA)', 'url': GN},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 37, 51(a) and 52(g)–(h)', 'url': CH99},
                   {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': reuse['ustr-usmca-review']['url']}]},
    {'id': 'adcvd-rate', 'title': 'Know your exporter\'s AD/CVD rate and the order scope before you buy',
     'saves': 'The gap between company rates: on Canadian softwood lumber 26.47% combined for West Fraser vs 35.16% for most exporters and 47.59% for Canfor; on hardwood plywood, from 0% for goods outside the scope to over 270% for China',
     'appliesTo': 'Softwood lumber from Canada; hardwood plywood from China, Indonesia and Vietnam; wood mouldings and millwork and multilayered wood flooring from China',
     'document': 'The producer and exporter names on the commercial invoice, matched to Commerce\'s latest final results; for plywood finished in Vietnam, the certification that no Chinese veneer or core was used (88 FR 46740). When the scope is unclear, ask Commerce for a scope ruling (19 CFR 351.225).',
     'caveat': 'The written scope decides, not the HTS number. Rates change with each annual review (the 2024 softwood lumber reviews are pending), and the importer must file a non-reimbursement certificate (19 CFR 351.402(f)).',
     'citations': [{'label': '90 FR 44035 and 90 FR 38755 (softwood lumber, current rates)', 'url': SRC['fr-2025-17453']['url']},
                   {'label': '91 FR 57383 (ITC: hardwood and decorative plywood)', 'url': SRC['fr-2026-18367']['url']},
                   {'label': '88 FR 46740 (hardwood plywood, Vietnam circumvention)', 'url': SRC['fr-2023-15431']['url']},
                   {'label': '19 CFR 351.225 (scope rulings)', 'url': ECFR19 + 'section-351.225'}]},
    {'id': 'drawback', 'title': 'Claim drawback when the wood, or goods made from it, are exported',
     'saves': 'Generally 99% of the duties paid, including the Section 232 wood duties (Proclamation 10976 clause 14), the Section 301 duties and the base rate, on goods re-exported or used to make exported goods',
     'appliesTo': 'All lines that paid a duty',
     'document': 'A drawback claim to CBP with the import and export records (19 CFR part 191); the claim is generally 99% of the eligible duties (19 CFR 191.51).',
     'caveat': 'Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)). Goods subject to Section 232 admitted to a foreign-trade zone must take privileged foreign status (Proclamation 10976 clause 8).',
     'citations': [{'label': '19 CFR part 191', 'url': ECFR19 + 'part-191'},
                   {'label': '19 CFR 191.3', 'url': ECFR19 + 'section-191.3'},
                   {'label': 'Proclamation 10976 (90 FR 48127)', 'url': F_SW}]},
]
te['rules'] = [
    {'id': 'lacey', 'agency': 'USDA APHIS',
     'title': 'Lacey Act: wood taken or traded in violation of law may not be imported (16 U.S.C. 3372(a)); a plant import declaration with the species, value, quantity and country of harvest is required (16 U.S.C. 3372(f)) and enforced by HTS code. Almost all of Chapter 44 is covered; APHIS planned to add the rest of 4412 and 4413 in phase VII',
     'citations': [{'label': '16 U.S.C. 3372', 'url': USC_16_3372},
                   {'label': 'APHIS notice, 89 FR 47122 (May 31, 2024)', 'url': frmeta['2024-11901']['html_url']}]},
    {'id': 'aphis-wood', 'agency': 'USDA APHIS',
     'title': 'Logs, lumber and unmanufactured wood: a permit or general permit, plus debarking, heat treatment or fumigation by type and origin (7 CFR 319.40-2, 319.40-3, 319.40-5); wood from Canada enters under general permit; wooden handicrafts from China must be treated and tagged (7 CFR 319.40-5(o))',
     'citations': [{'label': '7 CFR 319.40-2', 'url': ECFR7 + 'section-319.40-2'}, {'label': '7 CFR 319.40-3', 'url': ECFR7 + 'section-319.40-3'},
                   {'label': '7 CFR 319.40-5', 'url': ECFR7 + 'section-319.40-5'}]},
    {'id': 'ispm15', 'agency': 'USDA APHIS / CBP',
     'title': 'Wood packaging material (pallets, crates, dunnage) used to ship any goods must be heat-treated or fumigated and carry the ISPM 15 mark, or it is re-exported (7 CFR 319.40-3(b))',
     'citations': [{'label': '7 CFR 319.40-3(b)', 'url': ECFR7 + 'section-319.40-3'}]},
    {'id': 'cites', 'agency': 'U.S. Fish and Wildlife Service',
     'title': 'CITES-listed timber (for example rosewoods, mahoganies, Spanish cedar, ramin, ebony and agarwood) needs CITES export documents and clears through designated ports; some annotations exempt finished products (50 CFR part 23, 23.92)',
     'citations': [{'label': '50 CFR part 23', 'url': ECFR50 + 'part-23'}, {'label': '50 CFR 23.92', 'url': ECFR50 + 'section-23.92'}]},
    {'id': 'tsca-formaldehyde', 'agency': 'EPA / CBP',
     'title': 'Hardwood plywood, particleboard and MDF (and goods made from them) must meet the TSCA Title VI formaldehyde limits, be certified and labeled "TSCA Title VI compliant"; importers must take reasonable precautions and certify TSCA compliance at entry (40 CFR 770.30, 770.45; 19 CFR 12.121)',
     'citations': [{'label': '40 CFR 770.3 (definitions)', 'url': ECFR40 + 'section-770.3'}, {'label': '40 CFR 770.30', 'url': ECFR40 + 'section-770.30'}, {'label': '40 CFR 770.45', 'url': ECFR40 + 'section-770.45'},
                   {'label': '19 CFR 12.121', 'url': ECFR19 + 'section-12.121'}]},
    {'id': 'softwood-checkoff', 'agency': 'USDA AMS / CBP',
     'title': 'Softwood lumber of 4407.11–4407.19, 4409.10 and 4418.99.10: importers pay a Softwood Lumber Board assessment of $0.41 per thousand board feet through CBP, except on their first 15 million board feet a year (7 CFR 1217.52, 1217.53); a rule clarifying the import rate takes effect October 22, 2026',
     'citations': [{'label': '7 CFR 1217.52', 'url': ECFR7 + 'section-1217.52'}, {'label': '7 CFR 1217.53', 'url': ECFR7 + 'section-1217.53'},
                   {'label': '91 FR 59981 (September 22, 2026)', 'url': frmeta['2026-19389']['html_url']}]},
    {'id': 'marking', 'agency': 'CBP',
     'title': 'Country-of-origin marking: sawed lumber and timbers, utility poles and shingle bundles (other than red cedar) are excepted (Chapter 44 additional U.S. note 2; 19 CFR 134.33); other wood products and the outermost containers must show the origin (19 CFR 134.11, 134.22)',
     'citations': [{'label': '19 CFR 134.33', 'url': ECFR19 + 'section-134.33'}, {'label': '19 CFR 134.11', 'url': ECFR19 + 'section-134.11'},
                   {'label': '19 CFR 134.22', 'url': ECFR19 + 'section-134.22'}]},
    {'id': 's232-wood', 'agency': 'CBP',
     'title': 'Softwood timber and lumber of the 15 note 37(b) provisions: report 9903.76.01 and pay 10%, also under USMCA; give CBP any information it requires (note 37(k))',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 37', 'url': CH99}, {'label': 'Proclamation 10976 (90 FR 48127)', 'url': F_SW}]},
    {'id': 's338-canada', 'agency': 'CBP',
     'title': 'Canadian goods on the note 51(b)(1) or (b)(3) lists (154 Chapter 44 lines): report 9903.03.12 or 9903.03.14 and pay 50%, also when USMCA is claimed',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 51', 'url': CH99},
                   {'label': 'Proclamation 11048 (91 FR 46663)', 'url': 'https://www.federalregister.gov/documents/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united'}]},
    {'id': 'adcvd-softwood', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Softwood lumber from Canada: antidumping and countervailing duty cash deposits at the exporter\'s rate (20.53% AD and 14.63% CVD for most); the scope covers lumber, siding, flooring and some drilled, notched or angle-cut lumber and joinery; not in the tariff calculator',
     'citations': [{'label': '89 FR 1537 (orders continued, scope)', 'url': SRC['fr-2024-00330']['url']}, {'label': '90 FR 44035 (AD rates)', 'url': SRC['fr-2025-17453']['url']},
                   {'label': '90 FR 38755 (CVD rates)', 'url': SRC['fr-2025-15306']['url']}]},
    {'id': 'adcvd-plywood', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Hardwood plywood: 2018 AD/CVD orders on China (China-wide AD 114.72%), also covering plywood finished in Vietnam from Chinese veneers or cores; new hardwood and decorative plywood cases on China, Indonesia and Vietnam (final rates set, orders pending); not in the tariff calculator',
     'citations': [{'label': '88 FR 37014 (China orders continued)', 'url': SRC['fr-2023-12028']['url']}, {'label': '91 FR 3111 (China review results)', 'url': SRC['fr-2026-01389']['url']},
                   {'label': '88 FR 46740 (Vietnam circumvention)', 'url': SRC['fr-2023-15431']['url']}, {'label': '91 FR 57383 (ITC final)', 'url': SRC['fr-2026-18367']['url']}]},
    {'id': 'adcvd-mouldings', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Wood mouldings and millwork products from China: AD (China-wide 220.87%) and CVD orders, continued June 30, 2026; not in the tariff calculator',
     'citations': [{'label': '91 FR 39595 (orders continued, scope)', 'url': SRC['fr-2026-13103']['url']}, {'label': '91 FR 8823 (AD review results)', 'url': SRC['fr-2026-03678']['url']}]},
    {'id': 'adcvd-flooring', 'agency': 'Commerce (ITA) / CBP',
     'title': 'Multilayered wood flooring from China: AD and CVD orders, continued July 14, 2023, at company-specific rates; not in the tariff calculator',
     'citations': [{'label': '88 FR 45142 (orders continued, scope)', 'url': SRC['fr-2023-14933']['url']}]},
    {'id': 'usmca-cert', 'agency': 'CBP',
     'title': 'USMCA claims: a certification of origin in the importer\'s possession, provided to CBP on request',
     'citations': [{'label': '19 CFR 182.12', 'url': ECFR19 + 'section-182.12'}, {'label': 'HTSUS General Note 11', 'url': GN}]},
]
BASE_RULES = ['lacey', 'marking', 'usmca-cert']
GROUP_RULES = {
    '4401': ['aphis-wood'], '4402': [], '4403': ['aphis-wood', 'cites', 's232-wood'], '4404': ['aphis-wood'], '4405': [], '4406': ['aphis-wood', 's232-wood'],
    '4407': ['aphis-wood', 'cites', 's232-wood', 'adcvd-softwood', 'softwood-checkoff'], '4408': ['cites'],
    '4409': ['adcvd-softwood', 'adcvd-mouldings', 'softwood-checkoff'], '4410': ['tsca-formaldehyde'], '4411': ['tsca-formaldehyde'],
    '4412': ['tsca-formaldehyde', 'adcvd-plywood', 'adcvd-flooring'], '4413': [], '4414': [], '4415': ['ispm15'], '4416': [], '4417': [],
    '4418': ['adcvd-softwood', 'adcvd-flooring', 'adcvd-mouldings'], '4419': ['aphis-wood'], '4420': ['aphis-wood', 'cites'], '4421': ['aphis-wood', 'adcvd-mouldings'],
}
NOTES = {
    '4401': 'Fuel wood and chips need APHIS clearance; pellets and briquettes are processed and generally not regulated as unmanufactured wood. Canadian nonconiferous fuel wood pays 50% under Section 338.',
    '4402': 'Lump charcoal of 4402.90 from Canada pays 50% under Section 338. Activated charcoal is heading 3802.',
    '4403': 'Coniferous logs pay the 10% Section 232 duty; logs need APHIS permits and debarking or treatment; CITES applies to listed species such as some rosewoods and mahoganies.',
    '4404': 'Unmanufactured wood: APHIS rules apply.',
    '4405': 'Wood wool and flour: Lacey Act declaration and origin marking.',
    '4406': 'Coniferous ties (4406.11, 4406.91) pay the 10% Section 232 duty; treated ties still need APHIS clearance.',
    '4407': 'The most regulated group: 10% Section 232 on softwood, AD/CVD on Canadian softwood lumber, the softwood lumber checkoff, APHIS treatment rules and CITES for listed tropical species.',
    '4408': 'Tropical veneer is exempt from the 2026 Section 301 duty; CITES applies to listed species; Canadian coniferous veneer pays 50% under Section 338.',
    '4409': 'Coniferous siding, flooring and mouldings of 4409.10 are in the softwood lumber AD/CVD scope and checkoff; Chinese wood mouldings are under AD/CVD orders.',
    '4410': 'Particleboard must be TSCA Title VI certified and labeled; OSB is outside the TSCA Title VI particleboard definition (40 CFR 770.3).',
    '4411': 'MDF and thin MDF must be TSCA Title VI certified and labeled. Canadian MDF pays 50% under Section 338.',
    '4412': 'Hardwood plywood must be TSCA Title VI certified; hardwood plywood from China (and Chinese-core plywood from Vietnam) is under AD/CVD orders, with new cases on China, Indonesia and Vietnam.',
    '4413': 'Densified wood from Canada pays 50% under Section 338 (9903.03.12).',
    '4414': 'Wooden frames: origin marking on the article.',
    '4415': 'Pallets and crates imported as cargo, and those carrying other goods, must meet ISPM 15.',
    '4416': 'Barrels and staves: Lacey Act declaration and origin marking.',
    '4417': 'Wooden tools and handles: Lacey Act declaration and origin marking.',
    '4418': 'Some joinery is in the softwood lumber, mouldings and multilayered flooring AD/CVD scopes; Canadian wooden doors pay 50% under Section 338.',
    '4419': 'Wooden kitchenware from China must be treated and tagged with the manufacturer under 7 CFR 319.40-5(o).',
    '4420': 'Wooden handicrafts from China must be treated and tagged; CITES applies to carvings of listed species.',
    '4421': 'Some edge-glued lumber, pickets and millwork are inside the softwood lumber or wood mouldings AD/CVD scopes; Chinese wooden handicrafts must be treated and tagged.',
}
for g in te['groups']:
    g['label'] = GROUPS[g['heading']][0]
    g['ruleIds'] = BASE_RULES + GROUP_RULES[g['heading']]
    g['note'] = NOTES[g['heading']]

S232 = {'44031100', '44032101', '44032201', '44032301', '44032401', '44032501', '44032601', '44039901', '44061100', '44069100',
        '44071100', '44071200', '44071300', '44071400', '44071900'}
S338 = {'44011200', '44029001', '44079902', '44081001', '44091040', '44091050', '44091090', '44092991', '44101900', '44111320', '44111390', '44111420',
        '44111430', '44111490', '44121005', '44121090', '44123106', '44123126', '44123142', '44123145', '44123148', '44123152', '44123161', '44123192',
        '44123306', '44123326', '44123332', '44123357', '44123426', '44123432', '44123457', '44123910', '44123930', '44123940', '44123950', '44124100',
        '44124200', '44124900', '44125110', '44125131', '44125210', '44125231', '44125251', '44129106', '44129131', '44129141', '44129151', '44129207',
        '44129211', '44129231', '44129242', '44129252', '44129958', '44129961', '44129981', '44129991', '44129997', '44149000', '44182180', '44182980',
        '44201900', '44219970', '44219994', '44219998', '44130000', '44199091', '44209080', '44219160', '44219170'}
# Softwood lumber AD/CVD scope (89 FR 1537): 4406.91, 4407.1x, 4409.10, 4418.30/.50/.99.10; also may enter under 4415.20, 4418.99.91, 4421.99.70.40 / .98.80
SW_ADCVD_PREFIX = ('440691', '44071', '440910', '441830', '441850', '44189910', '44189991', '441520', '4421997040', '4421999880')
CHECKOFF_PREFIX = ('44071', '44091005', '44091010', '44091020', '44091090', '44189910')
MOULD_PREFIX = ('440910', '440922', '440929', '44189191', '44189199', '44219197', '44219198', '44219997', '44219998',
                '441241', '441242', '441249', '44129151', '44129252', '44129997', '441821', '441829')
PLY_PREFIX = ('4412',)
FLOOR_PREFIX = ('441231', '441233', '441234', '441239', '441291', '441292', '441299', '441873', '441874', '441875', '441879')
CITES_HEADINGS = ('4403', '4407', '4408', '4420')
for l in te['lines']:
    code = l['hts'].replace('.', '')
    h = code[:4]
    rules = list(BASE_RULES)
    if h in ('4401', '4403', '4404', '4406', '4407', '4419', '4420', '4421'):
        rules.append('aphis-wood')
    if h in CITES_HEADINGS:
        rules.append('cites')
    if h == '4415':
        rules.append('ispm15')
    if h in ('4410', '4411', '4412'):
        rules.append('tsca-formaldehyde')
    if code[:8] in S232:
        rules.append('s232-wood')
    if code[:8] in S338:
        rules.append('s338-canada')
    adcvd = False
    if code.startswith(SW_ADCVD_PREFIX):
        rules.append('adcvd-softwood'); adcvd = True
    if code.startswith(CHECKOFF_PREFIX):
        rules.append('softwood-checkoff')
    if code.startswith(MOULD_PREFIX):
        rules.append('adcvd-mouldings'); adcvd = True
    if code.startswith(PLY_PREFIX):
        rules.append('adcvd-plywood'); adcvd = True
    if code.startswith(FLOOR_PREFIX):
        rules.append('adcvd-flooring'); adcvd = True
    levers = []
    if h in ('4403', '4406', '4407', '4408', '4409', '4412', '4418'):
        levers.append('classify-species')
    levers.append('usmca')
    if adcvd:
        levers.append('adcvd-rate')
    levers.append('drawback')
    l['ruleIds'] = list(dict.fromkeys(rules))
    l['leverIds'] = levers
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations; not legal advice. AD/CVD rates are company-specific and change with each review; '
                    'check Commerce\'s latest notice and CBP\'s cash-deposit instructions before importing.')

# ---------------------------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Lumber & Wood Tariffs FAQ: Canadian Lumber, Section 232, Plywood, HS Codes 4407 & 4412 (HTS Ch. 44) | KoalaGains',
    'shortDescription': 'Answers to what people search about wood tariffs: the tariff on Canadian lumber, softwood lumber duties, Section 232 lumber tariffs, kitchen cabinet tariffs, plywood and Chinese wood tariffs, HS codes for lumber, plywood, pallets and charcoal, the Lacey Act and ISPM 15.',
    'keywords': ['what is the tariff on canadian lumber', 'are there tariffs on lumber', 'softwood lumber duties', 'section 232 lumber tariffs', 'kitchen cabinet tariffs',
                 'tariff on wood from china', 'plywood tariffs', 'hs code for plywood', 'hs code 4407', 'hs code for wooden pallets', 'hs code for charcoal',
                 'lacey act wood', 'ispm 15 requirements', 'lumber imports by country', 'hts chapter 44'],
}
fc['intro'] = 'Straight answers to the most common questions about U.S. tariffs on lumber, plywood and wood products, by country, by product and by HS code. Each answer links to the page with the full detail.'
fc['keyTakeaways'] = [
    'Softwood timber and lumber pay a 10% Section 232 duty from every country since October 14, 2025, with no USMCA exemption. Canadian softwood lumber also pays AD/CVD cash deposits (35.16% combined for most exporters), about 45% in all.',
    'Most other wood products pay the 2026 Section 301 duty (10% or 12.5%) from the 60 listed economies, with tropical woods exempt; Brazil adds 25%, China pays 25% (List 3) plus 12.5%, and 154 Canadian lines, including most plywood, MDF and doors, pay 50% under Section 338 even with USMCA.',
    'Hardwood plywood carries the heaviest trade remedies: AD/CVD orders on China (and Chinese-core plywood from Vietnam) and final AD/CVD rates on China, Indonesia and Vietnam, with orders pending. The 2025 IEEPA duties ended February 24, 2026.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 13, 2026'
fc['faqs'] = [
    {'id': 'canada-lumber', 'question': 'What is the tariff on Canadian lumber?',
     'searchedAs': ['what is the tariff on canadian lumber', 'what is the tariff on canadian lumber today', 'how much is the tariff on lumber from canada',
                    'canadian lumber tariff rate', 'current tariff on lumber from canada', 'what is the current tariff on canadian softwood lumber'],
     'answer': 'Canadian softwood lumber (4407.11 to 4407.19) is Free at base but pays the 10% Section 232 duty (9903.76.01) since October 14, 2025, even with a USMCA claim. It also pays antidumping and countervailing duty cash deposits: for most exporters (those not individually examined in the latest reviews) 20.53% AD and 14.63% CVD, so about 45.16% in all. Canfor pays 35.47% AD and 12.12% CVD, West Fraser 9.65% and 16.82%. Preliminary 2024 review rates are lower, but finals are pending.',
     'link': 'tariff-updates'},
    {'id': 'lumber-now', 'question': 'Are there tariffs on lumber right now?',
     'searchedAs': ['are there tariffs on lumber right now', 'are there still tariffs on lumber', 'lumber tariffs today', 'are there tariffs on lumber', 'are there new tariffs on lumber'],
     'answer': 'Yes. Softwood lumber from every country pays the 10% Section 232 duty. Hardwood lumber pays no Section 232 duty but pays the 2026 Section 301 duty of 10% or 12.5% from the 60 listed economies (Canada and Mexico exempt with USMCA, tropical lumber exempt), 37.5% from Brazil and China, and nothing extra from other countries. Commerce owed the President an update on hardwood lumber by October 1, 2026, which could lead to a duty; none had been proclaimed by October 13, 2026.',
     'link': 'industry-areas'},
    {'id': 'softwood-duties', 'question': 'What are the softwood lumber duties on Canada?',
     'searchedAs': ['softwood lumber duties', 'softwood lumber duty rates', 'softwood lumber countervailing duties', 'softwood lumber antidumping', 'softwood lumber duties canada'],
     'answer': 'Commerce has had antidumping and countervailing duty orders on softwood lumber from Canada since January 2018, continued in January 2024. The cash deposits in force come from the 2023 reviews: AD 20.53% and CVD 14.63% for companies not individually examined, Canfor 35.47% and 12.12%, West Fraser 9.65% and 16.82%. The 2024 reviews preliminarily found 10.66% AD and 14.17% CVD for non-selected companies; they apply only once final. These duties come on top of the 10% Section 232 duty.',
     'link': 'tariff-updates'},
    {'id': 'section-232', 'question': 'What do the Section 232 lumber and wood tariffs cover?',
     'searchedAs': ['section 232 lumber tariffs', 'section 232 wood products', 'section 232 timber', '232 tariffs on wood products', 'section 232 wood furniture'],
     'answer': 'Proclamation 10976 set three Section 232 duties from October 14, 2025: 10% on softwood timber and lumber (15 provisions of 4403, 4406 and 4407), 25% on upholstered wooden seating and 25% on kitchen cabinets and vanities and their wooden parts (Chapter 94). The UK pays at most 10%, and the EU, Japan, South Korea and Taiwan 15% in all. There is no USMCA exemption. The cabinet and upholstered rates rise to 50% and 30% on January 1, 2027; the 10% on softwood is unchanged.',
     'link': 'tariff-updates'},
    {'id': 'cabinets', 'question': 'What is the tariff on kitchen cabinets?',
     'searchedAs': ['kitchen cabinet tariffs', 'tariffs on wood cabinets', 'kitchen cabinet tariff code', 'kitchen cabinet tariffs canada', 'kitchen cabinet tariff increase'],
     'answer': 'Wooden kitchen cabinets and vanities are furniture of Chapter 94 (9403.40.90.60, 9403.60.80.93, parts 9403.91.00.80), not Chapter 44. They pay a 25% Section 232 duty (9903.76.03) from most countries, including Canada and Mexico, rising to 50% on January 1, 2027; UK goods pay 10%, and EU, Japanese, South Korean and Taiwanese goods 15% including the base rate. Cabinets that are not wooden enter under 9903.76.04 with no Section 232 duty. Wooden cabinets and vanities from China also carry AD/CVD orders.',
     'link': 'tariff-updates'},
    {'id': 'china', 'question': 'What is the tariff on wood products from China?',
     'searchedAs': ['tariff on wood from china', 'china tariffs on wood products', 'wood tariffs china', 'lumber imports from china'],
     'answer': 'Most Chinese wood products pay the base rate (0% to 10.7%) plus 25% under Section 301 List 3 (7.5% on 11 List 4A lines) plus 12.5% under the 2026 Section 301 action: for example 40.8% on other wooden articles of 4421.99.98. Chinese softwood lumber pays 25% plus the 10% Section 232 duty. Hardwood plywood, wood mouldings and millwork, and multilayered wood flooring from China also carry antidumping and countervailing duties, for example 114.72% AD (China-wide) on hardwood plywood.',
     'link': 'industry-areas'},
    {'id': 'plywood', 'question': 'What are the tariffs on plywood?',
     'searchedAs': ['plywood tariffs', 'plywood tariffs us', 'vietnam plywood tariff', 'chinese plywood tariff', 'canadian plywood tariff', 'brazilian plywood tariff', 'hardwood plywood antidumping'],
     'answer': 'Plywood (4412) has base rates from Free to 8%, plus the 2026 Section 301 duty (12.5% for Vietnam and Chile, 10% for Indonesia, Cambodia and Malaysia; tropical plywood from Indonesia, Cambodia and Malaysia exempt), 37.5% for Brazil and China, and 50% for most Canadian plywood under Section 338. Hardwood and decorative plywood from China, Indonesia and Vietnam has final AD/CVD rates (Vietnam 90.12% AD, 47.68% CVD; Indonesia 18.10% and 40.87%; China 187.27% and 88.96%); the orders were pending on October 13, 2026.',
     'link': 'industry-areas'},
    {'id': 'hs-plywood', 'question': 'What is the HS code for plywood (4412)?',
     'searchedAs': ['hs code for plywood', 'hs code 4412', 'hs code 4412.33', 'hs code 4412.31', '4412 hs code import duty', 'hts code 4412'],
     'answer': 'Heading 4412 covers plywood, veneered panels and similar laminated wood, split by the material: 4412.10 of bamboo; 4412.31 to 4412.39 plywood of wood veneers only, by the outer ply (4412.31 tropical wood, 4412.33 birch, maple, oak and other listed hardwoods, 4412.34 other hardwoods, 4412.39 softwood on both faces); 4412.41 to 4412.49 LVL; 4412.51 to 4412.59 blockboard; 4412.91 to 4412.99 other. Base rates run from Free (for example birch-faced plywood of 4412.33.06) to 8%.',
     'link': ''},
    {'id': 'hs-4407', 'question': 'What is HS code 4407?',
     'searchedAs': ['hs code 4407', 'hs code 4407.11', 'hs code 4407.99', '4407 hs code description', '4407.13 hs code'],
     'answer': '4407 is wood sawn or chipped lengthwise, sliced or peeled, over 6 mm thick, that is, lumber: 4407.11 pine, 4407.12 fir and spruce, 4407.13 S-P-F, 4407.14 hem-fir, 4407.19 other softwood; 4407.21 to 4407.29 tropical woods; 4407.91 to 4407.99 other hardwoods such as oak, beech, maple, cherry, ash and birch. All are Free at base; 4407.11 to 4407.19 pay the 10% Section 232 duty. 4407.13 was the largest Chapter 44 import in 2025 ($3.88B).',
     'link': ''},
    {'id': 'hs-pallets', 'question': 'What is the HS code for wooden pallets and crates?',
     'searchedAs': ['hs code for wooden pallets', 'hs code for wooden crate', 'hs code for wooden box', 'wooden pallets hs code', 'hts code for wooden crates'],
     'answer': 'Heading 4415: 4415.10 cases, boxes, crates, drums and cable drums (Free, except other cases of 4415.10.90 at 10.7%), and 4415.20 pallets, box pallets and pallet collars (Free for harvest containers of 4415.20.40, 10.7% for other pallets of 4415.20.80). Wood packaging used to ship goods, whether imported as cargo or in use, must be heat-treated or fumigated and carry the ISPM 15 mark (7 CFR 319.40-3(b)).',
     'link': 'tariff-engineering'},
    {'id': 'hs-charcoal', 'question': 'What is the HS code for charcoal?',
     'searchedAs': ['hs code for charcoal', 'wood charcoal hs code', 'hardwood charcoal hs code', 'hs code for charcoal briquette'],
     'answer': 'Wood charcoal, including lump and briquette charcoal, is heading 4402: 4402.10 of bamboo, 4402.20 of shell or nut (coconut shell), and 4402.90 other. All are Free at base. Activated charcoal is heading 3802, and charcoal grills are classified elsewhere. Canadian charcoal of 4402.90 pays 50% under Section 338. Mexico supplied more than half of the $115M imported in 2025.',
     'link': ''},
    {'id': 'lacey', 'question': 'What does the Lacey Act require for wood imports?',
     'searchedAs': ['lacey act wood', 'lacey act requirements', 'lacey act form for wood products', 'lacey act wood products', 'lacey act lumber'],
     'answer': 'The Lacey Act bans importing wood taken or traded in violation of U.S. or foreign law, and requires a plant import declaration with each entry: the scientific name of each species, the value, the quantity and the country of harvest (16 U.S.C. 3372(f)). APHIS enforces it by HTS code; almost all of Chapter 44 is covered. Packaging used only to carry other goods is exempt.',
     'link': 'tariff-engineering'},
    {'id': 'ispm15', 'question': 'What are the ISPM 15 requirements for wood packaging?',
     'searchedAs': ['ispm 15 requirements', 'ispm 15 stamp', 'ispm 15 pallet', 'ispm 15 wood', 'ispm 15 certificate'],
     'answer': 'Under 7 CFR 319.40-3(b), wood pallets, crates and dunnage entering the U.S. must be heat-treated or fumigated with methyl bromide and marked, preferably on two opposite sides, with the IPPC mark showing the country code, the producer number and the treatment (HT or MB). Unmarked wood packaging can be ordered re-exported at the port of arrival.',
     'link': 'tariff-engineering'},
    {'id': 'imports', 'question': 'Where does the U.S. import lumber and wood products from?',
     'searchedAs': ['lumber imports by country', 'us lumber imports', 'lumber imports from canada', 'lumber imports from canada to us'],
     'answer': 'Mostly Canada: $10.16B, or 44% of the $23.21B of Chapter 44 goods imported in 2025, led by lumber ($4.92B) and OSB ($1.83B). Next come China ($1.61B), Brazil ($1.48B), Vietnam ($1.38B), Chile ($1.14B), Indonesia ($970M), Germany ($932M), Mexico ($681M), Sweden ($453M) and Cambodia ($445M). Imports fell 5.3% from 2024.',
     'link': 'understand-industry'},
    {'id': 'hts-44', 'question': 'What does HTS Chapter 44 cover?',
     'searchedAs': ['hts chapter 44', 'htsus chapter 44', 'chapter 44 hts code', 'wood and articles of wood wood charcoal hs code'],
     'answer': 'HTS Chapter 44, "Wood and articles of wood; wood charcoal", is in Section IX with cork (Chapter 45) and basketware (Chapter 46). It has 21 headings (4401 to 4421) and 556 ten-digit U.S. lines: fuel wood and pellets, charcoal, logs, lumber, veneer, mouldings, OSB, MDF, plywood, frames, pallets, barrels, joinery, kitchenware and other wooden articles. Wooden furniture is in Chapter 94.',
     'link': ''},
]

# ---------------------------------------------------------------------------------------------------------------------
json.dump(d, open(out, 'w'), ensure_ascii=False, indent=2)
print('wrote', out)
