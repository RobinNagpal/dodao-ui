#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 87 (Vehicles Other Than Railway or Tramway Rolling Stock, and Parts and Accessories
Thereof) content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill87.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script (see run.sh).

Facts come from: HTSUS 2026 Revision 21 (Chapter 87 and its notes, general notes, Chapter 98, Chapter 99 subchapter III
notes 2, 16, 20, 29, 30, 31, 33, 38, 50, 51 and 52), the Section 232 automobile / truck proclamations and the deal notices
(Japan, EU, Korea, UK, Taiwan), the IEEPA / Section 122 / 2026 Section 301 / Brazil / Canada Section 338 documents, Commerce
and ITC AD/CVD notices (Federal Register, read on govinfo), CBP CSMS messages, eCFR (titles 16, 19, 40, 49; up to date as of
2026-10-08), the U.S. Code on govinfo, and UN Comtrade.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FORBIDDEN_SOURCE, IU  # noqa: E402,F401

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources87 import CH87_PDF, CH98_PDF, CH99_PDF, GN_PDF, USC_2085, USC_30112, USC_30141, USC_7522, add_sources  # noqa: E402

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU
TODAY = '2026-10-13'
ECFR_AS_OF = '2026-10-08'

d = json.load(open(SRC))
d['asOf'] = TODAY
MEASURES = {m['measureKey']: m for m in json.load(open(f'{WT}/src/tariff-data/calculator/measures.json'))['measures']}


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def money(v):
    if v >= 1e9:
        return f'${v / 1e9:.1f}B'
    if v >= 1e6:
        return f'${v / 1e6:.0f}M'
    return f'${v / 1e3:.0f}K'


# ---------------------------------------------------------------------------------------------------
# Lines and measure coverage
# ---------------------------------------------------------------------------------------------------
rows = d['overview']['rateTable']['rows']
LINES = [r for r in rows if r['htsCode10']]
N_LINES = len(LINES)
assert N_LINES == 402, N_LINES


def covered(key):
    m = MEASURES[key]
    inc = [c for c in m['coverageInclude'] if c.startswith('87')]
    exc = [c for c in m.get('coverageExclude', []) if c.startswith('87')]
    return [r['hts'] for r in LINES if any(r['htsCode10'].startswith(c) for c in inc) and not any(r['htsCode10'].startswith(c) for c in exc)]


N_AUTOS = len(covered('s232-autos'))
N_PARTS = len(covered('s232-auto-parts'))
MHDV_SET = set(covered('s232-mhdv')) | set(covered('s232-mhdv-light-truck-overlap')) | set(covered('s232-mhdv-auto-part-overlap'))
MHDVP_SET = set(covered('s232-mhdv-parts')) | set(covered('s232-mhdv-parts-auto-part-overlap'))
N_MHDV = len(MHDV_SET)
N_BUS = len(covered('s232-buses'))
N_MHDVP = len(MHDVP_SET)
N_EV = len(covered('s301-china-2024-31d'))
N_L1, N_L2, N_L3, N_L4A = (len(covered(k)) for k in ('s301-china-list1', 's301-china-list2', 's301-china-list3', 's301-china-list4a'))
N_CA338 = len(set(covered('ca338-b3')) | set(covered('ca338-b3-0915')))
N_UKP = len(covered('s232-auto-parts-uk'))
print('autos', N_AUTOS, 'parts', N_PARTS, 'mhdv', N_MHDV, 'bus', N_BUS, 'mhdv parts', N_MHDVP, 'ev', N_EV, 'lists', N_L1, N_L2, N_L3, N_L4A,
      'ca338', N_CA338, 'uk parts', N_UKP)
assert (N_AUTOS, N_BUS, N_EV, N_CA338) == (74, 10, 29, 7), (N_AUTOS, N_BUS, N_EV, N_CA338)
N_DUTIABLE = sum(1 for r in LINES if r['dutiable'])

