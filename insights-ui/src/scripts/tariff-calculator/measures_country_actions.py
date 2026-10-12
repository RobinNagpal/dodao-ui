# Country actions and smaller still-in-effect Chapter 99 programs (issue #1796):
#
#   Section 338 duties on Canada        U.S. note 51, headings 9903.03.12–9903.03.16 (Proclamations 11046–11048, 11056, 11064, 11065)
#   Russia: rates in lieu of column 2   U.S. note 30, headings 9903.90.08 (35%) and 9903.90.09 (70%) (Proclamations 10420, 10523)
#   Japan leather and footwear (1986)   headings 9903.41.05 / 9903.41.10, U.S. note 3 (Proclamation 5448)
#
# Not here: the quartz safeguard (note 41) and Section 232 drones (note 43) belong to the materials module.
#
# Call from build-measures.py (after rec / S / hts_note are defined):
#
#     from measures_country_actions import country_action_measures  # noqa: E402
#     pcov = json.load(open(ROOT + 'program-coverage.json'))['notes']
#     measures += country_action_measures(cov, pcov, rec=rec, S=S, hts_note=hts_note)
#
#   country_action_measures(cov, program_cov, *, rec, S, hts_note) -> list[dict]
#     cov          note-coverage.json "notes" (used only to check that note 51(b)(2) does not reach a Section 232 list)
#     program_cov  program-coverage.json "notes" — the note 51 and 30 lists (written by extract-ch99-program-coverage.ts)
#     rec          build-measures.py's record factory rec(**fields)
#     S            build-measures.py's source lookup (not needed: this module carries its own sources in SRC below)
#     hts_note     build-measures.py's hts_note(n) source for a Chapter 99 U.S. note
#
# Conditions that depend on a fact the HTS line can't tell use the generic facts mechanism (conditions.factsTrue /
# factsFalse, ids registered in src/tariff-data/calculator/confirmation-facts.json — FACT_IDS below must all be there).
#
# Not duties, so not measures: the Section 338 import bans on Canadian goods from September 29, 2026 (Proclamations
# 11061–11063). They are listed in CANADA_IMPORT_BANS for the engine/UI to surface as "import prohibited" (see
# canada_import_bans()).

REVIEWED = '2026-10-11'

SRC = {
    'procl-11046': {'citation': '91 FR 46639 (Proclamation 11046: Section 338 duties on products of Canada — alcoholic beverages; 50%, heading 9903.03.12)',
                    'url': 'https://www.federalregister.gov/documents/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united-states',
                    'published': '2026-07-23'},
    'procl-11047': {'citation': '91 FR 46653 (Proclamation 11047: Section 338 duties on products of Canada — dairy; 50%, heading 9903.03.13)',
                    'url': 'https://www.federalregister.gov/documents/2026/07/23/2026-14992/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united',
                    'published': '2026-07-23'},
    'procl-11048': {'citation': '91 FR 46663 (Proclamation 11048: Section 338 duties on products of Canada — motor vehicles; 50%, heading 9903.03.14)',
                    'url': 'https://www.federalregister.gov/documents/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united',
                    'published': '2026-07-23'},
    'procl-11056': {'citation': '91 FR 54789 (Proclamation 11056: effective date of the Section 338 duties moved from August 19 to August 22, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/08/24/2026-17294/temporary-suspension-of-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of',
                    'published': '2026-08-24'},
    'procl-11061': {'citation': '91 FR 58311 (Proclamation 11061: import ban on certain Canadian alcoholic beverages from September 29, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/09/14/2026-18835/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued',
                    'published': '2026-09-14'},
    'procl-11062': {'citation': '91 FR 58319 (Proclamation 11062: import ban on certain Canadian dairy-scope products from September 29, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/09/14/2026-18836/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued',
                    'published': '2026-09-14'},
    'procl-11063': {'citation': '91 FR 58325 (Proclamation 11063: import ban on Canadian motorcycles over 800 cc from September 29, 2026)',
                    'url': 'https://www.federalregister.gov/documents/2026/09/14/2026-18837/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued',
                    'published': '2026-09-14'},
    'procl-11064': {'citation': '91 FR 58331 (Proclamation 11064: scope of 9903.03.12 modified from September 15, 2026; duties apply in addition to Section 232)',
                    'url': 'https://www.federalregister.gov/documents/2026/09/14/2026-18838/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset',
                    'published': '2026-09-14'},
    'procl-11065': {'citation': '91 FR 58339 (Proclamation 11065: scope of 9903.03.14 modified from September 15, 2026; duties apply in addition to Section 232)',
                    'url': 'https://www.federalregister.gov/documents/2026/09/14/2026-18839/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset',
                    'published': '2026-09-14'},
    'csms-69606660': {'citation': 'CBP CSMS # 69606660 (GUIDANCE: Section 338 additional duties on certain goods of Canada, from August 22, 2026)',
                      'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04', 'published': '2026-08-21'},
    'csms-69851916': {'citation': 'CBP CSMS # 69851916 (Modifying Section 338 additional duties on certain goods of Canada, from September 15, 2026)',
                      'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/429db0c', 'published': '2026-09-11'},
    'procl-10420': {'citation': '87 FR 38875 (Proclamation 10420: 35% in lieu of column 2 on listed products of Russia, heading 9903.90.08 and U.S. note 30)',
                    'url': 'https://www.federalregister.gov/documents/2022/06/30/2022-14145/increasing-duties-on-certain-articles-from-the-russian-federation',
                    'published': '2022-06-30'},
    'procl-10523': {'citation': '88 FR 13277 (Proclamation 10523: note 30(b) revised; 70% in lieu of column 2 on note 30(d) products of Russia, heading 9903.90.09, from April 1, 2023)',
                    'url': 'https://www.federalregister.gov/documents/2023/03/02/2023-04471/increasing-duties-on-certain-articles-from-the-russian-federation',
                    'published': '2023-03-02'},
    'procl-5448': {'citation': '100 Stat. 4411 (Proclamation 5448 of March 16, 1986: Increase in the Rates of Duty on Certain Articles From Japan — 40% on leather and footwear, Section 301)',
                   'url': 'https://www.govinfo.gov/content/pkg/STATUTE-100/pdf/STATUTE-100-Pg4411.pdf', 'published': '1986-03-16'},
}


