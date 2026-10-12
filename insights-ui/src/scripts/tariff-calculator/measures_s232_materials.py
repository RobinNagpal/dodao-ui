# Section 232 materials programs (issue #1796): steel / aluminum / copper and their derivatives (U.S. note 16), timber,
# lumber and wood products (note 37), semiconductors (note 39), unmanned aircraft systems (note 43), plus the Section 201
# safeguard on quartz surface products (note 41). Vehicles (notes 33 / 38) and the country actions live elsewhere.
#
# Call from build-measures.py (after rec / S / hts_note / cov are defined):
#
#     from measures_s232_materials import s232_materials_measures
#     program_cov = json.load(open(ROOT + 'program-coverage.json'))['notes']
#     measures += s232_materials_measures(cov, program_cov, rec=rec, S=S, hts_note=hts_note)
#
#   s232_materials_measures(cov, program_cov, *, rec, S, hts_note, ch99_headings=None) -> list[dict]
#     cov            note-coverage.json "notes" (note 19 subdivisions: the Russia aluminum coverage of 9903.85.67 / .68)
#     program_cov    program-coverage.json "notes" (notes 16, 37, 39, 41, 43 — reads run-together headings correctly)
#     rec / S / hts_note  build-measures.py's record factory, source lookup and Chapter 99 note source
#     ch99_headings  optional {code: heading} from ch99-headings.json; loaded from the data folder when omitted
#
# Every measure that depends on a fact the HTS line cannot tell (e.g. "≥85% of the metal was melted in the U.S.") uses
# conditions.factsTrue / factsFalse with ids registered in src/tariff-data/calculator/confirmation-facts.json.
#
# Metals since April 6, 2026 (Proclamation 11021): every 9903.82 duty is charged on the FULL customs value, regardless of
# metal content (note 16(c)) — no contentBasis. The one content basis left is note 16(j) / 9903.82.20 (USMCA mobile
# industrial equipment: non-U.S. content plus U.S. content above 40% of the value).
import json
import os

CH99_HEADINGS_FILE = 'ch99-headings.json'
REVIEWED = '2026-10-11'

EU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT',
      'RO', 'SK', 'SI', 'ES', 'SE']
GN3B = ['BY', 'CU', 'KP', 'RU']  # general note 3(b): column 2 countries (Belarus, Cuba, North Korea, Russia)
ALL_S301_CODES = [f'9903.05.{n:02d}' for n in range(20, 85)]
REPL_301 = ALL_S301_CODES + ['9903.05.01']  # notes 52(f) and 50(a)(vi): goods under these 232 headings pay neither

SRC = {
    'procl-11021': {'citation': '91 FR 18201 (Proclamation 11021 of April 2, 2026: Strengthening Actions Taken To Adjust Imports of Aluminum, Steel, and Copper — full-value duties from April 6, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states', 'published': '2026-04-09'},
    'bis-11021-corr': {'citation': '91 FR 23056 (Commerce: technical corrections to Proclamation 11021 Annex IV — heading 9903.82.01; Tata Steel UK clarification)',
                       'url': 'https://www.federalregister.gov/documents/2026/04/29/2026-08297/notice-of-technical-corrections-to-the-harmonized-tariff-schedule-of-the-united-states-for-duties', 'published': '2026-04-29'},
    'procl-11032': {'citation': '91 FR 34085 (Proclamation 11032 of June 1, 2026: Further Adjusting the Tariff Regimes for Imports of Aluminum, Steel, and Copper — from June 8, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/06/04/2026-11314/further-adjusting-the-tariff-regimes-for-imports-of-aluminum-steel-and-copper-into-the-united-states', 'published': '2026-06-04'},
    'procl-10522': {'citation': '88 FR 13267 (Proclamation 10522: Adjusting Imports of Aluminum — 200% on Russian aluminum and derivatives)',
                    'url': 'https://www.federalregister.gov/documents/2023/03/02/2023-04470/adjusting-imports-of-aluminum-into-the-united-states', 'published': '2023-03-02'},
    'procl-10976': {'citation': '90 FR 48127 (Proclamation 10976 of September 29, 2025: Adjusting Imports of Timber, Lumber, and Their Derivative Products)',
                    'url': 'https://www.federalregister.gov/documents/2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states', 'published': '2025-10-06'},
    'procl-11000': {'citation': '91 FR 1039 (Proclamation 11000 of December 31, 2025: the 30% / 50% wood steps moved to January 1, 2027)',
                    'url': 'https://www.federalregister.gov/documents/2026/01/09/2026-00327/amendments-to-adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united', 'published': '2026-01-09'},
    'ita-korea': {'citation': '90 FR 55964 (Commerce/USTR: implementing the U.S.-Korea Strategic Trade and Investment Deal — Korean wood products 15% from November 14, 2025)',
                  'url': 'https://www.federalregister.gov/documents/2025/12/04/2025-21940/implementing-certain-tariff-related-elements-of-the-us-korea-strategic-trade-and-investment-deal', 'published': '2025-12-04'},
    'ita-taiwan': {'citation': '91 FR 31818 (Commerce/USTR: implementing the AIT-TECRO MOU — Taiwanese wood products 15% from May 1, 2026)',
                   'url': 'https://www.federalregister.gov/documents/2026/05/28/2026-10571/implementing-certain-tariff-related-elements-of-a-trade-and-security-agreement-between-the-american', 'published': '2026-05-28'},
    'procl-11002': {'citation': '91 FR 2443 (Proclamation 11002 of January 14, 2026: Adjusting Imports of Semiconductors — 25% from January 15, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/01/20/2026-01052/adjusting-imports-of-semiconductors-semiconductor-manufacturing-equipment-and-their-derivative', 'published': '2026-01-20'},
    'procl-11055': {'citation': '91 FR 53699 (Proclamation 11055 of August 13, 2026: Adjusting Imports of Unmanned Aircraft Systems and Components — from September 3, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/08/19/2026-16979/adjusting-imports-of-unmanned-aircraft-systems-and-unmanned-aircraft-systems-components-into-the', 'published': '2026-08-19'},
    'procl-11051': {'citation': '91 FR 50645 (Proclamation 11051 of July 31, 2026: safeguard on quartz surface products, August 15, 2026 – August 14, 2030)',
                    'url': 'https://www.federalregister.gov/documents/2026/08/05/2026-15975/to-facilitate-positive-adjustment-to-competition-from-imports-of-quartz-surface-products', 'published': '2026-08-05'},
}


def _src(*ids, S=None):
    return [SRC[i] if i in SRC else S(i)[0] for i in ids]


