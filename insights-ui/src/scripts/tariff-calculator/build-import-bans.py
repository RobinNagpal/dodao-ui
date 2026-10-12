#!/usr/bin/env python3
"""Writes src/tariff-data/calculator/import-bans.json from the import-ban data in measures_country_actions.py (issue #1796).

    python3 src/scripts/tariff-calculator/build-import-bans.py

One source of truth: the ban lists live in measures_country_actions.py (CANADA_IMPORT_BANS / canada_import_bans());
this script only groups them into TariffImportBan records (src/types/tariff-calculator-measures.ts) for the calculator,
which reads the JSON bundled with the app. Bans are not duties, so they never go into measures.json / tariff_measures.
"""
import json
import os
import sys

sys.dont_write_bytecode = True  # importing the measures module must not leave __pycache__ in the repo
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from measures_country_actions import canada_import_bans  # noqa: E402

OUT = os.path.join(HERE, '..', '..', 'tariff-data', 'calculator', 'import-bans.json')
FACTS = os.path.join(HERE, '..', '..', 'tariff-data', 'calculator', 'confirmation-facts.json')

PACKAGED_FACT = 'packagedDirectToConsumer'
DESCRIPTIONS = {
    ('11061', 'all'): 'Certain alcoholic beverages that are products of Canada are excluded from importation into the United States (Proclamation 11061).',
    ('11061', 'packaged'): ('Certain alcoholic beverages that are products of Canada, packaged in bottles, cans, boxes, kegs or other similar '
                            'direct-to-consumption containers, are excluded from importation into the United States (Proclamation 11061). '
                            'Bulk goods under these provisions are not banned.'),
    ('11062', 'all'): 'Certain dairy-scope products of Canada are excluded from importation into the United States (Proclamation 11062).',
    ('11063', 'all'): 'Motorcycles over 800 cc that are products of Canada are excluded from importation into the United States (Proclamation 11063).',
}
IDS = {
    ('11061', 'all'): 'ca-338-11061-alcohol',
    ('11061', 'packaged'): 'ca-338-11061-alcohol-packaged',
    ('11062', 'all'): 'ca-338-11062-dairy',
    ('11063', 'all'): 'ca-338-11063-motorcycles',
}


def main():
    groups = {}
    for b in canada_import_bans():
        key = (b['proclamation'], b['scope'])
        g = groups.setdefault(key, {'id': IDS[key], 'countries': b['countries'], 'coveragePrefixes': [], 'effectiveFrom': b['effectiveFrom'],
                                    'description': DESCRIPTIONS[key], 'sources': b['sources']})
        if b['scope'] == 'packaged':
            g['conditions'] = {'factsTrue': [PACKAGED_FACT]}
        g['coveragePrefixes'].append(b['codePrefix'])
    bans = []
    for key in sorted(groups):
        g = groups[key]
        g['coveragePrefixes'] = sorted(set(g['coveragePrefixes']))
        bans.append({k: g[k] for k in ['id', 'countries', 'coveragePrefixes', 'effectiveFrom', 'conditions', 'description', 'sources'] if k in g})

    fact_ids = {f['id'] for f in json.load(open(FACTS))['facts']}
    for b in bans:
        for fid in b.get('conditions', {}).get('factsTrue', []):
            if fid not in fact_ids:
                sys.exit(f'{b["id"]}: fact "{fid}" is not in confirmation-facts.json')

    with open(OUT, 'w') as f:
        f.write(json.dumps({'bans': bans}, indent=2, ensure_ascii=False) + '\n')
    print(f'Wrote {os.path.relpath(OUT)}: {len(bans)} bans, {sum(len(b["coveragePrefixes"]) for b in bans)} prefixes')


if __name__ == '__main__':
    main()