def _s(*ids):
    return [SRC[i] for i in ids]


def _p(code):
    """'2208.30.6020' -> '2208306020'."""
    return code.replace('.', '')


# Facts this module's measures depend on (all must be registered in confirmation-facts.json).
FACT_IDS = ['civilAircraftGn6', 'jpFootwearExcepted', 'jpFootwearUpperPartlyLeather', 'jpLeatherDyedColoredStampedEmbossed']

# ---------------------------------------------------------------------------------------------------------------------
# Section 338 — Canada (U.S. note 51)
# ---------------------------------------------------------------------------------------------------------------------
P338 = 'Section 338 (Canada)'
CA_START = '2026-08-22'   # Proclamations 11046–11048 said August 19, 2026; Proclamation 11056 moved it to August 22 (CSMS 69606660).
CA_SCOPE = '2026-09-15'   # Proclamations 11064 / 11065 Annex II (CSMS 69851916).

# Proclamation 11064 Annex II.A.1: note 51(b)(1) (heading 9903.03.12) — 8-digit subheadings deleted / provisions inserted.
CA_B1_DELETED = ['2208.30.60', '2208.70.00']
CA_B1_INSERTED = [
    '0406.10.64', '0406.10.84', '0406.10.88', '0406.10.95', '0406.20.33', '0406.20.53', '0406.30.81', '0406.30.91', '0406.30.95', '0406.40.40',
    '0406.40.54', '0406.40.70', '0406.90.08', '0406.90.12', '0406.90.18', '0406.90.42', '0406.90.48', '0406.90.56', '0406.90.59', '0406.90.78',
    '0406.90.88', '0406.90.95', '0406.90.97', '1518.00.40', '2208.30.6020', '2208.30.6040', '2208.30.6055', '2208.30.6065', '2208.30.6075',
    '2208.70.0030', '4101.50.10', '4101.90.10', '4107.11.50', '4301.60.60', '4302.19.30', '4302.19.45', '4302.19.60', '8903.31.00', '8903.32.00',
    '8903.93.20',
]
# Proclamation 11065 Annex II.A.1: note 51(b)(3) (heading 9903.03.14).
CA_B3_DELETED = ['2501.00.00', '2523.29.00', '2940.00.60', '4803.00.40', '4818.90.00', '7801.10.00', '8537.10.91', '9507.10.00']
CA_B3_INSERTED = [
    '0406.90.99', '4802.61.10', '4802.61.20', '4802.61.60', '4802.62.10', '4802.62.20', '4802.62.30', '4802.62.61', '4802.69.10', '4802.69.20',
    '4802.69.30', '4818.90.0020', '7308.90.30', '7308.90.60', '7308.90.95', '7604.10.10', '7604.10.30', '7604.10.50', '7604.21.00', '7604.29.10',
    '7604.29.30', '7604.29.50', '7608.10.00', '7608.20.00', '8307.10.30', '8307.90.30', '8308.10.00', '8308.20.30', '8308.20.60', '8308.90.30',
    '8308.90.60', '8308.90.90', '8309.10.00', '8310.00.00', '8311.10.00', '8311.20.00', '8311.30.30', '8311.30.60', '8537.10.9130', '8537.10.9150',
    '8537.10.9160', '8537.10.9170', '8703.10.50', '8703.21.01', '8903.99.21', '9401.41.00', '9401.49.00', '9401.52.00', '9401.53.00', '9401.59.00',
    '9401.61.20', '9401.69.20', '9401.69.40', '9401.69.80', '9401.80.20', '9401.80.40', '9401.80.60', '9401.91.15', '9401.91.20', '9401.99.25',
    '9401.99.35', '9401.99.90', '9403.30.40', '9403.40.40', '9403.40.60', '9403.60.40', '9403.70.40', '9403.82.00', '9403.83.00', '9403.89.30',
    '9403.89.60', '9404.10.00', '9404.21.00', '9404.29.10', '9404.29.90', '9405.21.40', '9405.21.60', '9405.21.80', '9405.29.40', '9405.29.60',
    '9405.29.80', '9507.10.0040',
]

