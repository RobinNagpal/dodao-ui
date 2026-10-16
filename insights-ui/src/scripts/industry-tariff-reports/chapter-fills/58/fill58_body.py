# Body of fill58.py (exec'd there; shares its globals). Split only to keep the files readable.

# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
NEW = {
    'hts-ch58': {
        'id': 'hts-ch58',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 58',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 58: Special Woven Fabrics; Tufted Textile '
        'Fabrics; Lace; Tapestries; Trimmings; Embroidery (notes and additional U.S. notes 1–5)',
        'signed': None,
        'published': '2026-10-07',
        'url': CH58,
    },
    'fr-2010-23350': {
        'id': 'fr-2010-23350',
        'publisher': 'Federal Register',
        'citation': '75 FR 56982',
        'document': 'Notice (Commerce, ITA)',
        'title': "Narrow Woven Ribbons With Woven Selvedge From Taiwan and the People's Republic of China: Amended Antidumping Duty Orders "
        '(scope, HTS numbers and order rates: Taiwan all-others 4.37%, China-wide 247.65%)',
        'signed': None,
        'published': '2010-09-17',
        'url': 'https://www.federalregister.gov/documents/2010/09/17/2010-23350/narrow-woven-ribbons-with-woven-selvedge-from-taiwan-and-the-peoples-republic-of-china-amended',
    },
    'fr-2024-23846': {
        'id': 'fr-2024-23846',
        'publisher': 'Federal Register',
        'citation': '89 FR 83458',
        'document': 'Notice (Commerce, ITA)',
        'title': "Narrow Woven Ribbons With Woven Selvedge From the People's Republic of China: Final Results of Countervailing Duty "
        'Administrative Review; 2022',
        'signed': None,
        'published': '2024-10-16',
        'url': 'https://www.federalregister.gov/documents/2024/10/16/2024-23846/narrow-woven-ribbons-with-woven-selvedge-from-the-peoples-republic-of-china-final-results-of',
    },
    'fr-2026-12863': {
        'id': 'fr-2026-12863',
        'publisher': 'Federal Register',
        'citation': '91 FR 38671',
        'document': 'Notice (Commerce, ITA)',
        'title': 'Notice of Scope Ruling Applications Filed in Antidumping and Countervailing Duty Proceedings (April 2026: blanket '
        'binding, narrow woven ribbons from China)',
        'signed': None,
        'published': '2026-06-26',
        'url': 'https://www.federalregister.gov/documents/2026/06/26/2026-12863/notice-of-scope-ruling-applications-filed-in-antidumping-and-countervailing-duty-proceedings',
    },
    'fr-2026-17810': {
        'id': 'fr-2026-17810',
        'publisher': 'Federal Register',
        'citation': '91 FR 56106',
        'document': 'Notice (Commerce, ITA)',
        'title': 'Antidumping or Countervailing Duty Order, Finding, or Suspended Investigation; Opportunity To Request Administrative '
        'Review (September 2026 anniversary month: narrow woven ribbons from China and Taiwan)',
        'signed': None,
        'published': '2026-09-01',
        'url': 'https://www.federalregister.gov/documents/2026/09/01/2026-17810/antidumping-or-countervailing-duty-order-finding-or-suspended-investigation-opportunity-to-request',
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


SHORT = 'Ribbons, Lace, Labels & Embroidery'
d['chapter']['title'] = 'Special Woven Fabrics; Tufted Textile Fabrics; Lace; Tapestries; Trimmings; Embroidery'

GROUP_LABELS = {
    '5801': ('Woven pile and chenille fabrics: velvet, velveteen, plush, corduroy, chenille', 'Velvet, corduroy & chenille'),
    '5802': ('Terry toweling fabric and tufted textile fabrics', 'Terry & tufted fabrics'),
    '5803': ('Gauze (leno-weave fabric), other than narrow fabrics', 'Gauze'),
    '5804': ('Tulle and other net fabrics; lace in the piece, in strips or in motifs', 'Tulle, net & lace'),
    '5805': ('Hand-woven and needle-worked tapestries (Gobelins, Aubusson, petit point, cross stitch)', 'Tapestries'),
    '5806': ('Narrow woven fabrics: ribbons, tapes, webbing, hook-and-loop and elastic tapes', 'Ribbons & narrow fabrics'),
    '5807': ('Textile labels and badges, not embroidered: woven and printed labels', 'Woven & printed labels'),
    '5808': ('Braids in the piece, ornamental trimmings, tassels and pompons', 'Braids & trimmings'),
    '5809': ('Woven fabrics of metal thread or metalized yarn', 'Metal-thread fabrics'),
    '5810': ('Embroidery in the piece, in strips or in motifs: embroidered fabric, patches and badges', 'Embroidery & patches'),
    '5811': ('Quilted textile products in the piece', 'Quilted fabrics'),
}
ORIG_LABELS = {g['heading']: g['label'] for g in d['overview']['productGroups']}

# ---------------------------------------------------------------------------------------------------
# Shared facts (checked against the generated matrix below)
# ---------------------------------------------------------------------------------------------------
rows = {r['hts']: r for r in d['overview']['rateTable']['rows'] if r.get('hts')}
LEAVES = [ln['hts'] for ln in d['tariffUpdates']['lines']]
N_LINES = len(LEAVES)
assert N_LINES == 111, N_LINES
CA338 = '5806.32.20'
EMB_NOTE = (
    'Embroidery of 5810.91–5810.99 has its rate in additional U.S. notes 1–5 to Chapter 58 (Free, 4.2% or 7.4%), "but in the case of '
    'embroidery in the piece not less than the rate which would apply to such product if not embroidered"'
)
INFO = (
    'Labels and badges of 5807 that are informational materials can be entered under 9903.05.92 and pay none of this duty; ordinary '
    'garment labels are entered without it.'
)
NO_52B = 'No Chapter 58 line is on the general exemption list (note 52(b)). '
AD_TEXT = (
    'Narrow woven ribbons with woven selvedge (up to 12 cm wide, of man-made fibers; 5806.32.10.20–.60 and other numbers named in the '
    'scope) from China and Taiwan also owe antidumping duty, and from China countervailing duty, set by exporter.'
)

for e in d['overview']['spiLegend']:
    if e['code'] == 'E*':
        e['name'] = 'Caribbean Basin Economic Recovery Act (CBERA), some beneficiary countries excluded'

# ---------------------------------------------------------------------------------------------------
# Tariff updates: in-effect texts and changes
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 58: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'Ribbon, Lace & Embroidery Tariff Updates 2026: HTS Chapter 58 — Section 301, China, Ribbon Antidumping | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 58 fabrics and trimmings since January 2025: base rates unchanged, IEEPA and Section '
    '122 duties ended, the 2026 Section 301 tariffs (India +10%, Vietnam +12.5%, EU and Taiwan 10%), China +37.5%, Canada Section 338 '
    'on seat-belt webbing, and the ribbon antidumping orders on China and Taiwan — with Federal Register citations.',
    'keywords': [
        'hts chapter 58 tariff updates',
        'hts chapter 58 import duty rates',
        'china section 301 tariff on chapter 58',
        'section 301 textile surcharges',
        'narrow woven ribbon anti dumping',
        'narrow woven ribbons with woven selvedge',
        'section 301 duties on embroidery',
        'woven pile and chenille fabrics duty',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 58 base rate changed**: all 111 lines carry the same General, Special and Column 2 '
    'rates, from Free to 20.2%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached ribbons, lace, labels and pile fabrics from every '
    'country — 20% for Taiwan and Vietnam and 15% in total for the EU from August 7, 2025, 50% for India from August 27, and up to 145% for '
    'China in April–May 2025, on top of its Section 301 list duties. The IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 '
    'surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff**: +10% '
    'for India and the UK, +12.5% for Vietnam, Turkey and Thailand, 10% in total for the EU and Taiwan, 12.5% in total for Japan and South '
    'Korea. China still pays the **25% List 3 duty** on 106 of the 111 lines (7.5% List 4A on man-made-fiber chenille and weft pile). Since '
    '**August 22, 2026** Canadian narrow woven fabric of 5806.32.20, such as seat-belt webbing, pays a **50% Section 338 duty**, even under '
    'USMCA. The antidumping orders on narrow woven ribbons from China and Taiwan and the countervailing order on China remain in force; on '
    'September 4, 2026 Commerce set an 83.67% rate for two Taiwanese exporters.'
)
tu['scope'] = (
    'Measures that reach Chapter 58 from any country: the 2026 Section 301 tariffs on 60 economies with their exemptions (informational '
    'materials, note 52(i) CAFTA-DR textiles, the note 52(j) country lists), the Brazil Section 301 tariff, the China Section 301 List 3 and '
    'List 4A duties, the Canada Section 338 duty on 5806.32.20, the Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and Section 122 '
    'duties that have ended. The antidumping and countervailing duty orders on narrow woven ribbons are listed as reference entries. No '
    'Section 232 product action lists a Chapter 58 line. For the rate each supplier pays, see Rates by country.'
)

IN_EFFECT_TEXT = {
    'China': (
        'Three Section 301 duties, two at a time: +12.5% under the 2026 action (9903.05.31) on every line, plus +25% under List 3 '
        '(9903.88.03) on 106 lines or +7.5% under List 4A (9903.88.15) on man-made-fiber other weft pile and chenille fabric (5801.33, '
        '5801.36). Man-made-fiber uncut weft pile and corduroy (5801.31, 5801.32) are on List 4B, which is suspended, so they pay only '
        'the 12.5%. None of the exclusions in force (U.S. notes 20(vvv) and 20(www), through November 9, 2026) covers a Chapter 58 product; '
        'the older exclusions for seat-belt webbing (5806.32.20.00) and polyester-nylon embroidery fabric (5810.92.90.80) have expired. For '
        'embroidery whose rate is taken from the unembroidered fabric, notes 20(z)–20(cc) (9903.88.21–9903.88.24) lift the List 3 duty when '
        'that fabric is itself on a China list. ' + INFO + ' The List 3 or 4A duty stays even then. The IEEPA duties on China ended February '
        '24, 2026, and USTR\'s four-year review kept List 3 and List 4A in place.',
        'Chinese polyester ribbon pays 43.5%, woven labels 45.4%, man-made-fiber velvet 54.7%, cotton corduroy up to 57.7%, chenille 29.8%, '
        'embroidered badges 41.7%. ' + AD_TEXT,
    ),
    'Taiwan': (
        'For Taiwanese goods whose base rate is under 10%, the total is 10% (9903.05.76); at or above 10%, nothing is added (9903.05.75, '
        'U.S. note 52(k)). ' + NO_52B + 'Taiwan\'s exception list in note 52(j) names no Chapter 58 line. ' + INFO + ' The 20% IEEPA '
        'reciprocal duty ended February 24, 2026; the U.S.–Taiwan agreement implemented on May 28, 2026 changed Section 232 rates only.',
        'Taiwanese polyester ribbon and narrow fabric (6%–8.4%) pay 10% in total; pile fabrics with a base rate of 10% or more pay that rate. '
        'Ribbons within the antidumping order also owe a cash deposit — 4.37% for most exporters, 83.67% for Lace Fashions and Trydent since '
        'September 4, 2026.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + 'Vietnam has no exception list. ' + INFO + ' The 20% IEEPA reciprocal duty ended '
        'February 24, 2026.',
        'Vietnamese ribbon pays 18.5%, hook-and-loop tape 19.5%, woven labels 20.4%, cotton gauze 12.5%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + 'India has no exception list. ' + INFO + ' The IEEPA duties on India — 25% reciprocal '
        'from August 7, 2025 plus 25% from August 27, 2025 — ended in February 2026.',
        'Indian embroidered cotton fabric pays 10% (more in the piece if the plain fabric\'s rate is higher), embroidered man-made-fiber '
        'badges 14.2%, cotton velvet 28.5%, hand-made lace 23.2%, tapestries 10%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO_52B + 'Mexico is not subject '
        'to the Canada Section 338 duties. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying trimmings, labels and embroidery from Mexico pay nothing; non-qualifying goods pay the base rate plus 10%.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10%, nothing is added (9903.05.38, U.S. note '
        '52(k)). ' + NO_52B + 'The EU exception list (note 52(j)(2)) names no Chapter 58 line. ' + INFO + ' This replaced the 15%-in-total '
        'IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'Italian, German and French ribbon, labels and cotton lace pay 10% of value; man-made-fiber lace (12%) and Italian velvet (17.2%–18.5%) '
        'pay their base rate only.',
    ),
    'Türkiye (Turkey)': (
        'Base rate + 12.5% (9903.05.79). ' + NO_52B + 'Turkey has no exception list. The 15% IEEPA reciprocal duty ended February 24, '
        '2026.',
        'Turkish chenille upholstery fabric pays 22.3%, man-made-fiber velvet 29.7%, quilted fabric 20.5%.',
    ),
    'South Korea': (
        'Korean goods pay 12.5% in total in place of the base rate when the base rate is lower (9903.05.71, note 52(k)). With a KORUS claim '
        'every Chapter 58 base rate is Free, so Korean goods pay 12.5%. ' + NO_52B + 'Korea has no exception list. The 15% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'Korean ribbon, narrow fabric and pile fabric pay 12.5% of value — $1,250 on $10,000; labels entered as informational materials '
        'pay nothing.',
    ),
    'Japan': (
        'Japanese goods pay 12.5% in total in place of the base rate when the base rate is lower (9903.05.49); at or above 12.5%, the base '
        'rate alone (9903.05.48, note 52(k)). ' + NO_52B + 'Japan has no exception list naming a Chapter 58 line. The 15%-in-total IEEPA rate '
        'ended February 24, 2026.',
        'Japanese lace and ribbon pay 12.5%; velvet and pile fabrics at 14%–20.2% pay their base rate.',
    ),
    'Canada': (
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 '
        'duty (+50%, from August 22, 2026, 9903.03.14) applies to 5806.32.20 — narrow woven fabrics of man-made fibers other than ribbons, '
        'such as seat-belt webbing — and U.S. note 51(a) says it applies even when USMCA is claimed. The September 15, 2026 list revisions '
        'changed no Chapter 58 entry. The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'USMCA-qualifying Canadian webbing of 5806.32.20 pays 50%; non-qualifying, 66.2% (6.2% + 10% + 50%). Other Canadian goods — mostly '
        'quilted fabric — pay nothing under USMCA.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + 'Thailand has no exception list. The 19% IEEPA reciprocal duty ended February 24, '
        '2026.',
        'Thai embroidered man-made-fiber fabric pays 19.9% (more in the piece if the plain fabric\'s rate is higher), embroidered badges '
        '16.7%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'The UK exception list (note 52(j)(1)) has no Chapter 58 line. The 10% IEEPA '
        'reciprocal duty ended February 24, 2026.',
        'British machine-made cotton or man-made-fiber lace pays 18%–22%, woven labels 17.9%, ornamental trimmings and tassels 13.9%.',
    ),
    'Dominican Republic': (
        'Base rate + 12.5% (9903.05.34), but U.S. note 52(i) (9903.05.95) removes it from textile goods entered free of duty under CAFTA-DR '
        '(SPI P) — every Chapter 58 line with a P rate. The 22 lines whose General rate is already Free carry no P rate, so they keep the '
        '12.5%. The 10% IEEPA baseline duty ended February 24, 2026.',
        'Dominican embroidery, labels and narrow fabrics entered under CAFTA-DR pay nothing; Free-rate goods such as tapestries pay 12.5%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 58 line; informational materials are exempt from both (9903.05.09, '
        '9903.05.92). The 40% IEEPA duty on Brazil (Executive Order 14323) ended February 24, 2026.',
        'Brazilian ribbon pays 43.5%, woven labels 45.4%, lace 49.5%.',
    ),
}
OTHER_TEXT = (
    'Rates by country: Cambodia, Indonesia, Pakistan, Bangladesh and Honduras +10%, the Philippines and Israel +12.5%, Switzerland 12.5% in '
    'total. ' + NO_52B + 'Three country exception lists in U.S. note 52(j) cover **every Chapter 58 subheading**: Jordan (9903.06.20), and '
    'Guatemala (9903.06.06) and El Salvador (9903.06.09) when CAFTA-DR is claimed. Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods of '
    'Costa Rica, Honduras and Nicaragua entered duty-free under SPI P. ' + INFO + ' Countries outside the 60 economies pay only the base rate.',
    'Jordanian goods and Guatemalan or Salvadoran goods entered under CAFTA-DR pay nothing extra; Honduran embroidery entered under '
    'CAFTA-DR pays nothing; Cambodian or Pakistani ribbon pays 16%.',
)
CHECK = {
    'Brazil': ('fr-2026-14542', 'csms-69302472', 'eo-14323'),
    'China': ('cbp-ieepa-faq', 'csms-69326983', 'fr-2010-21975', 'fr-2010-21978', 'fr-2022-05634'),
    'Taiwan': ('cbp-ieepa-faq', 'csms-69326983', 'fr-2026-10571', 'fr-2010-21975', 'fr-2010-23350', 'fr-2026-18182'),
    'Dominican Republic': ('csms-69326983',),
}
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Cambodia, Indonesia, Pakistan, Honduras, Jordan, Guatemala, El Salvador)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
        for sid in ('csms-69326983',):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    else:
        raise SystemExit(f'no inEffect text for {key}')
    for sid in CHECK.get(key, ()):
        if sid not in e['sourceIds']:
            e['sourceIds'].insert(-1, sid)
    if e['country'] == 'European Union':
        e['measure'] = 'Section 301 tariff (forced-labor investigations), EU rate'
    elif e['country'] == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (5806.32.20, USMCA or not)'
        e['now'] = '+10% (non-USMCA); +50% on 5806.32.20, USMCA or not'
    elif e['country'] == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus List 3 or List 4A'
        e['now'] = '+37.5% (List 3 lines), +20% (List 4A lines), +12.5% (5801.31, 5801.32)'
    elif e['country'] == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 forced-labor action'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (forced-labor investigations)'

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty takes effect on 5806.32.20 narrow fabrics',
        '50% on listed products of Canada after a 3-day suspension lapsed. One Chapter 58 subheading is on the motor-vehicle list '
        '(9903.03.14): 5806.32.20, narrow woven fabrics of man-made fibers other than ribbons — seat-belt webbing among them. Unlike the '
        'Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 58',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), or 10% in total for the EU and Taiwan and 12.5% for Japan and '
        'South Korea when the base rate is lower. No Chapter 58 line is on the general exemption list (note 52(b)). Exempt: labels and '
        'badges of 5807 that are informational materials (9903.05.92); CAFTA-DR textile goods entered duty-free under SPI P (note 52(i)); '
        'every Chapter 58 subheading for Jordan, and for Guatemala and El Salvador under CAFTA-DR (note 52(j)); USMCA-qualifying goods from '
        'Canada and Mexico (9903.05.93, 9903.05.94).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 58 line is on the Brazil exemption list (U.S. note 50(a)(ii)); informational '
        'materials are exempt (9903.05.09). From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top.',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from '
        'January 1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58), lifted for '
        'CAFTA-DR textile goods entered under SPI P (note 52(i)).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        # The generator dates pending items by the earlier notice; the action was set in the December 29, 2025 implementation notice.
        c['date'], c['dateLabel'] = '2025-12-29', 'Announced'
    if c['id'] == 'base-rates':
        c['title'] = 'No Chapter 58 base-rate changes'
        c['detail'] = (
            'All 111 Chapter 58 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, '
            'and no line was added, split or renumbered. The embroidery rates of additional U.S. notes 1–5 are unchanged too.'
        )
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')


