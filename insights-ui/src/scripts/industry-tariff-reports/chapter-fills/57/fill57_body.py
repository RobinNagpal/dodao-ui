# Body of fill57.py (exec'd there; shares its globals). Split only to keep the files readable.

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW = {
    'hts-ch57': {
        'id': 'hts-ch57',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 57',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 57: Carpets and Other Textile Floor Coverings',
        'signed': None,
        'published': '2026-10-07',
        'url': CH57,
    },
    'fr-2018-13939': {
        'id': 'fr-2018-13939',
        'publisher': 'Federal Register',
        'citation': '83 FR 30335',
        'document': 'Final rule (Treasury, OFAC)',
        'title': 'Iranian Transactions and Sanctions Regulations (general license for Iranian-origin carpets and foodstuffs narrowed to a '
        'wind-down ending August 6, 2018)',
        'signed': None,
        'published': '2018-06-28',
        'url': 'https://www.federalregister.gov/documents/2018/06/28/2018-13939/iranian-transactions-and-sanctions-regulations',
    },
    'fr-2016-01227': {
        'id': 'fr-2016-01227',
        'publisher': 'Federal Register',
        'citation': '81 FR 3330',
        'document': 'Final rule (Treasury, OFAC)',
        'title': 'Iranian Transactions and Sanctions Regulations (31 CFR 560.534 added: imports of Iranian-origin carpets and foodstuffs '
        'authorized)',
        'signed': None,
        'published': '2016-01-21',
        'url': 'https://www.federalregister.gov/documents/2016/01/21/2016-01227/iranian-transactions-and-sanctions-regulations',
    },
    'fr-2010-24211': {
        'id': 'fr-2010-24211',
        'publisher': 'Federal Register',
        'citation': '75 FR 59611',
        'document': 'Final rule (Treasury, OFAC)',
        'title': 'Iranian Transactions Regulations (general licenses for Iranian-origin carpets and foodstuffs, 31 CFR 560.534–560.535, revoked '
        'from September 29, 2010)',
        'signed': None,
        'published': '2010-09-28',
        'url': 'https://www.federalregister.gov/documents/2010/09/28/2010-24211/iranian-transactions-regulations',
    },
    'fr-00-11009': {
        'id': 'fr-00-11009',
        'publisher': 'Federal Register',
        'citation': '65 FR 25642',
        'document': 'Final rule (Treasury, OFAC)',
        'title': 'Iranian Transactions Regulations: Licensing of Imports of, and Dealings in, Certain Iranian-Origin Foodstuffs and Carpets',
        'signed': None,
        'published': '2000-05-03',
        'url': 'https://www.federalregister.gov/documents/2000/05/03/00-11009/iranian-transactions-regulations-licensing-of-imports-of-and-dealings-in-certain-iranian-origin',
    },
    'fr-2024-30826': {
        'id': 'fr-2024-30826',
        'publisher': 'Federal Register',
        'citation': '90 FR 1800',
        'document': 'Final rule (CPSC)',
        'title': 'Certificates of Compliance (16 CFR part 1110: certificate data filed electronically with CBP at entry)',
        'signed': None,
        'published': '2025-01-08',
        'url': 'https://www.federalregister.gov/documents/2025/01/08/2024-30826/certificates-of-compliance',
    },
    'fr-2025-18521': {
        'id': 'fr-2025-18521',
        'publisher': 'Federal Register',
        'citation': '90 FR 45917',
        'document': 'Final rule; correction (CPSC)',
        'title': 'Certificates of Compliance; Correction (effective date July 8, 2026; January 8, 2027 for goods entered from a foreign-trade zone)',
        'signed': None,
        'published': '2025-09-24',
        'url': 'https://www.federalregister.gov/documents/2025/09/24/2025-18521/certificates-of-compliance-correction',
    },
    'fr-2016-23500': {
        'id': 'fr-2016-23500',
        'publisher': 'Federal Register',
        'citation': '81 FR 68062',
        'document': 'Notice (Labor, with State and Homeland Security)',
        'title': 'Final determination not to add carpets from India to the List of Products Requiring Federal Contractor Certification as to '
        'Forced or Indentured Child Labor (Executive Order 13126)',
        'signed': None,
        'published': '2016-10-03',
        'url': 'https://www.federalregister.gov/documents/2016/10/03/2016-23500/notice-of-final-determination-regarding-the-proposed-revision-of-the-list-of-products-requiring',
    },
    'usc-1307': {
        'id': 'usc-1307',
        'publisher': 'U.S. Code (GovInfo)',
        'citation': '19 U.S.C. 1307',
        'document': 'United States Code, 2024 edition',
        'title': 'Convict-made goods; importation prohibited (goods made by forced or indentured child labor)',
        'signed': None,
        'published': '2024-12-31',
        'url': USC_1307,
    },
}


def src(sid):
    return NEW.get(sid) or REF[sid]


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


SHORT = 'Carpets & Rugs'
d['chapter']['title'] = 'Carpets and Other Textile Floor Coverings'

GROUP_LABELS = {
    '5701': ('Hand-knotted carpets and rugs (Persian-style, oriental)', 'Hand-knotted rugs'),
    '5702': ('Woven rugs and carpets: kilims, dhurries, flatweaves, Wilton and machine-woven', 'Woven rugs'),
    '5703': ('Tufted carpets and rugs, carpet tiles and artificial turf', 'Tufted carpet & turf'),
    '5704': ('Felt carpets and carpet tiles (not tufted or flocked)', 'Felt floor coverings'),
    '5705': ('Other floor coverings: braided, needlepoint, coir and other mats', 'Other rugs & mats'),
}

# ---------------------------------------------------------------------------------------------------
# Shared facts
# ---------------------------------------------------------------------------------------------------
CA338 = '5703.39.20'
J_LISTS = (
    'Jordan (9903.06.20), and Guatemala (9903.06.06) and El Salvador (9903.06.09) when CAFTA-DR is claimed'
)
NO_52B = 'No Chapter 57 line is on the general exemption list (note 52(b)). '
IRAN_TEXT = (
    'Iranian-origin carpets cannot be imported at all: the Iranian Transactions and Sanctions Regulations (31 CFR 560.201) bar goods of Iranian '
    'origin, and the general license that allowed Persian carpets from 2016 ended with a wind-down on August 6, 2018. The ban is an OFAC '
    'rule, not a tariff, so the duty calculator does not model it.'
)

for e in d['overview']['spiLegend']:
    if e['code'] == 'NP':
        e['name'] = 'Nepal Preference Program (expired December 31, 2025)'
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — through December 31, 2026'

# ---------------------------------------------------------------------------------------------------
# Tariff updates: in-effect texts and changes
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 57: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'Rug & Carpet Tariff Updates 2026: HTS Chapter 57 — Section 301, China, India, Turkey, Iran Ban | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 57 rugs and carpets since January 2025: base rates unchanged, IEEPA and Section 122 '
    'duties ended, the 2026 Section 301 tariffs (India +10%, Turkey +12.5%, EU 10%), China +37.5%, Canada Section 338 on tufted carpet, '
    'the Nepal program lapse and the Iranian carpet ban — with Federal Register citations.',
    'keywords': [
        'hts chapter 57 tariff updates',
        '2026 carpet tariff updates',
        'tariffs on rugs from india',
        'tariffs on rugs from turkey',
        'china carpet import duty rates',
        'section 122 carpet tariffs',
        'section 301 rug tariffs',
        'persian rug embargo',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 57 base rate changed**: all 74 lines carry the same General, Special and Column 2 '
    'rates, from Free to 8%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached rugs from almost every country — 15% for Turkey, '
    '19% for Pakistan, 20% for Vietnam, 15% in total for the EU from August 7, 2025, 50% for India from August 27, and up to 125% plus 20% '
    'for China in April–May 2025, on top of the 25% List 3 duty. The IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 '
    'surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff**: '
    '+10% for India, Pakistan and the UK, +12.5% for Turkey, Egypt and Vietnam, 10% in total for the EU. China still pays the **25% List 3 '
    'duty** on every line, 37.5% in all. Since **August 22, 2026** Canadian tufted carpet of 5703.39.20 pays a **50% Section 338 duty**, even '
    'under USMCA. The Nepal duty-free program expired December 31, 2025, and Iranian carpets remain banned.'
)
tu['scope'] = (
    'Measures that reach Chapter 57 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, the Brazil '
    'Section 301 tariff, China Section 301 List 3, the Canada Section 338 duty on 5703.39.20, the Nicaragua Section 301 phase-in, and the '
    '2025–2026 IEEPA and Section 122 duties that have ended. The Nepal program and the OFAC ban on Iranian carpets are listed for reference. No '
    'Section 232 action and no antidumping or countervailing duty order covers a Chapter 57 product. For the rate each supplier pays, see '
    'Rates by country.'
)

