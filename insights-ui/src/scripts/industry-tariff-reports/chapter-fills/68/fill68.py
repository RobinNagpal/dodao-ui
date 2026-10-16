#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 68 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill68.py <generated.json> <out.json>
Re-runnable: run.sh regenerates the data parts, then runs this script, compact and prettier.
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = IU
TODAY = '2026-10-13'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/68-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

for page in ('tariffUpdates', 'industryAreas'):
    for s_ in d[page]['sources']:
        REF_SOURCES[s_['id']] = s_

CH68_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2068'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
FR = 'https://www.federalregister.gov/documents/'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def ecfr_subpart(title, part, subpart):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}/subpart-{subpart}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round((a / b - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
def frs(sid, citation, document, title, published, path, signed=None, publisher='Federal Register'):
    return {
        'id': sid,
        'publisher': publisher,
        'citation': citation,
        'document': document,
        'title': title,
        'signed': signed,
        'published': published,
        'url': FR + path,
    }


NEW_SOURCES = {
    'hts-ch68': {
        'id': 'hts-ch68',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 68',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 68: Articles of Stone, Plaster, Cement, '
        'Asbestos, Mica or Similar Materials',
        'signed': None,
        'published': '2026-10-07',
        'url': CH68_PDF,
    },
    'fr-2025-21715': frs(
        'fr-2025-21715',
        '90 FR 55165',
        'Notice (USITC)',
        'Quartz Surface Products; Institution of Investigation, Scheduling of Public Hearings, and Determination That the Investigation Is '
        'Extraordinarily Complicated (Inv. No. TA-201-79)',
        '2025-12-01',
        '2025/12/01/2025-21715/quartz-surface-products-institution-of-investigation-scheduling-of-public-hearings-and-determination',
    ),
    'fr-2026-09809': frs(
        'fr-2026-09809',
        '91 FR 28096',
        'Notice (USTR)',
        "Request for Comments and Public Hearing About the Administration's Action Following a Determination of Import Injury With Regard to "
        'Quartz Surface Products (QSP)',
        '2026-05-15',
        '2026/05/15/2026-09809/request-for-comments-and-public-hearing-about-the-administrations-action-following-a-determination',
    ),
    'fr-2026-10133': frs(
        'fr-2026-10133',
        '91 FR 29980',
        'Notice (USITC)',
        "Quartz Surface Products — summary of the Commission's report to the President (Inv. No. TA-201-79)",
        '2026-05-21',
        '2026/05/21/2026-10133/quartz-surface-products',
    ),
    'fr-2019-14865': frs(
        'fr-2019-14865',
        '84 FR 33053',
        'Notice (ITA)',
        "Certain Quartz Surface Products From the People's Republic of China: Antidumping and Countervailing Duty Orders (A-570-084, C-570-085)",
        '2019-07-11',
        '2019/07/11/2019-14865/certain-quartz-surface-products-from-the-peoples-republic-of-china-antidumping-and-countervailing',
    ),
    'fr-2020-13401': frs(
        'fr-2020-13401',
        '85 FR 37422',
        'Notice (ITA)',
        'Certain Quartz Surface Products From India and Turkey: Antidumping Duty Orders (A-533-889, A-489-837)',
        '2020-06-22',
        '2020/06/22/2020-13401/certain-quartz-surface-products-from-india-and-turkey-antidumping-duty-orders',
    ),
    'fr-2020-13374': frs(
        'fr-2020-13374',
        '85 FR 37431',
        'Notice (ITA)',
        'Certain Quartz Surface Products From India and the Republic of Turkey: Countervailing Duty Orders (C-533-890, C-489-838)',
        '2020-06-22',
        '2020/06/22/2020-13374/certain-quartz-surface-products-from-india-and-the-republic-of-turkey-countervailing-duty-orders',
    ),
    'fr-2025-01946': frs(
        'fr-2025-01946',
        '90 FR 8521',
        'Notice (ITA)',
        "Certain Quartz Surface Products From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders",
        '2025-01-30',
        '2025/01/30/2025-01946/certain-quartz-surface-products-from-the-peoples-republic-of-china-continuation-of-antidumping-and',
    ),
    'fr-2026-00739': frs(
        'fr-2026-00739',
        '91 FR 1751',
        'Notice (ITA)',
        'Certain Quartz Surface Products From India and the Republic of Türkiye: Continuation of Antidumping and Countervailing Duty Orders',
        '2026-01-15',
        '2026/01/15/2026-00739/certain-quartz-surface-products-from-india-and-the-republic-of-trkiye-continuation-of-antidumping',
    ),
    'fr-2026-18700': frs(
        'fr-2026-18700',
        '91 FR 58082',
        'Notice (ITA)',
        'Certain Quartz Surface Product From India: Preliminary Results, Intent To Rescind, in Part, and Rescission, in Part of Antidumping '
        'Duty Administrative Review; 2024-2025',
        '2026-09-14',
        '2026/09/14/2026-18700/certain-quartz-surface-product-from-india-preliminary-results-intent-to-rescind-in-part-and',
    ),
    'fr-e9-26680': frs(
        'fr-e9-26680',
        '74 FR 57145',
        'Notice (ITA)',
        "Diamond Sawblades and Parts Thereof From the People's Republic of China and the Republic of Korea: Antidumping Duty Orders (A-570-900)",
        '2009-11-04',
        '2009/11/04/E9-26680/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-and-the-republic-of-korea',
    ),
    'fr-2021-07450': frs(
        'fr-2021-07450',
        '86 FR 18942',
        'Notice (ITA)',
        "Diamond Sawblades and Parts Thereof From the People's Republic of China: Continuation of Antidumping Duty Order",
        '2021-04-12',
        '2021/04/12/2021-07450/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-continuation-of-antidumping',
    ),
    'fr-2026-13573': frs(
        'fr-2026-13573',
        '91 FR 40976',
        'Notice (ITA)',
        "Diamond Sawblades and Parts Thereof From the People's Republic of China: Final Results of the Expedited Third Sunset Review of the "
        'Antidumping Duty Order',
        '2026-07-06',
        '2026/07/06/2026-13573/diamond-sawblades-and-parts-thereof-from-the-peoples-republic-of-china-final-results-of-the',
    ),
    'fr-2026-13610': frs(
        'fr-2026-13610',
        '91 FR 41084',
        'Notice (USITC)',
        'Diamond Sawblades and Parts Thereof From China; Scheduling of an Expedited Five-Year Review',
        '2026-07-06',
        '2026/07/06/2026-13610/diamond-sawblades-and-parts-thereof-from-china-scheduling-of-an-expedited-five-year-review',
    ),
    'fr-2025-18882': frs(
        'fr-2025-18882',
        '90 FR 46555',
        'Notice (ITA)',
        "Sol Gel Alumina-Based Ceramic Abrasive Grains From the People's Republic of China: Antidumping Duty Order and Countervailing Duty "
        'Order (A-570-190, C-570-191)',
        '2025-09-29',
        '2025/09/29/2025-18882/sol-gel-alumina-based-ceramic-abrasive-grains-from-the-peoples-republic-of-china-antidumping-duty',
    ),
    'fr-2021-17790': frs(
        'fr-2021-17790',
        '86 FR 46676',
        'Notice (ITA)',
        "Certain Magnesia Carbon Bricks From Mexico and the People's Republic of China: Continuation of Antidumping Duty Orders and "
        'Countervailing Duty Order (A-201-837, A-570-954, C-570-955)',
        '2021-08-19',
        '2021/08/19/2021-17790/certain-magnesia-carbon-bricks-from-mexico-and-the-peoples-republic-of-china-continuation-of',
    ),
    'fr-2026-13416': frs(
        'fr-2026-13416',
        '91 FR 40590',
        'Notice (USITC)',
        'Magnesia Carbon Bricks From China and Mexico; Institution of Five-Year Reviews',
        '2026-07-02',
        '2026/07/02/2026-13416/magnesia-carbon-bricks-from-china-and-mexico-institution-of-five-year-reviews',
    ),
    'fr-2024-05972': frs(
        'fr-2024-05972',
        '89 FR 21970',
        'Final rule (EPA)',
        'Asbestos Part 1; Chrysotile Asbestos; Regulation of Certain Conditions of Use Under the Toxic Substances Control Act (TSCA)',
        '2024-03-28',
        '2024/03/28/2024-05972/asbestos-part-1-chrysotile-asbestos-regulation-of-certain-conditions-of-use-under-the-toxic',
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
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y = ui['latestYear']
PY = ui['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in ui['byYear']}
total, prior_total = year_tot[Y], year_tot[PY]
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-68.json'))
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {x['hs6']: x for x in trade['byHs6']}
by_hc = {}
for x in trade['byHeadingCountry']:
    by_hc[(x['heading'], x['country'])] = x['importsUsd']


def imp(country):
    c = by_c_all.get(country)
    return c['importsUsd'] if c else 0


def prior(country):
    c = by_c_all.get(country)
    return c['priorImportsUsd'] if c else 0


def imp_year(country, year):
    c = by_c_all.get(country)
    return c['byYear'].get(str(year), 0) if c else 0


def chg(country):
    return pct(imp(country), prior(country))


def hy(heading, year=None):
    return by_h.get(heading, {}).get(str(year or Y), 0)


def hc(heading, country):
    return by_hc.get((heading, country), 0)


exec(open(__file__.replace('fill68.py', 'fill68_text.py')).read())