def ch(id_, type_, date, label, title, detail, before, now, countries, ids):
    return {
        'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail,
        'before': before, 'now': now, 'countries': countries, 'sourceIds': ids,
    }


EXTRA_CHANGES = [
    ch('cn-301-continue', 'reference', '2026-10-07', 'Published', 'China Section 301 List 3 and List 4A continue after the four-year review',
       'USTR announced that the 2018–2019 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
       'industries asked for them to continue. For Chapter 58 this keeps +25% (List 3) on 106 lines and +7.5% (List 4A) on 5801.33 and '
       '5801.36.', '+25% / +7.5%', '+25% / +7.5%', 'China', ['fr-2026-20510']),
    ch('ca-338-scope', 'reference', '2026-09-15', 'Effective', 'Canada Section 338 lists revised; Chapter 58 entry unchanged',
       'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. 5806.32.20 stays on the '
       '9903.03.14 list, and no other Chapter 58 provision was added.', None, None, 'Canada',
       ['procl-11064', 'procl-11065', 'csms-69851916', 'hts-now']),
    ch('ad-ribbons-tw-2026', 'reference', '2026-09-04', 'Published', 'Antidumping review: narrow woven ribbons from Taiwan at 83.67%',
       'Commerce\'s final results for September 2023–August 2024 set an 83.67% dumping margin for Lace Fashions Industrial Co. and Trydent '
       'Co., collected as the cash deposit on their entries from September 4, 2026. Other Taiwanese exporters keep their earlier rates, or '
       'the 4.37% all-others rate.', '4.37% (all others)', '83.67% (two exporters)', 'Taiwan', ['fr-2026-18182', 'fr-2010-23350']),
    ch('ad-ribbons-review-window', 'reference', '2026-09-01', 'Published', 'Ribbon orders open for annual reviews',
       'Commerce opened the September anniversary window to request administrative reviews of the China and Taiwan antidumping orders '
       '(September 2025–August 2026 entries) and the China countervailing order (calendar 2025). Until a review is completed, the cash '
       'deposit rates in force continue.', None, None, 'China, Taiwan', ['fr-2026-17810']),
    ch('ad-ribbons-scope-binding', 'reference', '2026-06-26', 'Published', 'Scope ruling requested for blanket binding from China',
       'Commerce published a scope ruling application filed April 2, 2026 asking whether blanket binding — a polyester-cotton woven tape '
       'under 30 cm wide with melted, sealed edges, sold in 3-yard lengths — is covered by the China ribbon orders. The written scope, '
       'not the HTS number, decides coverage.', None, None, 'China', ['fr-2026-12863']),
    ch('tw-art', 'reference', '2026-05-28', 'Published', 'U.S.–Taiwan trade agreement implemented for Section 232 goods only',
       'Commerce and USTR implemented tariff elements of the Taiwan agreements signed January 15 and February 12, 2026 — Section 232 '
       'rates such as auto parts. They set no Chapter 58 rate; Taiwanese Chapter 58 goods pay the 2026 Section 301 rate of 10% in total.',
       None, None, 'Taiwan', ['fr-2026-10571']),
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    ch('cpsc-efiling', 'reference', '2026-07-08', 'Effective', 'CPSC certificate data now filed electronically at entry',
       'Fabric for clothing must meet the CPSC clothing-textile flammability standard (16 CFR 1610). Where a certificate of compliance is '
       'required, its data must be filed electronically with CBP at entry from July 8, 2026 (January 8, 2027 for goods entered from a '
       'foreign-trade zone). No duty changes.', 'Certificate on request', 'eFiled with the entry', 'All',
       ['fr-2024-30826', 'fr-2025-18521']),
    ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
       'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on '
       'Mexican and Canadian goods — but not the Section 338 duty on 5806.32.20.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 58 subheading was on the product exemption list. '
       'USMCA-qualifying goods from Canada and Mexico and CAFTA-DR textile goods were exempt.',
       'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'csms-67844987', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
       'Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for '
       'goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are '
       'no longer in effect.', 'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    ch('india-oil-end', 'extraDuty', '2026-02-07', 'Effective', "India's extra 25% IEEPA duty removed",
       'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% reciprocal '
       'rate on India ended with the other IEEPA duties on February 24.', '+50%', '+25% (until February 24, 2026)', 'India',
       ['eo-14384']),
    ch('cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
       'February 24, 2026.', '+20%', '+10% (ended)', 'China', ['eo-14357']),
    ch('india-oil', 'extraDuty', '2025-08-27', 'Effective', 'Extra 25% on products of India',
       'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 (EO '
       '14326): 50% in all on Indian embroidery, lace and ribbon, on top of the base rate. Ended February 7, 2026.', '+25%',
       '+50% (ended)', 'India', ['eo-14329', 'eo-14326']),
    ch('country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country reciprocal rates replace the 10% baseline',
       'Executive Order 14326 set country rates for goods entered from August 7, 2025: Taiwan and Vietnam +20%, Thailand +19%, Turkey and '
       'South Korea +15%, India +25%, the UK +10%; EU goods with a column 1 rate under 15% paid 15% in total (9903.02.20), as Japanese '
       'goods did from September. Ended February 24, 2026.', '+10%', '+10% to +25% (ended)', 'Listed countries, European Union',
       ['eo-14326', 'hts-now']),
    ch('br-ieepa', 'extraDuty', '2025-08-06', 'Effective', 'Additional 40% IEEPA duty on products of Brazil',
       'Executive Order 14323 added 40% on Brazilian goods on top of the 10% reciprocal duty. Ended February 24, 2026; replaced from July '
       '22, 2026 by the 25% Brazil Section 301 tariff.', '+10%', '+50% (ended)', 'Brazil', ['eo-14323']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', '+25%', '+35% (ended)',
       'Canada', ['eo-14325']),
    ch('cn-reciprocal-10', 'extraDuty', '2025-05-14', 'Effective', 'China reciprocal duty cut from 125% to 10%',
       'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese polyester '
       'ribbon then paid 6% + 25% (List 3) + 20% + 10% = 61% until November 9, 2025. Ended February 24, 2026.', '+125%', '+10% (ended)',
       'China', ['eo-14298']),
    ch('cn-125', 'extraDuty', '2025-04-10', 'Effective', 'China reciprocal duty raised to 125%',
       'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025. With the 20% fentanyl duty and the '
       '25% List 3 duty, Chinese polyester ribbon paid 176% until May 13, 2025.', None, '+125% (ended)', 'China', ['eo-14266']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 58 product was '
       'exempt. Ended February 24, 2026.', 'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257']),
    ch('cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on '
       'top of the List 3 or 4A duty. Ended February 24, 2026.', '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', 'None',
       '+25% (ended)', 'Mexico', ['eo-14194']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
       'None', '+25% (ended)', 'Canada', ['eo-14193']),
    ch('cvd-ribbons-cn-2024', 'reference', '2024-10-16', 'Published', 'Countervailing duty review: ribbons from China at 165.52%',
       'In its latest completed countervailing duty review (calendar 2022), Commerce set a 165.52% subsidy rate for Weifang Chenrui '
       'Textile and Xiamen Lude Ribbons and Bows. The countervailing order (2010) set 1.56% for all others.', None,
       '165.52% (two exporters)', 'China', ['fr-2024-23846', 'fr-2010-21978']),
    ch('ad-ribbons', 'reference', '2022-03-17', 'Published', 'Antidumping and countervailing orders on narrow woven ribbons continued',
       'After the second five-year (sunset) reviews, Commerce continued the China and Taiwan antidumping orders and the China '
       'countervailing order on narrow woven ribbons with woven selvedge. The next sunset review is due to start by early 2027.', None,
       'Continued', 'China, Taiwan', ['fr-2022-05634']),
    ch('cn-list4a', 'extraDuty', '2020-02-14', 'Effective', 'China List 4A duty cut to 7.5%',
       'The List 4A duty (9903.88.15), in force from September 1, 2019 at 15%, was cut to 7.5%. In Chapter 58 List 4A covers man-made-fiber '
       'other weft pile fabric (5801.33) and chenille (5801.36). List 4B, which names 5801.31 and 5801.32, was suspended and never '
       'collected.', '+15%', '+7.5%', 'China', ['fr-2020-00904', 'fr-2019-17865']),
    ch('cn-list3-25', 'extraDuty', '2019-05-10', 'Effective', 'China List 3 duty raised to 25%',
       'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. List 3 covers 68 of the 72 Chapter 58 subheadings, and the rate has '
       'applied ever since.', '+10%', '+25%', 'China', ['fr-2019-09681']),
    ch('cn-list3', 'extraDuty', '2018-09-24', 'Effective', 'China Section 301 List 3 reaches ribbons, lace, labels and embroidery',
       'The third China Section 301 list put +10% on almost every Chapter 58 subheading — pile fabrics, terry, gauze, tulle and lace, '
       'tapestries, narrow fabrics, labels, trimmings, metal-thread fabric, embroidery and quilted fabric.', 'None', '+10%', 'China',
       ['fr-2018-20610']),
    ch('ad-ribbons-orders', 'reference', '2010-09-01', 'Published', 'Antidumping and countervailing orders on narrow woven ribbons',
       'Commerce issued antidumping orders on narrow woven ribbons with woven selvedge from China (China-wide rate 247.65%) and Taiwan '
       '(4.37% all others), and a countervailing order on China (1.56% all others), after the ITC found a threat of material injury. The '
       'scope covers ribbons up to 12 cm wide of man-made fibers, metal thread or metalized yarn, listed under 5806.32.10.20, .30, .50 and '
       '.60, and also 5806.31, 5806.32.20, 5806.39, 5808.90, 5810.91, 5810.99.90 and Chapter 59 and 63 numbers.', None,
       'Orders issued', 'China, Taiwan', ['fr-2010-21975', 'fr-2010-21978', 'fr-2010-23350']),
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)
add_sources(tu, sorted({s for c in tu['changes'] for s in c['sourceIds']} | {s for e in tu['inEffect'] for s in e['sourceIds']}))
stats = [s for s in tu['stats'] if s['label'] != 'IEEPA duties']
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
stats.append({'label': 'AD/CVD orders reaching the chapter', 'value': '1 product', 'note': 'narrow woven ribbons (China, Taiwan)'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
ov = d['overview']
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 58: {SHORT} — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Ribbons, Lace, Labels & Embroidery: Origin Rules, Labeling, Ribbon Antidumping & Legal Ways to Lower Duty (HTS '
    'Ch. 58) | KoalaGains',
    'shortDescription': 'What HTS Chapter 58 fabrics and trimmings need at U.S. entry — textile origin rules (embroidered fabric takes '
    'the origin of its ground fabric), manufacturer IDs, FTC fiber labels, flammability for apparel fabric, the ribbon antidumping orders — '
    'and the legal ways to pay less: classification, USMCA, CAFTA-DR, informational materials, first sale, drawback and FTZs.',
    'keywords': [
        'hts chapter 58 tariff engineering',
        'hts chapter 58 customs compliance',
        'usmca origin engineering',
        'first-sale for export valuation',
        'embroidery country of origin',
        'narrow woven ribbon anti dumping',
        'section 301 china tariffs on embroidery',
        'textile labeling requirements',
    ],
}
te['intro'] = (
    'Chapter 58 goods need no import license, but they are **textile products** under CBP\'s origin rules, and the origin decides the extra '
    'duty. For most of the chapter the origin is where the **fabric was formed** — woven, knitted or tufted — not where it was dyed, cut or '
    'finished (19 CFR 102.21). Two rules matter most: **embroidered fabric takes the origin of its ground fabric**, not of the embroidery, '
    'while embroidery without visible ground (5810.10) originates where it was embroidered; and **labels (5807)** and **quilted fabric '
    '(5811)** originate where the fabric was made. Every entry must name the manufacturer (19 CFR 102.23). Fabrics and narrow fabrics sold '
    'onward need FTC fiber-content and origin labels, labels and tapestry cloth excepted, and fabric for clothing must meet the CPSC '
    'flammability standard. Narrow woven ribbons from China and Taiwan can owe **antidumping or countervailing duties**.\n\n'
    'On cost, construction and fiber decide the base rate (Free to 20.2%), the country of origin decides the extra duty (+10% India, 10% '
    'in total EU and Taiwan, +12.5% Vietnam, +37.5% China), and USMCA, CAFTA-DR, the informational-materials exemption for labels, '
    'first-sale valuation, drawback and foreign-trade zones lower the bill further. Each lever depends on a document, listed below with its '
    'regulation.'
)
te['regulationsAsOf'] = ECFR_DATE
te['levers'] = [
    {
        'id': 'construction',
        'title': 'Classify by construction, width and fiber',
        'saves': 'Up to 20 points of base rate: cotton chenille is Free but cotton uncut weft pile 20.2%; cotton corduroy over 7.5 wales/cm '
        'pays 10%, finer cords 20.2%; man-made-fiber ribbons pay 6%, other man-made-fiber narrow fabrics 6.2%, woven labels 7.9%, '
        'embroidered labels 7.4%, metal-thread fabric 14.9%',
        'appliesTo': 'All lines — the heading follows the construction (pile 5801, terry and tufted 5802, gauze 5803, tulle and lace 5804, '
        'tapestry 5805, narrow 5806, labels 5807, braids and trimmings 5808, metal thread 5809, embroidery 5810, quilted 5811), the '
        'subheading the fiber and finish',
        'document': 'Technical data on the invoice: weave (pile, cut or uncut, warp or weft), width and edges (narrow fabrics are 30 cm or '
        'less with selvedges on both edges, chapter note 5), fiber content by weight, elastomeric content, wales per cm for corduroy, and '
        'whether labels are woven, printed or embroidered.',
        'caveat': 'Coated or laminated fabrics go to Chapter 59 (chapter note 1); narrow woven fabrics with woven fringes go to 5808 (note 5); '
        'knitted narrow fabrics and knitted lace-look fabrics are Chapter 60. The declared classification must match the goods.',
        'citations': [
            {'label': 'HTSUS Chapter 58, notes 1–7', 'url': CH58},
            {'label': 'HTSUS Section XI notes', 'url': SEC11},
        ],
    },
    {
        'id': 'embroidery-piece',
        'title': 'Know how embroidery in the piece is rated',
        'saves': 'Avoids under- or over-paying on embroidered fabric: 5810.91–5810.99 carry Free, 4.2% or 7.4%, but embroidery in the piece '
        'pays at least the rate of the same fabric unembroidered — 14.9% for a dyed polyester filament ground (5407.52.20), 9.7% for a dyed '
        'cotton ground (5208.32.40)',
        'appliesTo': '5810.91.00, 5810.92.10, 5810.92.90, 5810.99.10 and 5810.99.90 (additional U.S. notes 1–5). Embroidery in strips or '
        'motifs, such as patches and badges, pays the note rate',
        'document': 'The HTS line and rate of the ground fabric without embroidery (the calculator asks for it when you answer that the goods '
        'are embroidery in the piece, and charges the higher of the two).',
        'caveat': 'For Chinese goods, U.S. notes 20(z)–20(cc) lift the List 3 duty on a 5810 entry whose rate is taken from a fabric '
        'subheading that is itself on a China list; the calculator still adds the 25% in that case, so check it before filing.',
        'citations': [
            {'label': 'HTSUS Chapter 58, additional U.S. notes 1–5', 'url': CH58},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(z)–(cc)', 'url': CH99},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — usually where the fabric was formed',
        'saves': 'The difference between country rates: +10% for India, 10% in total for the EU and Taiwan, +12.5% for Vietnam and Turkey, '
        '+37.5% for China',
        'appliesTo': 'All lines; the gap is widest on ribbons, labels, pile fabrics and embroidery from China',
        'document': 'Production records showing where the fabric was woven or the lace or tulle made (the "fabric-making process") and '
        'where dyeing, printing, embroidery or cutting took place.',
        'caveat': 'Dyeing and printing confer origin on pile, gauze, tulle, lace and narrow fabrics only with two or more further finishing operations. Embroidered '
        'fabric (5810.91–5810.99) originates where the ground fabric was made; embroidered badges of several components where they were '
        'assembled; embroidery without visible ground (5810.10) where it was embroidered. Labels (5807) and quilted fabric (5811) originate '
        'where the fabric was formed. Shipping through a lower-rate country does not change origin.',
        'citations': [
            {'label': '19 CFR 102.21 (textile origin rules, headings 5801–5811)', 'url': ecfr(19, '102.21')},
            {'label': '19 CFR 102.23 (manufacturer identification)', 'url': ecfr(19, '102.23')},
        ],
    },
    {
        'id': 'informational-materials',
        'title': 'Enter qualifying labels and badges as informational materials',
        'saves': 'The 2026 Section 301 duty (10%–12.5%) and the 25% Brazil duty on 5807 labels and badges that are informational materials',
        'appliesTo': 'The 12 lines of 5807. CBP lists heading 5807 among the HTS provisions whose goods "may qualify" as informational '
        'materials (publications, posters, artworks and the like)',
        'document': 'Entry under 9903.05.92 (9903.05.09 for Brazil) with the goods\' own HTS line, and records showing the labels or badges are '
        'informational materials.',
        'caveat': 'Being in 5807 is not enough: the goods must be informational materials, and ordinary brand, size or care labels for '
        'garments are entered without the exemption. China\'s List 3 duty (9903.88.03) and the Canada Section 338 duties have no such '
        'exemption.',
        'citations': [
            {'label': 'HTSUS 9903.05.92, 9903.05.09', 'url': CH99},
            {'label': 'CBP IEEPA FAQ: informational materials', 'url': src('cbp-ieepa-faq')['url']},
            {'label': 'CBP CSMS # 69326983', 'url': src('csms-69326983')['url']},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate (up to 20.2%) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, every line except 5806.32.20',
        'document': 'A certification of origin from the importer, exporter or producer, with the SPI "S" on the entry line.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on Canadian 5806.32.20 (U.S. note 51(a)). The goods must meet the '
        'Chapter 58 rule of origin in General Note 11 (for textiles generally a yarn-forward rule). The USMCA was not renewed at the July 1, '
        '2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11', 'url': GN},
            {'label': 'HTSUS 9903.05.93, 9903.05.94, U.S. note 51', 'url': CH99},
        ],
    },
    {
        'id': 'cafta-jordan',
        'title': 'Use CAFTA-DR and the note 52(j) exception lists',
        'saves': 'The base rate and the 10%–12.5% Section 301 duty',
        'appliesTo': 'Every Chapter 58 subheading for Jordan (9903.06.20), and for Guatemala (9903.06.06) and El Salvador (9903.06.09) under '
        'CAFTA-DR; for Costa Rica, the Dominican Republic, Honduras and Nicaragua, the 89 lines with a CAFTA-DR rate (note 52(i), '
        '9903.05.95)',
        'document': 'A valid CAFTA-DR origin claim with the SPI "P" on the entry line (general note 29), or Jordanian origin, and the '
        'exemption heading reported with the line.',
        'caveat': 'Note 52(i) applies only to goods entered free of duty under CAFTA-DR, so the 22 lines whose General rate is already Free '
        '(no P rate) keep the duty for those four countries. The EU, UK, Taiwan and other exception lists name no Chapter 58 line.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)', 'url': CH99},
            {'label': 'HTSUS General Note 29 (CAFTA-DR)', 'url': GN},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim another FTA or CBERA rate where the base rate is the cost',
        'saves': 'The base rate — up to 20.2% on cotton pile fabric, 17.2% on man-made-fiber velvet, 13.2% on hand-made lace',
        'appliesTo': 'The 89 dutiable lines, for goods of Korea, Australia, Bahrain, Chile, Colombia, Israel, Morocco, Oman, Panama, Peru and '
        'Singapore; CBERA countries (E*) on 37 lines',
        'document': 'Proof of origin under the agreement and the SPI on the entry line (KR, AU, BH, CL, CO, IL, MA, OM, PA, PE, SG, E*).',
        'caveat': 'An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a)): Korean goods pay 12.5% in total, Israeli and '
        'Australian goods the 12.5% on top of a Free base rate.',
        'citations': [
            {'label': 'HTSUS General Note 3(c)', 'url': GN},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–50% extra duties included — when the mill '
        'price to a trading company is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company or agent rather than straight from the mill',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the mill invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'samples',
        'title': 'Enter swatches and sample cards as samples',
        'saves': 'All duty — the base rate and the Section 301, China and Canada duties',
        'appliesTo': 'Fabric, lace, ribbon and label swatches valued at $1 or less each, or marked, torn or perforated so they cannot be '
        'sold, used only to solicit orders',
        'document': 'Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.',
        'caveat': 'Usable lengths sent as samples are classified in Chapter 58 like any other goods. U.S. notes 20, 51 and 52 exempt goods '
        'properly entered under Chapter 98 from those extra duties.',
        'provisions': [
            {'code': '9811.00.60', 'rate': 'Free', 'text': 'Samples valued not over $1 each, or marked, torn, perforated or otherwise treated '
             'so they are unsuitable for sale, used only for soliciting orders for products of foreign countries'}
        ],
        'citations': [
            {'label': 'HTSUS 9811.00.60', 'url': CH98},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20(a), 51, 52(a)', 'url': CH99},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or use in exported products',
        'saves': 'Up to 99% of the duties paid, when the imported fabric or trim (or goods made from it, such as garments or seat belts) is '
        'exported or destroyed',
        'appliesTo': 'Any line — for example labels, ribbon or webbing sewn into products shipped abroad',
        'document': 'A drawback claim filed in ACE with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on '
        'it. Antidumping and countervailing duties are not refunded as drawback.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Use a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for trims and labels used in production for export',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification or scope ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: ribbon (6%) versus other narrow fabric (6.2%, on the '
        'Canada Section 338 list); woven (5807) versus embroidered (5810) labels; lace (5804) versus embroidered tulle (5810); woven '
        'narrow (5806) versus knitted (Chapter 60); and whether a ribbon falls inside the antidumping orders',
        'appliesTo': 'Any line where construction, width or use decides the line',
        'document': 'A ruling request to CBP describing the construction, fiber, width and use; for antidumping scope, a scope ruling '
        'application to Commerce.',
        'caveat': 'Rulings apply to the transaction described; a changed construction may need a new one. The written scope of an '
        'antidumping order, not the HTS number, decides coverage.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
]
te['rules'] = [
    {
        'id': 'cbp-textile-origin',
        'agency': 'CBP',
        'title': 'Chapter 58 goods are "textile products": origin follows the specific rules for headings 5801–5811 — generally where the '
        'fabric was formed; embroidered fabric where the ground fabric was made; 5810.10 embroidery where it was embroidered',
        'citations': [{'label': '19 CFR 102.21', 'url': ecfr(19, '102.21')}],
    },
    {
        'id': 'cbp-mid',
        'agency': 'CBP',
        'title': 'Every commercial entry of textile products must identify the manufacturer with a manufacturer identification code',
        'citations': [{'label': '19 CFR 102.23', 'url': ecfr(19, '102.23')}],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible and permanent enough to reach the ultimate purchaser — on the goods or, for '
        'rolls, spools and bulk trim, their container or tag',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}, {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')}],
    },
    {
        'id': 'cbp-invoice',
        'agency': 'CBP',
        'title': 'Invoices for textile fiber products must state the fiber content by weight, the manufacturer and the country where '
        'processed or manufactured',
        'citations': [{'label': '19 CFR 141.89', 'url': ecfr(19, '141.89')}],
    },
    {
        'id': 'ftc-textile',
        'agency': 'FTC',
        'title': 'Textile Fiber Products Identification Act: fabrics and narrow fabrics (other than packaging ribbons) sold onward need '
        'fiber-content, origin and dealer labels; labels and tapestry cloth are excluded, and trim on finished goods is generally exempt',
        'citations': [
            {'label': '16 CFR 303.45 (coverage and exclusions)', 'url': ecfr(16, '303.45')},
            {'label': '16 CFR 303.12 (trimmings)', 'url': ecfr(16, '303.12')},
            {'label': '16 CFR 303.33 (country of origin)', 'url': ecfr(16, '303.33')},
        ],
    },
    {
        'id': 'ftc-wool',
        'agency': 'FTC',
        'title': 'Wool Products Labeling Act: fabrics containing wool (for example wool pile fabric of 5801.10 and wool narrow fabric) '
        'must show the wool content',
        'citations': [{'label': '16 CFR part 300', 'url': ecfr_part(16, 300)}],
    },
    {
        'id': 'cpsc-1610',
        'agency': 'CPSC',
        'title': 'Fabric intended for clothing must meet the clothing-textile flammability standard; plain-surface fabrics of 2.6 oz/yd² or '
        'more, and fabrics wholly of acrylic, modacrylic, nylon, olefin, polyester or wool, are exempt from testing to support guaranties. Certificate data is '
        'eFiled at entry from July 8, 2026 where a certificate is required',
        'citations': [
            {'label': '16 CFR 1610.1', 'url': ecfr(16, '1610.1')},
            {'label': '16 CFR part 1110', 'url': ecfr_part(16, 1110)},
            {'label': '90 FR 1800; 90 FR 45917', 'url': src('fr-2025-18521')['url']},
        ],
    },
    {
        'id': 'ita-adcvd',
        'agency': 'Commerce (ITA) / CBP',
        'title': 'Antidumping cash deposits on narrow woven ribbons with woven selvedge from China and Taiwan, and countervailing deposits '
        'from China (5806.32.10.20–.60 and other numbers named in the scope); coverage follows the written scope',
        'citations': [
            {'label': '75 FR 56982 (amended orders and scope)', 'url': src('fr-2010-23350')['url']},
            {'label': '87 FR 15205 (orders continued)', 'url': src('fr-2022-05634')['url']},
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or its exemption — '
        '9903.05.92 informational materials, 9903.05.95 CAFTA-DR textiles, a note 52(j) list), China List 3 (9903.88.03) or 4A '
        '(9903.88.15), Brazil (9903.05.01), Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 50–52', 'url': CH99},
            {'label': 'CBP CSMS # 69326983 (Section 301 guidance)', 'url': src('csms-69326983')['url']},
        ],
    },
]
ALL_RULES = [r['id'] for r in te['rules']]
GROUP_NOTES = {
    '5801': 'The widest rate spread in the chapter: cotton chenille and wool pile fabric Free, man-made-fiber chenille 9.8%, cotton '
    'corduroy 10% or 20.2% depending on wales per cm, cut velvet 17.2%–18.5%. China pays +37.5% on most lines but +20% on man-made-fiber '
    'chenille (List 4A).',
    '5802': 'Cotton terry fabric pays 9.4%–9.8%, other terry 14%, tufted fabrics 6.2%. Made-up terry towels are not here (Chapter 63).',
    '5803': 'Gauze of cotton, vegetable fibers or man-made fibers is Free; wool gauze pays 7% (tapestry and upholstery weights) or 16.5%.',
    '5804': 'Tulle and net of cotton or man-made fibers pay 6%; machine lace 5%–12%, hand-made lace 13.2%. Embroidered tulle or lace is '
    'classified as embroidery (5810).',
    '5805': 'Every line is Free. Only hand-woven and needle-worked tapestries belong here; the extra duty by country still applies.',
    '5806': 'The largest heading by imports. Man-made-fiber ribbons pay 6% and are the subject of the China and Taiwan antidumping '
    'orders; other man-made-fiber narrow fabrics (5806.32.20, such as seat-belt webbing) pay 6.2% and, from Canada, 50% Section 338. '
    'Hook-and-loop tapes 7%, elastic narrow fabrics 7%.',
    '5807': 'Woven and printed labels of cotton or man-made fibers pay 7.9%, others 3.3%–4.5%. Labels that are informational materials '
    'can skip the 2026 Section 301 duty (9903.05.92). Origin is where the fabric was made.',
    '5808': 'Braids for headwear Free or 3.2%, other braids 4.2%–7.4%, ornamental trimmings, tassels and pompons 3.9%.',
    '5809': 'Woven fabric of metal thread or metalized yarn pays 14.9%.',
    '5810': 'Embroidery without visible ground pays 14.1%; other embroidery Free to 7.4% (additional U.S. notes 1–5), but embroidery in '
    'the piece pays at least the rate of the unembroidered fabric. Embroidered fabric takes the origin of its ground fabric.',
    '5811': 'Quilted fabric in the piece pays 6.3% (cotton), 8% (man-made fibers) or 13.2% (wool). Origin is where the fabric was made.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = [r for r in ALL_RULES if r != 'ita-adcvd' or g['heading'] in ('5806', '5808', '5810')]
    g['note'] = GROUP_NOTES[g['heading']]
AD_LINES = ('5806.31', '5806.32', '5806.39', '5808.90', '5810.91', '5810.99.90')
for ln in te['lines']:
    h = ln['hts']
    ln['ruleIds'] = [r for r in ALL_RULES if r != 'ita-adcvd' or h.startswith(AD_LINES)]
    gen = rows[h].get('effectiveGeneral') or rows[h].get('general')
    lev = ['construction']
    if h.startswith('5810.9'):
        lev.append('embroidery-piece')
    lev.append('origin')
    if h.startswith('5807'):
        lev.append('informational-materials')
    lev += ['usmca', 'cafta-jordan']
    if gen and gen != 'Free':
        lev.append('fta')
    lev += ['first-sale', 'samples', 'drawback', 'ftz', 'ruling']
    ln['leverIds'] = lev
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Which line a fabric or '
    'trim falls in, where it originates, whether it is inside an antidumping order and which Chapter 99 duties apply depend on the facts of '
    'each shipment, and the extra duties change by Federal Register notice and CBP guidance; confirm the current headings before each '
    'shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Overview (static parts)
# ---------------------------------------------------------------------------------------------------
ov['h1'] = f'HTS Chapter 58: {SHORT} — Tariff Rates (2026)'
BLURBS = {
    '5801': (
        'Woven pile and chenille fabrics: velvet, velveteen, plush, corduroy and chenille upholstery fabric. Cotton chenille and wool pile '
        'are Free; cotton corduroy 10% (over 7.5 wales/cm) or 20.2%; cut velvet 17.2%–18.5%; man-made-fiber chenille 9.8%.',
        ['velvet fabric', 'corduroy fabric', 'chenille fabric', 'velveteen', 'plush fabric', 'upholstery velvet'],
    ),
    '5802': (
        'Terry toweling fabric by the meter (cotton 9.4%–9.8%, other fibers 14%) and tufted textile fabrics (6.2%). Finished towels are '
        'Chapter 63.',
        ['terry fabric', 'terry cloth', 'tufted fabric'],
    ),
    '5803': (
        'Gauze — leno-weave fabric with crossing warp threads. Cotton, vegetable-fiber and man-made-fiber gauze is Free; wool gauze 7% or '
        '16.5%.',
        ['gauze fabric', 'cotton gauze', 'leno fabric'],
    ),
    '5804': (
        'Tulle, bobbinet and other net fabrics (6% in cotton or man-made fibers), machine-made lace (5%–12%) and hand-made lace (13.2%), '
        'in the piece, strips or motifs.',
        ['tulle', 'lace fabric', 'lace trim', 'net fabric', 'polyester lace', 'cotton lace'],
    ),
    '5805': (
        'Hand-woven tapestries (Gobelins, Flanders, Aubusson, Beauvais type) and needle-worked tapestries such as petit point and cross '
        'stitch. Every line is Free.',
        ['tapestry', 'wall tapestry', 'needlepoint tapestry'],
    ),
    '5806': (
        'Narrow woven fabrics up to 30 cm wide: satin and grosgrain ribbon (6% in man-made fibers), seat-belt webbing and other narrow '
        'fabrics (6.2%), hook-and-loop tape (7%), elastic tape (7%), cotton tape (8.8%). Ribbons from China and Taiwan can owe antidumping '
        'duty.',
        ['ribbon', 'satin ribbon', 'grosgrain ribbon', 'webbing', 'hook and loop tape', 'elastic tape', 'narrow fabric'],
    ),
    '5807': (
        'Labels, badges and similar articles of textile, not embroidered: woven labels and printed labels of cotton or man-made fibers '
        '(7.9%), others 3.3%–4.5%.',
        ['woven label', 'garment label', 'printed label', 'care label', 'size label'],
    ),
    '5808': (
        'Braids in the piece, ornamental trimmings, tassels and pompons: 3.9% for trimmings and tassels, 3.2%–7.4% for braids.',
        ['braid trim', 'tassel', 'pompom trim', 'fringe trim', 'gimp'],
    ),
    '5809': (
        'Woven fabrics of metal thread or metalized yarn used in apparel and furnishings: 14.9%.',
        ['metallic fabric', 'lamé fabric'],
    ),
    '5810': (
        'Embroidery in the piece, in strips or motifs: embroidered fabric, eyelet, embroidered patches, emblems and badges. Without '
        'visible ground 14.1%; other embroidery Free to 7.4%, but embroidery in the piece pays at least the plain fabric\'s rate.',
        ['embroidered patch', 'embroidery fabric', 'embroidered lace', 'embroidered badge', 'embroidered emblem', 'eyelet fabric'],
    ),
    '5811': (
        'Quilted textile products in the piece — layers of fabric stitched with padding: cotton 6.3%, man-made fibers 8%, wool 13.2%.',
        ['quilted fabric', 'quilted lining'],
    ),
}
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

ov['workedExamples'] = [
    {
        'title': 'Polyester satin ribbon from China',
        'line': '5806.32.10.30',
        'body': 'Polyester ribbon up to 12 cm wide with woven selvedge pays 6%. China adds 25% (List 3, 9903.88.03) and 12.5% (9903.05.31): '
        '**43.5%**, $4,350 on $10,000. The ribbon is also inside the antidumping and countervailing orders on Chinese narrow woven '
        'ribbons, so a cash deposit set by exporter is added — 247.65% at the China-wide antidumping rate. From Vietnam the same ribbon '
        'pays 18.5%, from Taiwan 10% plus its antidumping deposit.',
    },
    {
        'title': 'Woven garment labels from Vietnam',
        'line': '5807.10.05.20',
        'body': 'Woven labels of man-made fibers pay 7.9%. Vietnam adds 12.5% (9903.05.84): **20.4%**, $2,040 on $10,000. Ordinary brand '
        'and size labels are entered that way; only labels that are informational materials can use 9903.05.92 and pay 7.9%. From China '
        'the same labels pay 45.4%; from Mexico with a USMCA claim, nothing.',
    },
    {
        'title': 'Embroidered cotton fabric in the piece from India',
        'line': '5810.91.00.20',
        'body': 'Embroidered cotton is Free under additional U.S. note 1, "but in the case of embroidery in the piece not less than the '
        'rate which would apply to such product if not embroidered". On a dyed cotton ground of 5208.32.40 (9.7%) the base rate is '
        '9.7%; India adds 10% (9903.05.44): **19.7%**. Its origin is where the cotton fabric was woven, not where it was embroidered.',
    },
    {
        'title': 'Seat-belt webbing from Canada, with a USMCA claim',
        'line': '5806.32.20.00',
        'body': 'USMCA removes the 6.2% base rate and the 10% Section 301 duty (9903.05.93). But 5806.32.20 is on the Canada Section 338 '
        'list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies even when USMCA is claimed: **$5,000** on a $10,000 shipment entered '
        'since August 22, 2026. Without USMCA it is 66.2%.',
    },
    {
        'title': 'Man-made-fiber chenille upholstery fabric from China',
        'line': '5801.36.00.10',
        'body': 'Chenille of man-made fibers pays 9.8%. It is on List 4A, not List 3, so China adds 7.5% (9903.88.15) and 12.5% '
        '(9903.05.31): **29.8%**, $2,980 on $10,000. Cotton chenille (5801.26) is Free at the base rate but on List 3: 37.5%.',
    },
]
ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not apply to textile fabrics referred to in note 1 to chapter 59, impregnated, coated, covered or '
    'laminated, or to other goods of chapter 59.\n\n'
    '**Note 2.** Heading 5801 also includes woven weft pile fabrics which have not yet had the floats cut, at which stage they have no pile '
    'standing up.\n\n'
    '**Note 3.** For the purposes of heading 5803, "gauze" means a fabric with a warp composed wholly or in part of standing or ground '
    'threads and crossing or doup threads which cross the standing or ground threads making a half turn, a complete turn or more to form '
    'loops through which weft threads pass.\n\n'
    '**Note 4.** Heading 5804 does not apply to knotted net fabrics of twine, cordage or rope, of heading 5608.\n\n'
    '**Note 5.** For the purposes of heading 5806, the expression "narrow woven fabrics" means: (a) woven fabrics of a width not exceeding '
    '30 cm, whether woven as such or cut from wider pieces, provided with selvages (woven, gummed or otherwise made) on both edges; (b) '
    'tubular woven fabrics of a flattened width not exceeding 30 cm; and (c) bias binding with folded edges, of a width when unfolded not '
    'exceeding 30 cm. Narrow woven fabrics with woven fringes are to be classified in heading 5808.\n\n'
    '**Note 6.** In heading 5810, the expression "embroidery" means, inter alia, embroidery with metal or glass thread on a visible ground '
    'of textile fabric, and sewn applique work of sequins, beads or ornamental motifs of textile or other materials. The heading does not '
    'apply to needlework tapestry (heading 5805).\n\n'
    '**Note 7.** In addition to the products of heading 5809, this chapter also includes articles made of metal thread and of a kind used '
    'in apparel, as furnishing fabrics or for similar purposes.'
)
ov['notes']['additionalUsNotes'] = (
    'Additional U.S. notes 1–5 give the rates for the "Other embroidery" subheadings, whose rate columns say "See additional U.S. note":\n\n'
    '- **Note 1, 5810.91.00 (cotton):** column 1 (general) Free; column 2 90%.\n'
    '- **Note 2, 5810.92.10 (man-made-fiber badges, emblems and motifs):** 4.2%; column 2 90%.\n'
    '- **Note 3, 5810.92.90 (other man-made-fiber embroidery):** 7.4%; column 2 90%.\n'
    '- **Note 4, 5810.99.10 (wool):** 7.4%; column 2 90%.\n'
    '- **Note 5, 5810.99.90 (other materials):** 4.2%; column 2 90%.\n\n'
    'Each rate applies "but in the case of embroidery in the piece not less than the rate which would apply to such product if not '
    'embroidered". So embroidered fabric sold by the length pays the higher of the note rate and the rate of the same fabric without '
    'embroidery; the calculator asks whether the goods are embroidery in the piece and, if so, for the HTS line of the plain fabric. '
    'Embroidery in strips or motifs — patches, badges, appliqués — pays the note rate.\n\n'
    'The three-digit numbers in brackets — (224), (229), (414), (669) and others — are textile category numbers used to monitor shipments.'
)
for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 111; Brazil: 111; China List 3: 106, List 4A: 3; Canada Section 338: 1 (5806.32.20, also on '
            'USMCA goods). Ribbons from China and Taiwan can also owe antidumping duty.'
        )

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 58: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39); lines at 10% or more pay their base rate only '
    '(9903.05.38). No Chapter 58 line is on the EU exception list. The 15%-in-total IEEPA rate ended February 24, 2026.'
)
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on 106 lines, or + 7.5% List 4A (9903.88.15) on '
    'man-made-fiber chenille and other weft pile (5801.33, 5801.36); 5801.31 and 5801.32 pay only the 12.5%. No China exclusion in force '
    'covers Chapter 58. Ribbon antidumping and countervailing duties are not in the cells.',
    'Taiwan': 'Taiwan: 10% in total in place of the base rate when the base rate is under 10% (9903.05.76); lines at 10% or more pay their '
    'base rate only (9903.05.75). Ribbon antidumping duty is not in the cells.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 58 line is exempt. The 20% IEEPA duty ended February 24, 2026.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 58 line is exempt. The IEEPA duties (up to 50%) ended in February 2026.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). No Chapter 58 line is exempt. The 15% IEEPA duty ended February 24, '
    '2026.',
    'South Korea': 'KORUS (KR) makes the base rate Free, and the Korean Section 301 rate makes the total 12.5% (9903.05.71) on every line.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on '
    '5806.32.20 narrow fabrics such as seat-belt webbing (9903.03.14), whether or not USMCA is claimed.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 58 line is exempt. The 19% IEEPA duty ended February 24, 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 58 line is on the UK exception list.',
    'Japan': 'Japan: 12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.49); lines at 12.5% or more pay '
    'their base rate only (9903.05.48).',
    'Dominican Republic': 'CAFTA-DR (P) claimed: base rate Free and no Section 301 duty on the 89 lines with a P rate (note 52(i), '
    '9903.05.95). The 22 lines whose General rate is already Free have no P rate and pay 12.5% (9903.05.34).',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27). No Chapter 58 line is on the Brazil exemption list.',
}
ANY_LABEL = (
    'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.83), or 12.5% in '
    'total for Switzerland. Jordan is exempt on every Chapter 58 subheading (note 52(j)), and so are Guatemala and El Salvador under '
    'CAFTA-DR; other CAFTA-DR textile goods entered under SPI P are exempt on the lines with a P rate (note 52(i)). Column 2 countries '
    '(Cuba, North Korea, Russia, Belarus) pay column 2 rates — up to 90% — and Russia also +12.5%.'
)
for c in ia['countries']:
    name = c['country']
    if name in RULE_LABELS:
        c['rule']['label'] = RULE_LABELS[name]
    elif name == 'Any other country':
        c['rule']['label'] = ANY_LABEL
    elif c['rule']['kind'] == 'eu15':
        c['rule']['label'] = EU_LABEL
    else:
        raise SystemExit(f'no rule label for {name}: {c["rule"]}')
    ids = c['rule']['sourceIds']
    extra = {
        'China': ['fr-2010-21975', 'fr-2010-21978'],
        'Taiwan': ['fr-2010-21975', 'fr-2026-18182'],
        'Dominican Republic': ['csms-69326983'],
    }.get(name, [])
    if name in ('Canada', 'Mexico', 'India', 'Türkiye (Turkey)', 'Vietnam', 'Thailand', 'Italy', 'Germany', 'France') or name == 'Any other country':
        extra = extra + ['eo-14389']
    for sid in extra:
        if sid not in ids:
            ids.insert(-1, sid)