IN_EFFECT_TEXT = {
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'India has no exception list. The IEEPA duties on India — 25% reciprocal from August 7, '
        '2025 plus 25% from August 27, 2025 — ended in February 2026.',
        'A hand-knotted wool rug from India (5701.10.90, 4.5%) pays 14.5%; a hand-tufted wool rug (5703.10.80, 6%) 16%; a hand-woven cotton '
        'dhurrie (5702.99.05, 6.8%) 16.8%; kilims and made-up woven wool rugs (Free) 10%.',
    ),
    'Türkiye (Turkey)': (
        'Base rate + 12.5% (9903.05.79). ' + NO_52B + 'Turkey has no exception list. The 15% IEEPA reciprocal duty (9903.02.64, from August '
        '7, 2025) ended February 24, 2026.',
        'Machine-woven polypropylene area rugs, made up (5702.42.20, Free), pay 12.5%; tufted polypropylene or polyester carpet (5703.39.20, '
        '6%) 18.5%; hand-knotted wool rugs 17%.',
    ),
    'China': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and +25% under List 3 (9903.88.03), which covers every '
        'Chapter 57 subheading. None of the China exclusions in force (U.S. note 20(vvv) and (www), through November 9, 2026) covers a Chapter '
        '57 product; the older rug exclusions printed in note 20 have expired. The IEEPA duties on China ended February 24, 2026, and USTR\'s '
        'four-year review kept List 3 in place.',
        'Chinese tufted nylon carpet and carpet tiles (6.7%) pay 44.2%, artificial turf 43.5%–44.2%, hand-knotted wool rugs 42%, Free lines '
        '37.5%.',
    ),
    'Pakistan': (
        'Base rate + 10% (9903.05.62). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.51) ended February 24, 2026.',
        'A hand-knotted wool rug from Pakistan pays 14.5%; hand-knotted rugs of silk or cotton (5701.90, Free) 10%.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10% — every Chapter 57 line — the total is 10% (9903.05.39, U.S. note 52(k)). ' + NO_52B
        + 'The EU exception list (note 52(j)(2)) names no Chapter 57 line. This replaced the 15%-in-total IEEPA rate (9903.02.20), which ended '
        'February 24, 2026.',
        'Belgian machine-woven rugs and Dutch or German carpet tiles pay 10% of value — $1,000 on $10,000 — whatever their base rate.',
    ),
    'Egypt': (
        'Base rate + 12.5% (9903.05.36). ' + NO_52B + 'Egypt has no exception list. The 10% IEEPA baseline duty ended February 24, 2026.',
        'Egyptian machine-woven polypropylene rugs (Free) pay 12.5%; tufted rugs 18.5%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject to '
        'the Canada Section 338 duties. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying rugs and carpet from Mexico pay nothing; non-qualifying goods pay the base rate plus 10%.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 '
        'duty (+50%, from August 22, 2026, 9903.03.14) applies to tufted carpet of 5703.39.20 — tufted floor coverings of man-made fibers '
        'other than nylon (polypropylene, polyester), other than turf and hand-hooked goods — and U.S. note 51(a) says it applies even when '
        'USMCA is claimed. The September 15, 2026 list revisions and the September 29, 2026 import bans changed no Chapter 57 entry. The 35% '
        'IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying Canadian polyester or polypropylene tufted carpet pays 50%; non-qualifying, 66% (6% + 10% + 50%). Other Canadian '
        'rugs pay nothing under USMCA.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 57 line. The 40% IEEPA duty on Brazil (Executive Order 14323) ended '
        'February 24, 2026.',
        'Brazilian rugs and carpet pay 37.5% on top of the base rate.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list (note 52(j)(1)) has no Chapter 57 line. The 10% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'British Wilton or Axminster-type woven wool carpet (5702.31.10, 8%) pays 18%; tufted wool carpet 16%.',
    ),
    'South Korea': (
        'Korean goods pay 12.5% in total in place of the base rate when the base rate is lower (9903.05.71). Every Chapter 57 line is below '
        '12.5%, so Korean rugs and carpet pay 12.5%, with or without a KORUS claim (U.S. note 52(a)). ' + NO_52B + 'Korea has no exception '
        'list. The 15% IEEPA reciprocal duty (9903.02.56) ended February 24, 2026.',
        'Korean tufted carpet and carpet tiles pay 12.5% of value — $1,250 on $10,000.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + 'The 19% IEEPA reciprocal duty (9903.02.61) ended February 24, 2026.',
        'Thai machine-woven rugs (Free) pay 12.5%; tufted rugs 18.5%–19.2%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'The 20% IEEPA reciprocal duty (9903.02.69) ended February 24, 2026.',
        'Vietnamese tufted rugs pay 18.5%–19.2%, woven made-up rugs 12.5%.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Bangladesh, Sri Lanka and Indonesia +10%, Morocco +12.5%, Taiwan 10% in total (9903.05.76). ' + NO_52B
    + 'Three country exception lists in U.S. note 52(j) cover **every Chapter 57 subheading**: ' + J_LISTS + ' — so their rugs pay no Section '
    '301 duty. Every Chapter 57 line is a CAFTA-DR textile good (general note 29(d)(v)), so rugs of Costa Rica, the Dominican Republic, '
    'Honduras and Nicaragua entered under CAFTA-DR (SPI P) are also exempt (note 52(i), 9903.05.95). Countries outside the 60 economies — Nepal and Afghanistan among them — pay only the base rate. '
    + IRAN_TEXT,
    'Bangladeshi jute or cotton rugs pay the base rate plus 10%; Jordanian rugs and rugs from any CAFTA-DR country entered under CAFTA-DR pay '
    'nothing extra; Nepalese and Afghan hand-knotted wool rugs pay only 4.5%.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Bangladesh, Morocco, Taiwan, Jordan, Guatemala, El Salvador)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key}')
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (5703.39.20, USMCA or not)'
        e['now'] = '+10% (non-USMCA); +50% on 5703.39.20, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'
    if e['country'] == 'China' and 'fr-2025-21671' not in e['sourceIds']:
        e['sourceIds'].insert(-1, 'fr-2025-21671')

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on tufted carpet (5703.39.20)',
        '50% on listed products of Canada after a 3-day suspension lapsed. One Chapter 57 subheading is on the motor-vehicle list (9903.03.14): '
        '5703.39.20, tufted carpets and rugs of man-made fibers other than nylon (polypropylene, polyester), other than turf and hand-hooked '
        'goods. Unlike the Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 57',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 57 line is on the general exemption list (note 52(b)). '
        'EU goods pay 10% in total. India, Pakistan and the UK +10%; Turkey, Egypt and Vietnam +12.5%. Jordanian rugs (note 52(j)) and rugs '
        'of the six CAFTA-DR countries entered under CAFTA-DR (notes 52(i) and 52(j)) are exempt on every Chapter 57 line. USMCA-qualifying goods from Canada and Mexico are exempt '
        '(9903.05.93, 9903.05.94). Nepal, Afghanistan and Iran are not among the 60.',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 57 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
        '12.5% forced-labor tariff (9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        # The generator dates pending items by the HTS release; the action was announced in the December 29, 2025 notice.
        c['date'], c['dateLabel'] = '2025-12-29', 'Announced'
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 57 base-rate changes'
        c['detail'] = (
            'All 74 Chapter 57 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, and no '
            'line was added, split or renumbered.'
        )
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {
        'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail,
        'before': before, 'now': now, 'countries': countries, 'sourceIds': ids,
    }


