# Executed from fill90.py (shares its globals): tariff updates, industry areas, understand industry,
# tariff engineering and FAQ text for Chapter 90.

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 90: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 90 Tariff Updates 2026: Medical Device, Optical & Instrument Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 90 — medical devices, syringes, implants, X-ray, lab and measuring instruments, '
    'lenses and eyeglasses — since January 2025: the end of the IEEPA and Section 122 duties, the 2026 Section 301 tariffs, the 100% China '
    'duty on syringes and needles, Section 232 auto parts and metals, the pending Section 232 medical-device investigation and Canada '
    'Section 338, with Federal Register citations.',
    'keywords': [
        'medical device tariffs 2026',
        'health care equipment tariffs',
        'medical device tariffs 232',
        'section 232 medical devices investigation',
        'tariffs on medical devices from china',
        'syringe tariff china 100%',
        'section 301 tariff medical devices',
        'hts chapter 90 tariff updates',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 90 base rate changed** and no line was added or renumbered: medical, surgical, '
    'dental and orthopedic devices are still Free, and most instruments pay Free to about 7%.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached medical devices and instruments from almost every '
    'country — up to 145% extra for China in April–May 2025, 15% in total for the EU and Japan from August 2025. They **ended on February 24, '
    '2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies '
    'pay a **Section 301 tariff**: +10% (Mexico and Canada unless USMCA, Malaysia, India, the UK), +12.5% (Costa Rica, Singapore, Israel, '
    'Vietnam, China), 10% in total for the EU and Taiwan, 12.5% for Japan, Korea and Switzerland. Ten semiconductor-equipment measuring '
    'lines are exempt, and so are 63 British medical-device lines. China also keeps its 2018–2019 lists (**+25%** on most imaging, '
    'analytical and measuring instruments, **+7.5%** on lenses, frames, sunglasses, binoculars and cameras) and, since September 27, 2024, '
    '**+100% on syringes and needles**. Two kinds of **Section 232** duty reach the chapter: vehicle-parts duties on rangefinders, '
    'speedometers and counters that are car or truck parts, and since April 6, 2026 a 15%-in-total metals duty on 9013.90.80 optical parts. '
    'A **Section 232 investigation of medical devices, consumables and PPE**, opened September 2, 2025, has not led to any duty. Since August '
    '22, 2026 Canadian optical measuring instruments of 9031.49.90 pay a **50% Section 338 duty**, even under USMCA. No antidumping or '
    'countervailing duty order names a Chapter 90 product.'
)
tu['scope'] = (
    'Measures that reach Chapter 90 from any country: the 2026 Section 301 tariffs on 60 economies and their exemptions (notes 52(b), 52(d), '
    '52(j)), the Brazil Section 301 tariff, the China Section 301 Lists 1, 2, 3 and 4A, the 2024 China increases and the product exclusions, '
    'the Section 232 duties on automobile parts, medium- and heavy-duty vehicle parts and steel, aluminum and copper derivatives, the 200% '
    'duty on Russian aluminum, the Canada Section 338 duties, Russia\'s rates in lieu of column 2, and the 2025–2026 IEEPA and Section 122 '
    'duties that have ended. Pending: the Section 232 investigation of medical equipment and devices, and the Section 232 semiconductor '
    'action, which so far charges no Chapter 90 line. For the rate each supplier pays, see Rates by country.'
)

NO_52J = 'Its note 52(j) exception list names no Chapter 90 line. '
EXEMPT_52B = (
    f'The {N_52B} semiconductor-related measuring and inspection lines on the note 52(b) list (9030.82, 9030.90.84, 9031.41, 9031.49.70, '
    '9031.80.40, 9031.90.45, 9031.90.54, 9031.90.70) pay no Section 301 duty. '
)
VEH_PARTS = (
    'Rangefinders (9015.10), revolution counters (9029.10) and speedometers (9029.20.40.80) pay the 25% Section 232 vehicle-parts duty instead '
    'when they are car, truck or bus parts (note 52(f)). '
)
METALS = 'Other parts of optical appliances of 9013.90.80 pay 15% in total under Section 232 (metals) instead. '
AIR = f'Civil aircraft parts and instruments ({N_AIR} lines) are exempt with a certification (note 52(d), 9903.05.88). '

