# Executed from fill70.py (shares its globals): tariff updates, industry areas, understand industry,
# tariff engineering and FAQ text for Chapter 70.

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = f'HTS Chapter 70: {SHORT} — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 70 Tariff Updates 2026: Glass, Mirror, Bottle & Fiberglass Duties Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 70 — float and tempered glass, auto glass, mirrors, bottles and jars, glassware, '
    'fiberglass — since January 2025: the end of the IEEPA and Section 122 duties, the 2026 Section 301 tariffs, Section 232 on auto glass, '
    'Canada Section 338, and the 2026 float glass antidumping orders, with Federal Register citations.',
    'keywords': [
        'hts chapter 70 tariff updates',
        'glass tariffs 2026',
        'glass tariffs from china',
        'glass tariffs canada',
        'auto glass tariffs',
        'float glass antidumping china',
        'section 301 tariff glass',
        'section 232 auto parts glass',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 70 base rate changed**: two drinking-glass and glassware lines were renumbered '
    '(7013.37.10.01 and 7013.99.40.01 replace the .10/.90 statistical splits) at the same 28.5% and 38%, and every other line is unchanged.\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached glass from almost every country — up to 145% extra '
    'for China in April–May 2025 on top of the Section 301 lists, 15% in total for the EU from August 7, 2025. They **ended on February 24, '
    '2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a '
    '**Section 301 tariff** (+10% or +12.5%; 10% in total for the EU and Taiwan, 12.5% for Japan and Korea). China also keeps its 2018–2019 '
    'lists: **+25% (List 3)** on flat glass, safety glass, mirrors, bottles, lab glass and most fiberglass, **+7.5% (List 4A)** on most '
    'glassware. **Laminated vehicle glass, windshields for trucks and buses, and rear-view mirrors** have carried a **25% Section 232 '
    'vehicle-parts duty** since May 3 or November 1, 2025 (15% in total for Japan, the EU, Korea and Taiwan). Since **August 22, 2026** Canadian '
    'glass bottles and jars (7010.90.50) and glassware over $5 (7013.99.90) pay a **50% Section 338 duty**, even under USMCA. And since **April 6, '
    '2026** Chinese **float glass** pays antidumping (151.27%–181.52%) and countervailing (19.75%–113.34%) deposits, and Malaysian float glass a '
    'countervailing deposit (17.25%–101.99%).'
)
tu['scope'] = (
    'Measures that reach Chapter 70 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the China '
    'Section 301 Lists 2, 3 and 4A and their product exclusions, the Section 232 duties on automobile parts and on medium- and heavy-duty '
    'vehicle parts, the Canada Section 338 duties, the Section 201 safeguard on quartz surface products, Russia\'s rates in lieu of column 2, '
    'and the 2025–2026 IEEPA and Section 122 duties that have ended. Antidumping and countervailing duty orders (float glass, fiberglass door '
    'panels, quartz surface products) and the cases that ended without an order (glass containers, glass wine bottles) are in the change log. '
    'For the rate each supplier pays, see Rates by country.'
)

NO_52B = 'No Chapter 70 line is on the general exemption list (note 52(b)). '
NO_52J = 'No Chapter 70 line is on its exception list in note 52(j). '
AUTO_301 = (
    'Laminated vehicle glass (7007.21.51), windshields for trucks and buses (7007.21.11.10) and rear-view mirrors (7009.10) pay the Section 232 '
    'vehicle-parts duty instead when they are car, truck or bus parts (note 52(f)). '
)

