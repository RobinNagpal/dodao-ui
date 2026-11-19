#!/usr/bin/env python3
"""Re-sync every chapter's hand-written exports/tariff-updates.json with the shared export library.

Run this after the library (insights-ui/src/tariff-data/export-library/foreign-measures.json) gains measures,
events or source fixes, instead of regenerating chapters (regenerating wipes the written text). It never
touches written prose; it only does what the generator would do for library-owned fields:

- changes: one entry per library measure, in library order. Existing entries keep their text; `coversChapter`
  is refreshed from the library coverage map. New measures are copied in from the library.
  (A measure without coverage for a chapter stops the run: set it first with export-library-lib-edit.py.)
- cn-all: status refreshed and new source ids appended (China's all-goods extra tariff changes often).
- upcoming: entries present in the chapter get `whatHappens`, `status` and `sourceIds` from the library, keeping
  the chapter's own `impact`. Past dates are dropped. New library events are NOT added automatically, because
  each needs a chapter-specific `impact`; the run lists them so a writer can add them.
- sources: library sources that are now cited but missing are appended; sources whose URL matches a library
  source under a different id are renamed to the library id.
- stats: "Actions tracked", "Reach this chapter", "Coming up" (and chapter 30's custom label) recounted.

Usage (from anywhere):
  python3 -I docs/insights-ui/tasks/export-library-merge.py [--dry-run] [--chapter <slug-or-folder> ...]
Then run prettier on the files it lists, and `pnpm tariff:validate-chapters`.
"""
import datetime
import json
import os
import sys

# This file lives in docs/insights-ui/tasks/; the app is <repo>/insights-ui.
IU = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'insights-ui'))
EXP = os.path.join(IU, 'src/tariff-data/chapters/exports')
LIB = json.load(open(os.path.join(IU, 'src/tariff-data/export-library/foreign-measures.json'), encoding='utf-8'))
DRY = '--dry-run' in sys.argv
ONLY = [a for i, a in enumerate(sys.argv) if i > 0 and sys.argv[i - 1] == '--chapter']
TODAY = datetime.date.today().isoformat()

measures = LIB['measures']
lib_up = {u['id']: u for u in LIB['upcoming']}
lib_src = {s['id']: s for s in LIB['sources']}
lib_id_by_url = {s['url']: s['id'] for s in LIB['sources']}


def coverage(entry, n):
    return 'yes' if entry.get('allGoods') else entry.get('coverage', {}).get(n)


def rename_source_ids(t, old, new):
    for x in t['changes'] + t['upcoming'] + t['inEffect']:
        x['sourceIds'] = [new if s == old else s for s in x['sourceIds']]
        if x.get('effectiveSourceId') == old:
            x['effectiveSourceId'] = new


changed = []
for d in sorted(os.listdir(EXP)):
    path = os.path.join(EXP, d, 'tariff-updates.json')
    if not os.path.exists(path):
        continue
    t = json.load(open(path, encoding='utf-8'))
    if ONLY and d not in ONLY and t['chapter']['slug'] not in ONLY:
        continue
    n = str(t['chapter']['number'])
    log = []

    # Sources that duplicate a library document under another id -> use the library id.
    for s in list(t['sources']):
        lid = lib_id_by_url.get(s['url'])
        if lid and lid != s['id']:
            rename_source_ids(t, s['id'], lid)
            log.append(f'source {s["id"]} -> library id {lid}')
            s['id'] = lid
    seen = set()
    t['sources'] = [s for s in t['sources'] if not (s['id'] in seen or seen.add(s['id']))]

    # changes
    cur = {c['id']: c for c in t['changes']}
    new_changes = []
    for m in measures:
        cov = coverage(m, n)
        if cov is None:
            sys.exit(f'{d}: library measure {m["id"]} has no coverage["{n}"] -- set it with export-library-lib-edit.py first')
        if m['id'] in cur:
            c = cur[m['id']]
            if c['coversChapter'] != cov:
                log.append(f'coversChapter {m["id"]}: {c["coversChapter"]} -> {cov}')
                c['coversChapter'] = cov
        else:
            c = {k: m[k] for k in ('id', 'date', 'type', 'countries', 'title', 'before', 'now')}
            c.update(coversChapter=cov, status=m['status'], detail=m['detail'], sourceIds=list(m['sourceIds']))
            log.append(f'added change {m["id"]} ({cov})')
        if m['id'] == 'cn-all':
            if c['status'] != m['status']:
                c['status'] = m['status']
                log.append('cn-all status refreshed')
            for s in m['sourceIds']:
                if s not in c['sourceIds']:
                    c['sourceIds'].append(s)
                    log.append(f'cn-all +source {s}')
        new_changes.append(c)
    extra = [i for i in cur if i not in {m['id'] for m in measures}]
    if extra:
        log.append(f'WARNING: chapter lists changes not in the library (left out): {extra}')
    t['changes'] = new_changes

    # upcoming
    for u in t['upcoming']:
        L = lib_up.get(u['id'])
        if not L:
            continue  # chapter-specific event
        for k in ('whatHappens', 'status'):
            if u.get(k) != L[k]:
                u[k] = L[k]
                log.append(f'upcoming {u["id"]}: {k} refreshed')
        for s in L['sourceIds']:
            if s not in u['sourceIds']:
                u['sourceIds'].append(s)
                log.append(f'upcoming {u["id"]} +source {s}')
    before = len(t['upcoming'])
    t['upcoming'] = [u for u in t['upcoming'] if u['expectedOn'] >= TODAY]
    if len(t['upcoming']) != before:
        log.append(f'dropped {before - len(t["upcoming"])} past upcoming event(s): record the outcome in the library')
    t['upcoming'].sort(key=lambda u: u['expectedOn'])
    have_up = {u['id'] for u in t['upcoming']}
    for L in LIB['upcoming']:
        if L['id'] not in have_up and L['expectedOn'] >= TODAY and coverage(L, n) != 'no':
            log.append(f'TODO: library event {L["id"]} ({L["expectedOn"]}) is not on this page: add it with an impact '
                       f'line, or set its coverage["{n}"] to "no"')

    # sources
    have = {s['id'] for s in t['sources']}
    used = {i for x in t['changes'] + t['upcoming'] + t['inEffect'] for i in x['sourceIds']}
    for sid in sorted(used - have):
        if sid in lib_src:
            t['sources'].append(lib_src[sid])
            log.append(f'+source {sid}')
        else:
            log.append(f'WARNING: cited source {sid} is in neither the chapter nor the library')

    # stats
    reach = sum(1 for c in t['changes'] if c['coversChapter'] != 'no')
    skip = sum(1 for c in t['changes'] if c['type'] == 'retaliation' and c['coversChapter'] == 'no')
    counts = {
        'Actions tracked': len(t['changes']),
        'Reach this chapter': reach,
        'Coming up': len(t['upcoming']),
        'Retaliatory actions that skip Ch. 30': skip,  # chapter 30's custom label
    }
    for s in t['stats']:
        val = counts.get(s['label'])
        if val is not None and s['value'] != str(val):
            log.append(f'stat {s["label"]}: {s["value"]} -> {val}')
            s['value'] = str(val)

    if log:
        print(f'== {d}')
        for line in log:
            print('   ' + line)
        if not DRY:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(t, f, indent=2, ensure_ascii=False)
                f.write('\n')
            changed.append(path)

if changed:
    print('\nChanged files (run prettier on them from insights-ui/):')
    print('npx prettier --config .prettierrc --write ' + ' '.join(os.path.relpath(p, IU) for p in changed))
elif not DRY:
    print('All chapters already match the library.')
