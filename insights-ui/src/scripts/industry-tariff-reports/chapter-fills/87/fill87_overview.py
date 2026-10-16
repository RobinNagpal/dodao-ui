# Overview page of Chapter 87 — exec'd from fill87.py (shares its globals).

ov['seo']['title'] = 'HTS Chapter 87 Tariffs 2026: Car, Auto Parts, Truck, EV & Bicycle Import Duty Rates by Country | KoalaGains'
ov['seo']['shortDescription'] = (
    f'Searchable 2026 U.S. tariff table for all {N_LINES} HTS Chapter 87 lines — cars, SUVs, EVs, pickups, heavy trucks, buses, auto '
    'parts, motorcycles, e-bikes, bicycles and trailers. Base rates Free to 25%, the 25% Section 232 auto, parts and truck duties, the '
    '15% EU, Japan and Korea deal rates, USMCA rules and the extra duty by country.'
)
ov['seo']['keywords'] = [
    'hts chapter 87',
    'htsus chapter 87',
    'u.s. auto tariffs',
    '25% automobile import tariff',
    'automobile import duties',
    'car import tariffs by country',
    'auto tariffs section 232',
    'auto parts tariffs hts list',
    'chinese ev tariffs us',
    'hs code 8703',
    'hs code 8708',
    'chicken tax',
]

top5 = [c for c in TOP[:6] if c not in ('Other',)][:5]
ov['intro'] = (
    f'Chapter 87 covers road vehicles and their parts: tractors, buses, cars and SUVs, trucks, special-purpose vehicles, chassis and '
    f'bodies, auto parts, motorcycles and e-bikes, bicycles, wheelchairs, strollers and trailers — {N_LINES} tariff lines. Base rates '
    'are low (Free to 25%: cars 2.5%, auto parts 2.5% or Free, pickups and most trucks 25%), but since 2025 almost every vehicle and '
    'most parts also pay a **Section 232** duty: 25% on passenger vehicles and light trucks (from April 3, 2025), 25% on listed auto '
    'parts (from May 3, 2025), 25% on medium- and heavy-duty trucks and 10% on buses (from November 1, 2025).\n\n'
    'Trade deals cap cars and listed parts at **15% in total** for the EU, Japan and South Korea (and parts from Taiwan), and UK cars '
    'pay **10%** inside a 100,000-vehicle annual quota. **USMCA** cars and trucks from Mexico and Canada pay the 25% only on the '
    'value of their non-U.S. content once Commerce approves it; USMCA parts pay nothing. Chinese electric vehicles pay **127.5%**. '
    'Goods outside the Section 232 actions — motorcycles, bicycles, e-bikes, wheelchairs, strollers, trailers and parts that are not '
    'vehicle parts — pay the 2026 Section 301 duty for their country instead.\n\n'
    f'In {Y} the United States imported **{money(TOT)}** of Chapter 87 goods, led by '
    + ', '.join(f'{("South Korea" if c == "Rep. of Korea" else c)} ({money(imp(c))})' for c in top5)
    + f'. Cars (8703) were {money(H.get("8703", 0))} and auto parts (8708) {money(H.get("8708", 0))}. Search the table by product or '
    'code: each row shows the base rate and the extra duties that can apply.'
)

m_metals = re.search(r'Section 232 \(steel, aluminum, copper\): (\d+)', next(s['note'] for s in ov['stats'] if s.get('note')))
N_METALS = int(m_metals.group(1)) if m_metals else 0
for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            f'Section 232 cars and light trucks: {N_AUTOS}; auto parts: {N_PARTS} (when they are car or light-truck parts); trucks: '
            f'{N_MHDV}; buses: {N_BUS}; truck and bus parts: {N_MHDVP}; metals: {N_METALS}. 2026 Section 301 and Brazil: all {N_LINES} '
            f'(lifted for Section 232 goods). China lists: {N_L1 + N_L2 + N_L3 + N_L4A}; China 100% EV duty: {N_EV}. Canada Section 338: '
            f'{N_CA338} (also on USMCA goods).'
        )

