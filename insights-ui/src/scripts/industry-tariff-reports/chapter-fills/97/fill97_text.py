# Text part of fill97.py (exec'd from it; uses d, SRC, NEW_SOURCES, trade helpers).
# flake8: noqa

d['asOf'] = TODAY
d['chapter']['title'] = "Works of art, collectors' pieces and antiques"
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 97 notes (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': f'2020–{Y} import figures'},
]

NO_IEEPA_ART = ('The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026; both excepted paintings, prints, '
                'sculptures, stamps and collectors\' pieces (9701–9705) as informational materials, but antiques (9706) paid them.')
S301_EXEMPT = ('Every Chapter 97 line is on the note 52(b) general exemption list (9903.05.86), so the 2026 Section 301 duty does not apply, '
               'with or without an informational-materials claim.')

# ---------------------------------------------------------------------------------------------------------------------
# Groups
# ---------------------------------------------------------------------------------------------------------------------
GROUPS = {
    '9701': ('Paintings, drawings, pastels, collages & mosaics (executed by hand)', 'Paintings & drawings',
             'Oil, acrylic and watercolor paintings, drawings and pastels executed entirely by hand, plus collages, mosaics and similar decorative plaques: 6 lines, split by age (over 100 years: 9701.21–.29; other: 9701.91–.99). All Free. Frames of a normal kind and value go with the picture (note 6). Hand-painted manufactured articles, technical drawings of heading 4906 and mass-produced mosaics (note 2) are classified elsewhere.',
             ['oil painting', 'watercolor painting', 'drawing', 'pastel', 'collage', 'mosaic', 'framed painting']),
    '9702': ('Original engravings, prints & lithographs', 'Original prints',
             'Impressions printed directly from plates, stones or blocks wholly executed by hand by the artist (note 3): etchings, engravings, woodcuts, lithographs and screenprints, over 100 years old (9702.10) or not (9702.90). Free. Photomechanical reproductions and posters are printed matter of heading 4911.',
             ['original print', 'lithograph', 'etching', 'woodcut', 'engraving', 'screenprint']),
    '9703': ('Original sculptures & statuary, in any material', 'Sculptures',
             'Original sculptures and statuary in any material, over 100 years old (9703.10) or not (9703.90), including the first 12 castings, replicas or reproductions made from the sculptor\'s original model (additional U.S. note 1). Free. Mass-produced reproductions and works of conventional craftsmanship of a commercial character are excluded (note 4) and classified by material.',
             ['bronze sculpture', 'marble statue', 'stone sculpture', 'wood carving', 'cast sculpture', 'statuary']),
    '9704': ('Postage & revenue stamps, first-day covers, postal stationery', 'Stamps',
             'Used stamps and unused stamps that are not of current or new issue in the country where they have face value, stamp-postmarks, first-day covers and postal stationery: one Free line (9704.00.00). Unused current-issue stamps are heading 4907.',
             ['postage stamps', 'stamp collection', 'first day cover', 'revenue stamps', 'postal stationery']),
    '9705': ("Collections & collectors' pieces: archaeological, ethnographic, natural history, coins", "Collectors' pieces & coins",
             "Collections and collectors' pieces of archaeological, ethnographic or historical interest (9705.10, with statistical lines for archaeological pieces at least 250 years old and ethnographic pieces), of zoological, botanical, mineralogical, anatomical or paleontological interest (9705.21–.29: human specimens, extinct or endangered species, fossils, minerals), and of numismatic interest (9705.31 over 100 years old, 9705.39 other; gold and other coins). All Free.",
             ['coin collection', 'ancient coins', 'fossils', 'meteorite', 'archaeological artifacts', 'ethnographic objects', 'mineral specimens']),
    '9706': ('Antiques over 100 years old', 'Antiques',
             'Antiques of an age exceeding 100 years that are not covered by 9701–9705 (note 5(b)): over 250 years (9706.10) or 100 to 250 years (9706.90), each split into silverware, furniture and other. Free, but an article entered for sale as an antique and later found to be under 100 years old pays its normal rate plus 6.6% (additional U.S. note 2).',
             ['antique furniture', 'antique silverware', 'antique clock', 'antique rug', 'antique porcelain', 'antique jewelry']),
}
ov = d['overview']
for g in ov['productGroups']:
    label, short, blurb, ex = GROUPS[g['heading']]
    g['label'], g['blurb'], g['searchExamples'] = label, blurb, ex
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = GROUPS[g['heading']][0], GROUPS[g['heading']][1]