EXTRA_CHANGES = [
    ch('cn-301-continue', 'reference', '2026-10-07', 'Published', 'China Section 301 List 3 continues after the four-year review',
       'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic industries asked '
       'for them to continue. For Chapter 57 this keeps +25% (List 3) on every carpet, rug, mat and artificial-turf line.',
       '+25%', '+25%', 'China', ['fr-2026-20510']),
    ch('ca-338-scope', 'reference', '2026-09-15', 'Effective', 'Canada Section 338 lists revised; Chapter 57 entry unchanged',
       'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. 5703.39.20 stays on the list, no '
       'other Chapter 57 provision was added, and the September 29, 2026 Canadian import bans name no Chapter 57 product.',
       None, None, 'Canada', ['procl-11064', 'procl-11065', 'csms-69851916']),
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    ch('cpsc-efiling', 'reference', '2026-07-08', 'Effective', 'CPSC certificate data now filed electronically at entry',
       'Carpets and rugs must meet the CPSC flammability standards (16 CFR 1630 and 1631), so importers issue a General Certificate of '
       'Conformity. From July 8, 2026 the certificate data must be filed electronically with CBP at entry (January 8, 2027 for goods entered '
       'from a foreign-trade zone). No duty changes.',
       'Certificate on request', 'eFiled with the entry', 'All', ['fr-2024-30826', 'fr-2025-18521']),
    ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution '
       'of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican and '
       'Canadian rugs — but not the Section 338 duty on 5703.39.20.',
       None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 57 subheading was on the product exemption list '
       '(9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt.',
       'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
       'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from '
       '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
       'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    ch('india-oil-end', 'extraDuty', '2026-02-07', 'Effective', "India's extra 25% IEEPA duty removed",
       'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% reciprocal rate '
       'on India ended with the other IEEPA duties on February 24.',
       '+50%', '+25% (until February 24, 2026)', 'India', ['eo-14384']),
    ch('agoa-renewed', 'reference', '2026-02-03', 'Signed', 'AGOA reauthorized through December 31, 2026',
       'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. In Chapter 57, AGOA (SPI D) '
       'covers nine lines — hand-woven and flat-woven rugs (5702.50.20, 5702.91.30, 5702.92.10, 5702.99.05, 5702.99.20), hand-hooked tufted '
       'rugs (5703.10.20, 5703.29.10, 5703.39.10) and tufted rugs of other textile materials (5703.90.00). GSP (SPI A, A*) remains expired since December 31, 2020.',
       'Lapsed (from September 30, 2025)', 'In force to December 31, 2026', 'AGOA beneficiary countries',
       ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now']),
    ch('nepal-expired', 'reference', '2025-12-31', 'Expired', 'Nepal Preference Program (NP) expired',
       'The program that let Nepal ship hand-knotted wool rugs (5701.10.90) and 12 other Chapter 57 lines duty-free (SPI NP) ended after '
       'December 31, 2025, as the statute required. The NP code is still printed in the Special column but no longer applies: a Nepalese '
       'hand-knotted wool rug now pays the 4.5% General rate. Nepal is not one of the 60 Section 301 economies, so nothing is added.',
       'Free (NP)', 'General rate (4.5% on hand-knotted wool rugs)', 'Nepal', ['usc-4454', 'otexa-nepal', 'hts-now']),
    ch('cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
       'February 24, 2026.', '+20%', '+10% (ended)', 'China', ['eo-14357']),
    ch('india-oil', 'extraDuty', '2025-08-27', 'Effective', 'Extra 25% on products of India',
       'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 (EO '
       '14326): 50% in all on Indian rugs, on top of the base rate — 54.5% on a hand-knotted wool rug. Ended February 7, 2026.',
       '+25%', '+50% (ended)', 'India', ['eo-14329', 'eo-14326']),
    ch('country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country reciprocal rates replace the 10% baseline',
       'Executive Order 14326 set country rates for goods entered from August 7, 2025: Turkey and Afghanistan +15%, Pakistan +19%, Vietnam and '
       'Bangladesh +20%, India +25%, the UK +10%; countries not listed, such as Egypt and Nepal, kept +10%. EU goods with a column 1 rate '
       'under 15% paid 15% in total (9903.02.20) — every Chapter 57 line. Ended February 24, 2026.',
       '+10%', '+10% to +25% (ended)', 'Listed countries, European Union', ['eo-14326', 'hts-now']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', '+25%', '+35% (ended)', 'Canada',
       ['eo-14325']),
    ch('cn-reciprocal-10', 'extraDuty', '2025-05-14', 'Effective', 'China reciprocal duty cut from 125% to 10%',
       'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese tufted nylon '
       'carpet then paid 6.7% + 25% (List 3) + 20% + 10% = 61.7% until November 9, 2025. Ended February 24, 2026.',
       '+125%', '+10% (ended)', 'China', ['eo-14298']),
    ch('cn-125', 'extraDuty', '2025-04-10', 'Effective', 'China reciprocal duty raised to 125%',
       'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. With the 20% fentanyl duty and the 25% '
       'List 3 duty, Chinese tufted nylon carpet paid 176.7% until May 13, 2025.', None, '+125% (ended)', 'China', ['eo-14266']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 57 product was '
       'exempt. Ended February 24, 2026.', 'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257']),
    ch('cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top '
       'of the List 3 duty. Ended February 24, 2026.', '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', 'None', '+25% (ended)',
       'Mexico', ['eo-14194']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
       'None', '+25% (ended)', 'Canada', ['eo-14193']),
    ch('iran-carpets-2018', 'reference', '2018-08-06', 'Ended', 'Iranian carpet imports banned again',
       'After the United States left the Iran nuclear agreement, OFAC narrowed the carpet and foodstuff general license (31 CFR 560.534) to '
       'a wind-down that ended at 11:59 p.m. EDT on August 6, 2018. Since then the 31 CFR 560.201 import ban applies to Iranian-origin '
       'carpets of Chapter 57 (and antique carpets of 9706), whether shipped from Iran or a third country. Used carpets that are part of an '
       'arriving traveler\'s household effects are still allowed (31 CFR 560.524).',
       'Allowed (since January 21, 2016)', 'Banned', 'Iran', ['fr-2018-13939', 'fr-2016-01227']),
    ch('iran-carpets-2010', 'reference', '2010-09-29', 'Effective', 'Iranian carpet license revoked (2010–2016)',
       'OFAC revoked the 2000 general license for Iranian carpets and foodstuffs; it was restored on January 21, 2016 (81 FR 3330). The '
       'license had allowed Persian carpets since April 28, 2000 (65 FR 25642).',
       'Allowed (since April 28, 2000)', 'Banned', 'Iran', ['fr-2010-24211', 'fr-00-11009']),
    ch('cn-list3-25', 'extraDuty', '2019-05-10', 'Effective', 'China List 3 duty raised to 25%',
       'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers every Chapter 57 subheading, and the rate has applied ever '
       'since.', '+10%', '+25%', 'China', ['fr-2019-09681']),
    ch('cn-list3', 'extraDuty', '2018-09-24', 'Effective', 'China Section 301 List 3 reaches all carpets and rugs',
       'The third China Section 301 list put +10% on every Chapter 57 subheading — knotted, woven, tufted and felt carpets, artificial turf and '
       'other floor coverings.', 'None', '+10%', 'China', ['fr-2018-20610']),
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(tu, [
    'eo-14323', 'fr-2025-21671', 'procl-11064', 'procl-11065', 'csms-69851916', 'procl-11012', 'fr-2024-30826', 'fr-2025-18521',
    'ustr-usmca-review', 'scotus-24-1287', 'eo-14389', 'csms-67834313', 'eo-14384', 'ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp',
    'usc-4454', 'otexa-nepal', 'eo-14357', 'eo-14329', 'eo-14326', 'eo-14325', 'eo-14298', 'eo-14266', 'eo-14257', 'eo-14195', 'eo-14228',
    'eo-14194', 'eo-14193', 'fr-2018-13939', 'fr-2016-01227', 'fr-2010-24211', 'fr-00-11009', 'fr-2019-09681', 'fr-2018-20610',
])
stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
ov = d['overview']
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 57: {SHORT} — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Rugs & Carpets into the U.S.: Flammability (16 CFR 1630/1631), Labeling, Iran Ban & Legal Ways to Lower Duty '
    '(HTS Ch. 57) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 57 line needs at U.S. entry — CPSC carpet and rug flammability tests and eFiled certificates, '
    'FTC fiber-content labels, country-of-origin marking, the OFAC ban on Iranian carpets — and the legal ways to pay less: construction '
    'and fiber classification, origin, note 52(j) exception lists, USMCA, folklore certification, samples and drawback.',
    'keywords': [
        'carpet flammability standards',
        'cpsc ff 1-70 carpets and rugs',
        'ff 2-70 small rugs',
        'rug labeling requirements',
        'carpet country of origin',
        'are persian rugs illegal in the us',
        'carpet tariff engineering strategies',
        'cbp substantial transformation carpets',
    ],
}
te['intro'] = (
    'Rugs need no import license, but four sets of rules apply at or after entry. **Flammability**: every carpet or rug sold for use as a '
    'floor covering must pass the CPSC pill test — 16 CFR 1630 for large carpets, 1631 for small rugs (no side over 6 ft, 24 sq ft or less), '
    'and small rugs that fail must carry a permanent "FLAMMABLE" label. The importer certifies compliance in a General Certificate of '
    'Conformity, filed electronically with the entry since July 8, 2026. **Labeling**: fiber content of the face or pile and the country of '
    'origin under the FTC Textile Rules, plus CBP origin marking. **Origin**: a carpet\'s origin is where it was knotted, woven or tufted '
    '(19 CFR 102.21). **Sanctions**: carpets of Iranian origin are banned, wherever they ship from.\n\n'
    'On cost, the construction and fiber decide the base rate (Free to 8%), and the country of origin decides the extra duty (+0% for Nepal, '
    '+10% for India, +37.5% for China). Each lever below depends on a document, listed with its regulation.'
)
te['regulationsAsOf'] = ECFR_DATE
te['levers'] = [
    {
        'id': 'construction',
        'title': 'Classify by construction, make-up and pile fiber',
        'saves': 'Up to 8 points of base rate: woven pile rugs of man-made fibers are Free when made up (5702.42) but 7%–8% as unfinished '
        'roll goods (5702.32); hand-knotted rugs are Free in silk or cotton (5701.90) and 4.5% in wool (5701.10.90); tufted rugs pay 3.8%–6.7%',
        'appliesTo': 'All lines — the heading follows the construction (knotted 5701, woven 5702, tufted 5703, felt 5704, other 5705), and '
        'the subheading the fiber of the pile or face and whether the rug is made up',
        'document': 'Construction and fiber details on the invoice: knotted, woven or tufted, hand or machine made, pile and backing fibers by '
        'weight, size and finishing (bound or fringed edges make a rug "made up", Section XI note 7).',
        'caveat': 'The pile decides the fiber: for carpets with a pile, the ground fabric or backing is ignored (Section XI subheading note '
        '2(B)(b)). Tufting with a power-driven gun is not "hand-hooked". Floor-covering underlays are not Chapter 57 (chapter note 2).',
        'citations': [
            {'label': 'HTSUS Chapter 57 and notes', 'url': CH57},
            {'label': 'HTSUS Section XI notes 7 and subheading note 2', 'url': SEC11},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — it sets the extra duty',
        'saves': 'The gap between country rates: nothing extra for Nepal or Afghanistan, +10% for India and Pakistan, +12.5% for Turkey and '
        'Egypt, 10% in total for the EU, +37.5% for China',
        'appliesTo': 'All lines',
        'document': 'Origin follows 19 CFR 102.21(e): a carpet originates where it was knotted, woven or tufted from yarn. Washing, clipping, '
        'binding, latex backing or repairing in another country does not change it. The manufacturer ID (MID) on the entry must name the '
        'company that made the rug.',
        'caveat': 'Shipping through a lower-rate country does not change origin, and false origin claims are a customs violation. Iranian-origin '
        'carpets are banned even if finished or shipped elsewhere (31 CFR 560.306).',
        'citations': [
            {'label': '19 CFR 102.21(e)', 'url': ecfr(19, '102.21')},
            {'label': '19 CFR 102.23', 'url': ecfr(19, '102.23')},
        ],
    },
    {
        'id': 'exception-lists',
        'title': 'Use the note 52(j) exception lists and the CAFTA-DR textile exemption',
        'saves': 'The 10% Section 301 duty on every Chapter 57 line',
        'appliesTo': 'All 74 lines for products of Jordan (9903.06.20), and of Guatemala (9903.06.06) and El Salvador (9903.06.09) entered '
        'under CAFTA-DR; and of Costa Rica, the Dominican Republic, Honduras and Nicaragua entered under CAFTA-DR — every Chapter 57 line is '
        'a CAFTA-DR textile good under general note 29(d)(v) (9903.05.95)',
        'document': 'The exemption heading reported with the entry line, and for CAFTA-DR goods a valid origin claim with the SPI "P".',
        'caveat': 'The EU, UK, Swiss and other exception lists name no Chapter 57 line. Without the SPI "P" claim, CAFTA-DR rugs pay the '
        'Section 301 duty. The calculator applies all of these exemptions.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)(6)–(7), (j)(13)', 'url': CH99},
            {'label': 'HTSUS General Note 29 (CAFTA-DR)', 'url': GN},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on rugs made in Mexico or Canada',
        'saves': 'The base rate (up to 8%) and the 10% Section 301 duty',
        'appliesTo': 'All lines, for goods that qualify as originating — generally carpets made in North America from North American yarn '
        '(General Note 11, Chapter 57 rules)',
        'document': 'A certification of origin from the importer, exporter or producer, in any format, with the SPI "S" on the entry line.',
        'caveat': 'For Canada, USMCA does not remove the 50% Section 338 duty on tufted carpet of 5703.39.20 (U.S. note 51(a)). The USMCA was '
        'not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11', 'url': GN},
            {'label': 'HTSUS 9903.05.93, 9903.05.94, U.S. note 51', 'url': CH99},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim an FTA or AGOA rate where the base rate is the cost',
        'saves': 'The base rate: up to 8% (Wilton and velvet carpet), 6.8% (cotton flatweaves), 6%–6.7% (tufted carpet), 4.5% (hand-knotted '
        'wool)',
        'appliesTo': 'The 41 dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Jordan, Morocco, Bahrain, '
        'Oman, Singapore and CAFTA-DR countries; AGOA countries (through December 31, 2026) on nine woven and tufted lines',
        'document': 'Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, JO, MA, BH, OM, SG, P, D).',
        'caveat': 'FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)) unless a note 52(j) list or note 52(i) covers the goods. '
        'GSP (A, A*) has been expired since December 31, 2020 and the Nepal program (NP) since December 31, 2025, although both codes are still '
        'printed.',
        'citations': [
            {'label': 'HTSUS General Note 3(c)', 'url': GN},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99},
            {'label': 'CBP: GSP status', 'url': src('cbp-gsp')['url']},
        ],
    },
    {
        'id': 'folklore',
        'title': 'Certify hand-loomed and folklore rugs',
        'saves': '4.3 points of base rate on hand-woven flat wool rugs (5702.91.20 Free instead of 5702.91.30 at 4.3%)',
        'appliesTo': 'Hand-woven wool rugs, made up, not of pile construction; the other "certified hand-loomed and folklore" lines '
        '(5701.10.13 alpaca-hair rugs, 5702.10.10 kilims) are Free either way',
        'document': 'A certificate from an official of a government agency of the producing country, issued under procedures set up by USTR '
        '(Section XI additional U.S. note 2).',
        'caveat': 'Only countries with a certification arrangement can issue the certificate. The extra duty by country still applies.',
        'citations': [
            {'label': 'HTSUS Section XI additional U.S. note 2', 'url': SEC11},
            {'label': 'HTSUS 5702.91.20', 'url': CH57},
        ],
    },
    {
        'id': 'samples',
        'title': 'Enter carpet samples as samples',
        'saves': 'All duty — the base rate and the Section 301, China and Canada duties',
        'appliesTo': 'Carpet swatches and sample tiles valued at $1 or less each, or marked, torn or perforated so they cannot be sold, used only '
        'to solicit orders',
        'document': 'Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.',
        'caveat': 'Usable rugs and full-size tiles sent as samples are classified in Chapter 57 like any other rug. U.S. notes 20, 51 and 52 '
        'exempt goods properly entered under Chapter 98 from those extra duties.',
        'provisions': [
            {'code': '9811.00.60', 'rate': 'Free', 'text': 'Samples valued not over $1 each, or marked, torn, perforated or otherwise treated so '
             'they are unsuitable for sale, used only for soliciting orders for products of foreign countries'}
        ],
        'citations': [
            {'label': 'HTSUS 9811.00.60', 'url': CH98},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20(a), 51, 52(a)', 'url': CH99},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling where the line decides the rate',
        'saves': 'Certainty on the splits that move the rate: knotted vs. tufted, hand-hooked vs. gun-tufted, made up vs. roll goods, wool vs. '
        'man-made pile, Wilton/velvet vs. other woven carpet',
        'appliesTo': 'Any line where construction or fiber is in doubt — especially blended piles and hand-tufted goods',
        'document': 'A ruling request to CBP describing construction, fiber content by weight, size and finishing (19 CFR part 177).',
        'caveat': 'Rulings apply to the transaction described; a different construction may need its own.',
        'citations': [{'label': '19 CFR part 177', 'url': ecfr_part(19, 177)}],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback when rugs are exported',
        'saves': 'Up to 99% of the duties paid, including Section 301 duties, on imported rugs or carpet re-exported',
        'appliesTo': 'All lines, when the imported goods or substitutes are exported or destroyed under CBP supervision',
        'document': 'A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.',
        'caveat': 'Only duties actually paid are refunded.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
]
te['rules'] = [
    {
        'id': 'cpsc-large',
        'agency': 'CPSC',
        'title': 'Large carpets and rugs (one side over 6 ft and over 24 sq ft, and carpet tiles meant to be installed as larger areas) must '
        'pass the FF 1-70 pill test: at least 7 of 8 specimens. One-of-a-kind antique, oriental or hide rugs may be excluded under CPSC '
        'conditions',
        'citations': [{'label': '16 CFR part 1630', 'url': ecfr_part(16, 1630)}, {'label': '16 CFR 1630.2', 'url': ecfr(16, '1630.2')}],
    },
    {
        'id': 'cpsc-small',
        'agency': 'CPSC',
        'title': 'Small carpets and rugs (no side over 6 ft, 24 sq ft or less) are tested under FF 2-70; a rug that fails may be sold only '
        'with a permanent label: "FLAMMABLE (FAILS U.S. DEPARTMENT OF COMMERCE STANDARD FF 2-70): SHOULD NOT BE USED NEAR SOURCES OF '
        'IGNITION"',
        'citations': [{'label': '16 CFR part 1631', 'url': ecfr_part(16, 1631)}, {'label': '16 CFR 1631.34', 'url': ecfr(16, '1631.34')}],
    },
    {
        'id': 'cpsc-certificate',
        'agency': 'CPSC',
        'title': 'General Certificate of Conformity for the flammability standard, issued by the importer; its data filed electronically '
        'with CBP at entry from July 8, 2026 (January 8, 2027 for goods from a foreign-trade zone)',
        'citations': [
            {'label': '16 CFR part 1110', 'url': ecfr_part(16, 1110)},
            {'label': '90 FR 1800; 90 FR 45917', 'url': src('fr-2025-18521')['url']},
        ],
    },
    {
        'id': 'ftc-labeling',
        'agency': 'FTC',
        'title': 'Textile Fiber Products Identification Act: floor coverings sold onward must show fiber content and country of origin; on '
        'rugs with a backing the content refers to the face or pile only ("100% Wool Pile")',
        'citations': [
            {'label': '16 CFR 303.45(a)(8)', 'url': ecfr(16, '303.45')},
            {'label': '16 CFR 303.11', 'url': ecfr(16, '303.11')},
            {'label': '16 CFR 303.33', 'url': ecfr(16, '303.33')},
        ],
    },
    {
        'id': 'textile-origin',
        'agency': 'CBP',
        'title': 'Textile country of origin: a carpet or rug (5701–5705) originates where it was made from yarn of another chapter — '
        'knotted, woven or tufted; finishing elsewhere does not change it',
        'citations': [{'label': '19 CFR 102.21(e)', 'url': ecfr(19, '102.21')}],
    },
    {
        'id': 'textile-mid',
        'agency': 'CBP',
        'title': 'Manufacturer identification code (MID) of the company that made the rug on every commercial entry; entry is denied for '
        'textiles from companies named by CITA for illegal transshipment',
        'citations': [{'label': '19 CFR 102.23', 'url': ecfr(19, '102.23')}, {'label': '19 CFR 102.24', 'url': ecfr(19, '102.24')}],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking on each rug; Native American-style rugs must be marked indelibly — a sewn-in label counts',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}, {'label': '19 CFR 134.43(d)', 'url': ecfr(19, '134.43')}],
    },
    {
        'id': 'ofac-iran',
        'agency': 'Treasury (OFAC) / CBP',
        'title': 'Carpets of Iranian origin may not be imported, from Iran or a third country, without an OFAC license; arriving travelers\' '
        'used household rugs are exempt',
        'citations': [
            {'label': '31 CFR 560.201', 'url': ecfr(31, '560.201')},
            {'label': '31 CFR 560.306', 'url': ecfr(31, '560.306')},
            {'label': '31 CFR 560.524(b)', 'url': ecfr(31, '560.524')},
        ],
    },
    {
        'id': 'forced-labor',
        'agency': 'CBP',
        'title': 'Goods made by forced or indentured child labor may not be imported; we found no CBP withhold release order or finding naming '
        'carpets, and in 2016 Labor, State and DHS declined to add Indian carpets to the Executive Order 13126 list',
        'citations': [
            {'label': '19 U.S.C. 1307', 'url': USC_1307},
            {'label': '81 FR 68062 (2016)', 'url': src('fr-2016-23500')['url']},
            {'label': '19 CFR 12.42', 'url': ecfr(19, '12.42')},
        ],
    },
]
ALL_RULES = [r['id'] for r in te['rules']]
GROUP_NOTES = {
    '5701': 'Hand-knotted wool rugs are 5701.10.90 (4.5%); silk, cotton and man-made-fiber knotted rugs are Free. Origin is where the rug '
    'was knotted. Iranian-origin Persian rugs are banned; Persian-design rugs knotted in India, Pakistan, Nepal or Turkey are not Iranian.',
    '5702': 'Kilims, dhurries, coir and jute rugs are Free; made-up woven pile rugs of wool or man-made fibers are Free, unfinished roll '
    'goods 4%–8%. Certified folklore hand-woven wool rugs (5702.91.20) are Free instead of 4.3%.',
    '5703': 'The highest-rated group: 5.8%–6.7% on tufted wool, nylon and polypropylene rugs, carpet tiles and turf (3.8% for other fibers). Canadian 5703.39.20 '
    'pays the 50% Section 338 duty even under USMCA. Gun-tufted rugs are not "hand-hooked".',
    '5704': 'Felt tiles of 0.3 m² or less pay 4.7%; larger felt tiles and other felt floor coverings are Free.',
    '5705': 'Coir mats are Free; other floor coverings (braided, needlepoint and other) 3.3%.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = ALL_RULES
    g['note'] = GROUP_NOTES[g['heading']]
rows = {r['hts']: r for r in ov['rateTable']['rows'] if r.get('hts')}
for ln in te['lines']:
    ln['ruleIds'] = ALL_RULES
    gen = ln.get('general') or rows[ln['hts']].get('effectiveGeneral')
    lev = ['construction', 'origin', 'exception-lists', 'usmca']
    if gen and gen != 'Free':
        lev.append('fta')
    if ln['hts'].startswith(('5702.91.20', '5702.91.30')):
        lev.append('folklore')
    lev += ['samples', 'ruling', 'drawback']
    ln['leverIds'] = lev
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. The line a rug falls in, '
    'its origin and the Chapter 99 duties that apply depend on the facts of each shipment, and the extra duties change by proclamation, '
    'USTR notice and CBP guidance; confirm them before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Overview (static parts)
# ---------------------------------------------------------------------------------------------------
ov['h1'] = f'HTS Chapter 57: {SHORT} — Tariff Rates (2026)'
BLURBS = {
    '5701': (
        'Hand-knotted (and other knotted) carpets and rugs — Persian-style, oriental and tribal rugs. Wool rugs are 5701.10.90 at 4.5%, '
        'hand-hooked knotted wool rugs and alpaca- or llama-hair rugs Free; silk, cotton and man-made-fiber knotted rugs (5701.90) are Free.',
        ['hand-knotted rug', 'persian rug', 'oriental rug', 'wool area rug', 'silk rug', 'tribal rug', 'hand knotted carpet'],
    ),
    '5702': (
        'Woven floor coverings: kilims, soumaks and dhurries (5702.10, Free), coir mats, Wilton, Axminster-type and velvet carpet, and '
        'machine-woven area rugs. Made-up woven pile rugs of wool or man-made fibers are Free; roll goods pay 4%–8%; flat-woven cotton rugs '
        '6.8%, wool 3.6%–6.3%, man-made 2.7%–4.7%.',
        ['kilim', 'dhurrie', 'flatweave rug', 'machine-woven rug', 'wilton carpet', 'jute rug', 'cotton rug', 'polypropylene area rug'],
    ),
    '5703': (
        'Tufted carpets and rugs — hand-tufted and machine-tufted area rugs, broadloom, carpet tiles and artificial turf. The most-rated '
        'group: wool 6%, nylon 6.7% (hand-hooked 5.8%), polypropylene and polyester 6%, other fibers 3.8%.',
        ['hand-tufted rug', 'tufted carpet', 'carpet tiles', 'artificial turf', 'artificial grass', 'broadloom carpet', 'bath rug'],
    ),
    '5704': (
        'Felt carpets and tiles, not tufted or flocked: tiles of 0.3 m² or less pay 4.7%; larger tiles and other felt floor coverings are Free.',
        ['felt carpet tiles', 'felt rug', 'felt floor covering'],
    ),
    '5705': (
        'Other floor coverings, whether or not made up: coir mats Free; braided, needlepoint and other rugs and mats 3.3%.',
        ['braided rug', 'needlepoint rug', 'coir doormat', 'rug mat'],
    ),
}
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

ov['workedExamples'] = [
    {
        'title': 'Hand-knotted wool rug from India',
        'line': '5701.10.90.00',
        'body': 'Hand-knotted wool rugs pay 4.5%. India adds 10% under the 2026 Section 301 action (9903.05.44): **14.5%**, $1,450 on a '
        '$10,000 rug. From Nepal or Afghanistan the same rug pays only 4.5% (neither is one of the 60 economies; Nepal\'s duty-free program '
        'ended December 31, 2025); from Turkey 17%, from China 42%. A rug knotted in Iran cannot be imported at all.',
    },
    {
        'title': 'Machine-woven polypropylene area rug from Turkey',
        'line': '5702.42.20.80',
        'body': 'A made-up woven pile rug of man-made fibers is Free at the general rate. Turkey adds 12.5% (9903.05.79): **$1,250** on '
        'a $10,000 shipment. From Belgium it pays 10% in total (9903.05.39), from Egypt 12.5%, from China 37.5%.',
    },
    {
        'title': 'Tufted nylon carpet tiles from China',
        'line': '5703.29.20.10',
        'body': 'Tufted nylon carpet pays 6.7%. China adds 25% (List 3, 9903.88.03) and 12.5% (9903.05.31): **44.2%**, $4,420 on $10,000. '
        'No China product exclusion covers Chapter 57. In April–May 2025, with the IEEPA duties, it paid 176.7%.',
    },
    {
        'title': 'Tufted polyester broadloom from Canada, with a USMCA claim',
        'line': '5703.39.20.90',
        'body': 'The 6% base rate and the 10% Section 301 duty fall away with USMCA (9903.05.93). But 5703.39.20 is on the Canada Section 338 '
        'list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies even when USMCA is claimed: **$5,000** on a $10,000 shipment entered '
        'since August 22, 2026. Without USMCA it is 66%.',
    },
    {
        'title': 'Hand-woven cotton dhurrie from India',
        'line': '5702.99.05.00',
        'body': 'Flat-woven cotton rugs made up, woven by hand, pay 6.8%; India adds 10%: **16.8%**. The AGOA code (D) printed on the line '
        'does not help Indian goods, and GSP (A*) has been expired since December 31, 2020.',
    },
]
ov['notes']['chapterNotes'] = (
    '**Note 1.** For the purposes of this chapter, the term "carpets and other textile floor coverings" means floor coverings in which '
    'textile materials serve as the exposed surface of the article when in use and includes articles having the characteristics of textile '
    'floor coverings but intended for use for other purposes.\n\n'
    '**Note 2.** This chapter does not cover floor covering underlays.\n\n'
    'The Section XI (textiles) notes also apply. Note 7 decides when a rug is "made up" (cut to shape, hemmed or with a knotted fringe, '
    'assembled), which splits several 5702 lines. Subheading note 2(B)(b): for textile products with a ground fabric and a pile or looped '
    'surface, no account is taken of the ground fabric — so a carpet\'s fiber is that of its pile.'
)
ov['notes']['additionalUsNotes'] = (
    'Chapter 57 has no additional U.S. notes of its own. **Section XI additional U.S. note 2**: "certified hand-loomed and folklore" products '
    '(5701.10.13, 5702.10.10, 5702.91.20) are those certified by an official of a government agency of the producing country under '
    'procedures established by USTR.\n\n'
    '**Footnote to 5701.10.40, 5701.10.90 and 5701.90.20**: see 9817.57.01 — needle-craft display models of completed mass-produced kits, '
    'primarily hand stitched, enter Free.\n\n'
    'The three-digit numbers in brackets — (369) cotton, (465) wool, (665) man-made fibers — are textile category numbers used to monitor '
    'shipments.'
)
for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 74; Brazil: 74; China List 3: 74; Canada Section 338: 2 (5703.39.20, also on USMCA goods). '
            'Iranian-origin carpets are banned (31 CFR 560.201).'
        )

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 57: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]
RULE_LABELS = {
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 57 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). No Chapter 57 line is exempt. The 15% IEEPA duty ended February 24, 2026.',
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on every Chapter 57 line. No China exclusion in force '
    'covers a rug.',
    'Pakistan': 'Base rate + 10% Section 301 (9903.05.62). No Chapter 57 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'Egypt': 'Base rate + 12.5% Section 301 (9903.05.36). No Chapter 57 line is exempt.',
    'Nepal': 'Base rate only: Nepal is not one of the 60 Section 301 economies. The Nepal Preference Program (NP), which made hand-knotted '
    'wool rugs and 12 other lines Free, expired December 31, 2025.',
    'Afghanistan': 'Base rate only: Afghanistan is not one of the 60 Section 301 economies. The 15% IEEPA duty ended February 24, 2026, '
    'and GSP has been expired since 2020.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 57 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 57 line is on the UK exception list.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on tufted '
    'carpet of 5703.39.20 (9903.03.14), whether or not USMCA is claimed.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27). No Chapter 57 line is on the Brazil exemption list.',
    'South Korea': 'South Korea: 12.5% in total in place of the base rate (9903.05.71) — every Chapter 57 line is below 12.5%, so a KORUS claim '
    'saves nothing. The 15% IEEPA duty ended February 24, 2026.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 57 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate (9903.05.39) — every Chapter 57 line has a base rate under 10%. No line is on the EU '
    'exception list. The 15%-in-total IEEPA rate ended February 24, 2026.'
)
ANY_LABEL = (
    'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10% in '
    'total for Taiwan; Brazil pays +37.5%. Jordan (note 52(j)) and the six CAFTA-DR countries, when CAFTA-DR is claimed (notes 52(i), 52(j)), are exempt on every Chapter 57 line. Column 2 '
    'countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — 16% to 60%, or $1.29/m² on coir pile mats. Iranian-origin carpets '
    'are banned (31 CFR 560.201).'
)
for c in ia['countries']:
    name = c['country']
    if name in RULE_LABELS:
        c['rule']['label'] = RULE_LABELS[name]
    elif c['rule'].get('atLeast') or name == 'Any other country':
        c['rule']['label'] = ANY_LABEL
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    elif c['rule']['kind'] in ('eu15', 'floor') or 'in place of' in c['rule']['label']:
        c['rule']['label'] = EU_LABEL
    else:
        raise SystemExit(f'no rule label for {name}: {c["rule"]}')
    ids = c['rule']['sourceIds']
    if name in ('Canada', 'Mexico', 'India', 'Türkiye (Turkey)', 'Pakistan', 'Vietnam', 'Afghanistan') and 'eo-14389' not in ids:
        ids.insert(-1, 'eo-14389')
    if name == 'Nepal':
        for sid in ('usc-4454', 'otexa-nepal'):
            if sid not in ids:
                ids.insert(-1, sid)
    if name == 'Any other country':
        for sid in ('fr-2018-13939',):
            if sid not in ids:
                ids.insert(-1, sid)