IN_EFFECT_TEXT = {
    'China': (
        f'Several Section 301 duties stack. The 2026 action adds +12.5% (9903.05.31) on {N_LINES - N_52B} lines. The 2018–2019 lists add +25% on '
        f'{N_L1} lines (List 1, 9903.88.01) — most electro-diagnostic, ultrasound and X-ray apparatus, microscopes, navigation, lab, electrical '
        f'test, measuring and control instruments — +25% on {N_L2} lines (List 2, 9903.88.02: optical fibers, polarizing sheet, thermometers, '
        f'utility meters, speedometers, multimeters), +25% on {N_L3} lines (List 3, 9903.88.03: optical elements, cine and photo-lab equipment, '
        f'surveying, drafting and hand measuring instruments) and +7.5% on {N_L4A} lines (List 4A, 9903.88.15: contact and spectacle lenses, '
        f'frames, sunglasses, binoculars, cameras). Syringes and needles (9018.31, 9018.32, {N_31} lines) pay +100% under the 2024 increase '
        f'(note 31(d), 9903.91.03) instead of a list duty. {N_CN_NONE} lines are on no list — catheters, dental, ophthalmic and other medical '
        'instruments, therapy and respiratory apparatus, breathing appliances, orthopedic devices, implants other than pacemakers, hearing '
        'aids, some X-ray parts '
        'and liquid thermometers — and pay only the 12.5%. Product exclusions (note 20(vvv), 9903.88.69) run through November 9, 2026 for '
        'about 20 items, among them ECG electrodes, ultrasound scanners, professional blood-pressure monitors and pulse oximeters, anesthesia '
        'instruments, PET/CT scanners, radiotherapy systems, X-ray tube housings, protective goggles, prism binoculars and some thermometers. '
        + EXEMPT_52B + 'They still pay the list duty. ' + VEH_PARTS + METALS + 'The IEEPA duties ended February 24, 2026, and USTR\'s '
        'four-year review kept the lists in place.',
        'Chinese medical instruments pay 12.5% to 37.5% on top of a Free base rate; syringes and needles 112.5%; optical fibers 44.2%; '
        'sunglasses 22%; a CT scanner or patient monitor 37.5%; a hip implant or hearing aid 12.5%.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94) and no Section 232 vehicle-parts duty (9903.94.06, 9903.74.10). Others pay '
        'the base rate + 10% (9903.05.55). ' + EXEMPT_52B + VEH_PARTS + 'The Section 232 metals duty on 9013.90.80 (15% in total) applies '
        'even to USMCA goods. Mexico is not subject to the Canada Section 338 duty. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended '
        'February 24, 2026.',
        'USMCA-qualifying Mexican medical devices, catheters, implants and instruments enter Free; a non-qualifying one pays 10% on top of its '
        'base rate.',
    ),
    'Canada': (
        'Three measures. The 2026 Section 301 duty (+10%, 9903.05.29) and the Section 232 vehicle-parts duties do not apply to USMCA-qualifying '
        'goods (9903.05.93, 9903.94.06, 9903.74.10). The Section 338 duty (+50%, from August 22, 2026, 9903.03.14) applies to products of '
        f'Canada in one Chapter 90 subheading — other optical measuring or checking instruments (9031.49.90, {N_CA338} line) — and U.S. note '
        '51(a) applies it even when USMCA is claimed; the civil aircraft relief (9903.03.16) does not list 9031.49.90. The September 15, 2026 '
        'list revisions '
        'and the September 29 import bans changed no Chapter 90 entry. The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, '
        '2026.',
        'USMCA-qualifying Canadian instruments and devices enter Free, except 9031.49.90 optical measuring instruments: 50% with USMCA, 60% '
        'without.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10% — every Chapter 90 line except rifle scopes (14.9%) and their parts (16%) — the total is '
        '10% (9903.05.39); at 10% or more nothing is added (9903.05.38, note 52(k)). Parts that pay "the rate applicable to the article" pay '
        'the higher of 10% and that rate. ' + EXEMPT_52B + NO_52J + 'Rangefinders, counters and speedometers that are car parts pay 15% in '
        'total (9903.94.53, from August 1, 2025); truck and bus parts pay the base rate + 25% (9903.74.08). ' + METALS + AIR + 'This replaced '
        'the 15%-in-total IEEPA rate (9903.02.20), which ended February 24, 2026.',
        'German, Irish, French or Danish medical devices, implants, hearing aids and instruments pay 10% in total; a German wafer-inspection '
        'system nothing.',
    ),
    'Japan': (
        'Japan pays its base rate or 12.5%, whichever is higher (9903.05.49, note 52(k)). ' + EXEMPT_52B + 'Car-part rangefinders, counters '
        'and speedometers pay 15% in total (9903.94.43, since September 16, 2025); truck and bus parts pay the base rate + 25% (9903.74.08). '
        + METALS + 'The 15%-in-total IEEPA rate ended February 24, 2026.',
        'Japanese ultrasound, lenses, cameras and lab analyzers pay 12.5% in total; semiconductor inspection equipment of the '
        'note 52(b) list enters Free.',
    ),
    'South Korea': (
        'Korea pays its base rate or 12.5%, whichever is higher (9903.05.71, note 52(k)); KORUS (KR) makes most base rates Free but does not '
        'remove this duty. ' + EXEMPT_52B + 'Car-part rangefinders, counters and speedometers pay 15% in total (9903.94.63, since November 1, '
        '2025). ' + METALS + 'The 15% IEEPA rate ended February 24, 2026.',
        'Korean ultrasound, X-ray and measuring instruments pay 12.5% in total.',
    ),
    'Taiwan': (
        'Taiwan pays its base rate or 10%, whichever is higher (9903.05.76). ' + EXEMPT_52B + 'Car-part rangefinders, counters and speedometers '
        'pay 15% in total (9903.94.67, since May 1, 2026). ' + METALS + 'The 20% IEEPA duty (9903.02.60) ended February 24, 2026.',
        'Taiwanese lenses, electrical test and measuring instruments pay 10% in total.',
    ),
    'Switzerland': (
        'Switzerland pays its base rate or 12.5%, whichever is higher (9903.05.74, note 52(k)). ' + EXEMPT_52B + NO_52J + VEH_PARTS + METALS
        + 'The IEEPA duty — 39% from August 7, 2025, cut to 15% in total from November 14, 2025 under the U.S.-Switzerland framework — ended '
        'February 24, 2026.',
        'Swiss implants, hearing aids, diagnostic and lab instruments pay 12.5% in total.',
    ),
    'United Kingdom': (
        f'Base rate + 10% (9903.05.81) on {N_LINES - N_52B - N_GB} lines. The UK exception list in note 52(j)(1) (9903.05.96) exempts {N_GB} '
        'medical lines: electro-diagnostic, ultrasound, MRI and scintigraphic apparatus, patient monitors, dental, ophthalmic, anesthetic and '
        'other 9018 instruments (not syringes, needles or catheters), therapy and respiratory apparatus, breathing appliances, artificial joints '
        'and other prostheses, hearing aids, pacemakers and X-ray, CT and radiotherapy apparatus and parts. ' + EXEMPT_52B + 'Car-part '
        'rangefinders, counters and speedometers on the note 33(j) UK list pay 10% in total (9903.94.32). ' + METALS + 'The 10% IEEPA duty '
        'ended February 24, 2026.',
        'British MRI, ultrasound, hearing aids and artificial joints enter Free; British syringes, catheters and lab instruments pay 10%.',
    ),
    'Costa Rica': (
        'Base rate + 12.5% (9903.05.33). CAFTA-DR (P) makes the few dutiable lines Free but does not remove this duty; the CAFTA-DR textile '
        'exemption (note 52(i)) does not reach Chapter 90. ' + EXEMPT_52B + NO_52J + VEH_PARTS + METALS + 'The IEEPA reciprocal duty ended '
        'February 24, 2026.',
        'Costa Rican catheters, guidewires and other medical devices pay 12.5% on top of their Free base rate.',
    ),
    'Singapore': (
        'Base rate + 12.5% (9903.05.68). The Singapore FTA (SG) removes the base rate but not this duty. ' + EXEMPT_52B + VEH_PARTS + METALS
        + 'The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'Singaporean respiratory devices, lab analyzers and implants pay 12.5%.',
    ),
    'Malaysia': (
        'Base rate + 10% (9903.05.54). ' + EXEMPT_52B + NO_52J + VEH_PARTS + METALS + 'The 19% IEEPA duty ended February 24, 2026.',
        'Malaysian test and measuring instruments and medical devices pay 10% on top of their base rate.',
    ),
    'Israel': (
        'Base rate + 12.5% (9903.05.47). The Israel FTA (IL) removes the base rate but not this duty. ' + EXEMPT_52B + VEH_PARTS + METALS
        + 'The IEEPA reciprocal duty ended February 24, 2026.',
        'Israeli medical devices and instruments pay 12.5%.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + EXEMPT_52B + VEH_PARTS + METALS + 'The 20% IEEPA duty (9903.02.69) ended February 24, 2026.',
        'Vietnamese sunglasses pay 14.5%, medical devices 12.5%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + EXEMPT_52B + VEH_PARTS + METALS + 'The IEEPA duties on India (25% from August 7, 2025, plus 25% '
        'from August 27) ended in February 2026.',
        'Indian catheters, syringes and other medical devices pay 10%.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 90 line; civil aircraft articles (note 50(a)(iv)) and goods paying '
        'Section 232 (note 50(a)(vi)) are exempt from the 25%. The 40% IEEPA duty on Brazil (Executive Order 14323) ended February 24, 2026.',
        'Brazilian medical devices and instruments pay 37.5% on top of the base rate; 9013.90.80 parts 15% in total.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — mostly 20% to 85%, up to 110% — plus +12.5% (9903.05.66). Seven subheadings listed in U.S. note '
        f'30(b) (9002.20.40, 9006.91, 9007.91.40, 9008.90.80, 9014.20.80, 9014.80.50, 9023.00; {N_RU} statistical lines) pay 35% '
        '(9903.90.08) in place of the column 2 rate. Parts of optical appliances (9013.90.80) and of measuring instruments (9031.90.91) made '
        'of Russian aluminum, or of aluminum smelted or cast in Russia, pay +200% (9903.85.68, note 19(k)).',
        'Russian instruments are effectively priced out: column 2 rates of 20%–85% plus 12.5%, and 200% more on aluminum parts.',
    ),
}
OTHER_TEXT = (
    'The other Section 301 economies pay +10% or +12.5% (9903.05.20–9903.05.84): for example the Dominican Republic, Thailand, Australia and '
    'the Philippines +12.5%, Indonesia, Cambodia and Pakistan +10%. ' + EXEMPT_52B + 'No other country\'s exception list in note 52(j) '
    'names a Chapter 90 line. ' + VEH_PARTS + METALS + AIR + 'Countries outside the 60 economies pay only the base rate.',
    'Dominican catheters and Thai lenses pay 12.5%; a device from a country outside the 60 economies pays only the base rate, usually '
    'nothing.',
)
METALS_TEXT = (
    'Covers 1 Chapter 90 line on the note 16(c)(ix) list of derivative aluminum articles: other parts and accessories of lasers and other '
    'optical appliances (9013.90.80, base 4.5%). Until December 31, 2027 it pays 15% in total (9903.82.10, note 16(f)), or 10% in total when '
    'at least 85% of the aluminum was smelted and cast in the United States (9903.82.07, note 16(e)); from January 1, 2028 the base rate + 25% '
    '(UK 15%, U.S. metal 10%). No Section 232 duty if the article contains no aluminum, steel or copper (9903.82.01) or the metal is under 15% '
    'of its weight (9903.82.03). Charged on the full value, on top of any FTA or USMCA rate, and in place of the 2026 Section 301 and Brazil '
    'duties (notes 52(f), 50(a)(vi)).',
    'A $10,000 shipment of aluminum optical-instrument parts pays $1,500 from almost any country; with China\'s List 3 duty, $4,000.',
)
METALS_GN3B_TEXT = (
    'Column 2 countries (Belarus, Cuba, North Korea) pay the column 2 rate + 25% on 9013.90.80 derivative aluminum articles (9903.82.12, note '
    '16(c)(ix)–(x)). Russia pays 200% instead (9903.85.68).',
    'Chapter 90 trade with these countries is negligible.',
)
AUTO_TEXT = (
    'Covers 5 Chapter 90 lines on the U.S. note 33(g) list: rangefinders (9015.10.40, 9015.10.80), revolution and production counters and '
    'odometers (9029.10.40, 9029.10.80) and speedometers and tachometers (9029.20.40.80). It applies only when they are parts of passenger '
    'vehicles or light trucks; listed articles that are not such parts, and USMCA-qualifying parts, enter under 9903.94.06 with no Section '
    '232 duty (note 33(h)). Japan, the EU, Korea and Taiwan pay 15% in total; the UK 10% in total. Parts that pay it are exempt from the 2026 '
    'Section 301 and Brazil duties (notes 52(f), 50(a)(vi)); China\'s List 2 or 3 duty still applies.',
    'A car speedometer from Mexico (non-USMCA), Malaysia or India pays 25%; from Japan or the EU 15% in total; from China 50% with List 2.',
)
MHDV_TEXT = (
    'Covers 2 Chapter 90 lines on the U.S. note 38(i) list: other counters and odometers (9029.10.80) and speedometers and tachometers '
    '(9029.20.40.80) — when they are parts of medium- and heavy-duty trucks, tractors or buses. USMCA-qualifying parts enter under 9903.74.10 '
    'and articles that are not such parts under 9903.74.11. A part of a passenger vehicle or light truck pays the automobile-parts duty '
    'instead. There is no deal rate for the UK, EU, Japan, Korea or Taiwan. Exempt from the 2026 Section 301 duty (note 52(f)).',
    'A truck speedometer pays 25% from Germany, Japan, Mexico (non-USMCA) or Korea, and 50% from China (with List 2); a USMCA-qualifying '
    'one pays nothing.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Dominican Republic, Thailand, Australia, Philippines, Indonesia)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    elif key.startswith('Belarus'):
        e['measure'] = 'Section 232 derivative aluminum (column 2 countries)'
        e['exemption'], e['whatItMeans'] = METALS_GN3B_TEXT
    elif 'steel, aluminum, copper' in e['measure']:
        e['country'] = 'All countries except Belarus, Cuba, North Korea and Russia'
        e['measure'] = 'Section 232 derivative aluminum (fixed industrial equipment, note 16(c)(ix))'
        e['now'] = '15% in total (10% with U.S.-smelted aluminum)'
        e['exemption'], e['whatItMeans'] = METALS_TEXT
    elif 'automobile parts' in e['measure']:
        e['country'] = 'All countries (15% in total for Japan, the EU, South Korea and Taiwan; 10% in total for the UK)'
        e['measure'] = 'Section 232 automobile parts (passenger vehicles and light trucks)'
        e['now'] = '+25% (15% in total for JP, EU, KR, TW; 10% for UK)'
        e['exemption'], e['whatItMeans'] = AUTO_TEXT
    elif 'medium- and heavy-duty' in e['measure']:
        e['measure'] = 'Section 232 medium- and heavy-duty vehicle parts'
        e['exemption'], e['whatItMeans'] = MHDV_TEXT
    else:
        raise SystemExit(f'no inEffect text for {key} / {e["measure"]}')
    c = e['country']
    if c == 'European Union':
        e['measure'] = 'Section 301 tariff, EU rate + Section 232 auto parts, EU rate'
        e['now'] = '10% in total; 15% in total on car-part instruments'
    elif c == 'Japan':
        e['measure'] = 'Section 301 tariff, Japan rate + Section 232 auto parts, Japan rate'
        e['now'] = '12.5% in total; 15% in total on car-part instruments'
    elif c == 'South Korea':
        e['measure'] = 'Section 301 tariff, Korea rate + Section 232 auto parts, Korea rate'
        e['now'] = '12.5% in total; 15% in total on car-part instruments'
    elif c == 'Taiwan':
        e['measure'] = 'Section 301 tariff, Taiwan rate + Section 232 auto parts, Taiwan rate'
        e['now'] = '10% in total; 15% in total on car-part instruments'
    elif c == 'Switzerland':
        e['measure'] = 'Section 301 tariff, Switzerland rate'
        e['now'] = '12.5% in total'
        for sid in ('eo-14326', 'fr-2025-23316'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif c == 'United Kingdom':
        e['measure'] = 'Section 301 tariff (not on 63 medical lines) + Section 232 auto parts, UK rate'
        e['now'] = '+10%; none on the 63 note 52(j)(1) medical lines; 10% in total on UK-listed car-part instruments'
    elif c == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)'
        e['now'] = '+10% (non-USMCA); +50% on 9031.49.90, USMCA or not'
    elif c == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action, Lists 1–4A and the 2024 increase on syringes and needles'
        e['now'] = '+37.5% (List 1, 2 or 3 lines), +20% (List 4A), +112.5% (syringes and needles), +12.5% (other lines)'
        for sid in ('fr-2025-21671', 'fr-2019-17865', 'fr-2020-00904', 'fr-2018-17709'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif c == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif c == 'Russia':
        e['measure'] = 'Section 301 tariff + 35% in lieu of column 2 + Section 232 (Russian aluminum)'
        e['now'] = '+12.5%; 35% in place of column 2 on 8 lines; +200% on aluminum parts of 9013.90.80 and 9031.90.91'
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (2026 action)'
    elif c.startswith('Other Section 301'):
        e['measure'] = 'Section 301 tariff (2026 action)'
        e['now'] = '+10% or +12.5%'

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty reaches optical measuring instruments',
        '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 90 is on the 9903.03.14 list with one subheading: other '
        'optical instruments and appliances for measuring or checking (9031.49.90). Unlike the Section 301 duty, it applies to USMCA-qualifying '
        'goods too (U.S. note 51(a)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover almost all of Chapter 90',
        f'10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), reaching {N_LINES - N_52B} of {N_LINES} lines. The general '
        f'exemption list (note 52(b), 9903.05.86) takes out {N_52B} semiconductor-related lines: instruments for measuring or checking '
        'semiconductor wafers or devices (9030.82), optical inspection of wafers, photomasks and reticles (9031.41), mask inspection (9031.49.70), '
        'electron-beam measuring microscopes (9031.80.40) and their parts. EU and Taiwan goods pay 10% in total, Japan, Korea and Switzerland '
        '12.5%. The UK exception list (note 52(j)(1)) exempts 63 British medical-device lines. Civil aircraft articles (note 52(d)), vehicle '
        'parts and metals that pay Section 232 (note 52(f)) and USMCA-qualifying goods (9903.05.93, 9903.05.94) are exempt.',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 90 line is on the Brazil exemption list (U.S. note 50(a)(ii)); civil aircraft '
        'articles and goods that pay Section 232 are exempt. From July 24 the 12.5% 2026 tariff (9903.05.27) is added on top.',
    ),
    'section-232-automobile-parts-2026-05-01': (
        'Taiwan: Section 232 auto parts capped at 15% in total',
        'Taiwanese rangefinders, counters and speedometers that are car or light-truck parts pay 15% in total in place of the base rate and the '
        '25% duty (9903.94.67).',
    ),
    'section-232-steel-aluminum-copper-scheduled-2028-01-01': (
        'Scheduled: metals duty on 9013.90.80 optical parts rises to 25% in 2028',
        'From January 1, 2028 the temporary 15%-in-total rate for fixed industrial equipment derivatives ends: 9013.90.80 will pay the base rate '
        '+ 25% (9903.82.09), 15% for UK goods with UK-smelted or cast aluminum (9903.82.05) and 10% with U.S.-smelted aluminum (9903.82.06) '
        '(Proclamation 11021, clause 7).',
    ),
    'section-232-steel-aluminum-copper-2026-04-06': (
        'Section 232 metals duty on 9013.90.80 optical parts: 15% in total',
        'Proclamation 11021 rebuilt the Section 232 metals duties on the full customs value and listed 9013.90.80 (other parts and accessories of '
        'lasers and other optical appliances) among the fixed industrial equipment derivatives of U.S. note 16(c)(ix): 15% in total until '
        'December 31, 2027 (9903.82.10), 10% in total with at least 85% U.S.-smelted and cast aluminum (9903.82.07), base rate + 25% for '
        'column 2 countries (9903.82.12). Goods with no aluminum, steel or copper, or less than 15% metal by weight, are outside it (9903.82.01, '
        '9903.82.03). The same proclamation ended the general aluminum-content duty on 9031.90.91 parts (except Russian aluminum).',
    ),
    'section-301-nicaragua-scheduled-2027-01-01': (
        'Scheduled: Section 301 tariff on products of Nicaragua',
        'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
        '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    ),
    'section-232-automobile-parts-2025-11-01': (
        'South Korea: Section 232 auto parts capped at 15% in total',
        'Korean rangefinders, counters and speedometers that are car or light-truck parts pay 15% in total (9903.94.63), retroactive to November '
        '1, 2025, under the notice published December 4, 2025.',
    ),
    'section-232-medium-and-heavy-duty-vehicle-parts-2025-11-01': (
        'Section 232 duty on truck and bus speedometers and counters',
        '25% on parts of medium- and heavy-duty vehicles listed in U.S. note 38(i) (9903.74.08), from every country with no deal rate: in '
        'Chapter 90, other revolution counters and odometers (9029.10.80) and speedometers and tachometers (9029.20.40.80). USMCA-qualifying '
        'parts are exempt (9903.74.10).',
    ),
    'section-232-automobile-parts-2025-09-16': (
        'Japan: Section 232 auto parts capped at 15% in total',
        'Japanese rangefinders, counters and speedometers that are car or light-truck parts pay 15% in total in place of the base rate and the '
        '25% duty (9903.94.43).',
    ),
    'section-232-automobile-parts-2025-08-01': (
        'EU: Section 232 auto parts capped at 15% in total',
        'EU rangefinders, counters and speedometers that are car or light-truck parts pay 15% in total (9903.94.53), retroactive to August 1, '
        '2025, under the notice published September 25, 2025.',
    ),
    'section-232-automobile-parts-2025-06-30': (
        'UK: Section 232 auto parts at 10% in total',
        'British rangefinders (9015.10.40.00, 9015.10.80.00), counters (9029.10.40.00, 9029.10.80.00) and speedometers (9029.20.40.80), all on '
        'the UK list in note 33(j), pay 10% in total (9903.94.32) when they are car parts.',
    ),
    'section-232-automobile-parts-2025-05-03': (
        'Section 232 duty on automobile parts reaches rangefinders, counters and speedometers',
        '25% on the automobile parts listed in U.S. note 33(g) (9903.94.05), from every country: in Chapter 90, rangefinders (9015.10), '
        'revolution counters, production counters and odometers (9029.10) and other speedometers and tachometers (9029.20.40.80), when they are '
        'parts of passenger vehicles or light trucks. USMCA-qualifying parts and listed articles that are not such parts enter under '
        '9903.94.06.',
    ),
    'section-232-aluminum-russia-2025-03-12': (
        '200% Section 232 duty on Russian aluminum derivatives continued',
        'Proclamation 10895 restored the Section 232 aluminum duty for every country from March 12, 2025 and kept the 200% rate for aluminum '
        'products of Russia and for aluminum smelted or cast in Russia (first set by Proclamation 10522). In Chapter 90 it reaches the two lines '
        'on the note 19(k) derivative list: other parts of optical appliances (9013.90.80) and parts of measuring instruments (9031.90.91) '
        '(9903.85.68).',
    ),
}
for c in tu['changes']:
    if c['id'] in CHANGE_DETAIL:
        c['title'], c['detail'] = CHANGE_DETAIL[c['id']]
    if c['id'] == 'base-rates':
        c['date'] = TODAY
        c['title'] = 'No Chapter 90 base-rate changes'
        c['detail'] = (
            f'All {N_LINES} Chapter 90 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition, '
            'and no line was added or renumbered.'
        )
    if c['id'] == 'section-232-steel-aluminum-copper-2026-04-06':
        c['countries'] = 'All (column 2 countries + 25%)'
        c['now'] = '15% in total (10% with U.S. aluminum)'
    if c['id'] == 'section-232-steel-aluminum-copper-scheduled-2028-01-01':
        c['countries'] = 'All'
    if c['id'] == 'section-232-automobile-parts-2025-08-01':
        c['countries'] = 'European Union'
    if 'TODO' in c['detail']:
        raise SystemExit(f'unfilled change {c["id"]}')

EXTRA_CHANGES = [
    {
        'id': 'cn-301-continue',
        'type': 'reference',
        'date': '2026-10-07',
        'dateLabel': 'Published',
        'title': 'China Section 301 lists continue after the four-year review',
        'detail': 'USTR announced that the 2018 China Section 301 actions did not terminate on their 2026 anniversaries because domestic '
        'industries asked for them to continue. For Chapter 90 this keeps +25% (Lists 1, 2 and 3) on most medical imaging, analytical, '
        'measuring and optical goods and +7.5% (List 4A) on lenses, frames, sunglasses, binoculars and cameras.',
        'before': '+7.5% / +25%',
        'now': '+7.5% / +25%',
        'countries': 'China',
        'sourceIds': ['fr-2026-20510'],
    },
    {
        'id': 'ca-338-scope',
        'type': 'reference',
        'date': '2026-09-15',
        'dateLabel': 'Effective',
        'title': 'Canada Section 338 lists revised; Chapter 90 entry unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists and made the 50% apply in '
        'addition to any Section 232 duty. 9031.49.90 stays on the list, no other Chapter 90 provision was added, and the September 29, 2026 '
        'Canadian import bans name no Chapter 90 product.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11064', 'procl-11065', 'csms-69851916'],
    },
    {
        'id': 's122-end',
        'type': 'extraDuty',
        'date': '2026-07-23',
        'dateLabel': 'Expired',
        'title': 'Section 122 import surcharge expired',
        'detail': 'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.',
        'before': '+10%',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'usmca-review',
        'type': 'reference',
        'date': '2026-07-01',
        'dateLabel': 'Announced',
        'title': 'USMCA joint review: not renewed, still in force',
        'detail': 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
        'resolution of the issues or until termination, so USMCA claims (SPI S) still remove the base rate, the Section 301 duty and the '
        'Section 232 vehicle-parts duties on qualifying Mexican and Canadian medical devices and instruments.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 90 subheading was on the product exemption list '
        '(9903.03.03); civil aircraft articles were relieved (9903.03.05). USMCA-qualifying goods from Canada and Mexico and goods paying '
        'Section 232 were exempt.',
        'before': 'None',
        'now': '+10% (until July 23, 2026)',
        'countries': 'All',
        'sourceIds': ['procl-11012', 'hts-now'],
    },
    {
        'id': 'ieepa-end',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'All IEEPA tariffs end',
        'detail': 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
        'Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from '
        '12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
        'before': 'Varied by country',
        'now': 'None',
        'countries': 'All',
        'sourceIds': ['scotus-24-1287', 'eo-14389', 'csms-67834313'],
    },
    {
        'id': 'semis-232',
        'type': 'reference',
        'date': '2026-01-14',
        'dateLabel': 'Signed',
        'title': 'Section 232 semiconductor action: no Chapter 90 line charged',
        'detail': 'Proclamation 11002 found that imports of semiconductors, semiconductor manufacturing equipment and their derivatives threaten '
        'national security. It put a 25% duty (U.S. note 39, 9903.79.01) only on certain advanced logic chips and products containing them, '
        'classified in 8471.50, 8471.80 and 8473.30, and ordered negotiations on the rest; it said broader tariffs on semiconductor '
        'manufacturing equipment may follow. No Chapter 90 line — including the wafer and mask inspection equipment of 9031.41 — is on the '
        'note 39 list.',
        'before': None,
        'now': 'No Chapter 90 duty',
        'countries': 'All',
        'sourceIds': ['procl-11002', 'hts-now'],
    },
    {
        'id': 'medical-232',
        'type': 'pending',
        'date': '2025-09-26',
        'dateLabel': 'Published',
        'title': 'Section 232 investigation of medical equipment, devices, consumables and PPE',
        'detail': 'Commerce opened a national security investigation on September 2, 2025 into imports of personal protective equipment, medical '
        'consumables (for example syringes, needles, catheters, infusion pumps, surgical instruments and anesthesia equipment) and medical '
        'equipment and devices (for example pacemakers, insulin pumps, stents, heart valves, hearing aids, prosthetics, orthopedic appliances, '
        'glucose monitors, CT and MRI scanners, X-ray, electrosurgical and respiratory apparatus) — most of headings 9018–9022. Comments were '
        'due October 17, 2025. As of October 13, 2026 no proclamation has imposed a duty under it.',
        'before': None,
        'now': 'Investigation open; no duty',
        'countries': 'All',
        'sourceIds': ['bis-232-medical'],
    },
    {
        'id': 'india-oil-end',
        'type': 'extraDuty',
        'date': '2026-02-07',
        'dateLabel': 'Effective',
        'title': "India's extra 25% IEEPA duty removed",
        'detail': 'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% '
        'reciprocal rate on India ended with the other IEEPA duties on February 24.',
        'before': '+50%',
        'now': '+25% (until February 24, 2026)',
        'countries': 'India',
        'sourceIds': ['eo-14384'],
    },
    {
        'id': 'agoa-renewed',
        'type': 'reference',
        'date': '2026-02-03',
        'dateLabel': 'Signed',
        'title': 'AGOA reauthorized through December 31, 2026',
        'detail': 'The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) makes '
        'the dutiable Chapter 90 lines Free for eligible sub-Saharan countries. GSP (SPI A, A*, A+), printed on most dutiable Chapter 90 '
        'lines, remains expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'cn-301-excl',
        'type': 'reference',
        'date': '2025-12-01',
        'dateLabel': 'Published',
        'title': 'China Section 301 exclusions for about 20 Chapter 90 products extended to November 9, 2026',
        'detail': 'USTR extended 178 China Section 301 product exclusions through November 9, 2026 (U.S. note 20(vvv), 9903.88.69). In Chapter 90 '
        'they include disposable ECG electrodes, portable ultrasonic scanners, blood-pressure monitors, peak-flow meters and fingertip pulse '
        'oximeters for professional use, anesthesia instruments, electrosurgical cautery pencils, PET/CT scanners, radiotherapy systems, X-ray '
        'tube housings, multi-leaf collimators, certain clinical thermometers and gas monitors, protective goggles, prism binoculars, weather '
        'station sets and wall thermostats. Matching goods skip the List 1, 2, 3 or 4A duty; the 2026 duty still applies.',
        'before': 'Through November 29, 2025',
        'now': 'Through November 9, 2026',
        'countries': 'China',
        'sourceIds': ['fr-2025-21671', 'hts-now'],
    },
    {
        'id': 'cn-ieepa-cut',
        'type': 'extraDuty',
        'date': '2025-11-10',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty cut to 10%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on '
        'February 24, 2026.',
        'before': '+20%',
        'now': '+10% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14357'],
    },
    {
        'id': 'india-oil',
        'type': 'extraDuty',
        'date': '2025-08-27',
        'dateLabel': 'Effective',
        'title': 'Extra 25% on products of India',
        'detail': 'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 '
        '(EO 14326): 50% in all on Indian medical devices and instruments, on top of the base rate. Ended February 7, 2026.',
        'before': '+25%',
        'now': '+50% (ended)',
        'countries': 'India',
        'sourceIds': ['eo-14329', 'eo-14326'],
    },
    {
        'id': 'country-rates',
        'type': 'extraDuty',
        'date': '2025-08-07',
        'dateLabel': 'Effective',
        'title': 'Country reciprocal rates replace the 10% baseline',
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Malaysia and Thailand +19%, Vietnam and '
        'Taiwan +20%, India +25%, Switzerland +39%, the UK +10%. EU goods with a column 1 rate under 15% paid '
        '15% in total (9903.02.20) — so German or Irish medical devices paid 15%. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +39% (ended)',
        'countries': 'Listed countries, European Union',
        'sourceIds': ['eo-14326', 'hts-now'],
    },
    {
        'id': 'ca-amended',
        'type': 'extraDuty',
        'date': '2025-07-31',
        'dateLabel': 'Signed',
        'title': 'Canada additional duty raised to 35%',
        'detail': 'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.',
        'before': '+25%',
        'now': '+35% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14325'],
    },
    {
        'id': 'cn-reciprocal-10',
        'type': 'extraDuty',
        'date': '2025-05-14',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty cut from 125% to 10%',
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese patient '
        'monitor (Free, List 1) then paid 25% + 20% + 10% = 55% until November 9, 2025. Ended February 24, 2026.',
        'before': '+125%',
        'now': '+10% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14298'],
    },
    {
        'id': 'cn-125',
        'type': 'extraDuty',
        'date': '2025-04-10',
        'dateLabel': 'Effective',
        'title': 'China reciprocal duty raised to 125%',
        'detail': 'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country '
        'rates announced on April 2 for other countries, which never took effect. With the 20% fentanyl duty, Chinese syringes (100% under note '
        '31) paid 245% until May 13, 2025, and a patient monitor (List 1) 170%.',
        'before': None,
        'now': '+125% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14266'],
    },
    {
        'id': 'reciprocal',
        'type': 'extraDuty',
        'date': '2025-04-02',
        'dateLabel': 'Signed',
        'title': 'Reciprocal tariff on products of all countries',
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 90 product '
        'was on the general exemption list, so medical devices paid it; automobile parts paying Section 232 were outside it. Ended February 24, '
        '2026.',
        'before': 'None',
        'now': '+10% or more (ended)',
        'countries': 'All except Canada, Mexico',
        'sourceIds': ['eo-14257'],
    },
    {
        'id': 'cn-ieepa',
        'type': 'extraDuty',
        'date': '2025-03-04',
        'dateLabel': 'Effective',
        'title': 'China fentanyl duty raised to 20%',
        'detail': 'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, '
        'on top of the Section 301 duties. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+20% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14195', 'eo-14228'],
    },
    {
        'id': 'mx-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Mexico',
        'detail': '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Mexico',
        'sourceIds': ['eo-14194'],
    },
    {
        'id': 'ca-imposed',
        'type': 'extraDuty',
        'date': '2025-02-01',
        'dateLabel': 'Signed',
        'title': 'Additional duty on products of Canada',
        'detail': '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
        'before': 'None',
        'now': '+25% (ended)',
        'countries': 'Canada',
        'sourceIds': ['eo-14193'],
    },
    {
        'id': 'cn-syringes-100',
        'type': 'extraDuty',
        'date': '2024-09-27',
        'dateLabel': 'Effective',
        'title': 'China: 100% on syringes and needles',
        'detail': 'After the statutory four-year review, USTR raised the Section 301 duty on Chinese syringes and needles of 9018.31 and 9018.32 '
        'to 100% (U.S. note 31(d), 9903.91.03). Enteral syringes (9018.31.00.80) were exempt until December 31, 2025 (9903.91.10); since '
        'January 1, 2026 they pay the 100% too.',
        'before': 'None',
        'now': '+100%',
        'countries': 'China',
        'sourceIds': ['fr-2024-21217', 'hts-now'],
    },
    {
        'id': 'cn-list4a-75',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5% under the Phase One agreement. In Chapter 90 List 4A covers contact '
        'and spectacle lenses, frames, sunglasses and goggles, binoculars, most still cameras, and some thermometers and flow instruments.',
        'before': '+15%',
        'now': '+7.5%',
        'countries': 'China',
        'sourceIds': ['fr-2020-00904'],
    },
    {
        'id': 'cn-list4a',
        'type': 'extraDuty',
        'date': '2019-09-01',
        'dateLabel': 'Effective',
        'title': 'China List 4A reaches lenses, eyewear and cameras',
        'detail': 'The fourth China Section 301 list put +15% on most Chinese contact and spectacle lenses, frames, sunglasses, binoculars and '
        'cameras. Catheters, dental, therapy, respiratory, orthopedic and implant devices were left off the lists and have never been charged.',
        'before': 'None',
        'now': '+15%',
        'countries': 'China',
        'sourceIds': ['fr-2019-17865'],
    },
    {
        'id': 'cn-list3-25',
        'type': 'extraDuty',
        'date': '2019-05-10',
        'dateLabel': 'Effective',
        'title': 'China List 3 duty raised to 25%',
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. In Chapter 90 List 3 covers unmounted and mounted optical elements, '
        'cinematographic and photo-lab equipment, surveying instruments, balances and drafting and hand measuring instruments.',
        'before': '+10%',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2019-09681'],
    },
    {
        'id': 'cn-list3',
        'type': 'extraDuty',
        'date': '2018-09-24',
        'dateLabel': 'Effective',
        'title': 'China Section 301 List 3 reaches optics and measuring tools',
        'detail': 'The third China Section 301 list put +10% (9903.88.03) on 85 more Chapter 90 lines, mainly optics, photographic and drafting '
        'equipment.',
        'before': 'None',
        'now': '+10%',
        'countries': 'China',
        'sourceIds': ['fr-2018-20610'],
    },
    {
        'id': 'cn-list2',
        'type': 'extraDuty',
        'date': '2018-08-23',
        'dateLabel': 'Effective',
        'title': 'China List 2 reaches optical fibers and meters',
        'detail': 'The second China Section 301 list put +25% (9903.88.02) on optical fibers and polarizing sheet (9001.10, 9001.20), some '
        'thermometers and pyrometers, gas, liquid and electricity meters, speedometers and multimeters.',
        'before': 'None',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2018-17709'],
    },
    {
        'id': 'cn-list1',
        'type': 'extraDuty',
        'date': '2018-07-06',
        'dateLabel': 'Effective',
        'title': 'China List 1 reaches medical imaging and instruments',
        'detail': 'The first China Section 301 list put +25% (9903.88.01) on 193 of today\'s Chapter 90 lines: electro-diagnostic, ultrasound, MRI '
        'and X-ray apparatus, microscopes, navigational, analytical, electrical test, measuring and inspection instruments, thermostats and '
        'regulators.',
        'before': 'None',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2018-13248'],
    },
]
have_ids = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have_ids]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)