# ---------------------------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------------------------
ov['h1'] = "HTS Chapter 97: Works of Art, Collectors' Pieces & Antiques — 2026 Tariff Rates"
ov['seo'] = {
    'title': 'HTS Chapter 97 Tariff Rates 2026: Art, Antiques, Coins & Stamps Import Duty | KoalaGains',
    'shortDescription': ("U.S. import duty on all 30 HTS Chapter 97 lines: paintings, prints, sculptures, stamps, coins, collectors' pieces and antiques "
                         "are Free, exempt from the 2026 Section 301 duties. China pays 7.5%, Canada 50% on 16 lines, Russia 35%. "
                         "Plus cultural property, ivory and antique rules."),
    'keywords': ['hts chapter 97', 'tariffs on art', 'tariffs on antiques', 'art import duty usa', 'hs code for paintings',
                 'hts 9706 antiques', 'are antiques subject to tariffs', 'is art exempt from tariffs', 'berman amendment fine art exemption'],
}
top = ui['byCountry'][:3]
ov['intro'] = (
    "Chapter 97 covers works of art and collectibles: paintings, drawings and pastels executed by hand, collages and mosaics (9701), original prints "
    "(9702), original sculptures (9703), used and collectible stamps (9704), collections and collectors' pieces such as archaeological and "
    "ethnographic objects, fossils, minerals and coins (9705), and antiques over 100 years old (9706). The U.S. imported "
    f"**{money(TOTAL)}** of these goods in {Y}, {share(top[0]['importsUsd'])} from {top[0]['country']}. **All 30 lines are Free** at the general rate.\n\n"
    "Most countries pay nothing extra: every Chapter 97 line is on the **general exemption list of the 2026 Section 301 duties** (U.S. note 52(b)) "
    "and on **Brazil's exemption list**, so a painting or antique from France, the UK, Switzerland, Germany, Italy or Hong Kong enters Free. Three "
    "measures do charge: **China** pays the 7.5% Section 301 List 4A duty on every line, **Canada** pays the 50% **Section 338** duty on 11 subheadings "
    "(paintings and drawings, recent original prints, sculptures, stamps, most collectors' pieces and antiques 100–250 years old), even with a USMCA claim, and **Russia** pays "
    "35% in place of the column 2 rate.\n\n"
    "The 2025–2026 emergency tariffs ended: IEEPA on February 24, 2026 and the Section 122 surcharge on July 23, 2026. Both excepted art, stamps and "
    "collectors' pieces as **informational materials** (50 U.S.C. 1702(b)(3), the \"Berman Amendment\"), but **antiques (9706) paid them**. "
    "The duty is rarely the hard part: **cultural property** import restrictions (CPIA bilateral agreements and emergency actions, plus Iraq and Syria), "
    "**ivory** and other endangered-species rules, and proof of age and authorship decide whether an object can enter. See Tariff engineering."
)
ov['stats'][2]['note'] = ('China Section 301 List 4A (7.5%): 30; Russia (35% in place of column 2): 30; Canada Section 338 (50%): 16. '
                          'The 2026 Section 301 and Brazil duties exempt every line (notes 52(b), 50(a)(ii)); no Section 232 or AD/CVD measure reaches the chapter.')

MPF_MAX = '$670.86'
ov['workedExamples'] = [
    {'title': 'A $2 million 19th-century oil painting from the United Kingdom', 'line': '9701.21.00.00',
     'body': 'Paintings executed entirely by hand and over 100 years old are 9701.21, **Free**. The UK\'s 10% 2026 Section 301 duty does not apply because the line is on the note 52(b) exemption list (report 9903.05.86). The only charge is the **merchandise processing fee**: 0.3464% of value, capped at **' + MPF_MAX + '** per entry from October 1, 2026. Invoice the artist and title; CBP can ask for proof the work is an original (19 CFR 10.48).'},
    {'title': 'A French commode from about 1850', 'line': '9706.90.00.40',
     'body': 'Antique furniture 100 to 250 years old is 9706.90.00.40, **Free** today. It paid the 10% reciprocal duty from April 5, 2025, the EU\'s **15%** all-in rate from August 7, 2025, and the **10% Section 122** surcharge from February 24 to July 23, 2026, because antiques are not informational materials. Keep proof of age: if CBP finds a piece entered for sale as an antique is under 100 years old, it pays the furniture rate **plus 6.6%** (additional U.S. note 2), and an upholstered wooden seat could also face the 15% Section 232 wood duty for EU goods.'},
    {'title': 'A contemporary bronze sculpture from Canada', 'line': '9703.90.00.00',
     'body': 'Original sculptures not over 100 years old are 9703.90, Free at the general rate, but 9703.90 is on the Canada **Section 338** list (U.S. note 51(b)(3)), so since August 22, 2026 a $100,000 sculpture pays **50%: $50,000**, even if it qualifies for USMCA. A sculpture over 100 years old (9703.10) is on the list too. The duty does not apply to goods properly entered under Chapter 98, such as a work brought in temporarily under bond for exhibition (9813.00.70), or to personal-use goods in accompanied baggage.'},
    {'title': 'A Qing dynasty porcelain vase from China', 'line': '9706.10.00.60',
     'body': 'An antique over 250 years old is 9706.10.00.60. China pays the **7.5%** Section 301 List 4A duty (9903.88.15) on every Chapter 97 line, so a $40,000 vase pays **$3,000**; the List 4A product exclusions once granted for antiques have expired. In 2025 it also paid the IEEPA fentanyl and reciprocal duties (up to 145% in April–May 2025). The U.S.–China cultural property agreement restricts archaeological material through the Tang period (A.D. 907) and monumental sculpture and wall art at least 250 years old, so a Qing vase is not designated, but a Tang tomb figure needs a Chinese export permit or proof it left China before January 14, 2009.'},
    {'title': 'An ancient Roman silver coin bought from a dealer in Germany', 'line': '9705.31.00.01',
     'body': 'Coins over 100 years old are 9705.31 (coins made before the 14th century and not known to come from excavations report 9705.31.00.01), **Free** from Germany. "Coins of Italian types" are on the designated list under the U.S.–Italy cultural property agreement (extended through January 12, 2031), so a coin of such a type needs an Italian export certificate or evidence under 19 CFR 12.104c that it left Italy before it was designated or at least 10 years before entry. Without it, CBP can seize it.'},
]
ov['tradeSnapshot']['biggestLines'] = [{'hts': l['hs6'], 'label': GROUP_LINE_LABELS.get(l['hs6'], l['description'])} for l in ui['byLine'][:3]] if 'GROUP_LINE_LABELS' in dir() else ov['tradeSnapshot']['biggestLines']
ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['tradeSnapshot']['effectiveDutyRateNote'] = "Duty-collected figures aren't available from an official source yet."
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover: (a) unused postage or revenue stamps, postal stationery or the like, of heading 4907; (b) theatrical scenery, '
        'studio backdrops or the like, of painted canvas (heading 5907) except if they may be classified in heading 9706; or (c) pearls, natural or cultured, or '
        'precious or semiprecious stones (headings 7101 to 7103).\n\n'
        '**Note 2.** Heading 9701 does not apply to mosaics that are mass-produced reproductions, casts or works of conventional craftsmanship of a commercial '
        'character, even if these articles are designed or created by artists.\n\n'
        '**Note 3.** For heading 9702, "original engravings, prints and lithographs" means impressions produced directly, in black and white or in color, of '
        'one or of several plates wholly executed by hand by the artist, irrespective of the process or of the material employed, but not including any '
        'mechanical or photomechanical process.\n\n'
        '**Note 4.** Heading 9703 does not apply to mass-produced reproductions or works of conventional craftsmanship of a commercial character, even if '
        'these articles are designed or created by artists.\n\n'
        '**Note 5.** (a) Subject to notes 1 to 4, articles of this chapter are to be classified in this chapter and not in any other chapter. (b) Heading '
        '9706 does not apply to articles of the preceding headings of this chapter.\n\n'
        '**Note 6.** Frames around paintings, drawings, pastels, collages or similar decorative plaques, engravings, prints or lithographs are classified with '
        'those articles if they are of a kind and of a value normal to those articles; other frames are classified separately.\n\n'
        '**Statistical notes.** For 9705.10.00.10, "archaeological pieces" are objects of cultural significance at least 250 years old of a kind normally '
        'discovered by scientific excavation, clandestine or accidental digging or exploration on land or under water; for 9705.10.00.20, "ethnographic '
        'pieces" are products of a tribal or nonindustrial society important to the cultural heritage of a people. Collections mixing several kinds of '
        'cultural property are reported by their separate components.'
    ),
    'additionalUsNotes': (
        '**1.** Heading 9703 covers not only original sculpture made by the sculptor, but also the first 12 castings, replicas or reproductions made from a '
        'sculptor\'s original work or model, by the sculptor or by another artist, with or without a change in scale and whether or not the sculptor is '
        'alive when they are completed.\n\n'
        '**2.** Whenever an article is entered for sale under heading 9706 and is then found to be not over 100 years old, an additional duty of 6.6% ad '
        'valorem (column 1), free for goods originating in Canada, or 25% (column 2) is assessed, on top of any other duty or penalty.'
    ),
}

