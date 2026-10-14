# Overview page (exec'd from fill96.py).
ov = d['overview']

GROUP_LABELS = {
    # heading: (product-group label, matrix short label)
    '9601': ('Worked ivory, bone, horn, shell, coral & mother-of-pearl', 'Ivory, bone, shell'),
    '9602': ('Gelatin & vegetable capsules, wax figures, amber & other carvings', 'Capsules, wax, carvings'),
    '9603': ('Brooms, brushes, toothbrushes, makeup brushes, paint rollers & mops', 'Brooms & brushes'),
    '9604': ('Hand sieves & riddles', 'Hand sieves'),
    '9605': ('Travel sets for toilet, sewing or shoe cleaning', 'Travel sets'),
    '9606': ('Buttons, snap fasteners, press studs & button blanks', 'Buttons & snaps'),
    '9607': ('Zippers (slide fasteners) & zipper parts', 'Zippers'),
    '9608': ('Ballpoint pens, markers, fountain pens, mechanical pencils, refills & parts', 'Pens & markers'),
    '9609': ('Pencils, crayons, pencil leads, pastels, chalk & charcoal', 'Pencils & crayons'),
    '9610': ('Slates, chalkboards & whiteboards', 'Boards & slates'),
    '9611': ('Hand stamps, date stamps & label embossers', 'Hand stamps'),
    '9612': ('Printer & typewriter ribbons, ink pads', 'Ribbons & ink pads'),
    '9613': ('Cigarette lighters, utility & multipurpose lighters, lighter parts', 'Lighters'),
    '9614': ('Smoking pipes, pipe bowls & cigar or cigarette holders', 'Smoking pipes'),
    '9615': ('Combs, hair clips, hairpins & hair curlers', 'Combs & hair clips'),
    '9616': ('Perfume atomizers & powder puffs', 'Sprayers & puffs'),
    '9617': ('Vacuum flasks, insulated tumblers & bottles', 'Vacuum flasks'),
    '9618': ("Mannequins, tailors' dummies & animated displays", 'Mannequins'),
    '9619': ('Diapers, sanitary pads, tampons & incontinence products', 'Diapers & pads'),
    '9620': ('Tripods, monopods, bipods & similar supports', 'Tripods'),
}