# Import bans (Proclamations 11061–11063, goods imported on or after September 29, 2026). scope "packaged" = only alcohol
# products packaged in bottles, cans, boxes, kegs or other similar direct-to-consumption containers (11061 Annex I).
_BAN_ALCOHOL = [
    ('2203.00.00', 'packaged'), ('2204.10.00', 'packaged'), ('2204.21.20', 'all'), ('2204.21.30', 'all'), ('2204.21.50', 'all'),
    ('2204.21.60', 'all'), ('2204.21.80', 'all'), ('2204.22.20', 'all'), ('2204.22.40', 'all'), ('2204.22.60', 'packaged'),
    ('2204.22.80', 'packaged'), ('2204.29.61', 'packaged'), ('2204.29.81', 'packaged'), ('2205.10.30', 'all'), ('2206.00.15', 'packaged'),
    ('2206.00.30', 'packaged'), ('2206.00.45', 'packaged'), ('2206.00.60', 'packaged'), ('2206.00.90', 'packaged'), ('2207.10.30', 'packaged'),
    ('2208.20.10', 'packaged'), ('2208.20.20', 'all'), ('2208.20.30', 'all'), ('2208.20.40', 'all'), ('2208.20.50', 'packaged'),
    ('2208.20.60', 'packaged'), ('2208.30.30', 'packaged'), ('2208.30.6020', 'all'), ('2208.30.6040', 'packaged'), ('2208.30.6055', 'all'),
    ('2208.30.6065', 'all'), ('2208.30.6075', 'packaged'), ('2208.40.20', 'all'), ('2208.40.40', 'all'), ('2208.40.60', 'packaged'),
    ('2208.40.80', 'packaged'), ('2208.50.00', 'packaged'), ('2208.60.10', 'all'), ('2208.60.20', 'all'), ('2208.60.50', 'packaged'),
    ('2208.70.0030', 'all'), ('2208.90.10', 'packaged'), ('2208.90.12', 'all'), ('2208.90.14', 'packaged'), ('2208.90.15', 'packaged'),
    ('2208.90.20', 'all'), ('2208.90.25', 'all'), ('2208.90.30', 'all'), ('2208.90.35', 'packaged'), ('2208.90.40', 'packaged'),
    ('2208.90.50', 'all'), ('2208.90.72', 'all'), ('2208.90.75', 'packaged'),
]
_BAN_DAIRY = ['0404.10.05', '0404.10.08', '0404.10.11', '0404.10.15', '0404.10.20', '0404.10.48', '0404.10.50', '0404.10.90', '1702.90.35',
              '1703.10.30', '1703.10.50', '1703.90.30', '1703.90.50', '2202.91.00']