# ---------------------------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = 'HTS Chapter 97 Tariff Updates 2025–2026: Art, Antiques & Collectibles'
tu['seo'] = {
    'title': 'Art & Antiques Tariff Updates 2025–2026: IEEPA, Section 122, Section 301, Canada 338 (HTS Ch. 97) | KoalaGains',
    'shortDescription': ('What changed for U.S. imports of art, antiques, coins and stamps since January 2025: the informational-materials '
                         'exemption, IEEPA and Section 122 duties on antiques and their end, the 2026 Section 301 exemption, Canada\'s 50% Section 338 '
                         'duty, China List 4A and new cultural property restrictions, with official citations.'),
    'keywords': ['hts chapter 97 import duty rates', 'tariffs on antiques 2026', 'trump tariffs on antiques', 'tariffs on art from canada',
                 'section 122 antiques tariff', 'berman amendment fine art exemption', 'tariffs on antiques from europe', 'tariffs on art from uk'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** '
    '(in force October 9, 2026). All 30 Chapter 97 lines were Free in both, and still are.\n\n'
    'The extra duties split the chapter in two. Paintings, prints, sculptures, stamps and collectors\' pieces (**9701–9705**) are **informational materials**, '
    'which IEEPA cannot regulate (50 U.S.C. 1702(b)(3)), so they were excepted from every 2025 IEEPA duty and from the 2026 Section 122 surcharge. '
    '**Antiques (9706)** were not: they paid 25% (35% from August 1) on non-USMCA goods of Canada, 25% on Mexico, the fentanyl and reciprocal duties on China '
    'and Hong Kong, the reciprocal tariff on everyone else (10%, then country rates from August 7, 2025 such as 15% all-in for the EU, 39% for Switzerland '
    'until November 14, 2025, 10% for the UK) and 50% on Brazil. All IEEPA duties **ended on February 24, 2026**; the 10% **Section 122** surcharge, '
    'charged on antiques only, expired on **July 23, 2026**.\n\n'
    'Today three measures charge Chapter 97 goods: China\'s **Section 301 List 4A** duty of 7.5% on all 30 lines (continued by USTR on October 7, 2026), '
    'the 50% **Section 338** duty on 16 lines from **Canada** (from August 22, 2026, USMCA or not), and Russia\'s 35% rate. The **2026 Section 301** duties on '
    '60 economies and **Brazil\'s** 25% duty exempt the whole chapter. Cultural property restrictions kept growing, with new agreements with India (2025) and '
    'Nepal (2026) and emergency restrictions for Lebanon (2025).'
)
tu['scope'] = ('Chapter 99 measures that reach Chapter 97 from any country (China Section 301 List 4A, Canada Section 338, Russia; the 2026 Section 301 and Brazil '
               'duties and their exemptions; the ended IEEPA and Section 122 duties), plus cultural property restrictions published by CBP and the State Department '
               'and the FWS ivory rule. No antidumping or countervailing duty order covers Chapter 97 goods. For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '30 of 30 lines', 'note': 'all Free; 2025 Basic Edition → 2026 Revision 21'},
    {'label': 'Extra duties in effect', 'value': '3', 'note': 'China List 4A 7.5%, Canada Section 338 50% (16 lines), Russia 35%'},
    {'label': '2026 Section 301', 'value': 'Exempt', 'note': 'whole chapter on note 52(b); Brazil duty exempt under note 50(a)(ii)'},
    {'label': 'IEEPA and Section 122', 'value': 'Ended', 'note': 'art excepted as informational materials; antiques paid until July 23, 2026'},
]

WHAT = {
    'cn-section-301': ('Every Chinese work of art, stamp, coin, collectors\' piece and antique pays 7.5% (Free + 7.5%); a $100,000 Chinese painting pays $7,500.',
                       'The 7.5% List 4A duty (9903.88.15, U.S. note 20(r)–(s)) covers all 30 Chapter 97 lines. The List 4A product exclusions USTR granted for paintings, prints, sculptures, stamps, some collectors\' pieces and antique silverware, furniture and other antiques (note 20(ddd) and (fff), 9903.88.51/.53) have expired. There is no informational-materials exception from Section 301. Hong Kong-origin goods are not products of China for this duty. The 2026 Section 301 duty (12.5%) does not apply: every Chapter 97 line is on note 52(b). The IEEPA duties on China and Hong Kong, which excepted 9701–9705 but charged antiques, ended February 24, 2026.'),
    'ca-section-338': ('Canadian paintings, drawings and other works under 100 years old (9701.91, 9701.99) and paintings over 100 years old (9701.21), original prints not over 100 years old, all original sculptures, stamps, collectors\' pieces of historical, natural-history and numismatic interest (9705.10, 9705.29, 9705.39) and antiques 100–250 years old (9706.90) pay 50%. Mosaics, other 9701.2x works over 100 years, old prints, human and endangered-species specimens, coins over 100 years old and antiques over 250 years old stay Free.',
                       'The 50% duty (9903.03.14, U.S. note 51(b)(3), Proclamation 11048) applies from August 22, 2026 whether or not USMCA is claimed, with no informational-materials exception. It does not apply to personal-use goods in accompanied baggage or to goods properly entered under Chapter 98 (with exceptions such as the 9802 repair and assembly provisions), such as works brought in temporarily under bond. The September 15, 2026 changes (Proclamation 11065) did not touch the Chapter 97 subheadings. The 2025 IEEPA duty on Canada excepted 9701–9705 (9903.01.12) and charged non-USMCA antiques; it ended February 24, 2026.'),
    'ru-russia': ('Russian paintings, prints, sculptures, stamps, coins, collectors\' pieces and antiques pay 35% instead of Free.',
                  'Russia has paid column 2 rates since April 2022 (Pub. L. 117-110); Proclamation 10420 put all of Chapter 97 on the U.S. note 30(b) list, which sets 35% in place of the Free column 2 rate (9903.90.08). There is no informational-materials exception. The 2026 Section 301 duty on Russia does not apply (note 52(b)). Goods entered under Chapter 98 (with exceptions such as the 9802 repair and assembly provisions) are not charged.'),
}
for e in tu['inEffect']:
    w, ex = WHAT[e['id']]
    e['whatItMeans'], e['exemption'] = w, ex
    if e['id'] == 'cn-section-301':
        e['measure'] = 'Section 301 List 4A (2019)'
    if e['id'] == 'ca-section-338':
        e['before'] = 'None'
        e['now'] = '+50% on 16 of 30 lines'
    if e['id'] == 'ru-russia':
        e['sourceIds'] = list(dict.fromkeys(e['sourceIds'] + ['pl-117-110']))

C = []


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    C.append({'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
              'countries': countries, 'sourceIds': sids})


ch('base-rates', 'baseRate', TODAY, 'Checked', 'Chapter 97 base rates: no changes, all Free',
   'All 30 Chapter 97 tariff lines carry the same General (Free), Special and Column 2 (Free) rates in the 2026 Revision 21 as in the 2025 Basic Edition.',
   None, None, None, ['hts-before', 'hts-now', 'hts-now-cr'])
ch('cn-301-continued', 'reference', '2026-10-07', 'Published', 'China Section 301 actions continue during the four-year review',
   'USTR announced that the Section 301 actions on China, including the 7.5% List 4A duty on all 30 Chapter 97 lines, continue while the review proceeds. No Chapter 97 product exclusion is in effect.',
   '+7.5%', '+7.5%', 'China', ['fr-2026-20510', 'hts-chapter-99'])
ch('cpac-oct-2026', 'reference', '2026-09-24', 'Published', 'Cultural Property Advisory Committee to review Cyprus, Guatemala and Peru agreements',
   'The State Department called a Cultural Property Advisory Committee meeting for October 27–29, 2026 to review proposed extensions of the bilateral cultural property agreements with Cyprus, Guatemala and Peru. Their import restrictions on designated archaeological and ethnological material stay in force while the extensions are considered.',
   None, None, 'Cyprus, Guatemala, Peru', ['fr-2026-19533', 'state-cpia'])
ch('section-338-canada-2026-08-22', 'extraDuty', '2026-08-22', 'Effective', 'Canada Section 338: 50% on 16 Chapter 97 lines',
   'Proclamation 11048 imposed a 50% duty on products of Canada in the provisions listed in U.S. note 51(b)(3) (9903.03.14), applied from August 22, 2026 (Proclamation 11056). The list names 9701.21, 9701.91, 9701.99, 9702.90, 9703.10, 9703.90, 9704.00, 9705.10, 9705.29, 9705.39 and 9706.90. The duty applies even to USMCA-qualifying goods and has no informational-materials exception. The September 15, 2026 changes (Proclamation 11065) left these subheadings unchanged.',
   'Free', '+50% (16 lines)', 'Canada', ['procl-11048', 'procl-11056', 'csms-69606660', 'procl-11065', 'csms-69851916', 'hts-chapter-99', 'hts-now'])
ch('cpia-nepal', 'reference', '2026-08-12', 'Effective', 'New cultural property restrictions: Nepal',
   'CBP added Nepal to the bilateral agreements in 19 CFR 12.104g: designated archaeological material from 32,000 B.C.E. through 1770 C.E. and ethnological material from the 13th century through 1950 C.E. need a Nepalese export certificate or proof under 19 CFR 12.104c, through January 8, 2031.',
   None, None, 'Nepal', ['fr-2026-16432'])
ch('section-301-2026-60-economies-2026-07-24', 'extraDuty', '2026-07-24', 'Effective', '2026 Section 301 duties on 60 economies: Chapter 97 exempt',
   'The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect, but every Chapter 97 line is on the general exemption list in U.S. note 52(b), so works of art, collectibles and antiques from the UK, the EU, Switzerland, Japan, India and the other listed economies pay nothing extra (report 9903.05.86). The separate informational-materials heading (9903.05.92) covers 9701–9705 too, but is not needed for this chapter.',
   None, 'Exempt (note 52(b))', '60 economies', ['fr-2026-15181', 'fr-2026-15274', 'csms-69326983', 'hts-chapter-99', 'hts-now'])
ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
   'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. It had charged antiques (9706) from every country except USMCA goods; works of art and collectibles (9701–9705) were excepted as informational materials (9903.03.11).',
   '+10% on antiques', 'None', 'All', ['procl-11012', 'hts-chapter-99'])