add_sources(ia, ['eo-14389', 'usc-4454', 'otexa-nepal', 'fr-2018-13939'])
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on 5703.39.20 because '
    'U.S. note 51(a) applies it even when a special rate is claimed.',
    'Not in the cells: the note 52(j) exemption for Jordan and the CAFTA-DR exemptions (notes 52(i) and 52(j), all Chapter 57 lines, SPI P '
    'claimed) for Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua — the calculator applies them, but these '
    f'countries shipped under $1.5M of Chapter 57 goods in {Y}, so they are in "Any other country"; FTA and AGOA preferences; certified folklore treatment; and CPSC '
    'testing costs. No antidumping or countervailing duty order and no Section 232 action covers a Chapter 57 product.',
    'Iran is not shown: Iranian-origin carpets cannot be imported (31 CFR 560.201). The calculator prices duty only and does not model this '
    'OFAC ban.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied. NP (Nepal) and GSP codes are printed but expired, and are not applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) and lists (c)–(f) have no Chapter 57 line. The country exception lists in note 52(j) cover all '
    '50 Chapter 57 subheadings for Jordan (9903.06.20), and for Guatemala (9903.06.06) and El Salvador (9903.06.09) when entered under '
    'CAFTA-DR; the UK, EU, Swiss and other lists name no Chapter 57 line. Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods entered '
    'under CAFTA-DR; its coverage (general note 29(d)(v)) includes all of Chapter 57. The Brazil list (note 50(a)(ii)) has no Chapter 57 line. The Canada Section 338 list (note 51(b)(3)) names '
    '5703.39.20; the September 15, 2026 revisions and the alcoholic-beverage, dairy and import-ban lists name no other Chapter 57 line. '
    'China: List 3 (note 20(f)) covers every Chapter 57 subheading; the rug exclusions printed in note 20 (hand-knotted nylon and '
    'polypropylene rugs of 5701.90.10.10, polyester grommet rugs of 5705.00.20.30) have expired, and the exclusions in force (notes 20(vvv) '
    'and 20(www), through November 9, 2026) name no Chapter 57 product; note 31 (2024 increases) names none. Section 232: no Chapter 57 line '
    'is on a metals, vehicle, wood or semiconductor list. Note 30 sets no Chapter 57 rate for Russia, which pays column 2. The Section 122 '
    'exemption list (9903.03.03) had no Chapter 57 line. A Federal Register search of Commerce (ITA) notices found no antidumping or '
    'countervailing duty order on carpets or rugs.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 57: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Rug & Carpet Tariff FAQ 2026: HS Codes, Tariffs on Rugs from India, Turkey & China, Persian Rug Ban (HTS Ch. 57) | KoalaGains',
    'shortDescription': 'Answers to what people search about importing rugs and carpets into the U.S.: the HS / tariff code for hand-knotted, '
    'hand-tufted, wool, jute and bath rugs, carpet tiles and artificial turf; tariffs on rugs from India, Turkey and China; whether Persian '
    'rugs are illegal; and the flammability rules.',
    'keywords': [
        'carpet hs code',
        'rug hs code',
        'tariff code for rug',
        'hand knotted rug hs code',
        'hand tufted carpet hs code',
        'tariffs on rugs from india',
        'tariffs on rugs from turkey',
        'are persian rugs illegal in the us',
        'artificial grass hs code',
        'carpet tiles hs code',
        'carpet flammability standards',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for rugs, carpets, mats and artificial turf. Each '
    'answer links to the page with the full detail.'
)
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'