need = set()
for e in tu['inEffect']:
    need.update(e['sourceIds'])
for c in tu['changes']:
    need.update(c['sourceIds'])
have = {s['id'] for s in tu['sources']}
add_sources(tu, sorted(need - have))

stats = [s for s in tu['stats'] if s['label'] not in ('IEEPA duties', 'New or renumbered lines')]
stats.append({'label': 'Section 232 medical devices', 'value': 'Pending', 'note': 'Investigation opened September 2, 2025; no duty yet'})
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 90: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

SEMI = ' The 10 semiconductor-equipment measuring lines (note 52(b)) pay no Section 301 duty.'
VEH = (
    ' Rangefinders, counters and speedometers that are car, truck or bus parts pay the 25% Section 232 vehicle-parts duty instead; 9013.90.80 '
    'optical parts pay 15% in total under Section 232 (metals).'
)
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 1, 2 or 3 (9903.88.01–.03) on most instruments, or + 7.5% List 4A '
    '(9903.88.15) on lenses, frames, sunglasses, binoculars and cameras; syringes and needles + 100% (9903.91.03) instead of a list duty; '
    'catheters, dental, therapy, orthopedic, implant and hearing-aid lines pay only the 12.5%. Semiconductor-equipment lines of note 52(b) pay '
    'only their list duty. Vehicle parts pay 25% Section 232 in place of the 12.5%.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94, 9903.94.06, 9903.74.10), except 15% in total on 9013.90.80 (Section 232 metals). '
    'Otherwise base rate + 10% Section 301 (9903.05.55), or +25% Section 232 on car, truck and bus instruments. The 25% IEEPA duty ended '
    'February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 or Section 232 vehicle-parts duty (9903.05.93, 9903.94.06, 9903.74.10); otherwise base rate + '
    '10% (9903.05.29). On top, 50% Section 338 on other optical measuring instruments (9031.49.90, 9903.03.14), whether or not USMCA is '
    'claimed.',
    'Japan': '12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.49); higher base rates only.' + SEMI + ' Car '
    'instruments: 15% in total (9903.94.43); truck and bus parts: base rate + 25%.',
    'South Korea': '12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.71); KORUS does not remove it.' + SEMI
    + ' Car instruments: 15% in total (9903.94.63); truck and bus parts: base rate + 25%.',
    'Taiwan': '10% in total in place of the base rate when the base rate is under 10% (9903.05.76).' + SEMI + ' Car instruments: 15% in total '
    '(9903.94.67); truck and bus parts: base rate + 25%.',
    'Switzerland': '12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.74).' + SEMI + VEH,
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81), except the 63 medical lines on the UK list in note 52(j)(1) (9903.05.96) — '
    'diagnostic, imaging, dental, ophthalmic, respiratory, prosthetic, hearing-aid, pacemaker and X-ray apparatus — which pay none.' + SEMI
    + ' Car instruments on the note 33(j) UK list: 10% in total (9903.94.32); truck and bus parts: base rate + 25%.',
    'Costa Rica': 'Base rate + 12.5% Section 301 (9903.05.33); CAFTA-DR (P) removes the base rate, not the 12.5%.' + SEMI + VEH,
    'Singapore': 'Base rate + 12.5% Section 301 (9903.05.68); the Singapore FTA (SG) removes the base rate, not the 12.5%.' + SEMI + VEH,
    'Israel': 'Base rate + 12.5% Section 301 (9903.05.47); the Israel FTA (IL) removes the base rate, not the 12.5%.' + SEMI + VEH,
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54).' + SEMI + VEH,
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84).' + SEMI + VEH,
    'India': 'Base rate + 10% Section 301 (9903.05.44).' + SEMI + VEH,
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27). Section 232 vehicle parts and 9013.90.80 metals pay Section 232 instead of '
    'both.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — every Chapter 90 line except rifle scopes and '
    'their parts, which pay only their 14.9% or 16% base rate (9903.05.38).' + SEMI + ' Car instruments: 15% in total (9903.94.53); truck and '
    'bus parts: base rate + 25%; 9013.90.80: 15% in total (metals). The 15%-in-total IEEPA rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84) — for '
            'example the Dominican Republic, Thailand and Australia +12.5%, Indonesia +10%. No other country exception list in note 52(j) names '
            'a Chapter 90 line. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — up to 110%.'
        )
    if r['kind'] == 'eu15':
        return EU_LABEL
    raise SystemExit(f'no rule label for {name}')