_BAN_VEHICLES = ['8711.50.00']

CANADA_IMPORT_BANS = (
    [{'codePrefix': _p(c), 'scope': s, 'duty': '9903.03.12', 'proclamation': '11061'} for c, s in _BAN_ALCOHOL]
    + [{'codePrefix': _p(c), 'scope': 'all', 'duty': '9903.03.13', 'proclamation': '11062'} for c in _BAN_DAIRY]
    + [{'codePrefix': _p(c), 'scope': 'all', 'duty': '9903.03.14', 'proclamation': '11063'} for c in _BAN_VEHICLES]
)


def canada_import_bans():
    """The Section 338 import bans as data: products of Canada imported on or after September 29, 2026 are excluded from
    importation (not a duty). Goods imported before that date but entered later still pay the 50% (clause 2 of each
    proclamation), and if a ban is invalidated the 50% applies again (clause 9(b)) — so the duty measures stay in force."""
    src = {'11061': _s('procl-11061'), '11062': _s('procl-11062'), '11063': _s('procl-11063')}
    return [dict(b, countries=['CA'], effectiveFrom='2026-09-29', sources=src[b['proclamation']],
                 note=('Only alcohol products packaged in bottles, cans, boxes, kegs or other similar direct-to-consumption containers are banned; '
                       'bulk goods of the provision still pay the 50% Section 338 duty.') if b['scope'] == 'packaged' else 'Whole provision banned.')
            for b in CANADA_IMPORT_BANS]