# Note 16(c) list entries that entered a list on June 8, 2026 (Proclamation 11032, Annex IV: HTS 2026 Revision 10) —
# found by comparing the lists of Chapter 99 Revision 9 (Proclamation 11021 lists, April 6 – June 7) with Revision 21
# (identical to Revision 10). Every other Revision 21 entry has been on its list since April 6, 2026.
ADDED_0608 = {
    '16(c)(vi)': ['37013000'],
    '16(c)(vii)': ['9403200075', '9403200082', '9403999040'],
    '16(c)(ix)': ['8415908010', '8415908020', '8415908045', '8415908085', '8708292130'],
    '16(c)(x)': ['84079010', '84151060', '84151090', '84158101', '84158201', '84159080', '84198150', '84321000', '84329000', '84332000', '84335100',
                 '84335900', '84339050', '84798955', '84798965', '85162900', '87013010', '87019110', '87019210', '87019310', '87019410', '87019510',
                 '87032101', '87060030', '8708292120', '87084030', '87084060', '87089210', '87089260', '87089315', '87089330', '87089923', '87168010',
                 '87169010'],
    '16(c)(xi)': ['84271040', '84271080', '84272040', '84272080', '84279000', '84291100', '84291900', '84292000', '84293000', '84294000', '84295110',
                  '84295150', '84295210', '84295250', '84295910', '84295950', '84312000', '84314200', '84314990', '87011001', '87013050', '87019150',
                  '87019250', '87019350', '87019450', '87019550', '87051000', '87052000'],
}
# Entries of the Revision 9 lists (vi) / (vii) (25%, heading 9903.82.09) that left them on June 8, 2026 — HVAC and
# agricultural / industrial / mobile equipment moved to (ix)–(xi), and 8708.29.21 split into 8708.29.2120 / .2130.
LEFT_0608 = {
    '16(c)(vi)': ['8415908010', '8415908020', '8415908045', '8415908085', '87082921'],
    '16(c)(vii)': ['84079010', '84151060', '84151090', '84158101', '84158201', '84159080', '84198150', '84271040', '84271080', '84272040', '84272080',
                   '84279000', '84291100', '84291900', '84292000', '84293000', '84294000', '84295110', '84295150', '84295210', '84295250', '84295910',
                   '84295950', '84312000', '84314200', '84314990', '84321000', '84329000', '84332000', '84335100', '84335900', '84339050', '84798955',
                   '84798965', '85162900', '87011001', '87013010', '87013050', '87019110', '87019150', '87019210', '87019250', '87019310', '87019350',
                   '87019410', '87019450', '87019510', '87019550', '87032101', '87051000', '87052000', '87060030', '87082921', '87084030', '87084060',
                   '87089210', '87089260', '87089315', '87089330', '87089923', '87168010', '87169010'],
}

APR6, JUN8, END_2027 = '2026-04-06', '2026-06-08', '2027-12-31'

# Quartz safeguard (note 41(c)): countries whose products are excluded. ISO 3166-1 alpha-2; Kosovo uses the
# user-assigned code XK.
QUARTZ_EXEMPT = sorted(set(
    ['CA', 'MX'] +
    ['AU', 'CO', 'CR', 'DO', 'SV', 'GT', 'HN', 'IL', 'NI', 'PA', 'PE', 'SG', 'KR'] +
    ['AF', 'AL', 'DZ', 'AO', 'AM', 'AZ', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BF', 'MM', 'BI', 'KH', 'CM', 'CV', 'CF', 'TD', 'KM', 'CG', 'CD',
     'CI', 'DJ', 'DM', 'EC', 'EG', 'ER', 'SZ', 'ET', 'FJ', 'GA', 'GM', 'GE', 'GH', 'GD', 'GN', 'GW', 'GY', 'HT', 'ID', 'IQ', 'JM', 'JO', 'KZ', 'KE',
     'KI', 'XK', 'KG', 'LB', 'LS', 'LR', 'MG', 'MW', 'MV', 'ML', 'MR', 'MU', 'MD', 'MN', 'ME', 'MZ', 'NA', 'NP', 'NE', 'NG', 'MK', 'PK', 'PG', 'PY',
     'PH', 'RW', 'LC', 'VC', 'WS', 'ST', 'SN', 'RS', 'SL', 'SB', 'SO', 'ZA', 'SS', 'LK', 'SR', 'TZ', 'TL', 'TG', 'TO', 'TN', 'TV', 'UG', 'UA', 'UZ',
     'VU', 'YE', 'ZM', 'ZW'] +
    ['AG', 'AW', 'BS', 'BB', 'BZ', 'VG', 'CW', 'DM', 'GD', 'GY', 'HT', 'JM', 'MS', 'KN', 'LC', 'VC', 'TT']))


def _load_ch99_headings():
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tariff-data', 'calculator')
    with open(os.path.join(root, CH99_HEADINGS_FILE)) as f:
        return {h['code']: h for h in json.load(f)['headings']}


def _covers(prefix, code):
    """True when `prefix` covers every line of `code` (code is the same or more specific)."""
    return code.startswith(prefix)


def _minus(codes, remove):
    """codes minus anything `remove` fully covers; returns (include, exclude) where exclude = the more specific `remove`
    codes inside an included code (so the measure skips just those lines)."""
    include = sorted({c for c in codes if not any(_covers(r, c) for r in remove)})
    exclude = sorted({r for r in remove for c in include if r != c and _covers(c, r)})
    return include, exclude


def _union(*lists):
    return sorted({c for lst in lists for c in lst})