for c in ia['countries']:
    c['rule']['label'] = rule_label(c)
    if c['country'] == 'Any other country':
        c['rule']['ch99Code'] = '9903.05.20–9903.05.84'
    ids = c['rule']['sourceIds']
    if c['country'] in ('Canada', 'Mexico') and 'eo-14389' not in ids:
        ids.insert(-1, 'eo-14389')
add_sources(ia, ['eo-14389'])

ia['seo'] = {
    'title': 'Medical Device & Instrument Tariffs by Country 2026 — Mexico, Germany, China, Ireland, Costa Rica, Japan (HTS Ch. 90) | '
    'KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on medical devices, implants, lab and measuring instruments and optics by country: Free '
    'under USMCA, 10% in total for the EU, 12.5% for Japan, Korea and Switzerland, +12.5% for Costa Rica and Singapore, up to 112.5% from '
    'China, Free for 63 British medical lines.',
    'keywords': [
        'tariffs on medical devices from china',
        'medical device tariffs by country',
        'eu tariffs on medical devices',
        'us tariffs on medical devices from india',
        'tariffs on medical devices from mexico',
        'medical equipment tariffs',
        'chapter 90 customs duty',
        'switzerland medical device tariffs',
    ],
}
ia['intro'] = (
    'Chapter 90 base rates are low — every medical, surgical, dental, orthopedic and X-ray line is Free, and most instruments pay Free to '
    'about 7% — so the duty you pay **depends almost entirely on where the goods come from**. Each cell below is the base rate for that product '
    'group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **10% in total for the EU and Taiwan**, **12.5% in total for Japan, Korea and Switzerland**, **+10% for Malaysia, India and '
    'the UK**, **+12.5% for Costa Rica, Singapore, Israel and Vietnam**. **China adds 37.5%** on most instruments and imaging equipment, 20% on '
    'eyewear and cameras, 12.5% on catheters, implants and other devices that are on no list, and **112.5% on syringes and needles**. '
    'USMCA-qualifying goods from Mexico and Canada pay nothing, except **50% Section 338 on Canadian optical measuring instruments**. 63 '
    'British medical-device lines and 10 semiconductor-equipment lines pay no Section 301 duty. Where a cell shows two or three totals, the line '
    'also carries a **Section 232 vehicle-parts duty** (car or light-truck part, truck or bus part) — pick the case that matches the goods. '
    'Parts of binoculars and telescopes (9005.90) and of drafting and measuring instruments (9017.90) pay "the rate applicable to the article '
    'of which it is a part": the cells show that wording, and the tariff calculator asks for the article\'s HTS line and prices the part at that '
    'line\'s rate before adding the extra duty.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions = [
    (
        'Conditional relief is not applied when it needs the importer\'s confirmation: the 9903.88.69 (Section 301) China exclusions defined '
        'by a product description, and the civil-aircraft exemptions.'
    )
    if x.startswith('Conditional relief is not applied')
    else x
    for x in assumptions
]
assumptions += [
    'Multi-total cells: the Section 232 automobile-parts duty applies only to note 33(g) articles (rangefinders 9015.10, counters 9029.10, '
    'speedometers 9029.20.40.80) that are parts of passenger vehicles or light trucks, and the medium- and heavy-duty duty only to note 38(i) '
    'articles (9029.10.80, 9029.20.40.80) that are parts of trucks, tractors or buses; "car or light-truck part or truck or bus part" is one '
    'total for both. "Not a vehicle part" means neither — a listed article for other use enters under 9903.94.06 or 9903.74.11 and pays the base '
    'rate plus the Section 301 duty.',
    '"The rate applicable to the article of which it is a part or accessory" (9005.90.40, 9005.90.80, 9017.90.01): the base rate is the rate '
    'of the article the part belongs to — for example Free for a prism-binocular part (9005.10), 8% for a telescope part (9005.80.40), 5.8% for a '
    'caliper part (9017.30.40). The importer gives that article\'s HTS line, and the calculator prices the part at that line\'s rate on the '
    'part\'s full value, then adds the extra duty (for the EU, Japan, Korea, Switzerland and Taiwan the higher of that rate and the 10% or 12.5% '
    'floor).',
    'Section 232 metals (9013.90.80): priced at 15% in total, assuming the aluminum is not U.S.-smelted and is at least 15% of the article\'s '
    'weight; goods with no aluminum, steel or copper (9903.82.01) or under 15% metal by weight (9903.82.03) pay the base rate plus the Section '
    '301 duty instead.',
    'Canada, "USMCA-qualifying" side: the Section 301 and vehicle-parts duties are removed (9903.05.93, 9903.94.06, 9903.74.10), but the 50% '
    'Section 338 duty stays on 9031.49.90 because U.S. note 51(a) applies it even when a special rate is claimed.',
    'The per-unit rates on gas and liquid meters and stroboscopes (16¢ each + 2.5%) are priced at 1,000 units on a $10,000 shipment for the '
    'EU, Japan, Korea, Switzerland and Taiwan "in total" rules.',
    'China exclusions in note 20(vvv) that cover a whole statistical line (9030.90.46; 9025.19.80.10, .20 and .85) are applied in the cells. '
    'Not in the cells: the exclusions defined by a product description and the civil-aircraft exemptions (notes 52(d), 50(a)(iv), 51(d)) — '
    'they need the importer\'s confirmation; the Nairobi Protocol (9817.00.96) and other Chapter 98 entries; FTA preferences other than USMCA, '
    'CAFTA-DR, KORUS and the Singapore, Israel and Japan agreements; and FDA, FCC or NRC compliance costs. There is no antidumping or '
    'countervailing duty order on a Chapter 90 product. The opt-in Section 232 certified-parts headings are not modeled.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied. The Section 232 investigation of medical devices has imposed no duty.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 31, 33, 38, 39, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Section 301 (2026): '
    'the general exemption list (note 52(b), 9903.05.86) names 8 Chapter 90 provisions (10 lines) — 9030.82.00, 9030.90.84, 9031.41.00, '
    '9031.49.70, 9031.80.40, 9031.90.45, 9031.90.54 and 9031.90.70, all semiconductor wafer, photomask or reticle measuring and inspection '
    'equipment and parts; the particular-articles list (52(c)) and the pharmaceutical list (52(e)) name none; civil aircraft articles (52(d), '
    f'9903.05.88) reach {N_AIR} lines with a certification. Of the country exception lists in note 52(j), only the UK list (52(j)(1), '
    f'9903.05.96) names Chapter 90 provisions — {N_GB} lines of 9018–9022; the EU, Swiss, Malaysian, Taiwanese, Central American and other lists '
    'name none. The Brazil list (note 50(a)(ii)) has no Chapter 90 line. The Canada Section 338 list (note 51(b)(3)) names 9031.49.90; the '
    'alcoholic-beverage and dairy lists and the September 29, 2026 import bans name none. China: Lists 1, 2, 3 and 4A (note 20) reach '
    f'{N_L1}, {N_L2}, {N_L3} and {N_L4A} lines; note 31(d) charges 100% on 9018.31 and 9018.32 (the enteral-syringe exception, 9903.91.10, '
    'ended December 31, 2025); about 20 product exclusions in note 20(vvv) run through November 9, 2026. Section 232: note 16(c)(ix) lists '
    '9013.90.80 as a derivative aluminum article; note 19(k) lists 9013.90.80 and 9031.90.91 (200% for Russian aluminum); note 33(g) names '
    '9015.10, 9029.10 and 9029.20.40.80 and note 33(j) the same five lines for the UK; note 38(i) names 9029.10.80 and 9029.20.40.80; the '
    'semiconductor note 39 names no Chapter 90 line. Note 30(b) sets 35% for eight Russian lines in place of column 2. A Federal Register '
    'search of Commerce notices found no antidumping or countervailing duty order on a Chapter 90 product; orders on other products, such as '
    'aluminum extrusions from China, can still cover parts entered under Chapter 90 because their written scope controls.'
)
add_sources(ia, ['ad-alext-cn', 'bis-232-medical'])

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 90: {SHORT} — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Medical Devices & Instruments into the U.S.: FDA Registration, 510(k), Form FDA 2877, Laser & X-ray Rules and Legal '
    'Ways to Lower Duty (HTS Ch. 90) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 90 line needs at U.S. entry — FDA establishment registration and device listing (21 CFR 807), '
    '510(k) or PMA, radiation-emitting product declarations on Form FDA 2877, impact-resistant eyewear, FCC and NRC rules — and the legal ways '
    'to pay less: classification, origin, USMCA, the Nairobi Protocol, China exclusions, first sale, drawback and FTZ.',
    'keywords': [
        'hts chapter 90 tariff engineering',
        'importing medical devices fda',
        'fda device registration and listing',
        'form fda 2877',
        'medical device tariff exemption',
        'nairobi protocol 9817.00.96',
        'first-sale-for-export valuation',
        'medical device tariff code',
    ],
}
te['intro'] = (
    'Most Chapter 90 goods enter at low or Free base rates, but many lines carry agency rules. **Medical devices** of headings 9018–9022 — and '
    'contact lenses, eyeglasses, sunglasses, frames and clinical thermometers — are FDA-regulated: the foreign maker must **register its '
    'establishment and list the device** with FDA and name a U.S. agent, the device must be **510(k)-cleared, PMA-approved or exempt**, and '
    'FDA reviews every entry and can refuse admission. **Lasers, X-ray and other radiation-emitting products** under a federal performance '
    'standard need a **Form FDA 2877** declaration at entry. Eyeglass and sunglass lenses must be **impact-resistant**, electronic instruments '
    'that emit radio frequency must meet **FCC** import conditions, and equipment with radioactive sources needs an **NRC** import license. '
    'Every article must be **marked with its country of origin**.\n\n'
    'On cost, the levers are the **classification** (parts follow the rules of note 2; a part of a binocular or caliper takes the rate of the '
    'article), the **country of origin** (Free from the UK on 63 medical lines, 10% in total from the EU, 112.5% on Chinese syringes), '
    '**USMCA**, the **Nairobi Protocol** for articles for persons with disabilities, the **China product exclusions**, the semiconductor-'
    'equipment and civil-aircraft exemptions, whether an instrument is in fact a **vehicle part**, the **metal content** of 9013.90.80 parts, '
    'and first-sale valuation, drawback and foreign-trade zones. Each lever depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'classify',
        'title': 'Classify by function, and parts by note 2',
        'saves': 'The gap between line rates and between China lists: optical fibers 6.7%, mounted camera lenses 2.3%, rifle scopes 14.9%, '
        'magnifiers 6.6%, plotters Free, micrometers 5.8%; a Chinese catheter (no list) pays 12.5% extra, a Chinese patient monitor (List 1) '
        '37.5%',
        'appliesTo': 'All headings; especially parts, which go to their own heading in chapters 84, 85, 90 or 91, then with the article they '
        'serve, and only otherwise to 9033 (4.4%)',
        'document': 'Technical documentation: function, principle of operation, what the part fits and whether it is used solely or principally '
        'with one kind of instrument.',
        'caveat': 'Chapter 90 note 1 sends many goods elsewhere: digital cameras (8525), radar and GPS (8526), optical fiber cables of 8544, '
        'semiconductor manufacturing machines (8486), parts of general use (Section XV). The classification must match the goods; a ruling '
        'settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 90, notes 1–7 and additional U.S. notes', 'url': CH90_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'referenced-rate',
        'title': 'Document the article a binocular, telescope or drafting-instrument part belongs to',
        'saves': 'The difference between article rates: a part of prism binoculars takes Free (9005.10), of an optical telescope 8% (9005.80.40), '
        'of a caliper 5.8% (9017.30.40), of a plotter Free (9017.10.40)',
        'appliesTo': '9005.90.40, 9005.90.80 and 9017.90.01, whose rate is "the rate applicable to the article of which it is a part or '
        'accessory"',
        'document': 'Proof of the article the part is for — drawings, the parts list of the finished instrument — and that article\'s HTS line.',
        'caveat': 'The part pays the rate of the article\'s line on the part\'s own value; the extra duty by country is added as for any other '
        'line, and China\'s List 4A or List 3 duty applies to the part\'s own line.',
        'citations': [{'label': 'HTSUS Chapter 90, 9005.90 and 9017.90', 'url': CH90_PDF}],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin and the country\'s exception lists',
        'saves': 'The difference between country rates: nothing on 63 British medical lines, 10% in total from the EU, +10% from Malaysia or '
        'India, +12.5% from Costa Rica or Singapore, +12.5% to +112.5% from China',
        'appliesTo': 'All lines; the gap is widest on Chinese syringes, imaging and measuring instruments',
        'document': 'Production records showing where the device was made or substantially transformed — for a medical device often where the '
        'finished device was assembled, sterilized or calibrated — consistent with the FDA listing.',
        'caveat': 'Final packing, sterilization or labeling alone does not usually change origin; CBP decides by substantial transformation and '
        'can ask for proof. The UK exception list covers only the 63 lines it names, and only goods that are products of the UK.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 31, 51, 52(j)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on devices and instruments from Mexico or Canada',
        'saves': 'The base rate, the 10% Section 301 duty and the 25% Section 232 vehicle-parts duty',
        'appliesTo': 'All lines from Mexico — the largest Chapter 90 supplier — and Canada (except 9031.49.90 from Canada, which keeps the 50% '
        'Section 338 duty)',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'The good must meet the Chapter 90 rule of origin in General Note 11 for its subheading. USMCA does not remove the Section 232 '
        'metals duty on 9013.90.80 or the Canada Section 338 duty. The USMCA was not renewed at the July 1, 2026 joint review but remains in '
        'force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, 9903.94.06, 9903.74.10, U.S. notes 33, 38, 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim AGOA, CBERA or another FTA on dutiable lines',
        'saves': 'The base rate (up to 16%) on the dutiable lines',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AGOA (D), CBERA (E), CAFTA-DR (P), Israel (IL), Singapore (SG), '
        'Korea (KR), Australia, Chile, Colombia, Peru and the other FTA partners',
        'document': 'The origin proof each program requires (a certification or declaration of origin) and records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty (U.S. note 52(a)) — a Costa Rican, Israeli or Singaporean '
        'device pays 12.5% even when the base rate is Free, a Korean one 12.5% in total. AGOA (D) runs to December 31, 2026. GSP (A, A*, A+) has '
        'been expired since December 31, 2020, although the codes are still printed.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 7–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
            {'label': '19 CFR 10.178a (AGOA)', 'url': ecfr(19, '10.178a')},
        ],
    },
    {
        'id': 'nairobi',
        'title': 'Enter articles for persons with disabilities under 9817.00.96',
        'saves': 'The base rate and the Section 301 (2026 and China) and Canada Section 338 duties, which do not apply to goods properly entered '
        'under Chapter 98 (other than 9802 and subchapter XXIII)',
        'appliesTo': 'Articles specially designed or adapted for the use or benefit of persons with a permanent or chronic physical or mental '
        'impairment — for example some orthopedic and prosthetic devices and hearing aids of heading 9021',
        'document': 'Evidence of the special design or adaptation and the intended users, as CBP requires for the provision.',
        'caveat': 'U.S. note 4(b) to Chapter 98 subchapter XVII excludes articles for acute or transient disability, spectacles and cosmetic '
        'articles for people not substantially disabled, therapeutic and diagnostic articles, and medicine — so most of heading 9018 does not '
        'qualify. Section 232 duties still apply.',
        'citations': [
            {'label': 'HTSUS Chapter 98, subchapter XVII, U.S. note 4, 9817.00.96', 'url': CH98_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 31, 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use a China Section 301 exclusion for qualifying goods',
        'saves': 'The 25% List 1, 2 or 3 duty or the 7.5% List 4A duty on Chinese goods that match an exclusion description',
        'appliesTo': 'About 20 items, including ECG electrodes, portable ultrasonic scanners, professional blood-pressure monitors, peak-flow '
        'meters and pulse oximeters, anesthesia instruments, cautery pencils, PET/CT scanners, radiotherapy systems, X-ray tube housings, '
        'multi-leaf collimators, certain thermometers and gas monitors, protective goggles, prism binoculars, weather station sets and wall '
        'thermostats',
        'document': 'Product specifications showing the goods match the description in note 20(vvv); report 9903.88.69 instead of the list '
        'heading.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends them again. The 12.5% 2026 Section 301 duty still applies, and the 100% '
        'duty on syringes and needles has no exclusion.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv), 9903.88.69', 'url': CH99_PDF},
            {'label': '90 FR 55232 (exclusions extended to November 9, 2026)', 'url': src('fr-2025-21671')['url']},
        ],
    },
    {
        'id': 'semi-exempt',
        'title': 'Check the semiconductor-equipment exemption from the 2026 Section 301 duty',
        'saves': 'The 10%–12.5% Section 301 duty (or the EU, Japan, Korea, Swiss or Taiwan floor) on measuring and inspection equipment for '
        'semiconductor wafers, photomasks and reticles',
        'appliesTo': '9030.82.00, 9030.90.84, 9031.41.00, 9031.49.70, 9031.80.40, 9031.90.45, 9031.90.54, 9031.90.70 (note 52(b), 9903.05.86)',
        'document': 'Specifications showing the instrument is for measuring or inspecting semiconductor wafers or devices, photomasks or reticles, '
        'so that it is correctly classified in one of the listed provisions.',
        'caveat': 'Only the listed provisions qualify; general-purpose measuring instruments do not. China\'s List 1 duty still applies.',
        'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(b), 9903.05.86', 'url': CH99_PDF}],
    },
    {
        'id': 'civil-aircraft',
        'title': 'Certify civil aircraft instruments',
        'saves': 'The 10%–12.5% Section 301 duty and the Brazil duty on instruments and parts for civil aircraft',
        'appliesTo': f'{N_AIR} Chapter 90 lines named in note 52(d), among them aircraft compasses, autopilots, navigational instruments, '
        'thermometers, flow and pressure gauges, speedometers, electrical test instruments and regulators',
        'document': 'The civil aircraft certification CBP requires (entry under 9903.05.88; 9903.05.05 for Brazil).',
        'caveat': 'Military aircraft are excluded. China\'s list duties still apply.',
        'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. notes 50(a)(iv), 52(d)', 'url': CH99_PDF}],
    },
    {
        'id': 'vehicle-part',
        'title': 'Document whether rangefinders, counters and speedometers are vehicle parts',
        'saves': 'The 25% Section 232 duty (or the 15% / 10% deal rates) on listed instruments that are not parts of passenger vehicles, light '
        'trucks or medium- and heavy-duty vehicles',
        'appliesTo': '9015.10.40, 9015.10.80, 9029.10.40, 9029.10.80, 9029.20.40.80',
        'document': 'Evidence of the end use — the vehicle model, customer and application — to support entry under 9903.94.06 or 9903.74.11 '
        'instead of 9903.94.05 or 9903.74.08.',
        'caveat': 'Only articles that are really not parts of those vehicles qualify; CBP\'s FAQs explain how to report them. A part that does pay '
        'Section 232 is exempt from the 2026 Section 301 duty, so the saving is the difference, not the full 25%.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33(g)–(h), 38(i)–(l)', 'url': CH99_PDF},
            {'label': 'CBP Section 232 FAQs: automobiles and automobile parts', 'url': src('cbp-section-232-additional-faqs-autos')['url']},
        ],
    },
    {
        'id': 'metal-content',
        'title': 'Show the metal content of 9013.90.80 optical parts',
        'saves': 'The 15%-in-total Section 232 metals duty — down to 10% in total with U.S.-smelted aluminum, or none if the part has no aluminum, '
        'steel or copper or the metal is under 15% of its weight',
        'appliesTo': '9013.90.80.00 (other parts and accessories of lasers and other optical appliances)',
        'document': 'A bill of materials with metal weights and, for the 10% rate, mill certificates showing at least 85% of the aluminum was '
        'smelted and cast in the United States.',
        'caveat': 'Without the metals duty the part pays its 4.5% base rate plus the Section 301 duty. The temporary 15% rate ends December 31, '
        '2027.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 16(c)(ix), (e), (f); 9903.82.01, .03, .07, .10', 'url': CH99_PDF},
            {'label': '91 FR 18201 (Proclamation 11021)', 'url': src('procl-11021')['url']},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the 10%–112.5% extra duties included — when the factory price to a trading '
        'company is lower than the price you pay',
        'appliesTo': 'All lines with ad valorem duties bought through a trading company or distributor rather than straight from the maker',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry. Related-'
        'party prices must meet the transaction-value tests.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any line — for example components built into instruments or devices that are then exported',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; antidumping and countervailing duties are not refunded by drawback.',
        'citations': [
            {'label': '19 CFR part 190', 'url': ecfr_part(19, 190)},
            {'label': '19 CFR 190.3 (duties subject to drawback)', 'url': ecfr(19, '190.3')},
        ],
    },
    {
        'id': 'ftz',
        'title': 'Process or hold devices in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for device and instrument makers that assemble from imported components and export part of output',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date; goods subject to Section 232 or the '
        'China Section 301 duties must be admitted in privileged foreign status, so the zone does not lower those duties.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use Chapter 98 for U.S. goods returned or repaired abroad',
        'saves': 'All duty on U.S.-made instruments returned unchanged (9801.00.10); on goods repaired abroad (9802.00.40/.50), duty only on the '
        'value of the repair',
        'appliesTo': 'Any line — for example U.S.-made medical or test equipment sent abroad for repair or calibration and returned',
        'document': 'Proof of U.S. origin and of the export, and repair invoices, as CBP requires for each provision.',
        'caveat': 'The Section 301 duties apply only to the value of the repair under 9802.00.40/.50 and do not apply to most other Chapter 98 '
        'entries (U.S. notes 20, 51(a), 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10, 9802.00.40–.50', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: a part of a medical device (9018.90) versus a part of general use; '
        'an instrument of 9027 versus 9031; a lab analyzer that is a medical device; whether a part is "for" binoculars or telescopes',
        'appliesTo': 'Any line where function, construction or use decides the line',
        'document': 'A ruling request to CBP describing the article, its function, materials, value and use.',
        'caveat': 'Rulings apply to the transaction described; a changed design may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 90 notes', 'url': CH90_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'fda-registration',
        'agency': 'FDA',
        'title': 'Medical devices: the foreign manufacturer must register its establishment and list each device with FDA, and name a U.S. '
        'agent; no device may be imported unless it is listed and made at a registered establishment (investigational devices aside)',
        'citations': [
            {'label': '21 CFR 807.40', 'url': ecfr(21, '807.40')},
            {'label': '21 CFR 807.20', 'url': ecfr(21, '807.20')},
            {'label': 'FDA: Device Registration and Listing', 'url': FDA_REG_LIST},
        ],
    },
    {
        'id': 'fda-premarket',
        'agency': 'FDA',
        'title': 'Medical devices must be 510(k)-cleared, PMA-approved or exempt before commercial distribution, and made under the quality '
        'management system regulation',
        'citations': [
            {'label': '21 CFR 807.81 (510(k))', 'url': ecfr(21, '807.81')},
            {'label': '21 CFR part 814 (PMA)', 'url': ecfr_part(21, 814)},
            {'label': '21 CFR 820.1 (QMSR)', 'url': ecfr(21, '820.1')},
        ],
    },
    {
        'id': 'fda-entry',
        'agency': 'FDA',
        'title': 'FDA reviews device entries (product code, registration and listing, affirmations of compliance) and can detain and refuse '
        'admission to devices that appear adulterated or misbranded; labels must name the manufacturer, packer or distributor',
        'citations': [
            {'label': '21 U.S.C. 381 (FD&C Act sec. 801)', 'url': USC_381},
            {'label': '21 CFR 1.94', 'url': ecfr(21, '1.94')},
            {'label': '21 CFR 801.1', 'url': ecfr(21, '801.1')},
            {'label': 'FDA: Importing Medical Devices', 'url': FDA_IMPORT_DEVICES},
        ],
    },
    {
        'id': 'fda-radiation',
        'agency': 'FDA',
        'title': 'Radiation-emitting electronic products under a federal performance standard — lasers and laser products, diagnostic X-ray '
        'systems — must be certified and labeled, and need a Form FDA 2877 declaration at entry; noncomplying products are refused or brought '
        'into compliance under bond',
        'citations': [
            {'label': '21 CFR part 1005 (importation)', 'url': ecfr_part(21, 1005)},
            {'label': '21 CFR 1010.2 (certification)', 'url': ecfr(21, '1010.2')},
            {'label': '21 CFR 1040.10 (laser products)', 'url': ecfr(21, '1040.10')},
            {'label': '21 CFR 1020.30 (diagnostic X-ray)', 'url': ecfr(21, '1020.30')},
            {'label': 'FDA: Importing Radiation-Emitting Electronic Products (Form FDA 2877)', 'url': FDA_IMPORT_REP},
        ],
    },
    {
        'id': 'fda-eyewear',
        'agency': 'FDA',
        'title': 'Eyeglasses and sunglasses must have impact-resistant lenses, tested by the manufacturer (the drop-ball test or an equal or '
        'superior one)',
        'citations': [{'label': '21 CFR 801.410', 'url': ecfr(21, '801.410')}],
    },
    {
        'id': 'fda-hearing',
        'agency': 'FDA',
        'title': 'Over-the-counter hearing aids must meet FDA\'s OTC hearing aid labeling, output and design requirements',
        'citations': [{'label': '21 CFR 800.30', 'url': ecfr(21, '800.30')}],
    },
    {
        'id': 'fcc-rf',
        'agency': 'FCC',
        'title': 'Electronic instruments that are radio-frequency devices (digital electronics, wireless sensors and monitors) may be imported '
        'only if authorized or otherwise eligible under the FCC import conditions',
        'citations': [{'label': '47 CFR 2.1204', 'url': ecfr(47, '2.1204')}],
    },
    {
        'id': 'nrc-import',
        'agency': 'NRC',
        'title': 'Equipment containing radioactive (byproduct) material — some radiation-based gauges and therapy apparatus, ionization smoke '
        'detectors — may be imported under the general license only by a consignee authorized to possess the material',
        'citations': [{'label': '10 CFR 110.27', 'url': ecfr(10, '110.27')}],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the article '
        'or, where allowed, its container',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.1', 'url': ecfr(19, '134.1')},
        ],
    },
    {
        'id': 'adcvd',
        'agency': 'Commerce / CBP',
        'title': 'No antidumping or countervailing duty order covers a Chapter 90 product, but orders on other goods apply by their written scope '
        'whatever the HTS line — for example aluminum extrusions from China entered as parts of instruments',
        'citations': [
            {'label': '76 FR 30650 (aluminum extrusions order: scope covers extrusions entered under other chapters)', 'url': src('ad-alext-cn')['url']},
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country or its exemption (9903.05.86, .88, '
        '.96), China Lists 1–4A (9903.88.01–.03, .15), the 2024 increase (9903.91.03) or an exclusion (9903.88.69), Section 232 vehicle parts '
        '(9903.94.05/.06, 9903.74.08/.10/.11) or metals (9903.82.xx), Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 16, 20, 30, 31, 33, 38, 50–52', 'url': CH99_PDF},
        ],
    },
]