def _canada(cov, program_cov, rec, hts_note):
    lists = {sub: program_cov[f'51(b)({sub})'] for sub in (1, 2, 3)}
    for sub, codes in lists.items():
        assert codes and len(codes) == len(set(codes)), f'note 51(b)({sub}) list empty or has duplicates'
    deleted = {1: [_p(c) for c in CA_B1_DELETED], 3: [_p(c) for c in CA_B3_DELETED]}
    inserted = {1: [_p(c) for c in CA_B1_INSERTED], 3: [_p(c) for c in CA_B3_INSERTED]}
    assert len(inserted[1]) + len(inserted[3]) == 122, 'CSMS 69851916: 122 provisions added on September 15, 2026'
    for sub in (1, 3):
        assert all(c in lists[sub] for c in inserted[sub]), f'51(b)({sub}): a September 15 insertion is missing from Revision 21'
        assert not any(c.startswith(d) or d.startswith(c) for c in lists[sub] if c not in inserted[sub] for d in deleted[sub]), \
            f'51(b)({sub}): a deleted subheading is still listed'
    for code, _scope in _BAN_ALCOHOL:
        assert any(_p(code).startswith(c) for c in lists[1]), f'ban {code} is not on note 51(b)(1)'
    for code in _BAN_DAIRY:
        assert any(_p(code).startswith(c) for c in lists[2]), f'ban {code} is not on note 51(b)(2)'
    for code in _BAN_VEHICLES:
        assert any(_p(code).startswith(c) for c in lists[3]), f'ban {code} is not on note 51(b)(3)'

    # Note 51(c) (heading 9903.03.15): from September 15, 2026 only the 9903.03.13 duty is lifted for goods under the Section 232
    # headings it names. Check that none of the note 51(b)(2) lines is on a Section 232 list today, so no relief measure is needed.
    s232 = {c for k, v in cov.items() if k.split('(')[0] in ('16', '33', '37', '38', '39', '40') for c in v}
    s232 |= {c for k, v in program_cov.items() if k.split('(')[0] in ('16', '33', '37', '38', '39', '40') for c in v}
    overlap = sorted(c for c in lists[2] if any(c.startswith(x) or x.startswith(c) for x in s232))
    assert not overlap, f'note 51(b)(2) lines on a Section 232 list {overlap} — model the 9903.03.15 relief'

    heads = {1: ('9903.03.12', 'procl-11046', 'alcoholic beverages'), 2: ('9903.03.13', 'procl-11047', 'dairy'),
             3: ('9903.03.14', 'procl-11048', 'motor vehicles')}
    common = ('U.S. note 51(a): the 50% applies also when a special rate is claimed (USMCA "S"/"S+" included: the heading\'s Special column is '
              '"+ 50%"), on top of the general rate and of any other subchapter III / IV duty (cumulative with the 2026 Section 301 duty on Canada, '
              '9903.05.29, which itself is lifted for USMCA goods by 9903.05.93). Not charged on goods properly entered under chapter 98 (except '
              '9802.00.40/.50/.60 and 9802.00.80, where it applies to the processing value / foreign value — not modelled), nor on articles for personal '
              'use in accompanied baggage. Civil aircraft articles of note 51(d) are relieved by heading 9903.03.16 (ca338-civil-aircraft).')
    out = []
    for sub, (code, procl, what) in heads.items():
        codes = lists[sub]
        new = [c for c in codes if c in inserted.get(sub, []) and not any(c.startswith(d) for d in deleted.get(sub, []))]
        orig = [c for c in codes if c not in new]
        src = _s(procl, 'procl-11056', 'csms-69606660')
        stack232 = ''
        if sub in (1, 3):
            src = src + _s('procl-1106' + ('4' if sub == 1 else '5'), 'csms-69851916')
            stack232 = (' From September 15, 2026 the duty applies in addition to any Section 232 duty (Proclamation 1106' + ('4' if sub == 1 else '5') +
                        '; note 51(c) now lifts only 9903.03.13). Between August 22 and September 14, 2026 articles subject to Section 232 were exempt '
                        '(9903.03.15) — that historical carve-out is not modelled.')
        else:
            stack232 = (' Note 51(c) (9903.03.15): articles under the Section 232 headings it names (metals, autos and parts, trucks and parts, wood, '
                        'semiconductors, patented pharmaceuticals) do not pay 9903.03.13; none of these lines is on a Section 232 list in Revision 21 '
                        '(0402.99.68 appears only on the terminated note 19(k) / 9903.85.08 aluminum derivative list), so no relief measure is needed. '
                        'CSMS 69851916: no change to the 9903.03.13 list on September 15, 2026.')
        out.append(rec(
            measureKey=f'ca338-b{sub}', program=P338, ch99Code=code, rateKind='additive', ratePct=50, countriesInclude=['CA'],
            coverageInclude=orig, effectiveFrom=CA_START, sources=src + [hts_note(51)], reviewedAt=REVIEWED,
            notes=f'U.S. note 51(b)({sub}) ({code}, Proclamation {procl[-5:]}: {what}): products of Canada classifiable in the {len(orig)} listed provisions '
                  f'pay base rate + 50% from August 22, 2026.' + stack232 + ' ' + common))
        if new:
            out.append(rec(
                measureKey=f'ca338-b{sub}-0915', program=P338, ch99Code=code, rateKind='additive', ratePct=50, countriesInclude=['CA'],
                coverageInclude=new, effectiveFrom=CA_SCOPE, sources=src + [hts_note(51)], reviewedAt=REVIEWED,
                notes=f'U.S. note 51(b)({sub}) ({code}): the {len(new)} provisions added by Proclamation 1106{"4" if sub == 1 else "5"} Annex II '
                      f'(CSMS 69851916, in bold on its list) pay base rate + 50% from September 15, 2026.' + stack232 + ' ' + common))
        if deleted.get(sub):
            kept = [c for c in codes if any(c.startswith(d) for d in deleted[sub])]
            out.append(rec(
                measureKey=f'ca338-b{sub}-removed-0915', program=P338, ch99Code=code, rateKind='additive', ratePct=50, countriesInclude=['CA'],
                coverageInclude=list(deleted[sub]), coverageExclude=kept, effectiveFrom=CA_START, effectiveTo='2026-09-14',
                sources=src + [hts_note(51)], reviewedAt=REVIEWED,
                notes=f'U.S. note 51(b)({sub}) ({code}) before September 15, 2026: subheadings {", ".join(CA_B1_DELETED if sub == 1 else CA_B3_DELETED)} '
                      f'were on the list from August 22 through September 14, 2026; Proclamation 1106{"4" if sub == 1 else "5"} deleted them, keeping only '
                      f'the statistical numbers it re-inserted ({", ".join(kept) or "none"}, which stay in ca338-b{sub}). ' + common))

    ca_d = program_cov['51(d)']
    out.append(rec(
        measureKey='ca338-civil-aircraft', program=P338, ch99Code='9903.03.16', rateKind='relief', countriesInclude=['CA'],
        coverageInclude=list(ca_d), conditions={'factsTrue': ['civilAircraftGn6']}, replacesCodes=['9903.03.12', '9903.03.13', '9903.03.14'],
        effectiveFrom=CA_START, sources=_s('procl-11046', 'procl-11047', 'procl-11048', 'csms-69606660') + [hts_note(51)], reviewedAt=REVIEWED,
        notes=f'U.S. note 51(d) (9903.03.16): articles of civil aircraft (all aircraft other than military and unmanned aircraft), their engines, '
              f'parts, components and subassemblies, and ground flight simulators, products of Canada that meet the criteria of general note 6 and '
              f'are classifiable in the {len(ca_d)} listed provisions (whether or not entered under "Free (C)"), do not pay 9903.03.12–9903.03.14. '
              f'Applies only when the importer confirms civil-aircraft use (fact civilAircraftGn6; default no). Chapter 98 provisions on the list '
              f'(9802.00.40/.50/.60/.80, 9818.00.05/.07) are outside chapters 1–97 and not covered here.'))
    return out


