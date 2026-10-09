# Named-product exemptions (issue #1790, item 2): relief measures for the "following particular articles" passages of the
# Chapter 99 U.S. notes — 52(c) (all countries, 2026 Section 301), 52(j)(4)–(13)(ii) (one country each, 2026 Section 301)
# and 50(a)(iii) (Brazil Section 301). A subheading there is exempt only for the product the note describes, so every
# measure carries conditions.productDescriptionIds and applies only when the importer confirms the description.
#
# Data: src/tariff-data/calculator/note-product-descriptions.json, written by extract-ch99-note-coverage.ts (never edit it
# by hand). Its "passages" say, per note subdivision, the relief heading, the duty headings it lifts and the country.
#
# Call from build-measures.py (after rec / S / hts_note / ALL_S301_CODES are defined):
#
#     from measures_named_products import load_descriptions, named_product_measures
#     measures += named_product_measures(cov, load_descriptions(ROOT), rec=rec, S=S, hts_note=hts_note, all_s301_codes=ALL_S301_CODES)
#
# (build-measures.py runs as a script, so its own directory is on sys.path and the plain import works.)
#
#   named_product_measures(cov, descriptions_file, *, rec, S, hts_note, all_s301_codes, ch99_headings=None) -> list[dict]
#     cov               note-coverage.json "notes" (used to check each code is listed under its note subdivision)
#     descriptions_file the parsed note-product-descriptions.json (load_descriptions(ROOT))
#     rec               build-measures.py's record factory rec(**fields)
#     S                 build-measures.py's source lookup S(*source_ids) (uses 'ustr-301-fl' and 'ustr-301-br')
#     hts_note          build-measures.py's hts_note(n) source for a Chapter 99 U.S. note
#     all_s301_codes    the 2026 Section 301 country headings 9903.05.20–9903.05.84 (52(c) must lift exactly these)
#     ch99_headings     optional {code: heading} from ch99-headings.json; loaded from the same folder when omitted
#
# One measure per (note subdivision, subheading): coverage = that subheading, productDescriptionIds = the ids of the
# descriptions the note gives for it (one in Revision 21). Grouping per subheading keeps a confirmation for one
# product from exempting a different subheading of the same note.
import json
import os

DESCRIPTIONS_FILE = 'note-product-descriptions.json'
CH99_HEADINGS_FILE = 'ch99-headings.json'

# Per U.S. note: program name, effective date and source ids — the same values build-measures.py uses for the note's
# other measures (52: USTR forced-labor Section 301 action, 50: Brazil Section 301 action). The named-product passages
# were in the original notices (91 FR 47318 annex note 52(c), (j)(4)–(13)(ii); 91 FR 45516 annex note 50(a)(iii)).
NOTE_FAMILIES = {
    '52': {'program': 'Section 301 (2026, 60 economies)', 'keyPrefix': 's301-2026-named', 'effectiveFrom': '2026-07-24', 'sourceIds': ['ustr-301-fl']},
    '50': {'program': 'Section 301 (Brazil)', 'keyPrefix': 's301-brazil-named', 'effectiveFrom': '2026-07-22', 'sourceIds': ['ustr-301-br']},
}


def load_descriptions(root):
    """Read note-product-descriptions.json from the calculator data folder (ROOT in build-measures.py)."""
    with open(os.path.join(root, DESCRIPTIONS_FILE)) as f:
        return json.load(f)


def _load_ch99_headings(root):
    with open(os.path.join(root, CH99_HEADINGS_FILE)) as f:
        return {h['code']: h for h in json.load(f)['headings']}


def _dotted(code_prefix):
    return f'{code_prefix[:4]}.{code_prefix[4:6]}.{code_prefix[6:8]}' + (f'.{code_prefix[8:]}' if len(code_prefix) > 8 else '')


def _note_slug(note):
    return note.replace('(', '').replace(')', '')


def _covered_by(cov, note, code_prefix):
    """True when note-coverage.json lists the code under the note subdivision or one of its items."""
    return any(code_prefix in codes for key, codes in cov.items() if key == note or key.startswith(note + '('))


def named_product_measures(cov, descriptions_file, *, rec, S, hts_note, all_s301_codes, ch99_headings=None):
    if ch99_headings is None:
        ch99_headings = _load_ch99_headings(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tariff-data', 'calculator'))
    passages = descriptions_file['passages']
    by_note = {}
    for d in descriptions_file['descriptions']:
        by_note.setdefault(d['note'], []).append(d)

    measures = []
    for note in sorted(by_note, key=lambda n: [int(p) if p.isdigit() else p for p in n.replace(')', '(').split('(') if p]):
        family = NOTE_FAMILIES[note.split('(')[0]]
        p = passages[note]
        relief = p['reliefHeading']
        replaces = p['dutyHeadings']

        # Cross-checks against the other official-source files; a failure means the HTS changed — re-review the note.
        heading = ch99_headings.get(relief)
        assert heading and heading['rateKind'] == 'relief' and note in heading['noteRefs'], f'{note}: {relief} is not a relief heading citing the note in ch99-headings.json'
        countries = sorted(heading['countries'])
        if p['productOf'] is None:
            assert countries == [], f'{note}: passage applies to every country but {relief} lists {countries}'
            if note.startswith('52'):
                assert replaces == list(all_s301_codes), f'{note}: expected to lift 9903.05.20–9903.05.84, got {replaces[0]}–{replaces[-1]}'
        else:
            assert len(countries) == 1, f'{note}: expected one country for "{p["productOf"]}", got {countries}'
            for code in replaces:
                duty = ch99_headings.get(code)
                assert duty and sorted(duty['countries']) == countries, f'{note}: duty heading {code} is not for {countries}'

        by_code = {}
        for d in by_note[note]:
            assert _covered_by(cov, note, d['codePrefix']), f'{d["id"]}: {d["codePrefix"]} not listed under {note} in note-coverage.json'
            by_code.setdefault(d['codePrefix'], []).append(d)

        where = f'products of {p["productOf"]}' if p['productOf'] else 'products of any country'
        lifted = f'{replaces[0]}–{replaces[-1]}' if len(replaces) > 2 else ', '.join(replaces)
        for code_prefix, descs in sorted(by_code.items()):
            quoted = ' / '.join(f'"{d["description"]}"' for d in descs)
            measures.append(rec(
                measureKey=f'{family["keyPrefix"]}-{_note_slug(note)}-{code_prefix}',
                program=family['program'], ch99Code=relief, rateKind='relief',
                countriesInclude=countries, coverageInclude=[code_prefix],
                conditions={'productDescriptionIds': [d['id'] for d in descs]},
                replacesCodes=list(replaces), effectiveFrom=family['effectiveFrom'],
                sources=S(*family['sourceIds']) + [hts_note(int(note.split('(')[0]))],
                notes=f'U.S. note {note} ({relief}): {where} described as {quoted} (classifiable in subheading {_dotted(code_prefix)}) '
                      f'are exempt from {lifted}. Applies only when the importer confirms the product matches the description; '
                      'other goods of the subheading pay the duty.'))
    return measures
