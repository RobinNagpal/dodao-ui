#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 71 content file after `pnpm tariff:generate-chapter`.

Usage: python3 fill71.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script (see run71.sh).
"""
import glob
import json
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if '/71-' in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

CH71_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2071'
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
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round((a / b - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW_SOURCES = {
    'hts-ch71': {
        'id': 'hts-ch71',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 71',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 71: Natural or Cultured Pearls, Precious or '
        'Semiprecious Stones, Precious Metals, Metals Clad With Precious Metal, and Articles Thereof; Imitation Jewelry; Coin',
        'signed': None,
        'published': '2026-10-07',
        'url': CH71_PDF,
    },
    'hts-2026-basic-cr': {
        'id': 'hts-2026-basic-cr',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Basic Edition, Change Record',
        'document': 'Change Record',
        'title': 'Harmonized Tariff Schedule of the United States (2026) Change Record — 7113.19.5090 discontinued, 7113.19.5091 and '
        '7113.19.5095 established July 1, 2025 (2025 Revision 16)',
        'signed': None,
        'published': '2025-12-17',
        'url': 'https://hts.usitc.gov/reststop/file?release=2026HTSBasic&filename=Change%20Record',
    },
    'hts-2026-rev11-cr': {
        'id': 'hts-2026-rev11-cr',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 11, Change Record',
        'document': 'Change Record',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 11) Change Record — 7113.19.2900 annotated into '
        '7113.19.2910 and 7113.19.2990, effective July 1, 2026',
        'signed': None,
        'published': '2026-06-22',
        'url': 'https://hts.usitc.gov/reststop/file?release=2026HTSRev11&filename=Change%20Record',
    },
    'ofac-ru-diamonds': {
        'id': 'ofac-ru-diamonds',
        'publisher': 'Federal Register',
        'citation': '89 FR 16450',
        'document': 'OFAC determinations under E.O. 14068 (published)',
        'title': 'Publication of Russian Harmful Foreign Activities Sanctions Regulations Determinations — import bans on Russian-mined '
        'non-industrial diamonds of 1.0 carat or more (from March 1, 2024) and 0.5 carat or more (from September 1, 2024) even when cut '
        'elsewhere, and on diamond jewelry and unsorted diamonds of Russian origin or exported from Russia (from March 1, 2024)',
        'signed': '2024-02-08',
        'published': '2024-03-07',
        'url': 'https://www.federalregister.gov/documents/2024/03/07/2024-04855/publication-of-russian-harmful-foreign-activities-sanctions-regulations-determinations',
    },
    'ofac-ru-gold': {
        'id': 'ofac-ru-gold',
        'publisher': 'Federal Register',
        'citation': '89 FR 78245',
        'document': 'OFAC determinations under E.O. 14068 (published)',
        'title': 'Publication of Russian Harmful Foreign Activities Sanctions Regulations Determinations — import ban on gold of Russian '
        'Federation origin, effective June 28, 2022 (amended determination of December 22, 2023)',
        'signed': '2023-12-22',
        'published': '2024-09-25',
        'url': 'https://www.federalregister.gov/documents/2024/09/25/2024-21798/publication-of-russian-harmful-foreign-activities-sanctions-regulations-determinations',
    },
    'ofac-gl104a': {
        'id': 'ofac-gl104a',
        'publisher': 'Federal Register',
        'citation': '90 FR 47230',
        'document': 'OFAC general license (published)',
        'title': 'Publication of Russian Harmful Foreign Activities Sanctions Regulations Web General License 104A (diamonds outside Russia '
        'before the cut-off dates, through September 1, 2026)',
        'signed': '2025-08-27',
        'published': '2025-10-01',
        'url': 'https://www.federalregister.gov/documents/2025/10/01/2025-19124/publication-of-russian-harmful-foreign-activities-sanctions-regulations-web-general-license-104a',
    },
    'ofac-gl104b': {
        'id': 'ofac-gl104b',
        'publisher': 'U.S. Treasury (OFAC)',
        'citation': 'Russia-related General License 104B',
        'document': 'OFAC general license',
        'title': 'Authorizing Transactions Related to Imports of Certain Diamonds Prohibited by Executive Order 14068 — through 12:01 a.m. EDT, '
        'September 1, 2027',
        'signed': '2026-08-26',
        'published': '2026-08-26',
        'url': 'https://ofac.treasury.gov/media/936796/download?inline',
    },
    'state-kp-2025': {
        'id': 'state-kp-2025',
        'publisher': 'Federal Register',
        'citation': '90 FR 11454',
        'document': 'Notice (Department of State, Public Notice 12677)',
        'title': 'List of Participating Countries and Entities in the Kimberley Process Certification Scheme, Known as "Participants" for the '
        'Purposes of the Clean Diamond Trade Act of 2003',
        'signed': None,
        'published': '2025-03-06',
        'url': 'https://www.federalregister.gov/documents/2025/03/06/2025-03623/list-of-participating-countries-and-entities-in-the-kimberley-process-certification-scheme-known-as',
    },
    'usc-3903': {
        'id': 'usc-3903',
        'publisher': 'U.S. Code (GovInfo)',
        'citation': '19 U.S.C. 3903',
        'document': 'United States Code, 2024 edition',
        'title': 'Clean Diamond Trade Act — the President shall prohibit the importation of any rough diamond, from whatever source, that has '
        'not been controlled through the Kimberley Process Certification Scheme',
        'signed': None,
        'published': '2024-12-31',
        'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap25-sec3903.htm',
    },
    'cbp-n351466': {
        'id': 'cbp-n351466',
        'publisher': 'CBP (CROSS)',
        'citation': 'NY N351466',
        'document': 'CBP classification ruling',
        'title': 'The tariff classification of cast gold bars from Switzerland — 1-kilogram and 100-ounce bars in 7108.13.5500, subject to '
        'the reciprocal tariff (9903.01.25)',
        'signed': None,
        'published': '2025-07-31',
        'url': 'https://rulings.cbp.gov/ruling/N351466',
    },
    'cbp-n357226': {
        'id': 'cbp-n357226',
        'publisher': 'CBP (CROSS)',
        'citation': 'NY N357226',
        'document': 'CBP classification ruling',
        'title': 'The tariff classification of silver bars from Canada, Switzerland, and the United Kingdom — cast and stamped .999 silver '
        'bars in 7106.92.1000',
        'signed': None,
        'published': '2026-01-15',
        'url': 'https://rulings.cbp.gov/ruling/N357226',
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


import os
HERE = os.path.dirname(os.path.abspath(__file__))
for part in ('fill71_body.py', 'fill71_overview.py', 'fill71_updates.py', 'fill71_matrix.py', 'fill71_trade.py', 'fill71_eng.py', 'fill71_faq.py'):
    exec(compile(open(os.path.join(HERE, part)).read(), part, 'exec'))

json.dump(d, open(OUT, 'w'), indent=2, ensure_ascii=False)
left = json.dumps(d).count('TODO')
print('wrote', OUT, 'TODO left:', left)