# ---------------------------------------------------------------------------------------------------------------------
# Russia — U.S. note 30 (35% / 70% in lieu of column 2)
# ---------------------------------------------------------------------------------------------------------------------
PRU = 'Russia (rates in lieu of column 2)'
# Proclamation 10523 Annex (effective April 1, 2023): 8-digit subheadings deleted from / inserted in note 30(b).
RU_B_DELETED_0401 = [
    '7202.11.50', '7202.21.10', '7202.29.00', '7202.30.00', '7202.41.00', '7202.49.10', '7202.70.00', '7204.21.00', '7204.29.00', '7204.49.00',
    '7205.29.00', '7207.12.00', '7216.91.00', '7224.90.00', '7304.29.10', '7304.29.20', '7304.29.31', '7304.29.41', '7304.29.50', '7306.29.20',
    '7306.29.60', '7307.99.10', '7308.90.60', '7310.10.00', '7310.29.00', '7311.00.00', '7314.41.00', '7318.15.20', '7318.15.40', '7318.16.00',
    '7318.22.00', '7325.10.00', '7408.11.60', '7408.19.00', '7409.21.00', '7410.22.00', '7604.29.30', '7604.29.50', '7605.11.00', '7606.12.30',
    '7606.12.60', '7613.00.00', '7801.10.00', '7801.99.90',
]
RU_B_INSERTED_0401 = [
    '2601.12.00', '2615.10.00', '2803.00.00', '2804.90.00', '2805.12.00', '2816.10.00', '2834.29.10', '2846.90.20', '2846.90.40', '2846.90.80',
    '7102.21.30', '7102.21.40', '7102.29.00', '7110.11.00', '7110.19.00', '7110.29.00', '7110.31.00', '7110.39.00', '7110.41.00', '7110.49.00',
    '7502.10.00', '7502.20.00', '7504.00.00', '8708.10.30',
]
# The Revision 21 PDF prints 30(d)'s "7217.10.90" as "7217,10.90", which extract-ch99-program-coverage.ts misses.
RU_D_PDF_TYPOS = ['72171090']
RU_COMMON = ('U.S. note 30: the rate replaces the column 2 rate of chapters 1–97 (Russia pays column 2 since April 9, 2022 under the Suspending '
             'Normal Trade Relations with Russia and Belarus Act; general note 3(b)), whether the column 2 rate is higher or lower. Cumulative with '
             'the other subchapter III duties: the 12.5% 2026 Section 301 duty on Russia (9903.05.66, unless note 52(b)–(f) lifts it) and the 200% '
             'Section 232 aluminum duty on Russian aluminum (9903.85.67 / 9903.85.68) are charged on top. Not charged on goods entered under chapter 98 '
             '(except 9802.00.40/.50/.60/.80 — value-based, not modelled). Many Russian goods are banned outright (EO 14066: oil, LNG, coal; EO 14068: '
             'fish and seafood, alcoholic beverages, non-industrial diamonds) — not surfaced here.')


