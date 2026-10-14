#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 58 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill58.py <generated.json> <out.json>   (run.sh does generate -> fill -> compact -> prettier -> validate)
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import os
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
WT = IU
TODAY = '2026-10-13'
ECFR_DATE = '2026-10-08'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '58-special' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF.setdefault(s['id'], s)

REL = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename='
CH58 = REL + 'Chapter%2058'
CH60 = REL + 'Chapter%2060'
CH98 = REL + 'Chapter%2098'
CH99 = REL + 'Chapter%2099'
GN = REL + 'General%20Notes'
SEC11 = REL + 'Chapter%2050'  # Section XI notes are printed at the start of Chapter 50


def ecfr(t, s):
    return f'https://www.ecfr.gov/current/title-{t}/section-{s}'


def ecfr_part(t, p):
    return f'https://www.ecfr.gov/current/title-{t}/part-{p}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e8:
        return f'${n / 1e6:.0f}M'
    if n >= 1e6:
        return f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
Y, PY = ui['latestYear'], ui['priorYear']
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-58.json'))
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_6 = {x['hs6']: x for x in trade['byHs6']}
by_hc = {(x['heading'], x['country']): x['importsUsd'] for x in trade['byHeadingCountry']}
TW, VN, TR, KR = 'Other Asia, nes', 'Viet Nam', 'Türkiye', 'Rep. of Korea'
NAMES = {TW: 'Taiwan', VN: 'Vietnam', TR: 'Turkey', KR: 'South Korea', 'Dominican Rep.': 'Dominican Republic'}


def imp(c):
    x = by_c.get(c)
    return x['importsUsd'] if x else 0


def chg(c):
    x = by_c[c]
    return round((x['importsUsd'] / x['priorImportsUsd'] - 1) * 100, 1)


def share(v):
    return round(v / total * 100)


def h6(code):
    return by_6.get(code, {}).get('importsUsd', 0)


def head(h):
    return by_h[h].get(str(Y), 0)


def hc(h, c):
    return by_hc.get((h, c), 0)


exec(open(os.path.join(HERE, 'fill58_body.py')).read())


def no_todo(obj, where=''):
    if isinstance(obj, dict):
        for k, v in obj.items():
            no_todo(v, f'{where}.{k}')
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            no_todo(v, f'{where}[{i}]')
    elif isinstance(obj, str) and 'TODO' in obj:
        raise SystemExit(f'TODO left at {where}: {obj[:120]}')


no_todo(d)
json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