add_sources(ia, sorted({s for c in ia['countries'] for s in c['rule']['sourceIds']}))
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Dominican Republic is shown with the CAFTA-DR claim (SPI P): on the 89 lines with a P rate the base rate is Free and the 12.5% '
    'Section 301 duty is lifted by U.S. note 52(i) (9903.05.95), which exempts CAFTA-DR textile goods (general note 29(d)(v)) entered '
    'duty-free; the 22 lines whose General rate is already Free carry no P rate, so the 12.5% stays.',
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on 5806.32.20 because '
    'U.S. note 51(a) applies it even when a special rate is claimed.',
    'Labels and badges (5807): cells show two totals, one for goods that are informational materials (9903.05.92, and 9903.05.09 for '
    'Brazil) and one for goods that are not. Ordinary garment labels are "not informational materials".',
    'Embroidery (5810.91–5810.99): cells for these lines repeat the note wording "but in the case of embroidery in the piece not less than '
    'the rate which would apply to such product if not embroidered". The total shown is for embroidery in strips or motifs; for embroidery '
    'in the piece, use the calculator, which asks for the plain fabric\'s HTS line and charges the higher rate. For China it adds the 25% '
    'List 3 duty, although notes 20(z)–20(cc) lift it when the plain fabric is itself on a China list.',
    'Not in the cells: antidumping and countervailing duties on narrow woven ribbons from China and Taiwan, which depend on the exporter '
    'and the order scope; the note 52(j) exemptions for Jordan, Guatemala and El Salvador and the note 52(i) CAFTA-DR relief for '
    'Honduras, Costa Rica and Nicaragua (they are in "Any other country"); FTA and CBERA preferences other than USMCA, KORUS and CAFTA-DR '
    'for the Dominican Republic; and the opt-in Section 232 treatment of certified automobile parts.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
    'Taiwan is reported to UN Comtrade as "Other Asia, nes"; its imports are shown under Taiwan.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 2(aa), 16, 19, 20, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 '
    'general exemption list (note 52(b), 9903.05.86) has no Chapter 58 line. Heading 9903.05.92 (informational materials) reaches heading '
    '5807, which CBP lists among the provisions whose goods may qualify; the exemption depends on the goods being informational materials. '
    'The country exception lists in note 52(j) cover all 72 Chapter 58 subheadings for Jordan (9903.06.20), and for Guatemala (9903.06.06) '
    'and El Salvador (9903.06.09) when entered under CAFTA-DR; the Taiwan, EU, UK, Japan and other lists name no Chapter 58 line. Note 52(i) '
    '(9903.05.95) exempts CAFTA-DR textile goods entered duty-free under SPI P; general note 29(d)(v) reaches all of Chapter 58, so the relief '
    'covers the 89 lines with a P rate. The Brazil list (note 50(a)(ii)) has no Chapter 58 line. The Canada Section 338 list (note 51(b)(3)) '
    'names 5806.32.20; the September 15, 2026 revisions added no Chapter 58 provision. China: List 3 (note 20(f)) covers 68 of the 72 '
    'subheadings; 5801.33 and 5801.36 are on List 4A (note 20(s)); 5801.31 and 5801.32 are only on List 4B (note 20(u)), which is '
    'suspended. The List 3 exclusions printed in note 20 for seat-belt webbing (5806.32.20.00) and polyester-nylon embroidery fabric '
    '(5810.92.90.80) have expired, and the exclusions in effect (notes 20(vvv) and 20(www)) name no Chapter 58 product; notes 20(z)–20(cc) '
    'lift List 3 on 5810.91–5810.99 entries rated from another listed subheading; note 31 (2024 increases) names none. Section 232: no '
    'Chapter 58 line is on a metals, vehicle-parts, wood or semiconductor list, so Section 232 reaches Chapter 58 goods only if the importer '
    'elects to certify them as automobile or truck parts. Note 30 sets no Chapter 58 rate for Russia, which pays column 2. No Chapter 58 '
    'line was on the Section 122 exemption list. A Federal Register search of Commerce notices found one antidumping/countervailing case '
    'whose scope names Chapter 58 numbers: narrow woven ribbons with woven selvedge from China (AD, CVD) and Taiwan (AD).'
)
add_sources(ia, ['cbp-ieepa-faq'])

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 58: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Ribbon, Lace, Label & Embroidery HS Codes and Tariffs 2026: FAQ (HTS Ch. 58) | KoalaGains',
    'shortDescription': 'Answers to what people search about importing Chapter 58 goods into the U.S.: the HS / tariff code for ribbon, '
    'woven labels, embroidered patches, lace, tulle, velvet, corduroy, hook-and-loop and elastic tape; tariffs on fabric from China; and '
    'the ribbon antidumping orders.',
    'keywords': [
        'ribbon hs code',
        'satin ribbon tariff code',
        'woven label hs code',
        'embroidered patches hs code',
        'lace hs code',
        'tulle hs code',
        'velvet fabric hs code',
        'hook and loop hs code',
        'narrow woven ribbon anti dumping',
        'tariffs on fabric from china',
        'hts chapter 58 customs duty',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for ribbons, labels, lace, embroidery, pile fabrics '
    'and trimmings. Each answer links to the page with the full detail.'
)
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'

