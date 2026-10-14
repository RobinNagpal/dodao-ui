#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 91 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill91.py <generated.json> <out.json>   (see run.sh)
Data-driven where the generator output may change: the line counts, the lines the matrix does not price
(8-digit lines whose statistical suffixes are only in Chapter 91 statistical note 1) and the trade figures are
read from the generated file, so a regeneration after a generator fix keeps the prose true.
"""
import glob
import json
import os
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'
REG_AS_OF = '2026-10-08'
HERE = os.path.dirname(os.path.abspath(__file__))

d = json.load(open(SRC))
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-91.json'))

CH91_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2091'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e8:
        return f'${n / 1e6:.0f}M'
    if n >= 1e6:
        return f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return (a / b - 1) * 100


# ---------------------------------------------------------------------------------------------------
# Data read from the generated file / trade file
# ---------------------------------------------------------------------------------------------------
rows = d['overview']['rateTable']['rows']
ROW = {r['hts']: r for r in rows if r['hts']}
# Every rate line has an htsCode10 (8-digit watch and clock lines are keyed by their first statistical-note-1 number).
ALL_LINES = [r for r in rows if r['htsCode10']]
N_ALL = len(ALL_LINES)
N_DUTIABLE = sum(1 for r in ALL_LINES if r['dutiable'])
N_FREE = N_ALL - N_DUTIABLE
N_COMPOUND = sum(1 for r in ALL_LINES if r['effectiveGeneral'] and (' on the ' in r['effectiveGeneral'] or ' each' in r['effectiveGeneral']))

LY, PY = trade['latestYear'], trade['priorYear']
TOT = {t['year']: t['totalUsd'] for t in trade['totalsByYear']}
T25, T24 = TOT[LY], TOT[PY]
CTRY = {c['country']: c for c in trade['byCountry']}
HEAD = {h['heading']: h['byYear'] for h in trade['byHeading']}


def ct(name, year=None):
    c = CTRY[name]
    return c['byYear'].get(str(year or LY), 0)


def hd(h, year=None):
    return HEAD[h].get(str(year or LY), 0)


SWISS = ct('Switzerland')
SWISS_SHARE = SWISS / T25 * 100
HC = {}
for r in trade['byHeadingCountry']:
    HC[(r['country'], r['heading'])] = r['importsUsd']
HS6 = {h['hs6']: h for h in trade['byHs6']}
WATCH_SHARE = (hd('9101') + hd('9102')) / T25 * 100

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/91-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

NEW_SOURCES = {
    'hts-ch91': {
        'id': 'hts-ch91',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 91',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 91: Clocks and Watches and Parts Thereof — '
        'chapter notes, additional U.S. notes 1–5 (special marking, insular possessions) and statistical note 1 (component reporting)',
        'signed': None,
        'published': '2026-10-07',
        'url': CH91_PDF,
    },
    'cbp-n362026': {
        'id': 'cbp-n362026',
        'publisher': 'CBP (CROSS)',
        'citation': 'NY N362026',
        'document': 'CBP classification ruling',
        'title': 'The tariff classification of four automatic analog wrist watches from Switzerland — 9102.21.70 and 9102.21.90, '
        'movement ($1.53 each), case (4.2%) and strap (9.8% or 2%) reported under statistical note 1',
        'signed': None,
        'published': '2026-06-16',
        'url': 'https://rulings.cbp.gov/ruling/N362026',
    },
    'cbp-n364461': {
        'id': 'cbp-n364461',
        'publisher': 'CBP (CROSS)',
        'citation': 'NY N364461',
        'document': 'CBP country-of-origin ruling',
        'title': 'The country of origin and marking of an automatic wristwatch from Japan — origin is where the movement is assembled; a strap '
        'of another origin is marked separately',
        'signed': None,
        'published': '2026-09-16',
        'url': 'https://rulings.cbp.gov/ruling/N364461',
    },
    'cbp-h326900': {
        'id': 'cbp-h326900',
        'publisher': 'CBP (CROSS)',
        'citation': 'HQ H326900',
        'document': 'CBP protest decision',
        'title': 'Valuation of imported watch components under statistical note 1, Chapter 91 — importer\'s apportionment rejected, CBP '
        'reapportionment upheld',
        'signed': None,
        'published': '2025-10-09',
        'url': 'https://rulings.cbp.gov/ruling/H326900',
    },
    'cbp-n351984': {
        'id': 'cbp-n351984',
        'publisher': 'CBP (CROSS)',
        'citation': 'NY N351984',
        'document': 'CBP country-of-origin ruling',
        'title': 'The country of origin of watches from the Philippines — a watch is of the country where its movement is assembled',
        'signed': None,
        'published': '2025-08-13',
        'url': 'https://rulings.cbp.gov/ruling/N351984',
    },
    'cbp-n349122': {
        'id': 'cbp-n349122',
        'publisher': 'CBP (CROSS)',
        'citation': 'NY N349122',
        'document': 'CBP classification ruling',
        'title': 'The tariff classification of smart watches from China — 8517.62.0090 (not Chapter 91)',
        'signed': None,
        'published': '2025-05-29',
        'url': 'https://rulings.cbp.gov/ruling/N349122',
    },
    'fr-2015-05313': {
        'id': 'fr-2015-05313',
        'publisher': 'Federal Register',
        'citation': '80 FR 12802',
        'document': 'Notice (Commerce ITA and Interior)',
        'title': 'Allocation of Duty-Exemptions for Calendar Year 2015 for Watch Producers Located in the United States Virgin Islands',
        'signed': None,
        'published': '2015-03-11',
        'url': 'https://www.federalregister.gov/documents/2015/03/11/2015-05313/allocation-of-duty-exemptions-for-calendar-year-2015-for-watch-producers-located-in-the-united',
    },
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


for part in ('fill91_text.py', 'fill91_pages.py'):
    exec(compile(open(os.path.join(HERE, part)).read(), part, 'exec'))

d['asOf'] = TODAY
json.dump(d, open(OUT, 'w'), indent=2, ensure_ascii=False)
left = json.dumps(d).count('TODO')
print('wrote', OUT, 'TODO left:', left, '| lines', N_ALL)