ch('section-301-brazil-2026-07-22', 'extraDuty', '2026-07-22', 'Effective', 'Brazil Section 301: Chapter 97 exempt',
   'The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect, but every Chapter 97 line is on its exemption list (U.S. note 50(a)(ii), 9903.05.03), so Brazilian art and antiques stay Free.',
   'None', 'Exempt (note 50(a)(ii))', 'Brazil', ['fr-2026-14542', 'csms-69302472', 'hts-chapter-99', 'hts-now'])
ch('de-minimis', 'reference', '2026-06-24', 'Effective', 'De minimis suspension made indefinite',
   'The $800 duty-free de minimis exemption has been suspended for all countries since August 29, 2025 (Executive Order 14324), kept after the IEEPA ruling (Executive Order 14388), and suspended indefinitely for all modes other than the postal network by CBP\'s interim final rule of June 24, 2026. Low-value parcels of stamps, coins and small collectibles need an entry, and Chinese ones pay the 7.5% List 4A duty.',
   'Free under $800', 'Entry required, any value', 'All', ['eo-14324', 'eo-14388', 'fr-2026-12670'])
ch('cpia-turkiye-ext', 'reference', '2026-05-13', 'Effective', 'Türkiye cultural property restrictions extended to 2031',
   'CBP extended the import restrictions on designated archaeological material of Türkiye (about 1,200,000 B.C. to A.D. 1770) and ethnological material (1st century to 1923) through March 24, 2031.',
   None, None, 'Türkiye', ['fr-2026-09575'])