ov['workedExamples'] = [
    {
        'title': 'A new electric car from China: 127.5%',
        'line': '8703.80.00.20',
        'body': (
            'Base rate **2.5%**. China pays **+100%** under the 2024 Section 301 increase on electric vehicles (9903.91.03, U.S. note '
            '31(d)) and **+25%** Section 232 on automobiles (9903.94.01); note 33(a) adds any other Chapter 99 duty on top. The 12.5% 2026 '
            'Section 301 duty on China does not apply to Section 232 vehicles (note 52(f)(2)). Total **127.5%**: on a $40,000 car, '
            '**$51,000** in duty. The battery pack shipped on its own is classified in Chapter 85.'
        ),
    },
    {
        'title': 'A gasoline car from Japan, Germany or South Korea: 15%',
        'line': '8703.23.01.60',
        'body': (
            'The 2.5% base rate is below 15%, so the deal headings set the total at **15%** (9903.94.41 Japan, 9903.94.51 EU, '
            '9903.94.61 South Korea; U.S. notes 33(k), (n), (s) and (m)). No 2026 Section 301 floor and no Section 232 metals duty are '
            'added (notes 52(f)(2), 33(k)(1)). On a $30,000 car: **$4,500**. For Korea a KORUS (Free) claim still totals 15%.'
        ),
    },
    {
        'title': 'A USMCA car from Mexico: 25% on the non-U.S. content',
        'line': '8703.23.01.60',
        'body': (
            'With a USMCA claim (SPI "S") the 2.5% base is Free and the Section 232 duty is **25% of the non-U.S. content** (9903.94.03, '
            'note 33(d)). U.S. content is the value of parts wholly obtained, produced entirely or substantially transformed in the '
            'United States, and only counts once the Secretary of Commerce approves the importer\'s documentation; the U.S. content is '
            'entered on a second line under 9903.94.02 at 0% (CSMS # 65649652). A $30,000 car with $12,000 of approved U.S. content pays '
            '25% × $18,000 = **$4,500** (15% of the value). With no approval: 25% of $30,000 = $7,500; with no USMCA claim: 27.5%.'
        ),
    },
    {
        'title': 'A UK car inside and outside the quota: 10% or 27.5%',
        'line': '8703.23.01.60',
        'body': (
            'Inside the UK tariff-rate quota (100,000 passenger vehicles a year, at most 25,000 a quarter plus carry-forward) the 2.5% '
            'base plus **7.5%** (9903.94.31, note 33(i)) makes **10%**: $3,000 on a $30,000 car. Once CBP reports the quota filled, the '
            'car pays 2.5% + 25% (9903.94.01) = 27.5%. UK pickups and other light trucks have no quota.'
        ),
    },
    {
        'title': 'A pickup truck: the 25% base rate decides it',
        'line': '8704.31.01.20',
        'body': (
            'Light trucks up to 5 t G.V.W. pay a **25%** base rate (the "chicken tax"; KORUS keeps 25% for Korea). From Japan, the EU or '
            'Korea the deal rate is a 15% floor, so the total stays **25%** (9903.94.40, 9903.94.50, 9903.94.60). From Thailand or '
            'another country without a deal: 25% + 25% Section 232 = **50%** — $15,000 on a $30,000 pickup. A USMCA pickup from Mexico '
            'pays 25% only on its non-U.S. content.'
        ),
    },
    {
        'title': 'An axle for cars from Mexico: 27.5% or Free',
        'line': '8708.50.51.10',
        'body': (
            'Drive axles for vehicles of 8703 are on the note 33(g) parts list. Without a USMCA claim: 2.5% + **25%** (9903.94.05) = '
            '27.5%, $2,750 on $10,000 (no 10% Mexico Section 301 duty, note 52(f)(3)). With a USMCA claim the part enters under '
            '9903.94.06: **Free**. If the same axle is for a tractor, not a car or light truck, it is not an auto part: the base rate plus '
            'the Section 301 duty for the country applies instead.'
        ),
    },
    {
        'title': 'A heavy road tractor from Mexico under USMCA',
        'line': '8701.21.00.45',
        'body': (
            'Road tractors for semi-trailers are medium- and heavy-duty vehicles (note 38(b)). With USMCA, the 4% base is Free and the '
            'duty is 25% of the non-U.S. content (9903.74.03, note 38(d); CSMS # 68559236): $150,000 with $50,000 of approved U.S. content '
            'pays **$25,000**. Without USMCA: 4% + 25% (9903.74.01) = 29%, $43,500. Buses get no content rule: +10% on the full value '
            '(9903.74.02).'
        ),
    },
    {
        'title': 'A bicycle and an e-bike from China',
        'line': '8712.00.48.00',
        'body': (
            'A standard adult bicycle pays **11%** base + 25% China Section 301 (List 3, 9903.88.03) + 12.5% 2026 Section 301 (9903.05.31) = '
            '**48.5%**. An e-bike with a motor up to 250 W (8711.60.00.50) is Free at base and pays 25% (9903.88.02) + 12.5% = **37.5%**. '
            'From Vietnam the same bicycle pays 11% + 12.5% = 23.5%.'
        ),
    },
]

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 87 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — '
    'before the 2026 Section 301, Section 338 and truck-duty changes took full effect.'
)

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover railway or tramway rolling stock designed solely for running on rails.\n\n'
    '**Note 2.** For the purposes of this chapter, "tractors" means vehicles constructed essentially for hauling or pushing another '
    'vehicle, appliance or load, whether or not they contain subsidiary provision for the transport, in connection with the main use of '
    'the tractor, of tools, seeds, fertilizers or other goods. Machines and working tools designed for fitting to tractors of heading '
    '8701 as interchangeable equipment remain classified in their respective headings even if presented with the tractor, and whether '
    'or not mounted on it.\n\n'
    '**Note 3.** Motor chassis fitted with cabs fall in headings 8702 to 8704, and not in heading 8706.\n\n'
    '**Note 4.** Heading 8712 includes all children\'s bicycles. Other children\'s cycles fall in heading 9503.\n\n'
    '**Subheading note 1.** Subheading 8708.22.00 covers: (a) front windscreens (windshields), rear windows and other windows, framed; '
    'and (b) front windscreens (windshields), rear windows and other windows, whether or not framed, incorporating heating devices or '
    'other electrical or electronic devices, when suitable for use solely or principally with the motor vehicles of headings 8701 to '
    '8705.'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** Road tractors, trailers and semi-trailers remain separately classified in headings 8701 and 8716, respectively, even when '
    'entered together.\n\n'
    '**2.** For the purposes of classifying bicycles under the provisions therefor in heading 8712, the diameter of each wheel is the '
    'diameter measured to the outer circumference of the tire which is mounted thereon or, if none is mounted thereon, of the usual tire '
    'for such wheel.\n\n'
    '**Statistical note 1.** For the purposes of statistical reporting numbers in headings 8701 and 8703, report as "new" only those '
    'motor vehicles that have been produced or assembled but have not been sold to any person or entity other than a manufacturer, '
    'distributor or dealer. Report as "used" only those motor vehicles the equitable or legal title to which has been transferred via a '
    'first sale by a manufacturer, distributor or dealer to an ultimate purchaser.'
)
