# Tariff engineering page for Chapter 64 — exec'd from fill64.py (shares its globals).
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 64: {SHORT} — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Shoes into the U.S.: Footwear Invoice Rules, Marking, Exotic Leather & Legal Ways to Lower Duty (HTS Ch. 64) | '
    'KoalaGains',
    'shortDescription': 'What each HTS Chapter 64 footwear line needs at U.S. entry — the 19 CFR 141.89 footwear invoice details, '
    'country-of-origin marking, FWS and CITES rules for python, ostrich or alligator boots, CPSC rules for children\'s shoes — and the legal '
    'ways to pay less: upper and sole material, foxing, origin, USMCA, AGOA, CAFTA-DR, first sale, drawback, FTZ and rulings.',
    'keywords': [
        'footwear tariff engineering',
        'footwear classification upper material',
        'foxing-like band footwear',
        'external surface area of the upper',
        'footwear invoice requirements 141.89',
        'country of origin marking shoes',
        'first sale footwear',
        'exotic leather boots import',
    ],
}
te['intro'] = (
    'Footwear needs no import license, but it does need **more paperwork than most goods**: CBP requires every footwear invoice (headings '
    '6401–6405) to state the style number, the share of the **upper\'s external surface** that is leather, rubber or plastics, or textile, '
    'the outer sole\'s material, and answers on construction — waterproofing, foxing, metal toe-caps, value per pair — because those facts '
    'decide the line. Every shoe must be **marked with its country of origin**. Boots and shoes of **exotic leather** (python, alligator, '
    'ostrich, stingray) are wildlife products that need Fish and Wildlife Service clearance, and **children\'s shoes** must meet CPSC lead and '
    'certification rules.\n\n'
    'On cost, the schedule leaves real room: the **upper and sole materials, the foxing and the value per pair** decide a base rate between '
    'Free and 48%, the **country of origin** decides the extra duty (+10% Indonesia, +12.5% Vietnam, up to +20% China, +40% more for Japanese '
    'leather shoes), and USMCA, AGOA, CAFTA-DR, first-sale valuation, drawback and foreign-trade zones lower the bill further. Each lever '
    'depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {
        'id': 'materials',
        'title': 'Know what decides the line: the upper and the outer sole',
        'saves': 'The gap between material rates: a women\'s leather shoe pays 10% (6403.99.90), the same design with a textile upper 20% over $12 '
        'a pair (6404.11.90) or 90¢/pr. + 20% for $6.50–$12, and with a rubber or plastic upper 20% (6402.99.90); a textile-upper sneaker whose '
        'leather overlays and reinforcements cover over 50% of the upper 10.5% (6404.11.20)',
        'appliesTo': 'Headings 6402, 6403 and 6404 — sneakers, casual and dress shoes, boots',
        'document': 'A specification sheet with the percentage of the upper\'s external surface area by material and the outer sole\'s material in '
        'contact with the ground — the same figures 19 CFR 141.89 requires on the invoice.',
        'caveat': 'Accessories and reinforcements (ankle patches, eyelet stays, edging, ornaments) are not counted (note 4(a)), and a textile with a '
        'visible rubber or plastic layer counts as rubber or plastics (note 3(a)). CBP measures the external surface itself; the shoe must '
        'really be built the way it is declared.',
        'citations': [
            {'label': 'HTSUS Chapter 64, notes 3–4', 'url': CH64_PDF},
            {'label': 'CBP Informed Compliance Publication: Footwear', 'url': CBP_ICP},
            {'label': '19 CFR 141.89 (footwear invoice data)', 'url': ecfr(19, '141.89')},
        ],
    },
    {
        'id': 'construction',
        'title': 'Foxing, textile outer soles and the "over 90% rubber" lines',
        'saves': 'Shoes whose upper is over 90% rubber or plastic and that have no foxing or foxing-like band pay 6% (6402.91.40, 6402.99.31) '
        'instead of 20%–48% or 90¢/pr. + 20%–37.5%. Textile shoes valued up to $12 a pair whose outer sole touches the ground mostly with a '
        'durable textile pay 7.5%–12.5% (for example 6404.19.37, .47, .57, .77, .87) instead of 37.5%–48% or compound rates.',
        'appliesTo': 'Rubber and plastic footwear (6402) and textile-upper footwear with rubber or plastic soles (6404.11, 6404.19)',
        'document': 'Drawings and samples showing how far any band at the sole overlaps the upper and how much of the perimeter it encircles, and '
        'the ground-contact area of the outer sole by material.',
        'caveat': 'CBP treats a band molded or applied at the sole that overlaps the upper by about 1/4 inch (adult sizes) and encircles 60% or '
        'more of the perimeter as foxing-like; 41%–59% depends on the shoe, and 40% or less is not. Textile on the sole that lacks the '
        'durability and strength of a real outer sole is ignored (additional U.S. note 5). Over $12 a pair, most textile shoes pay 9% or 20% '
        'whatever the sole.',
        'citations': [
            {'label': 'HTSUS 6402.91.40, 6402.99.31, 6404.19; additional U.S. note 5', 'url': CH64_PDF},
            {'label': 'CBP Informed Compliance Publication: Footwear (foxing-like bands)', 'url': CBP_ICP},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and where a shoe gets it',
        'saves': 'The difference between country rates: +10% for Indonesia, Cambodia or India, +12.5% for Vietnam or Thailand, 10% in total for the '
        'EU, +20% for China on List 4A lines, +37.5% for Brazil, +40% more for Japanese leather shoes',
        'appliesTo': 'All lines; the gap is widest on leather shoes from Japan or Brazil and sneakers from China',
        'document': 'Production records showing where the shoe was last substantially transformed — typically where the upper is lasted and '
        'attached to the outer sole; for goods of Canada or Mexico, the part 102 tariff-shift rules.',
        'caveat': 'Only cutting, packing, labeling or adding trim in a third country does not move the origin. The Section 301, 1986 Japan and '
        'Section 338 duties follow the country of origin, and CBP can ask for proof.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': '19 CFR 102.11 (origin of goods of Canada and Mexico)', 'url': ecfr(19, '102.11')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 3, 20, 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on footwear from Mexico or Canada',
        'saves': 'The base rate (up to 48%) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, every line except 6403.91.90 (women\'s leather ankle boots), which keeps the 50% '
        'Section 338 duty',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on 6403.91.90 (U.S. note 51(a)). The shoe must meet the Chapter 64 rule of '
        'origin in General Note 11: a change from any heading outside 6401–6405 except formed uppers of 6406.10, plus at least 55% regional '
        'value content (net cost method). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN_PDF},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Claim AGOA, CAFTA-DR, CBTPA or another FTA',
        'saves': 'The base rate — up to 48% or 90¢/pr. + 37.5%',
        'appliesTo': 'Dutiable lines whose Special column lists the program: AGOA (D, sub-Saharan Africa, to December 31, 2026), CAFTA-DR (P), '
        'CBTPA (R, Haiti and other Caribbean beneficiaries, through September 30, 2030), Jordan (JO), Korea (KR) and the other FTA partners',
        'document': 'The origin proof each program requires (a certification or declaration of origin, or the AGOA/CBTPA documentation) and '
        'records to back it up.',
        'caveat': 'An FTA removes the base rate but not the 2026 Section 301 duty of a listed country (U.S. note 52(a)) — CAFTA-DR shoes from '
        'the Dominican Republic still pay 12.5%, from Guatemala, El Salvador or Honduras 10%. AGOA footwear from a beneficiary outside the 60 (for '
        'example Kenya) is duty-free; from South Africa, Nigeria or Angola it still pays 12.5%. GSP (A) never covered most '
        'footwear and has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes 3(c) and 8–34', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a), (i)', 'url': CH99_PDF},
            {'label': '19 CFR 10.178a (AGOA, import-sensitive articles)', 'url': ecfr(19, '10.178a')},
            {'label': '19 U.S.C. 2466a (AGOA)', 'url': USC_2466A},
            {'label': '19 U.S.C. 2703 (CBTPA, through September 30, 2030)', 'url': USC_2703},
            {'label': '19 U.S.C. 2463(b)(1)(E) (footwear outside GSP)', 'url': USC_2463},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate and the 10%–52.5% extra duties included — when the factory '
        'price to a trading company or brand owner is lower than the price you pay. The value per pair can also decide the line, so the first-'
        'sale price may move a shoe into a different value bracket.',
        'appliesTo': 'All lines bought through a trading company, agent-buyer or brand owner rather than straight from the factory',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, '
        'contracts and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry. The '
        'per-pair part of a compound rate does not change with value.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision: post-surgery footwear, U.S. parts, returned goods',
        'saves': 'Made-to-measure single shoes for supporting the foot after an illness, operation or injury are Free (9817.64.01) and, as a '
        'Chapter 98 entry, skip the 2026 Section 301 duty. Shoes assembled abroad from U.S.-made components (for example uppers cut in the U.S.) '
        'pay duty only on the value added abroad (9802.00.80). U.S.-made shoes returned unchanged pay nothing (9801.00.10).',
        'appliesTo': 'Medical footwear presented singly; footwear assembled from U.S. components; American footwear coming back',
        'document': 'For 9817.64.01, evidence the shoe is made to measure and presented singly; for 9802.00.80, the assembler\'s declaration and '
        'the cost of the U.S. components (19 CFR 10.24); for 9801.00.10, proof of U.S. origin and export.',
        'caveat': 'Under 9802.00.80 the Section 301 duty still applies to the value of the assembly abroad (U.S. note 52(a)). Orthopedic '
        'appliances of heading 9021 are not Chapter 64 goods.',
        'provisions': [
            {
                'code': '9817.64.01',
                'rate': 'Free',
                'text': 'Footwear, other than goods of heading 9021, for supporting or holding the foot after an illness, operation or injury, made '
                'to measure and presented singly, designed to fit either foot',
            },
            {'code': '9802.00.80', 'rate': 'Duty on full value less U.S. components', 'text': 'Articles assembled abroad from fabricated U.S. components'},
            {'code': '9801.00.10', 'rate': 'Free', 'text': 'Products of the United States returned without having been advanced in value or improved'},
        ],
        'citations': [
            {'label': 'HTSUS Chapter 98, 9817.64.01, 9802.00.80, 9801.00.10', 'url': CH98_PDF},
            {'label': '19 CFR 10.14 (U.S. components)', 'url': ecfr(19, '10.14')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on shoes you export or destroy',
        'saves': 'Up to 99% of the duties paid, when the imported footwear is exported (for example to Canadian or Latin American stores) or '
        'destroyed under CBP supervision',
        'appliesTo': 'Any line that paid a duty',
        'document': 'A drawback claim to CBP with import and export (or destruction) records that tie the goods together.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty is eligible before relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Hold, sort or relabel shoes in a foreign-trade zone',
        'saves': 'No duty on footwear re-exported from the zone, and duty deferred until shoes leave it for the U.S. market',
        'appliesTo': 'Any line — useful for distribution centers that also ship to Canada and Mexico',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Shoes entered for U.S. consumption from a zone pay the duties in force on the entry date.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ieepa-refund',
        'title': 'Claim back IEEPA duties paid in 2025–2026',
        'saves': 'The IEEPA duties paid on footwear entered between February 2025 and February 23, 2026 — for example 20% on Vietnamese or 19% '
        'on Indonesian shoes — with interest',
        'appliesTo': 'Past entries of any line that paid an IEEPA duty (9903.01.xx, 9903.02.xx)',
        'document': 'A CAPE Declaration filed in the ACE Portal by the importer of record or its customs broker, listing the entries, plus ACH '
        'refund details on file.',
        'caveat': 'Phase 1 covers unliquidated entries and entries within the voluntary reliquidation period; other entries may need a protest or '
        'court action. It does not refund Section 301, List 4A, the 1986 Japan duty or Section 338.',
        'citations': [{'label': 'CBP: IEEPA Duty Refunds (CAPE)', 'url': CBP_REFUNDS}],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate and the extra duty: leather versus textile upper, foxing or not, athletic or not, '
        'house slipper or not, work footwear, protective active footwear; and whether a Japanese shoe falls in the 1986 exceptions',
        'appliesTo': 'Any line where the material, construction or use decides the line',
        'document': 'A ruling request to CBP describing the shoe, with a sample and the external surface and sole percentages.',
        'caveat': 'Rulings apply to the shoe described; a changed design or material may need a new one.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': 'HTSUS Chapter 64 notes', 'url': CH64_PDF},
        ],
    },
]