# ---------------------------------------------------------------------------------------------------
# Trade-driven text: overview, understand industry, industry areas, FAQ
# ---------------------------------------------------------------------------------------------------
TR = 'Türkiye'
VN = 'Viet Nam'
ind, tur, chn, vnm, egy = imp('India'), imp(TR), imp('China'), imp(VN), imp('Egypt')
h5702, h5703, h5701 = head('5702'), head('5703'), head('5701')
pct_tot = round((total / prior_total - 1) * 100, 1)

ov['seo']['title'] = 'HTS Chapter 57 Carpet & Rug Tariffs 2026: Import Duty Rates for Rugs from India, Turkey, China | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. duty table for all 74 HTS Chapter 57 lines — hand-knotted, woven and tufted rugs, carpet tiles, artificial turf and '
    'mats. Base rates Free to 8%, plus the extra duty by country: India +10%, Turkey +12.5%, EU 10% in total, China +37.5%; Iranian rugs banned.'
)
ov['seo']['keywords'] = [
    'hts chapter 57',
    'carpets and other textile floor coverings tariff',
    'carpets and other textile floor coverings import duty rates',
    'rug tariff code',
    'carpet hs code',
    'china tariff on carpets and other textile floor coverings',
    'india tariff on carpets and other textile floor coverings',
    'turkey machine-woven pile carpets tariff',
    'tufted broadlooms import duty',
    'knotted wool rugs customs duty',
]
ov['intro'] = (
    'Chapter 57 covers every textile floor covering: **hand-knotted rugs** (5701), **woven rugs** — kilims, dhurries, flatweaves, '
    'Wilton and machine-woven area rugs (5702), **tufted carpet and rugs**, carpet tiles and artificial turf (5703), **felt** floor '
    'coverings (5704) and other rugs and mats (5705). Its **74 tariff lines** run from Free to 8%: 33 are Free, hand-knotted wool rugs pay 4.5%, '
    'tufted wool and synthetic carpet 5.8%–6.7%, Wilton and velvet roll carpet 8%.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}. **India** ({fmt_usd(ind)}, {share(ind)}%) and **Turkey** '
    f'({fmt_usd(tur)}, {share(tur)}%) supplied {share(ind + tur)}% of it, ahead of China, Vietnam, Egypt and Mexico. On top of the base rate '
    'comes the **extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 economies — **+10% for India and Pakistan, +12.5% for '
    'Turkey, Egypt, Vietnam and Thailand, 10% in total for the EU and 12.5% for Korea**. **China pays +37.5%** (List 3 plus the 2026 action), '
    'so Chinese tufted nylon carpet pays 44.2%. Nepal and Afghanistan are not among the 60 and pay only the base rate. USMCA goods from Mexico '
    'pay nothing; Canadian tufted carpet of 5703.39.20 owes a **50% Section 338 duty** even under USMCA. **Carpets of Iranian origin cannot be '
    'imported at all** (31 CFR 560.201), and every rug sold in the U.S. must meet the CPSC flammability standards.'
)
ts = ov['tradeSnapshot']
ts['totalDutyCollectedUsd'] = None
ts['effectiveDutyRateNote'] = 'Duty-collected figures aren\'t available from an official source yet.'
ts['source'] = f'UN Comtrade, United States imports, HS chapter 57 ({Y})'
ts['topCountries'] = [
    {'name': {TR: 'Turkey', VN: 'Vietnam'}.get(c['country'], c['country']), 'importsUsd': c['importsUsd']} for c in trade['byCountry'][:5]
]
ts['biggestLines'] = [
    {'hts': '5702.42', 'label': 'Woven pile rugs of man-made fibers, made up (machine-woven area rugs)'},
    {'hts': '5703.39', 'label': 'Tufted carpet of polypropylene, polyester and other man-made fibers'},
    {'hts': '5705.00', 'label': 'Other floor coverings and mats'},
    {'hts': '5701.10', 'label': 'Hand-knotted wool rugs'},
]
ts['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade for calendar {Y} at the '
    '6-digit level — before the 2026 tariff changes.'
)