def _russia(program_cov, rec, hts_note):
    b = list(program_cov['30(b)'])
    d = sorted(set(program_cov['30(d)']) | set(RU_D_PDF_TYPOS))
    assert not set(b) & set(d), 'a subheading is on both note 30(b) and 30(d)'
    ins = [_p(c) for c in RU_B_INSERTED_0401]
    dele = [_p(c) for c in RU_B_DELETED_0401]
    assert all(c in b for c in ins), 'a Proclamation 10523 insertion is missing from note 30(b)'
    assert not any(c in b for c in dele), 'a Proclamation 10523 deletion is still on note 30(b)'
    b_orig = [c for c in b if c not in ins]
    src35 = _s('procl-10420')
    return [
        rec(measureKey='ru-col2-35', program=PRU, ch99Code='9903.90.08', rateKind='inPlaceOfBase', ratePct=35, countriesInclude=['RU'],
            coverageInclude=b_orig, effectiveFrom='2022-07-27', sources=src35 + _s('procl-10523') + [hts_note(30)], reviewedAt=REVIEWED,
            notes=f'U.S. note 30(a)–(b) (9903.90.08): products of Russia in the {len(b_orig)} note 30(b) subheadings listed since Proclamation 10420 pay '
                  f'35% ad valorem in lieu of the column 2 rate, from July 27, 2022 (30 days after June 27, 2022). ' + RU_COMMON),
        rec(measureKey='ru-col2-35-0401', program=PRU, ch99Code='9903.90.08', rateKind='inPlaceOfBase', ratePct=35, countriesInclude=['RU'],
            coverageInclude=ins, effectiveFrom='2023-04-01', sources=_s('procl-10523') + [hts_note(30)], reviewedAt=REVIEWED,
            notes=f'U.S. note 30(b) (9903.90.08): the {len(ins)} subheadings Proclamation 10523 added (iron ore pellets, carbon, silicon, rare-earth '
                  f'compounds, diamonds, platinum-group metals, nickel, 8708.10.30 …) pay 35% in lieu of column 2 from April 1, 2023. ' + RU_COMMON),
        rec(measureKey='ru-col2-35-removed-0401', program=PRU, ch99Code='9903.90.08', rateKind='inPlaceOfBase', ratePct=35, countriesInclude=['RU'],
            coverageInclude=dele, effectiveFrom='2022-07-27', effectiveTo='2023-03-31', sources=src35 + _s('procl-10523') + [hts_note(30)],
            reviewedAt=REVIEWED,
            notes=f'U.S. note 30(b) before April 1, 2023: the {len(dele)} subheadings Proclamation 10523 deleted from 30(b) (most moved to 30(d) at 70%) '
                  'paid 35% in lieu of column 2 from July 27, 2022 through March 31, 2023. ' + RU_COMMON),
        rec(measureKey='ru-col2-70', program=PRU, ch99Code='9903.90.09', rateKind='inPlaceOfBase', ratePct=70, countriesInclude=['RU'],
            coverageInclude=d, effectiveFrom='2023-04-01', sources=_s('procl-10523') + [hts_note(30)], reviewedAt=REVIEWED,
            notes=f'U.S. note 30(c)–(d) (9903.90.09): products of Russia in the {len(d)} note 30(d) subheadings (iron and steel, ferroalloys, copper, '
                  f'aluminum, lead, titanium and other metals) pay 70% ad valorem in lieu of the column 2 rate from April 1, 2023 (Proclamation 10523). '
                  f'Includes 7217.10.90, printed "7217,10.90" in the Revision 21 PDF. Lines that were on 30(b) before April 1, 2023 paid 35% until then '
                  f'(ru-col2-35-removed-0401). ' + RU_COMMON),
    ]


# ---------------------------------------------------------------------------------------------------------------------
# Japan — leather and footwear, 40% (Proclamation 5448, 1986)
# ---------------------------------------------------------------------------------------------------------------------
PJP = 'Section 301 (Japan leather and footwear, 1986)'
JP_COMMON = ('U.S. note 3 to subchapter III: cumulative — charged in addition to the duties otherwise imposed (the 12.5% 2026 Section 301 duty on '
             'Japan, 9903.05.49, included). Status: in Revision 21 the two headings are neither shaded as expired nor suspended by note 5 (which '
             'suspends only 9903.41.25 and 9903.41.35–.45; 9903.41.15–.45 are shaded). Proclamation 5448 (effective March 31, 1986, items 945.75 / '
             '945.76 of the TSUS appendix) let USTR suspend or terminate the duties by Federal Register notice; no such notice was found, so the HTS '
             'text governs. The Special column is blank (the heading text applies regardless of a special-rate claim; Japan has no special rate on '
             'these lines).')


