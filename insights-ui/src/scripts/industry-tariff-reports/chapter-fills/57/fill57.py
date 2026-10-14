#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 57 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill57.py <generated.json> <out.json>   (run.sh does generate -> fill -> compact -> prettier -> validate)
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
ECFR_DATE = '2026-10-08'

d = json.load(open(SRC))
# Generator group labels, cut with an ellipsis (batch-1 quirk); replaced in the fields that copy them.
ORIG_LABELS = {g['heading']: g['label'] for g in d['overview']['productGroups']}

# Official sources already used (and checked) in other chapter files, by id.
REF = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '57-carpets' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF.setdefault(s['id'], s)

CH57 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2057'
CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
SEC11 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2050'  # Section XI notes are printed at the start of Chapter 50
USC_1307 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1307.htm'


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
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-57.json'))
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_6 = {x['hs6']: x for x in trade['byHs6']}


def imp(c, year=None):
    x = by_c.get(c)
    if not x:
        return 0
    return x['importsUsd'] if year is None else x['byYear'].get(str(year), 0)


def chg(c):
    x = by_c[c]
    return round((x['importsUsd'] / x['priorImportsUsd'] - 1) * 100, 1)


def share(v):
    return round(v / total * 100)


def h6(code):
    return by_6.get(code, {}).get('importsUsd', 0)


def head(h):
    return by_h[h].get(str(Y), 0)


exec(open(__file__.replace('fill57.py', 'fill57_body.py')).read())

json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