# ---------------------------------------------------------------------------------------------------
# Trade figures (UN Comtrade via the generator's understandIndustry page)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
HAVE_TRADE = bool(ui.get('byYear'))
assert HAVE_TRADE, 'trade data missing: regenerate with --trade-file'
Y = ui['latestYear']
PY = ui['priorYear']
TOT = ui['byYear'][-1]['totalUsd']
PRIOR = ui['byYear'][-2]['totalUsd']
BYC = {c['country']: c for c in ui['byCountry']}
BYL = {x['hs6']: x for x in ui['byLine']}
BHC = {}
H = {}
for x in ui['byHeadingCountry']:
    BHC[(x['heading'], x['country'])] = BHC.get((x['heading'], x['country']), 0) + x['importsUsd']
    H[x['heading']] = H.get(x['heading'], 0) + x['importsUsd']
ALIASES = {
    'South Korea': ['South Korea', 'Korea', 'Rep. of Korea', 'Republic of Korea'],
    'Vietnam': ['Vietnam', 'Viet Nam'],
    'Türkiye': ['Türkiye', 'Turkey', 'Türkiye (Turkey)'],
    'Slovakia': ['Slovakia', 'Slovak Republic'],
    'Czechia': ['Czechia', 'Czech Republic'],
}


def cname(c):
    for n in ALIASES.get(c, [c]):
        if n in BYC:
            return n
    return None


def imp(c):
    n = cname(c)
    return BYC[n]['importsUsd'] if n else 0


def prior(c):
    n = cname(c)
    return BYC[n]['priorImportsUsd'] if n else 0


def hc(h, c):
    for n in ALIASES.get(c, [c]):
        if (h, n) in BHC:
            return BHC[(h, n)]
    return 0


def share(v):
    return f'{100 * v / TOT:.0f}%'


def pct_change(a, b):
    return f'{100 * (a / b - 1):+.1f}%'


RANKED = sorted(ui['byCountry'], key=lambda c: -c['importsUsd'])
TOP = [c['country'] for c in RANKED]

# ---------------------------------------------------------------------------------------------------
# Chapter, labels
# ---------------------------------------------------------------------------------------------------
d['chapter']['title'] = 'Vehicles Other Than Railway or Tramway Rolling Stock, and Parts and Accessories Thereof'
SHORT = 'Cars, Trucks, Auto Parts & Bicycles'

GROUP_LABELS = {
    '8701': ('Tractors: road tractors for semi-trailers, farm and track-laying tractors', 'Tractors'),
    '8702': ('Buses, coaches and vans for 10 or more people', 'Buses'),
    '8703': ('Cars, SUVs, minivans, EVs, hybrids, ATVs, golf carts and snowmobiles', 'Cars & SUVs'),
    '8704': ('Trucks and pickups: light trucks, heavy trucks, dump trucks', 'Trucks & pickups'),
    '8705': ('Special-purpose vehicles: mobile cranes, fire trucks, concrete mixers, wreckers', 'Special vehicles'),
    '8706': ('Chassis fitted with engines', 'Chassis with engines'),
    '8707': ('Vehicle bodies and cabs', 'Bodies & cabs'),
    '8708': ('Auto parts: bumpers, brakes, gearboxes, axles, wheels, radiators, steering, airbags', 'Auto parts'),
    '8709': ('Works trucks for factories, warehouses and airports (tugs, tow tractors)', 'Works trucks'),
    '8710': ('Tanks and armored fighting vehicles', 'Armored vehicles'),
    '8711': ('Motorcycles, scooters, mopeds and e-bikes', 'Motorcycles & e-bikes'),
    '8712': ('Bicycles and other non-motorized cycles', 'Bicycles'),
    '8713': ('Wheelchairs and mobility carriages', 'Wheelchairs'),
    '8714': ('Parts of motorcycles, bicycles and wheelchairs', 'Bike & motorcycle parts'),
    '8715': ('Baby carriages, strollers and parts', 'Strollers'),
    '8716': ('Trailers, semi-trailers, campers, container chassis, hand trucks and carts', 'Trailers'),
}