BLURBS = {
    '9601': 'Worked ivory, worked shell and articles of bone, horn, hoof or whalebone are Free; coral and cameos for jewelry pay 2.1%, '
    'other worked animal carving material such as mother-of-pearl 3.7%. Worked shell (9601.90.20) is on the general Section 301 '
    'exemption list (note 52(b)). African elephant ivory cannot be imported commercially, whalebone and other marine-mammal products are '
    'barred, and CITES species (hawksbill tortoiseshell, black coral) need permits.',
    '9602': 'Empty gelatin capsules pay 3%, empty vegetable (cellulose) capsules 2.7%, molded or carved wax articles 1.8%, and articles of '
    'amber, jet, corozo or other vegetable or mineral carving material 2.7%. India and Mexico are the largest suppliers.',
    '9603': 'Toothbrushes, makeup and artists\' brushes over 5¢ each, feather dusters and brushes for machines are Free. Hairbrushes pay '
    '0.2¢ each + 7% (up to 40¢) or 0.3¢ each + 3.6%, paint rollers 7.5%, paint brushes and pads 4%, mops and other brooms 2.8%. Brooms '
    'of broomcorn pay 8% on the first 121,478 dozen entered each calendar year (61,655 dozen for whiskbrooms), then 32¢ each or 32%.',
    '9604': 'Hand sieves and hand riddles pay 4.9%; sieves that are parts of machines are classified with the machine.',
    '9605': 'Travel kits for personal toilet, sewing, or shoe or clothes cleaning pay 8.1% as a set; manicure and pedicure sets are in '
    'heading 8214.',
    '9606': 'Snap fasteners pay 3.5% (up to 20¢ a dozen) or 2.7%; buttons of base metal or casein are Free; acrylic or polyester buttons '
    'pay a "line" rate — 0.3¢ per line per gross plus 4.6% (one line = 0.635 mm of button diameter); other plastic buttons 4.7%, pearl '
    'or shell 0.18¢/line/gross + 2.5%. Every 9606 line from China also pays +25% (List 3).',
    '9607': 'Zippers with metal teeth pay 10%, with plastic teeth or coil 13%, and zipper parts (sliders, pulls, tape) 11.5%. Chinese '
    'zippers pay 47.5%–50.5% in total (List 3 + the 2026 Section 301 duty).',
    '9608': 'Ballpoint pens pay 0.8¢ each + 5.4%, markers and highlighters 4%, fountain and other pens and refills 0.4¢ each + 2.7%, '
    'mechanical pencils 6.6%. Pen and pencil sets (9608.50) pay the rate of each article as if entered separately. Nibs and most pen '
    'parts are Free.',
    '9609': 'Wood-cased pencils and crayons with a sheathed lead pay 14¢ per gross + 4.3%; pencil leads, wax crayons, pastels, chalk and '
    'charcoal are Free. Cased pencils from China also owe an antidumping duty of 114.90% (China-wide rate).',
    '9610': 'Chalkboards, whiteboards and slates with a writing or drawing surface pay 3.5%, framed or not.',
    '9611': 'Hand-operated date, numbering and sealing stamps and hand label embossers pay 2.7%.',
    '9612': 'Ribbons under 30 mm in plastic or metal cartridges are Free; other printer ribbons, including thermal-transfer ribbons, '
    'pay 7.9%; ink pads 3.5%.',
    '9613': 'Disposable gas lighters pay 4%, refillable pocket lighters 9%, table lighters 4.8%, electric and multipurpose (grill) '
    'lighters 3.9%, other lighters 8%–9%. Disposable, novelty and multipurpose lighters must be child-resistant under CPSC rules, and '
    'the importer must report each new model to CPSC 30 days before importing it.',
    '9614': 'Roughly shaped briar blocks are Free; wooden pipes 0.4¢ each + 3.2%, clay pipes 3%, glass and plastic pipes 0.3¢ each + '
    '3.2%, metal holders 7.2%.',
    '9615': 'Plastic combs pay 14.4¢/gross + 2% (up to $4.50 a gross) or 28.8¢/gross + 4.6%; plastic hair clips and slides 5.3%; metal '
    'and other hair slides 11%; hairpins 5.1%; non-heated hair curlers 8.1%.',
    '9616': 'Perfume atomizers and their mounts and heads are Free; powder puffs and cosmetic pads 4.3%.',
    '9617': 'Vacuum flasks and vacuum-insulated tumblers and bottles up to 1 liter pay 7.2%, larger ones 6.9%, parts 7.2%. CBP classifies '
    'double-walled vacuum stainless-steel tumblers here (NY N356922). China supplied $1.30B of the $1.47B imported in 2025.',
    '9618': "Tailors' dummies, display mannequins and animated shop-window displays pay 4.4%.",
    '9619': 'Diapers, sanitary pads and tampons of paper pulp, paper or cellulose wadding are Free; of plastics 5%; of textile wadding '
    '3.6%–6.3%; cloth diapers and other textile articles 2.8%–16% by fiber. The largest heading by value: $1.95B in 2025, mostly '
    'Free-rated disposable products from Canada and Mexico.',
    '9620': 'Tripods and monopods of plastics pay 5.3%, of wood 3.3%, of iron or steel 2.9%, of aluminum 2.5%, of carbon fiber Free; '
    'accessories for binoculars (9005) and surveying instruments (9015) pay the rate of that instrument. Every 9620 line from China also '
    'pays +25% (List 3).',
}

