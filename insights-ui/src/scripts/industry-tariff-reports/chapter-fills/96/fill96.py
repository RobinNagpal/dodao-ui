#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 96 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill96.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script (see run96.sh).
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
WT = IU
TODAY = '2026-10-13'
SHORT = 'Miscellaneous Manufactured Articles'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/96-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH96_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2096'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def ruling(n):
    return f'https://rulings.cbp.gov/ruling/{n}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


NEW_SOURCES = {
    'hts-ch96': {
        'id': 'hts-ch96',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 96',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 96: Miscellaneous Manufactured Articles '
        '(chapter notes and additional U.S. notes)',
        'signed': None,
        'published': '2026-10-07',
        'url': CH96_PDF,
    },
    'fr-2026-18496': {
        'id': 'fr-2026-18496',
        'publisher': 'Federal Register',
        'citation': '91 FR 57545',
        'document': 'Notice (Commerce, ITA)',
        'title': "Certain Cased Pencils From the People's Republic of China: Preliminary Results of Antidumping Duty Administrative Review; "
        '2024-2025',
        'signed': None,
        'published': '2026-09-10',
        'url': 'https://www.federalregister.gov/documents/2026/09/10/2026-18496/certain-cased-pencils-from-the-peoples-republic-of-china-preliminary-results-of-antidumping-duty',
    },
    'fr-2023-05169': {
        'id': 'fr-2023-05169',
        'publisher': 'Federal Register',
        'citation': '88 FR 15673',
        'document': 'Notice (Commerce, ITA)',
        'title': "Certain Cased Pencils From the People's Republic of China: Continuation of Antidumping Duty Order",
        'signed': None,
        'published': '2023-03-14',
        'url': 'https://www.federalregister.gov/documents/2023/03/14/2023-05169/certain-cased-pencils-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order',
    },
    'fr-2023-25290': {
        'id': 'fr-2023-25290',
        'publisher': 'Federal Register',
        'citation': '88 FR 78721',
        'document': 'Notice (Commerce, ITA)',
        'title': "Certain Cased Pencils From the People's Republic of China: Final Results of Antidumping Duty Administrative Review; "
        '2021-2022',
        'signed': None,
        'published': '2023-11-16',
        'url': 'https://www.federalregister.gov/documents/2023/11/16/2023-25290/certain-cased-pencils-from-the-peoples-republic-of-china-final-results-of-antidumping-duty',
    },
    'fr-2010-18787': {
        'id': 'fr-2010-18787',
        'publisher': 'Federal Register',
        'citation': '75 FR 44939',
        'document': 'Notice (Commerce, ITA)',
        'title': "Natural Bristle Paint Brushes and Brush Heads from the People's Republic of China: Final Results of Changed Circumstance "
        'Review (order revoked)',
        'signed': None,
        'published': '2010-07-30',
        'url': 'https://www.federalregister.gov/documents/2010/07/30/2010-18787/natural-bristle-paint-brushes-and-brush-heads-from-the-peoples-republic-of-china-final-results-of',
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


HERE = os.path.dirname(os.path.abspath(__file__))
for part in ('fill96_overview.py', 'fill96_updates.py', 'fill96_matrix.py', 'fill96_trade.py', 'fill96_eng.py', 'fill96_faq.py'):
    exec(compile(open(os.path.join(HERE, part)).read(), part, 'exec'))

json.dump(d, open(OUT, 'w'), indent=2, ensure_ascii=False)
left = json.dumps(d).count('TODO')
print('wrote', OUT, 'TODO left:', left)