ui['h1'] = f'HTS Chapter 57: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Rug & Carpet Imports by Country: India, Turkey, China, Vietnam — HTS Chapter 57 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 57 rugs and carpets: {fmt_usd(total)} in {Y}. India and Turkey supply {share(ind + tur)}%; '
    'values by country, product (hand-knotted, woven, tufted, felt) and year from UN Comtrade.',
    'keywords': [
        'us rug imports by country',
        'rug importers in usa',
        'carpet imports india',
        'turkish rug imports',
        'india hand-knotted rugs customs duty',
        'hts 5703 tufted carpets',
        'textile floor coverings trade impact',
    ],
}
ui['valueBasis'] = trade['valueBasis']
ui['byYearPartners'] = ['India', 'Turkey']
ui['byYearCaption'] = (
    'U.S. imports of Chapter 57 goods each year, split into the two largest 2025 suppliers (India and Turkey) and everyone else.'
)
for c in ui['byCountry']:
    c['country'] = {TR: 'Turkey', VN: 'Vietnam', 'Rep. of Korea': 'South Korea'}.get(c['country'], c['country'])
for x in ui['byHeadingCountry']:
    x['country'] = {TR: 'Turkey', VN: 'Vietnam', 'Rep. of Korea': 'South Korea'}.get(x['country'], x['country'])
