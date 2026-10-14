#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 40 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill40.py <generated.json> <out.json>
Re-runnable: run.sh regenerates the data parts and runs this script on top.
"""
import glob
import json
import os
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'
SUGG_DATE = 'October 13, 2026'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '40-rubber' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)
GEN_SOURCES = {s['id']: s for s in d['tariffUpdates']['sources']}
FRMETA = json.load(open(os.path.join(HERE, 'frmeta.json')))

CH40_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2040'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
CBP_WRO = 'https://www.cbp.gov/newsroom/stats/trade/withhold-release-orders-findings-dashboard'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fr_url(num):
    return FRMETA[num]['html_url']


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
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-40.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hc = {}
for r in trade['byHeadingCountry']:
    by_hc.setdefault(r['heading'], {})[r['country']] = r['importsUsd']
by_hs6 = {r["hs6"][:4] + "." + r["hs6"][4:6] if "." not in r["hs6"] else r["hs6"]: r for r in trade["byHs6"]}


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def chg(country):
    c = by_c_all[country]
    return round((c['importsUsd'] / c['priorImportsUsd'] - 1) * 100, 1)


def hc(heading, country):
    return by_hc.get(heading, {}).get(country, 0)


def h_tot(heading):
    return by_h[heading][str(Y)]


TIRES = h_tot('4011')
NR = h_tot('4001')
GLOVES = h_tot('4015')
OTHER_ART = h_tot('4016')
TIRE_SHARE = round(TIRES / total * 100)

# ---------------------------------------------------------------------------------------------------
# Matrix look-up (used to keep every quoted rate equal to the calculator's)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']


def cell_total(country, hts, usmca=False):
    c = next(x for x in ia['countries'] if x['country'] == country)
    side = 'withUsmca' if usmca else 'withoutUsmca'
    for b in c['cells'][hts[:4]][side]['breakdown']:
        if hts in b['lines']:
            return b['total']
    raise SystemExit(f'no cell for {country} {hts}')


def expect(country, hts, want, usmca=False):
    got = cell_total(country, hts, usmca)
    if got != want:
        raise SystemExit(f'rate drift: {country} {hts} usmca={usmca}: matrix says "{got}", text says "{want}"')


# Every rate quoted in the prose below is checked here first.
expect('Thailand', '4011.10.10.40', '16.5% not a car or light-truck part / 29% car or light-truck part')
expect('Vietnam', '4011.10.10.40', '16.5% not a car or light-truck part / 29% car or light-truck part')
expect('Cambodia', '4011.10.10.40', '14% not a car or light-truck part / 29% car or light-truck part')
expect('Malaysia', '4011.10.10.40', '14% not a car or light-truck part / 29% car or light-truck part')
expect('Indonesia', '4011.10.10.40', '14% not a car or light-truck part / 29% car or light-truck part')
expect('India', '4011.10.10.40', '14% not a car or light-truck part / 29% car or light-truck part')
expect('Japan', '4011.10.10.40', '12.5% not a car or light-truck part / 15% car or light-truck part')
expect('South Korea', '4011.10.10.40', '12.5% not a car or light-truck part / 15% car or light-truck part')
expect('Germany', '4011.10.10.40', '10% not a car or light-truck part / 15% car or light-truck part')
expect('Taiwan', '4011.10.10.40', '10% not a car or light-truck part / 15% car or light-truck part')
expect('United Kingdom', '4011.10.10.40', '10% car or light-truck part / 14% not a car or light-truck part')
expect('China', '4011.10.10.40', '41.5% not a car or light-truck part / 54% car or light-truck part')
expect('Brazil', '4011.10.10.40', '29% car or light-truck part / 41.5% not a car or light-truck part')
expect("Côte d'Ivoire", '4011.10.10.40', 'Free not a car or light-truck part / 25% car or light-truck part')
expect('Mexico', '4011.10.10.40', '14% not a car or light-truck part / 29% car or light-truck part')
expect('Mexico', '4011.10.10.40', 'Free', usmca=True)
expect('Canada', '4011.10.10.40', 'Free', usmca=True)
expect('Canada', '4016.93.50.10', '62.5%')
expect('Canada', '4016.93.50.10', '50%', usmca=True)
expect('Japan', '4011.20.10.15', '12.5% not a vehicle part / 15% car or light-truck part / 29% truck or bus part')
expect('China', '4011.20.10.15', '41.5% not a vehicle part / 54% car or light-truck part / 54% truck or bus part')
expect('Malaysia', '4015.12.10.10', '10%')
expect('Malaysia', '4015.19.11.10', '13%')
expect('Thailand', '4015.12.10.10', '12.5%')
expect('China', '4015.12.10.10', '112.5%')
expect('China', '4016.93.10.10', '40%')
expect('China', '4001.22.00.20', '25%')
expect('Indonesia', '4001.22.00.20', 'Free')
expect('Thailand', '4001.22.00.20', 'Free')
expect("Côte d'Ivoire", '4001.22.00.20', 'Free')
expect('Germany', '4002.19.00.15', '10%')
expect('Japan', '4002.19.00.15', '12.5%')
expect('South Korea', '4002.19.00.15', '12.5%')
expect('India', '4011.80.20.10', '14%')
expect('India', '4011.70.00.10', '10%')

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------


def fr_source(num, document, publisher='Federal Register', signed=None):
    m = FRMETA[num]
    return {
        'id': f'fr-{num}',
        'publisher': publisher,
        'citation': m['citation'],
        'document': document,
        'title': m['title'],
        'signed': signed,
        'published': m['publication_date'],
        'url': m['html_url'],
    }


NEW_SOURCES = {
    'hts-ch40': {
        'id': 'hts-ch40',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 40',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 40: Rubber and Articles Thereof',
        'signed': None,
        'published': '2026-10-07',
        'url': CH40_PDF,
    },
}
for num, doc in [
    ('2015-19615', 'Notice (ITA): AD and CVD orders'),
    ('2026-14293', 'Notice (ITA): continuation of orders'),
    ('2026-13703', 'Notice (ITC): five-year review determination'),
    ('2021-15270', 'Notice (ITA): AD orders'),
    ('2021-15271', 'Notice (ITA): CVD order'),
    ('2021-15108', 'Notice (ITC): final determinations'),
    ('2026-19628', 'Notice (ITC): full five-year reviews'),
    ('2026-19931', 'Notice (ITA): sunset review results'),
    ('2026-20377', 'Notice (ITA): sunset review results'),
    ('2019-02656', 'Notice (ITA): AD order'),
    ('2019-02657', 'Notice (ITA): CVD order'),
    ('2024-19390', 'Notice (ITA): continuation of orders'),
    ('2024-29606', 'Notice (ITA): AD order'),
    ('2024-28513', 'Notice (ITC): final determination'),
    ('2017-04432', 'Notice (ITA): AD order'),
    ('2017-04433', 'Notice (ITA): CVD orders'),
    ('2023-11143', 'Notice (ITA): continuation of orders'),
    ('2019-09670', 'Notice (ITA): revocation of orders'),
    ('2018-15879', 'Notice (ITA): revocation of CVD order'),
    ('2024-21217', 'Notice (USTR)'),
    ('2025-23892', 'Notice (USTR)'),
]:
    NEW_SOURCES[f'fr-{num}'] = fr_source(num, doc)


def src(sid):
    if sid in NEW_SOURCES:
        return NEW_SOURCES[sid]
    if sid in GEN_SOURCES:
        return GEN_SOURCES[sid]
    return REF_SOURCES[sid]


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


def fix_source_quirks(page):
    for s in page.get('sources', []):
        if s['id'] == 'cbp-section-232-additional-faqs-autos':
            s['citation'] = 'CBP web page (last modified December 19, 2025)'
            s['title'] = 'Section 232 Additional FAQs: Automobiles and Automobile Parts'


# ---------------------------------------------------------------------------------------------------
# Chapter + labels
# ---------------------------------------------------------------------------------------------------
SHORT = 'Rubber, Tires & Rubber Goods'

GROUP_LABELS = {
    '4001': ('Natural rubber: latex, smoked sheets, TSNR, balata, gutta-percha, chicle', 'Natural rubber'),
    '4002': ('Synthetic rubber: SBR, butadiene, butyl, chloroprene, NBR, EPDM, isoprene', 'Synthetic rubber'),
    '4003': ('Reclaimed rubber', 'Reclaimed rubber'),
    '4004': ('Rubber waste, scrap, powder and crumb', 'Rubber scrap & crumb'),
    '4005': ('Compounded rubber, unvulcanized (masterbatch, solutions, sheets)', 'Compounded rubber'),
    '4006': ('Other unvulcanized forms: camel-back retread strips, rods, tubes, discs', 'Unvulcanized shapes'),
    '4007': ('Vulcanized rubber thread and cord', 'Rubber thread'),
    '4008': ('Plates, sheets, strip, rods and profiles of vulcanized rubber, incl. foam', 'Rubber sheet & profiles'),
    '4009': ('Tubes, pipes and hoses, incl. brake hoses', 'Hoses & tubes'),
    '4010': ('Conveyor belts and transmission belts (V-belts, timing belts)', 'Conveyor & drive belts'),
    '4011': ('New pneumatic tires: car, light truck, truck and bus, OTR, farm, aircraft, motorcycle, bicycle', 'New tires'),
    '4012': ('Retreaded and used tires, solid tires, tire treads and flaps', 'Retreaded & used tires'),
    '4013': ('Inner tubes', 'Inner tubes'),
    '4014': ('Hygienic and pharmaceutical articles: condoms, nursing nipples', 'Condoms & hygienic'),
    '4015': ('Rubber gloves and apparel: medical, surgical, nitrile and latex gloves, aprons', 'Gloves & apparel'),
    '4016': ('Other articles of vulcanized rubber: gaskets, seals, O-rings, mats, bands, anti-vibration parts', 'Gaskets, seals & other'),
    '4017': ('Hard rubber (ebonite) and articles of hard rubber', 'Hard rubber'),
}

BLURBS = {
    '4001': (
        'Natural rubber latex, ribbed smoked sheets and technically specified natural rubber (TSNR, e.g. SMR, STR, SIR grades) are Free, and '
        'heading 4001 is on the Section 301 general exemption list, so most origins pay nothing at all. China is the exception: List 3 adds '
        '25%.',
        ['natural rubber', 'rubber latex', 'TSNR', 'SMR 20', 'STR 20', 'SIR 20', 'ribbed smoked sheet', 'gutta-percha', 'chicle'],
    ),
    '4002': (
        'Synthetic rubber in primary forms is Free: SBR (incl. E-SBR, S-SBR and SBS), butadiene rubber, butyl and halobutyl, chloroprene '
        '(neoprene), nitrile (NBR), EPDM and isoprene. The extra duty by country is charged on top.',
        ['SBR', 'styrene-butadiene rubber', 'SBS', 'butyl rubber', 'neoprene', 'nitrile rubber', 'NBR latex', 'EPDM', 'polybutadiene'],
    ),
    '4003': ('Reclaimed rubber in primary forms, plates, sheets or strip is Free.', ['reclaimed rubber', 'devulcanized rubber']),
    '4004': (
        'Rubber waste, parings and scrap, and the powders and granules made from it (crumb rubber), are Free.',
        ['crumb rubber', 'rubber scrap', 'rubber powder', 'tire scrap', 'rubber granules'],
    ),
    '4005': (
        'Unvulcanized compounded rubber, masterbatch with carbon black or silica, rubber solutions and dispersions, and uncured sheets are '
        'Free.',
        ['rubber compound', 'masterbatch', 'carbon black masterbatch', 'rubber solution', 'uncured rubber sheet'],
    ),
    '4006': (
        'Camel-back strips for retreading tires pay 2.9%, other unvulcanized forms 2.7%, and unvulcanized forms of natural rubber are Free.',
        ['camel-back', 'retread rubber', 'tread rubber', 'unvulcanized rubber rod'],
    ),
    '4007': ('Vulcanized rubber thread and cord are Free.', ['rubber thread', 'elastic rubber thread', 'rubber cord']),
    '4008': (
        'Sheets, strip and profiles of vulcanized rubber: cellular (foam) rubber other than natural pays 3.3%, noncellular profiles 2.9%; natural '
        'rubber sheet and foam are Free.',
        ['rubber sheet', 'neoprene sheet', 'foam rubber', 'sponge rubber', 'rubber strip', 'EPDM profile', 'rubber seal profile'],
    ),
    '4009': (
        'All hoses and tubes pay 2.5%. Brake hoses with fittings for cars, trucks, buses and motorcycles (statistical suffix .0020) are on the '
        'Section 232 vehicle-parts lists, so they pay 25% when they are vehicle parts.',
        ['rubber hose', 'hydraulic hose', 'brake hose', 'air hose', 'garden hose', 'radiator hose', 'fuel hose', 'rubber tubing'],
    ),
    '4010': (
        'Conveyor and transmission belts pay 1.9% to 8%: belts with man-made-fiber textile over 20 cm wide 8%, V-belts and V-ribbed belts '
        'with textile 3.4%, timing belts 3.3%–8%.',
        ['conveyor belt', 'V-belt', 'serpentine belt', 'timing belt', 'drive belt', 'fan belt', 'transmission belt'],
    ),
    '4011': (
        'Car tires pay 4% (radial) or 3.4%; bus and truck tires 4% or 3.4%; tires for aircraft, motorcycles, bicycles, farm and forestry '
        'machines and herring-bone tread OTR tires are Free. Car, light-truck and truck tires also carry the 25% Section 232 vehicle-parts '
        'duty when they are vehicle parts, and antidumping or countervailing duties from six countries.',
        ['car tires', 'passenger tires', 'light truck tires', 'truck tires', 'bus tires', 'OTR tires', 'tractor tires', 'motorcycle tires', 'bicycle tires', 'ATV tires', 'aircraft tires'],
    ),
    '4012': (
        'Retreaded car and truck tires pay 4% (radial) or 3.4%; used tires, solid and cushion tires, and retreads for tractors and aircraft are '
        'Free; tire flaps and treads 2.7% or 4.2%.',
        ['retreaded tires', 'used tires', 'solid tires', 'cushion tires', 'tire flaps', 'tire tread', 'forklift tires'],
    ),
    '4013': (
        'Inner tubes for cars, buses and trucks pay 3.7% (and are Section 232 vehicle parts); bicycle inner tubes and tubes for farm tires are '
        'Free.',
        ['inner tube', 'bicycle inner tube', 'truck inner tube', 'motorcycle inner tube'],
    ),
    '4014': (
        'Condoms (sheath contraceptives) and nursing nipples are Free; other hygienic or pharmaceutical articles of rubber pay 4.2%.',
        ['condoms', 'nursing nipples', 'baby bottle nipples', 'finger cots', 'enema bulbs', 'hot water bottles'],
    ),
    '4015': (
        'Medical and surgical gloves (4015.12.10) are Free; other gloves for medical, dental or veterinary use 14%; seamless non-medical '
        'gloves, such as disposable nitrile or latex gloves, 3%; other gloves 14%; aprons and other apparel 4%. China pays 100% extra on '
        'medical gloves.',
        ['nitrile gloves', 'latex gloves', 'exam gloves', 'surgical gloves', 'disposable gloves', 'household rubber gloves', 'rubber apron'],
    ),
    '4016': (
        'Gaskets, washers, O-rings and oil seals pay 2.5%; floor mats 2.7%; erasers, fenders and inflatables 4.2%; household articles 3.4%; '
        'pet toys 4.3%; articles of natural rubber, including rubber bands, are Free. Mechanical articles for motor vehicles (4016.99.60.10) '
        'are on the Section 232 vehicle-parts lists.',
        ['O-ring', 'gasket', 'oil seal', 'rubber washer', 'rubber mat', 'rubber bands', 'eraser', 'anti-vibration mount', 'rubber bushing', 'dock fender'],
    ),
    '4017': ('Hard rubber (ebonite) in all forms, including waste and articles of hard rubber, pays 2.7%.', ['ebonite', 'hard rubber']),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 40: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    elif e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    elif e['code'] == 'A+':
        e['name'] = 'GSP, least-developed beneficiary countries only — expired December 31, 2020'
    elif e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — renewed through December 31, 2026'
    elif e['code'] == 'B':
        e['name'] = 'Automotive Products Trade Act (original-equipment parts from Canada)'
    elif e['code'] == 'C':
        e['name'] = 'Agreement on Trade in Civil Aircraft (civil aircraft parts)'
    elif e['code'] == 'S':
        e['name'] = 'United States–Mexico–Canada Agreement (USMCA)'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
th, mx, ca, jp, my, vn, idn, cn, kr, kh = (
    by_c_all[n] for n in ('Thailand', 'Mexico', 'Canada', 'Japan', 'Malaysia', 'Viet Nam', 'Indonesia', 'China', 'Rep. of Korea', 'Cambodia')
)

ov['seo']['title'] = 'HTS Chapter 40 Tariffs 2026: Tire, Rubber & Rubber Glove Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. tariff table for all 198 HTS Chapter 40 lines: natural and synthetic rubber, tires, hoses, belts, gloves, condoms, '
    'gaskets and seals. Base rates from Free to 14%, plus Section 232 on vehicle tires, Section 301 by country, China lists and tire AD/CVD.'
)
ov['seo']['keywords'] = [
    'hts chapter 40',
    'htsus chapter 40',
    'chapter 40 hts code',
    'tariffs on tires',
    'tire tariffs',
    'rubber tariffs',
    'tariffs on rubber products',
    'hs code for tires',
    'rubber tariff code',
    'tires & rubber industry tariffs',
]

ov['intro'] = (
    'Chapter 40 covers rubber from raw material to finished goods: natural rubber latex and TSNR, synthetic rubber (SBR, butyl, EPDM, '
    'nitrile), compounded rubber, hoses, conveyor and drive belts, **tires**, inner tubes, condoms, **rubber gloves**, gaskets, seals and other '
    'rubber articles. Base rates are low: 120 of the 198 tariff lines are dutiable, mostly at 2.5%–4% (car and truck tires 4% or 3.4%), with '
    '14% on some gloves at the top; raw natural and synthetic rubber is Free.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}, and **new tires** (heading 4011) were {fmt_usd(TIRES)} of it '
    f'({TIRE_SHARE}%). **Thailand** ({fmt_usd(imp("Thailand"))}) is the largest supplier, ahead of Mexico, Canada, Japan, Malaysia (mostly '
    f'gloves) and Vietnam; China fell to {fmt_usd(imp("China"))}, down {abs(chg("China"))}%. Three things decide what a shipment pays on top of '
    'the base rate. (1) **Section 232 vehicle parts:** car tires, light-truck and truck tires, brake hoses, inner tubes and other parts on the '
    'U.S. note 33(g) and 38(i) lists pay **25%** when they are parts of passenger vehicles, light trucks or medium- and heavy-duty vehicles; '
    'passenger-vehicle parts pay 15% in total from Japan, the EU, South Korea and Taiwan and 10% on the UK list, and USMCA-qualifying goods '
    'pay nothing. (2) **Section '
    '301 by country** since July 24, 2026: +10% or +12.5% for 60 economies (10% or 12.5% in total for the EU, Japan, Korea and Taiwan), '
    'except on natural rubber, which is exempt; **China** adds List 1, 3 or 4A duties and **100% on medical gloves**. (3) **Antidumping and '
    'countervailing duties** on passenger, light-truck, truck, bus and off-the-road tires from China, Korea, Taiwan, Thailand, Vietnam and '
    'India. Tires must also meet DOT safety standards, and medical gloves and condoms are FDA-regulated devices.'
)

ov['workedExamples'] = [
    {
        'title': 'Passenger-car radial tire from Thailand',
        'line': '4011.10.10.40',
        'body': 'The base rate is 4%. A car tire is a passenger-vehicle part on the U.S. note 33(g) list, so it pays the 25% Section 232 duty '
        '(9903.94.05) and, under note 52(f), not the 12.5% Section 301 duty: **29%**, $2,900 on a $10,000 shipment. Thai passenger and '
        'light-truck tires are also under a 2021 antidumping order (86 FR 38011), so CBP collects the exporter\'s antidumping cash deposit on '
        'top. The same tire pays 15% in total from Japan, Korea, Taiwan or the EU, and nothing from Mexico or Canada under USMCA.',
    },
    {
        'title': 'Disposable nitrile exam gloves from Malaysia vs China',
        'line': '4015.12.10.10',
        'body': 'Medical gloves are Free under the base rate. Malaysia adds the 10% Section 301 duty (9903.05.54): **10%**, $1,000 on $10,000. '
        'From China the line pays 12.5% (9903.05.31) plus **100%** (9903.91.08, from January 1, 2026): **112.5%**. Non-medical seamless '
        'gloves (4015.19.11, 3%) pay 13% from Malaysia. Medical gloves are FDA devices that need a 510(k) clearance and a registered foreign '
        'establishment.',
    },
    {
        'title': 'Natural rubber (TSNR) from Indonesia or Côte d\'Ivoire',
        'line': '4001.22.00.20',
        'body': 'Technically specified natural rubber is Free, and heading 4001 is on the Section 301 general exemption list (U.S. note 52(b), '
        '9903.05.86) and the Brazil exemption list: **Free** from Indonesia, Thailand, Malaysia, Vietnam, Côte d\'Ivoire or Liberia. Only '
        'China pays extra (25%, List 3). Once the rubber is compounded with carbon black or vulcanizing agents it moves to heading 4005 and '
        'loses the exemption.',
    },
    {
        'title': 'O-rings and seals from Canada',
        'line': '4016.93.50.10',
        'body': 'Gaskets, washers and seals not for vehicles pay 2.5%. USMCA removes the base rate and the 10% Section 301 duty (9903.05.93), but '
        '4016.93.50 is on the Section 338 list (U.S. note 51(b)(3), 9903.03.14), which applies even when USMCA is claimed: **50%**, $5,000 on a '
        '$10,000 shipment. Non-qualifying seals pay 62.5%. Seals of 4016.93.10 (for chapter 87 vehicles) are not on the list.',
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 40 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y}: before '
    'the 2026 Section 301 and Section 338 duties, and before the end of the IEEPA duties.'
)

ov['notes']['chapterNotes'] = (
    '**Note 1.** Except where the context otherwise requires, throughout the tariff schedule the expression "rubber" means the following '
    'products, whether or not vulcanized or hard: natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums, synthetic '
    'rubber, factice derived from oils and such substances reclaimed.\n\n'
    '**Note 2.** This chapter does not cover: (a) goods of section XI (textiles and textile articles); (b) footwear or parts thereof of chapter '
    '64; (c) headgear or parts thereof (including bathing caps) of chapter 65; (d) mechanical or electrical appliances or parts thereof of '
    'section XVI (including electrical goods of all kinds), of hard rubber; (e) articles of chapter 90, 92, 94 or 96; or (f) articles of '
    'chapter 95 (other than sports gloves, mittens and mitts and articles of headings 4011 to 4013).\n\n'
    '**Note 3.** In headings 4001 to 4003 and 4005, the expression "primary forms" applies only to: (a) liquids and pastes (including latex, '
    'whether or not prevulcanized, and other dispersions and solutions); (b) blocks of irregular shape, lumps, bales, powders, granules, '
    'crumbs and similar bulk forms.\n\n'
    '**Note 4.** In note 1 and in heading 4002, "synthetic rubber" applies to: (a) unsaturated synthetic substances which can be irreversibly '
    'transformed by vulcanization with sulfur into non-thermoplastic substances which, at 18°C–29°C, will not break on being extended to three '
    'times their original length and will return, after being extended to twice their original length, within 5 minutes, to not more than '
    '1-1/2 times their original length (substances necessary for cross-linking may be added; extenders, plasticizers and fillers may not); '
    '(b) thioplasts (TM); and (c) natural rubber modified by grafting or mixing with plastics, depolymerized natural rubber, and mixtures of '
    'unsaturated synthetic substances with saturated synthetic high polymers, provided they meet the requirements in (a).\n\n'
    '**Note 5.** (a) Headings 4001 and 4002 do not apply to any rubber or mixture of rubbers compounded, before or after coagulation, with: '
    '(i) vulcanizing agents, accelerators, retarders or activators (other than those added to prepare prevulcanized latex); (ii) pigments or '
    'other coloring matter, other than for identification; (iii) plasticizers or extenders (except mineral oil in oil-extended rubber), '
    'fillers, reinforcing agents, organic solvents or other substances, except those permitted under (b). (b) The presence of the following '
    'does not affect classification in heading 4001 or 4002, provided the rubber keeps its essential character as a raw material: (i) '
    'emulsifiers or antitack agents; (ii) small amounts of breakdown products of emulsifiers; (iii) very small amounts of heat-sensitive '
    'agents, cationic surface-active agents, antioxidants, coagulants, crumbling agents, freeze-resisting agents, peptizers, preservatives, '
    'stabilizers, viscosity-control agents or similar special-purpose additives.\n\n'
    '**Note 6.** For heading 4004, "waste, parings and scrap" means rubber waste, parings and scrap from the manufacture or working of rubber '
    'and rubber goods definitely not usable as such because of cutting-up, wear or other reasons.\n\n'
    '**Note 7.** Thread wholly of vulcanized rubber, of which any cross-sectional dimension exceeds 5 mm, is classified as strip, rods or '
    'profile shapes, of heading 4008.\n\n'
    '**Note 8.** Heading 4010 includes conveyor or transmission belts or belting of textile fabric impregnated, coated, covered or laminated '
    'with rubber or made from textile yarn or cord impregnated, coated, covered or sheathed with rubber.\n\n'
    '**Note 9.** In headings 4001, 4002, 4003, 4005 and 4008, "plates", "sheets" and "strip" apply only to plates, sheets and strip, and to '
    'blocks of regular geometric shape, uncut or simply cut to rectangular (including square) shape, whether or not having the character of '
    'articles and whether or not printed or otherwise surface-worked, but not otherwise cut to shape or further worked. In heading 4008 '
    '"rods" and "profile shapes" apply only to such products, whether or not cut to length or surface-worked but not otherwise worked.'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** For the purposes of subheading 4008.21, the rate of duty "Free (B)" appearing in the "Special" subcolumn applies only to articles '
    'measuring not more than 38.1 cm in width and not more than 45.7 cm in length.\n\n'
    '**2.** For the purposes of subheading 4008.29, the rate of duty "Free (C)" appearing in the "Special" subcolumn applies only to profile '
    'shapes that are cut to size.\n\n'
    '**3.** For the purposes of heading 4017, the rate of duty "Free (C)" appearing in the "Special" subcolumn applies only to tubes and pipes '
    'having attached fittings.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 182 (all but natural rubber); Brazil: 182; China lists 1, 3 and 4A: 191; China medical gloves '
            '100%: 2; Section 232 vehicle parts: 22 (passenger vehicles) and 14 (medium and heavy vehicles); Canada Section 338: 6 (also on '
            'USMCA goods); Russia 35% in lieu of column 2: 66'
        )

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
fix_source_quirks(tu)
tu['h1'] = f'HTS Chapter 40: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 40 Tariff Updates 2026: Tire & Rubber Duties, Section 232 Auto Parts, Section 301, AD/CVD | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 40 (tires, natural and synthetic rubber, gloves, hoses, seals) since January 2025: '
    'Section 232 auto-parts and truck-parts duties on tires, the 2026 Section 301 tariffs, China lists and 100% on medical gloves, Canada '
    'Section 338, tire antidumping orders and the end of IEEPA.',
    'keywords': [
        'tire tariffs 2026',
        'us tariffs on tires',
        'section 232 tires',
        'section 232 auto parts tariff list',
        'tariffs on tires from china',
        'tariff on tires from thailand',
        'section 301 tariffs rubber',
        'usmca tires',
        'tire anti dumping duty',
        'medical gloves section 301',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 40 base rate changed**: all 198 lines carry the same General, Special and Column 2 '
    'rates, from Free to 14%.\n\n'
    'Everything that changed sits on top of the base rate. **Tires became Section 232 auto parts** on May 3, 2025: car tires, light-truck and '
    'truck radials, retreads, inner tubes, brake hoses and other listed parts pay 25%, cut to 10% in total for the UK and 15% in total for '
    'the EU, Japan, South Korea and Taiwan as their deals took effect, with a second 25% duty on medium- and heavy-duty truck parts since November 1, 2025. '
    'The IEEPA duties (19%–20% on Thailand, Vietnam, Malaysia and Indonesia, 25%–50% on India, up to 145% on China) **ended February 24, '
    '2026**, and the 10% Section 122 surcharge that followed expired July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a '
    '**Section 301 tariff** (+10% or +12.5%), except natural rubber and Section 232 vehicle parts. China pays its List 1, 3 and 4A duties and, '
    'since January 1, 2026, **100% on medical gloves**. Since **August 22, 2026** three Canadian subheadings of seals and natural-rubber '
    'articles pay a **50% Section 338 duty**, even under USMCA. Tire **antidumping and countervailing orders** stay in force: the China '
    'passenger-tire orders were continued in July 2026, and the 2021 orders on Korea, Taiwan, Thailand and Vietnam are in full five-year '
    'review.'
)
tu['scope'] = (
    'Measures that reach Chapter 40 from any country: the Section 232 duties on automobile parts (U.S. note 33) and on medium- and heavy-duty '
    'vehicle parts (note 38) with the UK, EU, Japan, Korea and Taiwan deal rates; the 2026 Section 301 tariffs on 60 economies and on Brazil; '
    'the China Section 301 lists and the 2024 four-year-review increase on medical gloves; the Canada Section 338 duties; Russia\'s rates in '
    'lieu of column 2; the scheduled Nicaragua Section 301 duty; and the 2025–2026 IEEPA and Section 122 duties that have ended. Antidumping '
    'and countervailing duty orders on tires are listed for reference; the calculator does not model them. For the rate each supplier pays, '
    'see Rates by country.'
)

NO_52J = 'No Chapter 40 line is on a note 52(j) country exception list. '
PARTS_301 = (
    'Tires, brake hoses, inner tubes and the other note 33(g) and 38(i) parts that pay a Section 232 duty are exempt from the Section 301 '
    'duty (note 52(f), 9903.05.90). Natural rubber (4001) is on the general exemption list (note 52(b)). '
)
IN_EFFECT_TEXT = {
    'Thailand': (
        'Base rate + 12.5% (9903.05.77) on 182 of 198 lines. ' + PARTS_301 + NO_52J + 'Passenger, light-truck and truck and bus tires from '
        'Thailand are also under antidumping orders (2021 and 2024). The 19% IEEPA reciprocal duty (9903.02.61, from August 7, 2025) ended '
        'February 24, 2026.',
        'A Thai passenger-car radial pays 29% (4% + 25% Section 232) plus the antidumping deposit; Thai natural rubber stays Free; Thai medical '
        'gloves pay 12.5% and synthetic rubber 12.5%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94) and no Section 232 vehicle-parts duty (9903.94.06, 9903.74.10). '
        'Non-qualifying goods pay the base rate + 10% (9903.05.55), or 25% Section 232 on listed vehicle parts. Mexico is not subject to the '
        'Canada Section 338 duties. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying Mexican tires, hoses, belts and seals enter Free; a non-qualifying car tire pays 29%.',
    ),
    'Canada': (
        'Three measures. The 2026 Section 301 duty (+10%, 9903.05.29) and the Section 232 vehicle-parts duties do not apply to USMCA-qualifying '
        'goods (9903.05.93, 9903.94.06, 9903.74.10). The Section 338 duty (+50%, from August 22, 2026, 9903.03.14) applies to products of '
        'Canada in 4016.93.50 (gaskets, washers and seals other than for chapter 87 vehicles), 4016.99.15 (caps, lids, seals and other '
        'closures) and 4016.99.35 (other articles of natural rubber, incl. rubber bands), and U.S. note 51(a) applies it even when USMCA is '
        'claimed; civil-aircraft articles are exempt (9903.03.16). The September 15, 2026 list revisions changed no Chapter 40 entry. The 35% '
        'IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying Canadian tires and hoses pay nothing; Canadian O-rings and seals of 4016.93.50 pay 50% even under USMCA, 62.5% if not '
        'USMCA-qualifying.',
    ),
    'Japan': (
        'Japan pays its base rate or 12.5%, whichever is higher (9903.05.49, note 52(k)). Passenger-vehicle and light-truck parts on the note '
        '33(g) list pay 15% in total (9903.94.43, since September 16, 2025) and no Section 301 duty; listed parts of medium- and heavy-duty '
        'vehicles pay the base rate + 25% (9903.74.08), which has no Japan deal rate. The 15% IEEPA rate ended February 24, 2026.',
        'A Japanese car tire pays 15% in total; Japanese synthetic rubber 12.5%; a Japanese truck tire for a heavy truck 29%.',
    ),
    'Malaysia': (
        'Base rate + 10% (9903.05.54). ' + PARTS_301 + NO_52J + 'The 19% IEEPA reciprocal duty (9903.02.39) ended February 24, 2026.',
        'Malaysian medical nitrile or latex gloves (Free) pay 10%, seamless non-medical gloves 13%; Malaysian natural rubber stays Free.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + PARTS_301 + NO_52J + 'Vietnamese passenger and light-truck tires are under a 2021 '
        'countervailing duty order. The 20% IEEPA reciprocal duty (9903.02.69) ended February 24, 2026.',
        'A Vietnamese car tire pays 29% (Section 232) plus the countervailing duty deposit; Vietnamese gloves 12.5%.',
    ),
    'Indonesia': (
        'Base rate + 10% (9903.05.45). ' + PARTS_301 + NO_52J + 'The 19% IEEPA reciprocal duty (9903.02.27) ended February 24, 2026.',
        'Indonesian natural rubber (TSNR) stays Free; an Indonesian car tire pays 29%.',
    ),
    'China': (
        'Several Section 301 duties stack. The 2026 action adds +12.5% (9903.05.31) on every line except natural rubber. The 2018–2019 lists '
        'add +25% on aircraft tires (List 1, 9903.88.01), +25% on 176 lines (List 3, 9903.88.03) and +7.5% on 11 lines (List 4A, 9903.88.15: '
        'camel-back strips, some brake and other hoses with fittings, metal-reinforced conveyor belts, retreaded tires of 4012.19.80, '
        'inflatables, household articles, handles, knobs and closures). Medical and surgical gloves (4015.12.10) pay +100% (9903.91.08) since '
        'January 1, 2026, up from 50% in 2025. Condoms, nursing nipples, other hygienic articles, erasers and pet toys are on no China list. '
        'No product exclusion in note 20 covers a Chapter 40 line. Listed vehicle parts pay the 25% Section 232 duty instead of the 12.5%. '
        'Passenger, light-truck, truck and bus tires are under AD/CVD orders. The IEEPA duties ended February 24, 2026, and USTR\'s four-year '
        'review kept the lists in place.',
        'A Chinese car tire pays 54% (4% + 25% List 3 + 25% Section 232) before AD/CVD deposits; Chinese medical gloves 112.5%; gaskets and '
        'seals 40%; Chinese natural rubber 25%.',
    ),
    'South Korea': (
        'Korea pays its base rate or 12.5%, whichever is higher (9903.05.71, note 52(k)); KORUS (KR) makes most base rates Free but does not '
        'remove this duty. Passenger-vehicle parts on the note 33(g) list pay 15% in total (9903.94.63, since November 1, 2025); truck and bus '
        'parts that are not passenger-vehicle parts pay 25% (9903.74.08). Korean passenger and light-truck tires are under a 2021 antidumping '
        'order. The 15% IEEPA rate ended February 24, 2026.',
        'A Korean car tire pays 15% in total plus the antidumping deposit; Korean synthetic rubber 12.5%.',
    ),
    'Cambodia': (
        'Base rate + 10% (9903.05.28). ' + PARTS_301 + NO_52J + 'The 19% IEEPA reciprocal duty (9903.02.11) ended February 24, 2026.',
        'A Cambodian car tire pays 29% as a passenger-vehicle part; a Cambodian truck tire for a heavy truck 29%.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10% (the 14% glove lines) nothing is added '
        '(9903.05.38, note 52(k)). Passenger-vehicle parts on the note 33(g) list pay 15% in total (9903.94.53, from August 1, 2025); truck and '
        'bus parts that are not passenger-vehicle parts pay 25% (9903.74.08). ' + NO_52J + 'This replaced the 15%-in-total IEEPA rate '
        '(9903.02.20), which ended February 24, 2026.',
        'A German or French car tire pays 15% in total; EU synthetic rubber, hoses, belts and seals pay 10%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + PARTS_301 + NO_52J + 'Indian off-the-road tires are under antidumping and countervailing duty '
        'orders (2017, continued 2023). The IEEPA duties on India — 25% reciprocal from August 7, 2025 plus 25% from August 27, 2025 — ended in '
        'February 2026.',
        'Indian OTR tires pay 10% (Free lines) or 14% (radial 4011.80.20) plus AD/CVD deposits; an Indian car tire pays 29%.',
    ),
    'Taiwan': (
        'Taiwan pays its base rate or 10%, whichever is higher (9903.05.76). Passenger-vehicle parts on the note 33(g) list pay 15% in total '
        '(9903.94.67, since May 1, 2026); truck and bus parts that are not passenger-vehicle parts pay 25% (9903.74.08). Taiwanese passenger and '
        'light-truck tires are under a 2021 antidumping order. The 20% IEEPA duty (9903.02.60) ended February 24, 2026.',
        'A Taiwanese car tire pays 15% in total plus the antidumping deposit; other rubber goods 10%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). Natural '
        'rubber is exempt from both (U.S. notes 50(a)(ii) and 52(b)); listed vehicle parts pay the 25% Section 232 duty instead of both (notes '
        '50(a)(vi) and 52(f)). The 10% reciprocal and 40% IEEPA duties on Brazil ended February 24, 2026.',
        'A Brazilian car tire pays 29% (Section 232) instead of 41.5%; other Brazilian rubber goods pay 37.5% on top of the base rate.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). Passenger-vehicle parts on the UK list in note 33(j) pay 10% in total (9903.94.32): car tires, '
        'on-highway radial light-truck and truck tires (4011.20.10.05 and .15), retreads of 4012.19.80, used tires of 4012.20.60, brake hoses, '
        'inner tubes and mechanical articles for motor vehicles. Other note 33(g) parts, such as off-highway truck tires, pay 25%. ' + NO_52J
        + 'The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'A British car tire pays 10% in total; British gaskets and seals 12.5%.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — 10% to 80% — and 66 Chapter 40 lines pay 35% in their place (9903.90.08, U.S. note '
        '30), plus +12.5% (9903.05.66) on all lines except natural rubber.',
        'Russian synthetic rubber pays 32.5% or more; Russian tires are effectively priced out.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Sri Lanka, Bangladesh and Pakistan +10%; Türkiye, Chile, the Philippines, Singapore and South Africa +12.5%; '
    'Switzerland 12.5% in total (9903.05.74). ' + PARTS_301 + NO_52J + 'Countries outside the 60 economies, such as Serbia, Liberia, Ghana '
    'and Côte d\'Ivoire, pay only the base rate, plus the Section 232 duty on listed vehicle parts.',
    'A Sri Lankan solid tire or used tire pays 10% on top of its Free base rate; a Turkish hose 15%.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Sri Lanka, Türkiye, Chile, the Philippines, Pakistan, Switzerland)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    elif e['id'] == 'all-section-232-1':
        e['country'] = 'All countries (15% in total for Japan, the EU, South Korea and Taiwan; 10% in total on the UK list)'
        e['measure'] = 'Section 232 automobile parts (passenger vehicles and light trucks)'
        e['exemption'] = (
            'Covers 22 Chapter 40 lines on the U.S. note 33(g) list: brake hoses with fittings (4009.12, .22, .32, .42 suffix .0020), car tires '
            '(4011.10.10, 4011.10.50), radial bus and truck tires (4011.20.10), other retreaded tires (4012.19.40, 4012.19.80), used '
            'on-highway tires (4012.20.60), car and truck inner tubes (4013.10) and mechanical articles for motor vehicles (4016.99.60.10). It '
            'applies only to parts of passenger vehicles and light trucks: listed articles that are not such parts, and USMCA-qualifying parts, '
            'enter under 9903.94.06 with no Section 232 duty (U.S. note 33(h)). Parts that pay it are exempt from the 2026 Section 301 duty '
            '(note 52(f)) and the Brazil duty, and were outside the IEEPA reciprocal and Section 122 duties.'
        )
        e['whatItMeans'] = (
            'A car tire from Thailand, Vietnam, India or Cambodia pays its 4% base rate + 25%: $2,900 on a $10,000 shipment. From Japan, Korea, '
            'Taiwan or the EU it pays 15% in total, from the UK 10%, and a USMCA-qualifying tire from Mexico or Canada nothing.'
        )
        e['now'] = '+25% (15% in total for JP, EU, KR, TW; 10% for UK-listed parts)'
    elif e['id'] == 'all-section-232-2':
        e['measure'] = 'Section 232 medium- and heavy-duty vehicle parts'
        e['exemption'] = (
            'Covers 14 Chapter 40 lines on the U.S. note 38(i) list: brake hoses with fittings (suffix .0020), 4011.10.50, radial truck and bus '
            'tires other than light-truck (4011.20.10.15, .25, .35), retreaded tires of 4012.19.40 and .80, used on-highway tires (4012.20.60), '
            'inner tubes of 4013.10 and mechanical articles for motor vehicles (4016.99.60.10). It applies only to parts of medium- and '
            'heavy-duty vehicles (trucks, road tractors, buses); USMCA-qualifying parts enter under 9903.74.10 and articles that are not such '
            'parts under 9903.74.11. A part of a passenger vehicle or light truck pays the automobile-parts duty instead. There is no deal rate '
            'for the UK, EU, Japan, Korea or Taiwan. Exempt from the 2026 Section 301 duty (note 52(f)).'
        )
        e['whatItMeans'] = (
            'A radial truck tire for a heavy truck pays 4% + 25% = 29% from Japan, the EU, Thailand or Vietnam, and 54% from China (with List 3), '
            'before any truck and bus tire AD/CVD deposit; USMCA-qualifying truck tires pay nothing.'
        )
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff, EU rate + Section 232 auto parts, EU rate'
        e['now'] = '10% in total; 15% in total on passenger-vehicle parts'
    elif e['country'] == 'Japan':
        e['measure'] = 'Section 301 tariff, Japan rate + Section 232 auto parts, Japan rate'
        e['now'] = '12.5% in total; 15% in total on passenger-vehicle parts'
    elif e['country'] == 'South Korea':
        e['measure'] = 'Section 301 tariff, Korea rate + Section 232 auto parts, Korea rate'
        e['now'] = '12.5% in total; 15% in total on passenger-vehicle parts'
    elif e['country'] == 'Taiwan':
        e['measure'] = 'Section 301 tariff, Taiwan rate + Section 232 auto parts, Taiwan rate'
        e['now'] = '10% in total; 15% in total on passenger-vehicle parts'
    elif e['country'] == 'United Kingdom':
        e['measure'] = 'Section 301 tariff + Section 232 auto parts, UK rate'
        e['now'] = '+10%; 10% in total on UK-listed vehicle parts'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)'
        e['now'] = '+10% (non-USMCA); +50% on 3 subheadings, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action, Lists 1, 3 and 4A, and the 2024 review increase'
        e['now'] = '+37.5% on most lines; +20% on List 4A lines; +112.5% on medical gloves'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['country'] == 'Russia':
        e['measure'] = 'Section 301 tariff + rates in lieu of column 2 (66 lines)'
        e['now'] = '+12.5%; 35% in place of column 2 on 66 lines'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
    if e['country'] in ('Thailand', 'Vietnam', 'South Korea', 'Taiwan', 'China', 'India'):
        e['sourceIds'][-1:-1] = [s for s in {
            'Thailand': ['fr-2021-15270', 'fr-2024-29606'],
            'Vietnam': ['fr-2021-15271'],
            'South Korea': ['fr-2021-15270'],
            'Taiwan': ['fr-2021-15270'],
            'China': ['fr-2015-19615', 'fr-2019-02656', 'fr-2019-02657'],
            'India': ['fr-2017-04432', 'fr-2017-04433'],
        }[e['country']] if s not in e['sourceIds']]

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on three Chapter 40 subheadings',
        '50% on listed products of Canada after a three-day suspension lapsed. Chapter 40 is on the motor-vehicle list (9903.03.14): gaskets, '
        'washers and other seals not for chapter 87 vehicles (4016.93.50), caps, lids, seals, stoppers and other closures (4016.99.15) and other '
        'articles of natural rubber, including rubber bands (4016.99.35). Unlike the Section 301 duty, it applies to USMCA-qualifying goods too '
        '(U.S. note 51(a)); civil-aircraft articles are exempt (9903.03.16).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies reach 182 Chapter 40 lines',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); for the EU and Taiwan 10% in total and for Japan, Korea and '
        'Switzerland 12.5% in total, nothing added above that (note 52(k)). Natural rubber (heading 4001, 16 lines) is on the general '
        'exemption list (note 52(b)), and parts paying a Section 232 vehicle-parts duty are exempt (note 52(f)). No Chapter 40 line is on a '
        'country exception list. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on goods of Brazil (9903.05.01). Natural rubber is on the Brazil exemption list (U.S. note 50(a)(ii)), and listed vehicle parts '
        'paying a Section 232 duty are exempt (note 50(a)(vi)). From July 24 the 12.5% tariff (9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that do not enter under CAFTA-DR will pay +10% (9903.89.01) from January 1, 2027 and +15% from January 1, 2028, '
        'under USTR\'s December 2025 action. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
    'section-232-automobile-parts-2026-05-01': (
        'Taiwan: Section 232 auto parts capped at 15% in total',
        'Passenger-vehicle and light-truck parts of Taiwan on the note 33(g) list — car tires, light-truck and truck radials, brake hoses, inner '
        'tubes — pay 15% in total in place of the base rate and the 25% duty (9903.94.67).',
    ),
    'section-301-china-2024-four-year-review-2026-01-01': (
        'China: Section 301 duty on medical gloves rises to 100%',
        'Under USTR\'s 2024 four-year-review modification, the additional duty on Chinese medical and surgical gloves of 4015.12.10 went from '
        '50% (in 2025) to 100% (9903.91.08). Non-medical gloves were left out of the increase.',
    ),
    'section-232-automobile-parts-2025-11-01': (
        'South Korea: Section 232 auto parts capped at 15% in total',
        'Korean passenger-vehicle and light-truck parts on the note 33(g) list pay 15% in total (9903.94.63), retroactive to November 1, 2025, '
        'under the notice published December 4, 2025.',
    ),
    'section-232-medium-and-heavy-duty-vehicle-parts-2025-11-01': (
        'Section 232 duty on medium- and heavy-duty truck and bus parts',
        '25% on parts of medium- and heavy-duty vehicles listed in U.S. note 38(i) (9903.74.08), from every country with no deal rate: in '
        'Chapter 40, radial truck and bus tires, 4011.10.50, retreaded and used truck tires, truck and bus inner tubes, brake hoses with fittings '
        'and mechanical articles for motor vehicles. USMCA-qualifying parts are exempt (9903.74.10).',
    ),
    'section-232-automobile-parts-2025-09-16': (
        'Japan: Section 232 auto parts capped at 15% in total',
        'Japanese passenger-vehicle and light-truck parts on the note 33(g) list pay 15% in total in place of the base rate and the 25% duty '
        '(9903.94.43).',
    ),
    'section-232-automobile-parts-2025-08-01': (
        'EU: Section 232 auto parts capped at 15% in total',
        'EU passenger-vehicle and light-truck parts on the note 33(g) list pay 15% in total (9903.94.53), retroactive to August 1, 2025, under '
        'the notice published September 25, 2025.',
    ),
    'section-232-automobile-parts-2025-06-30': (
        'UK: Section 232 auto parts at 10% in total',
        'British parts on the UK list in note 33(j) — car tires, on-highway radial light-truck and truck tires, retreads, used tires, brake hoses, '
        'inner tubes — pay 10% in total (9903.94.32); other note 33(g) parts keep the 25% duty.',
    ),
    'section-232-automobile-parts-2025-05-03': (
        'Section 232 duty on automobile parts reaches tires, hoses and inner tubes',
        '25% on the automobile parts listed in U.S. note 33(g) (9903.94.05), from every country: in Chapter 40, car tires, radial bus and '
        'truck tires, certain retreaded and used tires, car and truck inner tubes, brake hoses with fittings and mechanical articles for motor '
        'vehicles, when they are parts of passenger vehicles or light trucks. USMCA-qualifying parts and listed articles that are not such parts '
        'enter under 9903.94.06.',
    ),
}
COUNTRY_FIX = {
    'section-232-automobile-parts-2025-08-01': 'European Union',
    'section-232-automobile-parts-2026-05-01': 'Taiwan',
    'section-232-automobile-parts-2025-11-01': 'South Korea',
    'section-232-automobile-parts-2025-09-16': 'Japan',
    'section-232-automobile-parts-2025-06-30': 'United Kingdom',
    'section-232-automobile-parts-2025-05-03': 'All countries',
    'section-232-medium-and-heavy-duty-vehicle-parts-2025-11-01': 'All countries',
}
NOW_FIX = {
    'section-232-automobile-parts-2026-05-01': '15% in total',
    'section-232-automobile-parts-2025-11-01': '15% in total',
    'section-232-automobile-parts-2025-09-16': '15% in total',
    'section-232-automobile-parts-2025-08-01': '15% in total',
    'section-232-automobile-parts-2025-06-30': '10% in total',
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] in COUNTRY_FIX:
        c['countries'] = COUNTRY_FIX[c['id']]
    if c['id'] in NOW_FIX:
        c['before'] = '+25%'
        c['now'] = NOW_FIX[c['id']]
    if c['id'] == 'section-232-automobile-parts-2025-05-03':
        c['before'] = 'None'
    if c['id'] == 'section-301-china-2024-four-year-review-2026-01-01':
        c['before'] = '+50%'
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        # Generator quirk: pending items get the HTS release date; use the USTR implementation notice date.
        c['date'] = '2025-12-29'
        c['dateLabel'] = 'Published'
        if 'fr-2025-23892' not in c['sourceIds']:
            c['sourceIds'].insert(0, 'fr-2025-23892')
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 40 base-rate changes'
        c['detail'] = (
            'All 198 Chapter 40 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
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
        'title': 'China Section 301 lists continue after the four-year review',
        'detail': 'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
        'industries asked for them to continue. For Chapter 40 this keeps +25% (Lists 1 and 3) and +7.5% (List 4A) on tires, synthetic and '
        'natural rubber, hoses, belts, gloves and seals.',
        'before': '+7.5% to +25%',
        'now': '+7.5% to +25%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'pvlt-sunset-2026',
        'type': 'reference',
        'date': '2026-10-05',
        'dateLabel': 'Published',
        'title': 'Passenger-tire orders on Korea, Taiwan, Thailand and Vietnam stay in force during full five-year reviews',
        'detail': 'Commerce found that revoking the 2021 antidumping orders on passenger vehicle and light truck tires from Korea, Taiwan and '
        'Thailand (September 30) and the countervailing duty order on Vietnam (October 5) would likely lead to continued dumping or subsidies. '
        'In a notice published September 25, 2026, the ITC said it will conduct full reviews. The orders, and the cash deposits, continue until the reviews end.',
        'before': None,
        'now': 'AD/CVD deposits continue',
        'countries': 'South Korea, Taiwan, Thailand, Vietnam',
        'sourceIds': ['fr-2026-20377', 'fr-2026-19931', 'fr-2026-19628'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 40 entries unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. The three Chapter 40 '
        'subheadings (4016.93.50, 4016.99.15, 4016.99.35) were on the list before and after the change.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11064', 'procl-11065', 'csms-69851916'],
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
        'id': 'pvlt-cn-continued',
        'type': 'reference',
        'date': '2026-07-16',
        'dateLabel': 'Published',
        'title': 'China passenger-tire AD and CVD orders continued for five more years',
        'detail': 'After expedited second sunset reviews, Commerce and the ITC kept the 2015 antidumping and countervailing duty orders on passenger '
        'vehicle and light truck tires from China (4011.10, 4011.20 light-truck lines). AD/CVD deposits are charged on top of the 54% tariff on '
        'Chinese car tires.',
        'before': None,
        'now': 'AD/CVD deposits continue',
        'countries': 'China',
        'sourceIds': ['fr-2026-14293', 'fr-2026-13703', 'fr-2015-19615'],
    },
    {
        'id': 'usmca-review',
        'type': 'reference',
        'date': '2026-07-01',
        'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate, the Section 301 duty and the Section '
        '232 vehicle-parts duties on Mexican and Canadian tires and rubber goods.',
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
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. Natural rubber (heading 4001) was on the product '
        'exemption list (9903.03.03), Section 232 vehicle parts were exempt (9903.03.06), and USMCA-qualifying goods from Canada and Mexico were '
        'exempt.',
        'before': 'None',
        'now': '+10% (until July 23, 2026)',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'csms-67844987', 'hts-now'],
    },
    {
        'id': 'ieepa-end',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
        'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from '
        '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
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
        'every dutiable Chapter 40 line Free for eligible sub-Saharan countries such as Côte d\'Ivoire, though it does not remove the Section '
        '232 vehicle-parts duty. GSP (SPI A, A*, A+) remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
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
        '(EO 14326): 50% in all on Indian rubber goods other than Section 232 vehicle parts. Ended February 7, 2026.',
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
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Thailand, Malaysia, Indonesia and Cambodia '
        '+19%, Vietnam, Taiwan and Sri Lanka +20%, India +25%, Serbia +35%, Côte d\'Ivoire, Japan and South Korea +15%, the UK +10%; EU goods '
        'with a column 1 rate under 15% paid 15% in total (9903.02.20). Natural rubber appears on the reciprocal-tariff exemption list printed in the schedule '
        '(9903.01.32), and Section 232 vehicle parts were outside the reciprocal duties (9903.01.33). Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +40% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'ca-amended',
        'type': 'extraDuty',
        'date': '2025-07-31',
        'dateLabel': 'Signed',
        'title': 'Canada additional duty raised to 35%',
        'detail': 'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Section 232 vehicle parts were not subject to it (U.S. '
        'note 33(f)). Ended February 24, 2026.',
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
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Ended February 24, '
        '2026.',
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
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country rates '
        'announced on April 2 for other countries, which never took effect. With the 20% fentanyl duty and the 25% List 3 duty, Chinese hoses, '
        'belts or seals paid up to 170% on top of the base rate until May 13, 2025.',
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
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded, and goods subject to '
        'Section 232 duties left out. Ended February 24, 2026.',
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
        'id': 'cn-gloves-50',
        'type': 'extraDuty',
        'date': '2025-01-01',
        'dateLabel': 'Effective',
        'title': 'China: Section 301 duty on medical gloves set at 50%',
        'detail': 'USTR\'s four-year-review modification raised the additional duty on Chinese medical and surgical gloves (4015.12.10) to 50% '
        'for 2025, with 100% scheduled for 2026.',
        'before': 'None',
        'now': '+50% (2025)',
        'countries': 'China',
        'sourceIds': ['fr-2024-21217'],
    },
    {
        'id': 'tb-th-order',
        'type': 'reference',
        'date': '2024-12-17',
        'dateLabel': 'Published',
        'title': 'Antidumping order on truck and bus tires from Thailand',
        'detail': 'Commerce issued an antidumping duty order on truck and bus tires from Thailand (mainly 4011.20.10.15 and 4011.20.50.20) after '
        'the ITC\'s affirmative injury vote. The order set deposit rates of 48.39% for Bridgestone and 12.33% for Prinx Chengshan and all other '
        'Thai exporters.',
        'before': None,
        'now': 'AD deposits',
        'countries': 'Thailand',
        'sourceIds': ['fr-2024-29606', 'fr-2024-28513'],
    },
    {
        'id': 'tb-cn-continued',
        'type': 'reference',
        'date': '2024-08-29',
        'dateLabel': 'Published',
        'title': 'China truck and bus tire AD and CVD orders continued',
        'detail': 'After the first sunset reviews, Commerce continued the 2019 antidumping and countervailing duty orders on truck and bus tires from '
        'China (mainly 4011.20.10.15 and 4011.20.50.20).',
        'before': None,
        'now': 'AD/CVD deposits continue',
        'countries': 'China',
        'sourceIds': ['fr-2024-19390', 'fr-2019-02656', 'fr-2019-02657'],
    },
    {
        'id': 'otr-in-continued',
        'type': 'reference',
        'date': '2023-05-25',
        'dateLabel': 'Published',
        'title': 'India off-the-road tire AD and CVD orders continued',
        'detail': 'Commerce continued the 2017 antidumping and countervailing duty orders on certain new pneumatic off-the-road tires from India '
        '(construction, mining, farm and industrial tires of 4011.20, 4011.70, 4011.80 and 4011.90). The Sri Lanka CVD order was revoked in '
        '2018 after a court ruling, and the China OTR orders were revoked in 2019.',
        'before': None,
        'now': 'AD/CVD deposits continue',
        'countries': 'India',
        'sourceIds': ['fr-2023-11143', 'fr-2017-04432', 'fr-2017-04433', 'fr-2018-15879', 'fr-2019-09670'],
    },
    {
        'id': 'pvlt-2021-orders',
        'type': 'reference',
        'date': '2021-07-19',
        'dateLabel': 'Published',
        'title': 'Antidumping orders on passenger tires from Korea, Taiwan and Thailand; CVD order on Vietnam',
        'detail': 'Commerce issued antidumping orders on passenger vehicle and light truck tires (4011.10.10, 4011.10.50, 4011.20.10.05, '
        '4011.20.50.10) from Korea (all-others rate 21.74%), Taiwan (84.75%) and Thailand (17.06%), and a countervailing duty order on '
        'Vietnam (6.46%). The ITC found dumped imports from Vietnam negligible, so there is no Vietnam antidumping order. Company rates have '
        'since changed in administrative reviews.',
        'before': None,
        'now': 'AD/CVD deposits',
        'countries': 'South Korea, Taiwan, Thailand, Vietnam',
        'sourceIds': ['fr-2021-15270', 'fr-2021-15271', 'fr-2021-15108'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(
    tu,
    [
        'eo-14323',
        'fr-2026-20510',
        'fr-2026-20377',
        'fr-2026-19931',
        'fr-2026-19628',
        'procl-11064',
        'procl-11065',
        'csms-69851916',
        'procl-11012',
        'csms-67844987',
        'fr-2026-14293',
        'fr-2026-13703',
        'fr-2015-19615',
        'ustr-usmca-review',
        'scotus-24-1287',
        'eo-14389',
        'csms-67834313',
        'eo-14384',
        'ustr-agoa-2026',
        'crs-agoa',
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
        'fr-2024-21217',
        'fr-2025-23892',
        'fr-2024-29606',
        'fr-2024-28513',
        'fr-2024-19390',
        'fr-2019-02656',
        'fr-2019-02657',
        'fr-2023-11143',
        'fr-2017-04432',
        'fr-2017-04433',
        'fr-2019-09670',
        'fr-2018-15879',
        'fr-2021-15270',
        'fr-2021-15271',
        'fr-2021-15108',
    ],
)

stats = [s for s in tu['stats'] if s['label'] not in ('IEEPA duties', 'Tire AD/CVD orders')]
stats.append({'label': 'Tire AD/CVD orders', 'value': '11', 'note': 'China, Korea, Taiwan, Thailand, Vietnam, India'})
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia['h1'] = f'HTS Chapter 40: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

PARTS_NOTE = 'Listed vehicle parts (tires, brake hoses, inner tubes) pay 25% Section 232 instead when they are vehicle parts.'
RULE_LABELS = {
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77); natural rubber exempt. ' + PARTS_NOTE + ' AD orders on passenger, light-truck, '
    'truck and bus tires add deposits. The 19% IEEPA duty ended February 24, 2026.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94, 9903.94.06, 9903.74.10). Otherwise base rate + 10% Section 301 (9903.05.55), or '
    '25% Section 232 on listed vehicle parts. The 25% IEEPA duty ended February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 or 232 duty (9903.05.93, 9903.94.06, 9903.74.10); otherwise base rate + 10% (9903.05.29), or '
    '25% on listed vehicle parts. On top, 50% Section 338 on 4016.93.50, 4016.99.15 and 4016.99.35 (9903.03.14), whether or not USMCA is '
    'claimed.',
    'Japan': 'Base rate or 12.5%, whichever is higher (9903.05.49); natural rubber exempt. Passenger-vehicle parts 15% in total (9903.94.43); '
    'medium- and heavy-duty truck parts base rate + 25% (9903.74.08).',
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54); natural rubber exempt. ' + PARTS_NOTE,
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84); natural rubber exempt. ' + PARTS_NOTE + ' A CVD order on passenger and light-truck '
    'tires adds deposits.',
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45); natural rubber exempt. ' + PARTS_NOTE,
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on most lines, 7.5% List 4A on 11 lines, 25% List 1 on '
    'aircraft tires, 100% on medical gloves (9903.91.08). Natural rubber pays List 3 only. Listed vehicle parts pay 25% Section 232 instead '
    'of the 12.5%. AD/CVD orders on passenger, light-truck, truck and bus tires add deposits.',
    'South Korea': 'Base rate or 12.5%, whichever is higher (9903.05.71); natural rubber exempt. Passenger-vehicle parts 15% in total '
    '(9903.94.63); medium- and heavy-duty truck parts base rate + 25% (9903.74.08). An AD order on passenger and light-truck tires adds '
    'deposits.',
    'Cambodia': 'Base rate + 10% Section 301 (9903.05.28); natural rubber exempt. ' + PARTS_NOTE,
    'India': 'Base rate + 10% Section 301 (9903.05.44); natural rubber exempt. ' + PARTS_NOTE + ' AD/CVD orders on off-the-road tires add '
    'deposits.',
    'Taiwan': 'Base rate or 10%, whichever is higher (9903.05.76); natural rubber exempt. Passenger-vehicle parts 15% in total (9903.94.67); '
    'medium- and heavy-duty truck parts base rate + 25% (9903.74.08). An AD order on passenger and light-truck tires adds deposits.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27) on all lines but natural rubber. Listed vehicle parts pay '
    '25% Section 232 instead of both.',
    "Côte d'Ivoire": 'Not one of the 60 Section 301 economies. AGOA (D) makes every dutiable line Free through December 31, 2026, and natural '
    'rubber is Free anyway. Listed vehicle parts pay 25% Section 232, which AGOA does not remove. The 15% IEEPA duty ended February 24, 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). Vehicle parts on the UK list (car tires, on-highway radial truck tires, '
    'brake hoses, inner tubes) 10% in total (9903.94.32); other listed parts 25%.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39); natural rubber exempt. Passenger-vehicle parts '
    '15% in total (9903.94.53); medium- and heavy-duty truck parts base rate + 25% (9903.74.08). The 15%-in-total IEEPA rate ended February '
    '24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies (for example Serbia, Liberia, Ghana, Myanmar) pay only the base rate, plus 25% '
            'Section 232 on listed vehicle parts. Inside the 60: Sri Lanka, Bangladesh and Pakistan +10%; Türkiye, Chile, the Philippines and '
            'Singapore +12.5%; Switzerland 12.5% in total; natural rubber exempt for all. No note 52(j) country list covers Chapter 40. Column 2 '
            'countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates of up to 80%.'
        )
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico') and 'eo-14389' not in ids:
        ids.insert(-1, 'eo-14389')
    if c['country'] == "Côte d'Ivoire":
        for sid in ('ustr-agoa-2026', 'hts-gn16'):
            if sid not in ids:
                ids.insert(-1, sid)
fix_source_quirks(ia)
add_sources(ia, ['eo-14389', 'ustr-agoa-2026', 'hts-gn16'])

ia['seo'] = {
    'title': 'Tire & Rubber Tariffs by Country 2026: Thailand, China, Japan, Korea, Vietnam, Malaysia, Mexico, Canada (HTS Ch. 40) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on tires, natural and synthetic rubber, gloves, hoses, belts and seals by country: 15% '
    'in total on Japanese, Korean, Taiwanese and EU car tires, 29% from Thailand or Vietnam, 54% from China, Free under USMCA, plus AD/CVD.',
    'keywords': [
        'tariffs on tires from china',
        'tariff on tires from thailand',
        'tariffs on tires canada',
        'tariffs on car tires',
        'us tariffs on chinese tires',
        'nitrile gloves tariff',
        'natural rubber tariffs',
        'rubber tariff china',
    ],
}
ia['intro'] = (
    'Chapter 40 base rates are low — Free for raw rubber, 2.5%–4% for most hoses, tires and seals — so **where the goods come from, and '
    'whether they are vehicle parts, decides the bill**. Each cell below is the base rate for that product group plus the extra duty for that '
    'country, minus any preference — taken from the current tariff schedule.\n\n'
    'For **tires, brake hoses and inner tubes**, cells show one total per answer to the Section 232 question — "not a vehicle part", "car or '
    'light-truck part" or "truck or bus part": a part of a passenger vehicle or light truck pays 25% (, or **15% in total from Japan, the EU, Korea and Taiwan**, 10% on the UK list), a part of a medium- or '
    'heavy-duty truck or bus 25%. A car tire pays **29% from Thailand, Vietnam, Malaysia, Cambodia or India**, **54% from China**, and '
    'nothing under USMCA. For everything else the extra duty is the **Section 301 tariff on 60 economies** (+10% or +12.5%, or 10%–12.5% in '
    'total for the EU, Japan, Korea and Taiwan), which leaves **natural rubber Free**; China adds its List 3 or 4A duty and 100% on medical '
    'gloves; three Canadian seal and natural-rubber subheadings pay 50% Section 338 even under USMCA. Tire antidumping and countervailing '
    'duties come on top and are not in the cells.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Cells split by "not a vehicle part", "car or light-truck part" and "truck or bus part": the Section 232 automobile-parts duty applies only to articles on the U.S. note 33(g) list that are parts of '
    'passenger vehicles or light trucks, and the medium- and heavy-duty duty only to note 38(i) articles that are parts of those vehicles. '
    'Nearly every car tire (4011.10) is a passenger-vehicle part; a listed article used on neither kind of vehicle enters under 9903.94.06 or '
    '9903.74.11 and pays the base rate plus the Section 301 duty.',
    'Canada, "USMCA-qualifying" side: the Section 301 and Section 232 duties are removed (9903.05.93, 9903.94.06, 9903.74.10), but the 50% '
    'Section 338 duty stays on 4016.93.50, 4016.99.15 and 4016.99.35 because U.S. note 51(a) applies it even when a special rate is claimed.',
    'Not in the cells: antidumping and countervailing duties on passenger, light-truck, truck, bus and off-the-road tires (China, Korea, '
    'Taiwan, Thailand, Vietnam, India), which are company-specific deposits; the civil-aircraft exemptions (they need a certification); '
    'FTA preferences other than USMCA, KORUS and AGOA; and DOT, FDA or CBP entry costs. The opt-in Section 232 certified-parts headings are '
    'not modeled.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
    'Trade partners with no ISO country code in the trade data (Myanmar, the British Virgin Islands, Nauru, Wallis and Futuna) are counted '
    'in "Any other country".',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) covers all of heading 4001 (natural rubber, 16 lines); the Brazil list (note 50(a)(ii)) covers the '
    'same subheadings. Note 52(f) and note 50(a)(vi) exempt parts that pay a Section 232 vehicle-parts duty. The note 52(j) country exception '
    'lists name no Chapter 40 line. The civil-aircraft lists (notes 50(a)(iv), 51(d), 52(d)) name 13 Chapter 40 subheadings, including '
    'aircraft tires and listed hoses and seals. The Section 232 automobile-parts list (note 33(g)) names 13 Chapter 40 provisions, the UK list '
    '(note 33(j)) 19 statistical numbers, and the medium- and heavy-duty list (note 38(i)) 13 provisions. The Canada Section 338 list (note '
    '51(b)(3)) names 4016.93.50, 4016.99.15 and 4016.99.35, unchanged by the September 15, 2026 revisions. China: List 1 covers 4011.30 and '
    '4012.13, List 3 most other lines, List 4A 9 subheadings, note 31(i) covers 4015.12.10; no current note 20 exclusion covers a Chapter 40 '
    'product, and 4014, 4016.92 and 4016.99.20 are on no China list. Note 30 sets 35% for Russian goods of 66 lines in place of column 2. No '
    'Chapter 40 line is on the Section 232 metals lists (notes 16, 19). A Federal Register search of Commerce (ITA) notices found antidumping '
    'or countervailing duty orders on passenger and light-truck tires (China, Korea, Taiwan, Thailand, Vietnam), truck and bus tires (China, '
    'Thailand) and off-the-road tires (India), and none on another Chapter 40 product.'
)

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui['h1'] = f'HTS Chapter 40: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Tire & Rubber Imports by Country — HTS Chapter 40 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 40 goods: {fmt_usd(total)} in {Y}, {fmt_usd(TIRES)} of it new tires. Who supplies '
    'tires, natural rubber, gloves, hoses and seals — Thailand, Mexico, Canada, Japan, Malaysia, Vietnam, Indonesia, China — by product and '
    'year, from UN Comtrade.',
    'keywords': [
        'us tire imports by country',
        'tire import statistics',
        'natural rubber imports',
        'rubber glove imports',
        'rubber industry imports',
        'hts chapter 40 imports',
        'thailand tire exports to us',
        'tire import costs',
    ],
}
cn_tires = hc('4011', 'China')
ui['why'] = (
    f'U.S. imports of Chapter 40 goods were **{fmt_usd(total)} in {Y}**, {round((total / prior_total - 1) * 100, 1)}% more than the '
    f'{fmt_usd(prior_total)} of {PY} but below the {fmt_usd(year_tot[2021])} peak of 2021. **New tires** (heading 4011) were '
    f'{fmt_usd(TIRES)}, {TIRE_SHARE}% of the total: {fmt_usd(by_hs6["4011.10"]["importsUsd"])} of car tires (4011.10) and '
    f'{fmt_usd(by_hs6["4011.20"]["importsUsd"])} of bus and truck tires (4011.20). Other articles of rubber (4016: gaskets, seals, mats, '
    f'anti-vibration parts) added {fmt_usd(OTHER_ART)}, gloves (4015) {fmt_usd(GLOVES)}, hoses (4009) {fmt_usd(h_tot("4009"))} and natural '
    f'rubber (4001) {fmt_usd(NR)}.\n\n'
    f'**Thailand** was the largest supplier ({fmt_usd(imp("Thailand"))}, {fmt_usd(hc("4011", "Thailand"))} of it tires), followed by '
    f'**Mexico** ({fmt_usd(imp("Mexico"))}) and **Canada** ({fmt_usd(imp("Canada"))}), whose tires, hoses and seals mostly enter under '
    f'USMCA. Japan ({fmt_usd(imp("Japan"))}) and South Korea ({fmt_usd(imp("Rep. of Korea"))}) ship tires and synthetic rubber. '
    f'**Malaysia** ({fmt_usd(imp("Malaysia"))}, up {chg("Malaysia")}%) is mainly gloves: {fmt_usd(hc("4015", "Malaysia"))} of the '
    f'{fmt_usd(GLOVES)} glove total. **Cambodia** grew {chg("Cambodia")}% to {fmt_usd(imp("Cambodia"))}, nearly all tires, and Vietnam '
    f'{chg("Viet Nam")}% to {fmt_usd(imp("Viet Nam"))}, while **China** fell {abs(chg("China"))}% to {fmt_usd(imp("China"))}, with just '
    f'{fmt_usd(cn_tires)} of tires. Natural rubber came mostly from Indonesia ({fmt_usd(hc("4001", "Indonesia"))}), Thailand '
    f'({fmt_usd(hc("4001", "Thailand"))}) and Côte d\'Ivoire ({fmt_usd(hc("4001", "Côte d\'Ivoire"))}).\n\n'
    'These are pre-2026 figures: they predate the July 2026 Section 301 tariffs and the Section 338 duties, and most of the 2025 trade paid '
    'IEEPA duties that have since ended. Tires and other vehicle parts have paid the Section 232 duty since May 3, 2025.'
)
ui['sources'] = ui.get('sources') or []

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 40: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Tires, Rubber & Gloves into the U.S.: DOT/FMVSS, Tire Identification, FDA Glove & Condom Rules, Legal Ways to '
    'Lower Duty (HTS Ch. 40) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 40 line needs at U.S. entry — DOT safety standards and the HS-7 declaration for tires, tire '
    'identification numbers, FDA 510(k) and registration for medical gloves and condoms, origin marking — and the legal ways to pay less.',
    'keywords': [
        'tariff engineering hts chapter 40',
        'dot tire import requirements',
        'fmvss 139 tires',
        'tire identification number',
        'hs-7 declaration tires',
        'fda 510k medical gloves import',
        'usmca tires rule of origin',
        'section 232 not a passenger vehicle part',
    ],
}
te['intro'] = (
    'Raw rubber needs no license, but two kinds of Chapter 40 goods are regulated products. **Tires** for motor vehicles must meet the DOT '
    'Federal Motor Vehicle Safety Standards (FMVSS 139 for light-vehicle radials, 119 for trucks, buses and motorcycles, 109 for bias-ply '
    'and T-type spare tires, 117 for passenger-car retreads) and carry the DOT symbol and a tire identification number; the importer files the DOT declaration '
    '(HS-7) with the entry, and a foreign manufacturer must name a U.S. agent for service. **Medical gloves and condoms** are FDA medical '
    'devices: a 510(k) clearance, a registered and listed foreign establishment and the FDA leak-test and latex-labeling rules apply.\n\n'
    'On cost, the levers are: whether a listed tire or hose is a **vehicle part** (Section 232, 25%) or not; **USMCA**, which removes every '
    'tariff but the Section 338 duty; the **country of origin** (15% in total for Japanese, EU, Korean and Taiwanese car tires, 29% from '
    'Thailand, 54% from China, plus AD/CVD); the **natural-rubber** and **civil-aircraft** exemptions; AGOA; and first-sale valuation, '
    'drawback and foreign-trade zones. Each lever depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'

AIRCRAFT_SUBS = {'4008.29.20', '4009.12.00', '4009.22.00', '4009.32.00', '4009.42.00', '4011.30.00', '4012.13.00', '4012.20.10', '4016.10.00',
                 '4016.93.50', '4016.99.35', '4016.99.60', '4017.00.00'}
S232_PV = ('4009.12.00.20', '4009.22.00.20', '4009.32.00.20', '4009.42.00.20', '4011.10.10', '4011.10.50', '4011.20.10', '4012.19.40',
           '4012.19.80', '4012.20.60', '4013.10.00', '4016.99.60.10')
S232_MHDV = ('4009.12.00.20', '4009.22.00.20', '4009.32.00.20', '4009.42.00.20', '4011.10.50', '4011.20.10.15', '4011.20.10.25',
             '4011.20.10.35', '4012.19.40', '4012.19.80', '4012.20.60', '4013.10.00', '4016.99.60.10')

te['levers'] = [
    {
        'id': 'vehicle-part',
        'title': 'Show whether a listed tire, hose or tube is really a vehicle part',
        'saves': 'The 25% Section 232 duty (or the 15% deal rate) on listed articles that are not parts of passenger vehicles, light trucks or '
        'medium- and heavy-duty vehicles — they pay the base rate plus the Section 301 duty instead',
        'appliesTo': 'The note 33(g) and 38(i) lines: brake hoses with fittings (.0020), 4011.10, 4011.20.10, 4012.19.40/.80, 4012.20.60, 4013.10 '
        'and 4016.99.60.10 — for example truck tires for off-road equipment or inner tubes for non-road use',
        'document': 'Product specifications and sales records showing the vehicle the article is designed and sold for; report 9903.94.06 '
        '(not a passenger-vehicle or light-truck part) or 9903.74.11 (not a medium- or heavy-duty vehicle part).',
        'caveat': 'Car tires (4011.10) are almost always passenger-vehicle parts. The answer follows the article itself, and CBP may ask for '
        'support. A part of a passenger vehicle that is also usable on heavy trucks pays the automobile-parts duty.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33(g)–(h), 38(i), (l)', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 64916652 (9903.94.06)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3de8cac'},
            {'label': 'CBP CSMS # 66665333 (medium- and heavy-duty parts)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3f93b75'},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate, the 10% Section 301 duty and the 25% Section 232 vehicle-parts duties — a USMCA car tire pays nothing instead of '
        '29%',
        'appliesTo': 'All lines from Mexico; from Canada, all lines except the Section 338 subheadings 4016.93.50, 4016.99.15 and 4016.99.35',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'The Chapter 40 rule of origin is mostly a change of heading: tires (headings 4010–4011) qualify from any other heading except '
        '4009–4017, so tires built in Mexico or Canada from imported natural or synthetic rubber can qualify; for goods for use in motor vehicles '
        'the automotive provisions of General Note 11(k) may also apply. USMCA does not remove the 50% Section 338 duty. The USMCA was not '
        'renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin, chapter 40)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / .94, 9903.94.06, 9903.74.10, U.S. notes 33, 38, 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and the deal rates',
        'saves': 'The difference between country rates: a car tire pays 15% in total from Japan, Korea, Taiwan or the EU, 10% from the UK, 29% from '
        'Thailand, Vietnam or India, 54% from China; other rubber goods +10% to +37.5%',
        'appliesTo': 'All lines; the gap is widest on car and truck tires and on gloves from China',
        'document': 'Production records showing where the article was last substantially transformed, and the origin marking.',
        'caveat': 'Mixing, curing or packing in a third country may not move the origin. AD/CVD orders also follow the country, and Commerce can '
        'find tires made from another country\'s components to circumvent an order. The Section 301, 232 and 338 duties follow the country of '
        'origin, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '19 CFR 102.11 (USMCA-country origin rules)', 'url': ecfr(19, '102.11')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 33, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'natural-rubber',
        'title': 'Keep natural rubber in heading 4001',
        'saves': 'The 10%–12.5% Section 301 duty and the Brazil duty, which natural rubber is exempt from',
        'appliesTo': 'Heading 4001 — natural rubber latex, smoked sheets, TSNR and natural gums',
        'document': 'A certificate of analysis showing the rubber has not been compounded with vulcanizing agents, pigments, fillers or other '
        'substances beyond those chapter note 5(b) allows.',
        'caveat': 'Compounded rubber (4005), masterbatch and articles of natural rubber are not on the exemption list (U.S. note 52(b)). Chinese '
        'natural rubber still pays the 25% List 3 duty.',
        'citations': [
            {'label': 'HTSUS Chapter 40, note 5', 'url': CH40_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 50(a)(ii), 52(b)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'civil-aircraft',
        'title': 'Certify civil-aircraft use',
        'saves': 'The base rate (Free (C)) and the 2026 Section 301, Brazil and Canada Section 338 duties on articles for civil aircraft',
        'appliesTo': 'Aircraft tires (4011.30, 4012.13, 4012.20.10), listed hoses with fittings, profile shapes (4008.29.20), cellular rubber '
        'articles, seals of 4016.93.50, 4016.99.35, 4016.99.60 and hard rubber (4017)',
        'document': 'The civil-aircraft certification required by general note 6 and 19 CFR 10.183, kept with the entry.',
        'caveat': 'Military and unmanned aircraft do not qualify. The China List 1 duty on aircraft tires is not lifted.',
        'citations': [
            {'label': '19 CFR 10.183', 'url': ecfr(19, '10.183')},
            {'label': 'HTSUS General Note 6', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 50(a)(iv), 51(d), 52(d)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim AGOA, KORUS or another FTA',
        'saves': 'The base rate (up to 14%) — AGOA makes every dutiable line Free for eligible African countries such as Côte d\'Ivoire',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AGOA (D), KORUS (KR), CAFTA-DR (P), Chile (CL), Japan (JP on some '
        'OTR tires, hoses and seals) and the other FTA partners',
        'document': 'The origin proof each program requires and records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty (U.S. note 52(a)) or the Section 232 duty. AGOA (D) runs to '
        'December 31, 2026. GSP (A, A*, A+) has been expired since December 31, 2020, although the codes are still printed.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': '19 CFR 10.178a (AGOA)', 'url': ecfr(19, '10.178a')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–100% extra duties — when the factory price to a '
        'trading company is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company or brand owner rather than straight from the maker',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies. Antidumping and countervailing duty deposits follow Commerce\'s own rules.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them, such as tires made from imported rubber) are '
        'exported or destroyed',
        'appliesTo': 'Any line',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; antidumping and countervailing duties are not eligible, and each '
        'Chapter 99 duty\'s eligibility should be checked first.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, mix or re-export goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for tire distributors serving Canada and Mexico',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Section 232 vehicle parts admitted to a zone must be in privileged foreign status, which fixes the duty at admission.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '19 CFR 146.41 (privileged foreign status)', 'url': ecfr(19, '146.41')},
        ],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example tires or belts sent back by a foreign customer',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except 9802.00.40–9802.00.80 '
        '(U.S. notes 51(a) and 52(a)); for Section 232 parts, 9802.00.60 is assessed on the full value (note 33(f)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33(f), 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the duty: medical (4015.12.10, Free; 100% extra from China) versus non-medical gloves '
        '(4015.19, 3% or 14%); seals for vehicles (4016.93.10) versus other seals (4016.93.50, on the Canada Section 338 list); natural versus '
        'compounded rubber',
        'appliesTo': 'Any line where the material, construction or use decides the line',
        'document': 'A ruling request to CBP describing the article, its material, construction and use.',
        'caveat': 'Rulings apply to the transaction described; a changed design or material may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 40 notes', 'url': CH40_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'nhtsa-fmvss',
        'agency': 'NHTSA / CBP',
        'title': 'Tires for motor vehicles must meet the Federal Motor Vehicle Safety Standards and bear the DOT symbol — FMVSS 139 for radial '
        'tires on light vehicles (10,000 lb GVWR or less), 119 for heavier vehicles, motorcycles and specialty tires, 109 for bias-ply and '
        'T-type spare tires, 117 for passenger-car retreads — and the importer files a DOT declaration (HS-7) with the entry',
        'citations': [
            {'label': '49 CFR 571.139', 'url': ecfr(49, '571.139')},
            {'label': '49 CFR 571.119', 'url': ecfr(49, '571.119')},
            {'label': '49 CFR 571.109', 'url': ecfr(49, '571.109')},
            {'label': '49 CFR 571.117', 'url': ecfr(49, '571.117')},
            {'label': '19 CFR 12.80', 'url': ecfr(19, '12.80')},
            {'label': '49 CFR 591.5', 'url': ecfr(49, '591.5')},
        ],
    },
    {
        'id': 'nhtsa-tin',
        'agency': 'NHTSA',
        'title': 'Each tire carries a tire identification number with the plant code NHTSA assigns; new-tire manufacturers and brand owners '
        'must supply registration forms; passenger-car tires carry uniform tire quality grades (treadwear, traction, temperature)',
        'citations': [
            {'label': '49 CFR 574.5', 'url': ecfr(49, '574.5')},
            {'label': '49 CFR 574.6', 'url': ecfr(49, '574.6')},
            {'label': '49 CFR 574.7', 'url': ecfr(49, '574.7')},
            {'label': '49 CFR 575.104', 'url': ecfr(49, '575.104')},
        ],
    },
    {
        'id': 'nhtsa-agent',
        'agency': 'NHTSA',
        'title': 'A foreign manufacturer of motor vehicle equipment, including tires, must designate a U.S. agent for service of process',
        'citations': [{'label': '49 CFR part 551, subpart D', 'url': ecfr(49, '551.45')}],
    },
    {
        'id': 'adcvd-tires',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Antidumping or countervailing duty cash deposits on passenger and light-truck tires (China, Korea, Taiwan, Thailand, Vietnam), '
        'truck and bus tires (China, Thailand) and off-the-road tires (India); the importer declares the AD/CVD case number and the exporter\'s '
        'rate, and the order\'s written scope, not the HTS line, decides coverage',
        'citations': [
            {'label': '19 CFR 351.211', 'url': ecfr(19, '351.211')},
            {'label': '80 FR 47902 (China passenger tires)', 'url': fr_url('2015-19615')},
            {'label': '86 FR 38011 (Korea, Taiwan, Thailand passenger tires)', 'url': fr_url('2021-15270')},
            {'label': '86 FR 38013 (Vietnam passenger tires)', 'url': fr_url('2021-15271')},
            {'label': '84 FR 4436 (China truck and bus tires)', 'url': fr_url('2019-02656')},
            {'label': '89 FR 102111 (Thailand truck and bus tires)', 'url': fr_url('2024-29606')},
            {'label': '82 FR 12553 (India off-the-road tires)', 'url': fr_url('2017-04432')},
        ],
    },
    {
        'id': 'fda-gloves',
        'agency': 'FDA',
        'title': 'Patient examination and surgeon\'s gloves are medical devices: a 510(k) clearance, a registered and listed foreign '
        'establishment, the FDA leak-test sampling standard and natural-rubber latex labeling; powdered medical gloves are banned',
        'citations': [
            {'label': '21 CFR 880.6250 (exam gloves)', 'url': ecfr(21, '880.6250')},
            {'label': '21 CFR 878.4460 (surgeon\'s gloves)', 'url': ecfr(21, '878.4460')},
            {'label': '21 CFR 807.81 (510(k))', 'url': ecfr(21, '807.81')},
            {'label': '21 CFR 807.40 (foreign establishments)', 'url': ecfr(21, '807.40')},
            {'label': '21 CFR 800.20 (leak test)', 'url': ecfr(21, '800.20')},
            {'label': '21 CFR 801.437 (latex labeling)', 'url': ecfr(21, '801.437')},
            {'label': '21 CFR 895.102–895.103 (powdered gloves banned)', 'url': ecfr(21, '895.103')},
        ],
    },
    {
        'id': 'fda-condoms',
        'agency': 'FDA',
        'title': 'Condoms are Class II medical devices: a 510(k) clearance, a registered and listed foreign establishment, and the latex-condom '
        'labeling rule',
        'citations': [
            {'label': '21 CFR 884.5300', 'url': ecfr(21, '884.5300')},
            {'label': '21 CFR 801.435', 'url': ecfr(21, '801.435')},
            {'label': '21 CFR 807.81', 'url': ecfr(21, '807.81')},
            {'label': '21 CFR 807.40', 'url': ecfr(21, '807.40')},
        ],
    },
    {
        'id': 'fda-food-contact',
        'agency': 'FDA',
        'title': 'Nursing nipples and other rubber articles in repeated contact with food must be made of the rubber formulations FDA permits',
        'citations': [{'label': '21 CFR 177.2600', 'url': ecfr(21, '177.2600')}],
    },
    {
        'id': 'forced-labor',
        'agency': 'CBP',
        'title': 'Goods made with forced labor are barred from entry; CBP has acted against disposable gloves from Malaysia before (a 2021 Finding, '
        'lifted the same year) — check CBP\'s current Withhold Release Orders and Findings before importing',
        'citations': [
            {'label': '19 CFR 12.42', 'url': ecfr(19, '12.42')},
            {'label': '86 FR 16380 (2021 Finding on Malaysian gloves)', 'url': fr_url('2021-06393')},
            {'label': '86 FR 50725 (Finding lifted)', 'url': fr_url('2021-19535')},
            {'label': 'CBP Withhold Release Orders and Findings', 'url': CBP_WRO},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the tire, '
        'hose, belt or glove itself or its retail container',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the Section 232 automobile-parts heading (9903.94.05, or 9903.94.06 when not '
        'covered; the deal headings 9903.94.32, .43, .53, .63, .67) or the truck-parts heading (9903.74.08, .10, .11); otherwise the 2026 '
        'Section 301 heading for the country (or 9903.05.86 for natural rubber); China Lists (9903.88.01, .03, .15) and 9903.91.08; Brazil '
        '(9903.05.01); Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 31, 33, 38, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 64916652 (automobile parts)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3de8cac'},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
]

GROUP_RULES = {
    '4001': ['cbp-marking', 'cbp-ch99'],
    '4002': ['cbp-marking', 'cbp-ch99'],
    '4003': ['cbp-marking', 'cbp-ch99'],
    '4004': ['cbp-marking', 'cbp-ch99'],
    '4005': ['cbp-marking', 'cbp-ch99'],
    '4006': ['cbp-marking', 'cbp-ch99'],
    '4007': ['cbp-marking', 'cbp-ch99'],
    '4008': ['cbp-marking', 'cbp-ch99'],
    '4009': ['cbp-marking', 'cbp-ch99'],
    '4010': ['cbp-marking', 'cbp-ch99'],
    '4011': ['nhtsa-fmvss', 'nhtsa-tin', 'nhtsa-agent', 'adcvd-tires', 'cbp-marking', 'cbp-ch99'],
    '4012': ['nhtsa-fmvss', 'nhtsa-tin', 'nhtsa-agent', 'cbp-marking', 'cbp-ch99'],
    '4013': ['cbp-marking', 'cbp-ch99'],
    '4014': ['fda-condoms', 'fda-food-contact', 'cbp-marking', 'cbp-ch99'],
    '4015': ['fda-gloves', 'forced-labor', 'cbp-marking', 'cbp-ch99'],
    '4016': ['cbp-marking', 'cbp-ch99'],
    '4017': ['cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '4001': 'Free, and exempt from the 2026 Section 301 and Brazil duties (U.S. notes 52(b), 50(a)(ii)); only China adds 25% (List 3). '
    'Compounding moves rubber to 4005 (chapter note 5).',
    '4002': 'Free base rate; the Section 301 duty by country applies. Chinese synthetic rubber pays 37.5%.',
    '4003': 'Free base rate; the Section 301 duty by country applies.',
    '4004': 'Free base rate; crumb rubber and tire scrap pay the Section 301 duty by country.',
    '4005': 'Free base rate, but not on the natural-rubber exemption list: compounded rubber pays the Section 301 duty.',
    '4006': 'Camel-back retread strips (4006.10) are on China List 4A (7.5%).',
    '4007': 'Free base rate; the Section 301 duty by country applies.',
    '4008': 'Profile shapes of 4008.29.20 for civil aircraft are Free (C) when cut to size (additional U.S. note 2) and exempt from the 2026 '
    'Section 301 duty with a civil-aircraft certification.',
    '4009': 'Brake hoses with fittings (statistical suffix .0020) are Section 232 vehicle parts when they are parts of passenger vehicles, light '
    'trucks or medium- and heavy-duty vehicles; other hoses pay the base rate plus the Section 301 duty.',
    '4010': 'No agency license. USMCA has a change-of-heading rule for belts too (General Note 11).',
    '4011': 'Tires for motor vehicles need DOT certification, a tire identification number and an HS-7 declaration. Car tires, radial bus and '
    'truck tires and 4011.10.50 are Section 232 vehicle parts; passenger, light-truck, truck, bus and off-the-road tires from six countries '
    'carry AD/CVD deposits. Aircraft tires for civil aircraft are exempt from most extra duties with a certification.',
    '4012': 'Retreaded passenger-car tires must meet FMVSS 117; retreads of 4012.19.40/.80 and used on-highway tires (4012.20.60) are Section 232 vehicle '
    'parts.',
    '4013': 'Car, bus and truck inner tubes (4013.10) are Section 232 vehicle parts.',
    '4014': 'Condoms are FDA Class II devices; nursing nipples are food-contact articles. Condoms, nursing nipples and other hygienic articles '
    'are on no China Section 301 list.',
    '4015': 'Medical and surgical gloves are FDA devices (510(k), registration, leak test). Chinese medical gloves pay 100% extra (9903.91.08); '
    'non-medical gloves are on List 3.',
    '4016': '4016.93.50, 4016.99.15 and 4016.99.35 from Canada pay 50% Section 338 even under USMCA; mechanical articles for motor vehicles '
    '(4016.99.60.10) are Section 232 vehicle parts.',
    '4017': 'Hard-rubber tubes and pipes with fittings for civil aircraft are Free (C) (additional U.S. note 3).',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

FMVSS_PREFIX = ('4011.10', '4011.20.10.05', '4011.20.10.15', '4011.20.50.10', '4011.20.50.20', '4011.40', '4012.11', '4012.12',
                '4012.20.15', '4012.20.60')
NO_ADCVD = ('4011.30', '4011.40', '4011.50')
rows_by_hts = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
for ln in te['lines']:
    hts = ln['hts']
    sub = hts[:10]
    h = hts[:4]
    rules = []
    if hts.startswith(FMVSS_PREFIX):
        rules += ['nhtsa-fmvss', 'nhtsa-tin', 'nhtsa-agent']
    if h == '4011' and not hts.startswith(NO_ADCVD):
        rules.append('adcvd-tires')
    if hts.startswith('4014.10'):
        rules.append('fda-condoms')
    if hts.startswith('4014.90.10'):
        rules.append('fda-food-contact')
    if hts.startswith('4015.12'):
        rules.append('fda-gloves')
    if h == '4015':
        rules.append('forced-labor')
    rules += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules
    gen = ln.get('general') or rows_by_hts[hts]['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if hts.startswith(S232_PV) or hts.startswith(S232_MHDV):
        levers.append('vehicle-part')
    levers += ['usmca', 'origin']
    if h == '4001':
        levers.append('natural-rubber')
    if sub in AIRCRAFT_SUBS:
        levers.append('civil-aircraft')
    if dutiable:
        levers.append('fta')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Whether a tire is a '
    'vehicle part, which line a glove or seal falls in, and which Chapter 99 and AD/CVD duties apply depend on the facts of each shipment, and '
    'the extra duties change by proclamation, Federal Register notice and CBP guidance; confirm the current headings, the AD/CVD case and the '
    'DOT and FDA requirements before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 40: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Tire & Rubber Tariff FAQ: China, Thailand, Canada Tires, Section 232, Nitrile Gloves, HS Codes (HTS Ch. 40) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on tires and rubber goods: car and truck tires from China, '
    'Thailand, Japan, Mexico and Canada, Section 232 auto-parts duties, Michelin and other brands, nitrile and latex gloves, natural rubber, '
    'and the HS codes for tires, gloves, hoses and condoms.',
    'keywords': [
        'tariffs on tires',
        'tire tariffs',
        'do tires have tariffs',
        'are tires subject to tariffs',
        'tariffs on michelin tires',
        'tariffs on tires from china',
        'truck tire tariffs',
        'hs code for tires',
        'nitrile gloves tariff code',
        'natural rubber tariff code',
        'hs code for condoms',
        'will tire prices go up with tariffs',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for tires, natural and synthetic rubber, rubber gloves '
    'and other rubber goods. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Chapter 40 base rates are low: raw natural and synthetic rubber Free, car and truck tires 4% or 3.4%, hoses and seals 2.5%, a few glove '
    'lines 14%.',
    'Car tires, light-truck and truck radials, retreads, inner tubes and brake hoses pay the 25% Section 232 vehicle-parts duty when they are '
    'vehicle parts: 15% in total from Japan, the EU, Korea and Taiwan, 10% from the UK, nothing under USMCA.',
    'Since July 24, 2026 other rubber goods pay a Section 301 duty by country (+10% or +12.5%); natural rubber is exempt.',
    'China pays the most: 54% on car tires, 112.5% on medical gloves, 37.5%–40% on most other rubber goods, plus tire AD/CVD deposits.',
    'Antidumping or countervailing duties apply to passenger and light-truck tires from China, Korea, Taiwan, Thailand and Vietnam, truck and '
    'bus tires from China and Thailand, and off-the-road tires from India.',
    'Three Canadian seal and natural-rubber subheadings pay 50% Section 338 even under USMCA. The IEEPA duties ended February 24, 2026; the '
    'Section 122 surcharge ended July 23, 2026.',
    'Tires need DOT certification and an HS-7 declaration at entry; medical gloves and condoms need FDA 510(k) clearance.',
]
fc['questionSource'] = f'Google search suggestions (U.S. English), collected {SUGG_DATE}'

fc['faqs'] = [
    {
        'id': 'what-is-ch40',
        'question': 'What does HTS Chapter 40 cover?',
        'searchedAs': ['hts chapter 40', 'htsus chapter 40', 'chapter 40 hts code', 'chapter 40 hts 2025', 'us hts chapter 40'],
        'answer': 'Chapter 40 of the Harmonized Tariff Schedule covers rubber and articles of rubber: natural rubber and latex (4001), synthetic '
        'rubber (4002), reclaimed and compounded rubber, sheets and profiles, hoses (4009), conveyor and drive belts (4010), new tires (4011), '
        'retreaded and used tires (4012), inner tubes (4013), condoms and nursing nipples (4014), rubber gloves (4015), gaskets, seals and '
        'other rubber articles (4016) and hard rubber (4017). It has 198 tariff lines; 120 carry a base duty, from 1.9% to 14%. Rubber footwear '
        '(chapter 64), toys (chapter 95) and textiles of rubber thread are classified elsewhere.',
        'link': '',
    },
    {
        'id': 'tire-tariffs',
        'question': 'What are the U.S. tariffs on imported tires in 2026?',
        'searchedAs': ['tariffs on tires', 'us tariffs on tires', 'tire tariffs', 'tire tariffs 2025', 'do tires have tariffs',
                       'are tires subject to tariffs', 'tariffs on car tires', 'are car tires subject to tariffs'],
        'answer': 'Car tires (4011.10) have a 4% base rate (3.4% for non-radial). Because they are Section 232 automobile parts, a car tire also '
        'pays 25% (9903.94.05) — so 29% from Thailand, Vietnam, Malaysia, Cambodia, Indonesia or India — or 15% in total from Japan, South '
        'Korea, Taiwan or the EU, 10% in total from the UK, 54% from China, and nothing from Mexico or Canada under USMCA. Truck tires for '
        'heavy trucks pay 25% under the separate medium- and heavy-duty parts action. Antidumping or countervailing duties come on top for '
        'passenger and light-truck tires from China, Korea, Taiwan, Thailand and Vietnam.',
        'link': 'industry-areas',
    },
    {
        'id': 'china-tires',
        'question': 'What is the tariff on tires from China?',
        'searchedAs': ['tariffs on tires from china', 'tariff on tires from china', 'us tariffs on chinese tires',
                       'anti dumping duty tires from china'],
        'answer': 'A Chinese car tire pays 54%: the 4% base rate, 25% Section 301 List 3 (9903.88.03) and 25% Section 232 (9903.94.05). On '
        'top, the 2015 antidumping and countervailing duty orders on Chinese passenger and light-truck tires, continued in July 2026 (91 FR '
        f'43608), add company-specific cash deposits, and truck and bus tires have their own 2019 orders. China shipped just {fmt_usd(cn_tires)} '
        f'of tires to the U.S. in {Y}.',
        'link': 'tariff-updates',
    },
    {
        'id': 'thailand-tires',
        'question': 'What is the tariff on tires from Thailand?',
        'searchedAs': ['tariff on tires from thailand', 'tariffs on tires from thailand', 'thailand tires vs china tires'],
        'answer': f'Thailand is the largest source of U.S. tire imports ({fmt_usd(hc("4011", "Thailand"))} in {Y}). A Thai car tire pays 29% '
        '(4% + 25% Section 232); tires that are not vehicle parts pay 16.5% (4% + 12.5% Section 301). Thai passenger and light-truck tires '
        'are under a 2021 antidumping order and truck and bus tires under a 2024 order (12.33% for most exporters when it was issued), so CBP '
        'also collects antidumping deposits. The 19% IEEPA duty on Thailand ended February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'section-232-tires',
        'question': 'Are tires covered by the Section 232 auto parts tariff?',
        'searchedAs': ['section 232 tires', 'section 232 tariffs tires', 'section 232 auto parts list', 'section 232 auto parts tariff list',
                       'section 232 auto parts hts list'],
        'answer': 'Yes. U.S. note 33(g) to Chapter 99 lists 4011.10.10 and 4011.10.50 (car tires), 4011.20.10 (radial bus and truck tires), '
        '4012.19.40 and 4012.19.80 (retreads), 4012.20.60 (used tires), 4013.10 (inner tubes), brake hoses with fittings and 4016.99.60.10. '
        'Since May 3, 2025 they pay 25% (9903.94.05) when they are parts of passenger vehicles or light trucks; listed articles that are not '
        'enter under 9903.94.06. Japan, the EU, Korea and Taiwan pay 15% in total, the UK 10% on its list, and USMCA-qualifying parts '
        'nothing. Parts of medium- and heavy-duty trucks and buses pay 25% under 9903.74.08 since November 1, 2025.',
        'link': 'tariff-updates',
    },
    {
        'id': 'brand-tires',
        'question': 'Are Michelin and other brand-name tires subject to tariffs?',
        'searchedAs': ['tariffs on michelin tires', 'are michelin tires subject to tariffs', 'do michelin tires have tariffs',
                       'are there tariffs on michelin tires'],
        'answer': 'Tariffs follow the country where a tire was made, not the brand. An imported tire pays the rate for its country of origin — '
        '15% in total from Japan or the EU, 29% from Thailand or Vietnam, Free from Mexico or Canada under USMCA — while tires made in the '
        'United States pay no import duty. The tire identification number molded on the sidewall includes a plant code assigned by NHTSA, '
        'and imported tires must be marked with their country of origin.',
        'link': 'industry-areas',
    },
    {
        'id': 'canada-mexico-tires',
        'question': 'Are there tariffs on tires from Canada and Mexico?',
        'searchedAs': ['tariffs on tires canada', 'tariffs on tires from canada', 'tariffs on tires from mexico'],
        'answer': f'Not on USMCA-qualifying tires: they pay no base rate, no Section 301 duty and no Section 232 duty (9903.94.06, 9903.74.10). '
        f'Canada and Mexico shipped {fmt_usd(hc("4011", "Canada") + hc("4011", "Mexico"))} of tires in {Y}. A tire that does not qualify pays '
        '29% as a passenger-vehicle part (4% + 25%). The USMCA tire rule is a change of heading, so tires made there from imported rubber can '
        'qualify. The Canada Section 338 duty does not cover tires.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'truck-tires',
        'question': 'What is the tariff on truck and bus tires?',
        'searchedAs': ['truck tire tariffs', 'hs code for truck tires', 'hs code for light truck tires'],
        'answer': 'Truck and bus tires are 4011.20: radial 4% (4011.20.10), other 3.4% (4011.20.50). Light-truck radials (4011.20.10.05) are '
        'passenger-vehicle parts (25%); on-highway and off-highway radials for heavy trucks (4011.20.10.15, .25, .35) pay 25% as medium- and '
        'heavy-duty vehicle parts: 29% from Japan, the EU, Thailand or Vietnam, 54% from China. Truck and bus tires from China (2019) and '
        'Thailand (2024) are also under antidumping orders.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-tires',
        'question': 'What is the HS code for tires?',
        'searchedAs': ['hs code for tires', 'hts code for tires', 'harmonized tariff code for tires', 'hs code for car tires', 'hs code 4011',
                       'tires hs code'],
        'answer': 'New pneumatic tires are heading 4011: car tires 4011.10 (radial 4011.10.10, by rim diameter; other 4011.10.50), bus and truck '
        'tires 4011.20, aircraft 4011.30, motorcycle 4011.40, bicycle 4011.50, farm 4011.70, construction and mining 4011.80, other (ATV, golf '
        'cart, trailer) 4011.90. Retreaded and used tires are 4012, inner tubes 4013.',
        'link': '',
    },
    {
        'id': 'used-tires',
        'question': 'What is the HS code and tariff for used and retreaded tires?',
        'searchedAs': ['hs code for used tires', 'hs code for used tyres', 'hs code for used car tires'],
        'answer': 'Used tires are 4012.20 and Free; used on-highway tires (4012.20.60) are Section 232 vehicle parts (25%). Retreaded car tires are '
        '4012.11 (4% radial, 3.4% other) and retreaded bus and truck tires 4012.12; retreads of 4012.19.40 and 4012.19.80 are also on the '
        'Section 232 list. Retreaded passenger-car tires must meet FMVSS 117, and retreads carry a retreader\'s tire identification number.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'gloves',
        'question': 'What is the tariff code and duty on nitrile and latex gloves?',
        'searchedAs': ['nitrile gloves tariff', 'nitrile gloves tariff code', 'hs code for nitrile gloves', 'latex gloves tariff code',
                       'hs code for rubber gloves', 'tariffs on gloves', 'us tariffs on china gloves'],
        'answer': 'Medical and surgical gloves of rubber, including nitrile and latex exam gloves, are 4015.12.10 and Free; non-medical seamless '
        'disposable gloves 4015.19.11 (3%); other gloves 14%. Malaysia, the largest source, adds 10% (medical gloves 10%, seamless gloves 13%), '
        'Thailand and Vietnam 12.5%. Chinese medical gloves pay 112.5% (12.5% plus 100% under 9903.91.08 since January 1, 2026). Medical '
        'gloves also need FDA 510(k) clearance.',
        'link': 'industry-areas',
    },
    {
        'id': 'natural-rubber',
        'question': 'Is there a tariff on natural rubber?',
        'searchedAs': ['natural rubber tariffs', 'natural rubber tariff code', 'tariffs on rubber', 'us tariffs on rubber',
                       'are there tariffs on rubber', 'rubber tariff china'],
        'answer': 'Natural rubber (heading 4001: latex 4001.10, smoked sheets 4001.21, TSNR 4001.22) is Free and on the Section 301 general '
        'exemption list, so it enters Free from Indonesia, Thailand, Côte d\'Ivoire, Malaysia or Vietnam; only Chinese natural rubber pays 25% '
        '(List 3). Synthetic rubber (4002) is also Free but pays the Section 301 duty by country: 10%–12.5% for most origins, 37.5% from '
        'China.',
        'link': '',
    },
    {
        'id': 'rubber-codes',
        'question': 'What are the HS codes for rubber hoses, gaskets and other rubber products?',
        'searchedAs': ['rubber tariff code', 'hs code for rubber', 'hs code for rubber hose', 'rubber hose tariff code', 'rubber gasket tariff code',
                       'hs code 4016', 'tariffs on rubber products'],
        'answer': 'Rubber hoses are 4009 (2.5%, brake hoses with fittings .0020), conveyor and V-belts 4010 (1.9%–8%), rubber sheet and profiles '
        '4008, gaskets, washers and O-rings 4016.93 (2.5%), floor mats 4016.91 (2.7%), rubber bands 4016.99.35 (Free), other articles 4016.99. '
        'On top comes the Section 301 duty by country (+10% or +12.5%; China 37.5%–40%), and from Canada 50% on 4016.93.50, 4016.99.15 and '
        '4016.99.35.',
        'link': '',
    },
    {
        'id': 'condoms',
        'question': 'What is the HS code for condoms?',
        'searchedAs': ['hs code for condoms', 'hs tariff code for condoms', 'hs code for latex condoms'],
        'answer': 'Condoms (sheath contraceptives) of rubber are 4014.10.00.00, Free under the base rate. They pay the Section 301 duty by country '
        '(+10% or +12.5%), are on no China Section 301 list, and are FDA Class II medical devices that need a 510(k) clearance and latex-condom '
        'labeling.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'tire-prices',
        'question': 'Do tariffs raise the cost of imported tires?',
        'searchedAs': ['will tires go up with tariffs', 'will tire prices go up with tariffs', 'tire prices after tariffs', 'tariffs tire prices',
                       'tire prices affected by tariffs'],
        'answer': 'The importer of record pays the duty when the tires enter. For a car tire that is 29% of the customs value from Thailand or '
        'Vietnam, 15% from Japan, Korea or the EU, 54% from China and nothing under USMCA, plus any AD/CVD deposit. How much of that reaches '
        'retail prices depends on the seller; the tariff schedule sets only the duty.',
        'link': 'industry-areas',
    },
]

# Final consistency guard: no TODO left anywhere.
def walk(o, p=''):
    if isinstance(o, dict):
        for k, v in o.items():
            walk(v, f'{p}.{k}')
    elif isinstance(o, list):
        for i, v in enumerate(o):
            walk(v, f'{p}[{i}]')
    elif isinstance(o, str) and 'TODO' in o:
        raise SystemExit(f'TODO left at {p}: {o[:120]}')


walk(d)
d['asOf'] = TODAY
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