def s232_materials_measures(cov, program_cov, *, rec, S, hts_note, ch99_headings=None):
    ch99 = ch99_headings if ch99_headings is not None else _load_ch99_headings()
    out = []

    def add(**kw):
        kw.setdefault('reviewedAt', REVIEWED)
        out.append(rec(**kw))

    def heading(code, kind, pct, countries=None):
        h = ch99.get(code)
        assert h, f'{code} missing from ch99-headings.json'
        assert h['rateKind'] == kind and h['ratePct'] == pct, f'{code}: heading is {h["rateKind"]} {h["ratePct"]}, expected {kind} {pct} — re-review'
        if countries is not None:
            assert sorted(h['countries']) == sorted(countries), f'{code}: heading countries {h["countries"]} != {sorted(countries)}'
        return h

    # ------------------------------------------------------------------ metals (note 16)
    P = 'Section 232 (steel, aluminum, copper)'
    L = {s: list(program_cov[f'16(c)({s})']) for s in ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi']}
    for k, v in ADDED_0608.items():
        assert set(v) <= set(program_cov[k]), f'{k}: June 8 additions not on the Revision 21 list — re-derive ADDED_0608'
    added = {s: set(ADDED_0608.get(f'16(c)({s})', [])) for s in L}

    def dated(subs):
        """[(effectiveFrom, codes)] for the union of the subdivisions: entries on their list since April 6, then June 8 additions."""
        early = _union(*[[c for c in L[s] if c not in added[s]] for s in subs])
        late = _union(*[[c for c in L[s] if c in added[s]] for s in subs])
        late = [c for c in late if c not in early]
        return [(d, c) for d, c in [(APR6, early), (JUN8, late)] if c]

    for code, kind, pct, ctry in [('9903.82.02', 'additive', 50, []), ('9903.82.04', 'additive', 25, ['GB']), ('9903.82.05', 'additive', 15, ['GB']),
                                  ('9903.82.06', 'additive', 10, []), ('9903.82.07', 'flat', 10, []), ('9903.82.09', 'additive', 25, []),
                                  ('9903.82.10', 'flat', 15, []), ('9903.82.12', 'additive', 25, []), ('9903.82.14', 'additive', 50, ['RU']),
                                  ('9903.82.15', 'additive', 10, ['RU']), ('9903.82.16', 'additive', 25, ['RU']), ('9903.82.17', 'additive', 25, ['RU']),
                                  ('9903.82.20', 'additive', 25, []), ('9903.82.22', 'flat', 15, None), ('9903.82.23', 'flat', 10, []),
                                  ('9903.82.25', 'flat', 15, [])]:
        heading(code, kind, pct, ctry)
    for code in ['9903.82.01', '9903.82.03', '9903.82.13']:
        heading(code, 'relief', None)
    DEAL_XI = sorted(ch99['9903.82.22']['countries'])
    assert set(EU) < set(DEAL_XI) and {'AR', 'EC', 'SV', 'GT', 'JP', 'KR', 'LI', 'CH', 'TW', 'GB'} < set(DEAL_XI)

    METAL_CODES = [f'9903.82.{n:02d}' for n in range(2, 27) if n != 3]
    S_MET = _src('procl-11021', 'bis-11021-corr', 'procl-11032', S=S) + [hts_note(16)]
    FULL = ('Charged on the full customs value regardless of metal content (note 16(c); Proclamation 11021 clause (1), from April 6, 2026). '
            'Note 16(b): collected in addition to any FTA/GSP special rate. Notes 52(f)(1) / 50(a)(vi)(1): goods under 9903.82.02 and '
            '9903.82.04–9903.82.26 do not pay the 2026 Section 301 duties (9903.05.20–9903.05.84) or the Brazil duty (9903.05.01), so those are replaced; '
            'other Chapter 99 duties (China lists, note 31) stack.')
    WEIGHT = ('Goods outside chapters 72, 73, 74 and 76 whose metal is under 15% of their weight enter under 9903.82.03 (no duty; fact metalWeightUnder15Pct); '
              'goods with no aluminum, steel or copper at all under 9903.82.01 (fact noMetalContent).')
    LATE = ('Entries added to the list on June 8, 2026 (Proclamation 11032) are in a separate record with that start date.')

    # RU: 9903.85.67 / .68 (200%, modelled in build-measures.py) replace every 9903.82 heading on the lines they cover (note 16(a)).
    ru_al = _union(['7601', '7604', '7605', '7606', '7607', '7608', '7609', '76169951'], cov['19(i)'], cov['19(j)'], cov['19(k)'])
    RU_NOTE = (' Lines covered by 9903.85.67 / 9903.85.68 (200% on Russian aluminum, note 19(m)) are left out: note 16(a) makes 9903.82.02–9903.82.26 '
               'not apply where those headings do.')

    def metal(key, code, kind, pct, subs, notes, countries_include=(), countries_exclude=(), conditions=None, replaces=REPL_301,
              start=None, end=None, ru_minus=None, extra=None, sources=None):
        """One record per start date (April 6 / June 8 list entries). ru_minus: also drop RU aluminum lines and these codes."""
        groups = dated(subs) if start is None else [(start, _union(*[L[s] for s in subs]))]
        for i, (d, codes) in enumerate(groups):
            exc = []
            if ru_minus is not None:
                codes, exc = _minus(codes, _union(ru_al, ru_minus))
                if not codes:
                    continue
            fields = dict(measureKey=key + ('-0608' if (start is None and d == JUN8 and len(groups) > 1) else ''), program=P, ch99Code=code,
                          rateKind=kind, ratePct=pct, countriesInclude=sorted(countries_include), countriesExclude=sorted(countries_exclude),
                          coverageInclude=codes, coverageExclude=exc, conditions=dict(conditions or {}), replacesCodes=list(replaces),
                          effectiveFrom=d, effectiveTo=end, sources=sources or S_MET,
                          notes=notes + (f' {LATE}' if start is None and len(groups) > 1 else '') + (RU_NOTE if ru_minus is not None else ''))
            if extra:
                fields.update(extra)
            add(**fields)

    subs_txt = lambda subs: ', '.join(f'16(c)({s})' for s in subs)
    # 50%: articles of aluminum / steel / copper and derivatives of (ii), (iv) — Annex I-A.
    metal('s232-metals-50', '9903.82.02', 'additive', 50, ['i', 'ii', 'iii', 'iv', 'v'], countries_exclude=['RU'],
          notes=f'Heading 9903.82.02: articles of aluminum (16(c)(i)), derivative aluminum (ii), steel (iii), derivative steel (iv) and copper (v): base + 50% '
                f'(Proclamation 11021 clause (2)(a)). Products of the UK with ≥95% UK-melted metal: 9903.82.04 (25%); derivatives of (ii)/(iv) with ≥85% '
                f'U.S.-melted metal: 9903.82.06 (10%). Russia: 9903.82.14 / 9903.82.02 RU records. {FULL} {WEIGHT}')
    metal('s232-metals-50-ru', '9903.82.02', 'additive', 50, ['i', 'ii'], countries_include=['RU'], ru_minus=L['iv'],
          notes='Heading 9903.82.02 for products of Russia: aluminum articles (16(c)(i)) and derivatives (ii) that 9903.85.67 / .68 do not cover, base + 50% '
                f'(9903.82.02 excepts only 9903.82.14, 9903.85.67 and 9903.85.68). {FULL}')
    metal('s232-metals-50-ru-steel-copper', '9903.82.14', 'additive', 50, ['iii', 'iv', 'v'], countries_include=['RU'], ru_minus=[],
          notes=f'Heading 9903.82.14: articles of steel (16(c)(iii)), derivative steel (iv) and copper (v) that are products of Russia: base + 50%. '
                f'With ≥85% U.S.-melted metal, derivative steel (iv) takes 9903.82.15 (10%). {FULL}')
    metal('s232-metals-uk-25', '9903.82.04', 'additive', 25, ['i', 'ii', 'iii', 'iv'], countries_include=['GB'],
          conditions={'factsTrue': ['ukMeltedMetal95Pct']}, replaces=['9903.82.02'] + REPL_301,
          notes='Heading 9903.82.04, note 16(d): products of the United Kingdom of 16(c)(i)–(iv) in which ≥95% of the aluminum was smelted or most recently '
                'cast, or ≥95% of the steel melted and poured, in the UK: base + 25% instead of 50% (Proclamation 11021 clause (2)(b)). Applies only when '
                'the importer confirms it (fact ukMeltedMetal95Pct). Commerce (91 FR 23056) lets Tata Steel UK steel melted and poured in the Netherlands '
                'count as UK until January 1, 2028. UK copper (16(c)(v)) pays 50%. ' + FULL)
    metal('s232-metals-uk-15', '9903.82.05', 'additive', 15, ['vi', 'vii'], countries_include=['GB'],
          conditions={'factsTrue': ['ukMeltedMetal95Pct']}, replaces=['9903.82.09'] + REPL_301,
          notes='Heading 9903.82.05, note 16(d): UK derivative aluminum / steel articles of 16(c)(vi)–(vii) with ≥95% UK-smelted/cast aluminum or UK-melted '
                'steel: base + 15% instead of 25% (Proclamation 11021 clause (3)(b)). Applies only when confirmed (fact ukMeltedMetal95Pct). ' + FULL)
    metal('s232-metals-us-melted-10', '9903.82.06', 'additive', 10, ['ii', 'iv', 'vi', 'vii', 'viii', 'xi'], countries_exclude=['RU'],
          conditions={'factsTrue': ['usMeltedMetal85Pct']},
          replaces=['9903.82.02', '9903.82.04', '9903.82.05', '9903.82.09', '9903.82.20', '9903.82.22'] + REPL_301,
          notes='Heading 9903.82.06, note 16(e): derivative articles of 16(c)(ii), (iv), (vi), (vii), (xi) and copper articles of (viii) in which ≥85% of the '
                'metal content (by weight) was melted and poured / smelted and cast in the United States: base + 10% (Proclamation 11021 clauses (2)(c), (3)(c); '
                'the 85% threshold is Proclamation 11032 clause (4)). Applies only when confirmed (fact usMeltedMetal85Pct); it replaces the 50%, 25%, UK and '
                '(xi) deal / USMCA rates (Proclamation 11032 clause (3)(b): the lowest applicable rate applies). ' + FULL)
    metal('s232-metals-us-melted-10-ru', '9903.82.06', 'additive', 10, ['ii', 'vi'], countries_include=['RU'], conditions={'factsTrue': ['usMeltedMetal85Pct']},
          replaces=['9903.82.02', '9903.82.09'] + REPL_301, ru_minus=_union(L['iv'], L['vii'], L['viii'], L['xi']),
          notes='Heading 9903.82.06 for products of Russia: derivative aluminum articles of 16(c)(ii) / (vi) with ≥85% U.S.-smelted and cast aluminum '
                '(fact usMeltedMetal85Pct), base + 10%. Russian steel / copper derivatives use 9903.82.15. ' + FULL)
    metal('s232-metals-us-melted-10-ru-steel', '9903.82.15', 'additive', 10, ['iv', 'vii', 'viii', 'xi'], countries_include=['RU'],
          conditions={'factsTrue': ['usMeltedMetal85Pct']}, replaces=['9903.82.14', '9903.82.16'] + REPL_301, ru_minus=[],
          notes='Heading 9903.82.15: copper and derivative steel articles of 16(c)(iv), (vii), (viii), (xi) that are products of Russia with ≥85% U.S.-melted '
                'metal (fact usMeltedMetal85Pct): base + 10% instead of 9903.82.14 / 9903.82.16. ' + FULL)
    # 25%: Annex I-B — (vi), (vii), (viii); (xi) is split by date below.
    metal('s232-metals-25', '9903.82.09', 'additive', 25, ['vi', 'vii', 'viii'], countries_exclude=['RU'],
          notes='Heading 9903.82.09: derivative aluminum (16(c)(vi)), derivative steel (vii) and copper articles (viii): base + 25% (Proclamation 11021 clause '
                '(3)(a)). UK with ≥95% UK metal: 9903.82.05 (15%); ≥85% U.S.-melted metal: 9903.82.06 (10%); parts for agricultural / industrial equipment '
                '(16(k)): 9903.82.23 / .25; motorcycle parts for U.S. manufacturing (16(g)): 9903.82.13. ' + FULL + ' ' + WEIGHT)
    metal('s232-metals-25-ru-al', '9903.82.09', 'additive', 25, ['vi'], countries_include=['RU'], ru_minus=_union(L['vii'], L['viii']),
          notes='Heading 9903.82.09 for products of Russia: derivative aluminum articles of 16(c)(vi) not covered by 9903.85.68, base + 25%. ' + FULL)
    metal('s232-metals-25-ru-steel-copper', '9903.82.16', 'additive', 25, ['vii', 'viii', 'xi'], countries_include=['RU'], ru_minus=[],
          notes='Heading 9903.82.16: copper and derivative steel articles of 16(c)(vii), (viii), (xi) that are products of Russia: base + 25% (no UK, deal or '
                'USMCA rate). ' + FULL)
    metal('s232-metals-history-25', '9903.82.09', 'additive', 25, [], countries_exclude=['RU'], start=APR6, end='2026-06-07',
          extra={'coverageInclude': _union(*LEFT_0608.values())},
          notes='Heading 9903.82.09, April 6 – June 7, 2026: the HVAC, agricultural, industrial and mobile equipment entries that were on lists 16(c)(vi) / (vii) '
                '(25%) under Proclamation 11021 until Proclamation 11032 moved them to (ix)–(xi) on June 8, 2026 (Chapter 99 Revision 9 vs Revision 10). '
                'Not modelled for this period: the UK (15%), U.S.-melted (10%), Russia and motorcycle variants. ' + FULL)
    # (xi) mobile industrial equipment (Annex I-C, Proclamation 11032 clause (2)), June 8, 2026 – December 31, 2027, then clause (3) of 11021.
    metal('s232-metals-mobile-25', '9903.82.09', 'additive', 25, ['xi'], countries_exclude=sorted(set(DEAL_XI) | {'RU'}), start=JUN8, end=END_2027,
          notes='Heading 9903.82.09 for mobile industrial equipment (16(c)(xi): forklifts, construction machinery, road tractors): base + 25% through December 31, '
                '2027 (Proclamation 11032 clause (2)(a)). Not for the deal partners of 9903.82.22 (15% total). Canada / Mexico goods claimed under USMCA: '
                '9903.82.20 on the non-U.S. content. ' + FULL)
    metal('s232-metals-mobile-25-2028', '9903.82.09', 'additive', 25, ['xi'], countries_exclude=['RU'], start='2028-01-01',
          notes='Heading 9903.82.09 for mobile industrial equipment (16(c)(xi)) from January 1, 2028: the clause (3) rates of Proclamation 11021 (25%) apply to every '
                'country (Proclamation 11032 clause (3)(a)); the 15% deal rate and the USMCA content rule end December 31, 2027. ' + FULL)
    metal('s232-metals-mobile-deal-15', '9903.82.22', 'floor', 15, ['xi'], countries_include=DEAL_XI, start=JUN8, end=END_2027,
          replaces=['9903.82.09'] + REPL_301,
          notes='Heading 9903.82.22: mobile industrial equipment (16(c)(xi)) of Argentina, Ecuador, El Salvador, Guatemala, Japan, South Korea, Liechtenstein, '
                'Switzerland, Taiwan, the UK or the EU: when the column 1 rate is below 15% the total is 15%; at or above 15% no additional duty (Proclamation '
                '11032 clause (2)(b), June 8, 2026 – December 31, 2027). Modelled as a floor: max(base, 15%). ' + FULL)
    metal('s232-metals-mobile-usmca', '9903.82.20', 'additive', 25, ['xi'], countries_include=['CA', 'MX'], start=JUN8, end=END_2027,
          conditions={'usmcaQualifying': True}, replaces=['9903.82.09'] + REPL_301,
          extra={'contentBasis': 'nonUsContent', 'usContentDeductionCapPct': 40},
          notes='Headings 9903.82.20 / 9903.82.21, note 16(j): mobile industrial equipment (16(c)(xi)) of Canada or Mexico eligible for USMCA (SPI S/S+): 25% on the '
                'non-U.S. content plus any U.S. content above 40% of the value (9903.82.21 = the U.S. content up to 40%, no duty), so the total is at least 15% '
                '(Proclamation 11032 clause (2)(d)). U.S. content = the value of parts produced in the United States, declared by the importer. Through '
                'December 31, 2027. ' + FULL)
    # Annex III (ix), (x): 15% total (10% U.S.-melted), April 6, 2026 – December 31, 2027; 25% from January 1, 2028.
    metal('s232-metals-equipment-15', '9903.82.10', 'floor', 15, ['ix', 'x'], countries_exclude=GN3B, end=END_2027,
          notes='Headings 9903.82.10 / 9903.82.11, note 16(f): derivative aluminum (16(c)(ix): HVAC parts) and steel (x: fixed industrial and agricultural '
                'equipment) articles: when the column 1 rate is below 15% the total is 15%; at or above 15% no additional duty (9903.82.11). Proclamation '
                '11021 clause (5)(a), April 6, 2026 – December 31, 2027 (agricultural and residential HVAC equipment joined the list on June 8, 2026, '
                'Proclamation 11032). Modelled as a floor: max(base, 15%). General note 3(b) countries (Belarus, Cuba, North Korea, Russia) pay 25% '
                '(9903.82.12 / 9903.82.17). ' + FULL + ' ' + WEIGHT)
    metal('s232-metals-equipment-us-melted-10', '9903.82.07', 'floor', 10, ['ix', 'x'], countries_exclude=GN3B, end=END_2027,
          conditions={'factsTrue': ['usMeltedMetal85Pct']}, replaces=['9903.82.10'] + REPL_301,
          notes='Headings 9903.82.07 / 9903.82.08, note 16(e): (ix)–(x) articles with ≥85% U.S.-melted metal (fact usMeltedMetal85Pct): total 10% when the column 1 '
                'rate is below 10%, otherwise no additional duty (Proclamation 11021 clause (5)(b)). Modelled as a floor: max(base, 10%). ' + FULL)
    metal('s232-metals-equipment-gn3b', '9903.82.12', 'additive', 25, ['ix', 'x'], countries_include=['BY', 'CU', 'KP'],
          notes='Heading 9903.82.12: (ix)–(x) articles of the general note 3(b) countries (no normal trade relations: Belarus, Cuba, North Korea): base + 25% '
                '(Proclamation 11021 clause (5)(c)). ' + FULL)
    metal('s232-metals-equipment-gn3b-ru', '9903.82.12', 'additive', 25, ['ix'], countries_include=['RU'], ru_minus=L['x'],
          notes='Heading 9903.82.12 for products of Russia: derivative aluminum articles of 16(c)(ix) not covered by 9903.85.68, base + 25%. Russian (x) articles '
                'use 9903.82.17. ' + FULL)
    metal('s232-metals-equipment-ru', '9903.82.17', 'additive', 25, ['x'], countries_include=['RU'], ru_minus=[],
          notes='Heading 9903.82.17: derivative steel articles of 16(c)(x) that are products of Russia: base + 25%. ' + FULL)
    metal('s232-metals-equipment-2028', '9903.82.09', 'additive', 25, ['ix', 'x'], countries_exclude=GN3B, start='2028-01-01',
          notes='Proclamation 11021 clause (7): from January 1, 2028 the (ix)–(x) articles pay the clause (3) rates (25%). The HTS heading for this step is not '
                'published yet; modelled under 9903.82.09 (the 25% heading) — re-check when the HTS changes. UK (15%) and U.S.-melted (10%) variants are in '
                'the -2028 records. ' + FULL)
    metal('s232-metals-equipment-2028-uk', '9903.82.05', 'additive', 15, ['ix', 'x'], countries_include=['GB'], start='2028-01-01',
          conditions={'factsTrue': ['ukMeltedMetal95Pct']}, replaces=['9903.82.09'] + REPL_301,
          notes='Proclamation 11021 clauses (7) and (3)(b): from January 1, 2028, UK (ix)–(x) articles with ≥95% UK metal pay 15%. Heading not yet published; '
                'modelled under 9903.82.05. ' + FULL)
    metal('s232-metals-equipment-2028-us-melted', '9903.82.06', 'additive', 10, ['ix', 'x'], countries_exclude=GN3B, start='2028-01-01',
          conditions={'factsTrue': ['usMeltedMetal85Pct']}, replaces=['9903.82.09', '9903.82.05'] + REPL_301,
          notes='Proclamation 11021 clauses (7) and (3)(c): from January 1, 2028, (ix)–(x) articles with ≥85% U.S.-melted metal pay 10%. Heading not yet '
                'published; modelled under 9903.82.06. ' + FULL)
    # 16(k): parts of (vi)–(viii) in chapters 84, 85, 87 used exclusively to make agricultural / fixed / mobile industrial equipment.
    k_subs = ['vi', 'vii', 'viii']
    k_codes = [c for c in _union(*[L[s] for s in k_subs]) if c[:2] in ('84', '85', '87')]
    for key, code, pct, facts, repl, what in [
        ('s232-metals-ag-parts-15', '9903.82.25', 15, ['agIndustrialEquipmentParts'], ['9903.82.09', '9903.82.05', '9903.82.06'],
         'headings 9903.82.25 / 9903.82.26 (note 16(f)): total 15% when the column 1 rate is below 15%, otherwise no additional duty'),
        ('s232-metals-ag-parts-us-melted-10', '9903.82.23', 10, ['agIndustrialEquipmentParts', 'usMeltedMetal85Pct'],
         ['9903.82.25', '9903.82.09', '9903.82.05', '9903.82.06'],
         'headings 9903.82.23 / 9903.82.24 (note 16(e)), with ≥85% U.S.-melted metal: total 10% when the column 1 rate is below 10%, otherwise no additional duty')]:
        metal(key, code, 'floor', pct, [], countries_exclude=GN3B, start=JUN8, end=END_2027, conditions={'factsTrue': facts}, replaces=repl + REPL_301,
              extra={'coverageInclude': k_codes},
              notes=f'Note 16(k), {what}: parts of 16(c)(vi)–(viii) in chapters 84, 85 or 87 ({len(k_codes)} provisions) used exclusively to make the agricultural '
                    'or fixed industrial equipment of (ix)–(x) or the mobile industrial equipment of (xi). Applies only when the importer confirms that end use '
                    '(fact agIndustrialEquipmentParts). Not for general note 3(b) countries. First in HTS Revision 10 (Proclamation 11032, June 8, 2026); '
                    'ends with the other temporary rates on December 31, 2027 (assumed — re-check). Modelled as a floor. ' + FULL)
    moto = [c for c in _union(L['vi'], L['vii'], L['viii'], L['xi']) if c[:2] in ('84', '85', '87')]
    metal('s232-metals-motorcycle-parts', '9903.82.13', 'relief', None, [], start=APR6, conditions={'factsTrue': ['motorcycleManufacturing']},
          replaces=METAL_CODES + REPL_301, extra={'coverageInclude': moto},
          notes=f'Heading 9903.82.13, note 16(g): articles of 16(c)(vi)–(viii) and (xi) in chapters 84, 85 or 87 ({len(moto)} provisions) that are motorcycle parts '
                'for use in manufacturing motorcycles in the United States: no Section 232 duty. Applies only when the importer confirms it (fact '
                'motorcycleManufacturing). 9903.82.13 is within 9903.82.04–9903.82.26, so the 2026 Section 301 and Brazil duties do not apply either '
                '(notes 52(f)(1), 50(a)(vi)(1)).')
    all16 = _union(*L.values())
    metal('s232-metals-no-metal', '9903.82.01', 'relief', None, [], start=APR6, conditions={'factsTrue': ['noMetalContent']}, replaces=METAL_CODES,
          sources=_src('procl-11021', 'bis-11021-corr', S=S) + [hts_note(16)], extra={'coverageInclude': all16},
          notes=f'Heading 9903.82.01 (added from April 6, 2026 by 91 FR 23056): articles of the note 16(c) lists ({len(all16)} provisions) that contain no aluminum, '
                'steel or copper are not metal articles or derivatives: no Section 232 metals duty. Applies only when the importer confirms it (fact '
                'noMetalContent). 9903.82.01 is outside 9903.82.02 / 9903.82.04–9903.82.26, so the 2026 Section 301 and Brazil duties still apply.')
    light = [c for c in all16 if c[:2] not in ('72', '73', '74', '76')]
    metal('s232-metals-under-15pct-weight', '9903.82.03', 'relief', None, [], start=APR6, conditions={'factsTrue': ['metalWeightUnder15Pct']},
          replaces=METAL_CODES, extra={'coverageInclude': light},
          notes=f'Heading 9903.82.03, note 16(c): for articles outside chapters 72, 73, 74 and 76 ({len(light)} provisions) the 9903.82 duties apply only when the '
                'listed metal (aggregate, if the provision is on several lists) is at least 15% of the article\'s weight (Proclamation 11021 clause (9), Annex IV). '
                'Below that: no Section 232 metals duty. Applies only when the importer confirms it (fact metalWeightUnder15Pct). 9903.82.03 is outside '
                '9903.82.02 / 9903.82.04–9903.82.26, so the 2026 Section 301 and Brazil duties still apply.')

    # ------------------------------------------------------------------ wood (note 37)
    PW = 'Section 232 (timber, lumber, wood products)'
    S_W = _src('procl-10976', 'procl-11000', S=S) + [hts_note(37)]
    softwood, uph, cab = program_cov['37(b)'], program_cov['37(d)'], program_cov['37(f)']
    WOOD = ('Note 37: collected in addition to any FTA/GSP special rate (for the 15% partners: in lieu of it). Notes 52(f)(4) / 50(a)(vi)(4): no 2026 Section 301 '
            'or Brazil duty on goods under these headings. Wood products also subject to the Section 232 automobile duties pay those instead (Proclamation '
            '10976 clause (6)) — handled with the vehicle measures.')
    CABQ = ('The listed statistical lines also hold goods that are not wooden kitchen cabinets or vanities (or their parts), which enter under 9903.76.04 with no '
            'duty (note 37(g)), so the duty applies only when the importer confirms the goods are wooden kitchen cabinets / vanities or parts (fact '
            'woodenCabinetsOrVanities, must be answered).')
    for code, kind, pct, ctry in [('9903.76.01', 'additive', 10, []), ('9903.76.02', 'additive', 25, []), ('9903.76.03', 'additive', 25, []),
                                  ('9903.76.20', 'additive', 10, ['GB']), ('9903.76.21', 'flat', 15, ['JP']), ('9903.76.22', 'flat', 15, EU),
                                  ('9903.76.23', 'flat', 15, ['KR']), ('9903.76.24', 'flat', 15, ['TW'])]:
        heading(code, kind, pct, ctry)
    heading('9903.76.04', 'relief', None)
    add(measureKey='s232-wood-softwood', program=PW, ch99Code='9903.76.01', rateKind='additive', ratePct=10, coverageInclude=list(softwood),
        replacesCodes=REPL_301, effectiveFrom='2025-10-14', sources=S_W,
        notes=f'Heading 9903.76.01, note 37(a)–(b): softwood timber and lumber ({len(softwood)} provisions of 4403, 4406, 4407.11–4407.19), every country: base + 10% '
              '(Proclamation 10976 clause (1), from October 14, 2025). For the UK the 232 duty may not exceed 10%, and for the EU and Japan base + duty may not '
              'exceed 15% (clause (7)) — met at the Free column 1 rates of these lines. Antidumping / countervailing duties on Canadian softwood lumber are not '
              'in this calculator. ' + WOOD)
    NOT_DEAL = sorted(['GB', 'JP', 'KR', 'TW'] + EU)
    for kind_key, code, lines, rate1, rate2, what, facts in [
        ('upholstered', '9903.76.02', uph, 25, 30, 'upholstered wooden furniture (note 37(c)–(d))', {}),
        ('cabinets', '9903.76.03', cab, 25, 50, 'completed kitchen cabinets and vanities and their parts (note 37(e)–(f))', {'factsTrue': ['woodenCabinetsOrVanities']})]:
        q = (' ' + CABQ) if facts else ''
        for k, start, end, rate, ctry_inc, ctry_exc, when in [
            ('', '2025-10-14', '2026-12-31', rate1, [], NOT_DEAL, ''),
            ('-2027', '2027-01-01', None, rate2, [], NOT_DEAL, f' Rises from {rate1}% to {rate2}% on January 1, 2027 (Proclamation 11000).'),
            ('-kr-before-deal', '2025-10-14', '2025-11-13', rate1, ['KR'], [], ' South Korea until its 15% rate took effect on November 14, 2025 (90 FR 55964).'),
            ('-tw-before-deal', '2025-10-14', '2026-04-30', rate1, ['TW'], [], ' Taiwan until its 15% rate took effect on May 1, 2026 (91 FR 31818).')]:
            add(measureKey=f's232-wood-{kind_key}{k}', program=PW, ch99Code=code, rateKind='additive', ratePct=rate, countriesInclude=ctry_inc,
                countriesExclude=ctry_exc, coverageInclude=list(lines), conditions=dict(facts), replacesCodes=REPL_301, effectiveFrom=start, effectiveTo=end,
                sources=S_W + (_src('ita-korea', S=S) if 'kr' in k else []) + (_src('ita-taiwan', S=S) if 'tw' in k else []),
                notes=f'Heading {code}: {what}, {len(lines)} statistical lines, base + {rate}% from {start}' + (f' through {end}' if end else '') + '.'
                      + when + ' Not for the UK, the EU, Japan, South Korea and Taiwan, which have their own headings (9903.76.20–9903.76.24).' + q + ' ' + WOOD)
    add(measureKey='s232-wood-not-cabinets', program=PW, ch99Code='9903.76.04', rateKind='relief', coverageInclude=list(cab),
        conditions={'factsFalse': ['woodenCabinetsOrVanities']}, effectiveFrom='2025-10-14', sources=S_W,
        notes='Heading 9903.76.04, note 37(g): goods of the 37(f) lines that are not completed wooden kitchen cabinets or vanities or their parts pay no Section 232 '
              'wood duty (shown when the importer answers no to woodenCabinetsOrVanities). 9903.76.04 is not in notes 52(f)(4) / 50(a)(vi)(4), so the 2026 '
              'Section 301 and Brazil duties apply.')
    for ctry_key, code, ctry, kind, pct, start, srcs, what in [
        ('uk', '9903.76.20', ['GB'], 'additive', 10, '2025-10-14', [], 'United Kingdom: base + 10% (the UK cap, Proclamation 10976 clause (7))'),
        ('jp', '9903.76.21', ['JP'], 'floor', 15, '2025-10-14', [], 'Japan: base + duty not above 15% — when the column 1 rate is below 15% the total is 15%, otherwise no additional duty (clause (7))'),
        ('eu', '9903.76.22', EU, 'floor', 15, '2025-10-14', [], 'the European Union: total 15% when the column 1 rate is below 15%, otherwise no additional duty (clause (7))'),
        ('kr', '9903.76.23', ['KR'], 'floor', 15, '2025-11-14', ['ita-korea'], 'South Korea: total 15% when the column 1 rate is below 15% (from November 14, 2025, 90 FR 55964). Note 37(l) collects it in lieu of a special rate "except for goods qualifying under KORUS"; a KORUS claim is the column 1 rate compared'),
        ('tw', '9903.76.24', ['TW'], 'floor', 15, '2026-05-01', ['ita-taiwan'], 'Taiwan: total 15% when the column 1 rate is below 15% (from May 1, 2026, 91 FR 31818)')]:
        for part, lines, facts, q in [('upholstered', uph, {}, ''), ('cabinets', cab, {'factsTrue': ['woodenCabinetsOrVanities']}, ' ' + CABQ)]:
            add(measureKey=f's232-wood-{ctry_key}-{part}', program=PW, ch99Code=code, rateKind=kind, ratePct=pct, countriesInclude=sorted(ctry),
                coverageInclude=list(lines), conditions=dict(facts), replacesCodes=REPL_301, effectiveFrom=start, sources=S_W + _src(*srcs, S=S) if srcs else S_W,
                notes=f'Heading {code}, note 37: {"upholstered wooden furniture (37(d))" if part == "upholstered" else "kitchen cabinets and vanities and parts (37(f))"} '
                      f'of {what}.' + (' Modelled as a floor: max(base, 15%).' if kind == 'floor' else '') + ' The January 1, 2027 increases do not apply to '
                      'these partners.' + q + ' ' + WOOD)

    # ------------------------------------------------------------------ semiconductors (note 39)
    PS = 'Section 232 (semiconductors)'
    S_SC = _src('procl-11002', S=S) + [hts_note(39)]
    semis = program_cov['39(b)']
    heading('9903.79.01', 'additive', 25)
    AUTO_TRUCK = ['9903.94.01', '9903.94.03', '9903.94.31', '9903.94.40', '9903.94.41', '9903.94.50', '9903.94.51', '9903.94.60', '9903.94.61',
                  '9903.94.05', '9903.94.07', '9903.94.32', '9903.94.33', '9903.94.42', '9903.94.43', '9903.94.44', '9903.94.45', '9903.94.52', '9903.94.53',
                  '9903.94.54', '9903.94.55', '9903.94.62', '9903.94.63', '9903.94.64', '9903.94.65', '9903.94.66', '9903.94.67', '9903.94.68', '9903.94.69',
                  '9903.74.01', '9903.74.02', '9903.74.03', '9903.74.08', '9903.74.09']
    add(measureKey='s232-semiconductors', program=PS, ch99Code='9903.79.01', rateKind='additive', ratePct=25, coverageInclude=list(semis),
        conditions={'factsTrue': ['logicIcWithinNote39bThresholds']}, replacesCodes=REPL_301 + METAL_CODES + AUTO_TRUCK, effectiveFrom='2026-01-15', sources=S_SC,
        notes='Heading 9903.79.01, note 39(a)–(b): semiconductor articles of 8471.50, 8471.80 and 8473.30 that are (or contain) a logic integrated circuit with a '
              'total processing performance of 14,000–17,500 and DRAM bandwidth of 4,500–5,000 GB/s, or 20,800–21,100 and 5,800–6,200 GB/s: base + 25% '
              '(Proclamation 11002, from January 15, 2026), also when a special rate is claimed. Other goods of these subheadings enter under 9903.79.02 with no '
              'duty, so the duty applies only when the importer confirms the thresholds (fact logicIcWithinNote39bThresholds, must be answered). The '
              'end-use exemptions (9903.79.03–9903.79.09) are separate relief measures. Note 39(a): not subject to the Section 232 automobile, truck and '
              'metals duties; notes 52(f)(7) / 50(a)(vi)(7): no 2026 Section 301 or Brazil duty — all replaced.')
    add(measureKey='s232-semiconductors-outside-thresholds', program=PS, ch99Code='9903.79.02', rateKind='relief', coverageInclude=list(semis),
        conditions={'factsFalse': ['logicIcWithinNote39bThresholds']}, effectiveFrom='2026-01-15', sources=S_SC,
        notes='Heading 9903.79.02, note 39(c): goods of 8471.50, 8471.80 and 8473.30 that do not meet the note 39(b) technical parameters: no Section 232 '
              'semiconductor duty (shown when the importer answers no). The 2026 Section 301 duties apply as usual.')
    for code, fact, what in [('9903.79.03', 'usDataCenter', 'for use in U.S. data centers (facilities needing more than 100 MW of new load for AI)'),
                             ('9903.79.04', 'repairReplacement', 'for repairs or replacements performed in the United States'),
                             ('9903.79.05', None, 'for research and development in the United States'),
                             ('9903.79.06', 'startup', 'for use by U.S. startups ("emerging growth companies", 15 U.S.C. 77b(a)(19))'),
                             ('9903.79.07', 'consumerElectronics', 'for non-data-center consumer applications in the United States (gaming, PCs, workstations, automotive)'),
                             ('9903.79.08', 'civilIndustrial', 'for non-data-center civil industrial applications in the United States'),
                             ('9903.79.09', 'publicSector', 'for U.S. public sector applications')]:
        heading(code, 'relief', None)
        cond = {'factsTrue': ['logicIcWithinNote39bThresholds'] + ([fact] if fact else [])}
        if not fact:
            cond['endUse'] = 'research'
        add(measureKey=f's232-semiconductors-enduse-{fact or "research"}', program=PS, ch99Code=code, rateKind='relief', coverageInclude=list(semis),
            conditions=cond, replacesCodes=['9903.79.01'], effectiveFrom='2026-01-15', sources=S_SC,
            notes=f'Heading {code}, note 39(d): semiconductor articles meeting note 39(b) that are {what}: no Section 232 duty (Proclamation 11002 clause (3)). '
                  'Applies only when the importer confirms the end use' + (f' (fact {fact}).' if fact else ' (endUse = research).') + ' The heading is outside '
                  '9903.79.01, so the 2026 Section 301 duties apply unless another exemption covers the line.')

    # ------------------------------------------------------------------ unmanned aircraft systems (note 43)
    PU = 'Section 232 (unmanned aircraft systems)'
    S_U = _src('procl-11055', S=S) + [hts_note(43)]
    heading('9903.08.21', 'additive', 100)
    heading('9903.08.22', 'additive', 25)
    heading('9903.08.23', 'additive', 10, ['GB'])
    heading('9903.08.24', 'flat', 15, sorted(EU + ['CH', 'JP', 'KR', 'LI', 'TW']))
    heading('9903.08.20', 'relief', None)
    c1 = program_cov['43(c)(1)']
    c1_uas = [c for c in c1 if c.startswith('8806')]
    c1_dual = [c for c in c1 if not c.startswith('8806')]
    c2, c3, c4 = program_cov['43(c)(2)'], program_cov['43(c)(3)'], program_cov['43(c)(4)']
    assert sorted(c3) == sorted(c4) and sorted(c1_dual) == ['8504409580', '8537109170'], 'note 43(c) lists changed — re-review'
    UAS_START, BLUE_START = '2026-09-03', '2027-02-09'
    UAS = ('Proclamation 11055, from September 3, 2026; for products on the DoW Blue UAS Cleared List / Blue UAS Framework or the FCC Conditional Approval '
           'list on September 2, 2026 (and their components) from February 9, 2027 (clause (7); fact uasBlueUasListed — each duty has a -blue record from '
           'that date). Note 43(b): collected in addition to any special rate. Not in note 52(f): the 2026 Section 301 duties stack (the civil-aircraft '
           'exemption of note 52(d), 9903.05.88, is not modelled). Annex III components (25% from February 9, 2027, clause (2)) have no HTS heading yet.')

    def uas(key, conditions, **kw):
        """A drone duty: one record for products not on the Blue UAS lists (from September 3, 2026) and one for listed products (from February 9, 2027)."""
        for suffix, start, extra in [('', UAS_START, {'factsFalse': ['uasBlueUasListed']}), ('-blue', BLUE_START, {'factsTrue': ['uasBlueUasListed']})]:
            cond = {k: list(v) for k, v in conditions.items()}
            for k, v in extra.items():
                cond[k] = cond.get(k, []) + v
            add(measureKey=key + suffix, program=PU, conditions=cond, effectiveFrom=start, sources=S_U, **kw)

    groups = [('uas', c1_uas, {}, 100, '9903.08.21', 'unmanned aircraft of 8806.24, 8806.29, 8806.94, 8806.99 (note 43(c)(1))'),
              ('docking', c1_dual, {'factsTrue': ['uasDockingStation']}, 100, '9903.08.21',
               'docking stations for unmanned aircraft and their parts (8504.40.9580, 8537.10.9170; note 43(c)(1)) — only when the importer confirms the goods are '
               'such docking stations or parts (fact uasDockingStation); otherwise 9903.08.20, no duty'),
              ('parts-over-25kg', c2, {'factsTrue': ['uasHeavyUasPart']}, 100, '9903.08.21',
               'parts and components (8807.10, 8807.20, 8807.30, 8807.90.90) for unmanned aircraft systems with a maximum take-off weight over 25 kg, except '
               'systems for retail delivery, agricultural use or sale to the Department of War (note 43(c)(2)) — only when the importer confirms it (fact '
               'uasHeavyUasPart; these subheadings also hold parts of manned aircraft, which enter under 9903.08.20)'),
              ('thermal', c3, {'factsTrue': ['uasThermalImaging']}, 100, '9903.08.21',
               'unmanned aircraft up to 25 kg with thermal imaging (8806.21–8806.23, 8806.91–8806.93; note 43(c)(3)) — fact uasThermalImaging, must be answered'),
              ('no-thermal', c4, {'factsFalse': ['uasThermalImaging']}, 25, '9903.08.22',
               'unmanned aircraft up to 25 kg without thermal imaging (note 43(c)(4))')]
    for key, lines, cond, rate, code, what in groups:
        uas(f's232-uas-{key}', cond, ch99Code=code, rateKind='additive', ratePct=rate, coverageInclude=sorted(lines),
            notes=f'Heading {code}: {what}: base + {rate}%. Products of Japan, South Korea, Taiwan, Switzerland, Liechtenstein or the EU (15% total) and of the UK '
                  '(+10%) whose critical components and technology are substantially all from the U.S. or those partners use 9903.08.24 / 9903.08.23 (fact '
                  'uasPartnerCriticalComponents). ' + UAS)
    deal_lines = [('uas', c1_uas, []), ('docking', c1_dual, ['uasDockingStation']), ('parts-over-25kg', c2, ['uasHeavyUasPart']), ('small', c3, [])]
    for key, code, ctry, kind, pct, what in [('deal', '9903.08.24', sorted(EU + ['CH', 'JP', 'KR', 'LI', 'TW']), 'floor', 15,
                                              'products of Japan, South Korea, Taiwan, Switzerland, Liechtenstein or the EU: total 15% when the column 1 rate is '
                                              'below 15% (note 43(d); Proclamation 11055 clause (4): "no higher than 15 percent ... including any duty rate under '
                                              'Column 1"). Modelled as a floor: max(base, 15%)'),
                                             ('uk', '9903.08.23', ['GB'], 'additive', 10, 'products of the United Kingdom: base + 10% (heading 9903.08.23 "The duty provided in the applicable subheading + 10%", note 43(d)). Proclamation 11055 clause (4) says the UK rate "shall be no higher than 10 percent"; the HTS heading text is modelled')]:
        for part, lines, facts in deal_lines:
            uas(f's232-uas-{key}-{part}', {'factsTrue': ['uasPartnerCriticalComponents'] + facts}, ch99Code=code, rateKind=kind, ratePct=pct,
                countriesInclude=ctry, coverageInclude=sorted(lines), replacesCodes=['9903.08.21', '9903.08.22'],
                notes=f'Heading {code}: unmanned aircraft systems, parts and components of note 43(c) ({part}) that are {what}, when the importer certifies that '
                      'substantially all the critical components and technology are products of the U.S., Japan, South Korea, Taiwan, Switzerland, '
                      'Liechtenstein, the EU or the UK (fact uasPartnerCriticalComponents; Commerce determines qualifying products).'
                      + (f' Also requires fact {", ".join(facts)}.' if facts else '') + ' ' + UAS)
    heading('9903.08.25', 'relief', None)
    heading('9903.08.26', 'relief', None)
    add(measureKey='s232-uas-onshoring', program=PU, ch99Code='9903.08.25', rateKind='relief', coverageInclude=_union(c1, c2, c3),
        conditions={'factsTrue': ['uasOnshoringPlan']}, replacesCodes=['9903.08.21', '9903.08.22', '9903.08.23', '9903.08.24'], effectiveFrom=UAS_START,
        sources=S_U, notes='Headings 9903.08.25 (onshoring plan approved by DHS or the Department of War) / 9903.08.26 (approved by the Secretary of Commerce), '
                           'Proclamation 11055 clause (6): unmanned aircraft, parts and components of note 43(c) imported for such a company pay no Section 232 '
                           'drone duty, within the volumes the approval allows. Applies only when the importer confirms it (fact uasOnshoringPlan). Shown '
                           'under 9903.08.25 for both headings.')
    for part, lines, fact in [('docking', c1_dual, 'uasDockingStation'), ('parts', c2, 'uasHeavyUasPart')]:
        add(measureKey=f's232-uas-not-covered-{part}', program=PU, ch99Code='9903.08.20', rateKind='relief', coverageInclude=sorted(lines),
            conditions={'factsFalse': [fact]}, effectiveFrom=UAS_START, sources=S_U,
            notes='Heading 9903.08.20: articles of the note 43(c) provisions that are not for use in or with the products described there pay no Section 232 '
                  f'unmanned-aircraft duty (shown when the importer answers no to {fact}).')

    # ------------------------------------------------------------------ quartz surface products safeguard (note 41)
    PQ = 'Section 201 safeguard (quartz surface products)'
    S_Q = _src('procl-11051', S=S) + [hts_note(41)]
    heading('9903.45.30', 'flat', 25)
    heading('9903.45.31', 'flat', 50)
    qsp = program_cov['41(a)']
    QN = ('Note 41(a)–(b): quartz surface products (slabs and other surfaces mostly of silica with a resin binder; not granite, marble, soapstone or quartzite) '
          f'of 6810.99.0020, 6810.99.0040 and 7020.00.6000; the duty is cumulative with the chapter 68 / 70 rate. These lines also hold other goods, so it '
          'applies only when the importer confirms the goods are quartz surface products (fact quartzSurfaceProduct, must be answered). Not for products of '
          f'the {len(QUARTZ_EXEMPT)} countries of note 41(c) (Canada, Mexico, FTA partners, listed developing countries, CBERA beneficiaries). In-quota (9903.45.30) '
          'vs over-quota (9903.45.31) depends on the quarterly quota fill (fact quartzOverQuota). Not in note 52(f): the 2026 Section 301 duties stack.')
    for (start, end, rin, rout) in [('2026-08-15', '2027-08-14', 25, 50), ('2027-08-15', '2028-08-14', 23, 49), ('2028-08-15', '2029-08-14', 21, 48),
                                    ('2029-08-15', '2030-08-14', 19, 47)]:
        for code, rate, facts, which in [('9903.45.30', rin, {'factsTrue': ['quartzSurfaceProduct'], 'factsFalse': ['quartzOverQuota']}, 'in-quota'),
                                         ('9903.45.31', rout, {'factsTrue': ['quartzSurfaceProduct', 'quartzOverQuota']}, 'over-quota')]:
            add(measureKey=f's201-quartz-{which}-{start[:4]}', program=PQ, ch99Code=code, rateKind='additive', ratePct=rate, countriesExclude=QUARTZ_EXEMPT,
                coverageInclude=list(qsp), conditions=facts, effectiveFrom=start, effectiveTo=end, sources=S_Q,
                notes=f'Heading {code} ({which}), note 41(e): base + {rate}% for entries from {start} through {end} (Proclamation 11051). ' + QN)

    _check(out, ch99)
    return out


def _check(measures, ch99):
    keys = [m['measureKey'] for m in measures]
    assert len(keys) == len(set(keys)), 'duplicate measureKey'
    for m in measures:
        assert m['ch99Code'] in ch99, f'{m["measureKey"]}: {m["ch99Code"]} not in ch99-headings.json'
        for c in m['replacesCodes']:
            assert c in ch99, f'{m["measureKey"]}: replaced code {c} not in ch99-headings.json'
        assert m['coverageInclude'], f'{m["measureKey"]}: empty coverage'
        for d in (m['effectiveFrom'], m['effectiveTo']):
            assert d is None or (len(d) == 10 and d[4] == '-' and d[7] == '-'), f'{m["measureKey"]}: bad date {d}'
        for s in m['sources']:
            assert s['url'].startswith(('https://www.federalregister.gov/', 'https://hts.usitc.gov/')), f'{m["measureKey"]}: non-official source {s["url"]}'
