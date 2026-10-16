# Tariff engineering part of fill97 (exec'd).
# flake8: noqa
te = d['tariffEngineering']
te['h1'] = "Importing Art, Antiques & Collectibles (HTS Ch. 97): Cultural Property, Ivory, Documents & Ways to Lower Duty"
te['seo'] = {
    'title': 'Importing Art & Antiques into the U.S.: Cultural Property Rules, Ivory, Proof of Age and Legal Ways to Lower Duty (HTS Ch. 97) | KoalaGains',
    'shortDescription': ('Tariff engineering and entry rules for HTS Chapter 97: classifying originals vs reproductions and antiques, proof of age, '
                         'country of origin, Chapter 98 temporary entry for exhibitions, the merchandise processing fee, plus CPIA cultural property '
                         'restrictions, Iraq and Syria, pre-Columbian sculpture, and the ivory and endangered-species rules for antiques.'),
    'keywords': ['importing art into the us', 'importing antiques to usa', 'cultural property import restrictions', 'can you import ivory into the us',
                 'esa antique exemption ivory', 'cpia designated list', 'hts code for artwork', 'hs code for antique furniture'],
}
te['intro'] = (
    'Chapter 97 goods are Free at the general rate, so the levers are about **staying in Chapter 97** and **avoiding the three extra duties** (China 7.5%, '
    'Canada 50% on 16 lines, Russia 35%). An object that is a reproduction, a work of conventional craftsmanship or under 100 years old belongs in another '
    'chapter, where it pays that chapter\'s rate and, for most origins, the 2026 Section 301 duty that Chapter 97 escapes. Proof of authorship and age, the '
    'right country of origin and Chapter 98 temporary-entry provisions do the rest.\n\n'
    'The bigger risk is not duty but **seizure**. Designated archaeological and ethnological material from the 30-plus countries with U.S. cultural property '
    'agreements or emergency actions needs export documents; material illegally removed from Iraq or Syria is restricted; stolen inventory of foreign '
    'museums and pre-Columbian monumental sculpture cannot enter; and **elephant ivory** and other endangered-species parts may enter only as qualifying '
    'antiques through designated ports. Each rule and lever links to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = ECFR_DATE
te['levers'] = [
    {'id': 'classify', 'title': 'Classify as an original work, collectors\' piece or antique, not a decorative article or reproduction',
     'saves': 'The other chapter\'s base rate plus, for most origins, the 2026 Section 301 duty that note 52(b) lifts only for Chapter 97: for example 3.3% + 10% on modern French sterling tableware (7114.11.50) vs Free as antique silverware over 100 years old; a 1950s EU upholstered wooden chair pays 15% Section 232 (9903.76.22) vs Free as a 9706 antique',
     'appliesTo': 'Paintings vs hand-painted articles, original prints vs photomechanical reproductions (4911), sculptures vs mass-produced statuettes (chapters 44, 69, 83), antiques vs newer furniture, silverware and decorative goods',
     'document': 'An invoice naming the artist and stating whether each work is an original, a replica or a copy; for sculpture, that it is the original or one of the first 12 castings (additional U.S. note 1); for prints, that they were printed by hand from hand-made plates (19 CFR 10.48). Normal frames go with the picture (note 6). A binding ruling under 19 CFR part 177 settles a close case before import.',
     'caveat': 'Notes 2 and 4 exclude mass-produced reproductions and works of conventional craftsmanship of a commercial character, even when designed by an artist. Classification follows what the object is; describing décor as art is false classification.',
     'citations': [{'label': 'HTSUS Chapter 97 notes', 'url': CH97}, {'label': '19 CFR 10.48 (engravings, sculptures)', 'url': E19 + 'section-10.48'},
                   {'label': '19 CFR part 177 (rulings)', 'url': E19 + 'part-177'}, {'label': 'CBP ICP: Works of Art, Collector\'s Pieces, Antiques', 'url': CBP_ICP}]},
    {'id': 'proof-of-age', 'title': 'Prove an antique is over 100 years old (or over 250, which matters for Canada)',
     'saves': 'Avoids the extra 6.6% that additional U.S. note 2 adds when an article entered for sale as an antique turns out to be under 100 years old, on top of its normal rate; for Canada, an antique over 250 years old (9706.10) is off the Section 338 list while 9706.90 pays 50%',
     'appliesTo': 'Antiques of 9706, and the age splits in 9701, 9702, 9703 and 9705.31',
     'document': 'Evidence of age: dealer or auction invoices describing the period, expert appraisals, provenance and photographs (19 CFR 10.53). A repaired antique stays Free; substantial added material is appraised and dutiable separately, and an object altered beyond its original identity loses free entry (19 CFR 10.53(b)).',
     'caveat': 'The 6.6% is waived if the article was not imported for sale or the antique claim is withdrawn in writing before examination (19 CFR 10.53(f)–(g)).',
     'citations': [{'label': '19 CFR 10.53 (antiques)', 'url': E19 + 'section-10.53'}, {'label': 'HTSUS Chapter 97, additional U.S. note 2', 'url': CH97}]},
    {'id': 'origin', 'title': 'Declare the right country of origin: where the work was made',
     'saves': 'The extra duties attach to origin, not to where the work was bought: a Chinese painting bought at auction in London or Hong Kong still pays China\'s 7.5%; a French antique bought in Canada pays no Section 338 duty',
     'appliesTo': 'All lines; matters for goods made in China, Canada or Russia',
     'document': 'Provenance showing where the object was made; the country of origin is the country of manufacture or production (19 CFR 134.1(b)). Articles produced more than 20 years before import, such as antiques, and stamps (J-list) are exempt from origin marking, but the entry must still state the origin.',
     'caveat': 'Re-framing, restoring or reselling a work abroad does not change its origin. Mis-declaring origin is fraud.',
     'citations': [{'label': '19 CFR 134.1 (country of origin)', 'url': E19 + 'section-134.1'}, {'label': '19 CFR 134.32 (marking exceptions)', 'url': E19 + 'section-134.32'}, {'label': '19 CFR 134.33 (J-list)', 'url': E19 + 'section-134.33'}]},
    {'id': 'chapter98', 'title': 'Use Chapter 98 for exhibitions, artists\' works on tour and works returning to the United States',
     'saves': 'Free entry with no Canada Section 338 or Russia 35% duty (both notes exempt goods properly entered under Chapter 98, with exceptions such as the 9802 repair and assembly provisions) and no merchandise processing fee (19 CFR 24.23(c)(1)(i))',
     'appliesTo': 'Works lent to museums and fairs, works brought in by visiting artists, and U.S. works returning after exhibition or sale attempts abroad',
     'document': 'Temporary importation under bond for works of the free fine arts brought in by professional artists for exhibition (9813.00.70) or articles for exhibition by institutions established for the encouragement of the arts (9812.00.20), with a TIB or ATA Carnet (19 CFR 10.31, part 114); or proof of U.S. origin for American goods returned (9801.00.10, 19 CFR 10.1).',
     'caveat': 'Bonded goods must be exported within the bond period or the duties and fees become due. Chapter 98 does not lift cultural property, ivory or other entry restrictions.',
     'citations': [{'label': 'HTSUS Chapter 98', 'url': CH98}, {'label': '19 CFR 10.31 (temporary importation bond)', 'url': E19 + 'section-10.31'},
                   {'label': '19 CFR part 114 (ATA Carnets)', 'url': E19 + 'part-114'}, {'label': '19 CFR 10.1 (American goods returned)', 'url': E19 + 'section-10.1'},
                   {'label': 'HTSUS Ch. 99, U.S. notes 30 and 51', 'url': CH99}]},
    {'id': 'baggage', 'title': 'Carry personal-use items from Canada in accompanied baggage',
     'saves': 'The 50% Section 338 duty, which does not apply to products for personal use in the accompanied baggage of persons arriving in the United States (U.S. note 51(a))',
     'appliesTo': 'Canadian paintings, prints, sculptures, stamps and collectibles of the 16 listed lines bought for personal use',
     'document': 'Declare the goods on arrival as personal effects (19 CFR part 148).',
     'caveat': 'Commercial quantities, goods for sale and shipped goods do not qualify.',
     'citations': [{'label': 'HTSUS Ch. 99, U.S. note 51(a)', 'url': CH99}, {'label': '19 CFR part 148 (passengers)', 'url': E19 + 'part-148'}]},
    {'id': 'drawback', 'title': 'Claim drawback when dutiable works are re-exported',
     'saves': 'Generally 99% of the China List 4A, Canada Section 338 or Russia duties paid, on goods re-exported unused (for example a work consigned to a U.S. sale and sent back unsold)',
     'appliesTo': 'Chinese, Canadian (listed lines) and Russian goods',
     'document': 'A drawback claim to CBP with the import and export records (19 CFR part 191); the claim is generally 99% of the eligible duties (19 CFR 191.51).',
     'caveat': 'Claims must be filed within five years of import, and the export must be documented.',
     'citations': [{'label': '19 CFR part 191', 'url': E19 + 'part-191'}, {'label': '19 CFR 191.51', 'url': E19 + 'section-191.51'}]},
]
te['rules'] = [
    {'id': 'cpia', 'agency': 'CBP / State Department',
     'title': 'Cultural property agreements and emergency actions (CPIA): designated archaeological or ethnological material of a country listed in 19 CFR 12.104g (bilateral agreements with about 30 countries, among them China, Italy, Greece, Egypt, Peru, Türkiye, India and Nepal, and emergency actions for Afghanistan, Lebanon and Ukraine) may enter only with the country\'s export certificate, or evidence that it left the country before the designation or at least 10 years before entry (19 CFR 12.104c); otherwise CBP seizes it',
     'citations': [{'label': '19 U.S.C. 2606 (import restrictions)', 'url': USC['19-2606']}, {'label': '19 CFR 12.104a', 'url': E19 + 'section-12.104a'},
                   {'label': '19 CFR 12.104c (permitted entry)', 'url': E19 + 'section-12.104c'}, {'label': '19 CFR 12.104g (designated lists)', 'url': E19 + 'section-12.104g'},
                   {'label': 'State Department: current agreements and import restrictions', 'url': STATE_CP}, {'label': 'CBP ICP: Works of Art, Collector\'s Pieces, Antiques', 'url': CBP_ICP}]},
    {'id': 'stolen', 'agency': 'CBP',
     'title': 'Stolen cultural property: an article documented in the inventory of a museum, religious or secular public monument or similar institution of a party to the 1970 UNESCO Convention and stolen from it after April 12, 1983 (or the later date the Convention took effect for that party) may not be imported',
     'citations': [{'label': '19 U.S.C. 2607', 'url': USC['19-2607']}, {'label': '19 CFR 12.104a(a)', 'url': E19 + 'section-12.104a'}]},
    {'id': 'iraq-syria', 'agency': 'CBP / State Department',
     'title': 'Iraq and Syria: archaeological and ethnological material illegally removed from Iraq since August 6, 1990 (19 CFR 12.104j) or unlawfully removed from Syria on or after March 15, 2011 (19 CFR 12.104k) is restricted under the designated lists of CBP Decisions 08-17 and 16-10',
     'citations': [{'label': '19 CFR 12.104j (Iraq)', 'url': E19 + 'section-12.104j'}, {'label': '19 CFR 12.104k (Syria)', 'url': E19 + 'section-12.104k'},
                   {'label': '73 FR 23334 (Iraq designated list)', 'url': SRC['fr-E8-9343']['url']}, {'label': '81 FR 53916 (Syria designated list)', 'url': SRC['fr-2016-19491']['url']}]},
    {'id': 'pre-columbian', 'agency': 'CBP',
     'title': 'Pre-Columbian monumental or architectural sculpture and murals (stone carvings, stelae, architectural fragments, frescoes) first discovered in Mexico, Guatemala, Belize, Honduras, El Salvador, Costa Rica, Panama, Colombia, Venezuela, Ecuador, Peru, Bolivia or the Dominican Republic may not be imported without an export certificate from that country or proof it was exported on or before June 1, 1973',
     'citations': [{'label': '19 U.S.C. 2091', 'url': USC['19-2091']}, {'label': '19 CFR 12.105', 'url': E19 + 'section-12.105'}, {'label': '19 CFR 12.107', 'url': E19 + 'section-12.107'}]},
    {'id': 'ivory', 'agency': 'U.S. Fish and Wildlife Service / CBP',
     'title': 'Elephant ivory and other endangered-species parts: African elephant worked ivory may not be imported commercially (50 CFR 17.40(e)(5)), except antiques that meet the Endangered Species Act test: at least 100 years old, made of the species, not repaired or modified with endangered species parts since December 28, 1973, and entered through an antique port (Boston, New York, Philadelphia, Baltimore, Miami, San Juan, New Orleans, Houston, Los Angeles, San Francisco, Anchorage, Honolulu or Chicago O\'Hare) with FWS Form 3-177 (50 CFR 17.40(e)(9), 14.22; 19 CFR 10.53(e), 12.26). Scrimshaw is excluded, and CITES documents are still required',
     'citations': [{'label': '16 U.S.C. 1539(h) (ESA antiques)', 'url': USC['16-1539']}, {'label': '50 CFR 17.40(e) (African elephant)', 'url': E50 + 'section-17.40'},
                   {'label': '50 CFR 14.22 (antique articles)', 'url': E50 + 'section-14.22'}, {'label': '19 CFR 12.26 (antique ports)', 'url': E19 + 'section-12.26'},
                   {'label': '81 FR 36388 (African elephant 4(d) rule, 2016)', 'url': SRC['fr-2016-13173']['url']}]},
    {'id': 'fws-clearance', 'agency': 'U.S. Fish and Wildlife Service',
     'title': 'Wildlife items (ivory, tortoiseshell, rhinoceros horn, taxidermy, zoological specimens of 9705.22) must be declared to FWS on Form 3-177, enter at a designated port and be cleared before CBP releases them; CITES Appendix I items need a pre-Convention certificate or permits (50 CFR 23.45)',
     'citations': [{'label': '50 CFR 14.61 (declaration)', 'url': E50 + 'section-14.61'}, {'label': '50 CFR 14.11 (designated ports)', 'url': E50 + 'section-14.11'},
                   {'label': '50 CFR 23.45 (pre-Convention specimens)', 'url': E50 + 'section-23.45'}]},
    {'id': 'invoice', 'agency': 'CBP',
     'title': 'Invoices for works of art must say whether each work is an original, replica, reproduction or copy and name the artist; CBP may require the artist\'s or seller\'s declaration for sculptures and prints (19 CFR 10.48), and proof of age for antiques (19 CFR 10.53)',
     'citations': [{'label': '19 CFR 10.48', 'url': E19 + 'section-10.48'}, {'label': '19 CFR 10.53', 'url': E19 + 'section-10.53'}]},
    {'id': 'mpf', 'agency': 'CBP',
     'title': 'Merchandise processing fee: formal entries of Free art and antiques still pay 0.3464% of value, with a minimum of $34.58 and a maximum of $670.86 per entry from October 1, 2026 (fiscal year 2027); Chapter 98 entries are exempt',
     'citations': [{'label': '19 CFR 24.23', 'url': E19 + 'section-24.23'}, {'label': '91 FR 48398 (FY2027 fee limits)', 'url': SRC['fr-2026-15530']['url']}]},
    {'id': 'cbp-ch99', 'agency': 'CBP',
     'title': 'Report the Chapter 99 numbers with the Chapter 97 line: 9903.05.86 for the note 52(b) exemption from the 2026 Section 301 duty (and 9903.05.03 for Brazil), 9903.88.15 for China List 4A, 9903.03.14 for Canada\'s listed lines and 9903.90.08 for Russia',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50, 51 and 52', 'url': CH99},
                   {'label': 'CBP CSMS # 69326983 (2026 Section 301)', 'url': SRC['csms-69326983']['url']},
                   {'label': 'CBP CSMS # 69606660 (Section 338)', 'url': SRC['csms-69606660']['url']}]},
    {'id': 'immunity', 'agency': 'State Department',
     'title': 'Works lent from abroad for temporary, non-profit exhibition can be protected from seizure in U.S. courts if the State Department determines them to be of cultural significance and the exhibition in the national interest',
     'citations': [{'label': '22 U.S.C. 2459', 'url': USC['22-2459']}]},
]
BASE_RULES = ['invoice', 'mpf', 'cbp-ch99']
GROUP_RULES = {
    '9701': ['cpia', 'stolen', 'iraq-syria', 'pre-columbian', 'immunity'],
    '9702': ['stolen', 'immunity'],
    '9703': ['cpia', 'stolen', 'iraq-syria', 'pre-columbian', 'ivory', 'fws-clearance', 'immunity'],
    '9704': [],
    '9705': ['cpia', 'stolen', 'iraq-syria', 'ivory', 'fws-clearance', 'immunity'],
    '9706': ['cpia', 'stolen', 'iraq-syria', 'ivory', 'fws-clearance', 'immunity'],
}
NOTES = {
    '9701': 'Free. Wall paintings, mosaics and icons can be designated ethnological or archaeological material (for example Chinese wall art at least 250 years old, Greek and Cypriot ecclesiastical icons), and pre-Columbian murals are restricted. Normal frames go with the painting.',
    '9702': 'Free. Invoices should show the artist and that the prints were printed by hand from hand-made plates; photomechanical reproductions are heading 4911.',
    '9703': 'Free, including the first 12 castings of a sculpture. Ancient and pre-Columbian sculpture is the main target of the cultural property rules; ivory carvings need the ESA antique test and an antique port.',
    '9704': 'Free. Unused current-issue stamps are heading 4907. With de minimis suspended, even small stamp parcels need an entry; Canadian stamps pay 50%.',
    '9705': 'Free. Archaeological pieces and ancient coins (for example coins of Italian types) need export documents under the cultural property agreements; endangered-species specimens (9705.22) need FWS clearance.',
    '9706': 'Free if over 100 years old, with proof of age; otherwise the article\'s normal rate plus 6.6%. Antiques with ivory, tortoiseshell or other endangered species enter only through an antique port with FWS Form 3-177.',
}
for g in te['groups']:
    g['label'] = GROUPS[g['heading']][0]
    g['ruleIds'] = BASE_RULES + GROUP_RULES[g['heading']]
    g['note'] = NOTES[g['heading']]
for l in te['lines']:
    code = l['hts'].replace('.', '')
    h = code[:4]
    rules = list(BASE_RULES) + GROUP_RULES[h]
    if code.startswith('970522'):
        rules += ['fws-clearance']
    levers = ['classify', 'origin', 'chapter98', 'drawback']
    if h == '9706' or code[:6] in ('970121', '970122', '970129', '970210', '970310', '970531'):
        levers.insert(1, 'proof-of-age')
    if code[:6] in ('970121', '970191', '970199', '970290', '970310', '970390', '970400', '970510', '970529', '970539', '970690'):
        levers.append('baggage')
    l['ruleIds'] = list(dict.fromkeys(rules))
    l['leverIds'] = levers
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations; not legal advice. Designated lists change as agreements are signed and '
                    'extended; check the State Department and CBP lists, and FWS for any wildlife content, before buying or importing.')
