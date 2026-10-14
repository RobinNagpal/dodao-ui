#!/usr/bin/env python3
"""Fill the writer TODOs of the generated Chapter 97 content file (re-runnable).

Usage: python3 fill97.py <generated.json> <out.json>
Input is the untouched output of `pnpm tariff:generate-chapter --chapter 97 ...` (gen.json); the data parts
(rate table, matrix totals, trade figures, line statuses) are kept as generated. Trade-dependent sentences are
computed from the generated understandIndustry block, so a regenerated trade file updates them.
"""
import json
import sys

HERE = '/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch97'
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
pool = json.load(open(f'{HERE}/pool.json'))

TODAY = '2026-10-13'
ECFR_DATE = '2026-10-08'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH97 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2097'
CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
E19 = 'https://www.ecfr.gov/current/title-19/'
E50 = 'https://www.ecfr.gov/current/title-50/'
STATE_CP = 'https://www.state.gov/current-agreements-and-import-restrictions/'
CBP_ICP = 'https://www.cbp.gov/document/publications/works-art-collectors-pieces-antiques-and-other-cultural-property'
USC = {
    '19-2601': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap14-sec2601.htm',
    '19-2603': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap14-sec2603.htm',
    '19-2604': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap14-sec2604.htm',
    '19-2606': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap14-sec2606.htm',
    '19-2607': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap14-sec2607.htm',
    '19-2091': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap11-sec2091.htm',
    '16-1539': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap35-sec1539.htm',
    '22-2459': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title22/html/USCODE-2024-title22-chap33-sec2459.htm',
}


def frsrc(id_, citation, document, title, published, url, signed=None):
    return {'id': id_, 'publisher': 'Federal Register', 'citation': citation, 'document': document, 'title': title,
            'signed': signed, 'published': published, 'url': url}


def other(id_, publisher, citation, document, title, published, url):
    return {'id': id_, 'publisher': publisher, 'citation': citation, 'document': document, 'title': title,
            'signed': None, 'published': published, 'url': url}