ui['why'] = (
    f'U.S. imports of Chapter 57 goods were **{fmt_usd(total)} in {Y}**, {abs(pct_tot)}% less than the {fmt_usd(prior_total)} of {PY} and '
    f'below the {fmt_usd(year_tot[2021])} peak of 2021. Woven rugs (5702) made up {share(h5702)}% ({fmt_usd(h5702)}) — most of it '
    f'**machine-woven pile area rugs of man-made fibers (5702.42)**, {fmt_usd(h6("570242"))}, the largest single product. Tufted carpet, '
    f'rugs, tiles and turf (5703) were {fmt_usd(h5703)} and hand-knotted rugs (5701) {fmt_usd(h5701)}.\n\n'
    f'**India** ({fmt_usd(ind)}, {share(ind)}%) is the largest supplier, with hand-knotted, hand-tufted and woven rugs across every heading. '
    f'**Turkey** ({fmt_usd(tur)}, {chg(TR)}%) ships mainly machine-woven polypropylene and polyester area rugs. **China** fell '
    f'{abs(chg("China"))}% to {fmt_usd(chn)}, while **Vietnam** grew {chg(VN)}% to {fmt_usd(vnm)} and **Thailand** doubled to '
    f'{fmt_usd(imp("Thailand"))}. **Egypt** ({fmt_usd(egy)}) and **Mexico** ({fmt_usd(imp("Mexico"))}) follow; hand-knotted rugs also come '
    f'from **Nepal** ({fmt_usd(imp("Nepal"))}), **Pakistan** ({fmt_usd(imp("Pakistan"))}) and **Afghanistan** ({fmt_usd(imp("Afghanistan"))}). '
    f'UN Comtrade shows just {fmt_usd(imp("Iran"))} from Iran, whose carpets are banned.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 '
    'tariffs from July 24, 2026, the lapse of Nepal\'s duty-free program on January 1, 2026 and the Canada Section 338 duty from August 22); '
    'they do not show what those changes did. Duty-collected figures are not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren\'t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit level, for '
    f'calendar years 2020–{Y}. Country names are shortened (Türkiye as Turkey, Viet Nam as Vietnam, Rep. of Korea as South Korea).'
)
ui['sources'] = [{'label': f'UN Comtrade (public API), United States imports, HS chapter 57 (retrieved {trade["retrievedAt"]})',
                  'url': 'https://comtradeplus.un.org/'}]

ia['seo'] = {
    'title': 'Rug & Carpet Tariffs by Country 2026 — India, Turkey, China, Vietnam, Egypt, Nepal (HTS Ch. 57) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on rugs and carpets by country: 14.5% for Indian hand-knotted wool rugs, 12.5% for Turkish '
    'machine-woven rugs, 10% for EU goods, 4.5% for Nepal and Afghanistan, up to 44.2% for Chinese tufted carpet, 50% Section 338 on Canadian '
    'tufted carpet.',
    'keywords': [
        'tariffs on rugs from india',
        'tariffs on turkish rugs',
        'china carpet import duty rates',
        'india tariff on carpets and other textile floor coverings',
        'turkey carpet import duties 2026',
        'nepal rug tariff',
        'hts heading 5703 tariffs',
        'axminster commercial woven tariff',
    ],
}
ia['intro'] = (
    'Chapter 57 base rates are modest — Free to 8% — so the **country of origin** decides most of the cost. Each cell below is the base rate '
    'for that product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+10% for India, Pakistan and the UK**, **+12.5% for Turkey, Egypt, Vietnam and Thailand**, **10% in total for the Netherlands, '
    'Belgium and the rest of the EU**, 12.5% in total for South Korea. **China adds 37.5%**. **Nepal and Afghanistan pay only the base rate** — '
    '4.5% on a hand-knotted wool rug. USMCA-qualifying goods from Mexico pay nothing; from Canada nothing except the **50% Section 338 duty on '
    'tufted carpet of 5703.39.20**, which no USMCA claim removes. Iranian carpets cannot be imported.'
)
ia['tradeYear'] = Y