ch('cpia-afghanistan-ext', 'reference', '2026-04-28', 'Effective', 'Afghanistan emergency restrictions extended to 2029',
   'CBP extended the emergency import restrictions on archaeological material of Afghanistan (50,000 B.C. through A.D. 1747) and ethnological material (9th century through 1920) through April 28, 2029.',
   None, None, 'Afghanistan', ['fr-2026-08223'])
ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge on antiques; art excepted',
   'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Works of art, stamps and collectors\' pieces (9701–9705) were excepted as informational materials (9903.03.11); antiques (9706) paid it unless entered under USMCA (9903.03.07, 9903.03.08).',
   'Varied by country', '+10% on 9706 (ended)', 'All', ['procl-11012', 'csms-67844987', 'hts-chapter-99'])
ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
   'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026. In Chapter 97 they had charged only antiques (9706).',
   'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'])
ch('cpia-italy-ext', 'reference', '2026-01-14', 'Effective', 'Italy cultural property restrictions extended to 2031',
   'CBP extended the import restrictions on designated pre-Classical, Classical and Imperial Roman archaeological material of Italy, including "coins of Italian types", through January 12, 2031.',
   None, None, 'Italy', ['fr-2026-00538'])
ch('section-301-nicaragua-scheduled-2027-01-01', 'pending', '2025-12-12', 'Announced', 'Section 301 tariff on Nicaragua phases in from 2027',
   'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every Chapter 97 line: this duty has no Chapter 97 exemption. The rate is 0% in 2026.',
   None, '+10% to +15%', 'Nicaragua', ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99', 'hts-now'])
ch('ch-framework', 'extraDuty', '2025-11-14', 'Effective', 'Switzerland: reciprocal rate cut to 15% all-in',
   'The U.S.–Switzerland–Liechtenstein framework replaced the 39% reciprocal duty with the higher of the base rate or 15%, for goods entered from November 14, 2025. Swiss antiques paid 15% until February 24, 2026; art was excepted.',
   '+39% on antiques', '15% all-in (ended)', 'Switzerland', ['fr-2025-23316'])
ch('de-minimis-suspended', 'reference', '2025-08-29', 'Effective', 'De minimis exemption suspended for all countries',
   'Executive Order 14324 ended duty-free entry for shipments valued at $800 or less from every country, effective for goods entered from August 29, 2025.',
   'Free under $800', 'Dutiable', 'All', ['eo-14324'])
ch('reciprocal-country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country-specific reciprocal rates on antiques',
   'Executive Order 14326 replaced the 10% baseline with country rates, for example 15% all-in for the EU and Japan, 39% for Switzerland, 25% for India and 10% for the United Kingdom. In Chapter 97 only antiques (9706) paid them; India\'s antiques also paid the additional 25% of Executive Order 14329 from August 27, 2025. Ended February 24, 2026.',
   '+10% on antiques', 'Country rates (ended)', 'All except Canada, Mexico', ['eo-14326', 'eo-14329'])
ch('brazil-ieepa-40', 'extraDuty', '2025-08-06', 'Effective', 'Brazil: 40% IEEPA duty on antiques',
   'Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77) on top of the 10% reciprocal duty. Informational materials, including 9701–9705, were excepted (9903.01.80); Brazilian antiques paid 50%. Ended February 24, 2026.',
   'None', '+40% on antiques (ended)', 'Brazil', ['eo-14323', 'hts-2025r22-ch99'])
ch('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
   'Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Art and collectibles were excepted (9903.01.12); non-USMCA antiques paid it. Ended February 24, 2026.',
   '+25%', '+35% on antiques (ended)', 'Canada', ['eo-14325'])
ch('cpia-india', 'reference', '2025-07-28', 'Effective', 'New cultural property restrictions: India',
   'CBP added India to 19 CFR 12.104g: designated archaeological material (about 1.7 million years ago to 1770 C.E.) and ethnological material (2nd century B.C.E. to 1947 C.E.) need an Indian export certificate or proof under 19 CFR 12.104c, through July 26, 2029.',
   None, None, 'India', ['fr-2025-14114'])
ch('cn-ieepa', 'extraDuty', '2025-05-14', 'Effective', 'China IEEPA duties: reciprocal rate cut to 10%',
   'Chinese and Hong Kong antiques paid IEEPA duties on top of Section 301: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November 10, 2025) and a reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. Art and collectibles of 9701–9705 were excepted as informational materials (9903.01.22, 9903.01.31) and paid only the 7.5% List 4A duty. All ended February 24, 2026.',
   '+125% reciprocal on antiques', '+10% reciprocal (ended)', 'China, Hong Kong', ['eo-14195', 'eo-14228', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14357'])
ch('cpia-lebanon', 'reference', '2025-05-13', 'Effective', 'Emergency cultural property restrictions: Lebanon',
   'CBP imposed emergency import restrictions on designated archaeological material of Lebanon (Paleolithic to 1774 C.E.) and ethnological material (1600 to 1918 C.E.), in effect until January 23, 2029 unless extended.',
   None, None, 'Lebanon', ['fr-2025-08615'])
ch('reciprocal', 'extraDuty', '2025-04-05', 'Effective', 'Reciprocal tariff: 10% on antiques, art excepted',
   '10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025. IEEPA cannot regulate informational materials (50 U.S.C. 1702(b)(3)), so paintings, prints, sculptures, stamps and collectors\' pieces were entered free of it under 9903.01.31; CBP\'s guidance lists 9701–9705 among the goods that may qualify. Antiques (9706) paid it. Ended February 24, 2026.',
   'None', '+10% or more on antiques (ended)', 'All except Canada, Mexico', ['eo-14257', 'usc-50-1702', 'cbp-ieepa-faq', 'hts-2025r22-ch99'])
ch('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
   'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.',
   '+25%', '+25%, USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232'])
ch('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
   '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025. Informational materials, including art and collectibles of 9701–9705, were excepted (9903.01.12, 9903.01.03); antiques paid it. Ended February 24, 2026.',
   'None', '+25% on antiques (ended)', 'Canada, Mexico', ['eo-14193', 'eo-14194', 'cbp-ieepa-faq'])
ch('cpia-ukraine', 'reference', '2024-09-10', 'Effective', 'Emergency cultural property restrictions: Ukraine',
   'CBP imposed emergency import restrictions on designated archaeological material of Ukraine (Paleolithic through 1774 C.E.) and ethnological material (200 to 1917 C.E.), in effect until March 5, 2029 unless extended.',
   None, None, 'Ukraine', ['fr-2024-20385'])
ch('cpia-china-ext', 'reference', '2024-01-14', 'Effective', 'China cultural property restrictions extended to 2029',
   'CBP extended the import restrictions on Chinese archaeological material from the Paleolithic through the end of the Tang period (A.D. 907) and on monumental sculpture and wall art at least 250 years old, through January 14, 2029.',
   None, None, 'China', ['fr-2024-00394'])
ch('ru-35', 'extraDuty', '2022-07-27', 'Effective', 'Russia: 35% on all Chapter 97 goods',
   'Proclamation 10420 set a 35% rate in place of the column 2 rate for the products of Russia listed in U.S. note 30(b) (9903.90.08), including every Chapter 97 subheading. Russian art and antiques had been Free at column 2.',
   'Free (column 2)', '35%', 'Russia', ['procl-10420', 'hts-chapter-99'])
ch('ivory-4d', 'reference', '2016-07-06', 'Effective', 'African elephant ivory: commercial imports banned, antiques excepted',
   'The FWS revision of the African elephant 4(d) rule took effect: worked ivory may not be imported except in limited non-commercial cases (musical instruments, traveling exhibitions, household moves and inheritances), while antiques meeting the Endangered Species Act test (at least 100 years old, not repaired with endangered species parts since December 28, 1973, imported through an antique port) remain importable.',
   None, None, 'All', ['fr-2016-13173', 'usc-16-1539'])
ch('cpia-syria', 'reference', '2016-08-15', 'Effective', 'Syria: emergency restrictions on cultural property',
   'Under the Protect and Preserve International Cultural Property Act, CBP restricted imports of archaeological and ethnological material unlawfully removed from Syria on or after March 15, 2011 (19 CFR 12.104k).',
   None, None, 'Syria', ['fr-2016-19491'])
ch('cn-4a-cut', 'extraDuty', '2020-02-14', 'Effective', 'China List 4A duty cut to 7.5%',
   'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5%. List 4A took effect September 1, 2019 and covers every Chapter 97 subheading. USTR later granted product exclusions for paintings, prints, sculptures, stamps, some collectors\' pieces and antiques; they have since expired (U.S. note 20(ddd), (fff)).',
   '+15%', '+7.5%', 'China', ['fr-2020-00904', 'fr-2019-17865', 'fr-2020-19419', 'hts-chapter-99'])
ch('cpia-iraq', 'reference', '2008-04-30', 'Effective', 'Iraq: restrictions on cultural property',
   'Under the Emergency Protection for Iraqi Cultural Antiquities Act of 2004, CBP restricted imports of archaeological and ethnological material illegally removed from Iraq since UN Security Council Resolution 661 of August 6, 1990 (19 CFR 12.104j).',
   None, None, 'Iraq', ['fr-E8-9343'])
C.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = C
add_sources(tu, [s['id'] for s in NEW_SOURCES])

# ---------------------------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------------------------
exec(open(f'{HERE}/fill97_trade.py').read())

# ---------------------------------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'Art & Antiques Tariff Rates by Country: UK, France, Switzerland, China, Canada (HTS Ch. 97) | KoalaGains',
    'shortDescription': ('The total U.S. tariff on paintings, prints, sculptures, stamps, coins, collectors\' pieces and antiques by country: Free from the UK, '
                         'the EU, Switzerland, Hong Kong, Japan and Brazil, 7.5% from China, 50% on 16 lines from Canada, 35% from Russia.'),
    'keywords': ['tariffs on art from uk', 'tariffs on antiques from uk', 'tariffs on antiques from france', 'tariffs on art from europe',
                 'tariffs on art from canada', 'tariffs on antiques from canada', 'tariff on art from china', 'hts chapter 97 customs duty'],
}
ia['intro'] = (
    'Every Chapter 97 line is Free, so each cell is **the extra duty for the country of origin**, computed from the current tariff schedule with the same '
    'engine as the tariff calculator. For most countries it is zero: the **2026 Section 301** duties exempt the whole chapter (note 52(b)), and so does '
    '**Brazil\'s** 25% duty (note 50(a)(ii)).\n\n'
    'Cells for 9701–9705 show a second total, "Free if informational materials" (the breakdown reads "not informational materials / informational materials"). The calculator asks whether the goods are **informational '
    'materials** (9903.05.92, 9903.05.09), because that claim lifts the 2026 Section 301 and Brazil duties on 9701–9705. Here both answers give Free, because '
    'note 52(b) already exempts every line, including antiques, which are not informational materials. Three origins differ: **China** pays 7.5% on '
    'everything, **Canada** 50% on 16 of 30 lines whether or not USMCA is claimed, and **Russia** 35%. None of the three has an informational-materials '
    'exception.'
)
LABELS = {
    'China': 'Free + 7.5% Section 301 List 4A (9903.88.15) on all 30 lines: 7.5%. The 2026 Section 301 duty does not apply (note 52(b)); the List 4A exclusions for art and antiques have expired. The IEEPA duties, which charged antiques only, ended February 24, 2026.',
    'Canada': 'USMCA or not: 50% Section 338 (9903.03.14) on 9701.21, 9701.91, 9701.99, 9702.90, 9703.10, 9703.90, 9704, 9705.10, 9705.29, 9705.39 and 9706.90 (16 of 30 lines); Free on the others. The 2026 Section 301 duty does not apply (note 52(b)). Personal-use goods in accompanied baggage and Chapter 98 entries are not charged.',
    'Mexico': 'Free on every line, with or without a USMCA claim (note 52(b) exempts the chapter from the 2026 Section 301 duty). The 2025 IEEPA duty, which charged non-USMCA antiques, ended February 24, 2026.',
    'United Kingdom': 'Free: the UK\'s 10% 2026 Section 301 duty (9903.05.81) does not apply to Chapter 97 (note 52(b), 9903.05.86). The 10% reciprocal and Section 122 duties on antiques ended February 24 and July 23, 2026.',
    'France': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the 15% all-in EU rate until February 24, 2026 and 10% Section 122 until July 23, 2026.',
    'Germany': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the 15% all-in EU rate until February 24, 2026 and 10% Section 122 until July 23, 2026.',
    'Italy': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Italian archaeological material, including coins of Italian types, needs export documents under the U.S.–Italy cultural property agreement.',
    'Switzerland': 'Free: Switzerland\'s 12.5% floor does not apply to Chapter 97 (note 52(b), 9903.05.86). Swiss antiques paid 39% from August 7 and 15% from November 14, 2025 until the IEEPA duties ended February 24, 2026.',
    'Hong Kong': 'Free: Hong Kong-origin goods are not products of China for Section 301 List 4A, and the 2026 Section 301 duty does not apply (note 52(b)). A Chinese-made work sold in Hong Kong is still a product of China and pays 7.5%.',
    'Japan': 'Free: Japan\'s 12.5% floor (9903.05.49) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the 15% all-in IEEPA rate until February 24, 2026.',
    'Brazil': 'Free: neither the 25% Brazil Section 301 duty (exempt under note 50(a)(ii), 9903.05.03) nor the 12.5% 2026 Section 301 duty (note 52(b)) applies. Brazilian antiques paid 50% under IEEPA until February 24, 2026.',
    'India': 'Free: the 10% 2026 Section 301 duty does not apply (note 52(b)). Indian antiquities and ethnological objects on the designated list need an Indian export certificate under the 2025 cultural property agreement.',
    'Russia': '35% in place of the Free column 2 rate (9903.90.08, U.S. note 30) on all 30 lines; the 2026 Section 301 duty on Russia does not apply (note 52(b)).',
    'Netherlands': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the EU IEEPA rate until February 24, 2026 and 10% Section 122 until July 23, 2026.',
    'Belgium': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the EU IEEPA rate until February 24, 2026 and 10% Section 122 until July 23, 2026.',
    'Spain': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the EU IEEPA rate until February 24, 2026 and 10% Section 122 until July 23, 2026.',
    'Austria': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86). Antiques paid the EU IEEPA rate until February 24, 2026 and 10% Section 122 until July 23, 2026.',
    'Sweden': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86).',
    'Denmark': 'Free: the EU\'s 10% floor (9903.05.39) does not apply to Chapter 97 (note 52(b), 9903.05.86).',
    'Australia': 'Free: no extra duty reaches Chapter 97 (note 52(b) exempts it from the 2026 Section 301 duty).',
    'South Korea': 'Free: Korea\'s 12.5% floor does not apply to Chapter 97 (note 52(b), 9903.05.86).',
    'Israel': 'Free: no extra duty reaches Chapter 97 (note 52(b) exempts it from the 2026 Section 301 duty).',
    'Singapore': 'Free: the 2026 Section 301 duty does not apply to Chapter 97 (note 52(b), 9903.05.86).',
    'Taiwan': 'Free: Taiwan\'s 10% floor does not apply to Chapter 97 (note 52(b), 9903.05.86).',
    'Thailand': 'Free: the 2026 Section 301 duty does not apply to Chapter 97 (note 52(b), 9903.05.86).',
    'Any other country': 'Free for every other country: the 2026 Section 301 duties exempt Chapter 97. Russia pays 35% (shown above); Nicaragua\'s separate Section 301 duty (9903.89.01) has no Chapter 97 exemption and rises from 0% to 10% on January 1, 2027 for non-CAFTA-DR goods. Cuba and North Korea are subject to embargoes.',
}
for c in ia['countries']:
    c['rule']['label'] = LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'][1] = 'Ranges like "Free · 50%" mean the group has lines with different totals; select a cell to see which lines carry which rate.'