te['rules'] = [
    {
        'id': 'cbp-invoice',
        'agency': 'CBP',
        'title': 'Footwear invoices (headings 6401–6405) must give the manufacturer\'s and importer\'s style numbers, the percentage of the '
        'upper\'s external surface that is leather, composition leather, rubber or plastics, textile or other material, the same for the outer '
        'sole, and the answers to CBP\'s construction questions (waterproof, protective metal toe-cap, foxing, value per pair and others)',
        'citations': [{'label': '19 CFR 141.89', 'url': ecfr(19, '141.89')}],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible, indelible and permanent enough to reach the ultimate purchaser — on each shoe '
        '(usually a label or stamp inside), or on the container where an exception applies; a U.S. place name or brand location on the shoe '
        'requires the origin marking near it',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.41', 'url': ecfr(19, '134.41')},
            {'label': '19 CFR 134.46', 'url': ecfr(19, '134.46')},
        ],
    },
    {
        'id': 'cbp-origin-nafta',
        'agency': 'CBP',
        'title': 'Goods of Canada and Mexico take their origin for marking and Section 301/338 purposes from the 19 CFR part 102 tariff-shift '
        'rules',
        'citations': [{'label': '19 CFR 102.11', 'url': ecfr(19, '102.11')}],
    },
    {
        'id': 'ftc-leather',
        'agency': 'FTC',
        'title': 'Leather Guides: footwear may not be called "leather" unless made of leather in the parts described; imitation, bonded, split or '
        'embossed leather must be disclosed',
        'citations': [
            {'label': '16 CFR 24.0', 'url': ecfr(16, '24.0')},
            {'label': '16 CFR 24.2', 'url': ecfr(16, '24.2')},
        ],
    },
    {
        'id': 'fws-wildlife',
        'agency': 'U.S. Fish & Wildlife Service',
        'title': 'Footwear of exotic leather — python, alligator, crocodile, lizard, ostrich, stingray — is a wildlife product: it must enter at a '
        'designated port, be declared on Form 3-177 and cleared by FWS before CBP releases it; CITES species need CITES documents. Cattle, '
        'goat, sheep and pig leather are exempt',
        'citations': [
            {'label': '50 CFR 14.4 (domesticated animals)', 'url': ecfr(50, '14.4')},
            {'label': '50 CFR 14.52 (clearance)', 'url': ecfr(50, '14.52')},
            {'label': '50 CFR 14.61 (Form 3-177)', 'url': ecfr(50, '14.61')},
            {'label': '50 CFR 23.20 (CITES documents)', 'url': ecfr(50, '23.20')},
        ],
    },
    {
        'id': 'cpsc-children',
        'agency': 'CPSC',
        'title': 'Shoes designed or intended primarily for children 12 or younger are children\'s products: lead limits for the materials and '
        'coatings, third-party testing unless CPSC has determined a material lead-free, and a Children\'s Product Certificate',
        'citations': [
            {'label': '16 CFR part 1110 (certificates)', 'url': ecfr_part(16, 1110)},
            {'label': '16 CFR part 1107 (testing)', 'url': ecfr_part(16, 1107)},
            {'label': '16 CFR 1500.91 (lead determinations)', 'url': ecfr(16, '1500.91')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country, China List 4A (9903.88.15), Japan '
        '1986 (9903.41.10), Brazil (9903.05.01), Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 3, 20, 30, 50–52', 'url': CH99_PDF},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4261d04'},
        ],
    },
]

