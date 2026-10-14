# Writer content for Chapter 68, part 3 — industry areas (matrix). Exec'd by fill68.py.
# ruff: noqa

ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 68: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

QSP_L = (
    ' Engineered quartz (6810.99.00.20/.40) adds the safeguard: +25% in quota (9903.45.30) or +50% over quota (9903.45.31).'
)
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on every line.' + QSP_L + ' Chinese quartz also carries '
    'antidumping and countervailing duties, and diamond saw-blade segments, sol-gel abrasive grains and magnesia carbon bricks have their own '
    'orders (not in the cells).',
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 68 line is exempt.' + QSP_L + ' Indian quartz also carries antidumping and '
    'countervailing duties (not in the cells). The IEEPA duties (up to 50%) ended in February 2026.',
    'Brazil': 'Base rate + 12.5% Section 301 (9903.05.27) + 25% Brazil Section 301 (9903.05.01) on every line except 6802.99.00 — quartzite '
    'and other stone — which is on the note 50(a)(ii) exemption list. Brazil is excluded from the quartz safeguard (note 41(c)).',
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). No Chapter 68 line is exempt.' + QSP_L + ' Turkish quartz also carries '
    'antidumping and countervailing duties (not in the cells).',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 68 line is exempt.' + QSP_L,
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). Mexico is excluded from the '
    'quartz safeguard. The 25% IEEPA duty ended February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on '
    '6809.11.00 (gypsum board) and 6810.99.00 (incl. quartz slabs) (9903.03.14), whether or not USMCA is claimed. Canada is excluded from the '
    'quartz safeguard.',
    'Japan': 'Japan: 12.5% in total in place of the base rate (9903.05.49) — every Chapter 68 line is below 12.5%.' + QSP_L,
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 68 line is on the UK exception list.' + QSP_L,
    'Israel': 'Base rate + 12.5% Section 301 (9903.05.47). Israel is excluded from the quartz safeguard (note 41(c)(ii)), so its engineered '
    'quartz pays 12.5% in total.',
    'South Korea': 'Korea: 12.5% in total in place of the base rate (9903.05.71). Korea is excluded from the quartz safeguard (note 41(c)(ii)).',
    'Taiwan': 'Taiwan: 10% in total in place of the base rate (9903.05.76).' + QSP_L,
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54).' + QSP_L,
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77).' + QSP_L,
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate (9903.05.39) — every Chapter 68 line is below 10%, so granite, marble, slate, abrasives and '
    'mineral wool all pay 10%.' + QSP_L + ' The 15%-in-total IEEPA rate ended February 24, 2026.'
)
ANY_LABEL = (
    'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% '
    'in total for Taiwan, Korea and Switzerland; China and Brazil +37.5%. Engineered quartz adds the 25%/50% safeguard unless the country is '
    'on the note 41(c) list (Israel, Korea, Australia, the CAFTA-DR countries, Indonesia, the Philippines and other listed developing '
    'countries). Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — up to 60%.'
)
for c in ia['countries']:
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        r['label'] = RULE_LABELS[name]
    elif r.get('atLeast'):
        r['label'] = ANY_LABEL
        r['ch99Code'] = '9903.05.20–9903.05.84'
    elif r['kind'] == 'eu15':
        r['label'] = EU_LABEL
    else:
        raise SystemExit(f'no rule label for {name}')
    if name in ('Canada', 'Mexico') and 'eo-14389' not in r['sourceIds']:
        r['sourceIds'].insert(-1, 'eo-14389')
add_sources(ia, ['eo-14389'])

# The generator labels the quartz-fact cells itself (#1843); only guard against raw fact names.
blob = json.dumps([ia['countries'], ia['biggestLanes']]).replace(': null', '')
for bad in ('quartzSurfaceProduct', 'QuartzSurfaceProduct', ' null'):
    if bad in blob:
        i = blob.index(bad)
        raise SystemExit('fact labels left in matrix: ' + blob[i - 300:i + 100])

assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Engineered quartz (6810.99.00.20/.40): cells show three totals — "not quartz surface", "quartz surface product within '
    'quota" (+25%, 9903.45.30) and "quartz surface product over quota" (+50%, 9903.45.31). Which applies depends on the goods and on the quarter\'s quota fill, so '
    'the importer has to answer; countries on the note 41(c) list (Canada, Mexico, Brazil, Israel, Korea and others) show one total.',
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on 6809.11.00 and '
    '6810.99.00 because U.S. note 51(a) applies it even when a special rate is claimed.',
    'The compound rate on 6804.22.10 (5¢/kg + 2%) is compared at the $10,000 / 1,000 kg test shipment ($10 per kg) for the EU and Japan '
    '"in total" rules, so it counts as 2.5%.',
    'Not in the cells: antidumping and countervailing duties — on quartz surface products from China, India and Turkey, diamond saw-blade '
    'segments and sol-gel abrasive grains from China, and magnesia carbon bricks from China and Mexico — whose company-specific cash deposits '
    'are set by Commerce; the China List 3 exclusion for certain sandstone pavers (6802.99.00.90); civil-aircraft relief for 6812–6813; FTA '
    'and AGOA preferences; and EPA\'s asbestos import bans.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 33, 41, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) and the country exception lists in note 52(j) name no Chapter 68 line; note 52(d) relieves '
    'civil-aircraft articles of 6812.80.90, 6812.99, 6813.20, 6813.81 and 6813.89. The Brazil list (note 50(a)(ii)) names 6802.99.00. The '
    'Canada Section 338 motor-vehicle list (note 51(b)(3)) names 6809.11.00 and 6810.99.00; the alcoholic-beverage and dairy lists name none. '
    'China: List 3 (note 20(f)) covers every Chapter 68 subheading; no Chapter 68 line is on List 1, 2 or 4A or in the 2024 increases (note '
    '31); the only exclusion in effect (note 20(vvv)(iii)) covers two sandstone products of 6802.99.00.90, through November 9, 2026 — the '
    'older exclusions printed in note 20 (cement backer boards, other sandstone, marble and calcareous-stone articles, graphite sheet) have expired. Note 41 sets the quartz '
    'safeguard on 6810.99.00.20 and 6810.99.00.40 and lists the excluded countries in 41(c). Section 232: no Chapter 68 line is on the note '
    '16 or note 19 metal lists or the note 33 automobile-parts list; the certified-parts elections are not shown. Note 30(b) sets 35% for '
    '17 Russian subheadings in place of column 2. The 9902 temporary duty suspensions for 6806.10.00 ceramic-fiber mats expired December 31, '
    '2020. A Federal Register search of Commerce (ITA) notices since 2015 by every Chapter 68 statistical number found orders only on quartz '
    'surface products, diamond sawblade parts, sol-gel abrasive grains and magnesia carbon bricks.'
)
ia['lastCheckedAt'] = TODAY

exec(open(__file__.replace('fill68.py', 'fill68_text4.py')).read())