# ---------------------------------------------------------------------------------------------------
# Trade-driven text: overview, understand industry, industry areas, FAQ
# ---------------------------------------------------------------------------------------------------
chn, tw, vnm, ind, mex = imp('China'), imp(TW), imp(VN), imp('India'), imp('Mexico')
pct_tot = round((total / prior_total - 1) * 100, 1)
assert pct_tot < 0
h5806, h5801, h5810 = head('5806'), head('5801'), head('5810')

ov['seo']['title'] = 'HTS Chapter 58 Tariffs 2026: Import Duty on Ribbons, Lace, Labels, Embroidery & Velvet | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable 2026 U.S. duty table for all 111 HTS Chapter 58 lines — velvet, corduroy, chenille, tulle, lace, ribbons, webbing, woven '
    'labels, trimmings and embroidery. Base rates Free to 20.2%, plus the extra duty by country: India +10%, EU and Taiwan 10%, China +37.5%.'
)
ov['seo']['keywords'] = [
    'hts chapter 58',
    'special woven fabrics import duty rates',
    'hts chapter 58 customs duty',
    'china tariff on special woven fabrics',
    'corduroy and velvet import duties',
    'woven pile and chenille fabrics import duty',
    'import duty on tulle and knot-net fabrics',
    'united states import duty on tufted textile fabrics',
    'ribbon tariff code',
    'woven labels tariff code',
    'section 301 duties on hts 5806.39',
    'usmca duty-free textile tariffs',
]
ov['intro'] = (
    'Chapter 58 covers special fabrics and trimmings: **velvet, corduroy and chenille** (5801), terry and tufted fabric (5802), gauze '
    '(5803), **tulle and lace** (5804), tapestries (5805), **ribbons, tapes and webbing** (5806), **woven and printed labels** (5807), braids '
    'and trimmings (5808), metal-thread fabric (5809), **embroidery and patches** (5810) and quilted fabric (5811). Its **111 tariff lines** '
    'run from Free to 20.2%: 22 are Free, ribbons pay 6%, woven labels 7.9%, lace 5%–13.2%, cut velvet 17.2%–18.5%. Embroidery rates sit in '
    'the chapter\'s additional U.S. notes, and embroidery in the piece pays at least the rate of the plain fabric.\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of these goods in {Y}. **China** ({fmt_usd(chn)}, {share(chn)}%) and **Taiwan** '
    f'({fmt_usd(tw)}, {share(tw)}%) supplied {share(chn + tw)}% of it, ahead of Vietnam, India and Mexico. On top of the base rate comes the '
    '**extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 economies — **+10% for India and the UK, +12.5% for Vietnam, '
    'Turkey and Thailand, 10% in total for the EU and Taiwan, 12.5% for Japan and Korea**. **China pays +37.5%** on most lines (List 3 plus '
    'the 2026 action), so Chinese polyester ribbon pays 43.5%. USMCA goods from Mexico pay nothing; Canadian 5806.32.20 webbing owes a **50% '
    'Section 338 duty** even under USMCA. **Narrow woven ribbons from China and Taiwan** also owe antidumping duty, and from China '
    'countervailing duty.'
)
ts = ov['tradeSnapshot']
ts['totalDutyCollectedUsd'] = None
ts['effectiveDutyRateNote'] = 'Duty-collected figures aren\'t available from an official source yet.'
ts['source'] = f'UN Comtrade, United States imports, HS chapter 58 ({Y})'
ts['topCountries'] = [{'name': NAMES.get(c['country'], c['country']), 'importsUsd': c['importsUsd']} for c in trade['byCountry'][:5]]
ts['biggestLines'] = [
    {'hts': '5806.32', 'label': 'Narrow woven fabrics of man-made fibers: ribbons, tapes and webbing'},
    {'hts': '5801.36', 'label': 'Chenille fabrics of man-made fibers'},
    {'hts': '5810.92', 'label': 'Embroidery of man-made fibers, with visible ground'},
    {'hts': '5806.10', 'label': 'Narrow woven pile fabrics, including hook-and-loop tapes'},
]
ts['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade for calendar {Y} at the '
    '6-digit level — before the 2026 tariff changes. Taiwan is reported as "Other Asia, nes".'
)
for s_ in ov['stats']:
    if s_.get('label', '').endswith('share'):
        s_['label'] = 'China + Taiwan share'