BLURBS = {
    '8701': (
        'Farm and track-laying tractors are Free at base; road tractors for semi-trailers (8701.21–8701.29) pay 4%. Road tractors also '
        'pay the 25% Section 232 truck duty; other tractors carry the Section 232 metals duty on equipment (15% in total for farm '
        'tractors, 25% for single-axle, track-laying and other non-farm tractors, 15% from the deal partners).',
        ['semi truck', 'road tractor', 'tractor unit', 'farm tractor', 'compact tractor', 'crawler tractor', 'walk-behind tractor'],
    ),
    '8702': (
        'Buses, coaches and 10+ passenger vans pay 2%, plus the 10% Section 232 bus duty from every country, USMCA included. '
        'Electric buses (8702.40, 8702.90) from China add 100% (note 31).',
        ['bus', 'school bus', 'coach', 'electric bus', 'shuttle bus', '15 passenger van'],
    ),
    '8703': (
        'Cars, SUVs, minivans, EVs and hybrids pay 2.5% at base, plus the 25% Section 232 automobile duty: 15% in total from the EU, '
        'Japan and South Korea, 10% from the UK within its quota, 25% on the non-U.S. content of USMCA vehicles, 127.5% for a Chinese EV. '
        'ATVs and small vehicles up to 1,000 cc, golf carts and snowmobiles are outside the auto action but carry the Section 232 metals '
        'duty.',
        ['car', 'SUV', 'electric vehicle', 'EV', 'hybrid', 'minivan', 'used car', 'ATV', 'golf cart', 'snowmobile', 'UTV'],
    ),
    '8704': (
        'Trucks for goods: pickups and light trucks pay the 25% "chicken tax" base rate (Korea too), plus the Section 232 automobile '
        'duty (25%; the EU, Japan and Korea pay only the 25% base). Trucks over 5 t pay 25% (4% for cab chassis) plus the 25% Section 232 '
        'truck duty; off-highway dumpers are Free plus 25%.',
        ['pickup truck', 'light truck', 'box truck', 'dump truck', 'cargo van', 'electric truck', 'semi', 'mining truck'],
    ),
    '8705': (
        'Special-purpose vehicles are Free at base. Mobile cranes and drilling rigs carry the Section 232 metals duty on mobile '
        'equipment (25%, 15% for deal partners); concrete mixers and other special trucks the 25% Section 232 truck duty; fire trucks '
        'only the Section 301 duty for the country.',
        ['mobile crane', 'fire truck', 'concrete mixer truck', 'tow truck', 'wrecker', 'road sweeper', 'mobile clinic'],
    ),
    '8706': (
        'Chassis with engines pay Free to 4% at base. Chassis for cars are Section 232 auto parts (25%); chassis for trucks, road '
        'tractors and buses are Section 232 truck vehicles or parts (25%).',
        ['rolling chassis', 'cab chassis', 'truck chassis', 'motorhome chassis', 'bus chassis'],
    ),
    '8707': (
        'Bodies and cabs pay 2.5% (cars) or 4% (trucks and buses), Free for farm tractors. Car bodies are Section 232 auto parts and '
        'truck cabs truck parts (25%) when they are parts of those vehicles.',
        ['car body', 'truck cab', 'body in white', 'bus body', 'cab'],
    ),
    '8708': (
        'Auto parts pay 2.5% or Free at base. Most of 8708 is on the Section 232 parts lists: 25% when the article is a part of a '
        'passenger vehicle or light truck (15% in total from the EU, Japan, Korea and Taiwan, 10% from the UK, Free under USMCA) and 25% '
        'when it is a truck or bus part. AD/CVD deposits apply to Chinese steel wheels and Chinese and Turkish brake drums.',
        ['brake pads', 'brake rotor', 'bumper', 'gearbox', 'transmission', 'axle', 'wheels', 'radiator', 'steering wheel', 'airbag',
         'shock absorber', 'clutch', 'exhaust', 'windshield'],
    ),
    '8709': (
        'Works trucks (factory, warehouse and airport tugs and tow tractors) are Free at base; complete works trucks carry the 25% '
        'Section 232 truck duty and their parts the truck-parts duty when used in such vehicles.',
        ['tow tractor', 'baggage tractor', 'platform truck', 'tugger', 'airport tug'],
    ),
    '8710': (
        'Tanks and other armored fighting vehicles and their parts are Free at base; only the Section 301 duty for the country applies.',
        ['armored vehicle', 'tank', 'military vehicle'],
    ),
    '8711': (
        'Motorcycles, scooters and mopeds are Free up to 700 cc and 2.4% above; electric motorcycles and e-bikes (8711.60) are Free. '
        'Products of China pay 25% (List 2: e-bikes and electric motorcycles; List 1: over 800 cc) or 7.5% (List 4A) plus 12.5%. '
        'Canadian motorcycles over 800 cc are banned from importation since September 29, 2026.',
        ['motorcycle', 'e-bike', 'electric bike', 'scooter', 'electric scooter', 'moped', 'dirt bike', 'electric motorcycle'],
    ),
    '8712': (
        'Bicycles pay 11%, or 5.5% for light road bikes (under 16.3 kg with narrow tires, 8712.00.25) and certain wheel sizes '
        '(8712.00.44); other cycles 3.7%. Chinese bicycles add 25% (List 3) and 12.5%.',
        ['bicycle', 'road bike', 'mountain bike', 'kids bike', 'BMX', 'tricycle', 'cargo bike'],
    ),
    '8713': (
        'Wheelchairs and mobility carriages, manual or powered, are Free at base; only the Section 301 duty for the country applies.',
        ['wheelchair', 'power wheelchair', 'mobility scooter', 'electric wheelchair'],
    ),
    '8714': (
        'Motorcycle and wheelchair parts are Free; bicycle parts pay Free to 10%: frames 3.9%, frame tubing sets 6%, rims 5%, saddles '
        'and pedals 8%, spokes and some hubs, brakes and crank-gear 10%; derailleurs, cotterless cranksets, sprockets and caliper brakes '
        'Free.',
        ['bike frame', 'bike wheel', 'derailleur', 'bike pedals', 'saddle', 'motorcycle parts', 'handlebar', 'bike brakes'],
    ),
    '8715': (
        'Baby carriages, strollers and their parts pay 4.4%, plus the Section 301 duty for the country (Chinese strollers 12.5%).',
        ['stroller', 'baby stroller', 'pram', 'jogging stroller', 'baby carriage'],
    ),
    '8716': (
        'Trailers and semi-trailers are Free at base; most carry the 25% Section 232 metals duty (campers, van and platform trailers, '
        'container chassis). Hand trucks and carts pay 3.2%, trailer parts 3.1%, castors 5.7%, plus 25%. Chassis, van-type trailers, '
        'steel trailer wheels and hand trucks also face AD/CVD orders.',
        ['trailer', 'semi trailer', 'camper', 'travel trailer', 'utility trailer', 'container chassis', 'hand truck', 'boat trailer',
         'dolly'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 87: {SHORT} — Tariff Rates'
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
    if e['code'] == 'B':
        e['name'] = 'Automotive Products Trade Act (original-equipment parts from Canada)'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — in force to December 31, 2026'

exec(open(__file__.replace('fill87.py', 'fill87_overview.py')).read())
exec(open(__file__.replace('fill87.py', 'fill87_updates.py')).read())
exec(open(__file__.replace('fill87.py', 'fill87_pages.py')).read())


def walk(x, p=''):
    if isinstance(x, dict):
        for k, v in x.items():
            walk(v, f'{p}.{k}')
    elif isinstance(x, list):
        for i, v in enumerate(x):
            walk(v, f'{p}[{i}]')
    elif isinstance(x, str):
        assert 'TODO' not in x, p
        assert FORBIDDEN_SOURCE not in x.lower(), p


walk(d)
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