def _japan(rec, hts_note):
    src = _s('procl-5448') + [hts_note(3)]
    # 4106 / 4113 include leather of other animals (swine, reptiles, other): listed in coverageExclude = known, not covered.
    other_animals = ['410631', '410632', '410640', '410691', '410692', '411320', '411330', '411390']
    # Chapter 64 outside 9903.41.10: only 6403 (leather uppers, rubber/plastics/leather soles) and 6404.20 (leather soles) can qualify;
    # 6403.12 is ski / cross-country ski / snowboard footwear (excepted by the heading text).
    not_footwear_covered = ['6401', '6402', '640411', '640419', '6405', '6406', '640312']
    return [
        rec(measureKey='jp-leather-bovine', program=PJP, ch99Code='9903.41.05', rateKind='additive', ratePct=40, countriesInclude=['JP'],
            coverageInclude=['4104', '4107'], effectiveFrom='1986-03-31', sources=src, reviewedAt=REVIEWED,
            notes='Heading 9903.41.05: bovine (including buffalo) and equine leather of headings 4104 and 4107, products of Japan: base + 40%. ' + JP_COMMON),
        rec(measureKey='jp-leather-goat-sheep', program=PJP, ch99Code='9903.41.05', rateKind='additive', ratePct=40, countriesInclude=['JP'],
            coverageInclude=['4105', '4106', '4112', '4113'], coverageExclude=other_animals,
            conditions={'factsTrue': ['jpLeatherDyedColoredStampedEmbossed']}, effectiveFrom='1986-03-31', sources=src, reviewedAt=REVIEWED,
            notes='Heading 9903.41.05: goat, kid, sheep and lamb leather (headings 4105, 4106.21–.22, 4112, 4113.10) of Japan pays base + 40% only when '
                  'dyed, colored, stamped or embossed (fact jpLeatherDyedColoredStampedEmbossed, must be answered). Leather of swine, reptiles and other '
                  'animals (4106.31–.92, 4113.20–.90) is not covered. ' + JP_COMMON),
        rec(measureKey='jp-footwear', program=PJP, ch99Code='9903.41.10', rateKind='additive', ratePct=40, countriesInclude=['JP'],
            coverageInclude=['6403'], coverageExclude=not_footwear_covered, conditions={'factsFalse': ['jpFootwearExcepted']},
            effectiveFrom='1986-03-31', sources=src, reviewedAt=REVIEWED,
            notes='Heading 9903.41.10: footwear of Japan with outer soles of leather (or of rubber/plastics) and uppers of leather (heading 6403, the '
                  'leather-upper footwear of chapter 64) pays base + 40%, except (a) slip-on footwear not for outdoor use without backs, outer sole under '
                  '5 mm with under 20 mm ball-to-heel difference, and (b) sports footwear with spikes, sprigs, cleats and the like, skating boots, ski '
                  'boots and cross-country ski footwear (6403.12, excluded outright), wrestling, boxing and cycling shoes (fact jpFootwearExcepted, '
                  'default no). Footwear with composition-leather outer soles is not described by the heading — not separated. ' + JP_COMMON),
        rec(measureKey='jp-footwear-textile-upper', program=PJP, ch99Code='9903.41.10', rateKind='additive', ratePct=40, countriesInclude=['JP'],
            coverageInclude=['640420'], conditions={'factsTrue': ['jpFootwearUpperPartlyLeather'], 'factsFalse': ['jpFootwearExcepted']},
            effectiveFrom='1986-03-31', sources=src, reviewedAt=REVIEWED,
            notes='Heading 9903.41.10: footwear with outer soles of leather and uppers "wholly or in part of leather" can classify in 6404.20 (outer soles '
                  'of leather, uppers of textile) when leather is a minor part of the upper; it pays base + 40% only when the importer confirms the upper '
                  'is partly of leather (fact jpFootwearUpperPartlyLeather, default no). ' + JP_COMMON),
    ]


def country_action_measures(cov, program_cov, *, rec, S, hts_note):
    del S  # sources are local (SRC)
    measures = []
    measures += _canada(cov, program_cov, rec, hts_note)
    measures += _russia(program_cov, rec, hts_note)
    measures += _japan(rec, hts_note)
    keys = [m['measureKey'] for m in measures]
    assert len(keys) == len(set(keys)), 'duplicate measureKey'
    used = {f for m in measures for k in ('factsTrue', 'factsFalse') for f in m['conditions'].get(k, [])}
    assert used <= set(FACT_IDS), f'unregistered facts: {used - set(FACT_IDS)}'
    return measures