GROUP_RULES = {
    '6401': ['cbp-invoice', 'cbp-marking', 'cpsc-children', 'cbp-ch99'],
    '6402': ['cbp-invoice', 'cbp-marking', 'cpsc-children', 'cbp-ch99'],
    '6403': ['cbp-invoice', 'cbp-marking', 'ftc-leather', 'fws-wildlife', 'cpsc-children', 'cbp-ch99'],
    '6404': ['cbp-invoice', 'cbp-marking', 'ftc-leather', 'cpsc-children', 'cbp-ch99'],
    '6405': ['cbp-invoice', 'cbp-marking', 'ftc-leather', 'cpsc-children', 'cbp-ch99'],
    '6406': ['cbp-marking', 'ftc-leather', 'fws-wildlife', 'cbp-ch99'],
}
GROUP_NOTES = {
    '6401': 'Waterproof means the upper is neither stitched nor riveted to the sole. Boots almost entirely of PVC pay 4.6%; most others 37.5%.',
    '6402': 'Value per pair and construction decide the rate: zoris Free, molded sandals 3%, over-90%-rubber uppers without foxing 6%, others up '
    'to 48%.',
    '6403': 'Exotic-leather boots and shoes need FWS clearance. From Japan, these lines also pay the 1986 40% duty unless the shoe is an excepted '
    'slip-on or sports shoe; from Canada, 6403.91.90 pays the 50% Section 338 duty even under USMCA.',
    '6404': 'The 141.89 invoice data decides between the athletic (6404.11), textile-sole and "other" lines. 6404.20 shoes with leather soles '
    'and partly-leather uppers pay the 1986 duty from Japan.',
    '6405': 'Leather-upper footwear on soles of wood or other materials (6405.10) is covered by the FTC Leather Guides.',
    '6406': 'Parts are not "footwear", so the 141.89 footwear invoice questions and the Japan footwear duty do not apply; formed textile uppers '
    'carry compound rates like finished shoes.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

rows_by_hts = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}
for ln in te['lines']:
    sub = ln['hts'][:10]
    h = sub[:4]
    row = rows_by_hts[ln['hts']]
    gen = row['effectiveGeneral']
    dutiable = bool(gen and gen != 'Free')
    rules = ['cbp-invoice'] if h != '6406' else []
    rules.append('cbp-marking')
    if h == '6403' or sub.startswith('6405.10') or sub.startswith('6404.20') or sub in ('6406.10.05', '6406.10.10', '6406.10.65', '6406.90.60'):
        rules.append('ftc-leather')
    if h == '6403' or sub in ('6406.10.05', '6406.10.10', '6406.10.65', '6406.90.60'):
        rules.append('fws-wildlife')
    if h != '6406':
        rules.append('cpsc-children')
    rules.append('cbp-ch99')
    ln['ruleIds'] = rules
    levers = []
    if h in ('6402', '6403', '6404') and dutiable:
        levers.append('materials')
    if (sub.startswith('6402.9') or sub.startswith('6404.1')) and dutiable:
        levers.append('construction')
    levers += ['origin', 'usmca']
    if dutiable:
        levers.append('fta')
    levers += ['first-sale', 'ch98', 'drawback', 'ftz', 'ieepa-refund', 'ruling']
    ln['leverIds'] = levers

te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Which line a shoe falls in '
    'depends on measured facts (external surface area, sole contact, foxing, value per pair), whether a leather comes from a protected species '
    'depends on the animal, and the extra duties change by Federal Register notice and CBP guidance; confirm the current headings before each '
    'shipment.'
)