FDA_H = {'9018', '9019', '9021', '9022'}
FDA_LINES = ('9001.30', '9001.40', '9001.50', '9003', '9004', '9025.11.20', '9025.19.80.10', '9025.19.80.20')
FCC_H = {'9014', '9015', '9018', '9019', '9021', '9022', '9025', '9026', '9027', '9028', '9029', '9030', '9031', '9032'}
RAD = ('9013.20', '9015.10', '9015.30.40', '9022.12', '9022.13', '9022.14', '9022.19', '9022.30', '9022.90')
NRC = ('9022.21', '9022.29')
EXCL = {r for k, m in MEASURES.items() if k.startswith('s301-china-excl-') for r in covered(k)}
SEMI_L = set(covered('s301-2026-exempt-52b'))
AIR_L = set(covered('s301-2026-exempt-52d-civil-aircraft'))
VPART = set(covered('s232-auto-parts')) | set(covered('s232-mhdv-parts-auto-part-overlap'))
REF_L = ('9005.90', '9017.90')

GROUP_RULES = {}
for g in te['groups']:
    h = g['heading']
    r = []
    if h in FDA_H or h in ('9003', '9004'):
        r += ['fda-registration', 'fda-premarket', 'fda-entry']
    elif h in ('9001', '9025'):
        r += ['fda-registration', 'fda-entry']
    if h == '9004' or h == '9001':
        r.append('fda-eyewear')
    if h == '9021':
        r.append('fda-hearing')
    if h in ('9013', '9015', '9022'):
        r.append('fda-radiation')
    if h == '9022':
        r.append('nrc-import')
    if h in FCC_H:
        r.append('fcc-rf')
    r += ['cbp-marking', 'adcvd', 'cbp-ch99']
    GROUP_RULES[h] = r

