#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 70 (Glass and Glassware) content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill70.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script (see run.sh).
"""
import glob
import json
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'
SLUG_FILE = '70-glass-and-glassware'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if SLUG_FILE in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

MEASURES = {m['measureKey']: m for m in json.load(open(f'{WT}/src/tariff-data/calculator/measures.json'))['measures']}

CH70_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2070'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_342 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapIV-sec342.htm'
FDA_LEAD = 'https://www.fda.gov/food/environmental-contaminants-food/lead-food-and-foodwares'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fr_url(date, docnum, slug):
    y, m, dd = date.split('-')
    return f'https://www.federalregister.gov/documents/{y}/{m}/{dd}/{docnum}/{slug}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round((a / b - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-70.json'))
Y = trade['latestYear']
PY = trade['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {x['hs6']: x for x in trade['byHs6']}


def imp(country, year=None):
    c = by_c_all.get(country)
    if not c:
        return 0
    return c['importsUsd'] if year is None else c['byYear'].get(str(year), 0)


def chg(country):
    c = by_c_all[country]
    return pct(c['importsUsd'], c['priorImportsUsd'])


def hy(h, year=None):
    return by_h.get(h, {}).get(str(year or Y), 0)


ranked = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])
TOP = [c['country'] for c in ranked]


def share(country):
    return round(imp(country) / total * 100)


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
def frsrc(sid, citation, document, title, published, url, signed=None):
    return {
        'id': sid,
        'publisher': 'Federal Register',
        'citation': citation,
        'document': document,
        'title': title,
        'signed': signed,
        'published': published,
        'url': url,
    }


NEW_SOURCES = {
    'hts-ch70': {
        'id': 'hts-ch70',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 70',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 70: Glass and Glassware',
        'signed': None,
        'published': '2026-10-07',
        'url': CH70_PDF,
    },
    'ad-float-cn': frsrc(
        'ad-float-cn',
        '91 FR 17250',
        'Notice (Commerce, A-570-188)',
        "Float Glass Products From the People's Republic of China: Antidumping Duty Order",
        '2026-04-06',
        fr_url('2026-04-06', '2026-06647', 'float-glass-products-from-the-peoples-republic-of-china-antidumping-duty-order'),
    ),
    'ad-float-cn-corr': frsrc(
        'ad-float-cn-corr',
        '91 FR 22123',
        'Correction (Commerce, A-570-188)',
        "Float Glass Products From the People's Republic of China: Antidumping Duty Order (correction of two cash deposit rates to 151.27%)",
        '2026-04-24',
        fr_url('2026-04-24', 'C2-2026-06647', 'float-glass-products-from-the-peoples-republic-of-china-antidumping-duty-order'),
    ),
    'cvd-float': frsrc(
        'cvd-float',
        '91 FR 17253',
        'Notice (Commerce, C-570-189, C-557-833)',
        "Float Glass Products From the People's Republic of China and Malaysia: Countervailing Duty Orders",
        '2026-04-06',
        fr_url('2026-04-06', '2026-06649', 'float-glass-products-from-the-peoples-republic-of-china-and-malaysia-countervailing-duty-orders'),
    ),
    'itc-float': frsrc(
        'itc-float',
        '91 FR 16014',
        'Notice (USITC)',
        'Float Glass Products From China and Malaysia; Determinations (Malaysia antidumping investigation terminated: imports negligible)',
        '2026-03-31',
        fr_url('2026-03-31', '2026-06129', 'float-glass-products-from-china-and-malaysia-determinations'),
    ),
    'ad-float-my-final': frsrc(
        'ad-float-my-final',
        '91 FR 5723',
        'Notice (Commerce)',
        'Float Glass Products From Malaysia: Final Affirmative Determination of Sales at Less Than Fair Value and Final Affirmative Determination '
        'of Critical Circumstances',
        '2026-02-09',
        fr_url('2026-02-09', '2026-02490', 'float-glass-products-from-malaysia-final-affirmative-determination-of-sales-at-less-than-fair-value'),
    ),
    'ad-float-init': frsrc(
        'ad-float-init',
        '90 FR 1435',
        'Notice (Commerce)',
        "Float Glass Products From the People's Republic of China and Malaysia: Initiation of Less-Than-Fair-Value Investigations",
        '2025-01-08',
        fr_url('2025-01-08', '2025-00190', 'float-glass-products-from-the-peoples-republic-of-china-and-malaysia-initiation-of'),
    ),
    'qsp-cn-cont': frsrc(
        'qsp-cn-cont',
        '90 FR 8521',
        'Notice (Commerce)',
        "Certain Quartz Surface Products From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders",
        '2025-01-30',
        fr_url('2025-01-30', '2025-01946', 'certain-quartz-surface-products-from-the-peoples-republic-of-china-continuation-of-antidumping-and'),
    ),
    'qsp-in-tr-cont': frsrc(
        'qsp-in-tr-cont',
        '91 FR 1751',
        'Notice (Commerce)',
        'Certain Quartz Surface Products From India and the Republic of Türkiye: Continuation of Antidumping and Countervailing Duty Orders',
        '2026-01-15',
        fr_url('2026-01-15', '2026-00739', 'certain-quartz-surface-products-from-india-and-the-republic-of-trkiye-continuation-of-antidumping'),
    ),
    'itc-containers-ad': frsrc(
        'itc-containers-ad',
        '85 FR 70651',
        'Notice (USITC)',
        'Glass Containers From China (final negative injury determination in the antidumping investigation; no order issued)',
        '2020-11-05',
        fr_url('2020-11-05', '2020-24594', 'glass-containers-from-china'),
    ),
    'itc-containers-cvd': frsrc(
        'itc-containers-cvd',
        '85 FR 39932',
        'Notice (USITC)',
        'Glass Containers From China (final negative injury determination in the countervailing duty investigation; no order issued)',
        '2020-07-02',
        fr_url('2020-07-02', '2020-14240', 'glass-containers-from-china'),
    ),
    'itc-wine-ad': frsrc(
        'itc-wine-ad',
        '90 FR 10515',
        'Notice (USITC)',
        'Glass Wine Bottles From China and Mexico (final negative injury determinations in the antidumping investigations; no orders issued)',
        '2025-02-24',
        fr_url('2025-02-24', '2025-02959', 'glass-wine-bottles-from-china-and-mexico'),
    ),
    'itc-wine-cvd': frsrc(
        'itc-wine-cvd',
        '89 FR 83515',
        'Notice (USITC)',
        'Glass Wine Bottles From China (final negative injury determination in the countervailing duty investigation; no order issued)',
        '2024-10-16',
        fr_url('2024-10-16', '2024-23798', 'glass-wine-bottles-from-china'),
    ),
    'itc-wine-cl': frsrc(
        'itc-wine-cl',
        '90 FR 1543',
        'Notice (USITC)',
        'Glass Wine Bottles From Chile; Termination of Investigation',
        '2025-01-08',
        fr_url('2025-01-08', '2025-00225', 'glass-wine-bottles-from-chile-termination-of-investigation'),
    ),
    'ad-wbf-cn': frsrc(
        'ad-wbf-cn',
        '87 FR 56397',
        'Notice (Commerce)',
        "Wooden Bedroom Furniture From the People's Republic of China: Continuation of Antidumping Duty Order (framed glass mirrors of 7009.92 "
        'sold as part of a dresser-mirror set are within the scope)',
        '2022-09-14',
        fr_url('2022-09-14', '2022-19855', 'wooden-bedroom-furniture-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order'),
    ),
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
# Coverage counts from the official measures (10-digit lines)
# ---------------------------------------------------------------------------------------------------
rows = d['overview']['rateTable']['rows']
LINES = [r for r in rows if r['htsCode10']]


def covered(key):
    cov = [c for c in MEASURES[key]['coverageInclude'] if c.startswith('70')]
    return [r['hts'] for r in LINES if any(r['htsCode10'].startswith(c) for c in cov)]


N_LINES = len(LINES)
N_L2 = len(covered('s301-china-list2'))
N_L3 = len(covered('s301-china-list3'))
N_L4A = len(covered('s301-china-list4a'))
N_CN_NONE = N_LINES - N_L2 - N_L3 - N_L4A
N_CA338 = len(covered('ca338-b3'))
N_RU = len(covered('ru-col2-35'))
N_JO = len(covered('s301-2026-except-jo'))
assert (N_L2, N_CA338, N_RU) == (1, 13, 11), (N_L2, N_CA338, N_RU)

# ---------------------------------------------------------------------------------------------------
# Chapter + labels
# ---------------------------------------------------------------------------------------------------
d['chapter']['title'] = 'Glass and Glassware'
SHORT = 'Glass & Glassware'

GROUP_LABELS = {
    '7001': ('Cullet, glass waste & scrap; glass in the mass', 'Cullet & glass mass'),
    '7002': ('Glass balls, rods & tubes, unworked (incl. fused quartz)', 'Balls, rods & tubes'),
    '7003': ('Cast & rolled glass sheets and profiles (patterned glass)', 'Cast & rolled glass'),
    '7004': ('Drawn & blown sheet glass', 'Drawn sheet glass'),
    '7005': ('Float glass & polished plate glass (incl. LCD glass)', 'Float glass'),
    '7006': ('Bent, edge-worked, enameled or engraved flat glass', 'Worked flat glass'),
    '7007': ('Safety glass: tempered & laminated, incl. windshields', 'Safety glass'),
    '7008': ('Insulating glass units (double glazing)', 'Insulating glass'),
    '7009': ('Mirrors, incl. vehicle rear-view mirrors', 'Mirrors'),
    '7010': ('Glass bottles, jars, vials & closures', 'Bottles & jars'),
    '7011': ('Glass envelopes for lamps & CRTs', 'Lamp envelopes'),
    '7013': ('Glassware: drinking glasses, tableware, kitchen & decor', 'Glassware'),
    '7014': ('Signaling glassware & optical glass elements', 'Optical & signal glass'),
    '7015': ('Watch glasses & spectacle-lens glass', 'Watch & lens glass'),
    '7016': ('Glass blocks, bricks, mosaic tiles & leaded glass', 'Glass blocks & mosaics'),
    '7017': ('Laboratory & pharmaceutical glassware', 'Lab glassware'),
    '7018': ('Glass beads, imitation pearls & stones, microspheres', 'Glass beads'),
    '7019': ('Glass fibers: fiberglass yarn, rovings, mats, fabric & glass wool', 'Fiberglass'),
    '7020': ('Other articles of glass (incl. vacuum flask inners, quartz tubes)', 'Other glass articles'),
}

BLURBS = {
    '7001': (
        'Cullet and other glass waste and scrap enter Free, as does fused-quartz glass in the mass; other glass in the mass pays 3%. Glass from '
        'cathode-ray tubes is not here (heading 8549).',
        ['cullet', 'glass scrap', 'crushed glass', 'glass waste', 'glass in the mass', 'fused quartz'],
    ),
    '7002': (
        'Unworked glass balls up to 6 mm pay 3.9%, larger balls Free; fused-quartz rods and tubes are Free; other rods and tubes, including '
        'borosilicate tubing for vials and lab ware, pay 6%.',
        ['glass rod', 'glass tube', 'glass tubing', 'borosilicate tubing', 'quartz tube', 'glass balls', 'marbles blank'],
    ),
    '7003': (
        'Cast and rolled glass — patterned glass, greenhouse and solar glass in the flat — pays 1.1%–1.4% in sheets and 6.3% in profiles.',
        ['patterned glass', 'rolled glass', 'cast glass', 'wired glass sheet', 'textured glass', 'channel glass'],
    ),
    '7004': (
        'Drawn and blown sheet glass: Free on most clear sheets up to 2 mm, 0.7¢/kg on 2–3.5 mm rectangles, 1¢/kg + 1.6% on tinted rectangles, '
        '5%–7.2% on other shapes.',
        ['sheet glass', 'drawn glass', 'blown glass sheet', 'thin glass', 'picture frame glass'],
    ),
    '7005': (
        'Float glass: Free for thin glass suitable for LCD displays, 4.4% for coated (Low-E, reflective) glass, 14.5¢–18.7¢/m² for clear glass '
        'under 10 mm, 4.9%–5.6% at 10 mm and more. Chinese float glass also carries antidumping and countervailing duties, and Malaysian float '
        'glass a countervailing duty.',
        ['float glass', 'clear glass sheet', 'Low-E glass', 'tinted glass', 'glass panel', 'LCD glass', 'mirror stock'],
    ),
    '7006': (
        'Flat glass that has been bent, edge-worked, engraved, drilled or enameled pays 4.9%–8.8%: 8.8% for narrow edge-worked strips, 6.4% for '
        'worked drawn glass, 4.9% for other worked glass such as beveled or back-painted panels.',
        ['beveled glass', 'bent glass', 'back painted glass', 'enameled glass', 'edged glass', 'glass shelf'],
    ),
    '7007': (
        'Tempered safety glass pays 5.5% (vehicle sizes) or 5%; laminated glass, including windshields, 4.9%. Laminated vehicle glass and '
        'windshields for trucks and buses can carry a 25% Section 232 vehicle-parts duty.',
        ['tempered glass', 'laminated glass', 'windshield', 'auto glass', 'shower door glass', 'screen protector', 'safety glass'],
    ),
    '7008': (
        'Multiple-walled insulating units — double- and triple-glazed sealed units for windows and doors — pay 3.9%. Chinese units of float '
        'glass also carry antidumping and countervailing duties.',
        ['insulated glass unit', 'double glazing', 'IGU', 'window glass unit', 'triple glazing'],
    ),
    '7009': (
        'Rear-view mirrors for vehicles pay 3.9% (plus the Section 232 auto-parts duty when they are car or truck parts); other mirrors, framed '
        'or not, 7.8% up to 929 cm² of reflecting area and 6.5% above.',
        ['mirror', 'wall mirror', 'bathroom mirror', 'LED mirror', 'rear-view mirror', 'side mirror glass', 'over-the-door mirror', 'vanity mirror'],
    ),
    '7010': (
        'Bottles and jars for food, drinks and other goods (7010.90.50), ampoules and pharmaceutical vials enter Free; perfume and cosmetic '
        'bottles and glass closures pay 2.5% if machine-made, 5.2% otherwise.',
        ['glass bottle', 'glass jar', 'wine bottle', 'mason jar', 'glass vial', 'perfume bottle', 'ampoule', 'beer bottle'],
    ),
    '7011': (
        'Open glass envelopes and bulbs for lamps and cathode-ray tubes: Free for incandescent bulbs and certified monochrome CRT envelopes, '
        '4.6%–6.6% for the rest.',
        ['glass bulb', 'lamp envelope', 'glass lamp tube', 'CRT glass'],
    ),
    '7013': (
        'The chapter\'s highest rates. Drinking glasses, stemware and tableware are rated by material and value per piece: up to 28.5% for '
        'cheap tumblers and 38% for other glassware valued at $0.30 or less, 22.5% for $0.30–$3 pieces, 3%–7.5% above $5; lead crystal 3%–20%; '
        'tempered ("pressed and toughened") glassware 12.5%; glass-ceramic kitchenware 6.9% or 26%.',
        ['drinking glass', 'wine glass', 'glassware', 'glass cup', 'glass bowl', 'glass vase', 'glass food container', 'candle holder', 'crystal glass'],
    ),
    '7014': (
        'Signaling glassware and optical elements that are not optically worked pay 3.3%–5%: lens blanks 4.1%, lenses and filters 3.4%.',
        ['signal lens', 'optical glass blank', 'lens blank', 'traffic light lens', 'glass filter'],
    ),
    '7015': (
        'Glass for corrective spectacles, watch glasses and similar curved glasses enter Free. Finished eyeglass lenses are in Chapter 90.',
        ['watch glass', 'spectacle glass', 'lens glass', 'watch crystal'],
    ),
    '7016': (
        'Glass mosaic cubes and smallwares pay 2.7%; glass bricks, blocks, paving and tiles 8%; leaded glass windows and foam glass 5%.',
        ['glass block', 'glass brick', 'glass mosaic tile', 'glass tile', 'stained glass panel', 'foam glass'],
    ),
    '7017': (
        'Quartz reactor tubes for semiconductor furnaces and microscope slides are Free; other fused-quartz lab ware 4.6%; borosilicate and '
        'other laboratory and pharmaceutical glassware 6.7%.',
        ['lab glassware', 'beaker', 'test tube', 'microscope slide', 'flask', 'quartz reactor tube', 'pipette'],
    ),
    '7018': (
        'Glass beads and imitation stones are Free, imitation pearls 4%, glass microspheres (reflective beads, blasting media) 5%, glass eyes '
        '3.2%, lamp-worked ornaments and other articles 6.6%.',
        ['glass beads', 'seed beads', 'crystal beads', 'imitation pearls', 'glass microspheres', 'reflective glass beads', 'glass ornament'],
    ),
    '7019': (
        'Fiberglass: chopped strands and rovings 4.8%–4.9%, yarn 4.2%–7%, mats and veils 4.3%, woven fabric 6%–7.3%, glass-wool insulation '
        '4.9%; fiberglass tire cord yarn and fabric are Free.',
        ['fiberglass', 'fiberglass insulation', 'fiberglass mesh', 'fiberglass cloth', 'glass fiber roving', 'chopped strand mat', 'glass wool'],
    ),
    '7020': (
        'Quartz reactor tubes and holders for semiconductor furnaces are Free; glass inners for vacuum flasks 6.6%; other articles of glass 5% '
        '(quartz surface products entered here carry a Section 201 safeguard duty).',
        ['glass inner', 'vacuum flask liner', 'glass article', 'quartz holder', 'glass float', 'sprinkler bulb'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 70: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'A+':
        e['name'] = 'GSP, least-developed beneficiary countries — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — in force to December 31, 2026'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
cn_imp = imp('China')
ov['seo']['title'] = 'HTS Chapter 70 Tariffs 2026: Glass, Glassware, Mirrors, Bottles & Fiberglass Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    f'Searchable 2026 U.S. tariff table for all {N_LINES} HTS Chapter 70 lines — float and tempered glass, windshields, mirrors, glass bottles '
    'and jars, drinking glasses, lab glass, glass beads, fiberglass. Base rates Free to 38%, plus the extra duty by country, Section 232 on '
    'auto glass and AD/CVD on Chinese float glass.'
)
ov['seo']['keywords'] = [
    'hts chapter 70',
    'htsus chapter 70',
    'glass and glassware tariffs',
    'glass tariffs',
    'tariffs on glass from china',
    'glass container tariffs',
    'glass bottle tariff code',
    'hs code for glassware',
    'hs code for mirror',
    'float glass antidumping',
]

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) goods of heading 3207 (for example, vitrifiable enamels and glazes, glass frit, other glass in '
    'the form of powder, granules or flakes); (b) articles of chapter 71 (for example, imitation jewelry); (c) optical fiber cables of heading '
    '8544, electrical insulators (heading 8546) or fittings of insulating material of heading 8547; (d) front windscreens (windshields), rear '
    'windows and other windows, framed, for vehicles of chapters 86 to 88; (e) front windscreens (windshields), rear windows and other windows, '
    'whether or not framed, incorporating heating devices or other electrical or electronic devices, for vehicles of chapters 86 to 88; (f) '
    'optical fibers, optically worked optical elements, hypodermic syringes, artificial eyes, thermometers, barometers, hydrometers or other '
    'articles of chapter 90; (g) luminaires or lighting fittings, illuminated signs, illuminated name-plates or the like, having a permanently '
    'fixed light source, or parts thereof of heading 9405; (h) toys, games, sports equipment, Christmas tree ornaments or other articles of '
    'chapter 95 (excluding glass eyes without mechanisms for dolls or for other articles of chapter 95); or (ij) buttons, fitted vacuum flasks, '
    'scent or similar sprays or other articles of chapter 96.\n\n'
    '**Note 2.** For the purposes of headings 7003, 7004 and 7005: (a) glass is not regarded as "worked" by reason of any process it has '
    'undergone before annealing; (b) cutting to shape does not affect the classification of glass in sheets; (c) the expression "absorbent, '
    'reflecting or non-reflecting layer" means a microscopically thin coating of metal or of a chemical compound (for example, metal oxide) '
    'which absorbs, for example, infrared light; or which improves the reflecting qualities of the glass while still allowing it to retain a '
    'degree of transparency or translucency; or which prevents light from being reflected on the surface of the glass.\n\n'
    '**Note 3.** The products referred to in heading 7006 remain classified in that heading whether or not they have the character of '
    'articles.\n\n'
    '**Note 4.** For the purposes of heading 7019, the expression "glass wool" means: (a) mineral wools with a silica (SiO2) content not less '
    'than 60 percent by weight; (b) mineral wools with a silica (SiO2) content less than 60 percent but with an alkaline oxide (K2O or Na2O) '
    'content exceeding 5 percent by weight or a boric oxide (B2O3) content exceeding 2 percent by weight. Mineral wools which do not comply with '
    'the above specifications fall in heading 6806.\n\n'
    '**Note 5.** Throughout the tariff schedule, the expression "glass" includes fused quartz and other fused silica.\n\n'
    '**Subheading note 1.** For the purposes of subheadings 7013.22, 7013.33, 7013.41 and 7013.91, the expression "lead crystal" means only '
    'glass having a minimum lead monoxide (PbO) content by weight of 24 percent.'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** For the purposes of this chapter, the term "fused quartz or other fused silica" means glass containing more than 95 percent silica '
    'by weight.\n\n'
    '**2.** For the purposes of headings 7003 through 7005, the expression "colored throughout the mass" refers to glass that has a '
    'transmittance of normally incident light of less than 66 percent at one or more wavelengths from 400 to 700 millimicrons, inclusive, or a '
    'transmittance of less than 80 percent at one or more wavelengths from 525 to 575 millimicrons, inclusive, for glass 6 mm in thickness, or '
    'of the equivalent transmittances for any other thickness, provided that, in determining such light transmittances, the effect of surface '
    'irregularities or configurations, or of other surface treatment (except flashing applied prior to solidification) and the effect of wire '
    'netting within the glass, shall be eliminated.\n\n'
    '**3.** For the purposes of headings 7003 and 7004, glass of the same size and thickness imported in any shipment in quantities over '
    '4.6 m² shall be denied entry unless it is — (a) packed in units containing, as nearly as the particular size permits, 4.6 m², or '
    'multiples thereof; or (b) packed in units containing multiples of the number of sheets of the same size and thickness which would be '
    'contained in a unit if packed to contain, as nearly as such size permits, 4.6 or 9.3 m²; or (c) otherwise packed in a manner which '
    'conforms to the packing practices of the domestic glass industry as determined and published from time to time by the Secretary of the '
    'Treasury.\n\n'
    '**4.** For the purposes of heading 7005, the expression "polished," as used with reference to glass, refers to glass one or both of the '
    'surfaces of which have been made smooth and glossy, in whole or in part, by abrasive or chemical means or by floating the glass over molten '
    'metal.\n\n'
    '**5.** For the purposes of subheading 7018.10.20, the term "imitation precious or semiprecious stones" means glass made into shapes '
    'suitable for use in jewelry or for other ornamental purposes in a manner similar to natural gemstones, whether or not in imitation thereof, '
    'but does not include natural gemstones, synthetic gemstones, reconstructed natural gemstones or imitation pearls.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            f'Section 301 (2026, 60 economies): {N_LINES}; Brazil: {N_LINES}; China Lists 2, 3 and 4A: {N_L2 + N_L3 + N_L4A}; Canada Section 338: '
            f'{N_CA338} (also on USMCA goods); Russia 35% in lieu of column 2: {N_RU}; Section 232 vehicle parts: 3 (only when they are car, '
            'truck or bus parts); Section 201 quartz surface products: 1'
        )

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 70 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

exec(open(__file__.replace('fill70.py', 'fill70_text.py')).read())

json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