SEARCH_EXAMPLES = {
    '9601': ['mother of pearl', 'bone carving', 'horn', 'coral cameo', 'shell carving', 'antler', 'ivory'],
    '9602': ['empty gelatin capsules', 'vegetable capsules', 'wax figure', 'amber', 'tagua nut', 'jet'],
    '9603': ['toothbrush', 'makeup brush', 'hairbrush', 'paint brush', 'paint roller', 'broom', 'mop', 'squeegee', 'toilet brush',
             'feather duster'],
    '9604': ['hand sieve', 'flour sifter', 'riddle'],
    '9605': ['travel sewing kit', 'shoe shine kit', 'travel toiletry set'],
    '9606': ['button', 'snap fastener', 'press stud', 'button blank', 'jeans button'],
    '9607': ['zipper', 'zipper slider', 'zipper pull', 'coil zipper', 'metal zipper'],
    '9608': ['ballpoint pen', 'gel pen', 'marker', 'highlighter', 'fountain pen', 'mechanical pencil', 'pen refill', 'pen set'],
    '9609': ['pencil', 'colored pencil', 'crayon', 'pencil lead', 'pastel', 'chalk', 'charcoal'],
    '9610': ['whiteboard', 'chalkboard', 'slate'],
    '9611': ['date stamp', 'rubber stamp', 'label embosser', 'self-inking stamp'],
    '9612': ['printer ribbon', 'thermal transfer ribbon', 'typewriter ribbon', 'ink pad'],
    '9613': ['lighter', 'disposable lighter', 'butane lighter', 'utility lighter', 'grill lighter', 'electric lighter', 'torch lighter'],
    '9614': ['tobacco pipe', 'briar pipe', 'glass pipe', 'cigarette holder'],
    '9615': ['comb', 'hair clip', 'claw clip', 'hairpin', 'bobby pin', 'hair curler', 'eyelash curler'],
    '9616': ['perfume atomizer', 'powder puff', 'makeup sponge'],
    '9617': ['vacuum flask', 'thermos', 'insulated tumbler', 'vacuum bottle', 'stainless steel tumbler'],
    '9618': ['mannequin', "tailor's dummy", 'dress form', 'display figure'],
    '9619': ['diapers', 'baby diapers', 'adult diapers', 'sanitary pads', 'tampons', 'panty liners', 'cloth diapers', 'incontinence pads'],
    '9620': ['tripod', 'camera tripod', 'monopod', 'bipod', 'phone tripod'],
}

for g in ov['productGroups']:
    h = g['heading']
    g['label'] = GROUP_LABELS[h][0]
    g['blurb'] = BLURBS[h]
    g['searchExamples'] = SEARCH_EXAMPLES[h]

ov['seo'] = {
    'title': 'HTS Chapter 96 Tariffs 2026: Pens, Pencils, Brushes, Zippers, Buttons, Lighters, Diapers & Vacuum Flask Import Duty Rates '
    '| KoalaGains',
    'shortDescription': 'Searchable 2026 U.S. tariff table for all 157 HTS Chapter 96 lines — pens, pencils, brushes, zippers, buttons, '
    'lighters, combs, vacuum flasks, diapers, tripods. Base rates from Free to 32% plus the extra duty by country: 10% in total for EU '
    'goods, +12.5% for Vietnam, up to +37.5% for China, Free for USMCA goods.',
    'keywords': [
        'hts chapter 96',
        'miscellaneous manufactured articles tariff',
        'miscellaneous manufactured articles import duty rates',
        'china tariff on miscellaneous manufactured articles',
        'zippers and buttons customs duty',
        'usmca miscellaneous manufactured articles',
        'hs code for diapers',
        'hs code for pens',
        'hs code for vacuum flask',
        'lighter tariff code',
    ],
}

