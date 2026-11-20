#!/usr/bin/env python3
"""Locked, formatting-safe edits to the shared export library (used by parallel chapter agents).

Run from anywhere:
  python3 lib-edit.py set-coverage <chapter> <measureId>=<yes|partly|no> [...]
      Sets coverage["<chapter>"] on a measure or an upcoming event in foreign-measures.json (only that key).
      An upcoming event with coverage "no" is left off that chapter's "What's coming" by the generator.
  python3 lib-edit.py add-market <path-to-market-entry.json>
      Appends one market object to markets.json if no market with that name exists yet.
  python3 lib-edit.py add-measure <path-to-entry.json>
      Adds new foreign measures / upcoming events / sources to foreign-measures.json, skipping existing ids.
      Entry: {"measures": [...], "upcoming": [...], "sources": [...]} (each key optional).
  python3 lib-edit.py show-coverage <chapter>
      Prints every measure id with its coverage for that chapter (or allGoods / MISSING).

Every write holds an exclusive lock, re-reads the file, edits, writes, and runs the repo's prettier on it.
"""
import fcntl
import json
import os
import subprocess
import sys

# This file lives in docs/insights-ui/tasks/; the app is <repo>/insights-ui.
IU = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'insights-ui'))
LIB = os.path.join(IU, 'src/tariff-data/export-library')
LOCK = os.path.join(IU, '.export-lib-edit.lock')  # gitignored; shared by every session in this checkout


def locked(fn):
    with open(LOCK, 'w') as lk:
        fcntl.flock(lk, fcntl.LOCK_EX)
        try:
            return fn()
        finally:
            fcntl.flock(lk, fcntl.LOCK_UN)


def load(name):
    with open(os.path.join(LIB, name), encoding='utf-8') as f:
        return json.load(f)


def save(name, data):
    path = os.path.join(LIB, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    subprocess.run(['npx', 'prettier', '--config', '.prettierrc', '--write', path], cwd=IU, check=True, capture_output=True)


def set_coverage(chapter, pairs):
    def run():
        d = load('foreign-measures.json')
        # Measures and upcoming events share one id space; both carry a coverage map.
        by_id = {m['id']: m for m in d['measures'] + d['upcoming']}
        for p in pairs:
            mid, val = p.split('=', 1)
            if val not in ('yes', 'partly', 'no'):
                sys.exit(f'bad value {val!r} for {mid}')
            if mid not in by_id:
                sys.exit(f'unknown measure id {mid!r}')
            by_id[mid].setdefault('coverage', {})[chapter] = val
        save('foreign-measures.json', d)
        print(f'set coverage["{chapter}"] for {len(pairs)} measure(s)')

    locked(run)


def add_market(entry_path):
    with open(entry_path, encoding='utf-8') as f:
        entry = json.load(f)

    def run():
        d = load('markets.json')
        if any(m['name'] == entry['name'] for m in d['markets']):
            print(f'market {entry["name"]!r} already exists; not added')
            return
        d['markets'].append(entry)
        save('markets.json', d)
        print(f'added market {entry["name"]!r}')

    locked(run)


def add_measure(entry_path):
    """Entry file: {"measures": [...], "upcoming": [...], "sources": [...]} (each key optional).

    New measures are inserted newest-first by `date`, new upcoming events soonest-first by `expectedOn`,
    new sources appended. Anything whose `id` already exists is skipped (never overwritten).
    """
    with open(entry_path, encoding='utf-8') as f:
        entry = json.load(f)

    def run():
        d = load('foreign-measures.json')
        for key, sort_key, reverse in (('measures', 'date', True), ('upcoming', 'expectedOn', False), ('sources', None, False)):
            have = {x['id'] for x in d[key]}
            for item in entry.get(key, []):
                if item['id'] in have:
                    print(f'{key}: {item["id"]!r} already exists; skipped')
                    continue
                d[key].append(item)
                have.add(item['id'])
                print(f'{key}: added {item["id"]!r}')
            if sort_key:
                d[key].sort(key=lambda x: x[sort_key], reverse=reverse)
        save('foreign-measures.json', d)

    locked(run)


def show_coverage(chapter):
    d = load('foreign-measures.json')
    for m in d['measures']:
        v = 'allGoods' if m.get('allGoods') else m.get('coverage', {}).get(chapter, 'MISSING')
        print(f'{m["id"]:24} {v:9} inForce={m["inForce"]}  {m["title"][:80]}')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    cmd = sys.argv[1]
    if cmd == 'set-coverage':
        set_coverage(sys.argv[2], sys.argv[3:])
    elif cmd == 'add-market':
        add_market(sys.argv[2])
    elif cmd == 'add-measure':
        add_measure(sys.argv[2])
    elif cmd == 'show-coverage':
        show_coverage(sys.argv[2])
    else:
        sys.exit(__doc__)