GROUP_NOTES = {
    '9001': 'Contact lenses and spectacle lenses are FDA-regulated devices; lenses for eyeglasses and sunglasses must be impact-resistant. '
    'Optical fibers are on China List 2 (+25%), contact and spectacle lenses on List 4A (+7.5%).',
    '9002': 'Mounted lenses and filters are parts of instruments; CCTV lenses entered separately are classified here, not with the camera.',
    '9003': 'Spectacle frames are FDA-regulated devices: the foreign maker must register and list them. China List 4A (+7.5%).',
    '9004': 'Sunglasses and eyeglasses are FDA devices and need impact-resistant lenses. Chinese protective goggles of 9004.90 may match a '
    'List 4A exclusion through November 9, 2026.',
    '9005': 'Parts of 9005.90 take the rate of the binocular or telescope they belong to; give that article\'s HTS line. Prism binoculars of a '
    'listed size are excluded from List 4A.',
    '9006': 'Digital cameras are classified in 8525, not here. Cheap cameras ($10 or less) pay 6.8%.',
    '9007': 'No agency license for cine cameras and projectors.',
    '9008': 'Video and data projectors are heading 8528; slide and overhead projectors are here.',
    '9010': 'No agency license for photo-lab apparatus and projection screens.',
    '9011': 'No agency license for optical microscopes; Chinese microscopes are on List 1 or 3 (+25%).',
    '9012': 'Electron microscopes are on China List 1 (+25%).',
    '9013': 'Laser products must meet the FDA laser performance standard and carry a Form FDA 2877 declaration at entry. 9013.90.80 parts pay the '
    'Section 232 metals duty (15% in total) unless they contain no metal or under 15% by weight.',
    '9014': 'Aircraft compasses, autopilots and navigational instruments can use the civil aircraft exemptions with a certification.',
    '9015': 'Laser rangefinders and laser levels are laser products under the FDA standard. Rangefinders (9015.10) that are car parts pay the '
    'Section 232 auto-parts duty.',
    '9016': 'No agency license for precision balances.',
    '9017': 'Parts of 9017.90 take the rate of the instrument they belong to; give that article\'s HTS line.',
    '9018': 'FDA-regulated medical devices: registration and listing, 510(k) or PMA, and FDA entry review. Chinese syringes and needles (9018.31, '
    '9018.32) pay 100% more under Section 301; ECG electrodes, ultrasound scanners, professional blood-pressure monitors and anesthesia '
    'instruments may match a China exclusion. 9018 is part of the open Section 232 medical-device investigation.',
    '9019': 'Ventilators, CPAP, oxygen and aerosol therapy apparatus are FDA devices; on no China list (12.5% only).',
    '9020': 'Gas masks and breathing appliances pay 2.5%; breathing devices for medical use can also be FDA devices. Underwater breathing '
    'devices are Free.',
    '9021': 'Implants, prostheses, hearing aids and pacemakers are FDA devices (OTC hearing aids under 21 CFR 800.30). Articles for persons '
    'with a chronic disability may qualify for the Nairobi Protocol (9817.00.96). British artificial joints, hearing aids and pacemakers pay no '
    'Section 301 duty.',
    '9022': 'Diagnostic X-ray systems must meet the FDA X-ray performance standard (Form FDA 2877); apparatus with radioactive sources needs an '
    'NRC-authorized consignee. PET/CT scanners, radiotherapy systems and X-ray tube housings may match a China exclusion.',
    '9023': 'No agency license for demonstration models; China List 4A (+7.5%).',
    '9024': 'No agency license for materials-testing machines; China List 1 (+25%).',
    '9025': 'Clinical thermometers are FDA devices; certain thermometers of 9025.19.80 are excluded from China List 2 through November 9, '
    '2026.',
    '9026': 'Aircraft flow and pressure instruments can use the civil aircraft exemptions with a certification.',
    '9027': 'Lab analyzers used for clinical diagnosis can be FDA in-vitro diagnostic devices. Portable gas monitors may match a China exclusion.',
    '9028': 'Gas and liquid meters pay a per-unit rate (16¢ each + 2.5%).',
    '9029': 'Speedometers and counters that are car, truck or bus parts pay the Section 232 vehicle-parts duty.',
    '9030': 'Semiconductor-wafer testers (9030.82) and their parts are exempt from the 2026 Section 301 duty.',
    '9031': 'Wafer, photomask and reticle inspection equipment is exempt from the 2026 Section 301 duty (note 52(b)); Canadian optical measuring '
    'instruments of 9031.49.90 pay 50% Section 338 even under USMCA.',
    '9032': 'Thermostats and regulators are on China List 1 (+25%); wall thermostats not connected to the internet may match an exclusion.',
    '9033': 'Only parts not classifiable elsewhere in the chapter or in chapters 84, 85 or 91 go here (Chapter 90 note 2).',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

row_by_hts = {r['hts']: r for r in rows if r['hts']}
for ln in te['lines']:
    hts = ln['hts']
    h = hts[:4]
    rules_ = []
    if h in FDA_H or hts.startswith(('9003', '9004')):
        rules_ += ['fda-registration', 'fda-premarket', 'fda-entry']
    elif hts.startswith(FDA_LINES):
        rules_ += ['fda-registration', 'fda-entry']
    if hts.startswith(('9001.40', '9001.50', '9004')):
        rules_.append('fda-eyewear')
    if hts.startswith('9021.40') or hts.startswith('9021.90.40'):
        rules_.append('fda-hearing')
    if hts.startswith(RAD):
        rules_.append('fda-radiation')
    if hts.startswith(NRC):
        rules_.append('nrc-import')
    if h in FCC_H:
        rules_.append('fcc-rf')
    rules_ += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules_
    gen = row_by_hts[hts]['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = ['classify']
    if hts.startswith(REF_L):
        levers.append('referenced-rate')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    if h == '9021':
        levers.append('nairobi')
    if hts in EXCL:
        levers.append('cn-exclusion')
    if hts in SEMI_L:
        levers.append('semi-exempt')
    if hts in AIR_L:
        levers.append('civil-aircraft')
    if hts in VPART:
        levers.append('vehicle-part')
    if hts.startswith('9013.90.80'):
        levers.append('metal-content')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal or regulatory advice. Which line an '
    'instrument or device falls in, whether it is FDA-regulated, a vehicle part or covered by an exclusion, and which Chapter 99 duties apply '
    'depend on the facts of each shipment, and the extra duties change by Federal Register notice and CBP guidance; confirm the current '
    'headings, rates and FDA requirements before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ) header
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 90: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Medical Device Tariff FAQ: Section 232, China, Syringes, Hearing Aids, Eyeglasses & HS Codes 9018, 9021, 9027, 9031 (HTS Ch. '
    '90) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on medical devices and instruments: whether medical devices are '
    'exempt, the Section 232 medical-device investigation, Chinese syringes and medical equipment, hearing aids, eyeglasses and sunglasses, '
    'and the HS codes for medical devices, thermometers, lab and measuring instruments.',
    'keywords': [
        'medical device tariffs',
        'are medical devices exempt from tariffs',
        'medical device tariffs 232',
        'tariffs on medical devices from china',
        'hs code for syringe',
        'hs code for medical devices',
        'tariff on hearing aids',
        'tariffs on eyeglasses',
        'hs code 9018',
        'hs code 9021',
        'hs code 9027',
        'hs code 9031',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for medical devices, optical, measuring and precision '
    'instruments. Each answer links to the page with the full detail.'
)
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'

# ---------------------------------------------------------------------------------------------------
# Trade-dependent text: overview intro, understand industry, takeaways, FAQ
# ---------------------------------------------------------------------------------------------------
mx, de, cn, ie, cr, jp, sg, ca, my, ch = (
    imp(n) for n in ('Mexico', 'Germany', 'China', 'Ireland', 'Costa Rica', 'Japan', 'Singapore', 'Canada', 'Malaysia', 'Switzerland')
)
h9018, h9021, h9027, h9031, h9019, h9022 = (hy(h) for h in ('9018', '9021', '9027', '9031', '9019', '9022'))

ov['intro'] = (
    'Chapter 90 covers optical, photographic, measuring, precision and medical instruments: lenses and optical fibers, eyeglasses and '
    'sunglasses, cameras and microscopes, surveying and navigation instruments, lab analyzers, meters, test and inspection equipment, '
    'thermostats — and the largest group, **medical, surgical, dental and orthopedic devices**, from syringes and catheters to implants, '
    f'hearing aids, ultrasound, MRI and X-ray. Base rates are low: {N_LINES - N_DUT} of the {N_LINES} lines are Free, including every '
    'medical and orthopedic line, and the dutiable ones pay mostly 1%–7% (16% at most, on rifle-scope parts).\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of Chapter 90 goods in {Y}, {round(h9018 / total * 100)}% of it medical instruments of heading '
    f'9018 ({fmt_usd(h9018)}) and {round(h9021 / total * 100)}% orthopedic devices and implants ({fmt_usd(h9021)}). **Mexico** '
    f'({fmt_usd(mx)}), **Germany** ({fmt_usd(de)}), **China** ({fmt_usd(cn)}) and **Ireland** ({fmt_usd(ie)}) are the largest suppliers, '
    f'followed by Costa Rica and Japan. Because the base rates are low, the duty you pay is mostly the **extra duty by country**: since July '
    '24, 2026 a Section 301 tariff — 10% in total for the EU, 12.5% for Japan, Korea and Switzerland, +12.5% for Costa Rica and Singapore. '
    '**China adds 37.5%** on most instruments and imaging equipment and **112.5% on syringes and needles**. USMCA-qualifying goods from Mexico '
    'and Canada pay nothing, and 63 British medical-device lines are exempt. A **Section 232 investigation of medical devices** has been open '
    'since September 2025 but has imposed no duty.'
)

ov['workedExamples'] = [
    {
        'title': 'Disposable syringes from China',
        'line': '9018.31.00.40',
        'body': 'Hypodermic syringes are Free. China adds +12.5% (9903.05.31) and +100% under the 2024 Section 301 increase (9903.91.03): '
        '**112.5%**, $11,250 on a $10,000 order. The same syringes pay 10% from Malaysia, India or the UK, 10% in total from the EU, and nothing '
        'from Mexico under USMCA.',
    },
    {
        'title': 'Artificial hip joints from Ireland',
        'line': '9021.31.00.00',
        'body': 'Artificial joints are Free. As an EU product with a base rate under 10%, they pay **10% in total** (9903.05.39): $10,000 on a '
        '$100,000 shipment. From Switzerland 12.5% in total; from China 12.5% (9021.31 is on no China list); from the UK **Free**, because '
        'artificial joints are on the UK exception list (note 52(j)(1)); from Mexico Free under USMCA.',
    },
    {
        'title': 'Catheters from Costa Rica',
        'line': '9018.39.00.50',
        'body': 'Catheters and cannulas are Free. Costa Rica pays +12.5% (9903.05.33), which CAFTA-DR does not remove: **12.5%**, $12,500 on '
        '$100,000. The Dominican Republic also pays 12.5%, India 10%, and USMCA-qualifying catheters from Mexico nothing.',
    },
    {
        'title': 'Telescope parts from China or Germany',
        'line': '9005.90.80.01',
        'body': 'Parts of telescopes pay "the rate applicable to the article of which it is a part": for a part of an optical telescope '
        '(9005.80.40) that is **8%**. The importer gives the article\'s line, and the calculator prices the part at 8% of its value. China adds '
        '12.5% plus 7.5% (List 4A on 9005.90): **28%**. From Germany the EU rule gives the higher of 10% and the 8%: **10%** in total.',
    },
    {
        'title': 'Optical measuring instrument from Canada',
        'line': '9031.49.90.00',
        'body': 'Other optical measuring and checking instruments are Free. Canadian ones pay the **50% Section 338 duty** (9903.03.14) even when '
        'USMCA-qualifying — $5,000 on $10,000 — and 60% if not USMCA-qualifying. From Mexico under USMCA they pay nothing, from Germany 10% in '
        'total, from China 37.5% (List 1).',
    },
]

ui['h1'] = f'HTS Chapter 90: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Medical Device & Instrument Imports by Country — HTS Chapter 90 Trade Statistics | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 90 goods: {fmt_usd(total)} in {Y}. Who supplies medical devices, catheters, implants, '
    'hearing aids, lab analyzers and measuring instruments — Mexico, Germany, China, Ireland, Costa Rica, Japan — with values by product and '
    'year from UN Comtrade.',
    'keywords': [
        'hts chapter 90',
        'us medical device imports by country',
        'medical device imports from mexico',
        'medical device imports from china',
        'health care equipment industry',
        'medical device supply chain',
        'ireland medical device exports',
        'medical equipment tariffs',
    ],
}
ui['valueBasis'] = 'CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ui['why'] = (
    f'U.S. imports of Chapter 90 goods were **{fmt_usd(total)} in {Y}**, {pct(total, prior_total)}% more than the {fmt_usd(prior_total)} of '
    f'{PY} and up from {fmt_usd(year_tot[2020])} in 2020. **Medical, surgical and dental instruments (heading 9018)** were the largest group at '
    f'{fmt_usd(h9018)} — {fmt_usd(h6("9018.90"))} of other instruments, {fmt_usd(h6("9018.39"))} of catheters and cannulas and '
    f'{fmt_usd(h6("9018.19"))} of electro-diagnostic apparatus — followed by **orthopedic devices, implants and hearing aids (9021)** at '
    f'{fmt_usd(h9021)}, **lab analyzers (9027)** at {fmt_usd(h9027)}, **measuring and inspection instruments (9031)** at {fmt_usd(h9031)}, '
    f'**therapy and respiratory apparatus (9019)** at {fmt_usd(h9019)} and **X-ray and CT (9022)** at {fmt_usd(h9022)}.\n\n'
    f'**Mexico** is the largest supplier ({fmt_usd(mx)}, up {chg("Mexico")}%), more than half of it medical instruments '
    f'({fmt_usd(by_hc[("9018", "Mexico")])}), largely duty-free under USMCA. **Germany** ({fmt_usd(de)}) leads in X-ray, lab and measuring '
    f'instruments; **China** fell {abs(chg("China"))}% to {fmt_usd(cn)}, from {fmt_usd(imp("China", 2021))} in 2021; **Ireland** ({fmt_usd(ie)}) ships mostly implants and medical instruments '
    f'({fmt_usd(by_hc[("9021", "Ireland")])} of 9021). **Costa Rica** grew {chg("Costa Rica")}% to {fmt_usd(cr)}, mostly medical '
    f'instruments, from {fmt_usd(imp("Costa Rica", 2020))} in 2020. Japan ({fmt_usd(jp)}), Singapore ({fmt_usd(sg)}, respiratory apparatus), '
    f'Canada ({fmt_usd(ca)}), Malaysia ({fmt_usd(my)}, electrical test instruments) and Switzerland ({fmt_usd(ch)}, implants) follow; '
    f'Denmark, which ships mainly heading 9021 devices, rose {chg("Denmark")}%.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs '
    'from July 24 and the Canada Section 338 duties from August 22); they do not show what those changes did. Duty-collected figures are not '
    'available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

fc['keyTakeaways'] = [
    f'{N_LINES - N_DUT} of the {N_LINES} Chapter 90 lines are Free, including every medical, surgical, dental, orthopedic and X-ray line; the '
    'dutiable optical and measuring lines pay mostly 1%–7%.',
    'Since July 24, 2026 a Section 301 duty is added by country: 10% in total for the EU and Taiwan, 12.5% for Japan, Korea and Switzerland, '
    '+10% for Malaysia, India and the UK, +12.5% for Costa Rica, Singapore, Israel and Vietnam. 63 British medical lines and 10 '
    'semiconductor-equipment lines are exempt.',
    'China pays +37.5% on most instruments and imaging equipment (Lists 1–3), +20% on lenses, eyewear, binoculars and cameras (List 4A), '
    '+112.5% on syringes and needles, and +12.5% on catheters, implants, hearing aids and other devices on no list.',
    'USMCA-qualifying goods from Mexico — the largest supplier — and Canada pay nothing, except Canadian optical measuring instruments of '
    '9031.49.90 (50% Section 338).',
    'Section 232 reaches only a few lines today: rangefinders, counters and speedometers that are vehicle parts, and 9013.90.80 optical parts '
    '(15% in total). The Section 232 medical-device investigation opened in September 2025 has imposed no duty.',
    'The IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge July 23, 2026. Medical devices need FDA registration, listing '
    'and clearance; lasers and X-ray equipment a Form FDA 2877 declaration.',
]

fc['faqs'] = [
    {
        'id': 'medical-device-tariffs',
        'question': 'Are there tariffs on medical devices imported into the U.S.?',
        'searchedAs': [
            'medical device tariffs',
            'tariffs on medical devices',
            'medical equipment tariffs',
            'tariffs on medical equipment',
            'medical devices tariffs us',
            'customs duty on medical devices',
            'us tariffs on medical devices from india',
        ],
        'answer': 'The base rate on medical, surgical, dental and orthopedic devices is Free, but most countries pay an extra duty. Since July '
        '24, 2026 the Section 301 tariff adds 10% in total for EU goods, 12.5% in total for Japan, Korea and Switzerland, +10% for India, '
        'Malaysia and the UK, +12.5% for Costa Rica, Singapore and Israel, and +12.5% to +112.5% for China. USMCA-qualifying devices from '
        'Mexico and Canada pay nothing, and 63 British medical lines are exempt.',
        'link': 'industry-areas',
    },
    {
        'id': 'exempt',
        'question': 'Are medical devices exempt from tariffs?',
        'searchedAs': [
            'are medical devices exempt from tariffs',
            'are medical devices exempt from us tariffs',
            'medical device tariff exemption',
            'medical equipment tariff exemption',
            'are medical supplies exempt from tariffs',
        ],
        'answer': 'Only partly. The base rate is Free, but there is no general exemption from the 2026 Section 301 tariff for medical devices: '
        'the general exemption list (note 52(b)) names only semiconductor test and inspection equipment in Chapter 90. Exempt are British goods '
        'on the UK list (63 lines of 9018–9022), USMCA-qualifying goods from Mexico and Canada, civil aircraft instruments, and articles for '
        'persons with a chronic disability properly entered under 9817.00.96 (diagnostic and therapeutic articles excluded).',
        'link': 'tariff-engineering',
    },
    {
        'id': 'section-232',
        'question': 'Is there a Section 232 tariff on medical devices?',
        'searchedAs': [
            'medical device tariffs 232',
            'section 232 medical devices',
            'section 232 medical devices investigation',
            'section 232 medical device tariffs',
            'section 232 medical equipment',
        ],
        'answer': 'Not yet. Commerce opened a Section 232 investigation into PPE, medical consumables and medical equipment and devices on '
        'September 2, 2025 (comments were due October 17, 2025), but as of October 13, 2026 no proclamation has imposed a duty under it. The '
        'only Section 232 duties in Chapter 90 today are on rangefinders, counters and speedometers that are vehicle parts and on 9013.90.80 '
        'optical parts (metals, 15% in total).',
        'link': 'tariff-updates',
    },
    {
        'id': 'china',
        'question': 'What are the tariffs on medical devices from China?',
        'searchedAs': [
            'tariffs on medical devices from china',
            'tariff on medical equipment from china',
            'tariffs on medical supplies from china',
        ],
        'answer': 'Chinese Chapter 90 goods pay the base rate plus 12.5% (2026 Section 301, 9903.05.31), plus 25% on List 1–3 lines — most '
        'electro-diagnostic, ultrasound, MRI and X-ray apparatus and lab and measuring instruments — so 37.5%; plus 100% on syringes and needles '
        '(112.5%). Catheters, dental, therapy and respiratory devices, most implants and hearing aids are on no list and pay 12.5%. About 20 '
        f'products are excluded from the list duties through November 9, 2026. China supplied {fmt_usd(cn)} in {Y}, {abs(chg("China"))}% '
        f'less than in {PY}.',
        'link': 'industry-areas',
    },
    {
        'id': 'syringes',
        'question': 'What is the HS code and tariff for syringes and needles?',
        'searchedAs': [
            'tariff code for syringe',
            'hs code for syringe',
            'hs code for disposable syringe',
            'hs code for syringe needle',
            'hs code for insulin syringe',
            'hs code for medical syringe',
            'hs code 9018.31',
            'hs code 9018.32',
        ],
        'answer': 'Syringes, with or without needles, are 9018.31 (hypodermic 9018.31.00.40, other 9018.31.00.80, parts .90) and tubular metal '
        'needles and suture needles 9018.32 — all Free. From China they pay 112.5% (12.5% plus the 100% 2024 Section 301 increase, which has '
        'no exclusion); from the EU 10% in total, from India or Malaysia 10%, from Mexico under USMCA nothing.',
        'link': '',
    },
    {
        'id': 'hs-medical',
        'question': 'What is the HS code for medical devices?',
        'searchedAs': [
            'hs code for medical devices',
            'hs code for medical equipment',
            'medical device tariff code',
            'hs code for medical instruments',
            'hs code 9018',
            'hs code 9018.90',
            'hs code 9018.39',
            'hs code 9018.19',
        ],
        'answer': 'Most medical devices are in Chapter 90: 9018 for medical, surgical, dental and veterinary instruments (9018.11–9018.19 '
        'electro-diagnostic apparatus such as ECG, ultrasound, MRI and patient monitors; 9018.31–9018.39 syringes, needles and catheters; 9018.41–'
        '9018.49 dental; 9018.50 ophthalmic; 9018.90 other instruments); 9019 therapy and respiratory apparatus; 9021 orthopedic devices, implants '
        'and hearing aids; 9022 X-ray and CT. All are Free before the extra duty by country.',
        'link': '',
    },
    {
        'id': 'hs-9021',
        'question': 'What is HS code 9021 (orthopedic devices and implants)?',
        'searchedAs': ['hs code 9021', 'hs code 9021.10', 'hs code 9021.39', 'hs code 9021.90', 'hs code 9021.29', 'hs code 9021.40'],
        'answer': 'Heading 9021 covers orthopedic appliances and fracture devices including bone plates and screws (9021.10), artificial teeth and '
        'dental fittings (9021.21–9021.29), artificial joints (9021.31) and other artificial body parts such as heart valves '
        '(9021.39), hearing aids (9021.40), pacemakers (9021.50) and other implanted or worn devices and parts (9021.90). All are Free. Chinese '
        'ones pay 12.5% (only pacemakers are on a China list: 37.5%); EU ones 10% in total; British artificial joints, prostheses, hearing aids '
        'and pacemakers nothing.',
        'link': '',
    },
    {
        'id': 'hearing-aids',
        'question': 'Are there tariffs on hearing aids?',
        'searchedAs': [
            'tariff on hearing aids',
            'us tariffs on hearing aids',
            'are there tariffs on hearing aids',
            'hs code for hearing aids',
            'hs code for hearing aid parts',
        ],
        'answer': 'Hearing aids are 9021.40 and their parts 9021.90.40 — both Free. The extra duty depends on origin: 10% in total from Denmark, '
        'Germany or other EU countries, 12.5% in total from Switzerland, +12.5% from Singapore or China, nothing from the UK (exception list) or '
        'USMCA-qualifying Mexico and Canada. Hearing aids specially designed for persons with a chronic hearing impairment may also qualify for '
        '9817.00.96.',
        'link': 'industry-areas',
    },
    {
        'id': 'eyewear',
        'question': 'Are there tariffs on eyeglasses, sunglasses and contact lenses?',
        'searchedAs': [
            'tariffs on eyeglasses',
            'tariff on eyeglasses from china',
            'are there tariffs on eyeglasses',
            'sunglasses tariff code',
            'hs code for sunglasses',
            'hs code for contact lenses',
        ],
        'answer': 'Sunglasses are 9004.10 (2%), safety glasses, goggles and other spectacles 9004.90 (2.5%), plastic frames 9003.11 (2.5%), '
        'contact lenses 9001.30 and spectacle lenses 9001.40/.50 (2%). Chinese eyewear adds 12.5% plus 7.5% (List 4A): sunglasses 22%. From '
        'Italy or France 10% in total, from Vietnam 14.5%. Eyeglass and sunglass lenses must be impact-resistant under FDA rules.',
        'link': 'industry-areas',
    },
    {
        'id': 'hs-9027',
        'question': 'What is HS code 9027?',
        'searchedAs': ['hs code 9027', 'hs code 9027.90', 'hs code 9027.89', 'hs code 9027.50', 'hs code 9027.10'],
        'answer': 'Heading 9027 covers instruments for physical or chemical analysis: gas and smoke analyzers (9027.10), chromatographs and '
        'electrophoresis instruments (9027.20), spectrometers (9027.30), instruments using optical radiation (9027.50), mass spectrometers '
        '(9027.81), other analyzers such as pH and particle instruments (9027.89) and microtomes and parts (9027.90). Almost all are Free (exposure '
        'meters 1.2%); Chinese ones pay 37.5% (most on List 1).',
        'link': '',
    },
    {
        'id': 'hs-9031',
        'question': 'What is HS code 9031?',
        'searchedAs': ['hs code 9031', 'hs code 9031.80', 'hs code 9031.90', 'hs code 9031.49', 'hs code 9031.41'],
        'answer': 'Heading 9031 covers measuring and checking instruments not elsewhere specified: balancing machines (9031.10), test benches '
        '(9031.20, 1.7%), optical inspection of semiconductor wafers, photomasks and reticles (9031.41), coordinate-measuring machines and other '
        'optical instruments (9031.49), other instruments and sensors (9031.80) and parts (9031.90). Wafer and mask inspection lines are exempt '
        'from the 2026 Section 301 duty; Canadian 9031.49.90 instruments pay 50% Section 338.',
        'link': '',
    },
    {
        'id': 'hs-controls',
        'question': 'What are HS codes 9026 and 9032?',
        'searchedAs': ['hs code 9026', 'hs code 9026.20', 'hs code 9032', 'hs code 9032.89', 'hs code 9032.10'],
        'answer': '9026 covers instruments for measuring flow, level and pressure of liquids and gases — flow meters (9026.10), pressure gauges and '
        'transmitters (9026.20), heat meters and others (9026.80) — all Free. 9032 covers automatic regulating instruments: thermostats '
        '(9032.10, 1.7%), manostats (9032.20), hydraulic and pneumatic regulators (9032.81) and other controllers (9032.89, 1.1%–1.7%). Chinese '
        'ones pay 37.5% or more (List 1).',
        'link': '',
    },
    {
        'id': 'thermometer',
        'question': 'What is the HS code for thermometers?',
        'searchedAs': ['hs code for thermometer', 'hs code for infrared thermometer', 'hs code for thermometer digital', 'hs code for food thermometer'],
        'answer': 'Thermometers are heading 9025: liquid-filled clinical (9025.11.20) and other (9025.11.40) thermometers, and other thermometers '
        'and pyrometers including digital and infrared ones (9025.19) — all Free. Clinical thermometers are FDA devices. From China, liquid '
        'thermometers pay 12.5%, and so do the 9025.19.80 statistical lines excluded from List 2 through November 9, 2026 (.10, .20, .85); '
        'pyrometers and the other infrared thermometers (9025.19.80.60) pay 37.5%.',
        'link': '',
    },
    {
        'id': 'xray-bp',
        'question': 'What are the HS codes for X-ray machines and blood pressure monitors?',
        'searchedAs': ['hs code for x-ray machine', 'hs code for x ray machine parts', 'hs code for blood pressure monitor', 'hs code for blood pressure machine'],
        'answer': 'X-ray apparatus is 9022: CT scanners 9022.12, dental X-ray 9022.13, other medical X-ray 9022.14, industrial and baggage X-ray '
        '9022.19, X-ray tubes 9022.30, parts 9022.90 (Free–1.4%). Blood pressure monitors are 9018.19.95 (electronic) or 9018.90.50 '
        '(sphygmomanometers) — Free. Diagnostic X-ray systems need a Form FDA 2877 declaration at entry.',
        'link': '',
    },
    {
        'id': 'chapter-90',
        'question': 'What does HTS Chapter 90 cover?',
        'searchedAs': ['hts chapter 90', 'htsus chapter 90', 'chapter 90 hts 2026', 'hts code chapter 90', 'us hts chapter 90'],
        'answer': f'HTS Chapter 90 has {N_LINES} tariff lines in 32 headings: optical elements, fibers and lenses (9001–9002), eyewear (9003–9004), '
        'binoculars, cameras, projectors and microscopes (9005–9013), navigation, surveying and drafting instruments (9014–9017), medical, '
        'dental, therapy, orthopedic and X-ray apparatus (9018–9022), testing and measuring instruments, thermometers, meters and controls '
        '(9023–9032) and other parts (9033). Clocks and watches are Chapter 91; digital cameras and radar are Chapter 85.',
        'link': '',
    },
]