ui['h1'] = f'HTS Chapter 58: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Imports of Ribbons, Lace, Labels & Embroidery by Country: China, Taiwan, Vietnam — HTS Chapter 58 Trade Statistics | '
    'KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 58 goods: {fmt_usd(total)} in {Y}. China and Taiwan supply {share(chn + tw)}%; '
    'values by country, product (ribbons, chenille, embroidery, labels) and year from UN Comtrade.',
    'keywords': [
        'hts chapter 58 imports',
        'ribbon imports by country',
        'narrow woven fabric imports',
        'embroidery imports china',
        'woven pile and chenille fabrics import duty',
        'chapter 58 textile import tariffs',
    ],
}
ui['valueBasis'] = trade['valueBasis']
ui['byYearPartners'] = ['China', 'Taiwan']
ui['byYearCaption'] = (
    f'U.S. imports of Chapter 58 goods each year, split into the two largest {Y} suppliers (China and Taiwan) and everyone else.'
)
for c in ui['byCountry']:
    c['country'] = NAMES.get(c['country'], c['country'])
    if c.get('mainHeading') in GROUP_LABELS:
        c['mainHeadingLabel'] = GROUP_LABELS[c['mainHeading']][0]
for x in ui['byHeadingCountry']:
    x['country'] = NAMES.get(x['country'], x['country'])
