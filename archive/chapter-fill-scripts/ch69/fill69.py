#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 69 (Ceramic Products) content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill69.py <generated.json> <out.json>
Re-runnable: run.sh regenerates the data parts, then runs this script, compact-chapters and prettier.
"""
import glob
import json
import os
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
SP = os.path.dirname(os.path.abspath(__file__))
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'
ECFR_AS_OF = '2026-10-08'
SUGG_DATE = 'October 13, 2026'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '69-ceramic' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH69_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2069'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
FDA_CPG_LEAD = 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cpg-sec-545450-pottery-ceramics-import-and-domestic-lead-contamination'
FDA_CPG_CD = 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cpg-sec-545400-pottery-ceramics-import-and-domestic-cadmium-contamination'
FDA_LEAD_PAGE = 'https://www.fda.gov/food/environmental-contaminants-food/lead-food-and-foodwares'
FDA_POTTERY_GUIDANCE = (
    'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/'
    'guidance-industry-safety-imported-traditional-pottery-intended-use-food-and-use-term-lead-free'
)


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


def pct(a, b):
    return round((a / b - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Trade figures (UN Comtrade, via the trade file the generator read)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y = ui['latestYear']
PY = ui['priorYear']
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-69.json'))
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
hc = {}
for r in trade['byHeadingCountry']:
    hc[(r['heading'], r['country'])] = r['importsUsd']
by_line = {x['hs6']: x for x in ui['byLine']}


def imp(country):
    c = by_c.get(country)
    return c['importsUsd'] if c else 0


def imp_year(country, year):
    c = by_c.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    c = by_c[country]
    return pct(c['importsUsd'], c['priorImportsUsd'])


def h(heading, year=Y):
    return by_h[heading][str(year)]


def hcu(heading, country):
    return hc.get((heading, country), 0)


TILE = h('6907')
SANITARY = h('6910')
TILE_IT, TILE_ES, TILE_MX, TILE_IN, TILE_BR, TILE_TR = (hcu('6907', c) for c in ('Italy', 'Spain', 'Mexico', 'India', 'Brazil', 'Türkiye'))
TILE_CN = hcu('6907', 'China')
SAN_CN, SAN_MX = hcu('6910', 'China'), hcu('6910', 'Mexico')
DW_CN = hcu('6912', 'China')
TECH_JP = hcu('6909', 'Japan')

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------


def fr_source(doc, sid, document):
    m = json.load(open(f'{SP}/fr/{doc}.meta.json'))
    return {
        'id': sid,
        'publisher': 'Federal Register',
        'citation': m['citation'],
        'document': document,
        'title': m['title'],
        'signed': m.get('signing_date'),
        'published': m['publication_date'],
        'url': m['html_url'],
    }


NEW_SOURCES = {
    'hts-ch69': {
        'id': 'hts-ch69',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 69',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 69: Ceramic Products',
        'signed': None,
        'published': '2026-10-07',
        'url': CH69_PDF,
    },
    'fr-2020-11721': fr_source('2020-11721', 'fr-2020-11721', 'Antidumping duty order (Commerce, A-570-108)'),
    'fr-2020-11722': fr_source('2020-11722', 'fr-2020-11722', 'Countervailing duty order (Commerce, C-570-109)'),
    'fr-2020-07188': fr_source('2020-07188', 'fr-2020-07188', 'Final antidumping determination (Commerce, A-570-108)'),
    'fr-2025-16423': fr_source('2025-16423', 'fr-2025-16423', 'Sunset review final results (Commerce, A-570-108)'),
    'fr-2025-16229': fr_source('2025-16229', 'fr-2025-16229', 'Sunset review final results (Commerce, C-570-109)'),
    'fr-2026-03350': fr_source('2026-03350', 'fr-2026-03350', 'Five-year review determinations (USITC)'),
    'fr-2026-04120': fr_source('2026-04120', 'fr-2026-04120', 'Continuation of AD and CVD orders (Commerce)'),
    'fr-2025-23698': fr_source('2025-23698', 'fr-2025-23698', 'Amended final scope ruling (Commerce)'),
    'fr-2025-06908': fr_source('2025-06908', 'fr-2025-06908', 'Final negative antidumping determination (Commerce, A-533-928)'),
    'fr-2025-10752': fr_source('2025-10752', 'fr-2025-10752', 'Final determination (USITC)'),
    'fr-2025-11052': fr_source('2025-11052', 'fr-2025-11052', 'Countervailing duty order (Commerce, C-533-929)'),
    'fr-2010-23427': fr_source('2010-23427', 'fr-2010-23427', 'Antidumping duty orders (Commerce, A-201-837, A-570-954)'),
    'fr-2010-23550': fr_source('2010-23550', 'fr-2010-23550', 'Countervailing duty order (Commerce, C-570-955)'),
    'fr-2021-17790': fr_source('2021-17790', 'fr-2021-17790', 'Continuation of AD and CVD orders (Commerce)'),
    'fr-2026-13376': fr_source('2026-13376', 'fr-2026-13376', 'Initiation of five-year (sunset) reviews (Commerce)'),
    'fr-2019-27306': fr_source('2019-27306', 'fr-2019-27306', 'Notice (USTR)'),
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
d['chapter']['title'] = 'Ceramic Products'
SHORT = 'Ceramic Tiles, Sanitary Ware & Tableware'

GROUP_LABELS = {
    '6901': ('Bricks, blocks and tiles of siliceous fossil meals (kieselguhr, diatomite)', 'Diatomite bricks'),
    '6902': ('Refractory bricks, blocks and tiles (magnesite, alumina, silica, fireclay)', 'Refractory bricks'),
    '6903': ('Other refractory ceramics: crucibles, kiln furniture, nozzles, tubes, retorts', 'Refractory ware'),
    '6904': ('Ceramic building bricks, flooring blocks and filler tiles', 'Building bricks'),
    '6905': ('Roofing tiles, chimney liners and architectural ceramics', 'Roofing tiles'),
    '6906': ('Ceramic pipes, conduits and guttering', 'Ceramic pipes'),
    '6907': ('Ceramic and porcelain floor and wall tiles, mosaics and trim', 'Floor & wall tiles'),
    '6909': ('Technical and laboratory ceramics; ceramic troughs, tubs and jars', 'Technical ceramics'),
    '6910': ('Ceramic toilets, sinks, washbasins, bathtubs and urinals', 'Sanitary ware'),
    '6911': ('Porcelain and china tableware, kitchenware and toilet articles', 'Porcelain tableware'),
    '6912': ('Stoneware, earthenware and other ceramic tableware and kitchenware', 'Stoneware tableware'),
    '6913': ('Statuettes, figurines, vases and other ornamental ceramics', 'Ornamental ceramics'),
    '6914': ('Other ceramic articles (fiber-optic ferrules, slabs, other)', 'Other ceramics'),
}

BLURBS = {
    '6901': (
        'Bricks, blocks and tiles of diatomaceous earth (kieselguhr, tripolite), used as insulation in kilns and furnaces. Free; China adds '
        '37.5% (List 3).',
        ['diatomite brick', 'kieselguhr brick', 'insulating fire brick', 'diatomaceous earth tile'],
    ),
    '6902': (
        'Refractory bricks and shapes for furnaces, kilns, steel ladles and glass tanks — magnesite and magnesia-chrome, high-alumina, silica '
        'and fireclay. All Free. Magnesia carbon bricks from China and Mexico are under antidumping orders (and a countervailing duty order on '
        'China).',
        ['refractory brick', 'fire brick', 'magnesia carbon brick', 'high alumina brick', 'silica brick', 'kiln brick'],
    ),
    '6903': (
        'Other refractory ceramics: crucibles, kiln furniture and setters, nozzles, stopper rods, tubes, saggers and filters. Free; Russian '
        'alumina and other refractory goods pay 35% in place of column 2.',
        ['crucible', 'kiln shelf', 'ceramic nozzle', 'refractory tube', 'ceramic foam filter', 'sagger'],
    ),
    '6904': (
        'Clay building bricks (solid or hollow, including heat-insulating), flooring blocks and filler tiles. Free.',
        ['clay brick', 'building brick', 'face brick', 'hollow clay block', 'paver brick'],
    ),
    '6905': (
        'Clay or ceramic roofing tiles pay 13.5%; chimney pots and liners, cowls and architectural ceramics 3.2%. Both are Free under USMCA and '
        'most FTAs.',
        ['roof tile', 'clay roof tile', 'terracotta roof tile', 'chimney liner', 'chimney pot', 'architectural terracotta'],
    ),
    '6906': ('Ceramic and vitrified-clay pipes, conduits, guttering and fittings. Free.', ['clay pipe', 'vitrified clay pipe', 'ceramic conduit']),
    '6907': (
        'Floor, wall and paving tiles, porcelain tiles, mosaics and finishing pieces under 3.2 cm thick. Unglazed tiles and the smallest glazed '
        'mosaics pay 10%, most glazed tiles 8.5%. The split by water absorption (porcelain is not over 0.5%) and by size is statistical. '
        'Ceramic tile from China is under antidumping and countervailing duty orders, and tile from India under a countervailing duty order.',
        ['porcelain tile', 'ceramic floor tile', 'wall tile', 'mosaic tile', 'glazed tile', 'subway tile', 'large format tile', 'tile trim'],
    ),
    '6909': (
        'Ceramics for laboratory, chemical and technical uses — porcelain machinery parts (Free), alumina and zirconia wear parts of Mohs 9 or '
        'harder (4%), ceramic bearings, ferrite core memories (Free), catalyst carriers and other technical ware (4%) — plus ceramic troughs, '
        'tubs and jars for agriculture and transport (4%).',
        ['technical ceramics', 'alumina ceramic', 'zirconia ceramic', 'ceramic bearing', 'grinding beads', 'ceramic honeycomb', 'crock'],
    ),
    '6910': (
        'Toilets (water closet bowls, one-piece and flushometer types), flush tanks, sinks and lavatories, bidets, bathtubs and urinals. '
        'Porcelain or vitreous china pays 5.8%, other ceramics 5.7%.',
        ['toilet', 'toilet bowl', 'ceramic sink', 'bathroom sink', 'washbasin', 'urinal', 'bidet', 'pedestal sink'],
    ),
    '6911': (
        'Porcelain, china and bone china tableware, kitchenware and toilet articles. Rates run from 6% to 26%: hotel and restaurant ware 25%, '
        'dinnerware available in specified sets 26%, 8% or 6% by the value of a standard set, mugs 14%, bone china 6%–8%, other articles 20.8%, '
        'toilet articles 5.4%.',
        ['porcelain plate', 'porcelain dinnerware', 'bone china', 'porcelain mug', 'china dinner set', 'porcelain bowl', 'restaurant china'],
    ),
    '6912': (
        'Stoneware, earthenware and other non-porcelain tableware and household articles. Rates run from 0.7% (coarse stoneware and Rockingham '
        'earthenware) to 28% (hotel ware): dinnerware sets 9.8% or 4.5%, mugs 10%, cups and plates above set values 4.5%, other tableware 9.8%, '
        'other household articles 6%.',
        ['stoneware plate', 'ceramic mug', 'earthenware dinnerware', 'stoneware bowl', 'ceramic dinner set', 'ceramic baking dish', 'terracotta'],
    ),
    '6913': (
        'Statuettes, figurines, vases and other ornamental ceramics. Statues by professional sculptors and figurines of porcelain other than '
        'bone china are Free; bone china ornaments 3.3%; other ornamental ceramics 6%.',
        ['ceramic vase', 'porcelain figurine', 'ceramic statue', 'ceramic flowers', 'decorative ceramic', 'ceramic sculpture'],
    ),
    '6914': (
        'Ceramic articles not covered elsewhere. Fiber-optic connector ferrules and mating sleeves of porcelain, alumina or zirconia are Free; '
        'other porcelain articles 9%, other ceramics 5.6%.',
        ['ceramic ferrule', 'fiber optic ferrule', 'ceramic slab', 'ceramic part'],
    ),
}

ov = d['overview']
ORIG_LABELS = {g['heading']: g['label'] for g in ov['productGroups']}
ov['h1'] = f'HTS Chapter 69: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'A+':
        e['name'] = 'GSP, least-developed beneficiary countries only — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — renewed through December 31, 2026'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = 'HTS Chapter 69 Tariffs 2026: Ceramic Tile, Toilet & Dinnerware Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 120 HTS Chapter 69 lines — porcelain and ceramic tiles, toilets and sinks, porcelain and '
    'stoneware dinnerware, mugs, refractories. Base rates up to 28%, plus the extra duty by country: 10% in total on Italian and Spanish tile, '
    '46% plus AD/CVD on Chinese tile.'
)
ov['seo']['keywords'] = [
    'hts chapter 69',
    'ceramic products tariff',
    'ceramic products import duty rates',
    'ceramic tile tariff code',
    'hs code for ceramic tiles',
    'hs code for porcelain tiles',
    'china tariff on ceramic products',
    'spain ceramic tile import duties',
    'tariffs on italian tile',
    'porcelain tableware import duty rates',
    'refractory bricks customs duty',
]

ov['intro'] = (
    'Chapter 69 covers fired ceramic products: refractory bricks and kiln furniture, building bricks and roofing tiles, **floor and wall '
    'tiles** (heading 6907), technical ceramics, **toilets, sinks and other sanitary ware** (6910), **porcelain and stoneware tableware** '
    '(6911–6912) and ornamental ceramics. Refractories and bricks are Free; most glazed tiles pay **8.5%** and unglazed tiles 10%, sanitary '
    'ware 5.7%–5.8%, and tableware **0.7% to 28%** depending on the body (porcelain or stoneware), the use (household or hotel ware) and the value '
    'of a standard place setting.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, {abs(pct(total, prior_total))}% less than in {PY}. Tiles were the largest '
    f'group ({fmt_usd(TILE)}), led by **Italy** ({fmt_usd(TILE_IT)}) and **Spain** ({fmt_usd(TILE_ES)}); **China** '
    f'({fmt_usd(imp("China"))}) supplied mostly sanitary ware and dinnerware, **Mexico** ({fmt_usd(imp("Mexico"))}) toilets and tiles, and '
    f'**Japan** ({fmt_usd(imp("Japan"))}) technical ceramics.\n\n'
    'On top of the base rate comes the **extra duty by country**. Since July 24, 2026 a Section 301 tariff on 60 economies charges **10% in '
    'total on EU goods** (nothing is added where the base rate is already 10% or more), 12.5% in total on Japanese goods, +10% for India and '
    'the UK and +12.5% for Vietnam, Thailand and Türkiye. **China pays +12.5% plus its 2018–2019 Section 301 duty** — +25% on tiles, bricks, '
    'refractories and technical ceramics (List 3), +7.5% on most porcelain tableware and ornaments (List 4A). Chinese ceramic tile also '
    'carries **antidumping and countervailing duties** of up to 356.02% and 358.81%, and Indian tile a countervailing duty of about 3%. '
    'USMCA-qualifying goods from Mexico and Canada pay nothing. Dinnerware and other food-contact ware must also meet **FDA limits on lead '
    'and cadmium that leach from the glaze**.'
)

ov['workedExamples'] = [
    {
        'title': 'Glazed porcelain floor tile from Italy or Spain (60 × 60 cm)',
        'line': '6907.21.90.51',
        'body': 'Glazed tile with a water absorption of 0.5% or less, larger than 30 cm, pays a base rate of 8.5%. For EU goods with a base rate '
        'under 10%, the 2026 Section 301 action charges **10% in total** (9903.05.39), so a $50,000 container pays **$5,000** instead of $4,250. '
        'From Mexico under USMCA it is Free; from India 18.5% plus a countervailing duty deposit of 3.06%–3.45%; from Türkiye or Vietnam 21%; '
        'from China 46% before antidumping and countervailing duty deposits.',
    },
    {
        'title': 'One-piece porcelain toilet from China, Mexico or Thailand',
        'line': '6910.10.00.10',
        'body': 'Toilets of porcelain or vitreous china pay 5.8%. Chinese ones add only the 12.5% 2026 Section 301 duty (9903.05.31) — 6910.10 '
        'was on China List 4B, which never took effect — for **18.3%**, $1,830 on $10,000. Thai or Vietnamese toilets also pay 18.3%; a '
        'USMCA-qualifying Mexican toilet is Free (15.8% if it does not qualify). Toilets must meet the DOE water-use standard (1.6 '
        'gallons per flush for most types), and the importer counts as the manufacturer for DOE certification.',
    },
    {
        'title': 'Stoneware coffee mugs from China or Portugal',
        'line': '6912.00.44.00',
        'body': 'Ceramic mugs other than porcelain pay 10%. From China add 12.5% (9903.05.31); 6912.00.44 is on neither List 3 nor List 4A, so '
        'the total is **22.5%**, $2,250 on $10,000. From Portugal or another EU country nothing is added because the base rate is already 10%. A '
        'porcelain mug (6911.10.45, 14%) pays 26.5% from China and 14% from the EU. Mugs must also stay under the FDA action level of 0.5 µg/mL '
        'of leachable lead.',
    },
    {
        'title': 'Alumina wear parts from Japan (Mohs hardness 9 or more)',
        'line': '6909.12.00.00',
        'body': 'Technical ceramics with a hardness equivalent to 9 or more on the Mohs scale pay 4%. Japanese goods with a base rate under '
        '12.5% pay **12.5% in total** (9903.05.49), so $100,000 of parts pay $12,500. The same parts from China pay 41.5% (4% + 12.5% + 25% List '
        '3); from Germany 10%.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 69 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)
snap['biggestLines'] = [
    {'hts': '6907.21', 'label': 'Porcelain and other tiles with water absorption not over 0.5%'},
    {'hts': '6910.10', 'label': 'Porcelain sinks, toilets, bathtubs and other sanitary fixtures'},
    {'hts': '6912.00', 'label': 'Stoneware, earthenware and other ceramic tableware'},
]

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter applies only to ceramic products which have been fired after shaping: (a) Headings 6904 to 6914 apply only to '
    'such products other than those classifiable in headings 6901 to 6903; (b) Articles heated to temperatures less than 800 °C for purposes '
    'such as curing of resins, accelerating hydration reactions, or for the removal of water or other volatile components, are not '
    'considered to be fired. Such articles are excluded from Chapter 69; and (c) Ceramic articles are obtained by firing inorganic, '
    'nonmetallic materials which have been prepared and shaped previously at, in general, room temperature. Raw materials comprise, inter '
    'alia, clays, siliceous materials including fused silica, materials with a high melting point, such as oxides, carbides, nitrides, '
    'graphite or other carbon, and in some cases binders such as refractory clays or phosphates.\n\n'
    '**Note 2.** This chapter does not cover: (a) Products of heading 2844; (b) Articles of heading 6804; (c) Articles of chapter 71 (for '
    'example, imitation jewelry); (d) Cermets of heading 8113; (e) Articles of chapter 82; (f) Electrical insulators (heading 8546) or '
    'fittings of insulating material (heading 8547); (g) Artificial teeth (heading 9021); (h) Articles of chapter 91 (for example, clocks and '
    'clock cases); (ij) Articles of chapter 94 (for example, furniture, luminaires and lighting fittings, prefabricated buildings); (k) '
    'Articles of chapter 95 (for example, toys, games and sports equipment); (l) Articles of heading 9606 (for example, buttons) or of heading '
    '9614 (for example, smoking pipes); or (m) Articles of chapter 97 (for example, works of art).'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** For the purposes of headings 6902 and 6903, the term "refractory" is applied to articles which have a pyrometric cone equivalent '
    'of at least 1500°C when heated at 60°C per hour (pyrometric cone 18). Refractory articles have special properties of strength and '
    'resistance to thermal shock and may also have, depending upon the particular uses for which designed, other special properties such as '
    'resistance to abrasion and corrosion.\n\n'
    '**2.** For the purposes of heading 6902, a brick which contains both chromium and magnesium is classifiable according to which of those '
    'components (expressed as Cr2O3 or MgO, respectively) is the greater by weight.\n\n'
    '**3.** For the purposes of headings 6905 and 6907, the term "tiles" does not include any article 3.2 cm or more in thickness.\n\n'
    '**5.** For the purposes of headings 6909 through 6914: (a) The terms "porcelain," "china" and "chinaware" embrace ceramic ware (other '
    'than stoneware), whether or not glazed or decorated, having a fired white body (unless artificially colored) which will not absorb more '
    'than 0.5 percent of its weight of water and is translucent in thicknesses of several millimeters. The term "stoneware" as used in this '
    'note, embraces ceramic ware which contains clay as an essential ingredient, is not commonly white, will absorb not more than 3 percent of '
    'its weight of water, and is naturally opaque (except in very thin pieces) even when absorption is less than 0.1 percent. (b) The term '
    '"bone chinaware" embraces chinaware or porcelain the body of which contains 25 percent or more of calcined bone or tricalcium phosphate. '
    '(c) The term "earthenware" embraces ceramic ware, whether or not glazed or decorated, having a fired body which contains clay as an '
    'essential ingredient, and will absorb more than 3 percent of its weight of water. (d) The water absorption of a ceramic body shall be '
    'determined by ASTM test method designated C373 (except that test specimens may have a minimum weight of 10 g, and may have one large '
    'surface glazed).\n\n'
    '**6.** For the purposes of headings 6911 and 6912: (a) The term "available in specified sets" embraces plates, cups, saucers and other '
    'articles principally used for preparing, serving or storing food or beverages, or food or beverage ingredients, which are sold or offered '
    'for sale in the same pattern, but no article is classifiable as being "available in specified sets" unless it is of a pattern in which at '
    'least the articles listed below in (b) of this note are sold or offered for sale. (b) If each of the following articles is sold or offered '
    'for sale in the same pattern, the classification hereunder in subheadings 6911.10.35, 6911.10.37, 6911.10.38, 6912.00.35 or 6912.00.39, '
    'of all articles of such pattern shall be governed by the aggregate value of the following articles in the quantities indicated, as '
    'determined by the appropriate customs officer under section 402 of the Tariff Act of 1930, as amended, whether or not such articles are '
    'imported in the same shipment: 12 plates of the size nearest to 26.7 cm in maximum dimension; 12 plates of the size nearest to 15.3 cm in '
    'maximum dimension; 12 tea cups and their saucers; 12 soups of the size nearest to 17.8 cm in maximum dimension; 12 fruits of the size '
    'nearest to 12.7 cm in maximum dimension; 1 platter or chop dish of the size nearest to 38.1 cm in maximum dimension; 1 open vegetable '
    'dish or bowl of the size nearest to 25.4 cm in maximum dimension; 1 sugar of largest capacity; 1 creamer of largest capacity (each sold '
    'or offered for sale). If either soups or fruits are not sold or offered for sale, 12 cereals of the size nearest to 15.3 cm in maximum '
    'dimension, sold or offered for sale, shall be substituted therefor. (c) The percentage of water absorption of cast and jiggered ceramic '
    'articles of the same pattern, which are "available in specified sets" and which are imported together in a ratio of at least 5 jiggered '
    'articles to 1 cast article in the same shipment shall be the average water absorption of such cast and jiggered articles, of the same '
    'pattern in the shipment, which average absorption shall be deemed to be equivalent to 5 percent of the water absorption of a '
    'representative sample of such cast articles plus 95 percent of the water absorption of a representative sample of such jiggered '
    'articles.\n\n'
    '**7.** For the purposes of headings 6911, 6912 and 6913, those provisions which classify merchandise according to the value of each '
    '"article," an article is a single tariff entity which may consist of more than one piece. For example, a vegetable dish and its cover, or '
    'a beverage pot and its lid, imported in the same shipment, constitute an article.\n\n'
    '(The 2026 Revision 21 schedule prints no additional U.S. note 4 for this chapter.)'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 120; Brazil: 120; China List 3: 75 (headings 6901–6909, 6914); China List 4A: 24 (6910.90, most '
            'of 6911, 6912.00.10, 6913); Russia 35% in lieu of column 2: 5; USMCA goods exempt'
        )
ov['stats'].append(
    {
        'label': 'AD/CVD orders',
        'value': '6',
        'note': 'Ceramic tile: China AD and CVD, India CVD; magnesia carbon bricks: China AD and CVD, Mexico AD',
    }
)

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 69: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 69 Tariff Updates 2026: Ceramic Tile, Porcelain & Sanitary Ware Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 69 — ceramic and porcelain tile, toilets, dinnerware — since January 2025: the end of the '
    'IEEPA and Section 122 duties, the 2026 Section 301 tariffs (EU 10%, Japan 12.5%, Vietnam +12.5%), China Lists 3 and 4A, and the ceramic '
    'tile AD/CVD orders on China and India, with Federal Register citations.',
    'keywords': [
        'hts chapter 69 tariff updates',
        'ceramic products tariff',
        'section 301 duties on ceramics',
        'china section 301 ceramic duties',
        'ceramic tile anti dumping',
        'india ceramic tile anti dumping',
        'tariffs on tile',
        'ceramic products import duty rates',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 69 base rate changed**: all 120 lines carry the same General, Special and Column 2 '
    'rates, from Free to 28%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached ceramics from every country — 15% in total for EU '
    'and Japanese goods from August 7, 2025, 19%–20% for Thailand and Vietnam, 50% for India from August 27, 25% on non-USMCA goods of Mexico, '
    'and up to 145% on Chinese goods in April–May 2025 on top of the Section 301 lists. The IEEPA duties **ended on February 24, 2026**, and '
    'the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods of 60 economies pay a **Section '
    '301 tariff**: 10% in total for the EU, 12.5% in total for Japan, +10% for India and the UK, +12.5% for Vietnam, Thailand and Türkiye. '
    'China still pays List 3 (+25%) on tiles, refractories and technical ceramics and List 4A (+7.5%) on most porcelain tableware and '
    'ornaments, plus +12.5%. **Antidumping and countervailing duty orders** on ceramic tile from China were continued on February 20, 2026, and '
    'a countervailing duty order on ceramic tile from India took effect in June 2025.'
)
tu['scope'] = (
    'Measures that reach Chapter 69 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 List 3 and List 4A duties and their one product exclusion, Russia\'s rates in lieu of column 2, and the 2025–2026 IEEPA and '
    'Section 122 duties that have ended. The antidumping and countervailing duty orders on ceramic tile (China, India) and magnesia carbon '
    'bricks (China, Mexico) are described in the text, with their Federal Register notices; their deposits are company-specific and are not '
    'part of the rate grids. No Chapter 69 line is on a Section 232 list or the Canada Section 338 lists. For the rate each supplier pays, '
    'see Rates by country.'
)

NO_52 = 'No Chapter 69 line is on the general exemption list (note 52(b)) or a country exception list (note 52(j)). '
TILE_ADCVD_CN = (
    ' Ceramic tile (6907, and tile entered under 6905 or 6914) is also under antidumping order A-570-108 and countervailing duty '
    'order C-570-109 (85 FR 33089 and 85 FR 33119, June 1, 2020), continued on February 20, 2026: the China-wide antidumping rate is 356.02% '
    'and the all-others countervailing rate 358.81%. Magnesia carbon bricks (6902.10) are under orders A-570-954 and C-570-955.'
)

IN_EFFECT_TEXT = {
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and the 2018–2019 lists. List 3 (+25%, 9903.88.03) covers '
        'every line of headings 6901–6909 and 6914 — refractories, bricks, roofing tiles, floor and wall tiles, technical ceramics. List 4A '
        '(+7.5%, 9903.88.15) covers 6910.90, most porcelain tableware of 6911, 6912.00.10 and all of 6913. Porcelain sanitary ware (6910.10), '
        'bone china valued not over $31.50 a dozen, porcelain steins and mugs (6911.10.15, .41, .45) and most stoneware and earthenware '
        'tableware (6912.00.20–6912.00.50) were on List 4B, whose 15% was suspended on December 15, 2019 and never collected, so they pay only '
        '+12.5%. The one exclusion in force (U.S. note 20(vvv)(iii)(35), 9903.88.69) covers grinding beads of yttria-stabilized zirconia '
        '(6909.11.20.00) through November 9, 2026. ' + NO_52 + 'The IEEPA duties on China ended February 24, 2026, and USTR\'s four-year '
        'review kept Lists 3 and 4A in place.' + TILE_ADCVD_CN,
        'Chinese glazed tile pays 46% (8.5% + 37.5%) before AD/CVD deposits — which is why tile imports from China fell to about '
        f'{fmt_usd(TILE_CN)} in {Y}. Porcelain toilets pay 18.3%, stoneware dinnerware 17%–22.3%, porcelain dinnerware sets 26%–46%, figurines '
        '20%–26%, technical ceramics 37.5%–42%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52 + 'Mexico is not subject to the '
        'Canada Section 338 duties. Magnesia carbon bricks of Mexico (6902.10) are under antidumping order A-201-837 (75 FR 57257). The 25% '
        'IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        f'USMCA-qualifying Mexican tiles, toilets and sinks are Free — Mexico shipped {fmt_usd(SAN_MX)} of sanitary ware and {fmt_usd(TILE_MX)} '
        'of tile in ' + str(Y) + '. Non-qualifying tile pays 18.5%–20%, toilets 15.8%.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added (9903.05.38, U.S. note '
        '52(k)). So EU tiles, sanitary ware, technical ceramics and most tableware pay 10% in total, while roofing tiles (13.5%), porcelain '
        'hotel ware (25%), porcelain sets valued not over $56 (26%), porcelain mugs (14%), other porcelain articles (20.8%) and stoneware hotel ware (28%) pay '
        'only their base rate. ' + NO_52 + 'This replaced the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026. No antidumping or '
        'countervailing duty order covers EU ceramics.',
        f'Italian and Spanish porcelain tile pays 10% of value — $1,000 on $10,000 — instead of 15% from August 2025 to February 2026 and 8.5% '
        f'before 2025. Italy and Spain shipped {fmt_usd(TILE_IT + TILE_ES)} of tile in {Y}.',
    ),
    'Japan': (
        'For Japanese goods whose base rate is under 12.5%, the total is 12.5% (9903.05.49, U.S. note 52(k)); at or above 12.5%, only the base '
        'rate applies. ' + NO_52 + 'This replaced the 15%-in-total IEEPA rate under the U.S.–Japan agreement (Executive Order 14345), which '
        'ended February 24, 2026.',
        f'Japanese technical ceramics (6909, {fmt_usd(TECH_JP)} in {Y}) pay 12.5% in total, including lines that are Free under the U.S.–Japan '
        'Trade Agreement (JP); porcelain hotel ware and other lines above 12.5% pay their base rate.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52 + 'The 19% IEEPA reciprocal duty ended February 24, 2026.',
        'Thai toilets and sinks pay 18.2%–18.3%, glazed tile 21%, stoneware dinnerware 17%–22.3%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52 + 'Ceramic tile from India (6907, and tile entered under 6905, 6913.90.20 or 6914) is also '
        'under countervailing duty order C-533-929 (90 FR 25234, June 16, 2025): 3.45% for Antiqa Minerals, 3.06% for Win-Tel Ceramics and '
        '3.18% for all others; Commerce found no dumping, so there is no antidumping order. The IEEPA duties on India — 25% from August 7, 2025 '
        'plus 25% from August 27 — ended in February 2026.',
        f'Indian glazed tile pays 18.5% plus a 3.18% countervailing duty deposit; refractories pay 10%. India shipped {fmt_usd(TILE_IN)} of tile '
        f'in {Y}.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52 + 'The 20% IEEPA reciprocal duty ended February 24, 2026.',
        'Vietnamese glazed tile pays 21%, toilets 18.3%, ceramic ornaments 12.5%–18.5%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 69 line. The 40% IEEPA duty on Brazil (Executive Order 14323) and the 10% '
        'reciprocal duty ended February 24, 2026.',
        'Brazilian glazed tile pays 46% (8.5% + 37.5%), toilets 43.3%.',
    ),
    'Türkiye (Turkey)': (
        'Base rate + 12.5% (9903.05.79). ' + NO_52 + 'The 15% IEEPA reciprocal duty ended February 24, 2026.',
        f'Turkish glazed tile pays 21%, unglazed tile 22.5%. Tile imports from Türkiye were {fmt_usd(TILE_TR)} in {Y}.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52 + 'The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'British bone china pays 16%–18% (6911.10.15/.25), porcelain hotel ware 35%, refractories 10%.',
    ),
    'Canada': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.93); others pay +10% (9903.05.29). No Chapter 69 line is on the Section 338 '
        'lists in U.S. note 51(b), and the September 2026 list revisions added none. ' + NO_52 + 'The 35% IEEPA duty on non-USMCA goods ended '
        'February 24, 2026.',
        'USMCA-qualifying Canadian refractories and ceramics pay nothing; non-qualifying goods pay the base rate plus 10%.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — Free to 75% on Chapter 69 lines — plus +12.5% (9903.05.66). Five lines (6903.20, '
        '6903.90, 6912.00.10 and 6913.10.10) pay 35% under 9903.90.08 in place of their column 2 rate (U.S. note 30).',
        'Russian ceramics are effectively priced out.',
    ),
}
OTHER_TEXT = (
    'Malaysia +10% (9903.05.54), Indonesia +10%, Taiwan 10% in total (9903.05.76), South Korea 12.5% in total; the other listed economies pay '
    '+10% or +12.5%. ' + NO_52 + 'Countries outside the 60 economies pay only the base rate.',
    'Malaysian glazed tile pays 18.5%, Indonesian toilets 15.8%. Goods of countries outside the 60 economies pay only the base rate.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Malaysia, Indonesia, Taiwan, South Korea)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Japan':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), Japan rate'
        if 'eo-14345' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14345')
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 or List 4A'
        e['now'] = '+37.5% (6901–6909, 6914), +20% (List 4A lines), +12.5% (other lines)'
        for sid in ('fr-2019-27306', 'fr-2025-21671', 'fr-2020-11721', 'fr-2020-11722', 'fr-2026-04120'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'India':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
        if 'fr-2025-11052' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'fr-2025-11052')
    elif e['country'] == 'Mexico':
        e['measure'] = 'Section 301 tariff (non-USMCA goods)'
        if 'fr-2010-23427' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'fr-2010-23427')
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods)'
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rates in lieu of column 2 (5 lines)'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'

CHANGE_DETAIL = {
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 69',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 69 line is on the general exemption list (note 52(b)) '
        'or a country exception list (note 52(j)). EU goods pay 10% in total and Japanese goods 12.5% in total — nothing extra on lines already '
        'at or above that rate. India, the UK, Malaysia +10%; Vietnam, Thailand, Türkiye +12.5%; China +12.5% on top of Lists 3 and 4A. '
        'USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 69 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
        '12.5% forced-labor tariff (9903.05.27) is added on top: 46% in total on Brazilian glazed tile.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 2026 Section 301 duty (9903.05.58).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        # generator quirk: the HTS release date was used; the implementing notice is dated December 29, 2025
        c['date'] = '2025-12-29'
        c['dateLabel'] = 'Published'
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 69 base-rate changes'
        c['detail'] = (
            'All 120 Chapter 69 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 Lists 3 and 4A continue after the four-year review',
        'detail': 'USTR announced that the 2018–2019 China Section 301 actions did not terminate on their anniversaries because domestic '
        'industries asked for them to continue. For Chapter 69 this keeps +25% (List 3) on refractories, bricks, tiles and technical ceramics '
        'and +7.5% (List 4A) on most porcelain tableware and ornamental ceramics.',
        'before': '+25% / +7.5%',
        'now': '+25% / +7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ca-338-none',
        'type': 'reference',
        'date': '2026-08-22',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 duties: no Chapter 69 product listed',
        'detail': 'The 50% Section 338 duties on listed products of Canada took effect after a short suspension. None of the three lists in '
        'U.S. note 51(b) — nor the September 15, 2026 revisions — names a Chapter 69 subheading, so Canadian ceramics pay only the base rate and, '
        'if not USMCA-qualifying, the 10% Section 301 duty.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11046', 'procl-11047', 'procl-11048', 'procl-11056', 'procl-11064', 'procl-11065', 'csms-69606660'],
    },
    {
        'id': 'mcb-sunset-3',
        'type': 'pending',
        'date': '2026-07-02',
        'dateLabel': 'Initiated',
        'title': 'Third sunset review of the magnesia carbon brick orders',
        'detail': 'Commerce and the USITC opened the third five-year reviews of the antidumping orders on magnesia carbon bricks from China '
        '(A-570-954) and Mexico (A-201-837) and the countervailing duty order on China (C-570-955). The orders stay in force while the reviews '
        'run; revocation would remove the deposits on refractory bricks of 6902.10 (and 6815) from those countries.',
        'before': None,
        'now': 'In force; review pending',
        'countries': 'China, Mexico',
        'sourceIds': ['fr-2026-13376'],
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
        'tiles and sanitary ware and on Canadian ceramics.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'cn-tile-continued',
        'type': 'reference',
        'date': '2026-02-20',
        'dateLabel': 'Effective',
        'title': 'Antidumping and countervailing duty orders on ceramic tile from China continued',
        'detail': 'After the first sunset reviews, Commerce found that revoking the orders would likely lead to dumping margins of up to 356.02% '
        'and subsidy rates of 358.81%, and the USITC found that revocation would likely lead to continued injury. The orders (A-570-108, '
        'C-570-109) continue for five more years; CBP keeps collecting cash deposits at the rates in effect at entry. They cover ceramic floor, '
        'wall, paving, porcelain and mosaic tile of 6907, and tile entered under 6905.10, 6905.90.00.50, 6914.10.80 and 6914.90.80.',
        'before': 'In force',
        'now': 'Continued',
        'countries': 'China',
        'sourceIds': ['fr-2026-04120', 'fr-2026-03350', 'fr-2025-16423', 'fr-2025-16229'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 69 subheading was on the product exemption '
        'list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt. EU tile paid 18.5% in this period.',
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
        'Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for goods '
        'entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in '
        'effect.',
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
        'detail': 'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes '
        'the dutiable Chapter 69 lines that list it Free for eligible sub-Saharan countries — roofing tiles, floor and wall tiles, technical '
        'ceramics, sanitary ware and tableware. The Section 301 duty still applies to AGOA countries that are among the 60 economies. GSP (SPI A, '
        'A*, A+) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'cn-grinding-beads',
        'type': 'reference',
        'date': '2025-12-01',
        'dateLabel': 'Published',
        'title': 'China List 3 exclusion for zirconia grinding beads extended to November 9, 2026',
        'detail': 'USTR extended all 178 China Section 301 exclusions under 9903.88.69, among them grinding beads of yttria-stabilized zirconia '
        '(6909.11.20.00, U.S. note 20(vvv)(iii)(35)), through November 9, 2026. Matching beads skip the 25% List 3 duty but still pay the 12.5% '
        '2026 Section 301 duty.',
        'before': 'Through November 29, 2025',
        'now': 'Through November 9, 2026',
        'countries': 'China',
        'sourceIds': ['fr-2025-21671', 'hts-now'],
    },
    {
        'id': 'elysium-scope',
        'type': 'reference',
        'date': '2025-10-30',
        'dateLabel': 'Effective',
        'title': 'Composite tile ruled outside the China ceramic tile orders',
        'detail': 'Following the Court of International Trade\'s final judgment in Elysium Tiles, Inc. v. United States, Commerce amended its scope '
        'ruling and found that Elysium\'s composite tile is not covered by the antidumping and countervailing duty orders on ceramic tile from '
        'China. Other tile remains covered; the written scope, not the HTS number, decides coverage.',
        'before': 'Covered',
        'now': 'Not covered (Elysium composite tile)',
        'countries': 'China',
        'sourceIds': ['fr-2025-23698'],
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
        'id': 'jp-15',
        'type': 'extraDuty',
        'date': '2025-09-04',
        'dateLabel': 'Signed',
        'title': 'Japan: 15% in total under the U.S.–Japan agreement',
        'detail': 'Executive Order 14345 set the reciprocal duty on Japanese goods at 15% in total where the base rate is lower (nothing extra '
        'at 15% or more), applied from August 7, 2025. Japanese technical ceramics paid 15%. Ended February 24, 2026.',
        'before': '+15%',
        'now': '15% in total (ended)',
        'countries': 'Japan',
        'sourceIds': ['eo-14345'],
    },
    {
        'id': 'dm-suspended',
        'type': 'reference',
        'date': '2025-08-29',
        'dateLabel': 'Effective',
        'title': 'De minimis suspended for all countries',
        'detail': 'Executive Order 14324 ended duty-free de minimis treatment for shipments of any value, origin or mode, so a single mug or '
        'figurine bought online needs an entry and pays the duty. Executive Order 14388 continued the suspension after the IEEPA ruling, and '
        'CBP\'s June 24, 2026 interim final rules suspended the $800 exemption indefinitely.',
        'before': 'Free under de minimis up to $800',
        'now': 'Entry and duty required',
        'countries': 'All',
        'sourceIds': ['eo-14324', 'cbp-dm-2025', 'eo-14388', 'cbp-ifr-dm'],
    },
    {
        'id': 'india-oil',
        'type': 'extraDuty',
        'date': '2025-08-27',
        'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 '
        '(EO 14326): 50% in all on Indian tile and refractories, on top of the base rate. Ended February 7, 2026.',
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
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Thailand and Malaysia +19%, Vietnam +20%, '
        'India +25%, Türkiye +15%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% in total (9903.02.20) — so Italian and Spanish '
        'tile paid 15% — and Japanese goods were later put on the same footing (EO 14345). Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +25% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'br-40',
        'type': 'extraDuty',
        'date': '2025-08-06',
        'dateLabel': 'Effective',
        'title': 'Extra 40% on products of Brazil',
        'detail': 'Executive Order 14323 added 40% on Brazilian goods on top of the 10% reciprocal duty. No Chapter 69 line was among its '
        'exemptions, so Brazilian tile paid 58.5% in total. Ended February 24, 2026.',
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
        'id': 'in-tile-cvd',
        'type': 'extraDuty',
        'date': '2025-06-16',
        'dateLabel': 'Published',
        'title': 'Countervailing duty order on ceramic tile from India',
        'detail': 'Commerce issued countervailing duty order C-533-929 after the USITC found that imports threaten material injury (June 13, '
        '2025). Cash deposits: Antiqa Minerals 3.45%, Win-Tel Ceramics 3.06%, all others 3.18%. Because the finding was threat, duties apply to '
        'entries from the date of the USITC notice. Commerce\'s antidumping investigation ended with a negative determination on April 23, 2025, '
        'so there is no antidumping order on Indian tile.',
        'before': 'None',
        'now': '3.06%–3.45% CVD deposit',
        'countries': 'India',
        'sourceIds': ['fr-2025-11052', 'fr-2025-10752', 'fr-2025-06908'],
    },
    {
        'id': 'cn-reciprocal-10',
        'type': 'extraDuty',
        'date': '2025-05-14',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese porcelain '
        'toilet then paid 5.8% + 20% + 10% = 35.8% until November 9, 2025. Ended February 24, 2026.',
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
        'rates announced on April 2 for other countries, which never took effect. With the 20% fentanyl duty, a Chinese porcelain toilet paid '
        '150.8% and stoneware dinnerware about 155% until May 13, 2025.',
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
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 69 '
        'product was on the exemption list (U.S. note 2(v)(iii)). Ended February 24, 2026.',
        'before': 'None',
        'now': '+10% or more (ended)',
        'countries': 'All except Canada, Mexico',
        'sourceIds': ['eo-14257'],
    },
    {
        'id': 's232-parts-none',
        'type': 'reference',
        'date': '2025-05-03',
        'dateLabel': 'Effective',
        'title': 'Section 232 auto parts: no Chapter 69 line on the parts list',
        'detail': 'The Section 232 duty on automobile parts applies to the subheadings listed in U.S. note 33(g) to Chapter 99. No Chapter 69 '
        'line is listed (ceramic catalyst substrates and other technical ceramics of 6909 included), and no Chapter 69 line is on the steel, '
        'aluminum, copper, timber or medium- and heavy-duty vehicle parts lists. An importer may still elect the opt-in certified-parts '
        'headings for parts certified for U.S. vehicle production; those are not shown here.',
        'before': None,
        'now': None,
        'countries': 'All',
        'sourceIds': ['procl-10908', 'hts-chapter-99'],
    },
    {
        'id': 'cn-ieepa',
        'type': 'extraDuty',
        'date': '2025-03-04',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty raised to 20%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, '
        'on top of the Section 301 lists. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+20% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14195', 'eo-14228'],
    },
    {
        'id': 'mx-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Mexico',
        'detail': '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Most Mexican tile and sanitary ware '
        'entered under USMCA and paid nothing. Ended February 24, 2026.',
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
        'id': 'mcb-continued',
        'type': 'reference',
        'date': '2021-08-19',
        'dateLabel': 'Published',
        'title': 'Magnesia carbon brick orders on China and Mexico continued',
        'detail': 'After the second sunset reviews, Commerce continued the antidumping orders on magnesia carbon bricks from China (A-570-954) and '
        'Mexico (A-201-837) and the countervailing duty order on China (C-570-955). They cover chemically bonded magnesia carbon bricks of at '
        'least 70% MgO, classified in 6902.10.10, 6902.10.50 and heading 6815. The 2010 orders set deposits of 57.90% for Mexico, 128.10% to '
        '236.00% for China (antidumping) and 24.24% to 253.87% (countervailing).',
        'before': 'In force',
        'now': 'Continued',
        'countries': 'China, Mexico',
        'sourceIds': ['fr-2021-17790', 'fr-2010-23427', 'fr-2010-23550'],
    },
    {
        'id': 'cn-tile-orders',
        'type': 'extraDuty',
        'date': '2020-06-01',
        'dateLabel': 'Published',
        'title': 'Antidumping and countervailing duty orders on ceramic tile from China',
        'detail': 'Commerce issued antidumping order A-570-108 and countervailing duty order C-570-109 on ceramic floor, wall, paving, hearth, '
        'porcelain, mosaic and finishing tile under 3.2 cm thick, glazed or not, including tile minor-processed in a third country. The final '
        'determinations set a China-wide antidumping rate of 356.02% and a countervailing rate of 358.81% for the examined exporters and all '
        'others.',
        'before': 'None',
        'now': 'Up to 356.02% AD + 358.81% CVD',
        'countries': 'China',
        'sourceIds': ['fr-2020-11721', 'fr-2020-11722', 'fr-2020-07188'],
    },
    {
        'id': 'cn-list4a-75',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'Under the Phase One agreement USTR halved the List 4A duty (9903.88.15) from 15% to 7.5%. List 4A covers 6910.90, most of '
        '6911, 6912.00.10 and all of 6913.',
        'before': '+15%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2020-00904'],
    },
    {
        'id': 'cn-list4b-suspended',
        'type': 'reference',
        'date': '2019-12-15',
        'dateLabel': 'Effective',
        'title': 'China List 4B suspended — porcelain sanitary ware and most stoneware tableware spared',
        'detail': 'USTR suspended the 15% duty scheduled for December 15, 2019 on List 4B (9903.88.16). Its Chapter 69 lines — porcelain sinks '
        'and toilets (6910.10), bone china valued not over $31.50 a dozen, porcelain steins and mugs (6911.10.15, .41, .45) and stoneware and '
        'earthenware tableware 6912.00.20–6912.00.50 — have never paid a China Section 301 list duty.',
        'before': '+15% scheduled',
        'now': 'Suspended',
        'countries': 'China',
        'sourceIds': ['fr-2019-27306', 'fr-2019-17865'],
    },
    {
        'id': 'cn-list4a',
        'type': 'extraDuty',
        'date': '2019-09-01',
        'dateLabel': 'Effective',
        'title': 'China List 4A reaches porcelain tableware and ornamental ceramics',
        'detail': 'The fourth China Section 301 list put +15% on Chinese 6910.90 sanitary ware, most porcelain tableware (6911), 6912.00.10 and '
        'statuettes and other ornamental ceramics (6913).',
        'before': 'None',
        'now': '+15%',
        'countries': 'China',
        'sourceIds': ['fr-2019-17865'],
    },
    {
        'id': 'cn-list3-25',
        'type': 'extraDuty',
        'date': '2019-05-10',
        'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers every line of headings 6901–6909 and 6914, and the rate '
        'has applied ever since.',
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
        'title': 'China Section 301 List 3 reaches tiles, refractories and technical ceramics',
        'detail': 'The third China Section 301 list put +10% on Chinese refractory and building bricks, roofing tiles, pipes, floor and wall '
        'tiles, technical ceramics and other ceramic articles (headings 6901–6909 and 6914).',
        'before': 'None',
        'now': '+10%',
        'countries': 'China',
        'sourceIds': ['fr-2018-20610'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(
    tu,
    [
        'eo-14323',
        'eo-14345',
        'fr-2025-21671',
        'fr-2019-27306',
        'procl-11046',
        'procl-11047',
        'procl-11048',
        'procl-11056',
        'procl-11064',
        'procl-11065',
        'csms-69606660',
        'fr-2026-13376',
        'procl-11012',
        'ustr-usmca-review',
        'fr-2026-04120',
        'fr-2026-03350',
        'fr-2025-16423',
        'fr-2025-16229',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14384',
        'ustr-agoa-2026',
        'crs-agoa',
        'procl-11030',
        'cbp-gsp',
        'fr-2025-23698',
        'eo-14357',
        'eo-14324',
        'cbp-dm-2025',
        'eo-14388',
        'cbp-ifr-dm',
        'eo-14329',
        'eo-14326',
        'eo-14325',
        'fr-2025-11052',
        'fr-2025-10752',
        'fr-2025-06908',
        'eo-14298',
        'eo-14266',
        'eo-14257',
        'procl-10908',
        'eo-14195',
        'eo-14228',
        'eo-14194',
        'eo-14193',
        'fr-2021-17790',
        'fr-2010-23427',
        'fr-2010-23550',
        'fr-2020-11721',
        'fr-2020-11722',
        'fr-2020-07188',
        'fr-2020-00904',
        'fr-2019-17865',
        'fr-2019-09681',
        'fr-2018-20610',
    ],
)

stats = [s for s in tu['stats'] if s['label'] not in ('IEEPA duties', 'AD/CVD orders')]
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
stats.append({'label': 'AD/CVD orders', 'value': '6', 'note': 'Ceramic tile (China, India); magnesia carbon bricks (China, Mexico)'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 69: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — tiles, sanitary ware, refractories, technical '
    'ceramics and most tableware. Lines at 10% or more (roofing tiles 13.5%, porcelain hotel ware and sets, mugs, stoneware hotel ware) pay '
    'only their base rate (9903.05.38). No AD/CVD order on EU ceramics. The 15%-in-total IEEPA rate ended February 24, 2026.'
)
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on headings 6901–6909 and 6914, or + 7.5% List 4A '
    '(9903.88.15) on 6910.90, most of 6911, 6912.00.10 and 6913. Porcelain sanitary ware (6910.10) and most stoneware tableware pay only the '
    '12.5%. Not in the cells: AD/CVD deposits on ceramic tile (up to 356.02% + 358.81%) and magnesia carbon bricks.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). Magnesia carbon bricks are '
    'under an antidumping order (not in the cells). The 25% IEEPA duty ended February 24, 2026.',
    'Japan': 'Japan: 12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.49); lines above 12.5% pay only their '
    'base rate. The 15%-in-total IEEPA rate ended February 24, 2026.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 69 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 69 line is exempt. Ceramic tile also carries a 3.06%–3.45% countervailing '
    'duty deposit (not in the cells). The IEEPA duties (up to 50%) ended in February 2026.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 69 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27). No Chapter 69 line is on the note 50(a)(ii) list. The '
    'IEEPA duties (50%) ended February 24, 2026.',
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). No Chapter 69 line is exempt. The 15% IEEPA duty ended February 24, 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 69 line is on the UK exception list.',
    'Canada': 'USMCA-qualifying: no extra duty (9903.05.93). Otherwise base rate + 10% Section 301 (9903.05.29). No Chapter 69 line is on the '
    'Section 338 lists.',
}


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84) — for '
            'example Malaysia and Indonesia +10% — or 10% to 12.5% in total for Taiwan and South Korea. No country exception list in note 52(j) '
            'names a Chapter 69 line. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — Free to 75%.'
        )
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico'):
        if 'eo-14389' not in ids:
            ids.insert(-1, 'eo-14389')
    if c['country'] == 'China':
        for sid in ('fr-2019-27306', 'fr-2026-04120'):
            if sid not in ids:
                ids.insert(-1, sid)
    if c['country'] == 'India' and 'fr-2025-11052' not in ids:
        ids.insert(-1, 'fr-2025-11052')
    if c['country'] == 'Mexico' and 'fr-2010-23427' not in ids:
        ids.insert(-1, 'fr-2010-23427')
    if c['country'] == 'Japan' and 'eo-14345' not in ids:
        ids.insert(-1, 'eo-14345')
add_sources(ia, ['eo-14389', 'fr-2019-27306', 'fr-2026-04120', 'fr-2025-11052', 'fr-2010-23427', 'eo-14345'])

ia['seo'] = {
    'title': 'Ceramic Tile, Toilet & Dinnerware Tariffs by Country 2026 — Italy, Spain, China, Mexico, India (HTS Ch. 69) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on ceramic and porcelain tile, toilets and sinks, porcelain and stoneware dinnerware and '
    'refractories by country: 10% for Italian and Spanish tile, Free for USMCA Mexican goods, 18.5%–21% from India, Vietnam or Türkiye, 46% '
    'plus AD/CVD for Chinese tile.',
    'keywords': [
        'chapter 69 customs duty',
        'hts chapter 69',
        'tariffs on italian tile',
        'spain ceramic tile import duties',
        'mexico tariff on ceramic products',
        'usmca tariff on ceramic products',
        'tariff on toilets',
        'ceramic sanitary fixtures tariff',
        'porcelain tableware import duty rates',
    ],
}
ia['intro'] = (
    'Chapter 69 base rates run from Free (refractories, bricks) to 28% (stoneware hotel ware), and the extra duty **depends on where the goods '
    'come from**. Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference — taken '
    'from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **10% in total for Italy, Spain, Germany, Portugal and the rest of the EU**, 12.5% in total for Japan, **+10% for India and the '
    'UK**, **+12.5% for Thailand, Vietnam and Türkiye**, and +37.5% for Brazil. **China adds 12.5% plus 25% (List 3)** on tiles, '
    'refractories and technical ceramics, or 7.5% (List 4A) on most porcelain tableware and ornaments. USMCA-qualifying goods from Mexico and '
    'Canada pay nothing. Antidumping and countervailing duties on ceramic tile from China and India and on magnesia carbon bricks from China '
    'and Mexico come on top and are not in the cells.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Not in the cells: antidumping and countervailing duty deposits — ceramic tile from China (up to 356.02% AD and 358.81% CVD) and India '
    '(3.06%–3.45% CVD), and magnesia carbon bricks of 6902.10 from China and Mexico — because they are company-specific; the China List 3 '
    'exclusion for zirconia grinding beads (6909.11.20.00, it needs the importer\'s confirmation); AGOA and FTA preferences other than USMCA; '
    'the U.S.–Japan Trade Agreement Free rate on 6909.19.50 is inside the 12.5% Japan total.',
    'The opt-in Section 232 certified vehicle-parts headings are not modeled; no Chapter 69 line is on a Section 232 product list.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
    'Trade partners with no ISO country code in the trade data (Myanmar, Cocos Islands) are counted in "Any other country".',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 2, 16, 19, 20, 30, 31, 33, 36–39, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 '
    'general exemption list (note 52(b), 9903.05.86) and the country exception lists in note 52(j) name no Chapter 69 line. The Brazil list '
    '(note 50(a)(ii)) has no Chapter 69 line. The Canada Section 338 lists (note 51(b)) name no Chapter 69 subheading. China: List 3 (note '
    '20(f)) covers every 6901–6909 and 6914 line; List 4A (note 20(s)) covers 6910.90, 6911 except 6911.10.15, .41 and .45, 6912.00.10 and '
    'all of 6913; the rest of 6910, 6911 and 6912 was on the suspended List 4B (note 20(u)); no Chapter 69 line is in the 2024 increases (note '
    '31); the only exclusion in effect (note 20(vvv)(iii)(35), 9903.88.69) covers grinding beads of 6909.11.20.00 through November 9, 2026 — '
    'the older ceramic exclusions printed in note 20 (refractory bricks, alumina cylinders, inert ceramic balls) have expired. Note 30(b) sets '
    '35% for Russian 6903.20, 6903.90, 6912.00.10 and 6913.10.10 in place of column 2. Section 232: no Chapter 69 line is on the metals, '
    'auto-parts (note 33(g)), vehicle-parts (note 38), timber or semiconductor lists; the subchapter II duty suspension for stoneware slabs '
    '(9902.14.74) expired December 31, 2020. A Federal Register search of Commerce (ITA) and USITC notices found antidumping or '
    'countervailing duty orders in force on ceramic tile from China and India and on magnesia carbon bricks from China and Mexico, and none '
    'on sanitary ware or tableware.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 69: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Ceramic Tile, Sanitary Ware & Dinnerware Imports by Country — HTS Chapter 69 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 69 ceramics: {fmt_usd(total)} in {Y}. Who supplies porcelain and ceramic tile, toilets and '
    'sinks, dinnerware and technical ceramics — China, Mexico, Italy, Spain, Japan, Thailand, India — with values by product and year from UN '
    'Comtrade.',
    'keywords': [
        'hts chapter 69',
        'us ceramic tile imports by country',
        'tile imported from italy',
        'import ceramic tiles from china',
        'spain tariff on ceramic products',
        'hts 6907 ceramic paving tiles',
        'refractory ceramic goods duty',
        'ceramic products import duty rates',
    ],
}
ui['byYearCaption'] = 'U.S. imports of Chapter 69 goods each year, split into the two largest 2025 suppliers (China and Mexico) and everyone else.'
ui['why'] = (
    f'U.S. imports of Chapter 69 goods were **{fmt_usd(total)} in {Y}**, {abs(pct(total, prior_total))}% less than the {fmt_usd(prior_total)} '
    f'of {PY} and well below the {fmt_usd(year_tot[2022])} peak of 2022. **Floor and wall tiles** (heading 6907) were the largest group at '
    f'{fmt_usd(TILE)} — {fmt_usd(by_line["6907.21"]["importsUsd"])} of it porcelain-type tile with water absorption of 0.5% or less '
    f'(6907.21) — followed by **sanitary ware** (6910, {fmt_usd(SANITARY)}), **technical ceramics** (6909, {fmt_usd(h("6909"))}) and '
    f'**stoneware and earthenware tableware** (6912, {fmt_usd(h("6912"))}).\n\n'
    f'Each product has its own suppliers. Tile comes from **Italy** ({fmt_usd(TILE_IT)}) and **Spain** ({fmt_usd(TILE_ES)}), then Mexico '
    f'({fmt_usd(TILE_MX)}), India ({fmt_usd(TILE_IN)}), Brazil ({fmt_usd(TILE_BR)}) and Türkiye ({fmt_usd(TILE_TR)}); **China** shipped only '
    f'about {fmt_usd(TILE_CN)} of tile, because the 2020 antidumping and countervailing duty orders priced it out. China is instead the largest '
    f'supplier of sanitary ware ({fmt_usd(SAN_CN)}) and of stoneware tableware ({fmt_usd(DW_CN)}), and its total fell {abs(chg("China"))}% to '
    f'{fmt_usd(imp("China"))}. **Mexico** ({fmt_usd(imp("Mexico"))}) supplies toilets and sinks ({fmt_usd(SAN_MX)}), tile and refractories, '
    f'mostly duty-free under USMCA. **Japan** ({fmt_usd(imp("Japan"))}, +{chg("Japan")}%) leads in technical ceramics ({fmt_usd(TECH_JP)}), '
    f'and **Thailand** grew {chg("Thailand")}% to {fmt_usd(imp("Thailand"))}. India fell {abs(chg("India"))}% and Türkiye '
    f'{abs(chg("Türkiye"))}%.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February and the Section 301 '
    'tariffs from July 24, 2026); they do not show what those changes did. Duty-collected figures are not available from an official source '
    'yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)
# generator quirk: heading labels cut off with "…" in the trade tables
for c in ui['byCountry']:
    if c.get('mainHeading') in GROUP_LABELS:
        c['mainHeadingLabel'] = GROUP_LABELS[c['mainHeading']][0]
for x in ui['byLine']:
    o = ORIG_LABELS.get(x['heading'])
    if o and o.lower() in x['searchText']:
        x['searchText'] = x['searchText'].replace(o.lower(), GROUP_LABELS[x['heading']][0].lower())
for s in ui['stats']:
    if s['label'] == 'Largest product':
        s['note'] = 'Porcelain and other tiles with water absorption not over 0.5% (6907.21)'

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 69: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Ceramic Tile, Toilets & Dinnerware into the U.S.: FDA Lead Rules, AD/CVD, DOE & Legal Ways to Lower Duty (HTS Ch. 69) '
    '| KoalaGains',
    'shortDescription': 'What each HTS Chapter 69 line needs at U.S. entry — FDA lead and cadmium limits for ceramic dinnerware, "Not for Food '
    'Use" labels on decorative pieces, DOE water standards for toilets, AD/CVD on tile from China and India, origin marking — and the legal '
    'ways to pay less: classification, origin, USMCA, first sale, drawback, FTZ and rulings.',
    'keywords': [
        'fda ceramic regulations',
        'fda lead in ceramics',
        'lead in ceramic dishes',
        'ceramic tiles tariff engineering',
        'porcelain vs stoneware reclassification',
        'ceramic tile anti dumping',
        'first-sale-for-export valuation',
        'country of origin marking',
    ],
}
te['intro'] = (
    'Most Chapter 69 goods need no license, but three sets of rules decide whether a shipment clears. **Dinnerware, mugs and other '
    'food-contact ceramics** are tested by FDA for lead and cadmium that leach from the glaze; lots over the action levels can be detained at '
    'entry. Decorative pieces that look usable for food must carry a permanent "Not for Food '
    'Use" statement. **Toilets and urinals** must meet the DOE water-use standards, and the importer counts as the manufacturer. **Ceramic '
    'tile from China and India** is under antidumping and countervailing duty orders: the importer pays cash deposits and files a '
    'non-reimbursement certificate. Every article must be marked with its country of origin.\n\n'
    'On cost, the rate turns on facts the importer controls: whether a tile is glazed, whether tableware is porcelain or stoneware, hotel or '
    'household ware, and what a standard place setting is worth, plus the **country of origin** (10% in total for EU tile, 46% plus AD/CVD for '
    'Chinese tile). USMCA, FTAs, first-sale valuation, drawback, foreign-trade zones and binding rulings lower the bill further. Each lever '
    'depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = ECFR_AS_OF

F_TILE_CN = 'https://www.federalregister.gov/documents/2020/06/01/2020-11721/ceramic-tile-from-the-peoples-republic-of-china-antidumping-duty-order'
F_TILE_CN_CVD = NEW_SOURCES['fr-2020-11722']['url']
F_TILE_IN = NEW_SOURCES['fr-2025-11052']['url']
F_TILE_CONT = NEW_SOURCES['fr-2026-04120']['url']
F_MCB = NEW_SOURCES['fr-2021-17790']['url']
F_EXCL = REF_SOURCES['fr-2025-21671']['url']

te['levers'] = [
    {
        'id': 'tile-class',
        'title': 'Classify tile by glaze, size and thickness',
        'saves': 'Up to 1.5 points of base rate: unglazed tiles and glazed mosaics small enough to fit a 7 cm square pay 10%, most glazed tiles '
        '8.5%; and anything 3.2 cm or more thick is not a "tile" of 6907 at all',
        'appliesTo': 'Heading 6907 (and roofing tiles of 6905)',
        'document': 'Product specifications: glazed or unglazed, dimensions, thickness, tiles per square meter and water absorption '
        '(statistical).',
        'caveat': 'Water absorption and size split the statistical suffixes, not the rate, except for small glazed mosaics. Outside the EU '
        'floor the gap is small next to the country duty, and Chinese tile pays AD/CVD whatever its line.',
        'citations': [
            {'label': 'HTSUS Chapter 69, additional U.S. note 3', 'url': CH69_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'ware-class',
        'title': 'Know the body, the use and the set value of tableware',
        'saves': 'Large gaps between lines: porcelain hotel ware pays 25% and stoneware hotel ware 28%, but household ware much less; porcelain '
        'dinnerware sets pay 26%, 8% or 6% and stoneware sets 9.8% or 4.5% depending on the value of a standard set; porcelain mugs 14%, '
        'stoneware mugs 10%',
        'appliesTo': 'Headings 6911 and 6912 (and porcelain or other bodies in 6909, 6910, 6913 and 6914)',
        'document': 'A water-absorption test (ASTM C373) and body description showing porcelain, bone china, stoneware or earthenware; the '
        'price list for the pattern\'s standard set (note 6(b)); the intended use (household or hotel and restaurant).',
        'caveat': 'Porcelain absorbs not over 0.5% water and is translucent; stoneware not over 3% and opaque; earthenware more than 3% (note 5). '
        'The set value is the aggregate of the articles listed in note 6(b), whether or not imported together, so one pattern takes one line. '
        'The declared line must match the goods; a ruling settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 69, additional U.S. notes 5–7', 'url': CH69_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and do not route tile through a third country',
        'saves': 'The difference between country rates: 10% in total for EU tile, 18.5% for India, 21% for Vietnam or Türkiye, 46% plus AD/CVD for '
        'China',
        'appliesTo': 'All lines; the gap is widest on tile, refractories and technical ceramics',
        'document': 'Production records showing where the article was formed and fired — the country where it was last substantially '
        'transformed.',
        'caveat': 'Glazing, cutting, polishing or packing a Chinese tile in another country does not take it out of the China orders: their '
        'scope covers tile minor-processed in a third country. The Section 301 duties follow the country of origin, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '91 FR 10065 (scope of the China ceramic tile orders)', 'url': F_TILE_CONT},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20 and 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate (up to 28%) plus the 10% Section 301 duty',
        'appliesTo': 'All dutiable lines from Mexico and Canada — tiles, toilets and sinks, tableware',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'The good must meet the Chapter 69 rule of origin in General Note 11. USMCA does not remove the antidumping duty on Mexican '
        'magnesia carbon bricks. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. note 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim AGOA or another FTA',
        'saves': 'The base rate',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AGOA (D), Korea (KR), Colombia (CO), Peru (PE), Chile (CL), Morocco '
        '(MA), CAFTA-DR (P) and the other FTA partners; the U.S.–Japan Trade Agreement (JP) on 6909.19.50',
        'document': 'The origin proof each program requires (a certification or declaration of origin, or the AGOA documentation) and records to '
        'back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty (U.S. note 52(a)); for EU-style "in total" countries such as '
        'Japan and Korea the total does not change. AGOA (D) runs to December 31, 2026. GSP (A, A*, A+) has been expired since December 31, 2020, '
        'although the codes are still printed.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
            {'label': '19 CFR 10.178a (AGOA)', 'url': ecfr(19, '10.178a')},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use the China List 3 exclusion for zirconia grinding beads',
        'saves': 'The 25% List 3 duty on Chinese grinding beads of yttria-stabilized zirconia',
        'appliesTo': '6909.11.20.00 — porcelain machinery parts, for beads matching the exclusion description',
        'document': 'Product specifications showing yttria-stabilized zirconia grinding beads; report 9903.88.69 instead of 9903.88.03.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends it again. The 12.5% 2026 Section 301 duty (9903.05.31) still applies.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv)(iii)(35), 9903.88.69', 'url': CH99_PDF},
            {'label': '90 FR 55232 (exclusions extended to November 9, 2026)', 'url': F_EXCL},
        ],
    },
    {
        'id': 'adcvd-scope',
        'title': 'Check the AD/CVD scope — and ask Commerce for a scope ruling',
        'saves': 'The antidumping and countervailing deposits (up to 356.02% + 358.81% on Chinese tile) on a product that is outside the written '
        'scope',
        'appliesTo': 'Tile of 6907 (and tile entered under 6905, 6913.90.20 or 6914) from China or India; refractory bricks of 6902.10 from China '
        'or Mexico',
        'document': 'A scope ruling application to Commerce with the product description, composition and production process.',
        'caveat': 'The written scope, not the HTS number, decides coverage: Commerce found Elysium\'s composite tile outside the China tile orders '
        'in 2025, while tile of any size, glaze or end use stays in. Rulings take months; deposits are owed meanwhile.',
        'citations': [
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
            {'label': '90 FR 60057 (Elysium composite tile)', 'url': NEW_SOURCES['fr-2025-23698']['url']},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–37.5% extra duties included — when the factory '
        'price to a trading company is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company or agent-buyer rather than straight from the factory',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any line — for example tile or sanitary ware re-exported to Canada or the Caribbean',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 or AD/CVD duty is eligible before '
        'relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, sort or kit goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for tile and sanitary ware distributed to several countries',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date; goods subject to AD/CVD orders stay '
        'subject to them.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example unsold stock or samples sent back by a foreign '
        'distributor',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. note 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the China list: porcelain versus stoneware, household versus hotel ware, a '
        'dinnerware set\'s value break, a technical ceramic (6909) versus an "other" article (6914), a tile versus a slab',
        'appliesTo': 'Any line where body, use, size or value decides the line',
        'document': 'A ruling request to CBP describing the article, its body and water absorption, dimensions, use and value.',
        'caveat': 'Rulings apply to the transaction described; a changed body, design or price list may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 69 notes', 'url': CH69_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'fda-lead',
        'agency': 'FDA',
        'title': 'Ceramic ware for food — plates, bowls, cups, mugs, pitchers, cookware — is detained if leachable lead exceeds the action '
        'levels (µg/mL): flatware 3.0 (average of 6), small hollowware 2.0, large hollowware 1.0, cups and mugs 0.5, pitchers 0.5; ware that '
        'leaches lead must not be labeled "lead free"',
        'citations': [
            {'label': 'FDA CPG Sec. 545.450 (lead)', 'url': FDA_CPG_LEAD},
            {'label': 'FDA guidance: imported traditional pottery and "lead free" labeling', 'url': FDA_POTTERY_GUIDANCE},
            {'label': 'FDA: Lead in Food and Foodwares', 'url': FDA_LEAD_PAGE},
        ],
    },
    {
        'id': 'fda-cadmium',
        'agency': 'FDA',
        'title': 'Leachable cadmium limits (µg/mL): flatware 0.5 (average of 6), small hollowware 0.5, large hollowware 0.25',
        'citations': [{'label': 'FDA CPG Sec. 545.400 (cadmium)', 'url': FDA_CPG_CD}],
    },
    {
        'id': 'fda-ornamental',
        'agency': 'FDA',
        'title': 'Ornamental or decorative ceramicware that looks suitable for food is treated as food ware unless it bears a stick-on label and '
        'a permanent statement on the base ("Not for Food Use. May Poison Food" or similar, letters at least 3.2 mm) or has a hole bored through '
        'the food-contact surface',
        'citations': [{'label': '21 CFR 109.16', 'url': ecfr(21, '109.16')}],
    },
    {
        'id': 'doe-water',
        'agency': 'DOE',
        'title': 'Toilets (water closets) may use no more than 1.6 gallons per flush (3.5 for blowout bowls) and urinals 1.0; the importer is '
        'the "manufacturer" and must certify each basic model to DOE before distribution',
        'citations': [
            {'label': '10 CFR 430.32(q)–(r)', 'url': ecfr(10, '430.32')},
            {'label': '10 CFR 430.2 ("manufacture" includes import)', 'url': ecfr(10, '430.2')},
            {'label': '10 CFR 429.12, 429.30, 429.31 (certification)', 'url': ecfr(10, '429.30')},
        ],
    },
    {
        'id': 'adcvd-tile',
        'agency': 'Commerce / CBP',
        'title': 'Ceramic tile from China (A-570-108, C-570-109) and India (C-533-929): cash deposits at entry at the rate for the exporter, and '
        'a certificate that the exporter has not reimbursed the duties',
        'citations': [
            {'label': '85 FR 33089 (China AD order)', 'url': F_TILE_CN},
            {'label': '85 FR 33119 (China CVD order)', 'url': F_TILE_CN_CVD},
            {'label': '90 FR 25234 (India CVD order)', 'url': F_TILE_IN},
            {'label': '19 CFR 351.402(f) (reimbursement certificate)', 'url': ecfr(19, '351.402')},
        ],
    },
    {
        'id': 'adcvd-mcb',
        'agency': 'Commerce / CBP',
        'title': 'Magnesia carbon bricks from China (A-570-954, C-570-955) and Mexico (A-201-837): cash deposits at entry and a '
        'non-reimbursement certificate',
        'citations': [
            {'label': '86 FR 46676 (orders continued)', 'url': F_MCB},
            {'label': '19 CFR 351.402(f)', 'url': ecfr(19, '351.402')},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the article '
        'or, where CBP allows, its container (for example tile cartons)',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.32(d) (container marking)', 'url': ecfr(19, '134.32')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country, China List 3 (9903.88.03) or List '
        '4A (9903.88.15) or the exclusion (9903.88.69), Brazil (9903.05.01)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50, 52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69326983 (Section 301 forced-labor duties)', 'url': REF_SOURCES['csms-69326983']['url']},
        ],
    },
]

GROUP_RULES = {
    '6901': ['cbp-marking', 'cbp-ch99'],
    '6902': ['adcvd-mcb', 'cbp-marking', 'cbp-ch99'],
    '6903': ['cbp-marking', 'cbp-ch99'],
    '6904': ['cbp-marking', 'cbp-ch99'],
    '6905': ['adcvd-tile', 'cbp-marking', 'cbp-ch99'],
    '6906': ['cbp-marking', 'cbp-ch99'],
    '6907': ['adcvd-tile', 'cbp-marking', 'cbp-ch99'],
    '6909': ['cbp-marking', 'cbp-ch99'],
    '6910': ['doe-water', 'cbp-marking', 'cbp-ch99'],
    '6911': ['fda-lead', 'fda-cadmium', 'fda-ornamental', 'cbp-marking', 'cbp-ch99'],
    '6912': ['fda-lead', 'fda-cadmium', 'fda-ornamental', 'cbp-marking', 'cbp-ch99'],
    '6913': ['fda-ornamental', 'adcvd-tile', 'cbp-marking', 'cbp-ch99'],
    '6914': ['adcvd-tile', 'cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '6901': 'No agency license. Chinese goods pay 37.5% on top of the Free base rate (List 3).',
    '6902': 'Magnesia carbon bricks (6902.10) from China and Mexico are under AD/CVD orders, now in their third sunset review. Other '
    'refractory bricks need no license.',
    '6903': 'No agency license. Russian 6903.20 and 6903.90 pay 35% in place of column 2.',
    '6904': 'No agency license.',
    '6905': 'Roofing tiles (6905.10) and 6905.90.00.50 are named in the China and India ceramic tile orders, so tile entered there can owe '
    'AD/CVD.',
    '6906': 'No agency license.',
    '6907': 'Tile from China owes AD/CVD deposits of up to 356.02% + 358.81% on top of 46%; tile from India a 3.06%–3.45% countervailing '
    'deposit. Tiles 3.2 cm or more thick are not 6907 tiles (note 3).',
    '6909': 'No agency license. Zirconia grinding beads (6909.11.20.00) from China can use the List 3 exclusion through November 9, 2026.',
    '6910': 'Toilets and urinals must meet DOE water-use standards and be certified; sinks and lavatories need no certification. Porcelain '
    'sanitary ware (6910.10) from China pays only the 12.5% Section 301 duty.',
    '6911': 'Food-contact porcelain must meet FDA lead and cadmium limits; decorative pieces need the 21 CFR 109.16 labels. Rates from 6% to 26% '
    'depend on bone china, hotel ware, set value and article type.',
    '6912': 'Food-contact stoneware and earthenware must meet FDA lead and cadmium limits; traditional low-fired pottery is a known risk. '
    'Most 6912 lines from China pay only the 12.5% Section 301 duty.',
    '6913': 'Decorative ceramics that could hold food need the "Not for Food Use" labels. Ceramic tile articles of 6913.90.20 are named in '
    'the India tile order.',
    '6914': '6914.10.80 and 6914.90.80 are named in the China and India ceramic tile orders, so tile or slabs entered there can owe AD/CVD.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

ROWS = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
TILE_SCOPE_EXTRA = ('6905.10.00.00', '6905.90.00.50', '6913.90.20.00', '6914.10.80.00', '6914.90.80.00')
DOE_LINES = ('6910.10.00.05', '6910.10.00.10', '6910.10.00.15', '6910.10.00.20', '6910.10.00.50', '6910.90.00.00')
for ln in te['lines']:
    hts = ln['hts']
    sub = hts[:10]
    hd = hts[:4]
    rules = []
    if hd in ('6911', '6912'):
        if sub.startswith(('6911.10', '6912.00.1', '6912.00.2', '6912.00.3', '6912.00.4')):
            rules += ['fda-lead', 'fda-cadmium']
        rules.append('fda-ornamental')
    if hd == '6913':
        rules.append('fda-ornamental')
    if hd == '6907' or hts in TILE_SCOPE_EXTRA:
        rules.append('adcvd-tile')
    if sub.startswith('6902.10'):
        rules.append('adcvd-mcb')
    if hts in DOE_LINES:
        rules.append('doe-water')
    rules += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules
    gen = ln.get('general') or ROWS[hts]['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if hd in ('6905', '6907'):
        levers.append('tile-class')
    if hd in ('6909', '6910', '6911', '6912', '6913', '6914'):
        levers.append('ware-class')
    levers.append('origin')
    if dutiable:
        levers += ['usmca', 'fta']
    else:
        levers.append('usmca')
    if hts == '6909.11.20.00':
        levers.append('cn-exclusion')
    if 'adcvd-tile' in rules or 'adcvd-mcb' in rules:
        levers.append('adcvd-scope')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations, the agency guidance and the tariff schedule — not legal advice. '
    'Which line a ceramic falls in, whether a product is inside an AD/CVD scope, and what the FDA finds when it samples a lot depend on the '
    'facts of each shipment, and the extra duties change by Federal Register notice and CBP guidance; confirm the current headings, the '
    'exporter\'s AD/CVD deposit rate and the FDA status of the shipper before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 69: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Ceramic Tile, Toilet & Dinnerware Tariff FAQ: HS Codes, Italian & Chinese Tile, Anti-Dumping, FDA Lead Rules (HTS Ch. 69) | '
    'KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on ceramics: HS codes for ceramic and porcelain tile, mugs, plates, '
    'sinks, toilets and vases; tariffs on Italian and Spanish tile; anti-dumping duties on tile from China and India; and FDA lead rules for '
    'ceramic dishes.',
    'keywords': [
        'ceramic tile tariff code',
        'hs code for ceramic tiles',
        'hs code for porcelain tiles',
        'tariffs on italian tile',
        'ceramic tile anti dumping',
        'hs code for ceramic mug',
        'hs code for ceramic plates',
        'hs code for ceramic sink',
        'tariff on toilets',
        'hs code for ceramic vase',
        'refractory bricks hs code',
        'fda lead in ceramics',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for ceramic tile, sanitary ware, dinnerware and other '
    'ceramic products. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Refractories and bricks are Free; most glazed tiles pay 8.5% (unglazed 10%), toilets and sinks 5.7%–5.8%, and tableware 0.7% to 28% '
    'depending on porcelain or stoneware, household or hotel use and set value.',
    'Since July 24, 2026 a Section 301 duty is added by country: 10% in total for EU goods (Italian and Spanish tile pay 10%), 12.5% in total for '
    'Japan, +10% for India and the UK, +12.5% for Vietnam, Thailand and Türkiye.',
    'China pays +12.5% plus List 3 (+25%) on tiles, refractories and technical ceramics or List 4A (+7.5%) on most porcelain tableware and '
    'ornaments; porcelain toilets and most stoneware tableware pay only the 12.5%.',
    'Chinese ceramic tile also owes antidumping and countervailing duties (up to 356.02% and 358.81%), continued in February 2026; Indian tile '
    'owes a 3.06%–3.45% countervailing duty; magnesia carbon bricks from China and Mexico are also under orders.',
    'USMCA-qualifying goods from Mexico and Canada pay nothing. The IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge '
    'ended July 23, 2026.',
    'Ceramic dishes and mugs must meet FDA lead and cadmium limits, decorative pieces need "Not for Food Use" labels, and toilets must meet DOE '
    'water-use standards.',
]
fc['questionSource'] = f'Google search suggestions (U.S. English), collected {SUGG_DATE}'

it, es, cn, inn, mx = (by_c[n] for n in ('Italy', 'Spain', 'China', 'India', 'Mexico'))
fc['faqs'] = [
    {
        'id': 'hs-ceramic-tile',
        'question': 'What is the HS code and tariff for ceramic tiles?',
        'searchedAs': [
            'ceramic tile tariff code',
            'ceramic tile tariff number',
            'hs code for ceramic tiles',
            'hs code for ceramic floor tiles',
            'hs code for wall tiles',
            'floor tile tariff code',
        ],
        'answer': 'Ceramic floor, wall and paving tiles are heading 6907, split by water absorption: 6907.21 (not over 0.5%, porcelain-type), '
        '6907.22 (over 0.5% up to 10%) and 6907.23 (over 10%). Glazed tiles mostly pay 8.5% (6907.2x.90 and .40); unglazed tiles and small '
        'glazed mosaics 10%. Mosaic cubes are 6907.30 and trim pieces 6907.40. Anything 3.2 cm or more thick is not a tile of 6907.',
        'link': '',
    },
    {
        'id': 'hs-porcelain-tile',
        'question': 'What is the HS code for porcelain tiles?',
        'searchedAs': [
            'hs code for porcelain tiles',
            'porcelain tile tariff code',
            'hs code for glazed porcelain tiles',
            'hs code for polished porcelain tiles',
            'hs code for porcelain floor tiles',
            'hs code for porcelain slabs',
        ],
        'answer': 'Porcelain tile absorbs 0.5% of its weight in water or less, so it falls in 6907.21: glazed porcelain tile larger than 7 cm is '
        '6907.21.90 (8.5%) — suffix .11 if it fits in a 30 cm square, .51 if larger — and unglazed porcelain is 6907.21.10 (10%). '
        'Large porcelain slabs under 3.2 cm thick stay in 6907; articles 3.2 cm or more thick are not tiles of 6907 and may fall in 6914 '
        '(other ceramic articles), a heading the tile AD/CVD orders also name.',
        'link': '',
    },
    {
        'id': 'italian-tile',
        'question': 'Are there tariffs on Italian and Spanish tile?',
        'searchedAs': ['tariffs on italian tile', 'tariffs on tile', 'are there tariffs on tile', 'tile imported from italy'],
        'answer': 'Yes. Since July 24, 2026 EU goods with a base rate under 10% pay 10% in total (9903.05.39), so Italian and Spanish glazed tile '
        'pays 10% of its value — $1,000 on $10,000 — instead of 15% from August 2025 to February 2026 and 8.5% before 2025. Unglazed tile '
        f'(already 10%) pays 10%. No AD/CVD order covers EU tile. Italy shipped {fmt_usd(TILE_IT)} and Spain {fmt_usd(TILE_ES)} of tile in {Y}.',
        'link': 'industry-areas',
    },
    {
        'id': 'china-tile',
        'question': 'Can I import ceramic tile from China, and what does it cost?',
        'searchedAs': ['ceramic tile from china', 'import ceramic tiles from china', 'floor tile from china'],
        'answer': 'You can, but it rarely pays. Chinese glazed tile owes 8.5% + 12.5% (9903.05.31) + 25% List 3 (9903.88.03) = 46%, plus cash '
        'deposits under the antidumping and countervailing duty orders of 2020, continued February 20, 2026: the China-wide antidumping rate is '
        '356.02% and the all-others countervailing rate 358.81%. Tile glazed, cut or polished in a third country stays covered. U.S. imports of '
        f'tile from China were about {fmt_usd(TILE_CN)} in {Y}.',
        'link': 'tariff-updates',
    },
    {
        'id': 'tile-antidumping',
        'question': 'Is there anti-dumping duty on ceramic tiles from India?',
        'searchedAs': ['ceramic tile anti dumping', 'ceramic tiles anti dumping duty', 'india ceramic tile anti dumping'],
        'answer': 'There is no antidumping duty on Indian tile — Commerce found no dumping in April 2025 — but there is a countervailing '
        '(anti-subsidy) duty order since June 2025: deposits of 3.45% for Antiqa Minerals, 3.06% for Win-Tel Ceramics and 3.18% for all others, '
        'on top of the 8.5%–10% base rate and the 10% Section 301 duty. Chinese tile is under both antidumping and countervailing duty orders.',
        'link': 'tariff-updates',
    },
    {
        'id': 'hs-mug',
        'question': 'What is the HS code and tariff for a ceramic mug?',
        'searchedAs': [
            'hs code for ceramic mug',
            'ceramic mug tariff code',
            'hs code for coffee mug',
            'hs code for ceramic coffee mug',
            'porcelain mug tariff code',
            'hs code for ceramic cup',
        ],
        'answer': 'Porcelain or china mugs are 6911.10.45.00 (14%); stoneware and other ceramic mugs 6912.00.44.00 (10%). Cups sold with '
        'saucers or as part of a dinnerware pattern can fall in the set or value lines instead. From China add 12.5% (neither mug line is on '
        'List 3 or 4A): 26.5% or 22.5%. From the EU they pay 14% or 10%. FDA limits leachable lead in mugs to 0.5 µg/mL.',
        'link': '',
    },
    {
        'id': 'hs-plates',
        'question': 'What is the HS code for ceramic plates and dinnerware?',
        'searchedAs': [
            'hs code for ceramic plates',
            'hs code for ceramic dinnerware',
            'hs code for porcelain dinner plates',
            'hs code for porcelain tableware',
            'hs code for ceramic dishes',
            'porcelain plate tariff code',
        ],
        'answer': 'Porcelain and bone china tableware is heading 6911; stoneware and earthenware is 6912. Patterns sold in specified sets are '
        'classed by the value of a standard set (note 6): porcelain 26% (not over $56), 8% (over $56 to $200) or 6% (over $200); stoneware 9.8% '
        '(not over $38) or 4.5%. Hotel and restaurant ware pays 25% (porcelain) or 28% (stoneware); bone china 6%–8%; coarse stoneware and '
        'Rockingham earthenware 0.7%.',
        'link': '',
    },
    {
        'id': 'hs-sink-toilet',
        'question': 'What is the HS code for a ceramic sink or toilet?',
        'searchedAs': [
            'hs code for ceramic sink',
            'ceramic bathroom sink hs code',
            'hs code for ceramic wash basin',
            'hs code for toilet',
            'hs code for toilet bowl',
            'ceramic kitchen sink hs code',
        ],
        'answer': 'Ceramic sanitary ware is heading 6910: porcelain or vitreous china is 6910.10.00 (5.8%) — .05 flushometer bowls, .10 one-piece '
        'toilets, .15 flush tanks, .20 other toilet bowls, .30 sinks and lavatories, .50 other fixtures — and fireclay or other '
        'ceramics 6910.90.00 (5.7%). Plastic seats and metal fittings are classified separately.',
        'link': '',
    },
    {
        'id': 'toilet-tariff',
        'question': 'What is the tariff on toilets imported into the U.S.?',
        'searchedAs': ['tariff on toilets', 'wc tariff rates', 'porcelain toilet price'],
        'answer': 'A porcelain toilet pays 5.8% plus the extra duty for its origin: 18.3% from China (6910.10 is on no China list, so only the '
        '12.5% 2026 duty applies), Thailand or Vietnam, 15.8% from India, 10% from the EU, and nothing if USMCA-qualifying from Mexico. China and '
        f'Mexico shipped {fmt_usd(SAN_CN)} and {fmt_usd(SAN_MX)} of sanitary ware in {Y}. Toilets must meet the DOE 1.6 gallons-per-flush limit.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-vase',
        'question': 'What is the HS code for a ceramic vase or porcelain figurine?',
        'searchedAs': [
            'hs code for ceramic vase',
            'ceramic vase hs code',
            'hs code for porcelain figurine',
            'porcelain figurine tariff code',
            'porcelain vase tariff code',
        ],
        'answer': 'Ornamental ceramics are heading 6913: of porcelain 6913.10 (Free, or 3.3% for bone china), of other ceramics 6913.90 (6%, or '
        'Free for sculptors\' work, ceramic-tile articles and Rockingham-type earthenware). From China add 20% (12.5% + 7.5% List 4A). A vase '
        'that could hold food or drink needs the FDA "Not for Food Use" labels if it is not food-safe.',
        'link': '',
    },
    {
        'id': 'hs-refractory',
        'question': 'What is the HS code for refractory bricks?',
        'searchedAs': ['refractory bricks hs code', 'refractory hs code', 'is code for refractory bricks'],
        'answer': 'Refractory bricks and shapes are heading 6902: magnesite bricks 6902.10.10, other magnesia or chrome 6902.10.50, alumina or '
        'silica bricks 6902.20.10, fireclay bricks 6902.90.10. All are Free; crucibles, kiln furniture and other refractory goods are 6903 (Free). '
        'Chinese refractories pay 37.5% extra, and magnesia carbon bricks from China and Mexico are under AD/CVD orders. Refractory cement is '
        'Chapter 38, not 69.',
        'link': '',
    },
    {
        'id': 'chapter-69',
        'question': 'What does HTS Chapter 69 cover?',
        'searchedAs': ['hts chapter 69', 'htsus chapter 69', 'hs code ceramic', 'hs code for ceramic products'],
        'answer': 'Chapter 69 covers ceramic products fired after shaping: refractory bricks and goods (6901–6903), building bricks, roofing '
        'tiles and pipes (6904–6906), floor and wall tiles (6907), technical ceramics (6909), sanitary ware (6910), porcelain and other tableware '
        '(6911–6912), ornamental ceramics (6913) and other ceramic articles (6914). It excludes electrical insulators (8546), artificial teeth, '
        'ceramic toys, furniture, lamps and works of art.',
        'link': '',
    },
    {
        'id': 'ceramics-tariffs',
        'question': 'What are the tariffs on ceramics imported into the U.S. in 2026?',
        'searchedAs': ['tariffs on ceramics', 'import duty on ceramic products', 'import duty on ceramics', 'import duty on ceramic crockery'],
        'answer': 'The base rate (Free to 28%) plus the extra duty for the country of origin: 10% in total for EU goods, 12.5% in total for Japan, '
        '+10% for India and the UK, +12.5% for Vietnam, Thailand and Türkiye, +37.5% for Brazil, and for China +12.5% plus 25% (tiles, '
        'refractories, technical ceramics) or 7.5% (most porcelain tableware and ornaments). USMCA-qualifying goods from Mexico and Canada pay '
        f'nothing extra. U.S. imports were {fmt_usd(total)} in {Y}.',
        'link': 'industry-areas',
    },
    {
        'id': 'fda-lead',
        'question': 'What are the FDA rules for lead in ceramic dishes?',
        'searchedAs': ['fda ceramic regulations', 'fda lead in ceramics', 'lead in ceramic dishes', 'lead in ceramic mugs', 'lead in ceramic glaze'],
        'answer': 'FDA detains ceramic food ware whose glaze leaches lead above its action levels: 3.0 µg/mL for plates (average of six), 2.0 for '
        'small bowls, 1.0 for large bowls, 0.5 for cups, mugs and pitchers. Cadmium limits are 0.5 and 0.25 µg/mL. Lots over the limits can be '
        'detained at entry. Decorative ware must carry a "Not for Food Use" label and a permanent statement on the base, or have a hole through it.',
        'link': 'tariff-engineering',
    },
]

# ---------------------------------------------------------------------------------------------------
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