NEW_SOURCES = [
    frsrc('fr-E8-9343', '73 FR 23334', 'Final rule (CBP Dec. 08-17)', 'Import Restrictions Imposed on Archaeological and Ethnological Material of Iraq',
          '2008-04-30', 'https://www.federalregister.gov/documents/2008/04/30/E8-9343/import-restrictions-imposed-on-archaeological-and-ethnological-material-of-iraq'),
    frsrc('fr-2016-19491', '81 FR 53916', 'Final rule (CBP Dec. 16-10)', 'Import Restrictions Imposed on Archaeological and Ethnological Material of Syria',
          '2016-08-15', 'https://www.federalregister.gov/documents/2016/08/15/2016-19491/import-restrictions-imposed-on-archaeological-and-ethnological-material-of-syria'),
    frsrc('fr-2024-00394', '89 FR 1808', 'Final rule (CBP Dec. 24-01)', 'Extension of Import Restrictions Imposed on Certain Archaeological Material From China',
          '2024-01-11', 'https://www.federalregister.gov/documents/2024/01/11/2024-00394/extension-of-import-restrictions-imposed-on-certain-archaeological-material-from-china'),
    frsrc('fr-2024-20385', '89 FR 73280', 'Final rule (CBP Dec. 24-16)', 'Emergency Import Restrictions Imposed on Categories of Archaeological and Ethnological Material of Ukraine',
          '2024-09-10', 'https://www.federalregister.gov/documents/2024/09/10/2024-20385/emergency-import-restrictions-imposed-on-categories-of-archaeological-and-ethnological-material-of'),
    frsrc('fr-2025-08615', '90 FR 20384', 'Final rule (CBP Dec. 25-05)', 'Emergency Import Restrictions on Categories of Archaeological and Ethnological Material of Lebanon',
          '2025-05-14', 'https://www.federalregister.gov/documents/2025/05/14/2025-08615/emergency-import-restrictions-on-categories-of-archaeological-and-ethnological-material-of-lebanon'),
    frsrc('fr-2025-14114', '90 FR 35397', 'Final rule (CBP Dec. 25-09)', 'Imposition of Import Restrictions on Archaeological and Ethnological Material of India',
          '2025-07-28', 'https://www.federalregister.gov/documents/2025/07/28/2025-14114/imposition-of-import-restrictions-on-archaeological-and-ethnological-material-of-india'),
    frsrc('fr-2026-00538', '91 FR 1387', 'Final rule (CBP Dec. 26-01)', 'Extension of Import Restrictions Imposed on Categories of Archaeological Material of Italy',
          '2026-01-14', 'https://www.federalregister.gov/documents/2026/01/14/2026-00538/extension-of-import-restrictions-imposed-on-categories-of-archaeological-material-of-italy'),
    frsrc('fr-2026-08223', '91 FR 22713', 'Final rule (CBP Dec. 26-09)', 'Extension of Emergency Import Restrictions Imposed on Archaeological and Ethnological Material of Afghanistan',
          '2026-04-28', 'https://www.federalregister.gov/documents/2026/04/28/2026-08223/extension-of-emergency-import-restrictions-imposed-on-archaeological-and-ethnological-material-of'),
    frsrc('fr-2026-09575', '91 FR 26912', 'Final rule (CBP Dec. 26-06)', 'Extension of Import Restrictions Imposed on Categories of Archaeological and Ethnological Material of Türkiye',
          '2026-05-13', 'https://www.federalregister.gov/documents/2026/05/13/2026-09575/extension-of-import-restrictions-imposed-on-categories-of-archaeological-and-ethnological-material'),
    frsrc('fr-2026-16432', '91 FR 52005', 'Final rule (CBP Dec. 26-16)', 'Imposition of Import Restrictions on Categories of Archaeological and Ethnological Material of Nepal',
          '2026-08-12', 'https://www.federalregister.gov/documents/2026/08/12/2026-16432/imposition-of-import-restrictions-on-categories-of-archaeological-and-ethnological-material-of-nepal'),
    frsrc('fr-2026-19533', '91 FR 60692', 'Notice (State Department)',
          'Meeting of the Cultural Property Advisory Committee; Proposals To Extend Bilateral Cultural Property Agreements With Cyprus, Guatemala, and Peru',
          '2026-09-24', 'https://www.federalregister.gov/documents/2026/09/24/2026-19533/meeting-of-the-cultural-property-advisory-committee-proposals-to-extend-bilateral-cultural-property'),
    frsrc('fr-2026-15530', '91 FR 48398', 'Notice (CBP)', 'Customs User Fees To Be Adjusted for Inflation in Fiscal Year 2027', '2026-07-31',
          'https://www.federalregister.gov/documents/2026/07/31/2026-15530/customs-user-fees-to-be-adjusted-for-inflation-in-fiscal-year-2027'),
    frsrc('fr-2020-19419', '85 FR 54616', 'Notice (USTR)',
          "Notice of Product Exclusion Extensions: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",
          '2020-09-02', 'https://www.federalregister.gov/documents/2020/09/02/2020-19419/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology'),
    other('state-cpia', 'U.S. Department of State', 'State Department, Cultural Heritage Center', 'Web page',
          'Current Agreements and Import Restrictions (bilateral cultural property agreements and emergency actions)', '2026-10-13', STATE_CP),
    other('cbp-icp-art', 'CBP', 'CBP Informed Compliance Publication', 'Informed Compliance Publication',
          "Works of Art, Collector's Pieces, Antiques, and Other Cultural Property", '2020-06-01', CBP_ICP),
    other('usc-19-2601', 'GovInfo (U.S. Code)', '19 U.S.C. 2601 et seq.', 'United States Code',
          'Convention on Cultural Property Implementation Act: definitions', '2026-10-13', USC['19-2601']),
    other('usc-19-2606', 'GovInfo (U.S. Code)', '19 U.S.C. 2606', 'United States Code',
          'Convention on Cultural Property Implementation Act: import restrictions on designated material', '2026-10-13', USC['19-2606']),
    other('usc-16-1539', 'GovInfo (U.S. Code)', '16 U.S.C. 1539(h)', 'United States Code',
          'Endangered Species Act, section 10(h): exceptions for antique articles at least 100 years old', '2026-10-13', USC['16-1539']),
    other('hts-ch97', 'USITC', 'HTSUS 2026 Revision 21, Chapter 97', 'Harmonized Tariff Schedule',
          'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 97', '2026-10-07', CH97),
    other('hts-ch98-r21', 'USITC', 'HTSUS 2026 Revision 21, Chapter 98', 'Harmonized Tariff Schedule',
          'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98', '2026-10-07', CH98),
]
POOL_IDS = ['eo-14193', 'eo-14194', 'eo-14195', 'eo-14228', 'eo-14231', 'eo-14232', 'eo-14257', 'eo-14259', 'eo-14266', 'eo-14298',
            'eo-14323', 'eo-14325', 'eo-14326', 'eo-14329', 'eo-14345', 'eo-14357', 'eo-14389', 'eo-14324', 'eo-14388', 'fr-2026-12670',
            'csms-67834313', 'csms-67844987', 'scotus-24-1287', 'procl-11012', 'ustr-usmca-review', 'procl-11046', 'procl-11047',
            'procl-11048', 'procl-11056', 'procl-11064', 'procl-11065', 'csms-69606660', 'csms-69851916', 'hts-2025r22-ch99',
            'csms-69302472', 'csms-69326983', 'cbp-ieepa-faq', 'usc-50-1702', 'fr-2016-13173', 'fr-2025-23316', 'procl-10420',
            'procl-10523', 'pl-117-110']