for x in ui['byLine']:
    if 'searchText' in x:
        for h, lab in ORIG_LABELS.items():
            x['searchText'] = x['searchText'].replace(lab.lower(), GROUP_LABELS[h][0].lower()).replace(lab, GROUP_LABELS[h][0])
for s_ in ui['stats']:
    if s_.get('label', '').startswith('Top 2 share'):
        s_['label'] = 'Top 2 share (China + Taiwan)'
    if s_.get('label') == 'Largest product':
        s_['note'] = 'Narrow woven fabrics of man-made fibers — ribbons, tapes, webbing (5806.32)'
ui['why'] = (
    f'U.S. imports of Chapter 58 goods were **{fmt_usd(total)} in {Y}**, {abs(pct_tot)}% less than the {fmt_usd(prior_total)} of {PY} and '
    f'below the {fmt_usd(year_tot[2022])} peak of 2022. **Narrow woven fabrics** (5806) were the largest heading at {fmt_usd(h5806)} '
    f'({share(h5806)}%) — {fmt_usd(h6("580632"))} of it man-made-fiber ribbons, tapes and webbing (5806.32), the largest single product. '
    f'Pile and chenille fabrics (5801) were {fmt_usd(h5801)}, led by man-made-fiber chenille ({fmt_usd(h6("580136"))}), and embroidery (5810) '
    f'{fmt_usd(h5810)}.\n\n'
    f'**China** ({fmt_usd(chn)}, {share(chn)}%) is the largest supplier, mainly of pile and chenille fabric ({fmt_usd(hc("5801", "China"))}), '
    f'narrow fabrics and embroidery; its shipments fell {abs(chg("China"))}%. **Taiwan** ({fmt_usd(tw)}) is almost all narrow fabric '
    f'({fmt_usd(hc("5806", TW))} of 5806). **Vietnam** grew {chg(VN)}% to {fmt_usd(vnm)}, mostly narrow fabric. **India** ({fmt_usd(ind)}) '
    f'ships narrow fabric, pile fabric and embroidery; **Mexico** ({fmt_usd(mex)}) trimmings, embroidery and labels; **Italy** '
    f'({fmt_usd(imp("Italy"))}) velvet and pile fabric. **Canada** ({fmt_usd(imp("Canada"))}) is the largest source of quilted fabric.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 '
    'tariffs from July 24, 2026 and the Canada Section 338 duty from August 22); they do not show what those changes did. Duty-collected '
    'figures are not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren\'t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit level, for '
    f'calendar years 2020–{Y}. Country names are shortened (Taiwan for "Other Asia, nes", Türkiye as Turkey, Viet Nam as Vietnam, Rep. of '
    'Korea as South Korea).'
)

