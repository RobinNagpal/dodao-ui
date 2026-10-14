# Tariff engineering page (exec'd from fill71.py).
te = d['tariffEngineering']
te['h1'] = f'HTS Chapter 71: {SHORT} — Import Rules & Ways to Lower Duty'
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'

USC_294 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap8-sec294.htm'
USC_297 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap8-sec297.htm'
USC_1278A = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap30-sec1278a.htm'
USC_1313 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1313.htm'
USC_3903 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap25-sec3903.htm'
R_N351466 = 'https://rulings.cbp.gov/ruling/N351466'
R_N357226 = 'https://rulings.cbp.gov/ruling/N357226'
R_N347575 = 'https://rulings.cbp.gov/ruling/N347575'
R_H307425 = 'https://rulings.cbp.gov/ruling/H307425'

te['levers'] = [
    {
        'id': 'form',
        'title': 'Classify precious metal by its form — bullion, bar or "other"',
        'saves': 'Up to 4.1% of the value, and in some cases the whole Section 301 or Section 338 duty: unwrought gold bullion and doré '
        '(7108.12.10) and plain bars of 99.5% gold (7108.13.55) are Free, other unwrought or semi-manufactured gold 4.1%; silver bullion '
        '(7106.91.10) is exempt from the 2026 Section 301 duty, cast silver bars (7106.92.10) are not, minted bars (7115.90.05) are',
        'appliesTo': 'Headings 7106, 7108, 7110 and 7115 — bullion, bars, grain, rounds and semi-manufactured precious metal',
        'document': 'Assay certificates showing fineness, and a description of how the bar was made (cast, minted, stamped, lasered) and what '
        'is marked on it.',
        'caveat': '"Unwrought" excludes cast forms processed beyond simple trimming (additional U.S. note 1(a)), so CBP classified stamped and '
        'lasered 1-kilogram and 100-ounce cast gold bars in 7108.13.55 (NY N351466) and stamped cast silver bars in 7106.92.10 (NY N357226). '
        'The form follows the goods; a ruling settles a doubtful bar before it ships.',
        'provisions': [
            {'code': '7108.12.10', 'rate': 'Free', 'text': 'Gold bullion and doré, unwrought — exempt from the 2026 Section 301 duty'},
            {'code': '7108.13.55', 'rate': 'Free', 'text': 'Gold bars of 99.5% or more marked only with weight, purity or identifying information'},
            {'code': '7106.91.10', 'rate': 'Free', 'text': 'Silver bullion and doré — exempt from the 2026 Section 301 duty'},
            {'code': '7106.92.10', 'rate': 'Free', 'text': 'Silver bars of 99.5% or more — not exempt; on the Canada Section 338 list'},
            {'code': '7115.90.05', 'rate': 'Free', 'text': 'Minted bars of 99.5% gold, silver or other precious metal — exempt'},
        ],
        'citations': [
            {'label': 'HTSUS Chapter 71, additional U.S. note 1', 'url': CH71_PDF},
            {'label': 'CBP ruling NY N351466 (cast gold bars)', 'url': R_N351466},
            {'label': 'CBP ruling NY N357226 (silver bars)', 'url': R_N357226},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(b)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'stones',
        'title': 'Classify stones by how far they are worked — and natural or lab-grown',
        'saves': 'Up to 10.5%: unworked gemstones (7103.10.20) and stones cut for jewelry (7103.99.10) are Free, while stones only sawn or '
        'roughly shaped (7103.10.40) and other worked stones (7103.99.50) pay 10.5%; lab-grown diamonds cut for jewelry (7104.91.10) are Free, '
        'other worked lab-grown diamonds 6.4%',
        'appliesTo': 'Headings 7102–7104 — diamonds, gemstones and lab-grown stones',
        'document': 'Grading or laboratory reports stating whether a stone is natural or laboratory-grown, its weight and how it is cut.',
        'caveat': 'Only natural diamonds and gemstones are on the EU, Swiss and other note 52(j) exception lists; lab-grown diamonds pay the '
        'Section 301 duty from every country on the list. The FTC requires lab-grown diamonds to be disclosed as such (16 CFR 23.12).',
        'citations': [
            {'label': 'HTSUS Chapter 71 (7102–7104)', 'url': CH71_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(j)', 'url': CH99_PDF},
            {'label': '16 CFR 23.12', 'url': ecfr(16, '23.12')},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — where the stone was cut or the jewelry made',
        'saves': 'The difference between country rates: Free for EU and Swiss diamonds, +10% for Indian, +12.5% for Israeli, UAE or South '
        'African, 50% for Canadian polished diamonds; jewelry 10% in total from the EU, 15.5% from India, 18% from the UAE or Thailand, '
        '25.5% from China',
        'appliesTo': 'All lines outside the bullion exemption; the gap is widest on diamonds and jewelry',
        'document': 'Production records showing where the stone was cut and polished, or where the jewelry was made; mine-of-origin records '
        'for diamonds of 0.5 carat or more.',
        'caveat': 'For duty, origin is where the goods were last substantially transformed. The OFAC Russia rules look further back: a diamond '
        'of 0.5 carat or more mined in Russia stays banned after it is cut in another country, so the supplier\'s mine-of-origin evidence '
        'matters.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
            {'label': '31 CFR part 587', 'url': ecfr_part(31, 587)},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on Canadian and Mexican goods',
        'saves': 'The 10% Section 301 duty and the base rate (up to 13.5% on silver jewelry, 11% on costume jewelry)',
        'appliesTo': 'Goods of Canada and Mexico that meet the USMCA rules of origin',
        'document': 'A USMCA certification of origin (importer, exporter or producer) with the required data elements, and records supporting it.',
        'caveat': 'The claim does not remove the 50% Section 338 duty on the seven Canadian subheadings on the note 51(b)(3) list — polished '
        'diamonds, cast silver bars, silver and gold jewelry, costume jewelry and non-legal-tender coin. Bullion is exempt from Section 301 '
        'with or without a claim.',
        'citations': [
            {'label': '19 CFR part 182', 'url': ecfr_part(19, 182)},
            {'label': 'HTSUS General Note 11', 'url': GN_PDF},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51, 52', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'fta',
        'title': 'Use an FTA or AGOA for the base rate',
        'saves': 'The base rate — 5%–13.5% on jewelry, 10.5% on worked gemstones — for goods of Israel, Australia, Peru, Colombia, Korea, other FTA '
        'partners and AGOA countries',
        'appliesTo': 'Dutiable lines with a Free special rate (most of 7103–7117)',
        'document': 'Proof that the goods meet the agreement\'s rules of origin: manufacturer affidavits, bills of materials, production and '
        'payment records.',
        'caveat': 'Under U.S. note 52(a) the 2026 Section 301 duty still applies when a special rate is claimed, so Israeli or South African '
        'jewelry pays 12.5% instead of 17.5%–18%. CBP denies claims it cannot verify; in HQ H307425 it denied a gold-jewelry FTA claim for lack '
        'of production and payment records. GSP has been expired since December 31, 2020.',
        'citations': [
            {'label': 'HTSUS General Notes (FTAs, AGOA)', 'url': GN_PDF},
            {'label': 'CBP ruling HQ H307425 (gold jewelry FTA claim)', 'url': R_H307425},
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(a)', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ch98',
        'title': 'Repairs abroad and American goods returned',
        'saves': 'Duty on the full value: jewelry sent abroad for repair or alteration pays duty only on the value of the work (9802.00.40, '
        '9802.00.50), and U.S.-made jewelry returned unchanged is Free (9801.00.10)',
        'appliesTo': 'U.S. goods exported and brought back — repairs, resizing, setting, returns from shows',
        'document': 'Export records, the foreign repairer\'s invoice for the work, and the declarations in 19 CFR 10.1 and 10.8.',
        'caveat': 'The Section 301 duty applies to the value of repairs or alterations under 9802 (note 52(a)). Assembly abroad of U.S. '
        'components (9802.00.80) does not cover U.S. gold that is melted and cast abroad — that is fabrication, not assembly (NY N347575).',
        'citations': [
            {'label': 'HTSUS Chapter 98', 'url': CH98_PDF},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
            {'label': '19 CFR 10.8', 'url': ecfr(19, '10.8')},
            {'label': '19 CFR 10.14 (9802.00.80)', 'url': ecfr(19, '10.14')},
            {'label': 'CBP ruling NY N347575', 'url': R_N347575},
        ],
    },
    {
        'id': 'temporary',
        'title': 'Bring show samples in under bond or an ATA Carnet',
        'saves': 'All duty on jewelry and stones shown at a trade show or to buyers and then re-exported',
        'appliesTo': 'Samples, exhibition pieces and consignments that leave the country again',
        'document': 'A temporary importation bond (9813.00.20 for samples for taking orders) or an ATA Carnet, and proof of export within the '
        'bond period.',
        'caveat': 'Goods properly entered under a Chapter 98 provision other than 9802 are outside the 2026 Section 301 duty (note 52(a)), but '
        'goods sold in the United States must be entered and pay full duty; the bond is forfeited if they are not exported in time.',
        'citations': [
            {'label': '19 CFR 10.31 (temporary importation under bond)', 'url': ecfr(19, '10.31')},
            {'label': '19 CFR 10.36 (commercial samples)', 'url': ecfr(19, '10.36')},
            {'label': '19 CFR part 114 (carnets)', 'url': ecfr_part(19, 114)},
        ],
    },
    {
        'id': 'drawback',
        'title': 'Claim drawback on re-exported goods',
        'saves': 'Up to 99% of the duties paid, including the Section 301 duty, on goods exported or destroyed',
        'appliesTo': 'Imported diamonds, gemstones, metal and jewelry that are re-exported, or used to make exported jewelry',
        'document': 'Import and export records linked by drawback claim, filed in ACE within five years of import.',
        'caveat': 'Drawback needs records tying each export to the import; substitution rules require goods of the same 8-digit subheading.',
        'citations': [
            {'label': '19 U.S.C. 1313', 'url': USC_1313},
            {'label': '19 CFR part 190', 'url': ecfr_part(19, 190)},
        ],
    },
    {
        'id': 'ftz',
        'title': 'Use a foreign-trade zone',
        'saves': 'Duty on goods re-exported from the zone, and deferral until goods enter U.S. commerce',
        'appliesTo': 'Stocks of stones, metal or jewelry held for distribution or re-export',
        'document': 'Zone admission (CBP Form 214) and an inventory-control system approved for the zone.',
        'caveat': 'Privileged foreign merchandise is classified at the rate in force on the date its privileged status is applied for; '
        'non-privileged merchandise is classified as it is when entered for consumption from the zone (19 CFR 146.65). Extra-duty notices can '
        'set their own zone-status rules, so check the current Chapter 99 note.',
        'citations': [
            {'label': '19 CFR part 146', 'url': ecfr_part(19, 146)},
            {'label': '19 CFR 146.65', 'url': ecfr(19, '146.65')},
            {'label': 'HTSUS Ch. 99, subch. III', 'url': CH99_PDF},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling',
        'saves': 'Certainty on the line — for example bullion versus bar, natural versus lab-grown, jewelry versus costume jewelry — and on the '
        'Chapter 99 numbers that go with it',
        'appliesTo': 'Any line where the form, the material or the value break is in doubt',
        'document': 'A ruling request with samples or photos, assay data and a full description.',
        'caveat': 'A ruling binds CBP only for goods that match the facts given.',
        'citations': [{'label': '19 CFR part 177', 'url': ecfr_part(19, 177)}],
    },
]

te['rules'] = [
    {
        'id': 'kp-rough',
        'agency': 'U.S. Treasury (OFAC) / CBP',
        'title': 'Rough diamonds (7102.10, 7102.21, 7102.31) may be imported only from a Kimberley Process participant, sealed in a '
        'tamper-resistant container and with an original Kimberley Process certificate, which the ultimate consignee keeps five years and sends '
        'to the Census Bureau',
        'citations': [
            {'label': '19 U.S.C. 3903', 'url': USC_3903},
            {'label': '31 CFR 592.201', 'url': ecfr(31, '592.201')},
            {'label': '31 CFR 592.301', 'url': ecfr(31, '592.301')},
            {'label': '31 CFR 592.310 (rough diamond)', 'url': ecfr(31, '592.310')},
        ],
    },
    {
        'id': 'ofac-russia',
        'agency': 'U.S. Treasury (OFAC)',
        'title': 'Imports of Russian-origin gold, non-industrial diamonds, unsorted diamonds and diamond jewelry are prohibited, and so are '
        'non-industrial diamonds of 0.5 carat or more mined in Russia and cut elsewhere (General License 104B allows stones that were outside '
        'Russia before the cut-off dates, through September 1, 2027)',
        'citations': [
            {'label': '31 CFR part 587', 'url': ecfr_part(31, 587)},
            {'label': 'OFAC determinations, 89 FR 16450', 'url': src('ofac-ru-diamonds')['url']},
            {'label': 'OFAC determination (gold), 89 FR 78245', 'url': src('ofac-ru-gold')['url']},
            {'label': 'General License 104B', 'url': src('ofac-gl104b')['url']},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Every article must be marked with its country of origin, or its container where the article cannot be; Native American-style '
        'jewelry must be marked indelibly on the article itself',
        'citations': [
            {'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')},
            {'label': '19 CFR 134.43(c)', 'url': ecfr(19, '134.43')},
        ],
    },
    {
        'id': 'stamping-act',
        'agency': 'National Gold and Silver Stamping Act',
        'title': 'Gold and silver articles stamped with a quality mark ("14K", "sterling") must meet it within the legal tolerances, and a quality '
        'mark must be accompanied by a registered trademark; importing falsely marked gold or silver ware is unlawful',
        'citations': [
            {'label': '15 U.S.C. 294', 'url': USC_294},
            {'label': '15 U.S.C. 297', 'url': USC_297},
        ],
    },
    {
        'id': 'ftc-jewelry',
        'agency': 'Federal Trade Commission',
        'title': 'The FTC Jewelry Guides govern how gold karat, silver ("sterling" = 925), platinum, diamonds, lab-grown diamonds, pearls, '
        'gemstone treatments and stone weights may be described when the goods are sold',
        'citations': [
            {'label': '16 CFR 23.3 (gold)', 'url': ecfr(16, '23.3')},
            {'label': '16 CFR 23.5 (silver)', 'url': ecfr(16, '23.5')},
            {'label': '16 CFR 23.12 (diamond, lab-grown)', 'url': ecfr(16, '23.12')},
            {'label': '16 CFR 23.24 (gemstone treatments)', 'url': ecfr(16, '23.24')},
        ],
    },
    {
        'id': 'cpsc-children',
        'agency': 'Consumer Product Safety Commission',
        'title': "Children's jewelry is a children's product: lead content must be within the statutory limit, and the importer must issue and "
        "eFile a Children's Product Certificate based on third-party testing",
        'citations': [
            {'label': '15 U.S.C. 1278a', 'url': USC_1278A},
            {'label': '16 CFR part 1110', 'url': ecfr_part(16, 1110)},
        ],
    },
    {
        'id': 'coin-reporting',
        'agency': 'CBP / FinCEN',
        'title': 'Circulating coin imported for monetary purposes needs no formal entry (additional U.S. note 2), but transporting more than '
        '$10,000 in coin or currency into the United States must be reported',
        'citations': [
            {'label': 'HTSUS Chapter 71, additional U.S. note 2', 'url': CH71_PDF},
            {'label': '31 CFR 1010.340', 'url': ecfr(31, '1010.340')},
        ],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'U.S. Customs and Border Protection',
        'title': 'Report the right Chapter 99 numbers with the Chapter 71 line: 9903.05.86 for the bullion exemption, 9903.05.97 or 9903.05.98 '
        'for EU or Swiss diamonds and gemstones, 9903.05.93/.94 for USMCA goods, 9903.03.14 for the Canada Section 338 list, 9903.88.03 or '
        '9903.88.15 for China',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 51, 52', 'url': CH99_PDF},
            {'label': 'CSMS # 69326983 (Section 301 guidance)', 'url': src('csms-69326983')['url']},
        ],
    },
]

GROUP_RULES = {
    '7101': ['cbp-marking', 'ftc-jewelry', 'cbp-ch99'],
    '7102': ['kp-rough', 'ofac-russia', 'cbp-marking', 'ftc-jewelry', 'cbp-ch99'],
    '7103': ['cbp-marking', 'ftc-jewelry', 'cbp-ch99'],
    '7104': ['ofac-russia', 'cbp-marking', 'ftc-jewelry', 'cbp-ch99'],
    '7105': ['cbp-marking', 'cbp-ch99'],
    '7106': ['cbp-ch99'],
    '7107': ['cbp-marking', 'cbp-ch99'],
    '7108': ['ofac-russia', 'cbp-ch99'],
    '7109': ['cbp-marking', 'cbp-ch99'],
    '7110': ['cbp-ch99'],
    '7111': ['cbp-marking', 'cbp-ch99'],
    '7112': ['cbp-ch99'],
    '7113': ['ofac-russia', 'cbp-marking', 'stamping-act', 'ftc-jewelry', 'cbp-ch99'],
    '7114': ['cbp-marking', 'stamping-act', 'ftc-jewelry', 'cbp-ch99'],
    '7115': ['stamping-act', 'cbp-ch99'],
    '7116': ['cbp-marking', 'ftc-jewelry', 'cbp-ch99'],
    '7117': ['cbp-marking', 'cpsc-children', 'cbp-ch99'],
    '7118': ['coin-reporting', 'cbp-ch99'],
}
GROUP_NOTES = {
    '7101': 'No license needed. Loose pearls are Free; natural pearls from the EU and Switzerland are also exempt from the Section 301 '
    'duty, cultured pearls from Japan pay 12.5% in total.',
    '7102': 'Rough diamonds (7102.10, 7102.21, 7102.31) need a Kimberley Process certificate and must come from a participant. Russian-origin '
    'diamonds, and Russian-mined stones of 0.5 carat or more cut elsewhere, are banned. Canadian polished diamonds (7102.39) pay the 50% '
    'Section 338 duty even under USMCA.',
    '7103': 'No license needed. Stones only sawn or roughly shaped, and worked stones not cut for jewelry, pay 10.5%; the rest are Free. EU, '
    'Swiss and some other countries\' stones are exempt from the Section 301 duty (note 52(j)).',
    '7104': 'Lab-grown diamonds must be sold as laboratory-grown (FTC). Russian-mined diamonds are covered by the OFAC ban only if natural. '
    'Cut lab-grown diamonds for jewelry are Free; lab-grown stones are on no Section 301 exception list.',
    '7105': 'No license needed; Free.',
    '7106': 'Silver bullion and doré are exempt from the Section 301 duty; cast silver bars (7106.92.10) are not, and from Canada they pay the '
    '50% Section 338 duty even under USMCA.',
    '7107': 'Silver-clad base metal pays 3.3%; no agency rule.',
    '7108': 'Every gold line is exempt from the 2026 Section 301 duty (note 52(b)); Chinese gold still pays the 25% List 3 duty. Russian gold '
    'is banned. Stamped cast bars are 7108.13.55, not unwrought bullion (NY N351466).',
    '7109': 'Gold-clad base metal pays 6%; no agency rule.',
    '7110': 'Platinum-group metals are Free and exempt from the 2026 Section 301 duty. Russian platinum-group metals pay column 2 or 35%.',
    '7111': 'Platinum-clad metal pays 10%; no agency rule.',
    '7112': 'Scrap for refining is Free; platinum scrap and ash are exempt from the Section 301 duty, gold and silver scrap are not.',
    '7113': 'Gold and silver jewelry with a quality mark must meet it and carry a trademark (Stamping Act). Russian diamond jewelry is '
    'banned. Canadian silver and gold jewelry (7113.11.50, 7113.19.29, 7113.19.50) pay the 50% Section 338 duty.',
    '7114': 'Silverware with a "sterling" or karat mark must meet it (Stamping Act, FTC Guides). Base rates 2.7%–7.9%.',
    '7115': 'Minted bars of 99.5% metal (7115.90.05) are Free and exempt from the Section 301 duty; other gold articles (7115.90.30) are '
    'exempt too.',
    '7116': 'Pearl strands and gemstone jewelry pay 2.1%–10.5%; disclosures of pearl and gemstone treatments follow the FTC Guides.',
    '7117': 'Costume jewelry for children needs lead testing and a Children\'s Product Certificate. Canadian base-metal costume jewelry '
    '(7117.19.90) pays the 50% Section 338 duty.',
    '7118': 'Circulating coin for monetary use needs no formal entry; coin and currency over $10,000 must be reported. Legal-tender coin is '
    'exempt from the Section 301 duty; non-legal-tender coin from Canada pays 50%.',
}
for g in te['groups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]

FORM_HEADINGS = {'7106', '7108', '7110', '7115'}
STONE_HEADINGS = {'7102', '7103', '7104'}
for ln in te['lines']:
    h = ln['hts'][:4]
    ln['ruleIds'] = list(GROUP_RULES[h])
    levers = []
    if h in FORM_HEADINGS:
        levers.append('form')
    if h in STONE_HEADINGS:
        levers.append('stones')
    levers += ['origin', 'usmca', 'fta', 'ch98', 'temporary', 'drawback', 'ftz', 'ruling']
    ln['leverIds'] = levers

te['seo'] = {
    'title': 'Importing Gold, Diamonds & Jewelry into the U.S.: Kimberley Process, Russian Diamond Ban, Stamping Act & Legal Ways to Lower '
    'Duty (HTS Ch. 71) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 71 line needs at U.S. entry — Kimberley Process certificates for rough diamonds, the OFAC bans '
    'on Russian gold and diamonds, origin marking, the Gold and Silver Stamping Act and FTC Jewelry Guides — and the legal ways to pay less: '
    'bullion versus bar classification, origin, USMCA, FTAs, repairs abroad, carnets, drawback and FTZs.',
    'keywords': [
        'precious metals tariff engineering',
        'hts 7108.12.10 unwrought gold duty',
        'gold bar classification 7108.13.55',
        'kimberley process certificate import',
        'russian diamond import ban',
        'usmca hts chapter 71 rules of origin',
        'jewelry country of origin marking',
        'ata carnet jewelry samples',
    ],
}
te['intro'] = (
    'Most Chapter 71 goods need no import license, but three rules stop shipments at the border. **Rough diamonds** need an original '
    '**Kimberley Process certificate**, a sealed tamper-resistant container and a participant country of export. **Russian gold and diamonds** '
    'are banned by OFAC — including Russian-mined diamonds of 0.5 carat or more that were cut in India, Belgium or elsewhere. And gold and '
    'silver articles stamped with a quality mark must meet it under the **National Gold and Silver Stamping Act**; every article must be '
    'marked with its country of origin.\n\n'
    'On cost, the base rate is often Free, so the levers are mostly about the **extra duty**: whether metal is exempt bullion or a dutiable '
    'bar (cast silver bars are not exempt from the Section 301 duty, minted ones are), where a diamond was cut (Free from Belgium, +10% from '
    'India, 50% from Canada), USMCA and FTA claims, repairs abroad, carnets for show goods, drawback and foreign-trade zones. Each lever '
    'depends on a document, listed below with its regulation.'
)
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. The line a bar or stone '
    'falls in, the origin of a diamond and the Chapter 99 duties that apply depend on the facts of each shipment, and the extra duties and '
    'OFAC licenses change by Federal Register notice and agency guidance; confirm the current headings, licenses and Kimberley Process '
    'requirements before each shipment.'
)