for sid in POOL_IDS:
    NEW_SOURCES.append(pool[sid])
SRC = {s['id']: s for s in NEW_SOURCES}


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(SRC[sid])
            have.add(sid)


# ---------------------------------------------------------------------------------------------------------------------
# Trade helpers (computed from the generated understandIndustry block)
# ---------------------------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
if not ui.get('latestYear'):
    raise SystemExit('no trade data in the generated file: wait for src/tariff-data/trade/chapter-97.json and regenerate')
Y, PY = ui['latestYear'], ui['priorYear']


def money(v):
    if v >= 1e9:
        s = f'{v / 1e9:.2f}'.rstrip('0').rstrip('.')
        return f'${s}B'
    if v >= 1e6:
        return f'${v / 1e6:.0f}M' if v >= 1e8 else f'${v / 1e6:.1f}M'.replace('.0M', 'M')
    return f'${v / 1e3:.0f}K'


TOTAL = sum(c['importsUsd'] for c in ui['byCountry']) + ui['othersImportsUsd']
PTOTAL = sum(c['priorImportsUsd'] for c in ui['byCountry']) + ui['othersPriorImportsUsd']
CHG = (TOTAL / PTOTAL - 1) * 100 if PTOTAL else 0
BYC = {c['country']: c for c in ui['byCountry']}
BYL = {l['hs6']: l for l in ui['byLine']}
BYH = {}
for r in ui['byHeadingCountry']:
    BYH.setdefault(r['heading'], 0)
    BYH[r['heading']] += r['importsUsd']


def cty(name):
    c = BYC.get(name)
    return c['importsUsd'] if c else 0


def share(v):
    return f'{v / TOTAL * 100:.0f}%'


def hc(heading, country):
    for r in ui['byHeadingCountry']:
        if r['heading'] == heading and r['country'] == country:
            return r['importsUsd']
    return 0


def pct(x):
    return f'{x:+.1f}%'.replace('+', 'up ').replace('-', 'down ')


exec(open(f'{HERE}/fill97_text.py').read())

json.dump(d, open(out, 'w'), ensure_ascii=False, indent=2)
print('wrote', out)