ia['seo'] = {
    'title': 'Ribbon, Lace & Embroidery Tariffs by Country 2026 — China, Taiwan, Vietnam, India, Mexico (HTS Ch. 58) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on Chapter 58 fabrics and trimmings by country: 10% for Taiwanese and EU ribbon, 18.5% '
    'for Vietnamese ribbon, 16% for Indian, up to 57.7% for Chinese cotton pile fabric, 50% Section 338 on Canadian webbing, and nothing for '
    'USMCA goods from Mexico.',
    'keywords': [
        'hts chapter 58 tariff rates by country',
        'chapter 58 textile import tariffs',
        'china tariff on tufted textile fabrics',
        'taiwan lace and embroidery tariffs',
        'usmca tariff rates for woven pile and chenille fabrics',
        'import duty on tulle and knot-net fabrics',
        'india tariff on embroidery',
        'vietnam ribbon tariff',
    ],
}
ia['intro'] = (
    'Chapter 58 base rates run from Free to 20.2%, but the **country of origin** decides most of the cost. Each cell below is the base rate '
    'for that product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started '
    'July 24, 2026: **+10% for India and the UK**, **+12.5% for Vietnam, Turkey and Thailand**, **10% in total for Taiwan and the EU** '
    '(Italy, Germany, France), **12.5% in total for Japan and South Korea**. **China adds 37.5%** on most lines. USMCA-qualifying goods from '
    'Mexico pay nothing; from Canada nothing except the **50% Section 338 duty on 5806.32.20 webbing**, which no USMCA claim removes. '
    'Dominican goods entered under CAFTA-DR pay nothing on dutiable lines. Ribbons from China and Taiwan can also owe antidumping duty, '
    'which the cells leave out.'
)
ia['tradeYear'] = Y