# Key takeaways and FAQs
fc['keyTakeaways'] = [
    'Chapter 57 base rates run from Free to 8% and did not change in 2025–2026: hand-knotted wool rugs 4.5%, tufted wool and synthetic carpet 5.8%–6.7%, '
    'made-up machine-woven pile rugs Free.',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% for India and Pakistan, +12.5% for Turkey, Egypt, Vietnam and Thailand, '
    '10% in total for the EU. China pays +37.5% on every line.',
    'Nepal and Afghanistan are not among the 60 Section 301 economies, so their rugs pay only the base rate — but Nepal\'s duty-free program '
    'ended December 31, 2025.',
    'Carpets of Iranian origin are banned under the OFAC Iran sanctions (31 CFR 560.201) wherever they ship from; the calculator does not '
    'model the ban.',
    'Canadian tufted carpet of 5703.39.20 pays a 50% Section 338 duty even under USMCA; other USMCA rugs from Canada and Mexico pay nothing.',
    'The IEEPA duties (up to 54.5% on Indian rugs in late 2025) ended February 24, 2026; the 10% Section 122 surcharge ended July 23, 2026.',
    'Every rug sold for floor use must pass the CPSC flammability tests (16 CFR 1630/1631), with certificate data eFiled at entry since July '
    '8, 2026, and carry FTC fiber-content and origin labels.',
]
fc['faqs'] = [
    {
        'id': 'rug-hs-code',
        'question': 'What is the HS code (tariff code) for rugs and carpets?',
        'searchedAs': ['carpet hs code', 'rug hs code', 'tariff code for rug', 'carpet tariff code', 'hts code for rugs', 'hs code for rugs',
                       'area rug hs code', 'carpet hts'],
        'answer': 'Rugs and carpets are HTS Chapter 57, by construction: 5701 knotted (hand-knotted) rugs, 5702 woven rugs (kilims, dhurries, '
        'flatweaves, machine-woven area rugs, Wilton), 5703 tufted carpet, rugs, tiles and turf, 5704 felt, 5705 other floor coverings. The '
        'fiber of the pile then picks the 8- and 10-digit line. Base rates run from Free to 8%.',
        'link': '',
    },
    {
        'id': 'hand-knotted-hs-code',
        'question': 'What is the HS code for hand-knotted and hand-tufted rugs?',
        'searchedAs': ['hand knotted rug hs code', 'hand knotted carpet hs code', 'hand tufted rug hs code', 'hand tufted carpet hs code',
                       'hand knotted wool rug hs code', 'indian hand knotted carpets hs code', 'hand tufted carpet us hts code'],
        'answer': 'Hand-knotted wool rugs are 5701.10.90.00 (4.5%); hand-knotted rugs of silk, cotton or man-made fibers are 5701.90.10 '
        '(Free). Hand-tufted rugs made with a tufting gun are tufted carpet of 5703: wool 5703.10.80 (6%), nylon 5703.29.20 (6.7%), '
        'polyester or polypropylene 5703.39.20 (6%). Only tufts inserted by hand or a non-powered tool count as "hand-hooked" (5703.10.20, '
        '6%).',
        'link': '',
    },
    {
        'id': 'wool-jute-rug-hs-code',
        'question': 'What is the HS code for wool, jute and cotton rugs?',
        'searchedAs': ['wool rug hs code', 'wool carpet tariff code', 'jute rug hs code', 'cotton rug hs code', 'dhurrie hs code',
                       'kilim hs code', 'bath rug hs code'],
        'answer': 'It depends on construction. Kilims, soumaks and similar hand-woven rugs are 5702.10 (Free). Woven jute rugs are 5702.39.10 '
        'or 5702.49.15 (Free). Flat-woven cotton rugs and dhurries are 5702.99.05 (hand-woven) or 5702.99.15 (6.8%). Woven wool rugs are '
        '5702.31, 5702.41 or 5702.91 (Free to 8%); tufted wool rugs 5703.10 (6%). A tufted cotton bath rug is 5703.90.00 (3.8%).',
        'link': '',
    },
    {
        'id': 'turf-tiles-hs-code',
        'question': 'What is the HS code for carpet tiles and artificial turf?',
        'searchedAs': ['carpet tiles hs code', 'nylon carpet tiles hs code', 'artificial turf hs code', 'artificial grass hs code',
                       'artificial grass tariff code', 'astro turf hs code'],
        'answer': 'Tufted carpet tiles are 5703.29.20.10 (nylon, 6.7%) or 5703.39.20.30 (other man-made fibers, 6%), for pieces of 5.25 m² '
        'or less. Artificial turf is 5703.21.00 (nylon, 6.7%) or 5703.31.00 (other man-made fibers, 6%). Felt tiles are 5704 (4.7% up to '
        '0.3 m², otherwise Free). From China add 37.5%.',
        'link': '',
    },
    {
        'id': 'rugs-from-india',
        'question': 'What is the tariff on rugs from India?',
        'searchedAs': ['tariffs on rugs from india', 'tariff on rug from india to usa', 'are there tariffs on rugs from india',
                       'india carpet tariff', 'tariffs on indian rugs', 'import rugs from india'],
        'answer': 'Indian rugs pay the base rate plus 10% Section 301 (9903.05.44) since July 24, 2026: 14.5% on a hand-knotted wool rug, 16% '
        'on a hand-tufted wool rug, 16.8% on a cotton dhurrie, 10% on Free lines such as kilims and made-up woven rugs. The IEEPA duties — '
        '50% from August 27, 2025 — ended in February 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'rugs-from-turkey',
        'question': 'What is the tariff on rugs from Turkey?',
        'searchedAs': ['tariffs on rugs from turkey', 'tariffs on turkish rugs', 'import rugs from turkey', 'turkish rug tariff'],
        'answer': 'Turkish goods pay the base rate plus 12.5% (9903.05.79): 12.5% on machine-woven polypropylene or polyester area rugs '
        '(5702.42, Free), 18.5% on tufted polypropylene carpet, 17% on hand-knotted wool rugs. Turkey has no Section 301 exception list. The '
        '15% IEEPA duty ended February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'rugs-from-china',
        'question': 'What is the tariff on carpets and rugs from China?',
        'searchedAs': ['carpet from china', 'import carpet from china', 'carpet made in china', 'china carpet import duty rates'],
        'answer': 'Every Chapter 57 line from China pays 25% under Section 301 List 3 (9903.88.03) plus 12.5% under the 2026 action '
        '(9903.05.31), on top of the base rate: 44.2% on tufted nylon carpet and tiles, 43.5% on polypropylene turf, 42% on hand-knotted wool '
        'rugs, 37.5% on Free lines. No product exclusion covers a rug. The IEEPA duties ended February 24, 2026.',
        'link': 'tariff-updates',
    },
    {
        'id': 'persian-rugs-illegal',
        'question': 'Are Persian rugs illegal in the U.S.?',
        'searchedAs': ['are persian rugs illegal in the us', 'are persian rugs banned', 'why are persian rugs illegal in america',
                       'persian rug embargo', 'iranian carpets sanctions', 'can you import rugs from iran', 'can you bring persian rug from iran to us'],
        'answer': 'Owning or reselling a Persian rug already in the U.S. is not illegal, but importing a carpet of Iranian origin is: the Iranian '
        'Transactions and Sanctions Regulations (31 CFR 560.201) bar Iranian-origin goods, from Iran or a third country. The general license '
        'that allowed Iranian carpets from January 2016 ended August 6, 2018. Used rugs in an arriving traveler\'s household effects are '
        'exempt (31 CFR 560.524). "Persian-style" rugs knotted in India, Pakistan, Nepal or Turkey are not Iranian.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'rug-tariffs-2026',
        'question': 'Are there tariffs on rugs in 2026?',
        'searchedAs': ['are there tariffs on rugs', 'tariffs on rugs', 'carpet tariffs', 'rug tariffs 2026', 'carpet prices tariffs'],
        'answer': 'Yes. On top of base rates of Free to 8%, the 2026 Section 301 tariff adds 10% or 12.5% for 60 economies (10% in total for '
        'the EU, 12.5% for Korea), China pays 37.5% and Brazil 37.5%. Nepal and Afghanistan pay only the base rate. The IEEPA tariffs ended '
        'February 24 and the Section 122 surcharge July 23, 2026.',
        'link': 'tariff-updates',
    },
    {
        'id': 'carpet-flammability',
        'question': 'What are the flammability requirements for carpets and rugs?',
        'searchedAs': ['carpet flammability standards', 'what are the flammability requirements for carpets', 'flammability standard doc ff 1 70',
                       'ff 2 70 flammability', 'cfr 1630 ff 1 70', 'carpet flammability test'],
        'answer': 'Carpets and rugs must pass the CPSC methenamine pill test: 16 CFR 1630 (FF 1-70) for rugs with a side over 6 ft and more '
        'than 24 sq ft, 16 CFR 1631 (FF 2-70) for smaller ones — 7 of 8 specimens must pass. A small rug that fails must carry a permanent '
        '"FLAMMABLE" warning label. Importers certify in a General Certificate of Conformity, eFiled at entry since July 8, 2026.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'rug-country-of-origin',
        'question': 'How is the country of origin of a rug determined?',
        'searchedAs': ['rug country of origin', 'carpet country of origin'],
        'answer': 'Under 19 CFR 102.21(e), a carpet or rug of 5701–5705 originates where it was knotted, woven or tufted from yarn. Washing, '
        'clipping, binding or backing in another country does not change it. The origin sets the extra duty and must be on the CBP marking '
        'and the FTC label.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'carpet-samples',
        'question': 'Do carpet samples pay duty?',
        'searchedAs': ['carpet samples tariff code', 'carpet sample hs code', 'hs code for rug sample'],
        'answer': 'Samples worth $1 or less each, or marked, torn or perforated so they cannot be sold, and used only to solicit orders, enter '
        'Free under 9811.00.60 — which also takes them outside the Section 301, China and Canada extra duties. Usable rugs and full tiles sent '
        'as samples are classified in Chapter 57.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'rug-importers-usa',
        'question': 'Where does the U.S. import rugs from?',
        'searchedAs': ['rug importers in usa', 'rug imports', 'rugs from india', 'rugs from turkey'],
        'answer': f'In {Y} the U.S. imported {fmt_usd(total)} of Chapter 57 goods: India {fmt_usd(ind)} ({share(ind)}%), Turkey '
        f'{fmt_usd(tur)} ({share(tur)}%), China {fmt_usd(chn)}, Vietnam {fmt_usd(vnm)}, Egypt {fmt_usd(egy)} and Mexico '
        f'{fmt_usd(imp("Mexico"))}. Machine-woven pile area rugs (5702.42) were the largest product at {fmt_usd(h6("570242"))}.',
        'link': 'understand-industry',
    },
    {
        'id': 'nepal-afghan-rugs',
        'question': 'What is the tariff on rugs from Nepal, Pakistan and Afghanistan?',
        'searchedAs': ['nepal rug tariff', 'pakistan rug', 'afghan rugs'],
        'answer': 'Nepal and Afghanistan are not among the 60 Section 301 economies, so a hand-knotted wool rug pays only the 4.5% base rate '
        '(Nepal\'s duty-free program expired December 31, 2025). Pakistan pays +10%: 14.5% on a hand-knotted wool rug, 10% on Free lines.',
        'link': 'industry-areas',
    },
]

# Truncated generator labels copied into the trade tables (batch-1 quirk).
for c in ui['byCountry']:
    if c.get('mainHeading') in GROUP_LABELS:
        c['mainHeadingLabel'] = GROUP_LABELS[c['mainHeading']][0]
for x in ui['byLine']:
    if 'searchText' in x:
        for h, lab in ORIG_LABELS.items():
            x['searchText'] = x['searchText'].replace(lab.lower(), GROUP_LABELS[h][0].lower()).replace(lab, GROUP_LABELS[h][0])
for s_ in ov['stats']:
    if s_.get('label', '').startswith('India + Türkiye'):
        s_['label'] = 'India + Turkey share'
for s_ in ui['stats']:
    if 'Türkiye' in s_.get('label', ''):
        s_['label'] = s_['label'].replace('Türkiye', 'Turkey')
    if s_.get('label') == 'Largest product':
        s_['note'] = 'Machine-woven pile rugs of man-made fibers, made up (5702.42)'
d['asOf'] = TODAY