IN_EFFECT_TEXT = {
    'China': (
        'Several Section 301 duties stack. The 2026 action adds +12.5% (9903.05.31) on every line. The 2018–2019 lists add +25% on fused-quartz '
        f'rods (List 2, 9903.88.02), +25% on {N_L3} lines (List 3, 9903.88.03) — cullet, rods and tubes, flat, float and worked glass, safety glass, '
        'insulating units, mirrors, bottles and jars, lamp envelopes, optical and lab glass, mosaic tiles and blocks, beads and nearly all '
        f'fiberglass — and +7.5% on {N_L4A} lines (List 4A, 9903.88.15): most drinking glasses, stemware and tableware, spectacle and watch '
        f'glasses, glass eyes and some colored fiberglass fabrics. {N_CN_NONE} lines — some borosilicate, lead-crystal, tempered and cheap '
        'glassware (7013.42.10, .42.30, .49.50, .91.10, .91.20, .99.20, .99.40, .99.50, .99.60, .99.80) and 7019.19.30 — were on List 4B, '
        'which never took effect, so they pay only the 12.5%. Five product exclusions run through November 9, 2026 (note 20(vvv)(iii), '
        '9903.88.69): tempered-glass screen protectors and tempered solar-panel cover glass (7007.19), two sizes of vehicle rear-view mirror '
        '(7009.10) and glass mosaic tiles on a vinyl mesh (7016.10). Listed vehicle parts pay the 25% Section 232 duty in place of the 12.5%. Float '
        'glass also carries AD/CVD deposits. The IEEPA duties ended February 24, 2026, and USTR\'s four-year review kept the lists in place.',
        'Chinese glass bottles and jars pay 37.5%, tempered glass 42.5%, mirrors 44%–45.3%, fiberglass fabric 43.5%–44.8%; drinking glasses '
        '$0.30–$3 each 42.5%; a laminated car windshield 42.4%, a truck windshield 54.9%. Chinese float glass pays the 37.5% plus antidumping '
        'and countervailing deposits of 171%–295% of value.',
    ),
    'Mexico': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94) and no Section 232 vehicle-parts duty (9903.94.06, 9903.74.10). Others pay '
        'the base rate + 10% (9903.05.55), or 25% Section 232 on vehicle glass and mirrors that are car, truck or bus parts. ' + NO_52B
        + 'Mexico is not subject to the Canada Section 338 duties. The glass wine bottle antidumping case against Mexico ended in February 2025 '
        'without an order. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.',
        'USMCA-qualifying Mexican bottles, glassware, windshields and mirrors enter Free; a non-qualifying glass jar pays 10%, a drinking glass '
        '$0.30–$3 each 32.5%.',
    ),
    'Canada': (
        'Three measures. The 2026 Section 301 duty (+10%, 9903.05.29) and the Section 232 vehicle-parts duties do not apply to USMCA-qualifying '
        'goods (9903.05.93, 9903.94.06, 9903.74.10). The Section 338 duty (+50%, from August 22, 2026, 9903.03.14) applies to products of Canada '
        'in two Chapter 70 subheadings — glass bottles, jars and other containers (7010.90.50) and glassware valued over $5 each (7013.99.90) — '
        'and U.S. note 51(a) applies it even when USMCA is claimed. The September 2026 list revisions and import bans changed no Chapter 70 entry. '
        'The 35% IEEPA duty on non-USMCA goods (9903.01.10) ended February 24, 2026.',
        'A USMCA-qualifying Canadian glass bottle or jar pays 50%, 60% if not USMCA-qualifying; other USMCA glass, mirrors and fiberglass pay '
        'nothing.',
    ),
    'European Union': (
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at or above 10% (drinking glasses and glassware valued up to '
        '$3 each, lead crystal up to $3, tempered glassware) nothing is added (9903.05.38, note 52(k)). Laminated vehicle glass and rear-view '
        'mirrors that are car parts pay 15% in total (9903.94.53, from August 1, 2025); listed parts of trucks and buses pay the base rate + 25% '
        '(9903.74.08). ' + NO_52B + 'The EU exception list (note 52(j)) has no Chapter 70 line. This replaced the 15%-in-total IEEPA rate '
        '(9903.02.20), which ended February 24, 2026.',
        'German, French or Italian glass bottles, tempered glass, mirrors, lab glass and fiberglass pay 10% in total; Italian drinking glasses '
        'valued $0.30–$3 pay their 22.5% base rate only; a German laminated car-glass part 15%.',
    ),
    'Japan': (
        'Japan pays its base rate or 12.5%, whichever is higher (9903.05.49, note 52(k)). Laminated vehicle glass and rear-view mirrors that are '
        'car parts pay 15% in total (9903.94.43, since September 16, 2025); listed truck and bus parts pay the base rate + 25% (9903.74.08). '
        + NO_52B
        + 'The 15% IEEPA rate ended February 24, 2026.',
        'Japanese LCD glass, fiberglass yarn and lab glass pay 12.5% in total; a Japanese car rear-view mirror 15%.',
    ),
    'South Korea': (
        'Korea pays its base rate or 12.5%, whichever is higher (9903.05.71, note 52(k)); KORUS (KR) makes most base rates Free but does not '
        'remove this duty. Laminated vehicle glass and rear-view mirrors that are car parts pay 15% in total (9903.94.63, since November 1, 2025). '
        'Korea is exempt from the quartz surface products safeguard. The 15% IEEPA rate ended February 24, 2026.',
        'Korean glass, mirrors and fiberglass pay 12.5% in total; drinking glasses with higher base rates pay those.',
    ),
    'Taiwan': (
        'Taiwan pays its base rate or 10%, whichever is higher (9903.05.76). Laminated vehicle glass and rear-view mirrors that are car parts pay '
        '15% in total (9903.94.67, since May 1, 2026). ' + NO_52B + 'The 20% IEEPA duty (9903.02.60) ended February 24, 2026.',
        'Taiwanese glass, mirrors and fiberglass pay 10% in total; a Taiwanese car rear-view mirror 15%.',
    ),
    'Malaysia': (
        'Base rate + 10% (9903.05.54). ' + NO_52B + NO_52J + AUTO_301 + 'Malaysian float glass carries a countervailing duty deposit '
        '(17.25% Jinjing, 28.45% Xinyi Energy Smart, 101.99% NSG, 27.32% all others) since April 6, 2026; the antidumping case ended because the '
        'ITC found the imports negligible. The 19% IEEPA duty ended February 24, 2026.',
        'Malaysian fiberglass pays 14.3%–17.3%, tempered glass 15%; Malaysian float glass adds the countervailing deposit.',
    ),
    'Vietnam': (
        'Base rate + 12.5% (9903.05.84). ' + NO_52B + AUTO_301 + 'The 20% IEEPA duty (9903.02.69) ended February 24, 2026.',
        'Vietnamese drinking glasses $0.30–$3 pay 35%, mirrors 19%–20.3%, fiberglass 16.8%–19.8%.',
    ),
    'India': (
        'Base rate + 10% (9903.05.44). ' + NO_52B + AUTO_301 + 'India is not exempt from the quartz surface products safeguard, and Indian quartz '
        'surface products are under 2020 AD/CVD orders. The IEEPA duties on India (25% from August 7, 2025, plus 25% from August 27) ended in '
        'February 2026.',
        'Indian glass beads pay 10%, drinking glasses $0.30–$3 32.5%, lab glassware 16.7%.',
    ),
    'Türkiye (Turkey)': (
        'Base rate + 12.5% (9903.05.79). ' + NO_52B + AUTO_301 + 'Turkish quartz surface products are under 2020 AD/CVD orders. The 15% IEEPA '
        'duty ended February 24, 2026.',
        'Turkish drinking glasses $0.30–$3 pay 35%, glassware over $5 19.7%, float glass 14.5¢/m² + 12.5%.',
    ),
    'United Kingdom': (
        'Base rate + 10% (9903.05.81). ' + NO_52B + 'Laminated vehicle glass (7007.21.51.00) and rear-view mirrors (7009.10.00.00) on the UK list '
        'in note 33(j) pay 10% in total when they are car parts (9903.94.32). The 10% IEEPA duty ended February 24, 2026.',
        'British glassware over $5 pays 17.2%, glass bottles 10%, a car rear-view mirror 10% in total.',
    ),
    'Brazil': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The '
        'Brazil exemption list (U.S. note 50(a)(ii)) names no Chapter 70 line; vehicle parts that pay Section 232 are exempt from both (note '
        '50(a)(vi), 52(f)). The 40% IEEPA duty on Brazil (Executive Order 14323) ended February 24, 2026.',
        'Brazilian glass pays 37.5% on top of the base rate — 37.5% on bottles, 42.5% on tempered glass.',
    ),
    'Indonesia': (
        'Base rate + 10% (9903.05.45). ' + NO_52B + AUTO_301 + 'Indonesia is exempt from the quartz surface products safeguard. The 19% IEEPA '
        'duty ended February 24, 2026.',
        'Indonesian glass bottles pay 10%, drinking glasses $0.30–$3 32.5%.',
    ),
    'Thailand': (
        'Base rate + 12.5% (9903.05.77). ' + NO_52B + AUTO_301 + 'The 19% IEEPA duty ended February 24, 2026.',
        'Thai glassware $0.30–$3 pays 35%–42.5%, mirrors 19%–20.3%.',
    ),
    'Russia': (
        'Russia pays column 2 rates (general note 3(b)) — 30% to 85% on most Chapter 70 lines, or per-unit rates on sheet glass — plus +12.5% '
        f'(9903.05.66). Glass bottles and jars of 7010.90.50 ({N_RU} statistical lines) pay 35% under 9903.90.08 in place of their 4.9% column 2 '
        'rate (U.S. note 30).',
        'Russian glass is effectively priced out: a bottle pays 47.5%, drinking glasses 72.5%.',
    ),
}
OTHER_TEXT = (
    'The other Section 301 economies pay +10% or +12.5% (9903.05.20–9903.05.84), or 12.5% in total for Switzerland. ' + NO_52B + 'Three '
    f'country exception lists in note 52(j) reach {N_JO} fiberglass lines (7019.11–7019.19 strands, rovings and yarns and 7019.61–7019.69 woven '
    'fabrics): Jordan (9903.06.20), and Guatemala (9903.06.06) and, on 8 of them, El Salvador (9903.06.09) when CAFTA-DR is claimed. Countries '
    'outside the 60 economies pay only the base rate.',
    'Fiberglass yarn from Jordan, or under CAFTA-DR from Guatemala, pays no Section 301 duty; Swiss glassware pays at least 12.5%; Philippine or '
    'Singaporean glass +12.5%.',
)
SEC201_TEXT = (
    'Quartz surface products — slabs, countertops and tiles made mostly of silica (quartz, glass powder) with a resin binder — entered under '
    '7020.00.60.00 pay 25% within the quarterly quota and 50% above it (9903.45.30, 9903.45.31; U.S. note 41), on top of the base rate and '
    'other duties, from August 15, 2026; the rates step down to 23%/49% on August 15, 2027. Exempt: Canada, Mexico, Korea and the other FTA '
    'partners listed in note 41(c), and listed developing and CBERA countries (for example Brazil, Indonesia, the Philippines, Cambodia). Most '
    'quartz surface products enter in Chapter 68 (6810.99).',
    'A Chinese quartz slab entered under 7020.00.60 pays 5% + 37.5% + 25% = 67.5% within the quota, plus the 2019 AD/CVD deposits if it is '
    'in their scope; one from Vietnam or Türkiye 42.5%.',
)
AUTO_TEXT = (
    'Covers 2 Chapter 70 subheadings on the U.S. note 33(g) list: laminated safety glass sized for vehicles other than windshields '
    '(7007.21.51) and rear-view mirrors for vehicles (7009.10). It applies only when they are parts of passenger vehicles or light trucks; '
    'listed articles that are not such parts, and USMCA-qualifying parts, enter under 9903.94.06 with no Section 232 duty (note 33(h)). Japan, '
    'the EU, Korea and Taiwan pay 15% in total; the UK 10% in total. Windshields (7007.21.11) and tempered vehicle glass (7007.11) are not on '
    'the car-parts list. Parts that pay it are exempt from the 2026 Section 301 and Brazil duties (notes 52(f), 50(a)(vi)); China\'s List 3 '
    'duty still applies.',
    'A laminated car-glass part or rear-view mirror from Vietnam, India or Mexico (non-USMCA) pays 3.9%–4.9% + 25%; from Japan, the EU, Korea '
    'or Taiwan 15% in total; from China 53.9%–54.9% with List 3.',
)
MHDV_TEXT = (
    'Covers 3 Chapter 70 lines on the U.S. note 38(i) list: windshields for motor vehicles (7007.21.11.10), other laminated vehicle glass '
    '(7007.21.51) and rear-view mirrors (7009.10) — when they are parts of medium- and heavy-duty trucks, tractors or buses. USMCA-qualifying '
    'parts enter under 9903.74.10 and articles that are not such parts under 9903.74.11. A part of a passenger vehicle or light truck pays the '
    'automobile-parts duty instead. There is no deal rate for the UK, EU, Japan, Korea or Taiwan. Exempt from the 2026 Section 301 duty (note '
    '52(f)).',
    'A truck windshield pays 4.9% + 25% = 29.9% from Germany, Japan, Mexico (non-USMCA) or Thailand, and 54.9% from China (with List 3); a '
    'USMCA-qualifying one pays nothing.',
)
for e in tu['inEffect']:
    key = e['country']
    if key in IN_EFFECT_TEXT:
        e['exemption'], e['whatItMeans'] = IN_EFFECT_TEXT[key]
    elif key.startswith('Other'):
        e['country'] = 'Other Section 301 economies (incl. Jordan, Guatemala, El Salvador, Switzerland, Philippines, Singapore)'
        e['exemption'], e['whatItMeans'] = OTHER_TEXT
    elif e['measure'].startswith('Section 201'):
        e['country'] = 'All countries except those exempt in U.S. note 41(c) (Canada, Mexico, FTA partners, listed developing and CBERA countries)'
        e['measure'] = 'Section 201 safeguard on quartz surface products'
        e['now'] = '+25% within quota, +50% above'
        e['exemption'], e['whatItMeans'] = SEC201_TEXT
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
        e['now'] = '10% in total; 15% in total on car glass and mirrors'
    elif c == 'Japan':
        e['measure'] = 'Section 301 tariff, Japan rate + Section 232 auto parts, Japan rate'
        e['now'] = '12.5% in total; 15% in total on car glass and mirrors'
    elif c == 'South Korea':
        e['measure'] = 'Section 301 tariff, Korea rate + Section 232 auto parts, Korea rate'
        e['now'] = '12.5% in total; 15% in total on car glass and mirrors'
    elif c == 'Taiwan':
        e['measure'] = 'Section 301 tariff, Taiwan rate + Section 232 auto parts, Taiwan rate'
        e['now'] = '10% in total; 15% in total on car glass and mirrors'
    elif c == 'United Kingdom':
        e['measure'] = 'Section 301 tariff + Section 232 auto parts, UK rate'
        e['now'] = '+10%; 10% in total on UK-listed car glass and mirrors'
    elif c == 'Canada':
        e['measure'] = 'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)'
        e['now'] = '+10% (non-USMCA); +50% on 7010.90.50 and 7013.99.90, USMCA or not'
    elif c == 'China':
        e['measure'] = 'Section 301 tariffs: 2026 action plus Lists 2, 3 and 4A'
        e['now'] = '+37.5% (List 2 or 3 lines), +20% (List 4A lines), +12.5% (other lines)'
        for sid in ('fr-2025-21671', 'fr-2019-17865', 'fr-2020-00904', 'fr-2018-17709', 'ad-float-cn', 'cvd-float'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif c == 'Brazil':
        e['measure'] = 'Section 301 tariffs: Brazil action plus 2026 action'
        if 'eo-14323' not in e['sourceIds']:
            e['sourceIds'].insert(-1, 'eo-14323')
    elif c == 'Malaysia':
        e['measure'] = 'Section 301 tariff (2026 action)'
        for sid in ('cvd-float', 'itc-float'):
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    elif c == 'Russia':
        e['measure'] = 'Section 301 tariff + 35% in lieu of column 2 on glass containers'
    elif c in ('India', 'Türkiye (Turkey)'):
        e['measure'] = 'Section 301 tariff (2026 action)'
        sid = 'qsp-in-tr-cont'
        if sid not in e['sourceIds']:
            e['sourceIds'].insert(-1, sid)
    elif e['measure'] == 'Section 301 (2026, 60 economies)':
        e['measure'] = 'Section 301 tariff (2026 action)'

CHANGE_DETAIL = {
    'section-338-canada-2026-08-22': (
        'Canada Section 338 duty reaches glass bottles, jars and fine glassware',
        '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 70 is on the 9903.03.14 list with two subheadings: glass '
        'bottles, jars and other containers for the conveyance or packing of goods (7010.90.50) and other glassware valued over $5 each '
        '(7013.99.90). Unlike the Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).',
    ),
    'section-201-safeguard-quartz-surface-products-2026-08-15': (
        'Section 201 safeguard on quartz surface products, incl. 7020.00.60',
        'Proclamation 11051 put a tariff-rate quota on quartz surface products for four years: 25% within the quarterly quota (9903.45.30) and '
        '50% above it (9903.45.31), on top of other duties. The products are defined in U.S. note 41(a) and enter mainly under 6810.99, but also '
        'under 7020.00.60.00. Canada, Mexico, FTA partners and listed developing and CBERA countries are exempt.',
    ),
    'section-201-safeguard-quartz-surface-products-scheduled-2027-08-15': (
        'Scheduled: quartz surface products safeguard steps down to 23% / 49%',
        'From August 15, 2027 the safeguard falls to 23% within the quota and 49% above it, then 21%/48% from August 15, 2028 and 19%/47% from '
        'August 15, 2029, ending August 14, 2030 (U.S. note 41(e)).',
    ),
    'section-301-2026-60-economies-2026-07-24': (
        'Section 301 tariffs on 60 economies cover all of Chapter 70',
        '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 70 line is on the general exemption list (note 52(b)). '
        'EU and Taiwan goods pay 10% in total, Japan and Korea 12.5% — nothing extra on lines already at or above that. Malaysia, India, '
        'Indonesia and the UK +10%; Vietnam, Thailand, Türkiye and China +12.5%. Jordanian fiberglass yarn and woven fabric, and the same goods '
        'from Guatemala and El Salvador under CAFTA-DR, are exempt (note 52(j)). USMCA-qualifying goods from Canada and Mexico, and vehicle parts '
        'that pay Section 232, are exempt (9903.05.93, 9903.05.94, 9903.05.90).',
    ),
    'section-301-brazil-2026-07-22': (
        'Section 301 tariff on products of Brazil',
        '25% on all goods of Brazil (9903.05.01). No Chapter 70 line is on the Brazil exemption list (U.S. note 50(a)(ii)). From July 24 the '
        '12.5% 2026 tariff (9903.05.27) is added on top.',
    ),
    'section-232-automobile-parts-2026-05-01': (
        'Taiwan: Section 232 auto parts capped at 15% in total',
        'Taiwanese laminated vehicle glass (7007.21.51) and rear-view mirrors (7009.10) that are car or light-truck parts pay 15% in total in '
        'place of the base rate and the 25% duty (9903.94.67).',
    ),
    'section-232-automobile-parts-2025-11-01': (
        'South Korea: Section 232 auto parts capped at 15% in total',
        'Korean laminated vehicle glass and rear-view mirrors that are car or light-truck parts pay 15% in total (9903.94.63), retroactive to '
        'November 1, 2025, under the notice published December 4, 2025.',
    ),
    'section-232-medium-and-heavy-duty-vehicle-parts-2025-11-01': (
        'Section 232 duty on truck and bus windshields, vehicle glass and mirrors',
        '25% on parts of medium- and heavy-duty vehicles listed in U.S. note 38(i) (9903.74.08), from every country with no deal rate: in '
        'Chapter 70, windshields for motor vehicles (7007.21.11.10), other laminated vehicle glass (7007.21.51) and rear-view mirrors (7009.10). '
        'USMCA-qualifying parts are exempt (9903.74.10).',
    ),
    'section-232-automobile-parts-2025-09-16': (
        'Japan: Section 232 auto parts capped at 15% in total',
        'Japanese laminated vehicle glass and rear-view mirrors that are car or light-truck parts pay 15% in total in place of the base rate and '
        'the 25% duty (9903.94.43).',
    ),
    'section-232-automobile-parts-2025-08-01': (
        'EU: Section 232 auto parts capped at 15% in total',
        'EU laminated vehicle glass and rear-view mirrors that are car or light-truck parts pay 15% in total (9903.94.53), retroactive to August '
        '1, 2025, under the notice published September 25, 2025.',
    ),
    'section-232-automobile-parts-2025-06-30': (
        'UK: Section 232 auto parts at 10% in total',
        'British laminated vehicle glass (7007.21.51.00) and rear-view mirrors (7009.10.00.00), both on the UK list in note 33(j), pay 10% in '
        'total (9903.94.32) when they are car parts.',
    ),
    'section-232-automobile-parts-2025-05-03': (
        'Section 232 duty on automobile parts reaches laminated vehicle glass and rear-view mirrors',
        '25% on the automobile parts listed in U.S. note 33(g) (9903.94.05), from every country: in Chapter 70, laminated safety glass sized for '
        'vehicles other than windshields (7007.21.51) and rear-view mirrors (7009.10), when they are parts of passenger vehicles or light trucks. '
        'USMCA-qualifying parts and listed articles that are not such parts enter under 9903.94.06. Windshields and tempered vehicle glass are '
        'not on the list.',
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
    if c['id'] == 'base-rates':
        c['date'] = TODAY
        c['title'] = 'No Chapter 70 base-rate changes'
        c['detail'] = (
            f'{N_LINES - 2} of {N_LINES} Chapter 70 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 '
            'Basic Edition. Two lines were renumbered without a rate change: the .10 (crystalline or non-lead crystal) and .90 statistical '
            'suffixes of 7013.37.10 (drinking glasses valued not over $0.30 each, 28.5%) and 7013.99.40 (other glassware valued not over $0.30 '
            'each, 38%) were merged into 7013.37.10.01 and 7013.99.40.01.'
        )
    # Generator quirk: pending items dated with the HTS release date instead of the notice date.
    if c['id'] == 'section-201-safeguard-quartz-surface-products-scheduled-2027-08-15':
        c['date'], c['dateLabel'] = '2026-08-05', 'Published'
    if c['id'] == 'section-301-nicaragua-scheduled-2027-01-01':
        c['date'], c['dateLabel'] = '2025-12-29', 'Published'
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
        'industries asked for them to continue. For Chapter 70 this keeps +25% (List 3) on flat and safety glass, mirrors, bottles, lab glass '
        'and fiberglass, +25% (List 2) on fused-quartz rods and +7.5% (List 4A) on most glassware.',
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
        'title': 'Canada Section 338 lists revised; Chapter 70 entries unchanged',
        'detail': 'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. 7010.90.50 and 7013.99.90 '
        'stay on the list, no other Chapter 70 provision was added, and the September 29, 2026 Canadian import bans name no Chapter 70 product.',
        'before': None,
        'now': None,
        'countries': 'Canada',
        'sourceIds': ['procl-11064', 'procl-11065', 'csms-69851916'],
    },
    {
        'id': 'ad-door-order',
        'type': 'extraDuty',
        'date': '2026-08-06',
        'dateLabel': 'Applicable',
        'title': 'AD/CVD orders on fiberglass door panels from China',
        'detail': 'Commerce issued antidumping (A-570-209) and countervailing duty (C-570-210) orders on fiberglass door panels and sidelites '
        'from China, whose origin is where the fiberglass skin is pressed. They enter mainly under 3925.20.00.10 but may also enter under '
        '7019.90.51.50. Cash deposits: antidumping 41.79%–104.08% for named companies and 147.82% for the China-wide entity; countervailing '
        '58.50%–66.22%, 186.46% for non-cooperating companies, 60.64% for all others.',
        'before': None,
        'now': 'AD 41.79%–147.82% + CVD 58.50%–186.46%',
        'countries': 'China',
        'sourceIds': ['ad-door'],
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
        'Section 232 vehicle-parts duties on qualifying Mexican and Canadian glass.',
        'before': None,
        'now': None,
        'countries': 'Canada, Mexico',
        'sourceIds': ['ustr-usmca-review'],
    },
    {
        'id': 'float-orders',
        'type': 'extraDuty',
        'date': '2026-04-06',
        'dateLabel': 'Applicable',
        'title': 'Antidumping and countervailing duty orders on float glass from China and Malaysia',
        'detail': 'Commerce issued an antidumping order on float glass products from China (A-570-188) and countervailing duty orders on float '
        'glass from China (C-570-189) and Malaysia (C-557-833), after the ITC found injury on March 26, 2026. The ITC terminated the Malaysia '
        'antidumping case because those imports were negligible. Scope: soda-lime float glass at least 2 mm thick and 0.37 m² in area — clear, '
        'tinted, coated (Low-E) or mirror stock, annealed, heat-strengthened or tempered, including tempered shower and tub doors, laminated '
        'glass, insulating glass units and LED mirrors — with origin where the glass was floated. Excluded: wired and patterned glass, vehicle '
        'glazing certified to ANSI Z26.1, vacuum insulating glass, framed mirrors without LEDs, ready-to-use over-the-door mirrors, coated and '
        'clear-back solar glass and small washing-machine lids. Listed HTS: 7005.10.80, 7005.21.10/.20, 7005.29.18/.25, 7007.29.00, 7008.00.00, '
        '7009.91.50, 7009.92.50.10, and also 7006.00.40, 7007.19.00, 7013.99.20, 7013.99.90.90. Cash deposits: China antidumping 151.27% for named '
        'exporters and 181.52% for the China-wide entity; China countervailing 19.75% (Xinyi and all others) or 113.34%; Malaysia countervailing '
        '17.25% (Jinjing), 28.45% (Xinyi Energy Smart), 101.99% (NSG), 27.32% all others.',
        'before': None,
        'now': 'China AD 151.27%–181.52% + CVD 19.75%–113.34%; Malaysia CVD 17.25%–101.99%',
        'countries': 'China, Malaysia',
        'sourceIds': ['ad-float-cn', 'ad-float-cn-corr', 'cvd-float', 'itc-float'],
    },
    {
        'id': 's122-start',
        'type': 'extraDuty',
        'date': '2026-02-24',
        'dateLabel': 'Effective',
        'title': 'Section 122 surcharge replaces the IEEPA tariffs',
        'detail': '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 70 subheading was on the product exemption list '
        '(9903.03.03). USMCA-qualifying goods from Canada and Mexico and vehicle parts paying Section 232 were exempt.',
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
        'id': 'float-final',
        'type': 'reference',
        'date': '2026-02-09',
        'dateLabel': 'Published',
        'title': 'Commerce final determinations on float glass from Malaysia',
        'detail': 'Commerce found dumping by Malaysian float glass producers, with critical circumstances, as well as subsidies. No antidumping '
        'order followed: the ITC later found the Malaysian dumped imports negligible. The countervailing duty order did issue.',
        'before': None,
        'now': None,
        'countries': 'Malaysia',
        'sourceIds': ['ad-float-my-final', 'itc-float'],
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
        'most dutiable Chapter 70 lines Free for eligible sub-Saharan countries. GSP (SPI A, A*, A+), printed on most Chapter 70 lines, remains '
        'expired since December 31, 2020.',
        'before': 'Lapsed (from September 30, 2025)',
        'now': 'In force to December 31, 2026',
        'countries': 'AGOA beneficiary countries',
        'sourceIds': ['ustr-agoa-2026', 'crs-agoa', 'procl-11030', 'cbp-gsp', 'hts-now'],
    },
    {
        'id': 'qsp-in-tr',
        'type': 'reference',
        'date': '2026-01-15',
        'dateLabel': 'Published',
        'title': 'Quartz surface products from India and Türkiye: AD/CVD orders continued',
        'detail': 'After the first sunset reviews, Commerce continued the 2020 antidumping and countervailing duty orders on quartz surface '
        'products from India and Türkiye. They enter mainly under 6810.99 but may also enter under 7016.90.10.50.',
        'before': None,
        'now': None,
        'countries': 'India, Türkiye',
        'sourceIds': ['qsp-in-tr-cont'],
    },
    {
        'id': 'cn-301-excl',
        'type': 'reference',
        'date': '2025-12-01',
        'dateLabel': 'Published',
        'title': 'China Section 301 exclusions for five Chapter 70 products extended to November 9, 2026',
        'detail': 'USTR extended 178 China Section 301 product exclusions through November 9, 2026, among them tempered-glass screen protectors '
        'and tempered cover glass for solar panels (7007.19.00), two sizes of convex and flat rear-view mirrors for motor vehicles (7009.10.00) '
        'and glass mosaic tiles on a vinyl mesh backing (7016.10.00) (U.S. note 20(vvv)(iii), 9903.88.69). Matching goods skip the 25% List 3 '
        'duty; the 2026 duty still applies.',
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
        '(EO 14326): 50% in all on Indian glass, on top of the base rate. Ended February 7, 2026.',
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
        'detail': 'Executive Order 14326 set country rates for goods entered from August 7, 2025: Malaysia, Indonesia and Thailand +19%, '
        'Vietnam and Taiwan +20%, India +25%, Türkiye +15%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% in total (9903.02.20) '
        '— so German glass bottles paid 15% — while EU drinking glasses already at 15% or more paid no extra. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+10% to +25% (ended)',
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
        'detail': 'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese glass jar '
        '(Free, List 3) then paid 25% + 20% + 10% = 55% until November 9, 2025. Ended February 24, 2026.',
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
        'rates announced on April 2 for other countries, which never took effect. With the 20% fentanyl duty and the 25% List 3 duty, a Chinese '
        'glass jar paid 170% until May 13, 2025, and a drinking glass $0.30–$3 each (List 4A) 175%.',
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
        'detail': '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 70 product '
        'was on the general exemption list; automobile parts paying Section 232 were outside it. Ended February 24, 2026.',
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
        'on top of the Section 301 list duties. Ended February 24, 2026.',
        'before': '+10%',
        'now': '+20% (ended)',
        'countries': 'China',
        'sourceIds': ['eo-14195', 'eo-14228'],
    },
    {
        'id': 'wine-no-order',
        'type': 'reference',
        'date': '2025-02-24',
        'dateLabel': 'Published',
        'title': 'No antidumping or countervailing duties on glass wine bottles',
        'detail': 'Commerce had found dumping by Chinese and Mexican glass wine bottle producers and subsidies in China, but the ITC found no '
        'injury to the U.S. industry (countervailing case October 2024, antidumping cases February 2025), so no orders were issued; the Chile '
        'case was terminated in January 2025. Wine bottles of 7010.90.50 pay only the regular duties.',
        'before': None,
        'now': 'No order',
        'countries': 'China, Mexico, Chile',
        'sourceIds': ['itc-wine-ad', 'itc-wine-cvd', 'itc-wine-cl'],
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
        'id': 'qsp-cn',
        'type': 'reference',
        'date': '2025-01-30',
        'dateLabel': 'Published',
        'title': 'Quartz surface products from China: AD/CVD orders continued',
        'detail': 'Commerce continued the 2019 antidumping and countervailing duty orders on quartz surface products from China after the '
        'sunset review. They enter mainly under 6810.99 but may also enter under 7016.90.10.',
        'before': None,
        'now': None,
        'countries': 'China',
        'sourceIds': ['qsp-cn-cont'],
    },
    {
        'id': 'containers-no-order',
        'type': 'reference',
        'date': '2020-11-05',
        'dateLabel': 'Published',
        'title': 'No antidumping or countervailing duties on glass containers from China',
        'detail': 'Commerce had found dumping and subsidies on certain glass containers (bottles and jars of 7010.90.50) from China, but the ITC '
        'found no injury in both cases (July and November 2020), so no orders were issued.',
        'before': None,
        'now': 'No order',
        'countries': 'China',
        'sourceIds': ['itc-containers-ad', 'itc-containers-cvd'],
    },
    {
        'id': 'cn-list4a-75',
        'type': 'extraDuty',
        'date': '2020-02-14',
        'dateLabel': 'Effective',
        'title': 'China List 4A duty cut to 7.5%',
        'detail': 'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5% under the Phase One agreement. List 4A covers most Chapter 70 '
        'glassware (drinking glasses, stemware, tableware and decorative glass), spectacle and watch glasses, glass eyes and some colored '
        'fiberglass fabrics.',
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
        'title': 'China List 4A reaches glassware',
        'detail': 'The fourth China Section 301 list put +15% on most Chinese drinking glasses, stemware, table and kitchen glassware, decorative '
        'glass, spectacle and watch glasses and glass eyes. Other glassware lines went on List 4B (9903.88.16), which was suspended and never '
        'charged.',
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
        'detail': 'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. In Chapter 70 List 3 covers flat, float and safety glass, insulating '
        'units, mirrors, bottles and jars, lamp envelopes, optical and laboratory glass, glass blocks and mosaics, beads and nearly all fiberglass.',
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
        'title': 'China Section 301 List 3 reaches most glass',
        'detail': 'The third China Section 301 list put +10% on most Chinese Chapter 70 goods other than tableware and decorative glassware.',
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
        'title': 'China List 2 reaches fused-quartz rods',
        'detail': 'The second China Section 301 list put +25% (9903.88.02) on rods of fused quartz or other fused silica (7002.20.10).',
        'before': 'None',
        'now': '+25%',
        'countries': 'China',
        'sourceIds': ['fr-2018-17709'],
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
for s in stats:
    if s['label'] == 'Base rates unchanged':
        s['value'] = f'{N_LINES} of {N_LINES} lines'
        s['note'] = '2 lines renumbered at the same rate'
stats.append({'label': 'AD/CVD orders', 'value': 'Float glass', 'note': 'China AD + CVD, Malaysia CVD, since April 6, 2026'})
stats.append({'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'})
tu['stats'] = stats

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = f'HTS Chapter 70: {SHORT} — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = GROUP_LABELS[g['heading']]

VEH = (
    ' Laminated vehicle glass (7007.21.51), truck and bus windshields (7007.21.11.10) and rear-view mirrors (7009.10) pay the 25% Section 232 '
    'vehicle-parts duty instead when they are car, truck or bus parts.'
)
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on most flat glass, safety glass, mirrors, bottles, lab glass '
    'and fiberglass, or + 7.5% List 4A (9903.88.15) on most glassware; List 4B glassware pays only the 12.5%. Section 232 vehicle parts pay '
    '25% in place of the 12.5%. Float glass also pays AD/CVD deposits (not in the cells).',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94, 9903.94.06, 9903.74.10). Otherwise base rate + 10% Section 301 (9903.05.55), or '
    '+25% Section 232 on car, truck and bus glass and mirrors. The 25% IEEPA duty ended February 24, 2026.',
    'Canada': 'USMCA-qualifying: no Section 301 or Section 232 duty (9903.05.93, 9903.94.06, 9903.74.10); otherwise base rate + 10% (9903.05.29). '
    'On top, 50% Section 338 on glass bottles and jars (7010.90.50) and glassware over $5 (7013.99.90) (9903.03.14), whether or not USMCA is '
    'claimed.',
    'Japan': '12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.49); higher base rates only. Car glass and '
    'mirrors: 15% in total (9903.94.43); truck and bus parts: base rate + 25%.',
    'South Korea': '12.5% in total in place of the base rate when the base rate is under 12.5% (9903.05.71); KORUS does not remove it. Car glass '
    'and mirrors: 15% in total (9903.94.63); truck and bus parts: base rate + 25%.',
    'Taiwan': '10% in total in place of the base rate when the base rate is under 10% (9903.05.76). Car glass and mirrors: 15% in total '
    '(9903.94.67); truck and bus parts: base rate + 25%.',
    'Malaysia': 'Base rate + 10% Section 301 (9903.05.54). No Chapter 70 line is exempt.' + VEH + ' Float glass also pays a countervailing '
    'deposit (not in the cells).',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 70 line is exempt.' + VEH,
    'India': 'Base rate + 10% Section 301 (9903.05.44). No Chapter 70 line is exempt.' + VEH,
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79). No Chapter 70 line is exempt.' + VEH,
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). No Chapter 70 line is exempt.' + VEH,
    'Indonesia': 'Base rate + 10% Section 301 (9903.05.45). No Chapter 70 line is exempt.' + VEH + ' Exempt from the quartz safeguard.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). Car glass and mirrors on the note 33(j) UK list: 10% in total (9903.94.32); '
    'truck and bus parts: base rate + 25%.',
    'Brazil': 'Base rate + 25% (9903.05.01) + 12.5% (9903.05.27). Section 232 vehicle parts pay 25% instead of both. Exempt from the quartz '
    'safeguard.',
}
EU_LABEL = (
    'EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39). Lines at 10% or more — most drinking glasses '
    'and glassware valued at $3 or less, tempered glassware, glass-ceramic ware — pay only their base rate (9903.05.38). Car glass and mirrors: '
    '15% in total (9903.94.53); truck and bus parts: base rate + 25%. The 15%-in-total IEEPA rate ended February 24, 2026.'
)