ov['intro'] = (
    'Chapter 96 is the catch-all chapter for everyday manufactured goods: **brooms, brushes and toothbrushes, buttons and zippers, '
    'pens, pencils and crayons, lighters, combs and hair clips, vacuum flasks and insulated tumblers, mannequins, tripods, and diapers, '
    'sanitary pads and tampons** (heading 9619), plus worked ivory, bone and shell and empty capsules. 128 of its 157 tariff lines carry '
    'a base duty, mostly **2%–10%**; the highest are brooms over their annual quantity (32¢ each or 32%), synthetic textile diapers '
    '(16%) and plastic or coil zippers (13%). Disposable diapers and pads of paper pulp, toothbrushes, makeup brushes and pen nibs are '
    'Free.\n\n'
    'The U.S. imported **$8.27B** of these goods in 2025: **China** $4.08B (49%), then Canada and Mexico (mostly diapers and pads, Free '
    'under USMCA), Japan (pens and markers) and Vietnam. On top of the base rate comes an **extra duty by country**: since July 24, 2026 a '
    'Section 301 tariff on 60 economies — **+10%** for India, Malaysia, Cambodia, Indonesia and the UK, **+12.5%** for Vietnam and '
    'Thailand, **10% in total** for EU goods and 12.5% in total for Japan and Korea. **China pays +12.5% plus its 2018–2019 list duty**: '
    '+25% on buttons, zippers and tripods (List 3) and +7.5% on most pens, pencils, brushes, lighters and diapers (List 4A) — a Chinese '
    'zipper pays up to 50.5%. **Cased pencils from China** also owe a 114.90% antidumping duty. USMCA-qualifying goods from Canada and '
    'Mexico pay nothing extra, and no Chapter 96 line is on the Canada Section 338 lists. Lighters must meet **CPSC child-resistance '
    'standards**, and tampons and menstrual pads are **FDA-regulated medical devices**.'
)

ov['workedExamples'] = [
    {
        'title': 'Stainless-steel vacuum tumbler from China (under 1 liter)',
        'line': '9617.00.10.00',
        'body': 'CBP classifies double-walled, vacuum-insulated stainless-steel tumblers as vacuum vessels (NY N356922): 7.2%. China adds '
        '+12.5% (9903.05.31); 9617.00.10 is on no list that is being collected (List 4B was suspended), so the total is **19.7%** — $1,970 on '
        'a $10,000 shipment. The same tumbler pays 19.7% from Vietnam or Thailand, 17.2% from Malaysia and nothing from Mexico under USMCA. '
        'Vessels over 2 liters (9617.00.40) are on List 4A: 26.9% from China.',
    },
    {
        'title': 'Ballpoint pens from China vs. Japan',
        'line': '9608.10.00.00',
        'body': 'Ballpoint pens pay 0.8¢ each + 5.4%. For 10,000 pens worth $2,000 that is $80 + $108 = $188. From China add +12.5% '
        '(9903.05.31) and +7.5% (List 4A, 9903.88.15): $188 + $400 = **$588**, about 29% of the value. From Japan the 2026 Section 301 action '
        'charges 12.5% in total in place of a lower base rate (9903.05.49): **$250**. USMCA-qualifying pens from Mexico pay nothing.',
    },
    {
        'title': 'Wood-cased pencils from China',
        'line': '9609.10.00.00',
        'body': 'The base rate is 14¢ per gross + 4.3%. On 1,000 gross (144,000 pencils) worth $10,000: $140 + $430. China adds +12.5% and '
        '+7.5% (List 4A): $2,000. And cased pencils from China are under an **antidumping duty order** since 1994: unless the exporter has '
        'its own rate, the cash deposit is the China-wide **114.90%** — $11,490. In all about **$14,060**, 141% of the value. The same pencils '
        'from Brazil pay $140 + 4.3% + 37.5% (Section 301 on Brazil) = $4,320.',
    },
    {
        'title': 'Polyester buttons from China — the "line" rate',
        'line': '9606.21.40.00',
        'body': 'Buttons of acrylic or polyester resin pay 0.3¢ per line per gross + 4.6%. A "line" is 0.635 mm of button diameter '
        '(additional U.S. note 1), so a 24-line button (15.2 mm) pays 0.3¢ × 24 = 7.2¢ per gross of 144 buttons. On 1,000 gross worth $3,000: '
        '$72 + $138, plus +12.5% and +25% (List 3, 9903.88.03) = $1,125 — **$1,335** in all. The importer must report the line size so CBP '
        'can check the specific duty.',
    },
    {
        'title': 'Pen-and-pencil gift set from Germany',
        'line': '9608.50.00.00',
        'body': 'A set of articles from two or more of 9608.10–9608.40 pays "the rate applicable to each article in the absence of this '
        'subheading": the ballpoint pen at 0.8¢ + 5.4% on its value, the mechanical pencil at 6.6% on its value. The importer gives each '
        'article\'s line and value. For EU goods the 2026 Section 301 action then charges 10% in total in place of a lower rate (9903.05.39), so '
        'a $10,000 shipment of German sets whose articles\' own duty adds up to under 10% pays **$1,000**.',
    },
]