fc['keyTakeaways'] = [
    'Chapter 58 base rates run from Free to 20.2% and did not change in 2025–2026: ribbons 6%, woven labels 7.9%, lace 5%–13.2%, cut velvet '
    '17.2%–18.5%, tapestries Free.',
    'Embroidery rates are in additional U.S. notes 1–5 (Free to 7.4%), but embroidery in the piece pays at least the rate of the plain '
    'fabric.',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% for India and the UK, +12.5% for Vietnam, Turkey and Thailand, 10% in '
    'total for the EU and Taiwan. China pays +37.5% on 106 lines and +20% on man-made-fiber chenille.',
    'Narrow woven ribbons with woven selvedge from China and Taiwan also owe antidumping duty (China-wide 247.65%; Taiwan 4.37%, or 83.67% '
    'for two exporters), and from China countervailing duty.',
    'Labels and badges of 5807 that are informational materials can skip the 2026 Section 301 duty (9903.05.92); ordinary garment labels '
    'cannot.',
    'Canadian 5806.32.20 webbing pays a 50% Section 338 duty even under USMCA; other USMCA goods from Canada and Mexico pay nothing.',
    'The IEEPA duties (up to 50% on Indian goods in late 2025) ended February 24, 2026; the 10% Section 122 surcharge ended July 23, 2026.',
]
fc['faqs'] = [
    {
        'id': 'ribbon-hs-code',
        'question': 'What is the HS code (tariff code) for ribbon?',
        'searchedAs': ['ribbon hs code', 'ribbon tariff code', 'satin ribbon hs code', 'satin ribbon tariff code', 'polyester ribbon hs code',
                       'tape hs code'],
        'answer': 'Woven ribbon is heading 5806 (narrow woven fabrics, 30 cm wide or less with selvedges on both edges). Polyester or nylon '
        'ribbon up to 12 cm wide is 5806.32.10 (6%) — statistical suffixes .20/.30 for polyester and .50/.60 for nylon with woven selvedge; '
        'other man-made-fiber tapes and webbing 5806.32.20 (6.2%), cotton 5806.31 (8.8%). Inked typewriter and printer ribbons are not '
        'Chapter 58 (heading 9612).',
        'link': '',
    },
    {
        'id': 'ribbon-antidumping',
        'question': 'Is there an antidumping duty on narrow woven ribbons?',
        'searchedAs': ['narrow woven ribbon anti dumping', 'narrow woven ribbons with woven selvedge', 'narrow woven ribbons',
                       'ribbon from china'],
        'answer': 'Yes. Since 2010 narrow woven ribbons with woven selvedge, up to 12 cm wide, of man-made fibers or metal thread, from China '
        '(antidumping and countervailing) and Taiwan (antidumping) owe cash deposits on top of regular duty. The China-wide antidumping rate '
        'is 247.65%; Taiwan\'s all-others rate is 4.37%, and 83.67% for two exporters since September 4, 2026. Formed bows, ribbons with 20% or '
        'more elastomeric yarn and other listed goods are excluded; the written scope decides.',
        'link': 'tariff-updates',
    },
    {
        'id': 'woven-label-hs-code',
        'question': 'What is the HS code for woven labels and garment labels?',
        'searchedAs': ['woven label hs code', 'woven labels tariff code', 'fabric label hs code', 'cloth label hs code',
                       'garment label hs code', 'polyester woven label hs code', 'woven main label hs code', 'woven size label hs code',
                       '5807 hs code'],
        'answer': 'Textile labels that are not embroidered are heading 5807: woven labels of cotton or man-made fibers 5807.10.05 (7.9%), '
        'printed labels 5807.90.05 (7.9%), labels of other fibers 4.5%, other badges 3.3%. Embroidered labels are 5810 (man-made fibers '
        '5810.92.90.30, 7.4%). Their origin is where the label fabric was woven. Labels that are informational materials can skip the 2026 '
        'Section 301 duty under 9903.05.92.',
        'link': '',
    },
    {
        'id': 'patch-hs-code',
        'question': 'What is the HS code for embroidered patches and badges?',
        'searchedAs': ['embroidered patches hs code', 'embroidery patches hs code', 'embroidered emblems patch hs code',
                       'polyester embroidery patch hs code', 'patches tariff code', 'embroidery patches tariff code',
                       'embroidery badges hs code', 'clothing patches hs code'],
        'answer': 'Embroidered badges, emblems and motifs of man-made fibers (polyester patches) are 5810.92.10 at 4.2% (additional U.S. '
        'note 2); cotton embroidery is 5810.91.00 (Free), other fibers 5810.99. From China add 37.5% (41.7% in all on a polyester patch); '
        'from India 10%. Woven or printed patches without embroidery are 5807.',
        'link': '',
    },
    {
        'id': 'embroidery-fabric-hs-code',
        'question': 'What is the HS code and duty for embroidered fabric and embroidered lace?',
        'searchedAs': ['embroidery hs code', 'embroidery fabric hs code', 'embroidery lace hs code', 'embroidered tulle hs code',
                       'embroidery tariff code', '5810 hs code'],
        'answer': 'Embroidery in the piece is 5810 by fiber: cotton 5810.91.00, man-made fibers 5810.92.90, wool 5810.99.10, other '
        '5810.99.90; without visible ground 5810.10.00 at 14.1%. The note rates (Free, 7.4%, 4.2%) apply, but embroidery in '
        'the piece pays at least the rate of the same fabric unembroidered. Embroidered fabric takes the origin of its ground fabric.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'lace-hs-code',
        'question': 'What is the HS code for lace and lace trim?',
        'searchedAs': ['lace hs code', 'lace fabric hs code', 'lace tariff code', 'cotton lace hs code', 'polyester lace hs code',
                       'nylon lace hs code', 'lace trim h s code', '5804 hs code'],
        'answer': 'Lace in the piece, strips or motifs is heading 5804: machine-made lace of man-made fibers (polyester, nylon) 5804.21 '
        '(12%), of cotton 5804.29.10 (8%), of other fibers 5%; hand-made lace 5804.30 (13.2%). Knitted lace-look fabrics are Chapter 60, '
        'and embroidered lace is 5810.',
        'link': '',
    },
    {
        'id': 'tulle-hs-code',
        'question': 'What is the HS code for tulle?',
        'searchedAs': ['tulle hs code', 'tulle fabric hs code', 'polyester tulle hs code'],
        'answer': 'Tulle and other net fabrics (not woven, knitted or crocheted) are 5804.10: cotton or man-made fibers 5804.10.10 (6%), other '
        'fibers 5804.10.90 (Free). From China add 37.5%, from the EU the total is 10%.',
        'link': '',
    },
    {
        'id': 'velvet-corduroy-hs-code',
        'question': 'What is the HS code for velvet, corduroy and chenille fabric?',
        'searchedAs': ['velvet fabric hs code', 'polyester velvet fabric hs code', 'cotton velvet fabric hs code', 'corduroy hs code',
                       'corduroy fabric hs code', 'cut corduroy fabric hs code', 'chenille fabric hs code'],
        'answer': 'Woven pile fabrics are 5801. Cut warp-pile velvet: cotton 5801.27.50 (18.5%), man-made fibers 5801.37.50 (17.2%). '
        'Corduroy: cotton 5801.22 (10% over 7.5 wales/cm, otherwise 20.2%), man-made fibers 5801.32 (14%). Chenille: cotton 5801.26 (Free), '
        'man-made fibers 5801.36 (9.8%). Knitted velour and velvet are Chapter 60.',
        'link': '',
    },
    {
        'id': 'hook-loop-hs-code',
        'question': 'What is the HS code for hook-and-loop (Velcro) tape?',
        'searchedAs': ['hook and loop hs code', 'hook and loop tape hs code', 'hook and loop fastener hs code', 'velcro hs code',
                       'velcro tape hs code'],
        'answer': 'Woven hook-and-loop fastener tape of man-made fibers in rolls is 5806.10.24 ("fastener fabric tapes", 7%). From China it '
        'pays 44.5%, from Vietnam 19.5%, from Taiwan and the EU 10%.',
        'link': '',
    },
    {
        'id': 'elastic-tape-hs-code',
        'question': 'What is the HS code for woven elastic tape and webbing?',
        'searchedAs': ['elastic tape hs code', 'woven elastic tape hs code', 'elastic webbing hs code', 'elastic band hs code'],
        'answer': 'Narrow woven fabric with 5% or more by weight of elastomeric yarn or rubber thread is 5806.20.00 (7%). Knitted elastic tape '
        'is Chapter 60 (6002). Non-elastic webbing of man-made fibers is 5806.32.20 (6.2%).',
        'link': '',
    },
    {
        'id': 'terry-tapestry-quilted',
        'question': 'What is the HS code for terry fabric, tapestries and quilted fabric?',
        'searchedAs': ['terry fabric hs code', 'terry cloth hs code', 'cotton terry fabric hs code', 'tapestry hs code', 'tapestry hts code',
                       'quilted fabric hs code'],
        'answer': 'Terry toweling fabric by the meter is 5802: cotton 5802.10 (9.4%–9.8%), other fibers 14%; finished towels are Chapter 63. '
        'Hand-woven and needle-worked tapestries are 5805 (Free). Quilted fabric in the piece is 5811: cotton 6.3%, man-made fibers 8%, wool '
        '13.2%.',
        'link': '',
    },
    {
        'id': 'fabric-from-china',
        'question': 'What are the tariffs on fabric and trim from China?',
        'searchedAs': ['tariffs on fabric from china', 'tariffs on fabric from china to usa', 'tariffs on textiles from china'],
        'answer': 'Chapter 58 goods from China pay the base rate plus 12.5% (9903.05.31) plus 25% under List 3 (9903.88.03) on 106 of 111 '
        'lines: 43.5% on polyester ribbon, 45.4% on woven labels, 54.7% on man-made-fiber velvet. Man-made-fiber chenille is on List 4A '
        '(+7.5%, 29.8% in all). No product exclusion covers Chapter 58. The IEEPA duties ended February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'hts-chapter-58',
        'question': 'What does HTS Chapter 58 cover?',
        'searchedAs': ['hts chapter 58', 'chapter 58 hts 2025'],
        'answer': 'Special woven fabrics, tufted fabrics, lace, tapestries, trimmings and embroidery: velvet and corduroy, terry fabric, gauze, '
        'tulle and lace, tapestries, ribbons and narrow fabrics, labels, braids and tassels, metal-thread fabric, embroidery and quilted '
        'fabric. Its 111 lines run from Free to 20.2%, unchanged from 2025 to Revision 21 of 2026.',
        'link': '',
    },
    {
        'id': 'where-imported',
        'question': 'Where does the U.S. import ribbons, labels and embroidery from?',
        'searchedAs': ['ribbon from china', 'narrow woven fabric manufacturers'],
        'answer': f'In {Y} the U.S. imported {fmt_usd(total)} of Chapter 58 goods: China {fmt_usd(chn)} ({share(chn)}%), Taiwan '
        f'{fmt_usd(tw)} ({share(tw)}%), Vietnam {fmt_usd(vnm)}, India {fmt_usd(ind)} and Mexico {fmt_usd(mex)}. Man-made-fiber ribbons, tapes '
        f'and webbing (5806.32) were the largest product at {fmt_usd(h6("580632"))}.',
        'link': 'understand-industry',
    },
]
d['asOf'] = TODAY