def rule_label(c):
    r = c['rule']
    name = c['country']
    if name in RULE_LABELS:
        return RULE_LABELS[name]
    if r.get('atLeast'):
        return (
            'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 12.5% '
            'in total for Switzerland. Jordan, and Guatemala and El Salvador under CAFTA-DR, are exempt on most fiberglass yarn and woven fabric '
            '(note 52(j)). Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — up to 85%.'
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
    'title': 'Glass Tariffs by Country 2026 — China, Mexico, Canada, Germany, Japan, Malaysia (HTS Ch. 70) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on glass, mirrors, bottles, glassware and fiberglass by country: 10% in total for EU '
    'glass, 12.5% for Japan and Korea, +10%–12.5% for Asian suppliers, up to 42.5%+ from China, 50% Section 338 on Canadian bottles, and '
    'Section 232 on auto glass.',
    'keywords': [
        'glass tariffs from china',
        'tariffs on glass from canada',
        'us tariffs on glass',
        'auto glass tariffs',
        'glass import duty from china',
        'chapter 70 customs duty',
        'tariff on glassware from china',
        'glass tariffs canada',
    ],
}
ia['intro'] = (
    'Chapter 70 base rates run from Free (bottles, jars, LCD glass, glass beads) to 38% (cheap glassware), and the extra duty **depends on where '
    'the goods come from**. Each cell below is the base rate for that product group plus the extra duty for that country, minus any '
    'preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July '
    '24, 2026: **+10% for Malaysia, India and Indonesia**, **+12.5% for Vietnam, Thailand and Türkiye**, **10% in total for the EU and Taiwan**, '
    '**12.5% in total for Japan and Korea**. **China adds 37.5%** on most glass (12.5% plus the 25% List 3 duty) and 20% on most glassware. '
    'USMCA-qualifying goods from Mexico pay nothing; from Canada they pay nothing except the **50% Section 338 duty on glass bottles, jars and '
    'glassware over $5**. Where a cell shows two or three totals, the line also carries a **Section 232 vehicle-parts duty** (car or light-truck '
    'part, truck or bus part) or the **quartz surface products safeguard** — pick the case that matches the goods.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Multi-total cells: the Section 232 automobile-parts duty applies only to note 33(g) articles (7007.21.51, 7009.10) that are parts of '
    'passenger vehicles or light trucks, and the medium- and heavy-duty duty only to note 38(i) articles (7007.21.11.10, 7007.21.51, 7009.10) '
    'that are parts of trucks, tractors or buses; "car or light-truck part or truck or bus part" is one total for both. "Not a vehicle part" means neither — a listed article for other use enters under 9903.94.06 '
    'or 9903.74.11 and pays the base rate plus the Section 301 duty. The quartz surface products safeguard applies to 7020.00.60.00 only for '
    'products meeting U.S. note 41(a) ("not quartz surface" covers all other goods of that line); "within quota" and "over quota" depend on '
    'the quarterly quota fill.',
    'Canada, "USMCA-qualifying" side: the Section 301 and Section 232 duties are removed (9903.05.93, 9903.94.06, 9903.74.10), but the 50% '
    'Section 338 duty stays on 7010.90.50 and 7013.99.90 because U.S. note 51(a) applies it even when a special rate is claimed.',
    'The compound and per-unit rates on sheet and float glass (for example 14.5¢/m² or 1¢/kg + 1.6%) are priced at 1,000 units on a $10,000 '
    'shipment for the EU, Japan, Korea and Taiwan "in total" rules.',
    'Not in the cells: antidumping and countervailing duty deposits (float glass from China and Malaysia; fiberglass door panels and quartz '
    'surface products where they enter under Chapter 70), which are company-specific; the China product exclusions in note 20(vvv)(iii) and '
    'the civil-aircraft exemptions (they need the importer\'s confirmation); the note 52(j) exemptions for Jordan and for CAFTA-DR fiberglass '
    'from Guatemala and El Salvador (those countries are in "Any other country"); FTA preferences other than USMCA and KORUS; and NHTSA, CPSC or '
    'FDA compliance costs. The opt-in Section 232 certified-parts headings are not modeled.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 31, 33, 38, 41, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) has no Chapter 70 line. The country exception lists in note 52(j) reach 38 fiberglass subheadings '
    '(7019.11–7019.19 and 7019.61–7019.69) for Jordan (9903.06.20) and for Guatemala (9903.06.06) under CAFTA-DR, and 8 of them for El Salvador '
    '(9903.06.09); the EU, UK, Japan, Malaysia and other lists name no Chapter 70 line. Note 52(d) exempts civil-aircraft windshields (7007.21.11) '
    'with a certification. The Brazil list (note 50(a)(ii)) has no Chapter 70 line. The Canada Section 338 list (note 51(b)(3)) names 7010.90.50 '
    'and 7013.99.90; the alcoholic-beverage and dairy lists and the September 29, 2026 import bans name none. China: List 2 (note 20(d)) covers '
    '7002.20.10; List 3 (note 20(f)) covers most of headings 7001–7011, 7014 and 7016–7020; List 4A (note 20(s)) covers most of heading 7013, 7015, '
    '7018.90.10 and four colored fiberglass fabric subheadings; eleven subheadings were only on the suspended List 4B (note 20(u)); five product '
    'exclusions in note 20(vvv)(iii) run through November 9, 2026; the 2024 increases in note 31 name no Chapter 70 line. Section 232: no '
    'Chapter 70 line is on the note 16 or note 19 metal lists or the wood, semiconductor or other product lists; note 33(g) names 7007.21.51 and '
    '7009.10.00 (and note 33(j) the same two for the UK), note 38(i) names 7007.21.11.10, 7007.21.51 and 7009.10.00. Note 41 brings 7020.00.60.00 '
    'into the quartz surface products safeguard. Note 30(b) sets 35% for Russian 7010.90.50 in place of column 2. A Federal Register search of '
    'Commerce and ITC notices found AD/CVD orders on float glass (China, Malaysia), and orders on fiberglass door panels, quartz surface products '
    'and wooden bedroom furniture whose scopes name a Chapter 70 subheading; the glass containers (2020) and glass wine bottles (2025) cases '
    'ended without orders.'
)
add_sources(ia, ['ad-float-cn', 'cvd-float', 'ad-door', 'qsp-cn-cont', 'qsp-in-tr-cont', 'ad-wbf-cn', 'itc-containers-ad', 'itc-wine-ad'])

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 70: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Glass, Mirrors, Bottles & Fiberglass into the U.S.: FMVSS 205, CPSC Glazing, FDA, AD/CVD Scope & Legal Ways to Lower '
    'Duty (HTS Ch. 70) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 70 line needs at U.S. entry — NHTSA glazing rules for auto glass, CPSC safety glazing for '
    'shower and patio doors, FDA rules for food-contact glassware, origin marking, AD/CVD on float glass — and the legal ways to pay less: '
    'classification, origin, USMCA, exclusions, first sale, drawback, FTZ and rulings.',
    'keywords': [
        'hts chapter 70 tariff engineering',
        'glass and glassware tariff engineering',
        'tempered glass tariff code',
        'windshield tariff code',
        'float glass antidumping scope',
        'glass container tariff code',
        'first-sale-for-export valuation',
        'country of origin marking glass',
    ],
}
te['intro'] = (
    'Most Chapter 70 goods need no import license, but several lines carry product rules. **Vehicle glazing** — windshields, side and rear '
    'windows — must meet NHTSA\'s Standard 205 and carry the DOT and manufacturer marks, and the importer files a vehicle-equipment declaration. '
    '**Tempered or laminated glass in doors, shower and tub enclosures and patio doors** must meet the CPSC architectural glazing standard. '
    '**Bottles, jars and glassware for food and drink** must not make food unsafe under the Food, Drug, and Cosmetic Act. Every article must be '
    '**marked with its country of origin** (with a few exceptions), and sheet glass of headings 7003 and 7004 must be packed in standard units '
    'or be refused entry.\n\n'
    'On cost, the levers are the **classification** (glassware is rated by material and value per piece — 38% at $0.30 or less, 7.2% above '
    '$5), the **country of origin** (+10% Malaysia or India, +37.5% China, 10% in total for the EU), **USMCA**, the **China product '
    'exclusions**, whether a vehicle-glass article is in fact a **car or truck part**, the **scope of the float glass AD/CVD orders**, and '
    'first-sale valuation, drawback and foreign-trade zones. Each lever depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'classify',
        'title': 'Classify by material, construction and value per piece',
        'saves': 'The gap between line rates: drinking glasses pay 28.5% at $0.30 or less each, 22.5% at $0.30–$3, 5%–11.3% above $3; lead '
        'crystal (24% PbO or more) 3%–15%; tempered ("pressed and toughened") glassware 12.5%; borosilicate kitchenware 7.2%–22.5%. Float glass '
        'pays 14.5¢–18.7¢/m² by area, 4.4% if coated, Free if suitable for LCDs',
        'appliesTo': 'Headings 7003–7010, 7013, 7018 and 7019, where thickness, area, coating, glass type, value per piece or use decides the '
        'line',
        'document': 'Product specifications (glass composition, PbO content, tempering, thickness, area, coating) and the per-piece invoice value.',
        'caveat': 'The value brackets of heading 7013 use the value of each article as entered; the declared value must be the real transaction '
        'value. The classification must match the goods; a ruling settles doubtful cases.',
        'citations': [
            {'label': 'HTSUS Chapter 70, notes and additional U.S. notes', 'url': CH70_PDF},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and how each measure sets it',
        'saves': 'The difference between country rates: +10% for Malaysia, India or Indonesia, +12.5% for Vietnam or Thailand, 10% in total for '
        'the EU, +20% to +37.5% for China',
        'appliesTo': 'All lines; the gap is widest on Chinese glass, bottles and fiberglass',
        'document': 'Production records showing where the glass was made and worked. For the float glass AD/CVD orders, origin is where the '
        'glass was floated, whatever later cutting, tempering, laminating or coating is done elsewhere; for fiberglass door panels, where the skin '
        'is pressed.',
        'caveat': 'Cutting, edging, tempering or coating Chinese float glass in a third country does not change its origin for the AD/CVD orders. '
        'For the tariff, origin follows substantial transformation, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '91 FR 17250 (float glass order: origin rule in the scope)', 'url': src('ad-float-cn')['url']},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on glass from Mexico or Canada',
        'saves': 'The base rate (up to 38%), the 10% Section 301 duty and the 25% Section 232 vehicle-parts duty',
        'appliesTo': 'All lines from Mexico; from Canada, all lines except glass bottles and jars (7010.90.50) and glassware over $5 (7013.99.90)',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on 7010.90.50 and 7013.99.90 from Canada (U.S. note 51(a)). The good must meet '
        'the Chapter 70 rule of origin in General Note 11 for its subheading. The USMCA was not renewed at the July 1, 2026 joint review but '
        'remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, 9903.94.06, 9903.74.10, U.S. notes 33, 38, 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim AGOA, CBERA or another FTA',
        'saves': 'The base rate, and for CAFTA-DR fiberglass from Guatemala or El Salvador — and Jordanian fiberglass yarn and fabric — the Section '
        '301 duty too',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AGOA (D), CBERA (E), CAFTA-DR (P), Jordan (JO), Korea (KR), '
        'Australia, Chile, Colombia, Peru and the other FTA partners',
        'document': 'The origin proof each program requires (a certification or declaration of origin) and records to back it up.',
        'caveat': 'An FTA removes the base rate but, except where a note 52(j) list says otherwise, not the 2026 Section 301 duty (U.S. note 52(a)) '
        '— a Korean product pays 12.5% in total even when KORUS makes the base rate Free. AGOA (D) runs to December 31, 2026. GSP (A, A*, A+) has '
        'been expired since December 31, 2020, although the codes are still printed.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 7–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a), (j)', 'url': CH99_PDF},
            {'label': '19 CFR 10.178a (AGOA)', 'url': ecfr(19, '10.178a')},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use a China Section 301 exclusion for qualifying goods',
        'saves': 'The 25% List 3 duty on Chinese goods that match one of five exclusion descriptions',
        'appliesTo': 'Tempered-glass screen protectors and tempered cover glass for solar panels (7007.19.00.00), two sizes of convex and flat '
        'vehicle rear-view mirrors (7009.10.00.00), glass mosaic tiles on a vinyl mesh backing (7016.10.00.00)',
        'document': 'Product dimensions, weights and materials showing the goods match the description in note 20(vvv)(iii); report 9903.88.69 '
        'instead of 9903.88.03.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends them again. The 12.5% 2026 Section 301 duty still applies, and a '
        'rear-view mirror that is a car part pays the Section 232 duty.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv)(iii), 9903.88.69', 'url': CH99_PDF},
            {'label': '90 FR 55232 (exclusions extended to November 9, 2026)', 'url': src('fr-2025-21671')['url']},
        ],
    },
    {
        'id': 'vehicle-part',
        'title': 'Document whether vehicle glass and mirrors are car or truck parts',
        'saves': 'The 25% Section 232 duty (or the 15% / 10% deal rates) on laminated vehicle glass, truck windshields and rear-view mirrors that '
        'are not parts of passenger vehicles, light trucks or medium- and heavy-duty vehicles',
        'appliesTo': '7007.21.11.10, 7007.21.51.00 and 7009.10.00.00',
        'document': 'Evidence of the end use — the vehicle model, customer and application — to support entry under 9903.94.06 or 9903.74.11 '
        'instead of 9903.94.05 or 9903.74.08.',
        'caveat': 'Only articles that are really not parts of those vehicles qualify; CBP\'s FAQs explain how to report them. Glass that does pay '
        'Section 232 is exempt from the 2026 Section 301 duty, so the saving is the difference, not the full 25%.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 33(g)–(h), 38(i)–(l)', 'url': CH99_PDF},
            {'label': 'CBP Section 232 FAQs: automobiles and automobile parts', 'url': src('cbp-section-232-additional-faqs-autos')['url']},
        ],
    },
    {
        'id': 'adcvd-scope',
        'title': 'Check the float glass AD/CVD scope — and ask for a scope ruling',
        'saves': 'Antidumping deposits of 151.27%–181.52% and countervailing deposits of 19.75%–113.34% on Chinese float glass (17.25%–101.99% '
        'countervailing on Malaysian), when the product is outside the scope',
        'appliesTo': 'Float, coated, tempered and laminated flat glass, insulating units and mirrors of 7005, 7006, 7007, 7008, 7009 and 7013 '
        'from China or Malaysia',
        'document': 'Specifications showing an exclusion applies: wired glass, ASTM C1036 Type II patterned glass, vehicle glazing certified to '
        'ANSI Z26.1, vacuum insulating glass, framed mirrors without LEDs, ready-to-use over-the-door mirrors, coated or clear-back solar glass, '
        'small washing-machine lids, glass under 2 mm or 0.37 m². A scope ruling request settles doubtful cases.',
        'caveat': 'The written scope, not the HTS line, decides coverage. Deposits are company-specific and change with each administrative '
        'review.',
        'citations': [
            {'label': '91 FR 17250 (float glass AD order and scope)', 'url': src('ad-float-cn')['url']},
            {'label': '91 FR 17253 (float glass CVD orders)', 'url': src('cvd-float')['url']},
            {'label': '19 CFR 351.225 (scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–50% extra duties included — when the factory price '
        'to a trading company is lower than the price you pay',
        'appliesTo': 'All lines with ad valorem duties bought through a trading company or agent rather than straight from the maker',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry. On '
        'glassware it can also move a piece into a lower-value, higher-rate bracket of heading 7013.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported goods (or goods made from them) are exported or destroyed',
        'appliesTo': 'Any line — for example float glass tempered or laminated in the U.S. and exported, or bottles filled and exported',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; antidumping and countervailing duties are not refunded by drawback.',
        'citations': [
            {'label': '19 CFR part 190', 'url': ecfr_part(19, 190)},
            {'label': '19 CFR 190.3(b) (no drawback of AD/CVD)', 'url': ecfr(19, '190.3')},
        ],
    },
    {
        'id': 'ftz',
        'title': 'Process or hold glass in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for glass used to make windows, vehicles or appliances that are partly exported',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date, including any AD/CVD deposits.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example rejected or unsold U.S. glass returned by a foreign '
        'customer',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. notes 51(a) and 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(a), 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: tempered or laminated glass (7007) versus worked glass (7006) or '
        'a part of another article; drinking glass versus other glassware; lead crystal; glass beads versus imitation jewelry; fiberglass versus '
        'mineral wool (6806)',
        'appliesTo': 'Any line where the composition, construction or use decides the line',
        'document': 'A ruling request to CBP describing the article, its composition, dimensions, value and use.',
        'caveat': 'Rulings apply to the transaction described; a changed design or material may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 70 notes', 'url': CH70_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'nhtsa-glazing',
        'agency': 'NHTSA',
        'title': 'Glazing for motor vehicles (windshields, side and rear windows, safety glass sized for vehicles) must meet FMVSS 205 (ANSI/SAE '
        'Z26.1) and carry the Z26.1 marks plus "DOT" and the prime manufacturer\'s NHTSA code; the importer files a conformity declaration with the entry, '
        'and foreign manufacturers designate a U.S. agent',
        'citations': [
            {'label': '49 CFR 571.205 (FMVSS 205)', 'url': ecfr(49, '571.205')},
            {'label': '49 CFR 591.5 (import declarations)', 'url': ecfr(49, '591.5')},
            {'label': '19 CFR 12.80', 'url': ecfr(19, '12.80')},
            {'label': '49 CFR 551.45 (U.S. agent)', 'url': ecfr(49, '551.45')},
        ],
    },
    {
        'id': 'cpsc-glazing',
        'agency': 'CPSC',
        'title': 'Glazing used in storm and other doors, bathtub and shower doors and enclosures, and sliding patio doors must meet the '
        'architectural glazing standard (impact test by category) and be certified and labeled',
        'citations': [
            {'label': '16 CFR 1201.1 (scope)', 'url': ecfr(16, '1201.1')},
            {'label': '16 CFR 1201.5 (certification and labeling)', 'url': ecfr(16, '1201.5')},
        ],
    },
    {
        'id': 'fda-food-contact',
        'agency': 'FDA',
        'title': 'Bottles, jars and glassware for food and drink: food is adulterated if its container contains a poisonous or deleterious '
        'substance that may make it injurious, and food-contact materials must be of suitable purity. FDA\'s lead-specific limits and import alert '
        'for foodware (21 CFR 109.16, Import Alert 52-08) are written for ceramicware; decorated glass is held to the general standard',
        'citations': [
            {'label': '21 U.S.C. 342(a)(6)', 'url': USC_342},
            {'label': '21 CFR 174.5', 'url': ecfr(21, '174.5')},
            {'label': 'FDA: Lead in Food and Foodwares', 'url': FDA_LEAD},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on the article '
        'or, where allowed, its container; glass cut to shape and size for clocks and hand, pocket and purse mirrors is on the J-list (only the '
        'outer container is marked)',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.33 (J-list)', 'url': ecfr(19, '134.33')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
        ],
    },
    {
        'id': 'cbp-vacuum',
        'agency': 'CBP',
        'title': 'Glass inners for vacuum flasks are parts of vacuum containers: except for USMCA goods, they must be marked by die stamping, '
        'molding, etching, engraving or an attached metal plate',
        'citations': [{'label': '19 CFR 134.43(a)', 'url': ecfr(19, '134.43')}],
    },
    {
        'id': 'hts-packing',
        'agency': 'CBP (HTSUS)',
        'title': 'Cast, rolled, drawn and blown sheet glass (headings 7003 and 7004) of one size and thickness over 4.6 m² per shipment is denied '
        'entry unless packed in 4.6 m² units (or multiples), or in units matching the domestic industry\'s packing practice',
        'citations': [{'label': 'HTSUS Chapter 70, additional U.S. note 3', 'url': CH70_PDF}],
    },
    {
        'id': 'adcvd',
        'agency': 'Commerce / CBP',
        'title': 'AD/CVD cash deposits on goods within an order\'s scope, whatever their HTS line: float glass from China (AD + CVD) and Malaysia '
        '(CVD); fiberglass door panels from China (7019.90.51.50); quartz surface products from China, India and Türkiye (7016.90.10); framed '
        'mirrors sold with a Chinese wooden bedroom dresser (7009.92)',
        'citations': [
            {'label': '19 CFR 351.211', 'url': ecfr(19, '351.211')},
            {'label': '91 FR 17250 / 91 FR 17253 (float glass orders)', 'url': src('ad-float-cn')['url']},
            {'label': '91 FR 50797 (fiberglass door panels)', 'url': src('ad-door')['url']},
        ],
    },
    {
        'id': 'ftc-insulation',
        'agency': 'FTC',
        'title': 'Home insulation (glass-wool batts, blankets and loose fill) must be labeled with its R-value and coverage data under the R-value '
        'Rule',
        'citations': [
            {'label': '16 CFR 460.2', 'url': ecfr(16, '460.2')},
            {'label': '16 CFR 460.12', 'url': ecfr(16, '460.12')},
        ],
    },
    {
        'id': 'ftc-pearl',
        'agency': 'FTC',
        'title': 'Imitation pearls may not be called "pearls" without a qualifying word such as "imitation" or "simulated"',
        'citations': [{'label': '16 CFR 23.20', 'url': ecfr(16, '23.20')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or its exemption), China Lists 2, '
        '3 or 4A (9903.88.02, .03, .15) or an exclusion (9903.88.69), Section 232 vehicle parts (9903.94.05/.06, 9903.74.08/.10/.11), Canada '
        'Section 338 (9903.03.14), the quartz safeguard (9903.45.30/.31)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 33, 38, 41, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': src('csms-69606660')['url']},
        ],
    },
]