ov['notes'] = {
    'chapterNotes': '**Note 1.** This chapter does not cover: (a) Pencils for cosmetic or toilet uses (chapter 33); (b) Articles of chapter '
    '66 (for example, parts of umbrellas or walking-sticks); (c) Imitation jewelry (heading 7117); (d) Parts of general use, as defined in '
    'note 2 to section XV, of base metal (section XV) or similar goods of plastics (chapter 39); (e) Cutlery or other articles of chapter 82 '
    'with handles or other parts of carving or molding materials; heading 9601 or 9602 applies, however, to separately entered handles or '
    'other parts of such articles; (f) Articles of chapter 90 (for example, spectacle frames (heading 9003), mathematical drawing pens '
    '(heading 9017), brushes of a kind specialized for use in dentistry or for medical, surgical or veterinary purposes (heading 9018)); (g) '
    'Articles of chapter 91 (for example, clock or watch cases); (h) Musical instruments or parts or accessories thereof (chapter 92); (ij) '
    'Articles of chapter 93 (arms and parts thereof); (k) Articles of chapter 94 (for example, furniture, luminaires and lighting fittings); '
    '(l) Articles of chapter 95 (toys, games, sports equipment); or (m) Works of art, collectors\' pieces or antiques (chapter 97).\n\n'
    '**Note 2.** In heading 9602 the expression "vegetable or mineral carving material" means: (a) Hard seeds, pips, hulls and nuts and '
    'similar vegetable materials of a kind used for carving (for example, corozo and dom); (b) Amber, meerschaum, agglomerated amber and '
    'agglomerated meerschaum, jet and mineral substitutes for jet.\n\n'
    '**Note 3.** In heading 9603 the expression "prepared knots and tufts for broom or brush making" applies only to unmounted knots and '
    'tufts of animal hair, vegetable fiber or other material, which are ready for incorporation without division in brooms or brushes, or '
    'which require only such further minor processes as trimming to shape at the top, to render them ready for such incorporation.\n\n'
    '**Note 4.** Articles of this chapter, other than those of headings 9601 to 9606 or 9615, remain classified in the chapter whether or '
    'not composed wholly or partly of precious metal or metal clad with precious metal, of natural or cultured pearls, or precious or '
    'semiprecious stones (natural, synthetic or reconstructed). However, headings 9601 to 9606 and 9615 include articles in which natural or '
    'cultured pearls, precious or semiprecious stones (natural, synthetic or reconstructed), precious metal or metal clad with precious '
    'metal constitute only minor constituents.',
    'additionalUsNotes': '**1.** For the purposes of heading 9606 the term "line" in the rates of duty columns means the line button measure '
    'of 0.635 mm.\n\n'
    '**2.** Buttons (whether or not finished) provided for in subheadings 9606.21.40 and 9606.29.20 which are the product of an insular '
    'possession of the United States outside the customs territory of the United States and which are manufactured or produced from button '
    'blanks or unfinished buttons which were the product of any foreign country shall be subject to duty under subheadings 9606.21.40 and '
    '9606.29.20 at the rates which apply to products of such foreign country.',
}

ov['tradeSnapshot']['coverageNote'] = (
    'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar 2025 — '
    'before the 2026 tariff changes.'
)
for st in ov['stats']:
    if st['label'] == 'Lines with an extra duty for some origins':
        st['note'] = (
            'Section 301 (2026, 60 economies): 156 (all but worked shell); Brazil: 157; China List 3: 33 (buttons, zippers, tripods) and List '
            '4A: 84; Russia: 2 lines; USMCA goods exempt; no Canada Section 338 line'
        )