ia['assumptions'] += [
    'Informational materials: the calculator shows the total with and without a 9903.05.92 (and, for Brazil, 9903.05.09) claim. For Chapter 97 both are Free, because note 52(b) exempts every line from the 2026 Section 301 duty and note 50(a)(ii) exempts it from the Brazil duty. China List 4A (9903.88.15), Canada Section 338 (9903.03.14) and Russia (9903.90.08) have no informational-materials exception.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied. Both excepted 9701–9705 as informational materials and charged antiques (9706).',
    'Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed, except to personal-use goods in accompanied baggage and to goods entered under Chapter 98 (with exceptions such as the 9802 repair and assembly provisions).',
    'No antidumping or countervailing duty order or Section 232 duty reaches Chapter 97. Cultural property, ivory and other entry rules decide whether a good may enter at all; they are on the Tariff engineering page.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III and the Section 232 notes in the 2026 Revision 21. All 19 Chapter 97 subheadings '
    'are on the note 52(b) general exemption list (9903.05.86) and the Brazil exemption list in note 50(a)(ii) (9903.05.03); 9701–9705 are also covered by the '
    'informational-materials headings 9903.05.92 and 9903.05.09. Note 20(s) puts every Chapter 97 subheading on China List 4A, and the List 4A exclusions '
    'for art and antiques in note 20(ddd) and (fff) are marked expired. Note 51(b)(3) puts 11 Chapter 97 subheadings (16 statistical lines) on the Canada '
    'Section 338 list. Note 30(b) lists all Chapter 97 subheadings for Russia\'s 35%. No Section 232 list and no note 52(j) country list names a Chapter 97 line.'
)
ia['lastCheckedAt'] = TODAY
add_sources(ia, ['eo-14389', 'procl-11012', 'csms-69326983', 'csms-69302472', 'cbp-ieepa-faq', 'usc-50-1702', 'procl-10420', 'pl-117-110', 'fr-2025-23316'])

# ---------------------------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------------------------
exec(open(f'{HERE}/fill97_te.py').read())

# ---------------------------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------------------------
exec(open(f'{HERE}/fill97_faq.py').read())