FLOAT_SCOPE = (
    '7005.10.80', '7005.21.10', '7005.21.20', '7005.29.18', '7005.29.25', '7006.00.40', '7007.19.00', '7007.29.00', '7008.00.00',
    '7009.91.50', '7009.92.50', '7013.99.20', '7013.99.90',
)
OTHER_ADCVD = ('7019.90.51', '7016.90.10', '7009.92.10')
VEHICLE = ('7007.11.00', '7007.21.11', '7007.21.51')
ARCH = ('7007.19.00', '7007.29.00', '7008.00.00')
JLIST = ('7006.00', '7009.91.10')
CLASSIFY_H = {'7003', '7004', '7005', '7006', '7007', '7008', '7009', '7010', '7013', '7018', '7019'}
EXCL = {'7007.19.00.00', '7009.10.00.00', '7016.10.00.00'}
VPART = {'7007.21.11.10', '7007.21.51.00', '7009.10.00.00'}

GROUP_RULES = {
    '7001': ['cbp-marking', 'cbp-ch99'],
    '7002': ['cbp-marking', 'cbp-ch99'],
    '7003': ['hts-packing', 'cbp-marking', 'cbp-ch99'],
    '7004': ['hts-packing', 'cbp-marking', 'cbp-ch99'],
    '7005': ['adcvd', 'cbp-marking', 'cbp-ch99'],
    '7006': ['adcvd', 'cbp-marking', 'cbp-ch99'],
    '7007': ['nhtsa-glazing', 'cpsc-glazing', 'adcvd', 'cbp-marking', 'cbp-ch99'],
    '7008': ['cpsc-glazing', 'adcvd', 'cbp-marking', 'cbp-ch99'],
    '7009': ['adcvd', 'cbp-marking', 'cbp-ch99'],
    '7010': ['fda-food-contact', 'cbp-marking', 'cbp-ch99'],
    '7011': ['cbp-marking', 'cbp-ch99'],
    '7013': ['fda-food-contact', 'adcvd', 'cbp-marking', 'cbp-ch99'],
    '7014': ['cbp-marking', 'cbp-ch99'],
    '7015': ['cbp-marking', 'cbp-ch99'],
    '7016': ['adcvd', 'cbp-marking', 'cbp-ch99'],
    '7017': ['cbp-marking', 'cbp-ch99'],
    '7018': ['ftc-pearl', 'cbp-marking', 'cbp-ch99'],
    '7019': ['ftc-insulation', 'adcvd', 'cbp-marking', 'cbp-ch99'],
    '7020': ['fda-food-contact', 'cbp-vacuum', 'cbp-marking', 'cbp-ch99'],
}
GROUP_NOTES = {
    '7001': 'Cullet and glass scrap need no agency license. CRT glass cullet is classified in heading 8549, not here.',
    '7002': 'Fused-quartz rods (7002.20.10) are on China List 2 (+25%); other rods and tubes on List 3.',
    '7003': 'Sheets over 4.6 m² of one size must be packed in standard units (additional U.S. note 3). Patterned glass is outside the float '
    'glass AD/CVD orders.',
    '7004': 'Same packing rule as heading 7003. Drawn glass is not float glass, so the float glass orders do not reach it.',
    '7005': 'The core of the float glass AD/CVD orders: Chinese float glass at least 2 mm thick and 0.37 m² pays antidumping and '
    'countervailing deposits, Malaysian float glass a countervailing deposit — plus the regular duties.',
    '7006': 'Worked float glass (7006.00.40) is within the float glass orders if the glass was floated in China or Malaysia.',
    '7007': 'Vehicle glazing (7007.11, 7007.21) must meet FMVSS 205 and pays the Section 232 parts duty on 7007.21.51 (car, truck and bus '
    'parts) and 7007.21.11.10 (truck and bus windshields). Architectural tempered and laminated glass (7007.19, 7007.29) falls under the CPSC '
    'glazing standard and, from China or Malaysia, the float glass orders; vehicle glazing certified to ANSI Z26.1 is excluded from them.',
    '7008': 'Insulating glass units used in doors fall under the CPSC glazing standard; Chinese and Malaysian units of float glass are within '
    'the float glass orders, vacuum insulating glass is not.',
    '7009': 'Rear-view mirrors (7009.10) that are car, truck or bus parts pay the Section 232 duty. Unframed and LED mirrors of float glass '
    'from China or Malaysia are within the float glass orders; framed mirrors without LEDs and ready-to-use over-the-door mirrors are not.',
    '7010': 'Food and drink containers must not adulterate their contents. Canadian bottles and jars of 7010.90.50 pay the 50% Section 338 '
    'duty even under USMCA. No AD/CVD order covers glass containers: the 2020 China case and the 2025 wine bottle cases ended without orders.',
    '7011': 'No agency license for glass lamp envelopes.',
    '7013': 'Rates follow material, method and value per piece. Food-contact glassware falls under the FDA adulteration standard. Tempered '
    'glassware of 7013.99.20 and other glassware of 7013.99.90 can be within the float glass orders if made from Chinese or Malaysian float '
    'glass; Canadian 7013.99.90 pays 50% Section 338.',
    '7014': 'No agency license for optical and signaling glass elements that are not optically worked (worked ones are Chapter 90).',
    '7015': 'Glass for corrective spectacles and watch glasses enter Free; Chinese ones pay 20% (List 4A plus the 2026 duty).',
    '7016': 'Quartz surface products that enter under 7016.90.10 can be within the China, India and Türkiye AD/CVD orders.',
    '7017': 'No agency license for laboratory glassware; quartz reactor tubes for semiconductor furnaces enter Free.',
    '7018': 'Imitation pearls must be described as imitation (FTC). Glass beads strung into jewelry are imitation jewelry of Chapter 71.',
    '7019': 'Glass-wool home insulation needs FTC R-value labels. Fiberglass door panels from China (7019.90.51.50) are under AD/CVD orders. '
    'Jordanian fiberglass yarn and fabric, and CAFTA-DR goods from Guatemala and El Salvador, are exempt from the 2026 Section 301 duty.',
    '7020': 'Glass vacuum-flask inners must be marked by a permanent method. Quartz surface products of 7020.00.60.00 pay the Section 201 '
    'safeguard.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

row_by_hts = {r['hts']: r for r in rows if r['hts']}
for ln in te['lines']:
    hts = ln['hts']
    sub = hts[:10]
    h = sub[:4]
    rules_ = []
    if sub.startswith(VEHICLE):
        rules_.append('nhtsa-glazing')
    if sub.startswith(ARCH):
        rules_.append('cpsc-glazing')
    if h in ('7010', '7013') or sub == '7020.00.40':
        rules_.append('fda-food-contact')
    if sub == '7020.00.40':
        rules_.append('cbp-vacuum')
    if h in ('7003', '7004'):
        rules_.append('hts-packing')
    if sub.startswith(FLOAT_SCOPE) or sub.startswith(OTHER_ADCVD):
        rules_.append('adcvd')
    if sub.startswith('7019.80.10'):
        rules_.append('ftc-insulation')
    if sub == '7018.10.10':
        rules_.append('ftc-pearl')
    rules_ += ['cbp-marking', 'cbp-ch99']
    ln['ruleIds'] = rules_
    gen = row_by_hts[hts]['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    levers = []
    if h in CLASSIFY_H:
        levers.append('classify')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    if hts in EXCL:
        levers.append('cn-exclusion')
    if hts in VPART:
        levers.append('vehicle-part')
    if sub.startswith(FLOAT_SCOPE):
        levers.append('adcvd-scope')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Which line a glass article '
    'falls in, whether it is a vehicle part, whether it is within an AD/CVD scope and which Chapter 99 duties apply depend on the facts of each '
    'shipment, and the extra duties and deposit rates change by Federal Register notice and CBP guidance; confirm the current headings and '
    'rates before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 70: {SHORT} — Tariff FAQ'
fc['seo'] = {
    'title': 'Glass Tariff FAQ: China, Canada, Auto Glass, Float Glass Antidumping, HS Codes for Bottles, Glassware, Mirrors & Fiberglass '
    '(HTS Ch. 70) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on glass: glass from China and Canada, auto glass and windshields, '
    'the float glass antidumping duty, and the HS codes for glass bottles, jars, glassware, drinking glasses, mirrors, tempered glass, '
    'fiberglass and glass beads.',
    'keywords': [
        'glass tariffs',
        'glass tariffs from china',
        'tariffs on glass from canada',
        'auto glass tariffs',
        'float glass antidumping china',
        'glass bottle tariff code',
        'hs code for glassware',
        'hs code for drinking glasses',
        'hs code for mirror',
        'hs code for tempered glass',
        'hs code for fiberglass',
        'glass beads hs code',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for glass, mirrors, bottles, glassware and fiberglass. '
    'Each answer links to the page with the full detail.'
)
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'

# ---------------------------------------------------------------------------------------------------
# Trade-dependent text: overview intro, understand industry, takeaways, FAQ
# ---------------------------------------------------------------------------------------------------
cn, mx, de, ca, vn, my, inn = (imp(n) for n in ('China', 'Mexico', 'Germany', 'Canada', 'Viet Nam', 'Malaysia', 'India'))
tw = imp('Other Asia, nes')
h7007, h7010, h7013, h7019, h7009 = (hy(h) for h in ('7007', '7010', '7013', '7019', '7009'))
assert TOP[:4] == ['China', 'Mexico', 'Germany', 'Canada'], TOP[:6]

ov['intro'] = (
    'Chapter 70 covers glass from raw cullet to finished goods: float, sheet and patterned glass, tempered and laminated safety glass and '
    'windshields, insulating units, mirrors, bottles and jars, drinking glasses and tableware, lab glass, glass beads and fiberglass. Most base '
    f'rates are low — Free to about 8%, with {sum(1 for r in LINES if r["dutiable"])} of the {N_LINES} lines dutiable — but **glassware of '
    'heading 7013 runs up to 38%**, rated by material and value per piece (28.5% for drinking glasses worth $0.30 or less, 22.5% at $0.30–$3).\n\n'
    f'The U.S. imported **{fmt_usd(total)}** of Chapter 70 goods in {Y}. **China** ({fmt_usd(cn)}, down {abs(chg("China"))}%) and **Mexico** '
    f'({fmt_usd(mx)}) supplied {round((cn + mx) / total * 100)}%, ahead of Germany, Canada and fast-growing Vietnam and Malaysia. The largest '
    f'products are glass bottles and jars ({fmt_usd(h7010)}), safety glass ({fmt_usd(h7007)}), fiberglass ({fmt_usd(h7019)}) and glassware '
    f'({fmt_usd(h7013)}). On top of the base rate comes the **extra duty by country**: since July 24, 2026 a Section 301 tariff — +10% for '
    'Malaysia and India, +12.5% for Vietnam and Türkiye, 10% in total for the EU and Taiwan, 12.5% for Japan and Korea. **China pays +37.5%** '
    'on most glass (with List 3) and +20% on most glassware, and Chinese **float glass** also carries antidumping and countervailing deposits '
    'since April 2026. **Laminated vehicle glass, truck windshields and rear-view mirrors** pay a **25% Section 232 vehicle-parts duty** '
    'instead of the Section 301 tariff. USMCA-qualifying goods from Mexico pay nothing; Canadian glass bottles, jars and glassware over $5 owe '
    'a **50% Section 338 duty even under USMCA**.'
)

ov['workedExamples'] = [
    {
        'title': 'Glass jars for food from China',
        'line': '7010.90.50.25',
        'body': 'Bottles and jars for packing food and drink (7010.90.50) are Free. China adds +12.5% (9903.05.31) and +25% because 7010.90.50 '
        'is on List 3 (9903.88.03): **37.5%**, $3,750 on a $10,000 order. The same jars pay 10% from Malaysia or India, 10% in total from the '
        'EU, and nothing from Mexico under USMCA — but **50% from Canada even under USMCA** (Section 338, 9903.03.14). There is no AD/CVD order '
        'on glass containers: the 2020 China case and the 2025 wine bottle cases ended without orders.',
    },
    {
        'title': 'Drinking glasses from Türkiye ($1 each)',
        'line': '7013.37.20.90',
        'body': 'Drinking glasses (not stemware, not lead crystal) valued over $0.30 but not over $3 each pay 22.5%. Türkiye adds +12.5% '
        '(9903.05.79): **35%**, $3,500 on $10,000. From Italy or France they pay just the 22.5% (the EU rule adds nothing at 10% or more), from '
        'China 42.5% (12.5% plus 7.5% List 4A). Pieces over $5 each fall to 5% base (7013.37.60).',
    },
    {
        'title': 'Tempered shower-door glass from China',
        'line': '7007.19.00.00',
        'body': 'Tempered safety glass not sized for vehicles pays 5%. China adds +12.5% and +25% (List 3): **42.5%** before AD/CVD. If it is '
        'float glass at least 2 mm thick and 0.37 m² (tempered shower and tub doors are named in the scope), it also pays the float glass '
        'antidumping deposit (151.27% for named exporters, 181.52% China-wide) and countervailing deposit (19.75% for most). It must meet the '
        'CPSC architectural glazing standard (16 CFR 1201).',
    },
    {
        'title': 'Rear-view mirror for a car from Japan or Vietnam',
        'line': '7009.10.00.00',
        'body': 'Rear-view mirrors for vehicles pay 3.9%. A mirror that is a part of a passenger vehicle or light truck is on the note 33(g) '
        'list: from Japan it pays **15% in total** (9903.94.43); from Vietnam 3.9% + 25% (9903.94.05) = **28.9%**, with no Section 301 duty on '
        'top (note 52(f)). A USMCA-qualifying mirror from Mexico pays nothing. A mirror for a heavy truck pays 3.9% + 25% (9903.74.08) from '
        'every country, Japan included.',
    },
]

ui['h1'] = f'HTS Chapter 70: {SHORT} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Glass Imports by Country — HTS Chapter 70 Trade Statistics (Bottles, Safety Glass, Mirrors, Fiberglass) | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 70 goods: {fmt_usd(total)} in {Y}. Who supplies glass bottles and jars, tempered and '
    'laminated glass, mirrors, glassware and fiberglass — China, Mexico, Germany, Canada, Vietnam, Malaysia — with values by product and year '
    'from UN Comtrade.',
    'keywords': [
        'hts chapter 70',
        'us glass imports by country',
        'glass imports from china',
        'glass container imports',
        'tempered glass imports vietnam malaysia',
        'fiberglass imports',
        'glassware imports',
        'glass tariffs',
    ],
}
ui['byYearPartners'] = ['China', 'Mexico']
ui['byYearCaption'] = f'U.S. imports of Chapter 70 goods each year, split into the two largest {Y} suppliers (China and Mexico) and everyone else.'
ui['valueBasis'] = 'CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ui['why'] = (
    f'U.S. imports of Chapter 70 goods were **{fmt_usd(total)} in {Y}**, {abs(pct(total, prior_total))}% less than the {fmt_usd(prior_total)} '
    f'of {PY} and below the {fmt_usd(year_tot[2022])} peak of 2022. **Glass bottles and jars (heading 7010)** were the largest group at '
    f'{fmt_usd(h7010)}, followed by **safety glass (7007)** at {fmt_usd(h7007)} — up from {fmt_usd(hy("7007", PY))} on tempered glass of '
    f'7007.19 — **fiberglass (7019)** at {fmt_usd(h7019)}, **glassware (7013)** at {fmt_usd(h7013)} and **mirrors (7009)** at '
    f'{fmt_usd(h7009)}.\n\n'
    f'**China** stayed the largest supplier but fell {abs(chg("China"))}% to {fmt_usd(cn)}, from {fmt_usd(imp("China", 2022))} in 2022; its '
    'biggest products are glassware, safety glass, bottles and mirrors. **Mexico** '
    f'({fmt_usd(mx)}) ships mostly bottles and jars, fiberglass and vehicle glass, largely duty-free under USMCA. **Vietnam** more than doubled to '
    f'{fmt_usd(vn)} (from {fmt_usd(imp("Viet Nam", 2020))} in 2020) and **Malaysia** to {fmt_usd(my)}, almost all of the growth in tempered '
    f'safety glass. **Germany** ({fmt_usd(de)}) leads in glass tubing and rods, **Canada** ({fmt_usd(ca)}) in fiberglass, and **India** '
    f'({fmt_usd(inn)}) and Taiwan ({fmt_usd(tw)}) in bottles, mirrors and fiberglass.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the float glass AD/CVD '
    'orders from April, the Section 301 tariffs from July 24 and the Canada Section 338 duties from August 22); they do not show what those '
    'changes did. Duty-collected figures are not available from an official source yet.'
)
ui['effectiveDuty']['note'] = 'Duty-collected figures aren’t available from an official source yet.'
ui['effectiveDuty']['dutyPaidUsd'] = None
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years 2020–{Y}. '
    '"Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

fc['keyTakeaways'] = [
    f'{sum(1 for r in LINES if r["dutiable"])} of the {N_LINES} Chapter 70 lines carry a base duty. Most glass pays Free to about 8%, but '
    'glassware is rated by value per piece and reaches 38% (28.5% for drinking glasses at $0.30 or less, 22.5% at $0.30–$3).',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% for Malaysia and India, +12.5% for Vietnam, Thailand and Türkiye, 10% in '
    'total for the EU and Taiwan, 12.5% for Japan and Korea.',
    'China pays +37.5% on most glass, bottles, mirrors and fiberglass (12.5% plus 25% List 3) and +20% on most glassware (List 4A); Chinese '
    'float glass adds antidumping (151.27%–181.52%) and countervailing (19.75%–113.34%) deposits.',
    'Laminated vehicle glass, truck and bus windshields and rear-view mirrors pay a 25% Section 232 vehicle-parts duty when they are vehicle '
    'parts — 15% in total from Japan, the EU, Korea and Taiwan.',
    'USMCA-qualifying goods from Mexico pay nothing. From Canada, glass bottles and jars (7010.90.50) and glassware over $5 (7013.99.90) pay a '
    '50% Section 338 duty even under USMCA.',
    'The IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge July 23, 2026. Vehicle glazing must meet FMVSS 205, door and '
    'shower glass the CPSC glazing standard, and food-contact glass the FDA adulteration rules.',
]

fc['faqs'] = [
    {
        'id': 'glass-tariffs',
        'question': 'Are there tariffs on glass imported into the U.S.?',
        'searchedAs': ['glass tariffs', 'tariffs on glass', 'us tariffs on glass', 'is there tariffs on glass'],
        'answer': 'Yes. Base rates run from Free (bottles and jars, LCD glass, glass beads, cullet) to about 8% for most flat glass, safety glass, '
        'mirrors and fiberglass, and up to 38% for cheap glassware. Since July 24, 2026 a Section 301 duty is added by country: 10% in total for '
        'the EU and Taiwan, 12.5% for Japan and Korea, +10% for Malaysia and India, +12.5% for Vietnam and Türkiye, +20% to +37.5% for China. '
        'USMCA-qualifying glass from Mexico or Canada pays nothing, except Canadian bottles, jars and glassware over $5 (50% Section 338).',
        'link': 'industry-areas',
    },
    {
        'id': 'china',
        'question': 'What are the tariffs on glass from China?',
        'searchedAs': ['glass tariffs from china', 'tariffs on glass from china', 'tariff on glass from china', 'glass import duty from china'],
        'answer': 'Chinese Chapter 70 goods pay the base rate plus 12.5% (2026 Section 301, 9903.05.31) plus 25% on List 3 lines (flat and safety '
        'glass, mirrors, bottles, lab glass, most fiberglass) or 7.5% on List 4A lines (most glassware): 37.5% on glass jars, 42.5% on tempered '
        'glass, 44% on large mirrors, 42.5% on drinking glasses worth $0.30–$3. Float glass also pays antidumping deposits of 151.27%–181.52% and '
        f'countervailing deposits of 19.75%–113.34%. China supplied {fmt_usd(cn)} in {Y}, {abs(chg("China"))}% less than in {PY}.',
        'link': 'industry-areas',
    },
    {
        'id': 'canada',
        'question': 'What are the tariffs on glass from Canada?',
        'searchedAs': ['glass tariffs canada', 'tariffs on glass from canada'],
        'answer': 'USMCA-qualifying Canadian glass pays no duty, with one exception: since August 22, 2026 glass bottles, jars and other '
        'containers (7010.90.50) and glassware valued over $5 each (7013.99.90) pay a 50% Section 338 duty (9903.03.14) even under USMCA. '
        'Non-qualifying Canadian goods pay the base rate plus 10% (9903.05.29), plus the 50% on those two lines. Canada supplied '
        f'{fmt_usd(ca)} of Chapter 70 goods in {Y}, mostly fiberglass and bottles.',
        'link': 'industry-areas',
    },
    {
        'id': 'auto-glass',
        'question': 'Are there tariffs on auto glass and windshields?',
        'searchedAs': ['auto glass tariffs', 'tariffs on auto glass', 'windshield tariff code'],
        'answer': 'Windshields are 7007.21.11 (4.9%); other laminated vehicle glass 7007.21.51 (4.9%); tempered side and rear glass 7007.11 '
        '(5.5%). Laminated vehicle glass (7007.21.51) that is a car or light-truck part pays a 25% Section 232 duty (15% in total from Japan, the '
        'EU, Korea and Taiwan; 10% from the UK), and windshields and laminated glass for trucks and buses pay 25% too; USMCA-qualifying parts are '
        'exempt. Car windshields and tempered glass pay the regular Section 301 duty instead. Framed windshields and windows with heating '
        'elements are classified with the vehicle (Chapter 70, note 1(d)–(e)).',
        'link': 'industry-areas',
    },
    {
        'id': 'float-glass',
        'question': 'Is there an antidumping duty on float glass?',
        'searchedAs': ['float glass antidumping', 'float glass antidumping china', 'float glass import duty', 'float glass tariff'],
        'answer': 'Yes. Since April 6, 2026 float glass from China pays antidumping deposits of 151.27% (named exporters) or 181.52% (China-wide) '
        'and countervailing deposits of 19.75% (Xinyi and all others) or 113.34%; Malaysian float glass pays countervailing deposits of 17.25%–'
        '101.99% (27.32% all others). The orders cover soda-lime float glass at least 2 mm thick and 0.37 m², including tempered, laminated and '
        'coated glass, insulating units and unframed or LED mirrors; vehicle glazing, patterned glass and solar glass are excluded. Regular '
        'duties (14.5¢–18.7¢/m² or 4.4%–5.6%, plus Section 301) apply on top.',
        'link': 'tariff-updates',
    },
    {
        'id': 'bottles',
        'question': 'What is the tariff code and duty for glass bottles and jars?',
        'searchedAs': [
            'glass bottle tariff code',
            'glass bottle tariff',
            'tariffs on glass bottles',
            'glass container tariff code',
            'glass jar tariff code',
            'hs code for glass bottle',
            'hs code for glass jar',
            'hs code for glass vial',
            'hts 7010.90',
        ],
        'answer': 'Bottles, jars and other containers for food, drinks and other goods are 7010.90.50 (Free), split by capacity and mouth size — '
        'for example 7010.90.50.15 for a 0.473–1 liter jar with a wide mouth. Vials and other pharmaceutical containers are 7010.90.05 and ampoules '
        '7010.10 (Free); perfume and cosmetic bottles 7010.90.20 (2.5%) or .30 (5.2%); glass lids and stoppers 7010.20. Add the extra duty by '
        'country: 37.5% from China, 10% from India or the EU, 50% from Canada even under USMCA.',
        'link': '',
    },
    {
        'id': 'glassware',
        'question': 'What is the HS code for drinking glasses and glassware?',
        'searchedAs': [
            'hs code for glassware',
            'hs code for drinking glasses',
            'drinking glassware hs code',
            'hs code for wine glass',
            'hs code for glass cup',
            'hts 7013',
            'hs code 7013.99',
            'hs code 7013.37',
            'hs code 7013.49',
        ],
        'answer': 'Glassware is heading 7013. Stemware such as wine glasses is 7013.22 (lead crystal) or 7013.28; other drinking glasses and cups '
        '7013.33 or 7013.37; table and kitchen glassware 7013.41–7013.49; vases, candle holders and other glassware 7013.91–7013.99. Rates '
        'follow value per piece: a non-crystal drinking glass pays 28.5% at $0.30 or less, 22.5% at $0.30–$3, 7.5% or 11.3% at $3–$5 and 5% '
        'above $5; tempered glassware 12.5%.',
        'link': '',
    },
    {
        'id': 'mirror',
        'question': 'What is the HS code and tariff for mirrors?',
        'searchedAs': ['hs code for mirror', 'hs code for mirror glass', 'hs code for mirror rear view', 'tariffs on mirrors'],
        'answer': 'Glass mirrors are heading 7009: rear-view mirrors for vehicles 7009.10 (3.9%, plus Section 232 when they are car or truck '
        'parts); other mirrors 7009.91 (unframed) or 7009.92 (framed) — 7.8% up to 929 cm² of reflecting area, 6.5% above, with separate '
        'numbers for LED and over-the-door mirrors. Chinese mirrors pay 37.5% extra, and unframed and LED mirrors of Chinese or Malaysian float '
        'glass also pay AD/CVD deposits.',
        'link': '',
    },
    {
        'id': 'tempered',
        'question': 'What is the HS code for tempered glass?',
        'searchedAs': [
            'hs code for tempered glass',
            'tempered glass tariff code',
            'hs code for toughened glass',
            'hs code for tempered glass screen protector',
            'hs code for tempered glass door',
        ],
        'answer': 'Tempered (toughened) safety glass is 7007.11 (5.5%) when sized for vehicles and 7007.19 (5%) otherwise — including shower '
        'and door glass, tempered screen protectors and solar-panel cover glass. Laminated glass is 7007.21 or 7007.29 (4.9%). Tempered '
        'glassware such as bowls is 7013 ("pressed and toughened", 12.5%). From China, 7007.19 pays 42.5% plus the float glass AD/CVD deposits if '
        'in scope; matching screen protectors and solar cover glass are excluded from List 3 through November 9, 2026.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'fiberglass',
        'question': 'What is the HS code for fiberglass?',
        'searchedAs': [
            'hs code for fiberglass',
            'hs code for fiberglass insulation',
            'hs code for fiberglass mesh',
            'hs code for fiberglass cloth',
            'fiberglass tariffs',
            'hs code for fiberglass door',
        ],
        'answer': 'Glass fibers are heading 7019: chopped strands 7019.11 (4.9%), rovings 7019.12 (4.8%), yarn 7019.13 (4.2%–7%), mats 7019.14–'
        '7019.15 (4.3%), woven fabric and cloth 7019.61–7019.69 (6%–7.3%), glass-wool insulation 7019.80.10 (4.9%), other articles such as '
        'mesh 7019.90. Chinese fiberglass pays 37.5% extra. Fiberglass door panels are mainly 3925.20 and, from China, under AD/CVD orders even '
        'if entered under 7019.90.51.50.',
        'link': '',
    },
    {
        'id': 'beads',
        'question': 'What is the HS code for glass beads?',
        'searchedAs': ['glass beads hs code', 'seed beads hs code', 'crystal beads hs code', 'reflective glass beads hs code', 'glass beads import duty'],
        'answer': 'Loose glass beads, seed beads and crystal beads are 7018.10.50 (Free) and imitation precious stones 7018.10.20 (Free); '
        'imitation pearls 7018.10.10 (4%); glass microspheres up to 1 mm, such as reflective road beads, 7018.20 (5%). Beads strung into '
        'jewelry are imitation jewelry of Chapter 71. Chinese beads pay 37.5%.',
        'link': '',
    },
    {
        'id': 'solar-glass',
        'question': 'What duty applies to solar glass?',
        'searchedAs': ['solar glass import duty'],
        'answer': 'Tempered cover glass for solar panels is 7007.19 (5%) plus the extra duty by country; untempered rolled patterned glass is 7003. '
        'Patterned solar glass and coated or clear-back solar glass are excluded from the float glass AD/CVD orders, and Chinese tempered solar '
        'cover glass coated with silicon oxide (under 2.5 m²) is excluded from List 3 through November 9, 2026, so it pays 17.5%.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'eyeglasses',
        'question': 'Are eyeglasses covered by Chapter 70?',
        'searchedAs': ['tariffs on glasses from china', 'tariffs on zenni glasses', 'hs code for glasses'],
        'answer': 'No. Finished eyeglasses, sunglasses and lenses are in Chapter 90. Chapter 70 covers only glass for corrective spectacles '
        'that is not optically worked (7015.10, Free) and watch glasses (7015.90, Free); from China these pay 20% (12.5% plus 7.5% List 4A).',
        'link': '',
    },
    {
        'id': 'chapter-70',
        'question': 'What does HTS Chapter 70 cover?',
        'searchedAs': ['hts chapter 70', 'htsus chapter 70', 'chapter 70 hts', 'hts code chapter 70'],
        'answer': f'HTS Chapter 70 (Glass and Glassware) has {N_LINES} tariff lines in 19 headings: cullet and glass in the mass (7001), rods and '
        'tubes (7002), cast, drawn and float glass (7003–7005), worked glass (7006), safety glass (7007), insulating units (7008), mirrors '
        '(7009), bottles and jars (7010), lamp envelopes (7011), glassware (7013), optical and signal glass (7014–7015), glass blocks and mosaics '
        '(7016), lab glass (7017), beads (7018), fiberglass (7019) and other articles (7020). Ceramics are Chapter 69, imitation jewelry Chapter 71.',
        'link': '',
    },
]

# Generator quirk: Myanmar has no ISO mapping.
ia['assumptions'].append('Trade partners with no ISO country code in the trade data (Myanmar) are counted in "Any other country".')
for e in tu['inEffect']:
    if e['country'] == 'Russia':
        e['now'] = '+12.5%; 35% in place of column 2 on 7010.90.50, + 12.5%'
    elif e['country'].startswith('Other Section 301'):
        e['now'] = '+10% or +12.5% (12.5% in total for Switzerland)'
